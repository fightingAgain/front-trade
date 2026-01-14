var leaderHisData;
var experts;
$(function(){
	getRecommendInfo();
	findRecommendHistory();
	
	//历史次数切换
	$("#hisSelect").off("change").on('change',function(){
		leaderLs($(this).val());
	});
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
	        expertId: expertIds,
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
	        expertId: expertIds,
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
				/* if(response.data && response.data.expertChairManInfoList){
					recommend(response.data.expertChairManInfoList);
				} */
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
};
function showRecommendResult(data){
	$('#stopCheck').hide();
	experts = data.experts
    // $('#btn-box').html('');
    if(data.recommendResult==2) {//已选出组长
		$('#stopCheck').show();
		if(progressList.autoReOrderShow == 1){
			$('#fileCheck, #downloadAllFile').show();
		}
		if(data.msg){
			top.layer.alert(data.msg, {title: '组长推选成功！'});
		};
        if (data.isLeader == 0) {//当前登录人是否是组长
            imNoIsLeader(data.expertName);
        } else {
            imIsLeader(data.isCheck);
            
        }
    }else if(data.recommendResult==0){//推荐中, 未推选出组长
        if(data.isSetFinish==0){//当前一轮推荐未投票
            getRecommendExperts(memberList);
        }else{
        	$('.expertList').html('组长推荐中，请稍后。。。')
            /* if(data.expertChairManList){
            	recommend(data.expertChairManList)
            } */
        }
    }else{
		if(data.msg){
			top.layer.alert(data.msg);
		}
        getRecommendExperts(memberList);
    }

};
//当前登陆人为组长的页面样式
function imIsLeader(isCheck){
	parent.$('#isLeader').html('（评审组长）')
    $(".recommendLeaderTable").hide();
};

//当前登陆人不是组长的页面样式
function imNoIsLeader(expertName){
	parent.$('#isLeader').html('（评审组员）')
    $(".recommendLeaderTable .expertTile").html("组长");
    $(".recommendLeaderTable .expertList").html(expertName);
};
//获取评委列表
function getRecommendExperts(callback){
    callback(experts);
}
//推荐组长
function memberList(experts){
	var expertList=""
	for (var i = 0;i<experts.length;i++) {
        expertList += '<span style="margin-right:10px"><input type="radio" class="" name="chairManId" value="'+experts[i].id+'">'+experts[i].expertName+'</span>'
	};
	// if(isEnd==0){
        expertList += '<span><input type="button" class="btn btn-primary" value="确定" onclick="save()"></span>';
	// }
	//reviewRoleType 评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人 评委才能推选组长
	// if(reviewRoleType == 1 || reviewRoleType == 2){
		$(".recommendLeaderTable .expertTile").html("推选组长");
		$(".recommendLeaderTable .expertList").html(expertList);
	// }
	findRecommendHistory();	
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
//推荐
function save(){
	$.ajax({
	    type: "get",
	    url: url + "/ExpertRecommendController/saveExpertChairMan.do",
	    data: {
	        packageId: packageId,
	        expertId: expertIds,
	        examType: examType,
			"chairManId": $("input[name='chairManId']:checked").val(),
	    },
	    async: false,
	    success: function (response) {
	        if (response.success) {
	           top.layer.alert('投票成功！', {icon: 1,title: '提示'});
			   getRecommendInfo();
			   findRecommendHistory();
	        }else{
				top.layer.alert(response.message);
			}
	    }
	});
}
//推荐历史列表
function leaderLs(num){
	var data=[];
	if(leaderHisData.length>0){
		data=leaderHisData[num].expertChairManInfoList
	};
    recommend(data);
}