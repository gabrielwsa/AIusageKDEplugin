// Código compartilhado da extensão GNOME (indicador no painel + menu).
//
// Sem imports: as bibliotecas chegam por parâmetro, para o mesmo arquivo
// funcionar no GNOME 45+ (ESM) e no 43–44 (o build remove os "export").

const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const ACCENT = '#d97757';
const BIG_BAR_WIDTH = 280;

export function colorFor(used) {
    if (used >= 90)
        return '#e5534b';
    if (used >= 70)
        return '#e9a23b';
    return ACCENT;
}

function pad(n) {
    return n < 10 ? `0${n}` : `${n}`;
}

function fmtClock(date, withSeconds) {
    const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return withSeconds ? `${hm}:${pad(date.getSeconds())}` : hm;
}

function fmtLeft(ms) {
    if (!ms)
        return '';
    let s = Math.max(0, Math.floor((ms - Date.now()) / 1000));
    const d = Math.floor(s / 86400);
    s -= d * 86400;
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    if (d)
        return `${d}d ${h}h`;
    if (h)
        return `${h}h ${pad(m)}m`;
    return `${m}min`;
}

function fmtWhen(ms, t) {
    if (!ms)
        return '';
    const d = new Date(ms);
    const hm = fmtClock(d, false);
    if (d.toDateString() === new Date().toDateString())
        return `${t('today')} ${hm}`;
    return `${t('days')[d.getDay()]} ${hm}`;
}

function vbox(St, Clutter, params = {}) {
    const box = new St.BoxLayout(params);
    // GNOME 48+ usa "orientation"; versões antigas usam "vertical".
    if (box.orientation !== undefined)
        box.orientation = Clutter.Orientation.VERTICAL;
    else
        box.vertical = true;
    return box;
}

let _IndicatorClass = null;

function getIndicatorClass(L) {
    if (_IndicatorClass)
        return _IndicatorClass;
    const {GObject, St, Clutter, GLib, Gio, Soup, PanelMenu, PopupMenu, I18n} = L;
    const CENTER = Clutter.ActorAlign.CENTER;

    _IndicatorClass = GObject.registerClass(
    class AIUsageMeterIndicator extends PanelMenu.Button {
        _init(opts) {
            super._init(0.5, 'AI Usage Meter', false);
            this._settings = opts.settings;
            this._path = opts.path;
            this._openPrefs = opts.openPrefs;
            this._t = I18n.makeTr(GLib, this._settings.get_string('language'));

            this._loaded = false;
            this._loading = false;
            this._error = '';
            this._data = {session: {used: 0, resets: 0}, weekly: {used: 0, resets: 0}, scoped: []};
            this._updated = null;

            this._cancellable = new Gio.Cancellable();
            this._http = new Soup.Session({timeout: 15, user_agent: 'ai-usage-meter-gnome'});
            this._sources = [];
            this._settingsIds = [];

            this._buildPanel();
            this._buildMenu();
            this._applySettings();

            for (const key of ['show-icon', 'show-session', 'show-weekly', 'show-labels', 'show-updated', 'show-seconds',
                'bar-width', 'bar-height', 'spacing'])
                this._settingsIds.push(this._settings.connect(`changed::${key}`, () => this._applySettings()));
            this._settingsIds.push(this._settings.connect('changed::refresh-interval', () => this._startTimers()));

            this._startTimers();
            this._refresh();
        }

        // ---- painel ------------------------------------------------------
        _buildPanel() {
            this._box = new St.BoxLayout({style_class: 'aum-panel', y_align: CENTER});
            this.add_child(this._box);

            this._icon = new St.Icon({
                gicon: Gio.icon_new_for_string(`${this._path}/icons/claude-rays.svg`),
                style_class: 'system-status-icon aum-icon',
                y_align: CENTER,
            });
            this._box.add_child(this._icon);

            this._chips = ['5h', '7d'].map((name, i) => {
                const chip = {};
                if (i > 0) {
                    chip.sep = new St.Label({text: '|', style_class: 'aum-sep', y_align: CENTER});
                    chip.sep.opacity = 90;
                    this._box.add_child(chip.sep);
                }
                chip.label = new St.Label({text: name, style_class: 'aum-label', y_align: CENTER});
                chip.label.opacity = 150;
                chip.pct = new St.Label({text: '–', style_class: 'aum-pct', y_align: CENTER});
                chip.bar = new St.Widget({
                    style_class: 'aum-bar', y_align: CENTER,
                    layout_manager: new Clutter.BinLayout(),
                });
                chip.fill = new St.Widget({style_class: 'aum-bar-fill', x_align: Clutter.ActorAlign.START});
                chip.bar.add_child(chip.fill);
                for (const w of [chip.label, chip.pct, chip.bar])
                    this._box.add_child(w);
                return chip;
            });

            this._updatedLabel = new St.Label({text: '', style_class: 'aum-updated', y_align: CENTER});
            this._box.add_child(this._updatedLabel);
        }

        // ---- menu --------------------------------------------------------
        _buildMenu() {
            const t = this._t;
            this.menu.box.add_style_class_name('aum-menu');

            const header = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
            const hbox = new St.BoxLayout({x_expand: true, style_class: 'aum-header'});
            hbox.add_child(new St.Icon({
                gicon: Gio.icon_new_for_string(`${this._path}/icons/claude-rays.svg`),
                icon_size: 20, y_align: CENTER,
            }));
            hbox.add_child(new St.Label({text: t('title'), style_class: 'aum-title', y_align: CENTER}));
            hbox.add_child(new St.Widget({x_expand: true}));
            this._pill = new St.Label({text: '', style_class: 'aum-pill', y_align: CENTER});
            hbox.add_child(this._pill);
            this._refreshBtn = new St.Button({
                style_class: 'aum-refresh button',
                child: new St.Icon({icon_name: 'view-refresh-symbolic', icon_size: 16}),
                accessible_name: t('refreshNow'),
                y_align: CENTER,
            });
            this._refreshBtn.connect('clicked', () => this._refresh());
            hbox.add_child(this._refreshBtn);
            header.add_child(hbox);
            this.menu.addMenuItem(header);

            this._rows = [t('session'), t('weekly')].map(title => {
                const item = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
                const col = vbox(St, Clutter, {x_expand: true, style_class: 'aum-row'});
                const top = new St.BoxLayout({x_expand: true});
                top.add_child(new St.Label({text: title, style_class: 'aum-row-title'}));
                top.add_child(new St.Widget({x_expand: true}));
                const pct = new St.Label({text: '–'});
                top.add_child(pct);
                const bar = new St.Widget({
                    style_class: 'aum-bar aum-bar-big',
                    layout_manager: new Clutter.BinLayout(),
                });
                const fill = new St.Widget({style_class: 'aum-bar-fill', x_align: Clutter.ActorAlign.START});
                bar.add_child(fill);
                const reset = new St.Label({text: '', style_class: 'aum-small'});
                reset.opacity = 180;
                col.add_child(top);
                col.add_child(bar);
                col.add_child(reset);
                item.add_child(col);
                this.menu.addMenuItem(item);
                return {pct, bar, fill, reset};
            });

            this._scopedItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
            this._scopedLabel = new St.Label({text: '', style_class: 'aum-small'});
            this._scopedLabel.opacity = 160;
            this._scopedItem.add_child(this._scopedLabel);
            this.menu.addMenuItem(this._scopedItem);

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            const prefs = new PopupMenu.PopupMenuItem(t('preferences'));
            prefs.connect('activate', () => this._openPrefs());
            this.menu.addMenuItem(prefs);
        }

        // ---- configurações -------------------------------------------------
        _scale() {
            return St.ThemeContext.get_for_stage(global.stage).scale_factor;
        }

        _applySettings() {
            const s = this._settings;
            const sc = this._scale();
            this._icon.visible = s.get_boolean('show-icon');
            this._box.style = `spacing: ${s.get_int('spacing')}px;`;
            const bw = s.get_int('bar-width');
            const bh = Math.max(1, s.get_int('bar-height'));
            const shown = [s.get_boolean('show-session'), s.get_boolean('show-weekly')];
            this._chips.forEach((chip, i) => {
                const on = shown[i];
                chip.label.visible = on && s.get_boolean('show-labels');
                chip.bar.visible = on && bw > 0;
                chip.pct.visible = on;
                if (chip.sep)
                    chip.sep.visible = shown[0] && shown[1];
                chip.bar.set_size(bw * sc, bh * sc);
                chip.bar.style = `border-radius: ${bh / 2}px;`;
            });
            for (const row of this._rows)
                row.bar.set_width(BIG_BAR_WIDTH * sc);
            this._update();
        }

        _startTimers() {
            for (const id of this._sources)
                GLib.source_remove(id);
            const interval = Math.max(30, this._settings.get_int('refresh-interval'));
            this._sources = [
                GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
                    this._refresh();
                    return GLib.SOURCE_CONTINUE;
                }),
                // contagem regressiva do "zera em"
                GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
                    this._update();
                    return GLib.SOURCE_CONTINUE;
                }),
            ];
        }

        // ---- dados ---------------------------------------------------------
        _readToken() {
            const path = GLib.build_filenamev([GLib.get_home_dir(), '.claude', '.credentials.json']);
            const [, bytes] = GLib.file_get_contents(path);
            return JSON.parse(new TextDecoder().decode(bytes)).claudeAiOauth.accessToken;
        }

        _refresh() {
            if (this._loading)
                return;
            let token;
            try {
                token = this._readToken();
            } catch (e) {
                this._finish(null, 'login');
                return;
            }
            this._loading = true;
            this._update();

            const msg = Soup.Message.new('GET', USAGE_URL);
            msg.request_headers.append('Authorization', `Bearer ${token}`);
            msg.request_headers.append('anthropic-beta', 'oauth-2025-04-20');
            this._http.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, this._cancellable, (session, res) => {
                let bytes;
                try {
                    bytes = session.send_and_read_finish(res);
                } catch (e) {
                    if (e.matches && e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                        return;
                    this._finish(null, 'offline');
                    return;
                }
                const status = msg.get_status();
                if (status === 401) {
                    this._finish(null, 'expired');
                    return;
                }
                if (status !== 200) {
                    this._finish(null, `http:${status}`);
                    return;
                }
                try {
                    const raw = bytes.get_data();
                    this._finish(JSON.parse(new TextDecoder().decode(raw ?? new Uint8Array())), '');
                } catch (e) {
                    this._finish(null, 'parse');
                }
            });
        }

        _finish(data, error) {
            this._loading = false;
            this._error = error;
            if (data) {
                const toMs = iso => {
                    if (!iso)
                        return 0;
                    const dt = GLib.DateTime.new_from_iso8601(iso, null);
                    return dt ? dt.to_unix() * 1000 : 0;
                };
                const fh = data.five_hour || {};
                const sd = data.seven_day || {};
                this._data = {
                    session: {used: Number(fh.utilization) || 0, resets: toMs(fh.resets_at)},
                    weekly: {used: Number(sd.utilization) || 0, resets: toMs(sd.resets_at)},
                    scoped: (data.limits || [])
                        .filter(l => l.kind === 'weekly_scoped' && l.scope)
                        .map(l => ({
                            name: (l.scope.model && l.scope.model.display_name) || 'modelo',
                            used: Number(l.percent) || 0,
                        })),
                };
                this._updated = new Date();
                this._loaded = true;
            }
            this._update();
        }

        _errText() {
            const e = this._error;
            if (!e)
                return '';
            if (e.startsWith('http:'))
                return `${this._t('err_http')} ${e.slice(5)}`;
            return this._t(`err_${e}`);
        }

        // ---- desenho -------------------------------------------------------
        _setFill(fill, barWidth, barHeight, used) {
            const w = used > 0 ? Math.max(barHeight, Math.round(barWidth * Math.min(100, used) / 100)) : 0;
            fill.set_size(w, barHeight);
            fill.style = `background-color: ${colorFor(used)}; border-radius: ${barHeight / 2 / this._scale()}px;`;
        }

        _update() {
            if (!this._box)
                return;
            const t = this._t;
            const s = this._settings;
            const sc = this._scale();
            const values = [this._data.session, this._data.weekly];

            // painel
            const bw = s.get_int('bar-width') * sc;
            const bh = Math.max(1, s.get_int('bar-height')) * sc;
            this._chips.forEach((chip, i) => {
                chip.pct.text = this._loaded ? `${values[i].used.toFixed(0)}%` : '–';
                this._setFill(chip.fill, bw, bh, this._loaded ? values[i].used : 0);
            });
            const clock = this._updated ? fmtClock(this._updated, s.get_boolean('show-seconds')) : '';
            this._updatedLabel.visible = s.get_boolean('show-updated') && (this._loaded || this._loading || !!this._error);
            this._updatedLabel.text = this._error ? '⚠' : this._loading ? '⟳ …' : `⟳ ${clock}`;
            this._updatedLabel.style = this._error ? 'color: #e5534b;' : '';
            this._updatedLabel.opacity = this._loading ? 130 : 255;
            this._icon.opacity = this._error ? 130 : 255;

            // menu
            this._pill.text = this._error ? `⚠ ${this._errText()}`
                : this._loading ? t('updating')
                    : this._loaded ? `${t('updated')} ${clock}` : t('loading');
            this._pill.remove_style_class_name('error');
            this._pill.remove_style_class_name('loading');
            if (this._error)
                this._pill.add_style_class_name('error');
            else if (this._loading || !this._loaded)
                this._pill.add_style_class_name('loading');
            this._refreshBtn.reactive = !this._loading;

            this._rows.forEach((row, i) => {
                const v = values[i];
                row.pct.clutter_text.set_markup(this._loaded
                    ? `<b>${v.used.toFixed(0)}%</b> ${t('used')}` : '–');
                this._setFill(row.fill, BIG_BAR_WIDTH * sc, 10 * sc, this._loaded ? v.used : 0);
                row.reset.visible = !!v.resets;
                row.reset.text = v.resets ? `${t('resetsIn')} ${fmtLeft(v.resets)} · ${fmtWhen(v.resets, t)}` : '';
            });

            const scoped = this._data.scoped;
            this._scopedItem.visible = scoped.length > 0;
            this._scopedLabel.text = scoped
                .map(x => `${x.name} (${t('weeklyScoped')}): ${x.used.toFixed(0)}% ${t('used')}`)
                .join('   ');
        }

        destroy() {
            this._cancellable.cancel();
            for (const id of this._sources)
                GLib.source_remove(id);
            this._sources = [];
            for (const id of this._settingsIds)
                this._settings.disconnect(id);
            this._settingsIds = [];
            this._http.abort();
            this._box = null;
            super.destroy();
        }
    });
    return _IndicatorClass;
}

// Cuida do indicador e da posição dele no painel. Usado pelos dois
// extension.js (ESM e legado).
export class Controller {
    constructor(L, opts) {
        this._L = L;
        this._opts = opts;
        this._indicator = null;
        this._posIds = [];
    }

    enable() {
        this._add();
        const rebuild = () => {
            this._remove();
            this._add();
        };
        // posição e idioma exigem recriar o indicador
        this._posIds = ['panel-position', 'language']
            .map(k => this._opts.settings.connect(`changed::${k}`, rebuild));
    }

    disable() {
        for (const id of this._posIds ?? [])
            this._opts.settings.disconnect(id);
        this._posIds = [];
        this._remove();
    }

    _add() {
        const Indicator = getIndicatorClass(this._L);
        this._indicator = new Indicator(this._opts);
        const pos = this._opts.settings.get_string('panel-position');
        const box = ['left', 'center', 'right'].includes(pos) ? pos : 'right';
        this._L.Main.panel.addToStatusArea(this._opts.uuid, this._indicator, box === 'right' ? 0 : -1, box);
    }

    _remove() {
        if (this._indicator)
            this._indicator.destroy();
        this._indicator = null;
    }
}
