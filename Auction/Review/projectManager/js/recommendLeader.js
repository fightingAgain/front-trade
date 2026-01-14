var leaderHisData;
$(function(){
	getRecommendInfo();
	findRecommendHistory();
	//历史次数切换
	$("#hisSelect").off("change").on('change',function(){
		leaderLs($(this).val());
	})
	//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
	if(progressList.isShowExplain && progressList.isShowExplain == 1){
		$('.showExplain').show();
	}else{
		$('.showExplain').hide();
	}
});
function getRecommendInfo(){
	$.ajax({
	    type: "get",
	    url: url + "/ExpertRecommendController/findExpertLeaderInfo.do",
	    data: {
	        packageId: packageId,
	        examType: examType
	    },
	    async: false,
	    success: function (response) {
	        if (response.success) {
				showRecommendResult(response.data);
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
};
function findRecommendHistory(){
	$.ajax({
	    type: "get",
	    url: url + "/ExpertRecommendController/findExpertRecommendHistoryList.do",
	    data: {
	        packageId: packageId,
	        examType: examType
	    },
	    async: false,
	    success: function (response) {
	        if (response.success) {
				leaderHisData=response.data;
				var options="";
				if(leaderHisData.length>0){
				    for(var i=leaderHisData.length-1;i>=0;i--){
				        options+='<option value="'+ i +'">第'+ (i+1) +'次</option>';
				    }
				}else{
				    options='<option value="">无历史次数</option>';
				}
				$("#hisSelect").html(options);
				leaderLs(leaderHisData.length-1);
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
};
function showRecommendResult(data){
    if(data.recommendResult==2) {//已选出组长
		if(data.msg){
			top.layer.alert(data.msg, {title: '组长推选成功！'});
		};
		imNoIsLeader(data.expertName);
    }else if(data.recommendResult==0){//推荐中, 未推选出组长
		$('.expertList').html('组长推荐中，请稍后。。。')
    }else{
		if(data.msg){
			top.layer.alert(data.msg);
		}
    }
};
//当前登陆人为组长的页面样式
function imIsLeader(isCheck){
	parent.$('#isLeader').html('（评审组长）')
    $(".recommendLeaderTable").hide();
};

//当前登陆人不是组长的页面样式
function imNoIsLeader(expertName){
    $(".recommendLeaderTable .expertTile").html("组长");
    $(".recommendLeaderTable .expertList").html(expertName);
};
//推荐记录列表
function recommend(expertList){
	$("#leaderLs").bootstrapTable({
		columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'expertName',
				title: '评委名称'
			},
			{
				field: 'recommendCount',
				title: '得票数'
			},			
		]
	});
	$("#leaderLs").bootstrapTable('load',expertList)
};
//推荐历史列表
function leaderLs(num){
	var data=[];
	if(leaderHisData.length>0){
		data=leaderHisData[num].expertChairManInfoList
	};
    recommend(data);
}