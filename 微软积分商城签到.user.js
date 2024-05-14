// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         1.0.5
// @description     每天自动完成微软必应搜索任务获取微软积分商城奖励
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log
// @connect         bing.com
// @connect         top.baidu.com
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

function getRandArr(arr) {
    const randSort = () => {
        return Math.random() > .5 ? -1 : 1
    }
    return arr.sort(randSort)
}

function getRandStr(type) {
    const randData = {
        url: [
            "https://top.baidu.com/api/board?tab=realtime",
            "https://top.baidu.com/api/board?tab=livelihood",
            "https://top.baidu.com/api/board?tab=finance"
        ],
        pc: [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.310 Safari/537.36 Edg/120.0.2210.175",
            "Mozilla/5.0 (Sonoma; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.214 Safari/537.36 Edg/119.0.2151.97",
            "Mozilla/5.0 (X11; Deepin; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.213 Safari/537.36 Edg/110.0.1587.78"
        ],
        m: [
            "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.134 Mobile Safari/537.36 EdgA/123.0.2420.97",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 EdgiOS/111.0.1661.62",
            "Mozilla/5.0 (Linux; Android 10; HarmonyOS; ALN-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.74 Mobile Safari/537.36 EdgA/101.0.1210.53"
        ]
    }
    switch (type) {
        case 0: return randData.url[getRandNum(randData.url.length)]
        case 1: return randData.pc[getRandNum(randData.pc.length)]
        case 2: return randData.m[getRandNum(randData.m.length)]
    }
}

function getRewardsInfo() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com/api/getuserinfo?type=1",
            onload(xhr) {
                if (xhr.status == 200) {
                    var res = xhr.responseText
                    var data = res.match(/(\"userStatus\"?)/)
                    if (data && data[0]) {
                        res = JSON.parse(res)
                        resolve(res.dashboard.userStatus)
                    } else {
                        pushMsg("失败", "请检查微软账号登录状态！")
                        return true
                    }
                } else {
                    pushMsg("失败", "获取积分信息失败！状态码：" + xhr.status)
                    return true
                }
            }
        })
    })
}

let keywordList = []
let keywordIndex = 0

async function getTopKeyword() {
    const query = await new Promise((resolve, reject) => {
        if (keywordIndex < 1 || keywordList.length < 1) {
            keywordIndex++
            GM_xmlhttpRequest({
                url: getRandStr(0),
                onload(xhr) {
                    if (xhr.status == 200) {
                        var res = JSON.parse(xhr.responseText)
                        var data = res.data.cards[0].content
                        for (let i = 0; i < data.length; i++) {
                            keywordList.push(data[i].word)
                        }
                        keywordList = getRandArr(keywordList)
                        resolve(keywordList[keywordIndex])
                    } else {
                        pushMsg("失败", "获取关键词失败！状态码：" + xhr.status)
                        return true
                    }
                }
            })
        } else {
            keywordIndex++
            if (keywordIndex > keywordList.length - 1) {
                keywordIndex = 0
            }
            resolve(keywordList[keywordIndex])
        }
    })
    return query + new Date().getTime() % 1000
}

let retryTimes = 0
let lastProcess = 0
let pcPtPro = 0
let mobilePtPro = 0
let pcPtProMax = 1
let mobilePtProMax = 1
let domain = "www.bing.com"

async function main() {
    const onload = (res) => {
        const url = new URL(res.finalUrl)
        if (url.host != domain) {
            domain = url.host
        }
    }
    const userInfo = await getRewardsInfo()
    if (userInfo.counters.pcSearch) {
        pcPtPro = userInfo.counters.pcSearch[0].pointProgress
        pcPtProMax = userInfo.counters.pcSearch[0].pointProgressMax
    }
    if (userInfo.counters.mobileSearch) {
        mobilePtPro = userInfo.counters.mobileSearch[0].pointProgress
        mobilePtProMax = userInfo.counters.mobileSearch[0].pointProgressMax
    }
    if (userInfo.counters.dailyPoint[0].pointProgress === lastProcess) {
        retryTimes++
        if (retryTimes > 6) {
            pushMsg("出错", `未知错误停止，请尝试手动运行！\n电脑：${pcPtPro}/${pcPtProMax}　移动设备：${mobilePtPro}/${mobilePtProMax}`)
            return true
        }
    } else {
        retryTimes = 0
        lastProcess = userInfo.counters.dailyPoint[0].pointProgress
    }
    if (pcPtPro >= pcPtProMax && mobilePtPro >= mobilePtProMax) {
        pushMsg("完成", `历史：${userInfo.lifetimePoints}　本月：${userInfo.levelInfo.progress}\n有效：${userInfo.availablePoints}　今日：${userInfo.counters.dailyPoint[0].pointProgress}`)
        return true
    } else {
        const keyword = await getTopKeyword()
        if (pcPtPro < pcPtProMax) {
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${encodeURIComponent(keyword)}&form=QBLH`,
                headers: {
                    "Referer": `https://${domain}/`,
                    "User-Agent": getRandStr(1)
                },
                onload: onload
            })
            return false
        } else {
            if (mobilePtPro < mobilePtProMax) {
                GM_xmlhttpRequest({
                    url: `https://${domain}/search?q=${encodeURIComponent(keyword)}&form=QBLH`,
                    headers: {
                        "Referer": `https://${domain}/`,
                        "User-Agent": getRandStr(2)
                    },
                    onload: onload
                })
                return false
            }
        }
    }
}

return new Promise((resolve, reject) => {
    const start = async () => {
        try {
            const result = await main()
            result ? resolve() : setTimeout(start, 6 * 1000 + getRandNum(1000))
        } catch (err) {
            reject(err)
        }
    }
    start()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "微软积分商城签到" + title,
        image: "https://rewards.bing.com/rewards.png",
        onclick: () => {
            GM_openInTab("https://rewards.bing.com/pointsbreakdown", { active: true, insert: true, setParent: true })
        }
    })
}
