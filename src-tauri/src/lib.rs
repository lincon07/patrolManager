// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import necessary crates
use tauri::{Manager};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build()) // Adds updater plugin
        .plugin(tauri_plugin_shell::init()) // Adds shell plugin
        .invoke_handler(tauri::generate_handler![greet]) // Sets up command handler
        .run(tauri::generate_context!()) // Starts the Tauri application
        .expect("Error while running Tauri application");
}
