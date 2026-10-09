# 🌸 Tokyo Date Ideas (Date Randomizer)

💕 A little web app for picking your next date, checking it off, and keeping the memories — with Tokyo-inspired ideas, photos, and a growing collection of hearts.

👉 **[Open Tokyo Date Ideas](https://xolossus.github.io/date-randomizer/)**

---

## 🚀 Features

- 🎲 Draw a random date idea when you can't decide what to do.
- 📝 Add your own ideas and remove dates from your pool.
- ✅ Complete a date from the draw screen or directly from the list.
- 🏛️ Keep completed dates in your archives, with dates and photos.
- 💕 Collect a heart for each completed date.
- 📱 Install it on your phone's home screen and open it like an app.
- 📴 Use the cached app offline after an initial online visit.
- 💾 Download and restore backups of your list, archives, photos, and hearts.
- 🔄 Get an update prompt only when a newer version is ready.

---

## 🧩 Requirements

A modern browser with JavaScript and browser storage enabled. No account or sign-in required.

Connect to the internet for your first visit and to download updates.

---

## ⚙️ Installation

### 🤖 Android — Chrome

1. Open **[Tokyo Date Ideas](https://xolossus.github.io/date-randomizer/)** directly in Chrome.
2. Tap **⋮** to open the menu.
3. Select **Add to Home screen** or **Install app**.
4. Confirm, then launch it from your new app icon. ✅

If Chrome says the app is already installed, use your existing icon. You don't need to install it again for updates.

### 🍎 iPhone — Safari

1. Open **[Tokyo Date Ideas](https://xolossus.github.io/date-randomizer/)** in Safari.
2. Tap **Share → Add to Home Screen**.
3. Leave **Open as Web App** enabled if shown, then tap **Add**.
4. Launch it from your home screen. ✅

### 🖥️ Desktop

Open the app link in your browser and start drawing dates. Installation is optional.

---

## 🎲 How to Use

1. Tap **DRAW A DATE** to pick an idea from your pool.
2. Tap **Skip** to return it to the pool, or **Did It!** after completing it.
3. Add photos if you'd like, or skip that step.
4. Open **Archives** to revisit your completed dates and memories.

Prefer choosing a date yourself? Open **List**, tap an idea, and select **Did It!**. Your pool count and hearts update immediately.

---

## 🔄 Updates

The app checks for updates while it's open and online.

When a newer version has downloaded, an **Update available** prompt appears. Tap **Update now** to save your current dates and reload into the new version. Finish any photo edits before updating.

Your list, archives, photos, and hearts stay in the same browser storage. No reinstall or new shortcut needed.

The current version is shown at the bottom of the homepage.

---

## 💾 Backups & Saved Data

Your dates are saved **on your device**, in your browser's IndexedDB database. They aren't uploaded to GitHub or automatically synced between phones and browsers.

### 📥 Create a backup

1. Tap **Backup & restore** at the bottom of the homepage.
2. Tap **Download backup**.
3. Keep the JSON file somewhere safe outside the app.

### 📤 Restore a backup

Open **Backup & restore** and select your JSON file under **Restore a backup file**. Restoring replaces your current list, archives, photos, and heart count with the backup's contents.

---

## 🧠 How It Works

- **HTML, CSS, and JavaScript** power the app without a build step.
- **IndexedDB** stores your date pool, completed dates, photos, and heart count.
- A **service worker** caches app files for offline use and handles update prompts.
- A **web app manifest** lets you add the app to your home screen.
- **GitHub Pages** hosts the app.

---

## ⚠️ Notes

- **Clearing cookies/site data or app storage can delete your saved dates.** Download a backup first.
- Changing devices or browsers won't automatically transfer your memories. Use a backup to move them.
- Offline appearance depends on which fonts and styles your browser has already cached.
- If a save fails, the app shows a warning. Download a backup before closing it.

---

## 👤 Author

[xolossus](https://github.com/xolossus)

Made for more dates, fewer decisions, and memories worth keeping. 🌸
