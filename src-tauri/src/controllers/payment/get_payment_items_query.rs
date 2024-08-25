use crate::connect::database;
use crate::structs::payment::PaymentItem;
use anyhow::Result;
use surrealdb::Response;

#[tokio::main]
pub async fn get_payment_items_query(payment_id: String) -> Result<Vec<PaymentItem>> {
    let db = database().await?;

    let sql = format!(
        "SELECT * FROM payment_item WHERE payment = '{}';",
        payment_id
    );
    let mut response: Response = db.query(&sql).await?;
    let payment_items: Vec<PaymentItem> = response.take(0)?;

    Ok(payment_items)
}

#[tauri::command]
pub fn get_payment_items(payment_id: String) -> Result<Vec<PaymentItem>, String> {
    match get_payment_items_query(payment_id) {
        Ok(items) => Ok(items),
        Err(err) => Err(err.to_string()),
    }
}
