"use strict";

if (typeof require !== "undefined") {
  const errorConst = require("./graphErrorConst");
  global.vectorColumnsAreNotPairedError = errorConst.vectorColumnsAreNotPairedError;

  // 本クラスの単体テスト (../../tests/cellMapGraph/streawmlineMaker.test.js) を実行する際には、
  // 11 行目のコード (global.seedrandom = require("../../libs/seedrandom/seedrandom.min");) 
  // のコメント アウトを外してください。他にも 2 箇所のコードのコメント アウトを変更する必要があります。
  // これは使用しているライブラリの使用方法が実行環境に依存するためです。
  // global.seedrandom = require("../../libs/seedrandom/seedrandom.min");
}


/**
 * CellMapGraph オブジェクトからストリーム ラインのデータを作成するクラスです。
 *
 * @class StreamlineMaker
 */
class StreamlineMaker {

  /**
   * 方向ベクトルをつないでストリームラインを作成します。以下のアルゴリズムに基づきストリームラインを形成する点を求めます。
   * 1. 始点を1つ決めます
   * 2. 始点からベクトル方向に伸びる半直線と、始点を頂点に持つ三角形の 3 辺のうち始点を含まない辺との交点を求めます
　 * 3. 始点以外の 2 頂点のベクトルの平均を交点のベクトルとみなします
   * 4. 交点を始点として 2 に戻ります。行き先がなければ 1 に戻ります
　 * 通過済みの三角形は以後使われないようにします。
   * 始点は全ての頂点の中からランダムに抽出します。抽出する個数は、頂点の個数の約 1/10 です。
   * したがって、一本のストリームの平均の点数は 10 点です。
   * @static
   * @param {{x: Array<number>, y: Array<number>}} vector 
   * @param {Array<Array<number>>} xyArray x と y 座標を格納した 2 次元の配列です。
   * @param {Array<number>} zArray z 座標を格納した配列です。
   * @param {Array<Array<Edge>>} edgeListArray ノードに接続された辺のリストです。
   * @param {Array<Edge>} allEdgeList 全ての辺のリストです。
   * @return {Array<Array<{x: number, y: number, z: number, dx: number, dy: number}>>} ストリームラインを形成する点のリストを格納した配列です。
   * @memberof StreamlineMaker
   */
  static make = (vector, xyArray, zArray, edgeListArray, allEdgeList) => {

    // 次の場合はエラーとします。
    // x と y と z のデータ数が異なる
    if (vector.x.length !== vector.y.length) throw vectorColumnsAreNotPairedError;
    else if (vector.x.length !== zArray.length) throw vectorColumnsAreNotPairedError;

    // ストリームラインの開始点とする頂点インデックスのリストを作成します。
    // シードを固定してランダムに取得します。
    const vertexCount = xyArray.length;
    const averageLength = 10;
    const startPointList = this._getStartPointList(vertexCount, averageLength);
    
    let adjacentInfo = [];     // 開始点に接続する辺と、辺の反対側のノードの情報の配列
    let iVertex = null;        // 三角形の頂点インデックス
    let crossPoint = null;     // 方向ベクトルと辺との交点の情報 (点の x、y、z 座標と、その点における方向ベクトル (dx、dy))
    let nextCrossPoint = null; // 新たに見つかった方向ベクトルと辺との交点
    let crossPointEdge = null; // 交点が存在する辺
    let adjacentSideEdgeList = [];  // iVertex を含む三角形のうち、iVertex を含まない辺のリスト
    let streamline = [];       // 1 本のストリームラインを描く点の xy 座標を格納するリスト
    let streamlineList =[];    // ストリームラインを格納するリスト
    let searchingEdgeList = allEdgeList.slice();  // 探索が可能な辺のリスト

    // 1 つの頂点から、方向ベクトルをつないでストリームラインを 1 本生成する操作を繰り返します。
    for (let i = 0; i < startPointList.length; i++) {

      // 初期値を設定します。
      if ((iVertex === null) && (crossPoint === null)) {

        iVertex = startPointList[i];
        crossPoint = {x: xyArray[iVertex][0], y: xyArray[iVertex][1], z: zArray[iVertex], dx: vector.x[iVertex], dy: vector.y[iVertex]};
        streamline.push(crossPoint);

        // 頂点の隣接ノードと、そのノードにつながる辺の連想配列を取得します。
        adjacentInfo = this._getAdjacentInfo(iVertex, edgeListArray);
        adjacentSideEdgeList = this._getOppositeSideEdgeList(adjacentInfo, edgeListArray, searchingEdgeList);
      }   
      crossPointEdge = null;


      // 方向ベクトルをつなぐ操作を繰り返します。
      while (true) {

        // 三角形の 3 辺のうち、crossPoint を含まない 2 辺と、crossPoint における方向ベクトルが交点をもつかを探索します。
        for (let j = 0; j < adjacentSideEdgeList.length; j++) {

          // 探索する辺を取得します。
          // 辺が探索用リストに含まれていなければ、次の対辺の処理に移ります。
          const edge = adjacentSideEdgeList[j];  

          // 辺の端点の情報を取得します。
          let edgeNode1 = {
            x: xyArray[edge.iNode1][0], 
            y: xyArray[edge.iNode1][1],
            z: zArray[edge.iNode1],
            dx: vector.x[edge.iNode1],
            dy: vector.y[edge.iNode1]
          };
          let edgeNode2 = {
            x: xyArray[edge.iNode2][0], 
            y: xyArray[edge.iNode2][1],
            z: zArray[edge.iNode2],
            dx: vector.x[edge.iNode2],
            dy: vector.y[edge.iNode2]
          };

          // 方向ベクトルと、辺が交点をもつかを調べます。
          // 交点を持たなければ、次の辺の処理に移ります。
          nextCrossPoint = this._getCrossPoint(crossPoint, edgeNode1, edgeNode2);
          if (nextCrossPoint === null) continue;

          // 次の探索のための処理をします。

          // 交点と交点の方向ベクトルを更新します。
          streamline.push(nextCrossPoint);
          crossPoint = nextCrossPoint;

          // 頂点、探索用リストを更新します。
          // 初めて交点が見つかった場合です。
          if (crossPointEdge === null) {
            // 開始点に隣接する 2 辺を探索用リストから削除します。
            const [adjacentSideEdge1, adjacentSideEdge2] = adjacentInfo.map(info => {
              if ((info.node === edge.iNode1) || (info.node === edge.iNode2)) return info.edge
            });
            searchingEdgeList = searchingEdgeList.filter(searchingEdge => searchingEdge !== adjacentSideEdge1 || searchingEdge !== adjacentSideEdge2);
          }
          // 2 回目以降の交点が見つかった場合です。
          // 現在の辺において、交点見つかった辺とが共有しない方の端点を、新しい頂点 iVertex とします。
          else {
            if (crossPointEdge.iNode1 === edge.iNode1 || crossPointEdge.iNode1 === edge.iNode2) iVertex = crossPointEdge.iNode2;
            else if (crossPointEdge.iNode2 === edge.iNode1 || crossPointEdge.iNode2 === edge.iNode2) iVertex = crossPointEdge.iNode1;
            searchingEdgeList = searchingEdgeList.filter(searchingEdge => ! adjacentSideEdgeList.includes(searchingEdge));
          }

          // 辺を更新します。
          crossPointEdge = edge;
          break;
        }

        // 探索を開始する辺がなければ現在のストリームラインの作成を終了します。
        if ((crossPointEdge === null) || (nextCrossPoint === null)) break;

        // 探索を開始する辺があれば、現在の辺を対辺とする三角形で、iVertex とは異なる頂点を求めます。
        adjacentSideEdgeList = this._getAdjascentSideEdgeList(
          iVertex, crossPointEdge.iNode1, crossPointEdge.iNode2, edgeListArray, searchingEdgeList);
        if (adjacentSideEdgeList.length === 0) break;
      }

      // 作成したストリームラインを配列に追加します。
      // 現在の辺は探索リストから削除します。
      searchingEdgeList.filter(edge => edge !== crossPointEdge);
      streamlineList.push(streamline);

      // 次のストリームライン作成のために変数を初期化します。
      iVertex = null;
      crossPoint = null;
      crossPointEdge = null;
      streamline = [];
    }
    return streamlineList; 
  }

  /**
   * ストリームラインの作成開始点の頂点インデックスのリストを取得します。
   * 頂点はシードを固定してランダムに取得します。
   * @param {number} vertexCount 頂点の全個数です。
   * @param {number} averageLength ストリームラインの平均の長さ
   * @returns {Array<nummber>} 頂点インデックスのリスト
   */
  static _getStartPointList = (vertexCount, averageLength) => {
    
    const startPointCount = vertexCount/averageLength;  // 開始点の個数
    let startPointSet = new Set();

    // 重複なくランダムにインデックスを取得します。
    let i = 0;

    // 本静的メソッドの単体テスト (../../tests/cellMapGraph/streawmlineMaker.test.js) を実行する際には、
    // 184 行目のコード (Math.seedrandom(1);) をコメント アウトし、
    // 変わりに 185 行目のコード (const random = seedrandom(1);) を使用する必要があります。
    // これは使用しているライブラリの使用方法が実行環境に依存するためです。
    // const random = seedrandom(1);
    Math.seedrandom(1);

    while (i < startPointCount) {

      // 本静的メソッドの単体テスト (../../tests/cellMapGraph/streawmlineMaker.test.js) を実行する際には、
      // 193 行目のコード (const randomIndex = Math.floor(Math.random() * vertexCount);) をコメント アウトし、
      // 変わりに 194 行目のコード (const randomIndex = Math.floor(random() * vertexCount);) を使用する必要があります。
      // これは使用しているライブラリの使用方法が実行環境に依存するためです。
      // const randomIndex = Math.floor(random() * vertexCount);
      const randomIndex = Math.floor(Math.random() * vertexCount);

      startPointSet.add(randomIndex);
      i = startPointSet.size;
    }
    return [...startPointSet];
  }

  /**
   * あるノードの隣接ノードと、それら 2 点をつなぐ辺をセットにした連想配列を取得します。
   * @param {number} iNode ノードのインデックスです。
   * @param {Array<Edge>} edgeListArray ノードに接続された辺のリストです。
   * @returns {Array<{node: number, edge:Edge}>} ノードと辺の情報をもつオブジェクトの配列です。
   */
  static _getAdjacentInfo = (iNode, edgeListArray) => {
    const result = [];
    const nodeEdgeListArray = edgeListArray[iNode];

    // 辺をループしながら、指定されたノードと反対側のノードを取得します。
    for (const edge of nodeEdgeListArray) {
      const oppositeNode = edge.getOppositeNode(iNode);
      result.push({node: oppositeNode, edge: edge});
    }
    return result;
  }

  /**
   * 線分と半直線の交点を求めます。
   * 外積を利用して、交点をもつかの確認と、交点の算出を行います
   * @param {{x: number, y: number, z: number, dx: number, dy: number}} point 半直線上の点の座標と方向ベクトルの情報をもったオブジェクトです。
   * @param {{x: number, y: number, z: number, dx: number, dy: number}} edgeNode1 線分の端点 1 です。
   * @param {{x: number, y: number, z: number, dx: number, dy: number}} edgeNode2 線分の端点 2 です。
   * @returns {{x: number, y: number, z: number, dx: number, dy: number}} 交点の座標と方向ベクトルです。交点をもたない場合は null を返します。
   */
  static _getCrossPoint = (point, edgeNode1, edgeNode2) => {

    // 計算用のベクトルを作成します。
    const toNode1Vector = {x: edgeNode1.x - point.x, y: edgeNode1.y - point.y};
    const toNode2Vector = {x: edgeNode2.x - point.x, y: edgeNode2.y - point.y};
    const node1to2Vector = {x: edgeNode2.x - edgeNode1.x, y: edgeNode2.y - edgeNode1.y};

    // 交点をもつかを確認します。
    const crossProduct1 = point.dx * toNode1Vector.y - point.dy * toNode1Vector.x;
    const crossProduct2 = point.dx * toNode2Vector.y - point.dy * toNode2Vector.x;
    if (crossProduct1 * crossProduct2 >= 0) return null;

    // 以下は交点を持つ可能性がある場合の処理です。
    // 交点を求めます。
    const crossProduct3 = point.dx * node1to2Vector.y - point.dy * node1to2Vector.x;
    const t = crossProduct2 / crossProduct3;
    if (t < 0 || 1 < t) return null;

    const x = edgeNode2.x - t * node1to2Vector.x;
    const y = edgeNode2.y - t * node1to2Vector.y;
    const z = (edgeNode1.z + edgeNode2.z) * 0.5;
    const dx = (edgeNode1.dx + edgeNode2.dx) * 0.5;
    const dy = (edgeNode1.dy + edgeNode2.dy) * 0.5;
    return {x, y, z, dx, dy};
  }

  /**
   * あるノードを頂点とした全ての三角形について、そのノードの対辺をリストとして取得します。
   * @param {Array<{node: number, edge: Edge}>} adjacentInfo
   * @param {Array<Array<Edge>>} edgeListArray ノードに接続された辺のリストです。
   * @param {Array<Edge>} searchingEdgeList  探索が可能な変のリストです。
   * @returns {Array<Edge>} 対辺のリストです。
   */
  static _getOppositeSideEdgeList = (adjacentInfo, edgeListArray, searchingEdgeList) => {

    const result = new Set(); // 辺を収めるセット
    const adjacentNodeList = adjacentInfo.map(value => value.node); // 隣接ノードのリスト

    for (const node of adjacentNodeList) {

      // 隣接ノードに接続する辺を取得します。
      const oppositeNodeEdgeList = edgeListArray[node];
      // 接続辺の両端のノードが隣接ノードのリストにあるかを確認します。
      for (const edge of oppositeNodeEdgeList) {
        if (adjacentNodeList.includes(edge.iNode1) && adjacentNodeList.includes(edge.iNode2)) {
          // 辺が探索用リストにあれば、 セットに格納します。
          if (searchingEdgeList.includes(edge)) result.add(edge);          
        }
      }
    }
    return [...result];
  }

  /**
   * 2 つの点を端点とする三角形のある辺に隣接した 2 つの辺をリストとして取得します。
   * 2 つの点を端点とする三角形は 2 つ存在しますが、
   * その頂点のインデックスが vertex ではない方の三角形を対象とします。
   * @param {number} vertex 三角形の頂点インデックスです。
   * @param {number} node1 端点 1 のインデックスです。
   * @param {number} node2 端点 2 のインデックスです。
   * @param {Array<Array<Edge>>} edgeListArray 
   * @returns {Array<Edge>} 辺のリストです。
   */
  static _getAdjascentSideEdgeList = (vertex, node1, node2, edgeListArray, searchingEdgeList) => {

    const result = [];
    const adjacentNode1Info = this._getAdjacentInfo(node1, edgeListArray); // 端点 1 に隣接するノードとエッジの情報
    const adjacentNode2Info = this._getAdjacentInfo(node2, edgeListArray); // 端点 2 に隣接するノードとエッジの情報

    for (const info1 of adjacentNode1Info) {
      for (const info2 of adjacentNode2Info) {
        if ((info1.node === info2.node) && (info1.node !== vertex)) {
          if (searchingEdgeList.includes(info1.edge)) result.push(info1.edge);
          if (searchingEdgeList.includes(info2.edge)) result.push(info2.edge);
          break;
        }
      }
    }   
    return result;
  }

}

if (typeof module !== "undefined") {
  module.exports = StreamlineMaker;
}
