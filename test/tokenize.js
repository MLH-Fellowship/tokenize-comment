'use strict';

require('mocha');
var assert = require('assert');
var support = require('./support');
var tokenize = require('..');

var fixtures = support.files(__dirname, 'fixtures');

describe('tokenize', function() {
  it('should tokenize a block comment', function() {
    var tok = tokenize('/* foo */');
    assert.deepEqual(tok, { description: 'foo', footer: '', examples: [], tags: [] });
  });

  it('should tokenize a comment with a multi-line description', function() {
    var tok = tokenize('/* foo\nbar\nbaz */');
    assert.deepEqual(tok, { description: 'foo\nbar\nbaz', footer: '', examples: [], tags: [] });
  });

  it('should strip extraneous indentation from comments', function() {
    var tok = tokenize([
      '/**',
      ' *      foo bar baz',
      ' *      ',
      ' *      ',
      ' *      @param {string} something',
      ' *      @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          value: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          value: '{string} else'
        }
      ]
    });
  });

  it('should work with comments that already have stars stripped', function() {
    var tok1 = tokenize([
      '',
      ' foo bar baz',
      ' ',
      ' ',
      ' @param {string} something',
      ' @param {string} else',
      ''
    ].join('\n'));

    assert.deepEqual(tok1, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          value: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          value: '{string} else'
        }
      ]
    });

    var tok2 = tokenize([
      'foo bar baz',
      '',
      '',
      '@param {string} something',
      '@param {string} else'
    ].join('\n'));

    assert.deepEqual(tok2, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          value: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          value: '{string} else'
        }
      ]
    });
  });

  it('should tokenize complicated comments', function() {
    var tok1 = tokenize(fixtures['example-large']);
    assert.deepEqual(tok1, {
      description: '',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\n <example name="NgModelController" module="customControl" deps="angular-sanitize.js">\n    <file name="style.css">\n      [contenteditable] {\n        border: 1px solid black;\n        background-color: white;\n        min-height: 20px;\n      }\n\n      .ng-invalid {\n        border: 1px solid red;\n      }\n\n    </file>\n    <file name="script.js">\n      angular.module(\'customControl\', [\'ngSanitize\']).\n        directive(\'contenteditable\', [\'$sce\', function($sce) {\n          return {\n            restrict: \'A\', // only activate on element attribute\n            require: \'?ngModel\', // get a hold of NgModelController\n            link: function(scope, element, attrs, ngModel) {\n              if (!ngModel) return; // do nothing if no ng-model\n\n              // Specify how UI should be updated\n              ngModel.$render = function() {\n                element.html($sce.getTrustedHtml(ngModel.$viewValue || \'\'));\n              };\n\n              // Listen for change events to enable binding\n              element.on(\'blur keyup change\', function() {\n                scope.$evalAsync(read);\n              });\n              read(); // initialize\n\n              // Write data to the model\n              function read() {\n                var html = element.html();\n                // When we clear the content editable the browser leaves a <br> behind\n                // If strip-br attribute is provided then we strip this out\n                if ( attrs.stripBr && html == \'<br>\' ) {\n                  html = \'\';\n                }\n                ngModel.$setViewValue(html);\n              }\n            }\n          };\n        }]);\n    </file>\n    <file name="index.html">\n      <form name="myForm">\n       <div contenteditable\n            name="myWidget" ng-model="userContent"\n            strip-br="true"\n            required>Change me!</div>\n        <span ng-show="myForm.myWidget.$error.required">Required!</span>\n       <hr>\n       <textarea ng-model="userContent" aria-label="Dynamic textarea"></textarea>\n      </form>\n    </file>\n    <file name="protractor.js" type="protractor">\n    it(\'should data-bind and become invalid\', function() {\n      if (browser.params.browser == \'safari\' || browser.params.browser == \'firefox\') {\n        // SafariDriver can\'t handle contenteditable\n        // and Firefox driver can\'t clear contenteditables very well\n        return;\n      }\n      var contentEditable = element(by.css(\'[contenteditable]\'));\n      var content = \'Change me!\';\n\n      expect(contentEditable.getText()).toEqual(content);\n\n      contentEditable.clear();\n      contentEditable.sendKeys(protractor.Key.BACK_SPACE);\n      expect(contentEditable.getText()).toEqual(\'\');\n      expect(contentEditable.getAttribute(\'class\')).toMatch(/ng-invalid-required/);\n    });\n    </file>\n </example>\n',
        value: '\n <example name="NgModelController" module="customControl" deps="angular-sanitize.js">\n    <file name="style.css">\n      [contenteditable] {\n        border: 1px solid black;\n        background-color: white;\n        min-height: 20px;\n      }\n\n      .ng-invalid {\n        border: 1px solid red;\n      }\n\n    </file>\n    <file name="script.js">\n      angular.module(\'customControl\', [\'ngSanitize\']).\n        directive(\'contenteditable\', [\'$sce\', function($sce) {\n          return {\n            restrict: \'A\', // only activate on element attribute\n            require: \'?ngModel\', // get a hold of NgModelController\n            link: function(scope, element, attrs, ngModel) {\n              if (!ngModel) return; // do nothing if no ng-model\n\n              // Specify how UI should be updated\n              ngModel.$render = function() {\n                element.html($sce.getTrustedHtml(ngModel.$viewValue || \'\'));\n              };\n\n              // Listen for change events to enable binding\n              element.on(\'blur keyup change\', function() {\n                scope.$evalAsync(read);\n              });\n              read(); // initialize\n\n              // Write data to the model\n              function read() {\n                var html = element.html();\n                // When we clear the content editable the browser leaves a <br> behind\n                // If strip-br attribute is provided then we strip this out\n                if ( attrs.stripBr && html == \'<br>\' ) {\n                  html = \'\';\n                }\n                ngModel.$setViewValue(html);\n              }\n            }\n          };\n        }]);\n    </file>\n    <file name="index.html">\n      <form name="myForm">\n       <div contenteditable\n            name="myWidget" ng-model="userContent"\n            strip-br="true"\n            required>Change me!</div>\n        <span ng-show="myForm.myWidget.$error.required">Required!</span>\n       <hr>\n       <textarea ng-model="userContent" aria-label="Dynamic textarea"></textarea>\n      </form>\n    </file>\n    <file name="protractor.js" type="protractor">\n    it(\'should data-bind and become invalid\', function() {\n      if (browser.params.browser == \'safari\' || browser.params.browser == \'firefox\') {\n        // SafariDriver can\'t handle contenteditable\n        // and Firefox driver can\'t clear contenteditables very well\n        return;\n      }\n      var contentEditable = element(by.css(\'[contenteditable]\'));\n      var content = \'Change me!\';\n\n      expect(contentEditable.getText()).toEqual(content);\n\n      contentEditable.clear();\n      contentEditable.sendKeys(protractor.Key.BACK_SPACE);\n      expect(contentEditable.getText()).toEqual(\'\');\n      expect(contentEditable.getAttribute(\'class\')).toMatch(/ng-invalid-required/);\n    });\n    </file>\n </example>\n'
      }],
      tags: []
    });
  });
});
