use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::{sql::Thing, Response};

use crate::{
    connect::database,
    structs::payment::{CreatePaymentData, OriginalPayment},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub name: String,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatedProduct {
    pub product_id: String,
    pub count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentItem {
    pub visit_id: String,
    pub items: Vec<Item>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentId {
    pub id: Thing,
}

#[tokio::main]
pub async fn create_payments_query(
    payment_data: CreatePaymentData,
    payment_items: PaymentItem,
    updated_products: Vec<UpdatedProduct>,
) -> Result<()> {
    let db = database().await?;
    let mut payment_id: Option<Thing> = None;

    // Check for an existing payment
    let check_sql = format!(
        "SELECT * FROM payment WHERE visit = {};",
        &payment_data.visit_id
    );
    let mut payment_response: Response = db.query(&check_sql).await?;
    let existing_payment: Option<PaymentId> = payment_response.take(0)?;

    if let Some(existing_payment) = existing_payment {
        payment_id = Some(existing_payment.id);
    } else {
        let create_sql = format!(
            "CREATE payment SET 
                payment_type = $payment_type, 
                name = $name, 
                category = $category, 
                amount = $amount, 
                payment_method = $payment_method, 
                pending = $pending, 
                created_at = time::now(),
                visit = {};",
            &payment_data.visit_id
        );
        let mut response: Response = db
            .query(&create_sql)
            .bind(("payment_type", &payment_data.payment_type))
            .bind(("name", &payment_data.name))
            .bind(("category", "products".to_string()))
            .bind(("amount", &payment_data.amount))
            .bind(("payment_method", &payment_data.payment_method))
            .bind(("pending", &payment_data.pending))
            .await?;
        let new_payment: Option<OriginalPayment> = response.take(0)?;
        if let Some(new_payment) = new_payment {
            payment_id = Some(new_payment.id);
        }
    }

    if let Some(payment_id) = payment_id {
        for item in payment_items.items {
            let sql = format!(
                "CREATE payment_item SET 
                    name = '{}', 
                    visit = '{}', 
                    payment = {}, 
                    amount = {}
                ",
                item.name, payment_items.visit_id, payment_id, item.amount
            );
            let mut _response: Response = db.query(&sql).await?;
        }

        for product in updated_products {
            let sql = format!(
                "UPDATE product SET quantity -= {}, sales += {} WHERE id = '{}'",
                product.count, product.count, product.product_id
            );
            let mut _response: Response = db.query(&sql).await?;
        }
    } else {
        return Err(anyhow::anyhow!("Failed to create or retrieve payment"));
    }

    Ok(())
}

#[tauri::command]
pub fn create_products_payments(
    payment_data: CreatePaymentData,
    payment_items: PaymentItem,
    updated_products: Vec<UpdatedProduct>,
) -> Result<(), String> {
    match create_payments_query(payment_data, payment_items, updated_products) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
