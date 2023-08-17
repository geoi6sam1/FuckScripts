// ==UserScript==
// @name         微软必应优化助手
// @namespace    geoi6sam1
// @version      0.7
// @description  屏蔽微软必应搜索广告
// @author       潘钜森
// @match        *://*.bing.com/search?*
// @icon         https://cn.bing.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @require      https://unpkg.com/sweetalert2@11.6.16/dist/sweetalert2.min.js
// @resource     SwalStyle https://unpkg.com/sweetalert2@11.6.16/dist/sweetalert2.min.css
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

let main = {
    hide_ad() {
        GM_addStyle(`.b_ad, .ad_sc, ul[data-partnertag], #b_pole, #b_opalpers, #bnp_rich_div, #ev_talkbox_wrapper, #b_notificationContainer_bop { display: none !important; }`);
        let old_ad = document.querySelectorAll(".b_algo");
        for (let i = 0; i < old_ad.length; ++i) {
            if (old_ad[i].firstChild.getAttribute("class") === null) {
                old_ad[i].style.display = "none";
            }
        }
        let bingApp_pc = document.querySelector("#bingApp_area");
        let bingApp_m = document.querySelector(".bingApp_area_m");
        if (bingApp_pc !== null) {
            bingApp_pc.parentNode.parentNode.parentNode.style.display = "none";
        }
        if (bingApp_m !== null) {
            bingApp_m.parentNode.parentNode.style.display = "none";
        }
    },
    
    hide_vids() {
        let vids_pc = document.querySelector("#serpvidans");
        let vids_m = document.querySelector("#vidans2");
        if (vids_pc !== null) {
            vids_pc.parentNode.parentNode.style.display = "none";
        }
        if (vids_m !== null) {
            vids_m.parentNode.parentNode.style.display = "none";
        }
    },

    hide_faq() {
        let btm_faq = document.querySelector("#df_listaa");
        if (btm_faq !== null) {
            if (navigator.userAgent.indexOf("Mobile") > -1) {
                btm_faq.parentNode.parentNode.parentNode.parentNode.style.display = "none";
            } else {
                btm_faq.parentNode.parentNode.parentNode.style.display = "none";
            }
        }
    },

    hide_rels() {
        let btm_search = document.querySelector(".b_rs");
        if (btm_search !== null) {
            btm_search.parentNode.style.display = "none";
        }
    },

    hide_recs() {
        GM_addStyle(`#b_recSQ { display: none; }`);
    },

    hide_news() {
        let news_info = document.querySelector("#ans_nws");
        if (news_info !== null) {
            news_info.parentNode.style.display = "none";
        }
    },
};

if (GM_getValue("setting_hide_ad")) {
    main.hide_ad();
}
if (GM_getValue("setting_hide_vids")) {
    main.hide_vids();
}
if (GM_getValue("setting_hide_faq")) {
    main.hide_faq();
}
if (GM_getValue("setting_hide_rels")) {
    main.hide_rels();
}
if (GM_getValue("setting_hide_recs")) {
    main.hide_recs();
}
if (GM_getValue("setting_hide_news")) {
    main.hide_news();
}

let storage = [{
    key: "setting_hide_ad",
    value: true
}, {
    key: "setting_hide_vids",
    value: true
}, {
    key: "setting_hide_faq",
    value: true
}, {
    key: "setting_hide_rels",
    value: true
}, {
    key: "setting_hide_recs",
    value: true
}, {
    key: "setting_hide_news",
    value: true
}];
storage.forEach((s) => {
    GM_getValue(s.key) === undefined && GM_setValue(s.key, s.value);
});

GM_registerMenuCommand("⚙️ 设置", () => {
    let style = `
.swal2-popup.swal2-modal { width:410px; }
.switch-txt { display:flex; align-items:center; justify-content:space-between; letter-spacing:2px; padding:5px; }
.switch-btn { cursor:pointer; width:52px; height:25px; position:relative; background-color:#f5f5f5; border-radius:19px; background-clip:content-box; display:inline-block; -webkit-appearance:none; -moz-appearance:none;  transition:background-color ease .3s; }
.switch-btn:before {content:""; width:25px; height:25px; position:absolute; border-radius:19px; background-color:#fff; box-shadow:0 1px 3px rgba(0, 0, 0, .5); transition:left .2s; }
.switch-btn:checked { border-color:none; background-color:#7066e0; transition:background-color ease .3s; }
.switch-btn:checked:before { left:29px; transition:left .2s; }
`;

    let html = `
<label class="switch-txt">隐藏已知广告
<input id="hide_ad" ${GM_getValue("setting_hide_ad") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏相关视频
<input id="hide_vids" ${GM_getValue("setting_hide_vids") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏人们还会问
<input id="hide_faq" ${GM_getValue("setting_hide_faq") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏底部相关搜索
<input id="hide_rels" ${GM_getValue("setting_hide_rels") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏底部最近的搜索
<input id="hide_recs" ${GM_getValue("setting_hide_recs") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏最新相关信息(资讯)
<input id="hide_news" ${GM_getValue("setting_hide_news") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
`;

    let footer = `
<div style="text-align: center;font-size: 0.9687em;">一起学习
<a href="https://bbs.tampermonkey.net.cn/thread-184-1-1.html" target="_blank" style="color:#7066e0;">油猴脚本开发</a>
吧😇，此脚本免费开源<br>Powered by
<a href="https://github.com/s757129" target="_blank" style="color:#7066e0;font-weight:bold;">柒伍七</a></div>
`;

    GM_addStyle(GM_getResourceText("SwalStyle"));
    GM_addStyle(style);

    Swal.fire({
        icon: "info",
        title: "自定义配置",
        html: html,
        footer: footer,
        showCloseButton: true,
        confirmButtonText: "<b>保存配置</b>",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: "配置保存成功",
                footer: footer,
                showConfirmButton: false,
                timer: 999,
            }).then((result) => {
                result.isConfirmed && history.go(0);
            });
        }
    });

    document.querySelector("#hide_ad").addEventListener("change", (e) => {
        GM_setValue("setting_hide_ad", e.target.checked);
    });
    document.querySelector("#hide_vids").addEventListener("change", (e) => {
        GM_setValue("setting_hide_vids", e.target.checked);
    });
    document.querySelector("#hide_faq").addEventListener("change", (e) => {
        GM_setValue("setting_hide_faq", e.target.checked);
    });
    document.querySelector("#hide_rels").addEventListener("change", (e) => {
        GM_setValue("setting_hide_rels", e.target.checked);
    });
    document.querySelector("#hide_recs").addEventListener("change", (e) => {
        GM_setValue("setting_hide_recs", e.target.checked);
    });
    document.querySelector("#hide_news").addEventListener("change", (e) => {
        GM_setValue("setting_hide_news", e.target.checked);
    });
});
