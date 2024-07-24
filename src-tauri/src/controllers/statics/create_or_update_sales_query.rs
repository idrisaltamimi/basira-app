use anyhow::Result;
use chrono::prelude::*;
use surrealdb::{sql::Value, Response};

use crate::connect::database;

pub async fn create_or_update_sales_query(amount: f64) -> Result<()> {
    let db = database().await?;
    let today = Utc::now();
    let (year, month) = (today.year(), today.month());

    // Attempt to update an existing sales record for the month
    let update_sql = format!(
        "UPDATE sales SET amount += {} WHERE year = {} AND month = {};",
        amount, year, month
    );
    let mut update_response: Response = db.query(update_sql).await?;

    // Attempt to retrieve the result array from the update response
    let update_results: Vec<Value> = update_response.take(0)?;

    // Check if the update result array is empty, which would indicate no rows were updated
    if update_results.is_empty() {
        // If the array is empty, then no sales record was updated, hence create a new one
        let create_sql = format!(
            "CREATE sales SET amount = {}, year = {}, month = {};",
            amount, year, month
        );
        let _create_response: Response = db.query(create_sql).await?;
    }

    Ok(())
}
