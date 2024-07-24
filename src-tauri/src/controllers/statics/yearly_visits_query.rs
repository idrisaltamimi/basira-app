use crate::{connect::database, utils::get_month_ranges_for_current_year};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;
use tokio::runtime::Runtime; // Import Runtime

#[derive(Debug, Deserialize, Serialize)]
pub struct MonthlyVisitsCount {
    month: u8,
    male: u32,
    female: u32,
}

// This function should not be marked with #[tokio::main]
pub fn yearly_visits_query() -> Result<Vec<MonthlyVisitsCount>> {
    let rt = Runtime::new()?; // Create a runtime manually
    rt.block_on(async {
        let db = database().await?;
        let month_ranges = get_month_ranges_for_current_year();
        let mut monthly_counts = Vec::new();

        for (index, (start_of_month, end_of_month)) in month_ranges.iter().enumerate() {
            let sql = format!(
                "SELECT 
                    time::month(created_at) AS month,
                    COUNT(IF visitor.gender = 'ذكر' THEN 1 ELSE NULL END) AS male,
                    COUNT(IF visitor.gender = 'أنثى' THEN 1 ELSE NULL END) AS female 
                FROM visit
                WHERE created_at >= '{}' AND created_at <= '{}' GROUP BY month",
                start_of_month, end_of_month
            );
            let mut response: Response = db.query(&sql).await?;
            let results: Vec<MonthlyVisitsCount> = response.take(0)?;

            if results.len() == 0 {
                monthly_counts.push(MonthlyVisitsCount {
                    month: index as u8 + 1,
                    male: 0,
                    female: 0,
                });
            } else {
                monthly_counts.extend(results);
            }
        }

        Ok(monthly_counts)
    })
}

#[tauri::command]
pub fn get_yearly_visits() -> Result<Vec<MonthlyVisitsCount>, String> {
    match yearly_visits_query() {
        Ok(visit_counts) => Ok(visit_counts),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
