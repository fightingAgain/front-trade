var htmlList=[
    {
        value:1,
        content:[
            '<td class="th_bg" style="width: 150px;">报价名称<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="text" datatype="*" data-char="50" errormsg="请输入报价名称" name="quotePriceName" id="quotePriceName" placeholder="请输入报价名称" class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">报价单位<i style="color:#C9302C;font-size:14px">*</i></td><td style="display:flex;"><select  class="form-control" name="quotePriceUnit" id="quotePriceUnit"><option value="CNY-人民币">CNY-人民币</option><option value="USD-美元" data-value="2">USD-美元</option><option value="EUR-欧元" data-value="2">EUR-欧元</option><option value="GBP-英镑" data-value="2">GBP-英镑</option></select><select class="form-control" name="quotePriceUnit2" id="quotePriceUnit2" style="width:100px;" ><option value="元" data-value="2">元</option><option value="千元" data-value="5">千元</option><option value="万元" data-value="6">万元</option></select></td>',
            '<td class="th_bg" style="width: 150px;">小数点位数<i style="color:#C9302C;font-size:14px">*</i></td><td><input name="pointNum" id="pointNum" type="text" value="2" class="form-control" readonly /></td>',
            '<td class="th_bg" style="width: 150px;">小数点后最后一位<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="radio" checked name="pointLast" value="1"/>允许为0<input type="radio" name="pointLast" value="0" style="margin-left:10px"/>不允许为0</td>',
        ]
    },
    {
        value:2,
        content:[
            '<td class="th_bg" style="width: 150px;">报价名称<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="text" datatype="*" data-char="50"  errormsg="请输入报价名称" name="quotePriceName" id="quotePriceName" placeholder="请输入报价名称" class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">报价单位<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="text" datatype="*" data-char="20" errormsg="请输入报价单位" name="quotePriceUnit" id="quotePriceUnit" placeholder="请输入报价单位" class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">小数点位数<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="text"  datatype="positiveNum" errormsg="请输入正确小数点位数" name="pointNum" id="pointNum"  class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">小数点后最后一位<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="radio" checked name="pointLast" value="1"/>允许为0<input type="radio" name="pointLast" value="0" style="margin-left:10px"/>不允许为0</td>',
            
        ]
    },
    {
        value:3,
        content:[               
            '<td class="th_bg" style="width: 150px;">计量单位<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="text" datatype="*" data-char="20" errormsg="请输入计量单位" name="quotePriceUnit" id="quotePriceUnit" placeholder="请输入计量单位" class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">小数点位数<i style="color:#C9302C;font-size:14px">*</i></td><td><input datatype="positiveNum" errormsg="请输入正确小数点位数" type="text" name="pointNum" id="pointNum" class="form-control" /></td>',
            '<td class="th_bg" style="width: 150px;">小数点后最后一位<i style="color:#C9302C;font-size:14px">*</i></td><td><input type="radio" checked name="pointLast" value="1"/>允许为0<input type="radio" name="pointLast" value="0" style="margin-left:10px"/>不允许为0</td>',
        ]
    },
    {
        value:4,
        content:[               
            '<td colspan="2"><textarea type="text" style="height:40px" name="priceDemands" id="priceDemands" datatype="*" errormsg="请输入报价要求"  placeholder="请输入报价要求" class="form-control"></textarea></td>',                
        ]
    },
]
var quotePriceType;
var pointNum;
var orders;
function formModel(callback, dataInfo){
	$("#btn_close").on("click", function () {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
    $('#btn_submit').click(function () {
		callback();
	});
	if(dataInfo){
		quotePriceType=dataInfo['quotePriceType'];
		pointNum=dataInfo['pointNum'];
		orders=dataInfo['orders'];
		if(orders==1){
		    $("#productServices").attr('readonly',true);
		    var list= '<option value="1">报价-价格</option>'
		    +'<option value="2">报价-费率</option> '       
		    $("#quotePriceType").html(list)
		}else{
		    var list= '<option value="1">报价-价格</option>'
		            +'<option value="2">报价-费率</option> '  
		            +'<option value="3">数字</option>'
		            +'<option value="4">文本</option>'
		            $("#quotePriceType").html(list)
		}
		changeType(quotePriceType);
		for(var key in dataInfo){
		    if(key=="pointLast"){
		        $('input[name="pointLast"][value="'+ dataInfo[key] +'"]').prop('checked',true)
		    }else if(key=="productServices"){
		        $("#"+key).val(dataInfo[key]);
		    }else if(key=="quotePriceUnit"){
		        /**
		         * 这里判断了单位是哪些
		         */
		        if(dataInfo[key]=="元" || dataInfo[key]=="千元" || dataInfo[key]=="万元"){
		            $("#quotePriceUnit2").val(dataInfo[key]);
					$("#quotePriceUnit").val('CNY-人民币');
		        }else{
		            $("#quotePriceUnit2").hide();
		            $("#"+key).val(dataInfo[key]);
		        }
		    }else{
		        $("#"+key).val(dataInfo[key]);
		    }
		    
		}
	}
}
$(function(){
    if(!quotePriceType&&!orders){
        var list= '<option value="1">报价-价格</option>'
                +'<option value="2">报价-费率</option> '  
                +'<option value="3">数字</option>'
                +'<option value="4">文本</option>'
                $("#quotePriceType").html(list)
        changeType(1);  
    }
    $("#quotePriceType").on('change',function(){
        changeType($(this).val())
    });
    $('body').on('change','#quotePriceUnit',function(){
        let val = $(this).val();
        if(val=='CNY-人民币'){
            $('#quotePriceUnit2').show();
            $('#quotePriceUnit2').val('元');
        }else{
            $('#quotePriceUnit2').hide();
            if( $("#quotePriceType").val()==1){           
                $("#pointNum").val(2);
            }
        }
    });
});
function changeType(num){
    var newHtml=htmlList[num-1].content
    if(num==2||num==3){
        var htmls='<tr><td style="width: 100px;" class="th_bg" rowspan="'+ (pointNum&&pointNum>0?newHtml.length:(newHtml.length-1)) +'">报价要求<i style="color:#C9302C;font-size:14px">*</i></td>'
        for(var i=0;i<(pointNum&&pointNum>0?newHtml.length:(newHtml.length-1));i++){
            if(i==0){
                htmls+=newHtml[i]
                htmls+='</tr>'
            }else{
                htmls+='<tr>'
                htmls+=newHtml[i]
                htmls+='</tr>'
            }
        }
    }else{
        var htmls='<tr><td style="width: 100px;" class="th_bg" rowspan="'+ newHtml.length +'">报价要求<i style="color:#C9302C;font-size:14px">*</i></td>'
        for(var i=0;i<newHtml.length;i++){
            if(i==0){
                htmls+=newHtml[i]
                htmls+='</tr>'
            }else{
                htmls+='<tr>'
                htmls+=newHtml[i]
                htmls+='</tr>'
            }
        }
    }
    $("#offerYao").html(htmls);
    $("#quotePriceUnit2").on('change',function(){
        if( $("#quotePriceType").val()==1){           
            $("#pointNum").val($(this).find("option:selected").data("value"))
        }
    })
    $("#pointNum").on('change',function(){
        var num=$("#quotePriceType").val();
        pointNum=$(this).val();
        var reg = /^\d{1}$/;
        if(!reg.test(pointNum) || Number(pointNum) > 6){
        	top.layer.alert("温馨提示：请正确输入小数点位数且不能大于6位");
        	$("#pointNum").val("");
        	return;
        }
        var data=serializeArrayToJson($("form").serializeArray());           
        formModel(function () { },data)        
    }) 
}