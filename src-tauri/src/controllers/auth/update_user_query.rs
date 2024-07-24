use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::User;

#[tokio::main]
pub async fn update_user_query(data: User) -> Result<Option<User>> {
    let db = database().await?;

    let hashed_password = bcrypt::hash(data.password, 10).unwrap();

    let sql = format!(
        r#"
            UPDATE user SET 
                email = '{}', 
                password = '{}', 
                name = '{}', 
                phone = '{}', 
                role = '{}',
                is_active = {},
                civil_id = '{}',
                gender = '{}',
                birthdate = '{}'
            WHERE id = '{}';
            DEFINE INDEX userEmailIndex ON TABLE user COLUMNS email UNIQUE;
        "#,
        data.email,
        hashed_password,
        data.name,
        data.phone,
        data.role,
        data.is_active,
        data.civil_id,
        data.gender,
        data.birthdate,
        data.id
    );
    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn update_user(data: User) -> Result<Option<User>, String> {
    match update_user_query(data) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
