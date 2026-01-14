// 2019-03-09 by H

;(function ( $, window, document) {
	var pluginName = "dataLinkage",
	//默认配置参数
	defaults = {
		//获取地区接口
		getUrls:config.Syshost + "/SysDictController/findOptionsByName.do",   //获取全部数据源
		getNextUrls:config.Syshost + "/SysDictController/getChildren.do",  // 获取下一级数据
		
		optionName:"",  //选项名称
		
		optionValue:"",  // 当前选择的code
		
		status:1,  //1是可编辑，2是查看
		
		areAll: false ,//是否有全部选项，搜索用
		//根据城市code获取province的code
		isViewAll: false, // 是否查看所有层级
			
		viewCallback:function(name){
			//根据code返回的文本值
		},
		
		selectCallback:function(code){
			//当选择下拉列表时，返回最后一个下拉框的值
		}
	};
	
	//
	function Plugin(options, target){
		this.settings = $.extend( {}, defaults, options);
		this.nodeFormat = [];
		this.dataValueFormat = {};
		this.dataIdFormat = {};
		this.curValue = [];
		this.sltName = [];
		this.nodeNum = 1;
		this.target = target;
		this.init();
	};
	
	Plugin.prototype = {
		init: function () {
			var _this = this;
			if(!entryData){
				entryInfo();
			}
			$.ajax({
				url: _this.settings.getUrls,
	         	type: "post",
	         	async:false,
	         	data:{optionName:_this.settings.optionName},
	         	success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	if(data.data && data.data.length > 0){
			         	var arr = data.data;
			         	if(_this.settings.status == 2 || (entryData.isAgency == 1 && _this.settings.optionName == "TENDER_PROJECT_TYPE")){
				         	arr.push({
				         		optionName: "TENDER_PROJECT_TYPE",
								optionText: "广宣类",
								optionValue: "C50",
								isEnable: 1,
								pid: "0"});
						}
			         	for(var i = 0; i < arr.length; i++){
			         		_this.dataValueFormat[arr[i].optionValue] = arr[i];
			         		_this.dataIdFormat[arr[i].id] = arr[i];
			         	}
			         	if(_this.settings.optionValue != "" && _this.dataValueFormat[_this.settings.optionValue]){
				     		_this.getParentValue(_this.dataValueFormat[_this.settings.optionValue].id);
							if(_this.settings.isViewAll){
								_this.settings.viewCallback(_this.sltName.join(" - "));								
							}else{
								_this.settings.viewCallback(_this.sltName[_this.sltName.length - 1]);
							}
	//			     		console.log("根据code获取列表值："+_this.curValue);
				     	}
			         	if(_this.settings.status == 2){
			         		return;
			         	}
		         		_this.nodeFormat = _this.getJsonTree(arr, 0);
	//	         		console.log(JSON.stringify(_this.nodeFormat)+"%%%%");
						if(_this.curValue.length > 0){
							_this.setData(_this.nodeFormat, _this.curValue);
						} else {
		         			_this.setData(_this.nodeFormat, 0);
		         		}
					}
	         	},
	         	error: function (data) {
	             	parent.layer.alert("加载失败");
	         	}
	     	});
	     	
	     	
	     	
	     	_this.target.on("change", "select", function(){
	     		$(this).nextAll().remove();
	     		var optionValue = $(this).val();
	     		_this.getNextData(_this.nodeFormat, optionValue);
	     		var code = _this.target.find("select:last").val();
	     		_this.settings.selectCallback(code);
	     	});
		},
		getJsonTree: function(data, parentId) {
		    var itemArr = [];   
		    var _this = this;
		    for (var i = 0; i < data.length; i++) {
		        var node = data[i];
		        if(!node.pid){
		        	node.pid = 0;
		        }
		        if(node.pid == parentId) {
		            var newNode = {};
		            newNode = node;
//		            var keys = node.optionValue;
//		            var name = node.optionText;
//	//	            console.log(keys);
//		            newNode[keys] = name;
		            newNode.nodes = _this.getJsonTree(data, node.id);
		            
		            itemArr.push(newNode);
		        }
		    }
		    return itemArr;
		    
		},
		getNextData:function(data, optionValue){
			var _this = this;
			for(var i = 0; i < data.length; i++){
				if(data[i].optionValue == optionValue){
					if(data[i].nodes.length > 0){
						_this.setData(data[i].nodes, data[i].nodes[0].optionValue);
					}
				} else if(data[i].nodes.length > 0) {
					_this.getNextData(data[i].nodes, optionValue);
				}
			}
			
		},
		setData:function(data, optionValue, isExit){
//			console.log("*********"+optionValue);
			var _this = this;
			if(data.length == 0){
				return;
			}
			var html = '<select class="form-control" style="width: auto;display:inline-block;margin-right:10px;">';
			var sltIndex = 0;
			
			var curval=optionValue;
			if(typeof optionValue === "object" && optionValue.length > 0){
				curval = optionValue[0];
			}
			if(_this.settings.areAll){
				html += '<option value="" selected="true">全部</option>';
			}
			
			for(var i = 0; i < data.length; i++){			
				var node = data[i];
				if(node.optionValue == curval){
					sltIndex = i;
					html += '<option value="'+node.optionValue+'" selected="true">'+node.optionText+'</option>';   
				} else {
					if(node.isEnable == 1){
						html += '<option value="'+node.optionValue+'">'+node.optionText+'</option>';
					}
				}
			}
			html += '</select>';
			$(html).appendTo(_this.target);	
			
			var code = _this.target.find("select:last").val();
			_this.settings.selectCallback(code);
			if(typeof optionValue === "object" && optionValue.length > 1){
				var arr = optionValue.splice(0, 1);
				_this.setData(data[sltIndex].nodes, optionValue);
			} else {
				 _this.setData(data[sltIndex].nodes, 0);
				
			}
			
		},
		
		getParentValue:function(id){
			var _this = this;
			_this.curValue.unshift(_this.dataIdFormat[id].optionValue);
			_this.sltName.unshift(_this.dataIdFormat[id].optionText);
			if(_this.dataIdFormat[id].pid && _this.dataIdFormat[id].pid != 0){
				_this.getParentValue(_this.dataIdFormat[id].pid);
			}
		}
	};
	$.fn[ pluginName ] = function (options) { 
//		console.log(JSON.stringify(options));
		new Plugin(options, this);
	};
}(jQuery, window, document));