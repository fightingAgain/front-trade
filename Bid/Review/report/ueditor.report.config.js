/**
 * ueditor完整配置项
 * 可以在这里配置整个编辑器的特性
 */
/**************************提示********************************
 * 所有被注释的配置项均为UEditor默认值。
 * 修改默认配置请首先确保已经完全明确该参数的真实用途。
 * 主要有两种修改方案，一种是取消此处注释，然后修改成对应参数；另一种是在实例化编辑器时传入对应参数。
 * 当升级编辑器时，可直接使用旧版配置文件替换新版配置文件,不用担心旧版配置文件中因缺少新功能所需的参数而导致脚本报错。
 **************************提示********************************/

(function () {

    /**
     * 编辑器资源文件根路径。它所表示的含义是：以编辑器实例化页面为当前路径，指向编辑器资源文件（即dialog等文件夹）的路径。
     * 鉴于很多同学在使用编辑器的时候出现的种种路径问题，此处强烈建议大家使用"相对于网站根目录的相对路径"进行配置。
     * "相对于网站根目录的相对路径"也就是以斜杠开头的形如"/myProject/ueditor/"这样的路径。
     * 如果站点中有多个不在同一层级的页面需要实例化编辑器，且引用了同一UEditor的时候，此处的URL可能不适用于每个页面的编辑器。
     * 因此，UEditor提供了针对不同页面的编辑器可单独配置的根路径，具体来说，在需要实例化编辑器的页面最顶部写上如下代码即可。当然，需要令此处的URL等于对应的配置。
     * window.UEDITOR_HOME_URL = "/xxxx/xxxx/";
     */
    var URL = window.UEDITOR_CONFIG.UEDITOR_HOME_URL;
    //自定义配置文件地址
    var REPORT_URL = window.UEDITOR_HOME_URL || UE.getUEBasePath();
    /**
     * 配置项主体。注意，此处所有涉及到路径的配置别遗漏URL变量。
     */
    window.UEDITOR_CONFIG = {

        //为编辑器实例添加一个路径，这个不能被注释
        UEDITOR_HOME_URL: URL

        // 服务器统一请求接口路径
        //, serverUrl: URL + "jsp/controller.jsp"
        , serverUrl: top.config.FileHost +"/Ueditor/ueditorUpload.do?sysUrl="+top.config.FileHost

        ,xssFilterRules: false
        //input xss过滤
        ,inputXssFilter: false
        //output xss过滤allHtmlEnabled
        ,outputXssFilter: false
        //工具栏上的所有的功能按钮和下拉框，可以在new编辑器的实例时选择自己需要的从新定义
        , toolbars: [[
            'source', //源代码
            '|',
            'undo', //撤销
            'redo', //重做
            'searchreplace', //查询替换
            'pagebreak', //分页
            '|',
            'insertcode', //代码语言
            'paragraph', //段落格式
            'fontfamily', //字体
            '|',
            'rowspacingtop', //段前距
            'rowspacingbottom', //段后距
            'lineheight', //行间距
            'indent', //首行缩进
            '|',
            'touppercase', //字母大写
            'tolowercase', //字母小写
            'bold', //加粗
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'unlink', //取消链接
            'subscript', //下标
            'superscript', //上标
            'fontborder', //字符边框
            'forecolor', //字体颜色
            'backcolor', //背景色
            '|',
            'justifyleft', //居左对齐
            'justifyright', //居右对齐
            'justifycenter', //居中对齐
            'justifyjustify', //两端对齐
            '|',
            'inserttable', //插入表格
            'edittable', //表格属性
            'edittd', //单元格属性
            'insertrow', //前插入行
            'insertcol', //前插入列
            'mergeright', //右合并单元格
            'mergedown', //下合并单元格
            'deleterow', //删除行
            'deletecol', //删除列
            'splittorows', //拆分成行
            'splittocols', //拆分成列
            'mergecells', //合并多个单元格
            'splittocells', //完全拆分单元格
            'deletecaption', //删除表格标题
            'inserttitle', //插入标题
            'deletetable', //删除表格
            'cleardoc', //清空文档
            'insertparagraphbeforetable', //表格前插入行
            '|',
		    'formatmatch', //格式刷
            'time', //时间
            'date', //日期
        ]]

        //如果自定义，最好给p标签如下的行高，要不输入中文时，会有跳动感
        ,initialStyle:'p{line-height:1.75em}'//编辑器层级的基数,可以用来改变字体等

        ,iframeCssUrl: REPORT_URL + 'reportPart.css' //给编辑器内部引入一个css文件
        //indentValue
        //首行缩进距离,默认是2em
        ,indentValue:'2em'

        //,initialFrameWidth:1000  //初始化编辑器宽度,默认1000
        ,initialFrameHeight:500  //初始化编辑器高度,默认320


        ,pasteplain:false  //是否默认为纯文本粘贴。false为不使用纯文本粘贴，true为使用纯文本粘贴

        //fontfamily
        //字体设置 label留空支持多语言自动切换，若配置，则以配置值为准
        ,'fontfamily':[
            { label:'',name:'songti',val:'宋体,SimSun'},
            { label:'',name:'fangsong',val:'仿宋,FangSong'},
           // { label:'',name:'fzxbsjw',val:'方正小标宋,FZXBSJW--GB1-0'},
            { label:'',name:'kaiti',val:'楷体,楷体_GB2312, SimKai, KaiTi'},
            { label:'',name:'yahei',val:'微软雅黑,Microsoft YaHei'},
            { label:'',name:'heiti',val:'黑体, SimHei'},
            { label:'',name:'lishu',val:'隶书, SimLi, LiSu'}
        ]

        //elementPathEnabled
        //是否启用元素路径，默认是显示
        ,elementPathEnabled : false

        //wordCount
        ,wordCount:false          //是否开启字数统计

        //autoHeightEnabled
        // 是否自动长高,默认true
        ,autoHeightEnabled:false

        //autoFloatEnabled
        //是否保持toolbar的位置不动,默认true
          ,autoFloatEnabled:true
        //浮动时工具栏距离浏览器顶部的高度，用于某些具有固定头部的页面
        //,topOffset:30
        //编辑器底部距离工具栏高度(如果参数大于等于编辑器高度，则设置无效)
          ,toolbarTopOffset:400

        //pageBreakTag
        //分页标识符,默认是_ueditor_page_break_tag_
        ,pageBreakTag:'_report_page_break_tag_'

        //tableDragable
        //表格是否可以拖拽
        ,tableDragable: false

        ,disabledTableInTable:false  //禁止表格嵌套
    };

    function getUEBasePath(docUrl, confUrl) {

        return getBasePath(docUrl || self.document.URL || self.location.href, confUrl || getConfigFilePath());

    }

    function getConfigFilePath() {

        var configPath = document.getElementsByTagName('script');

        return configPath[ configPath.length - 1 ].src;

    }

    function getBasePath(docUrl, confUrl) {

        var basePath = confUrl;


        if (/^(\/|\\\\)/.test(confUrl)) {

            basePath = /^.+?\w(\/|\\\\)/.exec(docUrl)[0] + confUrl.replace(/^(\/|\\\\)/, '');

        } else if (!/^[a-z]+:/i.test(confUrl)) {

            docUrl = docUrl.split("#")[0].split("?")[0].replace(/[^\\\/]+$/, '');

            basePath = docUrl + "" + (confUrl!=""?confUrl:"media");

        }

        return optimizationPath(basePath);

    }

    function optimizationPath(path) {

        var protocol = /^[a-z]+:\/\//.exec(path)[ 0 ],
            tmp = null,
            res = [];

        path = path.replace(protocol, "").split("?")[0].split("#")[0];

        path = path.replace(/\\/g, '/').split(/\//);

        path[ path.length - 1 ] = "";

        while (path.length) {

            if (( tmp = path.shift() ) === "..") {
                res.pop();
            } else if (tmp !== ".") {
                res.push(tmp);
            }

        }

        return protocol + res.join("/");

    }

    window.UE = {
        getUEBasePath: getUEBasePath
    };

})();
