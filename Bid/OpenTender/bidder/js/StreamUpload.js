//2019-03-24 by H

//;(function ( $, window, document) {
//	var pluginName = "StreamUpload",
	
	
	/*
	 * 定义上传文件方法
	 * target当前操作对象
	 * options值传递的参数对象
	 */
	function StreamUpload(target, options){
		//默认配置参数
		var defaults = {
			fileUrl: config.FileHost + "/FileController/streamFile.do",		//H5上传地址
			flashFileUrl: config.FileHost + '/FileController/formDataFile.do',//flash上传的地址
			fileDownloadUrl: config.FileHost + "/FileController/download.do",	//下载文件
			fileDownInfoUrl: config.tenderHost + "/ProjectAttachmentFileDownController/insertProjectAttachmentFileDown.do",
			
	 		fileDelUrl: config.tenderHost + "/ProjectAttachmentFileController/delete.do",	//文件删除地址
	 		fileAddUrl: config.tenderHost + "/ProjectAttachmentFileController/insertProjectAttachmentFile.do",	//添加附件表的地址
			fileListUrl:top.config.tenderHost+"/ProjectAttachmentFileController/getpafList.do", //文件列表
			
			basePath:"",    // 自定义文件保存路径前缀
			Token:$.getToken(),  //
			browseFileId: "fileLoad",  //上传按钮
			filesQueueId: "i_stream_files_queue",  //文件显示容器的ID(customered=false时有效)
			businessId:"",  //业务id
			status: 1,   //1是编辑，2是查看, 3：可编辑，但不显示上传, 4是不调用上传到数据库方法
			isRecord:true,   //是否显示列表
			businessTableName: "",  //业务表名称
			attachmentSetCode:"",  // 附件关联数据集标识符
			attachmentState:1,   //附件状态 0为临时保存，1为正式提交，2为删除，3为撤回 
			attachmentCount: "1",  //关联附件数量
			isPreview: false,    //false不可预览   true可预览
			extFilters: [],  //上传文件类型
			isMult:true,  //是否可以上传多个文件
			changeFile:function(data){
				//有文件操作是，返回方法，data为文件列表
			},
			selectFile:function(file){
				
			},
			getMd5Code: function(file){
				
			},
			addSuccess: function(){
				//
			}
		};
		this.target = $(target);  //当前要追加的对象
		this.fileListTab = ".fileListTab";
		this.fileData = [];  //提交到数据库后的文件列表
		this.fileSource = [];  //上传到服务器的文件列表
		this._t = null;   //文件上传插件
		this.md5Code = "";
		this.settings = $.extend( {}, defaults, options);

		
		this.init();
	};
	
	StreamUpload.prototype = {
		//初始化方法
		init: function () { 
			var _this = this;
			if(_this.settings.status == 1 || _this.settings.status == 4){
				$('<div id="'+_this.settings.filesQueueId+'"></div>').appendTo(_this.target);
				
				var config = {
			   		multipleFiles: false, // 多个文件一起上传, 默认: false 
				   /* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
				  	extFilters: _this.settings.extFilters,
				    browseFileBtn : " ", /** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
				    filesQueueHeight : 0, /** 文件上传容器的高度（px）, 默认: 450 */
				    messagerId:'',//显示消息元素ID(customered=false时有效)
				    frmUploadURL : _this.settings.flashFileUrl, // Flash上传的URI 
				    uploadURL : _this.settings.fileUrl ,//HTML5上传的URI 
				    browseFileId: _this.settings.browseFileId,//文件选择DIV的ID
				    autoUploading: true,//选择文件后是否自动上传
				    autoRemoveCompleted:true,//文件上传后是否移除
	//			    customered:true,
				    postVarsPerFile : {
						//自定义文件保存路径前缀
						basePath:_this.settings.basePath,
						Token:_this.settings.Token
					},
					getCheckCode:function(file){
						_this.md5Code = file.md5code;
						
						_this.settings.getMd5Code(file);
					},
					onRepeatedFile: function(file) {
//					  console.log("文件： " + file.name + " 大小：" + file.size + "已存在于上传队列中");
						parent.layer.alert("文件： " + file.name + " 大小：" + _this.changeUnit(file.size) + " 已存在于上传队列中");
//					   	return true;
					},
				    onComplete: function(file){/** 单个文件上传完毕的响应事件 */
//				   		console.log("上传完成");
//				   		console.log(file)
				   		if(_this.settings.status != 4){
				   			_this.fileAdd(file);
				   		} else {
				   			_this.fileSource.push(file);
				   			_this.settings.changeFile(_this.fileSource);
					   		_this.fileHtml(_this.fileSource);
//					   		_this.settings.success();
				   		}
				   		
				   	}
				}
				_this._t = new Stream(config);
				
				
				
				$(".stream-total-tips").css("display","none");
				$("#i_stream_files_queue").css("border","none");
			}
			
			
			//文件下载
			_this.target.on("click", ".btnDownload", function(){
				var that = $(this);
				var index = that.attr("data-index");
				var road, fileName, id;
				if(_this.settings.status == 4){
					road = JSON.parse(_this.fileSource[index].msg).data.filePath;	// 下载文件路径
					fileName = _this.fileSource[index].name.replace(/\s+/g,"");	// 文件名
					that.attr('href',encodeURI(_this.settings.fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName+'&Token='+_this.settings.Token))
				} else {
					road = _this.fileData[index].url;	// 下载文件路径
					fileName = _this.fileData[index].attachmentFileName;	// 文件名
					fileName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/\s+/g,"");
					id = _this.fileData[index].id;
					//文件下载信息
					$.ajax({
						type:'post',
						url: _this.settings.fileDownInfoUrl,
						async: false,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Token", _this.settings.Token);
						},
						data: {
							'projectAttachmentFileId': id
						},
						success: function(data){
							if(data.success == false){
				        		parent.layer.alert(data.message);
				        		return;
				        	}
							that.attr('href',encodeURI(_this.settings.fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName+'&Token='+_this.settings.Token));
						},
						error: function(){
							parent.layer.alert("请求失败");
						}
					});
				}
				
				
				
				
			});
			//文件删除
			_this.target.on("click", ".btnDel", function(){  
				var index = $(this).attr("data-index");
				var fileData = {};
				
				parent.layer.confirm('确定要删除该附件', {
					icon: 3,
					title: '询问'
				}, function(idx) {
					if(_this.settings.status == 4){
						_this.fileSource.splice(index, 1);
						_this.settings.changeFile(_this.fileSource);
						_this.fileHtml(_this.fileSource);
						
					} else {
						
						_this.fileDel(index);
					}
					parent.layer.close(idx);
				});
				
				

			});
			//文件预览
			_this.target.on("click", ".btnPreview", function(){  
				var index = $(this).attr("data-index");
				var data = _this.fileData[index];
				previewPdf(data.url);
			});
		},
		changeUnit:function(size){
			var num = Number(size);
			if(num >= 1024 * 1024 * 1024) {
				return (num/1024/1024/1024).toFixed(2) + "G";
			} else if(num >= 1024 * 1024 && num < 1024 * 1024 * 1024){
				return (num/1024/1024).toFixed(2) + "M";
			} else if(num >= 1024 && num < 1024*1024) {
				return (num/1024).toFixed(2) +"KB";
			} else { 
				return num + "B";
			}
		},
		/**
		 * 添加附件表
		 * @param {Object} file  文件信息
		 */
		fileAdd:function(file){
			var _this = this;
			var name=file.name,//文件名称
	    		path=JSON.parse(file.msg).data.filePath,//后台返回的文件路径
	    		type=file.name.split(".").pop(); //文件的后缀  文件类型
	    	
	    	if(path){
	    		//保存文件到附件表
				$.ajax({
					type:'post',
					url: _this.settings.fileAddUrl,
					async:false,
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Token", _this.settings.Token);
					},
					data: {
						'businessId': _this.settings.businessId,
						'businessTableName': _this.settings.businessTableName,  //立项批复文件（项目审批核准文件）    项目表附件
						'attachmentSetCode': _this.settings.attachmentSetCode,
						'attachmentCount': _this.settings.attachmentCount,
						'attachmentName':name,
						'attachmentType':type,
						'attachmentFileName':name,
						'url':path,
						'attachmentState': _this.settings.attachmentState,
						'md5Code': _this.md5Code
					},
					success: function(data){
						if(data.success == false){
			        		parent.layer.alert(data.message);
			        		return;
			        	}
						
						if(!_this.settings.isMult){
							for(var i = 0; i < _this.fileData.length; i++){
								_this.fileDel(i);
							}
						}
						
						if(_this.settings.isRecord){
							_this.fileList();
						}
						_this.settings.addSuccess(path);
					},
					error: function(){
						parent.layer.alert("请求失败");
					}
				});
	        }
		},
		fileList:function(){
			var _this = this;
			$.ajax({
				type:'post',
				url: _this.settings.fileListUrl,
				async: false,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", _this.settings.Token);
				},
				data: {
					'businessId': _this.settings.businessId
				},
				success: function(data){
					if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
					var arr = data.data;
					var html = "";
					var fileArr = [];
					if(_this.settings.attachmentSetCode == ""){
						fileArr = arr;
					} else {
						if(arr.length > 0){
							for(var i = 0; i < arr.length; i++){
								if(arr[i].attachmentSetCode == _this.settings.attachmentSetCode){
									fileArr.push(arr[i]);
								}
							}
							
						}
					}
					
					_this.fileHtml(fileArr);
					_this.settings.changeFile(fileArr);
					
				},
				error: function(){
					parent.layer.alert("请求失败");
				}
			});
		},
		fileDel:function(index){
			var _this = this;
			var data = _this.fileData[index];
//			console.log(index);
			$.ajax({
				type:'post',
				url: _this.settings.fileDelUrl,
				async: false,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", _this.settings.Token);
				},
				data: {
					'id': data.id
				},
				success: function(data){
					if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
//					parent.layer.alert(data.data);
					_this.fileList();
				},
				error: function(){
					parent.layer.alert("请求失败");
				}
			})
		},
		fileHtml:function(arr){ 
			var _this = this;
			var html = "";
			var fileListTab = _this.target.find(_this.fileListTab);
			if(arr.length == 0){
				fileListTab.find("tr:gt(0)").remove();
				return;
			}
			
			
			if(_this.settings.status != 4 ){
				_this.fileData = arr;
			}
			
			if(fileListTab.length > 0){
				fileListTab.find("tr:gt(0)").remove();
			} else {
				fileListTab = '<table class="table table-bordered fileListTab" style="margin-bottom:0;"><tr><td style="width:50px; text-align:center">序号</td><td>文件名称</td><td style="width:100px; text-align:center">文件大小</td><td style="width:230px">创建人</td>';
				if(_this.settings.status != 4){
					fileListTab += '<td style="width:150px; text-align:center">创建时间</td>';
				}
				fileListTab += '<td style="width:200px">操作</td></tr></table>';
				$(fileListTab).appendTo(_this.target);
			}
			
			for(var i = 0; i < arr.length; i++){
				if(_this.settings.status == 4){
					html += '<tr><td style="width:50px; text-align:center">'+(i+1)+'</td>'+
							'<td>'+(arr[i].name?arr[i].name:"")+'</td>' + 
							'<td style="width:100px; text-align:center">'+_this.changeUnit(arr[i].size)+'</td>' + 
							'<td>'+entryInfo().userName+'</td>';
				} else {
					html += '<tr><td style="width:50px; text-align:center">'+(i+1)+'</td>'+
							'<td>'+(arr[i].attachmentFileName?arr[i].attachmentFileName:"")+'</td>' + 
							'<td style="width:100px; text-align:center">'+_this.changeUnit(arr[i].attachmentSize)+'</td>' + 
							'<td>'+arr[i].createEmployeeName+'</td>';
				}
						
				if(_this.settings.status != 4){
					html += '<td style="width:150px; text-align:center">'+arr[i].createDate+'</td>';
				}
				
				html += '<td><a target="_blank" data-index="'+i+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>';
//				if(arr[i].attachmentType == "pdf"){
//					html += '<a data-index="'+i+'" class="btn btn-primary btn-sm btnPreview"><span class="glyphicon glyphicon-eye"></span>预览</a>';
//				}
				if(_this.settings.isPreview){
					html += '<a data-index="'+i+'" class="btn-primary btn-sm btnPreview" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</a>';
				}
				if(_this.settings.status == 1 || _this.settings.status == 3 ||_this.settings.status == 4){
					html += '<a data-index="'+i+'" class="btn-danger btn-sm btnDel" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-remove"></span>移除</a>';
				}
				html += '</td></tr>';
			}
			$(html).appendTo(_this.target.find(_this.fileListTab));
		},
		streamTarget:function(){
			return this._t;
		}
		
		
	};
	
	
//	$.fn[ pluginName ] = function (options) { 
////		console.log("审核流程传的参数："+JSON.stringify(options));
//		new Plugin(this, options);
//	};
	
//}(jQuery, window, document));

