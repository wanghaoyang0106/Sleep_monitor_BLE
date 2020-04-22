//*************************************************************************************************initial
//data object
class Data {
    constructor(chart, option, refresh_time_ms, refresh_data_num, duration_time_s) {
        this.chart = chart;
        this.data = [];
        this.count = 0; // data count
        this.time = 0; // data time
        this.refresh_time_ms = refresh_time_ms; // refresh invertal of the chart; no less than 100
        this.refresh_data_num = refresh_data_num; // refresh data num (data returened and to be plotted once from get_data method); better no more than 18
        this.data_num = duration_time_s * 1000 / refresh_time_ms * refresh_data_num;
        this.option = option; // chart option
        this.data_interval_handler = undefined;
        this.draw_interval_handler = undefined;
        this.get_data_flag = false;
        this.get_data = undefined;
        this.get_data_param = undefined;
    }

    get_data_assign(self, get_data, get_data_param) {
        self.get_data_param = get_data_param;
        self.get_data = get_data;
        
        self.get_data_flag = true;
    }

    start(self) {
        self.start_data_interval(self);
        self.start_draw_interval(self);
    }

    start_data_interval(self) {
        self.data_interval_handler = window.setInterval(self.data_update, self.refresh_time_ms, self);
    }

    start_draw_interval(self) {
        //initial draw
        self.draw_whole(self);
        //set interval
        self.draw_interval_handler = setInterval(self.draw_update, self.refresh_time_ms, self);
    }

    data_update(self) {
        if (self.get_data_flag == false) { // get_data method not assigned
            throw Error('get_data method and parameters are not assigned!');
        };
        self.get_data(self.get_data_param)
        .then(data_list => {
            if (data_list.length != self.refresh_data_num) { // get_data method not match
                throw Error('get_data method return length dose not match!');
            }
            for (let i = 0; i < self.refresh_data_num; i++) {
                self.time_update(self);
                self.data.push({
                    count: self.count,
                    value: [
                        self.time,
                        data_list[i],
                    ],
                });
                self.count_update(self);
                //console.log(data_list[i]);
            }
            self.trim(self);
        });
    }

    time_update(self) {
        self.time = self.count * self.refresh_time_ms / 1000.0 / self.refresh_data_num;
    }

    count_update(self) {
        self.count++;
    }

    trim(self) {
        while (self.data.length > self.data_num) {
            self.data.shift()
        };
    }

    draw_whole(self) {
        // rewrite some option
        //self.option.xAxis.min = self.data[0].value[0];
        //self.option.xAxis.max = self.data[0].value[0] + self.data_num * self.refresh_time_ms / 1000.0 / self.refresh_data_num;
        self.option.series.data = self.data;
        // draw the whole chart
        self.chart.setOption(self.option);
    }

    draw_update(self) {
        self.chart.setOption({
            series: [{
                data: self.data,
            }],
        });
        self.chart.setOption({
            xAxis: [{
            type: 'value',
            splitLine: {
                show: false,
            },
            min: self.data[0].value[0],
            max: self.data[0].value[0] + self.data_num * self.refresh_time_ms / 1000.0 / self.refresh_data_num,
        }]
        });
    }

    stop(self) {
        self.stop_data_interval(self);
        self.stop_draw_interval(self);
    }

    stop_data_interval(self) {
        clearInterval(self.data_interval_handler);
    }

    stop_draw_interval(self) {
        clearInterval(self.draw_interval_handler);
    }

    reset(self) {
        self.data = [];
        self.count = 0; // data count
        self.time = 0; // data time
    }
}

//*************************************************************************************************get chart and data initialize
var data_list = [];

var chart_1 = echarts.init(document.getElementById('chart_1'));
var option_1 = { // chart option
    title: {
        text: 'Data 1',
    },
    xAxis: {
        type: 'value',
        name: 'time(s)',
    },
    yAxis: {
        type: 'value',
        name: 'value',
        //min: 0,
        //max: 1,
    },
    series: [{
        name: 'data 1',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
    }]
};
var data_1 = new Data(chart_1, option_1, 100, 1, 10);
data_list.push(data_1);

var chart_2 = echarts.init(document.getElementById('chart_2'));
var option_2 = { // chart option
    title: {
        text: 'Data 2',
    },
    xAxis: {
        type: 'value',
        name: 'time(s)',
    },
    yAxis: {
        type: 'value',
        name: 'value',
        //min: 0,
        //max: 1,
    },
    series: [{
        name: 'data 2',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
    }]
};
var data_2 = new Data(chart_2, option_2, 100, 1, 10);
data_list.push(data_2);

var chart_3 = echarts.init(document.getElementById('chart_3'));
var option_3 = { // chart option
    title: {
        text: 'Data 3',
    },
    xAxis: {
        type: 'value',
        name: 'time(s)',
    },
    yAxis: {
        type: 'value',
        name: 'value',
        //min: 0,
        //max: 1,
    },
    series: [{
        name: 'data 3',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
    }]
};
var data_3 = new Data(chart_3, option_3, 100, 1, 10);
data_list.push(data_3);

var chart_4 = echarts.init(document.getElementById('chart_4'));
var option_4 = { // chart option
    title: {
        text: 'Data 4',
    },
    xAxis: {
        type: 'value',
        name: 'time(s)',
    },
    yAxis: {
        type: 'value',
        name: 'value',
        //min: 0,
        //max: 1,
    },
    series: [{
        name: 'data 4',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
    }]
};
var data_4 = new Data(chart_4, option_4, 100, 1, 10);
data_list.push(data_4);


//*************************************************************************************************assign data update method: fake data
// set button click event
document.getElementById("fake").onclick = fake_data;

function fake_data() {
    for (let i = 0; i < data_list.length; i++) {
        let data = data_list[i];
        data.stop(data); // stop everything currently running
        data.reset(data); // reset data
        data.get_data_assign(data, fake_sin, null); // assign data update method
        data.start(data); // start update data and draw
    }
}

async function fake_sin(param) {
    return [Math.sin(Date.now() / 1000.0 * 6.28 * 1) / 2 + 0.5];
}

//*************************************************************************************************assign data update method: BLE
// set button click event
document.getElementById("connect").onclick = BLE_data;

function BLE_data() {


    BLE_connect();
    //get_data_BLE();
    //draw();
}

var device_name = 'Arduino';
var service_UUID = '00001234-0000-0000-0001-000000000000';
var characteristic_1_UUID = '00001234-0000-0000-0001-000000000001'; // time
var characteristic_2_UUID = '00001234-0000-0000-0001-000000000002'; // CAP value
var characteristic_3_UUID = '00001234-0000-0000-0001-000000000002'; // ECG value
var characteristic_4_UUID = '00001234-0000-0000-0001-000000000002'; // EOG value
var characteristic_5_UUID = '00001234-0000-0000-0001-000000000002'; // EMG value
var BLE_device_handler;
var service_handler;
var characteristic_1_handler;
var characteristic_2_handler;
var characteristic_3_handler;
var characteristic_4_handler;
var characteristic_5_handler;
var characteristic_list = [];

function BLE_connect() {
    if (BLE_device_handler) {
        for (let i = 0; i < data_list.length; i++) {
            let data = data_list[i];
            data.stop(data); // stop everything currently running
            data.reset(data); // reset data
            data.get_data_assign(data, get_data_BLE, characteristic_list[i]); // assign data update method
            data.start(data); // start update data and draw
        }
    }
    else {
        stop();
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
        })
        // get characteristics
        .then(service => {
            console.log('Getting Characteristic 1...');
            service.getCharacteristic(characteristic_1_UUID)
            .then(characteristic => {
                characteristic_1_handler = characteristic;
            });
        })
        .then(service => {
            console.log('Getting Characteristic 2...');
            service.getCharacteristic(characteristic_2_UUID)
            .then(characteristic => {
                characteristic_2_handler = characteristic;
                characteristic_list.push(characteristic_2_handler);
                data_1.get_data_assign(data_1, get_data_BLE, characteristic_2_handler); // assign data update method
                data_1.start(data_1); // start update data and draw
            });
        })
        .then(service => {
            console.log('Getting Characteristic 3...');
            service.getCharacteristic(characteristic_3_UUID)
            .then(characteristic => {
                characteristic_3_handler = characteristic;
                characteristic_list.push(characteristic_3_handler);
                data_2.get_data_assign(data_2, get_data_BLE, characteristic_3_handler); // assign data update method
                data_2.start(data_2); // start update data and draw
            });
        })
        .then(service => {
            console.log('Getting Characteristic 4...');
            service.getCharacteristic(characteristic_4_UUID)
            .then(characteristic => {
                characteristic_4_handler = characteristic;
                characteristic_list.push(characteristic_4_handler);
                data_3.get_data_assign(data_3, get_data_BLE, characteristic_4_handler); // assign data update method
                data_3.start(data_3); // start update data and draw
            });
        })
        .then(service => {
            console.log('Getting Characteristic 5...');
            service.getCharacteristic(characteristic_5_UUID)
            .then(characteristic => {
                characteristic_5_handler = characteristic;
                characteristic_list.push(characteristic_5_handler);
                data_4.get_data_assign(data_4, get_data_BLE, characteristic_5_handler); // assign data update method
                data_4.start(data_4); // start update data and draw
            });
        })
        .catch(error => { console.log(error); });
    }
}

function disconnection_handler() {
    console.log('> Bluetooth Device disconnected');
    alert('Bluetooth Device disconnected!');

    BLE_device_handler = undifined;
    characteristic_list = [];
    stop();

    // TODO: reconnect
}

async function get_data_BLE(characteristic_handler) {
    return [characteristic_handler.readValue().getInt32(0, true)];
}

//*************************************************************************************************stop
// set button click event
document.getElementById("stop").onclick = stop;

function stop() {
    for (let i = 0; i < data_list.length; i++) {
        let data = data_list[i];
        data.stop(data); // stop everything currently running
    }
}
