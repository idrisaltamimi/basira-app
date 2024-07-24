use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::Visits;

#[tokio::main]
pub async fn get_visits_query() -> Result<Vec<Visits>> {
    let db = database().await?;

    let sql = "SELECT 
            created_at, 
            id, 
            visitor.name AS visitor_name, 
            visitor.birthdate AS visitor_birthdate, 
            visitor.phone AS visitor_phone, 
            visitor.id  AS visitor_id,
            visitor.file_number AS visitor_file_number
        FROM visit WHERE is_open = true";
    let mut response: Response = db.query(sql).await?;
    let res: Vec<Visits> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn get_visits() -> Result<Vec<Visits>, String> {
    match get_visits_query() {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
