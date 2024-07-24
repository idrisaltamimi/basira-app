use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Deserialize)]
pub struct FileNumber {
    pub number: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Visitor {
    pub id: Thing,
    name: String,
    phone: u32,
    civil_id: Option<u32>,
    gender: String,
    birthdate: Datetime,
    file_number: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct VisitorData {
    pub name: String,
    pub phone: u32,
    pub civil_id: Option<u32>,
    pub gender: String,
    pub birthdate: Datetime,
}
