 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var projectData=[];
var examType,tenderTypeCode,examRsk;
var isCheck;
var examTypeShow=1;
var createType=getUrlParam('createType');
var yaoqing='2'//判断是邀请供应商还是发送邀请函
var tenderTypeCodes = 0; 
var dataLists="";
// var fileUp; //报价
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
// var ue = UE.getEditor('editor');
setTimeout(function(){
	var iframeid=$('#editor iframe').attr('id');
	var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
},1000)
function add_bao(type){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: type=='change'?'选择可变更邀请函':'查看包件'
        ,area: ['1100px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Purchase/Purchase/model/choicePackage.html?tenderType='+tenderTypeCodes+'&examType=1'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.initTable(type,callback)
        }
    });
    
};
function callback(rowData, type) {
	new UEditorEdit({
		examType:rowData.examType,
		isShowTemplateSelect:false
	});
	du(rowData.id,rowData.examType);
	changeInvitDatetimepicker(rowData.examType,type)		
	Purchase(rowData.projectId);		
	previewC();
	callbackData(appointmentData);
	Public();
	mediaEditor.setValue(packageInfo);
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
}
//获取询比公告发布的数据
function Purchase(uid,purExamType){	
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
			examType=1;
			examTypeShow=projectData.examType;
			if(projectData.examType==0){
				$("#remark").attr('name','examRemark');
	
			}else{
				$("#remark").attr('name','remark');
				
			};			
			tenderTypeCode=projectData.tenderType;			
			$("#examType").val(examType);			
		}
	});	
	packageInfo.examRsk=projectData.examType;  
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
	
	
};
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function PurchaseData(){
	 //渲染公告的数据
	    $('div[id]').each(function(){
			$(this).html(projectData[this.id]);
		});
		$("#examTypeName").html(projectData.examType==0?'资格预审':'资格后审')
        if(projectData.projectType==0){
        	$('.engineering').show();
        }else{
        	$('.engineering').hide();
        }; 
        if(projectData.isAgent==1){
        	$('.isAgent1').show()
        }else{
        	$('.isAgent1').hide()
        }
}
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
    if(timeCheck($("#timeList"),'change',saveFout)){		
		saveFout();
	}	    	 
});
function saveFout(){
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
			$("#remark").val(ue.getContent())
			 $.ajax({
				   url:config.bidhost+'/ProjectSupplementController/saveProjectSupplement.do',//修改包件的接口,
				   type:'post',
				   //dataType:'json',
				   async:false,
				   //contentType:'application/json;charset=UTF-8',
				   data:$("#formbackage").serialize()+'&examType=1',
				   success:function(data){ 
					  if(data.success==true){
					parent.layer.close(parent.layer.getFrameIndex(window.name));
						  parent.layer.alert("发布成功");
						  parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
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
		$("#remark").val(ue.getContent())
		$.ajax({
			   url:config.bidhost+'/ProjectSupplementController/saveProjectSupplement.do',//修改包件的接口,
			   type:'post',
			   //dataType:'json',
			   async:false,
			   //contentType:'application/json;charset=UTF-8',
			   data:$("#formbackage").serialize()+'&examType=1',
			   success:function(data){ 
				  if(data.success==true){
				parent.layer.close(parent.layer.getFrameIndex(window.name));
					  parent.layer.alert("发布成功");
					  parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
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