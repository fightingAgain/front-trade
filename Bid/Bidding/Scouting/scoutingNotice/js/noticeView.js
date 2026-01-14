
var detailUrl = config.tenderHost+'/ReconnaissanceSiteController/getReconnaissanceByBidId.do';//编辑时获取详情接口
var listUrl = config.tenderHost + '/ReconnaissanceEnterpriseController/findSiteChoosePageList.do';//项目经理在详情页面查看投标人接收/拒绝的分页数据，按投标人名称倒叙排列
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var noticeId = '';//数据id
var bidId = '';//标段id
var examType = '';
$(function(){
	
	bidId = $.getUrlParam('id');
	examType = $.getUrlParam('examType');
	getBidInfo(bidId)
	getDetail(bidId)
	
	
	//初始化编辑器
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//全屏查看公告
	$('.fullScreen').click(function(){
		var content = $('#noticeContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看通知信息'
	        ,area: ['100%', '100%']
	        ,content: fullScreen
	        ,resize: false
	        ,btn: ['关闭']
	        ,success:function(layero,index){
	        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.find('#noticeContent').html(content);
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	            parent.layer.close(index);
	            
	        }
	       
	    });
	});
	//查询
	$('#btnSearch').click(function(){
		$("#bidderList").bootstrapTable('destroy');
		initDataTab();
	})
	$('#answerState').change(function(){
		$("#bidderList").bootstrapTable('destroy');
		initDataTab();
	})
})
function passMessage(data){
	var bidData = {}
	for(var key in data){
		bidData[key] = data[key];
	}
	for(var key in bidData){
		$('#'+key).html(bidData[key]);
	}
	/*if(bidData.id){
		noticeId = bidData.id;
		getDetail(noticeId);
	}*/
}

//修改时获取详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				noticeId = data.data.id;
				isShowSupplierInfo(id, '2', 'reconnaissance', function(data, html){
					if(data.isShowSupplier == 1 || data.isShowBidFile == 1){
						initDataTab();
					}else{
						$("#bidderList").closest('div').html(html)
					}
				})
				if(arr.explorationMethod == 0){
					arr.explorationMethod = '自行踏勘'
				}else if(arr.explorationMethod == 1){
					arr.explorationMethod = '组织踏勘'
				}
				for(var key in arr){
					$('#'+key).html(arr[key]);
				}
				
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		reconnaissanceId: noticeId, // 通知公告id
		bidderName: $("#bidderName").val(), // 投标人名称
		reconnaissanceState: $("#answerState").val() // 确认状态   接受/拒绝 0为未确认 1为放弃 2为同意
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	$("#bidderList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		onLoadError:function(){
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		
        		parent.layer.alert(data.message);
        	}
        },
		columns: [
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
	                var pageSize = $('#bidderList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#bidderList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
			},
			{
				field: 'bidderName',
				title: '投标人名称',
				align: 'left',
				cellStyle:{
					css:widthName
				},
				formatter: function(value, row, index){
					return showBidderRenameMark(row.bidderId, row.bidderName, RenameData, 'formEle')
				}
			},{
				field: 'bidderOganNo',
				title: '统一社会信用代码/组织机构代码',
				align: 'left',
				cellStyle:{
					css:widthCode
				}
			},{
				field: 'reconnaissanceState',
				title: '回复情况',
				align: 'center',
				width: '100',
				cellStyle:{
					css:{'white-space':'nowrap'}
				},
				formatter: function(value, row, index){
					if(value == 0){
						return '未确认'
					}else if(value == 1){
						return '<span style="color:red">已放弃</span>'
					}else if(value == 2){
						return '已同意'
					}
				}
			}
		]
	})
};
//根据标段id获取标段相关信息
function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				$('#tenderProjectName').html(data.data.tenderProjectName)
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
