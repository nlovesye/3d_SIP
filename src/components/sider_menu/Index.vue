<template>
  <Menu
    :active-name="activeMenu"
    theme="dark"
    width="auto"
    @on-select="onSiderSelect"
  >
    <template v-if="menus && menus.length > 0">
      <NavItem
        v-for="item of menus"
        :key="item.name"
        :router="item"
      />
      <!-- <MenuItem
        v-for="menu in menus"
        :key="menu.k"
        :name="menu.k"
      >
        <Icon :type="menu.icon" :title="menu.title"></Icon>
        <span v-text="menu.title"></span>
      </MenuItem> -->
    </template>
  </Menu>
</template>

<script>
import { routes, IRouter } from '@/router'
import { getMenus, getRouter, getParentRouter } from '@/libs/util'
import { mapState, mapMutations } from 'vuex'
import NavItem from '@c/index/NavItem.vue'

export default {
  components: {
    NavItem
  },
  props: {
    // menus: {
    //   type: Array,
    //   required: true
    // }
  },
  data () {
    return {
      menus: []
    }
  },
  computed: {
    ...mapState(['activeMenu', 'currentRouter'])
  },
  methods: {
    ...mapMutations(['setCurrentRouter', 'setActiveMenu']),
    initMenus () {
      const { name } = this.$route
      const r = getParentRouter(routes, name, {})
      this.menus = r.children && r.children.length ? r.children : []
      // console.log('ret', r, routes, name, this.menus)
    },
    onSiderSelect (name) {
      if (this.activeMenu === name) return
      const router = getRouter(routes, name, null)
      this.setCurrentRouter(router)
      // console.log('onHeaderMenuSelect', router)
      if (router && (router.component || router.components)) {
        this.setActiveMenu(name)
        this.$router.push({ name })
      } else {
        this.setActiveMenu('developing')
        this.$router.push({ name: 'developing' })
      }
    }
  },
  created () {
    this.initMenus()
  }
}
</script>
