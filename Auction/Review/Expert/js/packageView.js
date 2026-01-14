function montageHtml(){
    var stHtml='<tr>'
                +'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>'
            +'</tr>'
            +'<tr>'
                +'<td style="width:200px;"  class="th_bg">包件名称</td>'
                +'<td  style="text-align: left;width:280px;">'
                +'<div id="packageName"></div>'
                +'</td>'
            +'<td style="width:200px;"  class="th_bg">包件编号</td>'
                +'<td style="text-align: left;">'
                    +'<div id="packageNum"></div>'
                +'</td>'
            +'</tr>'
            +'<tr>'
                +'<td style="width:200px;"  class="th_bg">项目类型</td>'
                +'<td style="text-align: left;">'
                    +'<div id="dataTypeName"></div>'				
                +'</td>'
                +'<td class="th_bg" style="width:200px;">预算价(含税)(元)</td>'
                +'<td  style="text-align: left;">'
                    +'<div id="budgetPrice"></div>'       	
                +'</td>'  
            +'</tr>'
            +'<tr>'
            +'<tr>'
            if(projectData.isAgent==1){
                stHtml+='<td style="width:200px;"  class="th_bg">代理机构所属部门</td>'
                +'<td style="text-align: left;">'
                    +'<span id="agencyDepartmentName"></span>'
                stHtml+='</td>'
            }
            stHtml+='<td class="th_bg" style="width:200px;">采购人所属部门</td>'
            +'<td  style="text-align: left;" '+ (projectData.isAgent!=1?'colspan="3"':'')+'>'
                +'<span id="purchaserDepartmentName"></span>'                  	
            stHtml+='</td>'    
            stHtml+='</tr>' 
            +'<tr>'
			+'<td style="width:200px;"  class="th_bg">评审方法</td>'
			+'<td style="text-align: left;">'
				+'<div id="checkPlan"></div>'				
            +'</td>'
            if(examType==0&&packageInfo.examCheckPlan==1){
                stHtml+='<td style="width:200px;" class="th_bg">最多保留供应商数</td>'
                +'<td style="text-align: left;">'
                    +'<div id="keepNum"></div>'				
                +'</td>'
            }else{
                stHtml+='<td style="width:200px;" class="th_bg">是否需要报名</td>'
                +'<td style="text-align: left;" >'
                    +'<div id="isSign"></div>'
                +'</td>'
            }	
            stHtml+='</tr>'
			if(packageInfo.feeConfirmVersion == 2){
				stHtml+='<tr>'
				+'<td class="th_bg">评审费是否含在代理服务费中</td>'
				+'<td style="text-align: left;" colspan="3" >'
					+'<div id="feeUnderparty"></div>'
				+'</td>'
				+'</tr>'
			}
            if(examType==0&&packageInfo.examCheckPlan==1){
                stHtml+='<tr>'
                stHtml+='<td style="width:200px;" class="th_bg">是否需要报名</td>'
                +'<td style="text-align: left;" '+ ((packageInfo.isSign==1&&packageInfo.isPaySign==1)||(packageInfo.isSign==0&&packageInfo.isSellFile==1)?'colspan="1"':'colspan="3"') +'>'
                    +'<div id="isSign"></div>'
                +'</td>'
                if(packageInfo.isSign==1&&packageInfo.isPaySign==1){
                    stHtml+='<td style="width:200px;" class="th_bg">是否需要缴纳报名费</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSign!=0||packageInfo.isSellFile!=1?'colspan="3"':'colspan="1"') +'>'
                    +'<div id="isPaySign"></div>'
                    +'</td>'
                }
                if(packageInfo.isSign==0&&packageInfo.isSellFile==1){
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'报价') +'文件</td>'
                        +'<td style="text-align: left;">'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                } 
                stHtml+='</tr>'
                if(packageInfo.isSign!=1||packageInfo.isPaySign!=1){
                    if(packageInfo.isSign==1){
                        stHtml+='<tr class="isNoSign">'
                        +'<td style="width:200px;" class="th_bg">是否需要缴纳报名费</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isPaySign==0?'colspan="1"':'colspan="3"') +'>'
                        +' <div id="isPaySign"></div>'
                        +'</td>'
                        if(packageInfo.isPaySign==0){
                            stHtml+='<td  class="th_bg isSignDateNone" style="width:200px;">报名费(元)</td>'
                            +'<td  style="text-align: left;">'
                                +'<div id="priceBm"></div>'
                            +'</td>'
                        } 
                        stHtml+='</tr>'
                    }
                }
                if(packageInfo.isSign!=0||packageInfo.isSellFile!=1){
                    stHtml+='<tr>'
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'报价') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){
                            stHtml+='<td class="th_bg" style="width:200px;">'+ (examType==0? '资格预审':'报价') +'文件(元)</td>'
                                +'<td style="text-align: left;">'
                                    +'<div id="price"></div>'        			
                                +'</td> '
                        }  
                    stHtml+='</tr>'
                }
            }else{
                if(packageInfo.isSign==1&&packageInfo.isPaySign==1&&packageInfo.isSellFile==1){
                    stHtml+='<tr>'
                    stHtml+='<td style="width:200px;" class="th_bg">是否需要缴纳报名费</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSellFile==0?'colspan="3"':'colspan="1"') +'>'
                    +'<div id="isPaySign"></div>'
                    +'</td>'
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'报价') +'文件</td>'
                    +'<td style="text-align: left;">'
                        +'<div id="isSellFile"></div>'
                    +'</td>'
                    stHtml+='</tr>' 
                }else{
                    if(packageInfo.isSign==1){
                        stHtml+='<tr class="isNoSign">'
                        +'<td style="width:200px;" class="th_bg">是否需要缴纳报名费</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isPaySign==0?'colspan="1"':'colspan="3"') +'>'
                        +' <div id="isPaySign"></div>'
                        +'</td>'
                        if(packageInfo.isPaySign==0){
                            stHtml+='<td  class="th_bg isSignDateNone" style="width:200px;">报名费(元)</td>'
                            +'<td  style="text-align: left;">'
                                +'<div id="priceBm"></div>'
                            +'</td>'
                        } 
                        stHtml+='</tr>'
                    }
                    stHtml+='<tr>'
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'报价') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){
                            stHtml+='<td class="th_bg" style="width:200px;">'+ (examType==0? '资格预审':'报价') +'文件(元)</td>'
                                +'<td style="text-align: left;">'
                                    +'<div id="price"></div>'        			
                                +'</td> '
                        }  
                    stHtml+='</tr>'
                }
            }
            //start招标代理服务费
            if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 0){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">固定金额(元)</td>'
            				+'<td><div id="chargeMoney"></div></td>'
            			+'</tr>'
            } else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 1){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            	if(packageInfo.projectServiceFee.isDiscount == 1){
            		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
            	} else {
    				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient"></div></td>'
            	}
            	stHtml += '</tr>'
            }else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 2){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">收取说明</td>'
            				+'<td style="white-space:normal;word-break:break-all;"><div id="collectRemark"></div></td>'
            			+'</tr>'
            }
            //end招标代理服务费
            stHtml+='<tr>'
                    +'<td style="width:200px;" class="th_bg">公开范围</td>'
                    +'<td style="text-align: left;">'
                        +'<div id="isPublic"></div>'
                    +'</td>'
                    +'<td style="width:200px;" class="th_bg">最少供应商数量</td>'
                    +'<td style="text-align: left;" colspan="3">'
                        +'<div id="supplierCount"></div>'
                    +'</td>'
                +'</tr>'
                if (packageInfo.examType == 1 || packageInfo.inviteState == 1) {
                    stHtml += '<tr>'
                        + '<td class="th_bg">CA加解密</td>'
                        + '<td colspan="3">'
                        + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
                        + '</td>'
                    +'</tr>'
                }
            if(packageInfo.isPublic==3){
                stHtml+='<tr>'
                    +'<td style="width:200px;" class="th_bg">供应商分类</td>'
                    +'<td style="text-align: left;" colspan="3">'
                        +'<div id="supplierClassifyName"></div>'
                    +'</td>'                  
                +'</tr>'  
            }                  
            if(packageInfo.isPayDeposit==0){
				stHtml+='<tr>'
					+'<td class="th_bg">保证金缴纳方式</td>'
					+'<td>'
						+'<div id="payMethod"></div>'
					+'</td>'
					+'<td class="th_bg">保证金金额(元)</td>'
					+'<td style="width: 150px;">'
						+'<div id="priceBz"></div>'
					+'</td>'                   
				+'</tr>'
                stHtml+='<tr class="isDepositShow">'
                	+'<td class="th_bg">保证金收取机构</td>'
                	+'<td>'
                		+'<div id="agentType"></div>'
                	+'</td>'
                	+'<td class="th_bg">保证金账户名</td>'
                	+'<td>'
                		+'<div id="bankAccount"></div>'
                	+'</td>'
                +'</tr>'
                +'<tr class="isDepositShow">'
                	+'<td class="th_bg">保证金开户银行</td>'
                	+'<td>'
                		+'<div id="bankName"></div>'
                	+'</td>'
                	+'<td class="th_bg">保证金账号</td>'
                	+'<td>'
                		+'<div id="bankNumber"></div>'
                	+'</td>'						
                +'</tr>'                                             
            } 
//          if(examType==1){
//              stHtml+='<tr >'
//              +'<td class="th_bg">是否需要提供分项报价表</td>'
//              +'<td colspan="3" style="text-align: left;">'
//                  +'<div id="isOfferDetailedItem"></div>'
//              +'</td>'
//              +'</tr>'
//              +'<tr>'
//                  +'<td class="th_bg">报价注意事项</td>'
//                  +'<td colspan="3">'
//                      +'<div id="offerAttention"></div>'
//                  +'</td>'                      						
//              +'</tr>'
//          }
            if(packageInfo.options.length>0){
                stHtml+='<tr >'
                +'<td class="th_bg">发布媒体</td>'
                +'<td colspan="3" style="text-align: left;">'
                    +'<div id="optionNamesdw"></div>'
                +'</td>'
                +'</tr>'
            }    
        $("#montage").html(stHtml);
            
}
function examMontageHtml(){
    var stHtml='<tr>'
                +'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>'
            +'</tr>'
            +'<tr>'
                +'<td style="width:200px;"  class="th_bg">包件名称</td>'
                +'<td  style="text-align: left;">'
                +'<div id="packageName"></div>'
                +'</td>'
            +'<td style="width:200px;"  class="th_bg">包件编号</td>'
                +'<td style="text-align: left;">'
                    +'<div id="packageNum"></div>'
                +'</td>'
            +'</tr>'
			+'<td style="width:200px;"  class="th_bg">评审方法</td>'
			+'<td style="text-align: left;">'
				+'<div id="checkPlan"></div>'				
            +'</td>'
            +'<td style="width:250px;" class="th_bg">最少供应商数量</td>'
            +'<td style="text-align: left;">'
                +'<div id="inviteSupplierCount"></div>'
            +'</td>'
            stHtml+='</tr>' 
            stHtml+='<tr>'
            stHtml+='<td style="width:200px;" class="th_bg">是否发售报价文件</td>'
                +'<td style="text-align: left;" '+ (packageInfo.isSellPriceFile==1?'colspan="3"':'colspan="1"') +'>'
                    +'<div id="isSellPriceFile"></div>'
                +'</td>'
                if(packageInfo.isSellPriceFile==0){
                    stHtml+='<td class="th_bg" style="width:200px;">报价文件(元)</td>'
                        +'<td style="text-align: left;">'
                            +'<div id="price"></div>'        			
                        +'</td> '
                }  
            stHtml+='</tr>';
        //start招标代理服务费
            if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 0){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">固定金额(元)</td>'
            				+'<td><div id="chargeMoney"></div></td>'
            			+'</tr>'
            } else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 1){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            	if(packageInfo.projectServiceFee.isDiscount == 1){
            		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
            	} else {
    				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient"></div></td>'
            	}
            	stHtml += '</tr>'
            }else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 2){
            	stHtml += '<tr class="tenderTypeW">'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">收取说明</td>'
            				+'<td style="white-space:normal;"><div id="collectRemark"></div></td>'
            			+'</tr>'
            }
            if (packageInfo.examType == 1 || packageInfo.inviteState == 1) {
                stHtml += '<tr>'
                    + '<td class="th_bg">CA加解密</td>'
                    + '<td colspan="3">'
                    + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
                    + '</td>'
                +'</tr>'
            }
            //end招标代理服务费
        $("#montage").html(stHtml)
}
var pricelist=top.config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
function getProjectPrice(isShowSupplier){
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageId,
	   		"projectId":projectId,
	   	},
	   	success:function(data){	
			   //initMoney();
			if(data.success){
				var packagePrice=data.data;
				if(packagePrice.length>0){					
					for(var z=0;z<packagePrice.length;z++){
						if(purExamType==0&&examType==0){
							if(packagePrice[z].priceName=="资格预审文件费"){
								$("#price").html(packagePrice[z].price);
							}
						}else{
							if(packagePrice[z].priceName=="采购文件费"){
                                $("#price").html(packagePrice[z].price);                               
							}
						}
						if(packagePrice[z].priceName=="报名费"){
							//报名费
							$("#priceBm").html(packagePrice[z].price);			
						}
						if(packagePrice[z].priceName=="平台服务费"){
							optionTextPing=packagePrice[z];				
						}
						if(packagePrice[z].priceName=="项目保证金"){
							$("#priceBz").html(packagePrice[z].price);
							$("#payMethod").html(packagePrice[z].payMethod===0?'虚拟子账号':'指定银行');
							if(packagePrice[z].payMethod===0){
								if( examType == 1 && isShowSupplier == 1){
									$('.bondList').show();
									getBondInfo();
								}
								$('.isDepositShow').hide();
							}else{
								$('.bondList').hide();
							}
							if(packagePrice[z].agentType==0){
								$("#agentType").html("平台");
							}else if(packagePrice[z].agentType==1){
								$("#agentType").html("代理机构");
							}else if(packagePrice[z].agentType==2){
								$("#agentType").html("采购人");
							};
							$("#bankAccount").html(packagePrice[z].bankAccount);
							$("#bankName").html(packagePrice[z].bankName);
							$("#bankNumber").html(packagePrice[z].bankNumber);
						}
					};   
				};
				// 资格预审文件费(元)或采购文件费(元)
					  	
			}		
	   	}  
	});
}