var searchUrl = parent.config.AuctionHost+ "/NegotiationController/NegotiationShowOneForPurchaser"; //查找明细
var updateNegotiatorUrl = parent.config.AuctionHost+"/NegotiationController/updateNegotiation.do"; //修改谈判记录

var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
var createType = getUrlParam("createType") || 0;
var tenderTypeCode=2;


var itemState ="";
var isShowAddBtn=false;//是否显示添加谈判按钮

function tableShow(obj){
	$('label').each(function(){
		
		//判断谈判方式
		$(this).text(obj[this.id]);
	});
	$('.quotationUnit').html(obj.quotationUnit?obj.quotationUnit:'元');
	if(obj.negotiationType=='0'){
		$("#negotiationType").text("线上谈判");
	}
	else if (obj.negotiationType=='2'){
		$("#negotiationType").text("不谈判");
	}
	
	if(obj.projectSource == '1') {
		$("#ppName").html("(重新竞卖)");
	} else {
		$("#ppName").html("");
	}
	
	
	if(obj.itemState != undefined && obj.itemState == 2){
		itemState = 2;
	}
	
	
	var type = $("#negotiationType").text();
	//判断是否为线上谈
	if(type == '线上谈判'){ //如果是线上谈判
		$("#NegotiatorTable").show();
	}
	
	negotiatorTableShow();
	
	if(createType == 1){
		//非本人发布项目  隐藏添加谈判按钮
		$("#trAddBtn").hide();
		
	}
}

var negotiator;
//初始化表格
function negotiatorTableShow(){
	
	//查询谈判明细
	$.ajax({ 
	   	url:searchUrl,
	   	type:'post',
	   	dataType:'json',
	    data:{'projectId': projectId,'packageId':packageId,'tenderType':tenderTypeCode},
	   	success:function(data){
	   	    if(data.success){
				negotiator = data.data; //一条谈判记录
				if(negotiator==undefined) return;
	   	    	var rows = data.data.negotiationItems; //谈判记录的所有明细
	   	    	var igs = [] //获取所有谈判记录的是否同意谈判
				if(rows.length>0){
					var RenameData = getBidderRenameData(projectId);//供应商更名信息
				}
	   	    	for(var i=0;i<rows.length;i++){
	   	    		//创建谈判明细table
		   	    	var html ;
		   	    	
	   	    		if(rows[i].supplierName != null){
	   	    			html = "<tr><td>"+showBidderRenameList(rows[i].supplierId, rows[i].supplierName, RenameData, 'body')+"</td>";
	   	    		}else{
	   	    			html = "<tr><td></td>";
	   	    		}
	   	    		
	   	    		if(rows[i].negotiationPrice != null){
	   	    			html += "<td style='text-align:right;'>"+rows[i].negotiationPrice+"</td>";
	   	    		}else{
	   	    			html += "<td></td>";
	   	    		}
	   	    		
	   	    		if(rows[i].replyPrice != null){
	   	    			html += "<td style='text-align:right;'>"+rows[i].replyPrice+"</td>";
	   	    		}else{
	   	    			html += "<td></td>";
	   	    		}
	   	    		
	   	    		if(rows[i].isAgree == "0"){ //同意
	        			html += "<td><label style='color: red;'>同意</label></td>";
	        		}
	        		else if(rows[i].isAgree == "1" ){//不同意
	        			isShowAddBtn = true;
	        			html += "<td><label style='color: black;'>不同意</label></td>";
	        		}else if( (rows[i].isAgree == "" || rows[i].isAgree == null )&& rows[i].isAccept == null){
	        			html += "<td><label style='color: black;'>未答复</label></td>";
	        		}else if(rows[i].isAccept == "1" &&　rows[i].replyDate == null){
	   	    			html += "<td>已超时</td>";
	   	    		}else if(rows[i].isAccept == "1"){
	        			isShowAddBtn = true;
	        			html += "<td><label style='color: black;'>不接受谈判</label></td>";
	        		}
	   	   			
	   	   			if(rows[i].replyDate != null){
	   	    			html += "<td>"+rows[i].replyDate+"</td>";
	   	    		}else{
	   	    			html += "<td></td>";
	   	    		}
	   	    		
	   	    		html += "<td style='text-align:center;'><a id='btnCheck'  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showData('"+i+"')> <span class='glyphicon glyphicon-search' aria-hidden='true'></span>查看</a></td></tr>";
	   	    	
		   	    	$("#negotiationItems").append(html);
		   	   	}
	   	    	
	   	    	var items = negotiator.negotiationItems;
				for(var i=0;i<items.length;i++){
					if(items[i].isAccept == null){
						//没有谈判
						$("#trAddBtn").hide();
					}
				}
				//判断用户是否处于谈判状态 isAccept 是否接受谈判  isAgree是否同意谈判价格
				//便利集合 判断供应商是否同意价格,如果同意直接不能谈判
				for(var i= 0;i< items.length;i++){
					if(items[i].isAgree == '0'){
						//如果同意
						$("#trAddBtn").hide();
						$("#lastPrice").text(items[i].negotiationPrice);
					}
				}
	   	    }else{
				top.layer.alert(data.message);
			}
	   	}	
	});

}


function showData(i){
	var height=top.$(parent).height()*0.6;
    var width=top.$(parent).width()*0.4;
	parent.layer.open({
		type: 2 //此处以iframe举例
        ,title: '查看谈判记录详情'
        ,area: [width+'px', height+'px']
        ,content:'Auction/Sale/Agent/SaleSupplierNegotiator/showNegotiator.html'
        ,success:function(layero, index){
        	var body = parent.layer.getChildFrame('body', index);    
            var iframeWin=layero.find('iframe')[0].contentWindow;
            iframeWin.tableShow(negotiator,negotiator.negotiationItems[i]); //谈判记录 谈判明细
		} 
	});
}


var isAgrees = [];
var isAccept = [];
//添加谈判按钮
$("#btnAdd").click(function(){
	if(itemState == 2){
		parent.layer.alert("该阶段无法谈判");	
		return;
	}
	var height=top.$(parent).height()*0.75;
	var width=top.$(parent).width()*0.5;
	if(negotiator.negotiationType == 0){
		parent.layer.open({
			type: 2 //此处以iframe举例
	        ,title: '添加谈判'
	        ,area: ['1100px','600px']
	        ,content:'Auction/Sale/Agent/SaleSupplierNegotiator/addNegotiator.html?projectId='+projectId+'&id='+packageId
	        //,btn: ['提交','取消'] 
	        ,id:"addNegotiator"
	        //确定按钮
	       ,success:function(layero, index){
	        	var body = parent.layer.getChildFrame('body', index);    
	            var iframeWin=layero.find('iframe')[0].contentWindow;
	            iframeWin.reloadConsole(function(){
	            	location.reload();
	            })
			} 
		});
	}else{
		parent.layer.alert("抱歉您不是线上谈判哦!");
	}
	
});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}