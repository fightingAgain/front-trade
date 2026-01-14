var isPublic=""//
var classificaCode;//供应商分类code
var addsupplier='Auction/Sale/Agent/SalePurchase/model/add_supplier.html';//邀请供应商的弹出框路径;
var viewSupplierUrl="Auction/Sale/Agent/SalePurchase/model/viewSupplier.html";//查看供应商信息
$("input[name='isPublics']").on('click',function(){
	if($(this).val()==0){
		$("input[name='isPublic'][value='0']").prop("checked",true);
		$('.isPublics0').show();
		$('.isPublics1').hide();
		$(".yao_btn").hide();	
	}else if($(this).val()==1){
		$("input[name='isPublic'][value='2']").prop("checked",true);
		$('.isPublics1').show();
		$('.isPublics0').hide();
		$(".yao_btn").show();
		Publics();
	}
	$(".isPublics3").hide();
	$("#CODENAME").val("");
	$("#supplierClassifyCode").val("");
});
$("input[name='isPublic']").on('change',function(){
	if(publicData.length>0){
		$.ajax({
			type:"post",
			url: top.config.AuctionHost+"/ProjectSupplierController/deleteProjectSuppliers.do",
			async:false,
			data:{
				'projectId':projectIds,
				'tenderType':2
			},
			success:function(res){
				if(res.success){
					publicData=[];//清除数组
					getDate();//刷新数据
					sessionStorage.removeItem("keysjd"); //清除焕春
				}
			}
		});
	}
	if($(this).val()==3){
		$('.isPublics3').show();
	}else{
		$('.isPublics3').hide();
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
	}
});

//最少供应商数量
$('#reduceNum').on('click', function() {
	var obj = $("input[name='supplierCount']");
	if(obj.val() <= 1) {
		obj.val(1);
	} else {
		obj.val(parseInt(obj.val()) - 1);
	}
	obj.change();
})

$('#addNum').on('click', function() {
	var obj = $("input[name='supplierCount']");
	obj.val(parseInt(obj.val()) + 1);
	obj.change();
});
//限时
$('#reduceNum_time').on('click', function() {
	var obj = $("#timeLimit");
	if(obj.val() <= 1) {
		obj.val(1);
	} else {
		obj.val(parseInt(obj.val()) - 1);
	}
	obj.change();
})
$('#addNum_time').on('click', function() {
	var obj = $("#timeLimit");
	obj.val(parseInt(obj.val()) + 1);
	obj.change();
});
$("#supplierCount").on('change', function() {
	if($("#supplierCount").val()>1){
		$("#supplierCount").attr("readonly",false)
		if(!((/^[1-9]\d*$/.test($(this).val())))) {
		parent.layer.alert("只能输入正整数");
		$(this).val("");
		return
	}
	}else{
		$("#supplierCount").attr("readonly",true)
	}
	
})
//供应商分类返回值
function classifica(CODE,NAME){
	$("#CODENAME").val(NAME.join(','));
	classificaCode=CODE.join(',');
	$("#supplierClassifyCode").val(classificaCode);
	if(publicData.length>0){
		$.ajax({
			type:"post",
			url: top.config.AuctionHost+"/ProjectSupplierController/deleteProjectSuppliers.do",
			async:false,
			data:{
				'projectId':projectIds,
				'tenderType':2
			},
			success:function(res){
				if(res.success){
					publicData=[];//清除数组
					getDate();//刷新数据
					sessionStorage.removeItem("keysjd"); //清除焕春
				}
			}
		});
	}
}
//供应商分类
$("#CODENAME").on("click",function(){
	if($("#purchaserName").html()==""||$("#purchaserName").html()==undefined||$("#purchaserName").html()==null){
		parent.layer.alert("请先选择采购人")
		
		return
	}
	var purchaserId=purchaseaData.purchaserId;
	parent.layer.open({
		type: 2 //此处以iframe举例
		,title: '选择供应商分类'
		,area: ['400px', '600px']
		,content:'view/Bid/PurchaserSupplier/classification.html?type=choose&purchaserId='+purchaserId		            
	});
})
var Publicid=[];
function Publics(){
	Publicid=[];
	$.ajax({
		type:"get",
		url: top.config.AuctionHost+"/ProjectSupplierController/findProjectSupplierList.do",
		async:false,
		data:{			
			'projectId':projectIds,
			'tenderType':2
		},
		success:function(res){
			if(res.success){
				publicData=res.data				
				for(var i=0;i<publicData.length;i++){
			     	Publicid.push(publicData[i].supplierId);    	
			    };
			    sessionStorage.setItem('keysjd', JSON.stringify(Publicid));//邀请供应商的id缓存    
				getDate();
			}
		}
	});	
}
function getDate(){
	Publicid=[];		  	 	      
  	if(publicData.length>7){
		var heights='304'
  	}else{
		var heights=''
  	}
	  if(publicData.length>0){
		var RenameData = getBidderRenameData(projectIds);//投标人更名信息
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
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}

			},
			{
				field: "enterprise.enterprisePerson",
				title: "联系人",
				halign: "center",				
				align: "center",
				width:'100px',
				formatter: function(value, row, index) {
					if(row.bidderContact&& row.bidderTel){
						return row.bidderContact
					}else{
						return value
					}
				}
			}, {
				field: "enterprise.enterprisePersonTel",
				title: "联系电话",
				halign: "center",
				width:'100px',
				align: "center",
				formatter: function(value, row, index) {
					if(row.bidderContact&& row.bidderTel){
						return row.bidderTel
					}else{
						return value
					}
				}								
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
						var isAccept="<div class='text-danger' style='font-weight:bold'>接受</div>"
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
	$('#yao_table').bootstrapTable("load", publicData); //重载数据
}
//添加供应商
function add_supplier(){
	if($("#purchaserName").html()==""||$("#purchaserName").html()==undefined||$("#purchaserName").html()==null){
		parent.layer.alert("请先选择采购人")
		
		return
	}
    var purchaserId=purchaseaData.purchaserId;
	var isPublic=$("input[name='isPublic']:checked").val()
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(isPublic,projectIds,purchaserId,classificaCode)
        }             
     });
 }
//删除邀请供应商
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
}
//查看邀请供应商信息
function viewSupplier(i,dThis){
	//sessionStorage.setItem('publicData', JSON.stringify(publicData[i]));//当前供应商的数据缓存
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看'
        ,area: ['700px', '500px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
            var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
            iframeWind.du(publicData[i]);//弹出框弹出时初始化     	
        }
    });
}