// ==UserScript==
// @name            粤梦缘论坛签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     粤梦缘论坛每日自动签到，领取红包
// @author          geoi6sam1@qq.com
// @icon            https://www.dranime.net/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log
// @cloudcat            
// @connect         www.dranime.net
// @exportcookie    domain=www.dranime.net
// @antifeature     ads
// @antifeature     miner
// @antifeature     payment
// @antifeature     tracking
// @antifeature     membership
// @antifeature     referral-link
// @license         GPL-3.0
// ==/UserScript==

function getRandNum(num) {
    return Math.floor(Math.random() * num)
}

function getRandStr() {
    const randData = ['kx', 'ng', 'ym', 'wl', 'nu', 'ch', 'fd', 'yl']
    return randData[getRandNum(randData.length)]
}

async function _hash() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://www.dranime.net",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
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
                    pushMsg("失败", "签到失败！状态码：" + stat)
                    return true
                }
            },
        })
    })
}

let qiandao = 0
let retryNum = 0
let packetid = 55

async function main() {
    retryNum++
    const formhash = await _hash()
    if (retryNum > 6) {
        pushMsg("出错", "签到出错，请查看运行日志！")
        return true
    }
    if (qiandao > 1) {
        pushMsg("完成", "签到完成，签到就完成了！")
        return true
    } else {
        qiandao = 0
        GM_xmlhttpRequest({
            url: `https://www.dranime.net/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1&formhash=${encodeURIComponent(formhash)}&qdxq=${getRandStr()}&qdmode=3&todaysay=&fastreply=0`,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            },
            onload() { qiandao++ },
        })
        GM_xmlhttpRequest({
            url: `https://www.dranime.net/plugin.php?id=xigua_sign:response&operation=qiandao&infloat=1&inajax=1&mobile=no&qdmode=3&formhash=${encodeURIComponent(formhash)}&qdxq=${getRandStr()}`,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
            },
            onload() { qiandao++ },
        })
        GM_xmlhttpRequest({
            url: `https://www.dranime.net/plugin.php?id=luckypacket&module=ajax&action=get&getsubmit=yes&packetid=${packetid}`,
        })
        return false
    }
}

return new Promise((resolve, reject) => {
    const start = async () => {
        try {
            const result = await main()
            result ? resolve() : start()
        } catch (err) {
            reject(err)
        }
    }
    start()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "粤梦缘论坛签到" + title,
        image: "https://www.dranime.net/favicon.ico",
        onclick: () => {
            GM_openInTab("https://www.dranime.net/member.php?mod=logging&action=login", { active: true, insert: true, setParent: true })
        }
    })
}
