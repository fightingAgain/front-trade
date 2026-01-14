

$(function(){
	$('#reviewList').on('click','li',function(){
		$(this).siblings().removeClass('review_active');
		$(this).addClass('review_active');
	});
	$('#area_score').on('blur','input[type=number]',function(){
		var score = $(this).val();
//		console.log(score)
		$(this).val(toDecimal(score,2));
	})

})
/*
 * 保留两位小数   
 *功能：将浮点数四舍五入，取小数点后2位  
 * e：元素
 * num：要保留的小数位数
 */
function validationNumber(e, num) {
      var regu = /^[0-9]+\.?[0-9]*$/;
      if (e.value != "") {
        if (!regu.test(e.value)) {
          alert("请输入正确的数字");
          e.value = e.value.substring(0, e.value.length - 1);
          e.focus();
        } else {
          if (num == 0) {
            if (e.value.indexOf('.') > -1) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
          if (e.value.indexOf('.') > -1) {
            if (e.value.split('.')[1].length > num) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
        }
      }
    }
/*制保留几位小数，如：2，会在2后面补上00.即2.00  
 * num:输入的值
 * unit：要补足的小数位数
 */
function toDecimal(num,unit) {  
    var f = parseFloat(num);  
    if (isNaN(f)) {  
        return false;  
    }  
    var f = Math.round(num*100)/100;  
    var s = f.toString();  
    var rs = s.indexOf('.');  
    if (rs < 0) {  
        rs = s.length;  
        s += '.';  
    }  
    while (s.length <= rs + unit) {  
        s += '0';  
    }  
    return s;  
}