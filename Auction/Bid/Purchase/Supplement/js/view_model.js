var packageId = getQueryString("packageIds");
var projectId = getQueryString("projectIds");
var tenderType = getQueryString("tenderType");
var enterpriseType = getQueryString("enterpriseType");

var supplementurl = '0502/Bid/Supplement/model/add_supplement.html' //添加弹出框路径
var findPageList = config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do' //
var viewsupplement = '0502/Bid/Supplement/model/view_supplement.html'
var updateSupplementUrl = config.bidhost + '/WorkflowController/findWorkflowCheckeState.do' 

var isSub = ""; //补遗时候已经到了截止日期
var isFile= "";//是否递交竞价时间
var isChecking = ''; // 如果有正在审核的补遗 则不能添加新的补遗  会将新增补遗文件按钮隐藏
var lengthNum=0;//当前补遗个数
$(function() {
	du()
	//供应商页面进来
	if(getQueryString("enterpriseType") == "1") {
		$("#addSupplement").hide();
	}
})

function getMsg(eid,pid){
	if(eid != "" && pid != ""){
		if(eid != pid){
			$("#addSupplement").hide();
			$("#upp").hide();
		}
	}
}

$("#addSupplement").click(function() {                                         
	
	if(isSub == "1") { //isSub为1的时候不可以补遗
		parent.layer.alert("已超过截止时间，无法添加补遗！");
		return;
	}
	
	var examTypeData =JSON.parse(sessionStorage.getItem('examTypeData'));
	sessionStorage.setItem('examType', JSON.stringify(examTypeData));
	var inviteStateData =JSON.parse(sessionStorage.getItem('inviteStateData'));
	sessionStorage.setItem('inviteState', JSON.stringify(inviteStateData));
	var isPublicData =JSON.parse(sessionStorage.getItem('isPublicData'));
	sessionStorage.setItem('isPublic', JSON.stringify(isPublicData));
	var projectIds =JSON.parse(sessionStorage.getItem('projectIdData'));
	sessionStorage.setItem('projectId', JSON.stringify(projectId));
	var isSignData =JSON.parse(sessionStorage.getItem('isSignData'));
	sessionStorage.setItem('isSign', JSON.stringify(isSignData));
	
	parent.layer.open({
		type: 2,
		title: '添加补遗',
		area: ['70%', '70%'],
		maxmin: false,
		resize: false,
		content: supplementurl + "?packageId=" + packageId +"&projectId=" + projectId +  "&tenderType=" + getQueryString("tenderType")+"&isFile="+isFile+'&lengthNum='+lengthNum, 
		end: function(index, layero) {
			du()
		}
	});
});

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
		data:para /*{
			"packageId": packageId,
			"tenderType": tenderType,
			"enterpriseType": enterpriseType //采购人 0 供应商1
		}*/,
		success: function(data) {
			//console.log(data)
			
			var tabel_table = ""
			if(data.success) {
				var  data = data.data;
				isFile = data.isFile ;
				if(tenderType == "1" || tenderType == "2"){
					$(".packageView").hide();
				}
				$("#ProjectCode").html(data.projectCode);
				$("#ProjectName").html(data.projectName);
				$("#PackageName").html(data.packageName);
				$("#PackageNum").html(data.packageNum);
				$("#NoticeEndDate").html(data.noticeEndDate);
				isSub = data.isSub //补遗截止时间
				var flag = true;
				if(data.projectSupplements.length > 0) {
					lengthNum=data.projectSupplements.length
					for(var i = 0; i < data.projectSupplements.length; i++) {
						var checkState;
						if(data.projectSupplements[i].checkState == 0) {
							checkState = "未审核"
						}
						if(data.projectSupplements[i].checkState == 1) {
							checkState = "审核中";
							isChecking = 1;
						}
						if(data.projectSupplements[i].checkState == 2) {
							checkState = "审核通过"
						}
						if(data.projectSupplements[i].checkState == 3) {
							checkState = "审核不通过"
						}

						tabel_table += '<tr>' +
							'<td>' + (i + 1) + '</td>' +
							'<td style="text-align:left">' + data.projectSupplements[i].title + '</td>' +
							'<td>' + (data.projectSupplements[i].subDate||"") + '</td>';
						if(checkState == "审核通过") {
							tabel_table += '<td>已发布</td>';
						} else {
							tabel_table += '<td>未发布</td>';
						}
						tabel_table += '<td>' + checkState + '</td>';
						
							if(data.projectSupplements[i].subDate){
								tabel_table += '<td style = "width:200px;">'
								tabel_table	+= '<a href="#" class="btn btn-primary btn-xs"  onclick=view(\"' + data.projectSupplements[i].id + '\")><span class="glyphicon glyphicon-search"></span>查看</a>&nbsp;&nbsp;'
								if(data.projectSupplements[i].checkState == 1){
									tabel_table += '<a href="#" class="btn btn-primary btn-xs upp"  onclick=update(\"' + data.projectSupplements[i].id + '\")><span class="glyphicon glyphicon-repeat"></span>撤回</a>' 
								}
								tabel_table += '</td>'
							}else{
								flag = false;
								tabel_table +='<td><a href="#" class="btn btn-primary btn-xs"  onclick=up(\"' + data.projectSupplements[i].id + '\")><span class="glyphicon glyphicon-pencil"></span>编辑</a>&nbsp;&nbsp;</td>' 
							}
							
							
						tabel_table +=	'</tr>'

					}

					if(isChecking == 1) { //有正在审核的补遗
						$("#addSupplement").hide();
					}
					
					if(!flag){
						//有正在编辑的  不显示按钮
						$("#addSupplement").hide();
					}
				} else {
					tabel_table += '<tr><td colspan="7" style="text-align:center;">暂无数据</td></tr>'
				}

			}

			$("#table").html(tabel_table)
		}
	});
}

function up(id){
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
		title: '修改补遗',
		area: ['70%', '70%'],
		maxmin: false,
		resize: false,
		content: supplementurl + "?packageId=" + packageId + "&tenderType=" + getQueryString("tenderType")+"&isFile="+isFile+"&isUpdate="+"1" + '&lengthNum='+lengthNum, 
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.showMsg(id);
		},
		end: function(index, layero) {
			du()
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
		maxmin: false,
		resize: false,
		content: viewsupplement + '?id=' + tid + "&tenderType=" + getQueryString("tenderType")
	});
}

//撤回
function update(id){
	parent.layer.confirm('确定要撤回该补遗吗？', {
		btn: ['确 定', '取 消']
		},
		function() {
			$.ajax({
			   	url:updateSupplementUrl,
			   	type:'post',
			   	dataType:'json',
			    data:{
			    	'businessId' : id,
			    	'accepType': "xmby"
			    },
			   	success:function(data){
			   		if(data.success){
			   			du();
			   			parent.layer.alert("撤回成功");
			   		}else{
			   			parent.layer.alert(data.message);
			   		}
			 	},
			 	error: function(data) {
					parent.layer.alert("撤回失败")
				}
			});
		},
		function() {
			parent.layer.close();
		}
	);
	
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