use anyhow::{anyhow, Result};
use surrealdb::Response;

use crate::connect::database;
use crate::controllers::visit::create_visit_query::create_visit_query;
use crate::structs::visitor::FileNumber;
use crate::structs::visitor::{Visitor, VisitorData};

#[tokio::main]
pub async fn create_visitor_query(visitor: VisitorData) -> Result<Vec<Visitor>> {
    let db = database().await?;

    if let Some(civil_id) = &visitor.civil_id {
        // Check if there is already a visitor with this civil_id
        let check_civil_id_query = format!("SELECT * FROM visitor WHERE civil_id = {}", civil_id);
        let mut check_civil_id_res: Response = db.query(check_civil_id_query).await?;
        let existing_visitors: Vec<Visitor> = check_civil_id_res.take(0)?;

        if !existing_visitors.is_empty() {
            return Err(anyhow!("visitor with the civil_id already exists"));
        }
    }

    // CHECK IF THERE IS A FILE NUMBER TABLE AND CREATE ONE IF THERE IS NOT TABLE
    let mut file_res: Response = db
        .query("UPDATE file_number SET number += 1 WHERE id = 'file_number:increment'")
        .await?;
    let file_data: Vec<FileNumber> = file_res.take(0)?;

    let mut file_number = 1;
    if file_data.len() > 0 {
        file_number = file_data[0].number;
    } else {
        let _create_file: Response = db
            .query("CREATE file_number:increment SET number = 1")
            .await?;
    }

    let civil_id = match visitor.civil_id {
        Some(id) => id.to_string(),
        None => "NULL".to_string(),
    };
    let birthdate_str = visitor.birthdate.to_rfc3339();
    let sql = format!(
        "CREATE visitor SET name = '{}', phone = {}, civil_id = {}, gender = '{}', file_number = {}, birthdate = '{}';",
        visitor.name, visitor.phone, civil_id, visitor.gender, file_number, birthdate_str
    );

    let mut response: Response = db.query(sql).await?;

    let visitor: Vec<Visitor> = response.take(0)?;

    let id = &visitor[0].id.id;
    let _res = create_visit_query(id.to_string()).await?; // CREATE VISIT FOR NEW VISITOR

    Ok(visitor)
}

#[tauri::command]
pub fn create_visitor(data: VisitorData) -> Result<Vec<Visitor>, String> {
    match create_visitor_query(data) {
        Ok(visitor) => Ok(visitor),
        Err(err) => Err(err.to_string()),
    }
}
