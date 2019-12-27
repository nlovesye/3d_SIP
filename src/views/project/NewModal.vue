<style lang="less" src="./modal.less"></style>

<template>
  <Modal
    class-name="new_project"
    :title="modalTitle"
    v-model="show"
    :closable="false"
    :mask="false"
    :transfer="false"
    width="232"
    @on-visible-change="onVisibleChange"
  >
    <Form
      ref="form"
      :model="formValid"
      :rules="rules"
      :label-width="80"
    >
      <FormItem :label="title + '名称'" prop="name">
        <Input v-model="formValid.name" placeholder=""></Input>
      </FormItem>
    </Form>
    <template slot="footer">
      <Button type="default" @click="cancel">取消</Button>
      <Button type="primary" :loading="loading" @click="handleSubmit">{{ type === 1 ? '创建' : type === 2 ? '保存' : '-' }}</Button>
    </template>
  </Modal>
</template>

<script>
export default {
  props: {
    type: {
      type: Number
    },
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      isRequired: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    defaultVal: {
      type: Object
    }
  },
  computed: {
    modalTitle () {
      const typeText = this.type === 1 ? '创建' : this.type === 2 ? '编辑' : '-'
      return `${typeText}${this.title}`
    }
  },
  data () {
    return {
      formValid: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    // 切换设置项
    async handleSubmit () {
      const valid = await this.$refs['form'].validate()
      if (valid) {
        this.$emit('submit', this.formValid)
      }
    },
    cancel () {
      this.$emit('cancel')
    },
    onVisibleChange (visible) {
      if (!visible && this.$refs['form']) {
        this.$refs['form'].resetFields()
      } else {
        if (this.defaultVal) {
          this.formValid = { ...this.defaultVal }
        }
      }
    }
  }
}
</script>
