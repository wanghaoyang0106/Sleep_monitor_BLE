var bluetoothDevice;
var capacitanceService;
var capacitanceTime;
var capacitanceValue;

var capacitanceTime_plot = 0;
var capacitanceValue_plot = 0;

var plotInterval = 600; //interval of each plot (ms)

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
	.then(service => {
		capacitanceService = service;

		// get value characteristic
		console.log('Getting Value Characteristic...');
        capacitanceService.getCharacteristic('00001234-0000-0000-0001-000000000002')
        .then(characteristic => {
            capacitanceValue = characteristic;
		})
		.then(_ => { // get time characteristic
			console.log('Getting Time Characteristic...');
			capacitanceService.getCharacteristic('00001234-0000-0000-0001-000000000001')
			.then(characteristic => characteristic.startNotifications())
			.then(characteristic => {
				capacitanceTime = characteristic;

				// initial plot
				capacitanceTime.readValue()
				.then(value => {
					capacitanceTime_plot = value.getUint32(0, true);
					chartPlot();
				});
				capacitanceTime.addEventListener('characteristicvaluechanged',
					handleCapacitanceChanged);

			});
		});
	})
	.catch(error => { console.log(error); });
    
});

function handleCapacitanceChanged(event) {
    let time = event.target.value.getUint32(0, true);
	capacitanceValue.readValue()
	.then(value => {
		let val = value.getFloat32(0, true);
		//document.write(time, "<br>", val, "<br>");
		console.log(val);
    	capacitanceTime_plot = time;
    	capacitanceValue_plot = val;
	});
}

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    // TODO: reconnect
}


function activeLastPointToolip(chart) {
	var points = chart.series[0].points;
	chart.tooltip.refresh(points[points.length -1]);
}

function chartPlot() {
	// plot chart
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});
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
					}, plotInterval);
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
				for (i = -59; i <= 0; i += 1) {
					data.push({
						x: time + i * plotInterval,
						y: 0
					});
				}
				return data;
			}())
		}]
	});

}