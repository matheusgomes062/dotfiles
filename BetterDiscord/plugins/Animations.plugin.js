/**
 * @name Animations
 * @version 1.3.10
 * @description This plugin is designed to animate different objects (lists, buttons, panels, etc.) with the ability to set delays, durations, types and sequences of these animations.
 * @author Mops
 * @invite PWtAHjBXtG
 * @authorLink https://github.com/Mopsgamer/
 * @authorId 538010208023347200
 * @website https://github.com/Mopsgamer/BetterDiscord-codes/tree/Animations
 * @source https://raw.githubusercontent.com/Mopsgamer/BetterDiscord-codes/Animations/Animations.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Mopsgamer/BetterDiscord-codes/Animations/Animations.plugin.js
 */

module.exports = meta => {

    const config = {
        changelog: [
            //{ "items": [""], "title": "New Stuff" },
            { "items": ["Settings interface has been improved."], "title": "Improvements", "type": "improved" },
            { "items": ["Fixed the second message animation.", "Fixed error handling for translation update button."], "title": "Fixes", "type": "fixed" }
        ],
        info: {
            authors: [{
                discord_id: meta.authorId,
                github_username: 'Mopsgamer',
                name: meta.author
            }],
            description: meta.description,
            github: meta.website,
            github_raw: meta.source,
            invite: meta.invite,
            name: meta.name,
            version: meta.version
        },
        main: 'index.js'
    }

    return !global.ZeresPluginLibrary ? {
        constructor() { this._config = config; },
        getName() { return config.info.name; },
        getAuthor() { return config.info.authors.map(a => a.name).join(', '); },
        getDescription() { return config.info.description; },
        getVersion() { return config.info.version; },
        load() {
            BdApi.showConfirmationModal('Library Missing', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: 'Download Now',
                cancelText: 'Cancel',
                onConfirm: () => {
                    require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
                        if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
                        await new Promise(r => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
                    });
                }
            });
        },
        start() { },
        stop() { }
    } : (
        ([Plugin, Api]) => {

            const plugin = (Plugin, Api) => {
                let BdApi = window.BdApi;
                const { React, ReactDOM, Patcher } = BdApi
                const { DiscordModules, DiscordAPI, Utilities, PluginUtilities, PluginUpdater, DOMTools, Modals, WebpackModules, Logger, Settings, Tooltip, ReactComponents, ContextMenu } = Api

                /**
                * @typedef { 'da' | 'de' | 'en-GB' | 'en-US' | 'es-ES' | 'fr' | 'hr' | 'it' | 'lt' | 'hu' | 'nl' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'fi' | 'sv-SE' | 'vi' | 'tr' | 'cs' | 'el' | 'bg' | 'ru' | 'uk' | 'hi' | 'th' | 'zh-CN' | 'ja' | 'zh-TW' | 'ko' } locale
                * @typedef { 'onsent' | 'disabled' } sendingPerformance
                */

                let FindedModules = (() => {
                    let ButtonContents = WebpackModules.getByProps('button', 'contents')
                    let ButtonIcon = WebpackModules.getByProps('button', 'sizeIcon')
                    return {
                        Button: ButtonIcon?.button,
                        ButtonContents: ButtonContents.contents,
                        ButtonLookInverted: ButtonContents.lookInverted,
                        ButtonSizeSmall: ButtonIcon?.sizeSmall,
                        ButtonText: WebpackModules.getByProps('buttonText', 'giftIcon')?.buttonText,
                        Card: WebpackModules.getByProps('cardBrand')?.card,
                        ChatContent: WebpackModules.getByProps('chatContent')?.chatContent,
                        CodeRedemptionRedirect: WebpackModules.getByProps('codeRedemptionRedirect')?.codeRedemptionRedirect ?? 'codeRedemptionRedirect-2hYMSQ',
                        ContainerDefault: WebpackModules.getByProps('containerDefault')?.containerDefault,
                        ContainerDefaultSpaceBeforeCategory: WebpackModules.getByProps('containerDefault', 'spaceBeforeCategory')?.containerDefault,
                        ContainerSpine: WebpackModules.getByProps('container', 'spine')?.container,
                        ContentThin: WebpackModules.getByProps('content', 'thin')?.content,
                        DividerReplying: WebpackModules.getByProps('divider', 'replying')?.divider,
                        GuildsSidebar: WebpackModules.getByProps('guilds', 'sidebar')?.guilds,
                        InputDefault: WebpackModules.getByProps('inputDefault', 'focused')?.inputDefault,
                        IsFailed: WebpackModules.getByProps('isFailed')?.isFailed,
                        IsSending: WebpackModules.getByProps('isSending')?.isSending,
                        LayerContainer: WebpackModules.getByProps('layerContainer')?.layerContainer,
                        LocaleGetter: BdApi.findModuleByProps('locale', 'addChangeListener'),
                        Member: WebpackModules.getByProps('botTag', 'member').member,
                        MembersGroup: WebpackModules.getByProps('membersGroup').membersGroup,
                        Message: WebpackModules.getByProps('message')?.message,
                        MessageDefault: WebpackModules.getByProps("default", "ThreadStarterChatMessage", "getElementFromMessageId"),
                        MessageListItem: WebpackModules.getByProps('messageListItem')?.messageListItem,
                        Offline: WebpackModules.getByProps('offline')?.offline,
                        RoundButton: WebpackModules.getByProps('roundButton').roundButton,
                        ScrollbarDefault: WebpackModules.getByProps('scrollbarDefault')?.scrollbarDefault,
                        Side: WebpackModules.getByProps('side')?.side,
                        SubmenuContainer: WebpackModules.getByProps('submenuContainer').submenuContainer,
                        TextArea: WebpackModules.getByProps('textArea')?.textArea,
                        VideoLead: WebpackModules.getByProps('video', 'lead')?.video,
                        WrapperTypeThread: WebpackModules.getByProps('wrapper', 'typeThread')?.wrapper,
                    }
                })()

                class AnimationsPlugin extends Plugin {

                    constructor() {
                        super();

                        this.patchedMessagesIds = []

                        this.defaultFrames = {
                            clear: {
                                anim: '',
                                start: ''
                            },
                            template: {
                                anim: '0% {\ntransform: translate(0, 100%);\n}\n\n100% {\ntransform: translate(0, 0) scale(1);\n}',
                                start: 'transform: scale(0);'
                            }
                        }

                        let defaultSettings = {
                            buttons: {
                                custom: {
                                    enabled: false,
                                    frames: [{
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }],
                                    page: 0
                                },
                                delay: 0.1,
                                duration: 0.3,
                                enabled: true,
                                name: 'brick-left',
                                page: 0,
                                selectors: '',
                                sequence: 'fromLast',
                                timing: 'linear'
                            },
                            lists: {
                                custom: {
                                    enabled: false,
                                    frames: [{
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }],
                                    page: 0
                                },
                                delay: 0.055,
                                duration: 0.3,
                                enabled: true,
                                name: 'brick-up',
                                page: 0,
                                selectors: '',
                                sequence: 'fromFirst',
                                timing: 'linear'
                            },
                            messages: {
                                custom: {
                                    enabled: false,
                                    frames: [{
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }, {
                                        anim: '',
                                        start: ''
                                    }],
                                    page: 0
                                },
                                delay: 0.055,
                                duration: 0.3,
                                enabled: true,
                                limit: 30,
                                name: 'brick-down',
                                page: 0,
                                sending: {
                                    custom: {
                                        enabled: false,
                                        frames: [{
                                            anim: '',
                                            start: ''
                                        }, {
                                            anim: '',
                                            start: ''
                                        }, {
                                            anim: '',
                                            start: ''
                                        }],
                                        page: 0
                                    },

                                    /**@type {sendingPerformance}*/
                                    enabled: 'onsent',
                                    name: 'brick-up',
                                    page: 0
                                },
                                timing: 'linear'
                            },
                        }

                        /**@type defaultSettings */
                        this.defaultSettings = defaultSettings

                        /**@type defaultSettings */
                        this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                    }

                    getName() { return config.info.name }
                    getAuthor() { return config.info.authors.map(a => a.name).join(', ') }
                    getDescription() { return config.info.description }
                    getVersion() { return config.info.version }

                    static strings = {
                        "edit": {
                            "clear": "Clear",
                            "default": "Default",
                            "load": "Load",
                            "save": "Save",
                            "template": "Template"
                        },
                        "name": {
                            "brick_down": "Brick down",
                            "brick_left": "Brick left",
                            "brick_right": "Brick right",
                            "brick_up": "Brick up",
                            "circle": "Circle",
                            "in": "In",
                            "opacity": "Opacity",
                            "out": "Out",
                            "polygon": "Polygon",
                            "skew_left": "Skew left",
                            "skew_right": "Skew right",
                            "slide_down": "Slide down",
                            "slide_down_left": "Slide down (left)",
                            "slide_down_right": "Slide down (right)",
                            "slide_left": "Slide left",
                            "slide_right": "Slide right",
                            "slide_up": "Slide up",
                            "slide_up_left": "Slide up (left)",
                            "slide_up_right": "Slide up (right)",
                            "slime": "Slime",
                            "wide_skew_left": "Wide skew left",
                            "wide_skew_right": "Wide skew right"
                        },
                        "pop": {
                            "no": "No",
                            "will_downdated": "The plugin will be downdated.",
                            "will_restored": "The plugin will be restored.",
                            "will_updated": "The plugin will be updated.",
                            "yes": "Let's do this",
                            "you_can_say_no": "You can say no."
                        },
                        "seq": {
                            "from_first": "From first",
                            "from_last": "From last"
                        },
                        "stng": {
                            "behavior": "Behavior",
                            "behavior_note_messages_sending": "Animation behavior for the message to be sent.",
                            "delay": "Delay",
                            "delay_note_buttons": "Delay before appearing for each button in seconds.",
                            "delay_note_lists": "Delay before appearing for each list item in seconds.",
                            "delay_note_messages": "Delay before appearing for each message in seconds.",
                            "duration": "Duration",
                            "duration_note_buttons": "Animation playback speed in seconds for each button after the delay.",
                            "duration_note_lists": "Animation playback speed in seconds for each list item after the delay.",
                            "duration_note_messages": "Animation playback speed in seconds for each message after the delay.",
                            "limit": "Limit",
                            "limit_note_messages": "The maximum number of messages in the list for which the animation will be played.",
                            "name": "Animation",
                            "name_mode_editing": "Editing",
                            "name_mode_selecting": "Selecting",
                            "name_note_buttons": "Animation of the buttons.",
                            "name_note_lists": "Animation of the lists items.",
                            "name_note_messages": "Animation of the messages.",
                            "name_note_messages_sending": "Animation of the message to be sent.",
                            "sequence": "Sequence",
                            "sequence_note_buttons": "The sequence in which the buttons are built.",
                            "sequence_note_lists": "The sequence in which the list items are built.",
                            "timing": "Timing function",
                            "timing_note_buttons": "Defines the change in animation playback speed for buttons.",
                            "timing_note_lists": "Defines the change in animation playback speed for lists.",
                            "timing_note_messages": "Defines the change in animation playback speed for messages.",
                        },
                        "view": {
                            "advanced": "Advanced",
                            "behaivor_animate_on_sent": "Animate on sent",
                            "behavior_do_not_animate": "Do not animate",
                            "buttons": "Buttons",
                            "changelog": "Changelog",
                            "link_cd": "Help translate",
                            "link_gh_discussions": "Discussions",
                            "link_gh_issues": "Issues",
                            "links_dc_server": "Server",
                            "lists": "Lists",
                            "messages": "Messages",
                            "messages_received": "Received",
                            "messages_sending": "Sending",
                            "rebuild_animations": "Rebuild animations",
                            "reset_all_settings": "Reset all",
                            "reset_buttons": "Reset buttons settings",
                            "reset_lists": "Reset lists settings",
                            "reset_messages": "Reset messages settings",
                            "resetting": "Resetting...",
                            "selectors_buttons": "Selectors of buttons",
                            "selectors_lists": "Selectors of lists",
                            "selectors_note_all": "If you leave this field empty, the default selectors will appear here on reload. Changes to the selectors are saved when typing (if the code is valid). The separator is a comma (,).",
                            "upd_translation": "Update the translation file",
                            "update_check": "Check for updates",
                            "update_err_timeout": "Timeout exceeded",
                            "update_err_unknown": "An error occurred",
                            "update_latest": "Latest version",
                            "update_newer": "Your own version",
                            "update_older": "Update",
                            "update_searching": "Searching for updates..."
                        }
                    }

                    static easings = [
                        'linear',
                        'ease-in',
                        'ease-out',
                        'ease-in-out'
                    ]

                    static names = [
                        'brick-down',
                        'brick-left',
                        'brick-right',
                        'brick-up',
                        'circle',
                        'in',
                        'opacity',
                        'out',
                        'polygon',
                        'skew-left',
                        'skew-right',
                        'slide-down-left',
                        'slide-down-right',
                        'slide-down',
                        'slide-left',
                        'slide-right',
                        'slide-up-left',
                        'slide-up-right',
                        'slide-up',
                        'slime',
                        'wide-skew-left',
                        'wide-skew-right',
                    ]

                    static sequences = [
                        'fromFirst',
                        'fromLast',
                    ]

                    static selectorsLists = [
                        /*active threads button*/
                        `.${WebpackModules.getByProps('channelName', 'icon').wrapper}`,
                        /*threads button > list*/
                        `.${WebpackModules.getByProps('container', 'bullet').container}`,
                        /*search*/
                        `.${WebpackModules.getByProps('searchResultGroup').searchResultGroup}`,

                        /*members*/
                        //`.${WebpackModules.getByProps('botTag', 'member').member}:not([class*=placeholder])`,
                        /*member-groups*/
                        //`h2.${WebpackModules.getByProps('membersGroup').membersGroup}`

                        /*friends*/
                        `.${WebpackModules.getByProps('peopleListItem').peopleListItem}`,
                        /*discovery categories*/
                        `.${WebpackModules.getByProps('categoryItem').categoryItem}`,
                        /*discord settings list*/
                        `.${WebpackModules.getByProps('side').side} *`,
                        /*bd addons*/
                        `.bd-addon-card`,
                        /*modal elements*/
                        `.${WebpackModules.getByProps('focusLock').focusLock} .${WebpackModules.getByProps('scrollerBase', 'thin').scrollerBase}:not(.bd-addon-modal-settings) > div`,
                        /*public servers*/
                        `.${WebpackModules.getAllByProps('guildList', 'subtitle')[1].guildList} > .${WebpackModules.getByProps('loaded', 'card').loaded}`
                    ]

                    static selectorsButtons = [
                        /*chat input buttons*/
                        `.${WebpackModules.getByProps('actionButtons', 'wrapper').actionButtons} button`,
                        /*voice opened buttons*/
                        `.${WebpackModules.getByProps('buttons', 'focusRing').buttons} > *`,
                        /*toolbar*/
                        `.${WebpackModules.getByProps('toolbar', 'container').toolbar} > *`,
                        `.${WebpackModules.getByProps('toolbar', 'children').children} > *`,
                        `.${WebpackModules.getByProps('tabBar', 'peopleColumn').tabBar} > .${WebpackModules.getByProps('item', 'peopleColumn').item}`
                    ]

                    animateChannels = () => {

                        if (!this.settings.lists.enabled) return;
                        var channelsListElements = document.querySelectorAll(`#channels .${FindedModules.ContentThin} > [class]`);
                        var count = channelsListElements?.length ?? 40;

                        if (channelsListElements?.length == 1) return setTimeout(() => this.animateChannels(), 100);

                        PluginUtilities.addStyle(`${this.getName()}-channelslist`,
                            `/*channels*/
                            .${FindedModules.ContainerDefaultSpaceBeforeCategory},
                            .${FindedModules.ContainerDefault}
                            {
                                ${this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start : `transform: scale(0);`}
                                animation-fill-mode: forwards;
                                animation-duration: ${this.settings.lists.duration}s;
                                animation-timing-function: ${this.settings.lists.timing};
                            }
                        `)

                        for (var i = 0, threadsCount = 0; i < count; i++) {
                            let children = channelsListElements[(this.settings.lists.sequence == "fromFirst" ? i : count - i - 1)];
                            if (!children) return;

                            if (children.classList.contains(FindedModules.ContainerDefault)
                                || children.classList.contains(FindedModules.ContainerDefaultSpaceBeforeCategory)
                                || children.classList.contains(FindedModules.WrapperTypeThread)
                            ) {
                                children.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                children.style.animationFillMode = 'forwards';
                                children.style.animationName = this.settings.lists.custom.enabled &&
                                    (this.settings.lists.custom.page >= 0 ?
                                        this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim?.trim?.() != '' &&
                                        this.isValidKeyframe(this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim)
                                        : 0)
                                    ? 'custom-lists' : this.settings.lists.name;
                            }

                            else if (children.classList.contains(FindedModules.ContainerSpine)) {
                                var threadsForkElement = children.querySelector(`.${FindedModules.ContainerSpine} > svg`);
                                var threadsListElements = children.querySelectorAll(`.${FindedModules.ContainerDefault}`);

                                threadsForkElement.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                threadsForkElement.style.animationName = 'slide-right';

                                for (var j = 0; j < threadsListElements.length; j++) {
                                    threadsCount += (j ? 1 : 0);
                                    let thread = threadsListElements[(this.settings.lists.sequence == "fromFirst" ? j : threadsListElements.length - j - 1)];

                                    thread.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                    children.style.animationFillMode = 'forwards';
                                    thread.style.animationName = this.settings.lists.custom.enabled &&
                                        (this.settings.lists.custom.page >= 0 ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim?.trim?.() : 0) != ''
                                        ? 'custom-lists' : this.settings.lists.name;
                                }
                            }

                        }

                        setTimeout(() => PluginUtilities.removeStyle(`${this.getName()}-channelslist`), ((count * this.settings.lists.delay) + this.settings.lists.duration) * 1000)

                    }

                    animateMembers = () => {

                        if (!this.settings.lists.enabled) return;

                        var membersListElements = document.querySelectorAll(`.${FindedModules.Member}:not([class*=placeholder]), h2.${FindedModules.MembersGroup}`);
                        var count = membersListElements?.length ?? 40;

                        if (membersListElements?.length == 1) return setTimeout(() => this.animateMembers(), 100);

                        PluginUtilities.addStyle(`${this.getName()}-memberslist`,
                            `/*members*/
                        .${FindedModules.Member}:not([class*=placeholder]),
                        /*member-groups*/
                        h2.${FindedModules.MembersGroup}
                        {
                            ${this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start && this.settings.lists.custom.enabled ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start : `transform: scale(0);`}
                            animation-fill-mode: forwards;
                            animation-duration: ${this.settings.lists.duration}s;
                            animation-timing-function: ${this.settings.lists.timing};
                        }
                    `)

                        for (var i = 0; i < count; i++) {
                            let children = membersListElements[(this.settings.lists.sequence == "fromFirst" ? i : count - i - 1)];
                            if (!children) return;

                            children.style.animationDelay = `${(i * this.settings.lists.delay).toFixed(2)}s`;
                            children.style.animationFillMode = 'forwards';
                            children.style.animationName = this.settings.lists.custom.enabled &&
                                (this.settings.lists.custom.page >= 0 ?
                                    this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim?.trim?.() != '' &&
                                    this.isValidKeyframe(this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim)
                                    : 0)
                                ? 'custom-lists' : this.settings.lists.name + (children.getAttribute('class').includes('offline') ? '_offline' : '');
                        }

                        setTimeout(() => PluginUtilities.removeStyle(`${this.getName()}-memberslist`), ((count * this.settings.lists.delay) + this.settings.lists.duration) * 1000)
                    }

                    animateServers = () => {

                        if (!this.settings.lists.enabled) return;

                        var serversListElements = document.querySelectorAll(`#app-mount .${FindedModules.GuildsSidebar} [class*="listItem"]:not([class*="listItemWrapper"])`);
                        var count = serversListElements?.length ?? 40;

                        PluginUtilities.addStyle(`${this.getName()}-serverslist`,
                            `/*servers*/
                        #app-mount .${FindedModules.GuildsSidebar} [class*="listItem"]:not([class*="listItemWrapper"])
                        {
                            ${this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start : `transform: scale(0);`}
                            animation-fill-mode: forwards;
                            animation-duration: ${this.settings.lists.duration}s;
                            animation-timing-function: ${this.settings.lists.timing};
                        }

                        ${!BdApi.Themes.isEnabled('Horizontal Server List') ? '' : `
                        #app-mount .${FindedModules.GuildsSidebar} [class*=listItem]:not([class*=listItemWrapper])
                        { transform: scaleX(0) rotate(90deg); }`}
                    `)

                        for (var i = 0; i < count; i++) {
                            let children = serversListElements[(this.settings.lists.sequence == "fromFirst" ? i : count - i - 1)];
                            if (!children) return;

                            children.style.animationDelay = `${(i * this.settings.lists.delay).toFixed(2)}s`;
                            children.style.animationFillMode = 'forwards';
                            children.style.animationName = this.settings.lists.custom.enabled &&
                                (this.settings.lists.custom.page >= 0 ?
                                    this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim?.trim?.() != '' &&
                                    this.isValidKeyframe(this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim)
                                    : 0)
                                ? 'custom-lists' : (this.settings.lists.name + (!BdApi.Themes.isEnabled('Horizontal Server List') ? '' : '_90'));
                        }

                        setTimeout(() => PluginUtilities.removeStyle(`${this.getName()}-serverslist`), ((count * this.settings.lists.delay) + this.settings.lists.duration) * 1000)

                    }

                    async resetAnimations(pause = 100) {
                        var createKeyFrame = function (/** @type {string} */ name, /** @type {string} */ originalName, rotate = 0, opacity = 1) {
                            var keyframes = {
                                "in":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1.3) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "out":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(0.7) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "opacity":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "slime":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                25% {
                                    transform-origin: 50%;
                                    transform: scale(1.3, 0.7) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                50% {
                                    transform-origin: 50%;
                                    transform: scale(0.8, 1.2) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                75% {
                                    transform-origin: 50%;
                                    transform: scale(1.1, 0.9) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "polygon":
                                    `@keyframes ${name} {
                                0% {
                                    clip-path:  polygon(40% 40%, 50% 25%, 60% 40%, 75% 50%, 60% 60%, 50% 75%, 40% 60%, 25% 50%);
                                    transform: rotate(${rotate}deg);
                                }
                                99% {
                                    clip-path: polygon(0 0, 50% 0, 100% 0, 100% 50%, 100% 100%, 50% 100%, 0 100%, 0 50%);
                                    transform: rotate(${rotate}deg);
                                }
                                100% {
                                    transform: rotate(${rotate}deg);
                                }
                            }`,
                                "circle":
                                    `@keyframes ${name} {
                                0% {
                                    clip-path: circle(25%);
                                    transform: rotate(${rotate}deg);
                                }
                                99% {
                                    clip-path: circle(100%);
                                    transform: rotate(${rotate}deg);
                                }
                                100% {
                                    transform: rotate(${rotate}deg);
                                }
                            }`,
                                "brick-up":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 200%) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                60% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                80% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 20%) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "brick-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(-200%, 0) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                60% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                80% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(-20%, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "brick-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(200%, 0) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                60% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                80% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(20%, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "brick-down":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, -200%) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                60% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                80% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, -20%) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "slide-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 0% 50%;
                                    transform: scaleX(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '0% 50%' : '50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                                "slide-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 100% 50%;
                                    transform: scaleX(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '100% 50%' : '50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                                "slide-up":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50% 100%;
                                    transform: scaleY(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '50% 100%' : '50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                                "slide-down":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50% 0%;
                                    transform: scaleY(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '50% 0%' : '50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                                "slide-up-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 0% 100%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '0% 100%' : '50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                                "slide-up-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 100% 100%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '100% 100%' : '50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                                "slide-down-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 0% 0%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '0% 0%' : '50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                                "slide-down-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 100% 0%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate != 90 ? '100% 0%' : '50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                                "skew-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewX(-30deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skewX(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "skew-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewX(30deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skewX(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "wide-skew-right":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewY(15deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skew(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                                "wide-skew-left":
                                    `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewY(-15deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skew(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`
                            }

                            return keyframes[originalName]

                        }

                        let keyframes = () => {
                            var result = '';

                            AnimationsPlugin.names.forEach(
                                animName => {
                                    result += `
                                ${createKeyFrame(animName, animName, 0)}\n
                                ${createKeyFrame(`${animName}_offline`, animName, 0, 0.3)}\n
                                ${createKeyFrame(`${animName}_90`, animName, 90)}\n
                                `
                                }
                            )

                            return result
                        }

                        let animPrevStyles = () => {
                            let result = '';

                            ; (["lists", "buttons", "messages"]).forEach(type => {
                                if (!AnimationsPlugin.names.includes(this.settings[type].name)) {
                                    this.settings[type].name = this.defaultSettings[type].name;
                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                }
                                if (this.settings[type].custom.frames.some((frame) => typeof frame == 'string')) {
                                    this.settings[type].custom.frames.forEach(
                                        (frame, index) => {
                                            if (typeof frame == 'string') this.settings[type].custom.frames[index] = {
                                                start: 'transform: scale(0);',
                                                anim: frame
                                            }
                                        }
                                    )
                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                }
                            });

                            ; (["lists", "buttons"]).forEach(type => {
                                if (!AnimationsPlugin.sequences.includes(this.settings[type].sequence)) {
                                    this.settings[type].sequence = this.defaultSettings[type].sequence;
                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                }
                            });

                            AnimationsPlugin.names.forEach(
                                animName => {
                                    ['lists', 'messages', 'buttons'].forEach(
                                        typeName => {
                                            for (var i = 1; i < 5; i++) {
                                                result += `.animPreview[pdata="${animName},${typeName}"]:hover > .animPreviewTempsContainer > .animTempBlock:nth-child(${i})`
                                                    + ` {
                                                transform: scale(0);
                                                animation-name: ${animName};
                                                animation-fill-mode: forwards;
                                                animation-duration: 0.3s;
                                                animation-delay: ${(i - 1) * 0.1}s;
                                            }\n`
                                            }
                                        }
                                    )
                                }
                            )

                            AnimationsPlugin.sequences.forEach(
                                seqName => {
                                    ['lists', 'messages', 'buttons'].forEach(
                                        typeName => {
                                            for (var i = 1; i < 5; i++) {
                                                result += `.animPreview[pdata="${seqName},${typeName}"]:hover > .animPreviewTempsContainer > .animTempBlock:${seqName == 'fromLast' ? 'nth-last-child' : 'nth-child'}(${i})`
                                                    + ` {
                                                transform: scale(0);
                                                animation-name: opacity;
                                                animation-fill-mode: forwards;
                                                animation-duration: 0;
                                                animation-delay: ${(i - 1) * 0.1}s;
                                            }\n`
                                            }
                                        }
                                    )
                                }
                            )

                            return result;
                        }

                        let nthStyles = () => {
                            let result = '';

                            for (var i = 1; i < 4 + 1 + 1; i++) {
                                result += `.animPreview[sequence="fromFirst"] .animTempBlock:nth-child(${i})
                            {animation-delay:${((i - 1) * 0.06).toFixed(2)}s}\n\n`
                            }
                            for (var i = 1; i < 4 + 1 + 1; i++) {
                                result += `.animPreview[sequence="fromLast"] .animTempBlock:nth-last-child(${i})
                            {animation-delay:${((i - 1) * 0.06).toFixed(2)}s}\n\n`
                            }

                            for (var i = 1; i < this.settings.messages.limit; i++) {
                                result += `.${FindedModules.MessageListItem}:nth-last-child(${i}) > .${FindedModules.Message}
                            {animation-delay:${((i - 1) * this.settings.messages.delay).toFixed(2)}s}\n`
                            }

                            return result;
                        }

                        let countStyles = () => {
                            let result = '';

                            ; ((this.isValidSelector(this.settings.lists.selectors) && this.settings.lists.selectors.trim() != '') ? this.settings.lists.selectors.split(",").map(item => item.trim()) : AnimationsPlugin.selectorsLists)
                                .forEach((selector, i) => {
                                    if (!this.settings.lists.enabled) return;

                                    let count = 65;

                                    if (this.settings.lists.sequence == 'fromFirst') for (var i = 1; i < count + 1; i++) {
                                        result += `${selector}:nth-child(${i}) `
                                            + `{animation-delay: ${((i - 1) * this.settings.lists.delay).toFixed(2)}s}\n\n`
                                    }
                                    if (this.settings.lists.sequence == 'fromLast') for (var i = 1; i < count + 1; i++) {
                                        result += `${selector}:nth-last-child(${i}) `
                                            + `{animation-delay: ${((i - 1) * this.settings.lists.delay).toFixed(2)}s}\n\n`
                                    }

                                })

                                ; ((this.isValidSelector(this.settings.buttons.selectors) && this.settings.buttons.selectors.trim() != '') ? this.settings.buttons.selectors.split(",").map(item => item.trim()) : AnimationsPlugin.selectorsButtons)
                                    .forEach(selector => {
                                        if (!this.settings.buttons.enabled) return;

                                        let count = 20;

                                        if (this.settings.buttons.sequence == 'fromFirst') for (var i = 1; i < count + 1; i++) {
                                            result += `${selector}:nth-child(${i}) `
                                                + `{animation-delay: ${((i - 1) * this.settings.buttons.delay).toFixed(2)}s}\n\n`
                                        }
                                        if (this.settings.buttons.sequence == 'fromLast') for (var i = 1; i < count + 1; i++) {
                                            result += `${selector}:nth-last-child(${i}) `
                                                + `{animation-delay: ${((i - 1) * this.settings.buttons.delay).toFixed(2)}s}\n\n`
                                        }

                                    })

                            return result;

                        }

                        this.styles = `

                ${!this.settings.lists.enabled ? '' : `
                ${this.settings.lists.selectors ? this.settings.lists.selectors : AnimationsPlugin.selectorsLists.join(', ')}
                {
                    ${this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.start : `transform: scale(0);`}
                    animation-name: ${this.settings.lists.custom.enabled &&
                                    (this.settings.lists.custom.page >= 0 ?
                                        this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim?.trim?.() != '' &&
                                        this.isValidKeyframe(this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim)
                                        : 0)
                                    ? 'custom-lists' : this.settings.lists.name};
                    animation-fill-mode: forwards;
                    animation-duration: ${this.settings.lists.duration}s;
                    animation-timing-function: ${this.settings.lists.timing};
                }
                `}

                ${!this.settings.buttons.enabled ? '' : `
                ${this.settings.buttons.selectors ? this.settings.buttons.selectors : AnimationsPlugin.selectorsButtons.join(', ')}
                {
                    ${this.settings.buttons.custom.frames[this.settings.buttons.custom.page]?.start ? this.settings.buttons.custom.frames[this.settings.buttons.custom.page]?.start : `transform: scale(0);`}
                    animation-name: ${this.settings.buttons.custom.enabled &&
                                    (this.settings.buttons.custom.page >= 0 ?
                                        this.settings.buttons.custom.frames[this.settings.buttons.custom.page].anim.trim() != '' &&
                                        this.isValidKeyframe(this.settings.buttons.custom.frames[this.settings.buttons.custom.page].anim)
                                        : 0)
                                    ? 'custom-buttons' : this.settings.buttons.name};
                    animation-fill-mode: forwards;
                    animation-duration: ${this.settings.buttons.duration}s;
                    animation-timing-function: ${this.settings.buttons.timing};
                }
                `}

                ${!this.settings.messages.enabled ? '' : `
                /* messages */
                .${FindedModules.MessageListItem} > .${FindedModules.Message}
                {
                    ${this.settings.messages.custom.frames[this.settings.messages.custom.page]?.start ? this.settings.messages.custom.frames[this.settings.messages.custom.page]?.start : `transform: scale(0);`}
                    animation-fill-mode: forwards;
                    animation-name: ${this.settings.messages.custom.enabled &&
                                    (this.settings.messages.custom.page >= 0 ?
                                        this.settings.messages.custom.frames[this.settings.messages.custom.page].anim.trim() != '' &&
                                        this.isValidKeyframe(this.settings.messages.custom.frames[this.settings.messages.custom.page].anim)
                                        : 0)
                                    ? 'custom-messages' : this.settings.messages.name};
                    animation-duration: ${this.settings.messages.duration}s;
                    animation-timing-function: ${this.settings.messages.timing};
                }

                /*lines-forward-messages fix*/
                .${FindedModules.DividerReplying} {z-index: 0}
                `}

                /**Non-custom**/

                /*threads fork*/
                .${FindedModules.ContainerSpine} > svg {
                    transform: scale(0);
                    transform-oringin: 100% 50%;
                    animation-timing-function: linear;
                    animation-duration: ${this.settings.lists.duration}s;
                    animation-fill-mode: forwards;
                }

                /*discord changelog video*/
                .${FindedModules.VideoLead} {
                    animation-name: out !important;
                }

                /**Keyframes**/

                ${keyframes()}

                \n${animPrevStyles()}
                \n${nthStyles()}
                \n${countStyles()}

                /*Custom keyframes*/
                
                @keyframes custom-lists {
                    ${this.settings.lists.custom.page >= 0 ? this.settings.lists.custom.frames[this.settings.lists.custom.page]?.anim : ''}
                }

                @keyframes custom-buttons {
                    ${this.settings.buttons.custom.page >= 0 ? this.settings.buttons.custom.frames[this.settings.buttons.custom.page]?.anim : ''}
                }

                @keyframes custom-messages {
                    ${this.settings.messages.custom.page >= 0 ? this.settings.messages.custom.frames[this.settings.messages.custom.page]?.anim : ''}
                }

                @keyframes custom-messages+sending {
                    ${this.settings.messages.sending.custom.page >= 0 ? this.settings.messages.sending.custom.frames[this.settings.messages.sending.custom.page]?.anim : ''}
                }
                    `;

                        PluginUtilities.removeStyle(`${this.getName()}-main`);

                        await this.wait(pause > 100 ? pause : 100)
                        PluginUtilities.addStyle(`${this.getName()}-main`, this.styles);
                        this.animateChannels();
                        this.animateMembers();
                        //this.animateServers();
                    }

                    closeSettings() {
                        document.querySelector('.bd-addon-modal-footer > .bd-button')?.click?.()
                    }

                    /**
                     * @param {number} ms
                     */
                    wait(ms) {
                        return new Promise((rs, rj) => setTimeout(rs, ms))
                    }

                    requestGhFile(ghApiUrl) {
                        return new Promise(
                            (rs, rj) => {
                                const request = new XMLHttpRequest();
                                request.open("GET", ghApiUrl);
                                request.send();

                                request.onreadystatechange = (e) => {
                                    if (e.currentTarget.readyState != 4) return

                                    let resp = request?.responseText
                                    var responseCode = (resp ? JSON.parse(resp) : undefined);
                                    if (!responseCode) {
                                        rj(request.status, request.statusText)
                                        return
                                    }

                                    var decoded = this.fromBinary(responseCode.content);

                                    rs(decoded)
                                    return
                                }
                            }
                        )
                    }

                    /**
                     * Reads file
                     * @param {locale} [key]
                     * @returns {object | null} translation
                     */
                    stringsGet(key = undefined) {
                        try {
                            let fs = require('fs')
                            let path = require('path')
                            let p = path.join(BdApi.Plugins.folder, this.getName() + '.translation.json')
                            let tr = JSON.parse(fs.readFileSync(p).toString())
                            let result = tr?.[key] || tr
                            return result
                        } catch (err) {
                            return null
                        }
                    }

                    /**
                     * @returns ` new == old `
                     */
                    stringsLoad() {
                        return new Promise(
                            async (rs, rj) => {
                                try {
                                    let fs = require('fs')
                                    let path = require('path')
                                    let p = path.join(BdApi.Plugins.folder, this.getName() + '.translation.json')
                                    let url = 'https://api.github.com/repos/Mopsgamer/BetterDiscord-codes/contents/plugins/Animations/Animations.translation.json' + '?ref=main'
                                    this.requestGhFile(url).then(
                                        async (text_new) => {
                                            let text_old = ''
                                            try {
                                                text_old = fs.readFileSync(p)
                                            } catch {

                                            }
                                            fs.writeFileSync(p, text_new)
                                            rs(text_new == text_old)
                                        }
                                    ).catch(rj)
                                } catch (err) {
                                    rj()
                                    Logger.err(err)
                                }
                            }
                        )
                    }

                    fromBinary = (encoded) => {
                        return decodeURIComponent(atob(encoded).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                    }

                    /**
                     * @param {string} text
                     */
                    isValidKeyframeStruct(text) {
                        if (text?.trim() == '') return false;
                        return (/\s*((from|to|\d+%)\s*{\s*(\s*[a-z-]+:\s*[(\d*\.)*\w\(\)\,\s*]*[(\d*\.)*\w\(\)\,];?\s*)*}\s*)+\s*/g).test(text)
                    }

                    /**
                     * @param {string} text
                     */
                    isValidKeyframe(text) {
                        if (text?.trim() == '') return false;
                        var id = 'keyframe_validator_animations_plugin';
                        var css = `@keyframes KEYFRAME_VALIDATOR {\n${text}\n}`
                        BdApi.injectCSS(id, css)
                        var isValid = document.querySelector("head > bd-head > bd-styles > #" + id).sheet.rules[0]?.cssText.replace(/;| |\n/g, "") === css.replace(/;| |\n/g, "")
                        BdApi.clearCSS(id)
                        return isValid
                    }

                    /**
                     * @param {string} text
                     */
                    isValidCSSStruct(text) {
                        if (text?.trim() == '') return false;
                        return (/(\s*[a-z-]+:\s*[(\d*\.)*\w\(\)\,\s*]*[(\d*\.)*\w\(\)\,];?\s*)*/g).test(text)
                    }

                    /**
                     * @param {string} text
                     */
                    isValidCSS(text) {
                        if (text?.trim() == '') return false;
                        var id = 'css_validator_animations_plugin';
                        var css = `CSS_VALIDATOR {\n${text}\n}`
                        BdApi.injectCSS(id, css)
                        var isValid = document.querySelector(`head #${id}`).sheet.rules[0]?.cssText.replace(/;| |\n/g, "") === css.replace(/;| |\n/g, "")
                        BdApi.clearCSS(id)
                        return isValid
                    }

                    /**
                     * @param {string} text
                     */
                    isValidSelector(text) {
                        try {
                            document.querySelector(text)
                        } catch { return false }
                        return true
                    }

                    eqObjects(object1, object2) {
                        var isObject = function (object) {
                            return object != null && typeof object === 'object';
                        }
                        const keys1 = Object.keys(object1);
                        const keys2 = Object.keys(object2);
                        if (keys1.length !== keys2.length) {
                            return false;
                        }
                        for (const key of keys1) {
                            const val1 = object1[key];
                            const val2 = object2[key];
                            const areObjects = isObject(val1) && isObject(val2);
                            if (
                                areObjects && !deepEqual(val1, val2) ||
                                !areObjects && val1 !== val2
                            ) {
                                return false;
                            }
                        }
                        return true;
                    }

                    getSettingsPanel() {

                        /**
                         * @type {locale}
                         */
                        let locale = FindedModules.LocaleGetter.locale;

                        /**@type {AnimationsPlugin.strings}*/
                        let trn = this.stringsGet(locale);
                        let src = AnimationsPlugin.strings
                        if (trn == null) {
                            trn = src
                        } else for (let key in src) {
                            if (!trn[key]) trn[key] = src[key]
                            else for (let sub in src[key])
                                if (!trn[key][sub]) trn[key][sub] = src[key][sub]
                        }

                        /**
                         * @typedef {object} SvgState
                         * @property {string} [id='']
                         * @property {string} [class='']
                         * @property {string} [color='#fff']
                         * @property {'right' | 'left'} [align]
                         * @property {string} [width='16px']
                         * @property {string} [height='16px']
                         * @property {string} [viewBox='0 0 24 24']
                         * @property {string[]} [paths=[]]
                         */

                        class Svg extends React.Component {

                            constructor(/**@type {SvgState}*/svg) {
                                super(svg)
                                /**@type {SvgState}*/
                                this.state = {
                                    paths: [],
                                    color: '#fff',
                                    width: '16px',
                                    height: '16px',
                                    align: undefined,
                                    viewBox: '0 0 24 24',
                                    ...svg
                                }
                            }

                            render() {

                                return React.createElement('svg',
                                    {
                                        viewBox: this.state.viewBox,
                                        fill: this.state.color,
                                        id: this.state.id ?? '',
                                        class: this.state.class ?? '',
                                        style: {
                                            width: this.state.width,
                                            height: this.state.height,
                                            position: (['right', 'left']).includes(this.state.align) ? 'absolute' : 'relative',
                                            right: (this.state.align == 'right') ? '12px' : 'none',
                                            left: (this.state.align == 'left') ? '12px' : 'none',
                                            'margin-right': '4px'
                                        }
                                    },
                                    this.state.paths.map(path => {
                                        if (typeof path == 'string') return React.createElement('path', { d: path })
                                        else if (typeof path == 'object') return React.createElement(path?.tag ?? 'path', path)
                                        else return null
                                    })
                                )
                            }
                        }

                        /**
                         * @typedef {object} ButtonState
                         * @property {string} [width='fit-content']
                         * @property {string} [height='fit-content']
                         * @property {string} [padding='8px']
                         * @property {string} [margin='8px']
                         * @property {string} [id='']
                         * @property {string} [class='']
                         * @property {boolean} [disabled=false]
                         * @property {string} [link=null]
                         * @property { 'filled' | 'inverted' | 'underline'} [fill='filled'] ` filled ` | ` inverted ` | ` underline `
                         * @property { 'blurple' | 'grey' | 'green' | 'red' } [color='blurple'] ` blurple ` | ` grey ` | ` green ` | ` red `
                         * @property { (e:MouseEvent)=>void } [onclick=null]
                         */

                        class Button extends React.Component {

                            constructor(/**@type {ButtonState}*/button) {
                                super(button)
                                /**@type {ButtonState}*/
                                this.state = button
                            }

                            render() {

                                var button = this.state;
                                return React.createElement('button', {
                                    style: {
                                        display: 'inline-flex',
                                        'align-items': 'center',
                                        'justify-content': 'center',
                                        width: button.width ?? 'fit-content',
                                        height: button.height ?? 'fit-content',
                                        padding: button.padding ?? '8px',
                                        margin: button.margin ?? '8px',
                                        'transition': 'background-color .17s ease, color .17s ease, opacity 250ms ease',
                                    },
                                    id: button.id ?? '',
                                    'data-link': button.link,
                                    class: `animButton ${FindedModules.Button} ${FindedModules.ButtonSizeSmall} ${button.disabled ? 'disabled' : ''} ${(['filled', 'inverted', 'underline']).includes(button.fill) ? button.fill : 'filled'} ${button.color ?? 'blurple'} ${button.class ?? ''}`,
                                    onClick: (e) => {
                                        if (e.currentTarget.classList.contains('disabled')) return
                                        if (typeof button.onclick == 'function') button.onclick(e, this)
                                        if (typeof button.link == 'string') window.open(button.link)
                                    }
                                },
                                    [
                                        Array.isArray(button.svgs) ? button.svgs.map((svgTemp) => React.createElement(Svg, svgTemp)) : null,
                                        React.createElement('span', {
                                            style: {
                                                'max-width': 'none'
                                            },
                                            class: `${FindedModules.ButtonText} ${FindedModules.ButtonContents}`,
                                        },
                                            button.label
                                        ),
                                        typeof button.link == 'string' ? React.createElement(Svg, {
                                            ...SvgTemps.linkArrow,
                                            align: 'right'
                                        }) : null
                                    ]
                                )
                            }
                        }

                        /**
                         * @typedef {object} InputState
                         * @property {string} [width='100%']
                         * @property {string} [height='fit-content']
                         * @property {string} [padding='8px']
                         * @property {string} [margin='8px']
                         * @property {string} [id='']
                         * @property {string} [class='']
                         * @property {boolean} [disabled=false]
                         * @property {string} [placeholder='']
                         * @property {number | ''} [maxlength='']
                         * @property {number | ''} [max='']
                         * @property {number | ''} [min='']
                         * @property {number | ''} [size='']
                         * @property {number | ''} [step=0.01]
                         * @property {string} [value='']
                         * @property {string | 'filled' | 'inverted' | 'underline'} [type='filled'] ` filled ` | ` inverted ` | ` underline `
                         * @property {(e:MouseEvent)=>void} [onclick=null]
                         */

                        class Input extends React.Component {

                            constructor(/**@type {InputState}*/input) {
                                super(input)
                                /**@type {InputState}*/input
                                this.state = input
                            }

                            render() {
                                var input = this.state;
                                return React.createElement('input',
                                    {
                                        style: {
                                            display: 'inline-block',
                                            width: input.width ?? '100%',
                                            height: input.height ?? 'fit-content',
                                            padding: input.padding ?? '8px',
                                            margin: input.margin ?? '8px',
                                        },
                                        placeholder: input.placeholder ?? '',
                                        maxlength: input.maxlength ?? '',
                                        max: input.max ?? '',
                                        min: input.min ?? '0',
                                        size: input.size ?? '',
                                        step: input.step ?? 0.01,
                                        value: input.value ?? '',
                                        type: (['text', 'password', 'email', 'number', 'integer']).includes(input.type) ? (input.type == 'integer' ? 'number' : input.type) : 'text',
                                        id: input.id ?? '',
                                        class: `animInput ${FindedModules.InputDefault} ${input.disabled ? 'disabled' : ''} ${input.class ?? ''}`,
                                        onClick: input.onclick ?? null,
                                        onChange: (e) => {
                                            var value = e.currentTarget.value
                                            var valueNum = e.currentTarget.valueAsNumber

                                            if ((['number', 'integer']).includes(input.type) && !(/(\d*,)/).test(value) && value != '') {
                                                valueNum = (valueNum <= (input.max ?? Infinity) ? valueNum : input.max)
                                                valueNum = (valueNum >= (input.min ?? 0) ? valueNum : input.min ?? 0)
                                                valueNum = (input.type == 'integer' ? Math.floor(valueNum) : valueNum)
                                            }
                                            var newValue = String(value)

                                            this.setState({
                                                ...input,
                                                value: newValue
                                            })

                                            input?.onchange(e, value)
                                        }
                                    }
                                )
                            }
                        }
                        
                        /**
                         * @typedef { {component: 'divider'} } ElementTempDivider
                         * @typedef { {component: 'svg'} & SvgState } ElementTempSvg
                         * @typedef { {component: 'button'} & ButtonState } ElementTempButton
                         * @typedef { {component: 'input'} & InputState } ElementTempInput
                         * @typedef { ElementTempDivider | ElementTempSvg | ElementTempButton | ElementTempInput } ElementTemp
                         */

                        /**
                         * @typedef {ElementsPanelOptions} 
                         * @property {string} [widthAll] The width of each button, if the template does not specify a different width.
                         * @property {string} [heightAll] The height of each button, if the template does not specify a different height.
                         * @property {string} [align="flex-start"] `justify-content` css value for each button container.
                         * @property {boolean} [nosidemargin=true] Zeroing the left and right margins for the first and last button respectively.
                         */

                        /**
                         * Returns object - `class`, `render`.
                         * @param {{elements: ElementTemp[]}[]} containersTemp Array with button container templates.
                         * @param {ElementsPanelOptions} options Panel optinons.
                         */

                        var ElementsPanel = (containersTemp = [], options = {}) => {

                            var result = React.createElement('div', {
                                style: {
                                    display: 'flex',
                                    width: '100%',
                                    'flex-direction': 'column',
                                    'justify-content': options.align ?? 'inline-flex'
                                },
                                class: `elementsPanel`
                            },
                                containersTemp?.map(
                                    containerTemp =>
                                        React.createElement('div',
                                            {
                                                style: {
                                                    display: 'inline-flex',
                                                    width: '100%',
                                                    'justify-content': options.align ?? containerTemp.options?.align ?? 'flex-start'
                                                },
                                                class: `elementsContainer ${options.nosidemargin ?? containerTemp.options?.nosidemargin ?? true ? 'nosidemargin' : ''}`
                                            },
                                            containerTemp.elements?.map(
                                                elementTemp => {
                                                    switch (elementTemp.component) {
                                                        case 'divider':
                                                            return (
                                                                React.createElement('div', { class: 'animFieldDivider' })
                                                            )
                                                        //break;

                                                        case 'svg':
                                                            return (
                                                                React.createElement(Svg, {
                                                                    ...elementTemp
                                                                })
                                                            )
                                                        //break;

                                                        case 'button':
                                                            return (
                                                                React.createElement(Button, {
                                                                    width: options.widthAll ?? containerTemp.options?.widthAll,
                                                                    height: options.heightAll ?? containerTemp.options?.heightAll,
                                                                    margin: options.marginAll ?? containerTemp.options?.marginAll,
                                                                    padding: options.paddingAll ?? containerTemp.options?.paddingAll,
                                                                    ...elementTemp
                                                                })
                                                            )
                                                        //break;

                                                        case 'input':
                                                            return (
                                                                React.createElement(Input, {
                                                                    width: options.widthAll ?? containerTemp.options?.widthAll,
                                                                    height: options.heightAll ?? containerTemp.options?.heightAll,
                                                                    margin: options.marginAll ?? containerTemp.options?.marginAll,
                                                                    padding: options.paddingAll ?? containerTemp.options?.paddingAll,
                                                                    ...elementTemp
                                                                })
                                                            )
                                                        //break;
                                                    }
                                                }
                                            )
                                        )
                                )
                            )

                            class Panel extends React.Component {
                                render() {
                                    return result
                                }
                            }

                            return { class: Panel, render: result };
                        }

                        /**
                         * @typedef {object} TextareaOptions
                         * @property {string} [class='']
                         * @property {string} [width='100%']
                         * @property {string} [height='270px']
                         * @property {string} [placeholder='']
                         * @property {bool} [disabled=false]
                         * @property {bool} [invalid=false]
                         * @property {(e:InputEvent)=>void} [onchange]
                         * @property {(e:MouseEvent)=>void} [onclick]
                         */

                        /**
                         * Returns object - `class`, `render`.
                         * @param {object} options TextareasPanel options.
                         * @param {string} [options.margin]
                         * @param {string} [options.padding]
                         * @param {string} [options.class]
                         * @param {object} [options.elementsPanel] ElementsPanel.
                         * @param {{elements: Array<ElementTemp>}[]} [options.elementsPanel.containersTemp] Array with element container templates.
                         * @param {object} [options.elementsPanel.options] ElementsPanel options.
                         * @param {string} [options.elementsPanel.options.widthAll] The width of each element, if the template does not specify a different width.
                         * @param {string} [options.elementsPanel.options.heightAll] The height of each element, if the template does not specify a different height.
                         * @param {string} [options.elementsPanel.options.marginAll] The margin of each element, if the template does not specify a different height.
                         * @param {string} [options.elementsPanel.options.paddingAll] The padding of each element, if the template does not specify a different height.
                         * @param {string} [options.elementsPanel.options.align="inline-flex"] `justify-content` css value for each element container. Default - `flex-start`.
                         * @param {TextareaOptions[]} [options.textareas] Textareas temps.
                         * @param {(e:InputEvent)=>void} [options.onchange] The event at each change of any of the textareas.
                         * @param {(e:MouseEvent)=>void} [options.onclick] The event at each click of any point.
                         */

                        var TextareasPanel = (options = {}) => {

                            var result = React.createElement('div', {
                                style: {
                                    margin: options.margin ?? null,
                                    padding: options.padding ?? null
                                },
                                class: `animTextareasPanel ${options.class}`,
                                onClick: (e) => {
                                    options.onclick?.(e)
                                }
                            },
                                [
                                    options.elementsPanel ? (ElementsPanel(options.elementsPanel.containersTemp, options.elementsPanel.options ?? {}).render) : null,
                                    ...options.textareas?.map(
                                        textarea => React.createElement('textarea',
                                            {
                                                style: {
                                                    height: textarea?.height ?? '270px',
                                                    width: textarea?.width ?? '100%'
                                                },
                                                spellcheck: 'false',
                                                type: textarea?.type ?? 'text',
                                                placeholder: textarea?.placeholder ?? '',
                                                class: `animTextarea ${textarea?.disabled ? 'disabled' : ''} ${textarea?.invalid ? 'invalid' : ''} ${textarea?.class ?? ''} ${FindedModules.InputDefault} ${FindedModules.TextArea} ${FindedModules.ScrollbarDefault}`,
                                                onChange: (e) => {
                                                    textarea.onchange?.(e)
                                                    options.onchange?.(e)
                                                },
                                                onClick: (e) => {
                                                    textarea.onclick?.(e)
                                                }
                                            },
                                            textarea.value
                                        )
                                    )
                                ]
                            )

                            class Panel extends React.Component {
                                render() {
                                    return result
                                }
                            }

                            return { class: Panel, render: result }
                        }

                        /**
                         * Returns object - `class`, `render`.
                         * @param {Array<{label: string, value: string}>} previewsTemp Array with previews templates.
                         * @param {object} options Panel optinons.
                         * @param {boolean} horizontal Preview positioning.
                         * @param {string} [options.type] `*class*-name`, `*class*-sequence`, ...
                         * @param {string} [options.class] `lists`, `messages`, `buttons`
                         * @param {object} [options.custom] Editor options.
                         * @param {boolean} [options.custom.enabled] Editor availability.
                         * @param {Array<object>} [options.custom.frames] Editor frames default.
                         * @param {number} [options.custom.page] Editor page default.
                         * @param {number} [options.custom.data] Editor data `this.settings.*type*.custom`.
                         * @param {object} [options.tempBlocks] TempBlocks options.
                         * @param {string} [options.tempBlocks.count=4] TempBlocks count.
                         * @param {string} [options.tempBlocks.margin='4px'] TempBlocks margin.
                         * @param {string} [options.tempBlocks.height] TempBlock height.
                         * @param {string} [options.tempBlocks.width] TempBlock width.
                         * @param {(e:MouseEvent)=>void} [onclick]
                         * @param {string} value One of the values of `previevsTemp`
                         */

                        var PreviewsPanel = (previewsTemp = [], options = {}, value, onclick) => {

                            var swipeButtonsDefault = [];
                            var swipeButtonsCustom = [];
                            var previews = [];
                            var containers = [];
                            var textareas = [];
                            var openedPage = 0;
                            var containersCount = 0;
                            var previewsCountOnPage = (options?.horizontal ? 6 : 8);

                            if (options?.custom)
                                if (this.settings[options.class].custom.enabled)
                                    if (!(this.settings[options.class].custom.page >= 0 ? this.isValidKeyframe(this.settings[options.class].custom.frames[this.settings[options.class].custom.page]?.anim) : 0)) {
                                        this.settings[options.class].custom.enabled = false;
                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                    }

                            previewsTemp.forEach((template, index) => {

                                class Preview extends React.Component {

                                    constructor(props) {
                                        super(props)
                                        this.enabled = props.enabled
                                        this.template = props.template
                                        this.page = props.page
                                    }

                                    render() {

                                        var tempBlocks = []
                                        var tempCount = ((typeof options?.tempBlocks?.count == 'number') ? options.tempBlocks.count : 4)

                                        for (var i = 0; i < tempCount; i++) {
                                            tempBlocks[i] = React.createElement('div', {
                                                class: 'animTempBlock',
                                                style: {
                                                    width: options?.tempBlocks?.width ?? (options?.horizontal ? '100%' : 'auto'),
                                                    height: options?.tempBlocks?.height ?? (options?.horizontal ? '26px' : '18%'),
                                                    margin: options?.tempBlocks?.margin ?? (options?.horizontal ? '0 4px' : '4px')
                                                }
                                            })
                                        }

                                        return React.createElement('div', {
                                            'pdata': this.template.value + ',' + options.class,
                                            class: `animPreview ${FindedModules.CodeRedemptionRedirect} ${FindedModules.Card} ${this.enabled ? 'enabled' : ''}`,
                                            onClick: (e) => {
                                                onclick({ value: this.template.value, page: this.page });

                                                var sections = document.querySelectorAll(`[data-type="${options.type}"] .animPreview`);
                                                for (i = 0; i < sections.length; i++) sections[i].classList.remove('enabled');
                                                e.currentTarget.classList.add('enabled');
                                            }
                                        },
                                            [
                                                React.createElement('div',
                                                    {
                                                        class: 'animPreviewTempsContainer'
                                                    },
                                                    tempBlocks
                                                ),

                                                React.createElement('div',
                                                    {
                                                        class: 'animPreviewLabel'
                                                    },
                                                    this.template.label
                                                )
                                            ]
                                        )
                                    }

                                }

                                if (value == template.value) openedPage = Math.ceil((index + 1) / previewsCountOnPage) - 1;

                                previews.push(
                                    React.createElement(Preview,
                                        {
                                            enabled: value == template.value,
                                            template: template,
                                            page: openedPage
                                        },
                                    )
                                )
                            })

                            class CircleButtonPage extends React.Component {

                                constructor(props) {
                                    super(props)
                                    this.index = props.index
                                    this.text = props.text
                                    this.enabled = props.enabled
                                    this.closest = props.closest
                                    this.selector = props.selector
                                    this.tabSelector = props.tabSelector
                                    this.onclick = props.onclick
                                }

                                render() {
                                    return React.createElement('div',
                                        {
                                            class: `animPageCircleButton ${FindedModules.RoundButton} ${this.enabled ? 'enabled' : ''}`,
                                            'data-page': this.index,
                                            onClick: (e) => {
                                                var selectorNodes = e.currentTarget.closest(this.closest).querySelectorAll(this.selector);
                                                var dataPage = e.currentTarget.getAttribute('data-page');

                                                for (var containerElem of selectorNodes) containerElem.classList.remove('show');

                                                selectorNodes[dataPage].classList.add('show');

                                                var sections = document.querySelectorAll(`[data-type="${options.type}"] ${this.tabSelector} .animPageCircleButton`);
                                                for (i = 0; i < sections.length; i++) sections[i].classList.remove('enabled');

                                                e.currentTarget.classList.add('enabled');

                                                this.onclick?.(e)
                                            }
                                        },
                                        this.text
                                    )
                                }
                            }

                            class CircleButton extends React.Component {

                                constructor(props) {
                                    super(props)
                                    this.text = props.text
                                    this.enabled = props.enabled
                                    this.onclick = props.onclick
                                }

                                render() {
                                    return React.createElement('div',
                                        {
                                            class: `animPageCircleButton ${FindedModules.CodeRedemptionRedirect} ${FindedModules.Card} ${this.enabled ? 'enabled' : ''}`,
                                            onClick: (e) => {
                                                this.onclick?.(e)
                                            }
                                        },
                                        this.text
                                    )
                                }
                            }

                            for (containersCount = 0; containersCount + 1 <= Math.ceil(previewsTemp.length / previewsCountOnPage); containersCount++) {
                                swipeButtonsDefault.push(
                                    React.createElement(CircleButtonPage,
                                        {
                                            index: containersCount,
                                            text: containersCount + 1,
                                            enabled: openedPage == containersCount,

                                            closest: '.animPreviewsPanel',
                                            selector: '.animPreviewsContainer',
                                            tabSelector: '.default',
                                            onclick: (e) => {
                                                var dataPage = e.currentTarget.getAttribute('data-page');
                                                this.settings[options.class].page = Number(dataPage);
                                            }
                                        }
                                    )
                                );

                                var pages = [];

                                var i = 0;
                                while (i < previewsCountOnPage) {
                                    pages.push(previews[(containersCount) * previewsCountOnPage + i])
                                    i++
                                }

                                containers.push(
                                    React.createElement('div',
                                        {
                                            class: `animPreviewsContainer ${(options.custom) ? (!this.settings[options.class].custom.enabled && openedPage == containersCount ? 'show' : '') : (openedPage == containersCount ? 'show' : '')} ${previewsTemp.length < previewsCountOnPage + 1 ? 'compact' : ''}`,
                                        },
                                        pages
                                    )
                                );

                            }

                            if (options.custom) {

                                for (var i = 0; i < this.settings[options.class].custom.frames.length; i++) {
                                    textareas.push(
                                        TextareasPanel(
                                            {
                                                elementsPanel: {
                                                    containersTemp: [
                                                        {
                                                            elements: [
                                                                {
                                                                    component: 'button',
                                                                    color: 'grey',
                                                                    label: trn.edit.template,
                                                                    disabled: this.eqObjects({ start: options.custom.data.frames[i].start, anim: options.custom.data.frames[i].anim }, this.defaultFrames.template),
                                                                    onclick: (e) => {
                                                                        var textareaStart = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.start')
                                                                        var textareaAnim = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.anim')

                                                                        textareaStart.value = this.defaultFrames.template.start;
                                                                        textareaAnim.value = this.defaultFrames.template.anim;
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    color: 'grey',
                                                                    label: trn.edit.clear,
                                                                    disabled: this.eqObjects({ start: options.custom.data.frames[i].start, anim: options.custom.data.frames[i].anim }, this.defaultFrames.clear),
                                                                    onclick: (e) => {
                                                                        var textareaStart = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.start')
                                                                        var textareaAnim = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.anim')

                                                                        textareaStart.value = '';
                                                                        textareaAnim.value = '';
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    color: 'blurple',
                                                                    label: trn.edit.load,
                                                                    disabled: this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page],
                                                                        { start: options.custom.data.frames[i].start, anim: options.custom.data.frames[i].anim }),
                                                                    onclick: (e) => {
                                                                        var textareaStart = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.start')
                                                                        var textareaAnim = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.anim')

                                                                        textareaStart.value = this.settings[options.class].custom.frames[this.settings[options.class].custom.page].start
                                                                        textareaAnim.value = this.settings[options.class].custom.frames[this.settings[options.class].custom.page].anim
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    color: 'blurple',
                                                                    label: trn.edit.save,
                                                                    disabled: this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page],
                                                                        { start: options.custom.data.frames[i].start, anim: options.custom.data.frames[i].anim }),
                                                                    onclick: (e) => {
                                                                        var textareaStart = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.start')
                                                                        var textareaAnim = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.anim')

                                                                        this.settings[options.class].custom.frames[this.settings[options.class].custom.page] =
                                                                        {
                                                                            start: textareaStart.value,
                                                                            anim: textareaAnim.value
                                                                        }

                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                        if (
                                                                            this.isValidCSS(this.settings[options.class].custom.frames[this.settings[options.class].custom.page].start) &&
                                                                            this.isValidKeyframe(this.settings[options.class].custom.frames[this.settings[options.class].custom.page].anim)
                                                                        ) this.resetAnimations();
                                                                    }
                                                                },
                                                            ]
                                                        }
                                                    ],
                                                    options: {
                                                        widthAll: '100%',
                                                        marginAll: '0 8px'
                                                    }
                                                },
                                                textareas: [
                                                    {
                                                        height: '72px',
                                                        class: 'start',
                                                        invalid: !('invalid keyframe', this.isValidCSS(options.custom.data.frames[i].start) || options.custom.data.frames[i].start == ""),
                                                        value: options.custom.data.frames[i].start,
                                                        placeholder: `transform: scale(0);`,
                                                        onchange: (e) => {

                                                            var textareaStart = e.currentTarget
                                                            var textareaAnim = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.anim')

                                                            if (this.isValidCSS(textareaStart.value) || textareaStart.value == "") {
                                                                textareaStart.classList.add('valid');
                                                                textareaStart.classList.remove('invalid');
                                                            } else {
                                                                textareaStart.classList.add('invalid');
                                                                textareaStart.classList.remove('valid');
                                                            }

                                                            options.custom?.onchange?.(e)
                                                        }
                                                    },
                                                    {
                                                        height: '250px',
                                                        class: 'anim',
                                                        invalid: !(this.isValidKeyframe(options.custom.data.frames[i].anim) || options.custom.data.frames[i].anim == ""),
                                                        value: options.custom.data.frames[i].anim,
                                                        placeholder: `0% {\n\ttransform: translate(0, 100%);\n}\n\n100% {\n\ttransform: transform(0, 0) scale(1);\n}`,
                                                        onchange: (e) => {

                                                            var textareaStart = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea.start')
                                                            var textareaAnim = e.currentTarget

                                                            if (this.isValidKeyframe(textareaAnim.value) || textareaAnim.value == "") {
                                                                textareaAnim.classList.add('valid');
                                                                textareaAnim.classList.remove('invalid');
                                                            } else {
                                                                textareaAnim.classList.add('invalid');
                                                                textareaAnim.classList.remove('valid');
                                                            }

                                                            options.custom?.onchange?.(e)
                                                        }
                                                    }
                                                ],
                                                class: `${this.settings[options.class].custom.enabled && i == this.settings[options.class].custom.page ? 'show' : ''}`,
                                                onchange: (e) => {
                                                    var textareaStart = e.currentTarget.closest('.animTextareasPanel.show').querySelector('.animTextarea.start')
                                                    var textareaAnim = e.currentTarget.closest('.animTextareasPanel.show').querySelector('.animTextarea.anim')
                                                    this.defaultFrames.values = {
                                                        start: textareaStart.value,
                                                        anim: textareaAnim.value
                                                    }
                                                    var buttons = e.currentTarget.closest('.animTextareasPanel.show').querySelectorAll('.elementsContainer > .animButton')

                                                    buttons[0].classList.toggle('disabled', this.eqObjects(this.defaultFrames.values, this.defaultFrames.template))
                                                    buttons[1].classList.toggle('disabled', this.eqObjects(this.defaultFrames.values, this.defaultFrames.clear))
                                                    buttons[2].classList.toggle('disabled', this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page], this.defaultFrames.values))
                                                    buttons[3].classList.toggle('disabled', this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page], this.defaultFrames.values))
                                                },
                                                onclick: (e) => {
                                                    var textareaStart = e.currentTarget.closest('.animTextareasPanel.show').querySelector('.animTextarea.start')
                                                    var textareaAnim = e.currentTarget.closest('.animTextareasPanel.show').querySelector('.animTextarea.anim')
                                                    this.defaultFrames.values = {
                                                        start: textareaStart.value,
                                                        anim: textareaAnim.value
                                                    }
                                                    var buttons = e.currentTarget.closest('.animTextareasPanel.show').querySelectorAll('.elementsContainer > .animButton')

                                                    buttons[0].classList.toggle('disabled', this.eqObjects(this.defaultFrames.values, this.defaultFrames.template))
                                                    buttons[1].classList.toggle('disabled', this.eqObjects(this.defaultFrames.values, this.defaultFrames.clear))
                                                    buttons[2].classList.toggle('disabled', this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page], this.defaultFrames.values))
                                                    buttons[3].classList.toggle('disabled', this.eqObjects(this.settings[options.class].custom.frames[this.settings[options.class].custom.page], this.defaultFrames.values))
                                                }
                                            },
                                        ).render
                                    );

                                    swipeButtonsCustom.push(
                                        React.createElement(CircleButtonPage,
                                            {
                                                index: i,
                                                text: i + 1,
                                                enabled: this.settings[options.class].custom.page == i,

                                                closest: '.animPreviewsPanel',
                                                selector: '.animTextareasPanel',
                                                tabSelector: '.custom',
                                                onclick: (e) => {
                                                    var dataPage = e.currentTarget.getAttribute('data-page');
                                                    this.settings[options.class].custom.page = Number(dataPage);
                                                }
                                            }
                                        )
                                    );
                                }

                            }

                            class ActionButton extends React.Component {

                                constructor(props) {
                                    super(props)
                                    this.isEditing = props.isEditing
                                    this.onclick = props.onclick
                                }

                                render() {
                                    return React.createElement('div',
                                        {
                                            class: `animPreviewActionButton ${FindedModules.CodeRedemptionRedirect} ${FindedModules.Card} ${this.isEditing ? 'editing' : 'selecting'}`,
                                            onClick: this.onclick
                                        },

                                        React.createElement('div',
                                            {
                                                class: `switchActionButton`
                                            },
                                            [
                                                React.createElement('div', {
                                                    class: 'switchActionButtonLabel'
                                                },
                                                    trn.stng.name_mode_selecting
                                                ),
                                                React.createElement("svg", {
                                                    width: "24",
                                                    height: "24",
                                                    viewBox: "3 2 19 19"
                                                },
                                                    React.createElement("path", {
                                                        style: { fill: "none" },
                                                        d: "M0 0h24v24H0z"
                                                    }),
                                                    React.createElement("path", {
                                                        d: options.horizontal ? "M 4 18 h 17 v -3 H 4 v 3 z M 4 10 v 3 h 17 v -3 h -17 M 4 5 v 3 h 17 V 5 H 4 z" : "M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"
                                                    })
                                                )
                                            ]
                                        ),
                                        React.createElement('div',
                                            {
                                                class: `switchActionButton`
                                            },
                                            [
                                                React.createElement('div', {
                                                    class: 'switchActionButtonLabel'
                                                },
                                                    trn.stng.name_mode_editing
                                                ),
                                                React.createElement("svg", {
                                                    width: "24",
                                                    height: "24",
                                                    viewBox: "0 1 22 22"
                                                },
                                                    React.createElement("path", {
                                                        d: "M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z",
                                                    })
                                                )
                                            ]
                                        )
                                    )
                                }

                            }

                            var result = React.createElement('div',
                                {
                                    class: `animPreviewsPanel ${options.horizontal ? 'horizontal' : 'vertical'}`,
                                    'data-type': options.type
                                },
                                [
                                    options.custom ? React.createElement('div',
                                        {
                                            class: 'animPreviewsActions'
                                        },
                                        React.createElement(ActionButton, {
                                            isEditing: this.settings[options.class].custom.enabled,
                                            onclick: async (e) => {

                                                this.settings[options.class].custom.enabled = !this.settings[options.class].custom.enabled;
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                if (
                                                    this.isValidCSS(this.settings[options.class].custom.frames[this.settings[options.class].custom.page].start) &&
                                                    this.isValidKeyframe(this.settings[options.class].custom.frames[this.settings[options.class].custom.page].anim)
                                                ) this.resetAnimations();

                                                var switcher = e.currentTarget;
                                                var panel = switcher.closest('.animPreviewsPanel');
                                                var all = panel.querySelectorAll(`.animPreviewsContainer, .animTextareasPanel`);
                                                all.forEach(elem => elem.classList.remove('show'));

                                                if (this.settings[options.class].custom.enabled) {
                                                    switcher.classList.add('editing')
                                                    switcher.classList.remove('selecting')
                                                    if (this.settings[options.class].custom.page >= 0) panel.getElementsByClassName(`animTextareasPanel`)[this.settings[options.class].custom.page].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons default')[0].classList.remove('show');
                                                    panel.getElementsByClassName('animPageButtons custom')[0].classList.add('show');
                                                } else {
                                                    switcher.classList.remove('editing')
                                                    switcher.classList.add('selecting')
                                                    if (this.settings[options.class].page >= 0) panel.getElementsByClassName(`animPreviewsContainer`)[this.settings[options.class].page].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons default')[0].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons custom')[0].classList.remove('show');
                                                }

                                            }
                                        })
                                    ) : null,
                                    ...containers,
                                    ...textareas,
                                    containers.length > 1 ?
                                        React.createElement('div',
                                            {
                                                class: `animPageButtons default ${options.custom ? (!this.settings[options.class].custom.enabled ? 'show' : '') : 'show'}`,
                                            },
                                            swipeButtonsDefault
                                        ) : null,
                                    React.createElement('div',
                                        {
                                            class: `animPageButtons custom ${options.custom ? (this.settings[options.class].custom.enabled ? 'show' : '') : 'show'}`,
                                        },
                                        swipeButtonsCustom
                                    ),
                                ]
                            )


                            class Panel extends React.Component {
                                render() {
                                    return result
                                }
                            }

                            return { class: Panel, render: result };
                        }

                        /**
                         * @typedef { object | ElementTempDivider } TabTemp
                         * @property {bool} disabled
                         * @property {string} name
                         * @property {(string, React.Component)[]} content
                         */

                        /**
                         * Returns object - `class`, `render`.
                         * @param {TabTemp[]} [tabsTemp=[]]
                         * @param {object} [options={}]
                         * @param {number} [options.active='']
                         * @param {string} [options.class='']
                         * @param {string} [options.margin=null]
                         * @param {string} [options.padding=null]
                         */

                        var TabsPanel = (tabsTemp = [], options = {}) => {

                            var tabsNodes = [];
                            var contentNodes = [];
                            var index = 0;

                            tabsTemp.forEach((tabTemp) => {

                                if (tabTemp?.component == 'divider') {
                                    tabsNodes.push(React.createElement('div', { class: `animTabDivider` }))
                                    return;
                                }

                                tabsNodes.push(
                                    React.createElement('div',
                                        {
                                            'data-index': index,
                                            class: `animTab ${options?.active == index ? 'selected' : ''} ${tabTemp.disabled ? 'disabled' : ''}`,
                                            onClick: (e) => {
                                                if (tabTemp.disabled) return;
                                                var tab = e.currentTarget;
                                                var index = Number(tab.getAttribute('data-index'));
                                                var panel = tab.closest('.animTabsPanel');

                                                panel.querySelectorAll(`.animTab:not([data-index="${index}"])`).forEach(
                                                    (content) => {
                                                        content.classList.remove('selected')
                                                    }
                                                );
                                                panel.querySelectorAll(`.animContent:not([data-index="${index}"])`).forEach(
                                                    (content) => {
                                                        content.classList.remove('show')
                                                    }
                                                );
                                                panel.querySelector(`.animTab[data-index="${index}"]`).classList.toggle('selected')
                                                panel.querySelector(`.animContent[data-index="${index}"]`).classList.toggle('show')
                                            }
                                        },
                                        tabTemp.name
                                    )
                                )

                                contentNodes.push(
                                    React.createElement('div',
                                        {
                                            'data-index': index,
                                            class: `animContent ${options?.active == index ? 'show' : ''}`
                                        },
                                        Array.isArray(tabTemp.content) ? tabTemp.content : []
                                    )
                                )

                                index++
                            })

                            var result = React.createElement('div', {
                                style: {
                                    margin: options.margin ?? null,
                                    padding: options.padding ?? null
                                },
                                class: `animTabsPanel ${options.class ?? ''}`
                            },
                                [
                                    React.createElement('div',
                                        {
                                            class: 'animTabsContainer'
                                        },
                                        tabsNodes
                                    ),

                                    React.createElement('div',
                                        {
                                            class: 'animContentsContainer'
                                        },
                                        contentNodes
                                    ),
                                ]
                            )

                            class Panel extends React.Component {
                                render() {
                                    return result
                                }
                            }

                            return { class: Panel, render: result }
                        }

                        /**
                         * Field.
                         * @param {string} title
                         * @param {string} note
                         * @param {string} content
                         */

                        var Field = (title, note, content) => {

                            var result = React.createElement('div',
                                {
                                    class: 'animField'
                                },
                                [
                                    React.createElement('div', { class: 'animFieldDivider' }),
                                    React.createElement('div', { class: 'animFieldTitle' }, title),
                                    React.createElement('div', { class: 'animFieldNote' }, note),
                                    React.createElement('div', { class: 'animFieldContent' }, content)
                                ]
                            )

                            class Field extends React.Component {
                                render() {
                                    return result
                                }
                            }

                            return { class: Field, render: result }
                        }

                        let Textcolors = {
                            gray: '#36393f',
                            green: '#3ba55d',
                            red: '#ed4245',
                            yellow: '#faa81a'
                        }

                        let SvgTemps = {
                            checked: {
                                paths: ['M5.37499 3H18.625C19.9197 3 21.0056 4.08803 21 5.375V18.625C21 19.936 19.9359 21 18.625 21H5.37499C4.06518 21 3 19.936 3 18.625V5.375C3 4.06519 4.06518 3 5.37499 3Z M9.58473 14.8636L6.04944 11.4051L4.50003 12.9978L9.58473 18L19.5 8.26174L17.9656 6.64795L9.58473 14.8636Z'],
                                viewBox: '0 0 24 24'
                            },
                            closeCross: {
                                paths: ["M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"],
                                viewBox: '3 2 19 19'
                            },
                            downloadArrow: {
                                paths: ['M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z'],
                                viewBox: '-1 -1 26 26'
                            },
                            gear: {
                                paths: ['M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z'],
                                viewBox: '0 0 24 24'
                            },
                            help: {
                                paths: ["M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.691 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.691 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.103 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z"],
                                viewBox: '0 0 24 24'
                            },
                            info: {
                                paths: ["M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"],
                                viewBox: '0 0 12 12'
                            },
                            leftArrow: {
                                paths: ['M18.35 4.35 16 2 6 12 16 22 18.35 19.65 10.717 12Z'],
                                viewBox: '0 0 24 24'
                            },
                            linkArrow: {
                                paths: ['M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z', 'M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z'],
                                viewBox: '0 0 24 24'
                            },
                            Logos: {
                                betterdiscord: {
                                    paths: ['M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z', 'M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z'],
                                    viewBox: '0 0 2000 2000'
                                },
                                discord: {
                                    paths: ['M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 ' + '18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z'],
                                    viewBox: '0 -5 28 28'
                                },
                                github: {
                                    paths: ['m12 .5c-6.63 0-12 5.28-12 11.792 0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 ' + '3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56 4.801-1.548 8.236-5.97 8.236-11.173 0-6.512-5.373-11.792-12-11.792z'],
                                    viewBox: '0 0 24 24'
                                },
                                patreon: {
                                    paths: ['m0 .5h4.219v23h-4.219z', 'm15.384.5c-4.767 0-8.644 3.873-8.644 8.633 0 4.75 3.877 8.61 8.644 8.61 4.754 0 8.616-3.865 8.616-8.61 0-4.759-3.863-8.633-8.616-8.633z'],
                                    viewBox: '0 0 24 24'
                                }
                            },
                            Other: {
                                translation: {
                                    paths: ['M25.74 30.15l-5.08-5.02.06-.06c3.48-3.88 5.96-8.34 7.42-13.06h5.86v-4.01h-14v-4h-4v4h-14v3.98h22.34c-1.35 3.86-3.46 7.52-6.34 10.72-1.86-2.07-3.4-4.32-4.62-6.7h-4c1.46 3.26 3.46 6.34 5.96 9.12l-10.17 10.05 2.83 2.83 10-10 6.22 6.22 1.52-4.07zm11.26-10.15h-4l-9 24h4l2.25-6h9.5l2.25 6h4l-9-24zm-5.25 14l3.25-8.67 3.25 8.67h-6.5z'],
                                    viewBox: '0 0 48 48'
                                },
                                changelogArrow: {
                                    paths: ['M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'],
                                    viewBox: '0 0 24 24'
                                },
                                circleArrow: {
                                    paths: ['M 13 3 c -4.97 0 -9 4.03 -9 9 H 1 l 3.89 3.89 l 0.07 0.14 L 9 12 H 6 c 0 -3.87 3.13 -7 7 -7 s 7 3.13 7 7 s -3.13 7 -7 7 c -1.93 0 -3.68 -0.79 -4.94 -2.06 l -1.42 1.42 C 8.27 19.99 10.51 21 13 21 c 4.97 0 9 -4.03 9 -9 s -4.03 -9 -9 -9 z'],
                                    viewBox: '0 0 24 24'
                                },
                                donate: {
                                    paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z'],
                                    viewBox: '2 2 20 20'
                                },
                                eye: {
                                    paths: ['M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'],
                                    viewBox: '0 0 24 24'
                                },
                                gear: {
                                    paths: ['M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z'],
                                    viewBox: '1 1 18 18'
                                },
                                help: {
                                    paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z'],
                                    viewBox: '2 2 20 20'
                                },
                                list: {
                                    paths: ['M4 18h17v-6H4v6zM4 5v6h17V5H4z'],
                                    viewBox: '3 2 19 19'
                                },
                                list2: {
                                    paths: ['M 4 18 h 17 v -3 H 4 v 3 z M 4 10 v 3 h 17 v -3 h -17 M 4 5 v 3 h 17 V 5 H 4 z'],
                                    viewBox: '3 2 19 19'
                                },
                                pencil: {
                                    paths: ['M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'],
                                    viewBox: '0 0 24 24'
                                },
                                puzzle: {
                                    paths: ['M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z'],
                                    viewBox: '0 0 24 24'
                                },
                                tile: {
                                    paths: ['M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z'],
                                    viewBox: '3 2 19 19'
                                },
                                trash: {
                                    paths: ['M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z'],
                                    viewBox: '0 0 24 24'
                                },
                                web: {
                                    paths: ['M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z'],
                                    viewBox: '2 2 20 20'
                                }
                            },
                            pencil: {
                                paths: ["M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z"],
                                viewBox: '0 1 22 22'
                            },
                            radioChecked: {
                                paths: [{
                                    'clip-rule': 'evenodd',
                                    d: 'M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z',
                                    fill: '#fff',
                                    'fill-rule': 'evenodd'
                                }, {
                                    cx: '12',
                                    cy: '12',
                                    r: '5',
                                    tag: 'circle'
                                }],
                                viewBox: '0 0 24 24'
                            },
                            radioUnchecked: {
                                paths: [{
                                    'clip-rule': 'evenodd',
                                    d: 'M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z',
                                    'fill-rule': 'evenodd'
                                }],
                                viewBox: '0 0 24 24'
                            },
                            rightArrow: {
                                paths: ['M8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12Z'],
                                viewBox: '0 0 24 24'
                            },
                            searchCross: {
                                paths: ['M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'],
                                viewBox: '0 0 24 24'
                            },
                            searchLoupe: {
                                paths: ['M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.398 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.398 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z'],
                                viewBox: '0 0 24 24'
                            },
                            switcherCross: {
                                paths: ['M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z', 'M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z'],
                                viewBox: '0 0 20 20'
                            },
                            switcherTick: {
                                paths: ['M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z', 'M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z'],
                                viewBox: '0 0 20 20'
                            },
                            unchecked: {
                                paths: ['M5.37499 3H18.625C19.9197 3 21.0056 4.08803 21 5.375V18.625C21 19.936 19.9359 21 18.625 21H5.37499C4.06518 21 3 19.936 3 18.625V5.375C3 4.06519 4.06518 3 5.37499 3Z M 19 19 V 5 H 5 V 19 H 19 Z'],
                                viewBox: '0 0 24 24'
                            },
                            warn: {
                                paths: ["M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"],
                                viewBox: '-2 -2 24 24'
                            }
                        }

                        setTimeout(() => {
                            let mymodal = [...document.getElementsByClassName('bd-addon-modal')].find(modal => modal.querySelector('h4').innerText == 'ANIMATIONS SETTINGS')

                            mymodal.querySelectorAll('.animButton').forEach(
                                btn => {
                                    let span = btn.querySelector('span')
                                    if (span.offsetWidth < span.scrollWidth) {
                                        Tooltip.create(btn, span.innerText, { preventFlip: true, side: 'bottom' })
                                    }
                                    else if (btn.getAttribute('data-link')) {
                                        let svgs = Array.from(btn.querySelectorAll('svg'))
                                        let svg = svgs[svgs.length - 1]
                                        let tt = new Tooltip(btn, btn.getAttribute('data-link'), { preventFlip: true, side: 'top', disabled: true })
                                        svg.addEventListener('mouseenter', () => tt.show())
                                        svg.addEventListener('mouseleave', () => tt.hide())
                                    }
                                }
                            )
                            mymodal.querySelectorAll('.animPreviewsPanel.vertical .animPreview').forEach(
                                prev => {
                                    let labelv = prev.querySelector('.animPreviewLabel')
                                    if (labelv.offsetHeight < labelv.scrollHeight) {
                                        Tooltip.create(prev, labelv.innerText, { preventFlip: true, side: 'bottom' })
                                    }
                                }
                            )
                            mymodal.querySelectorAll('.animPreviewsPanel.horizontal .animPreview').forEach(
                                prev => {
                                    let labelh = prev.querySelector('.animPreviewLabel')
                                    if (labelh.offsetWidth < labelh.scrollWidth) {
                                        Tooltip.create(prev, labelv.innerText, { preventFlip: true, side: 'bottom' })
                                    }
                                }
                            )
                            mymodal.querySelectorAll('svg[id*=help-timing-]').forEach(
                                svg => {
                                    let link = 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function'
                                    svg.addEventListener('click', () => window.open(link))
                                }
                            )
                        }, 500)

                        var settings_panel =
                            Settings.SettingPanel.build(
                                this.saveSettings.bind(this),

                                new Settings.SettingField(null, null, null,
                                    ElementsPanel(
                                        [
                                            {
                                                elements: [
                                                    {
                                                        component: 'button',
                                                        color: 'blurple',
                                                        label: trn.view.changelog,
                                                        svgs: [SvgTemps.Other.changelogArrow],
                                                        id: 'animations-version-changelog',
                                                        inverted: false,
                                                        onclick: (e) => {
                                                            Modals.showChangelogModal(this.getName(), this.getVersion(), config.changelog)
                                                        }
                                                    },
                                                    {
                                                        component: 'button',
                                                        color: 'blurple',
                                                        label: trn.view.reset_all_settings,
                                                        id: 'animations-reset',
                                                        svgs: [SvgTemps.gear],
                                                        onclick: async (e) => {

                                                            let button = e.currentTarget;
                                                            button.getElementsByTagName('span')[0].innerText = trn.view.resetting;
                                                            await this.wait(500);

                                                            PluginUtilities.saveSettings(this.getName(), this.defaultSettings);
                                                            this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                            this.resetAnimations();
                                                            this.closeSettings();
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                elements: [
                                                    {
                                                        component: 'button',
                                                        label: trn.view.upd_translation,
                                                        color: 'blurple',
                                                        id: 'animations-update-translation',
                                                        svgs: [SvgTemps.Other.translation],
                                                        onclick: async (e, c) => {
                                                            c.setState({ svgs: [SvgTemps.Other.translation, SvgTemps.downloadArrow], disabled: true, label: trn.view.update_searching })

                                                            this.stringsLoad()
                                                            .then(
                                                                async (eq) => {
                                                                    if (eq) c.setState({ svgs: [SvgTemps.Other.translation], color: 'grey', label: trn.view.update_latest});
                                                                    else {
                                                                        c.setState({ svgs: [SvgTemps.Other.translation], color: 'green', label: trn.view.resetting});
                                                                        await this.wait(1000)
                                                                        this.closeSettings()
                                                                    }
                                                                }
                                                            ).catch(
                                                                async (status, text) => {
                                                                    c.setState({ svgs: [SvgTemps.warn], color: 'red', label: `${trn.view.update_err_unknown} [${status}]` })
                                                                }
                                                            )
                                                        }
                                                    },
                                                    {
                                                        component: 'button',
                                                        color: 'blurple',
                                                        label: trn.view.update_check,
                                                        svgs: [SvgTemps.downloadArrow],
                                                        id: 'animations-version-check',
                                                        inverted: false,
                                                        onclick: async (e, c) => {
                                                            let button = e.currentTarget;

                                                            c.setState({ color: 'blurple', disabled: true, label: trn.view.update_searching })

                                                            const request = new XMLHttpRequest();
                                                            request.open("GET", 'https://api.github.com/repos/Mopsgamer/BetterDiscord-codes/contents/Animations.plugin.js' + '?ref=Animations');
                                                            request.send();

                                                            request.timeout = 15000;
                                                            request.timeout
                                                            request.ontimeout = function (e) {
                                                                c.setState({ color: 'red', disabled: false, label: trn.view.update_err_timeout })
                                                            };
                                                            request.onerror = function (e) {
                                                                c.setState({ svgs: [SvgTemps.warn], color: 'red', disabled: false, label: trn.view.update_err_unknown })
                                                            };

                                                            request.onreadystatechange = (e) => {
                                                                if (e.currentTarget.readyState != 4) return

                                                                c.setState({disabled: false});
                                                                var responseCode = JSON.parse(request?.responseText ?? undefined);
                                                                if (!request.responseText) {
                                                                    c.setState({ svgs: [SvgTemps.warn], color: 'red', label: trn.view.update_err_unknown + '(try again later)' })
                                                                    return
                                                                }
                                                                else if (responseCode?.message == 'Not Found') {
                                                                    c.setState({ svgs: [SvgTemps.warn], color: 'red', label: trn.view.update_err_unknown + '(update it yourself)' })
                                                                    return
                                                                }

                                                                var GitHubFileText = this.fromBinary(responseCode.content);
                                                                var GitHubVersion = (/(\d+\.)*\d+/).exec((/^.*@version\s+(\d+\.)\d+.*$/m).exec(GitHubFileText))[0]

                                                                function newerVersion(v1, v2) {
                                                                    var v1Dots = v1.match(/\./g).length
                                                                    var v2Dots = v2.match(/\./g).length
                                                                    const newParts = v1.split('.')
                                                                    const oldParts = v2.split('.')

                                                                    for (var i = 0; i < (v1Dots > v2Dots ? v1Dots : v2Dots) + 1; i++) {
                                                                        const a = parseInt(newParts[i]) || 0
                                                                        const b = parseInt(oldParts[i]) || 0
                                                                        if (a > b) return v1
                                                                        if (a < b) return v2
                                                                    }
                                                                    return false
                                                                }

                                                                var UpdatePlugin = () => {
                                                                    this.closeSettings()
                                                                    return new Promise((rs, rj) => {
                                                                        try {
                                                                            let fs = require('fs')
                                                                            let path = require('path')
                                                                            fs.writeFile(__filename, GitHubFileText, rs)
                                                                        } catch (err) {
                                                                            Logger.err(this.getName(), err)
                                                                        }
                                                                    })
                                                                }

                                                                switch (newerVersion(GitHubVersion, this.getVersion())) {
                                                                    case GitHubVersion:
                                                                        c.setState({ color: 'green', label: trn.view.update_older })
                                                                        button.addEventListener('click',
                                                                            () => {
                                                                                BdApi.showConfirmationModal(trn.pop.will_updated,
                                                                                    [
                                                                                        trn.pop.you_can_say_no,
                                                                                        '', '',
                                                                                        React.createElement(
                                                                                            'span', { style: { color: 'var(--header-primary)', 'text-transform': 'uppercase' } },
                                                                                            this.getVersion() + " ??? " + GitHubVersion
                                                                                        )
                                                                                    ],
                                                                                    {
                                                                                        confirmText: trn.pop.yes,
                                                                                        cancelText: trn.pop.no,
                                                                                        onConfirm() {
                                                                                            UpdatePlugin()
                                                                                        }
                                                                                    })
                                                                            },
                                                                            { once: true }
                                                                        )
                                                                        break;
                                                                    case this.getVersion():
                                                                        c.setState({ color: 'grey', label: trn.view.update_newer })
                                                                        button.addEventListener('click',
                                                                            () => {
                                                                                BdApi.showConfirmationModal(trn.pop.will_downdated,
                                                                                    [
                                                                                        trn.pop.you_can_say_no,
                                                                                        '', '',
                                                                                        React.createElement(
                                                                                            'span', { style: { color: 'var(--header-primary)', 'text-transform': 'uppercase' } },
                                                                                            this.getVersion() + " ??? " + GitHubVersion
                                                                                        )
                                                                                    ],
                                                                                    {
                                                                                        confirmText: trn.pop.yes,
                                                                                        cancelText: trn.pop.no,
                                                                                        onConfirm() {
                                                                                            UpdatePlugin()
                                                                                        }
                                                                                    })
                                                                            },
                                                                            { once: true }
                                                                        )
                                                                        break;
                                                                    case false:
                                                                        c.setState({ color: 'grey', label: trn.view.update_latest })
                                                                        button.addEventListener('click',
                                                                            () => {
                                                                                BdApi.showConfirmationModal(trn.pop.will_restored,
                                                                                    [
                                                                                        trn.pop.you_can_say_no,
                                                                                        '', '',
                                                                                        React.createElement(
                                                                                            'span', { style: { color: 'var(--header-primary)', 'text-transform': 'uppercase' } },
                                                                                            this.getVersion() + " ??? " + GitHubVersion
                                                                                        )
                                                                                    ],
                                                                                    {
                                                                                        confirmText: trn.pop.yes,
                                                                                        cancelText: trn.pop.no,
                                                                                        onConfirm() {
                                                                                            UpdatePlugin()
                                                                                        }
                                                                                    })
                                                                            },
                                                                            { once: true }
                                                                        )
                                                                        break;

                                                                    default:
                                                                        break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                elements: [
                                                    { component: 'divider' },
                                                ]
                                            },
                                            {
                                                elements: [
                                                    {
                                                        component: 'button',
                                                        label: trn.view.link_gh_issues,
                                                        color: 'grey',
                                                        id: 'animations-issues',
                                                        svgs: [SvgTemps.Logos.github],
                                                        link: 'https://github.com/Mopsgamer/BetterDiscord-codes/issues'
                                                    },
                                                    {
                                                        component: 'button',
                                                        label: trn.view.link_gh_discussions,
                                                        color: 'grey',
                                                        id: 'animations-discussions',
                                                        svgs: [SvgTemps.Logos.github],
                                                        link: 'https://github.com/Mopsgamer/BetterDiscord-codes/discussions'
                                                    },
                                                ],
                                            },
                                            {
                                                elements: [
                                                    {
                                                        component: 'button',
                                                        label: trn.view.links_dc_server,
                                                        color: 'blurple',
                                                        id: 'animations-server',
                                                        svgs: [SvgTemps.Logos.discord],
                                                        link: 'discord://discord.com/invite/' + config.info.invite,
                                                        onclick: () => { this.closeSettings() }
                                                    },
                                                    {
                                                        component: 'button',
                                                        label: trn.view.link_cd,
                                                        color: 'grey',
                                                        id: 'animations-crowdin',
                                                        svgs: [SvgTemps.Other.translation],
                                                        link: 'https://crwd.in/bdp-animations'
                                                    },

                                                ],
                                            },
                                        ],
                                        {
                                            widthAll: '100%',
                                            align: 'space-between'
                                        }).class
                                ),

                                new Settings.SettingField(null, null, null,

                                    TabsPanel(
                                        [
                                            {
                                                name: trn.view.lists,
                                                content: [
                                                    Field(null, null,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'button',
                                                                            svgs: [this.settings.lists.enabled ? SvgTemps.checked : SvgTemps.unchecked],
                                                                            color: this.settings.lists.enabled ? 'green' : 'red',
                                                                            label: trn.view.lists,
                                                                            id: 'lists-switch-button',
                                                                            onclick: async (e) => {

                                                                                let button = e.currentTarget

                                                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                                                this.settings.lists.enabled = !this.settings.lists.enabled;
                                                                                if (!this.settings.lists.enabled) {
                                                                                    button.classList.remove('green')
                                                                                    button.classList.add('red')
                                                                                    button.querySelector('path').setAttribute('d', SvgTemps.unchecked.paths)
                                                                                } else {
                                                                                    button.classList.remove('red')
                                                                                    button.classList.add('green')
                                                                                    button.querySelector('path').setAttribute('d', SvgTemps.checked.paths)
                                                                                }
                                                                                await this.resetAnimations();
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                button.getElementsByTagName('span')[0].innerText = trn.view.lists;
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            color: 'blurple',
                                                                            label: trn.view.reset_lists,
                                                                            id: 'animations-reset-lists',
                                                                            svgs: [SvgTemps.Other.circleArrow],
                                                                            onclick: async (e) => {

                                                                                let button = e.currentTarget;
                                                                                button.getElementsByTagName('span')[0].innerText = trn.view.resetting;
                                                                                await this.wait(500);

                                                                                this.settings.lists = this.defaultSettings.lists
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                                this.resetAnimations();
                                                                                this.closeSettings();
                                                                            },
                                                                        }
                                                                    ],
                                                                    options: {
                                                                        widthAll: '100%',
                                                                        align: 'space-between'
                                                                    }
                                                                }
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.name, trn.stng.name_note_lists,
                                                        PreviewsPanel(
                                                            [
                                                                { label: trn.name.in, value: 'in' },
                                                                { label: trn.name.out, value: 'out' },
                                                                { label: trn.name.circle, value: 'circle' },
                                                                { label: trn.name.polygon, value: 'polygon' },
                                                                { label: trn.name.opacity, value: 'opacity' },
                                                                { label: trn.name.slime, value: 'slime' },
                                                                { label: trn.name.brick_right, value: 'brick-right' },
                                                                { label: trn.name.brick_left, value: 'brick-left' },
                                                                { label: trn.name.brick_up, value: 'brick-up' },
                                                                { label: trn.name.brick_down, value: 'brick-down' },
                                                                { label: trn.name.slide_right, value: 'slide-right' },
                                                                { label: trn.name.slide_left, value: 'slide-left' },
                                                                { label: trn.name.slide_up, value: 'slide-up' },
                                                                { label: trn.name.slide_down, value: 'slide-down' },
                                                                { label: trn.name.slide_up_right, value: 'slide-up-right' },
                                                                { label: trn.name.slide_up_left, value: 'slide-up-left' },
                                                                { label: trn.name.slide_down_right, value: 'slide-down-right' },
                                                                { label: trn.name.slide_down_left, value: 'slide-down-left' },
                                                                { label: trn.name.skew_right, value: 'skew-right' },
                                                                { label: trn.name.skew_left, value: 'skew-left' },
                                                                { label: trn.name.wide_skew_right, value: 'wide-skew-right' },
                                                                { label: trn.name.wide_skew_left, value: 'wide-skew-left' },
                                                            ],
                                                            {
                                                                type: 'lists-name',
                                                                class: 'lists',
                                                                custom: {
                                                                    data: this.settings.lists.custom,
                                                                }
                                                            },
                                                            this.settings.lists.name,
                                                            (e) => {
                                                                this.settings.lists.name = e.value;
                                                                this.settings.lists.page = e.page;
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.resetAnimations()
                                                            }).render
                                                    ).render,

                                                    Field(trn.stng.sequence, trn.stng.sequence_note_lists,
                                                        PreviewsPanel(
                                                            [
                                                                { label: trn.seq.from_first, value: 'fromFirst' },
                                                                { label: trn.seq.from_last, value: 'fromLast' },
                                                            ],
                                                            {
                                                                type: 'lists-sequence',
                                                                class: 'lists'
                                                            },
                                                            this.settings.lists.sequence,
                                                            (e) => {
                                                                this.settings.lists.sequence = e.value;
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.resetAnimations()
                                                            }
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.timing, trn.stng.timing_note_lists,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.lists.timing,
                                                                            max: 0.35,
                                                                            step: 0.01,
                                                                            type: 'string',
                                                                            onchange: (e, v) => {
                                                                                this.settings.lists.timing = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'svg',
                                                                            id: 'help-timing-lists',
                                                                            width: '25px',
                                                                            height: '50px',
                                                                            ...SvgTemps.Other.help
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.lists.timing;
                                                                                this.settings.lists.timing = this.defaultSettings.lists.timing;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.delay, trn.stng.delay_note_lists,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.lists.delay,
                                                                            max: 0.35,
                                                                            step: 0.01,
                                                                            type: 'number',
                                                                            onchange: (e, v) => {
                                                                                this.settings.lists.delay = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.lists.delay;
                                                                                this.settings.lists.delay = this.defaultSettings.lists.delay;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.duration, trn.stng.duration_note_lists,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.lists.duration,
                                                                            max: 3,
                                                                            step: 0.1,
                                                                            type: 'number',
                                                                            onchange: (e, v) => {
                                                                                this.settings.lists.duration = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.lists.duration;
                                                                                this.settings.lists.duration = this.defaultSettings.lists.duration;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        ).render
                                                    ).render,
                                                ]
                                            },
                                            {
                                                name: trn.view.buttons,
                                                content: [
                                                    Field(null, null,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'button',
                                                                            svgs: [this.settings.buttons.enabled ? SvgTemps.checked : SvgTemps.unchecked],
                                                                            color: this.settings.buttons.enabled ? 'green' : 'red',
                                                                            label: trn.view.buttons,
                                                                            id: 'buttons-switch-button',
                                                                            onclick: async (e) => {

                                                                                let button = e.currentTarget

                                                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                                                this.settings.buttons.enabled = !this.settings.buttons.enabled;
                                                                                if (!this.settings.buttons.enabled) {
                                                                                    button.classList.remove('green')
                                                                                    button.classList.add('red')
                                                                                    button.querySelector('path').setAttribute('d', SvgTemps.unchecked.paths)
                                                                                } else {
                                                                                    button.classList.remove('red')
                                                                                    button.classList.add('green')
                                                                                    button.querySelector('path').setAttribute('d', SvgTemps.checked.paths)
                                                                                }
                                                                                await this.resetAnimations();
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                button.getElementsByTagName('span')[0].innerText = trn.view.buttons;
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            color: 'blurple',
                                                                            label: trn.view.reset_buttons,
                                                                            id: 'animations-reset-buttons',
                                                                            svgs: [SvgTemps.Other.circleArrow],
                                                                            onclick: async (e) => {

                                                                                let button = e.currentTarget;
                                                                                button.getElementsByTagName('span')[0].innerText = trn.view.resetting;
                                                                                await this.wait(500);

                                                                                this.settings.buttons = this.defaultSettings.buttons
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                                this.resetAnimations();
                                                                                this.closeSettings();
                                                                            },
                                                                        }
                                                                    ],
                                                                    options: {
                                                                        widthAll: '100%',
                                                                        align: 'space-between'
                                                                    }
                                                                }
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.name, trn.stng.name_note_buttons,
                                                        PreviewsPanel(
                                                            [
                                                                { label: trn.name.in, value: 'in' },
                                                                { label: trn.name.out, value: 'out' },
                                                                { label: trn.name.circle, value: 'circle' },
                                                                { label: trn.name.polygon, value: 'polygon' },
                                                                { label: trn.name.opacity, value: 'opacity' },
                                                                { label: trn.name.slime, value: 'slime' },
                                                                { label: trn.name.brick_right, value: 'brick-right' },
                                                                { label: trn.name.brick_left, value: 'brick-left' },
                                                                { label: trn.name.brick_up, value: 'brick-up' },
                                                                { label: trn.name.brick_down, value: 'brick-down' },
                                                                { label: trn.name.slide_right, value: 'slide-right' },
                                                                { label: trn.name.slide_left, value: 'slide-left' },
                                                                { label: trn.name.slide_up, value: 'slide-up' },
                                                                { label: trn.name.slide_down, value: 'slide-down' },
                                                                { label: trn.name.slide_up_right, value: 'slide-up-right' },
                                                                { label: trn.name.slide_up_left, value: 'slide-up-left' },
                                                                { label: trn.name.slide_down_right, value: 'slide-down-right' },
                                                                { label: trn.name.slide_down_left, value: 'slide-down-left' },
                                                                { label: trn.name.skew_right, value: 'skew-right' },
                                                                { label: trn.name.skew_left, value: 'skew-left' },
                                                                { label: trn.name.wide_skew_right, value: 'wide-skew-right' },
                                                                { label: trn.name.wide_skew_left, value: 'wide-skew-left' },
                                                            ],
                                                            {
                                                                type: 'buttons-name',
                                                                class: 'buttons',
                                                                horizontal: true,
                                                                custom: {
                                                                    data: this.settings.buttons.custom,
                                                                }
                                                            },
                                                            this.settings.buttons.name,
                                                            (e) => {
                                                                this.settings.buttons.name = e.value;
                                                                this.settings.buttons.page = e.page;
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.resetAnimations()
                                                            }
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.sequence, trn.stng.sequence_note_buttons,
                                                        PreviewsPanel(
                                                            [
                                                                { label: trn.seq.from_first, value: 'fromFirst' },
                                                                { label: trn.seq.from_last, value: 'fromLast' },
                                                            ],
                                                            {
                                                                horizontal: true,
                                                                type: 'buttons-sequence',
                                                                class: 'buttons'
                                                            },
                                                            this.settings.buttons.sequence,
                                                            (e) => {
                                                                this.settings.buttons.sequence = e.value;
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.resetAnimations()
                                                            }
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.timing, trn.stng.timing_note_buttons,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.buttons.timing,
                                                                            max: 0.35,
                                                                            step: 0.01,
                                                                            type: 'string',
                                                                            onchange: (e, v) => {
                                                                                this.settings.buttons.timing = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'svg',
                                                                            id: 'help-timing-buttons',
                                                                            width: '25px',
                                                                            height: '50px',
                                                                            ...SvgTemps.Other.help
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.buttons.timing;
                                                                                this.settings.buttons.timing = this.defaultSettings.buttons.timing;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.delay, trn.stng.delay_note_buttons,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.buttons.delay,
                                                                            max: 0.5,
                                                                            step: 0.01,
                                                                            type: 'number',
                                                                            onchange: (e, v) => {
                                                                                this.settings.buttons.delay = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.buttons.delay;
                                                                                this.settings.buttons.delay = this.defaultSettings.buttons.delay;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        ).render
                                                    ).render,

                                                    Field(trn.stng.duration, trn.stng.duration_note_buttons,
                                                        ElementsPanel(
                                                            [
                                                                {
                                                                    elements: [
                                                                        {
                                                                            component: 'input',
                                                                            value: this.settings.buttons.duration,
                                                                            max: 3,
                                                                            step: 0.1,
                                                                            type: 'number',
                                                                            onchange: (e, v) => {
                                                                                this.settings.buttons.duration = v;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        },
                                                                        {
                                                                            component: 'button',
                                                                            padding: '6px',
                                                                            svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                            onclick: (e) => {
                                                                                var button = e.currentTarget;
                                                                                var input = button.closest('.elementsContainer').querySelector('input');

                                                                                input.value = this.defaultSettings.buttons.duration;
                                                                                this.settings.buttons.duration = this.defaultSettings.buttons.duration;
                                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                this.resetAnimations()
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        ).render
                                                    ).render,
                                                ]
                                            },
                                            {
                                                name: trn.view.messages,
                                                content: [
                                                    ElementsPanel(
                                                        [
                                                            {
                                                                elements: [
                                                                    {
                                                                        component: 'button',
                                                                        svgs: [this.settings.messages.enabled ? SvgTemps.checked : SvgTemps.unchecked],
                                                                        color: this.settings.messages.enabled ? 'green' : 'red',
                                                                        label: trn.view.messages,
                                                                        id: 'messages-switch-button',
                                                                        onclick: async (e) => {

                                                                            let button = e.currentTarget

                                                                            button.getElementsByTagName('span')[0].innerText = '...'

                                                                            this.settings.messages.enabled = !this.settings.messages.enabled;
                                                                            if (!this.settings.messages.enabled) {
                                                                                button.classList.remove('green')
                                                                                button.classList.add('red')
                                                                                button.querySelector('path').setAttribute('d', SvgTemps.unchecked.paths)
                                                                            } else {
                                                                                button.classList.remove('red')
                                                                                button.classList.add('green')
                                                                                button.querySelector('path').setAttribute('d', SvgTemps.checked.paths)
                                                                            }
                                                                            await this.resetAnimations();
                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                            button.getElementsByTagName('span')[0].innerText = trn.view.messages;
                                                                        }
                                                                    },
                                                                    {
                                                                        component: 'button',
                                                                        color: 'blurple',
                                                                        label: trn.view.reset_messages,
                                                                        id: 'animations-reset-messages',
                                                                        svgs: [SvgTemps.Other.circleArrow],
                                                                        onclick: async (e) => {

                                                                            let button = e.currentTarget;
                                                                            button.getElementsByTagName('span')[0].innerText = trn.view.resetting;
                                                                            await this.wait(500);

                                                                            this.settings.messages = this.defaultSettings.messages
                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                            this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                            this.resetAnimations();
                                                                            this.closeSettings();
                                                                        },
                                                                    }
                                                                ],
                                                                options: {
                                                                    widthAll: '100%',
                                                                    align: 'space-between'
                                                                }
                                                            }
                                                        ]
                                                    ).render,
                                                    TabsPanel([
                                                        {
                                                            name: trn.view.messages_received,
                                                            content: [

                                                                Field(trn.stng.name, trn.stng.name_note_messages,
                                                                    PreviewsPanel(
                                                                        [
                                                                            { label: trn.name.in, value: 'in' },
                                                                            { label: trn.name.out, value: 'out' },
                                                                            { label: trn.name.circle, value: 'circle' },
                                                                            { label: trn.name.polygon, value: 'polygon' },
                                                                            { label: trn.name.opacity, value: 'opacity' },
                                                                            { label: trn.name.slime, value: 'slime' },
                                                                            { label: trn.name.brick_right, value: 'brick-right' },
                                                                            { label: trn.name.brick_left, value: 'brick-left' },
                                                                            { label: trn.name.brick_up, value: 'brick-up' },
                                                                            { label: trn.name.brick_down, value: 'brick-down' },
                                                                            { label: trn.name.slide_right, value: 'slide-right' },
                                                                            { label: trn.name.slide_left, value: 'slide-left' },
                                                                            { label: trn.name.slide_up, value: 'slide-up' },
                                                                            { label: trn.name.slide_down, value: 'slide-down' },
                                                                            { label: trn.name.slide_up_right, value: 'slide-up-right' },
                                                                            { label: trn.name.slide_up_left, value: 'slide-up-left' },
                                                                            { label: trn.name.slide_down_right, value: 'slide-down-right' },
                                                                            { label: trn.name.slide_down_left, value: 'slide-down-left' },
                                                                            { label: trn.name.skew_right, value: 'skew-right' },
                                                                            { label: trn.name.skew_left, value: 'skew-left' },
                                                                            { label: trn.name.wide_skew_right, value: 'wide-skew-right' },
                                                                            { label: trn.name.wide_skew_left, value: 'wide-skew-left' },
                                                                        ],
                                                                        {
                                                                            type: 'messages-name',
                                                                            class: 'messages',
                                                                            custom: {
                                                                                data: this.settings.messages.custom,
                                                                            }
                                                                        },
                                                                        this.settings.messages.name,
                                                                        (e) => {
                                                                            this.settings.messages.name = e.value;
                                                                            this.settings.messages.page = e.page;
                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                            this.resetAnimations()
                                                                        }
                                                                    ).render
                                                                ).render,

                                                                Field(trn.stng.timing, trn.stng.timing_note_messages,
                                                                    ElementsPanel(
                                                                        [
                                                                            {
                                                                                elements: [
                                                                                    {
                                                                                        component: 'input',
                                                                                        value: this.settings.messages.timing,
                                                                                        max: 0.35,
                                                                                        step: 0.01,
                                                                                        type: 'string',
                                                                                        onchange: (e, v) => {
                                                                                            this.settings.messages.timing = v;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        component: 'svg',
                                                                                        id: 'help-timing-messages',
                                                                                        width: '25px',
                                                                                        height: '50px',
                                                                                        ...SvgTemps.Other.help
                                                                                    },
                                                                                    {
                                                                                        component: 'button',
                                                                                        padding: '6px',
                                                                                        svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                                        onclick: (e) => {
                                                                                            var button = e.currentTarget;
                                                                                            var input = button.closest('.elementsContainer').querySelector('input');

                                                                                            input.value = this.defaultSettings.messages.timing;
                                                                                            this.settings.messages.timing = this.defaultSettings.messages.timing;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            },
                                                                        ]
                                                                    ).render
                                                                ).render,

                                                                Field(trn.stng.delay, trn.stng.delay_note_messages,
                                                                    ElementsPanel(
                                                                        [
                                                                            {
                                                                                elements: [
                                                                                    {
                                                                                        component: 'input',
                                                                                        value: this.settings.messages.delay,
                                                                                        max: 0.5,
                                                                                        step: 0.01,
                                                                                        type: 'number',
                                                                                        onchange: (e, v) => {
                                                                                            this.settings.messages.delay = v;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        component: 'button',
                                                                                        padding: '6px',
                                                                                        svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                                        onclick: (e) => {
                                                                                            var button = e.currentTarget;
                                                                                            var input = button.closest('.elementsContainer').querySelector('input');

                                                                                            input.value = this.defaultSettings.messages.delay;
                                                                                            this.settings.messages.delay = this.defaultSettings.messages.delay;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    ).render
                                                                ).render,

                                                                Field(trn.stng.limit, trn.stng.limit_note_messages,
                                                                    ElementsPanel(
                                                                        [
                                                                            {
                                                                                elements: [
                                                                                    {
                                                                                        component: 'input',
                                                                                        value: this.settings.messages.limit,
                                                                                        max: 100,
                                                                                        step: 1,
                                                                                        type: 'integer',
                                                                                        onchange: (e, v) => {
                                                                                            this.settings.messages.limit = v;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        component: 'button',
                                                                                        padding: '6px',
                                                                                        svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                                        onclick: (e) => {
                                                                                            var button = e.currentTarget;
                                                                                            var input = button.closest('.elementsContainer').querySelector('input');

                                                                                            input.value = this.defaultSettings.messages.limit;
                                                                                            this.settings.messages.limit = this.defaultSettings.messages.limit;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    ).render
                                                                ).render,

                                                                Field(trn.stng.duration, trn.stng.duration_note_messages,
                                                                    ElementsPanel(
                                                                        [
                                                                            {
                                                                                elements: [
                                                                                    {
                                                                                        component: 'input',
                                                                                        value: this.settings.messages.duration,
                                                                                        max: 3,
                                                                                        step: 0.01,
                                                                                        type: 'number',
                                                                                        onchange: (e, v) => {
                                                                                            this.settings.messages.duration = v;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        component: 'button',
                                                                                        padding: '6px',
                                                                                        svgs: [{ ...SvgTemps.Other.circleArrow, width: '22px', height: '22px' }],
                                                                                        onclick: (e) => {
                                                                                            var button = e.currentTarget;
                                                                                            var input = button.closest('.elementsContainer').querySelector('input');

                                                                                            input.value = this.defaultSettings.messages.duration;
                                                                                            this.settings.messages.duration = this.defaultSettings.messages.duration;
                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                            this.resetAnimations()
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    ).render
                                                                ).render,
                                                            ]
                                                        },
                                                        {
                                                            name: trn.view.messages_sending,
                                                            content: [
                                                                Field(trn.stng.behavior, trn.stng.behavior_note_messages_sending,
                                                                    ElementsPanel(
                                                                        [
                                                                            {
                                                                                elements: [
                                                                                    {
                                                                                        component: 'button',
                                                                                        label: this.settings.messages.sending.enabled == 'disabled' ? trn.view.behavior_do_not_animate : trn.view.behaivor_animate_on_sent,
                                                                                        color: this.settings.messages.sending.enabled == 'disabled' ? 'red' : 'green',
                                                                                        onclick: (e, c) => {
                                                                                            if (this.settings.messages.sending.enabled == 'disabled') {
                                                                                                this.settings.messages.sending.enabled = 'onsent'
                                                                                            }
                                                                                            else {
                                                                                                this.settings.messages.sending.enabled = 'disabled'
                                                                                            }

                                                                                            c.setState({
                                                                                                color: this.settings.messages.sending.enabled == 'disabled' ? 'red' : 'green',
                                                                                                label: this.settings.messages.sending.enabled == 'disabled' ? trn.view.behavior_do_not_animate : trn.view.behaivor_animate_on_sent
                                                                                            })

                                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                        }
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    ).render
                                                                ).render,

                                                                Field(trn.stng.name, trn.stng.name_note_messages_sending,
                                                                    PreviewsPanel(
                                                                        [
                                                                            { label: trn.name.in, value: 'in' },
                                                                            { label: trn.name.out, value: 'out' },
                                                                            { label: trn.name.circle, value: 'circle' },
                                                                            { label: trn.name.polygon, value: 'polygon' },
                                                                            { label: trn.name.opacity, value: 'opacity' },
                                                                            { label: trn.name.slime, value: 'slime' },
                                                                            { label: trn.name.brick_right, value: 'brick-right' },
                                                                            { label: trn.name.brick_left, value: 'brick-left' },
                                                                            { label: trn.name.brick_up, value: 'brick-up' },
                                                                            { label: trn.name.brick_down, value: 'brick-down' },
                                                                            { label: trn.name.slide_right, value: 'slide-right' },
                                                                            { label: trn.name.slide_left, value: 'slide-left' },
                                                                            { label: trn.name.slide_up, value: 'slide-up' },
                                                                            { label: trn.name.slide_down, value: 'slide-down' },
                                                                            { label: trn.name.slide_up_right, value: 'slide-up-right' },
                                                                            { label: trn.name.slide_up_left, value: 'slide-up-left' },
                                                                            { label: trn.name.slide_down_right, value: 'slide-down-right' },
                                                                            { label: trn.name.slide_down_left, value: 'slide-down-left' },
                                                                            { label: trn.name.skew_right, value: 'skew-right' },
                                                                            { label: trn.name.skew_left, value: 'skew-left' },
                                                                            { label: trn.name.wide_skew_right, value: 'wide-skew-right' },
                                                                            { label: trn.name.wide_skew_left, value: 'wide-skew-left' },
                                                                        ],
                                                                        {
                                                                            type: 'messages-name',
                                                                            class: 'messages',
                                                                            custom: {
                                                                                data: this.settings.messages.sending.custom,
                                                                            }
                                                                        },
                                                                        this.settings.messages.name,
                                                                        (e) => {
                                                                            this.settings.messages.sending.name = e.value;
                                                                            this.settings.messages.sending.page = e.page;
                                                                            PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                            this.resetAnimations()
                                                                        }
                                                                    ).render
                                                                ).render
                                                            ]
                                                        }
                                                    ]).render
                                                ]
                                            },
                                            { component: 'divider' },
                                            {
                                                name: trn.view.advanced,
                                                content: [
                                                    Field(trn.view.selectors_lists, trn.view.selectors_note_all,
                                                        TextareasPanel(
                                                            {
                                                                elementsPanel: {
                                                                    containersTemp: [
                                                                        {
                                                                            elements: [
                                                                                {
                                                                                    component: 'button',
                                                                                    label: trn.edit.default,
                                                                                    id: 'lists-selectors-default',
                                                                                    svgs: [SvgTemps.Other.circleArrow],
                                                                                    onclick: (e) => {
                                                                                        var textarea = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea')
                                                                                        textarea.value = AnimationsPlugin.selectorsLists.join(',\n\n')
                                                                                        textarea.style.color = '';

                                                                                        this.settings.lists.selectors = '';
                                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                        this.resetAnimations()
                                                                                    }
                                                                                },
                                                                                {
                                                                                    component: 'button',
                                                                                    label: trn.edit.clear,
                                                                                    id: 'lists-selectors-clear',
                                                                                    onclick: (e) => {
                                                                                        var textarea = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea')
                                                                                        textarea.value = '';
                                                                                        textarea.focus();
                                                                                    }
                                                                                },
                                                                            ]
                                                                        }
                                                                    ],
                                                                    options: {
                                                                        widthAll: '100%'
                                                                    }
                                                                },
                                                                textareas: [
                                                                    {
                                                                        value: this.settings.lists.selectors ? this.settings.lists.selectors : AnimationsPlugin.selectorsLists.join(',\n\n')
                                                                    }
                                                                ],
                                                                onchange: (e) => {
                                                                    var textarea = e.currentTarget;
                                                                    var value = textarea.value;

                                                                    if (value == '' || this.isValidSelector(value)) {
                                                                        this.settings.lists.selectors = (value == AnimationsPlugin.selectorsLists ? '' : value)
                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                        this.resetAnimations()
                                                                        textarea.style.color = ''
                                                                    } else {
                                                                        textarea.style.color = Textcolors.red
                                                                    }
                                                                }
                                                            },
                                                        ).render
                                                    ).render,

                                                    Field(trn.view.selectors_buttons, trn.view.selectors_note_all,
                                                        TextareasPanel(
                                                            {
                                                                elementsPanel: {
                                                                    containersTemp: [
                                                                        {
                                                                            elements: [
                                                                                {
                                                                                    component: 'button',
                                                                                    label: trn.edit.default,
                                                                                    id: 'buttons-selectors-default',
                                                                                    svgs: [SvgTemps.Other.circleArrow],
                                                                                    onclick: (e) => {
                                                                                        var textarea = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea')
                                                                                        textarea.value = AnimationsPlugin.selectorsButtons.join(',\n\n')
                                                                                        textarea.style.color = '';

                                                                                        this.settings.buttons.selectors = '';
                                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                                        this.resetAnimations()
                                                                                    }
                                                                                },
                                                                                {
                                                                                    component: 'button',
                                                                                    label: trn.edit.clear,
                                                                                    id: 'buttons-selectors-clear',
                                                                                    onclick: (e) => {
                                                                                        var textarea = e.currentTarget.closest('.animTextareasPanel').querySelector('.animTextarea')
                                                                                        textarea.value = '';
                                                                                        textarea.focus();
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ],
                                                                    options: {
                                                                        widthAll: '100%'
                                                                    }
                                                                },
                                                                textareas: [
                                                                    {
                                                                        value: this.settings.buttons.selectors ? this.settings.buttons.selectors : AnimationsPlugin.selectorsButtons.join(',\n\n')
                                                                    }
                                                                ],
                                                                onchange: (e) => {
                                                                    var textarea = e.currentTarget;
                                                                    var value = textarea.value;

                                                                    if (value == '' || this.isValidSelector(value)) {
                                                                        this.settings.buttons.selectors = (value == AnimationsPlugin.selectorsButtons ? '' : value)
                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                        this.resetAnimations()
                                                                        textarea.style.color = ''
                                                                    } else {
                                                                        textarea.style.color = Textcolors.red
                                                                    }
                                                                }
                                                            },
                                                        ).render
                                                    ).render,
                                                ]
                                            },
                                        ]
                                    ).class
                                ),
                            )

                        return settings_panel
                    }

                    patchAll() {

                        let style_main = document.head.querySelector('#' + this.getName() + '-main')

                        Patcher.after(
                            this.getName(),
                            FindedModules.MessageDefault.default,
                            "type",
                            (obj, [props], ret) => {
                                let li = Utilities.findInTree(ret, node => node?.type == "li")
                                let div = li.props.children

                                let info = div.props.childrenAccessories.props.message
                                let state = info.state
                                let id = info.id
                                /**@type {sendingPerformance}*/
                                const perf = this.settings.messages.sending.enabled

                                if (this.settings.messages.enabled)
                                    if (perf == 'onsent') {
                                        if (state != "SENDING") {
                                            let tstamp = info.timestamp._d
                                            if (Date.now() - tstamp < 1000) {
                                                div.props.style = {
                                                    "animation-name": this.settings.messages.sending.custom.enabled &&
                                                        (this.settings.messages.sending.custom.page >= 0 ?
                                                            this.settings.messages.sending.custom.frames[this.settings.messages.sending.custom.page].anim.trim() != '' &&
                                                            this.isValidKeyframe(this.settings.messages.sending.custom.frames[this.settings.messages.sending.custom.page].anim)
                                                            : 0)
                                                        ? 'custom-messages-sending' : this.settings.messages.sending.name,
                                                }

                                                if(!this.patchedMessagesIds.includes(id))
                                                    setTimeout(
                                                        () => {
                                                            style_main.innerText +=
                                                            /*css*/`
                                                            li#chat-messages-${id} > div {
                                                                animation-name: ${this.settings.messages.name};
                                                                transform: scale(1);
                                                                opacity: 1;
                                                            }`
                                                        }, this.settings.messages.duration
                                                    )
                                            }
                                        }
                                        else
                                            div.props.style = {
                                                "animation": 'none',
                                                "transform": "scale(1)",
                                                opacity: 1
                                            }
                                    }
                                    else {
                                        div.props.style = {
                                            "animation": 'none',
                                            "transform": "scale(1)",
                                            opacity: 1
                                        }
                                    };
                                    
                                if (!this.patchedMessagesIds.includes(id)) this.patchedMessagesIds.push(id)
                            }
                        )
                    }

                    unpatchAll() {

                        Patcher.unpatchAll(this.getName())

                        this.patchedMessagesIds.forEach(
                            id => {
                                let patchedElem = document.getElementById(`chat-messages-${id}`)?.firstChild
                                if (!patchedElem) return;
                                patchedElem.style = {}
                            }
                        )

                    }

                    start() {

                        this.patchAll()

                        let Textcolors = {
                            red: '#ed4245',
                            green: '#3ba55d',
                            yellow: '#faa81a',
                            gray: '#36393f'
                        }

                        let componentsStyles = `/*components*/

                    .animField {
                        padding: 5px;
                    }

                    .animFieldDivider {
                        width: 100%;
                    }

                    .animFieldDivider:not(.animField:first-child > *) {
                        width: 100%;
                        height: 1px;
                        border-top: thin solid var(--background-modifier-accent);
                        margin: 20px 0;
                    }

                    .animFieldTitle {
                        color: var(--header-secondary);
                        margin-bottom: 8px;
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }

                    .animFieldNote {
                        color: var(--header-secondary);
                        margin-bottom: 8px;
                        font-size: 14px;
                        line-height: 20px;
                        font-weight: 400;
                    }

                    .animContent {
                        height: 0;
                        width: 100%;
                        overflow: hidden;
                        opacity: 0;
                        transition: 0.5s opacity;
                    }

                    .animContent.show {
                        display: block;
                        height: fit-content;
                        margin-top: 20px;
                        opacity: 1;
                    }

                    .animTab {
                        display: inline-block;
                        box-sizing: border-box;
                        border-radius: 3px;
                        padding: 10px 10px;
                        margin: 6px 6px;
                        width: 100%;
                        color: var(--header-primary);
                        transition: 0.2s;
                        text-align: center;
                        font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
                        font-size: 14px;
                    }

                    .animTab + .animTab {
                        margin-left: 0;
                    }

                    .animTab:hover:not(.selected):not(.disabled) {
                        box-shadow: inset 0 0 0 1px var(--brand-experiment);
                    }
                    .animTab.selected {
                        color: white;
                        background-color: var(--brand-experiment);
                    }

                    .animTabDivider {
                        width: 0;
                        height: 25px;
                        margin: auto 0;
                        border-right: thin solid var(--background-accent);
                    }

                    .animTabsContainer {
                        border-radius: 3px;
                        background-color: var(--background-secondary-alt);
                        justify-content: space-between;
                        display: flex;
                        position: sticky;
                        z-index: 1;
                        top: 0;
                    }

                    .animContentsContainer .animTabsContainer {z-index: 0;}

                    .animPreviewsPanel {
                        overflow: hidden;
                    }

                    .animPreviewsContainer, .animPreviewsPanel .animTextareasPanel {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-evenly; 
                        align-content: space-evenly;
                        height: 0;
                        margin: 0;
                        padding: 0;
                        opacity: 0;
                        box-sizing: border-box;
                        border-radius: 3px;
                        overflow: hidden;
                        transition: 0.5s opacity;
                    }

                    .animPreviewsPanel .animTextareasPanel {
                        padding: 0 18px;
                    }

                    .animTextarea {
                        display: block;
                        font-size: 0.875rem;
                        line-height: 1.125rem;
                        text-indent: 0;
                        white-space: pre-wrap;
                        font-family: Consolas, monospace;
                    }

                    .animTextarea.invalid {
                        color: ${Textcolors.red};
                    }

                    .animTextarea::placeholder {
                        font-family: Consolas, monopoly;
                    }

                    .animPreviewsContainer.show, .animPreviewsPanel .animTextareasPanel.show {
                        opacity: 1;
                        border: 1px solid var(--background-tertiary);
                        height: 420px;
                    }

                    .animPreviewsContainer.compact {
                        height: fit-content;
                        padding: 10px 0;
                    }

                    .animPreviewsActions {
                        width: fit-content;
                        margin: 0 auto;
                    }

                    .animPreviewActionButton {
                        display: inline-block;
                        min-width: 10px;
                        width: fit-content;
                        margin: 5px auto 5px auto;
                        padding: 0;
                        color: var(--interactive-normal);
                        text-align: center;
                        text-transform: capitalize;
                        font-size: 18px;
                        border-radius: 3px;
                        transition: 0.2s;
                        overflow: hidden;
                    }

                    .animPreviewActionButton:hover {
                        border-color: var(--deprecated-text-input-border-hover);
                    }

                    .switchActionButton {
                        display: inline-flex;
                        justify-content: space-between;
                        line-height: 125%;
                        width: 180px;
                        padding: 3px 8px;
                        transition: 0.2s background;
                        background-size: cover;
                        background: linear-gradient(90deg, transparent 0%, var(--brand-experiment) 0%, var(--brand-experiment) 100%, transparent 100%) no-repeat;
                    }

                    .switchActionButton > svg {
                        fill: var(--interactive-normal);
                    }

                    .selecting .switchActionButton:nth-child(1), .editing .switchActionButton:nth-child(2) {
                        color: white;
                        background-position-x: 0;
                    }

                    .selecting .switchActionButton:nth-child(1) > svg, .editing .switchActionButton:nth-child(2) > svg {
                        fill: white;
                    }

                    .editing .switchActionButton:nth-child(1) {
                        background-position-x: 200px;
                    }

                    .selecting .switchActionButton:nth-child(2) {
                        background-position-x: -200px;
                    }

                    .animPreviewActionButton .switchActionButton:nth-child(n+2) {
                        border-left: 1px solid var(--background-tertiary);
                    }

                    .animPreviewActionButton:hover .switchActionButton:nth-child(n+2) {
                        border-left: 1px solid var(--deprecated-text-input-border-hover);
                    }

                    .switchActionButtonLabel {
                        display: inline-block;
                        overflow: hidden;
                        width: 100%;
                        text-overflow: ellipsis;
                    }

                    .animPageButtons {
                        margin: 0 auto;
                        width: fit-content;
                        display: none;
                    }

                    .animPageButtons.show {
                        display: block;
                    }

                    .animPageCircleButton {
                        display: inline-block;
                        text-align: center;
                    }

                    .animPageCircleButton:first-child {
                        margin: 5px 5px 5px auto;
                    }

                    .animPageCircleButton:last-child {
                        margin: 5px auto 5px 5px;
                    }

                    .animPageCircleButton.enabled {
                        color: white;
                        background-color: var(--brand-experiment);
                    }

                    .animPreview {
                        margin: 0;
                        border: 1px solid;
                        border-radius: 3px;
                        overflow: hidden;
                    }

                    .vertical .animPreview {
                        display: inline-flex;
                        box-sizing: border-box;
                        width: 120px;
                        height: 185px;
                        padding: 5px;
                        transition: 0.2s;
                        flex-direction: column;
                        justify-content: space-evenly;
                    }

                    .horizontal .animPreview {
                        display: inline-flex;
                        box-sizing: border-box;
                        width: calc(100% - 26px);
                        height: 45px;
                        padding: 5px;
                        transition: 0.2s;
                        flex-direction: row;
                        justify-content: space-evenly;
                        align-items: center;
                    }

                    .horizontal .compact .animPreview {
                        margin: 5px 0;
                    }

                    .animPreview:hover {
                        border-color: var(--deprecated-text-input-border-hover);
                    }

                    .animPreview.enabled {
                        background-color: var(--brand-experiment);
                    }

                    .vertical .animPreviewTempsContainer {
                        display: flex;
                        width: 100%;
                        height: 100%;
                        flex-direction: column;
                        flex-wrap: nowrap;
                        justify-content: space-evenly;
                    }

                    .horizontal .animPreviewTempsContainer {
                        display: flex;
                        width: 100%;
                        height: 26px;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                    }
                    
                    .vertical .animPreview .animTempBlock {
                        border-radius: 3pt;
                        background-color: var(--interactive-normal)
                    }

                    .horizontal .animPreview .animTempBlock {
                        border-radius: 3pt;
                        background-color: var(--interactive-normal);
                        display: inline-block;
                    }

                    .vertical .animPreview.enabled .animTempBlock {
                        background-color: #fff;
                    }

                    .animPreview.enabled .animTempBlock {
                        background-color: #fff;
                    }

                    .animPreview .animPreviewLabel {
                        word-break: break-word;
                        box-sizing: border-box;
                        overflow: hidden;
                        color: var(--interactive-normal);
                        font-size: 10pt;
                        margin: 4px;
                        padding: 0 4px;
                    }
                    
                    .vertical .animPreview .animPreviewLabel {
                        height: 58px;
                        width: auto;
                        bottom: 6pt;
                        line-height: 100%;
                        text-align: center;
                    }

                    .horizontal .animPreview .animPreviewLabel {
                        height: 26px;
                        width: 50%;
                        display: inline-block;
                        float: right;
                        line-height: 200%;
                        text-align: right;
                    }

                    .animPreview.enabled .animPreviewLabel {
                        color: #fff;
                        border-color: #fff;
                    }


                    .elementsContainer.nosidemargin > :first-child {
                        margin-left: 0 !important;
                    }
                    .elementsContainer.nosidemargin > :last-child {
                        margin-right: 0 !important;
                    }
                    
                    .animButton.blurple.filled {
                        color: white;
                        background-color: var(--brand-experiment);
                    }
                    .animButton.blurple.filled:hover:not(.disabled) {
                        background-color: var(--brand-experiment-560);
                    }
                    .animButton.blurple.inverted {
                        color: var(--brand-experiment);
                        border: 1px solid var(--brand-experiment);
                    }
                    .animButton.blurple.inverted:hover:not(.disabled) {
                        color: var(--brand-experiment-560);
                        border: 1px solid var(--brand-experiment-560);
                    }
                    
                    .animButton.white.filled {
                        color: var(--brand-experiment);
                        background-color: #fff;
                    }
                    .animButton.white.filled:hover:not(.disabled) {
                        background-color: var(--brand-experiment-100);
                    }
                    .animButton.white.inverted {
                        color: #fff;
                        border: 1px solid #fff;
                    }
                    .animButton.white.inverted:hover:not(.disabled) {
                        color: var(--brand-experiment-100);
                        border: 1px solid var(--brand-experiment-100);
                    }

                    .animButton.grey.filled {
                        color: white;
                        background-color: #4f545c;
                    }
                    .animButton.grey.filled:hover:not(.disabled) {
                        background-color: #5d6269;
                    }
                    .animButton.grey.inverted {
                        color: #4f545c;
                        border: 1px solid #4f545c;
                    }
                    .animButton.grey.inverted:hover:not(.disabled) {
                        color: #5d6269;
                        border: 1px solid #5d6269;
                    }

                    .animButton.red.filled {
                        color: white;
                        background-color: hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                    }
                    .animButton.red.filled:hover:not(.disabled) {
                        background-color: hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                    }
                    .animButton.red.inverted {
                        color: hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                        border: 1px solid hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                    }
                    .animButton.red.inverted:hover:not(.disabled) {
                        color: hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                        border: 1px solid hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                    }

                    .animButton.green.filled {
                        color: white;
                        background-color: hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                    }
                    .animButton.green.filled:hover:not(.disabled) {
                        background-color: hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                    }
                    .animButton.green.inverted {
                        color: hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                        border: 1px solid hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                    }
                    .animButton.green.inverted:hover:not(.disabled) {
                        color: hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                        border: 1px solid hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                    }

                    .animButton.underline {
                        font-weight: bold;
                        background: transparent;
                        color: white;
                    }
                    .animButton.underline:hover:not(.disabled) {
                        text-decoration: underline;
                    }

                    [class*=anim].disabled {
                        opacity: 66.66%;
                        cursor: not-allowed;
                    }
                    `

                        PluginUtilities.removeStyle(`${this.getName()}-comp`);
                        setTimeout(() => {
                            PluginUtilities.addStyle(`${this.getName()}-comp`, componentsStyles)
                            this.resetAnimations()
                        }, 100);

                        //this.animateServers()

                        // on themes switch
                        this.observer = new MutationObserver(
                            (event) => {
                                const { removedNodes, addedNodes } = event[0];
                                const compabilityThemes = ['Horizontal-Server-List'];

                                ; ([removedNodes, addedNodes]).forEach(
                                    (changes, typeIndex) => changes.forEach(
                                        (node) => {
                                            if (compabilityThemes.includes(node.id)) this.resetAnimations();
                                        }
                                    )
                                )
                            }
                        )

                        var element_with_themes_switches = document.getElementsByTagName("bd-themes")[0]
                        this.observer.observe(element_with_themes_switches, { "childList": true })

                    }

                    stop() {

                        this.unpatchAll()

                        clearInterval(this.animateInterval)

                        PluginUtilities.removeStyle(`${this.getName()}-main`);
                        PluginUtilities.removeStyle(`${this.getName()}-comp`);

                        this.observer.disconnect()
                        this.closeSettings()
                    }

                    onSwitch() {
                        this.animateChannels()
                        this.animateMembers()
                    }
                }

                return new AnimationsPlugin
            };
            return plugin(Plugin, Api);
        }
    )(global.ZeresPluginLibrary.buildPlugin(config));
}
