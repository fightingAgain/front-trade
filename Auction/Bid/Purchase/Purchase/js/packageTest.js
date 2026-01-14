function testDatans(){
	if($("#checkPlan").html()=="最低评标价法"||$("#checkPlan").html()=="最低投标价法"||$("#checkPlan").html()=="经评审的最低投标价法"){
		if($("#deviate").val()===""){
		return "请填写允许最大偏离项数";
		}
		if(!(/^[1-9]\d*$/.test($("#deviate").val()))&&parseInt($("#deviate").val())<=0){
			return "允许最大偏离项数正整数";
		}
		for(var i=0;i<packageCheckListInfo.length;i++){
			if(packageCheckListInfo[i].checkType==2){				
				if(parseInt(packageCheckListInfo[i].deviate)>parseInt($("#deviate").val())){
					return '评审项'+packageCheckListInfo[i].checkName+"的允许最大偏离项数大于了包件的允许最大偏离项数,请修改";
				};
			}
							
		}
	};	
	if(packageCheckListInfo.length==0){
		return "请添加评审项";
	};
   var envelopeLevel1=[],envelopeLevel2=[],isShadowMark2=[];
	for(var i=0;i<packageCheckListInfo.length;i++){
		if(packageCheckListInfo[i].checkType != 4 && packageCheckListInfo[i].PackageCheckItems.length==0){
			return '评审项'+packageCheckListInfo[i].checkName+"没有添加评价项,请添加";
	   };
	   if(packageCheckListInfo[i].scoreTotal<100&&packageCheckListInfo[i].checkType==1){
		   return	'评审项'+packageCheckListInfo[i].checkName+'的分值之和不足100，请添加';        	     		
	   
	   };
	   
	   if(parseFloat(packageCheckListInfo[i].scoreTotal)<=parseFloat(packageCheckListInfo[i].lowerScore)&&packageCheckListInfo[i].checkType==3){
			   return  '评审项'+packageCheckListInfo[i].checkName+'评审项分值合计'+packageCheckListInfo[i].scoreTotal+'分小于或等于设置的供应商淘汰分值'+packageCheckListInfo[i].lowerScore+'分,请修改';        	     		
		   
	   };
	   if(packageCheckListInfo[i].envelopeLevel==1){
		   envelopeLevel1.push(packageCheckListInfo[i])
	   }	
	   if(packageCheckListInfo[i].envelopeLevel==2){
		   envelopeLevel2.push(packageCheckListInfo[i])
	   }
	   if(packageCheckListInfo[i].isShadowMark==1&&packageCheckListInfo[i].checkType != 4){
		   isShadowMark2.push(packageCheckListInfo[i])
	   };		
	}
   if($("input[name='doubleEnvelope']:checked").val()==1){
	   if(envelopeLevel1.length==0){
		   return "请添加第一信封的评审项";
	   }
	   if(envelopeLevel2.length==0){
		   return "请添加第二信封的评审项";
	   }
   }
   if($("input[name='isOpenDarkDoc']:checked").val()==1){
	   if(isShadowMark2.length==0){
		   return "请添加至少一条为暗标的评审项";
	   }
   }
	if($('input[name="checkType"]:checked').val()==""||$('input[name="checkType"]:checked').val()==undefined){
	   return "请选择报价评分类型";
	}
	  if($('input[name="checkType"]:checked').val()==0){
				if($("#businessName").val()==""){
				 return "自定义评分名称不能为空";
				};
			/*if($("#businessContent").val()==""){
				 return "商务报价计算方法不能为空";
			};*/
			   if($("#businessContent").val() == ""){
				 return "商务报价计算方法不能为空";
				};
		  
		 }
		if($('input[name="checkType"]:checked').val()==1){
			if($("#reduceLevel").val()==""){
				 return "扣分的最小档次不能为空";
		   };
		 if($("#reduceLevel").val()>100){
			   return "扣分的最小档次不能大于100";
		  };
			if($("#reduceScore").val()==""){
				 return "最小档扣分不能为空";
	   };
			if($("#reduceScore").val()>=100){
			   return "最小档扣分不能超过100分";
		   };
			 if($("#basePrice").val()==""){
				 return "基准价不能为空";
			 };
			 if($("#offerRange").val()==""){
				 return "有效报价范围不能为空";
		   };
		   if($("#offerRange").val()>100){
			   return "有效报价范围不能大于100";
			  };
			
		 }
		if($('input[name="checkType"]:checked').val()==2){
			
			if($('input[name="basePriceRole"]:checked').val()==""||$('input[name="basePriceRole"]:checked').val()==undefined){
				
				return "请选择计算规则";
			}
			if($('input[name="basePriceType"]:checked').val()==""||$('input[name="basePriceType"]:checked').val()==undefined){
				
				return "请选择基准价计算范围";
			}
			if($("#baseScore").val()==""){
			   return "基准分不能为空";
		   }else{
			   if($("#baseScore").val()>100){
				   return "基准分不得超过100分";
			   };
		   };				 
				if($("#priceProportion").val()==""){
				 return "计价比例不能为空";
		   };
		   if($("#priceProportion").val()>100){
			   return "计价比例不能大于100";
		   };
				if($("#basePriceProportionHigh").val()==""){
				 return "高于基准价不能为空";
		   };
		   if($("#basePriceProportionHigh").val()>100){
			   return "高于基准价不能大于100";
		   };	
			   if($("#additionReduceScore1").val()==""){
				 return "高于基准价时的扣分不能为空";
		   };
		   if($("#additionReduceScore1").val()>100){
			   return "高于基准价时的扣不能超过100分";
		   };
			   if($("#basePriceProportionLow").val()==""){
				 return "低于基准价不能为空";
		   };
		   if($("#basePriceProportionLow").val()>100){
			   return "低于基准价不能大于100";
		   };	
			   if($("#additionReduceScore2").val()==""){
				 return "低于基准价时的扣分不能为空";
		   };
		   if($("#additionReduceScore2").val()>100){
			   return "低于基准价时的扣分不能超过100分";
		   };
				if($("#offerRange").val()==""){
				 return "有效报价范围不能为空";
		   };
		   if($("#offerRange").val()>100){
			   return "有效报价范围不能大于100";
			  };	 
		}
		if($('input[name="checkType"]:checked').val()==3){
			if($('input[name="basePriceType"]:checked').val()==""||$('input[name="basePriceType"]:checked').val()==undefined){
				return "请选择基准价计算范围";
			}
			 if($("#reduceLevels").val()==""){
				 return "高于基准价不能为空";
		   };
			if($("#reduceLevels").val()>100){
			   return "高于基准价不能大于100";
		   };
			if($("#reduceScores").val()==""){
				 return "高于基准价时的扣分不能为空";
		   };
			if($("#reduceScores").val()>100){
			   return "高于基准价时的扣分不能大于100";
		  };
			 if($("#priceProportion").val()==""){
				 return "计价比例不能为空";
		   };
			if($("#priceProportion").val()>100){
			   return "计价比例不能大于100";
		  };
		 }
		if($('input[name="checkType"]:checked').val()==4){
			 if($("#floatProportion").val()==""){
				 return "上浮比例不能为空";
		   };
		   if($("#floatProportion").val()>100){
			   return "上浮比例不能大于100";
		   };
	 }
	if($('input[name="checkType"]:checked').val() == 5 || $('input[name="checkType"]:checked').val() == 6) {
	   if($("#baseScore").val() == "") {
		   return "商务报价分值不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() == undefined || $('input[name="basePriceType"]:checked').val() == "") {
		   return "基准价计算范围不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() != "3") {
		   if($('input[name="basePriceRole"]:checked').val() == undefined || $('input[name="basePriceRole"]:checked').val() == "") {
			   return "基准价计算方式不能为空";
		   };
		   if($('input[name="basePriceRole"]:checked').val() == "2") {
			   if($("#priceProportion").val() == "") {
				   return "计价比例不能为空";
			   };
			   if(parseFloat($("#priceProportion").val())>100){
				   return "计价比例不能大于100";
			   };
			   if($("#supplierTotal").val() == "") {
				   return "供应商家数不能为空";
			   };
			   if(!(/^[1-9]\d*$/.test($("#supplierTotal").val()))){
				   return "供应商家数不能为小数";
			   }
			   if(parseFloat($("#supplierTotal").val()) <3) {
				   return "供应商家数不能小于3";
			   };
		   };
	   }else{
		   if($("#basePrice").val() =="") {
			   return "基准价不能为空";
		   };
	   }
	   if($("#additionReduceScore1").val() == "") {
		   return "高于基准价减分值不能为空";
	   };
	   if($("#maxDownScore").val() == "") {
		   return "最大减分值不能为空";
	   };
	   if(parseFloat($("#additionReduceScore1").val())>parseFloat($("#maxDownScore").val())){
		   return "每1%减分值不能大于最大减分值";
	   }
	   if($("#additionReduceScore2").val() == "") {
		   return "低于基准价加分值不能为空";
	   };
	   if($("#maxUpScore").val() == "") {
		   return "最大加分值不能为空";
	   };
	   if(parseFloat($("#additionReduceScore2").val())>parseFloat($("#maxUpScore").val())){
		   return "每1%加分值不能大于最大加分值";
	   }
   }
   
   if($('input[name="checkType"]:checked').val() == 7) {
	   if($("#baseScore").val() == "") {
		   return "商务报价分值不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() == undefined || $('input[name="basePriceType"]:checked').val() == "") {
		   return "基准价计算范围不能为空";
	   };
	   if($("#maxDownScore").val() == "") {
		   return "最多减分值不能为空";
	   };
   }
   if($('input[name="checkType"]:checked').val() == 8) {
	   if($("#baseScore").val() == "") {
		   return "商务报价分值不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() == undefined || $('input[name="basePriceType"]:checked').val() == "") {
		   return "基准价计算范围不能为空";
	   };
   }
   if($('input[name="checkType"]:checked').val() == 9) {
	   if($("#baseScore").val() == "") {
		   return "商务报价分值不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() == undefined || $('input[name="basePriceType"]:checked').val() == "") {
		   return "基准价计算范围不能为空";
	   };
	   if($('input[name="basePriceType"]:checked').val() != "3") {
		   if($('input[name="basePriceRole"]:checked').val() == undefined || $('input[name="basePriceRole"]:checked').val() == "") {
			   return "基准价计算方式不能为空";
		   };
		   if($('input[name="basePriceRole"]:checked').val() == "2") {
			   if($("#priceProportion").val() == "") {
				   return "计价比例不能为空";
			   };
			   if(parseFloat($("#priceProportion").val())>100){
				   return "计价比例不能大于100";
			   };
			   if($("#supplierTotal").val() == "") {
				   return "供应商家数不能为空";
			   };
			   if(!(/^[1-9]\d*$/.test($("#supplierTotal").val()))){
				   return "供应商家数不能为小数";
			   }
			   if(parseFloat($("#supplierTotal").val()) <3) {
				   return "供应商家数不能小于3";
			   };
		   };
	   }else{
		   if($("#basePrice").val() =="") {
			   return "基准价不能为空";
		   };
	   }
	   if($("#basePriceProportionHigh").val() == "") {
		   return "高于基准价减分百分比值不能为空";
	   };
	   if(parseFloat($("#basePriceProportionHigh").val()) > 100) {
		   return "高于基准价减分百分比值不能超过100";
	   };
	   if($("#additionReduceScore1").val() == "") {
		   return "高于基准价减分值不能为空";
	   };
	   if($("#addScoreScope").val() == "") {
		   return "加分区间不能为空";
	   };
	   if(parseFloat($("#addScoreScope").val()) > 100) {
		   return "加分区间不能超过100";
	   };
	   if($("#basePriceProportionLow").val() == "") {
		   return "加分区间内加分百分比值不能为空";
	   };
	   if(parseFloat($("#basePriceProportionLow").val()) > 100) {
		   return "加分区间内加分百分比值不能超过100";
	   };
	   if($("#additionReduceScore2").val() == "") {
		   return "加分区间内加分值不能为空";
	   };
	   if($("#maxUpScore").val() == "") {
		   return "最大加分值不能为空";
	   };
	   if(parseFloat($("#additionReduceScore2").val())>$("#maxUpScore").val()){
		   return "加分值不能大于最大加分值";
	   }
	   if($("#basePriceScale").val() == "") {
		   return "加分区间外减分百分比值不能为空";
	   };
	   if(parseFloat($("#basePriceScale").val()) > 100) {
		   return "加分区间外减分百分比值不能超过100";
	   };
	   if($("#basePriceNumber").val() == "") {
		   return "加分区间外减分值不能为空";
	   };
   }
   if($("#employeeId").val()==""){         	
			return "请选择审核人";
   };
	 
}
//时间转换是的IE和谷歌都可以判断日期大小
function NewDate(str){  
   if(!str){  
	   return 0;  
   }  
   arr=str.split(" ");  
   d=arr[0].split("-");  
   t=arr[1].split(":");  
   var date = new Date();   
   date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
   date.setUTCHours(t[0]-8, t[1]);   
   return date.getTime();  
}        
function changeTest(examType){
  var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
   $('.ageinTime').each(function(){
	   var time = $(this).val();
	   var r = new RegExp("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s((([0-1][0-9])|(2?[0-3]))\\:([0-5]?[0-9])((\\s)|(\\:([0-5]?[0-9])))))?$");		
	   return  "请输入正确格式的日期";
   })		
   if($("#noticeEndDate").val()!=""){
	   if(NewDate($("#noticeEndDate").val()) < NewDate(packageInfo.noticeStartDate)){
		   return (examType==0?'资格预审':'')+"公告截止时间不得早于"+ (examType==0?'资格预审':'') +"公告开始时间，请重新设置";
	   };
	   if(NewDate($("#noticeEndDate").val()) < NewDate(nowDate)){
		   return (examType==0?'资格预审':'')+"公告截止时间已早于当前时间，请重新设置";
	   };
	   if($("#askEndDate").val()!=""){
			if(NewDate($("#askEndDate").val()) < NewDate($("#noticeEndDate").val())){
			   return (examType==0?'资格预审':'')+"提出澄清截止时间不得早于"+(examType==0?'资格预审':'')+"公告截止时间当前时间，请重新设置";
		   };
	   };
	   if($("#answersEndDate").val()!=""){
			if(NewDate($("#answersEndDate").val()) < NewDate($("#noticeEndDate").val())){
			   return (examType==0?'资格预审':'')+"答复截止时间不得早于"+(examType==0?'资格预审':'')+"公告截止时间当前时间，请重新设置";
		   };
	   };
   }else{
	   if($("#askEndDate").val()!=""){
			if(NewDate($("#askEndDate").val()) < NewDate(packageInfo.noticeEndDate)){
			   return (examType==0?'资格预审':'')+"提出澄清截止时间不得早于"+(examType==0?'原始资格预审':'原始')+"公告截止时间当前时间，请重新设置";
		   };
	   };
	   if($("#answersEndDate").val()!=""){
			if(NewDate($("#answersEndDate").val()) < NewDate(packageInfo.noticeEndDate)){
			   return (examType==0?'资格预审':'')+"答复截止时间不得早于"+(examType==0?'原始资格预审':'原始')+"公告截止时间当前时间，请重新设置";
		   };
	   };
   };
   if($("#askEndDate").val()!=""){
		if(NewDate($("#askEndDate").val()) < NewDate(nowDate)){
		   return (examType==0?'资格预审':'')+"提出澄清截止时间已早于当前时间，请重新设置";
	   };
   };
   if($("#answersEndDate").val()!=""){
	   if(NewDate($("#answersEndDate").val()) < NewDate(nowDate)){                  	          
		   return (examType==0?'资格预审':'')+"答复截止时间已早于当前时间，请重新设置";
	   };
	   if($("#askEndDate").val()!=""){
		   if(NewDate($("#answersEndDate").val()) < NewDate($("#askEndDate").val())){                  	          
			   return (examType==0?'资格预审':'')+"答复截止时间不得早于"+(examType==0?'资格预审':'')+"提出澄清截止时间时间，请重新设置";
		   };
	   }else{
		   if(NewDate($("#answersEndDate").val()) < NewDate(examType==0?packageInfo.examAskEndDate:packageInfo.askEndDate)){                  	          
			   return (examType==0?'资格预审':'')+"答复截止时间不得早于"+(examType==0?'资格预审':'')+"提出澄清截止时间时间，请重新设置";
		   };
	   }
   };    
   if(packageInfo.isSign==1){   
	   if($("#signStartDate").val()!=""){
		   if($("#signEndDate").val()!=""){
			   if(NewDate($("#signStartDate").val()) >= NewDate($("#signEndDate").val())){
				   return "报名开始时间不得晚于报名截止时间，请重新设置";
			   };
		   }else{
			   if(NewDate($("#signStartDate").val()) >= NewDate(packageInfo.signEndDate)){
				   return "报名开始时间不得晚于原始报名截止时间，请重新设置";
			   };
		   }
	   }	    	   
	   if(examType==1){
		   if($("#signEndDate").val()!=""){
			   if($("#bidEndDate").val()!=""){
				   if(NewDate($("#signEndDate").val()) > NewDate($("#bidEndDate").val())){
					   return "报名截止时间不得晚于报价截止时间，请重新设置";
				   };
			   }else{
				   if(NewDate($("#signEndDate").val()) > NewDate(packageInfo.offerEndDate)){
					   return "报名截止时间不得晚于原始报价截止时间，请重新设置";
				   };
			   }
		   }
		   
	   }else{
		   if($("#signEndDate").val()!=""){
			   if($("#checkEndDate").val()!=""){
				   if(NewDate($("#signEndDate").val()) > NewDate($("#checkEndDate").val())){
					   return "报名截止时间不得晚于"+(examType==0?'原始资格预审评审':'询比评审')+"时间，请重新设置";
				   };
			   }else{
				   if(NewDate($("#signEndDate").val()) > NewDate(packageInfo.examCheckEndDate)){
					   return "报名截止时间不得晚于"+(examType==0?'原始资格预审评审':'原始询比评审')+"时间，请重新设置";
				   };
			   }
			   
		   }
		   
	   };
   };
   if(examType==0){ 
	   if($("#submitExamFileEndDate").val()!=""){//判断资格预审申请文件递交截止时间是否为空
		   if(NewDate($("#submitExamFileEndDate").val()) < NewDate(nowDate)){    	
			   return "资格预审申请文件递交截止时间已早于当前时间，请重新设置";
		   };
		   if(packageInfo.isSign==1){	//判断是否需要报名
			   if($("#signEndDate").val()!=""){//判断报名截止时间是否为空
				   if(NewDate($("#submitExamFileEndDate").val()) < NewDate($("#signEndDate").val())){    	
					   return "资格预审申请文件递交截止时间不得早于报名截止时间，请重新设置";
				   };
			   }else{//如果为空，则判断原始的报名截止时间的大小
				   if(NewDate($("#submitExamFileEndDate").val()) < NewDate(packageInfo.signEndDate)){    	
					   return "资格预审申请文件递交截止时间不得早于原始报名截止时间，请重新设置";
				   };
			   }		    	
		   };
		   if($("#checkEndDate").val()!=""){
			   if(NewDate($("#submitExamFileEndDate").val()) > NewDate($("#checkEndDate").val())){    	
				   return "资格预审申请文件递交截止时间不得晚于"+(examType==0?'原始资格预审评审':'询比评审')+"时间，请重新设置";
			   };
		   }else{
			   if(NewDate($("#submitExamFileEndDate").val()) > NewDate(packageInfo.examCheckEndDate)){    	
				   return "资格预审申请文件递交截止时间不得晚于"+(examType==0?'原始资格预审评审':'原始询比评审')+"时间，请重新设置";
			   };
		   }
		   
	   }	    	    
   };
   if(examType==1){    	
	   if($("#bidEndDate").val()!=""){
			if(NewDate($("#bidEndDate").val()) < NewDate(nowDate)){
			   return "报价截止时间已早于当前时间，请重新设置";
		   };	
		   
		   
	   }
	   if($("#checkEndDate").val()!=""){
		   if(NewDate($("#checkEndDate").val())<NewDate(nowDate)){	   
			   return "询比评审时间已早于当前时间，请重新设置";
			  };
		   if($("#bidEndDate").val()!=""){
		   
			   if(NewDate($("#bidEndDate").val())>NewDate($("#checkEndDate").val())){	   
				   return "询比评审时间不能早于报价截止时间";
				  };
		   }else{
			   if(NewDate(packageInfo.offerEndDate)>NewDate($("#checkEndDate").val())){	   
				   return "询比评审时间不能早于原始报价截止时间";
				  };
		   }
	   }else{
		   if($("#bidEndDate").val()!=""){
			   if(NewDate($("#bidEndDate").val()) < NewDate(packageInfo.checkEndDate)){
				   return "报价截止时间不得大于原始询比评审时间，请重新设置";
			   };
		   }
		   
	   }
   } 
   
}