var getClearFilesUrl = top.config.Reviewhost + '/ClearBid/findClearFile.do';//获取清标文件
var startClearUrl = top.config.Reviewhost + '/ClearBid/releaseClear.do';//获取清标文件路径
var changeStateUrl = top.config.Reviewhost + '/ClearBid/finishBidClean.do';//修改清标状态
var getClearResultUrl = top.config.Reviewhost + '/ClearBid/findBidCleanReportItem.do';//获取清标结果路径
var downloadAllFiles = top.config.Reviewhost + '/ClearBid/downloadpack.do';//一键打包下载
var downloadResultFiles = top.config.Reviewhost + '/ClearBid/downloadpackReport.do';//一键打包下载结果
var downloadFileUrl = top.config.FileHost + "/FileController/download.do"; //下载文件
var saveResultFileUrl = top.config.Reviewhost + "/ClearBid/uploadCleanReport.do";//文件保存
var clearInterfaceUrl = top.config.Reviewhost + '/ClearBid/getCleanInterface.do'; //获取清标接口标准
var clearListUrl = top.config.Reviewhost + '/ClearBid/findCleanReportItemName.do';//获取清标结果目录
var inReviewBiddersUlr = top.config.Reviewhost + '/ClearBid/getBidderList.do';//获取进入评审的投标人
var deleteUrl = top.config.Reviewhost + '/ClearBid/deleteCleanReport.do';//删除清标报告
var getBidCleanParamUrl =  top.config.Reviewhost + '/ClearBid/findBidCleanParam.do';//获取不平衡报价参数
var resultFileUploads = null;
var resultList = [];
var bidCleanParam;//保存过的不平衡报价参数
var isHasControlPriceFile = false;//是否有控制价文件
function clearBidding(){
	
	/* if(bidSectionInfo.tenderProjectClassifyCode.indexOf('A') > -1){
		resultList = [
			{name:'一、总览',
			list:[
				{name:'清标内容响应报告', index:'01-', url:'', key: '24'},
				{name:'清标报告', index:'02-', url:'', key: '1'},
				{name:'清标结果汇总_清标结果汇总表', index:'03-', url:'', key: '2'}
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
		]
	}else{
		resultList = [
			{name:'一、总览',
			list:[
				{name:'清标内容响应报告', index:'01-', url:'', key: '24'}
			]},
		]
	} */
	var flag = false;
	// $("#content").load('model/clearBidding/content.html');
	$('#btn-box').html('');
	//reviewRoleType 评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人 评委才能推选组长
	
	$.ajax({
	    type: "post",
	    url: getClearFilesUrl,
	    async: false,
	    data: {
	        'bidSectionId': bidSectionId,
	        'examType': examType
	    },
	    success: function (data) {
	        if (data.success) {
				flag = true;
				$('#content').load('model/clearBidding/content.html',function(){
					//下拉框数据初始化
					if(isHasDetailedListFile == 1 && reviewRoleType != 1){
						$('.isHasDetailedListFile').show();
						$('.clearStartTab').addClass('active');
						$('.clearResultTab').removeClass('active');
						$(".clearStartTab").show();
						if(data.data.controlPriceFiles && data.data.controlPriceFiles.length > 0){
							isHasControlPriceFile = true
						}
						if(isHasControlPriceFile){
							$('.PreTenderWrap').show();
						}else{
							$('.PreTenderWrap').hide();
						}
						showClearFiles(data.data);
						initSelect('.select');
						getClearInterface();
						getReviewBidders();//获取投标人
						getCleanParam();//获取不平衡报价参数
						if(reviewRoleType == 2){//组长可以启动清标
							$('#btnResult, #brightMoon').show();
							$('[name=interfaceCode]').removeAttr('disabled');
							$('input, select').each(function(){
								$(this).removeAttr('disabled')
							})
						}
					}else{
						$('.clearStartTab').removeClass('active');
						$('.clearResultTab').addClass('active');
						$(".clearStartTab").hide();
						$('#clearStart, #btnResult').hide();
						$('#clearResult').show();
						getClearResult();
					}
					/* if(reviewRoleType != 1){
						if(isHasDetailedListFile == 1){
							$('.isHasDetailedListFile').show();
							$(".clearStartTab").show();
							showClearFiles(data.data);
							initSelect('.select');
							getClearInterface();
							getReviewBidders();
						}else{
							$('.clearStartTab').removeClass('active');
							$('.clearResultTab').addClass('active');
							$(".clearStartTab").hide();
							$('#clearStart').hide();
							$('#clearResult').show();
							clearResultHtml()
						}
						if(reviewRoleType == 2){//组长可以启动清标
							if(isHasDetailedListFile == 1){
								$('#btnResult').show();
							}else{
								$('#btnResult').hide();
							}
							$('#brightMoon').show();
							$('[name=interfaceCode]').removeAttr('disabled');
						}
					}else{
						
					} */
				});
				
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
	return flag
}
$('#content').on('click', '.clearTab', function () {
	if($(this).hasClass('clearResultTab')){
		getClearResult();
	}
});
$("#content").on("click","#brightMoon",function(){
	if(!clearBiddingVerify()){
		return
	}
	var interfaceCode = $('[name=interfaceCode]').val();
	if(!interfaceCode){
		top.layer.alert('请选择清标接口标准！')
		return
	}
    // top.layer.confirm("温馨提示:是否开始清标?", function(indexs) {
		// top.layer.close(indexs);
		var startData = {};
		if(isHasDetailedListFile == 1){
			startData = parameterProcessing();
			startData.RationalityCheck = true;
			startData.HomologyCheck = false;
		}else{
			startData.RationalityCheck = false;
			startData.HomologyCheck = false;
		}
		startData.bidSectionId = bidSectionId;
		startData.examType = examType;
		startData.interfaceCode = interfaceCode;
		startData.interfaceName = $('[name=interfaceCode ] option:selected').html();
		$.ajax({
		    type: "post",
		    url: startClearUrl,
		    async: true,
		    data: startData,
		    success: function (data) {
		        if (data.success) {
					if(data.data){
						var path = "GVB6Web";
						// var path = "webshell";
						var param = {
							"EnterpriseCode":"DFDZ_001",//接口编码
							"Subsystem": "GVB001", //调用子系统编码
							"TendereeExt":"COS,XML,HBZB,HBKJ",
							"TendererExt":"COS,XML,HBZB,HBKJ,HBTB",
							"PreTenderExt":"COS,XML,HBZB,HBKJ,HBTB",
							"DownloadPath": top.config.Reviewhost+'/ClearBid/fileDownload',
							"SpecialPath": top.config.Reviewhost+'/ClearBid/costSoftwareNumber',
							"DownloadFilePath": data.data.clearFileUrl,
							"UploadPath":top.config.Reviewhost+'/ClearBid/fileUpload',
							"FileUploadPath": top.config.FileHost+"/clearUpload",
							"RequestID": bidSectionId,
							"ExportDefault": true,
							"RequestType": examType,
							"ParamPath": data.data.paramFileUrl //参数文件地址（页面参数由前端传参改为后台文件读取）
						};
						/* 页面参数由前端传参改为后台json文件里读取 */
						// var postData = parameterProcessing(true);
						// $.extend(param, postData);
						if(isHasDetailedListFile == 1){
							param.HomologyCheck = false;
							param.RationalityCheck = true;
						}else{
							param.HomologyCheck = false;
							param.RationalityCheck = false;
						}
						param.InterfaceCode = $('[name=interfaceCode]').val();
						console.log(param);
						var paramStr = JSON.stringify(param);
						var param1 = paramStr.replace("\"", "\\\"");
						var paramBase64=Base64.encode(param1);
						var parameter = "://" + paramBase64;
						// var parameter = "://eyJJbnRlcmZhY2VDb2RlIjoiSHVCZWlfR0JRNl8wMSIsIlRlbmRlcmVlRXh0IjoiR0JRNiIsIlRlbmRlcmVyRXh0IjoiR0JRNiIsIlByZVRlbmRlckV4dCI6IkdCUTYiLCJGaWxlUGF0aCI6IkM6L1VzZXJzLzg2MTg2L0Rlc2t0b3AvSHVCZWkvIiwiRXhwb3J0U2VsZWN0aW9uIjp0cnVlLCJFeHBvcnREZWZhdWx0Ijp0cnVlIH0=";
						var url = path+parameter;
						window.open(url)
					}
		        } else {
		            top.layer.alert(data.message);
		        }
		    }
		});
    // });
});
function parameterProcessing(type){//是否对外
	var data = {};
	var bidders = [];
	$('[name=manualSelectTender]:checked').each(function(){
		bidders.push($(this).val())
	})
	if(type){
		data.RationalityParameter = {};
		data.HomologyParameter = {};
		data.RationalityParameter.CompareType = $('[name=compareType]:checked').val();
		data.RationalityParameter.PreTenderParameter = {//控制价 计算规则 参数
			'PreTenderFloatRateN': $('[name=floatRateN]').val()
		};
		data.RationalityParameter.AverageParameter = {//平均值、最低值、次低值 计算规则 参数
			"AverageManualSelectTender": bidders.join(','), //参与计算的投标单位名
			'AverageExcludeLowestTenderN': $('[name=excludeLowestTenderN]').val(), //大于等于N家会去高去低
			'AverageExcludeMaximumN': $('[name=excludeMaximumN]').val(), //去掉价格最高的N家
			'AverageExcludeMinimumN': $('[name=excludeMinimumN]').val(), //去掉价格最低的N家
			'AverageFloatRateN': $('[name=averageFloatRateN]').val(), //浮动比率%，正直为上浮，负值为下浮
			'AverageIncludePreTender': $('[name=includePreTender]').val() == 1?true:false //控制价是否参与计算
		};
		/* data.RationalityParameter.DesignatedParameter = {//指定值 计算规则 参数
			'DesignatedTender': ''
		} */
		data.RationalityParameter.FilterParameter = {//筛选参数
			'FilterType': $('[name=filterType]').val(), //筛选范围：Difference 按差额（元）; DifferenceRate 按差额率（%）
			'FilterUpperLimit': $('[name=upperLimit]').val(), //筛选范围 过低为
			'FilterUpperCompareType': $('[name=upperCompareType]').val(), //比较方式：>/≥
			'FilterLowerLimit':  $('[name=lowerLimit]').val(), //筛选范围 过高为
			'FilterLowerCompareType': $('[name=lowerCompareType]').val() //比较方式：</≤
		};
		data.HomologyParameter.MatchError = $('[name=matchError]').is(":checked");//是否分析符合性错误
		data.HomologyParameter.CalcError = $('[name=calcError]').is(":checked");//是否分析计算性错误
		data.HomologyParameter.Type = $('[name=homologyType]:checked').val();//是否忽略所有单位都异常且异常—致的项
		
	}else{
		data.bidCleanParam = {};
		data.bidCleanHomologyParam = {};
		data.bidCleanParam.compareType = $('[name=compareType]:checked').val();//计较价格 控制价 PreTender；平均值 Average；最低值 Minimum；次低值 SecondMinimum；指定值 Designated
		data.bidCleanParam.floatRateN = $('[name=floatRateN]').val();//控制价 计算规则 参数
		data.bidCleanParam.manualSelectTender = bidders.join(',');//平均值规则 参与计算的投标单位名
		data.bidCleanParam.excludeLowestTenderN = $('[name=excludeLowestTenderN]').val();//平均值规则 大于等于N家会去高去低
		data.bidCleanParam.excludeMaximumN = $('[name=excludeMaximumN]').val();//平均值规则 去掉价格最高的N家
		data.bidCleanParam.excludeMinimumN = $('[name=excludeMinimumN]').val();//平均值规则 去掉价格最低的N家
		data.bidCleanParam.averageFloatRateN = $('[name=averageFloatRateN]').val();//平均值规则 浮动比率%，正直为上浮，负值为下浮
		data.bidCleanParam.includePreTender = $('[name=includePreTender]').val();//平均值规则 控制价是否参与计算 0 否 1 是
		// data.bidCleanParam.designatedTender = $('[name=designatedTender]').val();//制定参与计算的投标单位名,只能有1个
		data.bidCleanParam.filterType = $('[name=filterType]').val();//筛选范围：Difference 按差额（元）; DifferenceRate 按差额率（%）
		data.bidCleanParam.upperLimit = $('[name=upperLimit]').val();//筛选范围 过低为
		data.bidCleanParam.upperCompareType = $('[name=upperCompareType]').val();//比较方式：</≤
		data.bidCleanParam.lowerLimit = $('[name=lowerLimit]').val();//比较方式：>/≥
		data.bidCleanParam.lowerCompareType = $('[name=lowerCompareType]').val();//筛选范围 过高为
		data.bidCleanParam.filterDataType = $('[name=filterDataType]').val();//比较方式：过高过低项不合理项、过高项、过低项、不合理项、所有项
		data.bidCleanParam.filterSort = $('[name=filterSort]').val();//筛选排序,按招标顺序\按差额率降序\按差额率绝对值降序
		data.bidCleanHomologyParam.matchError = $('[name=matchError]').is(":checked")?'1':'0';//是否分析符合性错误  0 否 1 是
		data.bidCleanHomologyParam.calcError = $('[name=calcError]').is(":checked")?'1':'0';//是否分析计算性错误  0 否 1 是
		data.bidCleanHomologyParam.homologyType = $('[name=homologyType]:checked').val();
	}
	return data
}
//切换比较价格
$('#content').on('change', '[name=compareType]', function(){
	var compareTypeVal =  $("[name='compareType']:checked").val();
	compareTypeChange(compareTypeVal)
});
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
			$('[name=manualSelectTenderAll]').removeAttr('checked');
			$.each($('[name=manualSelectTender]'), function(i, val){
				if(i==0){
					$(this).prop('checked','checked');
				}else{
					$(this).removeAttr('checked');
				}
			})
		}else{
			$('.PreTenderHide, .FinalScope, .JionCount').show();
			$('[name=manualSelectTenderAll]').prop('checked','checked');
			$.each($('[name=manualSelectTender]'), function(i, val){
				$(this).prop('checked','checked');
			})
		}
	}
};
//全部选中与取消
$("#content").on("click","[name=manualSelectTenderAll]",function(){
    if($('[name=manualSelectTenderAll]').is(':checked')){
		$.each($('[name=manualSelectTender]'), function(i, val){
			$(this).prop('checked','checked');
		});
	}else{
		$.each($('[name=manualSelectTender]'), function(i, val){
			$(this).removeAttr('checked');
		});
	}
	
});
//筛选范围选择
//全部选中与取消
$("#content").on("change","[name=filterType]",function(){
    if($(this).val() == 'DifferenceRate'){
		$('.filterTypeUnit').html('%');
		$('[name=upperLimit]').val('10');
		$('[name=lowerLimit]').val('-10');
	}else if($(this).val() == 'Difference'){
		$('.filterTypeUnit').html('元');
		$('[name=upperLimit]').val('1000');
		$('[name=lowerLimit]').val('-1000');
	}
});

//下载
$("#content").on("click",".clearFileDownload",function(){
    var path = $(this).attr('data-url');
	var name = $(this).attr('data-name');
	var loadUrl =downloadFileUrl + '?ftpPath=' + path + '&fname='+name.replace(/\s+/g,"");
	$(this).attr('href', $.parserUrlForToken(loadUrl))
		// window.location.href = $.parserUrlForToken(loadUrl);
});
//一键打包下载
$("#content").on("click","#btnPack",function(){
	window.location.href = $.parserUrlForToken(downloadAllFiles+'?bidSectionId='+bidSectionId+'&examType='+examType)
    // $(this).attr('href',$.parserUrlForToken(downloadAllFiles+'?bidSectionId='+bidSectionId+'&examType='+examType))
});
//一键打包下载结果
$("#content").on("click","#btnResultPack",function(){
	window.location.href = $.parserUrlForToken(downloadResultFiles+'?bidSectionId='+bidSectionId+'&examType='+examType)
});

//获取清标结果
$("#content").on("click","#btnResult",function(){
	changeState(function(){
		getClearResult();
	});
});
//显示清标文件
function showClearFiles(data){
	var bidFileHtml = '', bidderFileHtml = '';
	//控制价文件
	if(data.controlPriceFiles && data.controlPriceFiles.length > 0){
		$('.checkPrice').show();
		$('#checkPriceDownload').attr({'data-url': data.controlPriceFiles[0].url, 'data-name': data.controlPriceFiles[0].attachmentFileName});
	};
	//招标清单文件
	if(data.clarifyItems && data.clarifyItems.length > 0){
		var clarifyItems = data.clarifyItems;
		for(var i=0; i<clarifyItems.length; i++){
			bidFileHtml += '<tr><td style="width: 50px; text-align: center;">'+(i+1)+'</td>';
			bidFileHtml += '<td>'+clarifyItems[i].fileName+'</td>';
			bidFileHtml += '<td style="width: 100px; text-align: center;"><a class="clearFileDownload" href="#" data-url="'+clarifyItems[i].fileUrl+'" data-name="'+clarifyItems[i].fileName+'" style="color:#337ab7;">下载</a></td></tr>';
		}
		$('#bidClearList tbody').append(bidFileHtml)
	};
	//投标清单文件
	if(data.bidOpeningFiles && data.bidOpeningFiles.length > 0){
		var bidOpeningFiles = data.bidOpeningFiles;
		for(var i=0; i<bidOpeningFiles.length; i++){
			bidderFileHtml += '<tr><td style="width: 50px; text-align: center;">'+(i+1)+'</td>';
			bidderFileHtml += '<td>'+bidOpeningFiles[i].bidderName+'</td>';
			bidderFileHtml += '<td>'+bidOpeningFiles[i].bidFileName+'</td>';
			bidderFileHtml += '<td style="width: 100px; text-align: center;"><a class="clearFileDownload" href="#" data-url="'+bidOpeningFiles[i].bidFileUrl+'" data-name="'+bidOpeningFiles[i].bidFileName+'" style="color:#337ab7;">下载</a></td></tr>';
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
			'bidSectionId': bidSectionId,
			'examType': examType,
			'isHasDetailedListFile': isHasDetailedListFile
		},
	    success: function (data) {
	        if (data.success) {
				if(data.data){
					resultList = data.data;
				}
	        } else {
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
	        'bidSectionId': bidSectionId,
	        'examType': examType
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
									resultList[i].list[j].url = list[m].fileUrl;
									resultList[i].list[j].id = list[m].id;
								}
							}
						}
					}
				}
				clearResultHtml();
				if(reviewRoleType == 4){//reviewRoleType 评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人 评委才能推选组长
					$('#btnResultPack').show();
				}
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
	        'bidSectionId': bidSectionId,
	        'examType': examType
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
	$('#clearResultTable').html('');
	var html = '';
	for(var i=0;i<resultList.length;i++){
		html += '<tr><td class="active" colspan="4">'+resultList[i].name+'</td></tr>';
		html += '<tr><td colspan="4">'
		for(var j=0;j<resultList[i].list.length;j++){
			html += '<div class="row clearResultTip">'
				html += '<div class="clearResultItem col-lg-7">'+ resultList[i].list[j].index+resultList[i].list[j].name  +'</div>';
				html += '<div class="clearResultBtns col-lg-5">'
				// if(resultList[i].list[j].url != ''){
					html += '<a class="btn_view" id="pdfView_'+resultList[i].list[j].key+'" href="javascript:;" style="margin-right: 100px;color: #337ab7;display:'+(resultList[i].list[j].url ==''?"none":"initial")+'" data-url="'+resultList[i].list[j].url+'">预览</a>'
					
				// }
				if(reviewRoleType == 2){
					html += '<a class="btn_delete" id="pdfDelete_'+resultList[i].list[j].key+'" data-id="'+resultList[i].list[j].id+'" href="#" style="margin-right: 100px;color:#BB2413;display:'+(resultList[i].list[j].url ==''?"none":"initial")+'" data-url="'+resultList[i].list[j].url+'">删除</a>'
					html += '<span><a href="#" class="resultFileUp" style="color: #337ab7;display:'+(resultList[i].list[j].url?"none":"initial")+'" data-index="'+resultList[i].list[j].key+'" id="resultFileUp_'+resultList[i].list[j].key+'">上传</a></span></div>'
					html += '<div class="progress_cont" id="fileContent_'+resultList[i].list[j].key+'" style="display:'+(resultList[i].list[j].url?"none":"initial")+'"></div>'
				}
			html += '</div></div>'
		}
		html += '</td></tr>'
	}
	$('#clearResultTable').html(html);
	if(reviewRoleType == 2){
		initUploadEle();
	}
}
/* **********************************        显示清标结果  --end      ********************************* */
/* **********************************        上传清标结果        ********************************* */
function initUploadEle(){
	for(var i=0;i<resultList.length;i++){
		for(var j=0;j<resultList[i].list.length;j++){
			var eleSlect = 'resultFileUp_'+resultList[i].list[j].key;
			var eleCont = 'fileContent_'+resultList[i].list[j].key;
			
			initUpload(eleSlect, eleCont, resultList[i].list[j].name, resultList[i].list[j].key)
		}
	}
}
function initUpload(eleSlect,eleCont, type, key) {
	var targetEle = "#"+eleCont;
	new StreamUpload(targetEle, {
		status: 4,
		extFilters:[".pdf"],
		isRecord: false,
		browseFileId: eleSlect,  //上传按钮
		changeFile: function(file){
			console.log(file);
			var index = file.length - 1;
			var road = JSON.parse(file[index].msg).data.filePath;	// 下载文件路径
			var fileName = encodeURIComponent(file[index].name.replace(/\s+/g,""));	// 文件名
			var fileSize = file[index].size;
			saveResultFile(type, fileName, road, fileSize, function(){
				getClearResult();
			});
		}
	});
 		
};
//文件保存
function saveResultFile(ftype, fname, furl, fsize, callback){
	$.ajax({
	    type: "post",
	    url: saveResultFileUrl,
	    async: true,
	    data: {
	        'bidSectionId': bidSectionId,
	        'examType': examType,
			// 'fileType': ftype,
			'fileName': ftype,
			'fileUrl': furl,
			'fileSize':fsize
	    },
	    success: function (data) {
	        if (data.success) {
				callback();
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
};
/* **********************************        上传清标结果   --end     ********************************* */
/* **********************************        预览清标结果        ********************************* */
//一键打包下载
$("#clearResultTable").on("click",".btn_view",function(){
	var pdfPath = $(this).attr('data-url');
	previewPdf(pdfPath);
});
/* **********************************        预览清标结果  --end      ********************************* */
/* **********************************        删除清标报告        ********************************* */
$("#content").on("click",".btn_delete",function(){
	var pdfId = $(this).attr('data-id');
	$.ajax({
		type: "post",
		url: deleteUrl,
		async: true,
		data: {
			'id': pdfId,
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					getClearResult();
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
	// previewPdf(url)
});
/* **********************************        删除清标报告   -end     ********************************* */
/* **********************************        获取控制价相关信息      ********************************* */
function getClearInterface(){
	$.ajax({
		type: "post",
		url: clearInterfaceUrl,
		async: true,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					var res = data.data;
					$('[name=interfaceCode]').val(res.interfaceCode)
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
			'bidSectionId': bidSectionId,
			'examType': examType
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
				html += '<input class="manualSelectTender" disabled="disabled" type="checkbox" name="manualSelectTender" value="'+data[i].winCandidateName+'" style="vertical-align: -2px;margin-right: 5px;" />'+data[i].winCandidateName;
			html += '</label>'
		}
	}
	$('#manualSelectTenderWrap').html(html);
}
/* **********************************                获取进入平审的投标人 -end         ****************************** */
/* **********************************                获取不平衡报价参数          ****************************** */
function getCleanParam(){
	$.ajax({
		type: "post",
		url: getBidCleanParamUrl,
		async: false,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					bidCleanParam = data.data;
					// if($.isEmptyObject(bidCleanParam)){
					// 	$('[name=manualSelectTenderAll]').prop('checked','checked');
					// 	$.each($('[name=manualSelectTender]'), function(i, val){
					// 		$(this).prop('checked','checked');
					// 	})
					// }else{
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
					// }
				}else{
					$('[name=manualSelectTenderAll]').prop('checked','checked');
					$.each($('[name=manualSelectTender]'), function(i, val){
						$(this).prop('checked','checked');
					})
					if(isHasControlPriceFile){
						$('[name=compareType]').val(['PreTender']);
						compareTypeChange('PreTender');
					}else{
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

/* **********************************                获取不平衡报价参数   -end       ****************************** */
/* **********************************                清标参数验证          ****************************** */
function clearBiddingVerify(){
	var compareTypeVal =  $("[name='compareType']:checked").val();
	var bidderChck = [];
	$('[name=manualSelectTender]:checked').each(function(){
		bidderChck.push($(this).val())
	});
	var regD =  /^([-+])?\d+(\.[0-9]{1,2})?$/;//0.00
	if(compareTypeVal == 'PreTender'){//控制价
		
		// var reg =  /^[0-9]+(.[0-9]{1,2})?/;
		var floatRateNVal = $.trim($('[name=floatRateN]').val());
		if(floatRateNVal == ''){
			top.layer.alert('请输入控制价浮动比率');
			return false
		}else if(!regD.test(floatRateNVal)){
			top.layer.alert('请正确输入控制价浮动比率');
			return false
		}
	}else if(compareTypeVal == 'Designated'){//指定值
		if(bidderChck.length == 0){
			top.layer.alert('请选择参与计算的文件');
			return false
		}
	}else{
		if(bidderChck.length == 0){
			top.layer.alert('请选择参与计算的文件');
			return false
		}
		var reg = /^[0-9]|[1-9][0-9]$/;
		var reg1 = /^[1-9]|[1-9][0-9]$/;
		var excludeLowestTenderNVal = $.trim($('[name=excludeLowestTenderN]').val());
		if(excludeLowestTenderNVal == '' || !reg1.test(excludeLowestTenderNVal)){
			top.layer.alert('请正确输入最终范围大于的家数');
			return false
		}
		var excludeMaximumNVal = $.trim($('[name=excludeMaximumN]').val());
		if(excludeMaximumNVal == '' || !reg.test(excludeMaximumNVal)){
			top.layer.alert('请正确输入最终范围去掉最高的家数');
			return false
		}
		var excludeMinimumNVal = $.trim($('[name=excludeMinimumN]').val());
		if(excludeMinimumNVal == '' || !reg.test(excludeMinimumNVal)){
			top.layer.alert('请正确输入最终范围去掉最低的家数');
			return false
		}
		var averageFloatRateNVal = $.trim($('[name=averageFloatRateN]').val());
		if(averageFloatRateNVal == '' || !regD.test(averageFloatRateNVal)){
			top.layer.alert('请正确输入最终范围的浮动比例');
			return false
		}
		if((Number(excludeMaximumNVal) + Number(excludeMinimumNVal)) >= Number(excludeLowestTenderNVal)){
			top.layer.alert('去掉的单位数之和应小于'+excludeLowestTenderNVal);
			return false
		}
	};
	//筛选设置
	var filterTypeVal = $('[name=filterType]').val();
	var upperLimitVal = $.trim($('[name=upperLimit]').val());//过低
	var lowerLimitVal = $.trim($('[name=lowerLimit]').val());//过高
	var regZ = /^[0-9]+(.[0-9]{1,2})?/;//正数
	var regF = /^\-((\d+(\.\d{0,2})?)|(\d*\.\d{1,2}))$/;//负数
	if(lowerLimitVal == '' || !regF.test(lowerLimitVal)){
		top.layer.alert('请正确输入筛选范围的过低值');
		return false
	}
	if(upperLimitVal == '' || !regZ.test(upperLimitVal)){
		top.layer.alert('请正确输入筛选范围的过高值');
		return false
	}
	return true
	// if(filterTypeVal == 'DifferenceRate'){//按差额率（%）
		
	// }else if(filterTypeVal == 'Difference'){//按差额（元）
		
	// }
}
/* **********************************                清标参数验证 -end         ****************************** */