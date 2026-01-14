
var packageInfo={};
var AccessoryList=[];
var urlSaveAuctionFile=top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var saveProjectPackage=top.config.bidhost+"/ProjectSupplementController/saveProjectSupplySupplement.do";
var findProjectPackageInfo=top.config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do';
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var examType;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
$(function(){
    //文件上传初始化	
    $("#timeList").hide()
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	fileTable();	
	datetimepickers(1);
})
/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	du(packageId)
})
function du(uid){
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
	   	  	examType=packageInfo.examType;
	   	  
	   	  	if($("#noticeType").val()==0){	   	  			
				datetimepickers(examType);
	   	  		$("#examType").val(examType);
	   	  	}else{	   	  		
	   	  		examDatetimepicker(examType);
	   	  		$("#examType").val(1);
	   	  		if(packageInfo.examType==1){
					$("#acceptEndDate").val(packageInfo.acceptEndDate)
				}
	   	  	}
	   	  	
	   	  }
	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	$("#packageId").val(packageInfo.id);
	$("#projectId").val(packageInfo.projectId);
	$('div[id]').each(function(){		
		$(this).html(packageInfo[this.id]);		
	});
	
};
$("#noticeType").change(function(){
	if($(this).val()==0){
		datetimepickers(examType);
	}else{		
		examDatetimepicker(examType);
	}  
   $('#packageName').html("");
   $('#packageNum').html(""); 
   $("#examType").val("")
   ue.execCommand('insertHtml', '');
   AccessoryList=[];
   fileTable();
})
function add_bao(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '选择包件'
        ,area: ['1200px', '650px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Agent/supplementNotice/model/choicePackage.html?tenderType=0&noticeType='+$("#noticeType").val()
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.initTable(callback)
        }
   });    
};
function callback(rowData){
	du(rowData.id)
}
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
	        hiddeninput+='<input type="hidden" name="purFiles['+ m +'].examType" value="'+ $("#examType").val() +'" />'	       
	    }
		
	}	
	$("#formFile").html(hiddeninput);   
};
$("#btn_bao").click(function() {
	if($('#packageName').html()==""){
		parent.layer.alert("请选择包件");        		     		
		return false;
	};
	if($('#title').val()==""){
		parent.layer.alert("请填写标题");        		     		
		return false;
	};
	restlut(0)
});
//审核确定按钮
$("#btn_submit").click(function() {
	if($('#packageName').html()==""){
		parent.layer.alert("请选择包件");        		     		
		return false;
	};
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
		$("#remark").val(ue.getContent());
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
		   			if(num==1){
						parent.layer.close(parent.layer.getFrameIndex(window.name));
							} else {
								['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
									var value = vmForm.find('#' + key).val();
									if (value && value.length > 16) {
										vmForm.find('#' + key).val(value.slice(0,16))
									}
								})
						}
		   			$("#id").val(data.data)
		   			parent.layer.alert(num==1?"提交成功":'保存成功')
		   			parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			   			
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