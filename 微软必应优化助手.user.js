// ==UserScript==
// @name            微软必应优化助手
// @namespace       https://github.com/geoi6sam1
// @version         1.2.5
// @description     微软必应（Microsoft Bing）搜索结果优化，支持电脑端和移动端
// @author          geoi6sam1
// @icon            https://bing.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @match           http*://*.bing.com/*
// @run-at          document-start
// @grant           unsafeWindow
// @grant           GM_addStyle
// @license         GPL-3.0
// ==/UserScript==

(function () {
    'use strict'

    const obj = {
        option: {
            faq: 1, // 相关问题，默认显示，值为1
            news: 1, // 相关资讯，默认显示，值为1
            maps: 0, // 相关位置，默认隐藏，值为0
            video: 0, // 相关视频，默认隐藏，值为0
            image: 0, // 相关图像，默认隐藏，值为0
            relSearches: 1, // 底部相关搜索，默认显示，值为1
            histories: 0, // 底部历史搜索，默认隐藏，值为0
            web: [ // 隐藏相关网页，默认隐藏CSDN社区
                "csdn.net",
            ],
        },
    }
    const userAgent = navigator.userAgent || window.navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|Opera Mini|Mobile/i.test(userAgent)

    obj.bingVideo = function () {
        GM_addStyle(`
li.b_ans:has(#serpvidans)
{
    display: none !important;
}
        `)
    }

    obj.bingImage = function () {
        GM_addStyle(`
li.b_ans:has(.imgPart)
{
    display: none !important;
}
        `)
    }

    obj.bingFAQ = function () {
        GM_addStyle(`
li.b_ans:has(.df_alaskcarousel)
{
    display: none !important;
}
        `)
    }

    obj.bingRelevantSearches = function () {
        GM_addStyle(`
li.b_ans:has(.b_rs)
{
    display: none !important;
}
        `)
    }

    obj.bingMaps = function () {
        GM_addStyle(`
li.b_ans:has(#lMapContainer)
{
    display: none !important;
}
        `)
    }

    obj.bingNews = function () {
        GM_addStyle(`
li.b_ans:has(#ans_nws)
{
    display: none !important;
}
        `)
    }

    obj.bingHistories = function () {
        GM_addStyle(`
#b_recSQ,
li.b_ans:has(.b_mrs)
{
    display: none !important;
}
        `)
    }

    if (isMobile) {
        GM_addStyle(`#b_footer ul { display: none !important; }`)
    }

    GM_addStyle(`
.b_ad,
.ad_sc,
.adsblock,
#ads_banner,
#sacs_win,
li.b_algo:has(.b_attribution[data-partnertag]),
li.b_algo[style],
.b_hPanel:has([class*="bingApp_"]),
.sidebar:has(.ads_dwn),
#bgPro,
#b_pole,
#id_mobile,
#suspenBar,
#b_opalpers,
#bnp_ttc_div,
#bnp_rich_div,
#b_ims_bza_pole,
#ev_talkbox_wrapper,
#idCont [id*="id_qrcode"],
#b_notificationContainer_bop,
li.b_ans:has(#opal_serpftrcta)
{
    display: none !important;
}
`)

    obj.option.web.forEach((item) => {
        GM_addStyle(`
li.b_ans:has(a[href*="${item}"]),
li.b_algo:has(a[href*="${item}"])
{
    display: none !important;
}
        `)
    })

    var arr = [
        [obj.option.faq, obj.bingFAQ],
        [obj.option.news, obj.bingNews],
        [obj.option.maps, obj.bingMaps],
        [obj.option.video, obj.bingVideo],
        [obj.option.image, obj.bingImage],
        [obj.option.relSearches, obj.bingRelevantSearches],
        [obj.option.histories, obj.bingHistories],
    ]
    arr.forEach((item) => {
        if (item[0] == 0) {
            item[1]()
        }
    })

})()
