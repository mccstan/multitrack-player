import Vue from 'vue';
import axios from 'axios'; // Make sure Axios is imported
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';

Vue.prototype.$axios = axios; // Attach Axios to Vue prototype

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
