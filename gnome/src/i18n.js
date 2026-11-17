// Traduções / Traducciones. Idioma escolhido pelo idioma do sistema:
// es* → espanhol; en* → inglês; qualquer outro → português.
//
// Sem imports: o mesmo arquivo serve para o GNOME 45+ (ESM) e 43–44 (o build
// remove os "export").

const STRINGS = {
    pt: {
        title: 'Uso do plano',
        session: 'Sessão · 5h',
        weekly: 'Semanal · 7d',
        used: 'usado',
        resetsIn: 'zera em',
        today: 'hoje',
        updated: 'atualizado',
        updating: 'atualizando…',
        loading: 'carregando…',
        refreshNow: 'Atualizar agora',
        preferences: 'Preferências',
        weeklyScoped: 'semanal',
        err_login: 'faça login no Claude Code',
        err_expired: 'token expirado',
        err_offline: 'sem conexão',
        err_http: 'erro',
        err_parse: 'erro ao ler dados',
        days: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        // preferências
        prefsPage: 'Aparência',
        prefsPanel: 'Na barra',
        prefsData: 'Dados',
        prefsShowIcon: 'Mostrar ícone',
        prefsShowSession: 'Mostrar limite de 5h',
        prefsShowWeekly: 'Mostrar limite semanal (7d)',
        prefsShowLabels: 'Mostrar "5h" e "7d"',
        prefsShowUpdated: 'Mostrar hora da última atualização',
        prefsShowSeconds: 'Mostrar segundos na hora',
        prefsBarWidth: 'Largura das barras (px)',
        prefsBarHeight: 'Espessura das barras (px)',
        prefsSpacing: 'Espaço entre itens (px)',
        prefsPosition: 'Posição na barra',
        prefsLanguage: 'Idioma',
        langAuto: 'Automático (sistema)',
        posLeft: 'Esquerda',
        posCenter: 'Centro',
        posRight: 'Direita',
        prefsInterval: 'Atualizar a cada (segundos)',
    },
    es: {
        title: 'Uso del plan',
        session: 'Sesión · 5h',
        weekly: 'Semanal · 7d',
        used: 'usado',
        resetsIn: 'se reinicia en',
        today: 'hoy',
        updated: 'actualizado',
        updating: 'actualizando…',
        loading: 'cargando…',
        refreshNow: 'Actualizar ahora',
        preferences: 'Preferencias',
        weeklyScoped: 'semanal',
        err_login: 'inicia sesión en Claude Code',
        err_expired: 'token expirado',
        err_offline: 'sin conexión',
        err_http: 'error',
        err_parse: 'error al leer datos',
        days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        prefsPage: 'Apariencia',
        prefsPanel: 'En la barra',
        prefsData: 'Datos',
        prefsShowIcon: 'Mostrar icono',
        prefsShowSession: 'Mostrar límite de 5h',
        prefsShowWeekly: 'Mostrar límite semanal (7d)',
        prefsShowLabels: 'Mostrar "5h" y "7d"',
        prefsShowUpdated: 'Mostrar hora de la última actualización',
        prefsShowSeconds: 'Mostrar segundos en la hora',
        prefsBarWidth: 'Ancho de las barras (px)',
        prefsBarHeight: 'Grosor de las barras (px)',
        prefsSpacing: 'Espacio entre elementos (px)',
        prefsPosition: 'Posición en la barra',
        prefsLanguage: 'Idioma',
        langAuto: 'Automático (sistema)',
        posLeft: 'Izquierda',
        posCenter: 'Centro',
        posRight: 'Derecha',
        prefsInterval: 'Actualizar cada (segundos)',
    },
    en: {
        title: 'Plan usage',
        session: 'Session · 5h',
        weekly: 'Weekly · 7d',
        used: 'used',
        resetsIn: 'resets in',
        today: 'today',
        updated: 'updated',
        updating: 'updating…',
        loading: 'loading…',
        refreshNow: 'Refresh now',
        preferences: 'Preferences',
        weeklyScoped: 'weekly',
        err_login: 'log in to Claude Code',
        err_expired: 'token expired',
        err_offline: 'offline',
        err_http: 'error',
        err_parse: 'could not read data',
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        prefsPage: 'Appearance',
        prefsPanel: 'In the panel',
        prefsData: 'Data',
        prefsShowIcon: 'Show icon',
        prefsShowSession: 'Show 5h limit',
        prefsShowWeekly: 'Show weekly limit (7d)',
        prefsShowLabels: 'Show "5h" and "7d"',
        prefsShowUpdated: 'Show last update time',
        prefsShowSeconds: 'Show seconds in the time',
        prefsBarWidth: 'Bar width (px)',
        prefsBarHeight: 'Bar thickness (px)',
        prefsSpacing: 'Spacing between items (px)',
        prefsPosition: 'Panel position',
        prefsLanguage: 'Language',
        langAuto: 'Automatic (system)',
        posLeft: 'Left',
        posCenter: 'Center',
        posRight: 'Right',
        prefsInterval: 'Refresh every (seconds)',
    },
};

export function languages() {
    return [['pt', 'Português'], ['es', 'Español'], ['en', 'English']];
}

export function currentLang(GLib, pref = 'auto') {
    if (STRINGS[pref])
        return pref;
    for (const name of GLib.get_language_names()) {
        const code = String(name).slice(0, 2).toLowerCase();
        if (STRINGS[code])
            return code;
    }
    return 'pt';
}

export function makeTr(GLib, pref = 'auto') {
    const table = STRINGS[currentLang(GLib, pref)];
    return key => (table[key] !== undefined ? table[key] : STRINGS.pt[key]);
}
