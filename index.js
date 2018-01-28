// Server stuff
'use strict'
const app = require('express')()
const http = require('http').Server(app)
const port = process.env.port || 4000

// Serial setup
var Scanner = require('./scanner')
var scanner = new Scanner()
var SerialPort = require('serialport')

//socket setup
var socket = require('socket.io-client')('https://socketserver-jthgqfcduq.now.sh')

app.get('/', (req,res) => {
  res.json({message: 'Welcome to the local socket'})
})

// Run server
http.listen(port, () => {
  console.log("listening on localhost:", port)
})

// Start scanning for serial devices
console.log('start scanning')
scanner.start()

scanner.on('connectionFound', (response) => {
  scanner.stop()
  console.log(response.message)

//Open new serial port
  var serialPort = new SerialPort(response.port, {
    baudRate: 9600
  })

  var Readline = SerialPort.parsers.Readline
  var parser = new Readline()

  serialPort.pipe(parser)

  serialPort.on('open', () => {
    console.log('We have an open port!')
  })

  parser.on('data', (data) => {
    console.log('We have a message: ', data)
    socket.emit('arduino-message', data)
  })

  socket.on('arduino-cmd', cmd => {
    serialPort.write(cmd)
  })

  serialPort.on('close', () => {
    console.log('There goes the connection...')
    console.log('Looking for new device')
    scanner.start()
  })
})

// Socket setup
socket.on('connect', () => {
  console.log('Websocket connection with id: ' , socket.id)
  socket.emit('new-message', 'hi from the server at port :' + port)
})

socket.on('message', msg => {
  console.log(msg)
})
