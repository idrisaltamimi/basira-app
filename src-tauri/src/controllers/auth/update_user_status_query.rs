use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::User;

#[tokio::main]
pub async fn update_user_status_query(is_active: bool, user_id: String) -> Result<Option<User>> {
    let db = database().await?;

    let sql = format!(
        r#"
            UPDATE user SET 
                is_active = {}
            WHERE id = '{}';
        "#,
        is_active, user_id
    );

    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn update_user_status(is_active: bool, user_id: String) -> Result<Option<User>, String> {
    match update_user_status_query(is_active, user_id) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
