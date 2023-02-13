(function () {
    'use strict';

    class FlashLight extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
            this.light = this.owner.getChildByName("light");
            this.hot = this.owner.getChildByName("hot");
            this.parent = this.owner.parent;
            if (!parent)
                return;
            this.light.width = 237 * this.parent.width / 204;
            this.light.height = 320 / 237 * this.light.width;
            Laya.timer.loop(2000, this, this.checkFlash);
            this.hot.visible = false;
            if (this.hideHot)
                return;
            this.hot.width = 91 * this.parent.width / 204;
            this.hot.height = 42 / 91 * this.hot.width;
            this.hot.pos(this.parent.width - this.hot.width / 2 * 1.2, this.hot.height / 2 * 1.2);
            let r = (Math.random() < 0.3333) || this.isSingle;
            this.hot.visible = r;
            this.tweenHot();
        }
        checkFlash() {
            let r = (Math.random() < 0.3333) || this.isSingle;
            this.light.pos(-this.parent.width * 0.2, -this.parent.height * 0.2);
            if (r) {
                Laya.Tween.to(this.light, { x: this.parent.width / 2, y: this.parent.height / 2 }, 300, Laya.Ease.quadInOut, Laya.Handler.create(this, function () {
                    Laya.Tween.to(this.light, { x: this.parent.width * 1.2, y: this.parent.height * 1.2 }, 300, Laya.Ease.quadIn);
                }));
            }
        }
        onDisable() {
            Laya.timer.clear(this, this.checkFlash);
            Laya.Tween.clearAll(this);
        }
        tweenHot() {
            this.hot.scale(1, 1);
            Laya.Tween.to(this.hot, { scaleX: 1.2, scaleY: 1.2 }, 300, null, Laya.Handler.create(this, function () {
                Laya.Tween.to(this.hot, { scaleX: 1, scaleY: 1 }, 300, null, Laya.Handler.create(this, this.tweenHot));
            }));
        }
    }

    class UserData {
        constructor() {
            this.jsonData = null;
        }
        init() {
            Laya.loader.load("config/nickname.json", Laya.Handler.create(this, function (json) {
                this.jsonData = [];
                for (let i = 0; i < json.length; i++) {
                    this.jsonData.push(new Player(json[i]));
                }
            }));
        }
        get randowData() {
            if (!this.jsonData)
                return;
            let r = Math.floor(Math.random() * this.jsonData.length);
            return this.jsonData[r];
        }
    }
    UserData.Instance = new UserData();
    class Player {
        constructor(data) {
            this.avatar = data.avatar;
            this.nickname = data.nickname;
        }
    }

    class ChallengPage extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
        }
        onAwake() {
            super.onAwake();
        }
        onStart() {
            super.onStart();
            this.owner["visible"] = false;
            let s = this;
            zs.laya.sdk.ZSReportSdk.loadAd(function (data) {
                var adData = data["promotion"];
                adData = adData.filter(function (elment) {
                    return Laya.Browser.onAndroid || (elment.appid != "wx48820730357d81a6" && elment.appid != "wxc136d75bfc63107c");
                });
                s.adData = adData[Math.floor(Math.random() * adData.length)];
                s.initUI();
            });
        }
        initUI() {
            this.owner["visible"] = true;
            let player = UserData.Instance.randowData;
            this.lab_name.text = player.nickname;
            this.lab_invite.text = '您的好友"' + this.getName(player.nickname) + '"向您发起挑战:';
            this.lab_appName.text = this.adData.app_title;
            this.img_avater.skin = player.avatar;
            this.img_icon.skin = this.adData.app_icon;
            this.btn_suc.on(Laya.Event.CLICK, this, this.onSucClick);
            this.btn_fail.on(Laya.Event.CLICK, this, this.closeView);
        }
        getName(str) {
            if (str.length > 7) {
                str = str.substring(0, 6) + "...";
            }
            return str;
        }
        onSucClick() {
            this.owner.close();
            zs.laya.sdk.ZSReportSdk.navigate2Mini(this.adData, zs.laya.game.AppMain.playerInfo.user_id, function () {
                Laya.stage.event(zs.laya.game.EventId.APP_JUMP_SUCCESS);
            }, function () {
                Laya.stage.event(zs.laya.game.EventId.APP_JUMP_CANCEL);
            }, function () {
            });
        }
        closeView() {
            this.owner.close();
        }
    }

    class FrienPlayView extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.listScr = null;
        }
        onAwake() {
            super.onAwake();
            this.adList.dataSource = [];
            let dataSource = [];
            for (let i = 0; i < 3; i++) {
                let data = {
                    avater_1: { skin: UserData.Instance.randowData.avatar },
                    user: { text: UserData.Instance.randowData.nickname }
                };
                dataSource.push(data);
            }
            this.adList.dataSource = dataSource;
            this.btn_close.on(Laya.Event.CLICK, this, this.closeView);
        }
        onStart() {
            this.listScr = this.adList.addComponent(zs.laya.platform.AdList);
            this.listScr.requestAdData("promotion", false, 0, null, 3);
            Laya.timer.loop(3000, this, this.loopChange);
        }
        loopChange() {
            this.listScr.requestAdData("promotion", false, 0, null, 3);
        }
        onDisable() {
            super.onDisable();
            this.btn_close.on(Laya.Event.CLICK, this, this.closeView);
        }
        closeView() {
            this.owner.close();
        }
    }

    class ButtonAnim extends Laya.Script {
        constructor() {
            super();
            this.initX = 1;
            this.initY = 1;
        }
        onAwake() {
            this.initX = this.owner.scaleX == null ? 1 : this.owner.scaleX;
            this.initY = this.owner.scaleY == null ? 1 : this.owner.scaleY;
            this.initX = this.initX ? this.initX : 0.7;
            this.initY = this.initY ? this.initY : 0.7;
            this.owner.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
            this.owner.on(Laya.Event.MOUSE_UP, this, this.onUp);
            this.owner.on(Laya.Event.MOUSE_OUT, this, this.onUp);
        }
        onDisable() {
            this.owner.offAll();
            Laya.Tween.clearAll(this);
        }
        onDown() {
            Laya.Tween.to(this.owner, { scaleX: this.initX - 0.2, scaleY: this.initY - 0.2 }, 100);
        }
        onUp() {
            Laya.Tween.to(this.owner, { scaleX: this.initX, scaleY: this.initY }, 100);
        }
    }

    class UserComData {
        static RefreshGiftData(index) {
            this.GiftData = {
                gold: 0,
                diamond: 0
            };
            if (index == 3) {
                this.GiftData.gold = 500;
                this.GiftData.diamond = 10;
            }
            else if (index == 4) {
                this.GiftData.gold = 512;
            }
            else if (index == 5) {
                this.GiftData.gold = 2048;
            }
            else if (index == 6) {
                this.GiftData.gold = 512;
                this.GiftData.diamond = 98;
            }
            else if (index == 7) {
                this.GiftData.gold = 1024;
                this.GiftData.diamond = 328;
            }
            else if (index == 8) {
                this.GiftData.gold = 2048;
                this.GiftData.diamond = 648;
            }
        }
    }
    UserComData.MoveSpeed = 10;
    UserComData.RunSpeed = 1;
    UserComData.MaxRotationY = 30;
    UserComData.normalRotationSpeed = 12;
    UserComData.range_attack = 10;
    UserComData.move_stand = 0.2;
    UserComData.move_random = 0.3;
    UserComData.move_player = 0.5;
    UserComData.check_time = 5;
    UserComData.SpeedFactor = 2;
    UserComData.BossSpeedFactor = 2.5;
    UserComData.userLevel = 1;
    UserComData.MaxLevel = 1;
    UserComData.curBlood = 3;
    UserComData.AlphaObjList = {};
    UserComData.isPass = 2;
    UserComData.GameCount = 0;
    UserComData.GameColor = 0;
    UserComData.MoveId = -1;
    UserComData.RotateId = -1;
    UserComData.nickName = "玩家";
    UserComData.gender = 0;
    UserComData.avatarUrl = "";
    UserComData.PlayerInit = {
        pos: new Laya.Vector3(0, 0, 0),
        euler: new Laya.Vector3(0, 0, 0)
    };
    UserComData.userGold = 0;
    UserComData.userDiamond = 0;
    UserComData.isClickUI = false;
    UserComData.curPlayTime = 90;
    UserComData.curPlayTimeList = [];
    UserComData.ChangeItemTime = 10;
    UserComData.BossDelayTime = 30;
    UserComData.curOutTime = 0;
    UserComData.startGameTime = 0;
    UserComData.AttackTime = 0;
    UserComData.HaveWh = false;
    UserComData.isFinishLoad = false;
    UserComData.curItem = 0;
    UserComData.curItemList = [];
    UserComData.BulletSpeedFactor = 0.15;
    UserComData.BulletEulerY = 0;
    UserComData.BulletOriginPos = new Laya.Vector3(0, 0, 0);
    UserComData.BulletDirection = new Laya.Vector3(0, 0, 1);
    UserComData.BossFollowSpeicalRoad = 0.7;
    UserComData.BossLooktoAttack = 0.5;
    UserComData.AIJump = 0.3;
    UserComData.AIChange = 0.3;
    UserComData.AIIdle = 0.15;
    UserComData.BossTriggerArea = 10;
    UserComData.BossAttackArea = 1;
    UserComData.BossTriggerAttackTime = 3;
    UserComData.BossDamage = 2;
    UserComData.MaxPlayer = 5;
    UserComData.curSkillCount = 0;
    UserComData.curPlayRanking = 5;
    UserComData.RunnerList = [];
    UserComData.runnerNameList = [];
    UserComData.resultNameList = [];
    UserComData.BossName = "新手玩家";
    UserComData.HaveTips = false;
    UserComData.PlayerisLook = false;
    UserComData.AIHitChangeItemTime = 3;
    UserComData.MoveRight = false;
    UserComData.MoveBack = false;
    UserComData.CJItemList = [];
    UserComData.allRoadPosList = [];
    UserComData.allRoadEulerList = [];
    UserComData.allRoadNameList = [];
    UserComData.AIBornList = [];
    UserComData.AIEndPosList = [];
    UserComData.CanIdleNameList = [];
    UserComData.DontCanIdleNameList = [];
    UserComData.RoleNameList = ["role_boy_01", "role_boy_02", "role_boy_03", "role_girl_01", "role_girl_03", "role_girl_02"];
    UserComData.AINameList = [];
    UserComData.MatchAINameList = [];
    UserComData.isNewDay = false;
    UserComData.curMusic = "bgm_01";
    UserComData.isGuide = true;
    UserComData.GuideId = 0;
    UserComData.isGuideLevel = false;
    UserComData.outskirtsGuide = true;
    UserComData.outGuideId = 0;
    UserComData.isLookBoss = false;
    UserComData.isFristLogin = true;
    UserComData.curFuCount = 0;
    UserComData.AiRun = 0.5;
    UserComData.bossDiamondStart = 1;
    UserComData.isNearFu = false;
    UserComData.isNearBox = false;
    UserComData.isClickBox = false;
    UserComData.GameBoxDiamond = 49;
    UserComData.curGetDiamond = 0;
    UserComData.DestroyItemTime = 4;
    UserComData.RefreshItemGold = 100;
    UserComData.bossSkillTime = [10, 10];
    UserComData.ChangeItemIndex = 1;
    UserComData.CanSealBoss = false;
    UserComData.IsactivationFu = false;
    UserComData.isSelectOver = false;
    UserComData.RoletrySkinId = -1;
    UserComData.BoxGoldBuyList = [3, 3, 1];
    UserComData.isStealthState = false;
    UserComData.HintSkillCanUse = false;
    UserComData.ImprisonmentSkillCanUse = false;
    UserComData.PropList = [0, 1, 2];
    UserComData.PropState = [0, 0, 0];
    UserComData.PropDiamond = 50;
    UserComData.fuGetDiamond = 20;
    UserComData.isNewVersionFristLogin = false;
    UserComData.cacheVersion = "";
    UserComData.isOpenFree = false;
    UserComData.clickHomeButtonNum = 0;
    UserComData.cacheLevel = 1;
    UserComData.acitivityShareMaxCount = 5;
    UserComData.activityTag = 1;
    UserComData.RoleTipsList = {
        "Tag3": 0,
        "btnDailyBox": 0,
    };
    UserComData.RoleTipsName = [
        "Tag3",
        "btnDailyBox"
    ];
    UserComData.HomeTipsList = {
        "rankImg": 0,
        "btnNotice": 0,
        "btnActivity": 0,
        "btnTask": 0,
        "btnSign": 0,
        "btnLottery": 0,
        "btnRole": 0,
        "btnGift": 0,
    };
    UserComData.HomeTipsName = [
        "rankImg",
        "btnNotice",
        "btnActivity",
        "btnTask",
        "btnSign",
        "btnLottery",
        "btnRole",
        "btnGift",
    ];
    UserComData.modeDifficultyLevel = 0;
    UserComData.modeDifficulty = [
        { level: -1, probability: 0.2 },
        { level: 0, probability: 0.4 },
        { level: 1, probability: 0.6 },
    ];
    UserComData.BossCatchTimeList = [4, 7, 10];
    UserComData.ChatData = {
        "start": [
            { "content": "大家好呀" },
            { "content": "欢迎开始游戏" },
            { "content": "大家快躲好" },
            { "content": "我躲好了" },
            { "content": "大家一起加油" },
            { "content": "妖怪快登场了" },
            { "content": "我选好了" },
            { "content": "妖怪一定找不到我" },
            { "content": "这游戏真好玩" }
        ],
        "game": [
            { "content": "大家快躲好" },
            { "content": "看不到我看不到我" },
            { "content": "这个妖怪好强啊" },
            { "content": "我要转移了" },
            { "content": "不敢动，不敢动" },
            { "content": "呜呜呜，我要被淘汰了" },
            { "content": "我去找礼盒了" },
            { "content": "下次再来玩" },
            { "content": "还有这么久啊~" },
            { "content": "你会不会玩" },
            { "content": "你躲的真好" }
        ]
    };
    UserComData.PlayerState = 1;
    UserComData.maxStrength = 10;
    UserComData.strengthRecoveryTime = 15;
    UserComData.AddTimeState = 0;
    UserComData.winCount = 0;
    UserComData.lostCount = 0;
    UserComData.needWinCount = 2;
    UserComData.needLostCount = 2;
    UserComData.winFreeLottery = 0;
    UserComData.itemSelectState = [1, 0, 0];
    UserComData.activityInfo = {
        fuState: 0,
        propState: 0,
        shareCount: 0,
        giftCode: {},
        PursuerFreeCount: 0,
        strength: 5,
        lastUseStrengthTime: 0,
    };
    UserComData.activityTagData = [
        { title: "role/shop_tips_08.png", select: "role/shop_tips_09.png", desc: "玩法解锁", idx: 1 },
    ];
    UserComData.GiftCodeData = {
        BSDMM0121: { gold: 0, diamond: 400, fragmentCount: 0 },
        duomaomao: { gold: 0, diamond: 200, fragmentCount: 0 },
        shoujifuzhuan: { gold: 0, diamond: 0, fragmentCount: 100 },
        yaoguaizhenzi: { gold: 0, diamond: 100, fragmentCount: 0 },
    };
    UserComData.ShareLuckyData = {
        gift: [
            { type: 1, probability: 0.3, count: 500 },
            { type: 2, probability: 0.3, count: 50 },
            { type: 1, probability: 0.2, count: 1000 },
            { type: 2, probability: 0.2, count: 100 },
            { type: 1, probability: 0.1, count: 1500 },
            { type: 3, probability: 0.1, count: 1 },
        ]
    };
    UserComData.rankInfo = {
        rankShareCount: 0,
        rankId: 0,
        rankScore: 0,
        rankGiftState: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        rankArriveState: [0, 0, 0, 0, 0, 0, 0]
    };
    UserComData.rankName = {
        brass: "黄铜",
        silver: "白银",
        gold: "黄金",
        platinum: "白金",
        diamond: "钻石",
        master: "大师",
        skilled: "宗师",
        king: "王者",
    };
    UserComData.reslutRankScore = {
        "role": [50, 40, 30, 20, 10, 0],
        "boss": [0, 10, 20, 30, 40, 50]
    };
    UserComData.rankData = [
        { "rank": "brass_0", "experience": 0, "gold": 0, "diamonds": 50 },
        { "rank": "brass_1", "experience": 10, "gold": 100, "diamonds": 10 },
        { "rank": "brass_2", "experience": 20, "gold": 200, "diamonds": 10 },
        { "rank": "brass_3", "experience": 40, "gold": 300, "diamonds": 10 },
        { "rank": "silver_0", "experience": 60, "gold": 0, "diamonds": 50 },
        { "rank": "silver_1", "experience": 80, "gold": 400, "diamonds": 0 },
        { "rank": "silver_2", "experience": 100, "gold": 500, "diamonds": 0 },
        { "rank": "silver_3", "experience": 150, "gold": 600, "diamonds": 0 },
        { "rank": "gold_0", "experience": 200, "gold": 0, "diamonds": 100 },
        { "rank": "gold_1", "experience": 260, "gold": 1000, "diamonds": 0 },
        { "rank": "gold_2", "experience": 300, "gold": 1300, "diamonds": 0 },
        { "rank": "gold_3", "experience": 400, "gold": 1500, "diamonds": 0 },
        { "rank": "platinum_0", "experience": 500, "gold": 0, "diamonds": 150 },
        { "rank": "platinum_1", "experience": 600, "gold": 1800, "diamonds": 0 },
        { "rank": "platinum_2", "experience": 700, "gold": 2100, "diamonds": 0 },
        { "rank": "platinum_3", "experience": 800, "gold": 2500, "diamonds": 0 },
        { "rank": "diamond_0", "experience": 1000, "gold": 0, "diamonds": 200 },
        { "rank": "diamond_1", "experience": 1200, "gold": 2800, "diamonds": 0 },
        { "rank": "diamond_2", "experience": 1400, "gold": 3000, "diamonds": 0 },
        { "rank": "diamond_3", "experience": 1600, "gold": 3300, "diamonds": 0 },
        { "rank": "master_0", "experience": 2000, "gold": 0, "diamonds": 300 },
        { "rank": "master_1", "experience": 2500, "gold": 3500, "diamonds": 0 },
        { "rank": "master_2", "experience": 3000, "gold": 4000, "diamonds": 0 },
        { "rank": "master_3", "experience": 3500, "gold": 5000, "diamonds": 0 },
        { "rank": "skilled_0", "experience": 4000, "gold": 0, "diamonds": 400 },
        { "rank": "skilled_1", "experience": 4300, "gold": 5500, "diamonds": 0 },
        { "rank": "skilled_2", "experience": 4600, "gold": 6000, "diamonds": 0 },
        { "rank": "skilled_3", "experience": 5000, "gold": 7000, "diamonds": 0 },
        { "rank": "king", "experience": 6000, "gold": 0, "diamonds": 500 }
    ];
    UserComData.taskData = {
        "0": { mode: 1, desc: "完成喵喵模式", num: 1, type: 1, count: 100, integral: 10 },
        "1": { mode: 2, desc: "完成妖怪模式", num: 1, type: 1, count: 200, integral: 20 },
        "2": { mode: 3, desc: "签到", num: 1, type: 1, count: 100, integral: 10 },
        "3": { mode: 3, desc: "完成封印模式", num: 1, type: 1, count: 200, integral: 10 },
        "4": { mode: 5, desc: "购买技能", num: 1, type: 2, count: 20, integral: 20 },
        "5": { mode: 6, desc: "打开每日宝箱", num: 1, type: 1, count: 100, integral: 10 },
        "6": { mode: 7, desc: "购买碎片", num: 1, type: 1, count: 100, integral: 20 },
    };
    UserComData.taskBoxData = {
        "0": { type: 1, count: 200, fragmentCount: 10 },
        "1": { type: 1, count: 300, fragmentCount: 20 },
        "2": { type: 2, count: 10, fragmentCount: 30 },
        "3": { type: 2, count: 20, fragmentCount: 40 },
        "4": { type: 2, count: 50, fragmentCount: 50 },
    };
    UserComData.taskInfo = {
        taskStateList: [0, 0, 0, 0, 0, 0, 0],
        taskGetList: [0, 0, 0, 0, 0, 0, 0],
        taskBoxList: [0, 0, 0, 0, 0],
        taskprogress: 0
    };
    UserComData.roleSkillInfo = {
        accelerate: [1, 10, 10],
        stealth: [10, 20],
        recover: [15],
    };
    UserComData.bossSkillInfo = {
        accelerate: [1, 10, 10],
        imprisonment: [5, 20],
        hint: [15],
    };
    UserComData.endroadqueue = {
        "1": [0, 1, 5],
        "2": [2, 4, 5, 7],
        "3": [1, 2, 5],
        "4": [3, 4, 5, 6, 7],
        "5": [0, 3, 5, 6],
    };
    UserComData.RoleResultData = {
        "1": { gold: 300, diamond: 50, fragment: 30 },
        "2": { gold: 200, diamond: 30, fragment: 20 },
        "3": { gold: 150, diamond: 20, fragment: 15 },
        "4": { gold: 100, diamond: 10, fragment: 10 },
        "5": { gold: 50, diamond: 0, fragment: 5 },
    };
    UserComData.BossResultData = {
        "0": { gold: 50, diamond: 0, fragment: 0 },
        "1": { gold: 50, diamond: 0, fragment: 5 },
        "2": { gold: 100, diamond: 20, fragment: 10 },
        "3": { gold: 150, diamond: 50, fragment: 15 },
        "4": { gold: 200, diamond: 70, fragment: 20 },
        "5": { gold: 300, diamond: 100, fragment: 30 },
    };
    UserComData.LotteryCount = 0;
    UserComData.curDayLotteryCount = 0;
    UserComData.FristLottery = [1, 2, 0, 3, 6, 4, 5];
    UserComData.LotteryData = {
        "0": { type: 2, skinId: -1, count: 50 },
        "1": { type: 1, skinId: -1, count: 500 },
        "2": { type: 3, skinId: 2, count: 1 },
        "3": { type: 1, skinId: -1, count: 1000 },
        "4": { type: 2, skinId: -1, count: 100 },
        "5": { type: 1, skinId: -1, count: 2000 },
        "6": { type: 3, skinId: 1, count: 1 },
    };
    UserComData.signSkinState = [0, 0, 0];
    UserComData.SignInfo = {
        isSign: false,
        normalSignCount: 0,
        videoSignCount: 0,
        videoSignList: [0, 0, 0, 0, 0, 0, 0]
    };
    UserComData.SignData = {
        "0": { gold: 500, type: 3, skinId: 3, count: 1 },
        "1": { gold: 1000, type: 2, skinId: -1, count: 100 },
        "2": { gold: 1500, type: 3, skinId: 4, count: 1 },
        "3": { gold: 2000, type: 1, skinId: -1, count: 1000 },
        "4": { gold: 2500, type: 2, skinId: -1, count: 500 },
        "5": { gold: 3000, type: 1, skinId: -1, count: 2000 },
        "6": { gold: 4000, type: 3, skinId: 5, count: 1 },
    };
    UserComData.Boxinfo = {
        daily: 10,
        normal: 3,
        rare: 1
    };
    UserComData.BoxData = {
        "0": {
            type: 1, consume: 500, fragmentCount: 20, gift: [
                { type: 1, probability: 0.3, count: 200 },
                { type: 1, probability: 0.3, count: 400 },
                { type: 2, probability: 0.2, count: 20 },
                { type: 2, probability: 0.2, count: 30 },
            ]
        },
        "1": {
            type: 2, consume: 50, fragmentCount: 50, gift: [
                { type: 2, probability: 0.3, count: 20 },
                { type: 1, probability: 0.3, count: 600 },
                { type: 1, probability: 0.2, count: 900 },
                { type: 2, probability: 0.1, count: 30 },
                { type: 2, probability: 0.1, count: 50 },
            ]
        },
        "2": {
            type: 2, consume: 100, fragmentCount: 100, gift: [
                { type: 2, probability: 0.2, count: 50 },
                { type: 2, probability: 0.2, count: 70 },
                { type: 1, probability: 0.2, count: 1000 },
                { type: 1, probability: 0.2, count: 2000 },
                { type: 2, probability: 0.1, count: 200 },
            ]
        },
    };
    UserComData.LuckyCount = 0;
    UserComData.LuckyData = [
        [
            { type: 1, count: 500, probability: 30 },
            { type: 1, count: 1000, probability: 30 },
            { type: 1, count: 1500, probability: 20 },
            { type: 1, count: 2000, probability: 10 },
            { type: 1, count: 3000, probability: 5 },
            { type: 1, count: 5000, probability: 5 }
        ],
        [
            { type: 2, count: 50, probability: 30 },
            { type: 2, count: 100, probability: 30 },
            { type: 2, count: 150, probability: 20 },
            { type: 2, count: 200, probability: 10 },
            { type: 2, count: 300, probability: 5 },
            { type: 2, count: 300, probability: 5 }
        ],
        [
            { type: 3, count: 1, probability: 30 },
            { type: 4, count: 1, probability: 30 },
            { type: 5, count: 1, probability: 20 },
            { type: 6, count: 1, probability: 10 },
            { type: 7, count: 1, probability: 5 },
            { type: 8, count: 1, probability: 5 }
        ]
    ];
    UserComData.PlayerSKinInfo = {
        userRoleSkinId: 0,
        unlockRoleList: [0],
        userBossSKinId: 0,
        unlockBossList: [0],
        RoleSkinLevelList: [1, 1, 1, 1, 1, 1],
        BossSkinLevelList: [1],
        RoleSkinFragmentCount: [100, 0, 0, 0, 0, 0],
        BossSkinFragmentCount: [0],
        buyFragmentList: [100, 0],
        buyFragmentState: [1, 1],
        refreshFragmentCount: 0,
        freeCount: 1,
    };
    UserComData.RolePageTagType = 1;
    UserComData.AllRoleSKinList = [0, 1, 2, 3, 4, 5];
    UserComData.AllBossSKinList = [0];
    UserComData.ShopBossData = {
        "0": {
            type: 2,
            getMode: 1,
            count: 3000,
            level: {
                "1": { attack: 1, blood: 1, speed: 2.2, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 2, blood: 1, speed: 2.5, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 3, blood: 1, speed: 2.7, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 4, blood: 1, speed: 3, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 5, blood: 1, speed: 3.2, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_10.png",
            fragmentName: "真子碎片",
            fragmentImg: "role/boss_puzzle_00.png",
            prefabName: "role_boss",
            roleName: "role/font_name_06.png",
            lockImg: "role/boss_head_mask_00.png",
            unLockImg: "role/boss_head_00.png",
            bg: "daily/bg_shop_03.png"
        },
    };
    UserComData.ShopRoleData = {
        "0": {
            type: 1,
            getMode: 1,
            count: 3000,
            level: {
                "1": { attack: 0, blood: 2, speed: 2, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 4, speed: 2.3, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 6, speed: 2.5, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 8, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_04.png",
            fragmentName: "三花喵碎片",
            fragmentImg: "role/role_puzzle_03.png",
            prefabName: "role_girl_01",
            roleName: "role/font_name_01.png",
            lockImg: "role/role_head_03.png",
            unLockImg: "role/role_art_03.png",
            bg: "daily/bg_shop_03.png"
        },
        "1": {
            type: 1,
            getMode: 5,
            count: 3000,
            level: {
                "1": { attack: 0, blood: 4, speed: 2, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 6, speed: 2.3, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 8, speed: 2.5, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 10, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_06.png",
            fragmentName: "公主喵碎片",
            fragmentImg: "role/role_puzzle_01.png",
            prefabName: "role_girl_02",
            roleName: "role/font_name_03.png",
            lockImg: "role/role_head_01.png",
            unLockImg: "role/role_art_01.png",
            bg: "daily/bg_shop_04.png"
        },
        "2": {
            type: 1,
            getMode: 5,
            count: 500,
            level: {
                "1": { attack: 0, blood: 2, speed: 2.3, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 4, speed: 2.5, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 6, speed: 2.8, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 8, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_05.png",
            fragmentName: "恐龙喵碎片",
            fragmentImg: "role/role_puzzle_02.png",
            prefabName: "role_girl_03",
            roleName: "role/font_name_05.png",
            lockImg: "role/role_head_02.png",
            unLockImg: "role/role_art_02.png",
            bg: "daily/bg_shop_05.png"
        },
        "3": {
            type: 1,
            getMode: 4,
            count: 1,
            level: {
                "1": { attack: 0, blood: 2, speed: 2, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 4, speed: 2.3, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 6, speed: 2.5, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 8, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_07.png",
            fragmentName: "银斑喵碎片",
            fragmentImg: "role/role_puzzle_06.png",
            prefabName: "role_boy_01",
            roleName: "role/font_name_08.png",
            lockImg: "role/role_head_06.png",
            unLockImg: "role/role_art_06.png",
            bg: "daily/bg_shop_03.png"
        },
        "4": {
            type: 1,
            getMode: 4,
            count: 1,
            level: {
                "1": { attack: 0, blood: 2, speed: 2.3, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 4, speed: 2.5, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 6, speed: 2.8, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 8, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_08.png",
            fragmentName: "奥特喵碎片",
            fragmentImg: "role/role_puzzle_04.png",
            prefabName: "role_boy_03",
            roleName: "role/font_name_02.png",
            lockImg: "role/role_head_04.png",
            unLockImg: "role/role_art_04.png",
            bg: "daily/bg_shop_04.png"
        },
        "5": {
            type: 1,
            getMode: 4,
            count: 1,
            level: {
                "1": { attack: 0, blood: 4, speed: 2, fragment: 100, needcount: 500, needtype: 1 },
                "2": { attack: 0, blood: 6, speed: 2.3, fragment: 200, needcount: 1000, needtype: 1 },
                "3": { attack: 0, blood: 8, speed: 2.5, fragment: 300, needcount: 2000, needtype: 1 },
                "4": { attack: 0, blood: 10, speed: 2.8, fragment: 500, needcount: 3000, needtype: 1 },
                "5": { attack: 0, blood: 10, speed: 3, fragment: 0, needcount: 0, needtype: 0 },
            },
            maxLevel: 5,
            desc: "role/font_int_09.png",
            fragmentName: "骑士喵碎片",
            fragmentImg: "role/role_puzzle_05.png",
            prefabName: "role_boy_02",
            roleName: "role/font_name_04.png",
            lockImg: "role/role_head_05.png",
            unLockImg: "role/role_art_05.png",
            bg: "daily/bg_shop_05.png"
        }
    };
    UserComData.DailyData = {
        "0": {
            getMode: 1,
            title: "每日礼包",
            maxCount: 1,
            curCount: 1,
            icon: "lucky/icon_shop_gift_00.png",
            bg: "daily/bg_shop_03.png"
        },
        "1": {
            getMode: 2,
            title: "猫爪币福利包",
            maxCount: 2,
            curCount: 2,
            icon: "lucky/icon_shop_gift_01.png",
            bg: "daily/bg_shop_03.png"
        },
        "2": {
            getMode: 2,
            title: "猫爪币大礼包",
            maxCount: 1,
            curCount: 1,
            icon: "lucky/icon_shop_gift_02.png",
            bg: "daily/bg_shop_04.png"
        },
        "3": {
            getMode: 2,
            title: "98大礼包",
            maxCount: 3,
            curCount: 3,
            icon: "lucky/icon_shop_gift_03.png",
            bg: "daily/bg_shop_04.png"
        },
        "4": {
            getMode: 2,
            title: "328大礼包",
            maxCount: 2,
            curCount: 2,
            icon: "lucky/icon_shop_gift_04.png",
            bg: "daily/bg_shop_05.png"
        },
        "5": {
            getMode: 2,
            title: "648大礼包",
            maxCount: 1,
            curCount: 1,
            icon: "lucky/icon_shop_gift_05.png",
            bg: "daily/bg_shop_05.png"
        }
    };
    UserComData.GiftData = { gold: 0, diamond: 0 };
    var GameState;
    (function (GameState) {
        GameState[GameState["wait"] = 0] = "wait";
        GameState[GameState["playing"] = 1] = "playing";
        GameState[GameState["pause"] = 2] = "pause";
        GameState[GameState["over"] = 3] = "over";
    })(GameState || (GameState = {}));
    var GameModel;
    (function (GameModel) {
        GameModel[GameModel["Runner"] = 0] = "Runner";
        GameModel[GameModel["Pursuer"] = 1] = "Pursuer";
    })(GameModel || (GameModel = {}));
    var AIState;
    (function (AIState) {
        AIState[AIState["Move"] = 0] = "Move";
        AIState[AIState["Attack"] = 1] = "Attack";
        AIState[AIState["Look"] = 2] = "Look";
        AIState[AIState["None"] = 3] = "None";
        AIState[AIState["Catch"] = 4] = "Catch";
        AIState[AIState["Follow"] = 5] = "Follow";
    })(AIState || (AIState = {}));
    var CameraState;
    (function (CameraState) {
        CameraState[CameraState["Normal"] = 0] = "Normal";
        CameraState[CameraState["Shop"] = 1] = "Shop";
        CameraState[CameraState["Win"] = 2] = "Win";
        CameraState[CameraState["LookAt"] = 3] = "LookAt";
    })(CameraState || (CameraState = {}));
    var TaskMode;
    (function (TaskMode) {
        TaskMode[TaskMode["Runner"] = 1] = "Runner";
        TaskMode[TaskMode["Pursuer"] = 2] = "Pursuer";
        TaskMode[TaskMode["Sign"] = 3] = "Sign";
        TaskMode[TaskMode["Share"] = 4] = "Share";
        TaskMode[TaskMode["BuySkill"] = 5] = "BuySkill";
        TaskMode[TaskMode["OpenDailyBox"] = 6] = "OpenDailyBox";
        TaskMode[TaskMode["BuyFragment"] = 7] = "BuyFragment";
    })(TaskMode || (TaskMode = {}));

    var EventDispatcher = Laya.EventDispatcher;
    class EventMgr extends EventDispatcher {
        emit(InName, agv) {
            EventMgr.eventDispatcher.event(InName, agv);
        }
        onEvent(InName, caller, listener, arg) {
            EventMgr.eventDispatcher.on(InName, caller, listener, (arg == null) ? null : ([arg]));
        }
        onOnceEvent(InName, caller, listener, arg) {
            EventMgr.eventDispatcher.once(InName, caller, listener, (arg == null) ? null : ([arg]));
        }
        onOffEvent(InName, caller, listener, arg) {
            EventMgr.eventDispatcher.off(InName, caller, listener);
        }
    }
    EventMgr.eventDispatcher = new EventDispatcher();
    EventMgr.inst = new EventMgr();

    class SoundMgr {
        constructor() {
        }
        playSound(name) {
            let url = "sound/" + name + ".ogg";
            Laya.SoundManager.playSound(url, 1);
        }
        playMusic(name, count, endHander) {
            let _count = count ? count : 0;
            let url = "sound/" + name + ".mp3";
            console.log("播放路径", url);
            UserComData.curMusic = name;
            UserComData.curMusicCannel = Laya.SoundManager.playMusic(url, _count, Laya.Handler.create(this, endHander));
        }
        onComplete() {
            console.log("播放完毕");
        }
        PauseMusic(name) {
        }
        playMoveSound(name) {
            let url = "sound/" + name + ".ogg";
            Laya.SoundManager.playSound(url, 0);
        }
        stopMoveSound(name) {
            let url = "sound/" + name + ".ogg";
            Laya.SoundManager.stopSound(url);
        }
    }
    SoundMgr.inst = new SoundMgr();

    var Utils;
    (function (Utils) {
        function dateFormat(fmt, date) {
            let ret;
            const opt = {
                "Y+": date.getFullYear().toString(),
                "m+": (date.getMonth() + 1).toString(),
                "d+": date.getDate().toString(),
                "H+": date.getHours().toString(),
                "M+": date.getMinutes().toString(),
                "S+": date.getSeconds().toString()
            };
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (ret) {
                    fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
                }
                ;
            }
            ;
            return fmt;
        }
        Utils.dateFormat = dateFormat;
        function Range(min, max) {
            if (min > max)
                return -1;
            if (min == max)
                return min;
            var num = Math.round(Math.random() * (max - min) + min);
            return num;
        }
        Utils.Range = Range;
        function random(min, max) {
            var range = max - min;
            var rand = Math.random();
            var num = min + Math.round(rand * range);
            return num;
        }
        Utils.random = random;
        function randomSipArray(array, num) {
            if (array.length < num) {
                return array;
            }
            else if (array.length == num) {
                let a = [];
                for (let i = 0; i < array.length; i++) {
                    a.push(array[i]);
                }
                return a;
            }
            else {
                let tempArray = [];
                for (let k = 0; k < array.length; k++) {
                    tempArray.push(k);
                }
                let a = [];
                for (let j = 0; j < num; j++) {
                    let tempIndex = Utils.random(0, tempArray.length - 1);
                    let index = tempArray[tempIndex];
                    tempArray.splice(tempIndex, 1);
                    a.push(array[index]);
                }
                return a;
            }
        }
        Utils.randomSipArray = randomSipArray;
        function getAngle(radin) {
            return radin * 180 / Math.PI;
        }
        Utils.getAngle = getAngle;
        function getRadian(angle) {
            return (Math.PI / 180) * angle;
        }
        Utils.getRadian = getRadian;
        function QuaSlerp(q1, q2, n) {
            let result = new Laya.Quaternion();
            Laya.Quaternion.lerp(q1, q2, n, result);
            return result;
        }
        Utils.QuaSlerp = QuaSlerp;
        function formatTimer(timer) {
            let house = Math.floor(timer / 3600);
            let mine = Math.floor((timer - house * 3600) / 60);
            let second = Math.floor(timer - house * 3600 - mine * 60);
            let houseStr = house.toString();
            if (house < 10) {
                houseStr = "0" + houseStr;
            }
            let mineStr = mine.toString();
            if (mine < 10) {
                mineStr = "0" + mineStr;
            }
            let secondStr = second.toString();
            if (second < 10) {
                secondStr = "0" + secondStr;
            }
            return mineStr + ":" + secondStr;
        }
        Utils.formatTimer = formatTimer;
        function formatDownTimer(timer) {
            let house = Math.floor(timer / 3600);
            let mine = Math.floor((timer - house * 3600) / 60);
            let second = Math.floor(timer - house * 3600 - mine * 60);
            let houseStr = house.toString();
            if (house < 10) {
                houseStr = "0" + houseStr;
            }
            let mineStr = mine.toString();
            if (mine < 10) {
                mineStr = "0  " + mineStr;
            }
            else {
                mineStr = Math.floor(mine / 10) + "  " + mine % 10;
            }
            let secondStr = second.toString();
            if (second < 10) {
                secondStr = "0  " + secondStr;
            }
            else {
                secondStr = Math.floor(second / 10) + "  " + second % 10;
            }
            return mineStr + " : " + secondStr;
        }
        Utils.formatDownTimer = formatDownTimer;
    })(Utils || (Utils = {}));

    class BaseScript extends Laya.Script3D {
        constructor() {
            super();
        }
        InitBase() {
            this.obj = this.owner;
        }
        SetPosition(pos) {
            this.obj.transform.position = pos;
        }
        GetPosition() {
            return this.obj.transform.position.clone();
        }
        Translate(translation, isLocal) {
            this.obj.transform.translate(translation, isLocal);
        }
        SetRotate(rot, isLocal, isRadian) {
            this.obj.transform.rotate(rot, isLocal, isRadian);
        }
        GetTransForm() {
            return this.obj.transform;
        }
        SetRotationEuler(euler) {
            this.obj.transform.rotationEuler = euler;
        }
        GetRotationEuler() {
            return this.obj.transform.rotationEuler.clone();
        }
        SetScale(scale) {
            this.obj.transform.setWorldLossyScale(new Laya.Vector3(scale.x, scale.y, scale.z));
        }
        GetObj() {
            return this.obj;
        }
        Hidden() {
            this.obj.active = false;
        }
        Show() {
            this.obj.active = true;
        }
        get Active() {
            return this.obj.active;
        }
        Destroy() {
            this.obj.destroy();
        }
    }

    var NavgationState;
    (function (NavgationState) {
        NavgationState[NavgationState["NavForward"] = 0] = "NavForward";
        NavgationState[NavgationState["NavXAxis"] = 1] = "NavXAxis";
        NavgationState[NavgationState["NavZAxis"] = 2] = "NavZAxis";
        NavgationState[NavgationState["NavNon"] = 3] = "NavNon";
    })(NavgationState || (NavgationState = {}));
    class Actor extends BaseScript {
        constructor() {
            super();
            this.HP = 100;
            this.MaxHP = 100;
            this.Attack = 40;
            this.Speed = 2;
            this.userName = "新手玩家";
            this.State = 0;
            this.RoadPosList = [];
            this.RoadNameList = [];
            this.TargetList = [];
            this.curRoadId = 0;
            this.TargetRoadId = 0;
            this.hitresult = new Laya.HitResult();
            this.isDead = false;
        }
        onEnable() {
        }
        onAwake() {
            this.InitBase();
            this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.lineSprite3D = new Laya.PixelLineSprite3D(1, "line");
            SceneLogic.inst.Game_Scene.addChild(this.lineSprite3D);
            this.lineSprite3D.addLine(this.GetPosition(), this.GetPosition(), Laya.Color.GREEN, Laya.Color.GREEN);
            this.onSpawn();
        }
        onSpawn() {
        }
        ;
        onUpdate() {
            if (SceneLogic.inst.gameState != GameState.playing) {
                this.onUpdateSpr();
            }
            this.onUpdateOther();
        }
        onUpdateSpr() {
        }
        onUpdateOther() {
        }
        onDisable() {
        }
        onDestroy() {
        }
    }

    class StateMachine {
        constructor(owner) {
            this._manualExecuteFrequency = 0;
            this._owner = owner;
        }
        set curState(state) {
            this._curState = state;
        }
        get curState() {
            return this._curState;
        }
        set previousState(state) {
            this._previousState = state;
        }
        get previousState() {
            return this._previousState;
        }
        set curData(data) {
            this._curData = data;
        }
        get curData() {
            return this._curData;
        }
        set previousData(data) {
            this._previousData = data;
        }
        get previousData() {
            return this._previousData;
        }
        stateMachineUpdate() {
            if (this.curState == null) {
                console.error("this MachineUpdate failed !! curState lost");
                return;
            }
            this.curState.Execute(this._owner);
            this._manualExecuteFrequency += Laya.timer.delta * 0.001;
            if (this._manualExecuteFrequency >= this.curState.manualExecuteFrequency) {
                this.curState.ManualExecute(this._owner);
                this._manualExecuteFrequency = 0;
            }
        }
        changeState(newState, manualExecuteFrequency = -1, data) {
            newState.manualExecuteFrequency = manualExecuteFrequency;
            this._manualExecuteFrequency = 0;
            if (this.curState) {
                if (this.curState.stateName == newState.stateName) {
                    return;
                }
                this.previousState = this.curState;
                this.previousData = this.curData;
                this.curState.Exit(this._owner);
            }
            this.curState = newState;
            this.curData = data;
            this.curState.Enter(this._owner, data);
        }
    }

    class State {
        constructor() {
            this.stateName = this.constructor.name;
            this.manualExecuteFrequency = -1;
        }
    }

    class AIAttackState extends State {
        constructor() {
            super(...arguments);
            this.isPlayOver = false;
        }
        Enter(owner, data) {
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class AIHeadState extends State {
        Enter(owner, data) {
            owner.State = 0;
            UserComData.resultNameList.push(owner.userName);
            owner.humanAni.crossFade("role_death", 0.1);
            EventMgr.inst.emit("killTips", owner.userName);
            owner.isDead = true;
            owner.ef_BSDMM_wh.active = false;
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class AIHitState extends State {
        Enter(owner, data) {
            owner.State = 0;
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class AILookState extends State {
        Enter(owner, data) {
            owner.Rb.linearVelocity = new Laya.Vector3(0, owner.Rb.linearVelocity.y, 0);
            owner.humanAni.crossFade("role_wait", 0.1);
            owner.Rb.collisionGroup = 2;
            Laya.timer.once(1500, this, () => {
                owner.Rb.enabled = false;
            });
            owner.State = 0;
            Laya.timer.once(500, this, () => {
                owner.GetTransForm().position = UserComData.allRoadPosList[owner.TargetRoadId].clone();
                owner.Mod.transform.localRotationEulerY = UserComData.allRoadEulerList[owner.TargetRoadId].y;
                owner.Follow.transform.localRotationEulerY = UserComData.allRoadEulerList[owner.TargetRoadId].y;
                if (!owner.item.active) {
                    owner.ChangeItem();
                }
            });
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class AImIdleState extends State {
        Enter(owner, data) {
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
            if (owner.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            owner.aiState = AIState.Move;
            owner.mStateMachine.changeState(owner.mMoveState);
        }
    }

    class AIMoveState extends State {
        Enter(owner, data) {
            this.owner = owner;
            owner.ChangePos();
            owner.State = 1;
        }
        Execute(owner) {
            if (owner.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (owner.isImprisonment) {
                owner.Rb.linearVelocity = new Laya.Vector3(0, owner.Rb.linearVelocity.y, 0);
                return;
            }
            owner.Rb.linearVelocity = owner.direction;
            owner.UpdateDir();
            let _pos = new Laya.Vector3(owner.curFollowPos.x, this.owner.GetTransForm().position.y, owner.curFollowPos.z);
            if (owner.TargetList.length < 2 && !owner.item.active && Laya.timer.currTimer - owner.hitTime > UserComData.AIHitChangeItemTime * 1000) {
                owner.ChangeItem();
            }
            if (Laya.Vector3.distance(this.owner.GetTransForm().position, _pos) < 0.1) {
                owner.FollowPos();
            }
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class CameraLook extends BaseScript {
        constructor() {
            super(...arguments);
            this.RotatePointX = 0;
            this.RotatePointY = 0;
            this.RotateId = -1;
        }
        onAwake() {
            this.InitBase();
            this.InitCamera();
        }
        InitCamera() {
            this.RotateId = -1;
            this._parentNode = this.owner.parent;
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnUp);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnMove);
        }
        OnDown(arg) {
            if (!this.owner.active)
                return;
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.RotateId == -1) {
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
                this.RotateId = arg.touchId;
            }
        }
        OnMove(arg) {
            if (!this.owner.active)
                return;
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                let deltaX = arg.stageX - this.RotatePointX;
                let deltaY = arg.stageY - this.RotatePointY;
                this.PlayerLookRotate(deltaX, deltaY);
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
            }
        }
        OnUp(arg) {
            if (!this.owner.active)
                return;
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                this.RotateId = -1;
            }
        }
        PlayerLookRotate(_x, index) {
            let _value = this._parentNode.transform.localRotationEulerX + index / 4;
            if (_value >= 0) {
                _value = _value > UserComData.MaxRotationY ? UserComData.MaxRotationY : _value;
            }
            else {
                _value = _value < -UserComData.MaxRotationY ? -UserComData.MaxRotationY : _value;
            }
            this._parentNode.transform.localRotationEulerY -= _x / 4;
            this._parentNode.transform.localRotationEulerX = _value;
        }
        onDestroy() {
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.OnDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnUp);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnMove);
        }
    }

    class AI extends Actor {
        constructor() {
            super();
            this.isMove = false;
            this.mIdleState = new AImIdleState();
            this.mMoveState = new AIMoveState();
            this.mHitState = new AIHitState();
            this.mHeadState = new AIHeadState();
            this.mAttackState = new AIAttackState();
            this.mLookState = new AILookState();
            this.direction = new Laya.Vector3(0, 0, 1);
            this.aiState = AIState.None;
            this.isHaveBoss = false;
            this.isImprisonment = false;
            this.hitTime = 0;
            this.hitresults = [];
        }
        onSpawn() {
            super.onSpawn();
            this.GetObj().active = true;
            this.Rb = this.GetObj().getComponent(Laya.Rigidbody3D);
            this.Rb.angularFactor = new Laya.Vector3(0, 0, 0);
            this.Rb.mass = 1000;
            this.Rb.canCollideWith = 0 ^ 1;
            this.Rb.collisionGroup = 4;
            this.Mod = this.owner.getChildByName("runner");
            this.Follow = this.owner.getChildByName("Follow");
            this.Look = this.owner.getChildByName("Look");
            this.LookCamera = this.Look.getChildByName("Camera");
            this.LookCamera.active = false;
            this.ef_BSDMM_transformation = this.Follow.getChildByName("ef_BSDMM_transformation2");
            this.ef_BSDMM_seal = this.Follow.getChildByName("ef_BSDMM_seal");
            this.ef_BSDMM_seal.active = false;
            this.ef_BSDMM_jingu = this.Follow.getChildByName("ef_BSDMM_jingu");
            this.ef_BSDMM_jingu.active = false;
            this.ef_BSDMM_aperture02 = this.owner.getChildByName("ef_BSDMM_aperture02");
            this.ef_BSDMM_wh = this.owner.getChildByName("ef_BSDMM_wh");
            this.ef_BSDMM_wh.active = false;
            this.human = this.Mod.getChildByName("human");
            this.item = this.Mod.getChildByName("item");
            this.humanAni = this.human.getChildAt(0).getComponent(Laya.Animator);
            this.humanAni.crossFade("role_wait", 0.1);
            this.BulletPos = this.Follow.getChildByName("BulletPos");
            this.curRoadId = 0;
            this.mStateMachine = new StateMachine(this);
            if (UserComData.gameModel == GameModel.Pursuer) {
                let _ran = Utils.Range(2, 10);
                this.ef_BSDMM_aperture02.active = false;
                this.mStateMachine.changeState(this.mIdleState, _ran);
            }
            else {
                this.ef_BSDMM_aperture02.active = true;
                this.mStateMachine.changeState(this.mAttackState);
            }
            this.CreatHeadHp();
            EventMgr.inst.onEvent("Initial", this, this.Initial);
            EventMgr.inst.onEvent("HitAI", this, this.HitAI);
            EventMgr.inst.onEvent("GameLose", this, this.RemoveEvent);
            EventMgr.inst.onEvent("GameWin", this, this.PlayerWin);
            EventMgr.inst.onEvent("closeTips", this, this.closeTips);
            EventMgr.inst.onEvent("showView", this, this.bossBorn);
        }
        bossBorn() {
            this.isHaveBoss = true;
        }
        Imprisonment() {
            this.isImprisonment = true;
            this.ef_BSDMM_jingu.active = false;
            this.ef_BSDMM_jingu.active = true;
            Laya.timer.once(UserComData.bossSkillInfo.imprisonment[0] * 1000, this, () => {
                this.isImprisonment = false;
                this.ef_BSDMM_jingu.active = false;
            });
        }
        closeTips() {
            this.ef_BSDMM_wh.active = false;
        }
        CreatHeadHp() {
            if (!this.HpBarBg) {
                this.HpBarBg = new Laya.Image();
            }
            this.HpBarBg.skin = "";
            this.HpBarBg.anchorX = 0.5;
            this.HpBarBg.anchorY = 0.5;
            this.HpBarBg.scaleX = 0.5;
            this.HpBarBg.scaleY = 0.5;
            this.HpBarBg.name = "HpBarBg";
            SceneLogic.inst.gamingUIRoot.addChild(this.HpBarBg);
            let Bg = new Laya.Image();
            Bg.skin = "game/playHP_bar_00.png";
            Bg.width = 242;
            Bg.height = 41;
            Bg.left = 0;
            Bg.centerY = 0;
            this.HpBarBg.addChild(Bg);
            if (!this.HpBar) {
                this.HpBar = new Laya.Panel();
            }
            this.HpBar.width = 242;
            this.HpBar.height = 41;
            this.HpBar.left = 0;
            this.HpBar.centerY = 0;
            this.HpBarBg.addChild(this.HpBar);
            let img = new Laya.Image();
            img.skin = "game/playHP_bar_01.png";
            img.anchorX = 0.5;
            img.anchorY = 0.5;
            img.width = 234;
            img.height = 33;
            img.left = 3;
            img.centerY = 0;
            this.HpBar.addChild(img);
            this.HpBarBg.visible = false;
        }
        UpdateHpPos() {
            if (this.isDead) {
                return;
            }
            let outPos = new Laya.Vector4(0, 0, 0, 0);
            SceneLogic.inst.Camera_Main.viewport.project(this.GetPosition(), SceneLogic.inst.Camera_Main.projectionViewMatrix, outPos);
            this.HpBarBg.pos((outPos.x - 50) / Laya.stage.clientScaleX, (outPos.y - 180) / Laya.stage.clientScaleY);
            return outPos;
        }
        HitAI(_name) {
            if (!this.owner)
                return;
            if (_name != this.owner.name)
                return;
            this.HP -= UserComData.BossDamage;
            SceneLogic.inst.SpawEffect("ef_BSDMM_zhuajishouji", this.GetPosition());
            Laya.timer.clearAll(this.HpBarBg);
            Laya.Tween.clearAll(this.HpBarBg);
            this.HpBarBg.visible = true;
            this.HpBar.width = (this.HP / this.MaxHP) * 242;
            Laya.timer.once(600, this.HpBarBg, () => {
                Laya.Tween.to(this.HpBarBg, { alpha: 0 }, 300, null, Laya.Handler.create(this.HpBarBg, () => {
                    this.HpBarBg.visible = false;
                    this.HpBarBg.alpha = 1;
                }));
            });
            if (this.HP <= 0) {
                for (let i = 0; i < UserComData.RunnerList.length; i++) {
                    let _obj = UserComData.RunnerList[i];
                    if (_obj.name == this.owner.name) {
                        UserComData.RunnerList.splice(i, 1);
                        this.owner.name = "Death";
                        _obj.name = "Death";
                        break;
                    }
                }
                if (UserComData.gameModel == GameModel.Pursuer || UserComData.isLookBoss) {
                    SoundMgr.inst.playSound("cat_death");
                }
                UserComData.curSkillCount++;
                if (UserComData.gameModel == GameModel.Pursuer) {
                    if (UserComData.curSkillCount == 1) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("FristKill", "第一次击杀"));
                    }
                    else if (UserComData.curSkillCount == 3) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("ThirdKill", "第三次击杀"));
                    }
                    Laya.timer.scale = 0.2;
                    Laya.timer.once(300, this, () => {
                        Laya.timer.scale = 1;
                        this.HpBarBg.visible = false;
                    });
                }
                this.OnDead();
                if (UserComData.PlayerState == 2 && UserComData.curSkillCount >= 4) {
                    SceneLogic.inst.gameState = GameState.over;
                    EventMgr.inst.emit("GameLose");
                }
            }
            else {
                if (this.State == 0) {
                    this.ChangeEndPos();
                }
            }
        }
        ChangeEndPos() {
            let _oldName = UserComData.allRoadNameList[this.TargetRoadId];
            let frontName = _oldName.substring(0, 3);
            let _list = [];
            for (let i = 0; i < UserComData.AIEndPosList.length; i++) {
                let _id = this.getCuridByPos(UserComData.AIEndPosList[i]);
                let _name = UserComData.allRoadNameList[_id];
                _name = _name.substring(0, 3);
                if (_name != frontName) {
                    _list.push(_id);
                }
            }
            if (_list) {
                this.Rb.enabled = true;
                this.Rb.collisionGroup = 4;
                this.curRoadId = this.TargetRoadId;
                this.TargetRoadId = _list[Utils.Range(0, _list.length - 1)];
                this.hitTime = Laya.timer.currTimer;
                this.mStateMachine.changeState(this.mMoveState);
            }
        }
        PlayerWin() {
            this.GetObj().active = false;
            this.RemoveEvent();
        }
        RemoveEvent() {
            EventMgr.inst.onOffEvent("Initial", this, this.Initial);
            EventMgr.inst.onOffEvent("HitAI", this, this.HitAI);
            EventMgr.inst.onOffEvent("GameLose", this, this.RemoveEvent);
            EventMgr.inst.onOffEvent("GameWin", this, this.PlayerWin);
            EventMgr.inst.onOffEvent("closeTips", this, this.closeTips);
            EventMgr.inst.onOffEvent("showView", this, this.bossBorn);
        }
        Initial() {
            let _ran = Utils.Range(2, 5);
            this.mStateMachine.changeState(this.mIdleState, _ran);
        }
        PlayerLook() {
            this.Look.transform.localRotationEuler = this.Follow.transform.localRotationEuler.clone();
            this.LookCamera.active = true;
            let _script = this.LookCamera.getComponent(CameraLook);
            if (!_script) {
                this.LookCamera.addComponent(CameraLook);
            }
        }
        PlayerResume() {
            this.LookCamera.active = false;
            let _script = this.LookCamera.getComponent(CameraLook);
            if (_script) {
                _script.destroy();
            }
        }
        Init(copyName, index, OriginPos, EndPos, ranPrefab, nickName) {
            this.isDead = false;
            this.isMove = false;
            this.isHaveBoss = false;
            this.aiState = AIState.None;
            if (index >= 0) {
                this.item.destroyChildren();
                this.human.destroyChildren();
                let _resouce = SceneLogic.inst.CopyPrefabs.getChildByName(copyName);
                let _mod = Laya.Sprite3D.instantiate(_resouce, this.item, false);
                _mod.name = "AI_" + _mod.name;
                _mod.transform.localPosition = new Laya.Vector3(0, 0, 0);
                _mod.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                _mod.active = true;
                this.item.active = false;
                let _Playerlevel;
                if (UserComData.gameModel == GameModel.Runner) {
                    if (UserComData.RoletrySkinId != -1) {
                        _Playerlevel = 1;
                    }
                    else {
                        for (let i = 0; i < UserComData.PlayerSKinInfo.unlockRoleList.length; i++) {
                            if (UserComData.PlayerSKinInfo.unlockRoleList[i] == UserComData.PlayerSKinInfo.userRoleSkinId) {
                                _Playerlevel = UserComData.PlayerSKinInfo.RoleSkinLevelList[i];
                            }
                        }
                    }
                }
                else {
                    for (let i = 0; i < UserComData.PlayerSKinInfo.unlockBossList.length; i++) {
                        if (UserComData.PlayerSKinInfo.unlockBossList[i] == UserComData.PlayerSKinInfo.userBossSKinId) {
                            _Playerlevel = UserComData.PlayerSKinInfo.BossSkinLevelList[i];
                        }
                    }
                }
                let _minLevel = (_Playerlevel - 3) < 1 ? 1 : (_Playerlevel - 3);
                let _maxLevel = _Playerlevel;
                let _AIlevel = Utils.Range(_minLevel, _maxLevel);
                let prefabName = UserComData.RoleNameList[ranPrefab];
                let _level = UserComData.ShopRoleData[ranPrefab].level;
                this.HP = _level[_AIlevel].blood;
                this.MaxHP = _level[_AIlevel].blood;
                this.Speed = _level[_AIlevel].speed;
                let _obj = zs.laya.Resource.LoadSprite3d(prefabName);
                let Obj = zs.laya.ObjectPool.GetSprite3d(_obj);
                this.human.addChild(Obj);
            }
            if (OriginPos) {
                this.curRoadId = this.getCuridByPos(OriginPos);
                this.curFollowPos = OriginPos.clone();
            }
            if (EndPos) {
                if (EndPos instanceof Laya.Vector3) {
                    this.TargetRoadId = this.getCuridByPos(EndPos);
                }
                else {
                    this.TargetRoadId = this.getCuridByName(EndPos);
                }
            }
            this.userName = nickName.id;
            UserComData.runnerNameList.push(this.userName);
            this.humanAni = this.human.getChildAt(0).getComponent(Laya.Animator);
            this.curAniName = "role_wait";
            this.humanAni.crossFade("role_wait", 0.1);
        }
        updateAIMoveState() {
            let _ran = 2;
            if (_ran == 1) {
                this.mStateMachine.changeState(this.mIdleState, UserComData.check_time);
            }
            else if (_ran == 2) {
                this.mStateMachine.changeState(this.mMoveState, UserComData.check_time, 2);
            }
            else if (_ran == 3) {
                this.mStateMachine.changeState(this.mMoveState, UserComData.check_time, 3);
            }
        }
        onUpdateOther() {
            super.onUpdateOther();
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (this.isDead)
                return;
            this.UpdateHpPos();
            this.mStateMachine.stateMachineUpdate();
            this.UpdateAnimatorState();
            this.CheckDistance();
        }
        UpdateAnimatorState() {
            if (this.curAniName != "role_jump" && this.curAniName != "role_skill" && this.curAniName != "role_observation") {
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    if (this.curAniName != "role_run") {
                        this.curAniName = "role_run";
                        this.humanAni.crossFade("role_run", 0);
                    }
                }
                else {
                    if (this.curAniName != "role_wait") {
                        this.curAniName = "role_wait";
                        this.humanAni.crossFade("role_wait", 0);
                    }
                }
            }
        }
        OnDead() {
            this.mStateMachine.changeState(this.mHeadState);
        }
        onTriggerEnter(other) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
        }
        onTriggerStay(other) {
        }
        onTriggerExit(other) {
        }
        onCollisionEnter(other) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
        }
        onCollisionExit(other) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
        }
        getCuridByName(roadName) {
            let _name = "";
            for (let i = 0; i < UserComData.allRoadNameList.length; i++) {
                _name = UserComData.allRoadNameList[i];
                if (_name == roadName) {
                    return i;
                }
            }
        }
        getCuridByPos(Pos) {
            for (let i = 0; i < UserComData.allRoadPosList.length; i++) {
                if (Pos == UserComData.allRoadPosList[i]) {
                    return i;
                }
            }
        }
        ChangePos() {
            this.TargetList = [];
            let _Pos = UserComData.allRoadPosList[this.TargetRoadId];
            let targetName = UserComData.allRoadNameList[this.TargetRoadId];
            let curName = UserComData.allRoadNameList[this.curRoadId];
            this.lastRoadPos = _Pos;
            this.PushPos(curName, targetName);
        }
        PushPos(curName, targetName) {
            let _nextPosName = "";
            if (curName.indexOf("_") == -1 || targetName.indexOf(curName) == 0) {
                _nextPosName = curName;
            }
            else {
                _nextPosName = curName.substring(0, curName.lastIndexOf("_"));
                let _index = this.getCuridByName(_nextPosName);
                this.TargetList.push(UserComData.allRoadPosList[_index]);
            }
            if (targetName.indexOf(_nextPosName) == 0) {
                let _name = targetName.substring(_nextPosName.length + 1);
                if (_name) {
                    let _nList = _name.split("_");
                    let road = _nextPosName;
                    for (let i = 0; i < _nList.length; i++) {
                        road = road + "_" + _nList[i];
                        let _index = this.getCuridByName(road);
                        this.TargetList.push(UserComData.allRoadPosList[_index]);
                    }
                }
            }
            else {
                this.PushPos(_nextPosName, targetName);
            }
        }
        FollowPos() {
            if (this.TargetList.length < 1) {
                this.curRoadId = this.TargetRoadId;
                this.direction = new Laya.Vector3(0, this.Rb.linearVelocity.y, 0);
                this.mStateMachine.changeState(this.mLookState);
                return;
            }
            if (this.isImprisonment) {
                this.Rb.linearVelocity = new Laya.Vector3(0, this.Rb.linearVelocity.y, 0);
                return;
            }
            this.lastRoadPos = this.curFollowPos.clone();
            this.curRoadId = this.getCuridByPos(this.lastRoadPos);
            this.curPosName = UserComData.allRoadNameList[this.curRoadId];
            this.curFollowPos = this.TargetList.shift();
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * this.Speed, this.Rb.linearVelocity.y, _dir.z * this.Speed);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
            let _ran = Math.random();
            let _name = UserComData.allRoadNameList[this.getCuridByPos(this.curFollowPos)];
            let _EndName = _name.substring(_name.lastIndexOf("_") + 1);
            if (_ran < UserComData.AIJump || _EndName.indexOf("J") != -1) {
                this.PlayerJump(this.curFollowPos.y);
            }
            else {
                let _ranI = Math.random();
                if (_ranI < UserComData.AIIdle && !this.isHaveBoss) {
                    this.isImprisonment = true;
                    let _ranT = Utils.Range(1, 3);
                    Laya.timer.once(_ranT * 1000, this, () => {
                        this.isImprisonment = false;
                    });
                    this.Rb.linearVelocity = new Laya.Vector3(0, this.Rb.linearVelocity.y, 0);
                }
            }
            let _ranC = Math.random();
            if (_ranC < UserComData.AIChange && Laya.timer.currTimer - this.hitTime > UserComData.AIHitChangeItemTime * 1000) {
                this.ChangeItem();
            }
        }
        UpdateDir() {
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * this.Speed, this.Rb.linearVelocity.y, _dir.z * this.Speed);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        PlayerJump(_targetPosHeight) {
            this.curAniName = "role_jump";
            this.humanAni.crossFade("role_jump", 0.2);
            let _time = Laya.timer.currTimer;
            let dur = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(dur * 1000, this, () => {
                if (this.isDead)
                    return;
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    this.curAniName = "role_run";
                    this.humanAni.crossFade("role_run", 0.2);
                }
                else {
                    this.curAniName = "role_wait";
                    this.humanAni.crossFade("role_wait", 0.2);
                }
            });
            this.direction = new Laya.Vector3(this.direction.x, 6, this.direction.z);
            Laya.timer.once(150, this, () => {
                this.direction = new Laya.Vector3(this.direction.x, -1, this.direction.z);
                Laya.timer.once(200, this, () => {
                    if (_targetPosHeight - this.GetPosition().y > 0) {
                        this.PlayerJump(_targetPosHeight);
                    }
                    else {
                        this.Rb.linearVelocity = new Laya.Vector3(this.direction.x, 0, this.direction.z);
                    }
                });
            });
        }
        ChangeItem() {
            this.ef_BSDMM_transformation.active = false;
            this.ef_BSDMM_transformation.active = true;
            this.GetTransForm().position.y += 0.05;
            if (!this.item.active) {
                this.human.transform.localPositionY = 500;
                let _mod = this.item.getChildAt(0);
                this.item.active = true;
                let _bound = _mod.getComponent(Laya.PhysicsCollider).colliderShape.clone();
                this.Rb.colliderShape = _bound.clone();
            }
            else {
                this.human.transform.localPositionY = 0;
                let _mod = this.human.getChildAt(0);
                _mod.active = true;
                this.item.active = false;
                let _bound = _mod.getComponent(Laya.PhysicsCollider).colliderShape.clone();
                this.Rb.colliderShape = _bound.clone();
            }
            this.GetTransForm().position.y -= 0.05;
        }
        CheckDistance() {
            if (UserComData.gameModel == GameModel.Runner)
                return;
            if (UserComData.HaveTips)
                return;
            let _dis = Laya.Vector3.distance(this.GetPosition(), SceneLogic.inst.player.transform.position);
            _dis = Math.round(_dis * 10) / 10;
            if (_dis > 7)
                return;
            let _ran = Math.random();
            if (_dis == 2 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "front");
                SoundMgr.inst.playSound("distance_2");
                if (_ran < UserComData.AiRun && this.State == 0) {
                    if (_ran < 0.3) {
                        this.ChangeItem();
                    }
                    this.ChangeEndPos();
                }
            }
            else if (_dis == 4 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "nearby");
                SoundMgr.inst.playSound("distance_4");
                if (_ran < UserComData.AiRun && this.State == 0) {
                    if (_ran < 0.3) {
                        this.ChangeItem();
                    }
                    this.ChangeEndPos();
                }
            }
            else if (_dis == 6 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "around");
                SoundMgr.inst.playSound("distance_6");
            }
        }
        CheckisOneRoom() {
            let _isOneRoom = true;
            let _result = new Array();
            let _originPos = new Laya.Vector3(this.GetPosition().x, this.GetPosition().y + 1, this.GetPosition().z);
            let _targetPos = new Laya.Vector3(SceneLogic.inst.player.transform.position.x, SceneLogic.inst.player.transform.position.y + 1, SceneLogic.inst.player.transform.position.z);
            if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(_originPos, _targetPos, _result)) {
                _result.forEach(element => {
                    if (element.collider.owner.name.indexOf("room0") != -1) {
                        _isOneRoom = false;
                    }
                });
            }
            return _isOneRoom;
        }
        rayCheck() {
            let direction = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(new Laya.Vector3(this.GetObj().transform.position.x, this.GetObj().transform.position.y + 1, this.GetObj().transform.position.z), this.LookCamera.transform.position, direction);
            this.ray.origin = this.LookCamera.transform.position;
            this.ray.direction = direction;
            SceneLogic.inst.Game_Scene.physicsSimulation.rayCastAll(this.ray, this.hitresults, Laya.Vector3.scalarLength(direction));
            if (this.hitresults.length > 0) {
                let tempMap = {};
                for (let i = 0; i < this.hitresults.length; i++) {
                    let hitresult = this.hitresults[i];
                    let collider = hitresult.collider.owner;
                    if (collider.name && (collider.name.indexOf("Mod_") != -1 || collider.name.indexOf("room") != -1)) {
                        if (!collider.meshRenderer)
                            continue;
                        let mat = collider.meshRenderer.material;
                        mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
                        mat.albedoColorA = 0.2;
                        tempMap[collider.id] = collider;
                    }
                }
                var keys = Object.keys(UserComData.AlphaObjList);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    if (!tempMap[key]) {
                        var obj = UserComData.AlphaObjList[key];
                        var mat = obj.meshRenderer.material;
                        if (mat) {
                            Laya.timer.clearAll(mat);
                            Laya.Tween.clearAll(mat);
                            mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
                            mat.albedoColorA = 1;
                        }
                    }
                }
                UserComData.AlphaObjList = tempMap;
            }
            else {
                this.refreshObjAlpha();
            }
        }
        refreshObjAlpha() {
            var keys = Object.keys(UserComData.AlphaObjList);
            for (var index = keys.length - 1; index >= 0; index--) {
                var key = keys[index];
                var obj = UserComData.AlphaObjList[key];
                var mat = obj.meshRenderer.material;
                if (mat) {
                    Laya.timer.clearAll(mat);
                    Laya.Tween.clearAll(mat);
                    mat.albedoColorA = 1;
                }
            }
            UserComData.AlphaObjList = {};
        }
    }

    class BossAttackState extends State {
        constructor() {
            super(...arguments);
            this._downTime = 0;
        }
        Enter(owner, data) {
            owner.AttackItem();
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class BossCatchState extends State {
        constructor() {
            super(...arguments);
            this._downTime = 0;
            this._type = 0;
            this._CatchTime = 0;
            this._isCatch = false;
            this._attackTime = 0;
        }
        Enter(owner, data) {
            owner._StuckCount = 0;
            owner.catchCount++;
            owner.catchCount = owner.catchCount > 2 ? 2 : owner.catchCount;
            this._type = 0;
            owner.isCatchPlayer = true;
            this._isCatch = false;
            this._CatchTime = 0;
            owner.aiState = AIState.Catch;
            EventMgr.inst.emit("BossCatch", 1);
        }
        Execute(owner) {
            if (owner.TargetAttack.name.indexOf("Death") != -1 || UserComData.isStealthState) {
                owner.CheckNearPos();
                owner.isFollow = true;
                owner.aiState = AIState.Move;
                owner.mStateMachine.changeState(owner.mIdleState, 1);
                return;
            }
            if (this._type == 0 && !owner.CheckTargetisOneRoom(owner.TargetAttack)) {
                this._type = 1;
                owner.CheckNearPos();
                owner.CheckRunnerNearPosId();
                owner.MoveToNearPos();
                owner.ChangePos();
            }
            owner.Rb.linearVelocity = owner.direction;
            if (this._type == 0) {
                let _pos = new Laya.Vector3(owner.TargetAttack.transform.position.x, owner.GetTransForm().position.y, owner.TargetAttack.transform.position.z);
                let _dis = Laya.Vector3.distance(owner.GetTransForm().position, _pos);
                if (_dis < 3 && !this._isCatch) {
                    this._isCatch = true;
                    this._CatchTime = Laya.timer.currTimer;
                }
                if (this._isCatch && Laya.timer.currTimer - this._CatchTime > UserComData.BossCatchTimeList[owner.catchCount] * 1000) {
                    this._CatchTime = Laya.timer.currTimer;
                    owner.isCatchPlayer = false;
                    console.log("追击玩家时间过长，结束追击----");
                    owner.CheckNearPos();
                    owner.mStateMachine.changeState(owner.mMoveState);
                    return;
                }
                if (_dis > 0.8) {
                    owner.FollowRunner();
                }
                else {
                    if (Laya.timer.currTimer - this._attackTime > 2000) {
                        if (owner.TargetAttack.transform.localPositionY - owner.GetPosition().y > 0.7) {
                            owner.BossJump();
                        }
                        owner.direction = new Laya.Vector3(0, owner.direction.y, 0);
                        this._attackTime = Laya.timer.currTimer;
                        owner.LookAtPlayer(owner.TargetAttack);
                        owner.BossAttack(owner.TargetAttack);
                    }
                }
            }
            else {
                let _pos = new Laya.Vector3(owner.curFollowPos.x, owner.GetTransForm().position.y, owner.curFollowPos.z);
                if (Laya.Vector3.distance(owner.GetTransForm().position, _pos) < 0.2) {
                    if (owner.TargetList.length < 1 || owner.curRoadId == owner.TargetRoadId) {
                        this._type = 0;
                    }
                    owner.FollowState();
                }
            }
        }
        Exit(owner) {
            owner.isCatchPlayer = false;
            EventMgr.inst.emit("BossCatch", 2);
        }
        ManualExecute(owner) {
        }
    }

    class BossFollowAIState extends State {
        constructor() {
            super(...arguments);
            this._attackTime = 0;
        }
        Enter(owner, data) {
            owner._StuckCount = 0;
            owner.direction = new Laya.Vector3(0, 0, 0);
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (!owner.CheckTargetisOneRoom(owner.TargetAttack)) {
                owner.mStateMachine.changeState(owner.mFollowState);
            }
            if (owner.TargetAttack.name.indexOf("Death") != -1) {
                let _ranCatch = Math.random();
                console.log("追击玩家基准概率：", UserComData.modeDifficulty[UserComData.modeDifficultyLevel].probability);
                if (_ranCatch <= UserComData.modeDifficulty[UserComData.modeDifficultyLevel].probability) {
                    console.log("杀死AI之后追击玩家");
                    owner.direction = new Laya.Vector3(0, owner.direction.y, 0);
                    owner.TargetAttack = SceneLogic.inst.player;
                    owner.mStateMachine.changeState(owner.mCatchState, 1);
                    return;
                }
                else {
                    owner.CheckNearPos();
                    owner.isFollow = true;
                    owner.aiState = AIState.Move;
                    owner.mStateMachine.changeState(owner.mIdleState, 1);
                    return;
                }
            }
            let _Tarpos = new Laya.Vector3(owner.TargetAttack.transform.position.x, owner.GetTransForm().position.y, owner.TargetAttack.transform.position.z);
            let _Tardis = Laya.Vector3.distance(owner.GetTransForm().position, _Tarpos);
            if (_Tardis > 0.8) {
                owner.FollowRunner();
            }
            else {
                if (Laya.timer.currTimer - this._attackTime > 1500) {
                    if (owner.TargetAttack.transform.localPositionY - owner.GetPosition().y > 0.7) {
                        owner.BossJump();
                    }
                    owner.direction = new Laya.Vector3(0, owner.direction.y, 0);
                    this._attackTime = Laya.timer.currTimer;
                    owner.LookAtPlayer(owner.TargetAttack);
                    owner.BossAttack(owner.TargetAttack);
                }
            }
            owner.Rb.linearVelocity = owner.direction;
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class BossFollowState extends State {
        constructor() {
            super(...arguments);
            this._attackTime = 0;
        }
        Enter(owner, data) {
            owner.aiState = AIState.Follow;
            owner.CheckNearPos();
            owner.CheckRunnerNearPosId();
            owner.ChangePos();
            owner.FollowState();
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            owner.Rb.linearVelocity = owner.direction;
            owner.UpdateDir();
            let _pos = new Laya.Vector3(owner.curFollowPos.x, owner.GetTransForm().position.y, owner.curFollowPos.z);
            let _dis = Laya.Vector3.distance(owner.GetTransForm().position, _pos);
            if (_dis < 0.2) {
                owner.FollowState();
            }
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class BossIdleState extends State {
        Enter(owner, data) {
        }
        Execute(owner) {
        }
        Exit(owner) {
            owner.ef_BSDMM_seal.active = false;
        }
        ManualExecute(owner) {
            owner.mStateMachine.changeState(owner.mMoveState);
        }
    }

    class BossLookState extends State {
        Enter(owner, data) {
            owner.curAniName = "role_burst";
            owner.humanAni.crossFade("role_burst", 0.1);
            SoundMgr.inst.playSound("boss_burst");
            if (!owner.isBurst) {
                owner.ef_BSDMM_burst.active = false;
            }
            else {
                owner.ef_BSDMM_burst.getChildByName("ef_baowei").active = false;
                owner.ef_BSDMM_burst.getChildByName("ef_baowei").active = true;
            }
            owner.ef_BSDMM_burst.active = true;
            let dur = owner.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(dur * 1000, this, () => {
                owner.curAniName = "role_wait";
                if (!owner.isBurst) {
                    owner.ef_BSDMM_burst.active = false;
                }
                let _ran = Math.random();
                if (_ran < UserComData.BossLooktoAttack) {
                    owner.CheckTriggerItemByArea();
                }
                else {
                    owner.mStateMachine.changeState(owner.mIdleState, 1);
                }
            });
        }
        Execute(owner) {
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class BossMoveState extends State {
        Enter(owner, data) {
            this.owner = owner;
            owner.ChangePos();
            owner._StuckCount = 0;
            if (owner.isFollow) {
                owner.isFollow = false;
                let _list = [];
                _list.push(owner.RoadPosList[owner.curRoadId]);
                _list = _list.concat(owner.TargetList);
                owner.TargetList = _list;
            }
            owner.FollowPos();
            owner.aiState = AIState.Move;
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            owner.Rb.linearVelocity = owner.direction;
            owner.UpdateDir();
            let _pos = new Laya.Vector3(owner.curFollowPos.x, this.owner.GetTransForm().position.y, owner.curFollowPos.z);
            if (Laya.Vector3.distance(this.owner.GetTransForm().position, _pos) < 0.1 && owner.aiState == AIState.Move) {
                owner.FollowPos();
            }
        }
        Exit(owner) {
            if (!owner.Rb || !owner.Rb.linearVelocity)
                return;
            owner.Rb.linearVelocity = new Laya.Vector3(0, owner.Rb.linearVelocity.y, 0);
        }
        ManualExecute(owner) {
        }
    }

    class BossOverState extends State {
        Enter(owner, data) {
            if (UserComData.curSkillCount < UserComData.MaxPlayer) {
                owner.aiState = AIState.Catch;
                owner.CheckNearPos();
                owner.ChangePos();
                owner.MoveToNearPos();
                owner.curAniName = "role_run";
                owner.humanAni.crossFade("role_run", 0.1);
            }
            else {
                owner.curAniName = "role_win";
                owner.humanAni.crossFade("role_win", 0.1);
            }
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState == GameState.wait)
                return;
            owner.Rb.linearVelocity = owner.direction;
            owner.UpdateDir();
            let _pos = new Laya.Vector3(owner.curFollowPos.x, owner.GetTransForm().position.y, owner.curFollowPos.z);
            if (Laya.Vector3.distance(owner.GetTransForm().position, _pos) < 0.1) {
                owner.FollowState();
            }
        }
        Exit(owner) {
            owner.ef_BSDMM_seal.active = false;
        }
        ManualExecute(owner) {
        }
    }

    class Bullets extends Laya.Script3D {
        constructor() {
            super();
            this.hitresult = [];
        }
        onAwake() {
            console.log("jinru");
            this.obj = this.owner;
            this.obj.transform.position = UserComData.BulletOriginPos.clone();
            this.dirction = UserComData.BulletDirection;
            this.ray = new Laya.Ray(this.obj.transform.position.clone(), this.dirction);
            this.shape = this.obj.getComponent(Laya.PhysicsCollider).colliderShape;
            Laya.timer.once(1000, this, () => {
                zs.laya.ObjectPool.RecoverSprite3d(this.obj);
                if (SceneLogic.inst.gameState != GameState.playing)
                    return;
                this.destroy();
            });
        }
        onUpdate() {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.hitresult = [];
            let _target = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.add(this.obj.transform.position, new Laya.Vector3(this.dirction.x * UserComData.BulletSpeedFactor, this.dirction.y * UserComData.BulletSpeedFactor, this.dirction.z * UserComData.BulletSpeedFactor), _target);
            if (SceneLogic.inst.Game_Scene.physicsSimulation.shapeCastAll(this.shape, this.obj.transform.position, _target, this.hitresult)) {
                zs.laya.ObjectPool.RecoverSprite3d(this.obj);
                this.hitresult.forEach(element => {
                    if (SceneLogic.inst.gameState != GameState.playing)
                        return;
                    if (element.collider.owner == null) {
                        return;
                    }
                    if (UserComData.gameModel == GameModel.Pursuer || UserComData.isLookBoss) {
                        SoundMgr.inst.playSound("boss_attack");
                        zs.laya.sdk.DeviceService.VibrateShort();
                    }
                    if (element.collider.owner.name.indexOf("Mod_") != -1) {
                        let _obj = element.collider.owner;
                        SceneLogic.inst.SpawEffect("ef_BSDMM_transformation", _obj.transform.position);
                        if (UserComData.gameModel == GameModel.Pursuer || UserComData.isLookBoss) {
                            SoundMgr.inst.playSound("hit");
                        }
                        element.collider.owner.destroy();
                    }
                    else if (element.collider.owner.name.indexOf("Player") != -1 && UserComData.gameModel == GameModel.Runner) {
                        if (SceneLogic.inst.gameState != GameState.playing)
                            return;
                        EventMgr.inst.emit("HitPlayer");
                    }
                    else if (element.collider.owner.name.indexOf("AI_") != -1) {
                        let _ai = SceneLogic.inst.AIPool.getChildByName(element.collider.owner.name);
                        if (!_ai)
                            return;
                        let _aiScript = _ai.getComponent(AI);
                        if (_aiScript) {
                            if (_aiScript.item.active) {
                                _aiScript.ChangeItem();
                            }
                            if (!_ai)
                                return;
                            EventMgr.inst.emit("HitAI", _ai.name);
                        }
                        if (UserComData.curSkillCount >= UserComData.MaxPlayer) {
                            SceneLogic.inst.gameState = GameState.over;
                            if (UserComData.gameModel == GameModel.Runner) {
                                EventMgr.inst.emit("GameLose");
                            }
                            else {
                                EventMgr.inst.emit("GameWin");
                            }
                        }
                    }
                });
                zs.laya.ObjectPool.RecoverSprite3d(this.obj);
                this.destroy();
            }
        }
    }

    class PlayerHitState extends State {
        Enter(owner, data) {
        }
        Execute(owner) {
            if (owner.isDead)
                return;
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
    }

    class PlayerLookState extends State {
        constructor() {
            super(...arguments);
            this.MovePointX = 0;
            this.MovePointY = 0;
            this.RotatePointX = 0;
            this.RotatePointY = 0;
            this.MoveId = -1;
            this.RotateId = -1;
        }
        Enter(owner, data) {
            owner.State = 0;
            this.MoveId = -1;
            this.RotateId = -1;
            owner.Rb.linearVelocity = new Laya.Vector3(0, owner.Rb.linearVelocity.y, 0);
            this.oldEluer = owner.Follow.transform.localRotationEuler.clone();
            this.oldPos = owner.Follow.transform.localPosition.clone();
            SceneLogic.inst.Camera_Main.active = false;
            let _Boss = SceneLogic.inst.AIPool.getChildByName("Boss");
            if (_Boss) {
                this._BossScript = _Boss.getComponent(Boss);
            }
            if (this._BossScript) {
                this.ChangeLookBoss();
            }
            else {
                this.ChangeLookItem();
            }
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("LookBoss", "进入观察模式"));
            EventMgr.inst.onEvent("ChangeLookItem", this, this.ChangeLookItem);
            EventMgr.inst.onEvent("ChangeLookBoss", this, this.ChangeLookBoss);
        }
        ChangeLookItem() {
            if (this._script) {
                this._script.PlayerResume();
            }
            if (this._BossScript) {
                this._BossScript.PlayerResume();
            }
            if (UserComData.ChangeItemIndex >= UserComData.RunnerList.length) {
                UserComData.ChangeItemIndex = 1;
            }
            let _obj = UserComData.RunnerList[UserComData.ChangeItemIndex];
            UserComData.ChangeItemIndex++;
            while (!_obj) {
                if (UserComData.ChangeItemIndex >= UserComData.RunnerList.length) {
                    UserComData.ChangeItemIndex = 1;
                }
                _obj = UserComData.RunnerList[UserComData.ChangeItemIndex];
                UserComData.ChangeItemIndex++;
            }
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("LookAI", "进入观察喵喵"));
            this._script = _obj.getComponent(AI);
            if (this._script) {
                this._script.PlayerLook();
            }
            UserComData.isLookBoss = false;
        }
        ChangeLookBoss() {
            let _Boss = SceneLogic.inst.AIPool.getChildByName("Boss");
            if (!_Boss)
                return;
            this._BossScript = _Boss.getComponent(Boss);
            this._BossScript.PlayerLook();
            if (this._script) {
                this._script.PlayerResume();
            }
            UserComData.isLookBoss = true;
        }
        Execute(owner) {
            if (owner.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            owner.Rb.linearVelocity = new Laya.Vector3(0, owner.Rb.linearVelocity.y, 0);
        }
        Exit(owner) {
            owner.Follow.transform.localRotationEuler = this.oldEluer.clone();
            owner.Follow.transform.localPosition = this.oldPos.clone();
            SceneLogic.inst.Camera_Main.active = true;
            if (this._script) {
                this._script.PlayerResume();
            }
            if (this._BossScript) {
                this._BossScript.PlayerResume();
            }
            UserComData.isLookBoss = false;
            EventMgr.inst.onOffEvent("ChangeLookItem", this, this.ChangeLookItem);
            EventMgr.inst.onOffEvent("ChangeLookBoss", this, this.ChangeLookBoss);
        }
        ManualExecute(owner) {
        }
        OnDown(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.stageX <= Laya.stage.width / 2 && this.MoveId == -1) {
                this.MovePointX = arg.stageX;
                this.MovePointY = arg.stageY;
                this.MoveId = arg.touchId;
            }
            if (arg.stageX > Laya.stage.width / 2 && this.RotateId == -1) {
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
                this.RotateId = arg.touchId;
            }
        }
        OnMove(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                let deltaX = arg.stageX - this.RotatePointX;
                let deltaY = arg.stageY - this.RotatePointY;
                this.owner.PlayerLookRotate(deltaX, deltaY);
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
            }
            if (arg.touchId == this.MoveId) {
                let deltaX = arg.stageX - this.MovePointX;
                let deltaY = arg.stageY - this.MovePointY;
                if (this.owner.Follow.transform.localRotationEulerY % 360 > 180 || (this.owner.Follow.transform.localRotationEulerY < 0 && this.owner.Follow.transform.localRotationEulerY % 360 >= -180)) {
                    deltaX = -deltaX;
                }
                if (Math.abs(this.owner.Follow.transform.localRotationEulerY) % 360 >= 90 && Math.abs(this.owner.Follow.transform.localRotationEulerY) % 360 <= 270) {
                    deltaY = -deltaY;
                }
                let mouseMoveDir = new Laya.Vector3(deltaX, 0, deltaY);
                let forward = new Laya.Vector3(0, 0, 0);
                this.owner.Follow.transform.getForward(forward);
                Laya.Vector3.multiply(forward, mouseMoveDir, forward);
                Laya.Vector3.normalize(forward, forward);
                this.owner.PlayerLookMove(forward);
            }
        }
        OnUp(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.MoveId) {
                this.MoveId = -1;
            }
            if (arg.touchId == this.RotateId) {
                this.RotateId = -1;
            }
        }
    }

    class PlayermIdleState extends State {
        Enter(owner, data) {
            this.owner = owner;
        }
        Execute(owner) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
        }
        Exit(owner) {
        }
        ManualExecute(owner) {
        }
        onDown() {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
        }
    }

    class PlayerMoveState extends State {
        constructor() {
            super(...arguments);
            this.mouseDownPointX = 0;
            this.mouseDownPointY = 0;
            this.lastPoint = new Laya.Vector2(0, 0);
            this.lastTwoPoint = new Laya.Vector2(0, 0);
            this.isFrist = true;
            this.isTwoFrist = true;
            this.isMove = false;
            this.isRotate = false;
            this.MovePointX = 0;
            this.MovePointY = 0;
            this.RotatePointX = 0;
            this.RotatePointY = 0;
            this.MoveId = -1;
            this.RotateId = -1;
            this._vibrateTime = 0;
            this._moveState = 0;
            this._x = 0;
            this._y = 0;
            this.keyList = [];
            this._isplay = false;
            this.moveArg = new Laya.Vector2(0, 0);
        }
        Enter(owner, data) {
            this.MoveId = -1;
            this.RotateId = -1;
            this.owner = owner;
            owner.Rb.angularFactor = new Laya.Vector3(0, 0, 0);
            if (!Laya.Browser.onMobile) {
                console.log("onPc===============");
                Laya.stage.on(Laya.Event.KEY_DOWN, this, this.keyDown);
                Laya.stage.on(Laya.Event.KEY_UP, this, this.keyUp);
                Laya.timer.frameLoop(1, this, this.loopCheck);
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnRightDown);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnRightUp);
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnRightMove);
            }
            else {
                console.log("onMobile===============");
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnDown);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnUp);
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnMove);
            }
        }
        Execute(owner) {
            if (!Laya.Browser.onPC) {
                let touchuCount = SceneLogic.inst.Game_Scene.input.touchCount();
                if (touchuCount == 0) {
                    this.MoveId = -1;
                    this.RotateId = -1;
                }
            }
            if (this.MoveId != -1) {
                owner.State = 1;
                let deltaX = this.moveArg.x - this.MovePointX;
                let deltaY = this.moveArg.y - this.MovePointY;
                owner.PlayerMove(deltaX, deltaY);
            }
        }
        Exit(owner) {
            this._moveState = 0;
            this.keyList = [];
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.OnDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnUp);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnMove);
            Laya.stage.off(Laya.Event.KEY_DOWN, this, this.keyDown);
            Laya.stage.off(Laya.Event.KEY_UP, this, this.keyUp);
        }
        keyDown(e) {
            console.log("keyDown");
            if (UserComData.PlayerisLook) {
                return;
            }
            if (e.keyCode == 87 || e.keyCode == 83 || e.keyCode == 65 || e.keyCode == 68) {
                if (UserComData.isGuide && UserComData.GuideId == 1) {
                    Laya.stage.event("hideGuide");
                }
                if (this.keyList.indexOf(e.keyCode) == -1) {
                    this.keyList.push(e.keyCode);
                }
            }
            this.owner.PlayerMove(this._x, this._y);
        }
        keyUp(e) {
            if (this.keyList && this.keyList.length <= 0) {
                this._y = 0;
                this._x = 0;
                UserComData.MoveBack = false;
                UserComData.MoveRight = false;
                if (this.owner.item.active) {
                    this.owner.State = 0;
                }
            }
            for (let i = 0; i < this.keyList.length; i++) {
                if (this.keyList[i] == e.keyCode) {
                    this.keyList.splice(i, 1);
                    if (e.keyCode == 87 || e.keyCode == 83) {
                        this._y = 0;
                    }
                    if (e.keyCode == 65 || e.keyCode == 68) {
                        this._x = 0;
                    }
                }
            }
            if (UserComData.isGuide && UserComData.GuideId == 1) {
                console.log("goGuide=");
                EventMgr.inst.emit("goGuide", "rotate");
                UserComData.GuideId = 2;
            }
        }
        loopCheck() {
            if (this.keyList.length > 1 && !this._isplay) {
                this._isplay = true;
            }
            if (this.keyList.length < 1 && this._isplay) {
                this._isplay = false;
            }
            if (UserComData.PlayerisLook) {
                Laya.timer.clear(this, this.loopCheck);
                return;
            }
            for (let i = 0; i < this.keyList.length; i++) {
                let keyCode = this.keyList[i];
                if (keyCode == 87) {
                    UserComData.MoveBack = false;
                    if (this._y <= -0.5)
                        continue;
                    this._y -= 0.5;
                    this.owner.Mod.transform.localRotationEulerY = this.owner.Follow.transform.localRotationEulerY;
                }
                if (keyCode == 83) {
                    UserComData.MoveBack = true;
                    if (this._y >= 0.5)
                        continue;
                    this._y += 0.5;
                    this.owner.Mod.transform.localRotationEulerY = this.owner.Follow.transform.localRotationEulerY - 180;
                }
                if (keyCode == 65) {
                    UserComData.MoveRight = false;
                    if (this._x <= -0.5)
                        continue;
                    this._x -= 0.5;
                    this.owner.Mod.transform.localRotationEulerY = this.owner.Follow.transform.localRotationEulerY + 90;
                }
                if (keyCode == 68) {
                    UserComData.MoveRight = true;
                    if (this._x >= 0.5)
                        continue;
                    this._x += 0.5;
                    this.owner.Mod.transform.localRotationEulerY = this.owner.Follow.transform.localRotationEulerY - 90;
                }
            }
            this.owner.PlayerMove(this._x, this._y);
        }
        ManualExecute(owner) {
        }
        OnDown(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.stageX <= Laya.stage.width / 2 && this.MoveId == -1) {
                this.MovePointX = arg.stageX;
                this.MovePointY = arg.stageY;
                this.MoveId = arg.touchId;
            }
            if (arg.stageX > Laya.stage.width / 2 && this.RotateId == -1) {
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
                this.RotateId = arg.touchId;
            }
        }
        OnRightDown(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.stageX > Laya.stage.width / 2 && this.RotateId == -1) {
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
                this.RotateId = arg.touchId;
            }
        }
        OnMove(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                let deltaX = arg.stageX - this.RotatePointX;
                let deltaY = arg.stageY - this.RotatePointY;
                this.owner.PlayerRotate(deltaX, deltaY);
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
            }
            if (arg.touchId == this.MoveId) {
                this.owner.State = 1;
                this.moveArg.x = arg.stageX;
                this.moveArg.y = arg.stageY;
            }
        }
        OnRightMove(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                let deltaX = arg.stageX - this.RotatePointX;
                let deltaY = arg.stageY - this.RotatePointY;
                this.owner.PlayerRotate(deltaX, deltaY);
                this.RotatePointX = arg.stageX;
                this.RotatePointY = arg.stageY;
            }
        }
        OnUp(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.MoveId) {
                this.owner.Rb.linearVelocity = new Laya.Vector3(0, this.owner.Rb.linearVelocity.y, 0);
                this.MoveId = -1;
                this.owner.State = 0;
            }
            if (arg.touchId == this.RotateId) {
                this.RotateId = -1;
            }
        }
        OnRightUp(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (this.owner.isDead) {
                return;
            }
            if (arg.touchId == this.RotateId) {
                this.RotateId = -1;
            }
        }
    }

    class Player$1 extends Actor {
        constructor() {
            super();
            this.isDead = false;
            this.isMove = false;
            this.mIdleState = new PlayermIdleState();
            this.mMoveState = new PlayerMoveState();
            this.mHitState = new PlayerHitState();
            this.mLookState = new PlayerLookState();
            this._factor = 1;
            this.increasedSpeed = 0;
            this.isHideFu = false;
            this._hitTime = 0;
            this.fuRodateSpeed = 30;
            this.rotateSpeed = 5;
            this.isLerp = false;
            this.lerpStartTime = 0;
        }
        onSpawn() {
            super.onSpawn();
            this.GetObj().active = true;
            this.Rb = this.GetObj().getComponent(Laya.Rigidbody3D);
            this.Rb.mass = 1000;
            this.Rb.canCollideWith = 0 ^ 3;
            this.Rb.collisionGroup = 3;
            this.Mod = this.owner.getChildByName("player");
            this.fu = this.owner.getChildByName("fu");
            this.fu.active = false;
            this.cat = this.Mod.getChildByName("cat");
            this.cat.active = false;
            this.human = this.Mod.getChildByName("human");
            this.item = this.Mod.getChildByName("item");
            this.BulletTarget = this.Mod.getChildByName("BulletTarget");
            this.humanAni = this.human.getChildAt(0).getComponent(Laya.Animator);
            this.Follow = this.owner.getChildByName("Follow");
            this.ef_BSDMM_recovery = this.Follow.getChildByName("ef_BSDMM_recovery");
            this.ef_BSDMM_recovery.active = false;
            this.ef_BSDMM_accelerate = this.Follow.getChildByName("ef_BSDMM_accelerate");
            this.ef_BSDMM_accelerate.active = false;
            this.ef_BSDMM_invisible = this.Follow.getChildByName("ef_BSDMM_invisible");
            this.ef_BSDMM_invisible.active = false;
            this.ef_BSDMM_transformation = this.Follow.getChildByName("ef_BSDMM_transformation2");
            this.ef_BSDMM_transformation.active = false;
            this.ef_BSDMM_seal = this.Follow.getChildByName("ef_BSDMM_seal");
            this.ef_BSDMM_seal.active = false;
            this.ef_BSDMM_burst = this.Follow.getChildByName("ef_BSDMM_burst");
            this.ef_BSDMM_burst.active = false;
            this.ef_BSDMM_zhuaji = this.Mod.getChildByName("ef_BSDMM_zhuaji");
            this.ef_BSDMM_zhuaji.active = false;
            this.ef_BSDMM_range = this.Mod.getChildByName("ef_BSDMM_range");
            this.ef_BSDMM_range.active = false;
            this.ShapePool = this.Follow.getChildByName("ShapePool");
            this.mStateMachine = new StateMachine(this);
            this.mStateMachine.changeState(this.mMoveState);
            EventMgr.inst.onEvent("ChangeItem", this, this.ChangeItem);
            EventMgr.inst.onEvent("ChangeState", this, this.ChangeState);
            EventMgr.inst.onEvent("PlayerJump", this, this.PlayerJump);
            EventMgr.inst.onEvent("BossAttack", this, this.BossAttack);
            EventMgr.inst.onEvent("RunnerSkill", this, this.RunnerSkill);
            EventMgr.inst.onEvent("Initial", this, this.Initial);
            EventMgr.inst.onEvent("PlayerDead", this, this.PlayerDead);
            EventMgr.inst.onEvent("HitPlayer", this, this.HitPlayer);
            EventMgr.inst.onEvent("ResumeCamera", this, this.ResumeCamera);
            EventMgr.inst.onEvent("BossBurst", this, this.BossBurst);
            EventMgr.inst.onEvent("goldRefreshItem", this, this.goldRefreshItem);
            EventMgr.inst.onEvent("HideFu", this, this.HideFu);
            EventMgr.inst.onEvent("activationFu", this, this.activationFu);
            EventMgr.inst.onEvent("bossSeal", this, this.bossSeal);
            EventMgr.inst.onEvent("Accelerate", this, this.Accelerate);
            EventMgr.inst.onEvent("Recover", this, this.Recover);
            EventMgr.inst.onEvent("Stealth", this, this.Stealth);
            EventMgr.inst.onEvent("Hint", this, this.Hint);
            EventMgr.inst.onEvent("ReBorn", this, this.ReBorn);
        }
        Accelerate() {
            this.ef_BSDMM_accelerate.active = false;
            this.ef_BSDMM_accelerate.active = true;
            this.increasedSpeed = UserComData.roleSkillInfo.accelerate[0];
            Laya.timer.once(UserComData.roleSkillInfo.accelerate[1] * 1000, this, () => {
                this.increasedSpeed = 0;
                this.ef_BSDMM_accelerate.active = false;
            });
        }
        Recover() {
            this.ef_BSDMM_recovery.active = false;
            this.ef_BSDMM_recovery.active = true;
            this.HP = this.MaxHP;
            EventMgr.inst.emit("AddHP");
        }
        Stealth() {
            this.ef_BSDMM_invisible.active = false;
            this.ef_BSDMM_invisible.active = true;
            let _item = this.item.getChildAt(0);
            let mat = _item.meshRenderer.material;
            mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
            mat.albedoColorA = 0.6;
            let _human = this.human.getChildAt(0);
            let _child;
            for (let i = 0; i < _human.numChildren; i++) {
                if (_human.getChildAt(i).name.indexOf("mod_") != -1) {
                    _child = _human.getChildAt(i);
                }
            }
            let _childMat = _child.skinnedMeshRenderer.material;
            _childMat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
            _childMat.albedoColorA = 0.6;
            UserComData.isStealthState = true;
            Laya.timer.once(UserComData.roleSkillInfo.stealth[0] * 1000, this, () => {
                UserComData.isStealthState = false;
                if (SceneLogic.inst.gameState != GameState.playing)
                    return;
                this.ef_BSDMM_invisible.active = false;
                if (mat) {
                    mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
                    mat.albedoColorA = 1;
                }
                if (_childMat) {
                    _childMat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
                    _childMat.albedoColorA = 1;
                }
            });
        }
        ResumeStealth() {
            let _human = this.human.getChildAt(0);
            let _child;
            for (let i = 0; i < _human.numChildren; i++) {
                if (_human.getChildAt(i).name.indexOf("mod_") != -1) {
                    _child = _human.getChildAt(i);
                }
            }
            let _childMat = _child.skinnedMeshRenderer.material;
            _childMat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
            _childMat.albedoColorA = 1;
            this.ef_BSDMM_invisible.active = false;
        }
        Hint() {
            for (let i = 0; i < UserComData.RunnerList.length; i++) {
                let element = UserComData.RunnerList[i];
                if (element) {
                    let _script = element.getComponent(AI);
                    if (_script && !_script.ef_BSDMM_wh.active && _script.State == 0 && !_script.isDead) {
                        _script.ef_BSDMM_wh.active = true;
                        return;
                    }
                }
            }
        }
        Imprisonment() {
            for (let i = 0; i < UserComData.RunnerList.length; i++) {
                let element = UserComData.RunnerList[i];
                if (element) {
                    let _script = element.getComponent(AI);
                    if (_script && _script.State == 1 && !_script.isDead) {
                        _script.Imprisonment();
                        return;
                    }
                }
            }
        }
        CheckAIState() {
            let _canHintCount = 0;
            let _canImprisonmentCount = 0;
            for (let i = 0; i < UserComData.RunnerList.length; i++) {
                let element = UserComData.RunnerList[i];
                if (element) {
                    let _script = element.getComponent(AI);
                    if (_script) {
                        if (_script.State == 0) {
                            if (!_script.ef_BSDMM_wh.active && !_script.isDead) {
                                _canHintCount++;
                            }
                        }
                        else if (_script.State == 1 && !_script.isDead) {
                            if (!_script.GetTransForm())
                                continue;
                            if (!this.CheckTargetisOneRoom(_script.GetTransForm().position))
                                continue;
                            let _Target = new Laya.Vector3(0, 0, 0);
                            let forward = new Laya.Vector3(0, 0, 0);
                            this.Follow.transform.getForward(forward);
                            Laya.Vector3.subtract(_script.GetPosition(), this.GetTransForm().position, _Target);
                            let result = Laya.Vector3.dot(forward, _Target);
                            if (result < 0) {
                                _canImprisonmentCount++;
                            }
                        }
                    }
                }
            }
            UserComData.HintSkillCanUse = _canHintCount ? true : false;
            UserComData.ImprisonmentSkillCanUse = _canImprisonmentCount ? true : false;
        }
        CheckTargetisOneRoom(_target) {
            let _isOneRoom = true;
            let _result = new Array();
            if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(this.GetPosition(), _target, _result)) {
                for (let i = 0; i < _result.length; i++) {
                    let element = _result[i];
                    if (element.collider.owner.name.indexOf("room0") != -1 || element.collider.owner.name.indexOf("wall") != -1) {
                        _isOneRoom = false;
                        break;
                    }
                }
            }
            return _isOneRoom;
        }
        bossSeal() {
            this.fu.active = false;
        }
        activationFu() {
            UserComData.IsactivationFu = true;
            this.fu.active = true;
        }
        HideFu() {
            this.isHideFu = true;
        }
        goldRefreshItem(type) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.item.destroyChildren();
            UserComData.isStealthState = false;
            this.ResumeStealth();
            this.ChangeItem(UserComData.curItem);
        }
        BossBurst() {
            if (UserComData.gameModel == GameModel.Pursuer) {
                this._factor = 1.5;
                this.ef_BSDMM_burst.active = false;
                this.ef_BSDMM_burst.active = true;
                Laya.timer.once(UserComData.bossSkillTime[0] * 1000, this, () => {
                    this._factor = 1;
                    this.ef_BSDMM_burst.active = false;
                });
            }
        }
        ResumeCamera() {
            this.Follow.transform.localRotationEuler = this.Mod.transform.localRotationEuler.clone();
        }
        HitPlayer() {
            if (Laya.timer.currTimer - this._hitTime < 800)
                return;
            this._hitTime = Laya.timer.currTimer;
            this.HP -= UserComData.BossDamage;
            SceneLogic.inst.SpawEffect("ef_BSDMM_zhuajishouji", this.GetPosition());
            if (this.HP <= 0) {
                if (UserComData.curSkillCount >= 4 || UserComData.isGuideLevel || UserComData.activityInfo.fuState == 0) {
                    this.PlayerDead();
                }
                else {
                    this.ChangeCat();
                }
            }
            else {
                if (this.item.active) {
                    this.ChangeItem(-1);
                }
                this._factor = 1.5;
                Laya.timer.once(2000, this, () => {
                    this._factor = 1;
                });
            }
        }
        ChangeCat() {
            UserComData.curPlayRanking = 5 - UserComData.curSkillCount;
            UserComData.PlayerState = 2;
            this.Rb.collisionGroup = 4;
            UserComData.isStealthState = true;
            EventMgr.inst.emit("ChangeCat");
            this.owner.name = "Death";
            if (this.item.active) {
                this.ChangeItem(-1);
            }
            else {
                SoundMgr.inst.playSound("cat_magic");
                this.ef_BSDMM_transformation.active = false;
                this.ef_BSDMM_transformation.active = true;
            }
            UserComData.isNearFu = false;
            this.human.transform.localPositionY = 500;
            this.cat.active = true;
            this.humanAni = this.cat.getComponent(Laya.Animator);
            this.humanAni.crossFade("role_wait", 0.1);
            this.humanAni.speed = 1;
        }
        ReBorn() {
            this.owner.name = "Player";
            this.Rb.collisionGroup = 3;
            UserComData.PlayerState = 1;
            UserComData.isStealthState = false;
            this.Recover();
            this.ChangeItem(UserComData.curItem);
            this.cat.active = false;
            this.humanAni = this.human.getChildAt(0).getComponent(Laya.Animator);
            this.humanAni.crossFade("role_wait", 0.1);
        }
        PlayerDead() {
            this.isDead = true;
            Laya.timer.clearAll(this);
            UserComData.curSkillCount++;
            this.mStateMachine.changeState(this.mIdleState);
            this.Rb.collisionGroup = 4;
            SceneLogic.inst.gameState = GameState.over;
            EventMgr.inst.emit("GameLose");
            if (this.item.active) {
                this.ChangeItem(-1);
            }
            SoundMgr.inst.playSound("kill");
            this.humanAni.crossFade("role_death", 0.1);
        }
        Initial() {
            this.ef_BSDMM_transformation.active = false;
            this.ef_BSDMM_transformation.active = true;
            this.human.transform.localPositionY = 0;
            Laya.timer.once(1200, this, () => {
                this.humanAni.crossFade("role_wait", 0);
            });
        }
        Init(index) {
            this.isDead = false;
            this.isMove = false;
            this.isHideFu = false;
            this.GetObj().active = true;
            this.MaxHP = 100;
            this.HP = 100;
            this.Attack = 0;
            this._factor = 1;
            this.increasedSpeed = 0;
            UserComData.PlayerState = 1;
            this.cat.active = false;
            this.owner.name = "Player";
            this.ef_BSDMM_burst.active = false;
            this.ef_BSDMM_accelerate.active = false;
            this.ef_BSDMM_invisible.active = false;
            this.fu.active = false;
            this.Rb.linearVelocity.y = 0;
            this.human.destroyChildren();
            this.item.destroyChildren();
            this.item.active = false;
            this.human.active = true;
            if (UserComData.gameModel == GameModel.Runner) {
                this.GetTransForm().position = UserComData.PlayerInit.pos;
                this.Mod.transform.localRotationEuler = UserComData.PlayerInit.euler;
                this.Follow.transform.localRotationEuler = UserComData.PlayerInit.euler;
            }
            this.Follow.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.Follow.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.Mod.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.Mod.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.userName = "你";
            if (UserComData.gameModel == GameModel.Runner) {
                let _id = UserComData.PlayerSKinInfo.userRoleSkinId;
                if (UserComData.RoletrySkinId != -1) {
                    _id = UserComData.RoletrySkinId;
                    let _level = UserComData.ShopRoleData[_id].level;
                    this.MaxHP = _level["1"].blood;
                    this.HP = _level["1"].blood;
                    this.Speed = _level["1"].speed;
                }
                else {
                    let _level = UserComData.ShopRoleData[_id].level;
                    for (let i = 0; i < UserComData.PlayerSKinInfo.unlockRoleList.length; i++) {
                        if (UserComData.PlayerSKinInfo.unlockRoleList[i] == _id) {
                            this.MaxHP = _level[UserComData.PlayerSKinInfo.RoleSkinLevelList[i]].blood;
                            this.HP = _level[UserComData.PlayerSKinInfo.RoleSkinLevelList[i]].blood;
                            this.Speed = _level[UserComData.PlayerSKinInfo.RoleSkinLevelList[i]].speed;
                            break;
                        }
                    }
                }
                let _name = UserComData.ShopRoleData[_id].prefabName;
                let _obj = zs.laya.Resource.LoadSprite3d(_name);
                let Obj = zs.laya.ObjectPool.GetSprite3d(_obj);
                this.human.addChild(Obj);
                Obj.transform.localPosition = new Laya.Vector3(0, 0, 0);
                Obj.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                this.ef_BSDMM_range.active = false;
            }
            else {
                let _obj = zs.laya.Resource.LoadSprite3d("role_boss");
                let Obj = zs.laya.ObjectPool.GetSprite3d(_obj);
                this.human.addChild(Obj);
                Obj.transform.localPosition = new Laya.Vector3(0, 0, 0);
                Obj.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                UserComData.BossName = "你";
                let _level = UserComData.ShopBossData[UserComData.PlayerSKinInfo.userBossSKinId].level;
                for (let i = 0; i < UserComData.PlayerSKinInfo.unlockBossList.length; i++) {
                    if (UserComData.PlayerSKinInfo.unlockBossList[i] == UserComData.PlayerSKinInfo.userBossSKinId) {
                        UserComData.BossDamage = _level[UserComData.PlayerSKinInfo.BossSkinLevelList[i]].attack;
                        this.Speed = _level[UserComData.PlayerSKinInfo.BossSkinLevelList[i]].speed;
                        break;
                    }
                }
                this.ef_BSDMM_range.active = true;
            }
            UserComData.SpeedFactor = this.Speed;
            this.Rb.collisionGroup = 3;
            this.humanAni = this.human.getChildAt(0).getComponent(Laya.Animator);
            this.humanAni.crossFade("role_wait", 0);
            this.curAniName = "role_wait";
            if (UserComData.gameModel == GameModel.Runner) {
                this.GetTransForm().position = UserComData.PlayerInit.pos.clone();
                this.Mod.transform.localRotationEuler = UserComData.PlayerInit.euler.clone();
                this.Follow.transform.localRotationEuler = UserComData.PlayerInit.euler.clone();
                this.Rb.linearVelocity = new Laya.Vector3(0, 0, 0);
                this.mStateMachine.changeState(this.mMoveState);
            }
            else {
                this.mStateMachine.changeState(this.mIdleState);
            }
        }
        surveyModlewait() {
            this.mStateMachine.changeState(this.mIdleState);
        }
        surveyModlemove() {
            this.GetTransForm().position = new Laya.Vector3(0, 0.1, 0);
            this.Mod.transform.localRotationEuler = UserComData.PlayerInit.euler.clone();
            this.Follow.transform.localRotationEuler = UserComData.PlayerInit.euler.clone();
            this.Rb.linearVelocity = new Laya.Vector3(0, 0, 0);
            this.human.transform.localPositionY = 0;
            this.mStateMachine.changeState(this.mMoveState);
        }
        checkPointArea(_x, _y) {
            if (_x > 0 && _x < Laya.stage.width / 2.2) {
                return true;
            }
            return false;
        }
        checkRotateArea(_x, _y) {
            if (_x > Laya.stage.width - 500 && _y > 800 && _y < 1300) {
                return true;
            }
            return false;
        }
        ChangeState(isLook) {
            if (isLook) {
                this.mStateMachine.changeState(this.mLookState);
            }
            else {
                this.mStateMachine.changeState(this.mMoveState);
            }
        }
        ChangeItem(index) {
            SoundMgr.inst.playSound("cat_magic");
            this.ef_BSDMM_transformation.active = false;
            this.ef_BSDMM_transformation.active = true;
            this.GetTransForm().position.y += 0.05;
            if (index != -1) {
                this.human.transform.localPositionY = 500;
                let _mod = this.item.getChildAt(0);
                if (_mod == null) {
                    this.item.destroyChildren();
                    let _resouce = SceneLogic.inst.CopyPrefabs.getChildAt(index);
                    _mod = Laya.Sprite3D.instantiate(_resouce, this.item, false);
                    _mod.name = "Player";
                    _mod.transform.localPosition = new Laya.Vector3(0, 0, 0);
                    _mod.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                    _mod.active = true;
                    this.mStateMachine.changeState(this.mMoveState);
                }
                this.item.active = true;
                let _bound = _mod.getComponent(Laya.PhysicsCollider).colliderShape.clone();
                this.Rb.colliderShape = _bound.clone();
            }
            else {
                this._factor = 1;
                this.human.transform.localPositionY = 0;
                let _mod = this.human.getChildAt(0);
                _mod.active = true;
                this.item.active = false;
                let _bound = _mod.getComponent(Laya.PhysicsCollider).colliderShape.clone();
                this.Rb.colliderShape = _bound.clone();
                this.Rb.collisionGroup = 3;
            }
            this.GetTransForm().position.y -= 0.05;
        }
        PlayerLookRotate(_x, index) {
            let _value = this.Follow.transform.localRotationEulerX + index / 4;
            if (_value >= 0) {
                _value = _value > UserComData.MaxRotationY ? UserComData.MaxRotationY : _value;
            }
            else {
                _value = _value < -UserComData.MaxRotationY ? -UserComData.MaxRotationY : _value;
            }
            this.Follow.transform.localRotationEulerY -= _x / 4;
            this.Follow.transform.localRotationEulerX = _value;
        }
        PlayerLookMove(_dir) {
            this.Follow.transform.translate(new Laya.Vector3(_dir.x * 0.05, _dir.y * 0.05, _dir.z * 0.05));
        }
        PlayerRotate(_x, index) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (this.isLerp)
                return;
            let _value = this.Follow.transform.localRotationEulerX + index / 8;
            if (_value >= 0) {
                _value = _value > UserComData.MaxRotationY ? UserComData.MaxRotationY : _value;
            }
            else {
                _value = _value < -UserComData.MaxRotationY ? -UserComData.MaxRotationY : _value;
            }
            this.Follow.transform.localRotationEulerY -= _x / 4;
            this.Follow.transform.localRotationEulerY = this.Follow.transform.localRotationEulerY % 360;
            this.Follow.transform.localRotationEulerX = _value;
        }
        PlayerMove(deltaX, deltaY) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.State = 1;
            let mouseMoveDir = new Laya.Vector3(deltaX, 0, deltaY);
            let _rota = this.Follow.transform.localRotationEulerY;
            _rota = _rota - 180;
            let qua = new Laya.Quaternion();
            Laya.Quaternion.createFromYawPitchRoll(Utils.getRadian(_rota), 0, 0, qua);
            Laya.Vector3.transformQuat(mouseMoveDir, qua, mouseMoveDir);
            Laya.Vector3.normalize(mouseMoveDir, mouseMoveDir);
            let _dir = new Laya.Vector3(mouseMoveDir.x * (UserComData.SpeedFactor * this._factor + this.increasedSpeed), this.Rb.linearVelocity.y, mouseMoveDir.z * (UserComData.SpeedFactor * this._factor + this.increasedSpeed));
            this.Rb.linearVelocity = _dir;
        }
        PlayerJump() {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.State = 1;
            if (this.GetPosition().y > 1.25)
                return;
            this.curAniName = "role_jump";
            this.humanAni.crossFade("role_jump", 0.2);
            let _time = Laya.timer.currTimer;
            let dur = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(dur * 1000, this, () => {
                if (this.isDead)
                    return;
                if (SceneLogic.inst.gameState != GameState.playing)
                    return;
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    this.curAniName = "role_run";
                    this.humanAni.crossFade("role_run", 0.2);
                }
                else {
                    this.curAniName = "role_wait";
                    if (this.item.active) {
                        this.State = 0;
                    }
                    this.humanAni.crossFade("role_wait", 0.2);
                }
            });
            let _v = this.Rb.linearVelocity;
            this.Rb.linearVelocity = new Laya.Vector3(_v.x, 8.5, _v.z);
            Laya.timer.once(150, this, () => {
                if (this.isDead)
                    return;
                if (SceneLogic.inst.gameState != GameState.playing)
                    return;
                this.Rb.linearVelocity = new Laya.Vector3(_v.x, 0, _v.z);
            });
        }
        CheckRunnerDir() {
            let _originDis = 10;
            let _targetIndex = -1;
            let element;
            for (let i = 0; i < UserComData.RunnerList.length; i++) {
                element = UserComData.RunnerList[i];
                if (element && element.transform) {
                    let _script = element.getComponent(AI);
                    if (_script && _script.State == 1) {
                        let _dis = Laya.Vector3.distance(element.transform.position, this.GetPosition());
                        if (_dis < _originDis) {
                            _originDis = _dis;
                            _targetIndex = i;
                        }
                    }
                }
            }
            if (_targetIndex != -1 && _originDis < 1.5) {
                element = UserComData.RunnerList[_targetIndex];
                this.LookAtAI(element);
            }
        }
        LookAtAI(_target) {
            if (!_target.transform || !_target.transform.position)
                return;
            let _ranX = _target.transform.position.x - this.GetPosition().x;
            let _ranZ = _target.transform.position.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
            this._lerpTarget = new Laya.Vector3(this.Follow.transform.localRotationEulerX, this.Mod.transform.localRotationEulerY % 360, this.Follow.transform.localRotationEulerZ);
            if (Math.abs(this._lerpTarget.y - this.Follow.transform.localRotationEulerY) > 180) {
                this._lerpTarget.y -= 360;
            }
            this.lerpStartTime = Laya.timer.currTimer;
            this.isLerp = true;
            Laya.timer.once(1100, this, () => {
                this.isLerp = false;
            });
        }
        BossAttack(_screenPos) {
            if (UserComData.gameModel == GameModel.Runner)
                return;
            this.CheckRunnerDir();
            this.curAniName = "role_attack";
            this.humanAni.crossFade("role_attack", 0.1);
            let _duration = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_duration * 750, this, () => {
                this.isLerp = false;
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    this.curAniName = "role_run";
                    this.humanAni.crossFade("role_run", 0);
                }
                else {
                    this.curAniName = "role_wait";
                    this.State = 0;
                    this.humanAni.crossFade("role_wait", 0);
                }
            });
            this.ef_BSDMM_zhuaji.active = false;
            this.ef_BSDMM_zhuaji.active = true;
            Laya.timer.once(_duration * 300, this, () => {
                let _originPos = SceneLogic.inst.BulletPos.transform.position.clone();
                UserComData.BulletOriginPos = _originPos;
                Laya.Vector3.subtract(this.BulletTarget.transform.position, _originPos, UserComData.BulletDirection);
                Laya.Vector3.normalize(UserComData.BulletDirection, UserComData.BulletDirection);
                let _bullet = zs.laya.Resource.LoadSprite3d("Bullet");
                let _Bullet = zs.laya.ObjectPool.GetSprite3d(_bullet);
                SceneLogic.inst.BulletPool.addChild(_Bullet);
                _Bullet.addComponent(Bullets);
            });
        }
        RunnerSkill() {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.curAniName != "role_skill";
            this.humanAni.crossFade("role_skill", 0.1);
            let _duration = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_duration * 1000, this, () => {
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    this.curAniName = "role_run";
                    this.humanAni.crossFade("role_run", 0);
                }
                else {
                    this.curAniName = "role_wait";
                    this.State = 0;
                    this.humanAni.crossFade("role_wait", 0);
                }
            });
        }
        FuRotate() {
            if (this.fu.active) {
                this.fu.transform.localRotationEulerY += Laya.timer.delta * 0.01 * this.fuRodateSpeed;
            }
        }
        onUpdateOther() {
            super.onUpdateOther();
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.mStateMachine.stateMachineUpdate();
            this.UpdateAnimatorState();
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.CheckTips();
                this.CheckAIState();
            }
            this.FuRotate();
        }
        onLateUpdate() {
            if (this.isLerp) {
                this.LerpTarget();
            }
        }
        LerpTarget() {
            let _outPos = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.lerp(this.Follow.transform.localRotationEuler, this._lerpTarget, 5 * Laya.timer.delta * 0.001, _outPos);
            this.Follow.transform.localRotationEuler = _outPos;
            if (Math.abs(this.Mod.transform.localRotationEulerY - this.Follow.transform.localRotationEulerY) < 5) {
                this.isLerp = false;
            }
        }
        CheckTips() {
            if (UserComData.HaveWh)
                return;
            if (Laya.timer.currTimer - UserComData.AttackTime >= 5000) {
                UserComData.AttackTime = Laya.timer.currTimer;
                let element = UserComData.RunnerList[Utils.Range(0, UserComData.RunnerList.length - 1)];
                if (element) {
                    let _script = element.getComponent(AI);
                    if (_script) {
                        SoundMgr.inst.playSound("doubt");
                        _script.ef_BSDMM_wh.active = false;
                        _script.ef_BSDMM_wh.active = true;
                    }
                }
            }
        }
        UpdateAnimatorState() {
            if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                if (this.curAniName != "role_jump" && this.curAniName != "role_skill" && this.curAniName != "role_attack") {
                    let a = Math.atan2(this.Rb.linearVelocity.z, -this.Rb.linearVelocity.x);
                    a = Utils.getAngle(a);
                    let b = -this.Follow.transform.localRotationEulerY % 360;
                    let c = Math.abs((b + a) % 180);
                    if (this.curAniName != "role_run") {
                        this.humanAni.speed = 1;
                        this.curAniName = "role_run";
                        this.humanAni.crossFade("role_run", 0);
                    }
                }
            }
            else {
                if (this.curAniName != "role_wait" && this.curAniName != "role_jump" && this.curAniName != "role_attack" && this.curAniName != "role_skill") {
                    this.humanAni.speed = 1;
                    this.curAniName = "role_wait";
                    this.humanAni.crossFade("role_wait", 0);
                }
            }
        }
        onCollisionEnter(other) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
        }
        onTriggerEnter(other) {
            if (UserComData.PlayerState == 2)
                return;
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            console.log("触发的物体：", other.owner.name);
            if (other.owner.name.indexOf("OpenArea") != -1) {
                UserComData.isNearBox = true;
            }
            if (other.owner.name.indexOf("ef_BSDMM_fengyin") != -1 && UserComData.gameModel == GameModel.Runner) {
                UserComData.isNearFu = true;
                this.isHideFu = false;
                EventMgr.inst.emit("Unseal");
                this.curAniName = "role_skill";
                this.humanAni.crossFade("role_skill", 0.1);
                this.humanAni.speed = 0.5;
            }
        }
        onTriggerStay(other) {
            if (UserComData.PlayerState == 2)
                return;
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (other.owner.name.indexOf("OpenArea") != -1) {
                if (UserComData.isClickBox) {
                    UserComData.isClickBox = false;
                    UserComData.isNearBox = false;
                    other.owner.name = "CloseArea";
                    let _parent = other.owner.parent;
                    let _box = _parent.getChildByName("box");
                    let _ani = _box.getComponent(Laya.Animator);
                    _ani.enabled = true;
                    _ani.crossFade("up", 0);
                    _parent.getChildByName("ef_BSDMM_box02").active = false;
                    _parent.getChildByName("ef_BSDMM_box02").active = true;
                    Laya.timer.once(500, this, () => {
                        SoundMgr.inst.playSound("treasure");
                    });
                    Laya.timer.once(1000, this, () => {
                        _box.getChildByName("Dummy002").active = false;
                    });
                }
            }
            if (other.owner.name.indexOf("ef_BSDMM_fengyin") != -1 && UserComData.gameModel == GameModel.Runner) {
                if (!this.item.active && this.isHideFu) {
                    other.owner.active = false;
                }
                UserComData.isNearFu = true;
            }
        }
        onTriggerExit(other) {
            if (this.isDead)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (other.owner.name.indexOf("OpenArea") != -1) {
                UserComData.isNearBox = false;
            }
            if (other.owner.name.indexOf("ef_BSDMM_fengyin") != -1 && UserComData.gameModel == GameModel.Runner) {
                UserComData.isNearFu = false;
                this.curAniName = "role_run";
                this.humanAni.crossFade("role_run", 0.1);
                this.humanAni.speed = 1;
            }
        }
    }

    class Boss extends Actor {
        constructor() {
            super();
            this.mIdleState = new BossIdleState();
            this.mMoveState = new BossMoveState();
            this.mAttackState = new BossAttackState();
            this.mLookState = new BossLookState();
            this.mCatchState = new BossCatchState();
            this.mFollowState = new BossFollowState();
            this.mFAIState = new BossFollowAIState();
            this.mOverState = new BossOverState();
            this.AttackList = [];
            this.AttackRunnerList = [];
            this.direction = new Laya.Vector3(0, 0, 1);
            this.aiState = AIState.None;
            this.isSpecialPoint = false;
            this.BossRoadDir = 1;
            this.endroadqueue = [0, 1];
            this.ArriveEndCount = 0;
            this._factor = 1;
            this.catchCount = 0;
            this.isBurst = false;
            this.isCatchPlayer = false;
            this.isFly = false;
            this.StopCamera = false;
            this.fuRodateSpeed = 30;
            this._attackTime = 0;
            this.lastspecialName = "";
            this.isFollow = false;
            this._search = 0;
            this._CollosionTime = 0;
            this._CollosionType = 1;
            this._CollosionPos = new Laya.Vector3(0, 0, 0);
            this._isStuck = false;
            this._StuckCount = 0;
        }
        onSpawn() {
            super.onSpawn();
            this.GetObj().active = true;
            this.Rb = this.GetObj().getComponent(Laya.Rigidbody3D);
            this.Rb.canCollideWith = 0 ^ 3;
            this.Rb.collisionGroup = 3;
            this.Follow = this.owner.getChildByName("Follow");
            this.Mod = this.owner.getChildByName("survey");
            this.Look = this.owner.getChildByName("Look");
            this.LookCamera = this.Look.getChildByName("Camera");
            this.LookCamera.active = false;
            this.humanAni = this.Mod.getChildAt(0).getComponent(Laya.Animator);
            this.humanAni.crossFade("role_wait", 0.1);
            this.curAniName = "role_wait";
            this.BulletPos = this.Follow.getChildByName("BulletPos");
            this.fuPos = this.Follow.getChildByName("fuPos");
            this.fuPre = this.fuPos.getChildAt(0);
            this.fuPre.active = false;
            this.curRoadId = 0;
            this.ef_BSDMM_seal = this.Follow.getChildByName("ef_BSDMM_seal");
            this.ef_BSDMM_seal.active = false;
            this.ef_BSDMM_zhuaji = this.Follow.getChildByName("ef_BSDMM_zhuaji");
            this.ef_BSDMM_zhuaji.active = false;
            this.ef_BSDMM_burst = this.Follow.getChildByName("ef_BSDMM_burst");
            this.ef_BSDMM_burst.active = false;
            let _level = UserComData.endroadqueue[UserComData.userLevel];
            this.endroadqueue = [];
            for (let i = 0; i < _level.length; i++) {
                this.endroadqueue.push(_level[i]);
            }
            this.endroadqueue = this.endroadqueue.sort(() => Math.random() - 0.5);
            this.mStateMachine = new StateMachine(this);
            this.mStateMachine.changeState(this.mIdleState, 2);
            EventMgr.inst.onEvent("RunnerSkill", this, this.RunnerSkill);
            EventMgr.inst.onEvent("GameLose", this, this.PlayerLose);
            EventMgr.inst.onEvent("GameWin", this, this.PlayerWin);
            EventMgr.inst.onEvent("BossBurst", this, this.BossBurst);
            EventMgr.inst.onEvent("bossSeal", this, this.bossSeal);
        }
        BossBurst() {
            this.isBurst = true;
            this._factor = 1.5;
            this.ef_BSDMM_burst.active = false;
            this.ef_BSDMM_burst.active = true;
            Laya.timer.once(UserComData.bossSkillTime[0] * 1000, this, () => {
                this.isBurst = false;
                this._factor = 1;
                this.ef_BSDMM_burst.active = false;
            });
        }
        Init() {
            this.isBurst = false;
            this.isSpecialPoint = false;
            this.fuPre.active = false;
            this.isCatchPlayer = false;
            this.catchCount = 0;
            this.GetBossRoadList();
            this.userName = UserComData.AINameList[UserComData.AINameList.length - 1].id;
            UserComData.BossName = UserComData.AINameList[UserComData.AINameList.length - 1].id;
            let _Playerlevel;
            if (UserComData.RoletrySkinId != -1) {
                _Playerlevel = 1;
            }
            else {
                for (let i = 0; i < UserComData.PlayerSKinInfo.unlockRoleList.length; i++) {
                    if (UserComData.PlayerSKinInfo.unlockRoleList[i] == UserComData.PlayerSKinInfo.userRoleSkinId) {
                        _Playerlevel = UserComData.PlayerSKinInfo.RoleSkinLevelList[i];
                    }
                }
            }
            let _modLevel = UserComData.modeDifficulty[UserComData.modeDifficultyLevel].level;
            let _Bosslevel = (_Playerlevel + _modLevel) < 1 ? 1 : (_Playerlevel + _modLevel);
            _Bosslevel = _Bosslevel > 5 ? 5 : _Bosslevel;
            let _level = UserComData.ShopBossData[0].level;
            UserComData.BossDamage = _level[_Bosslevel].attack;
            this.Speed = _level[_Bosslevel].speed;
            UserComData.BossSpeedFactor = this.Speed;
            this._factor = 1;
        }
        RemoveEvent() {
            EventMgr.inst.onOffEvent("RunnerSkill", this, this.RunnerSkill);
            EventMgr.inst.onOffEvent("GameLose", this, this.PlayerLose);
            EventMgr.inst.onOffEvent("GameWin", this, this.PlayerWin);
            EventMgr.inst.onOffEvent("BossBurst", this, this.BossBurst);
            EventMgr.inst.onOffEvent("bossSeal", this, this.bossSeal);
        }
        PlayerWin(type) {
            if (type && type == 1) {
                Laya.timer.once(3000, this, () => {
                    if (this.GetObj()) {
                        this.GetObj().active = false;
                    }
                });
            }
            else {
                if (this.GetObj()) {
                    this.GetObj().active = false;
                }
            }
            this.RemoveEvent();
        }
        PlayerLose() {
            this.mStateMachine.changeState(this.mOverState);
            this.RemoveEvent();
        }
        GetBossRoadList() {
            this.RoadPosList = [];
            this.RoadNameList = [];
            let data = SceneLogic.inst.getLevelConfigData(UserComData.userLevel.toString());
            if (data && data.boss) {
                data.boss.forEach(element => {
                    let _pos = new Laya.Vector3(-parseFloat(element.position.x), 0, parseFloat(element.position.z));
                    this.RoadPosList.push(_pos);
                    this.RoadNameList.push(element.name);
                });
                this.curRoadId = 0;
                let _pos = this.RoadPosList[this.curRoadId].clone();
                this.curFollowPos = _pos;
            }
        }
        getBossRoadEndPosID() {
            let _name;
            if (this.ArriveEndCount < this.endroadqueue.length) {
                _name = "0_" + this.endroadqueue[this.ArriveEndCount];
            }
            else {
                let _ran = Utils.Range(0, this.endroadqueue.length - 1);
                _name = "0_" + _ran;
            }
            for (let i = 0; i < this.RoadNameList.length; i++) {
                if (this.RoadNameList[i].indexOf("end") != -1 && this.RoadNameList[i].indexOf(_name) == 0) {
                    return i;
                }
            }
            return 0;
        }
        FollowRunner() {
            let _ranX = this.TargetAttack.transform.position.x - this.GetPosition().x;
            let _ranZ = this.TargetAttack.transform.position.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, this.direction.y, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * UserComData.BossSpeedFactor * this._factor, this.direction.y, _dir.z * UserComData.BossSpeedFactor * this._factor);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        UpdateDir() {
            if (!this.curFollowPos)
                return;
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * UserComData.BossSpeedFactor * this._factor, this.direction.y, _dir.z * UserComData.BossSpeedFactor * this._factor);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        RunnerSkill() {
            Laya.timer.once(1000, this, () => {
                this.ef_BSDMM_seal.active = false;
                this.ef_BSDMM_seal.active = true;
                this.mStateMachine.changeState(this.mIdleState, 5);
            });
        }
        bossSeal() {
            this.mStateMachine.changeState(this.mIdleState, 10);
            this.flyDir = new Laya.Vector3(0, 0, 0);
            this.TargetPos = new Laya.Vector3(this.fuPos.transform.position.x, this.fuPos.transform.position.y - 0.1, this.fuPos.transform.position.z);
            Laya.Vector3.subtract(this.TargetPos, SceneLogic.inst.flyFu.transform.position, this.flyDir);
            Laya.Vector3.normalize(this.flyDir, this.flyDir);
            let _ranX = this.flyDir.x;
            let _ranZ = this.flyDir.z;
            if (_ranZ > 0) {
                SceneLogic.inst.FlyCameraPoint.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
            else {
                SceneLogic.inst.FlyCameraPoint.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            SceneLogic.inst.Camera_Main.active = false;
            SceneLogic.inst.flyFu.active = true;
            SceneLogic.inst.flyFu_Prefabs.transform.localRotationEulerX = 90;
            let _dis = Laya.Vector3.distance(this.TargetPos, SceneLogic.inst.flyFu.transform.position);
            if (_dis < 2) {
                SoundMgr.inst.playSound("spell_fly_2");
            }
            else if (_dis < 4) {
                SoundMgr.inst.playSound("spell_fly_4");
            }
            else {
                SoundMgr.inst.playSound("spell_fly_6");
            }
            this.isFly = true;
        }
        fuluFly() {
            if (this.isFly) {
                SceneLogic.inst.flyFu.transform.translate(new Laya.Vector3(this.flyDir.x * UserComData.BulletSpeedFactor * 0.5, this.flyDir.y * UserComData.BulletSpeedFactor * 0.5, this.flyDir.z * UserComData.BulletSpeedFactor * 0.5));
                let _dis = Laya.Vector3.distance(this.TargetPos, SceneLogic.inst.flyFu.transform.position);
                if (_dis < 0.3) {
                    this.isFly = false;
                    SceneLogic.inst.flyFu.transform.position = this.TargetPos;
                    SceneLogic.inst.flyFu_Prefabs.transform.localRotationEulerX = 0;
                    SceneLogic.inst.flyFu_Prefabs.active = false;
                    this.fuPre.active = true;
                    SoundMgr.inst.playSound("spell_hit");
                    this.bossEffSeal();
                    EventMgr.inst.emit("GameWin", 1);
                }
                if (_dis < 1.5 && !this.StopCamera) {
                    this.CameraStopPos = SceneLogic.inst.flyFu_Camera.transform.position.clone();
                    this.StopCamera = true;
                }
                if (this.StopCamera) {
                    SceneLogic.inst.flyFu_Camera.transform.position = this.CameraStopPos.clone();
                }
            }
        }
        bossEffSeal() {
            Laya.timer.once(300, this, () => {
                this.ef_BSDMM_seal.active = false;
                this.ef_BSDMM_seal.active = true;
            });
        }
        FuRotate() {
            if (this.fuPre && this.fuPre.active) {
                this.fuPos.transform.localRotationEulerY += Laya.timer.delta * 0.01 * this.fuRodateSpeed;
            }
        }
        onUpdateOther() {
            super.onUpdateOther();
            this.mStateMachine.stateMachineUpdate();
            this.UpdateAnimatorState();
            this.CheckRunnerState();
            this.CheckIsStuck();
            this.fuluFly();
            this.FuRotate();
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.CheckDistance();
            this.CheckPlayerDistance();
        }
        CheckNoMove() {
        }
        CheckIsStuck() {
            if (this._isStuck && this._CollosionTime != 0 && Laya.timer.currTimer - this._CollosionTime > 300) {
                this._CollosionTime = Laya.timer.currTimer;
                if (Laya.timer.currTimer - this._attackTime < 800)
                    return;
                this._attackTime = Laya.timer.currTimer;
                if (Laya.Vector3.distance(this.GetPosition(), this._CollosionPos) < 0.05) {
                    this._StuckCount++;
                    if (this._StuckCount >= 3) {
                        this._StuckCount = 0;
                        this.CheckNearPos();
                        this.isFollow = true;
                        this.aiState = AIState.Move;
                        this.mStateMachine.changeState(this.mIdleState, 1);
                        Laya.timer.once(500, this, () => {
                            this._isStuck = false;
                        });
                    }
                    else {
                        if (this._CollosionType == 1) {
                            this.LookAtPlayer(this._CollosionObj);
                            this.BossAttack(this._CollosionObj);
                        }
                        else {
                            this.BossJump();
                        }
                    }
                }
                else {
                    this._isStuck = false;
                }
            }
        }
        UpdateAnimatorState() {
            if (this.curAniName != "role_jump" && this.curAniName != "role_attack" && this.curAniName != "role_burst" && this.curAniName != "role_win") {
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    if (this.curAniName != "role_run") {
                        this.curAniName = "role_run";
                        this.humanAni.crossFade("role_run", 0);
                    }
                }
                else {
                    if (this.curAniName != "role_wait") {
                        this.curAniName = "role_wait";
                        this.humanAni.crossFade("role_wait", 0);
                    }
                }
            }
        }
        ChangeAttackTarget() {
            let _ran = Utils.Range(0, 9);
            if (_ran < 7) {
                this.CheckTriggerRunnerByArea();
                if (this.AttackRunnerList && this.AttackRunnerList.length > 0) {
                    this.TargetAttack = this.AttackRunnerList[Utils.Range(0, this.AttackRunnerList.length - 1)];
                }
                else {
                    this.mStateMachine.changeState(this.mIdleState, 1);
                }
            }
            else {
                if (this.AttackList && this.AttackList.length <= 0) {
                    this.CheckTriggerRunnerByArea();
                    if (this.AttackRunnerList && this.AttackRunnerList.length > 0) {
                        this.TargetAttack = this.AttackRunnerList[Utils.Range(0, this.AttackRunnerList.length - 1)];
                    }
                    else {
                        this.mStateMachine.changeState(this.mIdleState, 1);
                    }
                }
                else {
                    let _ranC = Utils.Range(0, this.AttackList.length - 1);
                    let _element = this.AttackList[_ranC];
                    this.TargetAttack = _element;
                }
            }
            if (this.TargetAttack && this.TargetAttack.parent) {
                this.LookAtPlayer(this.TargetAttack);
                this.BossAttack(this.TargetAttack);
            }
            else {
                this.ChangeAttackTarget();
            }
        }
        LookAtPlayer(_target) {
            if (!_target.transform || !_target.transform.position)
                return;
            let _ranX = _target.transform.position.x - this.GetPosition().x;
            let _ranZ = _target.transform.position.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, this.direction.y, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        BossAttack(_target) {
            this.curAniName = "role_attack";
            this.humanAni.crossFade("role_attack", 0.1);
            let _duration = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_duration * 900, this, () => {
                this.curAniName = "role_wait";
                this.humanAni.crossFade("role_wait", 0.1);
                this._isStuck = false;
                if (this.aiState != AIState.Follow && this.aiState != AIState.Catch) {
                    this.mStateMachine.changeState(this.mIdleState, 0.5);
                }
            });
            this.ef_BSDMM_zhuaji.active = false;
            this.ef_BSDMM_zhuaji.active = true;
            Laya.timer.once(_duration * 300, this, () => {
                let _originPos = this.BulletPos.transform.position.clone();
                UserComData.BulletOriginPos = this.BulletPos.transform.position.clone();
                if (!_target.transform || !_target.transform.position)
                    return;
                let _targetPos = new Laya.Vector3(_target.transform.position.x, _target.transform.position.y + 0.2, _target.transform.position.z);
                Laya.Vector3.subtract(_targetPos, _originPos, UserComData.BulletDirection);
                Laya.Vector3.normalize(UserComData.BulletDirection, UserComData.BulletDirection);
                let _bullet = zs.laya.Resource.LoadSprite3d("Bullet");
                let _Bullet = zs.laya.ObjectPool.GetSprite3d(_bullet);
                SceneLogic.inst.BulletPool.addChild(_Bullet);
                _Bullet.addComponent(Bullets);
            });
        }
        CsJump() {
            this.direction = new Laya.Vector3(this.direction.x, -1, this.direction.z);
            Laya.timer.once(200, this, () => {
                this._isStuck = false;
                this.direction = new Laya.Vector3(this.direction.x, this.Rb.linearVelocity.y, this.direction.z);
            });
        }
        BossJump() {
            Laya.timer.clear(this, this.CsJump);
            this.curAniName = "role_jump";
            this.humanAni.crossFade("role_jump", 0.2);
            let dur = this.humanAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(dur * 1000, this, () => {
                if (this.isDead)
                    return;
                if (this.Rb.linearVelocity.x || this.Rb.linearVelocity.z) {
                    this.curAniName = "role_run";
                    this.humanAni.crossFade("role_run", 0.2);
                }
                else {
                    this.curAniName = "role_wait";
                    this.humanAni.crossFade("role_wait", 0.2);
                }
            });
            this.direction = new Laya.Vector3(this.direction.x, 6, this.direction.z);
            Laya.timer.once(300, this, this.CsJump);
        }
        ChangePos() {
            this.TargetList = [];
            if (this.aiState == AIState.Catch || this.aiState == AIState.Follow) {
            }
            else {
                if (this.RoadNameList[this.curRoadId].indexOf("end") != -1) {
                    this.curRoadId = 0;
                }
                this.TargetRoadId = this.getBossRoadEndPosID();
            }
            let _Pos = this.RoadPosList[this.TargetRoadId];
            let targetName = this.RoadNameList[this.TargetRoadId];
            let curName = this.RoadNameList[this.curRoadId];
            this.lastRoadPos = _Pos;
            this.PushPos(curName, targetName);
        }
        PushPos(curName, targetName) {
            let _nextPosName = "";
            if (curName.indexOf("_") == -1 || targetName.indexOf(curName) == 0) {
                _nextPosName = curName;
            }
            else {
                _nextPosName = curName.substring(0, curName.lastIndexOf("_"));
                let _index = this.getCuridByName(_nextPosName);
                this.TargetList.push(this.RoadPosList[_index]);
            }
            if (targetName.indexOf(_nextPosName) == 0) {
                let _name = targetName.substring(_nextPosName.length + 1);
                if (_name) {
                    let _nList = _name.split("_");
                    let road = _nextPosName;
                    for (let i = 0; i < _nList.length; i++) {
                        road = road + "_" + _nList[i];
                        let _index = this.getCuridByName(road);
                        this.TargetList.push(this.RoadPosList[_index]);
                    }
                }
            }
            else {
                this.PushPos(_nextPosName, targetName);
            }
        }
        getCuridByName(roadName) {
            let _name = "";
            for (let i = 0; i < this.RoadNameList.length; i++) {
                _name = this.RoadNameList[i];
                if (_name == roadName) {
                    return i;
                }
            }
        }
        getCuridByPos(Pos) {
            for (let i = 0; i < this.RoadPosList.length; i++) {
                if (Pos.x == this.RoadPosList[i].x && Pos.y == this.RoadPosList[i].y && Pos.z == this.RoadPosList[i].z) {
                    return i;
                }
            }
        }
        CheckHavePos(roadName) {
            for (let i = 0; i < this.RoadNameList.length; i++) {
                if (this.RoadNameList[i] == roadName + "_A") {
                    return (roadName + "_A");
                }
                if (this.RoadNameList[i] == roadName + "_B") {
                    return (roadName + "_B");
                }
            }
            return "";
        }
        FollowPos() {
            if (this.TargetList.length < 1 || this.curRoadId == this.TargetRoadId) {
                if (this.TargetList.length > 1) {
                }
                else {
                    this.curRoadId = this.TargetRoadId;
                    this.ArriveEndCount++;
                    this.ChangePos();
                    return;
                }
            }
            if (!this.curFollowPos)
                return;
            this.lastRoadPos = this.curFollowPos.clone();
            this.curRoadId = this.getCuridByPos(this.lastRoadPos);
            this.curPosName = this.RoadNameList[this.curRoadId];
            let _EndName = this.curPosName.substring(this.curPosName.lastIndexOf("_") + 1);
            if (_EndName.indexOf("A") != -1 && !this.isSpecialPoint) {
                this.isSpecialPoint = true;
                this.aiState = AIState.Look;
                this.Rb.linearVelocity = new Laya.Vector3(0, this.Rb.linearVelocity.y, 0);
                this.CheckPointLookArea();
                return;
            }
            else if (_EndName.indexOf("B") != -1 && !this.isSpecialPoint) {
                this.isSpecialPoint = true;
                this.aiState = AIState.Attack;
                this.Rb.linearVelocity = new Laya.Vector3(0, this.Rb.linearVelocity.y, 0);
                this.CheckItemIsAttackArea();
                return;
            }
            else {
                if (this.aiState == AIState.Move) {
                    this.CheckRunnerState();
                }
            }
            this.isSpecialPoint = false;
            let _name = this.CheckHavePos(this.curPosName);
            if (_name && this.BossRoadDir == 1) {
                let _ran = Math.random();
                if (_ran <= UserComData.BossFollowSpeicalRoad && _name != this.lastspecialName) {
                    let roadId = this.getCuridByName(_name);
                    this.lastspecialName = _name;
                    this.curFollowPos = this.RoadPosList[roadId].clone();
                }
                else {
                    this.curFollowPos = this.TargetList.shift();
                }
            }
            else {
                this.curFollowPos = this.TargetList.shift();
            }
            if (!this.curFollowPos) {
                this.mStateMachine.changeState(this.mIdleState, 1);
                return;
            }
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * UserComData.BossSpeedFactor * this._factor, this.Rb.linearVelocity.y, _dir.z * UserComData.BossSpeedFactor * this._factor);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        FollowState() {
            if (this.TargetList.length < 1 || this.curRoadId == this.TargetRoadId) {
                if (!this.isCatchPlayer) {
                    this.mStateMachine.changeState(this.mFAIState);
                }
                return;
            }
            if (!this.curFollowPos)
                return;
            this.lastRoadPos = this.curFollowPos.clone();
            this.curRoadId = this.getCuridByPos(this.lastRoadPos);
            this.curPosName = this.RoadNameList[this.curRoadId];
            this.curFollowPos = this.TargetList.shift();
            if (!this.curFollowPos) {
                this.curFollowPos = this.lastRoadPos.clone();
                this.aiState = AIState.Move;
                this.mStateMachine.changeState(this.mIdleState, 1);
                return;
            }
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * UserComData.BossSpeedFactor * this._factor, this.direction.y, _dir.z * UserComData.BossSpeedFactor * this._factor);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        CheckItemIsAttackArea() {
            this.AttackList = [];
            for (let i = 0; i < SceneLogic.inst.ItemPool.numChildren; i++) {
                let element = SceneLogic.inst.ItemPool.getChildAt(i);
                if (!element.active) {
                    continue;
                }
                if (Laya.Vector3.distance(element.transform.position, this.GetPosition()) < UserComData.BossAttackArea) {
                    let _result = new Array();
                    let isArea = true;
                    if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(this.GetPosition(), element.transform.position, _result)) {
                        _result.forEach(element => {
                            if (element.collider.owner.name.indexOf("room0") != -1) {
                                isArea = false;
                            }
                        });
                    }
                    if (isArea) {
                        this.AttackList.push(element);
                    }
                }
            }
            if (this.AttackList && this.AttackList.length > 0) {
                this.mStateMachine.changeState(this.mAttackState, 1);
            }
            else {
                this.mStateMachine.changeState(this.mIdleState, 1);
            }
        }
        AttackItem() {
            this.TargetAttack = this.AttackList[Utils.Range(0, this.AttackList.length - 1)];
            if (this._search > 5) {
                this.CheckNearPos();
                this.isFollow = true;
                this.aiState = AIState.Move;
                this.mStateMachine.changeState(this.mIdleState, 1);
                return;
            }
            if (this.TargetAttack && this.TargetAttack.parent) {
                this._search = 0;
                this.LookAtPlayer(this.TargetAttack);
                this.BossAttack(this.TargetAttack);
            }
            else {
                this._search++;
                this.AttackItem();
            }
        }
        CheckTriggerItemByArea() {
            this.AttackList = [];
            for (let i = 0; i < SceneLogic.inst.ItemPool.numChildren; i++) {
                let element = SceneLogic.inst.ItemPool.getChildAt(i);
                if (!element.active) {
                    continue;
                }
                if (Laya.Vector3.distance(element.transform.position, this.GetPosition()) < UserComData.BossTriggerArea) {
                    let _result = new Array();
                    let isArea = true;
                    if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(this.GetPosition(), element.transform.position, _result)) {
                        _result.forEach(element => {
                            if (element.collider.owner.name.indexOf("room0") != -1 || element.collider.owner.name.indexOf("wall") != -1) {
                                isArea = false;
                            }
                        });
                    }
                    if (isArea) {
                        this.AttackList.push(element);
                    }
                }
            }
            this.mStateMachine.changeState(this.mAttackState, 1);
        }
        CheckTriggerRunnerByArea() {
            this.AttackRunnerList = [];
            for (let i = 0; i < UserComData.RunnerList.length; i++) {
                let element = UserComData.RunnerList[i];
                if (element == null || !element.active) {
                    continue;
                }
                if (Laya.Vector3.distance(element.transform.position, this.GetPosition()) < UserComData.BossTriggerArea) {
                    let isArea = this.CheckTargetisOneRoom(element);
                    if (isArea) {
                        this.AttackRunnerList.push(element);
                    }
                }
            }
            return this.AttackRunnerList;
        }
        CheckTargetisOneRoom(_target) {
            let _isOneRoom = true;
            let _result = new Array();
            if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(this.GetPosition(), _target.transform.position, _result)) {
                for (let i = 0; i < _result.length; i++) {
                    let element = _result[i];
                    if (element.collider.owner.name.indexOf("room0") != -1 || element.collider.owner.name.indexOf("wall") != -1) {
                        _isOneRoom = false;
                        break;
                    }
                }
            }
            if (_isOneRoom) {
                let shape = this.Rb.colliderShape.clone();
                let _targetPos = new Laya.Vector3(0, 0, 0);
                let _dir = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.subtract(this.GetPosition(), _target, _dir);
                Laya.Vector3.normalize(_dir, _dir);
                Laya.Vector3.add(this.GetPosition(), _dir, _targetPos);
                if (SceneLogic.inst.Game_Scene.physicsSimulation.shapeCastAll(shape, this.GetPosition(), _targetPos, _result)) {
                    for (let i = 0; i < _result.length; i++) {
                        let element = _result[i];
                        if (element.collider.owner.name.indexOf("room") != -1 || element.collider.owner.name.indexOf("wall") != -1) {
                            _isOneRoom = false;
                            break;
                        }
                    }
                }
            }
            return _isOneRoom;
        }
        CheckRunnerNearPosId() {
            let _dis = 20;
            let _value = -1;
            let _list = [];
            for (let i = 0; i < this.RoadPosList.length; i++) {
                let _pos = this.RoadPosList[i];
                let _d = Laya.Vector3.distance(this.TargetAttack.transform.position, _pos);
                if (_d < _dis) {
                    _value = i;
                    _list.push(_value);
                    _dis = _d;
                }
            }
            this.CheckNearPosisOneRoom(this.TargetAttack, 0, _list, 2);
        }
        CheckNearPosisOneRoom(_target, _index, _list, type = 1) {
            let _v = 0;
            let _id = 0;
            for (let i = _list.length - 1; i >= 0; i--) {
                if (_index == _v) {
                    let _result = new Array();
                    if (!_target.transform || !_target.transform.position)
                        return;
                    let _originPos = new Laya.Vector3(_target.transform.position.x, _target.transform.position.y + 0.1, _target.transform.position.z);
                    let _targetPos = new Laya.Vector3(this.RoadPosList[_list[i]].x, _target.transform.position.y + 0.1, this.RoadPosList[_list[i]].z);
                    if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(_originPos, _targetPos, _result)) {
                        for (let j = 0; j < _result.length; j++) {
                            let element = _result[j];
                            if (element.collider.owner.name.indexOf("room") != -1) {
                                _index++;
                                this.CheckNearPosisOneRoom(_target, _index, _list, type);
                                return;
                            }
                        }
                    }
                    _id = _list[i];
                    if (type == 1) {
                        this.curRoadId = _id;
                    }
                    else {
                        this.TargetRoadId = _id;
                    }
                    break;
                }
                _v++;
            }
        }
        MoveToNearPos(index = 1) {
            this.curFollowPos = this.RoadPosList[this.curRoadId].clone();
            console.log("当前走向最近的点的名字：", this.RoadNameList[this.curRoadId]);
            if (!this.GetTransForm() || !this.GetPosition())
                return;
            let _ranX = this.curFollowPos.x - this.GetPosition().x;
            let _ranZ = this.curFollowPos.z - this.GetPosition().z;
            let _dir = new Laya.Vector3(_ranX, 0, _ranZ);
            Laya.Vector3.normalize(_dir, _dir);
            _dir = new Laya.Vector3(_dir.x * UserComData.BossSpeedFactor * this._factor, this.Rb.linearVelocity.y, _dir.z * UserComData.BossSpeedFactor * this._factor);
            this.direction = _dir;
            if (_ranZ > 0) {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180);
            }
            else {
                this.Mod.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
                this.Follow.transform.localRotationEulerY = Math.atan(_ranX / _ranZ) / (Math.PI / 180) - 180;
            }
        }
        CheckNearPos() {
            let _dis = 20;
            let _value = -1;
            let _list = [];
            for (let i = 0; i < this.RoadPosList.length; i++) {
                let _pos = this.RoadPosList[i];
                let _originPos;
                if (this.GetTransForm()) {
                    _originPos = this.GetTransForm().position;
                }
                else {
                    _originPos = new Laya.Vector3(0, 0, 0);
                }
                let _d = Laya.Vector3.distance(_originPos, _pos);
                if (_d < _dis) {
                    _value = i;
                    _list.push(_value);
                    _dis = _d;
                }
            }
            if (this.GetObj()) {
                this.CheckNearPosisOneRoom(this.GetObj(), 0, _list, 1);
            }
        }
        CheckPointLookArea() {
            this.mStateMachine.changeState(this.mLookState);
        }
        onCollisionStay(other) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (other.other.owner.name.indexOf("Mod_") == 0 && !this._isStuck) {
                this._CollosionType = 1;
                this._CollosionTime = Laya.timer.currTimer;
                if (!this.GetTransForm() || !this.GetPosition())
                    return;
                this._CollosionPos = this.GetPosition();
                this._CollosionObj = other.other.owner;
                this._isStuck = true;
            }
            else if (other.other.owner.name.indexOf("room") == 0 && !this._isStuck) {
                this._CollosionType = 2;
                this._CollosionTime = Laya.timer.currTimer;
                if (!this.GetTransForm() || !this.GetPosition())
                    return;
                this._CollosionPos = this.GetPosition();
                this._CollosionObj = other.other.owner;
                this._isStuck = true;
            }
        }
        Check_State() {
        }
        CheckRunnerState() {
            if (this.aiState == AIState.Catch || this.aiState == AIState.None)
                return;
            let _list = this.CheckTriggerRunnerByArea();
            if (_list && _list.length > 0) {
                for (let i = 0; i < _list.length; i++) {
                    let _element = _list[i];
                    if (_element.name.indexOf("Player") != -1) {
                        let _ranAttack = Utils.Range(1, 30);
                        if (UserComData.isGuide && _ranAttack != 1)
                            return;
                        let _script = _element.getComponent(Player$1);
                        if (_script) {
                            if (_script.isDead)
                                return;
                            if (_script.State == 1 && !UserComData.isStealthState) {
                                let _Target = new Laya.Vector3(0, 0, 0);
                                Laya.Vector3.subtract(_script.GetPosition(), this.GetTransForm().position, _Target);
                                let result = Laya.Vector3.dot(this.direction, _Target);
                                if (result > 0) {
                                    this.TargetAttack = _element;
                                    this.mStateMachine.changeState(this.mCatchState, 1);
                                    return;
                                }
                            }
                            else {
                                if (UserComData.isStealthState)
                                    return;
                                let _newDis = Laya.Vector3.distance(_script.GetPosition(), this.GetPosition());
                                if (_newDis <= 0.5) {
                                    this.TargetAttack = _element;
                                    this.mStateMachine.changeState(this.mCatchState, 1);
                                }
                            }
                        }
                    }
                    else if (_element.name.indexOf("AI") != -1) {
                        let _script = _element.getComponent(AI);
                        if (_script) {
                            let _Target = new Laya.Vector3(0, 0, 0);
                            Laya.Vector3.subtract(_script.GetPosition(), this.GetTransForm().position, _Target);
                            let _newDis = Laya.Vector3.distance(_script.GetPosition(), this.GetPosition());
                            if (this.TargetAttack && this.TargetAttack.transform) {
                                let _oldDis = Laya.Vector3.distance(this.TargetAttack.transform.position, this.GetPosition());
                                if (_oldDis <= _newDis) {
                                    return;
                                }
                            }
                            this.TargetAttack = _element;
                            this.mStateMachine.changeState(this.mFollowState, 1);
                            return;
                        }
                    }
                }
            }
        }
        CheckDistance() {
            if (UserComData.HaveTips)
                return;
            let _dis = Laya.Vector3.distance(this.GetPosition(), SceneLogic.inst.player.transform.position);
            _dis = Math.round(_dis * 10) / 10;
            if (_dis > 7)
                return;
            if (_dis == 2 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "front");
                SoundMgr.inst.playSound("cat_02");
            }
            else if (_dis == 4 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "nearby");
            }
            else if (_dis == 6 && this.CheckisOneRoom()) {
                EventMgr.inst.emit("BossTips", "around");
                SoundMgr.inst.playSound("cat_06");
            }
        }
        CheckisOneRoom() {
            let _isOneRoom = true;
            let _result = new Array();
            let _originPos = new Laya.Vector3(this.GetPosition().x, this.GetPosition().y + 1, this.GetPosition().z);
            let _targetPos = new Laya.Vector3(SceneLogic.inst.player.transform.position.x, SceneLogic.inst.player.transform.position.y + 1, SceneLogic.inst.player.transform.position.z);
            if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(_originPos, _targetPos, _result)) {
                _result.forEach(element => {
                    if (element.collider.owner.name.indexOf("room0") != -1) {
                        _isOneRoom = false;
                    }
                });
            }
            return _isOneRoom;
        }
        PlayerLook() {
            this.Look.transform.localRotationEuler = this.Follow.transform.localRotationEuler.clone();
            this.LookCamera.active = true;
            let _script = this.LookCamera.getComponent(CameraLook);
            if (!_script) {
                this.LookCamera.addComponent(CameraLook);
            }
        }
        PlayerResume() {
            this.LookCamera.active = false;
            let _script = this.LookCamera.getComponent(CameraLook);
            if (_script) {
                _script.destroy();
            }
        }
        CheckPlayerDistance() {
            if (!UserComData.IsactivationFu)
                return;
            if (this.CheckisOneRoom()) {
                UserComData.CanSealBoss = true;
            }
            else {
                UserComData.CanSealBoss = false;
            }
        }
    }

    class CameraScript extends BaseScript {
        constructor() {
            super(...arguments);
            this.hitresults = [];
            this.needShakeCamera = false;
            this.curShakeIntensity = 0;
            this.cameraFollowQt = new Laya.Quaternion();
            this.offsetVec = new Laya.Vector3();
        }
        onAwake() {
            this.InitBase();
            this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.InitCamera();
        }
        InitCamera() {
            this.mPlayer = SceneLogic.inst.player;
            this.CameraState = CameraState.Normal;
            this.initLookPos = new Laya.Vector3(0, 0, 0);
            this.initPos = new Laya.Vector3(this.GetTransForm().localPositionX, this.GetTransForm().localPositionY, this.GetTransForm().localPositionZ);
        }
        UpdateInit() {
            if (UserComData.gameModel == GameModel.Runner) {
                this.ChangeitemAfterPos = new Laya.Vector3(0, 0.88, -1.1);
                this.GetTransForm().localPosition = new Laya.Vector3(0, 0.88, -1.97);
                this.GetTransForm().localRotationEuler = new Laya.Vector3(-16.5, 0.09 - 180, 0);
            }
            else {
                this.GetTransForm().localPosition = new Laya.Vector3(0, 1.8, -1.58);
                this.GetTransForm().localRotationEuler = new Laya.Vector3(-20.9, -180, 0);
            }
            this.initPos = new Laya.Vector3(this.GetTransForm().localPositionX, this.GetTransForm().localPositionY, this.GetTransForm().localPositionZ);
        }
        ChangeCameraTypeWin() {
            this.CameraState = CameraState.LookAt;
        }
        ChangeScale(index) {
            let _scale = 1 + 0.03 * index;
            _scale = _scale > 1.15 ? 1.15 : _scale;
            this.offsetVec = new Laya.Vector3(this.offsetVec.x * _scale, this.offsetVec.y * _scale, this.offsetVec.z * _scale);
        }
        onLateUpdate() {
            if (UserComData.isSelectOver) {
                this.LerpTarget();
                this.initPos = this.ChangeitemAfterPos.clone();
            }
            else {
                this.UpdateCameraPos();
            }
        }
        LerpTarget() {
            let _outPos = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.lerp(this.GetTransForm().localPosition, this.ChangeitemAfterPos, 2 * Laya.timer.delta * 0.001, _outPos);
            this.GetTransForm().localPosition = _outPos;
        }
        UpdateCameraPos() {
            if (this.mPlayer == null || this.mPlayer.transform == null)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            if (UserComData.PlayerisLook) {
                this.GetTransForm().localPosition = this.initLookPos.clone();
                return;
            }
            if (!UserComData.PlayerisLook && this.GetTransForm().localPosition.z == 0) {
                this.GetTransForm().localPosition = this.initPos.clone();
                return;
            }
            let result = new Laya.HitResult();
            let direction = new Laya.Vector3(0, 0, 0);
            let _pos = new Laya.Vector3(this.mPlayer.transform.position.x, this.mPlayer.transform.position.y + 1, this.mPlayer.transform.position.z);
            Laya.Vector3.subtract(this.GetPosition(), _pos, direction);
            Laya.Vector3.normalize(direction, direction);
            let _target = new Laya.Vector3(this.GetPosition().x + direction.x * 0.1, this.GetPosition().y + direction.y * 0.1, this.GetPosition().z + direction.z * 0.1);
            SceneLogic.inst.Game_Scene.physicsSimulation.raycastFromTo(_pos, _target, result);
            if (result.succeeded) {
                if (result.collider.owner.name && (result.collider.owner.name.indexOf("Mod_") != -1 || result.collider.owner.name.indexOf("room") != -1 || result.collider.owner.name.indexOf("wall") != -1)) {
                    this.owner.transform.position = result.point;
                    if (this.GetTransForm().localPositionZ < -1.6) {
                        this.GetTransForm().localPosition = this.initPos.clone();
                    }
                }
            }
            else {
                this.GetTransForm().localPosition = this.initPos.clone();
            }
        }
        CameraFollowVictory() {
            if (this.mPlayer == null || this.mPlayer.transform == null)
                return;
        }
        shakeCamera(shakeFactor) {
            this.needShakeCamera = true;
            this.curShakeIntensity = shakeFactor;
        }
        CameraFollow() {
            if (this.mPlayer == null || this.mPlayer.transform == null)
                return;
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            let up = new Laya.Vector3(0, 0, 0);
            this.mPlayer.transform.getUp(up);
            Laya.Vector3.normalize(up, up);
            let originPos = new Laya.Vector3(this.mPlayer.transform.position.x, 0, this.mPlayer.transform.position.z);
            let targetPos = new Laya.Vector3(0, 0, 0);
            let curtargetPos = new Laya.Vector3(0, 0, 0);
            let curOffset = this.offsetVec;
            Laya.Vector3.add(originPos, curOffset, targetPos);
            Laya.Vector3.lerp(this.GetTransForm().position, targetPos, 1, curtargetPos);
            this.SetPosition(curtargetPos);
            if (this.needShakeCamera) {
                let randomX = Math.random();
                let XSymbol = Utils.Range(0, 1);
                if (XSymbol == 0) {
                    randomX = -randomX;
                }
                let randomY = Math.random();
                let ySymbol = Utils.Range(0, 1);
                if (ySymbol == 0) {
                    randomY = -randomY;
                }
                let randomZ = Math.random();
                let zSymbol = Utils.Range(0, 1);
                if (zSymbol == 0) {
                    randomZ = -randomZ;
                }
                let newRandomV3 = new Laya.Vector3(randomX, randomY, randomZ);
                Laya.Vector3.normalize(newRandomV3, newRandomV3);
                let shakeV3 = new Laya.Vector3(this.curShakeIntensity * newRandomV3.x, this.curShakeIntensity * newRandomV3.y, this.curShakeIntensity * newRandomV3.z);
                this.curShakeIntensity -= Laya.timer.delta * 0.01;
                let shakePostion = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(this.GetPosition(), shakeV3, shakePostion);
                this.SetPosition(shakePostion);
                if (this.curShakeIntensity <= 0) {
                    this.needShakeCamera = false;
                }
            }
        }
        rayCheck() {
            let direction = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(new Laya.Vector3(this.mPlayer.transform.position.x, this.mPlayer.transform.position.y + 1, this.mPlayer.transform.position.z), this.GetPosition(), direction);
            this.ray.origin = this.GetPosition();
            this.ray.direction = direction;
            SceneLogic.inst.Game_Scene.physicsSimulation.rayCastAll(this.ray, this.hitresults, Laya.Vector3.scalarLength(direction));
            if (this.hitresults.length > 0) {
                let tempMap = {};
                for (let i = 0; i < this.hitresults.length; i++) {
                    let hitresult = this.hitresults[i];
                    let collider = hitresult.collider.owner;
                    if (collider.name && (collider.name.indexOf("Mod_") != -1 || collider.name.indexOf("room") != -1)) {
                        if (!collider.meshRenderer)
                            continue;
                        let mat = collider.meshRenderer.material;
                        mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
                        mat.albedoColorA = 0.2;
                        tempMap[collider.id] = collider;
                    }
                }
                var keys = Object.keys(UserComData.AlphaObjList);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    if (!tempMap[key]) {
                        var obj = UserComData.AlphaObjList[key];
                        var mat = obj.meshRenderer.material;
                        if (mat) {
                            Laya.timer.clearAll(mat);
                            Laya.Tween.clearAll(mat);
                            mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
                            mat.albedoColorA = 1;
                        }
                    }
                }
                UserComData.AlphaObjList = tempMap;
            }
            else {
                this.refreshObjAlpha();
            }
        }
        refreshObjAlpha() {
            var keys = Object.keys(UserComData.AlphaObjList);
            for (var index = keys.length - 1; index >= 0; index--) {
                var key = keys[index];
                var obj = UserComData.AlphaObjList[key];
                var mat = obj.meshRenderer.material;
                if (mat) {
                    Laya.timer.clearAll(mat);
                    Laya.Tween.clearAll(mat);
                    mat.albedoColorA = 1;
                }
            }
            UserComData.AlphaObjList = {};
        }
        onDestroy() {
        }
        onDispose() {
        }
    }

    class RunForward extends Laya.Script3D {
        constructor() { super(); }
        onAwake() {
            this.obj = this.owner;
        }
        onUpdate() {
            this.obj.transform.translate(new Laya.Vector3(0, 0, Laya.timer.delta * 0.001 * 3));
        }
    }

    class SceneLogic extends Laya.Script {
        constructor() {
            super();
            this.gameState = GameState.wait;
        }
        static get inst() {
            if (this._instance == null) {
                this._instance = new SceneLogic();
            }
            return this._instance;
        }
        onEnable() {
        }
        onAwake() {
            console.log("SceneLogic Awake");
            SceneLogic._instance = this;
            this.Game_Scene = this.owner;
            this.light = this.owner.getChildByName("Directional Light");
            this.light.shadowMode = Laya.ShadowMode.SoftLow;
            this.light.color = new Laya.Vector3(133 / 255, 108 / 255, 178 / 255);
            this.light.shadowDistance = 45;
            this.light.shadowResolution = 1024;
            this.light.intensity = 0.7;
            this.light.shadowStrength = 0.5;
            this.light.active = false;
            this.Game_Scene.enableFog = true;
            this.Game_Scene.fogStart = 5;
            this.Game_Scene.fogColor = new Laya.Vector3(226 / 255, 50 / 255, 50 / 255);
            this.Game_Scene.fogRange = 10;
            this.gamingUIRoot = new Laya.Image();
            Laya.stage.addChildAt(this.gamingUIRoot, 1);
            this.gamingUIRoot.pos(0, 0);
            this.GamePoint = this.owner.getChildByName("GamePoint");
            this.B_material = this.owner.getChildByName("B_material");
            this.B_material.active = false;
            this.GamePoint.active = false;
            this.room = this.owner.getChildByName("room");
            this.room.transform.position = new Laya.Vector3(-4.06, 0, 4.36);
            for (let i = 0; i < this.room.numChildren; i++) {
                if (this.room.getChildAt(i).name.indexOf("mod_ground_04") != -1) {
                }
                else {
                    this.room.getChildAt(i).name = "room0_" + this.room.getChildAt(i).name;
                }
            }
            this.settlement = this.owner.getChildByName("settlement");
            this.settlement.active = false;
            this.l_door = this.settlement.getChildByName("mod_door_01l");
            this.r_door = this.settlement.getChildByName("mod_door_01r");
            this.leftDoor = this.l_door.getComponent(Laya.Animator);
            this.RightDoor = this.r_door.getComponent(Laya.Animator);
            this.ResultRolePos = this.settlement.getChildByName("RolePos");
            this.RoleAni = this.ResultRolePos.getComponent(Laya.Animator);
            this.settlelight = this.settlement.getChildByName("Spot Light");
            this.lightAni = this.settlelight.getComponent(Laya.Animator);
            this.WinCamera = this.settlement.getChildByName("WinCamera");
            this.CamAni = this.WinCamera.getComponent(Laya.Animator);
            this.Plight = this.settlement.getChildByName("Point Light");
            this.PlightAni = this.Plight.getComponent(Laya.Animator);
            this.player = this.owner.getChildByName("Player");
            this.Camera_Main = this.player.getChildByName("Follow").getChildByName("Main Camera");
            this.BulletPos = this.player.getChildByName("player").getChildByName("BulletPos");
            this.PlayerController = this.player.addComponent(Player$1);
            this.CameraControl = this.Camera_Main.addComponent(CameraScript);
            this.Camera_Boss = this.owner.getChildByName("BossCamera");
            this.Camera_Survey = this.owner.getChildByName("SurveyCamera");
            this.BulletPool = this.owner.getChildByName("BulletPool");
            this.ItemPool = this.owner.getChildByName("ItemPool");
            this.AIPool = this.owner.getChildByName("AIPool");
            this.CJPool = this.owner.getChildByName("CJPool");
            this.CJPrefabs = this.owner.getChildByName("CJPrefabs");
            this.ItemPrefabs = this.owner.getChildByName("ItemPrefabs");
            this.CopyPrefabs = this.owner.getChildByName("CopyPrefabs");
            this.EffectPool = this.owner.getChildByName("EffectPool");
            this.FuPool = this.owner.getChildByName("FuPool");
            this.RolePrefabs = this.owner.getChildByName("RolePrefabs");
            this.run = this.RolePrefabs.getChildByName("run");
            this.boss = this.RolePrefabs.getChildByName("boss");
            this.RolePrefabs.transform.setWorldLossyScale(new Laya.Vector3(8, 8, 8));
            this.RolePrefabs.transform.localRotationEuler = new Laya.Vector3(0, 10, 0);
            this.RolePrefabs.active = false;
            this.lightPrefabs = this.owner.getChildByName("lightPrefabs");
            this.bossBorn = this.owner.getChildByName("bossBorn");
            this.BornAni = this.bossBorn.getChildByName("BornAni");
            this.role_boss = this.BornAni.getChildByName("role_boss");
            this.role_boss_fengyin = this.BornAni.getChildByName("role_boss_fengyin");
            this.bornEff = this.bossBorn.getChildByName("ef_BSDMM_delivery");
            this.bornEff.active = false;
            this.burstEff = this.BornAni.getChildByName("ef_BSDMM_burst");
            this.sealEff = this.BornAni.getChildByName("ef_BSDMM_seal");
            this.burstEff.active = false;
            this.sealEff.active = false;
            this.flyFu = this.owner.getChildByName("flyFu");
            this.FlyCameraPoint = this.flyFu.getChildByName("FlyCameraPoint");
            this.flyFu_Camera = this.FlyCameraPoint.getChildByName("FlyCamera");
            this.flyFu_Prefabs = this.FlyCameraPoint.getChildByName("ef_BSDMM_fengyin");
            this.flyFu.active = false;
            this.Matching = this.owner.getChildByName("Matching");
            this.Camera_Match = this.Matching.getChildByName("MatchCamera");
            this.point_0 = this.Matching.getChildByName("point_0");
            this.point_1 = this.Matching.getChildByName("point_1");
            this.point_2 = this.Matching.getChildByName("point_2");
            this.point_3 = this.Matching.getChildByName("point_3");
            this.point_4 = this.Matching.getChildByName("point_4");
            this.Camera_Role = this.owner.getChildByName("RoleCamera");
            this.Camera_Role.active = false;
            this.SetCommonValue();
            EventMgr.inst.onEvent("ChangeCamera", this, this.ChangeCamera);
            EventMgr.inst.onEvent("SurveyModel", this, this.SurveyModel);
            EventMgr.inst.onEvent("BossInstance", this, this.InstanceBoss);
            EventMgr.inst.onEvent("MatchBossUp", this, this.MatchBossUp);
        }
        SetCommonValue() {
            zs.laya.game.AppMain.appConfig["baseResList"].forEach(element => {
                let _prefab = zs.laya.Resource.LoadSprite3d(element);
                let Prefab = zs.laya.ObjectPool.GetSprite3d(_prefab);
                this.Game_Scene.addChild(Prefab);
                zs.laya.ObjectPool.RecoverSprite3d(Prefab);
            });
            this.GameReStart();
        }
        getLevelConfigData(level) {
            return UserComData.levelCfg[level];
        }
        getPropData() {
            return UserComData.stageCfg["prop"];
        }
        GameReStart() {
            this.GetAIName();
            console.log("初始化关卡");
            UserComData.CJItemList = [];
            this.gamingUIRoot.destroyChildren();
            this.FuPool.destroyChildren();
            this.FuPool.active = false;
            this.CJPool.destroyChildren();
            this.ItemPool.destroyChildren();
            this.AIPool.destroyChildren();
            UserComData.allRoadEulerList = [];
            UserComData.allRoadNameList = [];
            UserComData.allRoadPosList = [];
            UserComData.AIBornList = [];
            UserComData.AIEndPosList = [];
            UserComData.RunnerList = [];
            UserComData.runnerNameList = [];
            UserComData.resultNameList = [];
            UserComData.curSkillCount = 0;
            UserComData.CanIdleNameList = [];
            UserComData.DontCanIdleNameList = [];
            UserComData.MatchAINameList = [];
            UserComData.curItemList = [];
            UserComData.HaveTips = false;
            UserComData.PlayerisLook = false;
            UserComData.HaveWh = true;
            UserComData.isLookBoss = false;
            this.settlement.active = false;
            this.bossBorn.active = false;
            UserComData.isNearBox = false;
            UserComData.isClickBox = false;
            UserComData.curGetDiamond = 0;
            UserComData.curFuCount = 0;
            UserComData.isNearFu = false;
            UserComData.ChangeItemIndex = 1;
            UserComData.BossDelayTime = 30;
            UserComData.CanSealBoss = false;
            UserComData.IsactivationFu = false;
            UserComData.isSelectOver = false;
            UserComData.isStealthState = false;
            UserComData.HintSkillCanUse = false;
            UserComData.ImprisonmentSkillCanUse = false;
            UserComData.PlayerState = 1;
            UserComData.PropList.sort(() => Math.random() - 0.5);
            UserComData.PropState = [0, 0, 0];
            UserComData.itemSelectState = [1, 0, 0];
            Laya.timer.clearAll(this);
            this.gameState = GameState.wait;
            this.GetItemList();
            this.InitGameScene();
            this.Camera_Main.active = false;
        }
        GetAIName() {
            UserComData.AINameList = [];
            UserComData.AINameList = Utils.randomSipArray(UserComData.nameCfg, 5);
        }
        InitGameScene() {
            let data = null;
            let level;
            if (UserComData.cacheLevel <= 3) {
                if (UserComData.cacheLevel == 1) {
                    level = 1;
                }
                else if (UserComData.cacheLevel == 2) {
                    level = 3;
                }
                else if (UserComData.cacheLevel == 3) {
                    level = 5;
                }
            }
            else {
                level = Utils.Range(1, 5);
            }
            UserComData.userLevel = level;
            console.log("当前关卡：", level);
            for (let i = 0; i < this.lightPrefabs.numChildren; i++) {
                this.lightPrefabs.getChildAt(i).active = false;
            }
            data = this.getLevelConfigData(level);
            if (this.CJPool.numChildren == 0) {
                data.room.forEach(element => {
                    let _cj = null;
                    _cj = this.CJPool.getChildByName(element.name);
                    if (_cj == null || _cj.active) {
                        let resouce = this.CJPrefabs.getChildByName(element.name);
                        if (!resouce) {
                            resouce = this.ItemPrefabs.getChildByName(element.name);
                        }
                        _cj = Laya.Sprite3D.instantiate(resouce, this.CJPool);
                    }
                    if (element.name.indexOf("BSDMM_stop") != -1) {
                        let _mesh = _cj.getChildAt(0);
                        let _mat = _mesh.meshRenderer.material;
                        if (_mat) {
                            let _matChild = _mesh.getChildAt(0).meshRenderer.material;
                            this.up(_mat, _matChild);
                        }
                    }
                    _cj.name = "room_" + element.name;
                    _cj.active = true;
                    _cj.transform.position = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z));
                    _cj.transform.rotationEuler = new Laya.Vector3(parseFloat(element.rotation.x), -parseFloat(element.rotation.y), parseFloat(element.rotation.z));
                    _cj.transform.setWorldLossyScale(new Laya.Vector3(parseFloat(element.scale.x), parseFloat(element.scale.y), parseFloat(element.scale.z)));
                });
            }
            data.decorate.forEach(element => {
                let _cj = null;
                _cj = this.ItemPool.getChildByName(element.name);
                if (_cj == null || _cj.active) {
                    let resouce = this.ItemPrefabs.getChildByName(element.name);
                    if (!resouce) {
                        resouce = this.CJPrefabs.getChildByName(element.name);
                    }
                    _cj = Laya.Sprite3D.instantiate(resouce, this.ItemPool);
                }
                _cj.name = "Mod_" + element.name;
                _cj.active = true;
                UserComData.CJItemList.push(_cj);
                _cj.transform.position = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z));
                _cj.transform.rotationEuler = new Laya.Vector3(parseFloat(element.rotation.x), -parseFloat(element.rotation.y), parseFloat(element.rotation.z));
            });
            let _list = Utils.randomSipArray(UserComData.CJItemList, Math.round(UserComData.CJItemList.length / 8));
            for (let i = 0; i < _list.length; i++) {
                _list[i].active = false;
            }
            let tempAiBornList = [];
            let tempAiEndPosList = [];
            data.road.forEach(element => {
                let _pos = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z));
                let _euler = new Laya.Vector3(parseFloat(element.rotation.x), -parseFloat(element.rotation.y), parseFloat(element.rotation.z));
                UserComData.allRoadPosList.push(_pos);
                UserComData.allRoadEulerList.push(_euler);
                UserComData.allRoadNameList.push(element.name);
                if (element.name.indexOf("I") != -1) {
                    tempAiBornList.push(_pos);
                }
                if (element.name.indexOf("A") != -1) {
                    tempAiEndPosList.push(_pos);
                }
            });
            let _boxList = [];
            _boxList = Utils.randomSipArray(data.box, 1);
            _boxList.forEach(element => {
                let _cj = null;
                _cj = this.CJPool.getChildByName(element.name);
                if (_cj == null || _cj.active) {
                    let resouce = this.CJPrefabs.getChildByName(element.name);
                    if (!resouce) {
                        resouce = this.ItemPrefabs.getChildByName(element.name);
                    }
                    _cj = Laya.Sprite3D.instantiate(resouce, this.CJPool);
                    _cj.transform.position = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z));
                    _cj.transform.rotationEuler = new Laya.Vector3(parseFloat(element.rotation.x), -parseFloat(element.rotation.y), parseFloat(element.rotation.z));
                    _cj.active = true;
                    _cj.name = "room_" + element.name;
                    _cj.getChildByName("ef_BSDMM_box02").active = false;
                    _cj.getChildByName("ef_BSDMM_box01").active = false;
                    _cj.getChildByName("ef_BSDMM_box01").active = true;
                    _cj.getComponent(Laya.PhysicsCollider).collisionGroup = 4;
                    let _ani = _cj.getChildByName("box").getComponent(Laya.Animator);
                    _ani.enabled = false;
                }
            });
            let _fulist = [];
            _fulist = Utils.randomSipArray(data.fu, 3);
            _fulist.forEach(element => {
                let _cj = null;
                if (_cj == null || _cj.active) {
                    let resouce = this.CJPrefabs.getChildByName(element.name);
                    if (!resouce) {
                        resouce = this.ItemPrefabs.getChildByName(element.name);
                    }
                    _cj = Laya.Sprite3D.instantiate(resouce, this.FuPool);
                    _cj.transform.position = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z));
                    _cj.active = true;
                }
            });
            data.player.forEach(element => {
                UserComData.PlayerInit.pos = new Laya.Vector3(-parseFloat(element.position.x), parseFloat(element.position.y) + 0.2, parseFloat(element.position.z));
                UserComData.PlayerInit.euler = new Laya.Vector3(parseFloat(element.rotation.x), -parseFloat(element.rotation.y), parseFloat(element.rotation.z));
            });
            for (let i = 0; i < tempAiBornList.length; i++) {
                UserComData.AIBornList.push(tempAiBornList[i]);
            }
            UserComData.AIBornList.sort(() => Math.random() - 0.5);
            for (let i = 0; i < tempAiEndPosList.length; i++) {
                UserComData.AIEndPosList.push(tempAiEndPosList[i]);
            }
            UserComData.AIEndPosList.sort(() => Math.random() - 0.5);
            UserComData.isFinishLoad = true;
        }
        up(_mat, _matChild) {
            if (!_mat)
                return;
            Laya.Tween.clearTween(_mat);
            _mat._MainTex_STZ = 0;
            Laya.Tween.to(_mat, { _MainTex_STZ: 1 }, 2000, null, Laya.Handler.create(this, () => {
                if (!_mat)
                    return;
                this.up(_mat, _matChild);
            }));
            _mat._AlbedoIntensity = 1.6;
            _mat._ColorR = 0.44;
            _mat._ColorA = 0.7;
            _mat._ColorG = 0;
            _mat._ColorB = 0.7;
            if (!_mat)
                return;
            Laya.Tween.to(_mat, { _AlbedoIntensity: 3, _ColorR: 0.3, _ColorB: 0.51 }, 800, null, Laya.Handler.create(this, () => {
                if (!_mat)
                    return;
                Laya.Tween.to(_mat, { _AlbedoIntensity: 1.6, _ColorR: 0.44, _ColorB: 0.7 }, 1200, null);
            }));
            _matChild._AlbedoIntensity = 1.5;
            _matChild._ColorR = 0.43;
            _matChild._ColorG = 0;
            _matChild._ColorB = 1;
            _matChild._ColorA = 0.5;
            if (!_matChild)
                return;
            Laya.Tween.to(_matChild, { _AlbedoIntensity: 2.7 }, 800, null, Laya.Handler.create(this, () => {
                if (!_matChild)
                    return;
                Laya.Tween.to(_matChild, { _AlbedoIntensity: 1.6 }, 1200, null);
            }));
        }
        down(_mat) {
            Laya.Tween.to(_mat, { _MainTex_STZ: 0 }, 750, null, Laya.Handler.create(this, () => {
            }));
        }
        CheckSelfRoadEnd() {
            for (let i = 0; i < UserComData.allRoadNameList.length; i++) {
                let _name = UserComData.allRoadNameList[i];
                let _Endname = _name.substring(_name.lastIndexOf("_") + 1);
                if (_Endname.length >= 3) {
                    let _pos = UserComData.allRoadPosList[i];
                    let _canIdle = true;
                    let result = [];
                    let _originPos = new Laya.Vector3(_pos.x, _pos.y + 5, _pos.z);
                    let _endPos = new Laya.Vector3(_pos.x, _pos.y, _pos.z);
                    if (SceneLogic.inst.Game_Scene.physicsSimulation.raycastAllFromTo(_originPos, _endPos, result)) {
                        result.forEach(element => {
                            if (element.collider.owner.name.indexOf(_Endname) != -1) {
                                _canIdle = false;
                            }
                        });
                    }
                    if (_canIdle) {
                        UserComData.CanIdleNameList.push(_name);
                    }
                    else {
                        UserComData.DontCanIdleNameList.push({
                            RoadPos: _pos,
                            RoadName: _name
                        });
                    }
                }
            }
        }
        HideItem(ItemName) {
            let _posName = "";
            let _isHide = false;
            for (let i = 0; i < UserComData.DontCanIdleNameList.length; i++) {
                let _name = UserComData.DontCanIdleNameList[i].RoadName;
                let _Endname = _name.substring(_name.lastIndexOf("_") + 1);
                if (ItemName.indexOf(_Endname) != -1) {
                    let _pos = UserComData.DontCanIdleNameList[i].RoadPos;
                    let result = [];
                    if (this.Game_Scene.physicsSimulation.raycastAllFromTo(new Laya.Vector3(_pos.x, _pos.y + 3, _pos.z), new Laya.Vector3(_pos.x, _pos.y, _pos.z), result)) {
                        for (let i = 0; i < result.length; i++) {
                            let element = result[i];
                            if (element.collider.owner.name.indexOf(_Endname) != -1) {
                                element.collider.owner.active = false;
                                _posName = _name;
                                _isHide = true;
                                break;
                            }
                        }
                    }
                }
                if (_isHide) {
                    break;
                }
            }
            return _posName;
        }
        showMatchScene() {
            this.Camera_Main.active = false;
            this.Matching.active = true;
        }
        closeMatchScene() {
            if (UserComData.gameModel == GameModel.Runner) {
                this.Camera_Main.active = true;
                this.ChangeSound();
            }
            else {
                Laya.SoundManager.stopAll();
                UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
                SoundMgr.inst.playMusic("bgm_05", 1);
                this.Camera_Main.active = false;
                this.Camera_Survey.active = true;
            }
            this.Matching.active = false;
        }
        get3DPostionBy2DPosition(position) {
            let realPosition = new Laya.Vector3(0, 0, 0);
            let isout = this.Camera_Role.convertScreenCoordToOrthographicCoord(new Laya.Vector3(position.x, position.y, 0), realPosition);
            return new Laya.Vector3(realPosition.x, realPosition.y, realPosition.z);
        }
        ShowRole(rolePos) {
            if (!this.UIScene) {
                this.UIScene = new Laya.Scene3D();
                rolePos.addChild(this.UIScene);
                let _pos = rolePos.localToGlobal(new Laya.Point(0, 0));
                if (rolePos.centerX == 0 && rolePos.centerY == 0) {
                    _pos = new Laya.Point(Laya.stage.width / 2, Laya.stage.height / 2);
                }
                let _camera = new Laya.Camera();
                _camera.orthographic = true;
                _camera.clearFlag = Laya.CameraClearFlags.DepthOnly;
                _camera.enableHDR = false;
                _camera.transform.localPosition = new Laya.Vector3(0, 2, 3);
                let rot = Laya.Browser.width / Laya.stage.width;
                if (Laya.Browser.onQGMiniGame) {
                    _pos.x = _pos.x * rot;
                    _pos.y = _pos.y * rot;
                }
                _camera.viewport = new Laya.Viewport(_pos.x - 400, _pos.y - 400, 800, 800);
                this.UIScene.addChild(_camera);
                this._prefab = Laya.Sprite3D.instantiate(SceneLogic.inst.RolePrefabs, this.UIScene);
                this._prefab.active = true;
                this._uiRun = this._prefab.getChildByName("run");
                this._uiboss = this._prefab.getChildByName("boss");
                this._prefab.transform.localPosition = new Laya.Vector3(0, 0, 0);
                this.UIScene.active = true;
            }
        }
        closeRole() {
            if (this.UIScene) {
                this.UIScene.destroy();
            }
            this.UIScene = null;
        }
        showSignRole(rolePos, prefabName, scale = 2, type = 1) {
            if (!this.UIScene) {
                this.UIScene = new Laya.Scene3D();
                rolePos.addChild(this.UIScene);
                let _pos = rolePos.localToGlobal(new Laya.Point(0, 0));
                _pos = new Laya.Point(Laya.stage.width / 2 + rolePos.centerX, (_pos.y / 750) * Laya.stage.height);
                let _camera = new Laya.Camera();
                _camera.orthographic = true;
                _camera.clearFlag = Laya.CameraClearFlags.DepthOnly;
                _camera.enableHDR = false;
                _camera.transform.localPosition = new Laya.Vector3(0, 1, 3);
                let rot = Laya.Browser.width / Laya.stage.width;
                if (Laya.Browser.onQGMiniGame) {
                    _pos.x = _pos.x * rot;
                    _pos.y = _pos.y * rot;
                }
                _camera.viewport = new Laya.Viewport(_pos.x - 400, _pos.y - 400, 800, 800);
                this.UIScene.addChild(_camera);
                let _prefab;
                if (prefabName.indexOf("signBoy") != -1) {
                    _prefab = Laya.loader.getRes("3dlh/Conventional/" + prefabName + ".lh");
                }
                else {
                    _prefab = zs.laya.Resource.LoadSprite3d(prefabName);
                }
                this._prefab = zs.laya.ObjectPool.GetSprite3d(_prefab);
                if (type == 2) {
                    for (let i = 0; i < this._prefab.numChildren; i++) {
                        let _element = this._prefab.getChildAt(i);
                        if (_element.name.indexOf("mod_") != -1) {
                            _element.skinnedMeshRenderer.material = this.boss.getChildByName("role_boss").getChildByName("mod_boss01").skinnedMeshRenderer.sharedMaterial.clone();
                        }
                    }
                }
                this.UIScene.addChild(this._prefab);
                this._prefab.active = true;
                let _ani = this._prefab.getComponent(Laya.Animator);
                _ani.crossFade("role_wait", 0.1);
                this._prefab.transform.localPosition = new Laya.Vector3(0, 0, 0);
                this._prefab.transform.localScale = new Laya.Vector3(scale, scale, scale);
                this._prefab.transform.localRotationEulerY += 10;
                this.UIScene.active = true;
            }
        }
        showRoleCamera(position) {
            this.Camera_Main.active = false;
            this.Camera_Role.active = true;
            this.RolePrefabs.active = true;
            this.Camera_Role.orthographic = true;
            this.RolePrefabs.transform.position = this.get3DPostionBy2DPosition(position);
            Laya.stage.setChildIndex(this.Game_Scene, Laya.stage.numChildren - 1);
        }
        closeRoleCamera() {
            this.Camera_Main.active = true;
            this.Camera_Role.active = false;
            this.RolePrefabs.active = false;
            Laya.stage.setChildIndex(this.Game_Scene, 0);
        }
        showRoleByName(name, type) {
            let _role;
            this._uiRun.active = type == 1;
            this._uiboss.active = type != 1;
            if (type == 1) {
                for (let i = 0; i < this._uiRun.numChildren; i++) {
                    this._uiRun.getChildAt(i).active = false;
                }
                _role = this._uiRun.getChildByName(name);
                _role.active = true;
            }
            else {
                for (let i = 0; i < this._uiboss.numChildren; i++) {
                    this._uiboss.getChildAt(i).active = false;
                }
                _role = this._uiboss.getChildByName(name);
                _role.active = true;
            }
            this._ani = _role.getComponent(Laya.Animator);
            this._ani.crossFade("role_wait", 0.1);
        }
        ShowRoleWinAni(value, crossValue) {
            this._ani.crossFade("role_win", 0.1);
            let _time = this._ani.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_time * value, this, () => {
                if (!this._ani)
                    return;
                this._ani.crossFade("role_wait", crossValue);
            });
        }
        MatchingEvent() {
            console.log("-----1------");
            let _list = [0, 1, 3, 4];
            let _ran = Utils.Range(2, 4);
            _list = Utils.randomSipArray(_list, _ran);
            _list.sort(function (a, b) { return a - b; });
            let _index = 0;
            this.Matching.getChildByName("ef_BSDMM_delivery2").active = false;
            this.Matching.getChildByName("ef_BSDMM_delivery2").active = true;
            this.Matching.getChildByName("ef_BSDMM_delivery2").active = false;
            this.showMatchScene();
            this.Matching.getChildByName("bossPoint").destroyChildren();
            let _value = 0;
            for (let i = 0; i < 5; i++) {
                let _light = this.Matching.getChildAt(i).getChildByName("ef_BSDMM_light");
                _light.active = true;
                if (i == 2) {
                    let _gq = this.Matching.getChildAt(i).getChildByName("ef_BSDMM_aperture01");
                    if (_gq) {
                        _gq.active = false;
                        _gq.active = true;
                    }
                }
                let _parent = this.Matching.getChildAt(i).getChildByName("role");
                _parent.destroyChildren();
                let _Name;
                if (i == 2 && UserComData.gameModel == GameModel.Runner) {
                    if (UserComData.RoletrySkinId != -1) {
                        _Name = UserComData.ShopRoleData[UserComData.RoletrySkinId].prefabName;
                    }
                    else {
                        _Name = UserComData.ShopRoleData[UserComData.PlayerSKinInfo.userRoleSkinId].prefabName;
                    }
                    EventMgr.inst.emit("InitName", { index: i, _pos: _parent.transform.position, name: "我" });
                }
                else {
                    _Name = UserComData.MatchAINameList.shift();
                    EventMgr.inst.emit("InitName", { index: i, _pos: _parent.transform.position, name: UserComData.AINameList[_value].id });
                    _value++;
                }
                let _resouce = this.run.getChildByName(_Name);
                let wanjia = Laya.Sprite3D.instantiate(_resouce, _parent);
                for (let i = 0; i < wanjia.numChildren; i++) {
                    let _element = wanjia.getChildAt(i);
                    if (_element.name.indexOf("mod_") != -1) {
                        _element.skinnedMeshRenderer.material = this.B_material.meshRenderer.sharedMaterial.clone();
                    }
                }
                wanjia.transform.localScale = new Laya.Vector3(0.8, 0.8, 0.8);
                let _ani = wanjia.getComponent(Laya.Animator);
                _ani.crossFade("role_wait", 0.1);
                if (i == _list[_index]) {
                    if (wanjia && wanjia.transform) {
                        wanjia.transform.localPosition = new Laya.Vector3(0, 100, 0);
                    }
                    _index++;
                    Laya.timer.once(800 * _index - 200, this, () => {
                        this.SpawEffect("ef_BSDMM_transformation", _parent.transform.position);
                        SoundMgr.inst.playSound("appear");
                    });
                    Laya.timer.once(800 * _index, this, () => {
                        if (wanjia && wanjia.transform) {
                            wanjia.transform.localPosition = new Laya.Vector3(0, 0, 0);
                        }
                        EventMgr.inst.emit("ShowName", i);
                    });
                    Laya.timer.once(800 * _index + Utils.Range(100, 2000), this, () => {
                        _ani.crossFade("role_observation", 0.1);
                        Laya.timer.once(2000, this, () => {
                            _ani.play("role_wait");
                        });
                    });
                }
                else {
                    if (wanjia && wanjia.transform) {
                        wanjia.transform.localPosition = new Laya.Vector3(0, 0, 0);
                    }
                    EventMgr.inst.emit("ShowName", i);
                }
                if (wanjia && wanjia.transform) {
                    wanjia.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                }
            }
        }
        MatchBossUp() {
            let _parent = this.Matching.getChildByName("bossPoint");
            _parent.destroyChildren();
            _parent.transform.localPositionY = 0.474;
            _parent.transform.localPositionZ = 1.827;
            let _resouce = this.boss.getChildByName("role_boss");
            let wanjia = Laya.Sprite3D.instantiate(_resouce, _parent);
            for (let i = 0; i < wanjia.numChildren; i++) {
                let _element = wanjia.getChildAt(i);
                if (_element.name.indexOf("mod_") != -1) {
                    _element.skinnedMeshRenderer.material = this.B_material.meshRenderer.sharedMaterial.clone();
                }
            }
            wanjia.transform.localScale = new Laya.Vector3(1, 1, 1);
            wanjia.transform.localPosition = new Laya.Vector3(0, 0, 0);
            wanjia.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            let _ani = wanjia.getComponent(Laya.Animator);
            _ani.crossFade("role_up", 0);
            Laya.timer.once(500, this, () => {
                this.Matching.getChildByName("ef_BSDMM_delivery2").active = true;
            });
            Laya.timer.once(3000, this, () => {
                _ani.crossFade("role_wait", 0.1);
                Laya.Tween.to(_parent.transform, { localPositionY: 0, localPositionZ: 1.5 }, 500, null);
            });
            Laya.timer.once(3600, this, () => {
                SoundMgr.inst.playSound("boss_burst");
                _ani.crossFade("role_burst", 0.1);
                let _time = _ani.getControllerLayer(0).getCurrentPlayState().duration;
                Laya.timer.once(_time * 1000, this, () => {
                    _ani.crossFade("role_wait", 0.1);
                });
            });
            Laya.timer.once(1500, this, () => {
                EventMgr.inst.emit("HideName");
                this.RoleRun();
            });
        }
        RoleRun() {
            for (let i = 0; i < 5; i++) {
                let _parent = this.Matching.getChildAt(i).getChildByName("role");
                let _light = this.Matching.getChildAt(i).getChildByName("ef_BSDMM_light");
                if (i == 2) {
                    let _gq = this.Matching.getChildAt(i).getChildByName("ef_BSDMM_aperture01");
                    if (_gq) {
                        _gq.active = false;
                    }
                }
                _light.active = false;
                let _roleAni = _parent.getChildAt(0).getComponent(Laya.Animator);
                _roleAni.play("role_run");
                _parent.getChildAt(0).addComponent(RunForward);
            }
        }
        SpawnAI() {
            this.CheckSelfRoadEnd();
            let _aiCount = 0;
            if (UserComData.gameModel == GameModel.Runner) {
                _aiCount = 4;
                UserComData.RunnerList.push(this.player);
            }
            else {
                _aiCount = 5;
            }
            let _list = [];
            for (let i = 0; i < this.ItemPrefabs.numChildren; i++) {
                _list[i] = i;
            }
            _list = Utils.randomSipArray(_list, _aiCount);
            let _Plist = [];
            for (let i = 0; i < UserComData.RoleNameList.length; i++) {
                _Plist[i] = i;
            }
            _Plist.sort(() => Math.random() - 0.5);
            for (let i = 0; i < _aiCount; i++) {
                let _ai = null;
                let _aires = this.owner.getChildByName("AI");
                let resouce = this.ItemPrefabs.getChildAt(_list[i]);
                _ai = Laya.Sprite3D.instantiate(_aires, this.AIPool);
                _ai.active = true;
                _ai.name = "AI_" + resouce.name;
                let _EndList = [];
                for (let i = 0; i < UserComData.CanIdleNameList.length; i++) {
                    let _name = UserComData.CanIdleNameList[i];
                    let _Endname = _name.substring(_name.lastIndexOf("_") + 1);
                    if (resouce.name.indexOf(_Endname) != -1) {
                        _EndList.push(_name);
                    }
                }
                let _ranPrefab = _Plist[i];
                let _prefabName = UserComData.RoleNameList[_ranPrefab];
                UserComData.MatchAINameList.push(_prefabName);
                _ai.transform.position = new Laya.Vector3(UserComData.AIBornList[i].x, UserComData.AIBornList[i].y + 0.5, UserComData.AIBornList[i].z);
                let _aiScript = _ai.addComponent(AI);
                if (_EndList && _EndList.length >= 1) {
                    let _name = _EndList[Utils.Range(0, _EndList.length - 1)];
                    _aiScript.Init(resouce.name, _list[i], UserComData.AIBornList[i], _name, _ranPrefab, UserComData.AINameList[i]);
                    for (let i = 0; i < UserComData.CanIdleNameList.length; i++) {
                        let _idlename = UserComData.CanIdleNameList[i];
                        if (_name == _idlename) {
                            UserComData.CanIdleNameList.splice(i, 1);
                        }
                    }
                }
                else {
                    let _ranP = Utils.Range(0, 9);
                    if (_ranP < 10) {
                        let _posName = this.HideItem(resouce.name);
                        if (_posName) {
                            _aiScript.Init(resouce.name, _list[i], UserComData.AIBornList[i], _posName, _ranPrefab, UserComData.AINameList[i]);
                        }
                        else {
                            _aiScript.Init(resouce.name, _list[i], UserComData.AIBornList[i], UserComData.AIEndPosList[i], _ranPrefab, UserComData.AINameList[i]);
                        }
                    }
                    else {
                        _aiScript.Init(resouce.name, _list[i], UserComData.AIBornList[i], UserComData.AIEndPosList[i], _ranPrefab, UserComData.AINameList[i]);
                    }
                }
                UserComData.RunnerList.push(_ai);
            }
        }
        GameStart() {
            console.log("开始游戏");
            this.SpawnAI();
            this.Game_Scene.enableFog = true;
            this.lightPrefabs.getChildByName(UserComData.userLevel.toString()).active = true;
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.PlayerController.surveyModlewait();
                this.player.transform.position = new Laya.Vector3(-50, 0.3, 0);
                this.CJPool.getChildByName("room_treasure").active = false;
            }
            else {
                UserComData.BossName = "小智";
                this.player.transform.position = new Laya.Vector3(0, 0.1, 0);
            }
            this.CameraControl.UpdateInit();
            this.PlayerController.Init();
            this.gameState = GameState.playing;
        }
        ChangeCamera() {
            this.Camera_Main.active = false;
            this.Camera_Survey.active = true;
        }
        ChangeSound() {
            Laya.SoundManager.stopAll();
            UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
            Laya.timer.once(1000, this, () => {
                if (UserComData.gameModel == GameModel.Runner) {
                    SoundMgr.inst.playMusic("bgm_02", 1);
                    console.log("进入bgm_03");
                    Laya.timer.once(29000, this, () => {
                        Laya.SoundManager.stopAll();
                        UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
                        SoundMgr.inst.playMusic("bgm_03", 1);
                        Laya.timer.once(119000, this, () => {
                            if (this.gameState != GameState.playing)
                                return;
                            Laya.SoundManager.stopAll();
                            UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
                            SoundMgr.inst.playMusic("bgm_04", 1);
                        });
                    });
                }
                else {
                    SoundMgr.inst.playMusic("bgm_03", 1);
                    Laya.timer.once(119000, this, () => {
                        if (this.gameState != GameState.playing)
                            return;
                        Laya.SoundManager.stopAll();
                        UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
                        SoundMgr.inst.playMusic("bgm_04", 1);
                    });
                }
            });
        }
        SurveyModel() {
            this.BornBossAni();
            Laya.timer.once(5000, this, () => {
                this.bossBorn.active = false;
                EventMgr.inst.emit("showView");
                this.ChangeSound();
                UserComData.startGameTime = Laya.timer.currTimer;
                this.Camera_Survey.active = false;
                this.Camera_Main.active = true;
                this.PlayerController.surveyModlemove();
            });
        }
        InstanceBoss() {
            this.BornBossAni();
            Laya.timer.once(5000, this, () => {
                this.bossBorn.active = false;
                EventMgr.inst.emit("showView");
                let _bossres = this.owner.getChildByName("Boss");
                let _boss = Laya.Sprite3D.instantiate(_bossres, this.AIPool);
                let _bosssCript = _boss.addComponent(Boss);
                _boss.transform.position = new Laya.Vector3(0, 0, 0);
                _bosssCript.Init();
            });
        }
        BornBossAni() {
            this.role_boss_fengyin.active = false;
            this.role_boss.active = true;
            this.BornAni.transform.localPosition = new Laya.Vector3(0, -1.5, -0.43);
            this.role_boss.transform.localRotationEuler = new Laya.Vector3(0, 90, 0);
            this.bossBorn.active = true;
            this.Camera_Survey.active = false;
            this.bornEff.active = false;
            this.bornEff.active = true;
            this.burstEff.active = false;
            this.sealEff.active = false;
            SoundMgr.inst.playSound("delivery");
            let _bornAni = this.BornAni.getComponent(Laya.Animator);
            _bornAni.crossFade("3", 0.1);
            let _bossAni = this.role_boss.getComponent(Laya.Animator);
            _bossAni.crossFade("role_wait", 0.1);
            Laya.timer.once(2000, this, () => {
                _bossAni.crossFade("role_burst", 0.1);
                SoundMgr.inst.playSound("boss_burst");
                this.burstEff.active = true;
                let _time = _bossAni.getControllerLayer(0).getCurrentPlayState().duration;
                Laya.timer.once(_time * 1000, this, () => {
                    _bossAni.crossFade("role_wait", 0.1);
                });
            });
        }
        FailBossAni(type) {
            this.BornAni.transform.localPosition = new Laya.Vector3(0, 0.1, -0.43);
            let _bossAni;
            if (type && type == 1) {
                SceneLogic.inst.flyFu.active = false;
                this.role_boss_fengyin.active = true;
                this.role_boss.active = false;
                this.role_boss_fengyin.transform.localRotationEuler = new Laya.Vector3(0, 90, 0);
                _bossAni = this.role_boss_fengyin.getComponent(Laya.Animator);
            }
            else {
                this.role_boss_fengyin.active = false;
                this.role_boss.active = true;
                this.role_boss.transform.localRotationEuler = new Laya.Vector3(0, 90, 0);
                _bossAni = this.role_boss.getComponent(Laya.Animator);
            }
            this.bossBorn.active = true;
            this.bornEff.active = true;
            this.sealEff.active = true;
            this.burstEff.active = false;
            SoundMgr.inst.playSound("seal");
            let _bornAni = this.BornAni.getComponent(Laya.Animator);
            _bornAni.crossFade("3_dwon", 0.1);
            _bossAni.crossFade("role_burst", 0.1);
            SoundMgr.inst.playSound("boss_burst");
            let _time = _bossAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_time * 1000, this, () => {
                _bossAni.crossFade("role_wait", 0.1);
            });
        }
        RunnerModeFailAni() {
            this.l_door.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.r_door.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.WinCamera.transform.localPosition = new Laya.Vector3(0, 1, -0.47);
            this.leftDoor.enabled = false;
            this.RightDoor.enabled = false;
            this.RoleAni.enabled = false;
            this.lightAni.enabled = false;
            this.CamAni.enabled = false;
            this.PlightAni.enabled = false;
            this.Game_Scene.enableFog = false;
            this.ResultRolePos.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.ResultRolePos.destroyChildren();
            this.Plight.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.settlelight.intensity = 10;
            this.settlelight.range = 8.379;
            this.settlelight.spotAngle = 17.919;
            this.settlement.active = true;
            this.Camera_Main.active = false;
            Laya.timer.once(1000, this, () => {
                this.leftDoor.enabled = true;
                this.leftDoor.play("door_01l_close", 0, 0);
                this.RightDoor.enabled = true;
                this.RightDoor.play("door_01r_close", 0, 0);
                this.PlightAni.enabled = true;
                this.CamAni.enabled = true;
                Laya.Tween.to(this.settlelight, { intensity: 0 }, 1000, null);
                Laya.Tween.to(this.settlelight, { range: 10 }, 1000, null);
                Laya.Tween.to(this.settlelight, { spotAngle: 0 }, 1000, null);
            });
        }
        Showresult3D() {
            this.Game_Scene.enableFog = false;
            this.settlement.active = true;
            this.Camera_Main.active = false;
            this.ResultRolePos.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.ResultRolePos.destroyChildren();
            this.WinCamera.transform.localPosition = new Laya.Vector3(0, 1, -1.47);
            this.Plight.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.leftDoor.crossFade("door_01l_wait", 0.1);
            this.RightDoor.crossFade("door_01r_wait", 0.1);
            this.RoleAni.crossFade("2_wait", 0.1);
            this.lightAni.enabled = false;
            this.CamAni.enabled = false;
            this.PlightAni.enabled = false;
            this.settlelight.intensity = 0;
            this.settlelight.range = 10;
            this.settlelight.spotAngle = 0;
            let _Name = UserComData.ShopRoleData[UserComData.PlayerSKinInfo.userRoleSkinId].prefabName;
            if (UserComData.RoletrySkinId != -1) {
                _Name = UserComData.ShopRoleData[UserComData.RoletrySkinId].prefabName;
            }
            let _resouce = this.run.getChildByName(_Name);
            let wanjia = Laya.Sprite3D.instantiate(_resouce, this.ResultRolePos);
            for (let i = 0; i < wanjia.numChildren; i++) {
                let _element = wanjia.getChildAt(i);
                if (_element.name.indexOf("mod_") != -1) {
                    _element.skinnedMeshRenderer.material = this.B_material.meshRenderer.sharedMaterial.clone();
                }
            }
            wanjia.transform.localScale = new Laya.Vector3(0.8, 0.8, 0.8);
            wanjia.transform.localPosition = new Laya.Vector3(0, 0, 0);
            wanjia.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            let _ani = wanjia.getComponent(Laya.Animator);
            _ani.crossFade("role_wait", 0.1);
            Laya.timer.once(1000, this, () => {
                SoundMgr.inst.playSound("open");
                _ani.crossFade("role_run", 0.1);
                this.leftDoor.crossFade("door_01l", 0.1);
                this.RightDoor.crossFade("door_01r", 0.1);
                this.RoleAni.crossFade("2", 0.1);
                Laya.Tween.to(this.settlelight, { intensity: 10 }, 1000, null);
                Laya.Tween.to(this.settlelight, { range: 8.3769 }, 1000, null);
                Laya.Tween.to(this.settlelight, { spotAngle: 17.919 }, 1000, null);
            });
        }
        GetItemList() {
            let _list = [];
            for (let i = 0; i < this.ItemPrefabs.numChildren; i++) {
                _list.push(i);
            }
            UserComData.curItemList = Utils.randomSipArray(_list, 3);
        }
        SpawEffect(name, Pos) {
            let _effect = zs.laya.Resource.LoadSprite3d(name);
            let Effect = zs.laya.ObjectPool.GetSprite3d(_effect);
            SceneLogic.inst.EffectPool.addChild(Effect);
            Effect.transform.position = Pos.clone();
            Effect.active = false;
            Effect.active = true;
            Laya.timer.once(3000, this, () => {
                zs.laya.ObjectPool.RecoverSprite3d(Effect);
            });
        }
        DestroyItem() {
            let _obj = this.ItemPool.getChildAt(Utils.Range(0, this.ItemPool.numChildren - 1));
            if (_obj && _obj.transform) {
                this.SpawEffect("ef_BSDMM_fire1", _obj.transform.position);
            }
            else {
                return;
            }
            Laya.timer.once(3000, this, () => {
                if (this.gameState != GameState.playing)
                    return;
                if (_obj && _obj.transform) {
                    SoundMgr.inst.playSound("ghost");
                    this.SpawEffect("ef_BSDMM_transformation", _obj.transform.position);
                    _obj.destroy();
                }
                ;
            });
        }
        RefreshFu(index) {
            if (SceneLogic.inst.gameState != GameState.playing)
                return;
            this.FuPool.getChildAt(index).active = true;
        }
        onDisable() {
        }
        wakeup() {
        }
        sleep() {
        }
    }

    var ZSRequest = zs.laya.game.WebService;
    class RequestMgr {
        static UpdatePlayerGold(gold) {
            ZSRequest.updatePlayerInfo({ gold: gold });
        }
        static UpdatePlayerLevel(level) {
            ZSRequest.updatePlayerInfo({ level_id: level });
        }
        static UpdatePlayerInfo(gold, level) {
            ZSRequest.updatePlayerInfo({ level_id: level, gold: gold });
        }
        static UpdatePlayerAny(arg) {
            for (var p in arg) {
                zs.laya.game.AppMain.playerInfo[p] = arg[p];
                if (p == "PlayerSKinInfo" || p == "SignInfo" || p == "Boxinfo" || p == "taskInfo" || p == "rankInfo" || p == "activityInfo") {
                    arg[p] = JSON.stringify(arg[p]);
                }
                Laya.LocalStorage.setItem(p, arg[p]);
            }
            ZSRequest.updatePlayerInfo(arg);
        }
        static UpdatePlayerByKey(key, value) {
            zs.laya.game.AppMain.playerInfo[key] = value;
            if (key == "PlayerSKinInfo" || key == "SignInfo" || key == "Boxinfo" || key == "taskInfo" || key == "rankInfo" || key == "activityInfo") {
                value = JSON.stringify(value);
            }
            Laya.LocalStorage.setItem(key, value);
            ZSRequest.updatePlayerInfo({ [key]: value });
        }
    }

    class GameStartUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this._selectType = 1;
            this.selectIndex = 0;
            this.TipsTabel = [];
            this.strengthTime = 0;
            this.preRadian = 0;
        }
        onAwake() {
            super.onAwake();
            this.LoadingWindow = this.owner.getChildByName("LoadingWindow");
            this.LoadingWindow.visible = false;
            this.SelectWindow = this.owner.getChildByName("SelectWindow");
            this.btnRunner = this.SelectWindow.getChildByName("btnRunner");
            this.btnVideoRunner = this.SelectWindow.getChildByName("btnVideoRunner");
            this.btnPursuer = this.SelectWindow.getChildByName("btnPursuer");
            this.GuideArea = this.SelectWindow.getChildByName("GuideArea");
            this.pur_img = this.btnPursuer.getChildByName("img");
            this.btnLottery = this.owner.getChildByName("btnLottery");
            this.btnGift = this.owner.getChildByName("btnGift");
            this.btnRole = this.owner.getChildByName("btnRole");
            this.btnSign = this.owner.getChildByName("btnSign");
            this.btnTask = this.owner.getChildByName("btnTask");
            this.btnActivity = this.owner.getChildByName("btnActivity");
            this.btnMoreGame = this.owner.getChildByName("btnMoreGame");
            this.InfoWindow = this.owner.getChildByName("InfoWindow");
            this.InfoWindow.visible = false;
            this.btnVideo = this.InfoWindow.getChildByName("bg").getChildByName("btnVideo");
            this.Info_btnClose = this.InfoWindow.getChildByName("bg").getChildByName("Info_btnClose");
            this.TestBg = this.owner.getChildByName("TestBg");
            this.TestBg.visible = false;
            this.info = this.owner.getChildByName("info");
            this.info_avatarUrl = this.info.getChildByName("info_avatarUrl");
            this.info_name = this.info.getChildByName("info_name");
            this.rankImg = this.info.getChildByName("rankImg");
            this.rank_title = this.rankImg.getChildByName("rank_title");
            let topUI = this.owner.getChildByName("topUI");
            let goldBg = topUI.getChildByName("goldBg");
            let fishBg = topUI.getChildByName("fishBg");
            let strengthBg = topUI.getChildByName("strengthBg");
            this.lblStrength = strengthBg.getChildByName("lblStrength");
            this.strengthDownTime = strengthBg.getChildByName("strengthDownTime");
            this.strengthDownTime.visible = false;
            this.lblGold = goldBg.getChildByName("lblGold");
            this.lblDialond = fishBg.getChildByName("lblDialond");
            this.selectImage = this.TestBg.getChildByName("selectImage");
            this.closebtn = this.TestBg.getChildByName("closebtn");
            this.btnMoney_1 = goldBg.getChildByName("btnMoney_1");
            this.btnMoney_2 = fishBg.getChildByName("btnMoney_2");
            this.btnMoney_3 = strengthBg.getChildByName("btnMoney_3");
            this.PropBuyWindow = this.owner.getChildByName("PropBuyWindow");
            this.propbg = this.PropBuyWindow.getChildByName("propbg");
            this.itembg = this.propbg.getChildByName("itembg");
            this.btnStart = this.propbg.getChildByName("btnStart");
            this.Start_count = this.btnStart.getChildByName("count");
            let prop_goldbg = this.PropBuyWindow.getChildByName("topUI").getChildByName("goldBg");
            let prop_diamondbg = this.PropBuyWindow.getChildByName("topUI").getChildByName("fishBg");
            this.prop_gold = prop_goldbg.getChildByName("lblGold");
            this.prop_diamond = prop_diamondbg.getChildByName("lblDialond");
            this.prop_btnMoney_1 = prop_goldbg.getChildByName("btnMoney_1");
            this.prop_btnMoney_2 = prop_diamondbg.getChildByName("btnMoney_2");
            this.rolePos = this.PropBuyWindow.getChildByName("rolePos");
            this.skinbg = this.propbg.getChildByName("skinbg");
            this.lockbg = this.propbg.getChildByName("lockbg");
            this.skinbg.visible = false;
            this.lockbg.visible = false;
            this.PropBuyWindow.visible = false;
            this.btnNotice = this.owner.getChildByName("btnNotice");
            this.UpdateTipTabel();
            if (UserComData.isGuide || UserComData.outskirtsGuide) {
                this.showGuide();
            }
            if (UserComData.isGuide) {
                let _pos = new Laya.Vector2(this.btnRunner.width, this.btnRunner.height);
                this.InstanceguideByPos(this.btnRunner, _pos);
                Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("showGuide", "start");
                }));
            }
            else {
                console.log("版本：", zs.laya.game.AppMain.appConfig.version);
                if (!UserComData.SignInfo.isSign) {
                    if (UserComData.isFristLogin || (UserComData.winCount < UserComData.needWinCount && UserComData.lostCount < UserComData.needLostCount)) {
                        this.openSignWindow();
                    }
                }
                if (UserComData.outskirtsGuide && UserComData.outGuideId == 0) {
                    let _pos = new Laya.Vector2(this.btnGift.width, this.btnGift.height);
                    this.InstanceguideByPos(this.btnGift, _pos, 1);
                    Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("showGuide", "box");
                    }));
                }
            }
            this.requireStart = this.owner.getChildByName("requireStart");
            this.requireStart.visible = false;
            let bg = this.requireStart.getChildByName("bg");
            this.btnNo = bg.getChildByName("btnNo");
            this.btnYes = bg.getChildByName("btnYes");
            Laya.SoundManager.stopAll();
            SoundMgr.inst.playMusic("bgm_01");
            this.UpdatePlayerMoneny();
            if (UserComData.isFristLogin) {
                UserComData.isFristLogin = false;
                UserComData.AiRun = Number(zs.laya.game.AppMain.gameSetting.AiRun);
                UserComData.BossFollowSpeicalRoad = Number(zs.laya.game.AppMain.gameSetting.BossFollowSpeicalRoad);
                UserComData.bossDiamondStart = Number(zs.laya.game.AppMain.gameSetting.bossDiamondStart);
                UserComData.GameBoxDiamond = Number(zs.laya.game.AppMain.gameSetting.GameBoxDiamond);
                UserComData.DestroyItemTime = Number(zs.laya.game.AppMain.gameSetting.DestroyItemTime);
                UserComData.RefreshItemGold = Number(zs.laya.game.AppMain.gameSetting.RefreshItemGold);
                UserComData.PropDiamond = Number(zs.laya.game.AppMain.gameSetting.PropDiamond);
                UserComData.fuGetDiamond = Number(zs.laya.game.AppMain.gameSetting.fuGetDiamond);
                let _bossskill = zs.laya.game.AppMain.gameSetting.bossSkillTime;
                for (let i = 0; i < _bossskill.length; i++) {
                    UserComData.bossSkillTime[i] = _bossskill[i];
                }
                if (zs.laya.game.AppMain.gameSetting.ChatData) {
                    UserComData.ChatData["start"] = zs.laya.game.AppMain.gameSetting.ChatData["start"];
                    UserComData.ChatData["game"] = zs.laya.game.AppMain.gameSetting.ChatData["game"];
                }
                if (zs.laya.game.AppMain.gameSetting.reslutRankScore) {
                    UserComData.reslutRankScore["role"] = zs.laya.game.AppMain.gameSetting.reslutRankScore["role"];
                    UserComData.reslutRankScore["boss"] = zs.laya.game.AppMain.gameSetting.reslutRankScore["boss"];
                }
                if (zs.laya.game.AppMain.gameSetting.rankData) {
                    UserComData.rankData = zs.laya.game.AppMain.gameSetting.rankData;
                }
                if (zs.laya.game.AppMain.gameSetting.ShareLuckyData) {
                    UserComData.ShareLuckyData.gift = zs.laya.game.AppMain.gameSetting.ShareLuckyData;
                }
                if (zs.laya.game.AppMain.gameSetting.GiftCodeData) {
                    for (var key in zs.laya.game.AppMain.gameSetting.GiftCodeData) {
                        UserComData.GiftCodeData[key] = zs.laya.game.AppMain.gameSetting.GiftCodeData[key];
                    }
                    for (var key in UserComData.GiftCodeData) {
                        let _have = false;
                        for (var key_1 in zs.laya.game.AppMain.gameSetting.GiftCodeData) {
                            if (key == key_1) {
                                _have = true;
                            }
                        }
                        if (!_have) {
                            delete UserComData.GiftCodeData[key];
                        }
                    }
                    console.log("礼包码：", UserComData.GiftCodeData);
                }
                UserComData.curPlayTimeList = zs.laya.game.AppMain.gameSetting.curPlayTime;
                let _boxGoldBuyList = zs.laya.game.AppMain.gameSetting.BoxGoldBuyList;
                for (let i = 0; i < _boxGoldBuyList.length; i++) {
                    UserComData.BoxGoldBuyList[i] = Number(_boxGoldBuyList[i]);
                }
                if (UserComData.isNewDay) {
                    UserComData.Boxinfo.daily = UserComData.BoxGoldBuyList[0];
                    UserComData.Boxinfo.normal = UserComData.BoxGoldBuyList[1];
                    UserComData.Boxinfo.rare = UserComData.BoxGoldBuyList[2];
                    console.log("进入----");
                }
                let _daily = zs.laya.game.AppMain.gameSetting.DailyBoxData;
                for (let i = 0; i < _daily.length; i++) {
                    UserComData.BoxData["0"].gift[i].probability = _daily[i].probability;
                    UserComData.BoxData["0"].gift[i].type = _daily[i].type;
                    UserComData.BoxData["0"].gift[i].count = _daily[i].count;
                }
                let _normal = zs.laya.game.AppMain.gameSetting.NormalBoxData;
                for (let i = 0; i < _daily.length; i++) {
                    UserComData.BoxData["1"].gift[i].probability = _normal[i].probability;
                    UserComData.BoxData["1"].gift[i].type = _normal[i].type;
                    UserComData.BoxData["1"].gift[i].count = _normal[i].count;
                }
                let _rare = zs.laya.game.AppMain.gameSetting.RareBoxData;
                for (let i = 0; i < _daily.length; i++) {
                    UserComData.BoxData["2"].gift[i].probability = _rare[i].probability;
                    UserComData.BoxData["2"].gift[i].type = _rare[i].type;
                    UserComData.BoxData["2"].gift[i].count = _rare[i].count;
                }
                let _roleData = zs.laya.game.AppMain.gameSetting.ShopRoleData;
                for (let i = 0; i < 6; i++) {
                    let _data = _roleData[i];
                    for (let j = 1; j <= UserComData.ShopRoleData[i].maxLevel; j++) {
                        UserComData.ShopRoleData[i].level[j].attack = _data[j].attack;
                        UserComData.ShopRoleData[i].level[j].blood = _data[j].blood;
                        UserComData.ShopRoleData[i].level[j].speed = _data[j].speed;
                        UserComData.ShopRoleData[i].level[j].fragment = _data[j].fragment;
                        UserComData.ShopRoleData[i].level[j].needcount = _data[j].needcount;
                        UserComData.ShopRoleData[i].level[j].needtype = _data[j].needtype;
                    }
                }
                let _bossData = zs.laya.game.AppMain.gameSetting.ShopBossData;
                for (let i = 0; i < 1; i++) {
                    let _data = _bossData[i];
                    for (let j = 1; j <= UserComData.ShopBossData[i].maxLevel; j++) {
                        UserComData.ShopBossData[i].level[j].attack = _data[j].attack;
                        UserComData.ShopBossData[i].level[j].blood = _data[j].blood;
                        UserComData.ShopBossData[i].level[j].speed = _data[j].speed;
                        UserComData.ShopBossData[i].level[j].fragment = _data[j].fragment;
                        UserComData.ShopBossData[i].level[j].needcount = _data[j].needcount;
                        UserComData.ShopBossData[i].level[j].needtype = _data[j].needtype;
                    }
                }
                let _resultData = zs.laya.game.AppMain.gameSetting.GameResultData;
                let _resultRole = _resultData['role'];
                for (let i = 1; i <= _resultRole.length; i++) {
                    UserComData.RoleResultData[i].gold = _resultRole[i - 1].gold;
                    UserComData.RoleResultData[i].diamond = _resultRole[i - 1].diamond;
                    UserComData.RoleResultData[i].fragment = _resultRole[i - 1].fragment;
                }
                let _resultBoss = _resultData['boss'];
                for (let i = 0; i < _resultBoss.length; i++) {
                    UserComData.BossResultData[i].gold = _resultBoss[i].gold;
                    UserComData.BossResultData[i].diamond = _resultBoss[i].diamond;
                    UserComData.BossResultData[i].fragment = _resultBoss[i].fragment;
                }
                let _roleSkillInfo = zs.laya.game.AppMain.gameSetting.roleSkillInfo;
                let _ac = _roleSkillInfo["accelerate"].split(",");
                for (let i = 0; i < _ac.length; i++) {
                    UserComData.roleSkillInfo.accelerate[i] = Number(_ac[i]);
                }
                let _stealth = _roleSkillInfo["stealth"].split(",");
                for (let i = 0; i < _stealth.length; i++) {
                    UserComData.roleSkillInfo.stealth[i] = Number(_stealth[i]);
                }
                UserComData.roleSkillInfo.recover[0] = Number(_roleSkillInfo["recover"]);
                let _bossSkillInfo = zs.laya.game.AppMain.gameSetting.bossSkillInfo;
                _ac = _bossSkillInfo["accelerate"].split(",");
                for (let i = 0; i < _ac.length; i++) {
                    UserComData.bossSkillInfo.accelerate[i] = Number(_ac[i]);
                }
                let _im = _bossSkillInfo["imprisonment"].split(",");
                for (let i = 0; i < _im.length; i++) {
                    UserComData.bossSkillInfo.imprisonment[i] = Number(_im[i]);
                }
                UserComData.bossSkillInfo.hint[0] = Number(_bossSkillInfo["hint"]);
                let _taskData = zs.laya.game.AppMain.gameSetting.taskData;
                for (let i = 0; i < _taskData.length; i++) {
                    UserComData.taskData[i].mode = _taskData[i].mode;
                    UserComData.taskData[i].desc = _taskData[i].desc;
                    UserComData.taskData[i].num = _taskData[i].num;
                    UserComData.taskData[i].type = _taskData[i].type;
                    UserComData.taskData[i].count = _taskData[i].count;
                    UserComData.taskData[i].integral = _taskData[i].integral;
                }
                let _taskBoxData = zs.laya.game.AppMain.gameSetting.taskBoxData;
                for (let i = 0; i < _taskBoxData.length; i++) {
                    UserComData.taskBoxData[i].type = _taskBoxData[i].type;
                    UserComData.taskBoxData[i].count = _taskBoxData[i].count;
                    UserComData.taskBoxData[i].fragmentCount = _taskBoxData[i].fragmentCount;
                }
            }
            else {
                if (!UserComData.isGuide) {
                    if (UserComData.winCount > 0 && UserComData.winCount >= UserComData.needWinCount) {
                        UserComData.winCount = 0;
                        UserComData.winFreeLottery = 1;
                        Laya.LocalStorage.setItem("winCount", UserComData.winCount.toString());
                        Laya.LocalStorage.setItem("winFreeLottery", UserComData.winFreeLottery.toString());
                        this.Lottery();
                    }
                    else if (UserComData.lostCount > 0 && UserComData.lostCount >= UserComData.needLostCount) {
                        UserComData.lostCount = 0;
                        Laya.LocalStorage.setItem("lostCount", UserComData.lostCount.toString());
                        this.Gift();
                    }
                }
            }
            UserComData.activityInfo.fuState = 0;
            this.UpdateStrengthState();
            this.pur_img.skin = (UserComData.bossDiamondStart && UserComData.activityInfo.PursuerFreeCount != 0) ? "game/font_06.png" : "game/font_92.png";
            this.btnRunner.on(Laya.Event.CLICK, this, this.RunnerMode);
            this.btnPursuer.on(Laya.Event.CLICK, this, this.PursuerMode);
            this.btnVideoRunner.on(Laya.Event.CLICK, this, this.VideoRunnerFuMode);
            this.btnLottery.on(Laya.Event.CLICK, this, this.Lottery);
            this.btnGift.on(Laya.Event.CLICK, this, this.Gift);
            this.btnRole.on(Laya.Event.CLICK, this, this.Role);
            this.btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.prop_btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnMoney_3.on(Laya.Event.CLICK, this, this.StrengthClick);
            this.prop_btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnNo.on(Laya.Event.CLICK, this, this.CloserequireWindow);
            this.btnYes.on(Laya.Event.CLICK, this, this.StartGame);
            this.btnStart.on(Laya.Event.CLICK, this, this.StartGame);
            this.btnVideo.on(Laya.Event.CLICK, this, this.VideoClick);
            this.btnSign.on(Laya.Event.CLICK, this, this.openSignWindow);
            this.btnNotice.on(Laya.Event.CLICK, this, this.openNoticeWindow);
            this.btnTask.on(Laya.Event.CLICK, this, this.openTaskWindow);
            this.rankImg.on(Laya.Event.CLICK, this, this.openRankWindow);
            this.btnActivity.on(Laya.Event.CLICK, this, this.openActivityWindow);
            this.btnMoreGame.on(Laya.Event.CLICK, this, this.showMoreGame);
            this.Info_btnClose.on(Laya.Event.CLICK, this, this.closeInfoWindow);
            this.selectImage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            Laya.stage.on("closePage", this, this.UpdatePlayerMoneny);
            Laya.stage.on("updateStrength", this, this.UpdateStrengthState);
            Laya.stage.on("CheckSign", this, this.CheckSign);
            Laya.stage.on("goRole", this, this.Role);
            EventMgr.inst.onEvent("openSign", this, this.openSignWindow);
            EventMgr.inst.onEvent("openBox", this, this.Gift);
            EventMgr.inst.onEvent("openLottoy", this, this.Lottery);
            EventMgr.inst.onEvent("openFragment", this, this.Fragment);
            EventMgr.inst.onEvent("TrySkinStartGame", this, this.RunnerMode);
        }
        onDisable() {
            super.onDisable();
            this.btnPursuer.off(Laya.Event.CLICK, this, this.PursuerMode);
            this.btnRunner.off(Laya.Event.CLICK, this, this.RunnerMode);
            this.btnVideoRunner.off(Laya.Event.CLICK, this, this.VideoRunnerFuMode);
            this.btnLottery.off(Laya.Event.CLICK, this, this.Lottery);
            this.btnGift.off(Laya.Event.CLICK, this, this.Gift);
            this.btnRole.off(Laya.Event.CLICK, this, this.Role);
            this.btnMoney_1.off(Laya.Event.CLICK, this, this.GoldClick);
            this.prop_btnMoney_1.off(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.off(Laya.Event.CLICK, this, this.DiamondClick);
            this.prop_btnMoney_2.off(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnMoney_3.off(Laya.Event.CLICK, this, this.StrengthClick);
            this.btnNo.off(Laya.Event.CLICK, this, this.CloserequireWindow);
            this.btnYes.off(Laya.Event.CLICK, this, this.StartGame);
            this.btnStart.off(Laya.Event.CLICK, this, this.StartGame);
            this.btnVideo.off(Laya.Event.CLICK, this, this.VideoClick);
            this.btnSign.off(Laya.Event.CLICK, this, this.openSignWindow);
            this.btnNotice.off(Laya.Event.CLICK, this, this.openNoticeWindow);
            this.btnTask.off(Laya.Event.CLICK, this, this.openTaskWindow);
            this.rankImg.off(Laya.Event.CLICK, this, this.openRankWindow);
            this.btnActivity.off(Laya.Event.CLICK, this, this.openActivityWindow);
            this.Info_btnClose.off(Laya.Event.CLICK, this, this.closeInfoWindow);
            this.selectImage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            Laya.stage.off("closePage", this, this.UpdatePlayerMoneny);
            Laya.stage.off("updateStrength", this, this.UpdateStrengthState);
            Laya.stage.off("CheckSign", this, this.CheckSign);
            Laya.stage.off("goRole", this, this.Role);
            EventMgr.inst.onOffEvent("openSign", this, this.openSignWindow);
            EventMgr.inst.onOffEvent("openBox", this, this.Gift);
            EventMgr.inst.onOffEvent("openLottoy", this, this.Lottery);
            EventMgr.inst.onOffEvent("openFragment", this, this.Fragment);
            EventMgr.inst.onOffEvent("TrySkinStartGame", this, this.RunnerMode);
        }
        CheckSign() {
            if (!UserComData.SignInfo.isSign) {
                if (UserComData.isFristLogin || (UserComData.winCount < UserComData.needWinCount && UserComData.lostCount < UserComData.needLostCount)) {
                    this.openSignWindow();
                }
            }
        }
        UpdateStrengthState() {
            UserComData.activityInfo.strength = (UserComData.activityInfo.strength == undefined || UserComData.activityInfo.strength == null) ? UserComData.maxStrength : UserComData.activityInfo.strength;
            this.strengthDownTime.visible = false;
            if (UserComData.activityInfo.strength < UserComData.maxStrength) {
                let _needTime = (UserComData.maxStrength - UserComData.activityInfo.strength) * UserComData.strengthRecoveryTime * 60 * 1000;
                let _time = Laya.timer.currTimer - UserComData.activityInfo.lastUseStrengthTime;
                if (_time >= _needTime) {
                    UserComData.activityInfo.strength = UserComData.maxStrength;
                    this.strengthDownTime.visible = false;
                }
                else {
                    this.strengthTime = ((_needTime - _time) / 1000) % (UserComData.strengthRecoveryTime * 60);
                    this.strengthDownTime.text = Utils.formatTimer(this.strengthTime);
                    Laya.timer.loop(1000, this, this.CsStrength);
                    this.strengthDownTime.visible = true;
                }
            }
            else {
                Laya.timer.clear(this, this.CsStrength);
                this.strengthDownTime.visible = false;
            }
            this.lblStrength.text = UserComData.activityInfo.strength + "";
            RequestMgr.UpdatePlayerAny({
                "activityInfo": UserComData.activityInfo
            });
        }
        CsStrength() {
            this.strengthTime--;
            this.strengthDownTime.text = Utils.formatTimer(this.strengthTime);
            if (this.strengthTime < 0) {
                UserComData.activityInfo.strength++;
                UserComData.activityInfo.lastUseStrengthTime = Laya.timer.currTimer;
                this.UpdateStrengthState();
                Laya.timer.clear(this, this.CsStrength);
                return;
            }
        }
        StrengthClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 4, count: 5 });
            }));
        }
        UpdateTipTabel() {
            for (let i = 0; i < UserComData.HomeTipsName.length; i++) {
                const element = UserComData.HomeTipsName[i];
                let _button = this[element];
                _button.getChildByName("tips").visible = UserComData.HomeTipsList[element] == 0;
            }
            Laya.LocalStorage.setItem("HomeTipsList", JSON.stringify(UserComData.HomeTipsList));
        }
        UpdateUserInfo() {
            if (SceneLogic.inst.gameState == GameState.playing)
                return;
            this.info_avatarUrl.skin = UserComData.avatarUrl;
            console.log("头像地址：", UserComData.avatarUrl);
            this.info_name.text = UserComData.nickName;
            let _name = UserComData.rankData[UserComData.rankInfo.rankId].rank;
            let list = _name.split("_");
            this.rankImg.skin = "game/icon_" + list[0] + ".png";
            this.rank_title.skin = "game/title_" + list[0] + ".png";
        }
        InitPropWindow() {
            for (let i = 0; i < 3; i++) {
                let item = this.itembg.getChildByName("item" + i);
                let img = item.getChildByName("img");
                let bg = item.getChildByName("bg");
                let count = bg.getChildByName("count");
                let state = item.getChildByName("state");
                state.visible = false;
                bg.visible = true;
                if (UserComData.gameModel == GameModel.Runner) {
                    img.skin = "game/skill_" + UserComData.PropList[i] * 3 + ".png";
                }
                else {
                    img.skin = "game/skill_" + UserComData.PropList[i] * 2 + ".png";
                }
                count.text = UserComData.PropDiamond + "";
                bg.on(Laya.Event.CLICK, this, () => {
                    if (i == 1) {
                        zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                            state.visible = true;
                            bg.visible = false;
                            UserComData.PropState[UserComData.PropList[i]] = 1;
                            UserComData.taskInfo.taskGetList[4]++;
                            if (UserComData.taskInfo.taskGetList[4] == UserComData.taskData[4].num) {
                                UserComData.taskInfo.taskStateList[4] = 1;
                            }
                            RequestMgr.UpdatePlayerAny({
                                "taskInfo": UserComData.taskInfo
                            });
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功获取技能打点", "视频成功获取技能打点"));
                        }), Laya.Handler.create(this, function () {
                            zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                        }), Laya.Handler.create(this, function () {
                        }));
                    }
                    else {
                        if (UserComData.userDiamond < UserComData.PropDiamond) {
                            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                                Laya.stage.event("getInfo", { type: 2, count: 50 });
                            }));
                        }
                        else {
                            UserComData.userDiamond -= UserComData.PropDiamond;
                            UserComData.taskInfo.taskGetList[4]++;
                            if (UserComData.taskInfo.taskGetList[4] == UserComData.taskData[4].num) {
                                UserComData.taskInfo.taskStateList[4] = 1;
                            }
                            RequestMgr.UpdatePlayerAny({
                                "userDiamond": UserComData.userDiamond.toString(),
                                "taskInfo": UserComData.taskInfo
                            });
                            this.UpdatePlayerMoneny();
                            state.visible = true;
                            bg.visible = false;
                            UserComData.PropState[UserComData.PropList[i]] = 1;
                        }
                    }
                });
            }
            this.InitRole();
            this.prop_gold.text = UserComData.userGold + "";
            this.prop_diamond.text = UserComData.userDiamond + "";
            this.PropBuyWindow.visible = true;
            zs.laya.sdk.SdkService.checkCustomAd(30, null, 140, null, 2, "v", 4, 1, null, null);
            zs.laya.sdk.SdkService.checkCustomAd(null, 30, 140, null, 3, "v", 4, 1, null, null);
        }
        InitRole() {
            let _id = 0;
            let _name = "";
            let type = 1;
            if (UserComData.gameModel == GameModel.Runner) {
                if (UserComData.activityInfo.fuState == 1) {
                    this.Start_count.text = "-3";
                }
                else {
                    this.Start_count.text = "-1";
                }
                _id = UserComData.PlayerSKinInfo.userRoleSkinId;
                if (UserComData.RoletrySkinId != -1) {
                    _id = UserComData.RoletrySkinId;
                }
                _name = UserComData.ShopRoleData[_id].prefabName;
                this.skinbg.visible = true;
                this.lockbg.visible = false;
                let _list = [];
                let _curLen = UserComData.PlayerSKinInfo.unlockRoleList.length;
                let _maxLen = UserComData.AllRoleSKinList.length;
                let _newList = [];
                for (let i = 0; i < _maxLen; i++) {
                    let _have = true;
                    let _all = UserComData.AllRoleSKinList[i];
                    for (let j = 0; j < _curLen; j++) {
                        let _unlock = UserComData.PlayerSKinInfo.unlockRoleList[j];
                        if (_unlock == _all) {
                            _have = false;
                            break;
                        }
                    }
                    if (_have) {
                        _list.push(_all);
                    }
                }
                for (let i = 0; i < _list.length; i++) {
                    if (_list[i] != _id) {
                        _newList.push(_list[i]);
                    }
                }
                let endList = [];
                if (_newList.length >= 2) {
                    endList = Utils.randomSipArray(_newList, 2);
                }
                else if (_newList.length == 1) {
                    endList.push(_newList[0]);
                    for (let i = _maxLen - 1; i >= 0; i--) {
                        if (UserComData.AllRoleSKinList[i] != _id && UserComData.AllRoleSKinList[i] != endList[0]) {
                            endList.push(UserComData.AllRoleSKinList[i]);
                            break;
                        }
                    }
                }
                else {
                    let _value = 0;
                    for (let i = _maxLen - 1; i >= 0; i--) {
                        if (UserComData.AllRoleSKinList[i] != _id && UserComData.AllRoleSKinList[i] != endList[0]) {
                            endList.push(UserComData.AllRoleSKinList[i]);
                            _value++;
                            if (_value > 1) {
                                break;
                            }
                        }
                    }
                }
                for (let i = 0; i < 2; i++) {
                    let item = this.skinbg.getChildByName("skin" + i);
                    let img = item.getChildByName("img");
                    let state = item.getChildByName("state");
                    let bg = item.getChildByName("bg");
                    img.skin = UserComData.ShopRoleData[endList[i]].unLockImg;
                    let _name = UserComData.ShopRoleData[endList[i]].prefabName;
                    state.visible = false;
                    bg.visible = true;
                    bg.on(Laya.Event.CLICK, this, () => {
                        zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                            UserComData.RoletrySkinId = endList[i];
                            SceneLogic.inst.closeRole();
                            SceneLogic.inst.showSignRole(this.rolePos, _name, 2.6, 2);
                            state.visible = true;
                            bg.visible = false;
                        }), Laya.Handler.create(this, function () {
                            zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                        }), Laya.Handler.create(this, function () {
                        }));
                    });
                }
            }
            else {
                this.Start_count.text = "-2";
                type = 2;
                _id = UserComData.PlayerSKinInfo.userBossSKinId;
                _name = UserComData.ShopBossData[_id].prefabName;
                this.skinbg.visible = false;
                this.lockbg.visible = true;
            }
            SceneLogic.inst.closeRole();
            SceneLogic.inst.showSignRole(this.rolePos, _name, 2.6, 2);
        }
        CloserequireWindow() {
            SoundMgr.inst.playSound("click");
            this.requireStart.visible = false;
        }
        StartGame() {
            SceneLogic.inst.closeRole();
            zs.laya.sdk.SdkService.hideCustomAd();
            this.PropBuyWindow.visible = false;
            if (this._selectType == 1) {
                if (zs.laya.game.AppMain.playerInfo.level_id < UserComData.curPlayTimeList.length) {
                    UserComData.curPlayTime = UserComData.curPlayTimeList[zs.laya.game.AppMain.playerInfo.level_id];
                }
                if (UserComData.activityInfo.fuState == 1) {
                    UserComData.curPlayTime += 90;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入封印模式", "进入封印模式"));
                }
                else {
                    if (!UserComData.isGuide) {
                        UserComData.curPlayTime += 30;
                    }
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("startRunner", "进入喵喵模式"));
                }
                SoundMgr.inst.playSound("click");
                this.JumpGamePlay();
            }
            else if (this._selectType == 2) {
                UserComData.curPlayTime = 90;
                SoundMgr.inst.playSound("click");
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("startPursuer", "进入妖怪模式"));
                this.JumpGamePlay();
            }
        }
        UpdatePlayerMoneny() {
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 4) {
                let _pos = new Laya.Vector2(this.btnRole.width, this.btnRole.height);
                this.InstanceguideByPos(this.btnRole, _pos, 1);
                Laya.stage.event("hideGuide");
                Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("showGuide", "role");
                }));
            }
            this.lblGold.text = UserComData.userGold + "";
            this.lblDialond.text = UserComData.userDiamond + "";
            this.prop_gold.text = UserComData.userGold + "";
            this.prop_diamond.text = UserComData.userDiamond + "";
            let _name = UserComData.rankData[UserComData.rankInfo.rankId].rank;
            let list = _name.split("_");
            this.rankImg.skin = "game/icon_" + list[0] + ".png";
            this.rank_title.skin = "game/title_" + list[0] + ".png";
        }
        GoldClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 1, count: 500 });
            }));
        }
        DiamondClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 2, count: 50 });
            }));
        }
        MoneyClick() {
            this.InfoWindow.visible = true;
        }
        closeInfoWindow() {
            this.InfoWindow.visible = false;
        }
        VideoClick() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                UserComData.userGold += 500;
                UserComData.userDiamond += 50;
                RequestMgr.UpdatePlayerAny({
                    "userDiamond": UserComData.userDiamond.toString(),
                    "userGold": UserComData.userGold.toString(),
                });
                this.UpdatePlayerMoneny();
                Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getMoney", { gold: 500, diamond: 50 });
                    this.closeInfoWindow();
                }));
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        VideoRunnerFuMode() {
            if (UserComData.isGuide) {
                UserComData.activityInfo.fuState = 1;
                this.RunnerMode();
            }
            else {
                if (UserComData.activityInfo.strength <= 2) {
                    zs.laya.game.UIService.showToast("体力小于3，无法进入");
                    this.StrengthClick();
                    return;
                }
                UserComData.activityInfo.fuState = 1;
                this.RunnerMode();
            }
        }
        RunnerMode() {
            Laya.stage.event("hideGuide");
            if (!UserComData.isFinishLoad) {
                this.LoadingWindow.visible = true;
                this.LoopCheckLoad(1);
                return;
            }
            UserComData.gameModel = GameModel.Runner;
            this._selectType = 1;
            if (this.GuideContainer)
                this.GuideContainer.visible = false;
            if (UserComData.isGuide) {
                this.StartGame();
            }
            else {
                if (UserComData.activityInfo.fuState == 1) {
                    UserComData.activityInfo.strength -= 3;
                    UserComData.activityInfo.lastUseStrengthTime = Laya.timer.currTimer;
                    RequestMgr.UpdatePlayerAny({
                        "activityInfo": UserComData.activityInfo
                    });
                    this.InitPropWindow();
                }
                else {
                    if (UserComData.activityInfo.strength <= 0) {
                        zs.laya.game.UIService.showToast("体力不足，无法进入");
                        this.StrengthClick();
                    }
                    else {
                        UserComData.activityInfo.strength--;
                        UserComData.activityInfo.lastUseStrengthTime = Laya.timer.currTimer;
                        RequestMgr.UpdatePlayerAny({
                            "activityInfo": UserComData.activityInfo
                        });
                        this.InitPropWindow();
                    }
                }
            }
        }
        PursuerMode() {
            if (UserComData.activityInfo.PursuerFreeCount != 0 && UserComData.bossDiamondStart && UserComData.userDiamond < 50) {
                this.DiamondClick();
            }
            else {
                if (UserComData.activityInfo.strength <= 1) {
                    zs.laya.game.UIService.showToast("体力小于2，无法进入");
                    this.StrengthClick();
                }
                else {
                    if (!UserComData.isFinishLoad) {
                        this.LoadingWindow.visible = true;
                        this.LoopCheckLoad(2);
                        return;
                    }
                    if (UserComData.bossDiamondStart && UserComData.activityInfo.PursuerFreeCount != 0) {
                        UserComData.userDiamond -= 50;
                        this.UpdatePlayerMoneny();
                    }
                    UserComData.activityInfo.PursuerFreeCount++;
                    UserComData.activityInfo.strength -= 2;
                    UserComData.activityInfo.lastUseStrengthTime = Laya.timer.currTimer;
                    this.pur_img.skin = (UserComData.bossDiamondStart && UserComData.activityInfo.PursuerFreeCount != 0) ? "game/font_06.png" : "game/font_92.png";
                    RequestMgr.UpdatePlayerAny({
                        "userDiamond": UserComData.userDiamond.toString(),
                        "activityInfo": UserComData.activityInfo
                    });
                    UserComData.gameModel = GameModel.Pursuer;
                    this._selectType = 2;
                    this.InitPropWindow();
                }
            }
        }
        JumpGamePlay() {
            console.log("showGameLoading=====");
            zs.laya.game.UIService.showGameLoading();
            this.requireStart.visible = false;
            var appMain = zs.laya.game.AppMain;
            Laya.SoundManager.playSound(appMain.appConfig.soundClick);
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.gameStartEvt(appMain.playerInfo.user_id));
            Laya.stage.event(zs.laya.game.EventId.GAME_PREPARE);
            SceneLogic.inst.Camera_Main.active = false;
        }
        LoopCheckLoad(index) {
            let self = this;
            Laya.timer.loop(300, self, function CsLoad() {
                if (UserComData.isFinishLoad) {
                    Laya.timer.clear(self, CsLoad);
                    self.LoadingWindow.visible = false;
                    if (index == 1) {
                        self.RunnerMode();
                    }
                    else if (index == 2) {
                        self.PursuerMode();
                    }
                    else if (index == 3) {
                        self.Role();
                    }
                    else if (index == 4) {
                        self.Gift();
                    }
                    else if (index == 5) {
                        self.Fragment();
                    }
                    return;
                }
            });
        }
        ChangeTipState(name) {
            if (UserComData.HomeTipsList[name] == 0) {
                UserComData.HomeTipsList[name] = 1;
                this.UpdateTipTabel();
            }
        }
        openNoticeWindow(event) {
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnNotice");
            Laya.Scene.open("view/game/NoticePage.scene", false);
            event && this.openLuckyBoxPage();
        }
        openSignWindow(event) {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入签到界面", "进入签到界面"));
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnSign");
            Laya.Scene.open("view/game/SignPage.scene", false);
            event && this.openLuckyBoxPage();
        }
        openTaskWindow(event) {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入每日任务界面", "进入每日任务界面"));
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnTask");
            Laya.Scene.open("view/game/TaskPage.scene", false);
            event && this.openLuckyBoxPage();
        }
        openRankWindow(event) {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入个人段位界面", "进入个人段位界面"));
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("rankImg");
            Laya.Scene.open("view/game/RankPage.scene", false);
            event && this.openLuckyBoxPage();
        }
        openActivityWindow(event) {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入活动界面", "进入活动界面"));
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnActivity");
            Laya.Scene.open("view/game/ActivityPage.scene", false);
            event && this.openLuckyBoxPage();
        }
        showMoreGame() {
            console.log("主界面点击更多游戏");
            zs.laya.sdk.SdkService.showGamePortalAd(null);
        }
        Gift(event) {
            if (!UserComData.isFinishLoad) {
                this.LoadingWindow.visible = true;
                this.LoopCheckLoad(4);
                return;
            }
            Laya.stage.event("hideGuide");
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnGift");
            UserComData.RolePageTagType = 4;
            Laya.Scene.open("view/game/RolePage.scene", false);
            event && this.openLuckyBoxPage();
        }
        Fragment(event) {
            if (!UserComData.isFinishLoad) {
                this.LoadingWindow.visible = true;
                this.LoopCheckLoad(5);
                return;
            }
            Laya.stage.event("hideGuide");
            UserComData.RolePageTagType = 3;
            Laya.Scene.open("view/game/RolePage.scene", false);
            event && this.openLuckyBoxPage();
        }
        Role(event) {
            if (!UserComData.isFinishLoad) {
                this.LoadingWindow.visible = true;
                this.LoopCheckLoad(3);
                return;
            }
            Laya.stage.event("hideGuide");
            if (this.GuideContainer)
                this.GuideContainer.visible = false;
            this.ChangeTipState("btnRole");
            UserComData.RolePageTagType = 1;
            Laya.Scene.open("view/game/RolePage.scene", false);
            event && this.openLuckyBoxPage();
        }
        Lottery(event) {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入抽奖界面", "进入抽奖界面"));
            SoundMgr.inst.playSound("click");
            this.ChangeTipState("btnLottery");
            Laya.Scene.open("view/game/LotteryPage.scene", false);
            event && this.openLuckyBoxPage();
        }
        onMouseDown(e) {
            var touches = e.touches;
            if (touches && touches.length == 2) {
                this.preRadian = Math.atan2(touches[0].stageY - touches[1].stageY, touches[0].stageX - touches[1].stageX);
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            }
        }
        onMouseMove(e) {
            var touches = e.touches;
            if (touches && touches.length == 2) {
                var nowRadian = Math.atan2(touches[0].stageY - touches[1].stageY, touches[0].stageX - touches[1].stageX);
                this.selectImage.rotation += 180 / Math.PI * (nowRadian - this.preRadian);
                this.preRadian = nowRadian;
            }
        }
        onMouseUp(e) {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        ScaleChange() {
        }
        onEnable() {
            super.onEnable();
            console.log("主界面onenable");
            Laya.timer.once(1000, this, () => {
                zs.laya.sdk.SdkService.showInsertAd(null);
            });
        }
        onStart() {
        }
        showGuide() {
            if (!this.GuideContainer) {
                this.GuideContainer = new Laya.Sprite();
                this.GuideContainer.zOrder = 100;
                this.GuideContainer.cacheAs = "bitmap";
                this.owner.addChild(this.GuideContainer);
            }
        }
        InstanceguideByPos(img, rect, type) {
            this.GuideContainer.destroyChildren();
            let maskArea = new Laya.Sprite();
            maskArea.alpha = 0.7;
            maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            this.GuideContainer.addChild(maskArea);
            let interactionArea = new Laya.Image();
            type = type ? type : 0;
            interactionArea.blendMode = "destination-out";
            this.GuideContainer.addChild(interactionArea);
            let _pos = new Laya.Point(0, 0);
            let _rect = rect || new Laya.Vector2(100, 100);
            if (type == 1) {
                _pos = new Laya.Point(Laya.stage.width - img.right - _rect.x * 0.7 / 2, Laya.stage.height - img.bottom - _rect.y * 0.7 / 2);
                interactionArea.graphics.drawCircle(_pos.x, _pos.y, _rect.x / 2, "#000000");
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawCircle(_pos.x, _pos.y, _rect.x / 2, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
            else if (type == 0) {
                maskArea.alpha = 0;
                _pos = img.localToGlobal(new Laya.Point((img.width || 0) / 2, (img.height || 0) / 2));
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawRect(_pos.x, _pos.y - img.height / 2, img.width, img.height, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
        }
        openStore() {
        }
        showStore() {
        }
        closeStore() {
            console.log("进入---");
        }
        openLuckyBoxPage() {
        }
    }

    class InviteBox extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            this.lab_name = this.owner.getChildByName("lab_name");
            this.lab_invite = this.owner.getChildByName("lab_invite");
            this.img_bg = this.owner.getChildByName("img_bg");
            this.instance = this.owner;
        }
        onStart() {
            this.instance.visible = false;
            let s = this;
            if (!zs.laya.platform.ADConfig.zs_switch || !zs.laya.platform.ADConfig["zs_false_news_switch"]) {
                this.instance.destroy();
                return;
            }
            zs.laya.sdk.ZSReportSdk.loadAd(function (data) {
                var adData = data["promotion"];
                adData = adData.filter(function (elment) {
                    return Laya.Browser.onAndroid || (elment.appid != "wx48820730357d81a6" && elment.appid != "wxc136d75bfc63107c");
                });
                s.adData = adData[Math.floor(Math.random() * adData.length)];
                s.initUI();
            });
        }
        initUI() {
            this.instance.visible = true;
            this.lab_name.text = UserData.Instance.randowData.nickname;
            this.lab_invite.text = "邀请您一起玩   " + this.adData.app_title;
            this.img_bg.on(Laya.Event.CLICK, this, this.onBgClick);
            this.instance.y = 0 - this.instance.height;
            this.instance.centerX = 0;
            Laya.SoundManager.playSound("sound/getChat.ogg");
            zs.laya.sdk.DeviceService.VibrateShort();
            Laya.Tween.to(this.instance, { y: 40 }, 500);
        }
        onBgClick() {
            zs.laya.sdk.ZSReportSdk.navigate2Mini(this.adData, zs.laya.game.AppMain.playerInfo.user_id, function () {
                Laya.stage.event(zs.laya.game.EventId.APP_JUMP_SUCCESS);
            }, function () {
                Laya.stage.event(zs.laya.game.EventId.APP_JUMP_CANCEL);
                if (zs.laya.platform.ADConfig.zs_switch && zs.laya.platform.ADConfig.zs_reminder_switch)
                    Laya.Scene.open("view/ad/ChallengePage.scene", false);
            }, function () {
            });
            Laya.Tween.to(this.instance, { y: 0 - this.instance.height }, 500);
        }
    }

    class ActivityPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.AngleArea = [
                { "min": -25, "max": 25 },
                { "min": 35, "max": 85 },
                { "min": 95, "max": 145 },
                { "min": 155, "max": 205 },
                { "min": 215, "max": 265 },
                { "min": 275, "max": 325 },
            ];
            this.TagType = 1;
            this.RandomList = [];
            this.curSelectIndex = 0;
        }
        onAwake() {
            super.onAwake();
            this.TagType = 1;
            this.curSelectIndex = 1;
            this._ani.visible = false;
            this.UpdatePlayerMoneny();
            this.TagList.array = UserComData.activityTagData;
            this.UpdateTagRender();
            this.UpdateWindowView();
            this.setLuckyData();
            this.AddEvent();
        }
        setLuckyData() {
            this.RandomList = [];
            this.luckyBg.rotation = 0;
            this.count.text = UserComData.activityInfo.shareCount + "/5";
            for (let i = 0; i < UserComData.ShareLuckyData["gift"].length; i++) {
                let _data = UserComData.ShareLuckyData["gift"][i];
                let cell = this.luckyBg.getChildByName("item" + (i + 1));
                let count = cell.getChildByName("count");
                let K = count.getChildByName("K");
                K.visible = false;
                cell.skin = this.GetIcon(_data.type);
                if (_data.type == 3) {
                    cell.width = 100;
                    cell.height = 100;
                }
                else {
                    cell.width = 60;
                    cell.height = 60;
                }
                if (_data.count < 1000) {
                    count.text = _data.count + "";
                    count.centerX = 0;
                }
                else {
                    count.text = _data.count / 1000 + "";
                    K.visible = true;
                    count.centerX = -10;
                }
                for (let j = 0; j < _data.probability * 10; j++) {
                    this.RandomList.push({
                        type: _data.type,
                        count: _data.count,
                        Position: i
                    });
                }
            }
        }
        GetIcon(type) {
            let icon = "";
            if (type == 1) {
                icon = "game/icon_coin.png";
            }
            else if (type == 2) {
                icon = "game/icon_dimo.png";
            }
            else if (type == 3) {
                icon = "role/icon_shop_gift_02.png";
            }
            return icon;
        }
        LuckyClick() {
            if (UserComData.activityInfo.shareCount >= 5) {
                zs.laya.game.UIService.showToast(`今日分享抽奖次数已用完~`);
                return;
            }
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("点击分享抽奖", "点击分享抽奖"));
            SoundMgr.inst.playSound("click");
            this.ShareMask.visible = true;
            if (!Laya.Browser.onPC) {
                Laya.stage.once(zs.laya.sdk.DeviceService.EVENT_ON_SHOW, this, function (timeStamp) {
                    if (Date.now() - timeStamp > 3000) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("点击分享抽奖成功", "点击分享抽奖成功"));
                        UserComData.taskInfo.taskGetList[3]++;
                        if (UserComData.taskInfo.taskGetList[3] == UserComData.taskData[3].num) {
                            UserComData.taskInfo.taskStateList[3] = 1;
                        }
                        let _ran = Utils.Range(0, this.RandomList.length - 1);
                        this.StartTurn(this.RandomList[_ran]);
                    }
                    else {
                        zs.laya.game.UIService.showToast("分享失败");
                        this.ShareMask.visible = false;
                    }
                }, [Date.now()]);
                zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
            }
            else {
                UserComData.taskInfo.taskGetList[3]++;
                if (UserComData.taskInfo.taskGetList[3] == UserComData.taskData[3].num) {
                    UserComData.taskInfo.taskStateList[3] = 1;
                }
                let _ran = Utils.Range(0, this.RandomList.length - 1);
                this.StartTurn(this.RandomList[_ran]);
                zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
            }
        }
        StartTurn(_ran) {
            let angle = Utils.Range(this.AngleArea[_ran.Position].min, this.AngleArea[_ran.Position].max);
            this.luckyBg.rotation = 0;
            let totalAngle = 1440 - angle;
            let self = this;
            self.luckyBg.rotation = 0;
            self._ani.rotation = _ran.Position * 60;
            Laya.Tween.to(self.luckyBg, { rotation: totalAngle }, 3000, Laya.Ease.circOut, Laya.Handler.create(self, () => {
                self._ani.visible = true;
                Laya.timer.once(2000, self, () => {
                    self.luckyBg.rotation = totalAngle;
                    self.ShareMask.visible = false;
                    UserComData.activityInfo.shareCount++;
                    let _gold = 0;
                    let _diamond = 0;
                    let _fragmentName = "";
                    let _fragmentImg = "";
                    let _data = UserComData.BoxData[2];
                    let _fragmentCount = 0;
                    let _ranF = UserComData.PlayerSKinInfo.buyFragmentList[Utils.Range(0, UserComData.PlayerSKinInfo.buyFragmentList.length - 1)];
                    let _type = 1;
                    if (_ran.type == 1) {
                        UserComData.userGold += _ran.count;
                        _gold = _ran.count;
                    }
                    else if (_ran.type == 2) {
                        UserComData.userDiamond += _ran.count;
                        _diamond = _ran.count;
                    }
                    else {
                        let _data = UserComData.BoxData[2];
                        let _list = [];
                        for (let i = 0; i < _data.gift.length; i++) {
                            for (let j = 0; j < _data.gift[i].probability * 10; j++) {
                                _list.push(i);
                            }
                        }
                        let _ranG = _list[Utils.Range(0, _list.length - 1)];
                        if (_data.gift[_ranG].type == 1) {
                            _gold = _data.gift[_ranG].count;
                            UserComData.userGold += _gold;
                        }
                        else if (_data.gift[_ranG].type == 2) {
                            _diamond = _data.gift[_ranG].count;
                            UserComData.userDiamond += _diamond;
                        }
                        if (_ranF < 100) {
                            _type = 1;
                            _fragmentName = UserComData.ShopRoleData[_ranF].fragmentName;
                            _fragmentImg = UserComData.ShopRoleData[_ranF].fragmentImg;
                            UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_ranF] += _data.fragmentCount;
                        }
                        else {
                            _type = 2;
                            _fragmentName = UserComData.ShopBossData[_ranF % 100].fragmentName;
                            _fragmentImg = UserComData.ShopBossData[_ranF % 100].fragmentImg;
                            UserComData.PlayerSKinInfo.BossSkinFragmentCount[_ranF % 100] += _data.fragmentCount;
                        }
                        _fragmentCount = _data.fragmentCount;
                    }
                    Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond, fragment: { type: _type, id: _ranF % 100, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentCount: _fragmentCount } });
                        RequestMgr.UpdatePlayerAny({
                            "userDiamond": UserComData.userDiamond.toString(),
                            "userGold": UserComData.userGold.toString(),
                            "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                            "taskInfo": UserComData.taskInfo,
                            "activityInfo": UserComData.activityInfo
                        });
                        this.luckyBg.rotation = 0;
                        this.count.text = UserComData.activityInfo.shareCount + "/5";
                        this.UpdatePlayerMoneny();
                    }));
                    self._ani.visible = false;
                });
            }));
        }
        UpdateTagRender() {
            this.TagList.refresh();
            this.TagList.renderHandler = new Laya.Handler(this, this.TagRender);
        }
        TagRender(cell, index) {
            let _data = UserComData.activityTagData[index];
            let bg = cell.getChildByName("bg");
            let bg_head = bg.getChildByName("bg_head");
            let select = cell.getChildByName("select");
            let select_head = select.getChildByName("select_head");
            bg.visible = this.TagType != (index + 1);
            select.visible = this.TagType == (index + 1);
            select.skin = "daily/shop_tips_bg_01.png";
            bg_head.skin = _data.title;
            select_head.skin = _data.select;
            bg.on(Laya.Event.CLICK, cell, () => {
                SoundMgr.inst.playSound("transformation");
                this.TagType = _data.idx;
                bg.visible = false;
                select.visible = true;
                this.UpdateWindowView();
                this.UpdateTagRender();
            });
        }
        UpdateWindowView() {
            this.UnlockWindow.visible = false;
            this.ShareWindow.visible = false;
            this.GiftCodeWindow.visible = false;
            if (this.TagType == 1) {
                this.showUnlockWindow();
            }
            else if (this.TagType == 2) {
                this.ShareWindow.visible = true;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入分享好礼界面", "进入分享好礼界面"));
            }
            else if (this.TagType == 3) {
                this.GiftCodeWindow.visible = true;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("进入礼包界面", "进入礼包界面"));
            }
        }
        LeftClick() {
            this.curSelectIndex--;
            if (this.curSelectIndex <= 0) {
                this.curSelectIndex = 2;
            }
            this.showUnlockWindow();
        }
        RightClick() {
            this.curSelectIndex++;
            if (this.curSelectIndex > 2) {
                this.curSelectIndex = 1;
            }
            this.showUnlockWindow();
        }
        showUnlockWindow() {
            if (UserComData.activityInfo.fuState == 0) {
                this.fuState.visible = true;
                this.btnAmulet.skin = "get/btn_01.png";
            }
            else {
                this.fuState.visible = false;
                this.btnAmulet.skin = "role/icon_upluck.png";
                if (UserComData.activityInfo.propState == 0) {
                    this.propState.visible = true;
                    this.btnSkill.skin = "get/btn_01.png";
                }
                else {
                    this.propState.visible = false;
                    this.btnSkill.skin = "role/icon_upluck.png";
                }
            }
            this.item1.visible = this.curSelectIndex == 1;
            this.item2.visible = this.curSelectIndex == 2;
            this.UnlockWindow.visible = true;
        }
        UnlockFu() {
            console.log("点击符箓");
            this.close();
        }
        UnlockProp() {
            this.close();
        }
        UpdatePlayerMoneny() {
            this.lblGold.text = UserComData.userGold + "";
            this.lblDiamond.text = UserComData.userDiamond + "";
        }
        AddEvent() {
            this.btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.btnAmulet.on(Laya.Event.CLICK, this, this.UnlockFu);
            this.btnSkill.on(Laya.Event.CLICK, this, this.UnlockProp);
            this.LeftPage.on(Laya.Event.CLICK, this, this.LeftClick);
            this.RightPage.on(Laya.Event.CLICK, this, this.RightClick);
            this.btnGet.on(Laya.Event.CLICK, this, this.UseCode);
            this.btnLucky.on(Laya.Event.CLICK, this, this.LuckyClick);
            this.ShareMask.on(Laya.Event.CLICK, this, () => {
                console.log("正在抽奖");
            });
            Laya.stage.on("closePage", this, this.UpdatePlayerMoneny);
        }
        RemoveEvent() {
            this.btnMoney_1.off(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.off(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.btnAmulet.off(Laya.Event.CLICK, this, this.UnlockFu);
            this.btnSkill.off(Laya.Event.CLICK, this, this.UnlockProp);
            this.LeftPage.off(Laya.Event.CLICK, this, this.LeftClick);
            this.RightPage.off(Laya.Event.CLICK, this, this.RightClick);
            this.btnGet.off(Laya.Event.CLICK, this, this.UseCode);
            this.btnLucky.off(Laya.Event.CLICK, this, this.LuckyClick);
            this.ShareMask.off(Laya.Event.CLICK, this, () => {
                console.log("正在抽奖");
            });
            Laya.stage.off("closePage", this, this.UpdatePlayerMoneny);
        }
        UseCode() {
            let _code = this.gitsInput.text || "";
            if (_code == "") {
                zs.laya.game.UIService.showToast("序列号不可为空");
            }
            else {
                if (UserComData.GiftCodeData[_code] == undefined) {
                    zs.laya.game.UIService.showToast("无效的序列号");
                }
                else {
                    if (UserComData.activityInfo.giftCode[_code]) {
                        zs.laya.game.UIService.showToast("已使用的序列号");
                    }
                    else {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("兑换成功", "兑换成功"));
                        UserComData.activityInfo.giftCode[_code] = 1;
                        let _data = UserComData.GiftCodeData[_code];
                        let _gold = _data.gold;
                        let _diamond = _data.diamond;
                        UserComData.userDiamond += _diamond;
                        UserComData.userGold += _gold;
                        let _fragmentName = "";
                        let _fragmentImg = "";
                        let _ranF = UserComData.PlayerSKinInfo.buyFragmentList[Utils.Range(0, UserComData.PlayerSKinInfo.buyFragmentList.length - 1)];
                        let _type = 1;
                        if (_ranF < 100) {
                            _type = 1;
                            _fragmentName = UserComData.ShopRoleData[_ranF].fragmentName;
                            _fragmentImg = UserComData.ShopRoleData[_ranF].fragmentImg;
                            UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_ranF] += _data.fragmentCount;
                        }
                        else {
                            _type = 2;
                            _fragmentName = UserComData.ShopBossData[_ranF % 100].fragmentName;
                            _fragmentImg = UserComData.ShopBossData[_ranF % 100].fragmentImg;
                            UserComData.PlayerSKinInfo.BossSkinFragmentCount[_ranF % 100] += _data.fragmentCount;
                        }
                        this.UpdatePlayerMoneny();
                        Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                            Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond, fragment: { type: _type, id: _ranF % 100, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentCount: _data.fragmentCount } });
                            RequestMgr.UpdatePlayerAny({
                                "userDiamond": UserComData.userDiamond.toString(),
                                "userGold": UserComData.userGold.toString(),
                                "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                                "activityInfo": UserComData.activityInfo
                            });
                        }));
                    }
                }
            }
        }
        GoldClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 1, count: 500 });
            }));
        }
        DiamondClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 2, count: 50 });
            }));
        }
        Share() {
            Laya.stage.once(zs.laya.sdk.DeviceService.EVENT_ON_SHOW, this, function (timeStamp) {
                if (Date.now() - timeStamp > 3000) {
                    zs.laya.game.UIService.showToast("分享成功");
                }
                else {
                    zs.laya.game.UIService.showToast("分享失败");
                }
            }, [Date.now()]);
            zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
        }
        close() {
            Laya.Scene.close("view/game/ActivityPage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class DailyPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.curselectIndex = -1;
        }
        onAwake() {
            super.onAwake();
            let topUI = this.owner.getChildByName("topUI");
            let goldBg = topUI.getChildByName("goldBg");
            let fishBg = topUI.getChildByName("fishBg");
            this.lblGold = goldBg.getChildByName("lblGold");
            this.lblDialond = fishBg.getChildByName("lblDialond");
            this.UpdatePlayerMoneny();
            this.btnClose = this.owner.getChildByName("btnClose");
            this.DailyList = this.owner.getChildByName("DailyList");
            this.DailyList.array = [];
            this.DailyList.renderHandler = new Laya.Handler(this, this.DailyRender);
            this.InfoWindow = this.owner.getChildByName("InfoWindow");
            this.InfoWindow.visible = false;
            this.bg = this.InfoWindow.getChildByName("bg");
            this.Info_btnClose = this.bg.getChildByName("Info_btnClose");
            this.info_title = this.bg.getChildByName("info_title");
            this.info_icon = this.bg.getChildByName("info_icon");
            this.info_diamond = this.bg.getChildByName("info_diamond");
            this.info_gold = this.bg.getChildByName("info_gold");
            this.btnVideo = this.bg.getChildByName("btnVideo");
            this.GetWindow = this.owner.getChildByName("GetWindow");
            this.GetWindow.visible = false;
            this.get_diamond = this.GetWindow.getChildByName("get_diamond").getChildByName("desc");
            this.get_gold = this.GetWindow.getChildByName("get_gold").getChildByName("desc");
            this.btnGet = this.GetWindow.getChildByName("btnGet");
            this.refreshtDailyData();
            this.AddEvent();
        }
        refreshtDailyData() {
            let _list = [1, 1, 1, 1, 1, 1];
            this.DailyList.array = _list;
            this.DailyList.refresh();
            this.DailyList.renderHandler = new Laya.Handler(this, this.DailyRender);
        }
        UpdatePlayerMoneny() {
            this.lblGold.text = UserComData.userGold + "";
            this.lblDialond.text = UserComData.userDiamond + "";
        }
        DailyRender(cell, index) {
            let _data = UserComData.DailyData[index.toString()];
            let Bg = cell.getChildByName("bg");
            let icon = cell.getChildByName("icon");
            let mode = cell.getChildByName("mode");
            let desc = cell.getChildByName("desc");
            let count = cell.getChildByName("count");
            Bg.skin = _data.bg;
            icon.skin = _data.icon;
            desc.text = _data.title;
            count.text = "每日 （" + _data.curCount + "/" + _data.maxCount + "）";
            if (_data.getMode == 1) {
                mode.skin = "daily/font_24.png";
            }
            else if (_data.getMode == 2) {
                mode.skin = "daily/font_25.png";
            }
            cell.on(Laya.Event.CLICK, this, () => {
                if (_data.curCount <= 0)
                    return;
                SoundMgr.inst.playSound("click");
                this.curselectIndex = index;
                UserComData.RefreshGiftData(this.curselectIndex + 3);
                if (_data.getMode == 1) {
                    this.showGetWindow();
                }
                else {
                    this.showInfoWindow(_data);
                }
            });
        }
        AddEvent() {
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.Info_btnClose.on(Laya.Event.CLICK, this, this.closeInfoWindow);
            this.btnVideo.on(Laya.Event.CLICK, this, this.videoClick);
            this.btnGet.on(Laya.Event.CLICK, this, this.closeGetWindow);
        }
        RemoveEvent() {
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.Info_btnClose.off(Laya.Event.CLICK, this, this.closeInfoWindow);
            this.btnVideo.off(Laya.Event.CLICK, this, this.videoClick);
            this.btnGet.off(Laya.Event.CLICK, this, this.closeGetWindow);
        }
        videoClick() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                this.InfoWindow.visible = false;
                this.showGetWindow();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可获取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        showGetWindow() {
            this.refreshtDailyData();
            this.get_diamond.text = "x" + UserComData.GiftData.diamond;
            this.get_gold.text = "x" + UserComData.GiftData.gold;
            UserComData.DailyData[this.curselectIndex.toString()].curCount--;
            Laya.LocalStorage.setItem("DailyData", JSON.stringify(UserComData.DailyData));
            UserComData.userGold += UserComData.GiftData.gold;
            UserComData.userDiamond += UserComData.GiftData.diamond;
            Laya.LocalStorage.setItem("userGold", UserComData.userGold.toString());
            Laya.LocalStorage.setItem("userDiamond", UserComData.userDiamond.toString());
            this.GetWindow.visible = true;
        }
        closeGetWindow() {
            this.UpdatePlayerMoneny();
            this.GetWindow.visible = false;
        }
        showInfoWindow(_data) {
            this.info_title.text = _data.title;
            this.info_icon = _data.icon;
            this.info_diamond.text = "x" + UserComData.GiftData.diamond;
            this.info_gold.text = "x" + UserComData.GiftData.gold;
            this.InfoWindow.visible = true;
        }
        closeInfoWindow() {
            this.InfoWindow.visible = false;
        }
        close() {
            console.log("1111----");
            Laya.Scene.close("view/game/DailyGiftPage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class FreeTransformationPage extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
        }
        onAwake() {
            super.onAwake();
            this.btn_free_change.on(Laya.Event.CLICK, this, this.getFreeChange);
            this.btn_drop.on(Laya.Event.CLICK, this, this.closeView);
        }
        onStart() {
            super.onStart();
        }
        onEnable() {
            zs.laya.sdk.SdkService.showBanner();
        }
        onDisable() {
            super.onDisable();
            this.btn_free_change.off(Laya.Event.CLICK, this, this.getFreeChange);
            this.btn_drop.off(Laya.Event.CLICK, this, this.closeView);
            zs.laya.sdk.SdkService.hideBanner();
        }
        getFreeChange() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, () => {
                SceneLogic.inst.GetItemList();
                if (UserComData.curItem != UserComData.curItemList[0]) {
                    UserComData.curItem = UserComData.curItemList[0];
                }
                else {
                    UserComData.curItem = UserComData.curItemList[1];
                }
                EventMgr.inst.emit("goldRefreshItem");
                this.closeView();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可变身~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        closeView() {
            this.owner.close();
            UserComData.isOpenFree = false;
        }
    }

    var EventId = zs.laya.game.EventId;
    class GamePlayUI extends Laya.Script {
        constructor() {
            super();
            this.isMove = false;
            this.endAngle = 0;
            this.fu_canClick = false;
            this.isFristChange = true;
            this.InitW = 242;
            this.InitW_1 = 0;
            this.isPass = false;
            this.isSelect = false;
            this._isClick = false;
            this.isOrigin = false;
            this._vibrateTime = 0;
            this._haveBoss = false;
            this._skillTime = 0;
            this.haveTips = false;
            this._jumpCount = 0;
            this._jumpTime = 0;
            this.RemainingTime = 0;
            this.stopT = 0;
            this._T = 0;
            this.resultList = {};
            this.playerinGoodsIndex = 0;
            this.ChatData = [];
            this.isChating = false;
            this._matchPlayerIndex = -1;
            this._MatchRandomTime = 5;
            this.accelerateCoolingTime = 0;
            this.recoverCoolingTime = 0;
            this.stealthCoolingTime = 0;
            this.hintCoolingTime = 0;
            this.imprisonmentCoolingTime = 0;
            this.clickCoolingTime = 0;
        }
        onEnable() {
            super.onEnable();
        }
        onAwake() {
            if (UserComData.isGuide) {
                RequestMgr.UpdatePlayerByKey("isGuide", "1");
            }
            zs.laya.sdk.DeviceService.VibrateShort();
            UserComData.isGuideLevel = UserComData.isGuide;
            this.goldLabel.text = zs.laya.game.AppMain.playerInfo.gold.toString();
            this.RockerOut = this.owner.getChildByName("RockerOut");
            this.RockerIn = this.owner.getChildByName("RockerIn");
            this.RockerOut.visible = false;
            this.RockerIn.visible = false;
            this.InitUIPos = new Laya.Point(this.RockerOut.x + this.RockerOut.width / 2, this.RockerOut.y + this.RockerOut.height / 2);
            this.PlayList = this.owner.getChildByName("PlayList");
            this.btnJump = this.PlayList.getChildByName("btnJump");
            this.btnJump.visible = false;
            this.btnDeformation = this.PlayList.getChildByName("btnDeformation");
            this.btnDeformation.visible = false;
            this.btnAttack = this.PlayList.getChildByName("btnAttack");
            this.btnAttack.visible = false;
            this.btnLook = this.PlayList.getChildByName("btnLook");
            this.btnLook.visible = false;
            this.btnSkill = this.PlayList.getChildByName("btnSkill");
            this.btnSkill.visible = false;
            this.btnBox = this.owner.getChildByName("btnBox");
            this.btnBox.visible = false;
            this.btnRefreshItem = this.owner.getChildByName("btnRefreshItem");
            this.ref_count = this.btnRefreshItem.getChildByName("count");
            this.ref_count.text = UserComData.RefreshItemGold + "";
            this.btnRefreshItem.visible = false;
            this.btnChat = this.owner.getChildByName("btnChat");
            this.btnChat.visible = false;
            this.ChatWindow = this.owner.getChildByName("ChatWindow");
            this.chatList = this.ChatWindow.getChildByName("chatList");
            this.ChatWindow.visible = false;
            this.catList = this.owner.getChildByName("catList");
            this.catList.visible = false;
            this.btnReBorn = this.catList.getChildByName("btnReBorn");
            this.btnExit = this.catList.getChildByName("btnExit");
            this.btnAmulet = this.owner.getChildByName("btnAmulet");
            this.fu_guide = this.btnAmulet.getChildByName("img");
            this.fu_guide.visible = false;
            this.fly_fu = this.btnAmulet.getChildByName("fu");
            this.fly_fu.visible = false;
            this.fu_tips = this.btnAmulet.getChildByName("tips");
            this.fuBg = this.btnAmulet.getChildByName("fuBg");
            this.fu = this.fuBg.getChildByName("fu");
            this.fulight = this.fu.getChildByName("fulight");
            this.fu_count = this.fuBg.getChildByName("count");
            this.fu_count.text = UserComData.curFuCount + "/3";
            this.fu_progressBg = this.btnAmulet.getChildByName("progressBg");
            this.fu_progress = this.fu_progressBg.getChildByName("progress");
            this.fu_progress.width = 0;
            this.btnAmulet.visible = false;
            this.AmuletState = this.owner.getChildByName("AmuletState");
            this.as_count = this.AmuletState.getChildByName("count");
            this.as_count.text = UserComData.curFuCount + "/3";
            this.AmuletState.visible = false;
            this.PassImage = this.owner.getChildByName("PassImage");
            this.PassImage.visible = false;
            this.full = this.owner.getChildByName("full");
            this.full.visible = false;
            this.SelectWindow = this.owner.getChildByName("SelectWindow");
            this.SelectWindow.visible = false;
            this.one = this.SelectWindow.getChildByName("one");
            this.one_select = this.one.getChildByName("select");
            this.one_select.visible = false;
            this.two = this.SelectWindow.getChildByName("two");
            this.two_select = this.two.getChildByName("select");
            this.two_select.visible = false;
            this.two_video = this.two.getChildByName("video");
            this.three = this.SelectWindow.getChildByName("three");
            this.three_select = this.three.getChildByName("select");
            this.three_select.visible = false;
            this.three_video = this.three.getChildByName("video");
            this.updateSelectImg();
            this.selectTimeBg = this.SelectWindow.getChildByName("selectTimeBg");
            this.selectTime = this.selectTimeBg.getChildByName("selectTime");
            this.btnSelectAgain = this.SelectWindow.getChildByName("btnSelectAgain");
            this.selectTimeProgess = this.selectTimeBg.getChildByName("selectTimeProgess");
            this.selectTimeProgess.width = 332;
            this.LookList = this.owner.getChildByName("LookList");
            this.btnLookAI = this.LookList.getChildByName("btnLookAI");
            this.btnLookBoss = this.LookList.getChildByName("btnLookBoss");
            this.btnCloseLook = this.LookList.getChildByName("btnCloseLook");
            this.btnLookAI.visible = false;
            this.btnLookBoss.visible = false;
            this.btnCloseLook.visible = false;
            this.skillList = this.owner.getChildByName("skillList");
            this.skillList.visible = false;
            this.skill_role = this.skillList.getChildByName("skill_role");
            this.skill_boss = this.skillList.getChildByName("skill_boss");
            this.btnAccelerate = this.skillList.getChildByName("btnAccelerate");
            this.btnRecover = this.skill_role.getChildByName("btnRecover");
            this.btnStealth = this.skill_role.getChildByName("btnStealth");
            this.btnHint = this.skill_boss.getChildByName("btnHint");
            this.btnImprisonment = this.skill_boss.getChildByName("btnImprisonment");
            this.RocketAni = this.owner["RocketAni"];
            this.QuasiCenter = this.owner.getChildByName("QuasiCenter");
            this.downTimeBg = this.owner.getChildByName("downTimeBg");
            this.downTimeBg.visible = false;
            this.DownTime = this.downTimeBg.getChildByName("DownTime");
            this.img_time = this.downTimeBg.getChildByName("img_time");
            this.img_time.skin = "game/font_04.png";
            this.time_1 = this.owner.getChildByName("time_1");
            this.redTime = this.time_1.getChildByName("redTime");
            this.time_1.visible = false;
            this.ResultWindow = this.owner.getChildByName("ResultWindow");
            this.ResultWindow.visible = false;
            this.r_Title = this.ResultWindow.getChildByName("r_Title");
            this.result_1 = this.ResultWindow.getChildByName("result_1");
            this.result_2 = this.ResultWindow.getChildByName("result_2");
            this.result_3 = this.ResultWindow.getChildByName("result_3");
            this.result_3.visible = false;
            this.r_item = this.ResultWindow.getChildByName("r_item");
            this.goldcount = this.r_item.getChildByName("goldcount");
            this.diamondcount = this.r_item.getChildByName("diamondcount");
            this.fragmentcount = this.r_item.getChildByName("fragmentcount");
            this.f_img = this.fragmentcount.getChildByName("gold").getChildByName("f_img");
            this.r_btnVideoGet = this.r_item.getChildByName("r_btnVideoGet");
            this.r_btnGet = this.r_item.getChildByName("r_btnGet");
            this.Tips = this.owner.getChildByName("Tips");
            this.around = this.Tips.getChildByName("around");
            this.nearby = this.Tips.getChildByName("nearby");
            this.front = this.Tips.getChildByName("front");
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.skill_boss.visible = true;
                this.skill_role.visible = false;
                this.btnAccelerate.visible = UserComData.PropState[0] ? true : false;
                this.btnHint.visible = UserComData.PropState[1] ? true : false;
                this.btnImprisonment.visible = UserComData.PropState[2] ? true : false;
                this.around.skin = 'game/font_09.png';
                this.nearby.skin = 'game/font_10.png';
                this.front.skin = 'game/font_11.png';
            }
            else {
                this.skill_boss.visible = false;
                this.skill_role.visible = true;
                if (UserComData.isGuideLevel) {
                    UserComData.PropState = [1, 1, 1];
                    UserComData.itemSelectState = [1, 1, 1];
                    this.two_video.visible = false;
                    this.three_video.visible = false;
                }
                this.btnAccelerate.visible = UserComData.PropState[0] ? true : false;
                this.btnRecover.visible = UserComData.PropState[1] ? true : false;
                this.btnStealth.visible = UserComData.PropState[2] ? true : false;
                this.around.skin = 'game/font_38.png';
                this.nearby.skin = 'game/font_39.png';
                this.front.skin = 'game/font_40.png';
            }
            this.kill = this.Tips.getChildByName("kill");
            this.born = this.Tips.getChildByName("born");
            this.end = this.Tips.getChildByName("end");
            this.imgfu = this.Tips.getChildByName("imgfu");
            this.sealboss = this.Tips.getChildByName("sealboss");
            this.bossName = this.kill.getChildByName("bossName");
            this.dierName = this.kill.getChildByName("dierName");
            this.zs = this.Tips.getChildByName("zs");
            this.zs_count = this.zs.getChildByName("count");
            this.zs_count.text = UserComData.GameBoxDiamond + "";
            this.accelerate = this.Tips.getChildByName("accelerate");
            this.stealth = this.Tips.getChildByName("stealth");
            this.nocat = this.Tips.getChildByName("nocat");
            this.hint = this.Tips.getChildByName("hint");
            this.MatchingWindow = this.owner.getChildByName("MatchingWindow");
            this.Matchbg = this.MatchingWindow.getChildByName("Matchbg");
            this.MatchTimeBg = this.MatchingWindow.getChildByName("MatchTimeBg");
            this.MatchTimeBg.visible = false;
            this.NameBg = this.MatchingWindow.getChildByName("NameBg");
            this.MatchTimeProgress = this.MatchTimeBg.getChildByName("MatchTimeProgress");
            this.MatchDownTime = this.MatchTimeBg.getChildByName("MatchDownTime");
            this.MatchBoss = this.Matchbg.getChildByName("MatchBoss");
            this.MatchBossName = this.MatchBoss.getChildByName("MatchBossName");
            this.MatchBossKuang = this.MatchBoss.getChildByName("MatchBossKuang");
            this.MatchList = this.Matchbg.getChildByName("MatchList");
            this.MatchList.array = [];
            this.MatchList.renderHandler = new Laya.Handler(this, this.MatchRender);
            this.MatchingWindow.visible = true;
            this.playerStateList = this.owner.getChildByName("playerStateList");
            this.playerStateList.visible = false;
            this.goodsList = this.playerStateList.getChildByName("goodsList");
            this.goodsList.array = [];
            this.goodsList.renderHandler = new Laya.Handler(this, this.goodsRender);
            this.StateBg = this.owner.getChildByName("StateBg");
            this.StateBg.visible = false;
            this.state_role = this.StateBg.getChildByName("state_role");
            this.state_boss = this.StateBg.getChildByName("state_boss");
            this.Hpbg = this.state_role.getChildByName("Hpbg");
            this.HpPro = this.state_role.getChildByName("HpPropress");
            this.HpPropress_1 = this.state_role.getChildByName("HpPropress_1");
            this.state_count = this.state_boss.getChildByName("state_count");
            this.state_tips = this.state_role.getChildByName("tips");
            this.state_tips.alpha = 0;
            this.SurveyWindow = this.owner.getChildByName("SurveyWindow");
            this.SurveyWindow.visible = false;
            this.Bossposition = this.SurveyWindow.getChildByName("Bossposition");
            this.tvClose = this.SurveyWindow.getChildByName("tvClose");
            this.tvClose.visible = false;
            this.btnBoss = this.SurveyWindow.getChildByName("btnBoss");
            this.surveryTimeBg = this.SurveyWindow.getChildByName("Bg");
            this.Timeprogess = this.surveryTimeBg.getChildByName("Timeprogess");
            this.Timeprogess.width = 332;
            this.StartGameDownTime = this.surveryTimeBg.getChildByName("StartGameDownTime");
            this.StartGameDownTime.text = UserComData.BossDelayTime + "";
            if (UserComData.gameModel == GameModel.Runner) {
                this.startGame();
                this.QuasiCenter.visible = false;
                this.state_role.visible = true;
                this.state_boss.visible = false;
                let hp = SceneLogic.inst.PlayerController.MaxHP;
                if (hp > 5) {
                    this.HpPropress_1.visible = true;
                    this.HpPro.visible = true;
                    this.InitW = 48.4 * 5;
                    this.InitW_1 = 48.4 * (hp - 5);
                }
                else {
                    this.HpPropress_1.visible = false;
                    this.InitW = 48.4 * SceneLogic.inst.PlayerController.MaxHP;
                    this.InitW_1 = 0;
                    this.Hpbg.width = this.InitW;
                }
                this.HpPro.width = this.InitW;
                this.HpPropress_1.width = this.InitW_1;
                this.initMatchList();
            }
            else {
                this.state_role.visible = false;
                this.state_boss.visible = true;
                this.state_count.text = "5";
                this.SelectWindow.visible = false;
                EventMgr.inst.emit("ChangeCamera");
                if (!UserComData.UIScene) {
                    UserComData.UIScene = new Laya.Scene3D();
                    this.Bossposition.addChild(UserComData.UIScene);
                    let camera_Boss = new Laya.Camera();
                    UserComData.UIScene.addChild(camera_Boss);
                    camera_Boss.orthographic = true;
                    camera_Boss.clearFlag = Laya.CameraClearFlags.Nothing;
                    camera_Boss.transform.localPosition = new Laya.Vector3(0, 3, 3);
                    camera_Boss.viewport = new Laya.Viewport(this.Bossposition.x - 300, this.Bossposition.y - 300, 600, 600);
                    let _resouce = SceneLogic.inst.boss.getChildByName("role_boss");
                    UserComData.boss = Laya.Sprite3D.instantiate(_resouce, UserComData.UIScene);
                    UserComData.boss.transform.localPosition = new Laya.Vector3(0, 0, 0);
                    UserComData.boss.active = true;
                }
                UserComData.UIScene.active = true;
                this.QuasiCenter.visible = false;
                Laya.stage.event(EventId.GAME_START);
                SceneLogic.inst.GameStart();
                this.initgoodsList();
                this.initMatchList();
            }
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnUp);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnMove);
            this.btnChat.on(Laya.Event.CLICK, this, this.ChatWindowClick);
            this.btnAmulet.on(Laya.Event.CLICK, this, this.fuClick);
            this.btnRefreshItem.on(Laya.Event.CLICK, this, this.RefreshItemClick);
            this.btnBox.on(Laya.Event.CLICK, this, this.BoxClick);
            this.btnJump.on(Laya.Event.CLICK, this, this.PlayerJump);
            this.btnDeformation.on(Laya.Event.CLICK, this, this.PlayerChange);
            this.btnAttack.on(Laya.Event.CLICK, this, this.BossAttack);
            this.btnLook.on(Laya.Event.CLICK, this, this.LookClick);
            this.btnCloseLook.on(Laya.Event.CLICK, this, this.LookClick);
            this.one.on(Laya.Event.CLICK, this, this.FristItem);
            this.two.on(Laya.Event.CLICK, this, this.SecondItem);
            this.three.on(Laya.Event.CLICK, this, this.ThirdItem);
            this.btnSelectAgain.on(Laya.Event.CLICK, this, this.AgainSelect);
            this.btnBoss.on(Laya.Event.CLICK, this, this.bossCilck);
            this.btnSkill.on(Laya.Event.CLICK, this, this.SkillClick);
            this.btnLookAI.on(Laya.Event.CLICK, this, this.LookAI);
            this.btnLookBoss.on(Laya.Event.CLICK, this, this.LookBoss);
            this.btnAccelerate.on(Laya.Event.CLICK, this, this.skill_Accelerate);
            this.btnRecover.on(Laya.Event.CLICK, this, this.skill_Recover);
            this.btnStealth.on(Laya.Event.CLICK, this, this.skill_Stealth);
            this.btnHint.on(Laya.Event.CLICK, this, this.skill_Hint);
            this.btnImprisonment.on(Laya.Event.CLICK, this, this.skill_Imprisonment);
            this.r_btnGet.on(Laya.Event.CLICK, this, this.RunnerGet);
            this.r_btnVideoGet.on(Laya.Event.CLICK, this, this.RunnerAgainGet);
            this.btnReBorn.on(Laya.Event.CLICK, this, this.ReBorn);
            this.btnExit.on(Laya.Event.CLICK, this, this.Exit);
            EventMgr.inst.onEvent("GameWin", this, this.GameWin);
            EventMgr.inst.onEvent("GameLose", this, this.GameLose);
            EventMgr.inst.onEvent("BossTips", this, this.BossTips);
            EventMgr.inst.onEvent("killTips", this, this.killTips);
            EventMgr.inst.onEvent("HitPlayer", this, this.HitPlayer);
            EventMgr.inst.onEvent("ChangeLook", this, this.ChangeLook);
            EventMgr.inst.onEvent("showView", this, this.showView);
            EventMgr.inst.onEvent("InitName", this, this.InitName);
            EventMgr.inst.onEvent("ShowName", this, this.ShowName);
            EventMgr.inst.onEvent("HideName", this, this.HideName);
            EventMgr.inst.onEvent("Unseal", this, this.Unseal);
            EventMgr.inst.onEvent("BossCatch", this, this.BossCatchTips);
            EventMgr.inst.onEvent("AddHP", this, this.UpdateHpState);
            EventMgr.inst.onEvent("ChangeCat", this, this.ChangeCat);
            EventMgr.inst.onEvent("goGuide", this, this.openGuideByName);
            Laya.stage.on("closeRank", this, this.ShowResult);
        }
        onDestroy() {
            UserComData.UIScene = null;
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.OnDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnUp);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnMove);
            this.btnChat.off(Laya.Event.CLICK, this, this.ChatWindowClick);
            this.btnAmulet.off(Laya.Event.CLICK, this, this.fuClick);
            this.btnRefreshItem.off(Laya.Event.CLICK, this, this.RefreshItemClick);
            this.btnBox.off(Laya.Event.CLICK, this, this.BoxClick);
            this.btnJump.off(Laya.Event.CLICK, this, this.PlayerJump);
            this.btnDeformation.off(Laya.Event.CLICK, this, this.PlayerChange);
            this.btnAttack.off(Laya.Event.CLICK, this, this.BossAttack);
            this.btnLook.off(Laya.Event.CLICK, this, this.LookClick);
            this.btnCloseLook.off(Laya.Event.CLICK, this, this.LookClick);
            this.one.off(Laya.Event.CLICK, this, this.FristItem);
            this.two.off(Laya.Event.CLICK, this, this.SecondItem);
            this.three.off(Laya.Event.CLICK, this, this.ThirdItem);
            this.btnSelectAgain.off(Laya.Event.CLICK, this, this.AgainSelect);
            this.btnBoss.off(Laya.Event.CLICK, this, this.bossCilck);
            this.btnSkill.off(Laya.Event.CLICK, this, this.SkillClick);
            this.btnLookAI.off(Laya.Event.CLICK, this, this.LookAI);
            this.btnLookBoss.off(Laya.Event.CLICK, this, this.LookBoss);
            this.btnAccelerate.off(Laya.Event.CLICK, this, this.skill_Accelerate);
            this.btnRecover.off(Laya.Event.CLICK, this, this.skill_Recover);
            this.btnStealth.off(Laya.Event.CLICK, this, this.skill_Stealth);
            this.btnHint.off(Laya.Event.CLICK, this, this.skill_Hint);
            this.btnImprisonment.off(Laya.Event.CLICK, this, this.skill_Imprisonment);
            this.r_btnGet.off(Laya.Event.CLICK, this, this.RunnerGet);
            this.r_btnVideoGet.off(Laya.Event.CLICK, this, this.RunnerAgainGet);
            this.btnReBorn.off(Laya.Event.CLICK, this, this.ReBorn);
            this.btnExit.off(Laya.Event.CLICK, this, this.Exit);
            EventMgr.inst.onOffEvent("GameWin", this, this.GameWin);
            EventMgr.inst.onOffEvent("GameLose", this, this.GameLose);
            EventMgr.inst.onOffEvent("BossTips", this, this.BossTips);
            EventMgr.inst.onOffEvent("killTips", this, this.killTips);
            EventMgr.inst.onOffEvent("HitPlayer", this, this.HitPlayer);
            EventMgr.inst.onOffEvent("ChangeLook", this, this.ChangeLook);
            EventMgr.inst.onOffEvent("showView", this, this.showView);
            EventMgr.inst.onOffEvent("InitName", this, this.InitName);
            EventMgr.inst.onOffEvent("ShowName", this, this.ShowName);
            EventMgr.inst.onOffEvent("HideName", this, this.HideName);
            EventMgr.inst.onOffEvent("Unseal", this, this.Unseal);
            EventMgr.inst.onOffEvent("BossCatch", this, this.BossCatchTips);
            EventMgr.inst.onOffEvent("AddHP", this, this.UpdateHpState);
            EventMgr.inst.onOffEvent("ChangeCat", this, this.ChangeCat);
            Laya.stage.off("closeRank", this, this.ShowResult);
        }
        ChangeCat() {
            if (UserComData.IsactivationFu) {
                this.btnAmulet.visible = false;
            }
            this.catList.visible = true;
            this.btnBox.visible = false;
            this.skillList.visible = false;
            this.PlayList.visible = false;
            this.btnChat.visible = false;
            this.ChatWindow.visible = false;
            this.LookList.visible = false;
        }
        ReBorn() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            Laya.timer.scale = 0;
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
                EventMgr.inst.emit("ReBorn");
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功复活打点", "视频成功复活打点"));
                if (UserComData.IsactivationFu) {
                    this.btnAmulet.visible = true;
                }
                this.catList.visible = false;
                this.skillList.visible = true;
                this.PlayList.visible = true;
                this.btnChat.visible = true;
                this.LookList.visible = true;
            }), Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
                zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
            }), Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
            }));
        }
        Exit() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            EventMgr.inst.emit("PlayerDead");
        }
        BossCatchTips(value) {
            let _ani = this.owner["NearAni"];
            if (value == 1) {
                _ani.play(0, true);
            }
            else if (value == 2) {
                _ani.stop();
                this.owner.getChildByName("Near").alpha = 0;
            }
        }
        fuClick() {
            if (!this.fu_canClick)
                return;
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            SceneLogic.inst.flyFu.transform.position = SceneLogic.inst.player.transform.position.clone();
            let _ani = this.owner["fuluTip"];
            _ani.stop();
            this.btnAmulet.visible = false;
            this.btnJump.visible = false;
            this.btnLook.visible = false;
            this.btnRefreshItem.visible = false;
            SceneLogic.inst.gameState = GameState.over;
            EventMgr.inst.emit("bossSeal");
        }
        Unseal() {
            if (!this.isOrigin) {
                this.PlayerChange();
            }
            UserComData.curFuCount++;
            this.btnAmulet.visible = true;
            this.fu_progressBg.visible = true;
            this.UpdateMask();
            this.btnDeformation.visible = false;
            this.btnLook.visible = false;
        }
        UpdateMask() {
            let _start = this.endAngle;
            let _endTarget = 315;
            Laya.timer.loop(10, this, function CsMask() {
                this.endAngle += 315 / 100;
                this.fu_progress.width = this.endAngle;
                if (this.endAngle >= _endTarget) {
                    Laya.timer.clear(this, CsMask);
                    this.fu_progress.width = this.endAngle;
                    this.fu_progressBg.visible = false;
                    this.fu_count.text = UserComData.curFuCount + "/3";
                    SoundMgr.inst.playSound("symbol");
                    UserComData.isNearFu = false;
                    EventMgr.inst.emit("HideFu");
                    let _fuani = this.owner["fu_" + UserComData.curFuCount];
                    _fuani.play(0, false);
                    Laya.timer.once(500, this, () => {
                        let _itemT = this.fuBg.getChildByName("item" + UserComData.curFuCount);
                        _itemT.getChildByName("item").getChildByName("img").visible = false;
                        let _ani = this.owner["fire_" + UserComData.curFuCount];
                        _ani.play(0, true);
                        if (UserComData.curFuCount == 3) {
                            SceneLogic.inst.FuPool.active = false;
                            this.fu_progressBg.visible = false;
                            this.endAngle = 0;
                            this.fu_progress.width = 0;
                            this.as_count.text = UserComData.curFuCount + "/3";
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("UnsealAmulet3", "拾取第三个符箓"));
                            let _ani = this.owner["fuluTip"];
                            _ani.play(0, true);
                            this.as_count.text = UserComData.curFuCount + "/3";
                            let _asani = this.owner["as_" + UserComData.curFuCount];
                            _asani.play(0, true);
                            this.activationFu();
                            return;
                        }
                        else if (UserComData.curFuCount == 1) {
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("UnsealAmulet1", "拾取第一个符箓"));
                        }
                        else if (UserComData.curFuCount == 2) {
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("UnsealAmulet2", "拾取第二个符箓"));
                        }
                        this.btnDeformation.visible = true;
                        this.btnLook.visible = true;
                        Laya.timer.once(500, this, () => {
                            Laya.Tween.to(this.btnAmulet, { alpha: 0 }, 1000, null, Laya.Handler.create(this, () => {
                                this.btnAmulet.visible = false;
                                this.btnAmulet.alpha = 1;
                                this.fu_progressBg.visible = false;
                                this.endAngle = 0;
                                this.fu_progress.width = 0;
                                this.as_count.text = UserComData.curFuCount + "/3";
                                let _ani = this.owner["as_" + UserComData.curFuCount];
                                _ani.play(0, true);
                            }));
                        });
                    });
                    return;
                }
                if (!UserComData.isNearFu) {
                    UserComData.curFuCount--;
                    this.fu_progressBg.visible = false;
                    this.endAngle = 0;
                    this.fu_progress.width = 0;
                    this.btnAmulet.visible = false;
                    this.btnDeformation.visible = true;
                    this.btnLook.visible = true;
                    Laya.timer.clear(this, CsMask);
                    return;
                }
            });
        }
        activationFu() {
            this.fu_tips.skin = "game/font_guide_21.png";
            for (let i = 1; i <= 3; i++) {
                let _fire = this.fuBg.getChildByName("item" + i);
                Laya.timer.once(400 * i, this, () => {
                    Laya.Tween.to(_fire, { x: 115, y: 172 }, 300, Laya.Ease.backIn, Laya.Handler.create(this, () => {
                        _fire.visible = false;
                        let ani = this.owner["fulightAni"];
                        ani.play(0, false);
                    }));
                });
            }
            let _fuani = this.owner["fu_5"];
            _fuani.play(0, true);
            Laya.timer.once(2200, this, () => {
                let ani = this.owner["fubgAni"];
                ani.play(0, false);
                this.AmuletState.visible = false;
                this.fu_tips.visible = false;
                this.fly_fu.visible = true;
            });
            Laya.timer.once(3000, this, () => {
                let _x = Laya.stage.width - this.btnAttack.right - this.btnAttack.width / 2;
                let _y = Laya.stage.height - this.btnAttack.bottom - this.btnAttack.height / 2;
                let ani = this.owner["fuskew"];
                ani.play(0, false);
                Laya.Tween.to(this.btnAmulet, { x: _x, y: _y }, 600, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                    this.fuBg.visible = true;
                    this.fuBg.alpha = 1;
                    this.fu_count.visible = false;
                    this.fly_fu.visible = false;
                    let _oldani = this.owner["fu_5"];
                    _oldani.stop();
                    let _newani = this.owner["fu_6"];
                    _newani.play(0, true);
                    _newani = this.owner["fu_7"];
                    _newani.play(0, true);
                    this.btnLook.visible = true;
                    this.fuBg.alpha = UserComData.CanSealBoss ? 1 : 0.2;
                    let _fuani = this.owner["fu_4"];
                    _fuani.play(0, true);
                    EventMgr.inst.emit("activationFu");
                }));
            });
        }
        openUI() {
            this.playerStateList.visible = true;
            this.RockerOut.visible = Laya.Browser.onMobile;
            this.RockerIn.visible = Laya.Browser.onMobile;
            this.btnJump.visible = true;
            if (UserComData.gameModel == GameModel.Runner) {
                this.SelectWindow.visible = true;
                this.downTimeBg.visible = true;
                this.SurveyWindow.visible = false;
                this.btnAttack.visible = false;
                this.btnChat.visible = true;
            }
            else {
                this.StateBg.visible = true;
                this.skillList.visible = false;
                this.btnJump.visible = false;
            }
        }
        HitPlayer() {
            let _ani = this.owner["hitAni"];
            _ani.play(0, false);
            zs.laya.sdk.DeviceService.VibrateLong();
            if (UserComData.PlayerisLook) {
                this.LookClick();
            }
            this.UpdateHpState();
            this.refreshData();
        }
        PlayerChange() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (!this.isOrigin) {
                this.isOrigin = true;
                EventMgr.inst.emit("ChangeItem", -1);
            }
            else {
                this.isOrigin = false;
                EventMgr.inst.emit("ChangeItem", UserComData.curItem);
            }
        }
        Hideselect() {
            this.one_select.visible = false;
            this.two_select.visible = false;
            this.three_select.visible = false;
        }
        FristItem() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this.isSelect = true;
            if (UserComData.isGuide && UserComData.GuideId == 3) {
                Laya.stage.event("hideGuide");
                this.openGuideByName("jump");
                UserComData.GuideId = 4;
            }
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("SelectItem", "选择变身"));
            UserComData.curItem = UserComData.curItemList[0];
            EventMgr.inst.emit("goldRefreshItem");
            this.Hideselect();
            this.one_select.visible = true;
            if (this.isOrigin) {
                this.isOrigin = false;
            }
            this.btnDeformation.visible = true;
        }
        SecondItem() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this.isSelect = true;
            if (UserComData.isGuide && UserComData.GuideId == 3) {
                Laya.stage.event("hideGuide");
                this.openGuideByName("jump");
                UserComData.GuideId = 4;
            }
            if (UserComData.itemSelectState[1] == 0) {
                Laya.timer.scale = 0;
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("道具选择视频解锁", "道具选择视频解锁"));
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("SelectItem", "选择变身"));
                    UserComData.itemSelectState[1] == 1;
                    UserComData.curItem = UserComData.curItemList[1];
                    EventMgr.inst.emit("goldRefreshItem");
                    this.Hideselect();
                    this.two_select.visible = true;
                    this.two_video.visible = false;
                    if (this.isOrigin) {
                        this.isOrigin = false;
                    }
                    this.btnDeformation.visible = true;
                }), Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                    zs.laya.game.UIService.showToast("看完视频才可解锁哦~~");
                }), Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                }));
            }
            else {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("SelectItem", "选择变身"));
                UserComData.curItem = UserComData.curItemList[1];
                EventMgr.inst.emit("goldRefreshItem");
                this.Hideselect();
                this.two_select.visible = true;
                if (this.isOrigin) {
                    this.isOrigin = false;
                }
                this.btnDeformation.visible = true;
            }
        }
        ThirdItem() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this.isSelect = true;
            if (UserComData.isGuide && UserComData.GuideId == 3) {
                Laya.stage.event("hideGuide");
                this.openGuideByName("jump");
                UserComData.GuideId = 4;
            }
            if (UserComData.itemSelectState[2] == 0) {
                Laya.timer.scale = 0;
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("道具选择视频解锁", "道具选择视频解锁"));
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("SelectItem", "选择变身"));
                    UserComData.curItem = UserComData.curItemList[2];
                    UserComData.itemSelectState[2] == 1;
                    EventMgr.inst.emit("goldRefreshItem");
                    this.Hideselect();
                    this.three_select.visible = true;
                    this.three_video.visible = false;
                    if (this.isOrigin) {
                        this.isOrigin = false;
                    }
                    this.btnDeformation.visible = true;
                }), Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                    zs.laya.game.UIService.showToast("看完视频才可解锁哦~~");
                }), Laya.Handler.create(this, function () {
                    Laya.timer.scale = 1;
                }));
            }
            else {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("SelectItem", "选择变身"));
                UserComData.curItem = UserComData.curItemList[2];
                EventMgr.inst.emit("goldRefreshItem");
                this.Hideselect();
                this.three_select.visible = true;
                if (this.isOrigin) {
                    this.isOrigin = false;
                }
                this.btnDeformation.visible = true;
            }
        }
        onUpdate() {
            if (false && Laya.timer.currTimer - this._vibrateTime > 250) {
                this._vibrateTime = Laya.timer.currTimer;
                zs.laya.sdk.DeviceService.VibrateShort();
            }
            if (UserComData.isNearBox && !UserComData.PlayerisLook) {
                this.btnBox.visible = true;
            }
            else {
                this.btnBox.visible = false;
            }
            if (this._bossT && this.Timeprogess.width > 0) {
                this.BossBornProgess();
            }
            if (this._itemT && this.selectTimeProgess.width > 0) {
                this.ChangeItemProgess();
            }
            if (this._matchT && this.MatchTimeProgress.width > 0) {
                this.MatchProgess();
            }
            if (this.RemainingTime > 0 && UserComData.gameModel == GameModel.Runner && !UserComData.PlayerisLook && UserComData.PlayerState == 1) {
                this.btnRefreshItem.visible = true;
            }
            else {
                this.btnRefreshItem.visible = false;
            }
            if (!this.fu_canClick && UserComData.CanSealBoss) {
                let _ani = this.owner["fuluTip"];
                _ani.play(0, true);
                _ani = this.owner["canSeal"];
                _ani.play(0, true);
                _ani = this.owner["fu_7"];
                _ani.stop();
                this.state_tips.alpha = 0;
                this.fuBg.alpha = 1;
                this.BossTips("sealBoss");
            }
            if (this.fu_canClick && !UserComData.CanSealBoss) {
                let _ani = this.owner["canSeal"];
                _ani.stop();
                _ani = this.owner["fu_7"];
                _ani.play(0, true);
                this.fu.rotation = 0;
                this.fuBg.alpha = 0.2;
            }
            this.fu_canClick = UserComData.CanSealBoss;
            this.fu_guide.visible = UserComData.CanSealBoss;
            this.btnHint.alpha = UserComData.HintSkillCanUse ? 1 : 0.5;
            this.btnImprisonment.alpha = UserComData.ImprisonmentSkillCanUse ? 1 : 0.5;
        }
        RefreshItemClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("金币再次选择按钮点击", "金币再次选择按钮点击"));
            if (UserComData.userGold < UserComData.RefreshItemGold) {
                zs.laya.game.UIService.showToast("猫爪币不足");
                return;
            }
            UserComData.userGold -= UserComData.RefreshItemGold;
            RequestMgr.UpdatePlayerByKey("userGold", UserComData.userGold.toString());
            SceneLogic.inst.GetItemList();
            if (UserComData.curItem != UserComData.curItemList[0]) {
                UserComData.curItem = UserComData.curItemList[0];
            }
            else {
                UserComData.curItem = UserComData.curItemList[1];
            }
            if (this.isOrigin) {
                this.isOrigin = false;
            }
            EventMgr.inst.emit("goldRefreshItem");
        }
        BoxClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            UserComData.isClickBox = true;
            Laya.timer.scale = 0;
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
                if (UserComData.curGetDiamond == 0) {
                    UserComData.curGetDiamond += UserComData.GameBoxDiamond;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("OpenGiftBox", "开礼盒"));
                }
                this.BossTips("zs");
            }), Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
                zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
            }), Laya.Handler.create(this, function () {
                Laya.timer.scale = 1;
            }));
        }
        LookClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            UserComData.PlayerisLook = !UserComData.PlayerisLook;
            this.btnLook.visible = !UserComData.PlayerisLook;
            this.skillList.visible = !UserComData.PlayerisLook;
            this.btnCloseLook.visible = UserComData.PlayerisLook;
            this.btnJump.visible = !UserComData.PlayerisLook;
            this.btnDeformation.visible = !UserComData.PlayerisLook && !UserComData.IsactivationFu;
            this.btnAmulet.visible = !UserComData.PlayerisLook && UserComData.IsactivationFu;
            this.RockerOut.visible = !UserComData.PlayerisLook;
            this.RockerIn.visible = !UserComData.PlayerisLook;
            this.btnLookAI.visible = UserComData.PlayerisLook && UserComData.curSkillCount < 4;
            this.btnLookBoss.visible = UserComData.PlayerisLook && this._haveBoss;
            EventMgr.inst.emit("ChangeState", UserComData.PlayerisLook);
        }
        BossAttack() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (Laya.timer.currTimer - this._attackTime < 1000) {
                return;
            }
            this._attackTime = Laya.timer.currTimer;
            let _screenPos = new Laya.Vector2(this.QuasiCenter.x, this.QuasiCenter.y);
            EventMgr.inst.emit("BossAttack", _screenPos);
        }
        SkillClick() {
            if (Laya.timer.currTimer - this._skillTime < (UserComData.bossSkillTime[0] + UserComData.bossSkillTime[1]) * 1000) {
                return;
            }
            SoundMgr.inst.playSound("angry");
            this.BossTips("accelerate");
            let _img = this.btnSkill.getChildByName("img");
            _img.alpha = 1;
            let _ani = this.owner["brustAni"];
            _ani.play(0, true);
            let _progess = this.btnSkill.getChildByName("progess");
            Laya.timer.once(UserComData.bossSkillTime[0] * 1000, this, () => {
                _progess.height = 120;
                _progess.y = -11;
                _progess.visible = true;
                let add = (120 * 100) / (UserComData.bossSkillTime[1] * 1000);
                Laya.timer.loop(100, this, function CsMask() {
                    _progess.height -= add;
                    _progess.y += add;
                    if (_progess.height <= 0) {
                        _progess.visible = false;
                        Laya.timer.clear(this, CsMask);
                    }
                });
                _ani && _ani.stop();
                _img.alpha = 0;
            });
            this._skillTime = Laya.timer.currTimer;
            EventMgr.inst.emit("BossBurst");
        }
        bossCilck() {
            if (this._isClick) {
                return;
            }
            if (this._bossAni.getControllerLayer(0).getCurrentPlayState().animatorState.name.indexOf("attack") != -1) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this._bossAni.crossFade("role_attack", 0.1);
            let _dur = this._bossAni.getControllerLayer(0).getCurrentPlayState().duration;
            Laya.timer.once(_dur * 750, this, () => {
                this._bossAni.crossFade("role_wait", 0);
            });
        }
        DirPos() {
        }
        BossBornProgess() {
            let _t = this._bossT - (Laya.timer.currTimer - this._startTime) / 1000;
            this.Timeprogess.width = (_t / UserComData.BossDelayTime) * 332;
        }
        BossBornDownTime() {
            let self = this;
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.RockerOut.visible = false;
                this.RockerIn.visible = false;
                this.playerStateList.visible = false;
                this.downTimeBg.visible = false;
                UserComData.BossDelayTime = 15;
            }
            self._bossT = UserComData.BossDelayTime;
            self._t = UserComData.BossDelayTime;
            self._startTime = Laya.timer.currTimer;
            self.StartGameDownTime.text = self._t + "";
            Laya.timer.loop(1000, self, function CsBoss() {
                self._t--;
                if (self._t <= 10 && self._t > 0) {
                    zs.laya.sdk.DeviceService.VibrateShort();
                }
                if (self._t % 5 == 0 && self._bossAni.getControllerLayer(0).getCurrentPlayState().animatorState.name.indexOf("attack") == -1) {
                    let _ran = Utils.Range(1, 2);
                    if (_ran == 1 && self._bossAni.getControllerLayer(0).getCurrentPlayState().animatorState.name.indexOf("wait") == -1) {
                        self._bossAni.crossFade("role_wait", 0.1);
                    }
                    else if (_ran == 2) {
                        self._bossAni.crossFade("role_win", 0.1);
                        let _dur = self._bossAni.getControllerLayer(0).getCurrentPlayState().duration;
                        Laya.timer.once(_dur * 900, this, () => {
                            if (self._bossAni.getControllerLayer(0).getCurrentPlayState().animatorState.name.indexOf("win") != -1) {
                                Laya.timer.once(_dur * 100, this, () => {
                                    self._bossAni.crossFade("role_wait", 0.1);
                                });
                            }
                            ;
                        });
                    }
                }
                if (self._t < 0) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("BossUp", "完成登场"));
                    zs.laya.sdk.DeviceService.VibrateLong();
                    Laya.timer.clear(self, CsBoss);
                    self.SurveyWindow.visible = false;
                    this.downTimeBg.visible = true;
                    UserComData.UIScene.active = false;
                    EventMgr.inst.emit("SurveyModel");
                    self.owner.visible = false;
                    return;
                }
                self.StartGameDownTime.text = self._t + "";
            });
        }
        PlayerJump() {
            if (Laya.timer.currTimer - this._jumpTime < 800) {
                return;
            }
            this._jumpTime = Laya.timer.currTimer;
            if (UserComData.isGuide && UserComData.GuideId == 4) {
                Laya.stage.event("hideGuide");
                this.openGuideByName("time");
                UserComData.GuideId = 5;
                UserComData.isGuide = false;
                RequestMgr.UpdatePlayerByKey("isGuide", "1");
                Laya.timer.once(6000, this, () => {
                    Laya.stage.event("hideGuide");
                });
            }
            EventMgr.inst.emit("PlayerJump");
        }
        BornPassingAnimation() {
            this.PassImage.visible = true;
            let _ani = this.owner["PassAni"];
            _ani.play(0, false);
            Laya.timer.once(1500, this, () => {
                this.PassImage.visible = false;
            });
        }
        GameWin(type) {
            UserComData.isGuide = false;
            Laya.stage.event("hideGuide");
            UserComData.userLevel++;
            this.isPass = true;
            if (!type) {
                this.BossTips("end");
            }
            Laya.timer.once(2500, this, () => {
                if (UserComData.gameModel == GameModel.Runner) {
                    if (type && type == 1) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("封印boss获胜打点", "封印boss获胜打点"));
                        this.BornPassingAnimation();
                        Laya.timer.once(750, this, () => {
                            SceneLogic.inst.FailBossAni(type);
                        });
                        Laya.timer.once(5750, this, () => {
                            this.BornPassingAnimation();
                        });
                        Laya.timer.once(6250, this, () => {
                            this.OpenRunnerResult(this.isPass, type);
                        });
                    }
                    else {
                        this.BornPassingAnimation();
                        Laya.timer.once(750, this, () => {
                            this.playerStateList.visible = false;
                            this.RockerOut.visible = false;
                            this.RockerIn.visible = false;
                            this.btnJump.visible = false;
                            this.btnLook.visible = false;
                            this.btnDeformation.visible = false;
                            this.downTimeBg.visible = false;
                            this.btnAmulet.visible = false;
                            this.skillList.visible = false;
                            this.AmuletState.visible = false;
                            this.btnLookAI.visible = false;
                            this.btnLookBoss.visible = false;
                            this.btnCloseLook.visible = false;
                            this.StateBg.visible = false;
                            this.ChatWindow.visible = false;
                            this.btnChat.visible = false;
                            this.catList.visible = false;
                            SceneLogic.inst.Showresult3D();
                        });
                        Laya.timer.once(4500, this, () => {
                            this.BornPassingAnimation();
                        });
                        Laya.timer.once(5000, this, () => {
                            this.OpenRunnerResult(this.isPass);
                        });
                    }
                }
                else {
                    this.BornPassingAnimation();
                    Laya.timer.once(2000, this, () => {
                        this.OpenRunnerResult(this.isPass);
                    });
                }
            });
        }
        GameLose() {
            UserComData.isGuide = false;
            Laya.stage.event("hideGuide");
            this.isPass = false;
            this.BossTips("end");
            Laya.timer.once(2500, this, () => {
                if (UserComData.gameModel == GameModel.Pursuer) {
                    this.BornPassingAnimation();
                    Laya.timer.once(750, this, () => {
                        SceneLogic.inst.FailBossAni();
                    });
                    Laya.timer.once(5750, this, () => {
                        this.BornPassingAnimation();
                    });
                    Laya.timer.once(6250, this, () => {
                        this.OpenRunnerResult(this.isPass);
                    });
                }
                else {
                    this.BornPassingAnimation();
                    Laya.timer.once(2000, this, () => {
                        this.OpenRunnerResult(this.isPass);
                    });
                }
            });
        }
        checkPointArea(_x, _y) {
            if (_x > 0 && _x < Laya.stage.width / 2.2) {
                return true;
            }
            return false;
        }
        OnDown(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (SceneLogic.inst.PlayerController.isDead) {
                return;
            }
            this.mouseDownPiontX = Laya.stage.mouseX;
            this.mouseDownPiontY = Laya.stage.mouseY;
            if (arg.stageX <= Laya.stage.width / 2) {
                if (UserComData.isGuide && UserComData.GuideId == 1) {
                    Laya.stage.event("hideGuide");
                    this.RockerOut.visible = Laya.Browser.onMobile;
                    this.RockerIn.visible = Laya.Browser.onMobile;
                }
                this.RockerIn.x = this.mouseDownPiontX;
                this.RockerIn.y = this.mouseDownPiontY;
                this.RockerOut.x = this.mouseDownPiontX;
                this.RockerOut.y = this.mouseDownPiontY;
                UserComData.MoveId = arg.touchId;
            }
            else {
                UserComData.RotateId = arg.touchId;
                if (UserComData.isGuide && UserComData.GuideId == 2) {
                    Laya.stage.event("hideGuide");
                }
            }
        }
        OnMove(arg) {
            if (SceneLogic.inst.gameState != GameState.playing) {
                return;
            }
            if (SceneLogic.inst.PlayerController.isDead) {
                return;
            }
            if (arg.touchId == UserComData.MoveId) {
                let mouseDownPiontX = Laya.stage.mouseX;
                let mouseDownPiontY = Laya.stage.mouseY;
                let moveDirect = new Laya.Vector2(mouseDownPiontX - this.RockerOut.x, mouseDownPiontY - this.RockerOut.y);
                if (Laya.Vector2.scalarLength(moveDirect) > 80) {
                    Laya.Vector2.normalize(moveDirect, moveDirect);
                    moveDirect = new Laya.Vector2(moveDirect.x * 80, moveDirect.y * 80);
                }
                let angle = Math.atan2(moveDirect.x, moveDirect.y) * 180 / Math.PI;
                if (angle < 0)
                    angle += 360;
                angle = Math.round(angle);
                angle -= 180;
                if (!UserComData.PlayerisLook && Laya.Browser.onMobile) {
                    SceneLogic.inst.PlayerController.Mod.transform.localRotationEulerY = SceneLogic.inst.PlayerController.Follow.transform.localRotationEulerY + angle;
                }
                if (moveDirect.x > 0) {
                    UserComData.MoveRight = true;
                }
                else {
                    UserComData.MoveRight = false;
                }
                if (moveDirect.y > 0) {
                    UserComData.MoveBack = true;
                }
                else {
                    UserComData.MoveBack = false;
                }
                this.RockerIn.x = this.RockerOut.x + moveDirect.x;
                this.RockerIn.y = this.RockerOut.y + moveDirect.y;
            }
        }
        OnUp(arg) {
            if (arg.touchId == UserComData.MoveId) {
                UserComData.MoveId = -1;
                this.RockerOut.pos(this.InitUIPos.x, this.InitUIPos.y);
                this.RockerIn.x = this.RockerOut.x;
                this.RockerIn.y = this.RockerOut.y;
                UserComData.MoveRight = false;
                UserComData.MoveBack = false;
                if (UserComData.isGuide && UserComData.GuideId == 1) {
                    this.openGuideByName("rotate");
                    UserComData.GuideId = 2;
                }
            }
            if (arg.touchId == UserComData.RotateId) {
                UserComData.RotateId = -1;
                if (UserComData.isGuide && UserComData.GuideId == 2) {
                    if (this.isSelect) {
                        this.openGuideByName("jump");
                        UserComData.GuideId = 4;
                    }
                    else {
                        this.openGuideByName("select");
                        UserComData.GuideId = 3;
                    }
                }
            }
        }
        onDisable() {
            super.onDisable();
        }
        onClick() {
        }
        PosToScreenPos(pos) {
            let outPos = new Laya.Vector4(0, 0, 0, 0);
            SceneLogic.inst.Camera_Main.viewport.project(pos, SceneLogic.inst.Camera_Main.projectionViewMatrix, outPos);
            let _pos = new Laya.Vector2(outPos.x / Laya.stage.clientScaleX, outPos.y / Laya.stage.clientScaleY);
            return _pos;
        }
        ScreePosToPos(pos) {
            let outPos = new Laya.Vector3(0, 0, 0);
            SceneLogic.inst.Camera_Main.convertScreenCoordToOrthographicCoord(pos, outPos);
            return outPos;
        }
        startGame() {
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.GameDownTime();
            }
            else {
                Laya.stage.event(EventId.GAME_START);
                SceneLogic.inst.GameStart();
                this.initgoodsList();
            }
        }
        RunTime() {
            let self = this;
            self._t = UserComData.BossDelayTime;
            let t = Utils.formatDownTimer(self._t);
            self.DownTime.text = t + "";
            Laya.timer.loop(1000, self, function CsRun() {
                self._t--;
                if (self._t % 5 == 0) {
                    self.UpdateChat();
                }
                let SceAni = this.owner["SceAni"];
                SceAni.play(0, false);
                if (self._t <= 10 && self._t > 0) {
                    if (self._t == 10) {
                        self.DownTime.font = "shuzi03";
                        self.downTimeBg.visible = false;
                        self.time_1.visible = true;
                    }
                    let _ani = this.owner["time_1_ani"];
                    _ani.play(0, false);
                    let _downAni = this.owner["downTimeArea"];
                    _downAni.play(0, false);
                    zs.laya.sdk.DeviceService.VibrateShort();
                }
                if (self._t < 0) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerGame1", "进入游戏30秒"));
                    Laya.timer.clear(self, CsRun);
                    zs.laya.sdk.DeviceService.VibrateLong();
                    self.DownTime.font = "shuzi01";
                    self.downTimeBg.visible = true;
                    self.time_1.visible = false;
                    EventMgr.inst.emit("BossInstance");
                    self.owner.visible = false;
                    this.img_time.skin = "game/font_02.png";
                    return;
                }
                t = Utils.formatDownTimer(self._t);
                self.DownTime.text = t + "";
                self.redTime.text = self._t + "";
            });
        }
        showView() {
            this.owner.visible = true;
            this.skillList.visible = true;
            this.btnJump.visible = true;
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.img_time.skin = "game/font_95.png";
                this.RockerIn.visible = Laya.Browser.onMobile;
                this.RockerOut.visible = Laya.Browser.onMobile;
                console.log("showView ========= this.RockerOut.visible = true;");
                this.playerStateList.visible = true;
                this.downTimeBg.visible = true;
                this.btnSkill.visible = true;
            }
            else {
                if (UserComData.activityInfo.fuState == 1) {
                    this.AmuletState.visible = true;
                }
            }
            this.BossTips("born");
            UserComData.curPlayTime = zs.laya.platform.ADConfig.zs_game_time;
            this.GameDownTime();
        }
        showFreeChange() {
            if (UserComData.isOpenFree)
                return;
            if (this.RemainingTime > 0 && UserComData.gameModel == GameModel.Runner && !UserComData.PlayerisLook && SceneLogic.inst.gameState != GameState.over) {
                Laya.Scene.open("view/game/FreeTransformationPage.scene", false);
                UserComData.isOpenFree = true;
            }
        }
        GameDownTime() {
            let self = this;
            let _time = UserComData.curPlayTime;
            UserComData.curOutTime = 0;
            let _fuindex = 0;
            let t = Utils.formatDownTimer(_time);
            self.DownTime.text = t + "";
            this._haveBoss = true;
            this.UpdateChatRender();
            this.btnLook.visible = UserComData.gameModel == GameModel.Runner;
            this.btnLookBoss.visible = UserComData.PlayerisLook;
            let _skillTime = _time - Utils.Range(0, 9);
            Laya.timer.loop(1000, self, function CsDownTime() {
                if (SceneLogic.inst.gameState == GameState.pause) {
                    if (UserComData.AddTimeState == 1) {
                        _time += 30;
                        UserComData.curPlayTime += 30;
                        UserComData.AddTimeState = 0;
                        SceneLogic.inst.gameState = GameState.playing;
                    }
                    else if (UserComData.AddTimeState == 2) {
                        SceneLogic.inst.gameState = GameState.playing;
                        UserComData.AddTimeState = 0;
                    }
                    return;
                }
                _time--;
                self.RemainingTime = _time;
                if (_time == 10 && UserComData.gameModel == GameModel.Pursuer) {
                    SceneLogic.inst.gameState = GameState.pause;
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getInfo", { type: 5, count: 30 });
                    }));
                    return;
                }
                if (SceneLogic.inst.gameState == GameState.over) {
                    Laya.timer.clear(self, CsDownTime);
                    return;
                }
                if (_time == _skillTime && UserComData.gameModel == GameModel.Runner) {
                    EventMgr.inst.emit("BossBurst");
                    if (UserComData.cacheLevel > 3) {
                        _skillTime = _time - UserComData.bossSkillTime[0] - UserComData.bossSkillTime[1] - Utils.Range(0, 4);
                    }
                }
                if (_time % 5 == 0 && UserComData.gameModel == GameModel.Runner) {
                    self.UpdateChat();
                }
                UserComData.curOutTime = UserComData.curPlayTime - _time;
                if (UserComData.curOutTime == 15) {
                    if (UserComData.activityInfo.fuState == 1) {
                        SceneLogic.inst.FuPool.active = true;
                        this.BossTips("fuInstance");
                    }
                }
                if (_time > 30 && _time % UserComData.DestroyItemTime == 0) {
                    SceneLogic.inst.DestroyItem();
                }
                if (UserComData.curOutTime == 30) {
                    if (UserComData.gameModel == GameModel.Runner) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerGame2", "进入游戏60秒"));
                    }
                    else {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("PursuerGame1", "登场后30秒"));
                    }
                }
                if (UserComData.curOutTime == 60) {
                    if (UserComData.gameModel == GameModel.Runner) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerGame3", "进入游戏90秒"));
                    }
                    else {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("PursuerGame2", "登场后60秒"));
                    }
                }
                if (UserComData.curOutTime == 90) {
                    if (UserComData.gameModel == GameModel.Runner) {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerGame4", "进入游戏120秒"));
                    }
                    else {
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("PursuerGame3", "登场后90秒"));
                    }
                }
                if (_time == 30) {
                    UserComData.AttackTime = Laya.timer.currTimer;
                    UserComData.HaveWh = false;
                }
                if (_time <= 10) {
                    zs.laya.sdk.DeviceService.VibrateShort();
                    let _downAni = this.owner["downTimeArea"];
                    _downAni.play(0, false);
                }
                if (_time < 0) {
                    SceneLogic.inst.gameState = GameState.over;
                    if (UserComData.gameModel == GameModel.Runner) {
                        if (UserComData.PlayerState == 2 || UserComData.activityInfo.fuState == 1) {
                            this.GameLose();
                        }
                        else {
                            this.GameWin();
                        }
                    }
                    else {
                        this.GameLose();
                    }
                    Laya.timer.clear(self, CsDownTime);
                    return;
                }
                t = Utils.formatDownTimer(_time);
                self.DownTime.text = t + "";
            });
        }
        ChangeItemProgess() {
            let _t = this._itemT - (Laya.timer.currTimer - this._startTime) / 1000;
            if (UserComData.isGuide) {
                this.selectTimeProgess.width = (_t / 20) * 332;
            }
            else {
                this.selectTimeProgess.width = (_t / UserComData.ChangeItemTime) * 332;
            }
        }
        ChangeItemDownTime(index) {
            if (UserComData.isGuide) {
                index = 20;
            }
            this._T = index;
            this._itemT = index;
            this._startTime = Laya.timer.currTimer;
            let t = Utils.formatTimer(this._T);
            this.selectTime.text = t + "";
            Laya.timer.clear(this, this.CsSelectTime);
            Laya.timer.loop(1000, this, this.CsSelectTime);
        }
        CsSelectTime() {
            if (SceneLogic.inst.gameState == GameState.over) {
                this.stopT = this._T;
                Laya.timer.clear(this, this.CsSelectTime);
                return;
            }
            this._T--;
            if (this._T < 0) {
                if (!this.isSelect) {
                    this.FristItem();
                }
                this.Hideselect();
                UserComData.isSelectOver = true;
                Laya.timer.once(1100, this, () => {
                    UserComData.isSelectOver = false;
                });
                this.SelectWindow.visible = false;
                this.StateBg.visible = true;
                this.skillList.visible = true;
                Laya.timer.clear(this, this.CsSelectTime);
                return;
            }
            let t = Utils.formatTimer(this._T);
            this.selectTime.text = t + "";
        }
        updateSelectImg() {
            this.one.getChildByName("itemImg").skin = "game/prop_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[0]).name + ".png";
            this.two.getChildByName("itemImg").skin = "game/prop_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[1]).name + ".png";
            this.three.getChildByName("itemImg").skin = "game/prop_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[2]).name + ".png";
            this.one.getChildByName("itemname").skin = "game/name_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[0]).name + ".png";
            this.two.getChildByName("itemname").skin = "game/name_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[1]).name + ".png";
            this.three.getChildByName("itemname").skin = "game/name_" + SceneLogic.inst.ItemPrefabs.getChildAt(UserComData.curItemList[2]).name + ".png";
        }
        AgainSelect() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (this.isFristChange) {
                this.isFristChange = false;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RefreshItem", "刷新变身"));
                SceneLogic.inst.GetItemList();
                this.updateSelectImg();
                this.ChangeItemDownTime(UserComData.ChangeItemTime);
                this.Hideselect();
                this.btnSelectAgain.visible = false;
                this.btnSelectAgain.getChildByName("img").skin = "game/font_42.png";
                return;
            }
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                SceneLogic.inst.GetItemList();
                this.updateSelectImg();
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RefreshItem", "刷新变身"));
                this.ChangeItemDownTime(UserComData.ChangeItemTime);
                this.btnSelectAgain.visible = false;
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可复活哦~~");
                this.ChangeItemDownTime(this.stopT);
            }), Laya.Handler.create(this, function () {
                this.ChangeItemDownTime(this.stopT);
            }));
        }
        OpenRunnerResult(_pass, type) {
            this.resultList = {};
            this.downTimeBg.visible = false;
            let _fragmentName = "";
            let _fragmentImg = "";
            let _fragmentCount = 0;
            let _gold = 0;
            let _diamond = 0;
            this.r_Title.centerX = -1400;
            this.result_1.centerX = -1400;
            this.result_2.centerX = -1400;
            this.result_3.centerX = -1400;
            this.goldcount.scale(0, 0);
            this.diamondcount.scale(0, 0);
            this.fragmentcount.scale(0, 0);
            this.ResultWindow.visible = true;
            let ani = this.owner["bossresult"];
            ani.play(0, false);
            ani = this.owner["roleresult"];
            ani.play(0, false);
            UserComData.cacheLevel++;
            Laya.timer.once(1000, this, () => {
                zs.laya.SoundService.stopMusic();
                Laya.SoundManager.stopAll();
                let _rank;
                let _type = 1;
                let _id = 1;
                let _time = 1100;
                if (UserComData.activityInfo.fuState == 1) {
                    UserComData.taskInfo.taskGetList[3]++;
                    if (UserComData.taskInfo.taskGetList[3] == UserComData.taskData[3].num) {
                        UserComData.taskInfo.taskStateList[3] = 1;
                    }
                }
                if (UserComData.gameModel == GameModel.Runner) {
                    UserComData.taskInfo.taskGetList[0]++;
                    if (UserComData.taskInfo.taskGetList[0] == UserComData.taskData[0].num) {
                        UserComData.taskInfo.taskStateList[0] = 1;
                    }
                    this.result_3.visible = true;
                    let r1_role = this.result_1.getChildByName("role");
                    r1_role.visible = true;
                    let _count = r1_role.getChildByName("count");
                    let r2_role = this.result_2.getChildByName("role");
                    r2_role.visible = true;
                    let _img = r2_role.getChildByName("img");
                    let r3_role = this.result_3.getChildByName("role");
                    let r3_count = r3_role.getChildByName("count");
                    _type = 1;
                    if (UserComData.RoletrySkinId != -1) {
                        _id = UserComData.RoletrySkinId;
                        UserComData.RoletrySkinId = -1;
                    }
                    else {
                        _id = UserComData.PlayerSKinInfo.userRoleSkinId;
                    }
                    if (_pass) {
                        UserComData.winCount++;
                        if (type && type == 1) {
                            this.r_Title.skin = "game/tips_07.png";
                            let ani = this.owner["resultfire"];
                            ani.play(0, true);
                            ani = this.owner["resultfire_0"];
                            ani.play(0, true);
                        }
                        else {
                            this.r_Title.skin = "game/tips_00.png";
                        }
                        SoundMgr.inst.playSound("cat_win");
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerWin", "喵喵模式胜利"));
                        _rank = 1;
                        UserComData.modeDifficultyLevel++;
                        UserComData.modeDifficultyLevel = UserComData.modeDifficultyLevel > 2 ? 2 : UserComData.modeDifficultyLevel;
                    }
                    else {
                        UserComData.lostCount++;
                        UserComData.modeDifficultyLevel = 0;
                        if (UserComData.activityInfo.fuState == 1) {
                            this.r_Title.skin = "game/tips_08.png";
                        }
                        else {
                            this.r_Title.skin = "game/tips_01.png";
                        }
                        SoundMgr.inst.playSound("end");
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("RunnerFail", "喵喵模式失败"));
                        if (UserComData.PlayerState == 2) {
                            _rank = UserComData.curPlayRanking;
                        }
                        else if (UserComData.PlayerState == 1) {
                            _rank = 6 - UserComData.curSkillCount;
                        }
                    }
                    Laya.LocalStorage.setItem("modeDifficultyLevel", UserComData.modeDifficultyLevel.toString());
                    _count.text = _rank + "";
                    if (type && type == 1) {
                        UserComData.rankInfo.rankScore += UserComData.reslutRankScore.role[0];
                    }
                    else {
                        UserComData.rankInfo.rankScore += UserComData.reslutRankScore.role[_rank];
                    }
                    _img.skin = UserComData.curGetDiamond == 0 ? "game/font_74.png" : "game/font_68.png";
                    r3_count.text = UserComData.curFuCount + "/3";
                    _gold = UserComData.RoleResultData[_rank].gold;
                    _diamond = UserComData.RoleResultData[_rank].diamond;
                    _fragmentCount = UserComData.RoleResultData[_rank].fragment;
                    UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_id] += _fragmentCount;
                    _fragmentName = UserComData.ShopRoleData[_id].fragmentName;
                    _fragmentImg = UserComData.ShopRoleData[_id].fragmentImg;
                }
                else {
                    UserComData.taskInfo.taskGetList[1]++;
                    if (UserComData.taskInfo.taskGetList[1] == UserComData.taskData[1].num) {
                        UserComData.taskInfo.taskStateList[1] = 1;
                    }
                    let r1_boss = this.result_1.getChildByName("boss");
                    r1_boss.visible = true;
                    let r1_time = r1_boss.getChildByName("time");
                    let r2_boss = this.result_2.getChildByName("boss");
                    r2_boss.visible = true;
                    let r2_count = r2_boss.getChildByName("count");
                    _type = 2;
                    _id = UserComData.PlayerSKinInfo.userBossSKinId;
                    if (_pass) {
                        UserComData.winCount++;
                        this.r_Title.skin = "game/tips_02.png";
                        SoundMgr.inst.playSound("boss_win");
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("PursuerWin", "boss模式胜利"));
                    }
                    else {
                        UserComData.lostCount++;
                        this.r_Title.skin = "game/tips_03.png";
                        SoundMgr.inst.playSound("end");
                        zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("PursuerFail", "boss模式失败"));
                    }
                    r1_time.text = Utils.formatTimer(UserComData.curOutTime) + "";
                    r2_count.text = 5 - UserComData.curSkillCount + "";
                    _rank = UserComData.curSkillCount;
                    UserComData.rankInfo.rankScore += UserComData.reslutRankScore.boss[UserComData.curSkillCount];
                    _gold = UserComData.BossResultData[_rank].gold;
                    _diamond = UserComData.BossResultData[_rank].diamond;
                    _fragmentCount = UserComData.BossResultData[_rank].fragment;
                    UserComData.PlayerSKinInfo.BossSkinFragmentCount[UserComData.PlayerSKinInfo.userBossSKinId] += _fragmentCount;
                    _fragmentName = UserComData.ShopBossData[UserComData.PlayerSKinInfo.userBossSKinId].fragmentName;
                    _fragmentImg = UserComData.ShopBossData[UserComData.PlayerSKinInfo.userBossSKinId].fragmentImg;
                    _time = 800;
                }
                UserComData.userGold += _gold;
                _diamond += UserComData.curGetDiamond + UserComData.curFuCount * UserComData.fuGetDiamond;
                let _rankId = UserComData.rankInfo.rankId;
                for (let i = _rankId; i < UserComData.rankData.length; i++) {
                    if (UserComData.rankData[i].experience > UserComData.rankInfo.rankScore) {
                        UserComData.rankInfo.rankId = i - 1;
                        break;
                    }
                    if (i == UserComData.rankData.length - 1 && UserComData.rankInfo.rankScore >= UserComData.rankData[i].experience) {
                        UserComData.rankInfo.rankId = i;
                    }
                }
                let _rankValue = 0;
                for (let i = 0; i < UserComData.rankData.length; i++) {
                    let _list = UserComData.rankData[i].rank.split("_");
                    if (_list.length > 1 && Number(_list[1]) == 0) {
                        if (UserComData.rankInfo.rankArriveState[_rankValue] == 0 && UserComData.rankInfo.rankScore >= UserComData.rankData[i].experience) {
                            let _vtName = "到达" + UserComData.rankName[_list[0]] + "段位";
                            UserComData.rankInfo.rankArriveState[_rankValue] = 1;
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt(_vtName, _vtName));
                        }
                        _rankValue++;
                    }
                    else {
                        if (UserComData.rankInfo.rankArriveState[_rankValue] == 0 && UserComData.rankInfo.rankScore >= UserComData.rankData[i].experience) {
                            let _vtName = "到达" + UserComData.rankName[_list[0]] + "段位";
                            UserComData.rankInfo.rankArriveState[_rankValue] = 1;
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt(_vtName, _vtName));
                        }
                    }
                }
                Laya.LocalStorage.setItem("winCount", UserComData.winCount.toString());
                Laya.LocalStorage.setItem("lostCount", UserComData.lostCount.toString());
                UserComData.userDiamond += _diamond;
                this.goldcount.text = _gold + "";
                this.diamondcount.text = _diamond + "";
                this.fragmentcount.text = _fragmentCount + "";
                this.f_img.skin = _fragmentImg;
                RequestMgr.UpdatePlayerAny({
                    "userDiamond": UserComData.userDiamond.toString(),
                    "userGold": UserComData.userGold.toString(),
                    "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                    "cacheLevel": UserComData.cacheLevel.toString(),
                    "RoletrySkinId": UserComData.RoletrySkinId.toString(),
                    "userLevel": UserComData.userLevel.toString(),
                    "taskInfo": UserComData.taskInfo,
                    "rankInfo": UserComData.rankInfo
                });
                this.diamondcount.visible = _diamond == 0 ? false : true;
                this.goldcount.visible = true;
                this.fragmentcount.visible = true;
                Laya.Scene.open("view/game/RankResultPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getInfo", { diamond: _diamond, time: _time });
                }));
                this.resultList = {
                    gold: _gold,
                    diamond: _diamond,
                    fragment: { type: _type, id: _id, fragmentCount: _fragmentCount }
                };
            });
        }
        ShowResult(arg) {
            Laya.stage.event("show_native");
            if (zs.laya.platform.ADConfig.zs_gameover_button_switch && zs.laya.platform.ADConfig.isPublicVersion()) {
                this.r_btnGet.y = 80;
                this.r_btnGet.skin = "game/font_999.png";
            }
            else {
                this.r_btnGet.y = 700;
                this.r_btnGet.skin = "game/font_18.png";
            }
            this.r_btnVideoGet.visible = true;
            let _diamond = arg.diamond;
            let _time = arg.time;
            let _ani = this.owner["resultAni"];
            _ani.play(0, false);
            _ani.once(Laya.Event.COMPLETE, this, () => {
                this.goldcount.scale(0.7, 0.7);
                this.diamondcount.scale(.7, .7);
                this.fragmentcount.scale(.7, .7);
                if (_diamond == 0) {
                    if (zs.laya.platform.ADConfig.zs_switch && zs.laya.platform.ADConfig.zs_jump_time > 0) {
                        this.r_btnGet.scale(0, 0);
                        this.r_btnGet.visible = true;
                        Laya.timer.once(zs.laya.platform.ADConfig.zs_jump_time, this, () => {
                            Laya.Tween.to(this.r_btnGet, { scaleX: 1, scaleY: 1 }, 300, Laya.Ease.backOut);
                        });
                    }
                    else {
                        this.r_btnGet.visible = true;
                    }
                }
                else {
                    if (zs.laya.platform.ADConfig.zs_switch && zs.laya.platform.ADConfig.zs_jump_time > 0) {
                        this.r_btnGet.scale(0, 0);
                        this.r_btnGet.visible = true;
                        Laya.timer.once(zs.laya.platform.ADConfig.zs_jump_time, this, () => {
                            Laya.Tween.to(this.r_btnGet, { scaleX: 1, scaleY: 1 }, 300, Laya.Ease.backOut);
                        });
                    }
                    else {
                        this.r_btnGet.visible = true;
                    }
                }
            });
        }
        CheckNotDeadAI() {
            for (let i = 0; i < UserComData.runnerNameList.length; i++) {
                let _isDead = false;
                for (let j = 0; j < UserComData.resultNameList.length; j++) {
                    if (UserComData.resultNameList[j] == UserComData.runnerNameList[i]) {
                        _isDead = true;
                        break;
                    }
                }
                if (!_isDead) {
                    UserComData.resultNameList.push(UserComData.runnerNameList[i]);
                }
            }
        }
        RunnerAgainGet() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("领取成功");
                UserComData.userGold += this.resultList.gold;
                UserComData.userDiamond += this.resultList.diamond;
                if (this.resultList.fragment.type == 1) {
                    UserComData.PlayerSKinInfo.RoleSkinFragmentCount[this.resultList.fragment.id] += this.resultList.fragment.fragmentCount;
                }
                else {
                    UserComData.PlayerSKinInfo.BossSkinFragmentCount[this.resultList.fragment.id] += this.resultList.fragment.fragmentCount;
                }
                RequestMgr.UpdatePlayerAny({
                    "userDiamond": UserComData.userDiamond.toString(),
                    "userGold": UserComData.userGold.toString(),
                    "PlayerSKinInfo": UserComData.PlayerSKinInfo
                });
                this.RunnerGet();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        RunnerGet() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (this.isPass) {
                Laya.stage.event(EventId.GAME_WIN);
            }
            else {
                Laya.stage.event(EventId.GAME_FAILED);
            }
            SceneLogic.inst.GameReStart();
            zs.laya.game.AppMain.playerInfo.level_id++;
            RequestMgr.UpdatePlayerLevel(zs.laya.game.AppMain.playerInfo.level_id);
            zs.laya.game.AppMain.playerInfo.level_start++;
            RequestMgr.UpdatePlayerLevel(zs.laya.game.AppMain.playerInfo.level_start);
        }
        ChatWindowClick() {
            this.ChatWindow.visible = !this.ChatWindow.visible;
        }
        UpdateChatRender() {
            this.ChatData = [];
            if (this._haveBoss) {
                this.ChatData = UserComData.ChatData["game"];
            }
            else {
                this.ChatData = UserComData.ChatData["start"];
            }
            this.chatList.array = this.ChatData;
            this.chatList.refresh();
            this.chatList.renderHandler = new Laya.Handler(this, this.ChatRender);
        }
        ChatRender(cell, index) {
            let _data = this.ChatData[index];
            let desc = cell.getChildByName("desc");
            desc.text = _data.content;
            cell.on(Laya.Event.CLICK, cell, () => {
                if (this.isChating)
                    return;
                this.isChating = true;
                this.ChatWindowClick();
                this._goodsList[this.playerinGoodsIndex].desc = desc.text;
                this.refreshData();
                this.HideChat(this.playerinGoodsIndex);
            });
        }
        ShowPlayerChat() {
        }
        UpdateChat() {
            let _list = [];
            if (UserComData.curSkillCount > 3)
                return;
            for (let i = 0; i < this._goodsList.length; i++) {
                if (!this._goodsList[i].isPlayer && this._goodsList[i].state != 2 && this._goodsList[i].desc == "") {
                    _list.push(i);
                }
            }
            if (!_list || _list == [])
                return;
            if (_list.length > 1) {
                _list.sort(() => Math.random() - 0.5);
                let _ran = Utils.Range(0, 1);
                if (_ran == 1) {
                    this.ShowChat(_list[0]);
                    this.HideChat(_list[0]);
                }
                Laya.timer.once(1000, this, () => {
                    let _ran2 = Utils.Range(0, 1);
                    if (_ran2 == 1) {
                        this.ShowChat(_list[1]);
                        this.HideChat(_list[1]);
                    }
                });
                if (_list.length > 2) {
                    Laya.timer.once(2000, this, () => {
                        let _ran3 = Utils.Range(0, 1);
                        if (_ran3 == 1) {
                            this.ShowChat(_list[2]);
                            this.HideChat(_list[2]);
                        }
                    });
                }
            }
            else if (_list.length == 1) {
                let _ran = Utils.Range(0, 1);
                if (_ran == 1) {
                    this.ShowChat(_list[0]);
                    this.HideChat(_list[0]);
                }
            }
        }
        HideChat(index) {
            if (index == null)
                return;
            Laya.timer.once(1500, this, () => {
                if (index == this.playerinGoodsIndex) {
                    this.isChating = false;
                }
                this._goodsList[index].desc = "";
                this.refreshData();
            });
        }
        ShowChat(index) {
            if (index == null)
                return;
            if (this._haveBoss) {
                if (this._goodsList[index].state == 2)
                    return;
                let _data = UserComData.ChatData["game"];
                this._goodsList[index].desc = _data[Utils.Range(0, _data.length - 1)].content;
            }
            else {
                let _data = UserComData.ChatData["start"];
                this._goodsList[index].desc = _data[Utils.Range(0, _data.length - 1)].content;
            }
            this.refreshData();
        }
        initgoodsList() {
            this._goodsList = [];
            if (UserComData.gameModel == GameModel.Runner) {
                let _ran = Utils.Range(0, 4);
                this.playerinGoodsIndex = _ran;
                let _value = 0;
                for (let i = 0; i < 5; i++) {
                    if (_ran == i) {
                        this._goodsList.push({
                            isPlayer: true,
                            name: "我",
                            state: 0,
                            desc: ""
                        });
                    }
                    else {
                        this._goodsList.push({
                            isPlayer: false,
                            name: UserComData.runnerNameList[_value],
                            state: 0,
                            desc: ""
                        });
                        _value++;
                    }
                }
                this.UpdateChatRender();
            }
            else {
                for (let i = 0; i < 5; i++) {
                    this._goodsList.push({
                        isPlayer: false,
                        name: UserComData.runnerNameList[i],
                        state: 0,
                        desc: ""
                    });
                }
            }
            this.refreshData();
        }
        refreshData() {
            this.goodsList.array = this._goodsList;
            this.goodsList.refresh();
            this.goodsList.renderHandler = new Laya.Handler(this, this.goodsRender);
        }
        goodsRender(cell, index) {
            let _data = this._goodsList[index];
            let icon = cell.getChildByName("icon");
            icon.visible = true;
            let player = cell.getChildByName("player");
            let HpPropress = cell.getChildByName("HpPropress");
            let descBg = cell.getChildByName("descBg");
            let desc = descBg.getChildByName("desc");
            descBg.visible = false;
            HpPropress.visible = false;
            player.visible = false;
            let username = cell.getChildByName("username");
            let dead = cell.getChildByName("dead");
            dead.visible = false;
            let state = cell.getChildByName("state");
            state.visible = false;
            username.text = _data.name;
            if (_data.desc) {
                desc.text = _data.desc;
                descBg.visible = true;
            }
            if (_data.isPlayer) {
                player.visible = true;
            }
            if (_data.state == 0) {
                state.visible = true;
            }
            else if (_data.state == 1) {
            }
            else if (_data.state == 2) {
                dead.visible = true;
            }
        }
        MatchRender(cell, index) {
            let _data = this._matchListData[index];
            let player = cell.getChildByName("player");
            let username = cell.getChildByName("username");
            player.visible = false;
            if (_data.isPlayer) {
                player.visible = true;
            }
            username.text = _data.name;
            if (index > this._matchPlayerIndex) {
                cell.visible = false;
                let _count = index - this._matchPlayerIndex;
                let _loopTime = this._MatchRandomTime / (4 - this._matchPlayerIndex);
                Laya.timer.loop(_loopTime * _count * 1000, this, function CsMatch() {
                    cell.visible = true;
                });
            }
        }
        initMatchList() {
            this.MatchingWindow.visible = true;
            this.MatchBossName.text = UserComData.BossName;
            this._MatchRandomTime = Utils.Range(2, 6);
            this._matchListData = [];
            if (UserComData.gameModel == GameModel.Runner) {
                this._matchPlayerIndex = Utils.Range(0, 3);
                let _value = 0;
                for (let i = 0; i < 5; i++) {
                    if (this._matchPlayerIndex == i) {
                        this._matchListData.push({
                            isPlayer: true,
                            name: "我",
                        });
                    }
                    else {
                        this._matchListData.push({
                            isPlayer: false,
                            name: UserComData.runnerNameList[_value],
                        });
                        _value++;
                    }
                }
                this.MatchBoss.visible = false;
                this.MatchBossKuang.visible = false;
                let _time = Utils.Range(0, this._MatchRandomTime);
                if (_time == 0) {
                    this.MatchBoss.visible = true;
                }
                else {
                    Laya.timer.once(_time * 1000, this, () => {
                        this.MatchBoss.visible = true;
                    });
                }
            }
            else {
                this._matchPlayerIndex = Utils.Range(0, 4);
                this.MatchBossKuang.visible = true;
                this.MatchBoss.visible = true;
                for (let i = 0; i < 5; i++) {
                    this._matchListData.push({
                        isPlayer: false,
                        name: UserComData.runnerNameList[i],
                    });
                }
            }
            this.refreshMatchData();
            this.BornPassingAnimation();
            this.MatchTimeBg.visible = true;
            this.MatchGameDownTime();
        }
        refreshMatchData() {
            this.MatchList.array = this._matchListData;
            this.MatchList.refresh();
            this.MatchList.renderHandler = new Laya.Handler(this, this.MatchRender);
        }
        MatchProgess() {
            let _t = this._matchT - (Laya.timer.currTimer - this._startTime) / 1000;
            this.MatchTimeProgress.width = (_t / 10) * 332;
        }
        MatchGameDownTime() {
            let self = this;
            let _t = 10;
            let _showT = 11;
            self._matchT = 11;
            self._startTime = Laya.timer.currTimer;
            if (UserComData.gameModel == GameModel.Pursuer) {
                self.SelectWindow.visible = false;
                self.MatchingWindow.visible = false;
                self.SurveyWindow.visible = true;
                self.btnAttack.visible = true;
                SceneLogic.inst.closeMatchScene();
                self.openUI();
                UserComData.boss.active = true;
                self._bossAni = UserComData.boss.getComponent(Laya.Animator);
                self._bossAni.crossFade("role_wait", 0.1);
                self.BossBornDownTime();
                return;
            }
            SceneLogic.inst.MatchingEvent();
            Laya.SoundManager.stopAll();
            UserComData.curMusicCannel && UserComData.curMusicCannel.stop();
            SoundMgr.inst.playSound("matching");
            this.Matchbg.visible = false;
            Laya.timer.loop(1000, self, function CsMatchTime() {
                _t--;
                _showT--;
                if (_t == 5) {
                    EventMgr.inst.emit("MatchBossUp");
                }
                self.MatchDownTime.text = _showT + "";
                if (_t < 0) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("MatchOver", "匹配完成"));
                    self._matchT = 0;
                    Laya.timer.clear(self, CsMatchTime);
                    Laya.Tween.to(self.Matchbg, { scaleX: 1.3, scaleY: 1.3 }, 200, null, Laya.Handler.create(this, () => {
                        self.Matchbg.scale(1.3, 1.3);
                        Laya.Tween.to(self.Matchbg, { scaleX: 0.1, scaleY: 0.1 }, 400, null, Laya.Handler.create(this, () => {
                            self.SelectWindow.visible = false;
                            self.MatchingWindow.visible = false;
                            self.SurveyWindow.visible = true;
                            self.btnAttack.visible = true;
                            SceneLogic.inst.closeMatchScene();
                            self.openUI();
                            if (UserComData.gameModel == GameModel.Runner) {
                                EventMgr.inst.emit("Initial");
                                if (UserComData.isGuide) {
                                    this.RockerOut.visible = false;
                                    this.RockerIn.visible = false;
                                    UserComData.GuideId = 1;
                                    this.openGuideByName("move");
                                }
                                self.RunTime();
                                self.ChangeItemDownTime(UserComData.ChangeItemTime);
                            }
                            else {
                                UserComData.boss.active = true;
                                self._bossAni = UserComData.boss.getComponent(Laya.Animator);
                                self._bossAni.crossFade("role_wait", 0.1);
                                self.BossBornDownTime();
                            }
                        }));
                    }));
                    return;
                }
            });
        }
        openGuideByName(name) {
            console.log("引导name:" + name);
            Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("showGuide", name);
            }));
        }
        BossTips(tipsName) {
            if (tipsName == "around") {
                UserComData.HaveTips = true;
                Laya.Tween.to(this.around, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.around, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                            UserComData.HaveTips = false;
                        }));
                    });
                }));
            }
            else if (tipsName == "nearby") {
                UserComData.HaveTips = true;
                Laya.Tween.to(this.nearby, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.nearby, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                            UserComData.HaveTips = false;
                        }));
                    });
                }));
            }
            else if (tipsName == "front") {
                UserComData.HaveTips = true;
                Laya.Tween.to(this.front, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.front, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                            UserComData.HaveTips = false;
                        }));
                    });
                }));
            }
            else if (tipsName == "born") {
                if (UserComData.gameModel == GameModel.Runner) {
                    this.born.skin = "game/font_53.png";
                }
                else {
                    this.born.skin = "game/font_56.png";
                }
                UserComData.HaveTips = true;
                this.born.centerX = 1200;
                this.born.alpha = 1;
                this.born.scale(2, 2);
                Laya.Tween.to(this.born, { scaleX: 1, scaleY: 1 }, 600, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.born, { alpha: 0 }, 300, null, Laya.Handler.create(this, () => {
                            this.born.centerX = 0;
                            Laya.timer.clear(this, CsBack);
                            UserComData.HaveTips = false;
                        }));
                    });
                }));
            }
            else if (tipsName == "end") {
                Laya.timer.once(1000, this, () => {
                    this.end.centerX = 1200;
                    let _ani = this.owner["end"];
                    _ani.play(0, false);
                });
            }
            else if (tipsName == "fuInstance") {
                if (UserComData.gameModel == GameModel.Pursuer) {
                    this.imgfu.getChildByName("img").visible = false;
                }
                this.imgfu.alpha = 1;
                this.imgfu.scale(2, 2);
                this.imgfu.centerX = 1200;
                Laya.Tween.to(this.imgfu, { scaleX: 1, scaleY: 1 }, 600, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.imgfu, { alpha: 0 }, 300, null, Laya.Handler.create(this, () => {
                            this.imgfu.centerX = 0;
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
            else if (tipsName == "sealBoss") {
                Laya.Tween.to(this.sealboss, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.sealboss, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
            else if (tipsName == "zs") {
                this.zs.alpha = 0;
                Laya.Tween.to(this.zs, { alpha: 1 }, 500, null, Laya.Handler.create(this, () => {
                    Laya.timer.once(1000, this, function CsBack() {
                        Laya.Tween.to(this.zs, { alpha: 0 }, 500, null, Laya.Handler.create(this, () => {
                            this.zs.alpha = 0;
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
            else if (tipsName == "accelerate") {
                if (this.haveTips)
                    return;
                this.haveTips = true;
                Laya.Tween.to(this.accelerate, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.accelerate, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                            this.haveTips = false;
                        }));
                    });
                }));
            }
            else if (tipsName == "stealth") {
                Laya.Tween.to(this.stealth, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.stealth, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
            else if (tipsName == "nocat") {
                Laya.Tween.to(this.nocat, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.nocat, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
            else if (tipsName == "hint") {
                Laya.Tween.to(this.hint, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    Laya.timer.once(1500, this, function CsBack() {
                        Laya.Tween.to(this.hint, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                            Laya.timer.clear(this, CsBack);
                        }));
                    });
                }));
            }
        }
        killTips(_targetName) {
            this.btnLookAI.visible = UserComData.PlayerisLook && UserComData.curSkillCount < 4;
            for (let i = 0; i < this._goodsList.length; i++) {
                if (this._goodsList[i].name == _targetName) {
                    this._goodsList[i].state = 2;
                    this.refreshData();
                    break;
                }
            }
            if (UserComData.gameModel == GameModel.Pursuer) {
                this.UpdateSkillCount();
            }
            this.bossName.text = UserComData.BossName;
            this.dierName.text = _targetName;
            Laya.Tween.to(this.kill, { centerX: 1200 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                Laya.timer.once(1500, this, function CsBack() {
                    Laya.Tween.to(this.kill, { centerX: 0 }, 100, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                        Laya.timer.clear(this, CsBack);
                    }));
                });
            }));
        }
        ;
        UpdateHpState() {
            let _progess = 0;
            if (SceneLogic.inst.PlayerController.HP > 5) {
                this.HpPro.width = this.InitW;
                _progess = (SceneLogic.inst.PlayerController.HP - 5) / (SceneLogic.inst.PlayerController.MaxHP - 5);
                this.HpPropress_1.width = (_progess < 0 ? 0 : _progess) * this.InitW_1;
            }
            else {
                this.HpPropress_1.visible = false;
                _progess = SceneLogic.inst.PlayerController.HP / SceneLogic.inst.PlayerController.MaxHP;
                this.HpPro.width = (_progess < 0 ? 0 : _progess) * this.InitW;
            }
        }
        UpdateSkillCount() {
            let _ani = this.owner["countAni"];
            _ani.play(0, false);
            Laya.timer.once(210, this, () => {
                this.state_count.text = 5 - UserComData.curSkillCount + "";
            });
        }
        LookAI() {
            EventMgr.inst.emit("ChangeLookItem");
        }
        LookBoss() {
            EventMgr.inst.emit("ChangeLookBoss");
        }
        ChangeLook() {
            if (UserComData.PlayerisLook) {
                this.LookClick();
            }
        }
        skill_Accelerate() {
            if (Laya.timer.currTimer - this.accelerateCoolingTime <= (UserComData.roleSkillInfo.accelerate[1] + UserComData.roleSkillInfo.accelerate[2]) * 1000)
                return;
            this.accelerateCoolingTime = Laya.timer.currTimer;
            let _canuse = false;
            if (UserComData.isGuideLevel || UserComData.PropState[0] == 1 || UserComData.userDiamond >= UserComData.PropDiamond * 2) {
                _canuse = true;
                if (!UserComData.isGuideLevel) {
                    if (UserComData.PropState[0] > 1) {
                        UserComData.userDiamond -= UserComData.PropDiamond * 2;
                        RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                    }
                    else {
                        let _count = this.btnAccelerate.getChildByName("count");
                        _count.text = UserComData.PropDiamond * 2 + "";
                        _count.visible = true;
                    }
                }
            }
            else {
                zs.laya.game.UIService.showToast("小鱼钻不足~~");
            }
            if (!_canuse)
                return;
            UserComData.PropState[0]++;
            this.BossTips("accelerate");
            SoundMgr.inst.playSound("accelerate");
            let _img = this.btnAccelerate.getChildByName("img");
            _img.alpha = 1;
            let _ani = this.owner["accelerateAni"];
            _ani.play(0, true);
            let _progess = this.btnAccelerate.getChildByName("progess");
            Laya.timer.once(UserComData.roleSkillInfo.accelerate[1] * 1000, this, () => {
                _progess.height = 170;
                _progess.y = 0;
                _progess.visible = true;
                let add = (170 * 100) / (UserComData.roleSkillInfo.accelerate[2] * 1000);
                Laya.timer.loop(100, this, function CsMask() {
                    _progess.height -= add;
                    _progess.y += add;
                    if (_progess.height <= 0) {
                        _progess.visible = false;
                        Laya.timer.clear(this, CsMask);
                    }
                });
                _ani && _ani.stop();
                _img.alpha = 0;
            });
            EventMgr.inst.emit("Accelerate");
        }
        skill_Recover() {
            if (Laya.timer.currTimer - this.recoverCoolingTime <= UserComData.roleSkillInfo.recover[0] * 1000)
                return;
            this.recoverCoolingTime = Laya.timer.currTimer;
            let _canuse = false;
            if (UserComData.isGuideLevel || UserComData.PropState[1] == 1 || UserComData.userDiamond >= UserComData.PropDiamond * 2) {
                _canuse = true;
                if (!UserComData.isGuideLevel) {
                    if (UserComData.PropState[1] > 1) {
                        UserComData.userDiamond -= UserComData.PropDiamond * 2;
                        RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                    }
                    else {
                        let _count = this.btnRecover.getChildByName("count");
                        _count.text = UserComData.PropDiamond * 2 + "";
                        _count.visible = true;
                    }
                }
            }
            else {
                zs.laya.game.UIService.showToast("小鱼钻不足~~");
            }
            if (!_canuse)
                return;
            UserComData.PropState[1]++;
            SoundMgr.inst.playSound("recovery");
            let _progess = this.btnRecover.getChildByName("progess");
            _progess.height = 170;
            _progess.y = 0;
            _progess.visible = true;
            let add = (170 * 100) / (UserComData.roleSkillInfo.recover[0] * 1000);
            Laya.timer.loop(100, this, function CsMask() {
                _progess.height -= add;
                _progess.y += add;
                if (_progess.height <= 0) {
                    _progess.visible = false;
                    Laya.timer.clear(this, CsMask);
                }
            });
            EventMgr.inst.emit("Recover");
        }
        skill_Stealth() {
            if (Laya.timer.currTimer - this.stealthCoolingTime <= (UserComData.roleSkillInfo.stealth[0] + UserComData.roleSkillInfo.stealth[1]) * 1000)
                return;
            this.stealthCoolingTime = Laya.timer.currTimer;
            let _canuse = false;
            if (UserComData.isGuideLevel || UserComData.PropState[2] == 1 || UserComData.userDiamond >= UserComData.PropDiamond * 2) {
                _canuse = true;
                if (!UserComData.isGuideLevel) {
                    if (UserComData.PropState[2] > 1) {
                        UserComData.userDiamond -= UserComData.PropDiamond * 2;
                        RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                    }
                    else {
                        let _count = this.btnStealth.getChildByName("count");
                        _count.text = UserComData.PropDiamond * 2 + "";
                        _count.visible = true;
                    }
                }
            }
            else {
                zs.laya.game.UIService.showToast("小鱼钻不足~~");
            }
            if (!_canuse)
                return;
            UserComData.PropState[2]++;
            this.BossTips("stealth");
            SoundMgr.inst.playSound("invisible");
            let _img = this.btnStealth.getChildByName("img");
            _img.alpha = 1;
            let _ani = this.owner["stealthAni"];
            _ani.play(0, true);
            let _progess = this.btnStealth.getChildByName("progess");
            Laya.timer.once(UserComData.roleSkillInfo.stealth[0] * 1000, this, () => {
                _progess.height = 170;
                _progess.y = 0;
                _progess.visible = true;
                let add = (170 * 100) / (UserComData.roleSkillInfo.stealth[1] * 1000);
                Laya.timer.loop(100, this, function CsMask() {
                    _progess.height -= add;
                    _progess.y += add;
                    if (_progess.height <= 0) {
                        _progess.visible = false;
                        Laya.timer.clear(this, CsMask);
                    }
                });
                _ani && _ani.stop();
                _img.alpha = 0;
            });
            EventMgr.inst.emit("Stealth");
        }
        skill_Hint() {
            if (!UserComData.HintSkillCanUse)
                return;
            if (Laya.timer.currTimer - this.hintCoolingTime <= UserComData.bossSkillInfo.hint[0] * 1000)
                return;
            this.hintCoolingTime = Laya.timer.currTimer;
            let _canuse = false;
            if (UserComData.PropState[1] == 1 || UserComData.userDiamond >= UserComData.PropDiamond * 2) {
                _canuse = true;
                if (UserComData.PropState[1] > 1) {
                    UserComData.userDiamond -= UserComData.PropDiamond * 2;
                    RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                }
                else {
                    let _count = this.btnHint.getChildByName("count");
                    _count.text = UserComData.PropDiamond * 2 + "";
                    _count.visible = true;
                }
            }
            else {
                zs.laya.game.UIService.showToast("小鱼钻不足~~");
            }
            if (!_canuse)
                return;
            UserComData.PropState[1]++;
            this.BossTips("hint");
            SoundMgr.inst.playSound("tips");
            let _progess = this.btnHint.getChildByName("progess");
            _progess.height = 170;
            _progess.y = 0;
            _progess.visible = true;
            let add = (170 * 100) / (UserComData.bossSkillInfo.hint[0] * 1000);
            Laya.timer.loop(100, this, function CsMask() {
                _progess.height -= add;
                _progess.y += add;
                if (_progess.height <= 0) {
                    _progess.visible = false;
                    Laya.timer.clear(this, CsMask);
                }
            });
            EventMgr.inst.emit("Hint");
        }
        skill_Imprisonment() {
            if (!UserComData.ImprisonmentSkillCanUse) {
                if (Laya.timer.currTimer - this.clickCoolingTime > 2000) {
                    this.clickCoolingTime = Laya.timer.currTimer;
                    this.BossTips("nocat");
                }
                return;
            }
            if (Laya.timer.currTimer - this.imprisonmentCoolingTime <= (UserComData.bossSkillInfo.imprisonment[0] + UserComData.bossSkillInfo.imprisonment[1]) * 1000)
                return;
            this.imprisonmentCoolingTime = Laya.timer.currTimer;
            let _canuse = false;
            if (UserComData.PropState[2] == 1 || UserComData.userDiamond >= UserComData.PropDiamond * 2) {
                _canuse = true;
                if (UserComData.PropState[2] > 1) {
                    UserComData.userDiamond -= UserComData.PropDiamond * 2;
                    RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                }
                else {
                    let _count = this.btnImprisonment.getChildByName("count");
                    _count.text = UserComData.PropDiamond * 2 + "";
                    _count.visible = true;
                }
            }
            else {
                zs.laya.game.UIService.showToast("小鱼钻不足~~");
            }
            if (!_canuse)
                return;
            UserComData.PropState[2]++;
            SoundMgr.inst.playSound("confinement");
            let _img = this.btnImprisonment.getChildByName("img");
            _img.alpha = 1;
            let _ani = this.owner["impAni"];
            _ani.play(0, true);
            let _progess = this.btnImprisonment.getChildByName("progess");
            Laya.timer.once(UserComData.bossSkillInfo.imprisonment[0] * 1000, this, () => {
                _progess.height = 170;
                _progess.y = 0;
                _progess.visible = true;
                let add = (170 * 100) / (UserComData.bossSkillInfo.imprisonment[1] * 1000);
                Laya.timer.loop(100, this, function CsMask() {
                    _progess.height -= add;
                    _progess.y += add;
                    if (_progess.height <= 0) {
                        _progess.visible = false;
                        Laya.timer.clear(this, CsMask);
                    }
                });
                _ani && _ani.stop();
                _img.alpha = 0;
            });
            EventMgr.inst.emit("Imprisonment");
        }
        showGuide() {
            if (!this.GuideContainer) {
                this.GuideContainer = new Laya.Sprite();
                this.GuideContainer.zOrder = 100;
                this.GuideContainer.cacheAs = "bitmap";
                this.GuideContainer.mouseEnabled = false;
                this.owner.addChild(this.GuideContainer);
            }
        }
        InstanceguideByPos(img, rect) {
            this.GuideContainer.destroyChildren();
            let _pos = img.localToGlobal(new Laya.Point((img.width || 0) / 2, (img.height || 0) / 2));
            let _rect = rect || new Laya.Vector2(100, 100);
        }
        ShowName(index) {
            let _lblName = this.NameBg.getChildByName("Name_" + index);
            _lblName.visible = true;
        }
        HideName() {
            for (let i = 0; i < this.NameBg.numChildren; i++) {
                let _lblName = this.NameBg.getChildByName("Name_" + i);
                _lblName.visible = false;
            }
        }
        InitName(arg) {
            let index = arg.index;
            let _pos = arg._pos;
            let name = arg.name;
            let outPos = new Laya.Vector4(0, 0, 0, 0);
            SceneLogic.inst.Camera_Match.viewport.project(_pos, SceneLogic.inst.Camera_Match.projectionViewMatrix, outPos);
            let _lblName = this.NameBg.getChildByName("Name_" + index);
            _lblName.text = name;
            if (index == 1 || index == 3) {
                _lblName.pos((outPos.x + (index - 2) * 30) / Laya.stage.clientScaleX, (outPos.y - 340) / Laya.stage.clientScaleY);
            }
            else if (index == 5) {
                _lblName.pos((outPos.x - 2) / Laya.stage.clientScaleX, (outPos.y - 280) / Laya.stage.clientScaleY);
            }
            else {
                _lblName.pos((outPos.x) / Laya.stage.clientScaleX, (outPos.y - 340) / Laya.stage.clientScaleY);
            }
            _lblName.visible = false;
        }
    }

    var ADConfig = zs.laya.platform.ADConfig;
    var PlatformMgr = zs.laya.platform.PlatformMgr;
    class NativeAd extends Laya.Script {
        constructor() {
            super();
            this.adImage = null;
            this.adView = null;
            this.adDesc = null;
            this.adId = null;
            this.adUnit = null;
            this.isClick = false;
            this.subAnimDuaration = 0;
            this.rotOffset = 10;
        }
        onAwake() {
            super.onAwake();
            this.adView = this.owner;
            this.adView.visible = false;
            this.adImage = this.adView.getChildByName("icon");
            this.adDesc = this.adView.getChildByName("name");
            this.adImage.on(Laya.Event.CLICK, this, this.onClickAd);
            this.subAnimDuaration = 500 / (4 * 2);
            this.initView();
        }
        onDisable() {
            super.onDisable();
            Laya.stage.off(PlatformMgr['APP_SHOW'], this, this.onClickBack);
        }
        onEnable() {
            super.onEnable();
        }
        initView() {
            if (ADConfig.isPublicVersion() && !zs.laya.platform.PlatformMgr['isInOneMin']) {
                this.adUnit = ADConfig['zs_native_adunit_icon'];
                zs.laya.sdk.SdkService['initNativeAd'](this.adUnit, Laya.Handler.create(this, this.onAdError));
                zs.laya.sdk.SdkService['loadNativeAd'](Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
                Laya.stage.once(PlatformMgr['APP_SHOW'], this, this.onClickBack);
            }
        }
        onClickBack() {
            if (this.isClick) {
                this.isClick = false;
                this.initView();
            }
        }
        onAdError(err) {
            this.adView.visible = false;
            console.error("err", err);
        }
        onAdLoaded(data) {
            var adData = data.adList[0];
            var url = adData.icon;
            this.adId = adData.adId;
            this.adImage.loadImage(url);
            this.adDesc.text = adData.title;
            this.adView.visible = true;
            zs.laya.sdk.SdkService["reportNativeAdShow"](this.adId);
            this.owner.timerLoop(4000, this, this.playShakeAnim, [0]);
        }
        onClickAd() {
            this.isClick = true;
            zs.laya.sdk.SdkService["reportNativeAdClick"](this.adId);
        }
        closeView() {
            this.adView.visible = false;
        }
        playShakeAnim(idx) {
            if (idx / 4 >= 2) {
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
                    Laya.Tween.to(uiComp, { rotation: this.rotOffset }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
                case 3:
                    Laya.Tween.to(uiComp, { rotation: 0 }, this.subAnimDuaration, Laya.Ease.linearNone, Laya.Handler.create(this, this.playShakeAnim, [idx + 1]));
                    break;
            }
        }
    }

    var ADConfig$1 = zs.laya.platform.ADConfig;
    var PlatformMgr$1 = zs.laya.platform.PlatformMgr;
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
            this.isResultView = false;
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
            this.confirmBtnDesc.on(Laya.Event.CLICK, this, this.openAdAndCloseView);
            Laya.stage.on("show_native", this, this.initView, [true]);
        }
        onDisable() {
        }
        onEnable() {
            super.onEnable();
            this.owner.visible = false;
        }
        initView(isResultView) {
            this.closeBtnBg.visible = this.closeBtn.visible = false;
            this.adView.visible = false;
            console.error(ADConfig$1['isBeforeGameAccount'](), zs.laya.platform.PlatformMgr['isInOneMin']);
            if (ADConfig$1['isBeforeGameAccount']() && zs.laya.platform.ADConfig.isPublicVersion() && !zs.laya.platform.PlatformMgr['isInOneMin']) {
                this.adUnit = ADConfig$1['zs_native_adunit'];
                zs.laya.sdk.SdkService['initNativeAd'](this.adUnit, Laya.Handler.create(this, this.onAdError));
                zs.laya.sdk.SdkService['loadNativeAd'](Laya.Handler.create(this, this.onAdLoaded), Laya.Handler.create(this, this.onAdError));
            }
            if (isResultView) {
                this.isResultView = true;
            }
        }
        onDestroy() {
            this.adImage.off(Laya.Event.CLICK, this, this.onClickAd);
            this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
            this.confirmBtn.off(Laya.Event.CLICK, this, this.openAdAndCloseView);
            Laya.stage.off("show_native", this, this.initView);
        }
        onShowCloseBtn() {
            this.closeBtnBg.visible = this.closeBtn.visible = true;
        }
        onAdError(err) {
            if (this.closed == false) {
                this.closed = true;
                this.closeView();
            }
        }
        onAdLoaded(data) {
            if (ADConfig$1['isBeforeGameOver']) {
                ADConfig$1.updateReviveTypeInfo(ADConfig$1['zs_native_adunit'] + "game_num");
            }
            var adData = data.adList[0];
            var url = adData.imgUrlList[0];
            this.adId = adData.adId;
            Laya.loader.load(url, Laya.Handler.create(this, function (texture) {
                this.adImage.texture = texture;
            }));
            this.adDesc.text = adData.desc;
            var btnText;
            if (ADConfig$1['zs_native_click_switch']) {
                btnText = ADConfig$1['zs_native_btn_text'] ? ADConfig$1['zs_native_btn_text'] : adData.clickBtnTxt;
            }
            else {
                btnText = "点击跳过";
            }
            this.confirmBtnDesc.text = btnText;
            PlatformMgr$1['sendReqAdShowReport'](this.adUnit, this.adId);
            ADConfig$1['zs_native_lsat_showTime'] = Laya.Browser.now();
            ADConfig$1.updateReviveTypeInfo(ADConfig$1['zs_native_adunit'] + "open_native_num");
            console.log("广告id:" + this.adUnit + " 是否显示广告：" + ADConfig$1['zs_ad_report_status'][this.adUnit]);
            if (ADConfig$1['zs_ad_report_status'][this.adUnit] == undefined || ADConfig$1['zs_ad_report_status'][this.adUnit]) {
                this.adView.visible = true;
                this.closeBtnBg.visible = this.closeBtn.visible = false;
                if (ADConfig$1.zs_switch && ADConfig$1.zs_jump_time > 0) {
                    Laya.timer.once(ADConfig$1.zs_jump_time, this, this.onShowCloseBtn);
                }
                else {
                    this.closeBtnBg.visible = this.closeBtn.visible = true;
                }
                if (ADConfig$1['zs_native_touch_switch']) {
                    this.closeBtn.width = this.closeBtn.height = 24;
                }
                if (this.isResultView) {
                    if (ADConfig$1.zs_gameover_button_switch) {
                        this.confirmBtnDesc.y = 814;
                        this.confirmBtn.visible = false;
                    }
                    else {
                        this.confirmBtnDesc.y = 178;
                        this.confirmBtn.visible = true;
                    }
                }
            }
        }
        onClickAd() {
            PlatformMgr$1['sendReqAdClickReport'](this.adUnit, this.adId);
            Laya.stage.once(PlatformMgr$1['APP_SHOW'], this, this.closeView);
        }
        closeView() {
            this.adView.visible = false;
        }
        openAdAndCloseView() {
            if (ADConfig$1['zs_native_click_switch']) {
                Laya.SoundManager.playSound(PlatformMgr$1['clickSound']);
                PlatformMgr$1['sendReqAdClickReport'](this.adUnit, this.adId);
                Laya.stage.once(PlatformMgr$1['APP_SHOW'], this, this.closeView);
            }
            else {
                this.closeView();
            }
        }
    }

    class GetPage extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this._isClick = false;
            this._isCheck = true;
        }
        onAwake() {
            super.onAwake();
            this.btnGet = this.owner.getChildByName("btnGet");
            this.btnGet.visible = false;
            this.btnVideo = this.owner.getChildByName("btnVideo");
            this.btnVideo.visible = false;
            this.RolePos = this.owner.getChildByName("RolePos");
            this.btnTry = this.owner.getChildByName("btnTry");
            this.btnTry.visible = false;
            this.btnUnLock = this.owner.getChildByName("btnUnLock");
            this.btnUnLock.visible = false;
            this.unlockImg = this.btnUnLock.getChildByName("unlockImg");
            this.btnCheck = this.owner.getChildByName("btnCheck");
            this.check = this.btnCheck.getChildByName("check");
            this.btnCheck.visible = false;
            this.btnGo = this.owner.getChildByName("btnGo");
            this.btnGo.visible = false;
            this.skinInfo = this.owner.getChildByName("skinInfo");
            this.skinInfo.visible = false;
            this.skinName = this.skinInfo.getChildByName("skinName");
            this.blood = this.skinInfo.getChildByName("blood");
            this.speed = this.skinInfo.getChildByName("speed");
            this.gold = this.owner.getChildByName("gold");
            this.gold.visible = false;
            this.diamond = this.owner.getChildByName("diamond");
            this.diamond.visible = false;
            this.lblgold = this.gold.getChildByName("qipao").getChildByName("bg").getChildByName("lblgold");
            this.lbldiamond = this.diamond.getChildByName("qipao").getChildByName("bg").getChildByName("lbldiamond");
            this.skin = this.owner.getChildByName("skin");
            this.skin.visible = false;
            this.prefabImg = this.skin.getChildByName("qipao").getChildByName("bg").getChildByName("prefabImg");
            this.prefabName = this.skin.getChildByName("qipao").getChildByName("bg").getChildByName("prefabName");
            this.fragment = this.owner.getChildByName("fragment");
            this.fragment.visible = false;
            this.fragmentImg = this.fragment.getChildByName("qipao").getChildByName("bg").getChildByName("fragmentImg");
            this.fragmentName = this.fragment.getChildByName("qipao").getChildByName("bg").getChildByName("fragmentName");
            this.AddEvent();
        }
        showButton() {
            if (this.gold.visible) {
                let ani = this.owner["goldAni"];
                ani.play(0, true);
            }
            if (this.diamond.visible) {
                let ani = this.owner["diamondAni"];
                ani.play(0, true);
            }
            if (this.skin.visible) {
                let ani = this.owner["skinAni"];
                ani.play(0, true);
            }
            if (this.fragment.visible) {
                let ani = this.owner["fragmentAni"];
                ani.play(0, true);
            }
            this.btnVideo.scale(0, 0);
            this.btnVideo.visible = true;
            Laya.Tween.to(this.btnVideo, { scaleX: 0.8, scaleY: 0.8 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.showGetButton));
        }
        showGetButton() {
            let complete = () => {
                this.btnGet.scale(0, 0);
                this.btnGet.visible = true;
                Laya.Tween.to(this.btnGet, { scaleX: 0.8, scaleY: 0.8 }, 300, Laya.Ease.backOut);
            };
            let ADConfig = zs.laya.platform.ADConfig;
            if (ADConfig.zs_switch && ADConfig.zs_jump_time > 0) {
                Laya.timer.once(ADConfig.zs_jump_time, this, () => {
                    complete && complete();
                });
            }
            else {
                complete && complete();
            }
        }
        setMoney(arg) {
            this.userData = arg;
            this.lblgold.text = arg.gold || "";
            this.lbldiamond.text = arg.diamond || "";
            if (!arg.gold || !arg.diamond) {
                this.gold.centerX = 0;
                this.diamond.centerX = 0;
                this.gold.visible = (arg.gold && arg.gold != 0);
                this.diamond.visible = (arg.diamond && arg.diamond != 0);
                let _tweenTime = 600;
                if (arg.fragment && arg.fragment.fragmentCount > 0) {
                    this.gold.centerX = -150;
                    this.gold.centerY = -37;
                    this.diamond.centerX = -150;
                    this.diamond.centerY = -37;
                    this.fragment.visible = true;
                    this.fragmentName.text = arg.fragment.fragmentName + "*" + arg.fragment.fragmentCount;
                    this.fragmentImg.skin = arg.fragment.fragmentImg;
                    this.fragment.scale(0, 0);
                    if (this.gold.visible || this.diamond.visible) {
                        _tweenTime = 900;
                        this.fragment.centerX = 148;
                        this.fragment.centerY = -72;
                    }
                    Laya.timer.once(_tweenTime, this, () => {
                        SoundMgr.inst.playSound("prop_02");
                        Laya.Tween.to(this.fragment, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                }
                Laya.timer.once(_tweenTime + 200, this, this.showButton);
                if (this.gold.visible) {
                    this.gold.scale(0, 0);
                    Laya.timer.once(600, this, () => {
                        SoundMgr.inst.playSound("prop_01");
                        Laya.Tween.to(this.gold, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                }
                else if (this.diamond.visible) {
                    this.diamond.scale(0, 0);
                    Laya.timer.once(600, this, () => {
                        SoundMgr.inst.playSound("prop_01");
                        Laya.Tween.to(this.diamond, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                }
                if (arg.skinId && arg.skinId > 0) {
                    Laya.timer.clearAll(this);
                    SceneLogic.inst.ShowRole(this.RolePos);
                    let _data = UserComData.ShopRoleData[arg.skinId];
                    SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
                    this.skinName.skin = UserComData.ShopRoleData[arg.skinId].roleName;
                    this.blood.text = UserComData.ShopRoleData[arg.skinId].level["1"].blood;
                    this.speed.text = UserComData.ShopRoleData[arg.skinId].level["1"].speed;
                    this.skinInfo.visible = true;
                    if (arg.islottery && arg.islottery == 1) {
                        this.btnGo.visible = true;
                    }
                    else {
                        this.btnUnLock.visible = true;
                        this.btnCheck.visible = true;
                        this.ChangeCheck();
                    }
                }
            }
            else {
                this.gold.visible = true;
                this.diamond.visible = true;
                this.gold.scale(0, 0);
                this.diamond.scale(0, 0);
                if (!arg.fragment || arg.fragment.fragmentCount <= 0) {
                    Laya.timer.once(600, this, () => {
                        SoundMgr.inst.playSound("prop_01");
                        Laya.Tween.to(this.gold, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                    Laya.timer.once(900, this, () => {
                        SoundMgr.inst.playSound("prop_02");
                        Laya.Tween.to(this.diamond, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.showButton));
                    });
                }
                else {
                    this.gold.centerX = -303;
                    this.gold.centerY = -14;
                    this.diamond.centerX = 0;
                    this.diamond.centerY = -54;
                    this.fragment.centerX = 303;
                    this.fragment.centerY = -87;
                    Laya.timer.once(600, this, () => {
                        SoundMgr.inst.playSound("prop_01");
                        Laya.Tween.to(this.gold, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                    Laya.timer.once(900, this, () => {
                        SoundMgr.inst.playSound("prop_02");
                        Laya.Tween.to(this.diamond, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut);
                    });
                    this.fragment.visible = true;
                    this.fragmentName.text = arg.fragment.fragmentName + arg.fragment.fragmentCount;
                    this.fragmentImg.skin = arg.fragment.fragmentImg;
                    this.fragment.scale(0, 0);
                    Laya.timer.once(1200, this, () => {
                        SoundMgr.inst.playSound("prop_03");
                        Laya.Tween.to(this.fragment, { scaleX: 0.7, scaleY: 0.7 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.showButton));
                    });
                }
            }
        }
        AddEvent() {
            Laya.stage.on("getMoney", this, this.setMoney);
            this.btnVideo.on(Laya.Event.CLICK, this, this.VideoGet);
            this.btnGet.on(Laya.Event.CLICK, this, this.close);
            this.btnTry.on(Laya.Event.CLICK, this, this.TrySKin);
            this.btnUnLock.on(Laya.Event.CLICK, this, this.UnLockSKin);
            this.btnCheck.on(Laya.Event.CLICK, this, this.ChangeCheck);
            this.btnGo.on(Laya.Event.CLICK, this, this.goRolePage);
        }
        goRolePage() {
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("获得永久皮肤", "获得永久皮肤"));
            UserComData.PlayerSKinInfo.unlockRoleList.push(this.userData.skinId);
            UserComData.PlayerSKinInfo.buyFragmentList.push(this.userData.skinId);
            UserComData.PlayerSKinInfo.buyFragmentState.push(1);
            RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
            this.close();
            SceneLogic.inst.closeRole();
            Laya.stage.event("goRole");
        }
        ChangeCheck() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(200, this, () => {
                this._isClick = null;
            });
            this._isCheck = !this._isCheck;
            this.check.visible = this._isCheck;
            this.unlockImg.skin = this._isCheck ? "role/font_63.png" : "game/font_91.png";
        }
        close() {
            SoundMgr.inst.playSound("click");
            Laya.stage.event("closePage");
            Laya.Scene.close("view/game/GetPage.scene");
        }
        TrySKin() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("签到皮肤试用一次按钮点击", "签到皮肤试用一次按钮点击"));
            UserComData.RoletrySkinId = this.userData.skinId;
            RequestMgr.UpdatePlayerByKey("RoletrySkinId", UserComData.RoletrySkinId.toString());
            SceneLogic.inst.closeRole();
            this.close();
            EventMgr.inst.emit("TrySkinStartGame");
        }
        UnLockSKin() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (this._isCheck) {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频永久领取皮肤按钮点击", "视频永久领取皮肤按钮点击"));
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("获得永久皮肤", "获得永久皮肤"));
                    UserComData.PlayerSKinInfo.unlockRoleList.push(this.userData.skinId);
                    UserComData.PlayerSKinInfo.buyFragmentList.push(this.userData.skinId);
                    UserComData.PlayerSKinInfo.buyFragmentState.push(1);
                    RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
                    this.close();
                    SceneLogic.inst.closeRole();
                    EventMgr.inst.emit("ShowRolePrefab");
                }), Laya.Handler.create(this, function () {
                    zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                }), Laya.Handler.create(this, function () {
                }));
            }
            else {
                UserComData.userGold += 500;
                RequestMgr.UpdatePlayerByKey("userGold", UserComData.userGold.toString());
                this.close();
                SceneLogic.inst.closeRole();
                EventMgr.inst.emit("ShowRolePrefab");
            }
        }
        VideoGet() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("领取成功");
                this.GetAgain();
                this.close();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        GetAgain() {
            if (this.userData.gold) {
                UserComData.userGold += this.userData.gold;
            }
            if (this.userData.diamond) {
                UserComData.userDiamond += this.userData.diamond;
            }
            if (this.userData.fragment && this.userData.fragment.fragmentCount > 0) {
                if (this.userData.fragment.type == 1) {
                    UserComData.PlayerSKinInfo.RoleSkinFragmentCount[this.userData.fragment.id] += this.userData.fragment.fragmentCount;
                }
                else if (this.userData.fragment.type == 2) {
                    UserComData.PlayerSKinInfo.BossSkinFragmentCount[this.userData.fragment.id] += this.userData.fragment.fragmentCount;
                }
            }
            RequestMgr.UpdatePlayerAny({
                "userDiamond": UserComData.userDiamond.toString(),
                "userGold": UserComData.userGold.toString(),
                "PlayerSKinInfo": UserComData.PlayerSKinInfo
            });
        }
        RemoveEvent() {
            Laya.stage.off("getMoney", this, this.setMoney);
            this.btnVideo.off(Laya.Event.CLICK, this, this.VideoGet);
            this.btnGet.off(Laya.Event.CLICK, this, this.close);
            this.btnTry.off(Laya.Event.CLICK, this, this.TrySKin);
            this.btnUnLock.off(Laya.Event.CLICK, this, this.UnLockSKin);
            this.btnCheck.off(Laya.Event.CLICK, this, this.ChangeCheck);
            this.btnGo.off(Laya.Event.CLICK, this, this.goRolePage);
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class GuidePageUI extends zs.laya.base.ZhiSeView {
        constructor() { super(); }
        onAwake() {
            super.onAwake();
            this.AddEvent();
        }
        AddEvent() {
            Laya.stage.on("showGuide", this, this.showGuide);
            Laya.stage.on("hideGuide", this, this.close);
        }
        showGuide(name) {
            this._node = this.owner.getChildByName(name);
            this._node.width = Laya.stage.width;
            this._node.height = Laya.stage.height;
            this._node.visible = true;
            if (name === "move") {
                let img_mobile = this._node.getChildByName("img_moveguide").getChildByName("img_mobile");
                let img_pc = this._node.getChildByName("img_moveguide").getChildByName("img_pc");
                img_mobile.visible = Laya.Browser.onMobile;
                img_pc.visible = Laya.Browser.onPC;
            }
        }
        close() {
            console.log("关闭引导界面");
            this._node.visible = false;
            Laya.Scene.close("view/game/GuidePage.scene");
            this.RemoveEvent();
        }
        RemoveEvent() {
            Laya.stage.off("showGuide", this, this.showGuide);
            Laya.stage.off("hideGuide", this, this.close);
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class LotteryPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.itemTable = [];
            this.lastIndx = null;
            this._isClick = false;
            this.curIndex = -1;
        }
        onAwake() {
            super.onAwake();
            this.bgAni = this.owner.getChildByName("bgAni");
            this.lotteryMask = this.owner.getChildByName("lotteryMask");
            this.lotteryMask.visible = false;
            this.btnClose = this.owner.getChildByName("btnClose");
            this.lotteryBg = this.owner.getChildByName("lotteryBg");
            this.btnLottery = this.owner.getChildByName("btnLottery");
            this.frist = this.lotteryBg.getChildByName("item3").getChildByName("frist");
            this.frist.visible = UserComData.LotteryCount <= 1;
            this.frist.skin = UserComData.LotteryCount == 0 ? "" : "role/icon_luck_04.png";
            this.btnLottery.skin = (UserComData.curDayLotteryCount == 0 || UserComData.winFreeLottery == 1) ? "lucky/btn_04_01.png" : "lucky/btn_04.png";
            this.btnLottery.getChildByName("tips").visible = UserComData.curDayLotteryCount == 0;
            this.rolePos = this.owner.getChildByName("rolePos");
            this.itemTable = [];
            for (let i = 1; i <= 7; i++) {
                let uiObj1 = this.lotteryBg.getChildByName("item" + i);
                let item = {
                    uiObj: uiObj1,
                    select: uiObj1.getChildByName("select"),
                    icon: uiObj1.getChildByName("icon"),
                    desc: uiObj1.getChildByName("desc"),
                };
                item.select.visible = false;
                if (i == 7) {
                    SceneLogic.inst.closeRole();
                    item.icon.visible = false;
                    Laya.timer.once(1500, this, () => {
                        SceneLogic.inst.showSignRole(this.rolePos, "lotteryGirl", 2.6);
                    });
                }
                this.itemTable.push(item);
            }
            this.Show();
            this.AddEvent();
        }
        LotteryClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this.lotteryMask.visible = true;
            SoundMgr.inst.playSound("click");
            if (UserComData.curDayLotteryCount == 0 || UserComData.winFreeLottery == 1) {
                UserComData.winFreeLottery = 0;
                Laya.LocalStorage.setItem("winFreeLottery", UserComData.winFreeLottery.toString());
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("免费抽奖按钮点击", "免费抽奖按钮点击"));
                this.lotteryMask.visible = true;
                if (UserComData.LotteryCount < 7) {
                    this.curIndex = UserComData.FristLottery[UserComData.LotteryCount];
                }
                else {
                    this.curIndex = Utils.Range(0, 6);
                }
                this.Animation();
            }
            else {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频抽奖按钮点击", "视频抽奖按钮点击"));
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    this.lotteryMask.visible = true;
                    if (UserComData.LotteryCount < 7) {
                        this.curIndex = UserComData.FristLottery[UserComData.LotteryCount];
                    }
                    else {
                        this.curIndex = Utils.Range(0, 6);
                    }
                    this.Animation();
                }), Laya.Handler.create(this, function () {
                    this.lotteryMask.visible = false;
                    zs.laya.game.UIService.showToast("看完视频才可抽取奖励哦~~");
                }), Laya.Handler.create(this, function () {
                    this.lotteryMask.visible = false;
                }));
            }
        }
        Animation() {
            let targetIndex = this.curIndex;
            let force = 21;
            let index = 0;
            let slowDown = 7;
            let yieldTime = 0.05 * 1000;
            let currTime = 0;
            Laya.timer.frameLoop(1, this, () => {
                currTime += Laya.timer.delta;
                if (currTime >= yieldTime) {
                    currTime = 0;
                    index = index >= 7 ? (index - 7) : index;
                    if (force <= 0 && targetIndex != null) {
                        if (slowDown > 0) {
                            yieldTime = (0.05 + (7 - slowDown) * 0.01) * 2000;
                            slowDown = slowDown - 1;
                        }
                        else {
                            if (index == targetIndex) {
                                Laya.timer.clearAll(this);
                                this.ShowResult(index);
                            }
                            else {
                                if (index == targetIndex - 1) {
                                    yieldTime = 700;
                                }
                            }
                        }
                    }
                    else {
                        yieldTime = 0.05 * 1000;
                    }
                    this.UpdataItem(index);
                    index = index + 1;
                    force = force - 1;
                }
            });
        }
        UpdataItem(index) {
            SoundMgr.inst.playSound("turn");
            let item = this.itemTable[index];
            let selectImg = item.select;
            selectImg.visible = true;
            let lastItem = this.itemTable[this.lastIndx];
            if (lastItem) {
                let lastSelectImg = lastItem.select;
                lastSelectImg.visible = false;
            }
            this.lastIndx = index;
        }
        ShowResult(index) {
            let data = UserComData.LotteryData[index];
            let item = this.itemTable[index];
            Laya.Tween.to(item.select, { alpha: 0 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(item.select, { alpha: 1 }, 100, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(item.select, { alpha: 0 }, 100, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(item.select, { alpha: 1 }, 100, null, Laya.Handler.create(this, () => {
                            SoundMgr.inst.playSound("stop");
                        }));
                    }));
                }));
            }));
            Laya.timer.once(1500, this, () => {
                let _skin;
                let _gold = 0;
                let _diamond = 0;
                let _fragmentName = "";
                let _fragmentImg = "";
                let _fragmentCount = 0;
                let _skinId = 0;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("抽奖奖励获得埋点", "抽奖奖励获得埋点"));
                UserComData.LotteryCount++;
                UserComData.curDayLotteryCount++;
                this.btnLottery.getChildByName("tips").visible = UserComData.curDayLotteryCount == 0;
                this.btnLottery.skin = UserComData.curDayLotteryCount == 0 ? "lucky/btn_04_01.png" : "lucky/btn_04.png";
                if (data.type == 1) {
                    _gold = data.count;
                    UserComData.userGold += _gold;
                }
                else if (data.type == 2) {
                    _diamond = data.count;
                    UserComData.userDiamond += _diamond;
                }
                else if (data.type == 3) {
                    if (UserComData.LotteryCount <= 7) {
                        _skinId = data.skinId;
                        SceneLogic.inst.closeRole();
                    }
                    else {
                        _fragmentName = UserComData.ShopRoleData[data.skinId].fragmentName;
                        _fragmentImg = UserComData.ShopRoleData[data.skinId].fragmentImg;
                        _fragmentCount = 50;
                        UserComData.PlayerSKinInfo.RoleSkinFragmentCount[data.skinId] += _fragmentCount;
                    }
                }
                RequestMgr.UpdatePlayerAny({
                    "userDiamond": UserComData.userDiamond.toString(),
                    "userGold": UserComData.userGold.toString(),
                    "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                    "LotteryCount": UserComData.LotteryCount.toString(),
                    "curDayLotteryCount": UserComData.curDayLotteryCount.toString()
                });
                Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getMoney", { islottery: 1, gold: _gold, diamond: _diamond, skinId: _skinId, fragment: { type: 1, id: data.skinId, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentCount: _fragmentCount } });
                    this.frist.visible = UserComData.LotteryCount <= 1;
                    this.frist.skin = UserComData.LotteryCount == 0 ? "lucky/icon_luck_02.png" : "role/icon_luck_04.png";
                    this.lotteryMask.visible = false;
                }));
            });
        }
        Show() {
            for (let i = 0; i < this.itemTable.length; i++) {
                let v = this.itemTable[i];
                v.select.visible = false;
            }
        }
        AddEvent() {
            this.btnLottery.on(Laya.Event.CLICK, this, this.LotteryClick);
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.lotteryMask.on(Laya.Event.CLICK, this, () => {
                console.log("正在抽奖");
            });
            EventMgr.inst.onEvent("ShowRolePrefab", this, this.ShowRolePrefab);
            EventMgr.inst.onEvent("TrySkinStartGame", this, this.close);
        }
        RemoveEvent() {
            this.btnLottery.off(Laya.Event.CLICK, this, this.LotteryClick);
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.lotteryMask.off(Laya.Event.CLICK, this, () => {
                console.log("正在抽奖");
            });
            EventMgr.inst.onOffEvent("ShowRolePrefab", this, this.ShowRolePrefab);
            EventMgr.inst.onOffEvent("TrySkinStartGame", this, this.close);
        }
        ShowRolePrefab() {
            SceneLogic.inst.showSignRole(this.rolePos, "lotteryGirl", 2.6);
        }
        ChangeTipState(name) {
            if (UserComData.RoleTipsList[name] == 0) {
                UserComData.RoleTipsList[name] = 1;
                this.UpdateTipTabel();
            }
        }
        UpdateTipTabel() {
            for (let i = 0; i < UserComData.RoleTipsName.length; i++) {
                const element = UserComData.RoleTipsName[i];
                let _button = this[element];
                _button.getChildByName("tips").visible = UserComData.RoleTipsList[element] == 0;
            }
            Laya.LocalStorage.setItem("RoleTipsList", JSON.stringify(UserComData.RoleTipsList));
        }
        close() {
            SoundMgr.inst.playSound("click");
            SceneLogic.inst.closeRole();
            Laya.Scene.close("view/game/LotteryPage.scene");
            Laya.stage.event("closePage");
        }
        onEnable() {
            super.onEnable();
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class LuckyBoxPage extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
        }
        onAwake() {
            super.onAwake();
            this.btn_get.on(Laya.Event.CLICK, this, this.getAward);
            this.btn_drop.on(Laya.Event.CLICK, this, this.closeView);
        }
        onStart() {
            super.onStart();
        }
        onEnable() {
            super.onEnable();
            LuckyBoxPage.isOpen = true;
            zs.laya.sdk.SdkService.showBanner();
        }
        onDisable() {
            super.onDisable();
            this.btn_get.off(Laya.Event.CLICK, this, this.getAward);
            this.btn_drop.off(Laya.Event.CLICK, this, this.closeView);
            zs.laya.sdk.SdkService.hideBanner();
        }
        getAward() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, () => {
                let gold = Math.floor(Math.random() * 190 + 10);
                UserComData.userGold += gold;
                Laya.LocalStorage.setItem("userGold", UserComData.userGold.toString());
                zs.laya.game.UIService.showToast("恭喜获得" + gold + "猫爪币");
                this.closeView();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可获取奖励~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        closeView() {
            LuckyBoxPage.isOpen = false;
            this.owner.close();
        }
    }
    LuckyBoxPage.isOpen = false;

    class LuckyPage extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.AngleArea = [
                { "min": -25, "max": 25 },
                { "min": 35, "max": 85 },
                { "min": 95, "max": 145 },
                { "min": 155, "max": 205 },
                { "min": 215, "max": 265 },
                { "min": 275, "max": 325 },
            ];
            this.RandomList = [];
        }
        onAwake() {
            super.onAwake();
            this.luckyBg = this.owner.getChildByName("luckyBg");
            this.luckyCount = this.owner.getChildByName("luckyCount");
            this._ani = this.luckyBg.getChildByName("_ani");
            this._ani.visible = false;
            this.btnClose = this.owner.getChildByName("btnClose");
            this.btnLucky = this.owner.getChildByName("btnLucky");
            this.icon = this.btnLucky.getChildByName("icon");
            this.LuckyMask = this.owner.getChildByName("LuckyMask");
            this.LuckyMask.visible = false;
            this.GetWindow = this.owner.getChildByName("GetWindow");
            this.GetWindow.visible = false;
            this.gift = this.GetWindow.getChildByName("gift");
            this.btnGet = this.GetWindow.getChildByName("btnGet");
            this.desc = this.GetWindow.getChildByName("desc");
            this.setLuckyData();
            this.AddEvent();
        }
        setLuckyData() {
            this.RandomList = [];
            this.luckyBg.rotation = 0;
            if (UserComData.LuckyCount < 2) {
                this.icon.skin = "lucky/font_28.png";
            }
            else {
                this.icon.skin = "lucky/font_29.png";
            }
            this.luckyCount.text = UserComData.LuckyCount + 1 + "";
            let index = UserComData.LuckyCount > 2 ? 2 : UserComData.LuckyCount;
            for (let i = 0; i < UserComData.LuckyData[index].length; i++) {
                let _data = UserComData.LuckyData[index][i];
                let cell = this.luckyBg.getChildByName("item" + (i + 1));
                let count = cell.getChildByName("count");
                let K = count.getChildByName("K");
                K.visible = false;
                if (index == 2) {
                    cell.width = 100;
                    cell.height = 100;
                    count.visible = false;
                }
                cell.skin = this.GetIcon(_data.type);
                if (_data.count < 1000) {
                    count.text = _data.count + "";
                    count.centerX = 0;
                }
                else {
                    count.text = _data.count / 1000 + "";
                    K.visible = true;
                    count.centerX = -10;
                }
                for (let j = 0; j < _data.probability; j++) {
                    this.RandomList.push({
                        type: _data.type,
                        count: _data.count,
                        Position: i
                    });
                }
            }
        }
        GetIcon(type) {
            let icon = "";
            if (type == 1) {
                icon = "lucky/icon_coin.png";
            }
            else if (type == 2) {
                icon = "lucky/icon_dimo.png";
            }
            else if (type == 3) {
                icon = "lucky/icon_shop_gift_00.png";
            }
            else if (type == 4) {
                icon = "lucky/icon_shop_gift_01.png";
            }
            else if (type == 5) {
                icon = "lucky/icon_shop_gift_02.png";
            }
            else if (type == 6) {
                icon = "lucky/icon_shop_gift_03.png";
            }
            else if (type == 7) {
                icon = "lucky/icon_shop_gift_04.png";
            }
            else if (type == 8) {
                icon = "lucky/icon_shop_gift_05.png";
            }
            return icon;
        }
        AddEvent() {
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.btnLucky.on(Laya.Event.CLICK, this, this.LuckyClick);
            this.btnGet.on(Laya.Event.CLICK, this, this.CloseGetWindow);
            this.LuckyMask.on(Laya.Event.CLICK, this, () => {
            });
        }
        RemoveEvent() {
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.btnLucky.off(Laya.Event.CLICK, this, this.LuckyClick);
            this.btnGet.off(Laya.Event.CLICK, this, this.CloseGetWindow);
            this.LuckyMask.off(Laya.Event.CLICK, this, () => {
            });
        }
        LuckyClick() {
            if (UserComData.LuckyCount >= 5) {
                zs.laya.game.UIService.showToast(`今日视频抽奖次数已用完~`);
                return;
            }
            SoundMgr.inst.playSound("click");
            this.LuckyMask.visible = true;
            if (UserComData.LuckyCount < 2) {
                let _ran = Utils.Range(0, 99);
                this.StartTurn(this.RandomList[_ran]);
            }
            else {
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    let _ran = Utils.Range(0, 99);
                    this.StartTurn(this.RandomList[_ran]);
                }), Laya.Handler.create(this, function () {
                    zs.laya.game.UIService.showToast("看完视频才可抽奖哦~~");
                    this.LuckyMask.visible = false;
                }), Laya.Handler.create(this, function () {
                    this.LuckyMask.visible = false;
                }));
            }
        }
        StartTurn(_ran) {
            let angle = Utils.Range(this.AngleArea[_ran.Position].min, this.AngleArea[_ran.Position].max);
            this.luckyBg.rotation = 0;
            let totalAngle = 1440 - angle;
            let perMsAngle = (totalAngle) / 160;
            let index = 1;
            let self = this;
            self.luckyBg.rotation = 0;
            self._ani.rotation = _ran.Position * 60;
            Laya.Tween.to(self.luckyBg, { rotation: totalAngle }, 3000, Laya.Ease.circOut, Laya.Handler.create(self, () => {
                self._ani.visible = true;
                Laya.timer.once(2000, self, () => {
                    self.luckyBg.rotation = totalAngle;
                    self.LuckyMask.visible = false;
                    UserComData.LuckyCount++;
                    let _gold = 0;
                    let _diamond = 0;
                    if (_ran.type == 1) {
                        UserComData.userGold += _ran.count;
                        _gold = _ran.count;
                    }
                    else if (_ran.type == 2) {
                        UserComData.userDiamond += _ran.count;
                        _diamond = _ran.count;
                    }
                    else {
                        UserComData.RefreshGiftData(_ran.type);
                        UserComData.userGold += UserComData.GiftData.gold;
                        UserComData.userDiamond += UserComData.GiftData.diamond;
                        _gold = UserComData.GiftData.gold;
                        _diamond = UserComData.GiftData.diamond;
                    }
                    RequestMgr.UpdatePlayerAny({
                        "userDiamond": UserComData.userDiamond.toString(),
                        "userGold": UserComData.userGold.toString(),
                        "LuckyCount": UserComData.LuckyCount.toString()
                    });
                    self._ani.visible = false;
                    Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(self, () => {
                        Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond });
                        this.CloseGetWindow();
                    }));
                });
            }));
        }
        OpenGetWindow(arg) {
            this.gift.skin = this.GetIcon(arg.type);
            this.desc.text = "x" + arg.count;
            this.GetWindow.visible = true;
        }
        CloseGetWindow() {
            SoundMgr.inst.playSound("click");
            this.setLuckyData();
        }
        close() {
            console.log("1111----");
            Laya.Scene.close("view/game/LuckyPage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class NoticePageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this._isClick = false;
        }
        onAwake() {
            super.onAwake();
            this.bg = this.owner.getChildByName("bg");
            this.btnClose = this.bg.getChildByName("btnClose");
            this.noticeList = this.bg.getChildByName("noticeList");
            this.noticeList.array = [0];
            this.noticeList.vScrollBarSkin = "";
            this.noticeList.renderHandler = new Laya.Handler(this, this.render);
            this.AddEvent();
        }
        render(cell, index) {
        }
        AddEvent() {
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
        }
        RemoveEvent() {
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
        }
        close() {
            SoundMgr.inst.playSound("click");
            Laya.stage.event("CheckSign");
            Laya.Scene.close("view/game/NoticePage.scene");
        }
        onEnable() {
            super.onEnable();
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class RankPageUI extends zs.laya.base.ZhiSeView {
        constructor() { super(); }
        onAwake() {
            super.onAwake();
            this.rankList.vScrollBarSkin = "";
            this.initRankRender();
            this.UpdatePlayerMoneny();
            this.AddEvent();
        }
        initRankRender() {
            let list = [];
            for (let i = 0; i < UserComData.rankData.length; i++) {
                list.push(0);
            }
            let nameList = UserComData.rankData[UserComData.rankInfo.rankId].rank.split("_");
            this.rank_img.skin = "game/icon_" + nameList[0] + ".png";
            this.rank_NameImg.skin = "game/title_" + nameList[0] + ".png";
            if (nameList.length > 1) {
                let cur = UserComData.rankData[UserComData.rankInfo.rankId].experience;
                let next = UserComData.rankData[(UserComData.rankInfo.rankId + 1)].experience;
                let value = (UserComData.rankInfo.rankScore - cur) / (next - cur);
                this.pro.width = value * 340;
                this.progress.text = (UserComData.rankInfo.rankScore - cur) + "/" + (next - cur);
                this.star_0.skin = Number(nameList[1]) > 0 ? "game/star_1.png" : "game/star_0.png";
                this.star_1.skin = Number(nameList[1]) > 1 ? "game/star_1.png" : "game/star_0.png";
                this.star_2.skin = Number(nameList[1]) > 2 ? "game/star_1.png" : "game/star_0.png";
            }
            else {
                this.star_0.visible = false;
                this.star_1.visible = false;
                this.star_2.visible = false;
                this.proBg.visible = false;
            }
            this.rankList.array = list;
            for (let i = 0; i < UserComData.rankInfo.rankGiftState.length; i++) {
                if (UserComData.rankInfo.rankGiftState[i] == 0 && UserComData.rankInfo.rankScore >= UserComData.rankData[i].experience) {
                    UserComData.rankInfo.rankGiftState[i] = 1;
                }
            }
            this.UpdateRankRender();
        }
        UpdatePlayerMoneny() {
            this.lblGold.text = UserComData.userGold + "";
            this.lblDiamond.text = UserComData.userDiamond + "";
        }
        UpdateRankRender() {
            this.rankList.refresh();
            this.rankList.renderHandler = new Laya.Handler(this, this.rankRender);
        }
        rankRender(cell, index) {
            let _data = UserComData.rankData[index];
            let rankBg = cell.getChildByName("rankBg");
            let rankDiamondBg = rankBg.getChildByName("rankDiamondBg");
            let rank_diamond = rankDiamondBg.getChildByName("rank_diamond");
            let rankGoldBg = rankBg.getChildByName("rankGoldBg");
            let rank_gold = rankGoldBg.getChildByName("rank_gold");
            let btnNo = rankBg.getChildByName("btnNo");
            let btnGet = rankBg.getChildByName("btnGet");
            let btnOver = rankBg.getChildByName("btnOver");
            let rank_name = rankBg.getChildByName("rank_name");
            let rank_0 = rank_name.getChildByName("rank_0");
            let rank_1 = rank_name.getChildByName("rank_1");
            let rank_2 = rank_name.getChildByName("rank_2");
            let rank_3 = rank_name.getChildByName("rank_3");
            let king = rankBg.getChildByName("king");
            rank_name.visible = true;
            king.visible = false;
            rank_0.visible = false;
            rank_1.visible = false;
            rank_2.visible = false;
            rank_3.visible = false;
            rankBg.skin = UserComData.rankInfo.rankScore >= _data.experience ? "game/bg_rank_tips_00.png" : "game/bg_rank_tips_01.png";
            rankGoldBg.centerX = _data.diamonds == 0 ? -83 : 50;
            rankDiamondBg.visible = _data.diamonds != 0;
            rankGoldBg.visible = _data.gold != 0;
            rank_diamond.text = _data.diamonds + "";
            rank_gold.text = _data.gold + "";
            btnNo.visible = UserComData.rankInfo.rankGiftState[index] == 0;
            btnGet.visible = UserComData.rankInfo.rankGiftState[index] == 1;
            btnOver.visible = UserComData.rankInfo.rankGiftState[index] == 2;
            let nameList = _data.rank.split("_");
            if (nameList.length > 1 && Number(nameList[1]) != 0) {
                rank_name.getChildByName("rank_" + nameList[1]).visible = true;
            }
            else {
                rank_name.visible = false;
                king.skin = "game/icon_" + nameList[0] + ".png";
                king.visible = true;
            }
            rank_name.text = UserComData.rankName[nameList[0]];
            btnGet.on(Laya.Event.CLICK, cell, () => {
                if (UserComData.rankInfo.rankGiftState[index] != 1)
                    return;
                UserComData.rankInfo.rankGiftState[index] = 2;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("段位奖励领取点击", "段位奖励领取点击"));
                let _gold = _data.gold;
                let _diamond = _data.diamonds;
                UserComData.userGold += _gold;
                UserComData.userDiamond += _diamond;
                this.UpdatePlayerMoneny();
                Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond });
                    RequestMgr.UpdatePlayerAny({
                        "userGold": UserComData.userGold.toString(),
                        "userDiamond": UserComData.userDiamond.toString(),
                        "rankInfo": UserComData.rankInfo
                    });
                    this.UpdateRankRender();
                }));
            });
        }
        AddEvent() {
            this.btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnShare.on(Laya.Event.CLICK, this, this.Share);
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
        }
        RemoveEvent() {
            this.btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnShare.off(Laya.Event.CLICK, this, this.Share);
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
        }
        GoldClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 1, count: 500 });
            }));
        }
        DiamondClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 2, count: 50 });
            }));
        }
        Share() {
        }
        close() {
            Laya.Scene.close("view/game/RankPage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class RankResultPageUI extends zs.laya.base.ZhiSeView {
        constructor() { super(); }
        onAwake() {
            super.onAwake();
            let nameList = UserComData.rankData[UserComData.rankInfo.rankId].rank.split("_");
            this.rank_img.skin = "game/icon_" + nameList[0] + ".png";
            this.rank_NameImg.skin = "game/title_" + nameList[0] + ".png";
            if (nameList.length > 1) {
                let cur = UserComData.rankData[UserComData.rankInfo.rankId].experience;
                let next = UserComData.rankData[(UserComData.rankInfo.rankId + 1)].experience;
                let value = (UserComData.rankInfo.rankScore - cur) / (next - cur);
                this.pro.width = value * 340;
                this.progress.text = (UserComData.rankInfo.rankScore - cur) + "/" + (next - cur);
            }
            else {
                this.star_0.visible = false;
                this.star_1.visible = false;
                this.star_2.visible = false;
            }
            Laya.Tween.to(this.bg, { scaleX: 1, scaleY: 1 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, () => {
                if (nameList.length > 1) {
                    if (Number(nameList[1]) > 0) {
                        let _ani = this.owner["star0"];
                        _ani.play(0, false);
                    }
                    if (Number(nameList[1]) > 1) {
                        let _ani = this.owner["star1"];
                        _ani.play(0, false);
                    }
                    if (Number(nameList[1]) > 2) {
                        let _ani = this.owner["star2"];
                        _ani.play(0, false);
                    }
                }
                Laya.timer.once(2500, this, () => {
                    this.close();
                });
            }));
            this.AddEvent();
        }
        setInfo(arg) {
            this.arg = arg;
        }
        AddEvent() {
            Laya.stage.on("getInfo", this, this.setInfo);
        }
        RemoveEvent() {
            Laya.stage.off("getInfo", this, this.setInfo);
        }
        close() {
            Laya.Scene.close("view/game/RankResultPage.scene");
            Laya.stage.event("closeRank", { diamond: this.arg.diamond, time: this.arg.time });
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class RolePageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.TagType = 1;
            this._isClick = false;
            this.headData = [];
            this.RoleUnLock = [];
            this.BossUnLock = [];
            this.curselectIndex = -1;
            this.boxInfoData = [];
            this._canForever = false;
            this.PlayAniTime = 0;
        }
        onAwake() {
            super.onAwake();
            this.TagType = UserComData.RolePageTagType;
            let goldBg = this.owner.getChildByName("goldBg");
            let fishBg = this.owner.getChildByName("fishBg");
            this.lblGold = goldBg.getChildByName("lblGold");
            this.lblDialond = fishBg.getChildByName("lblDialond");
            this.btnMoney_1 = goldBg.getChildByName("btnMoney_1");
            this.btnMoney_2 = fishBg.getChildByName("btnMoney_2");
            this.UpdatePlayerMoneny();
            this.btnClose = this.owner.getChildByName("btnClose");
            this.RoleList = this.owner.getChildByName("RoleList");
            this.RoleList.array = [];
            this.RoleList.renderHandler = new Laya.Handler(this, this.RoleRender);
            this.fragmentList = this.owner.getChildByName("fragmentList");
            this.fragmentList.array = [];
            this.fragmentList.renderHandler = new Laya.Handler(this, this.fragmentRender);
            this.fragmentSource = this.owner.getChildByName("fragmentSource");
            this.fragmentSource.visible = false;
            let _bg = this.fragmentSource.getChildByName("bg");
            this.goStart = _bg.getChildByName("goStart");
            this.goShop = _bg.getChildByName("goShop");
            this.goBox = _bg.getChildByName("goBox");
            this.closeSource = _bg.getChildByName("closeSource");
            this.requireBuyWindow = this.owner.getChildByName("requireBuyWindow");
            this.requireBuyWindow.visible = false;
            this.requireBg = this.requireBuyWindow.getChildByName("requireBg");
            this.buy_title = this.requireBg.getChildByName("buy_title");
            this.btnRequireClose = this.requireBg.getChildByName("btnRequireClose");
            this.requireName = this.requireBg.getChildByName("requireName");
            this.btnBuyFragment = this.requireBg.getChildByName("btnBuyFragment");
            this.requireImg = this.requireBg.getChildByName("bg").getChildByName("requireImg");
            this.btnrefreshCount = this.owner.getChildByName("btnrefreshCount");
            this.free = this.btnrefreshCount.getChildByName("free");
            this.diamond = this.btnrefreshCount.getChildByName("diamond");
            this.btnrefreshCount.visible = false;
            this.RefreshButtonState();
            this.boxWindow = this.owner.getChildByName("boxWindow");
            this.DailyBox = this.boxWindow.getChildByName("DailyBox");
            this.btnDailyBox = this.DailyBox.getChildByName("btnDailyBox");
            this.daily_state = this.DailyBox.getChildByName("state");
            this.daily_free = this.btnDailyBox.getChildByName("daily_free");
            this.daily_video = this.btnDailyBox.getChildByName("daily_video");
            this.daily_gold = this.btnDailyBox.getChildByName("daily_gold");
            this.btninfo_1 = this.DailyBox.getChildByName("btninfo_1");
            this.normalBox = this.boxWindow.getChildByName("normalBox");
            this.normal_state = this.normalBox.getChildByName("state");
            this.btnNormalBox = this.normalBox.getChildByName("btnNormalBox");
            this.normal_video = this.btnNormalBox.getChildByName("normal_video");
            this.normal_gold = this.btnNormalBox.getChildByName("normal_gold");
            this.btninfo_2 = this.normalBox.getChildByName("btninfo_2");
            this.RareBox = this.boxWindow.getChildByName("RareBox");
            this.rare_state = this.RareBox.getChildByName("state");
            this.btnRareBox = this.RareBox.getChildByName("btnRareBox");
            this.rare_video = this.btnRareBox.getChildByName("rare_video");
            this.rare_gold = this.btnRareBox.getChildByName("rare_gold");
            this.btninfo_3 = this.RareBox.getChildByName("btninfo_3");
            this.BoxInfoWindow = this.owner.getChildByName("BoxInfoWindow");
            let box_bg = this.BoxInfoWindow.getChildByName("bg");
            this.box_close = box_bg.getChildByName("box_close");
            this.box_infoList = box_bg.getChildByName("box_infoList");
            this.BoxInfoWindow.visible = false;
            this.box_infoList.array = [];
            this.selectBg = this.owner.getChildByName("selectBg");
            this.Tag3 = this.selectBg.getChildByName("Tag3");
            this.levelUpWindow = this.owner.getChildByName("levelUpWindow");
            this.l_bg = this.levelUpWindow.getChildByName("l_bg");
            this.levelUp = this.l_bg.getChildByName("levelUp");
            this.curlevel = this.levelUp.getChildByName("curlevel");
            this.curblood = this.curlevel.getChildByName("curblood");
            this.curspeed = this.curlevel.getChildByName("curspeed");
            this.nextlevel = this.levelUp.getChildByName("nextlevel");
            this.nextblood = this.nextlevel.getChildByName("nextblood");
            this.nextspeed = this.nextlevel.getChildByName("nextspeed");
            this.l_attributeImg = this.l_bg.getChildByName("l_attributeImg");
            this.InfoWindow = this.owner.getChildByName("InfoWindow");
            this.InfoWindow.visible = false;
            this.btnTouch = this.InfoWindow.getChildByName("btnTouch");
            this.rolePos = this.InfoWindow.getChildByName("rolePos");
            this.btnInfoClose = this.InfoWindow.getChildByName("btnInfoClose");
            this.LeftPage = this.InfoWindow.getChildByName("LeftPage");
            this.RightPage = this.InfoWindow.getChildByName("RightPage");
            this.info = this.InfoWindow.getChildByName("info");
            this.title = this.InfoWindow.getChildByName("title");
            this.mode = this.title.getChildByName("mode");
            this.roleName = this.title.getChildByName("roleName");
            this.info_title = this.info.getChildByName("info_title");
            this.desc = this.info.getChildByName("desc");
            this.blood = this.info.getChildByName("blood");
            this.attributeImg = this.blood.getChildByName("attributeImg");
            this.speed = this.info.getChildByName("speed");
            this.btnUse = this.info.getChildByName("btnUse");
            this.using = this.info.getChildByName("using");
            this.btnunLock = this.info.getChildByName("btnunLock");
            this.btnTry = this.info.getChildByName("btnTry");
            this.progressBg = this.info.getChildByName("progessBg");
            this.fragment = this.progressBg.getChildByName("fragment");
            this.fragmentCount = this.progressBg.getChildByName("fragmentCount");
            this.progress = this.progressBg.getChildByName("progess");
            this.btnFragment = this.progressBg.getChildByName("btnFragment");
            this.img_level = this.info.getChildByName("img_level");
            this.level = this.img_level.getChildByName("level");
            this.max = this.img_level.getChildByName("max");
            this.btnLevelUp = this.info.getChildByName("btnLevelUp");
            this.lv_count = this.btnLevelUp.getChildByName("lv_count");
            this.count = this.btnunLock.getChildByName("count");
            this.img = this.count.getChildByName("img");
            this.headList = this.InfoWindow.getChildByName("headList");
            this.headList.array = [];
            this.headList.vScrollBarSkin = "";
            this.headList.renderHandler = new Laya.Handler(this, this.HeadRender);
            this.InitTagClick();
            this.InitRolrAndBoss();
            this.updateTagState();
            this.updateDailyBoxState();
            this.UpdateTipTabel();
            if (UserComData.outskirtsGuide) {
                this.showGuide();
            }
            if (this.TagType == 1) {
                UserComData.signSkinState[0] = UserComData.SignInfo.videoSignCount > 0 ? 1 : 0;
                UserComData.signSkinState[1] = UserComData.SignInfo.videoSignCount > 2 ? 1 : 0;
                UserComData.signSkinState[2] = UserComData.SignInfo.videoSignCount > 6 ? 1 : 0;
                if (UserComData.outskirtsGuide && UserComData.outGuideId == 4) {
                    UserComData.outGuideId = 5;
                    RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
                    let _pos = new Laya.Vector2(this.btnLevelUp.width * 0.7, this.btnLevelUp.height * 0.7);
                    this.InstanceGuide(this.info, _pos, 3);
                    Laya.stage.event("hideGuide");
                    Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("showGuide", "levelup");
                    }));
                }
                this.curselectIndex = UserComData.PlayerSKinInfo.userRoleSkinId;
                let _pos = new Laya.Vector3(this.rolePos.x, this.rolePos.y, 0);
                SceneLogic.inst.ShowRole(this.rolePos);
                let _data = UserComData.ShopRoleData[this.curselectIndex.toString()];
                SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
                this.showInfoWindow();
            }
            else {
                if (UserComData.outskirtsGuide && UserComData.outGuideId == 0) {
                    UserComData.outGuideId = 1;
                    RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
                    let _pos = new Laya.Vector2(this.DailyBox.width * 0.7, this.DailyBox.height * 0.7);
                    this.InstanceGuide(this.boxWindow, _pos);
                    Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("showGuide", "daily");
                    }));
                }
            }
            this.AddEvent();
        }
        showGuide() {
            if (!this.GuideContainer) {
                this.GuideContainer = new Laya.Sprite();
                this.GuideContainer.zOrder = 100;
                this.GuideContainer.cacheAs = "bitmap";
                this.owner.addChild(this.GuideContainer);
            }
        }
        InstanceGuide(img, rect, type) {
            this.GuideContainer.destroyChildren();
            let maskArea = new Laya.Sprite();
            maskArea.alpha = 0.7;
            maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            this.GuideContainer.addChild(maskArea);
            let interactionArea = new Laya.Image();
            type = type ? type : 0;
            interactionArea.blendMode = "destination-out";
            this.GuideContainer.addChild(interactionArea);
            let _pos = new Laya.Point(0, 0);
            let _rect = rect || new Laya.Vector2(100, 100);
            if (type == 1) {
                _pos = new Laya.Point(Laya.stage.width / 2, Laya.stage.height / 2);
                interactionArea.graphics.drawRect(_pos.x - _rect.x / 2, _pos.y - _rect.y / 2, _rect.x, _rect.y, "#000000");
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawRect(_pos.x - _rect.x / 2, _pos.y - _rect.y / 2, _rect.x, _rect.y, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
            else if (type == 0) {
                _pos = img.localToGlobal(new Laya.Point((img.width || 0) / 2, (img.height || 0) / 2));
                interactionArea.graphics.drawRect(_pos.x - img.width / 2 + 23, _pos.y - img.height / 2 - 5, _rect.x, _rect.y, "#000000");
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawRect(_pos.x - img.width / 2 + 23, _pos.y - img.height / 2 - 5, _rect.x, _rect.y, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
            else if (type == 2) {
                interactionArea.graphics.drawRect(_pos.x, _pos.y, _rect.x, _rect.y, "#000000");
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawRect(_pos.x, _pos.y, _rect.x, _rect.y, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
            else if (type == 3) {
                _pos = this.btnLevelUp.localToGlobal(new Laya.Point((this.btnLevelUp.width || 0) / 2, (this.btnLevelUp.height || 0) / 2));
                interactionArea.graphics.drawRect(this.info.x - 200 * 0.7 - _rect.x / 2, _pos.y - _rect.y / 2, _rect.x, _rect.y, "#000000");
                let hitArea = new Laya.HitArea();
                hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                hitArea.unHit.drawRect(this.info.x - 200 * 0.7 - _rect.x / 2, _pos.y - _rect.y / 2, _rect.x, _rect.y, "#000000");
                this.GuideContainer.hitArea = hitArea;
                this.GuideContainer.mouseEnabled = true;
            }
        }
        HeadRender(cell, index) {
            let _data = this.headData[index];
            cell.offAll();
            let select = cell.getChildByName("select");
            let bg = cell.getChildByName("bg");
            let s_head = select.getChildByName("head");
            let bg_head = bg.getChildByName("head");
            let lock = cell.getChildByName("lock");
            lock.visible = _data.lock;
            select.visible = _data.select;
            bg.visible = !_data.select;
            s_head.skin = _data.headimg;
            bg_head.skin = _data.headimg;
            cell.once(Laya.Event.CLICK, this, () => {
                this.TagType = _data.type;
                this.curselectIndex = _data.id % 100;
                SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
                this.showInfoWindow();
            });
        }
        updateHeadData() {
            let list = [];
            let lockList = [];
            this.headData = [];
            let len = 0;
            for (let i = 0; i < UserComData.AllBossSKinList.length; i++) {
                let _have = false;
                for (let j = 0; j < UserComData.PlayerSKinInfo.unlockBossList.length; j++) {
                    let value = UserComData.PlayerSKinInfo.unlockBossList[j];
                    if (value == UserComData.AllBossSKinList[i]) {
                        _have = true;
                        list.push(UserComData.AllBossSKinList[i] + 100);
                        break;
                    }
                }
                if (!_have) {
                    lockList.push(UserComData.AllBossSKinList[i] + 100);
                }
            }
            for (let i = 0; i < UserComData.AllRoleSKinList.length; i++) {
                let _have = false;
                for (let j = 0; j < UserComData.PlayerSKinInfo.unlockRoleList.length; j++) {
                    let value = UserComData.PlayerSKinInfo.unlockRoleList[j];
                    if (value == UserComData.AllRoleSKinList[i]) {
                        _have = true;
                        list.push(UserComData.AllRoleSKinList[i]);
                        break;
                    }
                }
                if (!_have) {
                    lockList.push(UserComData.AllRoleSKinList[i]);
                }
            }
            len = list.length;
            list = list.concat(lockList);
            let _data;
            for (let i = 0; i < list.length; i++) {
                if (list[i] < 100) {
                    _data = UserComData.ShopRoleData[list[i]];
                    this.headData.push({
                        id: list[i],
                        type: 1,
                        prefabName: _data.prefabName,
                        select: (this.curselectIndex == list[i] && this.TagType == 1) ? true : false,
                        lock: i < len ? false : true,
                        headimg: i < len ? _data.unLockImg : _data.lockImg
                    });
                }
                else {
                    _data = UserComData.ShopBossData[list[i] % 100];
                    this.headData.push({
                        id: list[i],
                        type: 2,
                        prefabName: _data.prefabName,
                        select: (this.curselectIndex == list[i] % 100 && this.TagType == 2) ? true : false,
                        lock: i < len ? false : true,
                        headimg: i < len ? _data.unLockImg : _data.lockImg
                    });
                }
            }
            this.headList.array = this.headData;
            this.headList.refresh();
            this.headList.renderHandler = new Laya.Handler(this, this.HeadRender);
        }
        InitRolrAndBoss() {
            this.RoleUnLock = [];
            this.BossUnLock = [];
            for (let i = 0; i < UserComData.AllRoleSKinList.length; i++) {
                this.RoleUnLock.push(0);
            }
            for (let i = 0; i < UserComData.AllBossSKinList.length; i++) {
                this.BossUnLock.push(0);
            }
        }
        InitTagClick() {
            for (let i = 0; i < 4; i++) {
                let cell = this.selectBg.getChildByName("Tag" + (i + 1));
                cell.on(Laya.Event.CLICK, this, () => {
                    this.TagType = i + 1;
                    SoundMgr.inst.playSound("transformation");
                    this.updateTagState();
                });
            }
        }
        RareBoxClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍稀宝箱点击", "珍稀宝箱点击"));
            let _data = UserComData.BoxData[2];
            if (UserComData.userDiamond >= _data.consume || UserComData.Boxinfo.rare <= 0) {
                this.curselectIndex = 2;
                this.requireBox();
            }
            else {
                Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                    SoundMgr.inst.playSound("click");
                    Laya.stage.event("getInfo", { type: 2, count: 50 });
                }));
            }
        }
        NormalBoxClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍贵宝箱点击", "珍贵宝箱点击"));
            let _data = UserComData.BoxData[1];
            if (UserComData.userDiamond >= _data.consume || UserComData.Boxinfo.normal <= 0) {
                this.curselectIndex = 1;
                this.requireBox();
            }
            else {
                Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                    SoundMgr.inst.playSound("click");
                    Laya.stage.event("getInfo", { type: 2, count: 50 });
                }));
            }
        }
        DailyBoxClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            this.ChangeTipState("btnDailyBox");
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("每日宝箱点击", "每日宝箱点击"));
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 1) {
                Laya.stage.event("hideGuide");
                UserComData.outGuideId = 2;
                RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
                let _pos = new Laya.Vector2(this.requireBg.width * 0.7, this.requireBg.height * 0.7);
                this.InstanceGuide(this.requireBg, _pos, 1);
                Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("showGuide", "buy");
                }));
            }
            if (UserComData.PlayerSKinInfo.freeCount >= 1) {
                this.curselectIndex = 0;
                this.requireBox();
            }
            else {
                let _data = UserComData.BoxData[0];
                if (UserComData.userGold >= _data.consume || UserComData.Boxinfo.daily <= 0) {
                    this.curselectIndex = 0;
                    this.requireBox();
                }
                else {
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        SoundMgr.inst.playSound("click");
                        Laya.stage.event("getInfo", { type: 1, count: 500 });
                    }));
                }
            }
        }
        requireBox() {
            let arg;
            if (this.curselectIndex == 0) {
                arg = {
                    type: 2,
                    fragmentCount: 1,
                    fragmentImg: "role/icon_shop_gift_00.png"
                };
            }
            else if (this.curselectIndex == 1) {
                arg = {
                    type: 3,
                    fragmentCount: 1,
                    fragmentImg: "role/icon_shop_gift_01.png"
                };
            }
            else if (this.curselectIndex == 2) {
                arg = {
                    type: 4,
                    fragmentCount: 1,
                    fragmentImg: "role/icon_shop_gift_02.png",
                };
            }
            this.openRequireBuyWindow(arg);
        }
        updateDailyBoxState() {
            if (UserComData.PlayerSKinInfo.freeCount > 0) {
                this.daily_state.text = "每日免费(" + UserComData.PlayerSKinInfo.freeCount + "/1)";
                UserComData.Boxinfo.daily = UserComData.Boxinfo.daily > UserComData.BoxGoldBuyList[0] ? UserComData.BoxGoldBuyList[0] : UserComData.Boxinfo.daily;
            }
            else if (UserComData.Boxinfo.daily > 0) {
                this.daily_state.text = "每日限购(" + UserComData.Boxinfo.daily + "/" + UserComData.BoxGoldBuyList[0] + ")";
            }
            else {
                this.daily_state.text = "每日限购(" + 0 + "/" + UserComData.BoxGoldBuyList[0] + ")";
            }
            if (UserComData.Boxinfo.normal > 0) {
                this.normal_state.text = "每日限购(" + UserComData.Boxinfo.normal + "/" + UserComData.BoxGoldBuyList[1] + ")";
                this.normal_gold.visible = true;
                this.normal_video.visible = false;
            }
            else {
                this.normal_gold.visible = false;
                this.normal_video.visible = true;
                this.normal_state.text = "每日限购(" + 0 + "/" + UserComData.BoxGoldBuyList[1] + ")";
            }
            if (UserComData.Boxinfo.rare > 0) {
                this.rare_gold.visible = true;
                this.rare_video.visible = false;
                this.rare_state.text = "每日限购(" + UserComData.Boxinfo.rare + "/" + UserComData.BoxGoldBuyList[2] + ")";
            }
            else {
                this.rare_gold.visible = false;
                this.rare_video.visible = true;
                this.rare_state.text = "每日限购(" + 0 + "/" + UserComData.BoxGoldBuyList[2] + ")";
            }
            this.daily_free.visible = UserComData.PlayerSKinInfo.freeCount >= 1;
            this.daily_gold.visible = UserComData.PlayerSKinInfo.freeCount < 1 && UserComData.Boxinfo.daily > 0;
            this.daily_video.visible = UserComData.PlayerSKinInfo.freeCount < 1 && UserComData.Boxinfo.daily <= 0;
        }
        updateTagState() {
            for (let i = 0; i < 4; i++) {
                let cell = this.selectBg.getChildByName("Tag" + (i + 1));
                let open = cell.getChildByName("open");
                let close = cell.getChildByName("close");
                close.visible = true;
                open.visible = false;
                if (this.TagType == i + 1) {
                    close.visible = false;
                    open.visible = true;
                }
            }
            this.RoleList.visible = false;
            this.fragmentList.visible = false;
            this.btnrefreshCount.visible = false;
            this.boxWindow.visible = false;
            if (this.TagType == 1 || this.TagType == 2) {
                this.RoleList.visible = true;
                this.refreshtRoleData();
            }
            else if (this.TagType == 3) {
                this.btnrefreshCount.visible = true;
                this.fragmentList.visible = true;
                this.refreshFragment();
                this.ChangeTipState("Tag3");
            }
            else if (this.TagType == 4) {
                this.RefreshButtonState();
                this.boxWindow.visible = true;
            }
        }
        ChangeTipState(name) {
            if (UserComData.RoleTipsList[name] == 0) {
                UserComData.RoleTipsList[name] = 1;
                this.UpdateTipTabel();
            }
        }
        UpdateTipTabel() {
            for (let i = 0; i < UserComData.RoleTipsName.length; i++) {
                const element = UserComData.RoleTipsName[i];
                let _button = this[element];
                _button.getChildByName("tips").visible = UserComData.RoleTipsList[element] == 0;
            }
            Laya.LocalStorage.setItem("RoleTipsList", JSON.stringify(UserComData.RoleTipsList));
        }
        refreshtRoleData() {
            let _list = [];
            if (this.TagType == 1) {
                for (let i = 0; i < UserComData.PlayerSKinInfo.unlockRoleList.length; i++) {
                    let value = UserComData.PlayerSKinInfo.unlockRoleList[i];
                    this.RoleUnLock[value] = 1;
                }
                for (let index = 0; index < UserComData.AllRoleSKinList.length; index++) {
                    _list.push(0);
                }
            }
            else if (this.TagType == 2) {
                for (let i = 0; i < UserComData.PlayerSKinInfo.unlockBossList.length; i++) {
                    let value = UserComData.PlayerSKinInfo.unlockBossList[i];
                    this.BossUnLock[value] = 1;
                }
                for (let index = 0; index < UserComData.AllBossSKinList.length; index++) {
                    _list.push(0);
                }
            }
            this.RoleList.array = _list;
            this.RoleList.refresh();
            this.RoleList.renderHandler = new Laya.Handler(this, this.RoleRender);
        }
        UpdatePlayerMoneny() {
            if (UserComData.outskirtsGuide && UserComData.GuideId == 3) {
                Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("showGuide", "back");
                }));
            }
            this.lblGold.text = UserComData.userGold + "";
            this.lblDialond.text = UserComData.userDiamond + "";
        }
        closeRequireBuyWindow() {
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 2) {
                Laya.stage.event("hideGuide");
                UserComData.outGuideId = 1;
                RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
                let _pos = new Laya.Vector2(this.DailyBox.width * 0.7, this.DailyBox.height * 0.7);
                this.InstanceGuide(this.boxWindow, _pos);
                Laya.Scene.open("view/game/GuidePage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("showGuide", "daily");
                }));
            }
            SoundMgr.inst.playSound("click");
            this.requireBuyWindow.visible = false;
        }
        openRequireBuyWindow(arg) {
            if (!arg)
                return;
            if (arg.type == 1) {
                this.requireImg.width = 70;
                this.requireImg.height = 70;
            }
            else {
                this.requireImg.width = 80;
                this.requireImg.height = 80;
            }
            this.FragmentInfo = arg;
            this.requireName.text = arg.fragmentCount;
            this.requireImg.skin = arg.fragmentImg;
            this.requireBuyWindow.visible = true;
            let _ani = this.owner["requireAni"];
            _ani.play(0, false);
            SoundMgr.inst.playSound("click");
        }
        BuyFragment() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 2) {
                Laya.stage.event("hideGuide");
                UserComData.outGuideId = 3;
                RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
                let _pos = new Laya.Vector2(this.btnClose.width * 0.7, this.btnClose.height * 0.7);
                this.InstanceGuide(this.btnClose, _pos, 2);
            }
            if (this.FragmentInfo.type == 1) {
                this.FragmentGet();
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("碎片确认弹窗按钮点击", "碎片确认弹窗按钮点击"));
            }
            else {
                if (this.curselectIndex == 0) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("每日宝箱确认弹窗按钮点击", "每日宝箱确认弹窗按钮点击"));
                    if (UserComData.Boxinfo.daily <= 0) {
                        zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                            this.OpenBox(2);
                            UserComData.taskInfo.taskGetList[5]++;
                            if (UserComData.taskInfo.taskGetList[5] == UserComData.taskData[5].num) {
                                UserComData.taskInfo.taskStateList[5] = 1;
                            }
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("每日宝箱视频奖励领取打点", "每日宝箱视频奖励领取打点"));
                        }), Laya.Handler.create(this, function () {
                            zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                        }), Laya.Handler.create(this, function () {
                        }));
                    }
                    else {
                        UserComData.Boxinfo.daily--;
                        this.OpenBox(1);
                        UserComData.taskInfo.taskGetList[5]++;
                        if (UserComData.taskInfo.taskGetList[5] == UserComData.taskData[5].num) {
                            UserComData.taskInfo.taskStateList[5] = 1;
                        }
                    }
                }
                else if (this.curselectIndex == 1) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍贵宝箱确认弹窗按钮点击", "珍贵宝箱确认弹窗按钮点击"));
                    if (UserComData.Boxinfo.normal <= 0) {
                        zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                            this.OpenBox(2);
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍贵宝箱视频奖励领取打点", "珍贵宝箱视频奖励领取打点"));
                        }), Laya.Handler.create(this, function () {
                            zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                        }), Laya.Handler.create(this, function () {
                        }));
                    }
                    else {
                        UserComData.Boxinfo.normal--;
                        this.OpenBox(1);
                    }
                }
                else if (this.curselectIndex == 2) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍稀宝箱确认弹窗按钮点击", "珍稀宝箱确认弹窗按钮点击"));
                    if (UserComData.Boxinfo.rare <= 0) {
                        zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                            this.OpenBox(2);
                            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("珍稀宝箱视频奖励领取打点", "珍稀宝箱视频奖励领取打点"));
                        }), Laya.Handler.create(this, function () {
                            zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                        }), Laya.Handler.create(this, function () {
                        }));
                    }
                    else {
                        UserComData.Boxinfo.rare--;
                        this.OpenBox(1);
                    }
                }
            }
        }
        OpenBox(value) {
            let _data = UserComData.BoxData[this.curselectIndex];
            let _gold = 0;
            let _diamond = 0;
            let _fragmentName = "";
            let _fragmentImg = "";
            let _list = [];
            for (let i = 0; i < _data.gift.length; i++) {
                for (let j = 0; j < _data.gift[i].probability * 10; j++) {
                    _list.push(i);
                }
            }
            if (value == 1) {
                if (_data.type == 1) {
                    if (this.curselectIndex == 0 && UserComData.PlayerSKinInfo.freeCount >= 1) {
                        UserComData.PlayerSKinInfo.freeCount--;
                    }
                    else {
                        UserComData.userGold -= _data.consume;
                    }
                }
                else if (_data.type == 2) {
                    UserComData.userDiamond -= _data.consume;
                }
            }
            else if (value == 2) {
            }
            let _ran = _list[Utils.Range(0, _list.length - 1)];
            if (_data.gift[_ran].type == 1) {
                _gold = _data.gift[_ran].count;
                UserComData.userGold += _gold;
            }
            else if (_data.gift[_ran].type == 2) {
                _diamond = _data.gift[_ran].count;
                UserComData.userDiamond += _diamond;
            }
            let _ranF = UserComData.PlayerSKinInfo.buyFragmentList[Utils.Range(0, UserComData.PlayerSKinInfo.buyFragmentList.length - 1)];
            let _type = 1;
            if (_ranF < 100) {
                _type = 1;
                _fragmentName = UserComData.ShopRoleData[_ranF].fragmentName;
                _fragmentImg = UserComData.ShopRoleData[_ranF].fragmentImg;
                UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_ranF] += _data.fragmentCount;
            }
            else {
                _type = 2;
                _fragmentName = UserComData.ShopBossData[_ranF % 100].fragmentName;
                _fragmentImg = UserComData.ShopBossData[_ranF % 100].fragmentImg;
                UserComData.PlayerSKinInfo.BossSkinFragmentCount[_ranF % 100] += _data.fragmentCount;
            }
            Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond, fragment: { type: _type, id: _ranF % 100, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentCount: _data.fragmentCount } });
                this.closeRequireBuyWindow();
                this.updateDailyBoxState();
                RequestMgr.UpdatePlayerAny({
                    "userDiamond": UserComData.userDiamond.toString(),
                    "userGold": UserComData.userGold.toString(),
                    "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                    "Boxinfo": UserComData.Boxinfo,
                    "taskInfo": UserComData.taskInfo
                });
                this.UpdatePlayerMoneny();
            }));
        }
        FragmentGet() {
            if (UserComData.userDiamond < 10) {
                Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getInfo", { type: 2, count: 50 });
                }));
                return;
            }
            UserComData.userDiamond -= 10;
            UserComData.taskInfo.taskGetList[6]++;
            if (UserComData.taskInfo.taskGetList[6] == UserComData.taskData[6].num) {
                UserComData.taskInfo.taskStateList[6] = 1;
            }
            this.UpdatePlayerMoneny();
            let _type = 1;
            if (this.FragmentInfo.fragmentID < 100) {
                _type = 1;
                UserComData.PlayerSKinInfo.RoleSkinFragmentCount[this.FragmentInfo.fragmentID] += 20;
            }
            else {
                _type = 2;
                UserComData.PlayerSKinInfo.BossSkinFragmentCount[this.FragmentInfo.fragmentID % 100] += 20;
            }
            UserComData.PlayerSKinInfo.buyFragmentState[this.curselectIndex] = 0;
            RequestMgr.UpdatePlayerAny({
                "userDiamond": UserComData.userDiamond.toString(),
                "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                "taskInfo": UserComData.taskInfo
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("碎片奖励获得打点", "碎片奖励获得打点"));
            Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getMoney", { fragment: { id: this.FragmentInfo.fragmentID % 100, type: _type, fragmentName: this.FragmentInfo.fragmentName, fragmentImg: this.FragmentInfo.fragmentImg, fragmentCount: this.FragmentInfo.fragmentCount } });
                this.closeRequireBuyWindow();
                this.refreshFragment();
            }));
        }
        RefreshButtonState() {
            this.free.visible = UserComData.PlayerSKinInfo.refreshFragmentCount == 0;
            this.diamond.visible = UserComData.PlayerSKinInfo.refreshFragmentCount > 0;
        }
        RefreshCount() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("碎片界面刷新按钮打点", "碎片界面刷新按钮打点"));
            SoundMgr.inst.playSound("click");
            if (UserComData.PlayerSKinInfo.refreshFragmentCount == 0) {
                UserComData.PlayerSKinInfo.refreshFragmentCount++;
                for (let i = 0; i < UserComData.PlayerSKinInfo.buyFragmentState.length; i++) {
                    UserComData.PlayerSKinInfo.buyFragmentState[i] = 1;
                }
                RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
                this.RefreshButtonState();
                this.refreshFragment();
            }
            else {
                zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                    UserComData.PlayerSKinInfo.refreshFragmentCount++;
                    for (let i = 0; i < UserComData.PlayerSKinInfo.buyFragmentState.length; i++) {
                        UserComData.PlayerSKinInfo.buyFragmentState[i] = 1;
                    }
                    RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
                    this.RefreshButtonState();
                    this.refreshFragment();
                }), Laya.Handler.create(this, function () {
                    zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                }), Laya.Handler.create(this, function () {
                }));
            }
        }
        refreshFragment() {
            this.fragmentList.array = UserComData.PlayerSKinInfo.buyFragmentList;
            this.fragmentList.refresh();
            this.fragmentList.renderHandler = new Laya.Handler(this, this.fragmentRender);
        }
        fragmentRender(cell, index) {
            let _data = UserComData.PlayerSKinInfo.buyFragmentList[index];
            let bg = cell.getChildByName("bg");
            let icon = cell.getChildByName("icon");
            let desc = cell.getChildByName("desc");
            let busy = cell.getChildByName("busy");
            busy.visible = UserComData.PlayerSKinInfo.buyFragmentState[index] == 0;
            let _fragmentName = "";
            let _fragmentImg = "";
            if (_data < 100) {
                icon.skin = UserComData.ShopRoleData[_data].fragmentImg;
                _fragmentName = UserComData.ShopRoleData[_data].fragmentName;
                _fragmentImg = UserComData.ShopRoleData[_data].fragmentImg;
            }
            else {
                icon.skin = UserComData.ShopBossData[(_data % 100)].fragmentImg;
                _fragmentName = UserComData.ShopBossData[_data % 100].fragmentName;
                _fragmentImg = UserComData.ShopBossData[_data % 100].fragmentImg;
            }
            desc.text = _fragmentName;
            cell.on(Laya.Event.CLICK, this, () => {
                if (this._isClick) {
                    return;
                }
                this._isClick = true;
                Laya.timer.once(500, this, () => {
                    this._isClick = null;
                });
                if (UserComData.PlayerSKinInfo.buyFragmentState[index] == 0)
                    return;
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("碎片图标点击", "碎片图标点击"));
                this.curselectIndex = index;
                this.openRequireBuyWindow({ type: 1, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentID: _data, fragmentCount: 20 });
            });
            cell.on(Laya.Event.MOUSE_DOWN, this, () => {
                Laya.Tween.to(cell, { scaleX: 1.1, scaleY: 1.1 }, 100);
            });
            cell.on(Laya.Event.MOUSE_UP, this, () => {
                Laya.Tween.to(cell, { scaleX: 1, scaleY: 1 }, 100);
            });
            cell.on(Laya.Event.MOUSE_OUT, this, () => {
                Laya.Tween.to(cell, { scaleX: 1, scaleY: 1 }, 100);
            });
        }
        RoleRender(cell, index) {
            let _data;
            cell.offAll();
            if (this.TagType == 1) {
                _data = UserComData.ShopRoleData[index.toString()];
            }
            else if (this.TagType == 2) {
                _data = UserComData.ShopBossData[index.toString()];
            }
            let bg = cell.getChildByName("bg");
            let icon = cell.getChildByName("icon");
            let lock = cell.getChildByName("lock");
            let mode = cell.getChildByName("mode");
            let desc = cell.getChildByName("desc");
            let using = cell.getChildByName("using");
            using.visible = false;
            bg.skin = _data.bg;
            icon.skin = _data.unLockImg;
            lock.skin = _data.lockImg;
            desc.skin = _data.roleName;
            if (this.TagType == 1) {
                lock.visible = this.RoleUnLock[index] == 0;
                using.visible = UserComData.PlayerSKinInfo.userRoleSkinId == index;
            }
            else if (this.TagType == 2) {
                lock.visible = this.BossUnLock[index] == 0;
                using.visible = UserComData.PlayerSKinInfo.userBossSKinId == index;
            }
            cell.on(Laya.Event.CLICK, this, () => {
                if (this._isClick) {
                    return;
                }
                this._isClick = true;
                Laya.timer.once(500, this, () => {
                    this._isClick = null;
                });
                this.curselectIndex = index;
                let _pos = new Laya.Vector3(this.rolePos.x, this.rolePos.y, 0);
                SceneLogic.inst.ShowRole(this.rolePos);
                SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
                this.showInfoWindow();
            });
        }
        AddEvent() {
            this.btninfo_1.on(Laya.Event.CLICK, this, this.openDailyInfo);
            this.btninfo_2.on(Laya.Event.CLICK, this, this.openNormalInfo);
            this.btninfo_3.on(Laya.Event.CLICK, this, this.openRareInfo);
            this.box_close.on(Laya.Event.CLICK, this, this.closeBoxInfo);
            this.btnMoney_1.on(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.on(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.btnUse.on(Laya.Event.CLICK, this, this.ChangeSkin);
            this.btnunLock.on(Laya.Event.CLICK, this, this.BuySkin);
            this.btnTry.on(Laya.Event.CLICK, this, this.TrySkin);
            this.LeftPage.on(Laya.Event.CLICK, this, this.LeftClick);
            this.RightPage.on(Laya.Event.CLICK, this, this.RightClick);
            this.btnInfoClose.on(Laya.Event.CLICK, this, this.goStartClick);
            this.btnTouch.on(Laya.Event.CLICK, this, this.StartPlayAni);
            this.btnLevelUp.on(Laya.Event.CLICK, this, this.LevelUp);
            this.btnRequireClose.on(Laya.Event.CLICK, this, this.closeRequireBuyWindow);
            this.btnBuyFragment.on(Laya.Event.CLICK, this, this.BuyFragment);
            this.btnrefreshCount.on(Laya.Event.CLICK, this, this.RefreshCount);
            this.btnDailyBox.on(Laya.Event.CLICK, this, this.DailyBoxClick);
            this.btnNormalBox.on(Laya.Event.CLICK, this, this.NormalBoxClick);
            this.btnRareBox.on(Laya.Event.CLICK, this, this.RareBoxClick);
            this.closeSource.on(Laya.Event.CLICK, this, this.closefragmentSource);
            this.btnFragment.on(Laya.Event.CLICK, this, this.openfragmentSource);
            this.goStart.on(Laya.Event.CLICK, this, this.goStartClick);
            this.goShop.on(Laya.Event.CLICK, this, this.goShopClick);
            this.goBox.on(Laya.Event.CLICK, this, this.goBoxClick);
            this.levelUpWindow.on(Laya.Event.CLICK, this, this.closeLevelUpWindow);
            Laya.stage.on("closePage", this, this.UpdatePlayerMoneny);
            Laya.stage.on("RefreshRoleFragment", this, this.showInfoWindow);
        }
        RemoveEvent() {
            this.btninfo_1.off(Laya.Event.CLICK, this, this.openDailyInfo);
            this.btninfo_2.off(Laya.Event.CLICK, this, this.openNormalInfo);
            this.btninfo_3.off(Laya.Event.CLICK, this, this.openRareInfo);
            this.box_close.off(Laya.Event.CLICK, this, this.closeBoxInfo);
            this.btnMoney_1.off(Laya.Event.CLICK, this, this.GoldClick);
            this.btnMoney_2.off(Laya.Event.CLICK, this, this.DiamondClick);
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.btnUse.off(Laya.Event.CLICK, this, this.ChangeSkin);
            this.btnunLock.off(Laya.Event.CLICK, this, this.BuySkin);
            this.btnTry.off(Laya.Event.CLICK, this, this.TrySkin);
            this.LeftPage.off(Laya.Event.CLICK, this, this.LeftClick);
            this.RightPage.off(Laya.Event.CLICK, this, this.RightClick);
            this.btnInfoClose.off(Laya.Event.CLICK, this, this.goStartClick);
            this.btnTouch.off(Laya.Event.CLICK, this, this.StartPlayAni);
            this.btnLevelUp.off(Laya.Event.CLICK, this, this.LevelUp);
            this.btnRequireClose.off(Laya.Event.CLICK, this, this.closeRequireBuyWindow);
            this.btnBuyFragment.off(Laya.Event.CLICK, this, this.BuyFragment);
            this.btnrefreshCount.off(Laya.Event.CLICK, this, this.RefreshCount);
            this.btnDailyBox.off(Laya.Event.CLICK, this, this.DailyBoxClick);
            this.btnNormalBox.off(Laya.Event.CLICK, this, this.NormalBoxClick);
            this.btnRareBox.off(Laya.Event.CLICK, this, this.RareBoxClick);
            this.closeSource.off(Laya.Event.CLICK, this, this.closefragmentSource);
            this.btnFragment.off(Laya.Event.CLICK, this, this.openfragmentSource);
            this.goStart.off(Laya.Event.CLICK, this, this.goStartClick);
            this.goShop.off(Laya.Event.CLICK, this, this.goShopClick);
            this.goBox.off(Laya.Event.CLICK, this, this.goBoxClick);
            this.levelUpWindow.off(Laya.Event.CLICK, this, this.closeLevelUpWindow);
            Laya.stage.off("closePage", this, this.UpdatePlayerMoneny);
            Laya.stage.off("RefreshRoleFragment", this, this.showInfoWindow);
        }
        openDailyInfo() {
            this.openBoxInfo(0);
        }
        openNormalInfo() {
            this.openBoxInfo(1);
        }
        openRareInfo() {
            this.openBoxInfo(2);
        }
        openBoxInfo(index) {
            this.boxInfoData = [];
            let _data = UserComData.BoxData[index].gift;
            for (let i = 0; i < _data.length; i++) {
                this.boxInfoData.push({
                    type: _data[i].type,
                    count: _data[i].count
                });
            }
            this.boxInfoData.push({
                type: 3,
                count: UserComData.BoxData[index].fragmentCount
            });
            this.box_infoList.array = this.boxInfoData;
            this.box_infoList.renderHandler = new Laya.Handler(this, this.boxInfoRender);
            this.BoxInfoWindow.visible = true;
        }
        closeBoxInfo() {
            this.BoxInfoWindow.visible = false;
        }
        boxInfoRender(cell, index) {
            let _data = this.boxInfoData[index];
            let img = cell.getChildByName("img");
            let count = cell.getChildByName("count");
            if (_data.type == 1) {
                img.skin = "game/icon_coin.png";
            }
            else if (_data.type == 2) {
                img.skin = "game/icon_dimo.png";
            }
            else if (_data.type == 3) {
                img.skin = "game/role_puzzle_00.png";
            }
            count.text = _data.count + "";
        }
        GoldClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 1, count: 500 });
            }));
        }
        DiamondClick() {
            SoundMgr.inst.playSound("click");
            Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getInfo", { type: 2, count: 50 });
            }));
        }
        LeftClick() {
            this.curselectIndex--;
            let _data;
            if (this.TagType == 1) {
                if (this.curselectIndex < 0) {
                    this.curselectIndex = UserComData.AllRoleSKinList.length - 1;
                }
                _data = UserComData.ShopRoleData[this.curselectIndex];
            }
            else if (this.TagType == 2) {
                if (this.curselectIndex < 0) {
                    this.curselectIndex = UserComData.AllBossSKinList.length - 1;
                }
                _data = UserComData.ShopBossData[this.curselectIndex];
            }
            SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
            this.showInfoWindow();
        }
        RightClick() {
            this.curselectIndex++;
            let _data;
            if (this.TagType == 1) {
                if (this.curselectIndex > UserComData.AllRoleSKinList.length - 1) {
                    this.curselectIndex = 0;
                }
                _data = UserComData.ShopRoleData[this.curselectIndex];
            }
            else if (this.TagType == 2) {
                if (this.curselectIndex > UserComData.AllBossSKinList.length - 1) {
                    this.curselectIndex = 0;
                }
                _data = UserComData.ShopBossData[this.curselectIndex];
            }
            SceneLogic.inst.showRoleByName(_data.prefabName, _data.type);
            this.showInfoWindow();
        }
        TrySkin() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("角色试用一次按钮点击", "角色试用一次按钮点击"));
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                UserComData.RoletrySkinId = this.curselectIndex;
                RequestMgr.UpdatePlayerByKey("RoletrySkinId", UserComData.RoletrySkinId.toString());
                this.goStartClick();
                EventMgr.inst.emit("TrySkinStartGame");
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可获取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        BuySkin() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            SoundMgr.inst.playSound("click");
            let _data;
            if (this.TagType == 1) {
                _data = UserComData.ShopRoleData[this.curselectIndex];
            }
            else {
                _data = UserComData.ShopBossData[this.curselectIndex];
            }
            if (!_data)
                return;
            if (_data.getMode == 1) {
                if (UserComData.userGold >= _data.count) {
                    UserComData.userGold -= _data.count;
                    this.UpdatePlayerMoneny();
                    RequestMgr.UpdatePlayerByKey("userGold", UserComData.userGold.toString());
                    if (this.TagType == 1) {
                        UserComData.PlayerSKinInfo.unlockRoleList.push(this.curselectIndex);
                        UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex);
                    }
                    else {
                        UserComData.PlayerSKinInfo.unlockBossList.push(this.curselectIndex);
                        UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex + 100);
                    }
                    UserComData.PlayerSKinInfo.buyFragmentState.push(1);
                    this.ChangeSkin();
                }
                else {
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getInfo", { type: 1, count: 500 });
                    }));
                }
            }
            else if (_data.getMode == 2) {
                if (UserComData.userDiamond >= _data.count) {
                    UserComData.userDiamond -= _data.count;
                    this.UpdatePlayerMoneny();
                    RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                    if (this.TagType == 1) {
                        UserComData.PlayerSKinInfo.unlockRoleList.push(this.curselectIndex);
                        UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex);
                    }
                    else {
                        UserComData.PlayerSKinInfo.unlockBossList.push(this.curselectIndex);
                        UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex + 100);
                    }
                    UserComData.PlayerSKinInfo.buyFragmentState.push(1);
                    this.ChangeSkin();
                }
                else {
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getInfo", { type: 2, count: 50 });
                    }));
                }
            }
            else if (_data.getMode == 3) {
            }
            else if (_data.getMode == 4) {
                if (this._canForever) {
                    zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                        if (this.TagType == 1) {
                            UserComData.PlayerSKinInfo.unlockRoleList.push(this.curselectIndex);
                            UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex);
                        }
                        else {
                            UserComData.PlayerSKinInfo.unlockBossList.push(this.curselectIndex);
                            UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex + 100);
                        }
                        UserComData.PlayerSKinInfo.buyFragmentState.push(1);
                        this.ChangeSkin();
                        this.showInfoWindow();
                    }), Laya.Handler.create(this, function () {
                        zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                    }), Laya.Handler.create(this, function () {
                    }));
                }
                else {
                    SceneLogic.inst.closeRole();
                    EventMgr.inst.emit("openSign");
                    this.close();
                }
            }
            else if (_data.getMode == 5) {
                if (this._canForever) {
                    zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                        if (this.TagType == 1) {
                            UserComData.PlayerSKinInfo.unlockRoleList.push(this.curselectIndex);
                            UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex);
                        }
                        else {
                            UserComData.PlayerSKinInfo.unlockBossList.push(this.curselectIndex);
                            UserComData.PlayerSKinInfo.buyFragmentList.push(this.curselectIndex + 100);
                        }
                        UserComData.PlayerSKinInfo.buyFragmentState.push(1);
                        this.ChangeSkin();
                        this.showInfoWindow();
                    }), Laya.Handler.create(this, function () {
                        zs.laya.game.UIService.showToast("看完视频才可领取奖励哦~~");
                    }), Laya.Handler.create(this, function () {
                    }));
                }
                else {
                    SceneLogic.inst.closeRole();
                    Laya.Scene.open("view/game/LotteryPage.scene", false);
                    this.close();
                }
            }
        }
        ChangeSkin() {
            SoundMgr.inst.playSound("click");
            if (this.TagType == 1) {
                UserComData.PlayerSKinInfo.userRoleSkinId = this.curselectIndex;
            }
            else if (this.TagType == 2) {
                UserComData.PlayerSKinInfo.userBossSKinId = this.curselectIndex;
            }
            RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
            this.using.visible = true;
            this.btnLevelUp.visible = true;
            this.btnUse.visible = false;
            this.btnunLock.visible = false;
            this.btnTry.visible = false;
        }
        videoClick() {
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                this.InfoWindow.visible = false;
                this.showGetWindow();
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可获取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        LevelUp() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("升级按钮点击", "升级按钮点击"));
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 5) {
                UserComData.outskirtsGuide = false;
                UserComData.outGuideId = 6;
                Laya.stage.event("hideGuide");
                this.GuideContainer.visible = false;
                RequestMgr.UpdatePlayerAny({
                    "outGuideId": UserComData.outGuideId.toString(),
                    "outskirtsGuide": "1"
                });
            }
            SoundMgr.inst.playSound("click");
            let _index = this.curselectIndex;
            let _data;
            let _curLevel;
            let _curCount;
            let _fragmentName = "";
            let _fragmentImg = "";
            if (this.TagType == 1) {
                _data = UserComData.ShopRoleData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.RoleSkinLevelList[_index];
                _curCount = UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_index];
                _fragmentName = UserComData.ShopRoleData[this.curselectIndex].fragmentName;
                _fragmentImg = UserComData.ShopRoleData[this.curselectIndex].fragmentImg;
            }
            else if (this.TagType == 2) {
                _data = UserComData.ShopBossData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.BossSkinLevelList[_index];
                _curCount = UserComData.PlayerSKinInfo.BossSkinFragmentCount[_index];
                _fragmentName = UserComData.ShopBossData[this.curselectIndex].fragmentName;
                _fragmentImg = UserComData.ShopBossData[this.curselectIndex].fragmentImg;
            }
            let _maxCount = _data.level[_curLevel.toString()].fragment;
            if (_curCount < _maxCount) {
                Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getInfo", { type: 3, count: 100, fragment: { type: this.TagType, id: this.curselectIndex, fragmentName: _fragmentName, fragmentImg: _fragmentImg } });
                }));
                return;
            }
            if (_data.level[_curLevel.toString()].needtype == 1) {
                if (UserComData.userGold < _data.level[_curLevel.toString()].needcount) {
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("角色升级金币不足", "角色升级金币不足"));
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getInfo", { type: 1, count: 500 });
                    }));
                    return;
                }
                else {
                    UserComData.userGold -= _data.level[_curLevel.toString()].needcount;
                }
            }
            else if (_data.level[_curLevel.toString()].needtype == 2) {
                if (UserComData.userDiamond < _data.level[_curLevel.toString()].needcount) {
                    Laya.Scene.open("view/game/VideoPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getInfo", { type: 2, count: 50 });
                    }));
                    return;
                }
                else {
                    UserComData.userDiamond -= _data.level[_curLevel.toString()].needcount;
                }
            }
            this.showLevelUpWindow();
            if (this.TagType == 1) {
                UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_index] -= _maxCount;
                UserComData.PlayerSKinInfo.RoleSkinLevelList[_index]++;
            }
            else if (this.TagType == 2) {
                UserComData.PlayerSKinInfo.BossSkinFragmentCount[_index] -= _maxCount;
                UserComData.PlayerSKinInfo.BossSkinLevelList[_index]++;
            }
            RequestMgr.UpdatePlayerAny({
                "userDiamond": UserComData.userDiamond.toString(),
                "userGold": UserComData.userGold.toString(),
                "PlayerSKinInfo": UserComData.PlayerSKinInfo
            });
            this.showInfoWindow();
            this.UpdatePlayerMoneny();
        }
        showLevelUpWindow() {
            SoundMgr.inst.playSound("upgrade");
            let _index = this.curselectIndex;
            let _data;
            let _curLevel;
            if (this.TagType == 1) {
                _data = UserComData.ShopRoleData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.RoleSkinLevelList[_index];
                this.l_attributeImg.skin = "role/icon_hp.png";
                this.curblood.text = _data.level[_curLevel.toString()].blood;
                this.nextblood.text = _data.level[(_curLevel + 1).toString()].blood;
            }
            else {
                _data = UserComData.ShopBossData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.BossSkinLevelList[_index];
                this.l_attributeImg.skin = "role/icon_ask.png";
                this.curblood.text = _data.level[_curLevel.toString()].attack;
                this.nextblood.text = _data.level[(_curLevel + 1).toString()].attack;
            }
            this.curlevel.text = _curLevel;
            this.nextlevel.text = _curLevel + 1 + "";
            this.curspeed.text = _data.level[_curLevel.toString()].speed;
            this.nextspeed.text = _data.level[(_curLevel + 1).toString()].speed;
            this.levelUpWindow.visible = true;
        }
        closeLevelUpWindow() {
            SoundMgr.inst.playSound("click");
            this.levelUpWindow.visible = false;
        }
        showInfoWindow() {
            SoundMgr.inst.playSound("click");
            console.log("刷新");
            this.CheckCanForeverUnlock();
            this.refreshtRoleData();
            let _index = this.curselectIndex;
            let _data;
            let _curLevel;
            let _curCount;
            let UnlockList = [];
            if (this.TagType == 1) {
                _data = UserComData.ShopRoleData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.RoleSkinLevelList[_index];
                _curCount = UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_index];
                this.attributeImg.skin = "role/icon_hp.png";
                this.blood.text = _data.level[_curLevel.toString()].blood;
                this.info_title.skin = "role/font_26.png";
                UnlockList = this.RoleUnLock;
                this.btnUse.visible = UserComData.PlayerSKinInfo.userRoleSkinId != _index;
                this.using.visible = UserComData.PlayerSKinInfo.userRoleSkinId == _index;
                this.fragment.skin = UserComData.ShopRoleData[this.curselectIndex].fragmentImg;
            }
            else if (this.TagType == 2) {
                _data = UserComData.ShopBossData[this.curselectIndex];
                _curLevel = UserComData.PlayerSKinInfo.BossSkinLevelList[_index];
                _curCount = UserComData.PlayerSKinInfo.BossSkinFragmentCount[_index];
                this.attributeImg.skin = "role/icon_ask.png";
                this.blood.text = _data.level[_curLevel.toString()].attack;
                this.info_title.skin = "role/font_79.png";
                UnlockList = this.BossUnLock;
                this.btnUse.visible = UserComData.PlayerSKinInfo.userBossSKinId != _index;
                this.using.visible = UserComData.PlayerSKinInfo.userBossSKinId == _index;
                this.fragment.skin = UserComData.ShopBossData[this.curselectIndex].fragmentImg;
            }
            this.desc.skin = _data.desc;
            let _maxCount = _data.level[_curLevel.toString()].fragment;
            let _maxlevel = _data.maxLevel;
            this.fragmentCount.text = _curCount + "/" + _maxCount;
            this.speed.text = _data.level[_curLevel.toString()].speed;
            this.level.text = _curLevel + "";
            if (_curLevel < _maxlevel) {
                this.img_level.skin = "role/tips_lvup_01.png";
                this.max.visible = false;
                this.progressBg.visible = true;
                let _bili = (_curCount / _maxCount) > 1 ? 1 : (_curCount / _maxCount);
                this.progress.width = _bili * 340;
                this.btnLevelUp.visible = true;
                this.lv_count.text = _data.level[_curLevel.toString()].needcount + "";
                this.using.centerX = 200;
                this.btnUse.centerX = 200;
            }
            else {
                this.img_level.skin = "role/tips_lvup_02.png";
                this.max.visible = true;
                this.progressBg.visible = false;
                this.btnLevelUp.visible = false;
                this.using.centerX = 0;
                this.btnUse.centerX = 0;
            }
            if (_data.type == 1) {
                this.mode.skin = "role/icon_cat.png";
            }
            else {
                this.mode.skin = "role/icon_boss.png";
            }
            this.roleName.skin = _data.roleName;
            this.btnunLock.getChildByName("img").bottom = 20;
            if (_data.getMode == 1) {
                this.count.text = _data.count;
                this.img.skin = "game/icon_coin.png";
                this.img.left = -70;
            }
            else if (_data.getMode == 2) {
                this.count.text = _data.count;
                this.img.skin = "game/icon_dimo.png";
                this.img.left = -90;
            }
            else if (_data.getMode == 3) {
            }
            else if (_data.getMode == 4) {
                if (UnlockList[_index] == 0) {
                    this.count.visible = false;
                    let _img = this.btnunLock.getChildByName("img");
                    _img.bottom = 50;
                    _img.skin = "role/font_22.png";
                    if (this._canForever) {
                        _img.skin = "role/font_63.png";
                    }
                    this.desc.skin = "role/font_int_11.png";
                }
            }
            else if (_data.getMode == 5) {
                if (UnlockList[_index] == 0) {
                    this.count.visible = false;
                    let _img = this.btnunLock.getChildByName("img");
                    _img.bottom = 50;
                    _img.skin = "role/font_22.png";
                    if (this._canForever) {
                        _img.skin = "role/font_63.png";
                    }
                    this.desc.skin = "role/font_int_01.png";
                }
            }
            if (UnlockList[_index] == 0) {
                this.btnUse.visible = false;
                this.using.visible = false;
                this.btnLevelUp.visible = false;
                this.btnunLock.visible = true;
                this.btnTry.visible = true;
                this.img_level.skin = "role/tips_lvup_00.png";
            }
            else {
                this.btnunLock.visible = false;
                this.btnTry.visible = false;
            }
            this.updateHeadData();
            this.InfoWindow.visible = true;
            zs.laya.sdk.SdkService.hideBanner();
        }
        CheckCanForeverUnlock() {
            this._canForever = false;
            if (this.curselectIndex == 3 && UserComData.signSkinState[0] == 1) {
                this._canForever = true;
            }
            else if (this.curselectIndex == 4 && UserComData.signSkinState[1] == 1) {
                this._canForever = true;
            }
            else if (this.curselectIndex == 5 && UserComData.signSkinState[2] == 1) {
                this._canForever = true;
            }
            else if (this.curselectIndex == 1 && UserComData.LotteryCount > 1) {
                this._canForever = true;
            }
            else if (this.curselectIndex == 2 && UserComData.LotteryCount > 4) {
                this._canForever = true;
            }
        }
        StartPlayAni() {
            if (Laya.timer.currTimer - this.PlayAniTime < 1000)
                return;
            this.PlayAniTime = Laya.timer.currTimer;
            if (this.TagType == 1) {
                SceneLogic.inst.ShowRoleWinAni(900, 0);
            }
            else if (this.TagType == 2) {
                SceneLogic.inst.ShowRoleWinAni(1000, 0.2);
            }
        }
        closeInfoWindow() {
            SoundMgr.inst.playSound("click");
            SceneLogic.inst.closeRole();
            this.refreshtRoleData();
            this.InfoWindow.visible = false;
        }
        closefragmentSource() {
            SoundMgr.inst.playSound("click");
            this.fragmentSource.visible = false;
        }
        openfragmentSource() {
            SoundMgr.inst.playSound("click");
            this.fragmentSource.visible = true;
        }
        goStartClick() {
            SoundMgr.inst.playSound("click");
            SceneLogic.inst.closeRole();
            this.close();
        }
        goShopClick() {
            SoundMgr.inst.playSound("click");
            this.TagType = 3;
            this.fragmentSource.visible = false;
            SceneLogic.inst.closeRole();
            this.InfoWindow.visible = false;
            this.updateTagState();
        }
        goBoxClick() {
            SoundMgr.inst.playSound("click");
            this.TagType = 4;
            this.fragmentSource.visible = false;
            SceneLogic.inst.closeRole();
            this.InfoWindow.visible = false;
            this.updateTagState();
        }
        close() {
            if (UserComData.outskirtsGuide && UserComData.outGuideId == 3) {
                UserComData.outGuideId = 4;
                RequestMgr.UpdatePlayerByKey("outGuideId", UserComData.outGuideId.toString());
            }
            SoundMgr.inst.playSound("click");
            Laya.Scene.close("view/game/RolePage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class SignPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this._isClick = false;
            this.curSelectIndex = -1;
        }
        onAwake() {
            super.onAwake();
            this.LoadingWindow = this.owner.getChildByName("LoadingWindow");
            this.LoadingWindow.visible = false;
            let topUI = this.owner.getChildByName("topUI");
            let goldBg = topUI.getChildByName("goldBg");
            let fishBg = topUI.getChildByName("fishBg");
            this.lblGold = goldBg.getChildByName("lblGold");
            this.lblDialond = fishBg.getChildByName("lblDialond");
            this.bg = this.owner.getChildByName("bg");
            this.btnClose = this.bg.getChildByName("btnClose");
            this.btnSign = this.bg.getChildByName("btnSign");
            this.btnVideoSign = this.bg.getChildByName("btnVideoSign");
            this.video_img = this.btnVideoSign.getChildByName("img");
            this.rolePos = this.bg.getChildByName("rolePos");
            this.btnSign.visible = (UserComData.SignInfo.normalSignCount < 7 && !UserComData.SignInfo.isSign);
            this.btnVideoSign.visible = (UserComData.SignInfo.normalSignCount < 7 && !UserComData.SignInfo.isSign);
            if (UserComData.SignInfo.isSign) {
                this.curSelectIndex = UserComData.SignInfo.normalSignCount - 1;
            }
            else {
                this.curSelectIndex = UserComData.SignInfo.normalSignCount;
            }
            SceneLogic.inst.closeRole();
            this.signList = this.bg.getChildByName("signList");
            this.UpdatePlayerMoneny();
            this.RenderSignList();
            Laya.timer.once(700, this, () => {
                SceneLogic.inst.showSignRole(this.rolePos, "signBoy", 2.4);
            });
            this.AddEvent();
        }
        RenderSignList() {
            for (let i = 0; i < 7; i++) {
                let cell = this.signList.getChildByName("item" + (i + 1));
                let select = cell.getChildByName("select");
                let mode = cell.getChildByName("mode");
                let icon = cell.getChildByName("icon");
                if (i == 6) {
                    icon.visible = false;
                }
                mode.visible = false;
                select.visible = false;
                if (i <= this.curSelectIndex) {
                    mode.visible = true;
                    if (this.curSelectIndex == i && !UserComData.SignInfo.isSign) {
                        mode.visible = false;
                    }
                    if (UserComData.SignInfo.videoSignList[i] == 0) {
                        mode.skin = "sign/font_35.png";
                    }
                    else {
                        mode.skin = "sign/font_51.png";
                    }
                }
                if (this.curSelectIndex == i) {
                    select.visible = true;
                    this.updateState(i);
                }
                cell.on(Laya.Event.CLICK, this, () => {
                    this.curSelectIndex = i;
                    SoundMgr.inst.playSound("click");
                    for (let j = 0; j < 7; j++) {
                        let _cell = this.signList.getChildByName("item" + (j + 1));
                        let _select = _cell.getChildByName("select");
                        _select.visible = false;
                        if (this.curSelectIndex == j) {
                            _select.visible = true;
                        }
                    }
                    this.updateState(i);
                });
            }
        }
        updateState(i) {
            if (i <= UserComData.SignInfo.normalSignCount && UserComData.SignInfo.videoSignList[i] == 0) {
                this.btnVideoSign.visible = true;
                if (UserComData.SignInfo.isSign) {
                    this.btnSign.visible = false;
                    this.video_img.skin = "sign/font_34.png";
                    if (i == UserComData.SignInfo.normalSignCount) {
                        this.btnVideoSign.visible = false;
                    }
                }
                else {
                    if (i == UserComData.SignInfo.normalSignCount) {
                        this.btnSign.visible = true;
                        this.video_img.skin = "sign/font_30.png";
                    }
                    else {
                        this.btnSign.visible = false;
                        this.video_img.skin = "sign/font_34.png";
                    }
                }
            }
            else {
                this.btnVideoSign.visible = false;
                this.btnSign.visible = false;
            }
        }
        UpdatePlayerMoneny() {
            this.lblGold.text = UserComData.userGold + "";
            this.lblDialond.text = UserComData.userDiamond + "";
        }
        AddEvent() {
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.btnSign.on(Laya.Event.CLICK, this, this.SignClick);
            this.btnVideoSign.on(Laya.Event.CLICK, this, this.VideoClick);
            EventMgr.inst.onEvent("ShowRolePrefab", this, this.ShowRolePrefab);
            EventMgr.inst.onEvent("TrySkinStartGame", this, this.close);
        }
        RemoveEvent() {
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.btnSign.off(Laya.Event.CLICK, this, this.SignClick);
            this.btnVideoSign.off(Laya.Event.CLICK, this, this.VideoClick);
            EventMgr.inst.onOffEvent("ShowRolePrefab", this, this.ShowRolePrefab);
            EventMgr.inst.onOffEvent("TrySkinStartGame", this, this.close);
        }
        ShowRolePrefab() {
            SceneLogic.inst.showSignRole(this.rolePos, "signBoy", 2.4);
        }
        VideoClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(200, this, () => {
                this._isClick = null;
            });
            if (!UserComData.isFinishLoad) {
                this.LoadingWindow.visible = true;
                this.LoopCheckLoad();
                return;
            }
            zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("签到按钮点击", "签到按钮点击"));
            this.showGetPage();
        }
        LoopCheckLoad() {
            let self = this;
            Laya.timer.loop(300, self, function CsLoad() {
                if (UserComData.isFinishLoad) {
                    Laya.timer.clear(self, CsLoad);
                    self.LoadingWindow.visible = false;
                    self.VideoClick();
                    return;
                }
            });
        }
        showGetPage() {
            if (this.curSelectIndex == UserComData.SignInfo.normalSignCount) {
                this.btnSign.visible = false;
                this.btnVideoSign.visible = false;
                UserComData.SignInfo.normalSignCount++;
                UserComData.SignInfo.isSign = true;
            }
            let _data = UserComData.SignData[this.curSelectIndex];
            let _gold = 0;
            let _diamond = 0;
            let _skinId = -1;
            if (_data.type == 1) {
                _gold = _data.count;
                UserComData.userGold += _data.count;
                this.UpdatePlayerMoneny();
            }
            else if (_data.type == 2) {
                _diamond = _data.count;
                UserComData.userDiamond += _data.count;
                this.UpdatePlayerMoneny();
            }
            else if (_data.type == 3) {
                _skinId = _data.skinId;
                SceneLogic.inst.closeRole();
            }
            UserComData.taskInfo.taskGetList[2]++;
            if (UserComData.taskInfo.taskGetList[2] == UserComData.taskData[2].num) {
                UserComData.taskInfo.taskStateList[2] = 1;
            }
            UserComData.SignInfo.videoSignCount++;
            UserComData.SignInfo.videoSignList[this.curSelectIndex] = 1;
            if (UserComData.SignInfo.isSign && UserComData.SignInfo.videoSignList[UserComData.SignInfo.normalSignCount - 1] == 1) {
                this.btnVideoSign.visible = false;
            }
            RequestMgr.UpdatePlayerAny({
                "userDiamond": UserComData.userDiamond.toString(),
                "userGold": UserComData.userGold.toString(),
                "SignInfo": UserComData.SignInfo,
                "taskInfo": UserComData.taskInfo
            });
            SoundMgr.inst.playSound("click");
            SceneLogic.inst.closeRole();
            Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond, skinId: _skinId });
                Laya.Scene.close("view/game/SignPage.scene");
            }));
            this.updateState(this.curSelectIndex);
            if (this.signList.getChildByName("item" + (this.curSelectIndex + 1)) != null) {
                this.signList.getChildByName("item" + (this.curSelectIndex + 1)).getChildByName("mode").visible = true;
                this.signList.getChildByName("item" + (this.curSelectIndex + 1)).getChildByName("mode").skin = "sign/font_51.png";
            }
        }
        SignClick() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            SoundMgr.inst.playSound("click");
            let _gold = UserComData.SignData[UserComData.SignInfo.normalSignCount].gold;
            UserComData.userGold += _gold;
            this.UpdatePlayerMoneny();
            UserComData.SignInfo.normalSignCount++;
            UserComData.SignInfo.isSign = true;
            this.signList.getChildByName("item" + (this.curSelectIndex + 1)).getChildByName("mode").visible = true;
            this.btnSign.visible = false;
            RequestMgr.UpdatePlayerAny({
                "userGold": UserComData.userGold.toString(),
                "SignInfo": UserComData.SignInfo
            });
            Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                Laya.stage.event("getMoney", { gold: _gold, diamond: 0 });
            }));
            this.updateState(this.curSelectIndex);
        }
        close() {
            SoundMgr.inst.playSound("click");
            SceneLogic.inst.closeRole();
            Laya.Scene.close("view/game/SignPage.scene");
            Laya.stage.event("closePage");
        }
        onEnable() {
            super.onEnable();
            zs.laya.sdk.SdkService.showBanner();
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
            zs.laya.sdk.SdkService.hideBanner();
        }
    }

    class TaskPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this.curselectIndex = -1;
        }
        onAwake() {
            super.onAwake();
            this.taskList.array = [];
            this.taskList.vScrollBarSkin = "";
            this.progressList.array = [];
            this.InitRender();
            this.AddEvent();
        }
        progressRender(cell, index) {
            let _data = UserComData.taskBoxData[index];
            let img = cell.getChildByName("img");
            let count = cell.getChildByName("count");
            count.text = 20 * (index + 1) + "";
            if (UserComData.taskInfo.taskBoxList[index] == 0) {
                img.skin = "role/icon_gift_00.png";
            }
            else if (UserComData.taskInfo.taskBoxList[index] == 1) {
                img.skin = "role/icon_gift.png";
            }
            else if (UserComData.taskInfo.taskBoxList[index] == 2) {
                img.skin = "role/icon_gift_open.png";
            }
            cell.on(Laya.Event.CLICK, cell, () => {
                if (UserComData.taskInfo.taskBoxList[index] != 1)
                    return;
                UserComData.taskInfo.taskBoxList[index] = 2;
                let value = 20 * (index + 1);
                let _vtName = "活跃" + value + "完成";
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt(_vtName, _vtName));
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("活跃奖励点击", "活跃奖励点击"));
                let _gold = 0;
                let _diamond = 0;
                if (_data.type == 1) {
                    _gold = _data.count;
                    UserComData.userGold += _data.count;
                }
                else if (_data.type == 2) {
                    _diamond = _data.count;
                    UserComData.userDiamond += _data.count;
                }
                let _fragmentName = "";
                let _fragmentImg = "";
                let _ranF = UserComData.PlayerSKinInfo.buyFragmentList[Utils.Range(0, UserComData.PlayerSKinInfo.buyFragmentList.length - 1)];
                let _type = 1;
                if (_ranF < 100) {
                    _type = 1;
                    _fragmentName = UserComData.ShopRoleData[_ranF].fragmentName;
                    _fragmentImg = UserComData.ShopRoleData[_ranF].fragmentImg;
                    UserComData.PlayerSKinInfo.RoleSkinFragmentCount[_ranF] += _data.fragmentCount;
                }
                else {
                    _type = 2;
                    _fragmentName = UserComData.ShopBossData[_ranF % 100].fragmentName;
                    _fragmentImg = UserComData.ShopBossData[_ranF % 100].fragmentImg;
                    UserComData.PlayerSKinInfo.BossSkinFragmentCount[_ranF % 100] += _data.fragmentCount;
                }
                Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond, fragment: { type: _type, id: _ranF % 100, fragmentName: _fragmentName, fragmentImg: _fragmentImg, fragmentCount: _data.fragmentCount } });
                    RequestMgr.UpdatePlayerAny({
                        "userDiamond": UserComData.userDiamond.toString(),
                        "userGold": UserComData.userGold.toString(),
                        "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                        "taskInfo": UserComData.taskInfo
                    });
                    this.UpdateRender();
                }));
            });
        }
        TaskRender(cell, index) {
            let _data = UserComData.taskData[index];
            let bg = cell.getChildByName("bg");
            let desc = bg.getChildByName("desc");
            let count = bg.getChildByName("count");
            let goldBg = bg.getChildByName("goldBg");
            let gold = goldBg.getChildByName("gold");
            let img = goldBg.getChildByName("img");
            let integralBG = bg.getChildByName("integralBG");
            let integral = integralBG.getChildByName("integral");
            let btnOver = cell.getChildByName("btnOver");
            let btnGet = cell.getChildByName("btnGet");
            let btnGo = cell.getChildByName("btnGo");
            let num = UserComData.taskInfo.taskGetList[index] > _data.num ? _data.num : UserComData.taskInfo.taskGetList[index];
            desc.text = _data.desc;
            count.font = UserComData.taskInfo.taskStateList[index] == 0 ? "shuzi02" : "shuzi01";
            count.text = num + "/" + _data.num;
            gold.text = _data.count;
            img.skin = _data.type == 1 ? "game/icon_coin.png" : "game/icon_dimo.png";
            integral.text = _data.integral;
            btnOver.visible = UserComData.taskInfo.taskStateList[index] == 2;
            btnGet.visible = UserComData.taskInfo.taskStateList[index] == 1;
            btnGo.visible = UserComData.taskInfo.taskStateList[index] == 0;
            bg.skin = UserComData.taskInfo.taskStateList[index] == 0 ? "game/bg_rank_tips_01.png" : "game/bg_rank_tips_00.png";
            btnGo.on(Laya.Event.CLICK, cell, () => {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("任务前往按钮点击", "任务前往按钮点击"));
                switch (_data.mode) {
                    case TaskMode.Runner:
                    case TaskMode.Pursuer:
                        this.close();
                        break;
                    case TaskMode.Sign:
                        this.GoSignPage();
                        break;
                    case TaskMode.Share:
                        this.close();
                        break;
                    case TaskMode.BuySkill:
                        this.close();
                        break;
                    case TaskMode.OpenDailyBox:
                        this.GoBoxWindow();
                        break;
                    case TaskMode.BuyFragment:
                        this.goFargmentWindow();
                        break;
                    default:
                        break;
                }
            });
            btnGet.on(Laya.Event.CLICK, cell, () => {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("任务完成按钮点击", "任务完成按钮点击"));
                let _gold = 0;
                let _diamond = 0;
                if (_data.type == 1) {
                    _gold = _data.count;
                    UserComData.userGold += _data.count;
                }
                else if (_data.type == 2) {
                    _diamond = _data.count;
                    UserComData.userDiamond += _data.count;
                }
                UserComData.taskInfo.taskprogress += _data.integral;
                UserComData.taskInfo.taskStateList[index] = 2;
                Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                    Laya.stage.event("getMoney", { gold: _gold, diamond: _diamond });
                    this.UpdateProgress();
                    RequestMgr.UpdatePlayerAny({
                        "userGold": UserComData.userGold.toString(),
                        "userDiamond": UserComData.userDiamond.toString(),
                        "taskInfo": UserComData.taskInfo
                    });
                    this.UpdateRender();
                }));
            });
        }
        InitRender() {
            let list = [];
            for (let i = 0; i < UserComData.taskInfo.taskGetList.length; i++) {
                list.push(0);
            }
            this.taskList.array = list;
            let prolist = [];
            for (let i = 0; i < UserComData.taskInfo.taskBoxList.length; i++) {
                prolist.push(0);
            }
            this.progressList.array = prolist;
            this.UpdateProgress();
            this.UpdateRender();
        }
        UpdateRender() {
            this.taskList.refresh();
            this.taskList.renderHandler = new Laya.Handler(this, this.TaskRender);
            this.progressList.refresh();
            this.progressList.renderHandler = new Laya.Handler(this, this.progressRender);
        }
        UpdateProgress() {
            this.pro_count.text = UserComData.taskInfo.taskprogress + "";
            let _width = UserComData.taskInfo.taskprogress / 100;
            this.progress.width = (_width > 1 ? 1 : _width) * 1142;
            for (let i = 0; i < UserComData.taskInfo.taskBoxList.length; i++) {
                if (UserComData.taskInfo.taskBoxList[i] == 0) {
                    UserComData.taskInfo.taskBoxList[i] = UserComData.taskInfo.taskprogress >= 20 * (i + 1) ? 1 : 0;
                }
            }
        }
        GoSignPage() {
            EventMgr.inst.emit("openSign");
            this.close();
        }
        Share() {
            Laya.stage.once(zs.laya.sdk.DeviceService.EVENT_ON_SHOW, this, function (timeStamp) {
                if (Date.now() - timeStamp > 3000) {
                    UserComData.taskInfo.taskGetList[3]++;
                    if (UserComData.taskInfo.taskGetList[3] == UserComData.taskData[3].num) {
                        UserComData.taskInfo.taskStateList[3] = 1;
                    }
                    RequestMgr.UpdatePlayerAny({
                        "taskInfo": UserComData.taskInfo,
                    });
                    this.UpdateRender();
                    zs.laya.game.UIService.showToast("分享成功");
                }
                else {
                    zs.laya.game.UIService.showToast("分享失败");
                }
            }, [Date.now()]);
            zs.laya.sdk.SdkService.openShare(zs.laya.platform.ADConfig.zs_share_title, zs.laya.platform.ADConfig.zs_share_image);
        }
        GoBoxWindow() {
            EventMgr.inst.emit("openBox");
            this.close();
        }
        goFargmentWindow() {
            EventMgr.inst.emit("openFragment");
            this.close();
        }
        AddEvent() {
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
        }
        RemoveEvent() {
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
        }
        close() {
            console.log("1111----");
            Laya.Scene.close("view/game/TaskPage.scene");
            Laya.stage.event("closePage");
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
        }
    }

    class VideoPageUI extends zs.laya.base.ZhiSeView {
        constructor() {
            super();
            this._isClick = false;
            this.getType = 1;
            this.count = 0;
        }
        onAwake() {
            super.onAwake();
            this.requireBg = this.owner.getChildByName("requireBg");
            this.buy_title = this.requireBg.getChildByName("buy_title");
            this.btnClose = this.requireBg.getChildByName("btnClose");
            this.bg = this.requireBg.getChildByName("bg");
            this.requireImg = this.bg.getChildByName("requireImg");
            this.requireCount = this.requireBg.getChildByName("requireCount");
            this.btnBuy = this.requireBg.getChildByName("btnBuy");
            this.AddEvent();
        }
        AddEvent() {
            Laya.stage.on("getInfo", this, this.setInfo);
            this.btnClose.on(Laya.Event.CLICK, this, this.close);
            this.btnBuy.on(Laya.Event.CLICK, this, this.VideoBuy);
        }
        setInfo(arg) {
            if (!arg) {
                this.close();
                return;
            }
            ;
            this.arg = arg;
            this.getType = arg.type || 1;
            this.requireCount.centerY = 40;
            if (this.getType == 1) {
                this.buy_title.skin = "role/tips_name_02.png";
                this.requireImg.skin = "game/icon_coin.png";
            }
            else if (this.getType == 2) {
                this.buy_title.skin = "role/tips_name_01.png";
                this.requireImg.skin = "game/icon_dimo.png";
            }
            else if (this.getType == 3) {
                this.buy_title.skin = "role/tips_name_00.png";
                this.requireImg.skin = arg.fragment.fragmentImg;
                this.requireCount.centerY = 60;
            }
            else if (this.getType == 4) {
                this.buy_title.skin = "game/tips_name_08.png";
                this.requireImg.skin = "game/icon_tili.png";
            }
            else if (this.getType == 5) {
                this.buy_title.skin = "game/tips_name_09.png";
                this.requireImg.skin = "game/icon_time.png";
            }
            this.requireCount.text = arg.count;
            this.count = arg.count;
        }
        VideoBuy() {
            if (this._isClick) {
                return;
            }
            this._isClick = true;
            Laya.timer.once(500, this, () => {
                this._isClick = null;
            });
            let _gold = 0;
            let _diamond = 0;
            SoundMgr.inst.playSound("click");
            if (this.getType == 3) {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("碎片不足弹窗视频按钮点击", "碎片不足弹窗视频按钮点击"));
            }
            else if (this.getType == 1) {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("马上获得猫爪币按钮点击", "马上获得猫爪币按钮点击"));
            }
            else if (this.getType == 2) {
                zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("马上获得小鱼钻按钮点击", "马上获得小鱼钻按钮点击"));
            }
            zs.laya.sdk.SdkService.playVideo(Laya.Handler.create(this, function () {
                if (this.getType == 1) {
                    _gold = this.count;
                    UserComData.userGold += this.count;
                    RequestMgr.UpdatePlayerByKey("userGold", UserComData.userGold.toString());
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功获得猫爪币打点", "视频成功获得猫爪币打点"));
                    Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getMoney", { gold: _gold });
                        this.close();
                    }));
                }
                else if (this.getType == 2) {
                    _diamond = this.count;
                    UserComData.userDiamond += this.count;
                    RequestMgr.UpdatePlayerByKey("userDiamond", UserComData.userDiamond.toString());
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功获得小鱼钻打点", "视频成功获得小鱼钻打点"));
                    Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getMoney", { diamond: _diamond });
                        this.close();
                    }));
                }
                else if (this.getType == 3) {
                    if (this.arg.fragment.type == 1) {
                        UserComData.PlayerSKinInfo.RoleSkinFragmentCount[this.arg.fragment.id] += this.count;
                    }
                    else if (this.arg.fragment.type == 2) {
                        UserComData.PlayerSKinInfo.BossSkinFragmentCount[this.arg.fragment.id] += this.count;
                    }
                    RequestMgr.UpdatePlayerByKey("PlayerSKinInfo", UserComData.PlayerSKinInfo);
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功获取碎片打点", "视频成功获取碎片打点"));
                    Laya.stage.event("RefreshRoleFragment");
                    Laya.Scene.open("view/game/GetPage.scene", false, {}, Laya.Handler.create(this, () => {
                        Laya.stage.event("getMoney", { fragment: { type: this.arg.fragment.type, id: this.arg.fragment.id, fragmentName: this.arg.fragment.fragmentName, fragmentImg: this.arg.fragment.fragmentImg, fragmentCount: this.count } });
                        this.close();
                    }));
                }
                else if (this.getType == 4) {
                    UserComData.activityInfo.strength = UserComData.maxStrength;
                    UserComData.activityInfo.lastUseStrengthTime = Laya.timer.currTimer;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("视频成功获取体力打点", "视频成功获取体力打点"));
                    Laya.stage.event("updateStrength");
                    this.close();
                }
                else if (this.getType == 5) {
                    UserComData.AddTimeState = 1;
                    zs.laya.tdapp.tdAppSdk.event(new zs.laya.tdapp.customEvt("妖怪模式视频成功增加时长打点", "妖怪模式视频成功增加时长打点"));
                    this.close();
                }
            }), Laya.Handler.create(this, function () {
                zs.laya.game.UIService.showToast("看完视频才可获取奖励哦~~");
            }), Laya.Handler.create(this, function () {
            }));
        }
        RemoveEvent() {
            Laya.stage.off("getInfo", this, this.setInfo);
            this.btnClose.off(Laya.Event.CLICK, this, this.close);
            this.btnBuy.off(Laya.Event.CLICK, this, this.VideoBuy);
        }
        close() {
            if (this.getType == 5 && UserComData.AddTimeState == 0) {
                UserComData.AddTimeState = 2;
            }
            SoundMgr.inst.playSound("click");
            console.log("1111----");
            Laya.Scene.close("view/game/VideoPage.scene");
        }
        onEnable() {
            zs.laya.sdk.SdkService.showBanner();
        }
        onDisable() {
            super.onDisable();
            this.RemoveEvent();
            zs.laya.sdk.SdkService.hideBanner();
        }
    }

    class DyqqShader {
        static get ShaderName() {
            return "DyqqShader";
        }
        static initShader() {
            let attributeMap = {
                'a_Position': Laya.VertexMesh.MESH_POSITION0,
                'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
                'a_Texcoord': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            };
            let uniformMap = {
                'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
                'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
                'u_BaseTextureSrc': Laya.Shader3D.PERIOD_MATERIAL,
                'u_BaseTextureDst': Laya.Shader3D.PERIOD_MATERIAL,
                'u_alpha': Laya.Shader3D.PERIOD_MATERIAL,
            };
            let vs = `
            attribute vec4 a_Position;
            uniform mat4 u_MvpMatrix;
            uniform mat4 u_WorldMat;
            attribute vec2 a_Texcoord;
            attribute vec3 a_Normal;
            varying vec3 v_Normal;
            varying vec2 v_Texcoord;
            void main()
            {
                gl_Position = u_MvpMatrix * a_Position;
                mat3 worldMat=mat3(u_WorldMat);
                v_Normal=worldMat*a_Normal;
                v_Texcoord = a_Texcoord;
            }`;
            let ps = `
            #ifdef FSHIGHPRECISION
                precision highp float;
            #else
                precision mediump float;
            #endif
            varying vec3 v_Normal;
            varying vec2 v_Texcoord;
            uniform sampler2D u_BaseTextureSrc;
            uniform sampler2D u_BaseTextureDst;
            uniform float u_alpha;
            void main()
            {
                vec4 srcColor = texture2D(u_BaseTextureSrc,v_Texcoord);
                vec4 desColor = texture2D(u_BaseTextureDst,v_Texcoord);
                srcColor = srcColor * u_alpha;
                float destAlpha = 1.0 - u_alpha;
                desColor = desColor * destAlpha;
                gl_FragColor=srcColor + desColor;
            }`;
            let customShader = Laya.Shader3D.add(DyqqShader.ShaderName);
            let subShader = new Laya.SubShader(attributeMap, uniformMap);
            customShader.addSubShader(subShader);
            subShader.addShaderPass(vs, ps);
        }
    }

    class DyqqMaterial extends Laya.Material {
        constructor() {
            super();
            this.setShaderName(DyqqShader.ShaderName);
        }
        get BaseTextureSrc() {
            return this._shaderValues.getTexture(DyqqMaterial.u_BaseTextureSrc);
        }
        set BaseTextureSrc(value) {
            if (value)
                this._defineDatas["add"](DyqqMaterial.u_BaseTextureSrc);
            else
                this._defineDatas["remove"](DyqqMaterial.u_BaseTextureSrc);
            this._shaderValues.setTexture(DyqqMaterial.u_BaseTextureSrc, value);
        }
        get BaseTextureDst() {
            return this._shaderValues.getTexture(DyqqMaterial.u_BaseTextureDst);
        }
        set BaseTextureDst(value) {
            if (value)
                this._defineDatas["add"](DyqqMaterial.u_BaseTextureDst);
            else
                this._defineDatas["remove"](DyqqMaterial.u_BaseTextureDst);
            this._shaderValues.setTexture(DyqqMaterial.u_BaseTextureDst, value);
        }
        get alpha() {
            return this._shaderValues.getNumber(DyqqMaterial.u_alpha);
        }
        set alpha(value) {
            this._shaderValues.setNumber(DyqqMaterial.u_alpha, value);
        }
    }
    DyqqMaterial.u_BaseTextureSrc = Laya.Shader3D.propertyNameToID("u_BaseTextureSrc");
    DyqqMaterial.u_BaseTextureDst = Laya.Shader3D.propertyNameToID("u_BaseTextureDst");
    DyqqMaterial.u_alpha = Laya.Shader3D.propertyNameToID("u_alpha");

    class ShaderTest extends Laya.Script {
        constructor() {
            super();
            this.totalTime = 4000;
            this.curTime = 0;
        }
        onEnable() {
        }
        onDisable() {
        }
        onStart() {
            var scene = Laya.stage.addChildAt(new Laya.Scene3D(), 0);
            var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
            camera.transform.translate(new Laya.Vector3(0, 3, 3));
            camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
            var directionLight = scene.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
            var box = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
            var material = new DyqqMaterial();
            Laya.loader.load(["res/layabox.png", "res/clip_replay_btn.png"], Laya.Handler.create(null, function () {
                material.BaseTextureSrc = Laya.loader.getRes("res/layabox.png");
                material.BaseTextureDst = Laya.loader.getRes("res/clip_replay_btn.png");
                material.alpha = 0.1;
            }));
            box.meshRenderer.material = material;
            this.testMaterial = material;
        }
        onUpdate() {
            if (this.testMaterial == null) {
                return;
            }
            this.curTime += Laya.timer.delta;
            if (this.curTime > this.totalTime) {
                this.curTime -= this.totalTime;
            }
            var percent = this.curTime / this.totalTime;
            if (percent < 0.5) {
                this.testMaterial.alpha = percent * 2;
            }
            else {
                this.testMaterial.alpha = 1 - (percent - 0.5) * 2;
            }
        }
    }

    class ExportScrollV3 extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
            this.owner["visible"] = zs.laya.platform.ADConfig.isPublicVersion();
            var left = this.left_adList.getComponent(zs.laya.platform.AdList);
            left || (left = this.left_adList.addComponent(zs.laya.platform.AdList));
            left.requestAdData("promotion", true, zs.laya.platform.AdList.SCROLL_VERTICAL, null, null, false, true);
            var right = this.right_adList.getComponent(zs.laya.platform.AdList);
            right || (right = this.right_adList.addComponent(zs.laya.platform.AdList));
            right.requestAdData("promotion", true, zs.laya.platform.AdList.SCROLL_VERTICAL, null, null, false, true);
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("compUI/FlashLight.ts", FlashLight);
            reg("compUI/ChallengPage.ts", ChallengPage);
            reg("compUI/FrienPlayView.ts", FrienPlayView);
            reg("logic/ButtonAnim.ts", ButtonAnim);
            reg("compUI/GameStartUI.ts", GameStartUI);
            reg("compUI/InviteBox.ts", InviteBox);
            reg("compUI/ActivityPageUI.ts", ActivityPageUI);
            reg("compUI/DailyPageUI.ts", DailyPageUI);
            reg("compUI/FreeTransformationPage.ts", FreeTransformationPage);
            reg("compUI/GamePlayUI.ts", GamePlayUI);
            reg("compUI/NativeAd.ts", NativeAd);
            reg("compUI/NativeAdView.ts", NativeAdView);
            reg("compUI/GetPage.ts", GetPage);
            reg("compUI/GuidePageUI.ts", GuidePageUI);
            reg("compUI/LotteryPageUI.ts", LotteryPageUI);
            reg("compUI/LuckyBoxPage.ts", LuckyBoxPage);
            reg("compUI/LuckyPage.ts", LuckyPage);
            reg("compUI/NoticePageUI.ts", NoticePageUI);
            reg("compUI/RankPageUI.ts", RankPageUI);
            reg("compUI/RankResultPageUI.ts", RankResultPageUI);
            reg("compUI/RolePageUI.ts", RolePageUI);
            reg("compUI/SignPageUI.ts", SignPageUI);
            reg("compUI/TaskPageUI.ts", TaskPageUI);
            reg("compUI/VideoPageUI.ts", VideoPageUI);
            reg("test/ShaderTest.ts", ShaderTest);
            reg("compUI/ExportScrollV3.ts", ExportScrollV3);
        }
    }
    GameConfig.width = 1334;
    GameConfig.height = 750;
    GameConfig.scaleMode = "fixedauto";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "view/ad/ChallengePage.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class ShopView extends zs.laya.ui.StorePage {
        constructor() {
            super();
            this.selectIndex = -1;
            this._isClick = false;
        }
        onAwake() {
            console.log("进入商城");
            this.addEvent();
        }
        onStart() {
            super.onStart();
        }
        addEvent() {
        }
        removeEvent() {
        }
        onDisable() {
            super.onDisable();
            this.removeEvent();
        }
        openView() {
        }
        refreshData() {
            this.playerList.array = this.playerData;
            this.playerList.refresh();
            this.playerList.renderHandler = new Laya.Handler(this, this.render);
        }
        updataDiamond() {
            Laya.stage.event("closeStore");
        }
        render(cell, index) {
        }
        close() {
        }
    }

    var ObjectPool = zs.laya.ObjectPool;
    var EventId$1 = zs.laya.game.EventId;
    var AppMain = zs.laya.game.AppMain;
    class GameLogic extends zs.laya.game.AppMain {
        constructor() {
            super();
            this.sceneLogic = null;
            this.pkgList = ["3dres", "sound", "role"];
            this.isLoad = false;
            this.baseResList = [
                "Bullet",
                "ef_BSDMM_hit",
                "ef_BSDMM_transformation",
                "role_boss",
                "role_boy_01",
                "role_boy_02",
                "role_boy_03",
                "role_girl_01",
                "role_girl_02",
                "role_girl_03",
                "ef_BSDMM_zhuajishouji",
                "ef_BSDMM_arrive",
                "signBoy",
                "lotteryGirl",
                "ef_BSDMM_fire1"
            ];
        }
        onAwake() {
            super.onAwake();
            zs.laya.game.UIService.viewScript.store = ShopView;
            zs.laya.game.UIService.viewScript.home = GameStartUI;
            UserComData.userLevel = Number(Laya.LocalStorage.getItem("userLevel") || 0);
            UserComData.userGold = Number(Laya.LocalStorage.getItem("userGold") || 500);
            UserComData.userDiamond = Number(Laya.LocalStorage.getItem("userDiamond") || 50);
            UserComData.LotteryCount = Number(Laya.LocalStorage.getItem("LotteryCount") || 0);
            UserComData.curDayLotteryCount = Number(Laya.LocalStorage.getItem("curDayLotteryCount") || 0);
            UserComData.outGuideId = Number(Laya.LocalStorage.getItem("outGuideId") || 0);
            UserComData.RoletrySkinId = Number(Laya.LocalStorage.getItem("RoletrySkinId") || -1);
            UserComData.cacheLevel = Number(Laya.LocalStorage.getItem("cacheLevel") || 1);
            UserComData.cacheVersion = Laya.LocalStorage.getItem("cacheVersion") || "";
            UserComData.nickName = Laya.LocalStorage.getItem("nickName") || "玩家";
            UserComData.gender = Number(Laya.LocalStorage.getItem("gender") || 0);
            UserComData.winCount = Number(Laya.LocalStorage.getItem("winCount") || 0);
            UserComData.winFreeLottery = Number(Laya.LocalStorage.getItem("winFreeLottery") || 0);
            UserComData.lostCount = Number(Laya.LocalStorage.getItem("lostCount") || 0);
            UserComData.avatarUrl = Laya.LocalStorage.getItem("avatarUrl") || "game/bg_head_01.png";
            UserComData.modeDifficultyLevel = Number(Laya.LocalStorage.getItem("modeDifficultyLevel") || 0);
            let _guide = Number(Laya.LocalStorage.getItem("isGuide")) || 0;
            let _outskirtsGuide = Number(Laya.LocalStorage.getItem("outskirtsGuide")) || 0;
            if (_outskirtsGuide == 0) {
                UserComData.outskirtsGuide = false;
            }
            else {
                UserComData.outskirtsGuide = false;
            }
            if (_guide == 0) {
                UserComData.isGuide = true;
            }
            else {
                UserComData.isGuide = false;
            }
            if (Laya.LocalStorage.getItem("RoleTipsList")) {
                UserComData.RoleTipsList = JSON.parse(Laya.LocalStorage.getItem("RoleTipsList"));
            }
            if (Laya.LocalStorage.getItem("HomeTipsList")) {
                UserComData.HomeTipsList = JSON.parse(Laya.LocalStorage.getItem("HomeTipsList"));
            }
            if (Laya.LocalStorage.getItem("activityInfo")) {
                UserComData.activityInfo = JSON.parse(Laya.LocalStorage.getItem("activityInfo"));
                if (UserComData.activityInfo["strength"] == undefined || UserComData.activityInfo["strength"] == null) {
                    UserComData.activityInfo["lastUseStrengthTime"] = 0;
                    UserComData.activityInfo["strength"] = UserComData.maxStrength;
                    Laya.LocalStorage.setItem("activityInfo", JSON.stringify(UserComData.activityInfo));
                }
            }
            if (Laya.LocalStorage.getItem("rankInfo")) {
                UserComData.rankInfo = JSON.parse(Laya.LocalStorage.getItem("rankInfo"));
                if (UserComData.rankInfo["rankArriveState"] == null || UserComData.rankInfo["rankArriveState"] == undefined || UserComData.rankInfo["rankArriveState"] == []) {
                    UserComData.rankInfo["rankArriveState"] = [0, 0, 0, 0, 0, 0, 0];
                    Laya.LocalStorage.setItem("rankInfo", JSON.stringify(UserComData.rankInfo));
                }
            }
            if (Laya.LocalStorage.getItem("haveDeleteTaskInfoNew") == null) {
                Laya.LocalStorage.removeItem("taskInfo");
                Laya.LocalStorage.setItem("haveDeleteTaskInfoNew", "true");
            }
            if (Laya.LocalStorage.getItem("taskInfo")) {
                UserComData.taskInfo = JSON.parse(Laya.LocalStorage.getItem("taskInfo"));
            }
            if (Laya.LocalStorage.getItem("Boxinfo")) {
                UserComData.Boxinfo = JSON.parse(Laya.LocalStorage.getItem("Boxinfo"));
            }
            if (Laya.LocalStorage.getItem("PlayerSKinInfo")) {
                UserComData.PlayerSKinInfo = JSON.parse(Laya.LocalStorage.getItem("PlayerSKinInfo"));
            }
            if (Laya.LocalStorage.getItem("SignInfo")) {
                UserComData.SignInfo = JSON.parse(Laya.LocalStorage.getItem("SignInfo"));
            }
            let _oldday = Laya.LocalStorage.getItem("Date") || 0;
            let curDate = new Date();
            let _day = curDate.getDate();
            UserComData.isNewDay = _oldday != _day;
            Laya.LocalStorage.setItem("Date", _day.toString());
            if (UserComData.isNewDay) {
                console.log("本地新的一天");
                Laya.LocalStorage.setItem("LuckyCount", "0");
                UserComData.curDayLotteryCount = 0;
                Laya.LocalStorage.setItem("curDayLotteryCount", UserComData.curDayLotteryCount.toString());
                Laya.LocalStorage.setItem("DailyData", JSON.stringify(UserComData.DailyData));
                UserComData.SignInfo.isSign = false;
                UserComData.activityInfo.shareCount = 0;
                for (let i = 0; i < UserComData.PlayerSKinInfo.buyFragmentState.length; i++) {
                    UserComData.PlayerSKinInfo.buyFragmentState[i] = 1;
                }
                for (let i = 0; i < UserComData.taskInfo.taskBoxList.length; i++) {
                    UserComData.taskInfo.taskBoxList[i] = 0;
                }
                for (let i = 0; i < UserComData.taskInfo.taskGetList.length; i++) {
                    UserComData.taskInfo.taskGetList[i] = 0;
                    UserComData.taskInfo.taskStateList[i] = 0;
                }
                for (let i = 0; i < UserComData.HomeTipsName.length; i++) {
                    const element = UserComData.HomeTipsName[i];
                    UserComData.HomeTipsList[element] = 0;
                }
                for (let i = 0; i < UserComData.RoleTipsName.length; i++) {
                    const element = UserComData.RoleTipsName[i];
                    UserComData.RoleTipsList[element] = 0;
                }
                UserComData.rankInfo["rankShareCount"] = 0;
                UserComData.activityInfo["PursuerFreeCount"] = 0;
                UserComData.taskInfo.taskprogress = 0;
                UserComData.PlayerSKinInfo.refreshFragmentCount = 0;
                UserComData.PlayerSKinInfo.freeCount = 1;
                Laya.LocalStorage.setItem("RoleTipsList", JSON.stringify(UserComData.RoleTipsList));
                Laya.LocalStorage.setItem("HomeTipsList", JSON.stringify(UserComData.HomeTipsList));
                Laya.LocalStorage.setItem("PlayerSKinInfo", JSON.stringify(UserComData.PlayerSKinInfo));
                Laya.LocalStorage.setItem("SignInfo", JSON.stringify(UserComData.SignInfo));
                Laya.LocalStorage.setItem("taskInfo", JSON.stringify(UserComData.taskInfo));
                Laya.LocalStorage.setItem("activityInfo", JSON.stringify(UserComData.activityInfo));
                Laya.LocalStorage.setItem("rankInfo", JSON.stringify(UserComData.rankInfo));
            }
            UserComData.DailyData = JSON.parse(Laya.LocalStorage.getItem("DailyData") || "{}");
            UserComData.LuckyCount = Number(Laya.LocalStorage.getItem("LuckyCount") || 0);
            Laya.stage.once(EventId$1.LAUNCH_COMPLETED, this, this.onGameLaunchReady);
            Laya.stage.on(EventId$1.UI_VIEW_CLOSED, this, this.onViewClosed);
            Laya.stage.on(EventId$1.UI_VIEW_OPENED, this, this.onViewOpened);
            Laya.stage.on(EventId$1.APP_SHOW, this, this.onAppShow);
            Laya.stage.on(EventId$1.APP_HIDE, this, this.onAppHide);
            Laya.stage.on(Laya.Event.BLUR, this, this.onBlur);
            Laya.stage.on(Laya.Event.FOCUS, this, this.onFocus);
        }
        onDestroy() {
            this.sceneLogic = null;
            Laya.stage.off(EventId$1.UI_VIEW_CLOSED, this, this.onViewClosed);
            Laya.stage.off(EventId$1.UI_VIEW_OPENED, this, this.onViewOpened);
            Laya.stage.off(EventId$1.APP_SHOW, this, this.onAppShow);
            Laya.stage.off(EventId$1.APP_HIDE, this, this.onAppHide);
            Laya.stage.off(Laya.Event.BLUR, this, this.onBlur);
            Laya.stage.off(Laya.Event.FOCUS, this, this.onFocus);
        }
        onBlur() {
            console.log("失去焦点");
            Laya.stage.once(Laya.Event.MOUSE_DOWN, this, () => {
                console.log("点击获得焦点");
                window.focus();
            });
        }
        onFocus() {
            console.log("获得焦点");
        }
        onAppShow() {
            console.log("恢复音乐");
            UserComData.curMusicCannel && UserComData.curMusicCannel.resume();
        }
        onAppHide() {
            console.log("暂停音乐");
            UserComData.curMusicCannel && UserComData.curMusicCannel.pause();
        }
        onGameLaunchReady(s) {
            DyqqShader.initShader();
            ObjectPool.ClearCache();
            console.log("🚀 ~ file: GameLogic.ts ~ line 26 ~ GameLogic ~ onAwake ~ UserComData.userLevel", UserComData.userLevel);
            Laya.loader.load(["config/levelCfg.json", "config/stageCfg.json", "config/nickname.json"], Laya.Handler.create(this, () => {
                UserComData.levelCfg = Laya.loader.getRes("config/levelCfg.json");
                UserComData.stageCfg = Laya.loader.getRes("config/stageCfg.json");
                UserComData.nameCfg = Laya.loader.getRes("config/nickname.json");
                this.loadres();
            }));
            let curDate = new Date();
            let _day = curDate.getDate();
            if (!AppMain.playerInfo.userLevel) {
                let arg = {
                    userLevel: UserComData.userLevel.toString(),
                    userGold: UserComData.userGold.toString(),
                    userDiamond: UserComData.userDiamond.toString(),
                    LotteryCount: UserComData.LotteryCount.toString(),
                    curDayLotteryCount: UserComData.curDayLotteryCount.toString(),
                    outGuideId: UserComData.outGuideId.toString(),
                    RoletrySkinId: UserComData.RoletrySkinId.toString(),
                    cacheLevel: UserComData.cacheLevel.toString(),
                    cacheVersion: UserComData.cacheVersion.toString(),
                    isGuide: (UserComData.isGuide ? 0 : 1).toString(),
                    outskirtsGuide: (UserComData.outskirtsGuide ? 0 : 1).toString(),
                    Boxinfo: UserComData.Boxinfo,
                    PlayerSKinInfo: UserComData.PlayerSKinInfo,
                    SignInfo: UserComData.SignInfo,
                    taskInfo: UserComData.taskInfo,
                    rankInfo: UserComData.rankInfo,
                    activityInfo: UserComData.activityInfo,
                    Date: _day.toString()
                };
                console.log("000------");
                RequestMgr.UpdatePlayerAny(arg);
            }
            else {
                UserComData.userLevel = Number(AppMain.playerInfo.userLevel || UserComData.userLevel);
                UserComData.userGold = Number(AppMain.playerInfo.userGold || UserComData.userGold);
                UserComData.userDiamond = Number(AppMain.playerInfo.userDiamond || UserComData.userDiamond);
                UserComData.LotteryCount = Number(AppMain.playerInfo.LotteryCount || UserComData.LotteryCount);
                UserComData.curDayLotteryCount = Number(AppMain.playerInfo.curDayLotteryCount || UserComData.curDayLotteryCount);
                UserComData.outGuideId = Number(AppMain.playerInfo.outGuideId || UserComData.outGuideId);
                UserComData.RoletrySkinId = Number(AppMain.playerInfo.RoletrySkinId || UserComData.RoletrySkinId);
                UserComData.cacheLevel = Number(AppMain.playerInfo.cacheLevel || UserComData.cacheLevel);
                UserComData.cacheVersion = AppMain.playerInfo.cacheVersion || "";
                UserComData.isGuide = Number(AppMain.playerInfo.isGuide || 0) ? false : true;
                UserComData.outskirtsGuide = Number(AppMain.playerInfo.outskirtsGuide || 0) ? false : false;
                if (AppMain.playerInfo.Boxinfo) {
                    UserComData.Boxinfo = AppMain.playerInfo.Boxinfo;
                }
                if (AppMain.playerInfo.PlayerSKinInfo) {
                    UserComData.PlayerSKinInfo = AppMain.playerInfo.PlayerSKinInfo;
                }
                if (AppMain.playerInfo.SignInfo) {
                    UserComData.SignInfo = AppMain.playerInfo.SignInfo;
                }
                if (AppMain.playerInfo.rankInfo && AppMain.playerInfo.rankInfo.length != 0) {
                    console.log("进入rankInfo赋值");
                    UserComData.rankInfo = AppMain.playerInfo.rankInfo;
                    if (UserComData.rankInfo["rankArriveState"] == null || UserComData.rankInfo["rankArriveState"] == undefined || UserComData.rankInfo["rankArriveState"] == []) {
                        UserComData.rankInfo["rankArriveState"] = [0, 0, 0, 0, 0, 0, 0];
                    }
                }
                if (AppMain.playerInfo.activityInfo && AppMain.playerInfo.activityInfo.length != 0) {
                    console.log("进入activityInfo赋值");
                    UserComData.activityInfo = AppMain.playerInfo.activityInfo;
                    if (UserComData.activityInfo["strength"] == undefined || UserComData.activityInfo["strength"] == null) {
                        UserComData.activityInfo["lastUseStrengthTime"] = 0;
                        UserComData.activityInfo["strength"] = UserComData.maxStrength;
                    }
                }
                let _oldday = Number(AppMain.playerInfo.Date || 0);
                AppMain.playerInfo.Date = _day.toString();
                UserComData.isNewDay = _oldday != _day;
                if (UserComData.isNewDay) {
                    UserComData.curDayLotteryCount = 0;
                    UserComData.SignInfo.isSign = false;
                    for (let i = 0; i < UserComData.PlayerSKinInfo.buyFragmentState.length; i++) {
                        UserComData.PlayerSKinInfo.buyFragmentState[i] = 1;
                    }
                    for (let i = 0; i < UserComData.taskInfo.taskBoxList.length; i++) {
                        UserComData.taskInfo.taskBoxList[i] = 0;
                    }
                    for (let i = 0; i < UserComData.taskInfo.taskGetList.length; i++) {
                        UserComData.taskInfo.taskGetList[i] = 0;
                        UserComData.taskInfo.taskStateList[i] = 0;
                    }
                    UserComData.rankInfo["rankShareCount"] = 0;
                    UserComData.activityInfo["PursuerFreeCount"] = 0;
                    UserComData.taskInfo.taskprogress = 0;
                    UserComData.activityInfo.shareCount = 0;
                    UserComData.PlayerSKinInfo.refreshFragmentCount = 0;
                    UserComData.PlayerSKinInfo.freeCount = 1;
                    AppMain.playerInfo.curDayLotteryCount = UserComData.curDayLotteryCount.toString();
                    AppMain.playerInfo.SignInfo = UserComData.SignInfo;
                    AppMain.playerInfo.PlayerSKinInfo = UserComData.PlayerSKinInfo;
                    AppMain.playerInfo.taskInfo = UserComData.taskInfo;
                    AppMain.playerInfo.activityInfo = UserComData.activityInfo;
                    AppMain.playerInfo.Date = _day.toString();
                }
                RequestMgr.UpdatePlayerAny({
                    "curDayLotteryCount": UserComData.curDayLotteryCount.toString(),
                    "SignInfo": UserComData.SignInfo,
                    "PlayerSKinInfo": UserComData.PlayerSKinInfo,
                    "taskInfo": UserComData.taskInfo,
                    "activityInfo": UserComData.activityInfo,
                    "Date": _day.toString()
                });
            }
            Laya.stage.event(EventId$1.GAME_HOME);
            zs.laya.game.UIService.hideLoading();
        }
        On3DResLoadComplete(s) {
            if (s) {
                this.sceneLogic = Laya.stage.addChildAt(s, 0).addComponent(SceneLogic);
            }
        }
        loadres() {
            console.log("this.pkgList", this.pkgList);
            if (this.pkgList.length == 0 && !this.isLoad) {
                this.isLoad = true;
                this.loadPrefab();
                return;
            }
            var pkgName = this.pkgList.shift();
            zs.laya.sdk.SdkService.loadSubpackage(pkgName, null, Laya.Handler.create(this, this.loadres), Laya.Handler.create(this, this.loadres));
        }
        loadPrefab() {
            var urls = [];
            this.baseResList.forEach(function (cfgUrl) {
                urls.push(zs.laya.Resource.Get3dPrefabUrl(cfgUrl));
            });
            if (urls.length == 0) {
                this.loadOk();
            }
            else {
                Laya.loader.create(urls, Laya.Handler.create(this, this.loadOk));
            }
        }
        loadOk() {
            console.log("开始加载3d资源");
            Laya.loader.create("3dres/Conventional/Main.ls", Laya.Handler.create(this, this.On3DResLoadComplete));
            Laya.loader.on(Laya.Event.ERROR, this, (err) => {
                console.log("加载出错的地址：", err);
            });
            if (AppMain.appConfig.bgm) {
                zs.laya.SoundService.playMusic(AppMain.appConfig.bgm);
            }
        }
        onViewOpened(viewName) {
            console.error("viewName", viewName);
        }
        onViewClosed(viewName) {
            console.warn("viewName", viewName);
        }
        onGameOver() {
            super.onGameOver();
            if (UserComData.isGuide) {
                RequestMgr.UpdatePlayerByKey("isGuide", "1");
                Laya.stage.event("hideGuide");
            }
        }
    }

    var Shader3D = Laya.Shader3D;
    class CartoonMaterial extends Laya.Material {
        constructor() {
            super();
            this.setShaderName("Cartoon");
        }
        static init() {
            Laya.ClassUtils.regClass('Laya.Cartoon', CartoonMaterial);
        }
        get _Color() {
            return this._shaderValues.getVector(CartoonMaterial.ALBEDOCOLOR);
        }
        set _Color(value) {
            this._shaderValues.setVector(CartoonMaterial.ALBEDOCOLOR, value);
        }
        get _HColor() {
            return this._shaderValues.getVector(CartoonMaterial.HIGHLIGHTCOLOR);
        }
        set _HColor(value) {
            this._shaderValues.setVector(CartoonMaterial.HIGHLIGHTCOLOR, value);
        }
        get _SColor() {
            return this._shaderValues.getVector(CartoonMaterial.SHADOWCOLOR);
        }
        set _SColor(value) {
            this._shaderValues.setVector(CartoonMaterial.SHADOWCOLOR, value);
        }
        get _SpecColor() {
            return this._shaderValues.getVector(CartoonMaterial.SPECULARCOLOR);
        }
        set _SpecColor(value) {
            this._shaderValues.setVector(CartoonMaterial.SPECULARCOLOR, value);
        }
        get _OutlineColor() {
            return this._shaderValues.getVector(CartoonMaterial.OUTLINECOLOR);
        }
        set _OutlineColor(value) {
            this._shaderValues.setVector(CartoonMaterial.OUTLINECOLOR, value);
        }
        set _RimColor(value) {
            this._shaderValues.setVector(CartoonMaterial.RIMCOLOR, value);
        }
        get _RimColor() {
            return this._shaderValues.getVector(CartoonMaterial.RIMCOLOR);
        }
        get _MainTex() {
            return this._shaderValues.getTexture(CartoonMaterial.ALBEDOTEXTURE);
        }
        set _MainTex(value) {
            if (value)
                this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_DIFFUSEMAP);
            else
                this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_DIFFUSEMAP);
            this._shaderValues.setTexture(CartoonMaterial.ALBEDOTEXTURE, value);
        }
        get _ShadowTex() {
            return this._shaderValues.getTexture(CartoonMaterial.SHADOWTEXTURE);
        }
        set _ShadowTex(value) {
            if (value)
                this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_SHADOWMAP);
            else
                this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_SHADOWMAP);
            this._shaderValues.setTexture(CartoonMaterial.SHADOWTEXTURE, value);
        }
        set _ToonSteps(value) {
            this._shaderValues.setNumber(CartoonMaterial.TOONSTEPS, value);
        }
        get _ToonSteps() {
            return this._shaderValues.getNumber(CartoonMaterial.TOONSTEPS);
        }
        set _RampThreshold(value) {
            this._shaderValues.setNumber(CartoonMaterial.RAMPTHRESHOLD, value);
        }
        get _RampThreshold() {
            return this._shaderValues.getNumber(CartoonMaterial.RAMPTHRESHOLD);
        }
        set _RampSmooth(value) {
            this._shaderValues.setNumber(CartoonMaterial.RAMPSMOOTH, value);
        }
        get _RampSmooth() {
            return this._shaderValues.getNumber(CartoonMaterial.RAMPSMOOTH);
        }
        set _SpecSmooth(value) {
            this._shaderValues.setNumber(CartoonMaterial.SPECSMOOTH, value);
        }
        get _SpecSmooth() {
            return this._shaderValues.getNumber(CartoonMaterial.SPECSMOOTH);
        }
        set _Shininess(value) {
            this._shaderValues.setNumber(CartoonMaterial.SHININESS, value);
        }
        get _Shininess() {
            return this._shaderValues.getNumber(CartoonMaterial.SHININESS);
        }
        set _RimThreshold(value) {
            this._shaderValues.setNumber(CartoonMaterial.RIMTHRESHOLD, value);
        }
        get _RimThreshold() {
            return this._shaderValues.getNumber(CartoonMaterial.RIMTHRESHOLD);
        }
        set _RimSmooth(value) {
            this._shaderValues.setNumber(CartoonMaterial.RIMSMOOTH, value);
        }
        get _RimSmooth() {
            return this._shaderValues.getNumber(CartoonMaterial.RIMSMOOTH);
        }
        get _OutlineFractor() {
            return this._shaderValues.getNumber(CartoonMaterial.OUTLINEFRACTOR);
        }
        set _OutlineFractor(value) {
            if (value <= 0.0) {
                this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_OUTLINE);
            }
            else {
                this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_OUTLINE);
            }
            this._shaderValues.setNumber(CartoonMaterial.OUTLINEFRACTOR, value);
        }
    }
    CartoonMaterial.ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_DiffuseTexture");
    CartoonMaterial.SHADOWTEXTURE = Laya.Shader3D.propertyNameToID("u_ShadowTexture");
    CartoonMaterial.ALBEDOCOLOR = Laya.Shader3D.propertyNameToID("u_DiffuseColor");
    CartoonMaterial.HIGHLIGHTCOLOR = Laya.Shader3D.propertyNameToID("u_HColor");
    CartoonMaterial.SHADOWCOLOR = Laya.Shader3D.propertyNameToID("u_SColor");
    CartoonMaterial.SPECULARCOLOR = Laya.Shader3D.propertyNameToID("u_SpecColor");
    CartoonMaterial.RIMCOLOR = Laya.Shader3D.propertyNameToID("u_RimColor");
    CartoonMaterial.TOONSTEPS = Laya.Shader3D.propertyNameToID("u_ToonSteps");
    CartoonMaterial.RAMPTHRESHOLD = Laya.Shader3D.propertyNameToID("u_RampThreshold");
    CartoonMaterial.RAMPSMOOTH = Laya.Shader3D.propertyNameToID("u_RampSmooth");
    CartoonMaterial.SPECSMOOTH = Laya.Shader3D.propertyNameToID("u_SpecSmooth");
    CartoonMaterial.SHININESS = Laya.Shader3D.propertyNameToID("u_Shininess");
    CartoonMaterial.RIMTHRESHOLD = Laya.Shader3D.propertyNameToID("u_RimThreshold");
    CartoonMaterial.RIMSMOOTH = Laya.Shader3D.propertyNameToID("u_RimSmooth");
    CartoonMaterial.OUTLINECOLOR = Shader3D.propertyNameToID("u_OutlineColor");
    CartoonMaterial.OUTLINEFRACTOR = Shader3D.propertyNameToID("u_OutlineFractor");
    CartoonMaterial.SHADERDEFINE_OUTLINE = Shader3D.getDefineByName("OUTLINE");
    CartoonMaterial.SHADERDEFINE_DIFFUSEMAP = Laya.Shader3D.getDefineByName("DIFFUSEMAP");
    CartoonMaterial.SHADERDEFINE_SHADOWMAP = Laya.Shader3D.getDefineByName("SHADOWTEXMAP");

    var ps = "#ifdef GL_FRAGMENT_PRECISION_HIGH\r\n\tprecision highp float;\r\n\tprecision highp int;\r\n#else\r\n\tprecision mediump float;\r\n\tprecision mediump int;\r\n#endif\r\n\r\n#include \"Lighting.glsl\";\r\n#include \"Shadow.glsl\"\r\n\r\nuniform vec4 u_DiffuseColor;\r\nuniform float u_RampThreshold;\r\nuniform float u_ToonSteps;\r\nuniform float u_RampSmooth;\r\nuniform float u_SpecSmooth;\r\nuniform float u_RimThreshold;\r\nuniform float u_RimSmooth;\r\nuniform vec4 u_HColor;\r\nuniform vec4 u_SColor;\r\nuniform vec4 u_SpecColor;\r\nuniform vec4 u_RimColor;\r\n\r\n#ifdef SHADOWTEXMAP\r\nuniform sampler2D u_ShadowTexture;\r\n#endif\r\n\r\n#if defined(COLOR)\r\n\tvarying vec4 v_Color;\r\n#endif\r\n\r\n#ifdef ALPHATEST\r\n\tuniform float u_AlphaTestValue;\r\n#endif\r\n\r\n#ifdef DIFFUSEMAP\r\n\tuniform sampler2D u_DiffuseTexture;\r\n#endif\r\n\r\n\r\n#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))\r\n\tvarying vec2 v_Texcoord0;\r\n#endif\r\n\r\n#ifdef LIGHTMAP\r\n\tvarying vec2 v_LightMapUV;\r\n\tuniform sampler2D u_LightMap;\r\n#endif\r\n\r\nvarying vec3 v_Normal;\r\n#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\r\n\tvarying vec3 v_ViewDir; \r\n\r\n\tuniform vec3 u_MaterialSpecular;\r\n\tuniform float u_Shininess;\r\n\r\n\t#ifdef LEGACYSINGLELIGHTING\r\n\t\t#ifdef DIRECTIONLIGHT\r\n\t\t\tuniform DirectionLight u_DirectionLight;\r\n\t\t#endif\r\n\t\t#ifdef POINTLIGHT\r\n\t\t\tuniform PointLight u_PointLight;\r\n\t\t#endif\r\n\t\t#ifdef SPOTLIGHT\r\n\t\t\tuniform SpotLight u_SpotLight;\r\n\t\t#endif\r\n\t#else\r\n\t\tuniform mat4 u_View;\r\n\t\tuniform vec4 u_ProjectionParams;\r\n\t\tuniform vec4 u_Viewport;\r\n\t\tuniform int u_DirationLightCount;\r\n\t\tuniform DirectionLight u_SunLight;\r\n\t\tuniform sampler2D u_LightBuffer;\r\n\t\tuniform sampler2D u_LightClusterBuffer;\r\n\t#endif\r\n\r\n\t#ifdef SPECULARMAP \r\n\t\tuniform sampler2D u_SpecularTexture;\r\n\t#endif\r\n#endif\r\n\r\n#ifdef NORMALMAP \r\n\tuniform sampler2D u_NormalTexture;\r\n\tvarying vec3 v_Tangent;\r\n\tvarying vec3 v_Binormal;\r\n#endif\r\n\r\n#ifdef FOG\r\n\tuniform float u_FogStart;\r\n\tuniform float u_FogRange;\r\n\tuniform vec3 u_FogColor;\r\n#endif\r\n\r\n#if defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)\r\n\tvarying vec3 v_PositionWorld;\r\n#endif\r\n\r\n\r\n#include \"GlobalIllumination.glsl\";//\"GlobalIllumination.glsl use uniform should at front of this\r\n\r\n#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)\r\n\tvarying vec4 v_ShadowCoord;\r\n#endif\r\n\r\n#ifdef CALCULATE_SPOTSHADOWS\r\n\tvarying vec4 v_SpotShadowCoord;\r\n#endif\r\n\r\nvoid main()\r\n{\r\n\tvec3 normal;//light and SH maybe use normal\r\n\t#if defined(NORMALMAP)\r\n\t\tvec3 normalMapSample = texture2D(u_NormalTexture, v_Texcoord0).rgb;\r\n\t\tnormal = normalize(NormalSampleToWorldSpace(normalMapSample, v_Normal, v_Tangent,v_Binormal));\r\n\t#else\r\n\t\tnormal = normalize(v_Normal);\r\n\t#endif\r\n\r\n\tvec3 lightDir;\r\n\tvec3 lightColor;\r\n\t#if defined(DIRECTIONLIGHT)\r\n\t\tlightDir = u_SunLight.direction;\r\n\t\tlightColor = u_SunLight.color;\r\n\t#else\r\n\t\tlightDir = normalize(vec3(1.0, 1.0, 1.0));\r\n\t\tlightColor = vec3(1.0, 1.0, 1.0);\r\n\t#endif\r\n\tlightDir = -lightDir;\r\n\r\n\tvec3 viewDir;\r\n\t#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\r\n\t\tviewDir = normalize(v_ViewDir);\r\n\t#else\r\n\t\tviewDir = normalize(vec3(1.0, 1.0, 1.0));\r\n\t#endif\r\n\r\n\tvec3 halfDir = normalize(lightDir + viewDir);\r\n\r\n\tfloat ndl = max(0.001, dot(normal, lightDir));\r\n\tfloat ndh = max(0.001, dot(normal, halfDir));\r\n\tfloat ndv = max(0.001, dot(normal, viewDir));\r\n\r\n\tfloat a = u_RampThreshold - ndl;\r\n\tfloat b = u_RampThreshold + ndl;\r\n\r\n\tfloat diff = smoothstep(u_RampThreshold - ndl, u_RampThreshold + ndl, ndl);\r\n\tfloat interval = 1.0 / u_ToonSteps;\r\n\tfloat level = floor(diff * u_ToonSteps + 0.5) / u_ToonSteps;\r\n\tfloat ramp = interval * smoothstep(level - u_RampSmooth * interval * 0.5, level + u_RampSmooth * interval * 0.5, diff) + level - interval;\r\n\tramp = max(0.0, ramp);\r\n\r\n\tLayaGIInput giInput;\r\n\t#ifdef LIGHTMAP\t\r\n\t\tgiInput.lightmapUV=v_LightMapUV;\r\n\t#endif\r\n\tvec3 globalDiffuse=layaGIBase(giInput,1.0,normal);\r\n\t\r\n\tvec4 mainColor=u_DiffuseColor;\r\n\r\n\t#ifdef DIFFUSEMAP\r\n\t\tvec4 difTexColor=texture2D(u_DiffuseTexture, v_Texcoord0);\r\n\t\tmainColor=mainColor*difTexColor;\r\n\t#endif \r\n\t\r\n\t#ifdef ALPHATEST\r\n\t\tif(mainColor.a<u_AlphaTestValue)\r\n\t\t\tdiscard;\r\n\t#endif\r\n\r\n\tvec3 baseColor;\r\n\t#ifdef SHADOWTEXMAP\r\n\t\tvec4 shadowTexColor = texture2D(u_ShadowTexture, v_Texcoord0);\r\n\t\tbaseColor = shadowTexColor.rgb * (1.0 - ramp) + mainColor.rgb * ramp;\r\n\t#else\r\n\t\tbaseColor = vec3(0.0, 0.0, 0.0) * (1.0 - ramp) + mainColor.rgb * ramp;\r\n\t#endif\r\n\r\n\tvec4 sColor = u_HColor * (1.0 - u_SColor.a) + u_SColor * u_SColor.a;\r\n\tvec3 rampColor = sColor.rgb * (1.0 - ramp) + u_HColor.rgb * ramp;\r\n\r\n\tfloat spec = pow(ndh, u_Shininess * 128.0) * mainColor.a;\r\n\tspec = smoothstep(0.5 - u_SpecSmooth * 0.5, 0.5 + u_SpecSmooth * 0.5, spec);\r\n\r\n\tfloat rim = (1.0 - ndv) * ndl;\r\n\trim = smoothstep(u_RimThreshold - u_RimSmooth * 0.5, u_RimThreshold + u_RimSmooth * 0.5, rim);\r\n\r\n\tvec3 diffuse = baseColor * lightColor * rampColor;\r\n\tvec3 specular = u_SpecColor.rgb * lightColor * spec;\r\n\tvec3 rimColor = u_RimColor.rgb * lightColor * u_RimColor.a * rim;\r\n\r\n\tgl_FragColor.rgb = diffuse + specular + rimColor + baseColor * globalDiffuse;\r\n\r\n\t#if defined(COLOR)\r\n\t\tgl_FragColor.rgb=gl_FragColor.rgb*v_Color.rgb;\r\n\t#endif\r\n\r\n\t#ifdef FOG\r\n\t\tfloat lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);\r\n\t\tgl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);\r\n\t#endif\r\n}\r\n\r\n";

    var vs = "#include \"Lighting.glsl\";\r\n#include \"Shadow.glsl\";\r\n\r\nattribute vec4 a_Position;\r\n\r\n#ifdef GPU_INSTANCE\r\n\tattribute mat4 a_MvpMatrix;\r\n#else\r\n\tuniform mat4 u_MvpMatrix;\r\n#endif\r\n\r\n#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))||(defined(LIGHTMAP)&&defined(UV))\r\n\tattribute vec2 a_Texcoord0;\r\n\tvarying vec2 v_Texcoord0;\r\n#endif\r\n\r\n#if defined(LIGHTMAP)&&defined(UV1)\r\n\tattribute vec2 a_Texcoord1;\r\n#endif\r\n\r\n#ifdef LIGHTMAP\r\n\tuniform vec4 u_LightmapScaleOffset;\r\n\tvarying vec2 v_LightMapUV;\r\n#endif\r\n\r\n#ifdef COLOR\r\n\tattribute vec4 a_Color;\r\n\tvarying vec4 v_Color;\r\n#endif\r\n\r\n#ifdef BONE\r\n\tconst int c_MaxBoneCount = 24;\r\n\tattribute vec4 a_BoneIndices;\r\n\tattribute vec4 a_BoneWeights;\r\n\tuniform mat4 u_Bones[c_MaxBoneCount];\r\n#endif\r\n\r\nattribute vec3 a_Normal;\r\nvarying vec3 v_Normal; \r\n\r\n#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\r\n\tuniform vec3 u_CameraPos;\r\n\tvarying vec3 v_ViewDir; \r\n#endif\r\n\r\n#if defined(NORMALMAP)\r\n\tattribute vec4 a_Tangent0;\r\n\tvarying vec3 v_Tangent;\r\n\tvarying vec3 v_Binormal;\r\n#endif\r\n\r\n#ifdef GPU_INSTANCE\r\n\tattribute mat4 a_WorldMat;\r\n#else\r\n\tuniform mat4 u_WorldMat;\r\n#endif\r\n\r\n#if defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)\r\n\tvarying vec3 v_PositionWorld;\r\n#endif\r\n\r\n#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)\r\n\tvarying vec4 v_ShadowCoord;\r\n#endif\r\n\r\n#ifdef CALCULATE_SPOTSHADOWS\r\n\tvarying vec4 v_SpotShadowCoord;\r\n#endif\r\n\r\n#ifdef TILINGOFFSET\r\n\tuniform vec4 u_TilingOffset;\r\n#endif\r\n\r\nvoid main()\r\n{\r\n\tvec4 position;\r\n\t#ifdef BONE\r\n\t\tmat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;\r\n\t\tposition=skinTransform*a_Position;\r\n\t#else\r\n\t\tposition=a_Position;\r\n\t#endif\r\n\t#ifdef GPU_INSTANCE\r\n\t\tgl_Position = a_MvpMatrix * position;\r\n\t#else\r\n\t\tgl_Position = u_MvpMatrix * position;\r\n\t#endif\r\n\t\r\n\tmat4 worldMat;\r\n\t#ifdef GPU_INSTANCE\r\n\t\tworldMat = a_WorldMat;\r\n\t#else\r\n\t\tworldMat = u_WorldMat;\r\n\t#endif\r\n\r\n\tmat3 worldInvMat;\r\n\t#ifdef BONE\r\n\t\tworldInvMat=INVERSE_MAT(mat3(worldMat*skinTransform));\r\n\t#else\r\n\t\tworldInvMat=INVERSE_MAT(mat3(worldMat));\r\n\t#endif  \r\n\tv_Normal=normalize(a_Normal*worldInvMat);\r\n\t#if defined(NORMALMAP)\r\n\t\tv_Tangent=normalize(a_Tangent0.xyz*worldInvMat);\r\n\t\tv_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;\r\n\t#endif\r\n\r\n\t#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)\r\n\t\tvec3 positionWS=(worldMat*position).xyz;\r\n\t\t#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\r\n\t\t\tv_ViewDir = u_CameraPos-positionWS;\r\n\t\t#endif\r\n\t\t#if defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)\r\n\t\t\tv_PositionWorld = positionWS;\r\n\t\t#endif\r\n\t#endif\r\n\r\n\t#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))\r\n\t\t#ifdef TILINGOFFSET\r\n\t\t\tv_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);\r\n\t\t#else\r\n\t\t\tv_Texcoord0=a_Texcoord0;\r\n\t\t#endif\r\n\t#endif\r\n\r\n\t#ifdef LIGHTMAP\r\n\t\t#ifdef UV1\r\n\t\t\tv_LightMapUV=vec2(a_Texcoord1.x,1.0-a_Texcoord1.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;\r\n\t\t#else\r\n\t\t\tv_LightMapUV=vec2(a_Texcoord0.x,1.0-a_Texcoord0.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;\r\n\t\t#endif \r\n\t\tv_LightMapUV.y=1.0-v_LightMapUV.y;\r\n\t#endif\r\n\r\n\t#if defined(COLOR)\r\n\t\tv_Color=a_Color;\r\n\t#endif\r\n\r\n\t#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)\r\n\t\tv_ShadowCoord =getShadowCoord(vec4(positionWS,1.0));\r\n\t#endif\r\n\r\n\t#ifdef CALCULATE_SPOTSHADOWS\r\n\t\tv_SpotShadowCoord = u_SpotViewProjectMatrix*vec4(positionWS,1.0);\r\n\t#endif\r\n\r\n\tgl_Position=remapGLPositionZ(gl_Position);\r\n}";

    var ops = "#ifdef GL_FRAGMENT_PRECISION_HIGH\r\n\tprecision highp float;\r\n\tprecision highp int;\r\n#else\r\n\tprecision mediump float;\r\n\tprecision mediump int;\r\n#endif\r\n\r\n#ifdef OUTLINE\r\n\tuniform vec4 u_OutlineColor;\r\n#endif\r\n\r\nvoid main()\r\n{\r\n\t#ifdef OUTLINE\r\n    \tgl_FragColor = u_OutlineColor; \r\n\t#else\r\n\t\tgl_FragColor = vec4(1.0,1.0,1.0,0.0);\r\n\t#endif\r\n}";

    var ovs = "#include \"Lighting.glsl\";\r\n\r\nattribute vec4 a_Position;\r\nattribute vec3 a_Normal;\r\n\r\n#ifdef BONE\r\n\tconst int c_MaxBoneCount = 24;\r\n\tattribute vec4 a_BoneIndices;\r\n\tattribute vec4 a_BoneWeights;\r\n\tuniform mat4 u_Bones[c_MaxBoneCount];\r\n#endif\r\n\r\n#ifdef GPU_INSTANCE\r\n\tattribute mat4 a_MvpMatrix;\r\n#else\r\n\tuniform mat4 u_MvpMatrix;\r\n#endif\r\n\r\n#ifdef OUTLINE\r\n    uniform float u_OutlineFractor;\r\n#endif\r\n\r\n\r\nvoid main()\r\n{\r\n    vec4 position = a_Position;\r\n    vec3 normal = a_Normal;\r\n\r\n    mat4 mvpMatrix;\r\n    #ifdef GPU_INSTANCE\r\n        mvpMatrix = a_MvpMatrix;\r\n    #else\r\n        mvpMatrix = u_MvpMatrix;\r\n    #endif\r\n\r\n    #ifdef BONE\r\n\t\tmat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;\r\n\t\tskinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;\r\n        mvpMatrix = mvpMatrix * skinTransform;\r\n\t#endif\r\n\r\n    #ifdef OUTLINE\r\n        vec3 dir = normalize(position.xyz + a_Normal);\r\n        float vz = position.x * mvpMatrix[0][2] + position.y * mvpMatrix[1][2] + position.z * mvpMatrix[2][2] + position.w * mvpMatrix[3][2];\r\n        #ifdef BONE\r\n            position = vec4(position.xyz + dir * (1.0 / vz) * u_OutlineFractor, position.w);\r\n        #else\r\n            position = vec4(position.xyz + dir * vz * u_OutlineFractor, position.w);\r\n        #endif\r\n    #endif\r\n\r\n\tgl_Position = mvpMatrix * position;\r\n    gl_Position=remapGLPositionZ(gl_Position);\r\n}";

    var Shader3D$1 = Laya.Shader3D;
    var SubShader = Laya.SubShader;
    var VertexMesh = Laya.VertexMesh;
    class CartoonShader {
        static init() {
            var attributeMap = {
                'a_Position': VertexMesh.MESH_POSITION0,
                'a_Color': VertexMesh.MESH_COLOR0,
                'a_Normal': VertexMesh.MESH_NORMAL0,
                'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
                'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
                'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
                'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
                'a_Tangent0': VertexMesh.MESH_TANGENT0,
                'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
                'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
            };
            var uniformMap = {
                'u_Bones': Shader3D$1.PERIOD_CUSTOM,
                'u_DiffuseTexture': Shader3D$1.PERIOD_MATERIAL,
                'u_SpecularTexture': Shader3D$1.PERIOD_MATERIAL,
                'u_NormalTexture': Shader3D$1.PERIOD_MATERIAL,
                'u_AlphaTestValue': Shader3D$1.PERIOD_MATERIAL,
                'u_DiffuseColor': Shader3D$1.PERIOD_MATERIAL,
                'u_MaterialSpecular': Shader3D$1.PERIOD_MATERIAL,
                'u_Shininess': Shader3D$1.PERIOD_MATERIAL,
                'u_TilingOffset': Shader3D$1.PERIOD_MATERIAL,
                'u_WorldMat': Shader3D$1.PERIOD_SPRITE,
                'u_MvpMatrix': Shader3D$1.PERIOD_SPRITE,
                'u_Projection': Shader3D$1.PERIOD_CAMERA,
                'u_LightmapScaleOffset': Shader3D$1.PERIOD_SPRITE,
                'u_LightMap': Shader3D$1.PERIOD_SPRITE,
                'u_LightMapDirection': Shader3D$1.PERIOD_SPRITE,
                'u_CameraPos': Shader3D$1.PERIOD_CAMERA,
                'u_Viewport': Shader3D$1.PERIOD_CAMERA,
                'u_ProjectionParams': Shader3D$1.PERIOD_CAMERA,
                'u_View': Shader3D$1.PERIOD_CAMERA,
                'u_ViewProjection': Shader3D$1.PERIOD_CAMERA,
                'u_ReflectTexture': Shader3D$1.PERIOD_SCENE,
                'u_ReflectIntensity': Shader3D$1.PERIOD_SCENE,
                'u_FogStart': Shader3D$1.PERIOD_SCENE,
                'u_FogRange': Shader3D$1.PERIOD_SCENE,
                'u_FogColor': Shader3D$1.PERIOD_SCENE,
                'u_DirationLightCount': Shader3D$1.PERIOD_SCENE,
                'u_LightBuffer': Shader3D$1.PERIOD_SCENE,
                'u_LightClusterBuffer': Shader3D$1.PERIOD_SCENE,
                'u_AmbientColor': Shader3D$1.PERIOD_SCENE,
                'u_ShadowBias': Shader3D$1.PERIOD_SCENE,
                'u_ShadowLightDirection': Shader3D$1.PERIOD_SCENE,
                'u_ShadowMap': Shader3D$1.PERIOD_SCENE,
                'u_ShadowParams': Shader3D$1.PERIOD_SCENE,
                'u_ShadowSplitSpheres': Shader3D$1.PERIOD_SCENE,
                'u_ShadowMatrices': Shader3D$1.PERIOD_SCENE,
                'u_ShadowMapSize': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHAr': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHAg': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHAb': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHBr': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHBg': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHBb': Shader3D$1.PERIOD_SCENE,
                'u_AmbientSHC': Shader3D$1.PERIOD_SCENE,
                'u_SunLight.color': Shader3D$1.PERIOD_SCENE,
                'u_SunLight.direction': Shader3D$1.PERIOD_SCENE,
                'u_PointLight.position': Shader3D$1.PERIOD_SCENE,
                'u_PointLight.range': Shader3D$1.PERIOD_SCENE,
                'u_PointLight.color': Shader3D$1.PERIOD_SCENE,
                'u_SpotLight.position': Shader3D$1.PERIOD_SCENE,
                'u_SpotLight.direction': Shader3D$1.PERIOD_SCENE,
                'u_SpotLight.range': Shader3D$1.PERIOD_SCENE,
                'u_SpotLight.spot': Shader3D$1.PERIOD_SCENE,
                'u_SpotLight.color': Shader3D$1.PERIOD_SCENE,
                'u_RampThreshold': Shader3D$1.PERIOD_MATERIAL,
                'u_RampSmooth': Shader3D$1.PERIOD_MATERIAL,
                'u_ToonSteps': Shader3D$1.PERIOD_MATERIAL,
                'u_SpecSmooth': Shader3D$1.PERIOD_MATERIAL,
                'u_RimThreshold': Shader3D$1.PERIOD_MATERIAL,
                'u_RimSmooth': Shader3D$1.PERIOD_MATERIAL,
                'u_ShadowTexture': Shader3D$1.PERIOD_MATERIAL,
                'u_HColor': Shader3D$1.PERIOD_MATERIAL,
                'u_SColor': Shader3D$1.PERIOD_MATERIAL,
                'u_SpecColor': Shader3D$1.PERIOD_MATERIAL,
                'u_RimColor': Shader3D$1.PERIOD_MATERIAL,
                'u_OutlineFractor': Laya.Shader3D.PERIOD_MATERIAL,
                'u_OutlineColor': Laya.Shader3D.PERIOD_MATERIAL,
            };
            var stateMap = {
                's_Cull': Shader3D$1.RENDER_STATE_CULL,
                's_Blend': Shader3D$1.RENDER_STATE_BLEND,
                's_BlendSrc': Shader3D$1.RENDER_STATE_BLEND_SRC,
                's_BlendDst': Shader3D$1.RENDER_STATE_BLEND_DST,
                's_DepthTest': Shader3D$1.RENDER_STATE_DEPTH_TEST,
                's_DepthWrite': Shader3D$1.RENDER_STATE_DEPTH_WRITE
            };
            var shader = Shader3D$1.add("Cartoon", null, null, true);
            var subShader = new SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            let outlinePass = subShader.addShaderPass(ovs, ops);
            outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
            subShader.addShaderPass(vs, ps, stateMap, "Forward");
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.bgColor = "#ffffff";
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            Laya.MouseManager.multiTouchEnabled = true;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            CartoonMaterial.init();
            CartoonShader.init();
            Laya.stage.addComponent(GameLogic);
        }
    }
    new Main();

}());
