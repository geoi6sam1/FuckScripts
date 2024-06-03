// ==UserScript==
// @name            粤知缘动漫社签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.1
// @description     粤知缘动漫社每日自动签到，领取任务奖励，支持自动登录
// @author          geoi6sam1@qq.com
// @icon            https://www.yzydm.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * 8-23 once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_log
// @connect         www.yzydm.com
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

function getRandNum(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}

function getRandStr(num) {
    const randData = [
        "记上一笔，hold住我的快乐！",
        "格式化自己，只为删除那些不愉快！",
        "为了维护宇宙和平，打起精神来！~~",
        "没有开心，哪来的幸福？要开心哦",
        "人生太多无奈，今天的事让我真是傻眼呀！",
        "人生太多事，今天就在这里大哭一次，希望在明天！",
        "还是继续慵懒下去吧~~",
        "每天萌萌哒~~",
        "不必转头就可以看的笑脸。或是一只可爱的小不点~~",
        "今日不说话啊不说话~"
    ]
    return randData[num]
}

let reLogTimes = 0
let emotid = getRandNum(1, 10)
let content = getRandStr(emotid - 1)
let loginWay = GM_getValue("Login.way")
let userLog = encodeURIComponent(GM_getValue("Login.log"))
let userPwd = encodeURIComponent(GM_getValue("Login.pwd"))

return new Promise((resolve, reject) => {
    function _logh(callback) {
        GM_xmlhttpRequest({
            url: "https://www.yzydm.com/member.php?mod=logging&action=login",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            },
            onload(xhr) {
                var res = xhr.responseText
                var loginhash = res.match(/loginhash=(.*?)"/)
                var formhash = res.match(/formhash=(.*?)"/)
                loginhash = loginhash[1]
                formhash = formhash[1]
                var hasharr = [loginhash, formhash]
                callback(hasharr)
            }
        })
    }

    function _fh(callback) {
        GM_xmlhttpRequest({
            url: "https://www.yzydm.com",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 14; MI 6 Build/UP1A.231005.007) Version/4.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
            },
            onload(xhr) {
                var res = xhr.responseText
                if (xhr.status == 200) {
                    var formhash = res.match(/formhash=(.*?)&/)
                    if (formhash) {
                        callback(formhash[1])
                    } else {
                        login()
                    }
                } else {
                    pushMsg("失败", "签到失败！状态码：" + xhr.status)
                    resolve()
                }
            }
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
                    url: `https://www.yzydm.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=${hash[0]}&inajax=1`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Referer": "https://www.yzydm.com/",
                    },
                    data: `formhash=${hash[1]}&referer=https%3A%2F%2Fwww.yzydm.com%2F&loginfield=${loginWay}&username=${userLog}&password=${userPwd}&questionid=0&answer=&cookietime=2592000`,
                    onload(xhr) {
                        if (xhr.status == 200) {
                            GM_log(xhr.responseText)
                            if (reLogTimes > 2) {
                                pushMsg("失败", "账号密码错误或登录请求频繁")
                                resolve()
                            } else {
                                reLogTimes++
                                main()
                            }
                        } else {
                            pushMsg("失败", "登录请求失败！状态码：" + xhr.status)
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
                url: `https://www.yzydm.com/plugin.php?id=xunjie_task:task&type=1&formhash=${formhash}`
            })
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://www.yzydm.com/plugin.php?id=dc_signin:sign&inajax=1",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Referer": "https://www.yzydm.com/",
                },
                data: `formhash=${formhash}&signsubmit=yes&handlekey=signin&emotid=${emotid}&referer=https%3A%2F%2Fwww.yzydm.com%2F&content=${encodeURIComponent(content)}`,
                onload(xhr) {
                    var res = xhr.responseText.replace(/\s/g, "")
                    var msg = res.match(/_signin\(([\x00-\xff]+)([^\x00-\xff].*)',{}\);}/)
                    pushMsg("完成", msg[2])
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
        title: "粤知缘动漫社签到" + title,
        image: "https://www.yzydm.com/favicon.ico",
        onclick: () => {
            GM_openInTab("https://www.yzydm.com/member.php?mod=logging&action=login", { active: true, insert: true, setParent: true })
        }
    })
}
