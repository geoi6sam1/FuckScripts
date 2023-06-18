// ==UserScript==
// @name         腾讯视频优化助手
// @namespace    geoi6sam1
// @version      0.8
// @description  仅用于优化观影体验，非跳过视频开头广告脚本，有需要请使用VIP
// @author       钜森
// @match        *://v.qq.com/*
// @match        *://film.qq.com/*
// @match        *://m.film.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @run-at       document-start
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

GM_addStyle(`
.quick_vip,
.quick_games,
.quick_upload,
#pc_client,
.left-nav-wrap a[href*="iwan"],
[dt-params*="ad_"],
.tip_download,
.fixed_box,
#ad_container,
.txp_ad,
.txp_none,
.txp-watermark,
[id*="iwan-game"],
[class*="txp_full_screen_pause"],
[data-role*="creative-player-pause"],
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
