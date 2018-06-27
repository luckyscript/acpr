let acpr = require('../index');
let sock = acpr.socket('pull');

sock.connect(5000);
console.log('pull server started')

sock.on('message', function(ms) {
    console.log(ms.toString())
})


