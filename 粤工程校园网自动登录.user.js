// ==UserScript==
// @name         粤工程校园网自动登录
// @namespace    https://github.com/geoi6sam1
// @version      0.1.0
// @description  自动登录粤工程宿舍校园网
// @author       geoi6sam1
// @match        *://10.10.0.76/*
// @match        *://10.10.0.253/*
// @icon         https://www.gdep.edu.cn/__local/1/78/44/67DBBD0E4AF7849771AEBA0A69A_8F5875B0_45D51.jpg
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-end
// @license      MIT
// ==/UserScript==

let uid = ""; // 学号
let pwd = ""; // 密码

let login = setInterval(() => {
    let userid = document.querySelector("#userid");
    let passwd = document.querySelector("#passwd");
    if (userid && passwd) {
        userid.value = uid;
        passwd.value = pwd;
        let loginsubmit = document.querySelector("#loginsubmit");
        if (loginsubmit) {
            loginsubmit.click();
        }
    }
}, 99);

let logoutsubmit = document.querySelector("#logoutsubmit");
if (logoutsubmit) {
    clearInterval(login);
}
