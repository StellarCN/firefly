import Vue from 'vue'
import { shortAddress, miniAddress } from '../api/account'
// short address
Vue.filter('shortaddress', shortAddress)

Vue.filter('miniaddress', miniAddress)

//数字如果超过100000，则显示为100K
Vue.filter('KNumber', function(value){
    let val = Number(value)
    if(val > 100000){
        return (val / 1000).toFixed(0) + 'K';
    }
    return value;
})