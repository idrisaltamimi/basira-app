use crate::{
    connect::database,
    controllers::payment::create_payment_query::create_payment_query,
    structs::{payment::CreatePaymentData, visit::Visit},
};
use anyhow::Result;
use surrealdb::sql::Thing;
use surrealdb::Response;

pub async fn create_visit_query(visitor_id: String) -> Result<()> {
    let db = database().await?;
    let visit_id: Option<Thing>;
    let payment_id: Option<Thing>;

    // Step 1: Create Visit
    let visit_sql = format!(
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
        visitor_id
    );
    let mut visit_response: Response = db.query(visit_sql).await.map_err(|e| anyhow::anyhow!(e))?;
    let res: Option<Visit> = visit_response.take(0)?;
    visit_id = match res {
        Some(visit) => Some(visit.id),
        None => return Err(anyhow::anyhow!("Failed to create visit")),
    };

    // Step 2: Create Payment
    let payment_data = CreatePaymentData {
        payment_type: "payment".to_string(),
        name: "فتح زيارة".to_string(),
        category: "visits".to_string(),
        amount: 2.0,
        payment_method: "فيزا".to_string(),
        pending: true,
        visit_id: visit_id.as_ref().unwrap().to_string(),
    };
    let payment_res = create_payment_query(payment_data).await?;
    payment_id = match payment_res {
        Some(payment) => Some(payment.id),
        None => {
            // Rollback visit if payment creation fails
            if let Some(visit_id) = visit_id.as_ref() {
                let rollback_sql = format!("DELETE FROM visit WHERE id = visit:{};", visit_id);
                db.query(rollback_sql)
                    .await
                    .map_err(|e| anyhow::anyhow!(e))?;
            }
            return Err(anyhow::anyhow!("Failed to create visit"));
        }
    };

    // Step 3: Create Payment Item
    let payment_item_sql = format!(
        "CREATE payment_item SET
            name = '{}',
            amount = {},
            payment = '{}',
            visit = '{}';",
        "زيارة".to_string(),
        2.0,
        payment_id.as_ref().unwrap(),
        visit_id.as_ref().unwrap(),
    );

    let payment_item_response: Result<Response> = db
        .query(payment_item_sql)
        .await
        .map_err(|e| anyhow::anyhow!(e));
    if let Err(err) = payment_item_response {
        // Rollback payment and visit if payment item creation fails
        if let Some(payment_id) = payment_id.as_ref() {
            let rollback_payment_sql =
                format!("DELETE FROM payment WHERE id = payment:{};", payment_id);
            db.query(rollback_payment_sql)
                .await
                .map_err(|e| anyhow::anyhow!(e))?;
        }
        if let Some(visit_id) = visit_id.as_ref() {
            let rollback_visit_sql = format!("DELETE FROM visit WHERE id = visit:{};", visit_id);
            db.query(rollback_visit_sql)
                .await
                .map_err(|e| anyhow::anyhow!(e))?;
        }
        return Err(anyhow::anyhow!("Failed to create payment item: {}", err));
    }

    Ok(())
}

#[tokio::main]
async fn create_query(visitor_id: String) -> Result<()> {
    create_visit_query(visitor_id).await?;
    Ok(())
}

#[tauri::command]
pub fn create_visit(visitor_id: String) -> Result<(), String> {
    match create_query(visitor_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
