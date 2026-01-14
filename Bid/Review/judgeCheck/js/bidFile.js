var ids=getUrlParam("id");//标段Id
var token=getUrlParam("Token");
var bidFileUrl=config.Reviewhost+"/ReviewControll/findBidOpeningFileList.do";
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var bidFileData="";
$(function(){
	/*关闭*/
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
	    parent.layer.close(index);
	});
	$.ajax({
		type:"post",
		url:bidFileUrl,
		async:false,
		beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },
		data:{
			'id':ids,				
		},
		success:function(res){
			if(res.success){
				bidFileData=res.data;
				bidFileList()
			}else{				
				top.layer.alert('温馨提示：'+res.message);
			}
		}
	});
})

function bidFileList(){
	$('#bidFile').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: 450,
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
			field: "bidFileName",
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
					var filesnames = row.bidFileName.substring(0,row.bidFileName.lastIndexOf("."));					
					if(filesnames==""||filesnames==undefined){
						var filesnamel=row.bidFileName
					}else{
						var filesnamel = row.bidFileName.substring(0,row.bidFileName.lastIndexOf("."));
					}
					var newUrl =dowoloadFileUrl + '?ftpPath=' + row.bidFileUrl + '&fname=' + filesnamel+'&Token='+token;
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
						content: encodeURI(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.bidFileUrl+'&Token='+token)
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>"
				var bidFileUrlS = row.bidFileUrl.substring(row.bidFileUrl.lastIndexOf(".") + 1).toUpperCase();
				if(bidFileUrlS == 'DOC'||bidFileUrlS == 'JPG'||bidFileUrlS == 'JPGE'||bidFileUrlS == 'PDF'){
					return btn1+btn2;
				}else{
					return btn1;
				}
			},
		}
		]
	});
	$('#bidFile').bootstrapTable("load",bidFileData); //重载数据
}