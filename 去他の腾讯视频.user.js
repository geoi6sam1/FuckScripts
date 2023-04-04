// ==UserScript==
// @name         去他の腾讯视频
// @namespace    geoi6sam1
// @version      0.7
// @description  仅用于优化观影体验，非跳过视频开头广告脚本，有需要请使用VIP
// @author       柒伍七
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
#iwan-gamependant-page,
.quick_vip,
.quick_games,
.quick_upload,
#pc_client,
.left-nav-wrap a[href*="iwan"],
[dt-params*="ad_"],
.tip_download,
#ad_container,
[class*="_ad_"],
[class*="-ad"],
[data-role*="ad-"],
[data-role*="watermark"],
[data-role*="creative-player-pause"],
#iwan-game-switch-page,
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
