<template>
  <div id="app">
    <Main></Main>
    <Edit v-if="edit != null" :edit="edit"></Edit>  
    <Preview v-if="preview != null" :preview="preview"></Preview>
    <Dialog v-if="dialog != null" :dialog="dialog"></Dialog>
  </div>
</template>

<script>
import Main from './components/main/Main'
import Dialog from './components/Dialog'
import Edit from './components/Edit'
import Preview from './components/Preview'

import {eventBus} from "@/main"
export default {
  name: 'App',
  components: {
    Main,
    Edit,
    Preview,
    Dialog
  },
  mounted(){
    //edit
    eventBus.$on('edit', e => { this.edit = e; });
    //preview
    eventBus.$on('preview', e => { this.preview = e; });
    //dialog
    eventBus.$on('dialog', e => { this.dialog = e; });
  },
  data(){
    return{
      edit:null,
      preview:null,
      dialog:null
    }
  }
}
</script>

<style scoped>
#app{width:100%; height:100%;}
</style>
