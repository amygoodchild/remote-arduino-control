/*
/ Handles serial communication between the arduino and the browser
*/

// Replace this with your own port
const ARDUINO_PORT = "COM8";

class ArduinoHandler{
  constructor(){
    this.connected=false;
    this.serial = new p5.SerialPort();
    this.latestData = "waiting for data";
    this.serial.list();
    this.serial.open(ARDUINO_PORT);
    this.serial.on('connected', serverConnected);
    this.serial.on('list', gotList);
    //this.serial.on('data', gotData);
    this.serial.on('error', gotError);
    this.serial.on('open', gotOpen);
    this.serial.on('close', gotClose);

    this.readDelay = 70;
    this.lerpAmount = 0;
    this.reading = "";


    setTimeout(function() {
            readData();
        }, 4000);
  }
}

function readData(){
  if (arduinoHandler.connected){
    arduinoHandler.reading = arduinoHandler.serial.serialBuffer[arduinoHandler.serial.serialBuffer.length-1];

    if (arduinoHandler.reading){
      //console.log(reading);
      $("#arduinoReceived").html(arduinoHandler.reading);

      let message = arduinoHandler.reading;
      if (comms.type == "partner"){
        comms.sendMessage(message);
      }
      else{
        if (comms.controller){
          comms.sendGroupMessage(message);
        }
      }
    }
  }

  setTimeout(function() {
          readData();
      }, arduinoHandler.readDelay);

}

function sendToArduino(message){
  if (message != null && arduinoHandler.connected){
    //console.log("sending to arduino: " + message);
    //console.log("sending to arduino int: " + parseInt(message));

    arduinoHandler.serial.write(parseInt(message));
  }
}

function serverConnected() {
 console.log("Connected to serial server for arduino comms");
 $("#arduinoStatus").html("Connected");
 $("#arduinoMessageSection").show();
 arduinoHandler.connected = true;
}

function gotList(thelist) {
 console.log("List of Serial Ports:");

 for (let i = 0; i < thelist.length; i++) {
  console.log(i + " " + thelist[i]);
 }
}

function gotOpen() {
 console.log("Serial Port is Open");
}

function gotClose(){
 console.log("Serial Port is Closed");
 latestData = "Serial Port is Closed";
 $("#arduinoStatus").html("Serial Port is Closed");
 $("#arduinoMessageSection").hide();
}

function gotError(theerror) {
 console.log(theerror);
  $("#arduinoStatus").html(theerror);
  $("#arduinoMessageSection").hide();
}

function gotData() {
 let currentString = arduinoHandler.serial.readLine();
 console.log(arduinoHandler.serial.serialBuffer[arduinoHandler.serial.serialBuffer.length-1]);
}


var arduinoHandler = new ArduinoHandler();
