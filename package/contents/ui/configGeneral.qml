import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Dialogs as QtDialogs
import QtQuick.Layouts
import org.kde.kirigami as Kirigami
import org.kde.kcmutils as KCM
import org.kde.iconthemes as KIconThemes
import "../code/i18n.js" as I18n

KCM.SimpleKCM {
    id: page
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
    property string cfg_iconType
    property string cfg_iconName
    property string cfg_iconFile
    property string cfg_barStyle

    Kirigami.FormLayout {
        // ---- ícone ---------------------------------------------------------
        QQC2.ComboBox {
            id: iconType
            Kirigami.FormData.label: t("cfgIcon")
            textRole: "text"
            valueRole: "value"
            model: [
                { text: t("iconGauge"), value: "gauge" },
                { text: t("iconRays"), value: "rays" },
                { text: t("iconTheme"), value: "theme" },
                { text: t("iconFileOpt"), value: "file" },
                { text: t("iconNone"), value: "none" }
            ]
            Component.onCompleted: currentIndex = Math.max(0, indexOfValue(page.cfg_iconType))
            onActivated: page.cfg_iconType = currentValue
        }

        RowLayout {
            visible: page.cfg_iconType === "theme"
            Kirigami.Icon {
                source: page.cfg_iconName || "office-chart-ring"
                Layout.preferredWidth: Kirigami.Units.iconSizes.medium
                Layout.preferredHeight: Layout.preferredWidth
            }
            QQC2.Button {
                text: t("cfgChooseIcon")
                icon.name: "document-open"
                onClicked: iconDialog.open()
            }
        }

        RowLayout {
            visible: page.cfg_iconType === "file"
            Kirigami.Icon {
                source: page.cfg_iconFile || "image-missing"
                Layout.preferredWidth: Kirigami.Units.iconSizes.medium
                Layout.preferredHeight: Layout.preferredWidth
            }
            QQC2.TextField {
                Layout.preferredWidth: Kirigami.Units.gridUnit * 12
                text: page.cfg_iconFile.replace("file://", "")
                placeholderText: "/caminho/para/icone.svg"
                onEditingFinished: page.cfg_iconFile = text ? "file://" + text.replace("file://", "") : ""
            }
            QQC2.Button {
                text: t("cfgChooseFile")
                icon.name: "document-open"
                onClicked: fileDialog.open()
            }
        }

        QQC2.SpinBox {
            id: logoScale
            Kirigami.FormData.label: t("cfgLogoSize")
            from: 50; to: 200; stepSize: 10
            enabled: page.cfg_iconType !== "none"
        }

        Item { Kirigami.FormData.isSection: true }

        // ---- texto e espaçamento -------------------------------------------
        QQC2.SpinBox {
            id: textScale
            Kirigami.FormData.label: t("cfgTextSize")
            from: 50; to: 250; stepSize: 10
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

        // ---- barras --------------------------------------------------------
        QQC2.ComboBox {
            id: barStyle
            Kirigami.FormData.label: t("cfgBarStyle")
            textRole: "text"
            valueRole: "value"
            model: [
                { text: t("barRounded"), value: "rounded" },
                { text: t("barSquare"), value: "square" },
                { text: t("barSegmented"), value: "segmented" },
                { text: t("barDots"), value: "dots" },
                { text: t("barOutline"), value: "outline" }
            ]
            Component.onCompleted: currentIndex = Math.max(0, indexOfValue(page.cfg_barStyle))
            onActivated: page.cfg_barStyle = currentValue
        }
        UsageBar {   // pré-visualização do estilo
            implicitWidth: Math.max(60, barWidth.value * 2)
            implicitHeight: Math.max(4, barHeight.value)
            barStyle: page.cfg_barStyle
            value: 60
            color: "#d97757"
            trackColor: Qt.rgba(Kirigami.Theme.textColor.r, Kirigami.Theme.textColor.g,
                                Kirigami.Theme.textColor.b, 0.18)
        }
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

        Item { Kirigami.FormData.isSection: true }

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

    KIconThemes.IconDialog {
        id: iconDialog
        onIconNameChanged: if (iconName) page.cfg_iconName = iconName
    }

    QtDialogs.FileDialog {
        id: fileDialog
        nameFilters: [t("cfgImageFilter") + " (*.svg *.svgz *.png *.jpg *.jpeg *.webp)"]
        onAccepted: page.cfg_iconFile = selectedFile.toString()
    }
}
