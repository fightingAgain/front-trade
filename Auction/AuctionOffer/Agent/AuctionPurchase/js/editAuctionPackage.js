var packageId=$.getUrlParam('packageId');
var biddingTimes=$.getUrlParam('biddingTimes') || 1;
var supplierRound=$.getUrlParam('supplierRound') || 1;
var packageSetData=JSON.parse(sessionStorage.getItem("packageCheckInfo"));//包件参数信息
// var packageURL=config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do'//包件信息接口
// var findPurchaseUrl=config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var checkListData=[];
var isbidding=$.getUrlParam('isbidding')
$(function(){
	$.ajax({
		type: "post",
		url: config.AuctionHost+"/bidPriceController/getMaxBiddingTimes.do",
		async:false,
		data: {
			packageId:packageId
		},
		dataType: "json",
		success: function (response) {
			if(response.success){
				biddingTimes=response.data
			}
		}
	});
	setData();
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
		async:false,
		data: {
		'packageId':packageId,
		'biddingTimes':biddingTimes
		},
		success: function (res) {
			if(res.success && res.data){
				packageSetData=res.data;
				//明细详情
				if(packageSetData.details){
					checkListData=packageSetData.details
				};
				biddingType(packageSetData.biddingType);
				minData();
				for(key in packageSetData){
					
					if(key=="purchaserName"){
						$('input[name="'+ key +'"]').val(packageSetData[key]);
						$('#'+key).html(packageSetData[key])
					}else if(key=="agencyName"){
						$('input[name="'+ key +'"]').val(packageSetData[key]);
						$('#'+key).html(packageSetData[key]);
						$("#isAgencyNameCols").attr('colspan','1');
						$("#isAgencyName").show();
					}else
					// 竞价方式
					if(key=="biddingType"){
						$("input[name='biddingType'][value='"+packageSetData[key]+"']").prop('checked',true);
						if(packageSetData[key]==1){
							// 竞价类型 0为按包件，1为按明细 多轮竞价只能按包件
							if(packageSetData['biddingModel']==1){
								$(".isBiddingModel").hide();
								$(".isPriceCutRange").hide();
								$("input[name='setPrice']").prop('checked',false);
								$("#biddingStartPrice").val("");	
							}else{
								$(".isBiddingModel").show();
								
							}
						}
					}else
					//竞价时长
					if(key=="biddingDuration"){
						$("input[name='biddingDuration'][value='"+ packageSetData[key] +"']").prop('checked',true);
					}else
					//限时
					if(key=="timeLimit"){
						$("input[name='timeLimit']").val(packageSetData[key]);
					}else
					//竞价起始价；
					if(key=="setPrice"){
						$("input[name='setPrice'][value='"+ packageSetData[key] +"']").prop('checked',true);
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
								$("#biddingStartPrice").val(packageSetData['biddingStartPrice']);
								if($("input[name='biddingType']:checked").val()==0){
									$(".isPriceCutRange").show();
									$("#priceCutRange").val(packageSetData['priceCutRange']);
								}
							}
						}	
					}else if(key=="biddingModel"||key=="showLowestSupplierNum"||key=="showLowestSupplierPrice"||key=="showLowestSupplierPrice"||key=="outSupplier"||key=="showLowestSupplierName"||key=="outType"){
						$("input[name='"+ key +"'][value='"+ packageSetData[key] +"']").prop('checked',true);
					}else{
						$('input[name="'+ key +'"]').val(packageSetData[key]);
						$('#'+key).html(packageSetData[key])
					}
					
				
					// 如果为多轮报价
					if(packageSetData['biddingType']>1){
						// 多轮竞价时长(分) 以英文分号分隔 多轮必填
						if(key=="roundsBiddingDuration"){
							$('input[name="roundsBiddingDuration"]').val(packageSetData[key]);
							var roundsBiddingDurationLists=packageSetData[key].split(";")
							for(var i=0;i<roundsBiddingDurationLists.length;i++){
								$("input[name='roundsBiddingDuration"+ (i+1)+"'][value='"+roundsBiddingDurationLists[i]+"']").prop('checked',true);
							}
						}
						// 多轮结束间隔时长(分) 以英文分号分隔 多轮必填
						if(key=="roundsIntervalDuration"){
							$('input[name="roundsIntervalDuration"]').val(packageSetData[key]);
							var roundsIntervalDurationLists=packageSetData[key].split(";")
							for(var i=0;i<roundsIntervalDurationLists.length;i++){
								$("input[name='roundsIntervalDuration"+ (i+1)+"'][value='"+roundsIntervalDurationLists[i]+"']").prop('checked',true);
							}
						}
						//0为公告中设置，1为每轮间隔时间设置
						if(packageSetData['outType']==0){
							// 多轮淘汰供应商数 以英文分号分隔 多轮必填
							if(key=="roundsOutSupplierNum"){
								$('input[name="roundsOutSupplierNum"]').val(packageSetData[key]);
								var roundsOutSupplierNumLists=packageSetData[key].split(";")
								for(var i=0;i<roundsOutSupplierNumLists.length;i++){
									$("#roundsOutSupplierNum"+ (i+1)).val(roundsOutSupplierNumLists[i]);
								}
							}
							// 多轮最低保留供应商数 以英文分号分隔 多轮必填
							if(key=="roundsKeepSupplierNum"){
								$('input[name="roundsKeepSupplierNum"]').val(packageSetData[key]);
								var roundsKeepSupplierNummLists=packageSetData[key].split(";")
								for(var i=0;i<roundsKeepSupplierNummLists.length;i++){
									$("#roundsKeepSupplierNum"+ (i+1)).val(roundsKeepSupplierNummLists[i]);
								}
							}
						}else{
							$(".Supplier").hide();								
						}
						
					}
					
				}
				$('input[name="packageId"]').val(packageId)		
			}else{
				biddingType(0);
				minData();
			}
			if(packageSetData){
				$('#packageCode').html(packageSetData.packageNum || packageSetData.packageCode);
				$('input[name=packageCode]').val(packageSetData.packageNum || packageSetData.packageCode);
				$('#packageName').html(packageSetData.packageName);
				$('input[name=packageName]').val(packageSetData.packageName);
				$('#purchaserName').html(packageSetData.purchaserName);
				$('input[name=purchaserName]').val(packageSetData.purchaserName);
				$('#agencyName').html(packageSetData.agencyName);
				$('input[name=agencyName]').val(packageSetData.agencyName);
				if(packageSetData.agencyName){
					$("#isAgencyNameCols").attr('colspan','1');
					$("#isAgencyName").show();
				}	
			}
			$('input[name=packageId]').val(packageId);
		}
	});
}
$('input[name="biddingType"]').on('change',function(){
	biddingType($(this).val())
})
function biddingType(_t){
	var strHtml="";
	
		if(supplierRound!=1){
			strHtml+='<tr class="isBiddingModel">'
			+'<td style="width: 200px;" class="th_bg">是否设置竞价起始价 <i class="red">*</i></td>'
			+'<td style="text-align: left;width: 300px" class="isCols" colspan="3">'
				+'<input type="radio" name="setPrice" value="0" checked="checked"/>否'
				+'<input type="radio" name="setPrice" value="1" />是'
			+'</td>'
			strHtml+='<td style="width: 200px;display:none" class="th_bg isSetPrice">竞价起始价(元)<i class="red">*</i></td>'
			+'<td class="isSetPrice" style="display:none"><input type="text" data-title="竞价起始价" data-type="money" name="biddingStartPrice" id="biddingStartPrice" class="form-control verify"/></td>'
		}	
		strHtml+='</tr>'
	if(_t==0||_t==1){
		if(_t==0){
			strHtml+='<tr class="isPriceCutRange" style="display:none">'
					+'<td style="width: 200px;" class="th_bg">降价幅度（元） <i class="red">*</i></td>'		
					+'<td class="isSetPrice" colspan="3"><input type="text" name="priceCutRange" data-title="降价幅度" data-type="money" id="priceCutRange" class="form-control verify"/></td>'
				+'</tr>'
		}
		if(!isbidding){
			strHtml+='<tr>'
			+'<td style="width: 200px;" class="th_bg">竞价类型<i class="red">*</i></td>'
			+'<td  style="text-align: left;">'
				+'<input type="radio" name="biddingModel" value="0" checked="checked"/>按包件'
				+'<input type="radio" name="biddingModel" value="1"/>按明细'	
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">竞价时长（分）<i class="red">*</i></td>'
			+'<td  class="isPriceL" style="text-align: left;">'
				+'<input type="radio" name="biddingDuration" value="10" checked="checked" />10'
				+'<input type="radio" name="biddingDuration" value="15" />15'
				+'<input type="radio" name="biddingDuration" value="30" />30'
				+'<input type="radio" name="biddingDuration" value="60" />60'
			+'</td>'
		+'</tr>'
		}else{
			strHtml+='<tr>'
			+'<td style="width: 200px;" class="th_bg">竞价时长（分）<i class="red">*</i></td>'
			+'<td  class="isPriceL" style="text-align: left;" colspan="3">'
				+'<input type="radio" name="biddingDuration" value="10" checked="checked" />10'
				+'<input type="radio" name="biddingDuration" value="15" />15'
				+'<input type="radio" name="biddingDuration" value="30" />30'
				+'<input type="radio" name="biddingDuration" value="60" />60'
				+'<input type="hidden" name="biddingModel" value="0" checked="checked"/>'
			+'</td>'
		+'</tr>'
		}
		
			if(_t==0){
				strHtml+='<tr id="timeLimits">'
					+'<td style="width: 200px;" class="th_bg">限时（分）<i class="red">*</i></td>'
					+'<td  style="text-align: left;" class="searched">'			
						+'<div class="btn-group" role="group">'
							+'<button type="button" class="btn btn-default" id="reduceNum" style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>'
							+'<input type="text" class="btn btn-default" name="timeLimit" id="timeLimit" value="5"  style="width: 60px;">'				  
							+'<button type="button" class="btn btn-default" id="addNum" style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>'
						+'</div>'	
					+'</td>'
					+'<td colspan="2" class="red" style="text-align: left;font-size: 12px;">'
						+'竞价时长结束后的限时时间。在此期间内若有报价，则从头开始限时。若无则限时结束竞价结束'
					+'</td>'
				+'</tr>'
			}			
	}else{
		strHtml+='<tr>'			
			+'<td style="width: 200px;" class="th_bg">设置淘汰方式<i class="red">*</i></td>'
			+'<td style="text-align: left;">'
				+'<input type="radio" name="outType" value="0" checked="checked"/>公告中设置'
				+'<input type="radio" name="outType" value="1" />每轮间隔时间设置'
				+'<input type="hidden" name="biddingModel" value="0"/>'
				+'<input type="hidden" name="roundsBiddingDuration"/>'
				+'<input type="hidden" name="roundsOutSupplierNum"/>'
				+'<input type="hidden" name="roundsKeepSupplierNum"/>'
				+'<input type="hidden" name="roundsIntervalDuration"/>'	
			+'</td>'		
		+'</tr>'
		+'<tr>'
			+'<td style="width: 200px;" class="th_bg">第1轮竞价时长(分) <i class="red">*</i></td>'
			+'<td style="text-align: left;">'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration1" value="10" checked="checked" />10'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration1" value="15" />15'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration1" value="30" />30'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration1" value="60" />60'
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">第1、2轮间隔时间（分）<i class="red">*</i></td>'
			+'<td  style="text-align: left;">'
				+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration1"  value="5" checked="checked" />5'
				+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration1"  value="10" />10'
				+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration1"  value="15" />15'		
			+'</td>'		
		+'</tr>'
		+'<tr class="Supplier">'
			+'<td style="width: 200px;" class="th_bg">第1轮淘汰供应商数<i class="red">*</i></td>'
			+'<td style="text-align: left;">'
				+'<input type="text"  id="roundsOutSupplierNum1" data-title="第1轮淘汰供应商数" data-type="integer" class="form-control verify roundsOutSupplierNum"/>'
			+'</td>'
			+'<td style="width: 200px;" class="th_bg">第1轮最低保留供应商数<i class="red">*</i></td>'
			+'<td style="text-align: left;">'
				+'<input type="text"  id="roundsKeepSupplierNum1" data-title="第1轮最低保留供应商数" data-type="integer" class="form-control verify roundsKeepSupplierNum"/>'
			+'</td>'
		+'</tr>'
		+'<tr>'
			+'<td style="width: 200px;" class="th_bg">第2轮竞价时长(分)<i class="red">*</i> </td>'
			+'<td colspan="'+ (_t==3?'1':'3')+'" style="text-align: left;">'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration2" value="10" checked="checked" />10'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration2" value="15" />15'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration2" value="30" />30'
				+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration2" value="60" />60'
			+'</td>'
			if(_t==3){
				strHtml+='<td style="width: 200px;" class="th_bg">第2、3轮间隔时间（分）<i class="red">*</i></td>'
						+'<td  style="text-align: left;">'
						+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration2" value="5" checked="checked" />5'
						+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration2"  value="10" />10'
						+'<input type="radio" class="roundsIntervalDuration" name="roundsIntervalDuration2" value="15" />15'		
						+'</td>'
			}		
			strHtml+='</tr>'
		if(_t==3){
			strHtml+='<tr class="Supplier">'
				+'<td style="width: 200px;" class="th_bg">第2轮淘汰供应商数<i class="red">*</i></td>'
				+'<td  style="text-align: left;">'
					+'<input type="text" id="roundsOutSupplierNum2" data-title="第2轮淘汰供应商数" data-type="integer"  class="form-control verify roundsOutSupplierNum"/>'
				+'</td>'
				+'<td style="width: 200px;" class="th_bg">第2轮最低保留供应商数 <i class="red">*</i></td>'
				+'<td style="text-align: left;">'
					+'<input type="text" id="roundsKeepSupplierNum2" data-title="第2轮最低保留供应商数" data-type="integer" class="form-control verify roundsKeepSupplierNum"/>'
				+'</td>'
			+'</tr>'
			+'<tr>'
				+'<td style="width: 200px;" class="th_bg">第3轮竞价时长(分) <i class="red">*</i></td>'
				+'<td colspan="3" style="text-align: left;">'
					+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration3" value="10" checked="checked" />10'
					+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration3" value="15" />15'
					+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration3" value="30" />30'
					+'<input type="radio" class="roundsBiddingDuration" name="roundsBiddingDuration3" value="60" />60'
				+'</td>'		
			+'</tr>'	
		}
		strHtml+='<tr>'
			+'<td style="width: 200px;" rowspan="2" class="th_bg">'
				+'每轮淘汰供应商数设置'
			+'</td>'
			+'<td colspan="3" style="text-align: left;">'
				+'<input type="radio" name="outSupplier" value="0" checked="checked" />按实际报价供应商数淘汰'
				+'<input type="radio" name="outSupplier" value="1" />按参与供应商数淘汰'
			+'</td>'
		+'</tr>'
		+'<tr>'
			+'<td colspan="4" class="red" style="text-align: left;">'
				+'<p><strong>按实际报价供应商数淘汰</strong>是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；</p>'
				+'<p><strong>按参与供应商数淘汰</strong>是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。</p>'                    
			+'</td>'
		+'</tr>'	
	}
	if(!isbidding){
	strHtml+='<tr>'			
			+'<td style="width: 200px;" class="th_bg">竞价开始时间</td>'
			+'<td style="text-align: left;" colspan="3">'
				+'<input type="text" class="btn btn-default" id="biddingStartTime" name="biddingStartTime" style="width: 200px;" >'	
					
			+'</td>'
		+'</tr>'
	}
	strHtml+='<input type="hidden" class="showLowestSupplierPrice" name="showLowestSupplierPrice" value="1"  checked="checked"/>'
	+'<input type="hidden" class="showLowestSupplierNum" name="showLowestSupplierNum" value="0" checked="checked" />'
	+'<input type="hidden" class="showLowestSupplierName" name="showLowestSupplierName" value="0" checked="checked" />'	
	$("#biddingTable").html(strHtml);
	//设置竞价起始价 0为否，1为是 默认0
	$("input[name='setPrice']").on('change',function(){
		if(supplierRound!=1){
			if($(this).val()==0){
				//竞价起始价
				$(".isSetPrice").hide();
				$(".isCols").attr('colspan','3');
				$("#biddingStartPrice").val("");
				//降价幅度
				$(".isPriceCutRange").hide();
				$("#priceCutRange").val("");
			}else{
				//竞价起始价
				$(".isSetPrice").show();
				$(".isCols").attr('colspan','1');
				if($("input[name='biddingType']:checked").val()==0){
					$(".isPriceCutRange").show();
				}
			}
		}
		
	});
	// 竞价类型 0为按包件，1为按明细 多轮竞价只能按包件
	$("input[name='outType']").on('change',function(){
		if($(this).val()==1){
			$(".Supplier").hide();
			$(".roundsOutSupplierNum").val("");
			$(".roundsKeepSupplierNum").val("");
			$("input[name='roundsOutSupplierNum']").val("");
			$("input[name='roundsKeepSupplierNum']").val("");
		}else{
			$(".Supplier").show();
			
		}
	})
	if($("input[name='biddingType']:checked").val()==1){
		// 竞价类型 0为按包件，1为按明细 多轮竞价只能按包件
		$("input[name='biddingModel']").on('change',function(){
			if($(this).val()==1){
				$(".isBiddingModel").hide();
				$(".isPriceCutRange").hide();
				$("input[name='setPrice']").prop('checked',false);
				$("#biddingStartPrice").val("");	
			}else{
				$(".isBiddingModel").show();
				$("input[name='setPrice'][value='0']").prop('checked',true);
			}
		})
	}
	//限时
	$('#reduceNum').on('click',function(){
		var obj = $("#timeLimit");
			if (obj.val() <= 1) {
					obj.val(1);
			} else {
					obj.val(parseInt(obj.val()) - 1);
			}
		obj.change();
	})
	$('#addNum').on('click',function(){
		var obj = $("#timeLimit");
			obj.val(parseInt(obj.val()) + 1);
			obj.change();
	})
	/*=============验证=============== */
	$(".verify").on('change',function(){
		var dataType = {
			"*": /\S/,  //不能为空			
			"money":/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,			
			"integer" :/^[1-9][0-9]*$/,    //正整数		
		};
		var dataMsg = {
			"*": "信息不能为空",			
			"money": "金额必须大于零且最多两位小数",
			"integer":'格式错误，请输入正整数'
			
		};
		var type=$(this).data('type');
		var title=$(this).data('title');
		if($(this).val()!=""){
			if(!(dataType[type].test($(this).val()))){
				parent.layer.alert('温馨提示：'+title+dataMsg[type])
				$(this).val("")
			}
		}	
	})
	//竞价开始时间
    $('#biddingStartTime').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			$('#biddingStartTime').datetimepicker({						
				minDate:NewDateT(nowSysDate)
			})
		},		
	});
	/*=============验证END=============== */
}

//提交
$("#btn_bao").on('click',function(){
	if($("input[name='biddingType']:checked").val()>1){
		// 多轮竞价时长(分) 以英文分号分隔 多轮必填
		var roundsBiddingDurationList=[]
		$('.roundsBiddingDuration:checked').each(function(){
			roundsBiddingDurationList.push($(this).val())
		})
		$("input[name='roundsBiddingDuration']").val(roundsBiddingDurationList.join(';'))
		// 每轮间隔时间
		var roundsIntervalDurationList=[]
		$('.roundsIntervalDuration:checked').each(function(){
			roundsIntervalDurationList.push($(this).val())
		})
		$("input[name='roundsIntervalDuration']").val(roundsIntervalDurationList.join(';'))
		if($("input[name='outType']:checked").val()==0){
			// 多轮淘汰供应商数 以英文分号分隔 多轮必填
			var roundsOutSupplierNumList=[]
			$('.roundsOutSupplierNum').each(function(){
				roundsOutSupplierNumList.push($(this).val())
			})
			$("input[name='roundsOutSupplierNum']").val(roundsOutSupplierNumList.join(';'));
			// 多轮最低保留供应商数 以英文分号分隔 多轮必填
			var roundsKeepSupplierNumList=[]
			$('.roundsKeepSupplierNum').each(function(){
				roundsKeepSupplierNumList.push($(this).val())
			})
			$("input[name='roundsKeepSupplierNum']").val(roundsKeepSupplierNumList.join(';'))
		}	
	}
	if(checkListData.length==0){
		parent.layer.alert("温馨提示：请添加设备信息");
		return;
	}
	var pare=top.serializeArrayToJson($('#packageForm').serializeArray());
	pare.supplierRound=supplierRound;
	pare.details=checkListData;
	pare.biddingTimes=biddingTimes;
	$.ajax({
		type: "post",
		url: config.offerhost+"/info/build",
		contentType:'application/json',
		data: JSON.stringify(pare),
		async:false,
		dataType: "json",
		success: function (response) {
			if(response.success){
				parent.layer.alert("保存成功")
			}else{
				parent.layer.alert(response.message)
			}
		}
	});
})
//添加设备
function add_min(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加设备信息'
        ,area: ['600px', '600px']
        ,content:'Auction/AuctionOffer/Agent/AuctionPurchase/checkListItem.html'
        ,btn: ['确定','取消'] 
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        }
        //确定按钮
        ,yes: function(index,layero){  
			var iframeWinds=layero.find('iframe')[0].contentWindow;
        	if(iframeWinds.$('#name').val()==""){ 
					parent.layer.alert("设备名称不能为空"); 
					return;
			};
			if(iframeWinds.$('#version').val()==""){ 
					parent.layer.alert("型号规格不能为空"); 
					return;
			};
			if(iframeWinds.$('#count').val()==""){ 
					parent.layer.alert("数量不能为空"); 
					return;
			};
            if(!(/^[0-9]*$/.test(iframeWinds.$("#count").val()))){ 
					parent.layer.alert("数量只能是正整数"); 
					return;
			};
			if(iframeWinds.$('#unit').val()==""){ 
					parent.layer.alert("单位不能为空"); 
					return;
			};
			if(iframeWinds.$("#budget").val()!=""&&!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
					parent.layer.alert("采购预算必须大于零且最多两位小数"); 
					return;
			};
			if(iframeWinds.$("#budget").val()!=""&&iframeWinds.$('#budget').val().length>10){ 
					parent.layer.alert("采购预算过长"); 
					return;
			};
			var saveData={};
			for(var key in iframeWinds.save()){
				saveData[key]=iframeWinds.save()[key]
			}
			checkListData.push(saveData) 			
			$('#tbodym').bootstrapTable("load", checkListData);
		    parent.layer.close(index)
        },
        btn2:function(){       	
        },       
      }); 	
}
//删除设备信息
function itemdelte(sindex){
	parent.layer.confirm('确定要删除该设备信息', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		checkListData.splice(sindex,1);
		$('#tbodym').bootstrapTable("load", checkListData);  
	  	parent.layer.close(index);
	}, function(index){
	   parent.layer.close(index)
	});	
    
}
//编辑设备信息
function detailEdit($index){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '编辑明细信息'
        ,area: ['600px', '600px']
        ,content:'Auction/AuctionOffer/Agent/AuctionPurchase/checkListItem.html'
        ,btn: ['确定','取消']
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(checkListData[$index])
        	
        }
        //确定按钮
        ,yes: function(index,layero){
        	var iframeWinds=layero.find('iframe')[0].contentWindow;
			if(iframeWinds.$('#name').val()==""){ 
				parent.layer.alert("设备名称不能为空"); 
				return;
			};
			if(iframeWinds.$('#version').val()==""){ 
				parent.layer.alert("型号规格不能为空"); 
				return;
			};
			if(iframeWinds.$('#count').val()==""){ 
				parent.layer.alert("数量不能为空"); 
				return;
			};
			if(!(/^[0-9]*$/.test(iframeWinds.$("#count").val()))){ 
				parent.layer.alert("数量只能是正整数"); 
				return;
			};
			if(iframeWinds.$('#unit').val()==""){ 
				parent.layer.alert("单位不能为空"); 
				return;
			};
			if(iframeWinds.$("#budget").val()!=""&&!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(iframeWinds.$("#budget").val()))){ 
				parent.layer.alert("采购预算必须大于零且最多两位小数"); 
				return;
			};
			if(iframeWinds.$("#budget").val()!=""&&iframeWinds.$('#budget').val().length>10){ 
					parent.layer.alert("采购预算过长"); 
					return;
			};  
			var saveData={};
			for(var key in iframeWinds.save()){
				saveData[key]=iframeWinds.save()[key]
			}
			checkListData[$index]=saveData;		
			$('#tbodym').bootstrapTable("load", checkListData);                 
			parent.layer.close(index); 		        
        },
        btn2:function(){       	
        },       
      }); 
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
			{
				field: "#",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				formatter:function(value, row, index){	
				var mixtbody=""
                mixtbody='<div class="btn-group">'
	                 +'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=detailEdit(\"'+index+'\")>编辑</a>'
	                 +'<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none"  onclick=itemdelte(\"'+index+'\")>删除</a></div>'
				return mixtbody
				}
				 
			}
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