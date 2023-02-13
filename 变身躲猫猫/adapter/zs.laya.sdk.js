window.zs = window.zs || {};
window.zs.laya = window.zs.laya || {};
(function (exports, Laya) {
    'use strict';
     /***平台提供的接口**/
    class SdkService{

        constructor() {
            this._instance = null;
        }

        static initSDK() {
            this._instance = window["zsSdk"];
            if (this._instance) {
                this._instance.init();
            }
        }

        static destroySDK() {
            this._instance = null;
        }

        static login(successHandler, failedHandler) {
            if (this._instance && this._instance.login) {
                this._instance.login(successHandler, failedHandler);
            }
            else if (failedHandler) {
                failedHandler.runWith({code:1,desc:"web login"});
            }
        }

        static loadSubpackage(pkgName, progressHandler, successHandler, failedHandler) {
            if (this._instance && this._instance.loadSubpackage) {
                return this._instance.loadSubpackage(pkgName, progressHandler, successHandler, failedHandler);
            }
            else {
                successHandler && successHandler.run(1);
                return false;
            }
        }

        static initVideoAd(adUnitId) {
            if (this._instance) {
                if (this._instance.initVideoAD) {
                    this._instance.initVideoAD(adUnitId);
                }
            }
        }

        static checkCustomAd(){

        }

        static hideCustomAd(){
            
        }

        static playVideo(completedHandler, interuptHandler, errorHandler) {
            if (this._instance && this._instance.playVideo) {
                Laya.stage.event(SdkService.EVENT_AD_VIDEO_PLAY);
                this._instance.playVideo(
                    Laya.Handler.create(null, function () { Laya.stage.event(SdkService.EVENT_AD_VIDEO_CLOSED); completedHandler && completedHandler.run() }, null, false),
                    Laya.Handler.create(null, function () { Laya.stage.event(SdkService.EVENT_AD_VIDEO_CLOSED); interuptHandler && interuptHandler.run() }, null, false),
                    Laya.Handler.create(null, function (error) { Laya.stage.event(SdkService.EVENT_AD_VIDEO_CLOSED); errorHandler && errorHandler.runWith(error) }, null, false)
                );
            }
            else if (completedHandler) {
                completedHandler.run();
            }
        }

        static isVideoEnable(successHandler,failHandler) {
            if (this._instance && this._instance.isVideoEnable) {
                return this._instance.isVideoEnable(successHandler,failHandler);
            }
            return false;
        }

        static getSetting(successHandler){
            if (this._instance && this._instance.getSetting != null) {
                this._instance.getSetting(successHandler);
            }
            else if (successHandler) {
                successHandler.runWith(null);
            }
        }

        static createUserInfoButton(rectInPercent, successHandler) {
            if (this._instance && this._instance.createUserInfoButton) {
                this._instance.createUserInfoButton(rectInPercent, successHandler);
            }
            else if (successHandler) {
                successHandler.runWith(null);
            }
        }

        static hideUserInfoButton() {
            if (this._instance && this._instance.hideUserInfoButton) {
                this._instance.hideUserInfoButton();
            }
        }

        static showUserInfoButton() {
            if (this._instance && this._instance.showUserInfoButton) {
                this._instance.showUserInfoButton();
            }
        }

        static destroyUserInfoButton() {
            if (this._instance && this._instance.destroyUserInfoButton) {
                this._instance.destroyUserInfoButton();
            }
        }

        static openShare(text, imgUrl) {
            if (this._instance && this.instance.openShare) {
                this._instance.openShare(text, imgUrl);
            }
            else {
                console.log("share:" + text + ",img:" + imgUrl);
            }
        }

        static initInsertAd(adUnitId, errorHandler) {
            if (this._instance && this._instance.initInsertAd) {
                if (this._instance.initInsertAd) {
                    this._instance.initInsertAd(adUnitId, errorHandler);
                }
                else if (this._instance.initFullScreenAD) {
                    this._instance.initFullScreenAD(adUnitId, errorHandler);
                }
            }
        }

        static loadInsertAd(loadedHandler, errorHandler) {
            if (this._instance && this._instance.loadInsertAd) {
                if (this._instance.loadInsertAd) {
                    this._instance.loadInsertAd(loadedHandler, errorHandler);
                }
                else if (this._instance.loadFullScreenAD) {
                    this._instance.loadFullScreenAD(loadedHandler, errorHandler);
                }
            }
            else if (errorHandler) {
                errorHandler.runWith("null");
            }
        }

        static showInsertAd(closeHandler) {
            if (this._instance && this._instance.showInsertAd) {
                if (this._instance.showInsertAd) {
                    this._instance.showInsertAd(closeHandler);
                }
                else if (this._instance.loadFullScreenAD) {
                    this._instance.showFullScreenAD(closeHandler);
                }
            }
            else {
                if (closeHandler) {
                    closeHandler.runWith("not in wx");
                }
                console.log("showFullScreenAD:" + Date.now());
            }
        }

        static setUserCloudStorage(kvDataList, onSuccess, onFailed, onCompleted) {
            if (this._instance && this._instance.setUserCloudStorage) {
                return this._instance.setUserCloudStorage(kvDataList, onSuccess, onFailed, onCompleted);
            }
            else if (onSuccess) {
                onSuccess.runWith(null);
            }
        }

        static initBannerAd(adUnitId, errorHandler) {
            if (this._instance && this._instance.initBannerAd) {
                if (this._instance.initBannerAD) {
                    this._instance.initBannerAD(adUnitId, errorHandler);
                }
            }
        }

        static showBanner(errorHandler) {
            console.log("showBanner:" + Date.now());
            if (this._instance && this._instance.showBanner) {
                this._instance.showBanner(errorHandler);
            }
        }

        static hideBanner() {
            if (this._instance && this._instance.hideBanner) {
                this._instance.hideBanner();
            }
        }

        static initNativeAd(adUnitId, errorHandler) {
            if (this._instance && this._instance.initNativeAd) {
                this._instance.initNativeAd(adUnitId, errorHandler);
            }
            else {
                if (errorHandler) {
                    errorHandler.runWith("not define");
                }
                console.log("initNativeAd:" + Date.now());
            }
        }

        static loadNativeAd(successHandler, errorHandler) {
            if (this._instance && this._instance.loadNativeAd) {
                this._instance.loadNativeAd(successHandler, errorHandler);
            }
            else {
                if (errorHandler) {
                    errorHandler.runWith("error");
                }
                console.log("loadNativeAd:" + Date.now());
            }
        }

        static reportNativeAdShow(adId) {
            if (this._instance && this._instance.reportNativeAdShow) {
                this._instance.reportNativeAdShow(adId);
                console.log("reportNativeAdShow:" + adId);
            }
        }

        static reportNativeAdClick(adId) {
            if (this._instance && this._instance.reportNativeAdClick) {
                this._instance.reportNativeAdClick(adId);
                console.log("reportNativeAdClick:" + adId);
            }
        }

        static hasDesktopIcon(){
            if (this._instance && this._instance.hasDesktopIcon) {
                this._instance.hasDesktopIcon(
                    Laya.Handler.create(this,function(retData){
                        if(retData){
                            // console.log("--------------是否已经有桌面图标："+ retData.hasIcon);
                            Laya.stage.event(SdkService.ADD_DESKTEP_ICON_SUCCESS,[retData, SdkService.isClickDeskIcon]);
                            SdkService.isClickDeskIcon = false;
                        }
                    })
                );
            }else{
                Laya.stage.event(SdkService.ADD_DESKTEP_ICON_SUCCESS,[{"hasIcon":false}, SdkService.isClickDeskIcon]);//true
            }
        }

        static createDesktopIcon(success){
            if (this._instance && this._instance.createDesktopIcon){
                SdkService.isClickDeskIcon = true;
                this._instance.createDesktopIcon(success);
            }
        }

        static reportMonitor(name, value){
            if (this._instance && this._instance.reportMonitor){
                this._instance.reportMonitor(name, value);
            }
        }

        static recordClip(beforeTime, laterTime) {
            if (this.sdkService) {
                this.sdkService.recordClip(beforeTime, laterTime);
            }
        }

        static initGamePortalAd(adUnitId) {
            if (this._instance && this._instance.initGamePortalAd) {
                this._instance.initGamePortalAd(adUnitId);
            }
        }

        static showGamePortalAd(errorHandler) {
            if (this._instance && this._instance.showGamePortalAd) {
                this._instance.showGamePortalAd(errorHandler);
            } else {
                if (errorHandler) errorHandler.run();
            }
        }


        static initGameBannerAd(adUnitId) {
            if (this._instance && this._instance.initGameBannerAd) {
                this._instance.initGameBannerAd(adUnitId);
            }
        }

        static showGameBannerAd(errorHandler) {
            if (this._instance && this._instance.showGameBannerAd) {
                this._instance.showGameBannerAd(errorHandler);
            } else {
                if (errorHandler) errorHandler.run();
            }
        }

        static hideGameBannerAd() {
            if (this._instance && this._instance.hideGameBannerAd) {
                this._instance.hideGameBannerAd();
            }
        }

        static showToast(msg){
            if (this._instance && this._instance.showToast) {
                this._instance.showToast(msg);
            }
        }
    }

    SdkService._instance = null;
    SdkService.EVENT_AD_VIDEO_PLAY = "EVENT_AD_VIDEO_PLAY";
    SdkService.EVENT_AD_VIDEO_CLOSED = "EVENT_AD_VIDEO_CLOSED";
    SdkService.ADD_DESKTEP_ICON_SUCCESS = "ADD_DESKTEP_ICON_SUCCESS";
    SdkService.isClickDeskIcon  = false;
    Laya.ILaya.regClass(SdkService);
    Laya.ClassUtils.regClass("zs.laya.sdk.SdkService", SdkService);
    Laya.ClassUtils.regClass("Zhise.SdkService", SdkService);


    class DeviceService{
        constructor() {
            
        }

        static initDevice() {
            DeviceService.device = window["zsDevice"];
            if (DeviceService.device) {
                DeviceService.device.init();
                DeviceService.device.onShow(Laya.Handler.create(null, function (res) { Laya.stage.event(DeviceService.EVENT_ON_SHOW, res) }, null, false));
                DeviceService.device.onHide(Laya.Handler.create(null, function () { Laya.stage.event(DeviceService.EVENT_ON_HIDE) }, null, false));
            }
        }

        static statusBarHeight() {
            if (this.device) {
                return this.device.statusBarHeight();
            }
            else {
                return 0;
            }
        }

        static screenWidth() {
            if (this.device) {
                return this.device.screenWidth();
            }
            else {
                return Laya.stage.width;
            }
        }

        static screenHeight() {
            if (this.device) {
                return this.device.screenHeight();
            }
            else {
                return Laya.stage.height;
            }
        }

        static VibrateShort() {
            if (this.device) {
                this.device.vibrateShort();
            }
            else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate(500);
            }
            else {
                console.log("vibrateShort");
            }
        }

        static VibrateLong() {
            if (this.device) {
                this.device.vibrateLong();
            }
            else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate(1000);
            }
            else {
                console.log("VibrateLong");
            }
        }

        static IsNetValid() {
            if (this.device) {
                return this.device.isNetValid();
            }
            return navigator.onLine;
        }
    }
    DeviceService.device = null;
    DeviceService.EVENT_ON_RESUME = "DEVICE_ON_RESUME";
    DeviceService.EVENT_ON_HIDE = "DEVICE_ON_HIDE";
    DeviceService.EVENT_ON_SHOW = "DEVICE_ON_SHOW";
    Laya.ILaya.regClass(DeviceService);
    Laya.ClassUtils.regClass("zs.laya.sdk.DeviceService", DeviceService);
    Laya.ClassUtils.regClass("Zhise.DeviceService", DeviceService);


    /**指色上报数据接口 具体实现在zs.laya.平台名.ad.js */
    class ZSReportSdk {

        constructor() {
        }

        static loadConfig(success, failed) {
            this.Instance.loadConfig(success, failed);
        }

        static init(user_id, platform_id) {
            this.Instance.init(user_id, platform_id);
        }
        
        static sendVideoLog() {
            this.Instance.sendVideoLog();
        }

        static loadAd(callback) {
            this.Instance.loadAd(callback);
        }
    
        static navigate2Mini(adData, uniqueId, success, failed, completed) {
            this.Instance.navigate2Mini(adData, uniqueId, success, failed, completed);
        }

        static requestNativeAdReport(data,success){
            this.Instance.requestNativeAdReport(data,success);
        }

        static get Instance() {
            if (!this.initialized) {
                this.initialized = true;
                if (zs.reportSdk) {
                    this.instance = zs.reportSdk;
                }else {
                    this.instance = {
                        loadConfig: function (success, failed) {
                            if (failed) failed();
                            console.log("zs.sdk is undefined");
                        },
                        init: function(user_id, platform_id) {
                            console.log("zs.sdk.init");
                            console.log("zs.sdk is undefined");
                        },
                        sendVideoLog: function() {
                            console.log("zs.sdk.sendVideoLog");
                            console.log("zs.sdk is undefined");
                        },                
                        loadAd: function (callback) {
                            if (callback) callback({
                                promotion: [],
                                indexLeft: [],
                                endPage: [],
                                backAd: []
                            });
                            console.log("zs.sdk is undefined");
                        },
                        navigate2Mini: function (adData, uniqueId, success, failed, completed) {
                            if (failed) failed();
                            if (completed) completed();
                            console.log("zs.sdk is undefined");
                        },
                        requestNativeAdReport:function(reportData,success){
                            console.log("zs.sdk is undefined");
                            if(success) success();
                        }
                    };
                }
            }
            return this.instance;
        }
    }
    ZSReportSdk.instance = null;
    ZSReportSdk.initialized = false;
    Laya.ClassUtils.regClass("zs.laya.sdk.ZSReportSdk", ZSReportSdk);
    
    exports.SdkService = SdkService;
    exports.DeviceService = DeviceService;
    exports.ZSReportSdk = ZSReportSdk;

}(window.zs.laya.sdk = window.zs.laya.sdk || {}, Laya));