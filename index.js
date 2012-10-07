var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

function GedcomFile() {
  this._buffer = '';
  this._currentContext = [];
  this._currentLevel = 0;
  this._data = [];
  this._err = null;
  this._lines = [];
  this._lineData = undefined;
  this._processed = false;
  this._stream = null;
}

GedcomFile.prototype = Object.create(EventEmitter.prototype);

GedcomFile.prototype.setFile = function (filename) {
  this.filename = filename;
};

GedcomFile.prototype.toArray = function (callback) {
  if (!this._stream) {
    callback(new Error('You attempted to convert a GEDCOM without providing a stream.'));
  }
  else {
    if (this._processed) {
      callback(this._err, this._data);
    }
    else {
      this.on('processed', callback);
    }
  }
};

GedcomFile.prototype.readStream = function (stream) {
  this._stream = stream;
  this._stream.on('error', this._streamError.bind(this));
  this._stream.on('end', this._process.bind(this));
  this._stream.on('data', this._streamIntoLines.bind(this));
};

GedcomFile.prototype._streamError = function (err) {
  this.emit('processed', err);
};

GedcomFile.prototype._streamIntoLines = function (data) {
  var lines;

  this._buffer += data;
  lines = this._splitBufferByNewlines();
  this._buffer = lines.length > 1 ? lines.pop() : '';
  Array.prototype.push.apply(this._lines, lines);
};

GedcomFile.prototype._process = function () {
  this._clearBufferIntoLines()
      ._preprocessLines()
      ._initialiseProcessingContext()
      ._processLines()
      ._finishProcessing();
};

GedcomFile.prototype._clearBufferIntoLines = function () {
  if (this._buffer !== '') {
    this._lines.push(this._buffer);
  }

  return this;
};

GedcomFile.prototype._preprocessLines = function () {
  this._lines = this._lines.map(this._preprocessLine.bind(this));

  return this;
};

GedcomFile.prototype._preprocessLine = function (line) {
  var data = line.split(' '),
      newData = {};

  newData.level = +data.shift();

  if (data[0].match(/@.*@/)) {
    newData.id = data.shift().replace(/@/gi, '');
  }

  newData.name = data.shift();
  newData.value = data.join(' ');
  newData.children = [];
  return newData;
};

GedcomFile.prototype._processLines = function () {
  var linesLength = this._lines.length,
      lineNumber;

  for (lineNumber = 0; lineNumber < linesLength && !this._err; lineNumber++) {
    this._processLine(lineNumber);
  }

  return this;
};

GedcomFile.prototype._processLine = function (lineNumber) {
  if (this._nextLevelIsHigher(lineNumber)) {
    this._incrementContext();
  }
  else if (this._nextLevelIsLower(lineNumber)) {
    this._decrementContext();
  }
  else if (!this._nextLevelIsSame(lineNumber)) {
    this._abortStreamProcessing();
    return;
  }

  this._postprocessLineData(lineNumber);
  this._pushToEndOfCurrentContext(this._lineData);
};

GedcomFile.prototype._initialiseProcessingContext = function () {
  this._currentContext.push(this._data);
  this._currentLevel = 0;

  return this;
};

GedcomFile.prototype._nextLevelIsHigher = function (currentLine) {
  return this._lines[currentLine].level - this._currentLevel === 1;
};

GedcomFile.prototype._incrementContext = function () {
  this._currentLevel += 1;
  this._currentContext.push(this._lineData.children);
};

GedcomFile.prototype._nextLevelIsSame = function (currentLine) {
  return this._lines[currentLine].level - this._currentLevel === 0;
};

GedcomFile.prototype._decrementContext = function () {
  this._currentLevel -= 1;
  this._currentContext.pop();
};

GedcomFile.prototype._nextLevelIsLower = function (currentLine) {
  return this._lines[currentLine].level - this._currentLevel === -1;
};

GedcomFile.prototype._abortStreamProcessing = function () {
    this._err = new Error('Error processing GEDCOM file.');
};

GedcomFile.prototype._postprocessLineData = function (lineNumber) {
  delete this._lines[lineNumber].level;
  this._lineData = this._lines[lineNumber];
};

GedcomFile.prototype._pushToEndOfCurrentContext = function (data) {
  this._currentContext.slice(-1)[0].push(data);
};

GedcomFile.prototype._finishProcessing = function () {
  this.emit('processed', this._err, this._data);
  this._processed = true;

  return this;
};

GedcomFile.prototype._splitBufferByNewlines = function () {
  return this._buffer.split(/\r?\n/).filter(function (i) {
    return i !== '';
  });
};

module.exports = GedcomFile;
