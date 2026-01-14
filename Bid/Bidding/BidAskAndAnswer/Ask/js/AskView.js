var searchUrl = config.tenderHost + '/ProjectAskAnswersController/findBidAskAnswersListByPackageId.do'; //质疑答疑查询根据标段ID接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var searchTimeUrl = config.tenderHost + "/ProjectAskAnswersController/findBidOpenTimeById.do"; //查询开标时间  给质疑按钮做验证


var editView = 'Bidding/BidAskAndAnswer/Ask/model/AskEdit.html';

var packageId; //标段主键ID
var noticeId;//公告主键ID
var askEndDate;   //质疑截止时间 
var examType;//资格预审方式
$(function() {

	// 获取连接传递的参数
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	
	if($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined") {
		packageId = $.getUrlParam("packageId");
		getDetail(packageId);
	}
	
	/*if($.getUrlParam("noticeId") && $.getUrlParam("noticeId") != "undefined") {
		noticeId = $.getUrlParam("noticeId");
	}*/
	
	if($.getUrlParam("askEndDate") && $.getUrlParam("askEndDate") != "undefined") {
		askEndDate = $.getUrlParam("askEndDate");
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

});

function GetTime(time) {
	var date = new Date(time).getTime();
	return date;
};

$("#btnAskEdit").click(function() {
	
	if(GetTime(new Date()) > GetTime(askEndDate) ){
		parent.layer.alert("质疑已结束，无法质疑操作",{icon:7,title:'提示'})
		return;
	}else{
		var width = top.$(window).width() * 0.8;
		var height = top.$(window).height() * 0.8;
		//var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
		parent.layer.open({
			type: 2,
			title: "编辑质疑",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: editView + "?packageId=" + packageId+ "&examType=" + examType,
			success: function(layero, index) {
				/*var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(callback); //调用子窗口方法，传参*/
			}
		});
	}
});

function getDetail(packageId) {
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			packageId: packageId,
			examType:examType
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			
			getAskAnswers(arr);
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};

function getAskAnswers(arr) {
	
	if(arr){
		var askFiles ;
		var answersFiles;
		for(var i=0; i<arr.length;i++){
			
			if(!arr[i].answersDate){
				arr[i].answersDate='无';
			}
			if(!arr[i].answersContent){
				arr[i].answersContent='无';
			}
			if(!arr[i].answersEnterpriseName){
				arr[i].answersEnterpriseName='无';
			}
			
			var html ="";
			html += '<table id="Tab'+i+'" class="table table-bordered" style="margin-top: 5px;">';
			html += "<tr><td style='text-align:left;width:25%'>标题</td><td>" + arr[i].askTitle + "</td></tr>";
			html += "<tr><td style='text-align:left'>质疑时间</td><td>" + arr[i].askDate + "</td></tr>";
			html += "<tr><td style='text-align:left'>质疑内容</td><td>" + arr[i].askContent + "</td></tr>";
			html += "<tr><td style='text-align:left'>质疑人</td><td>" + arr[i].askEnterpriseName + "</td></tr>";
			html += "<tr><td style='text-align:left'>质疑附件</td><td><table class='table table-bordered' style='margin-bottom:5px;margin-top:5px;' id='askFile"+i+"'></table></td></tr>";
			html += "<tr><td style='text-align:left'>答疑时间</td><td>" + arr[i].answersDate + "</td></tr>";
			html += "<tr><td style='text-align:left'>答疑内容</td><td>" + arr[i].answersContent + "</td></tr>";
			html += "<tr><td style='text-align:left'>答疑人</td><td>" + arr[i].answersEnterpriseName + "</td></tr>";
			html += "<tr><td style='text-align:left'>答疑附件</td><td><table class='table table-bordered' style='margin-bottom:5px;margin-top:5px;' id='answersFile"+i+"'></table></td></tr>";
			
			html += '</table>';
			$("#askList").append(html);
			askFiles = arr[i].askFileList;
			answersFiles = arr[i].answersFileList;
			var str="<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:center'>文件名称</td><td style='text-align:center;width:150px'>操作</td></tr>";
			if(askFiles.length > 0){
				for(var j =0;j<askFiles.length;j++){
					var filesnames = askFiles[j].fileName.substring(askFiles[j].fileName.lastIndexOf(".") + 1).toUpperCase();
					
					str += "<tr><td style='text-align:center'>"+ (j+1) + "</td><td>" + askFiles[j].fileName + "</td><td style='text-align: center;'>";
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
						str += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + askFiles[j].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
					}
					str += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + askFiles[j].fileName + "','" + askFiles[j].filePath + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a></td></tr>"
					
				}
			}else{
				var str="<tr><td><span>无附件</span></td></tr>";
			}
			$("#askFile"+i).append(str);
			
			if(answersFiles.length > 0){
				var strhl="<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:center'>文件名称</td><td style='text-align:center;width:20%'>操作</td></tr>";
				for(var j =0;j<answersFiles.length;j++){
					var filesnames = answersFiles[j].fileName.substring(answersFiles[i].fileName.lastIndexOf(".") + 1).toUpperCase();
					
					strhl += "<tr><td style='text-align:center'>"+ (j+1) + "</td><td>" + answersFiles[j].fileName + "</td><td style='text-align: center;'>";
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
						strhl += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + answersFiles[j].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
					}
					strhl += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + answersFiles[j].fileName + "','" + answersFiles[j].filePath + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a></td></tr>"
				}
			}else{
				var strhl="<tr><td><span>无附件</span></td></tr>";
			}
				
			$("#answersFile"+i).append(strhl);
		}
	}
};


function downloadFile(fileName,filePath) {
	fileName = fileName.substring(0, fileName.lastIndexOf("."));
	var newUrl =dowoloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//展示图片
function showImage(obj) {
	//parent.openPreview(obj, "850px", "700px");
	previewPdf(obj)
}