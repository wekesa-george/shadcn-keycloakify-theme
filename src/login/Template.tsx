import { useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { useInsertLinkTags } from "keycloakify/tools/useInsertLinkTags";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { Button } from "../components/ui/button";
import { ModeToggle } from "../components/ui/mode-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import "../styles/global.css";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from "../components/ui/dropdown-menu";

export function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msg, msgStr, currentLanguage } = i18n;

    const { realm, locale, auth, url, message, isAppInitiatedAction, scripts } = kcContext;
    const authenticationSession = (kcContext as any).authenticationSession;

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    useEffect(() => {
        const { currentLanguageTag } = locale ?? {};

        if (currentLanguageTag === undefined) {
            return;
        }

        const html = document.querySelector("html");
        assert(html !== null);
        html.lang = currentLanguageTag;
    }, []);

    const { areAllStyleSheetsLoaded } = useInsertLinkTags({
        componentOrHookName: "Template",
        hrefs: !doUseDefaultCss
            ? []
            : [
                  `${url.resourcesCommonPath}/node_modules/@patternfly/patternfly/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
                  `${url.resourcesCommonPath}/lib/pficon/pficon.css`,
                  `${url.resourcesPath}/css/login.css`
              ]
    });

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "Template",
        scriptTags: [
            {
                type: "module",
                src: `${url.resourcesPath}/js/menu-button-links.js`
            },
            ...(authenticationSession === undefined
                ? []
                : [
                      {
                          type: "module",
                          textContent: [
                              `import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";`,
                              ``,
                              `checkCookiesAndSetTimer(`,
                              `  "${authenticationSession.authSessionId}",`,
                              `  "${authenticationSession.tabId}",`,
                              `  "${url.ssoLoginInOtherTabsUrl}"`,
                              `);`
                          ].join("\n")
                      } as const
                  ]),
            ...(scripts ?? []).map(
                script =>
                    ({
                        type: "text/javascript",
                        src: script
                    }) as const
            )
        ]
    });

    useEffect(() => {
        if (areAllStyleSheetsLoaded) {
            insertScriptTags();
        }
    }, [areAllStyleSheetsLoaded]);

    if (!areAllStyleSheetsLoaded) {
        return null;
    }
    const languageSelector = () => {
        return (
            <div>
                {realm.internationalizationEnabled && (assert(locale !== undefined), locale.supported.length > 1) && (
                    <div className="mt-0.5 -mr-3  justify-end">
                        <div id="kc-locale-wrapper" className="flex  justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        tabIndex={1}
                                        variant="secondary"
                                        size="sm"
                                        aria-label={msgStr("languages")}
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                        aria-controls="language-switch1"
                                        className="px-3 py-0"
                                    >
                                        <div className="flex space-x-2">
                                            <GlobeAltIcon className="h-5 w-5" />
                                            <span>{currentLanguage.label}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent id="language-switch1" role="menu">
                                    {locale.supported.map(({ languageTag }, i) => (
                                        <DropdownMenuItem key={languageTag} role="none">
                                            <a role="menuitem" id={`language-${i + 1}`} >
                                                {languageTag}
                                            </a>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    return (
        <div className="bg-background dark:bg-[url(https://pb.telias.tel/api/files/3m5kaydtzs82wuf/5ll8asokustda0o/bg_dark_3jWut8Icur.svg?token=)] bg-[url(https://pb.telias.tel/api/files/3m5kaydtzs82wuf/g0gq1n990z4kpcj/bglines_DfvIMxgLJm.svg?token=)] bg-[length:100px_100px] bg-[#f8f8f8] dark:bg-[#020506]   min-h-screen   flex flex-col items-center justify-center  prose dark:prose-invert max-w-none relative">
          <div className="flex items-center py-6 px-6 justify-between space-x-4 pt-2 w-full fixed top-0">
          <div>
            &nbsp;
          </div>
            <div className="flex space-x-4">
                <div className="hide">
                {languageSelector()}
                </div>
                        
                        <ModeToggle />
            </div>
                    </div>
            <div id="kc-header-wrapper" className=" text-foreground !text-[18px] ">
                
                <div className="flex items-center space-x-2">
                    <img src="https://pb.telias.tel/api/files/3m5kaydtzs82wuf/p1vr23astlaxw9l/logo_L8i8FBCLRg.svg?thumb=100x100&token=" alt="Satin Core Banking" className="h-[40px] w-[40px]" />
                    <div className="text-[18px] font-bold">
                        Satin Core Banking
                    </div>
                </div>
            </div>
            <Card className="py-0 px-3 p-10    md:-[40rem] bg-[#f8f8f8] dark:bg-[#020506]  shadow-none  rounded-sm w-full min-h-screen  md:w-[30rem] sm:min-h-fit border border-slate-200 dark:border-slate-700">
                <CardContent className="space-y-8 pb-5 border-none ">
                    
                    <header className="text-center  ">
                        {(() => {
                            const node = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                                <h1 id="kc-page-title" className="text-[15px] font-bold">{headerNode}</h1>
                            ) : (
                                <div id="kc-username" className={kcClsx("kcFormGroupClass")}>
                                    <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                                    <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                                        <div className="kc-login-tooltip">
                                            <i className={kcClsx("kcResetFlowIcon")}></i>
                                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            );

                            if (displayRequiredFields) {
                                return (
                                    <div className="text-sm">
                                        <div className={clsx(kcClsx("kcLabelWrapperClass"), "subtitle")}>
                                            <span className="subtitle">
                                                <span className="required">*</span>
                                                {msg("requiredFields")}
                                            </span>
                                        </div>
                                        <div className="col-md-10">{node}</div>
                                    </div>
                                );
                            }

                            return node;
                        })()}
                    </header>
                    <div id="kc-content" className="">
                        <div id="kc-content-wrapper">
                            {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                            {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                                <div
                                    className={clsx(
                                        `alert-${message.type}`,
                                        kcClsx("kcAlertClass"),
                                        `pf-m-${message?.type === "error" ? "danger" : message.type}`
                                    )}
                                >
                                    <div className="pf-c-alert__icon">
                                        {message.type === "success" && <span className={kcClsx("kcFeedbackSuccessIcon")}></span>}
                                        {message.type === "warning" && <span className={kcClsx("kcFeedbackWarningIcon")}></span>}
                                        {message.type === "error" && <span className={kcClsx("kcFeedbackErrorIcon")}></span>}
                                        {message.type === "info" && <span className={kcClsx("kcFeedbackInfoIcon")}></span>}
                                    </div>
                                    <span
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: message.summary
                                        }}
                                    />
                                </div>
                            )}
                            {children}
                            {auth !== undefined && auth.showTryAnotherWayLink && (
                                <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                                    <div className={kcClsx("kcFormGroupClass")}>
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        <a
                                            href="#"
                                            id="try-another-way"
                                            onClick={() => {
                                                document.forms["kc-select-try-another-way-form" as never].submit();
                                                return false;
                                            }}
                                        >
                                            {msg("doTryAnotherWay")}
                                        </a>
                                    </div>
                                </form>
                            )}
                            {socialProvidersNode}
                        </div>
                    </div>
                    {displayInfo && (
                        <div className=" w-full">
                            <div className=" text-foreground">{infoNode}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="text-center text-foreground text-[12px] text-gray-500">
                <p>Copyright © 2025 Satin Core Banking. All rights reserved.</p>
            </div>
        </div>
    );
}
