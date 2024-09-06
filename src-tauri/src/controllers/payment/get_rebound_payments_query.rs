use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;

use crate::connect::database;
use crate::structs::payment::{Item, Payment};

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymentCount {
    count: u32,
}

#[tokio::main]
pub async fn get_rebound_payments_query(category: String) -> Result<Vec<Payment>> {
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
                ELSE '' END AS visitor_phone
        FROM payment
        WHERE pending = false AND time::floor(created_at, 1d) == time::floor(time::now(), 1d) AND category = '{}' ORDER BY created_at DESC LIMIT 1
        "#,
        category
    );

    let mut response: Response = db.query(sql).await?;
    let mut payments: Vec<Payment> = response.take(0)?;

    // Fetch payment items for each payment, calculate the total amount, and update the payment
    for payment in &mut payments {
        let payment_items_sql = format!(
            "SELECT id, name, amount, payment FROM payment_item WHERE payment = payment:{};",
            payment.id.id
        );
        let mut payment_items_response: Response = db.query(&payment_items_sql).await?;
        let payment_items: Vec<Item> = payment_items_response.take(0)?;

        // Only calculate the total amount and update payment if payment_items is not empty
        if !payment_items.is_empty() {
            let total_amount: f64 = payment_items.iter().map(|item| item.amount).sum();

            // Update the payment's amount field
            payment.amount = total_amount;
            payment.payment_items = Some(payment_items);

            // Update the payment record in the database with the new total amount
            let update_payment_sql = format!(
                "UPDATE payment SET amount = {} WHERE id = payment:{};",
                total_amount, payment.id.id
            );
            db.query(&update_payment_sql).await?;
        } else {
            payment.payment_items = Some(payment_items); // Still attach the empty items array
        }
    }

    Ok(payments)
}

#[tauri::command]
pub fn get_rebound_payments(category: String) -> Result<Vec<Payment>, String> {
    match get_rebound_payments_query(category) {
        Ok(payments) => Ok(payments),
        Err(err) => Err(err.to_string()),
    }
}
