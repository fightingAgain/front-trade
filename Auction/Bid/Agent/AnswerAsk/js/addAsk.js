//var userid="123456"
var searchAskAnswersUrl = parent.config.bidhost+'/AskAnswersController/findPageList.do';
var searchUrl = parent.config.bidhost+'/PurchaseController/findPurchase.do';
var saveUrl = parent.config.bidhost+'/AskAnswersController/saveAskAnswers.do';//保存答复
var fileLoad = parent.config.bidhost + "/FileController/upload.do";//上传附件
var saveImgUrl = parent.config.bidhost +"/PurFileController/saveBatch.do"; //保存附件
var getImgListUrl = parent.config.bidhost + "/PurFileController/page.do"; //查看附件

/*var examType=sessionStorage.getItem('examType')//资格审查的缓存
var inviteState=sessionStorage.getItem('inviteState')//邀请函状态的缓存
var tenderType=sessionStorage.getItem('tenderTypeCode')//项目类型的缓存*/

var inviteState = getQueryString("inviteState");
var examType = getQueryString("examType");
var tenderType=getQueryString('tenderTypeCode');
var examTypeCode=getQueryString('examTypeCode');
var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
var fileType;//文件类型
var size;
var askAnswersFileList = []; //文件上传保存路径
var askAnswersFile; //单个文件

//初始化
$(function() {
	/*if(tenderType=="0"||tenderType=="6"){
		if(examType == "0"){
			if(inviteState=="0"){
				$(".ys").html("预审");
			}else if(inviteState=="1"){
				$(".ys").html("邀请");
			}
		}else if(examType == "1"){
			$(".ys").html("后审");
		}
	}*/
	if(examTypeCode == 0){
		$(".ys").html("预审");
	}else{
		if(examType == "0"){
			$(".ys").html("邀请");
		}else if(examType == "1"){
			$(".ys").html("后审");
		}
	}
	
	/*$("#examType").val(examType)
	$("#inviteState").val(inviteState)
	$("#isPublic").val(isPublic)*/
	uploadFile();
});

function uploadFile() {
	//实例化上传文件插件
	var oFileInput = new FileInput();
	oFileInput.Init("#FileName", fileLoad);
}

//初始化fileinput
var FileInput = function() {
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
			/*if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}*/
//			var upFileName = event.currentTarget.files[0].name;
//			var index1=upFileName.lastIndexOf(".");
//			var beforName=upFileName.substring(0,index1);
//			var regEn = /[`~!@#$%^&*_+?"{}.\/;'[\]]/im,
//  			regCn = /[·！#￥——；|<>[\]]/im;
//			if(regEn.test(beforName) || regCn.test(beforName)) {
//			    parent.layer.alert("名称不能包含"+ regEn+regCn+"等特殊字符");
//			    $(this).fileinput("reset"); //选择的格式错误 插件重置
//			    return false;
//        	}
//			var index2=upFileName.length;
//			var filesnames=upFileName.substring(index1+1,index2).toUpperCase();//后缀名
//			if( filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
//									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
//				parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');
//				$(this).fileinput("reset"); //选择的格式错误 插件重置
//				return;
//			};
			if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			$("#lbl_filename").html("");
			var f = data.files[0];
			size = f.size;
			if(size < 1024) {
				fileSize = Math.ceil(size) + "b";
			} else if(1024 <= size && size < 1024 * 1024) {
				fileSize = Math.ceil(size / 1024) + "kb";
			} else {
				fileSize = Math.ceil(size / 1024) + "m";
			}
			fileType = f.type;
			//fileType = fileType;
			//var name = f.name.split(".");
			fileName = f.name;
			//filePath = f.filePath;
			var path = data.response.data;
			filePath = path;
			$(".file-caption-name").val(data);
			askAnswersFile = {
				fileType: fileType,
				fileName: fileName,
				filePath: filePath,
				fileSize: fileSize,
			};
			askAnswersFileList.push(askAnswersFile);

			$("#divShow").show();
			
			setImage1();
			if(askAnswersFileList.size == 0) {
				$("#divShow").hide();
			}

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.alert("失败");
		});
	}

	return oFile;
};

//文件上传
function fileUp(id) {

	var file = "";
	for(var k = 0; k < askAnswersFileList.length; k++) {
		/*if(tenderType=="0"||tenderType=="6"){
			if(examType == "0"){
				if(inviteState=="0"){
					file += "&purFiles[" + k + "].examType=0";
				}else if(inviteState=="1"){
					file += "&purFiles[" + k + "].examType=1";
				}
			}else if(examType == "1"){
				file += "&purFiles[" + k + "].examType=1";
			}
		}*/
		if(examTypeCode == 0){
			file += "&purFiles[" + k + "].examType=0";
		}else{
			file += "&purFiles[" + k + "].examType=1";
		}
		
		file += "&purFiles[" + k + "].modelName=" + "JJ_PUR_ASK_ANSWERS";
		file += "&purFiles[" + k + "].modelId=" + id;
		file += "&purFiles[" + k + "].fileType=" + askAnswersFileList[k].fileType;
		file += "&purFiles[" + k + "].fileName=" + askAnswersFileList[k].fileName;
		file += "&purFiles[" + k + "].filePath=" + askAnswersFileList[k].filePath;
		file += "&purFiles[" + k + "].fileSize=" + askAnswersFileList[k].fileSize;
	}

	//上传文件
	$.ajax({
		type: "post",
		url: saveImgUrl,
		async: true,
		data: file,
		datatype: 'json',
		success: function(data) {}
	});

}

//显示图片
function setImage1(){
	$("#imgList1").empty();
	for(var i=0;i<askAnswersFileList.length;i++){
		var filesnames = askAnswersFileList[i].fileName.substring(askAnswersFileList[i].fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + askAnswersFileList[i].fileName + "</td><td style='text-align: center;'>";
		if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + askAnswersFileList[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		}
		strHtml += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=delImage('" + i + "')><span class='glyphicon glyphicon-remove' aria-hidden='true'></span>删除</a></td></tr>";
		$("#imgList1").append(strHtml);
	}
}

function delImage(i){
	parent.layer.confirm('确定要删该附件吗？',
		{btn:['确 定','取 消']},
		function(){
			askAnswersFileList.splice(i,1);
			setImage1();
			if(askAnswersFileList.length == 0){
				$("#divShow").hide();
			}
			parent.layer.alert("删除成功!");
	    		parent.layer.close(parent.layer.index);
	    	},
	    	function(){
	    		parent.layer.close(parent.layer.index);
	    	}
	   )
	}
	
function showImage(obj){
		openPreview(obj,"850px","700px");
}



function Ti(){
	var askType= "";
	//$('input[name="askEmployeeId"]').val(userid)
	//console.log($("#form").serialize());
	//var projectId = $("#projectId").val();
	/*if(tenderType=="0"||tenderType=="6"){
		if(examType == "0"){
			if(inviteState=="0"){
				askType = 0;
			}else if(inviteState=="1"){
				askType = 1;
			}
		}else if(examType == "1"){
			askType = 1;
		}
	}*/
	if(examTypeCode == 0){
		askType = 0;
	}else{
		askType = 1;
	}
	$.ajax({
	   	url:saveUrl,
	   	type:'post',
	   	dataType:'json',
	    data:$("#form").serialize() +"&examType="+askType, //询价采购
	   	success:function(data){
	   	    if(data.success){
	   	    	fileUp(data.data);
	   	    	top.layer.closeAll();
	   	    	parent.layer.alert("您的问题提交成功!");
	   	    	//parent.$('#table').bootstrapTable('refresh',{url:searchAskAnswersUrl});
	   	    }else{
	   	    	top.layer.closeAll();
	   	    	parent.layer.alert("您的问题提交失败!");
	   	    }
	   	}	
   });
}


function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}
