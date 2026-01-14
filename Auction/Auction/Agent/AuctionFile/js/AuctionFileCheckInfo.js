//获取 可递交竞价文件审核信息
var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do";

//上传可递交竞价问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";

//竞价文件审核信息
var urlAuctionFileCheckRecord = top.config.AuctionHost + "/AuctionFileController/findAuctionFileRecode.do";

//下载竞价文件地址
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do";
var exportUrl =  top.config.AuctionHost + '/AuctionFileController/exportHistoryFile.do';//导出
var historyUrl = top.config.AuctionHost + '/AuctionFileHisController/findHisListForPur.do';//文件递交记录
var packageUrl =  top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionProjectPackageList.do';//查询包件列表
var downloadSupplierFileUrl =  top.config.AuctionHost + '/AuctionFileController/downloadSupplierFile';//供应商文件一键导出
var fileData=[];
var createType = $.getUrlParam("createType");
var projectId = $.getUrlParam("projectId");
var checkType = $.getUrlParam("type");
var RenameData = {};//投标人更名信息
$(function() {
	//获取存储的竞价文件id	
	var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	RenameData = getBidderRenameData(projectId);//投标人更名信息
	//页面显示项目名称编号截止时间
	getAuctionFileInfo(); //挂载审核文件
	loadAuctionFileCheckRecord(); //挂载审核记录
	// if(checkType == 'check'){//查看
		$('.handBox').show();
		getFileList();//文件递交记录
	// }
	$('#btnExport').click(function(){
		if($('#fileHandList').hasClass('JD_view')){
			window.location.href = $.parserUrlForToken(exportUrl+'?projectId='+projectId + '&tenderType=1&isIp=1')
		}else{
			window.location.href = $.parserUrlForToken(exportUrl+'?projectId='+projectId + '&tenderType=1')
		}
	});
	$("#btnDownloadSupplierFile").click(function(){
		var newUrl=$.parserUrlForToken(downloadSupplierFileUrl+"?tenderType=1&projectId="+projectId)
		window.location.href = newUrl;
	});
	$.ajax({
		type: "get",
		url: packageUrl,
		dataType: 'json',
		data: {"projectId": projectId},
		async: true,
		success: function(result) {
			if(result.success) {
				if(result.data && result.data.length){
					package(result.data)
				}
			} else {
				parent.layer.alert("温馨提示："+result.message);
			}
		}
	})
})
//包件的按钮
function package(packageData) {
	if (packageData.length > 0) {
		var strHtml = "";
		for (i = 0; i < packageData.length; i++) {
			if (i == 0) {
				strHtml += "<button class='btn btn-default btn-primary packageBtn' onclick=setPackageInfo('" + packageData[i].id + "',this) style='margin-bottom: 5px;'>包件" + packageData[i].packageName + "</button>";
			} else {
				strHtml += "<button class='btn btn-default packageBtn' onclick=setPackageInfo('" + packageData[i].id + "',this)  style='margin-bottom: 5px;'>" + packageData[i].packageName + "</button>";
			}

			if (i < packageData.length - 1) {
				strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
		}
		$("#packageBtn").html(strHtml);
		setPackageInfo(packageData[0].id);
	}
}
function setPackageInfo(id, thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary');
	warnLists(id, 'jj', true, false, true,projectId,'1','1');
}
//挂载审核文件
function getAuctionFileInfo(data) {
	var dataParam = {
		"projectId": projectId,
		'stage':'submit'
	}
	$.ajax({
		type: "get",
		url: urlAuctionFile,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				fileData=result.data;
				if(fileData.length>0){
					$("#btnDownloadSupplierFile").show();
				}else{
					$("#btnDownloadSupplierFile").hide();
				}
				$("#fileEndDate").html(fileData[0].fileEndDate);
				$("#fileCheckEndDate").html(fileData[0].fileCheckEndDate);
				if (fileData[0].projectSource > 0) {
					$("#projectName").html(fileData[0].projectName + '<span class="red">(重新竞价)</span>');
				} else {
					$("#projectName").html(fileData[0].projectName);
				}
				$("#projectCode").html(fileData[0].projectCode);
				loadAuctionFileCheckState(result.data);
			} else {
				parent.layer.alert("温馨提示："+result.message);
			}
		}
	})
}

//挂载竞价文件审核状态
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
				halign: "center",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				halign: "center",
				title: "竞价文件",			
				formatter: function(value, row, index) {
					if( row.fileName){
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						
						var html = "";
						for(var j = 0; j < filePathArr.length; j++) {						
							var c = j + 1;
							html += '<div>' + c + '、' + '<a class="openAccessory" onclick="openAccessory('+ index +','+ j +')"  href="javascript:void(0);">' + fileNameArr[j] + '</a></div>';
						}
						return html;
					}else{
						return '';
					}
				}
			}, /*{
				field: "ip",
				halign: "center",
				title: "上传IP"
			}, {
				field: "areas",
				halign: "center",
				title: "地区"
			},*/
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
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'>已审核</div>";
					} else if(row.checkState == 0) {
						if(row.auditTimeout == "审核超时") {
							return "<div class='text-danger'>已超时</div>";
						} else {
							if(createType != undefined && createType == 1) {
									return "<div class='text-danger'>待审核</div>";
							}else{
								
								return "<button type='button' onclick='setAuctionFileCheckState(\"" + row.projectId + "\",\"" + row.id + "\")' class='btn btn-primary btn-sm'>审核</span> </button>";
							}
						}
					} else {
						return "<div class='text-success'>已审核</div>";
					}
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", data);
}
function openAccessory(_index,_j){
	var filePathArr= fileData[_index].filePath.split(",");
	var fileNameArr= fileData[_index].fileName.split(",");
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePathArr[_j] + "&fname=" + fileNameArr[_j];
	window.location.href=$.parserUrlForToken(newUrl);	
}
//挂载竞价文件审核记录
function loadAuctionFileCheckRecord(data) {
	var dataParam = { //获取projectid
		"projectId": projectId,
		"enterpriseType": '02' //0是采购人 1 是供应商
	}
	$.ajax({
		type: "get",
		url: urlAuctionFileCheckRecord,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				var newData = result.data;
				loadAuctionFileCheckRecordTable(newData);
			} else {
				parent.layer.alert("温馨提示："+result.message);
			}
		}
	})
}

function loadAuctionFileCheckRecordTable(data) {
	$("#AuctionFileCheckRecord").bootstrapTable({
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
				halign: "center",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}
			},
			{
				field: "checkResult",
				align: "center",
				title: "审核状态",
				formatter: function(value, row, index) {
					if(value == "0") {
						return "<div class='text-success'>合格</div>"
					} else {
						return "<div class='text-danger'>不合格</div>"
					}
				}
			},
			{
				field: "checkContent",
				title: "审核意见",
				halign: "center"
			},
			{
				field: "checkDate",
				title: "审核时间",
				align: "center"
			},
			{
				field: "userName",
				title: "审核人",
				align: "center"
			}
		]
	})
	$("#AuctionFileCheckRecord").bootstrapTable("load", data);

}

//审核文件
function setAuctionFileCheckState(projectId, id) {
	parent.layer.confirm('审核当前文件', {
		btn: ['合格', '不合格', '关闭'],
		btn1:function() { //合格
			var dataParam = {
				"projectId": projectId, //审核结果对象
				"id": id,
				"checkResult": "0" //审核结果 0通过 1 不通过
			}
			$.ajax({
				type: "get",
				url: urlAuctionFileCheckStateUpdate,
				datatype: 'json',
				data: dataParam,
				async: true,
				success: function(result) {
					if(result.success) {
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
						}
						
						getAuctionFileInfo(); //刷新列表
						loadAuctionFileCheckRecord(); //重载审核记录
						parent.$('#AuctionFileCheckList').bootstrapTable('refresh');
						parent.layer.alert('温馨提示：审核成功！');
						//刷新表格						
					} else {
						parent.layer.alert(result.message);
					}
				}
			})
		},
		btn2:function() { //不合格

			parent.layer.prompt({
				formType: 2,
				value: '',
				title: '请输入审核意见',
				area: ['250px', '150px'] //自定义文本域宽高
			}, function(value, index, elem) {

				if(value.length > 150) {
					parent.layer.alert("审核意见不能多于150字！")
					return;
				}
				
				var dataParam = {
					"projectId": projectId,
					"id": id,
					"checkResult": "1", //审核结果 0通过 1 不通过
					"checkContent": value
				}

				$.ajax({
					type: "get",
					url: urlAuctionFileCheckStateUpdate,
					datatype: 'json',
					data: dataParam,
					async: true,
					success: function(result) {
						if(result.success) {
							if(top.window.document.getElementById("consoleWindow")){
								var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
								var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    			dcmt.getDetail();
							}
							parent.layer.close(index);
							getAuctionFileInfo(); //重新刷新列表
							loadAuctionFileCheckRecord(); //重载审核记录
							parent.$('#AuctionFileCheckList').bootstrapTable('refresh');
							parent.layer.alert('温馨提示：审核成功');
						} else {
							parent.layer.alert(result.message);
						}

					}
				})
			});
		},
		btn3:function() {
			parent.layer.close();
		}
		}
	);
}

//获取项目的projectId
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}

//文件递交记录
function getFileList() {
	var dataParam = {
		"projectId": projectId,
		"tenderType": 1
	}
	$.ajax({
		type: "get",
		url: historyUrl,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				if(result.data){
					fileHandTable(result.data);
				}
				
			} else {
				parent.layer.alert("温馨提示："+result.message);
			}
		}
	})
}
function fileHandTable(data) {
	var html = '<table class="table table-bordered">';
	html += '<tr><th style="width:50px;text-align: center;">序号</th><th style="width:150px;">供应商名称</th><th style="width:100px;text-align: center;">社会信用代码</th><th style="width:200px;">竞价文件名称</th><th style="width:150px;text-align: center;">递交/撤回时间</th><th style="width:100px;text-align: center;">操作类型</th>'
	/* if($('#fileHandList').hasClass('JD_view')){
		html += '<th style="width:120px;text-align: center;">递交IP</th>'
	} */
	html += '</tr>'
	for(var n = 0;n<data.length;n++){
		
		for(var i = 0;i < data[n].simpleFiles.length;i++){
			html += '<tr>'
			if(i == 0){
				html += '<td style="width:50px;text-align: center;" rowspan="'+data[n].simpleFiles.length+'">'+(n+1)+'</td>';
				html += '<td style="width:150px;" rowspan="'+data[n].simpleFiles.length+'">'+showBidderRenameList(data[n].enterpriseId, data[n].enterpriseName, RenameData, 'body')+'</td>';
				html += '<td style="width:100px;text-align: center;" rowspan="'+data[n].simpleFiles.length+'">'+data[n].enterpriseCode+'</td>';
			}
			var texts = '';
			for(var j = 0;j < data[n].simpleFiles[i].files.length;j++){
				var name = data[n].simpleFiles[i].files[j].split(',');
				for(var k = 0;k < name.length; k++){
					texts += '<div>'+(k+1) + '.' + name[k] +'</div>'
				}
				// texts += (i + 1) + '.' + data[n].simpleFiles[i].files[j];
			};
			html += '<td style="width:200px;">'+texts+'</td>';
			html += '<td style="width:150px;text-align: center;">'+data[n].simpleFiles[i].date+'</td>'
			html += '<td style="width:100px;text-align: center;">'+(data[n].simpleFiles[i].rebackType==1?'递交':data[n].simpleFiles[i].rebackType==2?'撤回':'')+'</td>'
			/* if($('#fileHandList').hasClass('JD_view')){
				html += '<td style="width:120px;text-align: center;">'+data[n].simpleFiles[i].ip+'</td>'
			} */
			html += '</tr>'
		};
		
	}
	
	
	
	html += '</table>';
	$(html).appendTo('#fileHandList')
	/* $("#fileHandList").bootstrapTable({
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
				halign: "center",
				title: "供应商名称"
				
			},
			{
				field: "enterpriseCode",
				align: "center",
				title: "社会信用代码",
			},
			{
				field: "",
				title: "竞价文件名称",
				halign: "center",
				formatter: function(value, row, index) {
					// var html = '<table class="table table-bordered">';
					var html = '';
					for(var i = 0;i < row.simpleFiles.length;i++){
						var texts = '';
						for(var j = 0;j < row.simpleFiles[i].files.length;j++){
							texts += (j + 1) + '.' + row.simpleFiles[i].files[j];
						};
						// html += '<tr><td>'+texts+'</td></tr>'
						html += '<td>'+texts+'</td>'
					};
					// html += '</table>'
					return html
				}
			},
			{
				field: "simpleFiles",
				title: "递交时间",
				align: "center",
				formatter: function(value, row, index) {
					// var html = '<table class="table table-bordered">';
					var html = '';
					for(var i = 0;i < row.simpleFiles.length;i++){
						// html += '<tr><td>'+row.simpleFiles[i].date+'</td></tr>'
						html += '<td>'+row.simpleFiles[i].date+'</td>'
					};
					// html += '</table>'
					return html
				}
			},
			{
				field: "simpleFiles",
				title: "递交IP",
				align: "center",
				formatter: function(value, row, index) {
					// var html = '<table class="table table-bordered">';
					var html = '';
					for(var i = 0;i < row.simpleFiles.length;i++){
						// html += '<tr><td>'+row.simpleFiles[i].ip+'</td></tr>'
						html += '<td>'+row.simpleFiles[i].ip+'</td>'
					};
					// html += '</table>'
					return html
				}
			}
		]
	})
	$("#fileHandList").bootstrapTable("load", data); */

}