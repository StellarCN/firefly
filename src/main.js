// main
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'babel-polyfill'
import FastClick from 'fastclick'
import './stylus/main.styl'
import App from './App'
import router from './router'
import store from './store'
import { i18n }  from './locales/index'
require('./filters/index')
require('./directives/swiper')
require('./api/index')
import { setVuexStore } from './streams'
import { AXIOS_DEFAULT_TIMEOUT } from './api/gateways'
import axios from 'axios'
require('./api/utils') 

// animate.css
import 'animate.css'

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

import vueMethodsPromise from 'vue-methods-promise'

Vue.use(vueMethodsPromise, {
  hookName: '$promise', // Component default hook name
  promise: (mp) => { // Promise callback
    mp.then(function (res) {
        //console.log(res)
      })
      .catch(function (err) {
       // console.log(err.msg) // Test error
      })
  }
})

var VueCordova = require('./libs/vue-cordova');
Vue.use(VueCordova);


import Toasted from 'vue-toasted';
Vue.use(Toasted,{ 
  theme: "primary", 
  position: "bottom-center", 
  duration : 3000
})

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)
}

// Vue.use(Vuetify)
Vue.use(Vuetify, {
  theme: {
    primary: '#21ce90',
    error: "#f35833",
    notice: "#303034",
  }
})
FastClick.attach(document.body)
Vue.config.productionTip = false


axios.defaults.timeout = AXIOS_DEFAULT_TIMEOUT


setVuexStore(store)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
