// ==UserScript==
// @name            MIUI历史版本签到
// @namespace       https://github.com/geoi6sam1
// @version         0.3.2
// @description     MIUI历史版本每日自动签到，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://miuiver.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @cloudcat
// @connect         miuiver.com
// @exportcookie    domain=.miuiver.com
// @antifeature     ads
// @antifeature     miner
// @antifeature     payment
// @antifeature     tracking
// @antifeature     membership
// @antifeature     referral-link
// @license         GPL-3.0
// ==/UserScript==

/* ==UserConfig==
Login:
  log:
    title: 账号
  pwd:
    title: 密码
    password: true
 ==/UserConfig== */

GM_setValue("reLogTimes", 0)

return new Promise((resolve, reject) => {
    var reLogTimes = 0

    function getRs(callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://miuiver.com/user-profile",
            onload(xhr) {
                var res = xhr.responseText
                var rewards = res.match(/<b>(.*?)<\/b>/)
                if (rewards) {
                    rewards = rewards[1]
                } else {
                    rewards = "获取失败"
                }
                callback(rewards)
            },
        })
    }

    function login() {
        var log = encodeURIComponent(GM_getValue("Login.log"))
        var pwd = encodeURIComponent(GM_getValue("Login.pwd"))
        if (log && pwd) {
            reLogTimes++
            GM_setValue("reLogTimes", reLogTimes)
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://miuiver.com/wp-login.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Referer": "https://miuiver.com/wp-login.php",
                },
                data: `log=${log}&pwd=${pwd}&rememberme=forever&wp-submit=%E7%99%BB%E5%BD%95&redirect_to=https%3A%2F%2Fmiuiver.com%2Fwp-admin%2F&testcookie=1`,
                responseType: "json",
                onload: (xhr) => {
                    var stat = xhr.status
                    if (stat == 200) {
                        if (GM_getValue("reLogTimes") > 2) {
                            reMsg("失败", "登录失败，请检查账号密码！")
                            resolve()
                        } else {
                            main()
                        }
                    } else if (stat == 503) {
                        reMsg("失败", "登录请求频繁，请稍后再登录！")
                        resolve()
                    } else {
                        reMsg("失败", "登录请求失败！状态码：" + stat)
                        reject(xhr)
                    }
                },
                onerror: (err) => {
                    reMsg("出错", "登录出错，请查看运行日志！")
                    reject(err)
                },
            })
        } else {
            reMsg("失败", "尚未登录，请登录后再运行！")
            resolve()
        }
    }

    function main() {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://miuiver.com/wp-admin/admin-ajax.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://miuiver.com/user-profile/",
            },
            data: "action=epd_checkin",
            responseType: "json",
            onload: (xhr) => {
                var stat = xhr.status
                if (stat == 200) {
                    var status = xhr.response.status
                    switch (status) {
                        case 200:
                            getRs((rewards) => {
                                reMsg("成功", "签到成功，当前积分：" + rewards)
                                resolve()
                            })
                            break
                        case 201:
                            getRs((rewards) => {
                                reMsg("重复", "签到重复，当前积分：" + rewards)
                                resolve()
                            })
                            break
                    }
                } else if (stat == 400) {
                    login()
                } else {
                    reMsg("失败", "签到请求失败！状态码:" + stat)
                    reject(xhr)
                }
            },
            onerror: (err) => {
                reMsg("出错", "签到出错，请查看运行日志！")
                reject(err)
            },
        })
    }
    main()
})

function reMsg(title, text) {
    GM_notification({
        text: text,
        title: "MIUI历史版本签到" + title,
        image: "https://miuiver.com/favicon.ico",
    })
}
