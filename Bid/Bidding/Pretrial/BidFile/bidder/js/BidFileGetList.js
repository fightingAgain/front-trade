/**
*  Xiangxiaoxia 
*  2019-2-25
*  投标人--招标文件获取列表页面
*  方法列表及功能描述
*   1、initTable()   分页查询
*/

var urlSearchList = config.tenderHost+'/PretrialDocClarifyController/findTenderPretrialDocPageList.do';//招标文件--标段查询分页接口
var urlSignSupplier = config.tenderHost+'/SupplierSignController/findSupplierSignPretrialInfo.do';//投标人报名信息记录i--标段查询分页接口
var checkMessageUrl = config.Syshost + '/SupplierServiceChargeController/checkMessage.do';  //供应商缴纳平台服务费验证
var getProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do';  //获取招标项目，标段基本信息

var pageDownList= 'Bidding/Pretrial/BidFile/bidder/model/FileDownloadList.html';//下载列表
var pageLinkEdit ='Bidding/Pretrial/BidFile/bidder/model/DownloadLinkEdit.html';//采集个人信息
var payView= 'Bidding/Pretrial/BidFile/bidder/model/PayFormChoose.html'; //缴费


var bidData = '';//标段数据
var fileState = 1;  //文件当前状态，1是购买，2是下载
var proData;  //招标项目标段基本信息
//表格初始化
$(function(){
	initTable();
	
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();
	});
	
	//去购买
	$("#table").on("click", ".btnView", function(){
		fileState = 1;
		var index = $(this).attr("data-index");
		openView(index);
	});
	//下载
	$("#table").on("click", ".btnDownload", function(){
		fileState = 2;
		var index = $(this).attr("data-index");
		openView(index);
	});
	//购标状态
	$("[name='already']").change(function(){
		$("#table").bootstrapTable('destroy');
		initTable();
	});
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val(),
		'already': $("[name='already']").val()
	}
};

function GetTime(time) {
	var date = new Date(time.replace(/\-/g,"/")).getTime();
	return date;
};

/*
 * 打开下载窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	bidData=$('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	//黑名单验证
	var parm = checkBlackList(entryInfo().enterpriseCode,bidData.tenderProjectClassifyCode,'d');
	if(parm.isCheckBlackList){
		parent.layer.alert(parm.message, {icon: 7,title: '提示'});
		return;
	}
	proData = getProjectDetail(bidData.bidSectionId);
	checkMessage(bidData.bidSectionId);
//	if(GetTime(nowDate) < GetTime(bidData[index].docGetStartTime) ){
//		parent.layer.alert("招标文件获取未开始",{icon:7,title:'提示'})
//		return;
//	}
//	if(GetTime(nowDate) > GetTime(bidData[index].docGetEndTime) ){
//		parent.layer.alert("招标文件获取已结束",{icon:7,title:'提示'})
//		return;
//	}	
	
	//查看是否报名  已存在报名记录直接进入下载文件列表页面
	//getOrder();
	
	
};

/***
 * 获取招标项目，标段信息
 * @param {Object} id  标段id
 */
function getProjectDetail(id){
	var rst;
	$.ajax({
		type:"post",
		url:getProjectDetailUrl,
		async:false,
		data:{bidSectionId: bidData.bidSectionId},
		success:function(data){
			if(!data.success){
				top.layer.alert('温馨提示：' + data.message);
				return;
			}
			rst = data.data;
		}
	});
	return rst;
}

/***
 * 供应商缴纳平台服务费验证 
 */
function checkMessage(id){
	$.ajax({
		type: "post",
		url: checkMessageUrl,
		async: false,
		data:{
			packageId:id,
			enterpriseId: (entryData ? entryData.enterpriseId : entryInfo().enterpriseId),
			agentEnterpriseId: proData.agencyEnterprisId,
			contractReckonPrice: proData.contractReckonPrice,
			priceUnit: proData.priceUnit
		},
		success: function(res) {
			if(!res.success) {
				parent.layer.alert('温馨提示：' + res.message);
				return;
			}
			var item = res.data;
			if(item.strKey == null){
				getOrder()
			}else{
				top.layer.confirm('温馨提示：购买<strong>资格预审</strong>文件后，需缴纳平台服务费（<a style="color: #337ab7;"  href="'+ platformFeeNoticeUrl +'" target="_blank">点击这里查看平台服务费收费标准</a>）才能<strong>下载资格预审文件。确认要购买资格预审文件吗？</strong>',{title:'提示'},function(index){
					top.layer.close(index)
					getOrder()
				})
			}
		}
	});
}


//验证是否购买平台服务费
function checkService(isCanDownload, callback){
	checkServiceCost({
		projectId:bidData.projectId,
		packId:bidData.bidSectionId,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		isCanDownload:isCanDownload,
		paySuccess:function(data, isService){
			if(data){
				$("#table").bootstrapTable('refresh');
				if(isService){
					getOrder();
				} else {
					if(callback){
						callback();
					} else {
						getOrder();
					}
				}
			} else {
//				top.layer.alert("支付失败");
			}
		}
	});
}
function getOrder(){
	
	$.ajax({
         url: urlSignSupplier,//查询存在报名记录
         type: "post",
         data: {packageId:bidData.bidSectionId},
         success: function (data) {
         	if(data.success == false){
         		var tips = data.message;
         		if(fileState == 1){
         			tips += "，无法购买";
         		} else if(fileState == 2) {
         			tips += "，无法下载";
         		}
        		parent.layer.alert(tips);
        		return;
        	}
         	if(data.success == true){
         		var getData = data.data;
         		if(getData.hasInfo == 1 ){
         			if(getData.canDownload == 1){
//       				checkService(true, function(){    
         					var width = top.$(window).width() * 0.7;
							var height = top.$(window).height() * 0.6;
				    		layer.open({
								type: 2,
								title: "资格预审文件",
								area: [width + 'px', height + 'px'],
								resize: false,
								content: pageDownList+ "?packageId=" + bidData.bidSectionId+ '&bidFileId=' + bidData.id,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;	
									iframeWin.passMessage(bidData);
								}
							});
//						});
         			}else{
         				getGoodsList({enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId, packId:bidData.bidSectionId}, function(data){
							if(data.success){
								getOrder();
								$("#table").bootstrapTable('refresh');
							}
						});
//       				checkService(false);
//	         			pay(getData.orderId,'table',function(status,orderId){
////	 						if(status == 3){
//	 							getOrder();
////	 						}
//	 					})
	         		}
         		} else if(getData.hasInfo == 2){
         			parent.layer.alert("您当前报名未完成，需要报名完成才能获取资格预审文件");
         		} else{
					//不需要报名的标段，购买资格预审文件前，给出下载文件需要缴纳平台服务费的提示信息
					/* var title="温馨提示：购买资格预审文件后，需缴纳平台服务费（<a href='"+ siteInfo.portalSite +"portal/central/notice_info/detail?id=E8B26D724DC64BACB07179D76F53B53C' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能下载资格预审文件。确认要购买资格预审文件吗？";						
					top.layer.confirm(title, function(indexsmm) {
						
					}); */
					var width = top.$(window).width() * 0.6;
					var height = 400;
					layer.open({
						type: 2,
						title: "购标人信息采集",
						area: [width + 'px', height + 'px'],
						resize: false,
						content: pageLinkEdit + "?packageId=" + bidData.bidSectionId+ '&bidFileId=' + bidData.bidFileId,
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;
							iframeWin.getMethod(getOrder); 
						}
					});
         		}
         	}
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败",{icon: 3,title: '提示'});
         }
     });
}

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:urlSearchList,// 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		height:tableHeight,
		onCheck:function(row){
			id=row.id;
			projectId=row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
			cellStyle:{
				css:widthCode
			}
		},{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
			cellStyle:{
				css:widthName
			}
		},{
			field: 'tenderMode',
			title: '招标方式',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			formatter:function(value, row, index){
				if(value==1){
					return '<span>公开招标</span>';
				}else if(value == 2){
					return '<span>邀请招标</span>';
				}
			}
		},{
			field: 'docGetStartTime', //招标文件主表的创建时间
			title: '资格申请文件获取开始时间',
			width: '180',
			align: 'center'
		},{
			field: 'docGetEndTime', //招标文件主表的创建时间
			title: '资格申请文件获取截止时间',
			width: '180',
			align: 'center'
		},{
			field:'',
			title:'操作',
			align: 'left',
			width: '150',
			formatter:function(value, row, index){
//				var str = "";
//				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>进入下载列表</button>';
//				str += strSee ; 
//				return str ;
				var strPay = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-credit-card"></span>去购买</button>';
				var strDown = '<button  type="button" class="btn btn-primary btn-sm btnDownload" data-index="'+index+'"><span class="glyphicon glyphicon-save"></span>下载</button>';
				if(row.isCanDownload == 1){
					return strDown;
				} else {
					return strPay;
				}
			}
		}
		],
	}) 
};



