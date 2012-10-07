var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    Gedcom = require('../');

describe('Core', function () {
  var gedcom;

  // Create a fresh server and registry before each test.
  beforeEach(function (done) {
    gedcom = new Gedcom();
    done();
  });

  // Close the server after each test.
  afterEach(function (done) {
    done();
  });

  function createStream(filename) {
    return fs.createReadStream(path.join(__dirname, 'fixtures', filename), { encoding: 'UTF-8' });
  }

  it('throws an error when parsing without a stream configured', function (done) {
    gedcom.toArray(function (err, data) {
      assert.notEqual(err, null);
      done();
    });
  });

  it('returns an empty array on parsing an empty gedcom file', function (done) {
    gedcom.readStream(createStream('empty.ged'));
    gedcom.toArray(function (err, data) {
      assert.deepEqual(data, []);
      done();
    });
  });

  it('returns an array with a nested object', function (done) {
    gedcom.readStream(createStream('single_object.ged'));
    gedcom.toArray(function (err, data) {
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
    gedcom.readStream(createStream('nested_objects.ged'));
    gedcom.toArray(function (err, data) {
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
