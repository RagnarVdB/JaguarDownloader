import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: '127.0.0.1:5000'
}))

new Vue({
  render: h => h(App),
}).$mount('#app')
