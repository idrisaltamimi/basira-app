use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn delete_payment_item_query(
    payment_id: String,
    visit_id: String,
    payment_item_id: String,
    payment_item_name: String,
) -> Result<()> {
    let db = database().await?;

    let delete_sql = format!("DELETE payment_item WHERE id = '{}'", payment_item_id);
    let _response: Response = db.query(delete_sql).await?;

    // If the payment item is not "فتح زيارة" or "تكلفة العلاج", update the product quantity
    if payment_item_name != "فتح زيارة".to_string()
        && payment_item_name != "تكلفة العلاج".to_string()
    {
        let product_sql = format!(
            "UPDATE product SET 
                    quantity += 1, 
                    sales = IF sales > 0 THEN sales - 1 ELSE 0 END, status = true 
            WHERE product_name = '{}'",
            payment_item_name
        );
        let _product_response: Response = db.query(product_sql).await?;
    } else if payment_item_name == "تكلفة العلاج".to_string() {
        let visit_sql = format!(
            "UPDATE visit SET treatment_cost = 0 WHERE id = '{}'",
            visit_id
        );
        let _visit_response: Response = db.query(visit_sql).await?;
    }

    // If there are no more payment items linked to the payment, delete the payment
    let delete_payment_sql = format!(
            "DELETE payment WHERE id = '{}' AND array::len((SELECT id FROM payment_item WHERE payment = $parent.id)) == 0",
            payment_id
        );
    let _response: Response = db.query(delete_payment_sql).await?;

    Ok(())
}

#[tauri::command]
pub fn delete_payment_item(
    payment_id: String,
    visit_id: String,
    payment_item_id: String,
    payment_item_name: String,
) -> Result<(), String> {
    match delete_payment_item_query(payment_id, visit_id, payment_item_id, payment_item_name) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
