use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;

use crate::connect::database;
use crate::structs::payment::Payment;

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
    let payments: Vec<Payment> = response.take(0)?;

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
