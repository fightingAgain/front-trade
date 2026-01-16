/**
 *  zhouyan 
 *  2019-2-20
 *  查看标段详情
 *  方法列表及功能描述
 */
var getUrl = config.tenderHost + '/BidSectionController/getBidSectionPretrialInfo.do'; // 标段详情
var reEditBidder = config.tenderHost + '/BidSectionController/findNewSupplierList.do'; //重新招标编辑时标段下购买过文件的投标人列表
var id = ''; //标段id
var tenderProjectId = ""; //招标项目id
var examType; //资格审查方式

var typeCode = ""; //标段类型
var isPublicProject = "0"; //是否公共资源项目
var isAgency; //是否咨询公司
var tenderMode;
var tenderProjectState = "2"; //2为审核通过
var source = ""; // 1是重新招标
$(function() {
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//新窗口打开的页面去掉底部按钮
	if ($.getUrlParam("isBlank") && $.getUrlParam("isBlank") == "1") {
		$('.bottom-btn').hide();
	}
	//是否咨询公司
	if($.getUrlParam("isAgency") && $.getUrlParam("isAgency") != "undefined") {
		isAgency = $.getUrlParam("isAgency");
	} else {
		isAgency = entryInfo().isAgency;
	}
	//招标项目类型
	if($.getUrlParam("classCode") && $.getUrlParam("classCode") != "undefined") {
		typeCode = $.getUrlParam("classCode");
		$("#checkType").attr("optionName", "checkType" + typeCode);
	}
	//招标项目类型
	if($.getUrlParam("tenderProjectState") && $.getUrlParam("tenderProjectState") != "undefined") {
		tenderProjectState = $.getUrlParam("tenderProjectState");
		if(tenderProjectState == "2") {
			$(".bidCode").show();
		} else {
			$(".bidCode").hide();
		}
	}
	//是否公共资源
	if($.getUrlParam("isPublicProject") && $.getUrlParam("isPublicProject") != "undefined") {
		isPublicProject = $.getUrlParam("isPublicProject");

		if(isPublicProject == 1) {
			$(".aloneSetCheckShow").hide();
			$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode");
		} else {
			$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode0");
			if(isAgency == 1) {
				$(".aloneSetCheckShow").show();
			} else {
				$(".aloneSetCheckShow").hide();
			}
		}
	} else {
		$(".aloneSetCheckShow").hide();
	}

	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
	}
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
		if(source == 1) {
			/*购买过招标文件的投标人是否需要再次购买*/
			$('.re_tender').show();
			getReTenserList(id)
		} else {
			$('.re_tender').hide();
		}
	}
	if($.getUrlParam("tenderMode") && $.getUrlParam("tenderMode") != "undefined") {
		tenderMode = $.getUrlParam("tenderMode");
		if(tenderMode == 1) {
			$(".isSignUpShow").show();
		} else {
			$(".isSignUpShow").hide();
		}
	}
	//	if(tenderMode == 1 && isPublicProject == 1){
	//		$(".isSignUpShow").show();
	//	} else {
	//		$(".isSignUpShow").hide();
	//	}

	if($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined") {
		tenderProjectId = $.getUrlParam("tenderProjectId");
	}
	//资格审查方式
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
		if(examType == 1) {
			$(".exampTypeShow").show();
		} else {
			$(".exampTypeShow").hide();
		}
	}

});

function passMessage(data) {
	$("#interiorTenderProjectCode").html(data.interiorTenderProjectCode);
	$("#tenderProjectName").html(data.tenderProjectName);
}

//标段详情
function getDetail() {
	$.ajax({
		url: getUrl,
		type: "post",
		data: {
			id: id
		},
		beforeSend: function(xhr){
		   var token = $.getToken();
		   xhr.setRequestHeader("Token",(token?token:sessionStorage.token));
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
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
				} else if(key == "tenderProjectClassifyCode") {
					if(arr.isPublicProject) {
						if(arr.isPublicProject == "1") {
							$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode");
						} else {
							$("#tenderProjectClassifyCode").attr("optionName", "tenderProjectClassifyCode0");
						}
					}

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
						//				$("input[name='marginPayType']").attr("disabled",true);
					}
				} else if(key == 'pretrialCheckType') {
					if(arr[key] == 1) {
						$('#pretrialCheckType').html('合格制')
					} else if(arr[key] == 2) {
						$('#pretrialCheckType').html('有限数量制');
						$('.limitNum').css('display', 'inline-block')
					}
				} else {
					$("#checkType").attr("optionName", "checkType" + arr.tenderProjectClassifyCode.substring(0, 1));
					optionValueView($("#" + key), arr[key])
				}
				pretrialChange(arr.pretrialCheckType);
				isBidFile(arr.isAdvanceBidFile)

			}
			$("#depositChannelType").html(arr.depositChannelType == 1 ? "线上" : "线下");
			arr.signUp == 1 ? $(".signUpShow").show() : $(".signUpShow").hide();
			if(arr.pretrialGetFileType == 1 && arr.pretrialDeliverFileType == 1 && arr.pretrialOpenType == 1 && arr.pretrialReviewType == 1) {
				$(".isOnline").hide();
				$("[name='process'][value=1]").prop("checked", true);
			} else {
				$("[name='pretrialGetFileType'][value=" + arr.pretrialGetFileType + "]").prop("checked", "checked");
				$("[name='pretrialDeliverFileType'][value=" + arr.pretrialDeliverFileType + "]").prop("checked", "checked");
				$("[name='pretrialOpenType'][value=" + arr.pretrialOpenType + "]").prop("checked", "checked");
				$("[name='pretrialReviewType'][value=" + arr.pretrialReviewType + "]").prop("checked", "checked");

				$("[name='process'][value=2]").prop("checked", true);
			}
			/* 新增字段【评审费承担方*】，必填项。单选，选项1：中（选）标单位；选项2：代理机构。无默认值。    2024.6.21    代理服务费线上电子票开票方案 */
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

//格式化费用
function formatCost(data) {
	for(var i = 0; i < data.length; i++) {
		for(var j = 0; j < data.length; j++) {
			if(data[i].costName == $("[name='projectCosts[" + j + "].costName']").val()) {
				for(var key in data[i]) {
					if(key == "isPay") {
						$("." + key + j).html(data[i][key] == 1 ? "是" : "否");
						$(".payMoney" + j).html(data[i][key] == 1 ? data[i].payMoney : 0);
						if(data[i][key] == 0) {
							$("." + key + j).parents("tr").find(".costShow").hide();
						}
					} else if(key == "payType") {
						if(data[i][key] == 1) {
							$(".payType" + j).html("固定金额");
						} else if(data[i][key] == 2) {
							$(".payType" + j).html("固定比例");
						} else if(data[i][key] == 3) {
							$(".payType" + j).html("标准累进制");
						}
						winBid(data[i][key], data[i].discount);

					} else {
						$("." + key + j).html(data[i][key]);
					}
				}
				break;
			}
		}

	}
}
//中标服务费收取方式
function winBid(payType, discount) {
	if(payType == 3) {
		//		if(discount == 1){
		//			$(".sltDiscount").html("不优惠");
		//			$(".payTypeTit").html('');
		//			$(".zjDiscount").hide();
		//		} else if(discount == 2){
		//			$(".sltDiscount").html("其他");
		//			$(".payTypeTit").html('');
		//			$(".zjDiscount").hide();
		//		} else {
		//			$(".sltDiscount").html("优惠")
		//			
		//			$(".zjDiscount").show();
		//		}
		//		$(".sltDiscount").show();
		$(".payTypeTit").html('优惠系数（如8折输0.8）');
		$(".zjPayMoney").hide();
		$(".zjPayRatio").hide();

	} else if(payType == 2) {
		$(".payTypeTit").html('中标服务费收费比例(%)');
		$(".zjPayMoney").hide();
		$(".zjPayRatio").show();
		$(".zjDiscount").hide();

	} else if(payType == 1) {
		$(".payTypeTit").html('中标服务费收费金额(元)');
		$(".zjPayMoney").show();
		$(".zjPayRatio").hide();
		$(".zjDiscount").hide();
	}
}
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
		$('.projectShow').hide();
	}
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
		success: function(data) {
			if(data.success) {
				if(data.data.length > 0) {
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
	var tHtml = '';
	for(var i = 0; i < data.length; i++) {
		var able = false;
		if(data[i].isCanDownload && data[i].isCanDownload == 1) {
			able = true
		}
		tHtml += '<tr>';
		tHtml += '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>';
		tHtml += '<td>' + data[i].enterpriseName + '</td>';
		tHtml += '<td style="width: 220px;">';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
		tHtml += '<input type="radio" disabled="disabled" ' + (data[i].isPreFee == 1 ? "checked" : "") + ' value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
		tHtml += '</label>';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
		tHtml += '<input type="radio" disabled="disabled" ' + (data[i].isPreFee == '0' ? "checked" : "") + ' value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
		tHtml += '</label>';
		tHtml += '</td>';
		tHtml += '<td style="width: 200px;">';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">';
		tHtml += '<input type="radio" disabled="disabled" ' + (data[i].isTenderFee == 1 ? "checked" : "") + ' value="1" style="vertical-align: -2px;margin-right: 5px;" />是';
		tHtml += '</label>';
		tHtml += '<label style="padding-right: 20px;margin-bottom: 0;">'
		tHtml += '<input type="radio" disabled="disabled" ' + (data[i].isTenderFee == '0' ? "checked" : "") + ' value="0" style="vertical-align: -2px;margin-right: 5px;" />否';
		tHtml += '</label>';
		tHtml += '</td>';
		tHtml += '</tr>';
	}
	$(tHtml).appendTo('#re_tender tbody');
}