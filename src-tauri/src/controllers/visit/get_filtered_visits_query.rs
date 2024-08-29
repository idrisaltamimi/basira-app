use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};
use surrealdb::Response;

use crate::connect::database;

#[derive(Debug, Deserialize, Serialize)]
pub struct VisitDetails {
    pub id: Thing,
    pub created_at: Datetime,
    pub visitor_id: Thing,
    pub visitor_name: String,
    pub visitor_birthdate: Datetime,
    pub visitor_phone: String,
    pub visitor_file_number: String,
    pub visitor_gender: String,
    pub doctor_id: Option<Thing>,
    pub doctor_name: Option<String>,
    pub treatment_type: Option<String>,
    pub is_open: bool,
}

#[tokio::main]
pub async fn get_filtered_visits_query(
    time: String,
    gender: String,
    page_index: u32,
    page_size: u32,
) -> Result<Vec<VisitDetails>> {
    let db = database().await?;

    let time_condition = match time.as_str() {
        "today" => "time::day(created_at) == time::day(time::now())".to_string(),
        "yesterday" => "time::day(created_at) == time::day(time::now() - 1d)".to_string(),
        "all" => "true".to_string(),
        _ => return Err(anyhow::anyhow!("Invalid filter")),
    };

    let gender_condition = match gender.as_str() {
        "ذكر" => "visitor.gender == 'ذكر'".to_string(),
        "أنثى" => "visitor.gender == 'أنثى'".to_string(),
        "all" => "true".to_string(),
        _ => return Err(anyhow::anyhow!("Invalid filter")),
    };

    let start_record = page_index * page_size;

    let sql = format!(
        "SELECT 
            id,
            created_at,
            visitor as visitor_id, 
            visitor.name as visitor_name, 
            visitor.birthdate as visitor_birthdate, 
            <string> visitor.phone as visitor_phone,
            <string> visitor.file_number as visitor_file_number,
            visitor.gender as visitor_gender,
            doctor as doctor_id,
            doctor.name as doctor_name,
            treatment_type,
            is_open
        FROM visit WHERE {} AND {} ORDER BY created_at DESC LIMIT {} START {};",
        time_condition, gender_condition, page_size, start_record
    );

    let mut response: Response = db.query(sql).await?;
    let visits: Vec<VisitDetails> = response.take(0)?;

    Ok(visits)
}

#[tauri::command]
pub fn get_filtered_visits(
    time: String,
    gender: String,
    page_index: u32,
    page_size: u32,
) -> Result<Vec<VisitDetails>, String> {
    match get_filtered_visits_query(time, gender, page_index, page_size) {
        Ok(visits) => Ok(visits),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
