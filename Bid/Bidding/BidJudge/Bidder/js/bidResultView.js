/**

*  供应商查看结果通知
*  方法列表及功能描述
*/
var getUrl = top.config.tenderHost + '/ResultNoticeController/getResultNoticeItemByBidId.do';//获取通知书编辑内容
var historyUrl = top.config.tenderHost + '/ResultNoticeController/getHistoryList.do';//历史公告列表
var contentUrl = top.config.tenderHost + '/ResultNoticeController/getResultNoticeItemById';//根据数据id查询通知书内容
var id= '';//标段id
$(function(){
	id = $.getUrlParam('id');//公告列表中带过来的标段Id
	examType = $.getUrlParam('examType')
	getContent(id,examType)
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	$('#historyList').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-history-id');//历史公告ID
		$.ajax({
		    type: "post",
		    url: contentUrl,
		    async: true,
		    data: {
		        'id': historyId
		    },
		    success: function(data){
		        if(data.success){
					previewNotice(data.data.resultNotic, 'full')
		        }else{
					top.layer.alert(data.message)
				}
		    }
		});
	})
	/*打印*/
	/*$("#btnPrint").click(function(){
		preview(1)
	})*/
	
});
function getContent(bid,type){
	$.ajax({
		type: "post",
		url: getUrl,
		async: true,
		data: {
			'bidSectionId':bid,
			'examType': type
		},
		success: function(data){
			if(data.success){
				if(data.data){
					$('#noticeType').html(data.data.isWinBidder==1?'中标通知书':'结果通知书')
                    previewNotice(data.data.resultNotic);
					/*通知历史*/
					$.ajax({
						type:"post",
						url:historyUrl,
						async:true,
						data: {
							'notId':data.data.resultNotice,
							'bidSectionId':bid
						},
						dataType: "json",//预期服务器返回的数据类型
						success: function(data){
							if(data.success){
								historyTable(data.data);
							}
						},
						error: function(){
							parent.layer.alert("数据加载失败！");
						}
					});
				}
			}
		}
	});
}
//公告历史表格
function historyTable(data){
	// console.log(data.length)
	$("#historyList").html('');
	var html='';
	html = '<tr>'
		+'<th style="width: 50px; text-align: center;">序号</th>'
		+'<th>变更次数</th>'
		+'<th style="width: 100px; text-align: center;">操作</th>'
	+'</tr>';
	if(data.length == 0){
		$('#changeNum').html('首次发布');
		html += '<tr><td  colspan="4" style="text-align: center;">无历史记录</td></tr>';
	}else{
		$('#changeNum').html('第'+data.length+'次变更');
		var m = data.length;
		for(var i = 0;i < data.length;i++){
			m = m-1
			html += '<tr>'
				+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
				+'<td>'+(m==0?'首次发布':('第'+m+'次变更'))+'</td>'
				+'<td style="width: 100px;" data-history-id="'+data[i].id+'">'
					+'<button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+'</td>'
			+'</tr>';
		}
		
	}
	$(html).appendTo('#historyList');
}
/*function preview(oper){
	if (oper < 10){
		$("#gz").css("right","100px");
		bdhtml=window.document.body.innerHTML;//获取当前页的html代码
		sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
		eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
		prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+18); //从开始代码向后取html
		prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML=prnhtml;
		window.print();
		window.document.body.innerHTML=bdhtml;
		$("#gz").css("right","10px");
	} else {
		window.print();
	}
}*/
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("noticeContent").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}
function closebox(){
	var index=parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}
function passMessage(data,callback){
	var obj = data;
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode);
	$('#bidSectionName').html(data.bidSectionName);
}
function previewNotice(html, type){
    $.ajax({
        type: "post",
        url: config.Reviewhost+"/ReviewControll/previewPdf.do",
        async: true,
        data: {
            'html': html
        },
        success: function(data){
            if(data.success){
				if(type == 'full'){
					viewPdf(data.data);
				}else{
					$('#publicityContent').attr('src',$.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + data.data))
				}
            }
        }
    });
}