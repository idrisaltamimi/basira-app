use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::payment::Payment;

#[tokio::main]
pub async fn get_payments_query() -> Result<Vec<Payment>> {
    let db = database().await?;

    let sql = format!(
        r#"
        SELECT
            id,
            payment_type,
            name,
            category,
            amount,
            payment_method,
            created_at,
            IF visit IS NONE THEN 'visit:buyer' ELSE visit END AS visit_id,
            IF visit.visitor.name IS NOT NONE THEN visit.visitor.name
                ELSE IF visit.name IS NOT NONE THEN visit.name
                ELSE '' END AS visitor_name,
            IF visit.visitor.phone IS NOT NONE THEN <string> visit.visitor.phone
                ELSE IF visit.phone IS NOT NONE THEN <string> visit.phone
                ELSE '' END AS visitor_phone,
            (SELECT id, name, amount, payment FROM payment_item WHERE payment = $parent.id) AS payment_items
        FROM payment
        WHERE pending = true
        "#
    );

    let mut response: Response = db.query(sql).await?;
    let payments: Vec<Payment> = response.take(0)?;

    Ok(payments)
}

#[tauri::command]
pub fn get_payments() -> Result<Vec<Payment>, String> {
    match get_payments_query() {
        Ok(payments) => Ok(payments),
        Err(err) => Err(err.to_string()),
    }
}
