/**
*  推荐组长
*  方法列表及功能描述
*/

var leaderHisData;
var recommendResultTask;
function recommendLeader(node){
    var flag = false;
    var param = {
        "nodeType":"recommendLeader",
        "method":"getRecommendInfo",
    };
    reviewFlowNode(param, function(data){
    	if($(".recommendLeaderTable").length == 0){
            $("#content").load('model/recommendLeader/content.html', function(){
				//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
				if(getExplainState() == 1){
					$('.showExplain').show();
				}
                showRecommendResult(data);
            });

		}else{
            showRecommendResult(data);
        }
        if(data.isCanStart){
            $('#btn-box').load('model/recommendLeader/button.html');
        }else{
            $('#btn-box').html('');
        }
        flag = true;
    },false);
    return flag;
}

/**
 * 下达开始评标指令
 */
$('#btn-box').on("click","#flowStart",function(){
	testSettingsIsComplete(function(){
		flowiInstruct('start', function(){
		    top.layer.alert('下达指令成功');
		    $("#flowStart").hide();
		});
	})
});


function showRecommendResult(data){
    $('#btn-box').html('');
    if(data.recommendResult==2) {//已选出组长
		if(data.msg){
			top.layer.alert(data.msg, {title: '组长推选成功！'});
		};
        if (data.isLeader == 0) {//当前登录人是否是组长
            imNoIsLeader(data.expertName);
        } else {
            imIsLeader(data.isCheck);
            
        }
        if(recommendResultTask){
            clearTimeout(recommendResultTask);
            recommendResultTask = null;
        }
        isStopTab = true;
    }else if(data.recommendResult==0){//推荐中, 未推选出组长
        if(data.isSetFinish==0){//当前一轮推荐未投票
            getRecommendExperts(memberList);
        }else{
        	$('.expertList').html('组长推荐中，请稍后。。。')
            isStopTab = false;
            if(recommendResultTask){
                clearTimeout(recommendResultTask);
                recommendResultTask=setTimeout(function(){
                    currFunction();
                },5000);
            }else{
                recommendResultTask=setTimeout(function(){
                    currFunction();
                },5000);
            }
            if(data.expertChairManList){
            	recommend(data.expertChairManList)
            }
        }
    }else{
		if(data.msg){
			top.layer.alert(data.msg);
		}
        getRecommendExperts(memberList);
    }

}

//推荐
function save(){
    if($("input[name='chairManId']:checked").val()==undefined||$("input[name='chairManId']:checked").val()==""){
        top.layer.alert('请选择组长！', {icon: 7,title: '提示'});
    }else {
        var param = {
            "nodeType": "recommendLeader",
            "method": "saveRecommend",
            "chairManId": $("input[name='chairManId']:checked").val(),
        };
        reviewFlowNode(param, function (data) {
            top.layer.alert('投票成功！', {icon: 1,title: '提示'});
            currFunction();
        }, true);
    }
}

//推荐历史列表
function leaderLs(num){
	var data=[];
	if(leaderHisData.length>0){
		data=leaderHisData[num].expertChairManInfoList
	};
    recommend(data);
}

//获取评委列表
function getRecommendExperts(callback){
    var experts = getExperts();
    callback(experts);
}

//推荐历史样式及数据
function leaderGie(){
	var param = {
        "nodeType":"recommendLeader",
        "method":"findRecommendHistory",
	}
    reviewFlowNode(param, function(data){
        leaderHisData=data;
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
	},true);
	//历史次数切换
	$("#hisSelect").on('change',function(){
		leaderLs($(this).val());
	})
}

//当前登陆人为组长的页面样式
function imIsLeader(isCheck){
    $(".recommendLeaderTable").hide();
	leaderGie();
};

//当前登陆人不是组长的页面样式
function imNoIsLeader(expertName){
    $(".recommendLeaderTable .expertTile").html("组长");
    $(".recommendLeaderTable .expertList").html(expertName);
	leaderGie();	
};

//推荐组长
function memberList(experts){
	var expertList=""
	for (var i = 0;i<experts.length;i++) {
        expertList += '<span style="margin-right:10px"><input type="radio" class="" name="chairManId" value="'+experts[i].expertId+'">'+experts[i].expertName+'</span>'
	};
	if(isEnd==0){
        expertList += '<span><input type="button" class="btn btn-primary" value="确定" onclick="save()"></span>';
	}
	//reviewRoleType 评标角色类型 1.评委  2.组长 3.招标监督人 4.项目经理 5.平台 6.监管部门监督人 评委才能推选组长
	if(reviewRoleType == 1 || reviewRoleType == 2){
		$(".recommendLeaderTable .expertTile").html("推选组长");
		$(".recommendLeaderTable .expertList").html(expertList);
	}
	leaderGie();	
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
}
