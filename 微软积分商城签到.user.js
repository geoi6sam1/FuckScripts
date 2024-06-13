// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         1.0.8
// @description     每天自动完成微软积分商城活动任务和必应搜索任务获取微软积分商城奖励
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * once * * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @connect         bing.com
// @connect         hot.baiwumm.com
// @license         GPL-3.0
// ==/UserScript==

const dateTime = new Date()
const yearNow = dateTime.getFullYear()
const monthNow = ("0" + (dateTime.getMonth() + 1)).slice(-2)
const dayNow = ("0" + dateTime.getDate()).slice(-2)
const dateNow = `${monthNow}/${dayNow}/${yearNow}`

const whileArr = ["sucHD", "sucSS", "failSS"]
GM_getValue("date") || GM_setValue("date", dateNow)
whileArr.forEach((item) => {
    GM_getValue(item) || GM_setValue(item, 0)
})
if (GM_getValue("date") != dateNow) {
    GM_setValue("date", dateNow)
    whileArr.forEach((item) => {
        GM_setValue(item, 0)
    })
}

function getRandNum(num) {
    return Math.floor(Math.random() * num)
}

function getSRandNum(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}

function getRandArr(arr) {
    const randSort = () => {
        return Math.random() > .5 ? -1 : 1
    }
    return arr.sort(randSort)
}

let lastNumber = null;

function getRandUniNum(min, max) {
    let num
    do {
        num = Math.floor(Math.random() * (max - min + 1) + min)
    } while (num === lastNumber);
    lastNumber = num
    return num
}

function getRandStr(type) {
    const randData = {
        url: [
            "https://hot.baiwumm.com/api/baidu",
            "https://hot.baiwumm.com/api/weibo",
            "https://hot.baiwumm.com/api/douyin",
            "https://hot.baiwumm.com/api/kuaishou",
            "https://hot.baiwumm.com/api/zhihu",
            "https://hot.baiwumm.com/api/thepaper",
            "https://hot.baiwumm.com/api/netease",
            "https://hot.baiwumm.com/api/toutiao",
            "https://hot.baiwumm.com/api/qq",
            "https://hot.baiwumm.com/api/baidutieba",
            "https://hot.baiwumm.com/api/juejin",
            "https://hot.baiwumm.com/api/history-today"
        ],
        pc: [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.131",
            "Mozilla/5.0 (Sonoma; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/604.1 Edg/122.0.2365.106",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.181",
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.140"
        ],
        mobile: [
            "Mozilla/5.0 (Linux; Android 14; 2210132C Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.52 Mobile Safari/537.36 EdgA/125.0.2535.51",
            "Mozilla/5.0 (iPad; CPU OS 16_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0.2210.150 Version/16.0 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/123.0.2420.108 Version/18.0 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 10; HarmonyOS; ALN-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36 EdgA/110.0.1587.61"
        ]
    }
    switch (type) {
        case 0: return randData.url[getRandUniNum(0, randData.url.length - 1)]
        case 1: return randData.pc[getRandNum(randData.pc.length)]
        case 2: return randData.mobile[getRandNum(randData.mobile.length)]
    }
}

function getRewardsToken() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com",
            onload(xhr) {
                if (xhr.status == 200) {
                    var res = xhr.responseText
                    var html = res.replace(/\s/g, "")
                    var data = html.match(/RequestVerificationToken/)
                    if (data && data[0]) {
                        var token = html.match(/RequestVerificationToken"type="hidden"value="(.*?)"\/>/)
                        resolve(token[1])
                    } else {
                        resolve(0)
                    }
                }
            }
        })
    })
}

function getRewardsInfo() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com/api/getuserinfo?type=1",
            onload(xhr) {
                if (xhr.status == 200) {
                    var res = xhr.responseText
                    var data = res.match(/(\"dashboard\"?)/)
                    if (data && data[0]) {
                        res = JSON.parse(res)
                        resolve(res.dashboard)
                    } else {
                        pushMsg("脚本运行失败", "请检查微软账号登录状态！")
                        return true
                    }
                } else {
                    pushMsg("脚本运行失败", "获取积分信息失败！状态码：" + xhr.status)
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
                        for (let i = 0; i < res.data.length; i++) {
                            keywordList.push(res.data[i].title)
                        }
                        keywordList = getRandArr(keywordList)
                        resolve(keywordList[keywordIndex])
                    } else {
                        pushMsg("脚本运行失败", "获取关键词失败！状态码：" + xhr.status)
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
    return query + Date.now() % 1000
}

let retryTimes = 0
let lastProcess = 0
let pcPtPro = 0
let mobilePtPro = 0
let pcPtProMax = 1
let mobilePtProMax = 1
let domain = "www.bing.com"

async function taskSearch() {
    const onload = (res) => {
        const url = new URL(res.finalUrl)
        if (url.host != domain) {
            domain = url.host
        }
    }
    const dashboard = await getRewardsInfo()
    const userInfo = dashboard.userStatus
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
            if (GM_getValue("failSS") > 6) {
                GM_setValue("failSS", 0)
                pushMsg("搜索任务限制", `请尝试手动运行或等待下轮运行！\n电脑：${pcPtPro}/${pcPtProMax}　移动设备：${mobilePtPro}/${mobilePtProMax}`)
            }
            GM_setValue("failSS", GM_getValue("failSS") + 1)
            return true
        }
    } else {
        retryTimes = 0
        lastProcess = userInfo.counters.dailyPoint[0].pointProgress
    }
    if (pcPtPro >= pcPtProMax && mobilePtPro >= mobilePtProMax) {
        if (GM_getValue("sucSS") == 1) {
            pushMsg("搜索任务完成", `历史：${userInfo.lifetimePoints}　本月：${userInfo.levelInfo.progress}\n有效：${userInfo.availablePoints}　今日：${userInfo.counters.dailyPoint[0].pointProgress}`)
        }
        GM_setValue("sucSS", GM_getValue("sucSS") + 1)
        return true
    } else {
        const keyword = await getTopKeyword()
        if (pcPtPro < pcPtProMax) {
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${encodeURIComponent(keyword)}&FORM=QBLH`,
                headers: {
                    "User-Agent": getRandStr(1),
                    "Referer": `https://${domain}/`
                },
                onload: onload
            })
            return false
        } else {
            if (mobilePtPro < mobilePtProMax) {
                GM_xmlhttpRequest({
                    url: `https://${domain}/search?q=${encodeURIComponent(keyword)}&FORM=QBLH`,
                    headers: {
                        "User-Agent": getRandStr(2),
                        "Referer": `https://${domain}/`
                    },
                    onload: onload
                })
                return false
            }
        }
    }
}

async function taskPromotions() {
    const token = await getRewardsToken()
    if (token == 0) {
        return true
    } else {
        const promotionsArr = []
        const dashboard = await getRewardsInfo()
        const morePromotions = dashboard.morePromotions
        const dailySetPromotions = dashboard.dailySetPromotions[dateNow]
        for (let d = 0; d < dailySetPromotions.length; d++) {
            if (dailySetPromotions[d].complete == false) {
                promotionsArr.push({ "offerId": dailySetPromotions[d].offerId, "hash": dailySetPromotions[d].hash })
            }
        }
        for (let m = 0; m < morePromotions.length; m++) {
            if (morePromotions[m].complete == false) {
                promotionsArr.push({ "offerId": morePromotions[m].offerId, "hash": morePromotions[m].hash })
            }
        }
        if (promotionsArr.length == 0) {
            if (GM_getValue("sucHD") == 1) {
                pushMsg("活动任务完成", "每日活动与更多活动任务已完成！")
            }
            GM_setValue("sucHD", GM_getValue("sucHD") + 1)
            return true
        } else {
            promotionsArr.forEach((item) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: `https://rewards.bing.com/api/reportactivity`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Referer": `https://rewards.bing.com/`,
                        "User-Agent": getRandStr(1)
                    },
                    data: `id=${item.offerId}&hash=${item.hash}&__RequestVerificationToken=${token}`,
                })
            })
            return false
        }
    }
}

return new Promise((resolve, reject) => {
    const start = async () => {
        try {
            const result = await taskSearch()
            result ? resolve() : setTimeout(start, getSRandNum(6789, 9876))
        } catch (err) {
            reject(err)
        }
    }
    const begin = async () => {
        try {
            const ending = await taskPromotions()
            ending ? start() : setTimeout(begin, 4321)
        } catch (err) {
            reject(err)
        }
    }
    begin()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "微软积分商城" + title,
        image: "https://rewards.bing.com/rewards.png",
        onclick: () => {
            GM_openInTab("https://rewards.bing.com/pointsbreakdown", { active: true, insert: true, setParent: true })
        }
    })
}
