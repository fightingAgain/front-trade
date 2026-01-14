var downloadPackFilesUrl = top.config.Reviewhost + '/QueryRepController/downloadpack.do';//下载招投标文件
var startQueryRepUrl = top.config.Reviewhost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
var reportQueryRepUrl = top.config.Reviewhost + '/QueryRepController/findQueryReps.do';//查询查重报告信息
var reportFinishUrl = top.config.Reviewhost + '/QueryRepController/finishQueryRep.do';//查询查重报告信息(删除原有报告)
var saveQueryRepFileUrl =  top.config.Reviewhost + "/QueryRepController/uploadQueryRep.do";//文件保存
var deleteFileUrl = top.config.Reviewhost + "/QueryRepController/deleteQueryRep.do";//删除查重报告
var downloadFileUrl = top.config.FileHost + "/FileController/download.do"; //下载文件
var startQueryUrl = top.config.Reviewhost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
function queryRep(){
	var flag = true;
	$('#btn-box').html('');
	
	$('#content').load('model/queryRep/content.html',function(){
		//reviewRoleType 评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人 评委才能推选组长
		//下拉框数据初始化
		if(reviewRoleType == 2){
			$('#btnQueryRepUploadFilesDbw, #btnResultGld, #btnQueryRepUploadFilesGld').show();
			initQueryRepUpload('btnQueryRepUploadFilesDbw', 'fileContent_dbw', '1');
			initQueryRepUpload('btnQueryRepUploadFilesGld', 'fileContent_gld', '2');
		}else{
			$('#btnQueryRepUploadFilesDbw, #btnResultGld, #btnQueryRepUploadFilesGld').hide();
		}
		getReportQueryRep('1');
		//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
		if(getExplainState() == 1){
			$('.showExplain').show();
		}
	});
	return flag
};
$('#content').on('click', '.queryRepTab', function () {
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
$("#content").on("click","#btnQueryRepAllFilesDbw, #btnQueryRepAllFilesGld",function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	window.location.href = $.parserUrlForToken(downloadPackFilesUrl+'?bidSectionId='+bidSectionId+'&examType='+examType+'&repType='+repType)
});
//删除查重报告
$("#content").on("click",".btn_del",function(){
	var repType = $(this).attr('data-type');//查重类型 1 对比王 2 广联达
	var fileId =  $(this).attr('data-id');//文件id
	$.ajax({
	    type: "post",
	    url: deleteFileUrl,
	    async: true,
	    data: {
	        'id': fileId
	    },
	    success: function (data) {
	        if (data.success) {
				getReportQueryRep(repType);
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	});
});

//下达查重指令
$("#content").on("click","#btnOpenGld",function(){
	/* var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	} */
	//唤起广联达查重
	$.ajax({
	    type: "post",
	    url: startQueryUrl,
	    async: true,
	    data: {
			'bidSectionId': bidSectionId,
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
						"DownloadPath": top.config.Reviewhost+'/QueryRepController/fileDownload',//可供下载文件的完整路径
						"UploadPath":top.config.Reviewhost+'/QueryRepController/fileUpload',// 需要回传报表的Web端地址/本地地址/?
						"RequestID": bidSectionId,
						"DownloadFilePath": data.data.repFileUrl,
						"FileUploadPath": top.config.FileHost+"/clearUpload",
						"ExportDefault": false,
						"RequestType": examType
					};
					if(reviewRoleType == 2){
						param.ExportDefault = true
					}
					console.log(param);
					var paramStr = JSON.stringify(param);
					console.log(paramStr);
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
	
	/* $.ajax({
	    type: "post",
	    url: startQueryRepUrl,
	    async: true,
	    data: {
	        'bidSectionId': bidSectionId,
	        'examType': examType,
			'repType': repType
	    },
	    success: function (data) {
	        if (data.success) {
				
	        } else {
	            top.layer.alert(data.message);
	        }
	    }
	}); */
});
//查询查重报告信息
$("#content").on("click","#btnResultGld",function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	top.layer.confirm('获取查重报告将清空当前所有查重报告，是否继续？',{title: '询问',btn:['是','否']}, function(ind) {
		top.layer.close(ind);
		getReportQueryRep(repType, reportFinishUrl)
	});
	
});
//查重报告
function getReportQueryRep(repType, url){
	$.ajax({
	    type: "post",
	    url: url?url:reportQueryRepUrl,
	    async: true,
	    data: {
	        'bidSectionId': bidSectionId,
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
						if(reviewRoleType == 2){
							html += '<span><a href="#" class="btn_del" style="color: #BB2413;display:inherit !important;" data-id="'+data[i].id+'" data-type="'+repType+'" >删除</a></span></div>'
							// html += '<div class="progress_cont" id="fileContent_'+data[i].key+'"></div>'
						}
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
/* **********************************        上传查重结果        ********************************* */
/* function initUploadEle(){
	for(var i=0;i<resultList.length;i++){
		for(var j=0;j<resultList[i].list.length;j++){
			var eleSlect = 'resultFileUp_'+resultList[i].list[j].key;
			var eleCont = 'fileContent_'+resultList[i].list[j].key;
			
			initUpload(eleSlect, eleCont, resultList[i].list[j].name, resultList[i].list[j].key)
		}
	}
} */
function initQueryRepUpload(eleSlect,eleCont, type) {
	var targetEle = "#"+eleCont;
	new StreamUpload(targetEle, {
		status: 4,
		// extFilters:[".pdf"],
		isRecord: false,
		browseFileId: eleSlect,  //上传按钮
		maxSize:524288000, //文件最大500M
		changeFile: function(file){
			var index = file.length - 1;
			console.log(file);
			var road = JSON.parse(file[index].msg).data.filePath;	// 下载文件路径
			var fileName = file[index].name.replace(/\s+/g,"");	// 文件名
			var fileSize = file[index].size;
			saveQueryRepResultFile(fileName, road, fileSize, type, function(){
				getReportQueryRep(type)
			});
		}
	});
 		
};
//文件保存
function saveQueryRepResultFile(fname, furl, fsize, type, callback){
	$.ajax({
	    type: "post",
	    url: saveQueryRepFileUrl,
	    async: true,
	    data: {
	        'bidSectionId': bidSectionId,
	        'examType': examType,
			'fileName': fname,
			'fileUrl': furl,
			'fileSize':fsize,
			'repType': type
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
/* **********************************        上传查重结果   --end     ********************************* */
/* **********************************        广联达查重   --end     ********************************* */

function parameterDatas(){
	var param = {
		"EnterpriseCode":"DFDZ_001",//接口编码
		"Subsystem": "GVB002", //调用子系统编码  经济标（GVB001）、技术标（GVB002）
		"TechSimilarityCheck": true,//是否检查标书雷同
		"IsUploadTechReport": true,//是否上传技术标报表
		"TendereeExt":"COS,XML,HBZB,HBKJ",
		"TendererExt":"COS,XML,HBZB,HBKJ,HBTB",
		"DownloadPath": top.config.Reviewhost+'/ClearBid/fileDownload',
		"UploadPath":top.config.Reviewhost+'/ClearBid/fileUpload',
	};
}
/* **********************************        预览查重结果结果        ********************************* */
$("#content").on("click",".btn_view",function(){
	var url = $(this).attr('data-url')
	previewPdf(url)
});
/* **********************************        下载查重结果结果        ********************************* */
$("#content").on("click",".btn_download",function(){
	var path = $(this).attr('data-url');
	var name = $(this).attr('data-name');
	var loadUrl =downloadFileUrl + '?ftpPath=' + path + '&fname='+name.replace(/\s+/g,"");
	$(this).attr('href', $.parserUrlForToken(loadUrl))
});
//广联达查重参数
// function GLDParameterProcessing(){
	
// }
