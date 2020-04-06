<template>
  <div id="edit-wrap"> 
    <!-- edit -->
    <div id="edit">
      <header>
        <button type="button" class="exit-btn icon" @click="exit"><i>exit_to_app</i>Back</button>
        <div>
          <button type="button" @click="splitpanes.horizontal = !splitpanes.horizontal" class="layout-btn icon"><i>view_quilt</i></button>
          <button type="button" @click="saveConfirm" class="icon"><i>move_to_inbox</i></button>
          <button type="button" @click="settings.visible = true" class="settings-btn icon"><i>settings</i></button>
        </div>
      </header>

      <section>
        <splitpanes class="default-theme" :horizontal="splitpanes.horizontal" :first-splitter="true">
          <pane><codemirror v-model="codemirror.html.code" :options="codemirror.html.options" ref="html_code"/></pane>
          <pane><codemirror v-model="codemirror.css.code" :options="codemirror.css.options" ref="css_code"/></pane>
          <pane><codemirror v-model="codemirror.js.code" :options="codemirror.js.options" ref="js_code"/></pane>
        </splitpanes>
      </section>
    </div>
    <!-- edit[END] -->

    <!-- Settings -->
    <div class="overaly" v-show="settings.visible">
      <div class="settings">
        <header class="icon"><i>settings</i> <span>SETTING</span></header>
        <section>
          <h3>Name</h3>
          <input type="text" v-model.trim="settings.name" :class="{empty:settings.name == ''}" ref="name" />
          <h3>Head</h3>
          <vue-resizable
            :active="resizable.handler"
            :height="resizable.height"
            :min-height="resizable.minHeight"
            :max-height="resizable.maxHeight"
            class="head"
          >
            <div class="head-inner">
              <codemirror v-model="settings.head" :options="codemirror.head.options" ref="settings_code"/>
            </div>
          </vue-resizable>

          <h3>Document Size</h3>
          <div class="btn-group">
              <button type="button" :class="{active : settings.docSize == 'docSize-01'}" @click="settings.docSize = 'docSize-01'"><span class="icon"><i>phone_android</i></span> <span>Mobile (320px)</span></button>
              <button type="button" :class="{active : settings.docSize == 'docSize-02'}" @click="settings.docSize = 'docSize-02'"><span class="icon"><i>tablet_android</i></span> <span>Tablet (640px)</span></button>
              <button type="button" :class="{active : settings.docSize == 'docSize-03'}" @click="settings.docSize = 'docSize-03'"><span class="icon"><i>laptop_windows</i></span> <span>Laptop (960px)</span></button>
              <button type="button" :class="{active : settings.docSize == 'docSize-04'}" @click="settings.docSize = 'docSize-04'"><span class="icon"><i>tv</i></span> <span>Desktop (1280px)</span></button>
          </div>
        </section>
        <footer>
          <button type="button" :class="{'disable': settings.name == ''}" @click="settings.visible = false;"><span>NEXT</span></button>
        </footer>
      </div>
    </div>
    <!-- Settings[END] -->

  </div> 
</template>

<script>
import {eventBus} from "@/main"
//resizable
import VueResizable from 'vue-resizable'
//splitpanes
import { Splitpanes, Pane } from 'splitpanes'
// import 'splitpanes/dist/splitpanes.css'
//codemirror
import { codemirror } from 'vue-codemirror'
// import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/vue/vue.js'
import'codemirror/addon/edit/closetag.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'


export default {
  name: 'Edit',
  components:{
    Splitpanes, 
    Pane,
    codemirror,
    VueResizable
  },
  props:['edit'],
  created(){
    //update
    if(this.edit.mode == 'update'){
      this.mode = 'update';
      let list = this.$store.state.contents_list;
      for(let i = 0; i < list.length; i++){
        if(list[i].id == this.edit.id){
          this.settings.name = list[i].name;
          this.settings.head = list[i].head;
          this.settings.docSize = list[i].docSize;
          this.codemirror.html.code = list[i].html;
          this.codemirror.css.code = list[i].css;
          this.codemirror.js.code = list[i].js;
          break;
        }
      }
    }
  },
  mounted(){ 
    this.$refs.name.focus(); 
    eventBus.$on('edit_save_ok', () => { this.save() });
  },
  destroyed(){ eventBus.$off('edit_save_ok'); },
  data(){
    return{
      mode:'add',
      settings:{
        visible:true,
        name:'',
        head:'',
        docSize:'docSize-02',
      },
      resizable:{
        handler: ["b"],
        height:120,
        minHeight:120,
        maxHeight:400
      }, 
      splitpanes:{ horizontal: false },
      codemirror:{
        head:{
          options:{
            tabSize: 4,
            line: true,
            lineNumbers: true,
            styleActiveLine: false,
            mode: 'text/x-vue',
            theme: "default"
          }  
        },
        html:{
          code:'',
          options:{
            tabSize: 4,
            line: true,
            lineNumbers: true,
            styleActiveLine: false,
            autoCloseTags: true,
            mode: 'text/x-vue',
            theme: 'monokai'
          }
        },
        css:{
          code:'',
          options:{
            tabSize: 4,
            line: true,
            lineNumbers: true,
            styleActiveLine: false,
            mode: 'text/css',
            theme: 'monokai'
          }
        },
        js:{
          code:'',
          options:{
            tabSize: 4,
            line: true,
            lineNumbers: true,
            styleActiveLine: false,
            mode: 'text/javascript',
            theme: "monokai",
            matchBrackets: true,
          }
        }
      }
    }
  },
  methods:{
    exit(){ eventBus.$emit('dialog', {type:'edit_exit'}); },
    saveConfirm(){ eventBus.$emit('dialog', {type:'edit_save'}); },
    save(){
      if(this.mode == 'add'){
        this.$store.dispatch('CONTENTS_ADD', {
          // id:10, 
          // order:1, 
          idx: this.$store.state.idx, 
          name: this.settings.name, 
          head: this.settings.head, 
          docSize: this.settings.docSize, 
          html: this.codemirror.html.code, 
          css: this.codemirror.css.code, 
          js: this.codemirror.js.code
        }); 
      }

      if(this.mode == 'update'){
        this.$store.dispatch('CONTENTS_UPDATE', {
            id: this.edit.id,  
            name: this.settings.name, 
            head: this.settings.head, 
            docSize: this.settings.docSize, 
            html: this.codemirror.html.code, 
            css: this.codemirror.css.code, 
            js: this.codemirror.js.code
        }); 
      }
    }
  }

}
</script>

<style scoped>
#edit-wrap{ position:fixed; left:0; top:0; z-index:7; width:100%; height:100%; overflow:hidden;}
#edit{width:100%; height:100%; overflow:hidden;}
#edit header{width:100%; height:40px; background:#343a40; display:flex; justify-content:space-between;}
#edit header div{height:100%;}
#edit header div button{margin-left:5px;}
#edit header button{width:35px; height:100%;}
#edit header button i{color:#ffffff; font-size:27px;}
#edit header button.exit-btn{ transform:rotateY(180deg);}
#edit header button.settings-btn i{font-size:24px;}
#edit header button.layout-btn i{font-size:30px;}
#edit section{width:100%; height:calc(100% - 40px); border-top:2px solid #222;}

.overaly{ position:fixed; left:0; top:0; z-index:777; width:100%; height:100%; background:rgba(0,0,0,0.25); padding:0 25px; overflow-x:hidden; overflow-y:auto;}
.settings{width:100%; max-width:530px; background:#ffffff; margin:85px auto; border:1px solid #ced4da; border-radius:3px; box-shadow:3px 3px 7px rgba(0,0,0,0.25);}
.settings header{padding:7.5px 14px; font-weight:bold; font-size:17px; background:#f8f9fa; border-bottom: 1px solid #ced4da;}
.settings header span{vertical-align: text-bottom;}
.settings section{padding:0 20px 15px;}
.settings section h3{padding:20px 0 10px; font-weight:bold;}
.settings section input{width:100%; height:35px; border:1px solid #ced4da; border-radius:3px; background:#f8f9fa; font-size:16px; padding:0 10px;}
.settings section input.empty{background:#fff5f5;}
.settings section input:focus{background:#f8f9fa}
.settings section .head{width:100%!important;  }
.settings section .head-inner{height:100%; border:1px solid #ced4da; border-radius:3px; overflow:hidden;}
.settings section button{display:block; width:100%; height:35px; border:1px solid #ced4da; border-radius:3px; margin-bottom:10px; text-align:center; opacity:0.5; color:#212529;}
.settings section button.active{background:#f8f9fa; font-weight:bold; opacity:1;}
.settings footer button{width:100%; background:#f8f9fa; border-top:1px solid #ced4da; height:40px; color:#ff6b6b;} 
.settings footer button.disable{pointer-events:none;}
.settings footer button.disable span{opacity:0.3;}
.settings section button i{font-size:21px;}
.settings section button:nth-of-type(3) i,
.settings section button:nth-of-type(4) i{font-size:24px;}
</style>

<style> /* codemirror */ .vue-codemirror, .CodeMirror { height: 100%!important; } .CodeMirror.cm-s-default{ background-color:#f8f9fa; } </style>
