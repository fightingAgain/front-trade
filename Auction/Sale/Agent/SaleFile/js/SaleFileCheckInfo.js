//获取 可递交竞卖文件审核信息
var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do";

//上传可递交竞卖问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";

//竞卖文件审核信息
var urlAuctionFileCheckRecord = top.config.AuctionHost + "/AuctionFileController/findAuctionFileRecode.do";

//下载竞卖文件地址
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do";
var exportUrl =  top.config.AuctionHost + '/AuctionFileController/exportHistoryFile.do';//导出
var historyUrl = top.config.AuctionHost + '/AuctionFileHisController/findHisListForPur.do';//文件递交记录
var downloadSupplierFileUrl =  top.config.AuctionHost + '/AuctionFileController/downloadSupplierFile';//供应商文件一键导出
var fileData = [];
var createType = $.getUrlParam("createType");
var projectId = $.getUrlParam("projectId");
var checkType = $.getUrlParam("type");
var RenameData = {};//投标人更名信息
$(function() {
	//获取存储的竞卖文件id	
	var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	RenameData = getBidderRenameData(projectId);//投标人更名信息
	//页面显示项目名称编号截止时间
//	$("#fileEndDate").html(rowData.fileEndDate);
//	$("#fileCheckEndDate").html(rowData.fileCheckEndDate);
//	$("#projectName").html(rowData.projectName);
//	$("#projectCode").html(rowData.projectCode);

	getAuctionFileInfo(); //挂载审核文件
	loadAuctionFileCheckRecord(); //挂载审核记录
	// if(checkType == 'check'){//查看
		$('.handBox').show();
		getFileList();//文件递交记录
	// };
	warnLists(projectId, 'jm', true, false, true,projectId,'2','1');
	$('#btnExport').click(function(){
		if($('#fileHandList').hasClass('JD_view')){
			window.location.href = $.parserUrlForToken(exportUrl+'?projectId='+projectId + '&tenderType=2&isIp=1')
		}else{
			window.location.href = $.parserUrlForToken(exportUrl+'?projectId='+projectId + '&tenderType=2')
		}
		
	});
	$("#btnDownloadSupplierFile").click(function(){
		var newUrl=$.parserUrlForToken(downloadSupplierFileUrl+"?tenderType=2&projectId="+projectId)
		window.location.href = newUrl;
	});
})

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
				fileData = result.data;
				if(fileData.length>0){
					$("#btnDownloadSupplierFile").show();
				}else{
					$("#btnDownloadSupplierFile").hide();
				}
				loadAuctionFileCheckState(result.data);
				$("#fileEndDate").html(fileData[0].fileEndDate);
				$("#fileCheckEndDate").html(fileData[0].fileCheckEndDate);
				$("#projectName").html(fileData[0].projectName);
				if (fileData[0].projectSource > 0) {
					$("#projectName").html(fileData[0].projectName + '<span class="red">(重新竞卖)</span>');
				}
				$("#projectCode").html(fileData[0].projectCode);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//挂载竞卖文件审核状态
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
				title: "竞卖文件",
				formatter: function(value, row, index) {
					if( row.fileName){
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						var html = "";
						for(var j = 0; j < filePathArr.length; j++) {
							var c = j + 1;
							html += '<div>' + c + '、' + '<a  href="javascript:void(0)" onclick="openAccessory(' + index + ',' + j + ')"  href="javascript:void(0);">' + fileNameArr[j] + '</a></div>';
						}
						return html;
					}else{
						return '';
					}
				}
			},
			/*{
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
							} else {

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

function openAccessory(_index, _j) {
	var filePathArr = fileData[_index].filePath.split(",");
	var fileNameArr = fileData[_index].filePath.split(",");
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePathArr[_j] + "&fname=" + fileNameArr[_j];
	window.location.href = $.parserUrlForToken(newUrl);
}
//挂载竞卖文件审核记录
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
				parent.layer.msg(result.message);
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
						parent.layer.alert('审核成功！');
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
							parent.layer.alert('审核成功');
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
};
//文件递交记录
function getFileList() {
	var dataParam = {
		"projectId": projectId,
		"tenderType": 2
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
};
function fileHandTable(data) {
	var html = '<table class="table table-bordered">';
	html += '<tr><th style="width:50px;text-align: center;">序号</th><th style="width:150px;">供应商名称</th><th style="width:100px;text-align: center;">社会信用代码</th><th style="width:200px;">竞卖文件名称</th><th style="width:150px;text-align: center;">递交/撤回时间</th><th style="width:100px;text-align: center;">操作类型</th>'
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
					texts += '<div>'+(k+1) + '.' + name[k] +'</div>';
				}
			};
			html += '<td style="width:200px;">'+texts+'</td>';
			html += '<td style="width:150px;text-align: center;">'+data[n].simpleFiles[i].date+'</td>';
			html += '<td style="width:100px;text-align: center;">'+(data[n].simpleFiles[i].rebackType==1?'递交':data[n].simpleFiles[i].rebackType==2?'撤回':'')+'</td>'
			html += '</tr>';
		};
		
	}
	html += '</table>';
	$(html).appendTo('#fileHandList');
};