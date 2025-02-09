import { createUseI18n } from "keycloakify/login/i18n/withJsx/useI18n";


export const { useI18n, ofTypeI18n } = createUseI18n({
    extraLanguageTranslations: {},
    messagesByLanguageTag_themeDefined: {}
});

export type I18n = typeof ofTypeI18n;

