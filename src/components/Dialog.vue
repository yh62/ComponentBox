<template>
  <div class="overaly">
    <div class="dialog">
      <header>
        <h3 class="icon"><i>{{headline_icon}}</i> <span>{{headline_txt}}</span></h3>
        <button type="button" class="cancel-btn icon" @click="cancel"><i>close</i></button>
      </header>
      
      <section>
        <input type="text" v-if="info == null && code.id == null" v-model.trim="name" @keyup.enter.exact="ok" ref="input">
        <p v-else-if="info != null && code.id == null">{{info}}</p>
        
        <div class="code-copy" v-if="code.id != null">
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
      </section>

      <footer v-if="code.id == null">
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
        break;

        case 'navi_add': 
          this.headline_txt = 'ADD'; 
          this.headline_icon = 'add'
        break;
        case 'navi_del':  
          this.headline_txt = 'DELETE'; 
          this.headline_icon = 'delete' 
          this.info = 'Are you sure you want to delete?';
        break;
        case 'navi_update':  
          this.headline_txt = 'RENAME'; 
          this.headline_icon = 'edit' 
          this.name = this.dialog.name;
        break;

        case 'contents_del':
          this.headline_txt = 'DELETE'; 
          this.headline_icon = 'delete' 
          this.info = 'Are you sure you want to delete?';
        break;

        case 'edit_exit':
          this.headline_txt = 'EXIT'; 
          this.headline_icon = 'exit_to_app' 
          this.info = 'Are you sure you want to exit the editing?';
        break;
        case 'edit_save':
          this.headline_txt = 'SAVE'; 
          this.headline_icon = 'move_to_inbox' 
          this.info = 'Are you sure you want to save?';
        break;
      }
  },
  mounted(){ 
    if(this.info == null && this.code.id == null){ this.$refs.input.focus(); } 
  },
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

.dialog footer{width:100%; display:flex; flex-wrap:wrap;}
.dialog footer button{flex:1; background: #f8f9fa; border-top:1px solid #ced4da; border-right:1px solid #ced4da; height:40px;} 
.dialog footer button:last-of-type{border-right:none;}
.dialog footer button.cancel-btn{color:#339af0;}
.dialog footer button.ok-btn{color:#ff6b6b;}
.dialog footer button.disable{pointer-events:none;}
.dialog footer button.disable span{opacity:0.3;}
</style>
