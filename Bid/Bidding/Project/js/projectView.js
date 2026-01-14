var getUrl = config.tenderHost + '/ProjectController/getAndFile.do'; // 点击添加项目保存的接口
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var id = ""; //项目id
var source = 0; //链接来源  0:查看  1审核
var fileUploads = null;
var employeeInfo = entryInfo();
var isThrough;
 $(function(){
 	// 获取连接传递的参数
 	id = $.getUrlParam("id");
 	isThrough = $.getUrlParam("isThrough");
 	if(id == "undefined" || id == null){
		id = "";
	} else {
		getDetail();
	}
	$("#agencyEnterprisName").html(employeeInfo.enterpriseName);
 	$("#enterpriseCode").html(employeeInfo.enterpriseCode);
	source = $.getUrlParam("source");
 	if(source == 1) {
 		$("#btnClose").hide();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"xmsp", 
 			businessId:id, 
 			status:2,
 			submitSuccess:function(){
	         	var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.closeAll(); 
				parent.layer.alert("审核成功",{icon:7,title:'提示'});
				parent.$("#projectList").bootstrapTable("refresh");
 			}
 		});
 	} else {
 		$("#btnClose").show();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"xmsp", 
 			businessId:id, 
 			status:3,
 			checkState:isThrough
 		});
 	}
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
	//审核
	
 });
 function getDetail() {	
     $.ajax({
         url: getUrl,
         type: "post",
         data: {id:id},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		var arr = data.data;
	         	for(var key in arr){
	         		if(key == "relateCode"){
	         			$("#relateCode").html(arr[key] == 1 ? "是" : "否");
//	         			if(arr[key] == 0){
//	         				$("#relateCodeTxt").html("否");
//	         			} else if(arr[key] == 1) {
//	         				$("#relateCodeTxt").html("是");
//	         			}
	         		} else if(key=="regionCode"){
	         			// 初始化省市联动
						new MultiLinkage("#areaBlock", {code:arr[key], status:2});
	         		}else if(key == "industriesType"){
	         			$("#proIndustriesType").dataLinkage({
							optionName:"INDUSTRIES_TYPE",
							optionValue:arr[key],
							status:2,
							viewCallback:function(name){
								$("#proIndustriesType").html(name)
							}
						});
	         		} else if(key == "tenderees" && arr[key].length > 0){
//		         		for(var i= 0; i < arr.tenderees.length; i++){
//		         			if(arr.tenderees[i].tendererType == 0){
//		         				for(var key in arr.tenderees[i]){
//		         					$("#" + key).html(arr.tenderees[i][key]);
//		         					optionValueView("#"+key,arr.tenderees[i][key]);//下拉框信息反显
//		         				}
//		         				$("#enterpriseIdTxt").html(arr.tenderees[i].projectOwner);
//		         			} else {
//		         				enterpriseHtml([arr.tenderees[i]]);
//		         			}
//		         		}
	         		}else if(key == "projectAttachmentFiles"){ //文件信息
//	         			var fileArr = arr.projectAttachmentFiles;
//	         			if(!fileUploads){
//							fileUploads = new StreamUpload("#fileContent",{
//								businessId: id,
//								status:2
//							});
//						}
//	         			fileUploads.fileHtml(fileArr);
//	         			var fileArr = arr.projectAttachmentFiles;
//	         			if(fileArr.length>0){
//	         				for(var i = 0;i<fileArr.length;i++){
//	         					var html = $('<tr><td >'+fileArr[i].attachmentFileName+'</td>'
//					        	+'<td data-file-id="'+fileArr[i].id+'" data-file-url="'+fileArr[i].url+'" data-file-name="'+fileArr[i].attachmentFileName+'">'
//					        	+'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >'
//					        	+'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button></td></tr>');
//					        	$('#fileList tbody').append(html);
//	         				}
//	         			}
//	         			if(!fileUploads){
						if(!fileUploads){
							fileUploads = new StreamUpload("#fileContent",{
								businessId: id,
								status:2
							});
						}
						if(arr.projectAttachmentFiles){
			          		fileUploads.fileHtml(arr.projectAttachmentFiles);
			          	}
	         		}else {
	         			optionValueView("#"+key,arr[key]);//下拉框信息反显
	         			$('#legalPerson').html(arr.legalPerson);//项目法人
	            	}
	           	}      	
        	}
         	
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
// 招标人代表表格
function enterpriseHtml(data){
	var html = "";
		if($("#enterpriseTab").length == 0){
			html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<tr data-id="'+data.id+'">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                	</tr>';
		}
		for(var i = 0; i < data.length; i++){
			html += '<tr>\
	                    		<td>'+data[i].tendererName+'</td>\
	                    		<td>'+data[i].agentName+'</td>\
	                    		<td>'+data[i].agentTel+'</td>\
	                    	</tr>';
		}
		
		if($("#enterpriseTab").length == 0){
			html += '</table>';
			$(html).appendTo("#enterpriseBlock");
		} else {
			$(html).appendTo("#enterpriseTab");
		}
}
