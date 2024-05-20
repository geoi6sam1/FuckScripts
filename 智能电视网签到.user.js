// ==UserScript==
// @name            智能电视网签到
// @namespace       https://github.com/geoi6sam1
// @version         0.4.0
// @description     智能电视网每日自动签到，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://www.znds.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log  
// @connect         znds.com
// @license         GPL-3.0
// @updateURL       https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E6%99%BA%E8%83%BD%E7%94%B5%E8%A7%86%E7%BD%91%E7%AD%BE%E5%88%B0.user.js
// @downloadURL     https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E6%99%BA%E8%83%BD%E7%94%B5%E8%A7%86%E7%BD%91%E7%AD%BE%E5%88%B0.user.js
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

let reLogTimes = 0
let loginWay = GM_getValue("Login.way")
let userLog = encodeURIComponent(GM_getValue("Login.log"))
let userPwd = encodeURIComponent(GM_getValue("Login.pwd"))
let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"

return new Promise((resolve, reject) => {
    function _logh(callback) {
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
            }
        })
    }

    function _fh(callback) {
        GM_xmlhttpRequest({
            url: "https://www.znds.com",
            headers: {
                "User-Agent": userAgent,
            },
            onload(xhr) {
                var res = xhr.responseText
                if (xhr.status == 200) {
                    var formhash = res.match(/formhash=(.*?)"/)
                    if (!formhash) {
                        login()
                    } else {
                        formhash = formhash[1]
                        callback(formhash)
                    }
                } else {
                    pushMsg("失败", "打卡请求失败!状态码:" + xhr.status)
                    resolve()
                }
            },
        })
    }

    function login() {
        if (loginWay && userLog && userPwd) {
            if (loginWay == "邮箱") {
                loginWay = "email"
            } else {
                loginWay = "username"
            }
            _logh((hash) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: `https://www.znds.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=${hash[0]}&inajax=1`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Referer": "https://www.znds.com/",
                        "User-Agent": userAgent
                    },
                    data: `&formhash=${hash[1]}&referer=https%3A%2F%2Fwww.znds.com%2F&loginfield=${loginWay}&username=${userLog}&password=${userPwd}&questionid=0&answer=&cookietime=2592000`,
                    onload(xhr) {
                        if (xhr.status == 200) {
                            if (reLogTimes > 2) {
                                pushMsg("失败", "账号密码错误或登录请求频繁!")
                                resolve()
                            } else {
                                reLogTimes++
                                main()
                            }
                        } else {
                            pushMsg("失败", "登录请求失败!状态码:" + xhr.status)
                            resolve()
                        }
                    }
                })
            })
        } else {
            pushMsg("失败", "请先登录才能继续操作！")
            resolve()
        }
    }

    function main() {
        _fh((formhash) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://www.znds.com/plugin.php?id=ljdaka:daka&action=msg`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Referer": "https://www.znds.com/",
                    "User-Agent": userAgent
                },
                data: `&formhash=${formhash}&infloat=yes&handlekey=ljdaka&inajax=1&ajaxtarget=fwin_content_ljdaka`,
                onload(xhr) {
                    var res = xhr.responseText
                    var msg = res.match(/<p>(.*?)<\/p>/)
                    pushMsg("成功", msg[1])
                    resolve()
                }
            })
        })
    }

    main()
})

function pushMsg(title, text) {
    GM_notification({
        text: text,
        title: "智能电视网签到" + title,
        image: "https://www.znds.com/favicon.ico",
        onclick: () => {
            GM_openInTab("https://www.znds.com/member.php?mod=logging&action=login", { active: true, insert: true, setParent: true })
        }
    })
}
