var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GedcomStream = require('../');

describe('Core', function () {
  var gedcomStream,
      data;

  beforeEach(function () {
    gedcomStream = new GedcomStream();
    data = [];
    gedcomStream.on('data', data.push.bind(data));
  });

  function createStream(filename) {
    return fs.createReadStream(path.join(__dirname, 'fixtures', filename), { encoding: 'UTF-8' });
  }

  it('returns an array with a nested object', function (done) {
    gedcomStream.on('end', function () {
      assert.deepEqual(data, [
        { id: 'I1', name: 'INDI', value: '', children: [
          { name: 'NAME', value: '', children: [] }
        ]},
        { id: 'I2', name: 'INDI', value: '', children: [
        ]}
      ]);
      done();
    });
    createStream('single_object.ged').pipe(gedcomStream);
  });

  it('returns a multilevel array for multilevel GEDCOM files', function (done) {
    gedcomStream.on('end', function () {
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
    createStream('nested_objects.ged').pipe(gedcomStream);
  });

  it('throws an error when the GEDCOM entry nesting is malformed', function (done) {
    gedcomStream.on('error', function (err) {
      assert.throws(err, Error);
      done();
    });
    createStream('malformed_gedcom.ged').pipe(gedcomStream);
  });
});
