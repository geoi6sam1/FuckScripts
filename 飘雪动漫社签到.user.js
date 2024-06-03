// ==UserScript==
// @name            飘雪动漫社签到
// @namespace       https://github.com/geoi6sam1
// @version         0.3.0
// @description     飘雪动漫社每日自动签到，领取红包
// @author          geoi6sam1@qq.com
// @icon            https://www.dranime.net/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_log
// @connect         www.dranime.net
// @license         GPL-3.0
// ==/UserScript==

function getRandNum(num) {
    return Math.floor(Math.random() * num)
}

function getSRandNum(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}

function getRandStr() {
    const randData = ['kx', 'ng', 'ym', 'wl', 'nu', 'ch', 'fd', 'yl']
    return randData[getRandNum(randData.length)]
}

function _hash() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://www.dranime.net",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
            },
            onload(xhr) {
                var res = xhr.responseText
                if (xhr.status == 200) {
                    var formhash = res.match(/formhash=(.*?)&/)
                    if (formhash) {
                        resolve(formhash[1])
                    } else {
                        pushMsg("失败", "您需要先登录才能继续操作！")
                        return true
                    }
                } else {
                    pushMsg("失败", "签到失败！状态码：" + xhr.status)
                    return true
                }
            }
        })
    })
}

let qiandao = 0
let retryTimes = 0
let packetid = 55

async function main() {
    retryTimes++
    const formhash = await _hash()
    if (retryTimes > 6) {
        pushMsg("出错", "签到出错，请查看运行日志！")
        return true
    }
    if (qiandao < -1) {
        pushMsg("失败", "您的账号没有签到权限哦！")
        return true
    } else if (qiandao > 1) {
        pushMsg("完成", "签到完成，签到就完成了！")
        return true
    } else {
        qiandao = 0
        const onload = (xhr) => {
            var res = xhr.responseText
            if (res.match(/用户组/)) {
                qiandao--
            } else if (res.match(/签到/)) {
                qiandao++
            }
        }
        GM_xmlhttpRequest({
            method: 'POST',
            url: `https://www.dranime.net/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.dranime.net/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            },
            data: `formhash=${formhash}&qdxq=${getRandStr()}&qdmode=1&todaysay=${encodeURIComponent("来自客户端的签到")}&fastreply=0`,
            onload: onload
        })
        GM_xmlhttpRequest({
            method: 'POST',
            url: `https://www.dranime.net/plugin.php?id=xigua_sign:response&operation=qiandao&infloat=1&inajax=1&mobile=no&qdmode=3`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.dranime.net/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
            },
            data: `formhash=${formhash}&qdxq=${getRandStr()}`,
            onload: onload
        })
        GM_xmlhttpRequest({
            url: `https://www.dranime.net/plugin.php?id=luckypacket&module=ajax&action=get&getsubmit=yes&packetid=${packetid}`
        })
        return false
    }
}

return new Promise((resolve, reject) => {
    const start = async () => {
        try {
            const result = await main()
            result ? resolve() : setTimeout(start, getSRandNum(100,200))
        } catch (err) {
            reject(err)
        }
    }
    start()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "飘雪动漫社签到" + title,
        image: "https://www.dranime.net/favicon.ico",
        onclick: () => {
            GM_openInTab("https://www.dranime.net/member.php?mod=logging&action=login", { active: true, insert: true, setParent: true })
        }
    })
}
