(function () {

  'use strict';

  var app = angular.module('main' );
  app.controller('mainCtrl', mainCtrl);
  mainCtrl.$inject = [ '$scope', 'pushSrvc', '$http' ];

  function mainCtrl( $scope, pushSrvc, $http ) {

    var vm = angular.extend(this, { });

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

                /* qrResult.text ; // TAKE THE UUID OUT HERE */
                
               /*  var params=qrResult.text.split("=")[1];
                
               vm.uuid = qrResult.text; */
                /* pushSrvc.subscribe( params );
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply(); */
/*                 if (qrResult.text.split("=")[2]!= null)
                { */
                /* var splitstring=qrResult.text.split("=")[1];
                vm.uuid=params.text.split("&")[0];
                params=vm.uuid;
                var endpointparam=splitstring.text.split("=")[2];
                var endpoint =endpointparam.text.split("&")[0]; */

                //string split stuff removed because bad
                /* var qrCodeString= qrResult.text;
                var uuid= (qrCodeString.split("=")[1]).split("&")[0];
                vm.uuid= uuid;
                var endpoint = qrCodeString.split("=")[2]; */
                var urlParams = new URLSearchParams(window.location.search);
                var uuid = urlParams.get('uuid'); //gets uuid from url
                var parkapi = urlParams.get('parkapi'); //gets uuid from url
                vm.uuid= uuid;

                
                
                //push
                pushSrvc.subscribe(uuid);
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply();


                /* }
                else{
                vm.uuid=params;
                var endpoint= "https://anti-parking-api.herokuapp.com/";
                pushSrvc.subscribe( params);
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply();
                } */
                var incidentJSON={"sticker_uuid":uuid};
                $http.post(parkapi + 'incidents/',JSON.stringify(incidentJSON))
                .then(
                    function success(response) {
                        vm.responses = response.data;
                        console.info(response);
                    },
                    function failure(err) {
                        console.error(err);
                    }
                  )



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
