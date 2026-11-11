import QtQuick
import QtQuick.Layouts
import org.kde.plasma.plasmoid
import org.kde.plasma.core as PlasmaCore
import org.kde.plasma.components as PC3
import org.kde.kirigami as Kirigami
import org.kde.plasma.plasma5support as P5Support
import "../code/i18n.js" as I18n

PlasmoidItem {
    id: root

    // ---- estado -----------------------------------------------------------
    property bool loaded: false
    property bool loading: false
    property string error: ""
    property real sessionUsed: 0
    property real sessionResets: 0
    property real weeklyUsed: 0
    property real weeklyResets: 0
    property var scoped: []
    property date updated
    property real now: Date.now()

    readonly property color accent: "#d97757"
    readonly property string lang: I18n.langFrom(Qt.locale())
    function t(key) { return I18n.tr(lang, key); }
    function errText(code) {
        if (!code) return "";
        if (code.indexOf("http:") === 0) return t("err_http") + " " + code.slice(5);
        return t("err_" + code);
    }
    readonly property string script: Qt.resolvedUrl("../code/usage.py").toString().replace("file://", "")

    // raios usam o coral fixo (estilo Claude); o anel muda de cor com o uso
    function iconColor() {
        return Plasmoid.configuration.iconType === "rays" ? accent : colorFor(sessionUsed);
    }

    function colorFor(used) {
        if (used >= 90) return "#e5534b";
        if (used >= 70) return "#e9a23b";
        return accent;
    }

    function fmtLeft(ms) {
        if (!ms) return "";
        let s = Math.max(0, Math.floor((ms - now) / 1000));
        const d = Math.floor(s / 86400); s -= d * 86400;
        const h = Math.floor(s / 3600); s -= h * 3600;
        const m = Math.floor(s / 60);
        if (d) return d + "d " + h + "h";
        if (h) return h + "h " + (m < 10 ? "0" : "") + m + "m";
        return m + "min";
    }

    function fmtWhen(ms) {
        if (!ms) return "";
        const t = new Date(ms), today = new Date(now);
        const hm = Qt.formatTime(t, "HH:mm");
        if (t.toDateString() === today.toDateString()) return root.t("today") + " " + hm;
        return root.t("days")[t.getDay()] + " " + hm;
    }

    function refresh() {
        if (loading) return;
        loading = true;
        exec.connectSource("python3 '" + script + "'");
    }

    P5Support.DataSource {
        id: exec
        engine: "executable"
        connectedSources: []
        onNewData: (source, data) => {
            disconnectSource(source);
            root.loading = false;
            try {
                const r = JSON.parse(data["stdout"]);
                if (!r.ok) { root.error = r.error; return; }
                root.error = "";
                root.sessionUsed = r.session.used;
                root.sessionResets = r.session.resets;
                root.weeklyUsed = r.weekly.used;
                root.weeklyResets = r.weekly.resets;
                root.scoped = r.scoped;
                root.updated = new Date();
                root.loaded = true;
            } catch (e) {
                root.error = "parse";
            }
        }
    }

    Timer {   // busca na API a cada 2 min
        interval: 120000; running: true; repeat: true; triggeredOnStart: true
        onTriggered: root.refresh()
    }
    Timer {   // atualiza as contagens regressivas
        interval: 30000; running: true; repeat: true
        onTriggered: root.now = Date.now()
    }

    toolTipMainText: t("tooltipTitle")
    toolTipSubText: !loaded ? (errText(error) || t("loading"))
        : t("tipSession") + ": " + sessionUsed.toFixed(0) + "% " + t("used") + " · " + t("resetsIn") + " " + fmtLeft(sessionResets)
          + "\n" + t("tipWeekly") + ": " + weeklyUsed.toFixed(0) + "% " + t("used") + " · " + t("resetsIn") + " " + fmtLeft(weeklyResets)
          + "\n" + t("updated") + " " + Qt.formatTime(updated, "HH:mm")

    Plasmoid.icon: "utilities-system-monitor"

    // ---- na barra ----------------------------------------------------------
    compactRepresentation: MouseArea {
        id: compact
        readonly property var cfg: Plasmoid.configuration
        readonly property real ts: cfg.textScale / 100
        function fit(base) { return Math.max(6, Math.min(Math.round(base * ts), Math.floor(height * 0.62))); }
        Layout.minimumWidth: row.implicitWidth + cfg.sidePadding * 2
        Layout.preferredWidth: Layout.minimumWidth
        hoverEnabled: true
        acceptedButtons: Qt.LeftButton | Qt.MiddleButton
        onClicked: (mouse) => {
            if (mouse.button === Qt.MiddleButton) root.refresh();
            else root.expanded = !root.expanded;
        }

        RowLayout {
            id: row
            anchors.centerIn: parent
            height: parent.height
            spacing: compact.cfg.spacing

            AppIcon {
                Layout.preferredWidth: Math.min(Math.round(Kirigami.Units.iconSizes.small * compact.cfg.logoScale / 100), compact.height - 2)
                Layout.preferredHeight: Layout.preferredWidth
                Layout.alignment: Qt.AlignVCenter
                iconType: compact.cfg.iconType
                iconName: compact.cfg.iconName
                iconFile: compact.cfg.iconFile
                value: root.sessionUsed
                color: root.error ? Kirigami.Theme.negativeTextColor : root.iconColor()
            }

            Repeater {
                model: [
                    { label: "5h", used: root.sessionUsed },
                    { label: "7d", used: root.weeklyUsed }
                ]
                delegate: RowLayout {
                    Layout.alignment: Qt.AlignVCenter
                    spacing: Math.max(3, Math.round(compact.cfg.spacing / 2))
                    Rectangle {   // separador "|" entre 5h e 7d
                        visible: index > 0
                        Layout.alignment: Qt.AlignVCenter
                        Layout.rightMargin: Math.round(compact.cfg.spacing / 2)
                        implicitWidth: 1
                        implicitHeight: Math.round(compact.height * 0.55)
                        color: Kirigami.Theme.textColor
                        opacity: 0.35
                    }
                    PC3.Label {
                        visible: compact.cfg.showLabels
                        text: modelData.label
                        font.pixelSize: compact.fit(9)
                        opacity: 0.6
                    }
                    PC3.Label {
                        text: root.loaded ? modelData.used.toFixed(0) + "%" : "–"
                        font.pixelSize: compact.fit(11)
                        font.bold: true
                    }
                    UsageBar {   // mini barra ao lado do número
                        visible: compact.cfg.barHeight > 0 && compact.cfg.barWidth > 0
                        Layout.alignment: Qt.AlignVCenter
                        Layout.preferredWidth: compact.cfg.barWidth
                        Layout.preferredHeight: compact.cfg.barHeight
                        barStyle: compact.cfg.barStyle
                        value: modelData.used
                        color: root.colorFor(modelData.used)
                        trackColor: Qt.rgba(Kirigami.Theme.textColor.r, Kirigami.Theme.textColor.g,
                                            Kirigami.Theme.textColor.b, 0.18)
                    }
                }
            }

            PC3.Label {   // hora da última atualização (sem fundo)
                visible: compact.cfg.showUpdated && (root.loaded || root.loading || root.error !== "")
                Layout.alignment: Qt.AlignVCenter
                color: root.error ? Kirigami.Theme.negativeTextColor : root.accent
                opacity: root.loading ? 0.5 : 1
                font.pixelSize: compact.fit(9)
                text: root.error ? "⚠"
                    : root.loading ? "⟳ …"
                    : "⟳ " + Qt.formatTime(root.updated, "HH:mm")
            }
        }
    }

    // ---- popup ao clicar ----------------------------------------------------
    fullRepresentation: ColumnLayout {
        Layout.preferredWidth: Kirigami.Units.gridUnit * 18
        Layout.minimumWidth: Kirigami.Units.gridUnit * 16
        Layout.preferredHeight: implicitHeight
        Layout.maximumHeight: implicitHeight
        spacing: Kirigami.Units.largeSpacing

        RowLayout {   // cabeçalho
            Layout.fillWidth: true
            spacing: Kirigami.Units.smallSpacing * 2
            AppIcon {
                Layout.preferredWidth: Kirigami.Units.iconSizes.smallMedium
                Layout.preferredHeight: Layout.preferredWidth
                iconType: Plasmoid.configuration.iconType
                iconName: Plasmoid.configuration.iconName
                iconFile: Plasmoid.configuration.iconFile
                value: root.sessionUsed
                color: root.iconColor()
            }
            Kirigami.Heading { text: root.t("title"); level: 3 }
            Item { Layout.fillWidth: true }
            Rectangle {   // pílula com a hora da última atualização
                visible: root.loaded || root.error !== "" || root.loading
                radius: height / 2
                color: root.error ? "#c9433b" : root.loading ? Kirigami.Theme.disabledTextColor : root.accent
                implicitHeight: pill.implicitHeight + 6
                implicitWidth: pill.implicitWidth + 18
                PC3.Label {
                    id: pill
                    anchors.centerIn: parent
                    color: "white"
                    font.bold: true
                    font.pointSize: Kirigami.Theme.smallFont.pointSize
                    text: root.error ? "⚠ " + root.errText(root.error)
                        : root.loading ? root.t("updating")
                        : root.t("updated") + " " + Qt.formatTime(root.updated, "HH:mm")
                }
            }
            PC3.ToolButton {
                icon.name: "view-refresh"
                enabled: !root.loading
                onClicked: root.refresh()
                PC3.ToolTip.text: root.t("refreshNow")
                PC3.ToolTip.visible: hovered
                RotationAnimator on rotation {
                    running: root.loading
                    from: 0; to: 360; duration: 800; loops: Animation.Infinite
                    onStopped: parent.rotation = 0
                }
            }
        }

        Repeater {
            model: [
                { title: root.t("session"), used: root.sessionUsed, resets: root.sessionResets },
                { title: root.t("weekly"), used: root.weeklyUsed, resets: root.weeklyResets }
            ]
            delegate: ColumnLayout {
                Layout.fillWidth: true
                spacing: Kirigami.Units.smallSpacing
                RowLayout {
                    Layout.fillWidth: true
                    PC3.Label { text: modelData.title; font.weight: Font.Medium }
                    Item { Layout.fillWidth: true }
                    PC3.Label {
                        textFormat: Text.StyledText
                        text: root.loaded ? "<b>" + modelData.used.toFixed(0) + "%</b> " + root.t("used") : "–"
                    }
                }
                UsageBar {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 10
                    barStyle: Plasmoid.configuration.barStyle
                    gradient: true
                    value: modelData.used
                    color: root.colorFor(modelData.used)
                    trackColor: Qt.rgba(Kirigami.Theme.textColor.r, Kirigami.Theme.textColor.g,
                                        Kirigami.Theme.textColor.b, 0.12)
                }
                PC3.Label {
                    visible: modelData.resets > 0
                    text: root.t("resetsIn") + " " + root.fmtLeft(modelData.resets) + " · " + root.fmtWhen(modelData.resets)
                    font.pointSize: Kirigami.Theme.smallFont.pointSize
                    opacity: 0.7
                }
            }
        }

        PC3.Label {
            visible: root.scoped.length > 0
            Layout.fillWidth: true
            text: root.scoped.map(s => s.name + " (" + root.t("weeklyScoped") + "): " + s.used.toFixed(0) + "% " + root.t("used")).join("   ")
            font.pointSize: Kirigami.Theme.smallFont.pointSize
            opacity: 0.6
        }
    }
}
