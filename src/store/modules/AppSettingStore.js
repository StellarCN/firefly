// appsetting store encrypt by default key @see ../../api/storage.js LOCK_KEY
import { readAppSetting, saveAppSetting as save } from '../../api/storage'
import { OFFICIAL_HORIZON, CHINA_HORIZON } from '../../api/horizon'

// 状态字段
const state = {
  // 默认语言
  locale: null,
  // 是否开启PIN码
  enablePin: false,
  // PIN码值
  pin: null,
  horizon: OFFICIAL_HORIZON,//CHINA_HORIZON,//OFFICIAL_HORIZON,
  //通讯录，需要保存
  contacts: [],
  nextContactId: 0,
  myaddresses:[],//常用地址信息
  myapps:[],//当前用户自定义的app
  price:[],//从自定义api查询到价格表
}

const BLANK_USUAL = {name:null,address:null,memotype:null,memo:null}

const actions = {
  // 加载钱包设置
  async loadAppSetting ({ commit }) {
    let data = await readAppSetting()
    commit(CHANGE_APPSETTING_STATE, data)
  },
  // 保存钱包设置
  async saveAppSetting( { commit, state }, data ) {
    await save(Object.assign({}, state, data))
    commit(CHANGE_APPSETTING_STATE, data)
  },
  // 启用ping码
  async enablePing( { dispatch,commit },pin) {
    await dispatch('saveAppSetting', {enablePin: true, pin: pin})
  },
  //停用ping码
  async disablePing ({dispatch,commit}) {
    await dispatch('saveAppSetting', {enablePin: false, pin: null})
  },
  // 修改语言
  async setLocale({dispatch,commit}, locale){
    await dispatch('saveAppSetting', {locale})
  },
  // 修改horizon配置
  async setHorizon({dispatch,commit},horizon){
    await dispatch('saveAppSetting', { horizon })
  },

  //=========联系人业务=================

  // 新增联系人
  async createContact({dispatch,commit,state}, contact){
    let contacts = [...state.contacts,contact]
    console.log('---------contacts-------')
    console.log(contacts)
    let nextContactId = state.nextContactId + 1
    await dispatch('saveAppSetting', { contacts,nextContactId })
    //commit(CONTACT_ID_INCREMENT)
  },

  // 修改联系人
  async updateContact({dispatch,commit,state}, {id_temp, contact}){
    console.log(state)
    let contacts = [...state.contacts]
    console.log(contacts)
    var index = state.contacts.map(function(x) {return x.id}).indexOf(id_temp)
    console.log('==========================i update========= ' + index)
    contacts[index] = contact
    console.log(state)
    await dispatch('saveAppSetting', { contacts })
  },

  // 删除联系人
  async deleteContact({dispatch,commit,state}, {id_temp, contact}){
    let contacts = [...state.contacts]
    console.log('==========================id to delte========= ' + id_temp)
    console.log(contacts)
    var maptemp = state.contacts.map(function(x) {return x.id})
    console.log(maptemp)
    var index = maptemp.indexOf(id_temp)
    //var index = state.accountData.contacts.map(function(x) {return x.id}).indexOf(id_temp)
    console.log('==========================i delete========= ' + index)
    var delcont = contacts.splice(index,1)
    console.log('delete contact is ' + delcont.toString())
    await dispatch('saveAppSetting', { contacts })
  },
  //==========联系人业务  end===================

  //恢复数据（联系人和地址）
  async recoveryContactsAndAddresses({dispatch,commit,state}, {contacts,myaddresses}){
    let contactids = state.contacts.map(item=> item.address)
    let noconflicts = contacts.filter(item=> contactids.indexOf(item.address) < 0)
    let newcontacts = [...state.contacts, noconflicts]
    let myaddresseids = state.myaddresses.map(item=> item.address)
    let noconflicts2 = myaddresses.filter(item=> myaddresseids.indexOf(item.address) < 0)
    let newmyaddresses = [...state.myaddresses, noconflicts2]
    await dispatch('saveAppSetting', { contacts: newcontacts, myaddresses: newmyaddresses })
    //commit(CONTACT_ID_INCREMENT)
  },
  
  //=========常用地址=================
  // 新增
  async createMyAddress({dispatch,commit,state}, data){
    let arr = [...state.myaddresses,data]
    await dispatch('saveAppSetting', { myaddresses: arr })
    //commit(CONTACT_ID_INCREMENT)
  },

  // 修改
  async updateMyAddress({dispatch,commit,state}, data){
    console.log(state)
    let arr = [...state.myaddresses]
    var index = arr.map(function(x) {return x.name}).indexOf(data.name)
    console.log('==========================i update========= ' + index)
    arr[index] = data
    console.log(state)
    await dispatch('saveAppSetting', { myaddresses: arr })
  },

  // 删除
  async deleteMyAddress({dispatch,commit,state}, data){
    let arr = [...state.myaddresses]
    var index = arr.map(function(x) {return x.name}).indexOf(data.name)
    //var index = state.accountData.contacts.map(function(x) {return x.id}).indexOf(id_temp)
    console.log('==========================i delete========= ' + index)
    var deldata = arr.splice(index,1)
    console.log('delete myaddress is ' + deldata.toString())
    await dispatch('saveAppSetting', { myaddresses: arr })
  },
  //==========我的常用地址 end===================

  //=======自定义第三方应用功能 start =========
  async addMyApp({dispatch, commit, state} , app){
    let apps = [...state.myapps,app]
    await dispatch('saveAppSetting', { myapps: apps })
  },
  async deleteMyApp({dispatch, commit,state}, index){
    let data = [...state.myapps]
    data.splice(index, 1)
    await dispatch('saveAppSetting', { myapps: data })
  },
  async modifyMyApp({dispatch, commit, state} , {index, app}){
    let data = [...state.myapps]
    data[index] = app
    await  dispatch('saveAppSetting', { myapps: data })
  }
  //========自定义第三方应用功能  end=============


}

export const SET_PRICE_BY_API = 'SET_PRICE_BY_API'

const mutations = {
  CHANGE_APPSETTING_STATE(state, data){
    state = Object.assign(state, data)
  },
  [SET_PRICE_BY_API](state,data){
    state.price = data
  }
  

}

export default {
  state,
  actions,
  mutations
}

export const CHANGE_APPSETTING_STATE = 'CHANGE_APPSETTING_STATE'
