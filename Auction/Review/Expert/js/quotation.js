/*
 */ 
var viewURL = top.config.AuctionHost+'/PackagePriceListController/findPackageQuateList.do';//回显接口
var getPriceURL = top.config.AuctionHost+'/PackagePriceListController/getSuppliersPrice.do';//获取供应商报价
var downloadUrl = top.config.FileHost + '/FileController/download.do';//下载文件
var offerExcelUrl = top.config.AuctionHost+'/PackagePriceListController/exportPriceView.do';//导出一览表
var offerDownUrl = top.config.AuctionHost+'/PackagePriceListController/downloadPriceList.do';//导出一览表
var fileUp;//报价表
var quotationData; //供应商报价金额
var quotateData;
var isOfferDetailedItem;//是否需要报价分项表
$(function(){
	$("#offerAttention").html(offerAttention);
	if(typeof(isOfferDetailedItem) != "undefined" && isOfferDetailedItem == 1){
		$("#offerDown").hide();
	}
	getBidSection();
	if(!quotationData){
		return;
	}
	getQuotationList();
	$("#offerExcel").off("click").click(function(){
		var url = offerExcelUrl + "?packageId="+packageId;
		window.location.href =$.parserUrlForToken(url);	
	});
	$("#offerDown").off("click").click(function(){
		var url = offerDownUrl + "?packageId="+packageId+"&examType="+examType+"&projectId=" + projectId;
		window.location.href =$.parserUrlForToken(url);	
	});
});

$(window).resize(function () {
    $('#quotationTable').bootstrapTable('resetView');
});

//打开弹出框时加载的数据和内容。
function getBidSection(){
	$.ajax({
	   	url:top.config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageId
	   	},
	   	success:function(data){
	   	  	if(data.success){	   	  	
                var packageInfo=data.data;//包件信息
				var offerAttention = packageInfo.offerAttention;
				isOfferDetailedItem = packageInfo.isOfferDetailedItem;
				$("#offerAttention").html(offerAttention);
				if(isOfferDetailedItem == 1){
					$("#offerDown").hide();
				}
				getPriceList();
	   	  }
	   		   			   		   			   	
	   	},
	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
};

function getQuotationList(){
	$.ajax({
        type: "post",
        url: viewURL,
        async:false,
        data:{
        	packageId:packageId,
			projectId:projectId, 
			examType:examType
        },
        dataType: "json",
        success: function (response) {
            if(response.success){
				THISID=_thisId;
                if(response.data){
                	quotateData = response.data;
                    initOfferTable(response.data);
                }                       
            } else {
            	top.layer.alert(response.message);
            }
        }
    });
}
function getPriceList(){
	$.ajax({
        type: "post",
        url: getPriceURL,
        async:false,
        data:{
        	packageId:packageId,
        	examType:examType
        },
        dataType: "json",
        success: function (response) {
            if(response.success){
                if(response.data){
                    quotationData = response.data;
                }                   
            } else {
            	top.layer.alert(response.message);
            } 
        }
    });
}
function initOfferTable(data){
	var qcolumns= [
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			valign:"middle",
			width: '50px',
			class:"colstyle",
			cellStyle:{
				css:{"min-width":"50px"}
			},
			formatter: function(value, row, index) {				 
				return index + 1;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'productServices',
			title: '产品或服务',
			align: 'left',
			valign:"middle",
            width:'200px',	
            class:"colstyle",
            cellStyle:{
				css:{"min-width":"200px"}
			},
            formatter:function(value, row, index){
            	var str = value.replace(/"/g,"&quot;");
              	return '<div>'+ (row.purchaseCode||"") +'</div><div style="width:180px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ str +'">'+ str +'</div>';
            	
//              var html='<div>'+ (row.purchaseCode||"") +'</div>'
//                      +'<div style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ value +'">'+ value +'</div>'
//              return html 
            }
		}, {
			field: 'quotePriceType',
			title: '报价类型',
			align: 'left',
			valign:"middle",
			width: '90',
			class:"colstyle",
			cellStyle:{
				css:{"min-width":"90px"}
			},
			formatter: function(value, row, index) {
				if(value==1){
					var list="报价-价格"
				}else if(value==2){
					var list='报价-费率'
				}else if(value==3){
					var list='数字'
				}else if(value==4){
					var list='文本'
				}
				return list
			}
		},{
			field: 'quotePriceName',
            title: '报价要求',
			align: 'left',
			valign:"middle",
			width:"200px",
			class:"colstyle",
			cellStyle:{
				css:{"min-width":"200px"}
			},
			formatter: function(value, row, index) {
                var html=[];
                if(row.quotePriceType!=4){                       
                    if(row.quotePriceName){
                        html.push(row.quotePriceName+'；');
                    }
                    if(row.quotePriceUnit){
                        html.push(row.quotePriceUnit+'；');
                    }
                    if(row.pointNum){
                        html.push(row.pointNum+'位小数'+(row.pointLast?'；':'。'));
                    }
                    if(row.pointNum!=0){
						html.push('小数点后最后一位'+(row.pointLast==1?'可为0':'不可为0')+'。');
					}
                }else{
                    html.push(row.priceDemands+'。');
                }
				
				var str = html.join("").replace(/"/g,"&quot;");
                return '<div style="width:180px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ str +'">'+ str +'</div>';
//				return html.join("");   
			}
		}, {
			field: 'remark',
			title: '备注',
			align: 'left',
			valign:"middle",
            width: '200',
            class:"colstyle",
            cellStyle:{
				css:{"min-width":"200px"}
			},
            formatter:function(value, row, index){
                if(value){
                	var str = value.replace(/"/g,"&quot;");
                    return '<div style="width:180px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ str +'">'+ str +'</div>';
                }else{
                    return ""
                }
                
            }
		},		
	];
	
	var w = $("#reportContent").width() - 30 - 730 - (quotationData ? quotationData.length * 200:0);
	var colW="";
	if(w < 0){
		colW = "200px";
	}
	for(var i = 0; i < quotationData.length; i++){
		if(quotationData[i].person){
			var titStr = quotationData[i].enterpriseName +"<br/><div style='width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;' title='"+(quotationData[i].person + " / " + quotationData[i].tel)+"'>" + quotationData[i].person + " / " + quotationData[i].tel + "</div>";
		}else{
			var titStr = quotationData[i].enterpriseName;
		}
		if(isOfferDetailedItem == 0){
			var fileName = quotationData[i].fileName;
            var filePath= quotationData[i].filePath;
            var downLink = $.parserUrlForToken(downloadUrl+'?ftpPath='+filePath+'&fname='+fileName.replace(/\s+/g,""));
			titStr += (quotationData[i].isOut==1 ? "" : '<a class="btn btn-primary btn-xs" href="'+downLink+'">下载分项报价表</a>');
		}
		
		qcolumns.push({
            field: i,
            title: titStr,
            align: 'center',
            valign:"middle",
            class:"colstyle",
            width: colW,
            cellStyle:{
				css:{"min-width":colW}
			},
            formatter: function(value, row, index, field) {
            	if(quotationData[field].offerDetaileds && quotationData[field].offerDetaileds.length>0 && quotationData[field].offerDetaileds[index] && isHasStr(quotationData[field].offerDetaileds[index].productServices,data,'productServices')){
            		return '<div style="text-align:right;width:180px;float:right;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+quotationData[field].offerDetaileds[index].saleTaxTotal+'">'+quotationData[field].offerDetaileds[index].saleTaxTotal+"</div>";
            	} else {
            		return "";
            	}
            }
        });
	}
	
	$("#quotationTable").bootstrapTable("destroy").bootstrapTable({
      columns: qcolumns,
      data: data,
      fixedColumns: true,
      fixedNumber: 5
   });
}

window.onresize = function () {
	if(quotateData){
		initOfferTable(quotateData);
	}
}
/* 
	判断数组对象中是否包含某一个内容
	str:判断是否包含的内功
	data:array 比较的数组
	fieId：要比较的字段
 */
	function isHasStr(str, data,fieId) {
		for (var i = 0; i < data.length; i++){
			if (data[i][fieId] == str) {
				return true;
			}
		}
		return false;
	}
