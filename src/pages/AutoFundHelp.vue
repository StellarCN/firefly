//激活帮助说明
<template>
  <div>
     <toolbar :title="$t('Menu.Help')" 
          :showmenuicon="false" 
          :showbackicon="true"
          ref="toolbar"
        >
    </toolbar>
    <card >
      <div class="help pa-1 pt-4" >
        <h2 class="help-t pt-1 pl-2">一、为什么账号需要激活</h2>
        <p class="help-c pl-2">
          萤火是基于恒星网络（stellar）的去中心化钱包。<br/>
          Stellar的特性：账号（G地址）创建后并不能立即使用，需要进行账号激活。<br/>
          激活的唯一方式：老账号向新账号转账至少1XLM才能使用。这1XLM将被冻结在恒星网络。<br/>
        </p>
        <h2 class="help-t pt-1 pl-2">二、什么是XLM</h2>
        <p class="help-c pl-2">
          Stellar原生资产的标识为XLM（通常所说的恒星币又叫流明），单位为Lumens，任何账户都可以持有XLM，可以在网络中使用XLM交易其他资产。类似于BTC、ETH。<br/>
        </p>
        <h2 class="help-t pt-1 pl-2">三、什么是资产授信</h2>
        <p class="help-c pl-2">
          Stellar的任意一个账户可以任意发行一种资产，充分体现价值互联网的特性。<br/>
          例如：账户A发行资产：BTC，账户B也发行资产：BTC，但二者的发行地址绝对不同，所以两种资产属于不同发行资产，由不同的机构进行信用保证。<br/>
          您想要持有某一种发行资产，首选需要信任该资产的发行账户，即手动添加信任线（Trustline）。添加一项资产需要冻结0.5XLM。<br/>
        </p>

      </div>
    </card>
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'


export default {
  data(){
    return {
      working: false,
      err: null,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
    }),
  },
  methods: {

  },
  components: {
    Toolbar,
    Card,
  }

  
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.help
  color: $primarycolor.font
  .help-t
    font-size: 16px
    font-weight: bold
    color: $primarycolor.green
</style>
