/**

*  投标人答疑编辑
*  方法列表及功能描述
*/
var saveAnswersUrl = config.tenderHost+'/RaterAskListController/saveRaterAnswers.do';//保存答疑
//var fileLoad = parent.config.tenderHost + "/FileController/upload.do";		//文件上传地址
var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var urlAnswersList = config.tenderHost+'/ProjectAskAnswersController/findBidAnswersPageList.do';//答疑--项目经理分页接口

var saveExpertAskUrl= config.tenderHost + "/RaterAskListController/saveRaterAsk.do";  //评委提交质疑

var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
//var fileType;//文件类型
var id;
var askTitle;
var answersFileList = []; //文件上传保存路径
var answersFile; //单个文件
var examType;//资格预审方式
var fileUploads = null;
var fileSaveList = [];//保存到后台文件的数据
var enterpriseId="";
var packageId = "", supplierId = "", examType = "";
var parentFun;
//初始化
$(function() {
	//实例化上传文件插件
	/*var oFileInput = new FileInput();
	oFileInput.Init("#FileName", fileLoad);*/
	enterpriseId = entryInfo().id;//企业ID
	
	// 获取连接传递的参数
	if(getUrlParam("supplierid") && getUrlParam("supplierid") != "undefined") {
		supplierId = getUrlParam("supplierid");
		//getDetail(id);
	}
	
	
	if($.getUrlParam("packageid") && $.getUrlParam("packageid") != "undefined") {
		packageId = $.getUrlParam("packageid");
	}
	if($.getUrlParam("examtype") && $.getUrlParam("examtype") != "undefined") {
		examType = $.getUrlParam("examtype");
	}
	
//	fileUpload(enterpriseId,id);
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+enterpriseId+"/"+packageId+"/206",
			businessId: "",
			status:4,
			businessTableName:'T_RATER_ASK_LIST',  //    项目表附件
			attachmentSetCode:'REVIEW_CLARIFICATION',
			isPreview: true ,    //false不可预览   true可预览
			//extFilters: [],
			extFilters: ['.txt','.jpg','.bmp','.gif','.png','.jepg','.pdf','.zip','.rar','.doc','.docx','.xls','.xlsx','.pptx','.xml','.zbwj','.tbwj','.xyzf','.sqwj','.zswj','.xytf','.cad','.dwg','.dxf','.dwt'],  //上传文件类型
			changeFile:function(data){
				//有文件操作是，返回方法，data为文件列表
				fileSaveList = []
				for(var i = 0;i<data.length;i++){
					var newData = {};
					var dataUrl = JSON.parse(data[i].msg);
//					console.log(dataUrl)
					newData.attachmentName = data[i].name;//附件名称
					newData.attachmentFileName = data[i].name;//附件文件名
					newData.businessTableName = 'T_RATER_ASK_LIST';//业务表名称
					newData.attachmentSetCode = 'REVIEW_CLARIFICATION';//附件关联数据集标识符
					newData.attachmentCount = '1';//关联附件数量
					newData.attachmentType = data[i].name.split(".").pop();//附件类型
					newData.url = dataUrl.data.filePath;//附件URL 地址
					newData.attachmentState = 1;//附件状态 0为临时保存，1为正式提交，2为删除，3为撤回
					fileSaveList.push(newData);
				}
//				console.log(fileSaveList)
			}
		});
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
});



function fileUpload(){
	//$("#fileLoad").unbind("click");
	
	var config = {
   		multipleFiles: false, // 多个文件一起上传, 默认: false 
	   /* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
	    browseFileBtn : " ", /** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
	    filesQueueHeight : 0, /** 文件上传容器的高度（px）, 默认: 450 */
	    messagerId:'',//显示消息元素ID(customered=false时有效)
	    frmUploadURL : flashFileUrl, // Flash上传的URI 
	    uploadURL : fileUrl ,//HTML5上传的URI 
	    browseFileId:"fileLoad",//文件选择DIV的ID
	    autoUploading: true,//选择文件后是否自动上传
	    autoRemoveCompleted:true,//文件上传后是否移除
	    postVarsPerFile : {
			//自定义文件保存路径前缀
			basePath:"/"+enterpriseId+"/"+packageId+"/"+206, //  207	答疑文件
			Token:$.getToken(),
		},
	    onComplete: function(file){/** 单个文件上传完毕的响应事件 */

			answersFile={   
			    fileName:file.name,
			    fileSize:file.size/1000+"KB",
			    filePath:JSON.parse(file.msg).data.filePath,
			    fileType:file.name.split(".").pop(),
			    businessTableName: 'T_RATER_ASK_LIST',
			    attachmentSetCode:'REVIEW_CLARIFICATION'
		    }
	    	answersFileList.push(answersFile);

			$("#divShow").show();
			
			setImage1();
			if(answersFileList.size == 0) {
				$("#divShow").hide();
			}
	    },
	    onSelect: function(list) {//	选择文件后的响应事件
//		  	console.log("select files: " + list.length);
		  	for (var i=0; i < list.length; i++) {
//				obj.attachmentFileName=list[i].name;
//		      	console.log("file name: "+ list[i].name+ " file size:"+ list[i].size);
		  	}
		  	
		}
	};
	var _t = new Stream(config);
}


//显示图片
function setImage1(){
	$("#imgList1").empty();
	for(var i=0;i<answersFileList.length;i++){
		var filesnames = answersFileList[i].fileName.substring(answersFileList[i].fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + answersFileList[i].fileName + "</td><td style='text-align: center;'>";
		if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + answersFileList[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		}
		strHtml += "<a href='javascript:void(0)' class='btn-sm btn-danger' style='text-decoration:none' onclick=delImage('" + i + "')><span class='glyphicon glyphicon-remove' aria-hidden='true'></span>删除</a></td></tr>";
		$("#imgList1").append(strHtml);
	}
}

function delImage(i){
	parent.layer.confirm('确定是否删该附件吗？',{icon:7,title:'询问'},
		function(index){
			answersFileList.splice(i,1);
			setImage1();
			if(answersFileList.length == 0){
				$("#divShow").hide();
			}
			parent.layer.alert("删除成功!");
	    	parent.layer.close(parent.layer.index);
	    	},function(index) {
				parent.layer.close(index);
			});
}
	
function showImage(obj){
	//openPreview(obj,"850px","700px");
	previewPdf(obj)
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return decodeURIComponent(r[2]);
	return null; // 返回参数值  
}

function passMessage(callback){
	parentFun = callback;
}


//提交确定按钮
$("#btnSubmit").click(function() {
	var askContent = $("#askContent").val();
	if(askContent.replace(/,/g,'') == ""){
		parent.layer.alert("请输入质疑问题");
		return;
	}
	
	var hiddeninput = ""
		//上传附件的数组。拼接成可以转到后台接受的格式
	if(answersFileList.length > 0) {
		for(var m = 0; m < answersFileList.length; m++) {
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].examType" value="' + examType + '" />'  //0为资格预审，1为资格后审
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileType" value="' + answersFileList[m].fileType + '" />'  //0为质疑附件，1为答疑附件
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileName" value="' + answersFileList[m].fileName + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].filePath" value="' + answersFileList[m].filePath + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileSize" value="' + answersFileList[m].fileSize + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].businessTableName" value="' + answersFileList[m].businessTableName + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].attachmentSetCode" value="' + answersFileList[m].attachmentSetCode + '" />'
		}
	};
	$(hiddeninput).appendTo("#formAnswers");
//	$("#formAnswers").html(hiddeninput);
	
	//提交结果   
	parent.layer.confirm('确定是否提交？',{
		icon: 7,
		title: '询问'
	}, function() {
		/**
 * 提交质疑问题
 */
			
			$.ajax({
				url: saveExpertAskUrl,
		     	type: "post",
		     	data:{
		     		packageId: packageId,
		     		askContent: askContent,
		     		supplierId:supplierId,
		     		raterAskFiles: fileSaveList,
		     		examType: examType
		     	},
		     	success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	
		         	parent.layer.alert("提交成功");
		         	parentFun();
		         	var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
		     		
		     	},
		     	error: function (data) {
		         	parent.layer.alert("加载失败");
		     	}
		 });
		
	});
	
})

