function montageHtml(){
    var stHtml=""
    
    stHtml+='<tr>'			
        stHtml+='<td class="th_bg">是否需要报名</td>'
        +'<td style="text-align: left;" colspan="3">'
            +'<div id="isSign"></div>'
        +'</td>'	
    stHtml+='</tr>'
    if(packageInfo.isSign==1&&packageInfo.isPaySign==1&&packageInfo.isSellFile==1){
        stHtml+='<tr>'
        stHtml+='<td class="th_bg">是否需要缴纳报名费</td>'
        +'<td style="text-align: left;width:320px" '+ (packageInfo.isSellFile==0?'colspan="3"':'colspan="1"') +'>'
        +'<div id="isPaySign"></div>'
        +'</td>'
        stHtml+='<td class="th_bg">是否发售采购文件</td>'
        +'<td style="text-align: left;width:320px">'
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
        stHtml+='</tr>'
        stHtml+='<tr>'
        stHtml+='<td class="th_bg">是否发售采购文件</td>'
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
    if(packageInfo.isPayDeposit==0){
		stHtml+='<tr>'
			+'<td class="th_bg">保证金缴纳方式</td>'
			+'<td style="width:320px">'
				+'<div id="payMethod"></div>'
			+'</td>'
			+'<td class="th_bg">保证金金额(元)</td>'
			+'<td style="width:320px">'
				+'<div id="priceBz" style="display:none;"></div>'
				+'<input  name="depositPrice"  oninput="verifyMoney(this, 2)" class="form-control priceNumber"  priceType="保证金金额"/>'
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
        +'<td style="text-align: left;">'
            +'<div id="isPublic"></div>'
        +'</td>'
        +'<td class="th_bg">最少供应商数量</td>'
        +'<td style="text-align: left;" colspan="3">'
            stHtml+='<div class="btn-group" role="group" id="isSupplierCount">'            	   
                +'<button type="button" class="btn btn-default" id="reduceNum" style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>'
                +'<input type="text" class="btn btn-default" value="1"  name="supplierCount" id="supplierCount" readonly="readonly" style="width: 60px;">	'			  
                +'<button type="button" class="btn btn-default" id="addNum" style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>'
            +'</div>'
        +'</td>'
    +'</tr>'
    // if (packageInfo.examType == 1) {
        stHtml += '<tr>'
            + '<td class="th_bg">CA加解密</td>'
            + '<td colspan="3">'
            + '<span id="encipherStatusLabel">' + (packageInfo.encipherStatus == 1 ? '是' : '否')+ '</span>'
            + '</td>'
        +'</tr>'
    // }
    if(packageInfo.isPublic==3){
        stHtml+='<tr>'
            +'<td class="th_bg">供应商分类</td>'
            +'<td style="text-align: left;" colspan="3">'
                +'<div id="supplierClassifyName"></div>'
            +'</td>'                  
        +'</tr>'  
    }   
    $("#montage").html(stHtml);
    $('#reduceNum').on('click',function(){
        var obj = $("input[name='supplierCount']");
        if (obj.val() <= 1) {
            obj.val(1);
        } else {
            obj.val(parseInt(obj.val()) - 1);
        }
        obj.change();
    })
    $('#addNum').on('click',function(){
        var obj = $("input[name='supplierCount']");
        obj.val(parseInt(obj.val()) + 1);
        obj.change();
    });         
}