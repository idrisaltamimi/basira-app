use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;

use crate::structs::product::Product;

#[tokio::main]
pub async fn get_product_query() -> Result<Vec<Product>> {
    let db = database().await?;

    let sql = "SELECT * FROM product";
    let mut response: Response = db.query(sql).await?;
    let res: Vec<Product> = response.take(0)?;

    Ok(res)
}

#[tauri::command]
pub fn get_product() -> Result<Vec<Product>, String> {
    match get_product_query() {
        Ok(product) => Ok(product),
        Err(err) => Err(err.to_string()), // Convert Error to String
    }
}
