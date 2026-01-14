var pricelist=config.bidhost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
function getProjectPrice(){
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
				var packagePrice=data.data;
				if(packagePrice.length>0){					
					for(var z=0;z<packagePrice.length;z++){
						if(packageInfo.examType==0){
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
								$('.isDepositShow').hide();
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