use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::User;

#[tokio::main]
pub async fn get_users_query() -> Result<Vec<User>> {
    let db = database().await?;

    let sql = format!("SELECT * FROM user");
    let mut response: Response = db.query(sql).await?;
    let res: Vec<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn get_users() -> Result<Vec<User>, String> {
    match get_users_query() {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
