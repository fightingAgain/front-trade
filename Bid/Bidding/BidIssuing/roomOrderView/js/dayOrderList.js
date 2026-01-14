/**
*  zhouyan 
*  2019-6-4
*  选择标段
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomListByOneDay.do';  //列表接口


var startDate = '';//查询时间
$(function(){
	//加载列表
	
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab(getQueryParams);
	});
	$('[name=isUse]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab(getQueryParams);
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
});
function passMessage(data){
//	console.log(data.start);
	startDate = data.start.Format("yyyy-M-d");
	initDataTab(getQueryParams);
}
// 查询参数
function getQueryParams(params){
	
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'startDate':startDate,
		'isUse': $('[name=isUse]').val()
	};
	return projectData;
}
//表格初始化
function initDataTab(getQueryParams){
	$("#tableList").bootstrapTable({
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
//      	console.log(data)
//      	mergeTable(data.rows);
        },
		columns: [
			{
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
				field: 'biddingRoomName',
				title: '会议室',
				align: 'left',
				cellStyle:{
					css:widthName
				}
			},{
				field: 'timeInterval',
				title: '使用时间',
				align: 'left',
				cellStyle:{
					css:widthDate
				},
				formatter:function(value, row, index){
	            	var str="";
	            	if(row.editStartDate && row.editEndDate){
	            		str = '<div>'+row.editStartDate + '至' + row.editEndDate+'</div>';
	            	}
	            	return str;
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
				field: 'appointmentType',
				title: '会议类型',
				align: 'left',
				cellStyle:{
					css:widthState
				},
				formatter:function(value, row, index){
	            	var str="";
	            	if(row.appointmentType){
	            		var roomType = row.appointmentType.split(',');
						var typeArr = [];
						for(var j = 0;j<roomType.length;j++){
							if(roomType[j] == 1){
								typeArr.push('开标会');
							}else if(roomType[j] == 2){
								typeArr.push('评标会');
							}else if(roomType[j] == 9){
								typeArr.push('其他');
							} else if(roomType[j] == 6){
								typeArr.push('资格预审会');
							}
						}
						str = typeArr.join(',')
	            	}
        			
	            	return str;
	            }
			},
			{
				field: 'enterpriseName',
				title: '业主单位',
				align: 'left',
				cellStyle:{
					css:widthName
				},
			},
			{
				field: 'linkMen',
				title: '使用者',
				align: 'left',
				cellStyle:{
					css:widthState
				},
			}
		]
	});
};
/**
     * 合并行
     * @param data  原始数据（在服务端完成排序）
     * @param fieldName 合并属性名称数组
     * @param colspan 列数
     * @param target 目标表格对象
     */

function mergeTable(data){
	 var rowMergeCols = ['xh','biddingRoomName','timeInterval'];
        for (var i = 0; i < rowMergeCols.length; i++) {
            var colName = rowMergeCols[i];
            var colVal = '';
            var rowStart = 0;
            var rowCount = 0;
            for (var j = 0; j < data.length; j++) {
                var row = data[j];
                if (colVal == '') {
                    colVal = row[colName];
                    rowCount++;
                } else {
                    if (colVal == row[colName]) {// 行的值相同
                        // 计数加1
                        rowCount++;
                        // 最后一行
                        if (j == data.length - 1) {
                            $('#table_list').bootstrapTable('mergeCells', {
                                index: rowStart,
                                field: colName,
                                rowspan: rowCount
                            });
                        }
                    } else {// 行值不同，将前面相同行值的所有行合并
                        $('#tableList').bootstrapTable('mergeCells', {
                            index: rowStart,
                            field: colName,
                            rowspan: rowCount
                        });
                        colVal = row[colName];
                        rowCount = 1;
                        rowStart = j;
                    }
                }
            }
            /*if(colName == 'timeInterval'){
            	for (var j = 0; j < data.length; j++) {
	                var row = data[j];
	                if(row.editStartDate && row.editEndDate){
		                if (colVal == '') {
		                		colVal = row.editStartDate + row.editEndDate;
		                    rowCount++;
		                } else {
		                    if (colVal == row[colName]) {// 行的值相同
		                        // 计数加1
		                        rowCount++;
		                        // 最后一行
		                        if (j == data.length - 1) {
		                            $('#table_list').bootstrapTable('mergeCells', {
		                                index: rowStart,
		                                field: colName,
		                                rowspan: rowCount
		                            });
		                        }
		                    } else {// 行值不同，将前面相同行值的所有行合并
		                        $('#tableList').bootstrapTable('mergeCells', {
		                            index: rowStart,
		                            field: colName,
		                            rowspan: rowCount,
		                        });
		                        colVal = row.editStartDate + row.editEndDate;
		                        rowCount = 1;
		                        rowStart = j;
		                    }
		                }
	                }
	            }
            }*/
        }
}

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */

