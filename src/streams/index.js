// 相关stream的内容都保存在这边，定时的更新store中的数据
// import { listenPaymentStream, closePaymentStream, getPaymentStream, convertRecords } from '@/api/payments'
// import { listenAccountStream, closeAccountStream, getStream } from '@/api/account'
import { CLEAN_ACCOUNT_BYSTREAM,ACCOUNTINFO_BYSTREAM } from '@/store/modules/AccountStore'
import debounce from 'lodash/debounce'
import { ListenAccountStream,CloseAccountStream,ListenPaymentStream,ClosePaymentStream } from '@/api/sse'

let _data = {
    // 当前监听的账号地址
    address: undefined,
    // vuex的store对象，用于接收数据
    store: undefined,

    //

}


export function setVuexStore(store){
    console.log('--------------stream --------')
    console.log(store)
    _data.store = store
}

export function initStreams(address){
    _data.address = address
    console.log('-------------init streams -------------')
    console.log(_data.store)
    //初始化payments
    // initPaymentStream()

}



export function initPaymentStream(){
    CloseAccountStream()
    ClosePaymentStream()
    //_data.store.commit('CLEAN_PAYMENTS')
    let paymentsdata = _data.store.state.account.payments.records
    let token = null
    if(paymentsdata && paymentsdata.length > 0 ){
        token = paymentsdata[0].paging_token
    }
    let address = _data.address
    ListenAccountStream(address, debounce(function(data){
        // _data.store.commit(ACCOUNTINFO_BYSTREAM, data)
        console.log('----------------------account----')
        console.log(data)
    },500), err => {
        console.error(err)
    })
    ListenPaymentStream(address, token, debounce(function(data){
        // _data.store.dispatch('paymentSteamData',[data])
        console.log('------------ff------')
        console.log(data)
    },500),err => {
        console.log(`----payments err -- `)
        console.log(err)
    })
}

/*
export function initPaymentStream(){
    closePaymentStream()
    //_data.store.commit('CLEAN_PAYMENTS')
    let paymentsdata = _data.store.state.account.payments.records
    let token = null
    if(paymentsdata && paymentsdata.length > 0 ){
        token = paymentsdata[0].paging_token
    }
    let address = _data.address
    listenAccountStream(address, debounce(function(data){
        _data.store.commit(ACCOUNTINFO_BYSTREAM, data)
    },500), err => {
        console.error(err)
    })
    listenPaymentStream(_data.address, debounce(function(data){
        _data.store.dispatch('paymentSteamData',[data])
    },500),err => {
        console.log(`----payments err -- `)
        console.log(err)
    }, { token })
}
*/
export function closeStreams(){
    _data.address = undefined
    // closePaymentStream()
    // closeAccountStream()
    CloseAccountStream()
    ClosePaymentStream()
}

/**
 * 清理payments中的数据 
 */
export function cleanStreamData(){
    _data.store.commit('CLEAN_PAYMENTS')
    _data.store.commit('CLEAN_ACCOUNT_BYSTREAM')
}

