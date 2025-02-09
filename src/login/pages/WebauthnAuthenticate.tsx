import { useEffect, Fragment } from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";

export default function WebauthnAuthenticate(props: PageProps<Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const {
        url,
        isUserIdentified,
        challenge,
        userVerification,
        rpId,
        createTimeout,
        messagesPerField,
        realm,
        registrationDisabled,
        authenticators,
        shouldDisplayAuthenticators
    } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "WebauthnAuthenticate",
        scriptTags: [
            {
                type: "text/javascript",
                src: `${url.resourcesCommonPath}/node_modules/jquery/dist/jquery.min.js`
            },
            {
                type: "text/javascript",
                src: `${url.resourcesPath}/js/base64url.js`
            },
            {
                type: "text/javascript",
                textContent: `

                    function webAuthnAuthenticate() {
                        let isUserIdentified = ${isUserIdentified};
                        if (!isUserIdentified) {
                            doAuthenticate([]);
                            return;
                        }
                        checkAllowCredentials();
                    }

                    function checkAllowCredentials() {
                        let allowCredentials = [];
                        let authn_use = document.forms['authn_select'].authn_use_chk;
                    
                        if (authn_use !== undefined) {
                            if (authn_use.length === undefined) {
                                allowCredentials.push({
                                    id: base64url.decode(authn_use.value, {loose: true}),
                                    type: 'public-key',
                                });
                            } else {
                                for (let i = 0; i < authn_use.length; i++) {
                                    allowCredentials.push({
                                        id: base64url.decode(authn_use[i].value, {loose: true}),
                                        type: 'public-key',
                                    });
                                }
                            }
                        }
                        doAuthenticate(allowCredentials);
                    }


                    function doAuthenticate(allowCredentials) {
                    
                        // Check if WebAuthn is supported by this browser
                        if (!window.PublicKeyCredential) {
                            $("#error").val("${msgStr("webauthn-unsupported-browser-text")}");
                            $("#webauth").submit();
                            return;
                        }
                    
                        let challenge = "${challenge}";
                        let userVerification = "${userVerification}";
                        let rpId = "${rpId}";
                        let publicKey = {
                            rpId : rpId,
                            challenge: base64url.decode(challenge, { loose: true })
                        };
                    
                        let createTimeout = ${createTimeout};
                        if (createTimeout !== 0) publicKey.timeout = createTimeout * 1000;
                    
                        if (allowCredentials.length) {
                            publicKey.allowCredentials = allowCredentials;
                        }
                    
                        if (userVerification !== 'not specified') publicKey.userVerification = userVerification;
                    
                        navigator.credentials.get({publicKey})
                            .then((result) => {
                                window.result = result;
                            
                                let clientDataJSON = result.response.clientDataJSON;
                                let authenticatorData = result.response.authenticatorData;
                                let signature = result.response.signature;
                            
                                $("#clientDataJSON").val(base64url.encode(new Uint8Array(clientDataJSON), { pad: false }));
                                $("#authenticatorData").val(base64url.encode(new Uint8Array(authenticatorData), { pad: false }));
                                $("#signature").val(base64url.encode(new Uint8Array(signature), { pad: false }));
                                $("#credentialId").val(result.id);
                                if(result.response.userHandle) {
                                    $("#userHandle").val(base64url.encode(new Uint8Array(result.response.userHandle), { pad: false }));
                                }
                                $("#webauth").submit();
                            })
                            .catch((err) => {
                                $("#error").val(err);
                                $("#webauth").submit();
                            })
                        ;
                    }

                `
            }
        ]
    });

    useEffect(() => {
        insertScriptTags();
    }, []);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration">
                    <span>
                        {msg("noAccount")}{" "}
                        <a tabIndex={6} href={url.registrationUrl} className={cn(buttonVariants({ variant: "link" }), "underline py-0 px-2")}>
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
            headerNode={msg("webauthn-login-title")}
        >
            <div id="kc-form-webauthn" className={kcClsx("kcFormClass")}>
                <form id="webauth" action={url.loginAction} method="post">
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                    <input type="hidden" id="authenticatorData" name="authenticatorData" />
                    <input type="hidden" id="signature" name="signature" />
                    <input type="hidden" id="credentialId" name="credentialId" />
                    <input type="hidden" id="userHandle" name="userHandle" />
                    <input type="hidden" id="error" name="error" />
                </form>
                <div className={clsx(kcClsx("kcFormGroupClass"), "no-bottom-margin")}>
                    {authenticators && (
                        <>
                            <form id="authn_select" className={kcClsx("kcFormClass")}>
                                {authenticators.authenticators.map(authenticator => (
                                    <input type="hidden" name="authn_use_chk" value={authenticator.credentialId} />
                                ))}
                            </form>

                            {shouldDisplayAuthenticators && (
                                <>
                                    {authenticators.authenticators.length > 1 && (
                                        <p className={kcClsx("kcSelectAuthListItemTitle")}>{msg("webauthn-available-authenticators")}</p>
                                    )}
                                    <div className={kcClsx("kcFormOptionsClass")}>
                                        {authenticators.authenticators.map((authenticator, i) => (
                                            <div key={i} id="kc-webauthn-authenticator" className={kcClsx("kcSelectAuthListItemClass")}>
                                                <div className={kcClsx("kcSelectAuthListItemIconClass")}>
                                                    <i
                                                        className={clsx(
                                                            (() => {
                                                                const className = kcClsx(authenticator.transports.iconClass as any);
                                                                if (className === authenticator.transports.iconClass) {
                                                                    return kcClsx("kcWebAuthnDefaultIcon");
                                                                }
                                                                return className;
                                                            })(),
                                                            kcClsx("kcSelectAuthListItemIconPropertyClass")
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <div id="kc-webauthn-authenticator-label" className={kcClsx("kcSelectAuthListItemHeadingClass")}>
                                                        {advancedMsg(authenticator.label)}
                                                    </div>
                                                    {authenticator.transports.displayNameProperties?.length && (
                                                        <div
                                                            id="kc-webauthn-authenticator-transport"
                                                            className={kcClsx("kcSelectAuthListItemDescriptionClass")}
                                                        >
                                                            {authenticator.transports.displayNameProperties
                                                                .map((displayNameProperty, i, arr) => ({
                                                                    displayNameProperty,
                                                                    hasNext: i !== arr.length - 1
                                                                }))
                                                                .map(({ displayNameProperty, hasNext }) => (
                                                                    <Fragment key={displayNameProperty}>
                                                                        {advancedMsg(displayNameProperty)}
                                                                        {hasNext && <span>, </span>}
                                                                    </Fragment>
                                                                ))}
                                                        </div>
                                                    )}
                                                    <div className={kcClsx("kcSelectAuthListItemDescriptionClass")}>
                                                        <span id="kc-webauthn-authenticator-created-label">{msg("webauthn-createdAt-label")}</span>
                                                        <span id="kc-webauthn-authenticator-created">{authenticator.createdAt}</span>
                                                    </div>
                                                    <div className={kcClsx("kcSelectAuthListItemFillClass")} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            id="authenticateWebAuthnButton"
                            type="button"
                            onClick={() => {
                                assert("webAuthnAuthenticate" in window);
                                assert(typeof window.webAuthnAuthenticate === "function");
                                window.webAuthnAuthenticate();
                            }}
                            autoFocus
                            value={msgStr("webauthn-doAuthenticate")}
                            className={cn(buttonVariants({}), "w-full")}
                            // className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                        />
                    </div>
                </div>
            </div>
        </Template>
    );
}
