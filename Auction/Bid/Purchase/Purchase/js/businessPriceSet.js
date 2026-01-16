
//价格评审
function scoreTypeBtn(_c,_d,type){
	var Assessment="";	
	//自定义评分法
	if(!type){
		Assessment+='<tr>'
			+'<td style="width:250px;" class="th_bg">向供应商展示价格评审</td>'
			+'<td colspan="3" style="text-align: left;">'
				+(businessPriceSetData.isShowPriceSet==1?'不展示':'展示')
			+'</td>'
		+'</tr>'
	}
	if(_c==0){
		Assessment+='<tr>'
						+'<td class="th_bg">自定义评分名称</td>'	
						+'<td style="text-align: left;" colspan="'+(_d==0?"1":"3")+'">'+ (businessPriceSetData.businessName==undefined?"":businessPriceSetData.businessName) +'</td>'
						+'<td class="'+(_d==0?"":"none")+' th_bg">权重值（0~1）</td>'
						+'<td style="text-align: left;" class="'+(_d==0?"":"none")+'" >'+ businessPriceSetData.weight +'</td>'
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">商务报价计算方法</td>'
						+'<td style="text-align: left;" colspan="4">'+(businessPriceSetData.businessContent==undefined?"":businessPriceSetData.businessContent)+'</td>'
					+'</tr>'
	};
	//最低有效投标价法
	if(_c==1){
		Assessment+='<tr>'
		                +'<td class="th_bg">报价评分类型</td>'
						+'<td colspan="3" style="text-align: left;">最低有效投标价法</td>'						
					+'</tr>'
					 +'<tr>'
						+'<td class="th_bg">权重值（0~1）</td>'
						+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
						+'<td style="text-align: left;" colspan="3">商务报价分值=100</td>'
					+'</tr>'
					+'<tr>'
						+'<td rowspan="3" style="border:none" class="th_bg">1、商务报价参数</td>'
						
					+'</tr>'		
					+'<tr>'
						+'<td  style="text-align: left;">扣分的最小档次：'+(businessPriceSetData.reduceLevel==undefined?"":businessPriceSetData.reduceLevel+"%")+'</td>'				
						+'<td colspan="2" style="text-align: left;">最小档扣分：'+ (businessPriceSetData.reduceScore==undefined?"":businessPriceSetData.reduceScore+"分") +'</td>'
					+'</tr>'
					+'<tr>'
						+'<td style="text-align: left;">基准价('+ top.prieUnit +')：'+(businessPriceSetData.basePrice==undefined?"":businessPriceSetData.basePrice)+'</td>'
						+'<td colspan="2"  style="text-align: left;">有效报价范围（基准价上下浮动比例）：'+(!businessPriceSetData.offerRange?"":businessPriceSetData.offerRange+'%')+'</td>'
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价得分计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p><strong>商务报价得分</strong>=商务报价分值-N*最小挡扣分</p>'
						+'<p><strong>N</strong>=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</p>'
						+'<p>说明</p>'
						+'<p>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</p>'
						+'<p>(2)、当N为小数时，直接进一取整</p>'
						+'</td>'
					+'</tr>'
	};
	//基准价评分法
	if(_c==2){
		Assessment+='<tr>'
		                +'<td class="th_bg">报价评分类型</td>'
						+'<td colspan="3" style="text-align: left;">基准价评分法</td>'						
					+'</tr>'
		            +'<tr>'		               
						+'<td class="th_bg">权重值（0~1）</td>'
						+'<td colspan="3" style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td rowspan="6" class="th_bg">1、商务报价参数</td>'						
					+'</tr>'
					+'<tr>'
						+'<td colspan="3"  style="text-align: left;width:200px">基准价计算范围：'+(businessPriceSetData.basePriceType==1?"计算价格评审环节中有效供应商的报价":businessPriceSetData.basePriceType==2?'计算所有供应商的报价':'')+'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td colspan="3"  style="text-align: left;width:200px">计算规则：'+(businessPriceSetData.basePriceRole==0?"基准价=参与应标的有效供应商报价总价/有效供应商家数":'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=参与应标的有效供应商报价总价/有效供应商家数”计算')+'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td style="text-align: left;">基准分：'+(!businessPriceSetData.baseScore?"":businessPriceSetData.baseScore+"分")+'</td>'
						+'<td colspan="2" style="text-align: left;">计价比例：'+(!businessPriceSetData.priceProportion?"":businessPriceSetData.priceProportion+"%")+'</td>'
					+'</tr>'
					+'<tr>'
						+'<td colspan="3" style="text-align: left;">当有效报价高于基准价时，每高于基准价'+(!businessPriceSetData.basePriceProportionHigh?"":businessPriceSetData.basePriceProportionHigh+"%")+'扣'+ (!businessPriceSetData.additionReduceScore1?"":businessPriceSetData.additionReduceScore1+"分") +'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td colspan="3" style="text-align: left;">当有效报价低于基准价时，每低于基准价'+(!businessPriceSetData.basePriceProportionLow?"":businessPriceSetData.basePriceProportionLow+"%")+'扣'+(!businessPriceSetData.additionReduceScore2?"":businessPriceSetData.additionReduceScore2+"分")+'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价得分计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p><strong>基准价</strong>=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例</p>'
						+'<p><strong>N</strong>=[(供应商报价-基准价)/基准价]/基准价比例</p>'
						//+'<p>每高于基准价'+(!businessPriceSetData.basePriceProportionHigh?"":businessPriceSetData.basePriceProportionHigh+"%")+'扣'+(!businessPriceSetData.additionReduceScore1?"":businessPriceSetData.additionReduceScore1+"分")+'，低于基准价'+ (!businessPriceSetData.basePriceProportionLow?"":businessPriceSetData.basePriceProportionLow+"%") +'扣'+ (!businessPriceSetData.additionReduceScore2?"":businessPriceSetData.additionReduceScore2+"分") +'；低于0分按0分计</p>'
						+'<p><strong>商务报价得分</strong>=权重值*（基准分-|N*扣分值|）</p>'				 	
						+'</td>'
					+'</tr>'
	};
	//最低报价为基准法
	if(_c==3){
		Assessment+='<tr>'
		                +'<td class="th_bg">报价评分类型</td>'
						+'<td colspan="3" style="text-align: left;">最低报价为基准法</td>'						
					+'</tr>'
					+'<tr>'
		                +'<input class="form-control" type="hidden" name="businessPriceSetData.businessName" value="最低报价为基准法"/>'
						+'<td class="th_bg">权重值：</td>'	
						+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
						+'<td style="text-align: left;" colspan="3">商务报价分值=100</td>'
					+'</tr>'
					+'<tr>'
						+'<td rowspan="3" class="th_bg" style="border:none">1、商务报价参数：</td>'							
					+'</tr>'
					+'<tr>'
						+'<td colspan="3"  style="text-align: left;width:200px">基准价计算范围：'+(businessPriceSetData.basePriceType==1?"计算价格评审环节中有效供应商的报价":businessPriceSetData.basePriceType==2?'计算所有供应商的报价':'')+'</td>'						
					+'</tr>'
					+'<tr>'
						+'<td style="text-align: left;">每高于基准价'+(!businessPriceSetData.reduceLevel?"":businessPriceSetData.reduceLevel)+'%扣'+(!businessPriceSetData.reduceScore?"":businessPriceSetData.reduceScore+"分")+'</td>'													
						+'<td style="text-align: left;" colspan="3">基准价：供应商最低报价*计价比例'+(!businessPriceSetData.priceProportion?"":businessPriceSetData.priceProportion+"%")+'</td>'
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价得分计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p><strong>商务报价得分</strong>=商务报价分值-N*最小挡扣分</p>'
						+'<p><strong>N</strong>=[(供应商报价-基准价)/基准价]/扣分的最小档次</p>'
						+'<p>说明:当N为小数时，直接进一取整</p>'							
						+'</td>'
					+'</tr>'
	};	
	//价格比较法
	if(_c==4){
		Assessment+='<tr>'
		                +'<td class="th_bg">报价类型</td>'
						+'<td colspan="3" style="text-align: left;">价格比较法</td>'						
					+'</tr>'
					+'<tr>'
						+'<td rowspan="2" class="th_bg">1、商务报价参数</td>'							
					+'</tr>'
					+'<tr>'
						+'<td colspan="3"  style="text-align: left;width:200px;" >上浮比例(一般要求下偏离致供应商报价上浮)：'+(!businessPriceSetData.floatProportion?"":businessPriceSetData.floatProportion+"%")+'</td>'											  
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p>偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</p>'
						+'<p>调整后最终总报价=参与应标的有效供应商报价总价+偏离调整</p>'						
						+'</td>'
					+'</tr>'
	};
	//固定比例不取整法 || 固定比例取整法
	if(_c==5 || _c==6){
		Assessment+='<tr>'
		                +'<td class="th_bg">报价类型</td>'
		                if(_c==5){
							Assessment+='<td colspan="3" style="text-align: left;">固定比例不取整法</td>'
						}else{
							Assessment+='<td colspan="3" style="text-align: left;">固定比例取整法</td>'
						}
					Assessment+='</tr>'
					+'<tr>'
						+'<td class="th_bg">权重值（0~1）</td>'
						+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
						+'<td style="text-align: left;" colspan="3">商务报价分值：'+(businessPriceSetData.baseScore==undefined?"":businessPriceSetData.baseScore)+'</td>'
					+'</tr>'
					if(businessPriceSetData.basePriceType=="3"){
						Assessment+='<tr>'
						+'<td rowspan="4" class="th_bg">1、商务报价参数</td>'							
						+'</tr>'
							+'<tr>'
							+'<td style="text-align: left;">基准价计算范围：手动输入基准价</td>'
							+'<td colspan="2" style="text-align: left;">基准价：'+(businessPriceSetData.basePrice==undefined?"":businessPriceSetData.basePrice)+'</td>'				
						+'</tr>'
					}else{
						if(businessPriceSetData.basePriceRole=="3"){
							Assessment+='<tr>'
								+'<td rowspan="4" class="th_bg">1、商务报价参数</td>'							
							+'</tr>'
								+'<tr>'
								if(businessPriceSetData.basePriceType=="1"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
								}else if(businessPriceSetData.basePriceType=="2"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
								}else{
									Assessment+='<td  style="text-align: left;">基准价计算范围：'				
								}
								Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价的最低报价为基准价'
							+'</tr>'
						}else{
							Assessment+='<tr>'
								+'<td rowspan="5" class="th_bg">1、商务报价参数</td>'							
							+'</tr>'
								+'<tr>'
								if(businessPriceSetData.basePriceType=="1"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
								}else if(businessPriceSetData.basePriceType=="2"){
									Assessment+='<td style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
								}else{
									Assessment+='<td style="text-align: left;">基准价计算范围：'				
								}
								if(businessPriceSetData.basePriceRole=="2"){
									Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例<br>有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例</td>'
								}else{
									Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：</td>'	
								}
							Assessment+='</tr>'
							+'</tr>'
								+'<tr>'
								+'<td  style="text-align: left;">计价比例：'+(businessPriceSetData.priceProportion==undefined?"":businessPriceSetData.priceProportion)+'</td>'				
								+'<td colspan="2" style="text-align: left;">供应商家数(N)：'+ (businessPriceSetData.supplierTotal==undefined?"":businessPriceSetData.supplierTotal) +'</td>'
							+'</tr>'
						}
					}
					Assessment+='</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">每高于基准价1%减分值：'+(businessPriceSetData.additionReduceScore1==undefined?"":businessPriceSetData.additionReduceScore1)+'</td>'				
						+'<td colspan="2" style="text-align: left;">最大减分值：'+ (businessPriceSetData.maxDownScore==undefined?"":businessPriceSetData.maxDownScore+"分") +'</td>'
					+'</tr>'
					+'</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">每低于基准价1%加分值：'+(businessPriceSetData.additionReduceScore2==undefined?"":businessPriceSetData.additionReduceScore2)+'</td>'				
						+'<td colspan="2" style="text-align: left;">最大加分值：'+ (businessPriceSetData.maxUpScore==undefined?"":businessPriceSetData.maxUpScore+"分") +'</td>'
					+'</tr>'
					if(_c==5){
							Assessment+='<tr>'
							+'<td class="th_bg">2、商务报价得分计算公式</td>'
							+'<td colspan="3" style="text-align: left;">'
							+'<p>A、供应商报价高于基准价时：</br>'
				 			+'商务报价得分=(商务报价分值-|(基准价-报价)|/基准价*100*每1%减分值)*权重</br></br>' 
							+'B、供应商报价低于基准价时：</br>' 
							+'商务报价得分=(商务报价分值+|(基准价-报价)|/基准价*100*每1%加分值)*权重</p></br>' 
							+'</td>'
							+'</tr>'
						}else{
							Assessment+='<tr>'
							+'<td class="th_bg">2、商务报价得分计算公式</td>'
							+'<td colspan="3" style="text-align: left;">'
							+'<p>A、供应商报价高于基准价时：</br>' 
							+'商务报价得分=(商务报价分值-⌊ |(基准价-报价)|/基准价*100⌋*每1%减分值)*权重</br></br>' 
							+'B、供应商报价低于基准价时：</br>' 
							+'商务报价得分=(商务报价分值+⌊ |(基准价-报价)|/基准价*100⌋*每1%加分值)*权重</p></br>' 
							+'注：⌊ ⌋为向下取整符号</br></br>' 
							+'</td>'
							+'</tr>'
						}
					
	};
	
	//固定差值法
	if(_c==7){
		Assessment+='<tr>'
		            +'<td class="th_bg">报价类型</td>'
					+'<td colspan="3" style="text-align: left;">固定差值法</td>'						
					+'</tr>'
					+'<tr>'
					+'<td class="th_bg">权重值（0~1）</td>'
					+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
					+'<td style="text-align: left;" colspan="3">商务报价分值：'+(businessPriceSetData.baseScore==undefined?"":businessPriceSetData.baseScore)+'</td>'
					+'</tr>'
					+'<tr>'
					+'<td rowspan="3" class="th_bg">1、商务报价参数</td>'							
					+'</tr>'
					+'<tr>'
					if(businessPriceSetData.basePriceType=="1"){
						Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
					}else if(businessPriceSetData.basePriceType=="2"){
						Assessment+='<td  style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
					}else{
						Assessment+='<td  style="text-align: left;">基准价计算范围：'				
					}
					Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价的最低报价为基准价'
					+'</tr>'
					+'</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">最多减减分值：'+(businessPriceSetData.maxDownScore==undefined?"":businessPriceSetData.maxDownScore)+'</td>'				
						+'<td colspan="2" style="text-align: left;"></td>'
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价得分计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p>商务报价得分=(商务报价分值-(报价-基准价)/(最高报价-基准价)*最多减分)*权重</br>'
						+'</td>'
					+'</tr>'
	};
	
	//直接比较法
	if(_c==8){
		Assessment+='<tr>'
		            +'<td class="th_bg">报价类型</td>'
					+'<td colspan="3" style="text-align: left;">直接比较法</td>'						
					+'</tr>'
					+'<tr>'
					+'<td class="th_bg">权重值（0~1）</td>'
					+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
					+'<td style="text-align: left;" colspan="3">商务报价分值：'+(businessPriceSetData.baseScore==undefined?"":businessPriceSetData.baseScore)+'</td>'
					+'</tr>'
					+'<tr>'
					+'<td rowspan="2" class="th_bg">1、商务报价参数</td>'							
					+'</tr>'
					+'<tr>'
					if(businessPriceSetData.basePriceType=="1"){
						Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
					}else if(businessPriceSetData.basePriceType=="2"){
						Assessment+='<td  style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
					}else{
						Assessment+='<td  style="text-align: left;">基准价计算范围：'				
					}
					Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价的最低报价为基准价'
					+'</tr>'
					+'<tr>'
						+'<td class="th_bg">2、商务报价得分计算公式</td>'
						+'<td colspan="3" style="text-align: left;">'
						+'<p>商务报价得分=基准价/报价*商务报价分值*权重</br>'
						+'</td>'
					+'</tr>'
	};
	
	//评价法
	if(_c==9){
		Assessment+='<tr>'
		            +'<td class="th_bg">报价类型</td>'
					+'<td colspan="3" style="text-align: left;">评价法</td>'
					+'</tr>'
					+'<tr>'
					+'<td class="th_bg">权重值（0~1）</td>'
					+'<td style="text-align: left;">'+ businessPriceSetData.weight +'</td>'						
					+'<td style="text-align: left;" colspan="3">商务报价分值：'+(businessPriceSetData.baseScore==undefined?"":businessPriceSetData.baseScore)+'</td>'
					+'</tr>'
					if(businessPriceSetData.basePriceType=="3"){
						Assessment+='<tr>'
						+'<td rowspan="6" class="th_bg">1、商务报价参数</td>'							
						+'</tr>'
							+'<tr>'
							+'<td style="text-align: left;">基准价计算范围：手动输入基准价</td>'
							+'<td colspan="2" style="text-align: left;">基准价：'+(businessPriceSetData.basePrice==undefined?"":businessPriceSetData.basePrice)+'</td>'
						+'</tr>'
					}else{
						if(businessPriceSetData.basePriceRole=="3"){
							Assessment+='<tr>'
								+'<td rowspan="6" class="th_bg">1、商务报价参数</td>'							
							+'</tr>'
								+'<tr>'
								if(businessPriceSetData.basePriceType=="1"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
								}else if(businessPriceSetData.basePriceType=="2"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
								}else{
									Assessment+='<td  style="text-align: left;">基准价计算范围：</td>'				
								}
								Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价的最低报价为基准价</td>'
							+'</tr>'
						}else{
							Assessment+='<tr>'
								+'<td rowspan="7" class="th_bg">1、商务报价参数</td>'							
							+'</tr>'
								+'<tr>'
								if(businessPriceSetData.basePriceType=="1"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算价格评审环节中有效供应商的报价</td>'				
								}else if(businessPriceSetData.basePriceType=="2"){
									Assessment+='<td  style="text-align: left;">基准价计算范围：计算所有供应商的报价</td>'				
								}else{
									Assessment+='<td  style="text-align: left;">基准价计算范围：'				
								}
								if(businessPriceSetData.basePriceRole=="2"){
									Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例<br>有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例</td>'
								}else{
									Assessment+='<td colspan="2" style="text-align: left;">基准价计算方式：</td>'	
								}
							Assessment+='</tr>'
							+'</tr>'
								+'<tr>'
								+'<td  style="text-align: left;">计价比例：'+(businessPriceSetData.priceProportion==undefined?"":businessPriceSetData.priceProportion)+'</td>'				
								+'<td colspan="2" style="text-align: left;">去最高和最低报价供应商家数：'+ (businessPriceSetData.supplierTotal==undefined?"":businessPriceSetData.supplierTotal+"分") +'</td>'
							+'</tr>'
						}
					}
					Assessment+='</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">高于基准价百分比：'+(businessPriceSetData.basePriceProportionHigh==undefined?"":businessPriceSetData.basePriceProportionHigh)+'</td>'				
						+'<td colspan="2" style="text-align: left;">高于基准价减分值：'+ (businessPriceSetData.additionReduceScore1==undefined?"":businessPriceSetData.additionReduceScore1+"分") +'</td>'
					+'</tr>'
					+'</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">加分区间：'+(businessPriceSetData.addScoreScope==undefined?"":businessPriceSetData.addScoreScope)+'</td>'				
						+'<td colspan="2" style="text-align: left;">最大加分值：'+ (businessPriceSetData.maxUpScore==undefined?"":businessPriceSetData.maxUpScore+"分") +'</td>'
					+'</tr>'
					+'</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">加分区间内加分百分比：'+(businessPriceSetData.basePriceProportionLow==undefined?"":businessPriceSetData.basePriceProportionLow)+'</td>'				
						+'<td colspan="2" style="text-align: left;">加分区间内加分值：'+ (businessPriceSetData.additionReduceScore2==undefined?"":businessPriceSetData.additionReduceScore2+"分") +'</td>'
					+'</tr>'
					+'</tr>'
						+'<tr>'
						+'<td  style="text-align: left;">加分区间外减分百分比：'+(businessPriceSetData.basePriceScale==undefined?"":businessPriceSetData.basePriceScale)+'</td>'				
						+'<td colspan="2" style="text-align: left;">加分区间外减分值：'+ (businessPriceSetData.basePriceNumber==undefined?"":businessPriceSetData.basePriceNumber+"分") +'</td>'
					+'</tr>'
					+'<tr>'
					+'<td class="th_bg">2、商务报价得分计算公式</td>'
					+'<td colspan="3" style="text-align: left;">'
					+'<p>A、供应商报价高于基准价时：</br>'
					+'商务报价得分=商务报价分值-|(基准价-报价)|/基准价*100/每百分比减分*每百分比减分值</br></br>' 
					+'B、供应商报价低于基准价时，且在加分区间内：</br>' 
					+'商务报价得分=商务报价分值+|(基准价-报价)|/基准价*100/每百分比加分*每百分比加分值</p></br>' 
					+'C、供应商报价低于基准价时，在加分区间外部分：</br>' 
					+'商务报价得分=B项得分-(|(基准价-报价)|/基准价-加分区间/100)*100/每百分比减分*每百分比减分值</p></br>' 
					+'注：每种情况计算得出的分数需再乘以权重' 
					+'</td>'
					+'</tr>'
	};
	$('#Assessment').html(Assessment)
};