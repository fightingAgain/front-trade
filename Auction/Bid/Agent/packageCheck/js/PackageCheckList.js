var CheckListSave=config.bidhost +'/PackageCheckListController/save.do' //评审项添加
var updateChenkUrl=config.bidhost +'/PackageCheckListController/update.do'//评审项修改
var findData=config.bidhost +"/PackageCheckListController/showOne.do"//评审项详情
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#'+thisFrame)[0].contentWindow;
var examType = getUrlParam("examType"); //资格审查方式
var checkPlan = getUrlParam("checkPlan");//评审方法
var sort = getUrlParam("sort");//排序
var packageId = getUrlParam("packageId");//模板Id
var _index = getUrlParam("index");//模板Id
var id = getUrlParam("id");//评审项主键id
var isShowEnvelope= getUrlParam("isShowEnvelope");//是否设置双信封
var isOpenDarkDoc= getUrlParam("isOpenDarkDoc");//是否启用暗标
var tenderTypeCode=getUrlParam("tenderTypeCode");//采购类型
var scoreTotal=getUrlParam("scoreTotal");
var WeightsTotal=dcmt.WeightsTotal;
var packageCheckListInfo=dcmt.packageCheckListInfo;
var checkType,bidpriceTimes=1;
$(function(){
	$('#packageSetBtn').click(function(){
		parent.layer.open({
			type: 2 
			,title: '竞价配置'
			,id:'packageSet'
			,area: ['1100px', '600px']
			,content:'Auction/AuctionOffer/Agent/AuctionPurchase/editAuctionPackage.html?packageId='+packageId+'&biddingTimes='+bidpriceTimes+'&supplierRound=1&isbidding=1'
		});
	});
	if(checkPlan == 4){
		$('.checkPlan4').html('减')
	}
	if(examType==0&&checkPlan==0){//资格预审，且为合格制
		$(".checkType0").show();		
		$(".gather").show();
	}
	if(examType==0&&(checkPlan==1||checkPlan==5)){//资格预审，且为有效数量制
		$(".checkType0").show();
		$(".checkType1").show();
		$(".gather").show();
	}
	if(examType==1&&checkPlan==0){//资格后审，且为综合评分法
		$(".checkType0").show();
		$(".checkType1").show();
		$(".checkType3").show();
		$(".checkType4").show();
		$(".gather").show();
	}
	if(examType==1&&isShowEnvelope==1){//是否设置双信封
		$("#isShowEnvelope").show();		
	}
	if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
		$(".isOpenDarkDoc").show();		
	}
	if(examType==1&&(checkPlan==1||checkPlan==3 || checkPlan==4 || checkPlan==5)){//资格后审，且为最低价法
		$(".checkType0").show();
		$(".checkType2").show();
		$(".checkType3").show();
		$(".checkType4").show();
		$(".gather").show();
	}
	if(examType==1&&checkPlan==4){//资格后审，且为最低价法
		$(".checkType0").show();
		$(".checkType2").show();
		$(".checkType3").show();
		$(".checkType4").hide();
		$(".gather").show();
	}
	if(examType==1&&checkPlan==2){//资格后审，且为经评审的最低价法(价格评分)
		$(".checkType0").show();
		$(".checkType3").show();
		$(".checkType4").show();
		$(".gather").show();
	}
	$("#sort").val(sort)
	$("input[name='checkType']").on('click',function(){
		if($(this).val()==0){
			$("#Weights").hide();
			$(".isSetTotal").hide();
			$(".isAddPrice").hide();	
			$(".addPrice").hide();			
			$(".gather").show();
			$(".gather3").hide();	
			$(".startPriceFrom").hide();
			$(".packageSet").hide();
			if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
				$(".isOpenDarkDoc").show();		
			}	
			
		}
		if($(this).val()==1){
			if(examType==1){
				$("#Weights").show();
			}
			$(".gather").hide();
			$(".isSetTotal").hide();
			$(".isAddPrice").hide();
			$(".addPrice").hide();	
			$(".gather3").hide();
			$(".startPriceFrom").hide();
			$(".packageSet").hide();	
			if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
				$(".isOpenDarkDoc").show();		
			}		
		}
		if($(this).val()==2){
			$("#Weights").hide();
			$(".gather").show();
			$(".isSetTotal").show();
			if(examType==1&&(checkPlan==1 || checkPlan==4 || checkPlan==5)){
				$(".isAddPrice").show();
			}			
			$(".addPrice").hide();
			$(".gather3").hide();	
			$(".startPriceFrom").hide();
			$(".packageSet").hide();	
			if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
				$(".isOpenDarkDoc").show();		
			}
		}
		if($(this).val()==3){
			$("#Weights").hide();
			$(".gather").hide();
			$(".isSetTotal").hide();
			$(".isAddPrice").hide();			
			$(".addPrice").hide();
			$(".gather3").show();
			$(".startPriceFrom").hide();
			$(".packageSet").hide();
			if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
				$(".isOpenDarkDoc").show();		
			}
							
		}
		if($(this).val()==4){
			$("#Weights").hide();
			$(".gather").hide();
			$(".isSetTotal").hide();
			$(".isAddPrice").hide();			
			$(".addPrice").hide();
			$(".gather3").hide();
			$(".priceCheckMode").show();
			$(".startPriceFrom").show();
			$(".isOpenDarkDoc").hide()
			$(".packageSet").show();
			if($("#checkName").val()==""){
				$("#checkName").val('竞价')
			}				
		}
	})
	$("input[name='isAddPrice']").on('click',function(){
		if($(this).val()==0){
			$(".addPrice").show();				
		}else{
			$(".addPrice").hide();	
		}		
	})
	if($('#denominator').val()==2){
		var option='<option value="1">1</option>';
	 }else{
		var option="";	
	 }
	 $("#numerator").html(option)
	 $('#denominator').on('change',function(){
		numerator($(this).val())
		 $("#totalM").html(Arabia_To_SimplifiedChinese($(this).val()));
		 $("#totalN").html(Arabia_To_SimplifiedChinese(1));
	 });
	 $("#numerator").on('change',function(){
		 $("#totalN").html(Arabia_To_SimplifiedChinese($(this).val()));
	 })
	//获取评审项详情
	if(id){
		$.ajax({
			type: "post",
			url:findData,
			async:false,
			data:{
				'id':id
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					for(key in response.data){
						$('input[name="'+ key  +'"][value="'+ response.data[key] +'"]').prop('checked',true);
						$("#"+key).val(response.data[key]);
						if(key=="checkType"){	
							checkType=response.data[key];						
							if(response.data[key]==0){
								$("#Weights").hide();
								$(".isSetTotal").hide();
								$(".isAddPrice").hide();	
								$(".addPrice").hide();			
								$(".gather").show();
								$("#denominator").val(response.data.totalM);
								numerator(response.data.totalM)
								$("#numerator").val(response.data.totalN);
								$("#totalM").html( sectionToChinese(response.data.totalM||2));
								$("#totalN").html( sectionToChinese(response.data.totalN||1));	
								$(".startPriceFrom").hide();
								$(".packageSet").hide();
								if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
									$(".isOpenDarkDoc").show();		
								}
							}
							if(response.data[key]==1){
								if(examType==1){
									$("#Weights").show();
								}
								$(".gather").hide();
								$(".isSetTotal").hide();
								$(".isAddPrice").hide();
								$(".addPrice").hide();	
								$(".startPriceFrom").hide();
								$(".packageSet").hide();	
								if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
									$(".isOpenDarkDoc").show();		
								}		
							}
							if(response.data[key]==2){
								$("#Weights").hide();
								$(".gather").show();
								$(".isSetTotal").show();
								if(examType==1&&(checkPlan==1 || checkPlan==4 || checkPlan==5)){
									$(".isAddPrice").show();
								}
								if(response.data['isAddPrice']==0){
									$(".addPrice").show();	
								}else{
									$(".addPrice").hide();	
								}	
								$("#denominator").val(response.data.totalM);
								numerator(response.data.totalM)
								$("#numerator").val(response.data.totalN);
								$("#totalM").html( sectionToChinese(response.data.totalM||2));
								$("#totalN").html( sectionToChinese(response.data.totalN||1));	
								$(".startPriceFrom").hide();
								$(".packageSet").hide();
								if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
									$(".isOpenDarkDoc").show();		
								}	
							}
							if(response.data[key]==3){
								$("#Weights").hide();
								$(".gather").hide();
								$(".isSetTotal").hide();
								$(".isAddPrice").hide();			
								$(".addPrice").hide();
								$(".gather3").show();
								$(".startPriceFrom").hide();
								$(".packageSet").hide();
								if(examType==1&&isOpenDarkDoc==1){//是否启用暗标
									$(".isOpenDarkDoc").show();		
								}			
							}
							if(response.data[key]==4){
								$("#Weights").hide();
								$(".gather").hide();
								$(".isSetTotal").hide();
								$(".isAddPrice").hide();			
								$(".addPrice").hide();
								$(".gather3").hide();
								$(".priceCheckMode").show();
								$(".startPriceFrom").show();
								$(".packageSet").show();
								$(".isOpenDarkDoc").hide()
								$('input[name=priceCheckMode][value='+response.data.priceCheckMode+']').attr('checked',true);
								$('input[name=bidStartPriceFrom][value='+response.data.bidStartPriceFrom+']').attr('checked',true);
							}
						}
						if(key=="weight"){
							WeightsTotal=(WeightsTotal*1000-response.data[key]*1000)/1000
						}
					}
				}
			}
		});
	}
	$('.reduceNum').on('click',function(){
		var obj = $("#sort");
			if (obj.val() <= 0) {
				obj.val(0);
			} else {
				obj.val(parseInt(obj.val()) - 1);
			}
			obj.change();
	})
	$('.addNum').on('click',function(){
		var obj = $("#sort");
			obj.val(parseInt(obj.val()) + 1);
			obj.change();
	})
	// 关闭
	$("#btnClose").on('click',function(){
		var index=top.parent.layer.getFrameIndex(window.name);
        top.parent.layer.close(index);
	})
	// 提交，修改
	$("#btnSave").on('click',function(){
		if(test()){
			parent.layer.alert(test());
			return false;
		}
		if($("input[name='checkType']:checked").val()==4){
			var packageSetData,checkListData;
			$.ajax({
				type: "post",
				url: config.offerhost+"/info",
				data: {
				'packageId':packageId,
				'biddingTimes':1
				},
				async:false,
				success: function (res) {
					if(res.success && res.data){
						packageSetData=res.data;
						//明细详情
						if(packageSetData.details){
							checkListData=packageSetData.details
						}					
					}else{
						
					}
				}
			});
			if(!packageSetData){
				parent.layer.alert('请添加竞价参数');
				return;
			}		
		}
		if(id&&checkType!=$("input[name='checkType']:checked").val()){
			parent.layer.confirm('温馨提示：切换评审方式时，将会删除你已添加的评审内容，是否确定删除？', {
				btn: ['是', '否'] //可以无限个按钮
			  }, function(indexs, layero){
					subData()
					parent.layer.close(indexs); 
						  
			  }, function(index){
				 parent.layer.close(index)
			  });
		}else{
			subData()
		}	
	})
})
function subData(){
	var pare={
		'checkName':$("#checkName").val(),
		'checkType':$("input[name='checkType']:checked").val(),
		'sort':$("#sort").val(),
		'showCheckInfo':$("#showCheckInfo").val(),
		'isShowCheck':$("#isShowCheck").val(),
		'examType':examType,
		'packageId':packageId,	
	}
	if(examType==1&&isOpenDarkDoc==1){
		pare.isShadowMark=$('input[name="isShadowMark"]:checked').val()
	}
	if(examType==1&&isShowEnvelope==1){
		pare.envelopeLevel=$('input[name="envelopeLevel"]:checked').val()
	}
	// 合格制
	if($("input[name='checkType']:checked").val()==0){
		pare.totalM=$('#denominator').val();
		pare.totalN=$('#numerator').val();
		pare.totalType=2;
	}
	// 评分制
	if($("input[name='checkType']:checked").val()==1){
		if(examType==1){
			pare.weight=$('#weight').val();
		}else{
			pare.weight=0;	
		}
		// 权重值
		pare.totalType=1;
		pare.scoreTotal=dcmt.Score_Total_num||0
	}
	// 偏离制
	if($("input[name='checkType']:checked").val()==2){
		pare.totalM=$('#denominator').val();
		pare.totalN=$('#numerator').val();
		// 偏离项
		pare.deviate=$('#deviate').val();
		// 是否计入总数
		pare.isSetTotal=$("input[name='isSetTotal']:checked").val();
		// 是否加价
		pare.isAddPrice=$("input[name='isAddPrice']:checked").val();
		pare.totalType=2
		if($("input[name='isAddPrice']:checked").val()==0){
			// 偏离加价幅度
			pare.addPrice=$('#addPrice').val();
		}			
	}
	// 评分合格制
	if($("input[name='checkType']:checked").val()==3){
		pare.totalType=1;
		pare.lowerScore=$("#lowerScore").val();
		pare.scoreTotal=dcmt.Score_Total_num||0
	}
	// 竞价
	if($("input[name='checkType']:checked").val()==4){
		pare.priceCheckMode=$('input[name="priceCheckMode"]:checked').val();
		pare.bidStartPriceFrom=$('input[name="bidStartPriceFrom"]:checked').val();
		if(examType==1&&isOpenDarkDoc==1){
			pare.isShadowMark=0;
		}
		
	}
	//当主键id存在时，修改评审项
	if(id){
		pare.id=id;
		$.ajax({
			type: "post",
			url:updateChenkUrl,
			data:pare ,
			dataType: "json",
			success: function (response) {
				if(response.success){
					dcmt.PackageCheckList(_index);
					var index=top.parent.layer.getFrameIndex(window.name);
					top.parent.layer.close(index);
				}else{
					parent.layer.alert(response.message)
				}
			}
		});
	}else{//当id不存在时，添加评审项
		$.ajax({
			type: "post",
			url:CheckListSave,
			data: pare,
			dataType: "json",
			success: function (response) {
				if(response.success){
					dcmt.PackageCheckList(sort-1);
					var index=top.parent.layer.getFrameIndex(window.name);
					top.parent.layer.close(index);
				}else{
					parent.layer.alert(response.message)
				}
			}
		});
	}
}
//分子
function numerator(numbers){
	option='';
	for(var i=1;i<numbers;i++){
		option+='<option value="'+ i +'">'+ i +'</option>'
	};
	$("#numerator").html(option);
}
//验证
function test(){
	if($('#checkName').val()==""){
		return '温馨提示：请填写评审项名称'
	}
	if(examType==1&&isShowEnvelope==1){
		if(packageCheckListInfo.length>0){
			for(var i=0;i<packageCheckListInfo.length;i++){
				if(packageCheckListInfo[i].sort<$("#sort").val()){
					if(packageCheckListInfo[i].envelopeLevel==2&&$('input[name="envelopeLevel"]:checked').val()==1){
						return '温馨提示：第二信封评审项后面不能添加第一信封评审项'
					}
				}
				if(packageCheckListInfo[i].sort>$("#sort").val()){
					if(packageCheckListInfo[i].envelopeLevel==1&&$('input[name="envelopeLevel"]:checked').val()==2){
						return '温馨提示：第二信封评审项后面不能添加第一信封评审项'
					}
				}
			}
		}else{
			if($('input[name="envelopeLevel"]:checked').val()==2){

				return '温馨提示：未添加第一信封评审项时，不能添加第二信封评审项'
			}
		}
		
	}
	
	if($("input[name='checkType']:checked").val()==1){
		if(examType==1){
			if($('#weight').val()==""){
				return '温馨提示：请填写权重值'
			}
			if(!(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test($('#weight').val()))||$('#weight').val()>1){ 			
				return "温馨提示：权重值只能是大于零且不超过1的数字";
			};
			if(parseFloat(WeightsTotal)+parseFloat($('#weight').val())>1){
				return "温馨提示：所有评审项的权重值之和不得大于1";
			}
		}			
	}
	if($("input[name='checkType']:checked").val()==2){
		if($('#deviate').val()==""){
			return '温馨提示：请填写允许最大偏离项数'
		}
		if(!(/^[1-9]\d*$/.test($("#deviate").val()))){
			return '温馨提示：允许最大偏离项数须为正整数';
		}
		if(parseInt($("#deviate").val()) > parseInt(dcmt.$("#deviate").val())){			        	 		
			return "温馨提示：评审项的允许最大偏离项数不能大于包件的允许最大偏离项数";
		}
		if($("input[name='isAddPrice']:checked").val()==0){
			if($('#addPrice').val()==""){
				return '温馨提示：请填写偏离'+(checkPlan == 4?'减':'加')+'价幅度'
			}
			if(!(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test($('#addPrice').val()))){ 			
				return "温馨提示：偏离"+(checkPlan == 4?'减':'加')+"价幅度只能是大于零的数字";
			};
			if($('#addPrice').val()>100){ 			
				return "温馨提示：偏离"+(checkPlan == 4?'减':'加')+"价幅度不能超过100";
			};
		}
	}	
	if($("input[name='checkType']:checked").val()==3){
		if($('#lowerScore').val()==""){
			return '温馨提示：请填写淘汰分值'
		}
		if(!(/^[1-9]\d*$/.test($("#lowerScore").val()))){
			return '温馨提示：淘汰分值须为正整数';
		}
	}
	if($("input[name='checkType']:checked").val()==4&&examType==1&&isShowEnvelope==1&&$('input[name="envelopeLevel"]:checked').val()==1){
		return '温馨提示：评审方式为竞价的评审项只能设置为第二信封';
	}
}