var viewSupplierUrl="bidPrice/ProjectCheck/modal/viewSupplier.html";
var Publicid=[];
function Public(tenderType,packageId,projectId){
	if(tenderType==5){
		var supUrl=top.config.AuctionHost+"/JtProjectSupplierController/findProjectSupplierList.do"
	}else{
		var supUrl= top.config.AuctionHost+"/ProjectSupplierController/findProjectSupplierList.do"
	}
	var RenameBisnisId = ''
	if(tenderType == 0 || tenderType == 6){ //询比、单一
		RenameBisnisId = packageId
	}
	if(tenderType == 1 || tenderType == 2){ //竞价、竞卖
		RenameBisnisId = projectId
	}
   $.ajax({
	   type:"get",
	   url: supUrl,
	   async:false,
	   data:{
		   'packageId':packageId,
		   'projectId':projectId,
		   'tenderType':tenderType
	   },
	   success:function(res){
		   if(res.success){
			   publicData=res.data				
			   for(var i=0;i<publicData.length;i++){
					Publicid.push(publicData[i].supplierId);    	
			   };
			   getDate(RenameBisnisId);
		   }
	   }
   });	
}
function getDate(RenameBisnisId){
   Publicid=[];		  	 	      
	 if(publicData.length>7){
	   var heights='304'
	 }else{
	   var heights=''
	 }
	 if(publicData.length>0){
		var RenameData = getBidderRenameData(RenameBisnisId);//投标人更名信息
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
			   width:'150px',
			   formatter:function(value, row, index){					
				   var Tdr='<div class="btn-group">'
								+'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'
							+'</div>'
					return Tdr
			   }
		   }			
	   ]
   });	
   $('#yao_table').bootstrapTable("load", publicData); //重载数据  
}

//查看邀请供应商信息
function viewSupplier(i,dThis){
   parent.layer.open({
	   type: 2 //此处以iframe举例
	   ,title: '查看邀请供应商信息'
	   ,area: ['700px', '500px']
	   ,content:viewSupplierUrl
	   ,success:function(layero,index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
		   iframeWind.du(publicData[i])//弹出框弹出时初始化     	
	   }
	   
	 });
}