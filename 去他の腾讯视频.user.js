// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://github.com/s757129
// @version      0.71
// @description  屏蔽腾讯视频广告加菊部美化
// @author       柒伍七
// @match        *://v.qq.com/*
// @match        *://film.qq.com/*
// @match        *://iwan.qq.com/*
// @match        *://gamer.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/s757129/FuckScripts/issues
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

// unsafeWindow
unsafeWindow.GM_addStyle = GM_addStyle;

// 非跳过视频开头广告脚本，请搭配VIP食用
GM_addStyle(`
.quick_vip,
.quick_games,
.quick_upload,
#pc_client,
[dt-params*="ad_"],
.tip_download,
#ad_container,
[data-role*="ad-"],
[class*="txp_ad_"],
[data-role*="watermark"],
.barrage-control,
.thumbplayer-barrage
{
    display: none !important;
}

.video-card-wrap
{
    margin: 0.33rem !important;
}

.gray-style-remembrance
{
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
}
`);
