d3.csv("https://reih15.github.io/InfoVis2022/final/data_formatted.csv")
  .then((data) => {
    data.forEach((d) => {
      d.rainfall = +d.rainfall;
      d.max_rainfall_per_day = +d.max_rainfall_per_day;
    });

    console.log(data);
  })
  .catch((error) => {
    console.log(error);
  });
