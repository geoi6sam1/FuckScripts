// ==UserScript==
// @name         自用校园网自动登录
// @namespace    https://github.com/geoi6sam1
// @version      0.1.0
// @description  自动登录宿舍校园网
// @author       geoi6sam1
// @match        *://10.10.0.76/*
// @match        *://10.10.0.253/*
// @icon         https://www.tsinghua.edu.cn/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @run-at       document-end
// @license      MIT
// @updateURL       
// @downloadURL     
// ==/UserScript==

const uid = "" // 学号
const pwd = "" // 密码

setInterval(() => {
    var userid = document.querySelector("#userid")
    var passwd = document.querySelector("#passwd")
    if (userid && passwd) {
        userid.value = uid
        passwd.value = pwd
        let loginsubmit = document.querySelector("#loginsubmit")
        if (loginsubmit) {
            loginsubmit.click()
        }
    }
}, 99)

let logoutsubmit = document.querySelector("#logoutsubmit");
if (logoutsubmit) {
    clearInterval(login);
}
