<style lang="less">
  .power{
    height: 100%;
    // background-color: #2C2B29;
    padding: 10px;
    display: flex;

    .card_box{
      height: 100%;
      overflow-y: auto;
      width: 500px;
      max-width: 500px;

      &.local {
        width: 300px;
      }

      &.system{
        margin-left: 50px;
      }

      .ivu-card-body{
        padding: 5px 16px 5px 16px;
      }
    }
  }
</style>
<template>
  <div class="power">
    <Modal
      v-model="modalVisible"
      title="添加权限"
      fullscreen
      :z-index="2000"
      :transfer="false"
      :mask-closable="false"
      @on-cancel="onCancel"
    >
      <Form
        ref="form"
        :model="formValid"
        :rules="formRules"
        :label-width="80"
        inline
      >
        <FormItem label="名称" prop="name">
          <Select
            v-model="formValid.code"
            placeholder="选择权限"
            style="width: 160px;"
            @on-open-change="onSelectOpenChange"
            @on-change="onSelectChange"
          >
            <Option
              v-for="item in currentPowerChildren"
              :key="item.code"
              :value="item.code"
            >
              {{ item.name }}
            </Option>
          </Select>
          <!-- <Input v-model="formValid.name" placeholder="输入名称" /> -->
        </FormItem>
        <FormItem label="代码值" prop="code">
            <Input v-model="formValid.code" placeholder="输入代码值" />
        </FormItem>
        <FormItem label="排序" prop="sort">
          <InputNumber
            :max="40"
            :min="0"
            v-model="formValid.sort"
          />
        </FormItem>
         <!-- <FormItem label="类型">
            <Input v-model="formValid.type" disabled />
        </FormItem> -->
         <!-- <FormItem label="Url" prop="url">
            <Input v-model="formValid.url" placeholder="输入url" />
        </FormItem> -->
        <!-- <FormItem label="权限类型" prop="type">
          <Select
            v-model="formValid.type"
            placeholder="选择权限类型"
            style="width: 160px;"
          >
            <Option value="module">模块</Option>
            <Option value="button">按钮</Option>
          </Select>
        </FormItem> -->
      </Form>
      <template slot="footer">
        <Button type="default" @click="onCancel">取消</Button>
        <Button type="primary" @click="onSubmit" :loading="submitLoading">提交</Button>
      </template>
    </Modal>
    <Card class="card_box local">
      <Tree
        :data="localData"
        :render="renderNodeLocal"
      ></Tree>
    </Card>
    <Card class="card_box system">
      <Tree
        :data="treeData"
        :render="renderNode"
      ></Tree>
    </Card>
  </div>
</template>

<script src="./power.js"></script>
