use anyhow::Result;
use surrealdb::Response;

use crate::{
    connect::database,
    structs::payment::{CreatePaymentData, OriginalPayment},
};

#[tokio::main]
pub async fn create_payments_query(data: CreatePaymentData) -> Result<Option<OriginalPayment>> {
    let db = database().await?;

    // Check for an existing payment
    let check_sql = format!("SELECT * FROM payment WHERE visit = {};", &data.visit_id);
    let mut payment_response: Response = db.query(&check_sql).await?;
    let existing_payment: Option<OriginalPayment> = payment_response.take(0)?;

    if let Some(payment) = existing_payment {
        return Ok(Some(payment));
    }

    // Create a new payment if no existing payment is found
    let create_sql = format!(
        "CREATE payment SET 
            payment_type = $payment_type, 
            name = $name, 
            category = $category, 
            amount = $amount, 
            payment_method = $payment_method, 
            pending = $pending, 
            created_at = time::now(),
            visit = {};",
        &data.visit_id
    );
    let mut response: Response = db
        .query(&create_sql)
        .bind(("payment_type", &data.payment_type))
        .bind(("name", &data.name))
        .bind(("category", "products".to_string()))
        .bind(("amount", &data.amount))
        .bind(("payment_method", &data.payment_method))
        .bind(("pending", &data.pending))
        .await?;
    let new_payment: Option<OriginalPayment> = response.take(0)?;

    Ok(new_payment)
}

#[tauri::command]
pub fn create_products_payments(
    data: CreatePaymentData,
) -> Result<Option<OriginalPayment>, String> {
    match create_payments_query(data) {
        Ok(products) => Ok(products),
        Err(err) => Err(err.to_string()),
    }
}
