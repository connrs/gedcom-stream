var fs = require('fs'),
    Stream = require('stream').Stream;

function Gedcom() {
  this._buffer = '';
  this._currentContext = [];
  this._previousDepth = 0;
  this._data = [];
  this._err = null;
  this._lines = [];
  this._line = null;
  this._previousLine = undefined;
}

Gedcom.prototype = new Stream();
Gedcom.prototype.writable = true;

Gedcom.prototype.write = function (data) {
  this._streamIntoLines(data);
  this._process();
};

Gedcom.prototype.end = function () {
  this._clearBufferIntoLines()
      ._process()
      ._finishProcessing();
};

Gedcom.prototype._streamError = function (err) {
  this.emit('error', err);
  this.writable = false;
};

Gedcom.prototype._streamIntoLines = function (data) {
  var lines;

  this._appendDataToBuffer(data);
  lines = this._splitBufferByNewlines();
  this._buffer = lines.length > 1 ? lines.pop() : '';
  Array.prototype.push.apply(this._lines, lines);
};

Gedcom.prototype._appendDataToBuffer = function (data) {
  this._buffer += data;
};

Gedcom.prototype._process = function () {
  this._preprocessLines()
      ._processLines();

  return this;
};

Gedcom.prototype._clearBufferIntoLines = function () {
  var lines;

  if (this._buffer !== '') {
    lines = this._splitBufferByNewlines();
    Array.prototype.push.apply(this._lines, lines);
  }

  return this;
};

Gedcom.prototype._preprocessLines = function () {
  this._lines = this._lines.map(this._preprocessLine.bind(this));
  return this;
};

Gedcom.prototype._preprocessLine = function (line) {
  var data,
      newData = {};

  if (Object.prototype.toString.call(line) === '[object Object]') {
    return line;
  }

  data = line.split(' ');
  newData.level = +data.shift();

  if (data[0].match(/@.*@/)) {
    newData.id = data.shift().replace(/@/gi, '');
  }

  newData.name = data.shift();
  newData.value = data.join(' ');
  newData.children = [];
  return newData;
};

Gedcom.prototype._processLines = function () {
  while (this._setNextLine() && !this._err) {
    this._processLine();
  }

  return this;
};

Gedcom.prototype._setNextLine = function () {
  this._line = this._lines.shift();
  return !!this._line;
};

Gedcom.prototype._processLine = function () {
  if (this._currentLineIsNewZeroLevelEntry()) {
    this._initialiseProcessingContext();
    this._emitData();
  }
  else if (this._lineDepthIsHigher()) {
    this._incrementContext();
  }
  else if (this._lineDepthIsLower()) {
    this._decrementContext();
  }
  else if (!this._lineDepthIsSame()) {
    this._emitInvalidNestingError();
    return;
  }

  this._previousDepth = this._line.level;
  this._postProcessLine();
  this._pushLineOnStack();
};

Gedcom.prototype._initialiseProcessingContext = function () {
  this._currentContext = [this._data];
  this._previousDepth = 0;

  return this;
};

Gedcom.prototype._currentLineIsNewZeroLevelEntry = function () {
  return this._line.level === 0;
};

Gedcom.prototype._emitData = function() {
  if (this._data.length) {
    this.emit('data', this._data.shift());
  }
};

Gedcom.prototype._lineDepthIsHigher = function (line) {
  return this._line.level - this._previousDepth === 1;
};

Gedcom.prototype._incrementContext = function () {
  this._currentContext.push(this._previousLine.children);
};

Gedcom.prototype._lineDepthIsSame = function (line) {
  return this._line.level - this._previousDepth === 0;
};

Gedcom.prototype._decrementContext = function () {
  var times = this._previousDepth - this._line.level,
      i;

  for (i = 0; i < times; i++) {
    this._currentContext.pop();
  }
};

Gedcom.prototype._lineDepthIsLower = function (line) {
  return this._line.level < this._previousDepth;
};

Gedcom.prototype._emitInvalidNestingError = function () {
  this._err = true;
  this._streamError(new Error('Invalid nesting level on GEDCOM file.'));
};

Gedcom.prototype._postProcessLine = function () {
  delete this._line.level;
  this._previousLine = this._line;
};

Gedcom.prototype._pushLineOnStack = function () {
  this._currentContext.slice(-1)[0].push(this._previousLine);
};

Gedcom.prototype._finishProcessing = function () {
  this._emitData();
  this.emit('end');
  this._setStreamUnwritable();
};

Gedcom.prototype._setStreamUnwritable = function () {
  this.writable = false;
};

Gedcom.prototype._splitBufferByNewlines = function () {
  return this._buffer.split(/\r\n|\r|\n/);
};

module.exports = Gedcom;
