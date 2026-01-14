/**
*  zhouyan 
*  2019-4-30
*  线下评审结果录入
*  方法列表及功能描述
*/
var bidderUrl = config.tenderHost + '/BidWinNoticeController/findBidWinCandidateListYuShen.do';//新增时获取投标人信息
var detailUrl = config.tenderHost + '/BidWinNoticeController/getAndFileYuShen.do';//编辑时信息反显接口

var saveUrl = config.tenderHost + '/BidWinNoticeController/saveYuShen.do';//保存地址
var fileUrl = config.FileHost + '/FileController/streamFile.do';//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址

var examType = '';//资格审查方式 1为资格预审，2为资格后审
var bidId='';//标段Id


var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
var answersFileList = []; //文件上传保存路径
fileUploads = null;

var signIn = entryInfo();//当前登录人信息
var dataId = '';//评标报告id
var pretrialCheckType = '';//预审评审办法
var bidderList = [];//投标人
var isPublicProject = '';//是否公共资源
var isLaw = '';//是否依法
var isThrough;
var source = 0; //链接来源  0:查看  1审核
$(function(){
		//初始化编辑器
	examType = $.getUrlParam('examType');//资格审查方式 1为资格预审，2为资格后审
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		isShowTemplateSelect: false,
		pageType: 'view',
		contentKey: 'passedApplicantList'
	});
	var rst = findProjectDetail(bidId);
	initMedia({
		isDisabled: true
	});
	pretrialCheckType = $.getUrlParam('pretrialCheckType');//预审评审办法
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		dataId = $.getUrlParam('id');
		if($.getUrlParam('interiorBidSectionCode')) {
			dataId = getYsPbBgId()
		}
		getDetail(dataId, bidId, examType);
	}
	$('#bidSectionId').val(bidId);
	
//	fileUpload(signIn.enterpriseId,bidId);
	
	//关闭
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//是否公示
	getPublish($('[name=isPublish]:checked').val())
	$('[name=isPublish]').change(function(){
		getPublish($(this).val())
	})
	//预览
	$('body').on('click','#preview',function(){
		var path = $(this).closest('td').find('#fileUrl').val();
		previewPdf(path)
	});
	isThrough = $.getUrlParam("isThrough");
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
	 	source = $.getUrlParam("source");
	 	if(source == 1) {
	 		$("#btnClose").hide();
	 		$("#btnPrint").hide();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"ysjggs", 
	 			businessId:dataId, 
	 			status:2,
	 			submitSuccess:function(){
		         	var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.closeAll(); 
					parent.layer.alert("审核成功",{icon:7,title:'提示'});
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
	 		});
	 	} else {
	 		$("#btnClose").show();
	 		if($('#passedApplicantList').html() != ''){
	 			$("#btnPrint").show();
	 		}
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"ysjggs", 
	 			businessId:dataId, 
	 			status:3,
	 			checkState:isThrough
	 		});
	 	}
 	}
});
function passMessage(data){
	for(var key in data){
		
		$('#'+key).html(data[key])
	}
	if(data.tenderProjectType){
		$('#checkType').html(getTenderType(data.tenderProjectType))
	}
	if(!data.id){
		//媒体
		
//		getBidder(data.bidSectionId);
	}
}
//获取投标人信息
function getBidder(bid){
	$.ajax({
		type:"post",
		url:bidderUrl,
		async:true,
		data: {
			'bidSectionId': bid
		},
		success: function(data){
			if(data.success){
				if(data.data.length>0){
					bidderList = data.data;
					bidderHtml(data.data, bid);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
};
function bidderHtml(data, bid){
	var RenameData = getBidderRenameMark(bid);//投标人更名信息
	$('#bidResult').html('');
	var html = '';
	var priceUnit = '';
	if(data[0].priceUnit == 0){
		priceUnit = '（元）'
	}else if(data[0].priceUnit == 1){
		priceUnit = '（万元）'
	};
	html = '<thead><tr>'
	html += '<th style="width: 50px;text-align: center;">序号</th>'
	html += '<th style="min-width: 200px;white-space: normal;">投标人</th>'
	html += '<th style="min-width: 150px;white-space: normal;">组织机构代码</th>'
	if(pretrialCheckType == 2){
		html += '<th style="width: 80px;white-space: normal;">得分</th>'
	}
	html += '<th style="width: 100px;text-align: center;">是否合格</th>'
	html += '<th style="min-width: 300px;white-space: normal;">修改原因</th>'
	html += '</tr></thead><tbody>'
	for(var i = 0;i<data.length;i++){
		
		if(!data[i].reason){
			data[i].reason = '';
		};
		var option1 = '';
		var isCandidate = false;
		var disable = '';
		
		var option2 = '';
		var isQual = '';
		if(data[i].isWinBidder || data[i].isWinBidder == 0){
			isQual = data[i].isWinBidder;
		}else{
			if(data[i].isKey){
				isQual = data[i].isKey;
			}
		}
		if(isQual == 0){
			option2 = '不合格';
		}else if(isQual == 1 || isQual == ''){
			option2 = '合格';
		};
		
		html += '<tr>'
		html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
		html += '<td style="min-width: 200px;white-space: normal;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
		html += '<td style="min-width: 150px;white-space: normal;">'+(data[i].winCandidateCode?data[i].winCandidateCode:'')+'</td>'
		if(pretrialCheckType == 2){
			html += '<td style="width: 80px;white-space: normal;">'+(data[i].score?data[i].score:'')+'</td>'
		}
		html += '<td style="width: 100px;text-align: center;" data-id="'+data[i].winCandidateId+'" data-iskey="'+data[i].isKey+'">'+option2+'</td>'
		html += '<td style="min-width: 300px;white-space: normal;">'+(data[i].remark?data[i].remark:'/')+'</td>'
		html += '</tr>'
	}
	html += '</tbody>';
	$(html).appendTo('#bidResult');
		
};
function priceTest(ele){
	if(Number(ele.value) >= 1000){
		parent.layer.alert('请正确输入得分',{title:'提示'},function(ind){
			parent.layer.close(ind);
			ele.focus();
		})
	}
}
//反显
function getDetail(id,bidId,type){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id,
			'bidSectionId': bidId
		},
		success: function(data){
			if(data.success){
				if (!data.data) {
					return;
				};
				var dataSource = data.data;
				for(var key in dataSource){
					var newEle = $("[name='"+key+"']")
					if(newEle.prop('type') == 'radio'){
	        			newEle.val([dataSource[key]]);
	        		}else if(newEle.prop('type') == 'checkbox'){
            			newEle.val(dataSource[key]?dataSource[key].split(','):[]);
            		}else{
	        			$("#" + key).html(dataSource[key]);
	        		}
	          	};
	          	if(dataSource.fileUrl && dataSource.fileUrl != ''){
	          		$('#fileUrl').val(dataSource.fileUrl);
	          		$("#fileName").html(dataSource.noticeName);
					$('#preview').css('display','inline-block');
	          	}
	          	if(dataSource.isPublish == 0){
        			$('.isPublish').hide();
        			$('#btnPrint').hide();
        		}else{
        			$('.isPublish').show();
        			if(dataSource.passedApplicantList){
        				$('#btnPrint').show();
        			}
        			mediaEditor.setValue(dataSource);
        		}
        		if(dataSource.tenderProjectType){
        			$('#checkType').html(getTenderType(dataSource.tenderProjectType))
        		}
	          	if(dataSource.bidWinCandidates.length > 0){
	          		bidderList = dataSource.bidWinCandidates;
	          		bidderHtml(dataSource.bidWinCandidates, dataSource.bidSectionId);
	          	}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
//是否公示
function getPublish(val){
	if(val == 1){
		$('.isPublish').show();
	}else{
		$('.isPublish').hide();
	}
}
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("passedApplicantList").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}

/*获取预审评标报告id*/
function getYsPbBgId() {
	var str;
	$.ajax({
		type: "get",
		url: config.tenderHost + '/BidWinNoticeController/findResultsExamByBidId.do',
		async: false,
		data: {
			bidSectionId: bidId
		},
		success: function(data) {
			if(data.success) {
				str = data.data.id
			}
		}
	});
	return str;
}