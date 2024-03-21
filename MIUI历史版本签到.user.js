// ==UserScript==
// @name            MIUI历史版本签到
// @namespace       https://github.com/geoi6sam1
// @version         0.2.0
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
    description: 用户名或邮箱地址
    default:
  pwd:
    title: 密码
    description: 登录密码
    default:
 ==/UserConfig== */

GM_getValue("Login.log") || GM_setValue("Login.log", "")
GM_getValue("Login.pwd") || GM_setValue("Login.pwd", "")
GM_getValue("reLogTimes") && GM_setValue("reLogTimes", 0)

return new Promise((resolve, reject) => {
    var reLogTimes = 0
    function login() {
        var log = encodeURIComponent(GM_getValue("Login.log"))
        var pwd = encodeURIComponent(GM_getValue("Login.pwd"))
        if (log && pwd) {
            reLogTimes += 1
            GM_setValue("reLogTimes", reLogTimes)
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://miuiver.com/wp-login.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Origin": "https://miuiver.com",
                    "Referer": "https://miuiver.com/wp-login.php",
                },
                data: `log=${log}&pwd=${pwd}&rememberme=forever&wp-submit=%E7%99%BB%E5%BD%95&redirect_to=https%3A%2F%2Fmiuiver.com%2Fwp-admin%2F&testcookie=1`,
                responseType: "json",
                onload: (res) => {
                    switch (res.status) {
                        case 200:
                            if (GM_getValue("reLogTimes") > 1) {
                                reMsg("🟡登录失败，请检查账号密码")
                                reject()
                            } else {
                                main()
                            }
                            break
                        case 503:
                            reMsg("🟡登录频繁，请稍后再运行")
                            reject()
                            break
                        default:
                            reMsg("🔴登录失败，请查看运行日志")
                            GM_log(res)
                            reject()
                            break
                    }
                },
                onerror: (err) => {
                    reMsg("🔴登录出错，请查看运行日志")
                    GM_log(err)
                    reject()
                },
            })
        } else {
            reMsg("🟡尚未登录，请登录后再运行")
            reject()
        }
    }
    function main() {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://miuiver.com/wp-admin/admin-ajax.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": "https://miuiver.com",
                "Referer": "https://miuiver.com/user-profile/",
            },
            data: "action=epd_checkin",
            responseType: "json",
            onload: (res) => {
                if (res.status == 200) {
                    var status = res.response.status
                    switch (status) {
                        case 200:
                            reMsg("🟢签到成功，又是元气满满的一天")
                            resolve()
                            break
                        case 201:
                            reMsg("🟡重复签到，今天已经签到过了")
                            resolve()
                            break
                    }
                } else if (res.status == 400) {
                    login()
                } else {
                    reMsg("🔴签到失败，请查看运行日志")
                    GM_log(res)
                    reject()
                }
            },
            onerror: (err) => {
                reMsg("🔴签到出错，请查看运行日志")
                GM_log(err)
                reject()
            },
        })
    }
    main()
})

function reMsg(text) {
    GM_notification({
        text: text,
        title: "MIUI历史版本签到",
        image: "https://miuiver.com/favicon.ico",
    })
}
