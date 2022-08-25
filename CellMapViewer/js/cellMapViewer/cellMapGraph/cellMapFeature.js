"use strict";


/**
 * 細胞地図の特徴量を表すクラスです。
 *
 * @class CellMapFeature
 */
class CellMapFeature {

  // 特徴量の名前です。
  #name;

  // 特徴量の値の配列です。
  #valueArray;

  /**
   * コンストラクターです。
   * @param {string} name 特徴量の名前です。
   * @param {Float64Array} valueArray 特徴量の値の配列です。
   * @memberof CellMapFeature
   */
  constructor(name, valueArray) {
    this.#name = name;
    this.#valueArray = valueArray;
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
   * 特徴量の値の配列を取得します。
   *
   * @readonly
   * @memberof CellMapFeature
   */
  get valueArray() {
    return this.#valueArray;
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapFeature;
}
