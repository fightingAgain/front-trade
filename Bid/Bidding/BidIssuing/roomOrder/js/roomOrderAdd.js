
/**

*  发标中的开评标场地预约与条件查询
*  方法列表及功能描述
*   1、getTendereeList()   分页查询列表
*   2、queryParams()   分页查询要向后台传递的参数  
*/

var saveUrl = config.tenderHost + '/BiddingRoomAppointmentController/save.do'; // 点击添加保存的接口
var getUrl = config.tenderHost + '/BiddingRoomAppointmentController/get.do'; // 获取项目信息的接口
var WorkflowUrl = config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口

var delBidUrl = config.tenderHost + '/BiddingRoomAppointmentController/deleteBidSection.do';	// 删除标段
var bidChooseUrl = config.tenderHost + '/BiddingRoomAppointmentController/saveBidSection.do';//选择标段地址
var bidDetUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情
//var roomDeleteUrl = config.tenderHost + '/NoticeController/deleteBiddingRoom.do';//删除标室

var bidHtml = "Bidding/BidIssuing/roomOrder/model/bidSectionList.html";  //选择标段页面
var roomHtml = "Bidding/BidIssuing/roomOrder/model/roomChoose.html";  //选择开标室
var roomListHtml = "Bidding/BidIssuing/roomOrder/model/roomList.html";  //选择开标室列表
var bidDetailHtml =  "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面


var id = "";
var isMulti = true;
var enterPriseIframe = "";
var bidId = [];	//	存标段Id ，在添加标段时查重
var bidArr = []; 	//存标段信息，方便添加与删除标段信息后保存时的数组下标值
var projectId = '';	//项目id ，在上传文件时要保存一下项目，根据这个id来判断项目是否
var rooms = [];//会议室信息
 $(function(){
 	//数据初始化
// 	initData();
	

	/*公共文件public中初始化下拉框的方法*/
 	initSelect('.select');
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
	}else{
		/*公共文件public中获取当前登录人信息的方法*/
		var entryArr = entryInfo();
		$("#linkMen").val(entryArr.userName);
		$("#linkTel").val(entryArr.tel);
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
 	
	
	
 	//会议类型选择
	$('[name=appointmentType]').change(function(){
		if($(this).val() == 9){
			$('.appoinOther').css('display','none');
			$('input[name=appointmentType][value=1]').prop('checked',false)
			$('input[name=appointmentType][value=2]').prop('checked',false)
			$('input[name=appointmentType][value=6]').prop('checked',false)
		}else if($(this).val() == 6){
			$('.appoinOther').css('display','block');
			$('input[name=appointmentType][value=1]').prop('checked',false)
			$('input[name=appointmentType][value=2]').prop('checked',false)
			$('input[name=appointmentType][value=9]').prop('checked',false)
		}else{
			$('input[name=appointmentType][value=9]').prop('checked',false)
			$('input[name=appointmentType][value=6]').prop('checked',false)
			$('.appoinOther').css('display','block');
		}
	})
 	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//保存
	$("#btnSave").click(function(){
		if(checkForm($("#formName"))){
			var  appointmentStartDate = Date.parse(new Date($('#appointmentStartDate').val().replace(/\-/g,"/"))); 		//会议开始时间
			var  appointmentEndDate = Date.parse(new Date($('#appointmentEndDate').val().replace(/\-/g,"/")));		//会议结束时间
			if(appointmentEndDate <= appointmentStartDate){
				parent.layer.alert('会议结束时间应在会议开始时间之后！',function(ind){
					parnet.layer.close(ind);
					$('#collapseOne').collapse('show');
				});
				return
			}
			saveForm(true);
		}
	});
	//提交
	$("#btnSubmit").click(function(){
		parent.layer.confirm('确认提交？',{icon:7,title:'询问'},function(indes){
			parent.layer.close(indes);
			if(id){
				saveRoom()
			}else{
				if(checkForm($("#formName"))){
					var  appointmentStartDate = Date.parse(new Date($('#appointmentStartDate').val().replace(/\-/g,"/"))); 		//会议开始时间
					var  appointmentEndDate = Date.parse(new Date($('#appointmentEndDate').val().replace(/\-/g,"/")));		//会议结束时间
					if(appointmentEndDate <= appointmentStartDate){
						parent.layer.alert('会议结束时间应在会议开始时间之后！',function(ind){
							parnet.layer.close(ind);
							$('#collapseOne').collapse('show');
						});
						return
					}
					var roomType = [];
					$.each($('[name=appointmentType]:checked'),function(){
				   		roomType.push($(this).val())
				    });
					if(roomType.length == 0){
						parent.layer.alert('请选择会议类型！',function(ind){
							parnet.layer.close(ind);
							$('#collapseOne').collapse('show');
						});
						return
					}
					if($.inArray('9',roomType) == -1){
						if(bidId.length == 0){
			 				parent.layer.alert('请选择标段！',function(ind){
								parnet.layer.close(ind);
								$('#collapseTwo').collapse('show');
							});
							return
			 			}
					}
					saveForm(false);
				}
			}
		})
		
		
	});
	//选择标段
	$("#bidSection").click(function(){
		if($('[name=appointmentType]:checked').val() == undefined){
			parent.layer.alert('请选择会议类型')
		}else{
			openEnterprise()
		}
	})
	//选择开标室
	$("#roomSection").click(function(){
		var startDate = $('#appointmentStartDate').val();//预约开始时间
		var endDate = $('#appointmentEndDate').val();//预约结束时间
		var timeData = {};
		timeData.startDate = startDate;
		timeData.endDate = endDate;
		var appointmentType = [];
	   	$.each($('[name=appointmentType]:checked'),function(){
	   		appointmentType.push($(this).val())
	    });
	 	timeData.useType = appointmentType.join(',');
		if(startDate == ''){
			parent.layer.alert('请选择会议开始时间！',{icon:7,title:'提示'},function(index){
				parent.layer.close(index);
				$('#collapseOne').collapse('show');
				$('[name="appointmentStartDate"]').focus()
			})
		}else if(endDate == ''){
			parent.layer.alert('请选择会议结束时间！',{icon:7,title:'提示'},function(index){
				parent.layer.close(index);
				$('#collapseOne').collapse('show');
				$('[name="appointmentEndDate"]').focus()
			})
		}else{
			if(Date.parse(new Date(endDate.replace(/\-/g,"/"))) <= Date.parse(new Date(startDate.replace(/\-/g,"/")))){
				parent.layer.alert('会议结束时间要在会议开始时间之后！',{icon:7,title:'提示'},function(index){
					parent.layer.close(index);
					$('#collapseOne').collapse('show');
				})
			}else{
				if($('[name=appointmentType]:checked').val() == undefined){
					parent.layer.alert('请选择会议类型')
				}else{
					openRoom(timeData)
				}
			}
			
		}
	})
	//查看标段详情
	$('#bidList').on('click','.btnView',function(){
		var index = $(this).attr("data-index"); 
		var bidVieId = $(this).closest('td').attr('data-bid-id');  //当前标段id
		var width = $(parent).width() * 0.7;
		var height = $(parent).height() * 0.7;
		top.layer.open({
			type: 2,
			title: "标段详情",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: bidDetailHtml + '?id=' + bidVieId + "&examType=" + bidArr[index].examType + "&classCode=" + bidArr[index].tenderProjectType.substring(0,1) + "&isPublicProject=" + bidArr[index].isPublicProject+"&tenderMode="+bidArr[index].tenderMode,
			success:function(layero, idx){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				/*iframeWin.passMessage({callback:bidCallback});  //调用子窗口方法，传参*/
				
			}
		});
	})
	//删除标段
	$('#bidList').on('click','.delBid',function(){
		var appointmentBidSectionId = $(this).attr('data-bid-id');//预约信息和标段关联id
//		var but = $(this);
		parent.layer.confirm('确认删除此标段？', {icon: 3, title:'询问'},function(index){
			for(var i = 0;i<bidArr.length;i++){
				if(bidArr[i].bidSectionId == appointmentBidSectionId){
					bidArr.splice(i,1);
					bidId.splice(i,1);
				}
			}
			bidderHtml(bidArr);
			parent.layer.close(index);
		})
		
	})
	//删除会议室
	$('#roomList').on('click','.btnDel',function(){
		var rid = $(this).attr('data-rid');
//		var orderId = $(this).attr('data-order');
		var index = $(this).attr('data-index');
		parent.layer.confirm('确定删除该标室？',{icon:3,title:'询问'},function(ind){
			parent.layer.close(ind);
			rooms.splice(index,1);
			roomTable(rooms)
//			deleteRoom(id,rid,index)
		})
	})
		
	
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
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
function saveForm(isSave,callback) {
 	var arr = {}, tips="";
 	var appointmentType = [];
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
   	$.each($('[name=appointmentType]:checked'),function(){
   		appointmentType.push($(this).val())
    });
    if($.inArray('9',appointmentType) == -1){
    	arr.packageIds = bidId;
    }else{
    	arr.packageIds = '';
    }
 	if(!isSave){
 		arr.isSubmit = 1;
 		tips="预约信息提交成功";
 		if(appointmentType.length == 0){
	    	parent.layer.alert('请选择会议类型!',function(index){
				parent.layer.close(index);
				$('#collapseOne').collapse('show');
			});
	    	return
	    }
 		if(rooms.length == 0){
	    	parent.layer.alert('请选择会议室!',function(index){
				parent.layer.close(index);
				$('#collapseThree').collapse('show');
			});
	    	return
	    }
 	} else {
 		tips="预约信息保存成功";
 	};
 	arr.appointmentType = appointmentType.join(',');
	if($('#appointmentTitle').val() && $('#appointmentStartDate').val() && $('#appointmentEndDate').val()){
		if(checkInputLength($("#formName"))){
			$.ajax({
		         url: saveUrl,
		         type: "post",
		         data: arr,
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}else{
		        		$("#appointmentId").val(data.data);
		        		if(isSave){
		        			if(callback){
		        				callback(id);
		        			}else{
		        				parent.layer.alert(tips);
		        			}
		        		}else{
		        			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
							parent.layer.close(index); //再执行关闭  
		        		}
		        	}
					parent.$('#tableList').bootstrapTable('refresh'); 	
		        }
			});
		}
		
	}else if($('#appointmentTitle').val() == ""){
		parent.layer.alert($('#appointmentTitle').attr('errormsg'));
	}else if($('#appointmentStartDate').val() == ""){
		parent.layer.alert($('#appointmentStartDate').attr('errormsg'));
	}else if($('#appointmentEndDate').val() == ""){
		parent.layer.alert($('#appointmentEndDate').attr('errormsg'));
	}
 };
 //编辑确认后增删会议室 确认
 function saveRoom(){
 	if(rooms.length == 0){
 		parent.layer.alert('请选择会议室！');
 		return
 	}
 	var arr = {};
 	var appointmentType = [];
   	$.each($('[name=appointmentType]:checked'),function(){
   		appointmentType.push($(this).val())
    });
    if($.inArray('9',appointmentType) == -1){
    	arr.packageIds = bidId;
    }else{
    	arr.packageIds = '';
    }
    var biddingRoomIds = [];
//  console.log(rooms)
    for(var i = 0;i<rooms.length;i++){
    	if(!rooms[i].state){
    		biddingRoomIds.push(rooms[i].id);
    	}
    }
//  console.log(biddingRoomIds)
 	arr.biddingRoomIds = biddingRoomIds;
 	arr.id = id;
 	arr.isSubmit = 1;
 	$.ajax({
         url: saveUrl,
         type: "post",
         data: arr,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		parent.layer.alert('预约成功！',{icon:6,title:'提示'});
    			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
				parent.layer.close(index); //再执行关闭  
        	}
			parent.$('#tableList').bootstrapTable('refresh'); 	
        }
	});
}
 
 
 //反显
function getDetail() {	
     $.ajax({
         url: getUrl,
         type: "post",
         data: {id:id},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	for(var key in arr){
         		$("#appointmentId").val(arr.id);
         		if(key == "appointmentType"){	//用途 1为资格预审，2为开评标;
         			var type = arr.appointmentType.split(',');
         			var appoinCheckbox = $('[name=appointmentType]');
         			if($.inArray('9',type) != -1){
         				$('.appoinOther').css('display','none');
						$('input[name=appointmentType][value=1]').prop('checked',false)
						$('input[name=appointmentType][value=2]').prop('checked',false)
         			}
         			if(type.length>0){
         				for(var i = 0;i<appoinCheckbox.length;i++){
	         				for(var j = 0;j<type.length;j++){
	         					if($(appoinCheckbox[i]).val() == type[j]){
	         						$('[name=appointmentType]').eq(i).prop('checked',true)
	         					}
	         				}
	         			}
         			}
         		}else if(key == "biddingRooms" && JSON.stringify(arr.biddingRooms) != "{}" ){ //标室信息
         			for(var i = 0;i<arr.biddingRooms.length;i++){
         				arr.biddingRooms[i].state = arr.appointmentState;
         			}
	         		roomTable(arr.biddingRooms);
	         		rooms = arr.biddingRooms;
         		}else if(key == "bidSections" && arr.bidSections.length>0){ //标段信息
         			bidArr = arr.bidSections;
         			biddTable(arr.bidSections);
         			for(var i = 0;i<bidArr.length;i++){
         				bidId.push(bidArr[i].bidSectionId)
         			}
         		}else{
         			var newEle = $("[name='"+key+"']")
            		if(newEle.prop('type') == 'radio'){
            			newEle.val([arr[key]]);
            		}
            		$("#"+key).val(arr[key]);
         		}
        		
            	
           	}   
           	$('input').each(function(){
           		$(this).attr('disabled',true);
           	})
           	$('#bidSection').css('display','none')
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 };
 
 /*
  * 打开标段
  */
function openEnterprise(){
	var type = '';
	$.each($('[name=appointmentType]:checked'), function() {
		if(type == ''){
			type = $(this).val()
		}else{
			type = type + ',' + $(this).val()
		}
	});
	var width = $(parent).width() * 0.6;
	var height = $(parent).height() * 0.7;
	top.layer.open({
		type: 2,
		title: "选择标段",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: bidHtml+'?useType='+type,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			
			iframeWin.passMessage({isMulti:true,callback:bidCallback,data:bidArr});  //调用子窗口方法，传参
			
		}
	});
}
/*
 * 同级页面返回参数
 */
function bidCallback(data){
	bidArr = [];
	bidId = [];
	for(var i = 0;i<data.length;i++){
		bidId.push(data[i].bidSectionId)
		bidArr.push(data[i])
	}
	bidderHtml(bidArr)
	
	
}
// 标段表格
function bidderHtml(data){
	$("#bidList").html('');
	var html='';
	html = '<tr>'
		+'<th style="width: 50px;text-align:center">序号</th>'
		+'<th style="width: 200px;text-align:left">标段编号</th>'
		+'<th>标段名称</th>'
		+'<th style="width: 100px;text-align:center">招标方式</th>'
		+'<th style="width: 200px;text-align:center">合同估算价</th>'
		+'<th style="width: 200px;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].tenderMode == '1'){
			data[i].tenderMode='公开招标'
		}else if(data[i].tenderMode == '2'){
			data[i].tenderMode='邀请招标'
		}
		if(data[i].priceUnit){
			if(data[i].priceUnit == 0){
				data[i].priceUnit =  '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">元<span>'
			}else if(data[i].priceUnit == 1){
				data[i].priceUnit = '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">万元<span>'
			}
		}else{
			data[i].priceUnit = ""
		}
		if(data[i].currencyCode){
			if(data[i].currencyCode == 156){
				data[i].currencyCode = "/人民币）"
			}
		}else{
			data[i].currencyCode = "）"
		}
		html += '<tr>'
		+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<td style="width: 200px;text-align:left">'+data[i].interiorBidSectionCode+'</td>'
		+'<td>'+data[i].bidSectionName+'</td>'
		+'<td style="width: 100px;text-align:center">'+data[i].tenderMode+'</td>'
		+'<td style="width: 300px;text-align:right">'+data[i].contractReckonPrice+data[i].priceUnit+'</td>'
		+'<td style="width: 200px;" data-bid-id="'+data[i].bidSectionId+'">'
			+'<button type="button" class="btn btn-primary btn-sm btnView" data-bid-id="'+data[i].bidSectionId+'" data-index="'+i+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'<button type="button" class="btn btn-danger btn-sm delBid" data-bid-id="'+data[i].bidSectionId+'"><span class="glyphicon glyphicon-remove"></span>删除</button>'
		+'</td></tr>';
		
	}
	$(html).appendTo('#bidList');
//	$("#bidList").append(html);
	
}
//已预约后的标段表格
function biddTable(data){
	$("#bidList").html('');
	var html='';
	html = '<tr>'
		+'<th style="width: 50px;text-align:center">序号</th>'
		+'<th style="width: 200px;text-align:left">标段编号</th>'
		+'<th>标段名称</th>'
		+'<th style="width: 100px;text-align:center">招标方式</th>'
		+'<th style="width: 200px;text-align:center">合同估算价</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].tenderMode == '1'){
			data[i].tenderMode='公开招标'
		}else if(data[i].tenderMode == '2'){
			data[i].tenderMode='邀请招标'
		}
		if(data[i].priceUnit){
			if(data[i].priceUnit == 0){
				data[i].priceUnit =  '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">元<span>'
			}else if(data[i].priceUnit == 1){
				data[i].priceUnit = '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">万元<span>'
			}
		}else{
			data[i].priceUnit = ""
		}
		if(data[i].currencyCode){
			if(data[i].currencyCode == 156){
				data[i].currencyCode = "/人民币）"
			}
		}else{
			data[i].currencyCode = "）"
		}
		html += '<tr>'
		+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<td style="width: 200px;text-align:left">'+data[i].interiorBidSectionCode+'</td>'
		+'<td>'+data[i].bidSectionName+'</td>'
		+'<td style="width: 100px;text-align:center">'+data[i].tenderMode+'</td>'
		+'<td style="width: 300px;text-align:right">'+data[i].contractReckonPrice+data[i].priceUnit+'</td>'
		+'</tr>';
//		$("#bidList").append(html);
	}
	$(html).appendTo('#bidList');
	
}



/*
 * 打开开标室
 * */
/*function openRoom(){
	var width = $(parent).width() * 0.7;
	var height = $(parent).height() * 0.8;
	var startDate=$('#appointmentStartDate').val();//预约开始时间
	var endDate=$('#appointmentEndDate').val();//预约开始时间
	top.layer.open({
		type: 2,
		title: "选择开标室",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: roomHtml + '?roomId=' + $("#biddingRoomId").val()+'&startDate='+$('#appointmentStartDate').val(),
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(roomCallback);  //调用子窗口方法，传参
		}
	});
}*/
/*
 * 打开开标室列表
 * */
function openRoom(data){
	data.roomId = $("#biddingRoomId").val();
	top.layer.open({
		type: 2,
		title: "选择会议室",
		area: ['90%', '650px'],
		resize: false,
		content: roomListHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data,rooms,roomCallback);  //调用子窗口方法，传参
		}
	});
}
/*
* 根据选择的开标室返回的标室ID（roomId）来再次请求后台，查询对应标室详细信息
 * */
function roomCallback(data,start,end){
	if(!id){
		$('#appointmentStartDate').val(start);
		$('#appointmentEndDate').val(end);
	}
	rooms = data;
	roomTable(data)
	
	
}
function roomTable(data){
	$('#roomList tbody').html('');
	var html='';
	
	for(var i = 0;i<data.length;i++){
		if(data[i].biddingRoomType == '0'){
			data[i].biddingRoomType = "自有场地";
		}else if(data[i].biddingRoomType == '1'){
			data[i].biddingRoomType = "外部场地";
		};
		var delBtn = '';
		if(data[i].state){
			delBtn = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-rid="'+data[i].id+'" data-index="'+i+'"><span class="glyphicon glyphicon-remove"></span>删除</button>'
		}
		html += '<tr>'
		+'<td  style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<td><input type="hidden" name="biddingRoomIds['+i+']" value="'+data[i].id+'" />'+data[i].biddingRoomName+'</td>'
		+'<td style="width: 150px;text-align:center">'+data[i].biddingRoomType+'</td>'
		+'<td>'+data[i].address+'</td>'
		+'<td style="width: 100px;text-align: center;">'+delBtn+'</td></tr>';
	}
	$(html).appendTo("#roomList tbody")
}
/*//删除会议室
function deleteRoom(orderId,room,index){
	$.ajax({
		type:"post",
		url:roomDeleteUrl,
		async:true,
		data: {
			'id': orderId,
			'biddingRoomId': room
		},
		success: function(data){
			if(data.success){
				rooms.splice(index,1);
				roomTable(rooms);
			}
		}
	});
}*/