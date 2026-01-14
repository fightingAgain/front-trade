var getUrl = config.tenderHost + '/ProjectController/getAndFile.do'; // 项目查询的接口
var fileDownload = config.FileHost + "/FileController/download.do"; //下载文件

var id = "";

var fileUploads = null;
$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
	}
	//文件下载
	$("#fileList").on('click','.downloadModel',function(){
		var road = $(this).closest('td').attr('data-file-url');	// 下载文件路径
		var fileName = $(this).closest('td').attr('data-file-name');	// 下载文件路径
		$(this).attr('href',$.parserUrlForToken(fileDownload+'?ftpPath='+road+'&fname='+fileName))
			
	})
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

});

function getDetail() {
	$.ajax({
		url: getUrl,
		type: "post",
		data: {
			id: id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			for(var key in arr) {
				 if(key=="regionCode"){
	         			// 初始化省市联动
						new GetRegion("#areaBlock", {code:arr[key], status:2});
	         	} else if(key == "projectState") {
					$("#projectStateTxt").html(parent.Enums.projState[arr[key]]);
				} else if(key == "tenderees" && arr[key].length > 0) {
					for(var i = 0; i < arr.tenderees.length; i++) {
						if(arr.tenderees[i].tendererType == 0) {
							for(var key in arr.tenderees[i]) {
								$("#" + key).html(arr.tenderees[i][key]);
							}
						} else {
							enterpriseHtml([arr.tenderees[i]]);
						}
					}
				} else if(key == "projectAttachmentFiles") { //文件信息
					var fileArr = arr.projectAttachmentFiles;
//					if(fileArr.length > 0) {
//						for(var i = 0; i < fileArr.length; i++) {
//							var html = $('<tr><td >' + fileArr[i].attachmentFileName + '</td>' +
//								'<td data-file-id="' + fileArr[i].id + '" data-file-url="' + fileArr[i].url + '" data-file-name="' + fileArr[i].attachmentFileName + '">' +
//								'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >' +
//								'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button></td></tr>');
//							$('#fileList tbody').append(html);
//						}
//					}
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							businessId: id,
							status:2
						});
					}
         			fileUploads.fileHtml(fileArr);

				} else {
					$("#" + key).html(arr[key]);
					optionValueView("#"+key,arr[key]);//下拉框信息反显
				}
			}
			//usersupplier(arr.agencyEnterprisId);

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}

//获取企业信息,回显数据
/*function usersupplier(id){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	data:{id:id},
	   	success:function(data){	
	   		if(data.success){
	   			//回显选择的代理机构的信息
   				$("[name='agentName']").html(data.data.agentName);
	   			$("[name='agentTel']").html(data.data.agentTel);
	   			$("[name='legalPerson']").html(data.data.legalPerson);
	   			$("[name='agencyEnterpriseAddress']").html(data.data.enterpriseAddress);
	   		}
	   	}
	});    
};*/

// 招标人代表表格
function enterpriseHtml(data) {
	var html = "";
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<tr data-id="' + data.id + '">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                	</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		html += '<tr>\
	                    		<td>' + data[i].tendererName + '</td>\
	                    		<td>' + data[i].agentName + '</td>\
	                    		<td>' + data[i].agentTel + '</td>\
	                    	</tr>';
	}

	if($("#enterpriseTab").length == 0) {
		html += '</table>';
		$(html).appendTo("#enterpriseBlock");
	} else {
		$(html).appendTo("#enterpriseTab");
	}
}