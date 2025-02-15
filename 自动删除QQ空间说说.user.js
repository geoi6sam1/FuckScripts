// ==UserScript==
// @name            自动删除QQ空间说说
// @namespace       https://github.com/geoisam
// @version         0.1.0
// @description     选择了莫后悔，失去了别追回，路还是要走滴，生活还是该继续
// @author          geoisam
// @match           *://user.qzone.qq.com/*
// @icon            https://qzone.qq.com/favicon.ico
// @supportURL      https://github.com/geoisam/FuckScripts/issues
// @run-at          document-end
// @license         GPL-3.0
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
