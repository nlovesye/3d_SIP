<style lang="less">
  .login-box {
    // position: absoult;
      position: absolute;
      width: 500px;
      top: 0;
      right: 0;
      height: 100%;
      background: rgba(29, 28, 26, 0.8);
  }
  .login{
    width: 100%;
    height: 100%;
    background-image: url('~@assets/images/login-bg.png');
    background-size: cover;
    background-position: center;
    position: relative;
    .ivu-card-head{
      text-align: center;
    }
    .ivu-card-body{
      padding-top: 0;
      .type{
        display: flex;
        justify-content: space-around;
        margin-bottom: 18px;
      }
    }
    &-con{
        position: absolute;
        right: 100px;
        top: 50%;
        -webkit-transform: translateY(-60%);
        transform: translateY(-60%);
        width: 300px;
        &-header{
            font-size: 16px;
            font-weight: 300;
            text-align: center;
            padding: 30px 0;
        }
        .form-con{
            padding: 10px 0 0;
        }
        .login-tip{
            font-size: 10px;
            text-align: center;
            color: #c3c3c3;
        }
    }
}
</style>

<template>
  <div class="login">
    <div style="padding: 40px;display: flex;align-items: center;color: white;">
      <img src="~@/assets/images/logo-login.png" alt="logo">
      <div style="font-size: 20px; margin-left: 10px;">3D智慧盘点平台</div>
    </div>
    <div class="login-box">
    <div class="login-con">
      <Card icon="log-in" :title="title" :bordered="false">
        <div class="form-con">
          <!-- <RadioGroup class="type" v-model="userType">
            <Radio label="personal">
              <span>个人用户</span>
            </Radio>
            <Radio label="enterprise">
              <span>企业用户</span>
            </Radio>
          </RadioGroup> -->
          <Form ref="loginForm" :model="formValid" :rules="rules" @keydown.enter.native="handleSubmit" v-if="formType === 'login'">
            <FormItem prop="userName" key="loginUserName">
              <Input v-model="formValid.userName" placeholder="请输入用户名">
                <span slot="prepend">
                  <Icon :size="16" type="ios-person"></Icon>
                </span>
              </Input>
            </FormItem>
            <FormItem prop="password" key="loginPwd">
              <Input type="password" v-model="formValid.password" placeholder="请输入密码">
                <span slot="prepend">
                  <Icon :size="14" type="md-lock"></Icon>
                </span>
              </Input>
            </FormItem>
            <Checkbox style="margin-bottom: 10px" v-model="remember">记住密码</Checkbox>
            <FormItem style="margin-bottom: 10px">
              <Button @click="handleSubmit" type="primary" long :loading="loginLoading">登录</Button>
            </FormItem>
            <!-- <p class="login-tip">没有账号？<a href="javascript:;" @click="changeFormType('register')">立即注册</a></p> -->
          </Form>
          <Form ref="registerForm" :model="registerValid" v-else>
            <FormItem prop="userName2" key="registUserName">
              <Input v-model="registerValid.userName" placeholder="用户名" type="text" />
            </FormItem>
            <FormItem prop="password2" key="registPwd">
              <Input type="password" v-model="registerValid.password" placeholder="密码" />
            </FormItem>
            <FormItem prop="userName2">
              <Input v-model="registerValid.name" placeholder="姓名" type="text" />
            </FormItem>
            <FormItem prop="userName2">
              <Input v-model="registerValid.idCard" placeholder="身份证号" type="text" />
            </FormItem>
            <FormItem prop="userName2">
              <Input v-model="registerValid.phone" placeholder="手机号" type="text" />
            </FormItem>
            <FormItem style="margin-bottom: 10px">
              <Button type="primary" long>注册</Button>
            </FormItem>
            <p class="login-tip">已有账号？<a href="javascript:;" @click="changeFormType('login')">点击登录</a></p>
          </Form>
        </div>
      </Card>
    </div>
    <div style="position: absolute;bottom: 14px;width: 100%;text-align: center;font-size: 12px;color: rgba(255, 255, 255, 0.6);">
        Copyright © 2019 Shenzhen Comma Technology All rights reserved
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { encryption } from '@/libs/util'

interface IForm {
  userName: string;
  password: string;
}

interface IRegister extends IForm {
  name: string;
  idCard: string;
  phone: number | string;
}

@Component
export default class Login extends Vue {
  @Action private LOGIN: any;

  @Provide() formValid: IForm = {
    userName: '',
    password: ''
  }
  @Provide() private registerValid: IRegister = {
    userName: '',
    password: '',
    name: '',
    idCard: '',
    phone: ''
  }
  @Provide() userType: string = 'personal'
  @Provide() remember: boolean = false
  @Provide() private formType = 'login'
  @Provide() loginLoading: boolean = false

  get rules () {
    return {
      // userName: this.userNameRules,
      // password: this.passwordRules
    }
  }

  get title () {
    return this.formType === 'login' ? '登录' : '注册'
  }

  /**
   * @description 改变表单 登录/注册
   */
  changeFormType (type: string) : void {
    this.formType = type
  }

  /**
   * @description 登录
   */
  async handleSubmit () {
    // this.LOGIN();
    const valid = await (this.$refs.loginForm as any).validate()
    if (!valid) {
      return
    }
    const reqData = encryption({
      data: {
        username: this.formValid.userName,
        password: this.formValid.password,
        remember: this.remember,
        code: '',
        randomStr: '',
        scope: 'server',
        grant_type: 'password'
      },
      key: '1234567887654321',
      param: ['password']
    })
    this.loginLoading = true
    await this.LOGIN(reqData)
    this.loginLoading = false
  }

  created () {
    // console.log('login')
  }
}
</script>
