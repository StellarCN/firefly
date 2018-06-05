import Vue from 'vue'
import VueI18n from 'vue-i18n'
// let endata = require('./en.json')
let zhcndata = require('./zh-cn.json')
// let hkdata = require('./zh-hk')

Vue.use(VueI18n)

// language const variable
export const ZH_CN = {
  key: 'zh_cn',
  label: '简体中文'
}
export const EN = {
  key: 'en',
  label: 'English'
}

export const ZH_HK = {
  key: 'zh_hk',
  label: '港澳繁體'
}

export const ZH_TW = {
  key: 'zh_tw',
  label: '台灣正體'
}

export const LANGUAGES = [
  EN,
  ZH_CN,
  ZH_HK
]

export const MOMENT_LANGUAGES = {
  'zh_cn': 'zh-cn',
  'en': 'en',
  'zh_hk': 'zh-hk',
  // 'zh_tw': 'zh-tw'
  
}

export function getDeviceLanguage(){
  return new Promise((resolve,reject) => {
    navigator.globalization.getLocaleName(locale=>{
        let val = locale.value
        if (['zh','zh-CN'].includes(val)) {
          resolve(ZH_CN)
        }else if('zh-HK' === val){
          resolve(ZH_HK)
        }else if('zh-TW' === val){
          resolve(ZH_HK)
        } else {
          resolve(EN)
        }
      },()=>{
        //reject()
        resolve(ZH_CN)
      }
    );
  })
}


export const i18n = new VueI18n({
  locale: ZH_CN.key,
  messages: {
    // [EN.key]: endata,
    [ZH_CN.key]: zhcndata,
    // [ZH_HK.key]: hkdata,
    // [ZH_TW.key]: twdata
  }
})

export const RandomPlanetsCount = 9
export const RandomColorsCount = 9

