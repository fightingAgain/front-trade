//上传可递交竞卖问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var findurl = top.config.AuctionHost + "/AuctionFileController/findCarAndBasic.do"; //审核信息
var fileUp = null;
var id = getUrlParam('id');
var supplierId = getUrlParam('supplierId');
var projectId=getUrlParam('projectId');
var checkState=getUrlParam('checkState');
var thisFrame = parent.window.document.getElementById("classId").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#'+thisFrame)[0].contentWindow;
var dataInfo;

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
//	var oFileInput = new FileInput();
//	oFileInput.Init("FileName", urlSaveAuctionFile);
	$("#btnsubmit").click(function() {
		viewsubdata();
	})
	viewfindurl(supplierId);
	if(checkState==0){
		$("#btnsubmit").show();
	}else{
		
		$("#btnsubmit").hide();
	}
})

function viewfindurl(supplierId) {
	$.ajax({
		type: "post",
		url: findurl,
		data: {
			"supplierId": supplierId,
			"id": id
		},
		async: false,
		success: function(data) {
			if(data.success) {
				dataInfo = data.data;
				var messdata = dataInfo.auctionBasic
				$("#legaid").val(messdata.id);
				$("#legalName").html(messdata.legalName);
				$("#legalRepresent").html(messdata.legalRepresent);
				$("#legalContact").html(messdata.legalContact);
				$("#legalContactPhone").html(messdata.legalContactPhone);
				$("#legalContactAddress").html(messdata.legalContactAddress);
				$("#basicAccountNo").html(messdata.basicAccountNo);
				$("#divclient").html(messdata.client);
				$("#divclientsId").html(messdata.clientsId);
				var fildata = data.data.auctionVehicleList
				initdata(fildata);
			}
		}
	})
}

function initdata(fildata) {
	$("#vehcartabel").bootstrapTable({
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "plate",
				align: "left",
				title: "车辆号"
			},
			{
				field: "model",
				align: "left",
				title: "车辆型号",
			},
			{
				field: "weight",
				align: "left",
				title: "总质量",
			},
//			{
//				field: "path",
//				title: "附件地址",
//				align: "left",
//			},
			{
				field: "",
				title: "操作",
				align: "left",
				formatter: function(value, row, index) {
//					if(type == "update" || type == "check") {
						var strurl = '<a href="javascript:void(0)" class="btn btn-primary btn-xs"  style="color:#FFFFFF" onclick="fileDownload(\'' + row.path + '\',\'' + row.fileName + '\')">下载</a>';
						var strlook = '<a href="javascript:void(0)" class="btn btn-primary btn-xs" onclick="previewFile(\'' + row.path + '\')">预览</a>'
						return strurl+strlook;
//					}
//					if(type == "submit") {
//						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit"  onclick=editview(\"' + index + '\") data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
//						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" onclick=deletPackage(\"' + row.id + '\") data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
//						return strEdit + strDel;
//					}

				}
			},
		]
	})
	$("#vehcartabel").bootstrapTable("load", fildata)
}

function viewsubdata() {
	parent.layer.confirm('审核当前文件', {
			btn: ['合格', '不合格', '关闭']
		},
		function() { //合格
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
//						getAuctionFileInfo(); //刷新列表
//						loadAuctionFileCheckRecord(); //重载审核记录
						
						parent.layer.msg('审核成功！');
						parent.layer.close(parent.layer.getFrameIndex(window.name));
						dcmt.$("#AuctionFileCheck").bootstrapTable('refresh');
						dcmt.getAuctionFileInfo();
						//刷新表格						
					} else {
						parent.layer.msg('审核失败！');
					}
				}
			})
		},
		function() { //不合格

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
							parent.layer.close(index);
//							getAuctionFileInfo(); //重新刷新列表
//							loadAuctionFileCheckRecord(); //重载审核记录
							parent.layer.msg('审核成功');
							parent.layer.close(parent.layer.getFrameIndex(window.name));
							dcmt.$("#AuctionFileCheck").bootstrapTable('refresh');
						    dcmt.getAuctionFileInfo();
						} else {
							parent.layer.msg(result.message);
						}

					}
				})
			});
		},
		function() {
			parent.layer.close();
		}
	);
}

function fileDownload(path,fileName){
	var newUrl = loadFile + "?ftpPath=" + encodeURI(path) + "&fname=" + encodeURI(fileName);
	window.location.href = $.parserUrlForToken(newUrl);
}
function previewFile(path){
	openPreview(path);
}

//关闭按钮
$("#btnClose").on("click", function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})