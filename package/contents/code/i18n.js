.pragma library

// Traduções do widget / Traducciones del widget. Idioma escolhido pelo idioma do sistema (KDE):
// es* → espanhol; qualquer outro → português.

const STRINGS = {
    pt: {
        session: "Sessão · 5h",
        weekly: "Semanal · 7d",
        used: "usado",
        resetsIn: "zera em",
        today: "hoje",
        updated: "atualizado",
        updating: "atualizando…",
        loading: "carregando…",
        refreshNow: "Atualizar agora",
        title: "Uso do plano",
        tooltipTitle: "Uso do plano",
        tipSession: "Sessão (5h)",
        tipWeekly: "Semanal (7d)",
        weeklyScoped: "semanal",
        err_login: "faça login no Claude Code",
        err_expired: "token expirado",
        err_offline: "sem conexão",
        err_http: "erro",
        err_parse: "erro ao ler dados",
        days: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
        // configurações
        cfgAppearance: "Aparência",
        cfgTextSize: "Tamanho do texto (%):",
        cfgLogoSize: "Tamanho do ícone (%):",
        cfgSpacing: "Espaço entre itens (px):",
        cfgSidePadding: "Margem nas laterais (px):",
        cfgBarWidth: "Largura das barras (px):",
        cfgBarHeight: "Espessura das barras (px):",
        cfgLabels: "Rótulos:",
        cfgShowLabels: "Mostrar \"5h\" e \"7d\"",
        cfgShowUpdated: "Mostrar hora da última atualização"
    },
    es: {
        session: "Sesión · 5h",
        weekly: "Semanal · 7d",
        used: "usado",
        resetsIn: "se reinicia en",
        today: "hoy",
        updated: "actualizado",
        updating: "actualizando…",
        loading: "cargando…",
        refreshNow: "Actualizar ahora",
        title: "Uso del plan",
        tooltipTitle: "Uso del plan",
        tipSession: "Sesión (5h)",
        tipWeekly: "Semanal (7d)",
        weeklyScoped: "semanal",
        err_login: "inicia sesión en Claude Code",
        err_expired: "token expirado",
        err_offline: "sin conexión",
        err_http: "error",
        err_parse: "error al leer datos",
        days: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
        cfgAppearance: "Apariencia",
        cfgTextSize: "Tamaño del texto (%):",
        cfgLogoSize: "Tamaño del icono (%):",
        cfgSpacing: "Espacio entre elementos (px):",
        cfgSidePadding: "Margen lateral (px):",
        cfgBarWidth: "Ancho de las barras (px):",
        cfgBarHeight: "Grosor de las barras (px):",
        cfgLabels: "Etiquetas:",
        cfgShowLabels: "Mostrar \"5h\" y \"7d\"",
        cfgShowUpdated: "Mostrar hora de la última actualización"
    }
};

function langFrom(locale) {
    const langs = (locale.uiLanguages && locale.uiLanguages.length)
        ? locale.uiLanguages : [locale.name];
    for (const l of langs) {
        const code = String(l).toLowerCase().slice(0, 2);
        if (STRINGS[code]) return code;
    }
    return "pt";
}

function tr(lang, key) {
    const table = STRINGS[lang] || STRINGS.pt;
    return table[key] !== undefined ? table[key] : STRINGS.pt[key];
}
