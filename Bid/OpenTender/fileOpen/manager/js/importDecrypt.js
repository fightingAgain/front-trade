var bidderId = $.getUrlParam("bidderId");	//企业id
var bidOpeningId = $.getUrlParam("bidOpeningId");	//开标数据id
var bidSectionId = $.getUrlParam("bidSectionId");	//标段id

$(function(){
	//form表单赋值
	$("#bidderId").val(bidderId);
	$("#bidOpeningId").val(bidOpeningId);
	$("#bidSectionId").val(bidSectionId);
	
	//初始化
	var defaults = {
		multipleFiles: false, // 多个文件一起上传, 默认: false 
		extFilters:[".zip",".rar",".bfwj"],
		browseFileBtn : " ", /** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
		filesQueueHeight : 0, /** 文件上传容器的高度（px）, 默认: 450 */
		messagerId:'',//显示消息元素ID(customered=false时有效)
		frmUploadURL : config.FileHost + '/FileController/formDataFile.do', // Flash上传的URI 
		uploadURL : config.FileHost + "/FileController/streamFile.do" ,//HTML5上传的URI 
		browseFileId: "btnDraw",//文件选择DIV的ID
		autoUploading: true,//选择文件后是否自动上传
		autoRemoveCompleted:true,//文件上传后是否移除
		postVarsPerFile : {
			//自定义文件保存路径前缀
			basePath:"/"+bidderId+"/"+bidSectionId+"/205",
			Token:sessionStorage.getItem('token')
		},
		isMult:false,
		changeFile:function(data){ 
			filePath = data[data.length-1].url;
			console.log("文件路径： " + filePath ); 
		},
		onRepeatedFile: function(file) {
//			console.log("文件： " + file.name + " 大小：" + file.size + "已存在于上传队列中");
			parent.layer.alert("文件： " + file.name + " 大小：" +file.size + " 已存在于上传队列中");
//			return true;
		},
		onComplete: function(file){/** 单个文件上传完毕的响应事件 */
			console.log("文件： " + file.name + " 大小：" + file.size + "已存在于上传队列中");  
			$("#fileName").val(file.name);
			//返回的数据
			var msg = JSON.parse(file.msg);
			console.log("文件路径： " + msg.data.filePath ); 
			$("#fileUrl").val(msg.data.filePath);
		}
	}
	
	new Stream(defaults);
	//隐藏进度条
	$(".stream-total-tips").css("display","none");
	$("#i_stream_files_queue").css("border","none");
});





//关闭
$('#btnClose').click(function(){
	var index=parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
});

//确定
$('#btnSubmit').click(function(){
	if($("#fileUrl").val() !=""){
		$.ajax({
			type: "post",
			url: config.OpenBidHost + '/FileOpenDetailsController/addManagerDecrypt',
			async: false,
			data:parent.serializeArrayToJson($("#formName").serializeArray()),
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
			success: function(rsp) {
				if(rsp.success) {
					parent.layer.alert(rsp.data, {icon: 6});
					//关闭弹出框
					var index=parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				} else {
					parent.layer.alert(rsp.message, {icon: 6});
				}
			}
		});
	}else{
		parent.layer.alert("请上传投标文件");
	}
});