use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::UpdateVisitData;
use crate::structs::visit_image::VisitImage;

#[derive(Debug, Deserialize, Serialize)]
struct PaymentId {
    id: Thing,
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
            println!("delete");
            let image_sql = format!("DELETE image WHERE id = image:{}", result.id.id);
            let _image_response: Response = db.query(image_sql).await?;
        }
    } else {
        if let Some(result) = image_result {
            println!("update");
            let image_sql = format!(
                "UPDATE image SET image = '{}' WHERE id = image:{}",
                treatment_img, result.id.id
            );
            let _image_response: Response = db.query(image_sql).await?;

            image = format!("image:{}", result.id.id).to_string();
        } else {
            println!("create");
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
    };

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
        let existing_payment_item_sql = format!(
            "SELECT id FROM payment_item WHERE visit = '{}' AND name = '{}'",
            String::from(&data.visit_id),
            "تكلفة العلاج".to_string(),
        );
        let mut response: Response = db.query(existing_payment_item_sql).await?;
        let payment_item_id: Option<PaymentId> = response.take(0)?;

        let mut payment_item_sql = format!(
            "CREATE payment_item SET
                name = '{}',
                amount = {},
                payment = payment:{},
                visit = '{}';",
            "تكلفة العلاج".to_string(),
            data.treatment_cost,
            payment_id.id.id,
            String::from(&data.visit_id),
        );

        if let Some(payment_item_id) = payment_item_id {
            payment_item_sql = format!(
                "UPDATE payment_item SET
                    name = '{}',
                    amount = {}
                WHERE id = payment_item:{};",
                "تكلفة العلاج".to_string(),
                data.treatment_cost,
                payment_item_id.id.id,
            );
        }

        let _payment_item_response: Response = db.query(payment_item_sql).await?;
    } else {
        return Err(anyhow::anyhow!("No pending payment found for the visit."));
    }

    Ok(())
}

#[tauri::command]
pub fn update_visit(data: UpdateVisitData) -> Result<(), String> {
    match update_visit_query(data) {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()),
    }
}
