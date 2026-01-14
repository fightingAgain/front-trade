var isSetServiceCharges,ptPrice,isSetSign;
var optionFeiYong = [];
var etype = [];
var initialValues = [];
var depositAccountList = [];
var pingTaiMoney = [];
var priceTypeList = ['平台服务费','文件费', '代理费', '项目保证金']; 
var projectPrices = "";
var msg =  JSON.parse(sessionStorage.getItem('projectMsg'));
var daMsg = {};
var packagePriceDataS=[]
//费用信息查询
function packagePriceData(){
	$("#projectId").val(projectIds);
	etype = [];
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		// "packageId":data1.id,
	   		"projectId":projectIds,
	   	},
	   	success:function(data){	
			   //initMoney();
			if(data.success){
				packagePriceDataS=data.data;
				for(var i=0;i<packagePriceDataS.length;i++){
					if(packagePriceDataS[i].priceName=="平台服务费"){
						$('input[name="project.auctionProjectPackages[0].projectPrices[0].price"]').val(packagePriceDataS[i].price);	
					}
					if($("input[name='project.auctionProjectPackages[0].isPayDeposit']:checked").val()==0){
						
						if(packagePriceDataS[i].priceName=="项目保证金"){
							$('input[name="project.auctionProjectPackages[0].projectPrices[1].price"]').val(packagePriceDataS[i].price||"");
							if(packagePriceDataS[i].payMethod!==undefined){
								$("#payMethod").val(packagePriceDataS[i].payMethod)
							}else{
								$("#payMethod").val(1)
							}							
							
							if(packagePriceDataS[i].payMethod!==0){
								findBank(packagePriceDataS[i].agentType||0);							
								if(packagePriceDataS[i].agentType){
									$('input[name="project.auctionProjectPackages[0].projectPrices[1].agentType"][value="'+ packagePriceDataS[i].agentType +'"]').prop("checked",true);
								}else{
									$('input[name="project.auctionProjectPackages[0].projectPrices[1].agentType"][value="0"]').prop("checked",true);
								}
								$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankAccount"]').val(packagePriceDataS[i].bankAccount||"");
								$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankName"]').val(packagePriceDataS[i].bankName||"");
								$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankNumber"]').val(packagePriceDataS[i].bankNumber||"");  
							}
							if(packagePriceDataS[i].bankType){
								$('input[name="bankType"]').val([packagePriceDataS[i].bankType]);
							};
						}
					}
					if($("input[name='project.auctionProjectPackages[0].isSellFile']:checked").val()==0){
						if(packagePriceDataS[i].priceName=="竞价采购文件费"){													
							$('input[name="project.auctionProjectPackages[0].projectPrices[2].price"]').val(packagePriceDataS[i].price||"");	
						}
					}
				}	  
				
			}		
	   	}  
	});
	 
	 PackagePrice();
}
//费用信息展示
function PackagePrice(){	
	findServiceCharges()
	var mixtbody = "";
	 $.ajax({
			type: "post",
			url: config.Syshost + "/SysDictController/findOptionsByName.do",,
			datatype: 'json',
			data:{optionName:"MONEY_TYPE"},
			async: true,
			success: function(data) {
				if(data.success) {
					
                    for(var m=0;m<data.data.length;m++){
						if(data.data[m].optionValue == 0){							
							if(isSetServiceCharges=="NO"){//判断是否要求设置平台服务费NO为没有设置
								if(data.data[m].optionText=="平台服务费"){//把平台服务费剔除
									data.data.splice(m,1);
								}
							}
							// if(isSetSign=="NO"){
							if(data.data[m].optionText=="报名费"){//把报名费剔除
								data.data.splice(m,1);
							}
							if(data.data[m].optionText=="代理费"){//把代理费剔除
								data.data.splice(m,1);
							}
							// }
							optionFeiYong.push(data.data[m])
						}						
					};
									
					priceTable()													
				}	
			}
		});
};
//查找账户
function priceTable(){
	var shtml=""
	for(var i=0;i<optionFeiYong.length;i++){						
		if(optionFeiYong[i].optionText=="平台服务费"){
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].payWay"]').val(1);
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].priceId"]').val(optionFeiYong[i].id);
			// $('input[name="projectPrices[0].packageId"]').val(data1.id);
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].projectId"]').val(projectIds);
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].priceName"]').val(optionFeiYong[i].optionText);					
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].payType"]').val(1);
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].payTime"]').val(0);
			$('input[name="project.auctionProjectPackages[0].projectPrices[0].price"]').val(ptPrice);	
		}
		if($("input[name='project.auctionProjectPackages[0].isPayDeposit']:checked").val()==0){
			$('.isDepositShow').show();
			if(optionFeiYong[i].optionText=="项目保证金"){
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].payWay"]').val(1);
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].priceId"]').val(optionFeiYong[i].id);
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].projectId"]').val(projectIds);
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].priceName"]').val(optionFeiYong[i].optionText);	
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].payType"]').val(1);
				$('input[name="project.auctionProjectPackages[0].projectPrices[1].payTime"]').val(0);	
				if($("#payMethod").val()==1){
					$('.type_offline').hide();
					$('.DepositPriceShow').show();										
				}else{
					/*********         保证金虚拟子账户规则   media/js/base/IndexMenu.js */
					$('.type_offline').show();
					/*********         保证金虚拟子账户规则   --end */
					$('.DepositPriceShow').hide();			
				}
			}
		}else{
			$('.type_offline').hide();
			$('.isDepositShow').hide();			
			$("#payMethod").attr("selected",false);
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].payWay"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].priceId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].packageId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].projectId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].priceName"]').val("");					
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].payType"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].price"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].price"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].agentType"]').attr("checked",false);
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankAccount"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankName"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[1].bankNumber"]').val(""); 
		}
		if($("input[name='project.auctionProjectPackages[0].isSellFile']:checked").val()==0){
			$(".isSellShow").show()
			$('.isSellCols').attr('colspan','1')
			if(optionFeiYong[i].optionText=="竞价采购文件费"){
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].payWay"]').val(1);
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].priceId"]').val(optionFeiYong[i].id);
				// $('input[name="projectPrices[2].packageId"]').val(data1.id);
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].projectId"]').val(projectIds);
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].priceName"]').val(optionFeiYong[i].optionText);					
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].payType"]').val(1);
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].payTime"]').val(0);	
				$('input[name="project.auctionProjectPackages[0].projectPrices[2].payTime"]').val(0);
			}
		}else{
			$(".isSellShow").hide();
			$('.isSellCols').attr('colspan','3');
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].payWay"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].priceId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].packageId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].projectId"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].priceName"]').val("");					
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].payType"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].payTime"]').val("");
			$('input[name="project.auctionProjectPackages[0].projectPrices[2].price"]').val("");		
		}	
	}
}
//切换是否需要保证金
$('input[name="project.auctionProjectPackages[0].isPayDeposit"]').on('change',function(){
	if($('input[name="project.auctionProjectPackages[0].isPayDeposit"]:checked').val() == 0){
		$('[name="project.auctionProjectPackages[0].projectPrices[1].agentType"]').eq(0).click();
	}
	priceTable()
})
//保证金缴纳方式
$('#payMethod').on('change',function(){
	priceTable()
})
//切换是否需要竞价采购文件费
$('input[name="project.auctionProjectPackages[0].isSellFile"]').on('change',function(){
	priceTable()
})
$('input[name="project.auctionProjectPackages[0].projectPrices[1].agentType"]').on('change',function(){
	findBank($(this).val());
})
//验证金额
// $(".priceNumber").on('blur',function(){
// 	// if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
// 	/* if(!(/^0\.([1-9]|\d[1-9])$|^[1-9]\d{0,8}\.\d{0,2}$|^[1-9]\d{0,8}$/.test($(this).val()))){ 
// 		parent.layer.alert("金额必须大于零且最多两位小数"); 
// 		$(this).val("");

// 		return
// 	}; */
// 	// var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
// 	var b = $(this).val();
// 	$(this).val(b);
// })
//获取当前平台是否设置的平台服务费
function findServiceCharges(){
	$.ajax({
			type: "post",
			url: config.Syshost+'/EnterpriseChargesController/findServiceCharges.do',
			datatype: 'json',
			data:{
				'packageId':projectIds
			},
			async: false,
			success: function(data) {
				if(data.success) {
					for(var i=0;i<data.data.length;i++){
						if(data.data[i].optionName=="平台服务费"){
							isSetServiceCharges=data.data[i].optionText;
							if(isSetServiceCharges!="NO"){
								ptPrice=data.data[i].optionValue;
								$(".isSetServiceCharges").show();
							}							
						}						
						if(data.data[i].optionName=="报名费"){
							isSetSign=data.data[i].optionText;														
						}
					}				
				}
		}
   })
	
}
var bankMsg;
//查找账户
function findBank(vals){
	$.ajax({
		type: "post",
		url: searchBank,
		datatype: 'json',
		data:{			
			'isDel':0,
			'accountType':0,
			'bankState':1,
			'enterpriseType':vals,
			'projectId':projectIds
		},
		async: false,
		success: function(data) {
			if(data.success) {
				bankMsg = data.data;
				var options;
				if(bankMsg.length > 0){
					for(var i=0;i<bankMsg.length;i++){
						options+='<option value="'+ bankMsg[i].bankAccount +'">'+ bankMsg[i].bankAccount +'</option>'
					};
					$("#bankAccountSelect").html(options);
					$("#bankAccount").val($("#bankAccountSelect").val());
					$("#bankName").val(bankMsg[0].bankName);
	  				$("#bankNumber").val(bankMsg[0].bankNumber);
				}else{
					options="";
					$("#bankAccountSelect").html(options);
					$("#bankAccount").val("");
					$("#bankName").val("");
	  				$("#bankNumber").val("");
				};				
			} 
		}	
	});
}
$("#bankAccountSelect").on('change',function(){
	var text=$("#bankAccountSelect").val();
  	var selectedIndex = $('option:selected', '#bankAccountSelect').index();
  	$("#bankAccount").val(text);
  	if(selectedIndex>=0){
  		$("#bankName").val(bankMsg[selectedIndex].bankName);
  		$("#bankNumber").val(bankMsg[selectedIndex].bankNumber);
  	}
  	
})

//初始值查询
function initMoney(optionFeiYong){
	var optionFei = optionFeiYong;
	$.ajax({
		type: "post",
		url: findInitMoney,
		datatype: 'json',
		async: false,
		success: function(data) {
			if(data.success) {
				depositAccountList = data.data["DepositAccount"];
				initialValues = data.data["InitialValue"];
				//pingTaiMoney = data.data["Platform"];
				
				
				if(depositAccountList.length > 0){
					//如果有保证金账号,
					$("#bankName").val(depositAccountList[0].bankName);
					$("#bankAccount").val(depositAccountList[0].bankAccount);
					$("#bankNumber").val(depositAccountList[0].bankNumber);
				}
				
				if(initialValues.length > 0){
					for(var k =0;k<optionFei.length;k++){
						for(var e=0;e<initialValues.length;e++){
							if(initialValues[e].initialValueType == optionFei[k].id){
								if(initialValues[e].initialValueText != '平台服务费' && initialValues[e].id != null){
									if(initialValues[e].offerType == '0'){
										//固定金额
										$("input[name='payType"+k+"'][value='1']").attr('checked', true);//收取方式
										$("#payType"+k).attr("disabled","disabled");
										$("#reduceCharge"+k).attr("disabled","disabled");
										$("#Charge_Percents"+ k).attr("disabled","disabled");
										$("#addCharge"+ k).attr("disabled","disabled");
										$('#price' + k).val( initialValues[e].initialValue.toFixed(2));//金额
									}else{
										//百分比,只能是中标供应商
										$("input[name='payTime"+k+"'][value='1']").attr('checked', true);//收费方式
										$("input[name='payType"+k+"'][value='0']").attr('checked', true);//收取方式
										$("#Charge_Percents"+k).val(initialValues[e].initialValue);
										$('#price' + k).attr("disabled","disabled");
										$("#payType"+k).attr("disabled",false);
										$("#reduceCharge"+k).attr("disabled",false);
										$("#Charge_Percents"+ k).attr("disabled",false);
										$("#addCharge"+ k).attr("disabled",false);
									}
								}
							}	
						}
					}
				}
				
			} 
		}	
	});
}
//银行账号信息验证
function checkBank(){
	if($('#bankName').val()!="" && $('#bankName').val().length > 100){
	   parent.layer.alert("开户银行不能超过100个字");   
	   return false;
	}	
	if($('#bankAccount').val()!="" && $('#bankAccount').val().length >100){
	   parent.layer.alert("账户名不能超过100个字");   
	   return false;	
	}
	
	
	if($('#bankNumber').val() !="" && !(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($('#bankNumber').val()))){ 
		parent.layer.alert("账号只能是数字");
	    return false;
	}
	
	if($('#bankNumber').val() != "" && $('#bankNumber').val().length >20){
	   parent.layer.alert("账号不能超过20位");   
	   return false;
	}
	return true;
};
