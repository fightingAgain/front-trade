/**
*  zhouyan 
*  2019-4-1
*  评标列表
*  方法列表及功能描述
*/
var listUrl = config.Reviewhost + '/TendereeRecordApplyController/findApplyPageList.do';  //列表接口
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var saveUrl = config.Reviewhost + '/TendereeRecordApplyController/saveAndUpdate.do'; //保存

var editHtml = "Review/expert/model/tenderApplyModel.html"; 


$(function(){
	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable("refresh");
	});
	
	//提交
	$("#tableList").on("click", ".btnSubmit", function(){
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
        top.layer.confirm("温馨提示：是否确定提交备案申请？", {btn: ['确定', '取消'], icon:3,title: "提示"}, function () {
	        if (rowData.projectAttachmentFiles.length == 0) {
                top.layer.alert('温馨提示：您未上传备案申请文件！', {icon: 7,title: '提示'});
	            return;
	        }
	        if(rowData.projectAttachmentFiles.length > 1) {
                top.layer.alert('温馨提示：备案申请文件数量不能大于1！', {icon: 7,title: '提示'});
	            return;
	        }
	        if(rowData.expertNum == 0) {
                top.layer.alert('温馨提示：招标人代表信息不能为空！', {icon: 7,title: '提示'});
	            return;
	        }
	        $.ajax({
				url: saveUrl,
				type: "post",
				data: {
					bidSectionId: rowData.bidSectionId,
					examType:rowData.examType,
					status:1,
					id:rowData.id
				},
				success: function(rowdata) {
					if(rowdata.success == false) {
                        top.layer.alert('温馨提示：'+rowdata.message);
						return;
					}else{
						$('#tableList').bootstrapTable('refresh');
                        top.layer.alert("温馨提示：提交申请成功", {icon: 1,title: '提示'});
						var index = top.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                        top.layer.close(index); //再执行关闭
					}
				},
				error: function(rowdata) {
                    top.layer.alert("温馨提示：加载失败", {icon: 3,title: '提示'});
				}
			});
	    });
		
		
	});
	
	//审核
	/*$("#tableList").on("click", ".btnCheck", function(){
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		$.ajax({
			url:config.Syshost + '/tgCallback.do',
			type: "post",
			data: {
				id:rowData.id
			},
			success: function(rowdata) {
				if(rowdata.success == false) {
					top.layer.msg(rowdata.message);
					return;
				}else{
					$('#tableList').bootstrapTable('refresh');
					top.layer.alert("审核成功", {icon: 1,title: '提示'});
				}
			},
			error: function(rowdata) {
				top.layer.alert("加载失败", {icon: 3,title: '提示'});
			}
		});
	});	*/
	
	//添加
	$("#tableList").on("click", ".btnAdd", function(){
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openView(rowData);
	});
	
});

/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(rowData){
	//rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	
	layer.open({
		type: 2,
		title: '编辑招标人代表备案申请',
		area: ['1100px', '600px'],
		resize: false,
		content: editHtml+'?type=edit',
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};

function openView(rowData){
	layer.open({
		type: 2,
		title: '查看申请',
		area: ['1100px', '600px'],
		resize: false,
		content: editHtml+'?type=view',
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'bidSectionCode': $("#interiorBidSectionCode").val(), // 标段编号
		'bidSectionName': $("#bidSectionName").val(), // 标段名称	
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
		height: (top.tableHeight -  $('#toolbarTop').height()),
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
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'expertNum',
					title: '招标人代表数量',
					align: 'center',
					cellStyle:{
						css: widthState
					},
				},
				{
					field: 'fileState',
					title: '备案申请文件',
					align: 'center',
					cellStyle:{
						css: widthDate
					},
					formatter: function(value, row, index){
						if(value== 0){
							return  '<span style="color:red">未上传</span>';
						}else if(value== 1){
							return  '<span style="color:green">已上传</span>';
						}else{
							return  '<span style="color:red">未上传</span>';
						}
					}
				},
				{
					field: 'status',
					title: '状态',
					align: 'center',
					width: '150px',
					formatter: function(value, row, index){//状态  0：临时保存   1：审核中  2：审核通过  3：审核不通过
						if(value==0){
							return  '<span style="color:red">未提交</span>';
						}else if(value==1){
							return  '<span style="color:green">已提交</span>';
						}else if(value==2){
							return  '<span style="color:green">已提交</span>';
						}else if(value==3){
							return  '<span style="color:red">未提交</span>';
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '260px',
					cellStyle:{
						css: {'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var strAdd = '<button  type="button" class="btn btn-primary btn-sm btnAdd" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strSubmit = '<button  type="button" class="btn btn-primary btn-sm btnSubmit" data-index="'+index+'"><span class="glyphicon glyphicon-ok"></span>提交</button>';
						
						//var strCheck = '<button  type="button" class="btn btn-primary btn-sm btnCheck" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>审核</button>';
						if(row.fileState == 0){
							if(row.status == 0 || row.status == 3){
								return strAdd  + strView ;
							}
							if(row.status == 2 || row.status == 1){
								return strAdd + strView;
							}
						}else if(row.fileState == 1){
							if(row.status == 0 || row.status == 3){
								return strAdd + strView + strSubmit;
							}
							if(row.status == 2 || row.status == 1){
								return  strView ;
							} 
						}else{
							return strAdd + strView;
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