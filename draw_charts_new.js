//*************************************************************************************************initial
//data object
class Data {
    constructor(chart, option, refresh_time_ms, refresh_data_num, duration_time, get_data, get_data_param) {
        this.chart = chart;
        this.data = [];
        this.count = 0; // data count
        this.time = 0; // data time
        this.refresh_time_ms = refresh_time_ms; // refresh invertal of the chart; no less than 100
        this.refresh_data_num = refresh_data_num; // refresh data num (data returened and to be plotted once from get_data method); better no more than 18
        this.data_num = duration_time * 1000 / refresh_time_ms * refresh_data_num;
        this.option = option; // chart option
        this.get_data = get_data;
        this.get_data_param = get_data_param;
        this.data_interval_handler;
        this.draw_interval_handler;
    }

    start() {
        this.start_data_interval();
        this.start_draw_interval();
    }

    start_data_interval() {
        this.data_interval_handler = setInterval(this.data_update, this.refresh_time_ms);
    }

    start_draw_interval() {
        //initial draw
        this.draw_whole();
        //set interval
        this.draw_interval_handler = setInterval(this.draw_update, this.refresh_time_ms);
    }

    data_update() {
        let data_list = this.get_data(this.get_data_param);
        if (data_list.length != this.refresh_data_num) {
            throw Error('get_data method return length dose not match!');
        }
        for (let i = 0; i < this.refresh_data_num; i++) {
            this.time_update();
            this.data.push({
                count: this.count,
                value: [
                    this.time,
                    data_list[i],
                ],
            });
            this.count_update();
        }
        this.trim();
    }

    time_update() {
        this.time = this.count * this.refresh_time_ms / 1000.0 / this.refresh_data_num;
    }

    count_update() {
        this.count++;
    }

    trim() {
        while (this.data.length > this.data_num) {
            this.data.shift()
        };
    }

    draw_whole() {
        // rewrite some option
        this.option.xAxis.min = this.data[0].value[0];
        this.option.xAxis.max = this.data[0].value[0] + this.data_num * this.refresh_time_ms / 1000.0 / this.refresh_data_num;
        this.option.series.data = this.data;
        // draw the whole chart
        this.chart.setOption(this.option);
    }

    draw_update() {
        this.chart.setOption({
            series: [{
                data: this.data,
            }],
        });
        this.chart.setOption({
            xAxis: [{
            type: 'value',
            splitLine: {
                show: false,
            },
            min: this.data[0].value[0],
            max: this.data[0].value[0] + this.data_num * this.refresh_time_ms / 1000.0 / this.refresh_data_num,
        }]
        });
    }

    stop() {
        this.stop_data_interval();
        this.stop_draw_interval();
    }

    stop_data_interval() {
        clearInterval(this.data_interval_handler);
    }

    stop_draw_interval() {
        clearInterval(this.draw_interval_handler);
    }
}

