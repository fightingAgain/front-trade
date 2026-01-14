/* var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件 */
var fileUploadUrl=top.config.AuctionHost + "/deliveryFile/upload.do"; //上传
var dowoloadFileUrl = top.config.AuctionHost + "/deliveryFile/download.do"; //下载文件
var pushUrl =  top.config.AuctionHost + '/projectReceptionController/push.do';//推送接口
var bidPushUrl =  config.tenderHost + '/projectReceptionController/push.do';//招标推送
var deleteFileUrl= top.config.AuctionHost + "/deliveryFile/deleteDeliveryFile.do"; //删除文件接口
var deleteBidFileUrl= top.config.tenderHost + "/projectReceptionController/deleteDeliveryFile.do"; //招标删除文件接口
var detailUrl = config.AuctionHost + '/projectReceptionController/saveLogPushProject.do';//非招标详情
var biddingDetailUrl = config.tenderHost + '/projectReceptionController/saveLogPushProject.do';//招标详情
var saveBidFileUrl = config.tenderHost + '/projectReceptionController/uploadDeliveryFile.do';//招标类型上传文件后的保存
var tenderType = 0;//采购方式
var initData = [],publicData=[],initBiddingData=[],initBidData=[];
var id;
var packageId,projectId, processType;
var organNo;
var pushData='';//推送数据
var selSupplier;//供应商
$(function(){
	packageId = $.getUrlParam("packageId");
	projectId = $.getUrlParam("projectId");
	tenderType = $.getUrlParam("tenderType");
	organNo = $.getUrlParam("organNo");
	id = $.getUrlParam("id");
	processType = $.getUrlParam("processType");
	publicData = {
		'name': '其他附件',
		'type': 'qtfj',
		'files':[],
		'ftype':'99'
	}
	initBiddingData = [
		{
			'name': '开标前资料',
			'type': 'kbqzl',
			'child': [{'name':'招标公告','type': '','ftype':'9','files':[]},
			{'name':'招标文件','type': '','ftype':'34','files':[]},
			{'name':'招标文件澄清','type': '','ftype':'55','files':[]},
			{'name':'答疑会纪要','type': '','ftype':'56','files':[]}]
		},
		{
			'name': '评审过程资料',
			'type': 'psgczl',
			'child': [{'name':'投标文件','type': '','ftype':'39','selSupplier':[]},
			{'name':'评标报告','type': '','ftype':'36','files':[],'isMust':'1', isSingle: true, extFilters:['pdf']},
			{'name':'评审澄清','type': '','ftype':'57','files':[]},
			{'name':'中标候选人推荐表','type': '','ftype':'42','files':[], isSingle: true, extFilters:['pdf']}]
		},
		{
			'name': '定标资料',
			'type': 'dbzl',
			'child': [{'name':'中标候选人公示','type': '','ftype':'37','files':[]},
			{'name':'中标结果公告','type': '','ftype':'38','files':[]},
			{'name':'中/落标结果通知','ftype':'25','isMust':'1', 'selSupplier':''},
			{'name':'中标人报价盖章件','type': '','ftype':'43','files':[], extFilters:['pdf'], size: 10},
			{'name':'评委抽取表','type': '','ftype':'35','files':[], isSingle: true, size: 10}]
		}
	];
	initBidData = [
		{
			'name': '采购报价资料',
			'type': 'cgbjzl',
			'child': [{'name':'采购公告','type': '','ftype':'9','files':[]},
			{'name':'采购文件','type': '','ftype':'12','files':[]},
			{'name':'采购文件答复','type': '','ftype':'11','files':[]}]
		},
		{
			'name': '评审过程资料',
			'type': 'psgczl',
			'child': [{'name':'报价文件','type': '','ftype':'22','selSupplier':[]},
			{'name':'评审报告','type': '','ftype':'15','files':[],'isMust':'1', isSingle: true, extFilters:['pdf']},
			{'name':'评审澄清','type': '','ftype':'17','files':[]},
			{'name':'中选候选人推荐表','type': '','ftype':'30','files':[], isSingle: true, extFilters:['pdf']}]
			
		},
		{
			'name': '定选资料',
			'type': 'dxzl',
			'child': [{'name':'中选候选人公示','type': '','ftype':'31','files':[]},
			{'name':'采购结果公告','type': '','ftype':'32','files':[]},
			{'name':'中/落选结果通知','ftype':'25','isMust':'1', 'selSupplier':[]},
			{'name':'中选人报价盖章件','type': '','ftype':'43','files':[], extFilters:['pdf'], size: 10},
			{'name':'价格谈判记录','type': '','ftype':'16','files':[], extFilters:['pdf', 'zip', 'rar'], size: 100}]
		}
	];
	if(tenderType == 0 || tenderType == 6){
		$('#tenderType6').show();
		$('#tenderType4').html('').hide();
		var newArr = initBidData.concat(publicData)
		initData =  JSON.parse(JSON.stringify(newArr));
	}else if(tenderType == 4){
		$('#tenderType4').show();
		$('#tenderType6').html('').hide();
		var newArr = initBiddingData.concat(publicData)
		initData =  JSON.parse(JSON.stringify(newArr));
	}
	// getDetail()
	//关闭当前窗口
	$("#btn_close").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//上传
	$('#DataPush').on('click','.btnUpload', function(){
		$(this).closest('td').find('input[type="file"]').trigger('click')
	});
	//下载
	$('#DataPush').on('click','.btn_load', function(){
		var ftpPath = $(this).attr('data_url');
		var ftpName = $(this).attr('data_name');
		var newUrl =dowoloadFileUrl + '?ftpPath=' + ftpPath + '&fname=' + ftpName
		window.location.href = $.parserUrlForToken(newUrl);
	});
	//删除
	$('#DataPush').on('click','.remove', function(){
		var fileId = $(this).attr('data-id');
		var postUrl = deleteFileUrl;
		if(tenderType == 4){
			postUrl = deleteBidFileUrl;
		}
		parent.layer.confirm('确定要删除该附件', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(indexs, layero){
			parent.layer.close(indexs);
			$.ajax({
				type: "post",
				url: postUrl,
				async: false,
				dataType: 'json',
				data: {
					"deliveryFileId": fileId,
				},
				success: function(data) {
					if(data.success){
						getDetail(false, false);
					}else{
						parent.layer.alert(data.message)
					}
				}
			});
		}, function(indexs){
			parent.layer.close(indexs)
		});
	});
	getDetail(true, true);
	
});
function passMessage(callback){
	$('#btn_submit').click(function(){
		var pushFiles = [];
		var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		var thisData = Date.parse(new Date(nowDate.replace(/\-/g, "/")));
		var endData = '';
		//获取被选中的元素的数量
		var checkedCount = $('.itemBox:checked').length + $('.summaryBox:checked').length;
		var canPush = true;
		var tips = '';
		pushData.openingDetail = 0;//是否有开标前资料/采购报价资料选中，用于验证
		pushData.reviewDetail = 0;//是否有评审过程资料选中，用于验证
		pushData.calibrateDetail = 0;//是否有定标资料选中，用于验证
		pushData.otherDetail = 0;//是否有其它资料选中，用于验证
		if(checkedCount > 0){
			if(tenderType == 4){
				endData = Date.parse(new Date(pushData.bidOpenDateStr.replace(/\-/g, "/")));
				if(nowDate < endData){
					top.layer.alert('开标时间前无法推送！');
				}
			}else{
				endData = Date.parse(new Date(pushData.bidEndDatea.replace(/\-/g, "/")));
				if(nowDate < endData){
					top.layer.alert('报价截止时间前无法推送！');
					return
				}
			}
			var itemEle = $('.itemBox:checked');
			var summaryEle = $('.summaryBox:checked');
			for(var i = 0;i<initData.length;i++){
				var item = initData[i];
				if(item.child){
					for(var m = 0;m<item.child.length; m++ ){
						for(var e=0;e<itemEle.length;e++){
							var ftype = $(itemEle).eq(e).attr('data-ftype');
							if(item.child[m].ftype == ftype){
								if(ftype == '25' || ftype == '39' || ftype == '22'){
									
									for(var y=0;y<selSupplier.length;y++){
										if(ftype == '25'){
											var hasWinNotice = false, hasFailNotice = false;
											if(selSupplier[y].attachments.length > 0){
												for(var t=0;t<selSupplier[y].attachments.length;t++){
													if(selSupplier[y].isWin == 1){
														if(selSupplier[y].attachments[t].ftype =='23'){//有中标通知书
															hasWinNotice = true;
														}
														if(!hasWinNotice){
															tips = '请上传'+selSupplier[y].supplierName+'的'+(tenderType==4?'中选通知书':'中标通知书')+'!'
														}
													}else{
														if(selSupplier[y].attachments[t].ftype =='24'){//有落标通知书
															hasFailNotice = true;
														}
														if(!hasFailNotice){
															tips = '请上传'+selSupplier[y].supplierName+'的'+(tenderType==4?'落选通知书':'结果通知书')+'!'
														}
													}
												}
											}else{
												tips = '请上传'+selSupplier[y].supplierName+'的'+(tenderType==4?'落选通知书':'结果通知书')+'!';
											}
											
											if(!hasWinNotice && !hasFailNotice){
												canPush = false;
												break
											}else{
												pushData.selSupplier=selSupplier;
												pushData.calibrateDetail = 1;
											}
										}else{
											pushData.selSupplier=selSupplier;
											pushData.reviewDetail = 1;
										}
									}
								}else{
									if(item.child[m].isMust == 1 && item.child[m].files.length == 0){//选中的为必填项但没有文件时不能推送
										canPush = false;
										tips = '请上传'+item.child[m].name+'!';
										break
									}
									pushFiles = pushFiles.concat(item.child[m].files);
									if(item.type == 'kbqzl' || item.type == 'cgbjzl'){
										pushData.openingDetail = 1;
									}
									if(item.type == 'psgczl'){
										pushData.reviewDetail = 1;
									}
									if(item.type == 'dbzl'){
										pushData.calibrateDetail = 1;
									}
								}
							}
						}
					}
				}else{//其它资料
					if($('#qtfj').is(':checked')){
						pushFiles = pushFiles.concat(initData[initData.length-1].files);
						pushData.otherDetail = 1;
					}
				}
			}
		}else{
			top.layer.alert('请先选择需要推送的数据！');
			return
		}
		if(!canPush){
			top.layer.alert(tips);
			return
		}
		pushData.deliveryFiles = pushFiles
		pushAll(pushData);
	});
	/******************            推送               *******************  */
	function pushAll(arr){
		arr.tenderType = tenderType;
		arr.processType = processType;
		var postUrl = pushUrl;
		if(tenderType == 4){
			postUrl = bidPushUrl;
		}
		top.layer.confirm('确定推送?', { icon: 3, title: '询问' }, function (ind) {
			layer.close(ind);
			$.ajax({
				type:"post",
				url: postUrl,
				async:true,
				data: arr,
				success: function(data){
					if(data.success){
						if(callback){
							callback()
						}
						parent.layer.alert('推送成功！');
						var index = parent.layer.getFrameIndex(window.name); 
						parent.layer.close(index); 
					}else{
						parent.layer.alert(data.message)
					}
					
				}
			});
		});
		
	};
}

/********               数据详情           ************/
	//是否刷新项目信息
	function getDetail(isRefresh, isRebuild){
		var postUrl = '', postData={};
		if(tenderType == 4){
			postUrl = biddingDetailUrl;
			postData = {
				'packageId': packageId,
				'processType': processType,
			};
		}else{
			postUrl = detailUrl;
			postData = {
				'packageId': packageId,
				'projectId': projectId,
				'tenderType': tenderType,
				'organNo': organNo,
				'processType': processType,
			};
			
		}
		if(!isRebuild){
			postData.isUpdateFile = 1
		}
		$.ajax({
			type: "post",
			url: postUrl,
			async: true,
			data: postData,
			success: function(data) {
				if(data.success) {
					if(data.data){
						var arr = data.data;
						if(arr.id){
							id = arr.id;
						}
						if(isRefresh){
							for(var key in arr){
								if(key == 'isPublic'){
									if(tenderType != 4){
										if(arr[key] == 0){
											$('#isPublic').html('所有供应商');
											$('.isPublic').html('公告发布时间');
										}else if(arr[key] == 1){
											$('#isPublic').html('所有本公司认证供应商');
											$('.isPublic').html('公告发布时间');
										}else if(arr[key] == 2){
											$('#isPublic').html('仅限邀请供应商');
											$('.isPublic').html('邀请函发出时间');
										}else if(arr[key] == 3){
											$('#isPublic').html('仅邀请本公司认证供应商');
											$('.isPublic').html('邀请函发出时间');
										}
									}
								}else if(key == 'examType'){
									if(tenderType == 4){//招标
										$('#examType').html(arr[key] == 1?'预审':'后审');
									}else{
										$('#examType').html(arr[key] == 1?'后审':'预审');
									}
									
								}else if(key == 'tenderMode'){
									if(arr[key] == 1){
										$('#tenderMode').html('公开招标');
										$('.tenderMode').html('公告发布时间')
									}else if(arr[key] == 2){
										$('#tenderMode').html('邀请招标');
										$('.tenderMode').html('邀请函发出时间')
									}
									
								}else{
									$('#'+ key).html(arr[key]);
								}
							}
							$('#getFileData').html(arr.ansSengDatea);
						}else{
							initData = [];
							if(tenderType == 0 || tenderType == 6){
								var newArr = initBidData.concat(publicData)
								initData =  JSON.parse(JSON.stringify(newArr));
							}else if(tenderType == 4){
								var newArr = initBiddingData.concat(publicData)
								initData =  JSON.parse(JSON.stringify(newArr));
							}
						}
						
						//展示前处理文件
						if(arr.deliveryFiles && arr.deliveryFiles.length > 0){
							for(var i=0;i<arr.deliveryFiles.length;i++){
								for(var a=0;a<initData.length;a++){
									var item = initData[a];
									if(item.child){
										for(var m = 0;m<item.child.length; m++ ){
											if(item.child[m].ftype == '25' || item.child[m].ftype == '22' || item.child[m].ftype == '39'){
												initData[a].child[m].selSupplier = arr.selSupplier;
											}else{
												if(arr.deliveryFiles[i].ftype == item.child[m].ftype){
													initData[a].child[m].files.push(arr.deliveryFiles[i]);
												}
											}
										}
									}else{
										if(arr.deliveryFiles[i].ftype == item.ftype){
											initData[a].files.push(arr.deliveryFiles[i]);
										}
									}
								}
							}
						};
						pushData = arr;
						selSupplier = arr.selSupplier;
						delete pushData.selSupplier;
						
						setHtml(initData);
					}
				} else {
					parent.layer.alert(data.message)
				}
		
			}
		});
	}
/**********************               数据详情 end           ************/
/********************               数据展示           ************/
	function setHtml(data){
		$('#pushBox').html('');
		var html = '';
		for(var i = 0;i<data.length;i++){
			var item = data[i];
			html += '<table class="table table-bordered" align="center">'
				html += '<tr>'
					html += '<td colspan="4" style="font-weight: bold;background-color: #d3e5fc"><input type="checkbox" class="summaryBox" data-ftype="'+(i==(data.length-1)?item.type:'' )+'" data-type="'+item.type+'" id="'+item.type+'" style="vertical-align: -2px;" />'+item.name+(i==0?'(<span class="red">'+(tenderType==4?('开标时间：' +pushData.bidOpenDateStr):('报价截止时间：'+pushData.bidEndDatea))+'</span>)':"")+'</td>'
				html += '</tr>'
				if(item.child){
					for(var m = 0;m<item.child.length; m++ ){
						html += '<tr>'
							html += '<td  class="th_bg" ><input type="checkbox" class="'+item.type+' itemBox" data-ftype="'+item.child[m].ftype+'" data-item="'+item.type+'" style="vertical-align: -2px;" />'+item.child[m].name+(item.child[m].isMust == 1?'<span class="red">*</span>':'')+'</td>'
							html += '<td colspan="3">'
							if(item.child[m].ftype == '25' || item.child[m].ftype == '22' || item.child[m].ftype == '39'){
								if(item.child[m].selSupplier && item.child[m].selSupplier.length > 0){
									html += bidderTable(item.child[m].selSupplier, item.child[m].ftype)
								}
							}else{
								html += "<button type='button' data-index='"+ item.child[m].ftype +"'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
								" style='text-decoration:none;margin-right:10px;'>上传</button>";
								if(item.child[m].extFilters){
									var arr = []
									for(var f=0;f<item.child[m].extFilters.length;f++){
										arr.push(item.child[m].extFilters[f].slice(0,0).concat('.', item.child[m].extFilters[f]));
									}
									var extFilters = arr.join(',');
									html += '<input type="file" name="files" accept="'+extFilters+'" single id="btnUpload'+ item.child[m].ftype +'" onchange=Excel(this,\"'+item.child[m].name+'\",\"'+item.child[m].ftype +'\")>';
								}else{
									html += '<input type="file" name="files" single id="btnUpload'+ item.child[m].ftype +'" onchange=Excel(this,\"'+item.child[m].name+'\",\"'+item.child[m].ftype +'\")>';
								}
								html += '<div class="row">'
									html += fileHtml(item.child[m].files);
								html += '</div>'
							}
							html += '</td>'
						html += '</tr>'
					}
				}else{
					html += '<tr>'
						// html += '<td  class="th_bg" ><input type="checkbox" class="'+item.type+' itemBox" data-item="'+item.type+'" />'+item.name+'</td>'
						html += '<td colspan="4">'
						html += "<button type='button' data-index='"+ item.ftype +"'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
						" style='text-decoration:none;margin-right:10px;'>上传</button>";
						if(item.extFilters){
							var arr = []
							for(var f=0;f<item.extFilters.length;f++){
								arr.push(item.extFilters[f].slice(0,0).concat('.', item.extFilters[f]));
							}
							var extFilters = arr.join(',');
							html += '<input type="file" name="files"  accept="'+extFilters+'" single id="btnUpload'+ item.ftype +'" onchange=Excel(this,\"'+item.name+'\",\"'+item.ftype +'\")>';
						}else{
							html += '<input type="file" name="files" single id="btnUpload'+ item.ftype +'" onchange=Excel(this,\"'+item.name+'\",\"'+item.ftype +'\")>';
						}
						
						html += '<div class="row">'
							html += fileHtml(item.files);
						html += '</div>'
						html += '</td>'
					html += '</tr>'
				}
				
			html += '</table>'
		}
		$('#pushBox').html(html);
		for(var  w= 0;w<data.length;w++){
			var item = data[w];
			if(item.child){
				for(var e = 0;e<item.child.length; e++ ){
					var eleSlect = "fileUp_"+w+"_"+e;
					var eleCont = "fileContent_"+w+"_"+e;
					// fileUpload(eleSlect, eleCont, id, w, e);
				}
			}else{
				var eleSlect = "fileUp_"+w;
				var eleCont = "fileContent_"+w;
				// fileUpload(eleSlect, eleCont, id, w);
			}
		}
		
	};
	//中/落选结果通知的投标人列表
	function bidderTable(data, type){
		var html = '';
		html += '<table class="table table-bordered"><tr><th style="text-align: center;">序号</th>';
		html += '<th>供应商名称</th>';
		html += '<th style="text-align: center;">统一社会信用代码</th>';
		if(type == '25'){
			html += '<th style="text-align: center;">报价金额（元）</th>';
			html += '<th style="text-align: center;">是否中标</th>';
			html += '<th style="text-align: center;">中标金额（元）</th>';
			html += '<th><span class="red">*</span>结果通知书（<span class="red">限pdf文件，最大10MB</span>）</th>';
			html += '<th>技术方案</th>';
		}else if(type == '22' || type == '39'){
			if(type == '22'){
				html += '<th>报价文件</th>';
			}else{
				html += '<th>投标文件</th>';
			}
		}
		html += '</tr>';
		for(var i=0; i<data.length; i++){
			html += '<tr><td style="text-align: center;">'+(i+1)+'</td>';
			html += '<td>'+data[i].supplierName+'</td>';
			html += '<td style="text-align: center;">'+data[i].socialCreditcode+'</td>';
			if(type == '25'){
				html += '<td style="text-align: center;">'+(data[i].openPrice?data[i].openPrice:"")+'</td>';
				html += '<td style="text-align: center;">'+(data[i].isWin==1?'是':'否')+'</td>';
				html += '<td style="text-align: center;">'+(data[i].isWin==1?data[i].winPrice:'/')+'</td>';
			}
			
			var planFile = [], winFile=[],failFile=[], bidderFile=[];//技术方案、中选通知书、落选通知书
			if(data[i].attachments && data[i].attachments.length > 0){
				var noticeFile = data[i].attachments;//投标人、供应商的通知书附件
				for(var w=0;w<noticeFile.length; w++){
					if(noticeFile[w].ftype == '21'){//技术方案
						planFile.push(noticeFile[w]);
					}else if(noticeFile[w].ftype == '23'){
						winFile.push(noticeFile[w]);
					}else if(noticeFile[w].ftype == '24'){
						failFile.push(noticeFile[w]);
					}else if(noticeFile[w].ftype == '22' || noticeFile[w].ftype == '39'){
						bidderFile.push(noticeFile[w]);
					}
				}
			}
			if(type == '25'){
				html += '<td>';
					if((data[i].isWin == 1 && winFile.length == 0) || ((!data[i].isWin || data[i].isWin == 0) && failFile.length == 0)){
						html += "<button type='button' data-index='"+ (data[i].isWin==1?'23':'24') +"'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
						" style='text-decoration:none;margin-right:10px;'>"+(data[i].isWin==1?'上传中'+(tenderType==4?'标':'选')+'通知书':'上传落'+(tenderType==4?'标':'选')+'通知书')+"</button>";
						html += '<input type="file" name="files" accept="application/pdf" single id="btnUpload'+ (data[i].isWin==1?'23':'24') +'" onchange=Excel(this,"通知书",\"'+ (data[i].isWin==1?'23':'24')+'\",\"'+ i +'\")>';
					}else{
						html += '<div style="margin-bottom:20px;" data_url="'+(data[i].isWin == 1?winFile[0].ftpPath:failFile[0].ftpPath)+'">';
						html += '<div style="margin-right:30px;float:left;">'+(data[i].isWin == 1?winFile[0].name:failFile[0].name)+'</div>'
						html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+(data[i].isWin == 1?winFile[0].ftpPath:failFile[0].ftpPath)+'" data_name="'+(data[i].isWin == 1?winFile[0].name:failFile[0].name)+'">下载</a>';
						html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" class="btnDel remove" data-id="'+(data[i].isWin == 1?winFile[0].id:failFile[0].id)+'">移除</a></div>'	
						html += '<div style="clear:both;"></div></div>';
					}
				html += '</td>'
				html += '<td>';
					if(planFile.length > 0){
						html += '<div style="margin-bottom:20px;" data_url="'+planFile[0].ftpPath+'">';
						html += '<div style="margin-right:30px;float:left;">'+planFile[0].name+'</div>'
						html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+planFile[0].ftpPath+'" data_name="'+planFile[0].name+'">下载</a>';
						html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="'+(planFile[0].id?planFile[0].id:'')+'" class="btnDel remove">移除</a></div>'	
						html += '<div style="clear:both;"></div></div>';
					}else{
						html += "<button type='button' data-index='21'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
						" style='text-decoration:none;margin-right:10px;'>上传技术方案</button>";
						html += '<input type="file" name="files" single id="btnUpload21" onchange=Excel(this,"技术方案",21,\"'+ i +'\")>';
					}
				html += '</td>'
			}else{
				html += '<td>';
					if(bidderFile.length > 0){
						html += '<div style="margin-bottom:20px;" data_url="'+bidderFile[0].ftpPath+'">';
						html += '<div style="margin-right:30px;float:left;">'+bidderFile[0].name+'</div>'
						html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+bidderFile[0].ftpPath+'" data_name="'+bidderFile[0].name+'">下载</a>';
						html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="'+(bidderFile[0].id?bidderFile[0].id:'')+'" class="btnDel remove">移除</a></div>'	
						html += '<div style="clear:both;"></div></div>';
					}else{
						html += "<button type='button' data-index='21'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
						" style='text-decoration:none;margin-right:10px;'>上传"+(type == '22'?'报价文件':'投标文件')+"</button>";
						html += '<input type="file" name="files" single id="btnUpload'+ type +'" onchange=Excel(this,"投标",\"'+ type +'\",\"'+ i +'\")>';
					}
				html += '</td>'
			}
		}
		html += '</table>';
		return html
	}
	//文件展示
	function fileHtml(data){
		var html = '';
		if(data.length > 0){
			for(var i=0; i<data.length; i++){
				html += '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 keep" style="margin-bottom:20px;" data_url="'+data[i].ftpPath+'">';
				html += '<div style="margin-right:30px;float:left;">'+data[i].name+'</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+data[i].ftpPath+'" data_name="'+data[i].name+'">下载</a>';
				html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="'+data[i].id+'" class="btnDel remove">移除</a></div>'	
				html += '<div style="clear:both;"></div></div>';
			}
		}
		return html
	}
/***************               数据展示  --end           ************/
/***************                个分类的全选                 ***************/
//选中、取消全选
$('body').on('click', '.summaryBox', function(){
	var clickType = $(this).attr('data-type');
	if(clickType != 'qtfj'){
		//查看当前全选是否选中
		var status = this.checked;
		//根据status来设置其它多选框的状态
		$('.' + clickType).prop('checked',status);
	}
	//获取被选中的元素的数量
	var checkedCount = $('.summaryBox:checked').length;
	//获取总的元素的数量
	var totalCount = $('.summaryBox').length;
	//根据两者比较来设置全选框的状态
	$('#choseAll').prop('checked', checkedCount == totalCount)
	showPushNumber();
});
//单个元素选中、取消
$('body').on('click', '.itemBox', function(){
	var clickType = $(this).attr('data-item');
	//获取被选中的元素的数量
	var checkedCount = $('.' + clickType +':checked').length;
	//获取总的元素的数量
	var totalCount = $('.' + clickType).length;
	//根据两者比较来设置全选框的状态
	$('#' + clickType).prop('checked', checkedCount == totalCount);
	
	//获取被选中的元素的数量
	var checkedCount = $('.itemBox:checked').length;
	//获取总的元素的数量
	var totalCount = $('.itemBox').length;
	//根据两者比较来设置全选框的状态
	$('#choseAll').prop('checked', checkedCount == totalCount);
	showPushNumber();
});
/***************                个分类的全选 --end                ***************/
/***************                页面的全选                 ***************/
//选中、取消全选
$('body').on('click', '#choseAll', function(){
	//查看当前全选是否选中
	var status = this.checked;
	//根据status来设置其它多选框的状态
	$('.summaryBox, .itemBox').prop('checked',status);
	showPushNumber();
});
/***************                个分类的全选 --end                ***************/
/*****************           上传           ********************/
/* eleSlect  文件选择DIV的ID   eleCont 文件显示容器的ID  id 数据id,用于存储文件

 */
function fileUpload(eleSlect, eleCont, id, index, ind){
	var config = {
       	multipleFiles: true, /** 多个文件一起上传, 默认: false */
    	swfURL : "/swf/FlashUploader.swf", /** SWF文件的位置 */
//  	tokenURL : "/tk", /** 根据文件名、大小等信息获取Token的URI（用于生成断点续传、跨域的令牌） */
    	frmUploadURL : flashFileUrl, /** Flash上传的URI */
    	filesQueueHeight : 0, /** 文件上传容器的高度（px）, 默认: 450 */
    	messagerId:'',//显示消息元素ID(customered=false时有效)
    	uploadURL : fileUrl, /** HTML5上传的URI */
    	browseFileId: eleSlect,//文件选择DIV的ID
    	filesQueueId: eleCont,//文件显示容器的ID(customered=false时有效)
    	autoUploading: true,//选择文件后是否自动上传
	    autoRemoveCompleted:true,//文件上传后是否移除
//	    extFilters: ['.pdf','.PDF','.doc','.docx'],
	    postVarsPerFile : {
			//自定义文件保存路径前缀
			Token:$.getToken(),
			// basePath: "/"+registerInfo.enterpriseId+"/"+bidSectionId+"/"+id+"/701"
		},
		onRepeatedFile: function(file) {
			parent.layer.alert("文件： " + file.name+ " 已存在于上传队列中，请勿重复上传！")
		   return flase;
		},
		onComplete: function(file) {
			var path = JSON.parse(file.msg).data.filePath;
			var type = path.split('.')[1];
			var html = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="'+path+'" data_id="'+id+'" data_stage="'+stage+'" data_type="'+(gdBackType == 1?"3":"1")+'" data_name="'+file.name+'">';
				html += '<div style="margin-right:30px;float:left;">'+file.name+'</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="'+path+'" data_name="'+file.name+'">下载</a>';
				/* if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
					html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
				} */
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel remove_'+index+'" data-index="'+index+'">移除</a></div>'	
				html += '<div style="clear:both;"></div></div>';
				$('.contant_'+index).append(html)
		}
    };
    var _t = new Stream(config);
};
function showPushNumber(){
	var checkedCount = $('.summaryBox:checked').length;
	$('#selectNumber').html(checkedCount);
}
function Excel(obj, name, fileType, _i) {
	if (obj.files != null && obj.files.length > 0) {
		var fileSize = 0;
		var url = fileUploadUrl;
		var formFile = new FormData();
		var nowType = {};
		formFile.append("ftype", fileType);
		formFile.append("tenderType", tenderType);
		formFile.append("deliveryId", id);//主键id
		//中选通知书、落选通知书、技术方案
		if(fileType == '23' || fileType == '24' || fileType == '21' || fileType == '22'|| fileType == '39'){
			formFile.append("supplierId", selSupplier[_i].supplierId);
		}
		formFile.append("files", obj.files[0]);//单个上传
		/* for (var i = 0; i < obj.files.length; i++) {
			formFile.append("files", obj.files[i]); //加入文件对象
		} */
		var fileName = obj.files[0].name;
		var suffix = fileName.substring(fileName.lastIndexOf(".")).split('.')[1];
		fileSize = obj.files[0].size/1024/1024;
		if(fileType == '23' || fileType == '24'){
			if(fileSize > 10){
				top.layer.alert('上传文件大小不超过10M');
				return
			}
			if(suffix != 'pdf' && suffix != 'PDF'){
				top.layer.alert('请上传pdf文件');
				return
			}
		}else if(fileType == '21'){
			if(fileSize > 500){
				top.layer.alert('上传文件大小不超过500M');
				return
			}
		}else{
			for(var i = 0; i < initData.length; i++){
				var item = initData[i];
				if(item.child){
					for(var m = 0;m<item.child.length; m++ ){
						if(item.child[m].ftype == fileType){
							nowType = item.child[m];
						}
					}
				}
			}
			if(nowType.isSingle){
				if($(obj).closest('td').find('.keep').length > 0){
					top.layer.alert('只能上传一个文件');
					return
				}
			}
			if(nowType.extFilters && nowType.extFilters.indexOf(suffix) < 0){
				var tips = nowType.extFilters.join('、')
				top.layer.alert('只能上传'+tips+'类型文件');
				return
			}
			if(nowType.size && Number(nowType.size)< fileSize){
				top.layer.alert('上传文件大小不超过'+nowType.size+'M');
				return
			}
		}
		$.ajax({
			type: "post",
			url: url,
			data: formFile,
			cache: false,//上传文件无需缓存
			processData: false,//用于对data参数进行序列化处理 这里必须false
			contentType: false, //必须
			success: function (response) {
				if (response.success) {
					if(tenderType == 4){
						saveBidFiles(response.data, function(){
							parent.layer.alert("上传成功");
							getDetail(false, true);
						})
					}else{
						parent.layer.alert("上传成功");
						getDetail(false, true);
					}
					
				} else {
					parent.layer.alert(response.message)
				}
			}
		});
	}
};

/*************************          招标上传后的保存            ****************************/
	function saveBidFiles(obj, callback){
		$.ajax({
			type:"post",
			url:saveBidFileUrl,
			async:true,
			data: obj,
			success: function(data){
				if(data.success){
					callback()
				}else{
					parent.layer.alert(data.message)
				}
				
			}
		});
	}