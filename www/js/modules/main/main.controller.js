(function () {

  'use strict';

  var app = angular.module('main' );
  app.controller('mainCtrl', mainCtrl);
  mainCtrl.$inject = [ '$scope', 'pushSrvc' ];

  function mainCtrl( $scope, pushSrvc ) {

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
                vm.uuid = qrResult.text;
                pushSrvc.subscribe( qrResult.text );
                vm.subscriptionFeedback = "Subscribed!";
                $scope.$apply();
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
      alert(JSON.stringify(data));
    };

    vm.initialise();

  }
})();
