use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::salary::Salary;

#[tokio::main]
pub async fn get_salary_query() -> Result<Vec<Salary>> {
    let db = database().await?;

    let sql = "SELECT 
            created_at, 
            amount, 
            <string> user.phone AS user_phone, 
            id, 
            salary_type, 
            user.name AS user_name 
        FROM salary";
    let mut response: Response = db.query(sql).await?;
    let res: Vec<Salary> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn get_salary() -> Result<Vec<Salary>, String> {
    match get_salary_query() {
        Ok(salary) => Ok(salary),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
