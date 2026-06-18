mod reminder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations(
          "sqlite:interviews.db",
          vec![tauri_plugin_sql::Migration {
            version: 1,
            description: "initial schema",
            sql: include_str!("../migrations/0001_initial.sql"),
            kind: tauri_plugin_sql::MigrationKind::Up,
          }],
        )
        .build(),
    )
    .plugin(tauri_plugin_notification::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      // Start background reminder polling after the DB is ready
      reminder::start(app.handle().clone());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
