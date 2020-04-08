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

      let request = db.navi().add({name: payload, order: maxOrder});
      request.onsuccess = (e) => {
        let request = db.navi().getAll();
        request.onsuccess = () => {
          let item = request.result[request.result.length -1];
          state.idx = item.id;
          state.navi_list.unshift(item);
          state.contents_list = [];
          eventBus.$emit('navi_added', item.id);
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

      let index = db.contents().index('idx');
      let range = IDBKeyRange.only(payload);
      let request = index.getAll(range);
      request.onsuccess = () => {
        let items = request.result.sort(function(a, b){ return a.order > b.order ? -1 : 1; }); 
        state.contents_list = items;
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
      request.onsuccess = (e) => {
        let index = db.contents().index('idx');
        let range = IDBKeyRange.only(payload.idx);
        let request = index.getAll(range);
        request.onsuccess = () => {
          let item = request.result[request.result.length -1];
          state.contents_list.unshift(item);
          eventBus.$emit('edit', null);
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
    },


    //==========================================================


    EXPORT_IMPORT:({state}, payload) => {
      const fs = require("fs");
      const {dialog} = require("electron").remote;
      
      switch(payload){
        case 'export':
          let count = 0;
          let navi = [];
          let contents = [];

          let naviRequest = db.navi().getAll();
          naviRequest.onsuccess = () => {
            navi = naviRequest.result;
            count++;
            setData();
          }
          let contsRequest = db.contents().getAll();
          contsRequest.onsuccess = () => {
            contents = contsRequest.result;
            count++;
            setData();
          }
          
          function setData(){
              if(count == 2){
                let data = '["C546D425BCBF6",'+JSON.stringify(navi)+','+JSON.stringify(contents)+']';

                dialog.showSaveDialog((fileName) => {
                  if(fileName === undefined){ console.log('undefined'); return; }
                  fs.writeFile(fileName, data, (err) => { 
                    if(err){ console.log(err.message); return; } 
                  });
                });
              }
          }
        break;
        case 'import':
          dialog.showOpenDialog((fileName) => {
            if(fileName === undefined){ console.log(undefined); return; }

            fs.readFile(fileName[0], 'utf-8', (err, data) => {
              if(err){ console.log(err.message); return; }
              try{
                  let obj = JSON.parse(data);
                  if(typeof obj === 'object' && obj[0] === 'C546D425BCBF6'){
                    // navi
                    let navi = obj[1];
                    let naviRequest = db.navi().clear();
                    naviRequest.onsuccess = () => {
                      let list = [];
                      for(let i = 0; i < navi.length; i++){
                        db.navi().add({id:navi[i].id, name: navi[i].name, order: navi[i].order});
                        list.push({id:navi[i].id, name: navi[i].name, order: navi[i].order});
                      }
                      list.sort(function(a, b){ return a.order > b.order ? -1 : 1; }); 
                      state.navi_list = list; 
                      state.idx = null; 
                      eventBus.$emit('imported');
                    } 
                    // contents
                    let contents = obj[2];
                    let contsRequest = db.contents().clear();
                    contsRequest.onsuccess = () => {
                      for(let i = 0; i < contents.length; i++){
                        db.contents().add({
                          id: contents[i].id,
                          idx: contents[i].idx,
                          order: contents[i].order,
                          name: contents[i].name,
                          head: contents[i].head,
                          docSize: contents[i].docSize,
                          html: contents[i].html,
                          css: contents[i].css,
                          js: contents[i].js
                        });
                      }
                      state.contents_list = []; 
                    } 
                    eventBus.$emit('dialog', null);
                  }else{ console.log('Invalid File.'); 
                }
              }catch(e){ console.log(e); }
            });
          });
        break;
      }
    }
    
  },
  modules: { }
})

