"use strict";


// ビューワー関連のエラー定数を定義しています。

// 複数のクラスで出るエラーです。
function invalidColorMapNameError(name) {
  return new RangeError(`${name} is an invalid colormap name.`);
}
function invalidRegisterValueError(name) {
  return new RangeError(
    `${name} is an invalid Value for find path.`
  );
}

// Viewer クラスのみで出るエラーです。
function invalidDragActionError(name) {
  return new RangeError(
    `${name} is an invalid mode for Drag action.`
  );
}
function invalidRotationAxixError(name) {
  return new RangeError(
    `${name} is an invalid mode for Rotation axis.`
  );
}
function threshControllerNotImplementedError(name) {
  return new RangeError(
    `Controller for threshold "${name}" is not implemented.`
  );
}

// ViewerSettings クラスでのみ出るエラーです。
const invalidCellDisplayPercentError = new RangeError(
  "cell display percent is out of range [0, 100]."
);
const negativeZScaleError = new RangeError(
  "z feature scale cannot be negative value."
);

function threshPercentGetterError(name) {
  return new RangeError(`Getter for threshold "${name}" is not implemented.`);
}
const negativeSizeError = new RangeError("Size value cannot be negative.");

// ColorMap クラスのみで出るエラーです。
const invalidColorMapValueError =  new RangeError(
  "Value smaller than 0 or larger than 1 cannot be evaluated."
);
function colorMapNotImplementedError(name) {
  return new RangeError(`Colormap "${name}" is not implemented.`);
}
