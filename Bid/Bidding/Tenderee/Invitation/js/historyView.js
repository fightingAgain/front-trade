
/**
*  zhouyan 
*  2019-2-25
*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/BidInviteController/getInviteInfo.do";	//查看地址


var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var fullScreen = 'Bidding/BidNotice/Notice/model/fullScreenView.html';//全屏查看页面

//var printHtml = 'Bidding/Tenderee/Invitation/model/print.html';//打印
var fileUploads = null; //文件上传
var timeState = '';//	邀请函是否结束 当前时间大于邀请函截止时间 为0 小于邀请函截止时间为1
var replyState = "";  //回复状态0为未确认 1为放弃投标 2为同意投标
var signState;  //报名状态
var nowData = top.$('#systemTime').html() + " " + top.$('#sysTime').html();//当前时间
var startTime = '';//文件获取开始时间
var endTime = '';//文件获取截止时间
var bidSectionId; //标段id
var bidFileId; //招标文件id

$(function(){
	var id = $.getUrlParam('id');//历史邀请函id
	/*关闭*/
	$("body").on("click", '#btnClose', function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	/*打印*/
	$("body").on("click", "#btnPrint", function(){
		var oldContent = $("body").html();
		preview(1,oldContent)
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: id,
			status:2
		});
	}
	$.ajax({
		type:"post",
		url:viewUrl,
		async:true,
		data: {
			'id':id
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			
			//文件回显
			if(dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0){
				fileUploads.fileHtml(dataSource.projectAttachmentFiles);
			}else{
				$('#fileContent').html('无')
			}
			for(var key in dataSource){
            	$("#" + key).html(dataSource[key]);
          	}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
})	
//获取列表信息
function passMessage(data){
	startTime = data.docGetStartTime;//文件获取开始时间
	endTime = data.docGetEndTime;//文件获取截止时间
	bidSectionId = data.bidSectionId;//标段id
	bidFileId = data.bidDocClarifyId;//文件id
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode)
	$('#bidSectionName').html(data.bidSectionName)

	
}

function preview(oper,html){
	if (oper < 10){
		$("#gz").css("right","100px");
		bdhtml=window.document.body.innerHTML;//获取当前页的html代码
		sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
		eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
		prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+18); //从开始代码向后取html
		prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML=prnhtml;
		window.print();
		window.document.body.innerHTML=bdhtml;
		$("#gz").css("right","10px");
	} else {
		window.print();
	}
	document.body.innerHTML = html;
}
