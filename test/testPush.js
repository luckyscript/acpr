let acpr = require('../index');
let sock = acpr.socket('push');

sock.bind(5000);
console.log('push server started')

setInterval(function() {
    sock.send('hello world')
}, 1000)


