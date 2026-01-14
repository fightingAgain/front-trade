 var addsupplier='Auction/common/Agent/invitation/model/add_supplier.html';//邀请供应商的弹出框路径
 var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"
//最少供应商数量的
var isPublic="";//所选公开范围的参数

var projectSuppliers="";
function Public(){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
	if(examTypeShow==1){
		var urls=top.config.bidhost+"/ProjectSupplierController/findProjectSupplierList.do"
		if(createType==0){
			if(NewDate(packageInfo.noticeEndDate) >NewDate(PublicnowDate)){    	
				$(".addSupplier").show();
				$(".sendMsg").show();
			};
		}
	}else{
		var urls=top.config.bidhost+"/PurchaseController/findInvitationSupplierList.do"
		if(createType==0){
			if(NewDate(packageInfo.acceptEndDate) > NewDate(PublicnowDate)){    	
				$(".addSupplier").show();
				$(".sendMsg").show();
			};
		}
	}	
	var Publicid=[]
	$.ajax({
		type:"get",
		url: urls,
		async:false,
		data:{
			'packageId':packageInfo.id,
			'projectId':packageInfo.projectId,
			'tenderType':0
		},
		success:function(res){
			if(res.success){
				publicData=res.data;
				sessionStorage.setItem('sadasd', JSON.stringify(publicData));//邀请供应商的数据缓存  	 			
				for(var i=0;i<publicData.length;i++){
					Publicid.push(publicData[i].supplierId);    	
				};
				sessionStorage.setItem('keysjd', JSON.stringify(Publicid));//邀请供应商的id缓存    
			}
		}
	});	  
      if(publicData.length>7){
			var height='304'
	  }else{
			var height=''
	  }
	  if(publicData.length>0){
		var RenameData = getBidderRenameData(packageInfo.id);//投标人更名信息
	  }
      $('#yao_table').bootstrapTable({
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
				field: "enterprise.enterpriseName",
				title: "企业名称",
				align: "left",
				halign: "left",
				width: "200px",
				formatter:function(value, row, index){					
					if(yaoqing=="1"){
						if(row.isAppend==1){
							var isAccept="<div>"+ showBidderRenameList(row.supplierId, value, RenameData, 'body',1)+"<span class='text-danger'>(追加)</span></div>"
						}else{
							var isAccept="<div>"+ showBidderRenameList(row.supplierId, value, RenameData, 'body')+"</div>"
						}						
						
					}else{
						var isAccept="<div>"+ showBidderRenameList(row.supplierId, value, RenameData, 'body')+"</div>"
					}				
					return isAccept
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
					if(value==0){
						var isAccept="<div class='text-success' style='font-weight:bold'>接受</div>"
					}else if(value==1){
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
						Tdr+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>'
						if(yaoqing!='2' && createType==0){
							if(yaoqing=="1"){
								if(row.isAccept!=0&&row.isAccept!=1){
									if(examTypeShow==1){	
										if(NewDate(packageInfo.noticeEndDate) > NewDate(PublicnowDate)){    	
											Tdr+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\","'+ index +'")>删除</a>'
										};	
									}else{
										if(NewDate(packageInfo.acceptEndDate) > NewDate(PublicnowDate)){    	
											Tdr+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\","'+ index +'")>删除</a>'
										};
									}
								}
							}else{
								Tdr+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"'+ row.id+'\","'+ index +'")>删除</a>'
							}
						}
											
					Tdr+='</div>'
		     		return Tdr
				}
			}			
		]
	});
	
	$('#yao_table').bootstrapTable("load", publicData); //重载数据	
}
function add_supplier(){
	if(yaoqing=="1"){
		var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
		if(examTypeShow==1){
			if(NewDate(packageInfo.noticeEndDate) <NewDate(PublicnowDate)){    	
				parent.layer.alert('邀请函截止时间已过，无法追加');
				return;
			};	
		}else{
			if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
				parent.layer.alert('邀请函截止时间已过，无法追加');
				return;
			};
		}
	}
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,btn: ['保存','取消'] 
        ,success:function(layero,index){
			var iframeWind=layero.find('iframe')[0].contentWindow;
			iframeWind.du(packageInfo.isPublic,packageInfo.purchaserId,packageInfo.supplierClassifyCode);
        }
        //确定按钮
        ,yes: function(index,layero){           
			var iframeWin=layero.find('iframe')[0].contentWindow;                               
			var SupplieridList=iframeWin.newData;
			projectSuppliers="";
			projectSuppliers+='<input name="packageId" value="'+ packageInfo.id+'"/>'
			projectSuppliers+='<input name="projectId" value="'+ packageInfo.projectId+'"/>'
			for(var i=0;i<SupplieridList.length;i++){							
				projectSuppliers+='<input name="projectSuppliers[' + i + '].supplierId" value="'+ SupplieridList[i].supplierId+'"/>'
				projectSuppliers+='<input name="projectSuppliers[' + i + '].enterpriseName" value="'+ SupplieridList[i].enterprise.enterpriseName+'"/>'
				projectSuppliers+='<input name="projectSuppliers[' + i + '].isAccept" value="'+ (SupplieridList[i].isAccept!=undefined?SupplieridList[i].isAccept:'') +'"/>'			     	
			}
			iframeWin.$("#supplier").html(projectSuppliers)
			$.ajax({
			url:config.bidhost+'/ProjectPackageController/saveProjectSupplierList.do',
			type:'post',
			//dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:iframeWin.$("#supplier").serialize(),
			success:function(data){	 
				if(data.success){
					publicData=iframeWin.newData;
					Public();
					parent.layer.close(index)
					parent.layer.alert('邀请成功')  
				}else{
					parent.layer.alert(data.message)  
				}
			}
			});	
         

        },       
      });
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
//删除邀请供应商
function supplierDelet(uid,$index){
	if(yaoqing=="1"){
		var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
		if(examTypeShow==1){
			if(NewDate(packageInfo.noticeEndDate) <NewDate(PublicnowDate)){    	
				parent.layer.alert('邀请函截止时间已过，无法删除');
				return;
			};	
		}else{
			if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
				parent.layer.alert('邀请函截止时间已过，无法删除');
				return;
			};
		}
	}
	parent.layer.confirm('确定要删除该供应商', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){		
		$.ajax({
		type:"get",
		url: top.config.bidhost+"/ProjectSupplierController/deleteProjectSupplier.do",
		async:false,
		data:{
			'id':uid
		},
		success:function(res){
			if(res.success){
				publicData.splice($index,1)
				Public();
				parent.layer.close(index);			
			}else{
				parent.layer.alert(res.message);
				parent.layer.close(index);
			}
		}
	});   
	}, function(index){
	   parent.layer.close(index)
	});
}
// 发送短信
$(".sendMsg").on('click',function(){
	var PublicnowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();	
	if(examTypeShow==1){
		if(NewDate(packageInfo.noticeEndDate) <NewDate(PublicnowDate)){    	
			parent.layer.alert('邀请函截止时间已过，无法发送短信');
			return
		};	
	}else{
		if(NewDate(packageInfo.acceptEndDate) < NewDate(PublicnowDate)){    	
			parent.layer.alert('邀请函截止时间已过，无法发送短信');
			return
		};
	}
	parent.layer.confirm('是否确认发送短信', {
		btn: ['是', '否'] //可以无限个按钮
	  }, function(index, layero){		
		  $.ajax({
		  type:"get",
		  url: top.config.bidhost+"/ProjectSupplierController/sendMsgProjectSupplier.do",
		  async:false,
		  data:{
			'projectId': packageInfo.projectId,
			'packageId': packageInfo.id,
			'tenderType':0,
			'examType':1
		  },
		  success:function(res){
			  if(res.success){
				 parent.layer.alert('短信发送成功')	
				 Public();		
			  }else{
				parent.layer.alert(res.message)
			  }
			  parent.layer.close(index)
		  }
	  });   
	  }, function(index){
		 parent.layer.close(index)
	  });
})
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