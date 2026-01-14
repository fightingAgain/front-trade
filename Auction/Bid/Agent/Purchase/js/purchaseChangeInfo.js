 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var projectData=[];
var isCheck,dataLists="";
var fileUp;

var projectId;
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
function initUEditor(echoObj){
	// var echoObj = {publishType:2,pdfUrl:"/df2023/20240325/pdf/0abb5a67e86c49c8b64639b84b44da93.pdf"}
	new UEditorEdit({
		isShowTemplateSelect:false,
		examType:examType,
		echoObj:echoObj,
		// 查看页面不需要回调uploadSuccess
		uploadSuccess: function(data){
			console.log(parent.serializeArrayToJson($("#formbackage").serializeArray()));
			console.log('uploadSuccess',data);
		}
	})
}
initUEditor();
setTimeout(function(){
	var iframeid=$('#editor iframe').attr('id');
	var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
},1000)
function add_bao(type){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: type=='change'?'选择可变更公告':'查看包件'
        ,area: ['1000px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Agent/Purchase/model/choicePackage.html?tenderType=0&examType=0'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.initTable(type,callback)
        }
    });
    
}
function callback(rowData,type){
	projectId=rowData.projectId;
	du(rowData.id,rowData.examType);
	mediaEditor.setValue(packageInfo)
	changeDatetimepicker(rowData.examType,type)		
	Purchase(rowData.projectId);		
	previewC();
	
	callbackData(appointmentData)	
	
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
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
			sessionStorage.setItem('purchaserId', JSON.stringify(projectData.purchaserId));//
			sessionStorage.setItem('enterType', '4');//							
			tenderTypeCode=projectData.tenderType;			
			sessionStorage.setItem('tenderTypeCode', tenderTypeCode);//0是询比采购  6是单一来源采购，并缓存
			$("#examType").val(projectData.examType);
			
			initMediaVal(projectData.options, {
				stage: 'xmby',
				packageId: packageInfo.id,
				projectId: packageInfo.projectId, 
			})
		}
	});
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
	
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
	
};

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
};
//审核确定按钮
$("#btn_submit").click(function() {
	if($('#projectName').html()==""){
		parent.layer.alert("请选择项目公告");        		     		
		return;
	};
	if($('#packageName').html()==""){
		parent.layer.alert("请选择项目公告");        		     		
		return;
	};
	if(!mediaEditor.isValidate()){
		return
	}  
	if(timeCheck($("#timeList"),'change',saveFout)){		
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
			};
			var vmForm = $("#formbackage");
			// 时间处理
			['noticeEndDate', 'signEndDate'].forEach(function(key) {
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
			};
			var vmForm = $("#formbackage");
			// 时间处理
			['noticeEndDate', 'signEndDate'].forEach(function(key) {
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
	}
	
}
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