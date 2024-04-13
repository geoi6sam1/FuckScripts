// ==UserScript==
// @name            智能电视网签到
// @namespace       https://github.com/geoi6sam1
// @version         0.3.2
// @description     智能电视网每日自动签到，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://www.znds.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @cloudcat            
// @connect         znds.com
// @exportcookie    domain=.znds.com
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
  way:
    type: select
    default: 用户名
    values: [用户名,邮箱]
  log:
    title: 账号
  pwd:
    title: 密码
    password: true
 ==/UserConfig== */

GM_setValue("reLogTimes", 0)

return new Promise((resolve, reject) => {
    var reLogTimes = 0
    var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.4567.89"

    function login_h(callback) {
        GM_xmlhttpRequest({
            url: "https://www.znds.com/member.php?mod=logging&action=login",
            headers: {
                "User-Agent": userAgent,
            },
            onload(xhr) {
                var res = xhr.responseText
                var loginhash = res.match(/loginhash=(.*?)"/)
                var formhash = res.match(/formhash=(.*?)'/)
                loginhash = loginhash[1]
                formhash = formhash[1]
                var hasharr = [loginhash, formhash]
                callback(hasharr)
            },
        })
    }

    function daka_h(callback) {
        GM_xmlhttpRequest({
            url: "https://www.znds.com/forum.php",
            headers: {
                "User-Agent": userAgent,
            },
            onload(xhr) {
                var res = xhr.responseText
                var formhash = res.match(/formhash=(.*?)"/)
                if (!formhash) {
                    login()
                } else {
                    formhash = formhash[1]
                    callback(formhash)
                }
            },
        })
    }

    function login() {
        var way = GM_getValue("Login.way")
        var log = encodeURIComponent(GM_getValue("Login.log"))
        var pwd = encodeURIComponent(GM_getValue("Login.pwd"))
        if (way == "邮箱") {
            way = "email"
        } else {
            way = "username"
        }
        if (log && pwd) {
            reLogTimes++
            GM_setValue("reLogTimes", reLogTimes)
            login_h((hash) => {
                var loginhash = encodeURIComponent(hash[0])
                var formhash = encodeURIComponent(hash[1])
                GM_xmlhttpRequest({
                    url: `https://www.znds.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=${loginhash}&inajax=1&formhash=${formhash}&referer=https%3A%2F%2Fwww.znds.com%2F.%2F&loginfield=${way}&username=${log}&password=${pwd}&questionid=0&answer=&cookietime=2592000`,
                    headers: {
                        "User-Agent": userAgent,
                    },
                    onload(xhr) {
                        var stat = xhr.status
                        if (stat == 200) {
                            if (GM_getValue("reLogTimes") > 2) {
                                reMsg("失败", "登录失败,请检查账号密码!")
                                resolve()
                            } else {
                                main()
                            }
                        } else {
                            reMsg("失败", "登录请求失败!状态码:" + stat)
                            reject(xhr)
                        }
                    },
                    onerror(err) {
                        reMsg("出错", "登录出错,请查看运行日志!")
                        reject(err)
                    },
                })
            })
        } else {
            reMsg("失败", "尚未登录,请登录后再运行!")
            resolve()
        }
    }

    function main() {
        daka_h((hash) => {
            var formhash = encodeURIComponent(hash)
            GM_xmlhttpRequest({
                url: `https://www.znds.com/plugin.php?id=ljdaka:daka&action=msg&formhash=${formhash}&infloat=yes&handlekey=ljdaka&inajax=1&ajaxtarget=fwin_content_ljdaka`,
                headers: {
                    "User-Agent": userAgent,
                },
                onload(xhr) {
                    var stat = xhr.status
                    var res = xhr.responseText
                    if (stat == 200) {
                        var msg = res.match(/<p>(.*?)<\/p>/)
                        msg = msg[1]
                        reMsg("成功", msg)
                        resolve()
                    } else {
                        reMsg("失败", "打卡请求失败!状态码:" + stat)
                        reject(xhr)
                    }
                }, onerror(err) {
                    reMsg("出错", "打卡出错,请查看运行日志!")
                    reject(err)
                },
            })
        })
    }
    main()
})

function reMsg(title, text) {
    GM_notification({
        text: text,
        title: "智能电视网签到" + title,
        image: "https://www.znds.com/favicon.ico",
    })
}
