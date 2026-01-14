var searchUrl = config.Reviewhost + '/RaterAskListController/findSupplierRatList.do'; //质疑答疑查询根据标段ID接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var searchTimeUrl = config.Reviewhost + "/ProjectAskAnswersController/findBidOpenTimeById.do"; //查询开标时间  给质疑按钮做验证
var bidUrl = config.Reviewhost + '/ProjectController/findBidSectionInfo.do';//获取标段信息

var editAnswer = 'Review/answer/model/answerEdit.html';//回复页面
var viewAnswer = 'Review/answer/model/answerView.html';//查看页面
var packageId; //标段主键ID
var answersEndDate;//答疑截止时间
var examType;//资格预审方式
var isEnd = '';//评标是否结束
var isPublicProject;//是否公共资源
$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		packageId = $.getUrlParam("id");
		getBidInfo(packageId)
		getDetail();
	}
	
	if($.getUrlParam("answersEndDate") && $.getUrlParam("answersEndDate") != "undefined") {
		answersEndDate = $.getUrlParam("answersEndDate");
	}
	if($.getUrlParam("isEnd") && $.getUrlParam("isEnd") != "undefined") {
		isEnd = $.getUrlParam("isEnd");
	}
	
	

});


function GetTime(time) {
	var date = new Date(time.replace(/\-/g,"/")).getTime();
	return date;
};
function getDetail() {
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			packageId: packageId,
			examType:examType
		},
		success: function(data) {
			if(data.success == false) {
                top.layer.alert('温馨提示：'+data.message);
				return;
			}
			$("#bidSectionCode").html(data.data.bidSectionCode);
			$("#bidSectionName").html(data.data.bidSectionName);
			var arr = data.data.raterAskLists;
//			console.log(arr)
			
			getAskAnswers(arr);
		},
		error: function(data) {
            top.layer.alert("温馨提示：加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};

function getAskAnswers(arr) {
    $("#answersList").bootstrapTable({
		columns: [
			{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'askDate',
				title: '问题提出时间',
				align: 'center',
				width:'180',
			},
			{
				field: 'askContent',
				title: '提问内容',
				events:{
					'click .btn_view':function(e,value, row, index){
						parent.previewPdf(row.askPdfUrl);
					},
				},
				formatter: function(value, row, index) {
//					console.log(value.length)
					if(isPublicProject == 1){
						return '<button  type="button" class="btn btn-primary btn-sm btn_view">预览</button>'
					}else{
						if(value.length > 20){
							return value.substring(0,20)+'.....'
						}else{
							return value
						}
					}
					
				}
			},
			{
				field: 'answerContent',
				title: '回复内容',	
				events:{
					'click .btn_pdf':function(e,value, row, index){
						parent.previewPdf(row.fileUrl);
					},
				},
				formatter: function(value, row, index) {
					if(isPublicProject == 1 && row.fileUrl){
						return '<button  type="button" class="btn btn-primary btn-sm btn_pdf">预览</button>'
					}else{
						if(value!=undefined){
							if(value.length>20){
								return value.substring(0,20)+'.....'
							}else{
								return value
							}
						}	
					}
				}
			},
			{
				field: "",
				title: "操作",
				width:'100',
				events:{
					'click .btnAnswer':function(e,value, row, index){
                        top.layer.open({
							type: 2,
							title: "回复",
							area: ['1000px', '600px'],
							resize: false,
							content: editAnswer + "?id=" + row.id+ "&examType=" + examType + '&bidSectionId='+packageId + '&isPublicProject=' + isPublicProject,
							success: function(layero, index) {
								/*var iframeWin = layero.find('iframe')[0].contentWindow;
								iframeWin.passMessage(callback); //调用子窗口方法，传参*/
							},
							end:function(layero, index){
								getDetail();
							}
						});
					},
					'click .viewAnswer':function(e,value, row, index){
                        top.layer.open({
							type: 2,
							title: "查看回复",
							area: ['1000px', '600px'],
							resize: false,
							content: viewAnswer + "?id=" + row.id+ "&examType=" + examType + '&bidSectionId='+packageId + '&isPublicProject=' + isPublicProject,
							success: function(layero, index) {
								/*var iframeWin = layero.find('iframe')[0].contentWindow;
								iframeWin.passMessage(callback); //调用子窗口方法，传参*/
							}
						});
					},
				},
				formatter: function(value, row, index) {
					var strAnswer = '<button  type="button" class="btn btn-primary btn-sm btnAnswer">回复</button>'; 
					var strView = '<button  type="button" class="btn btn-primary btn-sm viewAnswer">查看</button>'; 
					if(row.askState == 3 || isEnd == 1){
						return strView
					}else{
						return strAnswer
					}
					/*if(row.answerContent!=undefined){
						return strView
					}else{
						return strAnswer
					}*/
					
				}
			}
		]
	});
	$("#answersList").bootstrapTable('load',arr)
};

function editAnswers(id,askTitle){
	if(GetTime(new Date()) > GetTime(answersEndDate) ){
        top.layer.alert("温馨提示：回复已结束，无法回复操作",{icon:7,title:'提示'})
		return;
	}else{
		var width = top.$(window).width() * 0.8;
		var height = top.$(window).height() * 0.8;
		//var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
        top.layer.open({
			type: 2,
			title: "编辑回复",
			area: ['1000px', '600px'],
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
	parent.previewPdf(obj);
}
/**/
function passMessage(data){
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
}
function getBidInfo(id){
	$.ajax({
		type:"post",
		url: bidUrl,
		async:false,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				isPublicProject = data.data.isPublicProject;
			}else{
                top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
}
