// ==UserScript==
// @name         去他の油猴中文网
// @namespace    https://github.com/s757129
// @homepage     https://s757129.github.io
// @supportURL   https://github.com/s757129/FuckScripts
// @version      1.0.4
// @description  屏蔽油猴中文网广告加菊部美化
// @author       柒伍七
// @match        *://bbs.tampermonkey.net.cn/*
// @icon         https://bbs.tampermonkey.net.cn/favicon.ico
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @license      What The Hell
// ==/UserScript==

(function () {
    'use strict';

    //unsafeWindow
    unsafeWindow.GM_addStyle = GM_addStyle;

    //隐藏已知广告
    GM_addStyle('.comiis_nv_pop, .a_f, .a_p { display: none; }');

    //去除复制链接尾缀
    //原创：李恒道
    //原文：https://bbs.tampermonkey.net.cn/thread-1788-1-1.html
    setTimeout(function () {
        let oldcopy = unsafeWindow.setCopy;
        unsafeWindow.setCopy = function (text, msg) {
            return oldcopy.call(this, text.replace('\n(出处: 油猴中文网)\n', ""), msg)
        }
    }, 1000);

})();
