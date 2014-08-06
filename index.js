var zmq = require('zmq'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var LPClient = function (options) {
  this.PPP_READY = new Buffer([1]);

  this.url = options.url;
  this.identity = options.identity || 'lpc-' + process.pid;
  this._initSocket();

  this.retryCount = 0;
  this.maxRetries = options.maxRetries || 3;
  this.timeout = options.timeout || 2500;
  this.timerId = -1;

  this._initHandler();

  this.socket.on('error', function (err) {
    this.emit('error', err);
  }.bind(this));
};

util.inherits(LPClient, EventEmitter);

LPClient.prototype._handleMessage = function (msg) {
  this.awaitingReply = false;
  clearTimeout(this.timerId);
  this.timerId = -1;
  this.retryCount = 0;
  this.emit('message', msg);
};

LPClient.prototype._initSocket = function () {
  this.socket = zmq.socket('req');
  this.socket.identity = this.identity;
  this.socket.connect(this.url);
  this.awaitingReply = false;
};

LPClient.prototype._initHandler = function () {
  this.socket.on('message', this._handleMessage.bind(this));
};

LPClient.prototype._retry = function () {
  if (++this.retryCount > this.maxRetries) {
    this.emit('error', new Error('No reply after ' + this.maxRetries + ' retries. Giving up.'));
  }
  else {
    this.socket.close();
    this._initSocket();
    this._initHandler();
    this.ready();
  }
};

LPClient.prototype.ready = function () {
  if (this.awaitingReply) {
    return;
  }
  this.awaitingReply = true;
  this.socket.send(this.PPP_READY);
  this.timerId = setTimeout(this._retry.bind(this), this.timeout);
};

LPClient.prototype.close = function () {
  clearTimeout(this.timerId);
  this.socket.close();

  // Ensure that zmqs socket is actually closed before emitting.
  setImmediate(function () {
    this.emit('close');
  }.bind(this));
};

module.exports = LPClient;
