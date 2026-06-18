# Installation Guide — Interview Pipeline Tracker

This guide is for anyone who just wants to install and use the app. No coding, no terminal, no developer tools required.

---

## System Requirements

| Requirement | Details |
|-------------|---------|
| OS | Windows 10 or Windows 11 (64-bit) |
| WebView2 Runtime | Already installed on any up-to-date Windows 10/11 machine (comes with Microsoft Edge) |

That's it. You do **not** need Node.js, Rust, or any developer tools.

---

## Step 1 — Download the Installer

Go to the [Releases](../../releases) page of this repository and download the latest installer:

- **`Interview Pipeline Tracker_x.x.x_x64-setup.exe`** — recommended (NSIS setup wizard)
- Or **`Interview Pipeline Tracker_x.x.x_x64_en-US.msi`** — alternative MSI package

Either one works. The `.exe` setup wizard is the easiest option.

---

## Step 2 — Run the Installer

1. Double-click the downloaded `.exe` file
2. If Windows shows a SmartScreen warning ("Windows protected your PC"), click **More info** → **Run anyway**
   > This appears because the app is not code-signed with a paid certificate. The app is safe to install.
3. Follow the on-screen steps (Next → Install → Finish)

---

## Step 3 — Launch the App

After installation completes, find **Interview Pipeline Tracker** in your **Start Menu** and launch it like any other app.

---

## Using the App

### Adding an Interview
1. Click **+ Add Interview** in the top-right corner
2. Fill in the company name, stage, date & time, and optionally a reminder offset and notes
3. Click **Save**

### Stages
| Stage | Meaning |
|-------|---------|
| Casual | Casual chat / カジュアル面談 |
| First | First-round interview |
| Second | Second-round interview |
| Final | Final-round interview |
| Offer | Offer received |
| Rejected | Application rejected |
| Closed | Manually closed / withdrawn |

### Views
- **List view** — sorted by upcoming date, with live countdown labels and stage badges
- **Calendar view** — month grid; click any day to see, add, or edit entries for that day

### Reminders
The app runs a background reminder engine. When `now >= scheduled_at − reminder_minutes_before`, a native Windows notification pops up. Make sure notifications are enabled for the app in **Windows Settings → System → Notifications**.

### Editing or Deleting
Click the **pencil icon** on any entry to edit, or the **trash icon** to delete.

### Past Entries
Interviews whose scheduled time has passed are automatically moved to a collapsible **Past Interviews** section at the bottom of the list.

---

## Uninstalling

Go to **Windows Settings → Apps → Installed Apps**, search for "Interview Pipeline Tracker", and click **Uninstall**.

Your interview data is stored in:
```
C:\Users\<YourName>\AppData\Local\dev.local.interview-pipeline-tracker\interviews.db
```
This file is **not** removed automatically on uninstall. Delete it manually if you want to remove all data.
