//2020-05-20 by J

;(function ( $, window, document) {
	//默认配置参数
	defaults = {
		workflowUrl:top.config.Syshost + "/WorkflowAcceptController/updateWorkflowAccep.do",  //审核接口
		checkerListUrl:top.config.AuctionHost+"/WorkflowController/findNewWorkflowCheckerByType.do", //项目审核人列表数据接口
//		workflowAccpUrl:top.config.Syshost+"/WorkflowController/WorkflowAccp.do", //项目审核人列表数据接口
		recordUrl:top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerAndAccp.do",  //查询审核记录、审核等级和审核人
		status:1,  //1：发起人编辑   2：审评人  3：查看   	
        businessId:"",    //当前项目id
        WORKFLOWTYPE:'psfsh',
        isFold:true,
		isSeeRecord:true,   //是否可以查看审核记录
		checkState:0,  //审核状态  0是未审核   1是审核通过 -1 是不显示
		btnPass:$("#btnPass"),  //审核通过按钮
        btnNoPass:$("#btnNoPass"),  //审核不通过按钮
        tableName:'',//分页列表的id
		submitSuccess:function(){   //审核提交成功后，回调方法
			
		}
	};
	
	/*
	 * 定义审核方法
	 * target当前操作对象
	 * options值传递的参数对象
	 */
	function Plugin($ele, options){	
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});	
        this.options.workflowLevel; //全局变量保存 当前审核等级
        this.options.workflowLevelId;//全局变量保存流程表Id
        this.options.workflowItems=new Array();
        this.options.ischeck=false;//是否存在审批流程
        this.options.isworkflowAuditor;
        this.options.checkers=new Array();
		this.init();
	};
	
	Plugin.prototype = {
		//初始化方法
		init: function () {	
            this.findWorkflowCheckerAndAccp();
            if(this.options.status==1){
                this.GetCheckerList();
            }
            this.renderHtml();
            if(this.options.ischeck){
                this.bindRecord();
            }            
        },
        //渲染页面
        renderHtml:function(){
            var options = this.options;
            var _that=this;
            var html=new Array(); 
            if(options.ischeck){
                if(options.isFold){
                    html.push('<div class="panel panel-accordion panel-default" style="margin-top: 5px;">',
                    ' <div class="panel-heading active" role="tab" id="headingFive">',
                             '<h4 class="panel-title">',
                             '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseFive" aria-expanded="false" aria-controls="collapseFive">审核信息</a>',
                             '</h4>',
                         '</div> ' ,
                        ' <div id="collapseFive" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingFive">', 
                            ' <div class="panel-body">',
                            '<table class="table table-bordered " style="margin-bottom: 0px;">');
                }else{
                    html.push('<table class="table table-bordered " style="margin-bottom: 0px;">');
                    html.push('<tr><td colspan="4" class="active">审核信息</td></tr>')
                }

                if(options.status==1&&options.isworkflowAuditor==1){                   
                    html.push('<tr class="employee">',
                        '<td  class="th_bg" style="width: 180px">选择审核人<i class="red">*</i></td>',
                        '<td colspan="3" style="text-align: left;">',
                        '<select id="checkerId"  class="form-control" style="width: 200px;" name="checkerId"></select>',	 			
                        '</td>',
                        '</tr>',
                        '</table>');
                    
                }
                if(options.status==2){
                    if(options.isworkflowAuditor==1){
                        html.push('<tr class="employee">',
                        '<td  class="th_bg"style="width: 180px" >选择审核人<i class="red">*</i></td>',
                        '<td colspan="3" style="text-align: left;">',
                        '<select id="checkerId"  class="form-control" style="width: 200px;" name="checkerId"></select>',	 			
                        '</td>',
                        '</tr>');
                    }
                    html.push('<tr>',
                        '<td class="th_bg" style="width: 180px">审核说明</td>',
                        '<td><textarea rows="5"  class="form-control"  style="width: 90%;height: 80px;" name="content"></textarea></td>',
                    '</tr>',
                    '</table>') 
                }          
                if(options.isSeeRecord){
                    html.push('<table class="table table-bordered" id="workflowListDetail"></table>')
                }
                if(options.isFold){
                    html.push(
                        '</div>',
                        '</div>',
                        '</div>')
                }
                _that.$ele.html(html.join(""));
                if((options.status==1||options.status==2)&&options.isworkflowAuditor==1){
                    var option = "<option value=''>请选择审核人员</option>";
                    for(var i = 0; i < options.checkers.length; i++) {
                        option += '<option value="' + options.checkers[i].employeeId + '">' + options.checkers[i].userName + '</option>'
                    }
                    $("#checkerId").html(option); 
                }    
             }  
        },
		/*
		 * 审核提交
		 * workflowResult:0为通过，1为不通过
		 * checkerIds:选择审核人的id
		 */
		updateWorkFlow:function(workflowResult){
            var _this = this;
            if(workflowResult==1){
                //当不通过时 必须要填写审核说明
                if($("textarea[name='content']").val() == "") {
                    parent.layer.alert("请填写审核说明");
                    return;
                }
                //输入长度限制在1500字内
                if($("textarea[name='content']").val().length > 1000) {
                    parent.layer.alert("审核说明不能多于1000字！");
                    return;
                }
            }
            //是否需要审核人
            if(_this.options.isworkflowAuditor==1&&workflowResult==0) {
                //同意且未选择审核人时同意    不通过则无需选择审核人
                if($("#checkerId").val() == "") {
                    parent.layer.alert("请选择审核人");
                    return;
                }
            }
            //参数对象
            var dataParam = {
                workflowType: _this.options.WORKFLOWTYPE, //流程类型
                businessId: _this.options.businessId, //项目id
                workflowResult: workflowResult,
                workflowContent: $("textarea[name='content']").val(),
                workflowLevel: _this.options.workflowLevel, //审批流程等级
                id: _this.options.workflowLevelId //查询流程审批的id
            };

            if(_this.options.isworkflowAuditor==1) { //传递审核人员id   //根据之前是否选择审核人员判断时候传递审核人员id
                dataParam.employeeId = $("#checkerId").val(); //添加审核人id
            } else { //不传递审核人员id 提交系统审核
                dataParam.employeeId = "0";
            }
            
            //提交审核结果   
            $.ajax({
                type: "get",
                url: _this.options.workflowUrl,
                async: false,
                data: dataParam,
                success: function(data) {
                    if(data.success) {               
                        parent.$(_this.options.tableName).bootstrapTable('refresh');
                        parent.layer.alert("审核成功");
                        parent.layer.close(parent.layer.getFrameIndex(window.name));
                    } else {
                        parent.layer.alert(data.message);
                    }
                }
            });
        },
        //审核人的审核列表
		findWorkflowCheckerAndAccp:function(){
            var _this = this;
            $.ajax({
                url: _this.options.recordUrl,
                type: "post",
                data: {
                    "businessId": _this.options.businessId,
                    "accepType": _this.options.WORKFLOWTYPE
                },
                dataType: "json",
                async: false,
                success: function(result) {
                    if(result.success){
                        //审核记录为空
                        if(result.data.workflowItems) {
                            _this.options.ischeck=true; 
                            _this.options.workflowItems = result.data.workflowItems; //保存审核记录数组
                        }                                                             
                        if(_this.options.status==2){
                            if(result.data.message == "0") { //未设置流程审批 直接提交管理审核
                                _this.options.ischeck=true;
                                _this.options.isworkflowAuditor = 0; //无需选择审核人员 提交系统审核                     
                            } else if(result.data.message == "1") { //流程结束 隐藏选择审核人员
                                _this.options.ischeck=true;
                                _this.options.isworkflowAuditor = 0; //无需验证审核人员信息
                            }else if(result.data.message == "2") { //未设置审批人员
                                if(_this.options.status==2){
                                    _this.options.isworkflowAuditor = 1;
                                    parent.layer.alert("温馨提示：找不到审批人,请联系企业管理员添加审批人");
                                    $("#btnPass").hide();
                                    $("#btnNoPass").hide();
                                
                                }
                            }else { //挂载审核人员
                                _this.options.isworkflowAuditor = 1;
                                _this.options.ischeck = true; 
                                _this.options.checkers=result.data.checkers//审核人员信息
                            } 
                            if(result.data.accep){
                                _this.options.workflowLevelId = result.data.accep.id; //全局变量保存流程表Id       
                                _this.options.workflowLevel = result.data.accep.workflowLevel; //全局变量保存 当前审核等级
                            }else if(result.data.accep == undefined) { //查询的accep为空时   表示自己已审核                           
                                _this.options.ischeck=true;  
                                _this.options.isworkflowAuditor = 0; //无需验证审核人员信息
                                $("#btnPass").hide();
                                $("#btnNoPass").hide();
                            } 
                        }
                                          
                    }   
                }
            })
        },
		// 发布时的审核人列表
		GetCheckerList:function(){
			var _this = this;
			//获取审核人列表
            $.ajax({
                url:_this.options.checkerListUrl,
                type:'get',
                dataType:'json',
                async:false,
                data: {
                    "workflowLevel":0,
                    "workflowType":_this.options.WORKFLOWTYPE
                },
                success:function(result){	                  
                   //判断是否有审核人		   
                    if(result.message==0){
                        _this.options.isworkflowAuditor=0;                                   
                        return;
                    };
                    if(result.message==2){		   	   	
                        parent.layer.alert("温馨提示：找不到审批人,请联系企业管理员添加审批人"); 
                        _this.options.isworkflowAuditor=1;                                            
                        return;
                    };
                    if(result.success==true){
                        if(result.data.workflowCheckers.length==0){
                            option='<option>暂无审核人员</option>'
                        }
                        if(result.data.workflowCheckers.length>0){
                            _this.options.ischeck = true; 
                            _this.options.isworkflowAuditor=1;                          
                            _this.options.checkers=result.data.workflowCheckers                           
                        }		   	   			   	  			   	  
                    }                   	   	    
                }
            });
		},
		
		//加载审核记录
		bindRecord:function() {
            var that=this;
			$("#workflowListDetail").bootstrapTable({
                pagination: false,
                undefinedText: "",
                columns: [{
                        title: '序号',
                        align: "center",
                        width: "50px",
                        formatter: function(value, row, index) {
                            return index + 1;
                        }
                    }, {
                        field: 'userName',
                        title: '姓名',
                        align: "center",
                        halign: "center",
                        width: "15%",
                        formatter: function(value, row, index) {
                            if(row.employeeId == 0) {
                                return "平台审核";
                            } else {
                                return value;
                            }
                        }
                    },
                    {
                        field: 'workflowResult',
                        title: '审核状态',
                        align: "center",
                        halign: "center",
                        width: "15%",
                        formatter: function(value, row, index) {
                            if(value == 1) {
                                return "审核未通过";
                            } else if(value == 0) {
                                return "审核通过";
                            } else if(value == 2) {
                                if(row.workflowType == "xmgg"){
                                    return "公告撤回";
                                }else if(row.workflowType == "psbg"){
                                    return "评审报告撤回";
                                }else if(row.workflowType == "xmby"){
                                    return "补遗撤回";
                                }else if(row.workflowType == "jggs"){
                                    return "结果公示撤回";
                                }else if(row.workflowType == "jgtzs"){
                                    return "结果通知书撤回";
                                }else if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj"){
                                    return "已撤回";
                                }else if(row.workflowType == "zlgd"){
                                    return "已撤回";
                                }else if(row.workflowType == "mbgg"){
                                    return "模板撤回";
                                }else if(row.workflowType == "psfsh"){
                                    return "撤回";
                                }	
                            }else {
                                return "审核中"
                            }
                        }
                    },
                    {
                        field: 'workflowContent',
                        title: '审核说明',
                        align: "left",
                        halign: "center"
                    }, {
        
                        field: 'subDate',
                        title: '时间',
                        align: "center",
                        halign: "center",
                        width: "20%",
                    }
                ]
            });
         $('#workflowListDetail').bootstrapTable("load",  that.options.workflowItems);	
		},
		
	};
	
	
	$.fn.ApprovalProcess = function (options) {
        options = $.extend(defaults, options || {});
 
        return new Plugin($(this), options);
    }
	
}(jQuery, window, document));