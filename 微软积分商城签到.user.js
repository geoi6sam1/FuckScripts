// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         0.2.1
// @description     每天自动完成微软必应搜索任务获取微软积分商城奖励
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @cloudcat
// @connect         bing.com
// @connect         top.baidu.com
// @exportCookie    domain=.bing.com
// @antifeature     ads
// @antifeature     miner
// @antifeature     payment
// @antifeature     tracking
// @antifeature     membership
// @antifeature     referral-link
// @license         GPL-3.0
// ==/UserScript==

/* ==UserConfig==
Time:
  inr:
    title: 搜索间隔
    description: 最小1秒，默认5秒
    type: number
    default: 5
    min: 1
    unit: 秒
 ==/UserConfig== */

function getSubstring(inputStr, startStr, endStr) {
    const startIndex = inputStr.indexOf(startStr)
    if (startIndex == -1) {
        return null
    }
    const endIndex = inputStr.indexOf(endStr, startIndex + startStr.length)
    if (endIndex == -1) {
        return null
    }
    return inputStr.substring(startIndex + startStr.length, endIndex)
}

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
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Sonoma; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Deepin; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        ],
        m: [
            "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 10; HarmonyOS; ALN-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36"
        ]
    }
    switch (type) {
        case 0: return randData.url[getRandNum(randData.url.length)]
        case 1: return randData.pc[getRandNum(randData.pc.length)]
        case 2: return randData.m[getRandNum(randData.m.length)]
    }
}

var retryNum = 0
var lastProcess = 0
var keywordIndex = 0
var keywordList = []
var domain = "www.bing.com"
var sleepTime = GM_getValue("Time.inr") * 1000 + getRandNum(1000)

function getRewardsInfo() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com",
            onload(xhr) {
                if (xhr.status == 200) {
                    var res = xhr.responseText
                    var data = JSON.parse(getSubstring(res, "var dashboard = ", ";\r"))
                    resolve(data)
                } else {
                    reMsg("失败", "获取积分信息失败！状态码：" + stat).then(() => { reject(xhr) })
                }
            }, onerror(err) {
                reMsg("出错", "获取积分信息出错，请查看运行日志！").then(() => { reject(err) })
            }
        })
    })
}

async function getTopKeyword() {
    const query = await new Promise((resolve, reject) => {
        if (keywordList.length < 1) {
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
                        reMsg("失败", "获取关键词失败！状态码：" + stat).then(() => { reject(xhr) })
                    }
                }, onerror(err) {
                    reMsg("出错", "获取关键词出错，请查看运行日志！").then(() => { reject(err) })
                }
            })
        } else {
            keywordIndex++
            if (keywordIndex > keywordList.length) {
                keywordIndex = 0
            }
            resolve(keywordList[keywordIndex])
        }
    })
    return query + new Date().getTime() % 1000
}

async function main() {
    const onload = (resp) => {
        const url = new URL(resp.finalUrl)
        if (url.host != domain) {
            domain = url.host
        }
    }
    const dashboard = await getRewardsInfo()
    if (dashboard.userStatus.counters.dailyPoint[0].pointProgress === lastProcess) {
        retryNum++
        if (retryNum > 3) {
            reMsg("停止", `未知原因停止，请手动重新运行！\n电脑：${dashboard.userStatus.counters.pcSearch[0].pointProgress}/${dashboard.userStatus.counters.pcSearch[0].pointProgressMax}　移动设备：${dashboard.userStatus.counters.mobileSearch[0].pointProgress}/${dashboard.userStatus.counters.mobileSearch[0].pointProgressMax}`)
            return true
        }
    } else {
        lastProcess = dashboard.userStatus.counters.dailyPoint[0].pointProgress
    }
    if (dashboard.userStatus.counters.dailyPoint[0].pointProgress === dashboard.userStatus.counters.dailyPoint[0].pointProgressMax) {
        reMsg("完成", `历史积分：${dashboard.userStatus.lifetimePoints}　本月积分：${dashboard.userStatus.levelInfo.progress}\n可用积分：${dashboard.userStatus.availablePoints}　今日积分：${dashboard.userStatus.counters.dailyPoint[0].pointProgress}`)
        return true
    } else {
        if (dashboard.userStatus.counters.pcSearch[0].pointProgress < dashboard.userStatus.counters.pcSearch[0].pointProgressMax) {
            const keyword = await getTopKeyword()
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH`,
                headers: {
                    "DNT": 1,
                    "Referer": `https://${domain}/`,
                    "User-Agent": getRandStr(1),
                },
                onload: onload,
            })
            return false
        } else {
            if (dashboard.userStatus.counters.mobileSearch[0].pointProgress < dashboard.userStatus.counters.mobileSearch[0].pointProgressMax) {
                const keyword = await getTopKeyword()
                GM_xmlhttpRequest({
                    url: `https://${domain}/search?q=${keyword}&form=QBLH`,
                    headers: {
                        "DNT": 1,
                        "Referer": `https://${domain}/`,
                        "User-Agent": getRandStr(2),
                    },
                    onload: onload,
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
            if (result) {
                resolve()
            } else {
                setTimeout(() => {
                    start()
                }, sleepTime)
            }
        } catch (err) {
            reMsg('出错', '搜索出错，请查看运行日志！')
            reject(err)
        }
    }
    start()
})

function reMsg(title, text) {
    GM_notification({
        text: text,
        title: "微软积分商城签到" + title,
        image: "https://rewards.bing.com/rewards.png",
    })
}
