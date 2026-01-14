	var bidpageUrl = config.tenderHost  + "/OpeningBiddingController/findOpeningPageList.do"; //标段分页查询接口

	$(function(){
		
		sessionStorage.setItem('Token',$.getToken());//数据存入session
		
		var nowDate = top.$("#systemTime").html();
		$('#openTime').val(nowDate);
		//加载列表
		initJudgeTable();
		
		/*查询*/
		$('#btnSearch').click(function(){
			$("#tableList").bootstrapTable('destroy');
			initJudgeTable();
		});
		
		$('#openTime').click(function(){
			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd',
				onpicked:function(){
					$("#tableList").bootstrapTable('destroy');
					initJudgeTable();
				}
			})
		});
		//今天
		/*$('#btnToday').click(function(){
			$('#openTime').val(nowDate);
			$("#tableList").bootstrapTable('destroy');
			initJudgeTable();
		});*/
		
	});
	
	
	/**查询参数*/
	function getQueryParams(params) {
		var projectData = {
			offset: params.offset,
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			'openTime':$('#openTime').val(),
			'interiorBidSectionCode': $('#interiorBidSectionCode').val(),
			'bidSectionName': $('#bidSectionName').val(),
			'presentState':'2'
		};
		return projectData;
	};

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
					field: 'interiorBidSectionCode',
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
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					width: '200',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						return getTenderType(value);
					}
				},
				{
					field: 'bidOpenTime',
					title: '开标时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					},
					
				},
				{
					field: 'bidOpenType',
					title: '开标形式',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
			            if(value == 1){
			            	return '线上开标'
			            }else if(value == 2){
			            	return '线下开标'
			            }
			        }
					
				},{
					field: 'deliverFileType',
					title: '评标形式',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
			            if(value == 1){
			            	return '线上评标'
			            }else if(value == 2){
			            	return '线下评标'
			            }
			        }
					
				},
				{
					field: 'checkType',
					title: '评标办法',
					align: 'center',
					width: '200',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
			            var typeCode = row.tenderProjectType.substring(0, 1);
						return getOptionValue("checkType"+typeCode,value)
			        }
				},
				{
					field: 'tenderAgencyName',
					title: '招标代理机构',
					align: 'center',
					width: '200',
					cellStyle:{
						css:{'white-space':'nowrap'}
					}
					
				},
				{
					field: 'tenderAgencyLinkmen',
					title: '项目经理',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					}
					
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					formatter: function (value, row, index) {
						var handler = "";
						//开标已完成 开标结束中，为查看
//						if(row.invitePurchase || row.inviteSupervise){
							handler = "<a class='btn btn-primary btn-sm' href='OpenTender/manager/model/bidRoomVG.html?bid="+row.bidSectionId+"' target='开标大厅' ><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
//						}
						return handler;
					}
				}
			]
		});
	};
   
