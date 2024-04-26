// ==UserScript==
// @name            乐多美百货网签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     乐多美百货网每日自动签到，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://api.iowen.cn/favicon/www.wrmdjyx.cn.png
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log
// @cloudcat
// @connect         www.wrmdjyx.cn
// @exportcookie    domain=www.wrmdjyx.cn
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

let reLogTimes = 0
let userLog = encodeURIComponent(GM_getValue("Login.log"))
let userPwd = encodeURIComponent(GM_getValue("Login.pwd"))

return new Promise((resolve, reject) => {
    function login() {
        reLogTimes++
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.wrmdjyx.cn/wp-login.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.wrmdjyx.cn/wp-login.php",
            },
            data: `log=${userLog}&pwd=${userPwd}&rememberme=forever&wp-submit=%E7%99%BB%E5%BD%95&redirect_to=https%3A%2F%2Fwww.wrmdjyx.cn%2Fwp-admin%2F&testcookie=1`,
            responseType: "json",
            onload: (xhr) => {
                if (xhr.status == 200) {
                    if (reLogTimes > 2) {
                        pushMsg("失败", "登录失败，请检查账号密码！")
                        resolve()
                    } else {
                        main()
                    }
                } else {
                    pushMsg("失败", "登录失败！状态码：" + xhr.status)
                    reject(xhr)
                }
            }, onerror: (err) => {
                pushMsg("出错", "登录出错，请查看运行日志！")
                reject(err)
            }
        })
    }

    function main() {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.wrmdjyx.cn/wp-admin/admin-ajax.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.wrmdjyx.cn/user",
            },
            data: `action=user_qiandao`,
            responseType: "json",
            onload: (xhr) => {
                if (xhr.status == 200) {
                    var res = xhr.responseText
                    res = JSON.parse(res)
                    if (res.msg == "请登录后签到") {
                        login()
                    } else {
                        pushMsg("成功", res.msg)
                        resolve()
                    }
                } else {
                    pushMsg("失败", "签到失败！状态码：" + xhr.status)
                    reject(xhr)
                }
            }, onerror: (err) => {
                pushMsg("出错", "签到出错，请查看运行日志！")
                reject(err)
            }
        })
    }
    main()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "乐多美百货网签到" + title,
        image: "https://api.iowen.cn/favicon/www.wrmdjyx.cn.png",
        onclick: () => {
            GM_openInTab("https://www.wrmdjyx.cn/user", { active: true, insert: true, setParent: true })
        }
    })
}
