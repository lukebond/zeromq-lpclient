var LPClient = require('../index');

var lpc = new LPClient({url: 'tcp://127.0.0.1:9000', timeout: 2500});

lpc.on('message', function (message) {
  console.log(Date.now() + ' - Got work:', message.toString('utf8'));
  setTimeout(function () {
    lpc.ready();
  }, 100);
});
lpc.ready();
