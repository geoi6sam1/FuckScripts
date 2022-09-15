// ==UserScript==
// @name         去他の哔哩哔哩签到
// @namespace    https://github.com/s757129
// @homepage     https://s757129.github.io
// @supportURL   https://github.com/s757129/FuckScripts
// @version      0.1
// @description  哔哩哔哩自动签到
// @author       柒伍七
// @match        *://*.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @license      What The Hell
// ==/UserScript==

fetch("https://api.bilibili.com/x/web-interface/nav", {
    method: "GET",
    mode: 'cors',
    credentials: 'include',
    headers: {
        'cookie': document.cookie.split(';'),
    }
}).then(response => response.json())
    .then(response => {
        let login = response.data.isLogin;
        let code = response.code;
        let name = response.data.uname;
        switch (login) {
            case true:
                console.log('Code: ' + code + '\nUser: ' + name);
                break;
            case false:
                console.log('Code: ' + code + '\nTips: 请登录后再试!');
                break;
        }

    })

fetch("https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign", {
    method: "GET",
    mode: 'cors',
    credentials: 'include',
    headers: {
        'cookie': document.cookie.split(';'),
    }
}).then(response => response.json())
    .then(response => {
        let code = response.code;
        let msg = response.message;
        console.log('Code: ' + code + '\nTips: ' + msg);
    })

fetch("https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/WebGetSignInfo", {
    method: "GET",
    mode: 'cors',
    credentials: 'include',
    headers: {
        'cookie': document.cookie.split(';'),
    }
}).then(response => response.json())
    .then(response => {
        let txt = response.data.text;
        let stxt = response.data.specialText;
        console.log('今日签到获得' + txt + ',' + stxt);
    })
