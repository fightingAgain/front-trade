
var searchUrlFile = config.tenderHost + '/DocClarifyController/findDocClarifydetailById.do'; //根据标段文件查询接口
var searchUrlAttachmentFile = config.tenderHost + '/DocClarifyController/findAttachmentFileByBidSectionId.do'; //根据业务表主键ID获取附件List信息


var id;
var bidFileId="";  //招标文件id
var fileArr = []; //文件数组操作 上传或者修改

$(function(){
	
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		bidFileId = $.getUrlParam("id");
		getBidFileArr();
	}
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: bidFileId,
		status: 3,
		type: "zbwjsp",
	});
	
	// 获取连接传递的参数
	if(bidFileId) {
		//查看审核记录
		getDetail();
	}
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
});


function getDetail(){
	$.ajax({
         url: searchUrlFile,
         type: "post",
         data: {id:bidFileId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	
			$('div[id]').each(function() {
				$(this).html(arr[this.id] && arr[this.id] != "undefined" ? arr[this.id] : "");
			});
			getBidFileArr(arr.bidSectionId);
         },
         error: function (data) {
             parent.layer.alert("加载失败",{icon: 3,title: '提示'});
         }
     });
};


function getBidFileArr(id) {
	$.ajax({
		url: searchUrlAttachmentFile,
		type: "post",
		data: {
			id: bidFileId,
			bidSectionId:id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if(data.data){
				fileArr = data.data;
			}
			fileTable(fileArr);
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});

};

function fileTable(fileArr){
	$('#fileList').bootstrapTable({
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
				field: "attachmentFileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
			field: "attachmentSetCode",
			title: "类型",
			align: "left",
				formatter: function(value, row, index) {
					if(value == 'TENDER_FILE') {
						return '<span>招标文件</span>';
					} else if(value == 'PROJECT_LIST') {
						return '<span>工程量清单</span>';
					} else if(value == 'DRAWING_DOCUMENT') {
						return '<span>图纸文件</span>';
					} else if(value == 'TENDER_FILE_ATTACHS') {
						return '<span>其他</span>';
					}
				}
			}, 
			{
				field: "caoz",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				formatter:function(value, row, index){	
				var filesnames = row.attachmentFileName.substring(row.attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody=""  
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='fileDownload(\"" + row.url+ "\",\"" + row.attachmentFileName + "\")'>下载</a>&nbsp;&nbsp"
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.url + "\")'>预览</a>&nbsp;&nbsp"
				}
				return mixtbody
				}
				 
			}
		]
	});
	$('#fileList').bootstrapTable("load", fileArr); //重载数据
};

function previewFile(filePath) {
	//openPreview(filePath);
	previewPdf(filePath)
}

//文件下载
function fileDownload(filePath,fileName){
	fileName = fileName.substring(0, fileName.lastIndexOf("."));
	var newUrl = downloadFileUrl + "?ftpPath=" + filePath + "&fname=" + fileName;
    window.location.href = $.parserUrlForToken(newUrl); 
};


