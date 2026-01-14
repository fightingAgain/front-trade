var isPackage;
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
                +'<td style="width:200px;"  class="th_bg">系统外编号</td>'
                +'<td style="text-align: left;" colspan="3">'
                    +'<div id="outNumber"></div>'				
                +'</td>'
            +'</tr>'
            +'<tr>'
                +'<td style="width:200px;"  class="th_bg">项目类型</td>'
                +'<td style="text-align: left;">'
                    +'<div id="dataTypeName"></div>'				
                +'</td>'
                +'<td class="th_bg" style="width:200px;">预算价(不含税)(元)</td>'
                +'<td  style="text-align: left;">'
                    +'<div id="noTaxBudgetPrice"></div>'       	
                +'</td>'
            +'</tr>'
            +'<tr>'
                +'<td style="width:200px;"  class="th_bg">税率(%)</td>'
                +'<td style="text-align: left;">'
                    +'<div id="taxRate"></div>'				
                +'</td>'
                +'<td class="th_bg" style="width:200px;">预算价(含税)(元)</td>'
                +'<td  style="text-align: left;">'
                    +'<div id="budgetPrice"></div>'       	
                +'</td>'
            +'</tr>'
            // 项目审核页面，查看评审报告-包件信息
            stHtml+='<tr><td class="th_bg" style="width:200px;">采购人所属部门</td>'
            +'<td  style="text-align: left;" colspan="3">'
                +'<span id="purchaserDepartmentName"></span>'      	
            stHtml+='</td></tr>'
			if(examType == 1 && projectType == '0'){
				stHtml+='<tr>';
					stHtml+='<td class="th_bg">清单文件</td>';
					stHtml+='<td style="text-align: left;"><span id="isHasDetailedListFile"></span></td>';
					stHtml+='<td class="th_bg">控制价</td>';
					stHtml+='<td style="text-align: left;"><span id="isHasControlPrice"></span></td>';
				stHtml+='</tr>';
			}
            stHtml+='<tr>'
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
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
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
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){
                            stHtml+='<td class="th_bg" style="width:200px;">'+ (examType==0? '资格预审':'采购') +'文件费(元)</td>'
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
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
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
                    stHtml+='<td style="width:200px;" class="th_bg">是否发售'+ (examType==0? '资格预审':'采购') +'文件</td>'
                        +'<td style="text-align: left;" '+ (packageInfo.isSellFile==1?'colspan="3"':'colspan="1"') +'>'
                            +'<div id="isSellFile"></div>'
                        +'</td>'
                        if(packageInfo.isSellFile==0){
                            stHtml+='<td class="th_bg" style="width:200px;">'+ (examType==0? '资格预审':'采购') +'文件费(元)</td>'
                                +'<td style="text-align: left;">'
                                    +'<div id="price"></div>'        			
                                +'</td> '
                        }  
                    stHtml+='</tr>'
                }
            }            
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
                        +'<td >'
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
                // 去掉包件里发布媒体显示
                if(packageInfo.options.length>0){
                    stHtml+='<tr id="optionNamesdwTr" style="display:none">'
                    +'<td class="th_bg">发布媒体</td>'
                    +'<td colspan="3" style="text-align: left;">'
                        +'<div id="optionNamesdw"></div>'
                    +'</td>'
                    +'</tr>'
                }   
        $("#montage").html(stHtml);  
}