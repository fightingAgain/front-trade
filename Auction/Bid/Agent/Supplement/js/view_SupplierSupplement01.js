var serachUrlSupplement01 = config.bidhost + '/ProjectSupplementController/findPageList.do';

var UrlSupplement02 = "0502/Bid/Supplement/model/view_SupplierSupplement02.html";

var SupplementInfo = [];

function setSupplementInfo(obj) {
	console.log(obj);
	$('div[id]').each(function() {
		$(this).html(obj[this.id]);
	});
	$('div[id]').each(function() {
		$(this).html(obj.project[this.id]);
	});

	getSupplement(obj.projectId);
}

//查询补遗文件标题信息
function getSupplement(projectId) {
	console.log(projectId)
	$.ajax({
		type: "post",
		url: serachUrlSupplement01,
		async: true,
		dataType: 'json',
		data: {
			"projectId": projectId
		},
		//console.log(projectId)
		success: function(data) {
			SupplementInfo = data.rows;
			console.log(SupplementInfo);
			$("#table").html("");
			SupplementInfo = data.rows;
			for(i = 0; i < SupplementInfo.length; i++) {
				var str = "";
				if(SupplementInfo[i].checkState == 0) {
					str = "未审核"
				} else if(SupplementInfo[i].checkState == 1) {
					str = "审核中"
				} else if(SupplementInfo[i].checkState == 2) {
					str = "审核通过"
				} else if(SupplementInfo[i].checkState == 3) {
					str = "审核不通过"
				}
				var strHtml = "<tr><td>" + (i + 1) + "</td>";
				strHtml += "<td>" + SupplementInfo[i].title + "</td>";
				strHtml += "<td>" + str + "</td>";
				strHtml += "<td class='text-left'><a href='javascript:void(0)' onclick=findSupplementItem(" + i + ")>查看</a></td></tr>";
				$("#table").append(strHtml);
			}
		}
	});
}

//查看补遗文件详情弹出层
function findSupplementItem(obj) {
	var height = $(window).height() * 0.6;
	var width = $(window).width() * 0.8;
	top.layer.open({
		type: 2, //此处以iframe举例
		title: '查看补遗文件',
		area: [width + 'px', height + 'px'],
		maxmin: false,
		resize: false,
		content: UrlSupplement02,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getSupplementItem(SupplementInfo[obj]);
		}
	});
}