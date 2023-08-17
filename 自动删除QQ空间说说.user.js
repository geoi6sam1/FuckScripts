// ==UserScript==
// @name         自动删除QQ空间说说
// @namespace    geoi6sam1
// @version      0.1
// @description  选择了莫后悔，失去了别追回，路还是要走滴，生活还是该继续。
// @author       潘钜森
// @match        *://user.qzone.qq.com/*
// @icon         https://qzone.qq.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-start
// @license      MIT
// ==/UserScript==

setTimeout(() => {
    var shuoshuo = document.querySelector('.app_canvas_frame');
    if (!shuoshuo) {
        custom_menu_swf('311');
    }
}, 2567);

setInterval(() => {
    var choosess = document.querySelectorAll(".del.del_btn")[0];
    if (choosess) {
        choosess.click();
    }
}, 1567);

setInterval(() => {
    var deteless = document.querySelectorAll('.qz_dialog_layer_btn.qz_dialog_layer_sub')[0];
    if (deteless) {
        deteless.click();
    }
}, 567);

setInterval(() => {
    window.location.reload();
}, 34567);
