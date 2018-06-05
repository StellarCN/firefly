/*
 * K线图mixins
 * @Date: 2018-03-08 15:52:16 
 * @Last Modified time: 2018-03-15 10:15:19
 * @License MIT 
 */
import NP from 'number-precision'
import { getTradeAggregation, getTradeAggregation1min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_1MIN, RESOLUTION_15MIN, RESOLUTION_1HOUR, RESOLUTION_1DAY, RESOLUTION_1WEEK } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getTrades } from '@/api/trade'
import { DEFAULT_INTERVAL } from '@/api/gateways'
var moment = require('moment')
import  defaultsDeep  from 'lodash/defaultsDeep'
import {Decimal} from 'decimal.js'
import Card from '@/components/Card'
import indicator from '@/libs/indicator'

export default {
    data(){
        return {
          RESOLUTIONS: {
            "week": RESOLUTION_1WEEK,
            "day": RESOLUTION_1DAY,
            "hour": RESOLUTION_1HOUR,
            "15min": RESOLUTION_15MIN,
            "1min": RESOLUTION_1MIN
          },
          RESOLUTION_HOURS: {
            "week": 5880,
            "day": 840,
            "hour": 48,
            "15min": 24,
            "1min": 24
        },
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            
            resolution_key: '15min',
            resolution: RESOLUTION_15MIN,

            dates:[],//日期
            volumes: [],//成交量
            subVolumes:[],//base_volumes与counter_volumes
            data: [],//每条数据是一个数组，[开盘价，收盘价，最低价，最高价]
            macd:{diffs: [], deas: [], bars: []},
            boll:{upper: [], mid: [], lower: []},
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            
            //24小时的成交记录
            lastTradeAggregation: null,
            //最新的成交价格统计
            lastTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
            
            showKgraph: true
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
        }
    },
    computed: {
      ...mapState({
        redUpGreenDown: state => state.app.redUpGreenDown
      }),
      upColor(){
        return this.redUpGreenDown ? '#14b143' : '#ef232a'
      },
      downColor(){
        return this.redUpGreenDown ? '#ef232a' : '#14b143'
      },
      titleData(){
          if(this.lastTradeAggregation){
            let price = new Decimal(this.lastTradeAggregation.close)//new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let open = new Decimal(this.lastTradeAggregation.open)
            let change = price.minus(open)
            let rate = change.times(100).dividedBy(open)
            return  defaultsDeep({}, this.lastTradeAggregation, {
                price: price.toFixed(7),
                change: change.toFixed(7),
                rate: new Decimal(rate.toFixed(2)).toNumber() })
          }
          return {}
      }  
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
        this.tinterval = setInterval(this.fetch, this.resolution)
        this.fetchLastTradeAggregation()
    },
    beforeDestroy () {
        //关闭定时器
        if(this.tinterval){
            clearInterval(this.tinterval)
            this.tinterval = null
        }
        screen.orientation.lock('portrait');
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
            getAccountInfo: 'getAccountInfo'
        }),
        reload(){
            this.cleanData()
            this.fetch();
           // this.fetchLastTrade()
            
        },
        cleanData(){
            this.ele = null
            this.opt = null
            this.dates = []
            this.volumes = []
            this.data = []
            this.tinterval =  null
            this.lasttime = null
        },
        getStartTime(){
            let defHour = this.RESOLUTION_HOURS[this.resolution_key]
            if(!defHour){
                defHour = 24
            }
            return Number(moment().subtract(defHour,"hours").format('x'))
        },
        //请求api，获取数据
        fetch(){
          let start_time = null, end_time=null;
          if(this.lasttime){
              start_time = this.lasttime;
              end_time = new Date().getTime()
          }else{//初次请求，判断start是否存在
            start_time = this.start < 0 ? this.getStartTime() : this.start;
            end_time = this.end < 0 ? new Date().getTime() : this.end
          }
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
            start_time, end_time, this.resolution, 200, 'desc')
            .then(data => {
                
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
                    this.volumes.push(new Decimal(item.base_volume).add(item.counter_volume).toNumber())
                    this.subVolumes.push([Number(item.base_volume),Number(item.counter_volume)])
                    this.data.push([Number(item.open), Number(item.close), Number(item.high), Number(item.low), Number(item.base_volume)])
                })
                let closeData = this.data.map(item=>item[1])
                this.macd = indicator.MACD(closeData)
                this.boll = indicator.BOLL(closeData)
                this.lasttime = end_time
                //this.opt.xAxis[0].data = this.dates
                //this.opt.xAxis[1].data = this.dates
                //this.opt.series[0].data = this.volumes
                //this.opt.series[1].data = this.data
                //this.opt.series[2].data = this.calculateMA(5)
                //this.opt.series[3].data = this.calculateMA(10)
                
                //this.ele.setOption(this.opt)
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
            })
        },
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
        back(){
            this.$router.back()
        },
        chgResolution(key){
            this.resolution_key = key
            this.resolution = this.RESOLUTIONS[key]
            this.reload()
        },

    },

}