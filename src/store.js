/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue'
import Vuex from 'vuex'
import { io } from './main'

Vue.use(Vuex)

// const now = new Date()
const store = new Vuex.Store({
  state: {
    // 当前用户
    user: {
      name: 'coffce',
      img: 'images/1.jpg'
    },
    // 会话列表
    sessions: [
      // {
      //   id: 1,
      //   type: 'private',
      //   user: {
      //     name: '示例介绍',
      //     img: 'images/2.png'
      //   },
      //   messages: [
      //     {
      //       content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
      //       date: now
      //     }, {
      //       content: '项目地址: https://github.com/coffcer/vue-chat',
      //       date: now
      //     }
      //   ]
      // },
      // {
      //   id: 2,
      //   type: 'private',
      //   user: {
      //     name: 'webpack',
      //     img: 'images/3.jpg'
      //   },
      //   messages: []
      // }
    ],
    // 当前选中的会话
    currentSessionId: undefined,
    // 过滤出只包含这个key的会话
    filterKey: ''
  },
  getters: {
    session: ({ sessions, currentSessionId }) => sessions.find(session => session.id === currentSessionId),
    user: ({ user }) => user,
    filterKey: ({ filterKey }) => filterKey,
    // 过滤后的会话列表
    sessions: ({ sessions, filterKey }) => {
      const result = sessions.filter(session => session.user.name.includes(filterKey))
      return result
    },
    // 当前会话index
    currentId: ({ currentSessionId }) => currentSessionId
  },
  mutations: {
    INIT_DATA (state) {
      const data = JSON.parse(localStorage.getItem('vue-chat-session'))
      if (data) {
        data.map(joined => {
          if (state.sessions.find(({ id: joinedId }) => joinedId === joined.id)) return undefined
          return io.emit('join-room', { room: joined.id })
        })
      }
    },
    // 发送消息
    SEND_MESSAGE ({ sessions, currentSessionId }, content) {
      const session = sessions.find(item => item.id === currentSessionId)
      session.messages.push({
        content: content,
        date: new Date(),
        self: true
      })
    },
    RECV_MESSAGE ({ sessions }, content) {
      console.log(sessions, content)
      const session = sessions.find(item => item.id === content.id)
      session.messages.push({
        content: content.message,
        date: new Date(),
        user: content.user,
        self: false
      })
    },
    // 选择会话
    SELECT_SESSION (state, id) {
      state.currentSessionId = id
    },
    CREATE_SESSION (state, data) {
      state.sessions.push({
        id: data.id,
        type: data.type,
        user: {
          name: data.name || data.id.toString(),
          img: data.avatar || 'images/2.png'
        },
        messages: []
      })
    },
    // 搜索
    SET_FILTER_KEY (state, value) {
      state.filterKey = value
    },
    CHANGE_USERDATA (state, value) {
      state.user.name = value.name
      state.user.img = value.img || state.user.img
    }
  },
  actions: {
    initData: ({ commit }) => {
      commit('INIT_DATA')
    },
    changeUserData: ({ commit }, data) => {
      commit('CHANGE_USERDATA', data)
    },
    sendMessage: ({ commit, state }, content) => {
      console.log(state.sessions)
      const session = state.sessions.find(item => item.id === state.currentSessionId)
      io.emit('client-message', {
        room: session.id,
        message: content,
        user: state.user
      })
      commit('SEND_MESSAGE', content)
    },
    selectSession: ({ commit }, id) => commit('SELECT_SESSION', id),
    search: ({ commit }, value) => commit('SET_FILTER_KEY', value),
    reciveMessage: ({ commit }, content) => commit('RECV_MESSAGE', content),
    createSession: ({ commit }, data) => commit('CREATE_SESSION', data),
    'SOCKET_joined-room': ({ dispatch, state }, { room, type }) => {
      dispatch('createSession', {
        id: room,
        type: type
      })
      if (!state.currentSessionId) dispatch('selectSession', room)
    },
    'SOCKET_client-message': ({ dispatch }, { room, user = {}, message }) => {
      dispatch('reciveMessage', {
        id: room,
        user,
        message
      })
    }
  }
})

store.watch(
  (state) => state.sessions,
  (val) => {
    console.log('CHANGE: ', val)
    localStorage.setItem('vue-chat-session', JSON.stringify(val))
  },
  {
    deep: true
  }
)

export default store
