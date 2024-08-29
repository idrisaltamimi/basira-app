use anyhow::{anyhow, Result};
use surrealdb::Response;

use crate::{connect::database, structs::visit::Visit};

#[tokio::main]
pub async fn delete_visit_query(visit_id: String) -> Result<()> {
    let db = database().await?;

    let sql = format!(
        "SELECT * FROM visit WHERE id = '{}' AND is_open = true",
        visit_id
    );
    let mut visit_response: Response = db.query(sql).await?;
    let visit_result: Option<Visit> = visit_response.take(0)?;

    if let Some(visit) = visit_result {
        if let Some(_doctor) = visit.doctor {
            let sql = format!("UPDATE visit SET is_open = false WHERE id = '{}'", visit_id);
            let _response: Response = db.query(sql).await?;
        } else {
            let sql = format!("DELETE visit WHERE id = '{}'", visit_id);
            let _response: Response = db.query(sql).await?;
            let sql = format!("DELETE image WHERE visit = '{}'", visit_id);
            let _response: Response = db.query(sql).await?;
        }
    } else {
        return Err(anyhow!("حدث خطأ ما حاول مرة أخرى"));
    }

    Ok(())
}

#[tauri::command]
pub fn delete_visit(visit_id: String) -> Result<(), String> {
    match delete_visit_query(visit_id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
