var WorkflowUrl=top.config.AuctionHost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var deleteFileUrl=top.config.AuctionHost+'/BidFileController/deleteBidFile.do';
var downloadFileUrl = top.config.FileHost + '/FileController/download.do';//下载文件
var saveUrl = top.config.AuctionHost + '/OwnerDeclarationController/saveOrUpdate.do';//保存
var detailUrl = top.config.AuctionHost + '/OwnerDeclarationController/getDetail.do';//详情
var isCanSignIn = 0;
var ownerDeclarationState = $.getUrlParam('ownerDeclarationState');
var isStopCheck = $.getUrlParam('isStopCheck');
var projectId = $.getUrlParam('projectId');
var packageId = $.getUrlParam('packageId');
var examType = $.getUrlParam('examType');
var type = $.getUrlParam('type');
var isCheck, WORKFLOWTYPE='fzbcnsqdsz',AccessoryList=[];
$(function(){
	if(type == 'report'){
		WORKFLOWTYPE='fzbpsbgqdsz';
		saveUrl = top.config.AuctionHost + '/OwnerDeclarationController/saveOrUpdateReport.do';//保存
	}
	if($.getUrlParam('isCanSignIn') == 1 && ownerDeclarationState != 1 && ownerDeclarationState != 2 && isStopCheck != 1){
		isCanSignIn = 1
	}
	if(isCanSignIn == 1){//编辑
		$('.employee, [name=description], .offerBtn, .fileloading').show();
		getCeheckers();
		var oFileInput = new FileInput();
		oFileInput.Init("FileName", urlSaveAuctionFile, 'normal');
	}else{
		$('.offerBtn, .fileloading, .red').hide()
		$('#description').show();
	}
	getDetail();
});
function passMessage(callback){
	$('#btn_close').click(function(){
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	$('#btn_bao').click(function(){
		save(0, callback)
	});
	$('#btn_submit').click(function(){
		if($.trim($('[name=description]').val()) == ''){
			top.layer.alert('请输入说明');
			return
		}
		if(AccessoryList.length < 1){
			top.layer.alert('请上传附件');
			return
		}
		if(!isCheck && $("#employeeId").val()==""){
			parent.layer.alert("请选择审核人");        		     		
			 return false;      	
		};
		if(isCheck) {
			top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
				save(1, callback)
			})
		}else{
			save(1, callback)
		}
		
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
			'type': type == 'report'?'1':'0'
		},
		success:function(data){	
		    if(data.success){
				if(data.data){
					if(isCanSignIn == 1){//编辑
						$('[name=description]').val(data.data.description);
					}else{
						$('#description').html(data.data.description);
					}
					findWorkflowCheckerAndAccp(data.data.id)
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
function save(type, callback){
	var saveData = {};
	saveData.projectId = projectId;
	saveData.packageId = packageId;
	saveData.examType = examType;
	saveData.status = type;
	saveData.checkerId = $.trim($('[name=checkerId]').val());
	saveData.description = $.trim($('[name=description]').val());
	saveData.fileList = AccessoryList;
	$.ajax({
		url: saveUrl,
		type:'get',
		dataType:'json',
		async:false,
		data: saveData,
		success:function(data){	
		    if(data.success){
				if(type == 1){
					top.layer.alert('提交成功');
					parent.layer.close(parent.layer.getFrameIndex(window.name));
				}else{
					top.layer.alert('保存成功')
				}
				callback(type)
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
/* 审核人 */
function getCeheckers(){
	//获取审核人列表
	$.ajax({
		url:WorkflowUrl,
		type:'get',
		dataType:'json',
		async:false,
		data: {
			"workflowLevel": 0,
			"workflowType": WORKFLOWTYPE
		},
		success:function(data){	
			
			var option=""
			//判断是否有审核人		   
			if(data.message==0){	
				isCheck = true;
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide()
				return;
			};
			if(data.message==2){		   	   	
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				massage2=data.message;
				return;
			};
			var checkerId = ''; 
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data){
					if(data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if(data.data.workflowCheckers.length > 0) {
						
						if(data.data.employee){
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for(var i = 0; i < checkerList.length; i++) {
							
							if(checkerId != '' && checkerList[i].employeeId == checkerId){
								option += '<option value="' + checkerList[i].employeeId  + '" selected="selected">' + checkerList[i].userName + '</option>'
							}else{
								option += '<option value="' + checkerList[i].employeeId  + '">' + checkerList[i].userName + '</option>'	
							}
							
						}
					}
				}else{
					option = '<option>暂无审核人员</option>'
				}
			}		   	    
			$("#employeeId").html(option);	
		}
	});
}
/* 附件 */
var FileInput = function() {
	
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function() {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: urlSaveAuctionFile, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx','JPG', 'BMP', 'PNG','JPEG','PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			maxFileSize: 209715200,
			showPreview :false,
			layoutTemplates:{
				actionDelete:"",
				actionUpload:""
			},

		}).on("filebatchselected", function (event, files) {
			var filesnames=event.currentTarget.files[0].name.split('.')[1]
			if(event.currentTarget.files.length>1){
				parent.layer.alert('单次上传文件数只能为1个');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			}
			var totalSize = 0;
			for(var i=0;i<AccessoryList.length;i++){
				totalSize += Number(AccessoryList[i].fileSize.split('K')[0])
			}
			totalSize += event.currentTarget.files[0].size/1000;
			if(totalSize > 200000){
				parent.layer.alert('业主声明材料附件总和最大不超过200M');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
			if (data.response.success===false) { 
				parent.layer.alert(data.response.message);
				$(this).fileinput("reset"); 
				return;
			}
			if(data.response.success){
				AccessoryList.push(
					{   					
						fileName:data.files[0].name,
						fileSize:data.files[0].size/1000+"KB",
						filePath:data.response.data[0],
						userName:(top.userName||""),
						subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
					}
				)
				
			}
			
			fileTable()
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

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
					'click .filedelet':function(e, value, row, index){
						parent.layer.confirm('确定要删除该附件', {
							  btn: ['是', '否'] //可以无限个按钮
							}, function(indexs, layero){
								var itemList=new Array();
								AccessoryList=itemList.concat(AccessoryList);
								AccessoryList.splice(index,1)
								data = AccessoryList;
								if(row.id!=undefined){
									$.ajax({
									   type: "post",
									   url: deleteFileUrl,
									   async: false,
									   dataType: 'json',
									   data: {
										   "id":row.id ,		
									   },
									   success: function(data) {	
										   if(data.success){
											
										   }	
									   }
								   });   
							   	}
								fileTable()	
							  	parent.layer.close(indexs);			 
							}, function(indexs){
							   parent.layer.close(indexs)
							}); 
					},
				},
				formatter:function(value, row, index){	
					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody=""  
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
						}
						if(isCanSignIn == 1){
							mixtbody+='<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
						}
						return mixtbody
				}
				 
			}
		]
	});
	$('#'+ele).bootstrapTable("load", data); //重载数据
};
