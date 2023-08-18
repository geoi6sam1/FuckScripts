// ==UserScript==
// @name         腾讯视频优化助手
// @namespace    https://github.com/geoi6sam1
// @version      0.9
// @description  仅用于优化观影体验，非跳过视频开头广告脚本，有需要请使用VIP
// @author       geoi6sam1
// @match        *://v.qq.com/*
// @match        *://m.v.qq.com/*
// @match        *://film.qq.com/*
// @match        *://m.film.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-start
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

GM_addStyle(`
.quick_vip,
.quick_games,
.quick_upload,
.quick_message,
#pc_client,
[class*="left-nav"] a[href*="iwan"],
[dt-params*="ad_"],
[dt-eid*="ad_"],
#iwan-gamependant-page,
.tip_download,
.mod_vip_nav .vip_act,
.fixed_box,
#ad_container,
#iwan-game,
.banner-ad,
.txp_ad,
.txp_none,
.txp-watermark,
.game-switch-ad,
[class*="txp_full_screen_pause"],
[data-role*="creative-player-pause"],
.barrage-control,
.thumbplayer-barrage,
#ad_m-site,
.open-app.old-open,
[dt-eid="openbanner"],
.bottom-wrapper,
.at-app-banner
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

window.onkeypress = (e) => {
    if (e.keyCode === 32) {
        txv_ad_float_fuck();
    }
}

window.onmousedown = (e) => {
    if (e.button === 0) {
        txv_ad_float_fuck();
    }
}

function txv_ad_float_fuck() {
    var txv_player_choose = document.querySelectorAll("#player video")[0];
    if (txv_player_choose) {
        setTimeout(() => {
            if (txv_player_choose.paused === true) {
                var txv_player_win = document.querySelector(".txp_videos_container");
                txv_player_choose.setAttribute("style", "position: absolute; width: 100%; height: 100%; top: 0; left: 0; object-fit: contain; z-index: 0; visibility: inherit;");
                txv_player_win.setAttribute("style", "position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 0;");
            }
        }, 999);
    }
}
