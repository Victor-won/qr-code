import QRCode from "./QRCore";

/**
 * 计算矩阵点的前景色
 * @param {Object} config
 * @param {Number} config.row 点x坐标
 * @param {Number} config.col 点y坐标
 * @param {Number} config.count 矩阵大小
 * @param {Number} config.options 组件的options
 * @return {String}
 */
function getForeGround(config) {
  const options = config.options;
  if (
    options.pdground && (
      (config.row > 1 && config.row < 5 && config.col > 1 && config.col < 5) ||
      (config.row > (config.count - 6) && config.row < (config.count - 2) && config.col > 1 && config.col < 5) ||
      (config.row > 1 && config.row < 5 && config.col > (config.count - 6) && config.col < (config.count - 2))
    )
  ) {
    return options.pdground;
  }
  return options.foreground;
}

/**
 * 获取当前屏幕的设备像素比 devicePixelRatio/backingStore
 * @param context 当前 canvas 上下文，可以为 window
 */
function getPixelRatio(context) {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;

  return (window.devicePixelRatio || 1) / backingStore;
}

export default class {
  constructor(options) {
    if (typeof options === "string") { // 只编码ASCII字符串
      options = {
        texture: options,
      };
    }

    // 设置默认参数
    this.options = Object.assign({}, {
      text: '',
      render: '',
      size: 256,
      correctLevel: 3,
      background: '#ffffff',
      foreground: '#000000',
      image: '',
      imageSize: 30
    }, options);


    // 使用 QRCode 创建二维码结构
    this.instance = new QRCode();
    this.canvas = null;

    if (this.options.render) {
      switch (this.options.render) {
        case 'canvas':
          return this.createCanvas();
        case 'table':
          return this.createTable();
        case 'svg':
          return this.createSVG();
        default:
          return this.createDefault();
      }
    }
    return this.createDefault();
  }

  createDefault() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext) {
      return this.createCanvas();
    }
    const SVG_NS = 'http://www.w3.org/2000/svg';
    if (!!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect) {
      return this.createSVG();
    }
    return this.createTable();
  }

  createCanvas() {
    const options = this.options;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const ratio = getPixelRatio(ctx);
    const size = options.size;
    const ratioSize = size * ratio;

    canvas.width = ratioSize;
    canvas.height = ratioSize;

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    this.canvas = canvas;
  }

  renderCanvas(data) {
    const options = this.options;
    const ctx = this.canvas.getContext('2d');
    const ratio = getPixelRatio(ctx);
    const size = options.size;
    const ratioSize = size * ratio;
    const ratioImgSize = options.imageSize * ratio;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.instance.initialize(data);
    const count = this.instance.getModuleCount();
    // 计算每个点的长宽
    const tileW = (ratioSize / count).toPrecision(4);
    const tileH = (ratioSize / count).toPrecision(4);

    // preload img
    const loadImage = function (url, callback) {
      const img = new Image();
      img.src = url;
      img.onload = function () {
        callback(this);
        img.onload = null
      };
    }

    //绘制
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        const w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
        const h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
        const foreground = getForeGround({
          row: row, col: col, count: count, options: options
        });
        ctx.fillStyle = this.instance.modules[row][col] ? foreground : options.background;
        ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
      }
    }

    if (options.image) {
      loadImage(options.image, function (img) {
        const x = ((ratioSize - ratioImgSize) / 2).toFixed(2);
        const y = ((ratioSize - ratioImgSize) / 2).toFixed(2);
        ctx.drawImage(img, x, y, ratioImgSize, ratioImgSize);
      });
    }
  }

  createTable() {
    this.canvas = document.createElement('span');
  }

  renderTable(data) {
    this.canvas.innerHTML = "";
    const options = this.options;
    this.instance.initialize(data);
    const count = this.instance.getModuleCount();

    // 计算每个节点的长宽；取整，防止点之间出现分离
    let tileW = Math.floor(options.size / count);
    let tileH = Math.floor(options.size / count);

    if (tileW <= 0) {
      tileW = count < 80 ? 2 : 1;
    }
    if (tileH <= 0) {
      tileH = count < 80 ? 2 : 1;
    }

    //创建table节点
    //重算码大小
    const s = [];
    s.push(`<table style="border:0; margin:0; padding:0; border-collapse:collapse; background-color:${options.background};">`);

    // 绘制二维码
    for (let row = 0; row < count; row++) {
      s.push(`<tr style="border:0; margin:0; padding:0; height:${tileH}px">`);
      for (let col = 0; col < count; col++) {
        const foreground = getForeGround({
          row: row, col: col, count: count, options: options
        });
        if (this.instance.modules[row][col]) {
          s.push(`<td style="border:0; margin:0; padding:0; width:${tileW}px; background-color:${foreground}"></td>`);
        } else {
          s.push(`<td style="border:0; margin:0; padding:0; width:${tileW}px; background-color:${options.background}"></td>`);
        }
      }
      s.push('</tr>');
    }

    s.push('</table>');

    if (options.image) {
      // 计算表格的总大小
      const width = tileW * count;
      const height = tileH * count;
      const x = ((width - options.imageSize) / 2).toFixed(2);
      const y = ((height - options.imageSize) / 2).toFixed(2);
      s.unshift(`<div style='position:relative;
                        width:${width}px;
                        height:${height}px;'>`);
      s.push(`<img src='${options.image}'
                        width='${options.imageSize}'
                        height='${options.imageSize}'
                        style='position:absolute;left:${x}px; top:${y}px;' alt="" />`);
      s.push('</div>');
    }

    this.canvas.innerHTML = s.join('\n');
  }

  createSVG() {
    this.canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  renderSVG(data) {
    const options = this.options;
    this.instance.initialize(data);
    let count = this.instance.getModuleCount();

    this.canvas.setAttribute('width', options.size);
    this.canvas.setAttribute('height', options.size);
    this.canvas.setAttribute('viewBox', `0 0 ${count} ${count}`);

    let scale = count / options.size;
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        let foreground = getForeGround({
          row: row, col: col, count: count, options: options
        });
        rect.setAttribute('x', col);
        rect.setAttribute('y', row);
        rect.setAttribute('width', 1);
        rect.setAttribute('height', 1);
        rect.setAttribute('stroke-width', 0);
        if (this.instance.modules[row][col]) {
          rect.setAttribute('fill', foreground);
        } else {
          rect.setAttribute('fill', options.background);
        }
        this.canvas.appendChild(rect);
      }
    }

    // create image
    if (options.image) {
      let img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.image);
      img.setAttribute('x', ((count - options.imageSize * scale) / 2).toFixed(2));
      img.setAttribute('y', ((count - options.imageSize * scale) / 2).toFixed(2));
      img.setAttribute('width', options.imageSize * scale);
      img.setAttribute('height', options.imageSize * scale);
      this.canvas.appendChild(img);
    }
  }
}
