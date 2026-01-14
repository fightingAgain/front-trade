 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var findPackage=config.bidhost + '/ProjectPackageController/findProjectPackageList.do';//包件列表数据
 var viewpackage='Auction/common/Agent/Purchase/model/viewPackage.html';//包件详情页面
//该条数据的项目id
var projectDataID=getUrlParam("projectId");
var isRater=getUrlParam("isRater");
var projectData=[];
//包件信息
var packageInfo =[];
var oldProjectId='';
 //初始化
$(function(){
	Purchase();
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectDataID,
		status: 2,//1编辑   2 查看  
	});
	if(isRater){
		$('#btnMember, #btnMemberSave').hide();
	}
})
//获取询比公告发布的数据
function Purchase(){	
	
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':projectDataID,
			
		},
		success: function(data) {			
			projectData=data.data;
			if(projectData.oldProjectId){//推送的项目
				oldProjectId = projectData.oldProjectId;
				$('#viewPushInfo').show();
			};
			PurchaseData();
			if(!isRater){
				$('.isRater').show()
				package()
			}
		}
	});		   						
};

function PurchaseData(){
	 //渲染公告的数据
	$('div[id]').each(function(){
		$(this).html(projectData[this.id]);
	});
	
	$("#provinceName").html(projectData.provinceName||'湖北省');	
	$("#cityName").html(projectData.cityName||'襄阳市');	
	$("#examtype").html(projectData.examType==0?'资格预审':'资格后审');
	$("#isSubpackage").html(projectData.isSubpackage==0?'否':projectData.isSubpackage==1?'是':'');
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
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if(projectData.tenderProjectClassify){
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: projectData.tenderProjectClassify,
			status: 2,
			viewCallback: function(name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if(projectData.industriesType){
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: projectData.industriesType,
			status: 2,
			viewCallback: function(name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
}
function package(){
	$.ajax({
		   	url:findPackage,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"projectId":projectData.projectId
		   	},
		   	success:function(data){
			   	if(data.success){
			   		packageInfo	=data.data
			   	}		   		  		   			   	
		   	},
		   	error:function(data){
		   		parent.layer.alert("获取失败")
		   	}
	});
	if(packageInfo.length>5){
		var heigthAuto="304";
	}else{
		var heigthAuto='auto'
	}
	$('#tablebjb').bootstrapTable({
		pagination: false,
		undefinedText: "",
		// height:heigthAuto,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "packageNum",
				title: "包件编号",
				align: "left",
				halign: "left",
				width: "200px",

			},
			{
				field: "packageName",
				title: "包件名称",
				halign: "left",				
				align: "left",
				width: "200px",
				formatter:function(value, row, index){
					if(row.packageSource==1){
						return value+'<div class="text-danger">(重新采购)</div>';
					}else{
						return value;
					}
					
				}
			}, {
				field: "examCheckPlan",
				title: "评审方式",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				if(projectData.examType==1){
			 		if(row.checkPlan==0){
				 		var checkPlans="综合评分法"
				 	}else if(row.checkPlan==1){
				 		var checkPlans="最低评标价法"
				 	}else if(row.checkPlan==2){
				 		var checkPlans="经评审的最低价法(价格评分)"
				 	}else if(row.checkPlan==3){
						var checkPlans="最低投标价法"
					}else if(row.checkPlan==5){
						var checkPlans="经评审的最低投标价法"
					}else if(row.checkPlan==4){
						var checkPlans="经评审的最高投标价法"
					} 
			 	}else if(projectData.examType==0){
			 		if(row.examCheckPlan==0){
				 		var checkPlans="合格制"
				 	}else if(row.examCheckPlan==1){
				 		var checkPlans="有限数量制"
				 	}
			 	}
			 	return checkPlans
				}				
			},
			{
				field: "packageState",
				title: "审核状态",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
					if(row.packageState==0){
				 		var packageState="未审核"
				 	}else if(row.packageState==1){
				 		var packageState="审核中"
				 	}else if(row.packageState==2){
				 		var packageState="审核通过"
				 	}else if(row.packageState==3){
				 		var packageState="审核未通过"
				 	}else if(row.packageState==4){
				 		var packageState="确认"
				 	}else if(row.packageState==4){
				 		var packageState="确认待发布"
				 	}
				 	return packageState
				}
			},
			{
				field: "#",
				title: "操作",
				halign: "center",
				align: "center",
				width:'120px',
				formatter:function(value, row, index){
					var Tdr='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=viewbao(\"'+ index+'\")>查看</a>'					
		     		return Tdr
			}
				
			}			
		]
	});
	$('#tablebjb').bootstrapTable("load", packageInfo); //重载数据	
	
};
//查看包件
function viewbao($index){
	var rowData=$('#tablebjb').bootstrapTable('getData');//bootstrap获取当前页的数据
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看包件'
        ,area: ['1000px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:viewpackage+"?isRater=1"
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(rowData[$index].id,projectData.examType);       	
        }
        
    });
};
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
/* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, projectData.bidValue1)
});