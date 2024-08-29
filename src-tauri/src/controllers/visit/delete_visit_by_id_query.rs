use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn delete_visit_by_id_query(visit_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!("DELETE visit WHERE id = '{}'", visit_id);
    let _response: Response = db.query(sql).await?;
    let sql = format!("DELETE image WHERE visit = '{}'", visit_id);
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn delete_visit_by_id(visit_id: String) -> Result<(), String> {
    match delete_visit_by_id_query(visit_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
