// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://github.com/s757129
// @version      0.1
// @description  隐藏腾讯视频观影页面影响观影体验的内容
// @author       柒伍七
// @match        *://v.qq.com/x/cover/*
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
GM_addStyle(`.vip-button, #iwan-game-switch-page, .txp-watermark, txpdiv.txp_zt {display: none !important;}`);
