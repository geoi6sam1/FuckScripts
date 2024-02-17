// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.6.0
// @description  使用DPlayer插件播放影片，支持转码mp4下载，支持搜索选集播放，支持记忆、连续播放，支持更多快捷键操作，支持显示标题和时间，支持任意倍速调整（0.1-16）
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

    const obj = {}
    const isMobile = /Mobile|Android|webOS|iPhone|iPad|Phone/i.test(navigator.userAgent)
    const $ = unsafeWindow.jQuery || window.jQuery
    const shortcutKey = [
        ["F", "切换全屏"],
        ["M", "开启/关闭静音"],
        ["N", "恢复正常 1x 倍速"],
        ["S", "搜索选集播放"],
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
        ["双击视频", "切换全屏"],
        ["长按视频", "临时 3x 倍速播放"],
    ]
    console.log("\n".concat(" %c 可可影视播放器 v", "0.5.2").concat(" %c https://github.com/geoi6sam1/FuckScripts ", "\n"), "color: #ffd700;background: #36282b;padding: 5px 0;", "background: #ffd700;padding: 5px 0;")
    console.table(shortcutKey)

    function toast(msg, type, dus, bgc) {
        var cText, text = decodeURIComponent(encodeURIComponent(msg))
        // 中国传统颜色：http://zhongguose.com
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
            default: bgc = "#36282b" // 苍蝇灰
                break
        }
        let html = `<div id='cToast' style='opacity: 0.9;background-color: ${bgc};position: absolute;bottom: 50%;left: 50%;padding: 10px 20px;width: max-content;z-index: 999999;color: #f5f5f5;text-align: center;border-radius: 5px;transform: translate(-50%, -50%);pointer-events: all;font-size: 16px;box-sizing: border-box;'>${text}</div>`
        $("body").append(html)
        setTimeout(() => {
            $("#cToast").css({ "transition": "all 0.3s ease", "opacity": "0" })
            $("#cToast").remove()
        }, dus ? dus : 2e3)
        console.log(cText)
    }

    obj.dPlayerGetUrl = function () {
        var lHref = window.location.href
        var xhr = new XMLHttpRequest()
        xhr.open('GET', lHref)
        xhr.send()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var html = xhr.responseText
                var script = html.match(/<script type="module">[\s\S]*<\/script>/)[0]
                var url = script.match(/(http|https):\/\/([\w.]+\/?)\S*?(\.m3u8)/)[0]
                if (url == null || url == undefined) {
                    console.log(xhr)
                } else {
                    obj.url = url
                    console.log(url)
                }
            }
        }
    }

    obj.dPlayerStart = function () {
        obj.dPlayerGetUrl()
        var container, videoNode = document.querySelector("#my-video")
        if (videoNode) {
            obj.dPlayerGetUrl()
            container = document.querySelector("#dplayer")
            if (!container) {
                container = document.createElement("div")
                container.setAttribute("id", "dplayer")
                container.setAttribute("style", "width: 100%;height: 100%;")
                videoNode.parentNode.replaceChild(container, videoNode)
            }
        }
        else {
            console.warn("\u5C1D\u8BD5\u518D\u6B21\u83B7\u53D6\u64AD\u653E\u5668\u5BB9\u5668")
            return setTimeout(obj.dPlayerStart, 500)
        }
        const options = {
            container: container,
            screenshot: true,
            autoplay: true,
            volume: 1,
            playbackSpeed: [0.25, 0.5, 1, 2, 3],
            video: {
                url: obj.url,
                type: "hls",
            },
            contextmenu: [
                {
                    text: "打赏脚本",
                    link: "http://mtw.so/5EDMgA",
                    click: () => { return false },
                },
                {
                    text: "问题反馈",
                    link: "http://mtw.so/69sMaz",
                    click: () => { return false },
                },
                {
                    text: "快捷键说明",
                    click: () => { isMobile ? player.notice("\u5F53\u524D\u8BBE\u5907\u4E0D\u652F\u6301\u5FEB\u6377\u952E") : $(".dplayer-hotkey-panel").show() },
                },
            ],
            theme: "#f5f5f5",
        }
        try {
            var player = new window.DPlayer(options)
            obj.initPlayer(player)
            toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u6210\u529F", "info")
        } catch (error) {
            toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u5931\u8D25", "error")
        }
    }

    obj.initPlayer = function (player) {
        const { options: { contextmenu } } = player
        player.pause()
        obj.longPressInit(player)
        obj.hotKeyPanel()
        isMobile || obj.dPlayerTitle(player)
        obj.dPlayerSelectEpisode(player)
        obj.dPlayerSelections(player)
        obj.dPlayerSetting(player)
        obj.dPlayerCustomSpeed(player)
        obj.dPlayerAutoMemoryPlay(player)
        obj.dPlayerLoop(player)
        if (isMobile) {
            var arr = [".download-icon", ".prev-icon", ".next-icon", ".btn-select-episode"]
            arr.forEach((icon) => {
                $(icon).hide()
            })
            player.on('fullscreen', () => {
                arr.forEach((icon) => {
                    $(icon).show()
                })
                screen.orientation.lock("landscape")
            })
            player.on('fullscreen_cancel', () => {
                arr.forEach((icon) => {
                    $(icon).hide()
                })
                screen.orientation.unlock()
            })
        }
        $("#dplayer video").dblclick(() => {
            player.fullScreen.toggle("browser")
        })
        JSON.stringify(contextmenu).includes("5EDMgA") || player.destroy()
        JSON.stringify(contextmenu).includes("69sMaz") || player.destroy()
        GM_addStyle(`
body {
    -webkit-font-smoothing: antialiased !important;
    -moz-font-smoothing: antialiased !important;
    font-smoothing: antialiased !important;
}

.mobile-download-popup,
#video-loading-wrapper,
[class*='install-tip'],
.dplayer-menu .dplayer-menu-item:nth-last-child(1),
.dplayer-menu .dplayer-menu-item:nth-last-child(2) {
    display: none !important;
}

.dplayer-episode-panel-input:hover {
    box-shadow: 0 0 0 2px #e2c027 inset;
}
`)
    }

    obj.hotKeyPanel = function () {
        let html = `<div class="dplayer-hotkey-panel" style="display: none;background-color: rgba(33,33,33,.9);border-radius: 5px;color: #f5f5f5;left: 50%;position: absolute;text-align: center;top: 50%;transform: translate(-50%,-50%);width: 400px;user-select: none;z-index: 10;">
    <div class="dplayer-hotkey-panel-title" style="border-bottom: 1px solid hsla(0,0%,100%,.1);font-size: 18px;line-height: 45px;text-align: center;"><strong>快捷键说明</strong>
        <span class="dplayer-hotkey-panel-close" style="fill: #f5f5f5;color: #f5f5f5;cursor: pointer;height: 24px;line-height: 24px;position: absolute;right: 12px;top: 12px;width: 22px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m8 6.939 3.182-3.182a.75.75 0 1 1 1.061 1.061L9.061 8l3.182 3.182a.75.75 0 1 1-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 1 1-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 1 1 1.061-1.061L8 6.939z"></path></svg>
        </span>
    </div>
    <div class="dplayer-hotkey-panel-area" style="margin: 10px 0;max-height: 300px;overflow: hidden auto;">
        <div class="dplayer-hotkey-panel-content" style="padding: 0 20px;transform: translate(0px, 0px) scale(1) translateZ(0px);"></div>
    </div>
</div>`
        $("#dplayer").append(html)
        shortcutKey.forEach((val) => {
            let html = `<div class="dplayer-hotkey-panel-content" style="padding: 0 20px;transform: translate(0px, 0px) scale(1) translateZ(0px);">
            <div class="dplayer-hotkey-panel-content-item" style="font-size: 14px;height: 28px;line-height: 28px;min-width: 360px;text-align: center;">
                <span class="dplayer-hotkey-panel-content-name" style="display: inline-block;width: 120px;">${val[0]}</span>
                <span class="dplayer-hotkey-panel-content-desc" style="color: #969696;display: inline-block;width: 190px;">${val[1]}</span>
            </div>
        </div>`
            $(".dplayer-hotkey-panel-area").append(html)

        })
        $(".dplayer-hotkey-panel-close").on("click", () => {
            $(".dplayer-hotkey-panel").hide()
        })
    }

    obj.dPlayerTitle = function (player) {
        var playSeason = $(".play-box-side-header .detail-title strong")
        var playEpisode = $(".episode-list .episode-item-active span")
        var playTitle = playSeason.text() + " (" + playEpisode.text() + ")"
        let html = `<div class="dplayer-controller-top" style="display: none;opacity: 0.9;text-align: center;position: absolute;top: 0px;left: 0;right: 0;color: #F5F5F5;transition: all 0.3s ease;pointer-events: none;">
            <span class="dplayer-title" style="position: absolute;top: 26px;left: 26px;font-size: 32px;"><strong>${playTitle}</strong></span>
            <span class="dplayer-time" style="position: absolute;top: 32px;right: 32px;font-size: 26px;"><strong>00:00</strong></span>
        </div>`
        $(".dplayer-video-wrap").append(html)
        setInterval(() => {
            let getDate = new Date()
            let hours = getDate.getHours()
            let minutes = getDate.getMinutes()
            let nowTime = (hours > 9 ? hours : "0" + hours) + ":" + (minutes > 9 ? minutes : "0" + minutes)
            $(".dplayer-time strong").text(nowTime)
        }, 1e3)
        var dplayerCT = $(".dplayer-controller-top")
        var autoHideTimer, autoHideCT = () => {
            !player.video.played.length || dplayerCT.show()
            clearTimeout(autoHideTimer)
            autoHideTimer = setTimeout(() => {
                !player.video.played.length || player.paused || dplayerCT.hide()
            }, 3e3)
        }
        $("#dplayer").on("mouseleave", () => {
            player.paused || dplayerCT.hide()
        })
        $("#dplayer").on("mousemove", autoHideCT)
        $("#dplayer").on("click", autoHideCT)
        player.on("play", autoHideCT)
        player.on("pause", autoHideCT)
    }

    obj.dPlayerCustomSpeed = function (player) {
        var localSpeed = localStorage.getItem("dplayer-speed")
        localSpeed ? player.speed(localSpeed) : localStorage.setItem("dplayer-speed", 1)
        $(".dplayer-setting-speed-panel").append(`<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>`)
        $(".dplayer-setting").append(`<div class="dplayer-setting-custom-speed" title="双击恢复正常" style="display: none;right: 72px;position: absolute;bottom: 50px;width: 150px;border-radius: 2px;background: rgba(28,28,28,.9);padding: 7px 0;transition: all .3s ease-in-out;overflow: hidden;z-index: 5;"><div class="dplayer-speed-item" style="padding: 5px 10px;box-sizing: border-box;cursor: pointer;position: relative;"><span class="dplayer-speed-label" style="color: #f5f5f5;font-size: 13px;display: inline-block;vertical-align: middle;white-space: nowrap;">播放倍速：<input type="text" style="width: 55px;height: 15px;top: 3px;font-size: 13px;color: #222;border: 1px solid #fff;border-radius: 3px;text-align: center;" maxlength="6" placeholder="0.1~16"> x</span></div></div>`)
        var custombox = $(".dplayer-setting-custom-speed")
        var input = $(".dplayer-setting-custom-speed input")
        input.val(localSpeed || 1)
        input.on("input propertychange", () => {
            var val = input.val()
            if (val > 0.0999) {
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
        $(".dplayer-setting-custom-speed").dblclick(() => {
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

    obj.dPlayerAutoMemoryPlay = function (player) {
        let html = `<div class="dplayer-setting-item dplayer-setting-automp">
    <span class="dplayer-label">自动记忆播放</span>
    <div class="dplayer-toggle">
        <input class="dplayer-toggle-setting-input" type="checkbox" name="dplayer-toggle">
        <label for="dplayer-toggle"></label>
    </div>
</div>`
        $(".dplayer-setting-origin-panel").append(html)
        var automp = localStorage.getItem("dplayer-automp")
        var memoryTime = localStorage.getItem(`tcplayer-lpt-${obj.url}`)
        automp || localStorage.setItem("dplayer-automp", 0)
        automp == 1 && ($(".dplayer-setting-automp input").get(0).checked = true)
        $(".dplayer-setting-automp").on("click", () => {
            let toggle = $(".dplayer-setting-automp input")
            let checked = !toggle.is(":checked")
            toggle.get(0).checked = checked, localStorage.setItem("dplayer-automp", Number(checked))
            player.template.settingBox.classList.remove("dplayer-setting-box-open")
            player.template.mask.classList.remove("dplayer-mask-show")
        })
        player.on("durationchange", () => {
            if (player.video.duration > 0) {
                if (memoryTime && parseInt(memoryTime)) {
                    var formatTime = formatVideoTime(memoryTime)
                    if (automp == 1) {
                        player.seek(memoryTime)
                        setTimeout(() => {
                            player.play()
                        }, 1.5e3)
                    } else {
                        let html = `<div class="memory-play-wrap" style="display: block;position: absolute;left: 30px;bottom: 60px;font-size: 16px;padding: 10px;border-radius: 3px;color: #f5f5f5;background-color: rgba(33, 33, 33, 0.9);z-index:50;">&nbsp;上次播放到：${formatTime}&nbsp;
    <a href="javascript:void(0);" class="play-jump" style="text-decoration: none;color: #2b73af;"><strong>点击跳转</strong></a>
     <span class="close-btn" style="display: inline-block;width: 16px;height: 16px;vertical-align: middle;cursor: pointer;fill: #f5f5f5;color: #f5f5f5;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m8 6.939 3.182-3.182a.75.75 0 1 1 1.061 1.061L9.061 8l3.182 3.182a.75.75 0 1 1-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 1 1-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 1 1 1.061-1.061L8 6.939z"></path></svg>
     </span>
</div>`
                        $(player.container).append(html)
                        var memoryTimeout = setTimeout(() => {
                            $(".memory-play-wrap").remove()
                            player.play()
                        }, 15e3)
                        $(".memory-play-wrap .close-btn").on("click", () => {
                            clearTimeout(memoryTimeout)
                            $(".memory-play-wrap").remove()
                            player.play()
                        })
                        $(".memory-play-wrap .play-jump").on("click", () => {
                            clearTimeout(memoryTimeout)
                            $(".memory-play-wrap").remove()
                            player.seek(memoryTime)
                            player.play()
                        })
                    }
                } else {
                    player.play()
                }
            }
        })
        obj.maskCurrentTime = function (player) {
            let currentTime = player.video.currentTime
            currentTime && localStorage.setItem(`tcplayer-lpt-${obj.url}`, Number(player.video.currentTime))
        }
        document.onvisibilitychange = function () {
            if (document.visibilityState === "hidden") {
                obj.maskCurrentTime(player)
            }
        }
        window.onbeforeunload = function () {
            obj.maskCurrentTime(player)
        }
        function formatVideoTime(seconds) {
            let secondTotal = Math.round(seconds)
                , hour = Math.floor(secondTotal / 3600)
                , minute = Math.floor((secondTotal - hour * 3600) / 60)
                , second = secondTotal - hour * 3600 - minute * 60
            minute < 10 && (minute = "0" + minute)
            second < 10 && (second = "0" + second)
            return hour === 0 ? minute + ":" + second : hour + ":" + minute + ":" + second
        }
    }

    obj.dPlayerSelections = function (player) {
        let html = `<button class="dplayer-icon download-icon">
    <span style="opacity: 0.8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39V184c0-13.3-10.7-24-24-24s-24 10.7-24 24V318.1l-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z"/></svg>
    </span>
</button>
<button class="dplayer-icon prev-icon">
    <span style="opacity: 0.8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg>
    </span>
</button>
<button class="dplayer-icon dplayer-quality-icon btn-select-episode">
    <span style="opacity: 0.8;font-weight: bold;">选集</span>
</button>
<button class="dplayer-icon next-icon">
    <span style="opacity: 0.8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg>
    </span>
</button>`
        $(".dplayer-icons-right").prepend(html)
        let arr = [".download-icon", ".prev-icon", ".next-icon", ".btn-select-episode"]
        arr.forEach((icon) => {
            $(icon).mouseenter(() => {
                $(`${icon} span`).css("opacity", "1")
            })
            $(icon).mouseleave(() => {
                $(`${icon} span`).css("opacity", "0.8")
            })
        })
        $(".download-icon").on("click", () => {
            window.open(`http://blog.luckly-mjw.cn/tool-show/m3u8-downloader/index.html?source=${obj.url}`, "_blank")
        })
        var episodeTotal = $(".episode-list:has(.episode-item-active) a").length
        var episodeNow = $("a.episode-item-active").attr("data-index")
        var episodeNext = Number(episodeNow) + 1
        var episodePrevious = Number(episodeNow) - 1
        let dingwei = document.querySelector(`.episode-list:has(.episode-item-active) a[data-index="${Number(episodeNow)}"]`)
        dingwei.scrollIntoView()
        document.querySelector("html").scrollIntoView(true)
        $(".prev-icon").on("click", () => {
            if (episodePrevious > 0) {
                let aPrev = $(`.episode-list:has(.episode-item-active) a[data-index="${episodePrevious}"]`).attr("href")
                window.open(aPrev, "_self")
            } else {
                player.notice("\u6CA1\u6709\u4E0A\u4E00\u96C6\u4E86")
            }
        })
        $(".next-icon").on("click", () => {
            if (episodeNext <= episodeTotal) {
                let aNext = $(`.episode-list:has(.episode-item-active) a[data-index="${episodeNext}"]`).attr("href")
                window.open(aNext, "_self")
            } else {
                player.notice("\u6CA1\u6709\u4E0B\u4E00\u96C6\u4E86")
            }
        })
        $(".btn-select-episode").on("click", () => {
            $(".dplayer-episode-panel").show()
        })
    }

    obj.dPlayerLoop = function (player) {
        let html = `<div class="dplayer-setting-item dplayer-setting-autonext">
    <span class="dplayer-label">自动播放下集</span>
    <div class="dplayer-toggle">
        <input class="dplayer-toggle-setting-input" type="checkbox" name="dplayer-toggle">
        <label for="dplayer-toggle"></label>
    </div>
</div>`
        $(".dplayer-setting-origin-panel").append(html)
        var autonext = localStorage.getItem("dplayer-autonext")
        autonext || localStorage.setItem("dplayer-autonext", 0)
        autonext == 1 && ($(".dplayer-setting-autonext input").get(0).checked = true)
        $(".dplayer-setting-autonext").on("click", () => {
            let toggle = $(".dplayer-setting-autonext input")
            let checked = !toggle.is(":checked")
            toggle.get(0).checked = checked, localStorage.setItem("dplayer-autonext", Number(checked))
            player.template.settingBox.classList.remove("dplayer-setting-box-open")
            player.template.mask.classList.remove("dplayer-mask-show")
        })
        player.on("ended", function () {
            var isNext = $(".dplayer-setting-autonext input").get(0).checked
            let isLoop = $(".dplayer-setting-loop input").get(0).checked
            isLoop == false || player.seek(0)
            isLoop == true || isNext == false || $(".next-icon").click()

        })
    }

    obj.dPlayerSelectEpisode = function (player) {
        var episodeTotal = $(".episode-list:has(.episode-item-active) a").length
        var episodeNow = $("a.episode-item-active").attr("data-index")
        let html = `<div class="dplayer-episode-panel" style="display: none;background-color: rgba(33,33,33,.9);border-radius: 5px;color: #f5f5f5;left: 50%;position: absolute;text-align: center;top: 50%;transform: translate(-50%,-50%);width: 400px;user-select: none;z-index: 20;">
    <div class="dplayer-episode-panel-title" style="border-bottom: 1px solid hsla(0,0%,100%,.1);font-size: 18px;line-height: 45px;text-align: center;"><strong>搜索选集播放</strong>
    <span class="dplayer-episode-panel-close" style="fill: #f5f5f5;color: #f5f5f5;cursor: pointer;height: 24px;line-height: 24px;position: absolute;right: 12px;top: 12px;width: 22px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m8 6.939 3.182-3.182a.75.75 0 1 1 1.061 1.061L9.061 8l3.182 3.182a.75.75 0 1 1-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 1 1-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 1 1 1.061-1.061L8 6.939z"></path></svg>
    </span>
    </div>
    <div class="dplayer-episode-panel-area" style="margin: 10px 10px 10px;max-height: 300px;overflow: hidden auto;display: flex;flex-wrap: wrap;">
        <div class="dplayer-episode-panel-input" style="display: inline-flex;flex-grow: 1;align-items: center;justify-content: center;padding: 1px 11px;background-color: #f5f5f5;border-radius: 5px;cursor: text;transform: translateZ(0);border-top-right-radius: 0;border-bottom-right-radius: 0;">
            <input type="number" placeholder="当前播放第 ${Number(episodeNow)} 集，共 ${Number(episodeTotal)} 集" max="${Number(episodeTotal)}" min="1" step="1" style="flex-grow: 1;color: #36282b;font-size: 16px;height: 32px;line-height: 32px;padding: 0;outline: none;border: none;background: none;box-sizing: border-box;">
        </div>
        <div class="dplayer-episode-panel-button" style="height: 34px;font-weight: bold;background-color: #e2c027;color: #36282b;position: relative;display: inline-flex;align-items: center;justify-content: center;border-radius: 5px;padding: 0 20px;white-space: nowrap;cursor: pointer;border-left: 0;border-top-left-radius: 0;border-bottom-left-radius: 0;">播放</div>
    </div>
</div>`
        $("#dplayer").append(html)
        $(".dplayer-episode-panel-button").on("click", () => {
            var episodeNew = $(".dplayer-episode-panel-input input").val()
            if (episodeNew) {
                if (episodeNew > 0 && episodeNew <= episodeTotal) {
                    let eNew = $(`.episode-list:has(.episode-item-active) a[data-index="${episodeNew}"]`).attr("href")
                    window.open(eNew, "_self")
                } else {
                    player.notice("没有这一集，请重新输入")
                }
            } else {
                player.notice("请输入播放集数")
            }
        })
        $(".dplayer-episode-panel-close").on("click", () => {
            $(".dplayer-episode-panel").hide()
        })
    }

    obj.dPlayerSetting = function (player) {
        window.addEventListener("keydown", (event) => {
            var e = event || window.event
            var k = e.keyCode || e.which
            var localSpeed = Number(localStorage.getItem("dplayer-speed"))
            let arr = [70, 77, 83, 84, 87, 188, 19, 219, 221]
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
                case 77: player.video.muted == true ? player.volume(player.volume()) : (player.video.muted = true, document.querySelector(".dplayer-volume-bar-inner").style.width = "0%", player.notice("静音"))
                    break
                // 快捷键：N（恢复正常 1x 倍速）
                case 78: player.speed(1)
                    break
                // 快捷键：S（搜索选集播放）
                case 83:
                    let dep = document.querySelector(".dplayer-episode-panel")
                    dep.style.display == "none" ? dep.style.display = "block" : dep.style.display = "none"
                    break
                // 快捷键：W（切换网页全屏）
                case 87: player.fullScreen.toggle('web')
                    break
                // 快捷键：.<（播放上集）
                case 188: document.querySelector(".prev-icon").click()
                    break
                // 快捷键：,>（播放下集）
                case 190: document.querySelector(".next-icon").click()
                    break
                // 快捷键：[{（减速播放）
                case 219: (localSpeed - 0.25 > 0) ? player.speed((localSpeed - 0.25).toFixed(2)) : player.speed(0.1)
                    break
                // 快捷键：]}（加速播放）
                case 221: (localSpeed + 0.25 < 16) ? player.speed((localSpeed + 0.25).toFixed(2)) : player.speed(16)
                    break
            }
        })
    }

    obj.longPressInit = function (player) {
        const { video, videoWrap } = player.template
        let isDroging = false, isLongPress = false, timer = 0, speed = 1
        const onMouseDown = () => {
            timer = setTimeout(() => {
                isLongPress = true
                speed = video.playbackRate
                player.speed(speed * 3)
            }, 1000)
        }
        const onMouseUp = () => {
            clearTimeout(timer)
            setTimeout(() => {
                if (isLongPress) {
                    isLongPress = false
                    player.speed(speed)
                    player.play()
                }
            })
        }
        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                isDroging = true
                speed = video.playbackRate
                timer = setInterval(() => {
                    isLongPress = true
                    player.speed(speed * 3)
                    player.contextmenu.hide()
                }, 1e3)
            }
        }
        const onTouchMove = (event) => {
            if (event.touches.length === 1 && isDroging) {
                clearInterval(timer)
                setTimeout(() => {
                    if (isLongPress) {
                        isLongPress = false
                        player.speed(speed)
                        player.play()
                    }
                })
            }
        }
        const onTouchEnd = () => {
            if (isDroging) {
                clearInterval(timer)
                setTimeout(() => {
                    if (isLongPress) {
                        isLongPress = false
                        player.speed(speed)
                        player.play()
                    }
                })
            }
        }
        videoWrap.addEventListener('touchstart', onTouchStart)
        videoWrap.addEventListener('touchmove', onTouchMove)
        videoWrap.addEventListener('touchend', onTouchEnd)
        videoWrap.addEventListener('mousedown', onMouseDown)
        videoWrap.addEventListener('mouseup', onMouseUp)
    }

    if (window.DPlayer) return obj.dPlayerStart()

})()
