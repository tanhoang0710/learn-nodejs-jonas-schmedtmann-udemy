const http = require('http');
const EventEmitter = require('events');

class Sales extends EventEmitter {
	constructor() {
		super();
	}
}
const myEmitter = new Sales();

myEmitter.on('newSale', () => {
	console.log('There was a new sale');
});

myEmitter.on('newSale', () => {
	console.log('Costumer name: Tan');
});

myEmitter.on('newSale', (stock) => {
	console.log(`There are now ${stock} imtes lefts in stock`);
});

myEmitter.emit('newSale', 9);

////////////////

const server = http.createServer();
server.on('request', (req, res) => {
	console.log('Request received');
	res.end('Request received');
});

server.on('request', (req, res) => {
	console.log('Another request');
});

server.on('close', () => {
	console.log('server close');
});

server.listen(8000, '127.0.0.1', () => {
	console.log('waiting for request');
});
