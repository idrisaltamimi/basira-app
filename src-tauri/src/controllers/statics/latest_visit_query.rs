use anyhow::Result;
use surrealdb::Response;

use crate::{connect::database, structs::statics::LatestVisit};

#[tokio::main]
pub async fn latest_visit_query() -> Result<Vec<LatestVisit>> {
    let db = database().await?;

    let sql = r#"SELECT id, created_at, visitor.name AS name FROM visit LIMIT 10"#;
    let mut response: Response = db.query(sql).await?;
    let visit: Vec<LatestVisit> = response.take(0)?;

    Ok(visit)
}

#[tauri::command]
pub fn latest_visit() -> Result<Vec<LatestVisit>, String> {
    match latest_visit_query() {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
