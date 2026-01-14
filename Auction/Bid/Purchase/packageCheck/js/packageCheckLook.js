var packageCheckListInfo= []//发添加的tabs的数组
var packageCheckListId="";
var _$index=""
var CheckListlist=config.bidhost +'/PackageCheckListController/list.do' //评审项查询
var CheckItemUrl=config.bidhost +'/PackageCheckItemController/list.do'//评价项查询
var supplierType;
var AccessoryList=[];
var businessPriceSetData="";
var sortNum=0;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examTypenum=getUrlParam('examType');
var offerFile;
var clearBidding = null;
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
};
var packageCheckListInfo=[]//评审项信息
/*====ajax请求获取包件信息的数据获取====*/
var packageInfo;
$(function(){
	if(supplierType!=1){
		$.ajax({
			url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do',
			type:'post',
			//dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:{
				"packageId":packageId
			},
			success:function(data){
				if(data.success){	   	  	
					packageInfo=data.data;//包件信息
					sessionStorage.setItem('packageCheckInfo', JSON.stringify(packageInfo))
					packagedd();
					if(packageInfo.encipherStatus == 1 && examTypenum == 1){
						/* **********    清标项设置    ************** */
						if(!clearBidding){
							clearBidding = new ClearBidding("#clearBiddingWrap", {
								status: 2,  // 1：编辑   2：查看
								bidSectionId: packageId,//包件id
							});
						}
						/* **********    清标项设置  -end   ************** */
					}
				}													
			},
			
			error:function(data){
				parent.layer.alert("获取失败")
			}
		 });
		 if(examTypenum == 1) {
			findBusinessPriceSet(packageInfo.checkPlan,packageId)
			if(businessPriceSetData != "" && businessPriceSetData != undefined) {
				scoreTypeBtn(businessPriceSetData.checkType, packageInfo.checkPlan)
			}
	
		}
		try{
			offerFileList();	
		} catch(e){}
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 	
	});
})
function packagedd(){
	$("#packageName").html(packageInfo.packageName);
	$("#packageNum").html(packageInfo.packageNum);
	$("#dataTypeName").html(packageInfo.dataTypeName);	
	PackageCheckList(0)
	if(examTypenum==1){
		if(packageInfo.checkPlan==0) $("#checkPlan").html('综合评分法');
		if(packageInfo.checkPlan==1) $("#checkPlan").html('最低评标价法');
		if(packageInfo.checkPlan==3) $("#checkPlan").html('最低投标价法');
		if(packageInfo.checkPlan==5) $("#checkPlan").html('经评审的最低投标价法');
		if(packageInfo.checkPlan==2) $("#checkPlan").html('经评审的最低价法(价格评分)');
		$("#doubleEnvelope").html(packageInfo.doubleEnvelope==0?'否':'是');
		$(".tenderTypeW").show();		
		//是否启用双信封
		if(packageInfo.doubleEnvelope==1){
			$('input[name="doubleEnvelope"]').prop('checked',true);
			$("#doubleEnvelope").html("启用双信封");
		}else{
			$('input[name="doubleEnvelope"]').prop('checked',false);
			$("#doubleEnvelope").html("不启用双信封");
			$(".isRead").hide()
		}
		//未通过第一信封的供应商，第二封信不予读取
		if(packageInfo.isReadSecondLetter==1){
			$('input[name="isReadSecondLetter"]').prop('checked',true);
			$("#doubleEnvelope").html("未通过第一信封的供应商，第二封信不予读取");
			
		}else{
			$('input[name="isReadSecondLetter"]').prop('checked',false);
			
			
		}
		//启用暗标
		if(packageInfo.isOpenDarkDoc==1){
			$('input[name="isOpenDarkDoc"]').prop('checked',true);
			
			//暗标编码供应商对照显示机制
			$('input[name="darkSupCode"][value="'+ (packageInfo.darkSupCode||0) +'"]').prop('checked',true);
			$("#isOpenDarkDoc").html("启用暗标");
			packageInfo.darkSupCode!=undefined ? $("#darkSupCode").html(packageInfo.darkSupCode==1?"全部评审项评审结束或流标":"最后一个暗标评审项评审后") : "";
		}else{
			$('input[name="isOpenDarkDoc"]').prop('checked',false);
			$("#isOpenDarkDoc").html("不启用暗标");
		}
	}else if(examTypenum==0){
		if(packageInfo.examCheckPlan==0) $("#checkPlan").html('合格制');
		if(packageInfo.examCheckPlan==1) $("#checkPlan").html('有限数量制');
		$(".tenderTypeW").hide()
	}
	if(packageInfo.checkPlan==1||packageInfo.checkPlan==3||packageInfo.checkPlan==5){
   	    $(".DeviateNum").show();
   	    $('#deviate').html(packageInfo.deviate);
   	    $('.DeviateNumcol').attr('colspan','1')
   	}else{
   	    $(".DeviateNum").hide();
   	    $('.DeviateNumcol').attr('colspan','3')
   	}
	
};
//评审内容tabs的数组
function PackageCheckList(_a){ 	
	if(getUrlParam('examType')!=undefined&&getUrlParam('examType')!=null&&getUrlParam('examType')!=""){
		examTypenum=getUrlParam('examType')
	}else{
		examTypenum=examType
	};
   	$.ajax({
	   	url:CheckListlist,
	   	type:'get',
	   	dataType:'json',
	   	async:true,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageInfo.id,
	   		'examType':examTypenum
	   	},
	   	success:function(data){
	   		if(data.success){				
				packageCheckListInfo=data.data;	
				if(packageCheckListInfo.length>0){
					$('.isCheck').show();
					packageCheckListInfos(_a);
		   			setpackageCheckListInfo(_a);
				}else{
					$('.isCheck').hide()
				} 
		   		
	   		}	
	   	}  
	});
	
};
//评价项数据获取
function checkListData(_index){
	if(packageCheckListInfo.length>0){		
		$.ajax({
			url:CheckItemUrl,
			type:'get',
			dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:{
				"packageCheckListId":packageCheckListInfo[_index].id
			},
			success:function(data){	 
				if(data.data.length>0){
				 packageCheckListInfo[_index]['PackageCheckItems']=data.data
				}
					
			}  
	  	});			
	}
};
function packageCheckListInfos(_d){	
    var strHtml1=""
	for(var i=0;i<packageCheckListInfo.length;i++){
		if(supplierType!=1){
			strHtml1 += '<li role="presentation" ';
			if(i == _d) {
				strHtml1 += ' class="active" ';
			}
			strHtml1 += ' onclick=setpackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName+(examTypenum==1&&packageCheckListInfo[i].envelopeLevel?(packageCheckListInfo[i].envelopeLevel==1?'（第一封）':'（第二封）'):'') + '</a></li>';
		}else{
			if(packageCheckListInfo[i].isShowCheck==0){
				strHtml1 += '<li role="presentation" ';
				if(i == _d) {
					strHtml1 += ' class="active" ';
				}
				strHtml1 += ' onclick=setpackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName+(examTypenum==1&&packageCheckListInfo[i].envelopeLevel?(packageCheckListInfo[i].envelopeLevel==1?'（第一封）':'（第二封）'):'') + '</a></li>';
			}
		}	
	}
	$("#checkList1").html(strHtml1);
	if(packageCheckListInfo.length>0){
		
		sortNum=packageCheckListInfo[packageCheckListInfo.length-1].sort;
	};
	 if(packageCheckListInfo.length==0){
	 	sortNum=0;
	 };
}

//查看评审内容详细信息
function setpackageCheckListInfo($index) {//Num询评审内容的下标，$index包件的下标
	
	if(packageCheckListInfo.length>0){
		var _index=$index;
		
	};
	if(packageCheckListInfo.length>0){	
	packageCheckListId=packageCheckListInfo[_index].id;
	_$index=_index;	
	checkListData(_index);
	var PackageCheckItemList=packageCheckListInfo[_index].PackageCheckItems;
	var strHtml="";
	if(packageCheckListInfo[_index].checkType==0){
		var checkType='合格制';
	}
	if(packageCheckListInfo[_index].checkType==1){
		var checkType='评分制';				 
	}
	if(packageCheckListInfo[_index].checkType==2){
		var checkType='偏离制';
	}
	if(packageCheckListInfo[_index].checkType==3){
		var checkType='评分合格制';
	}
	if(packageCheckListInfo[_index].checkType==4){
		var checkType='竞价';
	}
	if(packageCheckListInfo[_index].isShowCheck==0){
		if(packageCheckListInfo[_index].showCheckInfo!=undefined){
			var showCheckList=packageCheckListInfo[_index].showCheckInfo.split(',');		 
			var List0="",List1="",List2="",List3="";
			for(var n=0;n<showCheckList.length;n++){
			 	if(showCheckList[n]==0){		 		
			 		List0=true;		 		
			 	}
			 	if(showCheckList[n]==1){
			 		List1=true;
			 	}
			 	if(showCheckList[n]==2){
			 		List2=true;
			 	}
			 	if(showCheckList[n]==3){
			 		List3=true;
			 	}
			};
		}
		
	}
	strHtml='<table style="font-size:14px" class="table table-bordered">'
         +'<tr>'
           +'<td style="width:250px;height:30px;line-height:30px;text-align:right">评审方式：</td>'
           +'<td style="text-align: left;"><span style="padding-right:15px">'+ checkType +'</span><span>'+((packageCheckListInfo[_index].checkType==1&&examTypenum!=0)?'权重值：'+packageCheckListInfo[_index].weight:'')+'</span></td>'
		 +'</tr>'
		if(packageInfo.isOpenDarkDoc==1&&packageCheckListInfo[_index].checkType!=4&&examTypenum!=0){
			strHtml+='<tr>'
					+'<td style="text-align:right">是否启用暗标：</td>'
					+'<td style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isShadowMark==1?"是":"否") +'</span></td>'
				+'</tr>'
		}
		if(packageCheckListInfo[_index].checkType == 4){
			strHtml+='<tr>'
					+'<td style="width:200px;height:30px;line-height:30px;text-align:right">竞价起始价计算方式：</td>'
					+'<td style="text-align: left;">'
					+['参与竞价供应商最低报价', '未淘汰供应商最低报价', '参与报价供应商最低报价'][packageCheckListInfo[_index].bidStartPriceFrom]
					+'</td>'
				+'</tr>';
		 }
		if(packageCheckListInfo[_index].checkType==4){
			strHtml+='<tr>'
					+'<td style="text-align:right">竞价设置：</td>'
					+'<td style="text-align: left;">'
						+'<button type="button" class="btn btn-primary" id="packageSetBtn">查看竞价设置</button>'
					+'</td>'
				+'</tr>'
		}
		strHtml+='<tr class="'+(packageCheckListInfo[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">允许最大偏离项数：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].deviate||"") +'</span></td>'          
         +'</tr>'
         +'<tr class="'+(packageCheckListInfo[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">是否计入总数：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isSetTotal==0?"计入总数":"不计入") +'</span></td>'          
         +'</tr>'
         +'<tr class="'+(packageCheckListInfo[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">是否加价：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isAddPrice==0?"加价":"不加价") +'</span></td>'          
	     +'</tr>'
	     +'<tr class="'+((packageCheckListInfo[_index].isAddPrice==0&&packageCheckListInfo[_index].checkType==2)?"":"none" )+'">'
           +'<td style="text-align:right">偏离加价幅度：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ packageCheckListInfo[_index].addPrice +'%</span></td>'          
	     +'</tr>'
	     if(supplierType!=1){
	     strHtml+='<tr>'
	           +'<td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示此评价项：</td>'
	           +'<td style="text-align: left;">' +(packageCheckListInfo[_index].isShowCheck==0?'是':'否')+'</td>'
			 +'</tr>'
			 if(packageCheckListInfo[_index].checkType!=4){
				strHtml+='<tr id="Show_Check" class="'+(packageCheckListInfo[_index].isShowCheck==0?"":"none")+'">'
				+' <td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示评价列项：</td>'
				 +'<td style="text-align: left;">'
					+'<span class="'+(List0==true?'':"none")+'">评价内容、</span>'
					+'<span class="'+(List1==true?'':"none")+'">评价标准、</span>'
					+'<span class="'+(List2==true?'':"none")+'">'+((packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3)?'分值':'是否关键要求')+'、</span>'
					+'<span class="'+(List3==true?'':"none")+'">备注、</span>'
				 +'</td>'
			   +'</tr>'
			 }
	        
	     }         
       strHtml+='</table>'
       +'<table class="table table-hover table-bordered" style="margin:5px auto" id="table_'+ packageCheckListInfo[_index].id +'">'
       +'</table>'
        +'<table class="table  table-bordered red '+((packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3)?"":"none" )+'" style="margin:5px auto">'
          +'<tr>'
             +'<td style="text-align:right;width:200px">分值合计：</td>'
             +'<td style="text-align:left">'
             +'<p style="margin-top:10px">'+ (packageCheckListInfo[_index].scoreTotal||0)+'分</p>'
             +'</td>'
          +'</tr>'
          +'<tr>'
             +'<td style="text-align:right">汇总方式：</td>'
             +'<td style="text-align:left">'
//           +'<p>当评委人数大于等于'+(packageCheckListInfo[_index].totalType||5)+'时，汇总方式为方法一，小于<span class="M'+_index +'">'+(packageCheckListInfo[_index].totalType||5)+'</span>时为方法二</p>'
              if(packageCheckListInfo[_index].totalType==0){
              	  strHtml+='<p>方法二、评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</p>'
              }else{
              	  strHtml+='<p>方法一、评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</p>'
              };
             +'</td>'
          +'</tr>'
        +'</table>'
        +'<table class="table table-bordered red  '+(packageCheckListInfo[_index].checkType!=1&&packageCheckListInfo[_index].checkType!=3?"":"none" )+'" style="margin:5px auto">'          
          +'<tr class="'+(packageCheckListInfo[_index].checkType==0?"":"none" )+'">'
             +'<td style="text-align:right;width:200px">汇总方式：</td>'
            +'<td style="text-align:left">'
                +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM!=undefined?packageCheckListInfo[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN!=undefined?packageCheckListInfo[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
	    		+'<p>1、若评审项为关键要求，任何一项不合格都将淘汰。</p>'
	    		+'<p>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</p>'
             +'</td>'
          +'</tr>'
          +'<tr class="'+(packageCheckListInfo[_index].checkType==2?"":"none" )+'">'
             +'<td style="text-align:right;width:200px">汇总方式：</td>'
             +'<td style="text-align:left">'
                +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM!=undefined?packageCheckListInfo[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN!=undefined?packageCheckListInfo[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
	    		+'<p>1、若评审项为关键要求，任何一项偏离都将淘汰。</p>'
	    		+'<p>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行）；该评审项偏离项数超过'+ (packageCheckListInfo[_index].deviate) +'项将被淘汰。</p>'
             +'</td>'
          +'</tr>'
        +'</table>'	  
	$("#packageDetail").html(strHtml);	
	var cols=[
		{
			field: "xuhao",
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			}
		},
	]
	if((List0==true&&supplierType==1)||supplierType!=1){
		cols.push({
			field: "checkTitle",
			title: "评价内容",
			align: "left",
			halign: "left",

		})
	}
	if((List1==true&&supplierType==1)||supplierType!=1){
		cols.push({
			field: "checkStandard",
			title: "评价标准",
			halign: "left",
			align: "left",

		})
	}
	if((List2==true&&supplierType==1)||supplierType!=1){
		if(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3){
			cols.push({
				field: "score",
				title: "分值",
				width:'150',
				halign: "center",
				align: "center"
			})
		}else{
			cols.push({
				field: "isKey",
				title: "是否关键要求",
				halign: "center",
				width:'150',
				align: "center",
				formatter: function(value, row, index) {
					if(value == 0) {
						return '是'
					} else {
						return '否'
					}
				}
			})
			
		}
		
	}
	if((List3==true&&supplierType==1)||supplierType!=1){
		cols.push({
			field: "remark",
			title: "备注",
			halign: "left",
			align: "left",
		})
	}
	if((packageCheckListInfo[_index].isShowCheck!=1&&supplierType==1)||supplierType!=1){
		packageCheckListInfo[_index].checkType!=4 && $('#table_'+ packageCheckListInfo[_index].id ).bootstrapTable({
			pagination: false,
			// height:'304',
			columns: cols
		});
	}
	
	$('#table_'+ packageCheckListInfo[_index].id).bootstrapTable("load", PackageCheckItemList); //重载数据
	}

	//查看竞价设置
	$('#packageSetBtn').click(function(){
		parent.layer.open({
			type: 2 
			,title: '查看竞价配置'
			,id:'packageSet'
			,area: ['1000px', '600px']
			,content:'Auction/AuctionOffer/Agent/AuctionPurchase/viewAuctionPackage.html?packageId='+packageId+'&biddingTimes=1&supplierRound=1&isbidding=1'
		});
	})
};

function findBusinessPriceSet(){
	$.ajax({
	   	url:config.bidhost+'/BusinessPriceSetController/findBusinessPriceSet.do',
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageInfo.id,
	   	},
	   	success:function(data){	
	   		if(data.success){
	   			businessPriceSetData=data.data
	   		}
	   	}  
	});
} 

//分项报价附件
function offerFileList(){
	if(!offerFile){
		offerFile=$("#offerFileList").offerFileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			isDoubleEnvelope:packageInfo.doubleEnvelope,
			isDarkMark:packageInfo.isOpenDarkDoc,
			tableName: 'fileHtml',//分项报价DOM
	
		})
	}

}