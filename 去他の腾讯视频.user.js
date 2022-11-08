// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://github.com/s757129
// @version      0.4
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
.quick_games,
.quick_upload,
.quick_vip,
#pc_client,
[dt-params*="ad_"],
.site_board_ads_inner,
.mod_row_box_special,
.nav-wrap a[href*="gamer"],
.nav-wrap a[href*="iwan"],
.tip_download,
#ad_container,
.fixed_box,
.vip-button,
#iwan-game-switch-page,
.iwan-wrapper,
txpdiv[data-role*="ad-"],
txpdiv[data-role*="watermark"]
{
    display: none !important;
}

.video-card-wrap
{
    margin: 0.25rem !important;
}
`);
