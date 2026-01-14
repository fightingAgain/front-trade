 var bidDetail = top.config.AuctionHost + '/ControlPriceController/findDetailByPackageId.do'; //根据标段id查询详情
 var getDetailUrl = top.config.AuctionHost + '/ControlPriceController/getDataForSup.do';//根据数据id查询详情
 var WorkflowUrl=top.config.AuctionHost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
 var hisUrl = top.config.AuctionHost+'/ControlPriceController/getHistoryList.do';//历史控制价
 var downloadFileUrl = top.config.FileHost + '/FileController/download.do';//下载文件
 var packageId = ""; //包件id
 var priceFileList=[], normalFileList=[];//控制价文件 附件 包件信息
 var type = $.getUrlParam('special'); //控制台传过来的参数
 var dataId = $.getUrlParam('dataId'); //数据id
 var isHasDetailedListFile = '';
 var isCheck=false;
 var WORKFLOWTYPE = "kzjsp";
 var role = '';
 $(function() {
	//下拉框数据初始化

 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
 		packageId = $.getUrlParam("id");
 	}
	if($.getUrlParam("role") && $.getUrlParam("role") != "undefined") {
		role = $.getUrlParam("role");
	}
	getBidInfo();
	getHistory();
 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});

 });
 function getBidInfo() {
	var postUrl = bidDetail;
	var postData = {'packageId': packageId};
	if(dataId){
		postUrl = getDetailUrl;
		postData = {'id': dataId};
	}
 	$.ajax({
 		type: "post",
 		url: postUrl,
 		async: true,
 		data: postData,
 		success: function(data) {
 			if(data.success) {
 				if(data.data) {
 					var res = data.data;
 					if(res.id && role == '') {
						findWorkflowCheckerAndAccp(res.id);
 					}
 					for(var key in res) {
 						if(key == "cleanFiles") {
							if(role == ''){
								priceFileList=res[key];
								fileTable('price');
							}
 						}else if(key == "otherFiles"){
							normalFileList=res[key];
							fileTable('normal');
						}else if(key == "isControlPrice"){
							$('#isControlPrice').html(res[key] == 1?"是":res[key] == 0?"否":"");
						} else {
							$('#' + key).html(res[key]);
 						}

 					}
 				}

 			} else {
 				top.layer.alert(data.message)
 			}
 		}
 	});
 };
 //文件列表
 function fileTable(_type){
 	var ele = '',data=[];
 	if(_type == 'normal'){
 		ele = 'fileContent';
 		data = normalFileList;
 	}else if(_type == 'price'){
 		ele = 'filePriceContent';
 		data = priceFileList;
 	}
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
 						openBidPricePreview(row.filePath);
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
 function getHistory() {
     $.ajax({
         url: hisUrl,
         type: "post",
         data: {'packageId':packageId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	changeHtml(arr);
         }
       })
    }
 //历史控制价表格
 function changeHtml(data){
 	$('#changeList').html('');
 	var html='';
 	for(var i = 0;i<data.length;i++){
 		
 		html = $('<tr>'
 		+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
 		+'<td>'+data[i].packageName+'</td>'
 		+'<td style="width:150px;text-align:right">'+data[i].controlPrice+'</td>'
 		+'<td style="width:100px;text-align:center">'+(data[i].changeCount+1)+'</td>'
 		+'<td style="width:150px;text-align:center">'+data[i].createDate+'</td>'
 		+'</tr>');
 		$("#changeList").append(html);
 	}
 }