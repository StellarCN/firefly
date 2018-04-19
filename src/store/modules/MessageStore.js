import { getMsgLinks, setMsgLinks, readMsg, setReadMsgs, getReadMsgs} from "@/api/storage";
import { getFchainRss } from '@/api/fchain'

export const GET_MESSAGES = "GET_MESSAGES"//获取到新的message
export const READ_MESSAGE = "READ_MESSAGE"//读取某个消息
export const SET_CURRENT_MESSAGE = 'SET_CURRENT_MESSAGE'
export const READ_ALL = 'READ_ALL'

const state = {
  items: [],//消息列表,
  reads: [],
  currItem: {}//当前选中要展示的消息
}

const getters = {
  //未读的消息数量
  unReadCount: state => {
    return state.items.length - state.reads.length
  }
}

const actions = {
  async getMessages({commit}) {
    let items = await getFchainRss()
    setMsgLinks(items.map(item=>item.link))
    let readlinks = getReadMsgs()
    commit(GET_MESSAGES, {messages: items, reads: readlinks});
  },
  
  selectMsg({commit,state}, msg){
    commit(SET_CURRENT_MESSAGE, msg)
    if(state.reads.indexOf(msg.link) > -1 ){
      return
    }
    readMsg(msg.link)
    commit(READ_MESSAGE,msg)
  },
  readAllMsg({commit,state}){
    let ids = state.items.map(item=> item.link)
    setReadMsgs(ids)
    commit(READ_ALL)
  }
  

}


const mutations = {
  [GET_MESSAGES](state, {messages, reads}) {
    state.items = messages
    state.reads = reads
    state.currItem = {}
  },
  [READ_MESSAGE](state, item) {
    state.reads.push(item.link)
  },
  [SET_CURRENT_MESSAGE](state,item){
    state.currItem = item
  },
  [READ_ALL](state){
    state.reads = state.items.map(item=>item.link)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

