/**
*  Xiangxiaoxia 
*  2019-2-21
*  开标室的预约审核 审核页面
*  方法列表及功能描述
*   1、initData()   查询详情
*/

var urlfindPackage = config.tenderHost + '/BiddingRoomAppointmentController/get.do';//查询预约审核详情
var updateUrl = config.tenderHost + '/BiddingRoomAppointmentController/updateState.do'; //提交审核状态  提交开始结束时间
var bidDetUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情

var roomHtml = "Bidding/BidIssuing/roomOrder/model/roomChoose.html";  //选择开标室
var bidDetailHtml =  "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面

var ids;
var biddingRoomId;

$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		ids = $.getUrlParam("id");
		initData(ids);
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//查看标段详情
	$('#packageBtn').on('click','#packageInfo',function(){
	var id = $(this).attr('data-id');  //当前标段id
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "查看标段信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: bidDetailHtml + '?id=' + id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			/*iframeWin.passMessage({callback:bidCallback});  //调用子窗口方法，传参*/
			
		}
	});
	})
})

//删除
/*$('#roomBtn').on('click','#deleteRoom',function(){
		$(this).closest('tr').remove();
		biddingRoomId='';
});*/

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
				biddingRoomId = rowData.biddingRoomId;
				$('label').each(function() {
					$(this).text(rowData[this.id]);
				});

				if(rowData.examType == 1) {
					$("#examType").text("资格预审");
				} else if(rowData.examType == 2) {
					$("#examType").text("开评标");
				}

				//开始结束时间回显
				$("[name='appointmentStartDate']").val(rowData.appointmentStartDate);
				$("[name='appointmentEndDate']").val(rowData.appointmentEndDate);
			
				initRoomTable(rowData.biddingRoom);
				initPackageTable(rowData.bidSections);
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
			formatter: function(value, row, index) {//招标方式 1为公开招标，2为邀请招标
				if(value == 1) {
					return '<span>公开招标</span>'
				} else if(value ==2) {
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
			formatter: function (value, row, index) {
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
			formatter: function(value, row, index) {//	类型 0为自有场地，1为外部场地
				if(value == 0) {
					return '<span>自有场地</span>'
				} else if(value ==1) {
					return '<span>外部场地</span>'
				}
			}
		}, {
			title: "详细地址",
			align: "left",
			field: 'address'
		}/*, {
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
		}*/]
	});
	$("#roomBtn").bootstrapTable('load', [data]);
}

var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
//开始时间
 	$('#appointmentStartDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			onpicked:function(){
				$dp.$('appointmentEndDate').click();
			},
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'appointmentEndDate\')}'
		})
 	});
 	//结束时间
 	$('#appointmentEndDate').click(function(){
 		if($('#appointmentStartDate').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:nowDate
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'appointmentStartDate\')}'
			})
 		}
 		
 	});


function NewDate(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date();   
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date.getTime();  
}


//评标室详情
$("#chooseRoom").click(function() {
	//弹出标室详情框，选择要更换的评标室
	var width = $(parent).width() * 0.6;
	var height = $(parent).height() * 0.6;
	top.layer.open({
		type: 2,
		title: "选择开标室",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: roomHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(roomCallback);  //调用子窗口方法，传参
		}
	});
})

/*
 * 同级页面返回参数
 */
function roomCallback(roomId){
	biddingRoomId=roomId;
	$.ajax({
		type:"post",
		url:bidDetUrl,
		async:true,
		data: {
			'id':roomId
		},
		success: function(data){
			if(data.success){
				initRoomTable(data.data)
			}
		},
		error: function(data){
			parent.layer.alert("加载失败！",{icon: 3,title: '提示'})
		}
	});
	
}
//提交审核结果
$("#btnSubmit").click(function() {
	var appointmentState = $("input[name='appointmentState']:checked").val();
	var editStartDate = $("#appointmentStartDate").val();
	var editEndDate = $("#appointmentEndDate").val();

	if(!appointmentState) {
		layer.alert("请选择审核意见");
		return;
	}
	if($("#appointmentStartDate").val() == "") {
		layer.alert("请选择开始时间");
		return;
	}
	if($("#appointmentEndDate").val() == "") {
		layer.alert("请选择结束时间");
		return;
	}
	
	if(!biddingRoomId) {
		layer.alert("请选择开标室");
		return;
	}
	
	parent.layer.confirm('确定提交审核?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: updateUrl,
				type: "post",
				data: {
					id:ids,
					appointmentState:appointmentState,
					editStartDate:editStartDate,
					editEndDate:editEndDate,
					biddingRoomId:biddingRoomId,
				},
				async: true,
				success: function(data) {
					if(data.success) {
						parent.layer.alert("审核成功",{icon: 1,title: '提示'});
						//重新加载，刷新修改数据
						initData(ids);
						parent.$('#roomAuditList').bootstrapTable('refresh');
					}else{
						parent.layer.alert("审核失败",{icon: 2,title: '提示'});
					}
				},
				error: function(data) {
					parent.layer.alert("加载失败",{icon: 3,title: '提示'});
				}
			});
		});
})