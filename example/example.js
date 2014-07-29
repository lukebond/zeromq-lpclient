var LPClient = require('../index');

var lpc = new LPClient({url: 'tcp://127.0.0.1:9000', timeout: 2500});

lpc.on('message', function (message) {
  console.log('Got message at ' + Date.now() + ':', message.toString('ascii'));
  setTimeout(function () {
    lpc.ready();
  }, 100);
});
lpc.ready();
