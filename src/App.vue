<template>
  <div id="app" ref="app">
    <div class="canvas-box" ref="canvasBox">
      <div class="box-title">Canvas</div>
    </div>
    <div class="canvas-box" ref="tableBox">
      <div class="box-title">Table</div>
    </div>
    <div class="canvas-box" ref="svgBox">
      <div class="box-title">svg</div>
    </div>
  </div>
</template>

<script>
import QR from "@/libs/index";
export default {
  name: 'App',
  mounted() {
    const QRCanvas = new QR();
    QRCanvas.renderCanvas("https://www.baidu.com/");
    this.$refs.canvasBox.appendChild(QRCanvas.canvas);

    const QRTable = new QR({
      render: "table",
    });
    QRTable.renderTable("https://www.baidu.com/");
    this.$refs.tableBox.appendChild(QRTable.canvas);

    const QRSVG = new QR({
      render: "svg",
    });
    QRSVG.renderSVG("https://www.baidu.com/");
    this.$refs.svgBox.appendChild(QRSVG.canvas);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
}

.canvas-box {
  margin: 20px;
}

.box-title {
  font-size: 16px;
  text-align: center;
  font-weight: bold;
  background: blue;
  color: #fff;
  padding: 10px;
  margin: 0 0 10px 0;
}
</style>
