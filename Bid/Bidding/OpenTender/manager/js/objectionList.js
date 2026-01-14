
var token = $.getUrlParam("Token");
var bidId = $.getUrlParam("bidId");	//标段id
$(function(){
	
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		initDataTab();
	});

});
//objectionData

// 查询参数
function getQueryParams(params) {
	var projectData = {
		bidSectionId:bidId,
		objectionTitle: $("#objectionTitle").val(), //异议标题
	};
	return projectData;
};

/**
 * 
 * @param {Object} index
 */
function initDataTab(){
	$.ajax({
		type: "get",
		url: config.openingHost + '/ObjectionAnswersController/findProjectGroupList.do',
		dataType: 'json',
		data:getQueryParams(),
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token",token);
		},
		success: function(data) {
			$("#objectionData").empty();
			if(data.data != undefined){
				//循环添加项目信息
				for(var i = 0;i < data.data.length;i++) {
					var str = "";//状态
					var but = "";//按钮
					var strSign = '<button  type="button" class="btn btn-primary btn-sm" onclick="openSign(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-edit"></span>签收</button>';
					var strSure = '<button  type="button" class="btn btn-primary btn-sm" onclick="openSure(\''+data.data[i].id+'\')"><span class="glyphicon glyphicon-edit"></span>确认</button>';
					var strAccept = '<button  type="button" class="btn btn-primary btn-sm" onclick="openAccept(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-edit"></span>受理</button>';
					var strReply = '<button  type="button" class="btn btn-primary btn-sm" onclick="openReply(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-edit"></span>答复</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm" onclick="openView(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					
					switch(data.data[i].status) {
				    	case "1": str = "未签收"; but = strSign + strView ; break;
				    	case "2": str = "已签收"; but = strAccept+strView ; break;
				    	case "3": str = "未受理"; but = strAccept+strView ; break;
				    	case "4": str = "已受理"; but = strReply+strView ; break;
				    	case "5": str = "不予受理"; but = strView ; break;
				    	case "6": str = "未答复"; but = strReply+strView ; break;
				    	case "7": str = "已答复"; but = strView; break;
				    	case "8": str = "申请撤回"; but = strSure + strView; break;
				    	case "9": str = "已撤回"; but = strView ; break;
				    }
					
					var ui = "<tr><td>"+(i+1)+"</td><td>"+data.data[i].interiorBidSectionCode+"</td><td>"+data.data[i].bidSectionName+"</td>"
					+"<td>"+data.data[i].objectionTitle+"</td><td>开标</td><td>"+str+"</td><td>"+but+"</td></tr>";
					
					$("#objectionData").append(ui);
				}
			}	
		}
	})
}

//查看
function openView(id,status){
	layer.open({
		type: 2,
		title: '查看异议',
		area: ['99%', '99%'],
		resize: false,
		content: 'objectionView.html?dataId='+id+'&status='+status+'&Token='+token,
	});
}

//签收
function openSign(id,status){
	layer.open({
		type: 2,
		title: '异议受理',
		area: ['99%', '99%'],
		resize: false,
		content: 'objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&Token='+token,
	});
}

//受理
function openAccept(id,status){
	layer.open({
		type: 2,
		title: '异议受理',
		area: ['99%', '99%'],
		resize: false,
		content: 'objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&Token='+token,
	});
}

//受理
function openReply(id,status){
	layer.open({
		type: 2,
		title: '异议答复',
		area: ['99%', '99%'],
		resize: false,
		content: 'objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&Token='+token,
	});
}

//受理
function openSure(id){
	layer.open({
		type: 2,
		title: '撤回确认',
		area: ['99%', '99%'],
		resize: false,
		content: 'objectionBack.html?dataId='+id+'&Token='+token,
	});
}


