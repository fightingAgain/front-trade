/*=======查询条件封装===== 
*========== JIN ===========
*====== 2020-05-07 ========
*/
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        isExport:0,//0不需要导出，1是需要导出
        isQuery:1,//0不查询，1是查询
        isAdd:0,//0不新增，1是新增
        isZ:true,//默认展开
        pWidth:top.tableWidth,//父级的宽度，
        tableClass:'table',//对应的分页列表的id
        width:'300',//每个查询的宽度，
        queryList:[],//查询条件列表
    };
 
    function QueryCriteria($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.init();
        var _that=this;
        //当浏览器大小变化时，界面自适应
        $(window).resize(function () {       
            _that.init();  
        });
    }
    QueryCriteria.prototype = {
        constructor: QueryCriteria,
        init: function () { 
            this.renderHtml();
        },
        renderHtml: function () {
            var options = this.options;
            var _that=this;
            var html=new Array();  
            var eWidth=$("#pageContent").width()
            var dist=parseInt((eWidth-200)/options.width)//一行查询条件的个数; 
            if(dist>options.queryList.length) {
                var _i=options.queryList.length
            }else{
                var _i=dist
            }  
            html.push('<div style="overflow: hidden;">') 
            for(var i=0;i<_i;i++){
                html.push('<div class="input-group" style="width:'+ options.width +'px;float: left;padding-right: 10px;margin-bottom: 10px;">') 
                html.push('<span class="input-group-addon">'+ options.queryList[i].name +'</span>')
                if(options.queryList[i].type=="input"){
                    html.push('<input type="text" class="form-control" id="'+ options.queryList[i].value +'" name="'+ options.queryList[i].value +'">')   
                }else if(options.queryList[i].type=="select"){
                    html.push('<select type="text" class="form-control" id="'+ options.queryList[i].value +'" name="'+ options.queryList[i].value +'">') 
                    for(var h=0;h<options.queryList[i].option.length;h++){
                        html.push('<option value="'+ options.queryList[i].option[h].value +'">'+ options.queryList[i].option[h].name +'</option>')
                    }
                    html.push('</select>')  
                }                   
                html.push('</div>')                  
            }
            html.push('<div class="btn-group" id="btnDiv">')
            if(options.queryList.length>9){
                html.push('<button type="button" class="btn btn-primary" id="more">') 
                html.push('<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>高 级') 
				html.push('</button>')      				
                options.isZ=false;
            }
            if(options.isQuery==1){
                html.push('<button type="button"  class="btn btn-primary">') 
                html.push('<span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查 询') 
				html.push('</button>')      				
							     
            }
            html.push('</div>')
            html.push('</div>')
            
            if(options.queryList.length>_i){
                html.push('<div  style="overflow: hidden;display:none" id="condition">')
                for(var i=_i;i<options.queryList.length;i++){
                    html.push('<div class="input-group" style="width:'+ options.width +'px;float: left;padding-right: 10px;margin-bottom: 10px;">') 
                    html.push('<span class="input-group-addon">'+ options.queryList[i].name +'</span>')
                    if(options.queryList[i].type=="input"){
                        html.push('<input type="text" class="form-control" id="'+ options.queryList[i].value +'" name="'+ options.queryList[i].value +'">')   
                    }else{
                        html.push('<select type="text" class="form-control" id="'+ options.queryList[i].value +'" name="'+ options.queryList[i].value +'">') 
                        for(var h=0;h<options.queryList[i].option.length;h++){
                            html.push('<option value="'+ options.queryList[i].option[h].value +'">'+ options.queryList[i].option[h].name +'</option>')
                        }
                        html.push('</select>')  
                    }                   
                    html.push('</div>')                  
                }
                html.push('</div>')
            }
            if(options.isAdd==1||options.isExport==1){
                html.push('<div class="btn-group" id="btnDiv">')
                if(options.isAdd==1){
                    html.push('<button type="button"  class="btn btn-primary" >') 
                    html.push('<span class="glyphicon glyphicon-plus" aria-hidden="true">新建项目') 
                    html.push('</button>')      				
                }
                if(options.isExport==1){
                    html.push('<button type="button"  class="btn btn-primary">') 
                    html.push('<span class="glyphicon glyphicon-export" aria-hidden="true">导出Excel') 
                    html.push('</button>')      				
                                    
                }
                html.push('</div>')
            } 
            html.push('</div>')
            _that.$ele.html(html.join(""));
            $("#more").on('click',function(){
                if(!options.isZ){
                    options.isZ=true;
                    // $("#more").html('<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>收起');
                    $('#condition').show();//父级容器的高度为一行查询条件的高度                   	
                }else{
                    options.isZ=false;
                    // $("#more").html('<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>展开');
                    $('#condition').hide();//父级容器的高度为一行查询条件的高度                 
                }
                $('#'+options.tableClass).bootstrapTable(('refresh'));
        
            });
        },
        
    };
    $.fn.queryCriteria = function (options) {
        options = $.extend(defaults, options || {});
 
        return new QueryCriteria($(this), options);
    }
 
})(jQuery, window, document);