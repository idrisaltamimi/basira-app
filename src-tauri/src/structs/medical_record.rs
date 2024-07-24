use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    id: Thing,
    did_surgery: Option<String>,
    has_disease: Option<String>,
    use_medicine: Option<String>,
    allergy: Option<String>,
    heart_problems: Option<String>,
    high_blood_pressure: Option<String>,
    diabetes: Option<String>,
    pregnant: Option<String>,
    smokes: Option<String>,
    others: Option<String>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateRecordData {
    pub did_surgery: Option<String>,
    pub has_disease: Option<String>,
    pub use_medicine: Option<String>,
    pub allergy: Option<String>,
    pub heart_problems: Option<String>,
    pub high_blood_pressure: Option<String>,
    pub diabetes: Option<String>,
    pub pregnant: Option<String>,
    pub smokes: Option<String>,
    pub others: Option<String>,
    pub visitor_id: String,
}
