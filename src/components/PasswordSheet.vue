<template>
<div class="pwdSheetContent">
    <div class="pwdSheetWrapper">
        <v-bottom-sheet  v-model="showPwdSheet"  dark>
            <div class="sheet-content">
            <div class="sheet-input">
                <v-text-field
                    name="password"
                    :label="$t('Account.Password')"
                    v-model="inpassword"
                    :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                    :type="pwdvisible ? 'text':'password'"
                    required dark
                    ></v-text-field>
            </div>
            <div  class="sheet-btns">
                <div class="sheet-btn" @click="canclePwdInput">{{$t('Button.Cancel')}}</div>
                <div class="sheet-btn" @click="okPwdInput">{{$t('Button.OK')}}</div>
            </div>
            </div>
        </v-bottom-sheet>
    </div>
</div>
</template>

<script>
export default {
    data(){
        return {
            showPwdSheet: true,
            inpassword: null,

        }
    },
    methods:{
        canclePwdInput(){
            this.inpassword = null
            this.$emit('cancel')
        },
        okPwdInput(){
            this.$emit('ok',this.inpassword)
        },
        cleanPwd(){
            this.inpassword = null
        }

    }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.pwdSheetContent
  background: $primarycolor.gray
  opacity: 0.8
  position: fixed
  bottom: 0
  right: 0
  left: 0
  top: 0
  z-index: 9
.pwdSheetWrapper
  background: $secondarycolor.gray
  height: 140px
  position: fixed
  bottom: 0
  right: 0
  left: 0
.sheet-content
  padding: 10px 10px
.sheet-btns
  display: flex
  color: $primarycolor.green
  height: 50px
  line-height: 50px
  .sheet-btn
    flex: 1
    text-align: center

</style>
