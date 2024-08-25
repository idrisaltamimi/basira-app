use crate::connect::database;
use crate::structs::payment::CreatePaymentItem;
use anyhow::{Context, Result};
use surrealdb::Response;

#[tokio::main]
pub async fn create_payment_item_query(
    items: Vec<CreatePaymentItem>,
    payment_id: String,
    visit_id: String,
) -> Result<()> {
    let db = database().await?;

    let mut created_items = Vec::new();

    for item in items {
        let sql = format!(
            "CREATE payment_item SET
                name = '{}',
                amount = {},
                payment = '{}',
                visit = '{}';",
            item.name, item.amount, payment_id, visit_id
        );

        let response: Response = db
            .query(sql)
            .await
            .context("Failed to create payment item")?;

        // If successful, keep track of the created item
        created_items.push(response);
    }

    Ok(())
}

#[tauri::command]
pub fn create_payment_item(
    items: Vec<CreatePaymentItem>,
    payment_id: String,
    visit_id: String,
) -> Result<(), String> {
    match create_payment_item_query(items.clone(), payment_id.clone(), visit_id.clone()) {
        Ok(()) => Ok(()),
        Err(err) => {
            // On error, attempt to delete all created payment items related to the payment
            if let Err(delete_err) = delete_payment_items(payment_id.clone()) {
                // Log the error if deletion fails
                eprintln!("Failed to delete payment items: {}", delete_err);
            }
            Err(err.to_string())
        }
    }
}

#[tokio::main]
async fn delete_payment_items(payment_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!("DELETE payment_item WHERE payment = '{}';", payment_id);

    let _response: Response = db
        .query(sql)
        .await
        .context("Failed to delete payment items")?;

    Ok(())
}
