 var saveUrl = config.tenderHost + '/ProjectController/save.do'; // 点击添加项目保存的接口
 var getUrl = config.tenderHost + '/ProjectController/getAndFile.do'; // 获取项目信息的接口
 //var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"
 var findEnterpriseInfo=config.tenderHost+'/getEnterpriseInfo.do';//当前登录人的企业信息
//var fileUrl = config.tenderHost + "/FileController/upload.do";		//文件上传地址
var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
 var fileDelUrl = config.tenderHost + "/ProjectAttachmentFileController/delete.do";	//文件删除地址
 var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
 var fileAddUrl = config.tenderHost + "/ProjectAttachmentFileController/insertProjectAttachmentFile.do";	//添加附件表的地址
 
 var enterpriseUrl = "Bidding/Model/enterpriseList.html";  //招标人页面
 var id = ""; //项目主键ID
 var isMulti = true;
 
 var tendererId = [];	//	存招标人Id ，在添加其他招标人时查重
 var tendererArr = []; 	//存招标人信息，方便添加与删除招标人信息后保存时的数组下标值
 var enterpriseId = '';	//当前登陆人企业Id
 var fileId = '';//保存文件到附件表时传回来的文件ID
 var fileList = [] ;//保存文件信息
 
 var fileUploads = null;
 var employeeInfo = entryInfo();//当前登录人信息
 $(function(){
 	//数据初始化
 	//initData();
 	initSelect('.select');
 	usersupplier();
 	// 初始化省市联动
	getRegion = new GetRegion("#areaBlock", {name: "regionCode", status:1});
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
	}else {
		//获取行业列表
	 	$(".proIndustriesType").dataLinkage({
			optionName:"INDUSTRIES_TYPE",		
			selectCallback:function(code){
				console.log("code："+code);
				industriesType = code;
			}
		});
	}
 	
// 	$(".pageModel").height($("body").height()-54);
 	
 	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//保存
	$("#btnSave").click(function(){
		saveForm(true);
	});
	//提交
	$("#btnSubmit").click(function(){
		if(checkForm($("#formName"))){
			saveForm(false);
		}
	});
	//选择代理机构
	$("#btnTender").click(function(){
		isMulti = false;
		openEnterprise();
	});
	//选择其他招标人
	$("#btnOtherTender").click(function(){
		isMulti = true;
		openEnterprise1();
	});
	//删除招标人
	$("#enterpriseBlock").on("click", ".btnDel", function(){
		var id = $(this).attr("data-id");
		var index = $(this).closest('tr').index();
		$(this).closest('tr').remove();
		tendererId.splice(index,1);
		tendererArr.splice(index,1);
		enterpriseHtml(tendererArr);
	});
	//上传
	$("#projectName").blur(function(){
		if($("[name='projectName']").val().replace(/,/g,'') != ""){
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/201",
					businessId: id,
					status:1,
					businessTableName:'T_PROJECT',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'PROJECT_APPROVAL_FILE'
				});
			}
		}
	});

		$('#fileLoad').on("click", function(){ 
			if($("[name='projectName']").val()==""){
				parent.layer.alert("请填写项目名称",{icon:7,title:'提示'});
				return;
			}
			saveForm('true');
			if(id && id!=""){
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/201",
						businessId: id,
						status:1,
						businessTableName:'T_PROJECT',  //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode:'PROJECT_APPROVAL_FILE'
					});
				}
			}
		});

	//删除文件
	$("#fileList").on('click','.btnDel',function(){
		var delId = $(this).closest('td').attr('data-file-id');	//要删除的文件对应的文件ID
		var delTr = $(this).closest('tr');	// 列表中要删除的行
		var delIndex = $(this).closest('tr').index();
		$.ajax({
				type:'post',
				url: fileDelUrl,
				data: {
					'id':delId
				},
				success: function(data){
					if(data.success){
						fileList.splice(delIndex,1);
						delTr.remove();
						fileTable(fileList);
					}
				},
				error: function(){
					parent.layer.alert(msg);
				}
			})
	})
	//下载文件
	$("#fileList").on('click','.downloadModel',function(){
		var road = $(this).closest('td').attr('data-file-url');	// 下载文件路径
		var fileName = $(this).closest('td').attr('data-file-name');	// 下载文件路径
		$(this).attr('href',$.parserUrlForToken(fileDownload+'?ftpPath='+road+'&fname='+fileName))
			
	})
	
	
	
});
 
 function fileUpload(id){
		$("#fileLoad").unbind("click");
		var name = '';// 文件名
		var path = ''; //文件返回路径
		var type = '';//文件类型
		
		enterpriseId = employeeInfo.enterpriseId;//企业ID
		var config = {
	   		multipleFiles: false, // 多个文件一起上传, 默认: false 
		   /* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
		    browseFileBtn : " ", /** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
		    filesQueueHeight : 0, /** 文件上传容器的高度（px）, 默认: 450 */
		    messagerId:'',//显示消息元素ID(customered=false时有效)
		    frmUploadURL : flashFileUrl, // Flash上传的URI 
		    uploadURL : fileUrl ,//HTML5上传的URI 
		    browseFileId:"fileLoad",//文件选择DIV的ID
		    autoUploading: true,//选择文件后是否自动上传
		    autoRemoveCompleted:true,//文件上传后是否移除
		    postVarsPerFile : {
				//自定义文件保存路径前缀
				basePath:"/"+enterpriseId+"/"+id+"/201",
				Token:$.getToken()
			},
		    onComplete: function(file){/** 单个文件上传完毕的响应事件 */
		    	name=file.name;//文件名称
		    	path=JSON.parse(file.msg).data.filePath;//后台返回的文件路径
		    	type=file.name.split(".").pop(); //文件的后缀  文件类型
		    	
		    	
		    	var length = $('#fileList tbody tr').length + 1;//添加上去的文件序号
		    	if(path){
		    		//保存文件到附件表
					$.ajax({
						type:'post',
						url: fileAddUrl,
						type:'post',
		   	dataType:'json',
						data: {
							'businessId': id,
							'businessTableName':'T_PROJECT',  //立项批复文件（项目审批核准文件）    项目表附件
							'attachmentSetCode':'PROJECT_APPROVAL_FILE',
							'attachmentCount':'1',
							'attachmentName':name,
							'attachmentType':type,
							'attachmentFileName':name,
							'url':path,
							'attachmentState':'0'
						},
						success: function(data){
							var fileData = {
								attachmentCount:'1',
								attachmentFileName:name,
								attachmentName:name,
								attachmentSetCode:"PROJECT_APPROVAL_FILE",
								attachmentState:'0',
								attachmentType:type,
								businessId:id,
								businessTableName:"T_PROJECT",
								id:data.data,
								url:path
							}
							fileList.push(fileData);
							fileId = data.data;
							//文件上传成功后在列表中显示，且可移除
							var html = $('<tr><td style="width: 60px; text-align: center;">'+length+'</td><td >'+name+'</td>'
				        	+'<td data-file-id="'+fileId+'" data-file-url="'+path+'" data-file-name="'+name+'">'
				        	+'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >'
				        	+'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button>'
				        	+'<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button></td></tr>');
				        	$('#fileList tbody').append(html);
							parent.layer.alert("上传成功",{icon:1,title:'提示'});
						},
						error: function(){
							parent.layer.alert(msg);
						}
					})
		        }
		    },
		    onSelect: function(list) {//	选择文件后的响应事件
			  	
			}
		};
		var _t = new Stream(config);
	}
 
 //获取当前登录人的企业信息,回显数据
function usersupplier(){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	//data:{id:id},
	   	success:function(data){	
	   		//sessionStorage.setItem('QYXX', JSON.stringify(data.data));//缓存综合发添加的tabs的数组
	   		if(data.success){
   				//默认回显招标人名称
   				$("[name='enterpriseName']").val(data.data.enterpriseName);
	   			$("[name='legalPerson']").val(data.data.legalPerson);
	   			$("[name='contactor']").val(employeeInfo.userName);
	   			$("[name='contactInformation']").val(employeeInfo.tel);
	   			$("[name='address']").val(data.data.enterpriseAddress);
	   			//主要招标人基本信息
	   			$("[name='tenderees[0].tendererName']").val(data.data.enterpriseName);
	   			$("[name='tenderees[0].tendererEnterprisId']").val(data.data.id);
	   			$("[name='tenderees[0].agentName']").val(data.data.agentName);
	   			$("[name='tenderees[0].legalPerson']").val(data.data.legalPerson);
	   			$("[name='tenderees[0].agentTel']").val(data.data.agentTel);
//	   			$("[name='tenderees[0].zzjg']").val(data.data.enterpriseCode);
	   			$("[name='tenderees[0].enterpriseAddress']").val(data.data.enterpriseAddress);
	   			$("[name='tenderees[0].tendererType']").val('0');
	   			$("[name='tenderees[0].tendererCodeType']").val('2');
	   			$("[name='tenderees[0].tendererCode']").val(data.data.enterpriseCode);
	   			//项目业主
				$("[name='tenderees[0].projectOwner']").val(data.data.enterpriseName);
	   		}
	   	}
	});    
};
 
 
 
 var tenderees;
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave,callback) {
 	var arr = {}, tips="";
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
 	arr.projectForm = 1;//项目来源 1为业主创建，2为代理机构创建
 	/*if(tenderees){
 		arr.tenderees = tenderees;
 	}*/
 	
 	if(!isSave){
 		//arr.isSubmit = 1;
 		arr.receiveState = 0;//接收状态  0为暂未处理，1为接收，2为拒绝，3为驳回
 		arr.relateCode = 0; //项目类别关联代码 0
 		tips="项目信息提交成功";
 	} else {
 		tips="项目信息保存成功";
 	}
 	if(id != ""){
 		arr.id = id;
 	}
 	arr.industriesType = industriesType;
 	
// 	parent.layer.confirm('确定是否提交?', {
//		icon: 3,
//		title: '询问'
//	}, function(index) {
//		parent.layer.close(index);
			$.ajax({
	         url: saveUrl,
	         type: "post",
	         data: arr,
	         success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}else{
	        		if(isSave){
	        			id = $("[name='projectId']").val();
	        			if(!id){
	        				$("[name='projectId']").val(data.data);
	        			}
	        			if(callback){
	        				callback(id);
	        			}else{
//	        				parent.layer.alert(tips, {icon: 1,title: '提示'});
	        			}
	        		}else{
	        			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
						parent.layer.close(index); //再执行关闭  
	        		}
	        	}
	            //parent.layer.alert(tips);
				parent.$("#projectList").bootstrapTable('refresh');
				//var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				//parent.layer.close(index); //再执行关闭  
	         },
	         error: function (data) {
	             parent.layer.alert("加载失败",{icon:2,title: '提示'});
	         }
		});
//	});
 	
	
 };
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
//      		fileUpload(id);
        	}
        	if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/201",
					businessId: id,
					status:1,
					businessTableName:'T_PROJECT',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'PROJECT_APPROVAL_FILE'
				});
			}
         	var arr = data.data;
         	tenderees = arr.tenderees;
         	for(var key in arr){
				if(key == "regionCode"){
         			getRegion.codeToName(arr[key]);
         		} else if(key == "industriesType"){
         			$(".proIndustriesType").dataLinkage({
						optionName:"INDUSTRIES_TYPE",
						optionValue:arr[key],
						selectCallback:function(code){
							industriesType = code;
						}
					});
         		} 
         		else if(key == "tenderees" && arr[key].length > 0){
	         			/*if(arr.tenderees[i].tendererType == 0){
	         				$("[name='tenderees[0].tendererName']").val(arr.tenderees[i].tendererName);
							$("[name='tenderees[0].tendererEnterprisId']").val(arr.tenderees[i].tendererEnterprisId);
							$("[name='tenderees[0].tendererCode']").val(arr.tenderees[i].tendererCode);
							$("[name='tenderees[0].legalPerson']").val(arr.tenderees[i].legalPerson);
							$("[name='tenderees[0].agentName']").val(arr.tenderees[i].agentName);
							$("[name='tenderees[0].agentTel']").val(arr.tenderees[i].agentTel);
							$("[name='tenderees[0].enterpriseAddress']").val(arr.tenderees[i].enterpriseAddress);
	         			}
	         		}*/
	         		var data = [];
	         		for(var i= 0; i < arr.tenderees.length; i++){
	         			if(arr.tenderees[i].tendererType == 0){
	         				for(var key in arr.tenderees[i]){
	         					$("[name='tenderees[0]."+key+"']").val(arr.tenderees[i][key]);
	         				}
	         			} else {
	         				data.push(arr.tenderees[i])
	         			}
	         		}
	         		for(var i= 0; i < data.length; i++){
         				if($.inArray(data[i].tendererEnterprisId,tendererId) == -1){
	         				tendererId.push(data[i].tendererEnterprisId);
	         				tendererArr.push(data[i]);
	         			}
	         		}
	         		enterpriseHtml(tendererArr);
         		}else if(key == "projectAttachmentFiles"){ //文件信息
//	         			var fileArr = arr.projectAttachmentFiles;
//	         			if(fileArr.length>0){
//	         				fileList = fileArr;
//	         				fileTable(fileArr);
//	         			}
					
					fileUploads.fileHtml(arr[key]);
	         			
         		} else {
            		$("[name='"+key+"']").val(arr[key]);
//					$("[id='"+key+"']").val(arr[key]);
            		$("[name='projectId']").val(arr[key='id']);
            	}
         		
           	}      	
         	//usersupplier(arr.agencyEnterprisId);
         },
         error: function (data) {
             parent.layer.alert("加载失败",{icon: 3,title: '提示'});
         }
     });
 };
 
 /*
  * 打开代理机构页面
  */
function openEnterprise(){
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "选择代理机构",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: enterpriseUrl,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//参数isMulti为false是单选
			iframeWin.passMessage({isMulti:false, callback:enterpriseCallback,enterpriseType:4});  //调用子窗口方法，传参
			
		}
	});
}

 /*
  * 打开招标人页面
  */
function openEnterprise1(){
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "选择其他招标人",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: enterpriseUrl,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//参数isMulti为false是单选
			iframeWin.passMessage({isMulti:isMulti, callback:enterpriseCallback});  //调用子窗口方法，传参
		}
	});
}

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data){
	if(isMulti){
		// 选择其他招标人时为多选，向数组tendererArr中添加选中的招标人信息，向数组tendererId中添加选中招标人的id
		for(var i = 0; i < data.length; i++){
			if($.inArray(data[i].id,tendererId) == -1){
				tendererId.push(data[i].id);
				tendererArr.push({
					tendererName:data[i].enterpriseName, 
					tendererEnterprisId:data[i].id, 
					tendererCode:data[i].enterpriseCode,
					legalPerson:data[i].legalPerson,
					agentName:data[i].agentName,
					agentTel:data[i].agentTel,
					enterpriseAddress:data[i].enterpriseAddress,
					id:""
				})
			}
		}
		enterpriseHtml(tendererArr);
		
	} else {
		var arr = [];
		for(var i = 0; i < data.length; i++){
			arr.push({
				agencyEnterprisName:data[i].enterpriseName, 
				agencyEnterprisId:data[i].id 
			})
		}
		if(arr.length != 0){
			for(var key in arr[0]){
				$("[name='"+key+"']").val(arr[0][key]);
			}
		}
	}
}
 
// 招标人代表表格
function enterpriseHtml(data){
	var html = "";
		if($("#enterpriseTab").length == 0){
			html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<thead><tr data-id="'+data.id+'">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                		<th style="width: 100px;">操作</th>\
	                	</tr></thead><tbody>';
		}
		for(var i = 0; i < data.length; i++){
			html += '<tr>\
	                    		<td>'+data[i].tendererName+'\
	                    			<input type="hidden" name="tenderees['+(i+1)+'].tendererType" value="1" />\
	                    			<input type="hidden" name="tenderees['+(i+1)+'].tendererName" value="'+data[i].tendererName+'" />\
				                    <input type="hidden" name="tenderees['+(i+1)+'].tendererEnterprisId" value="'+data[i].tendererEnterprisId+'" />\
				                    <input type="hidden" name="tenderees['+(i+1)+'].tendererCode" value="'+data[i].tendererCode+'" />\
				                    <input type="hidden" name="tenderees['+(i+1)+'].legalPerson" value="'+data[i].legalPerson+'" />\
	                    		</td>\
	                    		<td><input type="text" name="tenderees['+(i+1)+'].agentName" class="form-control" value="'+data[i].agentName+'"></td>\
	                    		<td><input type="text" name="tenderees['+(i+1)+'].agentTel" class="form-control" value="'+data[i].agentTel+'"></td>\
	                    		<td>\
	                    			<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button>\
	                    		</td>\
	                    	</tr>';
		}
		
		if($("#enterpriseTab").length == 0){
			html += '</tbody></table>';
			$("#enterpriseBlock").html("");
			$(html).appendTo("#enterpriseBlock");
		} else {
			$("#enterpriseTab tbody").html("");
			$(html).appendTo("#enterpriseTab tbody");
		}
}


//文件表格
function fileTable(data){
	$('#fileList tbody').html('');
	for(var i = 0;i<data.length;i++){
		var html = $('<tr><td style="text-align:center">'+(i+1)+'</td><td >'+data[i].attachmentFileName+'</td>'
    	+'<td data-file-id="'+data[i].id+'" data-file-url="'+data[i].url+'" data-file-name="'+data[i].attachmentFileName+'">'
    	+'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >'
    	+'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button>'
    	+'<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button></td></tr>');
    	$('#fileList tbody').append(html);
	}
}