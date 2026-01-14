var urlAskList = parent.config.tenderHost+'/ProjectAskAnswersController/findBidAskPageList.do';//质疑查看记录
var saveAskUrl = parent.config.tenderHost+'/ProjectAskAnswersController/insertBidAsk.do';//保存质疑
//var fileLoad = parent.config.tenderHost + "/FileController/upload.do";		//文件上传地址
var fileUrl = parent.config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = parent.config.FileHost + '/FileController/formDataFile.do';//flash上传的地址

var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
//var fileType;//文件类型
var packageId;
//var noticeId;
var askAskFileList = []; //文件上传保存路径
var askAskFile; //单个文件
var examType;//资格预审方式

//初始化
$(function() {
	//实例化上传文件插件
	/*var oFileInput = new FileInput();
	oFileInput.Init("#FileName", fileLoad);*/
	
	// 获取连接传递的参数
	if($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined") {
		packageId = $.getUrlParam("packageId");
	}
	
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	
	var enterpriseId = entryInfo().enterpriseId;//企业ID
	fileUpload(enterpriseId,packageId);
	
	/*if($.getUrlParam("noticeId") && $.getUrlParam("noticeId") != "undefined") {
		noticeId = $.getUrlParam("noticeId");
	}*/
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
});

//初始化fileinput
/*var FileInput = function() {
	var oFile = new Object();

	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$(ctrlName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			autoReplace: true,
			showRemove: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx'
				,'JPG', 'BMP', 'PNG','JPEG','PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
			hideThumbnailContent: true,
			//showUpload: true,  //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-sm btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			uploadAsync: false,
			showPreview: false,
			showUpload: false,
			layoutTemplates: {
				actionUpload: '', //取消上传按钮
				actionZoom: '', //取消预览按钮
				actionDelete: '' //取消删除按钮
			}
		}).on("filebatchselected", function(event, files) {
			var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
			if( filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
				parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			var fileid=new Date().getTime();//整个包件的id，暂时用时间戳来代替
		
			askAskFile={   
					id:fileid,
				    fileName:data.files[0].name,
				    fileSize:data.files[0].size/1000+"KB",
				    filePath:data.response.data,
				    //fileType:data.files[0].name.split(".")[1]
			    }
			askAskFileList.push(askAskFile);

			$("#divShow").show();
			
			setImage1();
			if(askAskFileList.size == 0) {
				$("#divShow").hide();
			}

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.alert("失败");
		});
	}

	return oFile;
};*/

function fileUpload(enterpriseId,packageId){
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
			basePath:"/"+enterpriseId+"/"+packageId+"/"+206, //  206	质疑文件
			Token:$.getToken(),
		},
	    onComplete: function(file){/** 单个文件上传完毕的响应事件 */

			askAskFile={   
			    fileName:file.name,
			    //fileSize:data.files[0].size/1000+"KB",
			    filePath:JSON.parse(file.msg).data.filePath,
			    fileType:file.name.split(".").pop()
		    }
	    	askAskFileList.push(askAskFile);

			$("#divShow").show();
			
			setImage1();
			if(askAskFileList.size == 0) {
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
	$(".stream-total-tips").css("display","none");
	$("#i_stream_files_queue").css("border","none");
}


//显示图片
function setImage1(){
	$("#imgList1").empty();
	for(var i=0;i<askAskFileList.length;i++){
		var filesnames = askAskFileList[i].fileName.substring(askAskFileList[i].fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + askAskFileList[i].fileName + "</td><td style='text-align: center;'>";
		if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + askAskFileList[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		}
		strHtml += "<a href='javascript:void(0)' class='btn-sm btn-danger' style='text-decoration:none' onclick=delImage('" + i + "')><span class='glyphicon glyphicon-remove' aria-hidden='true'></span>删除</a></td></tr>";
		$("#imgList1").append(strHtml);
	}
}

function delImage(i){
	parent.layer.confirm('确定是否删该附件吗？',{icon:7,title:'询问'},
		function(index){
			askAskFileList.splice(i,1);
			setImage1();
			if(askAskFileList.length == 0){
				$("#divShow").hide();
			}
			parent.layer.alert("删除成功!");
	    	parent.layer.close(parent.layer.index);
	    	},function(index) {
				parent.layer.close(index);
			});
}
	
function showImage(obj){
	//	openPreview(obj,"850px","700px");
	previewPdf(obj)
}



//提交确定按钮
$("#btnSubmit").click(function() {
	var askTitle=$("input[name='askTitle']").val();
	var askContent=$("#askContent").val();
	
	if(!askTitle){
		layer.alert("请填写质疑标题",{icon:3,title:"提示"});
		return;
	}
	if(!askContent){
		layer.alert("请填写质疑内容",{icon:3,title:"提示"});
		return;
	}
	
	var hiddeninput = ""
		//上传附件的数组。拼接成可以转到后台接受的格式
	if(askAskFileList.length > 0) {
		for(var m = 0; m < askAskFileList.length; m++) {
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].examType" value="' + examType + '" />'  //0为资格预审，1为资格后审
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileType" value="0" />'  //0为质疑附件，1为答疑附件
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileName" value="' + askAskFileList[m].fileName + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].filePath" value="' + askAskFileList[m].filePath + '" />'
			hiddeninput += '<input type="hidden" name="projectAskAnswersFileList[' + m + '].fileSize" value="' + askAskFileList[m].fileSize + '" />'
		}
	}
	$("#formAsk").html(hiddeninput);
	
	//提交结果   
	layer.confirm('确定是否提交？',{
		icon: 7,
		title: '询问'
	}, function() {
		$.ajax({
		   	url:saveAskUrl,
		   	type:'post',
		   	dataType:'json',
		    data:$("#formAsk").serialize()+ '&packageId=' + packageId + '&examType='+examType + '&askTitle=' + askTitle + '&askContent=' + askContent, 
		   	success:function(data){
		   	    if(data.success){
		   	    	top.layer.closeAll();
		   	    	top.layer.alert("质疑成功",{icon:1,title:"提示"});
		   	    	top.$('#table').bootstrapTable('refresh',{url:urlAskList});
		   	    }else{
		   	    	//top.layer.closeAll();
		   	    	parent.layer.alert("质疑失败",{icon:2,title:"提示"});
		   	    }
		   	}	
	   });
		
	});
	
})

