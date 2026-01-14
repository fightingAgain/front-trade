var getClearFilesUrl = top.config.AuctionHost + '/ClearBid/findClearFile.do';//获取清标文件
var changeStateUrl = top.config.AuctionHost + '/ClearBid/finishBidClean.do';//修改清标状态
var getClearResultUrl = top.config.AuctionHost + '/ClearBid/findBidCleanReportItem.do';//获取清标结果路径
var downloadAllFiles = top.config.AuctionHost + '/ClearBid/downloadpack.do';//一键打包下载
var downloadResultFiles = top.config.AuctionHost + '/ClearBid/downloadpackReport.do';//一键打包下载结果
// var bidDetail = top.config.AuctionHost + '/ControlPriceController/findControlPriceForClear.do'; //根据包件id查询控制价
var clearInterfaceUrl = top.config.AuctionHost + '/ClearBid/getCleanInterface.do'; //获取清标接口标准
var downloadFileUrl = top.config.FileHost + "/FileController/download.do"; //下载文件
var clearListUrl = top.config.AuctionHost + '/ClearBid/findCleanReportItemName.do';//获取清标结果目录
var inReviewBiddersUlr = top.config.AuctionHost + '/ClearBid/findSuppliers.do';//获取进入评审的投标人
var getBidCleanParamUrl =  top.config.AuctionHost + '/ClearBid/findBidCleanParam.do';//获取不平衡报价参数
var resultList = [];
var bidCleanParam;//保存过的不平衡报价参数
var isHasControlPriceFile = false;//是否有控制价文件
/* var resultList = [
	{name:'一、总览',
	list:[
		{name:'清标报告', index:'01-', url:'', key: '1'},
		{name:'清标结果汇总_清标结果汇总表', index:'02-', url:'', key: '2'}
	]},
	{name:'二、符合性检查',
	list:[
		{name:'符合性检查结果_符合性检查结果汇总表', index:'01-', url:'', key: '3'},
		{name:'符合性检查结果_单项单位工程编号表', index:'02-', url:'', key: '4'},
		{name:'符合性检查结果_规费和税金表', index:'03-', url:'', key: '5'},
		{name:'符合性检查结果_分部分项工程量清单表', index:'04-', url:'', key: '6'},
		{name:'符合性检查结果_措施项目清单一表', index:'05-', url:'', key: '7'},
		{name:'符合性检查结果_措施项目清单二表', index:'06-', url:'', key: '8'},
		{name:'符合性检查结果_其他项目汇总表', index:'07-', url:'', key: '9'},
		{name:'符合性检查结果_暂列金额表', index:'08-', url:'', key: '10'},
		{name:'符合性检查结果_专业工程暂估价表', index:'09-', url:'', key: '11'},
		{name:'符合性检查结果_计日工表', index:'10-', url:'', key: '12'},
		{name:'符合性检查结果_总承包服务费表', index:'11-', url:'', key: '13'},
		{name:'符合性检查结果_材料暂估价表', index:'12-', url:'', key: '14'},
		{name:'符合性检查结果_甲评材料表', index:'13-', url:'', key: '15'},
		{name:'符合性检查结果_分部分项工程', index:'14-', url:'', key: '16'}
	]},
	{name:'三、计算性检查',
	list:[
		{name:'计算性检查结果_计算性检查结果汇总表', index:'01-', url:'', key: '17'},
		{name:'计算性检查结果_项目、单项、单位工程各项总费用检查', index:'02-', url:'', key: '18'},
		{name:'计算性检查结果_各项汇总金额≠∑明细金额', index:'03-', url:'', key: '19'},
		{name:'计算性检查结果_清单综合单价≠∑单价构成', index:'04-', url:'', key: '20'},
		{name:'计算性检查结果_金额≠计算基数金额X费率', index:'05-', url:'', key: '21'},
		{name:'计算性检查结果_单价为0或负', index:'06-', url:'', key: '22'},
		{name:'计算性检查结果_合价≠单价X数量', index:'07-', url:'', key: '23'}
	]},
]; */
$(function(){
	clearBidding();
	$('#downloadAllFile').hide();
	if(progressList.isHasDetailedListFile == 1){
		$(".clearStartTab").show();
		$('.isHasDetailedListFile, #btnClearResult').show()
	}else{
		$('.isHasDetailedListFile, #btnClearResult').hide()
	}
})
function clearBidding(){
	$.ajax({
	    type: "post",
	    url: getClearFilesUrl,
	    async: false,
	    data: {
	        'packageId': packageId,
	        'examType': 1
	    },
	    success: function (data) {
	        if (data.success) {
				if(data.data.controlPriceFiles && data.data.controlPriceFiles.length > 0){
					isHasControlPriceFile = true
				}
				showClearFiles(data.data);
				getClearResult();
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
};
$('#clnBidderList li').off('click').click(function(){
	if($(this).hasClass('clearResultTab')){
		getClearResult();
	}else{
		getClearInterface();
		getReviewBidders();
		getCleanParam();//获取不平衡报价参数
	}
});
//下载
$("#clnBidReportWarp").off('click',".clearFileDownload").on("click",".clearFileDownload",function(){
    var path = $(this).attr('data-url');
		var name = $(this).attr('data-name');
		var loadUrl =downloadFileUrl + '?ftpPath=' + path + '&fname='+name.replace(/\s+/g,"");
		$(this).attr('href', $.parserUrlForToken(loadUrl))
		// window.location.href = $.parserUrlForToken(loadUrl);
});
//一键打包下载
$('#btnPack').off('click').click(function(){
	window.location.href = $.parserUrlForToken(downloadAllFiles+'?packageId='+packageId+'&examType=1')
});

//获取清标结果
$('#btnClearResult').off('click').click(function(){
	changeState(function(){
		getClearResult();
	});
});
//上传$(this).next().click();
/* $("#reportContent").on("click",".resultFileUp",function(){
	$(this).next().click();
}); */
//显示清标文件
function showClearFiles(data){
	var bidFileHtml = '', bidderFileHtml = '';
	//控制价文件
	if(data.controlPriceFiles && data.controlPriceFiles.length > 0){
		$('.checkPrice').show();
		$('#checkPriceDownload').attr({'data-url': data.controlPriceFiles[0].filePath, 'data-name': data.controlPriceFiles[0].fileName});
	};
	//招标清单文件
	if(data.clarifyItems && data.clarifyItems.length > 0){
		var clarifyItems = data.clarifyItems;
		for(var i=0; i<clarifyItems.length; i++){
			bidFileHtml += '<tr><td style="width: 50px; text-align: center;">'+(i+1)+'</td>';
			bidFileHtml += '<td>'+clarifyItems[i].fileName+'</td>';
			bidFileHtml += '<td style="width: 100px; text-align: center;"><a class="clearFileDownload" href="#" data-url="'+clarifyItems[i].filePath+'" data-name="'+clarifyItems[i].fileName+'" style="color:#337ab7;">下载</a></td></tr>';
		}
		$('#bidClearList tbody').append(bidFileHtml)
	};
	//投标清单文件
	if(data.bidOpeningFiles && data.bidOpeningFiles.length > 0){
		var bidOpeningFiles = data.bidOpeningFiles;
		for(var i=0; i<bidOpeningFiles.length; i++){
			bidderFileHtml += '<tr><td style="width: 50px; text-align: center;">'+(i+1)+'</td>';
			bidderFileHtml += '<td>'+bidOpeningFiles[i].enterpriseName+'</td>';
			bidderFileHtml += '<td>'+bidOpeningFiles[i].fileName+'</td>';
			bidderFileHtml += '<td style="width: 100px; text-align: center;"><a class="clearFileDownload" href="#" data-url="'+bidOpeningFiles[i].filePath+'" data-name="'+bidOpeningFiles[i].fileName+'" style="color:#337ab7;">下载</a></td></tr>';
		}
		$('#bidderClearList tbody').append(bidderFileHtml)
	};
};
/* *********************************   获取清标结果目录  clearListUrl    */
function getClearLists(){
	$.ajax({
	    type: "post",
	    url: clearListUrl,
	    async: false,
	    data: {
			'packageId': packageId,
			'examType': 1,
			'isHasDetailedListFile': progressList.isHasDetailedListFile
		},
	    success: function (data) {
	        if (data.success) {
				if(data.data){
					resultList = data.data;
				}
	        }else {
	            top.layer.alert(data.message);
	        }
	    }
	});
}
/* *********************************   获取清标结果目录  = -end    */
/* **********************************        显示清标结果        ********************************* */
	//获取清标结果
function getClearResult(){
	$.ajax({
	    type: "post",
	    url: getClearResultUrl,
	    async: true,
	    data: {
	        'packageId': packageId,
	        'examType': 1
	    },
	    success: function (data) {
	        if (data.success) {
				getClearLists();
				if(data.data && data.data.length > 0){
					var list = data.data;
					for(var i=0;i<resultList.length;i++){
						for(var j=0;j<resultList[i].list.length;j++){
							for(var m=0;m<list.length;m++){
								if(resultList[i].list[j].name == list[m].fileName.split('.')[0]){
									resultList[i].list[j].url = list[m].fileUrl
								}
							}
						}
					}
				}
				clearResultHtml();
				$('#btnResultPack').show();
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
}
	//修改状态
function changeState(callback){
	$.ajax({
	    type: "post",
	    url: changeStateUrl,
	    async: true,
	    data: {
	        'packageId': packageId,
	        'examType': 1
	    },
	    success: function (data) {
	        if (data.success) {
				if(callback){
					callback();
				}
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
};
	//展示清标结果
function clearResultHtml(){
	var html = '';
	for(var i=0;i<resultList.length;i++){
		html += '<tr><td class="active" colspan="4">'+resultList[i].name+'</td></tr>';
		html += '<tr><td colspan="4">'
		for(var j=0;j<resultList[i].list.length;j++){
			html += '<div class="row clearResultTip">'
				html += '<div class="clearResultItem col-lg-7">'+ resultList[i].list[j].index+resultList[i].list[j].name  +'</div>';
				html += '<div class="clearResultBtns col-lg-5">'
				html += '<button type="button" class="btn_view_clear btn btn-primary btn-xs" id="pdfView_'+resultList[i].list[j].key+'" style="margin-right: 100px;display:'+(resultList[i].list[j].url ==''?"none":"initial")+'" data-url="'+resultList[i].list[j].url+'">预览</button>'
			html += '</div></div>'
		}
		html += '</td></tr>'
	}
	$('#clearResultTable').html(html);
}
/* **********************************        显示清标结果  --end      ********************************* */
/* **********************************        预览清标结果        ********************************* */
//一键打包下载结果
$("#btnResultPack").off('click').click(function(){
	window.location.href = $.parserUrlForToken(downloadResultFiles+'?packageId='+packageId+'&examType=1')
});
//预览
$("#clearResultTable").off('click',".btn_view_clear").on("click",".btn_view_clear",function(){
	var url = $(this).attr('data-url');
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		btn: ["关闭"],
		maxmin: true,
		resize: false,
		title: "预览",
		content: 'view/Bid/Enterprise/ShowImg.html?path=' + url
	})
});
/* **********************************        预览清标结果  --end      ********************************* */
/* **********************************        获取控制价相关信息      ********************************* */
function getClearInterface(){
	$.ajax({
		type: "post",
		url: clearInterfaceUrl,
		async: true,
		data: {
			'packageId': packageId,
			'examType': 1
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					var res = data.data;
					$('#interfaceName').html(res.interfaceName)
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}
/* **********************************                获取进入平审的投标人          ****************************** */
function getReviewBidders(){
	$.ajax({
		type: "post",
		url: inReviewBiddersUlr,
		async: false,
		data: {
			'packageId': packageId,
			'examType': 1
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					setManualSelectTenderHtml(data.data)
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}
function setManualSelectTenderHtml(data){
	var html = '';
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			html += '<label style="padding-right: 20px;margin-bottom: 0;">'
				html += '<input type="checkbox" name="manualSelectTender" disabled="disabled" value="'+data[i].enterpriseName+'" style="vertical-align: -2px;margin-right: 5px;" />'+data[i].enterpriseName;
			html += '</label>'
		}
	}
	$('#manualSelectTenderWrap').html(html);
}
/* **********************************                获取进入平审的投标人          ****************************** */
/* **********************************                获取不平衡报价参数          ****************************** */
function getCleanParam(){
	$.ajax({
		type: "post",
		url: getBidCleanParamUrl,
		async: false,
		data: {
			'packageId': packageId,
			'examType': examType
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					bidCleanParam = data.data;
					compareTypeChange(bidCleanParam.compareType)
					for (var key in bidCleanParam) {
						var newEle = $("[name='" + key + "']")
						if (newEle.prop('type') == 'radio') {
							newEle.val([bidCleanParam[key]]);
											 
						} else if (newEle.prop('type') == 'checkbox') {
							newEle.val(bidCleanParam[key] ? bidCleanParam[key].split(',') : []);
						} else {
							newEle.val(bidCleanParam[key]);
						}
					}
				}else{
					$('[name=manualSelectTenderAll]').prop('checked','checked');
					$.each($('[name=manualSelectTender]'), function(i, val){
						$(this).prop('checked','checked');
					})
					if(isHasControlPriceFile){
						$('.PreTenderWrap').show();
						$('[name=compareType]').val(['PreTender']);
						compareTypeChange('PreTender');
					}else{
						$('.PreTenderWrap').hide();
						$('[name=compareType]').val(['Average']);
						compareTypeChange('Average')
					}
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
};
function compareTypeChange(val){
	if(val == 'PreTender'){//控制价
		$('.PreTenderShow').show();
		$('.PreTenderHide, .FinalScope, .JionCount').hide();
	}else{
		$('.PreTenderShow').hide();
		if(val == 'Designated'){
			//指定值时只显示参与计算的文件，且默认选中第一个投标人
			$('.JionCount').show();
			$('.PreTenderHide, .FinalScope').hide();
		}else{
			$('.PreTenderHide, .FinalScope, .JionCount').show();
		}
	}
};
/* **********************************                获取不平衡报价参数   -end       ****************************** */

