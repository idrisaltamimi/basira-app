use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::User;

#[tokio::main]
pub async fn get_user_query(user_id: String) -> Result<Option<User>> {
    let db = database().await?;
    let sql = format!("SELECT * FROM user WHERE id = '{}'", user_id);
    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn get_user(user_id: String) -> Result<Option<User>, String> {
    match get_user_query(user_id) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
