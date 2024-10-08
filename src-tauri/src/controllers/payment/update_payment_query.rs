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
    pub payment_method: String,
    pub visit_id: String,
}

#[tokio::main]
pub async fn update_payment_query(data: UpdatePaymentData) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "UPDATE payment SET 
            payment_type = '{}', 
            name = '{}', 
            category = '{}', 
            amount = {}, 
            payment_method = '{}', 
            pending = false, 
            created_at = time::now()
        WHERE visit = {};",
        data.payment_type,
        data.name,
        data.category,
        data.amount,
        data.payment_method,
        data.visit_id,
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_payment(data: UpdatePaymentData) -> Result<(), String> {
    match update_payment_query(data) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
