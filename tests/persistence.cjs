const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const source = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1]).find(script => script.includes('function init()'))
  .split('// ===== START =====')[0];
const saved = { pool: [{ text: 'My custom date' }], archives: [{ photos: ['photo'], idea: { text: 'Completed' } }], completedCount: 17 };
function setup(read, legacy = null) {
  const nodes = new Map();
  const context = vm.createContext({
    document: { getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { textContent: '', value: '', classList: { add() {}, remove() {} } });
      return nodes.get(id);
    } },
    navigator: {}, localStorage: { getItem: () => legacy },
    console, setTimeout, clearTimeout, alert: () => {},
    read, writes: [], failWrite: false,
  });
  vm.runInContext(source + `
    dbGet = async () => read();
    dbSet = async value => { if (failWrite) throw new Error('Storage full'); writes.push(value); };
    finishInit = () => {};
    updateUI = () => {};
    globalThis.getState = () => state;
  `, context);
  return context;
}
const settle = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  const existing = setup(() => saved);
  vm.runInContext('init()', existing);
  await settle();
  assert.equal(existing.getState(), saved, 'Preserve existing list, archives, photos, and hearts exactly');
  assert.equal(existing.writes.length, 0, 'Loading an update must not rewrite saved data');
  vm.runInContext('saveState()', existing);
  await settle();
  assert.deepEqual(JSON.parse(JSON.stringify(existing.writes[0])), saved);

  for (const read of [() => { throw new Error('Read failed'); }, () => ({ pool: [], archives: [] })]) {
    const broken = setup(read);
    vm.runInContext('init()', broken);
    await settle();
    vm.runInContext('saveState()', broken);
    assert.equal(broken.writes.length, 0, 'Failed or invalid reads must never overwrite storage');
    assert.match(broken.document.getElementById('storageErrorText').textContent, /Nothing has been reset/);
  }

  const legacy = setup(() => null, JSON.stringify(saved));
  vm.runInContext('init()', legacy);
  await settle();
  assert.deepEqual(JSON.parse(JSON.stringify(legacy.getState())), saved, 'Preserve legacy data');

  const fresh = setup(() => null);
  vm.runInContext('init()', fresh);
  await settle();
  assert.ok(fresh.getState().pool.length > 0);
  assert.equal(fresh.writes.length, 0, 'Defaults must not be written during initialization');

  existing.failWrite = true;
  existing.document.getElementById('dataImportArea').value = JSON.stringify({ pool: [], archives: [], completedCount: 0 });
  await vm.runInContext('importData()', existing);
  assert.equal(existing.getState(), saved, 'Failed restore must preserve current data');
  vm.runInContext('saveState()', existing);
  await settle();
  assert.match(existing.document.getElementById('saveStatus').textContent, /Could not save/);
  console.log('Persistence checks passed');
})();
