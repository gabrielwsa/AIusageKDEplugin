import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import org.kde.kirigami as Kirigami
import org.kde.kcmutils as KCM
import "../code/i18n.js" as I18n

KCM.SimpleKCM {
    readonly property string lang: I18n.langFrom(Qt.locale())
    function t(key) { return I18n.tr(lang, key); }

    property alias cfg_textScale: textScale.value
    property alias cfg_logoScale: logoScale.value
    property alias cfg_spacing: spacing.value
    property alias cfg_barWidth: barWidth.value
    property alias cfg_barHeight: barHeight.value
    property alias cfg_sidePadding: sidePadding.value
    property alias cfg_showLabels: showLabels.checked
    property alias cfg_showUpdated: showUpdated.checked

    Kirigami.FormLayout {
        QQC2.SpinBox {
            id: textScale
            Kirigami.FormData.label: t("cfgTextSize")
            from: 50; to: 250; stepSize: 10
        }
        QQC2.SpinBox {
            id: logoScale
            Kirigami.FormData.label: t("cfgLogoSize")
            from: 50; to: 200; stepSize: 10
        }
        QQC2.SpinBox {
            id: spacing
            Kirigami.FormData.label: t("cfgSpacing")
            from: 0; to: 60
        }
        QQC2.SpinBox {
            id: sidePadding
            Kirigami.FormData.label: t("cfgSidePadding")
            from: 0; to: 40
        }

        Item { Kirigami.FormData.isSection: true }

        QQC2.SpinBox {
            id: barWidth
            Kirigami.FormData.label: t("cfgBarWidth")
            from: 0; to: 200; stepSize: 4
        }
        QQC2.SpinBox {
            id: barHeight
            Kirigami.FormData.label: t("cfgBarHeight")
            from: 0; to: 12
        }
        QQC2.CheckBox {
            id: showLabels
            Kirigami.FormData.label: t("cfgLabels")
            text: t("cfgShowLabels")
        }
        QQC2.CheckBox {
            id: showUpdated
            text: t("cfgShowUpdated")
        }
    }
}
