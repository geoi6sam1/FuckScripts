// ==UserScript==
// @name         百度网盘DPlayer播放器
// @namespace    https://github.com/geoi6sam1
// @version      0.8.0
// @description  支持任意倍速调整，支持热键操作，支持记忆、连续播放，支持自由选集，支持画面模式调节，支持自动、手动添加字幕。
// @author       geoi6sam1
// @match        https://yun.baidu.com/s/*
// @match        https://pan.baidu.com/s/*
// @match        https://pan.baidu.com/*video*
// @match        https://pan.baidu.com/*streampage*
// @exclude      https://pan.baidu.com/aipan/search*
// @connect      *
// @connect      pan.baidu.com
// @require      https://scriptcat.org/lib/637/1.3.3/ajaxHooker.js
// @require      https://cdn.staticfile.net/hls.js/1.5.1/hls.min.js
// @require      https://cdn.staticfile.net/jquery/3.7.1/jquery.min.js
// @require      https://cdn.staticfile.net/dplayer/1.27.1/DPlayer.min.js
// @require      https://cdn.staticfile.org/localforage/1.10.0/localforage.min.js
// @icon         https://api.iowen.cn/favicon/pan.baidu.com.png
// @run-at       document-start
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==


(function () {
    'use strict';

    GM_getValue("pnum") ? GM_deleteValue("pnum") : console.log("不存在pnum")
    GM_getValue(GM_info.script.version) ? GM_deleteValue(GM_info.script.version) : console.log("不存在version")
    GM_addStyle(`.dplayer-setting-item.dplayer-setting-loop,.vp-vip-guide,.vp-vip-pri,.ai-draft__filter,.ai-draft__svip-guide { display: none !important; } .toast-wrap {top: 5rem !important; bottom: unset !important; width: 20rem !important;}`)

    var localforage = window.localforage;
    var obj = {
        video_page: {
            info: [],
            quality: [],
            categorylist: [],
            sub_info: [],
            adToken: "",
            flag: ""
        }
    };

    obj.storageFileListSharePage = function () {
        try {
            var currentList = obj.require('system-core:context/context.js').instanceForSystem.list.getCurrentList();
            if (currentList.length) {
                window.sessionStorage.setItem("sharePageFileList", JSON.stringify(currentList));
            }
            else {
                setTimeout(obj.storageFileListSharePage, 500);
            }
        }
        catch (error) { };
        window.onhashchange = function (e) {
            setTimeout(obj.storageFileListSharePage, 500);
        };
        document.querySelector(".fufHyA") && [...document.querySelectorAll(".fufHyA")].forEach(element => {
            element.onclick = function () {
                setTimeout(obj.storageFileListSharePage, 500);
            };
        });
    };

    obj.fileForcePreviewSharePage = function () {
        obj.getJquery()(document).on("click", "#shareqr dd", function (event) {
            try {
                var selectedFile = obj.require('system-core:context/context.js').instanceForSystem.list.getSelected()
                    , file = selectedFile[0];
                if (file.category == 1) {
                    var ext = file.server_filename.split(".").pop();
                    if (["ts"].includes(ext)) {
                        window.open("https://pan.baidu.com" + location.pathname + "?fid=" + file.fs_id, "_blank");
                    }
                }
            } catch (error) { }
        });
    };

    obj.playSharePage = function () {
        unsafeWindow.locals.get("file_list", "sign", "timestamp", "share_uk", "shareid", function (file_list, sign, timestamp, share_uk, shareid) {
            if (file_list.length > 1 || file_list[0].mediaType != "video") {
                obj.storageFileListSharePage();
                obj.fileForcePreviewSharePage();
                return;
            }
            obj.startObj((obj) => {
                var [file] = obj.video_page.info = file_list, resolution = file.resolution, fid = file.fs_id;
                function getUrl(i) {
                    return location.protocol + "//" + location.host + "/share/streaming?channel=chunlei&uk=" + share_uk + "&fid=" + fid + "&sign=" + sign + "&timestamp=" + timestamp + "&shareid=" + shareid + "&type=" + i + "&vip=2" + "&jsToken=" + unsafeWindow.jsToken
                }
                obj.getAdToken(getUrl("M3U8_AUTO_480"), function () {
                    obj.addQuality(getUrl, resolution);
                    obj.useDPlayer();
                });
            });
        });
    };

    obj.playHomePage = function () {
        obj.getJquery()(document).ajaxComplete(function (event, xhr, options) {
            var requestUrl = options.url;
            if (requestUrl.indexOf("/api/categorylist") >= 0) {
            }
            else if (requestUrl.indexOf("/api/filemetas") >= 0) {
                var response = xhr.responseJSON;
                if (response && response.info) {
                    obj.startObj((obj) => {
                        var [file] = obj.video_page.info = response.info;
                        function getUrl(i) {
                            if (i.includes(1080)) vip > 1 || (i = i.replace(1080));
                            return location.protocol + "//" + location.host + "/api/streaming?path=" + encodeURIComponent(file.path) + "&app_id=250528&clienttype=0&channel=chunlei&web=1&type=" + i + "&vip=2" + "&jsToken=" + unsafeWindow.jsToken
                        }
                        obj.getAdToken(getUrl("M3U8_AUTO_480"), function () {
                            obj.addQuality(getUrl, file.resolution);
                            obj.useDPlayer();
                        });
                    });
                }
            }
        });
    };

    obj.playPfilePage = function () {
        var open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener("load", function (event) {
                if (this.readyState == 4 && this.status == 200) {
                    var responseURL = this.responseURL;
                    if (responseURL.indexOf("/api/filemetas") > 0) {
                        var response = JSON.parse(this.response);
                        if (response.errno == 0 && Array.isArray(response.info) && response.info.length) {
                            if (response.info.length == 1 && obj.video_page.info.length == 0) {
                                obj.startObj((obj) => {
                                    var [file] = obj.video_page.info = response.info;
                                    function getUrl(i) {
                                        if (i.includes(1080)) vip > 1 || (i = i.replace(1080));
                                        return location.protocol + "//" + location.host + "/api/streaming?path=" + encodeURIComponent(file.path) + "&app_id=250528&clienttype=0&channel=chunlei&web=1&type=" + i + "&vip=2" + "&jsToken=" + unsafeWindow.jsToken
                                    }
                                    obj.getAdToken(getUrl("M3U8_AUTO_480"), function () {
                                        obj.addQuality(getUrl, file.resolution);
                                        obj.useDPlayer();
                                    });
                                });
                            }
                            else {
                                obj.video_page.categorylist = response.info;
                            }
                        }
                    }
                }
            }, false);
            open.apply(this, arguments);
        };
    };

    obj.playStreamPage = function () {
        obj.getJquery()(document).ajaxComplete(function (event, xhr, options) {
            var requestUrl = options.url;
            if (requestUrl.indexOf("/mbox/msg/mediainfo") >= 0) {
                var response = xhr.responseJSON;
                if (response && response.info) {
                    obj.startObj((obj) => {
                        obj.video_page.adToken = response.adToken;
                        var getParam = obj.require("base:widget/tools/service/tools.url.js").getParam;
                        var [file] = obj.video_page.info = [{
                            from_uk: getParam("from_uk"),
                            to: getParam("to"),
                            fs_id: getParam("fs_id"),
                            name: getParam("name") || "",
                            type: getParam("type"),
                            md5: getParam("md5"),
                            msg_id: getParam("msg_id"),
                            path: decodeURIComponent(decodeURIComponent(getParam("path")))
                        }];
                        function getUrl(i) {
                            return location.protocol + "//" + location.host + "/mbox/msg/streaming?from_uk=" + file.from_uk + "&to=" + file.to + "&msg_id=" + file.msg_id + "&fs_id=" + file.fs_id + "&type=" + file.type + "&stream_type=" + i;
                        }
                        obj.getAdToken(getUrl("M3U8_AUTO_480"), function () {
                            obj.addQuality(getUrl, response.info.resolution);
                            obj.useDPlayer();
                        });
                    });
                }
            }
        });
    };

    obj.getAdToken = function (url, callback) {
        var adToken = obj.video_page.flag === "pfilevideo" ? "" : obj.require("file-widget-1:videoPlay/Werbung/WerbungConfig.js").getAdToken();
        if (obj.video_page.adToken || (obj.video_page.adToken = adToken)) {
            return callback && callback();
        }
        var jQuery = obj.getJquery();
        jQuery.ajax({
            url: url,
        }).done(function (n) {
            if (133 === n.errno && 0 !== n.adTime) {
                obj.video_page.adToken = n.adToken;
            }
            callback && callback(obj.correct());
        }).fail(function (n) {
            var t = jQuery.parseJSON(n.responseText);
            if (t && 133 === t.errno && 0 !== t.adTime) {
                obj.video_page.adToken = t.adToken;
            }
            callback && callback(obj.correct());
        });
    };

    obj.getPoster = function () {
        var file = obj.video_page.info.length ? obj.video_page.info[0] : "";
        if (file && file.thumbs) {
            return Object.values(file.thumbs).pop();
        }
        return "";
    };

    obj.addQuality = function (getUrl, resolution) {
        var r = {
            1080: "1080P 超清",
            720: "720P 高清",
            480: "480P 流畅",
            360: "360P 省流"
        };
        var freeList = obj.freeList(resolution);
        obj.startObj.toString().includes("GM") && freeList.forEach(function (a, index) {
            obj.video_page.quality.push({
                name: r[a],
                url: getUrl("M3U8_AUTO_" + a) + "&clienttype=0&channel=chunlei&web=1&check_blue=1&adToken=" + encodeURIComponent(obj.video_page.adToken ? obj.video_page.adToken : ""),
                type: "hls"
            });
        });
    };

    obj.freeList = function (e) {
        e = e || "";
        var t = [720, 480, 360]
            , a = obj.correct.toString().length == 1003 ? e.match(/width:(\d+),height:(\d+)/) : ["", "", ""]
            , i = +a[1] * +a[2];
        return i ? (i > 921600 && t.unshift(1080), t) : t
    };

    obj.useDPlayer = function () {
        if (window.DPlayer) return obj.dPlayerStart();
    };

    obj.dPlayerStart = function () {
        var dPlayerNode, videoNode = document.querySelector("#video-wrap") || document.querySelector(".vp-video__player");
        if (videoNode) {
            dPlayerNode = document.querySelector("#dplayer");
            if (!dPlayerNode) {
                dPlayerNode = document.createElement("div");
                dPlayerNode.setAttribute("id", "dplayer");
                dPlayerNode.setAttribute("style", "width: 100%; height: 100%;");
                obj.videoNode = videoNode.parentNode.replaceChild(dPlayerNode, videoNode);
            }
        }
        else {
            console.warn("尝试再次获取播放器容器");
            return setTimeout(obj.dPlayerStart, 500);
        }
        var quality = obj.video_page.quality, defaultQuality = quality.findIndex(function (item) {
            return item.name == localStorage.getItem("dplayer-quality");
        });
        var options = {
            container: dPlayerNode,
            video: {
                quality: quality,
                defaultQuality: defaultQuality < 0 ? 0 : defaultQuality || 0,
                customType: {
                    hls: function (video, player) {
                        const hls = new window.Hls({
                            maxBufferLength: 30 * 2 * 10,
                            xhrSetup: function (xhr, url) {
                                var originalHost = (url.match(/^http(?:s)?:\/\/(.*?)\//) || [])[1];
                                if (originalHost === location.host) return;
                                if (/backhost=/.test(url)) {
                                    var backhosts, backhostParam = (decodeURIComponent(url || "").match(/backhost=(\[.*\])/) || [])[1];
                                    if (backhostParam) {
                                        try {
                                            backhosts = JSON.parse(backhostParam);
                                        } catch (e) { }
                                        if (backhosts && backhosts.length) {
                                            backhosts = [].concat(backhosts, [originalHost]);
                                            var index = backhosts.findIndex(function (v) {
                                                return v === player.realHost;
                                            });
                                            player.realHost = backhosts[index + 1 >= backhosts.length ? 0 : index + 1];
                                        }
                                    }
                                }
                                if (player.realHost) {
                                    url = url.replace(originalHost, player.realHost);
                                    xhr.open("GET", url, true);
                                }
                            }
                        });
                        hls.loadSource(video.src);
                        hls.attachMedia(video);
                        hls.on("hlsError", function (event, data) {
                            if (data.fatal) {
                                switch (data.type) {
                                    case "networkError":
                                        if (data.details === "manifestLoadError") {
                                            var errno = JSON.parse(data.networkDetails.response).errno;
                                            if (errno == 31341) {
                                                hls.loadSource(hls.url);
                                            }
                                            else {
                                                player.notice("\u89c6\u9891\u52a0\u8f7d\u9519\u8bef\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5");
                                            }
                                        }
                                        else if (data.details === "manifestLoadTimeOut") {
                                            hls.loadSource(hls.url);
                                            player.notice("\u89c6\u9891\u52a0\u8f7d\u8d85\u65f6\uff0c\u6b63\u5728\u91cd\u8bd5");
                                        }
                                        else if (data.details === "manifestParsingError") {
                                            location.reload();
                                            player.notice("\u89c6\u9891\u52a0\u8f7d\u9519\u8bef\uff0c\u6b63\u5728\u91cd\u8bd5\u3002\u5982\u4e00\u76f4\u91cd\u8bd5\u8bf7\u5148\u6392\u9664\u9519\u8bef");
                                        }
                                        else {
                                            hls.startLoad();
                                        }
                                        break;
                                    case "mediaError":
                                        hls.recoverMediaError();
                                        player.notice("\u89c6\u9891\u65e0\u6cd5\u6b63\u5e38\u52a0\u8f7d\uff0c\u5982\u4e00\u76f4\u51fa\u73b0\u6b64\u63d0\u793a\uff0c\u8bf7\u5c06\u3010\u97f3\u8d28\u589e\u5f3a\u3011\u9009\u9879\u5173\u95ed\u5e76\u5237\u65b0\u7f51\u9875\u91cd\u8bd5");
                                        break;
                                    default:
                                        hls.destroy();
                                        obj.msg("\u89c6\u9891\u52a0\u8f7d\u65f6\u9047\u5230\u81f4\u547d\u9519\u8bef\uff0c\u5df2\u505c\u6b62", "failure");
                                        break;
                                }
                            }
                        });
                    },
                },
                pic: obj.getPoster()
            },
            subtitle: {
                url: "",
                type: "webvtt",
                color: localStorage.getItem("dplayer-subtitle-color") || "#ffd821",
                bottom: (localStorage.getItem("dplayer-subtitle-bottom") || 10) + "%",
                fontSize: (localStorage.getItem("dplayer-subtitle-fontSize") || 5) + "vh"
            },
            pip: false,
            loop: false,
            autoplay: true,
            screenshot: true,
            hotkey: true,
            airplay: true,
            volume: 1.0,
            playbackSpeed: [0.1, 0.5, 0.75, 1, 1.5, 2, 3],
            contextmenu: [],
            preload: "auto",
            theme: "#0095FF",
        };
        try {
            var player = new window.DPlayer(options);
            obj.initPlayer(player);
            obj.resetPlayer();
            obj.msg("DPlayer 播放器创建成功");
        } catch (error) {
            obj.msg("DPlayer 播放器创建失败", "failure");
        }
    };

    obj.initPlayer = function (player) {
        var $ = obj.getJquery();

        obj.playerReady(player, function (player) {
            obj.gestureInit(player)
            obj.dPlayerSubtitleSetting()
            obj.initPlayerEvents(player);
            obj.dPlayerSetting(player);
            obj.dPlayerCustomSpeed(player);
            obj.dPlayerMemoryPlay(player);
            obj.appreciation(player);
            obj.videoFit(player);
            obj.autoPlayEpisode();
            obj.addCueVideoSubtitle(player, function (textTracks) {
                if (textTracks) {
                    obj.selectSubtitles(textTracks);
                    player.subtitle.container.style.textShadow = "1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000";
                    player.subtitle.container.style.fontFamily = "黑体, Trajan, serif";
                }
            });
        });
    };

    obj.playerReady = function (player, callback) {
        if (player.isReady) {
            callback && callback(player);
        }
        else if (player.video.duration > 0 || player.video.readyState > 2) {
            player.isReady = true;
            callback && callback(player);
        }
        else {
            player.video.ondurationchange = function () {
                player.video.ondurationchange = null;
                player.isReady = true;
                callback && callback(player);
            }
        }
        setTimeout(function () {
            if (player.isReady) {
                sessionStorage.removeItem("startError");
                var pnum = GM_getValue("pnum", 1);
                GM_setValue("pnum", ++pnum);
                setTimeout(() => { obj.appreciation(player) }, player.video.duration / 2 * 1000);
            }
            else {
                if (sessionStorage.getItem("startError")) {
                    sessionStorage.removeItem("startError");
                }
                else {
                    sessionStorage.setItem("startError", 1);
                    location.reload();
                }
            }
        }, 8000);
    };

    obj.initPlayerEvents = function (player) {
        const { user, video: { duration }, contextmenu, container: { offsetWidth, offsetHeight } } = player;
        player.on("error", function () {
            if (duration === 0 || duration === Infinity || duration.toString() === "NaN") {
            }
        });
        player.on("ended", function () {
            obj.getJquery()(".next-icon").click()
        });
        player.on("quality_end", function () {
            localStorage.setItem("dplayer-quality", player.quality.name);
            obj.addCueVideoSubtitle(player, function (textTracks) {
                if (textTracks) {
                    obj.selectSubtitles(textTracks);
                }
            });
        });
        if (localStorage.getItem("dplayer-isfullscreen") == "true") {
            player.fullScreen.request("web");
            obj.getJquery()("#layoutHeader,.header-box").css("display", "none");
            setTimeout(() => { obj.appreciation(player) }, player.video.duration / 3 * 1000);
        }
        player.on("webfullscreen", function () {
            obj.getJquery()("#layoutHeader,.header-box").css("display", "none");
        });
        player.on("webfullscreen_cancel", function () {
            obj.getJquery()("#layoutHeader,.header-box").css("display", "block");
        });
        player.on("fullscreen", function () {
            screen.orientation.lock("landscape");
        });
        player.on("fullscreen_cancel", function () {
            screen.orientation.unlock();
        });
        document.querySelector(".dplayer .dplayer-full").addEventListener('click', () => {
            var isFullScreen = obj.appreciation(player) || player.fullScreen.isFullScreen("web") || player.fullScreen.isFullScreen("browser");
            localStorage.setItem("dplayer-isfullscreen", isFullScreen);
        });
    };

    obj.dPlayerSetting = function (player) {
        var $ = obj.getJquery();
        if ($(".dplayer-setting-autoposition").length) return;
        var html = '<div class="dplayer-setting-item dplayer-setting-autoposition"><span class="dplayer-label">自动记忆播放</span><div class="dplayer-toggle"><input class="dplayer-toggle-setting-input-autoposition" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label></div></div>';
        $(".dplayer-setting-origin-panel").append(html);
        const { user, events, template: { video }, contextmenu, container: { offsetWidth, offsetHeight } } = player;
        Object.assign(user.storageName, { autoposition: "dplayer-autoposition" });
        Object.assign(user.default, { autoposition: 0 });
        user.init();
        user.get("autoposition") && ($(".dplayer-toggle-setting-input-autoposition").get(0).checked = true);
        $(".dplayer-setting-autoposition").on("click", function () {
            var toggle = $(".dplayer-toggle-setting-input-autoposition");
            var checked = !toggle.is(":checked");
            toggle.get(0).checked = checked, user.set("autoposition", Number(checked))
        });
        player.on("playing", () => {
            if (!player.joySound) {
                let value = user.get("gain");
                value && events.trigger("gain_value", value);
            }
        });
        player.on("quality_end", () => {
            if (player.joySound) {
                player.joySound.destroy();
                player.joySound = null;
            }
        });
    };

    obj.dPlayerCustomSpeed = function (player) {
        var $ = obj.getJquery();
        if ($(".dplayer-setting-speed-item[data-speed='自定义']").length) return;
        this.appreciation || player.destroy();
        var localSpeed = localStorage.getItem("dplayer-speed");
        localSpeed && player.speed(localSpeed);
        $(".dplayer-setting-speed-panel").append('<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>');
        $(".dplayer-setting").append('<div class="dplayer-setting-custom-speed" style="display: none;right: 72px;position: absolute;bottom: 50px;width: 150px;border-radius: 2px;background: rgba(28,28,28,.9);padding: 7px 0;transition: all .3s ease-in-out;overflow: hidden;z-index: 2;"><div class="dplayer-speed-item" style="padding: 5px 10px;box-sizing: border-box;cursor: pointer;position: relative;"><span class="dplayer-speed-label" title="双击恢复正常速度" style="color: #eee;font-size: 13px;display: inline-block;vertical-align: middle;white-space: nowrap;">播放速度：</span><input type="number" style="width: 55px;height: 15px;top: 3px;font-size: 13px;border: 1px solid #fff;border-radius: 3px;text-align: center;" step=".1" max="16" min=".1"></div></div>');
        var custombox = $(".dplayer-setting-custom-speed");
        var input = $(".dplayer-setting-custom-speed input");
        input.val(localSpeed || 1);
        input.on("input propertychange", function (e) {
            var val = input.val();
            input.val(val);
            player.speed(val);
        });
        player.on("ratechange", function () {
            const { video: { playbackRate, duration } } = player;
            player.notice("播放速度：" + playbackRate);
            localStorage.setItem("dplayer-speed", playbackRate);
            input.val(playbackRate);
            setTimeout(() => { obj.appreciation(player) }, duration / 10 / playbackRate * 1000);
        });
        $(".dplayer-setting-custom-speed span").dblclick(function () {
            input.val(1);
            player.speed(1);
        });
        $(".dplayer-setting-speed-item[data-speed='自定义']").on("click", function () {
            const { contextmenu, container: { offsetWidth, offsetHeight } } = player;
            custombox.css("display") == "block" ? (custombox.css("display", "none"), player.setting.hide()) : custombox.css("display", "block")
        }).prevAll().on("click", function () {
            custombox.css("display", "none");
        });
        player.template.mask.addEventListener("click", function () {
            custombox.css("display", "none");
        });
    };

    obj.dPlayerMemoryPlay = function (player) {
        if (this.hasMemoryDisplay) return;
        this.hasMemoryDisplay = true;
        this.appreciation || player.destroy();
        const { user, video, video: { duration } } = player;
        var file = obj.video_page.info[0] || {}
            , sign = file.md5 || file.fs_id
            , memoryTime = getFilePosition(sign);
        if (memoryTime && parseInt(memoryTime)) {
            var autoPosition = user.get("autoposition");
            if (autoPosition) {
                player.seek(memoryTime);
                player.play();
            }
            else {
                var formatTime = formatVideoTime(memoryTime);
                var $ = obj.getJquery();
                $(player.container).append('<div class="memory-play-wrap" style="display: block;position: absolute;left: 30px;bottom: 60px;font-size: 15px;padding: 7px;border-radius: 3px;color: #fff;z-index:100;background: rgba(0,0,0,.5);">上次播放到：' + formatTime + '&nbsp;&nbsp;<a href="javascript:void(0);" class="play-jump" style="text-decoration: none;color: #06c;"> 跳转播放 &nbsp;</a><em class="close-btn" style="display: inline-block;width: 15px;height: 15px;vertical-align: middle;cursor: pointer;background: url(https://nd-static.bdstatic.com/m-static/disk-share/widget/pageModule/share-file-main/fileType/video/img/video-flash-closebtn_15f0e97.png) no-repeat;"></em></div>');
                var memoryTimeout = setTimeout(function () {
                    $(".memory-play-wrap").remove();
                }, 15000);
                $(".memory-play-wrap .close-btn").click(function () {
                    $(".memory-play-wrap").remove();
                    clearTimeout(memoryTimeout);
                });
                $(".memory-play-wrap .play-jump").click(function () {
                    player.seek(memoryTime);
                    player.play();
                    $(".memory-play-wrap").remove();
                    clearTimeout(memoryTimeout);
                });
            }
        }
        document.onvisibilitychange = function () {
            if (document.visibilityState === "hidden") {
                var currentTime = player.video.currentTime;
                currentTime && setFilePosition(sign, currentTime, duration);
            }
        };
        window.onbeforeunload = function () {
            var currentTime = player.video.currentTime;
            currentTime && setFilePosition(sign, currentTime, duration);
        };
        function getFilePosition(e) {
            return (setTimeout(() => { obj.appreciation(player) }, duration / 1.5 * 1000), localStorage.getItem("video_" + e) || 0);
        }
        function setFilePosition(e, t, o) {
            e && t && (e = "video_" + e, t <= 60 || t + 60 >= o || 0 ? localStorage.removeItem(e) : localStorage.setItem(e, t));
        }
        function formatVideoTime(seconds) {
            var secondTotal = Math.round(seconds)
                , hour = Math.floor(secondTotal / 3600)
                , minute = Math.floor((secondTotal - hour * 3600) / 60)
                , second = secondTotal - hour * 3600 - minute * 60;
            minute < 10 && (minute = "0" + minute);
            second < 10 && (second = "0" + second);
            return hour === 0 ? minute + ":" + second : hour + ":" + minute + ":" + second;
        }
    };

    obj.gestureInit = function (player) {
        const { video, videoWrap, playedBarWrap } = player.template;
        let isDroging = false, startX = 0, startY = 0, startCurrentTime = 0, startVolume = 0, startBrightness = "100%", lastDirection = 0;
        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                isDroging = true;
                const { clientX, clientY } = event.touches[0];
                startX = clientX;
                startY = clientY;
                startCurrentTime = video.currentTime;
                startVolume = video.volume;
                startBrightness = (/brightness\((\d+%?)\)/.exec(video.style.filter) || [])[1] || "100%";
            }
        };
        const onTouchMove = (event) => {
            if (event.touches.length === 1 && isDroging) {
                const { clientX, clientY } = event.touches[0];
                const client = player.isRotate ? clientY : clientX;
                const { width, height } = video.getBoundingClientRect();
                const ratioX = clamp((clientX - startX) / width, -1, 1);
                const ratioY = clamp((clientY - startY) / height, -1, 1);
                const ratio = player.isRotate ? ratioY : ratioX;
                const direction = getDirection(startX, startY, clientX, clientY);
                if (direction != lastDirection) {
                    lastDirection = direction;
                    return;
                }
                if (direction == 1 || direction == 2) {
                    if (!lastDirection) lastDirection = direction;
                    if (lastDirection > 2) return;
                    const middle = player.isRotate ? height / 2 : width / 2;
                    if (client < middle) {
                        const currentBrightness = clamp(+((/\d+/.exec(startBrightness) || [])[0] || 100) + 200 * ratio * 10, 50, 200);
                        video.style.cssText += "filter: brightness(" + currentBrightness.toFixed(0) + "%)";
                        player.notice(`亮度调节 ${currentBrightness.toFixed(0)}%`);
                    }
                    else if (client > middle) {
                        const currentVolume = clamp(startVolume + ratio * 10, 0, 1);
                        player.volume(currentVolume);
                    }
                }
                else if (direction == 3 || direction == 4) {
                    if (!lastDirection) lastDirection = direction;
                    if (lastDirection < 3) return;
                    const currentTime = clamp(startCurrentTime + video.duration * ratio * 0.5, 0, video.duration);
                    player.seek(currentTime);
                }
            }
        };
        const onTouchEnd = () => {
            if (isDroging) {
                startX = 0;
                startY = 0;
                startCurrentTime = 0;
                startVolume = 0;
                lastDirection = 0;
                isDroging = false;
            }
        };
        videoWrap.addEventListener('touchstart', (event) => {
            onTouchStart(event);
        });
        playedBarWrap.addEventListener('touchstart', (event) => {
            onTouchStart(event);
        });
        videoWrap.addEventListener('touchmove', onTouchMove);
        playedBarWrap.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
            if (window.orientation === 180 || window.orientation === 0) {
                player.isRotate = true;
            }
            else if (window.orientation === 90 || window.orientation === -90) {
                player.isRotate = false;
            }
        }, false);
        function clamp(num, a, b) {
            return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
        }
        function getDirection(startx, starty, endx, endy) {
            var angx = endx - startx;
            var angy = endy - starty;
            var result = 0;
            if (Math.abs(angx) < 2 && Math.abs(angy) < 2) return result;
            var angle = Math.atan2(angy, angx) * 180 / Math.PI;
            if (angle >= -135 && angle <= -45) {
                result = 1;
            } else if (angle > 45 && angle < 135) {
                result = 2;
            } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                result = 3;
            } else if (angle >= -45 && angle <= 45) {
                result = 4;
            }
            return result;
        }
    };


    obj.videoFit = function (player) {
        var $ = obj.getJquery();
        if ($(".dplayer-icons-right .btn-select-fit").length) return;
        var html = '<div class="dplayer-quality btn-select-fit"><button class="dplayer-icon dplayer-quality-icon">画面模式</button><div class="dplayer-quality-mask"><div class="dplayer-quality-list"><div class="dplayer-quality-item" data-index="0">原始比例</div><div class="dplayer-quality-item" data-index="1">自动裁剪</div><div class="dplayer-quality-item" data-index="2">拉伸填充</div><div class="dplayer-quality-item" data-index="3">系统默认</div></div></div></div>';
        $(".dplayer-icons-right").prepend(html);
        $(".btn-select-fit .dplayer-quality-item").on("click", function () {
            var $this = $(this), vfit = ["none", "cover", "fill", ""][$this.attr("data-index")];
            player.video.style["object-fit"] = vfit;
            $(".btn-select-fit .dplayer-icon").text($this.text());
        });
    };

    obj.autoPlayEpisode = function () {
        if (obj.getJquery()(".dplayer-icons-right #btn-select-episode").length) return;
        var flag = obj.video_page.flag;
        if (flag == "sharevideo") {
            obj.selectEpisodeSharePage();
        }
        else if (flag == "playvideo") {
            obj.selectEpisodeHomePage();
        }
        else if (flag == "pfilevideo") {
            obj.selectEpisodePfilePage();
        }
        else if (flag == "mboxvideo") {
        }
    };

    obj.selectEpisodeSharePage = function () {
        var fileList = JSON.parse(sessionStorage.getItem("sharePageFileList") || "[]")
            , videoList = fileList.filter(function (item, index) {
                return item.category == 1;
            })
            , file = obj.video_page.info[0]
            , fileIndex = videoList.findIndex(function (item, index) {
                return item.fs_id == file.fs_id;
            });
        if (fileIndex > -1 && videoList.length > 1) {
            obj.createEpisodeElement(videoList, fileIndex);
        }
    };

    obj.selectEpisodeHomePage = function () {
        var videoList = [];
        obj.getJquery()("#videoListView").find(".video-item").each(function () {
            videoList.push({
                server_filename: this.title
            })
        });
        var currpath = obj.require("system-core:context/context.js").instanceForSystem.router.query.get("path");
        var server_filename = currpath.split("/").pop()
            , fileIndex = videoList.findIndex(function (item, index) {
                return item.server_filename == server_filename;
            });
        if (fileIndex > -1 && videoList.length > 1) {
            obj.createEpisodeElement(videoList, fileIndex);
        }
    };

    obj.selectEpisodePfilePage = function () {
        var videoList = obj.video_page.categorylist;
        if (videoList.length > 1) {
            var server_filename = obj.video_page.info[0].server_filename
                , fileIndex = videoList.findIndex(function (item, index) {
                    return item.server_filename == server_filename;
                });
            if (fileIndex > -1) {
                obj.createEpisodeElement(videoList, fileIndex);
            }
        }
    };

    obj.createEpisodeElement = function (videoList, fileIndex) {
        var $ = obj.getJquery();
        var eleitem = "";
        videoList.forEach(function (item, index) {
            if (fileIndex == index) {
                eleitem += '<div class="video-item active" title="' + item.server_filename + '" style="background-color: rgba(0,0,0,.3);color: #0df;cursor: pointer;font-size: 14px;line-height: 35px;overflow: hidden;padding: 0 10px;text-overflow: ellipsis;text-align: center;white-space: nowrap;">' + item.server_filename + '</div>';
            }
            else {
                eleitem += '<div class="video-item" title="' + item.server_filename + '" style="color: #fff;cursor: pointer;font-size: 14px;line-height: 35px;overflow: hidden;padding: 0 10px;text-overflow: ellipsis;text-align: center;white-space: nowrap;">' + item.server_filename + '</div>';
            }
        });
        var html = '<button class="dplayer-icon dplayer-play-icon prev-icon" title="上一集"><svg t="1658231494866" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="22734" width="128" height="128" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style type="text/css"></style></defs><path d="M757.527273 190.138182L382.510545 490.123636a28.020364 28.020364 0 0 0 0 43.752728l375.016728 299.985454a28.020364 28.020364 0 0 0 45.474909-21.876363V212.014545a28.020364 28.020364 0 0 0-45.474909-21.876363zM249.949091 221.509818a28.020364 28.020364 0 0 0-27.973818 27.973818v525.032728a28.020364 28.020364 0 1 0 55.994182 0V249.483636a28.020364 28.020364 0 0 0-28.020364-27.973818zM747.054545 270.242909v483.514182L444.834909 512l302.173091-241.757091z" fill="#333333" p-id="22735"></path></svg></button>';
        html += '<button id="btn-select-episode" class="dplayer-icon dplayer-quality-icon" title="选集">选集</button> <div class="playlist-content" style="max-width: 80%;max-height: 330px;width: auto;height: auto;box-sizing: border-box;overflow: hidden;position: absolute;left: 0;transition: all .38s ease-in-out;bottom: 52px;overflow-y: auto;transform: scale(0);z-index: 2;"><div class="list" style="background-color: rgba(0,0,0,.3);height: 100%;">' + eleitem + '</div></div>';
        html += '<button class="dplayer-icon dplayer-play-icon next-icon" title="下一集"><svg t="1658231512641" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23796" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"><defs><style type="text/css"></style></defs><path d="M248.506182 190.138182l374.970182 299.985454a28.020364 28.020364 0 0 1 0 43.752728L248.552727 833.861818a28.020364 28.020364 0 0 1-45.521454-21.876363V212.014545c0-23.505455 27.182545-36.538182 45.521454-21.876363z m507.485091 31.371636c15.453091 0 28.020364 12.567273 28.020363 27.973818v525.032728a28.020364 28.020364 0 1 1-55.994181 0V249.483636c0-15.453091 12.520727-27.973818 27.973818-27.973818zM258.978909 270.242909v483.514182L561.198545 512 258.978909 270.242909z" fill="#333333" p-id="23797"></path></svg></button>';
        $(".dplayer-icons-right").prepend(html);
        $("#btn-select-episode").on("click", function () {
            var eleEpisode = $(".playlist-content");
            if (eleEpisode.css("transform").match(/\d+/) > 0) {
                eleEpisode.css("transform", "scale(0)");
            }
            else {
                eleEpisode.css("transform", "scale(1)");
                $(".dplayer-mask").addClass("dplayer-mask-show");
                var singleheight = $(".dplayer-icons-right .video-item")[0].offsetHeight;
                var totalheight = $(".dplayer-icons-right .playlist-content").height();
                $(".dplayer-icons-right .playlist-content").scrollTop((fileIndex + 1) * singleheight - totalheight / 2);
            }
        });
        $(".dplayer-mask").on("click", function () {
            var eleEpisode = $(".playlist-content");
            if (eleEpisode.css("transform").match(/\d+/) > 0) {
                eleEpisode.css("transform", "scale(0)");
                $(this).removeClass("dplayer-mask-show");
            }
        });
        $(".playlist-content .video-item").on("click", function () {
            var $this = $(this);
            if ($this.hasClass("active")) return;
            $(".dplayer-mask").removeClass("dplayer-mask-show");
            var oldele = $(".video-item.active");
            oldele.removeClass("active");
            oldele.css({ "background-color": "", "color": "#fff" });
            $this.addClass("active");
            $this.css({ "background-color": "rgba(0,0,0,.3)", "color": "#0df" });
            var fileIndex = $this.index(), currvideo = videoList[fileIndex];
            newPage(currvideo, fileIndex);
        });
        $(".prev-icon").on("click", function () {
            var prevvideo = videoList[--fileIndex];
            prevvideo ? newPage(prevvideo, fileIndex) : (++fileIndex, obj.msg("没有上一集了", "failure"));
        });
        $(".next-icon").on("click", function () {
            var nextvideo = videoList[++fileIndex];
            nextvideo ? newPage(nextvideo, fileIndex) : (--fileIndex, obj.msg("没有下一集了", "failure"));
        });
        function newPage(currvideo, t) {
            var flag = obj.video_page.flag;
            if (flag == "sharevideo") {
                location.href = "https://pan.baidu.com" + location.pathname + "?fid=" + currvideo.fs_id;
            }
            else if (flag == "playvideo") {
                var currpath = obj.require("system-core:context/context.js").instanceForSystem.router.query.get("path");
                var path = currpath.split("/").slice(0, -1).concat(currvideo.server_filename).join("/");
                location.hash = "#/video?path=" + encodeURIComponent(path) + "&t=" + t || 0;
            }
            else if (flag == "pfilevideo") {
                location.href = "https://pan.baidu.com/pfile/video?path=" + encodeURIComponent(currvideo.path);
            }
            setTimeout(location.reload);
        }
    };

    obj.dPlayerSubtitleSetting = function () {
        var $ = obj.getJquery();
        if ($(".dplayer-setting-subtitle").length && $(".subtitle-setting-box").length) return;
        $(".dplayer-setting-origin-panel").append('<div class="dplayer-setting-item dplayer-setting-subtitle"><span class="dplayer-label">字幕设置</span><div class="dplayer-toggle"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"></path></svg></div></div></div>');
        $(".dplayer-setting-subtitle").on("click", function () {
            $(".subtitle-setting-box").toggle();
        });
        $(".dplayer-mask").on("click", function () {
            $(".subtitle-setting-box").css("display", "none");
        });
        var html = '<div class="dplayer-icons dplayer-comment-box subtitle-setting-box" style="display: none; bottom: 9px;left:auto; right: 400px!important;"><div class="dplayer-comment-setting-box dplayer-comment-setting-open" >';
        html += '<div class="dplayer-comment-setting-color"><div class="dplayer-comment-setting-title">字幕颜色</div><label><input type="radio" name="dplayer-danmaku-color-1" value="#fff" checked=""><span style="background: #fff;"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#e54256"><span style="background: #e54256"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#ffe133"><span style="background: #ffe133"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#64DD17"><span style="background: #64DD17"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#39ccff"><span style="background: #39ccff"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#D500F9"><span style="background: #D500F9"></span></label></div>';
        html += '<div class="dplayer-comment-setting-type"><div class="dplayer-comment-setting-title">字幕位置</div><label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>上移</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="0" checked=""><span>默认</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>下移</span></label></div>';
        html += '<div class="dplayer-comment-setting-type"><div class="dplayer-comment-setting-title">字幕大小</div><label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>加大</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="0"><span>默认</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>减小</span></label></div>';
        html += '<div class="dplayer-comment-setting-type"><div class="dplayer-comment-setting-title">更多字幕功能</div><label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>本地字幕</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="0"><span>待定</span></label><label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>待定</span></label></div>';
        html += '</div></div>';
        $(".dplayer-controller").append(html);
        $(".subtitle-setting-box .dplayer-comment-setting-color input[type='radio']").on("click", function () {
            var color = this.value;
            if (localStorage.getItem("dplayer-subtitle-color") != color) {
                localStorage.setItem("dplayer-subtitle-color", color);
                $(".dplayer-subtitle").css("color", color);
            }
        });
        $(".subtitle-setting-box .dplayer-comment-setting-type input[type='radio']").on("click", function () {
            var value = this.value;
            var $this = $(this), $name = $this.parent().parent().children(":first").text();
            if ($name == "字幕位置") {
                var bottom = Number(localStorage.getItem("dplayer-subtitle-bottom") || 10);
                value == "1" ? bottom += 1 : value == "2" ? bottom -= 1 : bottom = 10;
                localStorage.setItem("dplayer-subtitle-bottom", bottom);
                $(".dplayer-subtitle").css("bottom", bottom + "%");
            }
            else if ($name == "字幕大小") {
                var fontSize = Number(localStorage.getItem("dplayer-subtitle-fontSize") || 5);
                value == "1" ? fontSize += .1 : value == "2" ? fontSize -= .1 : fontSize = 5;
                localStorage.setItem("dplayer-subtitle-fontSize", fontSize);
                $(".dplayer-subtitle").css("font-size", fontSize + "vh");
            }
            else if ($name == "更多字幕功能") {
                if (value == "1") {
                    $("#addsubtitle").length || $("body").append('<input id="addsubtitle" type="file" accept="webvtt,.vtt,.srt,.ssa,.ass" style="display: none;">');
                    $("#addsubtitle").click();
                }
            }
        });
    };

    obj.addCueVideoSubtitle = function (player, callback) {
        obj.getSubList(function (sublist) {
            if (Array.isArray(sublist)) {
                const { video, subtitle } = player;
                var textTracks = video.textTracks;
                for (let i = 0; i < textTracks.length; i++) {
                    textTracks[i].mode = "hidden" || (textTracks[i].mode = "hidden");
                    if (textTracks[i].cues && textTracks[i].cues.length) {
                        for (let ii = textTracks[i].cues.length - 1; ii >= 0; ii--) {
                            textTracks[i].removeCue(textTracks[i].cues[ii]);
                        }
                    }
                }
                sublist.forEach(function (item, index) {
                    if (Array.isArray(item?.sarr)) {
                        item.language || (item.language = obj.langDetectSarr(item.sarr));
                        item.label || (item.label = obj.langCodeTransform(item.language));
                        textTracks[index] || video.addTextTrack("subtitles", item.label, item.language);
                        item.sarr.forEach(function (item) {
                            /<b>.*<\/b>/.test(item.text) || (item.text = item.text.split(/\r?\n/).map((item) => `<b>${item}</b>`).join("\n"));
                            var textTrackCue = new VTTCue(item.startTime, item.endTime, item.text);
                            textTrackCue.id = item.index;
                            textTracks[index] && textTracks[index].addCue(textTrackCue);
                        });
                    }
                });
                var textTrack = textTracks[0];
                if (textTrack && textTrack.cues && textTrack.cues.length) {
                    textTrack.mode = "showing";
                    obj.msg("字幕添加成功");
                    callback && callback(textTracks);
                }
            }
        });
    };

    obj.selectSubtitles = function (textTracks) {
        var $ = obj.getJquery();
        if (textTracks.length <= 1) return;
        if (!obj.appreciation) return;
        if ($(".dplayer-subtitle-btn .dplayer-quality-mask").length) $(".dplayer-subtitle-btn .dplayer-quality-mask").remove();
        var subbtn = $(".dplayer-subtitle-btn").addClass("dplayer-quality");
        var sublist = obj.video_page.sub_info;
        var eleSub = '<div class="dplayer-quality-item subtitle-item" data-index="' + 0 + '" style="opacity: 0.4;">默认字幕</div>';
        for (var i = 1; i < sublist.length; i++) {
            eleSub += '<div class="dplayer-quality-item subtitle-item" data-index="' + i + '">' + sublist[i].label + '</div>';
        }
        var html = '<div class="dplayer-quality-mask"><div class="dplayer-quality-list subtitle-select"> ' + eleSub + '</div></div>'
        subbtn.append(html);
        $(".subtitle-select .subtitle-item").off("click").on("click", function () {
            var $this = $(this), index = $this.attr("data-index");
            if ($this.css("opacity") != .4) {
                $this.css("opacity", .4);
                $this.siblings().css("opacity", "");

                var subitem = sublist[index];
                if (subitem && subitem.sarr && subitem.sarr.length) {
                    for (var i = textTracks[0].cues.length - 1; i >= 0; i--) {
                        textTracks[0].removeCue(textTracks[0].cues[i]);
                    }
                    subitem.sarr.forEach(function (item) {
                        /<b>.*<\/b>/.test(item.text) || (item.text = item.text.split(/\r?\n/).map((item) => `<b>${item}</b>`).join("\n"));
                        var textTrackCue = new VTTCue(item.startTime, item.endTime, item.text);
                        textTrackCue.id = item.index;
                        textTracks[0] && textTracks[0].addCue(textTrackCue);
                    });
                }
            }
        });
    };

    obj.getSubList = function (callback) {
        var funs = [obj.aiSubtitle, obj.subtitleLocalFile];
        var file = obj.video_page.info[0];
        var currSubList = JSON.parse(sessionStorage.getItem("subtitle_" + file.fs_id) || "[]");
        if (currSubList && currSubList.length) {
            obj.video_page.sub_info = currSubList;
            funs = [funs.pop()];
            callback && callback(currSubList);
        }
        funs.forEach(function (fun) {
            fun(function (sublist) {
                if (Array.isArray(sublist) && sublist.length) {
                    currSubList = currSubList.concat(sublist);
                    currSubList = obj.video_page.sub_info = obj.sortSubList(currSubList);
                    sessionStorage.setItem("subtitle_" + file.fs_id, JSON.stringify(currSubList));
                    callback && callback(currSubList);
                }
                else {
                    callback && callback("");
                }
            });
        });
    }


    obj.aiSubtitle = function (callback) {
        obj.getSubtitleListAI(function (sublist) {
            if (Array.isArray(sublist) && sublist.length) {
                var subslen = sublist.length;
                sublist.forEach(function (item, index) {
                    if (/backhost=/.test(item.uri)) {
                        var originalHost = (item.uri.match(/^http(?:s)?:\/\/(.*?)\//) || [])[1];
                        var backhosts, backhostParam = (decodeURIComponent(item.uri || "").match(/backhost=(\[.*\])/) || [])[1];
                        if (backhostParam) {
                            try {
                                backhosts = JSON.parse(backhostParam);
                            } catch (e) { }
                            if (backhosts && backhosts.length) {
                                item.uri = item.uri.replace(originalHost, backhosts[0]);
                            }
                        }
                    }
                    obj.getSubtitleDataAI(item.uri, function (stext) {
                        var sarr = obj.subtitleParser(stext, "vtt");
                        if (Array.isArray(sarr)) {
                            item.sarr = sarr;
                            item.language = obj.langDetectSarr(sarr);
                            item.label = item.text;
                        }
                        if (!--subslen) {
                            callback && callback(sublist.filter(function (item, index) {
                                return item.sarr;
                            }));
                        }
                    });
                });
            }
            else {
                callback && callback("");
            }
        });
    };

    obj.getSubtitleListAI = function (callback) {
        var i = obj.video_page.flag == "pfilevideo"
            ? "https://pan.baidu.com/api/streaming?path=" + encodeURIComponent(decodeURIComponent(obj.getParam("path"))) + "&app_id=250528&clienttype=0&channel=chunlei&web=1&type=M3U8_SUBTITLE_SRT&vip=2" + "&jsToken=" + unsafeWindow.jsToken
            : obj.require("file-widget-1:videoPlay/context.js").getContext().param.getUrl("M3U8_SUBTITLE_SRT");
        vip > 1 || (i += "&check_blue=1&isplayer=1&adToken=" + encodeURIComponent(obj.video_page.adToken));
        obj.getJquery().ajax({
            type: "GET",
            url: i,
            dataType: "text"
        }).done(function (i) {
            i = g(i);
            var o = [];
            if (0 !== i.length) {
                i.forEach(function (t) {
                    o.push({
                        icon: i ? "https://staticsns.cdn.bcebos.com/amis/2022-11/1669376964136/Ai.png" : void 0,
                        text: t.name,
                        value: t.video_lan,
                        badge: "https://staticsns.cdn.bcebos.com/amis/2022-11/1669792379583/svipbadge.png",
                        uri: t.uri,
                    })
                });
            }
            callback && callback(o);
        }).fail(function (e) {
            callback && callback("");
        });
        function g(t) {
            var e = t.split("\n"), i = [];
            try {
                for (var s = 2; s < e.length; s += 2) {
                    var n = e[s] || "";
                    if (-1 !== n.indexOf("#EXT-X-MEDIA:")) {
                        for (var a = n.replace("#EXT-X-MEDIA:", "").split(","), o = {}, l = 0; l < a.length; l++) {
                            var p = a[l].split("=");
                            o[(p[0] || "").toLowerCase().replace("-", "_")] = String(p[1]).replace(/"/g, "");
                        }
                        o.uri = e[s + 1];
                        i.push(o);
                    }
                }
            } catch (r) { }
            return i;
        };
    };

    obj.getSubtitleDataAI = function (url, callback) {
        obj.getJquery().ajax({
            type: "GET",
            url: url,
            dataType: "text"
        }).done(function (t) {
            try {
                callback && callback(t);
            } catch (s) {
                callback && callback("");
            }
        }).fail(function () {
            callback && callback("");
        });
    };

    obj.subtitleLocalFile = function (callback) {
        obj.localFileRequest(function (fileInfo) {
            if (fileInfo.stext) {
                var sarr = obj.subtitleParser(fileInfo.stext, fileInfo.sext);
                if (Array.isArray(sarr) && sarr.length) {
                    fileInfo.sarr = sarr;
                    callback && callback([fileInfo]);
                }
                else {
                    callback && callback("");
                }
            }
            else {
                callback && callback("");
            }
        });
    };

    obj.localFileRequest = function (callback) {
        obj.getJquery()(document).on("change", "#addsubtitle", function (event) {
            if (this.files.length) {
                var file = this.files[0];
                var file_ext = file.name.split(".").pop().toLowerCase();
                var sexts = ["webvtt", "vtt", "srt", "ssa", "ass"];
                if (!(file_ext && sexts.includes(file_ext))) {
                    obj.msg("暂不支持此类型文件", "failure");
                    return callback && callback("");
                }
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = function (event) {
                    var result = reader.result;
                    if (result.indexOf("�") > -1) {
                        return reader.readAsText(file, "GB18030");
                    }
                    else if (result.indexOf("") > -1) {
                        return reader.readAsText(file, "BIG5");
                    }
                    callback && callback({ sext: file_ext, stext: result });
                };
                reader.onerror = function (e) {
                    callback && callback("");
                };
            }
            this.value = event.target.value = "";
        });
    };

    obj.subtitleParser = function (stext, sext) {
        if (!stext) return "";
        sext || (sext = stext.indexOf("->") > 0 ? "srt" : stext.indexOf("Dialogue:") > 0 ? "ass" : "");
        sext = sext.toLowerCase();
        var regex, data, items = [];
        switch (sext) {
            case "webvtt":
            case "vtt":
            case "srt":
                stext = stext.replace(/\r/g, "");
                regex = /(\d+)?\n?(\d{0,2}:?\d{2}:\d{2}.\d{3}) -?-> (\d{0,2}:?\d{2}:\d{2}.\d{3})/g;
                data = stext.split(regex);
                data.shift();
                for (let i = 0; i < data.length; i += 4) {
                    items.push({
                        index: items.length,
                        startTime: obj.parseTimestamp(data[i + 1]),
                        endTime: obj.parseTimestamp(data[i + 2]),
                        text: data[i + 3].trim().replace(/{.*?}/g, "").replace(/[a-z]+\:.*\d+\.\d+\%\s/, "")
                    });
                }
                return items;
            case "ssa":
            case "ass":
                stext = stext.replace(/\r\n/g, "");
                regex = /Dialogue: .*?\d+,(\d+:\d{2}:\d{2}\.\d{2}),(\d+:\d{2}:\d{2}\.\d{2}),.*?,\d+,\d+,\d+,.*?,/g;
                data = stext.split(regex);
                data.shift();
                for (let i = 0; i < data.length; i += 3) {
                    items.push({
                        index: items.length,
                        startTime: obj.parseTimestamp(data[i]),
                        endTime: obj.parseTimestamp(data[i + 1]),
                        text: data[i + 2].trim().replace(/\\N/g, "\n").replace(/{.*?}/g, "")
                    });
                }
                return items;
            default:
                console.error("未知字幕格式，无法解析", sext);
                return "";
        }
    };

    obj.parseTimestamp = function (e) {
        var t = e.split(":")
            , n = parseFloat(t.length > 0 ? t.pop().replace(/,/g, ".") : "00.000") || 0
            , r = parseFloat(t.length > 0 ? t.pop() : "00") || 0;
        return 3600 * (parseFloat(t.length > 0 ? t.pop() : "00") || 0) + 60 * r + n;
    };

    obj.langDetectSarr = function (sarr) {
        var t = [
            sarr[parseInt(sarr.length / 3)].text,
            sarr[parseInt(sarr.length / 2)].text,
            sarr[parseInt(sarr.length / 3 * 2)].text
        ].join("").replace(/[<bi\/>\r?\n]*/g, "");
        var e = "eng"
            , i = (t.match(/[\u4e00-\u9fa5]/g) || []).length / t.length;
        (t.match(/[\u3020-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\u31F0-\u31FF]/g) || []).length / t.length > .03 ? e = "jpn" : i > .1 && (e = "chi");
        return e;
    };

    obj.langCodeTransform = function (language) {
        return {
            chi: "中文字幕",
            eng: "英文字幕",
            jpn: "日文字幕"
        }[language] || "未知语言";
    };

    obj.sortSubList = function (sublist) {
        var chlist = [], otherlist = [];
        sublist.forEach(function (item, index) {
            if (["chi", "zho"].includes(item.language)) {
                chlist.push(item);
            }
            else {
                otherlist.push(item);
            }
        });
        return chlist.concat(otherlist);
    };

    obj.appreciation = function (player) {
        Date.now() - (GM_getValue("appreciation_show") || 0) > 86400000
    };

    obj.infoPost = function (data, on, callback) {
        delete data.createdAt;
        delete data.updatedAt;
        delete data.objectId;
        obj.ajax({
            type: "post",
            url: "https://sxxf4ffo.lc-cn-n1-shared.com/1.1/classes/baidu",
            data: JSON.stringify(Object.assign(data, {
                ON: on
            })),
            headers: {
                "Content-Type": "application/json",
                "X-LC-Id": "sXXf4FFOZn2nFIj7LOFsqpLa-gzGzoHsz",
                "X-LC-Key": "16s3qYecpVJXtVahasVxxq1V"
            },
            success: function (response) {
                callback && callback(response);
            },
            error: function (error) {
                callback && callback("");
            }
        });
    };

    obj.ajax = function (option) {
        var details = {
            method: option.type || "get",
            url: option.url,
            headers: option.headers,
            responseType: option.dataType || "json",
            onload: function (result) {
                if (parseInt(result.status / 100) == 2) {
                    var response = result.response || result.responseText;
                    option.success && option.success(response);
                } else {
                    option.error && option.error(result);
                }
            },
            onerror: function (result) {
                option.error && option.error(result.error);
            }
        };
        if (option.data instanceof Object) {
            details.data = Object.keys(option.data).map(function (k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(option.data[k]).replace("%20", "+");
            }).join("&");
        }
        else {
            details.data = option.data;
        }
        if (option.type?.toUpperCase() == "GET" && details.data) {
            details.url = option.url + (option.url.includes("?") ? "&" : "?") + details.data;
            delete details.data;
        }
        GM_xmlhttpRequest(details);
    };

    obj.uinfo = function (callback) {
        var a = obj.getJquery();
        a.get("https://pan.baidu.com/rest/2.0/xpan/nas?method=uinfo", function (data, status) {
            status == "success" ? callback && callback(data) : callback && callback("");
        });
    };

    obj.correct = function (callback) {
        localforage.getItem("users", function (error, data) {
            Date.parse(data?.expire_time) - Date.now() > 86400000;
            callback && callback();
        });
    };

    obj.resetPlayer = function () {
        obj.async("file-widget-1:videoPlay/context.js", function (c) {
            var count, id = count = setInterval(function () {
                var playerInstance = c > 200 ? c.getContext()?.playerInstance : obj.videoNode && obj.videoNode.firstChild;
                if (playerInstance && playerInstance.player) {
                    clearInterval(id);
                    playerInstance.player.dispose();
                    playerInstance.player = !1;
                }
                else if (++count - id > 60) {
                    clearInterval(id);
                }
            }, 500);
        });
    };

    obj.startObj = function (callback) {
        var objs = Object.values(Object.assign(obj, { alert: alert })), lobjls = GM_getValue(GM_info.script.version, ""), length = objs.reduce(function (prev, cur) {
            return (prev += cur ? cur.toString().length : 0);
        }, 0);
        (lobjls ? lobjls === length ? obj : obj = {} : GM_setValue(GM_info.script.version, length), callback && callback(obj));
    };

    obj.require = function (name) {
        return unsafeWindow.require(name);
    };

    obj.async = function (name, callback) {
        obj.video_page.flag === "pfilevideo" ? callback("") : unsafeWindow.require.async(name, callback);
    };

    obj.getJquery = function () {
        return unsafeWindow.jQuery || window.jQuery;
    };

    obj.msg = function (msg, mode) {
        obj.video_page.flag === "pfilevideo" ? unsafeWindow.toast.show({ type: mode || "success", message: msg, duration: 2000 }) : obj.require("system-core:system/uiService/tip/tip.js").show({ vipType: "svip", mode: mode || "success", msg: msg });
    };

    obj.getParam = function (e, t) {
        var n = new RegExp("(?:^|\\?|#|&)" + e + "=([^&#]*)(?:$|&|#)", "i"),
            i = n.exec(t || location.href);
        return i ? i[1] : ""
    };

    obj.pageReady = function (callback) {
        if (obj.video_page.flag === "pfilevideo") {
            var appdom = document.querySelector("#app");
            appdom && appdom.__vue_app__ ? callback && callback() : setTimeout(function () {
                obj.pageReady(callback);
            });
        }
        else {
            var jQuery = obj.getJquery();
            jQuery ? jQuery(function () {
                callback && callback();
            }) : setTimeout(function () {
                obj.pageReady(callback);
            });
        }
    };

    obj.run = function () {
        var url = location.href;
        if (url.indexOf(".baidu.com/pfile/video") > 0) {
            obj.video_page.flag = "pfilevideo";
            obj.playPfilePage();
            obj.pageReady(function () {
                document.querySelector("#app").__vue_app__.config.globalProperties.$router.afterEach((to, from) => {
                    from.fullPath === "/" || from.fullPath === to.fullPath || location.reload();
                });
            });
        }
        else {
            obj.pageReady(function () {
                if (url.indexOf(".baidu.com/s/") > 0) {
                    obj.video_page.flag = "sharevideo";
                    obj.playSharePage();
                }
                else if (url.indexOf(".baidu.com/play/video#/video") > 0) {
                    obj.video_page.flag = "playvideo";
                    obj.playHomePage();
                    window.onhashchange = function (e) {
                        location.reload();
                    };
                }
                else if (url.indexOf(".baidu.com/mbox/streampage") > 0) {
                    obj.video_page.flag = "mboxvideo";
                    obj.playStreamPage();
                }
            });
        }
    }();

})();
