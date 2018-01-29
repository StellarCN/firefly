/*
 * 折线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-26 15:59:49 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-01-29 13:53:57
 * @License MIT 
 */

<template>
  <div class="line">
      <div class="linegraph" :id="id" v-bind:style="{height: height + 'px'}"></div>
  </div>
</template>

<script>
var moment = require('moment')
var echarts = require('echarts')
import { getTradeAggregation, getTradeAggregation5min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_5MIN,RESOLUTION_1HOUR } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'


export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            dates:[],
            data: [],
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            
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
        resolution: {
            type: Number,
            default: RESOLUTION_1HOUR
        },
        //是否增量更新模式
        incremental: {
            type: Boolean,
            default: false
        },
        //高度
        height: {
            type: Number,
            default: 60
        }
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
        //开启定时器
        this.tinterval = setInterval(this.fetch, this.interval)
       
    },
    beforeDestroy () {
        //关闭定时器
        if(this.tinterval){
            clearInterval(this.tinterval)
            this.tinterval = null
        }
    },
    mounted () {
        this.$nextTick(()=>{
            this.init();
            this.fetch();
        })
    },
    methods: {
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
                records.reverse().map(item=>{
                    if(this.incremental){
                        this.data = []
                        this.dates = []
                    }
                    this.dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.data.push(Number(item.avg))
                })
                this.opt.xAxis.date = this.dates
                this.opt.series[0].data = this.data
                console.log(this.opt)
                console.log(JSON.stringify(this.opt))
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
                color:['#21ce90'],
                xAxis: {
                    show: false,
                    type: 'category',
                    data: this.dates
                },
                yAxis: {
                    show: false,
                    type: 'value',
                    max: function(value) {
                        return value.max * 2;
                    }
                },
                series: [{
                    data: this.data,
                    type: 'line',
                    sampling: 'average'
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
