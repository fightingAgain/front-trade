var searchUrl = config.tenderHost + '/ProjectClarifyController/findProjectClarifyListByPackageId.do'; //澄清查询根据标段ID接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var searchTimeUrl = config.tenderHost + "/ProjectAskAnswersController/findBidOpenTimeById.do"; //查询开标时间  给质疑按钮做验证

var editView = 'Bidding/BidAskAndAnswer/Answer/model/ClarifyEdit.html';

var packageId; //标段主键ID
//var noticeId; //公告主键ID
var answersEndDate;//答疑截止时间
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

$("#btnClarifyEdit").click(function() {
	if(GetTime(new Date()) > GetTime(answersEndDate) ){
		parent.layer.alert("澄清已结束，无法澄清操作",{icon:7,title:'提示'})
		return;
	}else{
		var width = top.$(window).width() * 0.8;
		var height = top.$(window).height() * 0.8;
		parent.layer.open({
			type: 2,
			title: "编辑澄清",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: editView + "?packageId=" + packageId+ "&examType=" + examType,
			success: function(layero, index) {}
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

			getClarify(arr);
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};

function getClarify(arr) {

	if(arr) {
		var files;
		for(var i = 0; i < arr.length; i++) {
			var html = "";
			html += '<table id="Tab' + i + '" class="table table-bordered" style="margin-top: 5px;">';
			html += "<tr><td style='text-align:left;width:25%'>标题</td><td>" + arr[i].clarifyTitle + "</td></tr>";
			html += "<tr><td style='text-align:left'>澄清时间</td><td>" + arr[i].createDate + "</td></tr>";
			html += "<tr><td style='text-align:left'>澄清内容</td><td>" + arr[i].clarifyContent + "</td></tr>";
			html += "<tr><td style='text-align:left'>澄清人</td><td>" + arr[i].clarifyEnterpriseName + "</td></tr>";
			html += "<tr><td style='text-align:left'>澄清附件</td><td><table class='table table-bordered' style='margin-bottom:5px;margin-top:5px;' id='clarifyFile" + i + "'></table></td></tr>";

			html += '</table>';

			$("#clarifyList").append(html);
			files = arr[i].projectClarifyFile;
			if(files.length > 0) {
				var strhl = "<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:center'>文件名称</td><td style='text-align:center;;width:150px'>操作</td></tr>";
				for(var j = 0; j < files.length; j++) {
					var filesnames = files[j].fileName.substring(files[i].fileName.lastIndexOf(".") + 1).toUpperCase();

					strhl += "<tr><td style='text-align:center'>" + (j + 1) + "</td><td>" + files[j].fileName + "</td><td style='text-align: center;'>";
					if(filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
						strhl += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + files[j].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
					}
					strhl += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + files[j].fileName + "','" + files[j].filePath + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a></td></tr>"
				}
			} else {
				var strhl = "<tr><td><span>无附件</span></td></tr>";
			}

			$("#clarifyFile" + i).append(strhl);
		}
	}
};

function downloadFile(fileName, filePath) {
	fileName = fileName.substring(0, fileName.lastIndexOf("."));
	var newUrl = dowoloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//展示图片
function showImage(obj) {
	//parent.openPreview(obj, "850px", "700px");
	previewPdf(obj)
}