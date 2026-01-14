var urlSuperviseInfo = config.AuctionHost + '/AuctionSuperviseController/findAuctionSupervise.do';
var urlSaveSupervise = config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var urlfindBidFileDownload = config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
var urlDownloadAuctionFile = config.FileHost + "/FileController/download.do"; //下载竞价文件地址
//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";

//保存审核人
let urlSaveResultAudits = top.config.AuctionHost +"/WorkflowController/saveWorkflowAccepList.do"
//撤回审核人
let urlRealBack = top.config.AuctionHost +"/WorkflowController/recallWorkflow";
//回显审核人
let urlGetResultAuditsUser =  top.config.AuctionHost +"/WorkflowController/reviewApprovePerson"

var createType = getUrlParam("createType") || 0;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
//是否需要业主代表字段
var IsSupervise = "0";
//var projectId = "";
//var packageId = "";
var employeeId = "";
var tenderType = '1';
var selectInputId;
//查询采购审核
var workflowLevel = 0;
//页面初始化
//function OfferSetInfo(obj) {
//	$("#projectCode").html(obj.projectCode);
//	$("#projectName").html(obj.projectName);
//	$("#packageNum").html(obj.packageNum);
//	$("#packageName").html(obj.packageName);
//	$("#auctionStartDate").html(obj.auctionStartDate);
//	$("#auctionEndDate").html(obj.auctionEndDate);
//	projectId = obj.projectId;
//	packageId = obj.id;
//	getSuperviseInfo();
//	//竞价文件提交信息列表
//	getOfferFileInfo(projectId);
//	setPurchaseFileDownloadDetail(packageId);
//	
//	if(createType == 1){
//		//非本人发布项目
//		$("input").attr("disabled", "disabled");
//		$("#btnSave").hide();
//	}
//}
var RenameData = {};//投标人更名信息
$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	getSuperviseInfo();
	//getResultAuditsLive();
	//竞价文件提交信息列表
	isShowSupplierInfo(projectId, packageId, '', 'offer', '1', function(data, html){
		if(data.isShowSupplier == 1){
			getOfferFileInfo(projectId);
			buyFileDetail(packageId);  //查看文件购买记录
			$('.BidSituationRecord').show();
		}else{
			$('.BidSituationRecord').hide();
			$("#AuctionFileCheck").closest('td').html(html)
			
		}
	});
	

	if(createType == 1) {
		//非本人发布项目
		$("input").attr("disabled", "disabled");
		$("#btnSave").hide();
	}
	auctionInfo()
})

function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: 1,
		},
		success: function(res) {
			var msgData = res.data;
			//是否显示当前最低报价
			if (msgData.auctionType > 0) {
				$('#isShowPrice').show();
				if(msgData.isShowPrice || msgData.isShowPrice == 0){
					$("[name='isShowPrice'][value='"+msgData.isShowPrice+"']").prop("checked","checked");
				}
			} else {
				$('#isShowPrice').hide();
			}
			$("#projectCode").html(msgData.projectCode);
			$("#projectName").html(msgData.projectName);
			$("#packageNum").html(msgData.packageNum);
			$("#packageName").html(msgData.packageName);
			$("#auctionStartDate").html(msgData.auctionStartDate);
			$("#auctionEndDate").html(msgData.auctionEndDate);
		}
	});
}

//查询业主代表详情数据
function getSuperviseInfo() {
	$.ajax({
		type: "post",
		url: urlSuperviseInfo,
		data: {
			projectId: projectId,
			packageId: packageId
		},
		async: false,
		dataType: "json",
		success: function(ret) {
			if(ret.success) {
				if(typeof(ret.data) != "undefined") {
					IsSupervise = ret.data.isSupervise;
					$('input:radio[name=isSupervise][value=' + IsSupervise + ']').attr('checked', 'true');
					if(IsSupervise == 0) {
						$("#Supervise").hide();
						$("#SuperviseInfo").hide();
					} else {
						employeeId = ret.data.superviseId;
						$("#Supervise").show();
						$("#SuperviseInfo").show();
						createSuperviseList(ret.data);
					}
				}
			}
		}
	});
}

//选择是否业主代表
function Is_Supervise(value) {
	if(value == 1) {
		//是
		$("#Supervise").show();
		$("#SuperviseInfo").show();

	} else {
		//否
		$("#Supervise").hide();
		$("#SuperviseInfo").hide();
	}
	IsSupervise = value;
};

//添加业主代表弹出层
function add() {
	var param = {
		isSupervise: 1, //是否业主代表，0为否，1为是
		selectBox: 'radio' //单选或多选，默认为多选
	}
	sessionStorage.setItem("param", JSON.stringify(param));
	top.layer.open({
		type: 2,
		title: '选择业主代表',
		area: ['900px', '600px'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		// btn: ['确定', '取消'],
		content: 'view/projectType/getEmployee.html',
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.getMsg(projectId, tenderType, function(){
				var employeeData = iframeWin.callbackEmployee();
				if(!employeeData) return;
				employeeId = employeeData[0].id;
				createSuperviseList(employeeData[0]);
				top.layer.close(index);
			});
		},
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var employeeData = iframeWin.callbackEmployee();
			if(!employeeData) return;
			employeeId = employeeData[0].id;
			createSuperviseList(employeeData[0]);
			top.layer.close(index);
		},

	});
}

function createSuperviseList(SuperviseData) {
	$("#SuperviseList").html("");
	var strHtml = "<tr>";
	strHtml += "<td class='text-center'>1</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.userName + "</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.logCode + "</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.tel + "</td>";
	if(typeof(SuperviseData.email) != "undefined") {
		strHtml += "<td>" + SuperviseData.email + "</td>";
	} else {
		strHtml += "<td></td>";
	}
	strHtml += "</tr>";
	$("#SuperviseList").html(strHtml);
}

$("#btnSave").click(function() {
	
	

	if(IsSupervise == 1 && employeeId == "") {
		parent.layer.alert("请选择业主代表！");
		return;
	}
	if(IsSupervise == 0) {
		employeeId = "";
	}
	var data = {
		projectId: projectId,
		packageId: packageId,
		isSupervise: IsSupervise,
		superviseId: employeeId,
		checkState: IsSupervise,
		isShowPrice:$("[name='isShowPrice']:checked").val()
	}

	$.ajax({
		type: "post",
		url: urlSaveSupervise,
		data: data,
		async: false,
		dataType: "json",
		success: function(ret) {
			if(ret.success) {
				//parent.layer.alert("保存成功！");
				parent.$('#OfferList').bootstrapTable('refresh');
				//				top.layer.closeAll();
				
				//		parent.layer.close(index);
				saveResultAudits();
				
			} else {
				parent.layer.alert("保存失败！");
				return;
			}
		}
	});
});

$("#btnClose").click(function() {
	var index = parent.layer.getFrameIndex(window.name);

	top.layer.close(index);

});

function getOfferFileInfo(projectId) {
	$.ajax({
		type: "get",
		url: top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do",
		dataType: 'json',
		data: {
			'projectId': projectId,
			'stage':'submit'
		},
		async: true,
		success: function(result) {
			if(result.success) {
				loadAuctionFileCheckState(result.data);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

function loadAuctionFileCheckState(data) {

	$("#AuctionFileCheck").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "5%",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "enterpriseName",
				halign: "left",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				halign: "center",
				title: "竞价文件",
				cellStyle: {
					css: {
						"padding": "0px"
					}
				},
				formatter: function(value, row, index) {
					if(!row.fileName || row.fileName == ''){
						return '';
					}else{
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
						var html = "<table class='table' style='border-bottom:none'>";
						for(var j = 0; j < filePathArr.length; j++) {
							let filesnames = fileNameArr[j].substring(fileNameArr[j].lastIndexOf(".") + 1).toUpperCase()
							html += "<tr>";
							html += "<td>" + fileNameArr[j] + "</td>"
							if(filePathArr[j]){
								html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
								if(filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
									html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
								}
								html += "</span></td>";
							}
							html += "</tr>"
						}
						html += "</table>";
						return html;
					}
				}
			},
			{
				title: "审核状态",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'>合格</div>";
					} else if(row.checkState == 0) {
						return "<div class='text-warning'>未审核</div>";
					} else {
						return "<div class='text-danger'>不合格</div>";
					}
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", data);
}

//预览文件
function previewFile(filePath) {
	openPreview(filePath);
}

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//挂载采购文件下载记录请求
function setPurchaseFileDownloadDetail(uid) {
	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data: {
			"packageId": uid
		},
		async: true,
		success: function(result) {
			if(result.success) {
				
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
}
//挂载采购文件下载记录
function setPurchaseFileDownloadDetailHTML(data) {

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
				field: "enterprise.enterpriseName",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}

			},
			{
				field: "purFile.fileName",
				align: "left",
				title: "文件名称",
			}, {
				field: "subDate",
				align: "center",
				title: "下载时间",
				width: "150",
			}
			/*, {
							title: "IP地址",
							align: "center",
							width: "100",
							field: 'ip'
						},
						{
							title: "地区",
							align: "center",
							width: "100",
							field: 'area'
						}*/
			,
			{
				title: "联系人",
				align: "center",
				width: "50",
				field: 'linkMan'
			},
			{
				title: "手机号",
				align: "center",
				width: "100",
				field: 'linkTel'
			}, {
				title: "邮箱",
				align: "center",
				width: "150",
				field: 'linkEmail'
			}
		]

	})
	$("#PurchaseFileDownload").bootstrapTable('load', data);
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//


function selectClick(e) {
	
	selectInputId = e;
	layer.open({
		type: 2,
		area: ['800px', '550px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		scrollbar: false, // 父页面 滚动条禁止
	//	content: 'Auction/Auction/Agent/AuctionProjectPackage/model/getResultAuditList.html',
		content: 'getResultAuditList.html',
		title: '选择流程审批人员',
		success: function(layero, index) {
			var body = parent.layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.$("#employeeId").val(employeeId);
			iframeWin.BindWorkflowCheckerInfo(employeeId);
		}
	});
}



function getResultAuditsLive() {
	var table = $("#resultAuditList");
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + '/WorkflowController/findjjcgjgWorkflowLevel',
		async: false,
		success: function(res){

			if(res.success) {
				if(res.data[0]) {
					workflowLevel = res.data[0].workflowLevel;
					for(var i = 1; i <= workflowLevel; i++) {
						console.log(i);
						var tr = document.createElement("tr");
						//<td class="th_bg" style="text-align: left;">一级审核员</td>
						var str = "";
						switch(i) {
							case 1:
								str = "一"
								break;
							case 2:
								str = "二"
								break;
							case 3:
								str = "三"
								break;
							case 4:
								str = "四"
								break;
						}

						tr.innerHTML = "<td  class = 'th_bg' style= 'text-align: left;'>" + str + "级审核员" + "</td>";
						var td = document.createElement("td");
						td.hidden = true;
						td.innerHTML = "<input hidden='true'  id=" + "selectLv" + i + "    style='width: 100%;height: 100%;border: none;'readonly  /> "
						tr.append(td);
						var td2 = document.createElement("td");
						td2.innerHTML = "<input   id=" + "selectLvName" + i + "  onclick = 'selectClick(this.id)'    style='width: 100%;height: 100%;border: none;'readonly  /> "
						tr.append(td2);
						table.append(tr)

					}
					getResultAuditsUser();

				}
			}
		}
	});

}

//添加人员回调函数
function callBackEmployee(ids, names) {
	layer.closeAll();

	$("#" + selectInputId).val(names);

	let id = selectInputId.replace("Name", "");

	$("#" + id).val(ids);

}

//采购审核撤回
$("#reBlack").click(function(){
	$.ajax({
		type:"post",
		dataType: 'json',
		url:urlRealBack,
		async:false,
		data:{
			'businessId':packageId,
			'workflowResult':2
		},
		success:function(res){
			
			if(res.success){
				
				//getResultAuditsUser();
				parent.layer.msg(res.message);
				location.reload();	
			}
		}
	})
})

//保存采购审核信息

function saveResultAudits() {

	var data = [];
	var js="";
	for(var i = 1; i <= workflowLevel; i++) {
		let workflowLevel = $("#selectLv" + i).val();
		if(workflowLevel.length==0){
			parent.layer.alert("添加审批人员！");
			return false;
		}
		let p = {
			"employIds": $("#selectLv" + i).val(),
			'level': i
		}
		data.push(p);
		
		// js = JSON.stringify(data)
	}
	
	$.ajax({
		type:"post",
		dataType: 'json',
		url:urlSaveResultAudits,
		async:false,
		data:{'levelList':JSON.stringify({'levelMsg':data,
			'packageId':packageId})},
		success:function(res){
			console.log(res);
			var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
		}
	});
	
	
	
}

//回显采购
function getResultAuditsUser(){
	$.ajax({
		type:"get",
		dataType: 'json',
		url:urlGetResultAuditsUser,
		async:false,
		data:{
			'businessId':packageId
		},
		success:function(res){
			console.log(res)
			if(res.success){
				let js = res.data;
				for(var i=0;i<js.length;i++){
					let j = js[i];
					let workflowLevel = j.workflowLevel;
					let name = j.userName;
					let employeeId = j.employeeId;
					let eid = i+1;
					$("#selectLvName"+eid).val(name);
					$("#selectLv"+eid).val(employeeId);
//						var index = parent.layer.getFrameIndex(window.name);
//					window['layui-layer-iframe' + layerIndex].location.reload();
				
				}
			}
		}
	})
}
