window.zs = window.zs || {};
window.zs.laya = window.zs.laya || {};
(function (exports, Laya) {
    'use strict';
    class LoadingBar extends Laya.Script {

        constructor() {
            super();
            this.loadingVal = null;
            this.loadingBar = null;
            this.loadingMask = null;
        }

        onAwake() {
            this.loadingVal = this.owner.getChildByName("loadingVal");
            this.loadingMask = this.owner.getChildByName("loadingMask");
            this.loadingBar = this.loadingMask.getChildByName("loadingBar");
        }

        onEnable() {
            this.onLoadingUpdate(0.01);
            Laya.stage.on(LoadingBar.EVENT_UI_PROGRESS_UPDATE, this, this.onLoadingUpdate);
        }

        onDisable() {
            Laya.stage.off(LoadingBar.EVENT_UI_PROGRESS_UPDATE, this, this.onLoadingUpdate);
        }

        onLoadingUpdate(val) {
            if (this.loadingBar && this.loadingMask) {
                this.loadingMask.width = this.loadingBar.width * val;
            }
            this.loadingVal && (this.loadingVal.text = Math.floor(100 * val) + "%");
        }
    }
    LoadingBar.EVENT_UI_PROGRESS_UPDATE = "UI_PROGRESS_UPDATE";
    Laya.ILaya.regClass(LoadingBar);
    Laya.ClassUtils.regClass("zs.laya.ui.Loading", LoadingBar);
    Laya.ClassUtils.regClass("zs.laya.ui.LoadingBar", LoadingBar);
    Laya.ClassUtils.regClass("Zhise.LoadingBar", LoadingBar);

    class MsgBoxComp extends Laya.Script {

        constructor() {
            super();
            this.callback = null;
            this.confirmBtn = null;
        }

        initMsgBox(callback) {
            this.callback = callback;
        }

        onAwake() {
            this.confirmBtn = this.owner.getChildByName("confirmBtn");
        }

        onEnable() {
            this.confirmBtn.on(Laya.Event.CLICK, this, this.onClickConfirm);
        }

        onDisable() {
            this.confirmBtn.off(Laya.Event.CLICK, this, this.onClickConfirm);
        }

        onClickConfirm() {
            if (this.callback) {
                this.callback.run();
                this.callback = null;
            }
        }
    }
    Laya.ILaya.regClass(MsgBoxComp);
    Laya.ClassUtils.regClass("zs.laya.ui.MsgBox", MsgBoxComp);
    Laya.ClassUtils.regClass("zs.laya.ui.MsgBoxComp", MsgBoxComp);
    Laya.ClassUtils.regClass("Zhise.MsgBoxComp", MsgBoxComp);

    class StartBtn extends Laya.Script {
        constructor() {
            super();
        }

        onClick() {
            var appMain = zs.laya.game.AppMain;
            Laya.SoundManager.playSound(appMain.appConfig.soundClick);
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.gameStartEvt(appMain.playerInfo.user_id));
            Laya.stage.event(zs.laya.game.EventId.GAME_PREPARE);
        }
    }
    Laya.ILaya.regClass(StartBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.StartBtn", StartBtn);
    Laya.ClassUtils.regClass("Zhise.StartBtn", StartBtn);

    

    class StoreBtn extends Laya.Script {

        constructor() {
            super();
        }

        onClick() {
            Laya.SoundManager.playSound(zs.laya.game.AppMain.appConfig.soundClick);
            zs.laya.game.UIService.showStore();
        }
    }
    Laya.ILaya.regClass(StoreBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.StoreBtn", StoreBtn);
    Laya.ClassUtils.regClass("Zhise.StoreBtn", StoreBtn);

    class ReplayBtn extends Laya.Script {

        constructor() {
            super();
            this.statusClip = null;
        }

        onAwake() {
            this.statusClip = this.owner.getChildByName("replayBtn");
        }

        onEnable() {
            this.owner.mouseEnabled = true;
            this.freshBtnState();
        }

        onClick() {
            Laya.SoundManager.playSound(zs.laya.game.AppMain.appConfig.soundClick);
            this.owner.mouseEnabled = false;
            if (this.statusClip.index == 0) {
                zs.laya.sdk.SdkService.playVideo(
                    Laya.Handler.create(this, function () {
                        console.log("toRelive");
                        zs.laya.platform.ADConfig.updateVideoRevive();
                        this.relive();
                        console.log("toRelive2");
                    }),
                    Laya.Handler.create(this, function () {
                        this.owner.mouseEnabled = true;
                        this.freshBtnState();
                    }),
                    Laya.Handler.create(this, function () {
                        this.freshBtnState();
                        // zs.laya.game.UIService.showToast("今日视频观看次数已用尽");
                    }));
            }
            else if (this.statusClip.index == 1) {
                Laya.stage.once(zs.laya.sdk.DeviceService.EVENT_ON_SHOW, this, function (timeStamp) {
                    if (Date.now() - timeStamp > 3000) {
                        zs.laya.platform.ADConfig.updateShareRevive();
                        Laya.stage.event(zs.laya.game.EventId.GAME_RELIVE);
                        this.relive();
                    }
                    else {
                        this.freshBtnState();
                        zs.laya.game.UIService.showToast("分享失败");
                    }
                }, [Date.now()]);
                zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
            }
            else if (this.statusClip.index == 2) {
                this.relive();
            }
            else {
                this.onContinue();
            }
        }

        freshBtnState() {
            this.owner.mouseEnabled = true;
            var useWebAdApi = zs.laya.game.AppMain.appConfig.useWebAdApi;
            if (zs.laya.game.AppMain.ReliveChance <= 0) {
                this.statusClip.index = 3;
            }
            else if (useWebAdApi && zs.laya.platform.ADConfig.enableClickRevive()) {
                this.statusClip.index = 2;
            }
            else if (useWebAdApi && zs.laya.platform.ADConfig.enableVideoRevive() ){
                zs.laya.sdk.SdkService.isVideoEnable(()=>{
                    this.statusClip.index = 0;
                },null);
            }
            else if (useWebAdApi && zs.laya.platform.ADConfig.enableShareRevive()) {
                this.statusClip.index = 1;
            }
            else {
                this.statusClip.index = 3;
            }
        }

        relive() {
            Laya.stage.timerOnce(100, this, function () {
                Laya.stage.event(zs.laya.game.EventId.GAME_RELIVE);
                this.onRelive();
            });
        }

        onContinue() {
            Laya.stage.event(zs.laya.game.EventId.GAME_OVER);
        }

        onRelive() {

        }
    }
    Laya.ILaya.regClass(ReplayBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.ReplayBtn", ReplayBtn);
    Laya.ClassUtils.regClass("Zhise.ReplayBtn", ReplayBtn);

    class AwardBtn extends Laya.Script {

        constructor() {
            super();
        }

        onEnable() {
            this.owner.mouseEnabled = true;
        }

        onClick() {
            Laya.SoundManager.playSound(zs.laya.game.AppMain.appConfig.soundClick);
            this.owner.mouseEnabled = false;

            Laya.stage.event(zs.laya.game.EventId.GAME_OVER);
        }
    }
    Laya.ILaya.regClass(AwardBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.AwardBtn", AwardBtn);
    Laya.ClassUtils.regClass("Zhise.AwardBtn", AwardBtn);

    class ExtraAwardBtn extends AwardBtn {

        constructor() {
            super();
        }

        onClick() {
            Laya.SoundManager.playSound(zs.laya.game.AppMain.appConfig.soundClick);
            this.owner.mouseEnabled = false;
            zs.laya.sdk.SdkService.playVideo(
                Laya.Handler.create(this, function () {
                    this.onExtraAward();
                    Laya.stage.event(zs.laya.game.EventId.GAME_OVER);
                }),
                Laya.Handler.create(this, function () {
                    this.owner.mouseEnabled = true;
                }),
                Laya.Handler.create(this, function () {
                    this.owner.mouseEnabled = true;
                    // zs.laya.game.UIService.showToast("今日视频观看次数已用尽");
                }));
        }

        onExtraAward(){

        }        
    }
    Laya.ILaya.regClass(ExtraAwardBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.ExtraAwardBtn", ExtraAwardBtn);
    Laya.ClassUtils.regClass("Zhise.ExtraAwardBtn", ExtraAwardBtn);

    class Award2HomeBtn extends AwardBtn {

        constructor() {
            super();
        }

        onClick() {
            zs.laya.game.AppMain.autoStartNext = false;
            super.onClick();
        }
    }
    Laya.ILaya.regClass(Award2HomeBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.Award2HomeBtn", Award2HomeBtn);
    Laya.ClassUtils.regClass("Zhise.Award2HomeBtn", Award2HomeBtn);

    class Award2NextBtn extends AwardBtn {

        constructor() {
            super();
        }

        onClick() {
            zs.laya.game.AppMain.autoStartNext = true;
            super.onClick();
        }
    }
    Laya.ILaya.regClass(Award2NextBtn);
    Laya.ClassUtils.regClass("zs.laya.ui.Award2NextBtn", Award2NextBtn);
    Laya.ClassUtils.regClass("Zhise.Award2NextBtn", Award2NextBtn);

    class LoadingView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
        }

        onAwake() {
            super.onAwake();
            var middleUI = this.owner.getChildByName("middleUI");
            var loadingBar = middleUI.getChildByName("loadingBar");
            loadingBar.addComponent(LoadingBar);
        }
    }
    Laya.ILaya.regClass(LoadingView);
    Laya.ClassUtils.regClass("zs.laya.ui.LoadingView", LoadingView);
    Laya.ClassUtils.regClass("Zhise.LoadingView", LoadingView);

    class HomeView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.storeBtn = null;
            this.startBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            if (topUI) {
                this.storeBtn = topUI.getChildByName("storeBtn");
                this.startBtn = topUI.getChildByName("startBtn");
            }
            var middleUI = this.owner.getChildByName("middleUI");
            if (middleUI) {
                this.storeBtn = this.storeBtn || middleUI.getChildByName("storeBtn");
                this.startBtn = this.startBtn || middleUI.getChildByName("startBtn");
            }
            var bottomUI = this.owner.getChildByName("bottomUI");
            if (bottomUI) {
                this.storeBtn = this.storeBtn || bottomUI.getChildByName("storeBtn");
                this.startBtn = this.startBtn || bottomUI.getChildByName("startBtn");
            }
            var leftUI = this.owner.getChildByName("leftUI");
            if (leftUI) {
                this.storeBtn = this.storeBtn || leftUI.getChildByName("storeBtn");
            }
            var rightUI = this.owner.getChildByName("rightUI");
            if (rightUI) {
                this.storeBtn = this.storeBtn || rightUI.getChildByName("storeBtn");
            }

            this.storeBtn && this.storeBtn.addComponent(StoreBtn);
            this.startBtn && this.startBtn.addComponent(StartBtn);
        }
    }
    Laya.ILaya.regClass(HomeView);
    Laya.ClassUtils.regClass("zs.laya.ui.HomeView", HomeView);
    Laya.ClassUtils.regClass("Zhise.HomeView", HomeView);

    class ReliveView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.replayBox = null;
            this.jumpBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            if(topUI){
                this.replayBox = topUI.getChildByName("replayBox");
                this.jumpBtn = topUI.getChildByName("jumpByShareBtn");
            }
            var middleUI = this.owner.getChildByName("middleUI");
            if(middleUI){
                this.replayBox = this.replayBox || middleUI.getChildByName("replayBox");
                this.jumpBtn = this.jumpBtn || middleUI.getChildByName("jumpByShareBtn");
            }
            var bottomUI = this.owner.getChildByName("bottomUI");
            if(bottomUI){
                this.replayBox = this.replayBox || bottomUI.getChildByName("replayBox");
                this.jumpBtn = this.jumpBtn || bottomUI.getChildByName("jumpByShareBtn");
            }

            this.replayBox && this.replayBox.addComponent(ReplayBtn);
            this.jumpBtn && this.jumpBtn.addComponent(AwardBtn);
        }
    }
    Laya.ILaya.regClass(ReliveView);
    Laya.ClassUtils.regClass("zs.laya.ui.ReliveView", ReliveView);
    Laya.ClassUtils.regClass("Zhise.ReliveView", ReliveView);

    class WinView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.nextBtn = null;
            this.homeBtn = null;
        }

        onAwake() {
            super.onAwake();
            var topUI = this.owner.getChildByName("topUI");
            if(topUI){
                this.homeBtn = topUI.getChildByName("homeBtn");
                this.nextBtn = topUI.getChildByName("nextBtn");
            }
            var middleUI = this.owner.getChildByName("middleUI");
            if(middleUI){
                this.homeBtn = this.homeBtn || middleUI.getChildByName("homeBtn");
                this.nextBtn = this.nextBtn || middleUI.getChildByName("nextBtn");
            }
            var bottomUI = this.owner.getChildByName("bottomUI");
            if(bottomUI){
                this.homeBtn = this.homeBtn || bottomUI.getChildByName("homeBtn");
                this.nextBtn = this.nextBtn || bottomUI.getChildByName("nextBtn");
            }
            
            this.homeBtn && this.homeBtn.addComponent(Award2HomeBtn);
            this.nextBtn && this.nextBtn.addComponent(Award2NextBtn);
        }
    }
    Laya.ILaya.regClass(WinView);
    Laya.ClassUtils.regClass("zs.laya.ui.WinView", WinView);
    Laya.ClassUtils.regClass("Zhise.WinView", WinView);

    class MsgBoxView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.callback = null;
            this.content = null;
            this.confirmBtn = null;
        }

        initView(args) {
            super.initView(args);
            this.content.text = args.content;
            this.callback = args.callback;
        }

        onAwake() {
            super.onAwake();
            var middleUI = this.owner.getChildByName("middleUI");
            this.content = middleUI.getChildByName("content");
            this.confirmBtn = middleUI.getChildByName("confirmBtn");
            this.confirmBtn.on(Laya.Event.CLICK, this, this.onClickConfirm);
        }

        onDestroy() {
            this.confirmBtn.off(Laya.Event.CLICK, this, this.onClickConfirm);
        }

        onClickConfirm() {
            if (this.callback) {
                this.callback.run();
                this.callback = null;
            }
            this.owner.close();
            Laya.SoundManager.playSound(zs.laya.game.AppMain.appConfig.soundClick);
        }
    }
    Laya.ILaya.regClass(MsgBoxView);
    Laya.ClassUtils.regClass("zs.laya.ui.MsgBoxView", MsgBoxView);
    Laya.ClassUtils.regClass("Zhise.MsgBoxView", MsgBoxView);


    class StoreItemState{
        constructor() {
        }
    }
    StoreItemState.LOCK = 0; //道具未解锁
    StoreItemState.UNLOCK = 1;//道具已解锁
    StoreItemState.USE = 2; //正在使用中
    Laya.ILaya.regClass(StoreItemState);
    Laya.ClassUtils.regClass("zs.laya.ui.StoreItemState", StoreItemState);
    Laya.ClassUtils.regClass("Zhise.StoreItemState", StoreItemState);

    class StorePage extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.goldNumLabel = null;
            this.closeBtn = null;
            this.typeTab = null;
            this.pageList = null;
            this.goodsList = null;
            this.prePageBtn = null;
            this.nextPageBtn = null;
            this.goldUnlockBtn = null;
            this.videoUnlockBtn = null;

            this.buyOrUseCd = false;
            this.selectItemType = 0; //商品类型
            this.selectItemIdx = -1;

            this.storeItemsDic = null; //商店配置数据
        }

        onEnable(){
            super.onEnable();
            Laya.stage.on(zs.laya.game.EventId.STORECFG_UPDATE,this,this.onUpdateStorePage);
        }

        onDisable(){
            super.onDisable();
            Laya.stage.off(zs.laya.game.EventId.STORECFG_UPDATE,this,this.onUpdateStorePage);

            this.closeBtn.off(Laya.Event.CLICK, this, this.closeStore);
            this.goldUnlockBtn && this.goldUnlockBtn.off(Laya.Event.CLICK, this, this.unlockItemByGold);
            this.videoUnlockBtn && this.videoUnlockBtn.off(Laya.Event.CLICK, this, this.unlockItemByVideo);
            this.prePageBtn && this.prePageBtn.off(Laya.Event.CLICK, this, this.prePage);
            this.nextPageBtn && this.nextPageBtn.off(Laya.Event.CLICK, this, this.nextPage);
        }

        onStart() {
            super.onStart();
            var topUI = this.owner.getChildByName("topUI");
            this.goldNumLabel = topUI.getChildByName("goldNum");
            this.closeBtn = topUI.getChildByName("closeBtn");
            var middleUI = this.owner.getChildByName("middleUI");
            if (!this.closeBtn) {
                this.closeBtn = middleUI.getChildByName("closeBtn");
            }
            this.prePageBtn = middleUI.getChildByName("prePageBtn");
            this.nextPageBtn = middleUI.getChildByName("nextPageBtn");
            this.typeTab = middleUI.getChildByName("typeTab");
            this.pageList = middleUI.getChildByName("pageList");
            this.goodsList = middleUI.getChildByName("goodsList");
            this.goldUnlockBtn = middleUI.getChildByName("goldUnlockBtn");
            this.videoUnlockBtn = middleUI.getChildByName("videoUnlockBtn");

            this.closeBtn.on(Laya.Event.CLICK, this, this.closeStore);
            
            this.prePageBtn && this.prePageBtn.on(Laya.Event.CLICK, this, this.prePage);
            this.nextPageBtn && this.nextPageBtn.on(Laya.Event.CLICK, this, this.nextPage);
            
            this.goldNumLabel.text = zs.laya.game.AppMain.playerInfo.gold.toString();
            this.typeTab.selectHandler = Laya.Handler.create(this, this.onSwitchType, null, false);
            this.typeTab.selectedIndex = 0;

            this.goodsList.renderHandler = Laya.Handler.create(this, this.onRenderItem, null, false);
            this.goodsList.selectHandler = Laya.Handler.create(this, this.onSelectItem, null, false);
            this.goodsList.hScrollBarSkin = "";
            this.goodsList.scrollBar.changeHandler = Laya.Handler.create(this, this.onScrollChanged, null, false);

            if(this.pageList){
                this.pageList.renderHandler = Laya.Handler.create(this, this.onRenderPageTag, null, false);
            }

            if(this.goldUnlockBtn){
                this.goldUnlockBtn.on(Laya.Event.CLICK, this, this.unlockItemByGold);
                this.goldUnlockBtn.visible = false;
            }
            if(this.videoUnlockBtn){
                this.videoUnlockBtn.on(Laya.Event.CLICK, this, this.unlockItemByVideo);
                this.videoUnlockBtn.visible = false;
            }

            this.onUpdateStorePage();
        }

        onUpdateStorePage(){
            if(zs.laya.game.AppMain.storeItemsDic){
                this.storeItemsDic = zs.laya.game.AppMain.storeItemsDic;
                this.onSwitchType(this.typeTab.selectedIndex);    
            }
        }

        onSwitchType(type) {
            if (type == -1) {
                return;
            }
            var tabTypeArr = this.storeItemsDic[type];
            var pageSize = this.goodsList.repeatY * this.goodsList.repeatX;
            this.totalPage = Math.ceil(tabTypeArr.length/pageSize);
            //如果有翻页按钮,则补齐最后一页的数据
            if(this.nextPageBtn){
                var emptyCellNum = pageSize - (tabTypeArr.length%pageSize);
                for(var index = 0;emptyCellNum < pageSize && index < emptyCellNum; index++){
                    tabTypeArr.push(null);
                }
            }
            this.goodsList.array = tabTypeArr;
            this.goodsList.selectedIndex = -1;
            this.goodsList.scrollTo(0);
            this.goodsList.page = 0;

            if (this.totalPage > 1) {
                this.nextPageBtn && (this.nextPageBtn.visible = true);
            }else {
                this.nextPageBtn && (this.nextPageBtn.visible = false);
            }

            this.prePageBtn && (this.prePageBtn.visible = false);
            if(this.pageList){
                var arr = [];
                for (var index = 0; index < this.totalPage; index++) {
                    arr.push(index);
                }
                this.pageList.array = arr;
                this.pageList.selectedIndex = this.goodsList.page;
            }
            Laya.stage.event(zs.laya.game.EventId.STORE_SWITCH_TAB, type);
        }

        prePage() {
            if(this.goodsList.page > 0){
                var newPage = this.goodsList.page - 1;
                this.prePageBtn && (this.prePageBtn.visible = (newPage > 0));
                this.nextPageBtn && (this.nextPageBtn.visible = (newPage < (this.totalPage-1)));

                this.goodsList.scrollTo(newPage * this.goodsList.repeatX * this.goodsList.repeatY);
                this.goodsList.page = newPage;
                if(this.pageList){
                    this.pageList.selectedIndex = this.goodsList.page;
                }
            }
        }

        nextPage() {
            if(this.goodsList.page < (this.totalPage - 1)){
                var newPage = this.goodsList.page + 1;
                this.prePageBtn && (this.prePageBtn.visible = (newPage > 0));
                this.nextPageBtn && (this.nextPageBtn.visible = (newPage < (this.totalPage-1)));

                this.goodsList.scrollTo(newPage * this.goodsList.repeatX * this.goodsList.repeatY);
                this.goodsList.page = newPage;

                if(this.pageList){
                    this.pageList.selectedIndex = this.goodsList.page;
                }
            }  
        }

        /**金币解锁道具 */
        unlockItemByGold() {
            var goodItemData = this.goodsList.array[this.goodsList.selectedIndex];
            if(!zs.laya.game.AppMain.playerInfo.goods_ids){
                console.log("************** error playerInfo no have goods_ids");
                return ;
            }
            
            if (this.goldUnlockBtn.gray) {
                zs.laya.game.UIService.showToast("当前金币不足！");
                return
            }

            var currentUseArr = zs.laya.game.AppMain.playerInfo.goods_id;
            if(currentUseArr){
                var oldGoodsID = currentUseArr[goodItemData.goods_type];
                for(var i = 0;i<this.goodsList.array.length;i++){
                    if(this.goodsList.array[i] && this.goodsList.array[i].goods_id == oldGoodsID){
                        var oldGoodsData = this.goodsList.array[i];
                        oldGoodsData.status = StoreItemState.UNLOCK;
                        oldGoodsData.time = Date.now();
                        console.log(oldGoodsID + "  将原使用的道具设置为解锁：" + oldGoodsData.goods_id);
                        this.goodsList.setItem(i, oldGoodsData);
                        break;
                    }
                }
            }

            goodItemData.status = StoreItemState.USE;
            this.goodsList.setItem(this.goodsList.selectedIndex, goodItemData);

            zs.laya.game.WebService.requestUnlockGoodsByGold({ goods_type: goodItemData.goods_type, goods_id: goodItemData.goods_id, gold: goodItemData.gold });

            this.goldUnlockBtn && (this.goldUnlockBtn.visible = false);

            Laya.stage.event(zs.laya.game.EventId.STORE_ITEM_UNLOCKED,[goodItemData]);
            Laya.stage.event(zs.laya.game.EventId.STORE_USE_ITEM,[goodItemData]);
        }

        /**视频解锁道具 */
        unlockItemByVideo() {
            if (this.buyOrUseCd) {
                return;
            }
            if (this.videoUnlockBtn.gray) {
                // zs.laya.game.UIService.showToast("当前金币不足！");
                return
            }
            this.buyOrUseCd = true;
            var goodItemData = this.goodsList.array[this.goodsList.selectedIndex];
            zs.laya.sdk.SdkService.playVideo(
                Laya.Handler.create(this, function (){
                    this.buyOrUseCd = false;
                    if(goodItemData.video_num){
                        goodItemData.video_now += 1;
                        this.goodsList.setItem(this.goodsList.selectedIndex, goodItemData);
                    }
                   
                    if(!zs.laya.game.AppMain.playerInfo.goods_ids){
                        console.log("************** error playerInfo no have goods_ids");
                        return ;
                    }
                     //如果有视频次数，还没有达到解锁条件，则返回
                     var unlock = !goodItemData.video_num || goodItemData.video_num && goodItemData.video_now >= goodItemData.video_num;
                     if(unlock){
                        var currentUseArr = zs.laya.game.AppMain.playerInfo.goods_id;
                        if(currentUseArr){
                            var oldGoodsID = currentUseArr[goodItemData.goods_type];
                            for(var i = 0;i<this.goodsList.array.length;i++){
                                if(this.goodsList.array[i] && this.goodsList.array[i].goods_id == oldGoodsID){
                                    var oldGoodsData = this.goodsList.array[i];
                                    oldGoodsData.status = StoreItemState.UNLOCK;
                                    oldGoodsData.time = Date.now();
                                    console.log(oldGoodsID + "  将原使用的道具设置为解锁：" + oldGoodsData.goods_id);
                                    this.goodsList.setItem(i, oldGoodsData);
                                    break;
                                }
                            }
                        }

                        goodItemData.status = StoreItemState.USE;
                        this.goodsList.setItem(this.goodsList.selectedIndex, goodItemData);
                    }
                    
                    zs.laya.game.WebService.requestUnlockGoodsByVideo({ goods_type: goodItemData.goods_type, goods_id: goodItemData.goods_id,isUnlock:unlock});
                    if(unlock){
                        Laya.stage.event(zs.laya.game.EventId.STORE_ITEM_UNLOCKED,[goodItemData]);
                        Laya.stage.event(zs.laya.game.EventId.STORE_USE_ITEM,[goodItemData]);
                        this.videoUnlockBtn && (this.videoUnlockBtn.visible = false);
                    }
                }),
                Laya.Handler.create(this,function (){
                    this.buyOrUseCd = false;
                }),
                Laya.Handler.create(this,function (){
                    // zs.laya.game.UIService.showToast("今日视频观看次数已用尽");
                    this.buyOrUseCd = false;
                })
            );
        }
        
        onSelectItem(index) {
            console.log("SelectItem:" + index);
            var goodsData = this.goodsList.array[index];
            if(!goodsData){
                return;
            }

            this.selectItemIdx = index;
            this.selectItemType = goodsData.goods_type;

            if (goodsData.status == StoreItemState.UNLOCK) {
                // 正在使用的，修改为解锁的状态
                var currentUseArr = zs.laya.game.AppMain.playerInfo.goods_id;
                if(currentUseArr){
                    var oldGoodsID = currentUseArr[goodsData.goods_type];
                    for(var i = 0;i<this.goodsList.array.length;i++){
                        if(this.goodsList.array[i] && this.goodsList.array[i].goods_id == oldGoodsID){
                            var oldGoodsData = this.goodsList.array[i];
                            oldGoodsData.status = StoreItemState.UNLOCK;
                            this.goodsList.setItem(i, oldGoodsData);
                            break;
                        }
                    }
                }
                goodsData.status = StoreItemState.USE;
                
                zs.laya.game.WebService.requestEquipItem({goods_type: goodsData.goods_type, goods_id: goodsData.goods_id});
                Laya.stage.event(zs.laya.game.EventId.STORE_USE_ITEM, [goodsData]);
                
                this.goldUnlockBtn && (this.goldUnlockBtn.visible = false);
                this.videoUnlockBtn && (this.videoUnlockBtn.visible = false);
            }
            else if (goodsData.status == StoreItemState.LOCK) {
                // 购买
                if (goodsData.buy_type == 2) {
                    if(this.goldUnlockBtn){
                        this.goldUnlockBtn.visible = true;
                        this.goldUnlockBtn.getChildByName("price").text = goodsData.gold.toString();
                        this.goldUnlockBtn.gray = goodsData.gold > zs.laya.game.AppMain.playerInfo.gold;
                    }
                    
                    this.videoUnlockBtn && (this.videoUnlockBtn.visible = false);
                    
                }else if (goodsData.buy_type == 3){
                    this.goldUnlockBtn && (this.goldUnlockBtn.visible = false);
                    if(this.videoUnlockBtn){
                        this.videoUnlockBtn.visible = true;
                        zs.laya.sdk.SdkService.isVideoEnable(()=>{
                            this.videoUnlockBtn.gray = false;
                        },()=>{
                            this.videoUnlockBtn.gray = true;
                        });
                        // this.videoUnlockBtn.gray = !zs.laya.sdk.SdkService.isVideoEnable();
                    }
                }
            }
            else {
                this.goldUnlockBtn && (this.goldUnlockBtn.visible = false);
                this.videoUnlockBtn && (this.videoUnlockBtn.visible = false);
            }
            this.goodsList.setItem(this.selectItemIdx, goodsData);
        }

        onRenderItem(item, index) {
            var goodsData = this.goodsList.array[index];
            if (goodsData == null) {
                item.getChildByName("bg").index = 0;
                item.getChildByName("jumpTag").visible = false;
                item.getChildByName("icon").visible = false;
                return ;
            }
            
            if (goodsData.status == StoreItemState.LOCK) {
                item.getChildByName("bg").index = 1;
            }
            else if (goodsData.status == StoreItemState.USE) {
                item.getChildByName("bg").index = 2;
            }
            else {
                item.getChildByName("bg").index = 0;
            }
            if (this.selectItemType == goodsData.goods_type && this.selectItemIdx == index) {
                item.getChildByName("jumpTag").visible = true;
            }
            else {
                item.getChildByName("jumpTag").visible = false;
            }
            item.getChildByName("icon").visible = true;
            item.getChildByName("icon").skin = zs.laya.game.AppMain.appConfig.storeCfg.typeMap[goodsData.goods_type] + goodsData.goods_icon + ".png";
        }

        onRenderPageTag(item, pageIdx) {
            item.index = pageIdx == this.pageList.selectedIndex ? 1 : 0;
        }

        onScrollChanged(val) {
            if (this.goodsList.array == null) {
                return ;
            }
            var curPage = Math.floor(this.goodsList.startIndex / this.goodsList.repeatX);

            this.prePageBtn && (this.prePageBtn.visible = (curPage > 0));
            this.nextPageBtn && (this.nextPageBtn.visible = (curPage < (this.totalPage-1)));

            this.pageList && (this.pageList.selectedIndex = curPage);
        }

        closeStore() {
            this.owner.close();
        }
    }
    Laya.ILaya.regClass(StorePage);
    Laya.ClassUtils.regClass("zs.laya.ui.StorePage", StorePage);
    Laya.ClassUtils.regClass("Zhise.StorePage", StorePage);

    /**
     * 试用界面
     */
    class SampleSackView extends zs.laya.base.ZhiSeView {

        constructor() {
            super();
            this.goodsIcon = null;
            this.tryoutBtn = null;
            this.passBtn = null;
            this.selectBg = null;
            this.select = null;

            this.selectGoods = null;
            this.isSelectVideo = true;
        }

        onAwake() {
            super.onAwake();
            var middleUI = this.owner.getChildByName("middleUI");
            if(middleUI){
                this.goodsIcon = middleUI.getChildByName("icon");
                this.tryoutBtn = middleUI.getChildByName("tryoutBtn");
                this.passBtn = middleUI.getChildByName("passBtn");
                this.selectBg = middleUI.getChildByName("selectBg");
                this.select = middleUI.getChildByName("select");
            }
            var bottomUI = this.owner.getChildByName("bottomUI");
            if(bottomUI){
                this.tryoutBtn = this.tryoutBtn || bottomUI.getChildByName("tryoutBtn");
                this.passBtn = this.passBtn || bottomUI.getChildByName("passBtn");
                this.selectBg = this.selectBg || bottomUI.getChildByName("selectBg");
                this.select = this.select || bottomUI.getChildByName("select");
            }
            
        }

        onEnable(){
            super.onEnable();
            this.tryoutBtn.mouseEnabled = true;
            this.passBtn.mouseEnabled = true;
            this.passBtn && this.passBtn.on(Laya.Event.CLICK,this,this.onClose);
            this.tryoutBtn && this.tryoutBtn.on(Laya.Event.CLICK,this,this.onVideoHandler);
            

            this.isSelectVideo = true;
            if(zs.laya.platform.ADConfig.zs_more_reward_swich){
                this.selectBg && (this.selectBg.visible = true);
                this.select && (this.select.visible = this.isSelectVideo);
                this.selectBg && this.selectBg.on(Laya.Event.CLICK,this,this.onSelectHandler);
                this.tryoutBtn.index = 1;

            }else{
                this.selectBg && (this.selectBg.visible = false);
                this.select && (this.select.visible = false);
                this.tryoutBtn.index = 0;
            }
            Laya.stage.on(zs.laya.game.EventId.STORECFG_UPDATE,this,this.onRandomSelect);
            this.onRandomSelect();
        }

        onDisable(){
            super.onDisable();
            this.passBtn && this.passBtn.off(Laya.Event.CLICK,this,this.onClose);
            this.tryoutBtn && this.tryoutBtn.off(Laya.Event.CLICK,this,this.onVideoHandler);
            
            if(zs.laya.platform.ADConfig.zs_more_reward_swich){
                this.selectBg && this.selectBg.off(Laya.Event.CLICK,this,this.onSelectHandler);
            }
            Laya.stage.off(zs.laya.game.EventId.STORECFG_UPDATE,this,this.onRandomSelect);
        }

        /**随机选择 */
        onRandomSelect(){
            if(!zs.laya.game.AppMain.storeItemsDic){
                return;
            }
            var storeItemsDic = zs.laya.game.AppMain.storeItemsDic;
            this.randomArr = [];
            var bagArr = zs.laya.game.AppMain.playerInfo.goods_ids;
            var hasArr;
            for(var key in storeItemsDic){
                var itemsArr = storeItemsDic[key];
                for(var i = 0;i<itemsArr.length;i++){
                    var element = itemsArr[i];
                    if (element) {
                        if(bagArr[element.goods_type]){
                            hasArr = bagArr[element.goods_type];
                            if(hasArr.indexOf(element.goods_id) < 0 && element.is_push){
                                this.randomArr.push(element);
                            }  
                        }else{
                            if(element.is_push){
                                this.randomArr.push(element);
                            }
                        }
                    }
                }
            }

            if(this.randomArr.length == 0){
                this.onClose();
            }else{
                var randomIndex = Math.floor(this.randomArr.length*Math.random());
                this.selectGoods = this.randomArr[randomIndex];
                if(this.goodsIcon){
                    this.goodsIcon.skin = zs.laya.game.AppMain.appConfig.storeCfg.typeMap[this.selectGoods.goods_type] + this.selectGoods.goods_icon + ".png";
                }
            }
        }

        onSelectHandler(){
            this.isSelectVideo = !this.isSelectVideo;
            this.select && (this.select.visible = this.isSelectVideo);
        }

        //修改正在使用的道具id
        onVideoHandler(){
            this.tryoutBtn.mouseEnabled = false;
            this.passBtn.mouseEnabled = false;

            if(zs.laya.platform.ADConfig.zs_more_reward_swich){
                if(this.isSelectVideo){
                    this.playVideo();
                }else{
                    this.onClose();
                }
            }else{
                this.playVideo();
            }
        }

        playVideo(){
            zs.laya.SdkService.playVideo(Laya.Handler.create(this, function () {
                this.tryoutBtn.mouseEnabled = true;
                this.passBtn.mouseEnabled = true;
                zs.laya.game.WebService.requestUnlockGoodsByVideo({ goods_type: this.selectGoods.goods_type, goods_id: this.selectGoods.goods_id,isUnlock:unlock});
                Laya.stage.event(zs.laya.game.EventId.STORE_ITEM_UNLOCKED,[this.selectGoods]);
                Laya.stage.event(zs.laya.game.EventId.STORE_USE_ITEM,[this.selectGoods]);
                this.onClose();
            }), Laya.Handler.create(this, function () {
                this.tryoutBtn.mouseEnabled = true;
                this.passBtn.mouseEnabled = true;
            }), Laya.Handler.create(this, function () {
                // Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, "视频观看次数已用完");
            }));
        }

        onClose(){
            this.owner.close();
        }
    }
    Laya.ILaya.regClass(SampleSackView);
    Laya.ClassUtils.regClass("zs.laya.ui.SampleSackView", SampleSackView);
    Laya.ClassUtils.regClass("Zhise.SampleSackView", SampleSackView);

    /**
     * 推送界面
     */
    class PushView extends  SampleSackView{
        //修改正在使用的道具id
        playVideo(){
            zs.laya.SdkService.playVideo(Laya.Handler.create(this, function () {
                this.tryoutBtn.mouseEnabled = true;
                this.passBtn.mouseEnabled = true;
                Laya.stage.event(zs.laya.game.EventId.STORE_USE_ITEM,[this.selectGoods]);
                this.onClose();
            }), Laya.Handler.create(this, function () {
                this.tryoutBtn.mouseEnabled = true;
                this.passBtn.mouseEnabled = true;
            }), Laya.Handler.create(this, function () {
                // Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, "视频观看次数已用完");
            }));
        }
    }
    Laya.ILaya.regClass(PushView);
    Laya.ClassUtils.regClass("zs.laya.ui.PushView", PushView);
    Laya.ClassUtils.regClass("Zhise.PushView", PushView);

    /**
     * 幸运宝箱界面
     */

    class TreasureView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.bSelectVideo = true;
            this.keyNum = 3;
            this.rewardArr = [];
            this.selectArr = [];
            this.bAddKey = false;
        }

        onEnable() {
            super.onEnable();
        }
    
        onDisable() {
            super.onDisable();
            this.backBtn&&this.backBtn.off(Laya.Event.CLICK, this, this.onBackHandler);
            this.btnGetReward&&this.btnGetReward.off(Laya.Event.CLICK, this, this.onGetKeyHandler);
        }

        initView(data) {
            this.initUI();
            this.initEvent();
            this.keyNum = 3;
            this.selectArr = [];
            let luckBoxArr = data;
            if (!luckBoxArr) {
                console.error("no luckbox config!! please check !",luckBoxArr);
                return this.onBackHandler();
            }
            let randomIndex;
            let posArr = [];
            for (let i = 0; i < luckBoxArr.length; i++) {
                posArr.push(i);
            }
            this.rewardArr = [];
            let cfg;
            for (let i = 0; i < luckBoxArr.length; i++) {
                randomIndex = Math.floor(Math.random() * posArr.length);
                let index = posArr[randomIndex];
                posArr.splice(randomIndex, 1);
                cfg = luckBoxArr[index];
                this.rewardArr.push(cfg);
            }
            this.boxList.array = this.rewardArr;
            this.updateUI();
        }
    
        onSwithSelect() {
            this.bSelectVideo = !this.bSelectVideo;
            this.updateUI();
        }
    
        initUI() {
            var middleUI = this.owner.getChildByName("middleUI");
            if (middleUI) {
                this.backBtn = middleUI.getChildByName("backBtn");
                this.boxList = middleUI.getChildByName("boxList");
                this.keyBox = middleUI.getChildByName("boxKey");
                this.videoBox = middleUI.getChildByName("videoBox");
                this.lblCurKey = this.keyBox.getChildByName("lblCurKey");
                this.videoCheck = this.videoBox.getChildByName("videoCheck");
                this.btnGetReward = this.videoBox.getChildByName("btnGetReward");
            }
        }

        initEvent() {
            this.backBtn&&this.backBtn.on(Laya.Event.CLICK, this, this.onBackHandler);
            this.btnGetReward&&this.btnGetReward.on(Laya.Event.CLICK, this, this.onGetKeyHandler);
            this.videoCheck&&this.videoCheck.on(Laya.Event.CLICK, this, this.onSwithSelect);
            if (this.boxList){
                this.boxList.selectEnable = true;
                this.boxList.selectHandler = Laya.Handler.create(this, this.boxSelectHandler, null, false);
                this.boxList.renderHandler = Laya.Handler.create(this, this.boxRenderHandler, null, false);
            }
        }

        updateUI() {
            this.updateSwitchBox();
            this.updateBoxVisible();
            this.updateKeyNum();
        }
    
        updateSwitchBox() {
            this.videoCheck.selected = this.bSelectVideo;
        }
    
        updateBoxVisible() {
            var bShowVideo = this.keyNum <= 0;
            this.keyBox.visible = !bShowVideo;
            this.videoBox.visible = bShowVideo && !this.bAddKey;
        }
    
        updateKeyNum() {
            this.lblCurKey.text = this.keyNum.toString();
        }

        boxSelectHandler(index) {
            let cell = this.boxList.getCell(index);
            let cfg = this.rewardArr[index];
            if (!cfg) return;
            this.boxList.selectedIndex = -1;
            if (cfg.unlocking_mode == 1) {
                if (this.keyNum <= 0) {
                    Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, "钥匙不足");
                    return;
                }
                this.keyNum--;
                cell.getChildByName("lock").visible = false;
                cell.getChildByName("rewordBox").visible = true;
                cell.mouseEnabled = false;
                this.selectArr.push(index);
                console.log("gold num is :", cfg.reward_num)
                this.addCoin(cfg.reward_num);
            } else {
                this.boxList.mouseEnabled = false;
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    this.boxList.mouseEnabled = true;
                    cell.getChildByName("lock").visible = false;
                    cell.getChildByName("rewordBox").visible = true;
                    cell.mouseEnabled = false;
                    this.selectArr.push(index);
                    this.addCoin(cfg.reward_num);
                }), Laya.Handler.create(this, function () {
                    this.boxList.mouseEnabled = true;
                }), Laya.Handler.create(this, function () {
                    this.boxList.mouseEnabled = true;
                    // Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, "视频观看次数已用完");
                }));
            }
            this.boxList.refresh();
            this.updateUI();
        }
    
        addCoin(addCoin) {
            zs.laya.game.AppMain.playerInfo.gold += Number(addCoin);
            zs.laya.game.WebService.updatePlayerInfo({
                gold: zs.laya.game.AppMain.playerInfo.gold
            });
            Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, `获得${addCoin}金币`);
        }
    
        boxRenderHandler(cell, index) {
            let lockImg = (cell.getChildByName("lock"));
            lockImg.visible = true;
            let cfg = this.rewardArr[index];
            //钥匙解锁
            var videoImg = lockImg.getChildByName("video") ;
            videoImg.visible = cfg.unlocking_mode != 1;
            let rewardBox = cell.getChildByName("rewordBox") ;
            (rewardBox.getChildByName("goldLabel")).text = cfg.reward_num;
            if (this.selectArr.indexOf(index) >= 0) {
                lockImg.visible = false;
                rewardBox.visible = true;
            } else {
                rewardBox.visible = false;
            }
        }
    
        onBackHandler() {
            this.owner.destroy();
        }
    
        onGetKeyHandler() {
            if (this.bSelectVideo) {
                // this.btnGetReward.mouseEnabled = false;
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    this.keyNum = 3;
                    this.bAddKey = true;
                    this.updateUI();
                }), Laya.Handler.create(this, function () {
                    // this.btnGetReward.mouseEnabled = true;
                }), Laya.Handler.create(this, function () {
                    // Laya.stage.event(zs.laya.game.EventId.UI_TOAST_MESSAGE, "视频观看次数已用完");
                }));
            } else {
                this.onBackHandler();
            }
    
        }
    }


    exports.LoadingBar = LoadingBar;
    exports.MsgBoxComp = MsgBoxComp;
    exports.StartBtn = StartBtn;
    exports.StoreBtn = StoreBtn;
    exports.ReplayBtn = ReplayBtn;
    exports.AwardBtn = AwardBtn;
    exports.ExtraAwardBtn = ExtraAwardBtn;
    exports.Award2HomeBtn = Award2HomeBtn;
    exports.Award2NextBtn = Award2NextBtn;

    exports.MsgBoxView = MsgBoxView;
    exports.LoadingView = LoadingView;
    exports.HomeView = HomeView;
    exports.ReliveView = ReliveView;
    exports.WinView = WinView;
    exports.StorePage = StorePage;

    exports.SampleSackView = SampleSackView;
    exports.PushView = PushView;
    exports.TreasureView = TreasureView;
    exports.StoreItemState = StoreItemState;
}(window.zs.laya.ui = window.zs.laya.ui || {}, Laya));