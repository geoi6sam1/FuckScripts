// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         3.0.1
// @description     每天自动完成 Microsoft Rewards 任务获取积分奖励，✅必应搜索（Web）、✅每日活动（Web）、✅更多活动（Web）、✅文章阅读（App）、✅每日签到（App）
// @author          geoi6sam1@qq.com
// @icon            https://store-images.s-microsoft.com/image/apps.58212.783a7d74-cf5a-4dca-aed6-b5722f311eca.f8c0cb0b-6b57-4f06-99b1-5d7ee04e38e6.517a44fd-f164-40ae-996b-f959198325c2
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         */20 * * * *
// @grant           unsafeWindow
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @connect         bing.com
// @connect         rewards.bing.com
// @connect         login.live.com
// @connect         prod.rewardsplatform.microsoft.com
// @connect         dailyapi.eray.cc
// @connect         hot.baiwumm.com
// @connect         cnxiaobai.com
// @connect         hotapi.zhusun.top
// @connect         api-hot.imsyy.top
// @connect         hotapi.nntool.cc
// @license         GPL-3.0
// ==/UserScript==


/* ==UserConfig==
Config:
    app:
        title: 微软必应App（每日签到 + 文章阅读）
        type: checkbox
        default: false
    limit:
        title: 限制搜索（每次运行只搜索 4-8 次）
        type: checkbox
        default: true
    span:
        title: 搜索间隔（默认15，即间隔 10-20 秒）
        type: number
        default: 15
        min: 10
        max: 300
        unit: ±5秒
    api:
        title: 搜索词接口（单机模式为随机汉字组句）
        type: select
        default: 单机模式
        values: [单机模式, hot.eray.cc, hot.baiwumm.com, hot.cnxiaobai.com, hot.zhusun.top, hot.imsyy.top, hot.nntool.cc]
==/UserConfig== */


const obj = {
    data: {
        time: {
            task: 3000
        },
        auth: {
            code: "https://login.live.com/oauth20_authorize.srf",
            token: "https://login.live.com/oauth20_token.srf",
            clientId: "0000000040170455",
            scope: "service::prod.rewardsplatform.microsoft.com::MBI_SSL",
            redirectUri: "https://login.live.com/oauth20_desktop.srf",
        },
        ua: {
            pc: [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.131",
                "Mozilla/5.0 (Sonoma; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/604.1 Edg/122.0.2365.106",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.181",
                "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.140",
            ],
            m: [
                "Mozilla/5.0 (Linux; Android 14; 2210132C Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.52 Version/4.0 Mobile Safari/537.36 EdgA/125.0.2535.51",
                "Mozilla/5.0 (iPad; CPU OS 16_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0.2210.150 Version/16.0 Mobile/15E148 Safari/604.1",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/123.0.2420.108 Version/18.0 Mobile/15E148 Safari/604.1",
                "Mozilla/5.0 (Linux; Android 10; HarmonyOS; ALN-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Version/4.0 Mobile Safari/537.36 EdgA/110.0.1587.61",
            ],
        },
        api: {
            arr: [
                ["hot.eray.cc", {
                    url: "https://dailyapi.eray.cc/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"]
                }],
                ["hot.baiwumm.com", {
                    url: "https://hot.baiwumm.com/api/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq", "netease", "zhihu"]
                }],
                ["hot.cnxiaobai.com", {
                    url: "https://cnxiaobai.com/DailyHotApi/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"]
                }],
                ["hot.zhusun.top", {
                    url: "https://hotapi.zhusun.top/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"]
                }],
                ["hot.imsyy.top", {
                    url: "https://api-hot.imsyy.top/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"]
                }],
                ["hot.nntool.cc", {
                    url: "https://hotapi.nntool.cc/",
                    hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"]
                }]
            ]
        },
        web: 0,
        app: 0
    },
    task: {
        sign: {
            times: 0,
            point: 1,
            end: 0,
        },
        read: {
            times: 0,
            point: 0,
            end: 0,
        },
        promo: {
            times: 0,
            token: 0,
            end: 0,
        },
        search: {
            word: {
                list: [],
                index: 0,
            },
            times: 0,
            progressNow: 0,
            pc: {
                progress: 0,
                max: 1,
            },
            m: {
                progress: 0,
                max: 1,
            },
            limit: {
                min: 3,
                max: 7
            },
            index: 0,
            end: 0,
        },
        token: 0,
    },
}


obj.getRandomNum = function (num) {
    return Math.floor(Math.random() * num)
}


obj.getScopeRandomNum = function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}


obj.getRandomArr = function (arr) {
    return arr.sort(() => {
        return Math.random() - 0.5
    })
}


obj.getRandomChineseChar = function () {
    const codePoint = Math.floor(Math.random() * (0x9FFF - 0x4E00 + 1)) + 0x4E00
    return String.fromCodePoint(codePoint)
}


obj.generateRandomChineseStr = function (minLength = 6, maxLength = 32) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
    let result = ""
    for (let i = 0; i < length; i++) {
        result += obj.getRandomChineseChar()
    }
    return result
}


obj.getRandomApiHot = function () {
    const lastIndex = parseInt(GM_getValue("last_index", -1))
    const filteredArr = obj.data.api.hot.filter((name, index) => index != lastIndex)
    const randomIndex = obj.getRandomNum(filteredArr.length)
    GM_setValue("last_index", randomIndex)
    return filteredArr[randomIndex]
}


obj.pushMsg = function (title, text) {
    title = "微软积分商城" + title
    GM_log(title + text)
    GM_notification({
        text: text,
        title: title,
        onclick: () => {
            GM_openInTab("https://rewards.bing.com/pointsbreakdown", { active: true, insert: true, setParent: true })
        }
    })
}


obj.beforeStart = function () {
    const dateTime = new Date()
    const yearNow = dateTime.getFullYear()
    const monthNow = ("0" + (dateTime.getMonth() + 1)).slice(-2)
    const dayNow = ("0" + dateTime.getDate()).slice(-2)
    obj.data.time.hoursNow = Number(dateTime.getHours())
    obj.data.time.dateNow = `${monthNow}/${dayNow}/${yearNow}`
    obj.data.time.dateNowNum = Number(`${yearNow}${monthNow}${dayNow}`)
    obj.task.search.limit.index = obj.getScopeRandomNum(obj.task.search.limit.min, obj.task.search.limit.max)
    if (GM_getValue("Config.api", "单机模式") != "单机模式") {
        const defaultApiName = "hot.eray.cc"
        const currentApiName = GM_getValue("Config.api", defaultApiName)
        const apiConfigMap = new Map(obj.data.api.arr)
        const getConfigApi = apiConfigMap.get(currentApiName) || apiConfigMap.get(defaultApiName)
        obj.data.api.url = getConfigApi.url
        obj.data.api.hot = getConfigApi.hot
        if (!apiConfigMap.has(currentApiName)) {
            GM_setValue("Config.api", "单机模式")
            obj.pushMsg("必应搜索🟣", "当前搜索词接口失效！已替换成单机模式！")
        }
    }
}


obj.getCode = function (url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            onload(xhr) {
                const finalUrl = xhr.finalUrl
                const code = finalUrl.match(/M\.[\w+\.]+(\-\w+){4}/)
                if (code) {
                    resolve(code[0])
                } else {
                    resolve(xhr.status)
                }
            }
        })
    })
}


obj.getToken = function (url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            onload(xhr) {
                if (xhr.status == 200) {
                    let res = xhr.responseText
                    res = JSON.parse(res)
                    const refreshToken = res.refresh_token
                    const accessToken = res.access_token
                    if (refreshToken && accessToken) {
                        GM_setValue("refresh_token", refreshToken)
                        obj.task.token = accessToken
                        resolve(1)
                    } else {
                        resolve(0)
                    }
                } else {
                    resolve(xhr.status)
                }
            }
        })
    })
}


obj.isExpired = async function () {
    obj.tokenCallback = function (num, log) {
        if (obj.data.app > 2) {
            obj.task.sign.end++
            obj.task.read.end++
            obj.pushMsg("微软积分商城App任务🔴授权Token获取失败，请检测微软账号登录状态！")
        } else if (num != 1) {
            obj.data.app++
            GM_setValue("refresh_token", 0)
            if (num == 0) {
                GM_log("微软积分商城App任务🟡RefreshToken过期，正在尝试重新获取...")
            } else {
                GM_log(`微软积分商城App任务🟡AccessToken获取失败（状态码：${num}），正在重试...`)
            }
            setTimeout(() => { obj.isExpired() }, obj.data.time.task)
        }
    }
    if (GM_getValue("refresh_token", 0) == 0) {
        const url = `${obj.data.auth.code}?client_id=${obj.data.auth.clientId}&scope=${obj.data.auth.scope}&response_type=code&redirect_uri=${obj.data.auth.redirectUri}`
        const code = await obj.getCode(encodeURI(url))
        if (typeof code == "number") {
            if (obj.data.app > 2) {
                obj.task.sign.end++
                obj.task.read.end++
                obj.pushMsg("微软积分商城App任务🔴授权Code获取失败，请检测微软账号登录状态！")
            } else {
                obj.data.app++
                GM_log(`微软积分商城App任务🟡授权Code获取失败（状态码：${xhr.status}），正在重试...`)
                setTimeout(() => { obj.isExpired() }, obj.data.time.task)
            }
        } else {
            const url = `${obj.data.auth.token}?client_id=${obj.data.auth.clientId}&code=${code}&redirect_uri=${obj.data.auth.redirectUri}&grant_type=authorization_code`
            const token = await obj.getToken(encodeURI(url))
            obj.tokenCallback(token)
        }
    } else {
        const url = `${obj.data.auth.token}?client_id=${obj.data.auth.clientId}&refresh_token=${GM_getValue("refresh_token", 0)}&scope=${obj.data.auth.scope}&grant_type=REFRESH_TOKEN`
        const token = await obj.getToken(encodeURI(url))
        obj.tokenCallback(token)
    }
}


obj.getRewardsInfo = function () {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com/api/getuserinfo?type=1",
            onload(xhr) {
                if (xhr.status == 200) {
                    let res = xhr.responseText
                    const data = res.match(/(\"dashboard\"?)/)
                    if (data && data[0]) {
                        res = JSON.parse(res)
                        resolve(res.dashboard)
                    } else {
                        obj.task.sign.end++
                        obj.task.read.end++
                        obj.task.promo.end++
                        obj.task.search.end++
                        obj.data.web > 0 || obj.pushMsg("All任务🔴", "账号状态失效，请检查Microsoft登录状态或重新登录！")
                        obj.data.web++
                        resolve(0)
                    }
                } else {
                    GM_log(`微软积分商城Web任务🟡微软Rewards信息获取出错（状态码：${xhr.status}），正在重试...`)
                    resolve(0)
                }
            }
        })
    })
}


obj.getRewardsToken = function () {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com",
            onload(xhr) {
                if (xhr.status == 200) {
                    let res = xhr.responseText
                    const html = res.replace(/\s/g, "")
                    const data = html.match(/RequestVerificationToken/)
                    if (data && data[0]) {
                        const token = html.match(/RequestVerificationToken"type="hidden"value="(.*?)"\/>/)
                        resolve(token[1])
                    } else {
                        obj.task.promo.end++
                        obj.pushMsg("活动推广🔴", "请求验证失败，请检查Rewards登录状态或重新登录！")
                        resolve(0)
                    }
                } else {
                    GM_log(`微软积分商城Web任务🟡RequestVerificationToken获取出错（状态码：${xhr.status}），正在重试...`)
                    resolve(0)
                }
            }
        })
    })
}


obj.taskPromo = async function () {
    if (obj.task.promo.end > 0) {
        return true
    } else if (obj.data.time.hoursNow < 12) {
        obj.task.promo.end++
        return true
    } else if (obj.task.promo.times > 2) {
        obj.task.promo.end++
        obj.pushMsg("活动推广🔴", "未知原因出错，本次活动推广结束！")
        return true
    } else {
        const dashboard = await obj.getRewardsInfo()
        if (dashboard == 0) {
            return false
        } else {
            let promotionsArr = []
            const morePromotions = dashboard.morePromotions
            const dailySetPromotions = dashboard.dailySetPromotions[obj.data.time.dateNow]
            const streakProtection = dashboard.streakProtectionPromo.streakProtectionStatus
            for (const p of [...dailySetPromotions, ...morePromotions]) {
                if (p.complete == false) {
                    promotionsArr.push({ offerId: p.offerId, hash: p.hash })
                }
            }
            obj.task.promo.token = await obj.getRewardsToken()
            if (obj.task.promo.token == 0) {
                return false
            } else {
                if (streakProtection && streakProtection == "False") {
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: `https://rewards.bing.com/api/togglestreakasync`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Referer": `https://rewards.bing.com/`
                        },
                        data: `isOn=true&activityAmount=1&form=&__RequestVerificationToken=${obj.task.promo.token}`
                    })
                }
                if (promotionsArr.length < 1) {
                    obj.task.promo.end++
                    if (GM_getValue("task_promo", 0) != obj.data.time.dateNowNum) {
                        obj.pushMsg("活动推广🟢", "哇！哥哥好棒！活动推广完成了！")
                    }
                    GM_setValue("task_promo", obj.data.time.dateNowNum)
                    return true
                } else {
                    GM_setValue("task_promo", 0)
                    promotionsArr.forEach((item) => {
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: `https://rewards.bing.com/api/reportactivity`,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Referer": `https://rewards.bing.com/`
                            },
                            data: `id=${item.offerId}&hash=${item.hash}&__RequestVerificationToken=${obj.task.promo.token}`
                        })
                    })
                    obj.task.promo.times++
                    return false
                }
            }
        }
    }
}


obj.getReadPro = function () {
    return new Promise((resolve, reject) => {
        let readArr = { "max": 1, "progress": 0 }
        GM_xmlhttpRequest({
            url: "https://prod.rewardsplatform.microsoft.com/dapi/me?channel=SAAndroid&options=613",
            headers: {
                "authorization": `Bearer ${obj.task.token}`
            },
            onload(xhr) {
                if (xhr.status == 200) {
                    let res = xhr.responseText
                    res = JSON.parse(res)
                    const pro = res.response.promotions
                    if (pro) {
                        for (const o of pro) {
                            if (o.attributes.offerid == "ENUS_readarticle3_30points") {
                                readArr = { "max": Number(o.attributes.max), "progress": Number(o.attributes.progress) }
                                resolve(readArr)
                            }
                        }
                    } else {
                        resolve(readArr)
                    }
                } else {
                    resolve(readArr)
                }
            }
        })
    })
}


obj.taskRead = async function () {
    if (obj.task.read.end > 0) {
        return true
    } else if (obj.data.time.hoursNow < 12) {
        obj.task.read.end++
        return true
    } else if (obj.task.read.times > 2) {
        obj.task.read.end++
        obj.pushMsg("文章阅读🔴", "未知原因出错，本次文章阅读结束！")
        return true
    } else if (obj.task.token == 0) {
        return false
    } else {
        const readPro = await obj.getReadPro()
        if (readPro.progress > obj.task.read.point) {
            obj.task.read.times = 0
            obj.task.read.point = readPro.progress
        } else {
            obj.task.read.times++
        }
        if (readPro.progress >= readPro.max) {
            obj.task.read.end++
            if (GM_getValue("task_read", 0) != obj.data.time.dateNowNum) {
                obj.pushMsg("文章阅读🟢", "哇！哥哥好棒！文章阅读完成了！")
            }
            GM_setValue("task_read", obj.data.time.dateNowNum)
            return true
        } else {
            GM_setValue("task_read", 0)
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://prod.rewardsplatform.microsoft.com/dapi/me/activities",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${obj.task.token}`
                },
                data: JSON.stringify({
                    "amount": 1,
                    "country": "cn",
                    "id": "",
                    "type": 101,
                    "attributes": {
                        "offerid": "ENUS_readarticle3_30points"
                    }
                }),
                responseType: "json"
            })
            return false
        }
    }
}


obj.taskSign = function () {
    if (obj.task.sign.end > 0 || GM_getValue("task_sign", 0) == obj.data.time.dateNowNum) {
        obj.task.sign.end++
        return true
    } else if (obj.task.sign.times > 2) {
        obj.task.sign.end++
        obj.pushMsg("App签到🔴", "未知原因出错，本次App签到结束！")
        return true
    } else if (obj.task.sign.point == 0) {
        obj.task.sign.end++
        if (GM_getValue("task_sign", 0) != obj.data.time.dateNowNum) {
            obj.pushMsg("App签到🟢", "哇！哥哥好棒！App签到完成了！")
        }
        GM_setValue("task_sign", obj.data.time.dateNowNum)
        return true
    } else if (obj.task.token == 0) {
        return false
    } else {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://prod.rewardsplatform.microsoft.com/dapi/me/activities",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${obj.task.token}`
            },
            data: JSON.stringify({
                "amount": 1,
                "attributes": {
                    "offerid": "Gamification_Sapphire_DailyCheckIn",
                    "date": obj.data.time.dateNowNum,
                    "signIn": false,
                    "timezoneOffset": "08:00:00"
                },
                "id": "",
                "type": 101,
                "country": "cn",
                "risk_context": {},
                "channel": "SAAndroid"
            }),
            responseType: "json",
            onload(xhr) {
                obj.task.sign.times = 0
                let res = xhr.responseText
                if (res) {
                    res = JSON.parse(res)
                    const point = res.response.activity.p
                    point ? obj.task.sign.point = point : obj.task.sign.point = 0
                } else {
                    obj.task.sign.times++
                }
            }
        })
        return false
    }
}


obj.getTopKeyword = function () {
    return new Promise((resolve, reject) => {
        let sentence = obj.generateRandomChineseStr()
        if (GM_getValue("Config.api", "单机模式") == "单机模式") {
            resolve(sentence)
        } else {
            if (obj.task.search.word.index < 1 || obj.task.search.word.list.length < 1) {
                const apiHot = obj.getRandomApiHot()
                GM_xmlhttpRequest({
                    timeout: 9999,
                    url: obj.data.api.url + apiHot,
                    onload(xhr) {
                        if (xhr.status == 200) {
                            let res = xhr.responseText
                            res = JSON.parse(res)
                            if (res.code == 200) {
                                obj.task.search.word.index = 1
                                for (let i = 0; i < res.data.length; i++) {
                                    obj.task.search.word.list.push(res.data[i].title)
                                }
                                obj.task.search.word.list = obj.getRandomArr(obj.task.search.word.list)
                                sentence = obj.task.search.word.list[obj.task.search.word.index]
                                resolve(sentence)
                            } else {
                                GM_log(`微软积分商城必应搜索🟣当前搜索词接口服务异常（状态码：${res.code}），已使用随机汉字组句`)
                                resolve(sentence)
                            }
                        } else {
                            GM_log(`微软积分商城必应搜索🟣当前搜索词接口获取失败（状态码：${xhr.status}），已使用随机汉字组句`)
                            resolve(sentence)
                        }
                    },
                    ontimeout() {
                        GM_log("微软积分商城必应搜索🟣当前搜索词接口获取超时！已使用随机汉字组句")
                        resolve(sentence)
                    }
                })
            } else {
                obj.task.search.word.index++
                if (obj.task.search.word.index > obj.task.search.word.list.length - 1) {
                    obj.task.search.word.index = 0
                }
                const sentence = obj.task.search.word.list[obj.task.search.word.index]
                resolve(sentence)
            }
        }
    })
}


obj.taskSearch = async function () {
    if (obj.task.search.end > 0) {
        return true
    } else {
        const dashboard = await obj.getRewardsInfo()
        if (dashboard == 0) {
            return false
        } else {
            if (dashboard.userStatus.counters.pcSearch) {
                obj.task.search.pc.progress = dashboard.userStatus.counters.pcSearch[0].pointProgress
                obj.task.search.pc.max = dashboard.userStatus.counters.pcSearch[0].pointProgressMax
            }
            if (dashboard.userStatus.counters.mobileSearch) {
                obj.task.search.m.progress = dashboard.userStatus.counters.mobileSearch[0].pointProgress
                obj.task.search.m.max = dashboard.userStatus.counters.mobileSearch[0].pointProgressMax
            } else {
                obj.task.search.m.max = 0
            }
            if (GM_getValue("Config.limit", true) == true) {
                if (obj.task.search.index > obj.task.search.limit.index) {
                    obj.task.search.end++
                    GM_log(`微软积分商城必应搜索🔵您已开启限制搜索，本次运行搜索 ${obj.task.search.index} 次结束！电脑搜索：${obj.task.search.pc.progress}/${obj.task.search.pc.max}　移动设备搜索：${obj.task.search.m.progress}/${obj.task.search.m.max}，请等待下个时间点继续完成！`)
                    return true
                }
            } else {
                if (obj.task.search.times > 2) {
                    obj.task.search.end++
                    GM_log(`微软积分商城必应搜索🔵您的积分收入限制！本次运行共搜索 ${obj.task.search.index} 次！电脑搜索：${obj.task.search.pc.progress}/${obj.task.search.pc.max}　移动设备搜索：${obj.task.search.m.progress}/${obj.task.search.m.max}，请等待下个时间点继续完成！`)
                    return true
                }
                if (dashboard.userStatus.counters.dailyPoint[0].pointProgress == obj.task.search.progressNow) {
                    obj.task.search.times++
                } else {
                    obj.task.search.times = 0
                    obj.task.search.progressNow = dashboard.userStatus.counters.dailyPoint[0].pointProgress
                }
            }
            if (obj.task.search.pc.progress >= obj.task.search.pc.max && obj.task.search.m.progress >= obj.task.search.m.max) {
                obj.task.search.end++
                if (GM_getValue("task_search", 0) != obj.data.time.dateNowNum) {
                    obj.pushMsg("必应搜索🟢", `哇！哥哥好棒！必应搜索完成了！`)
                }
                GM_setValue("task_search", obj.data.time.dateNowNum)
                return true
            } else {
                GM_setValue("task_search", 0)
                const keyword = await obj.getTopKeyword()
                const bParam = `q=${keyword}&qs=ds&form=QBLH`
                const bUrl = `https://bing.com/search?${bParam}`
                if (obj.task.search.pc.progress < obj.task.search.pc.max) {
                    const userAgent = obj.data.ua.pc[obj.getRandomNum(obj.data.ua.pc.length)]
                    GM_xmlhttpRequest({
                        url: bUrl,
                        headers: {
                            "User-Agent": userAgent
                        },
                        onload() { obj.task.search.index++ }
                    })
                    return false
                }
                if (obj.task.search.m.progress < obj.task.search.m.max) {
                    const userAgent = obj.data.ua.m[obj.getRandomNum(obj.data.ua.m.length)]
                    GM_xmlhttpRequest({
                        url: bUrl,
                        headers: {
                            "User-Agent": userAgent
                        },
                        onload() { obj.task.search.index++ }
                    })
                    return false
                }
            }
        }
    }
}


return new Promise((resolve, reject) => {
    obj.beforeStart()
    obj.taskEnd = function () {
        if (obj.task.sign.end > 0 && obj.task.read.end > 0 && obj.task.promo.end > 0 && obj.task.search.end > 0) {
            resolve()
        }
    }
    obj.signStart = async function () {
        try {
            const result = await obj.taskSign()
            result ? obj.taskEnd() : setTimeout(() => { obj.signStart() }, obj.data.time.task)
        } catch (e) {
            reject(e)
        }
    }
    obj.readStart = async function () {
        try {
            const result = await obj.taskRead()
            result ? obj.taskEnd() : setTimeout(() => { obj.readStart() }, obj.data.time.task)
        } catch (e) {
            reject(e)
        }
    }
    obj.promoStart = async function () {
        try {
            const result = await obj.taskPromo()
            result ? obj.taskEnd() : setTimeout(() => { obj.promoStart() }, obj.data.time.task)
        } catch (e) {
            reject(e)
        }
    }
    obj.searchStart = async function () {
        try {
            const result = await obj.taskSearch()
            const timespan = GM_getValue("Config.span", 15) * 1000
            result ? obj.taskEnd() : setTimeout(() => { obj.searchStart() }, obj.getScopeRandomNum(timespan - 5000, timespan + 5000))
        } catch (e) {
            reject(e)
        }
    }
    obj.taskStart = function () {
        if (GM_getValue("Config.app", false) == true) {
            obj.isExpired()
        } else {
            obj.task.sign.end++
            obj.task.read.end++
        }
        obj.promoStart()
        obj.signStart()
        obj.readStart()
        obj.searchStart()
    }()
})
