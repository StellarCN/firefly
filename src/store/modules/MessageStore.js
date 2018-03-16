import {readMessage, saveMessage, delMessage} from "../../api/storage";

export const SAVE_MESSAGE_ITEM = "SAVE_MESSAGE_ITEM";
export const CHANGE_STATUS = "CHANGE_STATUS";
export const DEL_ITEM = "DEL_ITEM";
export const CHANGE_CURRENT_ITEM_ID = "CHANGE_CURRENT_ITEM_ID";

const state = {
  messageItems: [],//消息列表,
  currentItemId: ""
}

const getters = {
  getCurrentItem(state) {
    return state.messageItems.find(obj => obj.id == state.currentItemId);
  },
  messageItems(state) {
    return state.messageItems.sort((item1, item2) => {
        return item1.status - item2.status == 0 ? item1.createTime - item2.createTime : item1.status - item2.status;
      }
    );
  },
  unreadMessage(state) {
    return state.messageItems.filter(obj => obj.status == 0);
    j
  }
}
const mutations = {
  [SAVE_MESSAGE_ITEM](state, messageItems) {
    state.messageItems = messageItems;
  },
  [CHANGE_STATUS](state, item) {
    state.messageItems[state.messageItems.findIndex(obj => obj.id === item.id)].status = 1;
    saveMessage(state.messageItems);
  },
  [DEL_ITEM](state, index) {
    state.messageItems.splice(index, 1);
    saveMessage(state.messageItems);
  },
  [CHANGE_CURRENT_ITEM_ID](state, id) {
    state.currentItemId = id;
  }
}
const actions = {
  async save({commit}, messageItems) {
    await saveMessage(messageItems);
    commit(SAVE_MESSAGE_ITEM, messageItems);
  },
  async changeStatus({commit}, {item}) {
    commit(CHANGE_STATUS, item)
  },
  async delItem({commit}, {index}) {
    commit(DEL_ITEM, index)
  },
  async loadMessageItem({commit}) {
    commit(SAVE_MESSAGE_ITEM, await readMessage())
  },
  async changeCurrentItemId({commit}, {id}) {
    commit(CHANGE_CURRENT_ITEM_ID, id)
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}

