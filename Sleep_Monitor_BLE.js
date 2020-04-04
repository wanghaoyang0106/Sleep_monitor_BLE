var bluetoothDevice;
var capacitanceCharacteristic;

document.getElementById("start").addEventListener('pointerup', function(event) {
    navigator.bluetooth.requestDevice({ // scan for the designated BLE peripheral
        filters: [{
            name: 'Arduino'
        }],
    })
    .then(device => { // connect to the device
        console.log(device.name);
        bluetoothDevice = device;
        bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
        // Attempts to connect to remote GATT Server.
        return device.gatt.connect();
    })
    .then(server => { // get service
        console.log('Getting Service...');
        return server.getPrimaryService('CapacitanceService');
    })
    .then(service => { // get characteristic
        console.log('Getting Characteristic...');
        return service.getCharacteristic('CapacitanceValue');
    })
    .then(characteristic => characteristic.startNotifications())
    .then(characteristic => {
        capacitanceCharacteristic = characteristic;
        capacitanceCharacteristic.addEventListener('characteristicvaluechanged',
            handleCapacitanceChanged);
    })
    .catch(error => { console.log(error); });
});

function handleCapacitanceChanged(event) {
    let CapacitanceValue_little = event.target.value.getFloat32(0, littleEndian);
    let CapacitanceValue_big = event.target.value.getFloat32(0);
    console.log('CapacitanceValue_little:');
    console.log(CapacitanceValue_little);
    console.log('CapacitanceValue_big:');
    console.log(CapacitanceValue_big);
}

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    // TODO: reconnect
}