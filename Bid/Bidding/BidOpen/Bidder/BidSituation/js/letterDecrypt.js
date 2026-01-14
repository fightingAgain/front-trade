/**
*  zhouyan 
*  2019-3-15
*  信封解密（投标人）
*  方法列表及功能描述
*/

var bidId='';//标段Id
var bidOpeningConfigurationId = '';
var letterDecrypt='';//信封码
$(function(){
//	importFile()
	$("#files").change(function () {
		var _this = this;
        fileUpload_onselect(_this);
    })
	
})
//传给父页面
function fromChild(callback){  
	$("#btnSubmit").click(function(){
		if($("#letterCode").val() == ''){
			parent.layer.alert('请输入信封码！')
		}else{
			letterDecrypt = $("#letterCode").val();
			callback(letterDecrypt);
			var index=parent.layer.getFrameIndex(window.name);
        	parent.layer.close(index);
		}
	});
}

//function importFile(){
	
	
    function fileUpload_onselect(obj){
       var selectedFile = document.getElementById("files").files[0];
        var reader = new FileReader();//这是核心！！读取操作都是由它完成的
        reader.readAsText(selectedFile,'gb2312');
        reader.onload = function(oFREvent){//读取完毕从中取值
            var pointsTxt = oFREvent.target.result;
            $("#letterCode").val(pointsTxt)
        }
    }
//}
