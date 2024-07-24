use anyhow::Result;
use surrealdb::Response;

use crate::{
    connect::database, structs::statics::LastMonthPayment, utils::get_current_month_range,
};

#[tokio::main]
pub async fn last_month_payments_query() -> Result<Vec<LastMonthPayment>> {
    let db = database().await?;

    let (start_last_month, end_last_month) = get_current_month_range();

    let sql = format!(
        "SELECT 
            id,
            name,
            amount
        FROM payment 
        WHERE 
            pending = false 
            AND payment_type = 'payment'
            AND created_at >= '{}' 
            AND created_at <= '{}'",
        start_last_month, end_last_month
    );

    let mut response: Response = db.query(sql).await?;
    let res: Vec<LastMonthPayment> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn last_month_payments() -> Result<Vec<LastMonthPayment>, String> {
    match last_month_payments_query() {
        Ok(payments) => Ok(payments),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
