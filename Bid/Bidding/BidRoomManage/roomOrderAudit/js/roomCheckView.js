/**
 *  Xiangxiaoxia 
 *  2019-2-21
 *  开标室的预约审核 详情页面
 *  方法列表及功能描述
 *   1、initData()   查询详情
 */

var urlfindPackage = config.tenderHost + '/BiddingRoomAppointmentController/get.do'; //查询预约审核详情
var updateUrl = config.tenderHost + '/BiddingRoomAppointmentController/updateState.do'; //提交审核状态  提交开始结束时间
var bidDetUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情
var urlfindCheck = config.tenderHost + '/findWorkflowItems.do'; // 根据业务ID查询预约标室审核记录

//var roomHtml = "Bidding/BidIssuing/roomOrder/model/roomChoose.html"; //选择开标室
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //查看标段详情页面

var ids;//标室预约的主键ID

$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		ids = $.getUrlParam("id");
		initData(ids);//查看标室预约详情
		initCheckData(ids);//查看该标室预约的审核记录
	}

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	//查看标段详情
	$('#packageBtn').on('click', '#packageInfo', function() {
		var id = $(this).attr('data-id'); //当前标段id
		var width = $(parent).width() * 0.9;
		var height = $(parent).height() * 0.9;
		top.layer.open({
			type: 2,
			title: "查看标段信息",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: bidDetailHtml + '?id=' + id,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				/*iframeWin.passMessage({callback:bidCallback});  //调用子窗口方法，传参*/

			}
		});
	})
})

function initData(id) {
	$.ajax({
		type: "post",
		url: urlfindPackage,
		data: {
			id: id,
		},
		async: true,
		success: function(data) {
			if(data.success) {
				rowData = data.data;
				$('label').each(function() {
					$(this).text(rowData[this.id]);
				});

				if(rowData.examType == 1) {
					$("#examType").text("资格预审");
				} else if(rowData.examType == 2) {
					$("#examType").text("开评标");
				}

				if(rowData.appointmentState == 0){//临时保存
					$("#appointmentState").text('未提交');
				}else if(rowData.appointmentState == 1){
					$("#appointmentState").text('待审核');
				}else if(rowData.appointmentState == 2){
					$("#appointmentState").text('审核通过');
				}else if(rowData.appointmentState == 3){
					$("#appointmentState").text('审核不通过');
				}
				
				//修正开始时间
				$("#editStartDate").text(rowData.editStartDate? rowData.editStartDate:rowData.appointmentStartDate);
				$("#endStartDate").text(rowData.endStartDate? rowData.editStartDate:rowData.appointmentEndDate);

				initRoomTable(rowData.biddingRoom);
				initPackageTable(rowData.bidSections);
			}
		}
	});
}

//查看该标室预约的审核记录
function initCheckData(id){
	$.ajax({
		type: "post",
		url: urlfindCheck,
		data: {
			workflowType:'yybssh',
			businessId:id,
		},
		async: true,
		success: function(data) {
			if(data.success) {
				var rowData = data.data;
				for(var i = 0; i < rowData.length; i++) {
					if(rowData[i].workflowResult==0){
						rowData[i].workflowResult = '审核通过';
					}else if(rowData[i].workflowResult==1){
						rowData[i].workflowResult = '审核不通过';
					}
					var html = $('<tr><td  align="center">' + (i+1) + '</td>'
						+'<td>'+rowData[i].employeeId +'</td>'
						+'<td  align="center">'+rowData[i].workflowResult +'</td>'
						+'<td  align="center">'+rowData[i].subDate +'</td>'
						+'</tr>');
					$('#checkBtn tbody').append(html);
				}
			}
		}
	});
	
}

function initPackageTable(data) {
	$("#packageBtn").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
		}, {
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
		}, {
			field: 'tenderMode',
			title: '招标方式',
			align: 'center',
			formatter: function(value, row, index) { //招标方式 1为公开招标，2为邀请招标
				if(value == 1) {
					return '<span>公开招标</span>'
				} else if(value == 2) {
					return '<span>邀请招标</span>'
				}
			}
		}, {
			field: 'contractReckonPrice',
			title: '合同估算价(万元)',
			align: 'left',
		}, {
			field: 'action',
			title: '操作',
			align: 'center',
			width: '120px',
			formatter: function(value, row, index) {
				var strSee = '<button  type="button" id="packageInfo" class="btn btn-primary btn-sm" data-id="' + row.bidSectionId + '" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				return strSee;
			}
		}]
	})
	$("#packageBtn").bootstrapTable('load', data);
}

function initRoomTable(data) {
	$("#roomBtn").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					var pageSize = $('#roomBtn').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#roomBtn').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: "biddingRoomName",
				align: "left",
				title: "标室名称",
			}, {
				field: "biddingRoomType",
				align: "center",
				title: "类型",
				width: "120",
				formatter: function(value, row, index) { //	类型 0为自有场地，1为外部场地
					if(value == 0) {
						return '<span>自有场地</span>'
					} else if(value == 1) {
						return '<span>外部场地</span>'
					}
				}
			}, {
				title: "详细地址",
				align: "left",
				field: 'address'
			}
			/*, {
						title: "操作",
						align: "center",
						width: "150",
						field: '',
						formatter: function(value, row, index) {
							if(row.id){
								var strSee = '<button  type="button" id="deleteRoom" class="btn btn-danger btn-sm " data-id="" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
							}
							if(row.type == 1){
								var strSee = '';
							}
							return strSee;

						}
					}*/
		]
	});
	$("#roomBtn").bootstrapTable('load', [data]);
}