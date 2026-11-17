// Preferências — GNOME Shell 45+ (módulos ES).
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import * as I18n from './i18n.js';
import {buildPrefs} from './prefsCore.js';

export default class AIUsageMeterPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        buildPrefs({Adw, Gtk, Gio, I18n}, window, settings, I18n.makeTr(GLib, settings.get_string('language')));
    }
}
