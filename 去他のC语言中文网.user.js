// ==UserScript==
// @name         去他のC语言中文网
// @namespace    geoi6sam1
// @version      1.1.6
// @description  屏蔽C语言中文网广告
// @author       柒伍七
// @match        *://c.biancheng.net/*
// @match        *://m.biancheng.net/*
// @match        *://vip.biancheng.net/*
// @icon         http://c.biancheng.net/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @require      https://unpkg.com/sweetalert2@11.4.30/dist/sweetalert2.min.js
// @resource     SwalCSS https://unpkg.com/sweetalert2@11.4.30/dist/sweetalert2.min.css
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==


//菜单
let main = {

    //隐藏已知广告
    hidead() {
        GM_addStyle('#top-banner, #q2a-fudao, a[href*="fudao"], #product-type li a[href*="fudao"], #nav-main li a[href*="fudao"], #arc-append, .tip-box, blockquote, #ggxc-weixin-arcbottom, #ggxc-weixin-listbottom, .ad-box { display: none; }');
    },

    //隐藏会员中心
    hidevip() {
        GM_addStyle('#topbar, .user-info, #nav-main li a[href*="vip.biancheng.net"] { display: none; }');
    },

    //隐藏付费内容
    hidecost() {
        let iconfontvip = document.querySelectorAll('.iconfont-vip2');
        if (iconfontvip) {
            for (let i = 0; i < iconfontvip.length; ++i) {
                iconfontvip[i].parentNode.style.display = 'none';
            }
        }
    },

    //阻止新建标签
    disabledblank() {
        let rmatarget = document.querySelectorAll('a');
        for (let i = 0; i < rmatarget.length; ++i) {
            rmatarget[i].removeAttribute('target');
        }
    },

};

//判断配置
if (GM_getValue('setting_hide_ad')) {
    main.hidead();
};
if (GM_getValue('setting_hide_vip')) {
    main.hidevip();
};
if (GM_getValue('setting_hide_cost')) {
    main.hidecost();
};
if (GM_getValue('setting_disabled_blank')) {
    main.disabledblank();
};

//默认配置
let value = [{
    name: 'setting_hide_ad',
    value: true
}, {
    name: 'setting_hide_vip',
    value: true
}, {
    name: 'setting_hide_cost',
    value: true
}, {
    name: 'setting_disabled_blank',
    value: true
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
<label class="setting-label">隐藏会员中心<input id="hide_vip" ${GM_getValue('setting_hide_vip') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
<label class="setting-label">隐藏付费内容<input id="hide_cost" ${GM_getValue('setting_hide_cost') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
<label class="setting-label">阻止新建标签<input id="disabled_blank" ${GM_getValue('setting_disabled_blank') ? 'checked' : ''} type="checkbox" class="switch-btn switch-btn-animbg" /></label>
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
    document.querySelector('#hide_vip').addEventListener('change', (e) => {
        GM_setValue('setting_hide_vip', e.target.checked);
    });
    document.querySelector('#hide_cost').addEventListener('change', (e) => {
        GM_setValue('setting_hide_cost', e.target.checked);
    });
    document.querySelector('#disabled_blank').addEventListener('change', (e) => {
        GM_setValue('setting_disabled_blank', e.target.checked);
    });

});
