import * as accountapi from '@/api/account'
import * as transactionsapi from '@/api/transactions'
import * as paymentsapi from '@/api/payments'
import * as ledgerapi from '@/api/ledger'
import { isNativeAsset } from '@/api/assets'
import { BASE_RESERVE, BASE_FEE } from '@/api/gateways'
import { getDepositeAndWithdrawRecords, getAllEffectOffers } from '@/api/fchain'



export const ACCOUNT_INFO_SUCCESS = 'ACCOUNT_INFO_SUCCESS'
export const GET_TRANSACTIONS_SUCCESS = 'GET_TRANSACTIONS_SUCCESS'
export const GET_PAYMENTS_SUCCESS = 'GET_PAYMENTS_SUCCESS'
export const SELECT_PAYMENT = 'SELECT_PAYMENT'
export const CLEAN_ACCOUNT = 'CLEAN_ACCOUNT'
export const GET_LEDGER_INFO = 'GET_LEDGER_INFO'
export const GET_PAYMENT_STREAM = 'GET_PAYMENT_STREAM'
export const CLEAN_PAYMENTS = 'CLEAN_PAYMENTS'
export const ACCOUNT_IS_FUNDING = 'ACCOUNT_IS_FUNDING'
export const ACCOUNT_NOT_FUNDING = 'ACCOUNT_NOT_FUNDING'
export const GET_ALL_OFFERS = 'GET_ALL_OFFERS'
export const CLEAN_ALL_OFFERS = 'CLEAN_ALL_OFFERS'
export const CLEAN_ACCOUNT_BYSTREAM = 'CLEAN_ACCOUNT_BYSTREAM'
export const ACCOUNTINFO_BYSTREAM = 'ACCOUNTINFO_BYSTREAM'


// 某个账户的相关操作
const state = {
  // 通过查询horizon的api  /accounts/id获得的数据
  data:{balances:[]},
  //交易记录
  transactions:{ records:[] },
  payments: { records:[] },
  selectedPayment:null,//当前选择的payment的
  ledger: null,
  account_not_funding: false,//账户是否未激活
  alloffers:[],//查询账户某个时间段内的成交记录
  //depositeRecords:[],//某种资产充值记录
  //withdrawRecords:[],//某种资产提现记录
}

const actions = {
  cleanAccount({commit,state}){
    commit(CLEAN_ACCOUNT)
  },
  selectPayment({commit,state},data){
    commit(SELECT_PAYMENT,data)
  },
  async getAccountInfo({dispatch,commit,state}, address){
    //commit(CLEAN_ACCOUNT)
    console.log('---------get account info ---'+ address)
    let info = await accountapi.getAccountInfo(address)
    let assets = info.balances.map(ele=>{
      if(ele.asset_type === 'native')return 'XLM'
      return ele.asset_issuer
    })
    await dispatch('getAssetsAccounts',assets)
    await dispatch('getPayments', address)
    
    commit(ACCOUNT_INFO_SUCCESS, info)
    let ledger = await ledgerapi.getLedger()
    commit(GET_LEDGER_INFO, ledger)
   // await dispatch('getPayments',address)
  },
  async getTransactionsPage({commit,state},address){
    let data = await transactionsapi.transactionsPage(address)
    commit(GET_TRANSACTIONS_SUCCESS,data)
  },
  async getPayments({commit},address){
    let data = await paymentsapi.fetchPayments(address)
    commit(GET_PAYMENTS_SUCCESS, data)
  },
  async getLedger({commit,state}){
    let ledger = await ledgerapi.getLedger()
    commit(GET_LEDGER_INFO, ledger)
  },
  async loadmorePayments({state, commit}, address){
    if(typeof state.payments.next === 'function'){
      let data = await state.payments.next()
      let records = state.payments.records
      let newrecords = [...records, ...data.records]
      data.records = newrecords
      commit(GET_PAYMENTS_SUCCESS, data)
    }else{
      let data = await paymentsapi.fetchPayments(address)
      commit(GET_PAYMENTS_SUCCESS, data)
    }
  },
  paymentSteamData({commit,state},rows){
    commit(GET_PAYMENT_STREAM, rows)
  },
  async getAllOffers({commit,state}, {account,start_time,end_time}){
    let response = await getAllEffectOffers(account, start_time, end_time)
    commit(GET_ALL_OFFERS, response.data)
  }


}

const mutations = {
  CLEAN_ACCOUNT(state){
    state.data = {balances:[]}
    state.transactions = { records:[] }
    state.selectedPayment = null
  },
  [CLEAN_ACCOUNT_BYSTREAM](state){
    state.data = {balances:[]}
  },
  [ACCOUNTINFO_BYSTREAM](state, data){
    state.data = data
  },
  CLEAN_PAYMENTS(state){
    state.payments = { records: [] }
  },
  ACCOUNT_INFO_SUCCESS(state,info){
    state.transactions = { records:[] };
    state.selectedPayment = null;
    state.data = info;
  },
  GET_TRANSACTIONS_SUCCESS(state,data){
    state.transactions = data
  },
  GET_PAYMENTS_SUCCESS(state,data){
    state.payments = data
  },
  GET_PAYMENT_STREAM(state,rows){
    console.log('-------rows-----')
    console.log(rows)
    let records = rows.concat(state.payments.records)
    state.payments = Object.assign(state.payments,{records})
  },
  SELECT_PAYMENT(state,data){
    state.selectedPayment = data
  },
  GET_LEDGER_INFO(state, ledger){
    state.ledger = ledger
  },

  ACCOUNT_IS_FUNDING(state){
    state.account_not_funding = false
  },
  ACCOUNT_NOT_FUNDING(state){
    state.account_not_funding = true
  },
  GET_ALL_OFFERS(state, data){
    state.alloffers = data
  },
  CLEAN_ALL_OFFERS(state){
    state.alloffers = null
  }

}

const getters = {
  balances: state => {
    let info = state.data.balances
    let data = []
    info.forEach((element,index) => {
     let obj = {};
     if('native' === element.asset_type){
        obj.code = 'XLM'
        obj.issuer = 'stellar.org'
      } else {
        obj.code = element.asset_code
        obj.issuer = element.asset_issuer
      }
      obj.balance = Number(element.balance)
      obj.origin_balance = element.balance
      obj.limit = Number(element.limit)
      obj.type = element.asset_type
      data.push(obj)
    });
    return data.reverse()
    // return data
  },
  base_reserve: state =>{
    if(state.ledger){
      let base = state.ledger.records[0].base_reserve
      if(base === null || typeof base === 'undefined'){
        return  (state.ledger.records[0].base_reserve_in_stroops/10000000)
      }
      return base
    }
    return BASE_RESERVE
  },
  reserve: (state, getters) => {
    return (state.data.subentry_count + 2 ) * getters.base_reserve
  },
  base_fee: (state, getters) => {
    if(state.ledger){
      let base = state.ledger.records[0].base_fee
      if(base === null || typeof base === 'undefined'){
        return state.ledger.records[0].base_fee_in_stroops / 10000000
      }
      return base
    }
    return BASE_FEE
  },
  native: (state, getters) =>{
    if(!getters.balances)return {}
    let xlm = {}
    getters.balances.forEach((element) => {
      if(isNativeAsset(element)){
        xlm = Object.assign({},element)
      }
    })
    return xlm
  },
  records: state => {
    let _records = state.transactions.records
    let data = []
    _records.forEach(ele=>{
      data.push(Object.assign({},ele))
    })
    return data
  },
  paymentsRecords: state => {
    if(state.data.account_id){
      let _records = state.payments.records
      let data =  paymentsapi.convertRecords(state.data.account_id,_records)
      return data  
    }else{
      return []
    }
  },
  payment: state => {
    if(state.selectedPayment){
      let _records = state.payments.records
      let _id = state.selectedPayment.id
      for(var i=0,n=_records.length;i<n;i++){
        if(_id === _records[i].id)return _records[i]
      }  
    }
    return null
  },
  
  
}
export default {
  state,
  getters,
  actions,
  mutations
}