/**

*  投标人答疑
*  方法列表及功能描述
*/

var searchUrl = config.tenderHost + '/RaterAskListController/findBySupplierAndPackageId.do'; //质疑答疑查询根据标段ID接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var searchTimeUrl = config.tenderHost + "/ProjectAskAnswersController/findBidOpenTimeById.do"; //查询开标时间  给质疑按钮做验证

var editView = 'Bidding/BidJudge/Bidder/model/answerEdit.html';

var packageId; //标段主键ID
var answersEndDate;//答疑截止时间
var examType;//资格预审方式
$(function() {

	// 获取连接传递的参数
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		packageId = $.getUrlParam("id");
		getDetail(packageId);
	}
	
	if($.getUrlParam("answersEndDate") && $.getUrlParam("answersEndDate") != "undefined") {
		answersEndDate = $.getUrlParam("answersEndDate");
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

/*$("#btnAanswersEdit").click(function() {
	if(GetTime(new Date()) > GetTime(answersEndDate) ){
		parent.layer.alert("答疑已结束，无法答疑操作",{icon:7,title:'提示'})
		return;
	}else{
		var width = top.$(window).width() * 0.8;
		var height = top.$(window).height() * 0.8;
		//var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
		parent.layer.open({
			type: 2,
			title: "编辑答疑",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: editView + "?packageId=" + packageId,
			success: function(layero, index) {
			}
		});
	}
		
});*/

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
//			console.log(arr)
			
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
			if(!arr[i].answerDate){
				arr[i].answerDate='无';
			}
			if(!arr[i].answerContent){
				arr[i].answerContent='无';
			}
			if(!arr[i].answersEnterpriseName){
				arr[i].answersEnterpriseName='无';
			}
			
			var html ="";
			html += '<table id="Tab'+i+'" class="table table-bordered table_list" style="margin-top: 5px;">';
//			html += "<tr><td style='text-align:left;width:25%'>标题</td><td>" + arr[i].askTitle + "</td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>质疑时间</td><td>" + arr[i].askDate + "</td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>质疑内容</td><td>" + arr[i].askContent + "</td></tr>";
//			html += "<tr><td style='text-align:left'>质疑人</td><td>" + arr[i].askEnterpriseName + "</td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>质疑附件</td><td><table class='table table-bordered' style='margin-bottom:5px;margin-top:5px;' id='askFile"+i+"'></table></td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>答疑时间</td><td>" + arr[i].answerDate + "</td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>答疑内容</td><td>" + arr[i].answerContent + "</td></tr>";
//			html += "<tr><td style='text-align:left'>答疑人</td><td>" + arr[i].answerEnterpriseName + "</td></tr>";
			html += "<tr><td style='text-align:left' class='th_bg'>答疑附件</td><td><table class='table table-bordered' style='margin-bottom:5px;margin-top:5px;' id='answersFile"+i+"'></table></td></tr>";
			
			if(!arr[i].answerId){
				html += "<tr><td colspan = '4' style='text-align:center'><button type='button' class='btn btn-primary' id='btnAnswers' onclick=editAnswers('" + arr[i].id + "','" + arr[i].askTitle + "')><span class='glyphicon glyphicon-ok'></span>我要答疑</button></td></tr>";
			}else{
				html += "";
			}
			
			html += '</table>';
			$("#answersList").append(html);
//			若存在质疑文件
			if(arr[i].askFileList){
				askFiles = arr[i].askFileList;
				if(askFiles.length > 0){
				var str="<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:center'>文件名称</td><td style='text-align:center;width:20%'>操作</td></tr>";
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
			}
			//若存在答疑文件
			if(arr[i].raterAskFiles){
				answersFiles = arr[i].raterAskFiles;
//				console.log(answersFiles)
				if(answersFiles.length > 0){
					var strhl="<tr><td style='text-align:center;width:50px'>序号</td><td>文件名称</td><td style='text-align:center;width:20%'>操作</td></tr>";
					for(var j =0;j<answersFiles.length;j++){
						var filesnames = answersFiles[j].attachmentFileName.split(".").pop().toUpperCase();//获取文件后缀并转化成大写
						strhl += "<tr><td style='text-align:center'>"+ (j+1) + "</td><td>" + answersFiles[j].attachmentFileName + "</td><td style='text-align: center;'>";
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
							strhl += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + answersFiles[j].url + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
						}
						strhl += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + answersFiles[j].attachmentFileName + "','" + answersFiles[j].url + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a></td></tr>"
					}
				}else{
					var strhl="<tr><td><span>无附件</span></td></tr>";
				}
					
				$("#answersFile"+i).append(strhl);
			}
//			answersFiles = arr[i].raterAskFiles;
			
			
			
		}
	}
};

function editAnswers(id,askTitle){
	if(GetTime(new Date()) > GetTime(answersEndDate) ){
		parent.layer.alert("答疑已结束，无法答疑操作",{icon:7,title:'提示'})
		return;
	}else{
		var width = top.$(window).width() * 0.8;
		var height = top.$(window).height() * 0.8;
		//var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
		parent.layer.open({
			type: 2,
			title: "编辑答疑",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: editView + "?id=" + id+ "&examType=" + examType + '&bidSectionId='+packageId,
			success: function(layero, index) {
				/*var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(callback); //调用子窗口方法，传参*/
			}
		});
	}
}


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