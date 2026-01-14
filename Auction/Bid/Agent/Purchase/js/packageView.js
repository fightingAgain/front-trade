var isPackage;
function montageHtml(){
    var stHtml='<tr>'
                +'<td colspan="4" style="font-weight: bold;" class="active">包件基本信息</td>'
            +'</tr>'
            +'<tr>'     
                +'<td class="th_bg">包件名称</td>'
                +'<td  style="text-align: left;width:320px;">'
                +'<div id="packageName"></div>'
                +'</td>'
            +'<td class="th_bg">包件编号</td>'
                +'<td style="text-align: left;width:320px;">'
                    +'<div id="packageNum"></div>'
                +'</td>'
            +'</tr>'
			+'<tr>'
			    +'<td class="th_bg">系统外编号</td>'
			    +'<td  style="text-align: left;" colspan="3">'
			    +'<div id="outNumber"></div>'
			    +'</td>'
			+'</tr>'
            +'<tr>'
                +'<td class="th_bg">项目类型</td>'
                
				if(!$('#montage').hasClass('JD_view')){
					stHtml+='<td style="text-align: left;">'
					    +'<div id="dataTypeName"></div>'				
					+'</td>'
					+'<td class="th_bg" >预算价(含税)(元)</td>'
					+'<td  style="text-align: left;">'
					    +'<div id="budgetPrice"></div>'       	
					+'</td>' 
				}else{
					stHtml+='<td style="text-align: left;" colspan="3">'
					    +'<div id="dataTypeName"></div>'				
					+'</td>'
				}
                
            stHtml+='</tr>'
            // +'<tr>'
            //     +'<td class="th_bg">项目类型</td>'
            //     +'<td style="text-align: left;">'
            //         +'<div id="dataTypeName"></div>'				
            //     +'</td>'
            //     +'<td class="th_bg" >预算价(不含税)(元)</td>'
            //     +'<td  style="text-align: left;">'
            //         +'<div id="noTaxBudgetPrice"></div>'       	
            //     +'</td>' 
            // +'</tr>'

            // +'<tr>'
            //     +'<td class="th_bg">税率(%)</td>'
            //     +'<td style="text-align: left;">'
            //         +'<div id="taxRate"></div>'				
            //     +'</td>'
            //     +'<td class="th_bg" >预算价(含税)(元)</td>'
            //     +'<td  style="text-align: left;">'
            //         +'<div id="budgetPrice"></div>'       	
            //     +'</td>' 
            // +'</tr>'
            +'<tr>'
            stHtml+='<td class="th_bg">代理机构所属部门</td>'
            +'<td style="text-align: left;">'
                +'<span id="agencyDepartmentName"></span>'         			
                if(isPackage==1&&!isRater){
                    stHtml+='<button type="button"  id="agencyDepartment" class="btn btn-default" data-roleType="1" ><span class="glyphicon glyphicon-saved"></span>选择所属部门</button>'	
                }              			
            stHtml+='</td>'


            stHtml+='<td class="th_bg">采购人所属部门</td>'
            +'<td  style="text-align: left;">'
                +'<span id="purchaserDepartmentName"></span>'                    	
                if(isPackage==1&&!isRater){
                    stHtml+='<button type="button" id="purchaserDepartment" class="btn btn-default" data-roleType="2"><span class="glyphicon glyphicon-saved"></span>选择所属部门</button>'
                }	    	
            stHtml+='</td>'    
            stHtml+='</tr>' 
            if(examType == 1 && projectType == '0'){
				stHtml+='<tr>';
					stHtml+='<td class="th_bg">清单文件</td>';
					stHtml+='<td style="text-align: left;"><span id="isHasDetailedListFile"></span></td>';
					stHtml+='<td class="th_bg">控制价</td>';
					stHtml+='<td style="text-align: left;"><span id="isHasControlPrice"></span></td>';
				stHtml+='</tr>';
			}
            stHtml+='<tr>'

			+'<td class="th_bg">评审方法</td>'
			+'<td style="text-align: left;">'
				+'<div id="checkPlan"></div>'				
            +'</td>'
            if(examType==0&&packageInfo.examCheckPlan==1){


                stHtml+='<td class="th_bg">最多保留供应商数</td>'
                +'<td style="text-align: left;">'
                    +'<div id="keepNum"></div>'				
                +'</td>'
            }else{


                stHtml+='<td class="th_bg">是否需要报名</td>'
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


                stHtml+='<td class="th_bg">是否需要报名</td>'
                +'<td style="text-align: left;" '+ ((packageInfo.isSign==1&&packageInfo.isPaySign==1)||(packageInfo.isSign==0&&packageInfo.isSellFile==1)?'colspan="1"':'colspan="3"') +'>'
                    +'<div id="isSign"></div>'
                +'</td>'
                if(packageInfo.isSign==1&&packageInfo.isPaySign==1){


                    stHtml+='<td class="th_bg">是否需要缴纳报名费</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSign!=0||packageInfo.isSellFile!=1?'colspan="3"':'colspan="1"') +'>'
                    +'<div id="isPaySign"></div>'
                    +'</td>'
                }
                if(packageInfo.isSign==0&&packageInfo.isSellFile==1){


                    stHtml+='<td class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                        +'<td style="text-align: left;">'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                } 
                stHtml+='</tr>'
                if(packageInfo.isSign!=1||packageInfo.isPaySign!=1){
                    if(packageInfo.isSign==1){
                        stHtml+='<tr class="isNoSign">'


                        +'<td class="th_bg">是否需要缴纳报名费</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isPaySign==0?'colspan="1"':'colspan="3"') +'>'
                        +' <div id="isPaySign"></div>'
                        +'</td>'
                        if(packageInfo.isPaySign==0){


                            stHtml+='<td  class="th_bg isSignDateNone">报名费(元)</td>'
                            +'<td  style="text-align: left;">'
                                +'<div id="priceBm"></div>'
                            +'</td>'
                        } 
                        stHtml+='</tr>'
                    }
                }
                if(packageInfo.isSign!=0||packageInfo.isSellFile!=1){
                    stHtml+='<tr>'


                    stHtml+='<td class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){


                            stHtml+='<td class="th_bg" >'+ (examType==0? '资格预审':'采购') +'文件费(元)</td>'
                                +'<td style="text-align: left;">'
                                    +'<div id="price"></div>'        			
                                +'</td> '
                        }  
                    stHtml+='</tr>'
                }
            }else{
                if(packageInfo.isSign==1&&packageInfo.isPaySign==1&&packageInfo.isSellFile==1){
                    stHtml+='<tr>'


                    stHtml+='<td class="th_bg">是否需要缴纳报名费</td>'
                    +'<td style="text-align: left;" '+ (packageInfo.isSellFile==0?'colspan="3"':'colspan="1"') +'>'
                    +'<div id="isPaySign"></div>'
                    +'</td>'


                    stHtml+='<td class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                    +'<td style="text-align: left;">'
                        +'<div id="isSellFile"></div>'
                    +'</td>'
                    stHtml+='</tr>' 
                }else{
                    if(packageInfo.isSign==1){
                        stHtml+='<tr class="isNoSign">'

                        +'<td class="th_bg">是否需要缴纳报名费</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isPaySign==0?'colspan="1"':'colspan="3"') +'>'
                        +' <div id="isPaySign"></div>'
                        +'</td>'
                        if(packageInfo.isPaySign==0){


                            stHtml+='<td  class="th_bg isSignDateNone">报名费(元)</td>'
                            +'<td  style="text-align: left;">'
                                +'<div id="priceBm"></div>'
                            +'</td>'
                        } 
                        stHtml+='</tr>'
                    }
                    stHtml+='<tr>'


                    stHtml+='<td  class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){


                            stHtml+='<td class="th_bg">'+ (examType==0? '资格预审':'采购') +'文件费(元)</td>'
                                +'<td style="text-align: left;">'
                                    +'<div id="price"></div>'        			
                                +'</td> '
                        }  
                    stHtml+='</tr>'
                }
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


                    +'<td class="th_bg">公开范围</td>'
                    

					if(!$('#montage').hasClass('JD_view')){
						stHtml+='<td style="text-align: left;">'
						    +'<div id="isPublic"></div>'
						+'</td>'
						+'<td class="th_bg">最少供应商数量</td>'
						+'<td style="text-align: left;" colspan="3">'
							+'<div id="supplierCount"></div>'
						+'</td>'
					}else{
						stHtml+='<td style="text-align: left;" colspan="3">'
						    +'<div id="isPublic"></div>'
						+'</td>'
					}
                stHtml+='</tr>'
                if (packageInfo.examType == 1) {
                    stHtml += '<tr>'
                        + '<td class="th_bg">CA加解密</td>'
                        + '<td colspan="3">'
                        + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
                        + '</td>'
                    +'</tr>'
                }
            if(packageInfo.isPublic==3){
                stHtml+='<tr>'


                    +'<td class="th_bg">供应商分类</td>'
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
           
            if(packageInfo.options.length>0){
                stHtml+='<tr id="optionNamesdwTr" style="display: none;">'
                +'<td class="th_bg">发布媒体</td>'
                +'<td colspan="3" style="text-align: left;">'
                    +'<div id="optionNamesdw"></div>'
                +'</td>'
                +'</tr>'
        }   
        $("#montage").html(stHtml); 
        if(isPackage==1){
            //代理机构编辑所属部门
           $("#agencyDepartment").department({
               parameter:{
                   packageId:packageInfo.id,
                   departmentIDOld:packageInfo.agencyDepartmentId,
                   departmentNameOld:packageInfo.agencyDepartmentName,   
               },//接口调用的基本参数
               roleType:1,//1代理机构，2采购人
               statusId:top.enterpriseId,//身份id，
               inputName:'agencyDepartmentName',//数据回显的id
               tenderType:0,//0是询比，1是竞价，2是竞卖，4是招标，6是单一来源   
           })
           //采购人编辑所属部门
           $("#purchaserDepartment").department({
               parameter:{
                   packageId:packageInfo.id,
                   departmentIDOld:packageInfo.purchaserDepartmentId,
                   departmentNameOld:packageInfo.purchaserDepartmentName,   
               },//接口调用的基本参数
               roleType:2,//1代理机构，2采购人
               isMust:false,//是否为必选
               statusId:packageInfo.purchaserId,//身份id，
               inputName:'purchaserDepartmentName',//数据回显的id
               tenderType:0,//0是询比，1是竞价，2是竞卖，4是招标，6是单一来源   
           })
       }  
}