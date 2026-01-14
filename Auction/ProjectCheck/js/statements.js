// var WorkflowUrl=top.config.AuctionHost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var downloadFileUrl = top.config.FileHost + '/FileController/download.do';//下载文件
var detailUrl =  top.config.AuctionHost + '/OwnerDeclarationController/getDetail.do';//详情
var projectId = $.getUrlParam('projectId');
var packageId = $.getUrlParam('packageId');
var examType = $.getUrlParam('examType');
var id = $.getUrlParam('key'); //主键id 
var edittype = $.getUrlParam('edittype'); //主键id 
var isCheck, WORKFLOWTYPE=$.getUrlParam('workflowType'),AccessoryList=[];
$(function(){
	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}
	getDetail();
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);
});
function passMessage(callback){
	$('#btn_close').click(function(){
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
};
function getDetail(){
	$.ajax({
		url: detailUrl,
		type:'get',
		dataType:'json',
		async:false,
		data: {
			'packageId': packageId,
			'projectId': projectId,
			'examType': examType,
			'type': WORKFLOWTYPE == 'fzbpsbgqdsz'?'1':'0'
		},
		success:function(data){	
		    if(data.success){
				if(data.data){
					$('#description').html(data.data.description);
					if(data.data.fileList && data.data.fileList.length > 0){
						AccessoryList = data.data.fileList;
						fileTable();
					}
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
function fileTable(){
	var ele = '',data=[];
	ele = 'fileTables';
	data = AccessoryList || [];
	var list = [];
	for(let i = 0; i < data.length; i++) {
		if (data[i].showStatus === 1) {
			// showStatus 为1的进行隐藏
		} else {
			list.push(data[i]);
		}
	}
	data = list;
	$('#'+ ele).bootstrapTable({
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
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'120px'

			},
			{
				field: "subDate",
				title: "上传时间",
				align: "center",
				halign: "center",
				width:'180px'

			},
			{
				field: "userName",
				title: "上传人",
				align: "center",
				halign: "center",
				width:'100px'

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
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
						}
						return mixtbody
				}
				 
			}
		]
	});
	$('#'+ele).bootstrapTable("load", data); //重载数据
};
