# firefly wallet [![Build Status](https://travis-ci.org/StellarCN/firefly.svg)](https://travis-ci.org/StellarCN/firefly)


firefly is a mobile wallet for [Stellar](https://stellar.org) network. It supports android and ios platforms


## [中文文档](README-CN.md)

## [DAPP API文档](http://fireflyapi.mydoc.io/)

## [Help Document](https://wallet.fchain.io/manual/#0)

## [RoadMap](docs/ROADMAP.MD)

## Main features:
* Accounts
	* Import By QRCode
	* Create Random Account
	* NameCard
	* Export Account
	* Funding Account
	* Federation
	* Inflation
* Contacts
	* Import By QRCode
	* Export QRCode
* Assets
	* Send Asset
	* Send Asset By QRCode
	* Receive Asset
	* Trust
	* estimation (XCN)
* Funding
	* Deposite
	* Withdraw
	* History
* Trade
	* Custom Trade Pair
	* Order Book
	* Cancel Trade
	* Candlestick chart
	* History
* Security
	* PIN
	* Password
	* Data Saved Locally
* Custom horizon
* Multi Language


## Develop
```
# You can use cnpm or yarn instead of npm

# firefly depend on cordova7.x
npm i -g cordova@7.1.0
npm install -g cordova-hot-code-push-cli


git clone https://github.com/StellarCN/firefly.git
cd firefly
npm i
# build 
npm run build # generate js and css files
npm run chcp  # generate hot code update files
npm run cordova # download android and ios plugins
# unzip firefly/docs/resources/android-res.zip  to firefly/platforms/android/res
# unzip firefly/docs/resources/ios-Images.xcassets.zip to firefly/platforms/ios/firefly，replace folder Images.xcassets

# use android studio to open firefly/platforms/android, run for android

# use xcode to open firefly/platforms/ios, run for ios

```


## License
**firefly** is released under **MIT License**


