function montageHtml(){
    var stHtml='<tr>'
                +'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>'
            +'</tr>'
            +'<tr>'
               
                +'<td class="th_bg">包件名称</td>'
                +'<td style="text-align: left;width:320px">'
                +'<div id="packageName"></div>'
                +'</td>'
           
            +'<td   class="th_bg">包件编号</td>'
                +'<td style="text-align: left;width:320px">'
                    +'<div id="packageNum"></div>'
                +'</td>'
            +'</tr>'
            +'<tr>'
				if(!$('#montage').hasClass('JD_view')){
					stHtml+= '<td   class="th_bg">项目类型</td>'
					+'<td style="text-align: left;" >'
						+'<div id="dataTypeName"></div>'				
					+'</td>'
					
					+'<td class="th_bg" >预算价(含税)(元)</td>'
					+'<td  style="text-align: left;">'
						+'<div id="budgetPrice"></div>'       	
					+'</td>'
				}else{
					stHtml+= '<td   class="th_bg">项目类型</td>'
					+'<td style="text-align: left;"  colspan="3">'
					    +'<div id="dataTypeName"></div>'				
					+'</td>'
				}
                  
            stHtml+='</tr>'
            if(packageInfo.agencyDepartmentName){

                stHtml+='<td   class="th_bg">代理机构所属部门</td>'
                +'<td style="text-align: left;" '+ (packageInfo.purchaserDepartmentName==undefined?'colspan="3"':'') +'>'
                    +'<div id="agencyDepartmentName"></div>'				
                +'</td>'
            }
            if(packageInfo.purchaserDepartmentName){

                stHtml+='<td class="th_bg" >采购人所属部门</td>'
                +'<td  style="text-align: left;" '+ (packageInfo.agencyDepartmentName==undefined?'colspan="3"':'') +'>'
                    +'<div id="purchaserDepartmentName"></div>'      	
                +'</td>'
                stHtml+='</tr>'
            }    
            stHtml+='<tr>'

			+'<td   class="th_bg">评审方法</td>'
			+'<td style="text-align: left;">'
				+'<div id="checkPlan"></div>'				
            +'</td>'

            stHtml+='<td  class="th_bg">是否需要报名</td>'
            +'<td style="text-align: left;" >'
                +'<div id="isSign"></div>'
            +'</td>'	
            stHtml+='</tr>';
			if(packageInfo.feeConfirmVersion == 2){
				stHtml+='<tr>'
				+'<td class="th_bg">评审费是否含在代理服务费中</td>'
				+'<td style="text-align: left;" colspan="3" >'
				    +'<div id="feeUnderparty"></div>'
				+'</td>'
				+'</tr>'
			}
            if(packageInfo.isSign==1&&packageInfo.isPaySign==1&&packageInfo.isSellFile==1){
                stHtml+='<tr>'

                stHtml+='<td  class="th_bg">是否需要缴纳报名费</td>'
                +'<td style="text-align: left;" '+ (packageInfo.isSellFile==0?'colspan="3"':'colspan="1"') +'>'
                +'<div id="isPaySign"></div>'
                +'</td>'

                stHtml+='<td  class="th_bg">是否发售采购文件</td>'
                +'<td style="text-align: left;">'
                    +'<div id="isSellFile"></div>'
                +'</td>'
                stHtml+='</tr>' 
            }else{
                if(packageInfo.isSign==1){
                    stHtml+='<tr class="isNoSign">'

                    +'<td  class="th_bg">是否需要缴纳报名费</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isPaySign==0?'colspan="1"':'colspan="3"') +'>'
                    +' <div id="isPaySign"></div>'
                    +'</td>'
                    if(packageInfo.isPaySign==0){

                        stHtml+='<td  class="th_bg isSignDateNone" >报名费(元)</td>'
                        +'<td  style="text-align: left;">'
                            +'<div id="priceBm"></div>'
                        +'</td>'
                    }  
                    stHtml+='</tr>'
                }
                stHtml+='</tr>'
                stHtml+='<tr>'

                stHtml+='<td  class="th_bg">是否发售采购文件</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSellFile==0?'colspan="1"':'colspan="3"') +'>'
                        +'<div id="isSellFile"></div>'
                    +'</td>'
                    if(packageInfo.isSellFile==0){

                        stHtml+='<td class="th_bg" >采购文件费(元)</td>'
                            +'<td style="text-align: left;">'
                                +'<div id="price"></div>'        			
                            +'</td> '
                    }  
                stHtml+='</tr>'
            } 
            //start招标代理服务费
            if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 0){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">固定金额(元)</td>'
            				+'<td><div id="chargeMoney"></div></td>'
            			+'</tr>'
            } else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 1){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            	if(packageInfo.projectServiceFee.isDiscount == 1){
            		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
            	} else {
    				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient"></div></td>'
            	}
            	stHtml+='</tr>'
            }else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 2){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">收取说明</td>'
            				+'<td><div id="collectRemark"></div></td>'
            			+'</tr>'
            }
            //end招标代理服务费 
			if(!$('#montage').hasClass('JD_view')){
				stHtml+='<tr>'
				
				    +'<td  class="th_bg">公开范围</td>'
				    +'<td style="text-align: left;">'
				        +'<div id="isPublic"></div>'
				    +'</td>'
				
				    +'<td  class="th_bg">最少供应商数量</td>'
				    +'<td style="text-align: left;" colspan="3">'
				        +'<div id="supplierCount"></div>'
				    +'</td>'
				+'</tr>'
			}else{
				stHtml+='<tr>'
				
				    +'<td  class="th_bg">公开范围</td>'
				    +'<td style="text-align: left;" colspan="3">'
				        +'<div id="isPublic"></div>'
				    +'</td>'
				+'</tr>'
			}
              
            if(packageInfo.isPublic==3){
                stHtml+='<tr>'

                    +'<td  class="th_bg">供应商分类</td>'
                    +'<td style="text-align: left;" colspan="3">'
                        +'<div id="supplierClassifyName"></div>'
                    +'</td>'                  
                +'</tr>'  
            }
            // if (packageInfo.examType == 1) {
                stHtml += '<tr>'
                    + '<td class="th_bg">CA加解密</td>'
                    + '<td colspan="3">'
                    + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
                    + '</td>'
                +'</tr>' 
            // }
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
				if(packageInfo.bankType){
					stHtml+='<tr>'
					    +'<td class="th_bg">虚拟子账户生成银行</td>'
					    +'<td colspan="3">'
					        +'<div id="bankType"></div>'
					    +'</td>'
					+'</tr>'
				};
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
                
        $("#montage").html(stHtml)
            
}
function examMontageHtml(){
    var stHtml='<tr>'
                +'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>'
            +'</tr>'
            +'<tr>'
                +'<td class="th_bg">包件名称</td>'
                +'<td  style="text-align: left;">'
                +'<div id="packageName"></div>'
                +'</td>'
            +'<td class="th_bg">包件编号</td>'
                +'<td style="text-align: left;">'
                    +'<div id="packageNum"></div>'
                +'</td>'
            +'</tr>'
            +'<tr>'
                +'<td class="th_bg">项目类型</td>'
                +'<td style="text-align: left;">'
                    +'<div id="dataTypeName"></div>'				
                +'</td>'
            +'<td class="th_bg" >资格审查方式</td>'
            +'<td  style="text-align: left;" colspan="3">'
                    +'<div id="examtype">资格预审</div>'            	
                +'</td>' 
            +'</tr>'
            +'<tr>'
			+'<td class="th_bg">评审方法</td>'
			+'<td style="text-align: left;" '+ (packageInfo.isSellPriceFile==0?'colspan="3"':'colspan="1"') +'>'
				+'<div id="checkPlan"></div>'				
            +'</td>'
            if(packageInfo.isSellPriceFile==1){

                stHtml+='<td class="th_bg">是否发售采购文件</td>'
                +'<td style="text-align: left;">'
                    +'<div id="isSellPriceFile"></div>'
                +'</td>'
            }	
            stHtml+='</tr>' 
            if(packageInfo.isSellPriceFile!=1){
                stHtml+='<tr>'

                stHtml+='<td class="th_bg">是否发售采购文件</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSellPriceFile==1?'colspan="3"':'colspan="1"') +'>'
                        +'<div id="isSellPriceFile"></div>'
                    +'</td>'
                    if(packageInfo.isSellPriceFile==0){

                        stHtml+='<td class="th_bg">采购文件费(元)</td>'
                            +'<td style="text-align: left;">'
                                +'<div id="price"></div>'
                            +'</td> '
                    }  
                stHtml+='</tr>'
            }   
            //start招标代理服务费
            if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 0){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">固定金额(元)</td>'
            				+'<td><div id="chargeMoney"></div></td>'
            			+'</tr>'
            } else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 1){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            	if(packageInfo.projectServiceFee.isDiscount == 1){
            		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
            	} else {
    				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient"></div></td>'
            	}
            	stHtml+='</tr>'
            }else if(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType == 2){
            	stHtml += '<tr>'
            				+'<td class="th_bg">采购代理服务费收取方式</td>'
            				+'<td><div id="collectType"></div></td>'
            				+'<td class="th_bg">收取说明</td>'
            				+'<td><div id="collectRemark"></div></td>'
            			+'</tr>'
            }
            //end招标代理服务费
            stHtml+='<tr>'

                +'<td class="th_bg">最少供应商数量</td>'
                +'<td style="text-align: left;" colspan="3">'
                    +'<div id="inviteSupplierCount"></div>'
                +'</td>'
            +'</tr>'
            stHtml += '<tr>'
                + '<td class="th_bg">CA加解密</td>'
                + '<td colspan="3">'
                + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
                + '</td>'
            +'</tr>' 
        $("#montage").html(stHtml)
}