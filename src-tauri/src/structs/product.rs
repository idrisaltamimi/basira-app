use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: Thing,
    pub product_name: String,
    pub amount: f64,
    pub status: bool,
    pub quantity: u32,
    pub sales: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProduct {
    pub product_name: String,
    pub amount: f64,
    pub quantity: u32,
    pub sales: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateProduct {
    pub id: String,
    pub product_name: String,
    pub amount: f64,
    pub quantity: u32,
    pub sales: u32,
}
