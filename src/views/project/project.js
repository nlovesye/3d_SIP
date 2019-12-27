import NewModal from './NewModal.vue'
import History from './History.vue'
import { mapState } from 'vuex'
import {
    GET_GROUP,
    ADD_GROUP,
    EDIT_GROUP,
    DELETE_GROUP,
    GET_PROJECT_BYGROUP,
    GET_PROJECT,
    ADD_PROJECT,
    EDIT_PROJECT,
    DELETE_PROJECT,
    START_PROJECT,
    STOP_PROJECT,
    GET_CALIBRATION,
    ADD_CALIBRATION,
    DELETE_CALIBRATION,
    ADD_PROJECT_DEVICE,
    GET_PROJECT_DEVICE,
    EDIT_PROJECT_DEVICE,
    DELETE_PROJECT_DEVICE,
    GET_DEVICE_LIST,
    GATHER_DATA,
    MODELING_GENERATE,
    PROJECT_SET_PERIOD,
    GET_CALCULATE,
    GET_STATIC,
    GET_PROJECT_HISTORY,
    PROJECT_DENOISE,
    RESET_DATA
} from '@api/project'
import * as THREE from '@/libs/threejs/three.module.js'
import { sleep, getMousePointCloudIntersection, deepCopy, getMouseModeIntersection } from '@libs/tools'
import { PLYLoader } from '@/libs/threejs/loaders/PLYLoader'
import moment from 'moment'
import { OrbitControls } from '@/libs/threejs/controls/OrbitControls.js'
import { ConvexGeometry } from '@/libs/threejs/geometries/ConvexGeometry'
// potree------------start------------
// import * as MyPotree from '@/libs/potree/Potree.js'
// import { VolumeTool } from '@/libs/potree/utils/VolumeTool.js'
// potree------------end--------------

const {
    Potree
} = window

const _deviceStatus = {
    ONLINE: 1,
    OFFLINE: 2,
    UNACTIVE: 3,
    DISABLE: 4
}

const periodList = {
    1: '分钟',
    2: '小时',
    3: '天',
    4: '周',
    5: '月'
}

const historySteps = {
    1: '数据采集',
    2: '范围标定',
    3: '降噪处理',
    4: '建模数据',
    5: '基准面标定',
    6: '数据计算'
}

export default {
    authCode: 'project_index',
    components: {
        NewModal,
        History
    },
    mounted () {
        // console.log('project>>>>>>>', Potree, THREE)
        this.getGroupList()
        // this.initPotreeViewer()
        // this.gridHelper = new THREE.GridHelper(1000, 100)
        // this.axesHelper = new THREE.AxesHelper(1160)

        // this.initViewer()
    },
    destroyed () {
        // console.log('destroyed')
        // this.pollingProjectInfo = null
        // this.timer && clearInterval(this.timer)

        this.clearViewer()
    },

    computed: {
        ...mapState(['contentWidth', 'contentHeight']),
        // 上传周期text
        periodText () {
            if ('period' in this.projectInfo && 'periodType' in this.projectInfo) {
                return this.projectInfo.period + periodList[this.projectInfo.periodType]
            } else {
                return '-'
            }
        },
        // 当前步骤
        currentStep () {
            const { taskStatus } = this.projectInfo
            switch (taskStatus) {
                case -99:
                    return { type: taskStatus, text: '测试中。。。' }
                case -1:
                    return { type: taskStatus, text: '未采集数据' }
                case 0:
                    return { type: taskStatus, text: '数据采集中' }
                case 1:
                    return { type: taskStatus, text: '数据采集完成' }
                case 2:
                    return { type: taskStatus, text: '范围标定' }
                case 3:
                    return { type: taskStatus, text: '降噪处理' }
                case 4:
                    return { type: taskStatus, text: '建模' }
                case 5:
                    return { type: taskStatus, text: '数据计算' }
                default:
                    return { type: -10, text: '-' }
            }
        },
        // 当前工程配置项
        selectedSetting () {
            return this.settings.find(item => item.selected) || {}
        },
        // 面积
        area () {
            return (this.projectInfo.area || '-')
        },
        // 体积
        volume () {
            return (this.projectInfo.volume || '-')
        },
        // 重量
        weight () {
            return (this.projectInfo.weight || '-')
        }
    },
    periodList,
    pViewer: null, // Potree Viewer实例
    pointcloud: null, // 点云mode
    lineMode: null, // 网格mode
    meshMode: null, // 三维mode
    gridHelper: null,
    axesHelper: null,
    datumMesh: null, // 基准面mesh
    datumCones: [], // 基准面标定点cone
    gridLines: [], // grid线
    timer: null, // 当前时间定时器
    data () {
        return {
            projectLoad: false, // 工程loading
            groupLoad: false, // 分组列表loading
            newModalLoad: false, // 分组/工程弹窗loading
            deleteGPLoad: false, // 删除分组/工程loading
            startLoad: false, // 启动loading
            stopLoad: false, // 停止loading
            resetLoad: false, // 复位loading
            deviceListLoad: false, // 设备选择下拉列表loading
            addDeviceLoad: false, // 添加设备loading
            devicesLoad: false, // 传感器设备列表loading
            deleteDeviceLoad: false, // 删除设备loading
            sensorSaveLoad: false, // 保存传感器设备信息loading
            calibrationsLoad: false, // 标定数据loading
            deleteCalibrationsLoad: false, // 删除标定loading
            cycleSaveLoad: false, // 上传周期保存loading
            historyListLoad: false, // 历史数据列表loading
            settings: [
                {
                    key: 'sensor',
                    name: '传感器',
                    selected: false,
                    intoTabCb: true
                },
                {
                    key: 'boundary',
                    name: '范围标定',
                    selected: false,
                    intoTabCb: true,
                    leaveTabCb: true,
                    type: 1
                },
                {
                    key: 'denoising',
                    name: '去噪',
                    selected: false,
                    intoTabCb: true,
                    leaveTabCb: true
                },
                {
                    key: 'modeling',
                    name: '建模',
                    selected: false,
                    intoTabCb: true,
                    leaveTabCb: true
                },
                {
                    key: 'ground',
                    name: '地面标定',
                    selected: false,
                    intoTabCb: true,
                    leaveTabCb: true,
                    type: 2
                },
                {
                    key: 'datum',
                    name: '基准面标定',
                    selected: false,
                    intoTabCb: true,
                    leaveTabCb: true,
                    type: 3
                },
                {
                    key: 'calculate',
                    name: '工程计算',
                    selected: false
                },
                {
                    key: 'cycle',
                    name: '上传周期',
                    intoTabCb: true,
                    selected: false
                }
            ], // 所有配置项
            isCollapsed: false, // 侧边栏是否折叠
            modalDefaultVal: null, // 新建/编辑分组/工程默认值
            modalType: 1, // 分组/工程弹窗类型：1,2 => 新建，编辑
            showNewGroup: false, // 分组弹窗是否显示
            showNewProject: false, // 工程弹窗是否显示
            groupList: [], // 分组列表
            activeGroupId: '', // 当前选中的分组id
            projectInfo: {}, // 当前选中的工程信息
            toolbarVisible: false, // 头部工具栏显示状态
            loadText: '', // 载入文本
            historyInfo: {}, // 历史记录信息
            settingVisible: false, // 工程配置显示状态
            isColor: false, //, 模型是否已着色
            modeType: '', // 当前模型类型
            allDeviceList: [], // 设备选择下拉列表
            selectedDeviceId: null, // 当前选中传感器设备的id
            currentDevice: {}, // 当前选中设备
            deviceList: [], // 传感器设备列表
            calibrations: [], // 范围标定数据
            calibrations2: [], // 地面标定数据
            calibrations3: [], // 基准面标定数据
            backupCalibrations: [], // 备份范围标定数据
            clippingItem: null, // 裁剪Item
            inClipping: false, // 是否裁剪中
            boundaryTask: 1, // 裁剪显示区域
            denoiseTimes: 0, // 降噪次数
            inDatum: false, // 基准面标定中
            density: 0, // 密度
            startTime: null, // 开始时间
            period: 1, // 上传周期
            periodType: 1, // 上传周期类型 1,2,3,4,5 => 分钟，小时，天，周，月
            currentTime: '', // 当前时间
            historyVisible: false, // 历史数据显示状态
            inHistory: false, // 是否在历史数据模式
            historyTime: ['', ''], // 历史数据时间段
            historyList: [], // 历史数据列表
            historyStep: -1, // 历史数据查看步骤
            historySteps, // 历史数据步骤
            renderer: null, // 3d renderer
            camera: null, // 相机
            scene: null, // 场景
            grids: [], // 所有网格线
            ctrls: null, // 控制器
            aniFrame: 0, // requestAnimationFrame
            mode: null, // 当前显示模型
            points: [] // 点集
        }
    },

    methods: {
        startTimer () {
            if (this.timer) clearInterval(this.timer)
            this.timer = setInterval(() => {
                // console.log('t', moment().format('YYYY-MM-DD HH:mm:ss'))
                this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
            }, 1000)
        },
        // 生成xy平面网格
        generateGrid (size, divisions) {
            const geo = new THREE.Geometry()
            geo.vertices.push(new THREE.Vector3(-size / 2, 0, 0))
            geo.vertices.push(new THREE.Vector3(size / 2, 0, 0))
            for (let i = 0, len = divisions; i <= len; i++) {
                let line = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: 0x455454
                })) // 利用geometry和material创建line
                this.gridLines.push(line)
                line.position.y = i * (size / divisions) - size / 2 // 设置line的位置
                this.pViewer.scene.scene.add(line) // 将line添加到场景中
                line = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: 0x324132
                }))
                this.gridLines.push(line)
                line.position.x = i * (size / divisions) - size / 2
                line.rotation.z = Math.PI / 2 // 绕y轴旋转90度
                this.pViewer.scene.scene.add(line)
            }
        },
        // 侧边栏折叠
        onCollapsedSider () {
            const sider = this.$refs.sider
            sider.toggleCollapse()
        },
        // 打开分组/工程弹窗
        openAdd (type) {
            if (this.showNewGroup || this.showNewProject) return
            if (type === 'showNewProject' && !this.activeGroupId) {
                this.$Message.warning('请先选择分组')
                return
            }
            this.modalDefaultVal = null
            this.modalType = 1
            this[type] = true
        },
        // 打开分组/工程弹窗编辑
        openEdit (type, d) {
          if (this.showNewGroup || this.showNewProject) return
          this.modalDefaultVal = { id: d.id, name: d.name, groupId: d.groupId || null }
          this.modalType = 2
          this[type] = true
        },
        // 分组/工程弹窗提交回调
        async onNewModalSubmit ({ name, id, groupId }, type) {
            try {
                this.newModalLoad = true
                let ret = {}
                if (type === 'group' && this.modalType === 1) {
                // console.log('name', name)
                    ret = await ADD_GROUP({ name })
                    this.getGroupList()
                } else if (type === 'group' && this.modalType === 2) {
                    ret = await EDIT_GROUP({ id, name })
                    this.getGroupList()
                } else if (type === 'project' && this.modalType === 1) {
                    ret = await ADD_PROJECT({
                        groupId: this.activeGroupId,
                        name
                    })
                    const target = this.groupList.find(item => item.id === this.activeGroupId) || {}
                    this.getProjectList(target, (newProjectList) => {
                        this.groupList = this.groupList.map(item => ({
                            ...item,
                            projectList: item.id === this.activeGroupId ? [...newProjectList] : item.projectList
                        }))
                    })
                } else if (type === 'project' && this.modalType === 2) {
                    ret = await EDIT_PROJECT({
                        groupId,
                        id,
                        name
                    })
                    const target = this.groupList.find(item => item.id === groupId) || {}
                    this.getProjectList(target, (newProjectList) => {
                        this.groupList = this.groupList.map(item => ({
                            ...item,
                            projectList: item.id === groupId ? [...newProjectList] : item.projectList
                        }))
                    })
                }
                this.$Message.success(ret.msg)
                this.onNewModalHide()
            } catch (error) {
                console.log(error)
            } finally {
                this.newModalLoad = false
            }
        },
        // 分组/工程弹窗隐藏回调 取消
        onNewModalHide () {
          this.showNewGroup = false
          this.showNewProject = false
        },

        // 删除分组/工程
        async deleteGroupOrProject (d, type) {
            try {
                if (this.deleteGPLoad) return
                this.deleteGPLoad = true
                if (type === 'group') {
                    await DELETE_GROUP(d.id)
                    this.getGroupList()
                } else if (type === 'project') {
                    await DELETE_PROJECT(d.id)
                    this.groupList = this.groupList.map(item => ({
                        ...item,
                        projectList: item.id === d.groupId ? item.projectList.filter(c => c.id !== d.id) : item.projectList
                    }))
                    if (d.id === this.projectInfo.id) {
                        this.clearPotreeViewer()
                        this.clearProject()
                    }
                }
                this.$Message.success('操作成功')
            } catch (error) {
                console.log(error)
            } finally {
                this.deleteGPLoad = false
            }
        },

        // 分组渲染
        renderGroup (h, { data }) {
            const { type } = data
            return h('div', {
                class: 'group_item' + (this.activeGroupId === data.id ? ' active' : '') + (this.projectInfo.id === data.id ? ' peoject_on' : '')
            }, [
                h('div', {
                    class: 'content ' + type,
                    on: {
                        click: () => {
                            const { type } = data
                            // console.log('click!!', type)
                            if (data.id === this.activeGroupId) return
                            if (type === 'group') {
                                this.activeGroupId = data.id
                            } else if (type === 'project') {
                                this.selectProject(data)
                            }
                        }
                    }
                }, [
                    h('Icon', {
                        props: {
                            type: type === 'group' ? 'md-folder' : 'md-document'
                        },
                        style: {
                            marginRight: '8px',
                            fontSize: '20px'
                        }
                    }),
                    h('span', data.name)
                ]),
                h('Dropdown', {
                    props: {
                        trigger: 'click'
                    },
                    on: {
                        'on-click': (name) => {
                            // console.log('click', name)
                            if (name === 'edit') {
                                this.openEdit(data.type === 'group' ? 'showNewGroup' : 'showNewProject', data)
                            } else if (name === 'delete') {
                                this.$Modal.confirm({
                                    title: `是否确定删除${data.type === 'group' ? '分组' : '工程'}?`,
                                    onOk: () => {
                                        this.deleteGroupOrProject(data, data.type)
                                    }
                                })
                            }
                        }
                    }
                }, [
                    h('Icon', {
                        class: 'more',
                        props: {
                            type: 'md-more'
                        },
                        style: {
                            fontSize: '20px'
                        }
                    }),
                    h('DropdownMenu', {
                        slot: 'list'
                    }, [
                        h('DropdownItem', { props: { name: 'edit' } }, '重命名'),
                        h('DropdownItem', { props: { name: 'delete' } }, '删除')
                    ])
                ])
            ])
        },
        // 获取分组列表
        async getGroupList () {
            try {
                this.groupLoad = true
                const ret = await GET_GROUP()
                this.groupList = (ret || []).map(item => {
                    return {
                        ...item,
                        title: item.name,
                        projectList: [],
                        loading: false,
                        type: 'group'
                    }
                })
            } catch (error) {
                this.groupList = []
                console.log(error)
            } finally {
                this.groupLoad = false
            }
        },
        // 根据分组获取工程列表
        async getProjectList (item, cb) {
            try {
                // console.log('getProjectList', item)
                let ret = await GET_PROJECT_BYGROUP(item.id)
                ret = ret || []
                ret = ret.map(item => ({
                    ...item,
                    title: item.name,
                    type: 'project'
                }))
                // console.log('ret', ret)
                cb(ret)
            } catch (error) {
                console.log(error)
                cb()
            }
        },

        // 初始化potree场景
        initPotreeViewer () {
            this.pViewer = new Potree.Viewer(this.$refs.potree_render)
            if (this.pViewer && this.pViewer.scene && this.pViewer.renderer) {
                let ctrls = new OrbitControls(this.pViewer.scene.cameraP, this.pViewer.renderer.domElement)
                ctrls.enableZoom = true
                ctrls.minDistance = 0
                ctrls.maxDistance = 5000
                ctrls.enablePan = true
            }
            this.pViewer.renderer.domElement.addEventListener('click', this.onDatumMouseClick)
        },
        // 清空potree场景

        // 切换选择工程
        async selectProject2 (project, isRefresh = false) {
            // console.log('选择工程', project)
            if (this.projectLoad || (project.id === this.projectInfo.id && !isRefresh)) return
            try {
                this.loadText = '工程载入中'
                this.projectLoad = true
                this.clearPotreeViewer()
                this.clearProject()
                const ret = await GET_PROJECT(project.id)
                this.projectInfo = ret || {}
                // this.projectInfo = {
                //     id: 'test',
                //     name: 'static source',
                //     originalFilePath: 'merge/20191225135614179230',
                //     multipleMergeFilePath: 'merge/20191225135614179230',
                //     meshFilePath: 'merge/20191225135614179230',
                //     taskStatus: -99
                // }
                this.startTimer()
                this.toolbarVisible = true
                await this.showCurrentMode()
                this.pollingRefreshProjectInfo(project.id)
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
            }
        },
        // 清空当前打开的工程信息
        clearProject () {
            this.projectInfo = {}
            this.toolbarVisible = false
            this.historyInfo = {}
            this.historyVisible = false
            this.inHistory = false
            this.selectedDeviceId = null
            this.settingVisible = false
            this.allDeviceList = []
            this.deviceList = []
            this.modeType = ''
            this.currentDevice = {}
            this.settings = this.settings.map(item => {
                item.selected = false
                return item
            })
            this.calibrations = []
            this.datumCones = []
            this.calibrations3 = []
            this.boundaryTask = 1
            this.denoiseTimes = 0
            this.inClipping = false
            this.inDatum = false
            this.backupCalibrations = []
            this.historyTime = ['', '']
            this.historyList = []
            this.historyStep = 1
            this.period = 1
            this.periodType = 1
            this.startTime = null
            // console.log('clearProject', this.historyVisible)
        },

        // 工具栏click事件回调
        onTools (type) {
            if (this.projectLoad || !!this.clippingItem) {
                return
            }
            if (type !== 'setting' && type !== 'history' && type !== 'refresh' && !this.pointcloud) {
                this.$Message.error('当前无模型展示')
                return
            }
            switch (type) {
                case 'setting':
                    this.onSettingShow()
                    break
                case 'history':
                    this.onShowHistory()
                    break
                case 'toColor':
                    this.onColorChange()
                    break
                case 'refresh':
                    this.selectProject(this.projectInfo, true)
                    break
                default:
                    break
            }
        },

        // 着色
        onColorChange () {
            if (this.modeType === 'pointcloud') {
                if (this.isColor) {
                    this.pViewer.scene.pointclouds.forEach(pc => {
                        pc.material.activeAttributeName = 'RGBA'
                    })
                } else {
                    this.pViewer.scene.pointclouds.forEach(pc => {
                        pc.material.activeAttributeName = 'elevation'
                    })
                }
                this.isColor = !this.isColor
            } else {
                this.$Message.warning('网格和三维模型暂不支持此功能！')
            }
        },

        // 模型着色
        setModeColor2 (geo) {
            const position = geo.getAttribute('position')
            const fr = new Float32Array(position.count * position.itemSize)
            const max = Math.max.apply(null, position.array)
            position.array.forEach((item, i) => {
                if (((i + 1) % 3) === 0) {
                    let c = item / (max * 10 / 9)
                    c = Math.abs(c)
                    fr[i - 2] = c * 0.4
                    fr[i - 1] = c * 0.6
                    fr[i] = c * 0.8
                }
            })
            geo.setAttribute('color', new THREE.BufferAttribute(fr, 3))
        },
        // 显示点云模型
        async showPointsMode (path, name) {
            if (!path) return
            try {
                this.loadText = this.loadText || '模型加载中'
                this.projectLoad = true
                if (name) {
                    if (!this.pViewer) {
                        this.initPotreeViewer()
                    }
                    // this.pViewer.scene.scene.add(this.gridHelper)
                    this.generateGrid(1000, 100)
                    this.pViewer.scene.scene.add(this.axesHelper)
                    let loader = new PLYLoader()
                    const url = name
                    const data = await GET_STATIC(url, { responseType: 'arraybuffer' })
                    const geo = loader.parse(data)
                    geo.computeVertexNormals()
                    this.setModeColor(geo)
                    // console.log('mesh', geo, geo.getAttribute('color'), fr)
                    var material = new THREE.PointsMaterial({
                        vertexColors: THREE.VertexColors,
                        size: 0.1,
                        depthTest: false
                    })
                    this.pointcloud = new THREE.Points(geo, material)
                    this.pointcloud.name = 'pointcloud'
                    this.pViewer.scene.scene.add(this.pointcloud)
                } else {
                    this.clearPotreeViewer()
                    let urlPro = `${path}/cloud.js`
                    const data = await GET_STATIC(urlPro)
                    const e = await Potree.resolvePointCloud({
                        type: 'cloud.js',
                        data,
                        name: this.projectInfo.name,
                        url: `/api/datagram/static/${urlPro}`
                    })
                    if (e) {
                        // await sleep(8000)
                        await sleep(500)
                        this.pointcloud = e.pointcloud
                        this.modeType = 'pointcloud'
                        if (!this.pViewer) {
                            this.initPotreeViewer()
                        }
                        // this.pViewer.scene.scene.add(this.gridHelper)
                        this.generateGrid(1000, 100)
                        this.pViewer.scene.scene.add(this.axesHelper)
                        this.pViewer.scene.addPointCloud(this.pointcloud)
                        this.pViewer.scene.pointclouds.forEach(pc => {
                            pc.material.activeAttributeName = 'elevation'
                        })
                        let material = this.pointcloud.material
                        material.size = 1
                        material.pointSizeType = Potree.PointSizeType.ADAPTIVE
                    } else {
                        throw Error({ message: '模型解析失败！' })
                    }
                }
            } catch (error) {
                console.log('获取静态资源失败！', error)
            } finally {
                // this.loadText = ''
                this.projectLoad = false
            }
        },
        // 清除当前场景已显示mode
        clearPotreeViewer () {
            if (this.pointcloud) {
                this.pViewer && this.pViewer.scene.removeAllPointCloud()
                this.pViewer && this.pViewer.scene.scene.remove(this.pointcloud)
                this.pointcloud = null
            }
            this.meshMode && this.pViewer && this.pViewer.scene.scene.remove(this.meshMode)
            this.meshMode = null
            if (this.pointcloud) {
                this.pViewer && this.pViewer.scene.scene.remove(this.pointcloud)
            }
            if (this.lineMode) {
                this.pViewer && this.pViewer.scene.scene.remove(this.lineMode)
            }
            if (this.meshMode) {
                this.pViewer && this.pViewer.scene.scene.remove(this.meshMode)
            }
            this.gridLines && this.gridLines.forEach(line => this.pViewer && this.pViewer.scene.scene.remove(line))
            this.gridLines = []
            this.clearClipVolumes()
            this.pViewer = null
        },

        // 轮询获取工程信息
        async pollingProjectInfo (curProjectInfo, diffKey) {
            // await sleep(3500)
            // return curProjectInfo
            try {
                let newProjectInfo = await GET_PROJECT(curProjectInfo.id)
                if (newProjectInfo[diffKey] && newProjectInfo[diffKey] !== curProjectInfo[diffKey]) {
                    // console.log('newInfo')
                    return newProjectInfo
                } else {
                    // console.log('nofresh')
                    await sleep(3000)
                    return await this.pollingProjectInfo(curProjectInfo, diffKey)
                }
            } catch (error) {
                console.log(error)
                return curProjectInfo
            }
        },

        // 轮询刷新 projectInfo
        async pollingRefreshProjectInfo (id) {
            const { status } = this.projectInfo
            if (status !== 2) return
            try {
                this.projectInfo = await GET_PROJECT(id)
                await sleep(3000)
                this.pollingRefreshProjectInfo(id)
            } catch (error) {
                console.log(error)
                this.pollingRefreshProjectInfo(id)
            }
        },

        // 运行
        async onStart () {
            this.$Modal.confirm({
                title: '将按已保存工程配置启动，是否确定？',
                onOk: async () => {
                    try {
                        this.startLoad = true
                        this.settingVisible = false
                        const ret = await START_PROJECT(this.projectInfo.id)
                        this.selectProject(this.projectInfo, true)
                        this.$Message.success(ret.msg)
                    } catch (error) {
                        console.log(error)
                    } finally {
                        this.startLoad = false
                    }
                }
            })
        },

        // 停止
        async onStop () {
            try {
                this.stopLoad = true
                const ret = await STOP_PROJECT(this.projectInfo.id)
                this.selectProject(this.projectInfo, true)
                // this.projectInfo = { ...this.projectInfo, status: 1 }
                this.$Message.success(ret.msg)
            } catch (error) {
                console.log(error)
            } finally {
                this.stopLoad = false
            }
        },

        // 工程设置显示状态改变
        settingVisibleChange (open) {
            // console.log('settingVisibleChange')
            if (open) {
                this.settingInit()
            } else {
                this.settingHide()
            }
        },
        // 工程设置显示回调
        settingInit () {
            // this.onSelected('sensor')
        },
        // 工程设置隐藏回调
        settingHide () {
            // this.settings = this.settings.map(item => {
            //     item.selected = false
            //     return item
            // })
            // this.pViewer.scene.scene.remove(this.lineMode)
            // this.pViewer.scene.scene.remove(this.meshMode)
            // this.selectedDeviceId = null
            // this.deviceList = []
        },
        // 清空工程配置
        clearSettings () {

        },
        // 工程配置显示
        onSettingShow () {
            if (this.projectInfo.status === 2) {
                this.$Message.warning('工程已启动，请先停止工程！')
                return
            }
            if (this.inHistory) {
                this.$Message.warning('请关闭历史数据模式！')
                return
            }
            if (this.settingVisible) {
                this.onSettingClose()
            } else {
                this.settingVisible = true
                this.onSelected('sensor')
            }
        },
        // 工程配置关闭
        onSettingClose () {
            this.settingVisible = false
        },
        // 切换当前tab配置项
        async onSelected (key) {
          if (key === this.selectedSetting.key || this.clippingItem || this.inDatum) return
          const { originalFilePath, multipleMergeFilePath, meshFilePath } = this.projectInfo
          if (key !== 'sensor' && (!originalFilePath && !multipleMergeFilePath && !meshFilePath)) {
            this.$Message.warning('数据尚未采集成功，请先等待数据采集完成!')
            return
          }
          if ((key === 'ground' || key === 'datum' || key === 'calculate' || key === 'cycle') && !this.projectInfo.meshFilePath) {
            this.$Message.warning('请先完成建模再进行该操作!')
            return
          }
          if (this.selectedSetting && this.selectedSetting.leaveTabCb) {
            await this.leaveTabCb(this.selectedSetting)
          }
          let target = null
          this.settings = this.settings.map(item => {
            if (key === item.key) target = item
            return {
              ...item,
              selected: item.key === key
            }
          })
          if (this.selectedSetting && this.selectedSetting.intoTabCb) {
            this.intoTabCb(target)
          }
        },
        // tab切换进入into回调callback
        async intoTabCb (item) {
          const { key } = item
          switch (key) {
            case 'sensor':
                this.getDeviceList()
                break
            case 'boundary':
                this.getCalibrations({ type: 1 })
                break
            case 'denoising':
                this.denoiseTimes = 'denoiseTimes' in this.projectInfo ? this.projectInfo.denoiseTimes : 0
                break
            case 'modeling':
                this.clearPotreeViewer()
                this.showCurrentMode()
                break
            case 'ground':
                this.getCalibrations({ type: 2 })
                break
            case 'datum':
                await this.getCalibrations({ type: 3 })
                this.showDatumView()
                break
            case 'cycle':
                if (this.projectInfo) {
                    this.startTime = 'startTime' in this.projectInfo ? new Date(this.projectInfo.startTime) : new Date()
                    this.period = 'period' in this.projectInfo ? this.projectInfo.period : this.period
                    this.periodType = 'periodType' in this.projectInfo ? this.projectInfo.periodType : null
                }
                break
            default:
                break
          }
        },
        // tab切换leave回调callback
        async leaveTabCb (item) {
          const { key } = item
          switch (key) {
            case 'boundary':
              this.boundaryTask = 1
              this.pViewer && this.pViewer.setClipTask(1)
              this.clearClipVolumes()
              break
            case 'denoising':
                break
            case 'modeling':
              if (this.modeType !== 'pointcloud') {
                // this.onModeTypeChange('pointcloud')
                this.modeType = 'pointcloud'
              }
              this.pointcloud && this.pViewer && this.pViewer.scene.scene.remove(this.pointcloud)
              this.meshMode && this.pViewer && this.pViewer.scene.scene.remove(this.meshMode)
              await this.showCurrentMode()
              break
            case 'ground':
              this.clearClipVolumes()
              break
            case 'datum':
              this.clearClipVolumes()
              break
            default:
              break
          }
        },

        // 设备下拉框
        async onOpenChange (open) {
            if (open) {
                try {
                    this.allDeviceList = []
                    this.deviceListLoad = true
                    let list = await GET_DEVICE_LIST()
                    this.allDeviceList = list
                } catch (error) {
                    this.allDeviceList = []
                    console.log(error)
                } finally {
                    this.deviceListLoad = false
                }
            } else {}
        },
        // 添加设备
        async addDeviceToProject () {
            try {
                if (!this.selectedDeviceId || !this.allDeviceList.length || this.addDeviceLoad) return
                const device = this.allDeviceList.find(item => item.deviceId === this.selectedDeviceId) || {}
                this.addDeviceLoad = true
                await ADD_PROJECT_DEVICE({
                    deviceId: this.selectedDeviceId,
                    projectId: this.projectInfo.id,
                    status: _deviceStatus[device.deviceStatus],
                    x: 0,
                    y: 0,
                    z: 0,
                    α: 0,
                    β: 0,
                    γ: 0
                })
                this.selectedDeviceId = null
                this.$Message.success('操作成功')
                this.getDeviceList()
            } catch (error) {
                console.log(error)
                this.selectedDeviceId = null
            } finally {
                this.addDeviceLoad = false
            }
        },
        // 删除设备
        deleteDeviceFromProject (row) {
            if (this.deleteDeviceLoad) return
            // console.log('d', row)
            this.$Modal.confirm({
                title: '是否确定删除?',
                onOk: async () => {
                    try {
                        this.deleteDeviceLoad = true
                        await DELETE_PROJECT_DEVICE(row.id)
                        this.getDeviceList()
                        this.selectedDeviceId = null
                        this.$Message.success('操作成功')
                    } catch (error) {
                        console.log(error)
                    } finally {
                        this.deleteDeviceLoad = false
                    }
                }
            })
        },
        // 设备行选择
        onSelectedDeviceChange (currentRow, oldRow) {
            // console.log('r', currentRow, oldRow)
            this.currentDevice = { ...currentRow }
        },
        // 复位
        async sensorReset () {
            this.$Modal.confirm({
                title: '是否确定复位操作？',
                onOk: async () => {
                    try {
                        this.resetLoad = true
                        await RESET_DATA(this.projectInfo.id)
                        const ret = await GET_PROJECT(this.projectInfo.id)
                        this.projectInfo = ret || {}
                    } catch (error) {
                        console.log(error)
                    } finally {
                        this.resetLoad = false
                    }
                }
            })
        },

        // 获取标定数据
        async getCalibrations ({ type }) {
            try {
                this.calibrationsLoad = true
                const key = type === 1 ? 'calibrations' : 'calibrations' + type
                this[key] = await GET_CALIBRATION({
                    projectId: this.projectInfo.id,
                    type: type
                })
            } catch (error) {
                console.log(error)
            } finally {
                this.calibrationsLoad = false
            }
        },
        // 标定
        onCalibration2 (type) {
            if (this.inClipping || this.inDatum) return
            const key = type === 1 ? 'calibrations' : `calibrations${type}`
            this.backupCalibrations = deepCopy(this[key])
            // console.log('bbb', this[key], this.backupCalibrations)
            this[key] = []
            if (type === 1) {
                this.pViewer.scene.removeAllClipVolumes()
                this.clippingItem = null
                this.inClipping = true
                this.clippingItem = this.pViewer.clippingTool.startInsertion({
                    type: 'polygon',
                    leftClickFn: (markers, p) => {
                        // console.log('click', markers, p)
                        const mp = markers[markers.length - 2].position
                        if (p) {
                            this[key].push({
                                projectId: this.projectInfo.id,
                                ...p,
                                mx: mp.x,
                                my: mp.y,
                                mz: mp.z
                            })
                        } else {
                            this[key].push({
                                projectId: this.projectInfo.id,
                                ...mp,
                                mx: mp.x,
                                my: mp.y,
                                mz: mp.z
                            })
                        }
                    }
                })
            } else if (type === 3) { // 基准面标定
                this.inDatum = true
                this.clearDatumView()
            }
        },
        // 完成标定
        onCalibrationConfirm2 (type) {
            if (type === 1) {
                if (this.clippingItem && this.clippingItem.on) {
                    this.clippingItem.viewer.dispatchEvent({
                        type: 'cancel_insertions'
                    })
                    this.clippingItem = null
                }
                this.inClipping = false
            } else if (type === 3) {
                this.inDatum = false
            }
            // console.log('完成标定', this.calibrations3, this[key])
        },
        // 取消标定
        onCalibrationCancel2 (type) {
            const key = type === 1 ? 'calibrations' : `calibrations${type}`
            this.clearClipVolumes()
            this[key] = deepCopy(this.backupCalibrations)
            // console.log('取消标定', key, this[key], deepCopy(this.backupCalibrations))
            if (type === 1) {
                if (this[key].length > 0) {
                    let polyClipVol = new Potree.PolygonClipVolume(this.pViewer.scene.getActiveCamera().clone())
                    this.pViewer.scene.addPolygonClipVolume(polyClipVol)
                    // polyClipVol.addMarker()
                    this[key].forEach(p => {
                        let projectedPos = new THREE.Vector3(p.mx, p.my, p.mz)
                        let marker = new THREE.Mesh()
                        marker.position.copy(projectedPos)
                        polyClipVol.markers.push(marker)
                    })
                    polyClipVol.initialized = true
                    // console.log('polyClipVol', polyClipVol, polyClipVol.markers)
                }
                this.backupCalibrations = []
                this.inClipping = false
            } else if (type === 3) {
                this.backupCalibrations = []
                this.inDatum = false
                this.clearDatumView()
                this.showDatumView()
            }
        },
        // 清除范围标定类型和显示
        clearClipVolumes () {
            if (this.clippingItem && this.clippingItem.on) {
                this.clippingItem.viewer.dispatchEvent({
                    type: 'cancel_insertions'
                })
            }
            this.pViewer && this.pViewer.scene.removeAllClipVolumes()
            this.pViewer && this.datumMesh && this.pViewer.scene.scene.remove(this.datumMesh)
            this.clippingItem = null
            this.inClipping = false
            this.datumMesh = null
            this.inDatum = false
            this.pViewer && this.clearDatumView()
        },
        // 清除基准面标定显示
        clearDatumView () {
            this.datumMesh && this.pViewer && this.pViewer.scene.scene.remove(this.datumMesh)
            this.datumMesh = null
            this.datumCones && this.datumCones.forEach(cone => this.pViewer.scene.scene.remove(cone))
            this.datumCones = []
        },
        // 范围标定保存
        async calibrationsSave (type) {
            const key = type === 1 ? 'calibrations' : `calibrations${type}`
            try {
                this.loadText = '范围标定中'
                this.projectLoad = true
                await this.deleteCalibrations(type)
                this[key] = this[key].map((item, sort) => ({ ...item, type, sort }))
                // console.log('d', this[key].filter(item => !item.id))
                if (!this[key] || this[key].length < 1) return
                const ret = await ADD_CALIBRATION(this[key])
                this[key] = [...ret]
                if (type === 1) {
                    const newProjectInfo = await this.pollingProjectInfo(this.projectInfo, 'multipleMergeFilePath')
                    this.clearClipVolumes()
                    this.projectInfo = { ...newProjectInfo }
                    await this.showPointsMode(this.projectInfo.multipleMergeFilePath)
                }
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
            }
        },
        // 删除标定数据
        async deleteCalibrations (type) {
            try {
                this.deleteCalibrationsLoad = true
                await DELETE_CALIBRATION(this.backupCalibrations.map(item => item.id))
                this.backupCalibrations = []
            } catch (error) {
                console.log(error)
            } finally {
                this.deleteCalibrationsLoad = false
            }
        },
        // 基准面标定点击事件
        onDatumMouseClick (event) {
            if (!this.inDatum) return
            let mouse = new THREE.Vector2()
            mouse.x = event.clientX - (this.isCollapsed ? 0 : 200)
            mouse.y = event.clientY - 83
            let r = getMouseModeIntersection(mouse, this.pViewer.renderer, this.pViewer.scene.getActiveCamera(), this.meshMode)
            // console.log('r', r)
            if (r) {
                this.drawDatumCone(r.point, true)
                this.drawDatumMesh()
            }
            // let I = getMousePointCloudIntersection(
            //     mouse,
            //     this.pViewer.scene.getActiveCamera(),
            //     this.pViewer,
            //     // this.pViewer.scene.pointclouds,
            //     this.pointcloud,
            //     { pickClipped: true }
            // )
            // if (I) {
            //     this.drawDatumCone(I.location, true)
            //     this.drawDatumMesh()
            // }
        },
        // 画基准点
        drawDatumCone (point, isNewPoint = false) {
            let coneGeo = new THREE.SphereGeometry(0.1, 10, 10)
            let cone = new THREE.Mesh(coneGeo, new THREE.MeshNormalMaterial({
                // color: 0x00ffff,
                depthTest: false,
                depthWrite: false
            }))
            // cone.material.depthTest = false
            cone.renderOrder = 99
            cone.position.x = point.x
            cone.position.y = point.y
            cone.position.z = point.z
            isNewPoint && this.calibrations3.push({
                ...point,
                projectId: this.projectInfo.id,
                type: 3,
                mx: point.x,
                my: point.y,
                mz: point.z
            })
            this.datumCones.push(cone)
            // console.log('I', point)
            this.pViewer.scene.scene.add(cone)
        },
        // 画基准面
        drawDatumMesh2 () {
            if (this.calibrations3.length > 3) {
                this.datumMesh && this.pViewer.scene.scene.remove(this.datumMesh)
                const convexGeo = new ConvexGeometry(this.calibrations3.map(p => new THREE.Vector3(p.x, p.y, p.z)))
                this.datumMesh = new THREE.Mesh(convexGeo, new THREE.MeshBasicMaterial({
                    color: 0xffff00, // 三角面颜色
                    side: THREE.DoubleSide // 两面可见
                    // opacity: 0.6,
                    // transparent: true
                }))
                // this.datumMesh.scale.set(2, 1, 1)
                // console.log('drawDatumMesh', this.calibrations3)
                this.pViewer.scene.scene.add(this.datumMesh)
            }
        },
        // 显示基准面标定
        showDatumView () {
            if (this.pViewer && this.calibrations3 && this.calibrations3.length) {
                this.calibrations3.forEach(p => this.drawDatumCone(p))
                this.drawDatumMesh()
            }
        },

        // 切换显示区域
        onBoundaryTaskChange (val) {
            // console.log('val', val)
            this.pViewer && this.pViewer.setClipTask(val)
        },

        // 去噪
        async onDenoising () {
            try {
                this.loadText = '去噪中'
                this.projectLoad = true
                const ret = await PROJECT_DENOISE(this.projectInfo.id, this.denoiseTimes)
                // console.log('ret', ret)
                if (this.denoiseTimes > 0) {
                    const newProjectInfo = await this.pollingProjectInfo(this.projectInfo, 'denoiseFilePath')
                    this.projectInfo = { ...newProjectInfo }
                    this.clearPotreeViewer()
                    this.showCurrentMode()
                }
                this.$Message.success(ret.msg)
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
                this.loadText = ''
            }
        },

        // 切换mode类型
        onModeTypeChange (type) {
            // console.log('ty', type, this.modeType)
            if (type === 'pointcloud') {
                this.pViewer.scene.scene.remove(this.pointcloud)
                this.pViewer.scene.scene.remove(this.lineMode)
                this.pViewer.scene.scene.remove(this.meshMode)
                this.pointcloud = null
                this.lineMode = null
                this.meshMode = null
                this.showPointsMode(this.projectInfo.meshFilePath, this.projectInfo.meshFileName)
            } else if (type === 'line') {
                this.pViewer.scene.removeAllPointCloud()
                this.pViewer.scene.scene.remove(this.pointcloud)
                this.pViewer.scene.scene.remove(this.meshMode)
                this.showLineMode(this.projectInfo.meshFileName)
            } else if (type === 'mesh') {
                this.pViewer.scene.removeAllPointCloud()
                this.pViewer.scene.scene.remove(this.pointcloud)
                this.pViewer.scene.scene.remove(this.lineMode)
                this.showMeshMode(this.projectInfo.meshFileName)
            }
        },
        // 载入line模型
        async showLineMode (name) {
            try {
                if (!name) return
                this.loadText = '模型加载中'
                this.projectLoad = true
                if (!this.pViewer) {
                    this.initPotreeViewer()
                }
                this.pointcloud && this.pViewer && this.pViewer.scene.scene.remove(this.pointcloud)
                // this.pViewer.scene.scene.add(this.gridHelper)
                this.generateGrid(1000, 100)
                this.pViewer.scene.scene.add(this.axesHelper)
                let loader = new PLYLoader()
                const url = name
                const data = await GET_STATIC(url, { responseType: 'arraybuffer' })
                const geo = loader.parse(data)
                // console.log('loader', geo, data)
                geo.computeVertexNormals()
                this.setModeColor(geo)
                var material = new THREE.LineBasicMaterial({
                    vertexColors: THREE.VertexColors,
                    // color: 0xff00ff,
                    size: 1,
                    depthTest: false,
                    transparent: true
                })
                this.lineMode = new THREE.Line(geo, material)
                this.lineMode.name = 'lineMode'
                // this.pViewer.scene.scene.add(new THREE.AmbientLight(0x444444))
                this.pViewer.scene.scene.add(this.lineMode)
                // this.pViewer.fitToScreen()
                // this.viewer.scene.addPointCloud(this.lineMode)
            } catch (error) {
                console.log('showLineMode获取静态资源失败！', error)
            } finally {
                this.projectLoad = false
                this.loadText = ''
            }
        },
        // 载入mesh模型
        async showMeshMode (name) {
            try {
                if (!name) return
                this.loadText = '模型加载中'
                this.projectLoad = true
                if (!this.pViewer) {
                    this.initPotreeViewer()
                }
                // console.log('showMeshMode')
                this.pointcloud && this.pViewer && this.pViewer.scene.scene.remove(this.pointcloud)
                // this.pViewer.scene.scene.add(this.gridHelper)
                this.generateGrid(1000, 100)
                this.pViewer.scene.scene.add(this.axesHelper)
                let loader = new PLYLoader()
                const url = name
                const data = await GET_STATIC(url, { responseType: 'arraybuffer' })
                const geo = loader.parse(data)
                geo.computeVertexNormals()
                this.setModeColor(geo)
                // console.log('mesh', geo, geo.getAttribute('color'), fr)
                var material = new THREE.MeshBasicMaterial({
                    vertexColors: THREE.VertexColors,
                    // color: 0xff00ff,
                    // size: 1,
                    side: THREE.DoubleSide,
                    depthTest: false
                })
                this.meshMode = new THREE.Mesh(geo, material)
                // this.meshMode.material.depthTest = false
                // this.meshMode.renderOrder = 99
                this.meshMode.name = 'meshMode'
                this.pViewer.scene.scene.add(this.meshMode)
            } catch (error) {
                console.log('获取静态资源失败！', error)
            } finally {
                this.projectLoad = false
                this.loadText = ''
            }
        },
        // 显示当前模型，如果有的话
        async showCurrentMode () {
            const { meshFilePath, meshFileName, originalFilePath, multipleMergeFilePath, denoiseFilePath } = this.projectInfo
            if (meshFilePath) {
                this.modeType = 'mesh'
                await this.showMeshMode(meshFileName)
            } else if (denoiseFilePath || multipleMergeFilePath || originalFilePath) {
                await this.showPointsMode(denoiseFilePath || multipleMergeFilePath || originalFilePath)
            }
        },

        // 生成模型
        async modelingGenerate () {
            try {
                this.loadText = '建模中'
                this.projectLoad = true
                await MODELING_GENERATE(this.projectInfo.id)
                // console.log('ret', ret)
                const newProjectInfo = await this.pollingProjectInfo(this.projectInfo, 'meshFilePath')
                this.projectInfo = { ...newProjectInfo }
                this.clearPotreeViewer()
                this.showCurrentMode()
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
                this.loadText = ''
            }
        },

        // 计算
        async onCalculate () {
            try {
                // if (this.currentStep.type === 4) {
                //     this.$Modal.confirm({})
                // }
                this.loadText = '计算中'
                this.projectLoad = true
                await GET_CALCULATE(this.projectInfo.id)
                const newProjectInfo = await this.pollingProjectInfo(this.projectInfo, 'updateTime')
                this.projectInfo = { ...newProjectInfo }
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
                this.loadText = ''
            }
        },

        // 上传周期保存
        async onCycleSave () {
            try {
                if (!this.startTime) {
                    this.$Message.error('请选择开始时间')
                    return
                }
                this.cycleSaveLoad = true
                const ret = await PROJECT_SET_PERIOD(this.projectInfo.id, {
                    period: this.period,
                    periodType: this.periodType,
                    startTime: moment(this.startTime).format('YYYY-MM-DD HH:mm:ss')
                })
                this.$Message.success(ret.msg)
            } catch (error) {
                console.log(error)
            } finally {
                this.cycleSaveLoad = false
            }
        },
        // 历史记录模式返回
        onHistoryBack () {
            this.clearPotreeViewer()
            this.onCloseHistory()
            this.historyTime = ['', '']
            this.historyList = []
            this.inHistory = false
            this.showCurrentMode()
        },
        // 打开历史记录弹窗
        onShowHistory () {
            if (this.historyVisible) return
            this.clearPotreeViewer()
            this.historyVisible = true
            this.inHistory = true
            this.historyTime = [new Date(), new Date()]
            // console.log('his', this.historyTime)
            this.getHistoryList()
        },
        // 关闭历史记录弹窗
        onCloseHistory () {
            this.historyVisible = false
            this.historyInfo = {}
        },
        // 获取历史记录列表数据
        async getHistoryList () {
            try {
                // console.log('getHistoryList', this.historyTime, moment(this.historyTime[0]).format('YYYY-MM-DD'))
                if (!this.historyTime[0] && !this.historyTime[1]) {
                    this.historyList = []
                    return
                }
                this.historyListLoad = true
                const ret = await GET_PROJECT_HISTORY({
                    projectId: this.projectInfo.id,
                    startTime: moment(this.historyTime[0]).format('YYYY-MM-DD'),
                    endTime: moment(this.historyTime[1]).format('YYYY-MM-DD')
                    // type: 5
                })
                this.historyList = ret || []
            } catch (error) {
                console.log(error)
            } finally {
                this.historyListLoad = false
            }
        },
        // 日期发生变化
        onHistoryDateChange (dateStr, date) {
            // console.log('d', dateStr)
            this.getHistoryList()
        },
        // 历史数据查看启动
        onHistoryRun (row) {
            this.historyStep = 1
            this.historyInfo = { ...row }
            this.onHistoryStepChange(1)
        },
        // 历史数据查看步骤改变
        async onHistoryStepChange (step) {
            this.clearDatumView()
            switch (step) {
                case 1:
                    this.clearPotreeViewer()
                    this.showPointsMode(this.historyInfo.originalFilePath)
                    break
                case 2:
                    this.clearPotreeViewer()
                    this.showPointsMode(this.historyInfo.multipleMergeFilePath)
                    break
                case 3:
                    this.clearPotreeViewer()
                    this.showPointsMode(this.historyInfo.denoiseFilePath)
                    break
                case 4:
                    // this.clearPotreeViewer()
                    // this.showPointsMode(this.historyInfo.meshFilePath)
                    break
                case 5:
                    await this.getCalibrations({ type: 3 })
                    await this.showPointsMode(this.historyInfo.meshFilePath)
                    this.showDatumView()
                    break
                case 6:
                    this.clearPotreeViewer()
                    this.showCurrentMode()
                    break
                default:
                    break
            }
            this.historyStep = step
        },
        // 历史数据建模数据点击
        onHistoryStepClick (name) {
            if (name === 'pointcloud') {
                this.clearPotreeViewer()
                this.showPointsMode(this.historyInfo.meshFilePath, this.historyInfo.meshFileName)
            } else if (name === 'line') {
                this.clearPotreeViewer()
                this.showLineMode(this.historyInfo.meshFileName)
            } else if (name === 'mesh') {
                this.clearPotreeViewer()
                this.showMeshMode(this.historyInfo.meshFileName)
            }
            this.historyStep = 4
        },
        // -------------------------------------------------------------------------------------------

        clearViewer () {
            this.aniFrame && cancelAnimationFrame(this.aniFrame)
            this.scene && this.scene.dispose()
            this.renderer && this.renderer.clear()

            this.renderer = null
            this.scene = null
            this.camera = null
            this.ctrls = null
            this.grids = []
            this.aniFrame = 0
        },
        // 初始化3d场景
        initViewer () {
            this.setRenerer()
            // console.log('initViewer', this.contentWidth, this.contentHeight)
            this.renderer.setClearColor('#D6D6D6')
            this.setCamera()
            this.setScene()
            this.setGrids(1000, 100)
            this.setHelper()
            this.setCtrls(this.camera, this.renderer)
            this.setLight()
            this.animate()
            this.renderer.domElement.addEventListener('click', this.onCalibrationMouseClick)
        },
        setRenerer () {
            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                premultipliedAlpha: false,
                antialias: true,
                canvas: this.$refs.canvas_3d
            })
            const width = this.contentWidth - (this.isCollapsed ? 0 : 200)
            const height = this.contentHeight - 35
            // console.log('setRenerer', width, height)
            this.renderer.setSize(width, height)
            this.renderer.setClearColor(0xffffff)
        },
        setCamera () {
            const { width, height } = this.renderer.domElement
            // console.log('ren', width, height)
            this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
            this.camera.up.set(0, 0, 1)
            this.camera.position.set(30, 20, 50)
            this.camera.lookAt(new THREE.Vector3(0, 0, 0))
        },
        setScene () {
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(0xd6d6d6)
        },
        setHelper () {
            const axesHelper = new THREE.AxesHelper(1160)
            axesHelper.material.depthTest = false
            axesHelper.renderOrder = 99
            this.scene.add(axesHelper)
        },
        setCtrls (camera, renderer) {
            let ctrls = new OrbitControls(camera, renderer.domElement)
            // 如果使用animate方法时，将此函数删除
            // controls.addEventListener( 'change', render );
            // 使动画循环使用时阻尼或自转 意思是否有惯性
            // controls.enableDamping = true;
            // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
            // controls.dampingFactor = 0.25;
            // 是否可以缩放
            ctrls.enableZoom = true
            // 是否自动旋转
            // controls.autoRotate = true;
            // controls.autoRotateSpeed = 0.5;
            // 设置相机距离原点的最远距离
            ctrls.minDistance = 0
            // 设置相机距离原点的最远距离
            ctrls.maxDistance = 1000
            // 是否开启右键拖拽
            ctrls.enablePan = true
            // controls.enabled = false
            this.ctrls = ctrls
        },
        setGrids (size, divisions) {
            const geo = new THREE.Geometry()
            geo.vertices.push(new THREE.Vector3(-size / 2, 0, 0))
            geo.vertices.push(new THREE.Vector3(size / 2, 0, 0))
            const lineColor = 0xa1a1a1
            // console.log('line', this.grids)
            for (let i = 0, len = divisions; i <= len; i++) {
                let line = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: lineColor,
                    depthTest: false
                })) // 利用geometry和material创建line
                line.position.y = i * (size / divisions) - size / 2 // 设置line的位置
                line.renderOrder = 99
                this.grids.push(line)
                this.scene.add(line) // 将line添加到场景中
                line = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: lineColor,
                    depthTest: false
                }))
                line.position.x = i * (size / divisions) - size / 2
                line.rotation.z = Math.PI / 2 // 绕y轴旋转90度
                line.renderOrder = 99
                this.grids.push(line)
                this.scene.add(line)
            }
        },
        setLight () {
            this.scene.add(new THREE.AmbientLight(0x444444))
        },
        animate () {
            this.renderer.render(this.scene, this.camera)
            this.ctrls.update()
            this.aniFrame = requestAnimationFrame(this.animate)
        },

        // 切换选择工程
        async selectProject (project) {
            // console.log('选择工程', project)
            if (this.projectLoad || project.id === this.projectInfo.id) return
            try {
                this.loadText = '工程载入中'
                this.projectLoad = true
                const ret = await GET_PROJECT(project.id)
                this.projectInfo = ret || {}
                this.toolbarVisible = true
                if (!this.renderer) this.initViewer()
                await this.initShow()
            } catch (error) {
                console.log(error)
            } finally {
                this.projectLoad = false
            }
        },
        async initShow () {
            const {
                originalFileName,
                multipleMergeFileName,
                denoiseFileName,
                meshFileName
            } = this.projectInfo
            const showFileUri = meshFileName || denoiseFileName || multipleMergeFileName || originalFileName
            if (showFileUri) {
                console.log('showFileUri', showFileUri)
                await this.showPlyMode(showFileUri, 1, (meshFileName || denoiseFileName || multipleMergeFileName))
            } else {
                console.log('当前工程无采集数据！')
            }
        },
        // 获取资源模型数据
        async getData (fileUrl) {
            try {
                this.loadText = '模型数据获取中'
                const arraybuffer = await GET_STATIC(fileUrl, { responseType: 'arraybuffer' })
                return arraybuffer
            } catch (error) {
                console.log('获取资源数据失败！', error)
                return null
            }
        },
        parseData (arraybuffer) {
            const loader = new PLYLoader()
            const geo = loader.parse(arraybuffer)
            return geo
        },
        addPointCloud (geo) {
            // console.log('addPointCloud', geo)
            // this.setModeColor(geo)
            const material = new THREE.PointsMaterial({
                vertexColors: THREE.VertexColors,
                size: 0.1,
                depthTest: false
            })
            this.mode = new THREE.Points(geo, material)
            this.mode.name = 'pointCloud'
            this.scene.add(this.mode)
        },
        // 显示点云模型
        async showPlyMode (fileUrl, type = 1, setColor = false) {
            try {
                this.projectLoad = true
                const arraybuffer = await this.getData(fileUrl)
                this.loadText = '模型加载中'
                if (!arraybuffer) throw Error
                const geo = this.parseData(arraybuffer)
                geo.computeVertexNormals()
                if (setColor) {
                    this.setModeColor(geo)
                }
                if (type === 1) {
                    this.addPointCloud(geo)
                } else if (type === 2) {
                    // this.addLineMode(geo)
                }
            } catch (error) {
                console.log('showPlyMode获取资源失败！', error)
            } finally {
                // this.loadText = ''
                this.projectLoad = false
            }
        },
        removeMode () {
            this.scene.remove(this.mode)
        },
        setModeColor (geo) {
            const position = geo.getAttribute('position')
            const fr = new Float32Array(position.count * position.itemSize)
            const max = Math.max.apply(null, position.array)
            position.array.forEach((item, i) => {
                if (((i + 1) % 3) === 0) {
                    let c = item / (max * 10 / 9)
                    c = Math.abs(c)
                    fr[i - 2] = c * 0.4
                    fr[i - 1] = c * 0.6
                    fr[i] = c * 0.8
                }
            })
            geo.setAttribute('color', new THREE.BufferAttribute(fr, 3))
        },

        // 标定
        onCalibration (type) {
            if (this.inClipping || this.inDatum) return
            const key = type === 1 ? 'calibrations' : `calibrations${type}`
            this.backupCalibrations = deepCopy(this[key])
            // console.log('bbb', this[key], this.backupCalibrations)
            this[key] = []
            if (type === 1) {
                this.inClipping = true
            } else if (type === 3) { // 基准面标定
                this.inDatum = true
                this.clearDatumView()
            }
        },
        // 完成标定
        onCalibrationConfirm (type) {
            if (type === 1) {
                if (this.clippingItem && this.clippingItem.on) {
                    this.clippingItem.viewer.dispatchEvent({
                        type: 'cancel_insertions'
                    })
                    this.clippingItem = null
                }
                this.inClipping = false
            } else if (type === 3) {
                this.inDatum = false
            }
            // console.log('完成标定', this.calibrations3, this[key])
        },
        // 取消标定
        onCalibrationCancel (type) {
            const key = type === 1 ? 'calibrations' : `calibrations${type}`
            this.clearClipVolumes()
            this[key] = deepCopy(this.backupCalibrations)
            // console.log('取消标定', key, this[key], deepCopy(this.backupCalibrations))
            if (type === 1) {
                if (this[key].length > 0) {
                    let polyClipVol = new Potree.PolygonClipVolume(this.pViewer.scene.getActiveCamera().clone())
                    this.pViewer.scene.addPolygonClipVolume(polyClipVol)
                    // polyClipVol.addMarker()
                    this[key].forEach(p => {
                        let projectedPos = new THREE.Vector3(p.mx, p.my, p.mz)
                        let marker = new THREE.Mesh()
                        marker.position.copy(projectedPos)
                        polyClipVol.markers.push(marker)
                    })
                    polyClipVol.initialized = true
                    // console.log('polyClipVol', polyClipVol, polyClipVol.markers)
                }
                this.backupCalibrations = []
                this.inClipping = false
            } else if (type === 3) {
                this.backupCalibrations = []
                this.inDatum = false
                this.clearDatumView()
                this.showDatumView()
            }
        },

        // 标定点击事件
        onCalibrationMouseClick (event) {
            if (!this.inClipping) return
            let mouse = new THREE.Vector2()
            mouse.x = event.clientX - (this.isCollapsed ? 0 : 200)
            mouse.y = event.clientY - 83
            let r = getMouseModeIntersection(mouse, this.renderer, this.camera, this.mode)
            // console.log('r', r)
            if (r) {
                this.drawPoint(r.point, true)
                this.drawMesh()
            }
            // let I = getMousePointCloudIntersection(
            //     mouse,
            //     this.pViewer.scene.getActiveCamera(),
            //     this.pViewer,
            //     // this.pViewer.scene.pointclouds,
            //     this.pointcloud,
            //     { pickClipped: true }
            // )
            // if (I) {
            //     this.drawDatumCone(I.location, true)
            //     this.drawDatumMesh()
            // }
        },

        // 画点
        drawPoint (point, isNewPoint = false) {
            let pGeo = new THREE.SphereGeometry(0.2, 10, 10)
            let p = new THREE.Mesh(pGeo, new THREE.MeshNormalMaterial({
                color: 0x00ffff,
                depthTest: false,
                depthWrite: false
            }))
            // p.material.depthTest = false
            p.renderOrder = 99
            p.position.x = point.x
            p.position.y = point.y
            p.position.z = point.z
            isNewPoint && this.calibrations.push({
                ...point,
                projectId: this.projectInfo.id,
                type: 1,
                mx: point.x,
                my: point.y,
                mz: point.z
            })
            this.points.push(p)
            // console.log('I', point)
            this.scene.add(p)
        },
        // 画面
        drawMesh () {
            if (this.calibrations.length > 3) {
                // console.log('draw', this.calibrations3)
                this.datumMesh && this.scene.remove(this.datumMesh)
                const convexGeo = new ConvexGeometry(this.calibrations.map(p => new THREE.Vector3(p.x, p.y, p.z)))
                this.datumMesh = new THREE.Mesh(convexGeo, new THREE.MeshBasicMaterial({
                    color: 0xffff00, // 三角面颜色
                    side: THREE.DoubleSide // 两面可见
                    // opacity: 0.6,
                    // transparent: true
                }))
                this.scene.add(this.datumMesh)
            }
        },

        // 轮询工程信息
        async pollProjectInfo (curProjectInfo, diffKey) {
            try {
                let newProjectInfo = await GET_PROJECT(curProjectInfo.id)
                if (newProjectInfo[diffKey] && newProjectInfo[diffKey] !== curProjectInfo[diffKey]) {
                    return newProjectInfo
                } else {
                    await sleep(3000)
                    return await this.pollingProjectInfo(curProjectInfo, diffKey)
                }
            } catch (error) {
                console.log(error)
                return null
            }
        },

        // 获取传感器设备列表
        async getDeviceList () {
            try {
                if (!this.projectInfo.id) return
                this.devicesLoad = true
                let ret = await GET_PROJECT_DEVICE(this.projectInfo.id)
                this.deviceList = (ret || []).map((item, i) => ({
                    ...item,
                    _highlight: i === 0
                }))
                this.currentDevice = ret && ret.length ? { ...ret[0] } : {}
            } catch (error) {
                console.log(error)
            } finally {
                this.devicesLoad = false
            }
        },
        // 数据采集
        gatherData () {
            this.$Modal.confirm({
                title: '数据将重新采集，是否确定操作？',
                onOk: async () => {
                    try {
                        this.loadText = '数据采集中'
                        this.projectLoad = true
                        await GATHER_DATA(this.projectInfo.id)
                        const ret = await this.pollingProjectInfo(this.projectInfo, 'originalFilePath')
                        if (!ret) throw Error
                        this.projectInfo = { ...ret }
                        await this.showPlyMode(this.projectInfo.originalFileName)
                    } catch (error) {
                        // this.projectLoad = false
                        console.log(error)
                    } finally {
                        this.projectLoad = false
                    }
                }
            })
        },
        // 保存设备信息
        async sensorSave () {
            try {
                if (!this.currentDevice.id) {
                    this.$Message.warning('请先选择一个设备')
                    return
                }
                this.sensorSaveLoad = true
                // console.log('d', this.currentDevice)
                const { x, y, z, α, β, γ, status, id } = this.currentDevice
                await EDIT_PROJECT_DEVICE({
                    id,
                    deviceId: this.currentDevice.deviceId,
                    projectId: this.projectInfo.id,
                    status,
                    x,
                    y,
                    z,
                    α,
                    β,
                    γ
                })
                // this.$refs.deviceTable.clearCurrentRow()
                this.getDeviceList()
                this.$Message.success('操作成功')
            } catch (error) {
                console.log(error)
            } finally {
                this.sensorSaveLoad = false
            }
        }
    }
}
