use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Serialize, Deserialize)]
pub struct Payment {
    id: Thing,
    payment_type: String,
    name: String,
    category: String,
    amount: f64,
    visit_id: Thing,
    visitor_name: String,
    visitor_phone: String,
    created_at: Datetime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePaymentData {
    pub payment_type: String,
    pub name: String,
    pub category: String,
    pub amount: f64,
    pub pending: bool,
    pub visit_id: String,
}
