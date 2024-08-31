use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::payment::{Item, Payment};

#[tokio::main]
pub async fn get_filtered_payments_query(
    category: String,
    time: String,
    page_index: u32,
    page_size: u32,
) -> Result<Vec<Payment>> {
    let db = database().await?;

    let time_condition = match time.as_str() {
        "today" => "time::day(created_at) == time::day(time::now())".to_string(),
        "yesterday" => "time::day(created_at) == time::day(time::now() - 1d)".to_string(),
        "month" => "time::month(created_at) == time::month(time::now())".to_string(),
        "last_month" => "IF time::month(time::now()) IS 1 THEN time::month(created_at) == 12 
            ELSE time::month(created_at) == time::month(time::now()) - 1 END"
            .to_string(),
        "all" => "true".to_string(),
        _ => return Err(anyhow::anyhow!("Invalid filter")),
    };

    let category = if category == "all" {
        "true".to_string()
    } else {
        format!("category = '{}'", category)
    };

    let start_record = page_index * page_size;

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
        WHERE pending = false AND {} AND {} ORDER BY created_at DESC LIMIT {} START {};
        "#,
        category, time_condition, page_size, start_record
    );

    let mut response: Response = db.query(&sql).await?;
    let mut payments: Vec<Payment> = response.take(0)?;

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
pub fn get_filtered_payments(
    category: String,
    time: String,
    page_index: u32,
    page_size: u32,
) -> Result<Vec<Payment>, String> {
    match get_filtered_payments_query(category, time, page_index, page_size) {
        Ok(visits) => Ok(visits),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
