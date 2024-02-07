// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.2.2
// @description  使用 DPlayer 来播放影片, 支持显示标题和时间, 支持任意倍速调整(双击恢复正常速度), 支持热键操作(未弄), 支持记忆、连续播放(未弄), 支持搜索选集(未弄)
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
    'use strict';

    /*
        Function.prototype.__constructor_back = Function.prototype.constructor;
        Function.prototype.constructor = function () {
            if (arguments && typeof arguments[0] === 'string') {
                if ("debugger" === arguments[0]) {
                    return
                }
            }
            return Function.prototype.__constructor_back.apply(this, arguments);
        }
    */

    var obj = {
        dpAutoMemory: true,
    }

    /*
        let originalAddEventListener = EventTarget.prototype.addEventListener;
        let hookAddEventListener = function (...args) {
            if (args[0] != "keydown" && args[0] != "keyup" && args[0] != "keypress") {
                return originalAddEventListener.apply(this, args);
            }
        }
    
        EventTarget.prototype.addEventListener = hookAddEventListener;
        document.addEventListener = hookAddEventListener;
        document.documentElement.addEventListener = hookAddEventListener;
    */

    unsafeWindow.GM_addStyle = GM_addStyle
    GM_addStyle(`#my-video,.play-box-main [class*="tip"],.play-box-main [id*="tip"],.play-box-main .video-animation,.dplayer-menu .dplayer-menu-item:nth-last-child(1),.dplayer-menu .dplayer-menu-item:nth-last-child(2) {display: none !important;}`)

    function Toast(msg, duration) {
        let d = document.createElement("div");
        let text = decodeURIComponent(encodeURIComponent(msg))
        d.style.cssText = `background-color: rgba(18, 18, 18, .9);bottom: 0.9em;left: 50%;position: fixed;padding:10px 15px;z-index: 999999;width: 250px;max-height: 70%;overflow: auto; color: #F5F5F5;word-break: break-all;text-align: center;border-radius: 5px;transform: translate(-50%, -50%);pointer-events: all;font-size: 16px;line-height: 1.5;box-sizing: border-box;`;
        d.innerHTML = text;
        document.body.appendChild(d);
        setTimeout(() => {
            d.style.transition = "all 0.3s ease"
            d.style.opacity = "0"
            d.remove()
        }, duration ? duration : 2000);
        console.log(text)
    }

    obj.getJquery = function () {
        return unsafeWindow.jQuery || window.jQuery;
    };

    obj.dPlayerUrl = function () {
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
                    Toast("\u89C6\u9891\u94FE\u63A5\u83B7\u53D6\u5931\u8D25", 5000)
                } else {
                    sessionStorage.setItem("dplayer-url", __src)
                    console.log(__src)
                }
            }
        }
    }

    obj.dPlayerStart = function () {
        obj.dPlayerUrl()
        var dPlayerSrc, dPlayerNode, videoNode = document.querySelector("#my-video")
        if (videoNode) {
            dPlayerSrc = sessionStorage.getItem("dplayer-url")
            dPlayerNode = document.querySelector("#dplayer");
            if (!dPlayerNode) {
                dPlayerNode = document.createElement("div");
                dPlayerNode.setAttribute("id", "dplayer");
                dPlayerNode.setAttribute("style", "width: 100%; height: 100%;");
                obj.videoNode = videoNode.parentNode.replaceChild(dPlayerNode, videoNode);
            }
        }
        else {
            console.log("\u5C1D\u8BD5\u518D\u6B21\u83B7\u53D6\u64AD\u653E\u5668\u5BB9\u5668");
            return setTimeout(obj.dPlayerStart, 500);
        }

        var options = {
            container: dPlayerNode,
            screenshot: true,
            autoplay: true,
            hotkey: true,
            volume: 1.0,
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
            theme: '#F5F5F5',
        }
        try {
            var player = new window.DPlayer(options);
            obj.initPlayer(player)
            Toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u6210\u529F");
        } catch (error) {
            Toast("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u5931\u8D25");
            //player.destroy()
        }
    }
    obj.dPlayerStart()

    obj.initPlayer = function (player) {
        GM_addStyle(`#video-loading-wrapper { display: none !important; }`)
        obj.dPlayerTitle(player)
        obj.dPlayerCustomSpeed(player)
        obj.dPlayerSelections(player)
        obj.dPlayerAutoMP(player)
    };

    obj.dPlayerTitle = function (player) {
        var $ = obj.getJquery();
        var playSeason = $(".play-box-side-header .detail-title a")
        var playEpisode = $(".play-box-side-main .episode-list .episode-item-active span")
        var playTitle = playSeason.text() + " (" + playEpisode.text() + ")"
        playSeason.text(playTitle)
        var nowdate = new Date()
        var nowtime = nowdate.getHours() + ":" + nowdate.getSeconds()
        var html = "<div class='dplayer-show-top dplayer-title' style='display: none;pointer-events: none;position: absolute;left: 40px;top: 20px;font-size: 30px;color: #F5F5F5;'><strong>" + playTitle + "</strong></div>"
        html += "<div class='dplayer-show-top dplayer-time' style='display: none;pointer-events: none;position: absolute;right: 40px;top: 20px;font-size: 30px;color: #F5F5F5;'><strong>" + nowtime + "</strong></div>"
        $(".dplayer-video-wrap").append(html)
        player.on('pause', function (e) {
            $(".dplayer-show-top").css("display", "block")
        })
        player.on('play', function (e) {
            $('#dplayer').mouseenter(function () {
                $(".dplayer-show-top").css("display", "block")
            })
            $('#dplayer').mouseleave(function () {
                $(".dplayer-show-top").css("display", "none")
            })
            var dtimer;
            $("#dplayer").mousemove(function () {
                clearTimeout(dtimer);
                $(".dplayer-show-top").css("display", "block")
                dtimer = setTimeout(function () {
                    $(".dplayer-show-top").css("display", "none")
                }, 3000);
            })
        })
    }

    obj.dPlayerCustomSpeed = function (player) {
        var $ = obj.getJquery();
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
            setTimeout(() => { obj.appreciation(player) }, duration / 10 / playbackRate * 1000);
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
    };

    obj.dPlayerAutoMP = function (player) {
        var $ = obj.getJquery();
        var html = '<div class="dplayer-setting-item dplayer-setting-automp"><span class="dplayer-label">自动记忆播放</span><div class="dplayer-toggle"><input class="dplayer-toggle-setting-input dplayer-toggle-setting-input-automp" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label></div></div>';
        $(".dplayer-setting-origin-panel").append(html);
        localStorage.getItem("automp") && ($(".dplayer-toggle-setting-input-automp").get(0).checked = true);
        $(".dplayer-setting-automp").on("click", function () {
            var toggle = $(".dplayer-toggle-setting-input-automp");
            var checked = !toggle.is(":checked");
            toggle.get(0).checked = checked, localStorage.setItem("automp", Number(checked))
        });
    }

    obj.dPlayerSelections = function (player) {
        var $ = obj.getJquery();
        var html = '<button class="dplayer-icon prev-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg></span></button>';
        html += '<button id="btn-select-episode" class="dplayer-icon dplayer-quality-icon"><span style="opacity: 0.8;">选集</span></button>';
        html += '<button class="dplayer-icon next-icon"><span style="opacity: 0.8;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg></span></button>';
        $(".dplayer-icons-right").prepend(html);
        $('.prev-icon span').mouseenter(function () {
            $(".prev-icon span").css("opacity", "1")
        })
        $('.prev-icon span').mouseleave(function () {
            $(".prev-icon span").css("opacity", "0.8")
        })
        $('.next-icon span').mouseenter(function () {
            $(".next-icon span").css("opacity", "1")
        })
        $('.next-icon span').mouseleave(function () {
            $(".next-icon span").css("opacity", "0.8")
        })
        $('.dplayer-quality-icon span').mouseenter(function () {
            $(".dplayer-quality-icon span").css("opacity", "1")
            $(".dplayer-quality-icon span").css("font-weight", "bold")
        })
        $('.dplayer-quality-icon span').mouseleave(function () {
            $(".dplayer-quality-icon span").css("opacity", "0.8")
            $(".dplayer-quality-icon span").css("font-weight", "normal")
        })
    }

    obj.dPlayerSetting = function (player) { }

})();
