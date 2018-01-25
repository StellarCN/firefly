/**
 * K线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-25 11:53:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-01-25 21:56:07
 * @License: MIT 
 */
<template>
  <div class="k">
      <div class="kgraph" :id="id" :style="'height:' + height + ';'"></div>
  </div>
</template>

<script>
var _ = require('lodash')
var echarts = require('echarts')
import { getTradeAggregation, getTradeAggregation5min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    listenTradeAggregationStream,closeTradeAggregationStream } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'


export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            
            dates:[],//日期
            volumes: [],//成交量
            data: [],//每条数据是一个数组，[开盘价，收盘价，最低价，最高价]
            
        }
    },
    props: {
        base: {
            type: Object,
            require: true
        },
        counter: {
            type: Object,
            require: true
        },
        height: {
            type: Number,
            default: 320
        }
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ _.random(100)
        let date1 = new Date()
        date1.setHours(0)
        date1.setMinutes(0)
        date1.setSeconds(0)
        date1.setMilliseconds(0)
        let start_time = date1.getTime()
        let date2 = new Date()
        date2.setFullYear(date2.getFullYear()+1);
        date2.setHours(25)
        date2.setMinutes(59)
        date2.setSeconds(59)
        date2.setMilliseconds(999)
        let end_time = date2.getTime()


        //打开stream监听
        let opt = {
            base: getAsset(this.base),
            counter: getAsset(this.counter),
            start_time,
            end_time,
        }
        listenTradeAggregationStream(opt,this.receiveData)
    },
    beforeDestroy () {
        //关闭stream监听
        closeTradeAggregationStream()
    },
    mounted () {
        this.init();
    },
    methods: {
        init() {
            this.initView()
        },
        receiveData(data){
            console.log(`-----------receive data--`)
            console.log(data)
            data.map(item=>{
                this.dates.push(item.timestamp)
                this.volumes.push(item.base_volume)
                this.data.push([Number(item.open), Number(item.close), Number(item.high), Number(item.low)])
            })
        },
        initView() {
            this.ele = echarts.init(document.getElementById(this.id))
        },
        koption() {
            return {
                animation: false,
                color: colorList,
                title: {left: 'center', text: this.base.code + '/' + this.counter.code },
                legend: { top: 30,data: ['', 'MA5', 'MA10', 'MA20', 'MA30']},
                tooltip: {
                    triggerOn: 'none',
                    transitionDuration: 0,
                    confine: true,
                    bordeRadius: 4,
                    borderWidth: 1,
                    borderColor: '#333',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    textStyle: {fontSize: 12,color: '#333' },
                    position: function (pos, params, el, elRect, size) {
                        var obj = { top: 60 };
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    }
                },
                axisPointer: { link: [{xAxisIndex: [0, 1]}]
                },
                dataZoom: [{
                    type: 'slider',
                    xAxisIndex: [0, 1],
                    realtime: false,
                    start: 20,
                    end: 70,
                    top: 65,
                    height: 20,
                    handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '120%'
                }, {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 40,
                    end: 70,
                    top: 30,
                    height: 20
                }],
                xAxis: [{
                    type: 'category',
                    data: this.dates,
                    boundaryGap : false,
                    axisLine: { lineStyle: { color: '#777' } },
                    axisLabel: {
                        formatter: function (value) {
                            return echarts.format.formatTime('MM-dd HH:mm', value);
                        }
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {show: true}
                }, {
                    type: 'category',
                    gridIndex: 1,
                    data: this.dates,
                    scale: true,
                    boundaryGap : false,
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    axisTick: {show: false},
                    axisLine: { lineStyle: { color: '#777' } },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        type: 'shadow',
                        label: {show: false},
                        triggerTooltip: true,
                        handle: {show: true,margin: 30,color: '#B80C00'}
                    }
                }],
                yAxis: [{
                    scale: true,
                    splitNumber: 2,
                    axisLine: { lineStyle: { color: '#777' } },
                    splitLine: { show: true },
                    axisTick: { show: false },
                    axisLabel: {
                        inside: true,
                        formatter: '{value}\n'
                    }
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }],
                grid: [{
                    left: 20,
                    right: 20,
                    top: 110,
                    height: 120
                }, {
                    left: 20,
                    right: 20,
                    height: 40,
                    top: 260
                }],
                graphic: [{
                    type: 'group',
                    left: 'center',
                    top: 70,
                    width: 300,
                    bounding: 'raw',
                    children: [{
                        id: 'MA5',
                        type: 'text',
                        style: {fill: colorList[1], font: labelFont},
                        left: 0
                    }, {
                        id: 'MA10',
                        type: 'text',
                        style: {fill: colorList[2], font: labelFont},
                        left: 'center'
                    }, {
                        id: 'MA20',
                        type: 'text',
                        style: {fill: colorList[3], font: labelFont},
                        right: 0
                    }]
                }],
                series: [{
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: '#7fbe9e'
                        },
                        emphasis: {
                            color: '#140'
                        }
                    },
                    data: this.volumes
                }, {
                    type: 'candlestick',
                    name: '',
                    data: this.data,
                    itemStyle: {
                        normal: {
                            color: '#ef232a',
                            color0: '#14b143',
                            borderColor: '#ef232a',
                            borderColor0: '#14b143'
                        },
                        emphasis: {
                            color: 'black',
                            color0: '#444',
                            borderColor: 'black',
                            borderColor0: '#444'
                        }
                    }
                }, {
                    name: 'MA5',
                    type: 'line',
                    data: this.calculateMA(5),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }, {
                    name: 'MA10',
                    type: 'line',
                    data: this.calculateMA(10),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }, {
                    name: 'MA20',
                    type: 'line',
                    data: this.calculateMA(20),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }]
            }
        }, // end of koption
        calculateMA(dayCount) {
            var result = [];
            for (var i = 0, len = this.data.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += this.data[i - j][1];
                }
                result.push((sum / dayCount).toFixed(2));
            }
            return result;
        }

    }
}
</script>

<style>

</style>
