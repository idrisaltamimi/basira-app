use anyhow::{anyhow, Result};
use surrealdb::Response;

use crate::connect::database;
use crate::structs::visitor::{UpdateVisitorData, Visitor};

#[tokio::main]
pub async fn update_visitor_query(data: UpdateVisitorData) -> Result<()> {
    let db = database().await?;

    if let Some(civil_id) = &data.civil_id {
        // Check if there is already a visitor with this civil_id
        let check_civil_id_query = format!(
            "SELECT * FROM visitor WHERE civil_id = {} AND id IS NOT '{}';",
            civil_id, data.id
        );
        let mut check_civil_id_res: Response = db.query(check_civil_id_query).await?;
        let existing_visitors: Vec<Visitor> = check_civil_id_res.take(0)?;
        println!("{:#?}", existing_visitors);
        if !existing_visitors.is_empty() {
            return Err(anyhow!("visitor with the civil_id already exists"));
        }
    }

    let civil_id = match data.civil_id {
        Some(id) => id.to_string(),
        None => "NULL".to_string(),
    };

    let birthdate_str = data.birthdate.to_rfc3339();
    let sql = format!(
        "UPDATE visitor SET name = '{}', phone = {}, civil_id = {}, gender = '{}', birthdate = '{}', file_number = {} WHERE id = '{}';",
        data.name, data.phone, civil_id, data.gender, birthdate_str, data.file_number, data.id,
    );

    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_visitor(data: UpdateVisitorData) -> Result<(), String> {
    match update_visitor_query(data) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
