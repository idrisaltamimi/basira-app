use crate::connect::database;
use crate::structs::payment::{CreatePaymentData, OriginalPayment};
use anyhow::Result;
use surrealdb::Response;

pub async fn create_payment_query(data: CreatePaymentData) -> Result<Option<OriginalPayment>> {
    let db = database().await?;

    let sql = format!(
        "CREATE payment SET 
            payment_type = $payment_type, 
            name = $name, 
            category = $category, 
            amount = $amount, 
            payment_method = $payment_method, 
            pending = $pending, 
            created_at = time::now(),
            visit = {};",
        data.visit_id
    );

    // Execute the SQL query
    let mut response: Response = db
        .query(sql)
        .bind(("payment_type", data.payment_type))
        .bind(("name", data.name))
        .bind(("category", data.category))
        .bind(("amount", data.amount))
        .bind(("payment_method", data.payment_method))
        .bind(("pending", data.pending))
        .await?;

    let new_payment: Option<OriginalPayment> = response.take(0)?;

    Ok(new_payment)
}

#[tokio::main]
async fn create_query(data: CreatePaymentData) -> Result<Option<OriginalPayment>> {
    let new_payment = create_payment_query(data).await?;

    Ok(new_payment)
}

#[tauri::command]
pub fn create_payment(data: CreatePaymentData) -> Result<Option<OriginalPayment>, String> {
    match create_query(data) {
        Ok(new_payment) => Ok(new_payment),
        Err(err) => Err(err.to_string()),
    }
}
