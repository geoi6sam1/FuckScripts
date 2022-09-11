// ==UserScript==
// @name         去他の微软必应搜索
// @namespace    https://github.com/s757129/FuckScripts
// @version      0.1
// @description  屏蔽微软必应搜索广告加菊部美化
// @author       柒伍七
// @match        *://*.bing.com/search?q=*
// @icon         https://cn.bing.com/favicon.ico
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_addStyle
// @homepage     https://s757129.github.io
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    //unsafeWindow
    unsafeWindow.GM_addStyle = GM_addStyle;

    //新版广告
    GM_addStyle('.b_ad { display: none; }');//.b_adTop,.b_adBottom

    //旧版广告
    let fuckad = document.querySelectorAll('.b_attribution[data-partnertag]');//.b_attribution[data-tag]
    for (let i = 0; i < fuckad.length; i++) {
        fuckad[i].parentNode.parentNode.style.display = 'none';
    }

})();
