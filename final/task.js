const YEAR_MONTH = "y/m";
const RAINFALL = "rainfall";
const MAX_RAINFALL_PER_DAY = "max_rainfall_per_day";

let inputData;
let monthSelected = 0;
let lineChart1;
let lineChart2;
let barChart;

d3.csv("https://reih15.github.io/InfoVis2022/final/data_formatted.csv")
  .then((data) => {
    inputData = data;

    data.forEach((d) => {
      d[RAINFALL] = +d[RAINFALL];
      d[MAX_RAINFALL_PER_DAY] = +d[MAX_RAINFALL_PER_DAY];
    });

    lineChart1 = new LineChart(
      {
        parent: "#drawing_region_linechart_1",
        width: 600,
        height: 600,
        margin: { top: 50, right: 10, bottom: 50, left: 80 },
        target: RAINFALL,
        title: "降水量の合計",
        xlabel: "年/月",
        ylabel: "降水量 [mm]",
      },
      data
    );
    lineChart1.update();

    lineChart2 = new LineChart(
      {
        parent: "#drawing_region_linechart_2",
        width: 600,
        height: 600,
        margin: { top: 50, right: 10, bottom: 50, left: 50 },
        target: MAX_RAINFALL_PER_DAY,
        title: "日降水量の最大",
        xlabel: "年/月",
      },
      data
    );
    lineChart2.update();

    const months = Array.from(Array(12), (_, k) => k + 1);
    const avgData = months.map((m) => {
      const obj = { month: m };
      obj[RAINFALL] = d3.mean(dataMonth(data, m), (d) => d[RAINFALL]);
      return obj;
    });

    barChart = new BarChart(
      {
        parent: "#drawing_region_barchart",
        width: 512,
        height: 600,
        margin: { top: 50, right: 10, bottom: 50, left: 50 },
        title: "降水量の合計の月ごとの平均",
        xlabel: "月",
      },
      avgData
    );
    barChart.update();
  })
  .catch((error) => {
    console.log(error);
  });

/**
 * @param {d3.DSVRowArray<string>} data
 * @param {number} month
 */
function dataMonth(data, month) {
  return data.filter((d) => d[YEAR_MONTH].endsWith(`/${month}`));
}

/**
 * @param {d3.DSVRowArray<string>} data
 * @param {string} monthStr
 */
function toMonthIdx(data, monthStr) {
  const monthArray = d3.map(data, (d) => d[YEAR_MONTH]);
  const idx = monthArray.indexOf(monthStr);
  return idx;
}

/**
 * @param {d3.DSVRowArray<string>} data
 * @param {number} idx
 */
function toMonthStr(data, idx) {
  const monthArray = d3.map(data, (d) => d[YEAR_MONTH]);
  return idx < 0 ? "" : monthArray[idx];
}

class LineChart {
  constructor(config, data) {
    this.config = {
      parent: config.parent,
      width: config.width || 256,
      height: config.height || 256,
      margin: config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
      target: config.target || RAINFALL,
      title: config.title || "",
      xlabel: config.xlabel || "",
      ylabel: config.ylabel || "",
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
    self.yscale = d3.scaleLinear().range([self.innerHeight, 0]);

    self.xaxis = d3
      .axisBottom(self.xscale)
      .ticks(6)
      .tickSize(10)
      .tickSizeOuter(0)
      .tickFormat((d) => toMonthStr(self.data, d));
    self.xaxisGroup = self.chart
      .append("g")
      .attr("transform", `translate(0, ${self.innerHeight})`);
    self.yaxis = d3
      .axisLeft(self.yscale)
      .ticks(5)
      .tickSize(10)
      .tickSizeOuter(0);
    self.yaxisGroup = self.chart.append("g");

    const titleSpace = 20;
    self.svg
      .append("text")
      .style("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("x", self.config.width / 2 - 30)
      .attr("y", self.config.margin.top - titleSpace)
      .text(self.config.title);

    const xlabelSpace = 50;
    self.svg
      .append("text")
      .style("font-size", "14px")
      .attr("x", self.config.width / 2)
      .attr("y", self.innerHeight + self.config.margin.top + xlabelSpace)
      .text(self.config.xlabel);

    const ylabelSpace = 70;
    self.svg
      .append("text")
      .style("font-size", "14px")
      .attr("transform", `rotate(-90)`)
      .attr("y", self.config.margin.left - ylabelSpace)
      .attr("x", -((self.config.height - self.config.margin.bottom) / 2))
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .text(self.config.ylabel);
  }

  update() {
    let self = this;

    const xDomMargin = 3;
    const yDomMargin = 20;

    const xmin = 0;
    const xmax = self.data.length - 1;
    self.xscale.domain([xmin - xDomMargin, xmax + xDomMargin]);

    const ymin = d3.min(self.data, (d) => d[self.config.target]);
    const ymax = d3.max(self.data, (d) => d[self.config.target]);
    self.yscale.domain([ymin - yDomMargin, ymax + yDomMargin]);

    self.render();
  }

  render() {
    let self = this;

    const line = d3
      .line()
      .x((d) => self.xscale(toMonthIdx(self.data, d[YEAR_MONTH])))
      .y((d) => self.yscale(d[self.config.target]));

    self.path = self.chart
      .append("path")
      .attr("d", line(self.data))
      .attr("stroke", "black")
      .attr("fill", "none");

    const r = 4;
    self.circles = self.chart
      .selectAll("circle")
      .data(self.data)
      .enter()
      .append("circle")
      .attr("cx", (d) => self.xscale(toMonthIdx(self.data, d[YEAR_MONTH])))
      .attr("cy", (d) => self.yscale(d[self.config.target]))
      .attr("r", r)
      .attr("fill", "black");

    self.circles
      .on("mouseover", (_, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<div class="tooltip-label">${d[YEAR_MONTH]}</div>${
              d[self.config.target]
            } mm`
          );
      })
      .on("mousemove", (e) => {
        const padding = 10;
        d3.select("#tooltip")
          .style("left", e.pageX + padding + "px")
          .style("top", e.pageY + padding + "px");
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    self.xaxisGroup.call(self.xaxis).style("font-size", 10);
    self.yaxisGroup.call(self.yaxis).style("font-size", 10);
  }
}

class BarChart {
  constructor(config, data) {
    this.config = {
      parent: config.parent,
      width: config.width || 256,
      height: config.height || 256,
      margin: config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
      title: config.title || "",
      xlabel: config.xlabel || "",
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

    self.xscale = d3
      .scaleBand()
      .range([0, self.innerWidth])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    self.yscale = d3.scaleLinear().range([self.innerHeight, 0]);

    self.xaxis = d3.axisBottom(self.xscale).tickSizeOuter(0);
    self.xaxisGroup = self.chart
      .append("g")
      .attr("transform", `translate(0, ${self.innerHeight})`);
    self.yaxis = d3.axisLeft(self.yscale).ticks(5).tickSizeOuter(0);
    self.yaxisGroup = self.chart.append("g");

    const titleSpace = 20;
    self.svg
      .append("text")
      .style("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("x", self.config.width / 2 - 50)
      .attr("y", self.config.margin.top - titleSpace)
      .text(self.config.title);

    const xlabelSpace = 50;
    self.svg
      .append("text")
      .style("font-size", "14px")
      .attr("x", self.config.margin.left + self.innerWidth / 2)
      .attr("y", self.innerHeight + self.config.margin.top + xlabelSpace)
      .text(self.config.xlabel);
  }

  update() {
    let self = this;

    self.xscale.domain(self.data.map((d) => d.month));

    const yDomMargin = 10;
    const ymin = d3.min(self.data, (d) => d[RAINFALL]);
    const ymax = d3.max(self.data, (d) => d[RAINFALL]);
    self.yscale.domain([ymin - yDomMargin, ymax + yDomMargin]);

    self.render();
  }

  render() {
    let self = this;

    const color = "dodgerblue";

    self.chart
      .selectAll(".bar")
      .data(self.data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => self.xscale(d.month))
      .attr("y", (d) => self.yscale(d[RAINFALL]))
      .attr("width", self.xscale.bandwidth())
      .attr("height", (d) => self.innerHeight - self.yscale(d[RAINFALL]))
      .attr("fill", color)
      .on("click", function (_, d) {
        const active = monthSelected !== d.month;

        self.chart.selectAll(".bar").classed("active", false);
        if (active) {
          monthSelected = d.month;
          d3.select(this).classed("active", true);
        } else {
          monthSelected = 0;
        }

        updateAll();
      });

    self.xaxisGroup.call(self.xaxis);
    self.yaxisGroup.call(self.yaxis);
  }
}

function updateAll() {
  lineChart1.path.remove();
  lineChart1.circles.remove();
  lineChart2.path.remove();
  lineChart2.circles.remove();

  if (monthSelected === 0) {
    lineChart1.data = inputData;
    lineChart2.data = inputData;
    lineChart1.update();
    lineChart2.update();
  } else {
    const monthData = dataMonth(inputData, monthSelected);
    lineChart1.data = monthData;
    lineChart2.data = monthData;
    lineChart1.update();
    lineChart2.update();
  }
}
