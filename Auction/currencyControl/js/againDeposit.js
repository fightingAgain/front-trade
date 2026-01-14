/*
 * @Author: Jin
 * @Date: 2020-10-27 11:16:36

 * @LastEditTime: 2021-01-25 14:37:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork\bidPrice\currencyControl\js\againDeposit.js
 */ 
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        saveurl:top.config.AuctionHost+ '/DepositDivertController/saveProjectDepositSuppliers.do',//保存接口
        viewURL:top.config.AuctionHost+'/DepositDivertController/findProjectDepositSuppliers',//回显接口
        Token:$.getToken(),
        parameter:{},//接口调用的基本参数
        packageData:new Array(),//包件数组
        tenderType:0,//采购类型0询比，1竞价，2竞卖，6单一来源
        status: 1,   //1是编辑，2是查看
        custom:true,//是否自定义表格
        isPayDeposit:0,//是否需要递交保证金，0是需要，1是不需要；
        attachmentState:2,   //1调用接口添加到数据库中，2是添加到数组中
        attachmentData:new Array(),//保证金表数组  
        tableName:'depositTable',
        successMsg:function(tips){

        },
        columns: [
            
        ]      
    };
 
    function Deposit($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.init();
    }
    Deposit.prototype = {
        constructor: Deposit,
        init: function () {
            this.getData();//获取数据 
           
            if(this.options.attachmentData.length>0){
                this.renderHtml();//渲染页面
            }                
        },
        renderHtml: function () {
            var options = this.options;
            var _that=this;
            var data=new Array();//数组
            data=data.concat(options.attachmentData);//重构数组获取供应商保证金数组
            var column=new Array();
            column.push(
                {
                    field: 'xh',
                    title: '序号',
                    align: 'center',
                    width: '50px',
                    formatter: function(value, row, index) {				 
                        return index + 1;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                    }
                }
            )
            if(options.tenderType==1){
                column.push(
                    {
                        field: 'packageId',
                        title: '包件名称',
                        align: 'left',
                        width:'180px',
                        formatter: function(value, row, index) {				 
                            return row.transferPackageName;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                        }	               
                    }
                )
            }
            column.push({
				field: 'bidderName',

				title: '供应商',
				align: 'left',
                width:'180px',	               
			},{
				field: 'depositTotalPrice',
				title: '保证金递交金额(元)',
				align: 'right',
                width:'140px',	               
			},{
				field: 'bankState',
				title: '状态',
				align: 'center',
                width:'70px',
                formatter: function(value, row, index) {				 
                    switch (value) {
                        case '0':                          
                            return '未退还'
                        case '1':                          
                            return '审核中'
                        case '2':                          
                            return '退款成功'
                        case '3':                          
                            return '退款失败'                       
                    }
                }	               
			},{
				field: 'transferTime',
				title: '转入时间',
				align: 'center',
                width:'150px',	               
			})           
            column.push(
                {
                    field: 'transferState',
                    title: (options.status==1?'操作':'转入状态'),
                    align: 'left',
                    width:'150px',
                    events:{
                        'change input[name="transferState"]':function(e,value, row, index){
                            if(this.checked==true){
                                options.attachmentData[index].transferState=2
                            }else{
                                delete options.attachmentData[index].transferState;
                            }                               
                        }
                    },
                    formatter: function(value, row, index) {	
                        if(options.status==1){			 
                            if(row.bankState==0||row.bankState==3){
                                return '<input type="checkbox" id="transferState_'+ index +'"  name="transferState" value="2" '+ ((row.transferState==2||row.transferState==3)?'checked':'') +'/>保证金转移到本项目'  
                            }
                        }else{
                            if(row.transferState){
                                if(row.transferState==2){
                                    return '转入'
                                }else{
                                    return '未转入'
                                }
                            }else{
                                return '未转入'
                            }
                        }
                    }               
                }
            )               
            if(!options.custom){
                _that.$ele.bootstrapTable({
                    columns: column,                   
				});									
                _that.$ele.bootstrapTable("load", data);  
                if(options.tenderType==1){
                    //数据加载成功后 进行合并  这里我只是同名合并projName subProj phase 如果需要合并更多的字段 仿照添加对应的代码就可以了
                    _that.mergeTable(data,_that.$ele);
                }                             
            }else{
                var html = [];               
                html.push('<table class="table table-bordered" style="margin-bottom: 0px;">') 
                html.push('<tr>')
                html.push('<td colspan="4" class="active"><strong>原项目保证金转移到本项目</strong></td>')
                html.push('</tr>')		  	
                html.push('<tr>')
                html.push('<td colspan="4">')
                html.push('<table class="table  table-bordered" style="margin-bottom:5px ;" id="'+ options.tableName +'"></table>')	           
                html.push('</td>')
                html.push('</tr>')
                html.push('</table>')
                _that.$ele.html(html.join(""))                             
				$("#"+options.tableName).bootstrapTable({
                    columns: column,                  
				});									
                $("#"+options.tableName).bootstrapTable("load", data);
                if(options.tenderType==1){
                    //数据加载成功后 进行合并  这里我只是同名合并projName subProj phase 如果需要合并更多的字段 仿照添加对应的代码就可以了
                    _that.mergeTable(data,options.tableName);
                }	                               
            }                    
        }, 
        getData:function(){
            var options = this.options;
            var _that=this;
            if(options.status==2){
                options.parameter['isEdit']=1;
            }
            $.ajax({
                type: "post",
                url:options.viewURL,
                data:options.parameter,
                dataType: "json",
                async:false,
                success: function (response) {
                    if(response.success){
                        if(response.data){
                            options.attachmentData=new Array()
                            for(var key in response.data){
                                if( response.data[key]){
                                    for(var i=0;i<response.data[key].length;i++){
                                        response.data[key][i].packageId=key;                                                                                                                                                                         
                                        options.attachmentData.push(response.data[key][i]);
                                    }
                                }  
                            }
                        }    
                    }
                }
            });
        },
        subitemData:function(){
            var options = this.options;
            var _that=this;
            var msgData=[];
            
            if(options.attachmentData.length>0){
                for(var z=0;z<options.attachmentData.length;z++){
                    if((options.attachmentData[z].bankState==3||options.attachmentData[z].bankState==0)&&options.attachmentData[z].transferState!=2&&options.attachmentData[z].transferState!=3){
                        msgData.push(options.attachmentData[z].bidderName)
                    }
                }
                 
            }

            return msgData.join(',');    
        },
        saveData:function(isSubmit){
            var options = this.options;

            var _that=this;           
            if(options.attachmentData.length>0){
                var packages=new Array();
                packages=packages.concat(options.packageData); 
                for(var i=0;i<packages.length;i++){
                    packages[i].bidderInfos=[];
                    packages[i].isSubmit=isSubmit;
                    for(var z=0;z<options.attachmentData.length;z++){
                        if(options.attachmentData[z].transferState==2||options.attachmentData[z].transferState==3){
                            if(packages[i].packageId==options.attachmentData[z].packageId){                              
                                packages[i].bidderInfos.push({
                                    accountName:options.attachmentData[z].accountName,
                                    accountNum:options.attachmentData[z].accountNum,
                                    alreadyRefundPrice:options.attachmentData[z].alreadyRefundPrice,
                                    bankName:options.attachmentData[z].bankName,
                                    bankState:options.attachmentData[z].bankState,
                                    bidSectionId:options.attachmentData[z].bidSectionId,
                                    bidStatus:options.attachmentData[z].bidStatus,
                                    bidderId:options.attachmentData[z].bidderId,
                                    bidderName:options.attachmentData[z].bidderName,
                                    bidderUnifiedCode:options.attachmentData[z].bidderUnifiedCode,
                                    depositBalance:options.attachmentData[z].depositBalance,
                                    depositTotalPrice:options.attachmentData[z].depositTotalPrice,
                                    id:options.attachmentData[z].id,
                                    inBank:options.attachmentData[z].inBank,
                                    isDeleted:options.attachmentData[z].isDeleted,
                                    submitStatus:options.attachmentData[z].submitStatus,
                                    transferOutPackageId:options.attachmentData[z].transferOutPackageId,
                                    transferPackageName:options.attachmentData[z].transferPackageName,
                                    transferState:2,
                                    transferTime:options.attachmentData[z].transferTime,
                                });                                
                            }
                        }                    
                    }
                }
                $.ajax({
                    type: "post",
                    url: options.saveurl,
                    data:JSON.stringify(packages) ,
                    contentType:"application/json;charset=utf-8",
                    dataType: "json",
                    async:false,
                    success: function (response) {
                        if(!response.success){
                            parent.layer.alert(response.message)
                        }
                    }
                });
            }
            
        },
        mergeTable:function(data,tableName){
            var rows=data;
            var rowspan=0;
            var index=0;
            var packageId;
            $.each(rows,function(i,row){
                if(i==0){
                    packageId=row.packageId;
                    rowspan=1;
                    index=i;
                }else{
                    if(packageId==row.packageId){
                        rowspan++;
                    }
                    else{
                       
                        $('#'+tableName).bootstrapTable('mergeCells',{index:index, field:"packageId", colspan: 1, rowspan: rowspan});
                        packageId=row.packageId;
                        rowspan=1;
                        index=i;
                    }
                    if(i==(rows.length-1)){                       
                        $('#'+tableName).bootstrapTable('mergeCells',{index:index, field:"packageId", colspan: 1, rowspan: rowspan});
                    }
                }
            })    
        }
    };
    $.fn.deposit = function (options) {
        options = $.extend(defaults, options || {});
        return new Deposit($(this), options);
    }
 
})(jQuery, window, document);