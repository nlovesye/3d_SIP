<style>
.item-view {
  padding: 10px;
}
.tools-label {
  width: 80px;
  text-align: right;
  display: inline-block;
}
</style>
<template>
  <div
    style="display: flex;width: 100%;height: 100%;align-items: center;justify-content: center;background: black;"
  >
    <div style="margin-bottom: 100px;padding: 10px;background: white;border-radius: 4px;">
      <h3 style="text-align: center">调试小工具</h3>
      <div class="item-view">
        <span class="tools-label">设备ID：</span>
        <Input style="width: 200px" v-model="device" />
      </div>
      <div class="item-view">
        <span class="tools-label">选择指令：</span>
        <Select v-model="order" style="width:200px">
          <Option v-for="item in orders" :value="item.id" :key="item.id">{{ item.title }}</Option>
        </Select>
      </div>
      <!-- <div class="item-view">
                <Input v-model="name" placeholder="name" style="width: 200px" />
      </div>-->
      <div class="item-view">
        <!-- <Input v-model="name" placeholder="specs" style="width: 200px" /> -->
        <span class="tools-label">&emsp;设置值：</span>
        <Input style="width: 160px" disabled v-if="!type" />
        <Select :placeholder="type" v-if="type === 'enum'" v-model="spec" style="width:200px">
          <Option v-for="item in specs" :value="item.id" :key="item.id">{{ item.title }}</Option>
        </Select>
        <InputNumber
          :placeholder="type"
          v-if="type === 'int' || type === 'float'"
          :max="specs.max"
          :min="specs.min"
          :step="specs.step"
          v-model="spec"
        />
        <Input :placeholder="type" style="width: 160px" v-if="type === 'text'" v-model="spec" />
        {{unit}}
      </div>
      <div class="item-view" style="text-align: center">
        <Button :loading="loading" @click="handleSubmit" type="primary">发送指令</Button>
      </div>
    </div>
  </div>
</template>

<script>
import { Message } from 'view-design'
import { TOOLS } from '../../api/tools'
import _ from 'lodash'
const message = Message
const identifier = {
  WorkSwitch: {
    dataType: {
      specs: {
        '0': '关闭',
        '1': '开启',
        '2': '复位1',
        '3': '复位2',
        '4': '复位3'
      },
      type: 'enum'
    },
    name: '运行开关'
  },
  ScanInterval: {
    dataType: {
      specs: {
        length: '512'
      },
      type: 'text'
    },
    name: '扫描间隔'
  },
  ScanStep: {
    dataType: {
      specs: {
        unit: '°',
        min: 5,
        max: 80,
        step: 1
      },
      type: 'int'
    },
    name: '扫描步长'
  },
  MaxDistance: {
    dataType: {
      specs: {
        unit: 'm',
        min: 0.5,
        max: 280,
        step: 1
      },
      type: 'float'
    },
    name: '最大距离'
  },
  IntegrationTime: {
    dataType: {
      specs: {
        unit: 'ms',
        min: 100,
        max: 2000,
        step: 100
      },
      type: 'int'
    },
    name: '积分时间'
  }
}
export default {
  authCode: 'tools',
  data () {
    return {
      loading: false,
      identifier,
      orders: _.keys(identifier).map((item) => ({
        id: item,
        title: identifier[item].name
      })),
      order: null,
      spec: null,
      device: 'XSsGP2FUE4y3dUsci2h9'
    }
  },
  computed: {
    name () {
      return this.identifier[this.order || ''] && this.identifier[this.order || ''].name
    },
    type () {
      return (
        (this.identifier[this.order || ''] &&
          this.identifier[this.order || ''].dataType.type) ||
        null
      )
    },
    unit () {
      return (
        (this.identifier[this.order || ''] &&
          this.identifier[this.order || ''].dataType.specs.unit) ||
        null
      )
    },
    specs () {
      const type = this.identifier[this.order || ''] && this.identifier[this.order || ''].dataType.type
      if (type === 'int' || type === 'float') {
        // console.log('dataType.specs', identifier[this.order || ''].dataType.specs)
        return this.identifier[this.order || ''].dataType.specs
      }
      return (
        this.identifier[this.order || ''] &&
        _.keys(identifier[this.order || ''].dataType.specs).map((item) => ({
          id: item,
          title: identifier[this.order || ''].dataType.specs[item]
        }))
      )
    }
  },
  methods: {
    async handleSubmit () {
      if (!this.order || !this.device) return
      const order = this.order
      let spec = this.spec || ''
      if (this.type === 'enum' || this.type === 'int') {
        spec = parseInt(spec)
      } else if (this.type === 'float') {
        spec = parseFloat(spec)
      } else if (this.type !== 'text') {
        message.warning('请选择指令')
        return
      }
      this.loading = true
      try {
        await TOOLS({
          deviceId: this.device,
          [order]: spec
        })
        message.success({
          content: '操作成功'
        })
        this.order = null
        this.spec = null
      } catch (e) {
        // console.error('e', e)
        message.error({
          content: (e && e.msg) || '操作失败'
        })
      }
      this.loading = false
    }
  }
}
</script>
