var isSetServiceCharges,ptPrice,isSetSign;
var optionFeiYong = [];
var projectPrices = "";
var packagePriceDataS=[];
var pricelist=config.bidhost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
//费用信息查询
function packagePriceData(){
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageInfo.id,
	   		"projectId":packageInfo.projectId,
	   	},
	   	success:function(data){	
			   //initMoney();
			if(data.success){
				packagePriceDataS=data.data;
				for(var i=0;i<packagePriceDataS.length;i++){
					if(packagePriceDataS[i].priceName=="平台服务费"){
						$('input[name="projectPrices[2].price"]').val(packagePriceDataS[i].price||'');	
					}
					if(packagePriceDataS[i].priceName=="报名费"){
						if($('input[name="isPaySign"]').val()==0){
							$('input[name="projectPrices[0].price"]').val(packagePriceDataS[i].price||'');	
						}
					}
					if($("input[name='isPayDeposit']:checked").val()==0){
						if(packagePriceDataS[i].priceName=="项目保证金"){
							$('input[name="projectPrices[3].price"]').val(packagePriceDataS[i].price||"");	
							if(packagePriceDataS[i].payMethod!==undefined){
								$("#payMethod").val(packagePriceDataS[i].payMethod)
							}else{
								$("#payMethod").val(1)
							}	
							if(packagePriceDataS[i].payMethod==1){
								findBank(packagePriceDataS[i].agentType||0);
								if(packagePriceDataS[i].agentType){
									$('input[name="projectPrices[3].agentType"][value="'+ packagePriceDataS[i].agentType +'"]').prop("checked",true);
								}else{
									$('input[name="projectPrices[3].agentType"][value="0"]').prop("checked",true);
								};							
								$('input[name="projectPrices[3].bankAccount"]').val(packagePriceDataS[i].bankAccount||"");
								$('input[name="projectPrices[3].bankName"]').val(packagePriceDataS[i].bankName||"");
								$('input[name="projectPrices[3].bankNumber"]').val(packagePriceDataS[i].bankNumber||""); 	
							}
						}
					}
					if($("input[name='isSellFile']:checked").val()==0){
						if(examType==0){
							if(packagePriceDataS[i].priceName=="资格预审文件费"){
								$('input[name="projectPrices[1].price"]').val(packagePriceDataS[i].price||'');	
							};
						}else{
							if(packagePriceDataS[i].priceName=="采购文件费"){
								$('input[name="projectPrices[1].price"]').val(packagePriceDataS[i].price||'');
							};					
						};
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
	 $.ajax({
			type: "post",
			url: config.Syshost + "/SysDictController/findOptionsByName.do",,
			datatype: 'json',
			data:{optionName:"MONEY_TYPE"},
			async: true,
			success: function(data) {
				if(data.success) {					
                    for(var m=0;m<data.data.length;m++){
						if(isSetServiceCharges=="NO"){//判断是否要求设置平台服务费NO为没有设置
							if(data.data[m].optionText=="平台服务费"){//把平台服务费剔除
								data.data.splice(m,1);
							}
						}
						if(isSetSign=="NO"){
							if(data.data[m].optionText=="报名费"){//把报名费剔除
								data.data.splice(m,1);
							}
						}
						optionFeiYong.push(data.data[m])						
					};
									
					priceTable()													
				}	
			}
		});
};
//查找账户
function priceTable(){
	var shtml="";
	if($('input[name="isSign"]:checked').val()==1){
		if(isSetSign=="YES"){
			$(".isNoSign").show();	
		}else{
			$(".isNoSign").hide();	
			$('input[name="projectPrices[0].price"]').val("");
			
		}
	}else{
		$(".isNoSign").hide();
		$('input[name="projectPrices[0].price"]').val("");
		$('input[name="isPaySign"]').prop("checked",false);
	}
	var packagePriceFile=[];
	for(var i=0;i<optionFeiYong.length;i++){
		if(optionFeiYong[i].optionText=="平台服务费"){
			$('input[name="projectPrices[2].payWay"]').val(1);
			$('input[name="projectPrices[2].priceId"]').val(optionFeiYong[i].id);
			$('input[name="projectPrices[2].packageId"]').val(packageInfo.id);
			$('input[name="projectPrices[2].projectId"]').val(packageInfo.projectId);
			$('input[name="projectPrices[2].priceName"]').val(optionFeiYong[i].optionText);					
			$('input[name="projectPrices[2].payType"]').val(1);
			$('input[name="projectPrices[2].payTime"]').val(0);	
			$('input[name="projectPrices[2].price"]').val(ptPrice);	
		};
		if($('input[name="isPaySign"]:checked').val()==0){
			$(".isFtimes").show()
			$('.colss').attr('colspan','1');
			if(optionFeiYong[i].optionText=="报名费"){
				$('input[name="projectPrices[0].payWay"]').val(1);
				$('input[name="projectPrices[0].priceId"]').val(optionFeiYong[i].id);
				$('input[name="projectPrices[0].packageId"]').val(packageInfo.id);
				$('input[name="projectPrices[0].projectId"]').val(packageInfo.projectId);
				$('input[name="projectPrices[0].priceName"]').val(optionFeiYong[i].optionText);					
				$('input[name="projectPrices[0].payType"]').val(1);
				$('input[name="projectPrices[0].payTime"]').val(0);	
			}					
		}else{
			$(".isFtimes").hide()
			$('input[name="projectPrices[0].price"]').val("");
			$('.colss').attr('colspan','3');
			$('input[name="projectPrices[0].payWay"]').val("");
			$('input[name="projectPrices[0].priceId"]').val("");
			$('input[name="projectPrices[0].packageId"]').val("");
			$('input[name="projectPrices[0].projectId"]').val("");
			$('input[name="projectPrices[0].priceName"]').val("");					
			$('input[name="projectPrices[0].payType"]').val("");
			$('input[name="projectPrices[0].payTime"]').val("");					
		}	
		if(examType==0){
			if(optionFeiYong[i].optionText=="资格预审文件费"){
				packagePriceFile=optionFeiYong[i]
			};
		}else{
			if(optionFeiYong[i].optionText=="采购文件费"){
				packagePriceFile=optionFeiYong[i]
			};					
		};
		if($('input[name="isSellFile"]:checked').val()==0){//判断是否需要出售文件
			$(".isFtime").show();
			$('.cols').attr('colspan','1');
			if(examType==0){
				$('#yhs').html('资格预审文件费(元)');
				$('.ys').html('资格预审');
				
			}else{
				$('#yhs').html('采购文件费(元)');
				$('.ys').html('采购');
			}
			$('input[name="projectPrices[1].payWay"]').val(1);
			$('input[name="projectPrices[1].priceId"]').val(packagePriceFile.id);
			$('input[name="projectPrices[1].packageId"]').val(packageInfo.id);
			$('input[name="projectPrices[1].projectId"]').val(packageInfo.projectId);
			$('input[name="projectPrices[1].priceName"]').val(packagePriceFile.optionText);					
			$('input[name="projectPrices[1].payType"]').val(1);
			$('input[name="projectPrices[1].payTime"]').val(0);	
		}else{
			$(".isFtime").hide();
			$('.cols').attr('colspan','3');
			$('input[name="projectPrices[1].payWay"]').val("");
			$('input[name="projectPrices[1].priceId"]').val("");
			$('input[name="projectPrices[1].price"]').val("");
			$('input[name="projectPrices[1].packageId"]').val("");
			$('input[name="projectPrices[1].projectId"]').val("");
			$('input[name="projectPrices[1].priceName"]').val("");					
			$('input[name="projectPrices[1].payType"]').val("");
			$('input[name="projectPrices[1].payTime"]').val("");	
		}
		if($("input[name='isPayDeposit']:checked").val()==0){
			if(optionFeiYong[i].optionText=="项目保证金"){
				$('input[name="projectPrices[3].priceId"]').val(optionFeiYong[i].id);
				$('input[name="projectPrices[3].packageId"]').val(packageInfo.id);
				$('input[name="projectPrices[3].projectId"]').val(packageInfo.projectId);
				$('input[name="projectPrices[3].priceName"]').val(optionFeiYong[i].optionText);
				$('input[name="projectPrices[3].payWay"]').val(1);											
				$('input[name="projectPrices[3].payType"]').val(1);
				$('input[name="projectPrices[3].payTime"]').val(0);
				$('.isDepositShows').show();
				$('.isDepositCols').attr('colspan','1');
				if($("#payMethod").val()==0){
					/*********         保证金虚拟子账户规则   media/js/base/IndexMenu.js */
					$('.type_offline').show();
					/*********         保证金虚拟子账户规则   --end */
					$('.isDepositShow').hide();
					$('.DepositPriceShow').show();					
						
				}else{
					$('.type_offline').hide();//  保证金虚拟子账户
					$('.isDepositShow').show();
				}
			}
		}else{			
			$('.isDepositShow').hide();
			$('.isDepositShows').hide();
			$('.isDepositCols').attr('colspan','3');
			$("#payMethod").attr("selected",false);
			$('.type_offline').hide();//  保证金虚拟子账户
			$('input[name="projectPrices[3].priceId"]').val("");
			$('input[name="projectPrices[3].packageId"]').val("");
			$('input[name="projectPrices[3].projectId"]').val("");
			$('input[name="projectPrices[3].priceName"]').val("");	
			$('input[name="projectPrices[3].payWay"]').val("");							
			$('input[name="projectPrices[3].payType"]').val("");
			$('input[name="projectPrices[3].price"]').val("");
			$('input[name="projectPrices[3].price"]').val("");
			$('input[name="projectPrices[3].agentType"]').attr("checked",false);
			$('input[name="projectPrices[3].bankAccount"]').val("");
			$('input[name="projectPrices[3].bankName"]').val("");
			$('input[name="projectPrices[3].bankNumber"]').val(""); 
		}			
	}
}
//切换是否需要保证金
$('input[name="isPayDeposit"]').on('change',function(){
	
	priceTable()
})
//保证金缴纳方式
$('#payMethod').on('change',function(){
	priceTable()
})
//切换是否需要采购文件费
$('input[name="isSellFile"]').on('change',function(){
	priceTable()
})
//切换是否需要报名
$('input[name="isSign"]').on('change',function(){
	$('input[name="isPaySign"][value="'+(packageInfo.isPaySign||0)+'"]').prop("checked",true);
	priceTable()
})
//是否需要递交报名费
$('input[name="isPaySign"]').on('change',function(){
	priceTable()
})
$('input[name="projectPrices[3].agentType"]').on('change',function(){
	findBank($(this).val());
})
//验证金额
// $(".priceNumber").on('change',function(){
// 	if($(this).val()!=""){
// 		/* if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))||parseFloat($(this).val())==0){ 
// 			parent.layer.alert("金额必须大于零且最多两位小数"); 
// 			$(this).val("");
			
// 			return
// 		}; */
// 		var b = (parseFloat( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
// 		$(this).val(b);
// 	}
	
// })
//获取当前平台是否设置的平台服务费
function findServiceCharges(){
	$.ajax({
			type: "post",
			url: config.Syshost+'/EnterpriseChargesController/findServiceCharges.do',
			datatype: 'json',
			data:{
				'packageId':packageInfo.id
			},
			async: false,
			success: function(data) {
				if(data.success) {
					for(var i=0;i<data.data.length;i++){
						if(data.data[i].optionName=="平台服务费"){
							isSetServiceCharges=data.data[i].optionText;
							if(isSetServiceCharges!="NO"){
								ptPrice=data.data[i].optionValue
							}							
						}						
						if(data.data[i].optionName=="报名费"){
							isSetSign=data.data[i].optionText;														
						}
						if(isSetSign=="NO"){
							$(".isShowSign").hide();
							$(".isNoSign").hide();
							$('input[name="isPaySign"][value="1"]').prop('checked',true)	
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
			'projectId':packageInfo.projectId
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
