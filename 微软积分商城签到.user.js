// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     每天自动完成微软必应搜索任务获取微软积分商城奖励
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * 7-23 once * *
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

var retryNum = 0
var lastProcess = 0
var keywordIndex = 0
var keywordList = []
var domain = "www.bing.com"
var sleepTime = GM_getValue("Time.inr") * 1000 + Math.floor(Math.random() * 1000)
var windowsUA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
var androidUA = "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"

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
                    reMsg("失败", "获取积分信息失败！状态码：" + stat)
                    reject(xhr)
                }
            }, onerror(err) {
                reMsg("出错", "获取积分信息出错，请查看运行日志！")
                reject(err)
            }
        })
    })
}

async function getTopKeyword() {
    const query = await new Promise((resolve, reject) => {
        if (keywordList.length == 0) {
            GM_xmlhttpRequest({
                url: "https://top.baidu.com/api/board?tab=realtime",
                onload(xhr) {
                    if (xhr.status == 200) {
                        var res = JSON.parse(xhr.responseText)
                        var data = res.data.cards[0].content
                        for (let i = 0; i < data.length; i++) {
                            keywordList.push(data[i].word)
                        }
                        if (!Array.prototype.derangedArray) {
                            Array.prototype.derangedArray = function () {
                                for (var a, b, c = this.length; c; a = parseInt(Math.random() * c), x = this[--c], this[c] = this[a], this[a] = b)
                                    return this
                            }
                        }
                        keywordList.derangedArray()
                        resolve(keywordList[keywordIndex])
                    } else {
                        reMsg("失败", "获取关键词失败！状态码：" + stat)
                        reject(xhr)
                    }
                }, onerror(err) {
                    reMsg("出错", "获取关键词出错，请查看运行日志！")
                    reject(err)
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
            reMsg("频繁", `搜索过于频繁，请稍后再重新运行！\n电脑：${dashboard.userStatus.counters.pcSearch[0].pointProgress}/${dashboard.userStatus.counters.pcSearch[0].pointProgressMax}　移动设备：${dashboard.userStatus.counters.mobileSearch[0].pointProgress}/${dashboard.userStatus.counters.mobileSearch[0].pointProgressMax}`)
            return true
        }
    } else {
        lastProcess = dashboard.userStatus.counters.dailyPoint[0].pointProgress
    }
    if (dashboard.userStatus.counters.dailyPoint[0].pointProgress === dashboard.userStatus.counters.dailyPoint[0].pointProgressMax) {
        reMsg("完成", `历史积分：${dashboard.userStatus.lifetimePoints}　可用积分：${dashboard.userStatus.availablePoints}\n本月积分：${dashboard.userStatus.levelInfo.progress}　今日积分：${dashboard.userStatus.counters.dailyPoint[0].pointProgress}`)
        return true
    } else {
        if (dashboard.userStatus.counters.pcSearch[0].pointProgress < dashboard.userStatus.counters.pcSearch[0].pointProgressMax) {
            const keyword = await getTopKeyword()
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH`,
                headers: {
                    "Referer": `https://${domain}/`,
                    "User-Agent": androidUA,
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
                        "Referer": `https://${domain}/`,
                        "User-Agent": windowsUA,
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
