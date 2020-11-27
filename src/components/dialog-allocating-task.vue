<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1100px"
      top="161px"
      :show="show"
      :close-on-click-modal="false"
      @close="$emit('update:show',false)"
      class="abow_dialog"
    >
      <div class="div-dialog-content">
        <div class="_div-form">
          <el-form :model="queryForm" ref="queryForm" :rules="rules">
            <div class="div-dialog-2col-form-item">
              <div class="div-dialog-2col-form-item__right">
                <el-form-item label-width="150px" label="任务类型：" prop="taskTypeId">
                  <SelectProjectTaskType
                    v-if="taskflag"
                    :value="queryForm.taskTypeId"
                    @handleSelectProjectTaskTypeCallback="handleSelectProjectTaskTypeCallback"
                  ></SelectProjectTaskType>
                  <el-input v-if="!taskflag" disabled v-model="queryForm.taskTypeName">
                  </el-input>
                </el-form-item>

              </div>
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label-width="150px" label="任务名称：" prop="name">
                  <el-input v-model="queryForm.name" placeholder="请输入..."></el-input>
                </el-form-item>
              </div>
            </div>
            <div class="div-dialog-2col-form-item" v-if="!taskflag">
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label-width="150px" label="任务责任人：" prop="responsibleUserId">
                  <InputSearchUser
                      @handleUserSearchComponentCallback="handleUserSearchComponentCallback"
                      :value="queryForm.responsibleUserName"
                  ></InputSearchUser>
                </el-form-item>
              </div>
              <div class="div-dialog-2col-form-item__right workHours">
                <el-form-item label-width="150px" label="工时：" prop="workHours">
                  <el-input v-model="queryForm.workHours" placeholder="请输入..."></el-input>(天)
                </el-form-item>
              </div>
            </div>
            <div class="div-dialog-2col-form-item" v-if="taskflag">
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label="前置任务：" label-width="150px" prop="preTaskId">
                  <el-select v-model="queryForm.preTaskId" @change="selectPreposition" clearable placeholder="请选择前置任务">
                    <el-option
                      v-for="item in preTaskList"
                      :data="item"
                      :key="item.id"
                      :value="item.id"
                      :label="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="div-dialog-2col-form-item__right">
                <el-form-item label-width="150px" label="任务责任人：" prop="responsibleUserId">
                  <InputSearchUser
                  @handleUserSearchComponentCallback="handleUserSearchComponentCallback"
                  :value="queryForm.responsibleUserName"
                ></InputSearchUser>
                </el-form-item>
              </div>
            </div>
            <div class="div-dialog-2col-form-item" v-if="taskflag">
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label-width="150px" label="项目职能：" prop="projectFunId">
                  <SelectProjectFunction
                    ref="SelectProjectFunction"
                    :value="queryForm.projectFunId"
                    @handleSelectFuncNameCallback="handleSelectFuncNameCallback"
                  ></SelectProjectFunction>
                </el-form-item>
              </div>
              <div class="div-dialog-2col-form-item__right workHours">
                <el-form-item label-width="150px" label="工时：" prop="workHours">
                  <el-input v-model="queryForm.workHours" placeholder="请输入..."></el-input>(天)
                </el-form-item>
              </div>
            </div>

            <div class="div-dialog-2col-form-item">
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label-width="150px" label="任务描述：" prop="detail">
                  <el-input
                    type="textarea"
                    resize="none"
                    :rows="7"
                    maxlength="200"
                    show-word-limit
                    v-model="queryForm.detail"
                    placeholder="请输入..."
                  ></el-input>
                </el-form-item>
              </div>
              <div class="div-dialog-2col-form-item__right">
                <el-form-item label="备注：" label-width="150px" prop="remark">
                  <el-input resize="none" :maxlength="200" show-word-limit type="textarea" v-model="queryForm.remark" rows="7" placeholder="请输入..."></el-input>
                </el-form-item>
              </div> 
            </div>

            <div class="div-dialog-2col-form-item">
              <div class="div-dialog-2col-form-item__left">
                <el-form-item label-width="150px" label="发起时间：" prop="Date">
                  <el-date-picker
                    v-model="queryForm.Date"
                    type="datetimerange"
                    range-separator="至"
                    :start-placeholder="startTime"
                    :end-placeholder="endTime"
                    :picker-options="pickerOptionsStart">
                  </el-date-picker>
                </el-form-item>
              </div>
              <div class="div-dialog-2col-form-item__right docFile">
                <el-form-item label-width="150px" label="附件：">
                  <DialogUploadFile
                    :fileList="docFileList"
                    :fileId="queryForm.fileId"
                    :uploadFileUrl="this.$apis.File.uploadFile"
                    @handleSuccessCallback="handleFileSuccessCallback"
                    @handleErrorCallback="handleFileClear"
                    @handleElementUiErrorCallback="handleFileClear"
                    @handleRemoveCallback="handleFileClear"
                    >
                  </DialogUploadFile>
                  <span>(仅支持png/jpg格式、大小不得超过10M)</span>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="div-dialog-footer">
        <el-button class="secondary-but2" @click="closeDialog">取 消</el-button>
        <el-button type="primary" size="medium" @click="addTask">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SelectProjectTaskType from "@/components/common/select-project-task-type";
import SelectProjectFunction from "@/components/common/select-project-function";
import DialogUploadFile from "@/components/common/dialog-upload-file";
import InputSearchUser from "@/components/common/input-search-user";

export default {
  components: {
    SelectProjectTaskType,
    DialogUploadFile,
    SelectProjectFunction,
    InputSearchUser
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    projectId: {
      default: 0,
      type: Number
    },
    taskItem: {
      default: undefined,
      type: Object
    },
    taskflag: {
      type: Boolean,
      default: true
    },
    taskTypeId:{
      default: 0,
      type: Number
    },
    planEndDate: {
      default: 0,
      type: Number
    },
    taskId: {
      default: 0,
      type: Number
    },
    dialogTitle:{}
  },
  watch: {
    show() {
      this.dialogVisible = this.show;
      this.queryForm = {
        name: undefined,
        taskTypeId: undefined,
        planStartDate: undefined,
        planEndDate: undefined,
        detail: undefined,
        remark: undefined,
        responsibleUserId: undefined,
        workHours: undefined,
        fileId: undefined,
        Date: [],
        projectFunId: undefined,
        preTaskId: undefined
      }
      if(this.dialogVisible) {
        this.proId = this.projectId
        //加载数据
        this._setProjectMemberList()
        this._setPreTaskInfo()
        this.$refs.queryForm ? this.$refs.queryForm.resetFields() : ''
        if(this.taskItem){
          this.editTask(this.taskItem)
        }
        if(!this.taskflag) {
          this.queryForm.taskTypeId = this.taskTypeId
          this.queryForm.taskTypeName = this.$enums.ProjectTaskType.getLabelByValue( this.queryForm.taskTypeId)
        }
      }
    },
  },
  data() {
    return {
      pickerOptionsStart: {
        disabledDate(time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
        }
      },
      pickerOptionsEnd: {
        disabledDate(time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
        }
      },
      myHeaders: {
        Authorization: 'Bearer ' + this.$store.getters.token
      },
      dialogVisible: this.show,
      teamMemberList: [],
      tableHeaderCellStyle: this.$constants.TABLE_HEADER_CELL_STYLE,
      queryForm: {
        name: undefined,
        taskTypeId: undefined,
        planStartDate: undefined,
        planEndDate: undefined,
        detail: undefined,
        remark: undefined,
        responsibleUserId: undefined,
        responsibleUserName: undefined,
        workHours: undefined,
        fileId: undefined,
        Date: [],
        projectFunId: undefined,
        preTaskId: undefined
      },
      rules: {
        name: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        taskTypeId: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        projectFunId: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        planStartDate: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        planEndDate: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        responsibleUserId: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        workHours:  [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        detail: [
          // { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
        Date: [
          { required: true, message: '必填', trigger: ['blur', 'change'] }
        ],
      },
      docFileList: [
        // {
        //   name: "food.jpg",
        //   url: "https://www.mygain3d.com/images/top_logo.png"
        // }
      ],
      params: null,
      //前置任务
      preTaskList: [],
      proId: undefined,
      // 项目职能
      projectFunId: undefined,
      // 日期
      startTime: '开始日期',
      endTime: '结束日期',
    };
  },
  //生命周期 - 创建完成（访问当前this实例）
  created() {
    
  },
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {},
  //自定义的方法
  methods: {
    // 新增任务
     addTask() {
      if(this.taskflag) {
        this.$refs.queryForm.validate((valid) => {
        if (valid) {
          let json = Object.assign({}, this.queryForm)
          delete json.projectFunId
          json.planStartDate = new Date(json.Date[0]).getTime()
          json.planEndDate = new Date(json.Date[1]).getTime()
          // this.preTaskList.forEach(ele => {
          //   ele.planStartDate = new Date(ele.planStartDate).getTime()
          //   ele.planEndDate = new Date(ele.planEndDate).getTime()
          // })
          // let arr = Object.assign([], this.preTaskList)
          // arr.push(json)
          //应该需要加上校验判断
          //判断当前任务开始时间是否与前置任务时间冲突
          /* let prepositionDate
          if(json.preTaskId) {
            this.preTaskList.forEach(ele => {
              if(ele.id === json.preTaskId){
                prepositionDate = new Date(ele.planEndDate).getTime()
               if(prepositionDate < json.planEndDate){
                  this.$message({
                    showClose: true,
                    message: "当前任务发起时间不能大于前置任务结束时间",
                    type: "error"
                  })
               }
              }
            })
          }
          if(prepositionDate < json.planEndDate) return */
          // 1.调用接口保存数据(设置参数)
          this.$service.systempost(
            this.$apis.Project.addProTaskInfo,
            {
              projectId: this.proId,
              taskList: [json],
              projectFunId: this.projectFunId
            }
          ).then(
            res => {
              if (res.data.status == 0) {
                // 2.往前置任务列表里面添加
                if(json.id) {
                  this.$message({
                    showClose: true,
                    message: "编辑成功",
                    type: "success"
                  });
                }else{
                  this.$message({
                    showClose: true,
                    message: "添加成功",
                    type: "success"
                  });
                }
                
                
                this._setPreTaskInfo()
                this.queryForm = {
                  name: undefined,
                  taskTypeId: undefined,
                  planStartDate: undefined,
                  planEndDate: undefined,
                  detail: undefined,
                  remark: undefined,
                  responsibleUserId: undefined,
                  responsibleUserName: undefined,
                  workHours: undefined,
                  fileId: undefined,
                  Date: [],
                  projectFunId: undefined,
                  preTaskId: undefined
                }
               /*  this.pickerOptionsStart = {
                  disabledDate(time) {
                      return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
                  }
                },
                this.pickerOptionsEnd = {
                  disabledDate(time) {
                      return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
                  }
                } */,
                this.docFileList = []
                this.$refs.queryForm.resetFields()
                this.$parent.refreshTasksData()
                this.$emit("update:show", false);
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
        } else {
          return false;
          }
        })
      }else{
        this.$refs.queryForm.validate((valid) => {
            if(valid) {
                  let json = Object.assign({}, this.queryForm)
                  json.planStartDate = new Date(json.Date[0]).getTime()
                  json.planEndDate = new Date(json.Date[1]).getTime()
                  if(this.planEndDate > json.planEndDate) {
                    this.$message({
                        showClose: true,
                        message: '子任务结束时间不得大于父任务结束时间',
                        type: "error"
                    })
                    return false;
                  }
                const projectTaskRequest = {
                    projectId: this.projectId,
                    taskId: this.taskId,
                    projectTask: json
                }
                this.$service.systempost(
                    this.$apis.Project.addChildTask,
                    projectTaskRequest
                ).then(
                  res => {
                    if (res.data.status == 0) {
                      this.$message({
                        showClose: true,
                        message: '添加成功',
                        type: "success"
                      });
                      // this.queryForm.fileId.push(response.data.fileId)
                      this.$parent.__loadTaskList()
                    } else {
                      this.$message({
                        showClose: true,
                        message: '添加失败',
                        type: "error"
                      });
                    }
                  }
                )
            this.closeDialog()
            }else{
              return false;
            }
        } )
      }
    },
     
    //获取团队信息
    _setProjectMemberList() {
      this.teamMemberList = [],
      this.$service.systemget(this.$apis.Common.getAllSysUser, {
        roleIds: ''
      }).then(
        res => {
          if (res.data.status == 0) {
            for (let i = 0; i < res.data.data.length; i++) {
              let memberInfo = res.data.data[i];
              memberInfo.userId = memberInfo.userId;
              memberInfo.userName = memberInfo.sysUserProName;
              this.teamMemberList.push(memberInfo);
            }
            
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
    },
    
    //查询前置任务
    _setPreTaskInfo() {
      this.$service.systemget(
        this.$apis.Project.searchPreProTaskInfoByProId,
        {"procId": this.proId}
      ).then(
        res => {
          if (res.data.status == 0) {
            this.preTaskList = res.data.data;
          }else {
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
    },

    closeDialog() {
      this.$refs.queryForm.resetFields();
      this.docFileList = []
      this.$emit("update:show", false);
    },
    // 选择前置任务回调
    selectPreposition() {
      this.queryForm.Date = []
      this.preTaskList.forEach(ele => {
        if(!this.queryForm.preTaskId){
          this.pickerOptionsStart = {
              disabledDate(time) {
                  return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
              }
            }
        }
        if(ele.id === this.queryForm.preTaskId){
          this.pickerOptionsStart= {
              disabledDate(time) {
                  return time.getTime() < ele.planEndDate + 86400000
              }
            }
        }
      })
    },
    // 编辑任务
    editTask(data) {
      console.log(data)
      this.queryForm = {
        name: undefined,
        taskTypeId: undefined,
        planStartDate: undefined,
        planEndDate: undefined,
        detail: undefined,
        remark: undefined,
        responsibleUserId: undefined,
        workHours: undefined,
        fileId: undefined,
        Date: [],
        projectFunId: undefined,
        preTaskId: undefined,
        responsibleUserName: undefined
      }
      this.docFileList = []
      this.queryForm.projectFunId = data.projectFunctions.funcId
      this.queryForm.taskTypeId = data.taskTypeId
      this.queryForm.funcName = data.projectFunctions.funcName
      this.queryForm.name = data.name
      if(data.preTaskId) this.queryForm.preTaskId = data.preTaskId
      this.queryForm.responsibleUserId = data.responsibleUserId
      this.queryForm.responsibleUserName = data.responsibleUserName
      this.queryForm.workHours = data.workHours
      this.queryForm.detail = data.detail
      this.queryForm.Date[0] = data.planStartDate[0] + '  '+ data.planStartDate[1]
      this.queryForm.Date[1] = data.planEndDate[0] +'  ' + data.planEndDate[1]
      this.queryForm.planStartDate = new Date(this.queryForm.Date[0]).getTime()
      this.queryForm.planEndDate = new Date(this.queryForm.Date[1]).getTime()
      this.queryForm.id = data.id
      this.queryForm.remark = data.remark
      
      // this.handleSelectFuncNameCallback({value:data.projectFunctions.funcId, label: data.projectFunctions.funcName})
      if(data.sysFile) {
        this.docFileList = [
            {
            name: data.sysFile.fileName,
            url: data.sysFile.fileUrl,
          }
        ]
        this.queryForm.fileId = data.sysFile.fileId
      }
      this.projectFunId = data.projectFunctions.funcId

      console.log(this.queryForm.projectFunId, this.queryForm)
    },
    // 选择日期
    changeStartDate() {
      /* let times = new Date(this.queryForm.planStartDate).getTime() + 86400000
      this.pickerOptionsEnd = {
        disabledDate(time) {
            return time.getTime() < times - 86400000
        }
      } */
    },
    // 项目职能回调
    handleSelectFuncNameCallback(data) {
      if (data === "") {
        this.queryForm.projectFunId = undefined
        this.queryForm.funcName = ''
        return;
      }
      this.queryForm.projectFunId = data.value
      this.projectFunId = data.value
      this.queryForm.funcName = data.label
    },
    // 任务类型回调
    handleSelectProjectTaskTypeCallback(data) {

      if (data.value === "") {
        this.queryForm.taskTypeId = undefined;
        this.queryForm.taskTypeName = "";
        return;
      }

      this.queryForm.taskTypeId = data.value;
      this.queryForm.taskTypeName = data.label;
    },
    // 以下为控制文件上传的方法
    handleFileSuccessCallback(response) {
      this.queryForm.fileId = response.data.fileId
      this.docFileList = [
        {
          name: response.data.fileName,
          url: response.data.fileUrl,
        }
      ]
      // this.$refs.queryForm.validateField('printableFileId') //处理验证
    },
    // 上传清除
    handleFileClear() {
      this.docFileList = []
    },
    //选择人回调
    handleUserSearchComponentCallback(data) {
      if (data == "") {
        this.queryForm.responsibleUserId = undefined;
        this.queryForm.responsibleUserName = undefined;
        return;
      }
      this.queryForm.responsibleUserId = data.id;
      this.queryForm.responsibleUserName = data.name;
    }
  }
};
</script>
<style scoped>
/* @import url(); 引入css类 */
._div-row-title {
  padding-left: 55px;
  padding-bottom: 15px;
}
._span-row-title {
  font-size: 18px;
  font-weight: 600;
  color: #2f68e9;
}
._div-row-divider {
  padding: 0px 49px;
}
._div-form {
}
._div-form-button {
  padding-right: 90px;
  text-align: right;
}
._div-table {
  margin-top: 24px;
  margin-left: 38px;
  margin-right: 38px;
  border: 1px solid #e5e5e5;
}
.el-textarea {
  width: 240px;
}
.abow_dialog {
  display: flex;
  justify-content: center;
  align-items: Center;
  overflow: hidden;
}
.abow_dialog >>> .el-form-item__content {
    margin-bottom: 12px;
}
.abow_dialog >>> .el-dialog {
  margin: 0 auto !important;
  height: 69%;
  overflow: hidden;
  border-radius: 4px;
}
.abow_dialog >>> .el-dialog__body {
  position: absolute;
  left: 0;
  top: 71px;
  bottom: 60px;
  right: 0;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.abow_dialog >>> .el-dialog__footer {
  background: #eeeeee;
  padding: 6px 10px 6px 0px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
/*滚动条样式*/
.abow_dialog >>> .el-dialog__body::-webkit-scrollbar {
  width: 12px;
  /*height: 4px;*/
}
.abow_dialog >>> .el-dialog__body::-webkit-scrollbar-thumb {
  border-radius: 6px;
  -webkit-box-shadow: inset 0 0 5px rgba(181, 181, 181, 1);
  background: rgba(181, 181, 181, 1);
}
.abow_dialog >>> .el-dialog__body::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(229, 229, 229, 1);
  border-radius: 6px;
  background: rgba(229, 229, 229, 1);
}
.step_icon {
  display: flex;
  justify-content: center;
}
.steps >>> .el-image__inner {
  width: 100px;
  height: 10px;
  margin-top: 6px;
}
</style>
<style lang="scss" scoped>
.abow_dialog {
  .el-dialog {
    .el-dialog__body {
      .div-dialog-content {
        ._div-form {
          .el-form {
           div:last-child {
             .div-dialog-2col-form-item__left {
               & /deep/.el-form-item__error {
                 top: 0;
                 left: 405px;
                 width: 50px;
                 color: #ff7477;
                 height: 38px;
                 line-height: 38px;
                 padding: 0;
              }
             }
           }
           & /deep/ .workHours {
             .el-input__inner {
               width: 100px;
             }
             .el-input {
               width: 110px;
             }
             .el-form-item__error {
                 top: 0;
                 left: 140px;
                 width: 50px;
                 color: #ff7477;
                 height: 38px;
                 line-height: 38px;
                 padding: 0;
              }
           }
           & /deep/ .docFile {
             span {
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #999999;
              line-height: 17px;
             }
             .el-upload--text{
               span {
                 color: #fff;
               }
             }
           }
          }
        }
      }
    }
  }
}
</style>