 var saveUrl = config.AuctionHost + '/ControlPriceController/save.do'; // 保存、提交的接口
 var bidDetail = config.AuctionHost + '/ControlPriceController/findDetailByPackageId.do'; //根据标段id查询详情
 var WorkflowUrl=config.AuctionHost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
 var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
 var deleteFileUrl=top.config.AuctionHost+'/PurFileController/delete.do';//删除附件
 var downloadFileUrl = config.FileHost + '/FileController/download.do';//下载文件
 var changeUrl = config.AuctionHost + '/ControlPriceController/getChangeControlPrice.do';  //变更接口
 var packageId = ""; //包件id
 var controlpriceid = ""; //控制价id
 var priceFileList=[], normalFileList=[], packageInfo;//控制价文件 附件 包件信息
 var type = $.getUrlParam('special'); //控制台传过来的参数
 var isHasDetailedListFile = '';
 var isCheck=false;
var WORKFLOWTYPE = "kzjsp";
 $(function() {
	//下拉框数据初始化
	initSelect('.select');

 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
 		packageId = $.getUrlParam("id");
 	}
 	if(type == "VIEW"){
 		$("#btn_bao").hide();
 		$("#btn_submit").hide();
 		// $("#trUploadFile").hide();
 		$('.employee').hide()
 	}else if(type == "KZT"||type == "CHANGE"){
 		// $("#resetTable").hide();
 		workflowJson()
 		//$("#trHistoryFile").hide();
 		if(type == "CHANGE"){
 			$("#btn_bao").hide();
 		}
 	}
	packageInfo = getPackageDetail(packageId);
	isHasDetailedListFile = (packageInfo.isHasDetailedListFile || packageInfo.isHasDetailedListFile == 0)?packageInfo.isHasDetailedListFile:'';
 	if(isHasDetailedListFile == 1){
		$('#headingTwo .red').show();
		$('#priceFileName').prop('accept','.xml,.cos');
	}else{
		$('#headingTwo .red').hide();
		$('#priceFileName').prop('accept','.jpg,.bmp,.png,.jpeg,.pdf,.zip,.rar,.doc,.docx,.xls,.xlsx');
	}
	var isContinu = true;
 	if(type == 'CHANGE') {
 		$.ajax({
 			type: "post",
 			url: changeUrl,
 			async: false,
 			dataType: "json", //预期服务器返回的数据类型
 			data: {
 				'packageId': packageId
 			},
 			beforeSend: function(xhr) {
 				var token = $.getToken();
 				xhr.setRequestHeader("Token", token);
 			},
 			success: function(data) {
 				if(data.success) {
 					getBidInfo(packageId);
 				} else {
 					parent.layer.alert(data.message, {
 						icon: 7,
 						title: '提示'
 					});
 					isContinu = false;
 				}
 			},
 			error: function() {
 				parent.layer.alert("变更失败！");
 				isContinu = false;
 			}
 		});
 	} else {
 		getBidInfo(packageId);
 	}
 	if(!isContinu) {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 		return
 	}
	//文件上传初始化
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile, 'normal');
	var clearFileInput = new FileInput();
	clearFileInput.Init("priceFileName", urlSaveAuctionFile, 'price');
 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});
	//保存
	$("#btnSave").click(function() {
		saveForm(true, true);
	});
	//提交
	$("#btnSubmit").click(function() {
		if($.trim($('#controlPrice').val()) == ''){
			parent.layer.alert('请输入控制价');
			return
		}
		/* if(priceFileList.length == 0){
			parent.layer.alert('请上传控制价清单');
			return
		} */
		if(isCheck) {
			parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
				title: '提交审核',
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					saveForm(false, false);
				},
				btn2:function(index, layero) {
					parent.layer.close(index);
				}
			})
		} else {
			if($("#employeeId").val()==""){
				parent.layer.alert("请选择审核人");
				return;
			};
			parent.layer.alert('确认提交审核？', function(index) {
				saveForm(false, false);
			})
		}
		
	
	});
 });

 var FileInput = function() {
 	
 	var oFile = new Object();
 	//初始化fileinput控件（第一次初始化）
 	oFile.Init = function(ctrlName, uploadUrl, _type) {
 		$("#"+ctrlName).fileinput({
 			language: 'zh', //设置语言
 			uploadUrl: uploadUrl, //上传的地址
 			uploadAsync: false,
 			autoReplace: false,
 			allowedFileExtensions:  (_type=='price'&&isHasDetailedListFile==1)?['xml', 'XML', 'cos', 'COS']:['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx'
 				,'JPG', 'BMP', 'PNG','JPEG','PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
 			showUpload: false, //是否显示上传按钮  
 			showCaption: false, //是否显示标题  
 			browseClass: "btn btn-primary", //按钮样式       
 			dropZoneEnabled: false, //是否显示拖拽区域  
 			//maxFileCount: 1, //表示允许同时上传的最大文件个数
 			showPreview :false,
 			layoutTemplates:{
 				actionDelete:"",
 				actionUpload:""
 			},
 //			//上传参数
 //			uploadExtraData:function(){//向后台传递参数
 //	            var path=''
 //                return path; 
 //              },
 
 		}).on("filebatchselected", function (event, files) {
 			var filesnames=event.currentTarget.files[0].name.split('.')[1]
 			if(event.currentTarget.files.length>1){
 				parent.layer.alert('单次上传文件数只能为1个');				
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
 				if(_type == 'normal'){
 					normalFileList.push(
 						{   					
 						    fileName:data.files[0].name,
 						    fileSize:data.files[0].size/1000+"KB",
 						    filePath:data.response.data[0],
 						    userName:(top.userName||""),
 						    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
 					    }
 					)
 				}else if(_type == 'price'){
					priceFileList = [];
 					priceFileList.push(
 						{   					
 						    fileName:data.files[0].name,
 						    fileSize:data.files[0].size/1000+"KB",
 						    filePath:data.response.data[0],
 						    userName:(top.userName||""),
 						    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
 					    }
 					)
 				}
 				
 			}
 			
 			fileTable(_type)
 		}).on('filebatchuploaderror', function(event, data, msg) {
 			parent.layer.msg("失败");
 		});
 	}
 	return oFile;
 };

 //小写金额转大写
 function priceChange() {
 	var val = $("[name='controlPrice']").val().replace(/,/g, '');
 	$("[name='controlPrice']").val(digitToThousands(val));

 	if(val == "") {
 		$("[name='controlPriceUpper']").val("");
 	} else {
 		$("[name='controlPriceUpper']").val(digitUppercase(val));
 	}
 }

 function priceInputs(e, num) {
 	var regu = /^[0-9\,]+\.?[0-9]*$/;
 	if(e.value != "") {
 		if(!regu.test(e.value)) {
 			parent.layer.alert("请输入正确的数字", function(index) {
 				parent.layer.close(index);
 				//				e.value = e.value.substring(0, e.value.length - 1);
 				e.focus();
 			});
 			e.value = "";

 		} else {
 			if(num == 0) {
 				if(e.value.indexOf('.') > -1) {
 					e.value = e.value.substring(0, e.value.length - 1);
 					e.focus();
 				}
 			}
 			if(e.value.indexOf('.') > -1) {
 				if(e.value.split('.')[1].length > num) {
 					e.value = e.value.substring(0, e.value.length - 1);
 					e.focus();
 				}
 			}
 		}
 	}
 	priceChange();
 }

 /*
  * 表单提交
  * isSave: true保存， false提交  
  * isTips: true有提示  false无提示
  */
 function saveForm(isSave, isTips) {
 	var arr = {}, tips = "";
	add_file()
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	arr.interfaceName = $('[name=interfaceCode ] option:selected').html();
 	if(arr.controlPrice && arr.controlPrice != "") {
 		arr.controlPrice = Number(arr.controlPrice.replace(/,/g, ''));
 	}

 	if(!isSave) {
 		arr.checkState = 1;
		arr.isSubmit = 1;
 		tips = "控制价提交成功";
 	} else {
		arr.checkState = 0;
 		tips = "控制价保存成功";
 	}
 	if(packageId != "") {
 		arr.packageId = packageId;
 	}
 	if(controlpriceid != "") {
 		arr.id = controlpriceid;
 	}
 	$.ajax({
 		url: saveUrl,
 		type: "post",
 		data: arr,
 		async: false,
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			} else {

 				//	        		parent.tools.refreshFather();
 				if(isSave) {
 					controlpriceid = data.data;
 					if(isTips) {
 						top.layer.alert("保存成功");
 					}

 				} else {
 					parent.layer.alert(tips);
 					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 					parent.layer.close(index); //再执行关闭  
 				}
 				parent.$('#tabList').bootstrapTable('refresh');
 			}
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败", {
 				icon: 2,
 				title: '提示'
 			});
 		}
 	});
 	//	});

 };
 function getBidInfo(id) {
 	$.ajax({
 		type: "post",
 		url: bidDetail,
 		async: true,
 		data: {
 			'packageId': id
 		},
 		success: function(data) {
 			if(data.success) {
 				if(data.data) {
 					var res = data.data;
 					if(res.id) {
 						controlpriceid = res.id;
						findWorkflowCheckerAndAccp(controlpriceid);
 					}
 					for(var key in res) {
 						if(key == "cleanFiles") {
							priceFileList=res[key];
							fileTable('price');
 						}else if(key == "otherFiles"){
							normalFileList=res[key];
							fileTable('normal');
						}else if(key == "isControlPrice"){
							$('[name=isControlPrice]').val([res[key]]);
						} else {
							if(key != 'employeeId'){
								$('#' + key).html(res[key]);
								$('[name=' + key + ']').val(res[key]);
							}
 						}

 					}
 				}else{
					$('#packageNum').html(packageInfo.packageNum);
					$('#packageName').html(packageInfo.packageName);
				}

 			} else {
 				top.layer.alert(data.message)
 			}
 		}
 	});
 };
 function workflowJson(){
 	//获取审核人列表
 	$.ajax({
 		   	url:WorkflowUrl,
 		   	type:'get',
 		   	dataType:'json',
 		   	async:false,
 		   	data:{
 		   		"workflowLevel":0,
 		   		"workflowType":'kzjsp'
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
 		   	   if(data.success==true){
 		   	   	 $('.employee').show()
 		   	   	 if(data.data.length==0){
 			   	   	option='<option>暂无审核人员</option>'
 			   	   }
 			   	   if(data.data.length>0){
 			   	   	workflowData=data.data
 			   	   	option="<option value=''>请选择审核人员</option>"
 			   	   	 for(var i=0;i<data.data.length;i++){
 				   	   	 option+='<option value="'+data.data[i].employeeId+'">'+data.data[i].userName+'</option>'
 				   	}
 			   	   }		   	   			   	  			   	  
 		   	   }		   	    
 		   	   $("#employeeId").html(option);	
 		   	}
 	});
 };
 //文件列表
 function fileTable(_type){
 	var ele = '',data=[];
 	if(_type == 'normal'){
 		ele = 'fileTables';
 		data = normalFileList;
 	}else if(_type == 'price'){
 		ele = 'priceFileTables';
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
 					'click .filedelet':function(e, value, row, index){
 						parent.layer.confirm('确定要删除该附件', {
 							  btn: ['是', '否'] //可以无限个按钮
 							}, function(indexs, layero){
								let itemList=new Array();
								if(_type == 'normal'){
									normalFileList=itemList.concat(normalFileList);
									normalFileList.splice(index,1);
								}else if(_type == 'price'){
									priceFileList=itemList.concat(priceFileList);
									priceFileList.splice(index,1);
								}
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
												
											}else{
												top.layer.alert(data.message)
											}
 									   }
 								   });   
 							   	}
 								fileTable(_type)	
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
 						if(type != "VIEW"){
 							mixtbody+='<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
 						}              
 						return mixtbody
 				}
 				 
 			}
 		]
 	});
 	$('#'+ele).bootstrapTable("load", data); //重载数据
 };
 //保存提交时文件处理
 function add_file(num){
    var hiddeninput=""	
 	//上传附件的数组。拼接成可以转到后台接受的格式
 	if(priceFileList.length>0){		
 		for(var m=0;m<priceFileList.length;m++){
 	    	hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].fileName" value="'+ priceFileList[m].fileName +'" />'
 	        hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].filePath" value="'+ priceFileList[m].filePath +'" />'
 	        hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].fileSize" value="'+ priceFileList[m].fileSize +'" />'
 	        hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].subDate" value="'+ priceFileList[m].subDate +'" />'
 	        hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].id" value="'+ (priceFileList[m].id?priceFileList[m].id:'') +'" />'
 	        // hiddeninput+='<input type="hidden" name="cleanFiles['+ m +'].examType" value="'+ examType +'" />'
 	        // hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].packageId" value="'+ packageInfo.id +'" />'
 	        // hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].projectId" value="'+ packageInfo.projectId +'" />'
 	        // hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].fileState" value="'+ num +'" />'
 	        // if(checkTypes == 1){//重新上传
 	        // 	hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].bidFileCheckId" value="'+ (bidFileId||"") +'" />'
 	        // }else{
 	        // 	hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].bidFileCheckId" value="'+ (priceFileList[m].bidFileCheckId||bidFileId||"") +'" />'	
 	        // }
 	        
 	       
 	    }
 		
 	}
 	if(normalFileList.length>0){
 		for(var n=0;n<normalFileList.length;n++){
 	    	hiddeninput+='<input type="hidden" name="otherFiles['+ n +'].fileName" value="'+ normalFileList[n].fileName +'" />'
 	        hiddeninput+='<input type="hidden" name="otherFiles['+ n +'].filePath" value="'+ normalFileList[n].filePath +'" />'
 	        hiddeninput+='<input type="hidden" name="otherFiles['+ n +'].fileSize" value="'+ normalFileList[n].fileSize +'" />'
 	        hiddeninput+='<input type="hidden" name="otherFiles['+ n +'].subDate" value="'+ normalFileList[n].subDate +'" />'
			hiddeninput+='<input type="hidden" name="otherFiles['+ n +'].id" value="'+ (normalFileList[n].id?normalFileList[n].id:'') +'" />'
 	        // hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].examType" value="'+ examType +'" />'
 	        // hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].packageId" value="'+ packageInfo.id +'" />'
 	        // hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].projectId" value="'+ packageInfo.projectId +'" />'
 	        // hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].fileState" value="'+ num +'" />'
 	        // if(checkTypes == 1){//重新上传
 	        // 	hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].bidFileCheckId" value="'+ (bidFileId||"") +'" />'
 	        // }else{
 	        // 	hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].bidFileCheckId" value="'+ (normalFileList[n].bidFileCheckId||bidFileId||"") +'" />'	
 	        // }
 	    }
 	}
 	$("#formFile").html(hiddeninput);   
 };
