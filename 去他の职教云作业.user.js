// ==UserScript==
// @name         去他の职教云作业
// @namespace    s757129
// @version      0.1
// @description  旧版职教云作业解除限制，点击题目一键复制到剪切板，方便用于微信公众号搜题
// @author       柒伍七
// @match        *://*.icve.com.cn/*
// @icon         https://zjy2.icve.com.cn/common/images/logo.png
// @run-at       document-end
// @require      https://unpkg.com/jquery@3.6.0/dist/jquery.js
// @homepage     https://github.com/s757129/FuckScripts
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 解除禁止右键菜单
    document.oncontextmenu = function(){ return true; };

    // 解除禁止文字选择
    document.onselectstart = function(){ return true; };

    // 解除禁止复制
    document.oncopy = function(){ return true; };

    // 解除禁止剪切
    document.oncut = function(){ return true; };

    // 解除禁止粘贴
    document.onpaste = function(){ return true; };

    // 复制选中字符串
    function CopyText(str) {
        $('#copyq').text(str).show();
        document.querySelector('#copyq').select();
        document.execCommand('copy', false, null);
        $('#copyq').hide();
    }

    // 延迟1s执行
    setTimeout(function() {
        $('#udesk_container').html(`<textarea id="copyq" style="display:none;"></textarea>`);

        $('.ErichText.destroyTitleButton').click(function () {
            $(this).css('cursor','pointer');
            var qstr = $(this).text();
            CopyText(qstr);
        })
    }, 1000);

})();
