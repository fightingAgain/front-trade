/**
*  Xiangxiaoxia 
*  2019-2-21
*  评标室的编辑和保存详情页面
*  方法列表及功能描述
*   1、getDetail()   查询已保存详情
*/
var saveUrl = config.tenderHost + '/BiddingRoomManagementController/saveOrUpdateBiddingRoom.do'; // 点击添加评标室 保存的接口
var addUrl = config.tenderHost + '/BiddingRoomManagementController/saveOrUpdateBiddingRoom.do'; //添加评标室和修改的接口
var findUrl = config.tenderHost + '/BiddingRoomManagementController/selectBiddingRoomById.do'; //添加评标室和修改的接口


var id = ""; //返回 已保存或者已添加的评标室主键ID

$(function() {
		//数据初始化
		//initData();
		initSelect('.select')
		var entryArr = entryInfo();
		$("[name='chargePerson']").val(entryArr.userName);
		$("[name='chargeTel']").val(entryArr.tel);

		// 获取连接传递的参数
		if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
			id = $.getUrlParam("id");
			getDetail();
		}else{
			$('input:radio[name="biddingRoomType"][value="0"]').prop('checked', true);
			$('input:radio[name="isOpen"][value="1"]').prop('checked', true);
		}

		var startDate = top.$("#systemTime").html() + " " + "00:00";
		var endDate = '2030-12-30 23:59' ;
		$("#openStartDate").val(startDate);
		$("#openEndDate").val(endDate);
		
		//可选时间范围的限制   大于当前时间  ，结束时间大于开始时间
		var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		//开始时间
 	$('#openStartDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			onpicked:function(){
				$dp.$('openEndDate').click();
			},
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'openEndDate\')}'
		})
 	});
 	//结束时间
 	$('#openEndDate').click(function(){
 		if($('#openStartDate').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:nowDate
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'openStartDate\')}'
			})
 		}
 		
 	});
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//保存
	$("#btnSave").click(function() {
		var roomType = [];
		$.each($('[name=useType]:checked'),function(){
	   		roomType.push($(this).val())
	    });
	    if(roomType.length == 0){
			parent.layer.alert('请选择会议室类型！',function(ind){
				parent.layer.close(ind);
//				$('#collapseOne').collapse('show');
			});
			return
		}
		saveForm();
	});
	//
	$('[name=areaCode]').change(function(){
		if($(this).val() != ''){
			var area  = getOptionValue('areaCode',$(this).val());
			$('[name=address]').val(area);
		}else{
			$('[name=address]').val(area);
		}
	})
	//会议室类型选择
	$('[name=useType]').change(function(){
		if($(this).val() == 9){
			$('.appoinOther').css('display','none');
			$('input[name=useType][value=1]').prop('checked',false)
			$('input[name=useType][value=2]').prop('checked',false)
		}else{
			$('input[name=useType][value=9]').prop('checked',false)
			$('.appoinOther').css('display','block');
		}
	})
})


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
 * 表单的保存和提交
 */
function saveForm() {
	var arr = {};
	var tips;
	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	var biddingRoomType = $("input[name='biddingRoomType']:checked").val();
	var isOpen = $("input[name='isOpen']:checked").val();
	var useType = [];
// 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
   	$.each($('[name=useType]:checked'),function(){
   		useType.push($(this).val())
    });
	arr.useType = useType.join(',');
	arr.biddingRoomType = biddingRoomType;
	arr.isOpen = isOpen;
	arr.isDel = 0;   //0为正常，1为删除
	
	if(id == '' || id == undefined) {
		tips = "评标室添加成功"
	}else{
		tips = "评标室修改成功"
		arr.id = id;
	}
	
	var openStartDate = $("#openStartDate").val();
	var openEndDate = $("#openEndDate").val();
	if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
		parent.layer.confirm('确定提交保存?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: addUrl,
				type: "post",
				data: arr,
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert(tips, {icon: 1,title: '提示'});
					parent.$("#roomManageList").bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭  
				},
				error: function() {
					parent.layer.alert("加载失败");
				}
			})
		});
	}
	/*if(!$("[name='biddingRoomName']").val()) {
		layer.alert("请填写评标室名称");
		return;
	}
	if(!isOpen) {
		layer.alert("请选择是否开放");
		return;
	}
	if(!biddingRoomType) {
		layer.alert("请选择评标室类型");
		return;
	}
	if(openStartDate == "") {
		layer.alert("请选择开放开始时间");
		return;
	}
	if(openEndDate == "") {
		layer.alert("请选择开放结束时间");
		return;
	}*/
	
	
};

//查询评标室详情
function getDetail() {
	$.ajax({
		url: findUrl,
		type: "post",
		data: {
			id: id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			for(var key in arr) {
				if( key =='biddingRoomType'){
					$("input[name='biddingRoomType'][value=" + arr.biddingRoomType + "]").attr("checked", true);
				}else if(key =='isOpen'){
					$("input[name='isOpen'][value=" + arr.isOpen + "]").attr("checked", true);
				}else if(key == 'useType'){
        			$('[name=useType]').val(arr[key]?arr[key].split(','):[]);
        		}else{
					$("[name='" + key + "']").val(arr[key]);
				}
			}
		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}