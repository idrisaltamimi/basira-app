use crate::connect::database;
use crate::structs::payment::{CreatePaymentData, NewPaymentData};
use anyhow::Result;
use surrealdb::Response;

pub async fn create_payment_query(data: CreatePaymentData) -> Result<()> {
    let db = database().await?;

    // Check if there's an existing payment with the specified criteria
    let check_sql = format!(
        "SELECT * FROM payment WHERE visit = {} AND pending = true AND name = 'treatment_cost';",
        data.visit_id
    );

    let mut response: Response = db.query(check_sql).await?;

    let existing_payment: Vec<NewPaymentData> = response.take(0)?;

    // Construct the SQL string conditionally
    let sql = if existing_payment.len() > 0 {
        let payment_id = &existing_payment[0].id.id;
        format!(
            "UPDATE payment SET 
                payment_type = $payment_type, 
                name = $name, 
                category = $category, 
                amount = $amount, 
                payment_method = $payment_method, 
                pending = $pending,
                created_at = time::now()
            WHERE id = payment:{};",
            payment_id.to_string()
        )
    } else {
        format!(
            "CREATE payment SET 
                payment_type = $payment_type, 
                name = $name, 
                category = $category, 
                amount = $amount, 
                payment_method = $payment_method, 
                pending = $pending, 
                created_at = time::now(),
                visit = {};",
            data.visit_id
        )
    };

    // Execute the SQL query
    let _response: Response = db
        .query(sql)
        .bind(("payment_type", data.payment_type))
        .bind(("name", data.name))
        .bind(("category", data.category))
        .bind(("amount", data.amount))
        .bind(("payment_method", data.payment_method))
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
pub fn create_payment(data: CreatePaymentData) -> Result<(), String> {
    match create_query(data) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
