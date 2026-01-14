//打开弹出框时加载的数据和内容。
var packageInfo="";
var AccessoryList=[], clearFileLtst=[];
var checkTypes = getUrlParam('checkTypes');//0正常  1审核未通过
var examType = getUrlParam('examType');//预审采购文件还是询比采购文件
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var type = getUrlParam('special');
var fileCheckId = getUrlParam('fileCheckId');//用于详情页面查看历史的时候用
//var examTypenum = getUrlParam('examTypenum');//预审公告还是后审公告
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var editUrlFile=top.config.bidhost+'/BidFileController/findFileList.do';//文件撤回查询
var searchUrlFile=top.config.bidhost+'/BidFileController/findNewFileList.do';//文件查询接口
var searchBidCheckId =top.config.bidhost+'/BidFileController/findBidFileCheckId.do';//文件查询接口

var deleteFileUrl=top.config.bidhost+'/BidFileController/deleteBidFile.do';
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var flieurl=top.config.bidhost+'/BidFileController/saveBidFile.do';
var urlPurchaseList = config.bidhost+'/ProjectPackageController/findProjectPackagePageList.do';
var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var isCheck=false;
if(examType==0){
	var WORKFLOWTYPE = "zgyswj";
}else{
	var WORKFLOWTYPE = "xjcgwj";
}
$(function(){
	du()
	if(type == "VIEW"){
		$("#btn_bao").hide();
		$("#btn_submit").hide();
		$(".uploaButton").html('');
		$('.employee').hide()
		// 历史记录点进来不再查历史
		if (!fileCheckId) {
			getFileHistory({
				packageId:packageInfo.id,
				examType:examType,
			})
		}
	}else if(type == "KZT"||type == "CHANGE"){
		$("#resetTable").hide();
		workflowJson()
		//$("#trHistoryFile").hide();
		if(type == "CHANGE"){
			$("#btn_bao").hide();
		}
	}
	/*start报价*/
	if (examType == 1) {
		$(".tenderTypeW").show();	
		offerFormData();
		fileList();
	}
	/*end报价*/
	
});
function du(){
	$.ajax({
		url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do',
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"packageId":packageId
		},
		success:function(data){
			if(data.success){	   	  	
				packageInfo=data.data;//包件信息	
				if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
					$('.clearFileWrap').show();
				}
				$('div[id]').each(function(){
					$(this).html(packageInfo[this.id]);
				});
			}
															
		},
		
		error:function(data){
			parent.layer.alert("获取失败")
		}
 	});
 	//文件上传初始化	
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile, 'normal');
	var clearFileInput = new FileInput();
	clearFileInput.Init("clearFileName", urlSaveAuctionFile, 'clear');
	if(type=="CHANGE"){
		$(".record").hide()
		getOfferTableData();
	}else{
		getAccessoryList();
	}	
	//setFileHistory();//加载文件上传撤回历史记录
	
};

var bidFileId = "";
function getAccessoryList() {
	bidFileId = "";
	var params = {
		"packageId": packageInfo.id,			
		'enterpriseType':'02',
		'examType':examType,
	}
	// 用于查看历史
	if (fileCheckId) params.bidFileCheckId = fileCheckId; 
	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: false,
		dataType: 'json',
		data: params,
		success: function(data) {			
			if(data.success){
				if($.isEmptyObject(data.data)){
					return
				}
				var resData = data.data;
				offerTableObj.fileCheckId = (fileCheckId?fileCheckId:resData.fileCheckId);
				bidFileId = (fileCheckId ? fileCheckId : resData.fileCheckId);
				findWorkflowCheckerAndAccp(bidFileId);

				if(data.data.bidFiles && data.data.bidFiles.length>0){
					AccessoryList = data.data.bidFiles;
					if(AccessoryList.length <= 0){
						$("#resetTable").hide();
						$("#trHistoryFile").hide();
					}/* else{
						bidFileId= AccessoryList[0].bidFileCheckId;
					}
					findWorkflowCheckerAndAccp(AccessoryList[0].bidFileCheckId); */
					
				}else{
					AccessoryList=[];
				}
				if(data.data.clearFiles && data.data.clearFiles.length>0){
					clearFileLtst = data.data.clearFiles;
				}else{
					clearFileLtst=[];
				}
			}else{
				top.layer.alert(data.message)
			}		         
		}
	});
	/* if(checkTypes == 1 && AccessoryList.length <= 0){
		//获取当前最新的一条审核记录
		$.ajax({
			type: "get",
			url: searchBidCheckId,
			async: false,
			dataType: 'json',
			data: {
				"packageId": packageInfo.id,			
				'examType':examType,
			},
			success: function(data) {			
				if(data.success==true){
					if(data.data){
						bidFileId = data.data;
						findWorkflowCheckerAndAccp(data.data);
					}								
				}			         
			}
		});
	} */
	fileTable('normal');
	if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
		fileTable('clear');
	}
};
var FileInput = function() {
	
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl, _type) {
		$("#"+ctrlName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: _type=='clear'?['xml','XML','cos','COS','hbzb','HBZB']:['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx'
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
					AccessoryList.push(
						{   					
						    fileName:data.files[0].name,
						    fileSize:data.files[0].size/1000+"KB",
						    filePath:data.response.data[0],
						    userName:(top.userName||""),
						    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
					    }
					)
				}else if(_type == 'clear'){
					clearFileLtst = [];
					clearFileLtst.push(
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

function fileTable(_type){
	var ele = '',data=[];
	if(_type == 'normal'){
		ele = 'fileTables';
		data = AccessoryList || [];
	}else if(_type == 'clear'){
		ele = 'fileTablesOfClear';
		data = clearFileLtst || [];
	}
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
					'click .previewPurchaseFile': function(e, value, row, index) {
						openPurchaseFilePreviewPage(row);
					},
					'click .filedelet':function(e, value, row, index){
						parent.layer.confirm('确定要删除该附件', {
							  btn: ['是', '否'] //可以无限个按钮
							}, function(indexs, layero){
								var itemList=new Array();
								if(_type == 'normal'){
									AccessoryList=itemList.concat(AccessoryList);
									AccessoryList.splice(index,1)
									data = AccessoryList;
								}else if(_type == 'clear'){
									clearFileLtst=itemList.concat(clearFileLtst);
									clearFileLtst.splice(index,1)
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
						if (type == 'VIEW' && row.systemStatus == 1) {
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewPurchaseFile'>预览</a>&nbsp;&nbsp"
						}
						
						return mixtbody
				}
				 
			}
		]
	});
	$('#'+ele).bootstrapTable("load", data); //重载数据
};
function add_file(num){
   var hiddeninput=""	
	//上传附件的数组。拼接成可以转到后台接受的格式
	if(AccessoryList.length>0){		
		for(var m=0;m<AccessoryList.length;m++){
	    	hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].fileName" value="'+ AccessoryList[m].fileName +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].filePath" value="'+ AccessoryList[m].filePath +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].fileSize" value="'+ AccessoryList[m].fileSize +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].subDate" value="'+ AccessoryList[m].subDate +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].examType" value="'+ examType +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].packageId" value="'+ packageInfo.id +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].projectId" value="'+ packageInfo.projectId +'" />'
	        hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].fileState" value="'+ num +'" />'
	        if(checkTypes == 1){//重新上传
	        	hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].bidFileCheckId" value="'+ (bidFileId||"") +'" />'
	        }else{
	        	hiddeninput+='<input type="hidden" name="bidFiles['+ m +'].bidFileCheckId" value="'+ (AccessoryList[m].bidFileCheckId||bidFileId||"") +'" />'	
	        }
	        
	       
	    }
		
	}
	if(clearFileLtst.length>0){
		for(var n=0;n<clearFileLtst.length;n++){
	    	hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].fileName" value="'+ clearFileLtst[n].fileName +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].filePath" value="'+ clearFileLtst[n].filePath +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].fileSize" value="'+ clearFileLtst[n].fileSize +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].subDate" value="'+ clearFileLtst[n].subDate +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].examType" value="'+ examType +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].packageId" value="'+ packageInfo.id +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].projectId" value="'+ packageInfo.projectId +'" />'
	        hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].fileState" value="'+ num +'" />'
	        if(checkTypes == 1){//重新上传
	        	hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].bidFileCheckId" value="'+ (bidFileId||"") +'" />'
	        }else{
	        	hiddeninput+='<input type="hidden" name="clearFiles['+ n +'].bidFileCheckId" value="'+ (clearFileLtst[n].bidFileCheckId||bidFileId||"") +'" />'	
	        }
	        
	       
	    }
		
	}
	$("#formFile").html(hiddeninput);   
};
//审核确定按钮
$("#btn_submit").click(function() {
	if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
		if(type == "CHANGE"){
			if(clearFileLtst.length==0 && AccessoryList.length==0) {
				parent.layer.alert("请上传采购文件或清单文件");
				return;
			}
		}else{
			if(clearFileLtst.length==0) {
				parent.layer.alert("请上传清单文件");
				return;
			};
			if(AccessoryList.length==0) {
				parent.layer.alert("请上传采购文件");
				return;
			};
		}
	}else{
		//未选择结果时提示
		if(AccessoryList.length==0) {
			parent.layer.alert("请上传采购文件");
			return;
		};
	}
	if(examType==1 && $("input[name='isOfferDetailedItem']:checked").val()==0){
		if(fileUp.options.filesDataDetail.length==0){

			parent.layer.alert("请上传分项报价表模板");        		
			return false;
		}
	} 
	//提交审核结果   
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			add_file(1)
			$.ajax({
				type: "post",
				url: flieurl,
				async: false,
				data: $("#formFile").serialize()+'&fileState=1&tenderType=0'+getPriceParams(),
				success: function(data) {
					if(data.success) {	
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						top.layer.alert("提交成功");
						getAccessoryList();
						parent.$('#table').bootstrapTable('refresh');
						parent.layer.close(parent.layer.getFrameIndex(window.name));
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		});
	} else {
		if($("#employeeId").val()==""){ 
			parent.layer.alert("请选择审核人");
	 		return;
		}; 
		add_file(1)
       	$.ajax({
			type: "post",
			url: flieurl,
			async: false,
			data: $("#formFile").serialize()+'&checkerId='+$('#employeeId').val()+'&fileState=1&tenderType=0'+getPriceParams(),
			success: function(data) {
				if(data.success) {
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}	
					top.layer.alert("提交审核成功");
					getAccessoryList();
					parent.$('#table').bootstrapTable('refresh');
					parent.layer.close(parent.layer.getFrameIndex(window.name));
				} else {
					top.layer.alert(data.message);
				}
			}
		});
	}
	
});
//保存
$("#btn_bao").click(function () {
	//未选择结果时提示
	if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
		if(type == "CHANGE"){
			if(clearFileLtst.length==0 && AccessoryList.length==0) {
				parent.layer.alert("请上传采购文件或清单文件");
				return;
			}
		}else{
			if(clearFileLtst.length==0) {
				parent.layer.alert("请上传清单文件");
				return;
			};
			if(AccessoryList.length==0) {
				parent.layer.alert("请上传采购文件");
				return;
			};
		}
	}else{
		//未选择结果时提示
		if(AccessoryList.length==0) {
			parent.layer.alert("请上传采购文件");
			return;
		};
	}
	add_file(0)
	//提交审核结果   
	$.ajax({
		type: "post",
		url: flieurl,
		async: false,
		data: $("#formFile").serialize()+'&fileState=0&tenderType=0'+getPriceParams(),
		success: function(data) {
			if(data.success) {
				top.layer.alert("保存成功");
				getAccessoryList();
				parent.$('#table').bootstrapTable('refresh');
			} else {
				top.layer.alert(data.message);
			}
		}
	});
});

//挂载采购文件上传撤回请求
function setFileHistory(data) {
	$.ajax({
		type: "post",
		url: editUrlFile,
		dataType: 'json',
		data: {
			"packageId": packageInfo.id,
			"projectId":packageInfo.projectId,
			'examType':examType,
			'isView':1
		},
		async: true,
		success: function(result) {
			if(result.success) {
				setFileHistoryHTML(result.data) //有记录显示
			} else {
				top.layer.alert(result.message);
			}
		}
	})
}


//挂载采购文件撤回记录
function setFileHistoryHTML(data) {

	$("#historyFileTable").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				align: "left",
				title: "文件名称",
			}, {
				field: "fileState",
				align: "center",
				title: "文件状态",
				formatter: function(value, row, index) {
					if(row.fileState == 2){
						return '已撤回';
					}
				}
			}, {
				title: "撤回人",
				align: "center",
				field: 'editUserName'
			},
			{
				title: "撤回时间",
				align: "center",
				field: 'editDate'
			}
		]

	})
	$("#historyFileTable").bootstrapTable('load', data);
	$(".fixed-table-loading").hide();
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

function workflowJson(){
	if(examType==1){
	    var workflowCode='xjcgwj'
	}else if(examType==0){
		var workflowCode='zgyswj'
	}
	//获取审核人列表
	$.ajax({
		   	url:WorkflowUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"workflowLevel":0,
		   		"workflowType":workflowCode
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
}

function openPurchaseFilePreviewPage(row) {
	parent.layer.open({
		type: 2,
		title: '采购文件预览',
		id: 'packageSet',
		area: ['80%', '90%'],
		content: 'bidPrice/Public/PurchaseFilePreview/PurchaseFilePreview.html?packageId=' + row.packageId + '&examType=' + row.examType + '&id=' + row.id+ '&bidFileCheckId=' + bidFileId,
	});
}

// 获取报价表所用到的数据及参数
function getOfferTableData() {
	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: false,
		dataType: 'json',
		data: {
			"packageId": packageInfo.id,			
			'enterpriseType':'02',
			'examType':examType,
		},
		success: function(data) {			
			if(data.success){
				if($.isEmptyObject(data.data)){
					return
				}
				offerTableObj.fileCheckId = data.data.fileCheckId;
			}else{
				top.layer.alert(data.message)
			}		         
		}
	});

};