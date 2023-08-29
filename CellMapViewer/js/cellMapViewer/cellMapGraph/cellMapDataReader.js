"use strict;"


if (typeof require !== "undefined") {
  global.Papa = require("../../libs/PapaParse/papaparse.min.js");
  const errorConst = require("./graphErrorConst");
  global.emptyHeaderColError = errorConst.emptyHeaderColError;
  global.redundantColNameError = errorConst.redundantColNameError;
  global.vectorColumnsAreNotPairedError = errorConst.vectorColumnsAreNotPairedError;
  global.columnDoesNotExistError = errorConst.columnDoesNotExistError;
  global.jaggedCsvError = errorConst.jaggedCsvError;
  global.notFiniteNumberError = errorConst.notFiniteNumberError;
  global.CellMapGraph = require("./cellMapGraph");
  global.CellMapFeature = require("./cellMapFeature");
  global.Edge = require("./edge");
  const labelConst = require("./dataLabelConst");
  global.idLabel = labelConst.idLabel;
  global.xLabel = labelConst.xLabel;
  global.yLabel = labelConst.yLabel;
  global.potentialLabel = labelConst.potentialLabel;
  global.defaultZFeatureLabel = labelConst.defaultZFeatureLabel;
  global.annotationLabelPattern = labelConst.annotationLabelPattern;
  global.xVectorLabelPattern = labelConst.xVectorLabelPattern;
  global.yVectorLabelPattern = labelConst.yVectorLabelPattern;
  global.Delaunator = require("../../libs/delaunator/delaunator.min.js");
}


/**
 * 細胞地図の入力データを読み取るためのクラスです。
 *
 * @class CellMapDataReader
 */
class CellMapDataReader {

  /**
   * CSV ファイルを読み込んで結果となる CellMapGraph オブジェクトを
   * resolve に渡す Promise オブジェクトを返します。
   *
   * @static
   * @param {File} file CSV ファイルを表す File オブジェクトです。
   * @return {Promise} CSV ファイルを読み込んで
   *     結果となる CellMapGraph オブジェクトを resolve に渡す
   *     Promise オブジェクトです。
   * @memberof CellMapDataReader
   */
  static readCsvPromise = (file) => {
    return new Promise((resolve, reject) => {

      // 読み込み完了時の動作を定義します。
      const completeFunc = (results) => {
        // 読み込みが完了したら CellMapGraph オブジェクトに構造化し、
        // resolve に渡します。
        try {
          const cellMapGraph = this.read2dArray(results.data);
          resolve(cellMapGraph);
        }
        // 構造化に失敗した場合です。
        catch (error) {
          reject(error);
        }
      };

      // ファイル読み込み時に FileReader がエラーを出した場合の
      // 動作を定義します。
      const errorFunc = (error) => {
        reject(fileReaderError(error));
      };

      // 読み込み時の設定オブジェクトです。
      // 文字コードを設定しないので、UTF-8 として解釈されます。
      const config = {
        // 区切り文字はカンマのみとします。
        delimiter: ",",
        // 数字は数値データに変換します。
        dynamicTyping: true,
        // 空行や空白文字のみから成る行をスキップします。
        skipEmptyLines: "greedy",
        // 定義済みの完了時動作です。
        complete: completeFunc,
        // 定義済みのエラー時動作です。
        error: errorFunc
      };

      // 読み込みます。
      Papa.parse(file, config);
    });
  }

  /**
   * 2 次元配列を読み込み、CellMapGraph オブジェクトに構造化します。
   *
   * @static
   * @param {Array<Array<object>>} array 読み込む 2 次元配列です。
   * @return {CellMapGraph} 2 次元配列が表す細胞地図のグラフです。
   * @memberof CellMapDataReader
   */
  static read2dArray = (array) => {

    // ヘッダー行です。
    const header = array[0];
    // 列数です。
    const nCol = header.length;

    // 列名が重複している場合はエラーとします。
    const uniqueColNameSet = new Set(header);
    const nUniqueColName = uniqueColNameSet.size;
    if (nCol !== nUniqueColName) {
      throw redundantColNameError;
    }

    // 各列のインデックスです。次のループで取得します。
    const iIdCol = 0;         // CellID
    let iXCol = null;         // X
    let iYCol = null;         // Y
    let iPotentialCol = null; // Potential

    // その他の特徴量の列インデックスです。
    const iOtherFeatureColList = [];
    // アノテーションの列インデックスです。
    const iAnnotationColList = []; 
    // ベクトルの列インデックスです。
    const iXVectorColList = []; 
    const iYVectorColList = []; 

    // ヘッダーの 2 列目以降をループし、上記各列のインデックスを取得します。
    for (let iCol = 1; iCol < nCol; iCol++) {

      // 列名です。空白文字、大文字小文字の違いは無視します。
      if (header[iCol] === null) throw emptyHeaderColError;
      const colName = header[iCol].toLowerCase().replace(/\s+/g, "");

      switch (colName) {
        case xLabel.toLowerCase():
          iXCol = iCol;
          break;
        case yLabel.toLowerCase():
          iYCol = iCol;
          break;
        case potentialLabel.toLowerCase():
          iPotentialCol = iCol;
          break;
        default:
          // その他の特徴量として登録し、さらにアノテーション列かベクトル列であるかを調べます。
          iOtherFeatureColList.push(iCol);
          if (this._checkAnnotationLabel(colName)) iAnnotationColList.push(iCol);
          else if (this._checkXVectorLabel(colName)) iXVectorColList.push(iCol);
          else if (this._checkYVectorLabel(colName)) iYVectorColList.push(iCol);
      }
    }

    // 必ずあるはずの列がなかった場合です。
    if (iXCol === null) {
      throw columnDoesNotExistError(xLabel);
    }
    if (iYCol === null) {
      throw columnDoesNotExistError(yLabel);
    }
    if (iPotentialCol === null) {
      throw columnDoesNotExistError(potentialLabel);
    }

    // ベクトル列が、x と y の対のデータになっているかを確認します。

    // x と y の列数が等しいかを確認します。
    if (iXVectorColList.length !== iYVectorColList.length) throw vectorColumnsAreNotPairedError;

    // 列インデックスとヘッダー文字列の内容を 1 ペアずつ確認します。
    const vectorLabelList = [];
    for (let i = 0; i < iXVectorColList.length; i++) {

      // x　と　y の列が x、y の順で並んでいるかを確認します。
      const xVectorIndex = iXVectorColList[i];
      const yVectorIndex = iYVectorColList[i];     
      if (xVectorIndex !== yVectorIndex - 1) throw vectorColumnsAreNotPairedError;

      // ヘッダーの末尾 (_x または _y) を除去した部分の文字列が一致するかを確認します。
      const xHeadLabel = header[xVectorIndex].replace(/\s+/g, "").slice(0, -2);
      const yHeadLabel = header[yVectorIndex].replace(/\s+/g, "").slice(0, -2);
      if (xHeadLabel !== yHeadLabel) throw vectorColumnsAreNotPairedError;
      vectorLabelList.push(xHeadLabel);
    }
    // 作成したヘッダー リストの長さを確認します。
    if (vectorLabelList.length !== iXVectorColList.length) throw vectorColumnsAreNotPairedError; 
    
    // ノード (細胞) 数です。
    const nNode = array.length - 1;

    // 各列を表す配列です。
    const idArray = []; // CellID
    const xyArray = []; // [[x, y]] (2 次元配列です。)
    const potentialArray = new Float64Array(nNode); // Potential

    // その他の特徴量を格納する連想配列を準備します。
    const otherFeatureArrayDict = {};
    for (const i of iOtherFeatureColList) {
      // 配列の要素が文字列 (アノテーション) の場合です。
      if (iAnnotationColList.includes(i)) {
        otherFeatureArrayDict[header[i].replace(/\s+/g, "")] = new Array(nNode);
      }
      // 配列の要素が数値 (アノテーション以外) の場合です。
      else {
        otherFeatureArrayDict[header[i].replace(/\s+/g, "")] = new Float64Array(nNode);
      }
    }

    // 各細胞をループしつつ、各配列に値を振り分けます。
    for (let iNode = 0; iNode < nNode; iNode++) {

      // ヘッダー行を除いて i 行目のデータです。
      const row = array[iNode + 1];

      // ヘッダー行の列数と合わない場合はエラーとします。
      if (row.length !== nCol) {
        // 入力ファイルにおける行数です。
        const iRowInInput = iNode + 2;
        throw jaggedCsvError(iRowInInput);
      }

      // CellID、x、y、Potential の配列に値を格納します。
      // 値が数値であることを確認しながら格納します。
      idArray.push(row[iIdCol]);
      this._checkIfFiniteNumber(row[iXCol], iNode, iXCol);
      this._checkIfFiniteNumber(row[iYCol], iNode, iYCol);
      xyArray.push(new Float64Array([row[iXCol], row[iYCol]]));
      this._checkIfFiniteNumber(row[iPotentialCol], iNode, iPotentialCol);
      potentialArray[iNode] = row[iPotentialCol];

      // その他の特徴量の配列に値を格納します。
      // アノテーション列の以外は、値が数値であるかを確認しながら格納します。
      for (const iFeatureCol of iOtherFeatureColList) {
        const featureName = header[iFeatureCol].replace(/\s+/g, "");
        if (! iAnnotationColList.includes(iFeatureCol)) {
          this._checkIfFiniteNumber(row[iFeatureCol], iNode, iFeatureCol);
        }
        otherFeatureArrayDict[featureName][iNode] = row[iFeatureCol];
      }
    }

    // その他の特徴量を CellMapFeature のリストに構造化します。
    // アノテーション列および x ベクトル列のインデックスを収めた配列もあわせて作成します。
    const otherFeatureList = [];
    const annotationIndexList = [];
    const xVectorIndexList = [];
    let i = 0;
    for (const key in otherFeatureArrayDict) {

      const isNumber = ! isNaN(otherFeatureArrayDict[key][0]);
      otherFeatureList.push(
        new CellMapFeature(key, otherFeatureArrayDict[key], isNumber)
      );

      // アノテーション列または x ベクトル列のインデックスを配列に格納します。
      if (! isNumber) annotationIndexList.push(i);
      else if (this._checkXVectorLabel(key.toLowerCase()) && isNumber) xVectorIndexList.push(i);
      i++;
    }

    // x および y 座標の情報をもとに Delaunay 三角形分割を行います。
    // 後で面積や最長辺の長さでソートするので、それを踏まえた命名です。
    const yetSortedTriangles = Delaunator.from(xyArray).triangles;

    // 三角形分割において、
    // 各三角形の情報 (面積、最長辺の長さ) と辺の情報を集めます。
    const [triangleInfoList, edgeListArray, allEdgeList] =
      this._checkTriangles(yetSortedTriangles, xyArray);

    // 辺の half-edge の有効/無効状態を保存しておきます。
    for (const edge of allEdgeList) {
      edge.saveEnabledState();
    }

    // 三角形の情報を面積で昇順ソートします。
    triangleInfoList.sort(function(a, b) {
      return (a.area < b.area) ? -1 : 1;
    });
    // 面積でソートした三角形分割を作成します。
    const areaSortedTriangles =  this._getSortedTriangles(
      yetSortedTriangles, triangleInfoList
    );

    // 三角形の情報を最長辺の長さでソートします。
    triangleInfoList.sort(function(a, b) {
      return (a.lenLongestEdge < b.lenLongestEdge) ? -1 : 1;
    });
    // 最長辺の長さでソートした三角形分割を作成します。
    const longestEdgeSortedTriangles = this._getSortedTriangles(
      yetSortedTriangles, triangleInfoList
    );

    // ノードのデータを含むグラフ構造を返します。
    return new CellMapGraph(
      idArray, xyArray, potentialArray, otherFeatureList, 
      annotationIndexList, vectorLabelList, xVectorIndexList,
      edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles,
      allEdgeList
    );
  }

  /**
   * 文字列が、細胞種を表すラベルかをチェックします。
   * @param {string} lowerCaseString 小文字で表現された文字列です。
   * @returns 細胞種を表すラベルであれば true、そうでなければ false を返します。
   */
  static _checkAnnotationLabel(lowerCaseString) {
      return lowerCaseString.match(annotationLabelPattern) !== null;
    }

  /**
   * 文字列が、x ベクトルを表すラベルかをチェックします。
   * @param {string} lowerCaseString 小文字で表現された文字列です。
   * @returns x ベクトルを表すラベルであれば true、そうでなければ false を返します。
   * @memberof CellMapDataReader
   */
  static _checkXVectorLabel(lowerCaseString) {
    return lowerCaseString.match(xVectorLabelPattern) !== null;
  }

  /**
   * 文字列が、y ベクトルを表すラベルかをチェックします。
   * @param {string} lowerCaseString 小文字で表現された文字列です。
   * @returns y ベクトルを表すラベルであれば true、そうでなければ false を返します。
   * @memberof CellMapDataReader
   */
    static _checkYVectorLabel(lowerCaseString) {
      return lowerCaseString.match(yVectorLabelPattern) !== null;
    }

  /**
   * 数値であるべきセルが有限の数値であるかをチェックします。
   * @param {*} value チェック対象の値です。
   * @param {number} iNode ノード番号です。セルの行数 - 2 の値です。
   * @param {number} iCol 列番号です。
   * @returns {} セルの値が有限で無ければ例外を投げます。
   * @memberof CellMapDataReader
   */
  static _checkIfFiniteNumber = (value, iNode, iCol) => {
    if (Number.isFinite(value)) return;
    throw notFiniteNumberError(iNode + 2, iCol + 1);
  }

  /**
   * 三角形分割の三角形の情報を集めます。
   *
   * @static
   * @param {Uint32Array} triangles ソート前の三角形分割です。
   *     各要素が xyArray の要素のインデックスとなります。
   * @param {Array<Array<number>>} xyArray [[x, y]] の形の、
   *     各細胞 (ノード) を表す x および y 座標の配列です。
   * @return {Array} [triangleInfoList, edgeListArray, allEdgeList]  
   *     triangleInfoList: object[] - 各三角形について
   *     {
   *       iTriangle: 1 個目の頂点が triangles の何番目か,
   *       area: 三角形の面積,
   *       lenLongestEdge: 三角形の最長辺の長さ
   *     }
   *     の情報を格納したオブジェクトのリストです。
   *     リストの要素数は triangles 引数の要素数の 1/3 です。  
   *     edgeListArray:  Edge[][] -
   *     各細胞 (ノード) から伸びる辺のリストの配列です。  
   *     allEdgeList: Edge[] - 三角形分割中に存在する全ての辺のリストです。
   * @memberof CellMapDataReader
   */
  static _checkTriangles = (triangles, xyArray) => {

    // 各頂点 (ノード、細胞) から伸びる辺のリストの配列です。
    const edgeListArray = [];
    for (let i = 0; i < xyArray.length; i++) {
      edgeListArray.push([]);
    }

    // 三角形分割の結果生じた全ての辺を格納するリストです。
    const allEdgeList = [];

    // 各三角形の情報を格納するリストです。
    const triangleInfoList = [];

    // 各三角形をループします。
    for (
      let iTriangle = 0; iTriangle < triangles.length; iTriangle += 3
    ) {
      checkSingleTriangle.call(this, iTriangle);
    }

    return [triangleInfoList, edgeListArray, allEdgeList];

    // 三角形の辺と、面積、最長辺の長さなどの情報を調べます。
    function checkSingleTriangle(iTriangle) {

      // ループ用の頂点配列を用意します。
      // 末尾に 1 番目の頂点を追加して、3 番目の頂点と辺を成すようにします。
      const verticesToIter = [
        triangles[iTriangle],
        triangles[iTriangle + 1],
        triangles[iTriangle + 2],
        triangles[iTriangle]
      ];

      // 3 辺の長さを格納する配列を用意します。
      const edgeLen2dList = [];

      // 3 個の頂点 (ノード、細胞) をループします。
      for (let iVertex = 0; iVertex < 3; iVertex++) {

        // 頂点のノードのインデックスを取り出します。
        const vertex = verticesToIter[iVertex];
        // 三角形における次の頂点のノードのインデックスを取り出します。
        const nextVertex = verticesToIter[iVertex+1];

        // 2 個の頂点を結ぶ辺が既に作成されているかを調べます。
        // 作成されている場合は関数の中で
        // その辺のまだ無効だった half-edge が有効化され、
        // 辺の長さが edgeLen2dList に追加されます。
        const edgeAlreadyExists = this._checkExistingEdges(
          vertex, nextVertex, edgeListArray, edgeLen2dList
        );
        // 辺が既に作成されていた場合は次の頂点に移ります。
        if (edgeAlreadyExists) {
          continue;
        }

        // 辺がまだ作成されていなかった場合です。

        // 2 個の頂点の x, y 座標を取り出します。
        const [x, y] = xyArray[vertex]
        const [xNext, yNext] = xyArray[nextVertex];
        // 辺の長さ (2 次元) の 2 乗を計算します。
        const len2dSquared = (x-xNext)**2 + (y-yNext)**2;
        // この三角形の辺の長さリスト (2 次元) に追加します。
        edgeLen2dList.push(len2dSquared);

        // この頂点 -> 次の頂点方向の half-edge を有効にした辺を作成します。
        // edge.zDifference は CellMapGraph のコンストラクターで計算されるので、
        // 定義しないでおきます。
        const edge = new Edge(
          vertex, nextVertex, true, false, len2dSquared, undefined
        );

        // この頂点および次の頂点に、作成した辺を登録します。
        edgeListArray[vertex].push(edge);
        edgeListArray[nextVertex].push(edge);

        // 全ての辺のリストにも登録します。
        allEdgeList.push(edge);
      }

      // 面積を計算します。
      const [x1, y1] = xyArray[verticesToIter[0]];
      const [x2, y2] = xyArray[verticesToIter[1]];
      const [x3, y3] = xyArray[verticesToIter[2]];
      const area = 0.5 * Math.abs((x1-x3)*(y2-y3)-(x2-x3)*(y1-y3));

      // 最長辺の長さを取得します。
      const lenLongestEdge = Math.max(...edgeLen2dList);

      // 三角形のインデックス、面積、最長辺の長さの組の情報をリストに登録します。
      triangleInfoList.push(
        {
          iTriangle: iTriangle,
          area: area,
          lenLongestEdge: lenLongestEdge
        }
      );
    }
  }

  /**
   * 2 個のノードをつなぐ辺が既に作成されているかを調べます。
   * 既に作成されていた場合は、half-edge のもう 1 本を有効にします。
   *
   * @static
   * @param {number} node1 ノードその 1 です。
   * @param {number} node2 ノードその 2 です。
   * @param {Array<Array>} existingEdgeListArray 既に作成された辺を
   *     ノードごとに格納したリストです。
   * @param {Array<number} edgeLen2dList 辺が既に作成されていた場合に
   *     その長さの追加先となるリストです。
   * @return {boolean} 2 個のノードをつなぐ辺が既に作成されていれば true です。
   * @memberof CellMapDataReader
   */
  static _checkExistingEdges = (
    node1, node2, existingEdgeListArray, edgeLen2dList
  ) => {

    // 2 個のノードをつなぐ辺が既に作成されているかです。
    let edgeAlreadyExists = false;

    // existingEdgeListArray 中でノードその 1 に該当する箇所をループします。
    for (const edge of existingEdgeListArray[node1]) {

      // 辺が 2 個目のノードも含んでいれば、
      // 2 個のノードをつなぐ辺は既に作成されています。
      edgeAlreadyExists = edge.whichNodeIs(node2) > 0;

      if (edgeAlreadyExists) {
        // この辺は、この辺を共有する別の三角形を訪問したときに作成され、
        // iNode1 -> iNode2 方向の half-edge は既に有効です。

        // iNode2 -> iNode1 の half-edge を有効にします。
        edge.halfEdgeFrom2Enabled = true;

        // 2 次元の長さを取り出して、この三角形の辺の長さリストに追加します。
        edgeLen2dList.push(edge.len2dSquared);

        // 辺が見つかったので、ループを抜けて結果を返します。
        break;
      }
    }
    return edgeAlreadyExists;
  }

  /**
   * 三角形分割の三角形を並べ替えます。
   *
   * @static
   * @param {Uint32Array} trianglesToSort ソート前の三角形分割です。
   * @param {Array<object>} sortedTriangleInfoList ソートされた三角形の情報の
   *     リストです。
   * @return {Uint32Array} ソートされた三角形です。
   * @memberof CellMapDataReader
   */
  static _getSortedTriangles = (trianglesToSort, sortedTriangleInfoList) => {

    // ソート結果を格納する配列です。
    const sortedTriangles = new Uint32Array(trianglesToSort.length);

    // ソートされた三角形の情報をループします。
    for (let iInfo = 0; iInfo < sortedTriangleInfoList.length; iInfo++) {

      // ソート後の三角形の、
      // ソート前の三角形分割におけるインデックスを取得します。
      const iTriangle =
        sortedTriangleInfoList[iInfo].iTriangle;

      // ソート前の三角形の各頂点を、
      // ソート後の三角形の各頂点に格納していきます。
      for (let iV = 0; iV < 3; iV++) {
        sortedTriangles[3*iInfo + iV] =
          trianglesToSort[iTriangle + iV];
      }
    }

    return sortedTriangles;
  }
}

if (typeof module !== "undefined") {
  module.exports = CellMapDataReader;
}
