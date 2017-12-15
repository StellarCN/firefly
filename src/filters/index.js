import Vue from 'vue'
import { shortAddress, miniAddress } from '../api/account'
// short address
Vue.filter('shortaddress', shortAddress)

Vue.filter('miniaddress', miniAddress)

