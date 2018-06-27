const Socket = require('./socket');
module.exports = class PullSocket extends Socket {
    constructor() {
        super();
    }
    send() {
        throw new Error('Pull should not send messages');
    }
}