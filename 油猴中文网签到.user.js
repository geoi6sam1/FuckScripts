// ==UserScript==
// @name            油猴中文网签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     油猴中文网每日自动签到
// @author          geoi6sam1@qq.com
// @icon            https://bbs.tampermonkey.net.cn/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_log
// @connect         bbs.tampermonkey.net.cn
// @license         GPL-3.0
// @updateURL       https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E6%B2%B9%E7%8C%B4%E4%B8%AD%E6%96%87%E7%BD%91%E7%AD%BE%E5%88%B0.user.js
// @downloadURL     https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E6%B2%B9%E7%8C%B4%E4%B8%AD%E6%96%87%E7%BD%91%E7%AD%BE%E5%88%B0.user.js
// ==/UserScript==

function getRandNum(num) {
    return Math.floor(Math.random() * num)
}

function getRandStr() {
    const randData = ['kx', 'ng', 'ym', 'wl', 'nu', 'ch', 'fd', 'yl', 'dk']
    return randData[getRandNum(randData.length)]
}

return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
        url: "https://bbs.tampermonkey.net.cn",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        },
        onload(xhr) {
            var res = xhr.responseText
            if (xhr.status == 200) {
                var formhash = res.match(/formhash=(.*?)"/)
                if (formhash) {
                    resolve(formhash[1])
                } else {
                    pushMsg("失败", "请先登录才能继续操作！")
                    resolve()
                }
            } else {
                pushMsg("失败", "签到失败！状态码：" + xhr.status)
                resolve()
            }
        },
    })
}).then(async (formhash) => {
    return await new Promise((_resolve, _reject) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: `https://bbs.tampermonkey.net.cn/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://bbs.tampermonkey.net.cn/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            },
            data: `formhash=${formhash}&qdxq=${getRandStr()}&qdmode=1&todaysay=${Date.now()}&fastreply=0`,
            onload(xhr) {
                var res = xhr.responseText.replace(/\s/g, "")
                GM_log(res)
                var msg = res.match(/class="c">(.*?)<\/div><\/div>\]\]/)
                pushMsg("完成", msg[1])
                _resolve()
            },
        })
    })
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "油猴中文网签到" + title,
        image: "https://bbs.tampermonkey.net.cn/favicon.ico",
        onclick: () => {
            GM_openInTab("https://bbs.tampermonkey.net.cn/member.php?mod=logging&action=login", { active: true, insert: true, setParent: true })
        }
    })
}
