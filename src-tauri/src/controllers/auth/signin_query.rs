use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::auth::User;

#[tokio::main]
pub async fn signin_query(civil_id: u32, password: String) -> Result<Option<User>> {
    let db = database().await?;
    let sql = format!(
        "SELECT * FROM user WHERE civil_id = {} AND is_active = true",
        civil_id
    );

    let mut response: Response = db.query(sql).await?;
    let res: Option<User> = response.take(0)?;

    if let Some(user) = res {
        let is_password_correct = bcrypt::verify(password, &user.password).unwrap_or(false);

        if is_password_correct {
            let sql = format!(
                    "UPDATE user SET login_at = time::now(), logout_at = NULL WHERE id = '{}' AND time::floor(login_at, 1d) IS NOT time::floor(time::now(), 1d)",
                    &user.id
                );
            let _response: Response = db.query(sql).await?;

            Ok(Some(user))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn signin(civil_id: u32, password: String) -> Result<Option<User>, String> {
    match signin_query(civil_id, password) {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
