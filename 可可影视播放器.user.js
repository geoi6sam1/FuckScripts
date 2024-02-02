// ==UserScript==
// @name         可可影视播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.2.0
// @description  使用 DPlayer 来播放影片, 支持任意倍速调整, 支持热键操作(未弄), 支持记忆、连续播放(未弄), 支持搜索选集(未弄)
// @author       geoi6sam1
// @match        http*://*.keke*.com/play/*
// @match        http*://*.keke*.app/play/*
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
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
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

    unsafeWindow.GM_addStyle = GM_addStyle
    unsafeWindow.GM_getValue = GM_getValue
    unsafeWindow.GM_setValue = GM_setValue
    unsafeWindow.GM_deleteValue = GM_deleteValue

    var obj = {
        histories: GM_getValue('histories', []),
    }

    GM_addStyle(`#video-loading-wrapper, .dplayer-menu .dplayer-menu-item:nth-last-child(1), .dplayer-menu .dplayer-menu-item:nth-last-child(2) { display: none !important; }`)

    let originalAddEventListener = EventTarget.prototype.addEventListener;
    let hookAddEventListener = function (...args) {
        if (args[0] != "keydown" && args[0] != "keyup" && args[0] != "keypress") {
            return originalAddEventListener.apply(this, args);
        }
    }

    /*
        EventTarget.prototype.addEventListener = hookAddEventListener;
        document.addEventListener = hookAddEventListener;
        document.documentElement.addEventListener = hookAddEventListener;
    */

    obj.hGetUrl = function () {
        var __url = window.location.href;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', __url);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var __html = xhr.responseText
                var __script = __html.match(/<script type="module">[\s\S]*<\/script>/)[0]
                var __hls = __script.match(/(http|https):\/\/([\w.]+\/?)\S*?(\.m3u8)/)[0]
                GM_setValue("dplayer-url", __hls)
            }
        };
    }

    obj.cLog = function (msg) {
        console.log(decodeURIComponent(encodeURIComponent(msg)))
    }

    obj.dPlayerStart = function () {
        obj.hGetUrl()
        var hls, dPlayerNode, videoNode = document.querySelector("#my-video")
        if (videoNode) {
            hls = GM_getValue("dplayer-url")
            dPlayerNode = document.querySelector("#dplayer");
            if (!dPlayerNode) {
                dPlayerNode = document.createElement("div");
                dPlayerNode.setAttribute("id", "dplayer");
                dPlayerNode.setAttribute("style", "width: 100%; height: 100%;");
                obj.videoNode = videoNode.parentNode.replaceChild(dPlayerNode, videoNode);
            }
        }
        else {
            obj.cLog("\u5C1D\u8BD5\u518D\u6B21\u83B7\u53D6\u64AD\u653E\u5668\u5BB9\u5668");
            return setTimeout(obj.dPlayerStart, 500);
        }

        var options = {
            container: dPlayerNode,
            screenshot: true,
            autoplay: true,
            hotkey: true,
            preload: 'auto',
            volume: 1.0,
            playbackSpeed: [0.1, 0.5, 0.75, 1, 1.5, 2, 3],
            video: {
                url: hls,
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
                    text: "脚本问题反馈",
                    link: "https://github.com/geoi6sam1/FuckScripts",
                }
            ],
            theme: '#F5F5F5',
        }

        try {
            var player = new window.DPlayer(options);
            obj.cLog("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u6210\u529F");
        } catch (error) {
            obj.cLog("\u0044\u0050\u006C\u0061\u0079\u0065\u0072\u0020\u64AD\u653E\u5668\u521B\u5EFA\u5931\u8D25");
            //player.destroy()
        }

    }

    obj.dPlayerStart()

})();
