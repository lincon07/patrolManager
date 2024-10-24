// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use discord_rpc_client::{Client, Event};
use tauri::command;
use std::sync::{Arc, Mutex};

// Define the shared state to hold the Discord RPC client
struct AppState {
    drpc: Arc<Mutex<Client>>,
}

fn main() {
    // Create the Discord RPC client
    let drpc = Arc::new(Mutex::new(Client::new(1265144300404998186)));

    // Register event handlers
    {
        let drpc = drpc.clone();
        drpc.lock().unwrap().on_ready(|_ctx| {
            println!("Discord RPC is ready.");
        });

        drpc.lock().unwrap().on_event(Event::Ready, |_ctx| {
            println!("READY event received!");
        });
    }

    // Start the client connection
    drpc.lock().unwrap().start();

    // Initialize the Tauri application with the shared state
    tauri::Builder::default()
        .manage(AppState { drpc })
        .invoke_handler(tauri::generate_handler![update_discord_status, clear_discord_status])
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}

// Tauri command to update Discord Rich Presence
#[command]
fn update_discord_status(state: tauri::State<AppState>, department: String, server: String) {
    let state_message = format!("Patrolling as {} in {}", department, server);

    // Lock the Mutex and make `drpc` mutable
    let mut drpc = state.drpc.lock().unwrap();
    drpc.set_activity(|act| act.state(state_message))
        .expect("Failed to set activity");
}

// Tauri command to clear Discord Rich Presence
#[command]
fn clear_discord_status(state: tauri::State<AppState>) {
    // Lock the Mutex and clear the activity
    let mut drpc = state.drpc.lock().unwrap();
    drpc.clear_activity().expect("Failed to clear activity");
}
