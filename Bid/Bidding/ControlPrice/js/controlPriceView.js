var getUrl = config.tenderHost + '/ControlPriceController/getAndFile.do'; // 根据数据id查询控制价
var getInfoUrl = config.tenderHost + '/ControlPriceController/findDetailByBidSectionId.do'; // 根据标段id查询控制价
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var hisUrl = config.tenderHost + "/ControlPriceController/getHistoryList.do";	//历史记录
var controlpriceid = ""; //控制价id
var source = 0; //链接来源  0:查看  1审核, 2是供应商查看

var fileUploads = null;  //上传文件
var priceUploads = null;  //控制价清单
var isThrough;
var bidSectionId; //标段id
var special = '';
 $(function(){
 	// 获取连接传递的参数
 	isThrough = $.getUrlParam("isThrough");
 	source = $.getUrlParam("source");
 	if($.getUrlParam("special") && $.getUrlParam("special") != undefined){
 		special = $.getUrlParam("special");
 		source = special
 	}
// 	console.log($.getUrlParam("id"))
 	if(special == ''){
 		var arr = {};
 		if($.getUrlParam("controlpriceid")){
 			arr.id = $.getUrlParam("controlpriceid");
 		}else{//审核页面
 			arr.id = $.getUrlParam("id");
 		}
 		
 		getDetail(getUrl,arr)
 	}else{//从控制台过来
 		var arr = {};
 		arr.bidSectionId = $.getUrlParam("id");
 		getDetail(getInfoUrl,arr)
 	}
// 	controlpriceid = $.getUrlParam("id");
// 	bidSectionId = $.getUrlParam("id");
// 	if(controlpriceid == "undefined" || controlpriceid == null){
//		controlpriceid = "";
//	} else {
//		getDetail();
//	}
	
	
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//文件下载
	$("#fileList").on('click','.downloadModel',function(){
		var road = $(this).closest('td').attr('data-file-url');	// 下载文件路径
		var fileName = $(this).closest('td').attr('data-file-name');	// 下载文件路径
		$(this).attr('href',$.parserUrlForToken(fileDownload+'?ftpPath='+road+'&fname='+fileName))
			
	})

	
 });
 function passMessage(data){
	$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
	$("#bidSectionName").html(data.bidSectionName);
	if(data.getForm == 'KZT'){
		bidSectionId = data.id;
	}else{
		bidSectionId = data.id;
	}
	
}
 function getDetail(jumpUrl,checkData) {	
// 	console.log(checkData)
     $.ajax({
         url: jumpUrl,
         type: "post",
         data: checkData,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	if(arr.packageId){
         		bidSectionId = arr.packageId;
         	}
         	
         	if(arr.id){
         		controlpriceid = arr.id;
         	}
         	if(arr.checkState == 2){
         		isThrough = 1
         	}else{
         		isThrough = 0
         	}
         	for(var key in arr){
         		if(key == "projectAttachmentFiles"){ //文件信息
					var fileArr = {file1:[], file2:[]};
					
					if(!priceUploads){
						priceUploads = new StreamUpload("#filePriceContent",{
							businessId: controlpriceid,
							status:2
						});
					}
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							businessId: controlpriceid,
							status:2
						});
					}
					for(var i = 0; i < arr[key].length; i++){
						if(arr[key][i].attachmentSetCode == "CONTROL_PRICE_CLEAN"){
							if(fileArr.file1.length == 0){
								fileArr.file1.push(arr[key][i]);
							}
						} else if(arr[key][i].attachmentSetCode == "CONTROL_PRICE_FILE"){
							fileArr.file2.push(arr[key][i]);
						}
					}
					
					priceUploads.fileHtml(fileArr.file1);
					fileUploads.fileHtml(fileArr.file2);
         		} else if(key == "controlPrice"){
         			$("[id='"+key+"']").html(digitToThousands(arr[key].toString()));
         			
         		}else if(key == "isControlPrice"){
					$('#isControlPrice').html(arr[key] == 1?"是":arr[key] == 0?"否":"");
				} else {
        			$("[id='"+key+"']").html(arr[key]);
        		}
           } 
           
		 	if(source == 1) {
		 		$("#btnClose").hide();
		 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		 			type:"kzjsp", 
		 			businessId:controlpriceid, 
		 			status:2,
		 			submitSuccess:function(){
			         	parent.$("#projectList").bootstrapTable("refresh");
			         	var index = parent.layer.getFrameIndex(window.name); 
						parent.layer.closeAll(); 
		 			}
		 		});
		 	} else if(source == 2) {
		 		$("#btnClose").show();
		 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		 			type:"kzjsp", 
		 			businessId:controlpriceid, 
		 			status:3,
		 			isSeeRecord:false
		 			
		 		});
		 	} else {
		 		$("#btnClose").show();
		 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		 			type:"kzjsp", 
		 			businessId:controlpriceid, 
		 			status:3,
		 			checkState:isThrough
		 		});
		 	}
         	getHistory();
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 };
 function getHistory() {	
     $.ajax({
         url: hisUrl,
         type: "post",
         data: {bidSectionId:bidSectionId},
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
 
 //文件表格
function fileHtml(data){
	$('#fileList tbody').html('');
	var html='';
	for(var i = 0;i<data.length;i++){
		
		html = $('<tr>'
		+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<input type="hidden" name="projectAttachmentFiles['+i+'].attachmentFileName" value="'+data[i].attachmentFileName+'"/>'	//附件文件名
		+'<input type="hidden" name="projectAttachmentFiles['+i+'].url" value="'+data[i].url+'"/>'	//附件URL地址
		+'<td><a href="'+$.parserUrlForToken(fileDownload+'?ftpPath='+data[i].url+'&fname='+data[i].attachmentFileName)+'">'+data[i].attachmentFileName+'</a></td>'
		+'</tr>');
		$("#fileList tbody").append(html);
	}
}
   //控制价表格
function changeHtml(data){
	$('#changeList').html('');
	var html='';
	for(var i = 0;i<data.length;i++){
		
		html = $('<tr>'
		+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<td>'+data[i].bidSectionName+'</td>'
		+'<td style="width:150px;text-align:right">'+data[i].controlPrice+'</td>'
		+'<td style="width:100px;text-align:center">'+(data[i].changeCount+1)+'</td>'
		+'<td style="width:150px;text-align:center">'+data[i].createDate+'</td>'
//		+'<input type="hidden" name="projectAttachmentFiles['+i+'].attachmentFileName" value="'+data[i].attachmentFileName+'"/>'	//附件文件名
//		+'<input type="hidden" name="projectAttachmentFiles['+i+'].url" value="'+data[i].url+'"/>'	//附件URL地址
//		+'<td><a href="'+$.parserUrlForToken(fileDownload+'?ftpPath='+data[i].url+'&fname='+data[i].attachmentFileName)+'">'+data[i].attachmentFileName+'</a></td>'
		+'</tr>');
		$("#changeList").append(html);
	}
}
