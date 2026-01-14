var nedata= []//发添加的tabs的数组
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
	if(isbidding==1){
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
					packagedd()
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
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 	
	});
})
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
		if(nedata[_index].PackageCheckItems.length==0){
			$.ajax({
			   	url:CheckItemUrl,
			   	type:'get',
			   	dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		"packageCheckListId":nedata[_index].id
			   	},
			   	success:function(data){	 
			   		if(data.data.length>0){
			   			nedata[_index].PackageCheckItems=data.data
			   		}
			   			
			   	}  
			 });
		}			
	}
};
function packageCheckListInfos(_d){
	      nedata=[]
	     if(packageCheckListInfo.length>0){
	     	
	   		 for(var i=0;i<packageCheckListInfo.length;i++){	   		   	
	   		    	nedata.push(
	   		    	  {   		    	  
	   		    	  packageId:packageInfo.id,	
					  id:packageCheckListInfo[i].id,					  
					  sort:packageCheckListInfo[i].sort,
					  checkName:packageCheckListInfo[i].checkName,
					  checkType:packageCheckListInfo[i].checkType,
					  totalType:packageCheckListInfo[i].totalType,
					  weight:packageCheckListInfo[i].weight,
					  isSetTotal:packageCheckListInfo[i].isSetTotal,
					  isAddPrice:packageCheckListInfo[i].isAddPrice,
					  addPrice:packageCheckListInfo[i].addPrice,
					  totalM:packageCheckListInfo[i].totalM,
					  envelopeLevel:packageCheckListInfo[i].envelopeLevel,
					  totalN:packageCheckListInfo[i].totalN,
					  isShadowMark:packageCheckListInfo[i].isShadowMark,
					  scoreTotal:packageCheckListInfo[i].scoreTotal,
					  isSetDeviate:packageCheckListInfo[i].isSetDeviate,
					  deviate:packageCheckListInfo[i].deviate,
					  showCheckInfo:packageCheckListInfo[i].showCheckInfo,
					  isShowCheck:packageCheckListInfo[i].isShowCheck,
					  PackageCheckItems:[]
	   		    	  }
	   		    	);
//	   		    	checkListData(i);
	   		    //循环获取评审项里的表格数据	   		    	
	   		   };
	   	}		
    var strHtml1=""
	for(var i=0;i<nedata.length;i++){
		strHtml1 += '<li role="presentation" ';
		if(i == _d) {
			strHtml1 += ' class="active" ';
		}
		strHtml1 += ' onclick=setpackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + nedata[i].checkName+(examTypenum==1&&nedata[i].envelopeLevel?(nedata[i].envelopeLevel==1?'（第一封）':'（第二封）'):'') + '</a></li>';
	}
	$("#checkList1").html(strHtml1);
	if(nedata.length>0){
		
		sortNum=nedata[nedata.length-1].sort;
	};
	 if(nedata.length==0){
	 	sortNum=0;
	 };
}

//查看评审内容详细信息
function setpackageCheckListInfo($index) {//Num询评审内容的下标，$index包件的下标
	
	if(packageCheckListInfo.length>0){
		var _index=$index;
		
	};
	if(nedata.length>0){	
	packageCheckListId=nedata[_index].id;
	_$index=_index;	
	checkListData(_index);
	var PackageCheckItemList=nedata[_index].PackageCheckItems;
	var strHtml="";
	if(nedata[_index].checkType==0){
		var checkType='合格制';
	}
	if(nedata[_index].checkType==1){
		var checkType='评分制';				 
	}
	if(nedata[_index].checkType==2){
		var checkType='偏离制';
	}
	if(nedata[_index].checkType==3){
		var checkType='评分合格制';
	}
	if(nedata[_index].checkType==4){
		var checkType='竞价';
	}
	if(nedata[_index].isShowCheck==0){
		if(nedata[_index].showCheckInfo!=undefined){
			var showCheckList=nedata[_index].showCheckInfo.split(',');		 
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
           +'<td style="text-align: left;"><span style="padding-right:15px">'+ checkType +'</span><span>'+((nedata[_index].checkType==1&&examTypenum!=0)?'权重值：'+nedata[_index].weight:'')+'</span></td>'
		 +'</tr>'
		if(packageCheckListInfo[_index].isShadowMark!==undefined){
			strHtml+='<tr>'
					+'<td style="text-align:right">是否启用暗标：</td>'
					+'<td style="text-align: left;"><span style="padding-right:15px">'+ (nedata[_index].isShadowMark==1?"是":"否") +'</span></td>'
				+'</tr>'
		}
		strHtml+='<tr class="'+(nedata[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">允许最大偏离项数：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (nedata[_index].deviate||"") +'</span></td>'          
         +'</tr>'
         +'<tr class="'+(nedata[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">是否计入总数：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (nedata[_index].isSetTotal==0?"计入总数":"不计入") +'</span></td>'          
         +'</tr>'
         +'<tr class="'+(nedata[_index].checkType==2?"":"none" )+'">'
           +'<td style="text-align:right">是否加价：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (nedata[_index].isAddPrice==0?"加价":"不加价") +'</span></td>'          
	     +'</tr>'
	     +'<tr class="'+((nedata[_index].isAddPrice==0&&nedata[_index].checkType==2)?"":"none" )+'">'
           +'<td style="text-align:right">偏离加价幅度：</td>'
           +'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ nedata[_index].addPrice +'%</span></td>'          
	     +'</tr>'
	     if(supplierType!=1){
	     strHtml+='<tr>'
	           +'<td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示此评价项：</td>'
	           +'<td style="text-align: left;">' +(nedata[_index].isShowCheck==0?'是':'否')+'</td>'
	         +'</tr>'
	         +'<tr id="Show_Check" class="'+(nedata[_index].isShowCheck==0?"":"none")+'">'
	          +' <td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示评价列项：</td>'
	           +'<td style="text-align: left;">'
	              +'<span class="'+(List0==true?'':"none")+'">评价内容、</span>'
				  +'<span class="'+(List1==true?'':"none")+'">评价标准、</span>'
				  +'<span class="'+(List2==true?'':"none")+'">'+((nedata[_index].checkType==1||nedata[_index].checkType==3)?'分值':'是否关键要求')+'、</span>'
				  +'<span class="'+(List3==true?'':"none")+'">备注、</span>'
	           +'</td>'
	         +'</tr>'
	     }         
       strHtml+='</table>'
       +'<table class="table table-hover table-bordered" style="margin:5px auto" id="table_'+ nedata[_index].id +'">'
       +'</table>'
        +'<table class="table  table-bordered red '+((nedata[_index].checkType==1||nedata[_index].checkType==3)?"":"none" )+'" style="margin:5px auto">'
          +'<tr>'
             +'<td style="text-align:right;width:200px">分值合计：</td>'
             +'<td style="text-align:left">'
             +'<p style="margin-top:10px" id="ScoreTotal">'+ (nedata[_index].scoreTotal==undefined?"0":nedata[_index].scoreTotal)+'分</p>'
             +'</td>'
          +'</tr>'
          +'<tr>'
             +'<td style="text-align:right">汇总方式：</td>'
             +'<td style="text-align:left">'
//           +'<p>当评委人数大于等于'+(nedata[_index].totalType||5)+'时，汇总方式为方法一，小于<span class="M'+_index +'">'+(nedata[_index].totalType||5)+'</span>时为方法二</p>'
              if(nedata[_index].totalType==0){
              	  strHtml+='<p>方法二、评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</p>'
              }else{
              	  strHtml+='<p>方法一、评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</p>'
              };
             +'</td>'
          +'</tr>'
        +'</table>'
        +'<table class="table table-bordered red  '+(nedata[_index].checkType!=1&&nedata[_index].checkType!=3?"":"none" )+'" style="margin:5px auto">'          
          +'<tr class="'+(nedata[_index].checkType==0?"":"none" )+'">'
             +'<td style="text-align:right;width:200px">汇总方式：</td>'
            +'<td style="text-align:left">'
                +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(nedata[_index].totalM!=undefined?nedata[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(nedata[_index].totalN!=undefined?nedata[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
	    		+'<p>1、若评审项为关键要求，任何一项不合格都将淘汰。</p>'
	    		+'<p>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</p>'
             +'</td>'
          +'</tr>'
          +'<tr class="'+(nedata[_index].checkType==2?"":"none" )+'">'
             +'<td style="text-align:right;width:200px">汇总方式：</td>'
             +'<td style="text-align:left">'
                +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(nedata[_index].totalM!=undefined?nedata[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(nedata[_index].totalN!=undefined?nedata[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
	    		+'<p>1、若评审项为关键要求，任何一项偏离都将淘汰。</p>'
	    		+'<p>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行）；该评审项偏离项数超过'+ (nedata[_index].deviate) +'项将被淘汰。</p>'
             +'</td>'
          +'</tr>'
        +'</table>'	  
	$("#packageDetail").html(strHtml);	
	nedata[_index].checkType!=4 && $('#table_'+ nedata[_index].id ).bootstrapTable({
		pagination: false,
		height:'304',
		columns: [{
			    field: "xuhao",
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "checkTitle",
				title: "评价内容",
				align: "left",
				halign: "left",

			},
			{
				field: "checkStandard",
				title: "评价标准",
				halign: "left",
				align: "left",

			}, {
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
			},
			{
				field: "score",
				title: "分值",
				width:'150',
				halign: "center",
				align: "center"
			},
			{
				field: "remark",
				title: "备注",
				halign: "left",
				align: "left",
			}
		]
	});
	if(supplierType==1){
		if(nedata[_index].isShowCheck==1){
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'checkTitle'); //隐藏评审内容 
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'checkStandard'); //隐藏评审标准  
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'isKey'); //隐藏是否关键  
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'score'); //隐藏分值
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'remark'); //隐藏分值
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'xuhao'); //隐藏序号
		}else{
			if(List0==true){
				$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'checkTitle'); //显示评审内容  
			}else{
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'checkTitle'); //隐藏评审内容  
			}
			if(List1==true){
				$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'checkStandard'); //显示评审标准  
			}else{
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'checkStandard'); //隐藏评审标准  
			}
			if(List2==true){
				if(nedata[_index].checkType==1||nedata[_index].checkType==3){
					$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'score'); //显示分值
					$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'isKey'); //隐藏是否关键  
				}else{
					$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'isKey'); //显示是否关键
					$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'score'); //隐藏分值
				}
			}else{
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'isKey'); //隐藏是否关键
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'score'); //隐藏分值
			}
			if(List3==true){
				$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'remark'); //显示评审标准  
			}else{
				$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'remark'); //显示评审标准  
			}
		}		
	}else{
		if(nedata[_index].checkType==1||nedata[_index].checkType==3){
			$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'score'); //显示分值
			$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'isKey'); //隐藏是否关键  
		}else{
			$('#table_'+ nedata[_index].id).bootstrapTable("showColumn", 'isKey'); //显示是否关键
			$('#table_'+ nedata[_index].id).bootstrapTable("hideColumn", 'score'); //隐藏分值
		}
	}
	$('#table_'+ nedata[_index].id).bootstrapTable("load", PackageCheckItemList); //重载数据
	}
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








