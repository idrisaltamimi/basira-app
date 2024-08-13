use anyhow::Result;
use surrealdb::Response;

use crate::connect::database;
use crate::structs::product::UpdateProduct;

#[tokio::main]
pub async fn update_product_query(data: UpdateProduct) -> Result<()> {
    let db = database().await?;

    let status = if data.quantity > 0 { "true" } else { "false" };
    let sql = format!(
        "UPDATE product SET
            product_name = '{}',
            amount = {},
            status = {},
            quantity = {}
          WHERE 
            id = '{}';",
        data.product_name, data.amount, status, data.quantity, data.id
    );
    let _response: Response = db.query(sql).await?;

    Ok(())
}

#[tauri::command]
pub fn update_product(data: UpdateProduct) {
    let _res = update_product_query(data);
}
