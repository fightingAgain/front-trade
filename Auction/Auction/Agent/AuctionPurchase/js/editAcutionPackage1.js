function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
 }
}
var projectSource=getQueryString("projectSource");
var projectType = getQueryString('projectType');//项目类型
var deleteFileUrl = config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息
var saveImgUrl = config.AuctionHost +"/PurFileController/save.do"; //保存附件
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var CheckListSave=config.AuctionHost+'/AuctionPackageDetailedController/saveAuctionPackageDetailed.do'//材料设备添加
var CheckList=config.AuctionHost+'/AuctionPackageDetailedController/findAuctionPackageDetailedList.do'//材料设备 查询
var CheckListupdate=config.AuctionHost+'/AuctionPackageDetailedController/updateAuctionPackageDetailed.do'//材料设备 修改
var CheckListdelete=config.AuctionHost+'/AuctionPackageDetailedController/deleteAuctionPackageDetailed.do'//材料设备 修改
var saveByExcelDetailed=config.AuctionHost+'/AuctionPackageDetailedController/saveByExcel.do'//材料设备 批量导入
var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var pricesave=config.AuctionHost +'/ProjectPriceController/saveProjectPrice.do'//费用添加
var priceupdate=config.AuctionHost +'/ProjectPriceController/updateProjectPrice.do'//费用修改
var pricedelete=config.AuctionHost +'/ProjectPriceController/deleteProjectPrice.do'//费用删除
var findInitMoney = config.AuctionHost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = parent.config.AuctionHost +"/DepositController/findAccountDetailForAuction.do"; //查询保证金账号
var opurl =config.Syshost +  "/OptionsController/list.do";
var packagePrice = [];//费用信息

//包件添加信息
var packageData={};
var data1=[];
var filesData = []; //附件上传的数组
var auctionOutTypeData=[];
var typeIdList=""//项目类型的ID
var typeNameList=""//项目类型的名字
var typeCodeList=""//项目类型编号
var isOffer=1;//是否显示最低报价0是显示1是不显示。默认为不显示
var isName=1;//是否显示供应商名称0为显示1为不显示，默认为不显示
var isCode=1;//是否显示供应商编号0为显示1为不显示，默认为不显示

var totalCount =0;
var checkListData;
function add_sdad(){
	var auctionTypes="";//竞价方式
	var auctionTypesText="";//竞价方式的中文
	var auctionDurations="";
	var auctionModel="";
	var intervalTimeL=""
	var outSuppliers="";
	if($('input[name="auctionType"]:checked').val()==5){
		auctionTypes=$('input[name="auctionTypes"]:checked').val();
		if(auctionTypes==2){
			auctionTypesText="多轮竞价的2轮竞价";
		};
		if(auctionTypes==3){
			auctionTypesText="多轮竞价的3轮竞价";
		};
	}else{
		auctionTypes=$('input[name="auctionType"]:checked').val();
		if(auctionTypes==0){
			auctionTypesText="自由竞价"
		};
		if(auctionTypes==1){
			auctionTypesText="单轮竞价"
		};
		if(auctionTypes==4){
			auctionTypesText="不限轮次"
		};
	};
	if($('input[name="auctionType"]:checked').val()==0){
		auctionDurations=$("input[name='auctionDuration']:checked").val();
		auctionModel=$('input[name="auctionModel"]:checked').val()
	}else if($('input[name="auctionType"]:checked').val()==1){
		auctionModel=$('input[name="auctionModels"]:checked').val()
		if($("input[name='auctionDurations']:checked").val()=="0"){
		    auctionDurations=$("#auctionDurations").val();
		}else{
			auctionDurations=$("input[name='auctionDurations']:checked").val()
		};
	};
	if($('input[name="auctionType"]:checked').val()==4){
		auctionDurations=$("input[name='auctionDurationW']:checked").val()
		intervalTimeL=$("input[name='intervalTimeW']:checked").val()
	}else if($('input[name="auctionType"]:checked').val()==5){
		intervalTimeL=$("input[name='intervalTime']:checked").val()
	};
	
	packageData={
		id:data1.id,
		packageName:$("#packageName").val(),
		packageNum:$("#packageNum").val(),
		dataTypeId:$("#dataTypeId").val(),
		dataTypeName:$("#dataTypeName").val(),
		dataTypeCode:$("#dataTypeCode").val(),
		auctionType:auctionTypes,
		auctionTypeText:auctionTypesText,
		auctionModel:auctionModel,
		timeLimit:$("#timeLimit").val(),
		auctionDuration:auctionDurations,
		priceReduction:$("#priceReduction").val(),
		isPrice:$('input[name="isPrice"]:checked').val(),
		rawPrice:$("#rawPrice").val(),
		servicePrice:$("#servicePrice").val(),
		isPayDeposit:$("input[name='isPayDeposit']:checked").val(),
		isOfferFile:$("input[name='isOfferFile']:checked").val(),
		depositPrice:$("#depositPrice").val(),
		isPayDetailed:$("input[name='isPayDetailed']:checked").val(),
		detailedPrice:$("#detailedPrice").val(),
		//bankAccountId:$("#bankAccountId").val(),
		bankAccount:$("#bankAccount").val(),
		bankName:$("#bankName").val(),
		bankNumber:$("#bankNumber").val(),
		intervalTime:intervalTimeL,
		outType:$("input[name='outType']:checked").val(),
		firstAuctionTime:$("input[name='firstAuctionTime']:checked").val(),
		firstOutSupplier:$("#firstOutSupplier").val(),
		firstKeepSupplier:$("#firstKeepSupplier").val(),
		secondAuctionTime:$("input[name='secondAuctionTime']:checked").val(),
	    secondOutSupplier:$("#secondOutSupplier").val(),
		secondKeepSupplier:$("#secondKeepSupplier").val(),
		thirdAuctionTime:$("input[name='thirdAuctionTime']:checked").val(),
		countType:$('select[name="countType"] option:selected').val(),
		countValue:$('input[name="countValue"]').val(),
		outValue:$('input[name="outValue"]').val(),		
		content:$("#content").val(),
		isShowNum:isCode,
		isShowName:isName,
		isShowPrice:isOffer
		
	}; 
	formd()
};
//打开弹出框时加载的数据和内容。
function du(){		
	data1 = JSON.parse(sessionStorage.getItem('sdas'));
	//filesData = JSON.parse(sessionStorage.getItem('filesData'));//读取明细说明的数组的缓存;
	if(JSON.parse(sessionStorage.getItem('auctionOutTypes'))!=null){
		auctionOutTypeData=JSON.parse(sessionStorage.getItem('auctionOutTypes'))
	}else{
		auctionOutTypeData=[];
	}
	filesDataView();
	packagePriceData();
	listDetailed();
	$("#packageName").val(data1.packageName);
	$("#packageNum").val(data1.packageNum)
	$('input[name="isPrice"]').eq(data1.isPrice).attr("checked",true);
	$("input[name='isOfferFile'][value='"+data1.isOfferFile  +"']").attr("checked",true)
	//当为2轮或三轮竞价的时候。选中多轮竞价
	if(data1.auctionType==2||data1.auctionType==3){
		$('input[name="auctionType"]').eq(2).attr("checked",true);
		$("input[name='outSupplierd'][value='"+data1.outSupplier  +"']").attr("checked",true)
		auctionType(5)
	}else{
		if(data1.auctionType==4){
			$('input[name="auctionType"]').eq(3).attr("checked",true);
			$("input[name='outSupplierb'][value='"+data1.outSupplier  +"']").attr("checked",true)
		}else{
			$('input[name="auctionType"][value="'+ data1.auctionType +'"]').attr("checked",true);
		}
		
		auctionType(data1.auctionType)
	};
	$('input[name="auctionTypes"][value="'+ data1.auctionType +'"]').attr("checked",true);	
	//当为自由竞价时竞价时常的值为
	if(data1.auctionType==0){
		$("input[name='auctionModel'][value='"+ data1.auctionModel +"']").attr("checked",true);
		$('input[name="auctionDuration"][value="'+ data1.auctionDuration +'"]').attr("checked",true)		
		if(data1.isPrice==0&&data1.auctionModel==0){
			$(".isPriceM").show();
			$(".isPriceL").attr('colspan','')		
			$("#priceReduction").val(data1.priceReduction);
		}else{
			$(".isPriceM").hide();			
			$(".isPriceL").attr('colspan','4')	
		}
	};
	//当单轮竞价是竞价时常为
	if(data1.auctionType==1){
		$("input[name='auctionModels'][value='"+ data1.auctionModel +"']").attr("checked",true);
		$('input[name="auctionDurations"][value="'+ data1.auctionDuration +'"]').attr("checked",true);
		if(data1.auctionDuration!=10&&data1.auctionDuration!=15&&data1.auctionDuration!=30&&data1.auctionDuration!=60){
			$('input[name="auctionDurations"]').eq(4).attr("checked",true);
			$('#auctionDurations').val(data1.auctionDuration);
			$("#auctionDurations").show();
		}		
	}else{
		$("input[name='auctionModel'][value='"+ data1.auctionModel +"']").attr("checked",true);
	}	
	auctionModel(data1.auctionModel);			
	if(data1.isPrice==0){
		$(".isPriceH").show();		
		$("#rawPrice").val(data1.rawPrice);		
	}else{
		$(".isPriceH").hide();		
	}
	if(data1.dataTypeName!=""&&data1.dataTypeName!=undefined){
		$("#dataTypeName").val(data1.dataTypeName)
		$("#dataTypeId").val(data1.dataTypeId)
		$("#dataTypeCode").val(data1.dataTypeCode)
	}else{			
		if(projectType==0){
			$("#dataTypeName").val('工程')
		}
		if(projectType==1){
			$("#dataTypeName").val('货物')
		}
		if(projectType==2){
			$("#dataTypeName").val('服务')
		}
	};
	if(data1.auctionType>1&&data1.auctionType<4){
		$('input[name="intervalTime"][value="'+ data1.intervalTime +'"]').attr("checked",true);	
		$('input[name="firstAuctionTime"][value="'+ data1.firstAuctionTime +'"]').attr("checked",true);
		$('input[name="secondAuctionTime"][value="'+ data1.secondAuctionTime +'"]').attr("checked",true);		
		$("#firstOutSupplier").val(data1.firstOutSupplier)
	    $("#firstKeepSupplier").val(data1.firstKeepSupplier)
	    $("#secondOutSupplier").val(data1.secondOutSupplier)
	    $("#secondKeepSupplier").val(data1.secondKeepSupplier)
	    if(data1.auctionType==3){
	    	$('input[name="thirdAuctionTime"][value="'+ data1.thirdAuctionTime +'"]').attr("checked",true);
	    }
	}else if(data1.auctionType==4){
		$('input[name="intervalTimeW"][value="'+ data1.intervalTime +'"]').attr("checked",true);
		$('input[name="auctionDurationW"][value="'+ data1.auctionDuration +'"]').attr("checked",true);
		$('input[name="lastOutType"][value="'+ data1.lastOutType +'"]').attr("checked",true);
	}
	
	$('input[name="outType"]').eq((data1.outType==undefined?'0':data1.outType)).attr("checked",true);
	isOffer=data1.isShowPrice;//是否显示最低报价0是显示1是不显示。默认为不显示
	isName=data1.isShowName;//是否显示供应商名称0为显示1为不显示，默认为不显示
	isCode=data1.isShowNum;//是否显示供应商编号0为显示1为不显示，默认为不显示
	$("#content").val(data1.content)
	if(data1.isShowNum==0){
		$("input[name='isCode']").attr('checked',true)
	}
	if(data1.isShowName==0){
		$("input[name='isName']").attr('checked',true)
	}
	if(data1.isShowPrice==0){
		$("input[name='isOffer']").attr('checked',true)
	}
	
	outType((data1.outType==undefined?'0':data1.outType))
    var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);	
	
	
	
}
 //限时
$('#reduceNum').on('click',function(){
	var obj = $("#timeLimit");
           if (obj.val() <= 0) {
                obj.val(0);
           } else {
                obj.val(parseInt(obj.val()) - 1);
           }
    obj.change();
})
$('#addNum').on('click',function(){
	var obj = $("#timeLimit");
           obj.val(parseInt(obj.val()) + 1);
           obj.change();
})
//显示供应商信息

//最低报价
$('input[name="isOffer"]').on('click',function(){
	if(this.checked===true){
		isOffer=0
	}else{
		isOffer=1
	}
})
//供应商名称
$('input[name="isName"]').on('click',function(){
	if(this.checked===true){
		isName=0
	}else{
		isName=1
	}
})
//供应商编号
$('input[name="isCode"]').on('click',function(){
	if(this.checked===true){
		isCode=0
	}else{
		isCode=1
	}
})
 function auctionType(num){	
	if(num==0){
		$("#auctionType_0").removeClass("none");
		$("#auctionType_1").addClass("none");
		$("#auctionType_2").addClass("none");
		$("#auctionType_5").addClass("none");
		$(".auctionType02").addClass("none")
		$(".auctionTypeP").html("自由竞价是指竞价项目设置竞价开始时间、竞价时长、降价幅度等竞价要素，符合要求的供应商在竞价开始时之后进行报价操作；供应商可多次报价，系统以供应商最后一次确认的报价做为最终报价；报价截止后，按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商；若无供应商参与报价，竞价失败")
	    if($("input[name='auctionModel']:checked").val()==0&&$('input[name="isPrice"]:checked').val()==0){		
			$(".isPriceM").show();
			$(".isPriceL").attr('colspan','')
			
		}else{		
			$(".isPriceM").hide();
			$(".isPriceL").attr('colspan','4')
			$("#priceReduction").val("")	
		}
	}
	if(num==1){
		$("#auctionType_0").addClass("none");
		$("#auctionType_1").removeClass("none");
		$("#auctionType_5").addClass("none");
		$("#auctionType_2").addClass("none");
		$(".auctionType02").addClass("none")
		$(".auctionTypeP").html("单轮竞价是指竞价项目设置竞价开始时间、竞价时长等竞价要素，符合要求的供应商在竞价开始时间之后进行报价操作；供应商仅可报价一次；报价截止后，按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商（如果出现供应商报价均为最低，则先报价者优先）；若无供应商参与报价，竞价失败")
		$("#auctionDurations").hide();
	}
	if(num==4){
		$("#auctionType_0").addClass("none");
		$("#auctionType_1").addClass("none");
		$("#auctionType_5").removeClass("none");
		$("#auctionType_2").addClass("none");
		$(".auctionType02").addClass("none")
		$(".auctionTypeP").html("无限竞价")
		$("#auctionDurations").hide();	
		if(data1.auctionType==4){
			
		
		if(auctionOutTypeData.length>0){			
			$("#sel_0 option").eq(auctionOutTypeData[0].countType).attr("selected",true);
			$("#supplierCount_0").val(auctionOutTypeData[0].countValue);
	        $("#outCount_0").val(auctionOutTypeData[0].outValue)
	        
	        if(auctionOutTypeData[0].countValue == 0){
				$("#tbOutType").html("");
				$("#lastCount").val("");
				totalCount=0;
				$("#span0").hide();
				$("#span1").show();	
				$("#firstKeep").val(auctionOutTypeData[0].keepValue)
				$("#trOutType").hide();
				$("#btnAddOutType").hide();
				return;
		   };
		    if(auctionOutTypeData.length>2){
		       if(auctionOutTypeData[auctionOutTypeData.length-2].countType==0){
			   	 $("#sel_last option[value='0']").attr("selected","selected");
			   }else{
			   	 $("#sel_last option[value='1']").attr("selected","selected");
			   }	
			}else if(auctionOutTypeData.length==2){
				if(auctionOutTypeData[0].countType==0){
			   	 $("#sel_last option[value='0']").attr("selected","selected");
			   }else{
			   	 $("#sel_last option[value='1']").attr("selected","selected");
			   }
			}
	        $("#lastCount").val(auctionOutTypeData[auctionOutTypeData.length-1].countValue)
	        $("#lastout").val(auctionOutTypeData[auctionOutTypeData.length-1].outValue)
	        $("#lastKeep").val(auctionOutTypeData[auctionOutTypeData.length-1].keepValue)
	        $(".lastkp").html(auctionOutTypeData[auctionOutTypeData.length-1].keepValue)
			if(auctionOutTypeData.length>2){
		       if(auctionOutTypeData[auctionOutTypeData.length-2].countType==0){
			   	 $("#sel_last option[value='0']").attr("selected","selected");
			   }else{
			   	 $("#sel_last option[value='1']").attr("selected","selected");
			   }	
			  totalCount=auctionOutTypeData.length-2;
			   var strSel = '<select [id] style="width: 80px;height: 26px;" [onchange]>';
	           strSel += '<option value="0">大于等于</option><option value="1">大于</option></select>';
	           //var strHtml="";          
	           	   for(var i=1;i<auctionOutTypeData.length-1;i++){
						supplierCount = $("#supplierCount_" + (i-1)).val();
						if(supplierCount==""){
							return;
						}
						if(supplierCount == ""){
							top.layer.alert("请先填写第" + (1+i) + "行的条件值！");
							return;
						}
					var strHtml= '<tr><td style="text-align: left;" colspan="2">首轮报价供应商数： ';
					    strHtml += '<select id="selTemp_' + i + '" style="width: 80px;height: 26px;" disabled="disabled">';
						if(auctionOutTypeData[i-1].countType == 0){
							strHtml += '<option value="0">小于</option><option value="1">小于等于</option></select>';
						}else{
							strHtml += '<option value="1">小于等于</option><option value="0">小于</option></select>';
						}
						strHtml += ' <input type="text" style="width:50px" disabled="disabled" id="supplierCountTemp_' + i + '" value="' + auctionOutTypeData[i-1].countValue + '" />';
						strHtml += '且' + strSel.replace('[id]','id="sel_'+ i + '"').replace('[onchange]','onchange="changeSel(' + i + ')"');	
						strHtml += ' <input type="text" style="width:50px" onblur="setOutType(' + i + ',2)" id="supplierCount_' + i + '" value="'+ auctionOutTypeData[i].countValue +'"/>';
						strHtml += '家时，每轮淘汰';
						strHtml += '<input type="text" style="width:50px" id="outCount_' + i + '" value="'+ auctionOutTypeData[i].outValue +'"/>';
						strHtml += '家供应商；';	
			//			$("#lastCount").val("");
			//			$("#sel_last").val("0");		    
						var Tdrt='<input type="hidden" name="auctionOutTypes['+ i +'].countType" value="'+ auctionOutTypeData[i].countType +'"/>';
							Tdrt+='<input type="hidden" name="auctionOutTypes['+ i +'].countValue" value="'+ auctionOutTypeData[i].countValue +'"/>';
							Tdrt+='<input type="hidden" name="auctionOutTypes['+ i +'].outValue" value="'+ auctionOutTypeData[i].outValue +'"/>';
						
						$("#formCount").append(Tdrt)
						$("#tbOutType").append(strHtml);				
						$("#sel_"+ i +" option").eq(auctionOutTypeData[i].countType).attr("selected",true);
						$('#supplierCount_'+i).on('blur',function(){
						   	$('input[name="auctionOutTypes['+ i +'].countValue"]').val($(this).val())		 			
						});
						$('#outCount_'+i).on('blur',function(){
						    $('input[name="auctionOutTypes['+ i +'].outValue"]').val($(this).val())		   
						});	
						}
	           	       
					 			
			    }
		   }
	    }
	}
	if(num==5){
		$("#auctionType_0").addClass("none");
		$("#auctionType_1").addClass("none");
		$("#auctionType_5").addClass("none");
		$("#auctionType_2").removeClass("none");
		$(".auctionType02").removeClass("none");
		$(".auctionTypeP").html("多轮竞价是指竞价项目设置竞价开始时间、竞价时长等竞价要素，符合要求的供应商（首轮报价若无供应商参与竞价，则竞价终止）在每轮报价开始时间与每轮报价截止时间之间进行报价操作，每轮报价截止时间后公布当前最低报价结果，最多三轮报价轮次（后一轮报价起始价为前一轮最低报价），直到最后一轮结束后。再按照“满足竞价项目要求且有效报价最低”的原则确定成交供应商")
		if(data1.auctionType<2){
			auctionTypes(2)
		}else{
			auctionTypes(data1.auctionType)
		}
		
	}
};
$("input[name='auctionDurations']").on('click',function(){
	if($(this).val()==0){
		$("#auctionDurations").show();
	}else{
		$("#auctionDurations").hide()
	}
})
$("#auctionDurations").on('change',function(){
	if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
		parent.layer.alert("数字必须大于零"); 
		$(this).val("")
	};
})
$('input[name="isPrice"]').on('click',function(){
	if($(this).val()==0&&$("input[name='auctionModel']:checked").val()==0){
		$(".isPriceH").show();
	}else{
		$(".isPriceH").hide();
		$("#rawPrice").val("")
	}
	if($(this).val()==0&&$("input[name='auctionModel']:checked").val()==0){
		$(".isPriceM").show();
		$(".isPriceL").attr('colspan','')
	}else{
		$(".isPriceM").hide();
		$(".isPriceL").attr('colspan','4')		
		$("#priceReduction").val("");
	}
})
function auctionModel(num){
	if(num==0){
		$("#timeLimits").removeClass("none");
		if(data1.timeLimit!=""&&data1.timeLimit!=undefined){
			$("#timeLimit").val(data1.timeLimit);
		}else{
			$("#timeLimit").val("5");
		}
		$('.auctionModelN').show()
	}else{
		$("#timeLimits").addClass("none");
		$("#timeLimit").val("");
		$('.auctionModelN').hide()
		
	}
	if(num==0&&$('input[name="isPrice"]:checked').val()==0){		
		$(".isPriceM").show();
		$(".isPriceL").attr('colspan','');
		$(".isPriceH").show();
		
	}else{		
		$(".isPriceM").hide();
		$(".isPriceH").hide();
		$("#rawPrice").val("")
		$(".isPriceL").attr('colspan','4')
		$("#priceReduction").val("")	
	}
}
var outTypeNum="";//设置淘汰方式
var TypecheckedNum="";//多轮竞价的2轮还是3轮
function outType(num){
	outTypeNum=num
	if(num==0){
		$(".Supplier").removeClass("none");
		$(".third").addClass("none");
		$(".thirds").addClass("none");
	}else{
		$(".Supplier").addClass("none");
		$(".third").removeClass("none");
		$(".thirds").removeClass("none");
	}
	if(TypecheckedNum==2&&num==1){
		$(".third").addClass("none");
		$(".thirds").addClass("none");
		$(".Supplier").addClass("none");
	}
	if(TypecheckedNum==3&&num==0){
		$(".Supplier").removeClass("none");
		$(".thirds").removeClass("none");
	}
	if(TypecheckedNum==3&&num==1){
		$(".Supplier").addClass("none");
	}
};

function auctionTypes(num){	
	TypecheckedNum=num;
	if(num==2){
		$(".third").addClass("none");
		$(".thirds").addClass("none");
	}else if(num==3&&outTypeNum==1){
		$(".Supplier").addClass("none");
		$(".thirds").removeClass("none");
	}else if(num==3&&outTypeNum==0){
		$(".Supplier").removeClass("none");
		$(".third").removeClass("none");
		$(".thirds").removeClass("none");
	}
};
//第一轮的数字验证
$("#firstOutSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第1轮淘汰供应商数必须大于等于零"); 
			$(this).val("")
		};
	}
});
$("#firstKeepSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第1轮最低保留供应商数必须大于零"); 
			$(this).val("")
		};
	}
})
$("#secondOutSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第2轮淘汰供应商数必须大于等于零"); 
			$(this).val("")
		};
	}
})
$("#secondKeepSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第2轮最低保留供应商数必须大于零"); 
			$(this).val("")
		};
	}
})
$("#priceReduction").on('change',function(){		
	if($(this).val()!=""){
		
		if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))){ 
			parent.layer.alert("降价幅度必须大于零"); 
			$(this).val("");
			
			return
		};
		$(this).val(parseFloat($(this).val()).toFixed(3));
	};
});
$("#rawPrice").on('change',function(){		
	if($(this).val()!=""){
		
		if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))){ 
			parent.layer.alert("竞价起始价必须大于零"); 	
			$(this).val("");
			
			return
		};
		$(this).val(parseFloat($(this).val()).toFixed(3));
	};
});
function listDetailed(){
	$.ajax({
	   	url:CheckList,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'packageId':data1.id
	   	},
	   	success:function(data){
	   		checkListData=data.data
	   		minData()
	   	}
	 });	  
}
function minData(){
	if(checkListData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#tbodym').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "detailedName",
				title: "材料设备名称",
				align: "left",
				halign: "left",

			},
			{
				field: "brand",
				title: "品牌要求",
				align: "center",
				halign: "center",
				width:'100px',

			},
			{
				field: "detailedVersion",
				title: "型号规格",
				halign:"center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "detailedCount",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "detailedUnit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},
			{
				field: "budget",
				title: "采购预算（元）",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				if(value==undefined){
					var budget="暂无预算"
				}else{
					var budget=value;
				};
				return budget
				}
			},
			{
				field: "detailedContent",
				title: "备注",
				halign: "left",
				align: "left",
			},
			{
				field: "#",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				formatter:function(value, row, index){	
				var mixtbody=""
                mixtbody='<div class="btn-group">'
	                 +'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=detailEdit(\"'+index+'\")>编辑</a>'
	                 +'<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none"  onclick=itemdelte(\"'+row.id+'\")>删除</a></div>'
				return mixtbody
				}
				 
			}
		]
	});
	$('#tbodym').bootstrapTable("load", checkListData);
}
//添加设备
function add_min(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加设备信息'
        ,area: ['600px', '600px']
        ,content:'Auction/Auction/Agent/AuctionPurchase/model/checkListItem.html'
        ,btn: ['确定','取消'] 
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	//把之前的值渲染到页面上
        	iframeWind.$('#packageId').val(data1.id);//名称
        }
        //确定按钮
        ,yes: function(index,layero){  
        	var iframeWinds=layero.find('iframe')[0].contentWindow;
        	if(iframeWinds.$('#detailedName').val()==""){ 
					parent.layer.alert("设备名称不能为空"); 
					return;
			};
			if(iframeWinds.$('#detailedVersion').val()==""){ 
					parent.layer.alert("型号规格不能为空"); 
					return;
			};
			if(iframeWinds.$('#detailedCount').val()==""){ 
					parent.layer.alert("数量不能为空"); 
					return;
			};
            if(!(/^[0-9]*$/.test(iframeWinds.$("#detailedCount").val()))){ 
					parent.layer.alert("数量只能是正整数"); 
					return;
			};
			if(iframeWinds.$('#detailedUnit').val()==""){ 
					parent.layer.alert("单位不能为空"); 
					return;
			};
			if(!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))){ 
					parent.layer.alert("采购预算只能是正整数"); 
					return;
			};
			if(iframeWinds.$('#budget').val().length>10){ 
					parent.layer.alert("采购预算过长"); 
					return;
			};
			$.ajax({
			   	url:CheckListSave,
			   	type:'post',
			   	dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:iframeWinds.$("#form").serialize(),
			   	success:function(data){	
			   		listDetailed()
			   	}
			 });      	 	
		    parent.layer.close(index)
        },
        btn2:function(){       	
        },       
      }); 	
}
//删除设备信息
function itemdelte(uid){
	parent.layer.confirm('确定要删除该设备信息', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		  $.ajax({
			   	url:CheckListdelete,
			   	type:'post',
			   	dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		'id':uid
			   	},
			   	success:function(data){	
			   		listDetailed()
			   	}
			});   
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});	
    
}
//编辑设备信息
function detailEdit($index){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加明细信息'
        ,area: ['600px', '600px']
        ,content:'Auction/Auction/Agent/AuctionPurchase/model/checkListItem.html'
        ,btn: ['确定','取消']
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(checkListData[$index])
        	
        }
        //确定按钮
        ,yes: function(index,layero){
        	var iframeWinds=layero.find('iframe')[0].contentWindow;
           if(iframeWinds.$('#detailedName').val()==""){
        		parent.layer.alert("请输入名称");	     	 		
	     	    return;
        	}
        	if(iframeWinds.$('#detailedCount').val()==""){
        		parent.layer.alert("请输入数量");	     	 		
	     	    return;
        	}
        	if(!(/^[0-9]*$/.test(iframeWinds.$('#detailedCount').val()))){ 
		        parent.layer.alert("数量只能是正整数");  
		        return;
		     };
        	if(iframeWinds.$('#detailedUnit').val()==""){
        		parent.layer.alert("请输入单位");	     	 		
	     	    return;
        	};
        	if(iframeWinds.$('#detailedUnit').val().length>10){
        		parent.layer.alert("单位过长");	     	 		
	     	    return;
        	};
        	if(!(/^[0-9]*$/.test(iframeWinds.$("#budget").val()))){ 
					parent.layer.alert("采购预算只能是正整数"); 
					return;
			};
			if(iframeWinds.$('#budget').val().length>10){ 
					parent.layer.alert("采购预算过长"); 
					return;
			};
           $.ajax({
			   	url:CheckListupdate,
			   	type:'post',
			   	dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:iframeWinds.$("#form").serialize(),
			   	success:function(data){	
			   		listDetailed()
			   	}
			});           
			parent.layer.close(index); 		        
        },
        btn2:function(){       	
        },       
      }); 
}

//导出模版
function exportExcel(){
	var url = config.FileHost + "/FileController/download.do" + "?fname=材料设备模板.xls&ftpPath=/Templates/Pur/Pur_Equipment_Bill_Of_Material_Template.xls";
	window.location.href =$.parserUrlForToken(url) ;
	
}
//excel导入
function importf(obj){ 
  var f = obj.files[0];
  var formFile = new FormData();
  formFile.append("packageId", data1.id); 
  formFile.append("excel", f); //加入文件对象
  var data=formFile
   $.ajax({
		type: "post",
		url: saveByExcelDetailed,
		async: false,
		dataType: 'json',
		cache: false,//上传文件无需缓存
        processData: false,//用于对data参数进行序列化处理 这里必须false
        contentType: false, //必须
		data: data,
		success: function(data) {	
			listDetailed()
		}
	});
	
}
   //项目类型  
var itemTypeId=[]//项目类型的ID
var itemTypeName=[]//项目类型的名字
var itemTypeCode=[]//项目类型编号
function dataType(){
	if(data1.dataTypeId!=""&&data1.dataTypeId!=undefined&&data1.dataTypeId!=null){
		typeIdList=data1.dataTypeId;	   
	}
	if(projectType==0){
		var code="A"
	}else if(projectType==1){
		var code="B"
	}else if(projectType==2){
		var code="C"
	}
	 sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList) );
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code='+code,
		btn:['确定','取消'],
		scrolling:'no',
		success:function(layero, index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;		        	        
		},
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit()//触发事件得到选中的项目类型的值
			//iframeWin.dataTypeList为所选项目类型返回的数组
			if(dataTypeList.length==0){
				parent.layer.alert("请选择一条或多条项目类型")
	        	return
			}
			itemTypeId=[]//项目类型的ID
			itemTypeName=[]//项目类型的名字
			itemTypeCode=[]//项目类型编号
						
			for(var i=0;i<dataTypeList.length;i++){
				itemTypeId.push(dataTypeList[i].id)	
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList=itemTypeId.join(",")//项目类型的ID
			typeNameList=itemTypeName.join(",")//项目类型的名字
			typeCodeList=itemTypeCode.join(",")//项目类型编号
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList)
			parent.layer.close(index)
		}
	
	});
}

function formd(){
	 var Tdr="";  
	      Tdr+='<input type="hidden" name="id" value="'+ packageData.id +'"/>'
	     	if(packageData.packageName!==""&&packageData.packageName!=undefined){
	     		Tdr+='<input type="hidden" name="packageName" value="'+ packageData.packageName +'"/>'	     		
	     	};
         	if(packageData.packageNum!==""&&packageData.packageNum!=undefined){
         		Tdr+='<input type="hidden" name="packageNum" value="'+ packageData.packageNum +'"/>'
         	};
         	if(packageData.isOfferFile!==""&&packageData.isOfferFile!=undefined){
         		Tdr+='<input type="hidden" name="isOfferFile" value="'+ packageData.isOfferFile +'"/>'
			};
			 if(packageData.auctionType!==""&&packageData.auctionType!=undefined){
				Tdr+='<input type="hidden" name="auctionType" value="'+ packageData.auctionType +'"/>'
			};
         	if(packageData.auctionType==0||packageData.auctionType==1){
	         	if(packageData.auctionModel!==""&&packageData.auctionModel!=undefined){
	         		Tdr+='<input type="hidden" name="auctionModel" value="'+ packageData.auctionModel +'"/>'
	         	}
	         	if(packageData.auctionModel==0){	         		
	         		if(packageData.isPrice!==""&&packageData.isPrice!=undefined){
	         		Tdr+='<input type="hidden" name="isPrice" value="'+ packageData.isPrice +'"/>'
		         	};		         	
	         	}
         	};         	
         	if(packageData.auctionType!=2&&packageData.auctionType!=3){
         		if(packageData.auctionDuration!==""&&packageData.auctionDuration!=undefined){
	         		Tdr+='<input type="hidden" name="auctionDuration" value="'+ packageData.auctionDuration +'"/>'
	         	}
         		
         	};  
         	if(packageData.isPrice!==""&&packageData.isPrice!=undefined){
	     		Tdr+='<input type="hidden" name="isPrice" value="'+ packageData.isPrice +'"/>'
	        };
         	if(packageData.isPrice==0){
         		if(packageData.auctionType==0){
         			if(packageData.priceReduction!==""&&packageData.priceReduction!=undefined){
		         		Tdr+='<input type="hidden" name="priceReduction" value="'+ packageData.priceReduction+'"/>'
		         	};
         		}		         		
         		if(packageData.rawPrice!==""&&packageData.rawPrice!=undefined){
         		Tdr+='<input type="hidden" name="rawPrice" value="'+ packageData.rawPrice +'"/>'
         		}; 
         	}
         	if(packageData.auctionType==0){
         		if(packageData.timeLimit!==""&&packageData.timeLimit!=undefined){
	         		Tdr+='<input type="hidden" name="timeLimit" value="'+ packageData.timeLimit +'"/>'
	         	}
         	};         	         	        	
         	if(packageData.outType!==""&&packageData.outType!=undefined){
         	   Tdr+='<input type="hidden" name="outType" value="'+ packageData.outType +'"/>'
         	};
         	if(packageData.isShowNum!==""&&packageData.isShowNum!=undefined){
         	   Tdr+='<input type="hidden" name="isShowNum" value="'+ packageData.isShowNum +'"/>'
         	};
         	if(packageData.isShowName!==""&&packageData.isShowName!=undefined){
         	   Tdr+='<input type="hidden" name="isShowName" value="'+ packageData.isShowName +'"/>'
         	};
         	if(packageData.isShowPrice!==""&&packageData.isShowPrice!=undefined){
         	   Tdr+='<input type="hidden" name="isShowPrice" value="'+ packageData.isShowPrice +'"/>'
         	};
         	if(packageData.dataTypeId!==""&&packageData.dataTypeId!=undefined){
         	   Tdr+='<input type="hidden" name="dataTypeId" value="'+ packageData.dataTypeId +'"/>'
         	};
         	if(packageData.dataTypeName!==""&&packageData.dataTypeName!=undefined){
         	   Tdr+='<input type="hidden" name="dataTypeName" value="'+ packageData.dataTypeName +'"/>'
         	};
         	if(packageData.dataTypeCode!==""&&packageData.dataTypeCode!=undefined){
         	   Tdr+='<input type="hidden" name="dataTypeCode" value="'+ packageData.dataTypeCode +'"/>'
         	};
         	if(packageData.content!==""&&packageData.content!=undefined){
         	   Tdr+='<input type="hidden" name="content" value="'+ packageData.content +'"/>'
         	};
         	if(packageData.auctionType==2||packageData.auctionType==3||packageData.auctionType==4){
         		if(packageData.intervalTime!==""&&packageData.intervalTime!=undefined){        		
	         	   Tdr+='<input type="hidden" name="intervalTime" value="'+ packageData.intervalTime +'"/>'
	         	}
         	};
         	if(packageData.auctionType>1&&packageData.auctionType<4){//当竞价为多轮竞价时才传值
         		
         		if(packageData.firstAuctionTime!==""&&packageData.firstAuctionTime!=undefined){
	         	  Tdr+='<input type="hidden" name="firstAuctionTime" value="'+ packageData.firstAuctionTime +'"/>'
	         	};
	         	if(packageData.outType==0){//当为公告中设置时传值
	         		if(packageData.firstOutSupplier!==""&&packageData.firstOutSupplier!=undefined){
		         	 Tdr+='<input type="hidden" name="firstOutSupplier" value="'+ packageData.firstOutSupplier +'"/>'
		         	};
		         	if(packageData.firstKeepSupplier!==""&&packageData.firstKeepSupplier!=undefined){
		         	  Tdr+='<input type="hidden" name="firstKeepSupplier" value="'+ packageData.firstKeepSupplier +'"/>'
		         	};
	         	}	         	
	         	if(packageData.secondAuctionTime!==""&&packageData.secondAuctionTime!=undefined){
	         	  Tdr+='<input type="hidden" name="secondAuctionTime" value="'+ packageData.secondAuctionTime +'"/>'
	         	};
	         	if(packageData.auctionType==3){//当为3轮竞价的时候才传值
	         		if(packageData.outType==0){//当为公告中设置时传值
		         		if(packageData.secondOutSupplier!==""&&packageData.secondOutSupplier!=undefined){
			         	  Tdr+='<input type="hidden" name="secondOutSupplier" value="'+ packageData.secondOutSupplier +'"/>'
			         	};
			         	
			         	if(packageData.secondKeepSupplier!==""&&packageData.secondKeepSupplier!=undefined){
			         	  Tdr+='<input type="hidden" name="secondKeepSupplier" value="'+ packageData.secondKeepSupplier +'"/>'
			         	};
		         	}
		         	if(packageData.thirdAuctionTime!==""&&packageData.thirdAuctionTime!=undefined){
		         	  Tdr+='<input type="hidden" name="thirdAuctionTime" value="'+ packageData.thirdAuctionTime +'"/>'
		         	};
	         	};
	         	Tdr+='<input type="hidden" name="outSupplier" value="'+ $('input[name="outSupplierd"]:checked').val() +'"/>'
	         	
         	};
         	if(packageData.auctionType==4){
         		if(packageData.countType!==""&&packageData.countType!=undefined){
	         		Tdr+='<input type="hidden" name="auctionOutTypes[0].countType" value="'+ packageData.countType +'"/>'
	         	};
	         	if(packageData.countValue!==""&&packageData.countValue!=undefined){
	         		Tdr+='<input type="hidden" name="auctionOutTypes[0].countValue" value="'+ packageData.countValue +'"/>'
	         	};
			    if(packageData.outValue!==""&&packageData.outValue!=undefined){
	         		Tdr+='<input type="hidden" name="auctionOutTypes[0].outValue" value="'+ packageData.outValue +'"/>'
	            };
			    if(packageData.countType==0){
			    	 if($('input[name="keepValue0"]').val()!==""&&$('input[name="keepValue0"]').val()!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes[0].keepValue" value="'+ $('input[name="keepValue0"]').val() +'"/>'
		           };
			    };
			    if(totalCount==0){
			    	if(packageData.countValue!==""&&packageData.countValue!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes[1].countValue" value="'+ $('#lastCount').val() +'"/>'
		         };
				    if(packageData.outValue!==""&&packageData.outValue!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes[1].outValue" value="'+ $('#lastout').val() +'"/>'
		         };
				 if($('#lastKeep').val()!==""&&$('#lastKeep').val()!=undefined){
			         		Tdr+='<input type="hidden" name="auctionOutTypes[1].keepValue" value="'+ $('#lastKeep').val() +'"/>'
			      };
			    }else if(totalCount>0){
			    	if($('#lastCount').val()!==""&&$('#lastCount').val()!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes['+(totalCount+1)+'].countValue" value="'+ $('#lastCount').val() +'"/>'
		         };
				    if($('#lastout').val()!==""&&$('#lastout').val()!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes['+(totalCount+1)+'].outValue" value="'+ $('#lastout').val() +'"/>'
		         };
				   if($('#lastKeep').val()!==""&&$('#lastKeep').val()!=undefined){
		         		Tdr+='<input type="hidden" name="auctionOutTypes['+(totalCount+1)+'].keepValue" value="'+ $('#lastKeep').val() +'"/>'
		           };
			    };
			    Tdr+='<input type="hidden" name="lastOutType" value="'+ $('input[name="lastOutType"]:checked').val() +'"/>'
			    Tdr+='<input type="hidden" name="outSupplier" value="'+ $('input[name="outSupplierb"]:checked').val() +'"/>'
        }        	
     $('#forms').html(Tdr)
}

var strSel = '<select [id] style="width: 80px;height: 26px;" [onchange]>';
strSel += '<option value="0">大于等于</option><option value="1">大于</option></select>';
function setOutType(obj,type){
	var supplierCount = "";
	
	if(type == 0){
		supplierCount = $("#supplierCount_" + obj).val();
		if(supplierCount==""){
			return;
		}
		if(supplierCount == 0){
			$("#tbOutType").html("");
			$("#lastCount").val("");
			totalCount=0;
			$("#sel_0").val(0);
			$("#sel_last").val(0);
			$("#span0").hide();
			$("#span1").show();
			$("#trOutType").hide();
			$("#btnAddOutType").hide();
			return;
		};		
		if(totalCount == 0){
			$("#lastCount").val(supplierCount);
		}
	}
	else if(type == 1){
		obj = totalCount;
		supplierCount = $("#supplierCount_" + obj).val();
		if(supplierCount==""){
			return;
		}
		if(supplierCount == ""){
			top.layer.alert("请先填写第" + (1+totalCount) + "行的条件值！");
			return;
		}
		totalCount++;
		
		var strHtml = '<tr><td style="text-align: left;" colspan="2">首轮报价供应商数： ';
		strHtml += '<select id="selTemp_' + totalCount + '" style="width: 80px;height: 26px;" disabled="disabled">';
		if($("#sel_" + obj).val() == "0"){
			strHtml += '<option value="0">小于</option><option value="1">小于等于</option></select>';
		}else{
			strHtml += '<option value="1">小于等于</option><option value="0">小于</option></select>';
		}
		strHtml += ' <input type="text" style="width:50px" disabled="disabled" id="supplierCountTemp_' + totalCount + '" value="' + supplierCount + '" />';
		strHtml += '且' + strSel.replace('[id]','id="sel_'+ totalCount + '"').replace('[onchange]','onchange="changeSel(' + totalCount + ')"');	
		strHtml += ' <input type="text" style="width:50px" onblur="setOutType(' + totalCount + ',2)" id="supplierCount_' + totalCount + '"/>';
		strHtml += '家时，每轮淘汰';
		strHtml += '<input type="text" style="width:50px" id="outCount_' + totalCount + '"/>';
		strHtml += '家供应商；';
		$("#tbOutType").append(strHtml);
		
		$("#lastCount").val("");
		$("#lastout").val("");
		$("#lastKeep").val("");
		$("#sel_last").val("0");		    
		var Tdrt='<input type="hidden" name="auctionOutTypes['+ totalCount +'].countType" value="'+ $('#sel_'+totalCount).val() +'"/>';
			Tdrt+='<input type="hidden" name="auctionOutTypes['+ totalCount +'].countValue" />';
			Tdrt+='<input type="hidden" name="auctionOutTypes['+ totalCount +'].outValue" />';
		
		$("#formCount").append(Tdrt)
		$('#supplierCount_'+totalCount).on('change',function(){
			if($(this).val()!=""){
				if(!(/^[0-9]\d*$/.test($(this).val()))){ 
				   parent.layer.alert("供应商数量只能是正整数"); 	
					$(this).val("");			
					return;
				};
			}
		   	$('input[name="auctionOutTypes['+ totalCount +'].countValue"]').val($(this).val())		 			
		});
		$('#outCount_'+totalCount).on('change',function(){
			if($(this).val()!=""){
				if(!(/^[0-9]\d*$/.test($(this).val()))){ 
				   parent.layer.alert("每轮淘汰供应商数量只能是正整数"); 	
					$(this).val("");			
					return;
				};
			}
		    $('input[name="auctionOutTypes['+ totalCount +'].outValue"]').val($(this).val())		   
		});	
	}
	else{
		supplierCount = $("#supplierCount_" + obj).val();
		if(supplierCount==""){
			return;
		}
		if(obj == totalCount){
			$("#lastCount").val(supplierCount);
		}
	}
	
	for (i = obj; i < totalCount; i++) {
		if(i == obj){
			supplierCount = $("#supplierCount_" + i).val();
			$("#supplierCountTemp_" + (i+1)).val(supplierCount);
			$("#supplierCount_" + (i+1)).val("");
		}else{
			$("#supplierCountTemp_" + (i+1)).val("");
			$("#supplierCount_" + (i+1)).val("");
			$("#lastCount").val("");
		}
	}
};
$("#supplierCount_0").on('change',function(){
	if($(this).val()!=""){
		if(!(/^[0-9]\d*$/.test($(this).val()))){ 
		   parent.layer.alert("供应商数量只能是正整数"); 	
			$(this).val("");			
			return;
		};
	}
})
$("#outCount_0").on('change',function(){
	if($(this).val()!=""){
		if(!(/^[0-9]\d*$/.test($(this).val()))){ 
		   parent.layer.alert("每轮淘汰供应商数量只能是正整数"); 	
			$(this).val("");			
			return;
		};
	}
})
$("#lastout").on('change',function(){
	if($(this).val()!=""){
		if(!(/^[0-9]\d*$/.test($(this).val()))){ 
		   parent.layer.alert("每轮淘汰供应商数量只能是正整数"); 	
			$(this).val("");			
			return;
		};
	}
	$('.lastKeep').val("");
})
$('.lastKeep').on('change',function(){
	if($(this).val()!=""){
		if(!(/^[1-9]\d*$/.test($(this).val()))){ 
		   parent.layer.alert("最终剩余供应商数量能是正整数"); 	
			$(this).val("");			
			return;
		};
		$(".lastkp").html($(this).val())
	}
	if($("#supplierCount_0").val()>0){
		if(parseInt($(this).val())>parseInt($("#lastout").val())){
			parent.layer.alert("最终剩余供应商数量要小于每轮淘汰数");
			$(this).val("");
			$(".lastkp").html("1")
		};
	}else if($("#supplierCount_0").val()==0){
		if(parseInt($(this).val())>parseInt($("#outCount_0").val())){
			parent.layer.alert("最终剩余供应商数量必须要小于每轮淘汰数");
			$(this).val("");
			$(".lastkp").html("1")
		};
	};
	
})
function resetOutType(){
	parent.layer.confirm('确定要重置淘汰条件吗？',function(index, layero){
		$("#supplierCount_0").val("");
		$("#tbOutType").html("");
		$("#formCount").html("");
		$("#lastCount").val("");
		$("#outCount_0").val("");
		$("#lastout").val("");
		$("#lastKeep").val("");
		totalCount=0;
		$("#sel_0").val(0);
		$("#sel_last").val(0);
		$("#span0").show();
		$("#span1").hide();
		$("#trOutType").show();
		$("#btnAddOutType").show();
		parent.layer.close(index);
	});
};
//上传附件
var FileInput = function() {
	var oFile = new Object();	
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx', 'xls'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: true, //是否显示标题  
			//showCaption: true, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			showRemove: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			}

		}).on("filebatchselected", function(event, files) {
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			$.ajax({
				type: "post",
				url: saveImgUrl,
				async: true,
				data: {
					'modelId':data1.id,
					'modelName':'JJ_AUCTION_PROJECT_PACKAGE',
					'fileName':data.files[0].name,
					'fileSize':data.files[0].size / 1000 + "KB",
					'filePath':data.response.data[0]
				},
				datatype: 'json',
				success: function(data) {
					if(data.success==true){
						filesDataView()
					}
				}
			});
			
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function filesDataView() {
	var tr = ""
	var file = "";
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId':data1.id,
			'modelName':'JJ_AUCTION_PROJECT_PACKAGE'			
		},
		datatype: 'json',
		success: function(data) {
			if(data.success==true){
				filesData=data.data				
			}
		}
	});
	if(filesData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'100px',

			},			
			{
				field: "#",
				title: "操作",
				halign: "center",
				width:'80px',
				align: "center",
				formatter:function(value, row, index){				
					return '<button  class="btn btn-sm btn-danger" onclick=fileDetel('+ index +',\"'+row.id +'\")>删除</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
};
function fileDetel(i, uid) {

	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		filesData.splice(i, 1)
		if(uid.length == 32) {
			$.ajax({
				type: "post",
				url: deleteFileUrl,
				async: false,
				dataType: 'json',
				data: {
					"id": uid,
				},
				success: function(data) {}
			});
		}
		filesDataView()
		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

};
function changeSel(obj){
	if(totalCount == 0){
		$("#sel_last").val($("#sel_0").val());
	}
	else{
		if(totalCount == obj){
			$("#sel_last").val($("#sel_" + obj).val());
		}else{
			$("#selTemp_" + (obj+1)).val($("#sel_" + obj).val());
		}
		$('input[name="auctionOutTypes['+ obj +'].countType"]').val($("#sel_" + obj).val())		
	}
}
var etype = [];
var initialValues = [];
var depositAccountList = [];
var pingTaiMoney = [];
var priceTypeList = ['平台服务费','文件费', '代理费', '项目保证金']; 
var projectPrices = "";
var msg =  JSON.parse(sessionStorage.getItem('projectMsg'));
var daMsg = {};
//费用信息查询
function packagePriceData(){
	$("#projectId").val(data1.projectId);
	etype = [];
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":data1.id,
	   		"projectId":data1.projectId,
	   	},
	   	success:function(data){	
	   		//initMoney();
	   		packagePrice=data.data;
	   		if(packagePrice.length >0){
	   			
	   			for(var i=0;i<packagePrice.length;i++){
	   				etype.push(packagePrice[i].priceId);
	   			}
	   		}
	   	}  
	});
	 
	 PackagePrice();
}


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
			'projectId':data1.projectId
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
				};				
			} 
		}	
	});
}

var isSetServiceCharges,ptPrice,isSetSign;
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
					var optionFeiYong = [];
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
					var optionText;
					for(var z=0;z<optionFeiYong.length;z++){
						if(optionFeiYong[z].optionText=="项目保证金"){
							optionText=optionFeiYong[z];
							optionFeiYong.splice(z,1);
							break;
						}
					}
					optionFeiYong.push(optionText);
					for(var i=0;i<optionFeiYong.length;i++){
						
						mixtbody += '<tr>';
						if(optionFeiYong[i].optionText == '项目保证金'){
							mixtbody +='<td style="width: 74px;text-align:center;" rowspan="3"><input '+ (projectSource==1?'disabled="disabled"':"") +' type="checkbox" name="priceOffer" value="'+i+'"><input type="hidden" id="priceId'+i+'" value="' + optionFeiYong[i].id +'" /></td>';
				        	mixtbody +='<td style="text-align: left;" rowspan="3"><input type="hidden" id="priceName'+i+'" value="' + optionFeiYong[i].optionText + '">'+optionFeiYong[i].optionText+'</td>'; 
				        	mixtbody +='<td><input type="hidden"  id = "payWay'+i+'" value = "0">银联支付</td> ';
						}
						else{
							if(optionFeiYong[i].optionText == '平台服务费'){
								mixtbody +='<td style="width: 74px;text-align:center;"><input disabled="disabled" checked="checked" type="checkbox" name="priceOffer" value="'+i+'"><input type="hidden" id="priceId'+i+'" value="' + optionFeiYong[i].id +'" /></td>';
					        	mixtbody +='<td style="text-align: left;"><input type="hidden" id="priceName'+i+'" value="' + optionFeiYong[i].optionText + '">'+optionFeiYong[i].optionText+'</td>'; 
					        	mixtbody +='<td><input type="hidden"  id = "payWay'+i+'" value ="1">移动支付</td> ';
							}else{
								mixtbody +='<td style="width: 74px;text-align:center;"><input '+ (projectSource==1?'disabled="disabled"':"") +' type="checkbox" name="priceOffer" value="'+i+'"><input type="hidden" id="priceId'+i+'" value="' + optionFeiYong[i].id +'" /></td>';
					        	mixtbody +='<td style="text-align: left;"><input type="hidden" id="priceName'+i+'" value="' + optionFeiYong[i].optionText + '">'+optionFeiYong[i].optionText+'</td>'; 
					        	mixtbody +='<td><input type="hidden"  id = "payWay'+i+'" value ="1">移动支付</td> ';
							}
							
						}
						if(optionFeiYong[i].optionText == '平台服务费'){
							mixtbody +='<td style="text-align: left;">';
					        mixtbody +=		'<lable><input readonly="readonly" class="payTime" type="radio" name="payTime'+i+'" value="0" checked="checked"/>报价前</lable>';
					        mixtbody +='</td>';
					        mixtbody +='<td  style="text-align: left;width:200px;">';
					
							mixtbody +=		'<div class="payType2"><input readonly="readonly" class="payType" type="radio" checked="checked" name="payType'+i+'" value="1" />固定金额收取（元）</div>'  ;
					        mixtbody +='</td>';
					        mixtbody +='<td style="width:120px;text-align: right;">';
					        mixtbody +=		'<input type="text" readonly="readonly" name="price'+i+'" id="price'+i+'"  class="form-control prices pricesPt" style="text-align: right;"/>';
					        mixtbody +='</td>';
					        mixtbody +='</tr>';
						}else{
							mixtbody +='<td style="text-align: left;">';
					        mixtbody +=		'<lable><input '+ (projectSource==1?'readonly="readonly"':"") +' class="payTime" type="radio" name="payTime'+i+'" value="0" checked="checked"/>报价前</lable>';
					        mixtbody +='</td>';
					        mixtbody +='<td  style="text-align: left;width:200px;">';
					
							mixtbody +=		'<div class="payType2"><input '+ (projectSource==1?'readonly="readonly"':"") +' class="payType" type="radio" checked="checked" name="payType'+i+'" value="1" />固定金额收取（元）</div>'  ;
					        mixtbody +='</td>';
					        mixtbody +='<td style="width:120px;text-align: right;">';
					        mixtbody +=		'<input type="text" '+ (projectSource==1?'readonly="readonly"':"") +' name="price'+i+'" id="price'+i+'"  class="form-control prices" style="text-align: right;"/>';
					        mixtbody +='</td>';
					        mixtbody +='</tr>';
						}
				       
				        if(optionFeiYong[i].optionText == '项目保证金'){
				        	
				   	  		mixtbody +='<tr>';
				   	  		mixtbody +='<td style="text-align: right;">收取机构</td>';
				   	  		mixtbody +='<td style="text-align: left;">';
				   	  		mixtbody +=		'<input type="radio" '+ (projectSource==1?'disabled="disabled"':"") +' name="agentType'+i+'" class="agentType" value="0" checked="checked" />平台';
							mixtbody +=		'<span id="daili"><input '+ (projectSource==1?'disabled="disabled"':"") +' type="radio" class="agentType" name="agentType'+i+'" value="1"/>代理机构</span>';
							mixtbody +=		'<input '+ (projectSource==1?'disabled="disabled"':"") +' type="radio" name="agentType'+i+'"  class="agentType" value="2" />采购人';
							mixtbody +='</td>';
							mixtbody +='<td style="text-align: right;"><i style="color:#C9302C;font-size:14px">*</i>开户银行</td>';
							mixtbody +='<td>'
				   	  		mixtbody +=		'<input '+ (projectSource==1?'readonly="readonly"':"") +' type="text" name="bankName" id="bankName" class="form-control"/>';
							mixtbody +='</td>';
				   	  		mixtbody +='</tr>';
				   	  		mixtbody +='<tr>';
				   	  		mixtbody +='<td style="text-align: right;"><i style="color:#C9302C;font-size:14px">*</i>账户名</td>';
				   	  		mixtbody +='<td style="width:320px">';
				   	  		if(projectSource==1){
				   	  			mixtbody +=		'<input '+ (projectSource==1?'readonly="readonly"':"") +' type="text" name="bankAccount" id="bankAccount" class="form-control"/>';
				   	  		}else{
				   	  			mixtbody +='<div style="position:relative;">'
							      	mixtbody +='<span style="margin-left:86px;width:18px;overflow:hidden;">'
							       	mixtbody +='<select  id="bankAccountSelect" size="1" class="form-control" style="width:300px;margin-left:-86px;display: inline;">'
							            
							        mixtbody +='</select>'
							        mixtbody +='</span>'  
							        mixtbody +='<input  type="text" id="bankAccount" name="bankAccount"style="width: 265px;margin-left: -299px;height: 25px;border: none;">'
								mixtbody +='</div>'
				   	  		};				   	  							   	  		
							mixtbody +='</td>';
							mixtbody +='<td style="text-align: right;"><i style="color:#C9302C;font-size:14px">*</i>账号</td>';
							mixtbody +='<td>'
				   	  		mixtbody +=		'<input '+ (projectSource==1?'readonly="readonly"':"") +' type="text" name="bankNumber" id="bankNumber" class="form-control"/>';
							mixtbody +='</td>';
				   	  		mixtbody +='</tr>';
				   	  		
				        }
				        
						
					}
					
					$('#tbodybzj').html(mixtbody);
					$(".bai").attr("disabled","disabled");
					$(".charge").attr("disabled","disabled");
					$(".reduceCharge").attr("disabled","disabled");
					$(".addCharge").attr("disabled","disabled");
					if(msg.agentId != undefined &&msg.agentId == "no"){
						$("#daili").hide();
					}else{
						$("#daili").show();
					}					
					//金额初始化
					initMoney(optionFeiYong);					
					//数据回显
					for(var h =0;h<optionFeiYong.length;h++){
						if(packagePrice.length>0){
							
							for(var x=0;x <packagePrice.length;x++){
								
								if(packagePrice[x].priceId == optionFeiYong[h].id){
									$("input[name='payTime"+h+"']").val([packagePrice[x].payTime]);//收费方式
									
									if(packagePrice[x].payTime == '1'){//中标供应商缴纳
										if(packagePrice[x].payType == '0'){
											//百分比收取
											$('#price' + h).attr("disabled","disabled");
											$("#payType"+h).attr("disabled",false);
											$("#reduceCharge"+h).attr("disabled",false);
											$("#Charge_Percents"+ h).attr("disabled",false);
											$("#addCharge"+ h).attr("disabled",false);
										}else{
											//固定金额收取
											$("#payType"+h).attr("disabled",false);
											$('#price' + h).attr("disabled",false);
											$("#reduceCharge"+h).attr("disabled","disabled");
											$("#Charge_Percents"+ h).attr("disabled","disabled");
											$("#addCharge"+ h).attr("disabled","disabled");
											$('#price' + h).val(packagePrice[x].price ?(packagePrice[x].price.toFixed(2)):"");//金额
										}
										
									}else{
										if(packagePrice[x].payType == '0'){
											//百分比收取
											$('#price' + h).attr("disabled","disabled");
											$("#payType"+h).attr("disabled",false);
											$("#reduceCharge"+h).attr("disabled",false);
											$("#Charge_Percents"+ h).attr("disabled",false);
											$("#addCharge"+ h).attr("disabled",false);
										}else{
											//固定金额收取
											$("#payType"+h).attr("disabled","disabled");
											$("#reduceCharge"+h).attr("disabled","disabled");
											$("#Charge_Percents"+ h).attr("disabled","disabled");
											$("#addCharge"+ h).attr("disabled","disabled");
											$('#price' + h).attr("disabled",false);
											$('#price' + h).val(packagePrice[x].price ?(packagePrice[x].price.toFixed(2)):"");//金额
										}
									}
									$("input[name='payType"+h+"']").val([packagePrice[x].payType]);//收取方式
									if(packagePrice[x].payType == '0' ){
										//百分比收取
										$("#Charge_Percents"+h).val(((packagePrice[x].chargePercent)||0));
									}else{
										$("#Charge_Percents"+h).val("0");
									}
									
									
									
									if(packagePrice[x].priceName == '项目保证金'){
										//收取机构
										$("input[name='agentType"+h+"']").val([packagePrice[x].agentType]);
										findBank(packagePrice[x].agentType);
										$("#bankName").val(((packagePrice[x].bankName)||""))//开户银行
										$("#bankAccount").val(((packagePrice[x].bankAccount)||""))//账户名
										$("#bankNumber").val(((packagePrice[x].bankNumber)||""))//账号
									}
								}
							}
						}
					}
					$('.pricesPt').val(ptPrice);
					//回显哪些是已经保存过的费用
					var checkBoxAll = $("input[name='priceOffer']");
					for(var i = 0; i < etype.length; i++) {
						$.each(checkBoxAll, function(j, checkbox) {
							var checkValue = $("#priceId"+j).val();
							if(etype[i] == checkValue) {
								$(checkbox).attr("checked", true);
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
					
				}
				
				
			}
		});
};
//验证
function checkPrice(){
	projectPrices = "";
	var temp = true;
	//获取缴纳费用信息的数据
	$("input[name='priceOffer']:checked").each(function(){
		var index = $(this).val();		
		//验证费用信息表单
		if(!projectPriceCheck(index)){

			temp = false;
		}
	});
	
	//console.log(projectPrices);
	return temp;
}
//查找账户

function findServiceCharges(){
	$.ajax({
			type: "post",
			url: config.Syshost+'/EnterpriseChargesController/findServiceCharges.do',
			datatype: 'json',
			data:{
				'packageId':data1.id
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
					}				
				}
		}
   })
	
}
//验证金额
function projectPriceCheck(i){
	var price = $('#price'+i+'').val();
	var priceName = $('#priceName'+i+'').val();
	var payType = $('input[name="payType'+i+'"]:checked').val();
	if(payType == '1'){
		if(price != "" && !(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test(price))){ 
			parent.layer.alert("金额只能是数字"); 	
			return false;
		};
		
		if(price != "" && price <= 0){ 
			parent.layer.alert(priceName+"的金额不能为零"); 	
			return false;
		};
		
		if(price != "" && price.split('.').length >1 && price.split('.')[1].length>2){ 
			parent.layer.alert("金额只能保留两位小数"); 	
			return false;
		};
		
		if(price != ""){
			price = parseFloat(price).toFixed(2);
			var num = price.split('.')[0];
			if(num.length>17){
				parent.layer.alert("金额不能超过17位");	     	 		
		 	    return false;
			}
		}
		
		projectPrices += "&projectPrices["+i+"].price=" + price;//费用金额
	}else{
		//判断百分比
		var chargePercent = $("#Charge_Percents"+i+"").val();
		
		if(chargePercent!=0 && !(/^[1-9]\d*$/.test(chargePercent))){
			parent.layer.alert(priceName+"的百分比只能是整数"); 	
			return false;
		}
		
		if(chargePercent!="" && chargePercent > 100){
			parent.layer.alert(priceName+"的百分比不能大于100"); 	
			return false;
		}
		
		projectPrices += "&projectPrices["+i+"].chargePercent=" + chargePercent;//收取百分比
	}
	if(priceName=="竞价采购文件费"){
		if(filesData.length==0){
			parent.layer.alert("请上传竞价采购文件"); 	
			return false;
		}
	}
	projectPrices += "&projectPrices["+i+"].projectId=" + data1.projectId; //项目id
	//projectPrices += "&projectPrices["+i+"].packageId=" + data1.id;//包件id
	projectPrices += "&projectPrices["+i+"].priceId=" + $("#priceId"+i).val(); //费用类型
	projectPrices += "&projectPrices["+i+"].priceName=" + priceName;//费用名称
	projectPrices += "&projectPrices["+i+"].payWay=" + $("#payWay"+i).val();//支付途径
	projectPrices += "&projectPrices["+i+"].payTime=" + $("input[name='payTime"+i+"']:checked").val();//收费方式
	projectPrices += "&projectPrices["+i+"].payType=" + $("input[name='payType"+i+"']:checked").val();//收取方式

	if(priceName =="项目保证金"){
		if(!checkBank()){
			return false;
		}else{
			projectPrices += "&projectPrices["+i+"].agentType=" + $("input[name='agentType"+i+"']:checked").val();//收取机构
			projectPrices += "&projectPrices["+i+"].bankName=" + $("#bankName").val();//收费方式
			projectPrices += "&projectPrices["+i+"].bankAccount=" + $("#bankAccount").val();//收取方式
			projectPrices += "&projectPrices["+i+"].bankNumber=" + $("#bankNumber").val();//收取机构
		}
    }
	
	return true;
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


function reduce_Charge(i){
 	var obj =$("#Charge_Percents"+i); 	 	
       if (obj.val() <= 0) {
            obj.val(0);
       } else {
            obj.val(parseInt(obj.val()) - 1);
       }
      obj.change();

 }
 
 function add_Charge(i){
 	   var obj = $("#Charge_Percents" + i);
       obj.val(parseInt(obj.val()) + 1);
       obj.change();          
 }
 
//收费方式点击事件 
$("#tbodybzj").on("change", ".payTime", function(){
	var tr = $(this).parents("tr").eq(0);

	var payType1 = tr.find(".payType1");
	var payType2 = tr.find(".payType2");
	var price = tr.find(".prices");
	if($(this).val() == '0'){
		$(payType2[0].childNodes[0]).prop("checked","checked");
		$(payType1[0].childNodes[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[1]).val("0");
		$(payType1[0].childNodes[2].childNodes[1]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[2]).attr("disabled","disabled");
	
		$(price[0]).attr("disabled",false);
	}
	
	if($(this).val() == '1'){
		$(payType1[0].childNodes[0]).attr("disabled",false);
	}
	
	if($(this).val() == '2'){
		$(payType2[0].childNodes[0]).prop("checked","checked");
		$(payType1[0].childNodes[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[1]).val("0");
		$(payType1[0].childNodes[2].childNodes[1]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[2]).attr("disabled","disabled");
		
		$(price[0]).attr("disabled",false);
	}
	
});


//收取方式点击事件
$("#tbodybzj").on("change", ".payType", function(){
	var tr = $(this).parents("tr").eq(0);

	var price = tr.find(".prices");
	var payType1 = tr.find(".payType1");
	if($(this).val() == '0'){//百分比
		$(price[0]).val("");
		$(price[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[0]).attr("disabled",false);
		$(payType1[0].childNodes[2].childNodes[1]).attr("disabled",false);
		$(payType1[0].childNodes[2].childNodes[2]).attr("disabled",false);
		
	}
	
	if($(this).val() == '1'){//固定金额
		$(price[0]).attr("disabled",false);
		$(payType1[0].childNodes[2].childNodes[0]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[1]).val("0");
		$(payType1[0].childNodes[2].childNodes[1]).attr("disabled","disabled");
		$(payType1[0].childNodes[2].childNodes[2]).attr("disabled","disabled");
	}
	
});

//收取机构点击事件
$("#tbodybzj").on("change", ".agentType", function(){
	
	findBank($(this).val());
});