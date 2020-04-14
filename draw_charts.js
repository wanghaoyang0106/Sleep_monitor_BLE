//*************************************************************************************************fake data
// set button click event
document.getElementById("fake").onclick = fake_Data;

function fake_Data() {
    // stop interval refresh and initialize
    stop_interval();
    initialize();

    get_data_fake();
    draw();
}

function get_data_fake() {
    interval_data = setInterval(function () {
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
            Math.sin(time * 6.28) / 2 + 0.5
        ]
    }
    count++;
    return data;
}

//*************************************************************************************************stop
// set button click event
document.getElementById("stop").onclick = function() {
    clearInterval(interval_draw);
};

//*************************************************************************************************initial

// some important value
var refresh_time_ms = 100; // no less than 100
var refresh_data_num = 10; // better to be less than 18
var data_num = 10 * 1000 / refresh_time_ms * refresh_data_num;

var count; // data count
var time; // data time 
var data; // data list
var option; // chart option
var interval_draw; // interval loop object
var interval_data; // interval loop for data update

function stop_interval() {
    clearInterval(interval_draw);
    clearInterval(interval_data);
}

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
    interval_draw = setInterval(function () {
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
