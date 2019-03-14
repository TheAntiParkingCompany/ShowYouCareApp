(function () {
  'use strict';

  angular
    .module('main' )
    .controller('mainCtrl', mainCtrl);

  mainCtrl.$inject = [
    '$ionicPlatform',
    '$scope',
    '$state',
    '$sce',
    '$http',
    'pushSrvc',
    'uuid'
  ];
2
  function mainCtrl(
    $ionicPlatform,
    $scope,
    $state,
    $sce,
    $http,
    pushSrvc,
    uuid
  ) {

    var vm=angular.extend(this, {

    });

    vm.pushConnected = false;
    vm.activity = 0;
    vm.registrationId = "";
    vm.uuid = false;

    vm.inbound = { data: { },
                   rendered: "No messages yet." };

    vm.subscriptionFeedback = "";

    vm.pendingMessage = {};

    vm.initialise = function initialise() {

      vm.inbound.rendered = "No registrationId yet...";

      pushSrvc.initialisePush( function deviceNowConnected( data ){
        console.log("controller initialised push, got payload ",data );
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
      console.log("starting a QR code scan");
      cordova.plugins.barcodeScanner.scan(
        function(qrResult) { // .text .format .cancelled
          console.log("scanned",qrResult);
          if(qrResult.cancelled===true) {
            console.log("aborted scan!");
            return;
          } else {
            if(qrResult.format==="QR_CODE") {

              qrResult.text ; // TAKE THE UUID OUT HERE
              var uuid=qrResult.text.split("=")[1];
              pushSrvc.subscribe( uuid );

              var endpoint= "https://anti-parking-api.herokuapp.com/";
              var incidentJSON={"sticker_uuid":uuid};
              $http.post(endpoint + 'incidents/',JSON.stringify(incidentJSON))
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
          console.log("error scanning",error);
        },
        {
          showTorchButton: false,
          saveHistory: false,
          prompt: "Scan the QRCode"
        }
      );
    };

    vm.handleInbound = function handleInbound( data ) {
      console.log("got inbound message", data);
    };

    vm.initialise();

  }
})();
