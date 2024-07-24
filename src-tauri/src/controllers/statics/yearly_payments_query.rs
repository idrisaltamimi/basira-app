use crate::{connect::database, utils::get_month_ranges_for_current_year};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use surrealdb::Response;
use tokio::runtime::Runtime;

#[derive(Debug, Deserialize, Serialize)]
pub struct MonthlyPayment {
    month: u8,
    products: Vec<f64>,
    salaries: Vec<f64>,
    visits: Vec<f64>,
    expenses: Vec<f64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MonthlyPaymentSummary {
    month: u8,
    products: f64,
    salaries: f64,
    visits: f64,
    expenses: f64,
}

pub fn yearly_payments_summary() -> Result<Vec<MonthlyPaymentSummary>> {
    let rt = Runtime::new()?;
    rt.block_on(async {
        let db = database().await?;
        let month_ranges = get_month_ranges_for_current_year();
        let mut monthly_sums = Vec::new();

        for (index, (start_of_month, end_of_month)) in month_ranges.iter().enumerate() {
            let sql = format!(
                "SELECT 
                    time::month(created_at) AS month,
                    array::group(IF category = 'products' THEN amount ELSE 0 END) AS products,
                    array::group(IF category = 'salaries' THEN amount ELSE 0 END) AS salaries,
                    array::group(IF category = 'visits' THEN amount ELSE 0 END) AS visits,
                    array::group(IF category = 'expenses' THEN amount ELSE 0 END) AS expenses
                FROM payment
                WHERE created_at >= '{}' AND created_at <= '{}' GROUP BY month",
                start_of_month, end_of_month
            );
            let mut response: Response = db.query(&sql).await?;
            let results: Vec<MonthlyPayment> = response.take(0)?;

            if results.is_empty() {
                monthly_sums.push(MonthlyPaymentSummary {
                    month: (index + 1) as u8,
                    products: 0.0,
                    salaries: 0.0,
                    visits: 0.0,
                    expenses: 0.0,
                });
            } else {
                for result in results {
                    let products_sum = result.products.iter().sum::<f64>();
                    let salaries_sum = result.salaries.iter().sum::<f64>();
                    let visits_sum = result.visits.iter().sum::<f64>();
                    let expenses_sum = result.expenses.iter().sum::<f64>();

                    monthly_sums.push(MonthlyPaymentSummary {
                        month: result.month,
                        products: products_sum,
                        salaries: salaries_sum,
                        visits: visits_sum,
                        expenses: expenses_sum,
                    });
                }
            }
        }

        Ok(monthly_sums)
    })
}

#[tauri::command]
pub fn get_yearly_payments_summary() -> Result<Vec<MonthlyPaymentSummary>, String> {
    match yearly_payments_summary() {
        Ok(payment_summary) => Ok(payment_summary),
        Err(err) => Err(err.to_string()),
    }
}
