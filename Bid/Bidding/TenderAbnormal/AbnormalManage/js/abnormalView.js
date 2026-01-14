 var detailUrl = config.tenderHost + '/BidExcepitonController/getAndFile.do'; // 详情
 var detailBidUrl = config.tenderHost + '/BidExcepitonController/getDetailByBidId.do'; // 根据标段id查询详情
 
var bidSectionId = ""; //标段id
var fileUploads = null;  // 上传文件
var abnormalId = "";  //异常id 
var employeeInfo = entryInfo(); //企业信息
var source = "";  //0是查看，1是审核
var abnormalReason = {
	"1":"购标人数不足",
	"2":"开标解密成功不足三家",
	"3":"评标结束后合格不足三家",
	"4":"资格预审合格不足规定家数",
	"5":"招标人监督部门不认可",
	"6":"招标人提出撤项要求",
	"7":"其他原因",
	"8":"成功递交投标文件家数不足"
}
var isThrough;
 $(function(){
 	isThrough = $.getUrlParam("isThrough");
 	new UEditorEdit({
		pageType: 'view',
		uploadServer: top.config.tenderHost,
		contentKey: 'excepitonContent'
	});
 	//媒体
	initMedia({
		isDisabled: true
	});
 	
 	/* if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		abnormalId = $.getUrlParam("id");
		detail();
	} */
	
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	//全屏查看公告
	$('.fullScreen').click(function(){
		var content = $('#noticeContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看公告信息'
	        ,area: ['100%', '100%']
	        ,content: "fullScreen.html"
	        ,resize: false
	        ,btn: ['关闭']
	        ,success:function(layero,index){
	        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.find('#noticeContent').html(content);
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	            parent.layer.close(index);
	            
	        }
	    });
	})
	
 });
 
 
 function passMessage(data){ 
 	$("#bidSectionName").html(data.bidSectionName);
 	$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
 	bidSectionId = data.bidSectionId;
	if(data.busId){//审核页面
		abnormalId = data.busId;
	}else{
		abnormalId = data.id;
	}
	detail();
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
		source = $.getUrlParam("source");
		if(source == 1){
			$("#btnClose").hide();
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId:abnormalId, 
				status:2,
				type:"zbycgs",
				submitSuccess:function(){
		         	var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.closeAll(); 
					parent.layer.alert("审核成功",{icon:7,title:'提示'});
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
			});
		} else {
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId:abnormalId, 
				status:3,
				type:"zbycgs",
				checkState:isThrough
			});
		}
	}
 }
 

/*
 * 同级页面返回参数
 */
function bidCallback(data) {
	$("#interiorBidSectionCode").html(data[0].interiorBidSectionCode);
	$("#bidSectionName").html(data[0].bidSectionName);
	bidSectionId = data[0].id;
}
 
 /**
  * 详情
 */
 function detail() {
	 var postUrl = detailBidUrl;
	 var postData = {
		 bidSectionId:bidSectionId
	 }
	 if(abnormalId){
		 postUrl = detailUrl;
		 postData = {
		 	id:abnormalId
		 }
	 }
     $.ajax({
         url: postUrl,
         type: "post",
         asnyc:false,
         data: postData,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	
         	var arr = data.data
			if(arr){
				if(arr.id){
					abnormalId = arr.id;
				}
				bidSectionId = arr.bidSectionId;
				for(var key in arr){
					if(key == "projectAttachmentFiles"){
						if(!fileUploads){
							fileUploads = new StreamUpload("#fileContent",{
								businessId: abnormalId,
								status:2
							});
						}
						if(arr.projectAttachmentFiles.length > 0){
							fileUploads.fileHtml(arr.projectAttachmentFiles);
						}
					} else if(key == "exceptionTypes"){
						$("#exceptionTypes").html(arr[key] == 1 ? "招标终止" : "招标失败")
					} else if(key == "abnormalReason"){
						$("#abnormalReason").html(abnormalReason[arr[key]]);
					} else if(key == "foreign"){
						$("#foreign").html(arr[key] == 1 ? "是" : "否");
						if(arr[key] == 1){
							$(".isShow").show();
							
							if(arr.noticeMedia){
				 				var noticeMedia = arr.noticeMedia.split(",");
				     			$("[name='noticeMedia']").prop("checked", false);
				     			for(var i = 0; i < noticeMedia.length; i++){
				     				$("[name='noticeMedia'][value='"+noticeMedia[i]+"']").prop("checked", "checked");
				     			}
				 			}
						} else {
							$(".isShow").hide();
						}
						
					} else {
						$("#"+key).html(arr[key]);
					}
				}
				mediaEditor.setValue(arr);
			}
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 };
 