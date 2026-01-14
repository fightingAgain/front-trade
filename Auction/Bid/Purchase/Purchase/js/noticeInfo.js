 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var WorkflowUrl=config.bidhost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
 var saveProjectPackage=config.bidhost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var projectData=[];
var examTypes;
var isCheck;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
// var fileUp; //报价
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	if(projectId!=null&&projectId!=undefined&&projectId!=""){
		new UEditorEdit({
			examType:examType
		});
		$("#chBtn").hide()
		du(packageId,examType);
		Purchase(projectId);
		callbackData(appointmentData);
	}else{
		$("#chBtn").show()
	}
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
	},1000)
})
/******************    公告模板     ***********************/
//选择项目
function add_bao(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '选择包件'
        ,area: ['1100px', '650px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Purchase/Purchase/model/choicePackage.html?tenderType=0&examType=0'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.initTable('',callback);
        }
    });
    
}
function callback(rowData,type){
	new UEditorEdit({
		examType:rowData.examType
	});
	du(rowData.id,rowData.examType);
	datetimepicker(rowData.examType,type)	
	Purchase(rowData.projectId);		
	previewC();
	callbackData(appointmentData)
	
}
//获取询比公告发布的数据
function Purchase(uid){		
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':uid,			
		},
		success: function(data) {			
			projectData=data.data;
			PurchaseData();
		}
	});	
	
	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmgg"
	}
	
	if(packageInfo.id != ''){
		reData.id = packageInfo.id;
		$('.record').show();
		findWorkflowCheckerAndAccp(packageInfo.id);
	}
	
	//获取审核人列表
	$.ajax({
		url:WorkflowUrl,
		type:'get',
		dataType:'json',
		async:false,
		data: reData,
		success:function(data){	
			
		var option=""
		//判断是否有审核人		   
		if(data.message==0){	
				isCheck = true;
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide()
				return;
			};
		if(data.message==2){		   	   	
					parent.layer.alert("找不到该级别的审批人,请先添加审批人");
					massage2=data.message;
			return;
		};
		var checkerId = ''; 
		if(data.success == true) {
			$('.employee').show()
			isWorkflow = 1;
			if(data.data){
				if(data.data.workflowCheckers.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if(data.data.workflowCheckers.length > 0) {
					
					if(data.data.employee){
						checkerId = data.data.employee.id;
					}
					option = "<option value=''>请选择审核人员</option>";
					var checkerList = data.data.workflowCheckers;
					for(var i = 0; i < checkerList.length; i++) {
						
						if(checkerId != '' && checkerList[i].employeeId == checkerId){
							option += '<option value="' + checkerList[i].employeeId  + '" selected="selected">' + checkerList[i].userName + '</option>'
						}else{
							option += '<option value="' + checkerList[i].employeeId  + '">' + checkerList[i].userName + '</option>'	
						}
						
					}
				}
			}else{
				option = '<option>暂无审核人员</option>'
			}
		}		   	    
		$("#employeeId").html(option);	
		}
	});
	previewC()
	datetimepicker(examType);
	initMediaVal(packageInfo.options, {
		// stage: 'xmgg',
		projectId: packageInfo.projectId,
		packageId: packageInfo.id
	});
	mediaEditor.setValue(packageInfo);
	//公告模板下拉选择
	if(projectData.projectType==0){//项目的项目类型。
		var projectTypes='A';
	}
	if(projectData.projectType==1){
		var projectTypes='B';
	}
	if(projectData.projectType==2){
		var projectTypes='C';
	}
	if(projectData.projectType==3){
		var projectTypes='C50';
	}
	if(projectData.projectType==4){
		var projectTypes='W';
	}
	if(examType==0){
		modelOption({'tempType':'inquiryRatioNotice', 'examinationType':1,'projectType':projectTypes});
		$("#noticeTemplate").attr('name','examTemplateId');
		$("#noticeTemplate").val(packageInfo.examTemplateId);//公告模板id
	}else{
		modelOption({'tempType':'inquiryRatioNotice', 'examinationType':2,'projectType':projectTypes});
		$("#noticeTemplate").attr('name','templateId');
		$("#noticeTemplate").val(packageInfo.templateId);//公告模板id
	}	
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
			var templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		parent.layer.confirm('温馨提示：是否确认切换模板', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero){
			changHtml(templateId)
			parent.layer.close(index);			 
		}, function(index){
			parent.layer.close(index)
		});	
	});
	
	/*start报价*/
	/* if(examType==1){
		offerFormData();
		fileList();
	} */
	/*end报价*/
};
//切换模板
function changHtml(templateId){
	$.ajax({   	
		url:saveProjectPackage,//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:$("#formbackage").serialize()+'&packageState=5',
		success:function(data){			   		
			if(data.success==true){
				modelHtml({'type':'xmgg', 'projectId':packageInfo.projectId,'packageId':packageInfo.id,'tempId':templateId,'tenderType':0,'examType':examType})
			}else{
				parent.layer.alert(data.message)
			}
		}   	
	});		
}
function PurchaseData(){
	 //渲染公告的数据
	    $('div[id]').each(function(){
			$(this).html(projectData[this.id]);
		});
		
        if(projectData.projectType==0){
        	$('.engineering').show()
        }else{
        	$('.engineering').hide()
        }    
        if(projectData.isAgent==1){
        	$('.isAgent1').show()
        }else{
        	$('.isAgent1').hide()
        }
};
//审核确定按钮
$("#btn_submit").click(function() {
    if($('#packageName').html()==""){
 		parent.layer.alert("请选择包件");        		     		
 		return false;
	};
	/* if(examType==1 && $("input[name='isOfferDetailedItem']:checked").val()==0){
		if(fileUp.options.filesDataDetail.length==0){

		parent.layer.alert("请上传分项报价表模板");        		
			return false;
		}
	} */
	if(timeCheck($("#timeList"))){
		if(!mediaEditor.isValidate()){     		     		
			 return false;
		}     
		if($("#employeeId").val()==""){   
			parent.layer.alert("请选择审核人");        		     		
			 return false;      	
		};
		saveFuct()
	}		
});
function saveFuct(){
	$("#remark").val(ue.getContent())
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$.ajax({   	
			   	url:saveProjectPackage,//修改包件的接口
			   	type:'post',
			   	//dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:$("#formbackage").serialize()+'&packageState=1',
			   	success:function(data){			   		
			   		if(data.success==true){
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						// 校验报价表是否存在 
						top.checkBidFilesTips(packageInfo.id, '02', examType, "提交成功");
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						parent.layer.close(parent.layer.getFrameIndex(window.name));	
			   			
			   		}else{
			   			parent.layer.alert(data.message)
			   			return false;
			   		}
			   	}   	
			});	
		});
	} else {
       $.ajax({   	
		   	url:saveProjectPackage,//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:$("#formbackage").serialize()+'&packageState=1',
		   	success:function(data){			   		
		   		if(data.success==true){
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					// 校验报价表是否存在 
					top.checkBidFilesTips(packageInfo.id, '02', examType, "提交审核成功");
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					parent.layer.close(parent.layer.getFrameIndex(window.name));			   			
		   		}else{
		   			parent.layer.alert(data.message);
		   			return false;
		   		}
		   	}   	
		});	
	}
}
//保存
$("#btn_bao").click(function() {
    if($('#packageName').html()==""){
 		parent.layer.alert("请选择包件");        		     		
 		return;
 	};
 	$("#remark").val(ue.getContent())	     	
    $.ajax({   	
	   	url:saveProjectPackage,//修改包件的接口
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#formbackage").serialize()+'&packageState=5',
	   	success:function(data){			   		
	   		if(data.success==true){
				if(top.window.document.getElementById("consoleWindow")){
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				}
	   			parent.layer.alert("保存成功");
	   		    parent.$('#table').bootstrapTable(('refresh')); 	
	   		}else{
	   			parent.layer.alert(data.message)
	   		}
	   	}   	
	});	 
});
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

/*start报价表  调用报价封装方法 */
/* function offerFormData(){
	$("#offerForm").offerForm({
		saveurl:config.bidhost+'/PackagePriceListController/savePriceList.do',//保存接口
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:examType,
		},
		status:1,//1为编辑2为查看
		offerSubmit:'.offerBtn',//提交按钮类名
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:1,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			offerAttention:packageInfo.offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		})
	}
} */
/*end报价*/