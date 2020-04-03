<template>
  <div class="overlay">
    <section :style="{ width: resizable.temp_width + 'px' }">
      <vue-resizable
          :active="resizable.handler"
          :width="resizable.width"
          @resize:start="Resizable"
          @resize:move="Resizable"
          @resize:end="Resizable"
          class="preview-resizable"
        >
      </vue-resizable>
      <div class="inner">
        <header>
          <h3>{{name}}</h3>
          <button type="button" class="close-btn icon" @click="Close"><i>close</i></button>
        </header>
        <iframe ref="preview_iframe" @load="(el) => previewIframe(el.target)"></iframe>
        <span class="log" ref="log">{{resizable.log}}px</span>
      </div>
    </section>
  </div>
</template>

<script>
import {eventBus} from "@/main"
//resizable
import VueResizable from 'vue-resizable'

export default {
  name: 'Preview',
  components:{ VueResizable },
  props:['preview'],
  data(){
    return{
      id:null,
      name:null,
      resizable:{
        log:null,
        width:null,
        temp_width:null,
        handler: ["r"]
      }
    }
  },
  methods:{
    Close(){ 
      eventBus.$emit('preview', null); 
      eventBus.$emit('preview_overlay');
    },
    Log(){
        let w = document.querySelector('.preview-resizable').offsetWidth;
        this.resizable.log = (w*2);
    },
    Resizable(e){
      let t = e.eventName;
      if(t == 'resize:start'){ 
        this.Log();
        this.$refs.log.style.display = 'block';
        this.$refs.preview_iframe.style.pointerEvents = 'none';

        let setWidth = document.querySelector('.preview-resizable').offsetWidth;
        this.resizable.width = setWidth; 
      }
      if(t == 'resize:move'){ 
        this.Log();

        let w = e.width;
        this.resizable.temp_width = (w * 2); 
      }
      if(t == 'resize:end'){ 
        this.$refs.log.style.display = 'none';
        this.$refs.preview_iframe.style.pointerEvents = 'auto';
      }
    },
    previewIframe(el){
      this.id = this.preview;
      let list = this.$store.state.contents_list;
      for(let i = 0; i< list.length; i++){
        if(list[i].id == this.id){
            this.name = list[i].name;
            switch(list[i].docSize){
              case 'docSize-01': this.resizable.width = 160; break;
              case 'docSize-02': this.resizable.width = 320; break;
              case 'docSize-03': this.resizable.width = 480; break;
              case 'docSize-04': this.resizable.width = 640; break;
            }
            this.resizable.temp_width = (this.resizable.width * 2);
            
            let HEAD = list[i].head;
            let HTML = list[i].html;
            let CSS = list[i].css;
            let JS = list[i].js;
            
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
            break;
        }
      }
    }
    
  }
}
</script>

<style scoped>
.overlay{position:fixed; left:0; top:0; z-index:7; width:100%; height:100%; background:rgba(0,0,0,0.25); overflow:hidden; padding:25px 0;}
.preview-resizable{height:100%!important; left:50%!important; max-width:50%!important; min-width:160px!important;}

section{position:relative; min-width:320px; max-width:calc(100% - 70px); height:100%; margin:0 auto; }
section .inner{position:absolute; left:0; top:0; z-index:7; width:100%; height:100%; border-radius:5px; overflow:hidden; box-shadow: 3px 3px 7px rgba(0,0,0,0.3);}
section header{width:100%; height:40px; background:#343a40; display:flex; justify-content:space-between; align-items:center; padding:0 10px;}
section header h3{font-size:17px; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
section header button.close-btn i{font-size:27px; color:#fff;}
section iframe{display:block; width:100%; height:calc(100% - 40px); border:none; background:#fff;}
section .log{position:absolute; right:0; top:40px; background:rgba(255,255,255,0.7); padding: 5px 10px; border-radius: 0 0 0 3px; display:none;}
</style>
