exports.types = {
    'push': require('./lib/push'),
    'pull': require('./lib/pull')
}

exports.socket = function(type) {
    let fn = exports.types[type];
    if (fn) return new fn()
}