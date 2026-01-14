

var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件

var guiUrl1 = config.tenderHost + "/GDDataController/findGDDataInfo.do";//根据归档id获取归档详情
var guiUrl2 = config.offlineHost + "/OfflineGDDataController/findGDDataInfo";//根据归档id获取归档详情
var saveUrl = config.tenderHost + "/GDDataController/saveArchiveChang.do";//保存
var fileDownloadUrl = config.tenderHost + "/GDDataController/downloadFile.do";//一键打包下载

var examType = '';//资格审查方式  1预审  2 后审
var tenderMode = '';//招标方式 1公开 2 邀请
var bidSectionId = '';//标段id
var projectId = '';//项目id
var dataId = '';//归档id
var registerInfo = entryInfo();
var isThrough;
var source = 0; //链接来源  0:查看  1审核
var fileArr = [];//文件信息
var systemType = 1;//数据来源于那个系统，1.BiddingService，2.OfflineBiddingService

$(function(){

	var processPub = [
		{'name': '基本信息','stage': 'total'},
		{'name': '招标委托合同','stage': 'total','isEnd': '1'}
	];
	var processPre = [
		{'name': '资格预审公告信息','stage': 'pretrial'},
		{'name': '资格预审文件信息','stage': 'pretrial'},
//		{'name': '报名信息','stage': 'pretrial'},
		{'name': '资格预审文件购买信息','stage': 'pretrial'},
		{'name': '递交资格申请信息','stage': 'pretrial'},
		{'name': '资格申请文件信息','stage': 'pretrial'},
//		{'name': '落选的投标人递交的资格申请文件','stage': 'pretrial'},
		{'name': '递交资格申请文件回执信息','stage': 'pretrial'},
		{'name': '资格预审文件开启','stage': 'pretrial'},
		{'name': '资格审查评审设置信息','stage': 'pretrial'},
		{'name': '资格审查评审委员信息（含抽取历史）','stage': 'pretrial'},
		{'name': '资格审查评标专家承诺书','stage': 'pretrial'},
		{'name': '资格审查评审报告信息','stage': 'pretrial'},
		{ 'name': '资格审查查重报告信息', 'stage': 'pretrial' },
		{'name': '资格审查评审澄清信息','stage': 'pretrial'},
		{'name': '资格审查结果（正文及公示）','stage': 'pretrial'},
		{'name': '资格审查结果通知','stage': 'pretrial'}
	];
	var processTrial = [
		{'name': '保证金递交情况信息','stage': 'trial'},
		{'name': '邀请函信息','stage': 'trial'},
		{'name': '招标文件信息','stage': 'trial'},
		{'name': '招标控制价信息','stage': 'trial'},
		{'name': '答疑会信息','stage': 'trial'},
		{'name': '答疑澄清信息','stage': 'trial'},
		{'name': '招标文件购买信息','stage': 'trial'},
		{'name': '投标文件递交情况信息','stage': 'trial'},
		{'name': '投标文件递交回执信息','stage': 'trial'},
		{'name': '投标文件信息','stage': 'trial'},
//		{'name': '投标文件信息（落标人的投标文件）','stage': 'trial'},
		{'name': '开标信息','stage': 'trial'},
		{'name': '评审设置信息','stage': 'trial'},
		{'name': '评审委员信息（含抽取历史）','stage': 'trial'},
		{'name': '评标专家承诺书信息','stage': 'trial'},
		{'name': '清标资料信息','stage': 'trial'},
		{'name': '评审报告信息','stage': 'trial'},
		{'name': '评审查重报告信息', 'stage': 'trial' },
		{'name': '评审澄清信息','stage': 'trial'},
		{'name': '异议管理信息','stage': 'trial'},
		{'name': '中标候选人公示信息','stage': 'trial'},
		{'name': '中标结果公告信息','stage': 'trial'},
		{'name': '中标结果通知书信息','stage': 'trial'},
		{'name': '落标结果通知书信息','stage': 'trial'},
//		{'name': '中标合同备案信息','stage': 'trial'},
		{'name': '招标异常信息','stage': 'trial'},
		{'name': '企业名称变更信息', 'stage': 'trial' },
		{'name': '其他资料','stage': 'trial'},
		
	];

	//数据来源于那个系统，1.BiddingService，2.OfflineBiddingService
	systemType = $.getUrlParam('systemType');

	//资格审查方式  1预审  2 后审
	examType = $.getUrlParam('examType');
	//招标方式 1公开 2 邀请
	tenderMode = $.getUrlParam('tenderMode');
	bidSectionId = $.getUrlParam('bidSectionId');
	projectId = $.getUrlParam('projectId');
	if(examType == 2){
		$('.pretrial').hide();
		if(tenderMode == 1){
			processTrial.splice(1,1,{'name': '招标公告信息','stage': 'trial'})
		}
	}else if(examType == 1){
		$('.pretrial').show();
	}
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		dataId = $.getUrlParam('id');
		getDetail(dataId)
	}
	/* 退回申请 */
	if(dataId){
		$('.show_fallback').show();
		// var backType = type == 'edit'?'2':'1';
		rollBack('1', 'view_fallback', dataId, 'zlgdth')
	}else{
		$('.show_fallback').hide();
	}
	//查看退回历史
	$('#backHistoryList').click(function(event){
		event.stopPropagation();
		openHistory(dataId, 'zlgdth')
	});
	
	/* 退回申请   -- end */
	isThrough = $.getUrlParam("isThrough");
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
	 	source = $.getUrlParam("source");
	 	if(source == 1) {
	 		$("#btnClose").hide();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				url: top.config.tenderHost,
	 			//type:"gdsp", 
				type:"zlgd", 
	 			businessId:dataId, 
	 			status:2,
	 			submitSuccess:function(){
		         	var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.closeAll(); 
					parent.layer.alert("审核成功",{icon:7,title:'提示'});
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
	 		});
	 	} else {
	 		$("#btnClose, #btnPack").show();
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId: dataId,
				status: 3,   
				enterpriseId:'82843a905ce7474c8fffea2714947b36',
				type:'zlgd',
				checkState:isThrough
			});
	 		/* $("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"gdsp", 
	 			businessId:dataId, 
	 			status:3,
	 			checkState:isThrough
	 		}); */
	 	}
   	}
	var htmlZ = '';
	var htmlY = '';
	var htmlH = '';
	
	for(var m = 0;m<processPub.length;m++){
       htmlZ += '<div class="file_iterm iterm_box'+m+'" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
       				+'<div style="margin-bottom:10px;">'
       					+'<span class="project_name" data_name="'+processPub[m].name+'" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">'+processPub[m].name+'：</span>'
   					+'</div>'
            	+'<div class="row contant_'+m+'">'
            		
            	+'</div>'
           		+ '<div class="progress_cont" id="fileContent_'+m+'"></div>'
           		+'</div>'
	}
	for(var l = 0;l<processPre.length;l++){
		 htmlY += '<div class="file_iterm iterm_box'+(processPub.length+l)+'" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
       				+'<div style="margin-bottom:10px;">'
       					+'<span class="project_name" data_name="'+processPre[l].name+'" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">'+processPre[l].name+'：</span>'
   					+'</div>'
            	+'<div class="row contant_'+(processPub.length+l)+'">'
            		
            	+'</div>'
           		+ '<div class="progress_cont" id="fileContent_'+(processPub.length+l)+'"></div>'
           		+'</div>'
	}
	for(var n = 0;n<processTrial.length;n++){
		htmlH += '<div class="file_iterm iterm_box'+(processPub.length+processPre.length+n)+'" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
       				+'<div style="margin-bottom:10px;">'
       					+'<span class="project_name" data_name="'+processTrial[n].name+'" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">'+processTrial[n].name+'：</span>'
   					+'</div>'
            	+'<div class="row contant_'+(processPub.length+processPre.length+n)+'">'
            		
            	+'</div>'
           		+ '<div class="progress_cont" id="fileContent_'+(processPub.length+processPre.length+n)+'"></div>'
           		+'</div>'
	}
//	$(htmlZ).appendTo('.wrapPublic');
	$('.wrapPublic').html(htmlZ);
	$('.wrapPre').html(htmlY);
	$('.wrapTrial').html(htmlH);
	if(fileArr.length > 0){
		fileTables(fileArr)
	}
	
	//关闭
	$('html').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	//预览
	$('body').on('click','.btn_view',function(){
		var path = $(this).attr('data_url');
		//openPreview(path,'1000px','600px');
		previewPdf(path)
	});
	//下载
	$('body').on('click','.btn_load',function(){
		var path = $(this).attr('data_url');
		var name = $(this).attr('data_name');
		name = name.substring(0, name.lastIndexOf("."));
		var loadUrl =downloadFileUrl + '?ftpPath=' + path + '&fname='+name.replace(/\s+/g,"");
		window.location.href = $.parserUrlForToken(loadUrl);
	});
	function getDetail(id){
		$.ajax({
			type:"post",
			url:systemType == 1 ? guiUrl1 : guiUrl2,
			async:false,
			data: {
				'id':id
			},
			success: function(data){
				if(data.success){
					if(data.data.gdProjectDataFiles){
						var sourse = data.data.gdProjectDataFiles;
						fileArr = sourse;
					}
					if(data.data.examType == 2){
						$('.pretrial').hide();
						if(data.data.tenderMode == 1){
							processTrial.splice(1,1,{'name': '招标公告信息','stage': 'trial'})
						}
					}else if(data.data.examType == 1){
						$('.pretrial').show();
					}
					$('#bidSectionName').html(data.data.bidSectionName);
					$('#interiorBidSectionCode').html(data.data.interiorBidSectionCode);
				}else{
					parent.layer.alert(data.message)
				}
			}
		});
		
	}
	
	
	function fileTables(data){
		for(var i = 0;i<data.length;i++){
			for(var j = 0;j<$('.file_iterm').length;j++){
				var stage = $('.file_iterm').eq(j).find('.project_name').attr('data_name');
				if(data[i].projectStage == stage){
					var type = data[i].fileUrl.split('.')[1];
					var html = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="'+data[i].fileUrl+'" data_id="'+data[i].projectDataId+'" data_stage="'+data[i].projectStage+'" data_type="'+data[i].fileType+'" data_name="'+data[i].fileName+'">';
					html += '<div style="margin-right:30px;float:left;">'+data[i].fileName+'</div>'
					html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+data[i].fileUrl+'" data_name="'+data[i].fileName+'">下载</a>';
					if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
						html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+data[i].fileUrl+'">预览</a>'
					}
					html += '</div>'
		    		html += '<div style="clear:both;"></div></div>';
					$('.file_iterm').eq(j).find('.row').append(html)
					
				}
			}
		}
	}
	//打包下载
	$("#btnPack").click(function(){
		$(this).attr('href',$.parserUrlForToken(fileDownloadUrl+'?gdId='+dataId));
	});
});


//pdf预览
/*function openPreview(pdfPath){
	var suffix = pdfPath ? pdfPath.substring(pdfPath.lastIndexOf(".")) : "";
	if(suffix == ".pdf" || suffix == ".PDF"){
		var temp = top.layer.open({
			type: 2,
			title: "预览 ",
			area: ['100%','100%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			btn:["关闭"],
			content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
			yes:function(index,layero){
				top.layer.close(index);
			}
		});
		top.layer.full(temp);
	}
}
*/


//pdf预览
function previewPdf(pdfPath){
	var suffix = pdfPath ? pdfPath.substring(pdfPath.lastIndexOf(".")) : "";
	if(suffix == ".pdf" || suffix == ".PDF"){
		viewPdf(pdfPath);
	} else {
		var src = $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath);
		viewImage(src);
	}
	
}
//查看pdf
function viewPdf(pdfPath){
	var temp = top.layer.open({
		type: 2,
		title: "预览 ",
		area: ['100%','100%'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		btn:["关闭"],
		content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
		yes:function(index,layero){
			top.layer.close(index);
		}
	});
	
	top.layer.full(temp);
}
/***
 * 预览图片
 * @param {Object} pdfPath  图片地址
 */
function viewImage(pdfPath){
	var	url = '<div style="position:fixed;left:0;right:0;top:0;bottom:0;background-color:rgba(0,0,0,0.7);z-index:29891021 !important;" id="mask-dialog">'
				+ '<div style="position:fixed;left:0;right:0;top:0;bottom:0;" id="mask-bg"></div>'
				+ '	<img id="mask-img" src="'+pdfPath+'" style="display:block;position:absolute;cursor:move;">'
				+ '	<div style="position:fixed;bottom:10px;text-align:center;width:100%;" id="mask-btn">'
				+ '		<button id="mask-zoomOut" class="glyphicon glyphicon-zoom-out" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
				+ '		<button id="mask-zoomIn" class="glyphicon glyphicon-zoom-in" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
				+ '		<button id="mask-rotate" class="glyphicon glyphicon-repeat" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
				+ '		<button id="mask-close" class="glyphicon glyphicon-remove" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
				+ '	</div>'
			+ '</div>';
	top.$("body").append(url);
	
	top.$("#mask-bg, #mask-close").click(function(){
		top.$("#mask-dialog").remove();
	});
	top.document.getElementById('mask-img').onmousewheel = function(event){
		if(event.wheelDelta < 0){
			zoom_n -= 0.1;
	        if (zoom_n <= 0.1) {
	            zoom_n = 0.1;
	        }
        	transformImg();
		} else {
			zoom_n += 0.1;
		}
		transformImg();
	}
	top.document.getElementById('mask-img').onload=function(){
		//图片居中显示
	    var box_width = top.$("#mask-dialog").width(); //图片盒子宽度
	    var box_height = top.$("#mask-dialog").height();//图片盒子高度
	    var initial_width = top.$("#mask-img").width();//初始图片宽度
	    var initial_height = top.$("#mask-img").height();//初始图片高度
	    
	    if(initial_width > initial_height){
	    	if(initial_width > box_width){
	    		top.$("#mask-img").css("width", box_width);
	    	}
	    	var last_imgHeight = top.$("#mask-img").height();
	    } else {
	    	if(initial_height > box_height){
	    		top.$("#mask-img").css("height", box_height);
	    	}
	    	var last_imgWidth = top.$("#mask-img").width();
	    }
	    var imgH = top.$("#mask-img").height()/2;
	    var imgW = top.$("#mask-img").width()/2;
	    top.$("#mask-img").css({"margin-left": -imgW, "margin-top": -imgH, "left":"50%", "top":"50%"});
//	    top.$("#mask-img").css("margin-top", -imgH);
    }

	//图片拖拽
    var $div_img = top.$("#mask-img");
    //绑定鼠标左键按住事件
    $div_img.bind("mousedown", function (event) {
        event.preventDefault && event.preventDefault(); //去掉图片拖动响应
        //获取需要拖动节点的坐标
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        //获取当前鼠标的坐标
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        //绑定拖动事件
        //由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素
        top.$("#mask-dialog").bind("mousemove", function (ev) {
            // 计算鼠标移动了的位置
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            //设置移动后的元素坐标
            var now_x = (offset_x + _x ) + "px";
            var now_y = (offset_y + _y ) + "px";
            //改变目标元素的位置
            $div_img.css({
                top: now_y,
                left: now_x,
                marginTop:0,
                marginLeft:0
            });
        });
    });
    //当鼠标左键松开，接触事件绑定
    top.$("#mask-dialog").bind("mouseup", function () {
        top.$("#mask-dialog").unbind("mousemove");
    });
	//放大缩小
	var zoom_n = 1;
	top.$("#mask-zoomIn").click(function(){ //放大
		zoom_n += 0.1;
        transformImg();
	});
	top.$("#mask-zoomOut").click(function(){ //缩小
		zoom_n -= 0.1;
        if (zoom_n <= 0.1) {
            zoom_n = 0.1;
        }
        transformImg();
	});
	//旋转
	var spin_n = 0;
	top.$("#mask-rotate").click(function(){
		spin_n += 90;
        transformImg();
	});
	
	function transformImg(){
		top.$("#mask-img").css({
            "transform": "scale(" + zoom_n + ") rotate("+ spin_n +"deg)",
            "-moz-transform": "scale(" + zoom_n + ") rotate("+ spin_n +"deg)",
            "-ms-transform": "scale(" + zoom_n + ") rotate("+ spin_n +"deg)",
            "-o-transform": "scale(" + zoom_n + ") rotate("+ spin_n +"deg)",
            "-webkit-transform": "scale(" + zoom_n + ") rotate("+ spin_n +"deg)"
        });
	}
	
}