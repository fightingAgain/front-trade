/**
*  推荐组长
*  方法列表及功能描述
*/
var memberUrl = top.config.bidhost + '/ExpertLeaderController/findCheckItemList.do';//查询评标委员会信息
var saveUrl = top.config.bidhost + '/ExpertLeaderController/saveExpertLeader.do';//保存评委的推荐组长的投票数据
var leaderLsUrl=top.config.bidhost + '/ExpertLeaderController/findExpertList.do';//推荐历史数据接口
var ExpertLeaderUrl=top.config.bidhost + '/ExpertLeaderController/findExpertLeaderInfo.do';//是否完成接口
var setCheckStartMsgUrl=top.config.bidhost + '/ExpertCheckViewControll/setCheckStartMsg.do';//下达指令
var leaderHisData;//推荐组长的历史数据
function ExpertLeader(){
	$.ajax({
		type:"post",
		url:ExpertLeaderUrl,
		async:true,
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	       
	    },
		data:{
			'projectId': projectId,
			'packageId': packageId,
			'expertId':expertIds,
			'examType':1,				
		},
		success: function(res){
			if(res.success){
			    if(res.data.isSetFinish==0){//当前评委推荐未完成
			    	getMembers();//评委列表数据
			    }else{//当前评委推荐完成
			    	if(res.data.isRecommend==0){//所有评委推荐未完成
			    		timeSet=setTimeout(function(){
					    	ExpertLeader()
				    	},5000);
				    	leaderGie();
						recommend(res.data.expertChairManList)
			    	}else{//所有评委推荐完成
			    		if(res.data.isSetLeader==0){//未设置组长
			    			parent.layer.alert('温馨提示：组长推荐未完成，请重新推选');
			    			getMembers();			    			
			    		}else{	
			    			if(res.data.isCheck===0&&isPublicProject==0&&jindu.isEnd==0){
								parent.layer.alert('温馨提示：已推选出组长，请联系项目经理下达评标指令');
							}
		    				if(res.data.isLeader==0){//当前登录人是否是组长0为否1为是
			    				imNoIsLeader(res.data.bidSectionExpert);//不是组长时的页面渲染
			    			}else{				    							    				
			    				imIsLeader(res.data.isCheck);//是组长时的页面渲染
			    			}			    						    			
			    		}
			    		clearTimeout(timeSet)//销毁定时器
			    	}
			    }
			    $("#relevant").hide();
			}
			
		}
	});
}

//提交按钮
function save(){
	if($("input[name='chairManId']:checked").val()==undefined||$("input[name='chairManId']:checked").val()==""){
		parent.layer.alert('请选择组长！', {icon: 7,title: '提示'});
	}else{
		$.ajax({
			type:"post",
			url:saveUrl,
			async:true,
			data:{
				'projectId': projectId,
				'packageId': packageId,
				'examType':1,
				'chairManId':$("input[name='chairManId']:checked").val()
			},
			success: function(data){
				if(data.success){
					parent.layer.alert('推选成功！', {icon: 1,title: '提示'});
					ExpertLeader();
				}else{
					parent.layer.alert(data.message, {icon: 2,title: '提示'});
				}
				
			}
		});
	}
}
//推荐历史列表
function leaderLs(num){
	var data=[];
	if(leaderHisData.length>0){
		data=leaderHisData[num].expertChairManInfoList
	};	
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
	$("#leaderLs").bootstrapTable('load',data)
}
//推荐组长列表数据
function getMembers(){
	$.ajax({
		type:"post",
		url:memberUrl,
		async:false,
		data: {
			'packageId': packageId,
			'examType':1
		},
		success: function(data){
			if(data.success){
				leaderData = data.data;
				memberList()				
			}
		}
	});
}
//推荐历史样式及数据
function leaderGie(){
	var li = "<table class='table table-bordered'>"
		li += '<tr>'
			li +='<td class="active">推荐记录</td>'
			li +='<td class="active" style="width:300px">'
			 	li +='<div class="input-group" style="width:200px">'
		            li +='<span class="input-group-addon" style="background:none;border: none;">历史次数</span>'
		            li +='<select id="hisSelect" class="form-control"></select>'    
		       	li +='</div>'    			
			li +='</td>'
		li +='</tr>'
		li +='<tr>'
			li +='<td colspan="3">'
			   li +="<table class='table table-bordered' id='leaderLs'></table>"
			li +='</td>'
		li +='</tr>'
		li +='</table>';
	$('#leaderTable').html(li);
	$.ajax({
		type:"post",
		url:leaderLsUrl,
		async:true,
		data:{
			'projectId': projectId,
			'packageId': packageId,
			'examType':1,			
		},
		success: function(data){
			if(data.success){
				leaderHisData=data.data;
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
				$("#hisSelect").html('<option value="">无历史次数</option>');
			}
			
		}
	});
	//历史次数切换
	$("#hisSelect").on('change',function(){
		leaderLs($(this).val());
	})
}
//当前登陆人为组长的页面样式
function imIsLeader(isCheck){
	var li='<div style="text-align:right;margin:10px" id="isCheck">'
	if(isCheck===0&&jindu.isEnd==0&&isPublicProject==1){
		parent.layer.alert('温馨提示：您已当选组长，请下达评标指令');	
		li +='<input type="button" class="btn btn-primary" value="下达评标指令" onclick="CheckStartMsg()"></div>';
	}
	li +='<div id="leaderTable"></div>'	
	$('#content').html(li);
	leaderGie();	
};
//当前登陆人不是组长的页面样式
function imNoIsLeader(bidSectionExpert){
	var li="<table class='table table-bordered'>"
	li += '<tr><td class="th_bg">组长</td><td colspan="3">';
		li +=bidSectionExpert.expertName
	li += '</td></tr>';
	li += '</table>';
	li +='<div id="leaderTable"></div>'	
	$('#content').html(li);
	leaderGie();	
};
function CheckStartMsg(){
	$.ajax({
		type:"post",
		url:setCheckStartMsgUrl,
		async:true,
		data:{
			'packageId': packageId,
			'examType':1,			
		},
		success: function(data){
			if(data.success){
				parent.layer.alert('下达指令成功');
				$("#isCheck").hide();			
			}else{
				
			}
			
		}
	});
}
//未推荐组长的页面样式
function memberList(){
	var li="<table class='table table-bordered'>"
	li += '<tr><td class="th_bg">专家列表</td><td colspan="3">';
	for (var i = 0;i<leaderData.length;i++) {
		li += '<span style="margin-right:10px"><input type="radio" class="" name="chairManId" value="'+leaderData[i].id+'">'+leaderData[i].expertName+'</span>'
	};
	// if(jindu.isEnd==0){
		li += '<span><input type="button" class="btn btn-primary" value="确定" onclick="save()"></span>';
	// }	
	li += '</td></tr>';
	li += '</table>';
	li +='<div id="leaderTable"></div>'	
	$('#content').html(li);
	leaderGie();	
};
function recommend(expertList){
	if(expertList!=null&&expertList!=undefined){
		var expertLists=expertList
	}else{
		var expertLists=[]
	}
	var li="<table class='table table-bordered'>"
	li += '<tr><td class="th_bg">组长</td><td colspan="3">';
		li +='请等待其他评委完成组长推荐'
	li += '</td></tr>';
	li += '</table>';
	li +='<div id="leaderTable"></div>'	
//	$('#content').html(li);
	li +="<table class='table table-bordered'>"
		li +='<tr>'
			li +='<td class="active">推荐记录</td>'	
		li +='</tr>'
		li +='<tr>'
			li +='<td colspan="3">'
			   li +="<table class='table table-bordered' id='leaderNow'></table>"
			li +='</td>'
		li += '</tr>'
		li += '</table>';
	$('#content').html(li);
	$("#leaderNow").bootstrapTable({
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
	$("#leaderNow").bootstrapTable('load',expertLists)
}
