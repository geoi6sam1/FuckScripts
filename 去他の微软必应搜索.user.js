// ==UserScript==
// @name         去他の微软必应搜索
// @namespace    https://github.com/s757129
// @homepage     https://s757129.github.io
// @supportURL   https://github.com/s757129/FuckScripts
// @version      0.3
// @description  屏蔽微软必应搜索广告加菊部美化
// @author       柒伍七
// @match        *://*.bing.com/search?*
// @icon         https://cn.bing.com/favicon.ico
// @require      https://unpkg.com/sweetalert2@11.4.30/dist/sweetalert2.min.js
// @resource     SwalCSS https://unpkg.com/sweetalert2@11.4.30/dist/sweetalert2.min.css
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @license      What The Hell
// ==/UserScript==

(function () {
    'use strict';

    //unsafeWindow
    unsafeWindow.GM_addStyle = GM_addStyle;
    unsafeWindow.GM_getValue = GM_getValue;
    unsafeWindow.GM_setValue = GM_setValue;
    unsafeWindow.GM_getResourceText = GM_getResourceText;
    unsafeWindow.GM_registerMenuCommand = GM_registerMenuCommand;

    //菜单
    let main = {

        /*** 隐藏已知广告 ***/
        hidead() {
            //新版广告
            GM_addStyle('.b_ad, ul[data-partnertag] { display: none; }');

            //旧版广告
            let fuckad = document.querySelectorAll('.b_attribution[data-partnertag]');
            for (let i = 0; i < fuckad.length; i++) {
                fuckad[i].parentNode.parentNode.style.display = 'none';
            }

            //显示相关视频
            let bottom_sp = document.querySelector('#serpvidans');
            if (bottom_sp) {
                bottom_sp.style.display = 'block';
            }
        },

        /*** 隐藏相关视频 ***/
        hidesp() {
            let bottom_sp = document.querySelector('#serpvidans');
            if (bottom_sp) {
                bottom_sp.parentNode.parentNode.style.display = 'none';
                bottom_sp.style.display = 'block';
            }
            let phone_sp = document.querySelector('#vidans2');
            if (phone_sp) {
                phone_sp.parentNode.parentNode.style.display = 'none';
            }
        },

        /*** 隐藏人们还会问 ***/
        hiderw() {
            let bottom_rw = document.querySelector('#df_listaa');
            if (bottom_rw) {
                if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1 || navigator.userAgent.indexOf('iPod') > -1 || navigator.userAgent.indexOf('Symbian') > -1) {
                    bottom_rw.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
                } else {
                    bottom_rw.parentNode.parentNode.parentNode.style.display = 'none';
                }
            }
        },

        /*** 隐藏底部相关搜索 ***/
        hiders() {
            let bottom_rs = document.querySelector('.b_rs');
            if (bottom_rs) {
                bottom_rs.parentNode.style.display = 'none';
            }
        },

    };

    //判断配置
    if (GM_getValue('setting_hide_ad')) {
        main.hidead();
    };
    if (GM_getValue('setting_hide_sp')) {
        main.hidesp();
    };
    if (GM_getValue('setting_hide_rw')) {
        main.hiderw();
    };
    if (GM_getValue('setting_hide_rs')) {
        main.hiders();
    };

    //默认配置
    let value = [{
        name: 'setting_hide_ad',
        value: true
    }, {
        name: 'setting_hide_sp',
        value: true
    }, {
        name: 'setting_hide_rw',
        value: false
    }, {
        name: 'setting_hide_rs',
        value: false
    }];
    value.forEach((v) => {
        GM_getValue(v.name) === undefined && GM_setValue(v.name, v.value);
    });

    //设置
    GM_registerMenuCommand('⚙️ 设置', () => {

        //CSS
        let SwalStyle = `
.setting-container { z-index: 99999; }
.swal2-popup { width: 23em; }
.swal2-footer { font-size: 0.875em; }
#swal2-title strong { font-weight: bold; color: #515154;}
.setting-label { display: flex; align-items: center; justify-content: space-between; letter-spacing:2px; margin:11px 22px; }
.switch-btn { cursor: pointer; width: 45px; height: 28px; position: relative; border: 1px solid #dfdfdf; background-color: #fdfdfd; box-shadow: #dfdfdf 0 0 0 0 inset; border-radius: 15px; background-clip: content-box; display: inline-block; -webkit-appearance: none; user-select: none; outline: none; }
.switch-btn:before {content: ''; width: 25px; height: 25px; position: absolute; top: 0; left: 0; border-radius: 20px; background-color: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .4); }
.switch-btn:checked { border-color: #7066e0; box-shadow: #7066e0 0 0 0 16px inset; background-color: #7066e0; }
.switch-btn:checked:before { left: 18px; }
.switch-btn.switch-btn-animbg { transition: background-color ease .4s; }
.switch-btn.switch-btn-animbg:before { transition: left .3s; }
.switch-btn.switch-btn-animbg:checked { box-shadow: #dfdfdf 0 0 0 0 inset; background-color: #7066e0; transition: border-color .4s, background-color ease .4s; }
.switch-btn.switch-btn-animbg:checked:before { transition: left .3s; }
		`;

        //HTML
        let Swalhtml = `
<label class="setting-label">隐藏已知广告<input id="hide_ad" ${GM_getValue('setting_hide_ad') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
<label class="setting-label">隐藏相关视频<input id="hide_sp" ${GM_getValue('setting_hide_sp') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
<label class="setting-label">隐藏人们还会问<input id="hide_rw" ${GM_getValue('setting_hide_rw') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
<label class="setting-label">隐藏底部相关搜索<input id="hide_rs" ${GM_getValue('setting_hide_rs') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
    	`;

        //载入资源
        GM_addStyle(GM_getResourceText('SwalCSS'));
        GM_addStyle(SwalStyle);

        //SweetAlert2
        Swal.fire({
            icon: 'info',
            title: '<strong>自定义配置</strong>',
            html: Swalhtml,
            showCloseButton: true,
            confirmButtonText: '保存',
            footer: '<div style="text-align: center;font-size: 1em;">一起学习 <a href="https://bbs.tampermonkey.net.cn/thread-184-1-1.html" target="_blank" style="color:#7066e0;">油猴脚本开发</a> 吧，此脚本免费开源<br>Powered by <a href="https://github.com/s757129" target="_blank" style="color:#7066e0;font-weight:bold;">柒伍七</a></div>',
        }).then((result) => {
            result.isConfirmed && history.go(0);
        });

        //Checkbox
        document.querySelector('#hide_ad').addEventListener('change', (e) => {
            GM_setValue('setting_hide_ad', e.target.checked);
        });
        document.querySelector('#hide_sp').addEventListener('change', (e) => {
            GM_setValue('setting_hide_sp', e.target.checked);
        });
        document.querySelector('#hide_rw').addEventListener('change', (e) => {
            GM_setValue('setting_hide_rw', e.target.checked);
        });
        document.querySelector('#hide_rs').addEventListener('change', (e) => {
            GM_setValue('setting_hide_rs', e.target.checked);
        });

    });

})();
