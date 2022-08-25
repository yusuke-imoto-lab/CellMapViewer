"use strict";


// 三角形分割の三角形を除去する閾値の種類を表す定数です。

/** @type {string} 三角形の面積を表すラベルです。 */
const areaLabel = "Area";

/** @type {string} 三角形の最長辺を表すラベルです。 */
const longestEdgeLabel = "Longest edge";

/** @type {string} 三角形分割の三角形を除去する
 *      閾値の種類のラベルのリストです。 */
const threshTypeLabelList = [areaLabel, longestEdgeLabel];

if (typeof module !== "undefined") {
  exports.areaLabel = areaLabel;
  exports.longestEdgeLabel = longestEdgeLabel;
  exports.threshTypeLabelList = threshTypeLabelList;
}
