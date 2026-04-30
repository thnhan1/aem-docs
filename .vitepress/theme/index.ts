import { h } from 'vue'
import { VPCarbon } from 'vitepress-carbon'
import BackToTop from './components/BackToTop.vue'
import './style.css'

export default {
  extends: VPCarbon,
  Layout() {
    return h(VPCarbon.Layout, null, {
      'layout-bottom': () => h(BackToTop),
    })
  },
}