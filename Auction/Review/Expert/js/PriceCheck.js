/*
 * @Author: your name
 * @Date: 2020-09-11 13:54:59
 * @LastEditTime: 2021-01-18 17:31:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\PriceCheck.js
 */ 
/*==========   价格评审    ==========*/
var priceChecks;
var businessPriceSet;
var isDeviate = 0;
var rule1 = false,rule2 = false;
var packageData="";
$(function(){
	/* 2022-5-13 修改  zhouyan   12097-询比项目价格评审逻辑修正(询比项目、单一来源)
		P0—报价总价，PΔ—算术修正值（页面中“算数”字样全部更正为“算术”），Ps—修正后总价，P1—评审基础价，P2—缺漏项加价，P3—偏离加价，PT—评审总价，PF—最终优惠价
		i. 最低评标价、最低投标价  评审的项目，将“评审基础价”置于“修正后总价”后，“缺漏项加价”前。其中，P0 + PΔ = Ps，P1 + P2 + P3 = PT，P1默认与Ps相等 
		iii. 经评审的最低价（价格打分）评审的项目，将“评审基础价”置于“修正后总价”后，“缺漏项加价”前。其中，P0 + PΔ = Ps，P1 + P2  = PT，P1默认与Ps相等，可修改
		iv. 综合评分法评审的项目，将“评审基础价”置于“修正后总价”后，“缺漏项加价”前。其中，P0 + PΔ = Ps，P1 + P2  = PT，P1默认与Ps相等，可修改
		*/
	/*设置规则 */
		
	//评审方式：0综合评分法，1最低评标价法，3最低投标价法，2、经评审的最低价法(价格评分), 4经评审的最高投标价法,5经评审的最低投标价法(比照"最低投标价法"规则)
	$.ajax({
		url:top.config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do',
		type:'post',
		async:false,
		data:{
			"packageId":packageId
		},
		success:function(data){
			if(data.success){	   	  	
				packageData=data.data;//包件信息
			}
		},
		
		error:function(data){
			parent.layer.alert("获取失败")
		}
	});
	if(((tenderType == 0 && examType == 1) || tenderType == 6) && (packageData.checkPlan == 1 || packageData.checkPlan == 3 || packageData.checkPlan == 4 || packageData.checkPlan == 5)){
		rule1 =true
	};
	if(((tenderType == 0 && examType == 1) || tenderType == 6) && (packageData.checkPlan == 2 || packageData.checkPlan == 0)){
		rule2 =true
	};
	/* if(tenderType == 0 && examType == 1 && packageData.checkPlan == 0){
		rule3 =true
	}; */
	 /*设置规则   --end */
	PriceCheck();
	if(examType == 1){
		$(".tenderTypeW").show();
		$("#quotePriceUnit").html(quotePriceUnit);
	} else {
		$("#quotePriceUnit").closest("div").hide();
	}
	var _Bh=$("#businessContent1").height(),
	_h=$("#reportContent").height();
	$("#businessContent2").height(_h-_Bh-60);
})
function PriceCheck() {
	$.ajax({
		type: "post",
		url: url + "/ExpertCheckController/getPriceCheckInfoForExp.do",
		data: {
			expertId:expertIds,
			projectId: projectId,
			packageId: packageId,
			checkPlan: checkPlan,
			examType:examType		
		},
		async: true,
		success: function(resle) {
			
			if(resle.success) {
				_THISID=_thisId;
				data = resle.data;
				priceCheckMode=data.priceCheckMode;
				if(data.isShowOffer !=undefined &&  data.isShowOffer == 1) {
					$("#isShowOffer").show(); //价格评审显示报价等信息
					$("#lidiv").show();
					if(progressList.isOfferDetailedItem==0){
						$("#lidiv2").show();
					}else{
						$("#lidiv2").hide();
					}
					
				};	
				if (data.priceCheckRemark) {
					$("#priceCheckRemark").val(data.priceCheckRemark);
					$("#priceCheckRemarkHtml").html(data.priceCheckRemark);
				}											
				businessPriceSet = data.businessPriceSet;
				priceChecks = data.priceChecks;
				isDeviate = data.isDeviate;				
                if(data.isDeviate==0){
                	$(".isDeviate").hide();
                	$("#showDeviates").hide();
				}
				$("#detaildivList").html([
					'<div style="height: 45px;">',
						'<span id="businessName" style="color: red;"></span>',
						'<span id="weight" style="color: red;margin-left: 10px;"></span>' ,              
					'</div>',							
					'<div id="businessType" style="color: red;"></div>',
					'<div id="businessContent" style="color: red;"></div>',
//					'<div id="quotePriceUnit" style="color: red;">报价单位：'+ quotePriceUnit +'</div>',
					
				].join(""))
                //价格评审表格
				if(checkPlan == 1||checkPlan == 3 || checkPlan == 4 || checkPlan == 5) { //最低评标价法					
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的供应商总报价*上浮比例</br>调整后最终总报价=参与应标的供应商总报价+偏离调整'
						]
						
					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					
					$("#businessContent").html("商务报价计算公式：" + roleObj.content[businessPriceSet.checkType]);
                    if(businessPriceSet.checkType==3) $("#businessType").html("商务报价参数：每高于基准价"+ businessPriceSet.reduceLevel +"%，扣"+ businessPriceSet.reduceScore +"分,基准价：供应商最低报价*计价比例"+ businessPriceSet.priceProportion +"%");
                    if(businessPriceSet.checkType==1) $("#businessType").html("商务报价参数：扣分的最小档次："+ businessPriceSet.reduceLevel +"%，最小档扣分："+ businessPriceSet.reduceScore +"分，基准价"+ businessPriceSet.basePrice +"元，有效报价范围（基准价上下浮动比例）±"+businessPriceSet.offerRange+"%");
                    if(businessPriceSet.checkType==2) $("#businessType").html("商务报价参数：</br>"
                                                                              +"基准分："+ businessPriceSet.baseScore +"分,计价比例："+ businessPriceSet.priceProportion +"%</br>"
                                                                              +'当有效报价高于基准价时，基准价比例：'+businessPriceSet.basePriceProportionHigh +"%，扣分值："+businessPriceSet.additionReduceScore1+'分</br>'
                                                                              +'当有效报价低于基准价时，基准价比例：'+businessPriceSet.basePriceProportionLow +"%，扣分值："+businessPriceSet.additionReduceScore2+'分</br>');
                    if(businessPriceSet.checkType==4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)："+ businessPriceSet.floatProportion +"%");
					if(data.priceCheck == "已完成") {
						$("#savediv").hide();
						$("#priceCheckRemark").hide();
						$("#priceCheckRemarkHtml").show();					
					}else{
						$("#savediv").show();
						$("#priceCheckRemark").show();
						$("#priceCheckRemarkHtml").hide();
					}				
				} else {					
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法','固定比例不取整法','固定比例取整法','固定差值法','直接比较法','评价算法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</br>调整后最终总报价=参与应标的有效供应商报价总价+偏离调整',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-|(基准价-报价)|/基准价*100*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+|(基准价-报价)|/基准价*100*每1%加分值)*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-⌊ |(基准价-报价)|/基准价*100⌋*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+⌊ |(基准价-报价)|/基准价*100⌋*每1%加分值)*权重</br>注：⌊ ⌋为向下取整符号',
							'商务报价得分=(商务报价分值-(报价-基准价)/(最高报价-基准价)*最多减分)*权重',
							'商务报价得分=基准价/报价*商务报价分值*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=商务报价分值-|(基准价-报价)|/基准价*100/每百分比减分*每百分比减分值</br>B、供应商报价低于基准价时，且在加分区间内：</br>商务报价得分=商务报价分值+|(基准价-报价)|/基准价*100/每百分比加分*每百分比加分值</br>C、供应商报价低于基准价时，在加分区间外部分：</br>商务报价得分=B项得分-(|(基准价-报价)|/基准价-加分区间/100)*100/每百分比减分*每百分比减分值</p>注：每种情况计算得出的分数需再乘以权重'
						]
						
					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					if(checkPlan == 0){
						$("#weight").html("权重：" + businessPriceSet.weight||"");
					}
					$("#businessContent").html("商务报价计算公式：</br>" + roleObj.content[businessPriceSet.checkType]);
                    if(businessPriceSet.checkType==3) $("#businessType").html("商务报价参数：每高于基准价"+ businessPriceSet.reduceLevel +"%，扣"+ businessPriceSet.reduceScore +"分,基准价：供应商最低报价*计价比例"+ businessPriceSet.priceProportion +"%");
                    if(businessPriceSet.checkType==1) $("#businessType").html("商务报价参数：扣分的最小档次："+ businessPriceSet.reduceLevel +"%，最小档扣分："+ businessPriceSet.reduceScore +"分，基准价"+ businessPriceSet.basePrice +"元，有效报价范围（基准价上下浮动比例）±"+businessPriceSet.offerRange+"%");
                    if(businessPriceSet.checkType==2) $("#businessType").html("商务报价参数：</br>" 
                                                                              +"基准分："+ businessPriceSet.baseScore +"分，计价比例："+ businessPriceSet.priceProportion +"%</br>"
                                                                              +'当有效报价高于基准价时，基准价比例：'+businessPriceSet.basePriceProportionHigh +"%，扣分值："+businessPriceSet.additionReduceScore1+'分</br>'
                                                                              +'当有效报价低于基准价时，基准价比例：'+businessPriceSet.basePriceProportionLow +"%，扣分值："+businessPriceSet.additionReduceScore2+'分</br>');
                    if(businessPriceSet.checkType==4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)："+ businessPriceSet.floatProportion +"%");
                    if(businessPriceSet.checkType==5 || businessPriceSet.checkType==6){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==3){
                    		businessTypeStr+="基准价计算范围：手动输入基准价，";
                    		businessTypeStr+="基准价："+businessPriceSet.basePrice+"</br>";
                    	}else{
                    		if(businessPriceSet.basePriceType==1){
                    			businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    		}else if(businessPriceSet.basePriceType==2){
                    			businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    		}
                    		if(businessPriceSet.basePriceRole==2){
                    			businessTypeStr+="基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例="+businessPriceSet.priceProportion+"%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N="+businessPriceSet.supplierTotal+"</br>";
                    		}else if(businessPriceSet.basePriceRole==3){
                    			businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    		}else{
                    			businessTypeStr+="基准价计算方式：</br>";
                    		}
                    	}
                    	businessTypeStr+="供应商报价每高于基准价1%减"+businessPriceSet.additionReduceScore1+"分，最多减"+businessPriceSet.maxDownScore+"分：</br>";
                    	businessTypeStr+="供应商报价每低于基准价1%加"+businessPriceSet.additionReduceScore2+"分，最多加"+businessPriceSet.maxUpScore+"分：</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==7){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==1){
                    		businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    	}else if(businessPriceSet.basePriceType==2){
                    		businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    	}else{
                    		businessTypeStr+="基准价计算范围：</br>";
                    	}
                    	businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    	businessTypeStr+="减分值，最多减"+businessPriceSet.maxDownScore+"分：</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==8){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==1){
                    		businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    	}else if(businessPriceSet.basePriceType==2){
                    		businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    	}else{
                    		businessTypeStr+="基准价计算范围：</br>";
                    	}
                    	businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==9){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==3){
                    		businessTypeStr+="基准价计算范围：手动输入基准价，";
                    		businessTypeStr+="基准价："+businessPriceSet.basePrice+"</br>";
                    	}else{
                    		if(businessPriceSet.basePriceType==1){
                    			businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    		}else if(businessPriceSet.basePriceType==2){
                    			businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    		}
                    		if(businessPriceSet.basePriceRole==2){
                    			businessTypeStr+="基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例="+businessPriceSet.priceProportion+"%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N="+businessPriceSet.supplierTotal+"</br>";
                    		}else if(businessPriceSet.basePriceRole==3){
                    			businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    		}else{
                    			businessTypeStr+="基准价计算方式：</br>";
                    		}
                    	}
                    	businessTypeStr+="供应商报价每高于基准价"+businessPriceSet.basePriceProportionHigh+"%减"+businessPriceSet.additionReduceScore1+"分</br>";
                    	businessTypeStr+="供应商报价低于基准价，且在加分区间"+businessPriceSet.addScoreScope+"%内(含)，每"+businessPriceSet.basePriceProportionLow+"%加"+businessPriceSet.additionReduceScore2+"分，最多加"+businessPriceSet.maxUpScore+"分：</br>";
                    	businessTypeStr+="供应商报价低于基准价，且在加分区间"+businessPriceSet.addScoreScope+"%外，超出部分每"+businessPriceSet.basePriceScale+"%减"+businessPriceSet.basePriceNumber+"分";
                    	$("#businessType").html(businessTypeStr);
                    }
					if(data.priceCheck == "已完成") {
						$("#savediv").hide();
						$("#priceCheckRemark").hide();
						$("#priceCheckRemarkHtml").show();
					}else{
						$("#savediv").show();
						$("#priceCheckRemark").show();
						$("#priceCheckRemarkHtml").hide();
					}
				}
				var RenameData = getBidderRenameData(packageId);//供应商更名信息
				var columnList=[];
				columnList.push({
					field: '#',title: '序号',width: '50px',
					formatter: function(value, row, index) {
						return index + 1;
					}
				});
				columnList.push({field: 'enterpriseName',title: '供应商',formatter: function(value, row, index){
					return showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
				} });
				columnList.push({field: 'isOut',title: '淘汰',align:'center',width: '80px',
					formatter: function(value, row, index) {
						return value == 0 ? "<span type='text' id='isOut_" + row.supplierId + "' value='0'>否</span>" :"<span type='text' id='isOut_" + row.supplierId + "' value='1'>是</span>";
					}
				});
				columnList.push({field: 'saleTaxTotal',title: '报价总价',width: '120px',
					formatter: function(value, row, index) {
						if(row.isEvpOut){
							return "<span class='red'>未解密</span>";
						}else{
							return "<span type='text' id='saleTaxTotal_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
						}
					}
				});
				if(!rule1 && !rule2){
					columnList.push({field: 'baseCheckPrice',title: '评审基础价',width: '150px',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(row.isOut == 0){
									//未淘汰
									return "<input style='width:100%' onchange='fixCount(\""+'baseCheckPrice'+"\",\""+row.supplierId+"\")'  type='text' id='baseCheckPrice_" + row.supplierId + "' value='" +row.saleTaxTotal+ "' />";
								}else{
									return "<input style='width:100%;display:none' type='text' id='baseCheckPrice_" + row.supplierId + "' value=''/><span>/</span>";
								}	
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({field: 'fixCount',title: '算术修正值',width: '100px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0){
								//未淘汰
								return "<input style='width:100%' onchange='fixCount(\""+'fixCount'+"\",\""+row.supplierId+"\")'  type='text' id='fixCount_" + row.supplierId + "' value='" +0+ "'></input>";
							}else{
								return "<input style='width:100%;display:none' type='text' id='fixCount_" + row.supplierId + "' value=''/><span>/</span>";
							}
							
							
						} else {
							return value;
						}
					}
				});
				columnList.push({field: 'fixFinalPrice',title: '修正后总价',width: '120px',
					formatter: function(value, row, index) {
						if(data.priceCheck == '未完成'){
							if(row.isOut == 0){
								return "<span type='text' id='fixFinalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
							
							}else{
								return "<input style='width:100%;display:none' class='fixFinalPrice' type='text' id='fixFinalPrice_" + row.supplierId + "' value=''/><span>/</span>";
							}
						}else{
							return value;
						}
						
					}
				});
				if(rule2 ||rule1){
					columnList.push({field: 'baseCheckPrice',title: '评审基础价',width: '150px',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(row.isOut == 0){
									//未淘汰
									return "<input style='width:100%' onchange='fixCount(\""+'baseCheckPrice'+"\",\""+row.supplierId+"\")'  type='text' id='baseCheckPrice_" + row.supplierId + "' value='" +row.saleTaxTotal+ "' />";
								}else{
									return "<input style='width:100%;display:none' type='text' id='baseCheckPrice_" + row.supplierId + "' value=''/><span>/</span>";
								}	
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({field: 'defaultItem',title: '缺漏项'+(checkPlan == 4?'减':'加')+'价',width: '100px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0) {
								return "<input style='width:100%;' onchange='defaultItem(\""+row.supplierId+"\")' type='text' id='defaultItem_" + row.supplierId + "' value='" +0+ "'></input>";
							}else{
								return "<input style='width:100%;display:none' type='text' id='defaultItem_" + row.supplierId + "' value=''/><span>/</span>";
								
							}
						} else {
							return value ;
						}
					}
				});
				if(checkPlan == 1 || checkPlan == 4 || checkPlan == 5){
					columnList.push({field: 'deviateNum',title: '计入总数偏离项数',width: '180px',
						formatter: function(value, row, index) {
							if(data.priceCheck == '未完成'){
								if(row.isOut == 0){
									return "<span type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span>";
								
								}else{
									return "<span style='width:100%;display:none' type='text' id='deviateNum_" + row.supplierId + "' value='"+(row.deviateNum || '0')+"'>" + (row.deviateNum || '0') + "</span><span>/</span>";
								}
							}else{
								return value;
							}
							
						}
					});
				}
				if(checkPlan == 1||checkPlan == 3 || checkPlan == 4 || checkPlan == 5){
					columnList.push({field: 'deviatePrice',title: '偏离'+(checkPlan == 4?'减':'加')+'价',width: '100px',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(businessPriceSet.checkType == 0) {
									if(row.isOut == 0 ){
										return "<input type='text' style='width:100%' id='deviatePrice_" + row.supplierId + "' value='0' onchange='fixCount(\""+'deviatePrice'+"\",\""+row.supplierId+"\")'></input>";
									}else{
										return "<input type='hidden' id='deviatePrice_" + row.supplierId + "' value=''></input><span>/</span>";
									}
								}else{
									if(row.isOut == 0) {
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value='" +(row.deviatePrice || 0)+ "'>" + (row.deviatePrice || 0) + "</span>";
									}else{
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value=''>/</span>";
									}
								}
							} else {
								return value;
							}
						}
					});
				}				
				columnList.push({field: 'totalCheck',title: '评审总价',width: '180px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0 ){
								return "<input type='text' style='width:100%' onchange='fixCount(\""+'totalCheck'+"\",\""+row.supplierId+"\")' id='totalCheck_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'></input>";
							}else{
								return "<input type='hidden' id='totalCheck_" + row.supplierId + "' value=''></input><span>/</span>";
							}										
						} else {
							return value;
						}
					}
				});
				if(checkPlan != 1&&checkPlan != 3 && checkPlan != 4 && checkPlan != 5){
					columnList.push({field: 'score',title: '商务报价得分',width: '150px',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(businessPriceSet.checkType == 0) {
									if(row.isOut == 0){
										return "<input type='text' style='width:100%' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'></input>";
									}else{
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}
									
								} else {
									if(row.isOut == 0 ){
										return "<span type='text' style='width:100%' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'>" + (row.score || '') + "</span>";
									}else{
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}
									
									
								}
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({field: 'reason',title: '调整原因',width: '150px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0){
								return "<input style='width:100%' type='text' id='reason_" + row.supplierId + "' value=''></input>";
							}else{
								return "<input style='display:none' type='text' id='reason_" + row.supplierId + "' value=''></input><span>/</span>";
							}
						} else {
							return value;
						}
					}
				});
				columnList.push({
					field: 'finalDiscountPrice', title: '最终优惠价',width: '150px',
					events: {
						'click .finalChecked': function (e, value, row, index) {
							if (this.checked == true) {
								$("#finalDiscountPrice_" + row.supplierId).attr('disabled', false)
							} else {
								$("#finalDiscountPrice_" + row.supplierId).attr('disabled', true);
								$("#finalDiscountPrice_" + row.supplierId).val("")
							}
						}
					},
					formatter: function (value, row, index) {
						if (data.priceCheck == '未完成') {
							if (row.isOut == 0) {
								if(priceCheckMode==1){
									if (row.finalDiscountPrice) {
										return " <input type='checkbox' checked class='finalChecked' id='finalChecked_" + row.supplierId + "' value=''><input style='width:80px;' type='text' onchange='fixCount(\"" + 'finalDiscountPrice' + "\",\"" + row.supplierId + "\")' id='finalDiscountPrice_" + row.supplierId + "' value='"+( row.finalDiscountPrice||"") +"'/>";
									}else{
										return " <input type='checkbox' "+( row.bidpriceAmount?'checked':'') +"  class='finalChecked' id='finalChecked_" + row.supplierId + "' value=''><input "+( row.bidpriceAmount?'':'disabled') +" style='width:80px;' type='text' onchange='fixCount(\"" + 'finalDiscountPrice' + "\",\"" + row.supplierId + "\")' id='finalDiscountPrice_" + row.supplierId + "' value='"+ (row.bidpriceAmount||"")+"'/>";
									} 
								}else{
									if (row.finalDiscountPrice) {
										return " <input type='checkbox' checked class='finalChecked' id='finalChecked_" + row.supplierId + "' value=''><input style='width:80px;' type='text' onchange='fixCount(\"" + 'finalDiscountPrice' + "\",\"" + row.supplierId + "\")' id='finalDiscountPrice_" + row.supplierId + "' value='"+ (row.finalDiscountPrice||"") +"'/>";
									} else {
										return " <input type='checkbox' class='finalChecked' id='finalChecked_" + row.supplierId + "' value=''><input style='width:80px;' disabled type='text' onchange='fixCount(\"" + 'finalDiscountPrice' + "\",\"" + row.supplierId + "\")' id='finalDiscountPrice_" + row.supplierId + "' value=''/>";
									}
								}								
							} else {
								return "<input style='width:80px;display:none' class='finalDiscountPrice' type='text' id='finalDiscountPrice_" + row.supplierId + "' value=''/><span>/</span>";
							}
						} else {
							return value;
						}

					}
				});
				//价格评审表格
				$("#PriceCheckTalbe").bootstrapTable({
					columns: columnList
				});									
				$("#PriceCheckTalbe").bootstrapTable("load", priceChecks);	
			} else {
				top.layer.alert(resle.message);								
				$("#"+_THISID).click();	
			}
		}
	});
}
//算数修正值改变时间
function fixCount(typeName, supplierId) {
	//判断输入的值是否为数字
	var fixCount = $("#" + typeName + "_" + supplierId + "").val();
	if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4 || checkPlan == 5) {
		var deviatePrice=($("#deviatePrice_" + supplierId + "").val()||0)
	}else{
		var deviatePrice=($("#deviatePrice_" + supplierId + "").attr("value")||0)
	}
	
	if (typeName == "fixCount" || typeName == 'baseCheckPrice' || typeName == 'deviatePrice') {
		if (typeName == "fixCount") {
			if (fixCount != "" && !(re.test(fixCount))) {
				parent.layer.alert("算术修正值只能是数字(不限正负)且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val(0);
				fixCount=0;
			}else{
				if(fixCount.substr(0,1) == '-' || fixCount.substr(0,1) == '+'){
					if(fixCount.slice(1).split('.')[0].length > priceInte){
						parent.layer.alert("算术修正值最多"+priceInte+"位整数");
						$("#" + typeName + "_" + supplierId + "").val(0);
						fixCount=0;
					}
				}else{
					if(fixCount.split('.')[0].length > priceInte){
						parent.layer.alert("算术修正值最多"+priceInte+"位整数");
						$("#" + typeName + "_" + supplierId + "").val(0);
						fixCount=0;
					}
				}
			}
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值;
			if(rule1 || rule2){
				var prices = MathTools.add(($("#saleTaxTotal_" + supplierId + "").text()||0),fixCount,pointNum);
				$("#fixFinalPrice_" + supplierId + "").attr("value", prices);
				$("#fixFinalPrice_" + supplierId + "").text(prices);
				$("#baseCheckPrice_" + supplierId + "").val(prices);
			}else{
				var prices = MathTools.add(($("#baseCheckPrice_" + supplierId + "").val()||0),fixCount,pointNum);
			}
			// var prices = parseFloat(parseFloat($("#baseCheckPrice_" + supplierId + "").val()||0).mul(1000000) + parseFloat(fixCount).mul(1000000)).div(1000000);

		} else if (typeName == "baseCheckPrice") {
			if (fixCount != "" && !(rm.test(fixCount))) {
				parent.layer.alert("评审基础价必须大于零且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			if(fixCount.split('.')[0].length > priceInte){
				parent.layer.alert("评审基础价最多"+priceInte+"位整数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值 ；
			var prices = MathTools.add(($("#fixCount_" + supplierId + "").val()||0),fixCount,pointNum);
			// var prices = parseFloat(parseFloat($("#fixCount_" + supplierId + "").val()||0).mul(1000000) + parseFloat(fixCount).mul(1000000)).div(1000000);
		} else {
			if (fixCount != "" && !(re.test(fixCount))) {
				parent.layer.alert("偏离加价只能是数字(不限正负)且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val(0);
				fixCount=0;
			};
			if(fixCount.substr(0,1) == '-' || fixCount.substr(0,1) == '+'){
				if(fixCount.slice(1).split('.')[0].length > priceInte){
					parent.layer.alert("偏离加价最多"+priceInte+"位整数");
					$("#" + typeName + "_" + supplierId + "").val(0);
					fixCount=0;
				}
			}else{
				if(fixCount.split('.')[0].length > priceInte){
					parent.layer.alert("偏离加价最多"+priceInte+"位整数");
					$("#" + typeName + "_" + supplierId + "").val(0);
					fixCount=0;
				}
			};
			deviatePrice=$("#" + typeName + "_" + supplierId + "").val()
			fixCount = fixCount || 0;
			var prices = Number($("#fixFinalPrice_" + supplierId + "").text());			
		}
		var price = prices;
		if (price < 0) {
			parent.layer.alert("修正后总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("")
			return;
		};
		if(price.toString().split('.')[0].length > priceInte){
			parent.layer.alert("修正后总价最多"+priceInte+"位整数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return
		};
		if(!rule1 && !rule2){
			$("#fixFinalPrice_" + supplierId + "").val(price);
			$("#fixFinalPrice_" + supplierId + "").text(price);
		}
		/* $("#fixFinalPrice_" + supplierId + "").attr("value", price);
		$("#fixFinalPrice_" + supplierId + "").text(price); */
		var defaultItem = $("#defaultItem_" + supplierId + "").val();
		defaultItem = defaultItem || 0;
		//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
		if(rule1 || rule2){
			var midPrice = MathTools.add($("#baseCheckPrice_" + supplierId + "").val(),deviatePrice,pointNum);
		}else{
			var midPrice = MathTools.add(price,deviatePrice,pointNum);
		}
		prices = MathTools.add(midPrice,defaultItem,pointNum);
		// prices = parseFloat(parseFloat(price).mul(1000000)+ parseFloat((deviatePrice|| 0)).mul(1000000) + parseFloat(defaultItem).mul(1000000)).div(1000000);
		var price = prices;
		if (price < 0) {
			parent.layer.alert("评审总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		}
		if(price.toString().split('.')[0].length > priceInte){
			parent.layer.alert("评审总价最多"+priceInte+"位整数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return
		};
		$("#totalCheck_" + supplierId + "").val(price);
	} else if (typeName == 'totalCheck') {
		if (fixCount != "" && !(rm.test(fixCount))) {
			parent.layer.alert("评审总价必须大于零且最多"+weiChnise+"位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
		if(fixCount.split('.')[0].length > priceInte){
			parent.layer.alert("评审总价最多"+priceInte+"位整数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return
		};
	} else if (typeName == 'finalDiscountPrice') {
		if (fixCount != "" && !(rm.test(fixCount))) {
			parent.layer.alert("最终优惠价必须大于零且最多"+weiChnise+"位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
		if(fixCount.split('.')[0].length > priceInte){
			parent.layer.alert("最终优惠价最多"+priceInte+"位整数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return
		};
		return
	}
	var para = savepriceData();
	para.packageId =packageId;
	$.ajax({
		type: "POST",
		url: url + "/ReviewCheckController/changePriceCheck.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				$(".PriceCheckBtn").show();
				for (var i = 0; i < data.data.length; i++) {
					if (data.data[i].isOut == 0) {
						$("#score_" + data.data[i].supplierId + "").attr("value", data.data[i].score);
					}
					$("#score_" + data.data[i].supplierId + "").text(data.data[i].score);
				}
			} else {
				if (data.message) {
					if (data.message == "1") {
						$(".PriceCheckBtn").hide();
						top.layer.alert("温馨提示：基准价小于等于0，无法计算商务报价得分");
					} else {
						top.layer.alert(data.message);
					}
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}
//缺漏项改变事件
function defaultItem(supplierId) {
	//判断输入的值是否为数字
	var defaultItem = $("#defaultItem_" + supplierId + "").val();
	if (defaultItem != "" && !(re.test(defaultItem))) {
		parent.layer.alert("缺漏项加价只能是数字(不限正负)且最多"+ weiChnise +"位小数");
		$("#defaultItem_" + supplierId + "").val(0);
		defaultItem=0;
	};
	if(defaultItem.substr(0,1) == '-' || defaultItem.substr(0,1) == '+'){
		if(defaultItem.slice(1).split('.')[0].length > priceInte){
			parent.layer.alert("缺漏项加价最多"+ priceInte +"位整数");
			$("#defaultItem_" + supplierId + "").val(0);
			defaultItem=0;
		}
	}else{
		if(defaultItem.split('.')[0].length > priceInte){
			parent.layer.alert("缺漏项加价最多"+ priceInte +"位整数");
			$("#defaultItem_" + supplierId + "").val(0);
			defaultItem=0;
		}
	}
	if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4 || checkPlan == 5) {
		var deviatePrice=($("#deviatePrice_" + supplierId + "").val()||0)
	}else{
		var deviatePrice=($("#deviatePrice_" + supplierId + "").attr("value") || 0)
	}
	defaultItem = defaultItem || 0;
	//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
	if(rule1 || rule2){
		var prices = MathTools.add(($("#baseCheckPrice_" + supplierId + "").val() || 0),deviatePrice,pointNum);
	}else{
		var prices = MathTools.add(($("#fixFinalPrice_" + supplierId + "").attr("value") || 0),deviatePrice,pointNum);
	}
	// var prices = parseFloat(parseFloat(($("#fixFinalPrice_" + supplierId + "").attr("value") || 0)).mul(1000000) + parseFloat(deviatePrice).mul(1000000) + parseFloat(defaultItem).mul(1000000)).div(1000000);
	var price = MathTools.add(prices,defaultItem,pointNum);
	// var price = prices;
	if (price < 0) {
		parent.layer.alert("评审总价不得小于零");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	}
	if(price.toString().split('.')[0].length > priceInte){
		parent.layer.alert("评审总价最多"+ priceInte +"位整数");
		$("#defaultItem_" + supplierId + "").val(0);
		return;
	}
	$("#totalCheck_" + supplierId + "").val(price);
	var para = savepriceData();
	para.packageId = packageId;
	$.ajax({
		type: "POST",
		url: url + "/ReviewCheckController/changePriceCheck.do",
		data: para,
		async: false,
		success: function (data) {
			if (data.success) {
				$(".PriceCheckBtn").show();
				for (var i = 0; i < data.data.length; i++) {
					if (data.data[i].isOut == 0) {
						$("#score_" + data.data[i].supplierId + "").attr("value", data.data[i].score);
					}
					$("#score_" + data.data[i].supplierId + "").text(data.data[i].score);
				}
			} else {
				if (data.message) {
					if (data.message == "1") {
						$(".PriceCheckBtn").hide();
						top.layer.alert("温馨提示：基准价小于等于0，无法计算商务报价得分");
					} else {
						top.layer.alert(data.message);
					}
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});

}
/* //算数修正值改变时间
function fixCount(typeName, supplierId) {
	//判断输入的值是否为数字
	var fixCount = $("#" + typeName + "_" + supplierId + "").val();
	if (checkPlan == 1 || checkPlan == 3) {
		var deviatePrice=($("#deviatePrice_" + supplierId + "").val()||0)
	}else{
		var deviatePrice=($("#deviatePrice_" + supplierId + "").attr("value")||0)
	}
	
	if (typeName == "fixCount" || typeName == 'baseCheckPrice' || typeName == 'deviatePrice') {
		if (typeName == "fixCount") {
			if (fixCount != "" && !(re.test(fixCount))) {
				parent.layer.alert("算数修正值只能是数字(不限正负)且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val(0);
				fixCount=0;
			};
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值;
			var prices = parseFloat(parseFloat($("#baseCheckPrice_" + supplierId + "").val()||0).mul(100000000000) + parseFloat(fixCount).mul(100000000000)).div(100000000000);

		} else if (typeName == "baseCheckPrice") {
			if (fixCount != "" && !(rm.test(fixCount))) {
				parent.layer.alert("评审基础价必须大于零且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值 ；
			var prices = parseFloat(parseFloat($("#fixCount_" + supplierId + "").val()||0).mul(100000000000) + parseFloat(fixCount).mul(100000000000)).div(100000000000);
		} else {
			if (fixCount != "" && !(re.test(fixCount))) {
				parent.layer.alert("偏离加价只能是数字(不限正负)且最多"+weiChnise+"位小数");
				$("#" + typeName + "_" + supplierId + "").val(0);
				fixCount=0;
			};
			deviatePrice=$("#" + typeName + "_" + supplierId + "").val()
			fixCount = fixCount || 0;
			var prices = Number($("#fixFinalPrice_" + supplierId + "").text());			
		}
		var price = prices;
		if (price < 0) {
			parent.layer.alert("修正后总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("")
			return;
		}
		$("#fixFinalPrice_" + supplierId + "").attr("value", price);
		$("#fixFinalPrice_" + supplierId + "").text(price);
		var defaultItem = $("#defaultItem_" + supplierId + "").val();
		defaultItem = defaultItem || 0;
		//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
		prices = parseFloat(parseFloat(price).mul(100000000000)+ parseFloat((deviatePrice|| 0)).mul(100000000000) + parseFloat(defaultItem).mul(100000000000)).div(100000000000);
		var price = prices;
		if (price < 0) {
			parent.layer.alert("评审总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		}
		$("#totalCheck_" + supplierId + "").val(price);
	} else if (typeName == 'totalCheck') {
		if (fixCount != "" && !(rm.test(fixCount))) {
			parent.layer.alert("评审总价必须大于零且最多"+weiChnise+"位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
	} else if (typeName == 'finalDiscountPrice') {
		if (fixCount != "" && !(rm.test(fixCount))) {
			parent.layer.alert("最终优惠价必须大于零且最多"+weiChnise+"位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
		return
	}
	var para = savepriceData();
	para.packageId =packageId;
	$.ajax({
		type: "POST",
		url: url + "/ReviewCheckController/changePriceCheck.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				$(".PriceCheckBtn").show();
				for (var i = 0; i < data.data.length; i++) {
					if (data.data[i].isOut == 0) {
						$("#score_" + data.data[i].supplierId + "").attr("value", data.data[i].score);
					}
					$("#score_" + data.data[i].supplierId + "").text(data.data[i].score);
				}
			} else {
				if (data.message) {
					if (data.message == "1") {
						$(".PriceCheckBtn").hide();
						top.layer.alert("温馨提示：基准价小于等于0，无法计算商务报价得分");
					} else {
						top.layer.alert(data.message);
					}
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}
//缺漏项改变事件
function defaultItem(supplierId) {
	//判断输入的值是否为数字
	var defaultItem = $("#defaultItem_" + supplierId + "").val();
	if (defaultItem != "" && !(re.test(defaultItem))) {
		parent.layer.alert("缺漏项加价只能是数字(不限正负)且最多"+ weiChnise +"位小数");
		$("#defaultItem_" + supplierId + "").val(0)
		defaultItem=0;
	};
	if (checkPlan == 1 || checkPlan == 3) {
		var deviatePrice=($("#deviatePrice_" + supplierId + "").val()||0)
	}else{
		var deviatePrice=($("#deviatePrice_" + supplierId + "").attr("value") || 0)
	}
	defaultItem = defaultItem || 0;
	//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
	var prices = parseFloat(parseFloat(($("#fixFinalPrice_" + supplierId + "").attr("value") || 0)).mul(100000000000) + parseFloat(deviatePrice).mul(100000000000) + parseFloat(defaultItem).mul(100000000000)).div(100000000000);
	var price = prices
	if (price < 0) {
		parent.layer.alert("评审总价不得小于零");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	}
	$("#totalCheck_" + supplierId + "").val(price);
	var para = savepriceData();
	para.packageId = packageId;
	$.ajax({
		type: "POST",
		url: url + "/ReviewCheckController/changePriceCheck.do",
		data: para,
		async: false,
		success: function (data) {
			if (data.success) {
				$(".PriceCheckBtn").show();
				for (var i = 0; i < data.data.length; i++) {
					if (data.data[i].isOut == 0) {
						$("#score_" + data.data[i].supplierId + "").attr("value", data.data[i].score);
					}
					$("#score_" + data.data[i].supplierId + "").text(data.data[i].score);
				}
			} else {
				if (data.message) {
					if (data.message == "1") {
						$(".PriceCheckBtn").hide();
						top.layer.alert("温馨提示：基准价小于等于0，无法计算商务报价得分");
					} else {
						top.layer.alert(data.message);
					}
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});

} */
//保存价格评审
function savepriceChecks() {
	for (var i = 0; i < priceChecks.length; i++) {
		if (priceChecks[i].isOut == 0) {
			if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4 || checkPlan == 5) {
				if ($("#deviatePrice_" + priceChecks[i].supplierId).val() != "" && priceChecks[i].isOut == 0 && (checkPlan == 1 || checkPlan == 4 || checkPlan == 5)) {
					var testRule = /^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/;
					if(checkPlan == 4){
						testRule = re;
					}
					// if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#deviatePrice_" + priceChecks[i].supplierId).val())) {
					if (!testRule.test($("#deviatePrice_" + priceChecks[i].supplierId).val())) {
						top.layer.alert(priceChecks[i].enterpriseName + "的偏离调整加价只能是数字");
						return false;
					}
				}
			} else {
				if (businessPriceSet.checkType == 0) {
					if ($("#score_" + priceChecks[i].supplierId).val() == '' && priceChecks[i].isOut == 0) {
						top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的商务报价得分");
						return false;
					}
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#score_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分只能是纯数字");
						return false;
					}
					if (parseFloat($("#score_" + priceChecks[i].supplierId).val()) > (100 * parseFloat(businessPriceSet.weight)) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分超出最大范围" + (100 * parseFloat(businessPriceSet.weight)));
						return false;
					}
				}
			}
			if ($("#totalCheck_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
				top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的评审总价");
				return false;
			}
			if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#totalCheck_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
				top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字");
				return false;
			}
			if ($("#finalChecked_" + priceChecks[i].supplierId).is('checked') == true) {
				if ($("#finalDiscountPrice_" + priceChecks[i].supplierId).val() == "") {
					top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的最终优惠价");
					return false;
				} else {
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#finalDiscountPrice_" + priceChecks[i].supplierId).val())) {
						top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字,且最多两位小数");
						return false;
					}
				}

			}
			var saleTaxTotal = $("#saleTaxTotal_" + priceChecks[i].supplierId + "").attr("value");//报价总价
			var totalCheck = $("#totalCheck_" + priceChecks[i].supplierId + "").val();//评审总价
			var finalDiscountPrice = $("#finalDiscountPrice_" + priceChecks[i].supplierId + "").val();//最终优惠价
			if (parseFloat(totalCheck) != parseFloat(saleTaxTotal) || finalDiscountPrice != "") {
				if ($("#reason_" + priceChecks[i].supplierId).val() == '') {
					top.layer.alert("请输入" + priceChecks[i].enterpriseName + "的调整原因");
					return false;
				}
			}
		}
	}
	var para = savepriceData();
	$.ajax({
		type: "POST",
		url: url + "/ReviewCheckController/submitPriceCheck.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				$("#savediv").hide();
				PriceCheck();
				if (isDeviate == 1) {
					$("#showDeviates").show();
				}
				top.layer.alert('提交成功!');
			} else {
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}

$(".isDeviate").off("click").on('click', function () {
	parent.layer.open({
		type: 2,//此处以iframe举例
		title: '偏离项明细',
		btn: ["关闭"],
		area: ['1100px', '600px'],
		content: "bidPrice/Review/projectManager/modal/deviateInfo.html?packageId=" + packageId + '&projectId=' + projectId,
		success: function (layero, index) {
		}
	});
})
//价格评审提交数据
function savepriceData() {
	var para = {};
	for (var i = 0; i < priceChecks.length; i++) {
		para['priceChecks[' + i + '].projectId'] = projectId;
		para['priceChecks[' + i + '].packageId'] = packageId;
		para['priceChecks[' + i + '].supplierId'] = priceChecks[i].supplierId;
		para['priceChecks[' + i + '].checkPlan'] = checkPlan;
		para['priceChecks[' + i + '].isOut'] = $("#isOut_" + priceChecks[i].supplierId).attr("value");
		if ($("#isOut_" + priceChecks[i].supplierId).attr("value") == 0) {
			para['priceChecks[' + i + '].baseCheckPrice'] = $("#baseCheckPrice_" + priceChecks[i].supplierId).val();
			para['priceChecks[' + i + '].fixCount'] = $("#fixCount_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].defaultItem'] = $("#defaultItem_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].fixFinalPrice'] = $("#fixFinalPrice_" + priceChecks[i].supplierId).html();
			para['priceChecks[' + i + '].reason'] = $("#reason_" + priceChecks[i].supplierId).val();
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).attr("value");
			para['priceChecks[' + i + '].finalPrice'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).attr("value");
			para['priceChecks[' + i + '].finalDiscountPrice'] = $("#finalDiscountPrice_" + priceChecks[i].supplierId).val();
			if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4 || checkPlan == 5) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).val() || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).attr("value") || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				}
			} else {
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).val();
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).attr("value");
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				}
			}
		} else {
			if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4 || checkPlan == 5) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html()||"";
			}
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).html()||"";
		}

		if (priceChecks[i].id) {
			para['priceChecks[' + i + '].id'] = priceChecks[i].id
		};
	}
	para.priceCheckRemark = $("#priceCheckRemark").val();
	para.expertId=expertIds;
	return para;
}
/*==========   价格评审 END   ==========*/