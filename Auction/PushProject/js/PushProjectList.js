var listUrl = config.AuctionHost + '/PushRecordController/findPushPageList.do'; //列表接口
var saveExcel = config.AuctionHost+'/PushRecordController/eportPushData.do';//Excle导入接口
var excelDownloadUrl =  config.AuctionHost  + "/OutSidesController/mbDownload.do";//Excel下载接口
var pageView = 'bidPrice/PushProject/model/PushProjectView.html';

$(function() {	
	initDataTab(); //加载列表

	//查询
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable("refresh");
	});
	// 状态查询
	$("#state").change(function() {
		var state = $("#state").val(); // 项目状态
		$("#table").bootstrapTable('destroy');
		initDataTab();		
	});

/*	//添加
	$("#btnAdd").click(function() {
		openEdit("");
	});*/
	
	//查看
	$("#table").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openView(rowData);
	});

	//删除
	$("#table").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#table').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该记录?', { icon: 3, title: '询问' }, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: config.AuctionHost  + "/PushRecordController/delete.do",
				type: "post",
				data: { id: rowData.id },
				success: function(data) {
					if(data.success == false) {
						parent.layer.msg(data.message);
						return;
					} else {
						parent.layer.alert("删除成功");
					}
					$("#table").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	});

	
	//下载模板
	$("#downAccept").click(function (){
		excelDownload();
	})
	
});

/**
 * 合同信息模版下载
 */
function  excelDownload(){
    var newUrl = excelDownloadUrl+"?fname=供应链推送数据列表&filePath=pushDataTemplate.xlsx";
    window.location.href = $.parserUrlForToken(newUrl);
}

/*
 * 新增、修改窗口
 * 当index为空时是新增，index不为空是当前要修改的索引
 */
/*function openEdit(index) {
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData = "",
		url = pageEdit + "?pageType=add",
		title = "添加合同信息";
	if(index != "" && index != undefined) {
		url = pageEdit + "?pageType=edit";
		rowData = $('#contractList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		sessionStorage.setItem('record', JSON.stringify(rowData)); //获取当前选择行的数据，并缓存
		title = "编辑合同信息";
	}

	layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url
	});
}*/
/*
 * 查看窗口
 */
function openView(rowData) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.8;
	layer.open({
		type: 2,
		title: "查看信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.du(rowData);
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		enterpriseName: $("#enterpriseName").val(),    
		projectName: $("#projectName").val(),	
		state: $("#state").val(), // 项目状态
	};
	return projectData;
}
//表格初始化
function initDataTab() {
	$("#table").bootstrapTable({
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
		onCheck: function(row) {
			id = row.id;
		},
		columns: [
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectName',
			title: '包件名称',
			align: 'left',
			width: '180',
		}, {
			field: 'projectType',
			title: '项目类型',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == 0){//项目类型   0 - 询价  4-招投标
					return "询价";
				}else{
					return "招投标";
				}
			}
		},{
			field: 'enterpriseName',
			title: '采购人企业',
			align: 'center',
		},{
			field: 'isDeal',
			title: '是否成交',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == 0){//是否成交   0 - 未成交  1-成交
					return "未成交";
				}else{
					return "成交";
				}
			}
		}, {
			field: 'winAmount',
			title: '中标价格（元）',
			align: 'center',
		}, {
			field: 'createTime',
			title: '发布时间',
			align: 'center',
			width: '150',
			formatter: function(value, row, index) {
				if(value){
					return value.substring(0,10);
				}			
			}
		}, {
			field: 'subDate',
			title: '推送时间',
			align: 'center',
			width: '180',
		}, {
			field: 'state',
			title: '推送状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == 0){//推送状态     0：推送失败   1：推送成功
					return '<span style="color: red;">失败</span>';
				}else{
					return '<span style="color: green;">成功</span>';
				}
			}
		}, {
			title: '操作',
			align: 'left',
			width: '160px',
			formatter: function(value, row, index) {				
				var str = '<button  type="button" class="btn btn-secondary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				//var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
				var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
				if(row.state == 0 ) {
					return str + strDel;
				} else if(row.state == 1) {
					return str;
				}
			}
		}]
	});
}


/*function submitList(contractList,index){
	$.ajax({
		url: config.wasteHost +'/ContractController/submitList',
		type: "post",
		dataType: 'json',
		contentType:"application/json", // 指定这个协议很重要
		data:JSON.stringify(contractList),		
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message, { icon: 2 });						

			} else {
				parent.layer.alert("提交成功！");
				layer.close(index);
				$("#contractList").bootstrapTable("refresh");
			}
		},
		error: function(data) {
			parent.layer.alert("处理失败！");
		}
	});
	
}*/


//Excel导入
function importAccept(obj){
	  var f = obj.files[0];
	  if(f!=null){
	 var fileName = f.name;
	 var fileExtension = fileName.substring(fileName.lastIndexOf('.'));//文件后缀
	if(fileExtension.toLowerCase() != ".xls" && fileExtension.toLowerCase() != ".xlsx") {
	　　parent.layer.alert("只支持:xls,xlsx格式文件!",{icon:2});
	    return;
	}
	  var formFile = new FormData();
	  formFile.append("file", f); //加入文件对象
//	  var data=formFile;
	   $.ajax({
			type: "post",
			url: saveExcel,
			async: false,
			dataType: 'json',
			cache: false,//上传文件无需缓存
	        processData: false,//用于对data参数进行序列化处理 这里必须false
	        contentType: false, //必须
			data: formFile,
			error: function(data) {
				parent.layer.alert("系统异常,请联系管理员",{icon:2});
			},
			/*success: function(data) {	
				var list = data.data;
                if(list.length==0){
                	parent.layer.alert("全部导入成功!");
                }else{
                    parent.layer.alert(list);
                }
				$("#table").bootstrapTable("refresh");
			}*/
			success: function(data) {
				if(data.success == false) {
					parent.layer.msg(data.message);
					return;
				} else {
					var list = data.data;
	                if(list.length==0){
	                	parent.layer.alert("全部导入成功!");
	                }else{
	                	var str=list.replace(/;/g,"<br/>")
	                    parent.layer.alert(str);
		            }
					$("#table").bootstrapTable("refresh");
				}
			},
			error: function(data) {
				parent.layer.alert("加载失败");
			}
		});
	  }
}

