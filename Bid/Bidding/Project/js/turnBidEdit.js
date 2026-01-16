/**

 *  预审转后审
 *  方法列表及功能描述
 */

var saveUrl = config.tenderHost + '/BidSectionController/savePretrialToReview.do'; // 预审转后审保存
var reSaveUrl = config.tenderHost + '/BidExcepitonController/toTheTender.do'; // 重新招标保存的接口
var tenderProjectUrl = config.tenderHost + '/TenderProjectController/get.do'; // 获取项目相关信息
var getUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var getPreUrl = config.tenderHost + '/BidSectionController/getBidSectionPretrialInfo.do'; // 预审标段详情
var detailUrl = config.tenderHost + '/BidExcepitonController/getExcepiton.do'; // 旧标段详情

var majorPage = 'Bidding/Project/model/projectType.html'; //专业

var id = "",
	tenderProjectId = "";

var tenderProjectClassifyCode = "";

var tenderArr; //招标项目相关信息
var examType; //资格审查方式

var typeCode = "A"; //标段类型
var isPublicProject = "0"; //是否公共资源项目
var isAgency; //是否咨询公司
var tenderMode; // 招标方式，邀请招标不用报名

var checkTypeData;

var bidSectionId = ""; //重新招标id
var source = ""; // 1是重新招标
var className = "";
var isSubTips = false; //预审转后审提交时是否提示
var isSubFile;//是否有提交招标文件
var feeConfirmVersion = 2;//服务费版本号
$(function() {
	//下拉框数据初始化
	initSelect('.select');
	//的保障金收取默认代理机构
	$("[name='depositCollect']").val(2);
	$(".isBidPriceShow").show();

	// 获取连接传递的参数
	if($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined") {
		tenderProjectId = $.getUrlParam("tenderProjectId");
	}
	//是否咨询公司
	if($.getUrlParam("isAgency") && $.getUrlParam("isAgency") != "undefined") {
		isAgency = $.getUrlParam("isAgency");
	} else {
		isAgency = entryInfo().isAgency;
	}
	//source
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
		if(source == 1) {
			$("#btnSave").show();
			$("#btnReSubmit").show();
			$("#btnSubmit").hide();
			$("[name='bidSectionName']").attr("readonly", "readonly");
			$("[name='bidSectionName']").addClass("readonly");
			$(".bidCode").show();
		} else {
			$("#btnSave").hide();
			$("#btnReSubmit").hide();
			$("#btnSubmit").show();
			$("[name='bidSectionName']").removeAttr("readonly");
			$("[name='bidSectionName']").removeClass("readonly");
			$(".bidCode").hide();
		}
	}

	//招标项目类型
	if($.getUrlParam("classCode") && $.getUrlParam("classCode") != "undefined") {
		typeCode = $.getUrlParam("classCode");

		$(".checkType").attr("selectName", "checkType" + typeCode);
		initSelect(".checkType");

	}
	//是否公共资源
	if($.getUrlParam("isPublicProject") && $.getUrlParam("isPublicProject") != "undefined") {
		isPublicProject = $.getUrlParam("isPublicProject");

		if(isPublicProject == 1) { //当招标项目为公共资源时，是否报名为否
			className = "TENDER_PROJECT_CLASSIFY_CODE"; //标段分类
			$(".aloneSetCheckShow").hide();
			$("[name='depositCollect']").val("1");
			$("[name='depositCollect']").attr("disabled", "disabled");
		} else {
			className = "TENDER_PROJECT_CLASSIFY_0CODE"; //标段分类
			if(isAgency == 1) {
				$(".aloneSetCheckShow").show();
			} else {
				$(".aloneSetCheckShow").hide();
			}
		}
	}
	//资格审查方式
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
		if(examType == 1) {
			$(".exampTypeShow").show();
			//			$("[name='projectCosts[3].payMoney']").removeAttr("disabled");
		} else {
			$(".exampTypeShow").hide();
			//			$("[name='projectCosts[3].payMoney']").attr("disabled", "disabled");
		}
	}

	$('[name=isCollectDeposit]').change(function() {
		payDeposit($(this).val(), true)
	})

	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
		getPreDetail();
	} else {

		$('#bidEctionNum').val('1');

		//添加时初始化项目类型

	}

	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined") {
		bidSectionId = $.getUrlParam("bidSectionId");
		getDetail();
	}
	if($.getUrlParam("tenderMode") && $.getUrlParam("tenderMode") != "undefined") {
		tenderMode = $.getUrlParam("tenderMode");
		if(examType == 2) {
			if(tenderMode == 1) {
				$("[name='signUp'][value='1']").attr("checked", "checked");
				$("[name='enterSignUp'][value='1']").attr("checked", "checked");
				$(".isBidPriceShow").show();
				$("[name='enterSignUp'][value='1']").attr("checked", "checked");
				//$(".isBidPriceShow").show();			} else {
				$("[name='signUp'][value='0']").attr("checked", "checked");
				$("[name='enterSignUp'][value='0']").attr("checked", "checked");
				$(".signUpShow").hide();
				$(".isSignUpShow").hide();
				$(".isBidPriceShow").show();			}
		}
	}
	//	if(tenderMode == 1 && isPublicProject == 1){
	//		$(".isSignUpShow").show();
	//	} else {
	//		$(".isSignUpShow").hide();
	//	}
	if(!id && !bidSectionId) {
		$(".tenderProjectClassifyCodeTxt").dataLinkage({
			optionName: className,
			optionValue: typeCode,
			selectCallback: function(code) {
				tenderProjectClassifyCode = code;
			}
		});
		$(".tenderProjectClassifyCodeTxt select:first").hide();
	}
	//根据招标项目类型显示不同内容
	if(typeCode == "A" || typeCode == "B" || typeCode == "C") {
		classifyChange(typeCode);
	}

	/*保证金递交方式改变后投标保证金缴纳方式改变 */
	$('[name=depositChannelType]').change(function() {
		changeChannel($("[name='depositChannelType']:checked").val())
	})

	var date = new Date();

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//交易流程
	processChange($("[name='process']:checked").val());
	$("[name='process']").click(function() {
		var val = $("[name='process']:checked").val();
		if(val == 2) {
			$("[name='signUpType'][value=1]").prop("checked", "checked");
			$("[name='deliverFileType'][value=1]").prop("checked", "checked");
			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		}
		processChange(val);
	});
	//招标文件获取方式
	$(".isOnline input:radio").change(function() {
		var val = $("[name='process']:checked").val();
		processChange(val);
	});
	if(bidSectionId || id) {
		var passId = '';
		if(bidSectionId){
			passId = bidSectionId
		}
		if(id){
			passId = id
		}
		//判断标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制相关字段不可编辑,data-disabled用于保存后添加disabled属性
		getHasFile('prebid', passId, function(id, isSub){
			if(isSub){
				isSubFile = isSub;
				$.each($('td'), function(index, item){
					if(!$(this).hasClass('allowEdit')){
						$(this).find('input').attr({'disabled': 'disabled', 'data-disabled': '*'}).removeAttr('datatype');
						$(this).find('select').attr({'disabled': 'disabled', 'data-disabled': '*'});
						$(this).find('textarea').attr({'disabled': 'disabled', 'data-disabled': '*'});
					}
				})
			}
		});
	}
	//招标文件是否出售，是否有图纸文件
	$(".pay").each(function() {
		displayInp(this);
	});
	$('.pay').change(function() {
		displayInp(this);
	});

	//中标服务费收取方式
	$("[name='projectCosts[2].payType']").change(function() {
		var payType = $(this).val();
		winBid(payType, $("[name='projectCosts[2].discount']").val());
	});
	//选择优惠方式
	$(".sltDiscount").change(function() {
		var val = $(this).val();
		if(val == 1) {
			$(".payTypeTit").html('优惠系数（如8折输0.8）<i class="red">*</i>');
			$(".zjDiscount").show();
			$(".zjDiscount input").val("");
		} else if(val == 2) {
			$(".payTypeTit").html('');
			$(".zjDiscount").hide();
			$("[name='projectCosts[1].discount']").val("1");
		} else {
			$(".payTypeTit").html('');
			$(".zjDiscount").hide();
			$("[name='projectCosts[1].discount']").val("2");
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
	$("[name='depositType']").click(function() {
		var val = $("[name='depositType']:checked").val();
		formatDeposit(val);
	});
	//是否联合体
	syndicatedChange($("[name='syndicatedFlag']:checked").val());
	$("[name='syndicatedFlag']").click(function() {
		var val = $("[name='syndicatedFlag']:checked").val();
		syndicatedChange(val);
	});
	// 标段分类
	$(".tenderProjectClassifyCodeTxt").on("change", "select:eq(0)", function() {
		var val = $(this).val();
		//		typeCode = val;
		classifyChange(val);
	});

	//是否报名
	$("[name='signUp']").change(function() {
		var val = $(this).val();
		val == 1 ? $(".signUpShow").show() : $(".signUpShow").hide();
	});
	//保证金收取方式
	depositChange($("[name='depositCollect']").val());
	$("[name='depositCollect']").change(function() {
		var val = $(this).val();
		depositChange(val);
	});
	//控制价是否发布
	controlPriceChange($("[name='isHasControlPrice']:checked").val());
	$("[name='isHasControlPrice']").change(function() {
		var val = $(this).val();
		controlPriceChange(val);
	});
	//选择项目分类
	$("#btnClassify").click(function() {
		openMajorModel();
	});
});

function passMessage(data, callback) { 
	$("[name='interiorTenderProjectCode']").val(data.interiorTenderProjectCode);
	$("[name='tenderProjectName']").val(data.tenderProjectName);
	if(!data.bidSectionId) {
		if(data.source != 1) {
			$("[name='bidSectionName']").val(data.tenderProjectName);
			$("[name='interiorBidSectionCode']").val(data.interiorBidSectionCode);
		}
		/*$("input[name='depositChannel']").each(function(){
			$(this).attr("checked", true);
		});*/
	};
	//提交
	$("#btnSubmit").click(function() {
		if(checkForm($("#formName"))) { //必填验证，在公共文件unit中
			if($("[name='projectCosts[1].discount']").attr("datatype")) {
				if(Number($("[name='projectCosts[1].discount']").val()) <= 0 || Number($("[name='projectCosts[1].discount']").val()) > 1) {
					parent.layer.alert("优惠系数为0到1", function(idx) {
						$("[name='projectCosts[1].discount']").focus();
						parent.layer.close(idx);
					});
					return;
				}
			}
			if($("[name='projectDuration']").val().length > 4) {
				parent.layer.alert("工期输入最多4位", function(idx) {
					$("[name='projectDuration']").focus();
					parent.layer.close(idx);
				});
				return;
			}
			if(isSubTips) {
				var tips = '招标阶段，如修改了资格预审阶段默认获取的“拟采用评标办法”、“是否有工程量清单”、“是否有招标控制价”字段信息，请重新编辑招标文件;如未修改,则无需做处理。'
				if(isPublicProject == 0) { //非公共资源
					if(isAgency == 1) { //
						tips = '招标阶段，如修改了资格预审阶段默认获取的“拟采用评标办法”、“是否单独设置评审条款”、“是否有工程量清单”、“是否有招标控制价”字段信息，请重新编辑招标文件;如未修改,则无需做处理。'
					}
				}
				parent.layer.confirm(tips, {
					title: '询问'
				}, function(ins) {
					if(id){
						getHasFile('prebid', id, function(){
							saveForm(false, callback);
						}, '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容');
					}else{
						saveForm(false, callback);
					}
					parent.layer.close(ins)
				})
			} else {
				if(id){
					getHasFile('prebid', id, function(){
						saveForm(false, callback);
					}, '此标段已提交招标文件，修改标段信息后请及时更新对应招标文件内容');
				}else{
					saveForm(false, callback);
				}
			}
	
		}
	
	});
	//保存
	$("#btnSave").click(function() {
		saveForm(true, callback);
	
	});
	//重新招标提交
	$("#btnReSubmit").click(function() {
		if(checkForm($("#formName"))) { //必填验证，在公共文件unit中
			if($("[name='projectDuration']").val().length > 4) {
				parent.layer.alert("工期输入最多4位", function(idx) {
					$("[name='projectDuration']").focus();
					parent.layer.close(idx);
				});
				return;
			}
			saveForm(false, callback);
		}
	
	});
}
//控制价是否发布
function controlPriceChange(val) {
	if(val == 0) {
		$(".controlShow").hide();
		$("[name='isHasControlPrice'][value=0]").attr("checked", "checked");
	} else {
		$(".controlShow").show();
		$("[name='isHasControlPrice'][value=1]").attr("checked", "checked");
	}
}

//是否联合体投标
function syndicatedChange(val) {
	if(val == 0) {
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
		if(val == 1) {
			$("[name='depositChannelType'][value=1]").prop("checked", "checked");
		
			$("[name='depositChannelType'][value=1]").removeAttr("disabled");
			$("[name='depositChannelType'][value=2]").attr("disabled", "disabled");
		} else if(val == 2) {
			if(isAgency == 1) {
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
		} else if(val == 3) {
			$("[name='depositChannelType'][value=2]").prop("checked", "checked");
		
			$("[name='depositChannelType'][value=1]").attr("disabled", "disabled");
			$("[name='depositChannelType'][value=2]").removeAttr("disabled");
		}
	}
	changeChannel($("[name='depositChannelType']:checked").val());
}

function OnInputs(e) {
	MoneyInput(e, $("[name='priceUnit']").val());
}
//标段分类选择
function classifyChange(val) {
	if(val == "A") {
		//工程建设招投标以元为单位；非工程可以万元
		$("[name='contractReckonPrice']").attr("datatype", "positiveNum");
		if(id == ""){
			$("[name='priceUnit']").val("0");
		}
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
		if(id == ""){
			$("[name='priceUnit']").val("0");
		}
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
	if(val == "A") {
		if(examType == 2) {
			if(isPublicProject == 1) { //当招标项目为公共资源时，是否报名为否
				$("[name='signUp'][value=0]").prop("checked", "checked");
				$("[name='signUp'][value=1]").attr("disabled", "disabled");
				$(".signUpShow").hide();
			}
		}
	}

	if(val == "A") {
		$(".projectShow").show();
		if($("[name='projectCosts[2].isPay']:checked").val() == 1) {
			$(".projectShow").find("[name='projectCosts[2].payMoney']").attr("datatype", "positiveNum");
		} else {
			$(".projectShow").find("[name='projectCosts[2].payMoney']").removeAttr("datatype");
		}
		$(".projectShow").find("[name='commencementDate']").attr("datatype", "*");

		$(".goodsShow").hide();
	} else if(val == "B") {
		$(".projectShow").hide();
		$(".goodsShow").show();
		$(".projectShow").find("[name='projectCosts[2].payMoney']").removeAttr("datatype");
		$(".projectShow").find("[name='commencementDate']").removeAttr("datatype");
	} else if(val == "C") {
		$(".projectShow").hide();
		$(".goodsShow").hide();
		$(".projectShow").find("[name='commencementDate']").removeAttr("datatype");
		$(".projectShow").find("[name='projectCosts[2].payMoney']").removeAttr("datatype");
	}
}
//交易流程
function processChange(val) {
	if(val == 1) {
		$("[name='signUpType'][value=1]").prop("checked", "checked");
		$("[name='deliverFileType'][value=1]").prop("checked", "checked");
		$("[name='bidOpenType'][value=1]").prop("checked", "checked");
		$("[name='bidCheckType'][value=1]").prop("checked", "checked");

		$("[name='bidOpenType'][value=1]").removeAttr("disabled");
		$("[name='bidCheckType'][value=1]").removeAttr("disabled");
		$("[name='signUpType'][value=1]").removeAttr("disabled");
		$("[name='deliverFileType'][value=1]").removeAttr("disabled");
		$(".isOnline").hide();
	} else if(val == 2) {
		$(".isOnline input:radio").removeAttr("disabled");
		if($("[name='signUpType']:checked").val() == 2) {
			$("[name='deliverFileType'][value=1]").attr("disabled", "disabled");
			$("[name='bidOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");

			$("[name='deliverFileType'][value=2]").prop("checked", "checked");
			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		} else if($("[name='deliverFileType']:checked").val() == 2) {
			$("[name='bidOpenType'][value=1]").attr("disabled", "disabled");
			$("[name='bidCheckType'][value=1]").attr("disabled", "disabled");

			$("[name='bidOpenType'][value=2]").prop("checked", "checked");
			$("[name='bidCheckType'][value=2]").prop("checked", "checked");
		} else if($("[name='bidOpenType']:checked").val() == 2) {
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
function saveForm(isSave, callback) {

	var arr = {},
		tips = "";

	var url = "";
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

	for(var key in arr) {
		arr[key] = $.trim(arr[key]);
	}

	if(!isSave) {
		arr.isSubmit = 1;
	}
	if(source == 1) {
		url = reSaveUrl;

		arr.bidSectionId = bidSectionId;
	} else {
		url = saveUrl;
	}

	if(id != "") {
		arr.id = id;
	}
	if(!arr.currencyCode || !arr.priceUnit) {
		arr.priceUnit = $("[name='priceUnit']").val();
		arr.currencyCode = $("[name='currencyCode']").val();
	}

	// arr.tenderProjectClassifyCode = tenderProjectClassifyCode;
	arr.tenderProjectId = tenderProjectId;

	var typeData = [];
	$("input[name='depositChannel']:checked").each(function(index, element) {
		typeData.push($(this).val());
	});

	arr.depositChannel = typeData.join(",");
	/* if(arr.depositChannel == ''){
		parent.layer.alert('请选择投标保证金缴纳方式！');
		return;
	} */
	if($("input[name='isCollectDeposit']:checked").val() == 0) {
		delete arr.depositCollect;
	} else if($("input[name='isCollectDeposit']:checked").val() == 1) {
		if(arr.depositChannel == '') {
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
		success: function(data) {
			if(isSubFile){
				$.each($('td'), function(index, item){
					$(this).find('[data-disabled="*"]').attr('disabled', true);
				})
			};
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			id = data.data;
			if(!isSave) {
				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭 
			} else {
				parent.layer.alert("保存成功", {
					icon: 1,
					title: "提示"
				});
			}
			if(source == 1) {
				window.parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert("添加成功", {
					icon: 1,
					title: "提示"
				});
				if(!isSave){
					if(callback){
						callback()
					}
					// window.parent.frames[0].getDetail(2);
				}
				var o = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(o); //再执行关闭 
				window.parent.$('#projectList').bootstrapTable('refresh');
			}

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
};

//标段详情
function getDetail() {
	var url = "",
		data = {};

	if(bidSectionId != "") {
		url = detailUrl;
		data = {
			bidSectionId: bidSectionId
		}
	}
	if(id != "") {
		url = getUrl;
		data = {
			id: id
		}
	}

	$.ajax({
		url: url,
		type: "post",
		data: data,
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			for(var key in arr) {
				if(key == "isCollectDeposit") {
					$("[name='isCollectDeposit'][value='" + arr['isCollectDeposit'] + "']").prop("checked", true);
					payDeposit(arr['isCollectDeposit']);
				} else if(key == "projectCosts") {
					formatCost(arr[key]);
				} else if(key == "depositType") {
					$("[name='depositType'][value='" + arr[key] + "']").prop("checked", true);
					$("[name=depositMoney]").val(arr.depositMoney);
					$("[name=depositRatio]").val(arr.depositRatio);
					formatDeposit(arr[key]);

				} else if(key == "checkType") {
					if($("[name='checkType'] option[value='" + arr[key] + "']").length > 0) {
						$("[name='checkType']").val(arr[key]);
					}
				} else if(key == "depositCollect") {
					$("[name='depositCollect']").val(arr[key]);
					depositChange(arr[key]);
				} else if(key == "syndicatedFlag") {
					$("[name='syndicatedFlag'][value='" + arr[key] + "']").prop("checked", "checked");
					syndicatedChange(arr[key]);
				} else if(key == "signUp") {
					$("[name='signUp'][value='" + arr[key] + "']").prop("checked", "checked");
					arr[key] == 1 ? $(".signUpShow").show() : $(".signUpShow").hide();
				} else if(key == "depositChannel") {
					continue;
				} else if(key == "isHasControlPrice") {
					controlPriceChange(arr[key]);
				} else {
					var newEle = $("[name='" + key + "']")
					if(newEle.prop('type') == 'radio') {
						newEle.val([arr[key]]);

					} else if(newEle.prop('type') == 'checkbox') {
						newEle.val(arr[key] ? arr[key].split(',') : []);
					} else {
						newEle.val(arr[key]);
					}
				}

			}
			if(arr.depositChannel != undefined && arr.depositChannel != '') {
				var marginPayTypeData = [];
				marginPayTypeData = arr.depositChannel.split(',');
				for(var i = 0; i < marginPayTypeData.length; i++) {
					$("[name='depositChannel'][value=" + marginPayTypeData[i] + "]").prop('checked', true);
				}
				//				$("input[name='marginPayType']").attr("disabled",true);
			}
			//       	if(typeCode == "A" || typeCode == "B" || typeCode == "C"){
			var codes = typeCode;
			if(arr.tenderProjectClassifyCode && typeCode == arr.tenderProjectClassifyCode.substring(0, 1)) {
				codes = arr.tenderProjectClassifyCode;
			}
			$(".tenderProjectClassifyCodeTxt").dataLinkage({
				optionName: className,
				optionValue: codes,
				selectCallback: function(code) {
					tenderProjectClassifyCode = code;
				}

			});
			//				$(".classifyShow").show();
			$(".tenderProjectClassifyCodeTxt select:first").hide();
			//			} else {
			//				$(".classifyShow").hide();
			//			}

			if((arr.signUpType == 1 && arr.deliverFileType == 1 && arr.bidOpenType == 1 && arr.bidCheckType == 1) || (!arr.signUpType && !arr.deliverFileType && !arr.bidOpenType && !arr.bidCheckType)) {
				$(".isOnline").hide();
				$("[name='process'][value=1]").prop("checked", true);
			} else {

				if($("[name='signUpType']:checked").val() == 1) {
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

		},
		error: function(data) {
			parent.layer.alert("请求失败");
		}
	});
};
//预审   标段详情
function getPreDetail() {
	$.ajax({
		url: getPreUrl,
		type: "post",
		data: {
			id: id
		},
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			feeConfirmVersion = arr.feeConfirmVersion;
			for(var key in arr) {
				if(key == "projectCosts") {
					formatCost(arr[key]);
				} else if(key == "bidType") {
					$("#bidType").html(arr[key] == 1 ? "是" : "否");
				} else if(key == "priceUnit") {
					$("#priceUnit").html(arr[key] == 1 ? "万元" : "元");
				} else if(key == "currencyCode") {
					$("#currencyCode").html("人民币");
				} else if(key == "isHasDetailedListFile") {
					$("#isHasDetailedListFile").html(arr[key] == 1 ? "有" : "无");
				} else if(key == "isHasControlPrice") {
					$("#isHasControlPrice").html(arr[key] == 1 ? "有" : "无");
					arr[key] == 1 ? $(".controlShow").show() : $(".controlShow").hide();
				} else if(key == "isControlPrice") {
					$("#isControlPrice").html(arr[key] == 1 ? "是" : "否");
				} else if(key == "syndicatedFlag") {
					$("#syndicatedFlag").html(arr[key] == 1 ? "允许" : "不允许");
					if(arr[key] == 1) {
						$(".syndMain").show();
					} else {
						$(".syndMain").hide();
					}
				} else if(key == "isAdvanceBidFile") {
					$("#isAdvanceBidFile").html(arr[key] == 1 ? "是" : "否");
					if(arr.isAdvanceBidFile == 1) {
						isSubTips = true;
					}

				} else if(key == "tenderProjectClassifyCode") {

					optionValueView("#" + key, arr[key]);
					var val = arr[key].substr(0, 1);
					if(val == "A") {
						$(".projectShow").show();
						$(".goodsShow").hide();
					} else if(val == "B") {
						$(".projectShow").hide();
						$(".goodsShow").show();
					} else if(val == "C") {
						$(".goodsShow").hide();
						$(".projectShow").hide();
					}
				} else if(key == "enterSignUp" || key == "aloneSetCheck" || key == "signUp") {
					$("#" + key).html(arr[key] == 1 ? "是" : "否");

				} else if(key == "depositType") {
					$("#depositType").html(arr[key] == 1 ? "固定金额" : "固定比例");
					$(".depositTit").html(arr[key] == 1 ? "保证金金额（元）" : "保证金比例（不低于投标总价）%");
					if(arr[key] == 1) {
						$(".depositMoney").show();
						$(".depositRatio").hide();
					} else {
						$(".depositMoney").hide();
						$(".depositRatio").show();
					}

				} else if(key == "depositChannel") {
					if(arr.depositChannel != undefined && arr.depositChannel != '') {
						var marginPayTypeData = [];
						marginPayTypeData = arr.depositChannel.split(',');
						for(var i = 0; i < marginPayTypeData.length; i++) {
							$("[name='depositChannel'][value=" + marginPayTypeData[i] + "]").attr('checked', true);
						}
					}
				} else if(key == 'pretrialCheckType') {
					if(arr[key] == 1) {
						$('#pretrialCheckType').html('合格制')
					} else if(arr[key] == 2) {
						$('#pretrialCheckType').html('有限数量制');
						$('.limitNum').css('display', 'inline-block')
					}
				} else {
					optionValueView($("#" + key), arr[key]);
				}
				pretrialChange(arr.pretrialCheckType);
				isBidFile(arr.isAdvanceBidFile)

			}
			$("#depositChannelType").html(arr.depositChannelType == 1 ? "线上" : "线下");
			arr.signUp == 1 ? $(".signUpShow").show() : $(".signUpShow").hide();
			if(arr.pretrialGetFileType == 1 && arr.pretrialDeliverFileType == 1 && arr.pretrialOpenType == 1 && arr.pretrialReviewType == 1) {
				$(".isOnlinePre").hide();
				$("[name='processPre'][value=1]").prop("checked", true);
			} else {
				$("[name='pretrialGetFileType'][value=" + arr.pretrialGetFileType + "]").prop("checked", "checked");
				$("[name='pretrialDeliverFileType'][value=" + arr.pretrialDeliverFileType + "]").prop("checked", "checked");
				$("[name='pretrialOpenType'][value=" + arr.pretrialOpenType + "]").prop("checked", "checked");
				$("[name='pretrialReviewType'][value=" + arr.pretrialReviewType + "]").prop("checked", "checked");

				$("[name='processPre'][value=2]").prop("checked", true);
			}
			if(arr.feeConfirmVersion && arr.feeConfirmVersion == 2){
				$('.feeConfirmVersion').show();
				arr.feeUnderparty || arr.feeUnderparty == 0?$('#feeUnderparty').html(arr.feeUnderparty==1?"含在代理服务费中（代理机构承担）":(arr.feeUnderparty==2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付")):$('#feeUnderparty').html('');
			}else{
				$('.feeConfirmVersion').hide();
			}
		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}

//费用
function displayInp(obj) {
	var name = $(obj).attr("name");
	var pay_input = $(obj).closest("tr").find(".pay_input");
	if($("[name='" + name + "']:checked").val() == 0) {
		pay_input.val("");
		pay_input.removeAttr("datatype");
		$(obj).closest("tr").find(".costShow").hide();
	} else {
		pay_input.attr("datatype", "positiveNum");
		$(obj).closest("tr").find(".costShow").show();
	}
	if(typeCode == "A") {
		if($("[name='projectCosts[2].isPay']:checked") == 1) {
			$("[name='projectCosts[2].payMoney']").attr("datatype", "positiveNum");
		}
	} else {
		$("[name='projectCosts[2].payMoney']").removeAttr("datatype");
	}
};

//格式化费用
function formatCost(data) {
	for(var i = 0; i < data.length; i++) {
		for(var j = 0; j < data.length; j++) {
			if(data[i].costName == $("[name='projectCosts[" + j + "].costName']").val()) {
				for(var key in data[i]) {
					if(key == "isPay") {
						$("[name='projectCosts[" + j + "]." + key + "'][value=" + data[i][key] + "]").prop("checked", "checked");
						displayInp("[name='projectCosts[" + j + "]." + key + "']");
					} else if(key == "payType") {
						$("[name='projectCosts[" + j + "]." + key + "']").val(data[i][key]);
						winBid(data[i][key], data[i].discount);

					} else {
						$("[name='projectCosts[" + j + "]." + key + "']").val(data[i][key]);
					}
				}
				break;
			}
		}

	}
	//	if(examType == 2){
	//		$("[name='projectCosts[3].payMoney']").removeAttr("datatype");
	//	}
	if(typeCode == "A") {
		if($("[name='projectCosts[2].isPay']:checked") == 1) {
			$("[name='projectCosts[2].payMoney']").attr("datatype", "positiveNum");
		}
	} else {
		$("[name='projectCosts[2].payMoney']").removeAttr("datatype");
	}
}
//格式化费用
/*function formatCostPre(data){ 
	for(var i = 0; i < data.length; i++){ 
		if(data[i].costName == $("[name='projectCosts[3].costName']").val()){
			for(var key in data[i]){
				if(key == "isPay"){  
					$("."+key + '3').html(data[i][key] == 1 ? "是" : "否");
					$(".payMoney3").html(data[i][key] == 1 ? data[i].payMoney : 0);
					if(data[i][key] == 0){
						$("."+key + '3').parents("tr").find(".costShow").hide();
					}
				} else {
					$("."+key+'3').html(data[i][key]);
				}
			}
			break;
		}
		
	}
}*/
//中标服务费收取方式
function winBid(payType, discount) {
	if(payType == 3) {
		$(".payTypeTit").html('优惠系数（如8折输0.8）<i class="red">*</i>');
		$("[name='projectCosts[1].discount']").attr("datatype", "positiveNum");
		$(".zjDiscount").show();

		$(".zjPayMoney").hide();
		$(".zjPayRatio").hide();

		$(".zjPayMoney input").removeAttr("datatype").val('');
		$(".zjPayRatio input").removeAttr("datatype").val('');

	} else if(payType == 2) {
		//		$(".sltDiscount").hide();
		$(".payTypeTit").html('中标服务费收费比例(%)<i class="red">*</i>');
		$(".zjPayMoney").hide();
		$(".zjPayRatio").show();
		$(".zjDiscount").hide();
		$(".zjPayMoney input").removeAttr("datatype").val('');
		$(".zjPayRatio input").attr("datatype", "positiveNum");
		$(".zjDiscount input").removeAttr("datatype").val('');
	} else if(payType == 1) {
		//		$(".sltDiscount").hide();
		$(".payTypeTit").html('中标服务费收费金额(元)<i class="red">*</i>');
		$(".zjPayMoney").show();
		$(".zjPayRatio").hide();
		$(".zjDiscount").hide();
		$(".zjPayMoney input").attr("datatype", "positiveNum");
		$(".zjPayRatio input").removeAttr("datatype").val('');
		$(".zjDiscount input").removeAttr("datatype").val('');
	}
}

// 招标文件费、图纸文件费

function judgeCost() {
	if(data[i][key] == 0) {
		$("[name='projectCosts[" + j + "].payMoney']").attr("disabled", "disabled");
	} else {
		$("[name='projectCosts[" + j + "].payMoney']").attr("datatype", "positiveNum");
		$("[name='projectCosts[" + j + "].payMoney']").removeAttr("disabled");
	}
}

//保证金
function formatDeposit(depositType) {
	if(depositType == 1) {
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
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var enterpriseInfo = iframeWin.btnSubmit();
			if(enterpriseInfo.length == 0) {
				top.layer.alert("请选择标段分类！");
				return;
			};
			if(enterpriseInfo.length > 200) {
				top.layer.alert("标段分类选择过多,请重新选择");
				return;
			};

			var item = [];
			for(var i = 0; i < enterpriseInfo.length; i++) {
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
			if(typeCode == "A") {
				item.unshift("工程");
			} else if(typeCode == "B") {
				item.unshift("货物");
			} else if(typeCode == "C") {
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
/********************************************************  预审  ****************************************/

//预审评审办法
function pretrialChange(val) {
	if(val == 2) {
		$('.limitNum').show();
	} else {
		$('.limitNum').hide();
	}
}
//是否提前编制招标文件
function isBidFile(val) {
	if(val == 1) {
		$('.abvMakeFile').show();
		if(typeCode == "A") {
			$('.projectShow').show();
		} else {
			$('.projectShow').hide();
		}
	} else {
		$('.abvMakeFile').hide();
		if(typeCode == "A") {
			$('.projectShow').show();
		} else {
			$('.projectShow').hide();
		}
	}
}

/********      保证金递交方式改变后投标保证金缴纳方式改变     *********/
/*
 * 线上的只有虚拟子账户
 * 线下没有虚拟子账户
 * */
function changeChannel(val) {
	$('[name=depositChannel]').each(function() {
		$(this).removeAttr("checked");
	});
	if(val == 1) {
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
function payDeposit(val, isInit) {
	if(val == 1) {
		$('.isCollectDeposit').show();
		if(isInit) {
			$('[name=depositType]').val([1]);
			$('[name=depositChannelType]').val([1]);
			$('.type_offline').show();
			$('[name=depositChannel]').val([1]);
			$('[name=depositCollect]').val(2);
			$('[name=depositMoney]').attr('datatype', 'positiveNum').val('');
			formatDeposit('1');
			depositChange('2');
		}
	} else if(val == 0) {
		$('.isCollectDeposit').hide();
		$('.type_offline').hide();
		$('[name=depositMoney]').removeAttr('datatype').val('');
		$('[name=depositRatio]').removeAttr('datatype').val('');
		$('.isCollectDeposit input').each(function() {
			$(this).removeAttr("checked");
		});
	}
}