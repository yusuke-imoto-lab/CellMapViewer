"use strict";


/**
 * ビューワーの設定項目を表すクラスです。
 *
 * @class ViewerSettings
 */
class ViewerSettings {

  // 三角形分割の三角形を除去する閾値を面積にした場合に除外される
  // 三角形の上位の割合 (%) です。
  #threshAreaPercent;

  // 三角形分割の三角形を除去する閾値を最長辺の長さにした場合に除外される
  // 三角形の上位の割合 (%) です。
  #threshEdgePercent;

  // 表示する細胞の割合 (個数) です。
  #cellDisplayPercent;

  // z 座標のスケールです。
  #zScale;

  // 着色カラー マップ (Surface 用) です。
  #colorMap;
  // 着色カラーマップ (Surface 用) の最小値と最大値です。
  #colorMin;
  #colorMax;
  // 着色カラーマップ (Surface 用) の最小値と最大値のデフォルト値です。
  #colorMinDefault = -1;
  #colorMaxDefault = 1;


  // 着色カラー マップ (Cell 用) です
  #pointsColorMap;
  // 着色カラーマップ (Cell 用) の最小値と最大値です。
  #pointsColorMin;
  #pointsColorMax;
  // 着色カラーマップ (Cell 用) の最小値と最大値のデフォルト値です。
  #pointsColorMinDefault = -1;
  #pointsColorMaxDefault = 1;

  // アノテーションのフォント サイズです。
  #annotationFontSize;

  // 細胞を表す点の大きさです。
  #cellSize;

  // 選択された細胞を表す点の大きさです。
  #selectionSize;

  // 経路を表す線の太さです。
  #pathWidth;

  // 等高線の太さです。
  #contourWidth;

  // 経路計算に利用するパラメーターです。
  #register;

  // ドラッグ (左ボタン) の挙動です。
  #dragAction;

  // 回転軸の設定です。
  #rotationAxis;

  /**
   * コンストラクターです。初期値が以下の通り設定されます。  
   * ・閾値を面積にした場合に除外される三角形の上位の割合 (%): 1.0  
   * ・閾値を最長辺の長さにした場合に除外される三角形の上位の割合 (%): 1.0  
   * ・z 座標に用いる特徴量: ポテンシャル
   * ・アノテーションに用いる特徴量："Annotation"
   * ・ストリームライン表示に用いる特徴量："Velocity"
   * ・z 座標のスケール: 0.05  
   * ・グリッドの z 座標: 0  
   * ・カラー マップ (Surface 用) と対応させる特徴量: ポテンシャル  
   * ・カラー マップ (Surface 用) の種類: Gist earth  
   * ・カラー マップ (Surface 用) の最小値: -1  
   * ・カラー マップ (Surface 用) の最大値: 1  
   * ・カラー マップ (Surface 用) の最小値の既定値: -1  
   * ・カラー マップ (Surface 用) の最大値の既定値: 1  
   * ・カラー マップ (Cell 用) と対応させる特徴量: ポテンシャル  
   * ・カラー マップ (Cell 用) の種類: Jet  
   * ・カラー マップ (Cell 用) の最小値: -1  
   * ・カラー マップ (Cell 用) の最大値: 1  
   * ・カラー マップ (Cell 用) の最小値の既定値: -1  
   * ・カラー マップ (Cell 用) の最大値の既定値: 1 
   * ・メッシュの色: rgb(255, 255, 255)  
   * ・ストリームラインの色：rgb(255, 0, 0) 
   * ・等高線の色: rgb(255, 255, 255)  
   * ・背景色: rgb(0, 0, 0)  
   * ・アノテーションのフォント サイズ: 16
   * ・細胞を表す点の大きさ: 0.1  
   * ・選択された細胞を表す点の大きさ: 0.15  
   * ・経路を表す線の太さ: 0.05  
   * ・細胞のアノテーションの表示: する  
   * ・地図の表面の表示: する  
   * ・地図の表面のメッシュの表示: しない  
   * ・選択された細胞を表す点の強調表示: する  
   * ・ストリームラインの表示：しない
   * ・表示する等高線の本数：0
   * ・グリッドの表示: する
   * ・経路計算のためのパラメータ: 1
   * ・ドラッグの挙動: カメラ操作
   * ・回転軸: 現在の座標
   * 
   * @memberof ViewerSettings
   */
  constructor() {
    this.reset();
  }

  /**
   * 設定値をコンストラクターによる生成時の値にリセットします。
   *
   * @memberof ViewerSettings
   */
  reset = () => {
    this.threshAreaPercent = 1.0;
    this.threshEdgePercent = 1.0;
    this.cellDisplayPercent = 100;
    this.zFeature = defaultZFeatureLabel;
    this.annotation = defaultAnnotationLabel;
    this.vector = defaultVectorLabel;
    this.zScale = 1.00;
    this.gridZ = 0;
    this.colorFeature = defaultColorFeatureLabel;
    this.colorMap = gistEarthLabel;
    this.colorMin = this.colorMinDefault;
    this.colorMax = this.colorMaxDefault;
    this.pointsColorFeature = defaultColorFeatureLabel;
    this.pointsColorMap = jetLabel;
    this.pointsColorMin = this.pointsColorMinDefault;
    this.pointsColorMax = this.pointsColorMaxDefault;
    this.meshLineColor = [255, 255, 255];
    this.streamlineColor = [255, 0, 0];
    this.contourColor = [255, 255, 255];
    this.bgColor = [0, 0, 0];
    this.annotationFontSize = 16;
    this.cellSize = 0.1;
    this.selectionSize = 0.15;
    this.pathWidth = 0.05;
    this.contourWidth = 0.03;
    this.showAnnotations = true;
    this.showSurface = true;
    this.showSurfaceMesh = false;
    this.highlightSelection = true;
    this.showStreamline = false;
    this.contour = 0;
    this.showGrid = true;
    this.register = 1.00;
    this.dragAction = cameraRotationLabel;
    this.rotationAxis = currentCoordinateLabel;
  }

  /**
   * デシリアライズされた連想配列を渡して設定値を更新します。
   */
  resetBy = (json) => {
    if (json.threshAreaPercent) this.threshAreaPercent = json.threshAreaPercent;
    if (json.threshEdgePercent) this.threshEdgePercent = json.threshEdgePercent;
    if (json.cellDisplayPercent) this.cellDisplayPercent = json.cellDisplayPercent;
    if (json.zFeature) this.zFeature = json.zFeature;
    if (json.annotation) this.annotation = json.annotation;
    if (json.vector) this.vector = json.vector;
    if (json.zScale) this.zScale = json.zScale;
    if (json.gridZ) this.gridZ = json.gridZ;
    if (json.colorFeature) this.colorFeature = json.colorFeature;
    if (json.colorMap) this.colorMap = json.colorMap;
    if (json.colorMin) this.colorMin = json.colorMin;
    if (json.colorMax) this.colorMax = json.colorMax;
    if (json.pointsColorFeature) this.pointsColorFeature = json.pointsColorFeature;
    if (json.pointsColorMap) this.pointsColorMap = json.pointsColorMap;
    if (json.pointsColorMin) this.pointsColorMin = json.pointsColorMin;
    if (json.pointsColorMax) this.pointsColorMax = json.pointsColorMax;
    if (json.meshLineColor) this.meshLineColor = json.meshLineColor;
    if (json.streamlineColor) this.streamlineColor = json.streamlineColor;
    if (json.contourColor) this.contourColor = json.contourColor;
    if (json.bgColor) this.bgColor = json.bgColor;
    if (json.annotationFontSize) this.annotationFontSize = json.annotationFontSize;
    if (json.cellSize) this.cellSize = json.cellSize;
    if (json.selectionSize) this.selectionSize = json.selectionSize;
    if (json.pathWidth) this.pathWidth = json.pathWidth;
    if (json.contourWidth) this.contourWidth = json.contourWidth;
    if (json.showAnnotations) this.showAnnotations = json.showAnnotations;
    if (json.showSurface) this.showSurface = json.showSurface;
    if (json.showSurfaceMesh) this.showSurfaceMesh = json.showSurfaceMesh;
    if (json.highlightSelection) this.highlightSelection = json.highlightSelection;
    if (json.contour) this.contour = json.contour;
    if (json.showStreamline) this.showStreamline = json.showStreamline;
    if (json.showGrid) this.showGrid = json.showGrid;
    if (json.register) this.register = json.register;
    if (json.dragAction) this.dragAction = json.dragAction;
    if (json.rotationAxis) this.rotationAxis = json.rotationAxis;
  }

  /**
   * 三角形分割の三角形を除去する閾値を面積にした場合に除外される
   * 三角形の上位の割合 (%) を取得します。
   *
   * @memberof ViewerSettings
   */
  get threshAreaPercent() {
    return this.#threshAreaPercent;
  }

  /**
   * 三角形分割の三角形を除去する閾値を面積にした場合に除外される
   * 三角形の上位の割合 (%) を設定します。
   *
   * @memberof ViewerSettings
   */
  set threshAreaPercent(value) {
    if (value < 0 || 100 < value) {
      throw invalidThreshPercentError;
    }
    this.#threshAreaPercent = value;
  }

  /**
   * 三角形分割の三角形を除去する閾値を最長辺の長さにした場合に除外される
   * 三角形の上位の割合 (%) を取得します。
   *
   * @memberof ViewerSettings
   */
  get threshEdgePercent() {
    return this.#threshEdgePercent;
  }

  /**
   * 三角形分割の三角形を除去する閾値を最長辺の長さにした場合に除外される
   * 三角形の上位の割合 (%) を設定します。
   *
   * @memberof ViewerSettings
   */
  set threshEdgePercent(value) {
    if (value < 0 || 100 < value) {
      throw invalidThreshPercentError;
    }
    this.#threshEdgePercent = value;
  }

  /**
   * 細胞の表示率 (個数 %) を設定します。
   *
   * @memberof ViewerSettings
   */
  set cellDisplayPercent(value) {
    if (value < 0 || 100 < value) {
      throw invalidCellDisplayPercentError;
    }
    this.#cellDisplayPercent = value;
  }

  /**
   * 細胞の表示率 (個数 %) を取得します。
   *
   * @readonly
   * @memberof ViewerSettings
   */
  get cellDisplayPercent() {
      return this.#cellDisplayPercent;
  }

  /**
   * z 座標のスケールを取得します。
   *
   * @memberof ViewerSettings
   */
  get zScale() {
    return this.#zScale;
  }

  /**
   * z 座標のスケールを設定します。
   *
   * @memberof ViewerSettings
   */
  set zScale(value) {
    if (value < 0) {
      throw negativeZScaleError;
    }
    this.#zScale = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の種類を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMap() {
    return this.#colorMap;
  }

  /**
   * 着色カラー マップ (Surface 用) の種類を設定します。
   *
   * @memberof ViewerSettings
   */
  set colorMap(value) {
    if (!colorMapLabelList.includes(value)) {
      throw invalidColorMapNameError(value);
    }
    this.#colorMap = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の最小値を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMin() {
    return this.#colorMin;
  }

  /**
   * 着色カラー マップ (Surface 用) の最小値を設定します。
   *
   * @memberof ViewerSettings
   */
  set colorMin(value) {
    this.#colorMin = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の最大値を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMax() {
    return this.#colorMax;
  }

  /**
   * 着色カラー マップ (Surface 用) の最大値を設定します。
   *
   * @memberof ViewerSettings
   */
  set colorMax(value) {
    this.#colorMax = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の最小値のデフォルト値を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMinDefault() {
    return this.#colorMinDefault;
  }

  /**
   * 着色カラー マップ (Surface 用) の最小値のデフォルト値を設定します。
   *
   * @memberof ViewerSettings
   */
  set colorMinDefault(value) {
    this.#colorMinDefault = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の最大値のデフォルト値を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMaxDefault() {
    return this.#colorMaxDefault;
  }

  /**
   * 着色カラー マップ (Surface 用) の最大値のデフォルト値を設定します。
   *
   * @memberof ViewerSettings
   */
  set colorMaxDefault(value) {
    this.#colorMaxDefault = value;
  }


  /**
   * 着色カラー マップ (Cell 用) の種類を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMap() {
    return this.#pointsColorMap;
  }

  /**
   * 着色カラー マップ (Cell 用) の種類を設定します。
   *
   * @memberof ViewerSettings
   */
  set pointsColorMap(value) {
    if (!colorMapLabelList.includes(value)) {
      throw invalidColorMapNameError(value);
    }
    this.#pointsColorMap = value;
  }

  /**
   * 着色カラー マップ (Cell 用) の最小値を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMin() {
    return this.#pointsColorMin;
  }

  /**
   * 着色カラー マップ (Cell 用) の最小値を設定します。
   *
   * @memberof ViewerSettings
   */
  set pointsColorMin(value) {
    this.#pointsColorMin = value;
  }

  /**
   * 着色カラー マップ (Cell 用) の最大値を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMax() {
    return this.#pointsColorMax;
  }

  /**
   * 着色カラー マップ (Cell 用) の最大値を設定します。
   *
   * @memberof ViewerSettings
   */
  set pointsColorMax(value) {
    this.#pointsColorMax = value;
  }

  /**
   * 着色カラー マップ (Cell 用) の最小値のデフォルト値を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMinDefault() {
    return this.#pointsColorMinDefault;
  }

  /**
   * 着色カラー マップ (Cell 用) の最小値のデフォルト値を設定します。
   *
   * @memberof ViewerSettings
   */
  set pointsColorMinDefault(value) {
    this.#pointsColorMinDefault = value;
  }

  /**
   * 着色カラー マップ (Cell 用) の最大値のデフォルト値を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMaxDefault() {
    return this.#pointsColorMaxDefault;
  }

  /**
   * 着色カラー マップ (Cell 用) の最大値のデフォルト値を設定します。
   *
   * @memberof ViewerSettings
   */
  set pointsColorMaxDefault(value) {
    this.#pointsColorMaxDefault = value;
  }

  /**
   * アノテーションのフォント サイズを取得します。
   *
   * @memberof ViewerSettings
   */
  get annotationFontSize() {
    return this.#annotationFontSize;
  }

  /**
   * アノテーションのフォント サイズを設定します。
   *
   * @memberof ViewerSettings
   */
  set annotationFontSize(value) {
    if (value < 0) {
      throw negativeSizeError;
    }
    this.#annotationFontSize = value;
  }

  /**
   * 細胞を表す点の大きさを取得します。
   *
   * @memberof ViewerSettings
   */
  get cellSize() {
    return this.#cellSize;
  }

  /**
   * 細胞を表す点の大きさを設定します。
   *
   * @memberof ViewerSettings
   */
  set cellSize(value) {
    if (value < 0) {
      throw negativeSizeError;
    }
    this.#cellSize = value;
  }

  /**
   * 選択された細胞を表す点の大きさを取得します。
   *
   * @memberof ViewerSettings
   */
  get selectionSize() {
    return this.#selectionSize;
  }

  /**
   * 選択された細胞を表す点の大きさを指定します。
   *
   * @memberof ViewerSettings
   */
  set selectionSize(value) {
    if (value < 0) {
      throw negativeSizeError;
    }
    this.#selectionSize = value;
  }

  /**
   * 経路を表す線の太さを取得します。
   *
   * @memberof ViewerSettings
   */
  get pathWidth() {
    return this.#pathWidth;
  }

  /**
   * 経路を表す線の太さを指定します。
   *
   * @memberof ViewerSettings
   */
  set pathWidth(value) {
    if (value < 0) {
      throw negativeSizeError;
    }
    this.#pathWidth = value;
  }

  /**
   * 等高線の太さを取得します。
   *
   * @memberof ViewerSettings
   */
  get contourWidth() {
    return this.#contourWidth;
  }
  
  /**
   * 等高線の太さを指定します。
   *
   * @memberof ViewerSettings
   */
  set contourWidth(value) {
    if (value < 0) {
      throw negativeSizeError;
    }
    this.#contourWidth = value;
  }

  /**
   * 経路計算のためのパラメーターを取得します。
   *
   * @memberof ViewerSettings
   */
  get register() {
    return this.#register;
  }
  
  /**
   * 経路計算のためのパラメーターを指定します。
   *
   * @memberof ViewerSettings
   */
  set register(value) {
    if (value < 0 || 1 < value ) {
      throw invalidRegisterError;
    }
    this.#register = value;
  }


  /**
   * ドラッグの挙動を取得します。
   *
   * @memberof ViewerSettings
   */
  get dragAction() {
    return this.#dragAction;
  }

  /**
   * ドラッグの挙動を設定します。
   *
   * @memberof ViewerSettings
   */
  set dragAction(value) {
    if (!dragActionList.includes(value)) {
      throw invalidDragActionError(value);
    }
    this.#dragAction = value;
  }

  /**
   * 回転軸の設定を取得します。
   *
   * @memberof ViewerSettings
   */
  get rotationAxis() {
    return this.#rotationAxis;
  }

  /**
   * 回転軸を設定します。
   *
   * @memberof ViewerSettings
   */
  set rotationAxis(value) {
    if (!rotationAxisList.includes(value)) {
      throw invalidRotationAxisError(value);
    }
    this.#rotationAxis = value;
  }

  /**
   * 着色カラー マップ (Surface 用) の最小値/最大値プロパティを
   * 既定値プロパティに合わせてリセットします。
   *
   * @memberof ViewerSettings
   */
  resetColorMinMax = () => {
    this.colorMin = this.colorMinDefault;
    this.colorMax = this.colorMaxDefault;
  }

  /**
   * 着色カラー マップ (Cell 用) の最小値/最大値プロパティを
   * 既定値プロパティに合わせてリセットします。
   *
   * @memberof ViewerSettings
   */
  resetPointsColorMinMax = () => {
    this.pointsColorMin = this.pointsColorMinDefault;
    this.pointsColorMax = this.pointsColorMaxDefault;
  }

  /**
   * JSON オブジェクトを返します。
   */
  toJSON = () => {
    return {
      threshAreaPercent: this.threshAreaPercent,
      threshEdgePercent: this.threshEdgePercent,
      zFeature: this.zFeature,
      annotation: this.annotation,
      vector: this.vector,
      zScale: this.zScale,
      gridZ: this.gridZ,
      colorFeature: this.colorFeature,
      colorMap: this.colorMap,
      colorMin: this.colorMin,
      colorMax: this.colorMax,
      pointsColorFeature: this.pointsColorFeature,
      pointsColorMap: this.pointsColorMap,
      pointsColorMin: this.pointsColorMin,
      pointsColorMax: this.pointsColorMax,
      meshLineColor: this.meshLineColor,
      streamlineColor: this.streamlineColor,
      contourColor: this.contourColor,
      bgColor: this.bgColor,
      annotationFontSize: this.annotationFontSize,
      cellSize: this.cellSize,
      selectionSize: this.selectionSize,
      pathWidth: this.pathWidth,
      contourWidth: this.contourWidth,
      showAnnotations: this.showAnnotations,
      showSurface: this.showSurface,
      showSurfaceMesh: this.showSurfaceMesh,
      highlightSelection: this.highlightSelection,
      contour: this.contour,
      showStreamline: this.showStreamline,
      showGrid: this.showGrid,
      dragAction: this.dragAction,
      rotationAxis: this.rotationAxis 
    }
  }
}
