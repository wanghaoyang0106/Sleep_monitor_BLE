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
        self.get_data = get_data;
        self.get_data_param = get_data_param;
        
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
        }
        let data_list = self.get_data(self.get_data_param);
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

//*************************************************************************************************assign data update method: fake data
// set button click event
document.getElementById("fake").onclick = fake_data;

function fake_data() {
    for (let i = 0; i < data_list.length; i++) {
        let data = data_list[i];
        data.stop(data); // stop everything currently running
        data.reset(data); // reset data
        data.get_data_assign(data, fake_sin, []); // assign data update method
        data.start(data); // start update data and draw
    }
}

function fake_sin(param) {
    return [Math.sin(Date.now() / 1000.0 * 6.28) / 2 + 0.5];
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
