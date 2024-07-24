use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::product::UpdateProduct;

#[tokio::main]
pub async fn update_product_query(data: UpdateProduct) -> Result<()> {
    let db = database().await?;
    let sql = format!(
        "UPDATE product SET
            product_name = '{}',
            amount = {},
            status = {}
          WHERE 
            id = '{}';",
        data.product_name, data.amount, data.status, data.id
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_product(data: UpdateProduct) {
    let _res = update_product_query(data);
}
