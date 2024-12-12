// ==UserScript==
// @name         百度网盘视频播放器（改）
// @namespace    https://github.com/geoi6sam1
// @version      0.8.5.20241212
// @description  https://scriptcat.org/script-show-page/340
// @author       geoi6sam1@qq.com
// @icon         https://staticwx.cdn.bcebos.com/mini-program/images/ic_video.png
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @match        http*://pan.baidu.com/s/*
// @match        http*://yun.baidu.com/s/*
// @match        http*://*.baidu.com/play/video*
// @match        http*://*.baidu.com/pfile/video*
// @match        http*://*.baidu.com/pfile/mboxvideo*
// @match        http*://*.baidu.com/mbox/streampage*
// @require      https://scriptcat.org/lib/950/1.0.1/Joysound.js
// @require      https://unpkg.com/jquery@3.7.1/dist/jquery.min.js
// @require      https://unpkg.com/hls.js@1.5.17/dist/hls.min.js
// @require      https://unpkg.com/dplayer@1.27.1/dist/DPlayer.min.js
// @run-at       document-end
// @grant        unsafeWindow
// @license      GPL-3.0
// ==/UserScript==


const obj = {
    video_page: {
        info: [],
        quality: [],
        categorylist: [],
        sub_info: [],
        adToken: "",
        flag: "",
    },
    shortcutKey: [["Esc", "退出全屏"],
    ["W", "切换页面全屏"],
    ["E", "选集播放"],
    ["R", "查看快捷键说明"],
    ["T", "切换外观"],
    ["F", "切换全屏"],
    ["B", "返回上级目录"],
    ["N", "恢复正常 1X 倍速"],
    ["M", "开启/关闭静音"],
    [",", "播放上一集"],
    [".", "播放下一集"],
    ["[", "减速播放"],
    ["]", "加速播放"],
    ["↑", "音量增加10%"],
    ["↓", "音量降低10%"],
    ["←", "快退5秒"],
    ["→", "快进5秒"],
    ["Space", "播放/暂停"],
    ["Ctrl + F", "页面中查找"],
    ["双击视频", "切换全屏"],
    ["长按视频", "临时 3X 倍速播放"]],
};


obj.storageFileListSharePage = function () {
    try {
        var currentList = obj.require("system-core:context/context.js").instanceForSystem.list.getCurrentList()
        if (currentList.length) {
            window.sessionStorage.setItem("sharePageFileList", JSON.stringify(currentList))
        } else {
            setTimeout(obj.storageFileListSharePage, 500)
        }
    } catch (error) { }
    window.onhashchange = function (e) {
        setTimeout(obj.storageFileListSharePage, 500)
    }
    document.querySelector(".fufHyA") && [...document.querySelectorAll(".fufHyA")].forEach(element => {
        element.onclick = function () {
            setTimeout(obj.storageFileListSharePage, 500)
        }
    })
}


obj.fileForcePreviewSharePage = function () {
    obj.getJquery()(document).on("click", "#shareqr dd", function (event) {
        try {
            var selectedFile = obj.require("system-core:context/context.js").instanceForSystem.list.getSelected()
            var file = selectedFile[0]
            if (file.category == 1) {
                var ext = file.server_filename.split(".").pop()
                if (["ts"].includes(ext)) {
                    window.open(`https://${location.host + location.pathname}?fid=${file.fs_id}`, "_blank")
                }
            }
        } catch (error) { }
    })
}


obj.playSharePage = function () {
    unsafeWindow.locals.get("file_list", "sign", "timestamp", "share_uk", "shareid", function (file_list, sign, timestamp, share_uk, shareid) {
        if (file_list.length > 1 || file_list[0].mediaType != "video") {
            obj.storageFileListSharePage()
            obj.fileForcePreviewSharePage()
            return
        }
        var [file] = obj.video_page.info = file_list, resolution = file.resolution, fid = file.fs_id, vip = obj.getVip()
        function getUrl(i) {
            return `/share/streaming?channel=chunlei&uk=${share_uk}&fid=${fid}&sign=${sign}&timestamp=${timestamp}&shareid=${shareid}&type=${i}&vip=${vip}&jsToken=${unsafeWindow.jsToken}`
        }
        obj.getAdToken(getUrl("M3U8_AUTO_480"), () => {
            obj.addQuality(getUrl, resolution)
            obj.useDPlayer()
        })
    })
}


obj.playHomePage = function () {
    obj.getJquery()(document).ajaxComplete(function (event, xhr, options) {
        var requestUrl = options.url
        if (requestUrl.indexOf("/api/categorylist") >= 0) {
        } else if (requestUrl.indexOf("/api/filemetas") >= 0) {
            var response = xhr.responseJSON
            if (response && response.info) {
                var [file] = obj.video_page.info = response.info, vip = obj.getVip()
                function getUrl(i) {
                    if (i.includes(1080)) vip > 1 || (i = i.replace(1080, 720))
                    return `/api/streaming?path=${encodeURIComponent(file.path)}&app_id=250528&clienttype=0&type=${i}&vip=${vip}&jsToken=${unsafeWindow.jsToken}`
                }
                obj.getAdToken(getUrl("M3U8_AUTO_480"), () => {
                    obj.addQuality(getUrl, file.resolution)
                    obj.useDPlayer()
                })
            }
        }
    })
}


obj.playPfilePage = function () {
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function (event) {
            if (this.readyState == 4 && this.status == 200) {
                var responseURL = this.responseURL
                if (responseURL.indexOf("/api/filemetas") > 0) {
                    var response = JSON.parse(this.response)
                    if (response.errno == 0 && Array.isArray(response.info) && response.info.length) {
                        if (response.info.length == 1 && obj.video_page.info.length == 0) {
                            var [file] = obj.video_page.info = response.info, vip = obj.getVip()
                            function getUrl(i) {
                                if (i.includes(1080)) vip > 1 || (i = i.replace(1080, 720))
                                return `/api/streaming?path=${encodeURIComponent(file.path)}&app_id=250528&clienttype=0&type=${i}&vip=${vip}&jsToken=${unsafeWindow.jsToken}`
                            }
                            obj.getAdToken(getUrl("M3U8_AUTO_480"), () => {
                                obj.addQuality(getUrl, file.resolution)
                                obj.useDPlayer()
                            })
                        } else {
                            obj.video_page.categorylist = response.info
                        }
                    }
                }
            }
        }, false)
        open.apply(this, arguments)
    }
}


obj.playIMPage = function () {
    var open = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function (event) {
            if (this.readyState == 4 && this.status == 200) {
                var responseURL = this.responseURL
                if (responseURL.indexOf("/mbox/msg/mediainfo") > 0) {
                    const response = JSON.parse(this.response)
                    if (response.errno == 0 || (response.errno == 133) && response.info) {
                        obj.video_page.adToken = response.adToken
                        var getParam = function (e, t) {
                            var o = new RegExp("(?:^|\\?|#|&)" + e + "=([^&#]*)(?:$|&|#)", "i"), n = o.exec(t || location.href)
                            return n ? encodeURI(n[1]) : ""
                        }, vip = obj.getVip()
                        var [file] = obj.video_page.info = [{
                            to: getParam("to"),
                            from_uk: getParam("from_uk"),
                            msg_id: getParam("msg_id"),
                            fs_id: getParam("fs_id"),
                            type: getParam("type"),
                            trans: "",
                            ltime: response.ltime,
                        }]
                        function getUrl(i) {
                            return `/mbox/msg/streaming?to=${file.to}&from_uk=${file.from_uk}&msg_id=${file.msg_id}&fs_id=${file.fs_id}&type=${file.type}&stream_type=${i}&trans=${file.trans}&ltime=${file.ltime}`
                        }
                        obj.getAdToken(getUrl("M3U8_AUTO_480"), () => {
                            obj.addQuality(getUrl, response.info.resolution)
                            obj.useDPlayer()
                        })
                    }
                } else if (responseURL.indexOf("/api/filemetas") > 0) {
                    const response = JSON.parse(this.response)
                    if (response.errno == 0 && Array.isArray(response.info) && response.info.length) {
                        obj.video_page.categorylist = response.info
                    }
                }
            }
        }, false)
        open.apply(this, arguments)
    }
}


obj.playStreamPage = function () {
    obj.getJquery()(document).ajaxComplete(function (event, xhr, options) {
        var requestUrl = options.url
        if (requestUrl.indexOf("/mbox/msg/mediainfo") >= 0) {
            var response = xhr.responseJSON
            if (response && response.info) {
                obj.video_page.adToken = response.adToken
                var getParam = obj.require("base:widget/tools/service/tools.url.js").getParam
                var [file] = obj.video_page.info = [{
                    from_uk: getParam("from_uk"),
                    to: getParam("to"),
                    fs_id: getParam("fs_id"),
                    name: getParam("name") || "",
                    type: getParam("type"),
                    md5: getParam("md5"),
                    msg_id: getParam("msg_id"),
                    path: decodeURIComponent(decodeURIComponent(getParam("path"))),
                }]
                function getUrl(i) {
                    return `/mbox/msg/streaming?from_uk=${file.from_uk}&to=${file.to}&msg_id=${file.msg_id}&fs_id=${file.fs_id}&type=${file.type}&stream_type=${i}`
                }
                obj.getAdToken(getUrl("M3U8_AUTO_480"), () => {
                    obj.addQuality(getUrl, response.info.resolution)
                    obj.useDPlayer()
                })
            }
        }
    })
}


obj.getAdToken = function (url, callback) {
    var jQuery = obj.getJquery()
    var adToken = obj.video_page.flag === "pfilevideo" || obj.video_page.flag == "mboxvideo" ? "" : obj.require("file-widget-1:videoPlay/Werbung/WerbungConfig.js").getAdToken()
    if (obj.video_page.adToken || (obj.video_page.adToken = adToken) || obj.getVip() > 1) {
        return callback && callback()
    }
    jQuery.ajax({
        url: url,
    }).done((n) => {
        if (133 === n.errno && 0 !== n.adTime) {
            obj.video_page.adToken = n.adToken
        }
        callback && callback()
    }).fail((n) => {
        var t = jQuery.parseJSON(n.responseText)
        if (t && 133 === t.errno && 0 !== t.adTime) {
            obj.video_page.adToken = t.adToken
        }
        callback && callback()
    })
}


obj.getPoster = function () {
    var file = obj.video_page.info.length ? obj.video_page.info[0] : ""
    if (file && file.thumbs) {
        return Object.values(file.thumbs).pop()
    }
    return ""
}


obj.addQuality = function (getUrl, resolution) {
    var r = {
        1080: "高清 1080P",
        720: "清晰 720P",
        480: "流畅 480P",
        360: "省流 360P",
    }
    var freeList = obj.freeList(resolution)
    freeList.forEach((a, index) => {
        obj.video_page.quality.push({
            name: r[a],
            url: getUrl("M3U8_AUTO_" + a) + "&isplayer=1&check_blue=1&adToken=" + encodeURIComponent(obj.video_page.adToken ? obj.video_page.adToken : ""),
            type: "hls",
        })
    })
}


obj.freeList = function (e = e || "") {
    var t = [480, 360]
    var a = e.match(/width:(\d+),height:(\d+)/)
    var i = +a[1] * +a[2]
    return i ? (i > 409920 && t.unshift(720), i > 921600 && t.unshift(1080), t) : t
}


obj.useDPlayer = function () {
    if (window.DPlayer) return obj.dPlayerStart()
}


obj.dPlayerStart = function () {
    var dPlayerNode, videoNode = document.getElementById("video-wrap") || document.querySelector(".vp-video__player")
    if (videoNode) {
        dPlayerNode = document.getElementById("dplayer")
        if (!dPlayerNode) {
            dPlayerNode = document.createElement("div")
            dPlayerNode.setAttribute("id", "dplayer")
            dPlayerNode.setAttribute("style", "width: 100%;height: 100%;")
            obj.videoNode = videoNode.parentNode.replaceChild(dPlayerNode, videoNode)
        }
    } else {
        console.warn("尝试再次获取播放器容器")
        return setTimeout(obj.dPlayerStart, 500)
    }
    var quality = obj.video_page.quality, defaultQuality = quality.findIndex(function (item) {
        return item.name == localStorage.getItem("dplayer-quality")
    })
    var options = {
        container: dPlayerNode,
        video: {
            quality: quality,
            defaultQuality: defaultQuality < 0 ? 0 : defaultQuality || 0,
            customType: {
                hls(video, player) {
                    const hls = new window.Hls({
                        maxBufferLength: 30 * 2 * 10,
                        xhrSetup(xhr, url) {
                            var originalHost = (url.match(/^http(?:s)?:\/\/(.*?)\//) || [])[1]
                            if (originalHost === location.host) return
                            if (/backhost=/.test(url)) {
                                var backhosts, backhostParam = (decodeURIComponent(url || "").match(/backhost=(\[.*\])/) || [])[1]
                                if (backhostParam) {
                                    try {
                                        backhosts = JSON.parse(backhostParam)
                                    } catch (e) { }
                                    if (backhosts && backhosts.length) {
                                        backhosts = [].concat(backhosts, [originalHost])
                                        var index = backhosts.findIndex((v) => {
                                            return v === player.realHost
                                        })
                                        player.realHost = backhosts[index + 1 >= backhosts.length ? 0 : index + 1]
                                    }
                                }
                            }
                            if (player.realHost) {
                                url = url.replace(originalHost, player.realHost)
                                xhr.open("GET", url, true)
                            }
                        },
                    })
                    hls.loadSource(video.src)
                    hls.attachMedia(video)
                    hls.on("hlsError", function (event, data) {
                        if (data.fatal) {
                            switch (data.type) {
                                case "networkError":
                                    if (data.details === "manifestLoadError") {
                                        var errno = JSON.parse(data.networkDetails.response).errno
                                        if (errno == 31341) {
                                            hls.loadSource(hls.url)
                                        } else {
                                            player.notice("视频加载错误，请刷新重试")
                                        }
                                    } else if (data.details === "manifestLoadTimeOut") {
                                        hls.loadSource(hls.url)
                                        player.notice("视频加载超时，正在重试");
                                    } else if (data.details === "manifestParsingError") {
                                        location.reload()
                                        player.notice("视频加载错误，正在重试...如一直重试请先排除错误")
                                    } else {
                                        hls.startLoad()
                                    }
                                    break
                                case "mediaError":
                                    hls.recoverMediaError()
                                    player.notice("视频无法正常加载...如一直出现此提示，请将·音质增强·关闭并刷新网页重试")
                                    break
                                default:
                                    hls.destroy()
                                    obj.msg("视频加载时遇到致命错误，已停止", "failure")
                                    break
                            }
                        }
                    })
                },
            },
            pic: obj.getPoster(),
        },
        subtitle: {
            url: "",
            type: "webvtt",
            color: localStorage.getItem("dplayer-subtitle-color") || "#ffd821",
            bottom: (localStorage.getItem("dplayer-subtitle-bottom") || 10) + "%",
            fontSize: (localStorage.getItem("dplayer-subtitle-fontSize") || 4) + "vh",
        },
        contextmenu: [{
            text: "快捷键说明",
            click: () => { obj.getJquery()(".dplayer-hotkey-panel").show() },
        }],
        autoplay: true,
        screenshot: true,
        hotkey: true,
        airplay: true,
        volume: 1.0,
        theme: "#0095ff",
    }
    try {
        var player = new window.DPlayer(options)
        obj.initPlayer(player)
        obj.resetPlayer()
        obj.msg("DPlayer 播放器创建成功")
    } catch (error) {
        obj.msg("DPlayer 播放器创建失败", "failure")
    }
}


obj.initPlayer = function (player) {
    var $ = obj.getJquery()
    const { container, template: { playButton, volumeButtonIcon, qualityButton, camareButton, subtitleButtonInner, settingButton, webFullButton, browserFullButton } } = player
    $(container).nextAll().remove()
    $(".dplayer-menu-item:has(a[href*='diygod'])").remove()
    location.pathname == "/mbox/streampage" && ($(container).css("height", "480px"), $("#ft").css("z-index", "0"))
    const attrtitlearr = [[playButton, "播放/暂停"], [volumeButtonIcon, "调整音量"], [qualityButton, "切换画质"], [camareButton, "截图"], [subtitleButtonInner, "显示/隐藏字幕"], [settingButton, "设置"], [webFullButton, "页面全屏"], [browserFullButton, "全屏"]]
    attrtitlearr.forEach((item) => {
        $(item[0]).attr("title", item[1])
    })
    obj.playerReady(player, (player) => {
        obj.gestureInit(player)
        obj.longPressInit(player)
        obj.dPlayerPip(player)
        obj.dPlayerSubtitleSetting()
        obj.initPlayerEvents(player)
        obj.videoFit(player)
        obj.dPlayerSetting(player)
        obj.dPlayerCustomSpeed(player)
        obj.dPlayerMemoryPlay(player)
        obj.dPlayerVolumeEnhancer(player)
        obj.autoPlayEpisode(player)
        obj.hotKeyPanel(player)
        obj.setHeaderBoxBtn()
        obj.addCueVideoSubtitle(player, (textTracks) => {
            if (textTracks) {
                obj.selectSubtitles(textTracks)
                player.subtitle.container.style.textShadow = "1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000"
                player.subtitle.container.style.fontFamily = "黑体, Trajan, serif"
            }
        })
    })
}


obj.pageTheme = function () {
    var $ = obj.getJquery()
    function toggletheme(name) {
        var prefix = "-theme"
        const keysWithPrefix = []
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.endsWith(prefix)) {
                keysWithPrefix.push(key)
            }
        }
        keysWithPrefix.forEach(key => {
            const newValue = name
            localStorage.setItem(key, newValue)
        })
    }
    var flag = obj.video_page.flag
    if (flag == "pfilevideo") {
        if ($("html").attr("data-theme") == "light") {
            $("html").attr("data-theme", "dark")
            toggletheme("dark")
        } else {
            $("html").attr("data-theme", "light")
            toggletheme("light")
        }
    } else if (flag == "playvideo") {
        if ($("#video-close-lights").css("display") == "none") {
            $("#video-close-lights").css({
                "display": "block",
                "opacity": 1,
            })
            $('body').css('overflow-x', 'hidden')
        } else {
            $("#video-close-lights").css({
                "opacity": 0,
                "display": "none",
            })
            $('body').css('overflow-x', 'auto')
        }
    } else {
        obj.msg("当前页面不支持切换外观", "failure")
    }
}


obj.setHeaderBoxBtn = function () {
    var $ = obj.getJquery()
    var lh = location.href, url, html
    var fi = lh.indexOf('%2F')
    var li = lh.lastIndexOf('%2F', lh.lastIndexOf('%2F') - 3)
    var path = lh.slice(fi, li)
    var flag = obj.video_page.flag
    if (flag == "pfilevideo") {
        url = `https://${location.host}/disk/main#/index?category=all&path=${path}`
        html = `<style>
#toggletheme, #backcatalog { display: inline-block;min-width: 78px;height: 14px;line-height: 14px;outline: none;text-decoration: none;font-size: 14px;color: #f5f5f5;border: solid 2px #09aaff;background: #09aaff;cursor: pointer;text-align: center;padding: 8px 12px;margin: 0 5px;border-radius: 19px; }
#toggletheme:hover, #backcatalog:hover { border: solid 2px #4e97ff !important; background: #4e97ff !important; }
</style>
<a id="backcatalog" href="${url}">返回上级目录</a>
<a id="toggletheme" href="javascript:;">切换外观</a>`
        $(".vp-aside.vp-personal-aside").prepend(html)
    } else if (flag == "playvideo") {
        url = `https://${location.host}/disk/home?stayAtHome=true#/all?vmode=list&path=${path}`
        html = `<style>
#toggletheme, #backcatalog { display: inline-block;min-width: 78px;height: 14px;line-height: 14px;outline: none;text-decoration: none;font-size: 14px;color: #f5f5f5;border: solid 2px #09aaff;background: #09aaff;cursor: pointer;text-align: center;padding: 8px 12px;margin: 0 5px;border-radius: 19px; }
#toggletheme:hover, #backcatalog:hover { border: solid 2px #4e97ff !important; background: #4e97ff !important; }
</style>
<a id="backcatalog" href="${url}">返回上级目录</a>
<a id="toggletheme" href="javascript:;">切换外观</a>`
        $(".header-box [node-type='header-link']").append(html)
    }
    $(".video-content").append(`<div id="video-close-lights" style="display: none;"></div>`)
    $("#toggletheme").on("click", function () {
        obj.pageTheme()
    })
    function resizeOverlay() {
        var windowWidth = $(window).width()
        $("#video-close-lights").css({
            "width": windowWidth,
            "height": $("body").height(),
            "right": -(windowWidth - $(".video-wrap-outer").width()) / 2,
            "bottom": 0,
        })
    }
    resizeOverlay()
    $(window).resize(resizeOverlay)
}


obj.playerReady = function (player, callback) {
    if (player.isReady) {
        callback && callback(player)
    } else if (player.video.duration > 0 || player.video.readyState > 2) {
        player.isReady = true
        callback && callback(player)
    } else {
        player.video.ondurationchange = function () {
            player.video.ondurationchange = null
            player.isReady = true
            callback && callback(player)
        }
    }
    setTimeout(() => {
        if (player.isReady) {
            sessionStorage.removeItem("startError")
        } else {
            if (sessionStorage.getItem("startError")) {
                sessionStorage.removeItem("startError")
            } else {
                sessionStorage.setItem("startError", 1)
                location.reload()
            }
        }
    }, 9999)
}


obj.initPlayerEvents = function (player) {
    var $ = obj.getJquery()
    const { user, video: { duration }, container: { offsetWidth, offsetHeight } } = player
    player.on("error", function () {
        if (duration === 0 || duration === Infinity || duration.toString() === "NaN") {
            obj.msg("ERROR", failure)
        }
    })
    player.on("ended", function () {
        user.get("autoplaynext") && $(".next-icon").click()
    })
    player.on("quality_end", function () {
        localStorage.setItem("dplayer-quality", player.quality.name)
        obj.addCueVideoSubtitle(player, function (textTracks) {
            if (textTracks) {
                obj.selectSubtitles(textTracks)
            }
        })
    })
    player.template.videoWrap.addEventListener("dblclick", () => {
        player.fullScreen.toggle("browser")
    })
    player.on("webfullscreen", function () {
        $("#video-wrap-outer").css("z-index", "99")
    });
    player.on("webfullscreen_cancel", function () {
        $("#video-wrap-outer").css("z-index", "49")
    });
    player.on("fullscreen", function () {
        screen.orientation.lock("landscape")
    })
    player.on("fullscreen_cancel", function () {
        screen.orientation.unlock()
    })
    document.querySelector(".dplayer .dplayer-full").addEventListener("click", () => {
        var isFullScreen = player.fullScreen.isFullScreen("web") || player.fullScreen.isFullScreen("browser")
        localStorage.setItem("dplayer-isfullscreen", isFullScreen)
    })
};


obj.hotKeyPanel = function (player) {
    var $ = obj.getJquery()
    var html = `
<div class="dplayer-hotkey-panel" style="display: none;background-color: rgba(28,28,28,.9);border-radius: 5px;color: #f5f5f5;left: 50%;position: absolute;text-align: center;top: 50%;transform: translate(-50%,-50%);width: 400px;user-select: none;z-index: 10;">
<div class="dplayer-hotkey-panel-title" style="border-bottom: 1px solid hsla(0,0%,100%,.1);font-size: 18px;font-weight: bold;line-height: 45px;text-align: center;">快捷键说明
<span class="dplayer-hotkey-panel-close" style="fill: #f5f5f5;color: #f5f5f5;cursor: pointer;height: 24px;line-height: 24px;position: absolute;right: 12px;top: 12px;width: 22px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m8 6.939 3.182-3.182a.75.75 0 1 1 1.061 1.061L9.061 8l3.182 3.182a.75.75 0 1 1-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 1 1-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 1 1 1.061-1.061L8 6.939z"></path></svg></span>
</div>
<div class="dplayer-hotkey-panel-area" style="margin: 10px 0;max-height: 250px;overflow: hidden auto;"></div>
</div>`
    $("#dplayer").append(html)
    obj.shortcutKey.forEach((val) => {
        var html = `
<div class="dplayer-hotkey-panel-content" style="padding: 0 20px;transform: translate(0px, 0px) scale(1) translateZ(0px);">
<div class="dplayer-hotkey-panel-content-item" style="font-size: 14px;height: 28px;line-height: 28px;min-width: 360px;text-align: center;">
<span class="dplayer-hotkey-panel-content-name" style="display: inline-block;width: 120px;">${val[0]}</span>
<span class="dplayer-hotkey-panel-content-desc" style="color: #969696;display: inline-block;width: 190px;">${val[1]}</span>
</div></div>`
        $(".dplayer-hotkey-panel-area").append(html)
    })
    $(".dplayer-hotkey-panel-close").on("click", () => {
        $(".dplayer-hotkey-panel").hide()
    })
    window.addEventListener("keydown", (event) => {
        const e = window.event || event
        const k = e.keyCode || e.which
        const localSpeed = Number(localStorage.getItem("dplayer-speed"))
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return
        switch (k) {
            // 快捷键：B（返回上级目录）
            case 66:
                var doc = document.querySelector("#backcatalog")
                doc == null ? (player.notice("没有获取到目录，请尝试刷新页面"), obj.msg("没有获取到目录，请尝试刷新页面", "failure")) : doc.click()
                break
            // 快捷键：E（选集播放）
            case 69:
                var doc = document.querySelector(".dplayer-episode-panel")
                doc == null ? (player.notice("无更多视频了/视频列表获取失败，请尝试刷新页面"), obj.msg("无更多视频了/视频列表获取失败，请尝试刷新页面", "failure")) : doc.style.display == "none" ? doc.style.display = "block" : doc.style.display = "none"
                break
            // 快捷键：F（切换全屏）
            case 70:
                player.fullScreen.toggle("browser")
                break
            // 快捷键：M（开启/关闭静音）
            case 77:
                player.video.muted == true ? player.volume(player.volume()) : (player.video.muted = true, document.querySelector(".dplayer-volume-bar-inner").style.width = "0%", player.notice("静音"))
                break
            // 快捷键：N（恢复正常 1X 倍速）
            case 78:
                player.speed(1)
                break
            // 快捷键：R（查看快捷键说明）
            case 82:
                var doc = document.querySelector(".dplayer-hotkey-panel")
                doc.style.display == "none" ? doc.style.display = "block" : doc.style.display = "none"
                break
            // 快捷键：T（切换外观）
            case 84:
                obj.pageTheme()
                break
            // 快捷键：W（切换页面全屏）
            case 87:
                player.fullScreen.toggle('web')
                break
            // 快捷键：.<（播放上一集）
            case 188:
                var prev = document.querySelector(".prev-icon")
                prev == null ? (player.notice("没有上一集了"), obj.msg("没有上一集了", "failure")) : prev.click()
                break
            // 快捷键：,>（播放下一集）
            case 190:
                var next = document.querySelector(".next-icon")
                next == null ? (player.notice("没有下一集了"), obj.msg("没有下一集了", "failure")) : next.click()
                break
            // 快捷键：[{（减速播放）
            case 219:
                (localSpeed - 0.25 > 0) ? player.speed((localSpeed - 0.25).toFixed(2)) : player.speed(0.1)
                break
            // 快捷键：]}（加速播放）
            case 221:
                (localSpeed + 0.25 < 16) ? player.speed((localSpeed + 0.25).toFixed(2)) : player.speed(16)
                break
        }
    })
}


obj.dPlayerSetting = function (player) {
    var $ = obj.getJquery()
    if ($(".dplayer-setting-autoposition").length) return
    var html = `<style>
.dplayer-setting-item input:checked + label:before { background-color: #0095ff !important; }
</style>
<div class="dplayer-setting-item dplayer-setting-autoposition">
<span class="dplayer-label">自动记忆播放</span>
<div class="dplayer-toggle">
<input class="dplayer-toggle-setting-input-autoposition" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label>
</div></div>
<div class="dplayer-setting-item dplayer-setting-autoplaynext">
<span class="dplayer-label">自动连续播放</span>
<div class="dplayer-toggle">
<input class="dplayer-toggle-setting-input-autoplaynext" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label>
</div></div>
<div class="dplayer-setting-item dplayer-setting-soundenhancement">
<span class="dplayer-label">音质增强</span>
<div class="dplayer-toggle">
<input class="dplayer-toggle-setting-input-soundenhancement" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label>
</div></div>
<div class="dplayer-setting-item dplayer-setting-imageenhancement">
<span class="dplayer-label">画质增强</span>
<div class="dplayer-toggle">
<input class="dplayer-toggle-setting-input-imageenhancement" type="checkbox" name="dplayer-toggle"><label for="dplayer-toggle"></label>
</div></div>`
    $(".dplayer-setting-origin-panel").append(html)
    const { user, events, template: { video }, container: { offsetWidth, offsetHeight } } = player
    Object.assign(user.storageName, { autoposition: "dplayer-autoposition", autoplaynext: "dplayer-autoplaynext", imageenhancement: "dplayer-imageenhancement", soundenhancement: "dplayer-soundenhancement" })
    Object.assign(user.default, { autoposition: 0, autoplaynext: 0, imageenhancement: 0, soundenhancement: 0 })
    user.init()
    user.get("autoposition") && ($(".dplayer-toggle-setting-input-autoposition").get(0).checked = true)
    user.get("autoplaynext") && ($(".dplayer-toggle-setting-input-autoplaynext").get(0).checked = true)
    user.get("soundenhancement") && ($(".dplayer-toggle-setting-input-soundenhancement").get(0).checked = true)
    user.get("imageenhancement") && ($(".dplayer-toggle-setting-input-imageenhancement").get(0).checked = true)
    $(".dplayer-setting-autoposition").on("click", function () {
        var toggle = $(".dplayer-toggle-setting-input-autoposition")
        var checked = !toggle.is(":checked")
        toggle.get(0).checked = checked, user.set("autoposition", Number(checked))
    })
    $(".dplayer-setting-autoplaynext").on("click", function () {
        var toggle = $(".dplayer-toggle-setting-input-autoplaynext")
        var checked = !toggle.is(":checked")
        toggle.get(0).checked = checked, user.set("autoplaynext", Number(checked))
    })
    $(".dplayer-setting-soundenhancement").on("click", function () {
        var toggle = $(".dplayer-toggle-setting-input-soundenhancement")
        var checked = !toggle.is(":checked")
        toggle.get(0).checked = checked, user.set("soundenhancement", Number(checked)), obj.dPlayerSoundEnhancer(player)
    })
    $(".dplayer-setting-imageenhancement").on("click", function () {
        var toggle = $(".dplayer-toggle-setting-input-imageenhancement")
        var checked = !toggle.is(":checked")
        toggle.get(0).checked = checked, user.set("imageenhancement", Number(checked)), obj.dPlayerImageEnhancer(player)
    })
    player.on("playing", () => {
        if (!player.joySound) {
            let value = user.get("gain")
            value && events.trigger("gain_value", value)
            setTimeout(() => {
                obj.dPlayerSoundEnhancer(player)
                obj.dPlayerImageEnhancer(player)
            }, 1e3)
        }
    })
    player.on("quality_end", () => {
        if (player.joySound) {
            player.joySound.destroy()
            player.joySound = null
        }
    })
}


obj.dPlayerCustomSpeed = function (player) {
    var $ = obj.getJquery()
    if ($(".dplayer-setting-speed-item[data-speed='自定义']").length) return
    var localSpeed = localStorage.getItem("dplayer-speed")
    localSpeed && player.speed(localSpeed)
    var html = `
<div class="dplayer-setting-custom-speed" style="display: none;right: 78px;position: absolute;bottom: 50px;width: 150px;height: 100%;border-radius: 2px;background: rgba(28, 28, 28,.9);transition: all .3s ease-in-out;overflow: hidden;z-index: 2;">
<div class="dplayer-speed-item" title="双击恢复正常速度" style="display: grid;grid-template-columns: auto auto;justify-items: center;align-items: center;width: 100%;height: 100%;cursor: pointer;">
<span class="dplayer-speed-label" style="justify-self: end;color: #eee;font-size: 13px;white-space: nowrap;">播放速度：</span>
<input type="number" style="justify-self: start;width: 55px;height: 18px;line-height:18px;font-size: 14px;border-radius: 5px;text-align: center;" step=".1" max="16" min=".1">
</div></div>`
    $(".dplayer-setting-speed-panel").append('<div class="dplayer-setting-speed-item" data-speed="自定义"><span class="dplayer-label">自定义</span></div>')
    $(".dplayer-setting").append(html)
    var custombox = $(".dplayer-setting-custom-speed")
    var input = $(".dplayer-setting-custom-speed input")
    input.val(localSpeed || 1)
    input.on("input propertychange", function (e) {
        var val = input.val()
        input.val(val)
        player.speed(val)
    })
    player.on("ratechange", function () {
        const { video: { playbackRate, duration } } = player
        player.notice("播放速度：" + playbackRate)
        localStorage.setItem("dplayer-speed", playbackRate)
        input.val(playbackRate)
    })
    $(".dplayer-speed-item").dblclick(function () {
        input.val(1)
        player.speed(1)
    })
    $(".dplayer-setting-speed-item[data-speed='自定义']").on("click", function () {
        if (document.querySelector(".dplayer .dplayer-menu").classList.contains("dplayer-menu-show")) {
            obj.msg("\u8bf7\u4f7f\u7528\u7231\u53d1\u7535\u4f53\u9a8c\u6d4b\u8bd5\u529f\u80fd")
        } else {
            const { container: { offsetWidth, offsetHeight } } = player
            custombox.css("display") == "block" ? (custombox.css("display", "none"), player.setting.hide()) : custombox.css("display", "block")
        }
    }).prevAll().on("click", function () {
        custombox.css("display", "none")
    })
    player.template.mask.addEventListener("click", function () {
        custombox.css("display", "none")
    })
}


obj.dPlayerMemoryPlay = function (player) {
    var $ = obj.getJquery()
    if (this.hasMemoryDisplay) return
    this.hasMemoryDisplay = true
    const { user, video, video: { duration } } = player
    var file = obj.video_page.info[0] || {}
    var sign = file.md5 || file.fs_id
    var memoryTime = getFilePosition(sign)
    if (memoryTime && parseInt(memoryTime)) {
        var autoPosition = user.get("autoposition")
        if (autoPosition) {
            player.seek(memoryTime)
            player.play()
        } else {
            var formatTime = formatVideoTime(memoryTime)
            var html = `
<div class="memory-play-wrap" style="display: block;position: absolute;left: 30px;bottom: 60px;font-size: 15px;padding: 7px;border-radius: 3px;color: #fff;z-index:100;background: rgba(0,0,0,.5);">上次播放到：${formatTime}&nbsp;&nbsp;&nbsp;
<a href="javascript:void(0)" class="play-jump" style="text-decoration: none;color: #06c;">跳转播放</a><span>&nbsp;&nbsp;</span>
<em class="close-btn" style="display: inline-block;width: 15px;height: 15px;vertical-align: middle;cursor: pointer;background: url(https://nd-static.bdstatic.com/m-static/disk-share/widget/pageModule/share-file-main/fileType/video/img/video-flash-closebtn_15f0e97.png) no-repeat;"></em>
</div>`
            $(player.container).append(html)
            var memoryTimeout = setTimeout(function () {
                $(".memory-play-wrap").remove()
            }, 12345)
            $(".memory-play-wrap .close-btn").click(function () {
                $(".memory-play-wrap").remove()
                clearTimeout(memoryTimeout)
            })
            $(".memory-play-wrap .play-jump").click(function () {
                player.seek(memoryTime)
                player.play()
                $(".memory-play-wrap").remove()
                clearTimeout(memoryTimeout)
            })
        }
    }
    document.onvisibilitychange = function () {
        if (document.visibilityState === "hidden") {
            var currentTime = player.video.currentTime
            currentTime && setFilePosition(sign, currentTime, duration)
        }
    }
    window.onbeforeunload = function () {
        var currentTime = player.video.currentTime
        currentTime && setFilePosition(sign, currentTime, duration)
    }
    function getFilePosition(e) {
        return (localStorage.getItem("video_" + e) || 0)
    }
    function setFilePosition(e, t, o) {
        e && t && (e = "video_" + e, t <= 60 || t + 60 >= o || 0 ? localStorage.removeItem(e) : localStorage.setItem(e, t))
    }
    function formatVideoTime(seconds) {
        var secondTotal = Math.round(seconds)
        var hour = Math.floor(secondTotal / 3600)
        var minute = Math.floor((secondTotal - hour * 3600) / 60)
        var second = secondTotal - hour * 3600 - minute * 60
        minute < 10 && (minute = "0" + minute)
        second < 10 && (second = "0" + second)
        return hour === 0 ? minute + ":" + second : hour + ":" + minute + ":" + second
    }
}


obj.dPlayerVolumeEnhancer = function (player) {
    var $ = obj.getJquery()
    if ($(".dplayer-setting .dplayer-setting-gain").length) return
    var html = `<style>
.dplayer-danmaku-bar .dplayer-gain-bar-inner, .dplayer-danmaku-bar .dplayer-thumb { background-color: #0095ff !important }
</style>
<div class="dplayer-setting-item dplayer-setting-danmaku dplayer-setting-gain" style="display: block;">
<span class="dplayer-label">音量增强</span>
<div class="dplayer-danmaku-bar-wrap dplayer-gain-bar-wrap"><div class="dplayer-danmaku-bar dplayer-gain-bar"><div class="dplayer-danmaku-bar-inner dplayer-gain-bar-inner" style="width: 0%;"><span class="dplayer-thumb"></span></div></div></div>
</div>`
    $(".dplayer-setting .dplayer-setting-origin-panel").prepend(html)
    const { user, bar, template, events, video } = player
    Object.assign(user.storageName, { gain: "dplayer-gain" })
    Object.assign(user.default, { gain: 0 })
    user.init()
    bar.elements.gain = $(".dplayer-setting .dplayer-setting-gain").find(".dplayer-gain-bar-inner").get(0)
    template.gainBox = $(".dplayer-setting .dplayer-setting-gain").get(0)
    template.gainBarWrap = $(".dplayer-setting .dplayer-setting-gain").find(".dplayer-gain-bar-wrap").get(0)
    events.playerEvents.push("gain_value")
    player.on("gain_value", (percentage) => {
        percentage = Math.min(Math.max(percentage, 0), 1)
        bar.set("gain", percentage, "width")
        user.set("gain", percentage)
        obj.setVolume(percentage, player)
    });
    const gainMove = (event) => {
        const e = event || window.event
        let percentage = ((e.clientX || e.changedTouches[0].clientX) - getBoundingClientRectViewLeft(template.gainBarWrap)) / 130
        events.trigger("gain_value", percentage)
    }
    const gainUp = () => {
        document.removeEventListener("touchend", gainUp)
        document.removeEventListener("touchmove", gainMove)
        document.removeEventListener("mouseup", gainUp)
        document.removeEventListener("mousemove", gainMove)
        template.gainBox.classList.remove("dplayer-setting-danmaku-active")
    }
    template.gainBarWrap.addEventListener("click", (event) => {
        const e = event || window.event
        let percentage = ((e.clientX || e.changedTouches[0].clientX) - getBoundingClientRectViewLeft(template.gainBarWrap)) / 130
        events.trigger("gain_value", percentage)
    })
    template.gainBarWrap.addEventListener("touchstart", () => {
        document.addEventListener("touchmove", gainMove)
        document.addEventListener("touchend", gainUp)
        template.gainBox.classList.add("dplayer-setting-danmaku-active")
    })
    template.gainBarWrap.addEventListener("mousedown", () => {
        document.addEventListener("mousemove", gainMove)
        document.addEventListener("mouseup", gainUp)
        template.gainBox.classList.add("dplayer-setting-danmaku-active")
    })
    var offset
    function getBoundingClientRectViewLeft(element) {
        const scrollTop = window.scrollY || window.pageYOffset || document.body.scrollTop + ((document.documentElement && document.documentElement.scrollTop) || 0)
        if (element.getBoundingClientRect) {
            if (typeof offset !== "number") {
                let temp = document.createElement("div");
                temp.style.cssText = "position:absolute;top:0;left:0;"
                document.body.appendChild(temp)
                offset = -temp.getBoundingClientRect().top - scrollTop
                document.body.removeChild(temp)
                temp = null
            }
            const rect = element.getBoundingClientRect()
            return rect.left + offset
        } else {
            return getElementViewLeft(element)
        }
    }
    function getElementViewLeft(element) {
        let actualLeft = element.offsetLeft
        let current = element.offsetParent
        const elementScrollLeft = document.body.scrollLeft + document.documentElement.scrollLeft
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            while (current !== null) {
                actualLeft += current.offsetLeft
                current = current.offsetParent
            }
        } else {
            while (current !== null && current !== element) {
                actualLeft += current.offsetLeft
                current = current.offsetParent
            }
        }
        return actualLeft - elementScrollLeft
    }
}


obj.setVolume = function (percentage, player) {
    const { video, joySound } = player
    if (joySound) {
        joySound.setVolume(percentage)
    } else {
        if (window.Joysound && window.Joysound.isSupport()) {
            let joySound = player.joySound = new window.Joysound()
            joySound.hasSource() || joySound.init(video)
            joySound.setVolume(percentage)
        }
    }
}


obj.dPlayerSoundEnhancer = function (player) {
    const { user, video, joySound } = player
    if (user.get("soundenhancement")) {
        if (joySound) {
            joySound.setEnabled(!0)
        } else {
            if (window.Joysound && window.Joysound.isSupport()) {
                let joySound = player.joySound = new window.Joysound()
                joySound.hasSource() || joySound.init(video)
                joySound.setEnabled(!0)
            }
        }
    } else {
        joySound && joySound.hasSource() && joySound.setEnabled(!1)
    }
}


obj.dPlayerImageEnhancer = function (player) {
    var $ = obj.getJquery()
    const { user, video } = player
    user.get("imageenhancement") ? $(video).css("filter", "contrast(1.01) brightness(1.05) saturate(1.1)") : $(video).css("filter", "")
}


obj.gestureInit = function (player) {
    const { video, videoWrap, playedBarWrap } = player.template
    let isDroging = false, startX = 0, startY = 0, startCurrentTime = 0, startVolume = 0, startBrightness = "100%", lastDirection = 0
    const onTouchStart = (event) => {
        if (event.touches.length === 1) {
            isDroging = true
            const { clientX, clientY } = event.touches[0]
            startX = clientX
            startY = clientY
            startCurrentTime = video.currentTime
            startVolume = video.volume
            startBrightness = (/brightness\((\d+%?)\)/.exec(video.style.filter) || [])[1] || "100%"
        }
    }
    const onTouchMove = (event) => {
        if (event.touches.length === 1 && isDroging) {
            const { clientX, clientY } = event.touches[0]
            const client = player.isRotate ? clientY : clientX
            const { width, height } = video.getBoundingClientRect()
            const ratioX = clamp((clientX - startX) / width, -1, 1)
            const ratioY = clamp((clientY - startY) / height, -1, 1)
            const ratio = player.isRotate ? ratioY : ratioX
            const direction = getDirection(startX, startY, clientX, clientY)
            if (direction != lastDirection) {
                lastDirection = direction
                return
            }
            if (direction == 1 || direction == 2) {
                if (!lastDirection) lastDirection = direction
                if (lastDirection > 2) return
                const middle = player.isRotate ? height / 2 : width / 2
                if (client < middle) {
                    const currentBrightness = clamp(+((/\d+/.exec(startBrightness) || [])[0] || 100) + 200 * ratio * 10, 50, 200)
                    video.style.cssText += "filter: brightness(" + currentBrightness.toFixed(0) + "%)"
                    // player.notice(`亮度调节 ${currentBrightness.toFixed(0)}%`)
                } else if (client > middle) {
                    const currentVolume = clamp(startVolume + ratio * 10, 0, 1)
                    player.volume(currentVolume)
                }
            } else if (direction == 3 || direction == 4) {
                if (!lastDirection) lastDirection = direction
                if (lastDirection < 3) return
                const currentTime = clamp(startCurrentTime + video.duration * ratio * 0.5, 0, video.duration)
                player.seek(currentTime)
            }
        }
    }
    const onTouchEnd = () => {
        if (isDroging) {
            startX = 0
            startY = 0
            startCurrentTime = 0
            startVolume = 0
            lastDirection = 0
            isDroging = false
        }
    }
    videoWrap.addEventListener('touchstart', (event) => {
        onTouchStart(event)
    })
    playedBarWrap.addEventListener('touchstart', (event) => {
        onTouchStart(event)
    })
    videoWrap.addEventListener('touchmove', onTouchMove)
    playedBarWrap.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
        if (window.orientation === 180 || window.orientation === 0) {
            player.isRotate = true
        } else if (window.orientation === 90 || window.orientation === -90) {
            player.isRotate = false
        }
    }, false)
    function clamp(num, a, b) {
        return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))
    }
    function getDirection(startx, starty, endx, endy) {
        var angx = endx - startx
        var angy = endy - starty
        var result = 0
        if (Math.abs(angx) < 2 && Math.abs(angy) < 2) return result
        var angle = Math.atan2(angy, angx) * 180 / Math.PI
        if (angle >= -135 && angle <= -45) {
            result = 1
        } else if (angle > 45 && angle < 135) {
            result = 2
        } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
            result = 3
        } else if (angle >= -45 && angle <= 45) {
            result = 4
        }
        return result
    }
}


obj.longPressInit = function (player) {
    const { video, videoWrap } = player.template;
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
            isDroging = true;
            speed = video.playbackRate
            timer = setInterval(() => {
                isLongPress = true
                player.speed(speed * 3)
                player.contextmenu.hide()
            }, 1000)
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


obj.dPlayerPip = function (player) {
    var $ = obj.getJquery()
    if ($(".dplayer-icons-right .dplayer-pip-btn").length) return
    var html = `
<div class="dplayer-pip-btn" style="display:inline-block;height: 100%;">
<button class="dplayer-icon dplayer-pip-icon" title="画中画" data-balloon="画中画" data-balloon-pos="up">
<span class="dplayer-icon-content" style=""><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M2.667 2.667h18.667v18.667h-18.667v-18.667M29.333 10.667v18.667h-18.667v-5.333h2.667v2.667h13.333v-13.333h-2.667v-2.667h5.333z"></path></svg></span>
</button></div>`
    $(".dplayer-setting").before(html)
    const { template: { video } } = player
    $(".dplayer-pip-btn button").on("click", function () {
        if (document.pictureInPictureEnabled) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().then((width, height, resize) => {
                    $(this).find(".dplayer-icon-content").css("opacity", "")
                }).catch((err) => {
                    player.notice(err)
                })
            } else {
                video.requestPictureInPicture().then((width, height, resize) => {
                    $(this).find(".dplayer-icon-content").css("opacity", .4)
                    video.onleavepictureinpicture = () => {
                        video.onleavepictureinpicture = null
                        $(".dplayer-pip-btn .dplayer-icon-content").css("opacity", "")
                    }
                }).catch((err) => {
                    player.notice(err)
                })
            }
        } else if (video.webkitSupportsPresentationMode) {
            if (video.webkitPresentationMode == "picture-in-picture") {
                video.webkitSetPresentationMode("inline")
                $(this).find(".dplayer-icon-content").css("opacity", "")
            } else {
                video.webkitSetPresentationMode("picture-in-picture")
                $(this).find(".dplayer-icon-content").css("opacity", .4)
                video.onwebkitpresentationmodechanged = () => {
                    video.onwebkitpresentationmodechanged = null
                    $(".dplayer-pip-btn .dplayer-icon-content").css("opacity", "")
                }
            }
        } else {
            player.notice("画中画模式不可用")
        }
    })
}


obj.videoFit = function (player) {
    var $ = obj.getJquery()
    if ($(".dplayer-icons-right .btn-select-fit").length) return
    var html = `
<div class="dplayer-quality btn-select-fit">
<button class="dplayer-icon dplayer-quality-icon" title="切换画面模式">画面模式</button>
<div class="dplayer-quality-mask">
<div class="dplayer-quality-list">
<div class="dplayer-quality-item" data-index="0">原始比例</div>
<div class="dplayer-quality-item" data-index="1">自动裁剪</div>
<div class="dplayer-quality-item" data-index="2">拉伸填充</div>
<div class="dplayer-quality-item" data-index="3">系统默认</div>
</div></div></div>`
    $(".dplayer-icons.dplayer-icons-right").prepend(html)
    var arrfit = ["none", "cover", "fill", ""]
    var nowfit = $(`.btn-select-fit .dplayer-quality-item[data-index="${arrfit.indexOf(player.video.style["object-fit"])}"]`)
    $(".btn-select-fit .dplayer-icon").text(nowfit.text())
    $(".btn-select-fit .dplayer-quality-item").on("click", function () {
        var $this = $(this), vfit = arrfit[$this.attr("data-index")]
        player.video.style["object-fit"] = vfit
        $(".btn-select-fit .dplayer-icon").text($this.text())
    })
}


obj.autoPlayEpisode = function (player) {
    if ($(".dplayer-icons-right #btn-select-episode").length) return
    var flag = obj.video_page.flag
    if (flag == "sharevideo") {
        obj.selectEpisodeSharePage(player)
    } else if (flag == "playvideo") {
        obj.selectEpisodeHomePage(player)
    } else if (flag == "pfilevideo") {
        obj.selectEpisodePfilePage(player)
    } else if (flag == "mboxvideo") {
    }
}


obj.selectEpisodeSharePage = function (player) {
    var fileList = JSON.parse(sessionStorage.getItem("sharePageFileList") || "[]")
    var videoList = fileList.filter(function (item, index) {
        return item.category == 1
    })
    var file = obj.video_page.info[0];
    var fileIndex = videoList.findIndex(function (item, index) {
        return item.fs_id == file.fs_id
    })
    if (fileIndex > -1 && videoList.length > 1) {
        obj.createEpisodeElement(videoList, fileIndex, player)
    }
}


obj.selectEpisodeHomePage = function (player) {
    var videoList = []
    obj.getJquery()("#videoListView").find(".video-item").each(function () {
        videoList.push({
            server_filename: this.title,
        })
    })
    var currpath = obj.require("system-core:context/context.js").instanceForSystem.router.query.get("path")
    var server_filename = currpath.split("/").pop()
    var fileIndex = videoList.findIndex(function (item, index) {
        return item.server_filename == server_filename
    })
    if (fileIndex > -1 && videoList.length > 1) {
        obj.createEpisodeElement(videoList, fileIndex, player)
    }
}


obj.selectEpisodePfilePage = function (player) {
    var videoList = obj.video_page.categorylist
    if (videoList.length > 1) {
        var server_filename = obj.video_page.info[0].server_filename
        var fileIndex = videoList.findIndex(function (item, index) {
            return item.server_filename == server_filename
        })
        if (fileIndex > -1) {
            obj.createEpisodeElement(videoList, fileIndex, player)
        }
    }
}


obj.createEpisodeElement = function (videoList, fileIndex, player) {
    var $ = obj.getJquery()
    var eleitem = "", nowplayindex = ""
    videoList.forEach(function (item, index) {
        if (fileIndex == index) {
            nowplayindex = index + 1
            eleitem += `
<div class="video-item active" title="${item.server_filename}" style="color: #0095ff;cursor: pointer;font-size: 14px;height:38px;line-height: 38px;overflow: hidden;padding: 0 15px;text-overflow: ellipsis;white-space: nowrap;">
<span style="font-size: 15px;font-weight:bold;padding-right:5px;">${nowplayindex}.</span>${item.server_filename}
</div>`
        } else {
            eleitem += `
<div class="video-item" title="${item.server_filename}" style="color: #fff;cursor: pointer;font-size: 14px;height:38px;line-height: 38px;overflow: hidden;padding: 0 15px;text-overflow: ellipsis;white-space: nowrap;">
<span style="font-size: 15px;font-weight:bold;padding-right:5px;">${index + 1}.</span>${item.server_filename}
</div>`
        }
    })
    var html = `<style>
.dplayer-icon.prev-icon:hover, .dplayer-icon.next-icon:hover { opacity: 1 !important; }
.dplayer-episode-panel-area .video-item:hover { background: rgba(255,255,255,.2) !important }
</style>
<button class="dplayer-icon dplayer-play-icon prev-icon" style="opacity: .7;" title="播放上一集"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg>
</button>
<button id="btn-select-episode" class="dplayer-icon dplayer-quality-icon" title="选集播放">选集</button>
<button class="dplayer-icon dplayer-play-icon next-icon" style="opacity: .7;" title="播放下一集"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg>
</button>`
    $(".dplayer-icons.dplayer-icons-right").prepend(html)
    html = `
<div class="dplayer-episode-panel" style="display: none;width: 100%;height: 100%;background-color: rgba(28,28,28,.9);color: #f5f5f5;left: 50%;position: absolute;top: 50%;transform: translate(-50%,-50%);user-select: none;z-index: 30;">
<div class="dplayer-episode-panel-title" style="margin: auto 15px;border-bottom: 1px solid hsla(0,0%,100%,.1);font-size: 18px;font-weight: bold;line-height: 50px;">选集播放
<span style="font-size: 13px;color: #0095ff;line-height: 0;margin:5px auto 15px;">（正在播放第 ${nowplayindex} 个视频）</span>
<span class="dplayer-episode-panel-close" style="fill: #f5f5f5;color: #f5f5f5;cursor: pointer;width: 25px;height: 25px;line-height: 25px;position: absolute;right: 14px;top: 14px;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m8 6.939 3.182-3.182a.75.75 0 1 1 1.061 1.061L9.061 8l3.182 3.182a.75.75 0 1 1-1.061 1.061L8 9.061l-3.182 3.182a.75.75 0 1 1-1.061-1.061L6.939 8 3.757 4.818a.75.75 0 1 1 1.061-1.061L8 6.939z"></path></svg>
</span></div>
<div class="dplayer-episode-panel-area" style="margin: 5px 0;overflow: hidden auto;max-height: 100%;">${eleitem}</div>
</div>`
    $("#dplayer").append(html)
    var eleEpisode = $(".dplayer-episode-panel")
    $(".dplayer-mask").on("click", function () {
        if (eleEpisode.css("transform").match(/\d+/) > 0) {
            eleEpisode.css("transform", "scale(0)")
            $(this).removeClass("dplayer-mask-show")
        }
    })
    $("#btn-select-episode").on("click", function () {
        eleEpisode.toggle()
    })
    $(".dplayer-episode-panel-close").on("click", () => {
        $(".dplayer-episode-panel").hide()
    })
    $(".dplayer-episode-panel-area .video-item").on("click", function () {
        var $this = $(this)
        if ($this.hasClass("active")) return
        $(".dplayer-mask").removeClass("dplayer-mask-show")
        var oldele = $(".video-item.active")
        oldele.removeClass("active")
        oldele.css({ "background-color": "", "color": "#fff" })
        $this.addClass("active")
        $this.css({ "color": "#0095ff" })
        var fileIndex = $this.index(), currvideo = videoList[fileIndex]
        newPage(currvideo, fileIndex)
    })
    resizeChildDiv()
    player.on("resize", function () {
        resizeChildDiv()
    })
    $(window).on("resize", function () {
        resizeChildDiv()
    })
    function resizeChildDiv() {
        var dplayerHeight = $('#dplayer').height()
        $('.dplayer-episode-panel-area').css("max-height", `${dplayerHeight - 60}px`)
    }

    $(".prev-icon").on("click", function () {
        var prevvideo = videoList[--fileIndex];
        prevvideo ? newPage(prevvideo, fileIndex) : (++fileIndex, player.notice("没有上一集了"), obj.msg("没有上一集了", "failure"))
    })
    $(".next-icon").on("click", function () {
        var nextvideo = videoList[++fileIndex];
        nextvideo ? newPage(nextvideo, fileIndex) : (--fileIndex, player.notice("没有下一集了"), obj.msg("没有下一集了", "failure"))
    })
    function newPage(currvideo, t) {
        var flag = obj.video_page.flag
        if (flag == "sharevideo") {
            location.href = "https://" + location.host + location.pathname + "?fid=" + currvideo.fs_id
        } else if (flag == "playvideo") {
            var currpath = obj.require("system-core:context/context.js").instanceForSystem.router.query.get("path")
            var path = currpath.split("/").slice(0, -1).concat(currvideo.server_filename).join("/")
            location.hash = "#/video?path=" + encodeURIComponent(path) + "&t=" + t || 0
        } else if (flag == "pfilevideo") {
            location.href = "https://" + location.host + "/pfile/video?path=" + encodeURIComponent(currvideo.path)
        }
        setTimeout(location.reload)
    }
}


obj.dPlayerSubtitleSetting = function () {
    var $ = obj.getJquery()
    if ($(".dplayer-setting-subtitle").length && $(".subtitle-setting-box").length) return
    $(".dplayer-setting-origin-panel").append(`<div class="dplayer-setting-item dplayer-setting-subtitle"><span class="dplayer-label">字幕设置</span><div class="dplayer-toggle"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"></path></svg></div></div></div>`)
    $(".dplayer-setting-subtitle").on("click", function () {
        $(".subtitle-setting-box").toggle()
    })
    $(".dplayer-mask").on("click", function () {
        $(".subtitle-setting-box").css("display", "none")
    })
    $(".dplayer-setting-speed").on("click", function () {
        $(".subtitle-setting-box").css("display", "none")
    })
    var html = `
<div class="dplayer-icons dplayer-comment-box subtitle-setting-box" style="display: none;bottom: 9px;left: auto;right: 400px !important;">
<div class="dplayer-comment-setting-box dplayer-comment-setting-open">
<div class="dplayer-comment-setting-color">
<div class="dplayer-comment-setting-title">字幕颜色</div>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#fff" checked=""><span style="background: #fff;"></span></label>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#e54256"><span style="background: #e54256"></span></label>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#ffe133"><span style="background: #ffe133"></span></label>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#64DD17"><span style="background: #64DD17"></span></label>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#39ccff"><span style="background: #39ccff"></span></label>
<label><input type="radio" name="dplayer-danmaku-color-1" value="#D500F9"><span style="background: #D500F9"></span></label>
</div>
<div class="dplayer-comment-setting-type">
<div class="dplayer-comment-setting-title">字幕位置</div>
<label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>上移</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="0" checked=""><span>默认</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>下移</span></label>
</div>
<div class="dplayer-comment-setting-type">
<div class="dplayer-comment-setting-title">字幕大小</div>
<label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>加大</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="0"><span>默认</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>减小</span></label>
</div>
<div class="dplayer-comment-setting-type">
<div class="dplayer-comment-setting-title">更多字幕功能</div>
<label><input type="radio" name="dplayer-danmaku-type-1" value="1"><span>本地字幕</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="0"><span>待定</span></label>
<label><input type="radio" name="dplayer-danmaku-type-1" value="2"><span>待定</span></label>
</div></div></div>`
    $(".dplayer-controller").append(html)
    $(".subtitle-setting-box .dplayer-comment-setting-color input[type='radio']").on("click", function () {
        var color = this.value
        if (localStorage.getItem("dplayer-subtitle-color") != color) {
            localStorage.setItem("dplayer-subtitle-color", color)
            $(".dplayer-subtitle").css("color", color)
        }
    })
    $(".subtitle-setting-box .dplayer-comment-setting-type input[type='radio']").on("click", function () {
        var value = this.value
        var $this = $(this), $name = $this.parent().parent().children(":first").text()
        if ($name == "字幕位置") {
            var bottom = Number(localStorage.getItem("dplayer-subtitle-bottom") || 10)
            if (value == "1") {
                bottom += 1
            } else if (value == "2") {
                bottom -= 1
            } else {
                bottom = 10
            }
            localStorage.setItem("dplayer-subtitle-bottom", bottom)
            $(".dplayer-subtitle").css("bottom", bottom + "%")
        } else if ($name == "字幕大小") {
            var fontSize = Number(localStorage.getItem("dplayer-subtitle-fontSize") || 5)
            if (value == "1") {
                fontSize += .1
            } else if (value == "2") {
                fontSize -= .1
            } else {
                fontSize = 5
            }
            localStorage.setItem("dplayer-subtitle-fontSize", fontSize)
            $(".dplayer-subtitle").css("font-size", fontSize + "vh")
        } else if ($name == "更多字幕功能") {
            if (value == "1") {
                $("#addsubtitle").length || $("body").append(`<input id="addsubtitle" type="file" accept="webvtt,.vtt,.srt,.ssa,.ass" style="display: none;">`)
                $("#addsubtitle").click()
            }
        }
    })
}


obj.addCueVideoSubtitle = function (player, callback) {
    obj.getSubList(function (sublist) {
        if (Array.isArray(sublist)) {
            const { video, subtitle } = player
            var textTracks = video.textTracks
            for (let i = 0; i < textTracks.length; i++) {
                textTracks[i].mode = "hidden" || (textTracks[i].mode = "hidden")
                if (textTracks[i].cues && textTracks[i].cues.length) {
                    for (let ii = textTracks[i].cues.length - 1; ii >= 0; ii--) {
                        textTracks[i].removeCue(textTracks[i].cues[ii])
                    }
                }
            }
            sublist.forEach(function (item, index) {
                if (Array.isArray(item?.sarr)) {
                    item.language || (item.language = obj.langDetectSarr(item.sarr))
                    item.label || (item.label = obj.langCodeTransform(item.language))
                    textTracks[index] || video.addTextTrack("subtitles", item.label, item.language)
                    item.sarr.forEach(function (item) {
                        /<b>.*<\/b>/.test(item.text) || (item.text = item.text.split(/\r?\n/).map((item) => `<b>${item}</b>`).join("\n"))
                        var textTrackCue = new VTTCue(item.startTime, item.endTime, item.text)
                        textTrackCue.id = item.index
                        textTracks[index] && textTracks[index].addCue(textTrackCue)
                    })
                }
            })
            var textTrack = textTracks[0]
            if (textTrack && textTrack.cues && textTrack.cues.length) {
                textTrack.mode = "showing"
                obj.msg("字幕添加成功")
                callback && callback(textTracks)
            }
        }
    })
}


obj.selectSubtitles = function (textTracks) {
    var $ = obj.getJquery()
    if (textTracks.length <= 1) return
    if ($(".dplayer-subtitle-btn .dplayer-quality-mask").length) $(".dplayer-subtitle-btn .dplayer-quality-mask").remove()
    var subbtn = $(".dplayer-subtitle-btn").addClass("dplayer-quality")
    var sublist = obj.video_page.sub_info
    var eleSub = `<div class="dplayer-quality-item subtitle-item" data-index="0" style="color:#0095ff;">默认字幕</div>`
    for (var i = 1; i < sublist.length; i++) {
        eleSub += `<div class="dplayer-quality-item subtitle-item" data-index="${i}">${sublist[i].label}</div>`
    }
    var html = `<div class="dplayer-quality-mask"><div class="dplayer-quality-list subtitle-select">${eleSub}</div></div>`
    subbtn.append(html)
    $(".subtitle-select .subtitle-item").off("click").on("click", function () {
        var $this = $(this), index = $this.attr("data-index")
        if ($this.css("color") != "#0095ff") {
            $this.css("color", "#0095ff")
            $this.siblings().css("color", "#fff")
            var subitem = sublist[index]
            if (subitem && subitem.sarr && subitem.sarr.length) {
                for (var i = textTracks[0].cues.length - 1; i >= 0; i--) {
                    textTracks[0].removeCue(textTracks[0].cues[i])
                }
                subitem.sarr.forEach(function (item) {
                    /<b>.*<\/b>/.test(item.text) || (item.text = item.text.split(/\r?\n/).map((item) => `<b>${item}</b>`).join("\n"))
                    var textTrackCue = new VTTCue(item.startTime, item.endTime, item.text)
                    textTrackCue.id = item.index
                    textTracks[0] && textTracks[0].addCue(textTrackCue)
                })
            }
        }
    })
}


obj.getSubList = function (callback) {
    var funs = [obj.aiSubtitle, obj.subtitleLocalFile]
    var file = obj.video_page.info[0]
    var currSubList = JSON.parse(sessionStorage.getItem("subtitle_" + file.fs_id) || "[]")
    if (currSubList && currSubList.length) {
        obj.video_page.sub_info = currSubList
        funs = [funs.pop()]
        callback && callback(currSubList)
    }
    funs.forEach(function (fun) {
        fun(function (sublist) {
            if (Array.isArray(sublist) && sublist.length) {
                currSubList = currSubList.concat(sublist)
                currSubList = obj.video_page.sub_info = obj.sortSubList(currSubList)
                sessionStorage.setItem("subtitle_" + file.fs_id, JSON.stringify(currSubList))
                callback && callback(currSubList)
            } else {
                callback && callback("")
            }
        })
    })
}


obj.aiSubtitle = function (callback) {
    obj.getSubtitleListAI(function (sublist) {
        if (Array.isArray(sublist) && sublist.length) {
            var subslen = sublist.length
            sublist.forEach(function (item, index) {
                if (/backhost=/.test(item.uri)) {
                    var originalHost = (item.uri.match(/^http(?:s)?:\/\/(.*?)\//) || [])[1]
                    var backhosts, backhostParam = (decodeURIComponent(item.uri || "").match(/backhost=(\[.*\])/) || [])[1]
                    if (backhostParam) {
                        try {
                            backhosts = JSON.parse(backhostParam)
                        } catch (e) { }
                        if (backhosts && backhosts.length) {
                            item.uri = item.uri.replace(originalHost, backhosts[0])
                        }
                    }
                }
                obj.getSubtitleDataAI(item.uri, function (stext) {
                    var sarr = obj.subtitleParser(stext, "vtt")
                    if (Array.isArray(sarr)) {
                        item.sarr = sarr
                        item.language = obj.langDetectSarr(sarr)
                        item.label = item.text
                    }
                    if (!--subslen) {
                        callback && callback(sublist.filter(function (item, index) {
                            return item.sarr
                        }))
                    }
                })
            })
        } else {
            callback && callback("")
        }
    })
}


obj.getSubtitleListAI = function (callback) {
    var vip = obj.getVip()
    var i, params = obj.video_page.info[0]
    if (obj.video_page.flag == "pfilevideo") {
        i = `/api/streaming?path=${encodeURIComponent(decodeURIComponent(params.path))}&app_id=250528&clienttype=0&type=M3U8_SUBTITLE_SRT&vip=${vip}&jsToken=${unsafeWindow.jsToken}`
    } else if (obj.video_page.flag == "mboxvideo") {
        i = `/mbox/msg/streaming?to=${params.to}&from_uk=${params.from_uk}&msg_id=${params.msg_id}&fs_id=${params.fs_id}&type=2&stream_type=M3U8_SUBTITLE_SRT&trans=&adTime=20&ltime=${params.ltime}`
    } else {
        i = obj.require("file-widget-1:videoPlay/context.js").getContext().param.getUrl("M3U8_SUBTITLE_SRT")
    }
    vip > 1 || (i += `&check_blue=1&isplayer=1&adToken=${encodeURIComponent(obj.video_page.adToken)}`)
    obj.getJquery().ajax({
        type: "GET",
        url: i,
        dataType: "text",
    }).done(function (i) {
        i = g(i)
        var o = []
        if (0 !== i.length) {
            i.forEach(function (t) {
                o.push({
                    icon: i ? "https://staticsns.cdn.bcebos.com/amis/2022-11/1669376964136/Ai.png" : void 0,
                    text: t.name,
                    value: t.video_lan,
                    badge: "https://staticsns.cdn.bcebos.com/amis/2022-11/" + (obj.getVip() ? "1669792379583/svipbadge.png" : "1669792379145/trial.png"),
                    uri: t.uri,
                })
            })
        }
        callback && callback(o)
    }).fail(function (e) {
        obj.video_page.flag == "pfilevideo" || obj.video_page.flag == "mboxvideo" ? (function (open) {
            XMLHttpRequest.prototype.open = function () {
                this.addEventListener("load", function () {
                    if (this.readyState == 4 && this.status == 200) {
                        if (this.responseURL.indexOf("/api/streaming") > 0 || this.responseURL.indexOf("/mbox/msg/streaming") > 0) {
                            if (obj.video_page.sub_info.length < 1 && typeof this.response === "string" && this.response.indexOf("SUBTITLES") > 0) {
                                XMLHttpRequest.prototype.open = open
                                var i = g(this.response)
                                var o = []
                                if (0 !== i.length) {
                                    i.forEach(function (t) {
                                        o.push({
                                            icon: i ? "https://staticsns.cdn.bcebos.com/amis/2022-11/1669376964136/Ai.png" : void 0,
                                            text: t.name,
                                            value: t.video_lan,
                                            badge: "https://staticsns.cdn.bcebos.com/amis/2022-11/" + (obj.getVip() ? "1669792379583/svipbadge.png" : "1669792379145/trial.png"),
                                            uri: t.uri,
                                        })
                                    })
                                }
                                callback && callback(o)
                            }
                        }
                    }
                }, false)
                open.apply(this, arguments)
            }
        })(XMLHttpRequest.prototype.open) : callback && callback("")
    })
    function g(t) {
        var e = t.split("\n"), i = []
        try {
            for (var s = 2; s < e.length; s += 2) {
                var n = e[s] || ""
                if (-1 !== n.indexOf("#EXT-X-MEDIA:")) {
                    for (var a = n.replace("#EXT-X-MEDIA:", "").split(","), o = {}, l = 0; l < a.length; l++) {
                        var p = a[l].split("=")
                        o[(p[0] || "").toLowerCase().replace("-", "_")] = String(p[1]).replace(/"/g, "")
                    }
                    o.uri = e[s + 1]
                    i.push(o)
                }
            }
        } catch (r) { }
        return i
    }
}


obj.getSubtitleDataAI = function (url, callback) {
    obj.getJquery().ajax({
        type: "GET",
        url: url,
        dataType: "text",
    }).done(function (t) {
        try {
            callback && callback(t)
        } catch (s) {
            callback && callback("")
        };
    }).fail(function () {
        callback && callback("")
    })
}


obj.subtitleLocalFile = function (callback) {
    obj.localFileRequest(function (fileInfo) {
        if (fileInfo.stext) {
            var sarr = obj.subtitleParser(fileInfo.stext, fileInfo.sext)
            if (Array.isArray(sarr) && sarr.length) {
                fileInfo.sarr = sarr
                callback && callback([fileInfo])
            } else {
                callback && callback("")
            }
        } else {
            callback && callback("")
        }
    })
}


obj.localFileRequest = function (callback) {
    obj.getJquery()(document).on("change", "#addsubtitle", function (event) {
        if (this.files.length) {
            var file = this.files[0]
            var file_ext = file.name.split(".").pop().toLowerCase()
            var sexts = ["webvtt", "vtt", "srt", "ssa", "ass"]
            if (!(file_ext && sexts.includes(file_ext))) {
                obj.msg("暂不支持此类型文件", "failure")
                return callback && callback("")
            }
            var reader = new FileReader()
            reader.readAsText(file, 'UTF-8')
            reader.onload = function (event) {
                var result = reader.result;
                if (result.indexOf(" ") > -1) {
                    return reader.readAsText(file, "GB18030")
                } else if (result.indexOf("") > -1) {
                    return reader.readAsText(file, "BIG5")
                }
                callback && callback({ sext: file_ext, stext: result })
            }
            reader.onerror = function (e) {
                callback && callback("")
            }
        }
        this.value = event.target.value = ""
    })
}


obj.subtitleParser = function (stext, sext) {
    if (!stext) return ""
    sext || (sext = stext.indexOf("->") > 0 ? "srt" : stext.indexOf("Dialogue:") > 0 ? "ass" : "")
    sext = sext.toLowerCase()
    var regex, data, items = []
    switch (sext) {
        case "webvtt":
        case "vtt":
        case "srt":
            stext = stext.replace(/\r/g, "")
            regex = /(\d+)?\n?(\d{0,2}:?\d{2}:\d{2}.\d{3}) -?-> (\d{0,2}:?\d{2}:\d{2}.\d{3})/g
            data = stext.split(regex)
            data.shift()
            for (let i = 0; i < data.length; i += 4) {
                items.push({
                    index: items.length,
                    startTime: obj.parseTimestamp(data[i + 1]),
                    endTime: obj.parseTimestamp(data[i + 2]),
                    text: data[i + 3].trim().replace(/{.*?}/g, "").replace(/[a-z]+\:.*\d+\.\d+\%\s/, ""),
                })
            }
            return items
        case "ssa":
        case "ass":
            stext = stext.replace(/\r\n/g, "")
            regex = /Dialogue: .*?\d+,(\d+:\d{2}:\d{2}\.\d{2}),(\d+:\d{2}:\d{2}\.\d{2}),.*?,\d+,\d+,\d+,.*?,/g
            data = stext.split(regex)
            data.shift()
            for (let i = 0; i < data.length; i += 3) {
                items.push({
                    index: items.length,
                    startTime: obj.parseTimestamp(data[i]),
                    endTime: obj.parseTimestamp(data[i + 1]),
                    text: data[i + 2].trim().replace(/\\N/g, "\n").replace(/{.*?}/g, ""),
                })
            }
            return items
        default:
            console.error("未知字幕格式，无法解析", sext)
            return ""
    }
}


obj.parseTimestamp = function (e) {
    var t = e.split(":")
    var n = parseFloat(t.length > 0 ? t.pop().replace(/,/g, ".") : "00.000") || 0
    var r = parseFloat(t.length > 0 ? t.pop() : "00") || 0
    return 3600 * (parseFloat(t.length > 0 ? t.pop() : "00") || 0) + 60 * r + n
}


obj.langDetectSarr = function (sarr) {
    var t = [
        sarr[parseInt(sarr.length / 3)].text,
        sarr[parseInt(sarr.length / 2)].text,
        sarr[parseInt(sarr.length / 3 * 2)].text,
    ].join("").replace(/[<bi\/>\r?\n]*/g, "")
    var e = "eng"
    var i = (t.match(/[\u4e00-\u9fa5]/g) || []).length / t.length
    if ((t.match(/[\u3020-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\u31F0-\u31FF]/g) || []).length / t.length > .03) {
        e = "jpn"
    } else {
        i > .1 && (e = "chi")
    }
    return e
}


obj.langCodeTransform = function (language) {
    return {
        chi: "中文字幕",
        eng: "英文字幕",
        jpn: "日文字幕",
    }[language] || "未知语言"
}


obj.sortSubList = function (sublist) {
    var chlist = [], otherlist = []
    sublist.forEach(function (item, index) {
        if (["chi", "zho"].includes(item.language)) {
            chlist.push(item)
        } else {
            otherlist.push(item)
        }
    })
    return chlist.concat(otherlist)
}


obj.resetPlayer = function () {
    obj.async("file-widget-1:videoPlay/context.js", function (c) {
        var count, id = count = setInterval(function () {
            var playerInstance = c ? c.getContext()?.playerInstance : obj.videoNode && obj.videoNode.firstChild
            if (playerInstance && playerInstance.player) {
                clearInterval(id)
                playerInstance.player.dispose()
                playerInstance.player = !1
                obj.videoNode = null
            } else if (++count - id > 60) {
                clearInterval(id)
            }
        }, 500)
    })
}


obj.require = function (name) {
    return unsafeWindow.require(name)
}


obj.async = function (name, callback) {
    obj.video_page.flag === "pfilevideo" || obj.video_page.flag == "mboxvideo" ? callback("") : unsafeWindow.require.async(name, callback)
}


obj.getJquery = function () {
    return unsafeWindow.jQuery || window.jQuery
}


obj.getVip = function () {
    return obj.video_page.flag === "pfilevideo" || obj.video_page.flag == "mboxvideo" ? function () {
        if (window.locals) {
            var i = 1 === +window.locals.is_svip
            var n = 1 === +window.locals.is_vip
            return i ? 2 : n ? 1 : 0
        }
        return 0
    }() : obj.require("base:widget/vip/vip.js").getVipValue()
}


obj.msg = function (msg, mode) {
    obj.video_page.flag === "pfilevideo" || obj.video_page.flag == "mboxvideo" ? unsafeWindow.toast.show({ type: mode || "success", message: msg, duration: 5e3 }) : obj.require("system-core:system/uiService/tip/tip.js").show({ vipType: "svip", mode: mode || "success", msg: msg })
}


obj.readyPage = function (callback) {
    if (obj.video_page.flag === "pfilevideo" || obj.video_page.flag == "mboxvideo") {
        var appdom = document.querySelector("#app")
        appdom && appdom.__vue_app__ ? callback && callback() : setTimeout(function () {
            obj.readyPage(callback)
        })
    } else {
        var jQuery = obj.getJquery()
        jQuery ? jQuery(function () {
            callback && callback()
        }) : setTimeout(function () {
            obj.readyPage(callback)
        })
    }
}


obj.run = function () {
    var url = location.href
    if (url.indexOf(".baidu.com/pfile/video") > 0) {
        obj.video_page.flag = "pfilevideo"
        obj.playPfilePage()
        obj.readyPage(function () {
            document.querySelector("#app").__vue_app__.config.globalProperties.$router.afterEach((to, from) => {
                from.fullPath === "/" || from.fullPath === to.fullPath || location.reload()
            })
        })
    } else if (url.indexOf(".baidu.com/pfile/mboxvideo") > 0) {
        obj.video_page.flag = "mboxvideo"
        obj.playIMPage()
        obj.readyPage(function () {
            document.querySelector("#app").__vue_app__.config.globalProperties.$router.afterEach((to, from) => {
                from.fullPath === "/" || from.fullPath === to.fullPath || location.reload()
            })
        })
    } else {
        obj.readyPage(function () {
            if (url.indexOf(".baidu.com/s/") > 0) {
                obj.video_page.flag = "sharevideo"
                obj.playSharePage()
            } else if (url.indexOf(".baidu.com/play/video#/video") > 0) {
                obj.video_page.flag = "playvideo"
                obj.playHomePage()
                window.onhashchange = function (e) {
                    location.reload()
                }
            } else if (url.indexOf(".baidu.com/mbox/streampage") > 0) {
                obj.video_page.flag = "mboxvideo"
                obj.playStreamPage()
            }
        })
    }
}()
