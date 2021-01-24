/*
/ Watches for button clicks and stuff
*/


$(document).ready(function(){

  $("#readDelay").change(function(){
    $("#readDelayOutput").html($("#readDelay").val());
    arduinoHandler.readDelay = $("#readDelay").val();
  });

  $("#lerpValues").change(function(){
    $("#lerpValuesOutput").html($("#lerpValues").val());
    arduinoHandler.lerpAmount = $("#lerpValues").val();

  });


  $("#team").change(function(){
    if ($("#team").val() != "Select" && $("#secretWord").val() != ""){
      $("#findPartner_button").prop('disabled', false);
    }
    else{
      $("#findPartner_button").prop('disabled', true);
    }
  });

  $("#secretWord").keyup(function(){
    if ($("#team").val() != "Select" && $("#secretWord").val() != ""){
      $("#findPartner_button").prop('disabled', false);
    }
    else{
      $("#findPartner_button").prop('disabled', true);
    }
  });

  $("#groupSecretWord").keyup(function(){
    if ($("#groupSelect").val() != "Select" && $("#groupSecretWord").val() != ""){
      $("#groupConnect_button").prop('disabled', false);
    }
    else{
      $("#groupConnect_button").prop('disabled', true);
    }
  });

  $("#groupSelect").change(function(){
    if ($("#groupSelect").val() != "Select" && $("#groupSecretWord").val() != ""){
      $("#groupConnect_button").prop('disabled', false);
    }
    else{
      $("#groupConnect_button").prop('disabled', true);
    }
  });

  $("#findPartner_button").click(function(){
    let data = {
      team: $("#team").val(),
      secretWord: $("#secretWord").val(),
      room: "oneToOne"
    }
    comms.requestPartner(data);
  });

  $("#groupConnect_button").click(function(){
    let data = {
      name: $("#groupSelect").val(),
      secretWord: $("#groupSecretWord").val(),
      room: "group",
      controller: $("#senderCheckbox").is(":checked")
    }
    comms.requestGroup(data);
  });

  $("#sendMessage_button").click(function(){
    let message = $("#messageToSend").val();
    console.log(message);
    comms.sendMessage(message);
  });

  $("#sendGroupMessage_button").click(function(){
    let message = $("#messageToSend").val();
    console.log(message);
    comms.sendGroupMessage(message);
  });

});
