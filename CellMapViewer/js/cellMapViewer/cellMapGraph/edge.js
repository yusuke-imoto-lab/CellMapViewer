"use strict";

if (typeof require !== "undefined") {
  const errorConst = require("./graphErrorConst");
  global.negativeNodeIndexError = errorConst.negativeNodeIndexError;
  global.negativeLengthError = errorConst.negativeLengthError;
  global.doesNotContainNodeError = errorConst.doesNotContainNodeError;
}


/**
 * 細胞地図のグラフの辺 (ループは認めません) を表すクラスです。
 *
 * @class Edge
 */
class Edge {

  // 辺でつながれたノードその 1 が表す細胞のインデックスです。
  #iNode1;

  // 辺でつながれたノードその 2 が表す細胞のインデックスです。
  #iNode2;

  // ノードその 1 から伸びる half-edge が有効かを表す真偽値の保存された値です。
  #savedHalfEdgeFrom1Enabled;

  // ノードその 2 から伸びる half-edge が有効かを表す真偽値の保存された値です。
  #savedHalfEdgeFrom2Enabled;

  // x および y 座標のみを考慮した辺の 2 次元の長さの 2 乗です。
  #len2dSquared;

  /**
   * コンストラクターです。
   * @param {number} iNode1
   *     辺でつながれたノードその 1 が表す細胞のインデックスです。非負整数値です。
   * @param {number} iNode2
   *     辺でつながれたノードその 2 が表す細胞のインデックスです。非負整数値です。
   * @param {boolean} halfEdgeFrom1Enabled
   *     辺でつながれたノードその 1 から伸びる half-edge が有効かを表します。
   * @param {boolean} halfEdgeFrom2Enabled
   *     辺でつながれたノードその 2 から伸びる half-edge が有効かを表します。
   * @param {number} len2dSquared
   *     x および y 座標のみを考慮した 2 次元の辺の長さの 2 乗です。
   * @param {number} zDifference
   *     ノードの z 座標の差です。ノードその 1 の z 座標の方が大きければ正です。
  *      z 座標を考慮しない場合は undefined です。
   * @memberof Edge
   */
  constructor(
    iNode1, iNode2, halfEdgeFrom1Enabled, halfEdgeFrom2Enabled,
    len2dSquared, zDifference
  ) {
    // ループである場合はエラーとします。
    if (iNode1 === iNode2) {
      throw isLoopError;
    }

    // ノードのインデックスが負である場合はエラーとします。
    if (iNode1 < 0 || iNode2 < 0) {
      throw negativeNodeIndexError;
    }

    // 長さの値が負の場合はエラーとします。
    if (len2dSquared < 0) {
      throw negativeLengthError;
    }

    this.#iNode1 = iNode1;
    this.#iNode2 = iNode2;
    this.halfEdgeFrom1Enabled = halfEdgeFrom1Enabled;
    this.halfEdgeFrom2Enabled = halfEdgeFrom2Enabled;
    this.#len2dSquared = len2dSquared;
    this.zDifference = zDifference;
  }

  /**
   * 辺でつながれたノードその 1 が表す細胞のインデックスを取得します。
   *
   * @readonly
   * @memberof Edge
   */
  get iNode1() {
    return this.#iNode1;
  }

  /**
   * 辺でつながれたノードその 1 が表す細胞のインデックスを取得します。
   *
   * @readonly
   * @memberof Edge
   */
  get iNode2() {
    return this.#iNode2;
  }

  /**
   * 辺が有効かを表す真偽値を取得します。
   * 辺を構成する half-edge のどちらか一方でも有効であれば true、
   * それ以外の場合は false です。
   *
   * @readonly
   * @memberof Edge
   */
  get enabled() {
    return this.halfEdgeFrom1Enabled || this.halfEdgeFrom2Enabled;
  }

  /**
   * x および y 座標のみを考慮した 2 次元の辺の長さの 2 乗を取得します。
   *
   * @readonly
   * @memberof Edge
   */
  get len2dSquared() {
    return this.#len2dSquared;
  }

  /**
   * x、y、z 座標を考慮した 3 次元の辺の長さの 2 乗を取得します。
   *
   * @readonly
   * @memberof Edge
   */
  get len3dSquared() {
    return this.#len2dSquared + this.zDifference**2;
  }

  /**
   * あるノード (細胞) がどちらの端点であるかを調べます。
   *
   * @param {number} i 調べたいノード (細胞) を表すインデックスです。
   * @return {number}
   *     ノード i がこの辺の iNode1 であれば 1、iNode2 であれば 2、
   *     どちらでもなければ 0 です。
   * @memberof Edge
   */
   whichNodeIs = (i) => {
    if (this.#iNode1 === i) {
      return 1;
    }
    else if (this.#iNode2 === i) {
      return 2;
    }
    else {
      return 0;
    }
  }

  /**
   * 辺のどちらかのノードの反対側のノードを取得します。
   * 指定したノードが辺に含まれない場合エラーとなります。
   *
   * @param {number} i 指定したノードの反対側のノードを取得します。
   * @return {number} 反対側のノードを表すインデックスです。
   * @memberof Edge
   */
  getOppositeNode = (i) => {

    switch (i) {
      case this.#iNode1:
        return this.#iNode2;
      case this.#iNode2:
        return this.#iNode1;
      default:
        throw doesNotContainNodeError(i);
    }
  }

  /**
   * 各 half-edge の有効/無効状態を保存します。
   *
   * @memberof Edge
   */
  saveEnabledState = () => {

    this.#savedHalfEdgeFrom1Enabled = this.halfEdgeFrom1Enabled;
    this.#savedHalfEdgeFrom2Enabled = this.halfEdgeFrom2Enabled;
  }

  /**
   * 各 half-edge の有効/無効状態を保存された値にリセットします。
   *
   * @memberof Edge
   */
  resetEnabledState = () => {

    this.halfEdgeFrom1Enabled = this.#savedHalfEdgeFrom1Enabled;
    this.halfEdgeFrom2Enabled = this.#savedHalfEdgeFrom2Enabled;
  }
}

if (typeof module !== "undefined") {
  module.exports = Edge;
}
