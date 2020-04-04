var bluetoothDevice;
var capacitanceCharacteristic;

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
    .then(server => { // get service
        console.log('Getting Service...');
        return server.getPrimaryService('00001234-0000-0000-0001-000000000000');
    })
    .then(service => { // get characteristic
        console.log('Getting Characteristic...');
        return service.getCharacteristic('00001234-0000-0000-0001-000000000001');
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
    let CapacitanceValue = event.target.value.getFloat32(0, true);
    console.log('CapacitanceValue:');
    console.log(CapacitanceValue);
    document.write(CapacitanceValue);
}

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    // TODO: reconnect
}