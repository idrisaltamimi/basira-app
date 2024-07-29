use anyhow::Result;
use surrealdb::Response;

use crate::{
    connect::database,
    structs::payment::CreatePaymentData,
};

#[tokio::main]
pub async fn create_payments_query(data: CreatePaymentData) -> Result<()> {
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
        &data.visit_id
    );
    let _response: Response = db
        .query(&sql)
        .bind(("payment_type", &data.payment_type))
        .bind(("name", &data.name))
        .bind(("category", "products".to_string()))
        .bind(("amount", &data.amount))
        .bind(("payment_method", &data.payment_method))
        .bind(("pending", &data.pending))
        .await?;

    Ok(())
}

#[tauri::command]
pub fn create_products_payments(data: CreatePaymentData) {
    let _res = create_payments_query(data);
}
