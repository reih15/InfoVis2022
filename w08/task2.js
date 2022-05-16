class LineChart {
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
    self.yscale = d3.scaleLinear().range([0, self.innerHeight]);

    self.xaxis = d3
      .axisBottom(self.xscale)
      .ticks(5)
      .tickSize(10)
      .tickSizeOuter(0);
    self.xaxisGroup = self.chart
      .append("g")
      .attr("transform", `translate(0, ${self.innerHeight})`);
    self.yaxis = d3
      .axisLeft(self.yscale)
      .ticks(5)
      .tickSize(10)
      .tickSizeOuter(0);
    self.yaxisGroup = self.chart.append("g");
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

    const line = d3
      .line()
      .x((d) => self.xscale(d.x))
      .y((d) => self.yscale(d.y));

    self.chart
      .append("path")
      .attr("d", line(self.data))
      .attr("stroke", "black")
      .attr("fill", "none");

    const r = 6;
    self.chart
      .selectAll("circle")
      .data(self.data)
      .enter()
      .append("circle")
      .attr("cx", (d) => self.xscale(d.x))
      .attr("cy", (d) => self.yscale(d.y))
      .attr("r", r)
      .attr("fill", "black");

    self.xaxisGroup.call(self.xaxis).style("font-size", 12);
    self.yaxisGroup.call(self.yaxis).style("font-size", 12);
  }
}

const data = [
  { x: 0, y: 100 },
  { x: 40, y: 5 },
  { x: 120, y: 80 },
  { x: 150, y: 30 },
  { x: 200, y: 50 },
];

const config = {
  parent: "#drawing_region",
  width: 800,
  height: 500,
  margin: { top: 50, right: 50, bottom: 50, left: 50 },
};

const lineChart = new LineChart(config, data);
lineChart.update();
