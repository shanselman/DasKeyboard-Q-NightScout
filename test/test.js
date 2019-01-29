const assert = require('assert');
const t = require('../index');

const black = '#000000';
const min = 50;
const max = 300;

describe('BloodSugar', function () {
  let app = new t.BloodSugar();
  app.geometry = {
    height: 1,
    width: 10,
    origin: {
      x: 1, y: 1
    }
  };

  it('#getBloodSugar', function () {
    app.getBloodSugar().then(function(val){
      console.log("in test Blood glucose is: " + val);
      assert.ok(val > 0);
    })
    
  });

  var tests = [
    {args: 50,     expected: 3},
    {args: 100,    expected: 5},
    {args: 150,    expected: 70},
    {args: 250,    expected: 10}
  ];

  // tests.forEach(function(test) {
  //   it('correctly lights up for sugar ' + test.args, function() {
  //     var res = app.generatePoints(test);
  //     assert.equal(res.length, test.expected);
  //   });
  // });

  it('#getColor', function () {
    assert.equal(black, app.getColor(99), 'Expected big number to return black');
    assert.notEqual(black, app.getColor(0), 'Expected 0 to return a number');
  });

  it('#generatePoints', function () {
    const testLights = function (percent) {
      const points = app.generatePoints(percent);
      for (let i = 0; i < points.length; i += 1) {
        if (points[i].color === black) {
          return i;
        }
      }

      return points.length;
    };

    const assertLights = function (val, expected) {
      const actual = testLights(val);
      const message = `For sugar value ${val}, I have ${actual} lights `
        + `(expected ${expected})`;
      assert(expected === actual, message);
    };

    assertLights(0.04, 0);
    assertLights(0.05, 1);
    assertLights(0.1, 1);
    assertLights(0.2, 2);
    assertLights(0.3, 3);
    assertLights(0.4, 4);
    assertLights(0.5, 5);
    assertLights(0.6, 6);
    assertLights(0.7, 7);
    assertLights(0.8, 8);
    assertLights(0.9, 9);
    assertLights(0.95, 10);
    assertLights(1.0, 10);
    assertLights(1.1, 10);
  });

  it('#run()', function () {
    return app.run().then((signal) => {
      //console.log(JSON.stringify(signal));
      assert.ok(signal);
    }).catch(error => {
      assert.fail(error);
    });
  });

  it('deletes old signals', function () {
    return app.deleteOldSignals();
  })
});
