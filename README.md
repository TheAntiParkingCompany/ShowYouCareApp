# ShowYouCareApp
It's a pretty simple responsive app which lets anyone logg in an accident through scanning already printed QR code.

## How did we do it? 
We used a simple QR and barcode scanner [app](https://github.com/aliceliveprojects/little_scanner) which we implemented for the needs of the SYCPE project.

To be able for our app user to receive an update as if a driver apologises or not for wrongly parking their car and endangering the pedestrians, we implemented a NodeJS-based web service, which wraps Googles Firebase Messaging Service. 
You can view the code [here](https://github.com/aliceliveprojects/SYCPE-PushDemo)
