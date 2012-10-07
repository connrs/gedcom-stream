var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GedcomFile = require('../');

describe('Core', function () {
  var gedcomFile;

  // Create a fresh server and registry before each test.
  beforeEach(function (done) {
    gedcomFile = new GedcomFile();
    done();
  });

  // Close the server after each test.
  afterEach(function (done) {
    done();
  });

  function createStream(filename) {
    return fs.createReadStream(path.join(__dirname, 'fixtures', filename), { encoding: 'UTF-8' });
  }

  it('can create a GedcomFile object', function (done) {
    done();
  });

  it('throws an error when parsing without a stream configured', function (done) {
    gedcomFile.toArray(function (err, data) {
      assert.notEqual(err, null);
      done();
    });
  });

  it('returns an empty array on parsing an empty gedcom file', function (done) {
    gedcomFile.readStream(createStream('empty.ged'));
    gedcomFile.toArray(function (err, data) {
      assert.deepEqual(data, []);
      done();
    });
  });

  it('returns an array with a nested object', function (done) {
    gedcomFile.readStream(createStream('single_object.ged'));
    gedcomFile.toArray(function (err, data) {
      assert.deepEqual(data, [
        { id: 'I1', name: 'INDI', value: '', children: [
          { name: 'NAME', value: '', children: [] }
        ]},
        { id: 'I2', name: 'INDI', value: '', children: [
        ]}
      ]);
      done();
    });
  });

  it('returns a multi-level array for multi-level GEDCOM files', function(done) {
    gedcomFile.readStream(createStream('nested_objects.ged'));
    gedcomFile.toArray(function (err, data) {
      assert.deepEqual(data, [
        { id: 'I1', name: 'INDI', value: '', children: [
          { name: 'NAME', value: 'Joe Bloggs', children: [] }
        ] },
        { id: 'I2', name: 'INDI', value: '', children: [
          { name: 'NAME', value: 'Jim Bliggs', children: [] },
          { name: 'ASSO', value: '@I1@', children: [
            { name: 'RELA', value: 'Godfather', children: [] }
          ] }
        ] }
      ]);
      done();
    });
  });
});
