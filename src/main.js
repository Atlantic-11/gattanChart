import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
// 样式
import '@/styles/global_common.scss'
import '@/styles/global_dialog_style.scss'
import '@/styles/global_from_style.scss'
//引入图标字体样式
import '@/styles/icon-fonts/iconfont.css';
import '@/styles/icon-fonts/iconfont.js';
// mouck
import '@/mock/mock.js'
// 挂载请求
import api from '@/api/api.js'
Vue.prototype.$api = api
// 日期转换插件
import moment from "moment";
Vue.prototype.$moment = moment

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
