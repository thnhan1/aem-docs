import { h } from 'vue'
import theme from 'vitepress/theme-without-fonts'
import BackToTop from './components/BackToTop.vue'
import './style.css'

export default {
  extends: theme,
  Layout() {
    return h(theme.Layout, null, {
      'layout-bottom': () => h(BackToTop),
    })
  },
}