function textdata(isFile){
	var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();			
//	if($("#projectName").val() == "") {
//		
//		return "采购项目名称不能为空";
//	};
//	if($("#agencyLinkmen").val()==""){
// 		parent.layer.alert("代理机构联系人不能为空");
// 		 return
// 	};
// 	if($("#agencyTel").val()==""){
// 		parent.layer.alert("代理机构联系电话不能为空");
// 		 return
// 	};
//	if($("#ppurchaserName").val() == "") {		
//		return "采购人不能为空，请选择采购人";
//	};
//	if($("#purchaserLinkmen").val()==""){
// 		
// 		 return "请选择联系人";
// 	};
//	if($("#noticeStartDate").val() == "") {
//		
//		return "请选择公告开始时间";
//	};
	if($("#noticeEndDate").val() == "") {
		
		return "请选择公告截止时间";
	};
	if($("#askEndDate").val() == "") {		
		return "请选择提出澄清截止时间";
	};
	if($("#answersEndDate").val() == "") {		
		return "请选择答复截止时间";
	};
	if($("#auctionStartDate").val() == "") {		
		return "请选择竞卖开始时间";
	};
	if($('input[name="isFile"]:checked').val() == 0) {
		if($("#fileEndDate").val() == "") {
			
			return "请选择竞卖文件递交截止时间";
		};
		if($("#fileCheckEndDate").val() == "") {			
			return "请选择竞卖文件审核截止时间";
		};
		if(NewDate($("#fileEndDate").val())<=NewDate($("#noticeStartDate").val())){    	
	        return "竞卖文件递交截止时间不得早于公告开始时间";
	   	};
	   	if(NewDate($("#fileEndDate").val())>NewDate($("#auctionStartDate").val())){    	
	        return "竞卖文件递交截止时间不得晚于竞卖开始时间";
	   	};
	   	if(NewDate($("#fileCheckEndDate").val())<NewDate($("#fileEndDate").val())){    	
	        return "竞卖文件审核截止时间不得早于文件递交截止时间";
	   	};
	   	if(NewDate($("#fileEndDate").val()) <NewDate($("#noticeEndDate").val())){
           return "竞卖文件递交截止时间不得早于公告截止时间，请重新设置";
        };
	   	if(NewDate($("#fileCheckEndDate").val())>NewDate($("#auctionStartDate").val())){    	
	        return "竞卖文件审核截止时间不得晚于竞卖开始时间";
	   	};

	};
	if(NewDate($("#noticeStartDate").val()) <NewDate(nowSysDate)){
    	
        return "公告开始时间已早于当前时间，请重新设置";
    };
    if(NewDate($("#askEndDate").val()) <NewDate(nowSysDate)){
        return "提出澄清截止时间已早于当前时间，请重新设置";
    };
    if(NewDate($("#askEndDate").val()) <NewDate($("#noticeEndDate").val())){
        return "提出澄清截止时间不得早于公告截止时间，请重新设置";
    };
	if(NewDate($("#answersEndDate").val()) <NewDate(nowSysDate)){		  
	    return "答复截止时间已早于当前时间，请重新设置";
	};
	 if(NewDate($("#answersEndDate").val()) <NewDate($("#noticeEndDate").val())){
        return "答复截止时间不得早于公告截止时间，请重新设置";
    };
    if(NewDate($("#auctionStartDate").val()) <NewDate(nowSysDate)){    	
        return "竞卖开始时间已早于当前时间，请重新设置";
    };
    if(NewDate($("#auctionStartDate").val()) <NewDate($("#noticeEndDate").val())){
        return "竞卖开始时间不得早于公告截止时间，请重新设置";
    };
    if(isFile==0){
		if(NewDate($("#fileCheckEndDate").val()) < NewDate($("#fileEndDate").val())) {
			return "竞卖文件审核截止时间不得早于文件递交截止时间";
		};
	    if(NewDate($("#fileEndDate").val()) < NewDate($("#noticeEndDate").val())) {
		   return "竞卖文件递交截止时间不得早于公告截止时间，请重新设置";
	    };
	}
	if(NewDate($("#noticeEndDate").val()) <=NewDate($("#noticeStartDate").val())){
	    	
        return "公告截止时间不得早于公告开始时间，请重新设置";
	};
	if(NewDate($("#askEndDate").val())>NewDate($("#answersEndDate").val())){    	
        return "提出澄清截止时间不得晚于答复截止时间";
  };
	if(packageData.length == 0 || packageData == undefined) {		
		return "包件不能为空"
	};
	if($("#employeeId").val() == "") {
		return "请选择审核人"
	};
	for(var i = 0; i < packageData.length; i++) {
		if(packageData[i].auctionType == 0) {
			if(packageData[i].auctionModel == 0) {
				if(packageData[i].timeLimit == ""||packageData[i].timeLimit==undefined) {					
					return '包件' + packageData[i].packageName + "的限时是空值，请添加";
				};

			};
			if(packageData[i].auctionModel == 0 && packageData[i].isPrice == 0) {
				if(packageData[i].priceReduction == ""||packageData[i].priceReduction == undefined) {					
					return '包件' + packageData[i].packageName + "的降价幅度是空值请添加";
				}
			};
		};
		if(packageData[i].auctionType == 2 && packageData[i].outType == 0) {
			if(packageData[i].firstOutSupplier == ""||packageData[i].firstOutSupplier == undefined) {				
				return '包件' + packageData[i].packageName + "的第1轮淘汰供应商数不能为空";
			};

			if(packageData[i].firstKeepSupplier == ""||packageData[i].firstKeepSupplier == undefined) {				
				return '包件' + packageData[i].packageName + "的第1轮最低保留供应商数不能为空";
			};

		};
		if(packageData[i].auctionType == 3 && packageData[i].outType == 0) {
			if(packageData[i].firstOutSupplier == ""||packageData[i].firstOutSupplier == undefined) {				
				return '包件' + packageData[i].packageName + "的第1轮淘汰供应商数不能为空";
			};
			if(packageData[i].firstKeepSupplier == ""||packageData[i].firstKeepSupplier == undefined) {			
				return '包件' + packageData[i].packageName + "的第1轮最低保留供应商数不能为空";
			};
			if(packageData[i].secondOutSupplier == ""||packageData[i].secondOutSupplier == undefined) {			
				return '包件' + packageData[i].packageName + "的第2轮淘汰供应商数不能为空";
			};
			if(packageData[i].secondKeepSupplier == ""||packageData[i].secondKeepSupplier == undefined) {
				
				return '包件' + packageData[i].packageName + "的第2轮最低保留供应商数不能为空";
			};
		};
		var auctionOutType=[]
		if(packageData[i].auctionType == 4 && packageData[i].outType == 0){			
			for(var m=0;m<purchaseaData.auctionOutType.length;m++){
				if(packageData[i].id==purchaseaData.auctionOutType[m].packageId){
					auctionOutType.push(purchaseaData.auctionOutType[m])
				}
			}
			if(auctionOutType.length==0){
				return '包件' + packageData[i].packageName + "的淘汰方式不能为空";
			}else{
				for(var n=0;n<auctionOutType.length;n++){
					if(auctionOutType[n].countValue==undefined||auctionOutType[n].outValue==undefined){
						return '包件' + packageData[i].packageName + "的淘汰方式不能为空";
					}
				}
			}
		}
		if(packageData[i].isPrice == 0 && (packageData[i].auctionModel == 0 || packageData[i].auctionType > 1)) {
			if(packageData[i].rawPrice == ""||packageData[i].rawPrice==undefined) {
				return '包件' + packageData[i].packageName + "的竞价起始价不能为空";
			}
		};
		//判断费用信息是否添加平台服务费
		// if(packageData[i].projectPrice != undefined && packageData[i].projectPrice != null) {
		// 	var priceProject = packageData[i].projectPrice;
		// 	var names = [];
		// 	if(priceProject != null) {
		// 		for(var k = 0; k < priceProject.length; k++) {
		// 			names.push(priceProject[k].priceName);
		// 		}
		// 		for(var h = 0; h < priceProject.length; h++) {
		// 			//验证填了费用的表单数据
		// 			if(projectPriceCheck(priceProject[h], packageData[i].packageName)) {
		// 				return projectPriceCheck(priceProject[h], packageData[i].packageName);
		// 			}
		// 		}

		// 	} else {
				
		// 	}
		// }
		var minData = [];
		for(var n = 0; n < DetailedData.length; n++) {
			if(DetailedData[n].packageId == packageData[i].id) {
				minData.push(DetailedData[n])
			}
		};
		if(minData.length == 0) {			
			return '包件' + packageData[i].packageName + "的设备信息不能为空";
		}
	}
}
function projectPriceCheck(res, pkName) {
	if(res.payType == '1') {
		if(res.price == undefined || res.price == "") {			
			return "包件" + pkName + "的" + res.priceName + "的金额不能为空";
		}

	} else {
		//判断百分比
		if(res.chargePercent == undefined || res.chargePercent == 0) {
			
			return "包件" + pkName + "的" + res.priceName + "的百分比不能为零";
		}

	}

	if(res.priceName == "项目保证金") {
		if(checkBank(res, pkName)) {
			return checkBank(res, pkName);
		}
	}
}

//银行帐号信息验证
function checkBank(res, pkName) {
	if(res.bankName == undefined || res.bankName == "") {	
		return "包件" + pkName + "的" + res.priceName + "的开户银行不能为空";
	}

	if(res.bankAccount == undefined || res.bankAccount == "") {
	
		return "包件" + pkName + "的" + res.priceName + "的账户名不能为空";
	}

	if(res.bankNumber == undefined || res.bankNumber == "") {
		return "包件" + pkName + "的" + res.priceName + "的账号不能为空";
	}
};
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