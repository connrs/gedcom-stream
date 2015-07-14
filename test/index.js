var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    GedcomStream = require('../');

describe('Core', function () {
  var gedcomStream,
      data;

  var expected = {
    'nested': [
      { id: 'I1', name: 'INDI', value: '', children: [
        { name: 'NAME', value: 'Joe Bloggs', children: [] }
      ] },
      { id: 'I2', name: 'INDI', value: '', children: [
        { name: 'NAME', value: 'Jim Bliggs', children: [] },
        { name: 'ASSO', value: '@I1@', children: [
          { name: 'RELA', value: 'Godfather', children: [] }
        ] }
      ] }
    ],
    'single': [
      { id: 'I1', name: 'INDI', value: '', children: [
        { name: 'NAME', value: '', children: [] }
      ]},
      { id: 'I2', name: 'INDI', value: '', children: [
      ]}
    ],
  };

  beforeEach(function () {
    gedcomStream = new GedcomStream();
    // for some reason the event listeners persist even after recreating the object
    // which makes the 2nd test case fire the first test comparison
    gedcomStream.removeAllListeners('end');
    data = [];
    gedcomStream.on('data', data.push.bind(data));
  });

  function createStream(filename) {
    return fs.createReadStream(path.join(__dirname, 'fixtures', filename), { encoding: 'UTF-8' });
  }

  it('returns an array with a nested object', function (done) {
    gedcomStream.on('end', function () {
      assert.deepEqual(expected['single'], data);
      done();
    });
    createStream('single_object.ged').pipe(gedcomStream);
  });

  it('returns a multilevel array for multilevel GEDCOM files', function (done) {
    gedcomStream.on('end', function () {
      assert.deepEqual(expected['nested'], data);
      done();
    });
    createStream('nested_objects.ged').pipe(gedcomStream);
  });

  it('parses correctly when a chunk ends on newline', function (done) {
    gedcomStream.on('end', function () {
      assert.deepEqual(expected['nested'], data);
      done();
    });
    var input = createStream('nested_objects.ged');
    input.on('readable', function() {
      // we can't set the chunk size on a piped stream, so we have to manually process
      var chunk;
      while (null !== (chunk = input.read(42))) {
        gedcomStream.write(chunk);
      }
    });
    input.on('end', gedcomStream.end.bind(gedcomStream));
  })

  it('throws an error when the GEDCOM entry nesting is malformed', function (done) {
    gedcomStream.on('error', function (err) {
      assert.ok(err instanceof Error);
      done();
    });
    createStream('malformed_gedcom.ged').pipe(gedcomStream);
  });
});
