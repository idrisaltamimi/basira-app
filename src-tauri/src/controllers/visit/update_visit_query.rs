use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::UpdateVisitData;
use crate::structs::visit_image::VisitImage;

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
        data.visit_id
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_visit(data: UpdateVisitData) -> Result<(), String> {
    match update_visit_query(data) {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()),
    }
}
