/**
 * 2019-04-10 by zhouyan
 */

var getUrl = config.tenderHost + '/CheckBackController/findExpertCheckState.do';//查询评委所有评审项
var backUrl = config.tenderHost + '/CheckBackController/resetCheck.do';//查询评委所有评审项
var processUrl = config.tenderHost + '/CheckBackController/findCheckFlowState.do';//查询评审流程状态
var backHistoryUrl = config.tenderHost + '/CheckBackController/findBackHistory.do';//查询评审撤回记录
var resultUrl = config.tenderHost + '/BidCheckReportController/buildCheckReport.do';//生成评审报告
var updateStateUrl = config.tenderHost + '/CheckBackController/updateCheckFlowState.do';//修改流程状态
var resetCheckReportUrl = config.tenderHost + '/CheckBackController/resetCheckReport.do';  //撤回评审报告

var pageReport = "Bidding/BidJudge/reviewProgress/model/report.html";   //生成评审报告页面


var supplierId = "";  //当前供应商id
var packageId = "";  //标段id
var checkId = 0;  //评审id
var examType = 2;   //资格审查方式
var raterId = '';//评委id

var experts = '';//	评委名称
var bidChecks = '';//评审项名称
var expertCheckDtos = '';//评审项状态

var bidChecksData = {
	maxLevel:0,
	levelData:{},
	minData:[]
};
var length = 0;

$(function(){
	
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		packageId =  getUrlParam("id");
	};
	if(getUrlParam("examType") && getUrlParam("examType") != "undefined"){
		examType =  getUrlParam("examType");
	};
	
	getAll();//评审记录
	getBackHistory();//评审撤回记录
	getProcess();//评审流程状态
//	console.log(bidChecks)
	
	//刷新当前页面
	$("#btnRefresh").click(function(){
		window.location.reload();
//		parent.window[layero.find('iframe')[0]['name']].location.reload();
	});
	
	//关闭当前页面
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//	回退
	$('#speedTable').on('click','.btn_back',function(){
		var backCheckId = $(this).attr('data-back');
		parent.layer.prompt({title: '请输入回退理由并确认', formType: 2}, function(text, index){
		    parent.layer.close(index);
//		    console.log(text)
//		    layer.alert('演示完毕！您的口令：'+ pass +'<br>您最后写下了：'+text);
		    getBack(backCheckId,text);
		});
	});
	//	重新评审
	$('#speedTable').on('click','.btn_reset',function(){
		var backCheckId = $(this).attr('data-back');
		parent.layer.prompt({title: '请输入重新评审理由并确认', formType: 2}, function(text, index){
		    parent.layer.close(index);
//		    console.log(text)
//		    layer.alert('演示完毕！您的口令：'+ pass +'<br>您最后写下了：'+text);
		    getBack(backCheckId,text);
		});
	});
	//pdf预览
	$('#processTable').on('click','#btnPdfView',function(){
		previewPdf($(this).attr('data-url'));
		
	})
	//生成评审报告
	$('#processTable').on("click", "#btnReport", function(){
		makeResult();
	});
	//重新生成评审报告
	$('#processTable').on("click", "#resetReport", function(){
		$.ajax({
			type:"post",
			url:resetCheckReportUrl,
			data: {
				'bidSectionId': packageId,
				'examType': examType
			},
			success: function(data){
				if(data.success){
					makeResult();
				} else {
					parent.layer.alert(data.message);
				}
			}
		});
	});
	//完结
	$('#processTable').on("click", "#btnEnd", function(){
		updateState();
	});
	
});

/**
 * 从父页面调用的方法
 * @param {Object} data  父页面传过来的参数
 */
function passMessage(data){
	if(data){
		
		$("#projectName").html(data.tenderProjectName);
		$("#projectCode").html(data.tenderProjectCode);
		$("#packageName").html(data.bidSectionName);
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
	}
};

//获取评审记录数据
var thArr = [];
var rowspanNum = 1;
function getAll(){
	$.ajax({
		type:"post",
		url:getUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType
		},
		success: function(data){
			if(!data.success){
				parent.layer.alert(data.message);
				return;
			}
			if(data.success){
				expertCheckDtos = data.data.expertCheckDtos;//评审项状态
				bidChecks = data.data.bidChecks;//评审项名称
				experts = data.data.experts;//评委名称
				bidChecksData = {
					maxLevel:0,
					levelData:{},
					minData:[]
				};
				eachChildren(bidChecks, 0, bidChecksData);
				speedHtml(experts,bidChecksData,expertCheckDtos);
				
			} 
		}
	});
};

/*function getTh(data){
	for(var i = 0;i<data.length;i++){
		var thObj = {}
		if(data[i].bidChecks.length>0){
			getTh(data[i].bidChecks);
			rowspanNum += 1;
		}else{
			thObj.checkName = data[i].checkName;
			thObj.checkId = data[i].id;
			thArr.push(thObj)
		}
		
	}
}*/
/*name: 评委名称
 * term: 评审项名称
 * state: 评审项状态
 */
/*var bidChecksData = {
	maxLevel:0,
	levelData:{},
	minData:[]

};*/
//var length = eachChildren(data.data.bidChecks, 0, bidChecksData);
function speedHtml(name,term,state){
	$('#speedTable').html('');
	var html = ""
	var stateData = {};
	for (var i = 0;i<state.length;i++) {
		stateData[state[i].checkId+state[i].expertName] = state[i].checkState;
	};
//	console.log(stateData)
	//表头
	for(var i = 1;i<=term.maxLevel;i++){
		if(i == 1){
			html += '<tr><th rowspan="'+term.maxLevel+'" style="width:50px;text-align:center;" >序号</th><th rowspan="'+term.maxLevel+'" style="text-align:center;" >评委</th>';
		}else{
			html += '<tr>';
		}
		for(var j = 0;j < term.levelData[i].length;j++){
			
			var rowspan ;
			var tdData = term.levelData[i][j];
			if(tdData.row == 0){
				rowspan = 1
			}else{
				rowspan = bidChecksData.maxLevel - tdData.row + 1;
			};
			html += '<th style="text-align:center;"  rowspan="'+rowspan+'" colspan="'+tdData.col+'">'+tdData.checkName+'</th>';
		}
		html += '</tr>';
	}

	term = term.minData;
	for (var i = 0;i<name.length;i++) {
		html += "<tr><td>"+(i+1)+"</td><td>"+name[i].expertName+"</td>";
		for (var j = 0;j<term.length;j++) {
			html += "<td>";
//			console.log(stateData[term[j].checkId+name[i].expertName])
			if(stateData[term[j].id+name[i].expertName] && stateData[term[j].id+name[i].expertName] == 1){
				html +=  "<span style='color:green;'>已完成</span>";
			}else{
				html += "<span style='color:red;'>未完成</span>";
			}
			html += "</td>"
		}
		html +="</tr>"; 
	}
	html += '<tr>';
	for (var j = 0;j<term.length;j++) {
		var flag = false;
		for (var i = 0;i<name.length;i++) {
			
//			if(!stateData[term[j].id+name[i].expertName] || stateData[term[j].id+name[i].expertName] == 2){
//				flag = false;
//				break;
//			}
			if(stateData[term[j].id+name[i].expertName] && stateData[term[j].id+name[i].expertName] == 1){
				flag = true;
				break;
			}
			
		}
		if(flag){
			if(j == 0){
				html += '<td colspan="2"><button type="button" class="btn btn-danger btn-sm btn_reset" data-back="'+term[j].id+'">重新评审</button></td>';
			}
			html += '<td><button type="button" class="btn btn-primary btn-sm btn_back" data-back="'+term[j].id+'">退回到此阶段</button></td>';
		}else{
			if(j == 0){
				html += '<td colspan="2"></td>';
			}
			html += '<td></td>';
		}
	}
	html += "</tr>";
//		console.log(html)
	$('#speedTable').append(html);
//	console.log(stateData)
	
};
//回退
function getBack(backId,excuse){
	$.ajax({
		type:"post",
		url:backUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType,
			'backCheckId': backId,
			'remark': excuse,
		},
		success: function (data){
			if(data.success){
				getAll();//刷新评审记录
				getBackHistory();//刷新评审撤回记录
				getProcess();//刷新评审流程状态
			}
		}
	});
};
//获取查询评审流程状态数据
function getProcess(){
	$.ajax({
		type:"post",
		url:processUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType
		},
		success: function (data){
			if(!data.success){
				parent.layer.alert(data.message);
				return;
			}
			if(data.success && data.data){
				processHtml(data.data)
//				console.log(data.data)
			} 
		}
	});
	
};
//评审流程状态页面展示
function processHtml(data){
	$("#processTable tr:gt(0)").remove();
	var content = ''
	if(data.checkReport && data.checkReport == 1){
		content = '<button type="button" class="btn btn-primary btn-sm" id="btnPdfView" data-url="'+data.checkReportUrl+'">'
			+'<span class="glyphicon glyphicon-eye-open"></span>预览'
		+'</button>';
//		if(data.checkResult == 0){
//			content += '<button type="button" class="btn btn-primary btn-sm" id="resetReport">'
//			+'<span class="glyphicon glyphicon-eye-open"></span>重新生成评审报告'
//		+'</button>'
//		}
	}else {
		if(data.checkResult == 1){
			content = '<button type="button" class="btn btn-primary btn-sm" id="btnReport">'
				+'<span class="glyphicon glyphicon-eye-open"></span>去生成评审报告'
			+'</button>';
			
		} else {
			content = '<span style="color:red;">未完成</span>';
		}
	}
//	content = '<button type="button" class="btn btn-primary btn-sm" id="btnReport">'
//				+'<span class="glyphicon glyphicon-eye-open"></span>去生成评审报告'
//			+'</button>';
	var tr = '';
	tr = '<tr>'
			+'<td>'+state(data.signIn)+'</td>'
			+'<td>'+state(data.setChairMan)+'</td>'
			+'<td>'+state(data.checkResult)+'</td>'
			+ '<td>'+content+'</td>';
	if(data.checkResult == 1 && data.isEnd == 0){
		tr += '<td><button type="button" class="btn btn-primary btn-sm" id="btnEnd">'
				+'<span class="glyphicon glyphicon-ok"></span>完结'
			+'</button></td>';
	} else {
		tr += '<td>'+state(data.isEnd)+'</td>';
	}
	tr += '</tr>'
	$(tr).appendTo('#processTable');
};
function state(data){
	if(data && data == 1){
		return '<span style="color:green;">已完成</span>';
	}else{
		return '<span style="color:red;">未完成</span>';
	}
	
};
//获取查询评审撤回记录
function getBackHistory(){
	$.ajax({
		type:"post",
		url:backHistoryUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType
		},
		success: function (data){
			if(data.success){
				backHistoryHtml(data.data);
			}
		}
	});
	
};
//评审撤回记录页面展示
function backHistoryHtml(data){
	$('#backHistory tbody').html('');
	var trHtml = '';
	for(var i = 0;i<data.length;i++){
		trHtml = '<tr>'
			+'<td>'+(i+1)+'</td>'
			+'<td>'+data[i].checkName+'</td>'
			+'<td>'+data[i].remark+'</td>'
			+'<td>'+data[i].employeeName+'</td>'
			+'<td>'+data[i].createTime+'</td>'
		+'</tr>'
	};
	$(trHtml).appendTo('#backHistory tbody');
};
//生成评审报告
function makeResult(){
	parent.layer.open({
		type: 2,
		title: "评审记录汇总",
		area: ["100%", "100%"],
		resize: false,
		content: pageReport+"?packageId=" + packageId + "&examType=" + examType,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.passMessage(getProcess);  //调用子窗口方法，传参
		}
	});
//	$.ajax({
//		type:"post",
//		url:resultUrl,
//		async:true,
//		data: {
//			'bidSectionId': packageId,
//			'examType': examType
//		},
//		success: function (data){
//			if(data.success){
////				backHistoryHtml(data.data);
//			}
//		}
//	});
};

//修改评审状态
function updateState(){
	$.ajax({
		type:"post",
		url:updateStateUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType,
			'isEnd': 1
		},
		success: function (data){
			if(!data.success){
				parent.layer.alert(data.message);
				return;
			}
			parent.layer.alert("已完结");
			getProcess();
		}
	});	
}
var arr = [
{
	"id":"1",
	"pid":"0",
	"tenderProjectId":"8b79c29528ba44769bab23ffb085e562",
	"bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac",
	"examType":2,"checkName":"初步评审标准",
	"checkType":0,
	"sort":1,
	"createTime":"2019-04-03 00:00:00",
	"bidChecks":[
		{"id":"2","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"形式评审标准","checkType":0,"sort":2,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0},
		{"id":"3","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"资格评审标准(后审)","checkType":0,"sort":2,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0},
		{"id":"4","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"响应性评审标准","checkType":0,"sort":2,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0}
	],
	"checkState":0
},
{
	"id":"5",
	"pid":"0",
	"tenderProjectId":"8b79c29528ba44769bab23ffb085e562",
	"bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac",
	"examType":2,
	"checkName":"分值构成与评分标准",
	"checkType":3,
	"score":100,
	"scoreType":0,
	"sort":1,
	"createTime":"2019-04-03 00:00:00",
	"bidChecks":[
		{"id":"6","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"资格评审标准1","checkType":0,"sort":2,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0},
		{
			"id":"7",
			"pid":"6",
			"tenderProjectId":"8b79c29528ba44769bab23ffb085e562",
			"bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac",
			"examType":2,
			"checkName":"资格评审标准2",
			"checkType":0,
			"sort":2,
			"createTime":"2019-04-03 00:00:00",
			"bidChecks":[
				{"id":"8","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"资格评审标准3","checkType":0,"sort":3,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0},
				{"id":"9","pid":"6","tenderProjectId":"8b79c29528ba44769bab23ffb085e562","bidSectionId":"2ab2099b5009470ba9ab27bd3eff67ac","examType":2,"checkName":"资格评审标准4","checkType":0,"sort":3,"createTime":"2019-04-03 00:00:00","bidChecks":[],"checkState":0},
			],
			"checkState":0
		},
	],
	"checkState":0
}]

function eachChildren(bidChecks, level, bidChecksData){
	var col = 0;
	var row = 0;
	if(bidChecks && bidChecks.length>0){
		level = level== undefined  ? 1:level+1;
		if(bidChecksData.maxLevel < level){
				bidChecksData.maxLevel = level;
			}
		for(var i=0; i< bidChecks.length; i++){
			bidChecks[i].level = level;
			bidChecks[i].col = eachChildren(bidChecks[i].bidChecks, bidChecks[i].level, bidChecksData);
			
			if(!bidChecksData.levelData[bidChecks[i].level]){
				bidChecksData.levelData[bidChecks[i].level]=[];
			}
			bidChecksData.levelData[bidChecks[i].level].push(bidChecks[i]);
			
			if(!bidChecks[i].bidChecks || bidChecks[i].bidChecks.length ==0){
				bidChecksData.minData.push(bidChecks[i]);
				bidChecks[i].row = bidChecks[i].level;
			}else{
				bidChecks[i].row = 0;
			}
			
			if(bidChecks[i].col == 0){
				bidChecks[i].col = 1
				
			}
			col += bidChecks[i].col; 
		}
	}
	return col;
}







