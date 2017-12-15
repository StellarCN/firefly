import StellarSdk from 'stellar-sdk'

export function xdrMsg(err){
    if(err.extras && err.extras.result_xdr){
        var resultXdr = StellarSdk.xdr.TransactionResult.fromXDR(err.extras.result_xdr, 'base64');
        return resultXdr.result().results()[0].value().value().switch().name;
    }
    return null
}