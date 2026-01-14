
var packageId=getUrlParam('packageId');
var biddingTimes=getUrlParam('biddingTimes') || 1;
var supplierRound=getUrlParam('supplierRound') || 1;
var packageSetData=JSON.parse(sessionStorage.getItem("packageCheckInfo"));//包件参数信息
// var packageURL=config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do'//包件信息接口
// var findPurchaseUrl=config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var checkListData=[];
var isbidding=getUrlParam('isbidding')
$(function(){
	if (packageId) {
		setData();
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 	
    });
})
function setData(){
	$.ajax({
		type: "post",
		url: config.offerhost+"/info",
		data: {
		'packageId':packageId,
		'biddingTimes':biddingTimes
		},
		success: function (res) {
			if(res.success && res.data){
				formatViewData(res.data);
			}else{
				biddingType(0);
				minData();
			}
			if(packageSetData){
				$('#packageCode').html(packageSetData.packageNum || packageSetData.packageCode);			
				$('#packageName').html(packageSetData.packageName);				
				$('#purchaserName').html(packageSetData.purchaserName);				
				$('#agencyName').html(packageSetData.agencyName);			
			}
			$('input[name=packageId]').val(packageId);
		}
	});
}

function formatViewData(data) {
	packageSetData=data;
	//明细详情
	if(packageSetData.details){
		checkListData=packageSetData.details
	}
	biddingType(packageSetData.biddingType);
	minData();
	for(key in packageSetData){					
		if(key=="purchaserName"){						
			$('#'+key).html(packageSetData[key])
		}else if(key=="agencyName"){
			$('#'+key).html(packageSetData[key])
			$("#isAgencyNameCols").attr('colspan','1');
			$("#isAgencyName").show();
		}else
		// 竞价方式
		if(key=="biddingType"){
			
			if(packageSetData[key]==0){
				$("#biddingType").html('自由竞价')
			}
			if(packageSetData[key]==1){
				$("#biddingType").html('单轮竞价')
			}
			if(packageSetData[key]==2){
				$("#biddingType").html('多轮-两轮竞价')
			}
			if(packageSetData[key]==3){
				$("#biddingType").html('多轮-三轮竞价')
			}						
			if(packageSetData[key]==1){
				// 竞价类型 0为按包件，1为按明细 多轮竞价只能按包件
				if(packageSetData['biddingModel']==1){
					$(".isBiddingModel").hide();
					$(".isPriceCutRange").hide();							
					
				}else{
					$(".isBiddingModel").show();
					
				}
			}
		}else
		//竞价起始价；
		if(key=="setPrice"){
			$("#setPrice").html(packageSetData[key])
			if(supplierRound!=1){
				if(packageSetData[key]==0){//不需要竞价起始价
					//竞价起始价
					$(".isSetPrice").hide();
					$(".isCols").attr('colspan','3');								
					//降价幅度
					$(".isPriceCutRange").hide();								
				}else{
					//竞价起始价
					$(".isSetPrice").show();
					$(".isCols").attr('colspan','1');
					$("#biddingStartPrice").html(packageSetData['biddingStartPrice']);
					if($packageSetData['biddingType']==0){
						$(".isPriceCutRange").show();
						$("#priceCutRange").html(packageSetData['priceCutRange']);
					}
				}
			}	
		}else if(key=="biddingModel"||key=="outSupplier"){
			if(packageSetData['biddingModel']==0){
				$("#biddingModel").html('按包件')
			}else{
				$("#biddingModel").html('按明细')
			}
			if(packageSetData['outSupplier']==0){
				$("#outSupplier").html('按实际报价供应商数淘汰')
			}else{
				$("#outSupplier").html('按参与供应商数淘汰')
			}					
		}else{						
			$('#'+key).html(packageSetData[key])
		}
		// 如果为多轮报价
		if(packageSetData['biddingType']>1){
			// 多轮竞价时长(分) 以英文分号分隔 多轮必填
			if(key=="roundsBiddingDuration"){
				$('input[name="roundsBiddingDuration"]').val(packageSetData[key]);
				var roundsBiddingDurationLists=packageSetData[key].split(";")
				for(var i=0;i<roundsBiddingDurationLists.length;i++){
					$("#roundsBiddingDuration"+ (i+1)).html(roundsBiddingDurationLists[i]);								
				}
			}
			// 多轮结束间隔时长(分) 以英文分号分隔 多轮必填
			if(key=="roundsIntervalDuration"){
				$('input[name="roundsIntervalDuration"]').val(packageSetData[key]);
				var roundsIntervalDurationLists=packageSetData[key].split(";")
				for(var i=0;i<roundsIntervalDurationLists.length;i++){
					$("#roundsIntervalDuration"+ (i+1)).html(roundsIntervalDurationLists[i]);
					
				}
			}
			//0为公告中设置，1为每轮间隔时间设置
			if(packageSetData['outType']==0){
				$('#outType').html('公告中设置')
				// 多轮淘汰供应商数 以英文分号分隔 多轮必填
				if(key=="roundsOutSupplierNum"){
					
					var roundsOutSupplierNumLists=packageSetData[key].split(";")
					for(var i=0;i<roundsOutSupplierNumLists.length;i++){
						$("#roundsOutSupplierNum"+ (i+1)).html(roundsOutSupplierNumLists[i]);
					}
				}
				// 多轮最低保留供应商数 以英文分号分隔 多轮必填
				if(key=="roundsKeepSupplierNum"){								
					var roundsKeepSupplierNummLists=packageSetData[key].split(";")
					for(var j=0;j<roundsKeepSupplierNummLists.length;j++){
						$("#roundsKeepSupplierNum"+ (j+1)).html(roundsKeepSupplierNummLists[j]);
					}
				}
			}else{
				$(".Supplier").hide();	
				$('#outType').html('每轮间隔时间设置')
											
			}
			
		}
		
	}
}

function passMessage(data) {
	formatViewData(data);
}

function biddingType(_t){
	var strHtml="";
		if(supplierRound!=1){
			strHtml+='<tr class="isBiddingModel">'
			+'<td style="width: 200px;" class="th_bg">是否设置竞价起始价 </td>'
			+'<td style="text-align: left;width: 300px" class="isCols" colspan="3">'
				+'<input type="radio" name="setPrice" value="0" checked="checked"/>否'
				+'<input type="radio" name="setPrice" value="1" />是'
			+'</td>'
			strHtml+='<td style="width: 200px;display:none" class="th_bg isSetPrice">竞价起始价(元)</td>'
			+'<td class="isSetPrice" style="display:none"><input type="text" data-title="竞价起始价" data-type="money" name="biddingStartPrice" id="biddingStartPrice" class="form-control verify"/></td>'
		}	
		strHtml+='</tr>'
	if(_t==0||_t==1){
		if(_t==0){
			strHtml+='<tr class="isPriceCutRange" style="display:none">'
					+'<td style="width: 200px;" class="th_bg">降价幅度（元） </td>'		
					+'<td class="isSetPrice" colspan="3"><input type="text" name="priceCutRange" data-title="降价幅度" data-type="money" id="priceCutRange" class="form-control verify"/></td>'
				+'</tr>'
		}
		if(!isbidding){
			strHtml+='<tr>'
			+'<td style="width: 200px;" class="th_bg">竞价类型</td>'
			+'<td  style="text-align: left;">'
				+'<div id="biddingModel"></div>'			
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">竞价时长（分）</td>'
			+'<td  class="isPriceL" style="text-align: left;">'
				+'<div id="biddingDuration"></div>'
			+'</td>'
		+'</tr>'
			if(_t==0){
				strHtml+='<tr id="timeLimits">'
					+'<td style="width: 200px;" class="th_bg">限时（分）</td>'
					+'<td  style="text-align: left;"  coslpan="3">'			
					+'<div id="timeLimit"></div>'	
					+'</td>'				
				+'</tr>'
			}	
		}else{
			strHtml+='<tr>'
			+'<td style="width: 200px;" class="th_bg">竞价时长（分）</td>'
			+'<td  class="isPriceL" style="text-align: left;">'
				+'<div id="biddingDuration"></div>'
			+'</td>'
			if(_t==0){
				strHtml+='<tr id="timeLimits">'
					+'<td style="width: 200px;" class="th_bg">限时（分）</td>'
					+'<td  style="text-align: left;"  coslpan="3">'			
					+'<div id="timeLimit"></div>'	
					+'</td>'				
				+'</tr>'
			}	
			strHtml+='</tr>'
		}				
	}else{
		strHtml+='<tr>'			
			+'<td style="width: 200px;" class="th_bg">设置淘汰方式</td>'
			+'<td style="text-align: left;" colspan="3">'
			+'<div id="outType"></div>'			
			+'</td>'		
		+'</tr>'
		+'<tr>'
			+'<td style="width: 200px;" class="th_bg">第1轮竞价时长(分) </td>'
			+'<td style="text-align: left;">'
				+'<div id="roundsBiddingDuration1"></div>'
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">第1、2轮间隔时间（分）</td>'
			+'<td  style="text-align: left;">'
				+'<div id="roundsIntervalDuration1"></div>'	
			+'</td>'		
		+'</tr>'
		+'<tr class="Supplier">'
			+'<td style="width: 200px;" class="th_bg">第1轮淘汰供应商数</td>'
			+'<td style="text-align: left;">'
				+'<div id="roundsOutSupplierNum1"></div>'
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">第1轮最低保留供应商数</td>'
			+'<td style="text-align: left;">'
				+'<div id="roundsKeepSupplierNum1"></div>'
			+'</td>'
		+'</tr>'
		+'<tr>'
			+'<td style="width: 200px;" class="th_bg">第2轮竞价时长(分) </td>'
			+'<td  colspan="'+ (_t==3?'1':'3')+'" style="text-align: left;">'
				+'<div id="roundsBiddingDuration2"></div>'
			+'</td>'
			if(_t==3){
				strHtml+='<td style="width: 200px;" class="th_bg">第2、3轮间隔时间（分）</td>'
						+'<td>'
						+'<div id="roundsIntervalDuration2"></div>'	
						+'</td>'
			}		
			strHtml+='</tr>'
		if(_t==3){
			strHtml+='<tr class="Supplier">'
				+'<td style="width: 200px;" class="th_bg">第2轮淘汰供应商数</td>'
				+'<td  style="text-align: left;">'
					+'<div id="roundsOutSupplierNum2"></div>'
				+'</td>'
				+'<td style="width: 200px;" class="th_bg">第2轮最低保留供应商数</td>'
				+'<td style="text-align: left;">'
					+'<div id="roundsKeepSupplierNum2"></div>'
				+'</td>'
			+'</tr>'
			+'<tr>'
				+'<td style="width: 200px;" class="th_bg">第3轮竞价时长(分) </td>'
				+'<td colspan="3" style="text-align: left;">'
					+'<div id="roundsBiddingDuration3"></div>'
				+'</td>'		
			+'</tr>'	
		}
		strHtml+='<tr>'
			+'<td style="width: 200px;" rowspan="2" class="th_bg">'
				+'每轮淘汰供应商数设置'
			+'</td>'
			+'<td colspan="3" style="text-align: left;">'
				+'<div id="outSupplier"></div>'	
			+'</td>'
		+'</tr>'
		+'<tr>'
			+'<td colspan="4" class="red" style="text-align: left;">'
				if(packageSetData.outSupplier==0){
					strHtml+='<p><strong>按实际报价供应商数淘汰</strong>是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；</p>'
				}else{
					strHtml+='<p><strong>按参与供应商数淘汰</strong>是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。</p>'
				}                  
			strHtml+='</td>'
		+'</tr>'
			
	}
	$("#biddingTable").html(strHtml);
}
function minData(){
	if(checkListData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#tbodym').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "name",
				title: "材料设备名称",
				align: "left",
				halign: "left",

			},
			{
				field: "brand",
				title: "品牌要求",
				align: "center",
				halign: "center",
				width:'100px',

			},
			{
				field: "version",
				title: "型号规格",
				halign:"center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "count",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "unit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},
			{
				field: "budget",
				title: "采购预算（元）",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				if(value==undefined){
					var budget="暂无预算"
				}else{
					var budget=value;
				};
				return budget
				}
			},
			{
				field: "content",
				title: "备注",
				halign: "left",
				align: "left",
			},			
		]
	});
	$('#tbodym').bootstrapTable("load", checkListData);
}
function NewDateT(str){  
	if(!str){  
	  return 0;  
	}  
	arr=str.split(" ");  
	d=arr[0].split("-");  
	t=arr[1].split(":");
	var date = new Date(); 
   
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	date.setUTCHours(t[0]-8, t[1], t[2], 0);
	return date;  
}