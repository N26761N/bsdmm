window.zs = window.zs || {};
window.zs.laya = window.zs.laya || {};
(function (exports, Laya) {
    'use strict';
    class EventId {
        constructor() {
        }
    }
    EventId.NET_XHR_RESPONSE = zs.laya.XHRUtils.NET_XHR_RESPONSE;
    EventId.APP_SHOW = zs.laya.sdk.DeviceService.EVENT_ON_SHOW;
    EventId.APP_HIDE = zs.laya.sdk.DeviceService.EVENT_ON_HIDE;
    EventId.APP_JUMP_CANCEL = "NAVIGATE_FAILED"; //zs.laya.platform.AdList.EVENT_NAVIGATE_FAILED; 跳转失败
    EventId.APP_JUMP_SUCCESS = "NAVIGATE_SUCCESS";//zs.laya.platform.AdList.EVENT_NAVIGATE_SUCCESS; 跳转成功
    EventId.AD_CONFIIG_LOADED = "AD_CONFIIG_LOADED";
    EventId.UI_TOAST_MESSAGE = "UI_TOAST_MESSAGE";
    EventId.UI_PROGRESS_UPDATE = zs.laya.ui.LoadingBar.EVENT_UI_PROGRESS_UPDATE;

    EventId.UI_VIEW_CLOSED = zs.laya.base.BaseView.EVENT_UI_VIEW_CLOSED;
    EventId.UI_VIEW_OPENED = zs.laya.base.BaseView.EVENT_UI_VIEW_OPENED;

    EventId.AD_VIDEO_PLAY = "EVENT_AD_VIDEO_PLAY";//SdkService.EVENT_AD_VIDEO_PLAY;
    EventId.AD_VIDEO_CLOSED = "EVENT_AD_VIDEO_CLOSED";//SdkService.EVENT_AD_VIDEO_CLOSED;

    EventId.LAUNCH_COMPLETED = "EVENT_LAUNCH_COMPLETED";
    EventId.DATA_SETTING_UPDATE = "DATA_SETTING_UPDATE";
    EventId.DATA_LOGIN_INFO_UPDATE = "DATA_LOGIN_INFO_UPDATE";
    EventId.GAME_SLEEP = "GAME_SLEEP";
    EventId.GAME_WAKEUP = "GAME_WAKEUP";
    EventId.GAME_HOME = "GAME_HOME";
    EventId.GAME_PREPARE = "GAME_PREPARE";
    EventId.GAME_START = "GAME_START";
    EventId.GAME_WIN = "GAME_WIN";
    EventId.GAME_FAILED = "GAME_FAILED";
    EventId.GAME_RELIVE = "GAME_RELIVE";
    EventId.GAME_OVER = "GAME_OVER";
    EventId.GAME_NEXTRES_COM = "GAME_NEXTRES_COM";
    EventId.EGG_GET_AWARD = "EGG_GET_AWARD";
    EventId.OPEN_WIN_VIEW = "OPEN_WIN_VIEW"; //PlatformMgr.OPEN_WIN_VIEW = "OPEN_WIN_VIEW"; 打开胜利界面
    EventId.OPEN_FAILED_VIEW = "OPEN_FAILED_VIEW";//PlatformMgr.OPEN_FAILED_VIEW = "OPEN_FAILED_VIEW";打开失败界面
    EventId.GAME_RESET_START = "GAME_RESET_START";//PlatformMgr.GAME_RESET_START = "GAME_RESET_START";重置游戏回到首页

    EventId.STORECFG_UPDATE = "STORECFG_UPDATE";//商城配置更新
    EventId.STORE_SWITCH_TAB = "STORE_SWITCH_TAB";//商城切换tab选项卡
    EventId.STORE_USE_ITEM = "STORE_USE_ITEM";// 使用道具
    EventId.STORE_ITEM_UNLOCKED = "STORE_ITEM_UNLOCKED" //道具解锁

    EventId.GOLD_UPDATE = "GOLD_UPDATE" //金币更新
    EventId.COLLECT_GET_AWARD = "COLLECT_GET_AWARD"; //收藏小游戏江奖励
    EventId.START_REWARD = "START_REWARD"; // 开局奖励(神秘大礼)
    EventId.PLATFORM_ADD_COIN = "PLATFORM_ADD_COIN"; // 活动增加金币
    EventId.RECORDER_VIDEO_RANK = "RECORDER_VIDEO_RANK"; //记录排行视频ID

    Laya.ILaya.regClass(EventId);
    Laya.ClassUtils.regClass("zs.laya.game.EventId", EventId);
    Laya.ClassUtils.regClass("Zhise.EventId", EventId);

    class GameState {
        constructor() {
        }
    }
    GameState.STATE_LOADING = 0;
    GameState.STATE_UNBEGIN = 1;
    GameState.STATE_PREPARE = 2;
    GameState.STATE_PLAYING = 3;
    GameState.STATE_PAUSE = 4;
    Laya.ILaya.regClass(GameState);
    Laya.ClassUtils.regClass("zs.laya.game.GameState", GameState);
    Laya.ClassUtils.regClass("Zhise.GameState", GameState);

    class WebService {
        constructor() {
        }

        static requestLoginByCode(identityId, args) {
            var webArgs = args || {};
            webArgs.code = identityId;
            webArgs.timestamp = Date.now();
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSign(this.WebApiMap.login, webArgs, this.RequestSign);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.login, webArgs);
                }
                console.log(this.WebApiMap.login);
            }
        }

        static requestLoginByUserId(userId, args) {
            var webArgs = args || {};
            webArgs.user_id = userId;
            webArgs.timestamp = Date.now();
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.login, webArgs, this.RequestSign, WebService.RequestHeader);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.login, webArgs);
                }
                console.log(this.WebApiMap.login);
            }
        }

        static requestBaseCfg(args) {
            var webArgs = args || {};
            var appMain = AppMain;
            var useSign = false;
            if (appMain.appConfig.configVersion) {
                webArgs.v_type = appMain.appConfig.configVersion;
                useSign = true;
            }
            if (this.UseWebApi) {
                if (this.RequestSign && useSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.gameCfg, webArgs,
                        this.RequestSign, WebService.RequestHeader);
                } else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.gameCfg, webArgs);
                }
                console.log(this.WebApiMap.gameCfg);
            }
            else {
                console.log(this.WebApiMap.gameCfg);
                Laya.stage.frameOnce(1, this, function () {
                    Laya.stage.event(EventId.NET_XHR_RESPONSE, [
                        1,
                        this.WebApiMap.gameCfg,
                        webArgs,
                        { "data": appMain.appConfig.defaultCfg.gameSetting }]);
                });
            }
        }

        /**主动同步用户信息给后台 */
        static updatePlayerInfo(args) {
            var appMain = AppMain;
            appMain.saveLocalPlayerInfo();
            if (!this.WebApiMap.updateInfo) {
                console.log("**************** error 没有 WebApiMap.updateInfo 链接");
                return;
            }
            var webArgs = args || {};
            if (!webArgs.user_id) {
                webArgs.user_id = appMain.playerInfo.user_id;
            }
            webArgs.timestamp = Date.now();
            console.log("------------ update info: ", webArgs);
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.updateInfo, webArgs,
                        this.RequestSign, WebService.RequestHeader);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.updateInfo, webArgs);
                }
            }
        }

        static updateVideoLog(args) {
            var webArgs = args || {};
            webArgs.user_id = AppMain.playerInfo.user_id;
            webArgs.timestamp = Date.now();
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.logVideo, webArgs,
                        this.RequestSign, WebService.RequestHeader);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.logVideo, webArgs);
                }
                // zs.laya.XHRUtils.xhrPost(this.WebApiMap.logVideo, webArgs);
                console.log(this.WebApiMap.logVideo);
            }
        }

        /**请求商城配置 */
        static requestStoreData(args) {
            if (!this.WebApiMap.requestStoreCFG) {
                console.log("**************** error 没有 WebApiMap.requestStoreCFG 链接");
                return;
            }
            var webArgs = args || {};
            var appMain = zs.laya.game.AppMain;
            webArgs["user_id"] = appMain.playerInfo.user_id;
            webArgs["timestamp"] = Date.now();

            // zs.laya.XHRUtils.xhrPost(this.WebApiMap.requestStoreCFG, webArgs);

            if (this.RequestSign) {
                zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.requestStoreCFG, webArgs,
                    this.RequestSign, this.RequestHeader);
            } else {
                zs.laya.XHRUtils.xhrPost(this.WebApiMap.requestStoreCFG, webArgs);
            }

            console.log("--------- 请求商城配置：" + this.WebApiMap.requestStoreCFG);
        }

        /**请求装备该道具  { goods_type: 道具类型, goods_id: 道具id }*/
        static requestEquipItem(args) {
            if (!args.hasOwnProperty("goods_type") || !args.hasOwnProperty("goods_id")) {
                console.log("**************** error requestUnlockGoodsByGold 没有设置goods_type 和 goods_id");
                return;
            }
            var appMain = zs.laya.game.AppMain;
            var currentUseArr = appMain.playerInfo.goods_id;
            if (!currentUseArr) {
                currentUseArr = [];
                appMain.playerInfo.goods_id = currentUseArr;
            }
            currentUseArr[args.goods_type] = args.goods_id;
            //本地保存数据
            appMain.saveLocalPlayerInfo();

            if (!this.WebApiMap.requestEquipItem) {
                console.log("**************** error 没有 WebApiMap.requestEquipItem 链接");
                return;
            }
            var webArgs = args || {};
            webArgs["user_id"] = appMain.playerInfo.user_id;
            webArgs["timestamp"] = Date.now();
            if (this.RequestSign) {
                zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.requestEquipItem, webArgs,
                    this.RequestSign, WebService.RequestHeader);
            }
            else {
                zs.laya.XHRUtils.xhrPost(this.WebApiMap.requestEquipItem, webArgs);
            }
            // console.log("--------- 请求装备道具："+this.WebApiMap.requestEquipItem);
        }

        /**请求金币解锁道具 */
        static requestUnlockGoodsByGold(args) {
            if (!args.hasOwnProperty("goods_type") || !args.hasOwnProperty("goods_id")) {
                console.log("**************** error requestUnlockGoodsByGold 没有设置goods_type 和 goods_id");
                return;
            }
            var appMain = zs.laya.game.AppMain
            /**将道具放到背包中 */
            appMain.playerInfo.gold -= args.gold;
            var bagArr = appMain.playerInfo.goods_ids[args.goods_type];
            if (!bagArr) {
                bagArr = [];
                appMain.playerInfo.goods_ids[args.goods_type] = bagArr;
            }
            if (bagArr.indexOf(args.goods_id) == -1) {
                bagArr.push(args.goods_id);
            }
            /**当前正在使用的修改 */
            var currentUseArr = appMain.playerInfo.goods_id;
            if (!currentUseArr) {
                currentUseArr = [];
                appMain.playerInfo.goods_id = currentUseArr;
            }
            currentUseArr[args.goods_type] = args.goods_id;

            appMain.saveLocalPlayerInfo();

            if (!this.WebApiMap.unlockGoodsByGold) {
                console.log("**************** error 没有 WebApiMap.unlockGoodsByGold 链接");
                return;
            }

            var webArgs = args || {};
            webArgs["user_id"] = appMain.playerInfo.user_id;
            webArgs["timestamp"] = Date.now();
            if (this.RequestSign) {
                zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.unlockGoodsByGold, webArgs,
                    this.RequestSign, WebService.RequestHeader);
            } else {
                zs.laya.XHRUtils.xhrPost(this.WebApiMap.unlockGoodsByGold, webArgs);
            }
            // console.log("--------- 请求金币解锁道具:" + this.WebApiMap.unlockGoodsByGold);
        }

        /**请求视频解锁道具 */
        static requestUnlockGoodsByVideo(args) {
            if (!args.hasOwnProperty("goods_type") || !args.hasOwnProperty("goods_id")) {
                console.log("**************** error requestUnlockGoodsByGold 没有设置goods_type 和 goods_id");
                return;
            }
            var appMain = zs.laya.game.AppMain;
            //已解锁，需要保存到角色数据里
            if (args.isUnlock) {
                var bagArr = appMain.playerInfo.goods_ids[args.goods_type];
                if (!bagArr) {
                    bagArr = [];
                    appMain.playerInfo.goods_ids[args.goods_type] = bagArr;
                }
                if (bagArr.indexOf(args.goods_id) == -1) {
                    bagArr.push(args.goods_id);
                }

                /**当前正在使用的修改 */
                var currentUseArr = appMain.playerInfo.goods_id;
                if (!currentUseArr) {
                    currentUseArr = [];
                    appMain.playerInfo.goods_id = currentUseArr;
                }
                currentUseArr[args.goods_type] = args.goods_id;
                appMain.saveLocalPlayerInfo();
            }

            if (!this.WebApiMap.unlockGoodsByVideo) {
                console.log("**************** error 没有 WebApiMap.unlockGoodsByVideo 链接");
                return;
            }
            var webArgs = args || {};
            webArgs["user_id"] = appMain.playerInfo.user_id;
            webArgs["timestamp"] = Date.now();
            if (this.RequestSign) {
                zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.unlockGoodsByVideo, webArgs,
                    this.RequestSign, WebService.RequestHeader);
            }
            else {
                zs.laya.XHRUtils.xhrPost(this.WebApiMap.unlockGoodsByVideo, webArgs);
            }
            console.log("--------- 请求视频解锁道具:" + this.WebApiMap.unlockGoodsByVideo);
        }

        static reportVideoId(args) {
            var appMain = zs.laya.game.AppMain;
            var webArgs = {};
            webArgs.user_id = appMain.playerInfo.user_id;
            webArgs.video_id = args.videoId;
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.reportVideo, webArgs,
                        this.RequestSign, this.RequestHeader);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.reportVideo, webArgs);
                }
                console.log(this.WebApiMap.reportVideo);
            }
            else {
                console.log(this.WebApiMap.reportVideo);
            }
        }

        static getVideoRank() {
            var webArgs = {};
            if (this.UseWebApi) {
                if (this.RequestSign) {
                    zs.laya.XHRUtils.xhrPostWithSignAndHeader(this.WebApiMap.videoRank, webArgs,
                        this.RequestSign, this.RequestHeader);
                }
                else {
                    zs.laya.XHRUtils.xhrPost(this.WebApiMap.videoRank, webArgs);
                }
                console.log(this.WebApiMap.videoRank);
            }
            else {
                Laya.stage.frameOnce(1, this, function () {
                    Laya.stage.event(EventId.NET_XHR_RESPONSE, [
                        2,
                        this.WebApiMap.videoRank,
                        webArgs,
                        { "data": {} }]);
                });
            }

        }
    }
    WebService.WebApiMap = null;
    WebService.RequestHeader = {};
    WebService.RequestSign = null;
    WebService.UseWebApi = false;
    Laya.ILaya.regClass(WebService);
    Laya.ClassUtils.regClass("zs.laya.game.WebService", WebService);
    Laya.ClassUtils.regClass("Zhise.WebService", WebService);

    class UIService extends Laya.Script {
        constructor() {
            super();
            this.toastMsg = null;
            this.toastCompleted = false;
            this.toastList = [];
        }

        static setOpenSound(soundUrl) {
            this.openSound = soundUrl;
        }

        static setUIResConfig(config) {
            this.viewConfig = config;
        }

        /**
         * showLoading
         */
        static showLoading(data) {
            if (this.viewConfig.loading == null) {
                console.error("showLoading error");
                return;
            }
            Laya.Scene.open(this.viewConfig.loading, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.loading, data);
            }));
        }

        static hideLoading() {
            if (this.viewConfig.loading == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.loading);
        }

        static showGameLoading(data){
            if(this.viewConfig.gameLoading == null){
                console.log("showGameLoading error");
                return;
            }
            Laya.Scene.open(this.viewConfig.gameLoading,false,data,null);
        }

        static hideGameLoading() {
            if (this.viewConfig.loading == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.gameLoading);
        }


        /**
         * showHome
         */
        static showHome(data) {
            if (this.viewConfig.home == null) {
                console.error("showHome error");
                return;
            }
            Laya.Scene.open(this.viewConfig.home, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.home, data);
            }));
        }

        static hideHome() {
            if (this.viewConfig.home == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.home);
        }

        /**
         * showPlaying
         */
        static showPlaying(data) {
            if (this.viewConfig.playing == null) {
                console.error("showPlaying error");
                return;
            }
            Laya.Scene.open(this.viewConfig.playing, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.playing, data);
            }));
        }

        /**
         * showPlaying
         */
        static hidePlaying() {
            if (this.viewConfig.playing == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.playing);
        }

        /**
         * showRelive
         */
        static showRelive(data) {
            if (this.viewConfig.relive == null) {
                console.error("showRelive error");
                return;
            }
            Laya.Scene.open(this.viewConfig.relive, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.relive, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        /**
         * hideRelive
         */
        static hideRelive() {
            if (this.viewConfig.relive == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.relive)
        }

        /**
         * showScore
         */
        static showScore(data) {
            if (this.viewConfig.score == null) {
                console.error("showScore error");
                return;
            }
            Laya.Scene.open(this.viewConfig.score, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.score, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        /**
         * hideScore
         */
        static hideScore() {
            if (this.viewConfig.score == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.score)
        }

        static showStore(data) {
            if (this.viewConfig.store == null) {
                console.error("showStore error");
                return;
            }
            Laya.Scene.open(this.viewConfig.store, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.store, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideStore() {
            if (this.viewConfig.store == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.store)
        }

        static showGuide(data) {
            if (this.viewConfig.guide == null) {
                console.error("showGuide error");
                return;
            }
            Laya.Scene.open(this.viewConfig.guide, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.guide, data);
            }));
        }

        static hideGuide() {
            if (this.viewConfig.guide == null) {
                console.error("hideGuide error");
                return;
            }
            Laya.Scene.close(this.viewConfig.guide);
        }

        static showSampleSack(data) {
            if (this.viewConfig.sampleSack == null) {
                console.error("showStore error");
                return;
            }
            Laya.Scene.open(this.viewConfig.sampleSack, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.sampleSack, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideSampleSack() {
            if (this.viewConfig.sampleSack == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.sampleSack);
        }

        static showPush(data) {
            if (this.viewConfig.push == null) {
                console.error("showStore error");
                return;
            }
            Laya.Scene.open(this.viewConfig.push, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.push, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hidePush() {
            if (this.viewConfig.push == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.push);
        }

        static showTreasure(data) {
            if (this.viewConfig.treasure == null) {
                console.error("treasure error");
                return;
            }
            Laya.Scene.open(this.viewConfig.treasure, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, this.viewScript.treasure, data);
            }));
            Laya.SoundManager.playSound(this.openSound);
        }

        static hideTreasure() {
            if (this.viewConfig.treasure == null) {
                return;
            }
            Laya.Scene.close(this.viewConfig.treasure);
        }

        static showMsgBox(data) {
            if (this.viewConfig.msgBox == null) {
                console.error("showMsgBox error");
                return;
            }
            Laya.Scene.open(this.viewConfig.msgBox, false, data, Laya.Handler.create(this, function (view) {
                this.initView(view, zs.laya.ui.MsgBoxView, data);
            }));
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

        static showToast(msg) {
            if (this.sInstance) {
                this.sInstance.popToastMsg(msg);
            }
        }

        popToastMsg(msg) {
            this.toastList.push(msg);
            if (this.toastMsg == null && this.toastList.length == 1) { //by cc 如果还没创建出来就调用多次 会导致创建多个 并会有残留
                Laya.loader.create("prefab/toastMsg.json", Laya.Handler.create(this, this.onToastPrefabReady), null, Laya.Loader.PREFAB);
            }
            else if (this.toastList.length == 1 && this.toastCompleted) {
                this.popToast();
            }
        }

        onToastPrefabReady(prefab) {
            this.toastMsg = this.owner.addChild(prefab.create());
            this.popToast();
        }

        popToast() {
            if (this.toastList.length == 0 && this.toastCompleted) {
                this.toastMsg.visible = false;
                return;
            }

            this.toastCompleted = false;
            var msg = this.toastList[0];
            this.toastMsg.visible = true;
            this.toastMsg.text = msg;
            this.toastMsg.centerY = 400;
            this.toastMsg.zOrder = 100;
            var self = this;
            Laya.Tween.to(this.toastMsg, { centerY: 0 }, 500, null, Laya.Handler.create(this, function () {
                this.toastList.shift();
                self.toastCompleted = true;
                Laya.timer.once(500, self, self.popToast);
            }));
        }

        onAwake() {
            UIService.sInstance = this;
        }

        onDestroy() {
            UIService.sInstance = null;
        }

        onEnable() {
            Laya.stage.on(UIService.UI_TOAST_MESSAGE, this, this.popToastMsg);
        }

        onDisable() {
            Laya.stage.off(UIService.UI_TOAST_MESSAGE, this, this.popToastMsg);
        }
    }
    UIService.UI_TOAST_MESSAGE = EventId.UI_TOAST_MESSAGE;
    UIService.sInstance = null;
    UIService.openSound = "sound/viewOpen.wav";
    UIService.viewConfig = {};
    UIService.viewScript = {};
    Laya.ILaya.regClass(UIService);
    Laya.ClassUtils.regClass("zs.laya.game.UIService", UIService);
    Laya.ClassUtils.regClass("zs.laya.game.ViewService", UIService);
    Laya.ClassUtils.regClass("Zhise.ViewService", UIService);

    class AppMain extends Laya.Script {

        constructor() {
            super();
            this.isCFGReady = false; //游戏后台配置加载是否完成
            this.isLoginSuccess = false;//是否登录成功
            this.loginData = null;
            this.default3DScene = null;
            this.launchResReady = false;
            this.progressHandler = null;
            this.currentLoadStep = 0;
            this.requestCFGErrorNum = 0;//请求游戏配置数据错误次数
            this.requestStoreErrorNum = 0; //请求商城数据错误次数

            this.nextResReady = false;
            this.nextResWait = false;
        }

        static get GameState() {
            return this.gameState;
        }

        static set GameState(val) {
            this.gameState = val;
        }

        static get ReliveChance() {
            return this.reliveChance;
        }

        static set ReliveChance(val) {
            this.reliveChance = val;
        }

        /**保存用户本地数据 */
        static saveLocalPlayerInfo(isUpdateTime = false) {
            var loginCacheStr = Laya.LocalStorage.getItem(WebService.RequestSign);
            var objLoginCahce;
            if (loginCacheStr) {
                objLoginCahce = JSON.parse(loginCacheStr);
            } else {
                objLoginCahce = {};
            }

            objLoginCahce.playerInfo = AppMain.playerInfo;
            // console.log("缓存数据:", AppMain.playerInfo);
            if (isUpdateTime) {
                objLoginCahce.lastLoginDate = Date.now();
                objLoginCahce.t = AppMain.playerInfo.t;
                objLoginCahce.timestamp = AppMain.playerInfo.timestamp;
            }
            loginCacheStr = JSON.stringify(objLoginCahce);
            Laya.LocalStorage.setItem(WebService.RequestSign, loginCacheStr);
        }

        /**根据道具类型和id获取道具配置 */
        static getGoodsById(goods_type, goods_id) {
            if (!AppMain.storeItemsDic) {
                return null;
            }
            var goodsTypeArr = AppMain.storeItemsDic[goods_type];
            if (goodsTypeArr && goodsTypeArr.length > 0) {
                for (var index = 0; index < goodsTypeArr.length; index++) {
                    if (!goodsTypeArr[index]) {
                        continue;
                    }

                    if (goodsTypeArr[index].goods_id == goods_id) {
                        return goodsTypeArr[index];
                    }
                }
            }
            return null;
        }

        onAwake() {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.startupEvt());
            zs.laya.sdk.SdkService.initSDK();
            zs.laya.sdk.DeviceService.initDevice();
            Laya.stage.addComponent(zs.laya.Resource);
            Laya.stage.addComponent(zs.laya.ObjectPool);
            Laya.stage.addComponent(UIService);

            Laya.stage.on(EventId.GAME_HOME, this, this.onGameHome);
            Laya.stage.on(EventId.GAME_PREPARE, this, this.onGamePrepare);
            Laya.stage.on(EventId.GAME_START, this, this.onGameStart);
            Laya.stage.on(EventId.GAME_FAILED, this, this.onGameFailed);
            Laya.stage.on(EventId.GAME_WIN, this, this.onGameWin);
            Laya.stage.on(EventId.GAME_RELIVE, this, this.onGameRelive);
            Laya.stage.on(EventId.GAME_OVER, this, this.onGameOver);
            Laya.stage.on(EventId.GAME_NEXTRES_COM, this, this.onNextResCom);

            Laya.stage.on(EventId.OPEN_WIN_VIEW, this, this.onOpenWinView);
            Laya.stage.on(EventId.OPEN_FAILED_VIEW, this, this.onOpenFailedView);
            Laya.stage.on(EventId.GAME_RESET_START, this, this.onGameOverToStart);

            Laya.stage.on(EventId.APP_SHOW, this, this.onGameShow);
            Laya.stage.on(EventId.APP_HIDE, this, this.onGameHide);
            Laya.stage.on(EventId.NET_XHR_RESPONSE, this, this.onNetXHRResponse);

            Laya.stage.on(EventId.UI_VIEW_CLOSED, this, this.onViewClosed);
            Laya.stage.on(EventId.UI_VIEW_OPENED, this, this.onViewOpened);
            Laya.stage.on(EventId.RECORDER_VIDEO_RANK, this, this.onRecorderVideoRank);
            Laya.loader.load(["config/gameCfg.json", "config/publishVer.json"], Laya.Handler.create(this, this.onGameCfgReady));
            UIService.viewScript = {
                loading: zs.laya.ui.LoadingView,
                home: zs.laya.ui.HomeView,
                playing: zs.laya.base.ZhiSeView,
                relive: zs.laya.ui.ReliveView,
                score: zs.laya.ui.WinView,
                msgBox: zs.laya.ui.MsgBoxView,
                guide: zs.laya.base.ZhiSeView,
                store: zs.laya.ui.StorePage,
                sampleSack: zs.laya.ui.SampleSackView,
                push: zs.laya.ui.PushView,
                treasure: zs.laya.ui.TreasureView
            }
        }

        onDestroy() {
            Laya.stage.off(EventId.GAME_HOME, this, this.onGameHome);
            Laya.stage.off(EventId.GAME_PREPARE, this, this.onGamePrepare);
            Laya.stage.off(EventId.GAME_START, this, this.onGameStart);
            Laya.stage.off(EventId.GAME_OVER, this, this.onGameOver);
            Laya.stage.off(EventId.GAME_RELIVE, this, this.onGameRelive);
            Laya.stage.off(EventId.GAME_FAILED, this, this.onGameFailed);
            Laya.stage.off(EventId.GAME_WIN, this, this.onGameWin);
            Laya.stage.off(EventId.OPEN_WIN_VIEW, this, this.onOpenWinView);
            Laya.stage.off(EventId.OPEN_FAILED_VIEW, this, this.onOpenFailedView);
            Laya.stage.off(EventId.GAME_RESET_START, this, this.onGameOverToStart);
            Laya.stage.off(EventId.APP_SHOW, this, this.onGameShow);
            Laya.stage.off(EventId.APP_HIDE, this, this.onGameHide);
            Laya.stage.off(EventId.NET_XHR_RESPONSE, this, this.onNetXHRResponse);
            Laya.stage.off(EventId.UI_VIEW_CLOSED, this, this.onViewClosed);
            Laya.stage.off(EventId.UI_VIEW_OPENED, this, this.onViewOpened);
            Laya.stage.off(EventId.RECORDER_VIDEO_RANK, this, this.onRecorderVideoRank);
        }

        onViewClosed(viewName, view) {

        }

        onViewOpened(viewName, view) {
            if (AppMain.appConfig.viewMap.home.indexOf(viewName) != -1) {
                UIService.hideLoading();
            }
        }

        onRecorderVideoRank(videoId) {
            zs.laya.game.WebService.reportVideoId({videoId: videoId});
        }

        onGameCfgReady() {
            var cfg = Laya.loader.getRes("config/gameCfg.json");
            AppMain.appConfig = cfg;
            AppMain.appConfig.version = Laya.loader.getRes("config/publishVer.json");
            AppMain.playerInfo = cfg.defaultCfg.playerInfo;
            AppMain.gameSetting = cfg.defaultCfg.gameSetting;
            WebService.WebApiMap = AppMain.appConfig.webApiMap;
            WebService.UseWebApi = AppMain.appConfig.useWebApi;
            WebService.RequestSign = AppMain.appConfig.webApiSign;
            UIService.viewConfig = cfg.viewMap;
            UIService.openSound = cfg.soundViewOpen;
            Laya.stage.once(EventId.UI_VIEW_OPENED, this, this.onLoadingOpened, [cfg.baseResList, cfg.fontList, cfg.configList]);
            UIService.showLoading();

            if (AppMain.appConfig.useWebAdApi) {
                Laya.loader.load(["config/platformCfg.json"], Laya.Handler.create(this, this.onPlatformCfgReady));
            }
            this.login();
        }

        /**初始化广告数据 */
        onPlatformCfgReady() {
            var platformCfg = Laya.loader.getRes("config/platformCfg.json");
            zs.laya.platform.PlatformMgr.initCFG(platformCfg);
            zs.laya.platform.PlatformMgr.initSoundUrl(AppMain.appConfig.soundViewOpen, AppMain.appConfig.soundClick);
            zs.laya.sdk.ZSReportSdk.loadConfig(
                function (data) {
                    zs.laya.platform.ADConfig.initAdSetting(AppMain.appConfig.version, data);
                    zs.laya.platform.PlatformMgr.initGameAd();
                    Laya.stage.event(zs.laya.game.EventId.AD_CONFIIG_LOADED);
                },
                function (error) {
                    console.error(error);
                    zs.laya.platform.ADConfig.initAdSetting(AppMain.appConfig.version, platformCfg.adCfg);
                    zs.laya.platform.PlatformMgr.initGameAd();
                }
            );
        }

        onLoadingOpened() {
            this.currentLoadStep = 0;
            this.progressHandler = Laya.Handler.create(this, this.onLoadProgressUpdate, null, false);
            console.log("开始分包加载----");
            this.loadSubpackage();
        }

        loadSubpackage() {
            while (AppMain.appConfig.subpackage && AppMain.appConfig.subpackage.length > 0) {
                const pkgName = AppMain.appConfig.subpackage.shift();
                if (pkgName.indexOf("3dres") != -1 || pkgName.indexOf("sound") != -1 ||pkgName.indexOf("role") != -1) continue;
                const res = zs.laya.sdk.SdkService.loadSubpackage(
                    pkgName,
                    null,
                    Laya.Handler.create(this, this.loadSubpackage),
                    Laya.Handler.create(this, this.loadSubpackage));
                if (res) {
                    //console.log("进入----");
                    return;
                }
            }
            this.currentLoadStep++;
            console.log("----------------loadSubpackage currentLoadStep:" + this.currentLoadStep);
            this.loadBaseConfig();
            this.loadFont();
                // if (AppMain.appConfig.bgm) {
                    //     zs.laya.SoundService.playMusic(AppMain.appConfig.bgm);
                    // }
            
        }

        loadBaseConfig() {
            var urls = [];
            AppMain.appConfig.configList.forEach(function (cfgUrl) {
                urls.push(cfgUrl);
            });

            if (urls.length == 0) {
                this.onBaseConfigReady();
            }
            else {
                Laya.loader.load(urls, Laya.Handler.create(this, this.onBaseConfigReady), this.progressHandler);
            }
        }

        onBaseConfigReady() {
            this.currentLoadStep++;
            console.log("----------------onBaseConfigReady currentLoadStep:" + this.currentLoadStep);
            // this.loadBaseRes();
            // this.onBaseResReady();
            Laya.loader.create("3dlh/Conventional/signBoy.lh", Laya.Handler.create(this, this.onBaseResReady), this.progressHandler);
        }

        loadBaseRes() {
            var urls = [];
            AppMain.appConfig.baseResList.forEach(function (cfgUrl) {
                urls.push(zs.laya.Resource.Get3dPrefabUrl(cfgUrl));
            });

            if (urls.length == 0) {
                this.onBaseResReady();
            } else {
                Laya.loader.create(urls, Laya.Handler.create(this, this.onBaseResReady), this.progressHandler);
            }
        }

        onBaseResReady() {
            this.currentLoadStep++;
            // console.log("----------------onBaseResReady currentLoadStep:" + this.currentLoadStep);
            this.loadScene3d();
        }

        loadFont() {
            var self = this;
            AppMain.appConfig.fontList.forEach(function (fontUrl) {
                var font = new Laya.BitmapFont();
                font.loadFont(`font/${fontUrl}.fnt`, Laya.Handler.create(self, self.onFontReady, [font, fontUrl]));
            });
        }

        onFontReady(font, fontUrl) {
            Laya.Text.registerBitmapFont(fontUrl, font);
        }

        loadScene3d() {
            if (AppMain.appConfig.default3DScene == null || AppMain.appConfig.default3DScene.length == 0) {
                this.onLaunchResReady(null);
                return;
            }

            zs.laya.Resource.LoadScene3dAsyn(
                AppMain.appConfig.default3DScene,
                Laya.Handler.create(this, this.onLaunchResReady),
                this.progressHandler
            );
        }

        onLaunchResReady(s) {
            this.currentLoadStep++;
            console.log("----------------onLaunchResReady currentLoadStep:" + this.currentLoadStep);
            this.launchResReady = true;
            this.default3DScene = s;
            if (AppMain.appConfig.platformType && AppMain.appConfig.platformType == "vivo") {
                zs.laya.sdk.SdkService.getNetworkType(Laya.Handler.create(this, function () {
                    this.launchCompleted();
                }));
            } else {
                this.launchCompleted();
            }
        }

        onLoadProgressUpdate(val) {
            if (val == 1) {
                return;
            }
            var totalProgress = this.currentLoadStep * 0.25 + 0.25 * val;
            totalProgress = totalProgress >0.9?0.99:totalProgress;
            // console.log(this.currentLoadStep + "---------------------加载进度：" + totalProgress + "      val : "+ val);
            Laya.stage.event(EventId.UI_PROGRESS_UPDATE, totalProgress);
        }

        onNetXHRResponse(result, api, params, response) {
            if (result != 1) {
                console.log("**************** error ： " + api + "  返回错误！！！");
                if (api == WebService.WebApiMap.gameCfg && this.requestCFGErrorNum < 3) {
                    this.requestCFGErrorNum++;
                    WebService.requestBaseCfg(AppMain.webRequestAdapter.reqBaseCfgArgs());
                }
                if (api == WebService.WebApiMap.requestStoreCFG && this.requestStoreErrorNum < 3) {
                    this.requestStoreErrorNum++;
                    WebService.requestStoreData(AppMain.webRequestAdapter.reqStoreCFgArgs());
                }
                if (this.requestCFGErrorNum >= 3 || this.requestStoreErrorNum >= 3) {
                    zs.laya.game.UIService.showToast("哎呀，网络开小差，请检查网络");
                }
                return;
            }
            console.log(api + " : response data:", response.data);
            switch (api) {
                case WebService.WebApiMap.login:
                    var loginInfo = AppMain.webResponseAdapter.LoginResponse(response.data);
                    // console.log("登录数据：",loginInfo);
                    WebService.RequestHeader = { t: loginInfo.t, timestamp: loginInfo.timestamp };
                    zs.laya.platform.PlatformMgr.setUserID(loginInfo.user_id, loginInfo.is_new);
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.loginEvt(loginInfo.user_id));
                    //如果游戏还在加载中，则直接使用服务器返回的数据 。如果游戏已经初始化了，但是没有开始游戏，则通知更换数据。如果游戏已经开始，则只保留user_id，方便后续跟后台通信
                    if (AppMain.GameState == GameState.STATE_LOADING) {
                        AppMain.playerInfo = loginInfo;
                    } else if (AppMain.GameState == GameState.STATE_UNBEGIN) {
                        AppMain.playerInfo.user_id = loginInfo.user_id;
                        if (loginInfo.gold > AppMain.playerInfo.gold) {
                            AppMain.playerInfo.gold = loginInfo.gold;
                        }
                        console.log("------------------- change playerInfo");
                        Laya.stage.event(EventId.DATA_LOGIN_INFO_UPDATE, [loginInfo]);
                    } else {
                        AppMain.playerInfo.user_id = loginInfo.user_id;
                        if (loginInfo.gold > AppMain.playerInfo.gold) {
                            AppMain.playerInfo.gold = loginInfo.gold;
                        }
                    }
                    AppMain.playerInfo.t = loginInfo.t;
                    AppMain.playerInfo.timestamp = loginInfo.timestamp;
                    this.isLoginSuccess = true;
                    zs.laya.sdk.ZSReportSdk.init(AppMain.playerInfo.user_id, Laya.Browser.onAndroid ? 1 : 0);
                    /**保存本地数据 */
                    AppMain.saveLocalPlayerInfo(true);
                    // Laya.stage.event(EventId.DATA_LOGIN_INFO_UPDATE);
                    break;
                case WebService.WebApiMap.gameCfg:
                    AppMain.gameSetting = AppMain.webResponseAdapter.BaseCfgResponse(response.data);
                    Laya.stage.event(EventId.DATA_SETTING_UPDATE);
                    if (this.isCFGReady == false) {
                        this.isCFGReady = true;
                        this.launchCompleted();
                    }
                    break;
                case WebService.WebApiMap.logVideo:
                    zs.laya.sdk.ZSReportSdk.sendVideoLog();
                    break;
                case WebService.WebApiMap.updateInfo:
                    console.log("update player info success!");
                    break;
                case WebService.WebApiMap.requestStoreCFG:
                    var storeCfgArr = response.data;
                    AppMain.storeItemsDic = {};
                    for (var index = 0; index < storeCfgArr.length; index++) {
                        var element = storeCfgArr[index];
                        if (AppMain.storeItemsDic[element.goods_type] == null) {
                            AppMain.storeItemsDic[element.goods_type] = [];
                        }
                        AppMain.storeItemsDic[element.goods_type].push(element);
                    }
                    Laya.stage.event(EventId.STORECFG_UPDATE);
                    break;
                case WebService.WebApiMap.requestEquipItem:
                    console.log("use goods_item success");
                    break;
                case WebService.WebApiMap.unlockGoodsByGold:
                    console.log("gold unlock goods_item success");
                    break;
                case WebService.WebApiMap.unlockGoodsByVideo:
                    console.log("video unlock goods_item success");
                    break;
            }
        }

        launchCompleted() {
            if (this.launchResReady && this.isCFGReady) {
                //如果没有登录成功，则获取缓存数据
                if (AppMain.appConfig.bgm) {
                    zs.laya.SoundService.stopMusic();
                }
                console.log("加载缓存");
                var loginCacheStr = Laya.LocalStorage.getItem(WebService.RequestSign);
                console.log("加载wan缓存");
                if (loginCacheStr) {
                    // console.log("-------------- 缓存数据：" + loginCacheStr);
                    var loginCache = JSON.parse(loginCacheStr);
                    if (!this.isLoginSuccess) { //登录失败
                        AppMain.playerInfo = loginCache.playerInfo;
                        console.log("登录失败----------------");
                    } else {
                        if (loginCache.playerInfo.gold > AppMain.playerInfo.gold) {
                            AppMain.playerInfo.gold = Number(loginCache.playerInfo.gold);
                        }
                        if (loginCache.playerInfo.level_id > AppMain.playerInfo.level_id) {
                            AppMain.playerInfo.level_id = Number(loginCache.playerInfo.level_id);
                        }
                        if (loginCache.playerInfo.level_start > AppMain.playerInfo.level_start) {
                            AppMain.playerInfo.level_start = Number(loginCache.playerInfo.level_start);
                        }
                    }
                } else {
                    if (!this.isLoginSuccess) {
                        AppMain.playerInfo = AppMain.appConfig.defaultCfg.playerInfo;
                    }
                }


                if (AppMain.playerInfo.gold == undefined || AppMain.playerInfo.gold == null) {
                    AppMain.playerInfo.gold = AppMain.appConfig.defaultCfg.playerInfo.gold ? Number(AppMain.appConfig.defaultCfg.playerInfo.gold) : 0;
                }
                if (AppMain.playerInfo.level_id == undefined || AppMain.playerInfo.level_id == null) {
                    AppMain.playerInfo.level_id = AppMain.appConfig.defaultCfg.playerInfo.level_id ? Number(AppMain.appConfig.defaultCfg.playerInfo.level_id) : 0;
                }
                if (AppMain.playerInfo.level_start == undefined || AppMain.playerInfo.level_start == null) {
                    AppMain.playerInfo.level_start = AppMain.appConfig.defaultCfg.playerInfo.level_start ? Number(AppMain.appConfig.defaultCfg.playerInfo.level_start) : 0;
                }

                Laya.stage.event(EventId.LAUNCH_COMPLETED, this.default3DScene);

                zs.laya.platform.PlatformMgr.enterGamePopup();
            }
        }

        onGameHome(data) {
            AppMain.GameState = GameState.STATE_UNBEGIN;
            if (AppMain.autoStartNext == false) {
                UIService.showHome(data);
            } else {
                Laya.timer.frameOnce(2, this, function () {
                    Laya.stage.event(EventId.GAME_PREPARE);
                });
            }

            if (!AppMain.storeItemsDic) {
                WebService.requestStoreData(AppMain.webRequestAdapter.reqStoreCFgArgs());
            }

        }
        onGamePrepare(data) {
            this.nextResWait = false;
            this.nextResReady = false;
            AppMain.GameState = GameState.STATE_PREPARE;
            if (AppMain.appConfig.bgm) {
                zs.laya.SoundService.playMusic(AppMain.appConfig.bgm);
            }
            UIService.showPlaying(data);
            Laya.timer.once(200,this,()=>{
                UIService.hideHome();
            })
        }

        onGameStart() {
            console.log("hideGameLoading=====");
            UIService.hideGameLoading();
            AppMain.isWin = false;
            AppMain.autoStartNext = false;
            AppMain.GameState = GameState.STATE_PLAYING;
        }

        onOpenFailedView(data) {
            if (AppMain.GameState != GameState.STATE_PLAYING) {
                return;
            }
            AppMain.isWin = false;
            zs.laya.SoundService.stopMusic();
            AppMain.GameState = GameState.STATE_PAUSE;
            var platformCfg = zs.laya.platform.PlatformMgr.platformCfg;
            if (platformCfg && platformCfg.hideRelive) { //platformCfg.json中隐藏失败结算页配置
                Laya.stage.event(EventId.GAME_OVER);
                return;
            }
            AppMain.autoStartNext = false;
            UIService.showRelive(data);
            AppMain.reliveChance -= 1;
        }

        onOpenWinView(data) {
            if (AppMain.GameState != GameState.STATE_PLAYING) {
                return;
            }
            zs.laya.SoundService.stopMusic();
            AppMain.GameState = GameState.STATE_PAUSE;
            var platformCfg = zs.laya.platform.PlatformMgr.platformCfg;
            if (platformCfg && platformCfg.hideWin) { //platformCfg.json中隐藏胜利结算页配置
                Laya.stage.event(EventId.GAME_OVER);
                return;
            }
            AppMain.autoStartNext = false;
            UIService.showScore(data);
        }

        /**是否打开导出 */
        isOpenExportGame() {
            return AppMain.appConfig.useWebAdApi && zs.laya.platform.ADConfig.isPublicVersion();
        }

        onGameFailed(data) {
            AppMain.isWin = false;
            this.reportTalkData();
            this.nextResReady = true;
            if (this.isOpenExportGame()) {
                zs.laya.platform.PlatformMgr.onGameFaildPopUp(data);
            } else {
                // this.onOpenFailedView(data);
                Laya.stage.event(EventId.GAME_OVER);
            }
        }

        onGameWin(data) {
            AppMain.isWin = true;
            this.reportTalkData();
            if (this.isOpenExportGame()) {
                zs.laya.platform.PlatformMgr.onGameWinPopUp(data);
            } else {
                // this.onOpenWinView(data);
                Laya.stage.event(EventId.GAME_OVER);
            }
            this.nextResReady = false;
            this.preloadNextRes();
        }

        /**上报talkData 游戏成功还是失败 */
        reportTalkData() {
            var currentLv = AppMain.playerInfo.level_id;
            var currentMaxLv = AppMain.playerInfo.level_start;
            console.log("---------report talk data：" + currentLv);
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.levelCompletedEvt(AppMain.playerInfo.user_id, currentMaxLv.toString()));
            if (AppMain.isWin) {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.gameOverEvt(AppMain.playerInfo.user_id, "胜利",currentLv.toString()));
            } else {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.gameOverEvt(AppMain.playerInfo.user_id, "失败",currentLv.toString()));
            }
        }

        /**游戏结算并更新后台玩家数据 */
        gameAccountAndUpload() {
            if (AppMain.gameOverOperate && AppMain.gameOverOperate.rewardHandle) {
                AppMain.gameOverOperate.rewardHandle();
            }

            //登录成功，则上报数据给后台
            if (this.isLoginSuccess) {
                var info = AppMain.webRequestAdapter.uploadPlayerInfoArgs();//WebRequestArgs.updatePlayerInfoArgs();
                info = info ? info : {};
                if (!info.level_id) {
                    info.level_id = AppMain.playerInfo.level_id;
                }
                if (!info.gold) {
                    info.gold = AppMain.playerInfo.gold;
                }
                WebService.updatePlayerInfo(info);
            } else {
                AppMain.saveLocalPlayerInfo();
            }
            this.reConnect();
        }



        /**预加载下一关的资源 */
        preloadNextRes() {
            if (AppMain.gameOverOperate && AppMain.gameOverOperate.loadNextResArr) {
                var resArr = AppMain.gameOverOperate.loadNextResArr({ level_id: AppMain.playerInfo.level_id + 1 });
                if (resArr && resArr.length > 0) {
                    Laya.loader.load(resArr, Laya.Handler.create(this, this.onNextResReady), Laya.Handler.create(this, this.onNextResProgress));
                } else {
                    this.onNextResReady();
                }
            } else {
                this.onNextResReady();
            }
        }

        onNextResReady() {
            Laya.stage.event(EventId.GAME_NEXTRES_COM);
        }

        onNextResProgress(value) {
            console.log("-----------预加载下一关资源的进度：" + value);
        }

        onGameOver() {
            this.gameAccountAndUpload();
            AppMain.reliveChance = 2;
            UIService.hideRelive();
            UIService.hidePlaying();
            UIService.hideScore();
            // if (AppMain.appConfig.useWebAdApi) {
            //     zs.laya.sdk.ZSReportSdk.loadConfig(
            //         function (data) {
            //             zs.laya.platform.ADConfig.initAdSetting(AppMain.appConfig.version, data);
            //         },
            //         function (error) {
            //             console.log(error);
            //         });
            // }

            if (this.isOpenExportGame()) {
                zs.laya.platform.PlatformMgr.onGameOverPopUp({gold:AppMain.levelData.rewardGold,isBackHome:!AppMain.autoStartNext});
            } else {
                Laya.stage.frameOnce(1, this, this.onGameOverToStart);
            }
        }

        /**游戏结束重新开始游戏 */
        onGameOverToStart() {
            if (this.nextResReady) {
                Laya.stage.event(EventId.GAME_HOME);
            } else {
                //等待下一关资源加载完成
                this.nextResWait = true;
            }

            AppMain.isWin = false;
        }

        /**下一关资源准备好了 */
        onNextResCom() {
            this.nextResReady = true;
            if (this.nextResWait) {
                Laya.stage.event(EventId.GAME_HOME);
            }
        }

        onGameRelive() {
            if (AppMain.GameState != GameState.STATE_PAUSE) {
                return;
            }
            if (AppMain.appConfig.bgm) {
                zs.laya.SoundService.playMusic(AppMain.appConfig.bgm);
            }
            AppMain.GameState = GameState.STATE_PLAYING;
            UIService.hideRelive();
        }

        onGameShow() {
            // Laya.timer.scale = 1;
            Laya.stage.renderingEnabled = true;
            if (AppMain.appConfig && AppMain.appConfig.bgm && !zs.laya.SoundService.videoPlaying) {
                //zs.laya.SoundService.playMusic(AppMain.appConfig.bgm);
            }
        }

        onGameHide() {
            // Laya.timer.scale = 0;
            Laya.stage.renderingEnabled = false;
            //zs.laya.SoundService.stopMusic();
        }

        reConnect() {
            if (this.isSettingReady == false) {
                WebService.requestBaseCfg(AppMain.webRequestAdapter.reqBaseCfgArgs());
            }
            if (this.isLoginSuccess == false) {
                this.login();
            }
        }

        login() {
            WebService.requestBaseCfg(AppMain.webRequestAdapter.reqBaseCfgArgs());

            if (AppMain.appConfig.platformType == "wx") {
                var loginCacheStr = Laya.LocalStorage.getItem(WebService.RequestSign);//Laya.LocalStorage.getJSON("loginCacheData");
                if (loginCacheStr) {
                    var loginCache = JSON.parse(loginCacheStr);
                    if (loginCache && loginCache.lastLoginDate && zs.laya.MiscUtils.isToday(loginCache.lastLoginDate)) {
                        WebService.RequestHeader = { t: loginCache.t, timestamp: loginCache.timestamp };
                        console.log("1---------------登录：" + loginCache.playerInfo.user_id);
                        WebService.requestLoginByUserId(loginCache.playerInfo.user_id, AppMain.webRequestAdapter.reqLoginArgs());
                        return;
                    }
                }
            }

            zs.laya.sdk.SdkService.login(
                Laya.Handler.create(this, function (loginData) {
                    if (loginData) {
                        this.loginData = loginData;
                        var loginArg = AppMain.webRequestAdapter.reqLoginArgs();
                        if (loginArg == null) loginArg = {};
                        if (AppMain.appConfig.platformType) {
                            switch (AppMain.appConfig.platformType) {
                                case "vivo":
                                    var platformVersionCode = zs.laya.sdk.DeviceService.device.deviceInfo.platformVersionCode;
                                    loginArg.isOld = platformVersionCode < 1053 ? 1 : 0;
                                    break;
                                case "tt":
                                    loginArg.anonymous_code = loginData.anonymous_code;
                                    break;
                            }
                        }
                        WebService.requestLoginByCode(this.loginData.identityId, loginArg);
                    }
                }),
                Laya.Handler.create(this, function (msg) {
                    console.error("login platform error:" + msg);
                    if (msg.code == 1) {
                        console.log("2---------------登录：" + AppMain.appConfig.defaultCfg.playerInfo.user_id);
                        WebService.requestLoginByUserId(AppMain.appConfig.defaultCfg.playerInfo.user_id, AppMain.webRequestAdapter.reqLoginArgs());
                    } else {
                        // var userID = AppMain.appConfig.defaultCfg.playerInfo.user_id == 1 ? 2: 1;
                        // WebService.requestLoginByUserId(userID, AppMain.webRequestAdapter.reqLoginArgs());
                    }
                })
            );
        }
    }

    AppMain.lastLoginDate = 0;
    AppMain.appConfig = null;
    AppMain.playerInfo = {};
    AppMain.storeCfg = {};
    AppMain.storeItemsDic = null;//{[goods_type:number]:[]} 以物品类型为id的字典 ，内容为该类型的物品数组
    AppMain.gameSetting = {};
    AppMain.levelData = {};
    AppMain.authorizeData = {};
    AppMain.gameStartRet = {};
    AppMain.gameEndRet = {};
    AppMain.gameState = GameState.STATE_LOADING;
    AppMain.reliveChance = 2;
    AppMain.autoStartNext = false;
    AppMain.isWin = false;

    AppMain.gameOverOperate = {
        //游戏结束奖励处理
        rewardHandle: function () {
        },
        //游戏结束需要加载下一关的资源 data={level_id:等级}
        loadNextResArr: function (data) {
            return null;
        }
    }

    AppMain.webResponseAdapter = {
        LoginResponse: function (data) { return data; },
        BaseCfgResponse: function (data) { return data; },
    };

    AppMain.webRequestAdapter = {
        reqLoginArgs: function () {
            return null;
        },
        reqBaseCfgArgs: function () {
            return null;
        },
        uploadVideoArgs: function () {
            return null;
        },
        uploadPlayerInfoArgs: function () {
            return null;
        },
        reqStoreCFgArgs: function () {
            return null;
        }
    }

    Laya.ILaya.regClass(AppMain);
    Laya.ClassUtils.regClass("zs.laya.game.AppMain", AppMain);
    Laya.ClassUtils.regClass("Zhise.AppMain", AppMain);


    exports.EventId = EventId;
    exports.GameState = GameState;
    exports.WebService = WebService;
    exports.UIService = UIService;
    exports.AppMain = AppMain;
}(window.zs.laya.game = window.zs.laya.game || {}, Laya));
