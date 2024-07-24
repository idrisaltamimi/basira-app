use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

use crate::structs::visitor::Visitor;

#[tokio::main]
pub async fn get_visitors_query(phone: u32) -> Result<Vec<Visitor>> {
    let db = database().await?;

    let sql = "SELECT * FROM visitor WHERE phone = $phone";
    let mut response: Response = db.query(sql).bind(("phone", phone)).await?;
    let visitor: Vec<Visitor> = response.take(0)?;

    Ok(visitor)
}

#[tauri::command]
pub fn get_visitors(number: u32) -> Result<Vec<Visitor>, String> {
    match get_visitors_query(number) {
        Ok(visitor) => Ok(visitor),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
