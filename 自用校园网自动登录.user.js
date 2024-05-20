// ==UserScript==
// @name            自用校园网自动登录
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     自动登录宿舍校园网
// @author          geoi6sam1
// @match           *://10.10.0.76/*
// @match           *://10.10.0.253/*
// @icon            https://www.tsinghua.edu.cn/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @run-at          document-end
// @license         GPL-3.0
// @updateURL       https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E8%87%AA%E7%94%A8%E6%A0%A1%E5%9B%AD%E7%BD%91%E8%87%AA%E5%8A%A8%E7%99%BB%E5%BD%95.user.js
// @downloadURL     https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E8%87%AA%E7%94%A8%E6%A0%A1%E5%9B%AD%E7%BD%91%E8%87%AA%E5%8A%A8%E7%99%BB%E5%BD%95.user.js
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
