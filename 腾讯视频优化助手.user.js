// ==UserScript==
// @name            腾讯视频优化助手
// @namespace       https://github.com/geoi6sam1
// @version         1.1.5.1
// @description     优化腾讯视频（WeTV）浏览与观影体验，支持电脑端和移动端
// @author          geoi6sam1@qq.com
// @match           http*://v.qq.com/*
// @match           http*://m.v.qq.com/*
// @match           http*://film.qq.com/*
// @match           http*://m.film.qq.com/*
// @icon            https://v.qq.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @run-at          document-start
// @grant           unsafeWindow
// @grant           GM_addStyle
// @license         GPL-3.0
// ==/UserScript==

(function () {
    'use strict'

    const obj = {
        /*** 个性化选项 ***/
        option: {
            quick: 0, // 网页顶部导航按钮，默认隐藏，值为0
            barrage: 0, // 视频弹幕相关内容，默认隐藏，值为0
            watermark: 0, // 视频右上角水印，默认移除，值为0
            grayscale: 0, // 哀悼日网站灰度，默认取消，值为0
        },
    }
    const userAgent = navigator.userAgent || window.navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|Opera Mini|Mobile/i.test(userAgent)

    function removeTimeout(e, t) {
        setTimeout(() => {
            var d = document.querySelector(e)
            if (d) {
                d.remove()
            }
        }, t)
    }

    obj.wetvQuick = function () {
        GM_addStyle(`
.quick_vip,
.quick_upload,
.quick_message,
#quick_access,
#pc_client
{
    display: none !important;
}
`)
    }

    obj.wetvBarrage = function () {
        GM_addStyle(`
[class*="-barrage"],
[class*="barrage-"]
{
    display: none !important;
}
`)
        if (!isMobile) {
            GM_addStyle(`
iframe[src*="vfiles.gtimg.cn/tvideo/libcocos-frame"]
{
    display: none !important;
}
`)
        }
    }

    obj.wetvWatermark = function () {
        removeTimeout(".txp-watermark", 5000)
    }

    obj.wetvGrayscale = function () {
        GM_addStyle(`
.gray-style-remembrance
{
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
}
`)
    }

    GM_addStyle(`
.quick_games,
.video-card-module [dt-params*="ad_"],
.focus-wrap [dt-eid*="ad_poster"],
a[href*="9377s."],
a[href*="qqgame."],
a[href*="gamer."],
a[href*="iwan."],
.video-banner-module:has(a[href*="9377s."]),
.video-banner-module:has(a[href*="qqgame."]),
.video-banner-module:has(a[href*="gamer."]),
.video-banner-module:has(a[href*="iwan."]),
#iwan-gamependant-page,
.tip_download,
.vip_act,
.fixed_box,
#ad_container,
#iwan-game,
.banner-ad,
.txp_ad,
.txp_none,
.game-switch-ad,
.player-comment-btn,
iframe[data-src*="mall."],
[class*="txp_full_screen_pause"],
[data-role*="creative-player-pause"],
#ad_m-site,
.open-app.old-open,
[dt-eid="openbanner"],
.bottom-wrapper,
.at-app-banner
{
    display: none !important;
}

.video-card-wrap
{
   margin-right: var(--content-big-card-margin);
   margin-bottom: var(--content-big-card-margin);
}
`)

    obj.adFloatFuck = function () {
        var txv_player_choose = document.querySelectorAll("#player video")[0]
        if (txv_player_choose) {
            setTimeout(() => {
                if (txv_player_choose.paused == true) {
                    var txv_player_win = document.querySelector(".txp_videos_container")
                    txv_player_win.setAttribute("style", "position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 0;")
                }
            }, 2000)
        }
    }

    window.addEventListener("keydown", (event) => {
        var e = event || window.event
        var k = e.keyCode || e.which
        if (k == 32) {
            obj.adFloatFuck()
        }
    })

    window.addEventListener("mousedown", (event) => {
        var e = event || window.event
        var b = e.button
        if (b == 0) {
            obj.adFloatFuck()
        }
    })

    var arr = [
        [obj.option.quick, obj.wetvQuick],
        [obj.option.barrage, obj.wetvBarrage],
        [obj.option.watermark, obj.wetvWatermark],
        [obj.option.grayscale, obj.wetvGrayscale],
    ]
    arr.forEach((item) => {
        if (item[0] == 0) {
            item[1]()
        }
    })

    window.onload = () => {
        let run = null
        clearAd()
        window.addEventListener("pushState", () => {
            clearInterval(run)
            clearAd()
        })
        function clearAd() {
            run = setInterval(() => {
                let adVideos = document.querySelectorAll(".txp_ad video")
                adVideos.forEach(ad => {
                    if (ad.duration != ad.currentTime) {
                        ad.setAttribute("src", "")
                        ad.style.display = "none"
                    }
                })

            }, 100)
        }
    }
    
})()
