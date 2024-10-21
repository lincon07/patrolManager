import { Command } from "@tauri-apps/plugin-shell";

export function startDiscordRPCServer() {
    const command = Command.sidecar('node', ['server.js']); // Make sure `server.js` is located correctly
  
    command.spawn()
      .then(() => {
        console.log('Discord RPC server started');
      })
      .catch((error) => {
        console.error('Failed to start Discord RPC server:', error);
      });
  }

