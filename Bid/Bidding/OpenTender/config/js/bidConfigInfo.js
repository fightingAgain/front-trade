	var queryUrl = config.openingHost  + "/BidConfigController/findBidConfig.dao"; //查询当前配置接口
	var saveUrl = config.openingHost  + "/BidConfigController/saveBidConfig.dao"; //保存开标设置接口

	$(function(){
		//加载列表
		editForm();
	});

	//保存
	$("#btnSave").click(function(){
		debugger;
		if(checkForm($("#formBidConfig"))){
			var paraStr = $("#formBidConfig").serialize();
			$.ajax({
			    url: saveUrl,
			    type: "post",
			    data: paraStr,
			    success: function (data) {
			       	if(data.success){
			        	layer.alert("添加成功");
			        	$("#id").val(data.data.id);
			        	$("#enterpriseId").val(data.data.enterpriseId);
			        }else{
			        	layer.msg(data.message);
			        }
			    },
			    error: function (data) {
			        layer.alert("加载失败");
			    }
			});
		} 
	});

	/**
	 * 编辑表单
	 */
	function editForm(){
		$.ajax({
	         url: queryUrl,
	         type: "get",
	         success: function (data) {
	         	var bidConfigData = data.data;
	         	//循环信息数据
	            for(key in bidConfigData) {
	                var element = $("[name=" + key + "]")[0];
				    if(element && element.tagName == 'INPUT') {
				        switch(element.type) {
				            case "text":
				                $("input[name=" + key + "]").val(bidConfigData[key]);
				                break;
				            case "hidden":
				                $("input[name=" + key + "]").val(bidConfigData[key]);
				                break;
				            case "number":
				                $("input[name=" + key + "]").val(bidConfigData[key]);
				                break;
				            case "radio":
				                $("input[name='" + key + "'][value=" + bidConfigData[key] + "]").attr("checked", true);
				                break;
				            case "checkbox":
				                if(bidConfigData[key] != null){
				                    var arrType = bidConfigData[key].split(',');
				                    for(var i = 0; i < arrType.length; i++) {
				                        $("input[name='" + name + "'][value=" + arrType[i] + "]").attr("checked", true);
				                        if(name == "personRole") {
				                            $('#expand'+arrType[i]).show();
				                        }
				                    }
				                }
				            break;
				        }
	        		}else if(element && element.tagName == 'SELECT'){
	        			$("[name=" + key + "]").val(bidConfigData[key]);
	        		}
	            }
	         },
	         error: function (data) {
	            parent.layer.alert("加载失败");
	         }
	   });
	}