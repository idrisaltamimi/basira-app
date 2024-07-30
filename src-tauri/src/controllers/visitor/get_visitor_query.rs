use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

use crate::structs::visitor::Visitor;

#[tokio::main]
pub async fn get_visitor_query(id: String) -> Result<Option<Visitor>> {
    let db = database().await?;

    let sql = format!("SELECT * FROM visitor WHERE id = '{}'", id);

    let mut response: Response = db.query(sql).await?;
    let visitor: Option<Visitor> = response.take(0)?;

    Ok(visitor)
}

#[tauri::command]
pub fn get_visitor(id: String) -> Result<Option<Visitor>, String> {
    match get_visitor_query(id) {
        Ok(visitor) => Ok(visitor),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
