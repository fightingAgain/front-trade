function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
 }
}
var PurchaseId = getQueryString("key");
var searchUrlPackage = config.bidhost + '/PurchaseController/findProjectPackage.do'; //
var searchUrlPackageDetail = config.bidhost + '/PurchaseController/findPackageDetailed.do';
var searchUrlPackageCheckList = config.bidhost + '/PurchaseController/findPackageCheckList.do';
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var searchUrlCheckListItem = config.bidhost + '/PurchaseController/findPackageCheckItem.do';
var downloadFileUrl = config.bidhost + '/FileController/download.do'; //下载文件接口
var sourceFundsUrl = config.Syshost + "/OptionsController/list.do"; //资金来源接口
var saveWorkflow = config.bidhost + '/WorkflowController/saveWorkflowAccep.do' //提交审核人接口
var WorkflowUrl = config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var urlWorkflowAccep = config.bidhost + "/WorkflowController/findWorkflowAccep.do" //查询审核等级
var findPurchaseUrl=config.bidhost + '/PurchaseController/findPurchase.do'

//包件信息
var packageInfo = [];
//评审内容
var packageCheckListInfo = [];
//明细信息
var packageDetailInfo = [];
//采购文件信息
var FileInfo = [];

var CheckListItemInfo =[];//评价项数据

var sourceFundsId = ""; //资金来源Id

var workflowLevel = ""; //查询评审人员  审核等级需升级 

var currentworkflowLevel = "";// 当前评审等级 提交审核用

var isworkflowAuditor = "" //判断是选择提交审核人员  流程结束  不提交 未结束 不提交

//初始化
$(function() {   
	//初始化公告及包件信息
	Purchase();

	//审核记录
//	bindRecord(str);

})
var projectIds = "";
var Is_Public_data = [];
var AccessoryList="";
//初始化方法
function Purchase() {
	$.ajax({
		url: findPurchaseUrl, //查看 详细信息
		type: 'get',
		dataType: 'json',
		data: {
			"id": PurchaseId,
			'enterpriseType': 0,
		},
		success: function(data) {
			var table_data = ""			
			if(data.rows.length > 0) {
				$('div[id]').each(function() {
					$(this).html(data.rows[0][this.id]);
				});
				$('div[id]').each(function() {
					$(this).html(data.rows[0].project[this.id]);
				});

				sourceFundsId = data.rows[0].sourceFundsId; //资金来源Id
				sourceFunds(); //资金来源
				//采购类型
				$("#tenderType").html("询价采购")
				//报价轮数
				$("#priceCount").html("一轮报价")
				if(data.rows[0].project.projectSource==0){
					$("#projectSource").html("首次发布公告")
				}else{
					$("#projectSource").html("重新采购")
				} 
				$("input[name='project.tenderType']").eq(data.rows[0].project.tenderType).attr("checked", true)
				$('supplierCount[name="supplierCount"] option').eq(data.rows[0].supplierCount).attr("selected", true)
				$("input[name='projectState']").eq(data.rows[0].project.projectState).attr("checked", true)
				$("input[name='isPublic']").eq(data.rows[0].isPublic).attr("checked", true)
				$("input[name='project.isAgent']").eq(data.rows[0].project.isAgent).attr("checked", true);
				switch(data.rows[0].project.projectType) {
					case 0:
						$("#projectType").html("工程");
						break;
					case 1:
						$("#projectType").html("货物");
						break;
					case 2:
						$("#projectType").html("服务");
						break;
				}
				if(data.rows[0].project.isAgent==0){
					$(".agency").hide()
					
				}else{
					$(".agency").show()
				}				
				if(data.rows[0].isPublic > 1) {
					Public(data.rows[0].projectId)
				}
				getPackageInfo(data.rows[0].projectId)
				projectIds = data.rows[0].projectId

			}
		}
	});
}
function Public(uid) {
	table_data = "";
	$.ajax({
		url: config.bidhost + '/PurchaseController/findProjectSupplierList.do',
		type: 'get',
		dataType: 'json',
		data: {
			"projectId": uid
		},
		success: function(data) {			
			Is_Public_data = data.data;
			if(data.data.length > 0) {
				$(".yao_btn").removeClass('none')
				$("#yao_table").removeClass('none')
				table_data = '<thead><tr>' +
					'<th>企业名称</th>' +
					'<th>联系人</th>' +
					'<th>联系电话</th>' +
					'<th>认证状态</th>' +
					'<th>通知时间</td>' +
					'</tr></thead>'
				for(var i = 0; i < Is_Public_data.length; i++) {
					if(Is_Public_data[i].enterprise.enterpriseLevel == 0) {
						var enterpriseLevel = "未认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel == 1) {
						var enterpriseLevel = "提交认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel == 2) {
						var enterpriseLevel = "受理认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel == 3) {
						var enterpriseLevel = "已认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel == 4) {
						var enterpriseLevel = "认证2"
					};
					table_data += '<tr>' +
						'<td>' + Is_Public_data[i].enterprise.enterpriseName + '</td>' +
						'<td>' + Is_Public_data[i].enterprise.agent + '</td>' +
						'<td>' + Is_Public_data[i].enterprise.agentTel + '</td>' +
						'<td>' + enterpriseLevel + '</td>' +
						'<td>' + Is_Public_data[i].enterprise.subDate + '</td>' +
						'</tr>'
				}
				$("#tableList").html(table_data)
			}
		}
	});
};

//查询包件信息
function getPackageInfo(projectId) {
	$.ajax({
		type: "post",
		url: searchUrlPackage,
		async: true,
		dataType: 'json',
		data: {
			"projectId": projectId
		},
		success: function(data) {
			packageInfo = data.rows;		
			var strHtml = "";
			for(i = 0; i < data.rows.length; i++) {
				strHtml += "<button class='btn btn-default' onclick=setPackageInfo('" + i + "')>包件" + (i + 1) + "</button>";
				if(i < data.rows.length - 1) {
					strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
				}
				//有几个包件就追加几个数组，用来放评审内容
				packageCheckListInfo.push(
					{
						id:data.rows[i].id,
						data:[],
						CheckListItemInfo:[]
					}
				)
				//有几个包件就追加几个数，用来存放明细表的数组
				packageDetailInfo.push(
					{
						id:data.rows[i].id,
						data:[]
					}
				)
			}
			$("#projectPackage").html(strHtml);

			if(data.rows.length > 0) {
				setPackageInfo(0);
			}
		}

	});
}

function setPackageInfo(obj) {
	var data = packageInfo[obj];
	
	$("#packageName").html(data.packageName);
	$("#purchaseButton").html("<button class='btn btn-primary' onclick=purchasePrice('" + obj + "')>我要报价</button>");
	$("#packageNum").html(data.packageNum);
	if(data.checkPlan == 0) {
		$("#checkPlan").html("综合评分法");
	}else if(data.checkPlan == 1){
		$("#checkPlan").html("最低价法");
	}else{
		$("#checkPlan").html("经评审的最低价法(价格评分)");
	}
	if(data.serviceChargePay == 0) {
		$("#serviceCharge").html(data.serviceCharge);
	} else {
		$("#serviceCharge").html("<span style='color:red'>由成交供应商缴纳，详情见采购文件</span>");
	}

	$("#checkDetail").html(data.checkDetail);

	getPackageDetail(data.id,obj); //明细信息
	getPackageCheckList(data.id,obj); //评审内容
	getAccessoryList(data.id); //附件信息
	// 	getFile(data.id);

}

//查询明细信息
function getPackageDetail(packageId,obj) {
	if(packageDetailInfo[obj].data.length==0){
		$.ajax({
			type: "post",
			url: searchUrlPackageDetail,
			async: false,
			dataType: 'json',
			data: {
				"packageId": packageId
			},
			success: function(data) {
				packageDetailInfo[obj].data = data.rows;			
			}
		});
	};
	var packageDetailInfos=packageDetailInfo[obj].data;
	var strHtml=""
	for(i = 0; i < packageDetailInfos.length; i++) {
		strHtml += "<tr><td>" + (i + 1) + "</td>";
		strHtml += "<td>" + packageDetailInfos[i].detailedName + "</td>";
		strHtml += "<td>" + packageDetailInfos[i].detailedVersion + "</td>";
		strHtml += "<td class='text-center'>" + packageDetailInfos[i].detailedCount + "</td>";
		strHtml += "<td class='text-center'>" + packageDetailInfos[i].detailedUnit + "</td>";
		if(packageDetailInfos[i].detailedContent == undefined) {
			strHtml += "<td>无</td>";
		} else {
			strHtml += "<td>" + packageDetailInfos[i].detailedContent + "</td>";
		}
		// 判断是否有分项信息
		if(packageDetailInfos[i].itemCount == 0) {
			strHtml += "<td align='center'>暂无分项信息</td>";
		} else {
			strHtml += "<td class='text-center' align='center'><a href='javascript:void(0)' onclick=findPackageDetailItem(\'" + packageDetailInfos[i].id + "\')>分项信息</a></td></tr>";
		}
		
	}
	$("#packageDetail").html(strHtml);
}

//查询评审内容
function getPackageCheckList(packageId,obj) {	
	if(packageCheckListInfo[obj].data.length==0){
		$.ajax({
		type: "post",
		url: searchUrlPackageCheckList,
		async: false,
		dataType: 'json',
		data: {
			"packageId": packageId
		},
		success: function(data) {			
			packageCheckListInfo[obj].data=data.rows						
		}
	});
	};
	var packageCheckListInfos=packageCheckListInfo[obj].data;
	var strHtml=""
	for(i = 0; i < packageCheckListInfos.length; i++) {
		strHtml += '<li role="presentation" ';
		if(i == 0) {
			strHtml += ' class="active" ';
		}
		strHtml += ' onclick=setpackageCheckListInfo(' + i + ','+ obj +')><a href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfos[i].checkName + '</a></li>';		
	    packageCheckListInfo[obj].CheckListItemInfo.push(
	    	{
	    		id:packageCheckListInfos[i].id,
	    		data:[]
	    	}
	    )
	
	}
	$("#checkList").html(strHtml);
    setpackageCheckListInfo(0,obj);
};

//查看评审内容详细信息
function setpackageCheckListInfo(obj,Num) {
	if(packageCheckListInfo[Num].data[obj].checkType == 0) {
		$("#checkType").html('合格制');
	} else if(packageCheckListInfo[Num].data[obj].checkType == 1) {
		$("#checkType").html('评分制');
	} else if(packageCheckListInfo[Num].data[obj].checkType == 2) {
		$("#checkType").html('偏离制');
	}
	if(packageCheckListInfo[Num].CheckListItemInfo[obj].data.length==0){
		$.ajax({
			type: "post",
			url: searchUrlCheckListItem,
			async: false,
			dataType: 'json',
			data: {
				packageCheckListId:packageCheckListInfo[Num].data[obj].id
			},
			success: function(data) {
				packageCheckListInfo[Num].CheckListItemInfo[obj].data= data.rows;
														
			}
		});
	};
	var CheckListItemInfos=packageCheckListInfo[Num].CheckListItemInfo[obj].data
	var strHtml=""
	 if(packageInfo[Num].checkPlan==1){
	 	var textDa="是否关键选择"
	 }else if(packageInfo[Num].checkPlan==0){
	 	var textDa="分值"
	 }
	strHtml='<thead>'
				+'<tr>'
					+'<th class="text-center">序号</th>'
					+'<th class="text-center">评价内容</th>'
					+'<th class="text-center">评价标准</th>'
					+'<th class="text-center">'+textDa+'</th>'
					+'<th class="text-center">备注</th>'
				+'</tr>'
		   +'</thead>'
    for(i = 0; i < CheckListItemInfos.length; i++) {
		var str = "";
		if(CheckListItemInfos[i].isKey == 0) {
			str = '<input type="checkbox" value="是" disabled="disabled" checked/>是';
		} else if(CheckListItemInfos[i].isKey == 1) {
			str = '<input type="checkbox" value="否" disabled="disabled" /> 否';
		}
        
        if(packageInfo[Num].checkPlan==1){
        	strHtml += "<tr><td>" + (i + 1) + "</td>";
			strHtml += "<td>" + CheckListItemInfos[i].checkTitle + "</td>";
			strHtml += "<td>" + CheckListItemInfos[i].checkStandard + "</td>";
			strHtml += "<td class='text-center'>" + str + "</td>";
			strHtml += "<td class='text-center'>" + CheckListItemInfos[i].remark + "</td></tr>";
	    }else if(packageInfo[Num].checkPlan==0){
	    	strHtml += "<tr><td>" + (i + 1) + "</td>";
			strHtml += "<td>" + CheckListItemInfos[i].checkTitle + "</td>";
			strHtml += "<td>" + CheckListItemInfos[i].checkStandard + "</td>";
			strHtml += "<td class='text-center'>" + CheckListItemInfos[i].score + "</td>";
			strHtml += "<td class='text-center'>" + CheckListItemInfos[i].remark + "</td></tr>";
	    }
		
		
	}
    $("#packageCheckList").html(strHtml);
	
}

//附件信息
function getAccessoryList(data) {

	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: true,
		dataType: 'json',
		data: {
			"modelId": data,
			"modelName":"jj_pur_project_package"
		},
		success: function(data) {			
			AccessoryList = data.data;
			if(AccessoryList.length == 0) {
				$("#noAccessoryList").show(); //无附件
			} else {
				var html = "";
				for(var i = 0; i < AccessoryList.length; i++) {
					html += "<tr>";
					html += "<td align='center'>" + (i + 1) + "</td>";
					html += "<td><a href='javascript:void(0)' onclick='openAccessory(\"" + i + "\">"+AccessoryList[i].fileName+"</a></td>";
					html += "</tr>";
				}
				$("#AccessoryList").html(html);
			}

		}
	});

}
//点击下载附件信息
function openAccessory($index) {
	var filename=AccessoryList[$index].fileName,filePath=AccessoryList[$index].filePath;
	var url = config.bidhost + "/FileController/download.do" + "?fname=" + filename + "&ftpPath=" + filePath;
	parent.layer.confirm('是否下载', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
	  window.location.href = url;
	  parent.layer.close(index)
	}, function(index){
	   parent.layer.close(index)
	});
	

}
//点击查看分项信息展示
function findPackageDetailItem(data) {

	//保存packageDetailedId

	sessionStorage.setItem("packageDetailedId", data);
	//打卡弹出窗口
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '查看分项信息',
		area: ['300px', '400px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: '0502/Bid/Purchase/model/packagedeatailAudit.html',
	});
}

//资金来源数据获取
function sourceFunds() {
	$.ajax({
		url: sourceFundsUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"optionName": "资金来源"
		},
		success: function(data) {
			for(var i = 0; i < data.data.length; i++) {
				if(sourceFundsId == data.data[i].id) {
					$("#sourceFundsId").html(data.data[i].optionText);
					break;
				}
			}
		}
	});
}