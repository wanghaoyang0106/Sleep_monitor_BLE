//*************************************************************************************************connect with BLE
// set button click event
document.getElementById("connect").onclick = BLE_data;

function BLE_data() {
    // stop interval refresh and initialize
    stop_interval();
    initialize();

    BLE_connect();
    //get_data_BLE();
    //draw();
}

var device_name = 'Arduino';
var service_UUID = '00001234-0000-0000-0001-000000000000';
var characteristic_1_UUID = '00001234-0000-0000-0001-000000000001'; // time
var characteristic_2_UUID = '00001234-0000-0000-0001-000000000002'; // value 1
var BLE_device_handler;
var service_handler;
var characteristic_1_handler;
var characteristic_2_handler;

function BLE_connect() {
    if (BLE_device_handler) {}
    else {
        navigator.bluetooth.requestDevice({ // scan for the designated BLE peripheral
            filters: [{
                name: device_name
            }],
            optionalServices: [service_UUID]
        })
        .then(device => { // connect to the device
            console.log(device.name);
            BLE_device_handler = device;
            BLE_device_handler.addEventListener('gattserverdisconnected', disconnection_handler);
            // Attempts to connect to remote GATT Server.
            return device.gatt.connect();
        })
        .then(server => { // get service
            console.log('Getting Service...');
            return server.getPrimaryService(service_UUID);
        })
        .then(service => {
            service_handler = service;

            // get characteristic_2
            console.log('Getting Value Characteristic...');
            service_handler.getCharacteristic(characteristic_2_UUID)
            .then(characteristic => {
                characteristic_2_handler = characteristic;

                get_data_BLE();
                draw();
            });
        })
        .catch(error => { console.log(error); });
    }
}

function disconnection_handler() {
    console.log('> Bluetooth Device disconnected');
    alert('Bluetooth Device disconnected!');

    stop_interval();

    // TODO: reconnect
}

function get_data_BLE() {
    interval_data_handler = setInterval(function () {
        if (data.length > data_num) {
            data.shift();
        };
        characteristic_2_handler.readValue()
        .then(value => {
            time = count * refresh_time_ms / 1000.0 / refresh_data_num;
            data.push({
                count: count,
                value: [
                    time,
                    value.getInt32(0, true) / 1023.0,
                ],
            });
            count++;
        });
    }, (refresh_time_ms / refresh_data_num));
}

//*************************************************************************************************fake data
// set button click event
document.getElementById("fake").onclick = fake_data;

function fake_data() {
    // stop interval refresh and initialize
    stop_interval();
    initialize();

    get_data_fake();
    draw();
}

function get_data_fake() {
    interval_data_handler = setInterval(function () {
        for (var i = 0; i < refresh_data_num; i++) {
            if (data.length > data_num) {
                data.shift();
            };
            data.push(fake_sin());
        }
    }, refresh_time_ms);
}

function fake_sin() {
    time = count * refresh_time_ms / 1000.0 / refresh_data_num;
    var data = {
        count: count,
        value: [
            time,
            Math.sin(time * 6.28) / 2 + 0.5,
        ],
    };
    count++;
    return data;
}

//*************************************************************************************************stop
// set button click event
document.getElementById("stop").onclick = stop_interval;

function stop_interval() {
    clearInterval(interval_draw_handler);
    clearInterval(interval_data_handler);
}

//*************************************************************************************************initial

// some important value
var refresh_time_ms = 100; // no less than 100
var refresh_data_num = 10; // better to be less than 18
var data_num = 10 * 1000 / refresh_time_ms * refresh_data_num;

var count; // data count
var time; // data time 
var data; // data list
var option; // chart option
var interval_draw_handler; // interval loop object
var interval_data_handler; // interval loop for data update

function initialize() {
    count = 0; // data count
    time = 0; // data time 
    data = []; // data list
    option = { // chart option
        title: {
            text: 'Data 1',
        },
        xAxis: {
            type: 'value',
            name: 'time(s)',
            min: 0,
            max: data_num * refresh_time_ms / 1000.0 / refresh_data_num,
        },
        yAxis: {
            type: 'value',
            name: 'value',
            min: 0,
            max: 1,
        },
        series: [{
            name: 'data 1',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data
        }]
    };
}

//*************************************************************************************************draw
// get the DOM
var chart_1 = echarts.init(document.getElementById('chart_1'));

function draw() {
    // draw chart
    chart_1.setOption(option);

    // set dynamic chart refresh
    interval_draw_handler = setInterval(function () {
        chart_1.setOption({
        series: [{
            data: data
        }],
        });
        chart_1.setOption({
            xAxis: [{
            type: 'value',
            splitLine: {
                show: false
            },
            min: data[0].value[0],
            max: data[0].value[0] + data_num * refresh_time_ms / 1000.0 / refresh_data_num,
        }]
        });
    }, refresh_time_ms);
}
