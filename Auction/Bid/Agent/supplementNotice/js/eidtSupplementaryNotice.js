function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var packageInfo={};
var AccessoryList=[];
var urlSaveAuctionFile=top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var saveProjectPackage=top.config.bidhost+"/ProjectSupplementController/saveProjectSupplySupplement.do";
var findProjectPackageInfo=top.config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do';
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var examType;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var noticeType
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var keyId=getUrlParam('keyId');
$(function(){
	if(keyId){
		du(keyId)
	}else{
		packa(packageId);
		$('div[id]').each(function(){		
			$(this).html(packageInfo[this.id]);		
		});
		$("#noticeType").html(noticeType==1?'邀请函':'采购公告');
		$("#packageId").val(packageId);
		$("#projectId").val(projectId);
		$('input[name="isChangeDate"][value=0]').attr('checked',true);
		$("#timeList").hide()
		$(".ageinTime").val("");
	}
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	fileTable();		
})
function du(uid){
	$.ajax({
	   	url:config.bidhost+'/ProjectSupplementController/findSupplyInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"id":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){
				supplimentData=data.data;
				noticeType=supplimentData.noticeType
	   	  		AccessoryList=supplimentData.purFiles
	   	  	}	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	
	packa(supplimentData.packageId);
		
	if(supplimentData.isChangeDate==1){
		$("#timeList").show();		
	}else{
		$("#timeList").hide()
		$(".ageinTime").val("");
		
	};
	$('input[name]').each(function(){	
		if(this.name!=='isChangeDate'){
			$(this).val(supplimentData[this.name]);
			if(reg.test(supplimentData[this.name])){
				$(this).val(supplimentData[this.name].substring(0,16));
			}
		}			
	});
	$('div[id]').each(function(){		
		if(reg.test(packageInfo[this.id])){
			$(this).html(packageInfo[this.id].substring(0,16));
		}			
	});
	if(packageInfo.examType==1){
		$("#acceptEndDate").val(packageInfo.acceptEndDate)
	}
	$('#packageName').html(supplimentData.packageName);
	$('#packageNum').html(supplimentData.packageNum);	
	$("#noticeType").html(noticeType==1?'邀请函':'采购公告');
	$('input[name="isChangeDate"][value='+ supplimentData.isChangeDate +']').attr('checked',true);
	
	ue.ready(function() {
		ue.setContent(supplimentData.remark||'');	
		//ue.execCommand('insertHtml',packageInfo.examRemark);
	});
};
function packa(uid){
	$.ajax({
	   	url:findProjectPackageInfo,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){
				packageInfo=data.data;
				noticeType=packageInfo.noticeType;
	   	  	if(noticeType==0){
				examType=packageInfo.examType;
				datetimepickers(packageInfo.examType);		
			}else{
				examType=1;
				examDatetimepicker(packageInfo.examType);								
			};
			$("#examType").val(examType)
	   	  }
	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});			
};
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx'
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

		}).on("filebatchselected", function(event, files) {
			var filesnames=event.currentTarget.files[0].name.split('.')[1]
			if(event.currentTarget.files.length>1){
				parent.layer.alert('单次上传文件数只能为1个');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			}
			if(event.currentTarget.files[0].size>2*1024*1024*1024){
				parent.layer.alert('上传的文件不能大于2G');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			};			
	        $(this).fileinput("upload");						
	}).on("filebatchuploadsuccess", function(event, data, previewId, index) {			
			AccessoryList.push(
				{   					
				    fileName:data.files[0].name,
				    fileSize:data.files[0].size/1000+"KB",
				    filePath:data.response.data[0],
				    userName:top.userName||"",
				    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
			    }
			)
			fileTable()
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};
$("input[name='isChangeDate']").on('change',function(){
	if($(this).val()==1){
		$("#timeList").show()
//		datetimepicker($("#examType").val());
	
	}else{
		$("#timeList").hide()
		$(".ageinTime").val("")
	}
})
function fileTable(){
	$('#fileTables').bootstrapTable({
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
				halign: "center",
				align: "center",
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
							    fileTable();							    
							  parent.layer.close(indexs);			 
							}, function(indexs){
							   parent.layer.close(indexs)
							}); 
					},
				},
				formatter:function(value, row, index){	
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody=""  
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
				if(row.fileState==1){
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
					}
				}else{
					mixtbody+='<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
					}
				}               
				return mixtbody
				}
				 
			}
		]
	});
	$('#fileTables').bootstrapTable("load", AccessoryList); //重载数据
};
function add_file(){
   var hiddeninput=""	
	//上传附件的数组。拼接成可以转到后台接受的格式
	if(AccessoryList.length>0){		
		for(var m=0;m<AccessoryList.length;m++){
	    	hiddeninput+='<input type="hidden" name="purFiles['+ m +'].fileName" value="'+ AccessoryList[m].fileName +'" />'
	        hiddeninput+='<input type="hidden" name="purFiles['+ m +'].filePath" value="'+ AccessoryList[m].filePath +'" />'
	        hiddeninput+='<input type="hidden" name="purFiles['+ m +'].fileSize" value="'+ AccessoryList[m].fileSize +'" />'
	        hiddeninput+='<input type="hidden" name="purFiles['+ m +'].subDate" value="'+ AccessoryList[m].subDate +'" />'
	        hiddeninput+='<input type="hidden" name="purFiles['+ m +'].examType" value="'+ examType +'" />'	       
	    }
		
	}	
	$("#formFile").html(hiddeninput);   
};
$("#btn_bao").click(function() {
	if($('#title').val()==""){
		parent.layer.alert("请填写标题");        		     		
		return false;
	};	
	restlut(0)
});
//审核确定按钮
$("#btn_submit").click(function() {
	if($('#title').val()==""){
		parent.layer.alert("请填写标题");        		     		
		return false;
	};
	if($("input[name='isChangeDate']:checked").val()==1){
		if(timeCheck($("#timeList"),'change',restlut)){		
			restlut(1)
		}	 	
	}else{
	
		restlut(1)
	}
	
});
function restlut(num){//num=0为临时保存1为提交
		var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
		if(num==1){
			for(key in packageInfo){
				if(reg.test(packageInfo[key])){
					if($('input[name="'+ key +'"]').val()==""){
						$('input[name="'+ key +'"]').val(packageInfo[key])
					}
				}
			}
		}
		add_file();
		$("#remark").val(ue.getContent())  
		// 时间处理
		var vmForm = $("#formbackage");
		['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
			var value = vmForm.find('#' + key).val();
			if (value && value.length == 16) {
				vmForm.find('#' + key).val(value + ':59')
			}
		})
		$.ajax({   	
		   	url:saveProjectPackage,//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data: vmForm.serialize()+'&supplementState='+num,
		   	success:function(data){			   		
		   		if(data.success==true){
					parent.layer.alert(num==1?"提交成功":'保存成功')
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
		   			if(num==1){
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}   
						parent.layer.close(parent.layer.getFrameIndex(window.name));
		   			}		   					   						   			
		   		}else{
		   			parent.layer.alert(data.message);
		   			return false;
		   		}
		   	}   	
		});	
}
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});