/**
*  zhouyan 
*  2019-4-15
*  评审结果公示
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidderContractController/findPageList.do';  //列表接口
var backUrl = config.tenderHost + '/BidderContractController/reset.do';//撤回

var bidHtml = 'Bidding/Contract/KeepContract/bidder/model/bidList.html';//标段列表
var editHtml = 'Bidding/Contract/KeepContract/bidder/model/contractEdit.html';//编辑页面
var viewHtml = 'Bidding/Contract/KeepContract/bidder/model/contractView.html';//查看页面

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//撤回
	$('#tableList').on('click','.btnBack',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		layer.confirm('确定撤回？',{icon:3,title:'询问'},function(ind){
			layer.close(ind);
			getBack(rowData.id)
		})
	});
	//新增
	$('#btnAdd').click(function(){
		chooseBid()
	});
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openView(rowData);
	});
	
});
//选择标段
function chooseBid(){
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.bidFromFathar(formFather);
		}
	})
}
function formFather(data){
//	console.log(data)
	openEdit(data)
};

//编辑
function openEdit(data){
	var title;
	if(data.id){
		title = '编辑中标合同';
	}else{
		title = '新增中标合同';
	}
	layer.open({
		type: 2,
		title: title	,
		area: ['80%', '80%'],
		content: editHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data); 
		}
	});
};
//查看
function openView(data){
	layer.open({
		type: 2,
		title: '查看中标合同'	,
		area: ['80%', '80%'],
		content: viewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data); 
		}
	});
};
//撤回
function getBack(id){
	$.ajax({
		type:"post",
		url:backUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				layer.alert('撤回成功！',{icon:6,title:'提示'})
			}else{
				layer.alert(data.message,{icon:5,title:'提示'})
			}
		}
	});
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'left',
					width: '200',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function(value, row, index){
						return getOptionValue('tenderProjectType',value)
					}
				},
				{
					field: 'contractState',
					title: '合同状态',
					align: 'center',
					width: '150',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span>未提交</span>'
						}else if(value == 1){
							return  '<span  style="color:green">已提交</span>'
						}else if(value == 2){
							return  '<span style="color:orange">已撤回</span>'
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '200px',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						var str = "";
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						if(row.isEmployee == 1){
							if(row.contractState == 0 || row.contractState == 2){
								return strEdit+strSee
							}else if(row.contractState == 1){
								return strBack+strSee
							}
							
						}else if(row.isEmployee == 0){
							return strSee
						}
						
					}
				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}