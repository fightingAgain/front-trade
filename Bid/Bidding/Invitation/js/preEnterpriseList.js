var preTenderUrl = config.tenderHost + '/BidInviteController/findPretrialBidderrPageList.do'; //预审获取投标人
var afterTenderUrl = config.tenderHost + '/enterprisePageList.do'; //获取招标人代表
var options = {
		isMulti:false,   //是否多选，true为是，false为单选
		enterpriseType: '01',   //enterpriseType
		callback:function(){}
	};
var biders = {};
var isMulti = false;
var selectColumn = {};
var bidId = '';
var tenderProjectType; //招标项目类型
$(function(){
	bidId = $.getUrlParam('bidId'); //标段id
	$("#eventquery").click(function () {
		$("#tableList").bootstrapTable('destroy');
		getTendereeList(selectColumn);
	});
	
	
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
});


/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(data){
	tenderProjectType = data.tenderProjectType;
	//根据data.examType判断是否为预审项目，决定请求路径
	if (data.examType == 1) {
		tenderUrl = preTenderUrl;
	} else {
		tenderUrl = afterTenderUrl;
	}
	//转换数据格式用于判断是否选中
	if(data.biderData){
		for(var i =0 ; i< data.biderData.length; i++){
			biders[data.biderData[i].danweiguid] = data.biderData[i];
		}
	}
//	console.log(biders)
	
	options = $.extend(options, data);
	isMulti = options.isMulti ? options.isMulti : false;
	if(isMulti){
		selectColumn = {
            checkbox: true
        }
	} else {
		selectColumn = {
			radio: true,
	    }
	}
	selectColumn.formatter = function(value, row, index) {
				if(biders[row.id]) {
					if(options.isDisabled){
						return {
							checked: true, //设置选中
							disabled: biders[row.id].isDisabled //设置是否可用
						};
					}else{
						return {
							checked: true, //设置选中
	//						disabled: true //设置是否可用
						};
					}
				}
			}
	
	getTendereeList(selectColumn);
	//确定
	$("#btnSave").click(function(){
		var biderData = [];
		for(var i in biders){
			if(!biders[i].danweiguid){
				biders[i].danweiguid = biders[i].id;
			}
			if(!biders[i].legalCode){
				biders[i].legalCode = biders[i].organNo;
			}
			biderData.push(biders[i]);
		}
		if(biderData.length == 0){
			parent.layer.alert('请选择！',{icon:7,title:'提示'},function(ind){
				parent.layer.close(ind); 
				return
			})
		}else{
			options.callback(biderData);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}
		
	});
}

function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
		uniqueId:'id',
        method: 'post', // 向服务器请求方式
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        url: tenderUrl, // 请求url		
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
		height: 500,
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
//      toolbar: '#toolbar', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onLoadError:function(){
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		
        		parent.layer.alert(data.message);
        	};
        },
        
        /*onPageChange:function(number, size){
        	console.log(number);
        	console.log(data.data);
        },*/
        //点击全选框选中时触发的操作
    onCheckAll:function(rows,$element){
     	for(var i = 0; i< rows.length; i++){
				biders[rows[i].id] = rows[i];
		  	}
    },
		//点击全选框取消时触发的操作
    onUncheckAll:function(rows){
     	for(var i = 0; i< rows.length; i++){
				delete biders[rows[i].id];
		  	}
    },
		//点击每一个单选框时触发的操作
    onCheck:function(row, $element){
			if(isMulti){
				//黑名单验证
				let index = $element.parents('tr').index();
				var parm = checkBlackList(row.organNo,tenderProjectType,"b");
				if(parm.isCheckBlackList){
					$('#tableList').bootstrapTable('uncheck', index);
					parent.layer.alert(parm.message, {icon: 7,title: '提示'});
					return;
				}
				biders[row.id] = row;
			}else{
				
				biders = {};
				biders[row.id] = row;
			}
    },
		//取消每一个单选框时对应的操作；
    onUncheck:function(row){
     delete biders[row.id];
    },
        columns: [selectColumn, {
            field: 'legalName',
            title: '企业名称',
            align: 'left'
        }, {
            field: 'organNo',
            title: '企业编码',
            align: 'left',
            formatter: function (value, row, index) {
            	if(!row.organNo){
					return row.legalCode;
				} else {
					return row.organNo;
				}
            }
        }]
    });
};
// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'enterpriseName': $('#enterpriseName').val(),
        'enterpriseCode':$("#enterpriseCode").val(),
        'bidSectionId': bidId,
		'enterpriseType':options.enterpriseType
    }
}