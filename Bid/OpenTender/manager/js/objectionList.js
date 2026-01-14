
var token = $.getUrlParam("Token");
var bidId = $.getUrlParam("bidId");	//标段id
var VG = $.getUrlParam("VG");	//查看1，项目经理0
var states = $.getUrlParam("states");	//标段状态
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
		url: config.OpenBidHost + '/ObjectionAnswersController/findProjectGroupList.do',
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
					var isShowResult = 0
					if(data.data[i].submitTime){
						var submitTime = Date.parse(new Date(data.data[i].submitTime.replace(/\-/g, "/")));
						var onLineTime = top.OBJECTION_ONLINE_TIME
						var onLineTime = Date.parse(new Date(onLineTime.replace(/\-/g, "/")));
						if(submitTime>onLineTime){
							isShowResult = 1;
						}
					}
					
					var str = "";//状态
					var but = "";//按钮
					var strSign = '<button  type="button" class="btn btn-primary btn-sm" onclick="openSign(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-edit"></span>签收</button>';
					var strSure = '<button  type="button" class="btn btn-primary btn-sm" onclick="openSure(\''+data.data[i].id+'\')"><span class="glyphicon glyphicon-edit"></span>确认</button>';
					var strAccept = '<button  type="button" class="btn btn-primary btn-sm" onclick="openAccept(\''+data.data[i].id+'\',\''+data.data[i].status+'\')"><span class="glyphicon glyphicon-edit"></span>受理</button>';
					var strReply = '<button  type="button" class="btn btn-primary btn-sm" onclick="openReply(\''+data.data[i].id+'\',\''+data.data[i].status+'\',\''+isShowResult+'\')"><span class="glyphicon glyphicon-edit"></span>答复</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm" onclick="openView(\''+data.data[i].id+'\',\''+data.data[i].status+'\',\''+isShowResult+'\')"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strDeal = '<button  type="button" class="btn btn-primary btn-sm" onclick="openDealResult(\''+data.data[i].id+'\')">异议处理完毕</button>';
					
					switch(data.data[i].status) {
				    	case "1": str = "未签收"; but = strSign; break;
				    	case "2": str = "已签收"; but = strAccept+strView ; break;
				    	case "3": str = "未受理"; but = strAccept+strView ; break;
				    	case "4": str = "已受理"; but = strReply+strView ; break;
				    	case "5": str = "不予受理"; but = strView ; break;
				    	case "6": str = "未答复"; but = strReply+strView ; break;
				    	case "7": str = "已答复"; but = strView; break;
				    	case "8": str = "申请撤回"; but = strSure + strView; break;
				    	case "9": str = "已撤回"; but = strView ; break;
				    }
					
					if(VG == 1){
						but = strView;
					}else if(states == 4){
						//标段结束，自能查看
						but = strView;
					}
					
					if(!data.data[i].isOver && data.data[i].status == 7 && isShowResult == 1){
						but += strDeal;
					}
					
					var ui = "<tr><td>"+(i+1)+"</td><td>"+data.data[i].interiorBidSectionCode+"</td><td>"+data.data[i].bidSectionName+"</td>"
					+"<td>"+(data.data[i].objectionTitle == undefined ? '' : data.data[i].objectionTitle)+"</td><td>开标</td><td>"+str+"</td><td>"+but+"</td></tr>";
					
					$("#objectionData").append(ui);
				}
			}	
		}
	})
}

//查看
function openView(id,status,isShowResult){
	top.layer.open({
		type: 2,
		title: '查看异议',
		area: ['1200px', '600px'],
		resize: false,
		content: 'OpenTender/manager/model/objectionView.html?dataId='+id+'&status='+status+'&isShowResult='+isShowResult+'&Token='+token,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
}

//签收
function openSign(id,status){
	top.layer.open({
		type: 2,
		title: '异议受理',
		area: ['1200px', '600px'],
		resize: false,
		content: 'OpenTender/manager/model/objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&Token='+token,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
}

//受理
function openAccept(id,status){
	top.layer.open({
		type: 2,
		title: '异议受理',
		area: ['1200px', '600px'],
		resize: false,
		content: 'OpenTender/manager/model/objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&Token='+token,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
}

//受理
function openReply(id,status,isShowResult){
	top.layer.open({
		type: 2,
		title: '异议答复',
		area: ['1200px', '600px'],
		resize: false,
		content: 'OpenTender/manager/model/objectionEdit.html?dataId='+id+'&state='+status+'&bidId='+bidId+'&isShowResult='+isShowResult+'&Token='+token,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
}

//受理
function openSure(id){
	top.layer.open({
		type: 2,
		title: '撤回确认',
		area: ['1200px', '600px'],
		resize: false,
		content: 'OpenTender/manager/model/objectionBack.html?dataId='+id+'&Token='+token,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
}

//受理
function openDealResult(id){
	parent.layer.confirm('温馨提示：异议处理完毕后，对本异议不能再新增回复。', {
		btn: ['确定', '取消'] //可以无限个按钮
	}, function(index, layero){
		openDeal(id);
		parent.layer.close(index);			 
	}, function(index){
		 parent.layer.close(index)
	});
}
//异议处理结果
function openDeal(id) {
	top.layer.open({
		type: 2,
		title: '异议处理结果',
		area: ['360px', '240px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: 'Bidding/ObjectionManage/Manager/model/objectionResult.html?dataId=' + id +'&Token='+token,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(initDataTab);  //调用子窗口方法，传参
		}
	});
};


