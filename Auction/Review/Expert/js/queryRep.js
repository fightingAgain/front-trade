var downloadPackFilesUrl = top.config.AuctionHost + '/QueryRepController/downloadpack.do';//下载招投标文件
var startQueryRepUrl = top.config.AuctionHost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
var reportQueryRepUrl = top.config.AuctionHost + '/QueryRepController/findQueryReps.do';//查询查重报告信息
var reportFinishUrl = top.config.AuctionHost + '/QueryRepController/finishQueryRep.do';//查询查重报告信息(删除原有报告)
var saveQueryRepFileUrl =  top.config.AuctionHost + "/QueryRepController/uploadQueryRep.do";//文件保存
var deleteFileUrl = top.config.AuctionHost + "/QueryRepController/deleteQueryRep.do";//删除查重报告
var downloadFileUrl = top.config.FileHost + "/FileController/download.do"; //下载文件
var uploadUrl = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var startQueryUrl = top.config.AuctionHost + '/QueryRepController/releaseQueryRep.do';//下达查重指令
$(function(){
	queryRep();
})
function queryRep(){
	//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
	if(progressList.isShowExplain && progressList.isShowExplain == 1){
		$('.showExplain').show();
	}else{
		$('.showExplain').hide();
	}
	if(isLeader == 1){
		$('#btnQueryRepUploadFilesDbw, #btnResultGld, #btnQueryRepUploadFilesGld').show();
		var oFileInput = new FileInput();
		oFileInput.Init('btnQueryRepUploadFilesDbw', 'fileContent_dbw', '1');
		var oFileInputs = new FileInput();
		oFileInputs.Init('btnQueryRepUploadFilesGld', 'fileContent_gld', '2');
		$('.hidden-xs').html('上传报告').css('font-size','14px');
	}else{
		$('#btnQueryRepUploadFilesDbw, #btnResultGld, #btnQueryRepUploadFilesGld').hide();
	}
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	var repType;//查重类型 1 对比王 2 广联达
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	getReportQueryRep(repType);
};
$('#queryRepList li').off("click").click(function(){
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
$("#btnQueryRepAllFilesDbw, #btnQueryRepAllFilesGld").off("click").click(function(){
	var repType;//查重类型 1 对比王 2 广联达
	var active = $('#queryRepList .active').find('a').attr('aria-controls');
	if(active == 'queryRep_DBW'){//对比王
		repType = 1;
	}else if(active == 'queryRep_GLD'){//广联达
		repType = 2;
	}
	window.location.href = $.parserUrlForToken(downloadPackFilesUrl+'?packageId='+packageId+'&examType='+examType+'&repType='+repType)
});
//删除查重报告
$("#queryRepReportWarp").off("click",".btn_del").on("click",".btn_del",function(){
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
$("#queryRepReportWarp").off("click","#btnOpenGld").on("click","#btnOpenGld",function(){
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
						"FileUploadPath": top.config.FileHost+"/clearUpload",
						"ExportDefault": false,
						"RequestType": examType
					};
					if(isLeader == 1){
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
	top.layer.confirm('获取查重报告将清空当前所有查重报告，是否继续？',{title: '询问',btn:['是','否']}, function(ind) {
		top.layer.close(ind);
		getReportQueryRep(repType, reportFinishUrl);
	});
});
//查重报告
function getReportQueryRep(repType, url){
	$.ajax({
	    type: "post",
	    url:  url?url:reportQueryRepUrl,
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
						if(isLeader == 1){
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
var FileInput = function() {
		var oFile = new Object();
		//初始化fileinput控件（第一次初始化）
		oFile.Init = function(eleSlect,eleCont, type, key) {
			$("#"+eleSlect).fileinput({
				language: 'zh', //设置语言
				uploadUrl: uploadUrl, //上传的地址
				uploadAsync: false,
				autoReplace: false,
				// allowedFileExtensions: ['pdf', 'PDF'], //接收的文件后缀
				showUpload: false, //是否显示上传按钮  
				showCaption: false, //是否显示标题  
				browseClass: "btn btn-primary resultUpload", //按钮样式       
				dropZoneEnabled: false, //是否显示拖拽区域  
				//maxFileCount: 1, //表示允许同时上传的最大文件个数
				showPreview :false,
				layoutTemplates:{
					actionDelete:"",
					actionUpload:""
				},
	//			//上传参数
	//			uploadExtraData:function(){//向后台传递参数
	//	            var path=''
	//                return path; 
	//              },
	
			}).on("filebatchselected", function (event, files) {
				var filesnames=event.currentTarget.files[0].name.split('.')[1]
				if(event.currentTarget.files.length>1){
					parent.layer.alert('单次上传文件数只能为1个');				
					$(this).fileinput("reset"); //选择的格式错误 插件重置
				    return;
				}	
				$(this).fileinput("upload");
								
			}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
				if (data.response.success===false) { 
					parent.layer.alert(data.response.message);
					$(this).fileinput("reset"); 
					return;
				}
				if(data.response.success){
					var fileName = data.files[0].name;
					var fileSize = data.files[0].size/1000+"KB";
					var road = data.response.data[0];
					saveQueryRepResultFile(fileName, road, fileSize, type, function(){
						getReportQueryRep(type)
					});
				}
			}).on('filebatchuploaderror', function(event, data, msg) {
				parent.layer.msg("失败");
			});
		}
		return oFile;
	// };
};
//文件保存
function saveQueryRepResultFile(fileName, road, fileSize, type, callback){
	$.ajax({
	    type: "post",
	    url: saveQueryRepFileUrl,
	    async: true,
	    data: {
	        'packageId': packageId,
	        'examType': examType,
			'fileName': fileName,
			'fileUrl': road,
			'fileSize':fileSize,
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
/* //下载操作手册
$('#btnCaptionDbw').click(function(){
	$(this).attr('href', '../../../../media/image/queryRep/比对王查重软件操作手册（询比）.pdf');
}) */
