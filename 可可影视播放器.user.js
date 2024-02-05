// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.2.2
// @description  使用 DPlayer 来播放影片, 支持任意倍速调整(双击恢复正常速度), 支持热键操作(未弄), 支持记忆、连续播放(未弄), 支持搜索选集(未弄)
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

    function Toast(msg, duration) {
        let d = document.createElement("div");
        let text = decodeURIComponent(encodeURIComponent(msg))
        d.style.cssText = `background-color: rgba(18, 18, 18, .9);bottom: 0.9em;left: 50%;position: fixed;padding:10px 15px;z-index: 99999;width: 250px;max-height: 70%;overflow: auto; color: #F5F5F5;word-break: break-all;text-align: center;border-radius: 5px;transform: translate(-50%, -50%);pointer-events: all;font-size: 14px;line-height: 1.5;box-sizing: border-box;`;
        d.innerHTML = text;
        document.body.appendChild(d);
        setTimeout(() => {
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
                sessionStorage.setItem("dplayer-url", __src)
                console.log(__src, 1000)
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
            playbackSpeed: [0.1, 0.5, 1, 2, 3],
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
                    text: "问题反馈",
                    link: "https://github.com/geoi6sam1/FuckScripts/issues",
                }
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

    obj.initPlayer = function (player) {
        var $ = obj.getJquery();
        $("#video-loading-wrapper").css("display", "none");
        $(".dplayer-menu .dplayer-menu-item:nth-last-child(1)").css("display", "none");
        $(".dplayer-menu .dplayer-menu-item:nth-last-child(2)").css("display", "none");
        obj.dPlayerCustomSpeed(player);
    };

    obj.dPlayerCustomSpeed = function (player) {
        var $ = obj.getJquery();
        var localSpeed = localStorage.getItem("dplayer-speed");
        localSpeed && player.speed(localSpeed);
        $(".dplayer-setting-speed-panel").append('<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>');
        $(".dplayer-setting").append('<div class="dplayer-setting-custom-speed" title="双击恢复正常速度" style="display: none;right: 72px;position: absolute;bottom: 50px;width: 150px;border-radius: 2px;background: rgba(28,28,28,.9);padding: 7px 0;transition: all .3s ease-in-out;overflow: hidden;z-index: 2;"><div class="dplayer-speed-item" style="padding: 5px 10px;box-sizing: border-box;cursor: pointer;position: relative;"><span class="dplayer-speed-label" style="color: #eee;font-size: 13px;display: inline-block;vertical-align: middle;white-space: nowrap;">播放速度：</span><input type="text" style="width: 55px;height: 15px;top: 3px;font-size: 13px;border: 1px solid #fff;border-radius: 3px;text-align: center;" max="16" min=".1" maxlength="6" placeholder="0.1~16"></div></div>');
        var custombox = $(".dplayer-setting-custom-speed");
        var input = $(".dplayer-setting-custom-speed input");
        input.val(localSpeed || 1);
        input.on("input propertychange", function (e) {
            var val = input.val();
            val == 0 ? val = 1 : (input.val(val), player.speed(val))
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

    obj.dPlayerStart()

})();
