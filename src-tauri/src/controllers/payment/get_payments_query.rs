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
pub async fn get_payments_query(
    pending: bool,
    page_index: Option<u32>,
    page_size: Option<u32>,
    category: Option<String>,
) -> Result<Vec<Payment>> {
    let db = database().await?;

    let mut sql = format!(
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
        WHERE pending = {}
        "#,
        pending
    );

    // Only add pagination if both page_index and page_size are provided
    if let (Some(index), Some(size)) = (page_index, page_size) {
        let start_record = index * size;
        if let Some(category) = category {
            sql += &format!(
                " AND category = '{}' ORDER BY created_at DESC LIMIT {} START {}",
                category, size, start_record
            );
        } else {
            sql += &format!(
                " ORDER BY created_at DESC LIMIT {} START {}",
                size, start_record
            );
        }
    } else {
        if let Some(category) = category {
            sql += &format!(" AND category = '{}' ORDER BY created_at DESC", category);
        } else {
            sql += " ORDER BY created_at DESC";
        }
    }

    let mut response: Response = db.query(&sql).await?;
    let mut payments: Vec<Payment> = response.take(0)?;

    // Fetch payment items for each payment, calculate the total amount, and update the payment
    for payment in &mut payments {
        let payment_items_sql = format!(
            "SELECT id, name, amount, payment FROM payment_item WHERE payment = payment:{};",
            payment.id.id
        );
        let mut payment_items_response: Response = db.query(&payment_items_sql).await?;
        let payment_items: Vec<Item> = payment_items_response.take(0)?;

        // Calculate the total amount from payment_items
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
    }

    Ok(payments)
}

#[tauri::command]
pub fn get_payments(
    pending: bool,
    page_index: Option<u32>,
    page_size: Option<u32>,
    category: Option<String>,
) -> Result<Vec<Payment>, String> {
    match get_payments_query(pending, page_index, page_size, category) {
        Ok(payments) => Ok(payments),
        Err(err) => Err(err.to_string()),
    }
}
