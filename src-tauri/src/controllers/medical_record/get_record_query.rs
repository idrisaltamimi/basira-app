use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::medical_record::Record;

#[tokio::main]
pub async fn get_record_query(visitor_id: String) -> Result<Option<Record>> {
    let db = database().await?;
    let sql = format!("SELECT * FROM record WHERE visitor = {}", visitor_id);
    let mut response: Response = db.query(sql).await?;
    let res: Option<Record> = response.take(0)?;
    Ok(res)
}

#[tauri::command]
pub fn get_record(visitor_id: String) -> Result<Option<Record>, String> {
    match get_record_query(visitor_id) {
        Ok(record) => Ok(record),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
