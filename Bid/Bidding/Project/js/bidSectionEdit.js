var saveUrl = config.tenderHost + '/BidSectionController/save.do'; // 点击添加项目保存的接口（后审）
var preSaveUrl = config.tenderHost + '/BidSectionController/saveBidSectionPretrial.do'; // 点击添加项目保存的接口(预审)
var reSaveUrl = config.tenderHost + '/BidExcepitonController/toTheTender.do'; // 重新招标保存的接口
var reBidder = config.tenderHost + '/BidSectionController/findSupplierList.do';//重新招标选择标段后查询标段下购买过文件的投标人列表
var reEditBidder = config.tenderHost + '/BidSectionController/findNewSupplierList.do';//重新招标编辑时标段下购买过文件的投标人列表
var getDetailUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var getPreDetailUrl = config.tenderHost + '/BidSectionController/getBidSectionPretrialInfo.do'; // 标段详情
var detailUrl = config.tenderHost + '/BidExcepitonController/getExcepiton.do'; // 旧标段详情
var isPublicProject = "0"; //是否公共资源项目
var className = "";//标段分类的字典表名
var typeCode = "A";  //标段类型
var id = "",tenderProjectId = "";//标段id、招标项目id
var bidSectionId = "";  //重新招标id
var source = "";  // 1是重新招标
var tenderProjectClassifyCode = "";
var isAgency; //是否咨询公司
var examType, tenderMode, tenderProjectId;
var bidderArr = [];//重新招标选择标段后查询标段下购买过文件的投标人
var isSubFile;//有无(招标)预审文件
var from = $.getUrlParam("from");// 预审未结束前可编辑预审标段中关于后审部分信息及后审阶段的后审标段部分信息
var feeConfirmVersion = 2;//服务费版本号
$(function(){
	if ($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	};
	if ($.getUrlParam("tenderMode") && $.getUrlParam("tenderMode") != "undefined") {
		tenderMode = $.getUrlParam("tenderMode");
	}
	// 获取连接传递的参数
	if ($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined") {
		tenderProjectId = $.getUrlParam("tenderProjectId");
	}
	if ($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
	}
	if ($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined") {
		bidSectionId = $.getUrlParam("bidSectionId");
	}
	if ($.getUrlParam("feeConfirmVersion") && $.getUrlParam("feeConfirmVersion") != "undefined") {
		feeConfirmVersion = $.getUrlParam("feeConfirmVersion");
	}
	//是否咨询公司
	if ($.getUrlParam("isAgency") && $.getUrlParam("isAgency") != "undefined") {
		isAgency = $.getUrlParam("isAgency");
	} else {
		isAgency = entryInfo().isAgency;
	};
	if ($.getUrlParam("classCode") && $.getUrlParam("classCode") != "undefined") {
		typeCode = $.getUrlParam("classCode");
	};
	//是否公共资源
	if ($.getUrlParam("isPublicProject") && $.getUrlParam("isPublicProject") != "undefined") {
		isPublicProject = $.getUrlParam("isPublicProject");
		if (isPublicProject == 1) {  //当招标项目为公共资源时，是否报名为否
			className = "TENDER_PROJECT_CLASSIFY_CODE";  //标段分类
			$("[name='depositCollect']").val("1");
			$("[name='depositCollect']").attr("disabled", "disabled");
		} else {
			className = "TENDER_PROJECT_CLASSIFY_0CODE";  //标段分类
		}
	};
	
	//招标方式
	/* $("[name='tenderMode']").change(function() {
		changeTenderMode($(this).val())
	}); */
	// changeExamType(2);
	changeExamType(examType);
	//资格审查方式
	$("[name='examType']").change(function() {
		changeExamType($(this).val())
	});
	//招标项目类型
	if (typeCode == "C50") {
		classifyChange("C");
	} else {
		classifyChange(typeCode);
	}
	if (!id && !bidSectionId) {
		$(".tenderProjectClassifyCodeTxt").dataLinkage({
			optionName: className,
			optionValue: typeCode,
			selectCallback: function (code) {
				tenderProjectClassifyCode = code;
			}
		});
		$(".tenderProjectClassifyCodeTxt select:first").hide();
	};
	
	//交易流程
	$("[name='process']").click(function () {
		var val = $("[name='process']:checked").val();
		if (val == 2) {
			$("[name='signUpType'][value=1]").prop("checked", "checked");
			$("[name='deliverFileType'][value=1]").prop("checked", "checked");
			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		}
		processChange(val);
	});
	//招标文件获取方式
	$(".isOnline input:radio").change(function () {
		var val = $("[name='process']:checked").val();
		processChange(val);
	});
	//报名
	$('[name=signUp]').change(function(){
		isSignUp($(this).val());
	});
	//中标服务费收取方式
	$(".payType").change(function () {
		var payType = $(this).val();
		winBid(payType);
	});
	//招标文件是否出售，是否有图纸文件
	$(".iptPay").each(function () {
		displayInp(this);
	});
	//招标文件是否出售，是否有图纸文件
	$('.iptPay').change(function () {
		displayInp(this);
	});
	//清单文件
	detailedListFileChange($("[name='isHasDetailedListFile']:checked").val());
	$("[name='isHasDetailedListFile']").change(function () {
		var val = $(this).val();
		detailedListFileChange(val);
	});
	//控制价是否发布
	controlPriceChange($("[name='isHasControlPrice']:checked").val());
	$("[name='isHasControlPrice']").change(function () {
		var val = $(this).val();
		controlPriceChange(val);
	});
	//是否收取保证金
	$('[name=isCollectDeposit]').change(function(){
		payDeposit($(this).val(),true)
	});
	//保证金计算方式
	$("[name='depositType']").click(function () {
		var val = $("[name='depositType']:checked").val();
		formatDeposit(val);
	});
	//保证金收取人
	$("[name='depositCollect']").change(function () {
		var val = $(this).val();
		depositChange(val);
	});
	/*保证金递交方式改变后投标保证金缴纳方式改变 */
	$('[name=depositChannelType]').change(function () {
		changeChannel($("[name='depositChannelType']:checked").val())
	});
	//是否联合体
	$("[name='syndicatedFlag']").click(function () {
		var val = $("[name='syndicatedFlag']:checked").val();
		syndicatedChange(val);
	});
	//预审标段是否提前编制招标文件
	$("[name='isAdvanceBidFile']").click(function(){
		var val = $("[name='isAdvanceBidFile']:checked").val();
		isBidFile(1, val);
	});
	/*购买过招标文件的投标人是否需要再次购买*/
	$('.re_tender').hide();
	//source
	if ($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
	}
	//source：1 重新招标
	if (source == 1) {
		$("#btnSave,#btnReSubmit").show();
		$("#btnSubmit").hide();
		$("[name='bidSectionName']").attr("readonly", "readonly");
		$("[name='bidSectionName']").addClass("readonly");
		$(".bidCode").show();
		/*购买过招标文件的投标人是否需要再次购买*/
		$('.re_tender').show();
	} else {
		$("#btnSave,#btnReSubmit").hide();
		$("#btnSubmit").show();
		$("[name='bidSectionName']").removeAttr("readonly");
		$("[name='bidSectionName']").removeClass("readonly");
		$(".bidCode").hide();
		$('.re_tender').hide();
	};
	//预审评审办法切换
	pretrialChange($('[name=pretrialCheckType]').val())
	//评审办法
	$('[name=pretrialCheckType]').change(function(){
		var val = $(this).val();
		pretrialChange(val)
	});
	if (id) {
		getDetail();
		if (source == 1) {
			getReTenserList(id)
		}
		//判断标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制相关字段不可编辑,data-disabled用于保存后添加disabled属性
		getHasFile('bid', id, function(id, isSub){
			if(isSub){
				isSubFile = isSub;
				$.each($('td'), function(index, item){
					if(!$(this).hasClass('allowEdit')){
						$(this).find('input').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('select').attr({'disabled': true, 'data-disabled': '*'});
						$(this).find('textarea').attr({'disabled': true, 'data-disabled': '*'});
					}
				})
			}
		});
	} else {
	
		$('#bidEctionNum').val('1');
	
		//添加时初始化项目类型
	
	}
	if (bidSectionId) {
		getDetail();
		if (source == 1) {
			getReTenser(bidSectionId)
			//判断标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制相关字段不可编辑,data-disabled用于保存后添加disabled属性
			getHasFile('bid', '', function(id, isSub){
				if(isSub){
					isSubFile = isSub;
					$.each($('td'), function(index, item){
						if(!$(this).hasClass('allowEdit')){
							$(this).find('input').attr({'disabled': true, 'data-disabled': '*'});
							$(this).find('select').attr({'disabled': true, 'data-disabled': '*'});
							$(this).find('textarea').attr({'disabled': true, 'data-disabled': '*'});
						}
					})
				}
			});
		}
	};
	
	//保存
	$("#btnSave").click(function () {
		saveForm(true);
	});
	//重新招标提交
	$("#btnReSubmit").click(function () {
		var tips = '';
		if (checkForm($("#formName"))) {//必填验证，在公共文件unit中
			if(examType == 1){
				if($('#pretrialCheckType').val() == 2){
					if(Number($('#pretrialPassNumber').val() < 3)){
						parent.layer.alert('限制人数需大于等于3');
						return
					}
				}
				for(var i = 0;i<bidderArr.length;i++){
					if($('[name="bidPayCosts['+i+'].isPreFee"]:checked').val() == undefined){
						parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次资格预审文件费用');
						return;
					}
					if($('[name="bidPayCosts['+i+'].isTenderFee"]:checked').val() == undefined){
						parent.layer.alert('请选择是否免除投标人 '+bidderArr[i].enterpriseName + ' 的本次招标文件费用');
						return;
					}
				}
				tips = '此标段已提交资格预审文件，修改标段信息后请及时更新对应资格预审文件内容';
			}else if(examType == 2){
				if ($("[name='projectDuration']").val().length > 4) {
					parent.layer.alert("工期输入最多4位", function (idx) {
						$("[name='projectDuration']").focus();
						parent.layer.close(idx);
					});
					return;
				}
				/* for (var i = 0; i < bidderArr.length; i++) {
					if ($('[name="bidPayCosts[' + i + '].isTenderFee"]:checked').val() == undefined) {
						parent.layer.alert('请选择是否免除投标人 ' + bidderArr[i].enterpriseName + ' 的本次招标文件费用');
						return;
					}
				} */
				tips = '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容';
			}
			
			if(bidSectionId){
				getHasFile('bid', '', function(){
					saveForm(false);
				}, tips);
			}else{
				saveForm(false);
			}
		}
	});
	
})

function passMessage(data, callback){
	if (!data.bidSectionId) {//新增
		$("[name='bidSectionName']").val(data.bidSectionName?data.bidSectionName:data.tenderProjectName);
	};
	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//提交
	$("#btnSubmit").click(function () {
		var tips = '';
		if (checkForm($("#formName"))) {//必填验证，在公共文件unit中
			if(examType == 1){
				if($('#pretrialCheckType').val() == 2){
					if(Number($('#pretrialPassNumber').val() < 3)){
						parent.layer.alert('限制人数需大于等于3',function(ind){
							parent.layer.close(ind);
							$('#pretrialPassNumber').focus();
						});
						return
					}
				};
				tips = '此标段已提交资格预审文件，修改标段信息后请及时更新对应资格预审文件内容';
			}else if(examType == 2){
				if ($(".zjDiscount .discount").attr("datatype")) {
					if (Number($(".zjDiscount .discount").val()) <= 0 || Number($(".zjDiscount .discount").val()) > 1) {
						parent.layer.alert("优惠系数为0到1", function (idx) {
							$(".zjDiscount .discount").focus();
							parent.layer.close(idx);
						});
						return;
					}
				}
				if ($("[name='projectDuration']").val().length > 4) {
					parent.layer.alert("工期输入最多4位", function (idx) {
						$("[name='projectDuration']").focus();
						parent.layer.close(idx);
					});
					return;
				}
				tips = '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容';
			}
			if(id){
				getHasFile('bid', id, function(){
					saveForm(false, callback);
				}, tips);
			}else{
				saveForm(false, callback);
			}
		}
	
	});
}
//标段分类选择
function classifyChange(val) {
	if (val == "A") {
		//工程建设招投标以元为单位；非工程可以万元
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		if(id == ""){
			$("[name='priceUnit']").val("0");
		}
		$("[name='priceUnit']").attr("disabled", "disabled");
		//工程建设招投标以人民币为单位；非工程可选择其他币种
		$("[name='currencyCode']").val("156");
		$("[name='currencyCode']").attr("disabled", "disabled");
		// if ($("[name='examType']:checked").val() == 2) {
		if (examType == 2) {
			if (isPublicProject == 1) {  //当招标项目为公共资源时，是否报名为否
				$("[name='signUp'][value=0]").prop("checked", "checked");
				$("[name='signUp'][value=1]").parent("label").remove();
				$("[name='enterSignUp'][value='0']").prop("checked", "checked");
				$(".signUpShow").hide();
			}
		}
	} else {
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		if(id == ""){
			$("[name='priceUnit']").val("0");
		}
		$("[name='priceUnit']").attr("disabled", "disabled");
		$("[name='currencyCode']").removeAttr("disabled");
	}
	if (val == "A") {
		$(".projectShow").show();
		if ($(".drawCost [name='isPay']:checked").val() == 1) {
			$(".drawCost").find(".payMoney").attr("datatype", "positiveNum");
		} else {
			$(".drawCost").find(".payMoney").removeAttr("datatype");
		}
		$(".projectShow").find("[name='commencementDate']").attr("datatype", "*");

		$(".goodsShow").hide();
	} else if (val == "B") {
		$(".projectShow").hide();
		$(".goodsShow").show();
		$(".drawCost").find(".payMoney").removeAttr("datatype");
		$(".projectShow").find("[name='commencementDate']").removeAttr("datatype");
	} else if (val == "C") {
		$(".projectShow").hide();
		$(".goodsShow").hide();
		$(".projectShow").find("[name='commencementDate']").removeAttr("datatype");
		$(".drawCost").find(".payMoney").removeAttr("datatype");
	}
}
//切换招标方式
/* function changeTenderMode(val){
	if(val == 2) {
		$("[name='examType'][value=2]").prop("checked", "checked");
		$("[name='examType'][value=1]").attr("disabled", "disabled");
	} else {
		$("[name='examType'][value=1]").removeAttr("disabled");
	}
	changeExamType($("[name='examType']:checked").val());
}; */
function changeExamType(val){
	$.each($('tr'), function(ind, item){
		if($(this).hasClass('examType' + val)){
			$(this).remove()
		}
	});
	if(val == 2) {
		creatPostHtml()
		$('#transactionProcess').after(postHtml);
		$('.payType').val(3);
		winBid(3);
		isBidFile(val, 0);
		//下拉框数据初始化
		initSelect('.select');
		//的保障金收取默认代理机构
		$("[name='depositCollect']").val(2);
		//保证金收取方式
		depositChange('2');
	} else if(val == 1) {
		creatPreHtml()
		$('#transactionProcess').after(preHtml);
		isBidFile(val, 1);
	}
	processChange($('[name=process]:checked').val());
	// isShowSignUp($('[name=tenderMode]:checked').val(), val);
	isShowSignUp(tenderMode, val);
	initCkeckType();
	//招标文件处编辑标段信息时，部分可编辑
	if(from == 'bidFile'){
		$('.bidFileEdit').attr('disabled','disabled');
		$(".tenderProjectClassifyCodeTxt select").eq(1).attr('disabled','disabled');
	}
}
function isShowSignUp(val, exam){
	if(val == 1){
		$("[name='signUp'][value='0']").prop("checked", "checked");
		$("[name='enterSignUp'][value='0']").prop("checked", "checked");
		$(".isSignUpShow").show();
		$(".signUpShow").hide();
		$(".isBidPriceShow").show();//暗标
	} else {
		$("[name='signUp'][value='0']").prop("checked", "checked");
		$("[name='enterSignUp'][value='0']").prop("checked", "checked");
		$(".signUpShow").hide();
		$(".isSignUpShow").hide();
		$(".isBidPriceShow").show();
	}
	if(exam == 2){
		$(".isBidPriceShow").show();
	}else{
		$(".isBidPriceShow").hide().val('0');
	}
};
//交易流程
function processChange(val) {
	// var exam = $('[name=examType]:checked').val();//资格审查方式
	var exam =examType;//资格审查方式
	if (val == 1) {
		if(exam == 2){
			$("[name='signUpType'][value=1], [name='deliverFileType'][value=1], [name='bidOpenType'][value=1], [name='bidCheckType'][value=1]").prop("checked", "checked");
			$("[name='bidOpenType'][value=1], [name='bidCheckType'][value=1], [name='signUpType'][value=1], [name='deliverFileType'][value=1]").removeAttr("disabled");
			$(".isOnline").hide();
		}else if(exam == 1){
			$("[name='pretrialGetFileType'][value=1], [name='pretrialDeliverFileType'][value=1], [name='pretrialOpenType'][value=1], [name='pretrialReviewType'][value=1]").prop("checked", "checked");
			$("[name='pretrialOpenType'][value=1], [name='pretrialReviewType'][value=1], [name='pretrialGetFileType'][value=1], [name='pretrialDeliverFileType'][value=1]").removeAttr("disabled");
			$(".isOnline").hide();
		}
		
	} else if (val == 2) {
		$(".isOnline input:radio").removeAttr("disabled");
		if(exam == 2){
			if ($("[name='signUpType']:checked").val() == 2) {
				$("[name='deliverFileType'][value=1], [name='bidOpenType'][value=1], [name='bidCheckType'][value=1]").attr("disabled", "disabled");
			
				$("[name='deliverFileType'][value=2], [name='bidOpenType'][value=2], [name='bidCheckType'][value=2]").prop("checked", "checked");
			} else if ($("[name='deliverFileType']:checked").val() == 2) {
				$("[name='bidOpenType'][value=1], [name='bidCheckType'][value=1]").attr("disabled", "disabled");
				$("[name='bidOpenType'][value=2], [name='bidCheckType'][value=2]").prop("checked", "checked");
			} else if ($("[name='bidOpenType']:checked").val() == 2) {
				$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");
				$("[name='bidCheckType'][value=2]").prop("checked", "checked");
			}
			$(".isOnline.examType2").show();
		}else if(exam == 1){
			if($("[name='pretrialGetFileType']:checked").val() == 2){
				$("[name='pretrialDeliverFileType'][value=1], [name='pretrialOpenType'][value=1], [name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
				
				$("[name='pretrialDeliverFileType'][value=2], [name='pretrialOpenType'][value=2], [name='pretrialReviewType'][value=2]").prop("checked", "checked");
			} else if($("[name='pretrialDeliverFileType']:checked").val() == 2) {
				$("[name='pretrialOpenType'][value=1], [name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
				
				$("[name='pretrialOpenType'][value=2], [name='pretrialReviewType'][value=2]").prop("checked", "checked");
			} else if($("[name='pretrialOpenType']:checked").val() == 2) {
				$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
				$("[name='pretrialReviewType'][value=2]").prop("checked", "checked");
			}
			$(".isOnline.examType1").show();
		}
		
	}
}
//是否报名
function isSignUp(val){
	if (val == 1) {
		$(".signUpShow").show();
	} else {
		$("[name='enterSignUp'][value='0']").prop("checked", "checked");
		$(".signUpShow").hide();
	}
}
//中标服务费收取方式
function winBid(payType) {
	if (payType == 3) {
		$(".payTypeTit").html('优惠系数（如8折输0.8）<i class="red">*</i>');
		$(".zjDiscount input").attr("datatype", "positiveNum");
		$(".zjDiscount").show();

		$(".zjPayMoney").hide();
		$(".zjPayRatio").hide();

		$(".zjPayMoney input").removeAttr("datatype").val('');
		$(".zjPayRatio input").removeAttr("datatype").val('');

	} else if (payType == 2) {
		//		$(".sltDiscount").hide();
		$(".payTypeTit").html('中标服务费收费比例(%)<i class="red">*</i>');
		$(".zjPayMoney").hide();
		$(".zjPayRatio").show();
		$(".zjDiscount").hide();
		$(".zjPayMoney input").removeAttr("datatype").val('');
		$(".zjPayRatio input").attr("datatype", "positiveNum");
		$(".zjDiscount input").removeAttr("datatype").val('');
	} else if (payType == 1) {
		//		$(".sltDiscount").hide();
		var pricePriceUnit = '元';
		if ($('[name=priceUnit]').val() == 1) {
			pricePriceUnit = '万元'
		}
		$(".payTypeTit").html('中标服务费收费金额(' + pricePriceUnit + ')<i class="red">*</i>');
		$(".zjPayMoney").show();
		$(".zjPayRatio").hide();
		$(".zjDiscount").hide();
		$(".zjPayMoney input").attr("datatype", "positiveNum");
		// 根据是否为万元修改可保留小数位
		if ($('[name=priceUnit]').val() == 1) {
			$(".zjPayMoney input").attr("oninput", "priceInput(this,6)");
		} else {
			$(".zjPayMoney input").attr("oninput", "priceInput(this,2)");
		}
		$(".zjPayRatio input").removeAttr("datatype").val('');
		$(".zjDiscount input").removeAttr("datatype").val('');
	}
}
//费用
function displayInp(obj) {
	var self = $(obj).closest("tr");
	var val = self.find(".isPay:checked").val();
	if (val == 0) {
		//		self.find(".payMoney").val("");
		self.find(".payMoney").removeAttr("datatype");
		self.find(".costShow").hide();
	} else {
		self.find(".payMoney").attr("datatype", "positiveNum");
		self.find(".costShow").show();
	}
	if(examType == 2){}{
		if (typeCode == "A") {
			if ($("[name='draw']:checked") == 1) {
				$(".drawCost .payMoney").attr("datatype", "positiveNum");
			}
		} else {
			$(".drawCost .payMoney").removeAttr("datatype");
		}
	}
};
//格式化费用
function formatCost(data) {
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		$(".cost").each(function () {
			if ($.trim($(this).find(".costName").val()) == item.costName) {
				$(this).find(".isPay").hasClass("iptPay") ? $(this).find(".isPay[value='" + item.isPay + "']").prop("checked", "checked") : $(this).find(".isPay").val(item.isPay);
				$(this).find(".payMoney").val(item.payMoney);
				$(this).find(".costName").length > 0 ? $(this).find(".costName").val(item.costName) : "";
				$(this).find(".payModel").length > 0 ? $(this).find(".payModel").val(item.payModel) : "";
				$(this).find(".payType").length > 0 ? $(this).find(".payType").val(item.payType) : "";
				$(this).find(".discount").length > 0 ? $(this).find(".discount").val(item.discount) : "";
				$(this).find(".payRatio").length > 0 ? $(this).find(".payRatio").val(item.payRatio) : "";
	
				if (item.costName == "中标服务费") {
					winBid(item.payType, item.discount);
				}
				return;
			}
		});
	
	}
	$(".iptPay").each(function () {
		displayInp(this);
	});
};
//清单文件
function detailedListFileChange(val){
	if (val == 1) {
		$("[name='isHasControlPrice'][value=1]").attr("checked", "checked");
		$("[name='isHasControlPrice'][value=0]").attr('disabled', true);
		controlPriceChange(1);
	}else{
		$("[name='isHasControlPrice'][value=0]").removeAttr('disabled');
	}
}
//控制价是否发布
function controlPriceChange(val) {
	if (val == 0) {
		$(".controlShow").hide();
		$("[name='isHasControlPrice'][value=0]").attr("checked", "checked");
	} else {
		$(".controlShow").show();
		$("[name='isHasControlPrice'][value=1]").attr("checked", "checked");
	}
};
/************************  是否收取保证金   *******************/
function payDeposit(val,isInit){
	if(val == 1){
		$('.isCollectDeposit').show();
		if(isInit){
			$('[name=depositType]').val([1]);
			$('[name=depositChannelType]').val([1]);
			$('.type_offline').show();
			$('[name=depositChannel]').val([1]);
			$('[name=depositCollect]').val(2);
			$('[name=depositMoney]').attr('datatype','positiveNum').val('');
			formatDeposit('1');
			depositChange('2');
		}
	}else if(val == 0){
		$('.isCollectDeposit').hide();
		$('.type_offline').hide();
		$('[name=depositMoney]').removeAttr('datatype').val('');
		$('[name=depositRatio]').removeAttr('datatype').val('');
		$('.isCollectDeposit input').each(function() {
		    $(this).removeAttr("checked");
		}); 
	}
};
//保证金
function formatDeposit(depositType) {
	if (depositType == 1) {
		$(".depositTit").html('保证金金额（元）<i class="red">*</i>');
		$("[name=depositMoney]").attr("datatype", "positiveNum");
		$("[name=depositRatio]").removeAttr("datatype");
		$(".depositMoney").show();
		$(".depositRatio").hide();
	} else {
		$(".depositTit").html('保证金比例（不低于投标总价）%<i class="red">*</i>');
		$("[name=depositMoney]").removeAttr("datatype");
		$("[name=depositRatio]").attr("datatype", "positiveNum");
		$(".depositMoney").hide();
		$(".depositRatio").show();
	}
};
//保证金收取人
function depositChange(val) {
	/*depositChannelType 保证金递交方式  1 线上  2 线下 */
	if(top.virtualBondRules == 3){
		$('[name=depositChannelType][value=2]').prop('checked','checked')
		$('[name=depositChannelType][value=1]').attr('disabled','disabled')
	}else{
		if (val == 1) {//平台
			$("[name='depositChannelType'][value=1]").prop("checked", "checked");
	
			$("[name='depositChannelType'][value=1]").removeAttr("disabled");
			$("[name='depositChannelType'][value=2]").attr("disabled", "disabled");
		} else if (val == 2) {//代理机构
			if (isAgency == 1) {
				$("[name='depositChannelType'][value=2]").removeAttr("disabled");
				$("[name='depositChannelType'][value=1]").removeAttr("disabled");
				/*********         保证金虚拟子账户规则   media/js/base/IndexMenu.js */
				if(top.virtualBondRules == 1 || top.virtualBondRules == 2){
					if($('.virtualBondBank').length == 0){
						$(".virtualBondRules").after(top.virtualBondHtml)
					}
				}
				/*********         保证金虚拟子账户规则   --end */
			} else {
				$("[name='depositChannelType'][value=2]").prop("checked", "checked");
	
				$("[name='depositChannelType'][value=1]").attr("disabled", "disabled");
				$("[name='depositChannelType'][value=2]").removeAttr("disabled");
			}
		} else if (val == 3) {//招标人
			$("[name='depositChannelType'][value=2]").prop("checked", "checked");
	
			$("[name='depositChannelType'][value=1]").attr("disabled", "disabled");
			$("[name='depositChannelType'][value=2]").removeAttr("disabled");
		}
	}
	changeChannel($("[name='depositChannelType']:checked").val())
};
/********      保证金递交方式改变后投标保证金缴纳方式改变     *********/
/*
 * 线上的只有虚拟子账户
 * 线下没有虚拟子账户
 * */
function changeChannel(val) {
	$('[name=depositChannel]').each(function () {
		$(this).removeAttr("checked");
	});
	if (val == 1) {
		$('.type_online').hide();
		$('.type_offline').show();
		$('[name=depositChannel]').val([7])
	} else {
		$('.type_online').show();
		$('.type_offline').hide();
		$('[name=depositChannel]').val([1])
	}
};
//是否联合体投标
function syndicatedChange(val) {
	if (val == 0) {
		$(".syndMain").hide();
		$("[name='consortiumBidding']").val("");
		$("[name='consortiumBidding']").removeAttr("datatype");
	} else {
		$(".syndMain").show();
		$("[name='consortiumBidding']").attr("datatype", "*");
	}
}
 //是否提前编制招标文件
function isBidFile(exam, val){
 	if(val == 1){
 		$('.checkTypeOfExamType').show();
 		if(typeCode == "A"){
 			$('.preparedness').show();
 		}else{
 			$('.preparedness').hide();
 		}
 	}else{
 		$('.checkTypeOfExamType').hide();
 		$('.preparedness').hide();
 	}
	setCkeckType(exam, val);
}
/*****************                 拟采用的评标办法                   ********************/
function setCkeckType(exam, isBid){
	var html = '<td class="th_bg">拟采用的评标办法<i class="red">*</i></td><td colspan="3"><select name="checkType" class="form-control checkType" style="width:260px;display: inline-block;"></select></td>';
	if(exam == 2){
		$('.checkTypeOfExamType2').html(html);
		$('.checkTypeOfExamType1').html('');
		initCkeckType();
	}else if(exam == 1 && isBid == 1){
		$('.checkTypeOfExamType1').html(html);
		$('.checkTypeOfExamType2').html('');
		initCkeckType();
	}else{
		$('.checkTypeOfExamType1').html('');
		$('.checkTypeOfExamType2').html('');
	}
}
function initCkeckType(){
	if (typeCode == "C50") {
		$(".checkType").attr("selectName", "checkType" + "C");
	} else {
		$(".checkType").attr("selectName", "checkType" + typeCode);
	}
	initSelect(".checkType");
}
/*****************                 拟采用的评标办法     -end              ********************/
/*****************                 保存预审、后审标段           **********************/
/*
 * 表单提交
 * isSave: true保存， false提交  
 */
function saveForm(isSave, callback) {
	var arr = {}, tips = "", url = "";
	/* 有招标文件（预审文件）时移除所有的，没有时走原来逻辑 */
	if(isSubFile){
		$.each($('td'), function(index, item){
			$(this).find('[data-disabled="*"]').removeAttr('disabled');
		})
	}else{//无
		if(examType == 2){// 后审
			$('input[type=radio][name=bidOpenType]').prop('disabled', false);
			$('input[type=radio][name=bidCheckType]').prop('disabled', false);
			$("[name='depositCollect']").prop('disabled', false);
		}else if(examType == 1){ //预审
			$('input[type=radio][name=pretrialOpenType]').prop('disabled',false);
			$('input[type=radio][name=pretrialReviewType]').prop('disabled',false);
		}
		
	}
	if(from == 'bidFile'){
		$('.bidFileEdit').attr('disabled',false);
		$(".tenderProjectClassifyCodeTxt select").eq(1).attr('disabled',false);
	}
	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	for (var key in arr) {
		arr[key] = $.trim(arr[key]);
	}
	if(from == 'bidFile'){
		arr.fileEdit = 1;
	}
	arr.projectCosts = [];
	if(examType == 2){// 后审
		$(".cost").each(function () {
			if($(this).hasClass('examType2')){
				var item = { isPay: ($(this).find(".isPay").hasClass("iptPay") ? $(this).find(".isPay:checked").val() : $(this).find(".isPay").val()), payMoney: $(this).find(".payMoney").val() };
				$(this).find(".costName").length > 0 ? item.costName = $(this).find(".costName").val() : "";
				$(this).find(".payModel").length > 0 ? item.payModel = $(this).find(".payModel").val() : "";
				$(this).find(".payType").length > 0 ? item.payType = $(this).find(".payType").val() : "";
				$(this).find(".discount").length > 0 ? item.discount = $(this).find(".discount").val() : "";
				$(this).find(".payRatio").length > 0 ? item.payRatio = $(this).find(".payRatio").val() : "";
				arr.projectCosts.push(item);
			}
		});
	}else if(examType == 1){
		$(".cost").each(function () {
			if($(this).hasClass('examType1')){
				var item = { isPay: ($(this).find(".isPay").hasClass("iptPay") ? $(this).find(".isPay:checked").val() : $(this).find(".isPay").val()), payMoney: $(this).find(".payMoney").val() };
				$(this).find(".costName").length > 0 ? item.costName = $(this).find(".costName").val() : "";
				$(this).find(".payModel").length > 0 ? item.payModel = $(this).find(".payModel").val() : "";
				arr.projectCosts.push(item);
			}
		});
	}
	if(examType == 2){// 后审
		var typeData = [];
		$("input[name='depositChannel']:checked").each(function (index, element) {
			typeData.push($(this).val());
		});
		
		arr.depositChannel = typeData.join(",");
		if($("input[name='isCollectDeposit']:checked").val() == 0){
			delete arr.depositCollect;
		}else if($("input[name='isCollectDeposit']:checked").val() == 1){
			if(arr.depositChannel == ''){
				parent.layer.alert('温馨提示：请选择投标保证金缴纳方式！');
				return
			};
			if(arr.depositChannelType == 1){
				if(!arr.bankType){
					parent.layer.alert('温馨提示：请选择虚拟子账户生成银行！');
					return
				}
			}else{
				arr.bankType = '';
			}
		}

		//判断评审办法是否为空
		if(arr.checkType == '' || arr.checkType == undefined){
			parent.layer.alert('温馨提示：请选择评标办法！');
			return
		}

		if (source == 1) {
			url = reSaveUrl;
			if (!isSave) {
				arr.isSubmit = 1;
			}
			arr.bidSectionId = bidSectionId;
		} else {
			url = saveUrl;
		}
	}else if(examType == 1){ //预审
		//判断评审办法是否为空
		if(arr.pretrialCheckType == '' || arr.pretrialCheckType == undefined){
			parent.layer.alert('温馨提示：请选择评标办法！');
			return
		}

		if(source == 1){
			url = reSaveUrl;
			if(!isSave){
				arr.isSubmit = 1;
			}
			arr.bidSectionId = bidSectionId;
		} else {
			url = preSaveUrl;
		}
	}
	/* 验证评审费承担方 */
	if(feeConfirmVersion == 2 && !(arr.feeUnderparty || arr.feeUnderparty == 0)){
		parent.layer.alert('温馨提示：请选择评审费是否含在代理服务费中！');
		return
	}
	if (id != "") {
		arr.id = id;
	}
	if (!arr.currencyCode || !arr.priceUnit) {
		arr.priceUnit = $("[name='priceUnit']").val();
		arr.currencyCode = $("[name='currencyCode']").val();
	}

	arr.tenderProjectClassifyCode = tenderProjectClassifyCode;
	arr.tenderProjectId = tenderProjectId;
	arr.examType = examType;
		
	$('#btnReSubmit').attr('disabled', true);
	$.ajax({
		url: url,
		type: "post",
		data: arr,
		success: function (data) {
			$('#btnReSubmit').attr('disabled', false);
			if(isSubFile){
				$.each($('td'), function(index, item){
					$(this).find('[data-disabled="*"]').attr('disabled', true);
				})
			};
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			id = data.data;
			
			if (source == 1) {
				if (!isSave) {
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭 
				} else {
					parent.layer.alert("保存成功", { icon: 1, title: "提示" });
				}
				window.parent.$('#tableList').bootstrapTable(('refresh'));
			} else {
				if(from == 'bidFile'){
					parent.layer.alert("标段信息已更新，若已编制招标文件请通过招标客户端重新制作，同步更新文件内容！", { icon: 1, title: "提示" });
				}else{
					parent.layer.alert("添加成功", { icon: 1, title: "提示" });
				}
				if(callback){
					callback();
				}
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭 
			}

		},
		error: function (data) {
			$('#btnReSubmit').attr('disabled', false);
			parent.layer.alert("加载失败");
		}
	});
};

/*****************                 保存预审、后审标段   -end        **********************/
function OnInputs(e) {
	MoneyInput(e, $("[name='priceUnit']").val());
}
//预审评审办法切换
 //预审评审办法
 function pretrialChange(val){
 	if(val == 2){
		$('.limitNum').show();
		$('#pretrialPassNumber').attr('datatype','num');
	}else{
		$('.limitNum').hide();
		$('[name=pretrialPassNumber]').val('');
		$('#pretrialPassNumber').removeAttr('datatype');
	}
 }
 /* 详情*/
 //标段详情
 function getDetail() {
 	var url = "", data = {};
 	if (bidSectionId != "") {
 		url = detailUrl;
 		data = { bidSectionId: bidSectionId }
 	}
 	if (id != "") {
 		if(examType == 1){
 			url = getPreDetailUrl
 		}else if(examType == 2){
 			url = getDetailUrl
 		}
 		data = { id: id }
 	}
 	$.ajax({
 		url: url,
 		type: "post",
 		data: data,
 		async: false,
 		success: function (data) {
 			if (data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			var arr = data.data;
			tenderProjectId = arr.tenderProjectId;
 			// if(from == 'bidFile'){
 			// 	var type = arr.tenderProjectClassifyCode.charAt(0);
 			// 	$(".checkType").attr("selectName", "checkType" + type);
 			// 	initSelect(".checkType");
				// // classifyChange(type);
 			// }
 			for (var key in arr) {
 				if(key == "isCollectDeposit"){
 					$("[name='isCollectDeposit'][value='"+arr['isCollectDeposit']+"']").prop("checked", true);
          			payDeposit(arr['isCollectDeposit'])
          			
          		} else if(key == "pretrialCheckType"){
         			$("[name='pretrialCheckType']").val(arr[key]);
         			pretrialChange(arr[key]);
         		}else if (key == "depositType") {
 					$("[name='depositType'][value='" + arr[key] + "']").prop("checked", true);
 					$("[name=depositMoney]").val(arr.depositMoney);
 					$("[name=depositRatio]").val(arr.depositRatio);
 					formatDeposit(arr[key]);
 				} else if (key == "checkType") {
 					if ($("[name='checkType'] option[value='" + arr[key] + "']").length > 0) {
 						$("[name='checkType']").val(arr[key]);
 					}
 				} else if (key == "depositCollect") {
 					$("[name='depositCollect']").val(arr[key]);
 					depositChange(arr[key]);
 				} else if (key == "syndicatedFlag") {
 					$("[name='syndicatedFlag'][value='" + arr[key] + "']").prop("checked", "checked");
 					syndicatedChange(arr[key]);
 				} else if (key == "isHasDetailedListFile") {
					$("[name=isHasDetailedListFile]").val([arr[key]]);
					detailedListFileChange(arr[key]);
 				} else if (key == "isHasControlPrice") {
 					controlPriceChange(arr[key]);
 				} else{
 					var newEle = $("[name='" + key + "']")
 					if (newEle.prop('type') == 'radio') {
 						newEle.val([arr[key]]);
 
 					} else if (newEle.prop('type') == 'checkbox') {
 						newEle.val(arr[key] ? arr[key].split(',') : []);
 					} else {
 						newEle.val(arr[key]);
 					}
 				}
 
 			}
 			if (tenderMode == 2) {//邀请项目不需要报名
 				arr.signUp = '0';
 			}
 			if (arr.signUp || arr.signUp == "0") {
 				$("[name='signUp'][value='" + arr.signUp + "']").prop("checked", "checked");
 				if (arr.signUp == 1) {
 					$(".signUpShow").show();
 				} else {
 					$("[name='enterSignUp'][value='0']").prop("checked", "checked");
 					$(".signUpShow").hide();
 				}
 			}
 			var codes = typeCode;
 			if (arr.tenderProjectClassifyCode && typeCode == (arr.tenderProjectClassifyCode.substring(0, 3) == "C50" ? "C50" : arr.tenderProjectClassifyCode.substring(0, 1))) {
 				codes = arr.tenderProjectClassifyCode;
 			}
 			$(".tenderProjectClassifyCodeTxt").dataLinkage({
 				optionName: className,
 				optionValue: codes,
 				selectCallback: function (code) {
 					tenderProjectClassifyCode = code;
 				}
 			});
 			$(".tenderProjectClassifyCodeTxt select:first").hide();
			if(examType == 1){
				if((arr.pretrialGetFileType == 1 && arr.pretrialDeliverFileType == 1 && arr.pretrialOpenType == 1 && arr.pretrialReviewType == 1) || (!arr.pretrialGetFileType && !arr.pretrialDeliverFileType && !arr.pretrialOpenType && !arr.pretrialReviewType)){
					$(".isOnline").hide();
					$("[name='process'][value=1]").prop("checked", true);
				} else {
					
					
					if($("[name='pretrialGetFileType']:checked").val() == 1){
						$("[name='pretrialDeliverFileType'][value=1]").removeAttr("disabled");
					} else {
						$("[name='pretrialDeliverFileType'][value=1]").attr("disabled", "disabled");
					}
					$("[name='pretrialOpenType'][value=1]").attr("disabled", "disabled");
					$("[name='pretrialReviewType'][value=1]").attr("disabled", "disabled");
					$(".isOnline").show();
					$("[name='process'][value=2]").prop("checked", true);
				}
			}else if(examType == 2){
				if (arr.signUpType == 1 && arr.deliverFileType == 1 && arr.bidOpenType == 1 && arr.bidCheckType == 1) {
					$(".isOnline").hide();
					$("[name='process'][value=1]").prop("checked", true);
				} else {
				 
				 
					if ($("[name='signUpType']:checked").val() == 1) {
						$("[name='deliverFileType'][value=1]").removeAttr("disabled");
					} else {
						$("[name='deliverFileType'][value=1]").attr("disabled", "disabled");
					}
					$("[name='bidOpenType'][value=1]").attr("disabled", "disabled");
					$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");
					$(".isOnline").show();
					$("[name='process'][value=2]").prop("checked", true);
				}
			}
 			processChange($("[name='process']:checked").val());
 			if (arr.projectCosts && arr.projectCosts.length > 0) {
 				formatCost(arr.projectCosts);
 			}
			isBidFile(examType, arr.isAdvanceBidFile);
			$("[name='checkType']").val(arr.checkType)
			if(from == 'bidFile'){
				$('.bidFileEdit').attr('disabled','disabled');
				$(".tenderProjectClassifyCodeTxt select").eq(1).attr('disabled','disabled');
			}
 		},
 		error: function (data) {
 			parent.layer.alert("请求失败");
 		}
 	});
 };
 /*新增时查询购买过招标文件的投标人是否需要再次购买列表*/
function getReTenser(bid) {
 	$.ajax({
 		type: "post",
 		url: reBidder,
 		async: true,
 		data: {
 			'bidSectionId': bid
 		},
 		success: function (data) {
 			if (data.success) {
 				if (data.data.length > 0) {
 					bidderArr = data.data;
 					reTenderList(data.data);
 				}
 			} else {
 				parent.layer.alert(data.message)
 			}
 		}
 	});
 }
 /*编辑时查询购买过招标文件的投标人是否需要再次购买列表*/
 function getReTenserList(bid) {
 	$.ajax({
 		type: "post",
 		url: reEditBidder,
 		async: true,
 		data: {
 			'bidSectionId': bid
 		},
 		success: function (data) {
 			if (data.success) {
 				if (data.data.length > 0) {
 					bidderArr = data.data;
 					reTenderList(data.data);
 				}
 			} else {
 				parent.layer.alert(data.message)
 			}
 		}
 	});
 }
 //重新招标选择标段后查询标段下购买过文件的投标人列表
 function reTenderList(data) {
	$('#re_tender').html('');
	tHtml = '';
	tHtml += '<table class="table table-bordered"><thead>'
		tHtml += '<tr>'
			tHtml += '<th style="width: 50px;text-align: center;">序号</th>'
			tHtml += '<th>投标人名称</th>'
			if(examType == 1){
				tHtml += '<th style="width: 220px;">是否免除本次资格预审文件费用</th>'
			}
			tHtml += '<th style="width: 200px;">是否免除本次招标文件费用</th>'
		tHtml += '</tr>'
	tHtml += '</thead><tbody>'
 	for (var i = 0; i < data.length; i++) {
 		if(!data[i]){
 			continue;
 		}
 		tHtml += '<tr>';
 		tHtml += '<td style="width: 50px;">' + (i + 1) + '</td>';
 		tHtml += '<td>' + data[i].enterpriseName + '</td>';
		if(examType == 1){
			tHtml += '<td style="width: 220px;">';
				tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
					tHtml += '<input type="radio" name="bidPayCosts['+i+'].isPreFee" checked="checked" class="isPreFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
				tHtml += '</label>';
			    tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
			    	tHtml += '<input type="radio" name="bidPayCosts['+i+'].isPreFee" disabled="disabled" class="isPreFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
			    tHtml += '</label>';
			tHtml += '</td>';
		}
 		tHtml += '<td style="width: 200px;">';
 		tHtml += '<input type="hidden" name="bidPayCosts[' + i + '].enterpriseId" value="' + data[i].enterpriseId + '"/>';
 		tHtml += '<input type="hidden" name="bidPayCosts[' + i + '].enterpriseName" value="' + data[i].enterpriseName + '"/>';
 		if(examType == 1){
			tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
			tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" ' + (data[i].isTenderFee == 1 ? "checked" : "") + ' class="isTenderFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
			tHtml += '</label>';
			tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
			tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" ' + (data[i].isTenderFee == '0' ? "checked" : "") + ' class="isTenderFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
			tHtml += '</label>';
		}else if(examType == 2){
			tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
			tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" checked class="isTenderFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
			tHtml += '</label>';
			tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
			tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" disabled="disabled"  class="isTenderFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
			tHtml += '</label>';
		}
		
 		tHtml += '</td>';
 		tHtml += '</tr>';
 	}
	tHtml += '</tbody></table>'
 	$(tHtml).appendTo('#re_tender');
 }