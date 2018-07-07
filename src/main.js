// main
import Vue from 'vue'
//import Vuetify from 'vuetify'
import 'babel-polyfill'
import FastClick from 'fastclick'
import './stylus/main.styl'
import App from './App'
import router from './router'
import store from './store'
import { i18n }  from './locales/index'
require('./filters/index')
require('./directives/swiper')
import imageHW from './directives/imageHW'
require('./api/index')
import { setVuexStore } from './streams'
import { AXIOS_DEFAULT_TIMEOUT } from './api/gateways'
import axios from 'axios'
require('./api/utils') 

// animate.css
// import 'animate.css'
Vue.directive('image-wrapper', imageHW)

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

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
// Vue.use(Vuetify, {
//   theme: {
//     primary: '#21ce90',
//     error: "#f35833",
//     notice: "#303034",
//   }
// })

import '@/libs/pkgs/initVuetify'

FastClick.prototype.focus = function(targetElement) {
	var length;
	// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'number') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};
FastClick.attach(document.body)
Vue.config.productionTip = false


axios.defaults.timeout = AXIOS_DEFAULT_TIMEOUT

// axios.defaults.retry = 4;
// axios.defaults.retryDelay = 1000;
// axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
//  var config = err.config;
//  // If config does not exist or the retry option is not set, reject
//  if(!config || !config.retry) return Promise.reject(err);
//  // Set the variable for keeping track of the retry count
//  config.__retryCount = config.__retryCount || 0;
//  // Check if we've maxed out the total number of retries
//  if(config.__retryCount >= config.retry) {
//   // Reject with the error
//   return Promise.reject(err);
//  }
//  // Increase the retry count
//  config.__retryCount += 1;
//  // Create new promise to handle exponential backoff
//  var backoff = new Promise(function(resolve) {
//   setTimeout(function() {
//    resolve();
//   }, config.retryDelay || 1);
//  });
//  // Return the promise in which recalls axios to retry the request
//  return backoff.then(function() {
//   return axios(config);
//  });
// });


// setVuexStore(store)

/* eslint-disable no-new */
export const app =new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
