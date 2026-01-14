var saveUrl = config.tenderHost + '/BidSectionController/save.do'; // 点击添加项目保存的接口
var reSaveUrl = config.tenderHost + '/BidExcepitonController/toTheTender.do'; // 重新招标保存的接口

var tenderProjectUrl = config.tenderHost + '/TenderProjectController/get.do'; // 获取项目相关信息
var getUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var reBidder = config.tenderHost + '/BidSectionController/findSupplierList.do';//重新招标选择标段后查询标段下购买过文件的投标人列表
var reEditBidder = config.tenderHost + '/BidSectionController/findNewSupplierList.do';//重新招标编辑时标段下购买过文件的投标人列表

var detailUrl = config.tenderHost + '/BidExcepitonController/getExcepiton.do'; // 旧标段详情

var majorPage = 'Bidding/Project/model/projectType.html';  //专业

var id = "", tenderProjectId = "";

var tenderProjectClassifyCode = "";

var tenderArr;//招标项目相关信息
var examType;  //资格审查方式

var typeCode = "A";  //标段类型
var isPublicProject = "0"; //是否公共资源项目
var isAgency; //是否东风咨询公司
var tenderMode; // 招标方式，邀请招标不用报名

var checkTypeData;

var bidSectionId = "";  //重新招标id
var source = "";  // 1是重新招标
var className = "";
var bidderArr = [];//重新招标选择标段后查询标段下购买过文件的投标人
var isSubFile;//有无预审文件
var from = $.getUrlParam("from")
$(function () {
	//下拉框数据初始化
	initSelect('.select');
	//东风的保障金收取默认代理机构
	$("[name='depositCollect']").val(2);

	// 获取连接传递的参数
	if ($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined") {
		tenderProjectId = $.getUrlParam("tenderProjectId");
	}
	//是否东风咨询公司
	if ($.getUrlParam("isAgency") && $.getUrlParam("isAgency") != "undefined") {
		isAgency = $.getUrlParam("isAgency");
	} else {
		isAgency = entryInfo().isAgency;
	};
	if ($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
	}
	if ($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined") {
		bidSectionId = $.getUrlParam("bidSectionId");
	}
	/*购买过招标文件的投标人是否需要再次购买*/
	$('.re_tender').hide();
	//source
	if ($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
	}
	//source：1 重新招标
	if (source == 1) {
		$("#btnSave").show();
		$("#btnReSubmit").show();
		$("#btnSubmit").hide();
		$("[name='bidSectionName']").attr("readonly", "readonly");
		$("[name='bidSectionName']").addClass("readonly");
		$(".bidCode").show();
		/*购买过招标文件的投标人是否需要再次购买*/
		$('.re_tender').show();
	} else {
		$("#btnSave").hide();
		$("#btnReSubmit").hide();
		$("#btnSubmit").show();
		$("[name='bidSectionName']").removeAttr("readonly");
		$("[name='bidSectionName']").removeClass("readonly");
		$(".bidCode").hide();
		$('.re_tender').hide();
	}
	//招标项目类型
	if ($.getUrlParam("classCode") && $.getUrlParam("classCode") != "undefined") {
		typeCode = $.getUrlParam("classCode");
		if (typeCode == "C50") {
			$(".checkType").attr("selectName", "checkType" + "C");
		} else {
			$(".checkType").attr("selectName", "checkType" + typeCode);
		}
		initSelect(".checkType");
	}
	//是否公共资源
	if ($.getUrlParam("isPublicProject") && $.getUrlParam("isPublicProject") != "undefined") {
		isPublicProject = $.getUrlParam("isPublicProject");

		if (isPublicProject == 1) {  //当招标项目为公共资源时，是否报名为否
			className = "TENDER_PROJECT_CLASSIFY_CODE";  //标段分类
			$(".aloneSetCheckShow").hide();  //单独设置评审条款
			$("[name='depositCollect']").val("1");
			$("[name='depositCollect']").attr("disabled", "disabled");
		} else {
			className = "TENDER_PROJECT_CLASSIFY_0CODE";  //标段分类
			if (isAgency == 1) {//东风
				$(".aloneSetCheckShow").show();
			} else {
				$(".aloneSetCheckShow").hide();
			}
		}
	}
	//资格审查方式
	if ($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	$('[name=isCollectDeposit]').change(function(){
		payDeposit($(this).val(),true)
	})
	if($.getUrlParam("tenderMode") && $.getUrlParam("tenderMode") != "undefined"){
		tenderMode =$.getUrlParam("tenderMode");
		if(examType == 2){
			if(tenderMode == 1){				
				$("[name='signUp'][value='0']").prop("checked", "checked");
				$("[name='enterSignUp'][value='0']").prop("checked", "checked");
				$(".isSignUpShow").show();
				$(".signUpShow").hide();
				$(".signUpShow .isPay[value=0]").prop("checked", "checked");
				$(".signUpShow .costShow").hide();
				$(".signUpShow .payMoney").removeAttr("datatype");
				$(".isBidPriceShow").show();
			} else {
				$("[name='signUp'][value='0']").prop("checked", "checked");
				$("[name='enterSignUp'][value='0']").prop("checked", "checked");
				$(".signUpShow").hide();
				$(".isSignUpShow").hide();

				$(".signUpShow .isPay[value=0]").prop("checked", "checked");
				$(".signUpShow .costShow").hide();
				$(".signUpShow .payMoney").removeAttr("datatype");
				$(".isBidPriceShow").show();
			}

		}

	}


	//	if(tenderMode == 1 && isPublicProject == 1){
	//		$(".isSignUpShow").show();
	//	} else {
	//		$(".isSignUpShow").hide();
	//	}
	if (!id && !bidSectionId) {
		$(".tenderProjectClassifyCodeTxt").dataLinkage({
			optionName: className,
			optionValue: typeCode,
			selectCallback: function (code) {
				tenderProjectClassifyCode = code;
			}
		});
		$(".tenderProjectClassifyCodeTxt select:first").hide();
	}
	//根据招标项目类型显示不同内容
	if (typeCode == "A" || typeCode == "B" || typeCode == "C" || typeCode == "C50") {
		if (typeCode == "C50") {
			classifyChange("C");
		} else {
			classifyChange(typeCode);
		}
	}

	//交易流程
	processChange($("[name='process']:checked").val());
	//招标文件是否出售，是否有图纸文件
	$(".iptPay").each(function () {
		displayInp(this);
	});
	//是否联合体
	syndicatedChange($("[name='syndicatedFlag']:checked").val());
	//保证金收取方式
	depositChange($("[name='depositCollect']").val());
	//控制价是否发布
	controlPriceChange($("[name='isHasControlPrice']:checked").val());
	/*保证金递交方式改变后投标保证金缴纳方式改变 */
	$('[name=depositChannelType]').change(function () {
		changeChannel($("[name='depositChannelType']:checked").val())
	})
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
			getHasFile('bid', bidSectionId, function(id, isSubFile){
				if(isSubFile){
					isSubFile = isSubFile;
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
	}



	var date = new Date();

	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//提交
	$("#btnSubmit").click(function () {
		if (checkForm($("#formName"))) {//必填验证，在公共文件unit中
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
			if(id){
				getHasFile('bid', id, function(){
					saveForm();
				}, '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容');
			}else{
				saveForm();
			}
		}

	});
	//保存
	$("#btnSave").click(function () {
		saveForm(true);

	});
	//重新招标提交
	$("#btnReSubmit").click(function () {
		if (checkForm($("#formName"))) {//必填验证，在公共文件unit中
			if ($("[name='projectDuration']").val().length > 4) {
				parent.layer.alert("工期输入最多4位", function (idx) {
					$("[name='projectDuration']").focus();
					parent.layer.close(idx);
				});
				return;
			}
			for (var i = 0; i < bidderArr.length; i++) {
				if ($('[name="bidPayCosts[' + i + '].isTenderFee"]:checked').val() == undefined) {
					parent.layer.alert('请选择是否免除投标人 ' + bidderArr[i].enterpriseName + ' 的本次招标文件费用');
					return;
				}
			}
			if(bidSectionId){
				getHasFile('bid', bidSectionId, function(){
					saveForm(false);
				}, '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容');
			}else{
				saveForm(false);
			}
			
			// saveForm(false);
		}

	});

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

	//招标文件是否出售，是否有图纸文件
	$('.iptPay').change(function () {
		displayInp(this);
	});

	//中标服务费收取方式
	$(".zbfwf .payType").change(function () {
		var payType = $(this).val();
		winBid(payType, $(".zjDiscount .discount").val());
	});
	//选择优惠方式
	$(".sltDiscount").change(function () {
		var val = $(this).val();
		if (val == 1) {
			$(".payTypeTit").html('优惠系数（如8折输0.8）<i class="red">*</i>');
			$(".zjDiscount").show();
			$(".zjDiscount input").val("");
		} else if (val == 2) {
			$(".payTypeTit").html('');
			$(".zjDiscount").hide();
			$(".zjDiscount .discount").val("1");
		} else {
			$(".payTypeTit").html('');
			$(".zjDiscount").hide();
			$(".zjDiscount .discount").val("2");
		}
	});

	//是否有图纸文件
	//	$(".isFile input").click(function(){
	//		var val = $(".isFile input:checked").val();
	//		if(val == 0){
	//			$(".fileMoney").val("");
	//			$(".fileMoney").attr("disabled", "true");
	//			$(".fileMoney").removeAttr("datatype");
	//		} else {
	//			$(".fileMoney").removeAttr("disabled");
	//			$(".fileMoney").attr("datatype", "money");
	//		}
	//	});

	//保证金
	$("[name='depositType']").click(function () {
		var val = $("[name='depositType']:checked").val();
		formatDeposit(val);
	});

	//是否联合体
	$("[name='syndicatedFlag']").click(function () {
		var val = $("[name='syndicatedFlag']:checked").val();
		syndicatedChange(val);
	});
	// 标段分类
	$(".tenderProjectClassifyCodeTxt").on("change", "select:eq(0)", function () {
		var val = $(this).val();
		//		typeCode = val;
		classifyChange(val);
	});

	//是否报名
	$("[name='signUp']").change(function () {
		var val = $(this).val();
		if (val == 1) {
			$(".signUpShow").show();
			$(".signUpShow .costShow").show();
			$(".signUpShow .payMoney").attr("datatype", "positiveNum");
		} else {
			$("[name='enterSignUp'][value='0']").prop("checked", "checked");
			$(".signUpShow .isPay[value=0]").prop("checked", "checked");
			$(".signUpShow .costShow").hide();
			$(".signUpShow").hide();
			$(".signUpShow .payMoney").val("");
			$(".signUpShow .payMoney").removeAttr("datatype");
		}
	});

	//保证金收取方式
	$("[name='depositCollect']").change(function () {
		var val = $(this).val();
		depositChange(val);
	});

	//控制价是否发布
	$("[name='isHasControlPrice']").change(function () {
		var val = $(this).val();
		controlPriceChange(val);
	});
	//选择项目分类
	$("#btnClassify").click(function () {
		openMajorModel();
	});
});
function passMessage(data) {
	$("[name='interiorTenderProjectCode']").val(data.interiorTenderProjectCode);
	$("[name='tenderProjectName']").val(data.tenderProjectName);
	if (!data.bidSectionId) {
		if (data.source != 1) {
			$("[name='bidSectionName']").val(data.tenderProjectName);
			$("[name='interiorBidSectionCode']").val(data.interiorBidSectionCode);
		}
		/*$("input[name='depositChannel']").each(function(){
	  $(this).attr("checked", true);
  });*/
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
}

//是否联合体投标
function syndicatedChange(val) {
	if (val == 0) {
		$(".syndMain").hide();
		$("[name='consortiumBidding']").attr("disabled", "true");
		$("[name='consortiumBidding']").removeAttr("datatype");
	} else {
		$(".syndMain").show();
		$("[name='consortiumBidding']").removeAttr("disabled");
		$("[name='consortiumBidding']").attr("datatype", "*");
	}
}
//保证金收取人
function depositChange(val) {
	if(top.virtualBondRules == 3){
		$('[name=depositChannelType][value=2]').prop('checked','checked')
		$('[name=depositChannelType][value=1]').attr('disabled','disabled')
	}else{
		if (val == 1) {
			$("[name='depositChannelType'][value=1]").prop("checked", "checked");

			$("[name='depositChannelType'][value=1]").removeAttr("disabled");
			$("[name='depositChannelType'][value=2]").attr("disabled", "disabled");
		} else if (val == 2) {
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
		} else if (val == 3) {
			$("[name='depositChannelType'][value=2]").prop("checked", "checked");

			$("[name='depositChannelType'][value=1]").attr("disabled", "disabled");
			$("[name='depositChannelType'][value=2]").removeAttr("disabled");
		}
	}
	changeChannel($("[name='depositChannelType']:checked").val())
}
function OnInputs(e) {
	MoneyInput(e, $("[name='priceUnit']").val());
}
//标段分类选择
function classifyChange(val) {
	if (val == "A") {
		//工程建设招投标以元为单位；非工程可以万元
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		$("[name='priceUnit']").val("0");
		$("[name='priceUnit']").attr("disabled", "disabled");
		//工程建设招投标以人民币为单位；非工程可选择其他币种
		$("[name='currencyCode']").val("156");
		$("[name='currencyCode']").attr("disabled", "disabled");

		// 拟采用评标办法
		//		$("[name='checkType']").html(checkTypeData);
		//		$("[name='checkType'] option").each(function(){
		//			if($(this).attr("value") > 3){
		//				$(this).remove();
		//			}
		//		});
	} else {
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		$("[name='priceUnit']").val("1");
		$("[name='priceUnit']").attr("disabled", "disabled");
		$("[name='currencyCode']").removeAttr("disabled");
		// 拟采用评标办法
		//		$("[name='checkType']").html(checkTypeData);
		//		$("[name='checkType'] option").each(function(){
		//			if($(this).attr("value") <= 3){
		//				$(this).remove();
		//			}
		//		});
	}
	if (val == "A") {
		if (examType == 2) {
			if (isPublicProject == 1) {  //当招标项目为公共资源时，是否报名为否
				$("[name='signUp'][value=0]").prop("checked", "checked");
				//				$("[name='signUp'][value=1]").attr("disabled", "disabled");
				$("[name='signUp'][value=1]").parent("label").remove();
				$("[name='enterSignUp'][value='0']").prop("checked", "checked");
				$(".signUpShow").hide();
			}
		}
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
//交易流程
function processChange(val) {
	if (val == 1) {
		$("[name='signUpType'][value=1]").prop("checked", "checked");
		$("[name='deliverFileType'][value=1]").prop("checked", "checked");
		$("[name='bidOpenType'][value=1]").prop("checked", "checked");
		$("[name='bidCheckType'][value=1]").prop("checked", "checked");

		$("[name='bidOpenType'][value=1]").removeAttr("disabled");
		$("[name='bidCheckType'][value=1]").removeAttr("disabled");
		$("[name='signUpType'][value=1]").removeAttr("disabled");
		$("[name='deliverFileType'][value=1]").removeAttr("disabled");
		$(".isOnline").hide();
	} else if (val == 2) {
		$(".isOnline input:radio").removeAttr("disabled");
		if ($("[name='signUpType']:checked").val() == 2) {
			$("[name='deliverFileType'][value=1]").attr("disabled", "disabled");
			$("[name='bidOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");

			$("[name='deliverFileType'][value=2]").prop("checked", "checked");
			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		} else if ($("[name='deliverFileType']:checked").val() == 2) {
			$("[name='bidOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");

			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		} else if ($("[name='bidOpenType']:checked").val() == 2) {
			$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		}
		$(".isOnline").show();
	}
}
/*
 * 表单提交
 * isSave: true保存， false提交  
 */
function saveForm(isSave) {
	var arr = {}, tips = "", url = "";
	/* 有招标文件时移除所有的，没有时走原来逻辑 */
	if(isSubFile){
		$.each($('td'), function(index, item){
			$(this).find('[data-disabled="*"]').removeAttr('disabled');
		})
	}else{//无
		$('input[type=radio][name=bidOpenType]').prop('disabled', false);
		$('input[type=radio][name=bidCheckType]').prop('disabled', false);
		$("[name='depositCollect']").prop('disabled', false);
	}
	
	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	for (var key in arr) {
		arr[key] = $.trim(arr[key]);
	}
	arr.projectCosts = []
	$(".cost").each(function () {
		var item = { isPay: ($(this).find(".isPay").hasClass("iptPay") ? $(this).find(".isPay:checked").val() : $(this).find(".isPay").val()), payMoney: $(this).find(".payMoney").val() };
		$(this).find(".costName").length > 0 ? item.costName = $(this).find(".costName").val() : "";
		$(this).find(".payModel").length > 0 ? item.payModel = $(this).find(".payModel").val() : "";
		$(this).find(".payType").length > 0 ? item.payType = $(this).find(".payType").val() : "";
		$(this).find(".discount").length > 0 ? item.discount = $(this).find(".discount").val() : "";
		$(this).find(".payRatio").length > 0 ? item.payRatio = $(this).find(".payRatio").val() : "";
		arr.projectCosts.push(item);
	});
	if (source == 1) {
		url = reSaveUrl;
		if (!isSave) {
			arr.isSubmit = 1;
		}
		arr.bidSectionId = bidSectionId;
	} else {
		url = saveUrl;
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
	var typeData = [];
	$("input[name='depositChannel']:checked").each(function (index, element) {
		typeData.push($(this).val());
	});

	arr.depositChannel = typeData.join(",");
 	/* if(arr.depositChannel == ''){
 		parent.layer.alert('请选择投标保证金缴纳方式！');
 		return;
 	} */
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
	
	$.ajax({
		url: url,
		type: "post",
		data: arr,
		success: function (data) {
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
				parent.layer.alert("添加成功", { icon: 1, title: "提示" });
				window.parent.frames[0].bidSectionList();
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭 
			}

		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
};	

//标段详情
function getDetail() {
	var url = "", data = {};

	if (bidSectionId != "") {
		url = detailUrl;
		data = { bidSectionId: bidSectionId }
	}
	if (id != "") {
		url = getUrl;
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
			if(from == 'bidFile'){
				var type = arr.tenderProjectClassifyCode.charAt(0);
				$(".checkType").attr("selectName", "checkType" + type);
				initSelect(".checkType");
			}
			for (var key in arr) {
				if (key == "tenderProjectClassifyCode") {

					//       			typeCode = arr[key].substring(0, 1);
					//       			$("[name='tenderProjectClassifyCode']").val(arr[key]);
					//       			
					//					if(typeCode != arr[key].substring(0, 1)){
					//						$("[name='tenderProjectClassifyCode']").val("");
					//						$("[name='tenderProjectClassifyName']").val("");
					//					} else {
					//						$("[name='tenderProjectClassifyCode']").val(arr[key]);
					//					}


					//					var val = $(".tenderProjectClassifyCodeTxt select:eq(0)").val();
					//					typeCode = val;
					//					classifyChange(typeCode);
				}else if(key == "isCollectDeposit"){
					$("[name='isCollectDeposit'][value='"+arr['isCollectDeposit']+"']").prop("checked", true);
         			payDeposit(arr['isCollectDeposit'])
         			
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
				} else if (key == "isHasControlPrice") {
					controlPriceChange(arr[key]);
				} else if (key != 'priceUnit') {
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
			//			classifyChange(typeCode);
			//				$(".classifyShow").show();
			$(".tenderProjectClassifyCodeTxt select:first").hide();
			//			} else {
			//				$(".classifyShow").hide();
			//			}


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
			processChange($("[name='process']:checked").val());
			if (arr.projectCosts && arr.projectCosts.length > 0) {
				formatCost(arr.projectCosts);
			}
		},
		error: function (data) {
			parent.layer.alert("请求失败");
		}
	});
};

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

	if (typeCode == "A") {
		if ($("[name='draw']:checked") == 1) {
			$(".drawCost .payMoney").attr("datatype", "positiveNum");
		}
	} else {
		$(".drawCost .payMoney").removeAttr("datatype");
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
}

//中标服务费收取方式
function winBid(payType, discount) {
	if (payType == 3) {
		$(".payTypeTit").html('优惠系数（如8折输0.8）<i class="red">*</i>');
		$(".zjDiscount input").attr("datatype", "positiveNum");
		$(".zjDiscount").show();

		$(".zjPayMoney").hide();
		$(".zjPayRatio").hide();

		$(".zjPayMoney input").removeAttr("datatype");
		$(".zjPayRatio input").removeAttr("datatype");

	} else if (payType == 2) {
		//		$(".sltDiscount").hide();
		$(".payTypeTit").html('中标服务费收费比例(%)<i class="red">*</i>');
		$(".zjPayMoney").hide();
		$(".zjPayRatio").show();
		$(".zjDiscount").hide();
		$(".zjPayMoney input").removeAttr("datatype");
		$(".zjPayRatio input").attr("datatype", "positiveNum");
		$(".zjDiscount input").removeAttr("datatype");
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
		$(".zjPayRatio input").removeAttr("datatype");
		$(".zjDiscount input").removeAttr("datatype");
	}
}



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
}

//标段分类
function openMajorModel() {
	var width = 450;
	var height = top.$(parent).height() * 0.8;
	parent.layer.open({
		type: 2,
		title: '选择标段分类',
		area: [width + 'px', height + 'px'],
		maxmin: false,
		closeBtn: 1,
		content: majorPage + "?typeCode=" + typeCode,
		btn: ['确定', '取消'],
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var enterpriseInfo = iframeWin.btnSubmit();
			if (enterpriseInfo.length == 0) {
				top.layer.alert("请选择标段分类！");
				return;
			};
			if (enterpriseInfo.length > 200) {
				top.layer.alert("标段分类选择过多,请重新选择");
				return;
			};

			var item = [];
			for (var i = 0; i < enterpriseInfo.length; i++) {
				item.push(enterpriseInfo[i].name);


				//              obj.majorCode = enterpriseInfo[i].code;
				////              obj.dataTypeId = enterpriseInfo[i].id;
				//              obj.majorName = enterpriseInfo[i].name;
				//              item.push(obj);


			};
			//          var name = "", code = "";
			//          for(var i = 0; i < item.length; i++){
			//          	name += item[i].majorName;
			//          	code += item[i].majorCode;
			//          }
			if (typeCode == "A") {
				item.unshift("工程");
			} else if (typeCode == "B") {
				item.unshift("货物");
			} else if (typeCode == "C") {
				item.unshift("服务");
			}
			var code = enterpriseInfo[enterpriseInfo.length - 1].code;
			$("[name='tenderProjectClassifyCode']").val(code);
			$("[name='tenderProjectClassifyName']").val(item.join(" - "));
			//          typeCode = code.substring(0, 1);
			//          classifyChange(typeCode);
			parent.layer.close(index);
		}

	})
}

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
	
 tHtml = '';
	for (var i = 0; i < data.length; i++) {
		if(!data[i]){
			continue;
		}
		tHtml += '<tr>';
		tHtml += '<td style="width: 50px;">' + (i + 1) + '</td>';
		tHtml += '<td>' + data[i].enterpriseName + '</td>';
		tHtml += '<td style="width: 200px;">';
		tHtml += '<input type="hidden" name="bidPayCosts[' + i + '].enterpriseId" value="' + data[i].enterpriseId + '"/>';
		tHtml += '<input type="hidden" name="bidPayCosts[' + i + '].enterpriseName" value="' + data[i].enterpriseName + '"/>';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
		tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" ' + (data[i].isTenderFee == 1 ? "checked" : "") + ' class="isTenderFee isCost" value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
		tHtml += '</label>';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
		tHtml += '<input type="radio" name="bidPayCosts[' + i + '].isTenderFee" ' + (data[i].isTenderFee == '0' ? "checked" : "") + ' class="isTenderFee isCost" value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
		tHtml += '</label>';
		tHtml += '</td>';
		tHtml += '</tr>';
	}
	$(tHtml).appendTo('#re_tender tbody');
}
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
}

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
}