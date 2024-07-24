use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Serialize, Deserialize)]
pub struct Salary {
    id: Thing,
    created_at: Datetime,
    user_name: String,
    amount: f64,
    salary_type: String,
    user_phone: String,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSalaryData {
    pub user: String,
    pub amount: f64,
    pub salary_type: String,
}
