# GEDCOM File

A processor for GEDCOM files. Pass a readable stream and then call its toArray method to return the data in a friendly format.

No special processing of the file occurs; it simply returns a simple array/object that you can then easily post process when creating genealogy applications.

## Usage

Usage is pretty standard: Initialise, pass in a readable stream and then call toArray.

    var fs = require('fs'),
        Gedcom = require('gedcom'),
        gedcom = new Gedcom(),
        stream = fs.createReadStream('family.ged');

    gedcom.readStream(stream);
    gedcom.toArray(function (err, data) {
      console.log(data);
    });

## Licence

This app is available under The MIT License or the WTFPL

### WTFPL

Visit [the WTFPL homepage](http://sam.zoy.org/wtfpl/) for the licence.

### MIT

Copyright (c) 2012 Paul Connolley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


