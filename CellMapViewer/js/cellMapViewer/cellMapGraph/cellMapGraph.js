"use strict";

if (typeof require !== "undefined") {
  const errorConst = require("./graphErrorConst");
  global.lengthsNotEqualError = errorConst.lengthsNotEqualError;
  global.featureDoesNotExistError = errorConst.featureDoesNotExistError;
  global.invalidThreshTypeError = errorConst.invalidThreshTypeError;
  global.invalidThreshPercentError = errorConst.invalidThreshPercentError;
  global.emptyGraphError = errorConst.emptyGraphError;
  const threshLabelConst = require("./threshTypeLabelConst");
  global.areaLabel = threshLabelConst.areaLabel;
  global.longestEdgeLabel = threshLabelConst.longestEdgeLabel;
  global.threshTypeLabelList = threshLabelConst.threshTypeLabelList;
  const dataLabelConst = require("./dataLabelConst");
  global.idLabel = dataLabelConst.idLabel;
  global.xLabel = dataLabelConst.xLabel;
  global.yLabel = dataLabelConst.yLabel;
  global.potentialLabel = dataLabelConst.potentialLabel;
  global.annotationLabel = dataLabelConst.annotationLabel;
}


/**
 * 細胞地図のグラフ構造を表すクラスです。
 * 座標や特徴量を表すプロパティの配列の i 番目の要素が
 * インデックス i の細胞を表します。
 * ノード数ゼロのグラフは作れません。
 *
 * @class CellMapGraph
 */
class CellMapGraph {

  // ノード数 (細胞数) です。
  #nNode = 0;

  // 細胞名の配列です。
  #idArray = [];

  // [[x, y]] の形の 2 次元配列です。
  #xyArray = [];

  // ポテンシャルの配列です。
  #potentialArray = new Float64Array();

  // 細胞種の配列です。元データに存在しなければ null です。
  #annotationArray = [];

  // 細胞種の種類の集合です。
  #annotationSet = new Set();

  // その他の特徴量のリストです。
  #otherFeatureList = [];

  // 各細胞に接続された辺のリストの配列です。
  #edgeListArray = [];

  // 面積でソートした三角形分割の結果です。
  #areaSortedTriangles = new Uint32Array();

  // 最長辺の長さでソートした三角形分割の結果です。
  #longestEdgeSortedTriangles = new Uint32Array();

  // グラフを構成する辺のリストです。
  #allEdgeList = [];

  // z 座標に用いる特徴量の種類を表す文字列です。
  #zFeatureType = potentialLabel;

  // 三角形分割の三角形を除去する閾値の種類を表す文字列です。
  #triangleThreshType = areaLabel;

  // 三角形分割の三角形を除去する閾値 (%) です。
  #triangleThreshPercent = 0;

  /**
   * コンストラクターです。
   * 引数の配列の長さは全て等しく、非ゼロであるものを指定します。
   * グラフを構成する辺の有効/無効状態は、
   * 三角形分割の三角形が全く除去されていない状態で保存されているものとします。
   * 各辺の zDifference プロパティは zFeatureType 引数に合わせて設定され、
   * halfEdgeFrom1Enabled プロパティと halfEdgeFrom2Enabled プロパティは
   * triangleThreshType 引数と triangleThreshPercent 引数に合わせて
   * 更新されます。
   * @param {Array<string>} idArray 細胞名の配列です。
   * @param {Array<Float64Array>} xyArray [[x, y]] の形の 2 次元配列です。
   * @param {Float64Array} potentialArray ポテンシャルの配列です。
   * @param {Array<string>} annotationArray 細胞種の配列です。
   *     元データに存在しなければ null です。
   * @param {Array<CellMapFeature>} otherFeatureList
   *     その他の特徴量のリストです。
   * @param {Array<Array<Edge>>} edgeListArray
   *     各細胞に接続された辺のリストの配列です。
   * @param {Uint32Array} areaSortedTriangles
   *     面積でソートした三角形分割の結果です。
   * @param {Uint32Array} longestEdgeSortedTriangles
   *     最長辺の長さでソートした三角形分割の結果です。
   * @param {Array<Edge>} allEdgeList グラフを構成する全ての辺のリストです。
   * @param {string} zFeatureType z 座標に用いる特徴量の種類を表す文字列です。
   * @param {string} triangleThreshType 三角形分割の三角形を除去する閾値の
   *     種類を表す文字列です。
   * @param {number} triangleThreshPercent 三角形分割の三角形を除去する
   *     閾値 (%) です。
   * @memberof CellMapGraph
   */
  constructor(
    idArray, xyArray, potentialArray, annotationArray, otherFeatureList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles,
    allEdgeList, zFeatureType, triangleThreshType, triangleThreshPercent
  ) {

    // 細胞名の配列の長さと、他の引数配列の長さの一致を確認します。
    // 一致していない場合はエラーとします。
    const nNode = idArray.length;
    const lenXyArrayIsValid = xyArray.length === nNode;
    const lenPotentialArrayIsValid = potentialArray.length === nNode;
    const lenEdgeListArrayIsValid = edgeListArray.length === nNode;

    if (!(lenXyArrayIsValid && lenPotentialArrayIsValid &&
      lenEdgeListArrayIsValid)) {
      throw lengthsNotEqualError;
    }

    if (annotationArray !== null && annotationArray.length !== nNode) {
      throw lengthsNotEqualError;
    }

    for (const feature of otherFeatureList) {
      if (feature.valueArray.length !== nNode) {
        throw lengthsNotEqualError;
      }
    }

    if (nNode === 0) {
      throw emptyGraphError;
    }

    this.#nNode = nNode;
    this.#idArray = idArray;
    this.#xyArray = xyArray;
    this.#potentialArray = potentialArray;
    this.#annotationArray = annotationArray;
    this.#annotationSet = new Set(annotationArray);
    this.#otherFeatureList = otherFeatureList;
    this.#edgeListArray = edgeListArray;

    this.#areaSortedTriangles = areaSortedTriangles;
    this.#longestEdgeSortedTriangles = longestEdgeSortedTriangles;
    this.#allEdgeList = allEdgeList;
    this.zFeatureType = zFeatureType;
    this.setThreshTypeAndPercent(triangleThreshType, triangleThreshPercent);
  }

  /**
   * ノード数 (細胞数) を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get nNode() {
    return this.#nNode;
  }

  /**
   * 細胞名の配列を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get idArray() {
    return this.#idArray;
  }

  /**
   * x、y 座標を表す [[x, y]] の形の配列を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get xyArray() {
    return this.#xyArray;
  }

  /**
   * 細胞のポテンシャルの配列を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get potentialArray() {
    return this.#potentialArray;
  }

  /**
   * zFeatureType が指す z 座標を表す配列を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get zArray() {
    return this.getZFeatureArrayByName(this.zFeatureType);
  }

  /**
   * 細胞種の配列を取得します。データとして存在しない場合 null です。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get annotationArray() {
    return this.#annotationArray;
  }

  /**
   * 細胞種の集合 (重複なし) を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get annotationSet() {
    return this.#annotationSet;
  }

  /**
   * その他の特徴量のリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get otherFeatureList() {
    return this.#otherFeatureList;
  }

  /**
   * 各細胞に接続された辺のリストの配列を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get edgeListArray() {
    return this.#edgeListArray;
  }

  /**
   * z 座標となりうる特徴量のラベルのリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get zFeatureLabelList() {
    const result = [potentialLabel, annotationLabel];
    for (const feature of this.#otherFeatureList) {
      result.push(feature.name);
    }
    return result;
  }

  /**
   * 名前や x 座標、y 座標を含め、データの属性名のリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get dataLabelList() {
    const result = [idLabel, xLabel, yLabel, potentialLabel];
    if (this.annotationArray !== null) {
      result.push(annotationLabel);
    }
    for (const feature of this.otherFeatureList) {
      result.push(feature.name);
    }
    return result;
  }

  /**
   * 1 個の細胞の情報を dataLabelList 属性の順に格納したリストを返します。
   *
   * @param {number} i 細胞のインデックスです。
   * @memberof CellMapGraph
   */
  getSingleCellInfo = (i) => {
    const result = [];
    result.push(this.idArray[i]);
    result.push(this.xyArray[i][0]);
    result.push(this.xyArray[i][1]);
    result.push(this.potentialArray[i]);
    if (this.annotationArray !== null) {
      result.push(this.annotationArray[i]);
    }
    for (const feature of this.otherFeatureList) {
      result.push(feature.valueArray[i]);
    }
    return result;
  }

  /**
   * 指定したアノテーションをもつ細胞のインデックスの配列を返します。
   * そのアノテーションをもつ細胞がグラフにない場合や
   * アノテーション属性がグラフにない場合は空のリストを返します。
   *
   * @param {string} annotation アノテーションを指定します。
   * @return {Array<number>}
   *     指定したアノテーションをもつ細胞のインデックスのリストです。
   * @memberof CellMapGraph
   */
  getCellsAnnotated = (annotation) => {

    const result = [];

    // アノテーションが存在しなければ空のリストを返します。
    if (this.#annotationArray === null) {
      return result;
    }

    for (let i = 0; i < this.nNode; i++) {

      if (this.#annotationArray[i] === annotation) {
        result.push(i);
      }
    }

    return result;
  }

  /**
   * z 座標となる特徴量の配列を名前で指定して取得します。
   *
   * @param {string} name 特徴量の名前です。
   * @return {Array} 特徴量の値の配列です。
   * @memberof CellMapGraph
   */
  getZFeatureArrayByName = (name) => {

    // name 引数が特徴量を指していなければエラーとします。
    if (!this.zFeatureLabelList.includes(name)) {
      throw featureDoesNotExistError(name);
    }

    if (name === potentialLabel) {
      return this.#potentialArray;
    } else if (name === annotationLabel) {

      // アノテーションがない場合は空の配列を返します。
      if (this.annotationArray === null) return [];

      // アノテーションを抽出します。
      const annotationSet = new Set(this.#annotationArray);
      
      // アノテーションを数値に変換する連想配列を作成します。
      const indexDict = {};
      let index = 0;
      for (let annotation of annotationSet ) {
        indexDict[annotation] = index;
        index++;
      }

      // アノテーションを数値に置換した配列を返します。
      const valueArray = [];
      for (let value of this.#annotationArray) {
        valueArray.push(indexDict[value]);
      }
      return valueArray;

    } else {
      for (const feature of this.#otherFeatureList) {
        if (feature.name === name) {
          return feature.valueArray;
        }
      }
    }
  }

  /**
   * 面積でソートした三角形分割の結果を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get areaSortedTriangles() {
    return this.#areaSortedTriangles;
  }

  /**
   *  最長辺の長さでソートした三角形分割の結果を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get longestEdgeSortedTriangles() {
    return this.#longestEdgeSortedTriangles;
  }

  /**
   * グラフを構成する全ての辺のリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get allEdgeList() {
    return this.#allEdgeList;
  }

  /**
   * z 座標に用いる特徴量の種類を表す文字列を取得します。
   *
   * @memberof CellMapGraph
   */
  get zFeatureType() {
    return this.#zFeatureType;
  }

  /**
   * z 座標に用いる特徴量の種類を表す文字列を変更し、
   * それに合わせて辺の 3 次元の長さを更新します。
   *
   * @memberof CellMapGraph
   */
  set zFeatureType(value) {
    // z 座標に用いようとする特徴量が存在しなければエラーとします。
    if (!this.zFeatureLabelList.includes(value)) {
      throw featureDoesNotExistError(value);
    }

    this.#zFeatureType = value;

    const zFeatureArray = this.getZFeatureArrayByName(value);

    for (const edge of this.#allEdgeList) {
      const z1 = zFeatureArray[edge.iNode1];
      const z2 = zFeatureArray[edge.iNode2];
      edge.zDifference = z1 - z2;
    }
  }

  /**
   * 三角形分割の三角形を除去する閾値の種類を表す文字列を取得します。
   *
   * @memberof CellMapGraph
   */
  get triangleThreshType() {
    return this.#triangleThreshType;
  }

  /**
   * 三角形分割の三角形を除去する閾値の種類を表す文字列を設定します。
   * 有効な辺や三角形が更新されます。
   *
   * @memberof CellMapGraph
   */
  set triangleThreshType(value) {
    // 閾値の種類が不正であればエラーとします。
    if (!threshTypeLabelList.includes(value)) {
      throw invalidThreshTypeError(value);
    }

    this.#triangleThreshType = value;
    this._updateEnabledEdge();
  }

  /**
   * 三角形分割の三角形を除去する閾値 (%) を取得します。
   *
   * @memberof CellMapGraph
   */
  get triangleThreshPercent() {
    return this.#triangleThreshPercent;
  }

  /**
   * 三角形分割の三角形を除去する閾値 (%) を設定します。
   * 有効な辺や三角形が更新されます。
   *
   * @memberof CellMapGraph
   */
  set triangleThreshPercent(value) {
    // 閾値 (%) が [0, 100] の範囲外であればエラーとします。
    if (value < 0 || 100 < value) {
      throw invalidThreshPercentError;
    }

    this.#triangleThreshPercent = value;
    this._updateEnabledEdge();
  }

  /**
   * 三角形分割の三角形を除去する閾値の種類を表す文字列と閾値 (%) を
   * 同時に設定します。有効な辺や三角形が更新されます。
   *
   * @param {str} type 閾値の種類です。
   * @param {number} percent 閾値 (%) です。
   * @memberof CellMapGraph
   */
  setThreshTypeAndPercent = (type, percent) => {
    // 閾値の種類が不正であればエラーとします。
    if (!threshTypeLabelList.includes(type)) {
      throw invalidThreshTypeError(type);
    }
    // 閾値 (%) が [0, 100] の範囲外であればエラーとします。
    if (percent < 0 || 100 < percent) {
      throw invalidThreshPercentError;
    }

    this.#triangleThreshType = type;
    this.#triangleThreshPercent = percent;
    this._updateEnabledEdge();
  }

  /**
   * 閾値の種類によってソートされた三角形分割を返します。
   *
   * @memberof CellMapGraph
   */
  get sortedTriangles() {

    switch (this.#triangleThreshType) {
      case areaLabel:
        return this.#areaSortedTriangles;
      case longestEdgeLabel:
        return this.#longestEdgeSortedTriangles;
      default:
        // ここには到達しないはずですが、到達してしまったときにわかりやすいよう
        // 例外を投げます。
        throw invalidThreshTypeError;
    }
  }

  /**
   * 三角形分割の三角形を除去する閾値に応じて、
   * 辺の有効/無効を更新します。
   *
   * @memberof CellMapGraph
   */
  _updateEnabledEdge = () => {

    // 辺の half-edge の有効/無効状態をリセットします。
    for (const edge of this.allEdgeList) {
      edge.resetEnabledState();
    }

    // 閾値の種類によってソートされた三角形分割を取得します。
    const sortedTriangles = this.sortedTriangles;

    // 閾値変更後に残った (有効な) 三角形の枚数を取得します。
    const nEnabledTriangles = this.nEnabledTriangles;

    // 除去された (無効化された) 三角形分割です。
    const disabledTriangles = sortedTriangles.slice(3 * nEnabledTriangles);

    // 無効化された三角形分割をループしながら、各 half-edge を無効化します。
    for (let i = 0; i < disabledTriangles.length; i += 3) {

      // Half-edge をループするための頂点の配列です。

      // 末尾に 1 番目の頂点を追加して、3 番目の頂点と辺を成すようにします。
      const verticesToIter = [
        disabledTriangles[i],
        disabledTriangles[i + 1],
        disabledTriangles[i + 2],
        disabledTriangles[i]
      ];

      // 3 個の頂点をループします。
      for (let i = 0; i < 3; i++) {

        // 頂点のノードのインデックスです。
        const vertex = verticesToIter[i];

        // 三角形における次の頂点のノードのインデックスです。
        const nextVertex = verticesToIter[i + 1];

        // 頂点のノードにつながった辺のリストです。
        const edgeFromVertexList = this.edgeListArray[vertex];

        // この辺の中から、上記 2 ノードをつなぐ辺を探します。
        for (const edge of edgeFromVertexList) {

          // 辺が目的の辺であるかを調べます。
          // vertex を含むことはわかっているので、
          // nextVertex を含む辺が目的の辺です。
          switch (edge.whichNodeIs(nextVertex)) {
            // 目的の辺でなかった場合は次の辺を調べます。
            case 0:
              continue;
            // 目的の辺だった場合です。
            // Half-edge を無効化します。
            // edge のノードその 2 からその 1 に向かう辺だった場合です。
            case 1:
              edge.halfEdgeFrom2Enabled = false;
              break;
            // edge のノードその 1 からその 2 に向かう辺だった場合です。
            case 2:
              edge.halfEdgeFrom1Enabled = false;
              break;
            default:
            // ここには到達しないはずです。
          }
        }
      }
    }
  }

  /**
   * 三角形分割の三角形を除去する閾値に応じて、
   * 残った三角形の数 (枚数) を返します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get nEnabledTriangles() {

    // 全ての三角形の枚数です。
    const nAllTriangles = this.areaSortedTriangles.length / 3;

    // 残る三角形の割合です。
    const remainingRatio = (100 - this.triangleThreshPercent) / 100;

    // 有効な三角形の枚数です。
    return Math.round(nAllTriangles * remainingRatio);
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapGraph;
}
