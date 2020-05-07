<template>
  <div class="overaly">
    <div class="dialog">
      <header>
        <h3 class="icon"><i>{{headline_icon}}</i> <span>{{headline_txt}}</span></h3>
        <button type="button" class="cancel-btn icon" @click="cancel"><i>close</i></button>
      </header>
      
      <section>
        <input type="text" v-if="show.input" v-model.trim="name" @keyup.enter.exact="ok" ref="input">
        <p v-else-if="show.info">{{info}}</p>
        
        <div class="code-copy" v-if="show.code_copy">
          <button type="button" @click="codeCopy('head')" v-if="code.head != ''" class="head-btn" ref="head_btn"><span>&lt;/&gt; HEAD</span></button>
          <button type="button" @click="codeCopy('html')" v-if="code.html != ''" class="html-btn" ref="html_btn"><span>&lt;/&gt; HTML</span></button>
          <button type="button" @click="codeCopy('css')" v-if="code.css != ''" class="css-btn" ref="css_btn"><span>{;} CSS</span></button>
          <button type="button" @click="codeCopy('js')" v-if="code.js != ''" class="js-btn" ref="js_btn"><span>{;} JAVASCRIPT</span></button>
          <button type="button" @click="codeCopy('all')" v-if="code.all != ''" class="all-btn" ref="all_btn"><span>ALL</span></button>
    
          <div class="code-select">
            <textarea v-model="code.head" ref="head_txt"></textarea>
            <textarea v-model="code.html" ref="html_txt"></textarea>
            <textarea v-model="code.css" ref="css_txt"></textarea>
            <textarea v-model="code.js" ref="js_txt"></textarea>
            <textarea v-model="code.all" ref="all_txt"></textarea>
          </div>
        </div>

        <div class="settings" v-if="show.settings">
          <div class="pagination">
            <h3 class="icon"><i>view_comfy</i> <span>PAGINATION</span></h3> 
            <div class="page">
              <button type="button" class="icon"><i>keyboard_arrow_left</i></button>
              <div>3</div>
              <button type="button" class="icon"><i>keyboard_arrow_right</i></button>
            </div>
          </div>
          <div class="export-import">
            <button type="button" @click="exportImport('export')" class="icon"><i>unarchive</i> <span>EXPORT</span></button>
            <button type="button" @click="exportImport('import')" class="icon"><i>archive</i> <span>IMPORT</span></button>
          </div>
        </div>
      </section>

      <footer v-if="show.input || show.info">
          <button type="button" class="cancel-btn" @click="cancel"><span>CANCEL</span></button>
          <button type="button" :class="{'ok-btn':true, 'disable':info == null && name == ''}" @click="ok"><span>OK</span></button>
      </footer>
      
    </div>
  </div>
</template>

<script>

import {eventBus} from "@/main"

export default {
  name: 'Dialog',
  props:['dialog'],
  created(){

      switch(this.dialog.type){
        case 'code_copy': 
          this.code.id = this.dialog.id;

          let list = this.$store.state.contents_list;
          for(let i = 0; i< list.length; i++){
            if(list[i].id == this.code.id){ 
              this.headline_icon = 'insert_drive_file'
              this.headline_txt = list[i].name; 
              // this.info = list[i].name;

              this.code.head = list[i].head;
              this.code.html = list[i].html;
              this.code.css = list[i].css;
              this.code.js = list[i].js;

              if(this.code.head != '' || this.code.html != '' || this.code.css != '' || this.code.js != ''){
                this.code.all = list[i].head+'\n\n\n'+list[i].html+'\n\n\n'+list[i].css+'\n\n\n'+list[i].js;
              }
              break;
            }
          }
          this.show.code_copy = true;
        break;

        case 'navi_add': 
          this.headline_txt = 'ADD'; 
          this.headline_icon = 'add';
          this.show.input = true;
        break;
        case 'navi_del':  
          this.headline_txt = 'DELETE'; 
          this.headline_icon = 'delete';
          this.info = 'Are you sure you want to delete?';
          this.show.info = true;
          
        break;
        case 'navi_update':  
          this.headline_txt = 'RENAME'; 
          this.headline_icon = 'edit'; 
          this.name = this.dialog.name;
          this.show.input = true;
        break;

        case 'contents_del':
          this.headline_txt = 'DELETE'; 
          this.headline_icon = 'delete'; 
          this.info = 'Are you sure you want to delete?';
          this.show.info = true;
        break;

        case 'edit_exit':
          this.headline_txt = 'EXIT'; 
          this.headline_icon = 'exit_to_app'; 
          this.info = 'Are you sure you want to exit the editing?';
          this.show.info = true;
        break;
        case 'edit_save':
          this.headline_txt = 'SAVE'; 
          this.headline_icon = 'move_to_inbox'; 
          this.info = 'Are you sure you want to save?';
          this.show.info = true;
        break;

        case 'settings':
          this.headline_txt = 'SETTINGS'; 
          this.headline_icon = 'settings'; 
          this.show.settings = true;
        break;
      }
  },
  mounted(){ if(this.show.input){this.$refs.input.focus();} },
  data(){
    return{
      code:{
        id:null,
        head:"",
        html:"",
        css:"",
        js:"",
        all:""
      },
      headline_txt:null,
      headline_icon:null,
      info:null,
      name:'',
      show:{
        input:false,
        info:false,
        code_copy:false,
        settings:false,
      }
      
    }
  },
  methods:{
    cancel(){ 
      eventBus.$emit('dialog', null); 
      eventBus.$emit('preview_overlay'); 
    },
    ok(){
      switch(this.dialog.type){
        case 'navi_add': this.$store.dispatch('NAVI_ADD', this.name); break;
        case 'navi_del': this.$store.dispatch('NAVI_DEL', this.dialog.id); break;
        case 'navi_update': this.$store.dispatch('NAVI_UPDATE', {id:this.dialog.id, name:this.name}); break;

        case 'contents_del': this.$store.dispatch('CONTENTS_DEL', this.dialog.id); break;

        case 'edit_exit': eventBus.$emit('edit', null); break;
        case 'edit_save': eventBus.$emit('edit_save_ok'); break;
      }
      eventBus.$emit('dialog', null);
    },
    codeCopy(type){
      // e.target.classList.add("active");
      switch(type){
        case 'head': 
          this.$refs.head_txt.select(); 
          this.$refs.head_btn.classList.add("active");
        break;
        case 'html': 
          this.$refs.html_txt.select(); 
          this.$refs.html_btn.classList.add("active");
        break;
        case 'css': 
          this.$refs.css_txt.select(); 
          this.$refs.css_btn.classList.add("active");
        break;
        case 'js': 
          this.$refs.js_txt.select(); 
          this.$refs.js_btn.classList.add("active");
        
        break;
        case 'all': 
          this.$refs.all_txt.select();
          this.$refs.all_btn.classList.add("active");
        break;
      }
      document.execCommand("copy");
    },
    exportImport(type){
      switch(type){
        case 'export': this.$store.dispatch('EXPORT_IMPORT', 'export'); break;
        case 'import': this.$store.dispatch('EXPORT_IMPORT', 'import'); break;
      }
      
    }

  }


}
</script>

<style scoped>
.overaly{ position:fixed; left:0; top:0; z-index:777; width:100%; height:100%; background:rgba(0,0,0,0.25); overflow-x: hidden; overflow-y: auto;}

.dialog{width:100%; max-width:400px; background:#fff; margin:110px auto; border:1px solid #ced4da; border-radius:3px; box-shadow:3px 3px 7px rgba(0,0,0,0.25);}
.dialog header{height:40px; padding:0 10px; display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; border-bottom:1px solid #ced4da; font-weight:bold;}
.dialog header h3{overflow:hidden; white-space:nowrap;}
.dialog header h3 i{ vertical-align:middle; font-size:21px; margin-right:5px; font-weight:normal;}
.dialog header h3 span{ vertical-align:middle; font-size:17px; font-weight:bold;}

.dialog section{padding:23px 20px;}
.dialog section input{width: 100%; height:35px; border:1px solid #ced4da; border-radius:3px; background:#f8f9fa; font-size:16px; padding:0 10px;}
.dialog section p{word-wrap:break-word; word-break:keep-all; line-height:21px;}

.dialog section .code-copy{position:relative; overflow:hidden;}
.dialog section .code-copy button{display:block; width:100%; height:35px; border:1px solid #ced4da; border-radius:3px; margin-top:10px; text-align:center; 
                                  background: #f8f9fa; opacity:1; transition:opacity 0.1s;}
.dialog section .code-copy button:first-child{margin:0;}
.dialog section .code-copy button.active{opacity:0.5;}
.dialog section .code-copy button.active span{text-decoration: line-through;}
.dialog section .code-copy button.head-btn{color:#fab005; } 
.dialog section .code-copy button.html-btn{color:#fa5252; } 
.dialog section .code-copy button.css-btn{color:#228be6; }
.dialog section .code-copy button.js-btn{color:#12b886; }
.dialog section .code-copy .code-select{position:absolute; left:-100%; top:-100%; z-index:-7;}

.dialog section .settings{position:relative; overflow:hidden;}
.dialog section .settings .pagination{display:flex; justify-content:space-between; align-items:center; margin-bottom:17px; padding:0 10px;} 
.dialog section .settings .pagination h3{font-weight:bold;}
.dialog section .settings .pagination h3 span{margin-left:5px; font-size:15px;}
.dialog section .settings .pagination .page{display:flex; align-items:center; overflow:hidden; border-radius:5px;}
.dialog section .settings .pagination .page div{width:30px; height:25px; display:flex; justify-content:center; align-items:center; border:1px solid #ced4da;}
.dialog section .settings .pagination .page button{height:25px; background:#212529;}
.dialog section .settings .pagination .page button i{color:#fff; font-size:20px;}

.dialog section .settings .export-import button{display:block; width:100%; height:35px; border:1px solid #ced4da; border-radius:3px; margin-top:10px; text-align:center;  background: #f8f9fa; opacity:1; transition:opacity 0.1s;}
.dialog section .settings .export-import button:first-child{margin:0;}
.dialog section .settings .export-import button{display:flex; justify-content:center; align-items:center;}
.dialog section .settings .export-import button i{margin-right:3px; padding-bottom:2px;}
.dialog section .settings .export-import button span{font-weight:bold; min-width:62px; font-size:15px;}
.dialog section .settings .export-import button:nth-of-type(2) span{text-indent:-3px;}

.dialog footer{width:100%; display:flex; flex-wrap:wrap;}
.dialog footer button{flex:1; background: #f8f9fa; border-top:1px solid #ced4da; border-right:1px solid #ced4da; height:40px; font-weight:bold;} 
.dialog footer button:last-of-type{border-right:none;}
.dialog footer button.cancel-btn{color:#339af0;}
.dialog footer button.ok-btn{color:#ff6b6b;}
.dialog footer button.disable{pointer-events:none;}
.dialog footer button.disable span{opacity:0.3;}
</style>
