import Vue from 'vue'
import { getServer} from './server'
import * as storage from './storage'
import crypt from './crypt'
import { federation, federationServer } from './federation'
import * as account from './account'

const api = {
  getServer,
  storage,
  crypt,
  federation,
  federationServer,
  account,
  
}

Object.defineProperty(Vue.prototype, '$api', {
  get () { return api }
})

export default api