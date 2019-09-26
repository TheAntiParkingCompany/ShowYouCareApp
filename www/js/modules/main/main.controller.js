(function () {

  'use strict';

  var app = angular.module('main' );
  app.controller('mainCtrl', mainCtrl);
  mainCtrl.$inject = [ '$scope', 'pushSrvc', '$http', 'locationsSrvc' ];//imports services

  function mainCtrl( $scope, pushSrvc, $http, locationsSrvc ) {
    //initialises variables
    var vm = angular.extend(this, { });
    var lat;  //latitude
    var lon;  //longitude
    var myLocation=new Object(); //creates location object
    var postcode; //postcode
    vm.locationSlider=false;
    vm.postcodeValidator = locationsSrvc.POSTCODE_VALIDATION_REGEX;//postcode format validator
    vm.locationenabled=false;
    vm.MESSAGE_TIMEOUT_SECONDS = 10;
    var locationenabled=false; //check if we need this later
    vm.pushConnected = false;//sets the push notifaciton connection variable to false

    vm.inbound = {
      data: { },
      rendered: "No messages yet."
    };

    vm.subscriptionFeedback = "";

    vm.initialise = function initialise() {
      sliderCheck();
      

      vm.inbound.rendered = "No registrationId yet...";


      pushSrvc.initialisePush( function deviceNowConnected( data ){
        console.log("Controller initialised push, got payload ",data );

        vm.inbound.rendered = "Got connected payload";

        if (data.hasOwnProperty('registrationId')===true) {

          vm.registrationId = data.registrationId;
          vm.pushConnected = true;

          pushSrvc.setCallback( vm.handleInbound );
          pushSrvc.setTimeout( vm.MESSAGE_TIMEOUT_SECONDS * 1000 );

        }

      });

    };

    const checkbox = document.getElementById('myonoffswitch')

    checkbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        console.log('checked')
        vm.locationSlider=true;
        locationcheck();
      } else {
        console.log('not checked')
        vm.locationSlider=false;
      }
      console.log(vm.locationSlider);
    })

    document.addEventListener("resume", onResume, false);

    function onResume() {
        // Handle the resume event
        sliderCheck();
        
    }

    function sliderCheck() {
      cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
        vm.locationenabled=enabled;
        if (vm.locationenabled==false)
        {
          checkbox.checked=false;
        }
        else{
          checkbox.checked=true;
        }
      }, function(error){
        console.error("The following error occurred: "+error);
      });
  }



    vm.settingsopen=false;
function waitThenSettings(){
  console.log("settings things");
  /* if(vm.settingsopen==false)
  { */
  cordova.plugins.diagnostic.switchToLocationSettings();
  //vm.settingsopen=true;

  

  //}
}
vm.waitThenSettings = function waitThenSettings(){
  sliderCheck();


  cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
    console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
    vm.locationenabled=enabled;
    if (vm.locationenabled==false)
    {
      cordova.plugins.diagnostic.switchToLocationSettings();
    }
    else{
      vm.startCodeScan();
    }
  }, function(error){
    console.error("The following error occurred: "+error);
  });

 
  
}





function locationcheck(){
  cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
    console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
    vm.locationenabled=enabled;
    console.log("enabled="+vm.locationenabled);
    if(vm.locationenabled==false)
    {
      navigator.notification.alert(
        "Please turn on location services",  // message
        //null,                  // callback to invoke
        waitThenSettings,                  // callback to invoke
        "Location services turned off",            // title
        ["Ok"],             // buttonLabels
        //"Turn on location"                 // defaultText
      );
    }
  }, function(error){
    console.error("The following error occurred: "+error);
  });
}
/* 
function onResume() {
if(vm.settingsopen==true)
{
vm.settingsopen=false;
//locationcheck();
}
} */

//starting the camera/scanner
    vm.startCodeScan = function startCodeScan() {
      console.log("location check go");
      console.log("buton press");
      locationcheck();
      
      console.log("en="+vm.locationenabled);
      /* cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        console.log("Location setting is " + (enabled ? "enabled" : "disabled")); */
        //vm.locationenabled=enabled;
        //if dissabled prompt switch on + break
        //vm.inlocationloop=false;
        /* while(enabled==false&& vm.inlocationloop==false)
        {
          vm.inlocationloop=true;
            navigator.notification.prompt(
              "Please turn on location services",  // message
              //null,                  // callback to invoke
              waitThenSettings(),                  // callback to invoke
              "Location services turned off",            // title
              ["Ok"],             // buttonLabels
              "Turn on location"                 // defaultText
          );


            //cordova.plugins.diagnostic.switchToLocationSettings();//pretends like it shows a dialogue box before going to settings
          //}
          cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
              console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
            }, function(error){
              console.error("The following error occurred: "+error);
          });
          vm.inlocationloop=false;
        } */
        /* if (vm.locationenabled==true)
        {
          locationenabled=true;
        } */
        //enabled ? console.log("already enabled keep moving"):cordova.plugins.diagnostic.switchToLocationSettings();




        //else continue






    /* }, function(error){
        console.error("The following error occurred: "+error);
    }); */




      if(vm.locationenabled==true)
      {
      console.log("Starting a QR code scan");
      cordova.plugins.barcodeScanner.scan(
        function(qrResult) { // .text .format .cancelled
          console.log("Scanned",qrResult.text);//function to scan a qr code
          if(qrResult.cancelled===true) {//if the scanning is canceled
            console.log("Aborted scan!");
            return;
          } else {
            if(qrResult.format==="QR_CODE") //if the scanned code is a qr code
            {                
                var urlParams = new URLSearchParams(qrResult.text);//gets the url parameters from the QR code
                var uuid = urlParams.get('uuid'); //gets uuid from url
                var parkapi = urlParams.get('parkapi'); //gets uuid from url
                vm.uuid= uuid;
                
                //push
                pushSrvc.subscribe(uuid);//subscribes to the topic of the scanned uuid
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply();
/*
                vm.getLocation = function() {//checks to make sure the location is enabled
                  if (navigator.geolocation) {
                  }
                  else{
                    console.log("locationdissabled");
                    //add turn on location message
                  }
                };*/


                

                    console.log(locationsSrvc.getBrowserLocation());//logs the get location promise
                    locationsSrvc.getBrowserLocation().then(function($$state){//upon the get location promise return
                      console.log($$state);//logs the $$state
                      vm.state=$$state;
                      console.log(vm.state);
                      console.log(vm.state.latitude);
                      lat=vm.state.latitude;//store the returned latitude in lat
                      lon=vm.state.longitude;//store the returned longitude in lon
                      vm.trueLat=lat;//makes trueLat equal the latitude
                      vm.trueLon=lon;//makes trueLon equal the longitude
                      vm.mileLat=1/69;//sets mileLat to equal the distance of 1 mile in latitude
                      vm.mileLon=lat*(Math.PI/180)/(Math.cos(lat*(Math.PI/180))*69.127  ); //calculates the distance of 1 mile in longitude (at the current latitude) and stores it in mileLon
                      console.log(vm.state.longitude);//logs the longitude

                      myLocation.latitude=lat;//stores the real lat in mylocation.latitude
                      myLocation.longitude=lon;//stores the real longitude in mylocation.longitude
                      console.log(locationsSrvc.getPostcodes(myLocation,500));//logs the get postcode promise


                      locationsSrvc.getPostcodes(myLocation,500).then(function($$state){// calls the getpostcode promise with the current location
                        postcode=$$state.result[0].postcode;//stores the postcode in postcode
                        console.log(postcode);//logs the postcode in the console

                        

                        locationsSrvc.getLocation(postcode).then(function($$state){//uses the getlocation function to get the location of the middle of the postcode


                          lat=$$state.result.latitude; //logs the postcode latitude in lat
                          lon=$$state.result.longitude;//logs the postcode longitude in lon
                          //add up to 25% of a mile to the postcode center
                          vm.randomaddsub=Math.floor(Math.random()*(4)+1);//generates a random numeber betwen 1 and 4
                          vm.randomPercent=Math.random()*0.25;//generates a random number up to 0.25
                          switch(vm.randomaddsub){//choses wether to add or subtract latitude and longitude based on vm.randomaddsub
                                case 1:
                                //+lat +lon
                                lat=lat+(vm.randomPercent*vm.mileLat);//adds a random amount to the latitude
                                vm.randomPercent=Math.random()*0.25;
                                lon=lon+(vm.randomPercent*vm.mileLon);//adds a random amount to the longitude
                                break;
                                case 2:
                                //+lat - lon
                                lat=lat+(vm.randomPercent*vm.mileLat);//adds a random amount to the latitude
                                vm.randomPercent=Math.random()*0.25;
                                lon=lon-(vm.randomPercent*vm.mileLon);//subtracts a random amount from the longitude
                                break;
                                case 3:
                                //-lat +lon
                                lat=lat-(vm.randomPercent*vm.mileLat);//subtracts a random amount from the latitude
                                vm.randomPercent=Math.random()*0.25;
                                lon=lon+(vm.randomPercent*vm.mileLon);//adds a random amount to the longitude
                                break;
                                case 4:
                                //-lat -lon
                                lat=lat-(vm.randomPercent*vm.mileLat);//subtracts a random amount from the latitude
                                vm.randomPercent=Math.random()*0.25;
                                lon=lon-(vm.randomPercent*vm.mileLon);//subtracts a random amount from the longitude
                                break;
                                default://default case adds random amounts to both latitude and longitude
                                //+lat +lon
                                lat=lat+(vm.randomPercent*vm.mileLat);
                                vm.randomPercent=Math.random()*0.25;
                                lon=lon+(vm.randomPercent*vm.mileLon);
                                break;

                          }
                          //logs latitude and longitude
                          console.log("Lat="+lat);
                          console.log("Lon="+lon);

                          //post
                          //var date= Date.now();//gets the date
                          var date=1111111111; //database now gets its date locally.
                          var incidentJSON={"sticker_uuid":uuid,"postcode":postcode,"lat":lat,"lon":lon,"date":date};//creates the JSON to send to the server
                          ///logs latitude and longitude
                          console.log(lat);
                          console.log(lon);

                          $http.post("https://" +parkapi + '.com/incidents/',JSON.stringify(incidentJSON))//sends the JSON string to the parkapi
                          .then(
                              function success(response) {
                                  vm.responses = response.data;
                                  console.info(response);//logs the server response
                              },
                              function failure(err) {
                                  console.error(err);//logs the error
                              }
                            )              
                        }) 
                      }
                      )                                      
                })
            }
          }
        },
        function(error) {
          console.error("Error scanning",error);//displays an error message if there was a scanning error
        },
        {
          showTorchButton: true,
          saveHistory: false,
          prompt: "Scan the QR Code"
        }
      );
    };
  }

    vm.handleInbound = function handleInbound( data ) {//handles incoming notification
      console.log("Got inbound message", data);
      console.log("payload", JSON.parse(data.payload.payload));//logs the payload in the console
      var notification=JSON.parse(data.payload.payload)//sets the notification to the payload
      alert(JSON.stringify(notification.RESPONSE));    //creates a notification with the response
    };

    vm.initialise();

  }
})();
