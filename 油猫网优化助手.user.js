// ==UserScript==
// @name         油猫网优化助手
// @namespace    geoi6sam1
// @version      0.3
// @description  屏蔽油猴中文网和脚本猫广告
// @author       钜森
// @match        *://bbs.tampermonkey.net.cn/*
// @match        *://scriptcat.org/*
// @icon         https://bbs.tampermonkey.net.cn/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @run-at       document-start
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==


//隐藏已知广告
GM_addStyle('.comiis_nv_pop, .a_f, .a_p, .a_mu, .ad { display: none !important; }');

//去除复制链接尾缀
//原创：李恒道
//原文：https://bbs.tampermonkey.net.cn/thread-1788-1-1.html
setTimeout(function () {
    let oldcopy = window.setCopy;
    window.setCopy = function (text, msg) {
        return oldcopy.call(this, text.replace('\n(出处: 油猴中文网)\n', ""), msg)
    }
}, 1000);
