var ids=getUrlParam("id");//标段Id
var token=getUrlParam("Token");
var supplementUrl=config.Reviewhost+"/ReviewControll/findZbwjChangeInfo.do";
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var supplementData="",docClarifyItem=[];
$(function(){
	/*关闭*/
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
	    parent.layer.close(index);
	});
	$.ajax({
		type:"post",
		url:supplementUrl,
		async:false,
		beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },
		data:{
			'id':ids,				
		},
		success:function(res){
			if(res.success){
				supplementData=res.data;
				docClarifyItem.push(supplementData.docClarifyItem)
				$("#clarifyTime").html(supplementData.clarifyTime);
				$("#answersEndDate").html(supplementData.answersEndDate);
				$("#bidDocReferEndTime").html(supplementData.bidDocReferEndTime);
				$("#bidOpenTime").html(supplementData.bidOpenTime);
				if(supplementData.isChange==1&&supplementData.isReplenish==1){
					$("#showChange").show();
					$("#showReplenish").show();
					isChangeList();
					isReplenishList()
				}
				if(supplementData.isChange==1&&supplementData.isReplenish==0){
					$("#showChange").show();
					isChangeList();
				}
				if(supplementData.isChange==0&&supplementData.isReplenish==1){
					$("#showReplenish").show();	
					isReplenishList();
				}
			}else{				
				top.layer.alert('温馨提示：'+res.message);				
			}
		}
	});
})

function isChangeList(){
	$('#isChange').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "xz",
			title: "操作",
			align: "left",
			halign: "left",	
			events:{
				'click #download':function(e,value, row, index){
					var filesnames = row.fileName.substring(0,row.fileName.lastIndexOf("."));
					var newUrl =dowoloadFileUrl+'?ftpPath='+row.fileUrl+'&fname='+filesnames+'&Token='+token;
					window.location.href = encodeURI(newUrl);
				},
				'click #picture':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						btn: ["关闭"],
						maxmin: true,
						resize: false,
						title: "预览",
//						content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.fileUrl+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+row.fileUrl
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>"
				return btn1+btn2;
			},
		}
		]
	});
	$('#isChange').bootstrapTable("load",docClarifyItem); //重载数据
}
function isReplenishList(){
	$('#isReplenish').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [
		{
		    field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			},
		
		},
		{
			field: "attachmentFileName",
			title: "文件名称",
			align: "left",
			halign: "left",									
		},
		{
			field: "xz",
			title: "操作",
			align: "left",
			halign: "left",	
			events:{
				'click #downloads':function(e,value, row, index){
					var filesnames = row.attachmentFileName.substring(0,row.attachmentFileName.lastIndexOf("."));					
					var newUrls =dowoloadFileUrl+'?ftpPath='+row.url+'&fname='+filesnames+'&Token='+token;
					window.location.href = encodeURI(newUrls);
				},
				'click #pictures':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						btn: ["关闭"],
						maxmin: true,
						resize: false,
						title: "预览",
//						content: top.config.bidhost + "/FileController/fileView.do?path=" + row.url+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+row.url
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='downloads' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='pictures' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>";
				var filesnames = row.attachmentFileName.substring(row.attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
					return btn1+btn2;
				}else{
					return btn1;
				}
				
			},
		}
		]
	});
	$('#isReplenish').bootstrapTable("load",supplementData.attachmentFiles); //重载数据
}