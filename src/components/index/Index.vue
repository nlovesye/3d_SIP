<template>
  <Layout class="app_main">
    <Header class="main_header">
      <div class="header-logo">
        <img src="~@/assets/images/logo-top.png" alt="logo" @click="onHeaderMenuSelect('index')">
      </div>
      <Menu
        class="header-menu"
        mode="horizontal"
        theme="dark"
        :active-name="activeMenu"
        @on-select="onHeaderMenuSelect"
      >
        <NavItem
          v-for="item of menus"
          :key="item.name"
          :router="item"
        />
      </Menu>
      <div class="header-setting">
        <Dropdown @on-click="onHeaderSettingClick" trigger="click" placement="bottom-end">
          <Badge :dot="!!messageUnreadCount">
            <Avatar :src="userAvatar"/>
          </Badge>
          <Icon :size="18" type="md-arrow-dropdown"></Icon>
          <DropdownMenu slot="list">
            <!-- <DropdownItem name="message">
              消息中心<Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
            </DropdownItem> -->
            <DropdownItem name="logout">退出登录</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Header>
    <main-content
      :currentRouter="currentRouter"
    />
  </Layout>
</template>

<script>
import router, { routes, IRouter } from '@/router'
import { getMenus, getRouter } from '@/libs/util'
import NavItem from './NavItem.vue'
import MainContent from './MainContent.vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import './index.less'

export default {
  name: 'index',

  components: {
    NavItem,
    MainContent
  },

  data () {
    return {
      menus: [],
      userAvatar: '',
      messageUnreadCount: 0
    }
  },

  computed: {
    ...mapState(['activeMenu', 'currentRouter', 'access_token'])
  },

  watch: {
    '$route': (to, from) => {
      // console.log('routeChange', to, from)
    }
  },

  methods: {
    ...mapMutations(['setContentSize', 'setCurrentRouter', 'setActiveMenu']),
    ...mapActions(['LOGOUT']),
    /**
     * @description 头部菜单选择
     */
    onHeaderMenuSelect (name) {
      if (this.activeMenu === name) return
      const router = getRouter(routes, name, null)
      this.setCurrentRouter(router)
      console.log('onHeaderMenuSelect', router, name)
      if (router && (router.component || router.components)) {
        this.setActiveMenu(name)
        this.$router.push({ name })
      } else {
        this.setActiveMenu('developing')
        this.$router.push({ name: 'developing' })
      }
    },

    onHeaderSettingClick (name) {
      // console.log('onHeaderSettingClick', name)
      if (name === 'logout') {
        this.LOGOUT()
      }
    }
  },

  created () {
    // console.log('created', window.innerWidth, window.innerHeight, this.$route)
    if (!this.access_token || (this.access_token && this.access_token.length < 1)) {
      router.replace('/login')
    }
    const { name } = this.$route
    this.setActiveMenu(name || '')
    this.setContentSize({ width: window.innerWidth, height: window.innerHeight })
    this.setCurrentRouter(getRouter(routes, this.activeMenu, null))
    // console.log('created', getRouter(routes, this.activeMenu, null))
  },

  mounted () {
    this.menus = getMenus(routes)
    // console.log('Index header', routes, this.menus)
  }
}
</script>
