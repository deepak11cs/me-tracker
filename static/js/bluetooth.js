let y = document.getElementById("blu-logs");
let btn = document.getElementById("button");
function connect(){
   
    
    navigator.bluetooth.getAvailability()
        .then(isBluetoothAvailable => {
            y.innerHTML = y.innerHTML + "<br>" + isBluetoothAvailable;
            console.log(navigator.bluetooth);
        });

        // navigator.bluetooth.requestLEScan({
        //     acceptAllAdvertisements: true,
        //     keepRepeatedDevices: true
        //   }).then(() => {
        //     navigator.bluetooth.addEventListener('advertisementreceived', event => {
        //       let appleData = event.manufacturerData.get(0x004C);
        //       if (appleData.byteLength != 23) {
        //         // Isn’t an iBeacon.
        //         return;
        //       }
        //       let major = appleData.getUint16(18, false);
        //       let minor = appleData.getUint16(20, false);
        //       let txPowerAt1m = -appleData.getInt8(22);
        //       let pathLossVs1m = txPowerAt1m - event.rssi;
          
        //       recordNearbyBeacon(major, minor, pathLossVs1m);
        //     });
        //   });
    // navigator.bluetooth.addEventListener('availabilitychanged',function(event){
    //     y.innerHTML = event.value;
        
    // });

    y.innerHTML = "connecting device";
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['device_information']})
        .then(device => {
            y.innerHTML = "connecting to gatt service<br>"+device.id ;
            return device.gatt.connect();
        })
        .then(server => {
            console.log(server);
            
        });
}

btn.addEventListener("click",connect);
//connect();