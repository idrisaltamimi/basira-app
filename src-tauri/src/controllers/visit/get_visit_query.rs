use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visit::SelectedVisit;

#[tokio::main]
pub async fn get_visit_query(visitor_id: String) -> Result<Option<SelectedVisit>> {
    let db = database().await?;

    let sql = format!(
        "SELECT id, 
            treatment_img, 
            created_at,
            description, 
            treatment_type, 
            prescription,
            treatment_cost,
            prescription_cost,
            symptoms,
            doctor.name AS doctor_name,
            visitor.id AS visitor_id,
            visitor.name AS visitor_name,
            visitor.birthdate AS visitor_birthdate,
            visitor.phone AS visitor_phone,
            visitor.file_number AS visitor_file_number
        FROM visit WHERE visitor = {} AND is_open = true;",
        visitor_id
    );
    let mut response: Response = db.query(sql).await?;
    let visit: Option<SelectedVisit> = response.take(0)?;

    Ok(visit)
}

#[tauri::command]
pub fn get_visit(visitor_id: String) -> Result<Option<SelectedVisit>, String> {
    match get_visit_query(visitor_id) {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
