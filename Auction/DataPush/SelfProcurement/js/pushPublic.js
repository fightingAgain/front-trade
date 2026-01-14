/* var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件 */
var fileUploadUrl = top.config.AuctionHost + "/deliveryFile/upload.do"; //上传
var dowoloadFileUrl = top.config.AuctionHost + "/deliveryFile/download.do"; //下载文件
var pushUrl = top.config.AuctionHost + '/projectReceptionController/push.do';//推送接口
var bidPushUrl = config.tenderHost + '/projectReceptionController/push.do';//招标推送
var deleteFileUrl = top.config.AuctionHost + "/deliveryFile/deleteDeliveryFile.do"; //删除文件接口
var deleteBidFileUrl = top.config.tenderHost + "/projectReceptionController/deleteDeliveryFile.do"; //招标删除文件接口
var detailUrl = config.AuctionHost + '/projectReceptionController/saveLogPushProject.do';//非招标详情
var biddingDetailUrl = config.tenderHost + '/projectReceptionController/saveLogPushProject.do';//招标详情
var saveBidFileUrl = config.tenderHost + '/projectReceptionController/uploadDeliveryFile.do';//招标类型上传文件后的保存

var tenderType = 0;//采购方式
var initData = [], publicData = [], initBiddingData = [], initOfflineBiddingData = [], initBidData = [];
var id;
var packageId, projectId, processType;
var organNo;
var pushData = '';//推送数据
var selSupplier;//供应商
$(function () {
	packageId = $.getUrlParam("packageId");
	projectId = $.getUrlParam("projectId");
	tenderType = $.getUrlParam("tenderType");
	organNo = $.getUrlParam("organNo");
	id = $.getUrlParam("id");
	processType = $.getUrlParam("processType");
	publicData = {
		'name': '其他附件',
		'type': 'qtfj',
		'files': [],
		'ftype': '99'
	}
	initOfflineBiddingData = [
		{
			'name': '开标前资料',
			'type': 'kbqzl',
			'child': [{ 'name': '招标公告', 'type': '', 'ftype': '9', 'files': [] },
			{ 'name': '招标文件', 'type': '', 'ftype': '34', 'files': [] },
			{ 'name': '招标文件澄清', 'type': '', 'ftype': '55', 'files': [] },
			{ 'name': '答疑会纪要', 'type': '', 'ftype': '56', 'files': [] }]
		},
		{
			'name': '评审过程资料',
			'type': 'psgczl',
			'child': [
				{ 'name': '投标文件', 'type': '', 'ftype': '39', 'selSupplier': [] },
				{ 'name': '评标汇总', 'type': '', 'ftype': '72' },
				{ 'name': '评标报告', 'type': '', 'ftype': '36', 'files': [], 'isMust': '1', isSingle: true, extFilters: ['pdf'] },
				{ 'name': '中标候选人推荐表', 'type': '', 'ftype': '42', 'files': [], isSingle: true, extFilters: ['pdf'] },
			]
		},
		{
			'name': '定标资料',
			'type': 'dbzl',
			'child': [
				{ 'name': '中标候选人公示', 'type': '', 'ftype': '37', 'files': [] },
				{ 'name': '中/落标结果通知', 'ftype': '25', 'isMust': '1', 'selSupplier': '' },
				{ 'name': '中标人报价盖章件', 'type': '', 'ftype': '43', 'files': [], extFilters: ['pdf'] },
				{ 'name': '评委抽取表', 'type': '', 'ftype': '35', 'files': [], isSingle: true },
			]
		}
	]
	initBiddingData = [
		{
			'name': '开标前资料',
			'type': 'kbqzl',
			'child': [{ 'name': '招标公告', 'type': '', 'ftype': '9', 'files': [] },
			{ 'name': '招标文件', 'type': '', 'ftype': '34', 'files': [] },
			{ 'name': '招标文件澄清', 'type': '', 'ftype': '55', 'files': [] },
			{ 'name': '答疑会纪要', 'type': '', 'ftype': '56', 'files': [] }]
		},
		{
			'name': '评审过程资料',
			'type': 'psgczl',
			'child': [
				{ 'name': '投标文件', 'type': '', 'ftype': '39', 'selSupplier': [] },
				{ 'name': '评审项汇总', 'type': '', 'ftype': '60' },
				{ 'name': '价格修正', 'type': '', 'ftype': '61' },
				{ 'name': '评标汇总', 'type': '', 'ftype': '62' },
				{ 'name': '评标报告', 'type': '', 'ftype': '36', 'files': [], 'isMust': '1', isSingle: true, extFilters: ['pdf'] },
				{ 'name': '评审澄清', 'type': '', 'ftype': '57', 'files': [] },
				{ 'name': '中标候选人推荐表', 'type': '', 'ftype': '42', 'files': [], isSingle: true, extFilters: ['pdf'] },
			]
		},
		{
			'name': '定标资料',
			'type': 'dbzl',
			'child': [{ 'name': '中标候选人公示', 'type': '', 'ftype': '37', 'files': [] },
			{ 'name': '中标结果公告', 'type': '', 'ftype': '38', 'files': [] },
			{ 'name': '中/落标结果通知', 'ftype': '25', 'isMust': '1', 'selSupplier': '' },
			{ 'name': '中标人报价盖章件', 'type': '', 'ftype': '43', 'files': [], extFilters: ['pdf'] },
			{ 'name': '评委抽取表', 'type': '', 'ftype': '35', 'files': [], isSingle: true }]
		}
	];
	initBidData = [
		{
			'name': '采购报价资料',
			'type': 'cgbjzl',
			'child': [{ 'name': '采购公告', 'type': '', 'ftype': '9', 'files': [] },
			{ 'name': '采购文件', 'type': '', 'ftype': '12', 'files': [] },
			{ 'name': '采购文件答复', 'type': '', 'ftype': '11', 'files': [] }]
		},
		{
			'name': '评审过程资料',
			'type': 'psgczl',
			'child': [
				{ 'name': '报价文件', 'type': '', 'ftype': '22', 'selSupplier': [] },
				{ 'name': '评审项汇总', 'type': '', 'ftype': '63' },
				{ 'name': '价格评审', 'type': '', 'ftype': '64' },
				{ 'name': '评审汇总', 'type': '', 'ftype': '65' },
				{ 'name': '评审报告', 'type': '', 'ftype': '15', 'files': [], 'isMust': '1', isSingle: true, extFilters: ['pdf'] },
				{ 'name': '评审澄清', 'type': '', 'ftype': '17', 'files': [] },
				{ 'name': '中选候选人推荐表', 'type': '', 'ftype': '30', 'files': [], isSingle: true, extFilters: ['pdf'] }
			]
		},
		{
			'name': '定选资料',
			'type': 'dxzl',
			'child': [{ 'name': '中选候选人公示', 'type': '', 'ftype': '31', 'files': [] },
			{ 'name': '采购结果公告', 'type': '', 'ftype': '32', 'files': [] },
			{ 'name': '中/落选结果通知', 'ftype': '25', 'isMust': '1', 'selSupplier': [] },
			{ 'name': '中选人报价盖章件', 'type': '', 'ftype': '43', 'files': [], extFilters: ['pdf'] },
			{ 'name': '价格谈判记录', 'type': '', 'ftype': '16', 'files': [], extFilters: ['pdf', 'zip', 'rar'] }]
		}
	];
	if (tenderType == 0 || tenderType == 6) {
		$('#tenderType6').show();
		$('#tenderType4').html('').hide();
		var newArr = initBidData.concat(publicData)
		initData = JSON.parse(JSON.stringify(newArr));
	} else if (tenderType == 4) {
		$('#tenderType4').show();
		$('#tenderType6').html('').hide();
		var initBaseData = initBiddingData;
		if (processType == 2) {
			initBaseData = initOfflineBiddingData;
		}
		var newArr = initBaseData.concat(publicData)
		initData = JSON.parse(JSON.stringify(newArr));
	}
	// getDetail()
	//关闭当前窗口
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//上传
	$('#DataPush').on('click', '.btnUpload', function () {
		$(this).closest('td').find('input[type="file"]').trigger('click')
	});
	//下载
	$('#DataPush').on('click', '.btn_load', function () {
		var ftpPath = $(this).attr('data_url');
		var ftpName = $(this).attr('data_name');
		var newUrl = dowoloadFileUrl + '?ftpPath=' + ftpPath + '&fname=' + ftpName
		window.location.href = $.parserUrlForToken(newUrl);
	});
	//删除
	$('#DataPush').on('click', '.remove', function () {
		var fileId = $(this).attr('data-id');
		var postUrl = deleteFileUrl;
		if (tenderType == 4) {
			postUrl = deleteBidFileUrl;
		}
		parent.layer.confirm('确定要删除该附件', {
			btn: ['是', '否'] //可以无限个按钮
		}, function (indexs, layero) {
			parent.layer.close(indexs);
			$.ajax({
				type: "post",
				url: postUrl,
				async: false,
				dataType: 'json',
				data: {
					"deliveryFileId": fileId,
				},
				success: function (data) {
					if (data.success) {
						getDetail(false, false);
					} else {
						parent.layer.alert(data.message)
					}
				}
			});
		}, function (indexs) {
			parent.layer.close(indexs)
		});
	});
	getDetail(true, true);

});
function passMessage(callback) {
	$('#btn_submit').click(function () {
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
		if (checkedCount > 0) {
			if (tenderType == 4) {
				endData = Date.parse(new Date(pushData.bidOpenDateStr.replace(/\-/g, "/")));
				if (nowDate < endData) {
					top.layer.alert('开标时间前无法推送！');
				}
			} else {
				endData = Date.parse(new Date(pushData.bidEndDatea.replace(/\-/g, "/")));
				if (nowDate < endData) {
					top.layer.alert('报价截止时间前无法推送！');
					return
				}
			}
			var itemEle = $('.itemBox:checked');
			var summaryEle = $('.summaryBox:checked');
			var ftypes = [];
			for (var i = 0; i < initData.length; i++) {
				var item = initData[i];
				if (item.child) {
					for (var m = 0; m < item.child.length; m++) {
						for (var e = 0; e < itemEle.length; e++) {
							var ftype = $(itemEle).eq(e).attr('data-ftype');
							if (item.child[m].ftype == ftype) {
								if (ftype == '25' || ftype == '39' || ftype == '22') {
									for (var y = 0; y < selSupplier.length; y++) {
										if (ftype == '25') {
											var hasWinNotice = false, hasFailNotice = false;
											if (selSupplier[y].attachments.length > 0) {
												for (var t = 0; t < selSupplier[y].attachments.length; t++) {
													if (selSupplier[y].isWin == 1) {
														if (selSupplier[y].attachments[t].ftype == '23') {//有中标通知书
															hasWinNotice = true;
														}
														if (!hasWinNotice) {
															tips = '请上传' + selSupplier[y].supplierName + '的' + (tenderType == 4 ? '中选通知书' : '中标通知书') + '!'
														}
													} else {
														if (selSupplier[y].attachments[t].ftype == '24') {//有落标通知书
															hasFailNotice = true;
														}
														if (!hasFailNotice) {
															tips = '请上传' + selSupplier[y].supplierName + '的' + (tenderType == 4 ? '落选通知书' : '结果通知书') + '!'
														}
													}
												}
											} else {
												tips = '请上传' + selSupplier[y].supplierName + '的' + (tenderType == 4 ? '落选通知书' : '结果通知书') + '!';
											}

											if (!hasWinNotice && !hasFailNotice) {
												canPush = false;
												break
											} else {
												pushData.selSupplier = selSupplier;
												pushData.calibrateDetail = 1;
											}
										} else {
											pushData.selSupplier = selSupplier;
											pushData.reviewDetail = 1;
										}
									}
								}
								else if (ftype == '60' || ftype == '61' || ftype == '62') {
									// 招标
									ftypes.push(ftype);
								}
								else if (ftype == '63' || ftype == '64' || ftype == '65') {
									// 非招标
									ftypes.push(ftype);
								}
								else if (ftype == '72') {
									// 招标线下项目
									ftypes.push(ftype);
								}
								else {
									if (item.child[m].isMust == 1 && item.child[m].files.length == 0) {//选中的为必填项但没有文件时不能推送
										canPush = false;
										tips = '请上传' + item.child[m].name + '!';
										break
									}
									pushFiles = pushFiles.concat(item.child[m].files);
									if (item.type == 'kbqzl' || item.type == 'cgbjzl') {
										pushData.openingDetail = 1;
									}
									if (item.type == 'psgczl') {
										pushData.reviewDetail = 1;
									}
									if (item.type == 'dbzl') {
										pushData.calibrateDetail = 1;
									}
								}
							}
						}
					}
				} else {//其它资料
					if ($('#qtfj').is(':checked')) {
						pushFiles = pushFiles.concat(initData[initData.length - 1].files);
						pushData.otherDetail = 1;
					}
				}
			}
		} else {
			top.layer.alert('请先选择需要推送的数据！');
			return
		}
		if (!canPush) {
			top.layer.alert(tips);
			return
		}
		pushData.deliveryFiles = pushFiles;
		pushData.ftypes = ftypes;
		pushAll(pushData);
	});
	/******************            推送               *******************  */
	function pushAll(arr) {
		arr.tenderType = tenderType;
		arr.processType = processType;
		var postUrl = pushUrl;
		if (tenderType == 4) {
			postUrl = bidPushUrl;
		}
		top.layer.confirm('确定推送?', { icon: 3, title: '询问' }, function (ind) {
			layer.close(ind);
			$.ajax({
				type: "post",
				url: postUrl,
				async: true,
				data: arr,
				success: function (data) {
					if (data.success) {
						if (callback) {
							callback()
						}
						parent.layer.alert('推送成功！');
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					} else {
						parent.layer.alert(data.message)
					}

				}
			});
		});

	};
}

/********               数据详情           ************/
//是否刷新项目信息
function getDetail(isRefresh, isRebuild) {
	var postUrl = '', postData = {};
	if (tenderType == 4) {
		postUrl = biddingDetailUrl;
		postData = {
			'packageId': packageId,
			'processType': processType,
		};
	} else {
		postUrl = detailUrl;
		postData = {
			'packageId': packageId,
			'projectId': projectId,
			'tenderType': tenderType,
			'organNo': organNo,
			'processType': processType
		};

	}
	if (!isRebuild) {
		postData.isUpdateFile = 1
	}
	$.ajax({
		type: "post",
		url: postUrl,
		async: true,
		data: postData,
		success: function (data) {
			if (data.success) {
				if (data.data) {
					var arr = data.data || {};
					if (tenderType == 4) {
						// 招标项目后端取examType有问题，现固定为2
						arr.examType = 2;
					}
					if (arr.id) {
						id = arr.id;
					}
					if (isRefresh) {
						for (var key in arr) {
							if (key == 'isPublic') {
								if (tenderType != 4) {
									if (arr[key] == 0) {
										$('#isPublic').html('所有供应商');
										$('.isPublic').html('公告发布时间');
									} else if (arr[key] == 1) {
										$('#isPublic').html('所有本公司认证供应商');
										$('.isPublic').html('公告发布时间');
									} else if (arr[key] == 2) {
										$('#isPublic').html('仅限邀请供应商');
										$('.isPublic').html('邀请函发出时间');
									} else if (arr[key] == 3) {
										$('#isPublic').html('仅邀请本公司认证供应商');
										$('.isPublic').html('邀请函发出时间');
									}
								}
							} else if (key == 'examType') {
								if (tenderType == 4) {//招标
									$('#examType').html(arr[key] == 1 ? '预审' : '后审');
								} else {
									$('#examType').html(arr[key] == 1 ? '后审' : '预审');
								}

							} else if (key == 'tenderMode') {
								if (arr[key] == 1) {
									$('#tenderMode').html('公开招标');
									$('.tenderMode').html('公告发布时间')
								} else if (arr[key] == 2) {
									$('#tenderMode').html('邀请招标');
									$('.tenderMode').html('邀请函发出时间')
								}

							} else {
								$('#' + key).html(arr[key]);
							}
						}
						$('#getFileData').html(arr.ansSengDatea);
					} else {
						initData = [];
						if (tenderType == 0 || tenderType == 6) {
							var newArr = initBidData.concat(publicData)
							initData = JSON.parse(JSON.stringify(newArr));
						} else if (tenderType == 4) {
							var initBaseData = initBiddingData;
							if (processType == 2) {
								initBaseData = initOfflineBiddingData;
							}
							var newArr = initBaseData.concat(publicData)
							initData = JSON.parse(JSON.stringify(newArr));
						}
					}

					//展示前处理文件
					if (arr.deliveryFiles && arr.deliveryFiles.length > 0) {
						for (var i = 0; i < arr.deliveryFiles.length; i++) {
							for (var a = 0; a < initData.length; a++) {
								var item = initData[a];
								if (item.child) {
									for (var m = 0; m < item.child.length; m++) {
										var ftype = item.child[m].ftype;
										if (ftype == '25' || ftype == '22' || ftype == '39') {
											initData[a].child[m].selSupplier = arr.selSupplier;
										}
										else if (ftype == '60' || ftype == '61' || ftype == '62') {
											// 招标
										}
										else if (ftype == '63' || ftype == '64' || ftype == '65') {
											// 非招标
										}
										else if (ftype == '72') {
											// 招标线下项目
										}
										else {
											if (arr.deliveryFiles[i].ftype == ftype) {
												initData[a].child[m].files.push(arr.deliveryFiles[i]);
											}
										}
									}
								} else {
									if (arr.deliveryFiles[i].ftype == item.ftype) {
										initData[a].files.push(arr.deliveryFiles[i]);
									}
								}
							}
						}
					};
					pushData = arr;
					console.log('pushData >> ', pushData, initData);
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
function setHtml(data) {
	$('#pushBox').html('');
	var html = '';
	var taskQueues = [];
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		html += '<table class="table table-bordered" align="center">'
		html += '<tr>'
		html += '<td colspan="4" style="font-weight: bold;background-color: #d3e5fc"><input type="checkbox" class="summaryBox" data-ftype="' + (i == (data.length - 1) ? item.type : '') + '" data-type="' + item.type + '" id="' + item.type + '" style="vertical-align: -2px;" />' + item.name + (i == 0 ? '(<span class="red">' + (tenderType == 4 ? ('开标时间：' + pushData.bidOpenDateStr) : ('报价截止时间：' + pushData.bidEndDatea)) + '</span>)' : "") + '</td>'
		html += '</tr>'
		if (item.child) {
			for (var m = 0; m < item.child.length; m++) {
				var ftype = item.child[m].ftype;
				html += '<tr>'
				html += '<td  class="th_bg" ><input type="checkbox" class="' + item.type + ' itemBox" data-ftype="' + item.child[m].ftype + '" data-item="' + item.type + '" style="vertical-align: -2px;" />' + item.child[m].name + (item.child[m].isMust == 1 ? '<span class="red">*</span>' : '') + '</td>'
				html += '<td colspan="3">'
				// 线下项目
				if (ftype == '25' && processType == 2) {
					var id = 'ftype_' + ftype;
					html += '<div id="' + id + '"></div>';
					var bindBidderTable = bidderTable.bind(this, item.child[m].selSupplier, ftype)
					taskQueues.push(function() {
						document.getElementById(id).innerHTML = bindBidderTable();
					});
				} else if (ftype == '25' || ftype == '22' || ftype == '39') {
					if (item.child[m].selSupplier && item.child[m].selSupplier.length > 0) {
						html += bidderTable(item.child[m].selSupplier, ftype)
					}
				}
				// 招标 
				else if (ftype == '60' || ftype == '61' || ftype == '62') {
					var id = 'ftype_' + ftype;
					html += '<div id="' + id + '"></div>';
					taskQueues.push(formatBidingReviewView.bind(this, ftype, id));
				}
				// 非招标
				else if (ftype == '63' || ftype == '64' || ftype == '65') {
					var id = 'ftype_' + ftype;
					html += '<div id="' + id + '"></div>';
					taskQueues.push(formatNonBidingReviewView.bind(this, ftype, id));
				}
				// 招标线下项目
				else if (ftype == '72') {
					var id = 'ftype_' + ftype;
					html += '<div id="' + id + '"></div>';
					taskQueues.push(formatOfflineBiddingView.bind(this, ftype, id));
				}
				else {
					html += "<button type='button' data-index='" + ftype + "'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
						" style='text-decoration:none;margin-right:10px;'>上传</button>";
					if (item.child[m].extFilters) {
						var arr = []
						for (var f = 0; f < item.child[m].extFilters.length; f++) {
							arr.push(item.child[m].extFilters[f].slice(0, 0).concat('.', item.child[m].extFilters[f]));
						}
						var extFilters = arr.join(',');
						html += '<input type="file" name="files" accept="' + extFilters + '" single id="btnUpload' + item.child[m].ftype + '" onchange=Excel(this,\"' + item.child[m].name + '\",\"' + item.child[m].ftype + '\")>';
					} else {
						html += '<input type="file" name="files" single id="btnUpload' + item.child[m].ftype + '" onchange=Excel(this,\"' + item.child[m].name + '\",\"' + item.child[m].ftype + '\")>';
					}
					html += '<div class="row">'
					html += fileHtml(item.child[m].files);
					html += '</div>'
				}
				html += '</td>'
				html += '</tr>'
			}
		} else {
			html += '<tr>'
			// html += '<td  class="th_bg" ><input type="checkbox" class="'+item.type+' itemBox" data-item="'+item.type+'" />'+item.name+'</td>'
			html += '<td colspan="4">'
			html += "<button type='button' data-index='" + item.ftype + "'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
				" style='text-decoration:none;margin-right:10px;'>上传</button>";
			if (item.extFilters) {
				var arr = []
				for (var f = 0; f < item.extFilters.length; f++) {
					arr.push(item.extFilters[f].slice(0, 0).concat('.', item.extFilters[f]));
				}
				var extFilters = arr.join(',');
				html += '<input type="file" name="files"  accept="' + extFilters + '" single id="btnUpload' + item.ftype + '" onchange=Excel(this,\"' + item.name + '\",\"' + item.ftype + '\")>';
			} else {
				html += '<input type="file" name="files" single id="btnUpload' + item.ftype + '" onchange=Excel(this,\"' + item.name + '\",\"' + item.ftype + '\")>';
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
	for (var i = 0; i < taskQueues.length; i++) {
		try {
			taskQueues[i]();
		} catch (error) {
			console.error(error);
		}
	}
	for (var w = 0; w < data.length; w++) {
		var item = data[w];
		if (item.child) {
			for (var e = 0; e < item.child.length; e++) {
				var eleSlect = "fileUp_" + w + "_" + e;
				var eleCont = "fileContent_" + w + "_" + e;
				// fileUpload(eleSlect, eleCont, id, w, e);
			}
		} else {
			var eleSlect = "fileUp_" + w;
			var eleCont = "fileContent_" + w;
			// fileUpload(eleSlect, eleCont, id, w);
		}
	}

};
//中/落选结果通知的投标人列表
function bidderTable(data, type) {
	var html = '';
	html += '<table class="table table-bordered"><tr><th style="text-align: center;">序号</th>';
	html += '<th>供应商名称</th>';
	html += '<th style="text-align: center;">统一社会信用代码</th>';
	if (type == '25') {
		html += '<th style="text-align: center;">报价金额（元' + (projectType == 3? '人民币' : '') + '）</th>';
		html += '<th style="text-align: center;">是否中标</th>';
		html += '<th style="text-align: center;">中标金额（元' + (projectType == 3? '人民币' : '') + '）</th>';
		html += '<th><span class="red">*</span>结果通知书（<span class="red">限pdf文件，最大500MB</span>）</th>';
		html += '<th>技术方案</th>';
	} else if (type == '22' || type == '39') {
		if (type == '22') {
			html += '<th>报价文件</th>';
		} else {
			html += '<th>投标文件</th>';
		}
	}
	html += '</tr>';
	for (var i = 0; i < data.length; i++) {
		html += '<tr><td style="text-align: center;">' + (i + 1) + '</td>';
		html += '<td>' + data[i].supplierName + '</td>';
		html += '<td style="text-align: center;">' + data[i].socialCreditcode + '</td>';
		if (type == '25') {
			html += '<td style="text-align: center;">' + (data[i].openPrice ? data[i].openPrice : "") + '</td>';
			html += '<td style="text-align: center;">' + (data[i].isWin == 1 ? '是' : '否') + '</td>';
			html += '<td style="text-align: center;">' + (data[i].isWin == 1 ? data[i].winPrice : '/') + '</td>';
		}

		var planFile = [], winFile = [], failFile = [], bidderFile = [];//技术方案、中选通知书、落选通知书
		if (data[i].attachments && data[i].attachments.length > 0) {
			var noticeFile = data[i].attachments;//投标人、供应商的通知书附件
			for (var w = 0; w < noticeFile.length; w++) {
				if (noticeFile[w].ftype == '21') {//技术方案
					planFile.push(noticeFile[w]);
				} else if (noticeFile[w].ftype == '23') {
					winFile.push(noticeFile[w]);
				} else if (noticeFile[w].ftype == '24') {
					failFile.push(noticeFile[w]);
				} else if (noticeFile[w].ftype == '22' || noticeFile[w].ftype == '39') {
					bidderFile.push(noticeFile[w]);
				}
			}
		}
		if (type == '25') {
			html += '<td>';
			if ((data[i].isWin == 1 && winFile.length == 0) || ((!data[i].isWin || data[i].isWin == 0) && failFile.length == 0)) {
				html += "<button type='button' data-index='" + (data[i].isWin == 1 ? '23' : '24') + "'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
					" style='text-decoration:none;margin-right:10px;'>" + (data[i].isWin == 1 ? '上传中' + (tenderType == 4 ? '标' : '选') + '通知书' : '上传落' + (tenderType == 4 ? '标' : '选') + '通知书') + "</button>";
				html += '<input type="file" name="files" accept="application/pdf" single id="btnUpload' + (data[i].isWin == 1 ? '23' : '24') + '" onchange=Excel(this,"通知书",\"' + (data[i].isWin == 1 ? '23' : '24') + '\",\"' + i + '\")>';
			} else {
				html += '<div style="margin-bottom:20px;" data_url="' + (data[i].isWin == 1 ? winFile[0].ftpPath : failFile[0].ftpPath) + '">';
				html += '<div style="margin-right:30px;float:left;">' + (data[i].isWin == 1 ? winFile[0].name : failFile[0].name) + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + (data[i].isWin == 1 ? winFile[0].ftpPath : failFile[0].ftpPath) + '" data_name="' + (data[i].isWin == 1 ? winFile[0].name : failFile[0].name) + '">下载</a>';
				html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" class="btnDel remove" data-id="' + (data[i].isWin == 1 ? winFile[0].id : failFile[0].id) + '">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
			}
			html += '</td>'
			html += '<td>';
			if (planFile.length > 0) {
				html += '<div style="margin-bottom:20px;" data_url="' + planFile[0].ftpPath + '">';
				html += '<div style="margin-right:30px;float:left;">' + planFile[0].name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + planFile[0].ftpPath + '" data_name="' + planFile[0].name + '">下载</a>';
				html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="' + (planFile[0].id ? planFile[0].id : '') + '" class="btnDel remove">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
			} else {
				html += "<button type='button' data-index='21'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
					" style='text-decoration:none;margin-right:10px;'>上传技术方案</button>";
				html += '<input type="file" name="files" single id="btnUpload21" onchange=Excel(this,"技术方案",21,\"' + i + '\")>';
			}
			html += '</td>'
		} else {
			html += '<td>';
			if (bidderFile.length > 0) {
				html += '<div style="margin-bottom:20px;" data_url="' + bidderFile[0].ftpPath + '">';
				html += '<div style="margin-right:30px;float:left;">' + bidderFile[0].name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + bidderFile[0].ftpPath + '" data_name="' + bidderFile[0].name + '">下载</a>';
				html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="' + (bidderFile[0].id ? bidderFile[0].id : '') + '" class="btnDel remove">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
			} else {
				html += "<button type='button' data-index='21'  class='btn-xs btn btn-primary fileinput-button btnUpload'" +
					" style='text-decoration:none;margin-right:10px;'>上传" + (type == '22' ? '报价文件' : '投标文件') + "</button>";
				html += '<input type="file" name="files" single id="btnUpload' + type + '" onchange=Excel(this,"投标",\"' + type + '\",\"' + i + '\")>';
			}
			html += '</td>'
		}
	}
	html += '</table>';
	return html
}
//文件展示
function fileHtml(data) {
	var html = '';
	if (data.length > 0) {
		for (var i = 0; i < data.length; i++) {
			html += '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 keep" style="margin-bottom:20px;" data_url="' + data[i].ftpPath + '">';
			html += '<div style="margin-right:30px;float:left;">' + data[i].name + '</div>'
			html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].ftpPath + '" data_name="' + data[i].name + '">下载</a>';
			html += '<a style="cursor: pointer;color:#BB2413;margin-left:20px;" data-id="' + data[i].id + '" class="btnDel remove">移除</a></div>'
			html += '<div style="clear:both;"></div></div>';
		}
	}
	return html
}
/***************               数据展示  --end           ************/
/***************                个分类的全选                 ***************/
//选中、取消全选
$('body').on('click', '.summaryBox', function () {
	var clickType = $(this).attr('data-type');
	if (clickType != 'qtfj') {
		//查看当前全选是否选中
		var status = this.checked;
		//根据status来设置其它多选框的状态
		$('.' + clickType).prop('checked', status);
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
$('body').on('click', '.itemBox', function () {
	var clickType = $(this).attr('data-item');
	//获取被选中的元素的数量
	var checkedCount = $('.' + clickType + ':checked').length;
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
$('body').on('click', '#choseAll', function () {
	//查看当前全选是否选中
	var status = this.checked;
	//根据status来设置其它多选框的状态
	$('.summaryBox, .itemBox').prop('checked', status);
	showPushNumber();
});
/***************                个分类的全选 --end                ***************/
/*****************           上传           ********************/
/* eleSlect  文件选择DIV的ID   eleCont 文件显示容器的ID  id 数据id,用于存储文件

 */
function fileUpload(eleSlect, eleCont, id, index, ind) {
	var config = {
		multipleFiles: true, /** 多个文件一起上传, 默认: false */
		swfURL: "/swf/FlashUploader.swf", /** SWF文件的位置 */
		//  	tokenURL : "/tk", /** 根据文件名、大小等信息获取Token的URI（用于生成断点续传、跨域的令牌） */
		frmUploadURL: flashFileUrl, /** Flash上传的URI */
		filesQueueHeight: 0, /** 文件上传容器的高度（px）, 默认: 450 */
		messagerId: '',//显示消息元素ID(customered=false时有效)
		uploadURL: fileUrl, /** HTML5上传的URI */
		browseFileId: eleSlect,//文件选择DIV的ID
		filesQueueId: eleCont,//文件显示容器的ID(customered=false时有效)
		autoUploading: true,//选择文件后是否自动上传
		autoRemoveCompleted: true,//文件上传后是否移除
		//	    extFilters: ['.pdf','.PDF','.doc','.docx'],
		postVarsPerFile: {
			//自定义文件保存路径前缀
			Token: $.getToken(),
			// basePath: "/"+registerInfo.enterpriseId+"/"+bidSectionId+"/"+id+"/701"
		},
		onRepeatedFile: function (file) {
			parent.layer.alert("文件： " + file.name + " 已存在于上传队列中，请勿重复上传！")
			return flase;
		},
		onComplete: function (file) {
			var path = JSON.parse(file.msg).data.filePath;
			var type = path.split('.')[1];
			var html = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="' + path + '" data_id="' + id + '" data_stage="' + stage + '" data_type="' + (gdBackType == 1 ? "3" : "1") + '" data_name="' + file.name + '">';
			html += '<div style="margin-right:30px;float:left;">' + file.name + '</div>'
			html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + path + '" data_name="' + file.name + '">下载</a>';
			/* if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
				html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
			} */
			html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel remove_' + index + '" data-index="' + index + '">移除</a></div>'
			html += '<div style="clear:both;"></div></div>';
			$('.contant_' + index).append(html)
		}
	};
	var _t = new Stream(config);
};
function showPushNumber() {
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
		if (fileType == '23' || fileType == '24' || fileType == '21' || fileType == '22' || fileType == '39') {
			formFile.append("supplierId", selSupplier[_i].supplierId);
		}
		formFile.append("files", obj.files[0]);//单个上传
		/* for (var i = 0; i < obj.files.length; i++) {
			formFile.append("files", obj.files[i]); //加入文件对象
		} */
		var fileName = obj.files[0].name;
		var suffix = fileName.substring(fileName.lastIndexOf(".")).split('.')[1];
		fileSize = obj.files[0].size / 1024 / 1024;
		if (fileType == '23' || fileType == '24') {
			if (fileSize > 500) {
				top.layer.alert('上传文件大小不超过500M');
				return
			}
			if (suffix != 'pdf' && suffix != 'PDF') {
				top.layer.alert('请上传pdf文件');
				return
			}
		} else if (fileType == '21') {
			if (fileSize > 500) {
				top.layer.alert('上传文件大小不超过500M');
				return
			}
		} else {
			for (var i = 0; i < initData.length; i++) {
				var item = initData[i];
				if (item.child) {
					for (var m = 0; m < item.child.length; m++) {
						if (item.child[m].ftype == fileType) {
							nowType = item.child[m];
						}
					}
				}
			}
			if (nowType.isSingle) {
				if ($(obj).closest('td').find('.keep').length > 0) {
					top.layer.alert('只能上传一个文件');
					return
				}
			}
			if (nowType.extFilters && nowType.extFilters.indexOf(suffix) < 0) {
				var tips = nowType.extFilters.join('、')
				top.layer.alert('只能上传' + tips + '类型文件');
				return
			}
			// nowType.size && Number(nowType.size)
			if (500 < fileSize) {
				top.layer.alert('上传文件大小不超过' + nowType.size + 'M');
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
					if (tenderType == 4) {
						saveBidFiles(response.data, function () {
							parent.layer.alert("上传成功");
							getDetail(false, true);
						})
					} else {
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
function saveBidFiles(obj, callback) {
	$.ajax({
		type: "post",
		url: saveBidFileUrl,
		async: true,
		data: obj,
		success: function (data) {
			if (data.success) {
				callback()
			} else {
				parent.layer.alert(data.message)
			}

		}
	});
}

/******************* Start 非招标 ************************ */
var nonBidingProjectInfo
function formatNonBidingReviewView(ftype, id) {
	var projectId = pushData.projectId;
	var packageId = pushData.packageId;
	var examType = pushData.examType;
	var tenderType = pushData.tenderType;
	var el = $('#' + id);
	if (!nonBidingProjectInfo) {
		var projectReviewInfoUrl = top.config.AuctionHost + "/ManagerCheckController/findManagerCheckProgress.do";
		$.ajax({
			type: "get",
			url: projectReviewInfoUrl,
			data: {
				projectId: projectId,
				packageId: packageId,
				examType: examType
			},
			async: false,
			success: function (res) {
				if (res.success) {
					nonBidingProjectInfo = res.data;
				}
			}
		});
	}
	var checkPlan = nonBidingProjectInfo.checkPlan;
	// 评审项汇总
	if (ftype == '63') {
		var tabWrapDiv = $('<div class="tab-wrap" id="tab_' + id + '"></div>');
		var tableId = 'table_' + id;
		var $table = $('<div class="table-wrap" style="margin-top: 6px;"><table class="table table-bordered" id="' + tableId + '"></table></div>');
		var getDetail = function (preItem, packageCheck) {
			var getSupplierForManagerUrl = top.config.AuctionHost + "/ManagerCheckController/getSupplierForManager.do";
			$.ajax({
				type: "post",
				url: getSupplierForManagerUrl,
				data: {
					projectId: projectId,
					packageId: packageId,
					examType: examType,
					prePackageCheckListId: preItem.id || '',
					packageCheckListId: packageCheck.id || '',
				},
				success: function (res) {
					if (res.success) {
						var data = res.data || {};
						var tableDiv = $('#' + tableId);
						tableDiv.bootstrapTable('destroy');
						if (data.checkType == 4) {
							tableDiv.bootstrapTable({
								pagination: false,
								undefinedText: "",
								// height: auto,
								data: data.bidPriceSuppliers,
								columns: [{
									title: '序号',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										return index + 1;
									}
								}, {
									field: 'supplierName',
									title: '供应商名称',
									align: 'center'
								}, {
									field: 'priceTotal',
									title: '报价总价',
									align: 'right'
								}, {
									field: 'joinBidprice',
									title: '参与竞价',
									width: '50px',
									align: 'center',
									formatter: function (value, row, index) {
										if (!data.bidPrice) {
											return '<input type="checkbox" data-price=' + row.priceTotal + ' data-supplier="' + row.supplierId + '" ' +
												((value == null || value == 1) && ' checked' || '') +
												(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
										} else {
											if (data.bidPrice.bidpriceStatus != 0 && !data.bidPrice.resultSubmited) {
												return '<input type="checkbox" data-price=' + row.priceTotal + ' data-supplier="' + row.supplierId + '" ' +
													((value == null || value == 1) && ' checked' || '') +
													(data.bidStartPriceFrom == 0 && ' onclick="reloadStartPrice()"' || '') + '>';
											} else {
												return value ? '参与' : '不参与'
											}

										}

									}
								}, {
									field: 'notJoinReason',
									title: '原因',
									formatter: function (value, row, index) {
										if (!data.bidPrice) {
											return !!value || ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
										} else {
											if (data.bidPrice.bidpriceStatus != 0 && !data.bidPrice.resultSubmited) {
												return ('<input type="text" class="reason form-control" value="' + (value || '') + '">');
											} else {
												return value
											}

										}
									}
								}]
							});
						} else {
							if (data.offers.length > 0) {
								var suppliers = data.offers;
								var packageCheckList = packageCheck;
								var cols = new Array();
								cols.push(
									{
										title: '序号',
										width: '50px',
										align: 'center',
										formatter: function (value, row, index) {
											return index + 1;
										}
									}, {
									field: 'enterpriseName',
									width: '500px',
									title: '供应商'
								})
								if (packageCheckList.checkType == 2 || packageCheckList.checkType == 0) {
									cols.push({
										field: 'deviateNum',
										width: '180px',
										title: packageCheckList.checkType == 2 ? '偏离项数' : '不合格关键项数',
									})
								}
								cols.push({
									field: 'isKeyScore',

									title: ((packageCheckList.checkType == 1 || packageCheckList.checkType == 3) ? '分值合计' : (packageCheckList.checkType == 2 ? '是否偏离' : '是否合格')),
									width: '120px',
									formatter: function (value, row, index) {
										var detaildivcenter = "";
										if (packageCheckList.checkType == 1 || packageCheckList.checkType == 3) {
											detaildivcenter = row.score
										} else if (packageCheckList.checkType == 2) {
											if (row.isKey == 0) {
												detaildivcenter = "未偏离"
											} else {
												detaildivcenter = "<span class='text-danger'>偏离</span>"
											}
										} else {
											if (row.isKey == 0) {
												detaildivcenter = "合格"
											} else {
												detaildivcenter = "<span class='text-danger'>不合格</span>"
											}
										}
										return detaildivcenter
									}

								})
								if (packageCheckList.checkType == 3) {
									cols.push({
										field: 'isOut',
										title: '是否淘汰',
										width: '80px',
										formatter: function (value, row, index) {
											var detaildivcenter = "";
											detaildivcenter = row.score
											if (row.isKey == 0) {
												detaildivcenter = "未淘汰"
											} else {
												detaildivcenter = "<span class='text-danger'>淘汰</span>"
											}

											return detaildivcenter
										}

									})

								}

								tableDiv.bootstrapTable({
									pagination: false,
									clickToSelect: true,
									undefinedText: "",
									data: suppliers,
									columns: cols,

								});
							}
						}

					}
				}
			});
		}
		var doView = function (reviewItems) {
			for (var i = 0; i < reviewItems.length; i++) {
				var reviewItem = reviewItems[i];
				var tabDiv = $('<button type="button" class="btn" style="margin-bottom: 6px;"> ' + reviewItem.checkName + ' </button>');
				var clickHandle = function (preItem, item) {
					getDetail(preItem, item);
					tabWrapDiv.find('.btn').each(function () {
						$(this).removeClass('btn-primary')
					})
					$(this).addClass('btn-primary');
				}
				clickHandle = clickHandle.bind(tabDiv, reviewItems[i - 1] || {}, reviewItem)
				tabDiv.on('click', clickHandle);
				tabWrapDiv.append(tabDiv);
				if (i === 0) {
					clickHandle({}, reviewItem);
				}
			}
			el.append(tabWrapDiv);
			el.append($table);
		}
		doView(nonBidingProjectInfo.packageCheckLists || [])
	}
	// 价格评审
	else if (ftype == '64') {
		var quotePriceUnit = '';
		$.ajax({
			url: top.config.AuctionHost + "/NegotiationController/findPriceList.do",
			dataType: 'json',
			data: {
				packageId: packageId
			},
			async: false,
			success: function (data) {
				if (!data.success) {
					return;
				};
				if (data.data && data.data.quotePriceUnit) {
					quotePriceUnit = (data.data.quotePriceName ? data.data.quotePriceName + "（" : "") + data.data.quotePriceUnit + (data.data.quotePriceName ? "）" : "");
				} else {
					quotePriceUnit = "元";
				};
			},
		});
		var tableId = 'table_' + id;
		var $table = $('<div><table id="' + tableId + '" class="table table-bordered"></table></div>');

		var packageInfo = nonBidingProjectInfo;
		var rule1 = false, rule2 = false;
		if (examType == 1) {
			$table = $('<div><div class="tenderTypeW" style="color: red;line-height: 22px;font-size:14px;">报价单位：<span>' + quotePriceUnit + '</span></div><table id="' + tableId + '" class="table table-bordered"></table></div>');
		}

		if (((tenderType == 0 && examType == 1) || tenderType == 6) && (packageInfo.checkPlan == 1 || packageInfo.checkPlan == 3 || packageInfo.checkPlan == 4)) {
			rule1 = true
		};
		if (((tenderType == 0 && examType == 1) || tenderType == 6) && (packageInfo.checkPlan == 2 || packageInfo.checkPlan == 0)) {
			rule2 = true
		};
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/ManagerCheckController/getPriceCheckInfoForManager.do",
			data: {
				projectId: projectId,
				packageId: packageId,
				checkPlan: checkPlan,
				examType: examType,
			},
			success: function (res) {
				if (!res.success) {
					return;
				}
				var data = res.data;
				var businessPriceSet = data.businessPriceSet;
				var priceChecks = data.priceChecks;
				var priceCheckMode = data.priceCheckMode;
				if (data) {
					//价格评审表格
					var columnList = [];
					columnList.push({
						field: '#', title: '序号', width: '50px',
						formatter: function (value, row, index) {
							return index + 1;
						}
					});
					columnList.push({ field: 'enterpriseName', title: '供应商', width: '150px' });
					columnList.push({
						field: 'isOut', title: '淘汰', align: 'center', width: '80px',
						formatter: function (value, row, index) {
							return value == 0 ? "<span type='text' id='isOut_" + row.supplierId + "' value='0'>否</span>" : "<span type='text' id='isOut_" + row.supplierId + "' value='1'>是</span>";
						}
					});
					columnList.push({
						field: 'saleTaxTotal', title: '报价总价', width: '150px',
						formatter: function (value, row, index) {
							if (row.isEvpOut) {
								return "<span class='red'>未解密</span>";
							} else {
								return "<span type='text' id='saleTaxTotal_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
							}

						}
					});
					if (!rule1 && !rule2) {
						columnList.push({
							field: 'baseCheckPrice', title: '评审基础价', width: '150px',
							formatter: function (value, row, index) {
								if (data.priceCheck == "未完成") {
									return '/';
								} else {
									return value;
								}
							}
						});
					};
					columnList.push({
						field: 'fixCount', title: '算术修正值', width: '100px',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								return '/';
							} else {
								return value;
							}
						}
					});
					columnList.push({
						field: 'fixFinalPrice', title: '修正后总价', width: '100px',
						formatter: function (value, row, index) {
							if (data.priceCheck == '未完成') {
								if (row.isOut == 0) {
									return "<span type='text' id='fixFinalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
								} else {
									return '/';
								}
							} else {
								return value;
							}

						}
					});
					if (rule2 || rule1) {
						columnList.push({
							field: 'baseCheckPrice', title: '评审基础价', width: '150px',
							formatter: function (value, row, index) {
								if (data.priceCheck == "未完成") {
									return '/';
								} else {
									return value;
								}
							}
						});
					}
					columnList.push({
						field: 'defaultItem', title: '缺漏项' + (checkPlan == 4 ? '减' : '加') + '价', width: '100px',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								return '/';
							} else {
								return value;
							}
						}
					});
					if (checkPlan == 1 || checkPlan == 4) {
						columnList.push({
							field: 'deviateNum', title: '计入总数偏离项数', width: '180px',
							formatter: function (value, row, index) {
								if (data.priceCheck == '未完成') {
									if (row.isOut == 0) {
										return "<span type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span>";

									} else {
										return "<span style='width:100%;display:none' type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span><span>/</span>";
									}
								} else {
									return value;
								}

							}
						});
					}
					if (checkPlan == 1 || checkPlan == 3 || checkPlan == 4) {
						columnList.push({
							field: 'deviatePrice', title: '偏离' + (checkPlan == 4 ? '减' : '加') + '价', width: '150px',
							formatter: function (value, row, index) {
								if (data.priceCheck == "未完成") {
									if (businessPriceSet.checkType == 0) {
										return '/';
									} else {
										if (row.isOut == 0) {
											return "<span type='text' id='deviatePrice_" + row.supplierId + "' value='" + (row.deviatePrice || 0) + "'>" + (row.deviatePrice || 0) + "</span>";
										} else {
											return "<span type='text' id='deviatePrice_" + row.supplierId + "' value=''>/</span>";
										}
									}
								} else {
									return value;
								}
							}
						});
					}
					columnList.push({
						field: 'totalCheck', title: '评审总价', width: '180px',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								if (row.isOut == 0) {
									return "<input type='text' style='width:100%' onchange='fixCount(\"" + 'totalCheck' + "\",\"" + row.supplierId + "\")' id='totalCheck_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'></input>";
								} else {
									return "<input type='hidden' id='totalCheck_" + row.supplierId + "' value=''></input><span>/</span>";
								}
							} else {
								return value;
							}
						}
					});
					if (checkPlan != 1 && checkPlan != 3 && checkPlan != 4) {
						columnList.push({
							field: 'score', title: '商务报价得分', width: '150px',
							formatter: function (value, row, index) {
								if (data.priceCheck == "未完成") {
									if (businessPriceSet.checkType == 0) {
										return '/';
									} else {
										if (row.isOut == 0) {
											return "<span style='width:100%' type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'>" + (row.score || '') + "</span>";
										} else {
											return '/';
										}
									}
								} else {
									return value;
								}
							}
						});
					}
					columnList.push({
						field: 'reason', title: '调整原因', width: '150px',
						formatter: function (value, row, index) {
							if (data.priceCheck == "未完成") {
								return '/';
							} else {
								return value;
							}
						}
					});
					columnList.push({
						field: 'finalDiscountPrice', title: '最终优惠价', width: '150px',
						formatter: function (value, row, index) {
							if (data.priceCheck == '未完成') {
								return '/';
							} else {
								return value;
							}

						}
					});
					//价格评审表格
					$("#" + tableId).bootstrapTable({
						columns: columnList
					});
					$("#" + tableId).bootstrapTable("load", priceChecks);
				}
			}
		});
		el.append($table);
	}
	// 评审汇总
	else if (ftype == '65') {
		var tableId = 'table_' + id;
		var $table = $('<div><table id="' + tableId + '" class="table table-bordered"></table></div>');
		var isStopCheck = nonBidingProjectInfo.isStopCheck;
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/ManagerCheckController/getCheckTotalForManager.do",
			data: {
				projectId: projectId,
				packageId: packageId,
				checkPlan: checkPlan,
				examType: examType,
			},
			async: true,
			success: function (data) {
				if (!data.success) {
					return
				}
				var orderOfferList = [];
				var CheckTotals = data.data;
				if (CheckTotals.orderOfferList) {
					orderOfferList = CheckTotals.orderOfferList;
				}
				//按钮控制
				if (CheckTotals) {
					//有评审记录时，暂时历史记录
					var checkItem;
					if (CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) {
						checkItem = CheckTotals.priceCheckItems;
					} else {
						checkItem = CheckTotals.priceChecks;
					}
					var colspan = [
						{
							field: '#',
							title: '序号',
							width: '50px',
							align: 'center',
							formatter: function (value, row, index) {
								return index + 1;
							}
						}, {
							field: 'enterpriseName',
							title: '供应商名称',
							width: '200px',
						},
						{
							field: 'isOut',
							title: '淘汰',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								return value == 1 ? "<span id='isOut_" + row.supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + row.supplierId + "' value='0'>否</sapn>";
							}
						}, {
							field: 'saleTaxTotal',
							title: '供应商报价',
							align: 'right',
							width: '150px',
							formatter: function (value, row, index) {
								if (row.isEvpOut) {
									return "<span class='red'>未解密</span>";
								} else {
									return "<span type='text'>" + (row.saleTaxTotal || '') + "</span>";
								}

							}
						}, {
							field: 'fixCount',
							title: '算术修正值',
							width: '120px',
						}, {
							field: 'fixFinalPrice',
							title: '修正后总价',
							align: 'right',
							width: '120px',
						},
						{
							field: 'defaultItem',
							title: '缺漏项' + (checkPlan == 4 ? '减' : '加') + '价',
							align: 'right',
							width: '100px',
						}
					]
					if (checkPlan == 1 || checkPlan == 4) {
						colspan.push(
							{
								field: 'deviateNum',
								title: '计入总数偏离项数',
								width: '150px'
							}
						)
					}
					colspan.push(
						{
							field: 'deviatePrice',
							title: '偏离' + (checkPlan == 4 ? '减' : '加') + '价',
							align: 'right',
							width: '150px'
						},
						{
							field: 'totalCheck',
							title: '评审总价',
							align: 'right',
							width: '150px'
						},
						{
							field: 'reason',
							title: '调整原因',
							width: '100px',
						},
						{
							field: 'supplierOrder',
							title: '排名',
							align: 'center',
							halign: 'center',
							width: '80px',
							formatter: function (value, row, index) {
								if (isStopCheck != 1) {
									if (CheckTotals.checkItem == '已完成') {
										if (row.isOut == 1) { //淘汰							
										} else {
											return value;
										}
									} else {
										if (row.isOut == 1) { //淘汰
											return "<input type='hidden' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/><span>/</span>";
										} else {

											return "<input type='text' class='supplierOrder' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/>";
										}

									}
								} else {
									return "<input type='hidden' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/><span>/</span>";
								}
							}
						},
						{
							field: 'isChoose',
							title: '候选人',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								if (isStopCheck != 1) {
									if (CheckTotals.checkItem == '已完成') {
										return value == 0 ? "否" : "是";
									} else {
										return '/'
									}
								} else {
									return '/'
								}
							}
						}
					)
					$("#" + tableId).bootstrapTable({
						detailView: !((checkPlan == 1 || checkPlan == 3 || checkPlan == 4) && examType == 1),
						columns: colspan,
						onExpandRow: function (index, row, $detail) {
							if (!((checkPlan == 1 || checkPlan == 3 || checkPlan == 4) && examType == 1)) {
								sonTable(index, row, $detail);
							}
						}
					});
					// 子表
					function sonTable(index, row, $detail) {
						var html = '';
						var checker = CheckTotals.experts || []; //评委
						var list = []
						for (var i = 0; i < CheckTotals.packageCheckLists.length; i++) {
							if (CheckTotals.packageCheckLists[i].checkType != 4) {
								list.push(CheckTotals.packageCheckLists[i])
							}
						}
						var priceChecks = (CheckTotals.priceChecks || []).find(v => v.supplierId === row.supplierId); //打分情况
						if (priceChecks) {
							priceChecks = [priceChecks];
							html += "<tbody><tr>";
							html += "<td style='text-align:left;width:200px'>供应商名称</td>";
							html += "<td style='text-align:center;width:120px'>评审项</td>";
							html += "<td style='text-align:center;width:300px'>评审内容</td>";
							for (var i = 0; i < checker.length; i++) {
								if (examType == 1) {
									html += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + checker[i].expertName + ")</td>";
								} else {
									html += "<td style='text-align:center' width='100px'>" + checker[i].expertName + "</td>";
								}

							}
							if (examType == 1) {
								html += "<td style='text-align:center' width='90px'>分项平均分</td>";
								html += "<td style='text-align:center' width='120px'>分项平均总得分</td>";
								html += "<td style='text-align:center' width='110px'>商务报价得分</td>";
								html += "<td style='text-align:center' width='75px'>淘汰</td>";
								html += "<td style='text-align:center' width='80px'>总分</td>";
								html += "<td style='text-align:center' width='70px'>排名</td>";
								html += "<td style='text-align:center' width='75px'>候选人</td>";
							} else {
								html += "<td style='text-align:center' width='70px'>结果</td>";
								html += "<td style='text-align:center' width='75px'>评审结果</td>";
							}

							//跨行条数
							var enterpriseRowspan = 0;
							for (var x = 0; x < list.length; x++) { //评审项
								enterpriseRowspan += (list[x].packageCheckItems || []).length;
								if (examType == 1) {
									if (list[x].checkType == 1 || list[x].checkType == 3) enterpriseRowspan++;
								}

							}
							if (examType == 1) {
								for (var i = 0; i < priceChecks.length; i++) {
									if (list && list.length > 0) {
										html += "<tr>";
										html += "<td style='text-align:left;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + priceChecks[i].enterpriseName + "</td>";
										for (var x = 0; x < list.length; x++) { //评审项
											var item = list[x].packageCheckItems || [];
											for (var z = 0; z < item.length; z++) { //评审内容
												if (z != 0) {
													html += "<tr>";
												};
												if (z == 0) {
													if (item.length == 1 && x != 0) {
														html += "<tr>";
													}
													html += "<td style='text-align:center;white-space:normal;word-break: break-all;'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + list[x].checkName + "</td>";
												};
												html += "<td style='text-align:left;white-space:normal;word-break: break-all;'>" + item[z].checkTitle + "</td>";
												for (var e = 0; e < checker.length; e++) { //评委
													//html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
													if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id]) != 'undefined' && typeof (priceChecks[i].expertScores[checker[e].id][item[z].id]) != "undefined") {
														html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												}

												if (list[x].checkType == 1 || list[x].checkType == 3) {
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] || '/') + "</td>";
														} else {
															html += "<td style='text-align:center'>/</td>";
														}
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												} else {
													if (list[x].checkType == 0) {
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "符合" : "不符合") + "</td>";
															} else {
																html += "<td style='text-align:center'>/</td>";
															}
														} else {
															html += "<td style='text-align:center'>/</td>";
														}
													} else if (list[x].checkType == 2) {
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "合格" : "不合格") + "</td>";
															} else {
																html += "<td style='text-align:center'>/</td>";
															}
														} else {
															html += "<td style='text-align:center'>/</td>";
														}
													}
												}

												if (z == 0) {
													if (list[x].checkType == 1 || list[x].checkType == 3) {//评分制
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																if (list[x].checkType == 3) {
																	var teps = Number(priceChecks[i].expertScores[list[x].id]);
																} else {
																	var teps = (Number(priceChecks[i].expertScores[list[x].id]) * Number((list[x].weight || "1")));
																}
																var tep = roundFun(teps, (top.prieNumber || 2));
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (tep || '/') + "</td>"
															} else {
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
															}
														} else {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													} else {//合格制

														if (list[x].checkType == 0) {
															if (priceChecks[i].expertScores) {
																if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																	html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "符合" : "不符合") + "</td>";
																} else {
																	html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
																}
															} else {
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
															}
														} else if (list[x].checkType == 2) {//偏离制
															if (priceChecks[i].expertScores) {
																if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																	html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "合格" : "不合格") + "</td>";
																} else {
																	html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
																}
															} else {
																html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
															}
														}
													}

												};
												if (z != 0) {
													html += "</tr>";
												} else {
													/*if(x==list.length-1&&item.length==1 && list[x].checkType == 1){
														html += "/<tr>";
													}*/

													if (item.length == 1 && x != 0) {
														html += "</tr>";
													}
												}
												if (x == 0 && z == 0) {
													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].score || '/') + "</td>";

													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isOut ? "<span id='isOut_" + priceChecks[i].supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + priceChecks[i].supplierId + "' value='0'>否</sapn>") + "</td>";
													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + (priceChecks[i].total || '') + "</sapn>" + "</td>";
													if (CheckTotals.checkItem == '已完成') {
														if (isStopCheck != 1) {
															if (priceChecks[i].isOut == 1) {
																html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">/</td>";
															} else {
																html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].supplierOrder || '') + "</td>";
															}
														} else {
															html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">/</td>";
														}
														html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isChoose ? "是" : "否") + "</td>";
													} else {
														if (isStopCheck != 1) {
															if (priceChecks[i].isOut == 1) { //1淘汰，0否

																html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' style='width:100%' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'>/</td>";

																html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' id='isChoose_" + priceChecks[i].supplierId + "' disabled='disabled'>/</td>";
															} else {

																html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='text' style='width:100%' class='supplierOrder' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'></td>";
																if (!isAgent || isAgent == 0) {//采购专区
																	html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "' checked></td>";
																} else {
																	if (i <= 2) {
																		html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "' checked></td>";
																	} else {
																		html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "'></td>";
																	}
																}


															}
														} else {

															html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' style='width:100%' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'>/</td>";
															html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' id='isChoose_" + priceChecks[i].supplierId + "' disabled='disabled'>/</td>";
														}
													}
													html += "</tr>";
												}
											}
											if (list[x].checkType == 1 || list[x].checkType == 3) {
												html += "<tr><td style='text-align:center'>得分</td>";
												for (var e = 0; e < checker.length; e++) {
													if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id]) != "undefined" && typeof (priceChecks[i].expertScores[checker[e].id][list[x].id]) != "undefined") {
														html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
													//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
												}

												if (priceChecks[i].expertScores) {
													html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
												//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
												html += "</tr>";
											}
										}
									}
								}
							} else {
								for (var i = 0; i < priceChecks.length; i++) {
									if (list && list.length > 0) {
										html += "<tr>";
										html += "<td style='text-align:center;'  " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + " >" + priceChecks[i].enterpriseName + "</td>";
										for (var x = 0; x < list.length; x++) { //评审项
											var item = list[x].packageCheckItems;
											for (var z = 0; z < item.length; z++) { //评审内容
												if (z != 0) {
													html += "<tr>"
												};
												if (z == 0) {
													if (item.length == 1 && x != 0) {
														html += "<tr>";
													}
													html += "<td style='text-align:center;white-space:normal;word-break: break-all;' rowspan='" + item.length + "'>" + list[x].checkName + "</td>";
												};

												html += "<td style='text-align:left;white-space:normal;word-break: break-all;'>" + item[z].checkTitle + "</td>";
												for (var e = 0; e < checker.length; e++) { //评委
													if (typeof (priceChecks[i].expertScores) != "undefined" && typeof (priceChecks[i].expertScores[checker[e].id]) != "undefined") {

														html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}

												}


												if (z == 0) {
													if (list[x].checkType == 1) {
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center' rowspan='" + item.length + "'>" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>"
															} else {
																html += "<td style='text-align:center' rowspan='" + item.length + "'>/</td>"
															}
														} else {
															html += "<td style='text-align:center' rowspan='" + item.length + "'>/</td>";
														}
													} else {
														if (priceChecks[i].expertScores != undefined) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center' rowspan='" + item.length + "'>" + (priceChecks[i].expertScores[list[x].id] == 0 ? "合格" : "不合格") + "</td>"
															} else {
																html += "<td style='text-align:center' rowspan='" + item.length + "'>/</td>";
															}

														} else {
															html += "<td style='text-align:center' rowspan='" + item.length + "'>/</td>";
														}

													}

												};
												if (z != 0) {

													html += "</tr>"
												} else {
													if (item.length == 1 && x != 0) {
														html += "</tr>";
													}
												}
												if (x == 0 && z == 0) {
													if (CheckTotals.checkItem == '已完成') {
														if (priceChecks[i].isOut == 1) {
															html += "<td style='text-align:center;'  value='1'  " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">不合格</td>";
														} else {
															html += "<td style='text-align:center;'  value='0'  " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">合格</td>";
														}
													} else {
														if (priceChecks[i].isOut == 0) {
															if (checkPlan == 1 || checkPlan == 4) { //有效数量
																html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input class='iso' type='checkbox' id='isChoose_" + priceChecks[i].supplierId + "' ></td>";
															} else {
																html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">合格</td>";
															}


														} else {
															html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ")>不合格</td>";
														}
													}

													html += "<td style='text-align:center;display:none' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><span id='total_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].total || '') + "'>" + priceChecks[i].total + "</sapn>" + "</td>";

													html += "</tr>";
												}
											}
										}
									}
								}
							}

						}
						$detail.html('<table class="table table-bordered">' + html + '</tbody></table>');
					}
					$("#" + tableId).bootstrapTable("load", checkItem);
				}
			}
		});
		el.append($table);
	}
}

/******************* End 非招标 ************************ */

/******************* Start 招标 ************************ */
var nodes = [];
var bidSectionInfo;
// 2023年10月8日10:29:55 新增
function formatBidingReviewView(ftype, id) {
	var flowUrl = top.config.Reviewhost + "/ReviewControll/getFlowInfo.do";
	var bidInfoUrl = top.config.Reviewhost + "/ProjectController/findBidSectionInfo";

	var bidSectionId = pushData.packageId;
	var examType = pushData.examType;
	if (nodes.length === 0) {
		// 查询评审项
		$.ajax({
			type: "post",
			url: flowUrl,
			async: false,
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			data: {
				'bidSectionId': bidSectionId,
				'examType': examType,
			},
			success: function (res) {
				if (res.success) {
					nodes = res.data.nodes || [];
				}
			}
		});
	}
	if (!bidSectionInfo) {
		// 查询评审项
		$.ajax({
			type: "post",
			url: bidInfoUrl,
			async: false,
			data: {
				'bidSectionId': bidSectionId,
			},
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function (res) {
				if (res.success) {
					bidSectionInfo = res.data || {};
				}
			}
		});
	}
	var el = $('#' + id);
	// 评审项
	if (ftype == '60') {
		var checkUrl = top.config.Reviewhost + "/ReviewControll/findCheckLastResultByCheckId.do";
		var tabWrapDiv = $('<div class="tab-wrap" id="tab_' + id + '"></div>');
		var tableId = 'table_' + id;
		var tableDiv = $('<div class="table-wrap" style="margin-top: 6px;"><table class="table table-bordered" id="' + tableId + '"></table></div>');
		var getReviewItemDetail = function (reviewItem) {
			$.ajax({
				type: "post",
				url: checkUrl,
				data: {
					'bidSectionId': bidSectionId,
					'examType': examType,
					'bidCheckId': reviewItem.nodeSubType,
				},
				success: function (res) {
					if (res.success) {
						var checkData = res.data || [];
						var checkType = 0;
						if (checkData.length) {
							checkType = checkData[0].checkType;
						}
						var checkTypeTitle = '';
						if (checkType == 0) {
							checkTypeTitle = "合格制"
						} else if (checkType == 1) {
							checkTypeTitle = "偏离制"
						} else if (checkType == 2) {
							checkTypeTitle = "响应制"
						} else if (checkType == 3) {
							checkTypeTitle = "打分制"
						};
						var tableDiv = $('#' + tableId);
						tableDiv.bootstrapTable('destroy');
						tableDiv.bootstrapTable({
							pagination: false,
							undefinedText: "",
							maxHeight: 490,
							columns: [{
								field: "xuhao",
								title: "序号",
								align: "center",
								halign: "center",
								width: "50px",
								formatter: function (value, row, index) {
									return index + 1;
								}
							},
							{
								field: "enterpriseName",
								title: "投标人",
								align: "left",
								halign: "left",
							},
							{
								field: "checkType",
								title: "评标方法",
								halign: "center",
								align: "center",
								width: '100',
								formatter: function (value, row, index) {
									return checkTypeTitle
								}
							},
							{
								field: "status",
								title: checkType == 3 ? "分值" : "评标结果",
								halign: "left",
								align: "left",
								width: '400',
								formatter: function (value, row, index) {
									if (checkType == 3) {
										return row.score;
									} else {
										return value;
									}

								}
							},
							]
						});
						tableDiv.bootstrapTable("load", checkData); //重载数据
					} else {
						top.layer.alert(res.message);
					}
				}
			});
		}

		var doView = function (reviewItems) {
			for (var i = 0; i < reviewItems.length; i++) {
				var reviewItem = reviewItems[i];
				var tabDiv = $('<button type="button" class="btn" style="margin-bottom: 6px;"> ' + reviewItem.nodeName + ' </button>');
				var clickHandle = function (reviewItem) {
					getReviewItemDetail(reviewItem);
					tabWrapDiv.find('.btn').each(function () {
						$(this).removeClass('btn-primary')
					})
					$(this).addClass('btn-primary');
				}
				clickHandle = clickHandle.bind(tabDiv, reviewItem)
				tabDiv.on('click', clickHandle);
				tabWrapDiv.append(tabDiv);
				if (i === 0) {
					clickHandle(reviewItem);
				}
			}
			el.append(tabWrapDiv);
			el.append(tableDiv);
		}
		var reviewItems = [];
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeType === 'review') {
				reviewItems.push(nodes[i]);
			}
		}
		doView(reviewItems)
	}
	// 价格修正
	else if (ftype == '61') {
		var findNode = nodes.find(function (value) {
			return value.nodeType === 'revisePrice';
		});
		if (!findNode) {
			return;
		}
		var tableId = 'table_' + id;
		var $table = $('<div><table id="' + tableId + '" class="table table-bordered"></table></div>');
		getReviewResult('getPriceCheck', findNode, function (data) {
			console.log('getPriceCheck >> ', data);
			var bidderPriceUnit;//投标报价单位
			var bidPriceChecksList = data.bidPriceChecks || [];
			var priceType = data.priceType; //价格评审类型 1.投标价 2.投标价+缺漏项 3.投标价+缺漏项+偏离加价 9.费率
			var bidderPriceType = data.bidderPriceType; //投标报价类型
			var isFinish = data.isFinish;
			var priceDetail = [];//偏移加价详情信息
			var retainNum = 0;
			var bidCheckType = bidSectionInfo.checkType;
			//判断报价类型,确定保留位数
			if (bidderPriceType == 9) {
				retainNum = data.rateRetainBit;
				bidderPriceUnit = data.rateUnit;
			} else {
				//根据元、万元，保留位数
				if (bidSectionInfo.priceUnit == "1") {
					retainNum = 6;
				} else {
					retainNum = 2;
				}
				bidderPriceUnit = bidSectionInfo.priceUnit;
			}
			if (data.deviationPrices) {
				priceDetail = data.deviationPrices;
			}
			//价格评标表格
			$("#" + tableId).bootstrapTable({
				detailView: (data.priceType == 3 || data.priceType == 4 || data.priceType == 5 || data.priceType == 6) ? true : false,   //父子表
				columns: [{
					field: '#',
					title: '序号',
					width: '50px',
					align: "center",
					formatter: function (value, row, index) {
						return index + 1;
					}
				}, {
					field: 'enterpriseName',
					title: '投标人',
					width: '200px',
				}, {
					field: 'finalPrice',
					title: '原投标价(' + bidderPriceUnit + ')',
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						return value
					}
				}, {
					field: 'fixCount',
					title: '算术修正值(' + bidderPriceUnit + ')',
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				}, {
					field: 'countReason',
					title: '算术修正原因',
					width: '150px',
					cellStyle: {
						css: { 'min-width': '150px' }
					},
					formatter: function (value, row, index) {
						if (value != undefined) {
							return "<span class='reason_html'>" + value + "</span>"
						} else {
							return '-'
						}
					}
				}, {
					field: 'fixFinalPrice',
					title: '修正后投标价(' + bidderPriceUnit + ')',
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				}, {
					field: 'enterReviewPrice',
					title: '进入评标的投标报价(' + bidderPriceUnit + ')',
					visible: (data.priceType == 4 || data.priceType == 5) ? true : false,
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				}, {
					field: 'enterReviewPriceExplain',
					title: '进入评标的投标报价说明',
					visible: (data.priceType == 4 || data.priceType == 5) ? true : false,
					width: '150px',
					cellStyle: {
						css: { 'min-width': '150px' }
					},
					formatter: function (value, row, index) {
						if (value != undefined) {
							return "<span class='reason_html'>" + value + "</span>"
						} else {
							return '-'
						}
					}
				}, {
					field: 'defaultItem',
					title: (data.priceType == 3 || data.priceType == 6) ? '评标价格调整(' + bidderPriceUnit + ')' : (data.priceType == 7) ? '商务部分价格折算(' + bidderPriceUnit + ')' : '缺漏项修正(' + bidderPriceUnit + ')',
					align: "center",
					visible: (data.priceType == 1 || data.priceType == 5) ? false : true,
					width: '200px',
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				}, {
					field: 'reason',
					title: '缺漏项调整原因',
					title: (data.priceType == 3 || data.priceType == 6) ? '评标价格调整原因' : (data.priceType == 7) ? '价格折算原因' : '缺漏项调整原因',
					width: '150px',
					cellStyle: {
						css: { 'min-width': '150px' }
					},
					visible: (data.priceType == 1 || data.priceType == 5) ? false : true,
					formatter: function (value, row, index) {
						if (value != undefined) {
							return "<span class='reason_html'>" + value + "</span>"
						} else {
							return '-'
						}
					}
				}, {
					field: 'checkPrice',
					title: '评标价(' + bidderPriceUnit + ')',
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				},
				{
					field: 'deviatePrice',
					title: '偏离' + (bidCheckType == 8 ? '减' : '加') + '价 (' + bidderPriceUnit + ')',
					align: "center",
					width: '150px',
					visible: (data.priceType == 3 || data.priceType == 4 || data.priceType == 5 || data.priceType == 6) ? true : false,
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}

				}, {
					field: 'totalCheck',
					title: '最终评标价(' + bidderPriceUnit + ')',
					width: '200px',
					align: "center",
					formatter: function (value, row, index) {
						if (value != undefined) {
							return value
						} else {
							return '/'
						}
					}
				}
				],
				//注册加载子表的事件。注意下这里的三个参数！
				onExpandRow: function (index, row, $detail) {
					if (data.priceType == 3 || data.priceType == 4 || data.priceType == 5 || data.priceType == 6) {
						sonTable(index, row, $detail);
					}
				}
			});
			//子表
			function sonTable(index, row, $detail) {
				var detailList = [];//偏移加价详情信息
				var parentid = row.supplierId;
				var cur_table = $detail.html('<table></table>').find('table');
				for (var i = 0; i < priceDetail.length; i++) {
					if (priceDetail[i].supplierId == parentid) {
						detailList = priceDetail[i].deviationPriceDetails;
					}
				};
				$(cur_table).bootstrapTable({
					queryParams: { id: parentid },
					columns: [
						{
							field: 'checkName',
							title: '评审项名称'
						}, {
							field: 'deviateNum',
							title: '偏离' + (bidCheckType == 8 ? '减' : '加') + '价项数'
						}, {
							field: 'addPriceRatio',
							title: (bidCheckType == 8 ? '减' : '加') + '价幅度（%）'
						}
					],
				});
				$(cur_table).bootstrapTable('load', detailList); //重载数据
			}
			$("#" + tableId).bootstrapTable("load", bidPriceChecksList); //重载数据
		});
		el.append($table);
	}
	// 评标汇总
	else if (ftype == '62') {
		var findNode = nodes.find(function (value) {
			return value.nodeType === 'reviewSummary';
		});
		if (!findNode) {
			return;
		}
		var tableId = 'table_' + id;
		/**
		 * 获取树的每一级别所占的列数
		*/
		function getCols(treeData) {
			var floor = 0;
			var max = 0;
			function each(data, floor) {
				for (var j = 0; j < data.length; j++) {
					var e = data[j];
					e.floor = floor
					if (floor > max) {
						max = floor
					}
					if (e.bidChecks && e.bidChecks.length > 0) {
						each(e.bidChecks, floor + 1)
					}
					if (e.bidCheckItems && e.bidCheckItems.length > 0) {
						if (e.bidCheckItems[0].checkName && e.bidCheckItems[0].checkName != "") {
							each(e.bidCheckItems, floor + 1);
						} else {

							e.checkStandard = "";

							for (var i = 0; i < e.bidCheckItems.length; i++) {
								e.checkStandard += e.bidCheckItems[i].checkStandard;

								if (e.bidCheckItems[i].rangeMin || e.bidCheckItems[i].rangeMin == 0) {
									e.checkStandard += " (" + e.bidCheckItems[i].rangeMin + " - " + e.bidCheckItems[i].rangeMax + "分)";
								} else {
									e.checkStandard += e.bidCheckItems[i].rangeMax || e.bidCheckItems[i].rangeMax == 0 ? " (" + e.bidCheckItems[i].rangeMax + "分)" : "";
								}
								e.checkStandard += "<br/>";
							}
							e.bidCheckItems = [];
						}
					}
				}
			}
			each(treeData, 1);

			function setCols(data) {
				for (var j = 0; j < data.length; j++) {
					var e = data[j];
					e.cols = 1;
					if (e.bidChecks && e.bidChecks.length > 0) {
						setCols(e.bidChecks);
					} else if (e.bidCheckItems && e.bidCheckItems.length > 0) {
						setCols(e.bidCheckItems);
					} else {
						e.cols = max + 1 - e.floor;
					}
				}
			}
			setCols(treeData);

			return { data: treeData, cols: max };
		}
		function getRows(data) {
			var rowAll = 0, colAll = 0;
			for (var i = 0; i < data.length; i++) {
				var rows = 0;
				var cols = 0;
				if (data[i].bidChecks && data[i].bidChecks.length > 0) {
					rows += getRows(data[i].bidChecks).rows;
				} else if (data[i].bidCheckItems && data[i].bidCheckItems.length > 0) {
					rows += getRows(data[i].bidCheckItems).rows;
				} else {
					rows += 1;
				}
				data[i].rows = rows;
				rowAll += rows;
			}

			return { rows: rowAll, data: data };
		}
		/**
		 * 分数显示效果
		 * @param scor
		 * @returns {*}
		 */
		function getScore(scor) {
			if (scor) {
				return scor
			} else if (scor == 0) {
				return '0'
			} else {
				return '/'
			}
		};

		var $table = $('<div><table id="' + tableId + '" class="table table-bordered"></table></div>');
		getReviewResult('getSummaryData', findNode, function (data) {
			var bidPriceCheckLists = data.bidPriceChecks;//投标人数数组
			var bidChecksLists = data.bidChecks;//评审大项

			for (var k = 0; k < data.bidChecks.length; k++) {
				var bidCheckItems = [];
				var treeList = data.bidChecks[k].bidCheckItems;
				var tempCheckItems = {};
				for (var i = 0; i < treeList.length; i++) {
					tempCheckItems[treeList[i].id] = treeList[i];
					treeList[i].bidCheckItems = [];
					if (!treeList[i].pid || treeList[i].pid == '0') {
						bidCheckItems.push(treeList[i]);
					}
				}
				for (var i = 0; i < treeList.length; i++) {
					if (treeList[i].pid && treeList[i].pid != '0') {
						var temp = tempCheckItems[treeList[i].pid];
						if (temp != null) {
							temp.bidCheckItems.push(treeList[i]);
						} else {
							bidCheckItems.push(treeList[i]);
						}
					}
				}
				bidChecksLists[k].bidCheckItems = bidCheckItems;


			}
			var bidCheckItemsObj = getCols(bidChecksLists);
			var bidCheckItemRow = getRows(bidCheckItemsObj.data);
			bidChecksLists = bidCheckItemsObj.data;
			var otherBidPrice = '';
			if (bidPriceCheckLists.length) {
				otherBidPrice = bidPriceCheckLists[0].otherBidPrice;
			}
			var bidderPriceUnit = bidSectionInfo.priceUnit;
			$("#" + tableId).bootstrapTable({
				detailView: true,
				columns: [
					{
						field: '#',
						title: '序号',
						width: '50px',
						align: "center",
						formatter: function (value, row, index) {
							return index + 1;
						}
					}, {
						title: '投标人名称',
						width: '200px',
						field: 'enterpriseName',
					}, {
						title: '最终得分',
						width: '110px',
						field: 'score',
						formatter: function (value, row, index) {
							return getScore(value)
						}
					}, {
						title: otherBidPrice ? "费率" : "报价（" + bidderPriceUnit + '）' || '元）',
						visible: examType == 2,
						width: '110px',
						formatter: function (value, row) {
							return (row.otherBidPrice ? row.otherBidPrice : row.totalCheck ? row.totalCheck : row.bidPrice)
						}
					}, {
						title: '淘汰',
						width: '75px',
						field: 'isKey',
						formatter: function (value) {
							return value == 1 ? '未淘汰' : "淘汰";
						}
					}, {
						title: '排名',
						width: '75px',
						field: 'orders',
						formatter: function (value) {
							return value || '/';
						}
					}, {
						title: '候选人',
						width: '75px',
						field: 'isChoose',
						formatter: function (value) {
							return value == 0 ? "否" : "是";
						}
					}, {
						title: '修改原因',
						width: '200px',
						field: 'reason',
						formatter: function (value) {
							return value || '/';
						}
					}
				],
				onExpandRow: function (index, row, $detail) {
					sonTable(index, row, $detail);
				}
			});
			$("#" + tableId).bootstrapTable("load", bidPriceCheckLists);
			//子表
			var mostCol = 0;//最多评审项
			function eachChildren(bidChecks, level, bidChecksData) {
				var col = 0;
				var row = 0;
				if (bidChecks && bidChecks.length > 0) {
					level = level == undefined ? 1 : level + 1;
					if (bidChecksData.maxLevel < level) {
						bidChecksData.maxLevel = level;
					}
					if (mostCol < level) {
						mostCol = level;
					}
					for (var i = 0; i < bidChecks.length; i++) {
						bidChecks[i].level = level;
						bidChecks[i].col = eachChildren(bidChecks[i].bidCheckItems, bidChecks[i].level, bidChecksData);

						if (!bidChecksData.levelData[bidChecks[i].level]) {
							bidChecksData.levelData[bidChecks[i].level] = [];
						}
						bidChecksData.levelData[bidChecks[i].level].push(bidChecks[i]);

						if (!bidChecks[i].bidCheckItems || bidChecks[i].bidCheckItems.length == 0) {
							bidChecksData.minData.push(bidChecks[i]);
							bidChecks[i].row = bidChecks[i].level;
							bidChecks[i].colspan = mostCol - bidChecks[i].level + 1;
						} else {
							bidChecks[i].row = 0;
							bidChecks[i].colspan = 1;
						}
						if (bidChecks[i].col == 0) {
							bidChecks[i].col = 1

						}
						col += bidChecks[i].col;
					}
				}
				return col;
			}
			function sonTable(index, row, $detail) {
				var expertsUrl = config.Reviewhost + "/ReviewControll/experts.do";
				/**
				 * 获取评委信息
				 * @returns {*}
				 */
				function getExperts() {
					var experts;
					//获取标段详情
					$.ajax({
						type: "post",
						url: expertsUrl,
						async: false,
						data: {
							'bidSectionId': bidSectionId,
							'examType': examType
						},
						success: function (res) {
							if (res.success) {
								experts = res.data;
							}
						}
					});
					return experts;
				}
				var experts = getExperts();
				for (var s = 0; s < bidChecksLists.length; s++) {
					var bidChecksData = {
						maxLevel: 0,
						levelData: {},
						minData: []
					};
					eachChildren(bidChecksLists[s].bidCheckItems, 0, bidChecksData)
					//		console.log(mostCol)
				};
				var list = '<table class="table table-bordered table-striped">'
				list += "<tr>";
				//					list += "<td style='text-align:left' width='200px'>投标人名称</td>";
				list += "<td style='text-align:center' width='120px'>评标项</td>";
				list += "<td style='text-align:center' colspan='" + mostCol + "' width='400px'>评标内容</td>";
				for (var i = 0; i < experts.length; i++) {
					list += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + experts[i].expertName + ")</td>";
				}
				list += "<td style='text-align:center' width='110px'>评审结果</td>";
				list += "</tr>";
				for (var s = 0; s < bidChecksLists.length; s++) {	//评审大项循环				
					list += "<tr>";
					/****** 计算最多评审项 *****/
					var itemMost = '';
					var bidChecksData = {
						maxLevel: 0,
						levelData: {},
						minData: []
					};
					itemMost = eachChildren(bidChecksLists[s].bidCheckItems, 0, bidChecksData)
					list += "<td style='text-align:left' class='1111' width='200px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + bidChecksLists[s].checkName + "</td>";
					var firstData = bidChecksData.levelData[1];
					var hasIndex = '';
					var childNum = 0;
					//		console.log(firstData)
					for (var z = 0; z < firstData.length; z++) {//循环具体评审项
						if (z == 0) {
							var col = mostCol;
							if (firstData[z].bidCheckItems && firstData[z].bidCheckItems.length > 0) {
								list += "<td style='text-align:left' class='2222' colspan='" + firstData[z].cols + "' rowspan='" + firstData[z].rows + "' width='200px'>" + firstData[z].checkName + "</td>";
								for (var g = 0; g < firstData[z].bidCheckItems.length; g++) {
									var dataList = firstData[z].bidCheckItems[g];
									function creatFirstTr(data) {
										if (data.bidCheckItems && data.bidCheckItems.length > 0) {
											for (var t = 0; t < data.bidCheckItems.length; t++) {
												if (t == 0) {
													list += "<td style='text-align:left' class='999' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
													creatFirstTr(data.bidCheckItems[0])
												} else {
													creaTermTr(data.bidCheckItems[t], t)
												}
											}
										} else {
											firstColsId = data.id;
											list += "<td style='text-align:left' class='2222' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
											for (var i = 0; i < experts.length; i++) {//循环评委
												for (var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {	//	评审大项结果				       			
													if (bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == firstColsId) {
														if (experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
															var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
															if (bidChecksLists[s].checkType == 3) {
																list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
															} else {
																var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
																if (isk == undefined || isk === "") {
																	list += "<td style='text-align:center' width='100px'>/</td>";
																} else {
																	if (bidChecksLists[s].checkType == 0) {
																		list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
																	} else if (bidChecksLists[s].checkType == 1) {

																		list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
																	} else if (bidChecksLists[s].checkType == 2) {
																		list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
																	}
																}

															}
														}
													}
												}
											}
											var checkLastResults = '';
											for (var x = 0; x < bidPriceCheckLists[index].checkLastResults.length; x++) {
												if (bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id) {
													checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
												}
											}
											if (checkLastResults) {
												if (bidChecksLists[s].checkType == 3) {
													var checkScor = getScore(checkLastResults.score);
													list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (checkScor ? checkScor : '/') + "</td>";
												} else {
													var isk = checkLastResults.isKey;
													if (isk === undefined || isk === "") {
														list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
													} else {
														if (bidChecksLists[s].checkType == 0) {
															list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
														} else if (bidChecksLists[s].checkType == 1) {

															list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
														} else if (bidChecksLists[s].checkType == 2) {
															list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
														}
													}

												}
											} else {
												list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
											}
											if (s == 0) {
												list += "</tr>";
											};
										}
									}
									if (g == 0) {
										var firstColsId = '';
										creatFirstTr(dataList)

									} else {
										creaTermTr(dataList, g)
									}
								}
							} else {
								list += "<td style='text-align:left' class='2222' colspan='" + firstData[z].cols + "' rowspan='" + firstData[z].rows + "' width='200px'>" + firstData[z].checkName + "</td>";
								for (var i = 0; i < experts.length; i++) {//循环评委
									for (var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {	//	评审大项结果				       			
										if (bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == firstData[z].id) {
											if (experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
												var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
												if (bidChecksLists[s].checkType == 3) {
													list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
												} else {
													var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
													if (isk == undefined || isk === "") {
														list += "<td style='text-align:center' width='100px'>/</td>";
													} else {
														if (bidChecksLists[s].checkType == 0) {
															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
														} else if (bidChecksLists[s].checkType == 1) {

															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
														} else if (bidChecksLists[s].checkType == 2) {
															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
														}
													}

												}
											}
										}
									}
								}
								var checkLastResults = '';
								for (var x = 0; x < bidPriceCheckLists[index].checkLastResults.length; x++) {
									if (bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id) {
										checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
									}
								}
								if (checkLastResults) {
									if (bidChecksLists[s].checkType == 3) {
										var checkScor = getScore(checkLastResults.score);
										list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (checkScor ? checkScor : '/') + "</td>";
									} else {
										var isk = checkLastResults.isKey;
										if (isk === undefined || isk === "") {
											list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
										} else {
											if (bidChecksLists[s].checkType == 0) {
												list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
											} else if (bidChecksLists[s].checkType == 1) {

												list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
											} else if (bidChecksLists[s].checkType == 2) {
												list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
											}
										}

									}
								} else {
									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
								}
								if (s == 0) {
									list += "</tr>";
								};
							}
						} else {
							creaTermTr(firstData[z], z)
						}
						if (bidChecksLists[s].checkType == 3) {//打分项
							if (z == firstData.length - 1) {
								list += "<tr>";
								list += "<td style='text-align:left' width='200px' colspan='" + mostCol + "'>总分</td>";
								for (var i = 0; i < experts.length; i++) {
									if (bidPriceCheckLists[index].expertChecks != undefined && bidPriceCheckLists[index].expertChecks.length > 0) {
										for (var bs = 0; bs < bidPriceCheckLists[index].expertChecks.length; bs++) {
											if (experts[i].expertId == bidPriceCheckLists[index].expertChecks[bs].expertId && bidPriceCheckLists[index].expertChecks[bs].checkId == bidChecksLists[s].id) {
												list += "<td style='text-align:center' width='100px'>" + getScore(bidPriceCheckLists[index].expertChecks[bs].score) + "</td>";
											}
										}
									} else {
										list += "<td style='text-align:center' width='100px'>/</td>";
									}
								}
								list += "</tr>";
							}
						}
						function creaTermTr(data, indexs) {
							if (indexs != 0) {
								if (data.bidCheckItems && data.bidCheckItems.length > 0) {
									list += "<tr>";
									list += "<td style='text-align:left' class='" + indexs + "_0' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
									for (var x = 0; x < data.bidCheckItems.length; x++) {
										if (x == 0) {
											if (data.bidCheckItems[x].bidCheckItems && data.bidCheckItems[x].bidCheckItems.length > 0) {
												list += "<td style='text-align:left' class='" + indexs + "_1' colspan='" + data.bidCheckItems[x].cols + "' rowspan='" + data.bidCheckItems[x].rows + "' width='200px'>" + data.bidCheckItems[x].checkName + "</td>";
												for (var p = 0; p < data.bidCheckItems[x].bidCheckItems.length; p++) {
													creaTermTr(data.bidCheckItems[x].bidCheckItems[p], p)
												}
											} else {
												list += "<td style='text-align:left' class='" + indexs + "_1' colspan='" + data.bidCheckItems[x].cols + "' rowspan='" + data.bidCheckItems[x].rows + "' width='200px'>" + data.bidCheckItems[x].checkName + "</td>";
												for (var i = 0; i < experts.length; i++) {
													for (var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {
														if (bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == data.bidCheckItems[x].id) {
															if (experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
																var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);

																if (bidChecksLists[s].checkType == 3) {
																	list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
																} else {
																	var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
																	if (isk === undefined || isk === "") {
																		list += "<td style='text-align:center' width='100px'>/</td>";
																	} else {
																		if (bidChecksLists[s].checkType == 0) {
																			list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
																		} else if (bidChecksLists[s].checkType == 1) {

																			list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
																		} else if (bidChecksLists[s].checkType == 2) {
																			list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
																		}
																	}

																}
															}
														}
													}
												}
											}
											list += "</tr>";
										} else {
											creaTermTr(data.bidCheckItems[x], x)
										}
									}
								} else {
									list += "<tr>";
									list += "<td style='text-align:left' class='444' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
									for (var i = 0; i < experts.length; i++) {
										for (var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {
											if (bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == data.id) {
												if (experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
													var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);

													if (bidChecksLists[s].checkType == 3) {
														list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
													} else {
														var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
														if (isk === undefined || isk === "") {
															list += "<td style='text-align:center' width='100px'>/</td>";
														} else {
															if (bidChecksLists[s].checkType == 0) {
																list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
															} else if (bidChecksLists[s].checkType == 1) {

																list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
															} else if (bidChecksLists[s].checkType == 2) {
																list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
															}
														}

													}
												}
											}
										}
									}
									list += "</tr>";
								}
							}
						}
					}
					if ((firstData.length == 1 || !firstData) && s != 0) {
						list += "</tr>";
					}

				}
				list += '</table>'

				$detail.html(list);
			}
		})
		el.append($table);
	}

	function getReviewResult(method, node, callback) {
		var reviewUrl = top.config.Reviewhost + '/ReviewControll/review.do';
		var bidSectionId = pushData.packageId;
		var examType = pushData.examType;
		$.ajax({
			type: "post",
			url: reviewUrl,
			data: {
				'method': method,
				'nodeType': node.nodeType,
				'nodeSubType': node.nodeSubType,
				'bidSectionId': bidSectionId,
				'examType': examType
			},
			success: function (data) {
				if (data.success) {
					callback(data.data);
				}
			}
		});
	}
}
/******************* End 招标 ************************ */

/******************* Start 招标线下项目 ************************ */
var projectType;
var offlineBidSectionInfo;
function formatOfflineBiddingView(ftype, eid) {
	var bidSectionId = pushData.packageId;
	var examType = pushData.examType;
	var el = $('#' + eid);
	// 招标线下项目汇总
	if (ftype == '72') {
		function bidderHtml(data, isCandidate) {
			var html = '';
			data = (data || []).sort(function(a, b) {
				if (a.winCandidateOrder == '') {
					return 1;
				}
				if (b.winCandidateOrder == '') {
					return -1;
				}
				return a.winCandidateOrder - b.winCandidateOrder > 0 ? 1 : -1;
			});
			
			html = '<tr>'
				+ '<th>投标人名称</th>'
				+ '<th style="width: 120px;text-align: center;white-space: nowrap;">投标价' + (projectType == 3 ? '('+(offlineBidSectionInfo.priceUnit==1?'万元':'元')+'人民币)' : '('+(offlineBidSectionInfo.priceUnit==1?'万元':'元')+')') + '</th>'
				+ (projectType == 3 ?  '<th style="width: 120px;text-align: center;">投标价('+(offlineBidSectionInfo.priceUnit==1?'万':'')+'美元)</th>':'')
				+ '<th style="width: 80px;text-align: center;">'+(projectType == 3?"否决":"废标")+'</th>'
				+ (projectType == 3?'':'<th style="width: 120px;text-align: center;color:green;">评标价('+(offlineBidSectionInfo.priceUnit==1?'万元':'元')+')</th>')
				+ ((projectType == 3 && isCandidate == '是') ? '<th style="width: 120px;text-align: center;color:green;">评标价('+(offlineBidSectionInfo.priceUnit==1?'万':'')+'美元)</th>':'')
				+ '<th style="width: 100px;text-align: center;">评分</th>'
				+ '<th style="width: 80px;text-align: center;">排名</th>'
				+ '<th>评委意见</th>'
				// + '<th style="width: 80px;text-align: center;">名次</th>'
				+ '</tr>'
			for (var i = 0; i < data.length; i++) {
				var text = '';
				if(data[i].isAnnulment == 1){
					
				}
				if(projectType == 3){
					text = (data[i].isAnnulment == 0 ? '否决' : '未否决')
				}else{
					text = (data[i].isAnnulment == 0 ? '废标' : '未废标');
				}
				html += '<tr>'
					+ '<td>' + data[i].unitName + '</td>'
					+ '<td style="width: 100px;text-align: center;">' + data[i].bidPrice + '</td>'		//万元
					+ (projectType == 3 ?  ('<td style="width: 100px;text-align: center;">' + data[i].bidPrices + '</td>'):'')		//万美元
					+ '<td style="width: 110px;text-align: center;">' + text + '</td>'
					+(projectType == 3?'':'<td style="width: 100px;text-align: center;">' + data[i].evaluatingPrice + '</td>')//万元
					+ ((projectType == 3 && isCandidate == '是') ?  ('<td style="width: 100px;text-align: center;">' + data[i].evaluatingPrices + '</td>'):'')		//万美元
					+ '<td style="width: 100px;text-align: center;">' + data[i].score + '</td>'		//得分
					+ '<td style="width: 80px;text-align: center;">' + data[i].winCandidateOrder + '</td>'		//投标人排名
					+ '<td>' + data[i].content + '</td>'		//淘汰原因
					+ '</tr>';
			}

			var tableHtml = '<table class="table table-bordered " id="bidResult">'
				// + '<thead>'
				// +	"<tr>"
				// +		'<th style="width: 50px;text-align: center;">序号</th>'
				// +		'<th>投标人名称</th>'
				// +		'<th style="width: 80px;text-align: center;">名次</th>'
				// +		'<th style="width: 80px;text-align: center;">得分</th>'
				// +		'<th style="width: 90px;text-align: center;">是否候选人</th>'
				// +		'<th style="width: 180px;text-align: center;">报价（元）</th>'
				// +		'<th style="width: 80px;text-align: center;">是否淘汰</th>'
				// +		'<th>淘汰原因</th>'
				// +	'</tr>'
				// + '</thead>'
				// + '<tbody>'
				+ 	html
				// + '</tbody>'
				+ '</table>';
			el.html(tableHtml);
		};
		$.ajax({
			type: "post",
			url: top.config.offlineHost + '/OfflineEvaluatingResultController/getByBidSectionId',
			async: false,
			data: {
				'bidSectionId': bidSectionId,
				'id': id,
				'examType': examType
			},
			success: function (data) {
				if (data.success) {
					var dataSource = data.data;
					offlineBidSectionInfo = dataSource;
					projectType = dataSource.projectType;
					var bidderDatas = dataSource.offlineevaluatingresultunits;
					if (bidderDatas && bidderDatas.length > 0) {
						bidderHtml(bidderDatas, dataSource.isCandidate)
					}
				}
			}
		});
	}
}
/******************* End 招标线下项目 ************************ */

if (!Array.prototype.find) {
	Array.prototype.find = function (callback, thisArg) {
		if (typeof callback !== 'function') {
			throw new TypeError('callback must be a function');
		}
		var array = Object(this);
		var length = array.length >>> 0;
		for (var i = 0; i < length; i++) {
			var element = array[i];
			if (callback.call(thisArg, element, i, array)) {
				return element;
			}
		}
		return undefined;
	};
}