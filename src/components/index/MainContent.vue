<template>
  <Content class="main_content">
    <Layout class="content_area_box" v-if="currentRouter && currentRouter.components">
      <Sider
        collapsible
        :collapsed-width="78"
        v-model="isCollapsed"
        ref="sider"
        class="content_sider"
      >
        <div
          slot="trigger"
          :class="['sider_con', isCollapsed ? 'collapsed' : 'nocollapsed']"
          @click="onCollapsedChange"
        >
          <Icon
              class="sider_trigger"
              :type="isCollapsed ? 'md-arrow-forward' : 'md-arrow-back'"
              size="24"
            ></Icon>
        </div>
        <router-view name="sider"/>
      </Sider>
      <Layout class="content_content">
        <router-view />
      </Layout>
    </Layout>
    <router-view v-else />
  </Content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  props: {
    currentRouter: {
      required: true
    }
  },
  data () {
    return {
      //
    }
  },
  computed: {
    ...mapState(['isCollapsed'])
  },
  methods: {
    ...mapMutations(['onCollapsedChange'])
  }
}
</script>
