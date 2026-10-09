const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const source = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).find(s => s.includes('function init()')).split('// ===== START =====')[0];
function emitter(extra = {}) {
  const events = {};
  return { ...extra, addEventListener(name, fn) { events[name] = fn; }, emit(name) { if (events[name]) events[name](); } };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function setup(controller, waiting) {
  const nodes = new Map();
  const registration = emitter({ waiting, installing: null, update: async () => {} });
  const serviceWorker = emitter({ controller, register: async () => registration });
  const context = vm.createContext({
    document: emitter({ visibilityState: 'visible', getElementById(id) {
      if (!nodes.has(id)) {
        const classes = new Set(['hidden']);
        nodes.set(id, { textContent: '', value: '', disabled: false,
          classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) } });
      }
      return nodes.get(id);
    } }),
    navigator: { serviceWorker, onLine: true }, window: emitter(),
    location: { reload() { context.reloads++; } }, reloads: 0, messages: [], writes: [], failSave: false,
    setInterval: () => {}, setTimeout, clearTimeout, console,
  });
  vm.runInContext(source + `
    storageReady = true;
    state = { pool: [{ text: 'Custom date' }], archives: [{ photos: ['photo'] }], completedCount: 7, tempPhotos: [] };
    dbSet = async value => { if (failSave) throw new Error('Full'); writes.push(value); };
    setupAppUpdates();
  `, context);
  return { context, registration, serviceWorker };
}
(async () => {
  // No prompt for a first installation or an up-to-date app.
  for (const [controller, waiting] of [[null, {}], [{}, null]]) {
    const { context } = setup(controller, waiting);
    await settle();
    assert.ok(context.document.getElementById('updatePrompt').classList.contains('hidden'));
  }
  const worker = { postMessage(value) { messages.push(value); } };
  const messages = [];
  const { context, serviceWorker } = setup({}, worker);
  await settle();
  assert.equal(context.document.getElementById('updatePrompt').classList.contains('hidden'), false);
  await vm.runInContext('applyAppUpdate()', context);
  assert.equal(context.writes[0].completedCount, 7);
  assert.equal(context.writes[0].pool[0].text, 'Custom date');
  assert.equal(context.writes[0].archives[0].photos[0], 'photo');
  assert.equal(messages[0].type, 'SKIP_WAITING');
  assert.equal(context.reloads, 0, 'Wait for worker activation before reloading');
  serviceWorker.emit('controllerchange');
  serviceWorker.emit('controllerchange');
  assert.equal(context.reloads, 1);

  const failedMessages = [];
  const failed = setup({}, { postMessage: m => failedMessages.push(m) });
  await settle();
  failed.context.failSave = true;
  await vm.runInContext('applyAppUpdate()', failed.context);
  assert.equal(failedMessages.length, 0, 'Never activate an update if saving fails');
  assert.equal(failed.context.reloads, 0);
  assert.equal(failed.context.document.getElementById('updateButton').disabled, false);

  failed.context.failSave = false;
  vm.runInContext("state.tempPhotos = ['unsaved photo']", failed.context);
  failed.context.document.getElementById('photoModal').classList.remove('hidden');
  await vm.runInContext('applyAppUpdate()', failed.context);
  assert.equal(failedMessages.length, 0, 'Do not discard unsaved photos');

  const handlers = {};
  let activations = 0;
  const sw = vm.createContext({
    self: { addEventListener: (name, fn) => { handlers[name] = fn; }, skipWaiting: async () => { activations++; } },
    caches: { open: async () => ({ addAll: async () => {} }) },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8'), sw);
  let pending;
  const waitUntil = promise => { pending = promise; };
  handlers.install({ waitUntil });
  await pending;
  assert.equal(activations, 0, 'Installation waits for user acceptance');
  handlers.message({ data: { type: 'SKIP_WAITING' }, waitUntil });
  await pending;
  assert.equal(activations, 1);
  console.log('Update prompt checks passed');
})();
