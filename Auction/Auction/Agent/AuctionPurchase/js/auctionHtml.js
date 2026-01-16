/*
 */ 
var typeAll=0;
function auctionTypeBtn(type){
    typeAll=type;
    var html=""
    if(type==0){
    	$("#taxBudgetPriceTd .red").show(); //预算价(含税)(元)必填
        $(".auctionType02").hide();
        html+='<tr>'
        html+='<td class="th_bg">竞价类型<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="auctionModel" value="0" checked="checked"/>按包件'
        html+='<input type="radio" name="auctionModel" value="1"/>按明细'
        html+='</td>'
        html+='<td class="th_bg">竞价时长（分）<i class="red">*</i></td>'
        html+='<td class="isPriceL" style="text-align: left;width:320px">'
        html+='<input type="radio" name="auctionDuration" value="10" checked="checked" />10'
        html+='<input type="radio" name="auctionDuration" value="15" />15'
        html+='<input type="radio" name="auctionDuration" value="30" />30'
        html+='<input type="radio" name="auctionDuration" value="60" />60'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td class="th_bg">限时（分）<i class="red">*</i></td>'
        html+='<td style="text-align: left;" class="searched">'
        html+='<div class="btn-group" role="group">'
        html+='<button type="button" class="btn btn-default" id="reduceNum" style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-minus"aria-hidden="true"></span></button>'
        html+='<input type="text" class="btn btn-default" name="timeLimit" id="timeLimit" value="5"style="width: 60px;">'
        html+='<button type="button" class="btn btn-default" id="addNum"style="width: 40px;height: 34px;"><span class="glyphicon glyphicon-plus"aria-hidden="true"></span></button>'
        html+='</div>'
        html+='</td>'
        html+='<td colspan="2" class="red" style="text-align: left;font-size: 12px;">'
        html+='竞价时长结束后的限时时间。在此期间内若有报价，则从头开始限时。若无则限时结束竞价结束'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td class="th_bg">总时长（分）</td>'
        html+='<td style="text-align: left;">'
        html+='<input type="text" class="form-control" name="maxAuctionTime" id="maxAuctionTime">'
        html+='</td>'
        html+='<td class="th_bg auctionModelShow">是否设置竞价起始价 <i class="red">*</i></td>'
        html+='<td class="auctionModelShow" style="text-align: left;" colspan="3">'
        html+='<input type="radio" name="isPrice" value="0" />是'
        html+='<input type="radio" name="isPrice" value="1" checked="checked" />否'
        html+='</td>'
        html+='</tr>'
        html+='<tr class="auctionModelShow rawPriceshow" style="display:none">'
        html+='<td class="th_bg">竞价起始价(元)<i class="red">*</i></td>'
        html+='<td><input type="text" name="rawPrice" id="rawPrice" oninput="verifyMoney(this, 2)" priceType="竞价起始价" class="form-control priceNumber" /></td>'
        html+='<td class="th_bg" style="width: 200px;">降价幅度（元）<i class="red">*</i></td>'
        html+='<td style="text-align: left;">'
        html+='<input type="text" name="priceReduction" id="priceReduction" oninput="verifyMoney(this, 2)" priceType="降价幅度" class="form-control priceNumber" />'
        html+='</td>'
        html+='</tr>' 
        $(".auctionTypeContent").html('自由竞价是指竞价项目设置竞价开始时间、竞价时长、降价幅度等竞价要素，符合要求的供应商在竞价开始时之后进行报价操作；供应商可多次报价，系统以供应商最后一次确认的报价做为最终报价；报价截止后，按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商；若无供应商参与报价，竞价失败')
    }else if(type==1){
    	$("#taxBudgetPriceTd .red").show();  //预算价(含税)(元)必填
        $(".auctionType02").hide();
        html+='<tr>'
        html+='<td class="th_bg">竞价类型<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+= '<input type="radio" name="auctionModel" value="0" checked="checked"/>按包件'
        html+='<input type="radio" name="auctionModel" value="1"/>按明细'
        html+='</td>'
        html+='<td class="th_bg">竞价时长（分）<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="auctionDuration" value="10" checked="checked" />10'
        html+='<input type="radio" name="auctionDuration" value="15" />15'
        html+='<input type="radio" name="auctionDuration" value="30" />30'
        html+='<input type="radio" name="auctionDuration" value="60" />60'
        html+='</td>'
        html+='</tr>'
        html+='<tr class="auctionModelShow">'
        html+='<td class="th_bg">是否设置竞价起始价 <i class="red">*</i></td>'
        html+='<td style="text-align: left;" class="isPriceCol" colspan="3">'
        html+='<input type="radio" name="isPrice" value="0" />是'
        html+='<input type="radio" name="isPrice" value="1" checked="checked" />否'
        html+='</td>'
        html+='<td style="width: 200px; display:none" class="th_bg rawPriceshow">竞价起始价(元)<i class="red">*</i></td>'
        html+='<td class="rawPriceshow" style="display:none"><input type="text" name="rawPrice" id="rawPrice" oninput="verifyMoney(this, 2)" priceType="竞价起始价" class="form-control priceNumber" /></td>'
        html+='</tr>'
        $(".auctionTypeContent").html('单轮竞价是指竞价项目设置竞价开始时间、竞价时长等竞价要素，符合要求的供应商在竞价开始时间之后进行报价操作；供应商仅可报价一次；报价截止后，按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商（如果出现供应商报价均为最低，则先报价者优先）；若无供应商参与报价，竞价失败')
    }else if(type==5||type==2||type==3){
    	$("#taxBudgetPriceTd .red").show();  //预算价(含税)(元)必填
        $(".auctionType02").show();
        html+='<tr>'
        html+='<td class="th_bg">每轮竞价间隔时间（分）<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="intervalTime" value="5" checked="checked" />5'
        html+='<input type="radio" name="intervalTime" value="10" />10'
        html+='<input type="radio" name="intervalTime" value="15" />15'
        html+='</td>'
        html+='<td class="th_bg">设置淘汰方式<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="outType" value="0" checked="checked"/>公告中设置'
        html+='<input type="radio" name="outType" value="1"/>每轮间隔时间设置'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td class="th_bg">第1轮竞价时长(分) <i class="red">*</i></td>'
        html+='<td colspan="3" style="text-align: left;">'
        html+='<input type="radio" name="firstAuctionTime" value="10" checked="checked" />10'
        html+='<input type="radio" name="firstAuctionTime" value="15" />15'
        html+='<input type="radio" name="firstAuctionTime" value="30" />30'
        html+='<input type="radio" name="firstAuctionTime" value="60" />60'
        html+='</td>'
        html+='</tr>'
        html+='<tr class="Supplier">'
        html+='<td class="th_bg">第1轮淘汰供应商数<i class="red">*</i></td>'
        html+='<td style="text-align: left;">'
        html+='<input type="text" name="firstOutSupplier" id="firstOutSupplier" class="form-control supplierNum" />'
        html+='</td>'
        html+='<td class="th_bg">第1轮最低保留供应商数 <i class="red">*</i></td>'
        html+='<td style="text-align: left;">'
        html+='<input type="text" name="firstKeepSupplier" id="firstKeepSupplier" class="form-control supplierNum" />'
        html+='</td>'
        html+='</tr>' 
        html+='<tr>'
        html+='<td class="th_bg">第2轮竞价时长(分)<i class="red">*</i> </td>'
        html+='<td colspan="3" style="text-align: left;">'
        html+='<input type="radio" name="secondAuctionTime" value="10" checked="checked" />10'
        html+='<input type="radio" name="secondAuctionTime" value="15" />15'
        html+='<input type="radio" name="secondAuctionTime" value="30" />30'
        html+='<input type="radio" name="secondAuctionTime" value="60" />60'
        html+='</td>'
        html+='</tr>'
        if(type==3){
			html+='<tr class="Supplier">'
			html+='<td class="th_bg">第2轮淘汰供应商数<i class="red">*</i></td>'
			html+='<td style="text-align: left;width:320px">'
			html+='<input type="text" name="secondOutSupplier" id="secondOutSupplier" class="form-control supplierNum" />'
			html+='</td>'
			html+='<td class="th_bg">第2轮最低保留供应商数 <i class="red">*</i></td>'
			html+='<td style="text-align: left;width:320px">'
			html+='<input type="text" name="secondKeepSupplier" id="secondKeepSupplier" class="form-control supplierNum" />'
			html+='</td>'
			html+='</tr>'
			html+='<tr>'
			html+='<td class="th_bg">第3轮竞价时长(分) <i class="red">*</i></td>'
			html+='<td colspan="3" style="text-align: left;">'
			html+='<input type="radio" name="thirdAuctionTime" value="10" checked="checked" />10'
			html+='<input type="radio" name="thirdAuctionTime" value="15" />15'
			html+='<input type="radio" name="thirdAuctionTime" value="30" />30'
			html+='<input type="radio" name="thirdAuctionTime" value="60" />60'
			html+='</td>'
			html+='</tr>'
        }
        html+='<tr>'
        html+='<td rowspan="2" class="th_bg">'
        html+='每轮淘汰供应商数设置:'
        html+='</td>'
        html+='<td colspan="3" style="text-align: left;">'
        html+='<input type="radio" name="outSupplier" value="0" checked="checked" />按实际报价供应商数淘汰'
        html+='<input type="radio" name="outSupplier" value="1" />按参与供应商数淘汰'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td colspan="3" class="red" style="text-align: left;">'
        html+='<p><strong>按实际报价供应商数淘汰</strong>是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；'
        html+='</p>'
        html+='<p><strong>按参与供应商数淘汰</strong>是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。'
        html+='</p>'
        html+='</td>'
        html+='</tr>'
		html+='<tr class="auctionModelShow">'
        html+='<td class="th_bg">是否设置竞价起始价 <i class="red">*</i></td>'
        html+='<td style="text-align: left;" class="isPriceCol" colspan="3">'
        html+='<input type="radio" name="isPrice" value="0" />是'
        html+='<input type="radio" name="isPrice" value="1" checked="checked" />否'
        html+='</td>'
        html+='<td style="width: 200px; display:none" class="th_bg rawPriceshow">竞价起始价(元)<i class="red">*</i></td>'
        html+='<td class="rawPriceshow" style="display:none"><input type="text" name="rawPrice" id="rawPrice" oninput="verifyMoney(this, 2)" priceType="竞价起始价" class="form-control priceNumber" /></td>'
        html+='</tr>'
		html+='<tr class="auctionModelShow rawPriceshow" style="display:none">'
		html+='<td class="th_bg">是否设置降价幅度 <i class="red">*</i></td>'
		html+='<td style="text-align: left;" colspan="3">'
		html+='<input type="radio" name="isPriceReduction" value="0" />是'
		html+='<input type="radio" name="isPriceReduction" value="1" checked="checked" />否'
		html+='</td>'
		html+='<td style="width: 200px; display:none" class="th_bg isPriceReduction">降价幅度(元)<i class="red">*</i></td>'
		html+='<td class="isPriceReduction" style="display:none"><input type="text" name="priceReduction" id="priceReduction" oninput="verifyMoney(this, 2)" priceType="降价幅度" class="form-control priceNumber" /></td>'
		html+='</tr>'
        $(".auctionTypeContent").html('多轮竞价是指竞价项目设置竞价开始时间、竞价时长等竞价要素，符合要求的供应商（首轮报价若无供应商参与竞价，则竞价终止）在每轮报价开始时间与每轮报价截止时间之间进行报价操作，每轮报价截止时间后公布当前最低报价结果，最多三轮报价轮次（后一轮报价起始价为前一轮最低报价），直到最后一轮结束后。再按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商')
    }else if(type==4){
        $(".auctionType02").hide();
        $("#taxBudgetPriceTd .red").show();  //预算价(含税)(元)必填
        html+= '<tr>'
        html+='<td style="width: 200px !important;" class="th_bg">每轮竞价间隔时间（分）<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="intervalTime" value="5" checked="checked" />5'
        html+=' <input type="radio" name="intervalTime" value="10" />10'
        html+='<input type="radio" name="intervalTime" value="15" />15'
        html+='</td>'
        html+='<td style="width: 200px !important;" class="th_bg">每轮竞价时长（分）<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+= '<input type="radio" name="auctionDuration" value="10" checked="checked" />10'
        html+='<input type="radio" name="auctionDuration" value="15" />15'
        html+= '<input type="radio" name="auctionDuration" value="30" />30'
        html+='<input type="radio" name="auctionDuration" value="60" />60'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td style="width: 200px !important;" class="th_bg">淘汰方式<i class="red">*</i></td>'
        html+='<td colspan="3" style="text-align: left;">'
        html+='<table style="width:800px;" class="table table-bordered">'
        html+='<tr>'
        html+='<td style="text-align: left;border: none;">'
        html+='首轮报价供应商数'
        html+='<select id="sel_0" style="width: 80px;height: 26px;" name="countType"onchange="changeSel(0)">'
        html+='<option value="0">大于等于</option>'
        html+='<option value="1">大于</option>'
        html+='</select>'
        html+='<input type="text" style="width:50px" onblur="setOutType(0,0)" id="supplierCount_0"'
        html+='name="countValue" />家时，每轮淘汰'
        html+='<input type="text" style="width:50px" id="outCount_0" name="outValue" />家<span'
        html+='id="span0">供应商；</span>'
        html+='<span id="span1" style="display: none;">，每轮至少保留<input type="text" style="width: 50px;"name="keepValue0" class="lastKeep" id="firstKeep" />家供应商；</span>'
        html+=' </td>'
        html+='<td>'
        html+='<a href="javascript:void(0)" onclick="setOutType(100000,1)" class="btn btn-primary"id="btnAddOutType">添 加</a>'
        html+='<a href="javascript:void(0)" onclick="resetOutType()" class="btn btn-primary">重 置</a>'
        html+='</td>'
        html+= '</tr>'
        html+='<tbody id="tbOutType"></tbody>'
        html+='<tr id="trOutType">'
        html+='<td style="text-align: left;border-top: none;" colspan="2">'
        html+='首轮报价供应商数'
        html+='<select id="sel_last" style="width: 80px;height: 26px;" disabled="disabled">'
        html+='<option value="0">小于</option>'
        html+='<option value="1">小于等于</option>'
        html+='</select>'
        html+='<input type="text" style="width:50px" disabled="disabled" id="lastCount" />家时，每轮淘汰'
        html+='<input type="text" style="width: 50px;" id="lastout" />家；'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td style="text-align: left;" colspan="2">每轮至少保留<input type="text" style="width: 50px;"'
        html+='name="keepValue1" id="lastKeep" class="lastKeep" />家供应商</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td colspan="2" style="text-align: left;">'
        html+='当剩余供应商数小于等于淘汰家数与保留家数之和 <input type="radio" name="lastOutType" value="0"checked="checked" />一轮淘汰，保留<span class="lastkp">1</span>家'
        html+='<input type="radio" name="lastOutType" value="1" />每轮淘汰1家直至剩余<span class="lastkp">1</span>家'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td style="text-align: left" colspan="2">'
        html+='每轮淘汰供应商数的取值方式:'
        html+='<input type="radio" name="outSupplier" value="0"checked="checked" />按实际报价供应商数淘汰'
        html+='<input type="radio" name="outSupplier" value="1" />按参与供应商数淘汰'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+=' <td colspan="2" class="red" style="text-align: left;">'
        html+='<p><strong>按实际报价供应商数淘汰</strong>是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；'
        html+='</p>'
        html+= '<p><strong>按参与供应商数淘汰</strong>是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。'
        html+='</p>'
        html+='</td>'
        html+='</tr>'
        html+='</table>'
        html+='</td>'
        html+='</tr>'
		html+='<tr class="auctionModelShow">'
        html+='<td class="th_bg">是否设置竞价起始价 <i class="red">*</i></td>'
        html+='<td style="text-align: left;" class="isPriceCol" colspan="3">'
        html+='<input type="radio" name="isPrice" value="0" />是'
        html+='<input type="radio" name="isPrice" value="1" checked="checked" />否'
        html+='</td>'
        html+='<td style="width: 200px; display:none" class="th_bg rawPriceshow">竞价起始价(元)<i class="red">*</i></td>'
        html+='<td class="rawPriceshow" style="display:none"><input type="text" name="rawPrice" id="rawPrice" oninput="verifyMoney(this, 2)" priceType="竞价起始价" class="form-control priceNumber" /></td>'
        html+='</tr>'
        html+='<tr class="auctionModelShow rawPriceshow" style="display:none">'
        html+='<td class="th_bg">是否设置降价幅度 <i class="red">*</i></td>'
        html+='<td style="text-align: left;" colspan="3">'
        html+='<input type="radio" name="isPriceReduction" value="0" />是'
        html+='<input type="radio" name="isPriceReduction" value="1" checked="checked" />否'
        html+='</td>'
        html+='<td style="width: 200px; display:none" class="th_bg isPriceReduction">降价幅度(元)<i class="red">*</i></td>'
        html+='<td class="isPriceReduction" style="display:none"><input type="text" name="priceReduction" id="priceReduction" oninput="verifyMoney(this, 2)" priceType="降价幅度" class="form-control priceNumber" /></td>'
        html+='</tr>'
		$(".auctionTypeContent").html('不限轮次竞价是指竞价项目设置竞价开始时间、竞价时长等竞价要素，符合要求的供应商（首轮报价若无供应商参与竞价，则竞价终止）在每轮报价开始时间与每轮报价截止时间之间进行报价操作，每轮报价截止时间后公布当前最低报价结果，后一轮报价起始价为前一轮最低报价，直到满足竞价设置要求后结束。再按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商')
    }else if(type==6||type==7){
        $(".auctionType02").hide();
        $("#taxBudgetPriceTd .red").hide();//预算价(含税)(元)不必填
        html+='<tr>'
        html+='<td class="th_bg">预算价(不含税)(元)<i class="red">*</i></td>'
        html+='<td style="text-align: left;" colspan="3">'
        html+='<input  class="form-control priceNumber" oninput="verifyMoney(this, 2)" id="noTaxBudgetPrice" name="noTaxBudgetPrice"  priceType="预算价(不含税)" />'
        html+='</td>'
        html+='</tr>'
        html+='<tr>'
        html+='<td class="th_bg">竞价类型<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        if(type==6){
            html+='<input type="radio" name="auctionModel" value="2" checked="checked"/>按总价排序后议价'
            html+='<input type="radio" name="auctionModel" value="3" />按总价最低中选'        
            html+='<input type="radio" name="auctionModel" value="1"/>按明细'
        }else if(type==7){
            html+='<input type="radio" name="auctionModel" value="3" checked="checked"/>按总价最低中选'
        }     
        html+='</td>'
        html+='<td class="th_bg">是否显示预算价<i class="red">*</i></td>'
        html+='<td style="text-align: left;width:320px">'
        html+='<input type="radio" name="budgetIsShow" value="0" checked="checked" />否'
        html+='<input type="radio" name="budgetIsShow" value="1" />是'
        html+='</td>'
        html+='</tr>'
        
        html+='<tr class="detailed_list">'
        html+='<td class="th_bg">项目清单文件'+(type==6 ? '<i class="red">*</i>' : '') + '</td>'
        html+='<td style="text-align: left;">'  
        if(type==6){
            html+='<input type="file" class="fileloading" name="files" id="detailedList" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />'
            html+='</td>'
            html+='<td style="text-align: left;">'
            html+='<input style="padding: 5px 15px ;" type="button" value="下载清单报价模板" class="btn btn-primary" onclick=" excelDownload()" />'
            html+='</td>'
            html+='<td style="text-align: left;"><span class="red">注只能上传Excel文件（后缀为.xls或.xlsx）</span></td>'
        }else if(type==7){
            html+='<input type="file" class="fileloading" name="files" id="singlebidedList" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />'
            html+='</td>'
            html+='<td style="text-align: left;" colspan="2"><span class="red">注只能上传Excel文件（后缀为.xls或.xlsx）</span></td>'
        }  
        html+='</tr>'
        html+='<tr id="tr_operation_table">'
        html+='<td colspan="4">'
        if(type==6){
            html+='<table class="table table-hover table-bordered" id="detaillist_operation_table"></table>'
        }else if(type==7){
            html+='<table class="table table-hover table-bordered" id="singlebidlist_operation_table"></table>'
        }   
        html+='</td>'
        html+='</tr>'
        // $(".auctionTypeContent").html('① 根据各供应商报价，分别明确各项最低报价；② 按照各供应商总报价金额由低到高进行排序，按排序分别进行议价，若第1名同意以各项最低报价成交，则推荐第1名中选，并不再继续与其他供应商议价；若第1名不同意成交，则与第2名议价，若第2名同意成交，则推荐第2名中选，并不再继续与其他厂家议价；依次类推，直至确定候选供应商。③ 经议价，若各供应商均不同意以“各项最低报价”成交，则推荐总报价最低的供应商中选；④ 一家供应商中选。')
        $(".auctionTypeContent").html('根据各供应商报价，推荐总价最低的供应商中选，即一家供应商中选（可议价）');
    }
    $('#auctionHtml').html(html)
   //清单报价附件初始化
    if(type==6){
        $('.operation_ades').hide()
        oFileInput.Init("detailedList", urlSaveAuctionFile, 'JJ_AUCTION_SPECIFICATION', 'detaillist_operation_table', false);
    }else if(type==7){
        $('.operation_ades').hide()
        oFileInput.Init("singlebidedList", urlSaveAuctionFile, 'JJ_AUCTION_SINGLE_OFFERES', 'singlebidlist_operation_table', false);
    }else{
        $('.operation_ades').show()
    }
    if (filesDataDetail.length > 0) {
		$(".detailed_list").hide()

	} else {
		$(".detailed_list").show()
	}
    if (type == 4) {
        if (auctionOutTypeData.length > 0) {
            $("#sel_0 option").eq(auctionOutTypeData[0].countType).attr("selected", true);
            $("#supplierCount_0").val(auctionOutTypeData[0].countValue);
            $("#outCount_0").val(auctionOutTypeData[0].outValue)

            if (auctionOutTypeData[0].countValue == 0) {
                $("#tbOutType").html("");
                $("#lastCount").val("");
                totalCount = 0;
                $("#span0").hide();
                $("#span1").show();
                $("#firstKeep").val(auctionOutTypeData[0].keepValue)
                $("#trOutType").hide();
                $("#btnAddOutType").hide();
                return;
            };
            if (auctionOutTypeData.length > 2) {
                if (auctionOutTypeData[auctionOutTypeData.length - 2].countType == 0) {
                    $("#sel_last option[value='0']").attr("selected", "selected");
                } else {
                    $("#sel_last option[value='1']").attr("selected", "selected");
                }
            } else if (auctionOutTypeData.length == 2) {
                if (auctionOutTypeData[0].countType == 0) {
                    $("#sel_last option[value='0']").attr("selected", "selected");
                } else {
                    $("#sel_last option[value='1']").attr("selected", "selected");
                }
            }
            $("#lastCount").val(auctionOutTypeData[auctionOutTypeData.length - 1].countValue)
            $("#lastout").val(auctionOutTypeData[auctionOutTypeData.length - 1].outValue)
            $("#lastKeep").val(auctionOutTypeData[auctionOutTypeData.length - 1].keepValue)
            $(".lastkp").html(auctionOutTypeData[auctionOutTypeData.length - 1].keepValue)
            if (auctionOutTypeData.length > 2) {
                if (auctionOutTypeData[auctionOutTypeData.length - 2].countType == 0) {
                    $("#sel_last option[value='0']").attr("selected", "selected");
                } else {
                    $("#sel_last option[value='1']").attr("selected", "selected");
                }
                totalCount = auctionOutTypeData.length - 2;
                var strSel = '<select [id] style="width: 80px;height: 26px;" [onchange]>';
                strSel += '<option value="0">大于等于</option><option value="1">大于</option></select>';
                //var strHtml="";          
                for (var i = 1; i < auctionOutTypeData.length - 1; i++) {
                    supplierCount = $("#supplierCount_" + (i - 1)).val();
                    if (supplierCount == "") {
                        return;
                    }
                    if (supplierCount == "") {
                        top.layer.alert("请先填写第" + (1 + i) + "行的条件值！");
                        return;
                    }
                    var strHtml = '<tr><td style="text-align: left;" colspan="2">首轮报价供应商数： ';
                    strHtml += '<select id="selTemp_' + i + '" style="width: 80px;height: 26px;" disabled="disabled">';
                    if (auctionOutTypeData[i - 1].countType == 0) {
                        strHtml += '<option value="0">小于</option><option value="1">小于等于</option></select>';
                    } else {
                        strHtml += '<option value="1">小于等于</option><option value="0">小于</option></select>';
                    }
                    strHtml += ' <input type="text" style="width:50px" disabled="disabled" id="supplierCountTemp_' + i + '" value="' + auctionOutTypeData[i - 1].countValue + '" />';
                    strHtml += '且' + strSel.replace('[id]', 'id="sel_' + i + '"').replace('[onchange]', 'onchange="changeSel(' + i + ')"');
                    strHtml += ' <input type="text" style="width:50px" onblur="setOutType(' + i + ',2)" id="supplierCount_' + i + '" value="' + auctionOutTypeData[i].countValue + '"/>';
                    strHtml += '家时，每轮淘汰';
                    strHtml += '<input type="text" style="width:50px" id="outCount_' + i + '" value="' + auctionOutTypeData[i].outValue + '"/>';
                    strHtml += '家供应商；';		    
                    strHtml += '<input type="hidden" name="auctionOutTypes[' + i + '].countType" value="' + auctionOutTypeData[i].countType + '"/>';
                    strHtml +=  '<input type="hidden" name="auctionOutTypes[' + i + '].countValue" value="' + auctionOutTypeData[i].countValue + '"/>';
                    strHtml +=  '<input type="hidden" name="auctionOutTypes[' + i + '].outValue" value="' + auctionOutTypeData[i].outValue + '"/>';
                    $("#tbOutType").append(strHtml);
                    $("#sel_" + i + " option").eq(auctionOutTypeData[i].countType).attr("selected", true);
                    $('#supplierCount_' + i).on('blur', function () {
                        $('input[name="auctionOutTypes[' + i + '].countValue"]').val($(this).val())
                    });
                    $('#outCount_' + i).on('blur', function () {
                        $('input[name="auctionOutTypes[' + i + '].outValue"]').val($(this).val())
                    });
                }


            }
        }
    }
}
$('#auctionHtml').on('click',"input[name='auctionModel']",function(){  
    if(typeAll==6){
        if($(this).val()==1){
            $(".auctionTypeContent").html('根据各供应商报价，推荐各分项最低报价的供应商分别中选，即可多家供应商中选（可议价）')
        }else if($(this).val()==2){
            $(".auctionTypeContent").html('① 根据各供应商报价，分别明确各项最低报价；② 按照各供应商总报价金额由低到高进行排序，按排序分别进行议价，若第1名同意以各项最低报价成交，则推荐第1名中选，并不再继续与其他供应商议价；若第1名不同意成交，则与第2名议价，若第2名同意成交，则推荐第2名中选，并不再继续与其他厂家议价；依次类推，直至确定候选供应商。③ 经议价，若各供应商均不同意以“各项最低报价”成交，则推荐总报价最低的供应商中选；④ 一家供应商中选。')
        }else if($(this).val()==3){
            $(".auctionTypeContent").html(' 根据各供应商报价，推荐总价最低的供应商中选，即一家供应商中选（可议价）')    
        }
    }else{
        if($(this).val()==0){
            $(".auctionModelShow").show();
            $('input[name="isPrice"][value="1"]').prop('checked',true);
            $('.isPriceCol').attr('colspan','3');
            $(".rawPriceshow").hide();
            
        }else{
            $(".auctionModelShow").hide();
            $('input[name="isPrice"]').prop('checked',false);
            $("#priceReduction").val("");
            $("#rawPrice").val("");
            
        }
    }
})
$('#auctionHtml').on('click','input[name="isPrice"]', function () {
	$('[name="isPriceReduction"]').val([1]);
    if($(this).val()==0){
        $(".rawPriceshow").show();
        $('.isPriceCol').attr('colspan','1');
    }else{
        $('.isPriceCol').attr('colspan','3');
        $(".rawPriceshow").hide();
        $("#priceReduction").val("");
        $("#rawPrice").val("");
    }
})
$('#auctionHtml').on('click','input[name="outType"]', function () {
    if($(this).val()==0){
        $(".Supplier").show();
    }else{       
        $(".Supplier").hide();
        $(".supplierNum").val("");       
    }
})
//$('#auctionHtml').on('click','input[name="budgetIsShow"]', function () {
//  if($(this).val()==0){
//      $(".isBudgetIsShow").hide();
//  }else{      
//      $(".isBudgetIsShow").show();
//      $("#noTaxBudgetPrice").val("");        
//  }
//})
//限时
$('#auctionHtml').on('click','#reduceNum', function () {
	var obj = $("#timeLimit");
	if (obj.val() <= 0) {
		obj.val(0);
	} else {
		obj.val(parseInt(obj.val()) - 1);
	}
	obj.change();
})
$('#auctionHtml').on('click','#addNum', function () {
	var obj = $("#timeLimit");
	obj.val(parseInt(obj.val()) + 1);
	obj.change();
})
//第一轮的数字验证
$('#auctionHtml').on('change',"#firstOutSupplier", function () {
	if ($(this).val() != "") {
		if (!(/^\+?[0-9][0-9]*$/.test($(this).val()))) {
			parent.layer.alert("第1轮淘汰供应商数必须为不小于零的整数");
			$(this).val("")
		};
	}
});
$('#auctionHtml').on('change',"#firstKeepSupplier", function () {
	if ($(this).val() != "") {
		if (!(/^\+?[1-9][0-9]*$/.test($(this).val()))) {
			parent.layer.alert("第1轮最低保留供应商数必须为大于零的整数");
			$(this).val("")
		};
	}
})
$('#auctionHtml').on('change',"#secondOutSupplier", function () {
	if ($(this).val() != "") {
		if (!(/^\+?[0-9][0-9]*$/.test($(this).val()))) {
			parent.layer.alert("第2轮淘汰供应商数必须为不小于零的整数");
			$(this).val("")
		};
	}
})
$('#auctionHtml').on('change', "#secondKeepSupplier",function () {
	if ($(this).val() != "") {
		if (!(/^\+?[1-9][0-9]*$/.test($(this).val()))) {
			parent.layer.alert("第2轮最低保留供应商数必须大于零");
			$(this).val("")
		};
	}
})
$('#auctionHtml').on('change', "#priceReduction",function () {
	if ($(this).val() != "") {
		if (!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			parent.layer.alert("降价幅度必须大于零且最多两位小数");
			$(this).val("");

			return
		};
		var b = (parseInt($(this).val() * 1000000) / 1000000).toFixed(top.prieNumber || 2);
		$(this).val(b);
	};
});
$('#auctionHtml').on('change', "#rawPrice",function () {
	if ($(this).val() != "") {

		if (!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			parent.layer.alert("竞价起始价必须大于零且最多两位小数");
			$(this).val("");

			return
		};
		var b = (parseInt($(this).val() * 1000000) / 1000000).toFixed(top.prieNumber || 2);
		$(this).val(b);
	};
});
//是否设置降价幅度
$('#auctionHtml').on('click','input[name="isPriceReduction"]', function () {
    if($(this).val()==0){
		$(this).closest('td').attr('colspan','1');
        $(".isPriceReduction").show();
    }else{
		$(this).closest('td').attr('colspan','3');
        $(".isPriceReduction").hide();
        $("#priceReduction").val("");       
    }
});

