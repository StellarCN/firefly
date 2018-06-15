/**
*选择语言
 */
<template>
    <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
        <!-- <div>
            <ul v-for="item in languages" :key="item.language_chosed">
                <li v-text="item.language_chosed"></li>
            </ul>
            <div v-for="(item,index) in locales" :key="index">
                <span v-text="item.label"></span>
            </div>
        </div> -->
        <div class="content">
            <card padding="10px 10px" class="mycard">
                <div class="card-content" slot="card-content">
                    <div class="lang" v-for="(item,index) in locales" :key="index" @click.stop="chose(item)">
                        <span class="label" v-text="item.label"></span>
                        <span class="icons">                       
                            <!-- <i class="iconfont icon-dot1" v-if="isChosed(item)">✔</i>
                            <i class="iconfont icon-dot" v-else>✔</i> -->
                            <i class="iconfont_style_color  iconfont icon-duigou" v-if="isChosed(item)"></i>
                            <i class="iconfont_style  iconfont icon-duigou" v-else></i>
                        </span>
                    </div>
            
                </div>
            </card>
        </div>
        <div class="bottom_start" @click="to_guidepage">
            {{$t("Start")}}
        </div>
        
    </div>
  
</template>

<script>
import { LANGUAGES } from '@/locales'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'

export default {
    data () {
        return {
                
                    title:'Language',
                    showbackicon: false,
                    showmenuicon: false,
                 
                }
            },
    computed:{
        ...mapState({
            account: state => state.accounts.selectedAccount,
            accountData: state => state.accounts.accountData,
            app: state => state.app
            }),
        locales ()  {
             return LANGUAGES
                    }

    },
    methods :{
        to_guidepage(){
            this.$router.push({name: 'Guidepage'})
        },
         ...mapActions({
                setLocale: 'setLocale'
                }),
            back(){
            this.$router.back()
            },
        isChosed(item){
            if(item && this.app.locale && item.key === this.app.locale.key){
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
                this.$toasted.error(this.$t('SaveFailed'))
                })
            },

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
  height:100%
.content
    padding : 7px 7px
    background: $primarycolor.gray
    height:82vh
    .mycard
        background:$secondarycolor.gray
        height:100% 
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

.bottom_start
    position:fixed
    bottom: 0px
    left: 0
    right: 0
    text-align:center
    background: $primarycolor.gray
    z-index: 9
    color: $primarycolor.green
    // top: calc(100vh - 100px)
    padding-bottom: 8px
    padding-bottom: calc(8px + constant(safe-area-inset-bottom))
    padding-bottom: calc(8px + env(safe-area-inset-bottom))

.iconfont_style_color
    color:$primarycolor.green
    font-size:20px
.iconfont_style
    font-size:20px
    color:$secondarycolor.gray
</style>

