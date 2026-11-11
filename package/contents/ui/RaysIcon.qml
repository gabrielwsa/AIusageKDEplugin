import QtQuick

// Ícone de raios irradiando do centro (estilo "faísca").
Canvas {
    id: rays
    property color color: "#d97757"
    onColorChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()

    onPaint: {
        const ctx = getContext("2d");
        ctx.reset();
        const cx = width / 2, cy = height / 2;
        const r = Math.min(width, height) / 2 - 1;
        const lengths = [1.0, 0.78, 0.92, 0.70, 1.0, 0.82, 0.90, 0.74, 0.98, 0.80, 0.88, 0.72];
        const n = lengths.length;
        ctx.strokeStyle = rays.color;
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1.4, r * 0.26);
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = i * 2 * Math.PI / n - Math.PI / 2;
            ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
            ctx.lineTo(cx + Math.cos(a) * r * lengths[i], cy + Math.sin(a) * r * lengths[i]);
        }
        ctx.stroke();
    }
}
