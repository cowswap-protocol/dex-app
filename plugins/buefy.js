import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

export default () => {
  Vue.use(Buefy, {
  	defaultIconPack: 'fas',
    defaultContainerElement: '#content',
  })
}
