use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;

use crate::connect::database;

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePaymentData {
    pub payment_type: String,
    pub name: String,
    pub category: String,
    pub amount: f64,
    pub visit_id: String,
}

#[tokio::main]
pub async fn update_payment_query(data: UpdatePaymentData) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "DELETE payment WHERE visit = {} AND pending = true",
        &data.visit_id
    );
    let _response: Response = db.query(sql).await?;

    let sql = format!(
        "CREATE payment SET 
            payment_type = '{}', 
            name = '{}', 
            category = '{}', 
            amount = {}, 
            visit = '{}', 
            pending = false, 
            created_at = time::now();",
        &data.payment_type, &data.name, &data.category, &data.amount, &data.visit_id,
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_payment(data: UpdatePaymentData) {
    let _res = update_payment_query(data);
}
