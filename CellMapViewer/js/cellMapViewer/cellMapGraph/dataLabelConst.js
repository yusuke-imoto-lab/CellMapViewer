"use strict";


// データの値の種類のラベルを表す定数を定義します。

/** @type {string} 細胞名を表すラベルです。 */
const idLabel = "CellID";

/** @type {string} x 座標を表すラベルです。 */
const xLabel = "X";

/** @type {string} y 座標を表すラベルです。 */
const yLabel = "Y";

/** @type {string} 細胞のポテンシャルを表すラベルです。 */
const potentialLabel = "Potential";

/** @type {string} z 座標に用いる特徴量の種類の既定値です。 */
const defaultZFeatureLabel = potentialLabel;

/** @type {string} 着色に用いる特徴量の種類の既定値です。 */
const defaultColorFeatureLabel = defaultZFeatureLabel;

/** @type {string} 細胞種を表すラベルです。 */
const annotationLabel = "Annotation";

if (typeof module !== "undefined") {
  exports.idLabel = idLabel;
  exports.xLabel = xLabel;
  exports.yLabel = yLabel;
  exports.potentialLabel = potentialLabel;
  exports.defaultZFeatureLabel = defaultZFeatureLabel;
  exports.defaultColorFeatureLabel = defaultColorFeatureLabel;
  exports.annotationLabel = annotationLabel;
}
