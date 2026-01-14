/**
*  zhouyan 
*  2019-5-13
*  编辑招标项目计划
*  方法列表及功能描述
*/
var bidDetailUrl = config.tenderHost + '/TenderProjectPlanController/findSectionList.do';//标段列表数据

var detailUrl = config.tenderHost + '/TenderProjectPlanController/selectTenderProjectPlan.do';//计划详情

var planHtml = 'Bidding/Project/projectPlan/model/planView.html';//查看计划

var planArr = [];
var tenderProjectId = '';//招标项目id
var bidArr = [];//标段数据
var loginInfo = entryInfo();//当前登录人信息
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		 tenderProjectId = $.getUrlParam('id');
		$('#tenderProjectId').val(tenderProjectId);
		getDetail(tenderProjectId)
		getBidDetail(tenderProjectId);
	}
	/*关闭*/
	$('#btnClose').click(function(e){
		e.stopPropagation();
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//查看计划
	$('#bid_Edit').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		planEdit(bidArr[index])
	});
});
//父页面调用该函数，并传参过来
function getMessage(data){
//	console.log(data)
	for(var key in data){
		$('#'+key).html(data[key])
	}
//	if(!data.tenderProjectPlanId){
////		planId = data.tenderProjectPlanId;
//		$('#employeeName').val(loginInfo.userName)
//	}
}
//编辑
function planEdit(data){
	parent.layer.open({
		type: 2,
		title: '编辑标段时间信息',
		area: ['70%','80%'],
		resize: false,
		content: planHtml+'?id='+data.id + '&state=' + data.editState+'&examType=' + data.examType,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var interiorBidSectionCode = parent.layer.getChildFrame('#interiorBidSectionCode', index);
			var bidSectionName = parent.layer.getChildFrame('#bidSectionName', index);
			interiorBidSectionCode.html(data.interiorBidSectionCode);
			bidSectionName.html(data.bidSectionName);
			//iframeWin.formFather(formChild);  //调用子窗口方法，传参
//			iframeWin.refreshFather(getBidDetail)
		}
	});
}

//标段详情
function getBidDetail(id){
	$.ajax({
		type: "post",
		url: bidDetailUrl,
		async: true,
		data: {
			'tenderProjectId': tenderProjectId
		},
		success: function(data){
			if(data.success){
				bidTable(data.data);
				bidEditTable(data.data);
				bidArr = data.data;
//				planArr.push(data.data);
			}
		}
	});
};
//招标项目计划详情
function getDetail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'tenderProjectId': id
		},
		success: function(data){
			if(data.success){
				if(data.success){
					var arr = data.data;
					for(var key in arr){
						$('#'+key).html(arr[key])
					}
				}
			}
		}
	});
}
//标段
function bidTable(data){
	$('#bid_table tbody').html('');
	var html = "";
	for(var i = 0;i < data.length;i++){
		html += '<tr>'
			+'<td style="width: 200px;text-align: center;">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].bidSectionName+'</td>'
		+'</tr>';
	}
	$(html).appendTo('#bid_table tbody')
};
function bidEditTable(data){
	$('#bid_Edit').html('');
	var html = "";
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th style="width: 200px;text-align: center;">标段编号</th>'
		+'<th>标段名称</th>'
		+'<th style="width: 150px;text-align: center;">状态</th>'
		+'<th style="width: 200px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i < data.length;i++){
		var state = '';
		var btn= '';
		if(data[i].editState == '0'){
			state = '未编辑'
		}else if(data[i].editState == '1'){
			state = '已编辑';
			btn = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+i+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
		};
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].bidSectionName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+state+'</td>'
			+'<td style="width: 200px;text-align: center;">'+btn+'</td>'
		+'</tr>'
	}
	$(html).appendTo('#bid_Edit')
}

function planTable(data,id){
	$('#projectPlan tbody').html('');
	var html = '';
	for(var i = 0;i < data.length;i++){
		if(!data[i].planContent){
			data[i].planContent = '';
		}
		var state = '';
		if(data[i].states == 1){
			state = '<option value="0">未完成</option>'
				+'<option value="1" selected>进行中</option>'
				+'<option value="2">已完成</option>'
		}else if(data[i].states == 2){
			state = '<option value="0">未完成</option>'
				+'<option value="1">进行中</option>'
				+'<option value="2" selected>已完成</option>'
		}
		else if(data[i].states == 0){
			state = '<option value="0">未完成</option>'
				+'<option value="1">进行中</option>'
				+'<option value="2">已完成</option>'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td><input type="text"  name="bidSectionPlans['+i+'].planName" value="'+data[i].planName+'" class="form-control planName'+i+'"/></td>'
			+'<td style="width: 150px;text-align: center;">'
				+'<input type="text" style="text-align: center;"  name="bidSectionPlans['+i+'].planStartTime" value="'+data[i].planStartTime+'"  class="form-control time planStartTime'+i+'"/>'
				+'<input type="hidden" name="bidSectionPlans['+i+'].bidSectionId" value="'+data[i].bidSectionId+'"/>'
			+'</td>'
			+'<td style="width: 150px;text-align: center;">'
				+'<input type="text"  style="text-align: center;"  name="bidSectionPlans['+i+'].planEndTime" value="'+data[i].planEndTime+'"  class="form-control time planEndTime'+i+'"/>'
			+'</td>'
			+'<td><textarea name="bidSectionPlans['+i+'].planContent" rows="2" class="form-control" style="width: 100%;resize: none;">'+data[i].planContent+'</textarea></td>'
			+'<td style="width: 120px;text-align: center;">'
				+'<select class="form-control" name="bidSectionPlans['+i+'].states">'+state+'</select>'
			+'</td>'
			+'<td style="width: 100px;text-align: center;"><button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+i+'"><span class="glyphicon glyphicon-remove"></span>删除</button></td>'
		+'</tr>';
	};
	$(html).appendTo('#projectPlan tbody');
}
