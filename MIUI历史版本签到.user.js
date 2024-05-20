// ==UserScript==
// @name            MIUI历史版本签到
// @namespace       https://github.com/geoi6sam1
// @version         0.3.8
// @description     MIUI历史版本每日自动签到，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://miuiver.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log
// @connect         miuiver.com
// @license         GPL-3.0
// @updateURL       https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/MIUI%E5%8E%86%E5%8F%B2%E7%89%88%E6%9C%AC%E7%AD%BE%E5%88%B0.user.js
// @downloadURL     https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/MIUI%E5%8E%86%E5%8F%B2%E7%89%88%E6%9C%AC%E7%AD%BE%E5%88%B0.user.js
// ==/UserScript==

/* ==UserConfig==
Login:
  log:
    title: 账号
  pwd:
    title: 密码
    password: true
 ==/UserConfig== */

let reLogTimes = 0
let userLog = encodeURIComponent(GM_getValue("Login.log"))
let userPwd = encodeURIComponent(GM_getValue("Login.pwd"))

return new Promise((resolve, reject) => {
    function getRs(callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://miuiver.com/user-profile",
            onload(xhr) {
                var res = xhr.responseText
                var rewards = res.match(/<b>(.*?)<\/b>/)
                if (rewards) {
                    callback(rewards[1])
                } else {
                    callback("获取失败")
                }
            }
        })
    }

    function login() {
        reLogTimes++
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://miuiver.com/wp-login.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://miuiver.com/wp-login.php",
            },
            data: `log=${userLog}&pwd=${userPwd}&rememberme=forever&wp-submit=%E7%99%BB%E5%BD%95&redirect_to=https%3A%2F%2Fmiuiver.com%2Fwp-admin%2F&testcookie=1`,
            responseType: "json",
            onload(xhr) {
                var stat = xhr.status
                if (stat == 200) {
                    if (reLogTimes > 2) {
                        pushMsg("失败", "登录失败，请检查账号密码！")
                        resolve()
                    } else {
                        main()
                    }
                } else if (stat == 503) {
                    pushMsg("失败", "登录请求频繁，请稍后再登录！")
                    resolve()
                } else {
                    pushMsg("失败", "登录请求失败！状态码：" + stat)
                    reject(xhr)
                }
            }
        })
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
            onload(xhr) {
                var stat = xhr.status
                if (stat == 200) {
                    var status = xhr.response.status
                    switch (status) {
                        case 200:
                            getRs((rewards) => {
                                pushMsg("成功", "签到成功，当前积分：" + rewards)
                                resolve()
                            })
                            break
                        case 201:
                            getRs((rewards) => {
                                pushMsg("重复", "签到重复，当前积分：" + rewards)
                                resolve()
                            })
                            break
                    }
                } else if (stat == 400) {
                    login()
                } else {
                    pushMsg("失败", "签到请求失败！状态码:" + stat)
                    reject(xhr)
                }
            }
        })
    }
  
    main()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "MIUI历史版本签到" + title,
        image: "https://miuiver.com/favicon.ico",
        onclick: () => {
            GM_openInTab("https://miuiver.com/user-profile", { active: true, insert: true, setParent: true })
        }
    })
}
