var bluetoothDevice;
var capacitanceService;
var capacitanceTime;
var capacitanceValue;

var capacitanceTime_plot = 0;
var capacitanceValue_plot = 0;

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
        .then(characteristic => {
            capacitanceTime_plot = characteristic.value.getUint32(0, true);
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
    //document.write(time, "&#9", val, "<br>");
    console.log(val);
    capacitanceTime_plot = time;
    capacitanceValue_plot = val;
}

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    // TODO: reconnect
}

// plot chart
Highcharts.setOptions({
	global: {
		useUTC: false
	}
});
function activeLastPointToolip(chart) {
	var points = chart.series[0].points;
	chart.tooltip.refresh(points[points.length -1]);
}
var chart = Highcharts.chart('container', {
	chart: {
		type: 'spline',
		marginRight: 10,
		events: {
			load: function () {
				var series = this.series[0],
					chart = this;
				activeLastPointToolip(chart);
				setInterval(function () {
					series.addPoint([capacitanceTime_plot, capacitanceValue_plot], true, true);
				}, 500);
			}
		}
	},
	title: {
		text: 'capacitance change'
	},
	xAxis: {
		title: {
            text: 'time(ms)'
        },
		tickPixelInterval: 200
	},
	yAxis: {
		title: {
			text: 'capacitance(pF)'
		}
	},
	tooltip: {
		formatter: function () {
			return '<b>' + this.series.name + '</b><br/>' + 'time:' +
				this.x + '<br/>' + 'value:' +
				Highcharts.numberFormat(this.y, 2);
		}
	},
	legend: {
		enabled: false
	},
	series: [{
		name: 'capacitance',
		data: (function () {
            var data = [],
                time = capacitanceTime_plot,
				i;
			for (i = -119; i <= 0; i += 1) {
				data.push({
					x: time + i * 500,
					y: 0
				});
			}
			return data;
		}())
	}]
});