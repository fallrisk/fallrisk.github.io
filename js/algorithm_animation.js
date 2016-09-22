

// @file
// Follows Javscript Style defined at http://standardjs.com/rules.html.

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

function startMergeSortAnimation () {
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
}

// This function is called once the document finishes loading.
$(function () {
	startMergeSortAnimation()
}) // End onLoad function
