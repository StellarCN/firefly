// 系统更新功能

const semver = require("semver");
import {
  APP_VERSION,
  APP_GITHUB,
  OFFICIAL_SITE,
  getPackageJson,
  getVersionInfo
} from "@/api/gateways";

export default {
  
  beforeDestroy () {
    document.removeEventListener('chcp_nothingToUpdate', this.nothingToUpdate,   true)
    document.removeEventListener('chcp_nothingToInstall', this.nothingToInstall, true)
  },
  mounted() {
    document.addEventListener('chcp_nothingToUpdate', this.nothingToUpdate, false)
    document.addEventListener('chcp_nothingToInstall', this.nothingToInstall, false)
   },

  methods: {
    nothingToUpdate(){
      this.$toasted.show(this.$t('NothingToInstall'))      
    },
    nothingToInstall(){
      this.$toasted.show(this.$t('NothingToInstall'))
    },
    getReleaseVersion(){
      return getPackageJson()
        .then(response=>{
          let data = response.data
          let latestVersion = data.version
          let needUpdate = semver.gt(data.version, APP_VERSION)
          return new Promise((resolve,reject) => {
            resolve({latestVersion: latestVersion, needUpdate })
          })
        })
    },
    checkForUpdates(){
      if(!chcp)return
      // this.$toasted.clear()
      // this.$toasted.show(this.$t('UpdateHint'),{duration: null})
      chcp.fetchUpdate((err,data)=>{
        if(err){
          this.working = false
          console.error(err.description)
          this.$toasted.clear()
          this.$toasted.error(this.$t('FetchUpdateError'))
          return
        }
        this.$toasted.show(this.$t('UpdateHint'))
        chcp.installUpdate(error=>{
          if(error){
            console.error(error)
            this.$toasted.clear()
            this.$toasted.error(this.$t('FetchUpdateError'))
            return
          }
          this.$toasted.clear()
          this.$toasted.show(this.$t('AfterUpdate'))
        })//end of installUpdate
      })


    }
  }

}