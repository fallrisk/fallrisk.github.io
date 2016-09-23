// Copyright Justin Watson 2016
//
// @file
// Follows Javscript Style defined at http://standardjs.com/rules.html.
// And the "revelaing" module pattern from
// https://toddmotto.com/mastering-the-module-pattern/.
// https://github.com/d3/d3-scale-chromatic
//

var MergeSortAnimation = (function () {

// Adjustable Variables, with default values.
var N = 5
var svgWidth = 100
// Dependent Variables
var svgHeight = 100
var numbers = []
var svg = null
var margin = 1 // Unit: pixels
var barWidth = (svgWidth - margin * (N + 1)) / N
var auxArray = []
var mergeSteps = ['update-children']

// Animate the transistion from the what the array looked like before the
// move to what it looks like now. Only one element makes a large move
// the rest have to shift.
//
// The variable eStart is the element to move.
// The variable eEnd is the elements new destination.
function animateMoveAndShift(elementIndex, eEnd, svg, updateChildren, index) {
  var otherBars = null

  if (elementIndex > eEnd) {
    otherBars = svg.selectAll('rect')
      .filter(':nth-child(n+' + (eEnd + 1) + ')')
      .filter(':nth-child(-n+' + (elementIndex) + ')')
  } else {
    otherBars = svg.selectAll('rect')
      .filter(':nth-child(n+' + (elementIndex + 1) + ')')
      .filter(':nth-child(-n+' + (eEnd) + ')')
  }
  var elementBar = svg.selectAll('rect').filter(':nth-child(' + (elementIndex + 1) + ')')
  if (updateChildren) {
    elementBar.transition()
      .attr('x', (eEnd * barWidth + (eEnd + 1) * margin))
      .on('end', function () {
        var moveSet = new Set()
        for (var i = index; mergeSteps[i] !== 'update-children'; i--) {
          moveSet.add(mergeSteps[i])
        }
        var svgNode = svg._groups[0][0]
        for (var i = 0; i < moveSet.length; i++) {
          svgNode.insertBefore(svgNode.children[moveSet[i][0]],
            svgNode.children[moveSet[i][1]])
        }
      })
  } else {
    elementBar.transition().delay(1000)
      .attr('x', (eEnd * barWidth + (eEnd + 1) * margin))
  }
}

// Returns an array of count N random numbers.
function getRandomArray (N) {
  var numbers = []
  for (var i = 0; i < N; i++) {
    numbers.push(Math.floor(Math.random() * 100))
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
    if (k !== newIndex) {
      mergeSteps.push([k, newIndex])
    }
  }
  mergeSteps.push('update-children')
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
  numbers = getRandomArray(N)
  svgWidth = options.width || 100
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
  for (var i = 0; i < N; i++) {
    var bar = svg.append('rect')
    bar.attr('width', barWidth)
    bar.attr('height', function (d) {
      return heightScale(numbers[i])
    })
    bar.attr('rx', 4)
    bar.attr('ry', 4)
    bar.attr('fill', function () {
      return d3.interpolateRainbow(colorScale(numbers[i]))
    })
    bar.attr('x', (i * barWidth + (i + 1) * margin))
  }
  sort(numbers, 0, numbers.length - 1, svg)
  // Now we create a bunch of timeout functions that go through the animation.
  for (var i = 0; i < mergeSteps.length; i++) {
    if (mergeSteps[i] === 'update-children') {
      continue
    }
    if (mergeSteps[i + 1] === 'update-children') {
      setTimeout(animateMoveAndShift, i * 200, mergeSteps[i][0], mergeSteps[i][1], svg, true, i)
    } else {
      setTimeout(animateMoveAndShift, i * 200, mergeSteps[i][0], mergeSteps[i][1], svg, false, i)
    }
  }
}

return {
  start: start
}

})();

// This function is called once the document finishes loading.
$(function () {
  // MergeSortAnimation.start({
  //   count: 5,
  //   svgId: '#algorithm_animation',
  //   width: $(window).width()
  // })
}) // End onLoad function
