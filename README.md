# zeromq-lpclient

ZeroMQ Reliable Request-Reply Lazy Pirate Pattern - client module

Don't know what this is? See the [0MQ Guide](http://zguide.zeromq.org/page:all#toc89).

## Usage

Use in conjunction with [Lazy Pirate Server](https://github.com/lukebond/zeromq-lpserver) or [Paranoid Pirate Queue](https://github.com/lukebond/zeromq-ppqueue) and [Paranoid Pirate Worker](https://github.com/lukebond/zeromq-ppworker).

### Lazy Pirate example

lpclient.js (taken from https://github.com/lukebond/zeromq-lpclient/blob/master/example/example.js):
```javascript
var LPClient = require('../index');

var lpc = new LPClient({url: 'tcp://127.0.0.1:9000', timeout: 2500});

lpc.on('message', function (message) {
    console.log(Date.now() + ' - Got work:', message.toString('utf8'));
      setTimeout(function () {
            lpc.ready();
              }, 100);
});
lpc.ready();
```

lpserver.js (taken from https://github.com/lukebond/zeromq-lpserver/blob/master/example/example.js):
```javascript
var LPServer = require('../index');

function workerFn(cb) {
    console.log(Date.now() + ' - Got a request for work');
      return cb(JSON.stringify({lpserver: 'pretending to do work'}));
}

var lps = new LPServer({url: 'tcp://127.0.0.1:9000'}, workerFn);

lps.on('error', function (error) {
    console.log('error', error);
      process.exit(1);
});
```

Run both of these together in two different terminals and you should get output like this:

```
$ node lpclient
1406654717202 - Got work: {"lpserver":"pretending to do work"}
1406654717305 - Got work: {"lpserver":"pretending to do work"}
1406654717405 - Got work: {"lpserver":"pretending to do work"}
1406654717507 - Got work: {"lpserver":"pretending to do work"}
1406654717608 - Got work: {"lpserver":"pretending to do work"}
1406654717709 - Got work: {"lpserver":"pretending to do work"}
1406654717810 - Got work: {"lpserver":"pretending to do work"}
1406654717912 - Got work: {"lpserver":"pretending to do work"}
1406654718014 - Got work: {"lpserver":"pretending to do work"}
```

```
$ node lpserver
1406654716237 - Got a request for work
1406654717191 - Got a request for work
1406654717305 - Got a request for work
1406654717405 - Got a request for work
1406654717507 - Got a request for work
1406654717607 - Got a request for work
1406654717708 - Got a request for work
1406654717810 - Got a request for work
1406654717912 - Got a request for work
1406654718013 - Got a request for work
```

### Paranoid Pirate example

For Paranoid Pirate we need three components- the Lazy Pirate client, Paranoid Pirate queue and Paranoid Pirate worker.

ppqueue.js (taken from https://github.com/lukebond/zeromq-ppqueue/blob/master/example/example.js):
```javascript
var PPQueue = require('../index');
var ppq = new PPQueue({backendUrl: 'tcp://127.0.0.1:9001', frontendUrl: 'tcp://127.0.0.1:9000'});
```

ppworker.js (taken from https://github.com/lukebond/zeromq-ppworker/blob/master/example/example.js):
```javascript
var PPWorker = require('../index');

function workerFn(cb) {
    console.log(Date.now() + ' - Got a request for work');
      return cb(JSON.stringify({ppworker: 'pretending to do work'}));
}

var ppw = new PPWorker({url: 'tcp://127.0.0.1:9001'}, workerFn);
```

Run all three together in different terminals and you should get output like this:

```
$ node lpclient
1406655819662 - Got work: {"ppworker":"pretending to do work"}
1406655819766 - Got work: {"ppworker":"pretending to do work"}
1406655819867 - Got work: {"ppworker":"pretending to do work"}
1406655819969 - Got work: {"ppworker":"pretending to do work"}
1406655820071 - Got work: {"ppworker":"pretending to do work"}
1406655820172 - Got work: {"ppworker":"pretending to do work"}
1406655820273 - Got work: {"ppworker":"pretending to do work"}
1406655820374 - Got work: {"ppworker":"pretending to do work"}
1406655820476 - Got work: {"ppworker":"pretending to do work"}
```

```
$ node ppqueue
```
_(no output)_

```
$ node ppworker
1406655819650 - Got a request for work
1406655819765 - Got a request for work
1406655819867 - Got a request for work
1406655819969 - Got a request for work
1406655820071 - Got a request for work
1406655820172 - Got a request for work
1406655820272 - Got a request for work
1406655820374 - Got a request for work
1406655820476 - Got a request for work
```

The Paranoid Pirate queue is routing the request-reply pairs between the client and the worker.
