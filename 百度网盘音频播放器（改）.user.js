// ==UserScript==
// @name           百度网盘音频播放器（改）
// @namespace      https://github.com/geoi6sam1
// @version        0.2.0.20240713
// @description    https://scriptcat.org/script-show-page/995
// @author         geoi6sam1@qq.com
// @icon           https://staticwx.cdn.bcebos.com/mini-program/images/ic_audio.png
// @supportURL     https://github.com/geoi6sam1/FuckScripts/issues
// @match          https://pan.baidu.com/disk/main*
// @match          https://yun.baidu.com/disk/main*
// @require        https://scriptcat.org/lib/1359/1.1.1/PipLyric.js
// @require        https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js
// @require        https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.13/hls.min.js
// @require        https://cdn.bootcdn.net/ajax/libs/aplayer/1.10.1/APlayer.min.js
// @resource       aplayerCSS https://cdn.bootcdn.net/ajax/libs/aplayer/1.10.1/APlayer.min.css
// @run-at         document-end
// @grant          unsafeWindow
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @connect        kugou.com
// @license        GPL-3.0
// ==/UserScript==

var $ = unsafeWindow.jQuery || window.jQuery || jQuery || $
var obj = {
    audio_page: {
        fileList: [],
        fileIndex: -1
    }
}

obj.replaceNativePlayer = function () {
    const observer = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains("nd-audio")) {
                        if (!node.only) {
                            node.only = true
                            const { bpAudio, fileList, fileMetaList } = node.__vue__
                            obj.audio_page.fileList = (document.querySelector(".nd-new-main-list")?.__vue__?.fileList || fileMetaList).filter((item, index) => {
                                return item.category === 2 || item.category === 6 && !item.isdir && ["flac", "ape"].includes(item.server_filename.split(".").pop().toLowerCase())
                            })
                            obj.audio_page.fileIndex = obj.audio_page.fileList.findIndex((item, index) => {
                                return item.fs_id == fileList[0].fs_id
                            })
                            if (node.classList.contains("normal")) {
                                bpAudio.destroy()
                                node.parentNode.removeChild(node)
                                obj.aplayerStart()
                            }
                        }
                    }
                })
            }
        })
    })
    const config = { childList: true, subtree: true }
    const targetNode = document.body
    observer.observe(targetNode, config)
}

obj.insertPrettyPlayer = function () {
    var element = document.querySelector(".nd-new-main-list")
    if (element) {
        Object.defineProperty(element, "__vue__", {
            set(__vue__) {
                var playbtn = $(".wp-s-header__center .play-btn")
                if (__vue__ && Array.isArray(__vue__.fileList)) {
                    (obj.audio_page.fileList = __vue__.fileList.filter((item, index) => {
                        return item.category === 2 || item.category === 6 && !item.isdir && ["flac", "ape"].includes(item.real_category.toLowerCase())
                    })).length ? playbtn.length || $('<div class="wp-s-agile-tool-bar__h-action is-need-left-sep is-list play-btn" style="border-top-right-radius: 16px;border-bottom-right-radius: 16px;"><button type="button" class="u-button wp-s-agile-tool-bar__h-action-button u-button--text u-button--small" title="音乐播放" style="height: 32px;"><i class="u-icon-play"></i><span>音乐播放</span></button></div>').appendTo(".wp-s-header__center").on("click", () => {
                        obj.aplayerStart()
                    }) : playbtn.length && playbtn.remove()
                    if (__vue__.selectLength && obj.audio_page.fileList.length) {
                        var audiofile = __vue__.selectedList.find((item) => {
                            return item.category === 2 || item.category === 6 && !item.isdir && ["flac", "ape"].includes(item.real_category.toLowerCase())
                        })
                        audiofile && (obj.audio_page.fileIndex = obj.audio_page.fileList.findIndex((item, index) => {
                            return item.fs_id == audiofile.fs_id
                        }))
                    }
                }
            }
        })
    }
}

obj.aplayerStart = function () {
    var aplayerNode, audio = obj.audio_page.fileList
    audio.forEach((item) => {
        Object.assign(item, {
            name: item.server_filename,
            artist: item.singer,
            url: "/rest/2.0/xpan/file?method=streaming&path=" + encodeURIComponent(item.path) + "&type=M3U8_HLS_MP3_128",
            cover: item.categoryImageGrid || item.categoryImage,
            theme: "#06a7ff",
            type: "customHls"
        })
    })
    if (audio.length) {
        aplayerNode = document.getElementById("aplayer")
        if (aplayerNode) {
            if (window.player) {
                window.player.destroy()
            }
        }
        else {
            aplayerNode = document.createElement("div")
            aplayerNode.setAttribute("id", "aplayer")
            aplayerNode.setAttribute("style", "background-color: #fafdff;position: fixed;z-index: 9999;width: 440px;bottom: 0;left: 80px;box-shadow: 0 0 10px #ccc;border-top-left-radius: 4px;border-top-right-radius: 4px;border: 1px solid #dedede;")
            document.body.appendChild(aplayerNode)
        }
    }
    else {
        console.error("未找到音频文件", audio)
        return
    }
    try {
        const player = window.player = new window.APlayer({
            container: aplayerNode,
            audio: audio,
            customAudioType: {
                customHls(audioElement, audio, player) {
                    const Hls = window.Hls
                    if (Hls.isSupported()) {
                        if (player.hls) player.hls.destroy()
                        const hls = player.hls = new Hls()
                        hls.loadSource(audio.url)
                        hls.attachMedia(audioElement)
                        hls.on(Hls.Events.ERROR, (event, data) => {
                            if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                                            var errno = JSON.parse(data.networkDetails.response).errno
                                            if (errno == 31341) {
                                                hls.loadSource(hls.url)
                                            }
                                            else {
                                                const { list } = player
                                                list.remove(list.index)
                                            }
                                        }
                                        else if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT || data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                                            hls.loadSource(hls.url)
                                        }
                                        else {
                                            hls.startLoad()
                                        }
                                        break
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        hls.recoverMediaError()
                                        break
                                    default:
                                        hls.destroy()
                                        break
                                }
                            }
                        })
                    }
                    else if (audioElement.canPlayType("application/x-mpegURL") || audioElement.canPlayType("application/vnd.apple.mpegURL")) {
                        audioElement.src = audio.url
                    }
                    else {
                        player.notice("Error: HLS is not supported.")
                    }
                }
            },
            autoplay: true,
            lrcType: 1,
            listFolded: false,
        })
        obj.onEvents(player)

        const { list, template: { time, body } } = player
        const fileIndex = obj.audio_page.fileIndex
        if (fileIndex > -1 && list.audios.length > 1 && list.index !== fileIndex) {
            list.switch(fileIndex)
        }

        $(time).children().css("display", "inline-block")
        $(body).prepend('<button class="u-dialog__headerbtn" title="关闭播放器" style="top: 6px;right: 9px;"><i class="u-dialog__close u-icon u-icon-close"></i></button>').children(".u-dialog__headerbtn").on("click", () => {
            player.destroy()
        })
        $('<a href="javascript:;" title="删除当前音频" style="position: absolute;right: 36px;font-size: 14px;top: 6px;"><img src="https://cdn-icons-png.flaticon.com/512/6460/6460112.png" style="width: 18px;"></a>').prependTo(body).on("click", (event) => {
            switch (event.type) {
                case "mouseenter":
                case "mouseover":
                case "mouseleave":
                case "mouseout":
                case "click":
                    var { list } = player
                    list.remove(list.index)
                    break
                default:
            }
        })
    } catch (error) {
        console.error("创建播放器错误", error)
    }
}

obj.onEvents = function (player) {
    obj.initPipLyric(player)
    obj.loadLyric(player)

    player.on("listswitch", ({ index }) => {
        if (this.index != index) {
            this.index = index
            obj.loadLyric(player, index)
        }
    })

    player.on("destroy", () => {
        if (player.hls) player.hls.destroy()
        if (player.pipLyric) player.pipLyric.leave()
        window.player = null
    })
}

obj.loadLyric = function (player, index) {
    const { list, template: { pic, author }, lrc } = player
    var file = list.audios[index == null ? list.index : index] || {}
        (file.name && file.hash) || Object.assign(file, {
            name: file.server_filename,
            hash: file.md5,
            size: file.size
        })
    obj.querySongInfo(file).then((result) => {
        const { author_name, img, lyric } = result
        author_name && (author.innerText = "- " + author_name)
        img && (pic.style.cssText += "background-image: url(" + img + ")")
        if (lyric) {
            lrc.parsed[list.index] = lrc.current = lrc.parse(lyric)
            lrc.container.innerHTML = lrc.parsed[list.index].map((item) => `<p>${item[1]}</p>`).join("\n")
            lrc.container.getElementsByTagName("p").length && lrc.container.getElementsByTagName("p")[0].classList.add("aplayer-lrc-current")
        }
        if (obj.initPipLyric(player)) {
            const pipinfo = {
                id: result.id || result.audio_id || 1234567890,
                name: result.audio_name || result.songname,
                artists: (result.authors || []).map((n) => {
                    return n && {
                        name: n.author_name
                    }
                }).filter(Boolean),
                album: {
                    picUrl: result.img,
                },
                lrc: {
                    lyric: result.lyric || result.lyrics
                }
            }
            player.pipLyric.setData(pipinfo)
        }
    }).catch((error) => {
        if (obj.initPipLyric(player)) {
            player.pipLyric.setData({
                id: 1234567890,
                name: file.name.split(".").slice(0, -1).join("."),
                lrc: {
                    lyric: "[00:00.00]（改）百度网盘音频播放器\r\n[00:01.00]愿你一生欢喜，不为世俗所及。\r\n[10:00.00]THE END."
                },
            })
        }
    })
}

obj.initPipLyric = function (player) {
    if (player.pipLyric) return true
    const PipLyric = window.PipLyric || unsafeWindow.PipLyric
    if (PipLyric && PipLyric.support) {
        player.template.time.insertAdjacentHTML("beforeend", '<button type="button" class="aplayer-icon aplayer-icon-pip" style="display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M2.667 2.667h18.667v18.667h-18.667v-18.667M29.333 10.667v18.667h-18.667v-5.333h2.667v2.667h13.333v-13.333h-2.667v-2.667h5.333z"></path></svg></button>')
        player.template.pipButton = player.template.time.lastElementChild || player.template.time.lastChild
        player.pipLyric = new PipLyric({
            audio: player.audio,
            pip: player.template.pipButton,
            prev: player.template.skipBackButton,
            next: player.template.skipForwardButton,
        })
        return true
    }
    return false
}

obj.querySongInfo = function (file) {
    const { songInfo, name, hash, size } = file
    if (songInfo) {
        return Promise.resolve(songInfo)
    }
    return obj.songinfoKugou(name, hash, size).then((result) => {
        if (result.img) {
            if (result.img.indexOf("/400/") > -1) result.img = ""
            result.img = result.img.replace(/^https?:/, "")
        }
        file.songInfo = result
        return result
    })
}

obj.songinfoKugou = function (name, hash, size) {
    return obj.songinfoKugouByHash(hash).then((result) => {
        return result
    }, (e) => {
        return obj.songinfoKugouByName(name, hash, size)
    })
}

obj.songinfoKugouByHash = function (hash) {
    if (!hash) return Promise.reject()
    return obj.searchKugouByHash(hash).then((result) => {
        return obj.getdataKugou(hash).then((data) => {
            var candidates = result.candidates.slice(0, 3)
            var promises = []
            candidates.forEach((item, index) => {
                promises.push(obj.downloadKugouByHash(item.id, item.accesskey))
            })
            return Promise.allSettled(promises).then((results) => {
                results.forEach((item, index) => {
                    if (item.status == "fulfilled" && item.value) {
                        Object.assign(candidates[index], { lyric: item.value }, { sourceType: "KuGou" })
                    }
                })
                return candidates.find((item, index) => {
                    return (item.lyric || item.lyrics) && Object.assign(item, data)
                }) || Promise.reject()
            })
        })
    })
}

obj.searchKugouByHash = function (hash) {
    return new Promise((resolve, reject) => {
        obj.ajax({
            url: "https://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=&duration=&hash=" + hash,
            headers: {
                referer: "https://www.kugou.com/"
            },
            success(result) {
                if (result && result.status == 200 && result.proposal !== "0") {
                    resolve(result)
                }
                else {
                    reject(result)
                }
            },
            error(error) {
                reject(error)
            }
        })
    })
}

obj.downloadKugouByHash = function (id, accesskey) {
    return new Promise((resolve, reject) => {
        obj.ajax({
            url: "https://lyrics.kugou.com/download?ver=1&client=pc&id=" + id + "&accesskey=" + accesskey + "&fmt=lrc&charset=utf8",
            headers: {
                referer: "https://www.kugou.com/"
            },
            success(result) {
                resolve(result)
            },
            error(error) {
                reject(error)
            }
        })
    })
}

obj.songinfoKugouByName = function (name, hash, size) {
    return obj.searchKugouByName(name, hash, size).then((result) => {
        var info = result.info
        let infoFilter = info.filter((item, index) => {
            return item.hash == hash || item["320filesize"] == size || item.filesize == size || item.sqfilesize == size
        })
        if (infoFilter.length) {
            info = infoFilter
        } else {
            info.forEach((item, index) => {
                item.nameSimilar = obj.textSimilarity(name.toLowerCase(), (item.audio_name || item.filename || item.songname).toLowerCase())
            })
            info = info.sort((a, b) => {
                return +b.nameSimilar - +a.nameSimilar
            }).slice(0, 3)
        }
        var promises = []
        info.forEach((item, index) => {
            promises.push(obj.getdataKugou(item.hash))
        })
        info.forEach((item, index) => {
            promises.push(obj.krcKugou(item.hash))
        })
        return Promise.allSettled(promises).then((results) => {
            const len = info.length
            results.forEach((item, index) => {
                if (item.status == "fulfilled" && item.value) {
                    if (index < len) {
                        Object.assign(info[index], item.value, { sourceType: "KuGou" })
                    }
                    else {
                        Object.assign(info[index % len], { lyric: item.value }, { sourceType: "KuGou" })
                    }
                }
            })
            return info.find((item, index) => {
                return item.lyric || item.lyrics
            }) || Promise.reject()
        })
    })
}

obj.searchKugouByName = function (name, hash, size) {
    return new Promise((resolve, reject) => {
        obj.ajax({
            url: "http://mobilecdn.kugou.com/api/v3/search/song?pagesize=20&keyword=" + name,
            headers: {
                referer: "http://www.kugou.com/"
            },
            success(result) {
                if (result && result.status == 1 && result.data.total) {
                    resolve(result.data)
                }
                else {
                    reject(result)
                }
            },
            error(error) {
                reject(error)
            }
        })
    })
}

obj.krcKugou = function (hash) {
    return obj.surlRequest("https://m.kugou.com/app/i/krc.php?cmd=100&timelength=999999&hash=" + hash)
}

obj.getdataKugou = function (hash) {
    return new Promise((resolve, reject) => {
        obj.ajax({
            url: "https://www.kugou.com/yy/index.php?r=play/getdata&hash=" + hash,
            headers: {
                referer: "https://www.kugou.com/"
            },
            success(result) {
                if (result && result.status == 1) {
                    resolve(result.data)
                }
                else {
                    reject(result)
                }
            },
            error(error) {
                reject(error)
            }
        })
    })
}

obj.surlRequest = function (url) {
    return new Promise((resolve, reject) => {
        obj.ajax({
            url: url,
            dataType: "blob",
            success(blob) {
                var reader = new FileReader()
                reader.readAsText(blob, "UTF-8")
                reader.onload = (e) => {
                    resolve(reader.result)
                }
                reader.onerror = (e) => {
                    reject(e)
                }
            },
            error(error) {
                reject(error)
            }
        })
    })
}

obj.ajax = function (option) {
    var details = {
        method: option.type || "get",
        url: option.url,
        responseType: option.dataType || "json",
        onload(result) {
            var response = result.response || result.responseText
            if (parseInt(result.status / 100) == 2) {
                option.success && option.success(response)
            }
            else {
                option.error && option.error(response)
            }
        },
        onerror(result) {
            option.error && option.error(result.error)
        }
    }
    if (option.data) {
        if (option.data instanceof Object) {
            details.data = Object.keys(option.data).map((k) => {
                return encodeURIComponent(k) + "=" + encodeURIComponent(option.data[k]).replace("%20", "+")
            }).join("&")
        }
        else {
            details.data = option.data
        }
        if ((option.type || "get").toUpperCase() == "GET") {
            details.url = option.url + (option.url.includes("?") ? "&" : "?") + details.data
            delete details.data
        }
    }
    if (option.headers) {
        details.headers = option.headers
    }
    GM_xmlhttpRequest(details)
}

obj.textSimilarity = function (textA, textB) {
    if (!textA || !textB) return 0
    var segment = (text) => {
        return ("" + text).split("")
    }
    var segmentWordsA = segment(textA)
    var segmentWordsB = segment(textB)
    var distributionWordsArray = {}

    segmentWordsA.forEach(element => {
        if (!distributionWordsArray.hasOwnProperty(element)) {
            distributionWordsArray[element] = [1, 0]
        } else {
            distributionWordsArray[element][0] += 1
        }
    })
    segmentWordsB.forEach(element => {
        if (!distributionWordsArray.hasOwnProperty(element)) {
            distributionWordsArray[element] = [0, 1]
        } else {
            distributionWordsArray[element][1] += 1
        }
    })
    let [sum, sumWordsA, sumWordsB] = [0, 0, 0]
    for (const element in distributionWordsArray) {
        const wordsA = distributionWordsArray[element][0]
        const wordsB = distributionWordsArray[element][1]
        sum += (wordsA * wordsB)
        sumWordsA += Math.pow(wordsA, 2)
        sumWordsB += Math.pow(wordsB, 2)
    }
    return sum / Math.sqrt(sumWordsA * sumWordsB)
}

obj.run = function () {
    $(".cursor-p.play").addClass("pause")
    GM_addStyle(GM_getResourceText("aplayerCSS"))
    obj.replaceNativePlayer()
    obj.insertPrettyPlayer()
    unsafeWindow.globalVue.$router.afterHooks.push(() => {
        setTimeout(obj.insertPrettyPlayer, 500)
    })
}()
