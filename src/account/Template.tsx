import { useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/account/Template.useInitialize";
import type { TemplateProps } from "keycloakify/account/TemplateProps";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, active, classes, children } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

    const { url, features, realm, message, referrer } = kcContext;

    useEffect(() => {
        document.title = msgStr("accountManagementTitle");
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: clsx("admin-console", "user", kcClsx("kcBodyClass"))
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-[#020506] flex flex-col min-h-screen h-full overflow-hidden" >
            <header className="navbar navbar-default   navbar-main header bg-white dark:bg-[#020506] p-4 !mb-0 h-[64px]">
                <nav className="border-b-0 w-full flex justify-between items-center" role="navigation">
                    <div className="navbar-header">
                    <div className="flex items-center space-x-2">
                    <img src="https://pb.telias.tel/api/files/3m5kaydtzs82wuf/p1vr23astlaxw9l/logo_L8i8FBCLRg.svg?thumb=100x100&token=" alt="Satin Core Banking" className="h-[40px] w-[40px]" />
                    <div className="text-[18px] font-bold">
                        Satin Core Banking
                    </div>
                </div>
                    </div>
                    <div className="navbar-collapse navbar-collapse-1">
                        <div className="container  ">
                            <ul className="nav navbar-nav navbar-utility text-black dark:text-white ">
                                {enabledLanguages.length > 1 && (
                                    <li className="text-black dark:text-white">
                                        <div className="kc-dropdown !text-black dark:text-white" id="kc-locale-dropdown">
                                            <a href="#" id="kc-current-locale-link text-black dark:text-white">
                                                {currentLanguage.label}
                                            </a>
                                            <ul>
                                                {enabledLanguages.map(({ languageTag, label, href }) => (
                                                    <li key={languageTag} className="kc-dropdown-item text-black dark:text-white">
                                                        <a href={href}>{label}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                )}
                                {referrer?.url && (
                                    <li>
                                        <a href={referrer.url} id="referrer">
                                            {msg("backTo", referrer.name)}
                                        </a>
                                    </li>
                                )}
                                <li>
                                    <a href={url.getLogoutUrl()}>{msg("doSignOut")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="flex-1 flex items-start">
                <div className="bs-sidebar col-sm-3" style={{ height: "calc(100vh - 64px)" }}>
                    <ul>
                        <li className={clsx(active === "account" && "active")}>
                            <a href={url.accountUrl}>{msg("account")}</a>
                        </li>
                        {features.passwordUpdateSupported && (
                            <li className={clsx(active === "password" && "active")}>
                                <a href={url.passwordUrl}>{msg("password")}</a>
                            </li>
                        )}
                        <li className={clsx(active === "totp" && "active")}>
                            <a href={url.totpUrl}>{msg("authenticator")}</a>
                        </li>
                        {features.identityFederation && (
                            <li className={clsx(active === "social" && "active")}>
                                <a href={url.socialUrl}>{msg("federatedIdentity")}</a>
                            </li>
                        )}
                        <li className={clsx(active === "sessions" && "active")}>
                            <a href={url.sessionsUrl}>{msg("sessions")}</a>
                        </li>
                        <li className={clsx(active === "applications" && "active")}>
                            <a href={url.applicationsUrl}>{msg("applications")}</a>
                        </li>
                        {features.log && (
                            <li className={clsx(active === "log" && "active")}>
                                <a href={url.logUrl}>{msg("log")}</a>
                            </li>
                        )}
                        {realm.userManagedAccessAllowed && features.authorization && (
                            <li className={clsx(active === "authorization" && "active")}>
                                <a href={url.resourceUrl}>{msg("myResources")}</a>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="col-sm-9 content-area" style={{ height: "calc(100vh - 64px)" }}>
                    {message !== undefined && (
                        <div className={clsx("alert", `alert-${message.type}`)}>
                            {message.type === "success" && <span className="pficon pficon-ok"></span>}
                            {message.type === "error" && <span className="pficon pficon-error-circle-o"></span>}
                            <span
                                className="kc-feedback-text"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(message.summary)
                                }}
                            />
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
