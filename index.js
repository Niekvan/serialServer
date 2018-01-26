'use strict'

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.port || 3000

var Scanner = require('./scanner')
var scanner = new Scanner()
var SerialPort = require('serialport')

app.get('/', (req,res) => {
  res.json({message: 'Welcome to the local socket'})
})

http.listen(port, () => {
  console.log("listening on localhost:", port)
})

console.log('start scanning')
scanner.start()

scanner.on('connectionFound', (response) => {
  scanner.stop()
  console.log(response)
  var serialPort = new SerialPort(response.port, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\n')
  })

  serialPort.on('open', () => {
    console.log('We have an open port!')
  })

  serialPort.on('data', (data) => {
    console.log('We have a message: ', data)
  })

  serialPort.on('close', () => {
    console.log('There goes the connection...')
  })
})
