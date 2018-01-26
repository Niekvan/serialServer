var SerialPort = require('serialport')
var EventEmitter = require('events').EventEmitter
var util = require('util')

var Scanner = function(opts) {
  let self = this

  EventEmitter.call(self)

  this.search = function() {
    SerialPort.list().then((ports, err) => {
      if (err || ports.length === 0) {
        return
      }
      ports.some(port => {
        var matched = true
        self.emit('connectionFound', {
          port: port.comName,
          message: 'Serial device found at port: ' + port.comName + '.'
        })
        return matched
      })
    })
  }
}

util.inherits(Scanner, EventEmitter)

Scanner.prototype.start = function(interval) {
  interval = interval || 500

  var self = this

  self.searchInterval = setInterval(function() {
    self.search()
  }, interval)
}

Scanner.prototype.stop = function() {
  var self = this

  if(self.searchInterval) {
    clearInterval(self.searchInterval)
  }
}

module.exports = Scanner
