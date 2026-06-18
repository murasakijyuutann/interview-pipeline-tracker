import Database from "@tauri-apps/plugin-sql";

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!_db) {
    try {
      _db = await Database.load("sqlite:interviews.db");
      console.log("[getDb] DB loaded successfully");
    } catch (e) {
      console.error("[getDb] Failed to load DB:", e);
      throw e;
    }
  }
  return _db;
}
