var isFirstUrl = config.Reviewhost + '/VetoBidderController/findIsVetoBidder.do';//获取投票信息
var reviewFlowNodeUrl=config.Reviewhost + "/ReviewControll/review.do";
//var saveUrl = config.Reviewhost + "/VetoBidderController/saveVetoBidder.do";//保存
//var saveOtherUrl = config.Reviewhost + '/VetoBidderController/saveVetoBidderItem.do';//响应者保存
var bidSectionId = $.getUrlParam('bidSectionId');
var examType = $.getUrlParam('examType');
var nodeType = $.getUrlParam('nodeType');//当前阶段
var isblind = $.getUrlParam('isblind');//是否是暗标项
var isFirst = true;//是否发起人
var bidderList;//投标人List
var saveList = {};
var nodeSubType = '';
$(function () {
//	bidSectionId = $.getUrlParam('bidSectionId');
//	examType = $.getUrlParam('examType');
//	nodeType = $.getUrlParam('nodeType');
	


});
function passMessage(data){
	nodeSubType = data.nodeSubType;
	getInfo(bidSectionId,examType);
	
	if(isFirst){
		$('.is_first').css('display','block');
		$('.not_first').css('display','none');
		$('#btn_no').css('display','none');
		getBidder(bidSectionId,examType,nodeSubType)
	}else{
		$('.is_first').css('display','none');
		$('.not_first').css('display','block');
		$('#btn_no').css('display','inline-block');
	}
	//提交
	$("#btn_veto").click(function () {
		if(isFirst){
			var row=$("#bidder_list").bootstrapTable('getSelections');
			if(row.length > 0){
                top.layer.confirm("确认否决该投标人？", {
					icon: 3,
					title: '询问'
				}, function (index) {
                    top.layer.close(index);
                    top.layer.prompt({
					  	formType: 2,
					  	title: '请输入否决原因',
					  	area: ['500px', '350px'] //自定义文本域宽高
					}, function(value, index, elem){
//					  	alert(value); //得到value
						saveList = {};
						saveList.bidderId = row[0].supplierId;
						saveList.bidSectionId = bidSectionId;
						saveList.nodeSubType = nodeSubType;
						saveList.reason = value;
						saveList.examType = examType;
						saveList.nodeType = nodeType;
					  	saveInfo(saveList)
                        top.layer.close(index);
					});
				})
			}else{
                top.layer.alert('请选择投标人！');
			}
		}else{
            top.layer.confirm("确认否决该投标人？", {
				icon: 3,
				title: '询问'
			}, function (index) {
                top.layer.close(index);
				if($.trim($('[name=pollReason]').val()) == ''){
                    top.layer.alert('请输入否决原因！');
				}else{
					saveList.bidSectionId = bidSectionId;
//					saveList.checkId = nodeType;
					saveList.pollReason = $('[name=pollReason]').val();
					saveList.examType = examType;
//					saveList.checkFlowId = nodeType;
					saveList.pollResult = '1';
				  	saveInfo(saveList)
				}
			})
		}

	})
	$("#btn_no").click(function () {
        top.layer.confirm("确认不否决该投标人？", {
			icon: 3,
			title: '询问'
		}, function (index) {
            top.layer.close(index);
			if($.trim($('[name=pollReason]').val()) == ''){
                top.layer.alert('请输入不否决原因！');
			}else{
				saveList.bidSectionId = bidSectionId;
//				saveList.checkId = nodeType;
				saveList.pollReason = $('[name=pollReason]').val();
				saveList.examType = examType;
//				saveList.checkFlowId = nodeType;
				saveList.pollResult = '2';
			  	saveInfo(saveList)
			}
		})
	})
	//关闭
	$("#btnClose").click(function () {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	})

//	noteType = data.nodeType;
}
function initTable() {
	$('#bidder_list').bootstrapTable({
		data: bidderList,
        classes: 'table table-hover',
        striped: true,                      //是否显示行间隔色
        search: false,                      //是否显示表格搜索
        strictSearch: false,
        showColumns: false,                  //是否显示所有的列（选择显示的列）
        clickToSelect: true,                //是否启用点击选中行
        uniqueId: "fid",                     //每一行的唯一标识，一般为主键列
        showToggle: false,                   //是否显示详细视图和列表视图的切换按钮
        cardView: false,                    //是否显示详细视图
        detailView: false,                  //是否显示父子表

//		method: 'post', // 向服务器请求方式
//      url:tenderUrl,
//      contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
//      cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
//      striped: true, // 隔行变色
//      dataType: "json", // 数据类型
//      pagination: true, // 是否启用分页
//      showPaginationSwitch: false, // 是否显示 数据条数选择框
//      pageSize: 10, // 每页的记录行数（*）
//      pageNumber: 1, // table初始化时显示的页数
//      pageList: [5, 10, 25, 50],
//      search: false, // 不显示 搜索框
////      sidePagination: 'server', // 服务端分页
//      classes: 'table table-bordered', // Class样式
//      silent: true, // 必须设置刷新事件
//      toolbar: '#toolbar', // 工具栏ID
//      toolbarAlign: 'left', // 工具栏对齐方式
//      sortStable: true,
//      queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
//      queryParamsType: "limit",
//      onLoadError:function(){
//      	top.layer.closeAll("loading");
//      	top.layer.alert("请求失败");
//      },
//      onLoadSuccess:function(data){ 
//      	top.layer.closeAll("loading");
//      	if(!data.success){
//      		
//      		top.layer.alert(data.message);
//      	}
//      },
		columns: [{
				radio:true
			},{
				field: 'xh',
				title: '序号',
				width: '50',
				align: 'center',
				formatter: function (value, row, index) {
	                var pageSize = $('#bidder_list').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#bidder_list').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
			},
			{
				field: "enterpriseCode",
				title: "企业编码",
				visible: isblind == 1?false:true,
				align: "left",
				width: "200"
			}, {
				field: "enterpriseName",
				title: "企业名称",
				align: "left",
			}
		]
	});
//	$('#bidder_list').bootstrapTable("load", bidderList); //重载数据
}
// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
    }
}
function getInfo(id,type){
	$.ajax({
		type:"post",
		url:isFirstUrl,
		async:false,
		data: {
			'checkId': nodeSubType,
			'bidSectionId': id,
			'examType':type
		},
		success: function(data){
			if(data.success){
				if(data.data){
					if(data.data.myPollResult){
						$('[name=pollReason]').val(data.data.pollReason);
                        top.layer.alert('您已投票！如需发起，请等待本轮投票完成！')
						var index = top.layer.getFrameIndex(window.name);
                        top.layer.close(index);
					}else{
						if(data.data.pollResult == 0 ){
							isFirst = false;
							saveList = {};
							saveList.vetoBidderId = data.data.id;
							$('#reason').html(data.data.reason);
							$('#bidder_name').html(data.data.bidderName);
						}
					}
				}
			}else{
                top.layer.alert(data.message)
			}
		}
	});
}
function getBidder(id,type,nType){
	$.ajax({
		type:"post",
		url:reviewFlowNodeUrl,
		async:false,
		data: {
			'method': 'findBidList',
			'nodeType': 'review',
			'nodeSubType': nType,
			'bidSectionId': id,
			'examType': type
		},
		success: function(data){
			if(data.success){
				bidderList = data.data.supplierDtos;
				initTable()
			}else{
                top.layer.alert(data.message)
			}
		}
	});
}
function saveInfo(obj){
	var askUrl = reviewFlowNodeUrl;
	if(isFirst){
		obj.method = 'saveVetoBidder';
		obj.nodeType = nodeType;
		obj.nodeSubType = nodeSubType;
	}else{
		obj.method = 'saveExpertVetoBidderItem';
		obj.nodeType = nodeType;
		obj.nodeSubType = nodeSubType;
	}
	$.ajax({
		type:"post",
		url:askUrl,
		async:true,
		data: obj,
		success: function(data){
			if(data.success){
                top.layer.alert('投票成功！')
				var index = top.layer.getFrameIndex(window.name);
                top.layer.close(index);
			}else{
                top.layer.alert(data.message)
			}
		}
	});
}
