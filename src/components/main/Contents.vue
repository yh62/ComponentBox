<template>
    <section>
        <header>
            <button type="button" class="menu-btn icon" @click="$emit('naviVisible')"><i>menu</i></button>
            <div v-show="this.$store.state.idx != null">
                <input type="text" v-model="search" placeholder="Search" @keyup="searchResult()"/>
                <button type="button" class="add-btn icon" @click="add"><i>add</i></button>
            </div>
        </header> 
        <article>
            <draggable tag="ul" v-model="contents_list" handle=".drag-btn" @end="move" :class="grid">
            <li v-for="(list, key) in contents_list" :key="list.id" :ref="'li'+key">
              <div class="inner">
                <!-- header -->
                <div :class="{header: true, hover: hover == list.id}" @mouseenter="hover = list.id" @mouseleave="hover = null">
                  <button type="button" class="drag-btn icon"><i>drag_handle</i></button>
                  <h3>{{ list.name }}</h3>
                  <button type="button" class="more-btn icon" @click="activeMore(list.id)" @mouseenter="more_hover = false" @mouseleave="more_hover = true">
                      <i>more_vert</i>
                      <div v-show="more == list.id">
                          <button type="button" class="update-btn icon" @click="update(list.id)"><i>edit</i><span>Edit</span></button>
                          <button type="button" class="delete-btn icon" @click="del(list.id)"><i>delete</i><span>Delete</span></button>
                      </div>
                  </button>
                </div>
                <!-- header[END] -->

                <!-- code-preview[END] -->
                <div :class="{'code-preview':true, 'active':active == list.id}">
                  <iframe @load="(el) => { iframe(el.target, key) }" :ref="'iframe'+key"></iframe>
                  <div class="overlay" @click="selecte(list.id)"><span>CODE COPY</span></div>
                  <button type="button" class="icon" @click="preview(list.id)"><i>fullscreen</i></button>
                </div>
                <!-- code-preview[END] -->
              </div>
            </li>
          </draggable>

        </article>  
    </section>
</template>

<script>
import {eventBus} from "@/main"
import draggable from 'vuedraggable'

export default {
  name: 'Contents',
  components: { draggable },
  props:['grid'],
  data(){
      return{
        hover:null,
        more:null,
        more_hover:true,
        active:null,
        search:''
      }
  },
  mounted(){
    eventBus.$on('update_iframe', (el) => { this.$refs[el][0].contentDocument.location.reload(true); }); 
    eventBus.$on('preview_overlay', () => { this.active = null; }); 
    eventBus.$on('search_empty', () => { this.search = ''; });
  },
  computed:{
    contents_list:{
      get(){
        // this.search = '';
        return this.$store.state.contents_list; 
      },
      set(value){ this.$store.dispatch('CONTENTS_MOVE', value); }
    }
  },  
  methods:{
    searchResult(){
      let list = this.$store.state.contents_list;
      for(let i = 0; i < list.length; i++){
        if(list[i].name.toLowerCase().indexOf(this.search.toLowerCase()) > -1){ this.$refs['li'+i][0].style.display = 'block'; }
        else{ this.$refs['li'+i][0].style.display = 'none'; }
      }
    },
    add(){ eventBus.$emit('edit', {mode:'add'});},
    del(idx){ eventBus.$emit('dialog', {type:'contents_del', id:idx}); },
    update(idx){ eventBus.$emit('edit', {mode:'update', id:idx}); },
    move(e){ if(e.type == 'end'){this.hover = null;} },
    selecte(idx){ 
      this.active = idx;
      eventBus.$emit('dialog', {type:'code_copy', id:idx}); 
    },
    preview(idx){ 
      this.active = idx;
      eventBus.$emit('preview', idx); 
    },
    activeMore(idx){
      this.more = idx;
      document.querySelector('#main').addEventListener('mousedown', this.closeMore);
    },
    closeMore(){
      if(this.more_hover){ this.more = null; }
      document.querySelector('#main').removeEventListener('mousedown', this.closeMore);
    },
    iframe(el, key){
      let code = this.$store.state.contents_list[key];
      let DOC_SIZE = code.docSize;
      let HEAD = code.head;
      let HTML = code.html;
      let CSS = code.css;
      let JS = code.js;

      el.setAttribute("class", DOC_SIZE);
      
      // let doc = el.contentWindow.document;
      let doc = (el.contentWindow.document || el.contentDocument.document);
      doc.head.innerHTML = HEAD;
      
      let META = '';
      let LINK = '';
      let STYLE = '';
      let SCRIPT = '';
      let elm = doc.head.children
      for(let i = 0; i< elm.length; i++){
        if(elm[i].tagName == 'META'){ META += elm[i].outerHTML; }
        if(elm[i].tagName == 'LINK'){ LINK += elm[i].outerHTML; }
        if(elm[i].tagName == 'STYLE'){ STYLE += elm[i].outerHTML; }
        if(elm[i].tagName == 'SCRIPT'){ SCRIPT += elm[i].outerHTML; }
      }
      
      //body
      doc.write(HTML+SCRIPT+'<script'+'>'+JS+'</'+'script>');
      //head
      doc.head.innerHTML = '<meta charset="utf-8">\n'+
                            META+LINK+STYLE+
                          '<style>\n*{margin:0; padding:0; box-sizing:border-box;}\n::-webkit-scrollbar{ width:0; height:0; }\n'+CSS+'</style>';
    }
  }

}
</script>

<style scoped>
/* section */
section{width:100%; height:100%; }
header{display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; height:40px; border-bottom: 1px solid #ced4da; padding:0 5px 0 10px;}
header div{white-space: nowrap;}
header input{width:200px; height:30px; background:#f8f9fa; margin:0 5px 0 10px; padding: 0 7px; border:1px solid #ced4da; border-radius:3px;}
::placeholder{color:#868e96;}
header .menu-btn i{font-size:28px; color:#343a40;}
header .add-btn i{font-size:30px; color:#343a40;}

article{background:#e9ecef; height:calc(100% - 40px); overflow-x:hidden; overflow-y:auto; padding:15px 10px;}
article ul{width:100%; margin:0 auto;}
article ul:after{content:''; display:table; clear:both;}
article ul.grid-01{max-width:375px;}
article ul.grid-02{max-width:750px;}
article ul.grid-03{max-width:1125px;}
article ul.grid-04{max-width:1500px;}
article ul.grid-05{max-width:1875px;}
article ul li{float:left; padding:7.5px; transition:width 0.15s; }
article ul.grid-01 li{width:100%;}
article ul.grid-02 li{width:50%;}
article ul.grid-03 li{width:33.333333%;}
article ul.grid-04 li{width:25%;}
article ul.grid-05 li{width:20%;}
article ul li .inner{min-width:320px; width:100%; background:#fff; border-radius:3px; box-shadow:3px 3px 7px rgba(0,0,0,0.3); overflow:hidden;}
article ul li[draggable="true"] .inner{box-shadow:7px 7px 7px rgba(0,0,0,0.4);}

article ul li .header{position:relative; z-index:7; width:100%; height:30px; padding:0 26px 0 10px; transition:all 0.1s; background:#343a40;}
article ul li .header.hover{padding:0 26px 0 26px; transition-delay:0.3s;}
article ul li[draggable="true"] .header{padding:0 26px 0 26px;}
article ul li[draggable="true"] .header h3{color:#ffe066}
article ul li .header h3{color:#ffffff; line-height:30px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
article ul li .header>button{position:absolute; top:50%; transform:translateY(-50%); z-index:7;}
article ul li .header>.drag-btn{left:5px; opacity:0; width:0; overflow:hidden;}
article ul li .header>.drag-btn i{font-size:16px; color:#ffffff; cursor:move;}
article ul li .header.hover>.drag-btn{opacity:1; width:16px; transition-delay:0.3s;}
article ul li[draggable=true] .header>.drag-btn{opacity:1; width:16px; }
article ul li .header>.more-btn{right:5px;}
article ul li .header>.more-btn i{font-size:21px; color:#ffffff;}
article ul li .header>.more-btn div{position:absolute; top:0; right:24px; z-index:7; /*!!!*/background:#f8f9fa; width:100px; padding:5px 0; border-radius:3px; border: 1px solid #ced4da;}
article ul li .header>.more-btn button{display:block; width:100%; padding:8px 10px; text-align:left; white-space:nowrap; }
article ul li .header>.more-btn button i{font-size:16px; color:#212529; vertical-align:middle; margin-right:5px; }
article ul li .header>.more-btn button span{font-size:13px; color:#212529; vertical-align:middle;}

article ul li .code-preview{position:relative; height:170px;}
article ul li .code-preview iframe{display:block; width:100%; height:100%; transform-origin: 0 0; background: #fff; border: none; outline: none;}
article ul li .code-preview .docSize-01{width:100%; height:100%; transform: scale(1);}
article ul li .code-preview .docSize-02{width:200%; height:200%; transform: scale(0.5);}
article ul li .code-preview .docSize-03{width:300%; height:300%; transform: scale(0.333333);}
article ul li .code-preview .docSize-04{width:400%; height:400%; transform: scale(0.25);}
    
article ul li .code-preview .overlay{position:absolute; left:0; top:0; z-index:3; width:100%; height:100%; cursor:pointer; display:flex; justify-content:center; align-items:center; transition:background 0.2s;}
article ul li .code-preview .overlay span{font-size:17px; font-weight:bold; padding-bottom:10px; opacity:0; transition:opacity 0.2s;}
article ul li .code-preview:hover .overlay,
article ul li .code-preview.active .overlay{background:rgba(255,255,255,0.7);}
article ul li .code-preview:hover .overlay span,
article ul li .code-preview.active .overlay span{opacity:1;}

article ul li .code-preview button{position: absolute; right:8px; bottom:8px; z-index:7; background:#343a40; color:#fff; border-radius:3px; width:24px; height:24px;}
</style>
