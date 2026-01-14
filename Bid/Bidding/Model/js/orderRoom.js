var roomListUrl = config.tenderHost + '/BidRoomController/getBidRoomBySection.do';//查看标室预约记录 (根据标段id查询)
var publicRoom = '/XYPRT-SMS/index.html#/copeningRoomReserveList';//公共资源时预约会议室页面
var bidUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//标段信息
var cancelUrl = config.tenderHost + '/BidRoomController/deleteById.do';//非公共资源取消预约
var relateHtml = 'Bidding/Model/relateRoomList.html';//关联页面
//var pushUrl = config.tenderHost + "/BidRoomController/saveJsonBidRoomAndItem.do";//推送地址
var msgInfo;
var roomDatas = [];
var orderRoomId //会议室id
var htmltype = $.getUrlParam("htmlTypes");
var boot;
var boots;
var isPublicProject = 0;//是否公共资源，非公共资源预约平台会议室，公共资源预约服务平台会议室
var isRoom = false;//是否预约了会议室 true 已预约，false 未预约（用于提交时验证）
var detailHtml = siteInfo.sysUrl + '/Meeting/roomOrder/model/orderDetail.html'; //预约
var stage = 2;
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
	if($(this).attr('data-stage')){
		stage = $(this).attr('data-stage')
	}
	orderRoom(stage)
})
//关联会议室
$('#relateRoom').click(function() {
	if($(this).attr('data-stage')){
		stage = $(this).attr('data-stage')
	}
	getRelate();
})

//取消预约
$('#cancelRoom').click(function() {
	if($(this).attr('data-stage')){
		stage = $(this).attr('data-stage')
	}
	delPlan(stage);
})

function orderRoom(type) {
	/*if(roomDatas) {
		if(roomDatas.length > 0) {
			parent.layer.alert("温馨提示：已预约会议室，如若变更会议室，请先取消预约");
			return;
		}
	}	*/
	var data = {
		'appointmentTitle':msgInfo.bidSectionName,
		'linkMen': top.userName,
		'linkTel': top.userTel,
		'supplierEnterpriseName':msgInfo.tendererName,
		'supplierEnterpriseId': msgInfo.tendererEnterprisId,
		'examType': type,
		'sysCode':top.zbSysCode,
		'biddingRoomPackages': [{
			'id': msgInfo.id,
			'projectName': msgInfo.bidSectionName,
			'projectCode': msgInfo.interiorBidSectionCode,
			'tenderType': '4',
		}]
	}
//	if(isPublicProject == 1){
//		top.layer.open({
//			type: 2,
//			title: "预约会议室",
//			area: ['100%', '600px'],
//			resize: false,
//			content: publicRoom + '?legalCode=' + entryInfo().enterpriseCode + '&platformCode=c7d17172-f764-4634-8551-ded1577400cf',
//			success:function(layero, index){
//				var iframeWin = layero.find('iframe')[0].contentWindow;
////				iframeWin.passMessage(data,rooms,roomCallback);  //调用子窗口方法，传参
//			}
//		});
//	}else{
		parent.layer.open({
			type: 2,//此处以iframe举例
			title: '预约会议室',
			area: ['1000px', '600px'],
			content: siteInfo.sysUrl + '/Meeting/roomOrder/model/roomList.html'
				//确定按钮
				,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				//			 iframeWin.passMessage(data,callback)
				iframeWin.passMessage(data, callback)
			}
		});
//	}
}
// 回调函数，获取返回值
function callback(data) {
	getRoomList(msgInfo.id,stage)
}

//会议室信息
function getRoomList(id, type) {
	var obj = {}
    obj.bidSectionId=id;
	obj.examType = type;

	$.ajax({
		type: "post",
		url: roomListUrl,
		data: obj,
		dataType: "json",
		async: false,
		success: function(response) {
            if(response.success) {
                var roomAddress = [];
                roomDatas = [];
                if(response.data && response.data.bidRoomItemList && response.data.bidRoomItemList.length > 0){
                	roomDatas = response.data.bidRoomItemList;
                }
				if(response.data && response.data.isRelevance && response.data.isRelevance == 1){
					$('#relateRoom').hide();
				}else{
					$('#relateRoom').show();
				}
                if(roomDatas && roomDatas.length > 0) {
//              	if(isPublicProject != 1){//非公共资源项目才能取消预约
                		$("#cancelRoom").show();
//              	}
					isRoom = true;
                    orderRoomId = roomDatas[0].id
                    for(var i = 0; i < roomDatas.length; i++) {
                        if(roomDatas[i].meetingType == 1){
                            roomAddress.push(roomDatas[i].openingPlace);
                        }
                    }
                } else {
                    isRoom = false
                    $("#cancelRoom").hide();
                }
                $('#openAddress').val(roomAddress.join(';'));
//              $('#biddingRooms').bootstrapTable("load", roomDatas);
//				if(roomDatas.length > 0){
//					$("#biddingRooms").bootstrapTable('destroy');
					$('#biddingRooms').bootstrapTable("load", roomDatas);
//				}
            }else{
            	parent.layer.alert(response.message)
            }
			
		}
	});
}

//会议室列表信息
//function initRoomList() {
	$('#biddingRooms').bootstrapTable({
		columns: [{
				field: 'meetingType',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},{
				field: 'openingName',
				title: "会议室名称",
				align: 'left',

			},
			{
				field: 'meetingType',
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
				field: 'openStartTime',
				title: "会议开始时间",
				align: 'left',

			}, {
				field: 'openEndTime',
				title: "会议结束时间",
				align: 'left',

			},
			{
				field: 'openingPlace',
				title: "会议地点",
				align: 'left',
				visible: boot

			}
		]
	});

//}

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
				getRoomList(msgInfo.id,stage);
				parent.layer.alert("删除成功");
			} else {
				parent.layer.alert(response.message)
			}
		}
	});
}

//取消预约
function delPlan(stage) {
	parent.layer.confirm('温馨提示：您确定要取消预约吗？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			type: "post",
			url: cancelUrl,
			dataType: "json",
			async: true,
			data: {
				'bidSectionId': msgInfo.id,
				'examType': stage,
			},
			success: function(response) {
				if(response.success == true) {
					getRoomList(msgInfo.id,stage)
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
/*******************  获取标段信息  ******************/
/*
 * isValue 是否给页面元素赋值
 * 
 * */
function getBidInfo(id,isValue){
	$.ajax({
		type:"post",
		url:bidUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				msgInfo = data.data;
				if(isValue){
					for(var key in msgInfo){
						var newEle = $("#"+key)
            			newEle.html(msgInfo[key]);
		          	}
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
/* ********************         关联会议室          ****************** */
function getRelate(){
	msgInfo.stage = stage;
	top.layer.open({
		type: 2,
		title: '关联会议室',
		area: ['1000px', '650px'],
		resize: false,
		content: relateHtml,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMassage(msgInfo,callback)
		}
	})
}