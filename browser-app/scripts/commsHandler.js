/*
/ Holds info about the connection to the server
/ Manages connection to a partner
/ Manages sending and receiving messages from partner
*/

class CommsHandler{
  constructor(){
    // Connects to server for comms        //  DO NOT EDIT!!!
    this.socket = io.connect('https://arduino-comms.herokuapp.com/');
    //this.socket = io.connect('http://localhost:3020');

    this.socket.on('foundPartner', this.foundPartner);
    this.socket.on('wrongWord', this.wrongWord);
    this.socket.on('waiting', this.waiting);
    this.socket.on('receiveMessage', this.receiveMessage);
    this.socket.on('yourPartnerDisconnected', this.partnerDisconnected);
    this.socket.on('flushed', this.flushed);
    this.socket.on('sendGroups', this.receivedGroups);
    this.socket.on('addedToGroup', this.addedToGroup);
    this.socket.on('groupChanged', this.groupChanged);

    // Once a connection is made
    this.myID = 0;
    this.partnerID = 0;
    this.type = "partner";

    this.groupName = "";
    this.controller = false;

    // Manages the wait for a partner
    this.waitStarted = 0;
    this.tryNumber = 0;  // Needed these otherwise we get multiple
    this.latestTry = 0;  // wait loops running
    this.stillWaiting = false;

    this.lastMessage = "";

    this.findGroups();
  }

  requestPartner(data){
    // Data is pulled from HTML elements in commsUI
    this.socket.emit('requestPartner', data);
  }

  findGroups(){
    this.socket.emit('findGroups');
  }

  receivedGroups(data){
    let groups = data.groups;

    if (groups.length > 0){
      $("#groupSettings").show();
      $("#groupBlank").html("");

      for (let group of groups){
        $("#groupSelect").append("<option value='" + group.name + "'>" + group.name + "</option>")
      }
    }
  }

  requestGroup(data){
    // Data is pulled from HTML elements in commsUI
    this.socket.emit('requestGroup', data);
  }

  addedToGroup(data){
    $("#pairingSetup").hide();
    $("#grouped").show();
    $("#myID").html(data.id);
    comms.myID = data.id;
    comms.groupName = data.group;
    comms.groupIndex = data.groupIndex;

    comms.type = "group";
    if (comms.myID == data.controller){
      comms.controller = true;
      $("#toSend").show();
      $("#fromGroup").hide();
    }
    else{
      comms.controller = false;
      $("#toSend").hide();
      $("#fromGroup").show();
    }
  }

  groupChanged(data){
    $("#groupIDs").html("");
    if (data.members.length == 1){
      $("#groupIDsHeader").html(data.members.length + " Group Member:");
    }
    else{
      $("#groupIDsHeader").html(data.members.length + " Group Members:");
    }
    for (let member of data.members){
      $("#groupIDs").append(member);
      $("#groupIDs").append(" <br> ");
    }
    if (data.controller == ""){
      $("#groupController").html("None");
    }
    else{
      if (comms.controller){
        $("#groupController").html("You are the controller");
      }
      else{
        $("#groupController").html(data.controller);
      }
    }
  }

  sendMessage(message){
    if (this.partnerID != 0){
      // Message is pulled from HTML element in commsUI
      let data = {
        partnerID: this.partnerID,
        message: message,
      }

      this.socket.emit('sendMessage', data);
    }
  }

  sendGroupMessage(message){
    if (this.controller){
      // Message is pulled from HTML element in commsUI
      let data = {
        message: message,
        group: this.groupName,
        groupIndex: this.groupIndex
      }

      this.socket.emit('sendGroupMessage', data);
    }
  }

  flushed(){
    $("#pairingSetup").show();
    $("#paired").hide();
    $("#disconnectedMessage").show();
    $("#disconnectedMessage").html("Disconnected from server (flush),<br> try again...");
    $("#message").html("");
    comms.stillWaiting = false;
  }

  partnerDisconnected(data){
    this.partnerID = 0;

    $("#pairingSetup").show();
    $("#paired").hide();
    $("#disconnectedMessage").show();
    $("#disconnectedMessage").html("Your partner disconnected, try again...");
    $("#message").html("");
  }

  foundPartner(data){
    // We found our partner on the server!

    //console.log(data);

    // Save some info about the connection.
    // We don't really need our own ID except
    // so we can manually double check it with our partner.
    // We need the partnerID to tell the server who to send our messages to.
    // The server holds matches only so that disconnects can be communicated to the partner.
    comms.myID = data.myid;
    comms.partnerID = data.partnerID;

    // End the wait loop.
    comms.stillWaiting = false;

    // so we know how to send messages
    comms.type = "partner";

    // Should move this to a commsUI object.
    $("#errorMessage").html("");
    $("#pairingSetup").hide();
    $("#paired").show();
    $("#myID").html(data.myid);
    $("#partnerID").html(data.partnerID);
    $("#mismatchMessage").html("");
    $("#message").html("");
  }

  receiveMessage(data){
    // Should move this to a commsUI object
    $("#messageReceived").html(data.message);
    if (data.message != comms.lastMessage){
      sendToArduino(data.message);
      comms.lastMessage = data.message;
    }
  }

  wrongWord(data){
    $("#mismatchMessage").html("Secret word doesn't match." +
                              "<br> Try again...");
  }

  waiting(data){
    // Should move this to commsUI object
    $("#errorMessage").html("");
    $("#message").html("Waiting to find your partner...");

    comms.tryNumber++;
    comms.latestTry++;
    comms.waitStarted = 0;  // To track how long we've been waiting so we can end it
                                    // if it takes too long.

    comms.stillWaiting = true; // So we can end it when partner is found
    comms.waitLoop(comms.tryNumber);
  }

  waitLoop(tryNumber){
    if (tryNumber == comms.latestTry && comms.stillWaiting){
      // Should move this to commsUI object
      $("#message").html("Waited for " + comms.waitStarted + " seconds");
      if (comms.waitStarted > 60){
        // Should move this to commsUI object
        $("#errorMessage").html("Waited for 60 seconds and couldn't find partner." +
                                "<br> Removing you from the waitlist. Try again when ready.");
        $("#message").html("");
        $("#mismatchMessage").html("");

        // Send a message to the server to say we've given up here
        // *******
        // *******
        // *******
      }
      else{
        comms.waitStarted++;
        setTimeout(function() {
                comms.waitLoop(tryNumber);
        }, 1000);
      }
    }
  }
}

var comms = new CommsHandler();
