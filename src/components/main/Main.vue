<template>
  <div id="main" ref="main" :class="{'pd-none':!navi_visible}">
    <!-- Navi -->
      <vue-resizable
        :active="resizable.handler"
        :width="resizable.width"
        :min-width="resizable.minWidth"
        :max-width="resizable.maxWidth"
        @resize:move="Resizable"
        @resize:end="Resizable"
        v-show="navi_visible"
      >
        <Navi></Navi>
      </vue-resizable>
      <!-- Navi[END] -->

      <!-- Contents -->
      <Contents @naviVisible="NaviVisible" :grid="grid" id="contents"></Contents>
      <!-- Contents[END] -->
  </div>
</template>

<script>
import {eventBus} from "@/main"

import Navi from './Navi'
import Contents from './Contents'
import VueResizable from 'vue-resizable'

export default {
  name: 'Main',
  components: {
    Navi,
    Contents,
    VueResizable
  },
  mounted(){
    //init navigation width
    var navW =localStorage.navW;
    if(navW){ 
      this.resizable.width = parseInt(navW); 
      this.$refs.main.style.paddingLeft = navW+'px'; 
    }

    //contents_grid
    this.Grid();
    let resizeEvent= null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeEvent);
      resizeEvent = setTimeout(() => { this.Grid(); }, 10);
    });
    
  },  
  data(){
    return{
      resizable:{
        handler: ["r"],
        width:240,
        minWidth:240,
        maxWidth:420
      },
      navi_visible:true,
      grid:null
    }
  },
  methods: {
    Resizable(e){
      var type = e.eventName;
      var width = e.width;
      if(type == 'resize:move'){ 
        this.$refs.main.style.paddingLeft = width+'px'; 
        this.Grid();
      }
      if(type == 'resize:end'){ localStorage.navW = width; }
    },
    NaviVisible(){
      this.navi_visible = !this.navi_visible;
      
      let w = 0;
      if(this.navi_visible){ w = this.$refs.main.offsetWidth - parseInt(this.$refs.main.style.paddingLeft); }
      else{ w = this.$refs.main.offsetWidth; }
      this.Grid(w);
    },
    Grid(e){
      let w = document.querySelector('#contents').offsetWidth;
      if(e != undefined){ w = e; }

      if(690 > w){ this.grid = 'grid-01'; }
      else if(690 < w && 1025 > w){ this.grid = 'grid-02'; }
      else if(1025 < w && 1360 > w){ this.grid = 'grid-03'; }
      else if(1360 < w && 1695 > w){ this.grid = 'grid-04'; }
      else if(1695 < w){ this.grid = 'grid-05'; }
    }
  }

}
</script>

<style scoped>
#main{position:relative; width:100%; height:100%; overflow:hidden; padding-left:240px;}
/*  aside - resizable & toggle*/
.pd-none{padding:0!important;}
.resizable-component{position:absolute!important; left:0!important; top:0!important; z-index:7!important; height:100%!important;}
</style>
