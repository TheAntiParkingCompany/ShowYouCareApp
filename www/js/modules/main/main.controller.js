(function () {

  'use strict';

  var app = angular.module('main' );
  app.controller('mainCtrl', mainCtrl);
  mainCtrl.$inject = [ '$scope', 'pushSrvc', '$http', 'locationsSrvc' ];

  function mainCtrl( $scope, pushSrvc, $http, locationsSrvc ) {

    var vm = angular.extend(this, { });
    var lat;
    var lon;
    var myLocation=new Object();
    var postcode;
    //vm.myPostcode;
    vm.postcodeValidator = locationsSrvc.POSTCODE_VALIDATION_REGEX;

    vm.MESSAGE_TIMEOUT_SECONDS = 10;

    vm.pushConnected = false;

    vm.inbound = {
      data: { },
      rendered: "No messages yet."
    };

    vm.subscriptionFeedback = "";

    vm.initialise = function initialise() {

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

    vm.startCodeScan = function startCodeScan() {
      console.log("Starting a QR code scan");
      cordova.plugins.barcodeScanner.scan(
        function(qrResult) { // .text .format .cancelled
          console.log("Scanned",qrResult.text);
          if(qrResult.cancelled===true) {
            console.log("Aborted scan!");
            return;
          } else {
            if(qrResult.format==="QR_CODE") {

                
                var urlParams = new URLSearchParams(qrResult.text);
                var uuid = urlParams.get('uuid'); //gets uuid from url
                var parkapi = urlParams.get('parkapi'); //gets uuid from url
                vm.uuid= uuid;

                
                
                //push
                pushSrvc.subscribe(uuid);
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply();

                //console.log("brfore location");

                vm.getLocation = function() {
                  if (navigator.geolocation) {
                    //navigator.geolocation.getCurrentPosition(showPosition);
                    //console.log("location");
                    //console.log(location.getBrowserLocation());
                    //console.log(locationsSrvc.getBrowserLocation());
                  }
                  else{
                    console.log("locationdissabled");
                    //add turn on location message
                  }
                };
                //console.log("location2");
                    //console.log(location.getBrowserLocation());
                    console.log(locationsSrvc.getBrowserLocation());
                    locationsSrvc.getBrowserLocation().then(function($$state){
                      console.log($$state);
                      vm.state=$$state;
                      console.log(vm.state);
                      console.log(vm.state.latitude);
                      lat=vm.state.latitude;
                      lon=vm.state.longitude;
                      vm.trueLat=lat;
                      vm.trueLon=lon;
                      vm.mileLat=1/69;
                      vm.mileLon=lat*(Math.PI/180)/(Math.cos(lat*(Math.PI/180))*69.127  ); 
                      console.log(vm.state.longitude);

                      myLocation.latitude=lat;
                      myLocation.longitude=lon;
                      console.log(locationsSrvc.getPostcodes(myLocation,500));


                      locationsSrvc.getPostcodes(myLocation,500).then(function($$state){
                        postcode=$$state.result[0].postcode;
                        /* console.log($$state);
                        console.log($$state.result);
                        console.log($$state.result[0].postcode); */
                        console.log(postcode);

                        //console.log(locationsSrvc.getLocation(vm.myPostcode));

                        locationsSrvc.getLocation(postcode).then(function($$state){


                          lat=$$state.result.latitude;
                          lon=$$state.result.longitude;
                          //used to add a precentage of original opsition to the postcode center
                          vm.randomaddsub=Math.floor(Math.random()*(4)+1);
                          vm.randomPercent=Math.random()*0.25;
                          switch(vm.randomaddsub){
                                case 1:
                                //+lat +lon
                                lat=lat+(vm.randomPercent*vm.mileLat);
                                lon=lon+(vm.randomPercent*vm.mileLon);
                                break;
                                case 2:
                                //+lat - lon
                                lat=lat+(vm.randomPercent*vm.mileLat);
                                lon=lon-(vm.randomPercent*vm.mileLon);
                                break;
                                case 3:
                                //-lat +lon
                                lat=lat-(vm.randomPercent*vm.mileLat);
                                lon=lon+(vm.randomPercent*vm.mileLon);
                                break;
                                case 4:
                                //-lat -lon
                                lat=lat-(vm.randomPercent*vm.mileLat);
                                lon=lon-(vm.randomPercent*vm.mileLon);
                                break;
                                default:
                                //+lat +lon
                                lat=lat+(vm.randomPercent*vm.mileLat);
                                lon=lon+(vm.randomPercent*vm.mileLon);
                                break;

                          }
                          console.log("random test");
                          console.log(vm.randomPercent);
                          console.log(vm.randomPercent);
                          console.log(vm.randomPercent);
                          console.log(vm.randomPercent);

                          console.log("Lat="+lat);
                          console.log("Lon="+lon);

                          


                          /*
                          vm.random=Math.random()*(70-5)+5;
                          vm.thisRandom=vm.random;
                          console.log("lat="+lat);
                          console.log("lon="+lon);
                          lat=lat + (vm.thisRandom*(vm.trueLat-lat));
                          lon=lon + (vm.thisRandom*(vm.trueLon-lon));
                          console.log("lat="+lat);
                          console.log("lon="+lon); 
 */


                          //post
                          var date= Date.now();
                          var incidentJSON={"sticker_uuid":uuid,"postcode":postcode,"lat":lat,"lon":lon,"date":date};
                          console.log(lat);
                          console.log(lon);
                          //var incidentJSON={"sticker_uuid":uuid,"lat":lat,"lon":lon};
                          //var incidentJSON={"sticker_uuid":uuid};
                          $http.post("https://" +parkapi + '.com/incidents/',JSON.stringify(incidentJSON))
                          .then(
                              function success(response) {
                                  vm.responses = response.data;
                                  console.info(response);
                              },
                              function failure(err) {
                                  console.error(err);
                              }
                            )
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        }) 












                      }
                      )
                    






                    //console.log(locationsSrvc.getBrowserLocation().$$state.value.Coordinates.latitude);
                     /* vm.resolvedd=Promise.resolve(locationsSrvc.getBrowserLocation());
                    console.log("<p>")
                    console.log(resolvedd.$$state);
                    console.log(resolvedd.$$state.value);
                    console.log("</p>")
                    vm.state=locationsSrvc.getBrowserLocation().$$state;
                    vm.co=vm.state.value;
                    console.log(vm.state);
                    console.log(vm.co);  */
                    //vm.lat=locationsSrvc.getBrowserLocation()
                //get location

                /* vm.handleIsMyLocation = function handleIsMyLocation() {
                  locationsSrvc.getBrowserLocation().then(
                    function gotBrowserLocation( position ){
                      locationsSrvc.locationToPostcode( position, 100, 1 ).then(
                        function gotPostcodeFromPosition( results ) {
                          // postcode is in result.postcode
                          vm.location = {
                            "lat":results.result[0].latitude,
                            "lon": results.result[0].longitude
                          };
                          console.log(vm.location.lat);
                          console.log("not broken");
                          console.log(results.result.latitude);
                          console.log(vm.location.lon);
                          vm.maybeSetPostcodeToHere( results.result[0].postcode );
                        },
                        function errorPostcodeFromPosition( error ) {
                          console.log(error);
                        }
                      );
                    },
                    function errorBrowserLocation( error ){
                      // @TODO this is the user rejecting browser access
                      console.log("location failed");
                      toaster.pop({
                        type: 'error',
                        title: "Error: No Location Access",
                        body: 'Please grant access to your location in this browser window before trying again.',
                        bodyOutputType: 'trustedHtml',
                        tapToDismiss: false,
                        showCloseButton: true,
                        timeout: 0,
                        onHideCallback: function (toast) {
                          //alert("click!");
                          vm.handleIsMyLocation(); // try again!
                          return true;
                        }
                      } );
                    }
                    
                  );
                }; */











                
                
                })
                  //console.log("after location");

            }
          }
        },
        function(error) {
          console.error("Error scanning",error);
        },
        {
          showTorchButton: true,
          saveHistory: false,
          prompt: "Scan the QR Code"
        }
      );
    };

    vm.handleInbound = function handleInbound( data ) {
      console.log("Got inbound message", data);
      console.log("payload", JSON.parse(data.payload.payload));
      var notification=JSON.parse(data.payload.payload)
      alert(JSON.stringify(notification.RESPONSE));
      
      
    };

    vm.initialise();

  }
})();
