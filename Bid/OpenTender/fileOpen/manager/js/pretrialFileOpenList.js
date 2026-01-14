	var bidpageUrl = config.OpenBidHost  + "/ManagerFileOpenController/findBidSectionPretrialPage.do"; //标段分页查询接口

	$(function(){
		//加载列表
		initJudgeTable();
		
		/*查询*/
		$('#btnSearch').click(function(){
			$("#tableList").bootstrapTable('destroy');
			initJudgeTable();
		});
		
		sessionStorage.setItem('Token',$.getToken());//数据存入session
	});

	/**查询参数*/
	function getQueryParams(params) {
		var projectData = {
			offset: params.offset,
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			'bidSectionCode':$('#bidSectionCode').val(),
			'bidSectionName':$('#bidSectionName').val(),
		};
		return projectData;
	}

	//表格初始化
	function initJudgeTable() {
		$("#tableList").bootstrapTable({
			url: bidpageUrl,
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
			search: false, // 不显示 搜索框
			sidePagination: 'server', // 服务端分页
			classes: 'table table-bordered', // Class样式
			silent: true, // 必须设置刷新事件
			queryParamsType: "limit",
			queryParams: getQueryParams,
			striped: true,
			onCheck: function (row) {
	            checkboxed = row
	        },
			columns: [
				{
					field: 'xh',
					title: '序号',
					width: '50',
					align: 'center',
					formatter: function (value, row, index) {
			            var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
			            var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
			            return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			        }
				},
				{
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'bidOpenTime',
					title: '开启时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'stageState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) { 
						switch(row.stageState) {
				            case 1:
				                str='<div >解密中</div>'
				                break;
				            case 2:
				                str='<div >签名中</div>'
				                break;
				            case 3:
				                str='<div >唱标</div>'
				                break;
				            case 4:
				                str='<div >开启结束</div>'
				                break;
				            case 5:
				                str='<div >开启失败</div>'
				                break;
				            case 6:
				                str='<div >开启结束中</div>'
				                break;
				            default:
				            	str='<div >未开启</div>'
						}
						
						return str
					}
				},
				{
					field: 'bidStates',
					title: '标段状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						var status = "";
						if(row.bidStates == 1){
							status = "生效";
						}else if(row.bidStates == 4){
							status = "<div style='color: red;'>招标失败</div>";
						}else if(row.bidStates == 5){
							status = "重新招标";
						}else if(row.bidStates == 6){
							status = "<div style='color: red;'>终止</div>";
						}
						
						return status;
					}
				},
				{
					field: 'reason',
					title: '失败原因',
					align: 'left',
					cellStyle:{
						css:{'min-width':'200px'}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					events:{
						'click .btn_entry':function(e,value, row, index){
							var openHtml = '';
							if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
								openHtml = 'OpenTender/fileOpen/manager/model/pretrialRoom.html?id='+row.id;
							}else{
								openHtml = 'OpenTender/fileOpen/manager/model/pretrialRoomVG.html?bid=' + row.id;
							}
							top.layer.open({
								type: 2,
								area: ['100%', '100%'],
								closeBtn: 0,//不显示关闭按钮
								// btn: ["关闭"],
								maxmin: false,
								resize: false,
								title: false,
								content: openHtml,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
						//			console.log(iframeWin)
									//调用子窗口方法，传参
									iframeWin.passMessage(row,refreshFather);  
								}
							})
						},
						'click .btn_view':function(e,value, row, index){
							top.layer.open({
								type: 2,
								area: ['100%', '100%'],
								closeBtn: 0,//不显示关闭按钮
								// btn: ["关闭"],
								maxmin: false,
								resize: false,
								title: false,
								content: 'OpenTender/fileOpen/manager/model/pretrialRoomView.html?id=' + row.id,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
						//			console.log(iframeWin)
									//调用子窗口方法，传参
									iframeWin.passMessage(row);  
								}
							})
						}
					},
					formatter: function (value, row, index) {
						var handler = "";
						var btnEnter = '<button  type="button" class="btn btn-primary btn-sm btn_entry"><span class="glyphicon glyphicon-edit"></span>进入开启室</button>'
						var btnView = '<button  type="button" class="btn btn-primary btn-sm btn_view"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
						if(row.bidStates == 1){
							//开标已完成 开标结束中，为查看
							if(typeof(row.stageState)=="undefined" || parseInt(row.stageState)<=3|| parseInt(row.stageState)==6){
								return btnEnter;
							}else{
								return btnView;
							}
						}
						return handler;
					}
				}
			]
		});
	}
   
//分页列表展示
function refreshFather(){
	$('#tableList').bootstrapTable(('refresh'));
}