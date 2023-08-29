"use strict";

if (typeof require !== "undefined") {
  const errorConst = require("./graphErrorConst");
  global.lengthsNotEqualError = errorConst.lengthsNotEqualError;
  global.vectorDataError = errorConst.vectorDataError;
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
  global.defaultZFeatureLabel = dataLabelConst.defaultZFeatureLabel;
  global.defaultAnnotationLabel = dataLabelConst.defaultAnnotationLabel;
  global.defaultVectorLabel = dataLabelConst.defaultVectorLabel;
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


  // z 座標に用いる特徴量の種類を表す文字列です。
  #zFeatureType = defaultZFeatureLabel;

  // その他の特徴量のリストです。
  #otherFeatureList = [];


  // 表示するアノテーションの種類を表す文字列です。
  #annotationType = defaultAnnotationLabel;

  // その他の特徴量のリスト内における、
  // アノテーションの情報を持つ cellMapFeature オブジェクトのインデックスのリストです。
  #annotationIndexList = [];

  // アノテーションの配列です。元データに存在しなければ null です。
  #annotationArray = [];


  // 表示するベクトルの種類を表す文字列です。
  #vectorType = defaultVectorLabel;

  // ベクトルのラベルのリストです。
  #vectorLabelList = [];

  // その他の特徴量のリスト内における、
  // x ベクトルの情報を持つ cellMapFeature オブジェクトのインデックスのリストです。
  #xVectorIndexList = [];

  // x ベクトル と y ベクトルの配列を持つオブジェクトです。
  #vector = {};


  // 各細胞に接続された辺のリストの配列です。
  #edgeListArray = [];

  // 面積でソートした三角形分割の結果です。
  #areaSortedTriangles = new Uint32Array();

  // 最長辺の長さでソートした三角形分割の結果です。
  #longestEdgeSortedTriangles = new Uint32Array();

  // 表示する有効な三角形分割です。
  #enabledTriangles = new Uint32Array();

  // 表示しない無効な三角形分割です。
  #disabledTriangles = new Uint32Array();

  // グラフを構成する辺のリストです。
  #allEdgeList = [];

  // 三角形分割の三角形を除去する Area の閾値 (%) です。
  #areaTriangleThreshPercent = 1;

  // 三角形分割の三角形を除去する LongestEdge の閾値 (%) です。
  #edgeTriangleThreshPercent = 1;


  /**
   * コンストラクターです。
   * 引数の配列の長さは全て等しく、非ゼロであるものを指定します。
   * グラフを構成する辺の有効/無効状態は、
   * 三角形分割の三角形が全く除去されていない状態で保存されているものとします。
   * @param {Array<string>} idArray 細胞名の配列です。
   * @param {Array<Float64Array>} xyArray [[x, y]] の形の 2 次元配列です。
   * @param {Float64Array} potentialArray ポテンシャルの配列です。
   * @param {Array<CellMapFeature>} otherFeatureList
   *     その他 (ポテンシャル以外) の特徴量のリストです。
   * @param {Array<number>} annotationIndexArray その他の特徴量のリスト内における、アノテーションが格納されているインデックスです。
   *     元データに存在しなければ空の配列です。
   * @param {Array<string>} vectorLabelArray その他の特徴量のリスト内において、ベクトルのラベルを格納した配列です。
   *     元データに存在しなければ空の配列です。
   * @param {Array<number>} xVectorIndexArray その他の特徴量のリスト内において、x ベクトルが格納されているインデックスです。
   *     元データに存在しなければ空の配列です。
   * @param {Array<Array<Edge>>} edgeListArray
   *     各細胞に接続された辺のリストの配列です。
   * @param {Uint32Array} areaSortedTriangles
   *     面積でソートした三角形分割の結果です。
   * @param {Uint32Array} longestEdgeSortedTriangles
   *     最長辺の長さでソートした三角形分割の結果です。
   * @param {Array<Edge>} allEdgeList グラフを構成する全ての辺のリストです。
   * @memberof CellMapGraph
   */
  constructor(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList, vectorLabelList, xVectorIndexList, 
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles,
    allEdgeList
  ) {

    // 細胞名の配列の長さと、他の引数配列の長さの一致を確認します。
    // 一致していない場合はエラーとします。
    const nNode = idArray.length;
    const lenXyArrayIsValid = xyArray.length === nNode;
    const lenPotentialArrayIsValid = potentialArray.length === nNode;
    const lenEdgeListArrayIsValid = edgeListArray.length === nNode;
    const vectorDataIsValid = vectorLabelList.length === xVectorIndexList.length;

    if (!(lenXyArrayIsValid && lenPotentialArrayIsValid &&
      lenEdgeListArrayIsValid)) {
      throw lengthsNotEqualError;
    }

    if (!vectorDataIsValid) {
      throw vectorDataError;
    }

    for (const feature of otherFeatureList) {
      if (feature.array.length !== nNode) {
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
    this.#otherFeatureList = otherFeatureList;

    this.#edgeListArray = edgeListArray;
    this.#areaSortedTriangles = areaSortedTriangles;
    this.#longestEdgeSortedTriangles = longestEdgeSortedTriangles;
    this.#allEdgeList = allEdgeList;
    this._updateEnabledTriangles();
    this._updateEnabledEdge();

    // アノテーションに関する処理です。アノテーションが存在する場合は、初期値を設定をします。
    this.#annotationIndexList = annotationIndexList;
    if (this.#annotationIndexList.length !== 0) {
      const defaultIndex = this.#annotationIndexList[0];
      this.#annotationType = this.annotationLabelList[defaultIndex];
      this.#annotationArray = this.#otherFeatureList[defaultIndex].array;
    }
  
    // ベクトルに関する処理です。ベクトルが存在する場合は、初期値を設定します。
    this.#vectorLabelList = vectorLabelList;
    this.#xVectorIndexList = xVectorIndexList;
    if (this.#xVectorIndexList.length !== 0) {
      const defaultIndex = this.#xVectorIndexList[0];
      this.#vectorType = this.#vectorLabelList[0];
      this.#vector = {x: this.#otherFeatureList[defaultIndex].array, y: this.#otherFeatureList[defaultIndex + 1].array};
    }
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
    return this.getZFeatureArrayByName(this.#zFeatureType);
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
   * 細胞種の配列を設定します。データとして存在しない場合 null です。
   *
   * @memberof CellMapGraph
   */
  set annotationArray (annotationType) {

    // アノテーションがない場合は空の配列を設定します。
    if (this.#annotationIndexList.length === 0) {
      this.#annotationArray = [];
      return;
    }

    // その他の特徴量のリストから、アノテーションの配列を取り出します。
    const labelList = this.zFeatureLabelList.slice(1);
    for (let i = 0; i < labelList.length; i++) {
      if (labelList[i] === annotationType) {
        this.#annotationArray = this.#otherFeatureList[i].array;
        return;
      }
    }
  }

  /**
   * x および y ベクトルを取得します。データとして存在しない場合 null です。
   *
   * @readonly
   * @memberof CellMapGraph
   */
    get vector() {
      return this.#vector;
    }

  /**
   * ベクトルを設定します。データとして存在しない場合 null です。
   *
   * @memberof CellMapGraph
   */
  set vector (vectorType) {

    // ベクトルがない場合は空のオブジェクトを設定します。
    if (this.#vectorLabelList.length === 0) {
      this.#vector = {};
      return;
    }

    // その他の特徴量のリストから、アノテーションの配列を取り出します。
    const labelList = this.vectorLabelList;
    for (let i = 0; i < labelList.length; i++) {
      if (labelList[i] === vectorType) {
        const index = this.#xVectorIndexList[i];
        this.#vector = {x: this.#otherFeatureList[index].array, y: this.#otherFeatureList[index + 1].array};
        return;
      }
    }
  }

  /**
   * 細胞種の集合 (重複なし) を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get annotationSet() {
    return new Set(this.annotationArray);
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
   * 名前や x 座標、y 座標を含め、データの属性名のリスト (ヘッダーの内容) を取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get dataLabelList() {
    const result = [idLabel, xLabel, yLabel, potentialLabel];

    for (const feature of this.#otherFeatureList) {
      result.push(feature.name);
    }
    return result;
  }

  /**
   * z 座標となりうる特徴量のラベルのリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get zFeatureLabelList() {
    return this.dataLabelList.slice(3);
  }

  /**
   * アノテーションのラベルのリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
  get annotationLabelList() {
    const result = [];
    for (let i = 0; i < this.#annotationIndexList.length; i++) {
      const index = this.#annotationIndexList[i];
      result.push(this.otherFeatureList[index].name);
    }
    return result;
  }

  /**
   * アノテーションのラベルのリストを取得します。
   *
   * @readonly
   * @memberof CellMapGraph
   */
    get vectorLabelList() {
      return this.#vectorLabelList;
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

    for (const feature of this.otherFeatureList) {
      result.push(feature.array[i]);
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
   * アノテーションの文字列配列を数値化した配列に変換して返す関数です。
   *
   * @param {string} name 特徴量の名前です。
   * @return {Array} 特徴量の値の配列です。
   * @memberof CellMapGraph
   */
  _getAnnotationArrayAsNumber = (name) => {
    this.annotationArray = name;
    const annotationArray = this.annotationArray;
    if (annotationArray.length === 0) return [];
    
    // アノテーションを数値に変換する連想配列を作成します。
    const annotationSet = this.annotationSet;
    const indexDict = {};
    let index = 0;
    for (let annotation of annotationSet) {
      indexDict[annotation] = index;
      index++;
    }

    // アノテーションを数値に置換した配列を返します。
    const valueArray = [];
    for (let value of annotationArray) {
      valueArray.push(indexDict[value]);
    }
    return valueArray;
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
    // ポテンシャルの場合です。
    if (name === potentialLabel) {
      return this.#potentialArray;
    }
 
    // ポテンシャル以外の特徴量の場合です。
    for (const feature of this.#otherFeatureList) {
      if (feature.name !== name) continue;

      // アノテーション以外 (数値) の場合です。
      if (feature.isNumber) {
        return feature.array;
      }
      // アノテーションの場合です。
      else {
        return this._getAnnotationArrayAsNumber(name);
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
   * アノテーションの種類を表す文字列を取得します。
   *
   * @memberof CellMapGraph
   */
  get annotationType() {
    return this.#annotationType;
  }
  
  /**
   * アノテーションに用いる特徴量の種類を表す文字列を設定します
   *
   * @memberof CellMapGraph
   */
  set annotationType (value) {

    //アノテーションに用いようとする特徴量が存在しなければエラーとします。
    if (this.annotationLabelList.length !== 0 &&
       !this.annotationLabelList.includes(value)) {
      throw featureDoesNotExistError(value);
    }

    this.#annotationType = value;
  }

  /**
   * ベクトルの種類を表す文字列を取得します。
   *
   * @memberof CellMapGraph
   */
  get vectorType() {
    return this.#vectorType;
  }
  
  /**
   * ベクトルの種類を表す文字列を設定します
   *
   * @memberof CellMapGraph
   */
  set vectorType (value) {

    //アノテーションに用いようとする特徴量が存在しなければエラーとします。
    if (!this.vectorLabelList.includes(value)) {
      throw featureDoesNotExistError(value);
    }

    this.#vectorType = value;
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

    if (type === areaLabel) this.#areaTriangleThreshPercent = percent;
    else if (type === longestEdgeLabel) this.#edgeTriangleThreshPercent = percent;

    this._updateEnabledTriangles();
    this._updateEnabledEdge();
  }

  /**
   * 三角形の頂点インデックスの配列から要素を 3 つずつ取り出して
   * 長さ 3 の配列のリスト (二次元配列) を返す関数です。
   *
   * @memberof CellMapGraph
   */
  _createListOfTriangles = (array) => {
    const length = array.length / 3;
    // 配列領域を確保します。
    let list = new Array(length);
    for (let i = 0; i < length; i++) {
        list[i] = [array[i * 3], array[i * 3 + 1], array[i * 3 + 2]];
    }
    return list;
  }

  /**
   * 有効な三角形分割と無効な三角形分割を更新します。
   *
   * @memberof CellMapGraph
   */
  _updateEnabledTriangles = () => {

    // 全ての三角形の枚数です。
    const nAllTriangles = this.areaSortedTriangles.length / 3;

    // 除去する閾値が面積 (Area) の場合の、
    // 有効な三角形の枚数です。
    const nAreaTriangles = Math.round(nAllTriangles * (100 - this.#areaTriangleThreshPercent) * 0.01);
    // 有効な三角形の頂点のインデックスを収めた配列です。
    const remainingAreaTriangles = this.#areaSortedTriangles.slice(0, 3 * nAreaTriangles);

    // 除去する閾値が辺の長さ (Edge) の場合の、
    // 有効な三角形の枚数です。
    const nEdgeTriangles = Math.round(nAllTriangles * (100 - this.#edgeTriangleThreshPercent) * 0.01);
    // 有効な三角形の頂点のインデックスを収めた配列です。
    const remainingEdgeTriangles = this.#longestEdgeSortedTriangles.slice(0, 3 * nEdgeTriangles);

    // 除去する閾値が 0% の場合です。
    if (this.#areaTriangleThreshPercent === 0) {
      this.#enabledTriangles = remainingEdgeTriangles;
      this.#disabledTriangles = this.#longestEdgeSortedTriangles.slice(3 * nEdgeTriangles);
      return this.#enabledTriangles;
    }
    else if (this.#edgeTriangleThreshPercent === 0) {
      this.#enabledTriangles = remainingAreaTriangles;
      this.#disabledTriangles = this.#areaSortedTriangles.slice(3 * nAreaTriangles);
      return this.#enabledTriangles;
    }

    // Area と Edge の有効な三角形の枚数の大小に応じて、変数に格納します。
    // 長さ 3 の配列のリストに変換します。
    let longerRemainingTriangels = null;
    let shorterRemainingTriangels = null;

    if (nAreaTriangles <= nEdgeTriangles) {
      longerRemainingTriangels = this._createListOfTriangles(remainingEdgeTriangles);
      shorterRemainingTriangels = this._createListOfTriangles(remainingAreaTriangles);
    }
    else {
      longerRemainingTriangels = this._createListOfTriangles(remainingAreaTriangles);
      shorterRemainingTriangels = this._createListOfTriangles(remainingEdgeTriangles);
    }

    // Area と Edge に共通する有効な三角形の頂点インデックスの配列を求めます。

    // 各配列をソートして文字列化した要素を持つ Set オブジェクトを作成します。
    let longerSet = new Set(longerRemainingTriangels.map(array => array.sort().toString()));

    // 求める配列と要素数のカウンターです。あらかじめ配列領域を確保しておきます。
    let remainingTriangles = new Uint32Array(shorterRemainingTriangels.length * 3);
    let remainingCounter = 0;

    // 共通する要素を取得し、配列に格納していきます。
    for (let array of shorterRemainingTriangels) {
      // 頂点インデックスをソートして文字列化した三角形分割です。
      const triangle = Array.from(array).sort().toString();
      if (longerSet.has(triangle)) {
        remainingTriangles[remainingCounter * 3 + 0] = array[0];
        remainingTriangles[remainingCounter * 3 + 1] = array[1];
        remainingTriangles[remainingCounter * 3 + 2] = array[2];
        remainingCounter++;
      }
    }
    // 不要な配列領域を削除します。
    this.#enabledTriangles = remainingTriangles.slice(0, remainingCounter * 3);

    // 次に、有効な三角形分割の補集合である無効な三角形分割の集合を求めます。

    // 有効な三角形分割を、長さ 3 の配列のリストとして取得します。
    const enabledTriangles = this._createListOfTriangles(this.#enabledTriangles);
    // 各配列をソートして文字列化した要素を持つ Set オブジェクトを作成します。
    const enabledTrianglesSet = new Set(enabledTriangles.map(array => array.sort().toString()));

    // すべての三角形分割を、長さ 3 の配列のリストとして取得します。
    const allTriangles = this._createListOfTriangles(this.areaSortedTriangles);

    // 求める配列と要素数のカウンターです。あらかじめ配列領域を確保しておきます。
    let disabledTriangles = new Uint32Array(nAllTriangles * 3);
    let disabledCounter = 0;

    // すべての三角形分割から、有効な三角形分割を取り除いた配列を作成します。
    for (let array of allTriangles) {
      const triangle = Array.from(array).sort().toString();
      if (! enabledTrianglesSet.has(triangle)) {
        disabledTriangles[disabledCounter * 3 + 0] = array[0];
        disabledTriangles[disabledCounter * 3 + 1] = array[1];
        disabledTriangles[disabledCounter * 3 + 2] = array[2];
        disabledCounter++;
      }
    }
    // 不要な配列領域を削除します。
    this.#disabledTriangles = disabledTriangles.slice(0, disabledCounter * 3);
  }

  /**
   * 閾値の設定に基づく、表示する有効な三角形分割を返します。
   *
   * @memberof CellMapGraph
   */
  get enabledTriangles() {
    return this.#enabledTriangles;
  }

  /**
   * 閾値の設定に基づく、表示しない無効な三角形分割を返します。
   *
   * @memberof CellMapGraph
   */
    get disabledTriangles() {
      return this.#disabledTriangles;
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

    // 無効な三角形分割を取得します。
    const disabledTriangles = this.disabledTriangles;

    // 無効な三角形分割をループしながら、各 half-edge を無効化します。
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
}

if (typeof module !== "undefined") {
  module.exports = CellMapGraph;
}
