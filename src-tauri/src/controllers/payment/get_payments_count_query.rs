use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;

use crate::connect::database;

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymentCount {
    count: u32,
}

#[tokio::main]
pub async fn get_payments_count_query() -> Result<Option<PaymentCount>> {
    let db = database().await?;

    let sql = "SELECT count() FROM payment WHERE pending = false GROUP BY count";
    let mut response: Response = db.query(sql).await?;
    let payments_count: Option<PaymentCount> = response.take(0)?;

    Ok(payments_count)
}

#[tauri::command]
pub fn get_payments_count() -> Result<Option<PaymentCount>, String> {
    match get_payments_count_query() {
        Ok(count) => Ok(count),
        Err(err) => Err(err.to_string()),
    }
}
