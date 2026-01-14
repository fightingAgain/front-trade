var packageId = getQueryString("packageIds");
var projectId = getQueryString("projectIds");
var tenderType = getQueryString("tenderType");
var enterpriseType = getQueryString("enterpriseType");

var supplementurl = '0502/Bid/Supplement/model/add_supplement.html' //添加弹出框路径
var findPageList = config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do' //
var viewsupplement = '0502/Bid/Supplement/model/supplierviewSupplement.html'

var isSub = ""; //补遗时候已经到了截止日期
var isFile= "";//是否递交竞价时间
var isChecking = ''; // 如果有正在审核的补遗 则不能添加新的补遗  会将新增补遗文件按钮隐藏
$(function() {
	du()
	//供应商页面进来
	if(getQueryString("enterpriseType") == "06") {
		$("#addSupplement").hide();
	}
})



function du() {
	isChecking = '';
	var para;
	if(tenderType == "0" || tenderType == "6"){
		para = {
			"packageId": packageId,
			"tenderType": tenderType,
			"enterpriseType": enterpriseType //采购人 0 供应商1
		}
	}else if(tenderType == "1" || tenderType == "2"){
		para = {
			"projectId": projectId,
			"tenderType": tenderType,
			"enterpriseType": enterpriseType //采购人 0 供应商1
		}
	}
	
	$.ajax({
		url: findPageList,
		type: 'post',
		dataType: 'json',
		async: false,
		data: para/*{
			"packageId": packageId,
			"tenderType": tenderType,
			"enterpriseType": enterpriseType //采购人 0 供应商1
		}*/,
		success: function(data) {
			//console.log(data)
			
			var tabel_table = ""
			if(data.success) {
				data = data.data;
				isFile = data.isFile ;
				$("#ProjectCode").html(data.projectCode);
				$("#ProjectName").html(data.projectName);
				if(tenderType == 0 ||tenderType == 6){
					$(".packageView").show();
				}
				$("#PackageName").html(data.packageName);
				$("#PackageNum").html(data.packageNum);
				$("#NoticeEndDate").html(data.noticeEndDate);
				isSub = data.isSub //补遗截止时间
				if(data.projectSupplements.length > 0) {
					for(var i = 0; i < data.projectSupplements.length; i++) {						
						tabel_table += '<tr>' +
							'<td>' + (i + 1) + '</td>' +
							'<td style="text-align:left">' + data.projectSupplements[i].title + '</td>' +
							'<td>' + data.projectSupplements[i].subDate + '</td>';					
						tabel_table +='<td><a href="#" class="btn btn-primary btn-xs"  onclick=view(\"' + data.projectSupplements[i].id + '\")>查看</a></td>' +
							'</tr>'

					}

					if(isChecking == 1) { //有正在审核的补遗
						$("#addSupplement").hide();
					}

				} else {
					tabel_table += '<tr><td colspan="7">暂无数据</td></tr>'
				}

			}

			$("#table").html(tabel_table)
		}
	});
}

function view(tid) {
	var id = ""
	var examTypeData =JSON.parse(sessionStorage.getItem('examTypeData'));
	sessionStorage.setItem('examType', JSON.stringify(examTypeData));
	var inviteStateData =JSON.parse(sessionStorage.getItem('inviteStateData'));
	sessionStorage.setItem('inviteState', JSON.stringify(inviteStateData));
	var isPublicData =JSON.parse(sessionStorage.getItem('isPublicData'));
	sessionStorage.setItem('isPublic', JSON.stringify(isPublicData));
	var isSignData =JSON.parse(sessionStorage.getItem('isSignData'));
	sessionStorage.setItem('isSign', JSON.stringify(isSignData));
	
	parent.layer.open({
		type: 2,
		title: '查看补遗',
		area: ['800px', '600px'],
		// maxmin: false,
		resize: false,
		content: viewsupplement + '?id=' + tid + "&tenderType=" + getQueryString("tenderType")
	});
}

function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}

$("#btn_close").on("click", function() {
	parent.layer.closeAll();
})