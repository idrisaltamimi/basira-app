use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::{User, UserData};

#[tokio::main]
pub async fn signup_query(data: UserData) -> Result<Option<User>> {
    let db = database().await?;

    let hashed_password = bcrypt::hash(data.password, 10).unwrap();

    let sql = format!(
        r#"
            CREATE user SET 
                email = '{}', 
                password = '{}', 
                name = '{}', 
                phone = '{}', 
                role = '{}',
                civil_id = {},
                is_active = true,
                gender = '{}',
                birthdate = {},
                login_at = NULL,
                logout_at = NULL;
                "#,
        data.email,
        hashed_password,
        data.name,
        data.phone,
        data.role,
        data.civil_id,
        data.gender,
        data.birthdate
    );
    // DEFINE INDEX userCivilIdIndex ON TABLE user COLUMNS civil_id UNIQUE;
    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn signup(data: UserData) -> Result<Option<User>, String> {
    match signup_query(data) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
