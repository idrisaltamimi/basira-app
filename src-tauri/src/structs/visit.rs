use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Serialize, Deserialize)]
pub struct Visit {
    pub id: Thing,
    pub created_at: Datetime,
    pub is_open: bool,
    pub visitor: Thing,
    pub doctor: Option<Thing>,
    pub treatment_img: Option<String>,
    pub description: Option<String>,
    pub treatment_type: Option<String>,
    pub prescription: Option<String>,
    pub symptoms: Option<String>,
    pub treatment_cost: Option<f64>,
    pub prescription_cost: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewVisit {
    pub id: Thing,
    pub created_at: Datetime,
    pub is_open: bool,
    pub visitor: Thing,
    pub doctor: Option<Thing>,
    pub treatment_img: Option<String>,
    pub description: Option<String>,
    pub treatment_type: Option<String>,
    pub prescription: Option<String>,
    pub symptoms: Option<String>,
    pub treatment_cost: Option<f64>,
    pub prescription_cost: Option<f64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Visits {
    pub id: Thing,
    created_at: Datetime,
    visitor_id: Thing,
    visitor_name: String,
    visitor_birthdate: Datetime,
    visitor_phone: u32,
    visitor_file_number: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateVisitData {
    pub treatment_img: String,
    pub description: String,
    pub treatment_type: String,
    pub prescription: String,
    pub treatment_cost: f64,
    pub prescription_cost: f64,
    pub doctor: String,
    pub visit_id: String,
    pub symptoms: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SelectedVisit {
    pub id: Thing,
    pub treatment_img: Option<String>,
    pub description: Option<String>,
    pub treatment_type: Option<String>,
    pub prescription: Option<String>,
    pub treatment_cost: Option<f64>,
    pub prescription_cost: Option<f64>,
    pub doctor_name: Option<String>,
    pub symptoms: Option<String>,
    pub created_at: Datetime,
    pub visitor_id: Thing,
    pub visitor_name: String,
    pub visitor_birthdate: Datetime,
    pub visitor_phone: u32,
    pub visitor_file_number: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LastVisit {
    created_at: Datetime,
    description: String,
    doctor_name: String,
    id: Thing,
    treatment: String,
    treatment_img: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LastVisitsHistory {
    created_at: Datetime,
    id: Thing,
}
