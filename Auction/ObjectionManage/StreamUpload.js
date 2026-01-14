function StreamUpload(target, options, serverHost) {
	if (!serverHost) {
		serverHost = top.config.AuctionHost;
	}
	//默认配置参数
	var defaults = {
		fileUrl: config.FileHost + "/FileController/streamFile.do", //H5上传地址
		flashFileUrl: config.FileHost + "/FileController/formDataFile.do", //flash上传的地址
		fileDownloadUrl: config.FileHost + "/FileController/download.do", //下载文件
		fileDelUrl: serverHost + "/PurFileController/delete.do", //文件删除地址
		fileListUrl: serverHost + "/PurFileController/list.do", //文件列表
		fileAddUrl: serverHost + "/PurFileController/save.do", //添加附件表的地址
		
		basePath: "", // 自定义文件保存路径前缀
		Token: $.getToken(), //
		browseFileId: "fileLoad", //上传按钮
		filesQueueId: "i_stream_files_queue", //文件显示容器的ID(customered=false时有效)
		businessId: "", //业务id
		status: 1, //1是编辑，2是查看, 3：可编辑，但不显示上传, 4是不调用上传到数据库方法
		isRecord: true, //是否显示列表
		attachmentSetCode: "", // 附件关联数据集标识符
		isPreview: true, //false不可预览   true可预览
		extFilters: [], //上传文件类型
		isMulti: true, //是否可以上传多个文件
		maxSize: 209715200, //文件最大
		changeFile: function (data) {
			//有文件操作是，返回方法，data为文件列表
		},
		uploadFile: function (file) {
			//上传到服务器的文件
		},
		getMd5Code: function (file) { },
		addSuccess: function () {
			//
		},
		uploadFail: function () { },
	};
	this.target = $(target); //当前要追加的对象
	this.fileListTab = ".fileListTab";
	this.fileData = []; //提交到数据库后的文件列表
	this.fileSource = []; //上传到服务器的文件列表
	this._t = null; //文件上传插件
	this.md5Code = "";
	this.settings = $.extend({}, defaults, options);

	this.init();
}

StreamUpload.prototype = {
	//初始化方法
	init: function () {
		var _this = this;
		if (_this.settings.status == 1 || _this.settings.status == 4) {
			$('<div id="' + _this.settings.filesQueueId + '"></div>').appendTo(
				_this.target
			);

			var config = {
				multipleFiles: false, // 多个文件一起上传, 默认: false
				/* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
				extFilters: _this.settings.extFilters,
				browseFileBtn:
					" " /** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */,
				filesQueueHeight: 0 /** 文件上传容器的高度（px）, 默认: 450 */,
				messagerId: "", //显示消息元素ID(customered=false时有效)
				frmUploadURL: _this.settings.flashFileUrl, // Flash上传的URI
				uploadURL: _this.settings.fileUrl, //HTML5上传的URI
				browseFileId: _this.settings.browseFileId, //文件选择DIV的ID
				filesQueueId: _this.settings.filesQueueId,
				autoUploading: true, //选择文件后是否自动上传
				autoRemoveCompleted: true, //文件上传后是否移除
				maxSize: _this.settings.maxSize,
				postVarsPerFile: {
					//自定义文件保存路径前缀
					basePath: _this.settings.basePath,
					Token: _this.settings.Token,
				},

				onExtNameMismatch: function (file) {
					_this.settings.uploadFail();
					parent.layer.alert("文件扩展名不匹配");
				},
				getCheckCode: function (file) {
					_this.md5Code = file.md5code;

					_this.settings.getMd5Code(file);
				},
				onRepeatedFile: function (file) {
					return true;
				},
				onMaxSizeExceed: function (file) {
					_this.settings.uploadFail();
					parent.layer.alert(
						"请上传" +
						Number(_this.settings.maxSize) / 1024 / 1024 +
						"M以内的文件"
					);
				},
				onUploadError: function (status, msg) {
					_this.settings.uploadFail();
					if (msg.indexOf('message') > 0) {
						msg = JSON.parse(msg).message;
					}
					parent.layer.alert("上传文件出错：" + msg);
				},
				onComplete: function (file) {
					/** 单个文件上传完毕的响应事件 */
					if (_this.settings.status != 4) {
						_this.fileAdd(file);
					} else {
						file.md5Code = _this.md5Code;
						_this.fileSource.push(file);
						_this.settings.changeFile(_this.fileSource);
						if (_this.settings.isRecord) {
							_this.fileHtml(_this.fileSource);
						}
					}
					_this.settings.uploadFile(file);
				},
			};
			_this._t = new Stream(config);

			$(".stream-total-tips").css("display", "none");
			$("#" + _this.settings.filesQueueId).css("border", "none");
		}

		//文件下载
		_this.target.on("click", ".btnDownload", function () {
			var that = $(this);
			var index = that.attr("data-index");
			var suffix = that.attr("data-suffix");
			var road, fileName, id;
			if (_this.settings.status == 4) {
				road = JSON.parse(_this.fileSource[index].msg).data.filePath; // 下载文件路径
				fileName = encodeURIComponent(_this.fileSource[index].name.replace(/\s+/g, "")); // 文件名
				that.attr(
					"href",
					$.parserUrlForToken(_this.settings.fileDownloadUrl) +
					"&ftpPath=" +
					road +
					"&fname=" +
					fileName.replace(/\s+/g, "")
				);
			} else {
				road = _this.fileData[index].filePath; // 下载文件路径
				fileName = encodeURIComponent(_this.fileData[index].fileName); // 文件名
				if (suffix && suffix != "" && suffix != "undefined") {
					fileName = encodeURIComponent(
						fileName.substring(0, fileName.lastIndexOf(".")) + "." + suffix
					);
				}
				that.attr(
					"href",
					$.parserUrlForToken(_this.settings.fileDownloadUrl) +
					"&ftpPath=" +
					road +
					"&fname=" +
					fileName.replace(/\s+/g, "")
				);
			}
		});
		//文件删除
		_this.target.on("click", ".btnDel", function () {
			var index = $(this).attr("data-index");

			parent.layer.confirm(
				"确定要删除该附件",
				{
					icon: 3,
					title: "询问",
				},
				function (idx) {
					if (_this.settings.status == 4) {
						_this.fileSource.splice(index, 1);
						_this.settings.changeFile(_this.fileSource);
						_this.fileHtml(_this.fileSource);
					} else {
						_this.fileDel(index);
					}
					parent.layer.close(idx);
				}
			);
		});
		//文件预览
		_this.target.on("click", ".btnPreview", function () {
			var index = $(this).attr("data-index");
			var url;
			if (_this.settings.status == 4) {
				url = JSON.parse(_this.fileSource[index].msg).data.filePath;
			} else {
				url = _this.fileData[index].filePath;
			}
			openPreview(url, "850px", "700px");
		});
	},
	fresh: function() {
		this.fileList(true);
		return this;
	},
	changeUnit: function (size) {
		var num = Number(size);
		if (num >= 1024 * 1024 * 1024) {
			return (num / 1024 / 1024 / 1024).toFixed(2) + "G";
		} else if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
			return (num / 1024 / 1024).toFixed(2) + "M";
		} else if (num >= 1024 && num < 1024 * 1024) {
			return (num / 1024).toFixed(2) + "KB";
		} else {
			return num + "B";
		}
	},
	/**
	 * 添加附件表
	 * @param {Object} file  文件信息
	 */
	fileAdd: function (file) {
		var _this = this;
		var name = file.name, //文件名称
			path = JSON.parse(file.msg).data.filePath, //后台返回的文件路径
			type = file.name.split(".").pop(); //文件的后缀  文件类型

		if (path) {
			//保存文件到附件表
			$.ajax({
				type: "post",
				url: _this.settings.fileAddUrl,
				async: false,
				data: {
					modelId: _this.settings.businessId,
					modelName: _this.settings.attachmentSetCode,
					fileName: name,
					bidValue2: type,
					filePath: path,
					bidValue1: _this.md5Code,
					fileSize: file.size,
				},
				success: function (data) {
					if (data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					if (!_this.settings.isMulti) {
						for (var i = 0; i < _this.fileData.length; i++) {
							_this.fileDel(i);
						}
					}

					if (_this.settings.isRecord) {
						_this.fileList();
					}
					_this.settings.addSuccess(path);
				},
				error: function () {
					parent.layer.alert("请求失败");
				},
			});
		}
	},
	fileList: function (isAsync) {
		var _this = this;
		if (!_this.settings.businessId && !_this.settings.attachmentSetCode) {
			return;
		}
		$.ajax({
			type: "post",
			url: _this.settings.fileListUrl,
			async: !!isAsync,
			data: {
				modelId: _this.settings.businessId,
				modelName: _this.settings.attachmentSetCode,
			},
			success: function (data) {
				if (data.success == false) {
					parent.layer.alert(data.message);
					return;
				}
				var arr = data.data;
				var fileArr = [];
				if (_this.settings.attachmentSetCode == "") {
					fileArr = arr;
				} else {
					if (arr.length > 0) {
						for (var i = 0; i < arr.length; i++) {
							if (
								arr[i].modelName == _this.settings.attachmentSetCode
							) {
								fileArr.push(arr[i]);
							}
						}
					}
				}

				_this.fileHtml(fileArr);
				_this.settings.changeFile(fileArr);
			},
			error: function () {
				parent.layer.alert("请求失败");
			},
		});
	},
	fileDel: function (index) {
		var _this = this;
		var data = _this.fileData[index];
		$.ajax({
			type: "post",
			url: _this.settings.fileDelUrl,
			async: false,
			data: {
				id: data.id,
			},
			success: function (data) {
				if (data.success == false) {
					parent.layer.alert(data.message);
					return;
				}
				_this.fileList();
			},
			error: function () {
				parent.layer.alert("请求失败");
			},
		});
	},
	/*
	 * suffix 处理招标文件下载单独处理后缀
	 * */
	fileHtml: function (arr, suffix) {
		var _this = this;
		var fileName;
		var html = "";
		var fileListTab = _this.target.find(_this.fileListTab);
		if (_this.settings.status != 4) {
			_this.fileData = arr;
		} else {
			_this.fileSource = arr;
		}
		if (arr.length == 0) {
			fileListTab.find("tr:gt(0)").remove();
			return;
		}

		if (fileListTab.length > 0) {
			fileListTab.find("tr:gt(0)").remove();
		} else {
			fileListTab = '<div class="table-responsive"><table class="table table-bordered fileListTab" style="margin-bottom:0;"><tr><td style="width:50px; text-align:center">序号</td><td>文件名称</td><td style="width:120px; text-align:center">文件大小</td><td>上传者</td>';
			if (_this.settings.status != 4) {
				fileListTab += '<td style="width:150px; text-align:center">上传时间</td>';
			}
			var tdW = 80;
			if (_this.settings.isPreview) {
				tdW += 70;
			}
			if (
				_this.settings.status == 1 ||
				_this.settings.status == 3 ||
				_this.settings.status == 4
			) {
				tdW += 70;
			}
			fileListTab += '<td style="white-space:nowrap;width:' + tdW + 'px;">操作</td>';
			fileListTab += "</tr></table></div>";
			$(fileListTab).appendTo(_this.target);
		}

		for (var i = 0; i < arr.length; i++) {
			if (_this.settings.status == 4) {
				fileName = arr[i].name || "";
				html +=
					'<tr><td style="text-align:center">' +
					(i + 1) +
					"</td>" +
					"<td>" +
					(fileName) +
					"</td>" +
					'<td style="text-align:center">' +
					_this.changeUnit(arr[i].size) +
					"</td>" +
					"<td>" +
					entryInfo().userName +
					"</td>";
			} else {
				fileName = arr[i].fileName || "";
				html +=
					'<tr><td style="text-align:center">' +
					(i + 1) +
					"</td>" +
					"<td>" +
					(fileName) +
					"</td>" +
					'<td style="text-align:center">' +
					_this.changeUnit(arr[i].fileSize) +
					"</td>" +
					"<td>" +
					arr[i].userName +
					"</td>";
			}

			if (_this.settings.status != 4) {
				html += '<td style="text-align:center">' + arr[i].subDate + "</td>";
			}

			html +=
				'<td style="text-align:center"><a target="_blank" data-index="' +
				i +
				'" data-suffix="' +
				suffix +
				'" class="btn-primary btn-sm btnDownload" style="margin:0 2px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>';
			if (_this.settings.isPreview) {
				fileName = fileName
					.substring(fileName.lastIndexOf(".") + 1)
					.toLowerCase();
				if (
					fileName == "png" ||
					fileName == "jpg" ||
					fileName == "jpeg" ||
					fileName == "pdf"
				) {
					html +=
						'<a data-index="' +
						i +
						'" class="btn-primary btn-sm btnPreview" style="margin:0 2px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</a>';
				}
			}
			if (
				(_this.settings.status == 1 ||
					_this.settings.status == 3 ||
					_this.settings.status == 4) &&
				arr[i].comeFrom != 1
			) {
				html +=
					'<a data-index="' +
					i +
					'" class="btn-danger btn-sm btnDel" style="margin:0 2px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-remove"></span>移除</a>';
			}
			html += "</td></tr>";
		}
		$(html).appendTo(_this.target.find(_this.fileListTab));
	},
	streamTarget: function () {
		return this._t;
	},
};
