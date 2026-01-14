/**
*  zhouyan 
*  2019-4-3
*  投标人答疑编辑
*  方法列表及功能描述
*/
var saveAnswersUrl = config.Reviewhost+'/RaterAskListController/saveRaterAnswers.do';//保存答疑
var searchUrl = config.Reviewhost + '/RaterAskListController/getAskInfo.do'; //质疑答疑查询根据标段ID接口
//var fileLoad = parent.config.tenderHost + "/FileController/upload.do";		//文件上传地址
var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var urlAnswersList = config.Reviewhost+'/ProjectAskAnswersController/findBidAnswersPageList.do';//答疑--项目经理分页接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件

var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
//var fileType;//文件类型
var id;
var examType;//资格预审方式
var fileUploads = null;
var bidSectionId = '';//标段id
var answerPdf = '';//答复pdf地址

// 获取连接传递的参数
if(getUrlParam("id") && getUrlParam("id") != "undefined") {
    id = getUrlParam("id");
}
if(getUrlParam("bidSectionId") && getUrlParam("bidSectionId") != "undefined") {
    bidSectionId = getUrlParam("bidSectionId");
}
if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
    examType = $.getUrlParam("examType");
}

//初始化
$(function() {
	//实例化上传文件插件
	/*var oFileInput = new FileInput();
	oFileInput.Init("#FileName", fileLoad);*/

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});	
	getDetail()
});
function getDetail() {
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			'id':id,
			'packageId': bidSectionId,
			'examType':examType
		},
		success: function(data) {
			if(data.success == false) {
				top.layer.msg(data.message);
				return;
			}
			var arr = data.data;
			$("#askContent").html(arr.askContent);
			answerPdf = arr.fileUrl;
			$("#answerContent").html('<a class="btn-primary btn-sm btnAnswerCont" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>查看</a>')
			if(arr.raterAskFiles.length>0){
				getAsk(arr.raterAskFiles);
			}
			if(arr.raterAnswersFiles.length>0){
				getAnswers(arr.raterAnswersFiles)
			}
			
			
		},
		error: function(data) {
			top.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};
function getAsk(data){
	$("#askFlie").bootstrapTable({
		columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'attachmentFileName',
				title: '文件名称',				
			},{
				field: 'attachmentSize',
				title: '文件大小',
				width:'100',
				formatter: function(value, row, index) {
					var num = Number(value);
					if(num >= 1024 * 1024 * 1024) {
						return (num/1024/1024/1024).toFixed(2) + "G";
					} else if(num >= 1024 * 1024 && num < 1024 * 1024 * 1024){
						return (num/1024/1024).toFixed(2) + "M";
					} else if(num >= 1024 && num < 1024*1024) {
						return (num/1024).toFixed(2) +"KB";
					} else { 
						return num + "B";
					}
				}
			},

			{
				field: "CAOZ",
				title: "操作",
				halign: "center",
				align: "center",
				width:'100',
				events:{
					'click .btnDownload':function(e,value, row, index){		
						var name = row.attachmentFileName.split('.'+row.attachmentType);
						var leng = name.length-1;
						var fileName = '';
						name.splice(leng,1);
						fileName = name.join(' ');
						var newUrl =dowoloadFileUrl + '?ftpPath=' + row.url + '&fname=' + fileName.replace(/\s+/g,"");
						window.location.href = $.parserUrlForToken(newUrl);
					},
					'click .btnPreview':function(e,value, row, index){
						parent.openPreview(row.url, "850px", "700px");
					},
				},
				formatter: function(value, row, index) {
					var strAnswer = '<a class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>'; 
					var strView = '<a class="btn-primary btn-sm btnPreview" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</a>'; 
					var filesnames = row.attachmentType.toUpperCase();
					if(filesnames=='PDF'||filesnames=="PNG"||filesnames=="JPG"||filesnames=="JPGE"){
						return strAnswer+strView
					}else{
						return strAnswer
					}
				}
			}
		]
	});
	$("#askFlie").bootstrapTable('load',data)
}
function getAnswers(data){
	$("#answerFlie").bootstrapTable({
		columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'attachmentFileName',
				title: '文件名称',				
			},{
				field: 'attachmentSize',
				title: '文件大小',
				width:'100',
				formatter: function(value, row, index) {
					var num = Number(value);
					if(num >= 1024 * 1024 * 1024) {
						return (num/1024/1024/1024).toFixed(2) + "G";
					} else if(num >= 1024 * 1024 && num < 1024 * 1024 * 1024){
						return (num/1024/1024).toFixed(2) + "M";
					} else if(num >= 1024 && num < 1024*1024) {
						return (num/1024).toFixed(2) +"KB";
					} else { 
						return num + "B";
					}
				}
			},

			{
				field: "CAOZ",
				title: "操作",
				halign: "center",
				align: "center",
				width:'100',
				events:{
					'click .btnDownload':function(e,value, row, index){						
						var newUrl =dowoloadFileUrl + '?ftpPath=' + row.url + '&fname=' + row.attachmentFileName;
						window.location.href = $.parserUrlForToken(newUrl);
					},
					'click .btnPreview':function(e,value, row, index){
						parent.openPreview(row.url, "850px", "700px");
					},
				},
				formatter: function(value, row, index) {
					var strAnswer = '<a class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>'; 
					var strView = '<a class="btn-primary btn-sm btnPreview" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</a>'; 
					var filesnames = row.attachmentType.toUpperCase();
					if(filesnames=='PDF'||filesnames=="PNG"||filesnames=="JPG"||filesnames=="JPGE"){
						return strAnswer+strView
					}else{
						return strAnswer
					}
				}
			}
		]
	});
	$("#answerFlie").bootstrapTable('load',data)
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return decodeURIComponent(r[2]);
	return null; // 返回参数值  
}
//查看答复内容
$('#answerContent').on('click','.btnAnswerCont',function(){
	parent.openPreview(answerPdf, "1000px", "600px");
})
