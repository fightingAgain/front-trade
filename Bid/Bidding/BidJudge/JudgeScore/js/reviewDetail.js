
var findBidCheckItemUrl = config.tenderHost + "/BidCheckItemController/findBidCheckItem.do";  //  评委澄清列表

var packageId = "",  //标段id
	examType = "",  // 资格审查方式
	supplierId = "",  //供应商id
	checkId = "",   //评审项id
	checkType = "";  //评审类型
	
var reviewData = [];
$(function(){
	$('#reviewList').on('click','.ltItem',function(){
		 
		if($(this).parent().hasClass("open")){
			$(this).parent().removeClass("open");
			$(this).find("span").removeClass("glyphicon-triangle-bottom");
		} else {
			
			if($(this).next("ul").length > 0){
				$(this).parent().addClass("open");
				$(this).find("span").addClass("glyphicon-triangle-bottom");
			} else { 
				$('#reviewList .ltItem').removeClass('review_active');
				var index = $(this).attr("data-index");
				$(this).addClass('review_active');
				showInfo(index);
			}
		}
		
		
	});
	$('#area_score').on('blur','input[type=number]',function(){
		var score = $(this).val();
//		console.log(score)
		$(this).val(toDecimal(score,2));
	});
	
});

//接收父窗口传过来的参数
function passMessage(data){
	packageId = data.packageId,
	examType = data.examType,
	supplierId = data.supplierId,
	checkId = data.checkId;
	checkType = data.checkType;

	switch(checkType){
		case 0:
			$(".qualifiedModel").show();
			break;
		case 1:
			$(".divergeModel").show();
			break;
		case 2:
			$(".respondModel").show();
			break;
		case 3:
			$(".scoreModel").show();
			break;
	}
	
	findBidCheckItem();
}


//获取评审项
function findBidCheckItem(){
	$.ajax({
		url: findBidCheckItemUrl,
     	type: "post",
     	data:{
     		bidSectionId:packageId,
			examType:examType,
			supplierId:supplierId,
			checkId:checkId
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	
//       	var html =	formatReview(arr, 0)
//			$(html).appendTo("#reviewList");
//			console.log("%%%%%%%%%%%%%%%%%%%%"+JSON.stringify(reviewData));
//			for(var i = 0; i < reviewData.length; i++){
//				if(reviewData[i].bidCheckItemDtosNum == 0){
//					showInfo(i);
//					break;
//				}
//			}
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
 	});
 	
   	arr = [
        {
            "id": "1",
            "pid": "0",
            "checkName": "哈哈哈哈哈",
            "bidCheckItemDtos": [
                {
                    "id": "5",
                    "pid": "1",
                    "checkName": "投标文件能正常打开投标文件能正常打开投标文件能正常打开投标文件能正常打开",
                    "checkStandard":"评价标准11111"
                }]
        },
        {
            "id": "2",
            "pid": "0",
            "checkName": "投标文件签字盖章投标文件签字盖章投标文件签字盖章投标文件签字盖章",
            "checkStandard":"评价标准222222"
        }
    ];
    var html =	formatReview(arr, 0);
	$(html).appendTo("#reviewList");
	console.log("####"+JSON.stringify(reviewData))
	for(var i = 0; i < reviewData.length; i++){
		if(reviewData[i].bidCheckItemDtosNum == 0){
			var curItem = $(".ltItem[data-index="+i+"]"); 
			curItem.addClass("review_active");
			curItem.parent().parents("li").addClass("open").find("span").addClass("glyphicon-triangle-bottom");
			showInfo(i);
			break;
		}
	}
}

/**
 * 显示左边评审项
 * @param {Object} data  数据 
 * @param {Object} padd  边距
 */
function formatReview(data, padd){
	var html = "", spanStr = "";
	
	if(data.length == 0){
		return;
	}
	for(var i = 0; i < data.length; i++){
		var arr = $.extend( {}, data[i], {});
		if(arr.bidCheckItemDtos && arr.bidCheckItemDtos.length > 0){
			arr.bidCheckItemDtosNum = arr.bidCheckItemDtos.length;
			arr.bidCheckItemDtos = [];
		} else {
			arr.bidCheckItemDtosNum = 0;
		}
		reviewData.push(arr);
		
		var node = data[i].bidCheckItemDtos;
		if(node && node.length > 0){
			padd += 15;
			spanStr = '<span class="treegrid-expander glyphicon glyphicon-triangle-right"></span>';
		} else {
			spanStr = "&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		html += '<li style="padding-left:'+padd+'px;"><a data-index="'+(reviewData.length -1)+'" class="ltItem">' + spanStr + data[i].checkName + '</a>';
		
		if(node && node.length > 0){
			html += '<ul>';
			html += formatReview(node, padd);
			html += '</ul>';
		}
		html += '</li>';
		
	}
	return html;
}

//显示右边信息
function showInfo(index){
	$(".reviewStandard").html("");
	$(".pdfView").attr("src","");
	if(reviewData[index].checkStandard){
		$(".reviewStandard").html(reviewData[index].checkStandard);
	}
	if(reviewData[index].bidFileChapter){
//		$(".pdfView").attr("src", $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + reviewData[index].bidFileChapter.fileChapterUrl +"#page=" + reviewData[index].bidFileChapter.fileChapterPage));
	}
}


/*
 * 保留两位小数   
 *功能：将浮点数四舍五入，取小数点后2位  
 * e：元素
 * num：要保留的小数位数
 */
function validationNumber(e, num) {
      var regu = /^[0-9]+\.?[0-9]*$/;
      if (e.value != "") {
        if (!regu.test(e.value)) {
          alert("请输入正确的数字");
          e.value = e.value.substring(0, e.value.length - 1);
          e.focus();
        } else {
          if (num == 0) {
            if (e.value.indexOf('.') > -1) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
          if (e.value.indexOf('.') > -1) {
            if (e.value.split('.')[1].length > num) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
        }
      }
    }


/*制保留几位小数，如：2，会在2后面补上00.即2.00  
 * num:输入的值
 * unit：要补足的小数位数
 */
function toDecimal(num,unit) {  
    var f = parseFloat(num);  
    if (isNaN(f)) {  
        return false;  
    }  
    var f = Math.round(num*100)/100;  
    var s = f.toString();  
    var rs = s.indexOf('.');  
    if (rs < 0) {  
        rs = s.length;  
        s += '.';  
    }  
    while (s.length <= rs + unit) {  
        s += '0';  
    }  
    return s;  
}