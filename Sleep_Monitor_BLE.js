function onButtonClick() {
    //button.addEventListener('pointerup', function(event) {
        navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        })
        .then(device => { /* ... */ })
        .catch(error => { console.log(error); });
    //});
}