// ==UserScript==
// @name         去他の粤工程校园网
// @namespace    https://github.com/s757129
// @version      0.1
// @description  自动登录粤工程宿舍校园网
// @author       柒伍七
// @match        *://10.10.0.76/*
// @match        *://10.10.0.253/*
// @icon         https://www.gdep.edu.cn/__local/1/78/44/67DBBD0E4AF7849771AEBA0A69A_8F5875B0_45D51.jpg?e=.jpg
// @supportURL   https://github.com/s757129/FuckScripts/issues
// @run-at       document-start
// @license      MIT
// ==/UserScript==

var uid = ''; // 学号
var pwd = ''; // 密码

setTimeout(() => {
    var userid = document.querySelector('#userid');
    var passwd = document.querySelector('#passwd');
    if (userid && passwd != null) {
        userid.value = uid;
        passwd.value = pwd;
        setTimeout(() => {
            var loginsubmit = document.querySelector('#loginsubmit');
            if (loginsubmit != null) {
                loginsubmit.click();
            }
        }, 456);
    }
}, 123);
