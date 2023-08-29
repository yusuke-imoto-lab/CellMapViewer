"use strict";


/**
 * 細胞地図の特徴量を表すクラスです。
 *
 * @class CellMapFeature
 */
class CellMapFeature {

  // 特徴量の名前です。
  #name;

  // 特徴量の値 (数値または文字列) の配列です。
  #array;

  // 特徴量が数値であるかを表すフラグです。
  #isNumber;

  /**
   * コンストラクターです。
   * @param {string} name 特徴量の名前です。
   * @param {Float64Array | Array<string>} array 特徴量の値の配列です。
   * @param {Boolean} isNumber 配列が数値か文字列かを表すフラグです。
   * @memberof CellMapFeature
   */
  constructor(name, array, isNumber) {
    this.#name = name;
    this.#array = array;
    this.#isNumber = isNumber;
  }

  /**
   * 特徴量の名前を取得します。
   *
   * @readonly
   * @memberof CellMapFeature
   */
  get name() {
    return this.#name;
  }

  /**
   * 特徴量の値 (数値) の配列を取得します。
   *
   * @readonly
   * @memberof CellMapFeature
   */
  get array() {
    return this.#array;
  }

  /**
   * 特徴量の値が数値か否かを表すフラグを取得します。
   *
   * @readonly
   * @memberof CellMapFeature
   */
  get isNumber() {
    return this.#isNumber;
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapFeature;
}
