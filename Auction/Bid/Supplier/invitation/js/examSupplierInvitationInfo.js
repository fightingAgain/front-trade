var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var inturl=config.bidhost+'/PurchaseController/updateInvitationSupplierBypacId.do';
var examType='1'//资格审查的缓存
var tenderTypeCode='0'//资格审查的缓存
var packageInfo=""//包件信息
var edittype="edittype";
var checkMsgType = "";
var packageCheckListInfo=[]//评审项信息
var supplierType="1"
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var checkListItem=[]//评价项信息
var checkPlana=""
var publicData=[];//邀请供应商数据列表
var projectSupplementList=[];
var projectDataID=getUrlParam('projectId');//项目Id
var packageId=getUrlParam('packageId');//包件Id
var type=getUrlParam('type');
var projectData=[];
//获取询比公告发布的数据
var userName,userId,purchaserNames;
var isAccepts="";
 //初始化
$(function(){
	du(packageId);//包件数据加载
	Purchase();//项目信息加载
	supplimentInt(0);//时间结构加载
	package();//包件数据加载
	PackageCheckList(0);
	getProjectPrice(packagePrice);
	new UEditorEdit({
		pageType: "view",
		examType:examType,
		contentKey: projectSupplementList.length==0?'examRemark':'oldExamRemark',
	});
	mediaEditor.setValue(projectSupplementList.length==0?packageInfo:projectSupplementList[0]);
	if(type=="view"){
		$("#btn_bao").hide();
		$("#btn_submit").hide()
	}
	
	//start 招标代理服务费
	if(packageInfo.projectServiceFee){
		for(var key in packageInfo.projectServiceFee){
			if(key == "collectType"){
				$("#collectType").html(packageInfo.projectServiceFee[key]==1?"标准累进制":(packageInfo.projectServiceFee[key]==2?"其他":"固定金额"));
			} else {
				$("#" + key).html(packageInfo.projectServiceFee[key]);
			}
		}
	}
	//end 招标代理服务费
	/*start报价*/
	offerFormData();
	fileList();
	/*end报价*/
});
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
			PurchaseData();			
			if(projectData.projectState==2){
				$(".projectSource0").show()
				$('input[type="text"]').attr('disabled',true)
				$('select').attr('disabled',true)
				$('.btn').attr('disabled',false)
				$("#chosePucharse").hide()
			}else{
				$(".projectSource0").hide()
				$('input[type="text"]').attr('disabled',false)
				$('select').attr('disabled',false)
				$("#chosePucharse").show()
			}
		}
	});		   						
};
$("#btn_close").on('click',function(){
	parent.layer.close(parent.layer.getFrameIndex(window.name));
})
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
        if(projectData.isAgent==0){
        	$('.isAgent1').hide();
			$('.purchaserShow').show();
        }else{
        	$('.isAgent1').show();
			$('.purchaserShow').hide();
        }
};
$("#btn_bao").on('click',function(){
	 $.ajax({
		url: inturl, //查看 详细信息
		async: false,
		type: 'get',
		dataType: 'json',
		data:{
			'projectId':projectDataID,
			'packageId':packageId,
			'isAccept':0,					
		},
		success: function(data) {
		 if(data.success){
		 	parent.layer.alert("接受邀请成功");		 
		 	parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
		 	parent.layer.closeAll();
		 }else{
		 	parent.layer.alert(data.message)
		 }
		}
	});	
})
$("#btn_submit").on('click',function(){
	var tip1 = '<div style="font-size:18px;font-weight:bold;"><span class="red">警示：</span>您现在选择的是<span class="red">拒绝邀请，拒绝邀请后将可能无法参与本项目后续的任何操作</span></div>';
	var tip2 = '<div style="font-size:18px;font-weight:bold;"><span class="red">警示：最后机会，</span>如再次选择<span class="red">拒绝邀请，您将彻底失去参与本项目的报价机会</span></div>';
	parent.layer.confirm(tip1,{
		btn:["我再考虑","下决心拒绝邀请"],
		btn1:function(idx){
	        parent.layer.close(idx);
	    },
	    btn2:function(){
		 	parent.layer.confirm(tip2,{
		 		btn:["我再考虑","拒绝邀请"],
		 		btn1:function(idx1){
			 		parent.layer.close(idx1);
				}, 
				btn2:function() {
					$.ajax({
						url: inturl, //查看 详细信息
						async: false,
						type: 'get',
						dataType: 'json',
						data:{
							'projectId':projectDataID,
							'packageId':packageId,
							'isAccept':1,						
						},
						success: function(data) {
						 if(data.success){
						 	parent.layer.closeAll();
						 	parent.layer.alert("已拒绝");			 	
						 	parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						 	
						 	
						 }else{
						 	parent.layer.alert(data.message)
						 }
						}
					});
				}
			});
		}
	});
});

/*satrt报价表*/
var fileUp;
function offerFormData(){
	$("#offerForm").offerForm({
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageId,
			projectId:projectId, 
			examType:examType,
		},
		status:2,//1为编辑2为查看
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(isOfferDetailedItem,offerAttention){
	if(isOfferDetailedItem==undefined){
		isOfferDetailedItem = packageInfo.isOfferDetailedItem;
	}
	if(offerAttention==undefined){
		offerAttention = packageInfo.offerAttention;
	}
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageId,
				projectId:projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:isOfferDetailedItem,//是否需要分项报价
			offerAttention:offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		});
	}

}
/*end报价表*/