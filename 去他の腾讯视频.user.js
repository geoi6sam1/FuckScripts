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

//不能跳过视频开头广告
GM_addStyle(`
.quick_games,
.quick_upload,
#pc_client,
.site_board_ads_inner,
.mod_row_box_special,
[dt-params*="ad_"],
.tip_download,
#ad_container,
.fixed_box,
.vip-button,
#iwan-game-switch-page,
[data-role*="ad-"],
[data-role*="watermark"]
{
    display: none !important;
}

.video-card-wrap
{
    margin: 0.5rem !important;
}
`);
