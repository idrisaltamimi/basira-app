use anyhow::Result;
use surrealdb::Response;

use crate::{
    connect::database, structs::statics::TodayVisitsCount, utils::get_current_month_range,
};

#[tokio::main]
pub async fn last_month_visits_count_query(gender: String) -> Result<Option<TodayVisitsCount>> {
    let db = database().await?;

    let (start_last_month, end_last_month) = get_current_month_range();
    let sql = format!(
        "SELECT count() FROM visit WHERE visitor.gender = '{}' AND created_at >= '{}' AND created_at <= '{}' GROUP BY count",
        gender,start_last_month, end_last_month
    );
    let mut response: Response = db.query(sql).await?;
    let visit: Option<TodayVisitsCount> = response.take(0)?;

    Ok(visit)
}

#[tauri::command]
pub fn last_month_visits_count(gender: String) -> Result<Option<TodayVisitsCount>, String> {
    match last_month_visits_count_query(gender) {
        Ok(visit) => Ok(visit),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
