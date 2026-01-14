
/**
*  zhouyan 
*  2019-4-19
*  候选人公示审核
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/BidWinNoticeController/get.do";	//查看地址
var source = 0; //链接来源 0:查看，1：审核
var RenameData;//投标人更名信息
$(function(){
	var id = $.getUrlParam('id');
	/*审核*/
	source = $.getUrlParam("source");
 	if(source == 1) {
 		$("#btnClose").hide();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"jggs", 
 			businessId:id, 
 			status:2,
 			submitSuccess:function(){
	         	parent.$("#tableList").bootstrapTable("refresh");
	         	var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.closeAll(); 
 			}
 		});
 	} else {
 		$("#btnClose").show();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"jggs", 
 			businessId:id, 
 			status:3
 		});
 	}
 	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	$.ajax({
		type:"post",
		url:viewUrl,
		data: {
			'id':id
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
				if(dataSource.bidSectionId){
					RenameData = getBidderRenameMark(dataSource.bidSectionId);//投标人更名信息
				}
        		for(var key in dataSource){
        			if(key == 'noticeMedia'){
        				$('[name=noticeMedia]').val(dataSource[key]?dataSource[key].split(','):[]);
        			}
	            	$("#" + key).html(dataSource[key]);
	          	};
	          	$('#noticeContent').html(dataSource.html);
	          	var winnerArr = [];
		        for(var i = 0;i<dataSource.bidWinCandidates.length;i++){
		          	if(dataSource.bidWinCandidates[i].isWinBidder == 1){
		          		winnerArr.push(dataSource.bidWinCandidates[i]);
		          	}
		        };
		        candidateHtml(winnerArr);
        	}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	/*全屏*/
	$('.fullScreen').click(function(){
	   parent.layer.open({
        type: 2 
        ,title: '查看公告信息'
        ,area: ['100%', '100%']
        ,content: 'fullScreen.html'
        ,resize: false
        ,btn: ['确定', '取消']
        ,success:function(layero,index){
        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.html($('#noticeContent').html())
        }
        //确定按钮
        ,yes: function(index,layero){
        	var body = parent.layer.getChildFrame('body', index);
        	var iframeWinds=layero.find('iframe')[0].contentWindow;
        	$('#noticeContent').html(body.html());
            parent.layer.close(index);
            
        }
        ,btn2: function(){
          parent.layer.close();
        }
      });
	});
	//中标人
	function candidateHtml(data){
		$('#candidates tbody').html('');
		var html = '';
		for(var i = 0;i<data.length;i++){
			html += '<tr data-winner-id="'+data[i].winCandidateId+'">'
				+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
				+'<td>'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
				+'<td>'+data[i].winCandidateCode+'</td>'
				+'<td style="width: 150px;text-align: right;">'+data[i].bidPrice+'</td>'
			+'</tr>';
		};
		$(html).appendTo('#candidates tbody');
		
	};
})
