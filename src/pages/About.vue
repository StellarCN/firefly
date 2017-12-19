/**
 * 关于我们界面，显示系统版本等内容
 */
<template>
  <div class="page" >
    <toolbar :title="$t('About.Title')" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      >
    </toolbar>
    <div class="logo-wrapper">
            <img src="../assets/img/logo-blank.png" alt="firefly" class="logo-img"/>
    </div>
    <div class="content">
      <card class="icard" padding="8px 8px">
        <div class="card-content" slot="card-content">
            <div class="row">
                <div class="label">
                    {{$t('Version')}}    
                </div>
                <div class="value">
                    {{appversion}}
                </div>
            </div>
            <div class="row">
                <div class="label">
                    github        
                </div>
                <div class="value">
                    <a href="https://github.com/stellarcn/firefly" class="link">https://github.com/stellarcn/firefly</a>
                </div>
            </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { APP_VERSION } from '@/api/gateways'
export default {
  data(){
    return {
      showmenuicon: false,
      showbackicon: true,
      appversion: APP_VERSION

    }
  },
  methods: {
    
    back(){
      this.$router.back()
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
  .content
    padding: 8px 8px
    color: $primarycolor.font
  .logo-wrapper
    height: 240px
    width: 100%
    background: $primarycolor.green
    display: block
    text-align: center
    vertical-align: middle
    padding-top: 42px
    .logo-img
      width: 120px
      height:156px
.row
  display: flex
  border-bottom: 1px solid $secondarycolor.font
  padding-top: 5px
  padding-bottom: 5px
  &:last-child
    border-bottom: 0px
  .label
    flex: 1
  .value
    flex: 3
    color: $secondarycolor.font
.link
    color: $secondarycolor.font
</style>

