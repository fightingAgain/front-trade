

var Detailedsave=top.config.bidhost +'/PackageDetailedController/save.do'//明细添加
var Detailedupdate=top.config.bidhost +'/PackageDetailedController/update.do'//明细修改
var packageId=getUrlParam('packageId');
var sort=getUrlParam('sort');
var detailedId=getUrlParam('detailedId');
var type=getUrlParam('type');
$('#packageId').val(packageId);//名称      
$("#sort").val(sort);
$("#detailedId").val(detailedId);
$("#btn_submit").on('click',function(){
	if($('#DetailedName').val()==""){
		parent.layer.alert("请输入名称");	     	 		
 	    return;
	}
	if($('#DetailedCount').val()==""){
		parent.layer.alert("请输入数量");	     	 		
 	    return;
	}
	if(!(/^[0-9]*$/.test($('#DetailedCount').val()))){ 
        parent.layer.alert("数量只能是正整数");  
        return;
	};
	if(!$('#DetailedCount').val().length>12){ 
        parent.layer.alert("数量过长，不能超过12位");  
        return;
    };
	if($('#DetailedUnit').val()==""){
		parent.layer.alert("请输入单位");	     	 		
 	    return;
	};
	if($('#DetailedUnit').val().length>10){
		parent.layer.alert("单位过长");	     	 		
 	    return;
	};
	if(type=="add"){
		submit();
	}else{
		submitEidt();
	};
	
})
$("#btn_close").on("click",function(){
	top.layer.close(parent.layer.getFrameIndex(window.name));
})
function submit(){
	$.ajax({
	   	url:Detailedsave,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){	 
	   		if(data.success){
	   			parent.layer.alert("添加成功");
	   			top.layer.close(parent.layer.getFrameIndex(window.name));
	   		}
	   		   			
	   	}  
	 });
}
function submitEidt(){
	$.ajax({
	   	url:Detailedupdate,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){	 
	   		if(data.success){
	   			parent.layer.alert("添加成功");
	   			top.layer.close(parent.layer.getFrameIndex(window.name));
	   		}
	   		   			
	   	}  
	 });
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
