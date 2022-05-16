d3.csv("https://reih15.github.io/InfoVis2022/w04/task2.csv")
  .then((data) => {
    data.forEach((d) => {
      d.value = +d.value;
    });

    var config = {
      parent: "#drawing_region",
      width: 1024,
      height: 512,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
    };

    const barChart = new BarChart(config, data);
    barChart.update();
  })
  .catch((error) => {
    console.log(error);
  });

class BarChart {
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
        `translate(${self.config.margin.left}, ${self.config.margin.top})`
      );

    self.innerWidth =
      self.config.width - self.config.margin.left - self.config.margin.right;
    self.innerHeight =
      self.config.height - self.config.margin.top - self.config.margin.bottom;

    self.xscale = d3.scaleLinear().range([0, self.innerWidth]);
    self.yscale = d3.scaleBand().range([0, self.innerHeight]).paddingInner(0.1);

    self.xaxis = d3
      .axisBottom(self.xscale)
      .ticks(5)
      .tickSize(10)
      .tickSizeOuter(0);
    self.xaxisGroup = self.chart
      .append("g")
      .attr("transform", `translate(0, ${self.innerHeight})`);
    self.yaxis = d3.axisLeft(self.yscale).tickSize(10).tickSizeOuter(0);
    self.yaxisGroup = self.chart.append("g");
  }

  update() {
    let self = this;

    const xmin = 0;
    const xmax = d3.max(self.data, (d) => d.value);
    self.xscale.domain([xmin, xmax]);

    self.yscale.domain(self.data.map((d) => d.label));

    self.render();
  }

  render() {
    let self = this;

    self.chart
      .selectAll("rect")
      .data(self.data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => self.yscale(d.label))
      .attr("width", (d) => self.xscale(d.value))
      .attr("height", self.yscale.bandwidth())
      .attr("fill", (d) => d.color);

    self.xaxisGroup.call(self.xaxis).style("font-size", 16);
    self.yaxisGroup.call(self.yaxis).style("font-size", 16);
  }
}
