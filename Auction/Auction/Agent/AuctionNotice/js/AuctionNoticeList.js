var urlBidNoticeList = top.config.AuctionHost + "/BidNoticeController/pageBidNotice.do"; //采购结果通知
var recallUrl = top.config.AuctionHost +"/WorkflowController/updateJggsState.do";// 撤回项目的接口
var nowDate = new Date();
function checkDetail(packageId, type,index) {
	var row = $("#AuctionNoticeList").bootstrapTable('getRowByUniqueId', packageId);
	var rows = $("#AuctionNoticeList").bootstrapTable('getData')[index];
	
	sessionStorage.setItem("AuctionNotice", JSON.stringify(row));
	var title = "";
	if(rows.itemState == undefined && rows.createType != undefined && rows.createType == 1) {
		return parent.layer.alert("温馨提示：竞价采购还未发布结果公示!")
	} else if(rows.itemState == 0 && rows.createType != undefined && rows.createType == 1) {
		return parent.layer.alert("温馨提示：竞价采购还未发布结果公示!")
	}
	if(type == "update") {
		title = "发布竞价采购结果公示";
	} else {
		title = "查看竞价采购结果公示";
	}
	top.layer.open({
		type: 2,
		title: title,
		area: ['80%', '80%'],
		maxmin: true,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Agent/AuctionNotice/modal/AuctionNoticeInfo.html?special=' + type+'&keyId=' + rows.id+ '&id=' + rows.packageId,
	});
}

//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#AuctionNoticeList').bootstrapTable('destroy');
		initTable()
	});
});

//设置查询条件
function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号	
		packageName: $("#packageName").val(),
		enterpriseType: '02', //0为采购人，1为供应商
		tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖

	};
	return QueryParams;
}
function initTable(){
	$("#AuctionNoticeList").bootstrapTable({
		url: urlBidNoticeList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		clickToSelect: true, //是否启用点击选中行
		sidePagination: 'server', // 服务端分页
		silent: true, // 必须设置刷新事件
		queryParams: getQueryParams, //查询条件参数
		classes: 'table table-bordered', // Class样式
		striped: true,
		uniqueId: "packageId",
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#AuctionNoticeList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#AuctionNoticeList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号			
				}
			},
			{
				field: 'projectCode',
				title: '采购项目编号',
				align: 'left',
				width: '180'
			},
			{
				field: 'projectName',
				title: '采购项目名称',
				align: 'left',
				formatter: function(value, row, index) {
					if(row.projectSource == 1) {
						var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新竞价)</span>'
					} else {
						var projectName = row.projectName
					}
					return projectName
				}
			},
			{
				field: 'packageName',
				title: '包件名称',
				align: 'left'
			},
			{
				field: 'tempEndDate',
				title: '报价开始时间',
				align: 'center',
				width: '150'
			},
			{
				field: 'openStartDate',
				title: '公示开始时间',
				align: 'center',
				width: '160px'
			},
			{
				field: 'opetEndDate',
				title: '公示截止时间',
				align: 'center',
				width: '160px'
			},
			{
				field: 'itemState',
				title: '审核状态',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					//0为未审核，1为审核中，2为审核通过，3为审核不通过
					switch(row.itemState) {
						case 0:
							return "未审核";
							break;
						case 1:
							return "<span style='color: red;'>审核中</span>";
							break;
						case 2:
							return "<span style='color: green;'>审核通过</span>"
							break;
						case 3:
							return "<span style='color: red;'>审核不通过</span>"
							break;
						case 4:
							return "<span style='color: red;'>无需审核</span>"
							break;
					}
				}
			},
			{
				field: 'issue',
				title: '发布状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					/*if((GetTime(nowDate) >= GetTime(row.openStartDate) )&& row.itemState == 2) {
						return "<span style='color: green;'>已发布</span>";
					} else {
						return "<span style='color: red;'>未发布</span>";
					}*/
					if(value == 0) {
						return "<span style='color: green;'>已发布</span>";
					} else {
						return "<span style='color: red;'>未发布</span>";
					}
				}
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '160',
				formatter: function(value, row, index) {
					if(row.createType != undefined && row.createType == 1){
						return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index+ "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
					}else{
						
					if(typeof(row.itemState) == 'undefined' || row.itemState == 3 || row.itemState == 0) {
						return "<button onclick='checkDetail(\"" + row.packageId + "\",\"RELEASE\",\"" + index+ "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-edit'>发布公示</button>"
					} else {
						if(row.itemState == 1){//审核中
							return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index+ "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
								   +"<button onclick='updates(\"" + row.id + "\")' class='btn btn-warning btn-xs'><span class='glyphicon glyphicon-share'>撤回</button>"
						}else if(row.itemState == 2){//审核通过
							if(row.issue==0){//已发布
								return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index+ "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
							}else{//未发布
								return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index+ "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
								+"<button onclick='updates(\"" + row.id + "\")' class='btn btn-warning btn-xs'><span class='glyphicon glyphicon-share'>撤回</button>"
							}
						}	
					}
					}
					
				}
			}
		]
	});
}


function GetTime(time){
	var date=new Date(time).getTime();
	
	return date;
};

function updates(id){
	top.layer.confirm('确定要撤回该公示吗', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId":id,
	   			'accepType':'jggs'
			},
			success: function(data) {
				if(data.success){
		   			parent.layer.alert("撤回成功!")
		   			setTimeout(function(){
				  		$('#AuctionNoticeList').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					},200)
		   		}else{
		   			top.layer.alert(data.message)
		   		}
			},
			error: function(data) {
				top.layer.alert("撤回失败")
			}
		});
	
		top.layer.close(index);
	}, function(index) {
		top.layer.close(index)
	});
}