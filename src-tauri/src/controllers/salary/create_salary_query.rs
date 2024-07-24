use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::salary::CreateSalaryData;

#[tokio::main]
pub async fn create_salary_query(data: CreateSalaryData) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "CREATE salary SET created_at = time::now(), amount = {}, user = '{}', salary_type = '{}';",
        data.amount, data.user, data.salary_type
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn create_salary(data: CreateSalaryData) {
    let _res = create_salary_query(data);
}
