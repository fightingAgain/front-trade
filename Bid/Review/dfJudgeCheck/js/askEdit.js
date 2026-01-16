/**
*  投标人答疑编辑
*  方法列表及功能描述
*/
var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var saveExpertAskUrl= config.Reviewhost + "/RaterAskListController/saveRaterAsk.do";  //评委提交质疑

//var fileType;//文件类型
var id;
var examType;//资格预审方式
var fileUploads = null;
var fileSaveList = [];//保存到后台文件的数据
var enterpriseId="";
var packageId = "", supplierId = "", projectId="";
var parentFun;
//初始化
$(function() {
	enterpriseId = entryInfo().id;//企业ID
	
	// 获取连接传递的参数
	if(getUrlParam("supplierid") && getUrlParam("supplierid") != "undefined") {
		supplierId = getUrlParam("supplierid");
		//getDetail(id);
	}	
	if($.getUrlParam("packageid") && $.getUrlParam("packageid") != "undefined") {
		packageId = $.getUrlParam("packageid");
		projectId=getUrlParam("projectId");	
	}
	if($.getUrlParam("examtype") && $.getUrlParam("examtype") != "undefined") {
		examType = $.getUrlParam("examtype");
	}	
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+enterpriseId+"/"+packageId+"/206",
			businessId: "",
			status:4,
			businessTableName:'T_RATER_ASK_LIST',  //    项目表附件
			attachmentSetCode:'REVIEW_CLARIFICATION',
			isPreview: true ,    //false不可预览   true可预览
			// extFilters: [],
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
			}
		});
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
	
});
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
        top.layer.alert("请输入问题");
		return;
	};
	/*if(fileSaveList.length == 0){
		top.layer.alert("请上传文件");
		return;
	};*/
	//提交结果   
    top.layer.confirm('确定是否提交？',{
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
		     		'projectId':projectId,
		     		'packageId': packageId,
		     		'askContent': askContent,
		     		'supplierId':supplierId,
		     		'raterAskFiles': fileSaveList,
		     		'examType': examType
		     	},
		     	success: function (data) {
		         	if(data.success == false){
                        top.layer.alert(data.message);
		        		return;
		        	}
                    top.layer.alert("提交成功",function(i){
                        var index = top.layer.getFrameIndex(window.name);
                        top.layer.close(i);
                        top.layer.close(index);
                    });
		     	},
		     	error: function (data) {
                    top.layer.alert("加载失败");
		     	}
		 });
		
	});
	
})

