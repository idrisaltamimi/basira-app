use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Deserialize, Serialize)]
pub struct LatestVisit {
    id: Thing,
    created_at: Datetime,
    name: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TodayVisitsCount {
    count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastMonthTotal {
    amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastMonthPayment {
    id: Thing,
    name: String,
    amount: f64,
}
