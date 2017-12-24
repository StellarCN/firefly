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

export const DEVICE_LANGUAGE = function getDeviceLanguage() {
  // console.log("getDeviceLanguage: " + navigator.language);
  if (['zh-CN', 'zh-TW', 'zh-HK'].includes(navigator.language)) {
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

