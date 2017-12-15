import * as accountapi from '../../api/account'
import * as transactionsapi from '../../api/transactions'
import * as paymentsapi from '../../api/payments'
import * as ledgerapi from '@/api/ledger'
import { BASE_RESERVE } from '@/api/gateways'

// 某个账户的相关操作
const state = {
  // 通过查询horizon的api  /accounts/id获得的数据
  data:{balances:[]},
  //交易记录
  transactions:{ records:[] },
  payments: { records:[] },
  selectedPayment:null,//当前选择的payment的
  ledger: null,
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
  paymentSteamData({commit,state},rows){
    commit(GET_PAYMENT_STREAM, rows)
  },


}

const mutations = {
  CLEAN_ACCOUNT(state){
    state.data = {balances:[]}
    state.transations = { records:[] }
    //state.payments = { records:[] }
    state.selectedPayment = null
  },
  CLEAN_PAYMENTS(state){
    state.payments = { records: [] }
  },
  ACCOUNT_INFO_SUCCESS(state,info){
    state.data = info
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
    console.log('get newest ledger info')
    state.ledger = ledger
  },
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
      obj.limit = Number(element.limit)
      data.push(obj)
    });
    return data.reverse()
    // return data
  },
  base_reserve: state =>{
    if(state.ledger){
      return state.ledger.records[0].base_reserve
    }
    return BASE_RESERVE
  },
  reserve: (state, getters) => {
    return (state.data.subentry_count + 2 ) * getters.base_reserve
  },
  native: (state, getters) =>{
    if(!getters.balances)return {}
    let xlm = {}
    getters.balances.forEach((element) => {
      if(element.code === 'XLM'){
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

export const ACCOUNT_INFO_SUCCESS = 'ACCOUNT_INFO_SUCCESS'
export const GET_TRANSACTIONS_SUCCESS = 'GET_TRANSACTIONS_SUCCESS'
export const GET_PAYMENTS_SUCCESS = 'GET_PAYMENTS_SUCCESS'
export const SELECT_PAYMENT = 'SELECT_PAYMENT'
export const CLEAN_ACCOUNT = 'CLEAN_ACCOUNT'
export const GET_LEDGER_INFO = 'GET_LEDGER_INFO'
export const GET_PAYMENT_STREAM = 'GET_PAYMENT_STREAM'
export const CLEAN_PAYMENTS = 'CLEAN_PAYMENTS'

export default {
  state,
  getters,
  actions,
  mutations
}