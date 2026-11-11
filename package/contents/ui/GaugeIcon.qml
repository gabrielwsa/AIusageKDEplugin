import QtQuick

// Ícone genérico: um anel que se preenche com a porcentagem usada.
Canvas {
    id: gauge
    property real value: 0              // 0–100
    property color color: "#d97757"
    property color trackColor: "#888888"
    onValueChanged: requestPaint()
    onColorChanged: requestPaint()
    onTrackColorChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()

    onPaint: {
        const ctx = getContext("2d");
        ctx.reset();
        const cx = width / 2, cy = height / 2;
        const lw = Math.max(2, Math.min(width, height) * 0.2);
        const r = Math.min(width, height) / 2 - lw / 2 - 0.5;
        const start = -Math.PI / 2;

        ctx.lineWidth = lw;
        ctx.lineCap = "round";

        ctx.strokeStyle = Qt.rgba(trackColor.r, trackColor.g, trackColor.b, 0.25);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.stroke();

        const v = Math.max(0, Math.min(100, value));
        if (v > 0) {
            ctx.strokeStyle = gauge.color;
            ctx.beginPath();
            ctx.arc(cx, cy, r, start, start + 2 * Math.PI * v / 100);
            ctx.stroke();
        }
    }
}
