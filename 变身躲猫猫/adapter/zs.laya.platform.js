window.zs = window.zs || {};
window.zs.laya = window.zs.laya || {};
(function (exports, Laya) {
    'use strict';
    class PlatformMgr extends Laya.Script {
        constructor() {
            super();
        }

        /**设置用户id，是否是新用户 */
        static setUserID(user_id, is_new) {
            PlatformMgr.user_id = user_id;
            PlatformMgr.is_new = is_new;
        }

        /**初始化平台配置 以及对应的页面展示代码 */
        static initCFG(data) {
            this.platformCfg = data;

            this.adViewUrl = {
                "screenAd": "view/ad/FullAd_4.scene",
                "floatAd": "view/ad/FloatAd.scene",
                "listAd": "view/ad/ListAd.scene",
                "nativeAd": "view/ad/NativeAd.scene"
            };
            this.adViewScript = {
                "screenAd": FullScreeAdView,
                "floatAd": HomeFloatAdView,
                "listAd": ListAdView,
                "nativeAd": ScreeNativeAdView
            }

        }

        /**初始化平台音乐文件路径 */
        static initSoundUrl(openSound, clickSound) {
            this.openSound = openSound;
            this.clickSound = clickSound;
        }

        /**初始化平台广告 */
        static initGameAd() {
            if (ADConfig.zs_onemin_show_ad_switch) {
                this.isInOneMin = true;
                Laya.timer.once(60000, this, () => {
                    this.isInOneMin = false;
                    zs.laya.sdk.SdkService.initBannerAd(ADConfig.zs_banner_adunit);
                });
            } else {
                if (ADConfig.zs_show_banner_time > 0) {
                    Laya.timer.once(ADConfig.zs_show_banner_time, this, () => {
                        zs.laya.sdk.SdkService.initBannerAd(ADConfig.zs_banner_adunit);
                    });
                } else {
                    zs.laya.sdk.SdkService.initBannerAd(ADConfig.zs_banner_adunit);
                }
            }
            zs.laya.sdk.SdkService.initVideoAd(ADConfig.zs_video_adunit);
            zs.laya.sdk.SdkService.initInsertAd(ADConfig.zs_full_screen_adunit, null);
            zs.laya.sdk.SdkService.initGamePortalAd(ADConfig.zs_gamePortalAd_id);
            zs.laya.sdk.SdkService.initGameBannerAd(ADConfig.zs_gameBannerAd_id);
            Laya.stage.on(zs.laya.sdk.SdkService.ADD_DESKTEP_ICON_SUCCESS, this, this.onDesktepIcon);
            zs.laya.sdk.SdkService.hasDesktopIcon();
        }

        static onDesktepIcon(evt, isClickDeskIcon) {
            ADConfig.zs_desktop_icon = evt.hasIcon;
        }

        static initView(view, type, data) {
            view._gameData = data;
            if (type) {
                var script = view.getComponent(type);
                if (script == null) {
                    script = view.addComponent(type);
                }
                if (script.initView) {
                    script.initView(data)
                }
            }
        }

        /**
         * showScreenAd
         */
        static showScreenAd(data) {
            if (this.adViewUrl.screenAd == null) {
                console.error("showScreenAd error");
                return;
            }
            Laya.Scene.open(this.adViewUrl.screenAd, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.adViewScript.screenAd, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideScreenAd() {
            if (this.adViewUrl.screenAd == null) {
                return;
            }
            Laya.Scene.close(this.adViewUrl.screenAd)
        }

        /**
        * showListAd
        */
        static showListAd(data) {
            if (this.adViewUrl.listAd == null) {
                console.error("showListAd error");
                return;
            }
            Laya.Scene.open(this.adViewUrl.listAd, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.adViewScript.listAd, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideListAd() {
            if (this.adViewUrl.listAd == null) {
                return;
            }
            Laya.Scene.close(this.adViewUrl.listAd)
        }

        /**
         * showHomeFloatAd
         */
        static showHomeFloatAd(data) {
            if (this.adViewUrl.floatAd == null) {
                console.error("showHomeFloatAd error");
                return;
            }
            Laya.Scene.open(this.adViewUrl.floatAd, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.adViewScript.floatAd, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideHomeFloatAd() {
            if (this.adViewUrl.floatAd == null) {
                return;
            }
            Laya.Scene.close(this.adViewUrl.floatAd)
        }

        /**
        * showNativeAd
        */
        static showNativeAd(data) {
            Laya.Scene.open(this.adViewUrl.nativeAd, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.adViewScript.nativeAd, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        /**
         * hideNativeAd
         */
        static hideNativeAd() {
            if (this.adViewUrl.nativeAd == null) {
                return;
            }
            Laya.Scene.close(this.adViewUrl.nativeAd);
        }

        /**打开获得奖励界面 */
        static showGetAward(data) {
            Laya.Scene.open(this.adViewUrl.getAward, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.adViewScript.getAward, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        /**进入游戏弹窗 */
        static enterGamePopup() {
            setTimeout(function () {
                zs.laya.sdk.SdkService.reportMonitor('game_scene', 0);
                // if (!ADConfig.zs_desktop_icon && ADConfig.zs_jump_switch && ADConfig.isPublicVersion()) {
                //     zs.laya.sdk.SdkService.createDesktopIcon(
                //         Laya.Handler.create(this,function(){
                //             Laya.stage.once(PlatformMgr.APP_SHOW,this,function(){
                //                 zs.laya.sdk.SdkService.hasDesktopIcon();
                //             });
                //         })
                //     );
                // } 
            }, 3000);

            //ljc开局增加虚假曝光
            if (ADConfig.zs_start_exposure_num > 0) {
                for (let i = 0; i < ADConfig.zs_start_exposure_num; i++) {
                    this.addFakeReportNativeAdShow(i);
                }
            }
        }

        /**游戏失败弹窗处理 */
        static onGameFaildPopUp(data) {
            ADConfig.isBeforeGameOver = true;
            // if(ADConfig.isBeforeGameAccount()){
            //     ADConfig.isBeforeGameOver = true;
            //     Laya.stage.on(PlatformMgr.UI_VIEW_CLOSED, null, PlatformMgr.onHideExportView, [0, data]); 
            //     PlatformMgr.showGetAward();
            // }else{
            //     Laya.stage.event(PlatformMgr.OPEN_FAILED_VIEW,[data]);
            // }
            Laya.stage.event(PlatformMgr.OPEN_FAILED_VIEW, [data]);
        }

        /**游戏成功后弹窗处理 */
        static onGameWinPopUp(data) {
            ADConfig.isBeforeGameOver = true;
            // if(ADConfig.isBeforeGameAccount()){
            //     ADConfig.isBeforeGameOver = true;
            //     Laya.stage.on(PlatformMgr.UI_VIEW_CLOSED, null, PlatformMgr.onHideExportView, [1, data]); 
            //     PlatformMgr.showGetAward();
            // }else{
            //     Laya.stage.event(PlatformMgr.OPEN_WIN_VIEW,[data]);
            // }
            Laya.stage.event(PlatformMgr.OPEN_WIN_VIEW, [data]);
        }

        static onGameOverPopUp(data) {
            // console.log("------------- :" + ADConfig.isPublicVersion() + "  zs_native_limit:" + ADConfig.zs_native_limit,"一分钟不展示ad: ",PlatformMgr.isInOneMin);
            // if (ADConfig.isPublicVersion() && ADConfig.zs_native_limit && !PlatformMgr.isInOneMin) {
            //     Laya.stage.on(PlatformMgr.UI_VIEW_CLOSED, null, PlatformMgr.onHideExportView, [2, data]);
            //     PlatformMgr.showNativeAd();
            // } else {
            Laya.stage.event(PlatformMgr.GAME_RESET_START, [data]);
            // }
        }

        static onHideExportView(status, data, viewName) {
            if (viewName == "NativeAd") {
                if (status == 2) {
                    Laya.stage.event(PlatformMgr.GAME_RESET_START);
                }
                Laya.stage.off(PlatformMgr.UI_VIEW_CLOSED, null, PlatformMgr.onHideExportView);
            }
        }

        //ljc增加虚假曝光
        static addFakeReportNativeAdShow(time = 0) {
            setTimeout(() => {
                console.log("ljc 开局 增加一次无效原生曝光")
                let adUnit = zs.laya.platform.ADConfig.zs_native_adunit;
                zs.laya.sdk.SdkService.initNativeAd(adUnit, Laya.Handler.create(this, () => {
                    console.log("ljc 开局 增加一次无效原生曝光 ----- initNativeAd ---- onAdError");
                }));
                zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, (data) => {
                    console.log("ljc 开局 增加一次无效原生曝光 ----- loadNativeAd ---- onAdSuc");
                    var adData = data.adList[0];
                    var adId = adData.adId;
                    console.log("ljc ------------------------ adId", adId);
                    zs.laya.sdk.SdkService.reportNativeAdShow(adId);

                }), Laya.Handler.create(this, () => {
                    console.log("ljc 开局 增加一次无效原生曝光 ----- loadNativeAd ---- onAdError");
                }));
            }, 1000 + 6000 * time);
        }

        /**
         * 上报原生广告显示
         * @param  adId 
         */
        static sendReqAdShowReport(adIcon, adId) {
            if (window["zsSdk"]) {
                if (!adId) {
                    return;
                }
                zs.laya.sdk.SdkService.reportNativeAdShow(adId);
                if (adIcon) {
                    zs.laya.sdk.ZSReportSdk.requestNativeAdReport({ "adunit": adIcon, "type": "display" }, function (data) {
                        var adStatus = data.ad_status == "0";
                        if (zs.laya.platform.ADConfig.zs_ad_report_status[data.adunit] && adStatus == false) {
                            return;
                        }
                        console.log("原生广告上报返回id:" + data.adunit + " adStatus:" + adStatus);
                        zs.laya.platform.ADConfig.zs_ad_report_status[data.adunit] = adStatus;
                    });
                }
            }
        }

        static sendReqAdClickReport(adIcon, adId) {
            if (window["zsSdk"]) {
                if (!adId) {
                    return;
                }
                if (adIcon == undefined || ADConfig.zs_ad_report_status[adIcon] == undefined || ADConfig.zs_ad_report_status[adIcon]) {
                    zs.laya.sdk.SdkService.reportNativeAdClick(adId);
                    if (adIcon) {
                        zs.laya.sdk.ZSReportSdk.requestNativeAdReport({ "adunit": adIcon, "type": "click" }, function (data) {
                            var adStatus = data.ad_status == "0";
                            console.log("原生广告上报返回id:" + data.adunit + " adStatus:" + adStatus);
                            zs.laya.platform.ADConfig.zs_ad_report_status[data.adunit] = adStatus;

                        });
                    }
                }
            }
        }
    }


    PlatformMgr.platformCfg = null;
    PlatformMgr.user_id = 1;
    PlatformMgr.is_new = 1;
    PlatformMgr.reportClickTIme = 0;
    PlatformMgr.APP_SHOW = "DEVICE_ON_SHOW";
    PlatformMgr.APP_HIDE = "DEVICE_ON_HIDE";
    PlatformMgr.isInOneMin = false;
    // PlatformMgr.APP_JUMP_CANCEL = "NAVIGATE_FAILED"; // 跳转失败
    // PlatformMgr.APP_JUMP_SUCCESS = "NAVIGATE_SUCCESS";//跳转成功
    PlatformMgr.AD_CONFIIG_LOADED = "AD_CONFIIG_LOADED";
    PlatformMgr.UI_VIEW_OPENED = "UI_VIEW_OPENED";// zs.laya.base.BaseView.EVENT_UI_VIEW_CLOSED
    PlatformMgr.UI_VIEW_CLOSED = "UI_VIEW_CLOSED";

    PlatformMgr.OPEN_WIN_VIEW = "OPEN_WIN_VIEW"; //通知打开游戏胜利结算页
    PlatformMgr.OPEN_FAILED_VIEW = "OPEN_FAILED_VIEW";//通知打开游戏失败结算页
    PlatformMgr.GAME_RESET_START = "GAME_RESET_START";//通知重新回到游戏首页
    PlatformMgr.GAME_GET_AWARD = "GAME_GET_AWARD";//获得游戏奖励

    Laya.ILaya.regClass(PlatformMgr);
    Laya.ClassUtils.regClass("zs.laya.platform.PlatformMgr", PlatformMgr);
    Laya.ClassUtils.regClass("Zhise.PlatformMgr", PlatformMgr);


    /**常用的数据方法 */
    class MathUtils {
        static compareVersion(v1, v2) {//比较版本
            v1 = v1.split('.');
            v2 = v2.split('.');
            var len = Math.max(v1.length, v2.length);
            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }
            for (var i = 0; i < len; i++) {
                var num1 = parseInt(v1[i]);
                var num2 = parseInt(v2[i]);
                if (num1 > num2) {
                    return 1;
                } else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }

        static isToday(date) {
            var now = new Date(Date.now());
            var target = new Date(date);
            if (now.getFullYear() != target.getFullYear() || now.getMonth() != target.getMonth() || now.getDate() != target.getDate()) {
                return false;
            }
            else {
                return true;
            }
        }

        /** 获取范围内的随机数 [min,max) */
        static random(min, max) {
            return Math.random() * (max - min) + min << 0;
        }

        /**是否为数字 包括字符串数字*/
        static IsNumber(val) {
            var regPos = /^\d+(\.\d+)?$/; //非负浮点数
            var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
            if (regPos.test(val) || regNeg.test(val)) {
                return true;
            } else {
                return false;
            }
        }
    }

    class ADConfig {
        constructor() {
            this.current_version = "1.0";
        }

        static initAdSetting(current_version, webResponse) {
            this.current_version = current_version;
            var filterSystem = webResponse.zs_banner_system ? String(webResponse.zs_banner_system).toUpperCase() : null;
            this.zs_version = webResponse.zs_number ? webResponse.zs_number : "0.0";
            var enable_banner_op = !filterSystem || !Laya.Browser.onMobile || !((filterSystem.indexOf("ANDROID") != -1 && Laya.Browser.onAndroid) || (filterSystem.indexOf("IOS") != -1 && !Laya.Browser.onAndroid));
            this.zs_switch = webResponse.zs_switch == 1 && enable_banner_op && this.isPublicVersion();
            this.zs_video_adunit = webResponse.zs_video_adunit;
            this.zs_banner_adunit = webResponse.zs_banner_adunit;
            this.zs_native_adunit = webResponse.zs_native_adunit;
            this.zs_full_screen_adunit = webResponse.zs_full_screen_adunit;
            this.zs_full_screen_ad_enable = webResponse.zs_full_screen_ad == 1;
            this.zs_banner_text_time = webResponse.zs_banner_text_time ? Number(webResponse.zs_banner_text_time) : 1000;
            this.zs_banner_move_time = webResponse.zs_banner_move_time ? Number(webResponse.zs_banner_move_time) : 500;
            this.zs_banner_banner_time = webResponse.zs_banner_banner_time ? Number(webResponse.zs_banner_banner_time) : 1000;
            this.zs_banner_refresh_time = webResponse.zs_banner_refresh_time ? Number(webResponse.zs_banner_refresh_time) : 1000;
            this.zs_banner_vertical_enable = webResponse.zs_banner_vertical_enable == 1;
            this.zs_banner_horizontal_enable = webResponse.zs_banner_horizontal_enable == 1;
            this.zs_share_title = webResponse.zs_share_title;
            this.zs_share_image = webResponse.zs_share_img;
            this.zs_jump_switch = webResponse.zs_jump_switch == 1;
            this.zs_native_click_switch = webResponse.zs_native_click_switch == 1;
            this.zs_native_newer_times = webResponse.zs_native_newer_times ? Number(webResponse.zs_native_newer_times) : 1;
            this.zs_full_screen_jump = webResponse.zs_full_screen_jump == 1;
            this.zs_native_limit_10 = webResponse.zs_native_limit_10 == 1;
            this.zs_native_btn_text = webResponse.zs_native_btn_text;

            this.zs_revive_type = webResponse.zs_revive_type;
            this.zs_revive_click_num = webResponse.zs_revive_click_num;
            this.zs_revive_video_num = webResponse.zs_revive_video_num;
            this.zs_revive_share_num = webResponse.zs_revive_share_num;
            this.zs_revive_style = webResponse.zs_revive_style ? Number(webResponse.zs_revive_style) : 0;

            this.zs_native_adunit_icon = webResponse.zs_native_adunit_icon;
            this.zs_native_adunit_game = webResponse.zs_native_adunit_game;
            this.zs_native_adunit_finish = webResponse.zs_native_adunit_finish;
            this.zs_native_timeout = webResponse.zs_native_timeout ? Number(webResponse.zs_native_timeout) : 2000;

            this.zs_native_limit = this.getNumberVal(webResponse.zs_native_limit, 0) == 1;
            this.zs_native_end_before_num = webResponse.zs_native_end_before_num;
            this.zs_native_lsat_showTime = 0;
            this.zs_onemin_show_ad_switch = webResponse.zs_onemin_show_ad_switch == 1;
            this.zs_jump_time = Number(webResponse.zs_jump_time);
            this.zs_show_banner_time = this.getNumberVal(webResponse.zs_show_banner_time, 0) * 1000;
            this.zs_gamePortalAd_id = webResponse.zs_gamePortalAd_id;
            this.zs_gameBannerAd_id = webResponse.zs_gameBannerAd_id;
            this.zs_native_touch_switch = webResponse.zs_native_touch_switch == 1 && this.zs_switch;
            this.zs_start_exposure_num = Number(webResponse.zs_start_exposure_num);//开局上报X次曝光
            this.zs_game_time = webResponse.zs_game_time ? Number(webResponse.zs_game_time) : 150;
            this.zs_gameover_button_switch = webResponse.zs_gameover_button_switch == 1;
            this.zs_item_time = webResponse.zs_item_time ? Number(webResponse.zs_item_time) : 10;
            this.zs_lucky_box_num = webResponse.zs_lucky_box_num ? Number(webResponse.zs_lucky_box_num) : 5;

            Laya.LocalStorage.setItem(ADConfig.zs_native_adunit + "open_native_num", "1");
            Laya.LocalStorage.setItem(ADConfig.zs_native_adunit + "game_num", "1");
        }

        static isPublicVersion() {
            return this.current_version != this.zs_version;
        }

        static getNumberVal(val, def) {
            def = MathUtils.IsNumber(def) ? Number(def) : 0;
            return MathUtils.IsNumber(val) ? Number(val) : def;
        }

        static isOppoShowAd() {
            var showAd = true;
            if (ADConfig.zs_native_limit_10) {
                var now = Laya.Browser.now();
                var gapTime = now - ADConfig.zs_native_lsat_showTime;
                showAd = gapTime >= 10000;
            }
            // console.log("========== zs_native_limit_10:" + ADConfig.zs_native_limit_10 + "      gapTime:" + gapTime);
            return showAd;
        }

        static isShowNativeAd(gameNum) {
            if (MathUtils.IsNumber(ADConfig.zs_native_end_before_num)) {
                //如果是-1则是无限制
                if (ADConfig.zs_native_end_before_num == -1) return true;
                var open_native_num = ADConfig.getNativeOpenNum();
                console.log("----原生广告打开次数：" + open_native_num);
                if (Number(ADConfig.zs_native_end_before_num) > Number(open_native_num)) return true;
            }

            if (ADConfig.zs_native_end_before_num && ADConfig.zs_native_end_before_num.length > 0) {

                var tempStr = ADConfig.zs_native_end_before_num.slice(1, ADConfig.zs_native_end_before_num.length - 1);
                var tempArr = tempStr.split(",");
                if (tempArr.length == 1 && tempArr[0] == -1)
                    return true;

                var index = tempArr.indexOf(gameNum + "");
                if (index != -1) {
                    console.log("----游戏次数：" + gameNum);
                    return true;
                }
                ADConfig.updateReviveTypeInfo(ADConfig.zs_native_adunit + "game_num");
            }
            return false;
        }


        static enableClickRevive() {
            return this.isReviveTypeEnable("zs_revive_click_num");
        }

        static updateClickRevive() {
            this.updateReviveTypeInfo("zs_revive_click_num");
        }

        static enableVideoRevive() {
            return this.isReviveTypeEnable("zs_revive_video_num");
        }

        static updateVideoRevive() {
            this.updateReviveTypeInfo("zs_revive_video_num");
        }

        static enableShareRevive() {
            return this.isReviveTypeEnable("zs_revive_share_num");
        }

        static updateShareRevive() {
            this.updateReviveTypeInfo("zs_revive_share_num");
        }

        /**游戏结束前 */
        static isBeforeGameAccount() {
            var gameNum = ADConfig.getGameNum();
            return ADConfig.isShowNativeAd(gameNum) && ADConfig.isPublicVersion() && ADConfig.isOppoShowAd();
        }

        /**游戏结束后 */
        static isAfterGameAccount() {
            return ADConfig.isPublicVersion() && ADConfig.isOppoShowAd();
        }

        static isReviveTypeEnable(type) {
            if (this[type] == 0) {
                return false;
            }
            if (this[type] == -1) {
                return true;
            }
            var clickTimestamp = Laya.LocalStorage.getItem(type + "_time_stamp");
            if (clickTimestamp == null || clickTimestamp == "" || MathUtils.isToday(Number(clickTimestamp)) == false) {
                return true;
            }
            var strNum = Laya.LocalStorage.getItem(type);
            var numVal = strNum == null || strNum == "" ? 0 : Number(strNum);
            return numVal < this[type];
        }

        static updateReviveTypeInfo(type) {
            Laya.LocalStorage.setItem(type + "_time_stamp", Date.now().toString());
            var strNum = Laya.LocalStorage.getItem(type);
            var numVal = strNum == null || strNum == "" ? 0 : Number(strNum);
            numVal++;
            Laya.LocalStorage.setItem(type, numVal.toString());
        }

        static getNativeOpenNum() {
            var clickTimestamp = Laya.LocalStorage.getItem(ADConfig.zs_native_adunit + "open_native_num_time_stamp");
            if (clickTimestamp == null || clickTimestamp == "" || MathUtils.isToday(Number(clickTimestamp)) == false) {
                Laya.LocalStorage.setItem(ADConfig.zs_native_adunit + "open_native_num", "0");
                return 0;
            }
            var strNum = Laya.LocalStorage.getItem(ADConfig.zs_native_adunit + "open_native_num");
            var numVal = strNum == null || strNum == "" ? 0 : Number(strNum);
            return numVal;
        }

        static getGameNum() {
            var clickTimestamp = Laya.LocalStorage.getItem(ADConfig.zs_native_adunit + "game_num_time_stamp");
            if (clickTimestamp == null || clickTimestamp == "" || MathUtils.isToday(Number(clickTimestamp)) == false) {
                Laya.LocalStorage.setItem(ADConfig.zs_native_adunit + "game_num", "0");
                return 0;
            }
            var strNum = Laya.LocalStorage.getItem(ADConfig.zs_native_adunit + "game_num");
            var numVal = strNum == null || strNum == "" ? 0 : Number(strNum);
            return numVal;
        }
    }
    ADConfig.zs_share_title = "";//: string;                     //分享标题
    ADConfig.zs_share_image = "";//: string;                     //分享图片地址
    ADConfig.zs_switch = false;//: boolean;                      //误触总开关(1-开 0-关)
    ADConfig.zs_version = "1.0.0";//: string;                    //版本号（区分提审环境-无误触、正式环境-有误触）
    ADConfig.zs_video_adunit = "";//: string;                    //视频广告ID
    ADConfig.zs_banner_adunit = "";//: string;                   //广点通bannerID
    ADConfig.zs_native_adunit = "";//: string                    //native广告ID
    ADConfig.zs_full_screen_adunit = "";//: string;              //插屏广告ID
    ADConfig.zs_full_screen_ad_enable = false;//: boolean;       //插屏广告开启状态
    ADConfig.zs_banner_text_time = 0;//: number;                 //广点通文字延时移动时间（单位：毫秒）
    ADConfig.zs_banner_move_time = 500;//: number;               //广点通文字上移缓动时间（单位：毫秒）
    ADConfig.zs_banner_banner_time = 0;//: number;               //广点通banner延时显示时间（单位：毫秒）
    ADConfig.zs_banner_refresh_time = 0;//: number;              //广点通banner广告刷新时长间隔（单位：毫秒）
    ADConfig.zs_banner_vertical_enable = false;//: boolean;      //广点通文字上移开关（0关，1开）
    ADConfig.zs_banner_horizontal_enable = false;//: boolean;    //广点通文字左右移动开关（0关，1开）
    ADConfig.zs_native_click_switch = false;//: boolean;         //原生广告误触开关（1开 0关）
    ADConfig.zs_native_newer_times = 1;//: number;               //新玩家第几次结束显示原生广告
    ADConfig.zs_jump_switch = false;//: boolean;                 //导出位置开关（1开 0关）
    ADConfig.zs_full_screen_jump = 1;//: number;                 //全屏导出位开关（1开 0关）
    ADConfig.zs_revive_type = 0;//: number;                      //游戏复活方式（0不复活，1狂点复活，2视频复活，3分享复活，4普通复活）
    ADConfig.zs_revive_click_num = 0;//: number;                 //游戏狂点复活次数（-1不限制，0使用视频复活，N次后使用视频复活）
    ADConfig.zs_revive_video_num = 0;//: number;                 //游戏视频复活次数（-1不限制，0使用分享复活，N次后使用分享复活，没视频了使用分享复活）
    ADConfig.zs_revive_share_num = 0;//: number;                 //游戏分享复活次数（-1不限制，0使用普通复活，N次后使用普通复活）
    ADConfig.zs_revive_style = 0;//: number;                     //复活页样式（0跳过在下，1跳过在上）
    ADConfig.zs_continue_auto_share = false;//: boolean;
    ADConfig.zs_native_adunit_icon = "";//: string;              //首页结算页原生广告
    ADConfig.zs_native_adunit_game = "";//: string;              //倒计时原生广告
    ADConfig.zs_native_adunit_finish = "";                      //结算界面原生广告id
    ADConfig.zs_native_timeout = 2000;                          //原生广告加载时间，如果超过该时间没有加载出来，则直接关闭该广告页面
    ADConfig.zs_native_limit_10 = false;                        //是否屏蔽10秒显示广告 true需要间隔10秒 false不需要显示间隔10秒 
    ADConfig.zs_ad_report_status = {};                        //是否上报广告点击 【id:boolean】 true 显示广告
    ADConfig.zs_desktop_icon = false;                           //是否有桌面图标 true有，false没有 
    ADConfig.zs_native_btn_text = "";                           //原生广告按钮文字
    ADConfig.zs_native_limit = true;                            //返回首页是否显示原生广告
    ADConfig.zs_native_end_before_num = -1;                     //结束界面之前的原生广告次数 -1不限制，0不展示，[1,3,5,7,9]为第几次
    ADConfig.isBeforeGameOver = false;
    ADConfig.zs_onemin_show_ad_switch = false;                  //开局是否延时1分钟展示广告开关
    ADConfig.zs_jump_time = 0;                                  //按钮延迟时间
    ADConfig.zs_show_banner_time = 0;                           //开局X秒不展示banner
    ADConfig.zs_gamePortalAd_id = "";                           //首页九宫格导出id
    ADConfig.zs_gameBannerAd_id = "";
    ADConfig.zs_native_touch_switch = false                     //原生广告的关闭按钮缩小实际可点击范围
    ADConfig.zs_start_exposure_num = 0;
    ADConfig.zs_game_time = 150;
    ADConfig.zs_gameover_button_switch = false;
    ADConfig.zs_item_time = 10;                                  //每局获得变身机会弹窗出现时间(秒）
    ADConfig.zs_lucky_box_num = 5;                               //点击首页彩蛋触发彩蛋时间（次数）

    Laya.ILaya.regClass(ADConfig);
    Laya.ClassUtils.regClass("zs.laya.platform.ADConfig", ADConfig);
    Laya.ClassUtils.regClass("Zhise.ADConfig", ADConfig);

    /**-------------------------------------以下是导出相关内容-------------------------------------*/
    class AdList extends Laya.Script {

        constructor() {
            super();

            this.adType = null;
            this.autoScroll = false;
            this.scrollDir = AdList.SCROLL_NONE;

            this.dragSleep = 5000;
            this.scrollSpeed = 5000;

            this.passedTime = 0;
            this.inAutoScroll = false;

            this.adData = [];
            this.iosFilterAppIds = [];

            this.list = null;
            this.hotIds = [];

            this.maxNum = null;
            this.isDataUpdate = false;

            this.touchIndex = -1;

            this.isRandomSelect = false;
        }

        requestAdData(adType, autoScroll, scrollDir, iosFilterAppIds, maxNum, randomSelect) {
            this.adType = adType;
            this.autoScroll = autoScroll;
            this.scrollDir = scrollDir;
            this.iosFilterAppIds = iosFilterAppIds || [];
            this.maxNum = maxNum;
            this.isRandomSelect = randomSelect;

            if (this.scrollDir == AdList.SCROLL_VERTICAL) {
                this.list.vScrollBarSkin = "";
            }
            else if (this.scrollDir == AdList.SCROLL_HORIZONTAL) {
                this.list.hScrollBarSkin = "";
            }
            var self = this;
            zs.laya.sdk.ZSReportSdk.loadAd(function (data) {
                if (self.list) {
                    self.adData = data[self.adType.toString()];
                    self.initHotIds();
                    self.freshAdList();
                }
            });
        }

        freshAdList() {
            var self = this;
            this.adData = this.adData.filter(function (elment) {
                return Laya.Browser.onAndroid || self.iosFilterAppIds.indexOf(elment.appid) == -1;
            })
            if (this.maxNum != null) {
                if (this.adData.length < this.maxNum) {
                    while (this.adData.length < this.maxNum) {
                        this.adData.push(this.adData[Math.floor(Math.random() * this.adData.length)]);
                    }
                } else if (this.adData.length > this.maxNum) {
                    while (this.adData.length > this.maxNum) {
                        this.adData.splice(Math.floor(Math.random() * this.adData.length), 1);
                    }
                }
            }
            this.list.array = this.adData;
            if (this.autoScroll) {
                Laya.stage.frameOnce(1, this, this.startAutoScrollAd);
            }
        }

        initHotIds() {
            var hotNum = Math.random() < 0.5 ? 3 : 4;
            var interval = Math.floor(this.adData.length / hotNum);
            for (var index = 0; index < hotNum; index++) {
                this.hotIds.push(Math.floor(interval * Math.random()) + index * interval);
            }
        }

        startAutoScrollAd() {
            if (!this.list) {
                return;
            }
            this.inAutoScroll = true;
            var repeatX = (this.list.repeatX ? this.list.repeatX : 1);
            var repeatY = (this.list.repeatY ? this.list.repeatY : 1);
            if (this.scrollDir == AdList.SCROLL_VERTICAL) {
                var num = repeatX * repeatY;
                var temp = this.list.array.length % repeatX == 0 ? 0 : repeatX;
                var endPos = this.list.array.length - Math.floor(this.list.array.length / num) * num + temp;
                // var endPos = this.list.array.length - (this.list.array.length % repeatX) - repeatX;
                this.autoScrollAd(0, endPos, endPos * this.scrollSpeed);
            } else if (this.scrollDir == AdList.SCROLL_HORIZONTAL) {
                var endPos = Math.ceil(this.list.array.length / repeatY) - repeatX;
                this.autoScrollAd(0, endPos, endPos * this.scrollSpeed);
            }
        }

        autoScrollAd(start, end, duaration) {
            this.list.tweenTo(end, duaration, Laya.Handler.create(this, this.autoScrollAd, [end, start, duaration]));
        }

        onItemRender(item, index) {
            var data = this.list.array[index];
            if (!data) {
                item.visible = false;
                return;
            }
            var icon = item.getChildByName("icon");
            if (icon) {
                icon.loadImage(data.app_icon, null);
            } else {
                var iconBox = item.getChildByName("iconBox");
                if (iconBox) {
                    var icon = iconBox.getChildByName("icon");
                    if (icon) {
                        icon.skin = data.app_icon;
                    }
                }
            }
            var name = item.getChildByName("name");
            if (name) {
                name.text = data.app_title;
            }
            var desc = item.getChildByName("desc");
            if (desc) {
                desc.text = data.app_desc;
            }
            if (this.isDataUpdate == true) {
                return
            }
            var titleBg = item.getChildByName("titleBg");
            if (titleBg) {
                titleBg.index = Math.floor(titleBg.clipY * Math.random());
            }
            var tag = item.getChildByName("tag");
            if (tag) {
                if (this.hotIds.indexOf(index) > 0) {
                    tag.visible = true;
                    tag.index = Math.floor(tag.clipY * Math.random());
                }
                else {
                    tag.visible = false;
                }
            }
            else {
                var hotTag = item.getChildByName("hot");
                var newTag = item.getChildByName("new");
                hotTag && (hotTag.visible = false);
                newTag && (newTag.visible = false);
                if (this.hotIds.indexOf(index) > 0) {
                    if (hotTag && newTag) {
                        if (Math.random() < 0.5) {
                            hotTag.visible = true;
                        }
                        else {
                            newTag.visible = true;
                        }
                    }
                    else if (hotTag && !newTag) {
                        hotTag.visible = true;
                    }
                    else if (newTag && !hotTag) {
                        newTag.visible = true;
                    }
                }
            }
        }

        onTouchEnd(e) {
            if (this.isRandomSelect && this.touchIndex == -1) {
                this.touchIndex = Math.floor(Math.random() * this.list.array.length);
                console.log("RandomSelect:" + this.touchIndex + " data list length:" + this.list.array.length);
            }
            this.onSelectAd(this.touchIndex);
            console.log("onTouchEnd:" + this.touchIndex);
            this.touchIndex = -1;
        }

        onMouseAd(e, index) {
            if (e.type == Laya.Event.MOUSE_DOWN) {
                this.touchIndex = index;
            }
            console.log(e.type, this.touchIndex);
        }

        onSelectAd(index) {
            if (index == -1) {
                return;
            }
            if (!this.list) {
                return;
            }
            if (!this.list.array) {
                return;
            }
            var data = this.list.array[index];
            var self = this;
            self.isDataUpdate = true;
            zs.laya.sdk.ZSReportSdk.navigate2Mini(data, PlatformMgr.user_id,
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_SUCCESS);
                },
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_FAILED);
                },
                function () {
                    self.list.selectedIndex = -1;
                    Laya.stage.event(AdList.EVENT_NAVIGATE_COMPLETED);
                });
        }

        params2String(args) {
            var params = args[0] + "=" + args[1];
            for (var index = 2; index < args.length; index += 2) {
                params += "&" + args[index] + "=" + args[index + 1];
            }
            return params;
        }

        onDragStateChanged(newState) {
            this.inAutoScroll = false;
            if (this.autoScroll && newState == 0) {
                this.passedTime = 0;
            }
        }

        onAwake() {
            this.list = this.owner;
            this.list.selectEnable = true;
            this.list.renderHandler = Laya.Handler.create(this, this.onItemRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.onMouseAd, null, false);
        }

        onEnable() {
            this.owner.on(Laya.Event.MOUSE_UP, this, this.onTouchEnd);

            this.list.on(Laya.Event.MOUSE_UP, this, this.onDragStateChanged, [0]);
            this.list.on(Laya.Event.MOUSE_OUT, this, this.onDragStateChanged, [0]);
            this.list.on(Laya.Event.MOUSE_DOWN, this, this.onDragStateChanged, [1]);
        }

        onDisable() {
            this.owner.off(Laya.Event.MOUSE_UP, this, this.onTouchEnd);

            this.list.off(Laya.Event.MOUSE_UP, this, this.onDragStateChanged);
            this.list.off(Laya.Event.MOUSE_OUT, this, this.onDragStateChanged);
            this.list.off(Laya.Event.MOUSE_DOWN, this, this.onDragStateChanged);
        }

        onUpdate() {
            if (this.list.array && this.list.array.length > 0 && this.autoScroll && this.inAutoScroll == false) {
                this.passedTime += Laya.timer.delta;
                if (this.passedTime > this.dragSleep) {
                    this.startAutoScrollAd();
                }
            }
        }
    }
    AdList.EVENT_NAVIGATE_SUCCESS = "NAVIGATE_SUCCESS";
    AdList.EVENT_NAVIGATE_FAILED = "NAVIGATE_FAILED";
    AdList.EVENT_NAVIGATE_COMPLETED = "NAVIGATE_COMPLETED";
    AdList.SCROLL_NONE = 0;
    AdList.SCROLL_VERTICAL = 1;
    AdList.SCROLL_HORIZONTAL = 2;
    Laya.ILaya.regClass(AdList);
    Laya.ClassUtils.regClass("zs.laya.platform.AdList", AdList);
    Laya.ClassUtils.regClass("Zhise.AdList", AdList);

    class AdList2 extends AdList {
        constructor() {
            super();
        }

        onItemRender(item, index) {
            var data = this.list.array[index];
            if (!data) {
                item.visible = false;
                return;
            }

            if (this.isDataUpdate == true) {
                return;
            }

            var icon = item.getChildByName("icon");
            if (icon) {
                if (index != 6) {
                    icon.visible = true;
                    icon.loadImage(data.app_icon, null);
                }
                else {
                    icon.visible = false;
                }
            }
            var name = item.getChildByName("name");
            if (name) {
                name.text = index != 6 ? data.app_title : "";
            }
            var desc = item.getChildByName("desc");
            if (desc) {
                desc.text = index != 6 ? data.app_desc : "";
            }

            var arrow = item.getChildByName("arrow");
            if (arrow) {
                arrow.visible = index == 6;
                if (index == 6) {
                    arrow.visible = true;
                    arrow.index = data.arrowIdx ? data.arrowIdx : 0;
                }
                else {
                    arrow.visible = false;
                }
            }
        }

        onSelectAd(index) {
            if (index == -1) {
                return;
            }
            var data = this.list.array[index];
            if (index == 6) {
                if (data.arrowIdx == null || data.arrowIdx == 0) {
                    data.arrowIdx = 1;
                    this.owner.event(AdList2.EVENT_AD_SWITCH_SHOW);
                }
                else {
                    data.arrowIdx = 0;
                    this.owner.event(AdList2.EVENT_AD_SWITCH_HIDE);
                }
                this.list.selectedIndex = -1;
                return;
            }
            var self = this;
            self.isDataUpdate = true;
            zs.laya.sdk.ZSReportSdk.navigate2Mini(data, PlatformMgr.user_id,
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_SUCCESS);
                },
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_FAILED);
                },
                function () {
                    self.list.selectedIndex = -1;
                    Laya.stage.event(AdList.EVENT_NAVIGATE_COMPLETED);
                });
        }
    }
    AdList2.EVENT_AD_SWITCH_SHOW = "EVENT_AD_SWITCH_SHOW";
    AdList2.EVENT_AD_SWITCH_HIDE = "EVENT_AD_SWITCH_HIDE";
    Laya.ILaya.regClass(AdList2);
    Laya.ClassUtils.regClass("zs.laya.platform.AdList2", AdList2);
    Laya.ClassUtils.regClass("Zhise.AdList2", AdList2);

    class ExportGameCtrl extends Laya.Script {

        constructor() {
            super();
            this.args = null;
            this.adView = null;
            this.monitorOtherPageOpen = false;
            this.visibleArr = null;
        }

        onEnable() {
            if (this.adView == null) {
                Laya.stage.on(PlatformMgr.AD_CONFIIG_LOADED, this, this.onStart);
            }
        }

        onDisable() {
            if (this.adView == null) {
                Laya.stage.off(PlatformMgr.AD_CONFIIG_LOADED, this, this.onStart);
            }

            if (this.monitorOtherPageOpen) {
                Laya.stage.off(PlatformMgr.UI_VIEW_OPENED, this, this.onViewOpened);
                Laya.stage.off(PlatformMgr.UI_VIEW_CLOSED, this, this.onViewClosed);
            }
        }

        onDestroy() {
            if (this.adView == null) {
                return;
            }
            for (var index = 0; index < this.adView.length; index++) {
                if (this.adView[index] != null) {
                    this.adView[index].destroy();
                }
            }
            this.adView = null;
        }

        onStart() {
            if (this.adView) {
                return;
            }
            if (ADConfig.zs_jump_switch == false || ADConfig.isPublicVersion() == false) {
                return;
            }

            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            this.args = PlatformMgr.platformCfg.exportGameCfg[viewName];
            if (!this.args) {
                return;
            }

            this.monitorOtherPageOpen = false;
            for (var index = 0; index < this.args.length; index++) {
                var element = this.args[index];
                if (element.checkKey == null || ADConfig[element.checkKey]) {
                    this.monitorOtherPageOpen = this.monitorOtherPageOpen || element.isHide;
                }
            }
            if (this.monitorOtherPageOpen) {
                Laya.stage.on(PlatformMgr.UI_VIEW_OPENED, this, this.onViewOpened);
                Laya.stage.on(PlatformMgr.UI_VIEW_CLOSED, this, this.onViewClosed);
            }

            this.adView = [];
            for (var index = 0; index < this.args.length; index++) {
                var element = this.args[index];
                if (element.readonly) {
                    this.adView.push(null);
                }
                else if (element.checkKey == null || ADConfig[element.checkKey]) {
                    Laya.loader.create(element.viewUrl, Laya.Handler.create(this, this.onPrefabReady), null, Laya.Loader.PREFAB);
                    break;
                }
                else {
                    this.adView.push(null);
                }
            }
        }

        onPrefabReady(prefab) {
            if (this.destroyed) {
                return;
            }
            var params = this.args[this.adView.length];
            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));

            if (!this.owner.getChildByName(params.parentRoot)) {
                console.log(viewName + " page parentRoot " + params.parentRoot + " is null");
                return;
            }

            var scriptType = this.getViewScript(params.scriptType);
            if (scriptType == null) {
                console.log(viewName + " page" + params.viewUrl + " scriptType is null");
                return;
            }
            var view = prefab.create();
            this.owner.getChildByName(params.parentRoot).addChild(view);
            view.pos(params.x, params.y);
            // view.visible = this.owner.visible;
            var script = view.getComponent(scriptType);
            if (script == null) {
                script = view.addComponent(scriptType);
            }
            if (params.adType) {
                script.initView(params);
            }

            this.adView.push(view);
            if (this.adView.length < this.args.length) {
                var next = this.args[this.adView.length];
                if (next.readonly) {
                    this.adView.push(null);
                } else if (next.checkKey == null || ADConfig[next.checkKey]) {
                    Laya.loader.create(next.viewUrl, Laya.Handler.create(this, this.onPrefabReady), null, Laya.Loader.PREFAB);
                } else {
                    this.adView.push(null);
                }
            }
        }

        getViewScript(type) {
            switch (type) {
                case "ExportScrollH":
                    return ExportScrollH;
                    break;
                case "ExportScrollV":
                    return ExportScrollV;
                    break;
                case "ExportScrollNone":
                    return ExportScrollNone;
                    break;
                case "ShakeExportBox":
                    return ShakeExportBox;
                    break;
                case "InviteBtn":
                    return InviteBtn;
                    break;
                case "FakeExitBtn":
                    return FakeExitBtn;
                    break;
                case "FloatExportBtn":
                    return FloatExportBtn;
                    break;
                case "ScreenExportBtn":
                    return ScreenExportBtn;
                    break;
                case "ExportLeftPop":
                    return ExportLeftPop;
                    break;
                case "ExportRightPop":
                    return ExportRightPop;
                    break;
                case "ExportLeftFlyBox":
                    return ExportLeftFlyBox;
                    break;
                case "MoreGameBtn":
                    return MoreGameBtn;
                    break;
            }
        }

        onViewOpened(viewName) {
            if (viewName && this.adView) {
                this.visibleArr = [];
                for (var index = 0; index < this.adView.length; index++) {
                    if (this.adView[index] != null && this.args[index].isHide) {
                        this.visibleArr[index] = this.adView[index].visible;
                        this.adView[index].visible = false;
                    }
                }
            }
        }

        onViewClosed(viewName) {
            if (viewName && this.adView) {
                if (!this.visibleArr) {
                    return;
                }
                for (var index = 0; index < this.adView.length; index++) {
                    if (this.adView[index] != null && this.args[index].isHide) {
                        if (this.visibleArr[index]) {
                            this.adView[index].visible = this.visibleArr[index];
                        }
                    }
                }
            }
        }
    }
    Laya.ILaya.regClass(ExportGameCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportGameCtrl", ExportGameCtrl);
    Laya.ClassUtils.regClass("Zhise.ExportGameCtrl", ExportGameCtrl);

    class ExportScrollH extends Laya.Script {
        constructor() {
            super();
            this.adList = null;
        }

        initView(data) {
            this.adList = this.owner.getChildByName("adList").addComponent(AdList);
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(data.adType, true, AdList.SCROLL_HORIZONTAL, appConfig.iosFilterAppIds);
        }
    }
    Laya.ILaya.regClass(ExportScrollH);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportScrollH", ExportScrollH);
    Laya.ClassUtils.regClass("Zhise.ExportScrollH", ExportScrollH);

    class ExportScrollV extends Laya.Script {
        constructor() {
            super();
            this.adList = null;
        }

        initView(data) {
            this.adList = this.owner.getChildByName("adList").addComponent(AdList);
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(data.adType, true, AdList.SCROLL_VERTICAL, appConfig.iosFilterAppIds);
        }
    }
    Laya.ILaya.regClass(ExportScrollV);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportScrollV", ExportScrollV);
    Laya.ClassUtils.regClass("Zhise.ExportScrollV", ExportScrollV);

    class ExportScrollNone extends Laya.Script {
        constructor() {
            super();
            this.adList = null;// AdList;
        }

        initView(data) {
            this.adList = this.owner.getChildByName("adList").addComponent(AdList);
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(data.adType, false, AdList.SCROLL_NONE, appConfig.iosFilterAppIds, 3);
        }
    }
    Laya.ILaya.regClass(ExportScrollNone);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportScrollNone", ExportScrollNone);
    Laya.ClassUtils.regClass("Zhise.ExportScrollNone", ExportScrollNone);

    class ShakeExportIcon extends Laya.Script {

        constructor() {
            super();
            this.list = null;
            this.delayAnimTime = 1000;
            this.animIntervalTime = 1500;
            this.animDuaration = 500;
            this.adIdx = 0;
            this.rotOffset = 10;
            this.loopTime = 8;
            this.currentAdData = null;
            this.adDataArr = null;
            this.subAnimDuaration = 0;
        }

        initAd(adArr) {
            this.adDataArr = adArr;
            this.adIdx %= adArr.length;
            this.onItemRender(adArr[this.adIdx]);
            this.owner.timerLoop(this.delayAnimTime + this.animIntervalTime, this, this.freshAdItems);
        }

        freshAdItems() {
            this.adIdx += 4;
            this.adIdx %= this.adDataArr.length;
            this.onItemRender(this.adDataArr[this.adIdx]);
            this.playShakeAnim(0);
        }

        playShakeAnim(idx) {
            if (idx / 4 >= this.loopTime) {
                return;
            }
            var uiComp = this.owner;
            switch (idx % 4) {
                case 0:
                    Laya.Tween.to(uiComp, { rotation: this.rotOffset }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
                case 1:
                    Laya.Tween.to(uiComp, { rotation: 0 }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
                case 2:
                    Laya.Tween.to(uiComp, { rotation: -this.rotOffset }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
                case 3:
                    Laya.Tween.to(uiComp, { rotation: 0 }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
            }
        }

        onItemRender(adData) {
            if (adData == null) {
                if (this.currentAdData == null) {
                    this.owner.visible = false;
                }
                return;
            }
            this.currentAdData = adData;
            this.owner.visible = true;
            var item = this.owner;

            var icon = item.getChildByName("icon");
            if (icon) {
                icon.loadImage(adData.app_icon, null);
            }
            var name = item.getChildByName("name");
            if (name) {
                name.text = adData.app_title;
            }
            var desc = item.getChildByName("desc");
            if (desc) {
                desc.text = adData.app_desc;
            }
        }

        onClick() {
            if (this.currentAdData == null) {
                return;
            }
            zs.laya.sdk.ZSReportSdk.navigate2Mini(this.currentAdData, PlatformMgr.user_id,
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_SUCCESS);
                },
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_FAILED);
                },
                function () {
                });
        }

        onStart() {
            this.subAnimDuaration = this.animDuaration / (4 * this.loopTime);
        }
    }
    Laya.ILaya.regClass(ShakeExportIcon);
    Laya.ClassUtils.regClass("zs.laya.platform.ShakeExportIcon", ShakeExportIcon);
    Laya.ClassUtils.regClass("Zhise.ShakeExportIcon", ShakeExportIcon);

    class ShakeExportBox extends Laya.Script {
        constructor() {
            super();
            this.adType = 0;
            this.iconScriptArr = [];
        }

        initView(data) {
            this.adType = data.adType;
            for (var index = 0; index < this.owner.numChildren; index++) {
                var element = this.owner.getChildAt(index);
                var zsGameIcon = element.addComponent(ShakeExportIcon);
                zsGameIcon.adIdx = index;
                this.iconScriptArr.push(zsGameIcon);
            }
            this.requestAdData();
        }

        requestAdData() {
            var self = this;
            zs.laya.sdk.ZSReportSdk.loadAd(function (data) {
                var adData = data[self.adType.toString()];
                adData = adData.filter(function (elment) {
                    return Laya.Browser.onAndroid || (elment.appid != "wx48820730357d81a6" && elment.appid != "wxc136d75bfc63107c");
                })

                for (var index = 0; index < self.iconScriptArr.length; index++) {
                    var zsGameIcon = self.iconScriptArr[index];
                    zsGameIcon.initAd(adData);
                }
            });
        }
    }
    Laya.ILaya.regClass(ShakeExportBox);
    Laya.ClassUtils.regClass("zs.laya.platform.ShakeExportBox", ShakeExportBox);
    Laya.ClassUtils.regClass("Zhise.ShakeExportBox", ShakeExportBox);


    class FakeExitBtn extends Laya.Script {
        constructor() {
            super();
        }

        onAwake() {
            this.owner.mouseEnabled = true;
            this.owner.visible = ADConfig.zs_jump_switch && ADConfig.isPublicVersion();// && ADConfig.zs_history_list_jump;
        }

        onClick() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.mouseEnabled = false;
            PlatformMgr.showListAd();
            this.owner.mouseEnabled = true;
        }
    }
    Laya.ILaya.regClass(FakeExitBtn);
    Laya.ClassUtils.regClass("zs.laya.platform.FakeExitBtn", FakeExitBtn);
    Laya.ClassUtils.regClass("Zhise.FakeExitBtn", FakeExitBtn);

    class FloatExportBtn extends Laya.Script {
        constructor() {
            super();
        }

        onAwake() {
            this.owner.mouseEnabled = true;
            this.owner.visible = ADConfig.zs_jump_switch && ADConfig.isPublicVersion();
        }

        onClick() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.mouseEnabled = false;
            PlatformMgr.showHomeFloatAd();
            this.owner.mouseEnabled = true;
        }
    }
    Laya.ILaya.regClass(FloatExportBtn);
    Laya.ClassUtils.regClass("zs.laya.platform.FloatExportBtn", FloatExportBtn);
    Laya.ClassUtils.regClass("Zhise.FloatExportBtn", FloatExportBtn);

    class ScreenExportBtn extends Laya.Script {
        constructor() {
            super();
        }

        onAwake() {
            this.owner.mouseEnabled = true;
            this.owner.visible = ADConfig.zs_jump_switch && ADConfig.isPublicVersion();
        }

        onClick() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.mouseEnabled = false;
            PlatformMgr.showScreenAd();
            this.owner.mouseEnabled = true;
        }
    }
    Laya.ILaya.regClass(ScreenExportBtn);
    Laya.ClassUtils.regClass("zs.laya.platform.ScreenExportBtn", ScreenExportBtn);
    Laya.ClassUtils.regClass("Zhise.ScreenExportBtn", ScreenExportBtn);

    /**邀请或者分享按钮 */
    class InviteBtn extends Laya.Script {
        constructor() {
            super();
        }

        onClick() {
            console.log("openInvite");
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
        }
    }
    Laya.ILaya.regClass(InviteBtn);
    Laya.ClassUtils.regClass("zs.laya.platform.InviteBtn", InviteBtn);
    Laya.ClassUtils.regClass("Zhise.InviteBtn", InviteBtn);
    class MoreGameBtn extends Laya.Script {
        constructor() {
            super();
        }

        onClick() {
            console.log("openMoreGame");
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            PlatformMgr.showScreenAd();
        }
    }
    Laya.ILaya.regClass(MoreGameBtn);
    Laya.ClassUtils.regClass("zs.laya.platform.MoreGameBtn", MoreGameBtn);
    Laya.ClassUtils.regClass("Zhise.MoreGameBtn", MoreGameBtn);
    class ExportLeftPop extends Laya.Script {
        constructor() {
            super();
            this.srcX = 0;
            this.adList = null;// AdList;
            this.adCheckBox = null;// Laya.Image;
        }

        initView(data) {
            this.srcX = this.owner.x;
            this.adList = this.owner.getChildByName("adList").addComponent(AdList);
            this.adCheckBox = this.owner.getChildByName("adCheckBox");
            this.adCheckBox.on(Laya.Event.CLICK, this, this.updateFloatPos);
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(data.adType, true, AdList.SCROLL_NONE, appConfig.iosFilterAppIds);
        }

        onDestroy() {
            this.adCheckBox.off(Laya.Event.CLICK, this, this.updateFloatPos);
        }

        updateFloatPos() {
            zs.laya.sdk.SdkService.hideUserInfoButton();
            this.adCheckBox.mouseEnabled = false;
            if (this.adCheckBox.selected) {
                Laya.Tween.to(this.owner, { x: 0 }, 500, null, Laya.Handler.create(this, this.onTweenCompleted));
            }
            else {
                Laya.Tween.to(this.owner, { x: this.srcX }, 500, null, Laya.Handler.create(this, this.onTweenCompleted));
            }
        }

        onTweenCompleted() {
            this.adCheckBox.mouseEnabled = true;
            if (this.adCheckBox.selected == false) {
                zs.laya.sdk.SdkService.showUserInfoButton();
            }
        }
    }
    Laya.ILaya.regClass(ExportLeftPop);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportLeftPop", ExportLeftPop);
    Laya.ClassUtils.regClass("Zhise.ExportLeftPop", ExportLeftPop);

    class ExportRightPop extends Laya.Script {
        constructor() {
            super();
            this.srcX = 0;
            this.adList = null;// AdList;
            this.adCheckBox = null;// Laya.Image;
        }

        initView(data) {
            this.srcX = this.owner.x;
            this.adList = this.owner.getChildByName("adList").addComponent(AdList);
            this.adCheckBox = this.owner.getChildByName("adCheckBox");
            this.adCheckBox.on(Laya.Event.CLICK, this, this.updateFloatPos);
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(data.adType, true, AdList.SCROLL_VERTICAL, appConfig.iosFilterAppIds, null, false, true);
            if (ADConfig.zs_switch) { this.adCheckBox.selected = true; this.updateFloatPos(); }
        }

        onDestroy() {
            this.adCheckBox.off(Laya.Event.CLICK, this, this.updateFloatPos);
        }

        updateFloatPos() {
            zs.laya.sdk.SdkService.hideUserInfoButton();
            this.adCheckBox.mouseEnabled = false;
            if (this.adCheckBox.selected) {
                Laya.Tween.to(this.owner, { x: Laya.stage.width - this.owner.width - this.owner.parent.x }, 500, null, Laya.Handler.create(this, this.onTweenCompleted));
            }
            else {
                Laya.Tween.to(this.owner, { x: Laya.stage.width - 136 - this.owner.parent.x }, 500, null, Laya.Handler.create(this, this.onTweenCompleted));
            }
        }

        onTweenCompleted() {
            this.adCheckBox.mouseEnabled = true;
            if (this.adCheckBox.selected == false) {
                zs.laya.sdk.SdkService.showUserInfoButton();
            }
        }
    }
    Laya.ILaya.regClass(ExportRightPop);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportRightPop", ExportRightPop);
    Laya.ClassUtils.regClass("Zhise.ExportRightPop", ExportRightPop);


    class ExportLeftFlyBox extends Laya.Script {
        constructor() {
            super();
            this.isClick = false;
            this.adData = [];
            this.unData = [];
        }

        initView(params) {
            if (!ADConfig.zs_jump_switch || !ADConfig.isPublicVersion()) {
                this.owner.visible = false;
                return;
            }
            for (var i = 0; i < 6; i++) {
                var box = this.owner.getChildByName("ad_" + i);
                if (box) {
                    //播放动画
                    Laya.Tween.from(box, { rotation: 360, x: box.x - 500 }, 700, null, Laya.Handler.create(this, function () {
                        this.isClick = true;
                    }));
                }
            }
            var adType = params.adType.toString();
            var self = this;
            zs.laya.sdk.ZSReportSdk.loadAd(function (data) {
                self.adData = data[adType];
                self.freshAdBox();
            });
        }

        freshAdBox() {
            var appConfig = PlatformMgr.platformCfg;
            this.adData = this.adData.filter(function (elment) {
                return Laya.Browser.onAndroid || appConfig.iosFilterAppIds.indexOf(elment.appid) == -1;
            })
            //随机选取6个数据
            if (this.adData.length < 6) {
                while (this.adData.length < 6) {
                    this.adData.push(this.adData[Math.floor(Math.random() * this.adData.length)]);
                }
            }
            else if (this.adData.length > 6) {
                while (this.adData.length > 6) {
                    var data = this.adData.splice(Math.floor(Math.random() * this.adData.length), 1);
                    this.unData.push(data[0]);
                }
            }
            for (var i = 0; i < 6; i++) {
                var box = this.owner.getChildByName("ad_" + i);
                if (box) {
                    var icon = box.getChildByName("icon");
                    if (icon) {
                        icon.loadImage(this.adData[i].app_icon, null);
                    }
                    box.on(Laya.Event.CLICK, this, this.onBoxClick, [i]);
                }
            }
        }

        onBoxClick(i) {
            if (!this.isClick) return;
            zs.laya.sdk.ZSReportSdk.navigate2Mini(this.adData[i], PlatformMgr.user_id,
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_SUCCESS);
                },
                function () {
                    Laya.stage.event(AdList.EVENT_NAVIGATE_FAILED);
                },
                function () {

                });
            //更换该位置的数据
            if (this.unData.length > 0) {
                var data = this.unData.splice(Math.floor(Math.random() * this.unData.length), 1);
                this.unData.push((this.adData.splice(i, 1, data[0]))[0]);
                var box = this.owner.getChildByName("ad_" + i);
                if (box) {
                    var icon = box.getChildByName("icon");
                    if (icon) {
                        icon.loadImage(this.adData[i].app_icon, null);
                    }
                }
            }
        }
    }
    Laya.ILaya.regClass(ExportLeftFlyBox);
    Laya.ClassUtils.regClass("zs.laya.platform.ExportLeftFlyBox", ExportLeftFlyBox);
    Laya.ClassUtils.regClass("Zhise.ExportLeftFlyBox", ExportLeftFlyBox);


    class HomeFloatAdView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.adList = null;
            this.closeBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            var adListUI;
            if (topUI) {
                adListUI = topUI.getChildByName("adList");
                this.closeBtn = topUI.getChildByName("closeBtn");
            }
            var middleUI = this.owner.getChildByName("middleUI");
            if (middleUI) {
                adListUI = adListUI || middleUI.getChildByName("adList");
                this.closeBtn = this.closeBtn || middleUI.getChildByName("closeBtn");
            }
            var bottomUI = this.owner.getChildByName("bottomUI");
            if (bottomUI) {
                this.closeBtn = this.closeBtn || bottomUI.getChildByName("closeBtn");
            }
            this.adList = adListUI.addComponent(AdList);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);
        }

        onDestroy() {
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
        }

        onStart() {
            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            var args = PlatformMgr.platformCfg.exportGameCfg[viewName];
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(args ? args[0].adType : "promotion", false, AdList.SCROLL_NONE, appConfig.iosFilterAppIds, 9);
        }

        closeView() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.close();
        }
    }

    Laya.ILaya.regClass(HomeFloatAdView);
    Laya.ClassUtils.regClass("zs.laya.platform.HomeFloatAdView", HomeFloatAdView);
    Laya.ClassUtils.regClass("Zhise.HomeFloatAdView", HomeFloatAdView);

    class FullScreeAdView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.getRewardBg = null;
            this.getRewardLabel = null;
            this.continueBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            this.getRewardBg = topUI.getChildByName("getRewardImg");
            this.getRewardLabel = this.getRewardBg.getChildByName("getRewardLabel");
            this.continueBtn = topUI.getChildByName("continueBtn");
            this.continueBtn.on(Laya.Event.CLICK, this, this.closeView);
        }

        onDestroy() {
            this.continueBtn.off(Laya.Event.CLICK, this, this.closeView);
        }

        initView(data) {
            if (data && data.gold) {
                this.getRewardBg.visible = true;
                this.getRewardLabel.text = data.gold + "";
            } else {
                this.getRewardBg.visible = false;
            }
        }

        closeView() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.close();
        }
    }
    Laya.ILaya.regClass(FullScreeAdView);
    Laya.ClassUtils.regClass("zs.laya.platform.FullScreeAdView", FullScreeAdView);
    Laya.ClassUtils.regClass("Zhise.FullScreeAdView", FullScreeAdView);

    class ListAdView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.adList = null;
            this.closeBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            this.adList = topUI.getChildByName("adList").addComponent(AdList);
            this.closeBtn = topUI.getChildByName("topFrame").getChildByName("closeBtn");
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);

            var bottomUI = this.owner.getChildByName("bottomUI");
            var bottomImg = bottomUI.getChildByName("bottomImg");
            if (bottomImg) {
                var backHomeBtn = bottomImg.getChildByName("backHomeBtn");
                backHomeBtn && backHomeBtn.on(Laya.Event.CLICK, this, this.closeView);

                var continueBtn = bottomImg.getChildByName("continueBtn");
                continueBtn && continueBtn.on(Laya.Event.CLICK, this, this.closeView);
            }
        }

        onDestroy() {
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
        }

        onStart() {
            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            var args = PlatformMgr.platformCfg.exportGameCfg[viewName];
            var appConfig = PlatformMgr.platformCfg;
            this.adList.requestAdData(args ? args[0].adType : "promotion", false, AdList.SCROLL_VERTICAL, appConfig.iosFilterAppIds, null, true);
        }

        closeView() {
            Laya.SoundManager.playSound(PlatformMgr.soundClick);
            this.owner.close();
        }
    }
    Laya.ILaya.regClass(ListAdView);
    Laya.ClassUtils.regClass("zs.laya.platform.ListAdView", ListAdView);
    Laya.ClassUtils.regClass("Zhise.ListAdView", ListAdView);



    class KnockEggView extends zs.laya.base.ZhiSeView {
        constructor() { super(); }

        onAwake() {
            super.onAwake();
            this.initData();

            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            var args = PlatformMgr.platformCfg.exportGameCfg[viewName];
            var adType = args ? args[0].adType : "promotion";
            var appConfig = PlatformMgr.platformCfg;

            var bottomUI = this.owner.getChildByName("bottomUI");
            if (bottomUI) {
                this.btn_repair = bottomUI.getChildByName("eggBtn");
            }

            var middleUI = this.owner.getChildByName("middleUI");

            var eggUI = this.eggUI = middleUI.getChildByName("eggUI");

            if (eggUI) {

                if (!this.btn_repair) {
                    this.btn_repair = eggUI.getChildByName("eggBtn");
                }
                this.progressBar = eggUI.getChildByName("loading_1");
                this.progressWidth = this.progressBar.bitmap.width;
                this.progressHeight = this.progressBar.bitmap.height;
            }

            this.bannerMoveType = 0;
            this.initCfg();


            //事件监听
            Laya.stage.on(PlatformMgr.APP_HIDE, this, this.onAppHide);
            Laya.stage.on(PlatformMgr.APP_SHOW, this, this.onAppShow);

            if (this.btn_repair) {
                this.btn_repair.on(Laya.Event.MOUSE_DOWN, this, this.onTouchStart);
                this.btn_repair.on(Laya.Event.MOUSE_UP, this, this.clickHammer);
            }

            this.hammerAni = this.owner["knockAni"];
        }

        initCfg() {
            this.knockEggCfg = Laya.loader.getRes("config/KnockEggCfg.json");
            this.awardDelay = 1000;
            this.closeDelay = 1000;

            if (this.knockEggCfg) {
                if (MathUtils.IsNumber(this.knockEggCfg.awardDelay)) {
                    this.awardDelay = Number(this.knockEggCfg.awardDelay);
                }

                if (MathUtils.IsNumber(this.knockEggCfg.closeDelay)) {
                    this.closeDelay = Number(this.knockEggCfg.closeDelay);
                }
            }
        }

        isShowAward() {
            return this.knockEggCfg && this.knockEggCfg.isShowAward;
        }

        onTouchStart(e) {
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
        }

        initData() {
            this.btn_repair = null;
            this.progressBar = null;
            this.hammerAni = null;
            this.egg = null;
            this.touchNode = null;

            //修车进度
            this.repairProgress = 0;

            //每次点击增加的百分比
            this.click_add_percent = 0.14;

            //是否已经打开广告
            this.isOpenAd = false;

            //修车显示广告 随机区间
            this.repair_click_num = [0.3, 0.7];

            /**显示Banner区间 */
            this.showBannerRange = 1;

            this.isGetAward = false;

            this.callback = null;
        }

        onEnable() {
            super.onEnable();
            // WxBannerAd.Instance.hide();
            this.initBannerGroup();
            this.initRepair();
        }

        onDisable() {
            super.onDisable();
        }

        onDestroy() {
            this.removeEvent();
            super.onDestroy();
        }

        removeEvent() {
            Laya.timer.clear(this, this.cutBack);
            Laya.stage.off(PlatformMgr.APP_HIDE, this, this.onAppHide);
            Laya.stage.off(PlatformMgr.APP_SHOW, this, this.onAppShow);
            if (this.btn_repair) {
                this.btn_repair.off(Laya.Event.MOUSE_DOWN, this, this.onTouchStart);
                this.btn_repair.off(Laya.Event.MOUSE_UP, this, this.clickHammer);
            }
        }

        onAppHide() {
            if (!this.isOpenAd) return;

            if (this.btn_repair) {
                this.btn_repair.off(Laya.Event.MOUSE_DOWN, this, this.onTouchStart);
                this.btn_repair.off(Laya.Event.MOUSE_UP, this, this.clickHammer);
            }

            this.isOpenAd = true;
            Laya.timer.clear(this, this.resetIsOpenAd);
            Laya.timer.clear(this, this.cutBack);

            var open_award_num = Laya.LocalStorage.getItem("open_award_num") || 0;
            Laya.LocalStorage.setItem("open_award_num", Number(open_award_num) + 1);

            if (this.isShowAward()) {

            } else {
                this.onFinish();
            }
        }

        initBannerGroup() {
            var bannerCfg = PlatformMgr.platformCfg.bannerCfg;
            if (bannerCfg) {
                this.viewName = this.owner.url;
                this.viewName = this.viewName.substring(this.viewName.lastIndexOf('/') + 1, this.viewName.lastIndexOf('.'));
                var data = bannerCfg[this.viewName];
                if (data) {
                    var showData = data.showData;
                    if (showData) {
                        if (showData.sign || showData.sign == 0 || showData.sign == false) {
                            this.bannerGroup = zs.laya.banner.WxBannerMgr.Instance.getBannerGroup(showData.sign);
                            this.bannerGroup && this.bannerGroup.hide();
                        }
                        var moveType = showData.moveType;
                        if (moveType == 1) {
                            this.bannerMoveType = moveType;
                        }
                    } else {
                        console.error("==============initBannerGroup===============", data.showData);
                    }
                }
            }
        }

        onAppShow() {
            if (!this.isOpenAd) return;
            this.bannerGroup && this.bannerGroup.hide();
            if (this.isShowAward()) {
                this.onFinish();
            }
        }

        //初始化修车
        initRepair() {

            this.isGetAward = false;
            ADConfig.openEggTimes = MathUtils.IsNumber(ADConfig.openEggTimes) ? Number(ADConfig.openEggTimes) + 1 : 1;
            Laya.timer.loop(20, this, this.cutBack);
            if (ADConfig.zs_click_award_percent.indexOf("[") >= 0) {
                this.repair_click_num = JSON.parse(ADConfig.zs_click_award_percent);
            } else {
                this.repair_click_num = ADConfig.zs_click_award_percent.split(",");
            }


            this.click_add_percent = ADConfig.zs_click_award_add;

            this.zs_click_award_back = ADConfig.zs_click_award_back;

            this.click_add_percent = MathUtils.random(this.click_add_percent * 0.9 * 100, this.click_add_percent * 1.1 * 100) * 0.01;

            console.log("===============repair_click_num=====================", this.repair_click_num);

            this.showBannerRange = MathUtils.random(Number(this.repair_click_num[0]) * 100, Number(this.repair_click_num[1]) * 100) * 0.01;
        }

        setCloseCallback(callback) {
            this.callback = callback;
        }

        //修车处理方法
        clickHammer() {
            if (this.repairProgress + this.click_add_percent <= 1) {

                this.updateRepairPorgress(this.repairProgress + this.click_add_percent);

                this.hammerAni && this.hammerAni.play(0, false);

                // console.log("this.showBannerRange", this.click_add_percent, this.showBannerRange, this.repair_click_num);
                if (this.repairProgress >= this.showBannerRange && !this.isOpenAd) {

                    this.isOpenAd = true;

                    switch (this.bannerMoveType) {
                        case 1:
                            this.bannerGroup && this.bannerGroup.updateY(this.lastMouseY);
                            break;
                        default:
                            this.bannerGroup && this.bannerGroup.updateBottonTouch();
                            break;
                    }

                    this.bannerGroup && this.bannerGroup.show();
                    Laya.timer.once(800, this, this.resetIsOpenAd);

                    Laya.timer.once(800, this, function () {
                        this.initBannerGroup();
                        this.bannerGroup && this.bannerGroup.hide();

                    });
                }
            } else {
                this.updateRepairPorgress(this.repairProgress + this.click_add_percent);

                this.bannerGroup && this.bannerGroup.hide();

                Laya.timer.clear(this, this.cutBack);

                Laya.timer.clear(this, this.resetIsOpenAd);

                this.onFinish();
            }
        }

        resetIsOpenAd() {
            this.isOpenAd = false;
        }

        onFinish() {
            if (this.isGetAward) return;

            this.isGetAward = true;

            Laya.timer.once(this.awardDelay, this, function () {
                Laya.stage.event(PlatformMgr.EGG_GET_AWARD);
            });
            Laya.timer.once(Math.max(this.closeDelay, this.awardDelay + 40), this, this.onClose);
        }

        onClose() {
            console.log("====================关闭金蛋==================");
            this.callback && this.callback();
            this.bannerGroup && this.bannerGroup.hide();
            this.owner.close();
        }

        //更新修车进度
        updateRepairPorgress(val) {
            this.repairProgress = Math.min(1, Math.max(0, val));
            if (this.progressWidth < this.progressHeight) {
                this.progressBar && (this.progressBar.height = this.progressBar.clipHeight = Math.max(1, this.progressHeight * this.repairProgress));
            } else {
                this.progressBar && (this.progressBar.width = Math.max(1, this.progressWidth * this.repairProgress));
            }
        }

        //修车进度回退
        cutBack() {
            this.repairProgress -= this.zs_click_award_back;
            this.updateRepairPorgress(this.repairProgress);
        }
    }
    Laya.ILaya.regClass(KnockEggView);
    Laya.ClassUtils.regClass("zs.laya.platform.KnockEggView", KnockEggView);
    Laya.ClassUtils.regClass("Zhise.KnockEggView", KnockEggView);

    /**-------------------------------------以下是平台的原生广告-------------------------------------*/
    class NativeAdsCtrl extends Laya.Script {
        constructor() {
            super();
            this.args = null;
            this.adView = null;
        }

        onDestroy() {
            if (this.adView == null) {
                return;
            }
            for (var index = 0; index < this.adView.length; index++) {
                if (this.adView[index] != null) {
                    this.adView[index].destroy();
                }
            }
            this.adView = null;
        }

        onStart() {
            if (this.adView) {
                return;
            }
            if (zs.laya.sdk.ZSReportSdk.Instance && zs.laya.sdk.ZSReportSdk.Instance.isFromLink() && zs.laya.sdk.ZSReportSdk.Instance.isExportValid() == false) {
                return;
            }
            if (ADConfig.isPublicVersion() == false) {
                return;
            }

            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            this.args = PlatformMgr.platformCfg.nativeAdCfg[viewName];
            if (!this.args) {
                return;
            }

            this.adView = [];
            for (var index = 0; index < this.args.length; index++) {
                var element = this.args[index];
                if (element.readonly) {
                    this.adView.push(null);
                } else if (element.checkKey == null || ADConfig[element.checkKey]) {
                    Laya.loader.create(element.viewUrl, Laya.Handler.create(this, this.onPrefabReady), null, Laya.Loader.PREFAB);
                    break;
                }
                else {
                    this.adView.push(null);
                }
            }
        }

        onPrefabReady(prefab) {
            if (this.destroyed) {
                return;
            }

            var params = this.args[this.adView.length];
            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));

            var parent = this.findChildByPath(params.parentRoot);
            if (!parent) {
                console.log(viewName + " page parentRoot " + params.parentRoot + " is null");
                return;
            }

            var scriptType = this.getViewScript(params.scriptType);
            if (scriptType == null) {
                console.log(viewName + " page" + params.viewUrl + " scriptType is null");
                return;
            }
            if (params.scriptType == "NativeAdView" && PlatformMgr.isInOneMin) {
                console.log("一分钟之内不能展示原生广告");
                return;
            }
            var view = prefab.create();
            parent.addChild(view);
            view.pos(params.x, params.y);

            var script = view.getComponent(scriptType);
            if (script == null) {
                script = view.addComponent(scriptType);
            }

            this.adView.push(view);
            if (this.adView.length < this.args.length) {
                var element = this.args[this.adView.length];
                if (element.readonly) {
                    this.adView.push(null);
                } else if (element.checkKey == null || ADConfig[element.checkKey]) {
                    Laya.loader.create(element.viewUrl, Laya.Handler.create(this, this.onPrefabReady), null, Laya.Loader.PREFAB);
                } else {
                    this.adView.push(null);
                }
            }
        }

        getViewScript(type) {
            switch (type) {
                case "NativeAdIcon":
                    return NativeAdIcon;
                    break;
                case "NativeAdImage":
                    return NativeAdImage;
                    break;
                case "NativeAddDesktopIcon":
                    return NativeAddDesktopIcon;
                    break;
                case "NativeAdView":
                    return NativeAdView;
                case "NativeMoreGame":
                    return NativeMoreGame
                    break;
            }
        }

        findChildByPath(path) {
            var nodes = path.split("/");
            var child = this.owner;
            for (var i = 0; i < nodes.length; i++) {
                child = child.getChildByName(nodes[i]);
            }
            return child;
        }
    }
    Laya.ILaya.regClass(NativeAdsCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeAdsCtrl", NativeAdsCtrl);
    Laya.ClassUtils.regClass("Zhise.NativeAdsCtrl", NativeAdsCtrl);

    class NativeMoreGame extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            this.owner.visible = false;
            let qg = window["qg"];
            if (qg) {
                this.owner.visible = qg.getSystemInfoSync().platformVersionCode >= 1076;
            }
        }
        onClick() {
            zs.laya.sdk.SdkService.showGamePortalAd(Laya.Handler.create(this, () => {
                zs.laya.sdk.SdkService.showToast("暂无更多资源")
            }))
        }
    }
    Laya.ILaya.regClass(NativeAdsCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeMoreGame", NativeMoreGame);
    Laya.ClassUtils.regClass("Zhise.NativeMoreGame", NativeMoreGame);

    class NativeAdView extends Laya.Script {
        constructor() {
            super();
            this.adImage = null;
            this.closeBtn = null;
            this.closeBtnBg = null;
            this.adView = null;
            this.adDesc = null;
            this.closed = false;
            this.confirmBtn = null;
            this.confirmBtnDesc = null;
            this.adId = null;
            this.adUnit = null;
        }

        onAwake() {
            super.onAwake();
            this.adView = this.owner;
            this.adImage = this.adView.getChildByName("adImg");
            this.adDesc = this.adView.getChildByName("adDesc");
            this.closeBtn = this.adView.getChildByName("closeBtn");
            this.closeBtnBg = this.adView.getChildByName("closeBtnBg");
            this.confirmBtn = this.adView.getChildByName("confirmBtn");
            this.confirmBtnDesc = this.adView.getChildByName("confirmBtnDesc");
            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.on(Laya.Event.CLICK, this, this.openAdAndCloseView);
        }

        onEnable() {
            super.onEnable();
            this.closeBtnBg.visible = this.closeBtn.visible = false;
            this.adView.visible = false;
            if (ADConfig.isBeforeGameAccount()) {
                this.adUnit = ADConfig.zs_native_adunit;
                zs.laya.sdk.SdkService.initNativeAd(this.adUnit, Laya.Handler.create(this, this.onAdError));
                zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
            }
        }

        onDestroy() {
            this.adImage.off(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.off(Laya.Event.CLICK, this, this.openAdAndCloseView);
        }


        onShowCloseBtn() {
            this.closeBtnBg.visible = this.closeBtn.visible = true;
        }

        onStart() {

        }

        onAdError(err) {
            if (this.closed == false) {
                this.closed = true;
                this.closeView();
            }
        }

        onAdLoaded(data) {
            if (ADConfig.isBeforeGameOver) {
                ADConfig.updateReviveTypeInfo(ADConfig.zs_native_adunit + "game_num");
            }

            var adData = data.adList[0];
            var url = adData.imgUrlList[0];

            this.adId = adData.adId;
            Laya.loader.load(url, Laya.Handler.create(this, function (texture) {
                this.adImage.texture = texture;
                this.adDesc.text = adData.desc;
                var btnText;
                if (ADConfig.zs_native_click_switch) {
                    btnText = ADConfig.zs_native_btn_text ? ADConfig.zs_native_btn_text : adData.clickBtnTxt;
                } else {
                    btnText = "点击跳过";
                }
                this.confirmBtnDesc.text = btnText;//ADConfig.zs_native_click_switch ? adData.clickBtnTxt : "点击跳过";
            }), null, Laya.Loader.IMAGE);

            PlatformMgr.sendReqAdShowReport(this.adUnit, this.adId);
            ADConfig.zs_native_lsat_showTime = Laya.Browser.now();

            ADConfig.updateReviveTypeInfo(ADConfig.zs_native_adunit + "open_native_num");
            console.log("广告id:" + this.adUnit + " 是否显示广告：" + ADConfig.zs_ad_report_status[this.adUnit]);
            if (ADConfig.zs_ad_report_status[this.adUnit] == undefined || ADConfig.zs_ad_report_status[this.adUnit]) {
                this.adView.visible = true;
                this.closeBtnBg.visible = this.closeBtn.visible = false;
                if (ADConfig.zs_switch && ADConfig.zs_jump_time > 0) {
                    Laya.timer.once(ADConfig.zs_jump_time, this, this.onShowCloseBtn);
                } else {
                    this.closeBtnBg.visible = this.closeBtn.visible = true;
                }
                if (ADConfig.zs_native_touch_switch) {
                    this.closeBtn.width = this.closeBtn.height = 24;
                }
            }
        }

        onClickAd() {
            // console.log("------------- 原生广告点击");
            PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
            Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
        }

        closeView() {
            Laya.SoundManager.playSound(PlatformMgr.clickSound);
            this.adView.visible = false;
        }

        openAdAndCloseView() {
            if (ADConfig.zs_native_click_switch) {
                Laya.SoundManager.playSound(PlatformMgr.clickSound);
                PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
                Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
            } else {
                this.closeView();
            }
        }
    }
    Laya.ILaya.regClass(NativeAdView);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeAdView", NativeAdView);
    Laya.ClassUtils.regClass("Zhise.NativeAdView", NativeAdView);

    class NativeAdIcon extends Laya.Script {

        constructor() {
            super();
            this.adUnit = "";
            this.adId = "";
            this.adDesc = null;
            this.adImage = null;
            this.adBg = null;
        }

        onAwake() {
            this.adDesc = this.owner.getChildByName("name");
            this.adImage = this.owner.getChildByName("icon");
            this.adBg = this.owner.getChildByName("adBg");
            this.adBg && (this.adBg.visible = false);
            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
        }

        onStart() {
            this.adUnit = ADConfig.zs_native_adunit_icon;
            zs.laya.sdk.SdkService.initNativeAd(this.adUnit, Laya.Handler.create(this, this.onAdError));
            zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
        }

        onAdError(err) {
            this.owner.visible = false;
        }

        onAdLoaded(data) {
            var adData = data.adList[0];
            this.adId = adData.adId;
            this.adDesc.text = adData.title;
            this.adBg && (this.adBg.visible = true);
            this.adImage.loadImage(adData.iconUrlList[0]);

            PlatformMgr.sendReqAdShowReport(ADConfig.zs_native_adunit_icon, this.adId);
            if (ADConfig.zs_ad_report_status[this.adUnit] == undefined || ADConfig.zs_ad_report_status[this.adUnit]) {
                this.owner.visible = true;
            } else {
                this.owner.visible = false;
            }
        }

        onClickAd() {
            PlatformMgr.sendReqAdClickReport(ADConfig.zs_native_adunit_icon, this.adId);
        }
    }
    Laya.ILaya.regClass(NativeAdIcon);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeAdIcon", NativeAdIcon);
    Laya.ClassUtils.regClass("Zhise.NativeAdIcon", NativeAdIcon);

    class NativeAdImage extends Laya.Script {

        constructor() {
            super();
            this.adId = "";
            this.adDesc = null;
            this.adImage = null;
            this.adBg = null;
            this.adunit = "";
        }

        onAwake() {
            this.adDesc = this.owner.getChildByName("name");
            this.adImage = this.owner.getChildByName("adImg");
            this.adBg = this.owner.getChildByName("adBg");
            this.adBg && (this.adBg.visible = false);
            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
        }

        onStart() {
            this.adunit = ADConfig.zs_native_adunit;//zs_native_adunit_game
            zs.laya.sdk.SdkService.initNativeAd(this.adunit, Laya.Handler.create(this, this.onAdError));
            zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
        }

        onAdError(err) {
            this.owner.visible = false;
        }

        onAdLoaded(data) {
            var adData = data.adList[0];
            console.log("onAdLoaded:" + JSON.stringify(adData))
            this.adId = adData.adId;
            this.adBg && (this.adBg.visible = true);
            this.adDesc.text = adData.desc;
            this.adImage.loadImage(adData.imgUrlList[0]);

            PlatformMgr.sendReqAdShowReport(this.adunit, this.adId);
        }

        onClickAd() {
            PlatformMgr.sendReqAdClickReport(this.adunit, this.adId);
        }
    }
    Laya.ILaya.regClass(NativeAdImage);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeAdImage", NativeAdImage);
    Laya.ClassUtils.regClass("Zhise.NativeAdImage", NativeAdImage);

    class NativeAddDesktopIcon extends Laya.Script {
        constructor() {
            super();
        }

        onAwake() {
            this.owner.visible = false;
        }

        onEnable() {
            this.owner.mouseEnabled = true;
            Laya.timer.once(3000, this, this.onShowDesktopIcon);
            Laya.stage.on(zs.laya.sdk.SdkService.ADD_DESKTEP_ICON_SUCCESS, this, this.onHideDesktepIcon);
        }

        onDisable() {
            Laya.timer.clear(this, this.onShowDesktopIcon);
            Laya.stage.off(zs.laya.sdk.SdkService.ADD_DESKTEP_ICON_SUCCESS, this, this.onHideDesktepIcon);
        }

        onShowDesktopIcon() {
            this.owner.visible = ADConfig.zs_jump_switch && ADConfig.isPublicVersion() && ADConfig.zs_desktop_icon == false;
            if (this.owner.visible) {
                this.owner["desktep"].play();
            } else {
                this.owner["desktep"].stop();
            }
        }

        onHideDesktepIcon(evt, isClickDeskIcon) {
            ADConfig.zs_desktop_icon = evt.hasIcon;
            this.onShowDesktopIcon();
        }

        onClick() {
            Laya.SoundManager.playSound(PlatformMgr.clickSound);
            this.owner.mouseEnabled = false;

            zs.laya.sdk.SdkService.createDesktopIcon(
                Laya.Handler.create(this, function () {
                    Laya.stage.once(PlatformMgr.APP_SHOW, this, function () {
                        zs.laya.sdk.SdkService.hasDesktopIcon();
                    });
                })
            );
            this.owner.mouseEnabled = true;
        }
    }
    Laya.ILaya.regClass(NativeAddDesktopIcon);
    Laya.ClassUtils.regClass("zs.laya.platform.NativeAddDesktopIcon", NativeAddDesktopIcon);
    Laya.ClassUtils.regClass("Zhise.NativeAddDesktopIcon", NativeAddDesktopIcon);

    class ScreeNativeAdView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.adImage = null;
            this.closeBtn = null;
            this.adDesc = null;
            this.closed = false;
            this.confirmBtn = null;
            this.confirmBtnDesc = null;
            this.adId = null;
            this.adUnit = null;
            this.middleUI = null;
        }

        onAwake() {
            super.onAwake();
            this.middleUI = this.owner.getChildByName("middleUI");
            this.adImage = this.middleUI.getChildByName("adImg");
            this.adDesc = this.middleUI.getChildByName("adDesc");
            this.closeBtn = this.middleUI.getChildByName("closeBtn");
            this.closeBtnBg = this.middleUI.getChildByName("closeBtnBg");
            this.confirmBtn = this.middleUI.getChildByName("confirmBtn");
            this.confirmBtnDesc = this.middleUI.getChildByName("confirmBtnDesc");

            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.on(Laya.Event.CLICK, this, this.openAdAndCloseView);

        }

        onEnable() {
            super.onEnable();
            this.closeBtnBg.visible = this.closeBtn.visible = false;
            this.closed = false;
            this.middleUI.visible = false;
            if (ADConfig.isBeforeGameAccount()) {
                this.adUnit = ADConfig.zs_native_adunit;
                zs.laya.sdk.SdkService.initNativeAd(this.adUnit, Laya.Handler.create(this, this.onAdError));
                zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
            } else {
                this.closeView();
            }
        }

        onDestroy() {
            this.adImage.off(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.off(Laya.Event.CLICK, this, this.openAdAndCloseView);
        }


        onShowAdCloseBtn() {
            this.closeBtnBg.visible = this.closeBtn.visible = true;
        }

        initView(data) {
            super.initView(data);
        }

        onAdError(err) {
            this.closeView();
        }

        onAdLoaded(data) {
            if (ADConfig.isBeforeGameOver) {
                ADConfig.updateReviveTypeInfo(this.adUnit + "game_num");
            }

            var adData = data.adList[0];
            var url = adData.imgUrlList[0];

            this.adId = adData.adId;
            Laya.loader.load(url, Laya.Handler.create(this, function (texture) {
                this.adImage.texture = texture;
            }), null, Laya.Loader.IMAGE);
            this.adDesc.text = adData.desc;
            var btnText;
            if (ADConfig.zs_native_click_switch) {
                btnText = ADConfig.zs_native_btn_text ? ADConfig.zs_native_btn_text : adData.clickBtnTxt;
            } else {
                btnText = "点击跳过";
            }
            this.confirmBtnDesc.text = btnText;

            PlatformMgr.sendReqAdShowReport(this.adUnit, this.adId);
            ADConfig.zs_native_lsat_showTime = Laya.Browser.now();

            ADConfig.updateReviveTypeInfo(ADConfig.zs_native_adunit + "open_native_num");
            console.log("广告id:" + this.adUnit + " 是否显示广告：" + ADConfig.zs_ad_report_status[this.adUnit]);
            if (ADConfig.zs_ad_report_status[this.adUnit] == undefined || ADConfig.zs_ad_report_status[this.adUnit]) {
                this.middleUI.visible = true;
                this.closeBtnBg.visible = this.closeBtn.visible = false;
                console.log("原生广告按钮延迟：" + ADConfig.zs_jump_time);
                if (ADConfig.zs_switch && ADConfig.zs_native_click_switch && ADConfig.zs_jump_time > 0) {
                    Laya.timer.once(ADConfig.zs_jump_time, this, this.onShowAdCloseBtn);
                } else {
                    this.closeBtnBg.visible = this.closeBtn.visible = true;
                }
                if (ADConfig.zs_native_touch_switch) {
                    this.closeBtn.width = this.closeBtn.height = 24;
                }
            } else {
                this.closeView();
            }
        }

        onClickAd() {
            console.log("------------- 原生广告点击");
            PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
            Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
        }

        closeView() {
            // if (this.owner.parent) {
            Laya.SoundManager.playSound(PlatformMgr.clickSound);
            this.owner.close();
            Laya.timer.clear(this, this.onShowAdCloseBtn);
            Laya.stage.event(PlatformMgr.GAME_GET_AWARD, this.awardNum);
            // }
        }

        openAdAndCloseView() {
            if (ADConfig.zs_native_click_switch) {
                Laya.SoundManager.playSound(PlatformMgr.clickSound);
                PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
                Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
            } else {
                this.closeView();
            }
        }
    }
    Laya.ILaya.regClass(ScreeNativeAdView);
    Laya.ClassUtils.regClass("zs.laya.platform.ScreeNativeAdView", ScreeNativeAdView);
    Laya.ClassUtils.regClass("Zhise.ScreeNativeAdView", ScreeNativeAdView);


    class GetAwardView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.adImage = null;
            this.closeBtn = null;
            this.adView = null;
            this.adDesc = null;
            this.closed = false;
            this.confirmBtn = null;
            this.confirmBtnDesc = null;
            this.adId = null;
            this.adUnit = null;
            this.lab_num = null;
            this.btn_video_get = null;
            this.btn_get = null;
            this.awardNum = 100;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            var bottomUI = this.owner.getChildByName("bottomUI");
            this.adView = bottomUI.getChildByName("adView");
            this.adImage = this.adView.getChildByName("adImg");
            this.adDesc = this.adView.getChildByName("adDesc");
            this.closeBtn = this.adView.getChildByName("closeBtn");
            this.confirmBtn = this.adView.getChildByName("confirmBtn");
            this.confirmBtnDesc = this.adView.getChildByName("confirmBtnDesc");
            this.lab_num = bottomUI.getChildByName("lab_num");
            this.btn_video_get = bottomUI.getChildByName("btn_video_get");
            this.btn_get = bottomUI.getChildByName("btn_get");
            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.on(Laya.Event.CLICK, this, this.openAdAndCloseView);
            this.btn_get.on(Laya.Event.CLICK, this, this.onClickGet, [false]);
            this.btn_video_get.on(Laya.Event.CLICK, this, this.onClickGet, [true]);
        }

        onEnable() {
            super.onEnable();
            this.closeBtn.visible = false;
            this.adView.visible = false;
            this.lab_num.text = "+" + this.awardNum;
            if (ADConfig.isBeforeGameAccount()) {
                this.adUnit = ADConfig.zs_native_adunit;
                zs.laya.sdk.SdkService.initNativeAd(this.adUnit, Laya.Handler.create(this, this.onAdError));
                zs.laya.sdk.SdkService.loadNativeAd(Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
            }
        }

        onDestroy() {
            this.adImage.off(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.off(Laya.Event.CLICK, this, this.openAdAndCloseView);
        }


        onShowCloseBtn() {
            this.closeBtn.visible = true;
        }

        initView(data) {
            super.initView(data);
            var topUI = this.owner.getChildByName("topUI");
            var middleUI = this.owner.getChildByName("middleUI");
            var win_title = topUI.getChildByName("win_title");
            var lose_title = topUI.getChildByName("lose_title");
            var win = middleUI.getChildByName("win");
            var lose = middleUI.getChildByName("lose");
            win_title.visible = data;
            lose_title.visible = !data;
            win.visible = data;
            lose.visible = !data;
        }

        onClickGet(isPlay) {
            if (isPlay) {
                zs.laya.sdk.SdkService.playVideo(
                    Laya.Handler.create(this, function () {
                        //获得3倍奖励
                        this.awardNum *= 3;
                        this.closeView();
                    }),
                    Laya.Handler.create(this, function () {
                    }),
                    Laya.Handler.create(this, function () {
                        // zs.laya.game.UIService.showToast("暂时没有视频资源");
                    }));
            } else {
                this.closeView();
            }
        }

        onAdError(err) {
        }

        onAdLoaded(data) {
            if (ADConfig.isBeforeGameOver) {
                ADConfig.updateReviveTypeInfo(this.adUnit + "game_num");
            }

            var adData = data.adList[0];
            var url = adData.imgUrlList[0];

            this.adId = adData.adId;
            Laya.loader.load(url, Laya.Handler.create(this, function (texture) {
                this.adImage.texture = texture;
            }), null, Laya.Loader.IMAGE);
            this.adDesc.text = adData.desc;
            var btnText;
            if (ADConfig.zs_native_click_switch) {
                btnText = ADConfig.zs_native_btn_text ? ADConfig.zs_native_btn_text : adData.clickBtnTxt;
            } else {
                btnText = "点击跳过";
            }
            this.confirmBtnDesc.text = btnText;

            PlatformMgr.sendReqAdShowReport(this.adUnit, this.adId);
            ADConfig.zs_native_lsat_showTime = Laya.Browser.now();

            ADConfig.updateReviveTypeInfo(ADConfig.zs_native_adunit + "open_native_num");
            console.log("广告id:" + this.adUnit + " 是否显示广告：" + ADConfig.zs_ad_report_status[this.adUnit]);
            if (ADConfig.zs_ad_report_status[this.adUnit] == undefined || ADConfig.zs_ad_report_status[this.adUnit]) {
                this.adView.visible = true;
                this.closeBtn.visible = true;
            }
        }

        onClickAd() {
            console.log("------------- 原生广告点击");
            PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
            Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
        }

        closeView() {
            if (this.owner.parent) {
                Laya.SoundManager.playSound(PlatformMgr.clickSound);
                this.owner.close();
                Laya.timer.clear(this, this.onShowCloseBtn);
                Laya.stage.event(PlatformMgr.GAME_GET_AWARD, this.awardNum);
            }
        }

        openAdAndCloseView() {
            if (ADConfig.zs_native_click_switch) {
                Laya.SoundManager.playSound(PlatformMgr.clickSound);
                PlatformMgr.sendReqAdClickReport(this.adUnit, this.adId);
                Laya.stage.once(PlatformMgr.APP_SHOW, this, this.closeView);
            } else {
                this.closeView();
            }
        }
    }
    Laya.ILaya.regClass(GetAwardView);
    Laya.ClassUtils.regClass("zs.laya.platform.GetAwardView", GetAwardView);
    Laya.ClassUtils.regClass("Zhise.GetAwardView", GetAwardView);


    /**-------------------------------------以下是误触动画控制-------------------------------------*/
    class MistakenlyTouchCtrl extends Laya.Script {
        constructor() {
            super();
        }

        onAwake() {

            if (ADConfig.isPublicVersion() != true) {
                return;
            }

            var viewName = this.owner.url.substring(this.owner.url.lastIndexOf('/') + 1, this.owner.url.lastIndexOf('.'));
            var configs = PlatformMgr.platformCfg.mistakenlyTouchCfg[viewName];
            if (!configs) {
                return;
            }
            for (var index = 0; index < configs.length; index++) {
                const element = configs[index];
                const child = this.findChildByPath(element.path);
                if (!child) return;
                var srcX = child.x;
                var srcY = child.y;

                if (ADConfig.zs_switch) {
                    var showType = element.showType || "move";
                    if (showType == "move" && ADConfig.zs_banner_vertical_enable) {
                        child.mouseEnabled = false;
                        child.x += element.offsetX;
                        child.y += element.offsetY;
                        this.owner.timerOnce(ADConfig.zs_banner_text_time, this, this.moveBack, [srcX, srcY, ADConfig.zs_banner_move_time, child], false);
                    } else if (showType == "delay" && ADConfig.zs_button_delay_switch) {
                        child.mouseEnabled = false;
                        child.visible = false;
                        this.owner.timerOnce(ADConfig.zs_button_delay_time, this, this.showObj, [child], false);
                    } else if (showType == "delay" && ADConfig.zs_jump_time > 0) {
                        child.mouseEnabled = false;
                        child.visible = false;
                        this.owner.timerOnce(ADConfig.zs_jump_time, this, this.showObj, [child], false);
                    }
                }
            }
        }

        moveBack(srcX, srcY, duaration, obj) {
            Laya.Tween.to(obj, { x: srcX, y: srcY }, duaration, null, Laya.Handler.create(this, this.activeObj, [obj]))
        }

        activeObj(obj) {
            obj.mouseEnabled = true;
        }

        showObj(obj) {
            obj.visible = true;
            obj.mouseEnabled = true;
        }

        findChildByPath(path) {
            var nodes = path.split("/");
            var child = this.owner;
            for (var index = 0; index < nodes.length; index++) {
                if (!child) return null;
                child = child.getChildByName(nodes[index]);
            }
            return child;
        }
    }
    Laya.ILaya.regClass(MistakenlyTouchCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.MistakenlyTouchCtrl", MistakenlyTouchCtrl);
    Laya.ClassUtils.regClass("Zhise.MistakenlyTouchCtrl", MistakenlyTouchCtrl);



    class BannerCtrl extends Laya.Script {

        onEnable() {
            Laya.timer.frameOnce(1, this, this.checkBanner);
        }

        checkBanner() {
            this.viewName = this.owner.url;
            this.viewName = this.viewName.substring(this.viewName.lastIndexOf('/') + 1, this.viewName.lastIndexOf('.'));
            var bannerCfg = PlatformMgr.platformCfg.bannerCfg;
            if (bannerCfg) {
                var data = bannerCfg[this.viewName];
                if (!data) {
                    return;
                }
                if (data.autoShow) {
                    if (data.isDelay) {
                        Laya.timer.once(ADConfig.zs_banner_banner_time, this, this.showBanner);
                    } else {
                        this.showBanner();
                    }
                } else if (data.lockHide) {
                    zs.laya.sdk.SdkService.hideBanner();
                }
                if (data.gameBanner && ADConfig.isPublicVersion()) {
                    zs.laya.sdk.SdkService.showGameBannerAd();
                }
            }
        }

        showBanner() {
            zs.laya.sdk.SdkService.showBanner();
        }
    }
    Laya.ILaya.regClass(BannerCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.BannerCtrl", BannerCtrl);
    Laya.ClassUtils.regClass("Zhise.BannerCtrl", BannerCtrl);

    class CustomAdCtrl extends Laya.Script {
        constructor() {
            super();
        }

        onDestroy() {
            Laya.stage.off(PlatformMgr.UI_VIEW_OPENED, this, this.hideNative);
            zs.laya.sdk.SdkService.hideCustomAd();
        }

        onEnable() {
            this.viewName = this.owner.url;
            this.viewName = this.viewName.substring(this.viewName.lastIndexOf('/') + 1, this.viewName.lastIndexOf('.'));
            var nativeCfg = PlatformMgr.platformCfg.customCfg[this.viewName];
            if (!nativeCfg) return;
            for (let i = 0; i < nativeCfg.length; i++) {
                if (nativeCfg[i].checkKey && !ADConfig[nativeCfg[i].checkKey]) continue;
                zs.laya.sdk.SdkService.checkCustomAd(nativeCfg[i].left, nativeCfg[i].right, nativeCfg[i].top, nativeCfg[i].bottom, nativeCfg[i].id, nativeCfg[i].direct, nativeCfg[i].num, nativeCfg[i].scale, nativeCfg[i].centerX, nativeCfg[i].centerY);
            }
            Laya.stage.off(PlatformMgr.UI_VIEW_OPENED, this, this.hideNative);
            Laya.timer.once(1, this, function () {
                Laya.stage.on(PlatformMgr.UI_VIEW_OPENED, this, this.hideNative);
            })
        }

        hideNative() {
            zs.laya.sdk.SdkService.hideCustomAd();
        }
    }
    Laya.ILaya.regClass(CustomAdCtrl);
    Laya.ClassUtils.regClass("zs.laya.platform.CustomAdCtrl", CustomAdCtrl);
    Laya.ClassUtils.regClass("Zhise.CustomAdCtrl", CustomAdCtrl);

    exports.PlatformMgr = PlatformMgr;
    exports.MathUtils = MathUtils;
    exports.ADConfig = ADConfig;
    exports.ExportGameCtrl = ExportGameCtrl;
    exports.NativeAdsCtrl = NativeAdsCtrl;
    exports.MistakenlyTouchCtrl = MistakenlyTouchCtrl;
    exports.BannerCtrl = BannerCtrl;
    exports.NativeAdView = NativeAdView;

}(window.zs.laya.platform = window.zs.laya.platform || {}, Laya));