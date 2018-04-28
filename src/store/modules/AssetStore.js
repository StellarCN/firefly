import { send,getAccountInfo,sendByPathPayment } from '../../api/account'
import { getAsset,allHosts } from '../../api/assets'
import { changeTrust,trustAll as trustAllAsset } from '../../api/operations'
//import { ASSETS_ISSUER_HOST } from '@/api/gateways'
//资产相关
const state = {
  selected: {}, // 当前操作的资产
  asset:{},// stellar api操作生成的asset,
  //根据资产issuer找到account中的home_domain，然后查询toml文件中的DEPOSIT_SERVER属性
  //根据DEPOSIT_SERVER组成新的url地址去查询相应的内容
  //eg. https://api.yourdomain.com/deposit?address=GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD&asset=BTC
  assets: {},//当前操作账户的资产的account数据，

  assethosts: {XLM:'stellar.org'} ,//资产的Host_name属性

}

const getters = {
  
}
  
const actions = {
  selectAsset({commit}, asset){
    commit(SELECT_ASSET,asset)
  },
  async sendAsset({dispatch,commit, rootState, rootGetters}, {seed,address,target,asset,amount,memo_type,memo_value}){
    //seed,address,target,asset,amount,memo_type,memo_value
    let data = await send(seed,address,target,asset,amount,memo_type,memo_value,rootGetters.base_reserve)
    //刷新accountinfo
    await dispatch('getAccountInfo',address)
    //await dispatch('getPayments', address)
  },
  async sendPathPayment({dispatch, commit, rootState, rootGetters}, {seed,destination,record,memo_type,memo}){
    let data = await sendByPathPayment(seed,destination,record,memo_type,memo)
    await dispatch('getAccountInfo',address)
  },
  async trustAll({ dispatch, commit } , { seed, address, assets }){
    console.log(`----------trust all --- `)
    console.log(assets)
    let data = await trustAllAsset(seed, assets)
    console.log(data)
    //刷新accountinfo
    await dispatch('getAccountInfo',address)
  },
  async trust({dispatch,commit},{seed,address,code,issuer}){
    console.log('-------trust--------------')
    let data = await changeTrust(seed,code, issuer)
    //console.log(`-----trust--------`)
    console.log(data)
    //刷新accountinfo
    await dispatch('getAccountInfo',address)
    //await dispatch('getPayments', address)
  },
  async delTrust({dispatch,commit},{seed,address,code,issuer}){
    let data = await changeTrust(seed,code, issuer, '0')
    //console.log(`-----trust--------`)
    console.log(data)
    //刷新accountinfo
    await dispatch('getAccountInfo',address)
    //await dispatch('getPayments', address)
  },
  async assetsAccount({commit},issuer){
    let info = await getAccountInfo(issuer)
    console.log('-------xxxxxxx---------assetsAccount---')
    console.log(info)
    commit(GET_ASSET_ACCOUNT_SUCCESS,info)
  },
  async getAssetsAccounts({commit,state},arr){
    for(var i=0,n=arr.length;i<n;i++){
      if(!state.assethosts[arr[i]]){
        let info = await getAccountInfo(arr[i])
        commit(GET_ASSET_ACCOUNT_SUCCESS,info)
      }
    }
  },
  //查询所有的asset的host
  async getAllAssetHosts({commit,state}){
    let response = await allHosts()
    let result = response.data
    commit(GET_ALL_ASSET_HOSTS,result)

  }

  
}

const mutations = {
  SELECT_ASSET(state,asset){
    state.selected = asset
  //  state.asset = getAsset(asset.code,asset.issuer)
  },
  GET_ASSET_ACCOUNT_SUCCESS(state,account){
    state.assets[account.account_id] = account
   // state.assethosts[account.account_id] = { host: account.home_domain }
  },

  GET_ALL_ASSET_HOSTS(state,result){
    let hosts = result.hosts
    if(hosts){
      let data = {}
      for(var i=0,n=hosts.length;i<n;i++){
        data[hosts[i].issuer] = hosts[i].host
      }
      state.assethosts = Object.assign({},state.assethosts, data)
      console.log(`---------get all asset hosts---`)
      console.log(state.assethosts)
    }
  }

}

export const SELECT_ASSET = 'SELECT_ASSET'
export const GET_ASSET_ACCOUNT_SUCCESS = 'GET_ASSET_ACCOUNT_SUCCESS'
export const GET_ALL_ASSET_HOSTS = 'GET_ALL_ASSET_HOSTS'

export default {
  state,
  getters,
  actions,
  mutations
}