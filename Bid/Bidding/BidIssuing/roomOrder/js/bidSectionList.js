/**
*  zhouyan 
*  2019-2-20
*  查看标段列表
*  方法列表及功能描述
*/

var tenderUrl = config.tenderHost + '/BiddingRoomAppointmentController/findBidSections.do'; //获取所有标段列表
var checkboxed;
var options = {
		data:[],  //已被选中列表的id集合
		isMulti:false,   //是否多选，true为是，false为单选
		'tenderProjectState': 2  ,
		callback:function(){}
	};
var bidSetions = {};
var selectColumn = "";
var useType = '';//会议类型
$(function(){
	useType = $.getUrlParam('useType');//公告列表中带过来的标段Id
	
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList(selectColumn);
	});
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(data,callback){
	if(data.data){
		for(var i =0 ; i< data.data.length; i++){
			bidSetions[data.data[i].bidSectionId] = data.data[i];
		}
	}
	callback = callback ? callback :data.callback;
	
	options = $.extend(options, data);
	if(options.isMulti){
		selectColumn = {
            checkbox: true,
            formatter: function(value, row, index) {
//				for(i = 0; i < options.idList.length; i++) {
					if(bidSetions[row.bidSectionId]) {
						return {
							checked: true, //设置选中
							};
					}
//				}

			}
        }
	} else {
		selectColumn = {
			checkbox: true,
	   }
	}
	
	getTendereeList(selectColumn)
	
	//确定
	$("#btnSure").click(function(){
		var biderData = [];
		for(var i in bidSetions){
			if(!bidSetions[i].bidSectionId){
				bidSetions[i].bidSectionId = bidSetions[i].id;
			}
			biderData.push(bidSetions[i]);
		}
		
		if(biderData){
			callback(biderData);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index);
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
}
function getChild(){
	var row = $("#tableList").bootstrapTable("getSelections");
	if(row.length>0){
		var index=parent.layer.getFrameIndex(window.name);
    	parent.layer.close(index);
    	return row
	}else{
		parent.layer.alert("请选择标段")			
	}
}

function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:tenderUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
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
        	}
        },
        //点击全选框选中时触发的操作
    onCheckAll:function(rows){
     for(var i = 0; i< rows.length; i++){
			bidSetions[rows[i].bidSectionId] = rows[i];
		  }
    },
		//点击全选框取消时触发的操作
    onUncheckAll:function(rows){
     	for(var i = 0; i< rows.length; i++){
				delete bidSetions[rows[i].bidSectionId];
		  	}
    },
		//点击每一个单选框时触发的操作
    onCheck:function(row){
			if(options.isMulti){
				bidSetions[row.bidSectionId] = row;
			}else{
				bidSetions = {};
				bidSetions[row.bidSectionId] = row;
			}  
    },
		//取消每一个单选框时对应的操作；
    onUncheck:function(row){
     delete bidSetions[row.bidSectionId];   
    },
        columns: [selectColumn, 
        {
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
		},
		{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
		},
		{
			field: 'examType',
			title: '资格审查方式 ',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
            	var str="";
            	if(value==1){
            		str="资格预审";
            	} else if(value==2){
            		str ="资格后审";
            	}
            	return str;
            }
		}]
    });
//  $("#tableList").bootstrapTable("load", newList);
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'useType': useType,
        'interiorBidSectionCode': $('#interiorBidSectionCode').val(),//标段编号
        'bidSectionName': $('#bidSectionName').val(),//标段名称
    }
}