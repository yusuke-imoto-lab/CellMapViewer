"use strict";


/**
 * カラー マップを表すクラスです。
 *
 * @class ColorMap
 */
class ColorMap {

  // ラベルです。
  #name;

  // カラー マップに対応付けられる最小、最大の値です。
  // #min => #max という関係を許容します。
  #min;
  #max;

  // #max と #min の差です。両者が等しい場合は Number.MIN_VALUE です。
  #range;

  // 0 ～ 1 の数値を 8 ビットの RGB 配列 ([R, G, B]) に変換する関数です。
  // 引数チェックは行いません。
  #get8bitRgbFrom0to1NumberInner;

  // matplotlib に該当するカラー マップがある場合、
  // その matplotlib における名前です。
  #nameInMatplotlib;

  // matplotlib に該当するカラー マップがある場合、
  // それを反転させるか否かです。
  #reverseInMatplotlib;

  /**
   * コンストラクターです。
   * @param {string} name カラー マップのラベルです。
   * @param {number} min カラー マップに対応付けられる最小の値です。
   *     max 以上の値を許容します。
   * @param {number} max カラー マップに対応付けられる最大の値です。
   *     min 以下の値を許容します。
   * @memberof ColorMap
   */
  constructor(name, min, max) {

    if (! colorMapLabelList.includes(name)) {
      throw invalidColorMapNameError(name);
    }

    this.#name = name;
    this.#min = min;
    this.#max = max;
    this.#range = (min === max ? Number.MIN_VALUE : max - min);

    // Gray blue の場合です。
    if (name === grayBlueLabel) {
      this.#get8bitRgbFrom0to1NumberInner =
        ColorMap.#get8bitGrayBlueFrom0to1Number;
      return;
    }

    // 以下、matplotlib に存在するカラー マップの場合です。

    setNameInMatplotlib.call(this);
    setReverseInMatplotlib.call(this);
    this.#get8bitRgbFrom0to1NumberInner = (number) => {
      return evaluate_cmap(
        number, this.#nameInMatplotlib, this.#reverseInMatplotlib
      );
    };

    // matplotlib における名前をフィールドに設定します。
    function setNameInMatplotlib() {
      switch(name) {
        case viridisLabel:
          this.#nameInMatplotlib = "viridis";
          return;
        case plasmaLabel:
          this.#nameInMatplotlib = "plasma";
          return;
        case gistEarthLabel:
          this.#nameInMatplotlib = "gist_earth";
          return;
        case jetLabel:
          this.#nameInMatplotlib = "jet";
          return;
        case oceanLabel:
          this.#nameInMatplotlib = "ocean";
          return;
        case terrainLabel:
          this.#nameInMatplotlib = "terrain";
          return;
        case coolwarmLabel:
          this.#nameInMatplotlib = "coolwarm";
          return;
        case cubeHelixLabel:
          this.#nameInMatplotlib = "cubehelix";
          return;
        case gistNcarLabel:
          this.#nameInMatplotlib = "gist_ncar";
          return;
        default:
          // ここに到達することはないはずですが、
          // 到達した場合にわかりやすいよう例外を投げます。
          throw colorMapNotImplementedError(name);
      }
    }

    // matplotlib におけるカラー マップを反転させるかをフィールドに設定します。
    function setReverseInMatplotlib() {
      switch(name) {
        case viridisLabel:
          this.#reverseInMatplotlib = false;
          return;
        case plasmaLabel:
          this.#reverseInMatplotlib = false;
          return;
        case gistEarthLabel:
          this.#reverseInMatplotlib = false;
          return;
        case jetLabel:
          this.#reverseInMatplotlib = false;
          return;
        case oceanLabel:
          this.#reverseInMatplotlib = true;
          return;
        case terrainLabel:
          this.#reverseInMatplotlib = false;
          return;
        case coolwarmLabel:
          this.#reverseInMatplotlib = false;
          return;
        case cubeHelixLabel:
          this.#reverseInMatplotlib = false;
          return;
        case gistNcarLabel:
          this.#reverseInMatplotlib = false;
          return;
        default:
          // ここに到達することはないはずですが、
          // 到達した場合にわかりやすいよう例外を投げます。
          throw colorMapNotImplementedError(name);
      }
    }
  }

  /**
   * カラー マップの名前 (ラベル) です。
   *
   * @readonly
   * @memberof ColorMap
   */
  get name() {
    return this.#name;
  }

  /**
   * カラー マップに対応付けられる最小の値です。
   *
   * @readonly
   * @memberof ColorMap
   */
  get min() {
    return this.#min;
  }

  /**
   * カラー マップに対応付けられる最大の値です。
   *
   * @readonly
   * @memberof ColorMap
   */
  get max() {
    return this.#max;
  }

  /**
   * カラー マップに対応付けられる最大の値と最小の値の差です。
   * 両者が等しい場合は Number.MIN_VALUE です。
   *
   * @readonly
   * @memberof ColorMap
   */
  get range() {
    return this.#range;
  }

  /**
   * カラー マップに対応付けられる最小/最大の値を基準にして、
   * 指定した数値に対応する色 ([R, G, B] の形の配列、各色 8 ビット表現)
   * を取得します。
   * 指定した数値が最小/最大の範囲の外側の場合、最小/最大の値に対応する色を返します。
   *
   * @param {number} number 色に変換する値です。
   * @memberof ColorMap
   */
  get8bitRgbAgainstMinMax = (number) => {

    const numberRelativeToMinMax = (number - this.#min) / this.#range;

    const notMinusRelativeNumber = Math.max(0, numberRelativeToMinMax);
    const zeroTo1RelativeNumber = Math.min(1, notMinusRelativeNumber);
    return this.get8bitRgbFrom0to1Number(zeroTo1RelativeNumber);
  }

  /**
   * カラー マップに対応付けられる最小/最大の値を基準にして、
   * 指定した数値に対応する色 ([R, G, B] の形の配列、各色 0 ～ 1 表現)
   * を取得します。
   * 指定した数値が最小/最大の範囲の外側の場合、最小/最大の値に対応する色を返します。
   *
   * @param {number} number 色に変換する値です。
   * @memberof ColorMap
   */
  get0to1RgbAgainstMinMax = (number) => {

    const result = this.get8bitRgbAgainstMinMax(number);
    // RGB の各色を 0 ～ 1 の範囲に直します。
    for (let i = 0; i < 3; i++) {
      result[i] /= 255;
    }
    return result;
  }

  /**
   * カラー マップに対応付けられる最小/最大の値を 0、1 としたときの
   * 指定した数値 (0 ～ 1) に対応する色
   * ([R, G, B] の形の配列、各色 8 ビット表現) を取得します。
   *
   * @param {number} number 色に変換する値 (0 ～ 1) です。
   * @memberof ColorMap
   */
  get8bitRgbFrom0to1Number = (number) => {

    if (number < 0 || 1 < number) {
      throw invalidColorMapValueError;
    }
    const result = this.#get8bitRgbFrom0to1NumberInner(number);
    return result;
  }

  /**
   * カラー マップに対応付けられる最小/最大の値を 0、1 としたときの
   * 指定した数値 (0 ～ 1) に対応する色
   * ([R, G, B] の形の配列、各色 0 ～ 1 表現) を取得します。
   *
   * @param {number} number 色に変換する値 (0 ～ 1) です。
   * @memberof ColorMap
   */
  get0to1RgbFrom0to1Number = (number) => {

    // 引数の範囲チェックは次のメソッドの中で行われます。
    const result = this.get8bitRgbFrom0to1Number(number);

    // RGB の各色を 0 ～ 1 の範囲に直します。
    for (let i = 0; i < 3; i++) {
      result[i] /= 255;
    }
    return result;
  }

  /**
   * 指定した数値 (0 ～ 1) にあたる灰色～青のグラデーション内の色
   * ([R, G, B] の形の配列、各色 8 ビット表現) を取得します。
   *
   * @static
   * @param {number} number 色に変換する値です。
   * @memberof ColorMap
   */
  static #get8bitGrayBlueFrom0to1Number = (number) => {

    const lightGrayPart = (1-number) * 145;
    return [lightGrayPart, lightGrayPart, lightGrayPart + number*255];
  }
}
