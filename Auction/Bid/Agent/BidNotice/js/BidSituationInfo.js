var urlfindChargePageList = top.config.bidhost + "/OfferController/findOfferOrderList.do" //询比采购情况明细  平台服务费缴纳
var urlfindChargePageListCa = top.config.bidhost + '/OfferController/findCaOfferOrderList.do';
var urlfindBidFileDownload = top.config.bidhost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
var downloadFileUrl = top.config.bidhost + '/FileController/download.do';//下载文件
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //采购文件分页

var findProjectInfo = config.bidhost +'/ProjectPackageController/findPackageInfo.do';//项目信息
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('id');
var examTypeList = getUrlParam('examType');//阶段资格审查方式 0资格预审  1后审
var tenderTypeCode=getUrlParam('tenderType');
var RenameData = {};//供应商更名信息
/** 资格后审是否加密 0不加密 1加密 */
var encipherStatus;
/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function() {
	//查询项目包件信息
	$.ajax({
		type: "post",
		url: findProjectInfo,
		dataType: 'json',
		data: {
			id :packageId
		},
		async: false,
		success: function(result) {
			if(result.success) {
				var data = result.data || {};
				encipherStatus = data.encipherStatus;
				//显示数据
				du(data);
			}
		}
	});
	
	$('#exportRecord').click(function(){
		var url = top.config.bidhost + '/OfferController/exportFileRecord.do';
		if (encipherStatus == 1 && examTypeList == 1) {
			url = top.config.bidhost + '/OfferController/exportCaFileRecord.do';
		}
		if($('#BidSituationRecord').hasClass('JD_view')){
			window.location.href = $.parserUrlForToken(url + '?packageId='+packageId+'&projectId='+projectId+'&isIp=1&examType='+examTypeList+(examTypeList==0 ? "":"&bidValue1=wjml"));
		}else{
			window.location.href = $.parserUrlForToken(url + '?packageId='+packageId+'&projectId='+projectId+'&examType='+examTypeList+(examTypeList==0 ? "":"&bidValue1=wjml"));
		}
		
	});
})

function du(rowData){
	$("div[id]").each(function() {
		$(this).html(rowData[this.id]);
	});
	isShowSupplierInfo(projectId, packageId, examTypeList, 'submit', '0', function(data, html){
		if(data.isShowSupplier == 1){
			setBidSituationDetail(rowData);
			$('.BidSituationRecord').show();
		}else{
			$('.BidSituationRecord').hide();
			$("#BidSituationDetail").closest('td').html('<div class="red" style="text-align: center;">'+html+'</div>')
			
		}
	});
	// setBidSituationDetail(rowData);
	if(examTypeList==0){
		$("#examTitles").html('资格申请文件递交情况')
	}else{
		$("#examTitles").html('询比报价文件递交情况')
	}
};

var fileData=""
var fileDataB=""
//挂载询比采购情况请求
function setBidSituationDetail(Tdata) {
	var dataParam = {
		"packageId": packageId,
		"projectId": projectId,
		'examType':examTypeList
	}	
	examTypeList==0 ? "":dataParam.bidValue1="wjml"
	var url = urlfindChargePageList;
	if (encipherStatus == 1 && examTypeList == 1) {
		url = urlfindChargePageListCa;
	}
	$.ajax({
		type: "post",
		url: url,
		dataType: 'json',
		data: dataParam,
		async: false,
		success: function(result) {
			if(result.success) {
				if(result.data.length>0){
					RenameData = getBidderRenameData(packageId);//供应商更名信息
				}
				setBidSituationDetailHTML(result.data,Tdata.examType); //有数据挂载
				setBidSituationRecordHTML(result.data);
			}
		}
	});		
}
//挂载询比采购情况请求
function setBidSituationDetailHTML(data) {
	var meFlie='<thead>'
       	+'<tr>'
       		+'<th style="width:50px">序号</th>'
       		+'<th>供应商名称</th>'
       		+'<th>'+(examTypeList==0 ? "评审项名称":"报价文件名称")+'</th>'
       		+'<th style="width:120px;text-align:center">递交状态</th>'
       		+'<th style="width:150px;text-align:center">递交时间</th>'
       		//+'<th style="width:150px;text-align:center">撤回时间</th>' 
       		//+'<th style="width:150px;text-align:center">操作</th>'      
       	+'</tr>'
      +'</thead>'
	  if(data.length>0){
	  	for(var i=0;i<data.length;i++){
			meFlie+='<tr>'
			meFlie+='<td style="text-align:center" '+(data[i].packageCheckLists.length>0?"rowspan='"+ data[i].packageCheckLists.length +"'":'')+'>'+(i+1)+'</td>'
			meFlie+='<td  '+(data[i].packageCheckLists.length>0?"rowspan='"+ data[i].packageCheckLists.length +"'":'')+'>'+ showBidderRenameList(data[i].supplierId, data[i].supplierName, RenameData, 'body')+'</td>'
			for(var m=0;m<data[i].packageCheckLists.length;m++){
				if(m==0){
					if(data[i].packageCheckLists[m]){	
						meFlie+='<td>'+data[i].packageCheckLists[m].checkName+'</td>'
						 meFlie+='<td style="text-align:center">'+ data[i].packageCheckLists[m].offerFile.fileType +'</td>'
						 meFlie+='<td style="text-align:center">'+(data[i].packageCheckLists[m].offerFile.subDate||"") +'</td>'
						 //meFlie+='<td style="text-align:center">'+ (data[i].packageCheckLists[0].offerFile.editDate||"") +'</td>'
					}else{
						meFlie+='<td style="text-align:center">无</td>'
						meFlie+='<td style="text-align:center">无</td>'
						meFlie+='<td style="text-align:center">无</td>'
						//meFlie+='<td style="text-align:center">无</td>'
		//			    meFlie+='<td style="text-align:center">无</td>'
					}
					meFlie+='</tr>'
				}else{
					meFlie+='<tr>'
					meFlie+='<td style="text-align:left">'+data[i].packageCheckLists[m].checkName+'</td>'
					 meFlie+='<td style="text-align:center">'+ data[i].packageCheckLists[m].offerFile.fileType +'</td>'
					 meFlie+='<td style="text-align:center">'+ (data[i].packageCheckLists[m].offerFile.subDate||"") +'</td>'
					 //meFlie+='<td style="text-align:center">'+ (data[i].packageCheckLists[m].offerFile.editDate||"") +'</td>'
					meFlie+='</tr>'
				}
			
			}
		}
	  }else{
	  	meFlie+='<tr><td colspan="10" style="text-align:center">暂无数据</td></tr>'
	  }	
	  $("#BidSituationDetail").html(meFlie)
}

//文件递交历史记录
function setBidSituationRecordHTML(data) {
	var meFlie='<thead>'
       	+'<tr>'
       		+'<th style="width:50px">序号</th>'
       		+'<th>供应商名称</th>'
       		+'<th style="width:200px;">社会信用代码</th>'
       		+'<th>'+(examTypeList==0 ? "评审项名称":"报价文件名称")+'</th>'
       		+'<th style="width:80px;text-align:center">递交状态</th>'
       		+'<th style="width:150px;text-align:center">递交时间</th>'
			if($('#BidSituationRecord').hasClass('JD_view')){
				meFlie +='<th style="width:150px;text-align:center">递交IP地址</th>'
			}
       		
       		//+'<th style="width:150px;text-align:center">撤回时间</th>'
       		//+'<th style="width:150px;text-align:center">操作</th>'
       	+'</tr>'
      +'</thead>'
	if(data && data.length>0){
	  	for(var i=0;i<data.length;i++){
	  		var offer = data[i];
	  		var rows = 0;
	  		$.each(offer.packageCheckLists,function(i,v){
	  			if(v.offerFiles && v.offerFiles.length > 0){
	  				rows += v.offerFiles.length;
	  			}else{
	  				rows += 1;
	  			}
	  		})
	  		
			meFlie+='<tr>'
			meFlie+='<td style="text-align:center" '+(rows>1?"rowspan='"+ rows +"'":'')+'>'+(i+1)+'</td>'
			meFlie+='<td  '+(rows>1?"rowspan='"+ rows +"'":'')+'>'+ showBidderRenameList(offer.supplierId, offer.supplierName, RenameData, 'body')+'</td>'
			meFlie+='<td  '+(rows>1?"rowspan='"+ rows +"'":'')+'>'+ offer.enterpriseCode+'</td>'
			
			$.each(offer.packageCheckLists,function(i,v){
				meFlie+='<td '+ (v.offerFiles && v.offerFiles.length && ('rowspan='+v.offerFiles.length) || '') +'>'+v.checkName+'</td>'
				if(v.offerFiles && v.offerFiles.length > 0){
					$.each(v.offerFiles,function(j,f){
						!!j && (meFlie+='<tr>');
						meFlie+='<td style="text-align:center">'+ f.fileType +'</td>';
						meFlie+='<td style="text-align:center">'+( f.subDate||"") +'</td>';
						if($('#BidSituationRecord').hasClass('JD_view')){
							meFlie+='<td style="text-align:center">'+ (f.ip||'') +'</td>';
						}
						meFlie+='</tr>';
					});
				}else{
					meFlie+='<td style="text-align:center">无</td>';
					meFlie+='<td style="text-align:center">无</td>';
					if($('#BidSituationRecord').hasClass('JD_view')){
						meFlie+='<td style="text-align:center">无</td>';
					}
					meFlie+='</tr>';
				}
			});
		}
	  }else{
	  	meFlie+='<tr><td colspan="7" style="text-align:center">暂无数据</td></tr>'
	  }	
	  $("#BidSituationRecord").html(meFlie)
}
