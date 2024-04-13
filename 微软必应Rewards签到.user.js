// ==UserScript==
// @name            微软必应Rewards签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     每天自动完成Bing搜索任务获取微软Rewards积分
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
    description: 最小1秒，最大60秒，默认5秒
    type: number
    default: 5
    min: 1
    max: 60
    unit: 秒
 ==/UserConfig== */

GM_getValue("Time.inr") || GM_setValue("Time.inr", 5)

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
var windowsUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.4567.89"
var androidUA = "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 EdgA/123.0.4567.89"

function getRewardsInfo() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com",
            headers: {
                "User-Agent": windowsUA,
            },
            onload(xhr) {
                if (xhr.status == 200) {
                    resolve(xhr.responseText)
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
    const rewardsData = await getRewardsInfo()
    const dashboard = JSON.parse(getSubstring(rewardsData, "var dashboard = ", ";\r"))
    var promoMore = dashboard.morePromotions
    for (let i = 0; i < promoMore.length; i++) {
        if (promoMore[i].attributes.isGiveEligible == false) {
            GM_xmlhttpRequest({
                url: promoMore[i].attributes.destinationUrl,
                headers: {
                    "Referer": `https://rewards.bing.com/`,
                    "User-Agent": windowsUA,
                },
            })
        }
    }
    var dlyPointPro = dashboard.userStatus.counters.dailyPoint[0].pointProgress
    var pcPro = dashboard.userStatus.counters.pcSearch[0].pointProgress
    var pcMax = dashboard.userStatus.counters.pcSearch[0].pointProgressMax
    var mobilePro = dashboard.userStatus.counters.mobileSearch[0].pointProgress
    var mobileMax = dashboard.userStatus.counters.mobileSearch[0].pointProgressMax
    if (dlyPointPro === lastProcess) {
        retryNum++
        if (retryNum > 3) {
            reMsg("失败", `请增加搜索间隔时间（默认5秒）\n电脑：${pcPro}/${pcMax}　移动设备：${mobilePro}/${mobileMax}`)
            return true
        }
    } else {
        lastProcess = dlyPointPro
    }
    var tdPro = pcPro + mobilePro
    var tdMax = pcMax + mobileMax
    if (tdPro == tdMax) {
        reMsg("完成", `当前等级：${dashboard.userStatus.levelInfo.activeLevel}（${dashboard.userStatus.lifetimePoints}）\n可用积分：${dashboard.userStatus.availablePoints}　今日积分：${dlyPointPro}`)
        return true
    } else {
        if (pcPro < pcMax) {
            const keyword = await getTopKeyword()
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH&lq=0&ghsh=0&ghacc=0&ghpl=`,
                headers: {
                    "Referer": `https://${domain}/`,
                    "User-Agent": windowsUA,
                },
                onload: onload,
            })
        } else {
            const keyword = await getTopKeyword()
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH&lq=0&ghsh=0&ghacc=0&ghpl=`,
                headers: {
                    "Referer": `https://${domain}/`,
                    "User-Agent": androidUA,
                },
                onload: onload,
            })
        }
        return false
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
        title: "微软必应Rewards签到" + title,
        image: "https://rewards.bing.com/rewards.png",
    })
}
