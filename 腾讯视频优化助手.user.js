// ==UserScript==
// @name         腾讯视频优化助手
// @namespace    https://github.com/geoi6sam1
// @version      1.0.1
// @description  仅用于优化观影体验，非跳过视频开头广告脚本，有需要请开通腾讯视频VIP使用
// @author       geoi6sam1
// @match        *://v.qq.com/*
// @match        *://m.v.qq.com/*
// @match        *://film.qq.com/*
// @match        *://m.film.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @require      https://cdn.staticfile.org/sweetalert2/11.7.28/sweetalert2.min.js
// @resource     SwalStyle https://cdn.staticfile.org/sweetalert2/11.7.28/sweetalert2.min.css
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

var main = {
    /*** 类似广告 ***/
    wetv_ad() {
        GM_addStyle(`
.video-card-module [dt-params*="ad_"],
.focus-wrap [dt-eid*="ad_poster"],
a[href*="9377s."],
a[href*="qqgame."],
a[href*="gamer."],
a[href*="iwan."],
.video-banner-module:has(a[href*="9377s."]),
.video-banner-module:has(a[href*="qqgame."]),
.video-banner-module:has(a[href*="gamer."]),
.video-banner-module:has(a[href*="iwan."]),
#iwan-gamependant-page,
.tip_download,
.vip_act,
.fixed_box,
#ad_container,
#iwan-game,
.banner-ad,
.txp_ad,
.txp_none,
.game-switch-ad,
.player-comment-btn,
iframe[data-src*="mall."],
[class*="txp_full_screen_pause"],
[data-role*="creative-player-pause"],
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
   margin-right: var(--content-big-card-margin);
   margin-bottom: var(--content-big-card-margin);
}
        `);
        // 监听键盘空格
        window.onkeypress = (e) => {
            if (e.keyCode === 32) {
                txv_ad_float_fuck();
            }
        }
        // 监听鼠标左键
        window.onmousedown = (e) => {
            if (e.button === 0) {
                txv_ad_float_fuck();
            }
        }
        // 恢复视频窗口大小
        function txv_ad_float_fuck() {
            var txv_player_choose = document.querySelectorAll("#player video")[0];
            if (txv_player_choose) {
                setTimeout(() => {
                    if (txv_player_choose.paused === true) {
                        var txv_player_win = document.querySelector(".txp_videos_container");
                        txv_player_win.setAttribute("style", "position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 0;");
                    }
                }, 1234);
            }
        }
    },
    /*** 顶部导航 ***/
    wetv_quick() {
        GM_addStyle(`
.quick_vip,
.quick_games,
.quick_upload,
.quick_message,
#pc_client
{
    display: none !important;
}
        `);
    },
    /*** 视频弹幕 ***/
    wetv_barrage() {
        GM_addStyle(`
.barrage-control,
.thumbplayer-barrage
{
    display: none !important;
}
        `);
    },
    /*** 视频水印 ***/
    wetv_watermark() {
        setTimeout(() => {
            var wetv_video_watermark = document.querySelector(".txp-watermark");
            if (wetv_video_watermark) {
                wetv_video_watermark.remove();
            }
        }, 4321);
    },
    /*** 网站灰度 ***/
    wetv_grayscale() {
        GM_addStyle(`
.gray-style-remembrance
{
    -webkit-filter: grayscale(0) !important;
    filter: grayscale(0) !important;
}
        `);
    },
};

GM_getValue("wetv_vip") !== true && GM_setValue("wetv_vip", true) && window.location.reload(true);
GM_getValue("fuck_wetv_ad") && main.wetv_ad();
GM_getValue("fuck_wetv_quick") && main.wetv_quick();
GM_getValue("fuck_wetv_barrage") && main.wetv_barrage();
GM_getValue("fuck_wetv_watermark") && main.wetv_watermark();
GM_getValue("fuck_wetv_grayscale") && main.wetv_grayscale();

var storage = [{
    key: "fuck_wetv_ad",
    value: true
}, {
    key: "fuck_wetv_quick",
    value: true
}, {
    key: "fuck_wetv_barrage",
    value: true
}, {
    key: "fuck_wetv_watermark",
    value: true
}, {
    key: "fuck_wetv_grayscale",
    value: true
}];
storage.forEach((s) => {
    GM_getValue(s.key) === undefined && GM_setValue(s.key, s.value);
});

GM_registerMenuCommand("⚙️ 设置", () => {
    var style = `
.switch-txt
{
    display: flex;
    align-items: center;
    justify-content: space-between;
    letter-spacing: 2px;
    padding: 5px;
}

.switch-btn
{
    cursor: pointer;
    width: 52px;
    height: 25px;
    position: relative;
    background-color: #f5f5f5;
    border-radius: 19px;
    background-clip: content-box;
    display: inline-block;
    -webkit-appearance: none;
    -moz-appearance: none;
    transition: background-color ease .3s;
}

.switch-btn:before
{
    content: "";
    width: 25px;
    height: 25px;
    position: absolute;
    border-radius: 19px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .5);
    transition: left .2s;
}

.switch-btn:checked
{
    border-color: none;
    background-color: #7066e0;
    transition: background-color ease .3s;
}

.switch-btn:checked:before
{
    left: 29px;
    transition: left .2s;
}
`;

    var html = `
<label class="switch-txt">隐藏类似广告
<input id="wetv_ad" ${GM_getValue("fuck_wetv_ad") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏顶部导航
<input id="wetv_quick" ${GM_getValue("fuck_wetv_quick") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏视频弹幕
<input id="wetv_barrage" ${GM_getValue("fuck_wetv_barrage") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">移除右上视频水印
<input id="wetv_watermark" ${GM_getValue("fuck_wetv_watermark") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">禁止网站灰度转换
<input id="wetv_grayscale" ${GM_getValue("fuck_wetv_grayscale") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
`;

    var footer = `
<div style="text-align:center;font-size:0.9687em;">🔥🔥强烈建议使用
<a href="https://docs.scriptcat.org" target="_blank" style="color:#7066e0;">脚本猫</a>
安装🔥🔥</div>
`;

    GM_addStyle(GM_getResourceText("SwalStyle"));
    GM_addStyle(style);

    Swal.fire({
        icon: "info",
        title: "自定义配置",
        html: html,
        footer: footer,
        showCloseButton: true,
        confirmButtonText: "<b>保存配置</b>"
    }).then((result) => {
        result.isConfirmed && history.go(0);
    });

    document.querySelector("#wetv_ad").addEventListener("change", (e) => {
        GM_setValue("fuck_wetv_ad", e.target.checked);
    });
    document.querySelector("#wetv_quick").addEventListener("change", (e) => {
        GM_setValue("fuck_wetv_quick", e.target.checked);
    });
    document.querySelector("#wetv_barrage").addEventListener("change", (e) => {
        GM_setValue("fuck_wetv_barrage", e.target.checked);
    });
    document.querySelector("#wetv_watermark").addEventListener("change", (e) => {
        GM_setValue("fuck_wetv_watermark", e.target.checked);
    });
    document.querySelector("#wetv_grayscale").addEventListener("change", (e) => {
        GM_setValue("fuck_wetv_grayscale", e.target.checked);
    });

});
