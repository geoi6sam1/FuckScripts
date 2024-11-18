// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         2.2.6
// @description     每天自动完成 Microsoft Rewards 任务获取积分奖励，✅必应搜索（Web）、✅每日活动（Web）、✅更多活动（Web）、✅文章阅读（App）、✅每日签到（App）
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         */20 * * * *
// @grant           unsafeWindow
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @connect         cn.bing.com
// @connect         www.bing.com
// @connect         rewards.bing.com
// @connect         login.live.com
// @connect         prod.rewardsplatform.microsoft.com
// @connect         hot.baiwumm.com
// @connect         cnxiaobai.com
// @connect         hotapi.zhusun.top
// @connect         hotapi.lysdad.cn
// @connect         daily-hot-api.nankoyo.com
// @license         GPL-3.0
// ==/UserScript==

/* ==UserConfig==
Config:
  limit:
    title: 限制搜索
    type: select
    default: 开
    values: [开, 关]
  app:
    title: App任务
    type: select
    default: 关
    values: [开, 关]
  code:
    title: 授权Code
    default: https://login.live.com/oauth20_authorize.srf?client_id=0000000040170455&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&response_type=code&redirect_uri=https://login.live.com/oauth20_desktop.srf
    type: textarea
  api:
    title: 搜索词API
    type: select
    default: hot.baiwumm.com
    values: [hot.baiwumm.com, hot.cnxiaobai.com, hot.zhusun.top, hot.lysdad.cn, hot.nankoyo.com]
 ==/UserConfig== */


const obj = {
    data: {
        time: {
            hoursNow: 12,
            dateNow: "",
            dateNowNum: 19450903,
        },
        code: "https://login.live.com/oauth20_authorize.srf?client_id=0000000040170455&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&response_type=code&redirect_uri=https://login.live.com/oauth20_desktop.srf",
        query: ["脚本猫", "白菜", "菠菜", "胡萝卜", "西兰花", "番茄", "黄瓜", "茄子", "小米辣", "彩椒", "南瓜", "青椒", "冬瓜", "莴苣", "芹菜", "蘑菇", "豆芽", "莲藕", "土豆", "芋头", "空心菜", "芥蓝", "苦瓜", "苹果", "香蕉", "橙子", "西瓜", "葡萄", "柠檬", "草莓", "樱桃", "菠萝", "芒果", "荔枝", "龙眼", "柚子", "猕猴桃", "火龙果", "哈密瓜", "椰子", "山竹", "榴莲", "枇杷", "火锅", "春卷", "鸡腿", "番薯", "油炸鬼", "蛤蜊", "鱿鱼", "排骨", "猪蹄", "火腿", "香肠", "腊肉", "小龙虾", "鸡胸肉", "羊肉串", "肉干", "玫瑰", "百合", "郁金香", "康乃馨", "向日葵", "菊花", "牡丹", "茉莉", "薰衣草", "樱花", "仙人掌", "绿萝", "吊兰", "芦荟", "君子兰", "海棠", "水仙", "风信子", "松树", "潘钜森", "老鼠", "兔子", "蟑螂", "吗喽", "熊猫", "老虎", "大象", "长颈鹿", "斑马", "企鹅", "海豚", "海狮", "金鱼", "烤鸭", "蝴蝶", "蜜蜂", "蚂蚁", "红烧肉", "清蒸鱼", "宫保鸡丁", "麻婆豆腐", "糖醋排骨", "富贵竹", "辣子鸡丁", "发财树", "酸菜鱼", "蛋散", "西葫芦炒鸡蛋", "清炒时蔬", "五柳蛋", "鱼香肉丝", "地三鲜", "香菇滑鸡", "松鼠鱼", "肠粉", "虾饺", "烧卖", "蛋挞", "凤爪", "叉烧包", "糯米鸡", "腊肠粽", "萝卜糕", "牛肉丸", "艇仔粥", "猪肠粉", "肉糜粥", "豉汁蒸排骨", "蒸凤爪", "甘蔗", "榴莲酥", "双皮奶", "油猴中文网"],
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
        task: ["task_sign", "task_read", "task_promo", "task_search"],
        api: {
            baiwumm: {
                url: "https://hot.baiwumm.com/api/",
                hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq", "netease", "zhihu"]
            },
            cnxiaobai: {
                url: "https://cnxiaobai.com/DailyHotApi/",
                hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"],
            },
            zhusun: {
                url: "https://hotapi.zhusun.top/",
                hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"],
            },
            lysdad: {
                url: "https://hotapi.lysdad.cn/",
                hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "newsqq", "netease", "zhihu"],
            },
            nankoyo: {
                url: "https://daily-hot-api.nankoyo.com/",
                hot: ["weibo", "douyin", "baidu", "toutiao", "thepaper", "qq-news", "netease-news", "zhihu"],
            },
            url: "",
            hot: [],
        },
    },
    task: {
        sign: {
            times: 0,
            point: 1,
        },
        read: {
            times: 0,
            point: 0,
        },
        promo: {
            times: 0,
        },
        search: {
            word: {
                list: [],
                index: 0,
            },
            times: 0,
            progressNow: 0,
            domain: "www.bing.com",
            pc: {
                progress: 0,
                max: 1,

            },
            m: {
                progress: 0,
                max: 1,
            },
            index: 0,
            limit: 3,
        },
        token: "",
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


obj.getRandomSentence = function (a, l) {
    let k = [...a]
    let r = []
    for (let i = 0; i < l; i++) {
        if (k.length === 0) break
        let [n] = [Math.floor(Math.random() * k.length)]
        let [q] = [k.splice(n, 1)[0]]
        r.push(q)
    }
    return r.join("")
}


obj.getRandomApiHot = function () {
    if (GM_getValue("last_index") == null) {
        GM_setValue("last_index", -1)
    }
    const lastIndex = parseInt(GM_getValue("last_index"))
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
        image: "https://rewards.bing.com/rewards.png",
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
    const startArr = ["refresh_token", "last_date"]
    startArr.forEach((item) => {
        if (GM_getValue(item) == null) {
            GM_setValue(item, "")
        }
    })
    if (GM_getValue("Config.limit") == null || GM_getValue("Config.limit") != "关") {
        GM_setValue("Config.limit", "开")
        obj.task.search.limit = obj.getScopeRandomNum(2, 4)
    }
    if (GM_getValue("Config.app") == null || GM_getValue("Config.app") != "开") {
        GM_setValue("Config.app", "关")
    }
    if (GM_getValue("Config.code") == null || GM_getValue("Config.code") == "") {
        GM_setValue("Config.code", obj.data.code)
    }
    if (GM_getValue("Config.api") == null) {
        GM_setValue("Config.api", "hot.baiwumm.com")
        obj.data.api.url = obj.data.api.baiwumm.url
        obj.data.api.hot = obj.data.api.baiwumm.hot
    } else {
        switch (GM_getValue("Config.api")) {
            case "hot.baiwumm.com":
                obj.data.api.url = obj.data.api.baiwumm.url
                obj.data.api.hot = obj.data.api.baiwumm.hot
                break
            case "hot.cnxiaobai.com":
                obj.data.api.url = obj.data.api.cnxiaobai.url
                obj.data.api.hot = obj.data.api.cnxiaobai.hot
                break
            case "hot.zhusun.top":
                obj.data.api.url = obj.data.api.zhusun.url
                obj.data.api.hot = obj.data.api.zhusun.hot
                break
            case "hot.lysdad.cn":
                obj.data.api.url = obj.data.api.lysdad.url
                obj.data.api.hot = obj.data.api.lysdad.hot
                break
            case "hot.nankoyo.com":
                obj.data.api.url = obj.data.api.nankoyo.url
                obj.data.api.hot = obj.data.api.nankoyo.hot
                break
            default:
                GM_setValue("Config.api", "hot.baiwumm.com")
                obj.data.api.url = obj.data.api.baiwumm.url
                obj.data.api.hot = obj.data.api.baiwumm.hot
                break
        }
    }
}


obj.appOver = function () {
    GM_setValue("task_sign", 1)
    GM_setValue("task_read", 1)
}


obj.webOver = function () {
    GM_setValue("task_promo", 1)
    GM_setValue("task_search", 1)
}


obj.getToken = function (url) {
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
                } else {
                    GM_setValue("refresh_token", "")
                    obj.appOver()
                    obj.pushMsg("App任务🔴", "刷新Token过期，请获取并补充授权Code后运行！")
                }
            } else {
                GM_setValue("refresh_token", "")
                obj.appOver()
                obj.pushMsg("App任务🔴", "刷新Token获取出错！状态码：" + xhr.status)
            }
        }
    })
}


obj.isExpired = function () {
    if (GM_getValue("refresh_token") == "") {
        let code = GM_getValue("Config.code")
        code = code.match(/M\.[\w+_\.]+\.[0-9a-fA-F-]+/)
        if (code) {
            const url = `https://login.live.com/oauth20_token.srf?client_id=0000000040170455&code=${code[0]}&redirect_uri=https://login.live.com/oauth20_desktop.srf&grant_type=authorization_code`
            obj.getToken(encodeURI(url))
            GM_setValue("Config.code", obj.data.code)
        } else {
            obj.appOver()
            obj.pushMsg("App任务🔴", "授权Code错误，请获取并补充授权Code后运行！")
            GM_setValue("Config.code", obj.data.code)
        }
    } else {
        const url = `https://login.live.com/oauth20_token.srf?client_id=0000000040170455&refresh_token=${GM_getValue("refresh_token")}&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&grant_type=REFRESH_TOKEN`
        obj.getToken(encodeURI(url))
        GM_setValue("Config.code", obj.data.code)
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
                        obj.webOver()
                        obj.pushMsg("Web任务🔴", "账号状态失效，请检查微软账号登录状态或重新登录！")
                        resolve("")
                    }
                } else {
                    obj.webOver()
                    obj.pushMsg("Web任务🔴", "微软积分商城信息获取出错！状态码：" + xhr.status)
                    resolve("")
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
                        GM_setValue("task_promo", 1)
                        obj.pushMsg("活动推广🔴", "请求验证失败，请检查微软积分商城登录状态或重新登录！")
                        resolve(xhr.status)
                    }
                } else {
                    resolve(xhr.status)
                }
            }
        })
    })
}


obj.taskPromo = async function () {
    if (GM_getValue("task_promo") != 0) {
        return true
    } else if (obj.data.time.hoursNow < 12) {
        GM_setValue("task_promo", 1)
        return true
    } else if (obj.task.promo.times > 2) {
        GM_setValue("task_promo", 1)
        obj.pushMsg("活动推广🔴", "未知原因出错，本次活动推广结束！")
        return true
    } else {
        const dashboard = await obj.getRewardsInfo()
        if (dashboard == "") {
            return false
        } else {
            let promotionsArr = []
            const morePromotions = dashboard.morePromotions
            const dailySetPromotions = dashboard.dailySetPromotions[obj.data.time.dateNow]
            for (const p of [...dailySetPromotions, ...morePromotions]) {
                if (p.complete == false) {
                    promotionsArr.push({ offerId: p.offerId, hash: p.hash })
                }
            }
            if (promotionsArr.length < 1) {
                GM_setValue("task_promo", obj.data.time.dateNowNum)
                obj.pushMsg("活动推广🟢", "哇！哥哥好棒！活动推广完成了！")
                return true
            } else {
                const token = await obj.getRewardsToken()
                promotionsArr.forEach((item) => {
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: `https://rewards.bing.com/api/reportactivity`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Referer": `https://rewards.bing.com/`
                        },
                        data: `id=${item.offerId}&hash=${item.hash}&__RequestVerificationToken=${token}`
                    })
                })
                obj.task.promo.times++
                return false
            }
        }
    }
}


obj.getReadPro = function () {
    return new Promise((resolve, reject) => {
        let readArr = { "max": 1, "progress": 0 }
        if (obj.task.token == "") {
            resolve(readArr)
        } else {
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
        }
    })
}


obj.taskRead = async function () {
    if (GM_getValue("task_read") != 0) {
        return true
    } else if (obj.data.time.hoursNow < 12) {
        GM_setValue("task_read", 1)
        return true
    } else if (obj.task.read.times > 2) {
        GM_setValue("task_read", 1)
        obj.pushMsg("文章阅读🔴", "未知原因出错，本次文章阅读结束！")
        return true
    } else {
        const readPro = await obj.getReadPro()
        if (readPro.progress > obj.task.read.point) {
            obj.task.read.times = 0
            obj.task.read.point = readPro.progress
        } else {
            obj.task.read.times++
        }
        if (readPro.progress >= readPro.max) {
            GM_setValue("task_read", obj.data.time.dateNowNum)
            obj.pushMsg("文章阅读🟢", "哇！哥哥好棒！文章阅读完成了！")
            return true
        } else if (obj.task.token == "") {
            obj.task.read.times = 0
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
    if (GM_getValue("task_sign") != 0) {
        return true
    } else if (obj.task.sign.times > 2) {
        GM_setValue("task_sign", 1)
        obj.pushMsg("App签到🔴", "未知原因出错，本次App签到结束！")
        return true
    } else if (obj.task.sign.point == 0) {
        GM_setValue("task_sign", obj.data.time.dateNowNum)
        obj.pushMsg("App签到🟢", "哇！哥哥好棒！App签到完成了！")
        return true
    } else if (obj.task.token == "") {
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


obj.getTopKeyword = async function () {
    const query = await new Promise((resolve, reject) => {
        if (obj.task.search.word.index < 1 || obj.task.search.word.list.length < 1) {
            const apiHot = obj.getRandomApiHot()
            GM_xmlhttpRequest({
                url: obj.data.api.url + apiHot,
                onload(xhr) {
                    let sentence = obj.getRandomSentence(obj.data.query, 3)
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
                            resolve(sentence)
                        }
                    } else {
                        resolve(sentence)
                    }
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
    })
    return query + Date.now() % 1000
}


obj.taskSearch = async function () {
    if (GM_getValue("task_search") != 0) {
        return true
    } else {
        const dashboard = await obj.getRewardsInfo()
        if (dashboard == "") {
            return false
        } else {
            const onload = (xhr) => {
                let url = new URL(xhr.finalUrl)
                if (url.host != obj.task.search.domain) {
                    obj.task.search.domain = url.host
                }
                obj.task.search.index++
            }
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
            if (GM_getValue("Config.limit") == "开") {
                if (obj.task.search.index > obj.task.search.limit) {
                    GM_setValue("task_search", 1)
                    GM_log(`微软积分商城必应搜索🟡您已开启限制搜索，本次运行搜索 ${obj.task.search.index} 次结束！电脑搜索：${obj.task.search.pc.progress}/${obj.task.search.pc.max}　移动设备搜索：${obj.task.search.m.progress}/${obj.task.search.m.max}，请等待下个时间点继续完成！`)
                    return true
                }
            } else {
                if (obj.task.search.times > 2) {
                    GM_setValue("task_search", 1)
                    GM_log(`微软积分商城必应搜索🟡您的积分收入限制！本次运行共搜索 ${obj.task.search.index} 次！电脑搜索：${obj.task.search.pc.progress}/${obj.task.search.pc.max}　移动设备搜索：${obj.task.search.m.progress}/${obj.task.search.m.max}，请等待下个时间点继续完成！`)
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
                GM_setValue("task_search", obj.data.time.dateNowNum)
                obj.pushMsg("必应搜索🟢", `哇！哥哥好棒！必应搜索完成了！`)
                return true
            } else {
                if (obj.task.search.pc.progress < obj.task.search.pc.max) {
                    const keyword = await obj.getTopKeyword()
                    GM_xmlhttpRequest({
                        url: `https://${obj.task.search.domain}/search?q=${encodeURIComponent(keyword)}&form=QBLH`,
                        headers: {
                            "User-Agent": obj.data.ua.pc[obj.getRandomNum(obj.data.ua.pc.length)],
                            "Referer": `https://${obj.task.search.domain}/`
                        },
                        onload: onload
                    })
                    return false
                }
                if (obj.task.search.m.progress < obj.task.search.m.max) {
                    const keyword = await obj.getTopKeyword()
                    GM_xmlhttpRequest({
                        url: `https://${obj.task.search.domain}/search?q=${encodeURIComponent(keyword)}&form=QBLH`,
                        headers: {
                            "User-Agent": obj.data.ua.m[obj.getRandomNum(obj.data.ua.m.length)],
                            "Referer": `https://${obj.task.search.domain}/`
                        },
                        onload: onload
                    })
                    return false
                }
            }
        }
    }
}


return new Promise((resolve, reject) => {
    obj.beforeStart()
    if (GM_getValue("Config.app") == "开") {
        obj.isExpired()
    }
    if (GM_getValue("last_date") == obj.data.time.dateNowNum) {
        resolve()
    } else {
        obj.data.task.forEach((item) => {
            if (GM_getValue(item) == null || GM_getValue(item) != obj.data.time.dateNowNum) {
                GM_setValue(item, 0)
            }
        })
        obj.taskEnd = function () {
            const taskplus = GM_getValue("task_sign") + GM_getValue("task_read") + GM_getValue("task_promo") + GM_getValue("task_search")
            if (taskplus == (obj.data.time.dateNowNum * 4)) {
                GM_setValue("last_date", obj.data.time.dateNowNum)
                resolve()
            } else {
                let tasknum = 0
                obj.data.task.forEach((item) => {
                    if (GM_getValue(item) > 0) {
                        tasknum++
                    }
                })
                if (tasknum > 3) {
                    resolve()
                }
            }
        }
        obj.signStart = async function () {
            try {
                const result = await obj.taskSign()
                result ? obj.taskEnd() : setTimeout(() => { obj.signStart() }, 2333)
            } catch (e) {
                reject(e)
            }
        }
        obj.readStart = async function () {
            try {
                const result = await obj.taskRead()
                result ? obj.taskEnd() : setTimeout(() => { obj.readStart() }, 2333)

            } catch (e) {
                reject(e)
            }

        }
        obj.promoStart = async function () {
            try {
                const result = await obj.taskPromo()
                result ? obj.taskEnd() : setTimeout(() => { obj.promoStart() }, 2333)
            } catch (e) {
                reject(e)
            }
        }
        obj.searchStart = async function () {
            try {
                const result = await obj.taskSearch()
                result ? obj.taskEnd() : setTimeout(() => { obj.searchStart() }, obj.getScopeRandomNum(6789, 15678))
            } catch (e) {
                reject(e)
            }
        }
        obj.promoStart()
        if (GM_getValue("Config.app") == "开") {
            obj.signStart()
            obj.readStart()
        } else {
            obj.appOver()
        }
        obj.searchStart()
    }
})
