use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::medical_record::CreateRecordData;

#[tokio::main]
pub async fn create_record_query(data: CreateRecordData) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        r#"
        CREATE record SET did_surgery = $did_surgery, 
        has_disease = $has_disease, 
        use_medicine = $use_medicine, 
        allergy = $allergy, 
        heart_problems = $heart_problems, 
        high_blood_pressure = $high_blood_pressure, 
        diabetes = $diabetes, 
        pregnant = $pregnant, 
        smokes = $smokes, 
        others = $others,
        visitor = {}
    "#,
        data.visitor_id
    );
    let _response: Response = db
        .query(sql)
        .bind(("did_surgery", data.did_surgery))
        .bind(("has_disease", data.has_disease))
        .bind(("use_medicine", data.use_medicine))
        .bind(("allergy", data.allergy))
        .bind(("heart_problems", data.heart_problems))
        .bind(("high_blood_pressure", data.high_blood_pressure))
        .bind(("diabetes", data.diabetes))
        .bind(("pregnant", data.pregnant))
        .bind(("smokes", data.smokes))
        .bind(("others", data.others))
        .await?;

    Ok(())
}

#[tauri::command]
pub fn create_record(data: CreateRecordData) {
    let _record = create_record_query(data);
}
