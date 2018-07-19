# 萤火钱包[![Build Status](https://travis-ci.org/StellarCN/firefly.svg)](https://travis-ci.org/StellarCN/firefly)

萤火钱包是[恒星网络](https://stellar.org)的手机钱包，支持安卓和IOS平台


## [English Document](README.md)

## [DAPP API文档](http://fireflyapi.mydoc.io/)

## [帮助文档](https://wallet.fchain.io/manual/#0)

## [路线图](docs/ROADMAP_CN.MD)

## 主要功能:
* 多账户
	* 二维码导入
	* 创建随机账户
	* 账户名片
	* 导出账户二维码
	* 激活账户
	* 支持联邦地址
	* 支持通胀池
* 联系人
	* 二维码导入
	* 导出二维码
* 资产
	* 发送资产
	* 扫描二维码发送资产
	* 接收资产
	* 信任资产
	* 资产预估（XCN）
* 充值提现
	* 充值
	* 提现
	* 历史记录查询
* 交易
	* 自定义交易对
	* 交易盘面
	* 撤消委单
	* K线图展示功能
	* 交易历史
* 安全
	* PIN
	* 密码
	* 数据保存在本地
* 支持自定义horizon
* 多语言


## 开发
```
# 可以使用cnpm或yarn代替npm

# 需要安装cordova7.x的版本
npm i -g cordova@7.1.0
npm install -g cordova-hot-code-push-cli
git clone https://github.com/stellarcn/firelfy.git
cd firefly
npm i
# 打包
npm run build # 生成js css等文件
npm run chcp  # 生成运态更新文件
npm run cordova # 下载android和ios及相关插件
# 解压 firefly/docs/resources/android-res.zip到firefly/platforms/android/res目录
# 解压firefly/docs/resources/ios-Images.xcassets.zip到firefly/platforms/ios/firefly目录，替换Images.xcassets

# 使用android studio打开firefly/platforms/android，即可远行android项目

# 使用xcode打开firefly/platforms/ios，即可运行ios项目

```



## 开源协议
**萤火钱包** 使用 **MIT License**


