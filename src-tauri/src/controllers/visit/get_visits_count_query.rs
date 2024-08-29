use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;

use crate::connect::database;

#[derive(Debug, Deserialize, Serialize)]
pub struct VisitsCount {
    count: u32,
}

#[tokio::main]
pub async fn get_visits_count_query() -> Result<Option<VisitsCount>> {
    let db = database().await?;

    let sql = "SELECT count() FROM visits GROUP BY count";
    let mut response: Response = db.query(sql).await?;
    let count: Option<VisitsCount> = response.take(0)?;

    Ok(count)
}

#[tauri::command]
pub fn get_visits_count() -> Result<Option<VisitsCount>, String> {
    match get_visits_count_query() {
        Ok(count) => Ok(count),
        Err(err) => Err(err.to_string()),
    }
}
