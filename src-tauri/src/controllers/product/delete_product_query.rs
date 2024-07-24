use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

#[tokio::main]
pub async fn delete_product_query(product_id: String) -> Result<()> {
    let db = database().await?;
    let sql = format!("DELETE product WHERE id = '{}';", product_id);
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn delete_product(product_id: String) {
    let _res = delete_product_query(product_id);
}
