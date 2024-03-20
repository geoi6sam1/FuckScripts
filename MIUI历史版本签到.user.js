// ==UserScript==
// @name            MIUI历史版本签到
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     MIUI历史版本每日自动签到（WordPress通用模板）
// @author          geoi6sam1@qq.com
// @icon            https://miuiver.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @crontab         * * once * *
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_log
// @cloudcat
// @exportcookie    domain=.miuiver.com
// @antifeature     ads
// @antifeature     miner
// @antifeature     payment
// @antifeature     tracking
// @antifeature     membership
// @antifeature     referral-link
// @license         GPL-3.0
// ==/UserScript==

return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://miuiver.com/wp-admin/admin-ajax.php",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://miuiver.com/user-profile/",
        },
        data: "action=epd_checkin",
        responseType: "json",
        onload: (res) => {
            var status = res.response.status
            switch (status) {
                case 200:
                    reMsg("🟢签到成功")
                    resolve()
                    break
                case 201:
                    reMsg("🟣重复签到")
                    resolve()
                    break
                default:
                    reMsg("🟡尚未登录")
                    resolve()
                    break
            }
        },
        onerror: (err) => {
            reMsg("🔴未知错误")
            GM_log(err)
            reject()
        },
    })
})

function reMsg(text) {
    GM_notification({
        text: text,
        title: "MIUI历史版本签到",
        image: "https://miuiver.com/favicon.ico",
    })
}
