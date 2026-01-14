
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
});
/*function refreshFather(callback){
	$("#btnSub").click(function(e){
		e.stopPropagation();
		if(checkForm($("#formName"))){
			saveTime(callback);
		};
		
	});
}*/
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
							$(timeNames[j]).next("td").find("span").html(arr[i].planStartTime);
						}
					}
//					$('#'+key).val(arr[key])
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
					$('#workPlan').html(arr.workPlan)
				}
				
				/*for(var i = 0;i<arr.length;i++){
					$('#'+key).val(arr[key])
				}*/
			}
		}
	});
}



