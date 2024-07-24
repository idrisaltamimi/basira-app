use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::product::CreateProduct;

#[tokio::main]
pub async fn create_product_query(data: CreateProduct) -> Result<()> {
    let db = database().await?;
    let sql = format!(
        "CREATE product SET
            product_name = '{}',
            amount = {},
            status = {};",
        data.product_name, data.amount, data.status
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn create_product(data: CreateProduct) {
    let _res = create_product_query(data);
}
