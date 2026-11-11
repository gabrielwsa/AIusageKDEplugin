import QtQuick

// Barra de uso com vários estilos:
// "rounded" (arredondada), "square" (reta), "segmented" (blocos),
// "dots" (pontos) e "outline" (contorno).
Item {
    id: bar
    property real value: 0                  // 0–100
    property string barStyle: "rounded"
    property color color: "#d97757"
    property color trackColor: Qt.rgba(0.5, 0.5, 0.5, 0.2)
    property bool gradient: false           // gradiente no preenchimento (estilos contínuos)

    readonly property real frac: Math.max(0, Math.min(100, value)) / 100
    readonly property bool continuous: barStyle === "rounded" || barStyle === "square" || barStyle === "outline"
    readonly property real gap: Math.max(1, Math.round(height / 3))
    readonly property int count: barStyle === "dots"
        ? Math.max(3, Math.floor((width + gap) / (height + gap)))
        : Math.max(4, Math.min(20, Math.floor((width + gap) / Math.max(4, height * 1.2 + gap))))
    readonly property int lit: value > 0 ? Math.max(1, Math.round(frac * count)) : 0

    // --- estilos contínuos ---------------------------------------------------
    Rectangle {
        id: track
        visible: bar.continuous
        anchors.fill: parent
        radius: bar.barStyle === "square" ? Math.min(1, height / 4) : height / 2
        color: bar.barStyle === "outline" ? "transparent" : bar.trackColor
        border.width: bar.barStyle === "outline" ? 1 : 0
        border.color: bar.color
    }
    Rectangle {
        visible: bar.continuous && bar.value > 0
        readonly property real inset: bar.barStyle === "outline" ? 2 : 0
        x: inset; y: inset
        height: bar.height - 2 * inset
        width: Math.max(bar.barStyle === "square" ? 1 : height,
                        (bar.width - 2 * inset) * bar.frac)
        radius: bar.barStyle === "square" ? track.radius : height / 2
        color: bar.color
        gradient: bar.gradient ? grad : null
        Gradient {
            id: grad
            orientation: Gradient.Horizontal
            GradientStop { position: 0; color: Qt.lighter(bar.color, 1.25) }
            GradientStop { position: 1; color: bar.color }
        }
        Behavior on width { NumberAnimation { duration: 400; easing.type: Easing.OutCubic } }
    }

    // --- estilos em blocos ---------------------------------------------------
    Row {
        visible: !bar.continuous
        anchors.verticalCenter: parent.verticalCenter
        spacing: bar.gap
        Repeater {
            model: bar.continuous ? 0 : bar.count
            Rectangle {
                width: bar.barStyle === "dots" ? bar.height
                    : (bar.width - bar.gap * (bar.count - 1)) / bar.count
                height: bar.height
                radius: bar.barStyle === "dots" ? height / 2 : Math.min(1.5, height / 3)
                color: index < bar.lit ? bar.color : bar.trackColor
                Behavior on color { ColorAnimation { duration: 250 } }
            }
        }
    }
}
