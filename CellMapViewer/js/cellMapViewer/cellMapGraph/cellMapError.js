"use strict";


/**
 * 細胞地図に関する例外を表すクラスです。
 *
 * @class CellMapError
 */
class CellMapError extends Error {

  /**
   * コンストラクターです。
   * @param {*} params
   * @memberof CellMapError
   */
  constructor(...params) {
    super(...params);
    this.name = "CellMapError";
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapError;
}
