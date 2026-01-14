var pushUrl =  top.config.AuctionHost + '/projectReceptionController/push.do';//推送接口
var getInfoUrl = top.config.AuctionHost + '/projectReceptionController/saveLogPushProject.do';//获取推送数据详情接口
var dowoloadFileUrl =top.config.FileHost + "/FileController/download.do"; //下载文件
var packageId = $.getUrlParam("packageId");//包件id
var projectId = $.getUrlParam("projectId");//项目id
var pushId = '';//推送id
var fileArr = [];
var token=sessionStorage.token;
var selSupplier=[]
$(function(){
	//关闭当前窗口
	$("#btn_close").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	getPushInfo();
	$('#btn_submit').click(function(){
		if($('#dataType').html()=="推送成功"){
			var title="温馨提示：是否确定再次推送"
		}else{
			var title="温馨提示：是否确定推送"
		}
		parent.layer.confirm(title, {
			btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero) {
			$.ajax({
				type:"post",
				url:pushUrl,
				async:true,
				data: {
					'id': pushId
				},
				success: function(data){
					if(data.success){
						parent.layer.alert('推送成功！')
					}else{
						parent.layer.alert(data.message)
					}
					getPushInfo();
				}
			});
			parent.layer.close(index);
		}, function(index) {
			parent.layer.close(index)
		});	
	})
});
/*
 * 获取推送数据
 * */
function getPushInfo(){
	$.ajax({
		type:"post",
		url:getInfoUrl,
		async:true,
		data: {
			'packageId': packageId,
			'projectId': projectId
		},
		success: function(data){
			if(data.success){
				var res = data.data;
				pushId = res.id;
				for(var key in res){
					$('#'+key).html(res[key]);
				}
				//答疑记录
				if(res.ansRecord){
					$('#answerList').html(res.ansRecord)
				};
				//答谈判记录
				if(res.negotiationRecord){
					$('#talksList').html(res.negotiationRecord)
				}
				if(res.selSupplier && res.selSupplier.length > 0){
					selSupplier=res.selSupplier;
					supplierHtml(res.selSupplier);
					supplierFileList(res.selSupplier);
				}
				var list=['11','13','15']
				if(res.deliveryFiles && res.deliveryFiles.length > 0){
					fileArr = res.deliveryFiles;
					for(var i=0;i<list.length;i++){
						fileHtml(fileArr,list[i])
					}
					
				}
				if(res.dataType == 0){
					$('#btn_submit').html('确认推送');
				}
				if(res.dataType == 1){
					$('#btn_submit').html('推送成功');
				}
				if(res.dataType == 2){
					$('#btn_submit').html('推送失败');
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}

/*
 * 候选供应商
 * 
 */
function supplierHtml(data){
	$('#supplierList').html('');
	var html = '';
	html += '<table class="table table-bordered">';
		html += '<thead>';
			html += '<tr>';
				html += '<th style="width: 50px;text-align: center;">序号</th>';
				html += '<th>供应商名称</th>';
				html += '<th style="width: 150px;text-align: center;">社会信用代码</th>';
				html += '<th style="width: 150px;text-align: right;">报价金额（元）</th>';
				html += '<th style="width: 150px;text-align: center;">是否为中选供应商</th>';
				html += '<th style="width: 150px;text-align: right;">成交金额（元）</th>';
			html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
	for(var i = 0;i<data.length;i++){
		html += '<tr>';
			html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			html += '<td>'+data[i].suplierName+'</td>';
			html += '<td style="width: 150px;text-align: center;">'+data[i].socialCreditcode+'</td>';
			html += '<td style="width: 150px;text-align: right;">'+data[i].openPrice+'</td>';
			html += '<td style="width: 150px;text-align: center;">'+(data[i].isWin?"是":"否")+'</td>';
			html += '<td style="width: 150px;text-align: right;">'+(data[i].isWin?data[i].winPrice:"/")+'</td>';
		html += '</tr>';
	        				
	}
	html += '</tbody></table>';
	$(html).appendTo('#supplierList');
}
function fileHtml(data,num){
	var html = '';
	html += '<table class="table table-bordered">';
		html += '<thead>';
			html += '<tr>';
				html += '<th style="width: 50px;text-align: center;">序号</th>';
				html += '<th>附件名称</th>';
				html += '<th style="width: 150px;text-align: center;">文件传递时间</th>';				
				html += '<th style="width: 150px;">操作</th>';
			html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
	for(var i = 0;i<data.length;i++){
		var type = '';
		
		var postfix = data[i].path.split('.');
		if(data[i].ftype==num){
			html += '<tr>';
			html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			html += '<td>'+data[i].name+'</td>';
			html += '<td style="width: 150px;text-align: center;">'+dateSpile(data[i].dataTime)+'</td>';
			html += '<td style="width: 150px;">';
				html += "<a href='javascript:void(0)' class='btn-sm btn-primary btn_down' data-index='"+i+"' style='text-decoration:none;margin-right:10px;'>下载</a>";
				if(postfix[1] == "pdf" || postfix[1] == "PDF"){
					html += "<a href='javascript:void(0)' class='btn-sm btn-primary btn_view' data-index='"+i+"' style='text-decoration:none;margin-right:10px;'>预览</a>";
				}
			html += '</td>';
		html += '</tr>';
		}
		
	        				
	};
	html += '</tbody></table>';
	$('#fileList'+num).html(html)
}
//下载
$('#fileList').on('click','.btn_down',function(){
	var index = $(this).attr('data-index');
	var newUrl =dowoloadFileUrl + '?ftpPath=' + fileArr[index].ftpPath + '&fname=' + fileArr[index].name+'&Token='+token;
	window.location.href = encodeURI(newUrl);
});
//预览
$('#fileList').on('click','.btn_view',function(){
	var index = $(this).attr('data-index');
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		btn: ["关闭"],
		maxmin: false,
		resize: false,
		title: "预览",
		content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileArr[index].ftpPath+'&Token='+token
	})
})
function supplierFileList(data){
	var html='';
	html += '<table class="table table-bordered">';
		html += '<thead>';
			html += '<tr>';
				html += '<th style="width: 50px;text-align: center;">序号</th>';
				html += '<th>供应商名称</th>';
				html += '<th style="width: 150px;text-align: center;">附件名称</th>';
				html += '<th style="width: 150px;text-align: right;">是否上传</th>';
				html += '<th style="width: 300px;text-align: center;">操作</th>';
			html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
	for(var i = 0;i<data.length;i++){
		html += '<tr>';
			html += '<td rowspan="3" style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			html += '<td rowspan="3">'+data[i].supplierName+'</td>';
			html += '<td>技术方案附件</td>';
			html += '<td class="youwu21'+ i +'">无</td>';
			html += '<td style="width: 150px;" class="caozuo21'+ i +'">';
			html +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
			html +='<span>上传</span>'
			html +='<input type="file" onchange=Excel(this,'+ i +',21,\"btnUpload\")>'
			html +='</span>'
			html += '</td>';
		html += '</tr>'; 
		html += '<tr>';
			html += '<td>报价文件</td>';
			html += '<td class="youwu22'+ i +'">无</td>';
			html += '<td style="width: 150px;" class="caozuo22'+ i +'">';
			html +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
			html +='<span>上传</span>'
			html +='<input type="file" onchange=Excel(this,'+ i +',22,\"btnUpload\")>'
			html +='</span>'
			html += '</td>';
		html += '</tr>';
		html += '<tr>';
			html += '<td>结果通知书附件</td>';
			html += '<td class="youwu23'+ i +'">无</td>';
			html += '<td style="width: 150px;" class="caozuo23'+ i +'">';
			html +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
			html +='<span>上传</span>'
			html +='<input type="file" onchange=Excel(this,'+ i +',23,\"btnUpload\")>'
			html +='</span>'
			html += '</td>';
		html += '</tr>'; 	
		   				
	}
	html += '</tbody></table>';
	$('#tableList').html(html);
	
	for(var i = 0;i<data.length;i++){
		var htmlBtn21="",htmlBtn22="",htmlBtn23="";
		for(var j=0;j<data[i].attachments.length;j++){
			if(data[i].attachments[j].ftype==21){
				var postfix = data[i].attachments[j].path.split('.');
				htmlBtn21 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnDown' style='text-decoration:none;margin-right:10px;'>下载</a>";
				htmlBtn21 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn21 +='<span>重新上传</span>'
				htmlBtn21 +='<input type="file" onchange=Excel(this,'+ i +',21,\"btnAgainUpload\")>';
				htmlBtn21 +='</span>'
				htmlBtn21 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn21 +='<span>追加上传</span>'
				htmlBtn21 +='<input type="file" onchange=Excel(this,'+ i +',21,\"btnAdd\")>';
				htmlBtn21 +='</span>'
				htmlBtn21 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-danger fileinput-button btnDel' style='text-decoration:none;margin-right:10px;'>删除</a>";
				if(postfix[1] == "pdf" || postfix[1] == "PDF"){
					htmlBtn21 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnview' style='text-decoration:none;margin-right:10px;'>预览</a>";
				}
			}
			if(data[i].attachments[j].ftype==22){
				var postfix = data[i].attachments[j].path.split('.');
				htmlBtn22 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnDown' style='text-decoration:none;margin-right:10px;'>下载</a>";
				htmlBtn22 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn22 +='<span>重新上传</span>'
				htmlBtn22 +='<input type="file" onchange=Excel(this,'+ i +',22,\"btnAgainUpload\")>';
				htmlBtn22 +='</span>'
				htmlBtn22 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn22 +='<span>追加上传</span>'
				htmlBtn22 +='<input type="file" onchange=Excel(this,'+ i +',22,\"btnAdd\")>';
				htmlBtn22 +='</span>'
				htmlBtn22 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-danger fileinput-button btnDel' style='text-decoration:none;margin-right:10px;'>删除</a>";
				if(postfix[1] == "pdf" || postfix[1] == "PDF"){
					htmlBtn22 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnview' style='text-decoration:none;margin-right:10px;'>预览</a>";
				}
			}
			if(data[i].attachments[j].ftype==23||data[i].attachments[j].ftype==24){
				var postfix = data[i].attachments[j].path.split('.');
				htmlBtn23 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnDown' style='text-decoration:none;margin-right:10px;'>下载</a>";
				htmlBtn23 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn23 +='<span>重新上传</span>'
				htmlBtn23 +='<input type="file" onchange=Excel(this,'+ i +','+ data[i].attachments[j].ftype +',\"btnAgainUpload\")>';
				htmlBtn23 +='</span>'
				htmlBtn23 +='<span class="btn-sm btn-primary fileinput-button" style="margin-right:10px">'
				htmlBtn23 +='<span>追加上传</span>'
				htmlBtn23 +='<input type="file" onchange=Excel(this,'+ i +','+ data[i].attachments[j].ftype +',\"btnAdd\")>';
				htmlBtn23 +='</span>'
				htmlBtn23 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-danger fileinput-button btnDel' style='text-decoration:none;margin-right:10px;'>删除</a>";
				if(postfix[1] == "pdf" || postfix[1] == "PDF"){
					htmlBtn23 += "<a href='javascript:void(0)' data-index='"+ j +"' data-omg='"+ i +"' class='btn-sm btn-primary fileinput-button btnview' style='text-decoration:none;margin-right:10px;'>预览</a>";
				}
			}
		}
		$('.youwu21'+i).html(htmlBtn21!=""?'有':'无');
		$('.youwu22'+i).html(htmlBtn22!=""?'有':'无');
		$('.youwu23'+i).html(htmlBtn23!=""?'有':'无');
		htmlBtn21 && $(".caozuo21"+i).html(htmlBtn21);
		htmlBtn22 && $(".caozuo22"+i).html(htmlBtn22);
		htmlBtn23 && $(".caozuo23"+i).html(htmlBtn23);
	}
	//下载
	$('#tableList').on('click','.btnDown',function(){
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		var newUrl =dowoloadFileUrl + '?ftpPath=' + data[_i].attachments[index].ftpPath + '&fname=' + data[_i].attachments[index].name+'&Token='+token;
		window.location.href = encodeURI(newUrl);
	});
	//删除
	$('#tableList').on('click','.btnDel',function(){
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		parent.layer.confirm('确定要删除该附件', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(indexs, layero){
				$.ajax({
					type: "post",
					url: deleteFileUrl,
					async: false,
					dataType: 'json',
					data: {
						"deliveryFileId":data[_i].attachments[index].id ,		
					},
					success: function(data) {	
						if(data.success){
							getPushInfo();
						}else{
							parent.layer.alert(data.message)
						}	
					}
				});  
				parent.layer.close(indexs);			 
		}, function(indexs){
			parent.layer.close(indexs)
		});
	});
	//预览
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		var _i = $(this).data('omg');
		top.layer.open({
			type: 2,
			area: ['100%', '100%'],
			btn: ["关闭"],
			maxmin: false,
			resize: false,
			title: "预览",
			content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + data[_i].attachments[index].ftpPath+'&Token='+token
		})
	});
}

//评价项的批量导入
var rABSl = false; //是否将文件读取为二进制字符串
function Excel(obj,_i,fileType,type){
  var f = obj.files[0];
  
  if(f!=null){
	var formFile = new FormData();
	formFile.append("deliveryFile.ftype", fileType); 
	formFile.append("deliveryFile.deliveryId", selSupplier[_i].deliveryId); 
	formFile.append("deliveryFile.deliveryId", selSupplier[_i].supplierId); 
	if(type=='btnAdd'){
		var url=appenFileUrl;
		formFile.append("deliveryFile.id", selSupplier[_i].id);
	}else{
		var url=fileUploadUrl;
		if(type=='btnAgainUpload'){
			formFile.append("deliveryFile.id", selSupplier[_i].id);;
		}	
	}
	formFile.append("files", f); //加入文件对象
	var data=formFile;
	$.ajax({
		type: "post",
		url:url,
		data: data,
		async: true,
		dataType: 'json',
		cache: false,//上传文件无需缓存
		processData: false,//用于对data参数进行序列化处理 这里必须false
		contentType: false, //必须
		success: function (response) {
			if(response.success){
				getPushInfo();
			}else{
				parent.layer.alert(response.message)
			}
		}
	});
  	  
  }	
}