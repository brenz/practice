
var w = 300;
var h = 120;
var padding = 2;
var dataSet = [5, 10, 14, 20, 25,
  11, 25, 22, 18, 7];

var svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

function colorPicker(v) {
  if (v <= 20) { return "#666666"; }
  else if (v > 20) { return "#ff0033"; }
}

svg.selectAll("rect")
  .data(dataSet)
  .enter()
  .append("rect")
  .attr("x", (d, i) => { return i * (w / dataSet.length); })
  .attr("y", (d) => { return h - (d * 4) })
  .attr("width", w / dataSet.length - padding)
  .attr("height", (d) => { return d * 4 })
  .attr("fill", (d) => colorPicker(d));

svg.selectAll("text")
  .data(dataSet)
  .enter()
  .append("text")
  .text(function (d) { return d; })
  .attr("text-anchor", "middle")
  .attr("x", (d, i) => { return i * (w / dataSet.length) + (w / dataSet.length) / 2; })
  .attr("y", (d) => { return h - (d * 4) +14 })
  .attr("font-family", "sans-serif")
  .attr("fill","#ffffff")
  .attr("font-size",12)




