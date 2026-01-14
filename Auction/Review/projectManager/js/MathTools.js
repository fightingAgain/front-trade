/**
 * 数据长度超过long类型的算法
 * 只支持加减法运算
 * Date: 2019-07-26
 * 邓强
 */
(function(){
    /**
     * 验证有效数字正则
     * @type {RegExp}
     */
    var reg = /^([-+]?(([1-9]([0-9]*))|(0))(([\.](\d)+))?)$/;

    /**
     * 验证参数有效性
     * @param num1
     * @param num2
     */
    var check = function(num1, num2){
        if(!reg.test(num1)){
            throw "第一个参数不是有效数字";
        }
        if(!reg.test(num2)){
            throw "第二个参数不是有效数字";
        }
    }



    var mathAdd = function(num1, num2){
        //1.转化数字整数和小数部分

        //第一个数
        //整数部分
        var positive1 = [];
        //小数部分
        var decimal1 = [];

        //第二个数
        //整数部分
        var positive2 = [];
        //小数部分
        var decimal2 = [];

        //是否为小数
        var isDecimal1 = false, isDecimal2 = false;
        for(var i = 0;i<num1.length;i++){//将string类型的数组转为int型
            if(num1[i] == "."){
                isDecimal1 = true;
                continue;
            }
            if(isDecimal1){
                decimal1.push(parseInt(num1[i]));
            }else{
                positive1.push(parseInt(num1[i]));
            }
        }

        for(var i = 0;i<num2.length;i++){//将string类型的数组转为int型
            if(num2[i] == "."){
                isDecimal2 = true;
                continue;
            }
            if(isDecimal2){
                decimal2.push(parseInt(num2[i]));
            }else{
                positive2.push(parseInt(num2[i]));
            }
        }

        //小数部分计算
        var decimalTmp = 0, decimalArr = [],  maxLength = 0;

        //需要计算的变量 s 和
        var a, b, s;

        if(maxLength < decimal1.length){
            maxLength = decimal1.length
        }

        if(maxLength < decimal2.length){
            maxLength = decimal2.length
        }

        if(maxLength > decimal1.length){
            for(var i = maxLength -decimal1.length; i > 0 ; i--){
                decimal1.push(0);
            }
        }

        if(maxLength > decimal2.length){
            for(var i = maxLength - decimal2.length; i > 0; i--){
                decimal2.push(0);
            }
        }


        for(var i = maxLength-1 ; i >= 0 ; i--){

            a = decimal1[i];
            b = decimal2[i];
            s = a+b+decimalTmp;

            if(s > 9){
                decimalTmp = 1;
                decimalArr.unshift(s-10);
            }else{
                decimalTmp = 0
                decimalArr.unshift(s);
            }
        }

        //从个位开始计算
        var index = 1, positivetmp = decimalTmp, positiveArr = [];
            //整数部分计算
        while (true){
            //全部计算完毕，跳出循环
            if(positive1.length < index && positive2.length < index){
                if(positivetmp > 0){
                    positiveArr.unshift(positivetmp);
                }
                break;
            }

            if(positive1.length >= index){
                a = positive1[positive1.length - index];
            }else{
                a = 0;
            }

            if(positive2.length >= index){
                b = positive2[positive2.length - index];
            }else{
                b = 0
            }

            s = a + b + positivetmp;
            if(s > 9){
                positivetmp = 1;
                positiveArr.unshift(s-10);
            }else{
                positivetmp = 0;
                positiveArr.unshift(s);
            }
            index++;
        }

        var sum = positiveArr.join("");

        if(decimalArr.length>0){
            sum = sum+"."+ decimalArr.join("");
        }

        return sum;
    }

    var mathSub = function(num1, num2){
        //1.转化数字整数和小数部分

        //第一个数
        //整数部分
        var positive1 = [];
        //小数部分
        var decimal1 = [];

        //第二个数
        //整数部分
        var positive2 = [];
        //小数部分
        var decimal2 = [];

        //是否为小数
        var isDecimal1 = false, isDecimal2 = false;
        for(var i = 0;i<num1.length;i++){//将string类型的数组转为int型
            if(num1[i] == "."){
                isDecimal1 = true;
                continue;
            }
            if(isDecimal1){
                decimal1.push(parseInt(num1[i]));
            }else{
                positive1.push(parseInt(num1[i]));
            }
        }

        for(var i = 0;i<num2.length;i++){//将string类型的数组转为int型
            if(num2[i] == "."){
                isDecimal2 = true;
                continue;
            }
            if(isDecimal2){
                decimal2.push(parseInt(num2[i]));
            }else{
                positive2.push(parseInt(num2[i]));
            }
        }

        //两个数比较结果 1 大于  0 等于 -1小于
        var compare = 0;
        if(positive1.length < positive2.length){
            compare = -1;
        }else if(positive1.length == positive2.length){
            for (var i = 0; i < positive1.length; i++) {
                if(positive1[i]>positive2[i]){
                    compare = 1;
                    break;
                }
                if(positive1[i]<positive2[i]){
                    compare = -1;
                    break;
                }
            }

            if(compare == 0){
                for (var i = 0; i < positive1.length; i++) {
                    if(decimal1[i]>decimal2[i]){
                        compare = 1;
                        break;
                    }
                    if(decimal1[i]<decimal2[i]){
                        compare = -1;
                        break;
                    }
                }
            }
        }else{
            compare = 1;
        }

        //如果是负数则交换参数
        if(compare == -1){
            var positive = positive1;
            positive1 = positive2;
            positive2 = positive;

            var decimal = decimal1;
            decimal1 = decimal2;
            decimal2 = decimal;
        }

        //小数部分计算
        var decimalTmp = 0, decimalArr = [],  maxLength = 0;

        //需要计算的变量 result 和
        var a, b, result;

        if(maxLength < decimal1.length){
            maxLength = decimal1.length
        }

        if(maxLength < decimal2.length){
            maxLength = decimal2.length
        }

        if(maxLength > decimal1.length){
            for(var i = maxLength -decimal1.length; i > 0 ; i--){
                decimal1.push(0);
            }
        }

        if(maxLength > decimal2.length){
            for(var i = maxLength - decimal2.length; i > 0; i--){
                decimal2.push(0);
            }
        }


        for(var i = maxLength-1 ; i >= 0 ; i--){

            a = decimal1[i];
            b = decimal2[i];
            result = a-b-decimalTmp;

            if(result < 0){
                decimalTmp = 1;
                decimalArr.unshift(10 + result);
            }else{
                decimalTmp = 0
                decimalArr.unshift(result);
            }
        }

        //从个位开始计算
        var index = 1, positivetmp = decimalTmp, positiveArr = [];
        //整数部分计算
        while (true){
            //全部计算完毕，跳出循环
            if(positive1.length < index && positive2.length < index){
                if(positivetmp > 0){
                    positiveArr.unshift(positivetmp);
                }
                break;
            }

            if(positive1.length >= index){
                a = positive1[positive1.length - index];
            }else{
                a = 0;
            }

            if(positive2.length >= index){
                b = positive2[positive2.length - index];
            }else{
                b = 0
            }

            result = a - b - positivetmp;
            if(result < 0){
                positivetmp = 1;
                positiveArr.unshift(10 + result);
            }else{
                positivetmp = 0;
                positiveArr.unshift(result);
            }
            index++;
        }

        while (true) {
            if(positiveArr.length > 1 && positiveArr[0] == 0){
                positiveArr = positiveArr.slice(1)
            }else{
                break;
            }
        }

        var result = positiveArr.join("");

        if(decimalArr.length>0){
            result = result+"."+ decimalArr.join("");
        }

        if(compare == -1){
            result = "-"+result;
        }

        return result;
    }

    function MathTools(){}

    MathTools.prototype = {
        /**
         * 算数相加
         * @param num1     第一个数
         * @param num2     第二个数
         * @param len      保留小数位数
         * @returns {string}
         */
        add: function(num1, num2, len){
            var result = null;
            if(!(num1 instanceof String)){
                num1 = num1+"";
            }

            if(!(num2 instanceof String)){
                num2 = num2+"";
            }

            //1.检测是否有效数字
            check(num1, num2);

            //2.将字符串转为数组

            //字符串转为数组
            var array1 = num1.split("");
            var array2 = num2.split("");

            //有效计算的数组
            var arrayNum1 = [];
            var arrayNum2 = [];

            //计算两个数字是否正数
            var flag1 = true, flag2 = true;

            if(array1[0] == "-"){
                flag1 = false;
            }
            if(array2[0] == "-"){
                flag2 = false;
            }

            for(var i = 0;i<array1.length;i++){//将string类型的数组转为int型
                if(array1[i]=="+" || array1[i]=="-"){
                    continue;
                }else{
                    arrayNum1.push(array1[i]);
                }
            }
            for(var i = 0;i<array2.length;i++){//将string类型的数组转为int型
                if(array2[i]=="+" || array2[i]=="-"){
                    continue;
                }else{
                    arrayNum2.push(array2[i]);
                }
            }

            //3.进行运算
            //两个数都为正数
            if(flag1 && flag2){
                result = mathAdd(arrayNum1, arrayNum2);
            }

            //第一个为正数，第二个为负数
            else if(flag1 && !flag2){
                result = mathSub(arrayNum1, arrayNum2);
            }

            //第一个为负数，第二个为正数
            else if(!flag1 && flag2){
                result = mathSub(arrayNum2, arrayNum1);
            }

            //两个数都为负数
            else if(!flag1 && !flag2){
                result = "-" + mathAdd(arrayNum1, arrayNum2);
            }

            return this.toFixed(result, len);
        },
        /**
         * 算数相减
         * @param num1     第一个数
         * @param num2     第二个数
         * @param len      保留小数位数
         * @returns {string}
         */
        sub: function(num1, num2, len){
            var result = null;
            if(!(num1 instanceof String)){
                num1 = num1+"";
            }

            if(!(num2 instanceof String)){
                num2 = "";
            }
            //1.检测是否有效数字
            check(num1, num2);

            //2.将字符串转为数组

            //字符串转为数组
            var array1 = d1.split("");
            var array2 = d2.split("");

            //有效计算的数组
            var arrayNum1 = [];
            var arrayNum2 = [];

            //计算两个数字是否正数
            var flag1 = true, flag2 = true;

            if(array1[0] == "-"){
                flag1 = false;
            }
            if(array2[0] == "-"){
                flag2 = false;
            }

            for(var i = 0;i<array1.length;i++){//将string类型的数组转为int型
                if(array1[i]=="+" || array1[i]=="-"){
                    continue;
                }else{
                    arrayNum1.push(array1[i])
                }
            }
            for(var i = 0;i<array2.length;i++){//将string类型的数组转为int型
                if(array2[i]=="+" || array2[i]=="-"){
                    continue;
                }else{
                    arrayNum2.push(array2[i])
                }
            }

            //3.进行运算
            //两个数都为正数
            if(flag1 && flag2){
                result = mathSub(arrayNum1, arrayNum2);
            }

            //第一个为正数，第二个为负数
            if(flag1 && !flag2){
                result = mathAdd(arrayNum1, arrayNum2);
            }

            //第一个为负数，第二个为正数
            if(!flag1 && flag2){
                result = "-" + mathAdd(arrayNum1, arrayNum2);
            }

            //两个数都为负数
            if(!flag1 && !flag2){
                result = mathSub(arrayNum2, arrayNum1);
            }
            return this.toFixed(result, len);
        },
        toFixed: function(num, len){
            if(len) {
                num = num + "";

                var numArr = num.split(".");
                if (numArr.length == 2) {
                    var decimal = new Number("0." + numArr[1]);
                    var decimalTmp = decimal.toFixed(len);

                    var decimalArr = (decimalTmp + "").split(".");
                    num = numArr[0] + "." + decimalArr[1];
                } else {
                    var decimal = new Number("0.000000");
                    var decimalTmp = decimal.toFixed(len);

                    var decimalArr = (decimalTmp + "").split(".");
                    num = numArr[0] + "." + decimalArr[1];
                }
            }
            return num;
        }
    }

    window.MathTools = new MathTools();
})();