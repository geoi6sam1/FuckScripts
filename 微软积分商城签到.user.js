// ==UserScript==
// @name            微软积分商城签到
// @namespace       https://github.com/geoi6sam1
// @version         1.1.5
// @description     每天自动完成 Microsoft Rewards 任务获取积分奖励，✅必应搜索（Web）、✅每日活动（Web）、✅更多活动（Web）、✅新闻阅读（App）、✅每日签到（App）
// @author          geoi6sam1@qq.com
// @icon            https://rewards.bing.com/rewards.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         */20 * * * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @connect         bing.com
// @connect         live.com
// @connect         microsoft.com
// @connect         hot.baiwumm.com
// @license         GPL-3.0
// ==/UserScript==

/* ==UserConfig==
Config:
  app:
    title: App任务
    type: select
    default: 关
    values: [关, 开]
  code:
    title: 授权Code
    default: https://login.live.com/oauth20_authorize.srf?client_id=0000000040170455&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&response_type=code&redirect_uri=https://login.live.com/oauth20_desktop.srf
    type: textarea
 ==/UserConfig== */

const dateTime = new Date()
const yearNow = dateTime.getFullYear()
const monthNow = ("0" + (dateTime.getMonth() + 1)).slice(-2)
const hoursNow = dateTime.getHours()
const dayNow = ("0" + dateTime.getDate()).slice(-2)
const dateNow = `${monthNow}/${dayNow}/${yearNow}`
const lastDate = Number(`${yearNow}${monthNow}${dayNow}`)
const regex = /M\.[\w+_\.]+\.[0-9a-fA-F-]+/
const srfUrl = "https://login.live.com/oauth20_authorize.srf?client_id=0000000040170455&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&response_type=code&redirect_uri=https://login.live.com/oauth20_desktop.srf"
const randomData = {
    query: ["脚本猫", "白菜", "菠菜", "胡萝卜", "西兰花", "番茄", "黄瓜", "茄子", "小米辣", "彩椒", "南瓜", "青椒", "冬瓜", "莴苣", "芹菜", "蘑菇", "豆芽", "莲藕", "土豆", "芋头", "空心菜", "芥蓝", "苦瓜", "苹果", "香蕉", "橙子", "西瓜", "葡萄", "柠檬", "草莓", "樱桃", "菠萝", "芒果", "荔枝", "龙眼", "柚子", "猕猴桃", "火龙果", "哈密瓜", "椰子", "山竹", "榴莲", "枇杷", "火锅", "春卷", "鸡腿", "番薯", "油炸鬼", "蛤蜊", "鱿鱼", "排骨", "猪蹄", "火腿", "香肠", "腊肉", "小龙虾", "鸡胸肉", "羊肉串", "肉干", "玫瑰", "百合", "郁金香", "康乃馨", "向日葵", "菊花", "牡丹", "茉莉", "薰衣草", "樱花", "仙人掌", "绿萝", "吊兰", "芦荟", "君子兰", "海棠", "水仙", "风信子", "松树", "潘钜森", "老鼠", "兔子", "蟑螂", "吗喽", "熊猫", "老虎", "大象", "长颈鹿", "斑马", "企鹅", "海豚", "海狮", "金鱼", "烤鸭", "蝴蝶", "蜜蜂", "蚂蚁", "红烧肉", "清蒸鱼", "宫保鸡丁", "麻婆豆腐", "糖醋排骨", "富贵竹", "辣子鸡丁", "发财树", "酸菜鱼", "蛋散", "西葫芦炒鸡蛋", "清炒时蔬", "五柳蛋", "鱼香肉丝", "地三鲜", "香菇滑鸡", "松鼠鱼", "肠粉", "虾饺", "烧卖", "蛋挞", "凤爪", "叉烧包", "糯米鸡", "腊肠粽", "萝卜糕", "牛肉丸", "艇仔粥", "猪肠粉", "肉糜粥", "豉汁蒸排骨", "蒸凤爪", "甘蔗", "榴莲酥", "双皮奶", "油猴中文网"],
    url: ["weibo", "baidu", "douyin", "kuaishou", "thepaper", "netease", "toutiao", "qq", "baidutieba"],
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

const dfarr = ["refresh_token", "last_date", "task_sign", "task_read", "task_promo", "task_search"]
dfarr.forEach((item) => {
    if (GM_getValue(item) == null) {
        GM_setValue(item, "")
    }
})
if (GM_getValue("Config.app") == null || GM_getValue("Config.app") != "开") {
    GM_setValue("Config.app", "关")
}
if (GM_getValue("Config.code") == null || GM_getValue("Config.code") == "") {
    GM_setValue("Config.code", srfUrl)
}


function getRandomNum(num) {
    return Math.floor(Math.random() * num)
}


function getScopeRandomNum(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}


function getRandomArr(arr) {
    return arr.sort(() => {
        return Math.random() - 0.5
    })
}


function getRandomSentence(a, l) {
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


function getRandomUrl() {
    if (GM_getValue("last_name") == null) {
        GM_setValue("last_name", "")
    }
    const filteredArr = randomData.url.filter(name => name != GM_getValue("last_name"));
    return filteredArr[getRandomNum(filteredArr.length)];
}


function getToken(url) {
    function getTokenError() {
        GM_setValue("refresh_token", "")
        GM_setValue("access_token", "")
        GM_setValue("task_sign", 1)
        GM_setValue("task_read", 1)
        pushMsg("Token获取失败", "请获取并补充授权Code后运行！")
    }

    GM_xmlhttpRequest({
        url: url,
        onload(xhr) {
            if (xhr.status == 200) {
                let res = xhr.responseText
                let refresh_token = JSON.parse(res).refresh_token
                let access_token = JSON.parse(res).access_token
                if (refresh_token && access_token) {
                    GM_setValue("refresh_token", refresh_token)
                    GM_setValue("access_token", access_token)
                } else {
                    getTokenError()
                }
            } else {
                getTokenError()
            }
        }
    })
}


function isExpired() {
    if (GM_getValue("refresh_token") == "") {
        let res = GM_getValue("Config.code")
        let code = res.match(regex)
        if (code) {
            getToken(`https://login.live.com/oauth20_token.srf?client_id=0000000040170455&code=${code[0]}&redirect_uri=https://login.live.com/oauth20_desktop.srf&grant_type=authorization_code`)
            GM_setValue("Config.code", srfUrl)
        } else {
            GM_setValue("Config.code", srfUrl)
            pushMsg("授权Code错误", "请获取并补充授权Code后运行！")
        }
    } else {
        GM_setValue("Config.code", srfUrl)
        getToken(`https://login.live.com/oauth20_token.srf?client_id=0000000040170455&refresh_token=${GM_getValue("refresh_token")}&scope=service::prod.rewardsplatform.microsoft.com::MBI_SSL&grant_type=REFRESH_TOKEN`)
    }
}


function getRewardsToken() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://rewards.bing.com",
            onload(xhr) {
                if (xhr.status == 200) {
                    let res = xhr.responseText
                    let html = res.replace(/\s/g, "")
                    let data = html.match(/RequestVerificationToken/)
                    if (data && data[0]) {
                        let token = html.match(/RequestVerificationToken"type="hidden"value="(.*?)"\/>/)
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
                    let res = xhr.responseText
                    let data = res.match(/(\"dashboard\"?)/)
                    if (data && data[0]) {
                        res = JSON.parse(res)
                        resolve(res.dashboard)
                    } else {
                        GM_setValue("task_promo", 1)
                        GM_setValue("task_search", 1)
                        pushMsg("账号状态失效", "请检查微软账号登录状态或重新登录！")
                        return true
                    }
                } else {
                    GM_setValue("task_promo", 1)
                    GM_setValue("task_search", 1)
                    pushMsg("信息获取失败", "获取微软积分商城信息失败！状态码：" + xhr.status)
                    return true
                }
            }
        })
    })
}


let testTimes = 0

async function taskPromo() {
    if (GM_getValue("task_promo") != 0) {
        return true
    }

    if (hoursNow < 12) {
        GM_setValue("task_promo", 1)
        return true
    }

    if (testTimes > 1) {
        GM_setValue("task_promo", 1)
        pushMsg("活动推广失败", "未知原因出错，俺也不造啊！")
        return true
    }

    const token = await getRewardsToken()
    if (token == 0) {
        GM_setValue("task_promo", 1)
        pushMsg("请求验证失败", "请检查积分商城登录状态或重新登录！")
        return true
    }

    let promotionsArr = []
    const dashboard = await getRewardsInfo()
    const morePromotions = dashboard.morePromotions
    const dailySetPromotions = dashboard.dailySetPromotions[dateNow]
    for (const promotion of [...dailySetPromotions, ...morePromotions]) {
        if (promotion.complete == false) {
            promotionsArr.push({ offerId: promotion.offerId, hash: promotion.hash })
        }
    }

    if (promotionsArr.length == 0) {
        GM_setValue("task_promo", lastDate)
        pushMsg("活动推广完成", "哇！哥哥好棒！活动推广完成了！")
        return true
    } else {
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
        testTimes++
        return false
    }
}


function getReadPro() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://prod.rewardsplatform.microsoft.com/dapi/me?channel=SAAndroid&options=613",
            headers: {
                "authorization": `Bearer ${GM_getValue("access_token")}`
            },
            onload(xhr) {
                let readarr = null
                let res = xhr.responseText
                let pro = JSON.parse(res).response.promotions
                if (pro) {
                    for (const o of pro) {
                        if (o.attributes.offerid == "ENUS_readarticle3_30points") {
                            readarr = { "max": Number(o.attributes.max), "progress": Number(o.attributes.progress) }
                            resolve(readarr)
                        }
                    }
                } else {
                    readarr = { "max": 1, "progress": 0 }
                    resolve(readarr)
                }
            }
        })
    })
}


let readTimes = 0
let readPoints = 0

async function taskRead() {
    if (GM_getValue("task_read") != 0) {
        return true
    }

    if (hoursNow < 12) {
        GM_setValue("task_read", 1)
        return true
    }

    if (readTimes > 1) {
        GM_setValue("task_read", 1)
        pushMsg("文章阅读失败", "未知原因出错，俺也不造啊！")
        return true
    }

    const readPro = await getReadPro()
    if (readPro.progress == readPoints) {
        readTimes++
    } else {
        readTimes = 0
        readPoints = readPro.progress
    }

    if (readPro.progress >= readPro.max) {
        GM_setValue("task_read", lastDate)
        pushMsg("文章阅读完成", "哇！哥哥好棒！文章阅读完成了！")
        return true
    } else {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://prod.rewardsplatform.microsoft.com/dapi/me/activities",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${GM_getValue("access_token")}`
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
    }
}


let signTimes = 0
let signPoints = 1

async function taskSign() {
    if (GM_getValue("task_sign") != 0) {
        return true
    }

    if (signTimes > 1) {
        GM_setValue("task_sign", 1)
        pushMsg("App签到失败", "未知原因出错，俺也不造啊！")
        return true
    }
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://prod.rewardsplatform.microsoft.com/dapi/me/activities",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${GM_getValue("access_token")}`
        },
        data: JSON.stringify({
            "amount": 1,
            "attributes": {
                "offerid": "Gamification_Sapphire_DailyCheckIn",
                "date": `${yearNow}${monthNow}${dayNow}`,
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
            if (xhr.status == 200) {
                signTimes = 0
                let res = JSON.parse(xhr.responseText)
                let points = res.response.activity.p
                points ? signPoints = points : signPoints = 0
            } else {
                signTimes++
            }
        }
    })
    if (signPoints == 0) {
        GM_setValue("task_sign", lastDate)
        pushMsg("App签到完成", "哇！哥哥好棒！App签到完成了！")
        return true
    }
}


let keywordList = []
let keywordIndex = 0

async function getTopKeyword() {
    const query = await new Promise((resolve, reject) => {
        if (keywordIndex < 1 || keywordList.length < 1) {
            const apiName = getRandomUrl()
            GM_setValue("last_name", apiName)
            GM_xmlhttpRequest({
                url: `https://hot.baiwumm.com/api/${apiName}`,
                onload(xhr) {
                    if (xhr.status == 200) {
                        keywordIndex = 1
                        let res = JSON.parse(xhr.responseText)
                        for (let i = 0; i < res.data.length; i++) {
                            keywordList.push(res.data[i].title)
                        }
                        keywordList = getRandomArr(keywordList)
                        resolve(keywordList[keywordIndex])
                    } else {
                        const sentence = getRandomSentence(randomData.query, 3)
                        resolve(sentence)
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
    if (GM_getValue("task_search") != 0) {
        return true
    }

    const onload = (xhr) => {
        let url = new URL(xhr.finalUrl)
        if (url.host != domain) {
            domain = url.host
        }
    }

    const dashboard = await getRewardsInfo()
    if (dashboard.userStatus.counters.pcSearch) {
        pcPtPro = dashboard.userStatus.counters.pcSearch[0].pointProgress
        pcPtProMax = dashboard.userStatus.counters.pcSearch[0].pointProgressMax
    }
    if (dashboard.userStatus.counters.mobileSearch) {
        mobilePtPro = dashboard.userStatus.counters.mobileSearch[0].pointProgress
        mobilePtProMax = dashboard.userStatus.counters.mobileSearch[0].pointProgressMax
    } else {
        mobilePtProMax = 0
    }

    if (retryTimes > 1) {
        GM_setValue("task_search", 1)
        GM_log(`必应搜索收入限制，请等待下个时间点继续完成！电脑：${pcPtPro}/${pcPtProMax}　移动设备：${mobilePtPro}/${mobilePtProMax}`)
        return true
    }

    if (dashboard.userStatus.counters.dailyPoint[0].pointProgress == lastProcess) {
        retryTimes++
    } else {
        retryTimes = 0
        lastProcess = dashboard.userStatus.counters.dailyPoint[0].pointProgress
    }

    if (pcPtPro >= pcPtProMax && mobilePtPro >= mobilePtProMax) {
        GM_setValue("task_search", lastDate)
        pushMsg("必应搜索完成", `哇！哥哥好棒！必应搜索完成了！`)
        return true
    } else {
        const keyword = await getTopKeyword()
        if (pcPtPro < pcPtProMax) {
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH`,
                headers: {
                    "User-Agent": randomData.pc[getRandomNum(randomData.pc.length)],
                    "Referer": `https://${domain}/`
                },
                onload: onload
            })
            return false
        }
        if (mobilePtPro < mobilePtProMax) {
            GM_xmlhttpRequest({
                url: `https://${domain}/search?q=${keyword}&form=QBLH`,
                headers: {
                    "User-Agent": randomData.mobile[getRandomNum(randomData.mobile.length)],
                    "Referer": `https://${domain}/`
                },
                onload: onload
            })
            return false
        }
    }
}


return new Promise((resolve, reject) => {
    if (GM_getValue("last_date") == lastDate) {
        resolve()
    }

    const taskarr = ["task_sign", "task_read", "task_promo", "task_search"]
    taskarr.forEach((item) => {
        if (GM_getValue(item) != lastDate) {
            GM_setValue(item, 0)
        }
    })

    function taskEnd(name) {
        let taskplus = GM_getValue("task_sign") + GM_getValue("task_read") + GM_getValue("task_promo") + GM_getValue("task_search")
        if (taskplus == lastDate * 4) {
            GM_setValue("last_date") = lastDate
            resolve()
        }
        let tasknum = 0
        const newTaskarr = taskarr.filter(item => item !== name);
        newTaskarr.forEach((item) => {
            if (GM_getValue(item) > 0) {
                tasknum++
            }
        })
        if (tasknum > 2) {
            resolve()
        }
    }

    const signStart = async () => {
        try {
            const result = await taskSign()
            if (result) {
                taskEnd("task_sign")
            } else {
                setTimeout(() => { signStart() }, 2333)
            }
        } catch (e) {
            reject(e)
        }
    }

    const readStart = async () => {
        try {
            const result = await taskRead()
            if (result) {
                taskEnd("task_read")
            } else {
                setTimeout(() => { readStart() }, 2333)
            }
        } catch (e) {
            reject(e)
        }

    }

    const promoStart = async () => {
        try {
            const result = await taskPromo()
            if (result) {
                taskEnd("task_promo")
            } else {
                setTimeout(() => { promoStart() }, 2333)
            }
        } catch (e) {
            reject(e)
        }
    }

    const searchStart = async () => {
        try {
            const result = await taskSearch()
            if (result) {
                taskEnd("task_search")
            } else {
                setTimeout(() => { searchStart() }, getScopeRandomNum(6789, 9876))
            }
        } catch (e) {
            reject(e)
        }
    }

    isExpired()
    promoStart()
    searchStart()
    if (GM_getValue("Config.app") == "开") {
        signStart()
        readStart()
    }
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
