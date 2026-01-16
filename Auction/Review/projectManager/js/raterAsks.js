/*
 */ 
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
	var strUlHtml = '<div id="divsd">'
	
	strUlHtml += "<ul id='raterAsksTab' class='nav nav-tabs' style='border-top: 0px solid;'>";
	for (var i = 0; i < AskOffers.length; i++) {
		if (i == 0) {
			strUlHtml += "<li class='active' onclick='raterAsksbtn(\"" + AskOffers[i].supplierId + "\")'>";
		} else {
			strUlHtml += "<li onclick='raterAsksbtn(\"" + AskOffers[i].supplierId + "\")'>";
		}
		strUlHtml += "<a href='#raterAsks_" + AskOffers[i].supplierId + "' data-toggle='tab'>" +AskOffers[i].enterpriseName + "</a>";
		strUlHtml += "</li>";
	}
	strUlHtml += "</ul>";
	strUlHtml += "</div>";
	strUlHtml += "<div id='raterAsksTabContent' class='tab-content' style='float:left;width: 100%;'>";
	strUlHtml += "<div style='margin: 5px;'>供应商互动提问 <span style='color: red;'>温馨提示：评审委员会可以要求供应商进行澄清说明，所有澄清问题的提出与答复均在本页面在线完成，所有提问与答复均需在评审结果汇总提交前完成！</span></div>";
	strUlHtml += "<div style='width: 100%;height: 450px; border: 1px #ddd solid;' id='TabContent'>";
	strUlHtml += "</div>";
	$("#raterAskHtml").html(strUlHtml);
	if(AskOffers.length>0){
		raterAsksbtn(AskOffers[0].supplierId);
	}	
}
function raterAsksbtn(uid) {
	var strDivContentHtml = "";
	strDivContentHtml += "<div style='overflow-y:scroll;height:400px' id='messageDiv_" + uid + "'>";
	strDivContentHtml += "</div>";
	strDivContentHtml += "<div style='width: 100%;' class='isShowRaterAsks'>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='refresh(\"" + uid + "\")'>刷新</a>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='automaticRefresh(\"" + uid + "\")' id='automaticRefresh_" + uid + "'>自动刷新</a>";
	strDivContentHtml += "</div>";

	$("#TabContent").html(strDivContentHtml);
	refresh(uid);
	//点击tab加载对应数据
	$("#raterAsksTab").off("click", "li").on("click", "li", function (e) {
		$("#raterAsksTab li").removeClass('active');
		$(this).addClass('active');
		var contentdiv = $(this).children("a")[0].hash;
		$("#raterAsksTabContent div").removeClass('show');
		$(contentdiv).addClass("show");
		//$(contentdiv).scrollTop($(contentdiv)[0].scrollHeight);
	});

}
//查看附件
function viewFiles(id) {
	top.layer.open({
		type: 2,
		title: "查看澄清回复附件",
		area: ['600px', '400px'],
		btn: ["关闭"],
		content: $.parserUrlForToken('Auction/common/Expert/JudgesScore/ShowFilelist.html') + '&id=' + id
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
			roleType: "0"
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
							strDivHtml += "<span>答复内容：<c style='color:red'>未答复</c></span></br></br>";
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
				$("#questionsContent_" + supplierId).val("");
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