// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://github.com/s757129
// @version      0.1
// @description  隐藏腾讯视频影响观影体验的内容建议搭配VIP食用
// @author       柒伍七
// @match        *://v.qq.com/*
// @icon         https://v.qq.com/favicon.ico
// @supportURL   https://github.com/s757129/FuckScripts/issues
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

//unsafeWindow
unsafeWindow.GM_addStyle = GM_addStyle;

//GM_addStyle
GM_addStyle(`.quick_item.quick_games, .quick_item.quick_upload, .mod_row_box.mod_row_box_special, #ad_container, .vip-button, #iwan-game-switch-page, .txp-watermark, txpdiv.txp_zt {display: none !important;}`);
