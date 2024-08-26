use anyhow::Result;
use surrealdb::Response;

use crate::{connect::database, structs::payment::PaymentItem};

#[tokio::main]
pub async fn delete_payment_item_query(payment_id: String, payment_item_id: String) -> Result<()> {
    let db = database().await?;

    // Select the payment item
    let payment_item_sql = format!(
        "SELECT * FROM payment_item WHERE id = '{}'",
        payment_item_id
    );
    let mut payment_item_response: Response = db.query(payment_item_sql).await?;
    let result: Option<PaymentItem> = payment_item_response.take(0)?;

    // Check if the payment item exists before deleting
    if let Some(payment_item) = result {
        // Delete the payment item
        let delete_sql = format!("DELETE FROM payment_item WHERE id = '{}'", payment_item_id);
        let _response: Response = db.query(delete_sql).await?;

        // If the payment item is not "فتح زيارة" or "تكلفة العلاج", update the product quantity
        if payment_item.name != "فتح زيارة".to_string()
            && payment_item.name != "تكلفة العلاج".to_string()
        {
            let product_sql = format!(
                "UPDATE product SET quantity += 1, status = true WHERE product_name = '{}'",
                payment_item.name
            );
            let _product_response: Response = db.query(product_sql).await?;
        } else if payment_item.name == "تكلفة العلاج".to_string() {
            let visit_sql = format!(
                "UPDATE visit SET treatment_cost = 0 WHERE id = visit:{}",
                payment_item.visit.id
            );
            let _visit_response: Response = db.query(visit_sql).await?;
        }

        // Check if there are any other items linked to the payment
        let payment_items_sql = format!(
            "SELECT * FROM payment_item WHERE payment = '{}'",
            payment_id
        );
        let mut payment_items_response: Response = db.query(payment_items_sql).await?;
        let items: Vec<PaymentItem> = payment_items_response.take(0)?;

        // If there are no more payment items linked to the payment, delete the payment
        if items.is_empty() {
            let delete_payment_sql = format!(
                "DELETE FROM payment WHERE id = '{}' AND pending = true",
                payment_id
            );
            let _response: Response = db.query(delete_payment_sql).await?;
        }
    } else {
        return Err(anyhow::anyhow!("Payment item not found"));
    }

    Ok(())
}

#[tauri::command]
pub fn delete_payment_item(payment_id: String, payment_item_id: String) -> Result<(), String> {
    match delete_payment_item_query(payment_id, payment_item_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
