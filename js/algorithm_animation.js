// Copyright Justin Watson 2016

// @file
// Follows Javscript Style defined at http://standardjs.com/rules.html.
// And the "revelaing" module pattern from
// https://toddmotto.com/mastering-the-module-pattern/.
//
// # References
// https://github.com/d3/d3-scale-chromatic
// https://bl.ocks.org/mbostock/3808218
// https://bl.ocks.org/mbostock/3808234
// https://bost.ocks.org/mike/bar/2/
//

var MergeSortAnimation = (function () {

// Adjustable Variables, with default values.
var N = 5
var svgWidth = 800
// Dependent Variables
var svgHeight = 100
var numbers = []
var svg = null
var margin = 1 // Unit: pixels
var barWidth = (svgWidth - margin * (N + 1)) / N
var auxArray = []
var mergeSteps = []

function update (step) {
  var t = d3.transition().duration(200)

  var stepNumbers = mergeSteps[step]

  // UPDATE old elements present in new data.
  svg.selectAll('rect')
    .data(stepNumbers, function (d) {
      return d
    })
      .transition(t)
      .attr('x', function (d, i) {
        return (i * barWidth + (i + 1) * margin)
      })
}

// Returns an array of count N random numbers with
// no repeating numbers.
function getRandomArray (N) {
  var numbers = new Set()
  for (var i = 0; i < N; i++) {
    numbers.add(Math.floor(Math.random() * 1000))
  }
  return numbers
}

function merge (numbers, lo, mid, hi) {
  var i = lo
  var j = mid + 1
  var newIndex = 0
  var k = lo

  for (; k <= hi; k++) {
    auxArray[k] = numbers[k]
  }

  for (var k = lo; k <= hi; k++) {
    if (i > mid) {
      numbers[k] = auxArray[j++]
      newIndex = j - 1
    } else if (j > hi) {
      numbers[k] = auxArray[i++]
      newIndex = i - 1
    } else if (auxArray[j] < auxArray[i]) {
      numbers[k] = auxArray[j++]
      newIndex = j - 1
    } else {
      numbers[k] = auxArray[i++]
      newIndex = i - 1
    }
  }
  mergeSteps.push(numbers.slice())
}

function sort (numbers, lo, hi) {
  if (hi <= lo) {
    return
  }
  var mid = Math.floor(lo + (hi - lo) / 2)
  sort(numbers, lo, mid, svg)
  sort(numbers, mid + 1, hi, svg)
  merge(numbers, lo, mid, hi, svg)
}

function start (options) {
  //var svg = options.svg
  N = options.count || N
  for (var i = 0; i < N; i++) {
    auxArray.push(0)
  }
  var svgId = options.svgId || '#algorithm_animation'
  svg = d3.select(svgId)
  numbers = Array.from(getRandomArray(N))
  svgWidth = Math.min(options.width || 100, svgWidth)
  barWidth = (svgWidth - margin * (N + 1)) / N
  // SVG setup.
  svg.attr('width', svgWidth)
  svg.attr('height', svgHeight)
  // Generate a bunch of random height bars. The height is from the
  // array "numbers."
  var minNumber = d3.min(numbers)
  var maxNumber = d3.max(numbers)
  var heightScale = d3.scaleLinear()
    .domain([minNumber, maxNumber])
    .range([5, svgHeight])
  var colorScale = d3.scaleLinear()
    .domain([minNumber, maxNumber])
    .range([0, 1])

  var bars = svg.selectAll('rect')
    .data(numbers.slice())
    .enter().append('rect')
      .attr('width', barWidth)
      .attr('height', function (d) {
        return heightScale(d)
      })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', function (d, i) {
        return d3.interpolateRainbow(colorScale(d))
      })
      .attr('x', function (d, i) {
        return (i * barWidth + (i + 1) * margin)
      })

  mergeSteps.push(numbers.slice()) // Initial step.
  // Do all sorting and save the state after each merge step.
  sort(numbers, 0, numbers.length - 1, svg)
  // Animate the merge steps.
  var step = 0
  var it = d3.interval(function () {
    if (step >= mergeSteps.length) {
      it.stop()
      return
    }
    update(step)
    step = step + 1
  }, 500)
}

return {
  start: start
}

})();

// This function is called once the document finishes loading.
$(function () {
  MergeSortAnimation.start({
    count: 100,
    svgId: '#merge-sort-anim',
    width: $(window).width()
  })
}) // End onLoad function
