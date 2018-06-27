const Emitter = require('events').EventEmitter;
const debug = require('debug')('acpr');
const url = require('url');
const Message = require('amp-message');
const Parser = require('amp').Stream;
const net = require('net');

module.exports = class Socket extends Emitter {
    constructor() {
        super();
        this.server = null;
        this.socks = [];
    }
    use(plugin) {
        plugin(this);
        return this;
    }
    closeSocket() {
        this.socks.forEach( sock => {
            sock.destory();
        })
    }
    close(fn) {
        this.closing = true;
        this.closeSocket();
        this.server && this.closeServer(fn);
    }
    closeServer(fn) {
        this.server.on('close', this.emit.bind(this, 'close'));
        this.server.close();
        fn && fn();
    }

    address() {
        if(!this.server) return;
        let addr = this.server.address();
        addr.string = 'tcp://' + addr.address + ':' + addr.port;
        return addr;
    }

    removeSocket(sock) {
        let i = this.socks.indexOf(sock);
        if(!~i) return;
        this.socks.splice(i, 1);
    }
    
    pack(args) {
        let msg = new Message(args);
        return msg.toBuffer();
    }

    addSocket(sock) {
        
        let parser = new Parser;
        this.socks.push(sock);
        sock.pipe(parser);
        parser.on('data', this.onmessage(sock));
    }

    onmessage(sock) {
        
        let self = this;
        return function(buf) {
            var msg = new Message(buf);
            self.emit.apply(self, ['message'].concat(msg.args));
        }
    }

    connect(port, host,  fn) {
        
        let self = this;
        if('server' == this.type) throw new Error('cannot connect() after bind()');
        host = host || '0.0.0.0'
        let sock = new net.Socket;
        sock.setNoDelay();
        this.type = 'client';
        sock.on('close', function() {
            self.emit('socket close', sock);
            self.connect = false;
            self.removeSocket(sock);
            if(self.closing) return self.emit('close');
        })
        sock.on('connect', function() {
            ;
            self.connect = true;
            self.addSocket(sock);
            self.emit('connect', sock);
            fn&&fn();
        })
        sock.connect(port, host);
        return this;
    }

    onconnect(sock) {
        let self = this;
        this.addSocket(sock);
        this.emit('connect', sock);
        sock.on('close', function() {
            self.emit('disconnect', sock);
            self.removeSocket(sock);
        })

    }

    bind(port, host, fn) {
        let self = this;
        if('client' == this.server) throw new Error('cannot bind() after connect()');
        host = host || '0.0.0.0';
        this.server = net.createServer(this.onconnect.bind(this));
        this.server.on('listening', this.emit.bind(this, 'bind'))
        this.server.listen(port, host, fn);
        return this;
    }
}