/**
 * K线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-25 11:53:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-02-05 17:56:05
 * @License: MIT 
 */
<template>
  <div class="k">
      <div class="flex-row" v-if="showTitle">
          <div :class="'flex2 pricle ' + ( titleData.change >=0 ? 'up':'down') ">{{titleData.price}}{{counter.code}}</div>
          <div class="flex1 change">{{titleData.change}}</div>
          <div class="flex1 rate">{{titleData.rate}}</div>
      </div>
      <div class="kgraph" :id="id" v-bind:style="{height: height + 'px'}"></div>
  </div>
</template>

<script>
var echarts = require('echarts')
import NP from 'number-precision'
import { getTradeAggregation, getTradeAggregation5min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_5MIN } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getTrades } from '@/api/trade'
import { DEFAULT_INTERVAL } from '@/api/gateways'
var moment = require('moment')


export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            
            dates:[],//日期
            volumes: [],//成交量
            data: [],//每条数据是一个数组，[开盘价，收盘价，最低价，最高价]
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间

            //最新的成交价格统计
            lasetTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
            
        }
    },
    props: {
        //交易资产
        base: {
            type: Object,
            require: true
        },
        //交易对手资产
        counter: {
            type: Object,
            require: true
        },
        //数据获取的起始时间，单位毫秒
        start: {
            type: Number,
            default: -1
        },
        //数据获取的截止时间，单位毫秒
        end: {
            type: Number,
            default: -1
        },
        //时间间隔，单位毫秒
        interval: {
            type: Number,
            default: RESOLUTION_5MIN
        },
        //是否增量更新模式
        incremental: {
            type: Boolean,
            default: false
        },
        showTitle: {
            type: Boolean,
            default: false
        },
        fullscreen: {
            type: Boolean,
            default: false
        },
        //高度
        height: {
            type: Number,
            default: 360
        }
    },
    computed: {
      titleData(){
          if(this.data.length > 0 && this.lastTrade){
            let price = NP.divide(Number(this.latestTrade.base_amount), Number(this.latestTrade.counter_amount))
            price = NP.round(price,7)
            let lastTradeAggregation = this.data[0]
            let open = Number(lastTradeAggregation.open)
            let change = NP.minus(price,open)
            let rate = NP.times(100, NP.divide(change, open))
            return  Object.assign({}, lastTradeAggregation, {price,chagne,rate })
          }
          return {}
      }  
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
        //开启定时器
        this.tinterval = setInterval(this.fetch, this.interval)
        //如果是全屏模式，则切换为横屏
        if(this.fullscreen){
            screen.orientation.lock('landscape');
        }
        
    },
    beforeDestroy () {
        //关闭定时器
        if(this.tinterval){
            clearInterval(this.tinterval)
            this.tinterval = null
        }
        if(this.fullscreen){
            screen.orientation.lock('portrait');
        }
        this.deleteTradeInterval()
        
    },
    mounted () {
        this.$nextTick(()=>{
            this.init();
            this.fetch();
            this.fetchLastTrade()
        })
    },
    methods: {

        ...mapActions({
            getAccountInfo: 'getAccountInfo',
        }),
        init() {
            this.initView()
        },
        //请求api，获取数据
        fetch(){
          let start_time = null, end_time=null;
          if(this.lasttime){
              start_time = this.lasttime;
              end_time = new Date().getTime()
          }else{//初次请求，判断start是否存在
            if(this.start < 0){
                //前24小时
                start_time = Number(moment().subtract(24,"hours").format('x'))
            }else{
                start_time = this.start;
            }
            if(this.end < 0 ){
                end_time = new Date().getTime()
            }else{
                end_time = this.end
            }
          }
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
            start_time, end_time, this.interval, 200, 'desc')
            .then(data => {
                this.lasttime = end_time
                let records = data.records
                records.reserve().map(item=>{
                    if(this.incremental){
                        this.dates = []
                        this.volumes = []
                        this.data = []
                    }
                    this.dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.volumes.push(Number(item.base_volume))
                    this.data.push([Number(item.open), Number(item.close), Number(item.high), Number(item.low)])
                })
                this.opt.xAxis[0].data = this.dates
                this.opt.xAxis[1].data = this.dates
                this.opt.series[0].data = this.volumes
                this.opt.series[2].data = this.calculateMA(5)
                this.opt.series[3].data = this.calculateMA(10)
                this.opt.series[4].data = this.calculateMA(20)
                
                console.log(this.opt)
                this.ele.setOption(this.opt)
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
            })
        },
        initView() {
            this.ele = echarts.init(document.getElementById(this.id))
            this.opt = this.koption()
            this.ele.setOption(this.opt)
        },
        koption() {
            return {
                animation: false,
                color: this.colors,
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
                            console.log(typeof value)
                            console.log('----date xaxis --- ' + value)
                            //return echarts.format.formatTime('MM-dd HH:mm', value);
                            return value
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
                        style: {fill: this.colors[1]},
                        left: 0
                    }, {
                        id: 'MA10',
                        type: 'text',
                        style: {fill: this.colors[2]},
                        left: 'center'
                    }, {
                        id: 'MA20',
                        type: 'text',
                        style: {fill: this.colors[3]},
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
        },

        setupTradeInterval(){
            if (!this.tradeInterval){
                this.tradeInterval = setInterval(()=>{
                this.fetchLastTrade()
                console.log(this.account.address)
                this.getAccountInfo(this.account.address)
                },DEFAULT_INTERVAL)
            }
            this.fetchLastTrade()
        },

        deleteTradeInterval(){
            if(this.tradeInterval!= null && typeof this.tradeInterval != 'undefined'){
                clearInterval(this.tradeInterval)
                this.lastTrade = null
            }
        },
        //查询最新一次成交记录
        fetchLastTrade(){
            let counterasset = getAsset(this.counter.code,this.counter.issuer)
            let baseasset = getAsset(this.base.code,this.base.issuer)
            getTrades(baseasset,counterasset,"desc",1)
                .then(data=>{
                    if(data.records && data.records.length > 0){
                        this.lastTrade = data.records[0]
                    }
                }).catch(err=>{
                    console.log(err)
                })
        },
        

    }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.price
    font-size: 16px
    &.up
        color: $primarycolor.green
    &.down
        color.$primarycolor.red
</style>
