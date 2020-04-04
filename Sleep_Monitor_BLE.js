var bluetoothDevice;
var capacitanceService;
var capacitanceTime;
var capacitanceValue;

document.getElementById("start").addEventListener('pointerup', function(event) {
    navigator.bluetooth.requestDevice({ // scan for the designated BLE peripheral
        filters: [{
            name: 'Arduino'
        }],
        optionalServices: ['00001234-0000-0000-0001-000000000000']
    })
    .then(device => { // connect to the device
        console.log(device.name);
        bluetoothDevice = device;
        bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
        // Attempts to connect to remote GATT Server.
        return device.gatt.connect();
    })
    .then(server => { // get service and characteristics
        console.log('Getting Service...');
        capacitanceService = server.getPrimaryService('00001234-0000-0000-0001-000000000000');
        // return server.getPrimaryService('00001234-0000-0000-0001-000000000000');

        console.log('Getting Time Characteristic...');
        capacitanceService.getCharacteristic('00001234-0000-0000-0001-000000000001')
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => {
            capacitanceTime = characteristic;
            capacitanceTime.addEventListener('characteristicvaluechanged',
            handleCapacitanceChanged);
        })
        .catch(error => { console.log(error); });

        console.log('Getting Value Characteristic...');
        capacitanceService.getCharacteristic('00001234-0000-0000-0001-000000000002')
        .then(characteristic => {
            capacitanceValue = characteristic;
        })
        .catch(error => { console.log(error); });
    })
    .catch(error => { console.log(error); });
    
});

function handleCapacitanceChanged(event) {
    let time = event.target.value.getUint32(0, true);
    let val = capacitanceValue.value.getFloat32(0, true);
    document.write(time, "&#9", val, "<br>");
}

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    // TODO: reconnect
}