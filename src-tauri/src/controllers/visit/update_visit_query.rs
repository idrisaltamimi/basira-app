use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::UpdateVisitData;

#[tokio::main]
pub async fn update_visit_query(data: UpdateVisitData) -> Result<()> {
    let db = database().await?;
    println!("{:#?}", data);
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
        data.treatment_img,
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
    println!("{:#?}", _response);

    Ok(())
}

#[tauri::command]
pub fn update_visit(data: UpdateVisitData) {
    let _res = update_visit_query(data);
}
