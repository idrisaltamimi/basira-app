use crate::connect::database;
use crate::structs::product::{Product, UpdateProduct};
use anyhow::{Context, Result};
use surrealdb::Response;

#[tokio::main]
pub async fn update_products_quantity_query(products: Vec<UpdateProduct>) -> Result<Vec<Product>> {
    let db = database().await?;
    let mut original_products = Vec::new();

    // Fetch the original products before updating
    for product in &products {
        let sql = format!("SELECT * FROM product WHERE id = '{}';", product.id);
        let mut response: Response = db.query(sql).await?;
        let original_product: Option<Product> = response.take(0)?;

        if let Some(product) = original_product {
            original_products.push(product);
        }
    }

    // Proceed with the updates
    for product in &products {
        let status = if product.quantity > 0 { true } else { false };

        let sql = format!(
            "UPDATE product SET
                product_name = '{}',
                amount = {},
                status = {},
                quantity = {},
                sales = {}
              WHERE 
                id = '{}';",
            product.product_name,
            product.amount,
            status,
            product.quantity,
            product.sales,
            product.id
        );

        let _response: Response = db
            .query(sql)
            .await
            .context("Failed to update product quantity")?;
    }

    Ok(original_products) // Return original products for potential rollback
}

#[tauri::command]
pub fn update_products_quantity(products: Vec<UpdateProduct>) -> Result<(), String> {
    // Capture the result of the update attempt
    match update_products_quantity_query(products.clone()) {
        Ok(_original_products) => Ok(()), // Updates succeeded
        Err(err) => {
            // On error, attempt to rollback using the original products
            if let Ok(original_products) = update_products_quantity_query(products) {
                if let Err(rollback_err) = rollback_products_update(original_products) {
                    eprintln!("Failed to rollback product updates: {}", rollback_err);
                }
            }
            Err(err.to_string())
        }
    }
}

#[tokio::main]
async fn rollback_products_update(original_products: Vec<Product>) -> Result<()> {
    let db = database().await?;

    for product in original_products.iter() {
        let status = if product.quantity > 0 { true } else { false };

        let sql = format!(
            "UPDATE product SET
                product_name = '{}',
                amount = {},
                status = {},
                quantity = {},
                sales = {}
              WHERE 
                id = product:{};",
            product.product_name,
            product.amount,
            status,
            product.quantity,
            product.sales,
            product.id.id
        );

        db.query(sql)
            .await
            .context("Failed to rollback product update")?;
    }

    Ok(())
}
