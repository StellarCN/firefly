/**
 * K线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-25 11:53:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-03-05 16:17:56
 * @License: MIT 
 */
<template>
<card class="k-card" padding="5px 5px">
  <div slot="card-content" class="k">
      <div class="flex-row atitle" v-if="showTitle && titleData && titleData.price !== null && lastTradeAggregation">
          <div class="flex1 title-btn-div"  v-if="fullscreen">
              <v-btn class="btn-back k-icon" icon @click="back">
                <i class="material-icons  k-icon">keyboard_arrow_left</i>
            </v-btn>
          </div>
          <div :class="'flex3 textcenter ' + ( titleData.change >=0 ? 'up':'down') ">
              <div class="price textcenter">
                  <span class="price">{{titleData.price}}</span>
                  <span class="code">{{counter.code}}</span>
              </div>
              <div class="flex-row">
                  <div class="flex1 textright">
                        <span v-if="titleData.change>0">+</span>
                        <span>{{titleData.change}}&nbsp;&nbsp;</span>
                  </div>
                  <div class="flex1 textleft">
                        <span v-if="titleData.rate>0"> +</span>
                        <span>{{titleData.rate}}%</span>
                  </div>
              </div>
          </div>
          <div class="flex3 values">
              <div class=""><span class="label">24H {{$t('high')}} </span><span>{{Number(lastTradeAggregation.high).toFixed(4)}}</span></div>
              <div class=""><span class="label">24H {{$t('low')}} </span><span>{{Number(lastTradeAggregation.low).toFixed(4)}}</span></div>
              <div class=""><span class="label">24H {{$t('volume')}} </span><span>{{Number(lastTradeAggregation.base_volume).toFixed(4)}}</span></div>
          </div>
          <div class="flex1 title-btn-div">
              <v-btn icon @click="switchKgraphShow">
                <i class="material-icons k-icon" v-if="showKgraph">trending_up</i>
                <i class="material-icons  k-icon" v-else>visibility_off</i>
              </v-btn>
          </div>
         
      </div>
       
      <v-btn class="btn-fullscreen" v-if="showKgraph && !fullscreen"  icon @click="toFullscreen">
          <i class="material-icons">fullscreen</i>
      </v-btn>
      
      <div v-show="showKgraph" class="kgraph" :id="id" v-bind:style="{height: height}"></div>
      <div class="flex-row textcenter chgresolution"  v-show="showKgraph">
          <div :class="'flex1 ' + (resolution_key === 'week' ? 'active' : '')" @click="chgResolution('week')">{{$t('week')}}</div>
          <div :class="'flex1 ' + (resolution_key === 'day' ? 'active' : '')" @click="chgResolution('day')">{{$t('day')}}</div>
          <div :class="'flex1 ' + (resolution_key === 'hour' ? 'active' : '')" @click="chgResolution('hour')">{{$t('hour')}}</div>
          <div :class="'flex1 ' + (resolution_key === '15min' ? 'active' : '')" @click="chgResolution('15min')">15{{$t('minute')}}</div>
          <div :class="'flex1 ' + (resolution_key === '5min' ? 'active' : '')" @click="chgResolution('5min')">5{{$t('minute')}}</div>
      </div>
  </div>
</card>
</template>

<script>
var echarts = require('echarts')
import NP from 'number-precision'
import { getTradeAggregation, getTradeAggregation5min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_5MIN, RESOLUTION_15MIN, RESOLUTION_1HOUR, RESOLUTION_1DAY, RESOLUTION_1WEEK } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getTrades } from '@/api/trade'
import { DEFAULT_INTERVAL } from '@/api/gateways'
var moment = require('moment')
import _ from 'lodash'
import {Decimal} from 'decimal.js'
import Card from '@/components/Card'
const RESOLUTIONS = {
    "week": RESOLUTION_1WEEK,
    "day": RESOLUTION_1DAY,
    "hour": RESOLUTION_1HOUR,
    "15min": RESOLUTION_15MIN,
    "5min": RESOLUTION_5MIN
}

export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            
            resolution_key: '5min',
            resolution: RESOLUTION_5MIN,

            dates:[],//日期
            volumes: [],//成交量
            data: [],//每条数据是一个数组，[开盘价，收盘价，最低价，最高价]
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            
            //24小时的成交记录
            lastTradeAggregation: null,
            //最新的成交价格统计
            lastTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
            
            showKgraph: true,
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
        //是否增量更新模式
        incremental: {
            type: Boolean,
            default: true
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
            type: String,
            default: '220px'
        }
    },
    computed: {
      titleData(){
          if(this.lastTradeAggregation && this.lastTrade){
            let price = new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let open = new Decimal(this.lastTradeAggregation.open)
            let change = price.minus(open)
            let rate = change.times(100).dividedBy(open)
            return  _.defaultsDeep({}, this.lastTradeAggregation, {
                price: new Decimal(price.toFixed(6)).toNumber(),
                change: new Decimal(change.toFixed(4)).toNumber(),
                rate: new Decimal(rate.toFixed(2)).toNumber() })
          }
          return {}
      }  
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
        //开启定时器
        this.tinterval = setInterval(this.fetch, this.resolution)
        //如果是全屏模式，则切换为横屏
        if(this.fullscreen){
            screen.orientation.lock('landscape');
        }
        this.fetchLastTradeAggregation()
        
    },
    beforeDestroy () {
        console.log('---------before destory --------')
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
        console.log('----before mounted------')
        this.$nextTick(()=>{
           this.reload();
        })
    },
    methods: {

        ...mapActions({
            getAccountInfo: 'getAccountInfo',
        }),
        reload(){
            this.cleanData()
            this.init();
            this.fetch();
            this.fetchLastTrade()
        },
        cleanData(){
            console.log('----------------clean Data----')
            this.ele = null
            this.opt = null
            this.dates = []
            this.volumes = []
            this.data = []
            this.tinterval =  null
            this.lasttime = null
        },
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
            start_time, end_time, this.resolution, 200, 'desc')
            .then(data => {
                this.lasttime = end_time
                let records = data.records
                if(!this.incremental){
                    console.log(`--------清理 data为空-------`)
                    this.dates = []
                    this.volumes = []
                    this.data = []
                }
                records = records.reverse()
                records.forEach(item=>{                   
                    this.dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.volumes.push(Number(item.base_volume))
                    this.data.push([Number(item.open), Number(item.close), Number(item.high), Number(item.low), Number(item.base_volume)])
                })
                this.opt.xAxis[0].data = this.dates
                this.opt.xAxis[1].data = this.dates
                this.opt.series[0].data = this.volumes
                this.opt.series[1].data = this.data
                this.opt.series[2].data = this.calculateMA(5)
                this.opt.series[3].data = this.calculateMA(10)
                
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
                animation: true,
                color: this.colors,
                backgroundColor: "#212122",
              //  title: {left: 'center', text: this.base.code + '/' + this.counter.code },
                legend: { show: false, top: 30,data: ['分时', 'MA5', 'MA10']},
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
                //     type: 'slider',
                //     xAxisIndex: [0, 1],
                //     realtime: false,
                //     start: 20,
                //     end: 70,
                //     top: 20,//65,
                //     height: 20,
                //     handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                //     handleSize: '120%'
                // }, {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 0,
                    end: 100,
                    top: 10,
                    height: 20
                }],
                xAxis: [{
                    type: 'category',
                    data: this.dates,
                    boundaryGap : false,
                    axisLine: { lineStyle: { color: '#777' } },
                    axisLabel: {
                        formatter: function (value) {
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
                        handle: {show: false,margin: 30,color: '#B80C00'}
                    }
                }],
                yAxis: [{
                    scale: true,
                    splitNumber: 2,
                    axisLine: { lineStyle: { color: '#777' } },
                    splitLine: { show: false },
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
                    left: 0,
                    right: 0,
                    top: 30,//110,
                    height: 120,
                    bottom: 0
                }, {
                    left: 0,
                    right: 0,
                    height: 40,
                    top: 180,//260
                    bottom: 0
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
                    name: '分时',
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
                var sum = new Decimal(0);
                for (var j = 0; j < dayCount; j++) {
                    sum = sum.plus(this.data[i - j][1]);
                }
                result.push(sum.dividedBy(dayCount).toFixed(2))
            }
            return result;
        },
        // 查询24小时的统计数据
        fetchLastTradeAggregation(){
          let start_time = 0, end_time = new Date().getTime()
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
                start_time, end_time, RESOLUTION_1DAY, 1, 'desc')
            .then(data => {
                let records = data.records
                if(records && records.length > 0){
                    this.lastTradeAggregation = records[0]
                }
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
            })
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

        toFullscreen(){
            console.log(`------to fullscreen--`)
            this.$router.push({name: 'TradeK'})
        },
        back(){
            this.$router.back()
        },
        chgResolution(key){
            this.resolution_key = key
            this.resolution = RESOLUTIONS[key]
            this.reload()
        },
        switchKgraphShow(){
            this.showKgraph = !this.showKgraph
        }

    },
    components: {
        Card
    }

}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.k
  width: 100%
.atitle
  padding-bottom: 8px
.price
  font-size: 24px
.code
  font-size: 16px
.up
  color: $primarycolor.green
.down
  color: $primarycolor.red
.change
.rate
    line-height: 30px
    vertical-align: bottom
.label
  color: $secondarycolor.font
  padding-left: 2px
  padding-right: 2px
.values
  font-size: 14px

.btn-fullscreen
    position: absolute
    right: 12px
    z-index: 9
    .material-icons
        color: $primarycolor.green
.chgresolution
    padding-top: 8px
    padding-bottom: 5px
    color: $secondarycolor.font
    .active
        color: $primarycolor.green
.material-icons.k-icon
    color: $primarycolor.green
.title-btn-div
  line-height: 60px
.divinline
  display: inherit
</style>
