import { createStore } from "vuex";


export const store = createStore({
    state(){
        return {
            socket: null,
            isChattingView: false
        }
    },
    getters: {
        getSocket(state) {
            return state.socket
        },

        getIsChattingView(state) {
            return state.isChattingView
        }
    },

    mutations:{
        setSocket(state, socket) {
            state.socket = socket
        },
        setIsChattingView(state, isChattingView) {
            state.isChattingView = isChattingView
        }
    },
    actions:{

    }
})