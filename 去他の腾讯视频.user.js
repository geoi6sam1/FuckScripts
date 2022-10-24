// ==UserScript==
// @name         去他の腾讯视频
// @namespace    https://scriptcat.org/script-show-page/105
// @description  隐藏腾讯视频观影页面影响观影体验的内容
// @version      0.1
// @author       柒伍七
// @match        *://v.qq.com/x/cover/*
// @icon         https://v.qq.com/favicon.ico
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

unsafeWindow.GM_addStyle = GM_addStyle;
GM_addStyle(`.vip-button, #iwan-game-switch-page, .txp-watermark, txpdiv.txp_zt {display: none !important;}`);
