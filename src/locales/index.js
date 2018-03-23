import Vue from 'vue'
import VueI18n from 'vue-i18n'
let endata = require('./en.json')
let zhcndata = require('./zh-cn.json')

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

export const LANGUAGES = [
  EN,
  ZH_CN
]

export const MOMENT_LANGUAGES = {
  'zh_cn': 'zh-cn',
  'en': 'en'
}

export function getDeviceLanguage(){
  return new Promise((resolve,reject) => {
    console.log(navigator.globalization)
    navigator.globalization.getLocaleName(locale=>{
        console.log('-----locale---')
        console.log(locale)
        let val = locale.value
        if (['zh','zh-CN', 'zh-TW', 'zh-HK'].includes(navigator.language)) {
          resolve(ZH_CN) 
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


export const DEVICE_LANGUAGE = function getDeviceLanguage() {

  if (['zh','zh-CN', 'zh-TW', 'zh-HK'].includes(navigator.language)) {
    return ZH_CN
  } else {
    return EN
  }
}()

export const i18n = new VueI18n({
  locale: DEVICE_LANGUAGE.key,
  messages: {
    [EN.key]: endata,
    [ZH_CN.key]: zhcndata
  }
})

export const RandomPlanetsCount = 9
export const RandomColorsCount = 9

