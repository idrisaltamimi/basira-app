use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Serialize, Deserialize)]
pub struct VisitImage {
    pub id: Thing,
    pub image: String,
    pub visit: Thing,
}
