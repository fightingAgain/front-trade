 var saveUrl = config.tenderHost + '/BidSectionController/save.do'; // 点击添加项目保存的接口
 var tenderProjectUrl = config.tenderHost + '/TenderProjectController/get.do'; // 获取项目相关信息
 var getUrl = config.tenderHost + '/BidSectionController/get.do'; // 点击添加项目保存的接口
var id="",tenderProjectId="";

var tenderProjectClassifyCode = "";

var tenderArr;//招标项目相关信息

 $(function(){
 	//下拉框数据初始化
	initSelect('.select');
 	// 获取连接传递的参数
 	if($.getUrlParam("tenderProjectId") && $.getUrlParam("tenderProjectId") != "undefined"){
		tenderProjectId =$.getUrlParam("tenderProjectId");
	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
	} else {
		$(".tenderProjectClassifyCodeTxt").dataLinkage({
			optionName:"TENDER_PROJECT_CLASSIFY_CODE",
			selectCallback:function(code){
				tenderProjectClassifyCode = code;
			}
		});

		/*$.ajax({
	 		url: tenderProjectUrl,
	        type: "post",
	        data: {id:tenderProjectId},
	        success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}
	         	var arr = data.data;
	           	$('#bidSectionName').val(arr.tenderProjectName)
	        },
	        error: function (data) {
	            parent.layer.alert("加载失败");
	        }
		 });*/
		$('#bidEctionNum').val('1');
	}
 	
 	//获取项目相关信息
 	/*$.ajax({
 		url: tenderProjectUrl,
        type: "post",
        data: {id:tenderProjectId},
        success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	for(var key in arr){
            	$("[name='"+key+"']").val(arr[key]);
           	} 
        },
        error: function (data) {
            parent.layer.alert("加载失败");
        }
 	})*/
 	
 	var date = new Date();
 	//开工日期
    $('#commencementDate').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d',
		timepicker: false,// true 显示timepicker   false 隐藏timepicker
		minDate:date
	});
 	//计划开工日期
   /* $('#startDate').datetimepicker({
		step:5,
		lang:'ch',
		format:'Y-m-d H:i:s',
		minDate:date
	});*/
 	//计划竣工日期
    $('#endDate').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d',
		minDate:date
	});
 	//计划发包时间
    $('#bidDate').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d H:i',
		minDate:date
	});
 	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//提交
	$("#btnSubmit").click(function(){
		if(checkForm($("#formName"))){//必填验证，在公共文件unit中
			saveForm();
		}
		
	});
	//投标文件递交
	$('input[type=radio][name=deliverType]').change(function() {
		displayRadio(this.value);
   	});
	$('.pay').change(function(){
		displayInp(this);
		
	});
 });
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm() {
 	var arr = {}, tips="";
 	$('input[type=radio][name=bidOpenType]').prop('disabled',false);
    $('input[type=radio][name=bidCheckType]').prop('disabled',false);
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
 	if(id != ""){
 		arr.id = id;
 	}
 	arr.tenderProjectClassifyCode = tenderProjectClassifyCode;
 	arr.tenderProjectId = tenderProjectId;
	$.ajax({
         url: saveUrl,
         type: "post",
         data: arr,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
            parent.layer.alert("添加成功",{icon:1,title:"提示"});
			window.parent.frames[0].bidSectionList();
			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
			parent.layer.close(index); //再执行关闭  
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
	});
 };
 function getDetail() {	
     $.ajax({
         url: getUrl,
         type: "post",
         data: {id:id},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	for(var key in arr){
         		if(key == "projectCosts"){
         			for(var i = 0; i < arr[key].length; i++){
//       				
						if(arr[key][i].costName == "招标文件费"){
							$("[name='projectCosts[0].isPay']").val([arr[key][i].isPay]);
							$("[name='projectCosts[0].payMoney']").val(arr[key][i].payMoney);
							displayInp("[name='projectCosts[0].isPay'][value='"+arr[key][i].isPay+"']");
						} /*else {
							$("[name='projectCosts[1].isPay']").val([arr[key][i].isPay]);
							$("[name='projectCosts[1].payMoney']").val(arr[key][i].payMoney);
							displayInp("[name='projectCosts[1].isPay'][value='"+arr[key][i].isPay+"']");
						}*/
         			}
         		} else if(key == "tenderProjectClassifyCode"){
         			$(".tenderProjectClassifyCodeTxt").dataLinkage({
						optionName:"TENDER_PROJECT_CLASSIFY_CODE",
						optionValue:arr[key],
						selectCallback:function(code){
							tenderProjectClassifyCode = code;
						}
					});
         		}else {
            		var newEle = $("[name='"+key+"']")
            		if(newEle.prop('type') == 'radio'){
            			newEle.val([arr[key]]);
            			displayRadio(arr.deliverType);//投标文件递交方式
            		}else if(newEle.prop('type') == 'checkbox'){
            			newEle.val(arr[key]?arr[key].split(','):[]);
            		}else{
            			newEle.val(arr[key]);
            		}
            	}
           	}      	
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
};
function displayInp(obj){
	var name = $(obj).attr("name");
	var pay_input =	$(obj).closest("tr").find(".pay_input");
	if($("[name='"+name+"']:checked").val() == 0){
		pay_input.prop('readonly',true);
	}else{
		pay_input.prop('readonly',false);
	}
};
//投标文件递交方式设置为线下时，那就只能线下开标、线下评审
function displayRadio(val){
	if (val == '2') {
            $('input[type=radio][name=bidOpenType]').prop('disabled',true);
            $('input[type=radio][name=bidOpenType]').val(['2']);
            $('input[type=radio][name=bidCheckType]').prop('disabled',true);
            $('input[type=radio][name=bidCheckType]').val(['2']);
        }else if (val == '1') {
            $('input[type=radio][name=bidOpenType]').prop('disabled',false);
            $('input[type=radio][name=bidCheckType]').prop('disabled',false);
        }
}