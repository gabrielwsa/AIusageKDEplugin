import QtQuick
import org.kde.plasma.configuration
import "../code/i18n.js" as I18n

ConfigModel {
    ConfigCategory {
        name: I18n.tr(I18n.langFrom(Qt.locale()), "cfgAppearance")
        icon: "preferences-desktop-theme"
        source: "configGeneral.qml"
    }
}
