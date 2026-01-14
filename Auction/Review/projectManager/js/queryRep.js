var downloadPackFilesUrl = top.config.AuctionHost + '/QueryRepController/downloadpack.do';//下载招投标文件
var startQueryRepUrl = top.config.AuctionHost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
var reportQueryRepUrl = top.config.AuctionHost + '/QueryRepController/findQueryReps.do';//查询查重报告信息
var downloadFileUrl = top.config.FileHost + "/FileController/download.do"; //下载文件
var startQueryUrl = top.config.AuctionHost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
$(function(){
	queryRep();
})
function queryRep(){
	if(progressList.isShowExplain && progressList.isShowExplain == 1){
		$('.showExplain').show();
	}else{
		$('.showExplain').hide();
	}
	$('#btnQueryRepUploadFilesDbw, #btnResultGld, #btnQueryRepUploadFilesGld').hide();
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	var repType;//查重类型 1 对比王 2 广联达
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	getReportQueryRep(repType);
};
$('#queryRepList li').off('click').click(function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $(this).find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	getReportQueryRep(repType);
});
//一键打包下载结果
$("#btnQueryRepAllFilesDbw, #btnQueryRepAllFilesGld").off('click').click(function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	window.location.href = $.parserUrlForToken(downloadPackFilesUrl+'?packageId='+packageId+'&examType='+examType+'&repType='+repType)
});

//下达查重指令
$("#queryRepReportWarp").off("click","#btnOpenGld").on("click","#btnOpenGld",function(){
	// var repType;//查重类型 1 对比王 2 广联达
	// var active = $('#queryRepList .active').find('a').attr('aria-controls');
	// if(active == 'queryRep_DBW'){//对比王
	// 	repType = 1;
	// }else if(active == 'queryRep_GLD'){//广联达
	// 	repType = 2;
	// }
	//唤起广联达查重
	$.ajax({
		type: "post",
		url: startQueryUrl,
		async: true,
		data: {
			'packageId': packageId,
			'examType': examType,
			'repType': '2'
		},
		success: function (data) {
			if (data.success) {
				if(data.data){
					var path = "GVB6Web";
					// var path = "webshell";
					var param = {
						"EnterpriseCode":"DFDZ_001",//接口编码
						"Subsystem": "GVB002", //调用子系统编码
						"TechSimilarityCheck": true,//是否检查标书雷同
						"TechSimilarityParameter": [
							{
								"RuleCode": "fcr-sensitive-01", //仅检查同名文档
								"IsChecked": false,
								"Standard": "0" //IsChecked是true,Standard="1",IsChecked是false,Standard="0"
							},
							{
								"RuleCode": "fcr-tenderee-01", //标识与招标文件相同内容，需添加招标文件才可使用。
								"IsChecked": true,
								"Standard": "1" //IsChecked是true,Standard="1",IsChecked是false,Standard="0"
							},
							{
								"RuleCode": "fcr-sensitive-02", //敏感词检查
								"IsChecked": true,
								"Standard": "敏感词1,敏感词2" //需要检查敏感词内容，敏感词之间用逗号(",")隔开
							},
							{
								"RuleCode": "fcr-sensitive-03", //检查相同地名（需忽略地名）
								"IsChecked": true,
								"Standard": "地名1，地名2" //需忽略的地名名称，和该地名一致的地名会被忽略。
							},
							{
								"RuleCode": "fcr-image-02", //检查全文相似图片
								"IsChecked": true,
								"Standard": "1" //IsChecked是true,Standard="1",IsChecked是false,Standard="0"
							},
							{
								"RuleCode": "fcr-text-02", //文本检查，全文检查精准度。
								"IsChecked": true,
								"Standard": "1" //完全相同句：1；相似句(相似度80%以上)：2；
							}
						],//检查时需要的参数，不传按默认参数检查
						"TendereeExt":"pdf",//招标文件扩展名
						"TendererExt":"pdf",//投标文件扩展名
						"DownloadPath": top.config.AuctionHost+'/QueryRepController/fileDownload',//可供下载文件的完整路径
						"UploadPath":top.config.AuctionHost+'/QueryRepController/fileUpload',// 需要回传报表的Web端地址/本地地址/?
						"RequestID": packageId,
						"DownloadFilePath": data.data.repFileUrl,
						"ExportDefault": false,
						"RequestType": examType
					};
					var paramStr = JSON.stringify(param);
					var param1 = paramStr.replace("\"", "\\\"");
					var paramBase64=Base64.encode(param1);
					var parameter = "://" + paramBase64;
					var url = path+parameter;
					window.open(url)
				}
			} else {
				top.layer.alert(data.message);
			}
		}
	});
});
//查询查重报告信息
$("#queryRepReportWarp").off("click","#btnResultGld").on("click","#btnResultGld",function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	getReportQueryRep(repType)
});
//查重报告
function getReportQueryRep(repType){
	$.ajax({
	    type: "post",
	    url: reportQueryRepUrl,
	    async: true,
	    data: {
	        'packageId': packageId,
	        'examType': examType,
			'repType': repType
	    },
	    success: function (data) {
	        if (data.success) {
				if(data.data){
					reportQueryRepHtml(data.data, repType)
				}
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
}
	//展示查重报告结果
function reportQueryRepHtml(data, repType){
	var html = '';
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var fileType = data[i].fileName.substring(data[i].fileName.lastIndexOf(".") + 1).toLowerCase();
			html += '<tr><td colspan="4">'
				html += '<div class="row clearResultTip">'
					html += '<div class="clearResultItem col-lg-7">'+ data[i].fileName  +'</div>';
					html += '<div class="clearResultBtns col-lg-5">'
					if(data[i].fileUrl){
						if(fileType == 'png' || fileType == 'jpg' || fileType == 'jpge' || fileType == 'pdf') {
							html += '<a class="btn_view" id="pdfView_'+i+'" href="#" style="margin-right: 40px;color: #337ab7;" data-url="'+data[i].fileUrl+'">预览</a>'
						}
						html += '<a class="btn_download" id="download_'+i+'" href="#" style="margin-right: 40px;color: #337ab7;" data-name="'+data[i].fileName+'" data-url="'+data[i].fileUrl+'">下载</a>'
						// if(reviewRoleType == 2){
						// 	html += '<span><a href="#" class="btn_del" style="color: #BB2413;display:inherit !important;" data-id="'+data[i].id+'" data-type="'+repType+'" >删除</a></span></div>'
						// 	// html += '<div class="progress_cont" id="fileContent_'+data[i].key+'"></div>'
						// }
					}
					
					
				html += '</div>'
			html += '</td></tr>'
		}
	}
	if(repType == 1){//对比王
		$('#dbwQueryRepResultTable').html(html);
	}else if(repType == 2){//广联达
		$('#gldQueryRepResultTable').html(html);
	}
};
/* **********************************        广联达查重   --end     ********************************* */

function parameterDatas(){
	var param = {
		"EnterpriseCode":"DFDZ_001",//接口编码
		"Subsystem": "GVB002", //调用子系统编码  经济标（GVB001）、技术标（GVB002）
		"TechSimilarityCheck": true,//是否检查标书雷同
		"IsUploadTechReport": true,//是否上传技术标报表
		"TendereeExt":"COS,XML,HBZB,HBKJ",
		"TendererExt":"COS,XML,HBZB,HBKJ,HBTB",
		"DownloadPath": top.config.AuctionHost+'/ClearBid/fileDownload',
		"UploadPath":top.config.AuctionHost+'/ClearBid/fileUpload',
	};
}
/* **********************************        预览查重结果结果        ********************************* */
$("#queryRepReportWarp").off("click",".btn_view").on("click",".btn_view",function(){
	var url = $(this).attr('data-url')
	previewPdf(url)
});
/* **********************************        下载查重结果结果        ********************************* */
$("#queryRepReportWarp").off("click",".btn_download").on("click",".btn_download",function(){
	var path = $(this).attr('data-url');
	var name = $(this).attr('data-name');
	var loadUrl =downloadFileUrl + '?ftpPath=' + path + '&fname='+name.replace(/\s+/g,"");
	$(this).attr('href', $.parserUrlForToken(loadUrl))
});

