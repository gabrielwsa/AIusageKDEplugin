import QtQuick
import org.kde.kirigami as Kirigami

// Ícone configurável: "gauge" (anel), "rays" (raios), "theme" (ícone do tema),
// "file" (imagem do usuário) ou "none".
Item {
    id: icon
    property string iconType: "gauge"
    property string iconName: ""
    property string iconFile: ""
    property real value: 0
    property color color: "#d97757"
    property color trackColor: Kirigami.Theme.textColor

    visible: iconType !== "none"

    Loader {
        anchors.fill: parent
        sourceComponent: icon.iconType === "rays" ? raysComp
            : icon.iconType === "theme" ? themeComp
            : icon.iconType === "file" ? fileComp
            : gaugeComp
    }

    Component {
        id: gaugeComp
        GaugeIcon { value: icon.value; color: icon.color; trackColor: icon.trackColor }
    }
    Component {
        id: raysComp
        RaysIcon { color: icon.color }
    }
    Component {
        id: themeComp
        Kirigami.Icon { source: icon.iconName || "office-chart-ring" }
    }
    Component {
        id: fileComp
        Kirigami.Icon { source: icon.iconFile || "image-missing" }
    }
}
