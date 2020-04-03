import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import { eventBus } from "@/main"
import db from '@/store/indexedDB';
export default new Vuex.Store({
  state: {
    navi_list:[],
    contents_list:[],
    idx:null
  },
  mutations: { },
  actions: {
    INIT_DB: ({state}) => {
      state.navi_list = db.init();
    },

    NAVI_ADD: ({state}, payload) => {
      let maxOrder = 0;

      let list = state.navi_list;
      for(let i = 0; i< list.length; i++){
        if(maxOrder <= list[i].order){ maxOrder = list[i].order+1; }
      }

      let idx = -1;
      let request = db.navi().add({name: payload, order: maxOrder});
      request.onsuccess = () =>{
        db.navi().openCursor().onsuccess = e => {
          var cursor = e.target.result;
          if(cursor){ 
            if(cursor.value.id > idx){ idx = cursor.value.id; }
            cursor.continue(); 
          }else{
            let request = db.navi().get(idx);
            request.onsuccess = () => {  state.navi_list.unshift(request.result); }
          }
        }
      }
    },

    NAVI_DEL: ({state}, payload) => {
      let request = db.navi().delete(payload);
      request.onsuccess = () => {
          let list = state.navi_list;
          for(let i = 0; i< list.length; i++){
            if(list[i].id == payload){ state.navi_list.splice(i, 1); break;}
          }

          let index = db.contents().index('idx');
          let range = IDBKeyRange.only(payload);
          index.openCursor(range).onsuccess = (e) => {
              var cursor = e.target.result;
              if(cursor){ cursor.delete(); cursor.continue(); }
              else{
                if(state.idx == payload){
                  state.contents_list = [];
                  state.idx = null;
                }
              }
          }
      }
    },

    NAVI_UPDATE: ({state}, payload) => {
      let request = db.navi().get(payload.id);
      request.onsuccess = () => {
        let result = request.result;
        result.name = payload.name;
        let update = db.navi().put(result);
        update.onsuccess = () => { 
          let list = state.navi_list;
          for(let i = 0; i< list.length; i++){
            if(list[i].id == payload.id){ state.navi_list[i].name = payload.name; break;}
          }
        }
      }
    },

    NAVI_MOVE: ({state}, payload) => {
      let count = payload.length;
      
      let list = payload;
      for(let i = 0; i< list.length; i++){
        let id = payload[i].id;
        let store = db.navi();
        let request = store.get(id);
        request.onsuccess = () => {
          count--;
          let result = request.result;
          result.order = count;
          store.put(result);
        }
      }
      state.navi_list = payload;
    },

    //==========================================================
    
    CONTENTS_LIST:({state}, payload) => {
      state.idx = payload;

      var list = [];
      var index = db.contents().index('idx');
      var range = IDBKeyRange.only(payload);
      index.openCursor(range).onsuccess = (e) => {
          var cursor = e.target.result;
          if(cursor){ list.push(cursor.value); cursor.continue(); }
          else{ 
            list.sort(function(a, b){ return a.order > b.order ? -1 : 1; }); 
            state.contents_list = list;
          }
      }
    },

    CONTENTS_ADD:({state}, payload) => {
      let maxOrder = 0;

      let list = state.contents_list;
      for(let i = 0; i< list.length; i++){
        if(maxOrder <= list[i].order){ maxOrder = list[i].order+1; }
      }
      
      var request = db.contents().add({
        order: maxOrder, 
        idx: payload.idx, 
        name: payload.name, 
        head: payload.head, 
        docSize: payload.docSize, 
        html: payload.html, 
        css: payload.css, 
        js: payload.js
      });
      let idx = -1;
      request.onsuccess = (e) => {
        var index = db.contents().index('idx');
        var range = IDBKeyRange.only(payload.idx);
        index.openCursor(range).onsuccess = (e) => {
            var cursor = e.target.result;
            if(cursor){
              if(cursor.value.id > idx){ idx = cursor.value.id; }
              cursor.continue();
            }else{
              let request = db.contents().get(idx);
              request.onsuccess = () => {  
                state.contents_list.unshift(request.result);
                eventBus.$emit('edit', null);
              }
            }
        }
      }
    },

    CONTENTS_DEL:({state}, payload) => {
      let request = db.contents().delete(payload);
      request.onsuccess = () => {
          let list = state.contents_list;
          for(let i = 0; i< list.length; i++){
            if(list[i].id == payload){ state.contents_list.splice(i, 1); break;}
          }
      }
    },

    CONTENTS_UPDATE: ({state}, payload) => {
      let request = db.contents().get(payload.id);
      request.onsuccess = () => {
        let result = request.result;

        result.name = payload.name;
        result.head = payload.head;
        result.docSize = payload.docSize;
        result.html = payload.html;
        result.css = payload.css;
        result.js = payload.js;

        let update = db.contents().put(result);
        update.onsuccess = () => { 
          let list = state.contents_list;
          for(let i = 0; i< list.length; i++){
            if(list[i].id == payload.id){
              state.contents_list[i].name = payload.name;
              state.contents_list[i].head = payload.head;
              state.contents_list[i].docSize = payload.docSize;
              state.contents_list[i].html = payload.html;
              state.contents_list[i].css = payload.css;
              state.contents_list[i].js = payload.js;
              eventBus.$emit('update_iframe', 'iframe'+i);
              
              break;
            }
          }
          eventBus.$emit('edit', null);
        }
      }
    },
    
    CONTENTS_MOVE:({state}, payload) => {
      let count = payload.length;
      let list = payload;
      for(let i = 0; i< list.length; i++){
        let id = payload[i].id;
        let store = db.contents();
        let request = store.get(id);
        request.onsuccess = () => {
          count--;
          let result = request.result;
          result.order = count;
          store.put(result);
        }
      }
      state.contents_list = payload;
    }

  },
  modules: { }
})

