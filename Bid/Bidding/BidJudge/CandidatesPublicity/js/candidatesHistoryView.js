
/**
*  zhouyan 
*  2019-4-15
*  候选人公示查看
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/findDetails.do";	//详情地址   
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var id='';//Id
var fileUploads = null;
var isThrough="";
var tenderProjectType = "";//招标项目类型
$(function(){
	isThrough = $.getUrlParam("isThrough");
	tenderProjectType = $.getUrlParam("tenderProjectType");
	var id = $.getUrlParam('id');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'publicityContent'
	});
	//媒体
	initMedia({
		isDisabled: true
	});
	reviseDetail(id)
	
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:id, 
		status:3,
		type:"hxrgs",
		isThrough:isThrough
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//全屏查看公示
	$('.fullScreen').click(function(){
		var content = $('#publicityContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看中标候选人公示'
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
	})
	

})

/*信息回显*/
function reviseDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		data: {
			'id':id,
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		for(var key in dataSource){
        			if(dataSource.bidForm == 1){
        				dataSource.bidForm = '中标价';
        			}else if(dataSource.bidForm == 2){
        				dataSource.bidForm = '下浮率';
        			};
        			if(dataSource.isPublicBidPrice == 0){
        				dataSource.isPublicBidPrice = '否';
        			}else if(dataSource.isPublicBidPrice == 1){
        				dataSource.isPublicBidPrice = '是';
        			}
        			if(key == 'noticeMedia'){
        				$('[name=noticeMedia]').val(dataSource[key]?dataSource[key].split(','):[]);
        			}else if(key == 'isManual'){
        				if(dataSource.isManual == '1'){
    						$('#isManual').html('自动发布')
    					}else if(dataSource.isManual == '0'){
    						$('#isManual').html('手动发布')
    					}
    					publishType(dataSource.isManual)
        			}else{
        				$("#" + key).html(dataSource[key]);
        			}
	          	};
	          	if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						businessId: id,
						status:2,
					});
				}
				mediaEditor.setValue(dataSource);
	          	if(dataSource.projectAttachmentFiles){
	          		fileUploads.fileHtml(dataSource.projectAttachmentFiles);
	          	}
	          	if(dataSource.bidWinCandidates && dataSource.bidWinCandidates.length>0){
	          		candidateHtml(dataSource.bidWinCandidates);
	          	}
	          	
        	}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
//候选人
function candidateHtml(data){
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
//	console.log(data)
	$('#candidates').html('');
	var html = '';
	var priceUnit = '';
	if(data[0].priceUnit == 0){
		priceUnit = '（元）'
	}else if(data[0].priceUnit == 1){
		priceUnit = '（万元）'
	};
	html = '<tr>';
		html +='<th style="width: 50px;text-align: center;">排名</th>';
		html +='<th>投标人名称</th>';
		html +='<th style="width: 300px;text-align: center;">统一社会信用代码</th>';
		html +='<th style="width: 300px;text-align: center;">投标价格'+priceUnit+'</th>';
		html +='<th style="width: 150px;text-align: center;">得分</th>';
	if(tenderProjectType == 'A'){
		html += '<th style="width: 100px;min-width: 100px;text-align: center;">项目负责人</th>';
		html += '<th style="width: 150px;min-width: 100px;text-align: center;">证书名称及编号</th>';
		html += '<th style="width: 100px;min-width: 100px;text-align: center;">工期</th>';
	};
	html +='</tr>';
//根据得分排序
function sortScore(a,b){
return b.score-a.score
};
//利用js中的sort方法
data.sort(sortScore);
	for(var i = 0;i<data.length;i++){
		if(data[i].comeFrom){
			data[i].winCandidateName = data[i].bidderName;
			data[i].winCandidateId = data[i].supplierId;
		}
		html += '<tr data-winner-id="'+data[i].winCandidateId+'">';
			html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>';
			html += '<td>'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>';
			html += '<td style="width: 300px;text-align: center;">'+data[i].enterpriseCode+'</td>';
			html += '<td style="width: 300px;text-align: right;">'+data[i].bidPrice+'</td>';
			html += '<td style="width: 150px;text-align: center;">'+(data[i].score?data[i].score:'/')+'</td>';
		if(tenderProjectType == 'A'){
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectManagerMane?data[i].projectManagerMane:"") + '</td>';
			html += '<td style="width: 100px;min-width: 150px;text-align: center;">' + (data[i].cfa?data[i].cfa:"") + '</td>';
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectTime?data[i].projectTime:"") + '</td>';
		};
		html += '</tr>';
	};
	$(html).appendTo('#candidates');
	
};
/*
 * 公示发布方式
 * val  是否手动发布；0代表手动 1代表自动
 * */
function publishType(val){
	if(val == 1){
		$('.publish_hand').hide();
		$('.publish_own').show();
	}else{
		$('.publish_own').hide();
		$('.publish_hand').show();
	}
}