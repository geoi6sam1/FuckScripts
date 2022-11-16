// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://github.com/s757129
// @version      0.5
// @description  屏蔽腾讯视频广告加菊部美化
// @author       柒伍七
// @match        *://v.qq.com/*
// @match        *://film.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/s757129/FuckScripts/issues
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

//unsafeWindow
unsafeWindow.GM_addStyle = GM_addStyle;

//非跳过视频开头广告脚本，请搭配VIP食用
GM_addStyle(`
.quick_vip,
.quick_games,
.quick_upload,
#pc_client,
.nav-wrap a[href*="gamer"],
.nav-wrap a[href*="iwan"],
[dt-params*="ad_"],
.tip_download,
#ad_container,
.fixed_box,
.vip-button,
#iwan-game-switch-page,
.iwan-wrapper,
[data-role*="ad-"],
[data-role*="watermark"]
{
    display: none !important;
}

.video-card-wrap
{
    margin: 0.25rem !important;
}
`);
