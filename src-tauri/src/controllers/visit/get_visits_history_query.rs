use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::LastVisitsHistory;

#[tokio::main]
pub async fn get_visits_history_query(visitor_id: String) -> Result<Vec<LastVisitsHistory>> {
    let db = database().await?;

    let sql = format!(
        "SELECT id, created_at
        FROM visit 
        WHERE visitor = '{}' AND is_open = false
        ORDER BY created_at DESC;",
        visitor_id
    );

    let mut response: Response = db.query(sql).await?;
    let visit: Vec<LastVisitsHistory> = response.take(0)?;

    Ok(visit)
}

#[tauri::command]
pub fn get_visits_history(visitor_id: String) -> Result<Vec<LastVisitsHistory>, String> {
    match get_visits_history_query(visitor_id) {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
