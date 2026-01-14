/**
*  zhouyan 
*  2019-5-13
*  编辑招标项目计划
*  方法列表及功能描述
*/
var saveUrl = config.tenderHost + '/TenderProjectPlanController/saveTenderProjectPlan.do';//保存
var bidDetailUrl = config.tenderHost + '/TenderProjectPlanController/findSectionList.do';//标段列表数据

var detailUrl = config.tenderHost + '/TenderProjectPlanController/selectTenderProjectPlan.do';//计划详情

var planHtml = 'Bidding/Project/projectPlan/model/planEdit.html';//编辑计划

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
	$('.time').datetimepicker({
		step:5,
		lang:'ch',
		format:'Y-m-d',
		timepicker: false,// true 显示timepicker   false 隐藏timepicker
	});
	/*关闭*/
	$('#btnClose').click(function(e){
		e.stopPropagation();
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//编辑计划
	$('#bid_Edit').on('click','.btnEdit',function(){
//		var bidId = $(this).attr('data-id');
		
		savePlan();
		var index = $(this).attr("data-index");
		planEdit(bidArr[index])
	});
	
	
	//保存
	$('#btnSave').click(function(e){
		e.stopPropagation();
		if(checkForm($("#formName"))){
			savePlan('1')
		}
	});
	//编辑标段计划
//	$('#bid_Edit').on('click','')
//	//删除
//	$('#projectPlan').on('click','.btnDel',function(){
//		planArr=[];
//		var index = $(this).attr('data-index');
//		var lengthTr = $('#projectPlan tbody tr').length;
//		var arr = parent.serializeArrayToJson($("#formName").serializeArray());
//		for(var i = 0;i<lengthTr;i++){
//			var tableObj = {}
//			for(var key in arr){
//				var j = key.split('[')[1].split(']')[0];
//				if(i == j){
//					var obj = key.split('.')[1];
//					tableObj[obj] = arr[key]
//				}
//			}
//			planArr.push(tableObj)
//		}
//		planArr.splice(index,1);
////		console.log(planArr)
//		planTable(planArr, tenderProjectId)
////		console.log(planArr)
//	})
	
});
//父页面调用该函数，并传参过来
function getInfo(data){
//	console.log(data)
	for(var key in data){
		$('#'+key).val(data[key])
	}
	if(!data.tenderProjectPlanId){
//		planId = data.tenderProjectPlanId;
		$('#employeeName').val(loginInfo.userName)
	}
}
//编辑
function planEdit(data){
//	console.log(data)
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
			interiorBidSectionCode.val(data.interiorBidSectionCode);
			bidSectionName.val(data.bidSectionName);
			//iframeWin.formFather(formChild);  //调用子窗口方法，传参
			iframeWin.refreshFather(getBidDetail)
		}
	});
}

//保存函数
function savePlan(tips){
	$.ajax({
		type:"post",
		url:saveUrl,
		async:true,
		data: $('#formName').serialize(),
		success: function(data){
			if(data.success){
				if(tips){
					parent.layer.alert('招标项目计划设置成功！',{icon:6,title:'提示'},function(index){
						parent.$("#tableList").bootstrapTable("refresh");
						parent.layer.closeAll();
					})
				}else(
					parent.$("#tableList").bootstrapTable("refresh")
				)
				
			}
		}
	});
};
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
						$('[name='+key+']').val(arr[key])
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
	$('#bid_Edit tbody').html('');
	var html = "";
	for(var i = 0;i < data.length;i++){
		var state = ''
		if(data[i].editState == '0'){
			state = '未编辑'
		}else if(data[i].editState == '1'){
			state = '已编辑'
		};
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].bidSectionName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+state+'</td>'
			+'<td style="width: 200px;text-align: center;">'
				+'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
			+'</td>'
		+'</tr>'
	}
	$(html).appendTo('#bid_Edit tbody')
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
