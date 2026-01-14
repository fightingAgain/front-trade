/*
 * @Author: your name
 * @Date: 2020-09-11 15:40:11

 * @LastEditTime: 2021-01-22 15:31:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\packageCheckList.js
 */ 
//刷新竞价起始价--参与竞价供应商最低价
var backState;
var cstartPrice
$(function(){
	insetItmeTab();
})
function reloadStartPrice() {
	cstartPrice=null;
	$('#supplierJoinInfo input[type=checkbox]:checked').each(function (i, v) {
		let price =parseFloat($(this).data('price')) ;
		if (!cstartPrice || price < parseFloat(cstartPrice)) {
			cstartPrice = price;
		}
	});
	$('#startPrice').val(cstartPrice);
}
function startPriceChange(){
	let realStartPrice = $('#startPrice').val();
	if(parseFloat(cstartPrice) != parseFloat(realStartPrice)){
		$('.priceChangeReason').show();
	}else{
		$('.priceChangeReason').hide();
	}
}
//启动竞价
function startBidPrice(_this) {
	if(!$('#startPrice').val() || isNaN($('#startPrice').val())){
		return top.layer.alert("温馨提示：竞价起始价格式错误");
	}
	if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($('#startPrice').val()))||parseFloat($('#startPrice').val())==0){ 
		parent.layer.alert("竞价起始价格必须大于零且最多两位小数"); 
		$(this).val("");
		return
	};
	let realStartPrice = $('#startPrice').val();
	if(!cstartPrice){
		$('#supplierJoinInfo input[type=checkbox]:checked').each(function (i, v) {
			let price = parseFloat( $(this).data('price'));
			if (!cstartPrice || price < parseFloat(cstartPrice)) {
				cstartPrice = price;
			}
		});
	}
	if(parseFloat(cstartPrice) != parseFloat(realStartPrice) && $.trim($('#startPriceChangeReason').val())==""){
		return top.layer.alert("温馨提示：竞价起始价修改原因不能为空");
	}
	let params = {
		packageId: packageId,
		startPrice: cstartPrice || realStartPrice,
		realStartPrice: realStartPrice,
		startPriceChangeReason: $('#startPriceChangeReason').val(),
		bidpriceStartTime: $('#bidpriceStartTime').val()
	}
	let notReason = false;
	let isChecked=new Array();
	$('#supplierJoinInfo input[type=checkbox]').each(function(i,_this){
		
		let reason =$.trim($(this).parent().parent().find('.reason').val()) ;
		if(!_this.checked && reason==""){
			notReason = true;
			return false;
		}
		if(_this.checked){
			isChecked.push(i)
		}
		params['bidPriceResultList[' + i + '].supplierId'] = $(this).data('supplier');
		params['bidPriceResultList[' + i + '].joinBidprice'] = _this.checked? 1 : 0;
		!_this.checked && (params['bidPriceResultList[' + i + '].notJoinReason'] = reason);
	});
	if(notReason){
		return top.layer.alert("温馨提示：供应商不参与竞价原因不能为空");
	}
	if(isChecked.length==0){
		return top.layer.alert("温馨提示：至少选择一家供应商参与竞价");
	}
	var title=$(_this).data('name')
	top.layer.confirm("温馨提示：是否确定"+ title +"？", function (indexs) {
		$.ajax({
			type:'post',
			url:url+'/bidPriceController/startBidPrice.do',
			data: params,
			success: function (res) {
				if(res.success){
					$('#'+_thisId).click();	
					top.layer.alert('启动竞价成功');
					top.layer.close(indexs)
				}else{
					top.layer.alert(res.message);
				}
				
			}
		})
	});
	
}
function submitResult() { 

	if(backState==1){
		var title="温馨提示：评审竞价已退回，是否确定提交竞价结果"
	}else{
		var title="温馨提示：是否确定提交竞价结果"
	}
	top.layer.confirm(title, function (indexs) {
		$.ajax({
			type: "post",
			url: url+"/bidPriceController/submitResult.do",
			data: {
				'packageId':packageId
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					parent.layer.alert('提交成功');
					$('#'+_thisId).click();	
					$("#submitResult").hide();
					$("#startBidPrice").hide();
				}
			}
		});
	});
	
 }
//加载二级选项卡tab
var packageCheckItems;
var suppliers;
var checkItemInfos=new Array();
var offerFileData;
var nowpackageCheckList
var offerauctionData;
var isShowCheckResult;
var experts=new Array();
var _supplierId="";
var _enterpriseName="";
var backState
function insetItmeTab() {
	//参数
    var packageCheckList=new Object();
    var para = {
		projectId: projectId,
		packageId: packageId,		
		examType:examType,
	};
	//非第一个评审项时寻找上一个评审项id
	for (var i = 0; i < progressList.packageCheckLists.length; i++) {
		if (_thisId == progressList.packageCheckLists[i].id) {
			if (i != 0) {
				para.prePackageCheckListId = progressList.packageCheckLists[i - 1].id;
			} else {
				para.prePackageCheckListId = '';

            }
			packageCheckList=progressList.packageCheckLists[i]
			nowpackageCheckList=packageCheckList;
		}
    }
    para.packageCheckListId= packageCheckList.id
	$.ajax({
		type: "post",
		url: url + "/ManagerCheckController/getSupplierForManager.do",
		data: para,
		async: false,
		success: function (data) {
			if (data.success) {
				_THISID=_thisId;
				var data = data.data;
				offerauctionData= data.data;
				isShowCheckResult=data.isShowCheckResult;
				if(data.bidPrice){
					backState=data.bidPrice.backState
				}
				experts=data.experts;
				if(data.bidPrice){
					backState=data.bidPrice.backState
				}
				cstartPrice=data.startPrice;
				if (data.checkType == 4) {
					let body = $("#packageCheckLists").empty();
					body.append(['<div class="panel panel-info">',
						'<div class="panel-heading">',
						'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
						'竞价设置',
						'</h3>',
						'</div>',
						'<div class="panel-body bidSet">',
						'<div><label style="padding:10px;width:180px;text-align:right;">是否重新计算排名：</label>',
						'<label style="padding:10px">' + (!data.priceCheckMode ? '是' : '否') + '</label></div>',
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价起始价计算方式：</label>',
						'<label style="padding:10px">' + ['参与竞价供应商最低报价', '未淘汰供应商最低报价', '参与报价供应商最低报价'][data.bidStartPriceFrom] + '</label></div>',
						/*
							时间：2020-11-17
							修改人：金贝贝
							功能：退回后显示上一轮的竞价起始价
						*/
						function () {
							if(backState==1){
								return [
									'<div><label style="padding:10px;width:180px;text-align:right;">上一次竞价起始价：</label>',
									data.beforeStartPrice+'元',
									'<div>',
								].join('')
							}
						}(), 
						/*===== END ===== */
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价起始价：</label>',
						(!data.bidPrice||(data.bidPrice&&data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited)?'<input type="text" class="btn btn-default" id="startPrice" onchange="startPriceChange()" style="margin-right: 0;" data-price="' + (data.startPrice || '') + '" value="' + (data.startPrice || '') + '">'

						+'<span class="input-group-addon" style="display: inline;padding: 8px 12px;">元</span>':data.startPrice+'元'),						
						'</div>',
						'<div class="priceChangeReason" style="display:none;"><label style="padding:10px;width:180px;text-align:right;">竞价起始价修改原因：</label>',						
						'<div style="display: inline-block;width: calc(100% - 180px);">',
						'<input type="text" class="form-control" id="startPriceChangeReason" value="' + (data.bidPrice && data.bidPrice.startPriceChangeReason || '') + '"></div></div>',
						'<div><label style="padding:10px;width:180px;text-align:right;">竞价开始时间：</label>',
						(!data.bidPrice||(data.bidPrice&&data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited)?'<input type="text" autocomplete="off" id="bidpriceStartTime" class="btn btn-default ageinTime" value="' + (data.bidpriceStartTime || '') + '"><label style="color:red">注：竞价开始时间可为空，当为空时，启动竞价时间即为竞价开始时间.</label></div>':data.bidPrice.bidpriceStartTime),
						'</div>',
						function () {
							var RenameData = getBidderRenameData(packageId);//供应商更名信息
							let table = $('<table class="table table-bordered" id="supplierJoinInfo"></table>');
							table.bootstrapTable({
								pagination: false,
								undefinedText: "",
								// height: auto,
								data: data.bidPriceSuppliers,
								columns: [{
									title: '序号',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										return index + 1;
									}
								}, {
									field: 'supplierName',
									title: '供应商名称',
									align: 'center',
									formatter: function(value, row, index){
										return data.isOpenDarkDoc == 0?value:showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
									}
								}, {
									field: 'priceTotal',
									title: '报价总价',
									align: 'right'
								},{
									field: 'joinBidprice',
									title: '参与竞价',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										if(!data.bidPrice){
											return '<input type="checkbox" data-price='+ row.priceTotal +' data-supplier="'+ row.supplierId +'" ' + 
											((value == null || value == 1) && ' checked' || '') +
											(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
										}else{
											if(data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited){
												return '<input type="checkbox" data-price='+ row.priceTotal +' data-supplier="'+ row.supplierId +'" ' + 
												((value == null || value == 1) && ' checked' || '') +
												(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
											}else{
												return value?'参与':'不参与'
											}
											
										}
										
									}
								}, {
									field: 'notJoinReason',
									title: '原因',
									formatter: function (value, row, index) {
										if(!data.bidPrice){
											return !!value || ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
										}else{
											if(data.bidPrice.bidpriceStatus != 0&&!data.bidPrice.resultSubmited){
												return  ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
											}else{
												return value
											}
											
										}
										
									}
								}]
							});
							return table.prop("outerHTML");
						}(),
						'<hr style="margin-top:0;">',
						'<div style="margin-bottom:10px;text-align:center;">',
						!data.bidPrice && '<button class="btn btn-primary isStopCheck" data-name="启动竞价" onclick="startBidPrice(this)">启动竞价</button>' || 
						(data.bidPrice.bidpriceStatus == 0 && '<button id="toSee" class="btn btn-primary" data-time="'+ data.bidPrice.bidpriceStartTime +'" onclick="toSee('+data.bidPrice.bidpriceTimes+')">查看竞价情况</button>' || 
						(!data.bidPrice.resultSubmited?'<button class="btn btn-primary isStopCheck " data-name="重新启动竞价" id="startBidPrice" onclick="startBidPrice(this)">重新启动竞价</button>':'')+'<button class="btn btn-primary" onclick="toSeeHistory('+data.bidPrice.bidpriceTimes+')">查看竞价记录</button>'),
						'</div>',
						'</div>',
						function () {
							if (data.bidPrice) {
								return ['<div class="panel panel-info">',
									'<div class="panel-heading">',
									'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
									'竞价结果',
									'</h3>',
									'</div>',
									function () {
										if (!data.bidPrice.bidpriceStatus) {
											return '<div class="panel-body">竞价中，请耐心等候......</div>';
										} else if (data.bidPrice.bidpriceStatus == 1) {
											var RenameData = getBidderRenameData(projectId);//供应商更名信息
											let table = $('<table class="table table-bordered"></table>');
											table.bootstrapTable({
												pagination: false,
												undefinedText: "",
												// height: auto,
												data: data.bidPriceResults.sort(function (a,b){ return a.bidpriceRank-b.bidpriceRank; }),
												columns: [{
													field: 'bidpriceRank',
													title: '竞价排名',
													width: '80px',
													align: 'center'
												}, {
													field: 'supplierName',
													title: '供应商名称',
													align: 'center',
													formatter: function(value, row, index){
														return data.isOpenDarkDoc == 0?value:showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
													}
												}, {
													field: 'priceTotal',
													title: '报价总价',
													align: 'center'
												}, {
													field: 'bidpriceAmount',
													title: '竞价报价',
													align: 'right'
												}, {
													field: 'bidpriceNum',
													title: '竞价报价次数',
													align: 'center'
												}]
											});
											return table.prop("outerHTML")+'<hr style="margin-top:0;">'
											+(!data.bidPrice.resultSubmited&& '<div id="submitResult" style="margin-bottom:10px;text-align:center;"><button class="btn btn-primary isStopCheck" onclick="submitResult()">提交竞价结果</button></div>'|| '');
										} else if (data.bidPrice.bidpriceStatus == 2) {
											return '<div class="panel-body">竞价已流标，原因：' + data.failReason + '</div>';
										}else{
											return '';
										}
									}()
								].join('');
							}
							return '';
						}()
					].join(''));
					data.bidStartPriceFrom == 0 && reloadStartPrice();
					//竞价开始时间
					$('#bidpriceStartTime').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i',		
						onShow:function(){
							var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
							$('#bidpriceStartTime').datetimepicker({						
								minDate:NewDateT(nowSysDate)
							})
						},		
					});
					if(createType==1){
						$('input').attr('disabled',true);
						$('.isStopCheck').hide();				
					}
					if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined) {
						$('input').attr('disabled',true);
						$('.isStopCheck').hide();
					}
					if (progressList.isStopCheck == 1) {											
						$('input').attr('disabled',true);
						
						$('.isStopCheck').hide();
					}
					
				} else {
					lwsorce = data.lowerScore;
					checkItemInfos=data.checkItemInfos;
					if (data.offers.length > 0) {
						offerFileData = data.offerFileList;
						suppliers = data.offers;
						_supplierId=suppliers[0].supplierId;
						_enterpriseName=suppliers[0].enterpriseName;	
						var detaildiv = "";
						var detaildivcenter = "";
						//评审方法&汇总方式
						switch (packageCheckList.checkType) {
							case 0:
								detaildivcenter += "<div style='line-height: 22px;font-size:14px'><span style='color:red'>评审方法：合格制   " + (progressList.shadowMark == 1 ? (packageCheckList.isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（" + (packageCheckList.totalM || "二") + "分之" + (packageCheckList.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span>"
								detaildivcenter += "</div>";

								break;
							case 1:
								detaildivcenter += "<div style='line-height: 22px;font-size:14px'><span style='color:red'>评审方法：评分制  "+ (examType==1?"权重值：" + packageCheckList.weight + (progressList.shadowMark == 1 ? (packageCheckList.isShadowMark == 1 ? "暗标" : "明标") : ''):"") + "</br>";								
								if (packageCheckList.totalType == 0) {
									detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</span></div>";
								} else {
									detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</span></div>";
								}
								break;
							case 2:
								detaildivcenter += "<div style='line-height: 22px;font-size:14px'><span style='color:red'>评审方法：偏离制" + (progressList.shadowMark == 1 ? (packageCheckList.isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";
								detaildivcenter += "<span style='color:red'>该评审项允许最大偏离项数：" + (packageCheckList.deviate || "") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								detaildivcenter += "<span style='color:red'>是否计入总数：" + (packageCheckList.isSetTotal == 0 ? "计入总数" : "不计入总数") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								if (packageCheckList.isSetTotal == 0) {
									detaildivcenter += "<span style='color:red'>是否"+(checkPlan == 4?'减':'加')+"价：" + (packageCheckList.isAddPrice == 0 ? ""+(checkPlan == 4?'减':'加')+"价" : "不"+(checkPlan == 4?'减':'加')+"价") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
								}
								if (packageCheckList.isAddPrice == 0) {
									detaildivcenter += "<span style='color:red'>偏离"+(checkPlan == 4?'减':'加')+"价幅度：" + (packageCheckList.addPrice || "") + "%</br>";
								}
								detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（" + (packageCheckList.totalM || "二") + "分之" + (packageCheckList.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项偏离都将淘汰。</br>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮/下调（采购文件中特别注明的条款，其报价的浮动按具体要求执行 ）</span></div>";
								break;
							case 3:
								detaildivcenter += "<div style='line-height: 22px;font-size:14px'><span style='color:red'>评审方法：评分合格制" + (progressList.shadowMark == 1 ? (packageCheckList.isShadowMark == 1 ? "暗标" : "明标") : '') + "</br>";								
								if (packageCheckList.totalType == 0) {
									detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
								} else {
									detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
								}
								detaildivcenter += "</br>当最终得分低于" + (packageCheckList.lowerScore || "") + "分时，供应商被淘汰";
								detaildivcenter += "</span></div>"
								break;
							}
						detaildiv +='<div class="panel-group" id="accordion">'
						detaildiv +='<div class="panel panel-accordion panel-default" id="projectModal">'
							detaildiv +='<div class="panel-heading active" role="tab" id="heading1">'
								detaildiv +='<h4 class="panel-title">'
									detaildiv +='<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse1" aria-expanded="true" aria-controls="collapse1">评审项结果</a>'
								detaildiv +='</h4>' 
							detaildiv +='</div>' 
							detaildiv +='<div id="collapse1" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading1">' 
								detaildiv +='<div class="panel-body">'
									detaildiv += detaildivcenter;
									detaildiv += "<table id='TabContent_" + packageCheckList.id + "' class='tab-content table table-bordered'>";						
									detaildiv += "</table>";
								detaildiv +='</div>' 
							detaildiv +='</div>' 	
						detaildiv += '</div>'	
						if(isShowCheckResult==0){
							detaildiv +='<div class="panel panel-accordion panel-default" id="TabCehckItemInfo">'
							detaildiv +='<div class="panel-heading active" role="tab" id="heading2">'
								detaildiv +='<h4 class="panel-title">'
									detaildiv +='<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse2" id="aTabCehckItemInfo" aria-expanded="false" aria-controls="collapse2">评审项结果详情</a>'
								detaildiv +='</h4>' 
							detaildiv +='</div>' 
							detaildiv +='<div id="collapse2" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading2">' 
								detaildiv +='<div class="panel-body">'
									if(packageCheckList.checkType!=1&&packageCheckList.checkType!=3){
										detaildiv +='<div style="line-height: 24px;font-size:14px;color:red">提示：将鼠标移入不合格/偏离处，查看不合格/偏离原因</div>'
									}else{
										detaildiv +='<div style="line-height: 24px;font-size:14px;color:red">提示：将鼠标移入填写打分说明的评委单元格内并点击小图标，查看具体内容。</div>'
									}
									var _hs=$("#reportContent").height()-175;
									detaildiv += "<div id='TabCehckItemInfo_" + packageCheckList.id + "' style='height:"+ _hs +"px;overflow: auto;border:1px solid #ddd'></div>";
								detaildiv +='</div>' 
							detaildiv +='</div>' 
							detaildiv += '</div>'
						}		
						detaildiv += '</div>'					
						$("#packageCheckLists").html(detaildiv);
						var RenameData = getBidderRenameData(packageId);//供应商更名信息
						var cols=new Array();						
                        cols.push(
                            {
								title: '序号',
								width: '50px',
								align: 'center',
								formatter: function (value, row, index) {
									return index + 1;
								}
							}, {
								field: 'enterpriseName',
								width: '500px',
								title: '供应商',
								formatter: function(value, row, index){
									return data.isOpenDarkDoc == 0?value:showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
								}
                            })
                            if (packageCheckList.checkType == 2 || packageCheckList.checkType == 0) {
                                cols.push({
									field: 'deviateNum',
									width: '180px',
                                    title: packageCheckList.checkType == 2 ? '偏离项数' : '不合格关键项数',
                                })  
                            }
                            cols.push({
								field: 'isKeyScore',

								title: ((packageCheckList.checkType == 1 || packageCheckList.checkType == 3) ? '分值合计' :(packageCheckList.checkType == 2?'是否偏离':'是否合格')),
								width: '120px',
								formatter: function (value, row, index) {
									var detaildivcenter = "";
									if (packageCheckList.checkType == 1 || packageCheckList.checkType == 3) {
										detaildivcenter = row.score
									}else if(packageCheckList.checkType == 2){
										if (row.isKey == 0) {
											detaildivcenter = "未偏离"
										} else {
											detaildivcenter = "<span class='text-danger'>偏离</span>"
										}
									} else {
										if (row.isKey == 0) {
											detaildivcenter = "合格"
										} else {
											detaildivcenter = "<span class='text-danger'>不合格</span>"
										}
									}
									return detaildivcenter
								}

                            })                         
                            if (packageCheckList.checkType == 3) {
                                cols.push({
                                    field: 'isOut',
									title: '是否淘汰',
									width: '80px',
                                    formatter: function (value, row, index) {
                                        var detaildivcenter = "";
                                        detaildivcenter = row.score
                                        if (row.isKey == 0) {
                                            detaildivcenter ="未淘汰" 
                                        } else {
                                            detaildivcenter = "<span class='text-danger'>淘汰</span>"
                                        }
    
                                        return detaildivcenter
                                    }
    
                                })  
							
							}    
						$("#TabContent_" + packageCheckList.id).bootstrapTable({
							pagination: false,
							clickToSelect: true,
							undefinedText: "",						
							data: suppliers,							
							columns: cols,

						});						
					}
					
				}
			}else{
				parent.layer.alert(data.message);
				$("#"+_THISID).click();
			}
		}
	});

}

$("#packageCheckLists").off('click','#aTabCehckItemInfo').on('click','#aTabCehckItemInfo',function(){
	getItem()
})

function toSee(biddingTimes){
	var  biddingtimedata=$("#toSee").data('time');
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();//当前系统时间
	if(NewDatefp(biddingtimedata)>NewDatefp(nowSysDate)){
		parent.layer.alert('温馨提示：竞价未开始');													
	}else{
		parent.layer.open({
			type: 2 //此处以iframe举例
			,title: '评审竞价情况'
			,area: ['1100px', '600px']
			,maxmin: true//开启最大化最小化按钮
			,content:'Auction/AuctionOffer/Agent/AuctionProjectPackage/model/OfferViewInfo.html?packageId='+packageId+'&biddingTimes='+biddingTimes
			,success:function(layero,index){    
				var iframeWind=layero.find('iframe')[0].contentWindow;       
			}
		});
	}
	
}
function toSeeHistory(biddingTimes){
	parent.layer.open({
		type: 2 //此处以iframe举例
		,title: '评审竞价历史记录'
		,area: ['1100px', '600px']
		,maxmin: true//开启最大化最小化按钮
		,content:'Auction/AuctionOffer/Agent/AuctionProjectPackage/model/OfferHistoryInfo.html?packageId='+packageId+'&biddingTimes='+biddingTimes
		,success:function(layero,index){    
			var iframeWind=layero.find('iframe')[0].contentWindow;       
		}
	});
}
//评委评审 不合格/偏离 原因  切换评委点击事件
function clickCheckItemRes(pCheckId, expId) {
	$("#checkInfoul_" + pCheckId + " li").removeClass('infoClass');
	$("#checkInfoli_" + (pCheckId + expId) + "").addClass("infoClass");
	$(".checkInfoTable").hide();
	$("#checkInfo_" + (pCheckId + expId) + "").show();
}

function getItem(){
	for(var z=0;z<suppliers.length;z++){
		suppliers[z].experts=experts;
		for(var i=0;i<suppliers[z].experts.length;i++ ){	
			suppliers[z].experts[i].expertsItem=[];				
			for(var v=0;v<checkItemInfos.length;v++){	
				if(suppliers[z].supplierId==checkItemInfos[v].supplierId){
					if(suppliers[z].experts[i].id==checkItemInfos[v].checkerEmployeeId){	
						suppliers[z].experts[i].expertsItem.push(checkItemInfos[v]);													
					}
				}		
				
			}	
		};
		
	}
	var html ='<table class="table table-bordered" style="table-layout: fixed;transform-style:preserve-3d;">'
		+'<thead>'
		+'<tr>'
		+'<td  width="50px" style="text-align:center" rowspan="2">序号</td>'
		+'<td rowspan="2" width="200px">评价内容</td>'
		html+='<td width="200px" rowspan="2">评价标准</td>'
		if(nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3){
			html+='<td width="80px" style="text-align:center" rowspan="2">分值</td>'
			html+='<td width="80px" style="text-align:center" rowspan="2">打分类型</td>'
		}else{
			html+='<td width="120px" style="text-align:center" rowspan="2">是否关键要求</td>'
		}		
		html+='<td width="200px" rowspan="2">备注</td>'
		for(var i=0;i<suppliers.length;i++){
			html+='<td style="text-align:center" width="240px" colspan="'+ experts.length +'">'+ suppliers[i].enterpriseName +'</td>';
		}		
		html+='</tr>'
		html+='<tr>'
		for(var i=0;i<suppliers.length;i++){			
			for(var j=0;j<suppliers[i].experts.length;j++ ){
				var reason = '';
				for(var v=0;v<checkItemInfos.length;v++){
					if(suppliers[i].experts[j].id==checkItemInfos[v].checkerEmployeeId&&checkItemInfos[v].supplierId==suppliers[i].supplierId){	
						// if(Item[z].id==checkItemInfos[v].id){
							if(checkItemInfos[v].reason){
								reason = checkItemInfos[v].reason;
								break
							}
						// }													
					}
				}
				/* var reason = '';
				reason = suppliers[i].experts[j].expertsItem[0].reason?suppliers[i].experts[j].expertsItem[0].reason:''; */
				html+='<th style="text-align:center" width="80px">'+ suppliers[i].experts[j].expertName + ((reason != '' && (nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3))?'<span class="glyphicon glyphicon-info-sign resonOfScore" data-text="'+reason+'" style="color:#1a7acd;cursor: pointer;"></span>':'') +'</th>';
			}
			
		}
		html+='</tr>'
		html+='</thead>'
		var Item=suppliers[0].experts[0].expertsItem;
		for(var z=0;z<Item.length;z++){
			html+='<tr>'
			html+='<td style="text-align:center">'+(z+1) +'</td>'
			html+="<td style='white-space:normal;word-break: break-all;'>" + Item[z].checkTitle + "</td>"
			html += "<td style='white-space:normal;word-break: break-all;'>" + (Item[z].checkStandard || '') + "</td>";
			if(nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3){
				var itemScoreType = Item[z].itemScoreType;

				html += "<td style='text-align:center'>" + Item[z].score + "</td>";
				html += "<td style='text-align:center'>" + (itemScoreType == '1' ? '主观分' : itemScoreType == '2' ? '客观分' : '/') + "</td>";
			}else{
				html += "<td style='text-align:center'>" + (Item[z].isKey == 0 ? "是" : "否") + "</td>";
			}
			html += "<td style='white-space:normal;word-break: break-all;'>" + (Item[z].remark || '') + "</td>";
			for(var x=0;x<suppliers.length;x++){				
				for(var i=0;i<suppliers[x].experts.length;i++ ){														
					for(var v=0;v<checkItemInfos.length;v++){	
						if(suppliers[x].experts[i].id==checkItemInfos[v].checkerEmployeeId&&checkItemInfos[v].supplierId==suppliers[x].supplierId){	
							if(Item[z].id==checkItemInfos[v].id){
								if(nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3){
									html+='<td style="text-align:center">'+ checkItemInfos[v].itemScore +'</td>';
								}else if(nowpackageCheckList.checkType == 2){

									html+='<td style="text-align:center">'+ (checkItemInfos[v].itemKey==0?'未偏离':'<span style="color:red" data-toggle="tooltip" data-placement="bottom" title="原因：'+ checkItemInfos[v].reason +'">偏离</span>') +'</td>';
								}else{

									html+='<td style="text-align:center">'+ (checkItemInfos[v].itemKey==0?'合格':'<span style="color:red" data-toggle="tooltip" data-placement="bottom" title="原因：'+ checkItemInfos[v].reason +'">不合格</span>') +'</td>';
								}
							}													
						}
					}		
						
				};	
			}	
			html+='</tr>'
			
		}
		html+='<tr>'
			html+='<td style="text-align:center">汇总</td>'
			html+="<td></td>"
			html+="<td></td>"
			html+="<td></td>"
			html+="<td></td>"
			if(nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3){
				html+="<td></td>"
			}
			for(var i=0;i<suppliers.length;i++){
				if(nowpackageCheckList.checkType == 1 || nowpackageCheckList.checkType == 3){
					html+='<td style="text-align:center" colspan="'+ experts.length +'">'+ suppliers[i].score +((nowpackageCheckList.checkType == 3&&suppliers[i].isKey==1)?'(<span class="text-danger">淘汰</span>)':'')+'</td>';
				}else if(nowpackageCheckList.checkType == 2){
					html+='<td style="text-align:center" colspan="'+ experts.length +'">'+ (suppliers[i].isKey==0?'未偏离':'<span class="text-danger">偏离</span>') +'</td>';
				}else{
					html+='<td style="text-align:center" colspan="'+ experts.length +'">'+ (suppliers[i].isKey==0?'合格':'<span class="text-danger">不合格</span>') +'</td>';
				}				
			}
			html+='</tr>'
	html+='</table>';
	
	$("#TabCehckItemInfo_"+_thisId).html(html);
	$("[data-toggle='tooltip']").tooltip();
}
$('body').off('click', '.resonOfScore').on('click', '.resonOfScore', function(){
	$('#resonOfScore').show().html($(this).attr('data-text'));
	// console.log($('#resonOfScore').height())
	var offerTop = $(this).offset().top - ($('#resonOfScore').height() + 40) + 'px';
	var offerLeft = $(this).offset().left - 250 + 'px';
	$('#resonOfScore').css({'top': offerTop, 'left': offerLeft});
});
$('body').off('mouseout', '.resonOfScore').on('mouseout', '.resonOfScore', function(){
	$('#resonOfScore').hide();
});