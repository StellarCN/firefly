<template>
  <div class="messagepage">
       <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ></toolbar>
      <div class="messagecenter_word">this is the first </div>
      <div class="messagecenter_word">this is the secondary message</div>
      <div class="messagecenter_word">this is the thirdary message</div>
      <div class="messagecenter_word">this is the fourth message</div>
      
  </div>
</template>

<script>
// import '@/api/sqlstorage' as SqlStorage
import  SqlStorage from  '@/api/sqlstorage'
import Toolbar from '../../components/Toolbar'
export default {
    data(){
        return {
            title:"MessageCenter",
            showbackicon: true,
            showmenuicon: false,
        }
    },
    components:{
        Toolbar,
        SqlStorage,
    },
    methods:{
        back(){
            this.$router.back();
        console.log("-------------"+SqlStorage.DB_NAME)
          
        },
    },
    beforeMount:{
        // SqlStorage.initDB()
    }

}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'

.messagepage
    height:100%
    background-color:$primarycolor.gray

.messagecenter_word
    color:$primarycolor.green
    font-size:20px
    background-color:$secondarycolor.gray
    margin:5px 5px 
    padding:2px 2px 2px 5px
    border-radius:5px
    word-break:break-all

</style>
