import QRBitBuffer from './QRBitBuffer';
import QRPolynomial from './QRPolynomial';
import { QRUtil, getUTF8Bytes } from './QRUtil';

const QRErrorCorrectLevel = [1, 0, 3, 2];

/*
二维码各个版本信息[块数, 每块中的数据块数, 每块中的信息块数]
 */
const RS_BLOCK_TABLE = [
    // L
    // M
    // Q
    // H

    // 1
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],

    // 2
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],

    // 3
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],

    // 4
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],

    // 5
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],

    // 6
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],

    // 7
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],

    // 8
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],

    // 9
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],

    // 10
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],

    // 11
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],

    // 12
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],

    // 13
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],

    // 14
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],

    // 15
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],

    // 16
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],

    // 17
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],

    // 18
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],

    // 19
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],

    // 20
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],

    // 21
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],

    // 22
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],

    // 23
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],

    // 24
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],

    // 25
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],

    // 26
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],

    // 27
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],

    // 28
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],

    // 29
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],

    // 30
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],

    // 31
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],

    // 32
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],

    // 33
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],

    // 34
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],

    // 35
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],

    // 36
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],

    // 37
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],

    // 38
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],

    // 39
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],

    // 40
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16],
];

class QRCodeAlg {
    constructor(data, errorCorrectLevel) {
        this.typeNumber = -1; //版本
        this.modules = null; //二维矩阵，存放最终结果
        this.moduleCount = 0; //矩阵大小
        this.dataCache = null; //数据缓存
        this.rsBlocks = null; //版本数据信息
        this.totalDataCount = -1; //可使用的数据量

        if (data && errorCorrectLevel) {
            this.initialize(data, errorCorrectLevel);
        }
    }

    initialize(data, errorCorrectLevel = 3) {
        this.data = data;
        this.errorCorrectLevel = errorCorrectLevel;
        this.utf8bytes = getUTF8Bytes(data);
        this.make();
    }

    /**
     * 获取二维码矩阵大小
     * @return {num} 矩阵大小
     */
    getModuleCount() {
        return this.moduleCount;
    }

    /**
     * 编码
     */
    make() {
        this.getRightType();
        this.dataCache = this.createData();
        this.createQrcode();
    }

    /**
     * 设置二位矩阵功能图形
     * @param  {bool} test 表示是否在寻找最好掩膜阶段
     * @param  {num} maskPattern 掩膜的版本
     */
    makeImpl(maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);

        for (let row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(true, maskPattern);

        if (this.typeNumber >= 7) {
            this.setupTypeNumber(true);
        }
        this.mapData(this.dataCache, maskPattern);
    }

    /**
     * 设置二维码的位置探测图形
     * @param  {num} row 探测图形的中心横坐标
     * @param  {num} col 探测图形的中心纵坐标
     */
    setupPositionProbePattern(row, col) {
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) continue;

            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c) continue;

                if (
                    (0 <= r && r <= 6 && (c == 0 || c == 6)) ||
                    (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
                    (2 <= r && r <= 4 && 2 <= c && c <= 4)
                ) {
                    this.modules[row + r][col + c] = true;
                } else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    }

    /**
     * 创建二维码
     * @return {[type]} [description]
     */
    createQrcode() {
        let minLostPoint = 0;
        let pattern = 0;
        let bestModules = null;

        for (let i = 0; i < 8; i++) {
            this.makeImpl(i);

            const lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
                bestModules = this.modules;
            }
        }
        this.modules = bestModules;
        this.setupTypeInfo(false, pattern);

        if (this.typeNumber >= 7) {
            this.setupTypeNumber(false);
        }
    }

    /**
     * 设置定位图形
     * @return {[type]} [description]
     */
    setupTimingPattern() {
        for (let r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = r % 2 == 0;

            if (this.modules[6][r] != null) {
                continue;
            }
            this.modules[6][r] = r % 2 == 0;
        }
    }

    /**
     * 设置矫正图形
     * @return {[type]} [description]
     */
    setupPositionAdjustPattern() {
        const pos = QRUtil.getPatternPosition(this.typeNumber);

        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                const row = pos[i];
                const col = pos[j];

                if (this.modules[row][col] != null) {
                    continue;
                }

                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (
                            r == -2 ||
                            r == 2 ||
                            c == -2 ||
                            c == 2 ||
                            (r == 0 && c == 0)
                        ) {
                            this.modules[row + r][col + c] = true;
                        } else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }

    /**
     * 设置版本信息（7以上版本才有）
     * @param  {bool} test 是否处于判断最佳掩膜阶段
     * @return {[type]}      [description]
     */
    setupTypeNumber(test) {
        const bits = QRUtil.getBCHTypeNumber(this.typeNumber);

        for (let i = 0; i < 18; i++) {
            const mod = !test && ((bits >> i) & 1) == 1;
            this.modules[Math.floor(i / 3)][
                (i % 3) + this.moduleCount - 8 - 3
            ] = mod;
            this.modules[(i % 3) + this.moduleCount - 8 - 3][
                Math.floor(i / 3)
            ] = mod;
        }
    }

    /**
     * 设置格式信息（纠错等级和掩膜版本）
     * @param  {bool} test
     * @param  {num} maskPattern 掩膜版本
     * @return {}
     */
    setupTypeInfo(test, maskPattern) {
        const data =
            (QRErrorCorrectLevel[this.errorCorrectLevel] << 3) | maskPattern;
        const bits = QRUtil.getBCHTypeInfo(data);

        // vertical
        for (let i = 0; i < 15; i++) {
            const modVertical = !test && ((bits >> i) & 1) == 1;

            if (i < 6) {
                this.modules[i][8] = modVertical;
            } else if (i < 8) {
                this.modules[i + 1][8] = modVertical;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = modVertical;
            }

            // horizontal
            const modHorizontal = !test && ((bits >> i) & 1) == 1;

            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = modHorizontal;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = modHorizontal;
            } else {
                this.modules[8][15 - i - 1] = modHorizontal;
            }
        }

        // fixed module
        this.modules[this.moduleCount - 8][8] = !test;
    }

    createData() {
        const buffer = new QRBitBuffer();
        const lengthBits = this.typeNumber > 9 ? 16 : 8;
        buffer.put(4, 4); //添加模式
        buffer.put(this.utf8bytes.length, lengthBits);
        for (let i = 0, l = this.utf8bytes.length; i < l; i++) {
            buffer.put(this.utf8bytes[i], 8);
        }
        if (buffer.length + 4 <= this.totalDataCount * 8) {
            buffer.put(0, 4);
        }

        // padding
        while (buffer.length % 8 != 0) {
            buffer.putBit(false);
        }

        // padding
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (buffer.length >= this.totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeAlg.PAD0, 8);

            if (buffer.length >= this.totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeAlg.PAD1, 8);
        }
        return this.createBytes(buffer);
    }

    createBytes(buffer) {
        let offset = 0;

        let maxDcCount = 0;
        let maxEcCount = 0;

        const length = this.rsBlock.length / 3;

        const rsBlocks = new Array();

        for (let i = 0; i < length; i++) {
            const count = this.rsBlock[i * 3 + 0];
            const totalCount = this.rsBlock[i * 3 + 1];
            const dataCount = this.rsBlock[i * 3 + 2];

            for (let j = 0; j < count; j++) {
                rsBlocks.push([dataCount, totalCount]);
            }
        }

        const dcdata = new Array(rsBlocks.length);
        const ecdata = new Array(rsBlocks.length);

        for (let r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r][0];
            const ecCount = rsBlocks[r][1] - dcCount;

            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);

            dcdata[r] = new Array(dcCount);

            for (let i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            }
            offset += dcCount;

            const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

            const modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
            }
        }

        const data = new Array(this.totalDataCount);
        let index = 0;

        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }

        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }

        return data;
    }

    mapData(data, maskPattern) {
        let inc = -1;
        let row = this.moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;

        for (let col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        let dark = false;

                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
                        }

                        const mask = QRUtil.getMask(maskPattern, row, col - c);

                        if (mask) {
                            dark = !dark;
                        }

                        this.modules[row][col - c] = dark;
                        bitIndex--;

                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }

                row += inc;

                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }

    getRightType() {
        for (let typeNumber = 1; typeNumber < 41; typeNumber++) {
            const rsBlock =
                RS_BLOCK_TABLE[(typeNumber - 1) * 4 + this.errorCorrectLevel];
            if (rsBlock == undefined) {
                throw new Error(
                    'bad rs block @ typeNumber:' +
                        typeNumber +
                        '/errorCorrectLevel:' +
                        this.errorCorrectLevel
                );
            }
            const length = rsBlock.length / 3;
            let totalDataCount = 0;
            for (let i = 0; i < length; i++) {
                const count = rsBlock[i * 3 + 0];
                const dataCount = rsBlock[i * 3 + 2];
                totalDataCount += dataCount * count;
            }

            const lengthBytes = typeNumber > 9 ? 2 : 1;
            if (
                this.utf8bytes.length + lengthBytes < totalDataCount ||
                typeNumber == 40
            ) {
                this.typeNumber = typeNumber;
                this.rsBlock = rsBlock;
                this.totalDataCount = totalDataCount;
                break;
            }
        }
    }
}

/**
 * 填充字段
 */
QRCodeAlg.PAD0 = 0xec;
QRCodeAlg.PAD1 = 0x11;

export default QRCodeAlg;
