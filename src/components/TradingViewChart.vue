/**
 * TradingView K线图
 */
<template>
  <div id="tradingviewchart" class="trading-view">
    tradingview
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { getTrades } from '@/api/trade'
import { getXdrResultCode } from '@/api/xdr'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { getAsset, isNativeAsset } from '@/api/assets'
// import { widget } from '../charting_library/charting_library.min'
// require('../udf/polyfills')
import { UDFCompatibleDatafeed } from '@/udf/dist/bundle'

export default {
  data(){
    return {
      tradingviewReady: false,
      chartWidget: null,
      feed:null,
      interval: 60000,
      MALine5: null,
      MALine10: null,
      MALine30: null,
      volumeChart:null,
    }
  },
  props: {
    base:{
      type:Object,
      required: true
    },
    counter: {
      type: Object,
      required: true
    }    
  },
  computed:{
    ...mapState({
      horizon: state => state.app.horizon,
      locale: state => state.app.locale,
    })
  },
  mounted(){
    console.log('=======================tradingview-----------------')
    TradingView.onready(()=>{
      console.log('----------tradingview ready-----------')
    })
    this.initView()
  },
  beforeDestroy(){
    if(this.chartWidget){
      this.feed.clear()
      // this.chartWidget.unsubscribe()
      // this.chartWidget = undefined
      this.chartWidget.remove()
      document.getElementById(this.containerId).innerHTML = '';
    }
  },
  methods:{
    reload(){
      this.feed.clear()
      // this.chartWidget.unsubscribe()
      // this.chartWidget = undefined
      this.chartWidget.remove()
      //document.getElementById(this.containerId).innerHTML = '';
      this.initView()
    },
    initView(){
      let url = this.base.code
      if(!isNativeAsset(this.base)){
        url += '_' + this.base.issuer
      }
      url += '-' + this.counter.code
      if(!isNativeAsset(this.counter)){
        url += '_' + this.counter.issuer
      }
      let timezone = 'Etc/UTC'
      let lang = this.locale ? this.locale.key : 'zh'
      if(lang === 'zh_cn'){
        lang = 'zh'
        timezone = 'Asia/Shanghai'
      }else if(lang === 'zh_hk'){
        lang = 'zh_TW'
        timezone = 'Asia/Shanghai'
      }
      console.log(this.horizon + '/' + url)
      this.feed = new UDFCompatibleDatafeed(this.horizon + '/firefly_trade_mock/' + url, this.interval)
        //'https://demo_feed.tradingview.com',this.interval)
        //this.horizon + '/firefly_trade_mock/' + url, this.interval)
      console.log('---------this.feed-------')
      console.log(this.feed)
      this.chartWidget = new TradingView.widget({
					debug: false, // uncomment this line to see Library errors and warnings in the console
					//fullscreen: true,
          symbol: this.base.code + '/' + this.counter.code,
					interval: '60',
					container_id: "tradingviewchart",
					//	BEWARE: no trailing slash is expected in feed URL
					datafeed: this.feed,
          library_path: "static/charting_library/",
          timezone: timezone,
					locale: lang,
					//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
          drawings_access: { type: 'black', 
            //tools: [ { name: "Regression Trend" } ] 
            tools: [{name: "Trend Line", grayed: true}, {name: "Trend Angle", grayed: true}] //todo: bb
          },
          // enabled_features: ['study_templates'],
          //enabled_features:['countdown','create_volume_indicator_by_default','volume_force_overlay','control_bar'],
          //disabled_features:['header_symbol_search','header_compare','header_saveload','header_screenshot'],

          autosize: true,
          client_id: 'tradingview.com',
          user_id:'public_user_id',
          preset: "mobile",

          // "theme": "Dark",
          // "style": "1",
          // "enable_publishing": false,
          // "withdateranges": true,
          "allow_symbol_change": true,
          // "details": true,
          // "news": [
          //   "headlines"
          // ],
          toolbar_bg:'#303034',
          overrides: {
						"paneProperties.background": "#303034",
            //"paneProperties.vertGridProperties.color": "#454545",
            //"paneProperties.horzGridProperties.color": "#454545",
						"symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor" : "#8f98ad",
            "scalesProperties.showRightScale" : true,
            "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
            "paneProperties.vertGridProperties.color": "#454545",
            "paneProperties.horzGridProperties.color": "#454545",
            "paneProperties.crossHairProperties.color": "#454545",
            "paneProperties.crossHairProperties.style": 2,
            "mainSeriesProperties.style": 1,
            "mainSeriesProperties.showCountdown": false,
            "scalesProperties.showSeriesLastValue": true,
            "mainSeriesProperties.visible": true,
            "mainSeriesProperties.showPriceLine": true,
            "mainSeriesProperties.priceLineWidth": 1,
            "mainSeriesProperties.lockScale": false,
            "mainSeriesProperties.minTick": "default",
            "mainSeriesProperties.extendedHours": false,
            "volumePaneSize": "small",
            "paneProperties.topMargin": 5,
            "paneProperties.bottomMargin": 5,
            "paneProperties.leftAxisProperties.autoScale": true,
            "paneProperties.leftAxisProperties.autoScaleDisabled": false,
            "paneProperties.leftAxisProperties.percentage": false,
            "paneProperties.leftAxisProperties.percentageDisabled": false,
            "paneProperties.leftAxisProperties.log": false,
            "paneProperties.leftAxisProperties.logDisabled": false,
            "paneProperties.leftAxisProperties.alignLabels": true,
            "paneProperties.legendProperties.showStudyArguments": true,
            "paneProperties.legendProperties.showStudyTitles": true,
            "paneProperties.legendProperties.showStudyValues": true,
            "paneProperties.legendProperties.showSeriesTitle": false,
            "paneProperties.legendProperties.showSeriesOHLC": true,
            "paneProperties.legendProperties.showLegend": true,
            "scalesProperties.showLeftScale": true,
            "scalesProperties.showRightScale": true,
            "scalesProperties.backgroundColor": "#20334d",
            "scalesProperties.lineColor": "#46587b",
            "scalesProperties.textColor": "#8f98ad",
            "scalesProperties.scaleSeriesOnly": false,
            "mainSeriesProperties.priceAxisProperties.autoScale": true,
            "mainSeriesProperties.priceAxisProperties.autoScaleDisabled": false,
            "mainSeriesProperties.priceAxisProperties.percentage": false,
            "mainSeriesProperties.priceAxisProperties.percentageDisabled": false,
            "mainSeriesProperties.priceAxisProperties.log": false,
            "mainSeriesProperties.priceAxisProperties.logDisabled": false,
            "mainSeriesProperties.candleStyle.upColor": "#3fcfb4",
            "mainSeriesProperties.candleStyle.downColor": "#fe4761",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#3fcfb4",
            "mainSeriesProperties.candleStyle.borderUpColor": "#3fcfb4",
            "mainSeriesProperties.candleStyle.borderDownColor": "#fe4761",
            "mainSeriesProperties.candleStyle.wickColor": "#737375",
            "mainSeriesProperties.candleStyle.wickUpColor": "#3fcfb4",
            "mainSeriesProperties.candleStyle.wickDownColor": "#fe4761",
            "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            "mainSeriesProperties.hollowCandleStyle.upColor": "#3fcfb4",
            "mainSeriesProperties.hollowCandleStyle.downColor": "#fe4761",
            "mainSeriesProperties.hollowCandleStyle.drawWick": true,
            "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
            "mainSeriesProperties.hollowCandleStyle.borderColor": "#3fcfb4",
            "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#3fcfb4",
            "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#fe4761",
            "mainSeriesProperties.hollowCandleStyle.wickColor": "#737375",
            "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#3fcfb4",
            "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#fe4761",
            "mainSeriesProperties.haStyle.upColor": "#3fcfb4",
            "mainSeriesProperties.haStyle.downColor": "#fe4761",
            "mainSeriesProperties.haStyle.drawWick": true,
            "mainSeriesProperties.haStyle.drawBorder": true,
            "mainSeriesProperties.haStyle.borderColor": "#3fcfb4",
            "mainSeriesProperties.haStyle.borderUpColor": "#3fcfb4",
            "mainSeriesProperties.haStyle.borderDownColor": "#fe4761",
            "mainSeriesProperties.haStyle.wickColor": "#737375",
            "mainSeriesProperties.haStyle.wickUpColor": "#3fcfb4",
            "mainSeriesProperties.haStyle.wickDownColor": "#fe4761",
            "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,
            "mainSeriesProperties.barStyle.upColor": "#3fcfb4",
            "mainSeriesProperties.barStyle.downColor": "#fe4761",
            "mainSeriesProperties.barStyle.barColorsOnPrevClose": false,
            "mainSeriesProperties.barStyle.dontDrawOpen": false,
            "mainSeriesProperties.lineStyle.color": "#0cbef3",
            "mainSeriesProperties.lineStyle.linestyle": 0,
            "mainSeriesProperties.lineStyle.linewidth": 1,
            "mainSeriesProperties.lineStyle.priceSource": "close",
            "mainSeriesProperties.areaStyle.color1": "#0cbef3",
            "mainSeriesProperties.areaStyle.color2": "#0098c4",
            "mainSeriesProperties.areaStyle.linecolor": "#0cbef3",
            "mainSeriesProperties.areaStyle.linestyle": 0,
            "mainSeriesProperties.areaStyle.linewidth": 1,
            "mainSeriesProperties.areaStyle.priceSource": "close",
            "mainSeriesProperties.areaStyle.transparency": 80



          },
          
					//  disabled_features: [
          //               "header_symbol_search",
          //               "header_interval_dialog_button",
          //               "show_interval_dialog_on_key_press",
          //               "symbol_search_hot_key",
          //               "study_dialog_search_control",
          //               // "display_market_status",
          //               "header_compare",
          //               "edit_buttons_in_legend",
          //               "symbol_info",
          //               // "border_around_the_chart",
          //               // "main_series_scale_menu",
          //               "star_some_intervals_by_default",
          //               "datasource_copypaste",
          //               // "right_bar_stays_on_scroll",
          //               // "context_menus",
          //               "go_to_date",
          //               "compare_symbol",
          //               // "timezone_menu",
          //               //"header_resolutions",//todo: przetestowac
          //               //"control_bar",//todo: przetestowac
          //               //"edit_buttons_in_legend",//todo: przetestowac
          //               // "remove_library_container_border",
          //               "header_screenshot"
          //           ],
          //           enabled_features: [
          //             // 'countdown',
          //             'create_volume_indicator_by_default',
          //             'volume_force_overlay','control_bar',
          //             "dont_show_boolean_study_arguments",
          //             "use_localstorage_for_settings",
          //             "remove_library_container_border",
          //             "save_chart_properties_to_local_storage",
          //             "side_toolbar_in_fullscreen_mode",
          //             "hide_last_na_study_output",
          //             "constraint_dialogs_movement",//todo: nie do końca jestem pewien
          //           ],
            disabled_features: [
                        "header_symbol_search",
                        "header_interval_dialog_button",
                        "show_interval_dialog_on_key_press",
                        "symbol_search_hot_key",
                        "study_dialog_search_control",
                        // "display_market_status",
                        "header_compare",
                        "edit_buttons_in_legend",
                        "symbol_info",
                        "border_around_the_chart",
                        //"main_series_scale_menu",
                        "star_some_intervals_by_default",
                        "datasource_copypaste",
                        "right_bar_stays_on_scroll",
                        // "context_menus",
                        "go_to_date",
                        "compare_symbol",
                        // "timezone_menu",
                        "header_screenshot",
                        //"header_resolutions",//todo: przetestowac
                        //"control_bar",//todo: przetestowac
                        //"edit_buttons_in_legend",//todo: przetestowac
                        "remove_library_container_border",
                    ],
                    enabled_features: [
                        "dont_show_boolean_study_arguments",
                        "use_localstorage_for_settings",
                        "remove_library_container_border",
                        "save_chart_properties_to_local_storage",
                        "side_toolbar_in_fullscreen_mode",
                        "hide_last_na_study_output",
                        "constraint_dialogs_movement",//todo: nie do końca jestem pewien
                    ]  ,
                    custom_css_url: 'chart.css',
                    studies_overrides: {
                        "volume.volume.color.0": "#fe4761",
                        "volume.volume.color.1": "#3fcfb4",
                        "volume.volume.transparency": 75,
                    },       
        });
        console.log(this.chartWidget)
        this.chartWidget.onChartReady(()=>{
          console.log('------------------chart ready---------')
          this.MALine5 = this.chartWidget.chart().createStudy('Moving Average', false, false, [5], null, {'Plot.color': '#642d92'});
          this.MALine10 = this.chartWidget.chart().createStudy('Moving Average', false, false, [10], null, {'Plot.color': '#5278a3'});
          this.MALine30 = this.chartWidget.chart().createStudy('Moving Average', false, false, [30], null, {'Plot.color': '#238031'});
          // document.getElementById('your_chart_id').childNodes[0].setAttribute('style', 'display:block;width:100%;height:100%;');
         // this.volumeChart = this.chartWidget.chart().createStudy('Volume', true, false, [20], null, {});
          // this.chartWidget.chart().createStudy('MACD', false, false, [14, 30, "close", 9])

        })

    }
  }
}
</script>

<style lang="stylus" scoped>
.trading-view
  width: 100%
  height: 50vh
</style>
