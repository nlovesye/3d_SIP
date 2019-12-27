<style lang="less">
  .home{
    padding: 0 20px;

    h2{
      text-align: center;
      margin: 20px auto 20px;
    }
  }
</style>

<template>
  <div class="home">
    <h2>{{ title }}</h2>
    <!-- <List border>
      <ListItem>
        <ListItemMeta avatar="https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar" title="This is title" description="This is description, this is description." />
      </ListItem>
      <ListItem>
        <ListItemMeta avatar="https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar" title="This is title" description="This is description, this is description." />
      </ListItem>
      <ListItem>
        <ListItemMeta avatar="https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar" title="This is title" description="This is description, this is description." />
        <template slot="action">
          <li>
            <a href="">Edit</a>
          </li>
          <li>
            <a href="">More</a>
          </li>
        </template>
      </ListItem>
      <ListItem>
        <ListItemMeta avatar="https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar" title="This is title" description="This is description, this is description." />
        <template slot="action">
          <li>
            <a href="">Edit</a>
          </li>
          <li>
            <a href="">More</a>
          </li>
        </template>
      </ListItem>
    </List> -->
  </div>
</template>

<script>
import config from '@/config'
export default {
  // authCode: 'hello home'
  data () {
    return {
      title: config.title
    }
  }
}
</script>
