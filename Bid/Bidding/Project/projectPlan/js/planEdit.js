
var saveUrl = config.tenderHost + '/TenderProjectPlanController/saveBidSectionPlan.do';//保存

var getTimeUrl = config.tenderHost + '/TenderProjectPlanController/getAllDateList.do';//未编辑时获取时间
var getAllTimeUrl = config.tenderHost + '/TenderProjectPlanController/selectBidSectionTimePlan.do';//编辑时获取时间


var getMarksUrl = config.tenderHost + '/TenderProjectPlanController/selectBidSectionPlan.do';//获取备注信息

var bidId = '';//标段id
var examType = '';
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		 bidId = $.getUrlParam('id');
	}
	if($.getUrlParam('examType') && $.getUrlParam('examType') != undefined){
		 examType = $.getUrlParam('examType');
	}
	if($.getUrlParam('state') && $.getUrlParam('state') != undefined){
		if($.getUrlParam('state') == 0){
			getTime(bidId)
		}else if($.getUrlParam('state') == 1){
			getAllTime(bidId);
			getMark(bidId)
		}
	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	$('#noticeSendTime').datetimepicker({
		step:5,
		lang:'ch',
		format:'Y-m-d H:i',
	    onClose: function(dateText, inst) {
	    	var selectTime = inst[0].value.replace(/\-/g,"/");//选中的时间
	    	var timeArr = [];
	    	var times = $('.time');
	    	$.each(times, function() {
	    		if($(this).val() != '' && $(this).val() != undefined){
	    			timeArr.push($(this).val())
	    		}
			});
			if(selectTime && selectTime != ''){
		    	if(timeArr.length == 0){
		    		console.log(selectTime)
		    		$('#noticeEndTime').val(automatic(selectTime,5));//招标公告发布截止时间
		    		$('#docSendTime').val(automatic(selectTime,0));//招标文件发布时间
		    		$('#clarifyEndTime').val(automatic(selectTime,17));//提出澄清截止时间
		    		$('#answersEndDate').val(automatic(selectTime,19));//答复截止时间
		    		$('#bidDocReferEndTime').val(automatic(selectTime,20));//投标文件递交截止时间
		    		$('#bidOpenTime').val(automatic(selectTime,20));//开标时间
		    		$('#formatTime').val(automatic(selectTime,19));//评审委员会组建时间
		    		$('#checkStartDate').val(autoHoure(automatic(selectTime,20).replace(/\-/g,"/"),1));//评标时间
		    		$('#publicityStartTime').val(automatic(selectTime,21));//中标候选人公示开始时间
		    		$('#publicityEndTime').val(automatic(selectTime,24));//中标候选人公示截止时间
		    		$('#sureBidderTime').val(automatic(selectTime,24));//确定中标人时间
		    		$('#bidderNoticeTime').val(automatic(selectTime,24));//中标结果通知书发送时间
		    		$('#contractTime').val(automatic(selectTime,39));//中标合同备案时间
		    	}
		    }
	       
	    }
	}); 
	//重置时间
	$("#emptyTime").click(function(){
		$('.time').val('');
		$('#noticeSendTime').val('');
	})
	
});
function refreshFather(callback){
	$("#btnSub").click(function(e){
		e.stopPropagation();
		if(checkForm($("#formName"))){
			var  noticeSendTime = Date.parse(new Date($('#noticeSendTime').val().replace(/\-/g,"/")));		//招标公告发布开始时间
			var  noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g,"/")));		//招标公告发布截止时间
			var  docSendTime = Date.parse(new Date($('#docSendTime').val().replace(/\-/g,"/")));		//招标文件发布时间
			var  clarifyEndTime = Date.parse(new Date($('#clarifyEndTime').val().replace(/\-/g,"/"))); 		//提出澄清截止时间
			var  answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g,"/"))); 		//答复截止时间
			var  bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g,"/"))); 		//投标文件递交截止时间
			var  bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g,"/"))); 		//开标时间
			var  formatTime = Date.parse(new Date($('#formatTime').val().replace(/\-/g,"/"))); 		//评审委员会组建时间
			var  checkStartDate = Date.parse(new Date($('#checkStartDate').val().replace(/\-/g,"/"))); 		//评标时间
			var  publicityStartTime = Date.parse(new Date($('#publicityStartTime').val().replace(/\-/g,"/"))); 		//中标候选人公示开始时间
			var  publicityEndTime = Date.parse(new Date($('#publicityEndTime').val().replace(/\-/g,"/"))); 		//中标候选人公示截止时间
			var  sureBidderTime = Date.parse(new Date($('#sureBidderTime').val().replace(/\-/g,"/"))); 		//确定中标人时间
			var  bidderNoticeTime = Date.parse(new Date($('#bidderNoticeTime').val().replace(/\-/g,"/"))); 		//中标结果通知书发送时间
			var  contractTime = Date.parse(new Date($('#contractTime').val().replace(/\-/g,"/"))); 		//中标合同备案时间
			if(noticeEndTime <= noticeSendTime){
				parent.layer.alert('招标公告发布截止时间应在招标公告发布开始时间后！',{icon:2,title:'提示'});
				return
			}
			if(noticeEndTime < docSendTime || noticeSendTime > docSendTime){
				parent.layer.alert('招标文件发布时间应在公告期内！',{icon:2,title:'提示'});
				return
			}
			if(clarifyEndTime < noticeEndTime){
				parent.layer.alert('提出澄清截止时间应在招标公告发布截止时间之后！',{icon:2,title:'提示'});
				return
			}
			if(answersEndDate < clarifyEndTime){
				parent.layer.alert('答复截止时间应在提出澄清截止时间之后！',{icon:2,title:'提示'});
				return
			}
			if(noticeEndTime > bidOpenTime){
				parent.layer.alert('开标时间应在公告发布截止时间之后！',{icon:2,title:'提示'});
				return
			}
			if(bidDocReferEndTime > bidOpenTime || bidDocReferEndTime <= docSendTime ){
				parent.layer.alert('投标文件递交截止时间应在开标之前,招标文件发布时间之后！',{icon:2,title:'提示'});
				return
			}
			if(checkStartDate < bidOpenTime){
				parent.layer.alert('评标时间应在开标时间之后！',{icon:2,title:'提示'});
				return
			}
			if(formatTime < noticeSendTime || formatTime > checkStartDate){
				parent.layer.alert('评审委员会组建时间应在招标公告发布开始时间之后，评标时间之前！',{icon:2,title:'提示'});
				return
			}
			if(publicityStartTime < checkStartDate){
				parent.layer.alert('中标候选人公示开始时间应在评标时间之后！',{icon:2,title:'提示'});
				return
			}
			if(publicityEndTime < publicityStartTime){
				parent.layer.alert('中标候选人公示截止时间应在中标候选人公示开始时间之后！',{icon:2,title:'提示'});
				return
			}
			if(sureBidderTime < publicityEndTime){
				parent.layer.alert('确定中标人时间应在中标候选人公示截止时间之后！',{icon:2,title:'提示'});
				return
			}
			if(bidderNoticeTime < sureBidderTime){
				parent.layer.alert('中标结果通知书发送时间应在确定中标人时间之后！',{icon:2,title:'提示'});
				return
			}
			if(contractTime < bidderNoticeTime){
				parent.layer.alert('中标合同备案时间应在中标结果通知书发送时间之后！',{icon:2,title:'提示'});
				return
			}
			saveTime(callback);
		};
		
	});
}
//保存
function saveTime(callback){
	var saveData = [];
	var timeNames = $(".timeName");
	$.each(timeNames, function() {
		var timeName = $(this).text();
		timeName = timeName.split("*")[0];
		var time = $(this).next("td").find("input").val();
		saveData.push({"planName":timeName,"planStartTime":time,'bidSectionId': bidId,'states':'0'})
	});
	$.ajax({
		type:"post",
		url:saveUrl,
		async:true,
		data: {
			'bidSectionId': bidId,
			'workPlan': $('#workPlan').val(),
			'bidSectionTimePlans': saveData
		},
		success: function(data){
			if(data.success){
				parent.layer.alert('标段时间信息设置成功！',{icon:6,title:'提示'},function(index){
					var ind=parent.layer.getFrameIndex(window.name);
					callback(bidId)
        			parent.layer.close(ind);
        			parent.layer.close(index);
				})
			}
		}
	});
};
function getTime(id){
	$.ajax({
		type:"post",
		url:getTimeUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				for(var key in arr){
					$('#'+key).val(arr[key])
				}
			}
		}
	});
};
function getAllTime(id){
	$.ajax({
		type:"post",
		url:getAllTimeUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				var timeNames = $(".timeName");
				for(var j = 0;j<timeNames.length;j++){
					var timeName = $(timeNames[j]).text().split("*")[0];
					
					for(var i = 0;i<arr.length;i++){
						var planName = arr[i].planName;
						if(planName == timeName){
							$(timeNames[j]).next("td").find("input").val(arr[i].planStartTime);
						}
					}
				}
			}
		}
	});
};
//获取备注信息
function getMark(id){
	$.ajax({
		type:"post",
		url:getMarksUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				if(arr.workPlan){
					$('#workPlan').val(arr.workPlan)
				}
			}
		}
	});
}



