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

var pdfSaveUrl = config.Reviewhost + '/PdfService.do';//签完章后的保存路径

var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
//var fileType;//文件类型
var id;
var examType;//资格预审方式
var fileUploads = null;
var fileSaveList = [];//保存到后台文件的数据
var bidSectionId = '';//标段id
var CAcf = null;  //实例化CA
var ukArr = {};
var isNameSame = true;//CA信息与当前登录人信息是否一致
var isSame = false;//CA信息与当前登录人信息是否一致
var enterpriseInfo = entryInfo();//当前登录人信息
var isCloseSign = true;//签名页面是否已关闭
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
	
	var enterpriseId = enterpriseInfo.enterpriseId;//企业ID
	var WebPDF = '';
	
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+enterpriseId+"/"+id+"/207",
			businessId: id,
			status:4,
			businessTableName:'T_RATER_ASK_LIST',  //    项目表附件
			attachmentSetCode:'EVALUATION_REPLY',
			isPreview: true ,    //false不可预览   true可预览
			// extFilters: [],
			uploadFile:function(file){
				//有文件操作是，返回方法，data为文件列表
//				console.log(file)
				var newData = {};
				var dataUrl = JSON.parse(file.msg);
				var isSame = false;
				newData.attachmentName = file.name;//附件名称
				newData.attachmentFileName = file.name;//附件文件名
				newData.businessTableName = 'T_RATER_ASK_LIST';//业务表名称
				newData.attachmentSetCode = 'EVALUATION_REPLY';//附件关联数据集标识符
				newData.attachmentCount = '1';//关联附件数量
				newData.attachmentType = file.name.split(".").pop();//附件类型
				newData.url = dataUrl.data.filePath;//附件URL 地址
				newData.attachmentState = 1;//附件状态 0为临时保存，1为正式提交，2为删除，3为撤回
				newData.attachmentSize = file.size;
				fileSaveList.push(newData);
				getAnswers(fileSaveList)
			}
		});
	}
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
			$("#askContent").html(arr.askContent)
			if(arr.answerContent){
				$("#answersContent").val(arr.answerContent)
			}
			if(arr.raterAnswersFiles){
				getAnswers(arr.raterAnswersFiles)
//				$("#fileContent").val(arr.raterAnswersFiles)
			}
			fileSaveList = arr.raterAnswersFiles
			
//			console.log(arr)
			
			getAskAnswers(arr.raterAskFiles);
		},
		error: function(data) {
			top.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};
function getAskAnswers(data){
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
				width:'150',
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
				width:'100px',
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
				width:'200px',
				events:{
					'click .btnDownload':function(e,value, row, index){						
						var newUrl =dowoloadFileUrl + '?ftpPath=' + row.url + '&fname=' + row.attachmentFileName;
						window.location.href = $.parserUrlForToken(newUrl);
					},
					'click .btnPreview':function(e,value, row, index){
						parent.openPreview(row.url, "850px", "700px");
					},
					'click .btnDel':function(e,value, row, index){
						fileSaveList.splice(index,1)
						getAnswers(fileSaveList)
					},
				},
				formatter: function(value, row, index) {
					var strAnswer = '<a class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>'; 
					var strView = '<a class="btn-primary btn-sm btnPreview" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</a>'; 
					var strDel = '<a class="btn-danger btn-sm btnDel" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-remove"></span>移除</a>'; 
					var filesnames = row.attachmentType.toUpperCase();
					if(filesnames=='PDF'||filesnames=="PNG"||filesnames=="JPG"||filesnames=="JPGE"){
						return strAnswer+strView + strDel
					}else{
						return strAnswer + strDel
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


//提交确定按钮
$("#btnSubmit").click(function() {
	var answersContent=$("#answersContent").val();
//	saveList.answerContent = answersContent;
	if(!answersContent){
		layer.alert("温馨提示：请填写回复内容",{icon:3,title:"提示"});
		return;
	}	
	/*if(fileSaveList.length==0){
		layer.alert("请上传附件",{icon:3,title:"提示"});
		return;
	}*/
	//提交结果   
	top.layer.confirm('温馨提示：确定是否生成回复函？',{
		icon: 7,
		title: '询问'
	}, function(index) {
		top.layer.close(index)
		var data = {
	    	'id':id,
	    	'raterAnswersFiles':fileSaveList,
	    	'answerContent':answersContent,
	    	'packageId':bidSectionId,
	    	'examType':examType
	    	
	    }
		saveForm(data)
	});
})
function saveForm(saveData){
	$.ajax({
		   	url:saveAnswersUrl,
		   	type:'post',
		   	dataType:'json',
		   	//traditional: true,//这里设置为true
		    data:saveData,
		   	success:function(data){
		   	    if(data.success){
//		   	    	var index = top.layer.getFrameIndex(window.name);
//					top.layer.close(index);
					setPdf(data.data)
//		   	    	top.layer.alert("答疑成功",{icon:1,title:"提示"});
		   	    	top.$('#table').bootstrapTable('refresh',{url:urlAnswersList});
		   	    	
		   	    }else{
		   	    	top.layer.alert(data.message)
		   	    }
		   	}	
	   });
};
//回复生成PDF
function setPdf(path){
	top.layer.open({
		type: 2,
		title: "签章 ",
		area: ['100%','100%'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		btn:["签章","关闭"],
		content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+path,
		success: function(layero, index){
			isCloseSign = false
		},
		yes:function(index,layero){
			customMask =top.layer.load(1, {shade: [0.3, '#000000'],content:'<div style="width:150px;padding-top:46px;">签章中，请稍候...</div>',area: ['100px','150px']});
			let getSignUrl = config.Reviewhost+"/RaterAskListController/getSign";
			let signatureUrl = config.Reviewhost+"/RaterAskListController/sign";
			new CA().signature(getSignUrl, signatureUrl, function(){
				return {
					id: id,
					bidSectionId: bidSectionId,
					examType: examType
				}
			}, function(url){
				top.layer.close(customMask);
				top.layer.close(index);
				var ind = top.layer.getFrameIndex(window.name);
				top.layer.close(ind);
			},enterpriseInfo.enterpriseCode, function(){
				top.layer.close(customMask);
			});
		},
		no:function(index,layero){
			top.layer.close(index);
			var ind = top.layer.getFrameIndex(window.name);
			top.layer.close(ind);
		},
		end: function(){
			isCloseSign = true
		}
	});
}
