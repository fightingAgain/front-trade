
var detailUrl = config.tenderHost+'/ReconnaissanceSiteController/getTenderReconnaissanceByBidId.do';//编辑时获取详情接口
var joinUrl = config.tenderHost + '/ReconnaissanceEnterpriseController/saveReconnaissanceEnterprise.do';//投标人确认或者拒绝项目经理提出的踏勘通知
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var noticeId = '';//数据id
var bidId = '';//标段id
$(function(){
	//初始化编辑器
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//全屏查看公告
	$('.fullScreen').click(function(){
		var content = $('#noticeContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看通知信息'
	        ,area: ['100%', '100%']
	        ,content: fullScreen
	        ,resize: false
	        ,btn: ['关闭']
	        ,success:function(layero,index){
	        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.find('#noticeContent').html(content);
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	            parent.layer.close(index);
	            
	        }
	       
	    });
	});
	$('#btnJoin').click(function(){
		parent.layer.confirm('确定参加踏勘会？',function(){
			saveJoin(noticeId,'2')
		})
	});
	$('#btnNoJoin').click(function(){
		parent.layer.confirm('确定不参加踏勘会？',function(){
			saveJoin(noticeId,'1')
		})
	})
})
function passMessage(data){
	var bidData = {}
	for(var key in data){
		bidData[key] = data[key];
	}
	for(var key in bidData){
		$('#'+key).html(bidData[key]);
	}
	if(data.getForm && data.getForm == 'KZT'){
		bidId = data.id;
	}else{
		bidId = data.bidSectionId;
	}
	getDetail(bidId);
	/*if(bidData.id){
		noticeId = bidData.id;
		getDetail(noticeId);
	}*/
	/*if(data.reconnaissanceState == 0){
		$('#btnJoin').show();
		$('#btnNoJoin').show();
	}else{
		$('#btnJoin').hide();
		$('#btnNoJoin').hide();
	}*/
}

//修改时获取详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				noticeId = arr.id;
				if(arr.reconnaissanceState == 0){
					$('#btnJoin').show();
					$('#btnNoJoin').show();
				}else{
					$('#btnJoin').hide();
					$('#btnNoJoin').hide();
				}
				if(arr.explorationMethod == 0){
					arr.explorationMethod = '自行踏勘'
				}else if(arr.explorationMethod == 1){
					arr.explorationMethod = '组织踏勘'
				}
				for(var key in arr){
					$('#'+key).html(arr[key]);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}
/*
 * 
 */
function saveJoin(id,state){
	$.ajax({
		type:"post",
		url:joinUrl,
		async:true,
		data: {
			'reconnaissanceId': id,
			'reconnaissanceState': state
		},
		success: function(data){
			if(data.success){
				parent.layer.alert('回复成功！');
				$('#btnJoin').hide();
				$('#btnNoJoin').hide();
				parent.$("#tableList").bootstrapTable('refresh');
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
