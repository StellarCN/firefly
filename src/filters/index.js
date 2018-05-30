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
});

// 数字格式化，如果是英文环境则显示结果为XXK，如果中文环境则显示XX万
Vue.filter('I18NNumberFormat', function(values){
    let locale = values[0]
    let value = values[1]
    let val = Number(value)
    if (locale.indexOf('zh') === 0) {
        if(val > 100000){
            return (val / 10000).toFixed(0) + '万';
        }
    } else {
        if(val > 100000){
            return (val / 1000).toFixed(0) + 'K';
        }
    }
    return value
});