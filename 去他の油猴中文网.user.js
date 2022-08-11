// ==UserScript==
// @name         去他の油猴中文网
// @namespace    s757129
// @version      1.0.3
// @description  屏蔽油猴中文网广告加菊部美化
// @author       柒伍七
// @match        *://bbs.tampermonkey.net.cn/*
// @icon         https://bbs.tampermonkey.net.cn/favicon.ico
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @homepage     https://github.com/s757129/FuckScripts
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    //unsafeWindow
    unsafeWindow.GM_addStyle = GM_addStyle;

    //fuckStyle
    let fuckStyle = `
.comiis_nv_pop,.a_f,.a_p{display: none; !important}
.mn{width: 100%;height: 100%;left: 0;top:0;right:0;bottom: 0;margin: auto;}
    `;

    //loading
    GM_addStyle(fuckStyle);

    //李恒道哥哥牛逼！
    setTimeout(function() {
        let oldcopy = unsafeWindow.setCopy;
        unsafeWindow.setCopy = function(text, msg){
            return oldcopy.call(this,text.replace('\n(出处: 油猴中文网)\n',''), msg)
        }
    }, 1000);

})();
