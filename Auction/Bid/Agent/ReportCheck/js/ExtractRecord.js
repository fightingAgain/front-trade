var url = top.config.bidhost;
var ProjectData = JSON.parse(sessionStorage.getItem("ProjectData"));
var checkType = getUrlParam("checkType");
$(function() {
	$.ajax({
		url: url + '/CheckController/getExtractRecord.do',
		data: {
			projectId: ProjectData.projectId,
			packageId: ProjectData.packageId,
			checkType:checkType
		},
		success: function(data) {
			data = data.data;
			if(data) {
				//var experts = data[0].experts;
				$('#projectName').html(ProjectData.projectName);
				$('#projectCode').html(ProjectData.projectCode);
				if(checkType == 1){
					//预审
					$("#checkTime").text("询比预审时间：");
					$('#bidDatatime').html(ProjectData.examCheckEndDate);
				}else{
					$('#bidDatatime').html(ProjectData.checkEndDate);
				}
				var strHtml = '';
				for(var i = 0; i < data.length; i++) {
					strHtml += "<tr>";
					strHtml += "<td style='text-align: right;' width='20%'>第" + (i + 1) + "次操作：</td>";
					strHtml += "<td colspan='3'></td>";
					strHtml += "</tr>";
					strHtml += "<tr>";
					strHtml += "<td style='text-align: right;'>操作类型：</td>";
					switch(data[i].setType) {
						case 0:
							strHtml += "<td  width='30%'>抽取</td>";
							break;
						case 1:
							strHtml += "<td width='30%'>指定评委</td>";
							break;
						case 2:
							strHtml += "<td width='30%'>移除</td>";
							break;
						case 3:
							strHtml += "<td width='30%'>替换</td>";
							break;
						case 4:
							strHtml += "<td width='30%'>重组评委</td>";
							break;
						case 5:
							strHtml += "<td width='30%'>关联包件</td>";
							break;
						case 6:
							strHtml += "<td width='30%'>指定组长</td>";
							break;
					}

					strHtml += "<td style='text-align: right;' width='15%'>操作数量：</td>";
					strHtml += "<td width='35%'>" + (data[i].dataSum || '1') + "</td>";
					strHtml += "</tr>";
					strHtml += "<tr>";
					strHtml += "<td style='text-align: right;'>操作时间：</td>";
					strHtml += "<td>" + (data[i].subDate || data[i].updateTime) + "</td>";
					strHtml += "<td style='text-align: right;'>操作人：</td>";
					strHtml += "<td>" + (data[i].userName || '1') + "</td>";
					strHtml += "</tr>";
					strHtml += "<tr>";
					strHtml += "<td style='text-align: right;'>备注原因：</td>";
					strHtml += "<td colspan='3'>" + (data[i].changeReason || '') + "</td>";;
					strHtml += "</tr>";
					strHtml += "<tr>";
					strHtml += "<td colspan='4' style=''>";
					if(data[i].expertHistoryItems && data[i].expertHistoryItems.length > 0) {
						strHtml += "<table class='table table-bordered'>";
						strHtml += "<tr>";
						strHtml += "<td>评委姓名</td>";
						strHtml += "<td>证件类型</td>";
						strHtml += "<td>手机号</td>";
						strHtml += "<td>所在单位</td>";
						strHtml += "<td>专业类别</td>";
						strHtml += "</tr>";
						
						if(data[i].expertHistoryItems.length > 0 && data[i].expertHistoryItems[0].expertName){
							for(var j = 0; j < data[i].expertHistoryItems.length; j++) {
								strHtml += "<tr>";
								if(data[i].setType == 3) {
									strHtml += "<td>(替换)" + data[i].expertHistoryItems[j].expertName + "</td>";
								} else {
									strHtml += "<td>" + data[i].expertHistoryItems[j].expertName + "</td>";
								}
								if(data[i].expertHistoryItems[j].identityCardType == 0) {
									strHtml += "<td>身份证</td>";
								} else if(data[i].expertHistoryItems[j].identityCardType == 1) {
									strHtml += "<td>军官证</td>";
								} else {
									strHtml += "<td>护照</td>";
								}
								strHtml += "<td>" + data[i].expertHistoryItems[j].expertTel + "</td>";
								strHtml += "<td>" + (data[i].expertHistoryItems[j].companyName || '') + "</td>";
								if(data[i].expertHistoryItems[j].expertTypes && data[i].expertHistoryItems[j].expertTypes.length > 10) {
									strHtml += "<td><span title='" + data[i].expertHistoryItems[j].expertTypes + "'>" + data[i].expertHistoryItems[j].expertTypes.substring(0, 10) + "</span></td>";
								} else {
									strHtml += "<td>" + (data[i].expertHistoryItems[j].expertTypes || '') + "</td>";
								}
								strHtml += "</tr>";
	
								if(data[i].setType == 3) {
									strHtml += "<tr>";
									strHtml += "<td>(被替换)" + data[i].expertHistoryItems[j].changeExpertName + "</td>";
									if(data[i].expertHistoryItems[j].changeIdentityCardType == 0) {
										strHtml += "<td>身份证</td>";
									} else if(data[i].expertHistoryItems[j].changeIdentityCardType == 1) {
										strHtml += "<td>军官证</td>";
									} else {
										strHtml += "<td>护照</td>";
									}
									strHtml += "<td>" + data[i].expertHistoryItems[j].changeExpertTel + "</td>";
									strHtml += "<td>" + (data[i].expertHistoryItems[j].changeCompanyName || '') + "</td>";
									if(data[i].expertHistoryItems[j].changeExpertTypes && data[i].expertHistoryItems[j].changeExpertTypes.length > 10) {
										strHtml += "<td><span title='" + data[i].expertHistoryItems[j].changeExpertTypes + "'>" + data[i].expertHistoryItems[j].changeExpertTypes.substring(0, 10) + "</span></td>";
									} else {
										strHtml += "<td>" + (data[i].expertHistoryItems[j].changeExpertTypes || '') + "</td>";
									}
									strHtml += "</tr>";
								}
	
							}
							strHtml += "</table>";
						}else{
							strHtml += "<tr><td colspan='5' style='text-align:center;'>暂无数据</td><tr>";
							strHtml += "</table>";
						}
					}
					strHtml += "</td>";
					strHtml += "</tr>";
					if(i != (data.length - 1)) {
						strHtml += "<tr><td colspan='4'><div style='border: 1px solid;border-style: dotted none none none;'></div></td><tr>";
					}
				}
				$("#dynamicTable").html(strHtml);
			}
		}
	});
});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//关闭
function closeWin(){
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}
//打印
function preview(){
	bdhtml=window.document.body.innerHTML;//获取当前页的html代码
	sprnstr="<!--startprint-->";//设置打印开始区域
	eprnstr="<!--endprint-->";//设置打印结束区域
	prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)); //从开始代码向后取html
	prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
	window.document.body.innerHTML=prnhtml;
	window.print();
	window.document.body.innerHTML=bdhtml;
}