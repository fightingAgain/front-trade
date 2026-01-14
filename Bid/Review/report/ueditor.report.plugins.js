
(function() {
    //自定义配置文件地址
    var REPORT_URL = window.UEDITOR_HOME_URL || UE.getUEBasePath();

    var utils = UE.utils,
        needUnit = 'pt' ;

    /**
     * 把计量单位转成指定单位
     * @method transUnitToPx
     * @param { String } 待转换的带单位的字符串
     * @return { String } 转换为px为计量单位的值的字符串
     * @example
     * ```javascript
     *
     * //output: 500px
     * console.log( UE.utils.transUnitToPx( '20cm' ) );
     *
     * //output: 27px
     * console.log( UE.utils.transUnitToPx( '20pt' ) );
     *
     * ```
     */
    utils.transUnitToPx = function (val) {
        needUnit = needUnit || 'px';

        if(new RegExp(needUnit).test(val)){
            return val;
        }
        var unit;
        val.replace(/([\d.]+)(\w+)/, function (str, v, u) {
            val = v;
            unit = u;
        });

        switch (needUnit) {
            case 'px':
                switch (unit) {
                    case 'cm':
                        val = Math.round(parseFloat(val) * 96 / 2.54);
                        break;
                    case 'pt':
                        val = Math.round(parseFloat(val) * 96 / 72);
                }
                break;
            case 'cm':
                switch (unit) {
                    case 'px':
                        val = Number(parseFloat(val)/96 * 2.54).toFixed(2);
                        break;
                    case 'pt':
                        val = Number(parseFloat(val) / 72 * 2.54).toFixed(2);
                }
                break;
            case 'pt':
                switch (unit) {
                    case 'cm':
                        val = Math.round(parseFloat(val) * 72 / 2.54);
                        break;
                    case 'px':
                        val = Math.round(parseFloat(val) * 72 / 96);
                }
                break;
        }


        return val + (val ? needUnit : '');
    };

// plugins/rowspacing.js
/**
 * 设置段间距,如果不带单位则默认为px
 * @command rowspacing
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @param { String } value 段间距的值，以px为单位
 * @param { String } dir 间距位置，top或bottom，分别表示段前和段后
 * @example
 * ```javascript
 * editor.execCommand( 'rowspacing', '10', 'top' );
 * ```
 */
UE.plugins['rowspacing'] = function () {
    var me = this;
    me.setOpt({
        'rowspacingtop': ['0.5em', '1em', '1.5em', '1.75em', '2em', '3em', '4em', '5em', '6em', '8em', '10em'],
        'rowspacingbottom': ['0.5em', '1em', '1.5em', '1.75em', '2em', '3em', '4em', '5em', '6em', '8em', '10em']
    });
    me.commands['rowspacing'] = {
        execCommand: function (cmdName, value, dir) {
            var size = value;
            if (isNumber(value)) {
                size += 'px';
            }
            this.execCommand('paragraph', 'p', {style: 'margin-' + dir + ':' + size});
            return true;
        },
        queryCommandValue: function (cmdName, dir) {
            var pN = UE.dom.domUtils.filterNodeList(this.selection.getStartElementPath(), function (node) {
                    return UE.dom.domUtils.isBlockElm(node)
                }),
                value;
            //trace:1026
            if (pN) {
                value = UE.dom.domUtils.getComputedStyle(pN, 'margin-' + dir).replace(/[^\d]/g, '');
                return !value ? 0 : value;
            }
            return 0;
        }
    };
};

UE.registerUI('previewpdf',function(editor,uiName){
    //创建dialog
    var dialog = new UE.ui.Dialog({
        //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
        iframeUrl:REPORT_URL+"view.html",
        //需要指定当前的编辑器实例
        editor:editor,
        //指定dialog的名字
        name:uiName,
        //dialog的标题
        title:"预览pdf",

        //指定dialog的外围样式
        cssRules:"width:950px;height:"+Math.floor(getClientHeight()*0.9)+"px;"
    });
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName,{
        execCommand:function(){
            if(editor.getContent()){
                //渲染dialog
                dialog.render();
                dialog.open();
            }else{
                alert('没有可以预览的内容');
            }
        }
    });

    var btn = new UE.ui.Button({
        name:'dialogbutton' + uiName,
        title:'预览PDF',
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules :'background-position: -420px -20px;',
        onclick:function () {
            editor.execCommand(uiName);
        }
    });

    return btn;
},2);

UE.registerUI('ptfont',function(editor,uiName){
    //注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
    editor.registerCommand(uiName,{
        execCommand:function(cmdName,value){
            //这里借用fontsize的命令
            this.execCommand('fontsize',value)
        },
        queryCommandValue:function(){
            //这里借用fontsize的查询命令
            return this.queryCommandValue('fontsize')
        }
    });


    //创建下拉菜单中的键值对，这里我用字体大小作为例子
    var items = [];
    var title = editor.options.labelMap['fontsize'] || editor.getLang("labelMap.fontsize") || '';
    var list = ['8pt', '9pt', '10pt', '12pt', '14pt', '18pt', '20pt', '24pt', '30pt', '36pt', '54pt'];
    if (!list.length) return;
    for (var i = 0; i < list.length; i++) {
        var size = list[i];
        if (isNumber(list[i])) {
            size += 'px';
        }
        items.push({
            //显示的条目
            label:size,
            //选中条目后的返回值
            value:size,
            //针对每个条目进行特殊的渲染
            renderLabelHtml:function () {
                //这个是希望每个条目的字体是不同的
                return '<div class="edui-label %%-label" style="font-size:' + this.value + '">' + (this.label || '') + '</div>';
            }
        });
    }
    //创建下来框
    var combox = new UE.ui.Combox({
        //需要指定当前的编辑器实例
        editor:editor,
        //添加条目
        items:items,
        //当选中时要做的事情
        onselect:function (t, index) {
            //拿到选中条目的值
            editor.execCommand(uiName, this.items[index].value);
        },
        //提示
        title:title,
        //当编辑器没有焦点时，combox默认显示的内容
        initValue:title
    });

    editor.addListener('selectionchange', function (type, causeByUi, uiReady) {
        if (!uiReady) {
            var state = editor.queryCommandState('FontSize');
            if (state == -1) {
                combox.setDisabled(true);
            } else {
                combox.setDisabled(false);
                var value = editor.queryCommandValue('FontSize');
                if(!value){
                    combox.setValue(uiName);
                    return;
                }
                //ie下从源码模式切换回来时，字体会带单引号，而且会有逗号
                value && (value = value.replace(/['"]/g, '').split(',')[0]);
                combox.setValue(value);
            }
        }

    });
    return combox;
},11);

function isNumber(value) {
    if(!value){
        return false;
    }

    if(typeof value === 'number'){
        return true;
    }

    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if(regPos.test(value) && regNeg.test(value)){
        return true;
    }else{
        return false;
    }
}

function getClientHeight() {
    var winHeight=0;
    //获取窗口高度
    if (window.innerHeight){
        winHeight = window.innerHeight;
    }else if ((document.body) && (document.body.clientHeight)){
        winHeight = document.body.clientHeight;
    }

    //通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement  && document.documentElement.clientHeight){
        winHeight = document.documentElement.clientHeight;
    }
    return winHeight;
}
})();