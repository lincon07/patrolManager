// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use discord_rpc_client::{Client, Event};
use std::{env, thread, time};
use std::convert::TryInto;

// Function to run the Discord RPC setup
pub fn run_discord_rpc() {
    // Retrieve the state message from the command line arguments
    let state_message = env::args().nth(1).unwrap_or_else(|| "Roaming in Server 3 as SAHP".to_string());

    // Initialize the Discord RPC client
    let mut drpc = Client::new(1265144300404998186);

    // Register event handlers
    drpc.on_ready(|_ctx| {
        println!("Discord RPC is ready!");
    });

    drpc.on_event(Event::Ready, |_ctx| {
        println!("READY event received!");
    });

    // Start the Discord RPC client
    drpc.start();

    // Get the current timestamp
    let start_time = time::SystemTime::now()
        .duration_since(time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs();

    // Set the activity status with the provided state message and start timestamp
    drpc.set_activity(|act| {
        act.state(&state_message)
        .details("Runing Radar")
        .timestamps(|ts| ts.start(start_time.try_into().unwrap()))
        
    })
    .expect("Failed to set activity");

    // Keep the thread alive to maintain the Discord RPC connection
    loop {
        // Sleep for some time to avoid busy waiting
        thread::sleep(time::Duration::from_secs(10));
    }
}
