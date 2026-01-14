//打开弹出框时加载的数据和内容。
var packageInfo="";
var AccessoryList=[];
var auctionItemFileHis=[]
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var downloadFileUrl = config.FileHost + '/FileController/download.do';//下载文件
var searchUrlFile=config.AuctionHost + '/AuctionItemFileController/findAuctionItemFileHis.do'
function du(data,type){
	packageInfo=data;
	if(type=="upload"){
		$("#trUploadFile").show();
	}
	$('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
 	 //文件上传初始化	
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	//setFileHistory();//加载文件上传撤回历史记录
	getFile()
};
function getFile(){
	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: false,
		dataType: 'json',
		data: {
			'projectId':packageInfo.projectId,
			'packageId':packageInfo.id,			
		},
		success: function(data) {			
			if(data.success==true){
				if(data.data){
					if(data.data.fileState==1){
						AccessoryList.push({
							'filePath':data.data.filePath,
							'fileName':data.data.fileName,
							'subDate':data.data.subDate
						});
						$("#trUploadFile").hide()
					}
					auctionItemFileHis=data.data.auctionItemFileHis
				}								
			}			         
		}
	});
	fileTable();
	fileTableChe();
}
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['pdf','zip','rar','doc','docx','xls','xlsx'
				,'PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
			//showUpload: true, //是否显示上传按钮  
			showCaption: true, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview :false,
			layoutTemplates:{
				actionDelete:"",
				actionUpload:""
			},
		}).on("filebatchselected", function(event, files) {
			var filesnames=event.currentTarget.files[0].name.split('.')[1]
			if(event.currentTarget.files.length>1){
				parent.layer.alert('单次上传文件数只能为1个');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			};
			var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
			if(filesnames != 'PDF' && filesnames != 'ZIP'&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
				parent.layer.alert('只能上传文件格式为文档、表格、PDF格式和压缩文件');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			if(event.currentTarget.files[0].size > 50*1024 * 1024) {
				parent.layer.alert('上传的文件不能大于50M');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};	
	        $(this).fileinput("upload");						
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			$.ajax({
				type:"post",
				url:top.config.AuctionHost+"/AuctionItemFileController/saveAuctionItemFile.do",
				async:true,
				data:{
					'projectId':packageInfo.projectId,
					'packageId':packageInfo.id,
					'filePath':data.response.data[0],
					'fileName':data.files[0].name
				},
				success:function(res){
					if(res.success){  			
						getFile();
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！					
					}else{
						parent.layer.alert(res.message)
					}
				}
			});	
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function fileTable(){
	$('#fileTables').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},			
			{
				field: "subDate",
				title: "上传时间",
				align: "center",
				halign: "center",
				width:'180px'

			},
			{
				field: "caoz",
				title: "操作",
				width:'200px',
				events:{
					'click .fileDownload':function(e, value, row, index){
						var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName ;
    					window.location.href = $.parserUrlForToken(newUrl); 
					},
					'click .previewFile':function(e, value, row, index){
						openPreview(row.filePath);
					},
					
				},
				formatter:function(value, row, index){	
					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody=""  
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
					if(row.fileState==1 && checkTypes != 1){
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
						}
					}               
					return mixtbody
				}
				 
			}
		]
	});
	$('#fileTables').bootstrapTable("load", AccessoryList); //重载数据
};
function fileTableChe(){
	$('#historyFileTable').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},			
			{
				field: "subDate",
				title: "上传时间",
				align: "center",
				halign: "center",
				width:'180px'

			},
			{
				field: "reason",
				title: "驳回原因",
				align: "center",
				halign: "center",			
			},
			{
				field: "caoz",
				title: "操作",
				width:'200px',
				events:{
					'click .fileDownload':function(e, value, row, index){
						var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName ;
    					window.location.href = $.parserUrlForToken(newUrl); 
					},
					'click .previewFile':function(e, value, row, index){
						openPreview(row.filePath);
					},
					
				},
				formatter:function(value, row, index){	
					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody=""  
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
					if(row.fileState==1 && checkTypes != 1){
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
						}
					}               
					return mixtbody
				}
				 
			}
		]
	});
	$('#historyFileTable').bootstrapTable("load", auctionItemFileHis); //重载数据
};
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	top.layer.closeAll();
});
