// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.3.0
// @description  使用 DPlayer 来播放影片, 支持快捷键(W、F)全屏播放，支持显示标题和时间(时:分), 支持任意倍速调整(双击恢复正常), 支持热键操作(自行设置), 支持记忆、连续播放(未弄), 支持搜索选集(未弄)
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
// @grant        GM_addStyle
// ==/UserScript==


(function () {
    'use strict';

    const $ = window.jQuery;
    const config = {
        screenshot: true, // (类型: boolean) 默认显示截图按钮, 值为: true
        autoplay: true, // (类型: boolean) 默认自动播放视频, 值为: true
        volume: 1, // (类型: number) 默认音量: 100%, 值为: 1, 静音快捷键: M
        theme: "#f5f5f5", // (类型: string) 默认主题颜色: White Smoke, 值为: #f5f5f5
    }

    GM_addStyle(`.play-box-main [class*="-tip"],.play-box-main [id*="-tip"],.dplayer-menu .dplayer-menu-item:nth-last-child(1),.dplayer-menu .dplayer-menu-item:nth-last-child(2) {display: none !important;}`)

    function Toast(msg, duration) {
        var text = decodeURIComponent(encodeURIComponent(msg))
        var html = "<div id='dToast' style='opacity: 0.9;background-color: #222222;position: absolute; bottom: 50%; left: 50%;padding: 10px 20px;width: max-content;z-index: 999999;color: #f5f5f5;text-align: center;border-radius: 5px;transform: translate(-50%, -50%);pointer-events: all;font-size: 16px;font-weight: bold;box-sizing: border-box;'>" + text + "</div>"
        $("body").append(html);
        setTimeout(() => {
            $("#dToast").css({ "transition": "all 0.3s ease", "opacity": "0" })
            $("#dToast").remove()
        }, duration ? duration : 2e3);
        console.log(text)
    }

    config.dPlayerUrl = function () {
        var __url = window.location.href;
        var __xhr = new XMLHttpRequest();
        __xhr.open('GET', __url, true);
        __xhr.send();
        __xhr.onreadystatechange = function () {
            if (__xhr.readyState == 4 && __xhr.status == 200) {
                var __html = __xhr.responseText
                var __script = __html.match(/<script type="module">[\s\S]*<\/script>/)[0]
                var __src = __script.match(/(http|https):\/\/([\w.]+\/?)\S*?(\.m3u8)/)[0]
                if (__src == null || __src == undefined) {
                    sessionStorage.setItem("dplayer-url", "")
                    Toast("\u89C6\u9891\u94FE\u63A5\u83B7\u53D6\u5931\u8D25", 5e3)
                } else {
                    sessionStorage.setItem("dplayer-url", __src)
                    console.log(__src)
                }
            }
        }
    }

    config.dPlayerStart = function () {
        config.dPlayerUrl()
        var dPlayerSrc, dPlayerNode, videoNode = document.querySelector("#my-video")
        if (videoNode) {
            document.querySelector("#my-video_html5_api").remove()
            dPlayerNode = document.querySelector("#dplayer");
            dPlayerSrc = sessionStorage.getItem("dplayer-url")
            if (!dPlayerNode) {
                dPlayerNode = document.createElement("div");
                dPlayerNode.setAttribute("id", "dplayer");
                dPlayerNode.setAttribute("style", "width: 100%; height: 100%;");
                config.videoNode = videoNode.parentNode.replaceChild(dPlayerNode, videoNode);
            }
        }
        else {
            console.log("\u5C1D\u8BD5\u518D\u6B21\u83B7\u53D6\u64AD\u653E\u5668\u5BB9\u5668");
            return setTimeout(config.dPlayerStart, 500);
        }

        var options = {
            container: dPlayerNode,
            screenshot: config.screenshot,
            autoplay: config.autoplay,
            volume: config.volume,
            playbackSpeed: [0.25, 0.5, 1, 2, 3],
            video: {
                url: dPlayerSrc,
                type: 'hls',
            },
            /*
            subtitle: {
                url: '',
                type: 'webvtt',
            },
            */
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
            var player = new window.DPlayer(options);
            config.initPlayer(player)
            Toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u6210\u529F");
        } catch (error) {
            Toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u5931\u8D25");
            //player.destroy()
        }
    }
    config.dPlayerStart()

    config.initPlayer = function (player) {
        const { options: { contextmenu } } = player;
        GM_addStyle(`#video-loading-wrapper { display: none !important; }`)
        config.dPlayerTitle(player)
        config.dPlayerCustomSpeed(player)
        config.dPlayerSelections(player)
        config.dPlayerAutoMP(player)
        config.dPlayerSetting(player)
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();

    };

    config.dPlayerTitle = function (player) {
        const { options: { contextmenu } } = player;
        var playSeason = $(".play-box-side-header .detail-title a")
        var playEpisode = $(".play-box-side-main .episode-list .episode-item-active span")
        var playTitle = playSeason.text() + " (" + playEpisode.text() + ")"
        playSeason.text(playTitle)
        var html = `<div id="dplayer-title" class="dplayer-show-top" style="display: none;pointer-events: none;position: absolute;left: 33px;top: 22px;font-size: 32px;color: #F5F5F5;"><strong>` + playTitle + `</strong></div>`
        html += `<div id="dplayer-time" class="dplayer-show-top" style="display: none;pointer-events: none;position: absolute;right: 33px;top: 22px;font-size: 32px;color: #F5F5F5;"><strong>00:00</strong></div>`
        $(".dplayer-video-wrap").append(html)
        setInterval(() => {
            var nowDate = new Date()
            var nowHs = nowDate.getHours()
            var nowMs = nowDate.getMinutes()
            var nowtime = (nowHs > 9 ? nowHs : "0" + nowHs) + ":" + (nowMs > 9 ? nowMs : "0" + nowMs)
            $("#dplayer-time strong").text(nowtime)
        }, 1e3)
        var dplayerCT = $(".dplayer-show-top")
        var dplayer = $("#dplayer")
        var dTimer1, dTimer2;
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
            if (player.video.played.length && player.paused == false) {
                dplayerCT.show()
                dTimer2 = setTimeout(() => {
                    dplayerCT.hide()
                }, 3e3)
            }
        })
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();
    }

    config.dPlayerCustomSpeed = function (player) {
        const { options: { contextmenu } } = player;
        var localSpeed = localStorage.getItem("dplayer-speed");
        localSpeed && player.speed(localSpeed);
        $(".dplayer-setting-speed-panel").append('<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>');
        $(".dplayer-setting").append('<div class="dplayer-setting-custom-speed" title="双击恢复正常速度" style="display: none;right: 72px;position: absolute;bottom: 50px;width: 150px;border-radius: 2px;background: rgba(28,28,28,.9);padding: 7px 0;transition: all .3s ease-in-out;overflow: hidden;z-index: 2;"><div class="dplayer-speed-item" style="padding: 5px 10px;box-sizing: border-box;cursor: pointer;position: relative;"><span class="dplayer-speed-label" style="color: #eee;font-size: 13px;display: inline-block;vertical-align: middle;white-space: nowrap;">播放速度：</span><input type="text" style="width: 55px;height: 15px;top: 3px;font-size: 13px;border: 1px solid #fff;border-radius: 3px;text-align: center;" max="16" min="0.1" maxlength="6" placeholder="0.1~16"></div></div>');
        var custombox = $(".dplayer-setting-custom-speed");
        var input = $(".dplayer-setting-custom-speed input");
        input.val(localSpeed || 1);
        input.on("input propertychange", function (e) {
            var val = input.val();
            if (val != 0) {
                input.val(val)
                player.speed(val)
            }
        });
        player.on("ratechange", function () {
            const { video: { playbackRate, duration } } = player;
            player.notice("播放速度：" + playbackRate);
            localStorage.setItem("dplayer-speed", playbackRate);
            input.val(playbackRate);
            setTimeout(() => { config.appreciation(player) }, duration / 10 / playbackRate * 1e3);
        });
        $("#dplayer").dblclick(function () {
            input.val(1);
            player.speed(1);
        });
        $(".dplayer-setting-speed-item[data-speed='自定义']").on("click", function () {
            custombox.css("display") == "block" ? (custombox.css("display", "none"), player.setting.hide()) : custombox.css("display", "block")
        }).prevAll().on("click", function () {
            custombox.css("display", "none");
        });
        player.template.mask.addEventListener("click", function () {
            custombox.css("display", "none");
        });
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();
    };

    config.dPlayerLoop = function (player) {
        const { options: { contextmenu } } = player;
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();
    }

    config.dPlayerAutoMP = function (player) {
        const { options: { contextmenu } } = player;
        var html = '<div class="dplayer-setting-item dplayer-setting-automp"><span class="dplayer-label">自动记忆播放</span><div class="dplayer-toggle"><input class="dplayer-toggle-setting-input dplayer-toggle-setting-input-automp" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label></div></div>';
        $(".dplayer-setting-origin-panel").append(html);
        localStorage.getItem("automp") && ($(".dplayer-toggle-setting-input-automp").get(0).checked = true);
        $(".dplayer-setting-automp").on("click", function () {
            var toggle = $(".dplayer-toggle-setting-input-automp");
            var checked = !toggle.is(":checked");
            toggle.get(0).checked = checked, localStorage.setItem("automp", Number(checked))
            player.template.settingBox.classList.remove("dplayer-setting-box-open")
            player.template.mask.classList.remove("dplayer-mask-show")
        })
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();
    }

    config.dPlayerSelections = function (player) {
        const { options: { contextmenu } } = player;
        var html = '<button class="dplayer-icon prev-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg></span></button>';
        html += '<button id="btn-select-episode" class="dplayer-icon dplayer-quality-icon"><span style="opacity: 0.8;font-weight: bold;">选集</span></button>';
        html += '<button class="dplayer-icon next-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg></span></button>';
        $(".dplayer-icons-right").prepend(html);
        var charr = [".prev-icon", ".next-icon", ".dplayer-quality-icon"];
        charr.forEach(function (icon) {
            $(icon).mouseenter(function () {
                $(icon + " span").css("opacity", "1")
            })
            $(icon).mouseleave(function () {
                $(icon + " span").css("opacity", "0.8")
            })
            $(".prev-icon").on("click", () => {
                Toast("播放上一集")
            })
            $(".next-icon").on("click", () => {
                Toast("播放下一集")
            })
        })
        JSON.stringify(contextmenu).includes("geoi6sam1") || player.destroy();
    }

    config.dPlayerSetting = function (player) {
        $(document).keydown(function (event) {
            let e = event || window.event;
            let k = e.keyCode || e.which;
            if (k >= 112 && k <= 123) {
                e.stopNativePropagation();
            }
        });
        $(document).keydown(function (event) {
            let e = event || window.event;
            let k = e.keyCode || e.which;
            switch (k) {
                // 快捷键: F
                case 70: player.fullScreen.request('browser');
                    break;
                // 快捷键: M
                case 77: player.video.muted == true ? (player.video.muted = false, player.notice("恢复声音")) : (player.video.muted = true, player.notice("静音"))
                    break;
                // 快捷键: N
                case 78: Toast("播放下一集")
                    break;
                // 快捷键: P
                case 80: Toast("播放上一集")
                    break;
                // 快捷键: W
                case 87: player.fullScreen.request('web');
                    break;
            }
            return false;
        });
    }

})();
