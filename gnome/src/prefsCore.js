// Janela de preferências (compartilhada entre GNOME 45+ e 43–44).
// Usa só widgets do libadwaita 1.2 para funcionar no GNOME 43.

export function buildPrefs(L, window, settings, t) {
    const {Adw, Gtk, Gio, I18n} = L;

    const page = new Adw.PreferencesPage({
        title: t('prefsPage'),
        icon_name: 'preferences-desktop-appearance-symbolic',
    });

    const panel = new Adw.PreferencesGroup({title: t('prefsPanel')});
    page.add(panel);

    const addSwitch = (group, key, title) => {
        const row = new Adw.ActionRow({title});
        const sw = new Gtk.Switch({valign: Gtk.Align.CENTER});
        settings.bind(key, sw, 'active', Gio.SettingsBindFlags.DEFAULT);
        row.add_suffix(sw);
        row.activatable_widget = sw;
        group.add(row);
    };

    const addSpin = (group, key, title, min, max, step) => {
        const row = new Adw.ActionRow({title});
        const spin = Gtk.SpinButton.new_with_range(min, max, step);
        spin.valign = Gtk.Align.CENTER;
        settings.bind(key, spin, 'value', Gio.SettingsBindFlags.DEFAULT);
        row.add_suffix(spin);
        row.activatable_widget = spin;
        group.add(row);
    };

    const positions = ['left', 'center', 'right'];
    const posRow = new Adw.ComboRow({
        title: t('prefsPosition'),
        model: Gtk.StringList.new([t('posLeft'), t('posCenter'), t('posRight')]),
    });
    posRow.selected = Math.max(0, positions.indexOf(settings.get_string('panel-position')));
    posRow.connect('notify::selected', () => settings.set_string('panel-position', positions[posRow.selected]));
    panel.add(posRow);

    const langs = ['auto', ...I18n.languages().map(l => l[0])];
    const langRow = new Adw.ComboRow({
        title: t('prefsLanguage'),
        model: Gtk.StringList.new([t('langAuto'), ...I18n.languages().map(l => l[1])]),
    });
    langRow.selected = Math.max(0, langs.indexOf(settings.get_string('language')));
    langRow.connect('notify::selected', () => settings.set_string('language', langs[langRow.selected]));
    panel.add(langRow);

    addSwitch(panel, 'show-icon', t('prefsShowIcon'));
    addSwitch(panel, 'show-session', t('prefsShowSession'));
    addSwitch(panel, 'show-weekly', t('prefsShowWeekly'));
    addSwitch(panel, 'show-labels', t('prefsShowLabels'));
    addSwitch(panel, 'show-updated', t('prefsShowUpdated'));
    addSwitch(panel, 'show-seconds', t('prefsShowSeconds'));
    addSpin(panel, 'spacing', t('prefsSpacing'), 0, 40, 1);
    addSpin(panel, 'bar-width', t('prefsBarWidth'), 0, 200, 4);
    addSpin(panel, 'bar-height', t('prefsBarHeight'), 1, 12, 1);

    const data = new Adw.PreferencesGroup({title: t('prefsData')});
    page.add(data);
    addSpin(data, 'refresh-interval', t('prefsInterval'), 30, 3600, 30);

    window.add(page);
}
