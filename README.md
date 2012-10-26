# GEDCOM File

A processor for GEDCOM files. Gedcom is a writable stream that you can pipe data in to. It will emit objects (each one representing an entry from the GEDCOM file) as the stream is piped in.

## Usage

The implementation matches any standard writable stream: Initialise, pipe in a readable stream and use the data, end and error events to handle the output.

    var fs = require('fs'),
        Gedcom = require('gedcom'),
        gedcom = new Gedcom(),
        data = [];

    gedcom.on('data', data.push.bind(data));
    gedcom.on('data', function (data) {
      db.insert(data);
    });
    fs.createReadStream('family.ged').pipe(gedcom);

## Licence

This app is available under The MIT License or the WTFPL

### WTFPL

Visit [the WTFPL homepage](http://sam.zoy.org/wtfpl/) for the licence.

### MIT

Copyright (c) 2012 Paul Connolley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


