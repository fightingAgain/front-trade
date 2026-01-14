function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
}
var projectType = getQueryString('projectType');//项目类型
var projectSource = getQueryString('projectSource');//项目类型
var deleteFileUrl = config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息
var saveImgUrl = config.AuctionHost + "/PurFileController/save.do"; //保存附件
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var CheckListSave = config.AuctionHost + '/AuctionPackageDetailedController/saveAuctionPackageDetailed.do'//材料设备添加
var CheckList = config.AuctionHost + '/AuctionPackageDetailedController/findAuctionPackageDetailedList.do'//材料设备 查询
var CheckListupdate = config.AuctionHost + '/AuctionPackageDetailedController/updateAuctionPackageDetailed.do'//材料设备 修改
var CheckListdelete = config.AuctionHost + '/AuctionPackageDetailedController/deleteAuctionPackageDetailed.do'//材料设备 修改
var saveByExcelDetailed = config.AuctionHost + '/AuctionPackageDetailedController/saveByExcel.do'//材料设备 批量导入
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do'//费用查看
var pricesave = config.AuctionHost + '/ProjectPriceController/saveProjectPrice.do'//费用添加
var priceupdate = config.AuctionHost + '/ProjectPriceController/updateProjectPrice.do'//费用修改
var pricedelete = config.AuctionHost + '/ProjectPriceController/deleteProjectPrice.do'//费用删除
var findInitMoney = config.AuctionHost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = parent.config.AuctionHost + "/DepositController/findAccountDetailForAuction.do"; //查询保证金账号
var opurl = config.Syshost + "/OptionsController/list.do";
var excelDownloadUrl = config.FileHost + "/FileController/xjjDownload.do";   //下载excel模板接口
var packagePrice = [];//费用信息
//包件添加信息
var packageData = {};
var filesData = []; //附件上传竞价的数组
var filesDataDetail = [];//清单数组
var fileId
var auctionOutTypeData = [];
var typeIdList = ""//项目类型的ID
var typeNameList = ""//项目类型的名字
var typeCodeList = ""//项目类型编号
var isOffer = 1;//是否显示最低报价0是显示1是不显示。默认为不显示
var isName = 1;//是否显示供应商名称0为显示1为不显示，默认为不显示
var isCode = 1;//是否显示供应商编号0为显示1为不显示，默认为不显示
var totalCount = 0;
var checkListData;
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
var oFileInput;
function excelDownload() {
	var newUrl = excelDownloadUrl + "?fname=清单式竞价模板&filePath=AuctionQdjyTemplateDl.xlsx";
	window.location.href = $.parserUrlForToken(newUrl);
}
//打开弹出框时加载的数据和内容。
function du(packageId) {
	$.ajax({
		type: "post",
		url: config.AuctionHost + '/ProjectReviewController/findAutionPackageInfo.do',
		data: {
			'packageId': packageId
		},
		dataType: "json",
		async: false,
		success: function (response) {
			if (response.success) {
				packageData = response.data;
				//保证金相关规则 --- 2024 5.31
				/*********         保证金虚拟子账户规则   media/js/base/IndexMenu.js */
				if(top.virtualBondRules == 1 || top.virtualBondRules == 2){
					if($('.virtualBondBank').length == 0){
						$(".virtualBondRules").after(top.virtualBondHtml)
					}
				}
				/*********         保证金虚拟子账户规则   --end */
				if(packageData.auctionType == 1){
					packageData.auctionType = 0;
				}
				auctionOutTypeData = packageData.auctionOutType
			}

		}
	});
	if(projectSource==1){
		$('.virtualBondBank input').attr('disabled',true);
		$(".disProjectSource").attr('disabled',true);
		$(".projectSource").attr('readonly',true);
		$(".projectSource").css('background','#eeeeee')
	}
	oFileInput = new FileInput();
	auctionTypeBtn(packageData.auctionType||0);
//	filesDataView();
	packagePriceData();
	listDetailed();
	//虚拟子账户生成银行回显
	if(packageData.bankType){
		$('input[name="bankType"]').val([packageData.bankType]);
		// $('input[name="bankType"][value="'+ packageData.bankType +'"]').attr("checked",true);
	};
	$("#packageName").val(packageData.packageName);
	$("#packageNum").val(packageData.packageNum?packageData.packageNum:'');
	$("input[name='isPayDeposit'][value='" + packageData.isPayDeposit + "']").attr("checked", true);
	$("input[name='isSellFile'][value='" + packageData.isSellFile + "']").attr("checked", true);
	$('input[name="auctionType"][value="' + packageData.auctionType + '"]').attr("checked", true);
	$("input[name='outSupplier'][value='" + packageData.outSupplier + "']").attr("checked", true);
	
	//当为自由竞价时竞价时常的值为
	$('input[name="auctionDuration"][value="' + packageData.auctionDuration||0 + '"]').attr("checked", true);
	$("input[name='auctionModel'][value='" + packageData.auctionModel||0 + "']").attr("checked", true);
	$("input[name='budgetIsShow'][value='" + packageData.budgetIsShow + "']").attr("checked", true);
	$('input[name="intervalTime"][value="' + packageData.intervalTime + '"]').attr("checked", true);
	$('[name=isPriceReduction]').val([packageData.isPriceReduction!==undefined?packageData.isPriceReduction:'1']);
	if(packageData.isPriceReduction == 0){
		$('.isPriceReduction').show();
		$('[name=isPriceReduction]').closest('td').attr('colspan','1')
	}else if(packageData.isPriceReduction == 1){
		$('.isPriceReduction').hide();
		$('[name=isPriceReduction]').closest('td').attr('colspan','3')
	}
	if(packageData.budgetIsShow==1){
		$(".isBudgetIsShow").show();
	}
	//当为2轮或三轮竞价的时候。选中多轮竞价
	if (packageData.auctionType == 2 || packageData.auctionType == 3) {
		$('input[name="auctionType"][value="5"]').attr("checked", true);
		
	}
	$('input[name="auctionTypes"][value="' + packageData.auctionType||2 + '"]').attr("checked", true);

	oFileInput.Init("FileName", urlSaveAuctionFile, 'JJ_AUCTION_PROJECT_PACKAGE', 'filesData', true);
	if(packageData.auctionType==6){
		if(packageData.auctionModel==1){
			$(".auctionTypeContent").html('根据各供应商报价，推荐各分项最低报价的供应商分别中选，即可多家供应商中选（可议价）')
		}else if(packageData.auctionModel==2){
			$(".auctionTypeContent").html('① 根据各供应商报价，分别明确各项最低报价；② 按照各供应商总报价金额由低到高进行排序，按排序分别进行议价，若第1名同意以各项最低报价成交，则推荐第1名中选，并不再继续与其他供应商议价；若第1名不同意成交，则与第2名议价，若第2名同意成交，则推荐第2名中选，并不再继续与其他厂家议价；依次类推，直至确定候选供应商。③ 经议价，若各供应商均不同意以“各项最低报价”成交，则推荐总报价最低的供应商中选；④ 一家供应商中选。')
		}else if(packageData.auctionModel==3){
			$(".auctionTypeContent").html(' 根据各供应商报价，推荐总价最低的供应商中选，即一家供应商中选（可议价）')    
		}

	}else{
		if(packageData.auctionModel == 0){//按包件
			$(".auctionModelShow").show();
			$('input[name="isPrice"][value="'+ (packageData.isPrice!==undefined?packageData.isPrice:'1') +'"]').prop('checked',true);
		}else{//按明细
			$(".auctionModelShow").hide();
			$('input[name="isPrice"]').prop('checked',false);
			$("#priceReduction").val("");
			$("#rawPrice").val("");
		}
	}
	if(packageData.isPrice == 0){
        $(".rawPriceshow").show();
		$('.isPriceCol').attr('colspan','1');
		$("#priceReduction").val(packageData.priceReduction?packageData.priceReduction:'');
        $("#rawPrice").val(packageData.rawPrice?packageData.rawPrice:'');
    }else{
        $('.isPriceCol').attr('colspan','3');
        $(".rawPriceshow").hide();
        $("#rawPrice,#priceReduction").val("");
    }
	if (packageData.dataTypeName != "" && packageData.dataTypeName != undefined) {
		$("#dataTypeName").val(packageData.dataTypeName)
		$("#dataTypeId").val(packageData.dataTypeId)
		$("#dataTypeCode").val(packageData.dataTypeCode)
	}
	if (packageData.auctionType > 1 && packageData.auctionType < 4) {		
		$('input[name="firstAuctionTime"][value="' + packageData.firstAuctionTime + '"]').attr("checked", true);
		$('input[name="secondAuctionTime"][value="' + packageData.secondAuctionTime + '"]').attr("checked", true);
		$("#firstOutSupplier").val(packageData.firstOutSupplier)
		$("#firstKeepSupplier").val(packageData.firstKeepSupplier)
		$("#secondOutSupplier").val(packageData.secondOutSupplier)
		$("#secondKeepSupplier").val(packageData.secondKeepSupplier)
		if (packageData.auctionType == 3) {
			$('input[name="thirdAuctionTime"][value="' + packageData.thirdAuctionTime + '"]').attr("checked", true);
		}
	}
	$('input[name="lastOutType"][value="' + packageData.lastOutType + '"]').attr("checked", true);
	$('input[name="outType"]').eq((packageData.outType == undefined ? '0' : packageData.outType)).attr("checked", true);
	if(packageData.outType==1){
		$(".Supplier").hide();
	}
	
	isOffer = packageData.isShowPrice;//是否显示最低报价0是显示1是不显示。默认为不显示
	isName = packageData.isShowName;//是否显示供应商名称0为显示1为不显示，默认为不显示
	isCode = packageData.isShowNum;//是否显示供应商编号0为显示1为不显示，默认为不显示
	$("#content").val(packageData.content);
	if(packageData.timeLimit){
		$("#timeLimit").val(packageData.timeLimit);
	}
	if (packageData.isShowNum == 0) {
		$("input[name='isCode']").attr('checked', true)
	}
	if (packageData.isShowName == 0) {
		$("input[name='isName']").attr('checked', true)
	}
	if (packageData.isShowPrice == 0) {
		$("input[name='isOffer']").attr('checked', true)
	}
	$("#budgetPrice").val(packageData.budgetPrice);
	$("#noTaxBudgetPrice").val(packageData.noTaxBudgetPrice);
	$("#outNumber").val(packageData.outNumber);
	//start非招标代理服务费
	if(packageData.openServiceFee == 1){
		$(".agentBlock").show();
		for(var key in packageData.projectServiceFee){
			$("[name='projectServiceFee."+key+"']").val(packageData.projectServiceFee[key]);
		}
		$("[name='projectServiceFee.tenderType']").val(projectType);
		$("[name='projectServiceFee.projectId']").val(packageData.projectId);
		$("[name='projectServiceFee.packageId']").val(packageData.id);
		agentFeeChange(packageData.projectServiceFee && packageData.projectServiceFee.collectType || 0);  
	} else {
		$(".agentBlock").remove();
	}
	//end非招标代理服务费

	$("#btn_bao").on('click', function () {
		if($("#outNumber").val().length>100){
			parent.layer.alert("系统外编号长度不能超过100个字");  
			return false;
		};
		if($('input[name="isPayDeposit"]:checked').val()==0&&filesData.length===0) {
			parent.layer.alert("竞价采购文件不能为空");
			return;
		};
		// 使用变量接受验证值,避免弹框两次
		let errText = checkBank();
		if (errText != true) {
			// parent.layer.alert(errText);
			return
		}
		//  清单验证
		if ($('input[name="auctionType"]:checked').val() == 6) {
			if (filesDataDetail.length == 0) {
				parent.layer.alert("请上传清单报价文件");
				return false;
			}
			
//			if($('input[name="budgetIsShow"]:checked').val()==1){
				if ($("#noTaxBudgetPrice").val() == "") {
					parent.layer.alert("预算价(不含税)为空，请填写");
					return false;
				}
//			}	
		}
		
		//	清单验证，预算价(不含税)跟是否显示预算价没关系，是否显示预算价是控制模版里的预算价
		if ($('input[name="auctionType"]:checked').val() == 7) {
//			if($('input[name="budgetIsShow"]:checked').val()==1){
				if ($("#noTaxBudgetPrice").val() == "") {
					parent.layer.alert("预算价(不含税)为空，请填写");
					return false;
				}
//			}
		}


		if($('#packageName').val().length > 66) {
			parent.layer.alert("包件名称过长");
			return;
		};
		if($('#packageNum').val()!='' && $('#packageNum').val().length > 30) {
			parent.layer.alert("包件编号过长");
			return;
		};

		if($('input[name="auctionType"]:checked').val() == 0 && isNaN($('#timeLimit').val()) || Number($('#timeLimit').val())<=0){
			parent.layer.alert("限时（分）必须为数字且大于0");
			return;
		}
		if($('input[name="maxAuctionTime"]').val()!='' && (Number($("input[name='auctionDuration']:checked").val())+Number($('#timeLimit').val()))>=Number($('input[name="maxAuctionTime"]').val())){
			parent.layer.alert("总时长（分）必须大于竞价时长（分）+限时（分）");
			return;
		}
		if($('[name=isPriceReduction]:checked').val() == 0 && $.trim($('[name=priceReduction]').val()) == ''){
			parent.layer.alert("请输入降价幅度");
			return;
		}

	
		//start 采购代理服务费

		if(!checkAgentFee(packageData.openServiceFee)){
			return;
		}
		//end 采购代理服务费
		//验证费用
		var isCanSave = true;
		$('.priceNumber').each(function(){
			if(!verifySaveMoney($(this).val(), 2, $(this).attr('priceType'))){
				isCanSave = false;
				return false
			}
		});
		if(!isCanSave){
			return
		};
		$('#projectPricesBankType').val($('[name=bankType]:checked').val());
		var arr={};
		arr = top.serializeArrayToJson($("#forms").serializeArray());//获取表单数据，并转换成对象；
		arr.id=packageData.id;
		if(arr.auctionType==0){
			if ($('input[name="maxAuctionTime"]').val()!='' && !(/(^[1-9]\d*$)/.test($('input[name="maxAuctionTime"]').val()))) { 
	　　　　　　parent.layer.alert('总时长（分）必须为正整数'); 
	　　　　　　return; 
	　　　　}
			arr.maxAuctionTime=$('input[name="maxAuctionTime"]').val();
		}
		if(arr.auctionType==5){
			arr.auctionType=$('input[name="auctionTypes"]:checked').val();
		}
		if($('input[name="auctionType"]:checked').val()==4){
			arr["auctionOutTypes[0].countType"]=$('select[name="countType"] option:selected').val();
			arr["auctionOutTypes[0].countValue"]= $('input[name="countValue"]').val();
			arr["auctionOutTypes[0].outValue"]= $('input[name="outValue"]').val();
			arr["auctionOutTypes[0].keepValue"]= $('input[name="keepValue0"]').val();		
			if (totalCount == 0) {
				arr["auctionOutTypes[1].countValue"]= $('#lastCount').val();
				arr["auctionOutTypes[1].outValue"]= $('#lastout').val();
				arr["auctionOutTypes[1].keepValue"]= $('#lastKeep').val();				
			} else if (totalCount > 0) {
				arr["auctionOutTypes["+ (totalCount + 1) +"].countValue"]= $('#lastCount').val();
				arr["auctionOutTypes["+ (totalCount + 1) +"].outValue"]= $('#lastout').val();
				arr["auctionOutTypes["+ (totalCount + 1) +"].keepValue"]= $('#lastKeep').val();					
			};			
		}
		if(projectSource==1){
			arr.isPayDeposit=packageData.isPayDeposit;
			arr['projectPrices[1].payMethod']=$("#payMethod").val();
			arr['projectPrices[1].agentType']=$("input[name='projectPrices[1].agentType']:checked").val();			
			arr.isSellFile=packageData.isSellFile;	
		}
		/**
		 * 这里处理多轮竞价(2/3/无限)的时候,auctionModel没有,导致后台报错.
		 */
		if(arr.auctionType==2||arr.auctionType==3||arr.auctionType==4){
			arr.auctionModel = "0";
		}
		$.ajax({
			url: config.AuctionHost + '/AuctionProjectPackageController/updateAuctionProjectPackage.do',//修改包件的接口
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',

			data:arr,
			success: function (data) {
				if (data.success == true) {
					parent.layer.alert("保存成功");
					dcmt.package();
				} else {
					parent.layer.alert(data.message)
					$.ajax({
						type: "post",
						url: deleteFileUrl,
						async: false,
						dataType: 'json',
						data: {
							"id": fileId,
						},
						success: function (data) {
							filesDataView('JJ_AUCTION_SPECIFICATION', 'detaillist_operation_table');

						}
					});
				}
			}
		});
	})
	//退出
	$("#btn_close").click(function () {
		var index = top.parent.layer.getFrameIndex(window.name);
		top.parent.layer.close(index);
	})


}



function listDetailed() {
	$.ajax({
		url: CheckList,
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {

			'packageId': packageData.id
		},
		success: function (data) {
			checkListData = data.data
			minData()
		}
	});
}
function minData() {
	if (checkListData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#tbodym').bootstrapTable({
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
			field: "detailedName",
			title: "材料设备名称",
			align: "left",
			halign: "left",

		},
		{
			field: "brand",
			title: "品牌要求",
			align: "center",
			halign: "center",
			width: '100px',

		},
		{
			field: "detailedVersion",
			title: "型号规格",
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				return (value == undefined || value == "") ? "暂无型号" : value
			}

		}, {
			field: "detailedCount",
			title: "数量",
			halign: "center",
			width: '100px',
			align: "center",

		},
		{
			field: "detailedUnit",
			title: "单位",
			halign: "center",
			width: '100px',
			align: "center"
		},
		{
			field: "budget",
			title: "采购预算（元）",
			halign: "center",

			width: '120px',
			align: "center",
			formatter: function (value, row, index) {
				if (value == undefined) {
					var budget = "暂无预算"
				} else {
					var budget = value;
				};
				return budget
			}
		},
		{
			field: "detailedContent",
			title: "备注",
			halign: "left",
			align: "left",
		},
		{
			field: "#",
			title: "操作",
			width: '200px',
			halign: "center",
			align: "center",
			formatter: function (value, row, index) {
				var mixtbody = ""
				mixtbody = '<div class="btn-group">'


					+ '<button type="button" class="btn btn-xs btn-primary" onclick=detailEdit(\"' + index + '\")>编辑</button>'
					+ '<button type="button" class="btn btn-xs btn-danger" onclick=itemdelte(\"' + row.id + '\")>删除</button></div>'
				return mixtbody
			}

		}
		]
	});
	$('#tbodym').bootstrapTable("load", checkListData);
}
//添加设备
function add_min() {
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '添加设备信息'
		, area: ['600px', '600px']
		, content: 'Auction/Auction/Agent/AuctionPurchase/model/checkListItem.html'
		// , btn: ['确定', '取消']
		, success: function (layero, index) {
			var iframeWinds = layero.find('iframe')[0].contentWindow;
			//把之前的值渲染到页面上
			iframeWinds.$('#packageId').val(packageData.id);//名称
			iframeWinds.passMessage(function(){
				if (iframeWinds.$('#detailedName').val() == "") {
					parent.layer.alert("设备名称不能为空");
					return;
				};
				if (iframeWinds.$('#detailedName').val().length > 70) {
					parent.layer.alert("设备名称过长");
					return;
				};
				if (iframeWinds.$('#brand').val()!='' && iframeWinds.$('#brand').val().length > 70) {
					parent.layer.alert("品牌要求过长");
					return;
				};
				if (iframeWinds.$('#detailedVersion').val() == "") {
					parent.layer.alert("型号规格不能为空");
					return;
				};
				if (iframeWinds.$('#detailedVersion').val().length > 70) {
					parent.layer.alert("型号规格过长");
					return;
				};
				if (iframeWinds.$('#detailedCount').val() == "") {
					parent.layer.alert("数量不能为空");
					return;
				};
				if (!(/^[0-9]*$/.test(iframeWinds.$("#detailedCount").val()))) {
					parent.layer.alert("数量只能是正整数");
					return;
				};
				if (iframeWinds.$('#detailedCount').val().length > 10) {
					parent.layer.alert("数量过长");
					return;
				};
				if (iframeWinds.$('#detailedUnit').val() == "") {
					parent.layer.alert("单位不能为空");
					return;
				};
				if (iframeWinds.$('#detailedUnit').val().length > 10) {
					parent.layer.alert("单位过长");
					return;
				};
				
				// if (!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))) {
				// 	parent.layer.alert("采购预算只能是正整数");
				// 	return;
				// };
				// 先判空, 在进行校验
				if(iframeWinds.$("#budget").val()!=''){
					if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
						parent.layer.alert("采购预算必须大于零且最多两位小数"); 
						return;
					};
				}
				
				if (iframeWinds.$('#budget').val()!='' && iframeWinds.$('#budget').val().length > 10) {
					parent.layer.alert("采购预算过长");
					return;
				};
				if (iframeWinds.$('#detailedContent').val()!='' && iframeWinds.$('#detailedContent').val().length > 600) {
					parent.layer.alert("备注过长");
					return;
				};
				
				
				$.ajax({
					url: CheckListSave,
					type: 'post',
					dataType: 'json',
					async: false,
					//contentType:'application/json;charset=UTF-8',
					data: iframeWinds.$("#form").serialize(),
					success: function (data) {
						listDetailed()
					}
				});
				parent.layer.close(index)
			})
		}
		//确定按钮
		, yes: function (index, layero) {
			var iframeWinds = layero.find('iframe')[0].contentWindow;
			if (iframeWinds.$('#detailedName').val() == "") {
				parent.layer.alert("设备名称不能为空");
				return;
			};
			if (iframeWinds.$('#detailedName').val().length > 70) {
				parent.layer.alert("设备名称过长");
				return;
			};
			if (iframeWinds.$('#brand').val()!='' && iframeWinds.$('#brand').val().length > 70) {
				parent.layer.alert("品牌要求过长");
				return;
			};
			if (iframeWinds.$('#detailedVersion').val() == "") {
				parent.layer.alert("型号规格不能为空");
				return;
			};
			if (iframeWinds.$('#detailedVersion').val().length > 70) {
				parent.layer.alert("型号规格过长");
				return;
			};
			if (iframeWinds.$('#detailedCount').val() == "") {
				parent.layer.alert("数量不能为空");
				return;
			};
			if (!(/^[0-9]*$/.test(iframeWinds.$("#detailedCount").val()))) {
				parent.layer.alert("数量只能是正整数");
				return;
			};
			if (iframeWinds.$('#detailedCount').val().length > 10) {
				parent.layer.alert("数量过长");
				return;
			};
			if (iframeWinds.$('#detailedUnit').val() == "") {
				parent.layer.alert("单位不能为空");
				return;
			};
			if (iframeWinds.$('#detailedUnit').val().length > 10) {
				parent.layer.alert("单位过长");
				return;
			};

			// if (!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))) {
			// 	parent.layer.alert("采购预算只能是正整数");
			// 	return;
			// };
			// 先判空, 在进行校验
			if(iframeWinds.$("#budget").val()!=''){
				if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
					parent.layer.alert("采购预算必须大于零且最多两位小数"); 
					return;
				};
			}

			if (iframeWinds.$('#budget').val()!='' && iframeWinds.$('#budget').val().length > 10) {
				parent.layer.alert("采购预算过长");
				return;
			};
			if (iframeWinds.$('#detailedContent').val()!='' && iframeWinds.$('#detailedContent').val().length > 600) {
				parent.layer.alert("备注过长");
				return;
			};

			
			$.ajax({
				url: CheckListSave,
				type: 'post',
				dataType: 'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: iframeWinds.$("#form").serialize(),
				success: function (data) {
					listDetailed()
				}
			});
			parent.layer.close(index)
		},
		btn2: function () {
		},
	});
}
//删除设备信息
function itemdelte(uid) {
	parent.layer.confirm('确定要删除该设备信息', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			url: CheckListdelete,
			type: 'post',
			dataType: 'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				'id': uid
			},
			success: function (data) {
				listDetailed()
			}
		});
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});

}
//编辑设备信息
function detailEdit($index) {
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '添加明细信息'
		, area: ['600px', '600px']
		, content: 'Auction/Auction/Agent/AuctionPurchase/model/checkListItem.html'
		// , btn: ['确定', '取消']
		, success: function (layero, index) {
			var iframeWinds = layero.find('iframe')[0].contentWindow;
			iframeWinds.du(checkListData[$index]);
			iframeWinds.passMessage(function(){
				if (iframeWinds.$('#detailedName').val() == "") {
					parent.layer.alert("请输入名称");
					return;
				}
				if (iframeWinds.$('#detailedCount').val() == "") {
					parent.layer.alert("请输入数量");
					return;
				}
				if (!(/^[0-9]*$/.test(iframeWinds.$('#detailedCount').val()))) {
					parent.layer.alert("数量只能是正整数");
					return;
				};
				if (iframeWinds.$('#detailedUnit').val() == "") {
					parent.layer.alert("请输入单位");
					return;
				};
				if (iframeWinds.$('#detailedUnit').val().length > 10) {
					parent.layer.alert("单位过长");
					return;
				};
				// if (!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))) {
				// 	parent.layer.alert("采购预算只能是正整数");
				// 	return;
				// };
				// 先判空, 在进行校验
				if(iframeWinds.$("#budget").val()!=''){
					if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
						parent.layer.alert("采购预算必须大于零且最多两位小数"); 
						return;
					};
				}
				
				if (iframeWinds.$('#budget').val().length > 10) {
					parent.layer.alert("采购预算过长");
					return;
				};
				$.ajax({
					url: CheckListupdate,
					type: 'post',
					dataType: 'json',
					async: false,
					//contentType:'application/json;charset=UTF-8',
					data: iframeWinds.$("#form").serialize(),
					success: function (data) {
						listDetailed()
					}
				});
				parent.layer.close(index);
			})

		}
		//确定按钮
		, yes: function (index, layero) {
			var iframeWinds = layero.find('iframe')[0].contentWindow;
			if (iframeWinds.$('#detailedName').val() == "") {
				parent.layer.alert("请输入名称");
				return;
			}
			if (iframeWinds.$('#detailedCount').val() == "") {
				parent.layer.alert("请输入数量");
				return;
			}
			if (!(/^[0-9]*$/.test(iframeWinds.$('#detailedCount').val()))) {
				parent.layer.alert("数量只能是正整数");
				return;
			};
			if (iframeWinds.$('#detailedUnit').val() == "") {
				parent.layer.alert("请输入单位");
				return;
			};
			if (iframeWinds.$('#detailedUnit').val().length > 10) {
				parent.layer.alert("单位过长");
				return;
			};
			// if (!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))) {
			// 	parent.layer.alert("采购预算只能是正整数");
			// 	return;
			// };
			// 先判空, 在进行校验
			if(iframeWinds.$("#budget").val()!=''){
				if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
					parent.layer.alert("采购预算必须大于零且最多两位小数"); 
					return;
				};
			}

			if (iframeWinds.$('#budget').val().length > 10) {
				parent.layer.alert("采购预算过长");
				return;
			};
			$.ajax({
				url: CheckListupdate,
				type: 'post',
				dataType: 'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: iframeWinds.$("#form").serialize(),
				success: function (data) {
					listDetailed()
				}
			});
			parent.layer.close(index);
		},
		btn2: function () {
		},
	});
}

//导出模版
function exportExcel() {
	var url = config.FileHost + "/FileController/download.do" + "?fname=材料设备模板.xls&ftpPath=/Templates/Pur/Pur_Equipment_Bill_Of_Material_Template.xls";
	window.location.href = $.parserUrlForToken(url);

}
//excel导入
function importf(obj) {
	var f = obj.files[0];
	var formFile = new FormData();

	formFile.append("packageId", packageData.id);
	formFile.append("excel", f); //加入文件对象
	var data = formFile
	$.ajax({
		type: "post",
		url: saveByExcelDetailed,
		async: false,
		dataType: 'json',
		cache: false,//上传文件无需缓存
		processData: false,//用于对data参数进行序列化处理 这里必须false
		contentType: false, //必须
		data: data,
		success: function (data) {
			if(data.success){
				listDetailed()
			}else{
				parent.layer.alert(data.message)
			}
			$('input[type="file"]').val("")
		}
	});

}
//项目类型  
var itemTypeId = []//项目类型的ID
var itemTypeName = []//项目类型的名字
var itemTypeCode = []//项目类型编号
function dataType() {


	if (packageData.dataTypeId != "" && packageData.dataTypeId != undefined && packageData.dataTypeId != null) {
		typeIdList = packageData.dataTypeId;
	}
	if (projectType == 0) {
		var code = "A"
	} else if (projectType == 1) {
		var code = "B"
	} else if (projectType == 2) {
		var code = "C"
	} else if (projectType == 3) {
		var code = "C50"
	} else if (projectType == 4) {
		var code = "W"
	}
	sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code=' + code,
		btn: ['确定', '取消'],
		scrolling: 'no',
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		},
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit()//触发事件得到选中的项目类型的值
			if(!dataTypeList){
				return;
			}
			if (dataTypeList.length == 0) {
				parent.layer.alert("请选择一条项目类型")
				return
			}
			itemTypeId = []//项目类型的ID
			itemTypeName = []//项目类型的名字
			itemTypeCode = []//项目类型编号

			for (var i = 0; i < dataTypeList.length; i++) {
				itemTypeId.push(dataTypeList[i].id)
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList = itemTypeId.join(",")//项目类型的ID
			typeNameList = itemTypeName.join(",")//项目类型的名字
			typeCodeList = itemTypeCode.join(",")//项目类型编号
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList)
			parent.layer.close(index)
		}
	});
}

var strSel = '<select [id] style="width: 80px;height: 26px;" [onchange]>';
strSel += '<option value="0">大于等于</option><option value="1">大于</option></select>';
function setOutType(obj, type) {
	var supplierCount = "";

	if (type == 0) {
		supplierCount = $("#supplierCount_" + obj).val();
		if (supplierCount == "") {
			return;
		}
		if (supplierCount == 0) {
			$("#tbOutType").html("");
			$("#lastCount").val("");
			totalCount = 0;
			$("#sel_0").val(0);
			$("#sel_last").val(0);
			$("#span0").hide();
			$("#span1").show();
			$("#trOutType").hide();
			$("#btnAddOutType").hide();
			return;
		};
		if (totalCount == 0) {
			$("#lastCount").val(supplierCount);
		}
	}
	else if (type == 1) {
		obj = totalCount;
		supplierCount = $("#supplierCount_" + obj).val();
		if (supplierCount == "") {
			return;
		}
		if (supplierCount == "") {
			top.layer.alert("请先填写第" + (1 + totalCount) + "行的条件值！");
			return;
		}
		totalCount++;

		var strHtml = '<tr><td style="text-align: left;" colspan="2">首轮报价供应商数： ';
		strHtml += '<select id="selTemp_' + totalCount + '" style="width: 80px;height: 26px;" disabled="disabled">';
		if ($("#sel_" + obj).val() == "0") {
			strHtml += '<option value="0">小于</option><option value="1">小于等于</option></select>';
		} else {
			strHtml += '<option value="1">小于等于</option><option value="0">小于</option></select>';
		}
		strHtml += ' <input type="text" style="width:50px" disabled="disabled" id="supplierCountTemp_' + totalCount + '" value="' + supplierCount + '" />';
		strHtml += '且' + strSel.replace('[id]', 'id="sel_' + totalCount + '"').replace('[onchange]', 'onchange="changeSel(' + totalCount + ')"');
		strHtml += ' <input type="text" style="width:50px" onblur="setOutType(' + totalCount + ',2)" id="supplierCount_' + totalCount + '"/>';
		strHtml += '家时，每轮淘汰';
		strHtml += '<input type="text" style="width:50px" id="outCount_' + totalCount + '"/>';
		strHtml += '家供应商；';
		$("#tbOutType").append(strHtml);

		$("#lastCount").val("");
		$("#lastout").val("");
		$("#lastKeep").val("");
		$("#sel_last").val("0");
		var Tdrt = '<input type="hidden" name="auctionOutTypes[' + totalCount + '].countType" value="' + $('#sel_' + totalCount).val() + '"/>';
		Tdrt += '<input type="hidden" name="auctionOutTypes[' + totalCount + '].countValue" />';
		Tdrt += '<input type="hidden" name="auctionOutTypes[' + totalCount + '].outValue" />';

		$("#tbOutType").append(Tdrt)
		$('#supplierCount_' + totalCount).on('change', function () {
			if ($(this).val() != "") {
				if (!(/^[0-9]\d*$/.test($(this).val()))) {
					parent.layer.alert("供应商数量只能是正整数");
					$(this).val("");
					return;
				};
			}
			$('input[name="auctionOutTypes[' + totalCount + '].countValue"]').val($(this).val())
		});
		$('#outCount_' + totalCount).on('change', function () {
			if ($(this).val() != "") {
				if (!(/^[0-9]\d*$/.test($(this).val()))) {
					parent.layer.alert("每轮淘汰供应商数量只能是正整数");
					$(this).val("");
					return;
				};
			}
			$('input[name="auctionOutTypes[' + totalCount + '].outValue"]').val($(this).val())
		});
	}
	else {
		supplierCount = $("#supplierCount_" + obj).val();
		if (supplierCount == "") {
			return;
		}
		if (obj == totalCount) {
			$("#lastCount").val(supplierCount);
		}
	}

	for (i = obj; i < totalCount; i++) {
		if (i == obj) {
			supplierCount = $("#supplierCount_" + i).val();
			$("#supplierCountTemp_" + (i + 1)).val(supplierCount);
			$("#supplierCount_" + (i + 1)).val("");
		} else {
			$("#supplierCountTemp_" + (i + 1)).val("");
			$("#supplierCount_" + (i + 1)).val("");
			$("#lastCount").val("");
		}
	}
};
$("#supplierCount_0").on('change', function () {
	if ($(this).val() != "") {
		if (!(/^[0-9]\d*$/.test($(this).val()))) {
			parent.layer.alert("供应商数量只能是正整数");
			$(this).val("");
			return;
		};
	}
})
$("#outCount_0").on('change', function () {
	if ($(this).val() != "") {
		if (!(/^[0-9]\d*$/.test($(this).val()))) {
			parent.layer.alert("每轮淘汰供应商数量只能是正整数");
			$(this).val("");
			return;
		};
	}
})
$("#lastout").on('change', function () {
	if ($(this).val() != "") {
		if (!(/^[0-9]\d*$/.test($(this).val()))) {
			parent.layer.alert("每轮淘汰供应商数量只能是正整数");
			$(this).val("");
			return;
		};
	}
	$('.lastKeep').val("");
})
$('.lastKeep').on('change', function () {
	if ($(this).val() != "") {
		if (!(/^[1-9]\d*$/.test($(this).val()))) {
			parent.layer.alert("最终剩余供应商数量能是正整数");
			$(this).val("");
			return;
		};
		$(".lastkp").html($(this).val())
	}
	if ($("#supplierCount_0").val() > 0) {
		if (parseInt($(this).val()) > parseInt($("#lastout").val())) {
			parent.layer.alert("最终剩余供应商数量要小于每轮淘汰数");
			$(this).val("");
			$(".lastkp").html("1")
		};
	} else if ($("#supplierCount_0").val() == 0) {
		if (parseInt($(this).val()) > parseInt($("#outCount_0").val())) {
			parent.layer.alert("最终剩余供应商数量必须要小于每轮淘汰数");
			$(this).val("");
			$(".lastkp").html("1")
		};
	};

})
function resetOutType() {
	parent.layer.confirm('确定要重置淘汰条件吗？', function (index, layero) {
		$("#supplierCount_0").val("");
		$("#tbOutType").html("");
		$("#formCount").html("");
		$("#lastCount").val("");
		$("#outCount_0").val("");
		$("#lastout").val("");
		$("#lastKeep").val("");
		totalCount = 0;
		$("#sel_0").val(0);
		$("#sel_last").val(0);
		$("#span0").show();
		$("#span1").hide();
		$("#trOutType").show();
		$("#btnAddOutType").show();
		parent.layer.close(index);
	});
};

//上传附件
var FileInput = function () {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function (FileName, uploadUrl, filetype, filetable, flag) {

		filesDataView(filetype, filetable)
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
			$.ajax({
				type: "post",
				url: saveImgUrl,
				async: false,
				data: {

					'modelId': packageData.id,
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
			if (filetype == 'JJ_AUCTION_SPECIFICATION') {
				$.ajax({
					type: "post",
					url: top.config.AuctionHost + '/AuctionSpecificationController/saveSpecifications',
					async: false,
					data: {
						auctionType: $('input[name="auctionType"]:checked').val(),

						id: packageData.id
					},
					datatype: 'json',
					success: function (data) {
						if (data.success == true) {
							if (data.data) {
								$("#noTaxBudgetPrice").val(data.data)
							}
						} else {
							parent.layer.alert(data.message)
							$.ajax({
								type: "post",
								url: deleteFileUrl,
								async: false,
								dataType: 'json',
								data: {
									"id": fileId,
								},
								success: function (data) {
									filesDataView('JJ_AUCTION_SPECIFICATION', 'detaillist_operation_table');

								}
							});

						}

					}

				});
			}

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
			'modelId': packageData.id,
			'modelName': modelName
		},
		datatype: 'json',
		success: function (data) {
			let flieData = data.data
			if (data.success == true) {

				if (modelName == 'JJ_AUCTION_PROJECT_PACKAGE') {
					filesData = flieData
				} else  {
					if (flieData && flieData.length > 0) {
						for (var e = 0; e < flieData.length; e++) {
							fileId = flieData[e].id
						}
					}
					filesDataDetail = flieData



				}


			}
		}
	});
	
	if (filesData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	if (filesDataDetail.length > 0) {
		$(".detailed_list").hide()

	} else {
		$(".detailed_list").show()
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
			width: '120px',
			align: "center",
			events: {
				'click .openAccessory': function (e, value, row, index) {
					var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					window.location.href = $.parserUrlForToken(url);
				}
			},
			formatter: function (value, row, index) {
				
				var dowl = '<button type="button" class="btn btn-sm btn-primary openAccessory">下载</button>'
				var dels = '<button type="button" class="btn btn-sm btn-danger" onclick=fileDetel(' + index + ',\"' + row.id + '\",\"' + row.modelName + '\")>删除</button>'
				return dowl + dels
			}
		},
		]
	});

	if (modelName == 'JJ_AUCTION_PROJECT_PACKAGE') {
		$('#' + viewTableId).bootstrapTable("load", filesData);	
	} else {
		$('#' + viewTableId).bootstrapTable("load", filesDataDetail);


	}

};

function fileDetel(i, uid, modelName) {
	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		// 附件 清单总监附件

		if (modelName == 'JJ_AUCTION_PROJECT_PACKAGE') {
			//递交采购文件附件
			filesData.splice(i, 1);
			
		} else {
			if ($("#noTaxBudgetPrice").val()) {
				$("#noTaxBudgetPrice").val("")
			}
			filesDataDetail.splice(i, 1);



		}
		if (uid.length == 32) {
			$.ajax({
				type: "post",
				url: deleteFileUrl,
				async: false,
				dataType: 'json',
				data: {
					"id": uid,
				},
				success: function (data) { }
			});
		}
		/*filesDataView();*/
		if (modelName == 'JJ_AUCTION_SPECIFICATION') {
			filesDataView('JJ_AUCTION_SPECIFICATION', 'detaillist_operation_table');
		} else if (modelName == 'JJ_AUCTION_SINGLE_OFFERES') {
			filesDataView('JJ_AUCTION_SINGLE_OFFERES', 'singlebidlist_operation_table');
		} else {
			filesDataView('JJ_AUCTION_PROJECT_PACKAGE', 'filesData');
		}
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});

}
function changeSel(obj) {
	if (totalCount == 0) {
		$("#sel_last").val($("#sel_0").val());
	}
	else {
		if (totalCount == obj) {
			$("#sel_last").val($("#sel_" + obj).val());
		} else {
			$("#selTemp_" + (obj + 1)).val($("#sel_" + obj).val());
		}
		$('input[name="auctionOutTypes[' + obj + '].countType"]').val($("#sel_" + obj).val())
	}
}
function reduce_Charge(i) {
	var obj = $("#Charge_Percents" + i);
	if (obj.val() <= 0) {
		obj.val(0);
	} else {
		obj.val(parseInt(obj.val()) - 1);
	}
	obj.change();

}

function add_Charge(i) {
	var obj = $("#Charge_Percents" + i);
	obj.val(parseInt(obj.val()) + 1);
	obj.change();
}

//start采购代理服务费
$("#agentFeeType").change(function(){
	var val = $(this).val();
	agentFeeChange(val);
});
function agentFeeChange(val){
	if(val == 0){  //固定金额
		$("#agentFeeTxt").html("收费金额（元）<i class='red'>*</i>");
		$("#payModel").hide();
		$("#payMoney").show();
		$("#discount").hide();
		$("#other").hide();
		
	} else if(val == 1){  //标准累进制
		$("#payModel").css("display","inline-block");
		if($("#payModel").val() == 0){
			$("#agentFeeTxt").html("优惠系数（如8折输0.8）<i class='red'>*</i>");		
			$("#payMoney").hide();
			$("#discount").show();
			$("#other").hide();
		} else {
			$("#agentFeeTxt").html("");		
			$("#payMoney").hide();
			$("#discount").hide();
			$("#other").hide();
		}
	} else if(val == 2){ //其他
		$("#agentFeeTxt").html("收取说明");
		$("#payModel").hide();
		$("#payMoney").hide();
		$("#discount").hide();
		$("#other").show();
	}
}
$("#payModel").change(function(){
	var val = $(this).val();
	if(val == 0){
		$("#agentFeeTxt").html("优惠系数（如8折输0.8）");		
		$("#payMoney").hide();
		$("#discount").show();
		$("#other").hide();
	} else {
		$("#agentFeeTxt").html("");		
		$("#payMoney").hide();
		$("#discount").hide();
		$("#other").hide();
	}
});
//提交时验证服务费规则
function checkAgentFee(openServiceFee){
	if(openServiceFee == 1){
		var moneyReg = /^(([1-9]\d{0,11})(\.\d{1,2})?)$|^(0\.((0[1-9])|([1-9]\d?)))$/;
		var discountReg = /^(0\.\d{1,2}$)$/;
		if($("#agentFeeType").val() == "0" && !moneyReg.test($("#payMoney").val())){
			top.layer.alert("请正确输入收费金额");
			return false;
		} else if($("#agentFeeType").val() == "1"){
			if($("#payModel").val() == 0){
				if($("#discount").val() == "0" || $("#discount").val() == "1"){
					return true;
				} else if(!discountReg.test($("#discount").val())) {
					top.layer.alert("请正确输入优惠系数");
					return false;
				}
			}
		}
	}
	return true;
}
//end采购代理服务费