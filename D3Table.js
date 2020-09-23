let xhr = new XMLHttpRequest();
xhr.open(
	"GET",
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
	false
);
xhr.send();

const dataset = JSON.parse(xhr.responseText).monthlyVariance;
const baseTemperature = JSON.parse(xhr.responseText).baseTemperature;
const SVGwidth = 1400;
const SVGheight = 400;
const leftPadding = 75;
const rightPadding = 40;
const topPadding = 0;
const bottomPadding = 20;
const minYear = d3.min(dataset, d => d.year);
const maxYear = d3.max(dataset, d => d.year + 1);
const heightBar = (SVGheight - (topPadding + bottomPadding)) / 12;
const widthBar =
	(SVGwidth - (leftPadding + rightPadding)) / (maxYear - minYear);
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
const minTemp =
	Math.round((baseTemperature + d3.min(dataset, d => d.variance)) * 10) / 10;
const maxTemp =
	Math.round((baseTemperature + d3.max(dataset, d => d.variance)) * 10) / 10;
const colors = [
	"rgb(4,30,172)",
	"rgb(40,108,188)",
	"rgb(73,182,203)",
	"rgb(211,237,183)",
	"rgb(240,250,0)",
	"rgb(248,146,0)",
	"rgb(255,64,0)"
];
const legendHeight = 50;
const legendWidth = 300;
const legendBarWidth = legendWidth / colors.length;
const legendPadding = 50;
let tempArr = [];
document.getElementById("description").innerHTML =
	d3.min(dataset, d => d.year) +
	"-" +
	d3.max(dataset, d => d.year) +
	": base temperature: " +
	baseTemperature +
	"℃";
const yScaleAxe = d3
	.scaleBand()
	.domain(months)
	.range([0, SVGheight - (topPadding + bottomPadding)]);
const xScaleAxe = d3
	.scaleTime()
	.domain([minYear, maxYear])
	.range([0, SVGwidth - (leftPadding + rightPadding)]);
const xAxis = d3
	.axisBottom(xScaleAxe)
	.tickFormat(d3.format("d"))
	.tickSizeOuter(-6);
const yAxis = d3
	.axisLeft(yScaleAxe)
	.tickValues(months)
	.tickSizeOuter(-6);
let tooltip = d3
	.select("body")
	.append("div")
	.attr("id", "tooltip")
	.style("opacity", 0);
function tooltipInfo(data) {
	let tooltip = "";
	dataArray = [...Object.entries(data)];
	dataArray.forEach(item => {
		if (item[0] !== "month") {
			tooltip +=
				"<p class='tooltipText'>" + item[0] + ": " + item[1] + "</p>";
		} else {
			tooltip +=
				"<p class='tooltipText'>" +
				item[0] +
				": " +
				months[item[1] - 1] +
				"</p>";
		}
	});
	tooltip +=
		"<p>Temperature: " +
		Math.round((baseTemperature + dataArray[2][1]) * 10) / 10 +
		"℃ </p>";
	return tooltip;
}
function tempArrFuller() {
	let arr = [];
	arr.push(minTemp);
	for (let i = 1; i < colors.length; i++) {
		arr.push(
			Math.round(
				(minTemp +
					((d3.max(dataset, d => d.variance) -
						d3.min(dataset, d => d.variance)) /
						colors.length) *
						i) *
					10
			) / 10
		);
		console.log(
			minTemp +
				((d3.max(dataset, d => d.variance) -
					d3.min(dataset, d => d.variance)) /
					colors.length) *
					i
		);
	}
	arr.push(maxTemp);
	return arr;
}
function colorChooser(data) {
	let color = "";
	colors.forEach((item, i) => {
		if (data.variance + baseTemperature > tempArr[i]) {
			color = colors[i];
		} else if (data.variance + baseTemperature <= tempArr[0]) {
			color = colors[0];
		}
	});
	return color;
}
tempArr = tempArrFuller();
console.log(tempArr);
svg = d3
	.select(".container")
	.append("svg")
	.attr("width", SVGwidth)
	.attr("height", SVGheight);
svg.selectAll("rect")
	.data(dataset)
	.enter()
	.append("rect")
	.attr("x", d => xScaleAxe(d.year) + leftPadding)
	.attr("y", d => heightBar * (d.month - 1) + topPadding)
	.attr("width", widthBar)
	.attr("height", heightBar)
	.attr("fill", d => colorChooser(d))
	.attr("class", "cell")
	.attr("data-year", d => d.year)
	.attr("data-month", d => d.month - 1)
	.attr("data-temp", d => d.variance)
	.on("mouseover", d => {
		tooltip
			.transition()
			.duration(200)
			.style("opacity", 0.9);
		tooltip
			.html(tooltipInfo(d))
			.style("left", d3.event.pageX + 10 + "px")
			.style("top", d3.event.pageY - 25 + "px");
		tooltip.attr("data-year", d.year);
	})
	.on("mouseout", () => tooltip.style("opacity", 0));
svg.append("g")
	.attr(
		"transform",
		"translate(" + leftPadding + "," + (SVGheight - bottomPadding) + ")"
	)
	.attr("id", "x-axis")
	.call(xAxis);
svg.append("g")
	.attr("transform", "translate(" + leftPadding + ", " + topPadding + ")")
	.attr("id", "y-axis")
	.call(yAxis);
const legendScale = d3
	.scaleLinear()
	.domain([minTemp, maxTemp])
	.range([0, legendWidth]);
const legendAxis = d3
	.axisBottom(legendScale)
	.tickValues(tempArr)
	.tickFormat(d3.format(".2f"));
console.log(legendAxis);
svg2 = d3
	.select(".container")
	.append("svg")
	.attr("width", legendWidth + legendPadding * 2)
	.attr("height", legendHeight + legendPadding * 2)
	.attr("id", "legend");
svg2.selectAll("rect")
	.data(colors)
	.enter()
	.append("rect")
	.attr("x", (d, i) => i * legendBarWidth + legendPadding)
	.attr("y", legendPadding)
	.attr("width", legendBarWidth)
	.attr("height", legendHeight)
	.attr("fill", d => d);
svg2.append("g")
	.attr(
		"transform",
		"translate(" +
			legendPadding +
			"," +
			(legendHeight + legendPadding) +
			")"
	)
	.attr("id", "legend-axis")
	.call(legendAxis);
