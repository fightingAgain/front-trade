var getUrl = config.tenderHost + '/ProjectController/getAndFile.do'; // 获取项目信息接口
var saveUrl = config.tenderHost + '/ProjectController/updateReceive.do'; // 点击保存的接口
var managerHtml = 'Bidding/Model/projectManagerList.html';		// 点击获取项目经理弹出页面
var id = "";
var state = '';	//接收状态
var projectName = '';		//项目名称
var projectId = '';		//项目id
 $(function(){
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
	}
 	// 选择项目经理（派项）
 	$('#btnManager').click(function(){
 		var width = top.$(window).width() * 0.9;
		var height = top.$(window).height() * 0.9;
		parent.layer.open({
			type: 2,
			title: "项目经理",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: managerHtml,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
			
				iframeWin.passMessage({callback:enterpriseCallback});  //调用子窗口方法，传参
			}
		});
 	})
 	//获取登录人信息
	var entryArr = entryInfo();
//	console.log(entryArr)
 	//确定
 	$("#btnSure").click(function(){
 		var name = $("#userName").val();
 		var data = {};
 		if(name != ''){
 			//若接收状态为已接收时则不需要传接受状态receiveState给后台，因为每传一次后台会创建一个接收的时间戳
 			if(state != '1'){
	 			data = {
			  		'receiveState':1,
			  		'receiveEmployeeId': $("#id").val(),
			  		'id':projectId
			  	}
	 		}else{
	 			data = {
			  		'receiveEmployeeId': $("#id").val(),
			  		'id':projectId
			  	}
	 		}
 			parent.layer.alert('确认将项目 '+projectName+' 派给 '+name+'？', function(index){
				$.ajax({
				  	type:"post",
				  	url: saveUrl,
				  	traditional:true,
				  	async:true,
				  	data:data,
				  	success: function(){
				  		
				  	},
				  	error: function(){
				  		
				  	},
				});
				parent.layer.close(index);
			})
 		}else{
 			parent.layer.alert('请选择项目经理！')
 		}
 		
 	})
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
 });
 /*
 * 同级页面返回参数
 */
function enterpriseCallback(data){
//	console.log(data)
	$("#userName").val(data[0].userName);
	$("#id").val(data[0].id);
}
 
 function getDetail() {	
     $.ajax({
         url: getUrl,
         type: "post",
         data: {id:id},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	state = arr.receiveEmployeeId;
         	projectName = arr.projectName;
         	projectId = arr.id;
         	for(var key in arr){
         		if(key == "projectState"){
         			$("#projectStateTxt").html(parent.Enums.projState[arr[key]]);
         		} else if(key == "tenderees" && arr[key].length > 0){
	         		for(var i= 0; i < arr.tenderees.length; i++){
	         			if(arr.tenderees[i].tendererType == 0){
	         				for(var key in arr.tenderees[i]){
	         					$("#" + key).html(arr.tenderees[i][key]);
	         				}
	         			} else {
	         				enterpriseHtml([arr.tenderees[i]]);
	         			}
	         		}
         		} else if(key == "projectAttachmentFiles"){ //文件信息
         			var fileArr = arr.projectAttachmentFiles;
         			if(fileArr.length>0){
         				for(var i = 0;i<fileArr.length;i++){
         					var html = $('<tr><td >'+fileArr[i].attachmentFileName+'</td>'
				        	+'<td data-file-id="'+fileArr[i].id+'" data-file-url="'+fileArr[i].url+'" data-file-name="'+fileArr[i].attachmentFileName+'">'
				        	+'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >'
				        	+'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button></td></tr>');
				        	$('#fileList tbody').append(html);
         				}
         			}
         			
         		}else {
         			optionValueView("#"+key,arr[key]);//下拉框信息反显
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
