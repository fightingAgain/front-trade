/**
*  zhouyan 
*  2019-4-1
*  查看评委组
*  方法列表及功能描述
*
*/
var memberUrl = config.tenderHost + '/ExpertRecommendController/findExpertMembers.do';//查询评审委员会信息
var resultUrl = config.tenderHost + '/ExpertRecommendController/findChecksList';//根据投票轮次查询专家投票纪录详情，不传frequencyCount则查询最后一轮的投票详情。

var recommendHtml = 'Bidding/BidJudge/JudgeScore/model/recommendLeader.html';//重新推荐组长页面
var bidId = '';//标段Id
var examType = '';//资格审查方式 1为资格预审，2为资格后审
var members = '';//评审委员会成员
var result = [];//接收查询的最新推荐数据
var num;//推荐轮次
var chairManId = '';//在最后一轮中推荐的评委id，有则该评委已投票，无则未投票
$(function(){
	//标段Id
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		bidId =  getUrlParam("id");
	};
	//资格审查方式 1为资格预审，2为资格后审
	if(getUrlParam("examType") && getUrlParam("examType") != "undefined"){
		examType =  getUrlParam("examType");
	};
	if(getUrlParam("chairManId") && getUrlParam("chairManId") != "undefined"){
		chairManId =  getUrlParam("chairManId");
	};
	var newResult = {'bidSectionId':bidId,'examType':examType};
	getResult(newResult);
	
	//关闭
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	$('#resultNum').change(function(){
		var selectNum = $('#resultNum').val();
		console.log(selectNum);
		var historyResult = {'bidSectionId':bidId,'examType':examType,'frequencyCount':selectNum};
		getHistory(historyResult);
	});
	//重新推荐组长按钮
	$('#recommendAgain').click(function(){
//		parent.layer.closeAll();
		parent.layer.open({
			type: 2,
			title: '推荐组长',
			area: ['600px', '500px'],
			content: recommendHtml+'?id='+bidId+'&examType='+examType,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
			}
		});
	})
	
	
});

function getMember(rowData){
	//获取评委会成员
	$.ajax({
		type:"post",
		url:memberUrl,
		async:true,
		data:{
			'packageId': bidId,
			'examType': examType
		},
		success: function(data){
//			console.log(data)
			var memberList = data.data;
			var cells = [];
			if(data.success){
				for(var i = 0;i<memberList.length;i++){
					if(memberList[i].isChairMan == 1){
						cells.push(memberList[i].expertName + '（组长）');
						
					}else {
						cells.push(memberList[i].expertName)
					}
				}
				$('#member').html(cells.join('，'));
			}
		}
	});
	$('#interiorBidSectionCode').html(rowData.interiorBidSectionCode);
	$('#bidSectionName').html(rowData.bidSectionName);
	
};
/*最新的推选结果
 * data：传给后台的数据
 */
function getResult(data){
	$.ajax({
		type:"post",
		url:resultUrl,
		async:true,
		data: data,
		success: function(data){
			if(data.success){
				result = data.data;
				
				num = result.frequencyCount;
//				console.log(num);
				//判断是否有历史记录
				if(num>1){
					$('#resultNumWrap').css('display','table-row');
					getOption(num-1)
					var historyResult = {'bidSectionId':bidId,'examType':examType,'frequencyCount':(num-1)};
					getHistory(historyResult);
				}else{
					var fail = '<tr><td colspan="4" style="text-align:center"><span style="color:red">无历史记录</span></td></tr>';
					$(fail).appendTo('#recommendHistory')
				};
				//判断投票是否有结果，结果怎样
				if(result.recommendResult == 0){
					var fail = '<tr><td colspan="3" style="text-align:center"><span style="color:red">推荐中，还未产生结果...</span></td></tr>';
					$(fail).appendTo('#recommendResult tbody');
					//状态为投票中，但没有chairManId（该评委还未投票），出现重新推荐按钮
					if(chairManId == ''){
						$('#recommendAgain').css('display','inline-block');
						$('#recommendAgain').closest('td').addClass('padding_button');
					}
				}else if(result.recommendResult == 1){
					//状态为未选出组长 ，出现重新推荐按钮
					$('#recommendAgain').css('display','inline-block');
					$('#recommendAgain').closest('td').addClass('padding_button')
					resultHtml(result.recommendDtos);
//					var newResult = {'bidSectionId':bidId,'examType':2};
//					getResult(newResult);
				}else if(result.recommendResult == 2){
					resultHtml(result.recommendDtos);
					/*var newResult = {'bidSectionId':bidId,'examType':2};
					getResult(newResult);*/
				}
//				resultHtml(result.recommendDtos);
			}
		}
	});
};
/*历史推选结果
 * data：传给后台的数据
 */
function getHistory(data){
	$.ajax({
		type:"post",
		url:resultUrl,
		async:true,
		data: data,
		success: function(data){
			if(data.success){
				historyHtml(data.data.recommendDtos)
			}
		}
	});
}
//投票结果
function resultHtml(data){
	$('#recommendResult tbody').html('');
	var tr = '';
	for (var i = 0;i<data.length;i++) {
		tr += '<tr>'
			+'<td style="width: 50px;text-align:center;">'+(i+1)+'</td>'
			+'<td>'+data[i].expertName+'</td>'
			+'<td style="width: 100px;text-align:center;">'+data[i].recommendCount+'</td></tr>'
	};
	
	$(tr).appendTo('#recommendResult tbody');
}
//历史记录
function historyHtml(data){
	$('#recommendHistory').html('');
	var thead = '<thead><tr><th style="width: 50px;text-align:center;">序号</th><th>评委</th><th style="width: 100px;text-align:center;">得票数</th></tr></thead>'
		+'<tbody></tbody>';
	$(thead).appendTo('#recommendHistory');
//	var option = ''
	var tr = '';
	for (var i = 0;i<data.length;i++) {
		tr += '<tr>'
			+'<td style="width: 50px;text-align:center;">'+(i+1)+'</td>'
			+'<td>'+data[i].expertName+'</td>'
			+'<td style="width: 100px;text-align:center;">'+data[i].recommendCount+'</td></tr>'
	};
	$(tr).appendTo('#recommendHistory tbody');
}
function getOption(data){
	var options = '';
	for (var i = 0;i<data;i++) {
		options += '<option value="'+(i+1)+'">第'+(i+1)+'次推荐结果</option>'
	}
	$(options).appendTo('#resultNum');
}
