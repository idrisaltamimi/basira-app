use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::engine::remote::ws::Client;
use surrealdb::sql::Thing;
use surrealdb::{Response, Surreal};

use crate::connect::database;
use crate::controllers::payment::create_payment_query::create_payment_query;
use crate::structs::payment::CreatePaymentData;
use crate::structs::visit::UpdateVisitData;
use crate::structs::visit_image::VisitImage;

#[derive(Debug, Deserialize, Serialize)]
struct PaymentId {
    id: Thing,
}

async fn create_or_update_payment_item(
    db: Surreal<Client>,
    payment_id: Thing,
    treatment_cost: f64,
    visit_id: String,
) -> Result<()> {
    let existing_payment_item_sql = format!(
        "SELECT id FROM payment_item WHERE visit = '{}' AND name = '{}'",
        visit_id,
        "تكلفة العلاج".to_string()
    );
    let mut response: Response = db.query(existing_payment_item_sql).await?;
    let payment_item_id: Option<PaymentId> = response.take(0)?;

    let payment_item_sql =
        if let Some(payment_item_id) = payment_item_id {
            format!(
                "UPDATE payment_item SET amount = {} WHERE id = payment_item:{};",
                treatment_cost, payment_item_id.id.id
            )
        } else {
            format!(
            "CREATE payment_item SET name = '{}', amount = {}, payment = payment:{}, visit = '{}';",
            "تكلفة العلاج".to_string(), treatment_cost, payment_id.id, visit_id
        )
        };

    db.query(payment_item_sql).await?;
    Ok(())
}

#[tokio::main]
pub async fn update_visit_query(data: UpdateVisitData) -> Result<()> {
    let db = database().await?;

    let treatment_img = if data.treatment_img.is_empty() {
        "NULL".to_string()
    } else {
        data.treatment_img.clone()
    };

    let mut image = "NULL".to_string();

    let image_sql = format!("SELECT * FROM image WHERE visit = '{}'", &data.visit_id);
    let mut image_response: Response = db.query(image_sql).await?;
    let image_result: Option<VisitImage> = image_response.take(0)?;

    if treatment_img == "NULL" {
        if let Some(result) = image_result {
            let image_sql = format!("DELETE image WHERE id = image:{}", result.id.id);
            let _image_response: Response = db.query(image_sql).await?;
        }
    } else {
        if let Some(result) = image_result {
            let image_sql = format!(
                "UPDATE image SET image = '{}' WHERE id = image:{}",
                treatment_img, result.id.id
            );
            let _image_response: Response = db.query(image_sql).await?;

            image = format!("image:{}", result.id.id).to_string();
        } else {
            let image_sql = format!(
                "CREATE image SET image = '{}', visit = '{}'",
                treatment_img, data.visit_id
            );
            let mut image_response: Response = db.query(image_sql).await?;
            let image_result: Option<VisitImage> = image_response.take(0)?;
            if let Some(result) = image_result {
                image = format!("image:{}", result.id.id).to_string();
            }
        }
    }

    let sql = format!(
        "UPDATE visit SET 
            treatment_img = '{}', 
            description = '{}', 
            treatment_type = '{}',
            prescription = '{}', 
            symptoms = '{}', 
            treatment_cost = {}, 
            prescription_cost = {}, 
            doctor = '{}' 
        WHERE id = '{}';",
        image,
        data.description,
        data.treatment_type,
        data.prescription,
        data.symptoms,
        data.treatment_cost,
        data.prescription_cost,
        data.doctor,
        String::from(&data.visit_id)
    );
    let _response: Response = db.query(sql).await?;

    // get payment id related to this visit
    let payment_id_sql = format!(
        "SELECT id FROM payment WHERE visit = '{}'",
        String::from(&data.visit_id)
    );
    let mut payment_id_response = db.query(payment_id_sql).await?;
    let payment_id: Option<PaymentId> = payment_id_response.take(0)?;

    if let Some(payment_id) = payment_id {
        create_or_update_payment_item(
            db,
            payment_id.id,
            data.treatment_cost,
            String::from(&data.visit_id),
        )
        .await?;
    } else {
        let payment_data = CreatePaymentData {
            payment_type: "payment".to_string(),
            name: "تكلفة العلاج".to_string(),
            category: "visits".to_string(),
            amount: data.treatment_cost,
            payment_method: "فيزا".to_string(),
            pending: true,
            visit_id: String::from(&data.visit_id),
        };
        let payment_res = create_payment_query(payment_data).await?;
        if let Some(payment_res) = payment_res {
            create_or_update_payment_item(
                db,
                payment_res.id,
                data.treatment_cost,
                String::from(&data.visit_id),
            )
            .await?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn update_visit(data: UpdateVisitData) -> Result<(), String> {
    match update_visit_query(data) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
