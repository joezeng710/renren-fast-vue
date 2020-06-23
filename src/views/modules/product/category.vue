<template>
  <div>
    <el-tree :data="menus" :props="defaultProps" :expand-on-click-node="false" show-checkbox node-key="catId">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="node.level <=2 " type="text" size="mini" @click="() => append(data)">Append</el-button>
          <el-button v-if="node.childNodes.length === 0" type="text" size="mini" @click="() => remove(node, data)">Delete</el-button>
        </span>
      </span></el-tree>
  </div>
</template>
<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    };
  },
  methods: {
    getMenus( ) {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        this.menus = data.data;
        console.log("成功获取到菜单数据...", data.data)
      })
    },
    append(data) {
      console.log("append",data);
    },
    remove(node, data) {
      console.log("remove", node, data);
    }
  },
  activated () {
    this.getMenus();
  }
};
</script>
