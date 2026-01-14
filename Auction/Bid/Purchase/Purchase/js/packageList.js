var urlPurchaseList = config.bidhost + '/ProjectPackageController/findProjectPackagePageList.do';
var saveProjectPackage = config.bidhost + '/PurchaseController/saveProjectPackage.do'; //添加包件的接口
var findPackage = config.bidhost + '/ProjectPackageController/findProjectPackageList.do' //包件列表
var recallUrl = config.bidhost + '/WorkflowController/updateWorkflowCheckeState.do' //包件列表
var deletPackageUrl = config.bidhost + '/PurchaseController/deletePackage.do' //删除包件接口
var pricedelete = config.bidhost + '/ProjectPriceController/deleteProjectPriceByPackage.do' //费用删除
var updateDeptMsg=config.bidhost+'/ProjectPackageController/updateDeptMsg.do';//采购部门维护接口
var eidteditpackage = 'Auction/common/Purchase/Purchase/model/eidtPackageInfo.html';
var addpackage = 'Auction/common/Purchase/Purchase/model/addPackageInfo.html';
var viewpackage = 'Auction/common/Purchase/Purchase/model/viewPackage.html';
var modelUrl='bidPrice/currencyControl/model/departmentModel.html'
var iframeWinAdd = "";
var examType, isAgentCode;
var parameter;
//表格初始化
$(function() {
	/* 东咨智采平台采购人专区，询比采购下“项目信息”和“包件信息”菜单页面，隐藏“新建项目”和“新建包件”功能按钮，仅限“岚图汽车销售服务有限公司”和“岚图汽车科技有限公司” */
	var hideCodeArr = ['91420100MA49KU580R','91420100MA4F0N7L7F'];//岚图汽车销售服务有限公司、岚图汽车科技股份有限公司
	if(hideCodeArr.indexOf(top.EnterpriseData.enterpriseCode) > -1){
		$('#btn_add').hide();
	}else{
		$('#btn_add').show();
	}
	/* 东咨智采平台采购人专区，询比采购下“项目信息”和“包件信息”菜单页面，隐藏“新建项目”和“新建包件”功能按钮，仅限“岚图汽车销售服务有限公司”和“岚图汽车科技有限公司” --end */
	
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！		
		initTable();		
	});

});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'packageName': $("#packageName").val(),
		'packageNum': $("#packageNum").val(),
		'enterpriseType': '04',

		'tenderType': 0,
		//'isAgent':isAgentCode
	}
};


function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlPurchaseList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			width: '300',
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			width: '300',
			formatter: function(value, row, index) {
				if(row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(value == 0) {
					return '资格预审';
				} else {
					return '资格后审';
				}

			}
		}, {
			field: '',
			title: '操作',
			
			align: 'center',
			width: '180',
			events:{
				'click .purchaserDepartment':function(e,value, row, index){
					 //采购人编辑所属部门
					 parameter={
						packageId:row.id,
						departmentIDOld:row.purchaserDepartmentId,
						departmentNameOld:row.purchaserDepartmentName,   
					}
					parent.layer.open({
						type: 2 //此处以iframe举例
						,title: '选择所属部门'
						,area: ['400px', '600px']
						,content:modelUrl
						,success:function(layero,index){
							var iframeWind=layero.find('iframe')[0].contentWindow;
							iframeWind.employee(row.purchaserId,callEmployeeBack,parameter.departmentIDOld,false)
						},
						 
					})
				}
			},
			formatter: function(value, row, index) {
				var Tdr = "";
				if(row.createType != undefined && row.createType == 1) {


					Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
				} else {
					if(row.isAgent == 1) {

						Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
					} else {
						if(row.packageState == 2 || row.packageState == 3 || row.packageState == 1 || row.packageState == 5) { //2为公告审核通过，3公告审核未通过，5未公告临时保存

							Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
							// Tdr+='<button class="btn-xs btn btn-primary purchaserDepartment"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>采购部门维护</button>'
						} else if(row.packageState == 4) { //包件确认


							Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
							Tdr += '<button class="btn-xs btn btn-warning" onclick=recall(\"' + row.id + '\")><span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回</button>'
						} else if(row.packageState == 0) { //包件临时保存


							Tdr += '<button class="btn-xs btn btn-primary" onclick=edit_bao(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>'
							Tdr += '<button class="btn-xs btn btn-danger" onclick=deletPackage(\"' + row.id + '\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>'
						}
					}
				}
				return Tdr
			}
		}],
	})
};
//查看包件
function viewbao($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看包件',
		area: ['1000px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: viewpackage,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.projectType=rowData[$index].projectType;
			iframeWind.du(rowData[$index].id, rowData[$index].examType);
		}

	});
};
//删除包件
function deletPackage(uid) {
	parent.layer.confirm('温馨提示：删除包件的同时，将删除该包件对应的采购文件、评审项及评审内容，且数据不可恢复，您确定要删除吗？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: deletPackageUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"id": uid
			},
			success: function(data) {
				$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
			},
			error: function(data) {
				parent.layer.alert("修改失败")
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

}
function callEmployeeBack(dataTypeList){
	var  itemTypeId=[],//归属不部门Id
	itemTypeName=[];//归属部门名称  
			
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);	
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	var typeIdList=itemTypeId.join(","),//项目类型的ID
	typeNameList=itemTypeName.join(",");//项目类型的名字     
	var pare={}
	for(var key in parameter){
		pare[key]=parameter[key]
	}
	pare.roleType=2;//1为代理机构部门，2采购人所属部门；
	pare.tenderType=0;
	pare.departmentIDNew=typeIdList;
	pare.departmentNameNew=typeNameList;
	$.ajax({
		type: "post",
		url: updateDeptMsg,
		data:pare,
		dataType: "json",
		success: function (response) {
			if(response.success){
				parent.layer.alert('修改成功');
				$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
			}else{
				parent.layer.alert(response.message)
			}
		}
	});
}
//撤回
function recall(uid) {
	parent.layer.confirm('温馨提示：撤回包件的同时，将删除该包件对应的评审项及评审内容，您确定要撤回吗？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"businessId": uid,
				'tenderType': 0,
				'projectPackage': 0

			},
			success: function(data) {
				if(data.success) {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
				} else {
					parent.layer.alert(data.message)
				}

			},
			error: function(data) {
				parent.layer.alert("撤回失败")
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

}
//添加
function add_bao() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '新建包件',
		area: ['1000px', '600px'],
		id: 'packageclass',
		content: addpackage
			//确定按钮
			,
		success: function(layero, index) {
			iframeWinAdd = layero.find('iframe')[0].contentWindow;
			iframeWinAdd.$(".tenderTypeW").hide();
			iframeWinAdd.$("#DeviateNum").hide();
			iframeWinAdd.$(".yao_btn").hide();
		}
	});
};
//编辑包件
function edit_bao($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '编辑包件',
		area: ['1000px', '600px'],
		id: 'packageclass',
		maxmin: true //开启最大化最小化按钮
			,
		content: eidteditpackage,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.projectType = rowData[$index].projectType;
			iframeWind.du(rowData[$index].id, rowData[$index].examType, rowData[$index].isAgent);
		}

	});
}