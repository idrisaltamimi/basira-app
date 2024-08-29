use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn delete_payment_query(payment_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!("DELETE payment WHERE id = {}", payment_id);
    let _response: Response = db.query(sql).await?;
    let sql = format!("DELETE payment_item WHERE payment = {}", payment_id);
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn delete_payment(payment_id: String) -> Result<(), String> {
    match delete_payment_query(payment_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
