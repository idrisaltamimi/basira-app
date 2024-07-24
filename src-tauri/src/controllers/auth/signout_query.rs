use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn signout_query(user_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "UPDATE user SET logout_at = time::now() WHERE id = '{}'",
        user_id
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn signout(user_id: String) {
    let _res = signout_query(user_id);
}
