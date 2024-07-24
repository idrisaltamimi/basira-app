use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::payment::CreatePaymentData;

pub async fn create_payment_query(data: CreatePaymentData) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "CREATE payment SET 
            payment_type = $payment_type, 
            name = $name, 
            category = $category, 
            amount = $amount, 
            pending = $pending, 
            created_at = time::now(),
            visit = {};",
        data.visit_id
    );
    let _response: Response = db
        .query(sql)
        .bind(("payment_type", data.payment_type))
        .bind(("name", data.name))
        .bind(("category", data.category))
        .bind(("amount", data.amount))
        .bind(("pending", data.pending))
        .await?;

    Ok(())
}

#[tokio::main]
async fn create_query(data: CreatePaymentData) -> Result<()> {
    let _res = create_payment_query(data).await?;

    Ok(())
}

#[tauri::command]
pub fn create_payment(data: CreatePaymentData) {
    let _res = create_query(data);
}
