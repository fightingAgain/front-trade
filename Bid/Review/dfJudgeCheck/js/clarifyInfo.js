var ids=getUrlParam("id");//标段Id
var token=getUrlParam("Token");
var type=getUrlParam("type");
var clarifyUrl=config.Reviewhost+"/ReviewControll/findClarifyInfo.do";
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var clarifydata;
$(function(){
	$.ajax({
		type:"post",
		url:clarifyUrl,
		async:false,
		beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },
		data:{
			'id':ids,
			'type':type
		},
		success:function(res){
			if(res.success){
				clarifydata=res.data
				$("#enterpriseName").html(clarifydata.enterpriseName);
				$("#clarifyTitle").html(clarifydata.clarifyTitle);
				$("#clarifyContent").html(clarifydata.clarifyContent);
				//1.资格预审文件 2.资格文件开启 3.资格评审 4.招标文件 5.开标 6.候选人公示 7.中标公示
				if(clarifydata.clarifyType==1){
					$("#clarifyType").html('资格预审文件')
				}else if(clarifydata.clarifyType==2){
					$("#clarifyType").html('资格文件开启')
				}else if(clarifydata.clarifyType==3){
					$("#clarifyType").html('资格评审')
				}else if(clarifydata.clarifyType==4){
					$("#clarifyType").html('招标文件')
				}else if(clarifydata.clarifyType==5){
					$("#clarifyType").html('开标')
				}else if(clarifydata.clarifyType==6){
					$("#clarifyType").html('候选人公示')
				}else if(clarifydata.clarifyType==7){
					$("#clarifyType").html('中标公示')
				}
				isReplenishList();
			}else{
                top.layer.alert(res.message);
			}
		}
	});
})
function isReplenishList(){
	$('#clarifyTable').bootstrapTable({
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
				'click #download':function(e,value, row, index){
					var filesnames = row.attachmentFileName.substring(0,row.attachmentFileName.lastIndexOf("."));
					var newUrl =dowoloadFileUrl + '?ftpPath=' + row.url + '&fname=' + filesnames +'&Token='+token;
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
						// content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + row.url+'&Token='+token
						content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+ row.url
					})
				}
			},
			formatter: function(value, row, index) {
				var btn1="<a href='javascript:void(0)' class='btn-sm btn-primary' id='download' style='text-decoration:none'><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
				var btn2="<a  href='javascript:void(0)' class='btn-sm btn-primary' id='picture' style='text-decoration:none'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>";
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
	$('#clarifyTable').bootstrapTable("load",clarifydata.attachmentFiles); //重载数据
}