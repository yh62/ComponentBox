<template>
    <aside>
        <header><img src="@/assets/logo.svg" alt="" draggable="false"/> COMPONENT BOX</header> 
        <section>
          <input type="text" @input="searchBind" placeholder="Search" ref="search"/>
          <button type="button" class="add-btn icon" @click="add"><i>add</i></button>
        </section>
        <nav>
          <draggable tag="ul" v-model="navi_list" handle=".drag-btn" @choose="move" @end="move">
            <li v-for="(list, key) in navi_list" :key="list.id" :ref="'li'+key"
                @mouseenter="hover = list.id" @mouseleave="hover = null"
                :class="{hover: hover == list.id, active: active == list.id, more:more == list.id}"
                v-show="list.show"
            >
              <button type="button" class="drag-btn icon"><i>drag_handle</i></button>
              <h3 @click="selecte(list.id)">{{ list.name }}</h3>
              <button type="button" class="more-btn icon" @click="activeMore(list.id)" @mouseenter="more_hover = false" @mouseleave="more_hover = true">
                <i>more_vert</i>
                <div v-show="more == list.id" >
                    <button type="button" class="update-btn icon" @click="update(list.id, list.name)"><i>edit</i><span>Rename</span></button>
                    <button type="button" class="delete-btn icon" @click="del(list.id)"><i>delete</i><span>Delete</span></button>
                </div>
              </button>
            </li>
          </draggable>
        </nav>
      </aside>
</template>

<script>
import _ from 'lodash';
import { eventBus } from "@/main"
import draggable from 'vuedraggable'

export default {
  name: 'Navi',
  components: { draggable },
  mounted() { 
    eventBus.$on('navi_add', (idx) => { 
      this.active = idx; 
      this.search = '';
      this.$refs.search.value = '';
    }); 
    eventBus.$on('navi_change', (value) => { //update, del 
      if(this.search != '' && this.$refs.search.value != ''){
          this.search = value;
          this.$refs.search.value = value;
      }
    });
    eventBus.$on('imported', (idx) => { 
      this.active = null;
      this.hover = null;
      this.hover_temp = null;
      this.more = null;
      this.more_hover = true;
      this.search = '';
    }); 
  },
  data(){
    return{
      active:null,
      hover:null,
      hover_temp:null,
      more:null,
      more_hover:true,
      search:''
    }
  },
  computed:{
    navi_list:{
      get(){
        let list = this.$store.state.navi_list;
        for(let i = 0; i<list.length; i++){
          if(this.search == ''){
            list[i].show = true;
          }else{
            if(list[i].name.toLowerCase().indexOf(this.search.toLowerCase()) > -1){ list[i].show = true; }
            else{ list[i].show = false; }
          }
        }
        return list; 
      },
      set(value){ this.$store.dispatch('NAVI_MOVE', value); }
    }
  },
  methods:{
    add(){ eventBus.$emit('dialog', {type:'navi_add'}); },
    del(idx){ eventBus.$emit('dialog', {type:'navi_del', id:idx}); },
    update(idx, name){  eventBus.$emit('dialog', {type:'navi_update', id:idx, name:name}); },
    move(e){
      if(e.type == 'choose'){ this.hover_temp = this.hover; }
      if(e.type == 'end'){ this.hover = this.hover_temp; }
    },
    selecte(idx){ 
      eventBus.$emit('search_empty');
      this.active = idx;
      this.$store.dispatch('CONTENTS_LIST', idx);
    },
    activeMore(idx){
      this.more = idx;
      document.querySelector('#main').addEventListener('mousedown', this.closeMore);
    },
    closeMore(){
      if(this.more_hover){ this.more = null; }
      document.querySelector('#main').removeEventListener('mousedown', this.closeMore);
    },
    searchBind:_.debounce(function(e){
      this.search = e.target.value;
    }, 500)
  }
}  
</script>

<style scoped>
/* aside */
aside{width:100%; height:100%; color:#fff;}

header{background: #212529; height:40px; display:flex; align-items:center; justify-content:center;}
header img{width:20px; margin-left:-17px; margin-right:7px;}

section{display:flex; align-items:center; justify-content:flex-end; background:#343a40; height:40px; padding:0 5px;}
section input{flex:1; height: 25px; background:#495057; border:none; padding:0 7px; margin-right:5px; border-radius:3px; color: #fff;}
section i{font-size:23px; color:#fff;}
::placeholder{color:#868e96;}

nav{height:calc(100% - 80px); background:#343a40; overflow-x:hidden; overflow-y:auto;}
nav ul li{position:relative; z-index:3; cursor:pointer; height:40px; padding:0 26px 0 10px; transition:all 0.1s;}
nav ul li.more{z-index:7;}
nav ul li.hover{/*color:#99e9f2;*/ padding:0 26px 0 26px;}
nav ul li.active{color:#ffe066; padding:0 26px 0 26px;}
nav ul li[draggable="true"]{background:#495057; /*color:#99e9f2;*/ padding:0 26px 0 26px;}
nav ul li[draggable="true"].active{color:#ffe066;}
nav ul li h3{line-height:40px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
nav ul li>button{position:absolute; top:50%; transform:translateY(-50%); z-index:7;}
nav ul li .drag-btn{left:5px; opacity:0;}
nav ul li .drag-btn i{font-size:16px; color:#fff; cursor:move;}
nav ul li.hover .drag-btn,
nav ul li.active .drag-btn{opacity:1; transition:all 0.1s;}
nav ul li[draggable=true] .drag-btn{opacity:1;}
nav ul li .more-btn{right:5px; }
nav ul li .more-btn i{font-size:21px; color:#fff;}
nav ul li .more-btn div{position:absolute; top:0; right:24px; z-index:7; background:#fff; color:#212529; width:110px; padding:5px 0; border-radius:3px;}
nav ul li .more-btn button{display:block; width:100%; padding:8px 10px; text-align:left; white-space:nowrap; }
nav ul li .more-btn button i{font-size:16px; color:#212529; vertical-align:middle; margin-right:5px; }
nav ul li .more-btn button span{font-size:13px; color:#212529; vertical-align:middle;}
</style>
