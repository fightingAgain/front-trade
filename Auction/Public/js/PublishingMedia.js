//添加媒体
var typeIdLists = "";//媒体的ID
var typeNameLists = "";//媒体名字
var typeCodeLists = "";//媒体编号
var itemTypeIds = []//媒体ID
var itemTypeNames = []//媒体名字
var itemTypeCodes = []//媒体编号
var mediaListUrl = top.config.Syshost + "/SysDictController/findOptionsByName.do"; //获取媒体的数据
var mediaPublishedUrl = top.config.AuctionHost + "/ProjectMediaController/list.do";
var optionData = [];
var isMediaInit = false;
// { disabled }
var mediaOption = {};
var mediaStageMap = {
	'': 1,
	'xmgg': 1, // 采购公告
	'xmby': 2, // 变更公告
	'jggs': 3, // 结果公示
	'jgtzs': 4, // 结果通知
	'xmyc': 3, //项目异常
}

var optionIdAttr = 'optionId';
var optionNameAttr = 'optionName';
var optionValueAttr = 'optionValue';

$(function() {
	mountedMedia();
})

function initSelectedData() {
	if (!mediaOption.projectId) return;
	$.ajax({
		url: mediaPublishedUrl,
		type: "post",
		async: true,
		dataType: "json",
		data: {
			projectId: mediaOption.projectId,
			packageId: mediaOption.packageId,
		},
		success: function (result) {
			if (result.success) {
				var selectList = result.data || [];
				var selectedList = [];
				var preSelected = [];
				var curSelected = [];
				var defaultSelected = [];
				for(var k = 0; k < selectList.length; k++) {
					var stage = selectList[k].stage || '';
					if (!stage) {
						defaultSelected.push(selectList[k].optionValue)
					}
					if (mediaStageMap[mediaOption.stage] > mediaStageMap[stage]) {
						preSelected.push(selectList[k].optionValue);
					} else if (mediaStageMap[mediaOption.stage] < mediaStageMap[stage]) {
						continue;
					} else {
						if (mediaOption.filterPackageId) {
							if (mediaOption.filterPackageId == selectList[k].packageId) {
								curSelected.push(selectList[k].optionValue)
							}
						} else {
							curSelected.push(selectList[k].optionValue)
						}
					}
				}

				for (var i = 0; i < optionData.length; i++) {
					if (mediaOption.disabled) {
						if (curSelected.length === 0 && mediaOption.stage !== 'jgtzs') {
							if (defaultSelected.indexOf(optionData[i].optionValue) > -1) {
								selectedList.push(optionData[i]);
							}
						} else if (curSelected.indexOf(optionData[i].optionValue) > -1) {
							optionData[i].disabled = preSelected.indexOf(optionData[i].optionValue) > -1;
							selectedList.push(optionData[i]);
						}
					} else {
						if (curSelected.indexOf(optionData[i].optionValue) > -1 || preSelected.indexOf(optionData[i].optionValue) > -1) {
							optionData[i].disabled = preSelected.indexOf(optionData[i].optionValue) > -1;
							selectedList.push(optionData[i]);
						}
					}
					
				}

				formatMediaSelect(selectedList);
			}
		}
	})
};

// 初始化media下拉
function initMediaData() {
	$.ajax({
		url: mediaListUrl,
		type: "post",
		async: false,
		dataType: "json",
		data: {
			"optionName": "PUBLISH_MEDIA_NAME"
		},
		success: function (result) {
			if (result.success) {
				optionData = result.data;
				var op = "";
				for (var i = 0; i < result.data.length; i++) {
					op += '<div style="display: inline-block;margin-right: 12px;line-height:1;">'
					op +=  '<input style="margin:0 2px 0 0;height: 14px;width: 14px;vertical-align: bottom;" type="checkbox" data-id="'+ result.data[i].id +'" data-text="'+ result.data[i].optionText +'" id="ms_' + result.data[i].id + '" value="' + result.data[i].optionValue + '" >'
					op +=  '<label style="margin:0;" for="ms_' + result.data[i].id + '">' + result.data[i].optionText + '</label>'
					op += '</div>';
				}
				$('MediaSelect').append(op);
			}
		}
	})
}
//取出选择的任务执行人的方法
function mediaChange() {
	var optionId = [], optionValue = [], optionName = [];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	$("MediaSelect input[type='checkbox']:checked").each(function() {
		optionId.push($(this).attr("data-id"));
		optionValue.push(this.value);
		optionName.push($(this).attr("data-text"));
	});
	typeIdLists = optionId.join(",")//媒体ID
	typeCodeLists = optionValue.join(",")//媒体编号
	typeNameLists = optionName.join(",")//媒体名字
	//赋值给隐藏的Input域	
	$("[name='" + optionIdAttr + "']").val(typeIdLists);
	$("[name='" + optionValueAttr + "']").val(typeCodeLists);
	$("[name='" + optionNameAttr + "']").val(typeNameLists);
}

function isMediaValid() {
	var valid = !!typeCodeLists;
	if (!valid) {
		top.layer.alert("请选择发布媒体");
	}
	return valid;
}

// 初始化模板
function mountedMedia(flag) {
	if (isMediaInit) return;
	isMediaInit = true;
	optionIdAttr =  $('MediaSelect').attr('optionId') || optionIdAttr;
	optionNameAttr = $('MediaSelect').attr('optionName') || optionNameAttr;
	optionValueAttr =  $('MediaSelect').attr('optionValue') || optionValueAttr;
	var targetForm = $('MediaSelect').attr('targetForm') || 'MediaSelect'
	var formTemplate = '<input type="hidden" name="' + optionIdAttr + '" />'
	formTemplate += '<input type="hidden" name="' + optionValueAttr + '" />'
	formTemplate += '<input type="hidden" name="' + optionNameAttr + '" />'
	// $('MediaSelect').append(template);
	$(targetForm).append(formTemplate);

	initMediaData();
	// 默认空
	if (!flag) {
		initMediaVal([]);
	}

	$('MediaSelect [type="checkbox"]').on('change', function(){
		mediaChange();
	})
}

function initMediaVal(options, mOption) {

	console.log('initMediaVal >> ', options, mOption);

	mediaOption = mOption || {};
	mediaOption.stage = mediaOption.stage || ''

	mountedMedia(true);
	if (mediaOption.projectId) {
		initSelectedData();
	}
	formatMediaSelect(options);

	// 结果公示
	if (mediaOption.stage === 'jggs' || mediaOption.stage === 'jgtzs') {
		$('[name="isPublic"').on('change', function() {
			freshMediaSelect();
		});
		function freshMediaSelect() {
			var isPublic = $("input[name='isPublic']:checked").val();
			if (isPublic == '0') {
				// 公开
				$('MediaSelect').parents('tr').show();
				$('.isPublic').show();
			} else if (isPublic == '1') {
				// 不公开
				$('MediaSelect').parents('tr').hide();
				$('.isPublic').hide();
			}
		}
		freshMediaSelect();
	}

	// var curStage = mediaOption.stage;
	// if (typeof WORKFLOWTYPE != 'undefined') {
	// 	WORKFLOWTYPE = curStage;
	// }
}

function formatMediaSelect(options) {
	options = options || [];
	//发布媒体信息
	var optionId = [], optionValue = [], optionName = [];
	if (options.length > 0) {
		for (var i = 0; i < options.length; i++) {
			optionId.push(options[i].id);
			optionValue.push(options[i].optionValue)
			optionName.push(options[i].optionText);
		}
		
	} else if (!mediaOption.disabled || (mediaOption.disabled && mediaOption.pushPlatform == '2')) {
		for (var i = 0; i < optionData.length; i++) {
			// 默认为 东咨智采平台
			if (optionData[i].id == "186954d7656946d687e5ed42f26f5c88") {
				optionId.push(optionData[i].id);
				optionValue.push(optionData[i].optionValue)
				optionName.push(optionData[i].optionText);
				options.push(optionData[i]);
			}
		}
	}

	typeIdLists = optionId.join(",")//媒体ID
	typeCodeLists = optionValue.join(",")//媒体编号
	typeNameLists = optionName.join(",")//媒体名字

	if (mediaOption.disabled) {
		$('MediaSelect').html(typeNameLists || '无');
	} else {
		
		$("[name='" + optionIdAttr + "']").val(typeIdLists);
		$("[name='" + optionValueAttr + "']").val(typeCodeLists);
		$("[name='" + optionNameAttr + "']").val(typeNameLists);
		for (var i = 0; i < optionData.length; i++) {
			var findIndex = options.findIndex(function(v) {
				return v.optionValue == optionData[i].optionValue;
			})
			if (findIndex > -1)  {
				var find = options[findIndex];
				var disabled = !!find.disabled;
				if (disabled) {
					$('#ms_'+find.id).attr("disabled", "disabled");
				} else {
					$('#ms_'+find.id).removeAttr("disabled");
				}
				$('#ms_'+optionData[i].id).prop("checked", true);
			} else {
				$('#ms_'+optionData[i].id).prop("checked", false);
			}
			if (optionData[i].optionValue == '002') {
				$('#ms_'+optionData[i].id).attr("disabled", "disabled");
			}

			// if (optionId.indexOf(optionData[i].id) > -1) {
				
			// } else {
				
			// }
		}
		mediaChange();
	}
}

if (!Array.prototype.findIndex) {
	Object.defineProperty(Array.prototype, 'findIndex', {
	  value: function(predicate) {
		'use strict';
		if (this == null) {
		  throw new TypeError('Array.prototype.findIndex called on null or undefined');
		}
		if (typeof predicate !== 'function') {
		  throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;
  
		for (var i = 0; i < length; i++) {
		  value = list[i];
		  if (predicate.call(thisArg, value, i, list)) {
			return i;
		  }
		}
		return -1;
	  },
	  enumerable: false,
	  configurable: false,
	  writable: false
	});
  }