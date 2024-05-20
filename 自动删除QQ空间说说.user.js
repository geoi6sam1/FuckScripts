// ==UserScript==
// @name            自动删除QQ空间说说
// @namespace       https://github.com/geoi6sam1
// @version         0.1.0
// @description     选择了莫后悔，失去了别追回，路还是要走滴，生活还是该继续
// @author          geoi6sam1
// @match           *://user.qzone.qq.com/*
// @icon            https://qzone.qq.com/favicon.ico
// @supportURL      https://github.com/geoi6sam1/FuckScripts/issues
// @run-at          document-end
// @license         GPL-3.0
// @updateURL       https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E8%87%AA%E5%8A%A8%E5%88%A0%E9%99%A4QQ%E7%A9%BA%E9%97%B4%E8%AF%B4%E8%AF%B4.user.js
// @downloadURL     https://raw.githubusercontent.com/geoi6sam1/FuckScripts/main/%E8%87%AA%E5%8A%A8%E5%88%A0%E9%99%A4QQ%E7%A9%BA%E9%97%B4%E8%AF%B4%E8%AF%B4.user.js
// ==/UserScript==

setTimeout(() => {
    var qz_shuoshuo = document.querySelector(".app_canvas_frame")
    if (!qz_shuoshuo) {
        custom_menu_swf("311")
    }
}, 4321)

function del_qz_shuoshuo() {
    var choosess = document.querySelectorAll(".del.del_btn")[0]
    if (choosess) {
        choosess.click()
    }
    setTimeout(() => { del_qz_dialog() }, 1234)
}

function del_qz_dialog() {
    var deletess = document.querySelectorAll(".qz_dialog_layer_btn.qz_dialog_layer_sub")[0]
    if (deletess) {
        deletess.click()
    }
    setTimeout(() => { del_qz_shuoshuo() }, 1234)
}

del_qz_shuoshuo()

setTimeout(() => {
    window.location.reload(true)
}, 56789)
