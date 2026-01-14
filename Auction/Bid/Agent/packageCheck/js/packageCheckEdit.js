var packageCheckListInfo= []//发添加的tabs的数组
//包件添加信息
//综合评分添加tabs的数组
 //添加评价项的数组
var Score_Total_num="";//分值合计
var packageCheckListId="";
var _$index=""
var CheckListlist=config.bidhost +'/PackageCheckListController/list.do' //评审项查询
var CheckListSave=config.bidhost +'/PackageCheckListController/save.do' //评审项添加
var deleteChenkUrl=config.bidhost +'/PackageCheckListController/delete.do'//评审项删除
var updateChenkUrl=config.bidhost +'/PackageCheckListController/update.do'//评审项修改
var CheckItemUrl=config.bidhost +'/PackageCheckItemController/list.do'//评价项查询
var CheckItemsave=config.bidhost +'/PackageCheckItemController/save.do'//评价项添加
var CheckItemdelete=config.bidhost +'/PackageCheckItemController/delete.do'//评价项删除
var CheckItemupdate=config.bidhost +'/PackageCheckItemController/update.do'//评价项修改
var saveByExcel=config.bidhost+'/PackageCheckItemController/saveByExcel.do'//批量导入评价项
var CheckUrl="Auction/common/Agent/packageCheck/model/add_Check.html" //添加评价项页面
var tempCheckPlanUrl=config.bidhost+"/tempPackageCheckController/findPackageCheckList.do"//模板接口
var savePackageCheckAllUrl=config.bidhost +'/tempPackageCheckController/savePackageCheckAll.do'//选择评审项模板
var AccessoryList=[];
var WeightsTotal="";//权重值总和
var WeightTotalnum="";//已有权重值的和
var sortNum=0;
var businessPriceSetData="";
var yaoqings='0';
var doubleEnvelopes;//双信封当前状态
var isReadSecondLetter;//未通过第一信封的供应商，第二封信不予读取
var isOpenDarkDoc;//启用暗标
var darkSupCode;//暗标编码供应商对照显示机制
var clearBidding = null, encipherStatus;
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
/**
 * 如果为空的话就不是选择进入的
 * @param ReviewItemChange 更新评审项
 * @param ClearItemChange 更新清标
 * @param QuotationDirectoryChange 更新报价文件目录
 * @constant {['ReviewItemChange', 'ClearItemChange', 'QuotationDirectoryChange']}
 */
var changeKeys = getUrlParam('changeKeys') || '';
/**
 * 如果changeKeys不为空，则isFromChange为true，表示从变更过来的
 */
var isFromChange = false;
var packageCheckListInfo=[]//评审项信息
var packageInfo,offerFile;
$(function(){
	changeKeys = changeKeys.split(',');
	if (changeKeys.length === 0 || changeKeys[0] == '') {
		changeKeys = ['ReviewItemChange', 'ClearItemChange', 'QuotationDirectoryChange'];
	} else {
		isFromChange = true;
	}
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
				sessionStorage.setItem('packageCheckInfo', JSON.stringify(packageInfo));
				packagedd();
				encipherStatus = packageInfo.encipherStatus;
				if(packageInfo.encipherStatus == 1 && examType == 1){
					/* **********    清标项设置    ************** */
					if(!clearBidding){
						clearBidding = new ClearBidding("#clearBiddingWrap", {
							status:(changeKeys.indexOf('ClearItemChange') == -1)?2:1,  // 1：编辑   2：查看
							bidSectionId: packageId,//包件id
						});
					}
					/* **********    清标项设置  -end   ************** */
				}else{
					$.each(changeKeys, function(index, item){
						if(item == 'ClearItemChange'){
							changeKeys.splice(index, 1)
						}
					})
				}
			}													
		},
		
		error:function(data){
			parent.layer.alert("获取失败")
		}
	 });
	if(examType == 1) {
		priceExaminel(packageInfo.checkPlan)
	}else{
		$("#btnSubmit").hide();
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		if(examType==1){
			parent.layer.close(parent.layer.getFrameIndex(window.name));
		}else{
			for(var i = 0; i < packageCheckListInfo.length; i++) {
				if(packageCheckListInfo[i].PackageCheckItems.length == 0) {
					parent.layer.confirm('温馨提示：评审项' + packageCheckListInfo[i].checkName + '未添加评价内容，是否确定关闭', {
						btn: ['是', '否']
					}, function(ind, layero) {
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						var index = parent.layer.getFrameIndex(window.name); 
						parent.layer.close(index); 
						parent.layer.close(ind)
					}, function(index) {
						parent.layer.close(index);
					});
					return
				}
	
			}
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}
		
	});
	//提交
    $("#btnSubmit").click(function(){
		var loading = parent.layer.load();
        try {
			saveForm();
		} catch (error) {
			
		}
		parent.layer.close(loading);
    });

	initChangeView();
})
function packagedd(){
	$("#packageName").html(packageInfo.packageName);
	$("#packageNum").html(packageInfo.packageNum);
	$("#dataTypeName").html(packageInfo.dataTypeName);
	if(examType==1){
		if(packageInfo.checkPlan==0) $("#checkPlan").html('综合评分法');
		if(packageInfo.checkPlan==1) $("#checkPlan").html('最低评标价法');
		if(packageInfo.checkPlan==3) $("#checkPlan").html('最低投标价法');
		if(packageInfo.checkPlan==5) $("#checkPlan").html('经评审的最低投标价法');
		if(packageInfo.checkPlan==2) $("#checkPlan").html('经评审的最低价法(价格评分)');
		if(packageInfo.checkPlan==4) $("#checkPlan").html('经评审的最高投标价法');
		$(".tenderTypeW").show();
		if(packageInfo.checkPlan==1||packageInfo.checkPlan==3||packageInfo.checkPlan==4||packageInfo.checkPlan==5){//判断评审方法，如果为最低评标价法或最低投标价法
	   	    $("#DeviateNum").show();//显示允许最大偏离项
	   	    if(packageInfo.deviate!=undefined){//判断是否有值
	   	    	$('#deviate').val(packageInfo.deviate)//如果有
	   	    }else{
	   	    	$('#deviate').val("")//如果没有
	   	    }	    
	   	}else{
	   	    $("#DeviateNum").hide();
		}
		//是否启用双信封
		if(packageInfo.doubleEnvelope==1){
			$('input[name="doubleEnvelope"]').prop('checked',true);
			doubleEnvelopes=packageInfo.doubleEnvelope;
			$(".isDoubleEnvelope").show();
			$('.isDoubleEnvelopeCol').attr('rowspan','2')
		}else{
			$('input[name="doubleEnvelope"]').prop('checked',false);
			doubleEnvelopes=0
			$(".isRead").hide();
			$(".isDoubleEnvelope").hide();
			$('.isDoubleEnvelopeCol').removeAttr('rowspan')
		}
		//未通过第一信封的供应商，第二封信不予读取
		if(packageInfo.isReadSecondLetter==1){
			$('input[name="isReadSecondLetter"]').prop('checked',true);
			isReadSecondLetter=packageInfo.isReadSecondLetter;
			
		}else{
			$('input[name="isReadSecondLetter"]').prop('checked',false);
			isReadSecondLetter=0;
			
		}
		//启用暗标
		if(packageInfo.isOpenDarkDoc==1){
			$('input[name="isOpenDarkDoc"]').prop('checked',true);
			isOpenDarkDoc=packageInfo.isOpenDarkDoc;
			$(".isOpenDarkDocShow").show();
			$('.isOpenDarkDocCols').attr('rowspan','2')
			//暗标编码供应商对照显示机制
			$('input[name="darkSupCode"][value="'+ (packageInfo.darkSupCode||0) +'"]').prop('checked',true);
		}else{
			$('input[name="isOpenDarkDoc"]').prop('checked',false);
			$(".isOpenDarkDocShow").hide();
			$('.isOpenDarkDocCols').removeAttr('rowspan')
			isOpenDarkDoc=0
		}
		
		findBusinessPriceSet()
	}else if(examType==0){
		if(packageInfo.examCheckPlan==0) $("#checkPlan").html('合格制');
		if(packageInfo.examCheckPlan==1) $("#checkPlan").html('有限数量制');	
		$(".tenderTypeW").hide();
		$("#DeviateNum").hide();
	}
	
	yaoqings="1"
	PackageCheckList(0); 
	chooseTemp();
	offerFileList();
};

function initChangeView() {
	if (changeKeys.indexOf('ReviewItemChange') == -1) {
		// 禁用评审项
		$('.ReviewItemChange .change-hidden').hide();
		$('.ReviewItemChange .change-disabled').attr('disabled', true).prop('disabled', true);
		$('#Assessment input').attr('disabled', true).prop('disabled', true);
		if (ue) {
			ue.ready(function() {
				ue.setDisabled(true)
			});
		}
	}
}

$("#deviate").on('input',function(){
	if($(this).val()!=""){
		if(!(/^[1-9]\d*$/.test($(this).val()))||parseInt($(this).val())<=0){
 			parent.layer.alert('请输入正整数')
 			$(this).val("")
 		}
	}
})
//切换双信封
$('input[name="doubleEnvelope"]').on('change',function(){
	var _this=this;	
	if(_this.checked==true){
		var title='启用双信封'
	}else{
		var title='取消双信封'
	}
	if(packageCheckListInfo.length>0){
		parent.layer.confirm(title+'将清空评审项，是否确定？', {
			btn: ['是', '否']
		}, function(index, layero){	
			if(_this.checked==true){
				doubleEnvelopes=1;
				$(".isDoubleEnvelope").show();
				$('.isDoubleEnvelopeCol').attr('rowspan','2');
				
			}else{
				doubleEnvelopes=0;
				$(".isDoubleEnvelope").hide();
				$('.isDoubleEnvelopeCol').removeAttr('rowspan')
			};
			savePackageData();
			chooseTemp();
			doChangeAlert();
			deleteItems();													
			parent.layer.close(index);				 
		},function(index){	
			if(_this.checked==true){
				$('input[name="doubleEnvelope"]').prop('checked',false)	
				doubleEnvelopes=0
			}else{
				$('input[name="doubleEnvelope"]').prop('checked',true);
				doubleEnvelopes=1	
			}	
			offerFile.isDoubleEnvelope(doubleEnvelopes);
			parent.layer.close(index);			
		});
	}else{
		if(_this.checked==true){
			doubleEnvelopes=1;
			$(".isDoubleEnvelope").show();
			$('.isDoubleEnvelopeCol').attr('rowspan','2')
		}else{
			doubleEnvelopes=0;
			$(".isDoubleEnvelope").hide();
			$('.isDoubleEnvelopeCol').removeAttr('rowspan')
		};
		savePackageData();
		chooseTemp();
		doChangeAlert();
	}
	function doChangeAlert() {
		if (changeKeys.indexOf('QuotationDirectoryChange') === -1) {
			changeKeys.push('QuotationDirectoryChange');
			parent.layer.alert('因双信封/暗标选项调整，报价文件目录已自动变更', {icon: 0});
			offerFileList();
		}
		offerFile.isDoubleEnvelope(doubleEnvelopes);
	}
});
//启用暗标
$('input[name="isReadSecondLetter"]').on('change',function(){
	var _this=this;	
	if(_this.checked==true){
		isReadSecondLetter=1
	}else{
		isReadSecondLetter=0
	}
	savePackageData()
});
//启用暗标
$('input[name="isOpenDarkDoc"]').on('change',function(){
	var _this=this;	
	if(_this.checked==true){
		var title='启用'
	}else{
		var title='取消'
	}
	if(packageCheckListInfo.length>0){
		parent.layer.confirm(title+'暗标将清空评审项，是否确定？', {
			btn: ['是', '否']
		}, function(index, layero){	
			if(_this.checked==true){
				isOpenDarkDoc=1;
				$('input[name="isOpenDarkDoc"]').prop('checked',true);
				$(".isOpenDarkDocShow").show();
				$('.isOpenDarkDocCols').attr('rowspan','2');
				$("input[name='darkSupCode'][value='0']").prop('checked',true);				
			}else{
				isOpenDarkDoc=0;
				$(".isOpenDarkDocShow").hide();
				$('.isOpenDarkDocCols').removeAttr('rowspan');
				$("input[name='darkSupCode']").prop('checked',false);
			};			
			savePackageData();
			deleteItems();
			chooseTemp();	
			doChangeAlert();												
			parent.layer.close(index);				 
		},function(index){	
			if(_this.checked==true){
				isOpenDarkDoc=0;
				$('input[name="isOpenDarkDoc"]').prop('checked',false);
				$(".isOpenDarkDocShow").hide();
				$('.isOpenDarkDocCols').removeAttr('rowspan');
				$("input[name='darkSupCode']").prop('checked',false);
				
			}else{
				isOpenDarkDoc=1;
				$('input[name="isOpenDarkDoc"]').prop('checked',true);
				$(".isOpenDarkDocShow").show();
				$('.isOpenDarkDocCols').attr('rowspan','2');
				$("input[name='darkSupCode'][value='0']").prop('checked',true);		
			};	
			offerFile.isDarkMark(isOpenDarkDoc);
			parent.layer.close(index);				
		});
	}else{
		if(_this.checked==true){
			isOpenDarkDoc=1;
			$(".isOpenDarkDocShow").show();
			$('.isOpenDarkDocCols').attr('rowspan','2');
			$("input[name='darkSupCode'][value='0']").prop('checked',true);		
		}else{
			isOpenDarkDoc=0;
			$(".isOpenDarkDocShow").hide();
			$('.isOpenDarkDocCols').removeAttr('rowspan');
			$("input[name='darkSupCode']").prop('checked',false);
			
		}
		savePackageData();
		chooseTemp();
		doChangeAlert();
	}	
	function doChangeAlert() {
		if (changeKeys.indexOf('QuotationDirectoryChange') === -1) {
			changeKeys.push('QuotationDirectoryChange');
			parent.layer.alert('因双信封/暗标选项调整，报价文件目录已自动变更', {icon: 0});
			offerFileList();
		}
		offerFile.isDarkMark(isOpenDarkDoc);
	}
});
function deleteItems(){
	$.ajax({
		type: "post",
		url: config.bidhost+"/PackageCheckListController/deletePackageCheck.do",
		async: true,
		dataType: 'json',
		data: {
			packageId:packageInfo.id,
			examType:1
		},
		success: function(data) {
			if(data.success==true){
				packageCheckListInfo=[];
				packageCheckListInfos(0);
				setpackageCheckListInfo(0)
			}
		}
	});
}
 //添加评审项
function site(){	
	var checkPlan=""
 	if(yaoqings==1){//邀请函的评审
 		if(examType==1){
			checkPlan=packageInfo.checkPlan;			
		}else if(examType==0){
			checkPlan=packageInfo.examCheckPlan;	
		} 	
 	}else{//公告的评审
 		if(examType==1){
			checkPlan=$("input[name='checkPlan']:checked").val(); 							
		}else if(examType==0){
			checkPlan=$("input[name='examCheckPlan']:checked").val();		
		} 	
	}
 	parent.layer.open({
		type: 2 
		,title: '添加评审项'
		,area: ['550px', '500px']
		,content: 'Auction/common/Agent/packageCheck/model/PackageCheckList.html?examType='+examType+'&checkPlan='+checkPlan+'&packageId='+packageInfo.id+'&sort='+(packageCheckListInfo.length+1)+'&isShowEnvelope='+doubleEnvelopes+'&isOpenDarkDoc='+isOpenDarkDoc
	});
}
//修改评审项
function edit(){
	if(packageCheckListInfo.length==0){
	 	parent.layer.alert("没有评审项，无法修改")		 	
		return
	 }
	var checkPlan=""
 	if(yaoqings==1){//邀请函的评审
 		if(examType==1){
			checkPlan=packageInfo.checkPlan;			
		}else if(examType==0){
			checkPlan=packageInfo.examCheckPlan;	
		} 	
 	}else{//公告的评审
 		if(examType==1){
			checkPlan=$("input[name='checkPlan']:checked").val();					
		}else if(examType==0){
			checkPlan=$("input[name='examCheckPlan']:checked").val();		
		} 	
 	}
	parent.layer.open({
        type: 2 
        ,title: '修改评审项'
        ,area: ['650px', '500px']
        ,content:'Auction/common/Agent/packageCheck/model/PackageCheckList.html?examType='+examType+'&checkPlan='+checkPlan+'&id='+packageCheckListId+'&packageId='+packageInfo.id+'&index='+_$index+'&isShowEnvelope='+doubleEnvelopes+'&isOpenDarkDoc='+isOpenDarkDoc
	});          		          		        		 
};
//删除评审项
function deleteChenk(){	
	if(packageCheckListInfo.length==0){
	 	parent.layer.alert("温馨提示：没有评审项，无法删除")		 	
		return
	} 
	parent.layer.confirm('温馨提示：如果有供应商对该评审项进行了上传文件的操作，你的删除操作将直接影响到供应商的报价。是否确认删除', {
	  	btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){				
		$.ajax({
		   	url:deleteChenkUrl,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'id':packageCheckListId
		   	},
		   	success:function(data){
		   		if(data.success){
					PackageCheckList((_$index>1?_$index-1:0))
					parent.layer.close(index);
				} 
		   	}
		 });			 
	}, function(index){	
	   parent.layer.close(index)
	});	  
};
//添加评价项
function add_Check(num,val){
	parent.layer.open({
		type: 2 
	   ,title: '添加评价项'
	   ,area: ['650px', '600px']
	   ,content:CheckUrl+'?packageCheckListInId='+packageCheckListInfo[num].id+'&checkType='+packageCheckListInfo[num].checkType+'&index='+num
			 
   });
};
//编辑评价项
function itemEdit(uid,$index,$num){
	parent.layer.open({
		type: 2 
	   ,title: '编辑评价项'
	   ,area: ['650px', '600px']
	   ,content:CheckUrl+'?packageCheckListInId='+packageCheckListInfo[$num].id+'&id='+uid+'&checkType='+packageCheckListInfo[$num].checkType+'&index='+$num
	   ,success:function(layero,index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;
		   iframeWind.duData(packageCheckListInfo[$num].PackageCheckItems[$index])
					   
	   }
   });
};
//删除评价项
function itemdelte(uid,$index,$num){
	parent.layer.confirm('确定要删除该评价项', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({
		   	url:CheckItemdelete,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"id":uid
		   	},
		   	success:function(data){	 	
				if(data.success){
					checkListData($num)
					setpackageCheckListInfo($num);
					if(packageCheckListInfo.length>0){
						if(packageCheckListInfo[$num].checkType==1||packageCheckListInfo[$num].checkType==3){		 	
							getOne($num) 
						};
					}
					parent.layer.close(index);	
				}	   				   			
		   	}  
		 }); 		 
	}, function(index){
	   parent.layer.close(index)
	});	
};
function Total_Type_btn($index,thisd){	
	$.ajax({
		   	url:updateChenkUrl,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
			   		'id':packageCheckListInfo[$index].id,			   		
			   		'sort':packageCheckListInfo[$index].sort,
			   		'totalType':thisd,
			   		'packageId':packageInfo.id,
					'examType':examType
			   	},
		   	success:function(data){
		   		packageCheckListInfo[$index].totalType=thisd;		   		
		   	}
	});	
};
function PackageCheckList(_a){
   	$.ajax({
	   	url:CheckListlist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageInfo.id,
	   		'examType':examType
	   	},
	   	success:function(data){	
			if(data.success){
				packageCheckListInfo=data.data;
				for(var d=0;d<packageCheckListInfo.length;d++){
					checkListData(d)
				}
				
				
				if(packageInfo.checkPlan==0){
					if(packageCheckListInfo.length>0){
						var WeightTotalData=[]//权重的数组
						for(var d=0;d<packageCheckListInfo.length;d++){
							if(packageCheckListInfo[d].checkType==1){				            	
								WeightTotalData.push(packageCheckListInfo[d].weight*1000)
							}else{
								WeightTotalData.push(0)
							};
						}    	    	
						WeightTotalnum=eval(WeightTotalData.join('+'));
						WeightsTotal=WeightTotalnum/1000;     	
					}else{
						WeightsTotal=0
					};      
					var  businessWeight=(1000-WeightsTotal*1000)/1000;    	
					$("#weight").val(businessWeight)
				}else{
					$("#weight").val("1")
				}	 
				packageCheckListInfos(_a);
				setpackageCheckListInfo(_a);
			}   		
			
				
	   	}  
	});
	
	
}; 
//导出模板
function exportExcel(_index){
	if(_index==4){
		var url = config.bidhost + "/FileController/download.do?fname=明细信息模版.xls&ftpPath=/Templates/Pur/Pur_Bill_Of_Material_Template.xls";
	}
	if(_index==0||_index==2){
		var url = config.bidhost + "/FileController/download.do?fname=合格制和偏离制模板.xls&ftpPath=/Templates/Pur/Pur_Conformity_And_Deviation_Template.xls";
	}else if(_index==1){
		var url = config.bidhost + "/FileController/download.do?fname=评分制模板.xls&ftpPath=/Templates/Pur/Pur_Scoring_System_Derived_Template.xls";
	}else if(_index==3){
		var url = config.bidhost + "/FileController/download.do?fname=评分合格制模板.xls&ftpPath=/Templates/Pur/Pur_Accreditation_System_Derived_Template.xls";
	}
	
	window.location.href =$.parserUrlForToken(url);
	
} 
//评价项数据获取
function checkListData(_index){
	var PackageCheckItems=[]
	if(packageCheckListInfo.length>0){		
		$.ajax({
			url:CheckItemUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
			type:'get',
			dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:{
				"packageCheckListId":packageCheckListInfo[_index].id
			},
			success:function(data){
				if(data.success){
					if(data.data.length>0){
					 PackageCheckItems=data.data
					 
					}
				}else{
					top.layer.alert(data.message)
				}
			}  
	  });
	  packageCheckListInfo[_index].PackageCheckItems=PackageCheckItems
	}	
};
function packageCheckListInfos(_d){	 
	$(".nav-tabs").width("auto");
    var strHtml1="";
	for(var i=0;i<packageCheckListInfo.length;i++){
		strHtml1 += '<li role="presentation" ';
		if(i == _d) {
			strHtml1 += ' class="active" ';
		}
		strHtml1 += ' onclick=setpackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName+(examType==1&&$('input[name="doubleEnvelope"]:checked').val()==1?(packageCheckListInfo[i].envelopeLevel==2?'（第二封）':'（第一封）'):'') + '</a></li>';
	}
	$("#checkList1").html(strHtml1);
	if(packageCheckListInfo.length>0){		
		sortNum=packageCheckListInfo[packageCheckListInfo.length-1].sort;
	};
	 if(packageCheckListInfo.length==0){
	 	sortNum=0;
	 };
	 var liList=[]
	 $(".nav-tabs li").each(function(){
		liList.push(($(this).width()+20))
	 })
	 if(eval(liList.join('+'))+packageCheckListInfo.length+20>=850){
	 	$("#perv").show();
	 	$("#next").show();
	 	$("#ulTab").width(850)
	 }else{
	 	$("#perv").hide();
	 	$("#next").hide();
	 	$("#ulTab").width(900)
	 }
	 $(".nav-tabs").width(eval(liList.join('+'))+20);	 
}
var moveIndex = 0;
$("#perv").on('click',function(){	
	moveIndex < 0 ? moveIndex++ : moveIndex = 0
	$(".nav-tabs").stop().animate({
		'marginLeft': moveIndex * 150
	})
	
})
$("#next").on('click',function(){	
	-($(".nav-tabs").css('width').slice(0, -2) - 850) < $(".nav-tabs").css('margin-left').slice(0, -2) ? moveIndex-- : ''
	$(".nav-tabs").stop().animate({
		'marginLeft': moveIndex * 150
	})
	
})
var PackageCheckItemLists=[]
//查看评审内容详细信息
function setpackageCheckListInfo(_index) {//Num询评审内容的下标，$index包件的下标
	if(packageCheckListInfo.length>0){	
	packageCheckListId=packageCheckListInfo[_index].id;
	_$index=_index;
	PackageCheckItemLists=packageCheckListInfo[_index].PackageCheckItems;
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
	strHtml='<table style="font-size:14px" class="table table-bordered">'
        +'<tr>'
           +'<td style="width:200px;height:30px;line-height:30px;text-align:right">评审方式：</td>'
		   +'<td style="text-align: left;" colspan="3"><span style="padding-right:15px">'+ checkType +'</span><span>'+((packageCheckListInfo[_index].checkType==1&&examType!=0)?'权重值：'+packageCheckListInfo[_index].weight:'')+'</span></td>'
		+'</tr>'
		if(isOpenDarkDoc==1&&packageCheckListInfo[_index].checkType!=4&&examType==1){
			strHtml+='<tr>'
				+'<td style="text-align:right">是否启用暗标：</td>'
				+'<td style="text-align: left;" colspan="3"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isShadowMark==1?"是":"否") +'</span></td>'
			+'</tr>'
		}
		if(packageCheckListInfo[_index].checkType==2){
			strHtml+='<tr>'
				+'<td style="text-align:right">允许最大偏离项数：</td>'
				+'<td style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].deviate||"") +'</span></td>'  
				+'<td style="text-align:right">是否计入总数：</td>'
				+'<td style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isSetTotal==0?"计入总数":"不计入") +'</span></td>'         
			+'</tr>'			
		}
		if(packageInfo.checkPlan!=3&&packageCheckListInfo[_index].checkType==2){
			strHtml+='<tr>'
				+'<td style="text-align:right">是否'+(packageInfo.checkPlan == 4?'减':'加')+'价：</td>'
				+'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ (packageCheckListInfo[_index].isAddPrice==0?""+(packageInfo.checkPlan == 4?'减':'加')+"价":"不"+(packageInfo.checkPlan == 4?'减':'加')+"价") +'</span></td>'          
			+'</tr>' 
			if(packageCheckListInfo[_index].isAddPrice==0){
			strHtml+='<tr>'
					+'<td style="width:200px;height:30px;line-height:30px;text-align:right">偏离'+(packageInfo.checkPlan == 4?'减':'加')+'价幅度：</td>'
					+'<td colspan="3" style="text-align: left;"><span style="padding-right:15px">'+ packageCheckListInfo[_index].addPrice +'%</span></td>'          
				+'</tr>'
			}	
		}
		if(packageCheckListInfo[_index].checkType == 4){
			strHtml+='<tr>'
					+'<td style="width:200px;height:30px;line-height:30px;text-align:right">竞价起始价计算方式：</td>'
					+'<td style="text-align: left;" colspan="3">'
					+['参与竞价供应商最低报价', '未淘汰供应商最低报价', '参与报价供应商最低报价'][packageCheckListInfo[_index].bidStartPriceFrom]
					+'</td>'
				+'</tr>';
		 }
		 strHtml+='<tr>'
           +'<td style="width:200px;height:30px;line-height:30px;text-align:right">是否向供应商展示此评价项：</td>'
           +'<td style="text-align: left;" colspan="3">'
             +' <input type="radio" name="isChecks" class="isChecks change-disabled" value="0" onchange="Is_Show_Checks('+ _index +',0,1)" />是'
			  +'<input type="radio" name="isChecks" class="isChecks change-disabled" value="1" onchange="Is_Show_Checks('+ _index +',1,1)" />否'
           +'</td>'
		 +'</tr>';
		if(packageCheckListInfo[_index].checkType != 4){
			strHtml+='<tr id="Show_Check" class="none">'
			 +' <td style="width:200px;height:30px;line-height:30px;text-align:right">是否向供应商展示评价列项：</td>'
			  +'<td style="text-align: left;" colspan="3">'
				 +'<input type="checkbox" name="showCheckInfo" class="change-disabled" value="0" />评价内容'
				+' <input type="checkbox" name="showCheckInfo" class="change-disabled" value="1" />评价标准'
				  +'<input type="checkbox" name="showCheckInfo" class="change-disabled" value="2" />'+(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3?'分值':'是否关键要求')
				+' <input type="checkbox" name="showCheckInfo" class="change-disabled" value="3" />备注'
			  +'</td>'
			+'</tr>'
			+'<tr>'
			  +'<td colspan="4" style="text-align: left;">'
			  +'<input type="button" class="btn btn-primary change-hidden" style="margin-right:10px" value="添加评价项" onclick=add_Check(\"'+ _index+'\",\"'+ packageCheckListInfo[_index].checkType+'\") />'
			  +'<input type="button" class="btn btn-primary change-hidden" style="margin-right:10px" value="导出评价项模板" onclick=exportExcel(\"'+ packageCheckListInfo[_index].checkType+'\") />'
			  +'<span class="btn btn-primary fileinput-button change-hidden" style="margin-right:10px">'
				   +'<span>导入评价项</span>'
				   +'<input type="file" onchange="Excel(this,'+ _index +')">'
			  +'</span>'
			   +'<input type="button" class="btn btn-danger change-hidden"  value="一键清空" onclick=deletAll(\"'+ _index+'\",\"'+ packageCheckListInfo[_index].id+'\") />'
			  +'</td>'
			+'</tr>'
			  +'</table>'
		   +'<table class="table table-hover table-bordered" style="margin:5px auto" id="table_'+ packageCheckListInfo[_index].id +'">'
		   +'</table>'
		   +'<table class="table  table-bordered red" style="margin:5px auto">'
		   if(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3){
		   strHtml+='<tr>'
				   +'<td style="text-align:right;width:200px">分值合计：</td>'
				   +'<td style="text-align:left">'
				   +'<p style="margin-top:10px" id="ScoreTotal">'+ (packageCheckListInfo[_index].scoreTotal==undefined?"0":packageCheckListInfo[_index].scoreTotal)+'分</p>'
				   +'</td>'
			   +'</tr>'
			   +'<tr>'
				   +'<td style="text-align:right">汇总方式：</td>'
				   +'<td style="text-align:left">'
	   //              +'<p>当评委人数大于等于<input class="searched" value="'+ (packageCheckListInfo[_index].totalType||5) +'" onchange=Total_Type_btn(\"'+ _index +'\",this)>时，汇总方式为方法一，小于<span class="M'+_index +'">'+(packageCheckListInfo[_index].totalType||5)+'</span>时为方法二</p>'
					   +'<p><input type="radio" class="change-disabled" name="totalType" value="1" '+ (packageCheckListInfo[_index].totalType==1?'checked':'') +' onchange=Total_Type_btn(\"'+ _index +'\",1)>方法一、评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</p>'
					   +'<p><input type="radio" class="change-disabled" name="totalType" value="0" '+ (packageCheckListInfo[_index].totalType==0?'checked':'') +' onchange=Total_Type_btn(\"'+ _index +'\",0)>方法二、评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</p>' 
					   if(packageCheckListInfo[_index].checkType==3){
						   strHtml+='<p>当最终得分低于'+ packageCheckListInfo[_index].lowerScore +'分时，供应商被淘汰</p>'  		
					   }   		
		   strHtml+='</td>'
			   +'</tr>'
		   }else if(packageCheckListInfo[_index].checkType==0){		
		   strHtml+='<tr>'
			   +'<td style="text-align:right;width:200px">汇总方式：</td>'
			   +'<td style="text-align:left">'
				  +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM!=undefined?packageCheckListInfo[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN!=undefined?packageCheckListInfo[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
				  +'<p>1、若评审项为关键要求，任何一项不合格都将淘汰。</p>'
				  +'<p>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</p>'
			   +'</td>'
			+'</tr>'
		   
		   }else if(packageCheckListInfo[_index].checkType==2){					
				strHtml+='<tr >'
				   +'<td style="text-align:right;width:200px">汇总方式：</td>'
				   +'<td style="text-align:left">'
					  +'<p>评委全体成员按照少数服从多数（'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM!=undefined?packageCheckListInfo[_index].totalM:'2') +'分之'+ Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN!=undefined?packageCheckListInfo[_index].totalN:'1') +'）的原则判定评价标准是否合格。</p>'
					  +'<p>1、若评审项为关键要求，任何一项偏离都将淘汰。</p>'
					  +'<p>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行）；该评审项偏离项数超过'+ (packageCheckListInfo[_index].deviate) +'项将被淘汰。</p>'
				   +'</td>'
				+'</tr>'
			}
		   strHtml+='<tr>'
				   +'<td style="text-align:right">温馨提示：</td>'
				   +'<td style="text-align:left">'
					   +'<p>1、为了便于评审，请将不同评审阶段的评审项分开编制</p>'
					   +'<p>2、评审时、评审顺序按照此处添加的评审项依序评审（从左到右）</p>'
					   +'<p>3、请确保所填信息完整无误</p>'
				   +'</td>'
			   +'</tr>'
			   +'</table>';
		 }
	$("#packageDetail").html(strHtml);
	$('#table_'+ packageCheckListInfo[_index].id ).bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:'304',
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
				field: (packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3)?"score":"isKey",
				title:(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3)?"分值":"是否关键要求",
				halign: "center",
				width:'150',
				align: "center",
				formatter: function(value, row, index) {
					if(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3){
						return row.score
					}else{
						if(value == 0) {
							return '是'
						} else {
							return '否'
						}
					}
					
				}
			},
			{
				field: "itemScoreType",
				title: "打分类型",
				halign: "left",
				visible: (packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3)? true: false,
				align: "left",
				formatter: function(value, row, index) {
					if(value == '1') {
						return '主观分'
					} else if(value == '2') {
						return '客观分'
					}
					
				}
			},
			{
				field: "remark",
				title: "备注",
				halign: "left",
				align: "left",
			},
			{
				field: "#",
				title: "操作",
				align: "center",
				halign: "center",
				width:'150',
				visible: changeKeys.indexOf('ReviewItemChange') > -1,
				formatter:function(value, row, index){					
				var State='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick=itemEdit(\"'+row.id+'\",'+index+','+_index+')>编辑</a>'
						 +'<a class="btn-sm btn-danger itemdelte" href="javascript:void(0)" style="text-decoration:none"  onclick=itemdelte(\"'+row.id+'\",'+index+','+_index+')>删除</a></td>'
				return State
				}
				 
			}
		]
	});	
	$('#table_'+ packageCheckListInfo[_index].id).bootstrapTable("load", PackageCheckItemLists); //重载数据
	//分值之和
	var Score_Total=[]; 
	if(PackageCheckItemLists.length>0){
		for(var f=0;f<PackageCheckItemLists.length;f++){
			if(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3){	    		
				Score_Total.push(parseInt(PackageCheckItemLists[f].score))
				packageCheckListInfo[_index].scoreTotal=eval(Score_Total.join('+'))
			};			    		
		};
	}else{
		Score_Total=[0];
	}	        			
	if(packageCheckListInfo[_index].checkType==1||packageCheckListInfo[_index].checkType==3){
		 Score_Total_num=eval(Score_Total.join('+'));       
	}else{
		 Score_Total_num=0;	 	
	}
	if(packageCheckListInfo[_index].checkType==1){
		$("#ScoreTotal").html(Score_Total_num+'分(分值总和必须为100，还需'+(100-Score_Total_num)+'分)');
	}else{
		$("#ScoreTotal").html(Score_Total_num+'分');
	}
	$('input[name="isChecks"]').eq(packageCheckListInfo[_index].isShowCheck).attr('checked',true)
	if(packageCheckListInfo[_index].isShowCheck==0){
		$('#Show_Check').removeClass('none');		
	}else if(packageCheckListInfo[_index].isShowCheck==1){
		$('#Show_Check').addClass('none');
		
	};
	if(packageCheckListInfo[_index].showCheckInfo!=undefined&&packageCheckListInfo[_index].showCheckInfo!==""){
		var showCheckList=packageCheckListInfo[_index].showCheckInfo.split(',');
		for(var i=0;i<showCheckList.length;i++){	
			$('input[name="showCheckInfo"]').eq(showCheckList[i]).attr('checked',true);			
		}
	}
	Is_Show_Checks(_index,packageCheckListInfo[_index].isShowCheck,0)
	}else{
		$("#packageDetail").html('<div style="text-align:center">暂无数据</div>');
	}		
};
//一键清空评审项的table行
function deletAll($num,uid){
	parent.layer.confirm('确定要删除该评审项的全部评价项', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({
		   	url:config.bidhost+'/PackageCheckItemController/clean.do',
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"packageCheckListId":uid
		   	},
		   	success:function(data){
				if(data.success){	
					checkListData($num);				
					setpackageCheckListInfo($num);
					//如果是评分制。清空要把评审项的分值之和为零
					if(packageCheckListInfo.length>0){
						if(packageCheckListInfo[$num].checkType==1||packageCheckListInfo[$num].checkType==3){		 	
							getOne($num)	 
						};
					}	
				}else{
					top.layer.alert(data.message)
				}
				 		   				   			
		   	}  
		 });	
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});
}

function Is_Show_Checks($index,num,is){
	if(num==0){
		$('#Show_Check').removeClass('none');		
	}else if(num==1){
		$('#Show_Check').addClass('none');
		
	};
	if(packageCheckListInfo[$index].showCheckInfo!=undefined&&packageCheckListInfo[$index].showCheckInfo!==""){
		var showCheckList=packageCheckListInfo[$index].showCheckInfo.split(',');
		var List=showCheckList;
	}else{
		var List=[];
	};
	$('input[name="showCheckInfo"]').off('change')
	$('input[name="showCheckInfo"]').on('change',function(){		
		if(this.checked==true){
			List.push($(this).val());
			List.sort(function(a,b){return a>b?1:-1});
			
		}else if(this.checked==false){
			for(var i=0;i<List.length;i++){
				if(List[i]==$(this).val()){
					List.splice(i,1)
				};
			};
		};
	   $.ajax({
		   	url:updateChenkUrl,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
			   		'id':packageCheckListInfo[$index].id,
			   		'isShowCheck':num,
			   		'sort':packageCheckListInfo[$index].sort,
			   		'showCheckInfo':List.join(','),
			   		'packageId':packageInfo.id,
					'examType':examType
			   	},
		   	success:function(data){
				if(data.success){
					packageCheckListInfo[$index].showCheckInfo=List.join(',')
				}else{
					top.layer.alert(data.message)
				}
		   	}
		});	   
	});
	if(is==1){
		$.ajax({
		   	url:updateChenkUrl,
		   	type:'post',
		   	dataType:'json',
		   	async:false,		   
		   	data:{
			   		'id':packageCheckListInfo[$index].id,
			   		'isShowCheck':num,
			   		'sort':packageCheckListInfo[$index].sort,
			   		'showCheckInfo':null,
			   		'packageId':packageInfo.id,
					'examType':examType
			   	},
		   	success:function(data){
				if(data.success){
					packageCheckListInfo[$index].showCheckInfo="";
					packageCheckListInfo[$index].isShowCheck=num;
				}else{
					top.layer.alert(data.message)
				}
		   	}
		});	
	}
	initChangeView();
};

//评价项的批量导入
var rABSl = false; //是否将文件读取为二进制字符串
function Excel(obj,$i){
  var f = obj.files[0];
  
  if(f!=null){
	var formFile = new FormData();
	formFile.append("packageCheckListId", packageCheckListInfo[$i].id); 
	formFile.append("checkType", packageCheckListInfo[$i].checkType); 
	formFile.append("excel", f); //加入文件对象
	var data=formFile
  	if(PackageCheckItemLists.length>0){
  		parent.layer.confirm('温馨提示：导入后，之前导入的评价项将会被清空，以新的导入数据为准，您确定要导入吗', {
		  btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero){
			$.ajax({
			   	url:config.bidhost+'/PackageCheckItemController/clean.do',
			   	type:'post',
			   	dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		"packageCheckListId":packageCheckListInfo[$i].id
			   	},
			   	success:function(res){
					if(res.success){						
						exelAjax($i,data);
					}else{
						parent.layer.alert(res.message)
						$("input[type='file']").val("")
					}	
			   	}  
			 });
		  parent.layer.close(index);		 
		}, function(index){
		   $("input[type='file']").val("")
		   parent.layer.close(index)
		});  		
  	  }else{
  	  	 exelAjax($i,data)
  	  }
  	  
  }	
}
$(".number").on("blur",function(){   
	   if($(this).val()!=""){
	   	    if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))){ 
			parent.layer.alert("请输入正数"); 	
			$(this).val("");		
			return;
	        };
			$(this).val(parseFloat($(this).val()).toFixed(3));
		}
});
//选择评审项模板
function chooseTemp(){
	if(examType==1){
		var checkPlan=packageInfo.checkPlan
	}else{
		var checkPlan=packageInfo.examCheckPlan
	}
	var tempData=[]
	var arr= {
		'examType':examType,
		'checkPlan':checkPlan,
		'tempState':1,		
	}
	if(doubleEnvelopes||isOpenDarkDoc){
		arr.doubleEnvelope=doubleEnvelopes;
		arr.isOpenDarkDoc=isOpenDarkDoc;
	}
	$.ajax({
		type: "post",
		url: tempCheckPlanUrl,
		data:arr,
		async:false,
		dataType: "json",
		success: function (response) {
			if(response.success){
				tempData=response.data;	
				if(tempData.length>0){
					var list='<option value="0">--请选择--</option>';			
					for(var i=0;i<tempData.length;i++){
						if(packageInfo.tempPackageCheckId==tempData[i].id){
							list+='<option value="'+ tempData[i].id +'" selected="selected">'+ tempData[i].tempName +'</option>'
						}else{
							list+='<option value="'+ tempData[i].id +'">'+ tempData[i].tempName +'</option>'
						}
						
					}
				}else{
					var list='<option value="0">--无模板选择--</option>';
				}
				
			}else{
				top.layer.alert(response.message)
			}
			$("#tempCheckPlan").html(list)
		}
	});
	if(tempData.length==0){
		return false;
	};
	
}
var selectIndexs=$("#tempCheckPlan").val();
$("#tempCheckPlan").on('change',function(){
	var uid=$(this).val()
	var _this=$(this)
	if(uid==0){
		return false;
	}
	if(packageCheckListInfo.length>0){
		parent.layer.confirm('温馨提示：切换评审模板将清空原评审项，是否确认切换？', {
			btn: ['是', '否']
		}, function(index, layero){
			selectIndexs=uid;
			_this.val(selectIndexs);
			saveTempCheck(uid)								
			parent.layer.close(index)	 
		},function(index){
			selectIndexs=selectIndexs;
			_this.val(selectIndexs);
			parent.layer.close(index);			
		});
	}else{
		saveTempCheck(uid)
	}
})
function saveTempCheck(uid){
	$.ajax({
		type:"post",
		url:savePackageCheckAllUrl,
		data: {
			'tempPackageCheckId': uid,
			'packageId':packageInfo.id,
			'examType':examType
		},
		async:false,
		dataType: 'json',
		success: function(data){
			if(data.success){							
				PackageCheckList(0);							
			}
		}
	})
	if(examType==1){
		var pare={
			'id':packageInfo.id,
			'tempPackageCheckId':uid,
			'examType': examType
		}		
	}else{
		var pare={
			'id':packageInfo.id,
			'examTempPackageCheckId':uid,
			'examType': examType
		}
	}
	$.ajax({   	
		url:config.bidhost+'/PackageCheckListController/updateTempPackageCheckId.do',//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:pare,
		success:function(data){			   		
			if(data.success){
				parent.$('#table').bootstrapTable(('refresh'));
			}
		}   	
 	});
}
//保存批量导入
function exelAjax($i,data){
	$.ajax({
		type: "post",
		url: saveByExcel,
		async: true,
		dataType: 'json',
		cache: false,//上传文件无需缓存
		processData: false,//用于对data参数进行序列化处理 这里必须false
		contentType: false, //必须
		data: data,
		success: function(data) {	
			checkListData($i)
			setpackageCheckListInfo($i);
			if(data.success){
				parent.layer.alert('批量导入成功');								
				if(packageCheckListInfo.length>0){
					if(packageCheckListInfo[$i].checkType==1||packageCheckListInfo[$i].checkType==3){		 	
						getOne($i)	 
					 };
				};	
			}else{
				parent.layer.alert(data.message)			
			}
			$('input[type="file"]').val("");
		}
	});
}
//更新评审项最新数据
function getOne($num){
	$.ajax({
		url:updateChenkUrl,
		type:'post',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
				'id':packageCheckListInfo[$num].id,
				'sort':packageCheckListInfo[$num].sort,		
				'scoreTotal':Score_Total_num,
				'packageId':packageInfo.id,
				'examType':examType			 
		},
		success:function(data){				   		
		}
 });	 
}
function saveForm(){
	if(examType == 1) {
		if($("input[name='checkType']:checked").val() == 0) {
			$("#businessContent").val(ue.getContent())
		}
		if (changeKeys.indexOf('ReviewItemChange') > -1) {
			if(testDatans()) {
				parent.layer.alert('温馨提示：' +testDatans());
				return
			};
			if(packageCheckListInfo.length==1&&packageCheckListInfo[0].checkType==4){
				parent.layer.alert('温馨提示：请添加至少一条非竞价的评审项')
				return;
			}
		}
		if (Number($("input[name='weight']").val()) < 0) {
			parent.layer.alert('温馨提示: 价格评审权重值需大于等于0，请修改评分制评审项权重。')
			return
		}
		var doChangeKeys = [].concat(changeKeys);
		function doSuccessResult() {
			if (doChangeKeys.length) {
				doTask(doChangeKeys.shift());
				return;
			}
			if(top.window.document.getElementById("consoleWindow")){
				var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
				var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				dcmt.getDetail();
			}
			parent.layer.alert('温馨提示：编辑成功');
			parent.$('#table').bootstrapTable('refresh');
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}
		function doTask(changeKey) {
			// 评审项
			if (changeKey === 'ReviewItemChange') {
				var actionUrl = config.bidhost + '/BusinessPriceSetController/insertBusinessPriceSet.do';
				var params = $('#formb').serialize() + '&packageId=' + packageId;
				if (businessPriceSetData) {
					actionUrl = config.bidhost + '/BusinessPriceSetController/updateBusinessPriceSet.do';
					params = $('#formb').serialize() + '&id=' + businessPriceSetData.id + '&packageId=' + packageId;
				}
				savePackageData();
				$.ajax({
					url: actionUrl,
					type: 'post',
					dataType: 'json',
					async: false,
					data: params,
					success: function(data) {
						if(!data.success) {
							parent.layer.alert(data.message);
						} else {
							doSuccessResult();
						}
					},
				});
			}
			// 清标
			else if(changeKey === 'ClearItemChange'){
				var changeSameState = changeKeys.indexOf('QuotationDirectoryChange') > -1 ? 1 : undefined;
				clearBidding.saveClearItem(function(){
					doSuccessResult();
				}, changeSameState);
			}
			// 报价文件目录
			else if (changeKey === 'QuotationDirectoryChange') {
				offerFile.offerSubmit(function(tips){
					if(tips){
						parent.layer.alert("温馨提示：" + tips);
					} else {
						doSuccessResult();
					}
				});	
			}
		}
		/**
		 * 点击提交按钮，若勾选了清标项变更 或者 报价文件目录变更，
		 * 系统给出提示"若勾选报价文件目录变更或者清标项变更，
		 * 则供应商需要下载最新的采购文件，重新编制并递交，
		 * 请确认是否需要进行{报价文件目录的变更，清标项变更}？ 确定 取消"，
		 * 点击取消，返回，不提交；点击确定，继续提交。
		 */
		if (isFromChange && (changeKeys.indexOf('ClearItemChange') > -1 || changeKeys.indexOf('QuotationDirectoryChange') > -1)) {
			var actionMsg = [];
			if (changeKeys.indexOf('ClearItemChange') > -1) {
				actionMsg.push('清标项变更');
			}
			if (changeKeys.indexOf('QuotationDirectoryChange') > -1) {
				actionMsg.push('报价文件目录的变更');
			}
			var message = '若勾选报价文件目录变更或者清标项变更，则供应商需要下载最新的采购文件，重新编制并递交，请确认是否需要进行 ' + actionMsg.join('，') + ' ？';
			parent.layer.confirm(message, {
				icon: 3,
				btn: ['继续', '取消']
			}, function(index, layero) {
				parent.layer.close(index);
				doSuccessResult();
			}, function(index) {
				parent.layer.close(index);
			});
		} else {
			doSuccessResult();
		}
	}
}
//分项报价附件
function offerFileList(){
	var status = changeKeys.indexOf('QuotationDirectoryChange') > -1 ? 1 : 2;
	if(!offerFile){
		offerFile=$("#offerFileList").offerFileList({
			status: status,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			isDoubleEnvelope:doubleEnvelopes,
			isDarkMark:isOpenDarkDoc,
			tableName: 'fileHtml',//分项报价DOM
	
		})
	} else {
		offerFile.options.status = status;
		offerFile.init();
	}

}

/* 
	时间：20201116
	修改人：金贝贝
	功能：点击双信封或者暗标时，把数据保存到数据

*/

function savePackageData(){
	if (changeKeys.indexOf('ReviewItemChange') == -1) {
		return;
	}
	var pare={
		'id':packageId,
		'doubleEnvelope':doubleEnvelopes,
		'isOpenDarkDoc':isOpenDarkDoc,
		'isReadSecondLetter':isReadSecondLetter,
	
	}
	if(isOpenDarkDoc==1){
		pare.darkSupCode=$('input[name="darkSupCode"]:checked').val()
	}
	$.ajax({   	
		url:config.bidhost+'/PackageCheckListController/updateEnvelopeAndDark.do',//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:pare,
		beforeSend: function(xhr){
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success:function(data){			   		
			
		},
	});	
}