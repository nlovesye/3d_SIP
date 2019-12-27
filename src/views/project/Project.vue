<style lang="less" src="./project.less"></style>

<template>
    <Layout class="project">
        <Sider
            collapsible
            :collapsed-width="0"
            v-model="isCollapsed"
            class="project_sider"
            ref="sider"
        >
            <div slot="trigger" :class="['sider_topcon', isCollapsed ? 'collapsed' : 'nocollapsed']">
                <div class="opt">
                    <span class="text_click" @click="openAdd('showNewGroup')">创建分组</span>
                    <span class="text_click" @click="openAdd('showNewProject')">创建工程</span>
                </div>
            </div>
            <Spin fix v-if="groupLoad" style="background: rgba(255, 255, 255, 0.26)" />
            <Tree
                v-else
                class="group_tree"
                empty-text="无分组数据"
                :data="groupList"
                :render="renderGroup"
                :load-data="getProjectList"
                children-key="projectList"
            ></Tree>
        </Sider>
        <Layout class="project_rightcon">
            <NewModal
                :loading="newModalLoad"
                title="分组"
                :type="modalType"
                :defaultVal="modalDefaultVal"
                @submit="d => onNewModalSubmit(d, 'group')"
                @cancel="onNewModalHide"
                :show="showNewGroup"
            />
            <NewModal
                :loading="newModalLoad"
                title="工程"
                :type="modalType"
                :defaultVal="modalDefaultVal"
                @submit="d => onNewModalSubmit(d, 'project')"
                @cancel="onNewModalHide"
                :show="showNewProject"
            />

            <Modal
                class-name="history"
                :value="historyVisible && inHistory"
                :mask="false"
                :transfer="false"
                :closable="false"
                width="255"
                footer-hide
            >
                <template slot="header">
                    <div class="ivu-modal-header-inner">
                        历史数据
                        <Icon type="md-close" class="close" size=20 @click="onHistoryBack" />
                    </div>
                </template>
                <DatePicker
                    type="daterange"
                    placement="bottom"
                    placeholder=""
                    style="width: 100%;"
                    :options="{
                        disabledDate (date) {
                            return date && date.valueOf() > Date.now()
                        }
                    }"
                    v-model="historyTime"
                    @on-change="onHistoryDateChange"
                ></DatePicker>
                <Table
                    border
                    class="tb history_table"
                    height="300"
                    :columns="[
                        {
                            tooltip: true,
                            title: '文件名称',
                            key: 'originalFileName'
                        },
                        {
                            title: '操作',
                            width: 50,
                            align: 'center',
                            slot: 'action'
                        }
                    ]"
                    :data="historyList"
                    :loading="historyListLoad"
                >
                    <template slot-scope="{ row }" slot="action">
                        <Icon type="md-arrow-dropright" class="tb_play" size="22" @click="onHistoryRun(row)" />
                    </template>
                </Table>
            </Modal>

            <Modal
                class-name="project_setting"
                :value="settingVisible && !inHistory"
                :closable="false"
                :mask-closable="false"
                :mask="false"
                :transfer="false"
                width="475"
                footer-hide
                @on-visible-change="settingVisibleChange"
            >
                <Spin
                    fix
                    v-if="projectLoad"
                    size="large"
                >
                    <Icon type="ios-loading" size=38 class="spin-icon-load"></Icon>
                    <div>{{ loadText }}</div>
                </Spin>
                <template slot="header">
                    <div class="ivu-modal-header-inner">
                        工程配置
                        <Icon type="md-close" class="close" size=20 @click="onSettingClose" />
                    </div>
                </template>
                <div class="tabs">
                    <ul class="tabs_nav">
                        <li
                            v-for="setting in settings"
                            :key="setting.key"
                            :class="setting.selected ? 'active' : ''"
                            @click.prevent="onSelected(setting.key)"
                            >
                            {{ setting.name }}
                        </li>
                    </ul>

                    <transition-group tag="ul" class="tabs_content" name="fade">
                        <li key="sensor" class="sensor" v-show="selectedSetting.key === 'sensor'">
                            <div class="headbar">
                                <label>传感器ID:</label>
                                <Select
                                    v-model="selectedDeviceId"
                                    style="width:130px"
                                    @on-open-change="onOpenChange"
                                    placeholder=""
                                    :loading="deviceListLoad"
                                >
                                <Option
                                    v-for="item in allDeviceList"
                                    :value="item.deviceId"
                                    :key="item.deviceId"
                                >{{ item.deviceId }}</Option>
                                </Select>
                                <Button
                                    :disabled="!selectedDeviceId"
                                    @click="addDeviceToProject"
                                    :loading="addDeviceLoad"
                                >连接</Button>
                            </div>
                            <Table
                                ref="deviceTable"
                                class="tb"
                                border
                                height="127"
                                :columns="[
                                    {
                                        tooltip: true,
                                        title: 'ID号',
                                        key: 'deviceId'
                                    },
                                    {
                                        title: '操作',
                                        width: 90,
                                        slot: 'action'
                                    }
                                ]"
                                :data="deviceList"
                                :loading="devicesLoad"
                                highlight-row
                                @on-current-change="onSelectedDeviceChange"
                            >
                                <template slot-scope="{ row }" slot="action">
                                    <Icon type="md-trash" class="tb_trash" @click="deleteDeviceFromProject(row)" />
                                </template>
                            </Table>
                            <div class="location">
                                <h4>位置信息</h4>
                                <ul>
                                    <li>
                                        <h5>X</h5>
                                        <InputNumber
                                            style="width: 100%;"
                                            :max="99999"
                                            v-model="currentDevice.x"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                    <li>
                                        <h5>Y</h5>
                                        <InputNumber
                                            style="width: 100%;"
                                            :max="99999"
                                            v-model="currentDevice.y"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                    <li>
                                        <h5>Z</h5>
                                        <InputNumber
                                            :max="99999"
                                            style="width: 100%;"
                                            v-model="currentDevice.z"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                    <li>
                                        <h5>α</h5>
                                        <InputNumber
                                            :max="99999"
                                            style="width: 100%;"
                                            v-model="currentDevice.α"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                    <li>
                                        <h5>β</h5>
                                        <InputNumber
                                            :max="99999"
                                            style="width: 100%;"
                                            v-model="currentDevice.β"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                    <li>
                                        <h5>γ</h5>
                                        <InputNumber
                                            :max="99999"
                                            style="width: 100%;"
                                            v-model="currentDevice.γ"
                                            :disabled="!currentDevice.id"
                                        ></InputNumber>
                                    </li>
                                </ul>
                            </div>
                            <div class="btn_bar">
                                <Button type="default" @click="sensorReset" :loading="resetLoad" :disabled="projectInfo.taskStatus !== 0">复位</Button>
                                <Button type="default" @click="gatherData" :loading="projectLoad" v-auth="'project_collect'">数据采集</Button>
                                <Button type="default" @click="sensorSave" :loading="sensorSaveLoad">保存</Button>
                            </div>
                        </li>

                        <li key="boundary" class="boundary" v-show="selectedSetting.key === 'boundary'">
                            <div class="positions">
                                <div class="top_bar">
                                    <span>锚点位置</span>
                                    <div v-if="inClipping">
                                        <Button type="default" @click="onCalibrationCancel(1)">取消</Button>
                                        <Button type="default" @click="onCalibrationConfirm(1)" style="margin-left: 5px;">完成</Button>
                                    </div>
                                    <Button v-else type="default" @click="onCalibration(1)">标定</Button>
                                </div>
                                <Table
                                    class="tb"
                                    ref="calibrationsTable"
                                    border
                                    height="200"
                                    :columns="[
                                        {
                                            type: 'index',
                                            width: 32,
                                            align: 'center'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'x',
                                            key: 'x'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'y',
                                            key: 'y'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'z',
                                            key: 'z'
                                        }
                                    ]"
                                    :data="calibrations"
                                    :loading="calibrationsLoad"
                                >
                                </Table>
                            </div>
                            <div class="area">
                                <h4>显示区域</h4>
                                <RadioGroup v-model="boundaryTask" type="button" @on-change="onBoundaryTaskChange">
                                    <Radio
                                        :label="1"
                                    >
                                        Highlight
                                    </Radio>
                                    <Radio
                                        :label="2"
                                    >
                                        Inside
                                    </Radio>
                                    <Radio
                                        :label="3"
                                    >
                                        Outside
                                    </Radio>
                                </RadioGroup>
                            </div>
                            <div class="btn_bar">
                                <Button @click="calibrationsSave(1)" :loading="projectLoad" :disabled="inClipping || calibrations.length < 3">保存</Button>
                            </div>
                        </li>

                        <li key="denoising" class="denoising" v-show="selectedSetting.key === 'denoising'">
                            <div class="count">
                                <span style="line-height: 24px;">去噪次数：</span>
                                <InputNumber v-model="denoiseTimes" :max="99" :min="0" />
                            </div>
                            <div class="btn_bar">
                                <Button :loading="projectLoad" @click="onDenoising" style="margin-top: 10px;">保存</Button>
                            </div>
                        </li>

                        <li key="modeling" class="modeling" v-show="selectedSetting.key === 'modeling'">
                            <div class="type">
                                <h4>
                                    <span>建模类型</span>
                                </h4>
                                <RadioGroup v-model="modeType" @on-change="onModeTypeChange" type="button">
                                    <Radio label="pointcloud" :disabled="!projectInfo.meshFilePath">点云</Radio>
                                    <Radio label="line" :disabled="!projectInfo.meshFilePath">网格</Radio>
                                    <Radio label="mesh" :disabled="!projectInfo.meshFilePath">三维模型</Radio>
                                </RadioGroup>
                            </div>
                            <div class="btn_bar">
                                <Button @click="modelingGenerate" :loading="projectLoad">生成模型</Button>
                            </div>
                        </li>

                        <li key="ground" class="ground" v-show="selectedSetting.key === 'ground'">
                            <div class="location">
                                <h4>
                                    <span>锚点位置</span>
                                    <Button type="default">标定</Button>
                                </h4>
                                <Table
                                    class="tb"
                                    ref="calibrationsTable2"
                                    border
                                    height="200"
                                    :columns="[
                                        {
                                            type: 'index',
                                            width: 32,
                                            align: 'center'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'x',
                                            key: 'x'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'y',
                                            key: 'y'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'z',
                                            key: 'z'
                                        }
                                    ]"
                                    :data="calibrations2"
                                    :loading="calibrationsLoad"
                                >
                                </Table>
                            </div>
                            <div class="btn_bar">
                                <Button :loading="projectLoad">保存</Button>
                            </div>
                        </li>

                        <li key="datum" class="datum" v-show="selectedSetting.key === 'datum'">
                            <div class="location">
                                <h4>
                                    <span>锚点位置</span>
                                    <div v-if="inDatum">
                                        <Button type="default" @click="onCalibrationCancel(3)">取消</Button>
                                        <Button type="default" @click="onCalibrationConfirm(3)" style="margin-left: 5px;">完成</Button>
                                    </div>
                                    <Button v-else type="default" @click="onCalibration(3)">标定</Button>
                                </h4>
                                <Table
                                    class="tb"
                                    ref="calibrationsTable3"
                                    border
                                    height="200"
                                    :columns="[
                                        {
                                            type: 'index',
                                            width: 32,
                                            align: 'center'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'x',
                                            key: 'x'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'y',
                                            key: 'y'
                                        },
                                        {
                                            tooltip: true,
                                            title: 'z',
                                            key: 'z'
                                        }
                                    ]"
                                    :data="calibrations3"
                                    :loading="calibrationsLoad"
                                >
                                </Table>
                            </div>
                            <div class="btn_bar">
                                <Button type="default" :loading="projectLoad"  @click="calibrationsSave(3)" :disabled="inDatum">保存</Button>
                            </div>
                        </li>

                        <li key="calculate" class="calculate" v-show="selectedSetting.key === 'calculate'">
                            <div class="density">
                                <span style="line-height: 24px;">密度：</span>
                                <div>
                                    <InputNumber v-model="density" style="width: 100px;" />
                                    <span style="margin-left: 5px; line-height: 24px;">kg/m³</span>
                                </div>
                            </div>
                            <div class="btn_bar">
                                <Button :loading="projectLoad" @click="onCalculate" style="margin-top: 10px;">计算工程结果</Button>
                            </div>
                        </li>

                        <li key="cycle" class="cycle" v-show="selectedSetting.key === 'cycle'">
                            <div class="starttime">
                                <div>
                                    <span style="line-height: 24px;">开始时间：</span>
                                </div>
                                <DatePicker
                                    type="datetime"
                                    placeholder=""
                                    v-model="startTime"
                                    :options="{
                                        disabledDate (date) {
                                            return date && date.valueOf() < Date.now() - 86400000;
                                        }
                                    }"
                                ></DatePicker>
                            </div>
                            <div class="period">
                                <div>
                                    <span style="line-height: 24px;">运行周期：</span>
                                    <InputNumber :max="99" :min="0" v-model="period" style="width: 50px;" />
                                </div>
                                <Select v-model="periodType" style="width: 80px; margin-left: 10px;">
                                    <Option :value="1">分钟</Option>
                                    <Option :value="2">小时</Option>
                                    <Option :value="3">天</Option>
                                    <Option :value="4">周</Option>
                                    <Option :value="5">月</Option>
                                </Select>
                            </div>
                            <div class="btn_bar">
                                <Button type="default" @click="onCycleSave" :loading="cycleSaveLoad">保存</Button>
                            </div>
                        </li>
                </transition-group>
                </div>
            </Modal>

            <Header
                :class="['con_header', isCollapsed ? 'collapsed' : '']"
            >
                <div class="toolbar" v-if="toolbarVisible">
                    <div class="tools">
                        <span class="text_click" @click="onTools('setting')">工程配置</span>
                        <div class="divided"></div>
                        <span class="text_click" @click="onTools('history')">历史数据</span>
                        <div class="divided"></div>
                        <span class="text_click" @click="onTools('refresh')">刷新</span>
                    </div>
                    <Button type="default" v-if="inHistory" icon="md-undo" @click="onHistoryBack">返回</Button>
                    <template v-else>
                        <Button v-if="projectInfo.status === 1" icon="md-refresh" type="default" @click="onStart" :loading="startLoad" :disabled="settingVisible">运行</Button>
                        <Button v-else icon="md-hand" type="default" @click="onStop" :loading="stopLoad" :disabled="settingVisible">停止</Button>
                    </template>
                </div>
            </Header>

            <Content class="con_content">
                <Spin
                    fix
                    v-if="projectLoad"
                    size="large"
                >
                    <Icon type="ios-loading" size=38 class="spin-icon-load"></Icon>
                    <div class="spin-icon-load-text">{{ loadText }}</div>
                </Spin>
                <canvas ref="canvas_3d" class="canvas_3d"></canvas>
                <template v-if="!!projectInfo.id">
                    <div class="desc_info" v-if="!inHistory">
                        <Spin
                            fix
                            v-if="projectLoad"
                            size="large"
                        >
                            <Icon type="ios-loading" size=20 class="spin-icon-load"></Icon>
                        </Spin>
                        <p>
                            当前工程：
                            {{ projectInfo.name }}<span class="color">（{{ projectInfo.status === 1 ? '未启动' : projectInfo.status === 2 ? '运行中' : '-' }}）</span>
                        </p>
                        <p>
                            当前时间：
                            <span class="color">{{ currentTime }}</span>
                        </p>
                        <p>
                            上传周期：
                            <span>{{ periodText }}</span>
                        </p>
                        <p>
                            当前步骤：
                            <span>{{ currentStep.text || '-' }}</span>
                        </p>
                        <p>
                            降噪次数：
                            <span>{{ denoiseTimes || '-' }}</span>
                        </p>
                    </div>
                    <div class="desc_info" v-else>
                        <p>
                            当前工程：
                            {{ projectInfo.name }}<span class="color">（历史数据）</span>
                        </p>
                        <p>
                            当前时间：
                            <span class="color">{{ historyInfo.createTime || '-' }}</span>
                        </p>
                        <p>
                            上传周期：
                            <span>{{ periodText }}</span>
                        </p>
                        <p>
                            当前步骤：
                            <span>{{ historySteps[historyStep] || '-' }}</span>
                        </p>
                        <p>
                            降噪次数：
                            <span>{{ historyInfo.denoiseTimes || '-' }}</span>
                        </p>
                    </div>
                    <RadioGroup
                        v-if="inHistory && historyInfo.id"
                        v-model="historyStep"
                        class="history_stepsbar"
                        type="button"
                        @on-change="onHistoryStepChange"
                        size="large"
                    >
                        <Radio :label="1" :disabled="!historyInfo.originalFilePath">数据采集</Radio>
                        <Radio :label="2" :disabled="!historyInfo.multipleMergeFilePath">范围标定</Radio>
                        <Radio :label="3" :disabled="!historyInfo.denoiseFilePath">降噪处理</Radio>
                        <Dropdown transfer-class-name="project_history_dropdown" trigger="click" :transfer="true" :stop-propagation="true" @on-click="onHistoryStepClick">
                            <Button :class="['ivu-radio-wrapper', 'ivu-radio-group-item', 'ivu-radio-small', historyStep === 4 ? 'ivu-radio-wrapper-checked' : '']" ghost>建模数据<Icon type="ios-arrow-up"></Icon></Button>
                            <DropdownMenu slot="list">
                                <DropdownItem name='pointcloud' :disabled="!historyInfo.meshFilePath">点云</DropdownItem>
                                <DropdownItem name='line' :disabled="!historyInfo.meshFilePath">网格</DropdownItem>
                                <DropdownItem name='mesh' :disabled="!historyInfo.meshFilePath">三维</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <!-- <Radio :label="4" :disabled="!historyInfo.meshFilePath">建模数据</Radio> -->
                        <Radio :label="5" :disabled="!historyInfo.meshFilePath">基准面标定</Radio>
                        <Radio :label="6" :disabled="!historyInfo.meshFilePath">数据计算</Radio>
                    </RadioGroup>
                    <div class="calculate_info" v-if="!inHistory">
                        <Spin
                            fix
                            v-if="projectLoad"
                            size="large"
                        >
                            <Icon type="ios-loading" size=20 class="spin-icon-load"></Icon>
                        </Spin>
                        <div class="area">当前面积：<span>{{ area }}</span></div>
                        <div class="volume">当前体积：<span>{{ volume }}</span></div>
                        <div class="weight">当前重量：<span>{{ weight }}</span></div>
                    </div>
                    <div class="calculate_info history" v-if="inHistory">
                        <Spin
                            fix
                            v-if="projectLoad"
                            size="large"
                        >
                            <Icon type="ios-loading" size=20 class="spin-icon-load"></Icon>
                        </Spin>
                        <div class="area">当前面积：<span>{{ historyInfo.area || '-' }}</span></div>
                        <div class="volume">当前体积：<span>{{ historyInfo.volume || '-' }}</span></div>
                        <div class="weight">当前重量：<span>{{ historyInfo.weight || '-' }}</span></div>
                    </div>
                </template>
            </Content>
        </Layout>
    </Layout>
</template>

<script src="./project.js"></script>
