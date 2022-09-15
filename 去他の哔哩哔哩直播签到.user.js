// ==UserScript==
// @name         去他の哔哩哔哩直播签到
// @namespace    https://github.com/s757129
// @homepage     https://s757129.github.io
// @supportURL   https://github.com/s757129/FuckScripts
// @version      0.1
// @description  哔哩哔哩直播自动签到
// @author       柒伍七
// @icon         https://www.bilibili.com/favicon.ico
// @crontab      * * once * *
// @connect      api.live.bilibili.com
// @cloudCat
// @license      What The Hell
// ==/UserScript==

return new Promise((resolve, reject) => {
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
            let log = 'Code: ' + code + '; Tips: ' + msg;
            console.log(log);
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
            let log = '今日签到获得' + txt + ',' + stxt;
            console.log(log);
        })
    resolve();
});
