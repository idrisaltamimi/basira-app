use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    id: Thing,
    product_name: String,
    amount: f64,
    status: bool,
    quantity: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProduct {
    pub product_name: String,
    pub amount: f64,
    pub quantity: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProduct {
    pub id: String,
    pub product_name: String,
    pub amount: f64,
    pub quantity: u32,
}
