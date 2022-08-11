// ==UserScript==
// @name         去他の粤工程校园网
// @namespace    s757129
// @version      1.0.3
// @description  自动登录粤工程西区宿舍校园网
// @author       柒伍七
// @match        *://10.10.0.76/*
// @icon         https://www.gdep.edu.cn/__local/1/78/44/67DBBD0E4AF7849771AEBA0A69A_8F5875B0_45D51.jpg?e=.jpg
// @run-at       document-end
// @homepage     https://github.com/s757129/FuckScripts
// @license      MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    //设置
    var userid = '',
        passwd = '';
 
    //你有对象么？
    document.querySelector('#userid').value = userid;
    document.querySelector('#passwd').value = passwd;
 
    //延时点击登录按钮
    setTimeout(function() {
        document.querySelector('#loginsubmit').click();
    }, 100);
 
})();
