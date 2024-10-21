const RPC = require('discord-rpc');
const clientId = '1265144300404998186'; // Replace with your actual client ID

const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  console.log('Discord RPC is ready!');
  rpc.setActivity({
    details: 'Managing patrols in the game',
    state: 'Playing Patrol Manager',
    startTimestamp: new Date(),
    largeImageText: 'Large Image Text',
    smallImageText: 'Small Image Text',
    partySize: 1,
    partyMax: 5,
    instance: true,
  });
});

rpc.login({ clientId }).catch(console.error);

// Start an HTTP server to keep the process alive
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Discord RPC server is running');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
