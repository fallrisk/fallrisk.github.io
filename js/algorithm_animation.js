

// @file
// Follows Javscript Style defined at http://standardjs.com/rules.html.

// Adjustable Variables
var N = 30
var svgWidth = 300
var svgElementName = '#algorithm_animation'
// Dependent Variables
var svgHeight = Math.floor(svgWidth * 3 / 4) // 4:3 ratio view.
var numbers = getNRandomNumbers(N)
var svg = d3.select(svgElementName)
var margin = 1 // Unit: pixels
var barWidth = (svgWidth - margin * (N + 1)) / N
var auxArray = []

function getRandomColor () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getNRandomNumbers (N) {
	var numbers = []
	for (var i = 0; i < N; i++) {
		numbers.push(Math.floor(Math.random() * 100))
	}
	return numbers
}

function startMergeSort (numbers, svg) {
	stepMergeSort(numbers, lo, hi, svg)
}

// Animate the transistion from the what the array looked like before the
// move to what it looks like now. Only one element makes a large move
// the rest have to shift.
//
// The variable eStart is the element to move.
// The variable eEnd is the elements new destination.
function animateMoveAndShift(elementIndex, eEnd, svg) {
  var elementBar = svg.selectAll('rect').filter(':nth-child(' + elementIndex + ')')
  var otherBars = svg.selectAll('rect').filter(':nth-child(n+' + elementIndex + ')')
  elementBar.transition()
    .attr('transform','translate(' + (eEnd * barWidth + (eEnd + 1) * margin) + ',' + margin + ')')
}

function stepMerge (numbers, lo, mid, hi, svg) {
	var i = lo
	var j = mid + 1
	for (var k = lo; k <= hi; k++) {
		auxArray[k] = numbers[k]
  }

  for (var k = lo; k <=hi; k++) {
  	var startArray = numbers.slice()
  	if (i > mid) {
      numbers[k] = aux[j++]
  	} else if (j > hi) {
      numbers[k] = aux[i++]
  	} else if (Math.min(auxArray[j], auxArray[i])) {
      numbers[k] = aux[j++]
  	} else {
      numbers[k] = aux[i++]
  	}
  	var endArray = numbers.slice()
  	// Now animate the step. Moving the bars around to there new positions.
  	animateTransition(startArray, endArray)
  }
}

function stepMergeSort (numbers, lo, hi, svg) {
	if (hi <= lo) {
		return
	}
	var mid = lo + (hi - lo) / 2
	stepMergeSort(numbers, lo, mid, svg)
	stepMergeSort(numbers, mid+1, hi, svg)
	stepMerge(numbers, lo, mid, hi, svg)
}

function startMergeSortAnimation () {
	// SVG setup.
	svg.attr('width', svgWidth)
	svg.attr('height', svgHeight)
	// Generate a bunch of random height bars. The height is from the
	// array "numbers."
	var minNumber = d3.min(numbers)
	var maxNumber = d3.max(numbers)
	var heightScale = d3.scaleLinear()
		.domain([minNumber, maxNumber])
		.range([1, svgHeight])
	for (var i = 0; i < N; i++) {
		var bar = svg.append('rect')
		bar.attr('width', barWidth)
		bar.attr('height', function (d) {
			return heightScale(numbers[i])
		})
		bar.attr('fill', getRandomColor())
		bar.attr('transform', 'translate(' + (i * barWidth + (i + 1) * margin) + ',' + margin + ')')
	}
	//startMergeSort(numbers, svg)
  // Test the animate transition.
  testAnimationTransition(numbers, svg)
}

function testAnimationTransition (numbers, svg) {
  var a = numbers
  var b = numbers.slice()
  var t = b[25]
  b[25] = b[30 - 1]
  for (var i = 30 - 1; i >= 26; i--) {
    b[i] = b[i - 1]
  }
  b[26] = t
  animateMoveAndShift(29, 25, svg)
}

// This function is called once the document finishes loading.
$(function () {
	startMergeSortAnimation()
}) // End onLoad function
