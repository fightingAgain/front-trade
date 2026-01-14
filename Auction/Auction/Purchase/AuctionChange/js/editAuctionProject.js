var purchaseaData="";

var packageData=[],packageData1=[];//包件的数据容器
var publicDatas=[];//邀请供应商数据的容器
var DetailedData=[];//设备信息的数据容器
var sourceFundsId=""//资金来源Id
var PurchaserData=""//企业信息参数
var massage2=""//
var typeIdList="";//媒体的ID
var typeNameList="";//媒体名字
var typeCodeList="";//媒体编号
var projectCode="";//切换手写或自动生成编码
var itemTypeId=[]//媒体ID
var itemTypeName=[]//媒体名字
var itemTypeCode=[]//媒体编号
var classificaCode;//供应商类型
var depositList,isDf=false;
//费用信息
var projectPriceInfo = [];
$(function(){
	setProvince();
	setCity('42');
	Purchase();	
	du();
	medias();
	time();	
	$("#browserUrl").attr('href',siteInfo.portalSite);
    $("#browserUrl").html(siteInfo.portalSite);
	$("#webTitle").html(siteInfo.sysTitle);
	if(sysEnterpriseId){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			$("#projectCode").attr('readonly',true);
		}else{
			$("#projectCode").attr('readonly',false);
		}
		if(purchaseaData.project[0].projectSource==1){
			isDf=true;
			getDeposit()
		}
	}
});
var addpackageurl='Auction/Auction/Agent/AuctionPurchase/model/addAcutionPackage.html';
var editpackageurl='Auction/Auction/Agent/AuctionPurchase/model/editAcutionPackage.html';
var addsupplier='Auction/Auction/Agent/AuctionPurchase/model/add_supplier.html'//邀请供应商的弹出框路径
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"
//获取该项目下的所有数据的接口
var pricedelete=config.AuctionHost +'/ProjectPriceController/deleteProjectPriceByPackage.do'//费用删除
var allProjectData=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//项目数据的接口
var updateAuctionPurchase=config.AuctionHost+'/AuctionPurchaseController/saveAuctionPurchase.do';//提交修改数据
var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var WorkflowUrl=config.AuctionHost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var saveProjectPackage=config.AuctionHost+"/AuctionProjectPackageController/saveAuctionProjectPackage.do"
var deletProjectUrl=config.AuctionHost+"/AuctionProjectPackageController/deleteProjectPackage.do"
var isCheck;
var projectDataID = getUrlParam('projectId');
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
//提交审核
$("#btn_submit").click(function() {

	var ueContent	= ue.getContent();
	ueContent = ueContent.replace(/<style[\s\S]*?<\/style>/ig,"");
	ueContent = ueContent.replace(/<\/?.+?\/?>/g,"");
	ueContent = ueContent.replace(/&nbsp;/ig,"");
	ueContent = ueContent.trim();
	if(ueContent==''){
		parent.layer.alert("请输入竞价公告信息!");        		     		
		return false;
	}
	
	$("#content").val(ue.getContent()) 
	if(text()){
		parent.layer.alert(text());		
		return
	}

	if(isDf){
		if(depositList.subitemData()){
			top.layer.confirm((publicDatas.length>0?'邀请':'')+'{'+depositList.subitemData()+'},保证金没有转移到本项目，确认不转移吗？', function(index) {
				form();
				parent.layer.close(index);
			})
		}else{
			form();
		}
	}else{
		form();
	}
})
function form(){
	//formd()
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
			$('input[name="project.projectState"]').val(1) //审核状态0为临时保存，1为提交审核
			
			$.ajax({
				url: updateAuctionPurchase,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: $("#form").serialize(),
				success: function(data) {
					
					if(data.success == true) {						
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						if(isDf){
							depositList.saveData(1);
						}	
						top.layer.alert("提交审核成功");
						var index = top.parent.layer.getFrameIndex(window.name);
						top.parent.layer.close(index);
					} else {
						top.layer.alert(data.message);
					}
				},
				error: function(data) {
					top.layer.alert("提交审核失败")
				}
			});			 
		})
	} else {
		$('input[name="project.projectState"]').val(1) //审核状态0为临时保存，1为提交审核
		
		$("#content").val(ue.getContent()) 
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: $("#form").serialize(),
			success: function(data) {
				if(data.success == true) {

					if(isDf){
						depositList.saveData(1);
					}
					parent.layer.alert("提交审核成功");

					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					var index = top.parent.layer.getFrameIndex(window.name);
					top.parent.layer.close(index);	
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function(data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}
}

//临时保存
$("#btn_bao").click(function() {
	forms()
})
//退出
$("#btn_close").click(function() {
	parent.layer.closeAll()
})
function forms(){
	$('input[name="project.projectState"]').val(0)//审核状态0为临时保存，1为提交审核
	var ueContent	= ue.getContent();
	ueContent = ueContent.replace(/<style[\s\S]*?<\/style>/ig,"");
	ueContent = ueContent.replace(/<\/?.+?\/?>/g,"");
	ueContent = ueContent.replace(/&nbsp;/ig,"");
	ueContent = ueContent.trim();
	if(ueContent==''){
		parent.layer.alert("请输入竞价公告信息!");        		     		
		return false;
	}
	$("#content").val(ue.getContent())
	//formd()
	$.ajax({
	   	url:updateAuctionPurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){ 
	   		if(data.success==true){

				   	parent.layer.alert("保存成功");
				   	if(isDf){
						depositList.saveData(2);
					}
	   		}else{
	   			parent.layer.alert(data.message);
	   		}   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("保存失败")
	   	}
	  });	
}
function Purchase(){
	
	$.ajax({
	   	url:allProjectData+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectDataID
	   	},
	   	success:function(data){ 	
	   		if(data.success){
	   			//项目数据
		   		purchaseaData=data.data;	   		
		   		
		   		//邀请供应商的数据
		   		//publicDatas=purchaseaData.projectSupplier;
		   		//费用信息
		   		projectPriceInfo = purchaseaData.projectPriceData;
		   		if(purchaseaData.autionProjectPackage.length>0){
		   			//包件信息的数据
			   		packageData=purchaseaData.autionProjectPackage;
			   		//设备信息的数据
					DetailedData = purchaseaData.auctionPackageDetailed;
		   		}else{
		   			packageData=[]
		   		}
		   		package();
		   		
	   		}
	   		
	   	},
	   	error:function(data){
	   		parent.layer.alert("处理失败")
	   	}
	  });	
	  
	  
	  for(var i=0;i<packageData.length;i++){
		
		var projectPrices = [];
		packageData1.push({
			packageId:packageData[i].id,
			projectId:packageData[i].projectId,
			projectForm:1
		})
		for(var j=0;j<projectPriceInfo.length;j++){
		
			if(packageData[i].id == projectPriceInfo[j].packageId ){
				projectPrices.push(projectPriceInfo[j]);
				packageData[i].projectPrice = projectPrices;
			}
		}
	}	
	  
};
function du(){
	
	$("#projectName").val(purchaseaData.project[0].projectName);
	$("#projectCode").val(purchaseaData.project[0].projectCode);	      

	$("#engineering option").eq(purchaseaData.project[0].projectType).attr("selected",true);
	if(purchaseaData.project[0].projectType==0){		
	    $('.engineering').show()
	}else{
		$('.engineering').hide()
	};
	Usersupplier()	
	$("#purchaserId").val(purchaseaData.purchaserId);
	$("#purchaserName").text(purchaseaData.purchaserName);
	$("#purchaserAddress").text(purchaseaData.purchaserAddress);
	$("#purchaserLinkmen").val(purchaseaData.purchaserLinkmen);
	$("#purchaserLinkmenId").val(purchaseaData.purchaserLinkmenId);
	$("#purchaserTel").text(purchaseaData.purchaserTel);
	$("#ppurchaserName").val(purchaseaData.purchaserName);
	$("#ppurchaserAddress").val(purchaseaData.purchaserAddress);
	$("#ppurchaserLinkmen").val(purchaseaData.purchaserLinkmen);
	$("#Province").val(purchaseaData.project[0].province||'42');	
	$("#City").val(purchaseaData.project[0].city||'4206');
	$("#provinceName").val(purchaseaData.project[0].provinceName||'湖北省');	
	$("#cityName").val(purchaseaData.project[0].cityName||'襄阳市');	
	$('input[name="settingNotice"][value="'+purchaseaData.settingNotice+'"]').attr("checked",true);
	$("#ppurchaserTel").val(purchaseaData.purchaserTel);
	$("input[name='project.tenderType']").eq(purchaseaData.project[0].tenderType).attr("checked",true);
	$('input[name="supplierCount"]').val((purchaseaData.supplierCount==undefined?"1":purchaseaData.supplierCount));
	$('input[name="project.projectSource"]').val(purchaseaData.project[0].projectSource);
	$("#projectSource").html(purchaseaData.project[0].projectSourceText);
	if(purchaseaData.project[0].projectSource==0){
        	$(".projectSource0").show();
        	$(".projectSource1").hide()
    }else if(purchaseaData.project[0].projectSource==1){
        	$(".projectSource1").show();
        	$(".projectSource0").hide()
    };
	$("input[name='isPublic']").eq(purchaseaData.isPublic).attr("checked",true);          
	if(purchaseaData.isPublic>1){		
	    Is_Public(purchaseaData.isPublic);
	}; 
	if(purchaseaData.isPublic==3){
		$('.isPublics3').show();
		$("#CODENAME").val(purchaseaData.supplierClassifyName);
		$("#supplierClassifyCode").val(purchaseaData.supplierClassifyCode);
	}                    
	$('#noticeStartDate').val(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');//公告开始时间
	$("#StartDate").html(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');	
	$('#noticeEndDate').val(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'');//公告截止时间
	$("#endDate").html(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'')
	$('#askEndDate').val(purchaseaData.askEndDate!=undefined?purchaseaData.askEndDate.substring(0,16):'');//提出澄清截止时间
	$('#answersEndDate').val(purchaseaData.answersEndDate!=undefined?purchaseaData.answersEndDate.substring(0,16):'');//答复截止时间
	$('#auctionStartDate').val(purchaseaData.auctionStartDate!=undefined?purchaseaData.auctionStartDate.substring(0,16):'');//竞价开始时间
	
	$('#projectId').val(purchaseaData.projectId);
	$("#purchaseId").val(purchaseaData.id);
	ue.ready(function() {
		//ue.setContent(result.data, true);		
		ue.execCommand('insertHtml', purchaseaData.content);
	});
	$("input[name='isFile']").eq(purchaseaData.isFile).attr("checked",true);
	if(purchaseaData.isFile==0){
		$("#isFileN").show();
		$('#fileEndDate').val(purchaseaData.fileEndDate!=undefined?purchaseaData.fileEndDate.substring(0,16):'');//竞价文件递交截止时间
		$('#fileCheckEndDate').val(purchaseaData.fileCheckEndDate!=undefined?purchaseaData.fileCheckEndDate.substring(0,16):'');//竞价文件审核截止时间
	}else{
		$("#isFileN").hide();
		$('#fileEndDate').val("");//竞价文件递交截止时间
		$('#fileCheckEndDate').val("");//竞价文件审核截止时间
	};	
	sourceFunds();
}
//获取当前登录人的企业信息
function Usersupplier(){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		if(purchaseaData.agencyName!=""&&purchaseaData.agencyName!=undefined){
				$("#agencyNames").text(purchaseaData.agencyName);
				$("#agencyName").val(purchaseaData.agencyName);
				$("#agencyId").val(purchaseaData.agencyId);
				$("#agencyAddress").val(purchaseaData.agencyAddress);
				$("#agencyLinkmen").val(purchaseaData.agencyLinkmen);
				$("#agencyTel").val(purchaseaData.agencyTel);
			}else{
				$('#agencyName').val(data.data.enterpriseName)
				$('#agencyNames').html(data.data.enterpriseName)
				$('#agencyId').val(data.data.id)
				$('#agencyAddress').val(data.data.enterpriseAddress)
				$('#agencyLinkmen').val(top.userName)
				$('#agencyTel').val(top.userTel)
			}
	   		
	   	}
	});    
};

//项目类型为工程类时显示建设工程名字等内容
$("#engineering").on('change',function(){
	if($(this).val()==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}
});
$('input[name="isFile"]').on('click', function() {
	if($(this).val() == 0) {
		$("#isFileN").show()
	} else {
		$("#isFileN").hide()
		$('#fileEndDate').val("");
		$('#fileCheckEndDate').val("");
	}

});
//是否有邀请供应商0为所有供应商，1为所有本公司认证供应商，2为仅限邀请供应商，3为仅邀请本公司认证供应商
var isPublic=""//
function Is_Public(num){
	//0和1则不需要邀请供应商
	if(num>1){		
		$(".yao_btn").removeClass('none');
		Publics()
	}else{
		$(".yao_btn").addClass('none');		
	};
	if(num!=purchaseaData.isPublic){		
		sessionStorage.removeItem("keysjd");
        sessionStorage.removeItem("sadasd");
	}
	isPublic=num
};
var Publicid=[];
function Publics(){
	Publicid=[];
	$.ajax({
		type:"post",
		url: top.config.AuctionHost+"/ProjectSupplierController/findProjectSupplierList.do",
		async:false,
		data:{			
			'projectId':projectDataID,
			'tenderType':1
		},
		success:function(resx){
			if(resx.success){
				publicDatas=resx.data				
				for(var i=0;i<publicDatas.length;i++){
			     	Publicid.push(publicDatas[i].supplierId);    	
			    };
			    sessionStorage.setItem('keysjd', JSON.stringify(Publicid));//邀请供应商的id缓存    
				getDate();
			}
		}
	});	
}
$("input[name='isPublic']").on('change',function(){
	if(publicDatas.length>0){
		$.ajax({
			type:"post",
			url: top.config.AuctionHost+"/ProjectSupplierController/deleteProjectSuppliers.do",
			async:false,
			data:{
				'projectId':projectDataID,
				'tenderType':1
			},
			success:function(res){
				if(res.success){
					publicDatas=[];//清除数组
					getDate();//刷新数据
					sessionStorage.removeItem("keysjd"); //清除焕春
				}
			}
		});
	}
	if($(this).val()==3){
	    $(".isPublics3").show();
   	}else{
		$(".isPublics3").hide();
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
   	}	
});
//供应商分类返回值
function classifica(CODE,NAME){
	$("#CODENAME").val(NAME.join(','));
	classificaCode=CODE.join(',');
	$("#supplierClassifyCode").val(classificaCode)
}
//供应商分类
$("#CODENAME").on("click",function(){
	var purchaserId=$("#purchaserId").val();
	parent.layer.open({
		type: 2 //此处以iframe举例
		,title: '选择供应商分类'
		,area: ['400px', '600px']
		,content:'view/Bid/PurchaserSupplier/classification.html?type=choose&purchaserId='+purchaserId		            
	});
})
function getDate(){		  	 	      
  	if(publicDatas.length>7){
		var heights='304'
  	}else{
		var heights=''
  	}
    $('#yao_table').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:heights,
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
				field: "enterprise.enterpriseName",
				title: "企业名称",
				align: "left",
				halign: "left",
				width: "200px",

			},
			{
				field: "enterprise.enterprisePerson",
				title: "联系人",
				halign: "center",				
				align: "center",
				width:'100px',
			}, {
				field: "enterprise.enterprisePersonTel",
				title: "联系电话",
				halign: "center",
				width:'100px',
				align: "center",								
			}, {
				field: "enterprise.enterpriseLevel",
				title: "认证状态",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){					
					if(row.enterprise.enterpriseLevel==0){					
					   var	enterpriseLevel= "未认证"
					};
					if(row.enterprise.enterpriseLevel==1){					
						var	enterpriseLevel=  "提交认证"
					};
					if(row.enterprise.enterpriseLevel==2){					
						var	enterpriseLevel=  "受理认证"
					};
					if(row.enterprise.enterpriseLevel==3){
						var	enterpriseLevel=  "已认证"
					};
					if(row.enterprise.enterpriseLevel==4){
						var	enterpriseLevel=  "已认证"
					};	
		     		return enterpriseLevel
				}
			}, {
				field: "isAccept",
				title: "确认状态",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){					
					if(value=="0"){
						var isAccept="<div class='text-success' style='font-weight:bold'>接受</div>"
					}else if(value=="1"){
						var isAccept="<div class='text-danger' style='font-weight:bold'>拒绝</div>"
					}else{
						var isAccept="未确认"
					}
		     		return isAccept
				}
			},{
				field: "cz",
				title: "操作",
				halign: "center",
				align: "center",
				width:'120px',
				formatter:function(value, row, index){					
					var Tdr='<div class="btn-group">'
			   		          +'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'
			   		          +'<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\")>删除</a>'
			   		          +'</div>'
		     		return Tdr
				}
			}			
		]
	});	
	$('#yao_table').bootstrapTable("load", publicDatas); //重载数据
}
//添加媒体
var itemTypeId=[]//媒体ID
var itemTypeName=[]//媒体名字
var itemTypeCode=[]//媒体编号
function medias(){
	$.ajax({
        url:sendUrl ,
        type:"post",
		async:false,
        dataType:"json",
		data:{
			"optionName":"PUBLISH_MEDIA_NAME"
			},
		success: function(result){	
			var op="";
			if(result.success){
				for(var i=0;i<result.data.length;i++){
					op+='<option class="'+ result.data[i].optionValue +'" value="'+ result.data[i].optionText +'" data-tokens="'+ result.data[i].id +'">'+result.data[i].optionText +'</option> '
				}	
				$("#optionName").html(op)
			}
		}
	})
	for(var i=0;i<purchaseaData.options.length;i++){
			itemTypeName.push(purchaseaData.options[i].optionText);
			itemTypeId.push(purchaseaData.options[i].id);
			itemTypeCode.push(purchaseaData.options[i].optionValue)
	}
	typeNameList=itemTypeName.join(',');
	typeIdList=itemTypeId.join(',');
	typeCodeList=itemTypeCode.join(',');
	$("#optionName").selectpicker ("val",itemTypeName).trigger("change");
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);
}

//取出选择的任务执行人的方法
function  getOptoions(){
	var optionId = [], optionValue = [],optionName=[];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	for (var i = 0; i < $("li.selected").length; i++) {
		optionValue.push($("li.selected").eq(i).find("a").attr("class"));
		optionId.push($("li.selected").eq(i).find("a").attr("data-tokens"));
		optionName.push($("li.selected").eq(i).find(".text").text());
		
	}
	typeIdList=optionId.join(",")//媒体ID
	typeNameList=optionName.join(",")//媒体名字
    typeCodeList=optionValue.join(",")//媒体编号	
	//赋值给隐藏的Input域	
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);
 
}
//邀请供应商
function add_supplier(){
	if($("#purchaserName").html()==""||$("#purchaserName").html()==undefined||$("#purchaserName").html()==null){
		parent.layer.alert("请先选择采购人")
		
		return
	}
	sessionStorage.setItem('purchaserId', JSON.stringify($("#purchaserId").val()));//
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(isPublic,projectDataID,classificaCode)
        }             
     });
 }
//删除供应商
function supplierDelet(uid){
	parent.layer.confirm('确定要删除该供应商', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){		
		$.ajax({
		type:"get",
		url: top.config.AuctionHost+"/ProjectSupplierController/deleteProjectSupplier.do",
		async:false,
		data:{
			'id':uid
		},
		success:function(res){
			if(res.success){
				Publics();
				parent.layer.close(index);			
			}
		}
	});   
	}, function(index){
	   parent.layer.close(index)
	});
};
//查看邀请供应商信息
function viewSupplier(i){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看供应商信息'
        ,area: ['700px', '500px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
        	iframeWind.du(publicDatas[i])//弹出框弹出时初始化     	
        }
        
      });
};

function package(){
	if(packageData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#tablebjb').bootstrapTable({
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
				field: "packageNum",
				title: "包件编号",
				align: "left",
				halign: "left",
				width: "200px",

			},
			{
				field: "packageName",
				title: "包件名称",
				halign: "left",				
				align: "left",
				

			}, {
				field: "auctionTypeText",
				title: "竞价方式",
				halign: "center",
				width:'100px',
				align: "center",								
			},{
				field: "#",
				title: "操作",
				halign: "center",
				align: "center",
				width:'120px',
				formatter:function(value, row, index){					
					var Tdr='<div class="btn-group">'
		     		
					Tdr+='<button type="button" class="btn-xs btn btn-primary" style="margin-right:10px" onclick=editPackage(\"'+ row.id +'\",'+index+')>编辑</button>'
					 if(purchaseaData.project[0].projectSource==0){
						Tdr+='<button type="button" class="btn-xs btn btn-danger" onclick=deletPackage(\"'+ row.id +'\",'+index+')>删除</button>'
					 }
		     		
		     		Tdr+='</div>'
		     		+'</td>'
		     		return Tdr
				}
			}			
		]
	});
	$('#tablebjb').bootstrapTable("load", packageData); //重载数据	
};
//删除包件
function deletPackage(uid,i){
	parent.layer.confirm('确定要删除该包件', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({
	   	url:deletProjectUrl,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"id":uid
	   	},
	   	success:function(data){
	   		Purchase();
	   	},
	   	error:function(data){
	   		parent.layer.alert("删除失败")	   		
	   	}
	 });
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});
}
//修改包件
function editPackage(uid,num){
	sessionStorage.setItem('sdas', JSON.stringify(packageData[num]));
	var auctionOutType=[]
	if(purchaseaData.auctionOutType.length>0){
		for(var i=0; i<purchaseaData.auctionOutType.length;i++){
			if(purchaseaData.auctionOutType[i].packageId==packageData[num].id){
				auctionOutType.push(purchaseaData.auctionOutType[i])
			}
		}
	};
	var projectMsg = {
		agentId:purchaseaData.agencyId,
		puchaseId:$("#purchaserId").val(),
	};
	sessionStorage.setItem('projectMsg', JSON.stringify(projectMsg)); //代理机构,采购人id
	sessionStorage.setItem('auctionOutTypes', JSON.stringify(auctionOutType));
	var projectType=$("#engineering").val()
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '编辑包件'

        ,area: ['1100px', '650px']
        ,content:editpackageurl+'?projectSource='+purchaseaData.project[0].projectSource+'&projectType='+projectType
        ,btn: ['保存','取消']
        ,success:function(layero,index){        	
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.du(purchaseaData.openServiceFee); //代理服务费，是否是东风咨询
        }
        //确定按钮
        ,yes: function(index,layero){            
		
			var iframeWin=layero.find('iframe')[0].contentWindow;
			if(iframeWin.checkBank()!=true){
				parent.layer.alert(iframeWin.checkBank());
				return
			}
			//代理服务费
			if(!iframeWin.checkAgentFee(purchaseaData.openServiceFee)){
				return;
			}
			iframeWin.add_sdad();
			var arr={},arr1={},arr2={},arr3={};
			arr1 = top.serializeArrayToJson(iframeWin.$("#forms").serializeArray());//获取表单数据，并转换成对象；
			arr2 = top.serializeArrayToJson(iframeWin.$("#formCount").serializeArray());//获取表单数据，并转换成对象；
			arr3 = top.serializeArrayToJson(iframeWin.$("#projectPricesform").serializeArray());//获取表单数据，并转换成对象；
			arr = $.extend({},arr1,arr2,arr3);
			if(purchaseaData.project[0].projectSource==1){
				arr.isPayDeposit=iframeWin.data1.isPayDeposit;
				arr['projectPrices[1].payMethod']=iframeWin.$("#payMethod").val();
				arr['projectPrices[1].agentType']=iframeWin.$("inputp[name='projectPrices[1].agentType']:checked").val();			
				arr.isSellFile=iframeWin.data1.isSellFile;	
			}
			console.log(arr);
			$.ajax({   	
				url:config.AuctionHost+'/AuctionProjectPackageController/updateAuctionProjectPackage.do',//修改包件的接口
					type:'post',
					//dataType:'json',
					async:false,
					//contentType:'application/json;charset=UTF-8',
					data:arr,
					success:function(data){			   		
						if(data.success==true){
							parent.layer.alert("保存成功")
							Purchase()
							var auctionOutType=[]
							if(purchaseaData.auctionOutType.length>0){
								for(var i=0; i<purchaseaData.auctionOutType.length;i++){
									if(purchaseaData.auctionOutType[i].packageId==packageData[num].id){
										auctionOutType.push(purchaseaData.auctionOutType[i])
									}
								}
							
							}	
							sessionStorage.setItem('auctionOutTypes', JSON.stringify(auctionOutType));
							sessionStorage.setItem('sdas', JSON.stringify(packageData[num]));
							iframeWin.packagePriceData();
						}else{
							parent.layer.alert(data.message)
						}
					}   	
			});	                
        },
        btn2:function(){       	
        },        
      });
}
//添加
function add_bao(){
	if($("#purchaserName").html()==""||$("#purchaserName").html()==undefined||$("#purchaserName").html()==null){
		parent.layer.alert("请先选择采购人")
		
		return
	}
	if(packageData.length==0){
		$ind=0;
	}else if(packageData.length>0){
		$ind=packageData[0].packageNum.split('-')[packageData[0].packageNum.split('-').length - 1];
	};
	$ind=parseInt($ind)+parseInt(1);
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加包件'
        ,area: ['600px', '300px']
        ,content:addpackageurl
        ,btn: ['保存','取消']
        ,success:function(layero,index){
			var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象    
			if($("#projectName").val()!=""){
				iframeWind.$('#packageName').val($("#projectName").val());
			}       	      	
        	if($("#projectCode").val()){
				if($ind<10){
					iframeWind.$('#packageNum').val($("#projectCode").val()+'-0'+$ind);
				}else{
					iframeWind.$('#packageNum').val($("#projectCode").val()+'-'+$ind);
				} 
				iframeWind.$('#projectCode').val($("#projectCode").val());
			}        	
        	iframeWind.$('#projectId').val(projectDataID);
        }
        //确定按钮
        ,yes: function(index,layero){            
        
			var iframeWin=layero.find('iframe')[0].contentWindow;     
			if(iframeWin.$('#packageName').val()==""){
				parent.layer.alert("包件名称不能为空");        		     		
				return;
			}; 
			if(iframeWin.$('#dataTypeName').val()==""){
				parent.layer.alert("项目类型不能为空");        		     		
				return;
			};
			$.ajax({
				url:saveProjectPackage,
				type:'post',
				//dataType:'json',
				async:false,
				//contentType:'application/json;charset=UTF-8',
				data:iframeWin.$("#formbackage").serialize(),
				success:function(data){ 
				if(data.success==true){
					parent.layer.alert("添加成功");
					Purchase();
				}else{
					parent.layer.alert(data.message);
					
				};
				parent.layer.close(index);
				},
				error:function(data){
					parent.layer.alert("添加失败")
				}
			});			
         	parent.layer.close(index);
        },
        btn2:function(){ 
        	$ind=$ind-1
        },        
      });
};
//资金来源数据获取
function sourceFunds(){	
	$.ajax({
		   	url:sourceFundsUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"optionName":"MONEY_FROM"
		   	},
		   	success:function(data){			   		
		   	   var option="";
		   	   var is=""
		   	   for(var i=0;i<data.data.length;i++){
		   	   	 option+='<option value="'+data.data[i].id+'">'+data.data[i].optionText+'</option>'		   	   	
		   	   	 if(purchaseaData.sourceFundsId==data.data[i].id){		   	   	 	
		   	   	 	is=i
		   	   	 }
		   	   }
		   	   $("#sourceFunds").html(option);
		   	   $("#sourceFunds option").eq(is).attr("selected",true)
		   	}
	});
	//获取审核人列表
	$.ajax({
		   	url:WorkflowUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"workflowLevel":0,
		   		"workflowType":"xmgg"
		   	},
		   	success:function(data){			   	  
		   	   var option=""		   	  
		   	   //判断是否有审核人		   	  
		   	   if(data.message==0){		
		   	   	    isCheck==true;
		   	   	    $("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
		   	   	    $('.employee').hide()
		   	   	    return;
		   	   	};
		   	   if(data.message==2){		   	   	
		   	   	 	parent.layer.alert("找不到该级别的审批人,请先添加审批人");
		   	   	 	massage2=data.message;
	     	        return;
		   	   };
		   	   if(data.success==true){
		   	   	 $('.employee').show()
		   	   	 if(data.data.length==0){
			   	   	option='<option>暂无审核人员</option>'
			   	   }
			   	   if(data.data.length>0){
			   	   	workflowData=data.data
			   	   	option="<option value=''>请选择审核人员</option>"
			   	   	 for(var i=0;i<data.data.length;i++){
				   	   	 option+='<option value="'+data.data[i].employeeId+'">'+data.data[i].userName+'</option>'
				   	}
			   	   }		   	   			   	  			   	  
		   	   }		   	    
		   	   $("#employeeId").html(option);	
		   	}
	});
};
var PurchasersDataEnterprojectId="";
//选择采购人
function chosePucharse(){		
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '选择采购人'
	    ,area: ['1100px','600px']
	    ,content:'Auction/Auction/Agent/AuctionChange/model/Purchasers.html?tenderType=1'
	    //,btn: ['关闭']
	    ,maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸
	    ,success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow;
	    	iframeWind.du(PurchasersDataEnterprojectId)
	    }
        
  });
}

function showPurchse(PurchasersData){
	
	PurchasersDataEnterprojectId=PurchasersData.enterpriseId
	$("#purchaserId").val(PurchasersData.enterpriseId);
	$("#purchaserName").text(PurchasersData.enterprise.enterpriseName);
	$("#purchaserAddress").text(PurchasersData.enterprise.enterpriseAddress);	
	$("#ppurchaserName").val(PurchasersData.enterprise.enterpriseName);
	$("#ppurchaserAddress").val(PurchasersData.enterprise.enterpriseAddress);
	$("#ppurchaserLinkmen").val(PurchasersData.enterprise.enterprisePerson);
	$("#ppurchaserTel").val("");
	$("#purchaserLinkmen").val("");
}



/*
 * 2018-11-08  H
 * 选择联系人(竞卖,采购) 
 */
$("#purchaserLinkmen").click(function(){
	if($("#purchaserId").val()=="" || $("#ppurchaserName").val()==""){
		parent.layer.alert("请选择竞价人");
		return;
	}
	parent.layer.open({
		type: 2,
		area: ['800px', '550px'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "选择联系人",
		// btn:["确定","取消"],
		content: 'Auction/common/Agent/Purchase/purchasermenList.html?enterpriseId='+$("#purchaserId").val(),
		success: function(layero,index){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function(data){
				if(data != null &&　data.length>0){
					$("#purchaserLinkmen").val(data[0].userName);
					$("#purchaserLinkmenId").val(data[0].id);	     		
					$("#ppurchaserTel").val(data[0].tel);
				}
			})
		},
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var PurchasersData = iframeWin.$('#userList').bootstrapTable('getSelections');			
	     	if(PurchasersData != null &&　PurchasersData.length>0){
	     		$("#purchaserLinkmen").val(PurchasersData[0].userName);
	     		$("#purchaserLinkmenId").val(PurchasersData[0].id);	     		
	     		$("#ppurchaserTel").val(PurchasersData[0].tel);
	     	}
	     	parent.layer.close(index);
		}
	})
})
//原项目保证金转移到本项目
function getDeposit(){
	if(!depositList){
		depositList=$("#depositHtml").deposit({			
			status:1,//1为编辑2为查看
			tenderType:1,
			parameter:{//接口调用的基本参数
				projectId:purchaseaData.projectId,
				projectForm:1,
			},
			packageData:packageData1
		})
	}
}