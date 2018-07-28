
var w=300;
var h=100;
var padding=2;
var dataSet=[5, 10, 14, 20, 25];

var svg = d3.select("body")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

svg.selectAll("rect")
   .data(dataSet)
   .enter()
   .append("rect")
   .attr("x",(d,i) =>{ return i* (w/dataSet.length);})
   .attr("y",(d) =>{return h -(d*4) })
   .attr("width", w/dataSet.length - padding)
   .attr("height",(d) => {return d*4 })
   .attr("fill",(d)=>{return "rgb(" + (d*10) + ", 0, 0)"; });

