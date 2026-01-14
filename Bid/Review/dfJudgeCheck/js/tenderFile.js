
var token=sessionStorage.token;
var fileUrl = '';
var fileName = '';
var zbwjAndTbwjListUrl=config.Reviewhost+"/ReviewControll/findZbwjAndTbwjList.do";//相关文件数据接口
$(function(){
    var bidSectionId=$.getUrlParam("bidSectionId");//标段Id
    var examType=$.getUrlParam("examType");//评标会方式  1.资格预审  2.评标会
	$.ajax({
		type:"post",
		url:zbwjAndTbwjListUrl,
		beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },
		async:true,
		data: {
			'examType':examType,				
			'bidSectionId': bidSectionId
		},
		success: function(data){
			if(data.success){
				fileUrl = data.data.docClarifyItem.fileUrl;
				$('.file_box').css('height',($(window).height()-65)+'px')
				$("#zbwjPdf").attr('src',config.FileHost + "/fileView" + fileUrl)
			}
		}
		
	});
})