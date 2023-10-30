// ==UserScript==
// @name         微软必应优化助手
// @namespace    https://github.com/geoi6sam1
// @version      1.1.2
// @description  微软必应（Microsoft Bing）搜索结果优化，可自定义配置隐藏选项
// @author       geoi6sam1
// @match        *://*.bing.com/*
// @icon         https://bing.com/favicon.ico
// @supportURL   https://github.com/geoi6sam1/FuckScripts/issues
// @require      https://cdn.staticfile.org/sweetalert2/11.7.27/sweetalert2.min.js
// @resource     SwalStyle https://cdn.staticfile.org/sweetalert2/11.7.27/sweetalert2.min.css
// @antifeature  ads
// @antifeature  miner
// @antifeature  payment
// @antifeature  tracking
// @antifeature  membership
// @antifeature  referral-link
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==


var main = {
    /*** 相关视频 ***/
    bing_video() {
        GM_addStyle(`
li.b_ans:has(#serpvidans)
{
    display: none !important;
}
        `);
    },
    /*** 相关图像 ***/
    bing_image() {
        GM_addStyle(`
li.b_ans:has(.imgPart)
{
    display: none !important;
}
        `);
    },
    /*** 相关问题 ***/
    bing_faq() {
        GM_addStyle(`
li.b_ans:has(.df_alaskcarousel)
{
    display: none !important;
}
        `);
    },
    /*** 相关搜索 ***/
    bing_reles() {
        GM_addStyle(`
li.b_ans:has(.b_rs)
{
    display: none !important;
}
        `);
    },
    /*** 相关位置 ***/
    bing_maps() {
        GM_addStyle(`
li.b_ans:has(#lMapContainer)
{
    display: none !important;
}
        `);
    },
    /*** 相关资讯 ***/
    bing_news() {
        GM_addStyle(`
li.b_ans:has(#ans_nws)
{
    display: none !important;
}
        `);
    },
};

GM_getValue("bing_vip") !== true && GM_setValue("bing_vip", true) && window.location.reload(true);
GM_getValue("fuck_bing_video") && main.bing_video();
GM_getValue("fuck_bing_image") && main.bing_image();
GM_getValue("fuck_bing_faq") && main.bing_faq();
GM_getValue("fuck_bing_reles") && main.bing_reles();
GM_getValue("fuck_bing_maps") && main.bing_maps();
GM_getValue("fuck_bing_news") && main.bing_news();

var storage = [{
    key: "fuck_bing_video",
    value: true
}, {
    key: "fuck_bing_image",
    value: true
}, {
    key: "fuck_bing_faq",
    value: false
}, {
    key: "fuck_bing_reles",
    value: false
}, {
    key: "fuck_bing_maps",
    value: true
}, {
    key: "fuck_bing_news",
    value: false
}];
storage.forEach((s) => {
    GM_getValue(s.key) === undefined && GM_setValue(s.key, s.value);
});

GM_registerMenuCommand("⚙️ 设置", () => {
    var style = `
.switch-txt
{
    display: flex;
    align-items: center;
    justify-content: space-between;
    letter-spacing: 2px;
    padding: 5px;
}

.switch-btn
{
    cursor: pointer;
    width: 52px;
    height: 25px;
    position: relative;
    background-color: #f5f5f5;
    border-radius: 19px;
    background-clip: content-box;
    display: inline-block;
    -webkit-appearance: none;
    -moz-appearance: none;
    transition: background-color ease .3s;
}

.switch-btn:before
{
    content: "";
    width: 25px;
    height: 25px;
    position: absolute;
    border-radius: 19px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .5);
    transition: left .2s;
}

.switch-btn:checked
{
    border-color: none;
    background-color: #7066e0;
    transition: background-color ease .3s;
}

.switch-btn:checked:before
{
    left: 29px;
    transition: left .2s;
}
`;

    var html = `
<label class="switch-txt">隐藏相关视频
<input id="bing_video" ${GM_getValue("fuck_bing_video") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏相关图像
<input id="bing_image" ${GM_getValue("fuck_bing_image") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏人们还会问
<input id="bing_faq" ${GM_getValue("fuck_bing_faq") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏底部相关搜索
<input id="bing_reles" ${GM_getValue("fuck_bing_reles") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏附近相关店铺位置
<input id="bing_maps" ${GM_getValue("fuck_bing_maps") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
<label class="switch-txt">隐藏最新相关信息(资讯)
<input id="bing_news" ${GM_getValue("fuck_bing_news") ? "checked" : ""} type="checkbox" class="switch-btn" />
</label>
`;

    var footer = `
<div style="text-align:center;font-size:0.9687em;">🔥🔥强烈建议使用
<a href="https://docs.scriptcat.org" target="_blank" style="color:#7066e0;">脚本猫</a>
安装🔥🔥</div>
`;

    GM_addStyle(GM_getResourceText("SwalStyle"));
    GM_addStyle(style);

    Swal.fire({
        icon: "info",
        title: "自定义配置",
        html: html,
        footer: footer,
        showCloseButton: true,
        confirmButtonText: "<b>保存配置</b>"
    }).then((result) => {
        result.isConfirmed && history.go(0);
    });

    document.querySelector("#bing_video").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_video", e.target.checked);
    });
    document.querySelector("#bing_image").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_image", e.target.checked);
    });
    document.querySelector("#bing_faq").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_faq", e.target.checked);
    });
    document.querySelector("#bing_reles").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_reles", e.target.checked);
    });
    document.querySelector("#bing_maps").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_maps", e.target.checked);
    });
    document.querySelector("#bing_news").addEventListener("change", (e) => {
        GM_setValue("fuck_bing_news", e.target.checked);
    });

});


/*** 类似广告 ***/
GM_addStyle(`
.b_ad,
.ad_sc,
.adsblock,
#ads_banner,
li.b_algo:has(.b_attribution[data-partnertag]),
.b_hPanel:has([class*="bingApp_"]),
.sidebar:has(.ads_dwn),
#bgPro,
#b_pole,
#suspenBar,
#b_opalpers,
#bnp_ttc_div,
#bnp_rich_div,
#b_ims_bza_pole,
#ev_talkbox_wrapper,
#idCont [id*="id_qrcode"],
#b_notificationContainer_bop
{
    display: none !important;
}
        `);

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var bing_header = document.querySelector("#b_header");
var observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type == "attributes") {
            bing_header.style.backgroundColor = "";
            bing_header.style.borderBottom = "1px solid #ececec";
        }
    });
});

observer.observe(bing_header, {
    attributes: true,
    attributeFilter: ['style']
});
