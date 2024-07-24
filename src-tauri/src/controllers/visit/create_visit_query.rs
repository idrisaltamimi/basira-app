use anyhow::Result;
use surrealdb::Response;

use crate::{
    connect::database,
    controllers::payment::create_payment_query::create_payment_query,
    structs::{payment::CreatePaymentData, visit::NewVisit},
};

pub async fn create_visit_query(visitor_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "CREATE visit SET 
            is_open = true, 
            visitor = visitor:{}, 
            doctor = NULL, 
            treatment_img = NULL, 
            description = NULL, 
            treatment_type = NULL,
            treatment_cost = NULL, 
            prescription = NULL,
            symptoms = NULL,
            prescription_cost = NULL,
            created_at = time::now();",
        { visitor_id }
    );
    let mut response: Response = db.query(sql).await?;
    let res: Option<NewVisit> = response.take(0)?;

    let visit_id = match res {
        Some(visit) => format!("visit:{}", visit.id.id),
        None => return Err(anyhow::anyhow!("Failed to create visit")),
    };

    let payment_data = CreatePaymentData {
        payment_type: "payment".to_string(),
        name: "زيارة".to_string(),
        category: "visits".to_string(),
        amount: 2.0,
        pending: true,
        visit_id,
    };

    let _payment = create_payment_query(payment_data).await?; // CREATE VISIT FEE PAYMENT FOR NEW VISIT

    Ok(())
}

#[tokio::main]
async fn create_query(visitor_id: String) -> Result<()> {
    let _res = create_visit_query(visitor_id).await?;

    Ok(())
}

#[tauri::command]
pub fn create_visit(visitor_id: String) {
    let _res = create_query(visitor_id);
}
