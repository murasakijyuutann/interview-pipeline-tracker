use chrono::{DateTime, Utc};
use tauri::{AppHandle, Manager};
use tauri_plugin_notification::NotificationExt;

#[derive(Debug, serde::Deserialize)]
struct InterviewRow {
    id: i64,
    company: String,
    stage: String,
    scheduled_at: String,
    reminder_minutes_before: i64,
}

/// Spawn a background thread that polls the DB every 60 seconds and fires
/// a native OS notification once per interview when within its reminder window.
pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        loop {
            if let Err(e) = check_reminders(&app) {
                log::error!("reminder check failed: {e}");
            }
            std::thread::sleep(std::time::Duration::from_secs(60));
        }
    });
}

fn check_reminders(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Resolve the app-local SQLite DB path
    let app_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("cannot resolve app data dir: {e}"))?;

    let db_path = app_dir.join("interviews.db");
    let conn = rusqlite::Connection::open(&db_path)?;

    let now: DateTime<Utc> = Utc::now();
    let now_ts = now.timestamp();

    let mut stmt = conn.prepare(
        "SELECT id, company, stage, scheduled_at, reminder_minutes_before
         FROM interviews
         WHERE reminder_fired = 0
           AND scheduled_at > datetime('now')",
    )?;

    let rows: Vec<InterviewRow> = stmt
        .query_map([], |row| {
            Ok(InterviewRow {
                id: row.get(0)?,
                company: row.get(1)?,
                stage: row.get(2)?,
                scheduled_at: row.get(3)?,
                reminder_minutes_before: row.get(4)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    for interview in rows {
        let Ok(scheduled) = DateTime::parse_from_rfc3339(&interview.scheduled_at) else {
            continue;
        };
        let scheduled_ts = scheduled.timestamp();
        let remind_at_ts = scheduled_ts - (interview.reminder_minutes_before * 60);

        if now_ts >= remind_at_ts {
            fire_notification(app, &interview)?;
            conn.execute(
                "UPDATE interviews SET reminder_fired = 1, updated_at = datetime('now') WHERE id = ?1",
                rusqlite::params![interview.id],
            )?;
        }
    }

    Ok(())
}

fn fire_notification(
    app: &AppHandle,
    interview: &InterviewRow,
) -> Result<(), Box<dyn std::error::Error>> {
    let title = format!("Upcoming: {} ({})", interview.company, interview.stage);
    let body = format!("Scheduled at {}", interview.scheduled_at);

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()?;

    log::info!("reminder fired for interview id={}", interview.id);
    Ok(())
}
