<template>
  <MenuItem
    v-if="!router.children"
    :name="router.name"
  >
    {{ router.meta.title }}
  </MenuItem>
  <MenuItem
    v-else-if="router.children.length === 1"
    :name="router.children[0].name"
  >
    {{ router.children[0].meta.title }}
  </MenuItem>
  <!-- <Submenu :name="router.name || router.children[0].name" v-else>
    <template slot="title">
      {{ router.meta.title }}
    </template>
    <NavItem
      v-for="item of router.children"
      :key="item.name"
      :router="item"
    />
  </Submenu> -->
  <MenuItem
    v-else
    :name="router.name || router.children[0].name"
  >
    {{ router.meta.title }}
  </MenuItem>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'vue-property-decorator'

@Component({})
export default class NavItem extends Vue {
  name: string = 'NavItem'

  @Prop({
    type: Object,
    required: true,
    default: {}
  }) private router: any

  // created () {
  //   console.log('navItem', this.router)
  // }
}
</script>
