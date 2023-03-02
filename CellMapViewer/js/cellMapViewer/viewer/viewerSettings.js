"use strict";


/**
 * ビューワーの設定項目を表すクラスです。
 *
 * @class ViewerSettings
 */
class ViewerSettings {

  // 三角形分割の三角形を除去する閾値の種類を表します。
  #threshType;

  // 三角形分割の三角形を除去する閾値を面積にした場合に除外される
  // 三角形の上位の割合 (%) です。
  #threshAreaPercent;

  // 三角形分割の三角形を除去する閾値を最長辺の長さにした場合に除外される
  // 三角形の上位の割合 (%) です。
  #threshEdgePercent;

  // z 座標のスケールです。
  #zScale;

  // 着色カラー マップの種類です。
  #colorMap;
  #pointsColorMap;

  // アノテーションのフォント サイズです。
  #annotationFontSize;

  // 細胞を表す点の大きさです。
  #cellSize;

  // 選択された細胞を表す点の大きさです。
  #selectionSize;

  // 経路を表す線の太さです。
  #pathWidth;

  // ドラッグ (左ボタン) の挙動です。
  #dragAction;

  /**
   * コンストラクターです。初期値が以下の通り設定されます。  
   * ・三角形分割の三角形を除去する閾値の種類: 面積  
   * ・閾値を面積にした場合に除外される三角形の上位の割合 (%): 1.0  
   * ・閾値を最長辺の長さにした場合に除外される三角形の上位の割合 (%): 1.0  
   * ・z 座標に用いる特徴量: ポテンシャル  
   * ・z 座標のスケール: 0.05  
   * ・グリッドの z 座標: 0  
   * ・カラー マップと対応させる特徴量: ポテンシャル  
   * ・カラー マップの種類: Gist earth  
   * ・カラー マップの最小値: -1  
   * ・カラー マップの最大値: 1  
   * ・カラー マップの最小値の既定値: -1  
   * ・カラー マップの最大値の既定値: 1  
   * ・点群のカラー マップと対応させる特徴量: ポテンシャル  
   * ・点群のカラー マップの種類: Jet  
   * ・点群のカラー マップの最小値: -1  
   * ・点群のカラー マップの最大値: 1  
   * ・点群のカラー マップの最小値の既定値: -1  
   * ・点群のカラー マップの最大値の既定値: 1  
   * ・背景色: rgb(0, 0, 0)  
   * ・アノテーションのフォント サイズ: 16
   * ・細胞を表す点の大きさ: 0.1  
   * ・選択された細胞を表す点の大きさ: 0.15  
   * ・経路を表す線の太さ: 0.05  
   * ・細胞のアノテーションの表示: する  
   * ・地図の表面の表示: する  
   * ・細胞を表す点群の表示: する  
   * ・選択された細胞を表す点の強調表示: する  
   * ・グリッドの表示: する
   * ・ドラッグの挙動: カメラ操作
   * 
   * @memberof ViewerSettings
   */
  constructor() {

    this.colorMinDefault = -1;
    this.colorMaxDefault = 1;
    this.pointsColorMinDefault = -1;
    this.pointsColorMaxDefault = 1;
    this.reset();
  }

  /**
   * 設定値をコンストラクターによる生成時の値にリセットします。
   * ただし、カラー マップの最小値/最大値プロパティは
   * カラー マップの最小値/最大値の既定値プロパティに合わせてリセットされます。
   *
   * @memberof ViewerSettings
   */
  reset = () => {

    this.threshType = areaLabel;
    this.threshAreaPercent = 1.0;
    this.threshEdgePercent = 1.0;
    this.zFeature = defaultZFeatureLabel;
    this.zScale = 0.05;
    this.gridZ = 0;
    this.colorFeature = defaultColorFeatureLabel;
    this.colorMap = gistEarthLabel;
    this.pointsColorFeature = defaultColorFeatureLabel;
    this.pointsColorMap = jetLabel;
    this.resetColorMinMax();
    this.resetPointsColorMinMax();
    this.bgColor = [0, 0, 0];
    this.annotationFontSize = 16;
    this.cellSize = 0.1;
    this.selectionSize = 0.15;
    this.pathWidth = 0.05;
    this.showAnnotations = true;
    this.showSurface = true;
    this.showCellPoints = true;
    this.highlightSelection = true;
    this.showGrid = true;
    this.dragAction = cameraRotationLabel;
  }

  /**
   * デシリアライズされた連想配列を渡して設定値を更新します。
   * ただし、カラー マップの最小値/最大値プロパティは
   * カラー マップの最小値/最大値の既定値プロパティに合わせてリセットされます。
   */
  resetBy = (json) => {
    if (json.threshType) this.threshType = json.threshType;
    if (json.threshAreaPercent) this.threshAreaPercent = json.threshAreaPercent;
    if (json.threshEdgePercent) this.threshEdgePercent = json.threshEdgePercent;
    if (json.zFeature) this.zFeature = json.zFeature;
    if (json.zScale) this.zScale = json.zScale;
    if (json.gridZ) this.gridZ = json.gridZ;
    if (json.colorFeature) this.colorFeature = json.colorFeature;
    if (json.colorMap) this.colorMap = json.colorMap;
    this.resetColorMinMax();
    this.resetPointsColorMinMax();
    if (json.bgColor) this.bgColor = json.bgColor;
    if (json.annotationFontSize) this.annotationFontSize = json.annotationFontSize;
    if (json.cellSize) this.cellSize = json.cellSize;
    if (json.selectionSize) this.selectionSize = json.selectionSize;
    if (json.pathWidth) this.pathWidth = json.pathWidth;
    if (json.showAnnotations) this.showAnnotations = json.showAnnotations;
    if (json.showSurface) this.showSurface = json.showSurface;
    if (json.showCellPoints) this.showCellPoints = json.showCellPoints;
    if (json.highlightSelection) this.highlightSelection = json.highlightSelection;
    if (json.showGrid) this.showGrid = json.showGrid;
    if (json.dragAction) this.dragAction = json.dragAction;
  }

  /**
   * 三角形分割の三角形を除去する閾値の種類を取得します。
   *
   * @memberof ViewerSettings
   */
  get threshType() {
    return this.#threshType;
  }

  /**
   * 三角形分割の三角形を除去する閾値の種類を設定します。
   *
   * @memberof ViewerSettings
   */
  set threshType(value) {
    if (!threshTypeLabelList.includes(value)) {
      throw invalidThreshTypeError(value);
    }
    this.#threshType = value;
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
   * threshType プロパティの値に応じて
   * 三角形分割の三角形を除去する閾値 (%) を取得します。
   *
   * @readonly
   * @memberof ViewerSettings
   */
  get threshPercent() {

    switch (this.threshType) {
      case areaLabel:
        return this.threshAreaPercent;
      case longestEdgeLabel:
        return this.threshEdgePercent;
      default:
        throw threshPercentGetterError(this.threshType);
    }
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
   * 着色カラー マップの種類を取得します。
   *
   * @memberof ViewerSettings
   */
  get colorMap() {
    return this.#colorMap;
  }

  /**
   * 着色カラー マップの種類を設定します。
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
   * 着色カラー マップの種類を取得します。
   *
   * @memberof ViewerSettings
   */
  get pointsColorMap() {
    return this.#pointsColorMap;
  }

  /**
   * 着色カラー マップの種類を設定します。
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
   * カラー マップの最小値/最大値プロパティを
   * 既定値プロパティに合わせてリセットします。
   *
   * @memberof ViewerSettings
   */
  resetColorMinMax = () => {

    this.colorMin = this.colorMinDefault;
    this.colorMax = this.colorMaxDefault;
  }
  resetPointsColorMinMax = () => {

    this.pointsColorMin = this.pointsColorMinDefault;
    this.pointsColorMax = this.pointsColorMaxDefault;
  }

  /**
   * JSON オブジェクトを返します。
   */
  toJSON = () => {
    return {
      threshType: this.threshType,
      threshAreaPercent: this.threshAreaPercent,
      threshEdgePercent: this.threshEdgePercent,
      zFeature: this.zFeature,
      zScale: this.zScale,
      gridZ: this.gridZ,
      colorFeature: this.colorFeature,
      pointsColorFeature: this.pointsColorFeature,
      colorMap: this.colorMap,
      pointsColorMap: this.pointsColorMap,
      bgColor: this.bgColor,
      annotationFontSize: this.annotationFontSize,
      cellSize: this.cellSize,
      selectionSize: this.selectionSize,
      pathWidth: this.pathWidth,
      showAnnotations: this.showAnnotations,
      showSurface: this.showSurface,
      showCellPoints: this.showCellPoints,
      highlightSelection: this.highlightSelection,
      showGrid: this.showGrid,
      dragAction: this.dragAction
    }
  }
}
