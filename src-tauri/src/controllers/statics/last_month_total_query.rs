use anyhow::Result;
use surrealdb::Response;

use crate::{connect::database, structs::statics::LastMonthTotal, utils::get_current_month_range};

#[tokio::main]
pub async fn last_month_total_query(payment_type: String) -> Result<Vec<LastMonthTotal>> {
    let db = database().await?;

    let (start_last_month, end_last_month) = get_current_month_range();
    let sql = format!(
        "SELECT amount FROM payment 
            WHERE pending = false 
            AND payment_type = '{}'
            AND created_at >= '{}' 
            AND created_at <= '{}'",
        payment_type, start_last_month, end_last_month
    );

    let mut response: Response = db.query(sql).await?;
    let res: Vec<LastMonthTotal> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn last_month_total(payment_type: String) -> Result<Vec<LastMonthTotal>, String> {
    match last_month_total_query(payment_type) {
        Ok(payments) => Ok(payments),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
