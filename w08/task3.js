d3.csv("https://reih15.github.io/InfoVis2022/w04/task2.csv")
  .then((data) => {
    data.forEach((d) => {
      d.value = +d.value;
    });

    var config = {
      parent: "#drawing_region",
      width: 512,
      height: 512,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
    };

    const pieChart = new PieChart(config, data);
    pieChart.update();
  })
  .catch((error) => {
    console.log(error);
  });

class PieChart {
  constructor(config, data) {
    this.config = {
      parent: config.parent,
      width: config.width || 256,
      height: config.height || 256,
      margin: config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
    };
    this.data = data;
    this.init();
  }

  init() {
    let self = this;

    self.svg = d3
      .select(self.config.parent)
      .attr("width", self.config.width)
      .attr("height", self.config.height);

    self.chart = self.svg
      .append("g")
      .attr(
        "transform",
        `translate(${self.config.width / 2}, ${self.config.height / 2})`
      );

    self.innerWidth =
      self.config.width - self.config.margin.left - self.config.margin.right;
    self.innerHeight =
      self.config.height - self.config.margin.top - self.config.margin.bottom;
  }

  update() {
    let self = this;

    self.render();
  }

  render() {
    let self = this;

    const pie = d3.pie().value((d) => d.value);
    const dataReady = pie(self.data);

    const radius = Math.min(self.innerWidth, self.innerHeight) / 2;
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    self.chart
      .selectAll("pie")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .style("stroke-width", "3px");

    self.chart
      .selectAll("pie")
      .data(dataReady)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .text((d) => d.data.label)
      .style("text-anchor", "middle")
      .attr("font-weight", "bold")
      .style("font-size", 30);
  }
}
