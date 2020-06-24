<template>
  <div>
    <el-tree :data="menus" :props="defaultProps" :expand-on-click-node="false" show-checkbox node-key="catId"
             :default-expanded-keys="expandKeys" draggable :allow-drop="allowDrop" @node-drop="handleDrop">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="node.level <=2 " type="text" size="mini" @click="() => append(data)">Append</el-button>
          <el-button type="text" size="mini" @click="() => edit(data)">edit</el-button>
          <el-button v-if="node.childNodes.length === 0" type="text" size="mini" @click="() => remove(node, data)">Delete</el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :title="dialogTitle"
      :close-on-click-modal="false">
      <el-form :model="category">
        <el-form-item label="分类名称">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="單位">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="圖標">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import categoryService from '@/api/product/category'

  export default {
    components: {},
    props: {},
    data () {
      return {
        updateNodes: [],
        dialogType: '', // edit, add
        dialogTitle: '',
        category: {
          productUnit: '',
          icon: '',
          name: '',
          parentCid: 0,
          catLevel: 0,
          showStatus: 1,
          sort: 0,
          catId: ''
        },
        dialogVisible: false,
        expandKeys: [],
        menus: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      }
    },
    methods: {
      getMenus () {
        // categoryService.listTree().then(({data}) => {
        //   this.menus = data.data
        //   console.log('成功获取到菜单数据...', data.data)
        // })
        categoryService.listTree().then(({data}) => {
          console.log('获取到菜单数据', data.data)
          this.menus = data.data
        })
      },
      initCategory () {
        this.category = {}
        this.category.productUnit = ''
        this.category.icon = ''
        this.category.name = ''
        this.category.parentCid = 0
        this.category.catLevel = 0
        this.category.showStatus = 1
        this.category.sort = 0
        this.category.catId = ''
      },
      append (data) {
        this.dialogTitle = '新增'
        this.dialogVisible = true
        this.dialogType = 'add'
        // 清空category
        this.initCategory()
        this.category.parentCid = data.catId
        this.category.catLevel = data.catLevel * 1 + 1
        console.log('append category', this.category)
        console.log('append', data)
      },
      remove (node, data) {
        let ids = [data.catId]
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          categoryService.deleteMenu(ids).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '删除成功成功',
                type: 'success'
              })
            }
            this.expandKeys = [node.parent.data.catId]
            // 刷新
            this.getMenus()
          })
        }).catch(() => {
        })
        console.log('remove', node, data)
      },
      edit (data) {
        categoryService.getMenu(data.catId).then((res) => {
          console.log(`查詢${data.catId}的數據`, res.data.category)
          this.category = {...res.data.category}
          console.log('需要修改的數據', this.category)
        })
        this.dialogTitle = '修改'
        this.dialogVisible = true
        this.dialogType = 'edit'
      },
      submitData () {
        if (this.dialogType === 'add') {
          this.addCategory()
        } else {
          this.editCategory()
        }
      },
      addCategory () {
        categoryService.saveMenu(this.category).then(({data}) => {
          this.$message({
            message: '菜单保存成功',
            type: 'success'
          })
          // 默認展開栏
          this.expandKeys = [this.category.parentCid]
          // 關閉彈窗
          this.dialogVisible = false
          // 刷新菜单
          this.getMenus()
          console.log('添加分类', this.category)
        })

      },
      editCategory () {
        let {catId, name, productUnit, icon} = {...this.category}
        categoryService.updateMenu({catId, name, productUnit, icon}).then(({data}) => {
          this.$message = {
            message: '修改成功',
            type: 'success'
          }
          // 默認展開栏
          this.expandKeys = [this.category.parentCid]
          // 關閉彈窗
          this.dialogVisible = false
          // 刷新菜单
          this.getMenus()
          console.log(`修改后的分类,分類Id為${catId},分類名稱為${name},計量單位為${productUnit},圖標為${icon}`)
        })
      },
      allowDrop (draggingNode, dropNode, type) {
        // 被拖动的当前节点 + 父节点 层数 <= 3
        console.log(draggingNode, dropNode, type)

        let curDeep = this.countNodeLevel(draggingNode) - draggingNode.level + 1;
        console.log('当前深度:', curDeep )
        if( type === 'inner') {
           return (curDeep + dropNode.level) <= 3
        } else {
          return (curDeep + dropNode.parent.level) <= 3
        }
        return false
      },
      countNodeLevel(node) {
        let maxLevel = 0
        if( Array.isArray(node.childNodes) && node.childNodes.length > 0) {
          for ( let i = 0; i < node.childNodes.length; i++) {
            let levelOfNode = this.countNodeLevel(node.childNodes[i])
            maxLevel = ( levelOfNode > maxLevel) ? levelOfNode : maxLevel
          }
        }
        return maxLevel > node.level ?  maxLevel : node.level
      },
      handleDrop(draggingNode, dropNode, dropType, event) {
        console.log('handleDrop:', draggingNode, dropNode, dropType)

        let curParentNode = dropNode
        if( dropType !== 'inner') {
          curParentNode = dropNode.parent
        }
        // 新父节点的catId
        let pCid = (Array.isArray(curParentNode.data))? 0:curParentNode.data.catId
        // 兄弟节点
        let siblings = curParentNode.childNodes

        for ( let i = 0; i < siblings.length; i++) {
          if( siblings[i].data.catId === draggingNode.data.catId) {
            this.updateNodes.push({catId:siblings[i].data.catId, sort: i, parentCid: pCid, catLevel: siblings[i].level})
            if ( siblings[i].level !== draggingNode.level) {
                this.changeLevel( siblings[i])
            }
          }else {
            this.updateNodes.push({catId:siblings[i].data.catId, sort: i})
          }
        }

        console.log('updateNodes:', this.updateNodes)
      },
      changeLevel(targetNode) {
        if( targetNode === null) {return}
        let children = targetNode.childNodes
        let length = children.length
        for ( let i = 0; i < length; i++) {
          this.updateNodes.push({catId:children[i].data.catId, catLevel: children[i].level})
          this.changeLevel(children[i])
        }
      }
    },
    activated () {
      this.getMenus()
    }
  }
</script>
