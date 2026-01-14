var deleteFileUrl = top.config.bidhost + '/PurFileController/delete.do'; //删除已上传文件信息
var saveImgUrl = top.config.bidhost + '/PurFileController/save.do'; //删除已上传文件信息
var getImgListUrl = top.config.bidhost + "/PurFileController/list.do"; //查看附件
var agentFileData = [];

//start代理服务费
var projectServiceFee={};
var findAllGraduatedUrl = top.config.HghHost + "/GraduatedController/findAllGraduated.do"; //计算规则
var saveFileUrl = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var calcUrl = top.config.HghHost + "/GraduatedController/calculateMoney.do"; //批量上传文件到服务器
var calRule;
var basicBidResult;
//end代理服务费

//上传附件
var FileInput = function () {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function (FileName, uploadUrl, filetype, filetable, flag) {
		filesDataView(filetype, filetable);
		$("#" + FileName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx', 'xls'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮
			showCaption: false, //是否显示标题
			//showCaption: false, //是否显示标题
			browseClass: "btn btn-primary", //按钮样式
			dropZoneEnabled: false, //是否显示拖拽区域
			maxFileCount: 1,
			//			maxFileCount: flag?1:0, //表示允许同时上传的最大文件个数
			showPreview: false,
			showRemove: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			}

		}).on("filebatchselected", function (event, files) {
			if (event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			if (event.currentTarget.files[0].size > 50 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于50M');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
			if(!data.response.success){
				return;
			}
			$.ajax({
				type: "post",
				url: saveImgUrl,
				async: false,
				data: {
					'modelId': projectServiceFee.id,
					'modelName': filetype,
					'fileName': data.files[0].name,
					'fileSize': data.files[0].size / 1000 + "KB",
					'filePath': data.response.data[0]
				},
				datatype: 'json',
				success: function (data) {
					if (data.success == true) {
						filesDataView(filetype, filetable);
					}
				}
			});

		}).on('filebatchuploaderror', function (event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};
function filesDataView(modelName, viewTableId) {
	var tr = ""
	var file = "";
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId': projectServiceFee.id,
			'modelName': modelName
		},
		datatype: 'json',
		success: function (data) {
			let flieData = data.data;
			if (data.success == true) {
				agentFileData = flieData;
				if(agentFileData.length > 0 || type!="RELEASE"){
					$("#fileBtn").hide();
				} else {
					$("#fileBtn").show();
				}
			}
		}
	});
	if (agentFileData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#' + viewTableId).bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",

		},
		{
			field: "fileSize",
			title: "文件大小",
			align: "center",
			halign: "center",
			width: '100px',

		},
		{
			field: "#",
			title: "操作",
			halign: "center",
			width: '140px',
			align: "center",
			events: {
				'click .openAccessory': function (e, value, row, index) {
					var url = config.bidhost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					window.location.href = $.parserUrlForToken(url);
				}
			},
			formatter: function (value, row, index) {
				var dowl = '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
				var dels = '<button  class="btn btn-sm btn-danger" onclick=fileDetel(' + index + ',\"' + row.id + '\",\"' + row.modelName + '\",\"' + viewTableId + '\")>删除</button>'
				return dowl + (type=="RELEASE" ? dels : "");
			}
		},
		]
	});
	$('#' + viewTableId).bootstrapTable("load", agentFileData);
$(".fixed-table-loading").hide();
};

function fileDetel(i, uid, modelName, viewTableId) {

	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		
		$.ajax({
			type: "post",
			url: deleteFileUrl,
			async: false,
			dataType: 'json',
			data: {
				"id": uid,
			},
			success: function (data) { 
				filesDataView(modelName, viewTableId);
			}
		});
		
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});

}

//start代理服务费
function showAgentInfo(){

	//参数：1.file的id，2.附件保存的url,3：附件类型 4 上传完成显示的附件列表table
	var oFileInput = new FileInput();
	if(agentPurchaseType == 0){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'XB_AUCTION_AGENTFILE', 'file_table', false);
	} else if(agentPurchaseType == 1){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'JJ_AUCTION_AGENTFILE', 'file_table', false);
	} else if(agentPurchaseType == 2){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'JM_AUCTION_AGENTFILE', 'file_table', false);
	}
	

	if(projectServiceFee.collectType == 1){
		$("#collectType").html("标准累进制");
		$("#feeTit1").html("是否优惠");
		if(projectServiceFee.isDiscount == 1){
			$("#feeTxt1").html("不优惠");
			$("#feeTit2").hide();
			$("#feeTxt2").hide();
		} else {
			$("#feeTxt1").html("优惠");
			$("#feeTit2").html("优惠系数");
			$("#feeTxt2").html(projectServiceFee.discountCoefficient);
			$("#feeTit2").show();
			$("#feeTxt2").show;
		}
		
	} else if(projectServiceFee.collectType == 2){
		$("#collectType").html("其他");
		$("#feeTit1").html("收取说明");
		$("#feeTxt1").html(projectServiceFee.collectRemark != undefined ? projectServiceFee.collectRemark : "");
		$("#feeTit2").hide();
		$("#feeTxt2").hide();
	} else if(projectServiceFee.collectType == 0) {
		$("#collectType").html("固定金额");
		$("#feeTit1").html("收费金额");
		$("#feeTxt1").html(projectServiceFee.chargeMoney);
		$("#feeTit2").hide();
		$("#feeTxt2").hide();
	}
	
	
	$("#dataTypeCode").html(projectType == 0 ? "工程" : (projectType == 1 ? "设备" : (projectType == 2 ? "服务" : (projectType == 3 ? "广宣" : "废旧物资"))));
	if(projectServiceFee.collectType && projectServiceFee.collectType == 1){allGraduated();}
	
	if(type != "RELEASE"){
		$("[name='isReturn']").attr("disabled", "disabled");
		$("[name='payer']").attr("disabled", "disabled");
	}
	if(agentPurchaseType == 1){
		processData();
	} else {
		agentIsShow();
	}
	BidResultItem.length>0&&BidResultItem[0].isReturn==0 ? $("[name='isReturn']").prop("checked", "checked") : "";
	BidResultItem.length>0&&BidResultItem[0].payer ? $("[name='payer']").val([BidResultItem[0].payer]) : "";
}
//计算规则
function allGraduated(){
	$.ajax({
         url: findAllGraduatedUrl,
         type: "post",
         async:false,
         data: {purchaseType:agentPurchaseType, projectType:projectType},
         success: function (data) {
         	if(!data.success){
        		parent.layer.alert(data.message);
        		return;
        	}
            calRule = {};
            for(var i = 0; i < data.data.length; i++){
            	calRule[data.data[i].id] = data.data[i];
            }
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
	});
}
//服务费信息
function calculateMoney(index, graduatedId){
	var agentItem = BidResultItem[index];
	if(agentPurchaseType == 0){
		agentItem.bidPrice = (type=="RELEASE" ? agentItem.totalCheck : agentItem.bidPrice);
	} else if(agentPurchaseType == 2){
		agentItem.bidPrice = (type=="RELEASE" ? agentItem.offerMoney : agentItem.bidPrice);
	}
	if(projectServiceFee.collectType == 0){
		agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:(isNum(projectServiceFee.chargeMoney) ? projectServiceFee.chargeMoney : ""));
		agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:agentItem.serviceFee);
		agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:"");
	} else if(projectServiceFee.collectType == 2){
		agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:"");
		agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:"");
		agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:projectServiceFee.collectRemark);
	} else if(projectServiceFee.collectType == 1){ //标准累计制
		if(!graduatedId){
			agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:"");
			agentItem.discountMoney = (isNum(agentItem.discountMoney) ?agentItem.discountMoney:"");
			agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:"");
			agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:"");
			agentItem.graduatedId = (agentItem.graduatedId ?agentItem.graduatedId:"");
			agentItem.graduatedName = (agentItem.graduatedName ?agentItem.graduatedName:"");
			agentItem.calculateProcess = (agentItem.calculateProcess ?agentItem.calculateProcess:"");
		} else {
			param = {
				id:graduatedId,
		     	unit:calRule[graduatedId].unit,
		     	discountCoefficient:projectServiceFee.discountCoefficient,
		     	transactionAmount:agentItem.bidPrice,
		     	transactionAmountUnit:0
			}
			$.ajax({
		         url: calcUrl,
		         type: "post",
		         async:false,
		         data: param,
		         success: function (data) {
		         	if(!data.success){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	if(!data.data){
		         		return;
		         	}
		         	agentItem.calculateProcess = data.data.calculateProcess ? data.data.calculateProcess : "";
		         	agentItem.serviceFee = data.data.serviceFee ? data.data.serviceFee : "";
		         	agentItem.discountMoney = data.data.discountMoney ? data.data.discountMoney : "";
		         	agentItem.receiptsMoney = data.data.discountMoney ? data.data.discountMoney : "";
		         	agentItem.adjustRemark = "";
		         	agentItem.graduatedId = graduatedId;
		         	agentItem.graduatedName = calRule[graduatedId].graduatedName;
		         },
		         error: function (data) {
		             parent.layer.alert("请求失败");
		         }
			});
		}
	}
	
}
$("#agentTable").off("click", ".btnModify").on("click", ".btnModify", function() {
	var idx = $(this).closest("tr").attr("data-index");
	if($(this).closest("tr").find(".sltRule").val() == ""){
		top.layer.alert("请先选择计算规则");
		return;
	}
	top.layer.prompt({
		title: '请输入实收金额',
		formType: 0
	}, function(pass, index) {
		top.layer.close(index);
		top.layer.prompt({
			title: '请输入调整原因',
			formType: 2
		}, function(text, index) {
			top.layer.close(index);
			BidResultItem[idx].receiptsMoney = pass;
//			BidResultItem[idx].adjustRemark = text;
			if(projectServiceFee.collectType == 1){
				BidResultItem[idx].adjustRemark = (Number(BidResultItem[idx].receiptsMoney) != Number(BidResultItem[idx].discountMoney)?text:"");
			} else if(projectServiceFee.collectType == 0){
				BidResultItem[idx].adjustRemark = (Number(BidResultItem[idx].receiptsMoney) != Number(BidResultItem[idx].serviceFee)?text:"");
			} else {
				BidResultItem[idx].serviceFee = pass;
				BidResultItem[idx].adjustRemark = text;
			}
			agentIsShow(idx);
		});
	});
});
$("#agentTable").off("change", ".sltRule").on("change", ".sltRule", function() {
	var index = $(this).closest("tr").attr("data-index");
	var val = $(this).val();
	if(val == ""){return;}
	agentIsShow(index, val);
});
//是否数字
function isNum(val){
	if (parseFloat(val).toString() == "NaN") {
　　　　	return false;
　　	} else {
　　　　	return true;
　　	}
}

function agentIsShow(index, ruleId) {
	if(!projectServiceFee){
		return;
	}
	
	
	
	if(index != undefined){
		calculateMoney(index, ruleId);
	}
	
	var flag = false;
	var html = "";
	var serviceTotal = 0, receiptsTotal = 0, discountTotal = 0;
	var calculateProcess = "";
	
	$("#agentTable tr").remove();
	if($("#agentTable tr").length == 0){
		html += '<tr><th>中选人</th><th style="text-align:right;">成交金额</th>';
		if(projectServiceFee.collectType == 1){
			html += '<th>计算规则</th>';
		}
		html += '<th style="text-align:right;">服务费用</th>';
		if(projectServiceFee.collectType == 1){
			html += '<th style="text-align:right;">优惠后</th>';
		}
		html+='<th style="text-align:right;">实收金额</th><th>调整原因</th></tr>'
	}
	
	
	for(var i = 0; i < BidResultItem.length; i++) {
		var agentItem = BidResultItem[i];
		if(agentItem.isBid != 0) {
			continue;
		}
		if(index == undefined){
			calculateMoney(i);
		}
		
		flag = true;
		agentItem.serviceFee=="" ? "" : serviceTotal =numAdd(serviceTotal, Number(agentItem.serviceFee));
		agentItem.discountMoney=="" ? "" : discountTotal =numAdd(discountTotal, Number(agentItem.discountMoney));
		agentItem.receiptsMoney=="" ? "" : receiptsTotal = numAdd(receiptsTotal, Number(agentItem.receiptsMoney));
		if(agentPurchaseType == 1 && auctionModel == 1){
			var enterName = agentItem.enterpriseName;
			var calProcess = [];
			for(var j = 0; j < BidResultItem[i].item.length; j++){
				if(auctionType == 6){
					calProcess.push(BidResultItem[i].item[j].bidPrice);
				} else {
					calProcess.push(BidResultItem[i].item[j].bidPrice + '*' + BidResultItem[i].item[j].detailedCount);
				}
			}
			enterName += "（总成交金额：" + calProcess.join(" + ") + "=" + BidResultItem[i].bidPrice + "）";
		} else {
			enterName = agentItem.enterpriseName;
		}
		agentItem.calculateProcess=="" ? "" : calculateProcess += enterName + "：" + agentItem.calculateProcess + "<br/>";
		
		html += '<tr data-index="'+i+'">' 
			+'<td>' + agentItem.enterpriseName + '</td>' 
			+'<td style="text-align:right;">' + agentItem.bidPrice + '</td>' 
			
		if(projectServiceFee.collectType == 1){ //标准累计制
			if(type=="RELEASE"){ //编辑
				html+='<td><select class="form-control sltRule"><option value="">请选择计算规则</option>';
				if(calRule){
					for(var key in calRule){
						if(agentItem.graduatedId && agentItem.graduatedId == key){
							html += '<option value="'+key+'" selected="selected">'+calRule[key].graduatedName+'</option>';
						} else {
							html += '<option value="'+key+'">'+calRule[key].graduatedName+'</option>';
						}
						
					}
				}
				html+='</select></td>' 
			} else {
				html += '<td>'+agentItem.graduatedName+'</td>';
			}
		}
		html+='<td style="text-align:right;">'+agentItem.serviceFee+'</td>';
		if(projectServiceFee.collectType == 1){
			html+='<td style="text-align:right;">'+agentItem.discountMoney+'</td>';
		}
		var strColor="";
		if(projectServiceFee.collectType == 1){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.discountMoney)?"color:red":"");
		} else if(projectServiceFee.collectType == 0){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.serviceFee)?"color:red":"");
		} else {
			strColor = "color:red";
		}
		
		html+='<td style="text-align:right;"><span style="'+strColor+'">' + agentItem.receiptsMoney+'</span>';
		if(type == "RELEASE"){
			html+='<a href="javascript:;" data-index="' + i + '" class="btn-primary btn-xs btnModify" style="margin-left:5px;text-decoration: none;">···</a>'
		}
		html+='</td>'
			+'<td>'+(agentItem.adjustRemark ? agentItem.adjustRemark : "")+'</td>'
			+'</tr>';
		
	}
	if(flag){
		
		if(projectServiceFee.collectType ==1){
			html += '<tr><td colspan="3" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+(serviceTotal==0 ? "" : serviceTotal)+'</td><td style="text-align:right;border: none;">'+(discountTotal==0 ? "" : discountTotal)+'</td><td style="text-align:right;border: none;'+(type=="RELEASE"?"padding-right:36px;" : "")+'">'+(receiptsTotal==0 ? "" : receiptsTotal)+'</td><td style="border: none;"></td></tr>'
		} else {
			html += '<tr><td colspan="2" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+(serviceTotal==0 ? "" : serviceTotal)+'</td><td style="text-align:right;border: none;'+(type=="RELEASE"?"padding-right:36px;" : "")+'">'+(receiptsTotal==0 ? "" : receiptsTotal)+'</td><td style="border: none;"></td></tr>'
		}
	//	$("#agentFeeTotal").html(agentFeeTotal);
		$("#calculateProcess").html(projectServiceFee.collectType ==1 ? calculateProcess : "");
		$(html).appendTo("#agentTable");
		if(flag) {
			$(".agentBlock").css("display", "table-row");
		} else {
			$(".agentBlock").css("display", "none");
		}
	}
}

//精度问题
//加
function numAdd(num1, num2){
	var baseNum = 0, baseNum1 = 0, baseNum2 = 0;
	try{
		baseNum1 = num1.toString().split(".")[1].length;
	} catch (e){
		baseNum1 = 0;
	}
	try{
		baseNum2 = num2.toString().split(".")[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	
	baseNum = Math.pow(10, Math.max(baseNum1,baseNum2));
	
	return (num1*baseNum + num2*baseNum)/baseNum;
	
}
//减
function numSub(num1, num2){
	var baseNum = 0, baseNum1 = 0, baseNum2 = 0;
	try{
		baseNum1 = num1.toString().split(".")[1].length;
	} catch (e){
		baseNum1 = 0;
	}
	try{
		baseNum2 = num2.toString().split(".")[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	
	baseNum = Math.pow(10, Math.max(baseNum1,baseNum2));
	
	return (num1*baseNum - num2*baseNum)/baseNum;
}
//乘
function numMulti(num1, num2){
	var baseNum = 0;
	try {
		baseNum += num1.toString().split(".")[1].length;
	} catch (e) { }
	try {
		baseNum += num2.toString().split(".")[1].length;
	} catch (e) { }
	
	return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", ""))/Math.pow(10, baseNum)
}
//除
function numDiv(num1, num2) {
	var baseNum1 = 0,
		baseNum2 = 0;
	var baseNum3, baseNum4;
	try {
		baseNum1 = num1.toString().split(".")[1].length;
	} catch (e) {
		baseNum1 = 0;
	}
	try {
		baseNum2 = num2.toString().split(".")[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	baseNum3 = Number(num1.toString().replace(".", ""));
	baseNum4 = Number(num2.toString().replace(".", ""));
	return (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1);
}

//end代理服务费