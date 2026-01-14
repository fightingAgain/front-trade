var msgInfo;
var roomDatas = [];
var orderRoomId //会议室id
var htmltype = $.getUrlParam("htmlTypes");
var boot;
var boots;
var detailHtml = siteInfo.roomOrderUrl + 'Meeting/roomOrder/model/orderDetail.html'; //预约详情
$(function() {
	if(htmltype == "view") {
		boot = false
		boots = true
	} else {
		boot = true;
		boots = false
	}
})

// 预约会议室
$('#orderRoom').click(function() {
	orderRoom()
})

//取消预约
$('#cancelRoom').click(function() {
	delPlan()
})

function orderRoom() {
	if(roomDatas) {
		if(roomDatas.length > 0) {
			parent.layer.alert("温馨提示：已预约会议室，如若变更会议室，请先取消预约");
			return;
		}
	}	
	var data = {
		'appointmentTitle':msgInfo.bidSectionName,
		'linkMen': top.userName,
		'linkTel': top.userTel,
		'examType':msgInfo.examType,
		'biddingRoomPackages': [{
			'id': msgInfo.id,
			'projectName': msgInfo.bidSectionName,
			'projectCode': msgInfo.interiorBidSectionCode,
			'tenderType': '4',
		}]
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '预约会议室',
		area: ['950px', '600px'],
		content: siteInfo.roomOrderUrl + 'Meeting/roomOrder/model/roomList.html'
			//确定按钮
			,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			 iframeWin.passMessage(data,callback)
			iframeWin.passMessage(data, callback)
		}
	});
}
// 回调函数，获取返回值
function callback(data) {
	getRoomList('save', data)

}

//会议室信息
function getRoomList(status, data) {
	var obj = {}
//	obj.projectCode = msgInfo.interiorBidSectionCode;
	obj.projectId = msgInfo.id;
	//	data.packageId=msgInfo.id;
	obj.tenderType = '4';
	$.ajax({
		type: "post",
		url: config.MeetingHost + '/BiddingRoomAppointmentController/getBiddingRoomListByProject.do',
		data: obj,
		dataType: "json",
		async: false,
		success: function(response) {
			if(response.success) {
				var roomAddress = []
				roomDatas = response.data
				if(roomDatas && roomDatas.length > 0) {
					isOpenRoom = true
					if(status == 'save') {
						saveRooms(data, roomDatas)
					}
					$("#cancelRoom").show();
					orderRoomId = roomDatas[0].id
					for(var i = 0; i < roomDatas.length; i++) {
						if(roomDatas[i].appointmentType == 1) {
							roomAddress.push(roomDatas[i].address)
						}
					}
				} else {
					isOpenRoom = false
					$("#cancelRoom").hide();
				}
				$('#openAddress').val(roomAddress.join(';'))
				initRoomList();
				$('#biddingRooms').bootstrapTable("load", roomDatas);
			}
		}
	});
}
//保存会议室
function saveRooms(data, list) {
	var dataObj = {};
	var arr = []
	for(var a = 0; a < list.length; a++) {
		arr.push({
			id: list[a].roomPackageId,
			bidRoomId: data.id,
			openingPlace: list[a].address,
			openingName: list[a].biddingRoomName,
			meetingType: list[a].appointmentType,

		})
	}
	dataObj.id = data.id
	dataObj.bidSectionId = msgInfo.id;
	dataObj.examType = msgInfo.examType
	dataObj.appointmentTime = list[0].subDate;
	dataObj.employeeName = list[0].employeeName
	dataObj.employeeId = top.userId;
	dataObj.bidRoomItemList = arr;
	dataObj.openStartTime = list[0].appointmentStartDate;
	dataObj.openEndTime = list[0].appointmentEndDate;
	dataObj.compertStartTime = list[0].appointmentStartDate
	dataObj.compertEndTime = list[0].appointmentEndDate
	$.ajax({
		type: "post",
		url: config.tenderHost + '/BidRoomController/saveBidRoomAndItem.do',
		data: dataObj,
		dataType: "json",
		async: false,
		success: function(response) {
			if(response.success) {

			}
		}
	});
}
//会议室列表信息
function initRoomList() {
	$('#biddingRooms').bootstrapTable({
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'appointmentTitle',
				title: "会议名称",
				align: 'left',
				visible: boot

			}, {
				field: 'biddingRoomName',
				title: "会议室名称",
				align: 'left',

			},
			{
				field: 'appointmentType',
				title: "会议类型",
				align: 'left',
				formatter: function(value, row, index) {
					var str = []
					var roomType = value.split(',');
					for(var i = 0; i < roomType.length; i++) {
						if(roomType[i] == 1) {
							str.push('开标');
						} else if(roomType[i] == 2) {
							str.push('评审')
						} else if(roomType[i] == 9) {
							str.push('其他')
						}
					}

					return str.join('、')
				}

			},
			{
				field: 'appointmentStartDate',
				title: "会议开始时间",
				align: 'left',

			}, {
				field: 'appointmentEndDate',
				title: "会议结束时间",
				align: 'left',

			},
			{
				field: 'address',
				title: "会议地点",
				align: 'left',
				visible: boot

			},
			{
				field: 'appointmentState',
				title: "会议状态",
				align: 'left',
				visible: boots,
				formatter: function(value, row, index) {
					if(value == '1') {
						return "已生效"
					} else {
						return "未生效"
					}

				}

			},
			{
				field: '',
				title: "操作",
				align: 'left',
				visible: boot,
				formatter: function(value, row, index) {
					var strSee = '<button  type="button" class="btn btn-danger btn-sm" onclick="delrow(\'' + row.id + '\',\'' + row.biddingRoomId + '\',\'' + row.roomPackageId + '\')"><span class="glyphicon glyphicon-remove"></span>删除</button>';

					return strSee

				}

			},
		]
	});

}

//单条删除
function delrow(id, roomid,roomPackageId) {
	parent.layer.confirm('确定删除该标室？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: config.MeetingHost + '/BiddingRoomAppointmentController/deleteBidRoomPackage.do',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				'biddingRoomAppointmentId': id,
				'biddingRoomId': roomid
			},
			success: function(response) {
				if(response.success == true) {
					delRowMsg(roomPackageId,id);
					parent.layer.close(index);
				} else {
					parent.layer.alert(response.message)
				}
			}
		});

	}, function(index) {
		parent.layer.close(index)
	});
}
//删除会议室单条
function delRowMsg(id,roomid) {
	$.ajax({
		url: config.tenderHost + '/BidRoomItemController/deleteItemById.do',//修改标段的接口
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'id': id,
			'bidRoomId': roomid
		},
		success: function(response) {
			if(response.success == true) {
				getRoomList();
				parent.layer.alert("删除成功");
			} else {
				parent.layer.alert(response.message)
			}
		}
	});
}

//取消预约
function delPlan() {
	parent.layer.confirm('温馨提示：您确定要取消预约吗？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: config.MeetingHost + '/BiddingRoomAppointmentController/updateState.do',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				'id': orderRoomId,
				'appointmentState': 5
			},
			success: function(response) {
				if(response.success == true) {

					deletOrder()

					parent.layer.close(index);
				} else {
					parent.layer.alert(response.message)
				}
			}
		});

	}, function(index) {
		parent.layer.close(index)
	});
}
//取消预约
function deletOrder() {
	$.ajax({
		url: config.tenderHost + '/BidRoomController/deleteById', //修改标段的接口
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'id': orderRoomId,
		},
		success: function(response) {
			if(response.success == true) {
				getRoomList();
				parent.layer.alert("取消预约成功");
			} else {
				parent.layer.alert(response.message)
			}
		}
	});
}

//会议室详情
function toDetail(data, start, end) {
	top.layer.open({
		type: 2,
		title: '标室使用情况',
		area: ['800px', '650px'],
		resize: false,
		content: detailHtml,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getRoomInfo(data, start, end);
		}
	})
}