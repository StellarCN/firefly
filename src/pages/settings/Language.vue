/**
 * 修改语言
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <div class="lang" v-for="(item,index) in locales" :key="index" @click.stop="chose(item)">
            <span class="label">{{item.label}}</span>
            <span class="icons">
              <!-- <i class="iconfont icon-dot1" v-if="isChosed(item)"></i>
              <i class="iconfont icon-dot" v-else></i> -->
              <i class="iconfont_style_color iconfont icon-duigou" v-if="isChosed(item)"></i>
              <i class="iconfont_style  iconfont icon-duigou" v-else></i>
            </span>
          </div>
        </div>
      </card>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'
import { LANGUAGES } from '@/locales'
export default {
  data(){
    return {
      title: 'Language',
      showbackicon: true,
      showmenuicon: false,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app
    }),
    locales(){
      return LANGUAGES
    }
  
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      setLocale: 'setLocale'
    }),
    back(){
      this.$router.back()
    },
    isChosed(item){
      if(this.app.locale && item.key === this.app.locale.key){
        return true
      }
      return false
    },
    chose(item){
      //切换语言
      this.setLocale(item)
        .then(()=>{
          this.$toasted.show(this.$t('SaveSuccess'))
          this.$i18n.locale = item.key
        })
        .catch(err=>{
          console.log(err)
          this.$toasted.error(this.$t('SaveFailed'))
        })
    }
   
  },
  components: {
    Toolbar,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  .content
    padding: 5px 5px
    .mycard
        background-color:$secondarycolor.gray
      .card-content
        .lang
          padding-top: 10px
          padding-bottom: 10px
          .label
            width: 80%
          .icons
            float: right
            .iconfont
              font-size: 20px
            .iconfont.icon-dot1
              color: $primarycolor.green


.iconfont_style_color
    color:$primarycolor.green
    font-size:20px
.iconfont_style
    font-size:20px
    color:$secondarycolor.gray

</style>

