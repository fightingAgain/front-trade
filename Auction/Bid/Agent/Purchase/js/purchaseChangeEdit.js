var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var projectData=[];
var isCheck,dataLists="";
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var keyId=getUrlParam('keyId');
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
// var ue = UE.getEditor('editor');
function initUEditor(echoObj){
	// var echoObj = {publishType:2,pdfUrl:"/df2023/20240325/pdf/0abb5a67e86c49c8b64639b84b44da93.pdf"}
	new UEditorEdit({
		// pageType:"view",
		examType:examType,
		publishName:(examType==1?'releaseForm':'examReleaseForm'),
		isShowTemplateSelect:false,
		echoObj:echoObj,
		// 查看页面不需要回调uploadSuccess
		uploadSuccess: function(data){
			console.log(parent.serializeArrayToJson($("#formbackage").serializeArray()));
			console.log('uploadSuccess',data);
		}
	})
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	//获取审核人列表
	$.ajax({
		url:WorkflowUrl,
		type:'get',
		dataType:'json',
		async:false,
		data:{
			"workflowLevel":0,
			"workflowType":"xmby"
		},
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
		if(data.success==true){
				$('.employee').show()
				if(data.data.length==0){
				option='<option>暂无审核人员</option>'
			}
			if(data.data.length>0){
				workflowData=data.data
				option="<option value=''>请选择审核人员</option>"
					for(var i=0;i<data.data.length;i++){
						option+='<option value="'+data.data[i].employeeId+'">'+data.data[i].userName+'</option>'
				}
			}		   	   			   	  			   	  
		}		   	    
		$("#employeeId").html(option);	
		}
	});
	Purchase(projectId);
	du(packageId, examType);
	changeDatetimepicker(examType, 'change');
	
	package();
	initUEditor()
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
	mediaEditor.setValue(packageInfo)
	if(keyId){
		SupplementEdit(keyId);
	}
	previewC();
	callbackData(appointmentData);
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
	},1000)
})
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
			tenderTypeCode=projectData.tenderType;			
			$("#examType").val(projectData.examType);
			// var projectId = projectId;
			// var packageId = packageId;
			initMediaVal(projectData.options, {
				stage: 'xmby',
				projectId: projectId,
				packageId: packageId,
			})
		}
	});
	
};


function PurchaseData(){
	//渲染公告的数据
	for(var key in projectData){
		if(key=='employeeId'){
			$("#"+key).val(projectData[key])
		}else{
			$("#"+key).html(projectData[key])
		}	
	}
	if(projectData.projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}                 
};

function SupplementEdit(uid){				   													
	    $.ajax({
			url: urlfindProjectSupplementInfo,
			type: 'post',
			dataType: 'json',
			async: false,
			data: {
				"id": uid,
			},
			success: function(result) {
				if(result.success){					
                    $('input[name]').each(function(){
						$(this).val(result.data[this.id]);
						if(reg.test(result.data[this.id])){
							$(this).val(result.data[this.id].substring(0,16));
						}
					});
					$("input[name='offerEndDate']").val(result.data.offerEndDate!=undefined?result.data.offerEndDate.substring(0,16):"")
					WORKFLOWTYPE = "xmby";
					findWorkflowCheckerAndAccp(uid);
				}				 
			}
		})
}
//审核确定按钮
$("#btn_submit").click(function() {
	if(timeCheck($("#timeList"),'change',saveFout)){//时间的父级id，是否是变更，提交事件	
		if(!mediaEditor.isValidate()){
			return
		}  
		saveFout();
	}     	 	
});
function saveFout(){
	$("#remark").val(ue.getContent())
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function(index) {
			var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
			for(key in packageInfo){
				if(reg.test(packageInfo[key])){
					if($('input[name="'+ key +'"]').val()==""){
						$('input[name="'+ key +'"]').val(packageInfo[key])
					}
				}
			}  	
			$("#checkState").val(1);
			$("#tenderType").val(0);
			$("#remark").val(ue.getContent());
			// 时间处理
			var vmForm = $("#formbackage");
			['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
				var value = vmForm.find('#' + key).val();
				if (value && value.length == 16) {
					vmForm.find('#' + key).val(value + ':59')
				}
			})
			$.ajax({
				   url:config.bidhost+'/ProjectSupplementController/saveProjectSupplement.do',//修改包件的接口,
				   type:'post',
				   //dataType:'json',
				   async:false,
				   //contentType:'application/json;charset=UTF-8',
				   data: vmForm.serialize()+'&examType='+packageInfo.examType,
				   success:function(data){ 
					  if(data.success==true){
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						parent.layer.alert("发布成功");
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						parent.layer.close(parent.layer.getFrameIndex(window.name));		
					  }else{
						   parent.layer.alert(data.message);
						   return;
					  };				   	  
				   },
				   error:function(data){
					   parent.layer.alert("发布失败")
				   }
			 });	
		});
	} else {	
		if($("#employeeId").val()==""){
			  parent.layer.alert("请选择审核人");        		     		
			 return;
		}
		var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
		for(key in packageInfo){
			if(reg.test(packageInfo[key])){
				if($('input[name="'+ key +'"]').val()==""){
					$('input[name="'+ key +'"]').val(packageInfo[key])
				}
			}
		}  	
		$("#checkState").val(1);
		$("#tenderType").val(0);
		$("#remark").val(ue.getContent());
		// 时间处理
		var vmForm = $("#formbackage");
		['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
			var value = vmForm.find('#' + key).val();
			if (value && value.length == 16) {
				vmForm.find('#' + key).val(value + ':59')
			}
		})
		$.ajax({
			   url:config.bidhost+'/ProjectSupplementController/saveProjectSupplement.do',//修改包件的接口,
			   type:'post',
			   //dataType:'json',
			   async:false,
			   //contentType:'application/json;charset=UTF-8',
			   data: vmForm.serialize()+'&examType='+packageInfo.examType,
			   success:function(data){ 
				  if(data.success==true){
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					parent.layer.alert("提交审核成功");
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					parent.layer.close(parent.layer.getFrameIndex(window.name));		
				  }else{
					   parent.layer.alert(data.message);
					   return;
				  };
			   },
			   error:function(data){
				   parent.layer.alert("发布失败")
			   }
		});	
	} 
}
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});


/*start报价表  调用报价封装方法 */
/* var fileUp;
function offerFormData(){
	$("#offerForm").offerForm({
		saveurl:config.bidhost+'/PackagePriceListController/savePriceList.do',//保存接口
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:examType,
		},
		status:2,//1为编辑2为查看
		offerSubmit:'.offerBtn',//提交按钮类名
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
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