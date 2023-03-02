"use strict";


/**
 * CellMapGraph オブジェクトに含まれる細胞群の統計量を表すクラスです。
 *
 * @class CellMapStats
 */
class CellMapStats {

  // 各特徴量や座標の平均を保持する辞書です。
  #meanDict = {};

  // 各特徴量や座標の分散を保持する辞書です。
  #varianceDict = {};

  // 各特徴量や座標の標準偏差を保持する辞書です。
  #sdDict = {};

  // 各特徴量や座標の変動係数を保持する辞書です。
  #cvDict = {};

  // 各特徴量や座標の最小値、最大値を保持する辞書です。
  #minDict = {};
  #maxDict = {};

  /**
   * コンストラクターです。
   * 
   * @param {CellMapGraph} graph 統計量を計算する細胞群が属するグラフです。
   * @param {Array<number>} indices 統計量を計算する細胞群のグラフにおける
   *     インデックスの配列です。
   * @memberof CellMapStats
   */
  constructor(graph, indices) {

    // 合計値を格納する辞書です。
    const sumDict = {};

    // x、y の合計値と最小値、最大値を計算します。
    sumDict[xLabel] = 0;
    sumDict[yLabel] = 0;
    this.#minDict[xLabel] = Infinity;
    this.#minDict[yLabel] = Infinity;
    this.#maxDict[xLabel] = -Infinity;
    this.#maxDict[yLabel] = -Infinity;
    
    for (const i of indices) {

      const [x, y] = graph.xyArray[i];
      sumDict[xLabel] += x;
      sumDict[yLabel] += y;
      if (this.#minDict[xLabel] > x) this.#minDict[xLabel] = x;
      if (this.#minDict[yLabel] > y) this.#minDict[yLabel] = y;
      if (this.#maxDict[xLabel] < x) this.#maxDict[xLabel] = x;
      if (this.#maxDict[yLabel] < y) this.#maxDict[yLabel] = y;
    }

    // z 座標となりうる特徴量それぞれの合計値と最小値、最大値を計算します。
    for (const zFeatureName of graph.zFeatureLabelList) {

      sumDict[zFeatureName] = 0;
      this.#minDict[zFeatureName] = Infinity;
      this.#maxDict[zFeatureName] = -Infinity;
      const zFeatureArray = graph.getZFeatureArrayByName(zFeatureName);

      for (const i of indices) {

        const value = zFeatureArray[i];
        sumDict[zFeatureName] += value;
        if (this.#minDict[zFeatureName] > value) this.#minDict[zFeatureName] = value;
        if (this.#maxDict[zFeatureName] < value) this.#maxDict[zFeatureName] = value;
      }
    }

    // x、y 座標、z 座標となりうる特徴量の名前のリストを用意します。
    const featureNameList = graph.zFeatureLabelList;
    featureNameList.push(xLabel);
    featureNameList.push(yLabel);

    // 平均値を計算します。
    for (const featureName of featureNameList) {

      this.#meanDict[featureName] = sumDict[featureName] / indices.length;
    }

    // 分散を計算します。

    // 偏差の 2 乗和を格納する辞書です。
    const totalSquaredDeviationSumDict = {};

    // x、y 座標の偏差の 2 乗和を求めます。
    totalSquaredDeviationSumDict[xLabel] = 0;
    totalSquaredDeviationSumDict[yLabel] = 0;
    for (const i of indices) {

      const [x, y] = graph.xyArray[i];
      const xSquaredDeviation = (x - this.#meanDict[xLabel]) ** 2;
      totalSquaredDeviationSumDict[xLabel] += xSquaredDeviation;
      const ySquaredDeviation = (y - this.#meanDict[yLabel]) ** 2;
      totalSquaredDeviationSumDict[yLabel] += ySquaredDeviation;
    }

    // z 座標となりうる特徴量の偏差の 2 乗和を求めます。
    for (const zFeatureName of graph.zFeatureLabelList) {

      totalSquaredDeviationSumDict[zFeatureName] = 0;
      const zFeatureArray = graph.getZFeatureArrayByName(zFeatureName);

      for (const i of indices) {

        const z = zFeatureArray[i];
        const zSquaredDeviation = (z - this.#meanDict[zFeatureName]) ** 2;
        totalSquaredDeviationSumDict[zFeatureName] += zSquaredDeviation;
      }
    }

    // 偏差の 2 乗和を用いて分散を計算します。
    // 同時に、標準偏差、変動係数を計算します。
    for (const featureName of featureNameList) {

      this.#varianceDict[featureName] =
        totalSquaredDeviationSumDict[featureName] / indices.length;
      this.#sdDict[featureName] =
        Math.sqrt(this.#varianceDict[featureName]);
      this.#cvDict[featureName] =
        this.#sdDict[featureName] / this.#meanDict[featureName];
    }
  }

  /**
   * 指定した特徴量または座標の統計量が含まれるかどうかを返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {boolean} 指定した特徴量または座標の統計量が含まれていれば
   *     true です。
   * @memberof CellMapStats
   */
  hasStatsOf = (featureName) => {

    return featureName in this.#meanDict;
  }

  /**
   * 指定した特徴量または座標の平均を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の平均です。
   * @memberof CellMapStats
   */
  getMean = (featureName) => {

    if (featureName in this.#meanDict) {
      return this.#meanDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }

  /**
   * 指定した特徴量または座標の分散を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の分散です。
   * @memberof CellMapStats
   */
  getVariance = (featureName) => {

    if (featureName in this.#varianceDict) {
      return this.#varianceDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }

  /**
   * 指定した特徴量または座標の標準偏差を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の標準偏差です。
   * @memberof CellMapStats
   */
  getSD = (featureName) => {

    if (featureName in this.#sdDict) {
      return this.#sdDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }

  /**
   * 指定した特徴量または座標の変動係数を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の変動係数です。
   * @memberof CellMapStats
   */
  getCV = (featureName) => {

    if (featureName in this.#cvDict) {
      return this.#cvDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }

  /**
   * 指定した特徴量または座標の最小値を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の最小値です。
   * @memberof CellMapStats
   */
  getMin = (featureName) => {

    if (featureName in this.#minDict) {
      return this.#minDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }

  /**
   * 指定した特徴量または座標の最大値を返します。
   *
   * @param {string} featureName 特徴量または座標の名前です。
   * @return {number} 指定した特徴量または座標の最大値です。
   * @memberof CellMapStats
   */
  getMax = (featureName) => {

    if (featureName in this.#maxDict) {
      return this.#maxDict[featureName];
    }
    throw featureDoesNotExistError(featureName);
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapStats;
}
