use serde::{Deserialize, Serialize};
use surrealdb::sql::{Datetime, Thing};

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub id: Thing,
    pub name: String,
    pub password: String,
    pub email: String,
    pub role: String,
    pub phone: String,
    pub civil_id: u32,
    pub gender: String,
    pub birthdate: Datetime,
    pub is_active: bool,
    pub login_at: Option<Datetime>,
    pub logout_at: Option<Datetime>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UserData {
    pub name: String,
    pub password: String,
    pub email: String,
    pub role: String,
    pub phone: String,
    pub civil_id: u32,
    pub gender: String,
    pub birthdate: Datetime,
}
