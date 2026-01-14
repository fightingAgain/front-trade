var urlfindChargePageList = top.config.bidhost + "/OfferController/findOfferOrderList.do" //询比采购情况明细  平台服务费缴纳
var urlfindBidFileDownload = top.config.bidhost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
var urlfindBuyFile = top.config.bidhost + "/BidFileDownloadController/findBuyBidFileList.do"
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //采购文件分页
var findProjectInfo = config.bidhost +'/ProjectPackageController/findPackageInfo.do';//项目信息
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('id');
var examTypeList = getUrlParam('examType');//阶段资格审查方式 0资格预审  1后审
/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function() {
	
	//查询项目包件信息
	$.ajax({
		type: "post",
		url: findProjectInfo,
		dataType: 'json',
		data: {
			id :packageId
		},
		async: false,
		success: function(result) {
			if(result.success) {
				//显示数据
				du(result.data);
			}
		}
	});	
	
	
})

function du(rowData){
	
	$("div[id]").each(function() {
		$(this).html(rowData[this.id]);
	});
	isShowSupplierInfo(projectId, packageId, examTypeList, 'buy', '0', function(data, html){
		if(data.isShowSupplier == 1){
			setPurchaseFileDownloadDetail(rowData); //挂载采购文件下载记录明细
		}else{
			$("#PurchaseFileDownload").closest('td').html('<div class="red" style="text-align: center;">'+html+'</div>')
		}
	})
	
	if(examTypeList==0){		
		$('.examTitles').html('资格预审文件购买情况')
	}else{	
		$('.examTitles').html('询比采购文件购买情况')
	}
};
//供应商查询购买信息请求
function setPurchaseFileDownloadDetail(data) {	
	//参数对象
	var dataParam = {
		"packageId": packageId,
		"examType":examTypeList,
		'checkType': data.examType
	}
	
	$.ajax({
		type: "post",
		url: urlfindBuyFile,
		dataType: 'json',
		data: dataParam,
		async: false,
		success: function(result) {
			if(result.success) {
				//处理数据按微信、支付宝支付分组，若支付用户id重复，红字显示
				var arr = result.data;
				var colors = ["red", "#EE7600", "#9400D3", "green", "#EE00EE", "#8B1A1A"];
				var isRepeat = false;
				for(var i = 0; i < arr.length - 1; i++){
					isRepeat = false;
					if(arr[i].color){
						continue;
					}
					for(var j = i+1; j < arr.length; j++){
						if(arr[j].color){
							continue;
						}
						if(arr[i].payId == arr[j].payId){
							if(colors.length > 0){
								arr[i].color = colors[0];
								arr[j].color = colors[0];
							} else {
								arr[i].color = "red";
								arr[j].color = "red";
							}
							isRepeat = true;
						}
					}
					if(isRepeat){
						colors.splice(0,1);
					}
				}
				setPurchaseFileDownloadDetailHTML(arr) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
	
	
}

window.operateEvents = {
	
	"click #downFile": function(e, value, row, index) {
	
		parent.layer.open({
			type: 2,
			title: '查看详情',
			area: ['1100px','600px'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			closeBtn: 1,
			content: 'Auction/common/Agent/BidNotice/modal/BidDownloadFileInfo.html?examType='+examTypeList+'&packageId='+packageId+'&enterpriseId='+row.enterpriseId+'&projectId='+projectId,
			success:function(layero,index1){    
	        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	}
		});
	}
}

//供应商文件购买情况
function setPurchaseFileDownloadDetailHTML(data) {
	if(data.length>0){
		var RenameData = getBidderRenameData(packageId);//供应商更名信息
	}
	$("#PurchaseFileDownload").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "企业名称",
				align: "left",
				field: "enterpriseName",
				formatter: function(value, row, index){
					if(isReminderCollection(row.enterpriseCode)){
						return '<span class="glyphicon glyphicon-exclamation-sign" style="color: #ccbb09;margin-right: 5px"></span>'+showBidderRenameList(row.enterpriseId, row.enterpriseName, RenameData, 'body')
					}else{
						return showBidderRenameList(row.enterpriseId, row.enterpriseName, RenameData, 'body')
					}
					
				}
			},
			{
				title: "购买时间",
				align: "center",
				field: "subDate",
				width: "160",

			},
			{
				title: "购买情况",
				align: "center",
				width: "87",
				field: 'orderStatus',
				formatter: function(value, row, index) {
					if(value == "0") {
						return '<span style="color:green;">无需购买</span>';
					} else if(value == "1") {
						return '<span style="color:green;">已购买</span>';
					}else if(value == "2") {
						return '<span style="color:red;">未购买</span>';
					}
				}
			},
			{
				title: "下载次数",
				align: "center",
				width: "80",
				field: 'buyCount'
			},
			{
				title: "支付方式",
				align: "center",
				width: "87",
				field: 'payFrom',
				formatter: function(value, row, index) {
					if(value == "WEIXIN") {
						return '<span>微信</span>';
					} else if(value == "ZHIFUBAO") {
						return '<span>支付宝</span>';
					} else {
						return "";
					}
				}
			},
			{
				title: "支付用户ID",
				align: "center",
				field: 'payId',
				formatter: function(value, row, index) {
					if(value){
						if(row.color){
							return "<span style='color:"+row.color+"'>"+value+"</span>";
						} else {
							return value;
						}
					} else {
						return "";
					}
				}
			},
			{
				
				title: "操作",
				align: "center",
				width: "80",
				field: 'action',
				events: operateEvents,
				formatter: function(value, row, index) {
					return "<button id='downFile' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'></span>查看</button>"
			 	}
			}
		]

	})
	$("#PurchaseFileDownload").bootstrapTable('load', data);
}
