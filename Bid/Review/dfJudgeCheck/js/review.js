var saveCheckItemListUrl = config.Reviewhost + "/ReviewControll/saveReview.do";
var allHtml = "Review/df/publicPosttrial/judges/model/allReview.html";
var vodeHtml = "Review/dfJudgeCheck/model/isVote.html";
var oneSummary = 'Review/dfJudgeCheck/model/oneSummary.html';
var reviewNode, suppliers, checkType, maxTotalScore, expertId;//评委当前评审项的投标人的评审情况（是否评审或提交评审）
var saveResult = {};//临时存储结果
var allCheckItems = [];//所有评审分项
var preReviewNode = '';//前一个评审项 ,用来判断是否切换了评审项，是否需要清空本地存储
var isEmpty = true;
var isUseLocatoin = true;//是否使用本地存储
var saveExplain = {};//临时存储说明
 
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

var _type =  getUrlParam('type')


//标段评标
function review(node) {

	//清空评委信息
	if (!node.nodeSubType || (reviewNode && node.nodeSubType != reviewNode.nodeSubType)) {
		expertId = '';
	}

	var param = {
		"method": 'findBidList',
		"nodeType": node.nodeType,
		"nodeSubType": node.nodeSubType
	};

	var content, experts;
	//评标评委
	if (reviewRoleType == 1 || reviewRoleType == 2) {
		content = 'model/review/content.html';
	} else {//非评委则需要通过评委列表查看
		content = 'model/review/not_expert_content.html';
		experts = getExperts();
		expertId = experts[0].expertId;
		param.expertId = expertId;
	}

	var flag = false;
	reviewFlowNode(param, function (data) {
		//切换了评审项时清空本地存储
		if (preReviewNode == '' || preReviewNode != $('.flowNodeList .open').attr('data-nodesubtype')) {
			preReviewNode = $('.flowNodeList .open').attr('data-nodesubtype');

			saveResult = {};
			saveExplain = {};
			isEmpty = true
		} else {
			isEmpty = false
		}
		flag = true;
		reviewNode = node;
		if (data.isCompete == 1) {
			suppliers = data.supplierDtos;
			$('#content').load(content, function () {
				if (experts) {
					//显示评委列表
					showExpertNav(experts, expertId);
				}
				showSupplierList(data.supplierDtos);
				getExpertCheckItem(data.supplierDtos[0].supplierId);
			});
		} else if (data.isCompete == 2) {
			compete(data.isEnter, data.competeCheckId, data.supplierDtos, bidSectionInfo.bidType, data.isBlind, function () {
				review(node);
			});
		}
	}, false);
	return flag;
};


/**
 * 显示评委列表
 * @param experts
 */
function showExpertNav(experts, expertId) {
	var html = "";
	for (var i = 0; i < experts.length; i++) {
		var open = ''
		if (expertId == experts[i].expertId) {
			open += ' open'
		}
		html += '<div style="margin-bottom:10px;min-width:80px" data-expertId="' + experts[i].expertId + '" class="btn btn-default expertBtn' + open + '">' + experts[i].expertName + '</div>'
	}
	$("#expertNav").html(html);
}

/**
 * 渲染投标人列表
 * @param suppliers
 */
function showSupplierList(suppliers) {
	var list = '';
	for (var i = 0; i < suppliers.length; i++) {
		var resultKey = suppliers[i].supplierId;
		/*本地存储结果与总分*/
		if (isEmpty) {
			saveResult[resultKey] = [];
		}

		var className = 'bidder';
		if (i == 0) {
			className += ' active';
		}
		if (suppliers[i].checkState == 0) {
			className += ' saveReviewed';//保存
		} else if (suppliers[i].checkState == 1) {
			className += ' isReviewed';//已评审
		} else {
			className += ' notReviewed';//未评审
		}
		var bidderName = suppliers[i].isBlind ==1?suppliers[i].enterpriseName:showBidderRenameMark(suppliers[i].supplierId, suppliers[i].enterpriseName, RenameData, 'content');
		list += '<li role="supplier" class="' + className + '" data-bidderId="' + suppliers[i].supplierId + '"><a href="#"  ria-controls="supplier" role="tab" data-toggle="tab">' + bidderName + '</a></li>'
	};
	$("#bidderList").html(list);

	var allWidth = 0;

	$.each($("#bidderList li"), function (index, item) {
		allWidth += Number($(this).width()) + 2;
	})

	if (allWidth > $("#bidderList").width()) {
		$("#bidderList-box").css({ 'padding': '0 30px' })
		$('.go_left').show();
		$('.go_right').show();
		// $(".control-btn").show();
	} else {
		$("#bidderList-box").css({ 'padding': '0 0' })
		$('.go_left').hide();
		$('.go_right').hide();
		// $(".control-btn").hide();
	}

	initControlBtnEvent()
}

// 初始化bidderList左右按钮的点击事件
function initControlBtnEvent() {
	var passli = 0;
	var offset = 0;

	$("#left-btn").click(function () {
		// 获取当前可偏移offset最大值;
		var maxoffset = 0;
		$.each($("#bidderList li"), function (index, item) {
			var thisoffset = $(this).position();
			if (thisoffset.left + 30 >= 0) {
				return;
			} else {
				maxoffset = $("#bidderList").width() - thisoffset.left - $(this).width() + 30;
			}
		})


		if (offset - maxoffset <= 0) {
			offset = 0;
		} else {
			offset -= maxoffset;
		}
		$.each($("#bidderList li"), function (index, item) {
			$(this).css({ 'transform': 'translateX(-' + offset + 'px)' })
		})
	})
	$("#right-btn").click(function () {
		var maxoffset;
		$.each($("#bidderList li"), function (index, item) {
			var thisoffset = $(this).position();
			if (thisoffset.left - 30 > $("#bidderList").width()) {
				return;
			} else {
				maxoffset = thisoffset.left - 30;
			}
		})

		var allWidth = 0;
		$.each($("#bidderList li"), function (index, item) {
			allWidth += Number($(this).width()) + 2;
		})
		if (offset + maxoffset > allWidth - $("#bidderList").width()) {
			offset = allWidth - $("#bidderList").width();
		} else {
			offset += maxoffset;
		}
		$.each($("#bidderList li"), function (index, item) {
			$(this).css({ 'transform': 'translateX(-' + offset + 'px)' })
		})
	})
}

/**
 * 投标人对应的评价内容
 * @param bidderId
 */
function getExpertCheckItem(bidderId) {
	bidderId = bidderId || currBidderId;
	var param = {
		"method": 'getExpertCheckItem',
		"nodeType": reviewNode.nodeType,
		"nodeSubType": reviewNode.nodeSubType,
		"supplierId": bidderId
	};

	if (expertId) {
		param.expertId = expertId;
	}
	reviewFlowNode(param, function (data) {
		maxTotalScore = data.score;
		checkType = data.checkType;
		currBidderId = bidderId;
		showCheckItem(data, bidderId);
	}, true);
};

/**
 * 显示打分详情
 * @param data
 */
function showCheckItem(data) {
	/*自动计算不使用本地存储*/
	if (data.isAutoCalculate && data.isAutoCalculate == 1) {
		isUseLocatoin = false;
	}
	//	console.log(data)
	//渲染评标内容表格样式；
	var btns = '';
	if (isEnd == 0) {
		if (data.submitType != 1) {
			if (reviewRoleType == 1 || reviewRoleType == 2) {
				btns += "<button id='saveReviewBtn' class='btn btn-primary btn-strong keyButton'>保存</button>"
				btns += "<button id='submitReviewBtn' class='btn btn-primary  btn-strong keyButton'>提交</button>";
			}
		} else {
			if ((reviewRoleType == 1 || reviewRoleType == 2) && newestNode.nodeSubType == reviewNode.nodeSubType) {
				btns += "<button id='reverseReviewBtn' class='btn btn-primary btn-strong keyButton'>撤回</button>"
			}
		}
		/* BU2024030003招标项目隐藏评标委员会“否决性投票”功能 */
		/* if (reviewRoleType == 1 || reviewRoleType == 2) {
			btns += "<button id='isVoteBtn' class='btn btn-primary btn-strong ' data-blind = '" + data.isBlind + "' >否决性投票</button>";
		} */
		//根据标段类型，展示不同的按钮 bidType值为1是暗标 0是明标
		if (bidSectionInfo.bidType == 1) {
			if (data.blindFinish == 1) {
				btns += "<button id='fileBtn' class='btn btn-primary btn-strong'>招投标文件</button>";
			} else {
				//判断是否是暗标项，如果是暗标项则显示
				if (data.isBlind == 1) {
					btns += "<button id='fileABBtn' class='btn btn-primary btn-strong'>投标文件暗标</button>";
				}
				btns += "<button id='fileMBBtn' class='btn btn-primary btn-strong'>投标文件明标</button>";
			}
		} else {
			btns += "<button id='fileBtn' class='btn btn-primary btn-strong'>招投标文件</button>";
		}
	} else {
		btns += "<button id='fileBtn' class='btn btn-primary  btn-strong'>招投标文件</button>"
	}

	// if(reviewRoleType == 2){
	//    btns+="<button id='allReviewBtn'  class='btn btn-primary btn-strong allReviewBtn'>其他评委的评标结果</button>";
	// }

	if (reviewRoleType != 1 && reviewRoleType != 2) {
		btns += '<button id="oneSummary" type="button" class="btn btn-primary btn-strong keyButton">' + reviewNode.nodeName + '的评标汇总</button>';
	}

	btns += '<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';

	$('#btn-box').html(btns);
	var height = ''
	if (data.submitType == 1) {
		if (data.bidCheckItems.length > 15) {
			height = '580';
		}
	} else {
		if (data.bidCheckItems.length > 10) {
			height = '580';
		}


	}

	var columns = [{
		field: "xuhao",
		title: "序号",
		align: "center",
		halign: "center",
		width: "50px",
		formatter: function (value, row, index) {
			return index + 1;
		}
	},
	{
		field: "checkName",
		title: "评价内容",
		align: "left",
		halign: "left",
		width: '80',
		formatter: function (value, row, index) {
			return '<pre>' + (value || '') + '</pre>'
		}

	},
	{
		field: "checkStandard",
		title: "评价标准",
		halign: "left",
		align: "left",
		width: '400',
		formatter: function (value, row, index) {
			/*var html1 = value.split('\n');
			var html = html1.join('</br>');
			return '<pre>'+ (html||'') +'</pre>'*/
			return '<pre>' + (value || '') + '</pre>'
		}

	}, {
		field: "isKey",
		title: data.checkType != 3 ? "是否关键要求" : "分值",
		halign: "center",
		width: '80',
		align: "center",
		formatter: function (value, row, index) {
			if (data.checkType != 3) {
				if (row.isKey == 1) {
					return '是'
				} else {
					return '否'
				}
			} else {
				return row.score
			}

		}
	}, 
	{
		field: 'itemScoreType',
		title: '打分类型',
		halign: "center",
		align: "center",
		width:'80',
		visible: data.checkType == 3,
		formatter: function(value) {
			if (value == '1') {
				return '主观分';
			} else if (value == '2') {
				return '客观分'
			}
		}
	},
	{
		field: "caoz",
		title: data.checkType != 3 ? "操作" : "打分",
		halign: "center",
		align: "center",
		width: '150',
		events: {
			'change .supplierIskey': function (e, value, row, index) {
				changeLocal(row.id, $(this).val(), data.checkType)
			},
			'change .supplierScore': function (e, value, row, index) {
				var resultL = 0;
				var reg = /(^(0|([1-9]\d*))\.\d{1,2}$)|(^(0|([1-9]\d*))$)/;
				//var floats=/^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,2})?$/
				if ($(this).val() != "") {
					if (!(reg.test($(this).val()))) {
						$(this).val("");
						top.layer.alert('温馨提示：分值必须为大于等于零的数字,且小数点后面最多两位小数');
						return false;
					};
					if (parseFloat($(this).val()) > parseFloat(row.score)) {
						$(this).val("");
						top.layer.alert('温馨提示：当前项打分不能超过' + row.score + '分');

						return false;
					};
				}
				$(".supplierScore").each(function () {
					if ($.trim($(this).val()) != '') {
						resultL = resultL + Number($.trim($(this).val())) * 100;
}
	})
				resultL = (resultL/100).toFixed(2);
				$("#totalScore .supplierTotalScore").val(resultL)
				changeLocal(row.id, $(this).val(), data.checkType)

			}
		},
		formatter: function (value, row, index) {
			if (data.checkType != 3) {//不等于评分制0合格制、1偏离、2响应、3打分制
				//						console.log(data)
				//						console.log(reviewRoleType)
				if (data.submitType == 1) {//提交
					if (data.checkType == 2) {
						val = (row.expertIsKey == 1 ? '响应' : '不响应')
					} else if (data.checkType == 0) {
						val = (row.expertIsKey == 1 ? '合格' : '不合格')
					} else if (data.checkType == 1) {
						val = (row.expertIsKey == 1 ? '未偏离' : '偏离')
					}
				} else {//临时保存或撤回
					if (reviewRoleType == 1 || reviewRoleType == 2) {
						val = "<select class='form-control supplierIskey' data-id='" + row.id + "'>"
						if (data.checkType == 2) {
							val += "<option value='1' " + (row.expertIsKey != 0 ? "selected='selected'" : "") + " >响应</option>"
							val += "<option value='0' " + (row.expertIsKey == 0 ? "selected='selected'" : "") + ">不响应</option>"
						} else if (data.checkType == 0) {
							val += "<option value='1' " + (row.expertIsKey != 0 ? "selected='selected'" : "") + ">合格</option>"
							val += "<option value='0' " + (row.expertIsKey == 0 ? "selected='selected'" : "") + ">不合格</option>"
						} else if (data.checkType == 1) {
							val += "<option value='1' " + (row.expertIsKey != 0 ? "selected='selected'" : "") + ">未偏离</option>"
							val += "<option value='0' " + (row.expertIsKey == 0 ? "selected='selected'" : "") + ">偏离</option>"
						}
						val += "</select>"
					} else {
						val = ''
					}
				}

				return val
			} else {//等于评分制

				if (data.submitType == 1) {//临时保存
					return row.expertScore
				} else {
					if (reviewRoleType == 1 || reviewRoleType == 2) {
						return "<input   type='number' value='" + (row.expertScore != undefined ? row.expertScore : "") + "' class='form-control supplierScore' data-id='" + row.id + "'/>"
					} else {
						return ''
					}
				}

			}

		}
	},
	{
		field: "reason",
		title: "原因",
		halign: "center",
		align: "center",
		width: '200',
		events: {
			'change .reason': function (e, value, row, index) {
				changeLocal(row.id, $(this).val(), 'reason')
			},
		},
		formatter: function (value, row, index) {

			if (data.submitType == 1) {//提交
				return "<pre>" + (row.reason || "") + "</pre>"
			} else {
				if (reviewRoleType == 1 || reviewRoleType == 2) {
					return "<textarea style='max-height:80px;' type='text'class='form-control reason'>" + (row.reason != undefined ? row.reason : "") + "</textarea>"
				} else {
					return ''
				}

			}
		}
	}
	];
	allCheckItems = JSON.parse(JSON.stringify(data.bidCheckItems));


	//  allCheckItems = JSON.parse(JSON.stringify(data.bidCheckItems));
    /*
     * 加载评审项内容时，若本地存储中有数据则用本地存储
     * */
	$.each(saveResult, function (itm, val) {
		if (itm == $('#bidderList .active').attr('data-bidderid')) {
			if (val.length > 0 && isUseLocatoin && data.submitType != 1) {//若本地存储中有数据（未提交）
				for (var a = 0; a < val.length; a++) {
					for (var b = 0; b < allCheckItems.length; b++) {
						if (val[a].checkItemId == allCheckItems[b].id) {//同一个评审项结果进行赋值
							if (data.checkType != 3) {//非打分制
								allCheckItems[b].expertIsKey = val[a].isKey;
							} else {//打分制
								allCheckItems[b].expertScore = val[a].score;
							}
							if (val[a].reason) {//原因
								allCheckItems[b].reason = val[a].reason;
							}
						}
					}
				}
			} else {//无数据
				if (data.submitType != 1 && data.checkType != 3) {
					for (var m = 0; m < allCheckItems.length; m++) {
						if (!allCheckItems[m].expertIsKey && allCheckItems[m].expertIsKey != 0) {
							allCheckItems[m].expertIsKey = '1';
						}
					}
				}
				setLocalStorage()
				//			    console.log(saveResult)
			}
		}
	});

	$('#checkItemList').bootstrapTable('destroy');

	$('#checkItemList').bootstrapTable({ pagination: false, height: height, columns: columns });
	$('#checkItemList').bootstrapTable("load", allCheckItems); //重载数据
	if (!height) {
		$('#tableList .fixed-table-body').css("height", "auto");
	}
	var totalScore = '';
	var remarkDiv = '';
	var dataBidderid = $('#bidderList .active').attr('data-bidderid');
	if (data.checkType == 3) {
		totalScore = '总分：';
		if (data.submitType != 1 && _type!='pbgl') {
			var allScore = 0;
			for (var i = 0; i < allCheckItems.length; i++) {
				if (allCheckItems[i].expertScore) {
					allScore += Number(allCheckItems[i].expertScore)*100
				}
			}
			allScore=allScore/100
			if (isUseLocatoin) {
				totalScore += "<input readonly='readonly' type='number' style='display: inline;width:165px' value='" + allScore + "' class='form-control supplierTotalScore'/>";
			} else {
				totalScore += "<input readonly='readonly' type='number' style='display: inline;width:165px' value='" + (data.totalScore != undefined ? data.totalScore : "") + "' class='form-control supplierTotalScore'/>";
			}
			remarkDiv = "<span style='vertical-align:top'>说明：</span><textarea style='display: inline;vertical-align:top;resize:none;width:calc(100% - 42px)' type='text' id='description' class='reason form-control' maxlength='200' rows='3'>" + (data.description? data.description : saveExplain[dataBidderid]?saveExplain[dataBidderid]:'') + "</textarea>";
		} else {
			totalScore += data.totalScore?data.totalScore:'';
			// console.log(data.totalScore)
			remarkDiv = '说明：'+ (data.description!= undefined ? data.description : "");
		}
		$("#totalScore").html(totalScore);
		$("#totalScore").show();
		$("#remarkDiv").html(remarkDiv);
		$("#remarkDiv").show();	
	} else {
		$("#totalScore").html("");
		$("#totalScore").hide();
		$("#remarkDiv").html("");
		$("#remarkDiv").hide();	
	};
}

/**
 * 撤回提交
 * @param bidderId
 * @param submitType
 * @returns {boolean}
 */
function reverse(bidderId) {
	var param = {
		'method': 'stageRecall',
		"nodeType": reviewNode.nodeType,
		"nodeSubType": reviewNode.nodeSubType,
		'supplierId': bidderId,
	};
	reviewFlowNode(param, function (data) {
		$('#reverseReviewBtn').removeAttr('disabled');
			top.layer.alert('撤回成功');
			getExpertCheckItem(bidderId);
		// if (submitType == 0) {
		// 	top.layer.alert('保存成功');
		// 	$('#reviewWarp .active').addClass('saveReviewed').removeClass('notReviewed');
		// } else if (submitType == 1) {
		// 	top.layer.alert('提交成功');
		// 	$('#reviewWarp .active').addClass('isReviewed').removeClass('notReviewed').removeClass('saveReviewed');
		// 	getExpertCheckItem(bidderId);
		// }
		// for (var i = 0; i < suppliers.length; i++) {
		// 	if (suppliers[i].supplierId == bidderId) {
		// 		suppliers[i].checkState = submitType;
		// 		break;
		// 	}
		// }
	}, false);
	
}



/**
 * 评标打分
 * @param bidderId
 * @param submitType
 * @returns {boolean}
 */
function saveScore(bidderId, submitType) {
	var isSave = true, index;

	var param = {
		"method": 'saveReview',
		"nodeType": reviewNode.nodeType,
		"nodeSubType": reviewNode.nodeSubType,
		'supplierId': bidderId,
		'submitType': submitType,
		'expertCheckItems': []
	};
	if (checkType == 3) {//打分合集
		param['totalScore'] = $(".supplierTotalScore").val();
		param['description'] = $("#description").val();
		$(".supplierScore").each(function (e) {
			if (submitType == 1) {
				if ($(this).val() == "") {
					isSave = false;
					index = e;
					$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
					return false;
				}
			}
			param.expertCheckItems.push({
				"score": $(this).val(),
				"checkItemId": $(this).data('id'),
				"reason": $(this).parents("tr").eq(0).find(".reason").val()
			})
		});

	} else {//合格合集
		$(".supplierIskey").each(function (e) {
			var reason = $(this).parents("tr").eq(0).find(".reason").val();
			if (submitType == 1) {
				if ($(this).val() == 0) {
					if (reason == "") {
						isSave = false;
						index = e;
						$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
						return false;
					}
				}
			};
			param["expertCheckItems[" + e + "].isKey"] = $(this).val();
			param["expertCheckItems[" + e + "].checkItemId"] = $(this).data('id');
			param["expertCheckItems[" + e + "].reason"] = reason;
		});
	};
	if (submitType == 1) {
		if (isSave == false) {
			if (checkType == 3) {
				top.layer.alert('温馨提示：第' + (index + 1) + '行请填写分数');
			} else {
				if (checkType == 0) {
					var isText = "不合格";
				} else if (checkType == 1) {
					var isText = "偏离";
				} else if (checkType == 2) {
					var isText = "不响应";
				};
				top.layer.alert('温馨提示：第' + (index + 1) + '行请填写' + isText + '原因');
			}
			$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
			return false;
		}
		if (checkType == 3) {
			var reg = /(^(0|([1-9]\d*))\.\d{1,2}$)|(^(0|([1-9]\d*))$)/;
			if (!(reg.test($(".supplierTotalScore").val()))) {
				$(".supplierTotalScore").val("");
				top.layer.alert('温馨提示：总分必须为大于等于零的数字,且小数点后面最多两位小数');
				$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
				return false;
			};
			if (parseFloat($(".supplierTotalScore").val()) > parseFloat(maxTotalScore)) {
				top.layer.alert('温馨提示：总分不能超过' + maxTotalScore);
				$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
				return false;
			}
		}
	};
	reviewFlowNode(param, function (data) {
		$('#submitReviewBtn, #saveReviewBtn').removeAttr('disabled');
		if (submitType == 0) {
			top.layer.alert('保存成功');
			$('#reviewWarp .active').addClass('saveReviewed').removeClass('notReviewed');
		} else if (submitType == 1) {
			top.layer.alert('提交成功');
			$('#reviewWarp .active').addClass('isReviewed').removeClass('notReviewed').removeClass('saveReviewed');
			getExpertCheckItem(bidderId);
		}
		for (var i = 0; i < suppliers.length; i++) {
			if (suppliers[i].supplierId == bidderId) {
				suppliers[i].checkState = submitType;
				break;
			}
		}
	}, false);
}

function viewFileBtn(currBidderId) {
	var surl = "model/showBidFile.html";
	sessionStorage.setItem('bidSectionId', bidSectionId);
	sessionStorage.setItem('supplierId', currBidderId);
	sessionStorage.setItem('examType', examType);
	sessionStorage.setItem('gid', reviewNode.nodeSubType);
	window.open(surl, "_blank");
}

/**
 * 获取暗标/明标文件
 * @returns
 */
function viewBlindFileBtn(currBidderId, blindBid) {
	var surl_1 = "model/showMBBidFile.html";
	var surl_0 = "model/showABBidFile.html";
	sessionStorage.setItem('bidSectionId', bidSectionId);
	sessionStorage.setItem('supplierId', currBidderId);
	sessionStorage.setItem('examType', examType);
	sessionStorage.setItem('gid', reviewNode.nodeSubType);

	if (blindBid == 0) {
		window.open(surl_0, "_blank");
	} else if (blindBid == 1) {
		window.open(surl_1, "_blank");
	}
}

/**
 * 获取当前投标人
 * @returns
 */
function getCurrBidders() {
	return suppliers;
}

function allReview() {
	top.layer.open({
		type: 2,
		title: "其他评委的评标结果",
		area: ['1000px', '600px'],
		resize: false,
		content: allHtml + '?bidSectionId=' + bidSectionId + '&examType=' + examType,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.supplierLists(checkType, 0, suppliers)
		},
	});
}
$('#content').on('click', '.bidder', function () {
	getExpertCheckItem($(this).attr("data-bidderId"));
});

$('#content').on('click', '.expertBtn', function () {
	expertId = $(this).attr("data-expertId");
	$(this).addClass('open').siblings().removeClass('open');
	getExpertCheckItem();
});

$('#btn-box').on('click', '#fileBtn', function () {
	viewFileBtn(currBidderId);
});

//明标文件查看
$('#btn-box').on('click', '#fileMBBtn', function () {
	viewBlindFileBtn(currBidderId, 1);
});

//暗标文件查看
$('#btn-box').on('click', '#fileABBtn', function () {
	viewBlindFileBtn(currBidderId, 0);
});

$('#btn-box').on('click', '#reverseReviewBtn', function () {
	$('#reverseReviewBtn').attr('disabled', 'disabled');
	reverse(currBidderId);
})

$('#btn-box').on('click', '#saveReviewBtn', function () {
	$('#saveReviewBtn').attr('disabled', 'disabled');
	saveScore(currBidderId, 0);
})

$('#btn-box').on('click', '#submitReviewBtn', function () {
	$('#submitReviewBtn').attr('disabled', 'disabled');
	saveScore(currBidderId, 1);
})

$('#btn-box').on('click', '#allReviewBtn', function () {
	allReview();
});
$('#btn-box').on('click', '#isVoteBtn', function () {

	var isblind = $(this).attr('data-blind');

	if (!isOpenVote) {
		isVoteview(isblind)
	}
});

$('#btn-box').on('click', '#oneSummary', function () {
	top.layer.open({
		type: 2,
		title: reviewNode.nodeName + "评标汇总",
		area: ['1000px', '600px'],
		resize: false,
		content: oneSummary + '?bidSectionId=' + bidSectionId + '&examType=' + examType + '&bidCheckId=' + reviewNode.nodeSubType + '&checkType=' + checkType,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		},
	});
})
/******************     本地存储      ****************/
function setLocalStorage() {
	$.each(saveResult, function (key, value) {
		if ($('#bidderList .active').attr('data-bidderid') == key) {
			for (var i = 0; i < allCheckItems.length; i++) {
				var obj = {};
				var isCover = true;
				if (saveResult[key].length > 0) {
					for (var n = 0; n < saveResult[key].length; n++) {
						if (saveResult[key][n].checkItemId == allCheckItems[i].id) {
							isCover = false;
						}
					}
				}

				if (allCheckItems[i].expertIsKey) {
					obj.checkItemId = allCheckItems[i].id;
					obj.isKey = allCheckItems[i].expertIsKey;
					if (allCheckItems[i].reason) {
						obj.reason = allCheckItems[i].reason;
					}
				} else if (allCheckItems[i].expertScore != undefined) {//打分制
					obj.checkItemId = allCheckItems[i].id;
					obj.score = allCheckItems[i].expertScore;
					if (allCheckItems[i].reason) {
						obj.reason = allCheckItems[i].reason;
					}
				} else {
					isCover = false;
				}
				if (isCover) {
					//					console.log(obj)
					saveResult[key].push(obj);
				}
			}
		}
	});
}
/****
 * 切换时改变本地存储 
 * id 评审项 id
 * val 切换的值
 * type 切换类型 reason 原因  3 打分 
 * ****/
function changeLocal(id, value, type) {
	$.each(saveResult, function (key, val) {
		if (key == $('#bidderList .active').attr('data-bidderid')) {
			for (var m = 0; m < saveResult[key].length; m++) {
				if (saveResult[key][m].checkItemId == id) {
					if (type == 'reason') {//原因
						saveResult[key][m].reason = value;
					} else if (type == '3') {//打分
						saveResult[key][m].score = value;
					}else {
						saveResult[key][m].isKey = value;
					}
				}
			}
		}
	});
}
/* 投标人导航栏 */
$('#content').on('click','.go_left',function(){
	var ul_location = Number($("#bidderList").scrollLeft())
 	$("#bidderList").scrollLeft(ul_location-100);
})
$('#content').on('click','.go_right',function(){
	var ul_location = Number($("#bidderList").scrollLeft())
	$("#bidderList").scrollLeft(ul_location + 100);
})
$('#contents').on('change','#description',function(){
	var dataBidderid = $('#bidderList .active').attr('data-bidderid');
	saveExplain[dataBidderid] = $(this).val();
});
