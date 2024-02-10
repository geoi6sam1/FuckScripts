// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.3.2
// @description  使用 DPlayer 来播放影片，支持更多快捷键（console），支持显示标题和时间（时:分），支持任意倍速调整（0.1-16），支持记忆、连续播放（未弄），支持搜索选集（未弄）
// @author       geoi6sam1
// @match        http*://*.keke*.com/play/*
// @match        http*://*.keke*.app/play/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/hls.js/1.4.12/hls.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/dplayer/1.27.1/DPlayer.min.js
// @icon         https://api.iowen.cn/favicon/www.kekedy.tv.png
// @run-at       document-start
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict'

    const config = {
        screenshot: true, // 默认显示截图按钮，值为：true（类型：boolean）
        autoplay: true, // 默认自动播放视频，值为：true（类型：boolean）
        volume: 1, // 默认音量：100%，值为：1（类型：number）
        theme: "#f5f5f5", // 默认主题颜色：White Smoke, 值为：#f5f5f5（类型：string）
    }

    GM_addStyle(`.play-box-main [class*="-tip"],.play-box-main [id*="-tip"],.dplayer-menu .dplayer-menu-item:nth-last-child(1),.dplayer-menu .dplayer-menu-item:nth-last-child(2) {display: none !important;}`)
    const $ = unsafeWindow.jQuery || window.jQuery
    const shortcutKey = [
        ["F", "切换全屏"],
        ["M", "开启/关闭静音"],
        ["N", "恢复正常 1x 倍速"],
        ["S", "搜索选集"],
        ["W", "切换网页全屏"],
        [",", "播放上集"],
        [".", "播放下集"],
        ["[", "减速播放"],
        ["]", "加速播放"],
        ["↑", "音量增加10%"],
        ["↓", "音量降低10%"],
        ["←", "快退5秒"],
        ["→", "快进5秒"],
        ["Space", "播放/暂停"],
        ["Esc", "退出全屏"],
    ]
    console.log("\n".concat(" %c 可可影视播放器 v", "0.3.2").concat(" %c https://github.com/geoi6sam1/FuckScripts ", "\n"), "color: #ffd700; background: #36282b; padding: 5px 0;", "background: #ffd700; padding: 5px 0;")
    console.table(shortcutKey)

    function toast(msg, type, dus, bgc) {
        var cText, text = decodeURIComponent(encodeURIComponent(msg))
        // 中国传统颜色：https://zhongguose.com
        switch (type) {
            case "info": bgc = "#2b73af" // 品蓝
                cText = `[☑️ info] => ${text}`
                break
            case "warn": bgc = "#e2c027" // 姜黄
                cText = `[⚠️ warn] => ${text}`
                break
            case "error": bgc = "#ee3f4d" // 茶花红
                cText = `[❌ error] => ${text}`
                break
            case "success": bgc = "#1ba784" // 竹绿
                cText = `[✅ success] => ${text}`
                break
            default: bgc = "#36282b" // 苍蝇灰
                break
        }
        let html = `<div id='cToast' style='opacity: 0.95;background-color: ${bgc};position: absolute; bottom: 50%; left: 50%;padding: 10px 20px;width: max-content;z-index: 999999;color: #f5f5f5;text-align: center;border-radius: 5px;transform: translate(-50%, -50%);pointer-events: all;font-size: 16px;box-sizing: border-box;'>${text}</div>`
        $("body").append(html)
        setTimeout(() => {
            $("#cToast").css({ "transition": "all 0.3s ease", "opacity": "0" })
            $("#cToast").remove()
        }, dus ? dus : 2e3)
        console.log(cText)
    }

    config.dPlayerUrl = function () {
        var url = window.location.href
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var html = xhr.responseText
                var script = html.match(/<script type="module">[\s\S]*<\/script>/)[0]
                var url = script.match(/(http|https):\/\/([\w.]+\/?)\S*?(\.m3u8)/i)[0]
                if (url == null || url == undefined) {
                    console.log('success', xhr)
                    toast("\u89C6\u9891\u94FE\u63A5\u83B7\u53D6\u5931\u8D25", "warn", 5e3)
                } else {
                    config.url = url
                    console.log(`[✅ success] => ${url}`)
                }
            }
        }
    }

    config.dPlayerStart = function () {
        config.dPlayerUrl()
        var container, videoNode = document.querySelector("#my-video")
        if (videoNode) {
            document.querySelector("#my-video_html5_api").remove()
            container = document.querySelector("#dplayer")
            if (!container) {
                container = document.createElement("div")
                container.setAttribute("id", "dplayer")
                container.setAttribute("style", "width: 100%; height: 100%;")
                videoNode.parentNode.replaceChild(container, videoNode)
            }
        }
        else {
            console.warn("\u5C1D\u8BD5\u518D\u6B21\u83B7\u53D6\u64AD\u653E\u5668\u5BB9\u5668")
            return setTimeout(config.dPlayerStart, 500)
        }

        const options = {
            container: container,
            screenshot: config.screenshot,
            autoplay: config.autoplay,
            volume: config.volume,
            playbackSpeed: [0.25, 0.5, 1, 2, 3],
            video: {
                url: config.url,
                type: 'hls',
            },
            contextmenu: [
                {
                    text: "打赏",
                    link: "https://geoi6sam1.github.io/pages/tips.html",
                },
                {
                    text: "问题反馈",
                    link: "https://github.com/geoi6sam1/FuckScripts/issues",
                },
            ],
            theme: config.theme,
        }

        try {
            var player = new window.DPlayer(options)
            config.initPlayer(player)
            toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u6210\u529F", "success")
        } catch (error) {
            toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u5931\u8D25", "error")
        }

    }
    config.dPlayerStart()

    config.initPlayer = function (player) {
        const { options: { contextmenu } } = player
        GM_addStyle(`#video-loading-wrapper { display: none !important; }`)
        config.dPlayerTitle(player)
        config.dPlayerAutoMP(player)
        config.dPlayerSetting(player)
        config.dPlayerSelections(player)
        config.dPlayerCustomSpeed(player)
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy()
    }

    config.dPlayerTitle = function (player) {
        var playSeason = $(".play-box-side-header .detail-title a strong")
        var playEpisode = $(".play-box-side-main .episode-list .episode-item-active span")
        var playTitle = playSeason.text() + " (" + playEpisode.text() + ")"
        playSeason.text(playTitle)
        let html = `<div id="dplayer-title" class="dplayer-show-top" style="display: none;pointer-events: none;position: absolute;left: 33px;top: 22px;font-size: 32px;color: #F5F5F5;"><strong>${playTitle}</strong></div>`
        html += `<div id="dplayer-time" class="dplayer-show-top" style="display: none;pointer-events: none;position: absolute;right: 33px;top: 22px;font-size: 32px;color: #F5F5F5;"><strong>00:00</strong></div>`
        $(".dplayer-video-wrap").append(html)

        setInterval(() => {
            let getDate = new Date()
            let hours = getDate.getHours()
            let minutes = getDate.getMinutes()
            let nowTime = (hours > 9 ? hours : "0" + hours) + ":" + (minutes > 9 ? minutes : "0" + minutes)
            $("#dplayer-time strong").text(nowTime)
        }, 1e3)

        var dplayerCT = $(".dplayer-show-top")
        var dplayer = $("#dplayer")
        var dTimer1, dTimer2
        player.on("playing", () => {
            dplayer.on("mousemove", () => {
                if (player.paused == false) {
                    clearTimeout(dTimer1)
                    dplayerCT.show()
                    dTimer1 = setTimeout(() => {
                        dplayerCT.hide()
                    }, 3e3)
                }
            })
            dplayer.on("mouseleave", () => {
                player.paused == false ? dplayerCT.hide() : dplayerCT.show()
            })
        })

        player.on("pause", () => {
            clearTimeout(dTimer1)
            clearTimeout(dTimer2)
            dplayerCT.show()
        })

        player.on("play", () => {
            if (player.video.played.length) {
                dTimer2 = setTimeout(() => {
                    dplayerCT.hide()
                }, 3e3)
            }
        })
    }

    config.dPlayerCustomSpeed = function (player) {
        var localSpeed = localStorage.getItem("dplayer-speed")
        localSpeed ? player.speed(localSpeed) : localStorage.setItem("dplayer-speed", 1)
        $(".dplayer-setting-speed-panel").append(`<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>`)
        $(".dplayer-setting").append(`<div class="dplayer-setting-custom-speed" title="双击恢复正常" style="display: none;right: 72px;position: absolute;bottom: 50px;width: 150px;border-radius: 2px;background: rgba(28,28,28,.9);padding: 7px 0;transition: all .3s ease-in-out;overflow: hidden;z-index: 2;"><div class="dplayer-speed-item" style="padding: 5px 10px;box-sizing: border-box;cursor: pointer;position: relative;"><span class="dplayer-speed-label" style="color: #f5f5f5;font-size: 13px;display: inline-block;vertical-align: middle;white-space: nowrap;">播放倍速：<input type="text" style="width: 55px;height: 15px;top: 3px;font-size: 13px;color: #222;border: 1px solid #fff;border-radius: 3px;text-align: center;" max="16" min=".1" maxlength="6" placeholder="0.1~16"> x</span></div></div>`)
        var custombox = $(".dplayer-setting-custom-speed")
        var input = $(".dplayer-setting-custom-speed input")
        input.val(localSpeed || 1)
        input.on("input propertychange", () => {
            var val = input.val()
            if (val != 0) {
                input.val(val)
                player.speed(val)
            }
        })

        player.on("ratechange", () => {
            const { video: { playbackRate } } = player
            player.notice(`正以 ${playbackRate}x 倍速播放`)
            localStorage.setItem("dplayer-speed", playbackRate)
            input.val(playbackRate)
        })

        $("#dplayer").dblclick(() => {
            input.val(1)
            player.speed(1)
        })

        $(".dplayer-setting-speed-item[data-speed='自定义']").on("click", () => {
            custombox.css("display") == "block" ? (custombox.hide(), player.setting.hide()) : custombox.show()
        }).prevAll().on("click", () => {
            custombox.hide()
        })

        player.template.mask.addEventListener("click", () => {
            custombox.hide()
        })
    }

    config.dPlayerLoop = function (player) {
        const { options: { contextmenu } } = player
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy()
    }

    config.dPlayerAutoMP = function (player) {
        let html = '<div class="dplayer-setting-item dplayer-setting-automp"><span class="dplayer-label">自动记忆播放</span><div class="dplayer-toggle"><input class="dplayer-toggle-setting-input dplayer-toggle-setting-input-automp" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label></div></div>'
        $(".dplayer-setting-origin-panel").append(html)
        localStorage.getItem("automp") && ($(".dplayer-toggle-setting-input-automp").get(0).checked = true)

        $(".dplayer-setting-automp").on("click", () => {
            let toggle = $(".dplayer-toggle-setting-input-automp")
            let checked = !toggle.is(":checked")
            toggle.get(0).checked = checked, localStorage.setItem("automp", Number(checked))
            player.template.settingBox.classList.remove("dplayer-setting-box-open")
            player.template.mask.classList.remove("dplayer-mask-show")
        })
    }

    config.dPlayerSelections = function (player) {
        let html = '<button class="dplayer-icon prev-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg></span></button>'
        html += '<button id="btn-select-episode" class="dplayer-icon dplayer-quality-icon"><span style="opacity: 0.8;font-weight: bold;">选集</span></button>'
        html += '<button class="dplayer-icon next-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg></span></button>'
        $(".dplayer-icons-right").prepend(html)

        let arr = [".prev-icon", ".next-icon", ".dplayer-quality-icon"]
        arr.forEach((icon) => {
            $(icon).mouseenter(() => {
                $(`${icon} span`).css("opacity", "1")
            })
            $(icon).mouseleave(() => {
                $(`${icon} span`).css("opacity", "0.8")
            })
        })
        $(".prev-icon").on("click", () => {
            toast("播放上集")
        })
        $(".next-icon").on("click", () => {
            toast("播放下集")
        })
    }

    config.dPlayerSetting = function (player) {
        $(document).keydown((event) => {
            var e = event || window.event
            var k = e.keyCode || e.which
            var localSpeed = Number(localStorage.getItem("dplayer-speed"))
            let arr = [70, 77, 83, 87, 188, 19, 219, 221]
            arr.forEach((n) => {
                if (k != n) {
                    e.stopPropagation()
                }
            })

            switch (k) {
                // 快捷键：F（切换全屏）
                case 70: player.fullScreen.toggle("browser")
                    break
                // 快捷键：M（开启/关闭静音）
                case 77: player.video.muted == true ? player.volume(player.volume()) : (player.video.muted = true, $(".dplayer-volume-bar-inner").css("width", "0%"), player.notice("静音"))
                    break
                // 快捷键：N（恢复正常 1x 倍速）
                case 78: player.speed(1)
                    break
                // 快捷键：S（搜索选集）
                case 83: toast("搜索选集")
                    break
                // 快捷键：W（切换网页全屏）
                case 87: player.fullScreen.toggle('web')
                    break
                // 快捷键：.<（播放上集）
                case 188: toast("播放上集")
                    break
                // 快捷键：,>（播放下集）
                case 190: toast("播放下集")
                    break
                // 快捷键：[{（减速播放）
                case 219: (localSpeed - 0.25 > 0) ? player.speed((localSpeed - 0.25).toFixed(2)) : player.speed(0.1)
                    break
                // 快捷键：]}（加速播放）
                case 221: (localSpeed + 0.25 < 16) ? player.speed((localSpeed + 0.25).toFixed(2)) : player.speed(16)
                    break
            }
            return false
        })
    }

})()
