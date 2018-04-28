<template>
  <v-layout row wrap>
      <v-flex xs5>
        <v-dialog
          ref="startDlg"
          persistent
          v-model="startDlgModel"
          lazy
          full-width
          width="290px"
          :return-value.sync="startDate"
        >
          <v-text-field
            slot="activator"
            :label="$t('StartDate')"
            v-model="startDate"
            readonly
          ></v-text-field>

          <v-date-picker v-model="startDate" scrollable :locale="locale">
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="startDlgModel = false">{{$t('Button.Cancel')}}</v-btn>
            <v-btn flat color="primary" @click="chooseStart">{{$t('Button.OK')}}</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
      <v-flex xs5>
        <v-dialog
          ref="endDlg"
          persistent
          v-model="endDlgModel"
          lazy
          full-width
          width="290px"
          :return-value.sync="endDate"
        >
          <v-text-field
            slot="activator"
            :label="$t('EndDate')"
            v-model="endDate"
            readonly
          ></v-text-field>

          <v-date-picker v-model="endDate" scrollable :locale="locale">
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="endDlgModel = false">{{$t('Button.Cancel')}}</v-btn>
            <v-btn flat color="primary" @click="$refs.endDlg.save(endDate)">{{$t('Button.OK')}}</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
      <v-flex xs2>
        <v-btn flat color="primary" @click="doSearch" icon>
          <v-icon>{{btnIco}}</v-icon>
        </v-btn>
      </v-flex>

       <v-dialog v-model="errDlg" max-width="500px">
        <v-card>
          <v-card-text>{{$t(err)}}</v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat @click.stop="errDlg=false">{{$t('Button.OK')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-layout>
    

</template>

<script>
import moment from 'moment'
import { MOMENT_LANGUAGES } from '@/locales'
export default {
  data(){
    return {
      locale: 'en',
      startDlgModel: false,
      startDate: null,
      endDlgModel: false,
      endDate: null,
      errDlg: false,
      err: null,
      
    }
  },
  props: {
    btnIco:{
      type: String,
      default: 'search'
    },
    start: {
      type: Number
    },
    end: {
      type: Number
    }
  },
  beforeMount () {
    this.locale = MOMENT_LANGUAGES[this.$i18n.locale]||'en'
    moment().locale(this.locale)
    if(this.start != null ){
      this.startDate = moment(this.start).format('YYYY-MM-DD')
    }
    if(this.end!=null){
      this.endDate = moment(this.end).format('YYYY-MM-DD')
    }
  },
  methods: {
    chooseStart(){
      if(moment(this.startDate).isAfter(this.endDate)){
        this.err = 'StartDateIsAfterEndDate'
        this.errDlg = true
        return
      }
      this.$refs.startDlg.save(this.startDate)
    },
    chooseEnd(){
      if(moment(this.startDate).isAfter(this.endDate)){
        this.err = 'StartDateIsAfterEndDate'
        this.errDlg = true
        return
      }
      this.$refs.endDlg.save(this.endDate)
    },
    doSearch(){
      this.$emit('doSearch',{start: this.startDate, end: this.endDate})
    }
  }
}
</script>

<style>

</style>
