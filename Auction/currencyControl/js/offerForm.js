/*=======报价表的封装js===== 
*========== JIN ===========
*====== 2020-05-07 ========
*/
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        saveurl:'',//保存接口
        viewURL:'',//回显接口
        deleteUrl:'',//删除接口
        offerInfoUrl:'',//报价详情的接口
        isRecord:true,   //是否显示列表
        Token:$.getToken(),
        parameter:{},//接口调用的基本参数
        status: 1,   //1是编辑，2是查看，3供应商报价，4供应商查看，5评审
        isDefaultData:1,//1为存在一条默认数据，2为不存在
        custom:true,//是否自定义表格
        headerBtn:'addOffer',//自定义添加按钮名称
        offerSubmit:'offerBtn',
        tableName:'offerTable',
        customModal:true,//是否自定义弹出框
        modalHtml:'bidPrice/currencyControl/model/offerModel.html',//弹出层的路径	
        modaltextHtml:'bidPrice/currencyControl/model/offerModeltext.html',
        modalWidth:'500px',
        modalHeight:'550px',
        attachmentState:2,   //1调用接口添加到数据库中，2是添加到数组中
        attachmentData:[],//报价表数组  
        offerData:new Object(),//供应商报价数组
        columns: [
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {				 
					return index + 1;  //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'productServices',
				title: '产品或服务',
				align: 'left',

                width:'200px',	
                formatter:function(value, row, index){
				    var str = '';				    
                    var html='<div>'+ (row.purchaseCode||"") +'</div>'

                            +'<div style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ (value) +'">'+ value  +'</div>'
                    return html 
                }
			}, {
				field: 'quotePriceType',
				title: '报价类型',
				align: 'left',
				width:'120px',
				formatter: function(value, row, index) {
					if(value==1){
						var list="报价-价格"
					}else if(value==2){
						var list='报价-费率'
					}else if(value==3){
						var list='数字'
					}else if(value==4){
						var list='文本'
					}
					return list
				}
			},{
				field: 'quotePriceName',
                title: '报价要求',

                align: 'left',
                width:'200px',
				formatter: function(value, row, index) {
                    var html=[];
                    if(row.quotePriceType!=4){                       
                        if(row.quotePriceName){
                            html.push(row.quotePriceName+'；');
                        }
                        if(row.quotePriceUnit){
                            html.push(row.quotePriceUnit+'；');
                        }
                        if(row.pointNum!==undefined){
                            html.push(row.pointNum+'位小数'+(row.pointNum!=0?'；':'。'));
                        }
                        if(row.pointNum!=0){
                            html.push('小数点后最后一位'+(row.pointLast==1?'可为0':'不可为0')+'。');
                        }
                    }else{
                        html.push(row.priceDemands+'。');
                    }
					
					return html.join("")   
				}
			}, {
				field: 'remark',
				title: '备注',
				width: '300px',
                align: 'left',
                cellStyle:{
                	css:{"white-space":"normal","word-break":"break-all"}
                },
                formatter:function(value, row, index){
                   
					if((defaults.status == 3 || defaults.status == 4) && value == '因数据迁移，原明细信息合并到“产品或服务”栏位，按名称,型号,数量,单位,备注顺序”,”分隔'){
						return ""
					}else{
						 if(value){
							return value 
						}else{
							return ""
						}
					}
                   
                    
                }
			},		
		],      
    };
 
    function OfferForm($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.init();
    }
    OfferForm.prototype = {
        constructor: OfferForm,
        init: function () { 
            if(this.$ele.parent()){//如果有父级去清除父级的内边距；
                this.$ele.parent().css('padding','0px');
            }
            this.viewAjax();//获取列表信息
            if(this.options.isDefaultData==1&&this.options.status==1){
                this.defaultData();//默认插入一条数据
            }
            this.renderHtml();//渲染页面
            this.openModel(null);//初始化添加时间           
            this.offerSubmit();//初始化提交事件    
        },
        renderHtml: function () {
            var options = this.options;
            var _that=this;
            var data=options.attachmentData;
            var column=new Array();
            column=column.concat(options.columns);        
            if(options.status==1){
                column.push(
                    {
                        field: '',
                        title: '操作',
                        align: 'left',
                        width: '140',
                        events:{
                            //调用编辑功能
                            'click .editModel':function(e,value, row, index){
                                _that.editModel(row.id,index)
                            },
                            //调用删除功能
                            'click .deleteAjax':function(e,value, row, index){
                                _that.deleteAjax(row.id,index)
                            },
                            //调用删除功能
                            'click .MoveUpward':function(e,value, row, index){
                                _that.MoveUpward(row.id,index)
                            },
                            //调用删除功能
                            'click .MoveDown':function(e,value, row, index){
                                _that.MoveDown(row.id,index)
                            },
                        },
                        formatter: function(value, row, index) {
                            var html=[];
                            if(index>0){
                                html.push('<button type="button" class="btn btn-xs btn-primary editModel" style="margin-bottom:5px" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>');
                                html.push('<button type="button" class="btn btn-xs btn-danger deleteAjax" style="margin-bottom:5px" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>');
                                html.push('<button type="button" class="btn btn-xs btn-default MoveUpward" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>上移</button>');
                                html.push('<button type="button" class="btn btn-xs btn-default MoveDown" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>下移</button>');  
                            } else{
                                html.push('<button type="button" class="btn btn-xs btn-primary editModel" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>');
                            }
                            return html.join("")   
                        }
                    }
                )
            }
            if(options.status==3||options.status==4){
                column.push(
                    {
                        field: 'offerPrice',
                        title: '报价',
                        align: 'left',
                        width: '150', 
                        events:{
                            'change .offerTotalPrice':function(e,value, row, index){
                                _that.offerVerification(row,this)
                            },
                            'change .offerPrice':function(e,value, row, index){
                                _that.offerVerification(row,this)
                            },
                              //调用编辑功能
                            'click .edittextModel':function(e,value, row, index){
                                _that.edittextModel(row.id,index)
                            },
                            'click .detailtexttModel':function(e,value,row,index){
                            	 _that.detailtexttModel(row.id,index)
                            }
                        },
                        formatter: function(value, row, index) {
                            var detailList=new Array();
                            if(options.offerData.detailList){
                                detailList=options.offerData.detailList;
                            }                          
                            var list='<input type="hidden" name="detailList['+ index +'].packageDetailedId" value="'+ row.id +'"/>'
                            list+='<input type="hidden" name="detailList['+ index +'].quotePriceType" value="'+ row.quotePriceType +'"/>'
                            if(index==0){
                                var str='<input datatype="*" errormsg="请填写正确的报价合计" type="text" oninput="verifyMoney(this, '+(row.pointNum?row.pointNum:"2")+')" priceType="报价合计" name="priceTotal" class="offerTotalPrice form-control" value="'+ (options.offerData.priceTotal||'') +'" />';  
                            }else{
                                if(detailList.length>0){
                                    for(var i=0;i<detailList.length;i++){
                                        if(detailList[i].packageDetailedId==row.id){
                                            if(row.quotePriceType==4){
                                                var str= '<input type="hidden" datatype="*" errormsg="报价表第'+(index+1)+'行，请填报价" oninput="verifyMoney(this, '+(row.pointNum?row.pointNum:"2")+')" priceType="报价" name="detailList['+index +'].saleTaxTotal" class="offerPrice form-control" value="'+ (detailList[i].saleTaxTotal||'') +'"/>' 
//                                              str += '<span class="saleTaxTotalTxt">'+(detailList[index].saleTaxTotal?detailList[index].saleTaxTotal:"")+'</span>';
                                                if(options.status==3){   
                                                    str+='<button type="button" class="btn btn-xs btn-primary edittextModel" data-id="'+ row.id +'" data-index="'+ i +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑文本</button>'
                                                }
                                            }else{
                                                var str='<input type="text" datatype="*" errormsg="报价表第'+(index+1)+'行，请填报价" oninput="verifyMoney(this, '+(row.pointNum?row.pointNum:"2")+')" priceType="报价" name="detailList['+index +'].saleTaxTotal" class="offerPrice form-control" value="'+ (detailList[i].saleTaxTotal||'') +'" />'; 
                                            }
                                            
                                        }
                                    }
                                }else{                                 
                                        if(row.quotePriceType==4){
                                            var str= '<input type="hidden" datatype="*" errormsg="报价表第'+(index+1)+'行，请填报价" oninput="verifyMoney(this, '+(row.pointNum?row.pointNum:"2")+')" priceType="报价" name="detailList['+index +'].saleTaxTotal" class="offerPrice form-control" />' 
                                            //str += '<span class="saleTaxTotalTxt">'+(detailList[index].saleTaxTotal?detailList[index].saleTaxTotal:"")+'</span>'
                                            if(options.status==3){
                                                str+='<button type="button" class="btn btn-xs btn-primary edittextModel" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑文本</button>'
                                            }else{
                                                str+='<button type="button" class="btn btn-xs btn-primary detailtexttModel" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看文本</button>'
                                            }     
                                        }else{
                                            var str='<input type="text" datatype="*" errormsg="报价表第'+(index+1)+'行，请填报价" oninput="verifyMoney(this, '+(row.pointNum?row.pointNum:"2")+')" priceType="报价" name="detailList['+index +'].saleTaxTotal" class="offerPrice form-control" />';
                                        }
                                }                                  
                            }
                            if(options.status==3){
                                return str+list;
                            }else{
                                if(index==0){
                                    return options.offerData.priceTotal;  
                                }else{
                                    for(var i=0;i<detailList.length;i++){
                                        if(detailList[i].packageDetailedId==row.id){
//                                      	
                                            if(row.quotePriceType==4){
	                                            return '<span id="totalPriceTxt" style="display:none;">'+detailList[i].saleTaxTotal+'</span><button type="button" class="btn btn-xs btn-primary detailtexttModel" data-id="'+ row.id +'" data-index="'+ index +'"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看文本</button>' 
                                            }else{
                                                return detailList[i].saleTaxTotal;
                                            }
                                            
                                        }
                                    }
                                }
                                
                                
                            }                             
                        }
                    }
                )
            }
            if(!options.custom){
                _that.$ele.bootstrapTable({
					columns: column
				});									
                _that.$ele.bootstrapTable("load", data);                               
            }else{
                var html = [];               
                html.push('<table class="table table-bordered" style="margin-bottom: 0px;">') 
                html.push('<tr>')
                if(options.status==1){
                    html.push('<td class="active"><strong>报价表</strong></td>')
                    html.push('<td colspan="3" style="text-align: right;" class="active">')
                    html.push('<input type="button" class="btn btn-sm btn-primary" value="添加报价信息" id="'+ options.headerBtn +'"/>')			
                    html.push('</td>')
                } else if(options.status==3){
                	html.push('<td class="active"><strong>报价表</strong></td>')
                    html.push('<td colspan="3" style="text-align: right;" class="active">')
                    html.push('<input type="button" class="btn btn-sm btn-primary" value="导出报价表" id="exportExcel"/>')			
                    html.push('<span class="btn btn-sm btn-primary fileinput-button caozuo"><span>导入报价</span><input type="file" id="importExcel"/></span>')			
                    html.push('</td>')
                }else{
                    html.push('<td colspan="4" class="active"><strong>报价表</strong></td>')
                }
                html.push('</tr>')		  	
                html.push('<tr>')
                html.push('<td colspan="4">')

                html.push('<table class="table  table-bordered"  style="margin-bottom:5px ;table-layout: fixed;word-break: break-all;" id="'+ options.tableName +'"></table>')	           
                html.push('</td>')
                html.push('</tr>')
                html.push('</table>')
                _that.$ele.html(html.join(""))                             
				$("#"+options.tableName).bootstrapTable({
					columns: column
				});									
				$("#"+options.tableName).bootstrapTable("load", data);	                               
            }   
            
            $("#offerForm").off("click","#exportExcel").on("click","#exportExcel", function(){
            	//导出模板
				var url = config.AuctionHost + "/PackagePriceListController/exportPriceListTemplate.do?packageId="+_that.options.parameter.packageId;
				window.location.href =$.parserUrlForToken(url);	
            });
            $("#offerForm").off("change","#importExcel").on("change","#importExcel", function(){
            	var obj = this;
				if(!obj.files || obj.files.length == 0) {	
			        return;
			   	};    
				var f = obj.files[0];
			    var index1=f.name.lastIndexOf(".");
				var index2=f.name.length;
				var FilesName=f.name.substring(index1+1,index2)
			    if(FilesName=='xlsx'&&FilesName=='xls'){
			    	parent.layer.alert("上传文件格式错误")
			    	return
				}
				var formFile = new FormData();
				formFile.append("projectId", _that.options.parameter.projectId); 
				formFile.append("packageId", _that.options.parameter.packageId); 
				formFile.append("excel", f); //加入文件对象
				var data=formFile
				$.ajax({
					type: "post",
					url: top.config.AuctionHost + "/PackagePriceListController/importPriceList.do",
					async: true,
					dataType: 'json',
					cache: false,//上传文件无需缓存
					processData: false,//用于对data参数进行序列化处理 这里必须false
					contentType: false, //必须
					data: data,
					success: function(data) {				
						if(data.success==true){							
							parent.layer.alert('批量导入成功');
							var excelData=data.data;
							for(var i = 0; i < excelData.length; i++){
								if(i == 0){
									$("#offerTable tbody tr:eq("+i+")").find(".offerTotalPrice").val(excelData[i].priceTotal);
								} else {
									$("#offerTable tbody tr:eq("+i+")").find(".offerPrice").val(excelData[i].priceTotal);
								}
						 	}
						}else{
							parent.layer.alert(data.message)				
						}
						$('input[type="file"]').val("");
					}
				});
            });
        },
        //弹出层
        openModel:function(){//add是添加，edit是编辑，offerId报价表的主键id
            var that = this;
            if(that.options.custom){//自定义表格
                $('#'+that.options.headerBtn).on("click", function () {
                    if(that.options.customModal){//自定义弹出层
                        var content=that.options.modalHtml;
                        var type=2;
                    }
                    parent.layer.open({
                        type: type ,//此处以iframe举例     
                        title:'添加报价表',
                        area: [that.options.modalWidth, that.options.modalHeight],
                        content: content,
                        // btn:['确定','关闭'],
                        success: function(layero, index) {                           
                            var iframeWinAdd = layero.find('iframe')[0].contentWindow; 
							iframeWinAdd.formModel(function(data){
								if(that.Verification(iframeWinAdd.$("form"))){
									var data=top.serializeArrayToJson(iframeWinAdd.$("form").serializeArray()); 
									/**
									 * 单位增加了外币, 这里只有当货币为人民币的时候,会自动切换到 元/千元/万元, 如果不是,则是美元/英镑等. 
									 * 这里 quotePriceUnit2 是元/千元/万元 的select框. 选择后赋值到 quotePriceUnit 进行提交
									 */
									if(data.quotePriceUnit=='CNY-人民币'){
										data.quotePriceUnit = iframeWinAdd.$('#quotePriceUnit2').val();
									}
									delete data.quotePriceUnit2;
									/**
									 * End------
									 */
									data.orders=((that.options.attachmentData.length)+1);  //排序                                                                  
									that.addAjax(data);
									parent.layer.close(index);
								}
							})										  
                        },
                        yes:function(index,layero){
                            var iframeWin = layero.find('iframe')[0].contentWindow;
                            /* if(that.Verification(iframeWin.$("form"))){
                                var data=top.serializeArrayToJson(iframeWin.$("form").serializeArray()); 
								// 单位增加了外币, 这里只有当货币为人民币的时候,会自动切换到 元/千元/万元, 如果不是,则是美元/英镑等. 
								 // 这里 quotePriceUnit2 是元/千元/万元 的select框. 选择后赋值到 quotePriceUnit 进行提交
								
								if(data.quotePriceUnit=='CNY-人民币'){
									data.quotePriceUnit = iframeWin.$('#quotePriceUnit2').val();
								}
								delete data.quotePriceUnit2;
								// End------
                                data.orders=((that.options.attachmentData.length)+1);  //排序                                                                  
                                that.addAjax(data);
                                parent.layer.close(index);
                            }  */  
                        }
                    });                   
                })
            }   
            
        },
        editModel:function(offerId,_index){
            var that = this;
            if(that.options.customModal){//自定义弹出层
                var content=that.options.modalHtml+'?offerId='+offerId//弹出层路径
                var type=2     
            }
            parent.layer.open({
                type: type ,//此处以iframe举例     
                title:'编辑报价表',
                area: [that.options.modalWidth, that.options.modalHeight],
                content: content,
                // btn:['确定','关闭'],
                success: function(layero, index) {
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var dataInfo=that.options.attachmentData[_index]; 
                    iframeWin.formModel(function(){
						if(that.Verification(iframeWin.$("form"))){
						    var data=top.serializeArrayToJson(iframeWin.$("form").serializeArray()); 
							
						    /**
						     * 单位增加了外币, 这里只有当货币为人民币的时候,会自动切换到 元/千元/万元, 如果不是,则是美元/英镑等. 
						     * 这里 quotePriceUnit2 是元/千元/万元 的select框. 选择后赋值到 quotePriceUnit 进行提交
						     */
						    if(data.quotePriceUnit=='CNY-人民币'){
						        data.quotePriceUnit = iframeWin.$('#quotePriceUnit2').val();
						    }
						    delete data.quotePriceUnit2;
						    /**
						     * End------
						     */
						    that.addAjax(data,_index);
						    parent.layer.close(index);
						} 
					}, dataInfo)   
                },
                yes:function(index,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    if(that.Verification(iframeWin.$("form"))){
                        var data=top.serializeArrayToJson(iframeWin.$("form").serializeArray()); 
						
                        /**
                         * 单位增加了外币, 这里只有当货币为人民币的时候,会自动切换到 元/千元/万元, 如果不是,则是美元/英镑等. 
                         * 这里 quotePriceUnit2 是元/千元/万元 的select框. 选择后赋值到 quotePriceUnit 进行提交
                         */
                        if(data.quotePriceUnit=='CNY-人民币'){
                            data.quotePriceUnit = iframeWin.$('#quotePriceUnit2').val();
                        }
                        delete data.quotePriceUnit2;
                        /**
                         * End------
                         */
                        that.addAjax(data,_index);
                        parent.layer.close(index);
                    } 
                    
                }
            });
            parent.$('.active').bind('click',function(){

            });
        },
        edittextModel:function(offerId,_index){
        	var that = this;
            if(that.options.customModal){//自定义弹出层
               // var content=that.options.modalHtml+'?offerId='+offerId//弹出层路径
                var content=that.options.modaltextHtml+'?offerId='+offerId
                 var type=2     
            }
            parent.layer.open({
                type: type ,//此处以iframe举例     
                title:'编辑文本',
                area: [that.options.modalWidth, that.options.modalHeight],
                content: content,
                btn:['确定','关闭'],
                success: function(layero, index) {
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                     var dataInfo=that.options.attachmentData[_index]; 
                    iframeWin.$("#priceTotalTxt").hide();
                    iframeWin.$("#priceTotal").val($("[name='detailList["+_index +"].saleTaxTotal']").val());
                    iframeWin.formModel(dataInfo)   
                 /*   var dataInfo=that.options.attachmentData[_index].priceTotal;
                    console.log(dataInfo);*/
                },
                yes:function(index,layero){
                	// var iframeWin = layero.find('iframe')[0].contentWindow;
                    //that.viewAjax();
                   var iframeWin = layero.find('iframe')[0].contentWindow;
                    if(that.Verification(iframeWin.$("form"))){ 
                        $('input[name="detailList['+_index +'].saleTaxTotal"]').val(iframeWin.$("#priceTotal").val())
                        parent.layer.close(index);
                    } 
                }
            });
           // console.log(dataInfo);
        },
        detailtexttModel:function(offerId,_index){
        	var that = this;
            if(that.options.customModal){//自定义弹出层
               // var content=that.options.modalHtml+'?offerId='+offerId//弹出层路径
                var content=that.options.modaltextHtml+'?offerId='+offerId
                 var type=2     
            }
            parent.layer.open({
                type: type ,//此处以iframe举例     
                title:'查看文本',
                area: [that.options.modalWidth, that.options.modalHeight],
                content: content,
               /* btn:['确定','关闭'],*/
                success: function(layero, index) {
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var dataInfo=that.options.attachmentData[_index]; 
                    iframeWin.$("#priceTotal").hide();
                    iframeWin.$("#priceTotalTxt").html($("#totalPriceTxt").html());   
                },                
            });
        },
        //添加报价表
        addAjax:function(_data,_index){
            var that = this;
            if(that.options.attachmentState==1){//添加到数据库中
                $.ajax({
                    type: "post",
                    url: that.options.saveurl,
                    async:false,
                    data:_data,
                    dataType: "json",
                    success: function (response) {
                        if(response.success){                        
                            that.viewAjax();
                            
                        }
                    }
                });              
            }else{//添加到数组中
                if(_index!==null&&_index!==undefined){//输入下标存在则为编辑，替换所对应下标的数据
                    var orders=that.options.attachmentData[_index].orders
                    that.options.attachmentData[_index]=_data
                    that.options.attachmentData[_index].orders=orders;
                }else{
                    that.options.attachmentData.push(_data);
                }
            }
            $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
        },      
        //查看报价表
        viewAjax:function(){
            var that = this;
            $.ajax({
                type: "post",
                url: that.options.viewURL,
                async:false,
                data:that.options.parameter,
                dataType: "json",
                success: function (response) {
                    if(response.success){
                        if(response.data){
                            that.options.attachmentData=response.data;
                        }                       
                    }
                }
            });
        },
        //删除报价表
        deleteAjax:function(offerId,_index){
            var that = this;
            parent.layer.confirm('温馨提示：您确定要删除该条报价吗？', {
                btn: ['是', '否'] //可以无限个按钮
            }, function(index, layero) {
                if(that.options.attachmentState==1){//从数据库中删除
                    $.ajax({
                        type: "post",
                        url: that.options.deleteUrl,
                        async:false,
                        data:_data,
                        dataType: "json",
                        success: function (response) {
                            if(response.success){                        
                                that.viewAjax();
                            }
                        }
                    });              
                }else{//从数组中删除
                    that.options.attachmentData.splice(_index,1);
                    $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
                }
                parent.layer.close(index);
            }, function(index) {
                parent.layer.close(index)
            });    
        },
        //上移
        MoveUpward:function(offerId,_index,_this){
            var that = this;
            if(_index>1){
                that.options.attachmentData[_index].orders=_index;
                that.options.attachmentData[_index-1].orders=_index+1;             
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index-1, 1, that.options.attachmentData[_index])[0];
                $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);             
            }else{
                parent.layer.alert('已经是最上层了！');
                return false;
            }
           
        },
        //下移
        MoveDown:function(offerId,_index,_this){
            var that = this;
            if(_index==that.options.attachmentData.length-1){
                parent.layer.alert('已经是最下层了！');
                return false;
            }else{
                that.options.attachmentData[_index].orders=_index+2;
                that.options.attachmentData[_index+1].orders=_index+1;    
                that.options.attachmentData[_index] = that.options.attachmentData.splice(_index+1, 1, that.options.attachmentData[_index])[0];              
                $("#"+that.options.tableName).bootstrapTable("load", that.options.attachmentData);
            }
            
        },
        //验证
        Verification:function(self){
            var that = this;
            var _this = self;
            var isSuc = true;
            var dataType = {
                "*": /\S/,  //不能为空
                "mobile": /^1[3456789]\d{9}$/,  //手机号
                "num": /^\d+$/,  //数字               
                "positiveNum" :/^[0-9][0-9]*$/,    //正整数              
            };
            var dataMsg = {
                "*": "信息不能为空",
                "num": "只能输入数字",              
                "positiveNum": "请输入大于0的正数",          
            };
            _this.find("[datatype]").each(function(){
                var dt = $(this).attr("datatype");//必填选项
                var char=$(this).data("char");//限制位数
                var val = $.trim($(this).val());
                var ignore = $(this).attr("ignore");  //忽略必填验证  ignore="ignore"  
                var errormsg = $(this).attr("errormsg");
                errormsg = errormsg ? errormsg : dataMsg[dt];
                ignore = ignore && ignore == "ignore" ? ignore : "";   
                val = val ? val : "";
                if(dt && dt != "" && dt != undefined && !(ignore && val == "")){
                    if(!dataType[dt].test(val)){
                        var _that = $(this);
                        window.top.layer.alert("温馨提示："+errormsg, function(index){
                            top.layer.close(index);			
                            if($(".panel-collapse").length > 0){
        //						$('.collapse').collapse('hide');
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });
                        
                        isSuc = false;
                        return false;
                    }
                    if(val.length>char){
                        var _that = $(this);
                        window.top.layer.alert("温馨提示："+errormsg+'，且不能超过'+char+'个字符', function(index){
                            top.layer.close(index);			
                            if($(".panel-collapse").length > 0){
                                _that.closest('.panel-collapse').collapse('show');
                                _that.closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
                            }
                            _that.focus();
                        });
                        
                        isSuc = false;
                        return false;
                    }
                }
            });
            return isSuc;
        },
        // 整个提交
        offerSubmit:function(){
            var that = this;           
            $(that.options.offerSubmit).on("click", function () {
                var pare=that.options.parameter;
                pare.packagePriceLists=that.options.attachmentData;              
                $.ajax({
                    type: "post",
                    url: that.options.saveurl,
                    data:pare,
                    async:false,
                    dataType: "json",
                    success: function (response) {
                       if(response.success){
    
                       }
                    }
                });                  
            })     
        },
        //插入一条默认数据-报价合计
        defaultData:function(){
            var that = this;
            if(that.options.attachmentData.length==0||that.options.attachmentData[0].productServices!="报价合计"){
                that.options.attachmentData.unshift(
                    {
                        'productServices':'报价合计', //产品或服务
                        'quotePriceType':'1', //报价-价格: 1  报价-费率：2  数字：3  文本：4
                        'quotePriceName':'报价合计',//报价名称
                        'quotePriceUnit':'元',//报价单位
                        'pointNum':'2',//小数点位数
                        'pointLast':'1',//小数点最后一位  不允许为0：0  允许为0：1
                        'remark':'',//备注
                        'orders':'1' //排序
                    }
                )
            }    
        }, 
        //报价验证
        offerVerification:function(rowData,_this){
            var isture=true;
            if(rowData.pointNum != undefined){
            	if(rowData.pointNum == 0){
	            	if($(_this).val().toString().split(".")[1]){
	                    parent.layer.alert("温馨提示：报价必须大于零且小数点后最多保留0位小数");
	                    $(_this).val("");
	                    isture=false;
	                    return isture;
	               	} else {
	               		var regP = /^[1-9][0-9]*$/;
	               		if(!regP.test($(_this).val())){
	               			parent.layer.alert("温馨提示：报价必须大于零且小数点后最多保留0位小数");
	                    	$(_this).val("");
	                    	isture=false;
	                    	return isture;
	               		}
	              
                    }
                    return isture;
            	}
                var ss="^(([0-9][0-9]*)|(([0]\\.\\d{1,"+ rowData.pointNum +"}|[0-9][0-9]*\\.\\d{1,"+ rowData.pointNum +"})))$";
                var re =new RegExp(ss);
                if(!(re.test($(_this).val()))||parseFloat($(_this).val())==0){
                    parent.layer.alert("温馨提示：报价必须大于零且小数点后最多保留"+(rowData.pointNum==2?'两':sectionToChinese(rowData.pointNum))+"位小数");
                    $(_this).val("");
                    isture=false
                    return;
                }
                if(rowData.pointLast==0){
                    var reg=/^.*(?!0).$/;  
                    if($(_this).val().toString().split(".")[1]){
                        var decimal=$(_this).val().toString().split(".")[1].length;  
                    }else{
                        var decimal=0;
                    }
                    if(rowData.pointNum>decimal){
                        parent.layer.alert("温馨提示：请填写"+(rowData.pointNum==2?'两':sectionToChinese(rowData.pointNum))+"位小数");
                        $(_this).val("");
                        isture=false
                        return;
                    }
                    if(!reg.test($(_this).val())){
                        parent.layer.alert("温馨提示：小数点后最后一位不允许为0");
                        $(_this).val("");
                        isture=false
                        return;
                    }     
                }     
            }
            return isture  
        }     
    };
    $.fn.offerForm = function (options) {
        options = $.extend(defaults, options || {});
 
        return new OfferForm($(this), options);
    }
 
})(jQuery, window, document);