// 相关stream的内容都保存在这边，定时的更新store中的数据
import { listenPaymentStream, closePaymentStream, getPaymentStream, convertRecords } from '@/api/payments'


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
    initPaymentStream()

}

export function initPaymentStream(){
    closePaymentStream()
    //_data.store.commit('CLEAN_PAYMENTS')
    let paymentsdata = _data.store.state.account.payments.records
    let token = null
    if(paymentsdata && paymentsdata.length > 0 ){
        token = paymentsdata[0].paging_token
    }
    listenPaymentStream(_data.address, (data)=>{
        _data.store.dispatch('paymentSteamData',[data])
    },err => {
        console.log(`----payments err -- `)
        console.log(err)
    }, { token })
}

export function closeStreams(){
    _data.address = undefined
    closePaymentStream()
}

