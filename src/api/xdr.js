import StellarSdk from 'stellar-sdk'

export function xdrMsg(err){
    if(err.extras && err.extras.result_xdr){
        var resultXdr = StellarSdk.xdr.TransactionResult.fromXDR(err.extras.result_xdr, 'base64');
        return resultXdr.result().results()[0].value().value().switch().name;
    }
    return null
}

export function getXdrResultCode(err){
    if(err.data && err.data.extras && err.data.extras.result_codes){
        let codes = err.data.extras.result_codes
        if(codes.operation){
            return codes.operation
        }
        if(codes.operations && codes.operations.length > 0){
            return codes.operations[0]
        }
        if(codes.transaction){
            return codes.transaction
        }
    }
}
//根据xdr，返回Transaction对象
export function xdrFromTransactionEnvelope(msg){
   // return StellarSdk.xdr.TransactionEnvelope.fromXDR(msg,"base64")
   return new StellarSdk.Transaction(msg)
}