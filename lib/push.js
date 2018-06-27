const Socket = require('./socket');
module.exports = class PullSocket extends Socket {
    constructor() {
        super();
        this.n = 0;
    }
    send() {

        let socks = this.socks;
        let len = this.socks.length;
        
        let sock = socks[this.n++ % len];

        let msg = [...arguments];
        if(sock && sock.writable) {
            sock.write(this.pack(msg));
        }
    }
}