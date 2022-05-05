d3.csv("https://reih15.github.io/InfoVis2022/w04/task1.csv")
  .then((data) => {
    data.forEach((d) => {
      d.x = +d.x;
      d.y = +d.y;
    });

    var config = {
      parent: "#drawing_region",
      width: 512,
      height: 512,
      margin: { top: 20, right: 20, bottom: 30, left: 30 },
    };

    const scatter_plot = new ScatterPlot(config, data);
    scatter_plot.update();
  })
  .catch((error) => {
    console.log(error);
  });

class ScatterPlot {
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

    self.inner_width =
      self.config.width - self.config.margin.left - self.config.margin.right;
    self.inner_height =
      self.config.height - self.config.margin.top - self.config.margin.bottom;

    self.xscale = d3.scaleLinear().range([0, self.inner_width]);
    self.yscale = d3.scaleLinear().range([0, self.inner_height]);

    self.xaxis = d3.axisBottom(self.xscale).ticks(10).tickSize(10);
    self.xaxis_group = self.chart
      .append("g")
      .attr("transform", `translate(0, ${self.inner_height})`);
    self.yaxis = d3.axisLeft(self.yscale).ticks(10).tickSize(10);
  }

  update() {
    let self = this;

    const domMargin = 20;

    const xmin = d3.min(self.data, (d) => d.x);
    const xmax = d3.max(self.data, (d) => d.x);
    self.xscale.domain([xmin - domMargin, xmax + domMargin]);

    const ymin = d3.min(self.data, (d) => d.y);
    const ymax = d3.max(self.data, (d) => d.y);
    self.yscale.domain([ymin - domMargin, ymax + domMargin]);

    self.render();
  }

  render() {
    let self = this;

    self.chart
      .selectAll("circle")
      .data(self.data)
      .enter()
      .append("circle")
      .attr("cx", (d) => self.xscale(d.x))
      .attr("cy", (d) => self.yscale(d.y))
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.c);

    self.xaxis_group.call(self.xaxis);
    self.chart.append("g").call(self.yaxis);
  }
}
