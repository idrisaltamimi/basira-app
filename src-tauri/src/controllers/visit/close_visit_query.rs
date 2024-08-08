use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn close_visit_query(visit_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!("UPDATE visit SET is_open = false WHERE id = '{}'", visit_id);
    let _response: Response = db.query(sql).await?;
    Ok(())
}

#[tauri::command]
pub fn close_visit(visit_id: String) -> Result<(), String> {
    match close_visit_query(visit_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
