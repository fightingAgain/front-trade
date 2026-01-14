/*
 * @Author: your name
 * @Date: 2020-09-11 14:56:36
 * @LastEditTime: 2021-01-13 14:04:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\raterAsks.js
 */ 
var raterAsks=[];
var AskOffers=new Array();
$(function(){
	$.ajax({
		type: "post",
		url: url+'/ManagerCheckController/getRaterAskForManager.do',
		data: {
			projectId: projectId,
			packageId: packageId,
			examType:examType,
		},
		async: false,
		dataType: "json",
		success: function (response) {
			if(response.success){
				_THISID=_thisId;
				AskOffers=response.data.offers
			}else{
				parent.layer.alert(response.message);
				$("#"+_THISID).click();
			}
		}
	});
    bindRaterAsks()
})
/*==========   评审澄清   ==========*/
function bindRaterAsks() {
	var strUlHtml='<div id="divsd">'
	strUlHtml += "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_'>"
	strUlHtml +="<ul id='raterAsksTab' class='nav nav-tabs' style='border-top: 0px solid;'>";
	for(var i = 0; i < AskOffers.length; i++) {
		if(i == 0) {
			strUlHtml += "<li class='active' onclick='raterAsksbtn(\""+ AskOffers[i].supplierId +"\")'>";
		} else {
			strUlHtml += "<li onclick='raterAsksbtn(\""+ AskOffers[i].supplierId +"\")'>";
		}
		strUlHtml += "<a href='#raterAsks_" + AskOffers[i].supplierId + "' data-toggle='tab'>" + AskOffers[i].enterpriseName + "</a>";
		strUlHtml += "</li>";
	}
	strUlHtml +="</ul>";
	strUlHtml +="</div>";
	strUlHtml +='<button type="button" class="btn btn-default" id="perv_" style="width: 40px;height: 40px;margin: 0px;"><<</button>'
	strUlHtml +='<button type="button" class="btn btn-default" id="next_" style="width: 40px;height: 40px;margin: 0px;">>></button>'
	strUlHtml += "<div id='raterAsksTabContent' class='tab-content' style='float:left;width: 100%;'>";
	strUlHtml += "<div style='margin: 5px;'>供应商互动提问 <span style='color: red;'>温馨提示：评审委员会可以要求供应商进行澄清说明，所有澄清问题的提出与答复均在本页面在线完成，所有提问与答复均需在评审结果汇总提交前完成！</span></div>";
	strUlHtml += "<div style='width: 100%;height: 423px; border: 1px #ddd solid;' id='TabContent'>";								
	strUlHtml += "</div>";
	strUlHtml += "</div>";
	$("#raterAskHtml").html(strUlHtml);
	var liList=[]
		$("#raterAsksTab li").each(function(){
		liList.push($(this).width())
		})					
		if(eval(liList.join('+'))+AskOffers.length*2>=$("#divsd").width()){
		$("#perv_").show();
		$("#next_").show();
		$("#ulTab_").width($("#divsd").width()-80)
		$("#raterAsksTab").width(eval(liList.join('+'))+AskOffers.length*4);
		}else{
		$("#perv_").hide();
		$("#next_").hide();
		$("#ulTab_").width('100%')
		$("#raterAsksTab").width('100%');
		}					 
		
		var moveIndex = 0;
	$("#perv_").on('click',function(){	
		moveIndex < 0 ? moveIndex++ : moveIndex = 0
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})
		
	})
	$("#next_").off("click").on('click',function(){	
		-($("#raterAsksTab").css('width').slice(0, -2) - $("#divsd").width()) < $("#raterAsksTab").css('margin-left').slice(0, -2) ? moveIndex-- : ''
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})
		
	})
	raterAsksbtn(AskOffers[0].supplierId);
}
function raterAsksbtn(uid){
	var strDivContentHtml = "";
	strDivContentHtml += "<div style='overflow-y:scroll;height:300px;padding:5px' id='messageDiv_" + uid + "'>";	
	strDivContentHtml += "</div>";
	if(progressList.isStopCheck != 1) {
		strDivContentHtml += "<div class='isShowRaterAsks'>";
		strDivContentHtml += "<textarea rows='5' style='width: 100%;height: 80px;' id='questionsContent_" + uid + "'></textarea>";
		strDivContentHtml += "</div>";
		strDivContentHtml += "<div style='width: 100%;' class='isShowRaterAsks'>";
		strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='sendQuestions(\"" + uid + "\")'>发送</a>";
		strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='refresh(\"" + uid + "\")'>刷新</a>";
		strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='automaticRefresh(\"" + uid + "\")' id='automaticRefresh_" + uid + "'>自动刷新</a>";
		strDivContentHtml += "</div>";
	}
	$("#TabContent").html(strDivContentHtml);	
	refresh(uid);
	//点击tab加载对应数据
	$("#raterAsksTab").off("click", "li").on("click", "li", function(e) {
		$("#raterAsksTab li").removeClass('active');
		$(this).addClass('active');
		var contentdiv = $(this).children("a")[0].hash;
		$("#raterAsksTabContent div").removeClass('show');
		$(contentdiv).addClass("show");
		//$(contentdiv).scrollTop($(contentdiv)[0].scrollHeight);
	});
	
}
//提交发送
function sendQuestions(supplierId) {
	if($("#questionsContent_" + supplierId).val().length < 1) {
		top.layer.alert("请输入提问内容");
		return false;
	}else if($("#questionsContent_" + supplierId).val().length > 1500) {
		top.layer.alert("温馨提示：输入内容过长，请输入1500个字以内");
		return false;
	}
	$.ajax({
		type: "post",
		url: url + "/RaterAskController/insertRaterAsk.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			supplierId: supplierId,
			examType: examType,
			askContent: $("#questionsContent_" + supplierId).val(),
			expertId:expertIds
		},
		success: function(data) {
			if(data.success) {
				refresh(supplierId);
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

//撤回信息
function backRaterAsk(id, supplierId) {
	parent.layer.confirm("温馨提示：是否确定撤回？", function(indexs) {
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/RaterAskController/deleteRaterAsk.do",
			data: {
				id: id,
				expertId:expertIds
			},
			async: true,
			success: function(data) {
				if(data.success) {
					top.layer.alert("撤回成功！");
					refresh(supplierId);
				} else {
					top.layer.alert(data.message);
				}
			}
		});
		parent.layer.close(indexs);
	})
	
}
//查看附件
function viewFiles(id) {
	top.layer.open({
		type: 2,
		title: "查看澄清回复附件",
		area: ['600px', '400px'],
		btn: ["关闭"],
		content: $.parserUrlForToken('bidPrice/Review/Expert/modal/ShowFilelist.html') + '&id=' + id
	});
}
//刷新
function refresh(supplierId) {
	$.ajax({
		type: "post",
		url: url + "/RaterAskController/findRaterAskList.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType,
		},
		hideLoading: true,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);

		},
		success: function (data) {
			if (data.success) {
				var data = data.data;
				var strDivHtml = "";
				for (var i = 0; i < data.length; i++) {
					if (supplierId == data[i].supplierId) {
						if (typeof (data[i].answerId) == "undefined") {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：<c style='color:red'>未答复</c></span><a id='btnDeleteRaterAsk' class='btn btn-primary btn-sm' onclick='backRaterAsk(\"" + data[i].id + "\",\"" + data[i].supplierId + "\")'>撤回</a></br></br>"
						} else {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：" + data[i].answerContent + "</span></br>";
							strDivHtml += "<span>答复时间：" + data[i].answerDate + "</span></br>";
							strDivHtml += "<span>答复附件：<a href='#' onclick='viewFiles(\"" + data[i].id + "\")' >查看附件</a></span></br></br>";
						}

					}
				}
				// $("#questionsContent_" + supplierId).val("");
				$("#messageDiv_" + supplierId).html(strDivHtml);
				$('#messageDiv_' + supplierId).scrollTop($("#messageDiv_" + supplierId)[0].scrollHeight);
				if (data.length > 0 && data[0].checkReport == 1) {
					$(".isShowRaterAsks").hide();
					$("#btnDeleteRaterAsk").hide();
				}
			}
		}
	});
}
//自动刷新
var isAutomaticRefresh = false;
var timer;

function automaticRefresh(supplierId) {
	isAutomaticRefresh = !isAutomaticRefresh;
	if (isAutomaticRefresh) {
		$("#automaticRefresh_" + supplierId).html("取消刷新");
		timer = setInterval(function () {
			refresh(supplierId);
		}, 1000)
	} else {
		$("#automaticRefresh_" + supplierId).html("自动刷新");
		clearInterval(timer);
	}
}
/*==========   评审澄清END   ==========*/