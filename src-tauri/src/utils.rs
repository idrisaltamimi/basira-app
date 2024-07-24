use chrono::prelude::*;
use chrono::{Datelike, NaiveDate, Utc};

pub fn get_current_month_range() -> (String, String) {
    let now = Utc::now();
    let first_day_current_month = now.with_day(1).unwrap(); // First day of the current month

    let first_day_current_month_str = first_day_current_month
        .format("%Y-%m-%dT00:00:00Z")
        .to_string();

    let now_str = now.format("%Y-%m-%dT23:59:59Z").to_string();

    (first_day_current_month_str, now_str)
}

pub fn get_current_year_range() -> (String, String) {
    let now = Utc::now();
    let first_day_current_year = Utc.ymd(now.year(), 1, 1); // First day of the current year
    let last_day_current_year = Utc.ymd(now.year(), 12, 31); // Last day of the current year

    let first_day_current_year_str = first_day_current_year
        .format("%Y-%m-%dT%H:%M:%SZ")
        .to_string(); // Start of current year
    let last_day_current_year_str = last_day_current_year
        .format("%Y-%m-%dT%H:%M:%SZ")
        .to_string(); // End of current year

    (first_day_current_year_str, last_day_current_year_str)
}

pub fn get_month_ranges_for_current_year() -> Vec<(String, String)> {
    let current_year = Utc::now().year();
    let mut month_ranges = Vec::new();

    for month in 1..=12 {
        let first_day = NaiveDate::from_ymd_opt(current_year, month, 1)
            .expect("Invalid date for first day of month");

        let last_day = if month == 12 {
            NaiveDate::from_ymd_opt(current_year + 1, 1, 1)
                .expect("Invalid date for first day of next year")
                .pred_opt()
                .expect("Invalid date for last day of December")
        } else {
            NaiveDate::from_ymd_opt(current_year, month + 1, 1)
                .expect("Invalid date for first day of next month")
                .pred_opt()
                .expect("Invalid calculation for last day of the month")
        };

        month_ranges.push((
            first_day.format("%Y-%m-%dT00:00:00Z").to_string(),
            last_day.format("%Y-%m-%dT23:59:59Z").to_string(),
        ));
    }

    month_ranges
}
