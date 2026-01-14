/**
 * 2019-05-27  by  hwf
 * @param {Object} options  参数
 * @param {Object} target   目标元素
 */
/**
	 
 *获取当前页面目录
 */
 function getUrlPath(){  
　var url = document.location.toString();               
　if(url.indexOf("/") != -1){  
		 url = url.substring(0,  url.lastIndexOf("/")+1) ;  
　}  
　return url;  
}  

 /**
  * 获取当前js路径
  */
 function getJsUrlPath(){
	return window.UEDITOR_HOME_URL || getUEBasePath();
 }

 function getUEBasePath(docUrl, confUrl) {
	 return getBasePath(docUrl || self.document.URL || self.location.href, confUrl || getConfigFilePath());
 }
 
 function getConfigFilePath() {
	 var configPath = document.getElementsByTagName('script');
	 return configPath[ configPath.length - 1 ].src;
 }

 function getBasePath(docUrl, confUrl) {
	 var basePath = confUrl;
	 if (/^(\/|\\\\)/.test(confUrl)) {
		 basePath = /^.+?\w(\/|\\\\)/.exec(docUrl)[0] + confUrl.replace(/^(\/|\\\\)/, '');
	 } else if (!/^[a-z]+:/i.test(confUrl)) {
		 docUrl = docUrl.split("#")[0].split("?")[0].replace(/[^\\\/]+$/, '');
		 basePath = docUrl + "" + confUrl;
	 }
	 return optimizationPath(basePath);
 }

 function optimizationPath(path) {
	 var protocol = /^[a-z]+:\/\//.exec(path)[ 0 ],
		 tmp = null,
		 res = [];
	 path = path.replace(protocol, "").split("?")[0].split("#")[0];
	 path = path.replace(/\\/g, '/').split(/\//);
	 path[ path.length - 1 ] = "";
	 while (path.length) {
		 if (( tmp = path.shift() ) === "..") {
			 res.pop();
		 } else if (tmp !== ".") {
			 res.push(tmp);
		 }
	 }
	 return protocol + res.join("/");
 }
 
var areaPath = getJsUrlPath();  



function MultiLinkage(target, options){
	var defaults = {
		listUrl: config.bidhost + "/AreaController/getArea.do",
		getUrls:config.Syshost + "/SysDictController/findOptionsByName.do",
		status:1,  //1是可编辑，2是查看
		name:"regionCode",  //需要提交的name值   //后台返回的code值   
		code: "",
		// 1是省, 2是市, 3是区
		level: 3  
	}
	this.target = $(target);  //当前要追加的对象
	this.dataList = [];  //树形数据
	this.dataCodeFormat = {};  //格式化数据，键值为code
	this.sltCode = [];  //根据参数code值得到各个列表的code值
	this.sltName = [];  //根据参数code值得到各个列表的name值
	this.settings = $.extend( {}, defaults, options);
	this.init();
}
MultiLinkage.prototype = {
	//初始化方法
	init: function () { 
		var _this = this;
//		$.ajax({
//			url: _this.settings.listUrl,
//       	type: "post",
//       	async:false,
//       	success: function (data) {
//	         	if(data.success == false){
//	        		parent.layer.alert(data.message);
//	        		return;
//	        	}
//	         	var arr = data.data;
//       		_this.dataList = _this.getJsonTree(arr);
//       		console.log(_this.dataList);
//       		_this.setData(_this.dataList, 0);
//       	},
//       	error: function (data) {
////           	parent.layer.alert("加载失败");
//				console.log("加载失败");
//       	}
//   	});
//		var url = window.top.location.href.split('index')[0];
//		url = url.split('view')[0];
//		$.ajaxSettings.async = false;
		$.getJSON(areaPath+'prov-city.json', function(data) {
			_this.dataList = data;
			_this.treeToList(data, 0);
			
			_this.codeToName(_this.settings.code);

		});
     	_this.target.on("change", "select", function(){
     		$(this).nextAll().remove();
     		var code = $(this).val();
     		_this.getNextData(_this.dataList, code);
     		
     		_this.target.find("select").removeAttr("name");
     		_this.target.find("select:last").attr("name", _this.settings.name);
     	});
	},
	//树形结构
	getJsonTree: function(data, parentId) {
	    var _this = this,
	    	itemArr = [];
	    for (var i = 0; i < data.length; i++) {
	        var node = data[i];
	        if (node.pcode == parentId) {
	            var newNode = {};
	            newNode.code = node.val;
	            if(node.pcode){
	            	newNode.pcode = node.pcode;
	            } else {
	            	newNode.pcode = 0;
	            }
	            newNode.name = node.valDescCn;
	            newNode.childs = _this.getJsonTree(data, node.val);
	            itemArr.push(newNode);
	        }
	    }
	    return itemArr;
	},
	//树形结构转列表形式
	treeToList:function(data, pcode){
		var _this = this;
		for(var i = 0; i < data.length; i++){
			var key = data[i].code;
			_this.dataCodeFormat[key] = {code:data[i].code, name:data[i].name, pcode:pcode};
			if(data[i].childs && data[i].childs.length > 0){
				_this.treeToList(data[i].childs, data[i].code);
			}
		}
	},
	//添加下拉框
	setData:function(data, codeData){
		var _this = this,
			index = "";
		if(_this.target.find("select").length >= _this.settings.level){
			return;
		}
		
		if(data.length == 0){
			return;
		}
		
		//判断当前下拉框的code
		var code=codeData;
		if(typeof codeData === "object" && codeData.length > 0){
			code = codeData[0];
		}
		
		var html = '<select class="form-control" style="width: auto;display:inline-block;margin-right:10px;"><option value="">--请选择--</option>';
		for(var i = 0; i < data.length; i++){
			if(code && code == data[i].code){
				index = i;
				html += '<option value="' + data[i].code+'" selected="true">' + data[i].name+'</option>';
			} else {
				html += '<option value="' + data[i].code+'">' + data[i].name+'</option>';
			}
		}
		html += '</select>';
		$(html).appendTo(_this.target); 
		if(index !== "" && data[index].childs && data[index].childs.length > 0){
			if(typeof codeData === "object" && codeData.length > 0){
				codeData.splice(0, 1); 
				_this.setData(data[index].childs, codeData);
			} else {
				_this.setData(data[index].childs, data[index].code);
			}
		}
		_this.target.find("select:last").attr("name", _this.settings.name);
		
		
	},
	getNextData:function(data, code){
		var _this = this;
		for(var i = 0; i < data.length; i++){
			if(data[i].code == code){
				if(data[i].childs &&　data[i].childs.length > 0){
					_this.setData(data[i].childs, "");
				}
			} else if(data[i].childs && data[i].childs.length > 0) {
				_this.getNextData(data[i].childs, code);
			}
		}
		
	},
	//根据code得到各个列表的值
	codeToName:function(code){ 
		var _this = this;
		if(code){
			_this.getEach(code);
		}
		_this.target.html("");
		if(_this.settings.status == 1){
			if(code && _this.sltCode.length > 0){
				_this.setData(_this.dataList, _this.sltCode);  //如果有参数code，传object
			}else {
				_this.setData(_this.dataList, 0);  //没有参数code，传0
			}
		}
		if(_this.settings.status == 2) { 
			_this.target.html(_this.sltName.join(" "));
		}
	},
	//循环获取code和name
	/*getEach:function(code){
		var _this = this;
		if(_this.dataCodeFormat[code]){
			_this.sltCode.unshift(_this.dataCodeFormat[code].code);
			_this.sltName.unshift(_this.dataCodeFormat[code].name);
			if(_this.dataCodeFormat[code].pcode != 0){
				_this.getEach(_this.dataCodeFormat[code].pcode);
			}
		}
	}*/

	//循环获取code和name
	getEach: function(code) {
		var _this = this;
		if (_this.dataCodeFormat[code]) {
			if (_this.dataCodeFormat[code].pcode != _this.dataCodeFormat[code].code) {
				_this.sltCode.unshift(_this.dataCodeFormat[code].code);
				_this.sltName.unshift(_this.dataCodeFormat[code].name);
				if (_this.dataCodeFormat[code].pcode != 0) {
					_this.getEach(_this.dataCodeFormat[code].pcode);
				}

			} else if (_this.dataCodeFormat[code].pcode == _this.dataCodeFormat[code].code) {
				_this.sltCode.unshift(_this.dataCodeFormat[code].code);
				_this.sltName.unshift(_this.dataCodeFormat[code].name);
				if (_this.dataCodeFormat[code].pcode != 0) {
					_this.sltCode.unshift(_this.dataCodeFormat[code].pcode);
					_this.sltName.unshift(_this.dataCodeFormat[code].name);
				}
				for (var k = 0; k < _this.dataList.length; k++) {
					var firstCode = _this.dataList[k].code.substring(0, 2)
					var lastCode = _this.dataCodeFormat[code].code.substring(0, 2)
					if (firstCode == lastCode) {
						code = _this.dataList[k].code
						_this.sltCode.unshift(_this.dataList[k].code);
						_this.sltName.unshift(_this.dataList[k].name);
					}
				}
			}
		}
	}
}
