use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    id: Thing,
    pub name: String,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Payment {
    pub id: Thing,
    payment_type: String,
    name: String,
    category: String,
    pub amount: f64,
    pub payment_method: String,
    visit_id: Thing,
    visitor_name: String,
    visitor_phone: String,
    created_at: Datetime,
    pub payment_items: Option<Vec<Item>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OriginalPayment {
    pub amount: f64,
    pub category: String,
    pub created_at: Datetime,
    pub id: Thing,
    pub name: String,
    pub payment_method: String,
    pub payment_type: String,
    pub pending: bool,
    pub visit: Thing,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentItem {
    id: Thing,
    pub name: String,
    amount: f64,
    pub visit: Thing,
    payment: Thing,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePaymentData {
    pub payment_type: String,
    pub name: String,
    pub category: String,
    pub amount: f64,
    pub payment_method: String,
    pub pending: bool,
    pub visit_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreatePaymentItem {
    pub name: String,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewPaymentData {
    pub amount: f64,
    pub category: String,
    pub created_at: Datetime,
    pub id: Thing,
    pub name: String,
    pub payment_method: String,
    pub payment_type: String,
    pub pending: bool,
    pub visit: Thing,
}
