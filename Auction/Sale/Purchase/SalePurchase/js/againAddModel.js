var uid="";//公告ID
var gid="";//项目ID
var packageId="";//包件id
var detailedId="";//明细ID
var projecturl='Auction/Sale/Purchase/SalePurchase/model/againAddProject.html'//添加项目的弹出框路径
var findPurchaseURL=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//获取项目下的所有数据的接口
var againSaveUrl=config.AuctionHost+'/AuctionPurchaseController/againSaveAuctionPurchase.do'//重新竞卖提交的接口
function selet(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加项目'
        ,area: ['1100px', '600px']
        ,content:projecturl
        // ,btn: ['确定','取消'] 
        //确定按钮
		,success: function(layero, index) {
			var iframeWin=layero.find('iframe')[0].contentWindow;         
			iframeWin.passMessage(function(data){
				uid=iframeWin.checkboxed.id;
				gid=iframeWin.checkboxed.projectId;     
				$.ajax({
				  	url:findPurchaseURL,
				  	type:'get',
				  	dataType:'json',
				  	//contentType:'application/json;charset=UTF-8',
				  	data:{
				  		"projectId":gid
				  	},
				  	success:function(data){ 
				  		//公告的数据渲染到页面上
				  		$('div[id]').each(function(){
									$(this).html(data.data[this.id]);
								});
								//项目的数据渲染到页面上
								$('div[id]').each(function(){
									$(this).html(data.data.project[0][this.id]);
								});	
								//包件的数据渲染到页面上
								$('div[id]').each(function(){
									$(this).html(data.data.autionProjectPackage[0][this.id]);
								});
								//明细的数据渲染到页面上
								$('div[id]').each(function(){
									$(this).html(data.data.auctionPackageDetailed[0][this.id]);
								});
								if(data.data.auctionPackageDetailed.length>0&&data.data.project[0].groupCode=="00270012"){
									$(".fjwzjmzz").hide();
									$(".fjwz").show();
									viewdataidList(data.data.materialDetails);
								}else{
									$(".fjwz").hide();
									$(".fjwzjmzz").show();
								}
								packageId=data.data.autionProjectPackage[0].id;
								detailedId=data.data.auctionPackageDetailed[0].id			
				  	}	
				 }); 
				parent.layer.close(index);
			});
		}
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;         
         uid=iframeWin.checkboxed.id
         gid=iframeWin.checkboxed.projectId        
         $.ajax({
		   	url:findPurchaseURL,
		   	type:'get',
		   	dataType:'json',
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"projectId":gid
		   	},
		   	success:function(data){ 
		   		//公告的数据渲染到页面上
		   		$('div[id]').each(function(){
					$(this).html(data.data[this.id]);
				});
				//项目的数据渲染到页面上
				$('div[id]').each(function(){
					$(this).html(data.data.project[0][this.id]);
				});	
				//包件的数据渲染到页面上
				$('div[id]').each(function(){
					$(this).html(data.data.autionProjectPackage[0][this.id]);
				});
				//明细的数据渲染到页面上
				$('div[id]').each(function(){
					$(this).html(data.data.auctionPackageDetailed[0][this.id]);
				});
				if(data.data.auctionPackageDetailed.length>0&&data.data.project[0].groupCode=="00270012"){
					$(".fjwzjmzz").hide();
					$(".fjwz").show();
					viewdataidList(data.data.materialDetails);
				}else{
					$(".fjwz").hide();
					$(".fjwzjmzz").show();
				}
				packageId=data.data.autionProjectPackage[0].id;
				detailedId=data.data.auctionPackageDetailed[0].id			
		   	}	
		  }); 
         parent.layer.close(index);
        },
      });
};
//确定重新竞卖并临时保存；
function du(callback){	
	$('#btn_close').click(function(){
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
	$('#btn_save').click(function(){
		$.ajax({
			   	url:againSaveUrl,
			   	type:'post',
			   	dataType:'json',
			   	//contentType:'application/json;charset=UTF-8',
			   	data:{
			   		"projectId":gid,
			   		"purchaseId":uid,
			   		"packageId":packageId,
			   		'enterpriseType':'04'
			   	},
			   	success:function(data){   
			   		console.log(data)
			   		if(data.success==true){
			   			parent.layer.alert("添加成功");
			   			if(callback){
			   				callback();
			   			}
			   		}else{
			   			parent.layer.alert(data.message)
			   		}
			}	
		});
		
	});
     
}

function viewdataidList(date){
	$("#materialList").bootstrapTable({
			pagination: false,
			showLoading: false, //隐藏数据加载中提示状态
			columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function(value, row, index) {
					var pageSize = $('#materialList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#materialList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'productCode',
				title: '物料编码',
				align: 'left',
			}, {
				field: 'detailedName',
				title: '物料名称',
				align: 'left',
			}, {
				field: 'detailedVersion',
				title: '规格型号',
				align: 'center',
				width: '120',
			}, {
				field: 'priceType',
				title: '底价顶价标识',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					if(row.priceType==0){
						return '<div>底价</div>'
					}else if(row.priceType==1){
						return '<div>顶价</div>'
					}
				}
			}, {
				field: 'salesPrice',
				title: '竞卖起始价',
				align: 'center',
				width: '120',
			}, {
				field: 'storageLocation',
				title: '存放地点',
				align: 'center',
				width: '120',
			}
			]
		});
		$("#materialList").bootstrapTable("load", date);
}