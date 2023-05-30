import { QRMath } from './QRMath';
import QRPolynomial from './QRPolynomial';
/**
 * 获取单个字符的utf8编码
 * unicode BMP平面约65535个字符
 * @param {num} code
 * return {array}
 */
export function unicodeFormat8(code) {
    // 1 byte
    let c0, c1, c2;
    if (code < 128) {
        return [code];
        // 2 bytes
    } else if (code < 2048) {
        c0 = 192 + (code >> 6);
        c1 = 128 + (code & 63);
        return [c0, c1];
        // 3 bytes
    } else {
        c0 = 224 + (code >> 12);
        c1 = 128 + ((code >> 6) & 63);
        c2 = 128 + (code & 63);
        return [c0, c1, c2];
    }
}

/**
 * 获取字符串的utf8编码字节串
 * @param {string} string
 * @return {array}
 */
export function getUTF8Bytes(string) {
    const utf8codes = [];
    for (let i = 0; i < string.length; i++) {
        const code = string.charCodeAt(i);
        const utf8 = unicodeFormat8(code);
        for (let j = 0; j < utf8.length; j++) {
            utf8codes.push(utf8[j]);
        }
    }
    return utf8codes;
}

export const QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7,
};

export const QRUtil = {
    PATTERN_POSITION_TABLE: [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170],
    ],
    G15:
        (1 << 10) |
        (1 << 8) |
        (1 << 5) |
        (1 << 4) |
        (1 << 2) |
        (1 << 1) |
        (1 << 0),
    G18:
        (1 << 12) |
        (1 << 11) |
        (1 << 10) |
        (1 << 9) |
        (1 << 8) |
        (1 << 5) |
        (1 << 2) |
        (1 << 0),
    G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),

    /*
	BCH编码格式信息
	 */
    getBCHTypeInfo: function (data) {
        let d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^=
                QRUtil.G15 <<
                (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15));
        }
        return ((data << 10) | d) ^ QRUtil.G15_MASK;
    },
    /*
	BCH编码版本信息
	 */
    getBCHTypeNumber: function (data) {
        let d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^=
                QRUtil.G18 <<
                (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18));
        }
        return (data << 12) | d;
    },
    /*
	获取BCH位信息
	 */
    getBCHDigit: function (data) {
        let digit = 0;

        while (data != 0) {
            digit++;
            data >>>= 1;
        }

        return digit;
    },
    /*
	获取版本对应的矫正图形位置
	 */
    getPatternPosition: function (typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    /*
	掩膜算法
	 */
    getMask: function (maskPattern, i, j) {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return (i + j) % 2 == 0;
            case QRMaskPattern.PATTERN001:
                return i % 2 == 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 == 0;
            case QRMaskPattern.PATTERN011:
                return (i + j) % 3 == 0;
            case QRMaskPattern.PATTERN100:
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case QRMaskPattern.PATTERN101:
                return ((i * j) % 2) + ((i * j) % 3) == 0;
            case QRMaskPattern.PATTERN110:
                return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
            case QRMaskPattern.PATTERN111:
                return (((i * j) % 3) + ((i + j) % 2)) % 2 == 0;

            default:
                throw new Error('bad maskPattern:' + maskPattern);
        }
    },
    /*
	获取RS的纠错多项式
	 */
    getErrorCorrectPolynomial: function (errorCorrectLength) {
        let a = new QRPolynomial([1], 0);

        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }

        return a;
    },
    /*
	获取评价
	 */
    getLostPoint: function (qrCode) {
        const moduleCount = qrCode.getModuleCount();
        let lostPoint = 0;
        let darkCount = 0;

        for (let row = 0; row < moduleCount; row++) {
            let sameCount = 0;
            let head = qrCode.modules[row][0];

            for (let col = 0; col < moduleCount; col++) {
                const current = qrCode.modules[row][col];

                //level 3 评价
                if (col < moduleCount - 6) {
                    if (
                        current &&
                        !qrCode.modules[row][col + 1] &&
                        qrCode.modules[row][col + 2] &&
                        qrCode.modules[row][col + 3] &&
                        qrCode.modules[row][col + 4] &&
                        !qrCode.modules[row][col + 5] &&
                        qrCode.modules[row][col + 6]
                    ) {
                        if (col < moduleCount - 10) {
                            if (
                                qrCode.modules[row][col + 7] &&
                                qrCode.modules[row][col + 8] &&
                                qrCode.modules[row][col + 9] &&
                                qrCode.modules[row][col + 10]
                            ) {
                                lostPoint += 40;
                            }
                        } else if (col > 3) {
                            if (
                                qrCode.modules[row][col - 1] &&
                                qrCode.modules[row][col - 2] &&
                                qrCode.modules[row][col - 3] &&
                                qrCode.modules[row][col - 4]
                            ) {
                                lostPoint += 40;
                            }
                        }
                    }
                }

                //level 2 评价
                if (row < moduleCount - 1 && col < moduleCount - 1) {
                    let count = 0;
                    if (current) count++;
                    if (qrCode.modules[row + 1][col]) count++;
                    if (qrCode.modules[row][col + 1]) count++;
                    if (qrCode.modules[row + 1][col + 1]) count++;
                    if (count == 0 || count == 4) {
                        lostPoint += 3;
                    }
                }

                //level 1 评价
                if (head ^ current) {
                    sameCount++;
                } else {
                    head = current;
                    if (sameCount >= 5) {
                        lostPoint += 3 + sameCount - 5;
                    }
                    sameCount = 1;
                }

                //level 4 评价
                if (current) {
                    darkCount++;
                }
            }
        }

        for (let col = 0; col < moduleCount; col++) {
            let sameCount = 0;
            let head = qrCode.modules[0][col];

            for (let row = 0; row < moduleCount; row++) {
                const current = qrCode.modules[row][col];

                //level 3 评价
                if (row < moduleCount - 6) {
                    if (
                        current &&
                        !qrCode.modules[row + 1][col] &&
                        qrCode.modules[row + 2][col] &&
                        qrCode.modules[row + 3][col] &&
                        qrCode.modules[row + 4][col] &&
                        !qrCode.modules[row + 5][col] &&
                        qrCode.modules[row + 6][col]
                    ) {
                        if (row < moduleCount - 10) {
                            if (
                                qrCode.modules[row + 7][col] &&
                                qrCode.modules[row + 8][col] &&
                                qrCode.modules[row + 9][col] &&
                                qrCode.modules[row + 10][col]
                            ) {
                                lostPoint += 40;
                            }
                        } else if (row > 3) {
                            if (
                                qrCode.modules[row - 1][col] &&
                                qrCode.modules[row - 2][col] &&
                                qrCode.modules[row - 3][col] &&
                                qrCode.modules[row - 4][col]
                            ) {
                                lostPoint += 40;
                            }
                        }
                    }
                }

                //level 1 评价
                if (head ^ current) {
                    sameCount++;
                } else {
                    head = current;
                    if (sameCount >= 5) {
                        lostPoint += 3 + sameCount - 5;
                    }
                    sameCount = 1;
                }
            }
        }

        // LEVEL4

        const ratio =
            Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;
    },
};
