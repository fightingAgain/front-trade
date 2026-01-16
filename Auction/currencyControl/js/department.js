/*
 */
/*=======报价文件目录的封装js===== 
*========== JIN ===========
*====== 2020-05-07 ========
*/
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        Token:$.getToken(),
        url:top.config.AuctionHost+'/ProjectPackageController/updateDeptMsg.do',
        parameter:{},//接口调用的基本参数
        status: 1,   //1是编辑，2是查看
        roleType:1,//1代理机构，2采购人
        statusId:'',//身份id，
        isMust:true,//是否为必选
        inputName:'agencyDepartmentName',//数据回显的id
        tenderType:0,//0是询比，1是竞价，2是竞卖，4是招标，6是单一来源
        modelUrl:'bidPrice/currencyControl/model/departmentModel.html'
    };
    $.fn.department = function (options) {
        var options = ($.isPlainObject(options)||!options)?$.extend(true,{},defaults,options):$.extend({},defaults),
         _that=this,
        openModel=function(){
           $(_that).on('click',function(){
                parent.layer.open({
                    type: 2 //此处以iframe举例
                    ,title: '选择所属部门'
                    ,area: ['400px', '600px']
                    ,content:options.modelUrl
                    ,success:function(layero,index){
                        var iframeWind=layero.find('iframe')[0].contentWindow;
                        iframeWind.employee(options.statusId,callEmployeeBack,options.parameter.departmentIDOld,options.isMust)
                    },
                     
                })
            })
            
        },
        callEmployeeBack=function(dataTypeList){          
            var  itemTypeId=[],//归属不部门Id
            itemTypeName=[];//归属部门名称  
                    
            for(var i=0;i<dataTypeList.length;i++){
                itemTypeId.push(dataTypeList[i].id);	
                itemTypeName.push(dataTypeList[i].departmentName);
            };
            var typeIdList=itemTypeId.join(","),//项目类型的ID
            typeNameList=itemTypeName.join(",");//项目类型的名字     
            var pare={}
            for(var key in options.parameter){
                pare[key]=options.parameter[key]
            }
            pare.roleType=options.roleType;
            pare.tenderType=options.tenderType;
            pare.departmentIDNew=typeIdList;
            pare.departmentNameNew=typeNameList;
            $.ajax({
                type: "post",
                url: options.url,
                data:pare,
                dataType: "json",
                success: function (response) {
                    if(response.success){
                        parent.layer.alert('编辑成功')
                        $("#"+options.inputName).html(typeNameList);
                    }else{
                        parent.layer.alert(response.message)
                    }
                }
            });
           
            
        };
        return this.each(function() {			
			($.type(options) !== 'string')&&openModel();
				
		});       
    }
 
})(jQuery, window, document); 
