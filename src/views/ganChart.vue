<template>
  <div class="container">
     <!-- v-loading="loading" :element-loading-text="loadingText" element-loading-background="rgba(39, 51, 78, 0.9)" -->
    <div class="div-container-right"> 
      <div class="div-container-right-item-taskDetails">
        <div class="div-container-right-item-taskDetails-top">
           <span class="projectOverview">任务详情</span>
           <div class="item-properties">
             <span>排序</span>
             <div>
               <span>全部任务</span>
              <span v-if="isDisabled">操作</span>
             </div>
           </div>
        </div>
        <div class="div-container-right-item-taskDetails-bottom" @scroll.stop.prevent="handlemousewheel" :style="{height: isDisabled ? 'calc(100vh - 270px)' : 'calc(100vh - 226px)'}">
          <div v-for="(item, index) in taskList" :key="item.id + index" :ref="'div-container-right-item-taskDetails-bottom-item-' + index" class="div-container-right-item-taskDetails-bottom-item">
            <div class="all-tasks" :title="item.taskTypeName">
              <span :style="(index + 1) > 9 ? '' : {paddingLeft: '2%', marginRight: '8%'}">{{ index + 1 }}</span>
              <el-tag :class="item.className">{{ item.statusName }}</el-tag>
              <el-tooltip class="item" effect="dark" :content="item.taskTypeName" placement="top">
                <span class="task-name">{{ item.taskTypeName }}</span>
              </el-tooltip>
            </div>
            <div class="operation-tasks" v-if="isDisabled">
              <el-tooltip class="item" effect="dark" content="编辑任务" placement="top" v-show="isDisabled">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="editingTasks(item)"
                ><i class="iconfont iconbianji button-icon" :class=" {'disable-action-icon': item.status !== 11 && item.status !== 21}"></i></el-link>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="下发任务" placement="top" v-show="isDisabled">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="issuedByTask(item)"
                ><i class="iconfont iconfenpeijishufuzeren button-icon" :class=" {'disable-action-icon': item.status !== 11 && item.status !== 21}"></i></el-link>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="提醒" placement="top" v-show="isDisabled">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="showProjectSummary(item)"
                  class="warn"
                >
                  <i class="iconfont icontixing button-icon"></i>
              </el-link>
              </el-tooltip>
              <el-tooltip class="item deleted" effect="dark" content="删除任务" placement="top" v-show="isDisabled">
                <el-link
                  class="delete"
                  :underline="false"
                  @click="deleteTask(item)"
                ><i class="iconfont iconshanchu-s button-icon" :class=" {'disable-action-icon': item.status !== 11 && item.status !== 21}"></i>
                </el-link>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div  class="div-container-right-item-taskDetails-btn"  v-if="isDisabled">
          <el-button type="primary" @click="showAllocatingTask()">
            <i class="iconfont mg-xx-icon-anniu-shanchu button-icon"></i>
            新增任务
          </el-button>
        </div>
      </div>
      <div class="div-container-right-item-GanttChart" ref="div-container-right-item-GanttChart"  @scroll="handleScroll">
        <div class="div-container-right-GanttChart-box" :style="{width: 60 * totalDays + taskMonth.length + 'px'}"  @mousedown.stop.prevent="handlemousedown" @wheel="handleWheel">
          <div v-for="(i, index) in taskMonth" :key="index + i" class="div-container-right-GanttChart-item" :style="{width: 60 * taskDay[index] + 1 + 'px'}">
            <div class="div-container-right-item-GanttChart-top">
              <div class="div-container-right-item-GanttChart-month" :ref="'div-container-right-item-GanttChart-month-' + index" >
                <span :ref="'div-container-right-item-GanttChart-month-span' + index">{{taskYear[index]}}年{{ i }}月</span>
              </div>
              <div class="div-container-right-item-GanttChart-day">
                <div v-for="day in taskDay[index]" :key="day + '-only'" :class="{'currentDay': taskYear[index] == nowTimes.year && i == nowTimes.month && day == nowTimes.day}">{{ day > 9 ? day : '0' + day }}</div>
              </div>
            </div>
            <div class="div-container-right-item-GanttChart-bottom" style="overflow: hidden;height: calc(100%)">
              <div class="div-container-right-item-GanttChart-content" :style="{width: '60px'}" v-for="day in taskDay[index]" :key=" day + index + 'only'">
              </div>
            </div>
          </div>
          <div v-for="(item, index) in taskList" :key="item.id" :ref="'div-container-right-item-GanttChart-progress-' + index" class="div-container-right-item-GanttChart-progress" @mouseenter.stop.prevent="handlemouseenter(index, item.id)" @mouseleave="handlemouseleave" :style="{ backgroundColor: item.backgroundColor, width: item.taskSpanWidth + 'px', left: item.taskStartOffset + 'px', top: taskDetailsHeight * index + 110 + taskDetailsHeight/2 - offsettop +'px', zIndex: index + 1 }">
            <div v-if="item.overdueDay > 0" style="background-color:rgba(250, 83, 112, 0.1);" class="overdue-day" :style="{ width: item.overdueDay * 60 + 'px', paddingLeft: item.taskSpanWidth + 'px'}">
              <span>逾期{{item.overdueDay}}天</span>
            </div>
            <span class="curUserInfo">{{item.curUserInfo}}</span>
          </div>
          <div class="details-content" v-for="(item, index) in taskList" :key="item.id + item.id" :class="{'noneShow': item.id == active}" :data="taskDetailsleft +'-' + item.taskStartOffset" :style="{top: '0px', top: taskDetailsTop + taskDetailsHeight * index + 110 + taskDetailsHeight/2 - offsettop + 'px', left: taskDetailsleft + item.taskStartOffset + 'px',}">
              <div class="headPortrait">
                <img src="~@/assets/female.png" alt="">
                <div>{{item.curUserInfo}}</div>
              </div>
              <h4>{{item.name}}</h4>
              <div>
                <div>任务类型：</div><span>{{ item.taskTypeName }}</span>
              </div>
              <div>
                <div>前置任务：</div><span>{{ item.preTaskName ? item.preTaskName : '暂无' }}</span>
              </div>
              <div>
                <div>计划开始日期：</div><span>{{ item.planStartDate[0] }}</span>
              </div>
              <div>
                <div>计划结束日期：</div><span>{{ item.planEndDate[0] }}</span>
              </div>
              <div>
                <div>工时：</div><span>{{ item.workHours }}</span>
              </div>
              <div>
                <div>任务描述：</div><span :title="item.detail">{{ item.detail }}</span>
              </div>
              <div>
                <div>备注：</div><span :title="item.remark">{{ item.remark }}</span>
              </div>
          </div>
          <div class="div-container-right-GanttChart-item-current-day" v-if="taskYear.includes(nowTimes.year) && taskMonth.includes(nowTimes.month)" :style="{ left: nowDay * 60 - 30 + 'px'}"></div>
        </div>
      </div>
      <div class="div-GanttChart-click-month-left-btn" v-if="taskList.length > 0">
        <i class="iconfont iconshang button-icon" @click="clickMonth('Left')"></i>
      </div>
      <div class="div-GanttChart-click-month-right-btn" v-if="taskList.length > 0">
        <i class="iconfont iconshang button-icon" @click="clickMonth('Right')"></i>
      </div>
      <div class="div-GanttChart-click-day-left-btn" v-if="taskList.length > 0">
        <i class="iconfont iconshang button-icon" @click="clickDay('Left')"></i>
      </div>
      <div class="div-GanttChart-click-day-right-btn" v-if="taskList.length > 0">
        <i class="iconfont iconshang button-icon"  @click="clickDay('Right')"></i>
      </div>
    </div>
    <!-- 分配任务 -->
    <!-- <DialogAllocatingTask
      :projectId="projectId"
      :show.sync="dialogAllocatingTaskShowFlag"
      :taskItem="taskItem"
      :dialogTitle="dialogTitle"
    >
    </DialogAllocatingTask> -->
    
  </div>
</template>

<script>
// import DialogAllocatingTask from '@/components/dialog-allocating-task.vue';
export default {
  name: "assignTask",
  components: {
    // DialogAllocatingTask,
  },
  computed: {
   
  },
  watch: {

  },
  data() {
    return {
      dialogTitle: undefined,
      taskList: [],
      //年
      taskYear: [],
      // 任务月份
      taskMonth: [],
      // 任务月份月份对应的日期
      taskDay: [],
      // 总天数,
      totalDays: 0,
      // 任务开始的时间（2020-01-02:00:00:00)
      startTime: {
        year: undefined,
        month: undefined,
        day: undefined,
        timestamp: undefined
      },
      // 任务结束时间
      endTime: {
        year: undefined,
        month: undefined,
        day: undefined,
        timestamp: undefined
      },
      // 滑动甘特图上下偏移量
      offsettop: 0,
      // 是否初始滚动到内容区
      flag: true,
      // 加载
      loading: true,
      // 
      loadingText: "数据加载中...",
      //起始位置
      firstOffsetLeft: 0,
      //当前显示的详情
      active: undefined,
      // 高亮小圆点
      highlightDot: undefined,
      projectId: undefined,
      describe: undefined,
      // 项目概况
      description: undefined,
      //项目成员列表
      projectTeamList: [],
      //完成率
      percentageComplete: 0,
      // 主要负责人
      projectPrincipal:{},
      // 项目逾期
      projectoverdue: undefined,
      taskDetailsHeight: undefined,
      startTimeDay: undefined,
      // 详情偏移量
      taskDetailsTop: 20,
      taskDetailsleft: 0,
      //月份偏移量
      taskMonthPadLeft: 0,
      //滑动的当前月
      currentMonth: [],
      // 当前天数
      nowDay: undefined,
      //当前日期
      nowTimes: {
        year: undefined,
        month: undefined,
        day: undefined,
        timestamp: undefined
      },
      // 滚动月份标记
      mark: true,
      timer: null,
      //上一次滚动偏移量
      lastOffsetLeft: undefined,
      // 新增任务
      dialogAllocatingTaskShowFlag: false,
      // 单挑任务数据
      taskItem: undefined,
      // 下发任务
      issuedByTaskShowFlag: false,
      // 删除任务
      deleteTaskShowFlag: false,
      // 任务ID
      taskId: undefined,
      userId: undefined,
      isDisabled: false,
      isHighlightBorder: undefined
    }
  },
  created() {
    // 获取路由跳转带的projectId
    this.projectId = this.$route.query.projectId  * 1
    // 获取任务数据
    this._setProTaskInfoList()
  },
  mounted() {
    this.$nextTick(()=>{
    })
  },
  updated() {
    this.$nextTick(()=>{
      if(this.$refs["div-container-right-item-taskDetails-bottom-item-0"]) {
        if(!(this.$refs["div-container-right-item-taskDetails-bottom-item-0"]['0'])){
          return
        }else{
          this.taskDetailsHeight= this.$refs["div-container-right-item-taskDetails-bottom-item-0"]['0'].clientHeight
        }
      }
      if (this.flag) {
        this.autoHandleScroll()
      }
    });
  },
  methods: {
    // 加载数据
    _setProTaskInfoList() {
      this.taskList = [];
      this.loading = true
      this.loadingText = "数据加载中..."
      //年
      this.taskYear = []
      // 任务月份
      this.taskMonth = []
      // 任务月份月份对应的日期
      this.taskDay = []
      // 总天数,
      this.totalDays = 0
      this.$api.getLists().then(
        res => {
          if (res.status == 200) {
            res.data.data = res.data.data.data
            for(let i = 0; i < res.data.data.length; i++) {
              let taskInfo = res.data.data[i];
               taskInfo.taskTypeName = '滴滴滴滴滴滴多'/*this.globalGetLabelByValue(
                taskInfo.taskTypeId,
                this.$enums.ProjectTaskType.getArray()
              ); */
              taskInfo.planStartDate = [this.$moment(taskInfo.planStartDate).format("YYYY-MM-DD")];
              taskInfo.planEndDate = [this.$moment(taskInfo.planEndDate).format("YYYY-MM-DD")];
              if(taskInfo.preTaskInfo == null) {
                taskInfo.preTaskName = "";
              } else {
                taskInfo.preTaskName = taskInfo.preTaskInfo.name;
              }
              taskInfo.responsibleUserName = taskInfo.curUserInfo;
              taskInfo.statusName = taskInfo.status/* this.globalGetLabelByValue(
                taskInfo.status,
                this.$enums.ProjectTaskStatus.getArray()
              ); */
              this.taskList.push(taskInfo);
            }
            this.loading = false
            if(!this.taskList.length) return
            // 计算任务跨度 生成甘特图
            this.getGanttChartTime(this.taskList)
              // 计算进度条跨度 生成进度条 确定位置 逾期天数超过甘特图加上时间
            this.taskList.forEach(ele => {
              let {
              taskSpanWidth,
              taskStartOffset,
              overdueDay,
              statusName,
              backgroundColor,
              className,
              } = this.handleTasksTime(ele.planStartDate, ele.planEndDate, ele.status)
              ele.taskSpanWidth = taskSpanWidth
              ele.taskStartOffset = taskStartOffset
              ele.overdueDay =  overdueDay > 0 ? overdueDay : undefined
              ele.statusName = statusName
              ele.backgroundColor = backgroundColor
              ele.className = className
            })
            this.loading = false
          } else {
            this.$message({
                showClose: true,
                message: res.data.error_msg,
                type: "error"
              });
            this.loading = false
          }
        },
        err => {
          this.globalHandleConnectTimeoutErr(err);
        }
      )
    }, 
    // 计算甘特图开始时间
    getGanttChartTime(taskList) {
      // 甘特图开始时间
      let startTimesArr = [] // 所有任务开始时间
      let endTimesArr = [] // 所有任务结束时间
      taskList.forEach(ele => {  
        this.handleTime(ele.planStartDate, startTimesArr)
        this.handleTime(ele.planEndDate, endTimesArr)
      })
      // 取开始日期
      this.Arraysort(startTimesArr) // 排序开始日期
      startTimesArr.reverse()
      this.handleDate(startTimesArr[0], this.startTime) // 取开始的年月日存起来
      // 取结束日期
      this.Arraysort(endTimesArr) // 排序结束日期
      this.handleDate(endTimesArr[0], this.endTime) // 取结束的年月日存起来
      //生成月份
      this.generateMonth(this.startTime, this.endTime)
      // 生成天数
      this.generateDays(this.taskMonth, this.taskDay, this.startTime, this.endTime)
      // 总天数
      this.taskDay.forEach(item => {
        this.totalDays += item
      })
  },
    // 计算任务时间跨度
    handleTasksTime(startTime, endTime, tsakStatus) {

      // 计算任务起始月首日时间戳
      let missionStartDate = []
      this.handleTime(this.startTime.year + '-' + this.startTime.month + '-' + 1, missionStartDate)

       // 取开始时间
      let startTimes = new Date(startTime[0]).getTime()
      let startDate = {}
      this.handleDate(startTimes, startDate)
      // 取结束时间
      let endTimes = new Date(endTime[0]).getTime()
      let endDate = {}
      this.handleDate(endTimes, endDate)
      // 起始任务月份与当前任务开始月份间隔天数计算任务条跨度
      let taskStartOffset = parseInt((startDate.timestamp - missionStartDate[0])/1000/60/60/24) 
      // 计算任务跨度
      let taskSpanWidth = (endTimes - startTimes)/1000/60/60/24 + 1
      // 任务状态判别颜色
      let overdueDay, statusName, backgroundColor, className
      switch (tsakStatus) {
        case 11:
          statusName = '待下发'
          backgroundColor = '#AA64F0'
          className = 'el-tag-issued'
          break;
        case 30:
          statusName = '已分派'
          backgroundColor = '#FA5370'
          className = 'el-tag-overdue'
          break;
        case 21:
          statusName = '已拒绝'
          backgroundColor = '#6A748B'
          className = 'el-tag-refused'
          break;
          case 32:
          statusName = '进行中'
          backgroundColor = '#2F68E9'
          className = 'el-tag-underway'
          break;
        case 40:
          statusName = '已延期'
          backgroundColor = '#F0C850'
          className = 'el-tag-postponed'
          break;
        case 41:
          statusName = '已暂停'
          backgroundColor = '#333333'
          className = 'el-tag-suspend'
          break;
        case 50:
          statusName = '已完成'
          backgroundColor = '#3CD2A0'
          className = 'el-tag-done'
          break;
        default:
          break;
      }
      //进行中的任务计算逾期天数 精确到时分秒
      if(tsakStatus == 32) {
        overdueDay = new Date().getTime() - new Date(endTime).getTime()
        overdueDay = overdueDay/1000/60/60/24 - 1
        console.log(overdueDay)
        // 逾期
        if (overdueDay > 0) {
          statusName = '已逾期'
          overdueDay = Math.ceil(overdueDay)
          backgroundColor = '#FA5370'
          className = 'el-tag-overdue'
        // 逾期直接甘特图生成到当前月份
          let newTime = {}
          this.handleDate(new Date(), newTime)
          if(this.endTime.year < newTime.year && this.endTime.month < newTime.month ) {
            // 改变结束的时间
            this.handleDate(new Date(), this.endTime)
            //生成月份
            this.generateMonth(this.startTime, this.endTime)
            // 生成天数
            this.generateDays(this.taskMonth, this.taskDay, this.startTime, this.endTime)
            // 总天数
            this.totalDays = 0
            this.taskDay.forEach(item => {
              this.totalDays += item
            })
          }
        }
        // 将逾期
        if (overdueDay < 0 && overdueDay > -1 ) {
          statusName = '将逾期'
          backgroundColor = '#F1875D'
          className = 'el-tag-beOverdue'
          overdueDay = 0
        }
      }
      this.showNowDay()
      
      return {
        taskSpanWidth: taskSpanWidth * 60,
        taskStartOffset: taskStartOffset * 60,
        overdueDay,
        statusName,
        backgroundColor,
        className,
      } 
    },
    // 鼠标拖拽
    handlemousedown(e) {
      clearTimeout(this.timer);
      this.mark =  false
      //获取目标元素
      let odiv = document.querySelector('.div-container-right-item-GanttChart')
      //鼠标相对元素的位置
      let clientX = e.clientX
      let that = this
      //起始位置
      that.firstOffsetLeft = odiv.scrollLeft
      document.onmousemove = (e)=>{   
        //移动的距离
        let left = clientX - e.clientX 
        odiv.scrollLeft = that.firstOffsetLeft + left;
        // 移动月份 this.taskMonth
        this.scrollFixedMonth(that.firstOffsetLeft)
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
        let _this = this
        this.timer = setTimeout(() => {
          this.mark = true
        }, 1000);
      };
      
    },
    // 滚动下发滚动条
    handleScroll(e) {
      if(this.mark){
        //获取目标元素
        let odiv = document.querySelector('.div-container-right-item-GanttChart')
        //起始位置
        let that = this
        document.onmousedown = (e)=>{
          that.lastOffsetLeft = odiv.scrollLeft
        };
        // 移动月份 this.taskMonth
          this.taskMonthPadLeft = 0
          this.currentMonth = []
          let monthArr = []
          this.taskMonth.forEach((ele, index) => {
            this.taskMonthPadLeft = this.taskDay[index] * 60 + this.taskMonthPadLeft
            if(this.taskMonthPadLeft >= (odiv.scrollLeft + 60)) {
              this.currentMonth.push(index)
              monthArr.push(ele)
            }
          })
          let monthIndex = this.taskMonth.indexOf(monthArr[0])
          monthArr = this.taskMonth.slice(0,this.taskMonth.indexOf(monthArr[0]))
          let monthArrDay = []
          let day = 0
          this.generateDays(monthArr, monthArrDay, this.startTime, this.endTime)
          monthArrDay.forEach(ele => {
            day += ele
          })
          let m = this.$refs['div-container-right-item-GanttChart-month-' + this.currentMonth[0]][0]
          let d = this.$refs['div-container-right-item-GanttChart-month-span' + this.currentMonth[0]][0]
          let paddingLeft = d.style.paddingLeft.substring(0, (d.style.paddingLeft.indexOf('p'))) * 1
          if(paddingLeft < (m.clientWidth - odiv.clientWidth) || odiv.scrollLeft < that.lastOffsetLeft) {
            d.style.paddingLeft = odiv.scrollLeft - (day * 60) + 'px'
          }
          that.lastOffsetLeft = odiv.scrollLeft
        document.onmouseup = (e) => {
          document.onmousemove = null;
          document.onmouseup = null;
          document.onmousemove = null;
        };
      }
    },
    // 自动滚动
    autoHandleScroll() {
      let odiv = document.querySelector('.div-container-right-item-GanttChart')
      odiv.scrollLeft = (this.startTime.day-2) * 60
      this.firstOffsetLeft = odiv.scrollLeft
      this.scrollFixedMonth(this.firstOffsetLeft)
    },
    // 固定月份 滚动
    scrollFixedMonth(lastOffsetLeft) {
        //获取目标元素
        let odiv = document.querySelector('.div-container-right-item-GanttChart')
        // 移动月份 this.taskMonth
          this.taskMonthPadLeft = 0
          this.currentMonth = []
          let monthArr = []
          this.taskMonth.forEach((ele, index) => {
            this.taskMonthPadLeft = this.taskDay[index] * 60 + this.taskMonthPadLeft
            if(this.taskMonthPadLeft >= (odiv.scrollLeft + 60)) {
              this.currentMonth.push(index)
              monthArr.push(ele)
            }
          })
          let monthIndex = this.taskMonth.indexOf(monthArr[0])
          monthArr = this.taskMonth.slice(0,this.taskMonth.indexOf(monthArr[0]))
          let monthArrDay = []
          let day = 0
          this.generateDays(monthArr, monthArrDay, this.startTime, this.endTime)
          monthArrDay.forEach(ele => {
            day += ele
          })
          let m = this.$refs['div-container-right-item-GanttChart-month-' + this.currentMonth[0]][0]
          let d = this.$refs['div-container-right-item-GanttChart-month-span' + this.currentMonth[0]][0]
          let paddingLeft = d.style.paddingLeft.substring(0, (d.style.paddingLeft.indexOf('p'))) * 1
          if(paddingLeft < (m.clientWidth - odiv.clientWidth) || odiv.scrollLeft < lastOffsetLeft) {
            d.style.paddingLeft = odiv.scrollLeft - (day * 60) + 'px'
          }
        document.onmouseup = (e) => {
          document.onmousemove = null;
          document.onmouseup = null;
          document.onmousemove = null;
        };
    },
    // 显示当天
    showNowDay() {
      //显示当天
      let nowTime = new Date().getTime()
      this.handleDate(nowTime, this.nowTimes) // 取开始的年月日存起来
      let nowManth = this.taskMonth.slice(0, this.taskMonth.indexOf(this.nowTimes.month))
      let nowDayArr = []
      this.generateDays(nowManth, nowDayArr, this.startTime, this.endTime)
      this.nowDay = this.nowTimes.day
      nowDayArr.forEach(ele => {
        this.nowDay += ele
      })
    },
    // 滚动左侧详情
    handlemousewheel(e) {
      //获取目标元素
      let odiv = document.querySelector('.div-container-right-item-taskDetails-bottom')
      this.offsettop = odiv.scrollTop
    },
    // 鼠标滚动
    handleWheel (e) {
      let odiv = document.querySelector('.div-container-right-item-taskDetails-bottom')
      if(e.wheelDeltaY > 0) { // 往上滑
        if(odiv.scrollTop == 0) return
        this.offsettop = this.offsettop - e.wheelDeltaY
        odiv.scrollTop -= e.wheelDeltaY
      }
      if(e.wheelDeltaY <  0) { // 往下滑
        if(odiv.scrollTop == (odiv.scrollHeight - odiv.clientHeight)) return
        this.offsettop = this.offsettop - e.wheelDeltaY
        odiv.scrollTop -= e.wheelDeltaY
      }
    },
    // 点击月份按钮
    clickMonth(filg) {
      //获取目标元素
      let odiv = document.querySelector('.div-container-right-item-GanttChart')
      this.firstOffsetLeft = odiv.scrollLeft
      this.scrollFixedMonth(this.firstOffsetLeft)
      if(filg == 'Left') {
        odiv.scrollLeft = this.firstOffsetLeft - (1801 + (this.firstOffsetLeft % 1800));
      }
      if(filg == 'Right') {
        if (this.firstOffsetLeft > odiv.scrollWidth - odiv.clientWidth - 1800) {
          return
        }
        odiv.scrollLeft = this.firstOffsetLeft + (1801 - (this.firstOffsetLeft % 1800));
      }
    },
    // 点击天数按钮
    clickDay(filg) {
      let odiv = document.querySelector('.div-container-right-item-GanttChart')
      this.firstOffsetLeft = odiv.scrollLeft
      this.scrollFixedMonth(this.firstOffsetLeft)

      if(filg == 'Left') {
        odiv.scrollLeft = this.firstOffsetLeft - 180;
      }
      if(filg == 'Right') {
        odiv.scrollLeft = this.firstOffsetLeft + 180;
      }
    },
    // 鼠标滑入详情显示
    handlemouseenter(index, id) {
      this.flag = false
      this.taskDetailsTop = 20
      this.taskDetailsleft = 0
      let odiv = this.$refs['div-container-right-item-GanttChart-progress-'+index][0]
      let o = document.querySelector('.div-container-right-item-GanttChart')
      let d = document.querySelector('.div-container-right-item-taskDetails-bottom')
      if((d.scrollHeight - d.scrollTop - d.clientHeight + (o.clientHeight - odiv.offsetTop)) < 444) {
        if(odiv.offsetTop > 120) {
          this.taskDetailsTop = -400
        }
      }
      if((60 * this.totalDays - odiv.offsetLeft) > 333) {
        // 滑动
        // if((odiv.offsetLeft-o.scrollLeft) > (o.clientWidth - 300)){
        //   o.scrollLeft = odiv.offsetLeft - o.clientWidth + 300
        // }
      }else {
        this.taskDetailsleft = -300 + odiv.clientWidth
      }
      this.active = id
    },
    // 鼠标划出
    handlemouseleave() {
      this.active = undefined
    },
    // 时间转时间戳
    handleTime(date, Times) {
      let time = isNaN(date) ? new Date(date).getTime() : date
      return Times.push(time)
    },
    // 时间戳转日期
    handleDate(date, Times) {
      let time = new Date(date)
      Times.year = time.getFullYear(); //获取年份
      Times.month = time.getMonth() + 1 //获取月份
      Times.day = time.getDate()// 获取天数
      Times.timestamp = new Date(Times.year+'-'+Times.month+'-'+Times.day).getTime() // 时间戳
    },
    // 获取时间范围
    Arraysort(arr) {
        //比较函数
      const compare = function (x, y) {
            if (x < y) {
                return 1;
            } else if (x > y) {
                return -1;
            } else {
                return 0;
            }
        }
      return arr.sort(compare)
    },
    // 生成甘特图月份
    generateMonth(startTime, endTime){
      // 通过开始时间宇结束时间生成月份
      let monthInterval = endTime.year - startTime.year   // 是否跨年
      // 为0不跨年
      if(monthInterval == 0) {
        this.taskMonth = this.ArrayMonth(startTime.month, endTime.month)
        this.taskMonth.forEach((item, index) => {
          this.taskYear[index] = this.startTime.year
        })
      } else {
        let firstMonth = this.ArrayMonth(startTime.month, 12)
        let firstYear = []
        firstMonth.forEach((item, index) => {
          firstYear[index] = this.startTime.year
        })
        let lastMonth = this.ArrayMonth(1, endTime.month)
        let lastYear = []
        lastMonth.forEach((item, index) => {
          lastYear[index] = this.startTime.year
        })
        this.taskYear = [...firstYear, ...lastYear]
        this.taskMonth = [...firstMonth, ...lastMonth]
      }
    },
    // 生成月份数组
    ArrayMonth(start, end) {
      return Array.from(new Array(end + 1).keys()).slice(start)
    },
    // 生成每个月的天数
    generateDays(taskDateNum, taskDay, startTime, endTime) {
      let flig = false
      taskDateNum.forEach((ele, index) => {
        switch (ele) {
          case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            taskDay[index] = 31;
            break;
          case 4: case 6: case 9: case 11:
            taskDay[index] = 30;
            break;
          case 2:
            if(startTime.year === endTime.year) {
              this.isRunYear(startTime.year)? taskDay[index] = 29: taskDay[index] = 28
            }else{
              if(flig ? flig : startTime.month > 2) {
                this.isRunYear(endTime.year) ? taskDay[index] = 29: taskDay[index] = 28
              } else {
                this.isRunYear(startTime.year)? taskDay[index] = 29: taskDay[index] = 28
                flig = true
              }
            }
            break;
        }
      })
    },
    // 判读平年闰年
    isRunYear(fullYear) {
      return (fullYear % 4 == 0 && (fullYear % 100 != 0 || fullYear % 400 == 0));
    },
    // 点击小圆点
    clickDotHighlight(index, item) {
     if(index == this.highlightDot) {
       this.highlightDot = undefined
       this._setProTaskInfoList()
       this.autoHandleScroll()
       return
     }
     this.highlightDot = index
     this.selectProTaskInfoByProjectIdAndUserId(item.projectId, item.userId)
     this.autoHandleScroll()
   },
   // 鼠标移除个人卡片
   handleMouseEnterAfter(index, item) {
     this.isHighlightBorder = index
   },
   handleMouseMouseleaveAfter(index, item)  {
     this.isHighlightBorder = undefined
   },
   // 显示所有任务
   showAllTasks() {
     this.highlightDot = undefined
     this.taskList = [];
      this._setProTaskInfoList()
      this.autoHandleScroll()
     return
   },
   // 新增任务
   showAllocatingTask() {
     if(this.describe.status == 3) return this.$message({
         showClose: true,
         message: "项目已完成无法新增任务",
         type: "error"
     });
     if(this.describe.status == -1) return this.$message({
         showClose: true,
         message: "项目还未分配无法新增任务",
         type: "error"
     });
      this.dialogAllocatingTaskShowFlag = true
      this.dialogTitle = '新增任务'
      this.taskItem = undefined
   },
   // 编辑任务
   editingTasks(item) {

     this.dialogAllocatingTaskShowFlag = true
      this.dialogTitle = '编辑任务'
     this.taskItem = item
   },
   // 下发任务
   issuedByTask(item) {
      if (!(item.status === 11 || item.status === 21)) {
        this.$message({
          showClose: true,
          message: `仅能下发待下发或已拒绝的任务`,
          type: "error"
        });
        return;
      }
     this.issuedByTaskShowFlag = true
     this.taskId = item.id
   },
   confirmissuedByTask() {
     this.$service.systemget(
          this.$apis.Project.realseProjectInfo,
          {taskId: this.taskId}
      ).then(
          res => {
              if(res.data.status == 0) {
                  this.$message({
                      showClose: true,
                      message: "提交成功",
                      type: "success"
                  });
              this._setProTaskInfoList()
              } else {
                  this.$message({
                      showClose: true,
                      message: res.data.error_msg,
                      type: "error"
                  });
              }
          },
          err => {
              this.globalHandleConnectTimeoutErr(err);
          }
      )
    this.issuedByTaskShowFlag = false
   },
   // 删除任务
   deleteTask(item) {
 
     this.deleteTaskShowFlag = true
     this.taskId = item.id
   },
   confirmDeleteTask() {
     this.$service.systemget(
        this.$apis.Project.removeProTaskInfoByTaskId,
        {"taskId": this.taskId}
      ).then(
        res => {
          if(res.data.status == 0) {
            this.$message({
                showClose: true,
                message: "移除成功",
                type: "success"
            });
            this.uploadFileList = []
            this.queryForm.taskTypeId = undefined
            this.queryForm.planStartDate = ''
            this.queryForm.name = undefined
            this.queryForm.planEndDate = ''
            this.queryForm.preTaskId = undefined
            this.queryForm.responsibleUserId = undefined
            this.queryForm.workHours = undefined
            this.queryForm.detail = undefined
            this.queryForm.remark = undefined
            this.queryForm.fileId = undefined
            this.queryForm.id = undefined
            this._setProTaskInfoList()
          } else {
            this.$message({
                showClose: true,
                message: res.data.error_msg,
                type: "error"
            });
          }
        },
        err => {
          this.globalHandleConnectTimeoutErr(err);
        }
      )
      this.deleteTaskShowFlag = false
   },
    // 任务弹窗刷新列表
   refreshTasksData() {
     this.dialogAllocatingTaskShowFlag = false
     this.$nextTick(() => {
      this.taskList = [];
      this._setProTaskInfoList()
      this.searchProjectDetailed()
      this.autoHandleScroll()
     })
   }
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  .div-container-left {
    display: flex;
    flex-direction: column;
    // flex-basis: 334px;
    flex: 0.21;
    box-sizing: border-box;
    .div-container-left-topBox {
      // flex: 268px;
      flex: 0.3;
      padding: 16px 20px;
      border-radius: 8px;
      background-color: #fff;
      .projectOverview {
        font-size: 18px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 560;
        color: #333333;
      }
      .projectDetails {
        cursor: pointer;
        height: 62px;
        margin: 18px 0; 
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #666666;
        text-indent:2em;
        line-height: 1.5;
        overflow:hidden;           /*设置超出部分隐藏*/
        text-overflow:ellipsis;    /*然后设置文本隐藏方式*/
        display:-webkit-box;
        -webkit-line-clamp:3;    /*只显示3行，如果不设置这个属性，会出现文本被拦腰截断的现象*/
        -webkit-box-orient: vertical;
      }
      .div-principal{
        display: flex;
        justify-content: space-between;
        padding-top: 12px;
        .div-principal-item {
          text-align: center;
            .headPortrait {
              position: relative;
              height: 36px;
              line-height: 36px;
              margin-bottom: 8px;
              z-index: 200;
              img {
                width: 36px;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 50%;
              }
          }
          h4 {
              margin-bottom: 5px;
              font-size: 16px;
              font-family: PingFangSC-Semibold, PingFang SC;
              font-weight: 600;
              color: #333333;
              line-height: 22px;
            }
          span {
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #999999;
              line-height: 20px;
            }
        }
      }
    }
    .div-container-left-bottomBox {
      flex: 0.7;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 16px 0;
      margin-top: 10px;
      border-radius: 8px;
      background-color: #fff;
      .div-container-left-bottomBox-top {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 0px 20px;
        .div-left-bottomBox-top-projectSchedule {
           display: flex;
           justify-content: space-between;
          .projectSchedule {
            font-size: 18px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 560;
            color: #333333;
          }
          & /deep/ .el-tag {
            width: 80px;
            height: 20px;
            line-height: 20px;
          }
        }
        .percentageComplete {
          margin: 10px 0;
          text-align: center;
          position: relative;
          padding: 0px 20px;
          &>>>.el-progress {
            .el-progress__text {
              font-size: 24px;
              font-family: DINCond-Bold, DINCond;
              font-weight: bold;
              color: #333333;
              line-height: 28px;
            }
          }
          span {
            position: absolute;
            left: 50%;
            top: 66%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 500;
            color: #999999;
            line-height: 17px;
          }
        }
      }
      .div-container-left-bottomBox-bottom {
        overflow-y:auto ;
        flex-basis: calc(100vh - 570px);
        &::-webkit-scrollbar {/*滚动条整体样式*/
          width: 8px;     /*高宽分别对应横竖滚动条的尺寸*/
          height: 1px;
        }
        &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
            border-radius: 8px;
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            background: #C1C1C1;
        }
        &::-webkit-scrollbar-track {/*滚动条里面轨道*/
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            border-radius: 8px;
            background: #EBEBEB;
        }
        .div-container-left-bottomBox-bottom-item {
          position: relative;
          box-sizing: border-box;
          padding: 10px 5% 0;
          padding-right: 3%;
          .div-container-left-bottomBox-bottom-item-box {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 2% 5% 0;
              width: 100%;
              height: 100px;
              box-sizing: border-box;
              background: #FFFFFF;
              border-radius: 8px;
              border: 1px solid #EEEEEE;
              cursor: pointer;
            .PersonalTaskBrief {
              display: flex;
              align-items: center;
              height: 100%;
              box-sizing: border-box;
              .headPortrait {
                position: relative;
                height: 40px;
                width: 40px;
                line-height: 40px;
                margin-bottom: 8px;
                margin-right: 13px;
                img {
                  width: 40px;
                  position: absolute;
                  left: 50%;
                  transform: translateX(-50%);
                  border-radius: 50%;
                }
              }
              
              .PersonalTaskBrief-div {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
                width: 100%;
                .sysUserProName {
                  font-size: 16px;
                  font-family: PingFangSC-Semibold, PingFang SC;
                  font-weight: 600;
                  color: #333333;
                  line-height: 22px;
                  margin-top: 5%;
                }
                .PersonalTaskBrief-div-item {
                  height: 100%;
                  display: flex;
                  justify-content: space-between;
                  .PersonalTaskBrief-item {
                    flex: 33.33%;
                    margin-left: 6%;
                  }
                  div:first-child {
                    margin-left: 0;
                  }
                  .task {
                      font-size: 14px;
                      font-family: PingFangSC-Regular, PingFang SC;
                      font-weight: 400;
                      color: #999999;
                      line-height: 20px;
                    }
                  span:last-child {
                      font-size: 24px;
                      font-family: DINCond-Bold, DINCond;
                      font-weight: 548;
                      color: #333333;
                      line-height: 28px;
                    }
                  }
                }
            }
            &:hover {
              box-shadow: 0px 22px 52px 0px #EEEEEE;
            }
          }
          .highlight {
            background: rgba(0, 176, 177, 0.2);
            box-shadow: 0px 22px 52px 0px #EEEEEE;
            border-radius: 8px;
            border: 1px solid #EEEEEE;
          }
          .select-dot {
            cursor: pointer;
            position: absolute;
            top: 20px;
            right: 20px;
            width: 16px;
            height: 16px;
            border-radius: 8px;
            background-color: #F5F7FA;
            border: 1px solid #DCDFE6;
          }
          .highlight-border { 
                border: 1px solid #00B0B1;
              }
          .select-dot-highlight {
            background-color: #00B0B1;
          }
        }
      }
    }
  }
  .div-container-right {
    flex: 1;
    display: flex;
    margin-left: 16px;
    box-sizing: border-box;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    border: 1px solid #DCDFE6;
    .div-container-right-item-taskDetails {
      flex-basis: 304px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background-color: #fff;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      .div-container-right-item-taskDetails-top {
        flex-basis: 120px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 50px 13px 20px;
        box-sizing: border-box;
        border-right: 1px solid #6A748B;
        background-color: #27334E;
        .projectOverview {
          font-size: 18px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 560;
          color: #FFFFFF;
          line-height: 25px;
        }
        .item-properties {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 20px;
          &>div>span:first-child {
            margin-right: 60px;
          }
        }
      }
      .div-container-right-item-taskDetails-bottom {
        
        border-right: 1px solid #DCDFE6;
        background-color: #fff;
        border-top-left-radius: 8px;
        overflow-y: auto;
        
        &::-webkit-scrollbar {/*滚动条整体样式*/
        width: 8px;     /*高宽分别对应横竖滚动条的尺寸*/
        height: 1px;
        }
        &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
            border-radius: 8px;
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            background: #C1C1C1;
        }
        &::-webkit-scrollbar-track {/*滚动条里面轨道*/
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            border-radius: 8px;
            background: #EBEBEB;
        }
        .div-container-right-item-taskDetails-bottom-item {
          display: flex;
          justify-content: space-between;
          padding: 5% 4%;
          background-color: #fff;
          border-bottom: 1px solid #F8F8F8;
          .delete {
            color: rgba(250, 83, 112, 0.7);
          }
          .all-tasks {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            flex: 1;
            &>span:first-child {
              margin-right: 5%;
            }
            & /deep/ .el-tag{
              width: 60px;
              height: 20px;
              line-height: 20px;
              display: inline-block;
            }
            .task-name {
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #333333;
              line-height: 20px;
            }
          }
          .operation-tasks {
            flex-basis: 118px;
            i {
              font-size: 18px;
              margin-left: 8px;
              padding: 0;
            }
            & /deep/.warn {
              cursor: not-allowed;
              .iconfont {
                color: #ccc;
              }
            }
            & /deep/ .deleted {
              .iconfont {
                color: #FA5370;
              }
            }
          }
        }
      }
      .div-container-right-item-taskDetails-btn {
        background-color: #fff;
        padding: 14px 19px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 20px;
        border-right: 1px solid #DCDFE6;
        border-bottom-left-radius: 8px;

        &>.el-button {
          width: 100%;
        }
        .mg-button-primary-max:hover {
            background: #2F68E9;
            color: #fff;
            border: 1px solid #2F68E9;
        }
      }
    }
    .div-container-right-item-GanttChart {
      // width: calc(100% - 50px);
      // background-color: #27334E;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      position: relative;
      cursor: pointer;
      &::-webkit-scrollbar {/*滚动条整体样式*/
      width: 10px;     /*高宽分别对应横竖滚动条的尺寸*/
      height: 10px;
      }
      &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        background: #C1C1C1;
      }
      &::-webkit-scrollbar-track {/*滚动条里面轨道*/
        -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        border-radius: 10px;
        background: #EBEBEB;
      }
      .div-container-right-GanttChart-box {
        height: 100%;
        position: relative;
        .div-container-right-GanttChart-item-current-day {
            height: 100%;
            width: 3px;
            background-color: #00B0B1;
            position: absolute;
            // z-index: 1;
            top: 120px;
          }
        .div-container-right-GanttChart-item{
          height: 100%;
          display: inline-block;
          .div-container-right-item-GanttChart-top {
            flex: 0.12;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            border-right: 1px solid #6A748B;
            position: absolute;
            z-index: 101;
            // width: 100%;
            height: 120px;
            background-color: #27334E;
            .div-container-right-item-GanttChart-month {
              flex:0.5;
              padding: 20px;
              padding-left: 435px;
              font-size: 14px;
              font-family: PingFangSC-Semibold, PingFang SC;
              font-weight: 600;
              color: #FFFFFF;
              line-height: 20px;
              background-color: #27334E;
            }
            .div-container-right-item-GanttChart-day {
              flex:0.5;
              padding: 12px 0px;
              background-color: #232E48;
              line-height: 20px;
              &>div {
                text-align: center;
                display: inline-block;
                box-sizing: border-box;
                width: 36px;
                height: 36px;
                line-height: 36px;
                margin: 0 12px;
                font-size: 14px;
                font-family: PingFangSC-Semibold, PingFang SC;
                font-weight: 600;
                color: #FFFFFF;
              }
              .currentDay {
                background-color: #00B0B1;
                border-radius: 4px;
                position: relative;
              }
              .currentDay:before {
                position: absolute;
                content: '';
                bottom: -12px;
                left: 18px;
                display: block;
                width: 3px;
                height: 15px;
                background-color:#00B0B1;
                z-index: 110;
              }
            }
          }
          .div-container-right-item-GanttChart-bottom {
            background-color: #fff;
            flex: 0.88;
            display: flex;
            box-sizing: border-box;
            height: 100%;
            .div-container-right-item-GanttChart-content {
              background-color: #fff;
              height: 100%;
              box-sizing: border-box;
              border-right: 1px solid #F8F8F8;
              border-left: 1px solid #F8F8F8;
            }
          }
        }
        // 进度条
        .div-container-right-item-GanttChart-progress {
          position: absolute;
          height: 20px;
          border-radius: 16.5px;
          z-index: 1;
          .overdue-day {
            /* display: flex;
            justify-content: space-between; */
            border-radius: 16.5px;
            height: 20px;
            text-align: left;
            span{
              line-height: 20px;
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #F0536E;
            }
          }
          .curUserInfo {
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #FFFFFF;
          }
        }
        .details-content {
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            position: absolute;
            z-index: 151;
            width: 300px;
            min-height: 400px;
            background: #FFFFFF;
            box-shadow: 0px 4px 12px 0px #EEEEEE;
            border-radius: 8px;
            padding: 20px;
            display: none;
            .headPortrait {
              position: relative;
              line-height: 36px;
              margin-bottom: 8px;
              margin-right: 13px;
              img {
                width: 36px;
                height: 36px;
                position: absolute;
                left: 20px;
                transform: translateX(-50%);
                border-radius: 50%;
              }
              div {
                position: absolute;
                left: 49px;
                font-size: 18px;
                font-family: PingFangSC-Semibold, PingFang SC;
                font-weight: 600;
                color: #333333;
                line-height: 25px;
              }
            }
            h4 {
              margin-top: 36px;
              margin-bottom: 10px;
            }
            &>div {
              margin-bottom: 12px;
              div {
                display: inline-block;            
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #999999;
                line-height: 20px;
              }
              span {
                text-align: right;
                word-wrap: break-word;
                word-break: normal;
              }
            }
          }
          .noneShow {
            display: block;
          }
      }
    }
    // 点击按钮
    [class*="div-GanttChart-click"] {
      position: absolute;      
      z-index: 101;    
      background: #27334E;
      width: 40px;
      height: 40px;
      i {
        display: inline-block;
        width: 24px;
        height: 24px;
        line-height: 24px;
        padding: 0 0 0 4px;
        color: rgba(47, 104, 233, 0.3);
        font-weight: 800;          
        background: rgba(47, 104, 233, 0.3);
        border-radius: 2px;
      }
    }
    [class*="div-GanttChart-click-day"] {
      background-color: #232E48;
    }
    [class*="left-btn"] {
      transform: translateY(-40%) rotateZ(-90deg);
    }
    [class*="right-btn"] {
      transform: translateY(0%) rotateZ(90deg);
    }
    .div-GanttChart-click-month-left-btn {
      top: 24px;
      left: 304px;
      padding: 15px 0 0 15px;
    }
    .div-GanttChart-click-month-right-btn {
      top: 0px;
      right: 0px;
      padding: 15px 0 0 21px;
    }
    .div-GanttChart-click-day-left-btn {
      top: 84px;
      left: 304px;
      padding: 15px 0 0 21px;
    }
    .div-GanttChart-click-day-right-btn {
      top: 60px;
      right: 0px;
      padding: 15px 0 0 15px;
    }
  }
}
</style>