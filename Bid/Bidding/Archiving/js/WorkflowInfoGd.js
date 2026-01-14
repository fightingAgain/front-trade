//2019-02-27 by H

;(function ( $, window, document) {
	var pluginName = "ApprovalProcess",
	//默认配置参数
	defaults = {
		//workflowUrl:top.config.tenderHost + '/updateWorkflowItem.do',  //审核接口
		checkerListUrl:"http://10.129.16.200/HghService/WorkflowAcceptController/findWorkflowCheckerByType.do", //项目审核人列表数据接口
		//checkerListUrl:top.config.tenderHost + "/GDDataController/findGDChecker.do", //项目审核人列表数据接口
//		workflowAccpUrl:top.config.Syshost+"/WorkflowController/WorkflowAccp.do", //项目审核人列表数据接口
		recordUrl:top.config.tenderHost + "/GDDataController/findGDCheckList.do",  //查询审核记录
		//stepUrl:top.config.Syshost + "/WorkflowController/getWorkflowShow.do",  //查询审核步骤
		status:1,  //1：发起人编辑   2：审评人  3：查看   
		level:1,      //可选择的等级
		type:"",       //当前项目名称
		businessId:"",    //当前项目id
		isSeeRecord:true,   //是否可以查看审核记录
		checkState:0,  //审核状态  0是未审核   1是审核通过 -1 是不显示
		btnPass:$("#btnPass"),  //审核通过按钮
		btnNoPass:$("#btnNoPass"),  //审核不通过按钮
		submitSuccess:function(){   //审核提交成功后，回调方法
			
		}
	};
	
	/*
	 * 定义审核方法
	 * target当前操作对象
	 * options值传递的参数对象
	 */
	function Plugin(target, options){
//		this.isPass=null;  //审核时，是否点击通过
		this.checkers=[];  //审核人列表
		this.levList=[];      //审核级别列表
		this.workflowLevelId="";  //查询流程审批的id
		this.workflowLevel="";  //查询评审人员  审核等级需升级 
		this.isworkflowAuditor = "";  //判断是选择提交审核人员  
		this.target = target;  //当前要追加的对象
			
		this.settings = $.extend( {}, defaults, options);
		this.init();
	};
	
	Plugin.prototype = {
		//初始化方法
		init: function () {
			var _this = this;
			var html = "";
			_this.target.css("margin-top", "5px");
			if(_this.settings.status == 1){
				html = _this.GetCheckerList();
				if(html != ""){
					_this.target.addClass("panel panel-accordion panel-default");
//					$(html).appendTo(_this.target);
//					var str = '<tr class="active"><th colspan="2">审核</th></tr>';
					var str = '<div class="panel-heading active"  role="tab" id="headingWorkflow">'  
							 		+'<h4 class="panel-title">'
						            	+'<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseWorkflow" aria-expanded="false" aria-controls="collapseWorkflow">审核</a>'
							 		+'</h4>'
							   	+'</div>';
					str += html;
					$(str).appendTo(_this.target);
				}
			} else if(_this.settings.status == 2){
				_this.settings.btnPass.show();
				_this.settings.btnNoPass.show();
				_this.checkerModel();
				html = _this.GetCheckerList();
				//是否可以查看记录
				if(_this.settings.isSeeRecord){
					//加载审核记录	
					_this.bindRecord();
				}
				
				//审核通过提交按钮方法
				/* _this.settings.btnPass.click(function(){
					var str = html + '<div style="text-align:center; margin-top:30px;"><button type="button" class="btn btn-primary" id="btnCheckPass"><span class="glyphicon glyphicon-saved"></span>提交</button></div>';
					if(_this.checkers && _this.checkers.workflowNodeChecker && _this.checkers.workflowNodeChecker.length > 0){
						if(_this.checkers.approvalType == 0 && _this.checkers.workflowNodeChecker.length > 1){
							top.layer.open({
							  	type: 1, 
							  	title:"选择审核人",
							  	area: ['520px', '200px'],
							  	content: str, //这里content是一个普通的String
							  	success:function(layero, index){
							  		//审核通过
									layero.find("#btnCheckPass").on("click", function(){
										if(layero.find("[name='checkerIds']").val() == ""){
											top.layer.alert("请选择审核人员");
											return;
										}
										_this.updateWorkFlow(0, layero.find("[name='checkerIds']").val());
									});
							  	}
							});
						} else {
							_this.updateWorkFlow(0, $("[name='checkerIds']").val());
						}
					} else {
						_this.updateWorkFlow(0, "");
					}
					
					
				});
				//审核不通过提交按钮方法
				_this.settings.btnNoPass.click(function(){
					_this.updateWorkFlow(1,"");
				}); */
				
			} else if(_this.settings.status == 3){
				//_this.workflowStep();
				//是否可以查看记录
				if(_this.settings.isSeeRecord){
					//加载审核记录	
					_this.bindRecord();
				}
			}
			
			
			
		},
		/*
		 * 审核提交
		 * workflowResult:0为通过，1为不通过
		 * checkerIds:选择审核人的id
		 */
		/* updateWorkFlow:function(workflowResult, checkerIds){
			var _this = this;
				content = $("[name='content']").val();
			if(workflowResult == 1 && content == ""){
				top.layer.alert("请输入审核说明", function(index){
					$("[name='content']").closest('.panel-collapse').collapse('show');
					$("[name='content']").closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
					$("[name='content']").focus();
					top.layer.close(index);
				});
				return;
			} 
			var data= {
		         	workflowType:_this.settings.type,
		         	businessId:_this.settings.businessId,
		         	workflowResult:workflowResult,
		         	workflowContent:content
		         }
			if(checkerIds){
				data.checkerIds = checkerIds;
			}
			$.ajax({
		         url: _this.settings.workflowUrl,
		         type: "post",
		         data: data,
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	_this.settings.submitSuccess();
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
		     });
		}, */
		
		// 获取每个等级下面的审核人员
		GetCheckerList:function(){
			var _this = this;
			var str = '';
//			$(html).appendTo(_this.target);
			$.ajax({
			   	url:_this.settings.checkerListUrl,
			   	type:'get',
			   	dataType:'json',
			   	async:false,
			   	data:{
			   		"enterpriseId":'82843a905ce7474c8fffea2714947b36',
			   		"workflowType":_this.settings.type,
					"workflowLevel" : 0
			   	},
			   	success:function(data){	
			   		if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
			   		
//			   		if(data.message == 0){
//			   			return;
//			   		}
//			   		if(data.messge == 2){
//			   			parent.layer.alert("找不到该节点的审批人,请先添加审批人");
//			   			return;
//			   		}
			   		if(data.success == true){
			   			
			   			var workflowNodeChecker = (data.data )?data.data:null;
			   			_this.checkers = data.data ? data.data : null;
//			   			if(workflowNodeChecker.length <= 0){
//			   				str += '<td><select id="employeeId" class="form-control col-sm-6" style="width: 180px;" name="checkerId"><option>暂无审核人员</option></select></td>'
//						} else 
						if(workflowNodeChecker && workflowNodeChecker.length > 0){
							/* if(_this.settings.status == 2){
								str += '<div id="collapseWorkflow" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingWorkflow"><div class="panel-body">';
							} else {
								str += '<div id="collapseWorkflow" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingWorkflow"><div class="panel-body">'
							} */
							str += '<div id="collapseWorkflow" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingWorkflow"><div class="panel-body">'
							str += '<table class="table table-bordered" id="checkerTab" style="margin-bottom:0;">';
							str += '<tr id="addChecker"><td class="th_bg">选择审核人</td>';
							if( /* data.data.approvalType == 0 && */ workflowNodeChecker.length > 0){
					   	   		str += '<td><select id="checkerIds" class="form-control col-sm-6" style="width: 180px;" name="checkerIds" datatype="*" errormsg="请选择审核人"><option value="">请选择审核人员</option>';
						   	   	for(var i=0;i<workflowNodeChecker.length;i++){
							   	   	 str += '<option value="'+workflowNodeChecker[i].employeeId+'">'+workflowNodeChecker[i].userName+'</option>'
							   	}
						   	   	str += '</select></td>';
						   } /* else {
//						   	   		
								 if(_this.settings.status == 1){
									str += '<td>'+data.data.userName+'<input type="hidden" value="'+data.data.employeeId+'" name="checkerIds"></td>';
								} else {
									$('<input type="hidden" value="'+data.data.employeeId+'" name="checkerIds">').appendTo("body");
								} 
								str += '<td>'+data.data.userName+'<input type="hidden" value="'+data.data.employeeId+'" name="checkerIds"></td>';
						   } */
						   str += '</tr></table></div></div>';
				   	   	}
						
			   		} else {
			   			parent.layer.alert("请添加审核人员");
			   		}
			   	},
	         	error: function (data) {
	             	parent.layer.alert("审核内容请求失败");
	         	}
			});
			return str;
		},
		// 审核模块html
		/* checkerModel:function(){
			var _this = this;
			_this.target.addClass("panel panel-accordion panel-default");
			var html = "";
			html += '<div class="panel-heading active"  role="tab" id="headingWorkflow">'  
				 		+'<h4 class="panel-title">'
			            	+'<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseWorkflow" aria-expanded="false" aria-controls="collapseWorkflow">审核</a>'
				 		+'</h4>'
				   	+'</div>';
			html += '<div id="collapseWorkflow" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingWorkflow"><div class="panel-body">'; 
			html += '<table class="table table-bordered" id="approverTab" style="margin-bottom:0;"></table>';
			$(html).appendTo(_this.target);
			var strContent = '<tr class="searched" id="auditrow3"><td class="th_bg">审核说明</td><td><textarea rows="5" class="form-control" style="resize:none;" name="content"></textarea></td></tr>';
			$(strContent).appendTo("#approverTab");
			//单选按钮，通过驳回
			_this.target.on("change", "input[name=workflowResult]", function(){
			    var state = $(this).val();
			    if(state == 0){
			    	if($(".noPass").length >= 1){
			   			$(".noPass").remove();
			   		}
			    } else {
			    	if($("#addChecker").length > 0){
			    		$("#addChecker").remove();
			    	}
			    }
			    
			});
		}, */
		
		//加载审核记录
		bindRecord:function() {
			var _this = this;
			if(!_this.settings.businessId){
				return;
			}
			
			$.ajax({
				url: _this.settings.recordUrl,
				type: "post",
				data: {
					"businessId": _this.settings.businessId,
					"workflowType": _this.settings.type
				},
				dataType: "json",
				async: false,
				success: function(result) {
					var workflowItems = ""; //审核记录保存对象
					//审核记录为空
					if(result.data && result.data.length == 0) {
						workflowItems = []; //为空数组
					} else {
						workflowItems = result.data.workflowItems; //保存审核记录数组
					}
					if($("#workflowList").length <= 0 && workflowItems.length > 0){
						var str = "";
						str += '<div class="panel panel-accordion panel-default"><div class="panel-heading active"  role="tab" id="headingRecord">'  
							 		+'<h4 class="panel-title">'
						            	+'<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseRecord" aria-expanded="false" aria-controls="collapseRecord">审核记录</a>'
							 		+'</h4>'
							   	+'</div>';
						str += '<div id="collapseRecord" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingRecord"><div class="panel-body">';
						str += '<table class="table table-bordered" id="workflowList" style="margin-bottom:0;"><tr><th style="width:50px;text-align:center;">序号</th><th  style="width:200px;">审核人</th><th style="width:160px;text-align:center;">审核状态</th><th style="width:200px;text-align:center;">审核时间</th><th style="text-align:center;">审核说明</th></tr>';
						for(var i = 0; i < workflowItems.length; i++){
							str += '<tr><td style="text-align:center;">'+(i+1)+'</td><td>'+workflowItems[i].userName+'</td>';
							//str += '<td style="text-align:center;">'+(workflowItems[i].workflowEndDate?workflowItems[i].workflowEndDate:" ")+'</td>';
							/* if(workflowItems[i].checkState == 0){
								str += '<td style="text-align:center;">审核中</td>';
							} else if(workflowItems[i].checkState == 1) {
								if(workflowItems[i].workflowResult == 0){
									str += '<td style="text-align:center;">通过</td>';
								} else if(workflowItems[i].workflowResult == 1){
									str += '<td style="text-align:center;">不通过</td>';
								} else {
									str += '<td></td>';
								}
							} else {
								str += '<td style="text-align:center;">已撤回</td>';
							} */
							if(workflowItems[i].workflowResult == 0){
								str += '<td style="text-align:center;">通过</td>';
							} else if(workflowItems[i].workflowResult == 1){
								str += '<td style="text-align:center;">不通过</td>';
							} else {
								str += '<td style="text-align:center;">审核中</td>';
							}
							str += '<td style="text-align:center;">'+(workflowItems[i].subDate?workflowItems[i].subDate:" ")+'</td>';
							str += '<td>'+(workflowItems[i].workflowContent?workflowItems[i].workflowContent:" ")+'</td></tr>';
							//str += '</tr>';
						}
						str += '</tr></table></div></div>';
						if($.trim(_this.target.html()) == ""){
							_this.target.addClass("panel panel-accordion panel-default");
							$(str).appendTo(_this.target);
						} else {
							$(str).insertAfter(_this.target);
						}
					}
				},
	         	error: function (data) {
	             	parent.layer.alert("请求失败");
	         	}
			});
		},
		//加载审核记录
		/* workflowStep:function() {
			var _this = this;
			$.ajax({
				url: _this.settings.stepUrl,
				type: "post",
				data: {
					"businessId": _this.settings.businessId,
					"workflowType": _this.settings.type,
					"isThrough":_this.settings.checkState
				},
				dataType: "json",
				success: function(result) {
					if(!result.success) {
						top.layer.alert(result.msg);
						return;
					}
					if(!result.data || !result.data.workflowNodeList || result.data.workflowNodeList.length == 0){
						return;
					}
					if($("#workflowStep").length > 0){
						$("#workflowStep").remove();
					}
					var html = '<div id="workflowStep">\
									<div class="workflowTit">审核进度</div>\
									<div class="open-progress clearfix">';
					for(var i = 0; i < result.data.workflowNodeList.length; i++){
						var item = result.data.workflowNodeList[i];
						if(result.data.theNodeSort - 2 >= i || result.data.theNodeSort == -1){
							html += '<div class="step on"><i class="glyphicon glyphicon-user"></i><span class="step-name">'+item.nodeName+'</span></div>';
						} else {
							html += '<div class="step"><i class="glyphicon glyphicon-user"></i><span class="step-name">'+item.nodeName+'</span></div>';
						}
					}
					html += '</div></div>';	
					$(".panel-group").before(html);
				},
	         	error: function (data) {
	             	parent.layer.alert("请求失败");
	         	}
			});
		}, */
		// 驳回 
		/* GetLevel:function(levData){
			levData = [{lev:1,name:"一级审批"},{lev:2,name:"二级审批"},{lev:3,name:"三级审批"}];
			var str = "";
			str += '<tr class="noPass"><td class="th_bg">驳回节点</td>';
			str += '<td colspan="4" style="text-align: left;"><select id="noPassLev" class="form-control col-sm-6" style="width:180px;margin-right:10px;" name="workflowLevel">';
		   	for(var i=0;i<levData.length-1;i++){
		   		str+='<option value="'+levData[i].lev+'">'+levData[i].name+'</option>';
		   	}
		   	str+='</select></td></tr>';
		   	
		   	str += '<tr class="noPass"><td class="th_bg">跳过节点</td>';
			str += '<td colspan="4" style="text-align: left;"><select id="skipLev" class="form-control col-sm-6" style="width:180px;margin-right:10px;" name="workflowLevel">';
		   	for(var i=0;i<levData.length;i++){
		   		str+='<option value="'+levData[i].lev+'">'+levData[i].name+'</option>'
		   	}
		   	str+='</select></td></tr>';
		   	
		   	
		   	if($("#approvalStatus").length == 1){ 
		   		if($("#approverAdd").length >= 1){
		   			$("#approverAdd").remove();
		   			
		   		}
		   		$("#approvalStatus").after(str)
		   	} else {
		   		$(str).appendTo("#approverTab");
		   	}
		   	
		} */
	};
	
	
	$.fn[ pluginName ] = function (options) { 
//		console.log("审核流程传的参数："+JSON.stringify(options));
		new Plugin(this, options);
	};
	
}(jQuery, window, document));

