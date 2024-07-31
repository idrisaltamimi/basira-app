use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::{UpdateUserData, User};

#[tokio::main]
pub async fn update_user_query(data: UpdateUserData) -> Result<Option<User>> {
    let db = database().await?;

    let birthdate_str = data.birthdate.to_rfc3339();
    
    let sql = if let Some(password) = data.password {
        let hashed_password = bcrypt::hash(password, 10).unwrap();
        format!(
            "UPDATE user SET email = '{}', password = '{}', name = '{}', phone = '{}', birthdate = '{}' WHERE id = '{}';",
            data.email, hashed_password, data.name, data.phone, birthdate_str, data.id
        )
    } else {
        format!(
            "UPDATE user SET email = '{}', name = '{}', phone = '{}', birthdate = '{}' WHERE id = '{}';",
            data.email, data.name, data.phone, birthdate_str, data.id
        )
    };

    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn update_user(data: UpdateUserData) -> Result<Option<User>, String> {
    match update_user_query(data) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
