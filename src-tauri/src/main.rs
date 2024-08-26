// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod connect;
mod controllers;
mod structs;
mod utils;

use controllers::{auth, medical_record, payment, product, salary, statics, visit, visitor};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Visitor Queries
            visitor::create_visitor_query::create_visitor,
            visitor::get_visitors_query::get_visitors,
            visitor::get_visitor_query::get_visitor,
            visitor::update_visitor_query::update_visitor,
            // Visit Queries
            visit::create_visit_query::create_visit,
            visit::get_visits_query::get_visits,
            visit::get_visit_query::get_visit,
            visit::update_visit_query::update_visit,
            visit::get_visits_history_query::get_visits_history,
            visit::get_selected_visit_query::get_selected_visit,
            visit::close_visit_query::close_visit,
            visit::delete_visit_query::delete_visit,
            // Payment Queries
            payment::create_payment_query::create_payment,
            payment::create_payment_item_query::create_payment_item,
            payment::create_products_payment::create_products_payments,
            payment::update_payment_query::update_payment,
            payment::delete_payment_query::delete_payment,
            payment::get_payments_query::get_payments,
            payment::get_payment_items_query::get_payment_items,
            payment::get_payments_count_query::get_payments_count,
            payment::delete_payment_item_query::delete_payment_item,
            // Statics Queries
            statics::last_month_visits_count_query::last_month_visits_count,
            statics::latest_visit_query::latest_visit,
            statics::last_month_total_query::last_month_total,
            statics::last_month_payments_query::last_month_payments,
            statics::yearly_visits_query::get_yearly_visits,
            statics::yearly_payments_query::get_yearly_payments_summary,
            // Medical Record Queries
            medical_record::create_record_query::create_record,
            medical_record::get_record_query::get_record,
            medical_record::update_record_query::update_record,
            // Auth Queries
            auth::signin_query::signin,
            auth::signup_query::signup,
            auth::get_user_query::get_user,
            auth::get_users_query::get_users,
            auth::update_user_query::update_user,
            auth::signout_query::signout,
            auth::update_user_status_query::update_user_status,
            // Salary Query
            salary::create_salary_query::create_salary,
            salary::get_salary_query::get_salary,
            // Product Query
            product::get_product_query::get_product,
            product::create_product_query::create_product,
            product::update_product_query::update_product,
            product::delete_product_query::delete_product,
            product::update_products_quantity_query::update_products_quantity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
