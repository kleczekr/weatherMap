// a sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// colour codes for weather alerts
const colourCodes = {
  heat: "#EB96AA",
  red: "#C54B6C",
  fire: "#C54B6C",
  flood: "#B6D8F2",
  wind: "#5784BA",
  thunderstorm: "#F7CE76",
};

//Width and height
const w = 1100;
const h = 500;

const container = ".map-container";

//Define map projection
const projection = d3
  .geoAlbersUsa()
  .translate([w / 6, h / 6])
  .scale([800]);

//Define quantize scale to sort data values into buckets of color
const color = d3
  .scaleQuantize()
  .range([
    "rgb(237,248,233)",
    "rgb(186,228,179)",
    "rgb(116,196,118)",
    "rgb(49,163,84)",
    "rgb(0,109,44)",
  ]);
//Colors derived from ColorBrewer, by Cynthia Brewer, and included in
//https://github.com/d3/d3-scale-chromatic

function drawMap(alerts) {
  //Create SVG element
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // A path generator
  const path = d3.geoPath().projection(projection);

  // define what to do when dragging
  const zooming = (event) => {
    // new offset arrat
    let offset = [event.transform.x, event.transform.y];
    //calculate new scale
    const newScale = event.transform.k * 125;
    // update the projection with the new offset and scale
    projection.translate(offset).scale(newScale);
    // update all paths and circles
    svg.selectAll("path").attr("d", path);
    svg
      .selectAll("circle")
      .attr(
        "cx",
        (d) => projection([d.coordinateValues[0], d.coordinateValues[1]])[0]
      )
      .attr(
        "cy",
        (d) => projection([d.coordinateValues[0], d.coordinateValues[1]])[1]
      );
  };

  const zoom = d3.zoom().on("zoom", zooming);

  // create a container in which all pannable elements will live
  const map = svg
    .append("g")
    .attr("id", "map")
    .call(zoom) // bind the zoom behavior
    .call(
      zoom.transform,
      d3.zoomIdentity // then apply the initial transforms
        .translate(w / 2, h / 2)
        .scale(6.75)
    );

  // Append Div for tooltip to SVG
  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  map
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("opacity", 0);

  const createPanButtons = function () {
    //Create the clickable groups

    //North
    const north = svg
      .append("g")
      .attr("class", "pan") //All share the 'pan' class
      .attr("id", "north"); //The ID will tell us which direction to head

    north
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", 30);

    north
      .append("text")
      .attr("x", w / 2)
      .attr("y", 20)
      .html("&uarr;");

    //South
    const south = svg.append("g").attr("class", "pan").attr("id", "south");

    south
      .append("rect")
      .attr("x", 0)
      .attr("y", h - 30)
      .attr("width", w)
      .attr("height", 30);

    south
      .append("text")
      .attr("x", w / 2)
      .attr("y", h - 10)
      .html("&darr;");

    //West
    const west = svg.append("g").attr("class", "pan").attr("id", "west");

    west
      .append("rect")
      .attr("x", 0)
      .attr("y", 30)
      .attr("width", 30)
      .attr("height", h - 60);

    west
      .append("text")
      .attr("x", 15)
      .attr("y", h / 2)
      .html("&larr;");

    //East
    const east = svg.append("g").attr("class", "pan").attr("id", "east");

    east
      .append("rect")
      .attr("x", w - 30)
      .attr("y", 30)
      .attr("width", 30)
      .attr("height", h - 60);

    east
      .append("text")
      .attr("x", w - 15)
      .attr("y", h / 2)
      .html("&rarr;");

    //Panning interaction

    d3.selectAll(".pan").on("click", function () {
      //Get current translation offset
      // const offset = projection.translate();

      //Set how much to move on each click
      const moveAmount = 50;

      // set x/y to 0 for now
      let x = 0;
      let y = 0;

      //Which way are we headed?
      const direction = d3.select(this).attr("id");

      //Modify the offset, depending on the direction
      switch (direction) {
        case "north":
          y += moveAmount; //Increase y offset
          break;
        case "south":
          y -= moveAmount; //Decrease y offset
          break;
        case "west":
          x += moveAmount; //Increase x offset
          break;
        case "east":
          x -= moveAmount; //Decrease x offset
          break;
        default:
          break;
      }

      // triggers zoom event, translating by x and y

      map.transition().call(zoom.translateBy, x, y);
    });
  };

  const createZoomButtons = () => {
    // create the clickable groups

    // zoom in button
    const zoomIn = svg
      .append("g")
      .attr("class", "zoom") // all share the 'zoom' class
      .attr("id", "in") // the id tells in which direction to head
      .attr("transform", `translate(${w - 110},${h - 70})`);

    zoomIn
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30);

    zoomIn.append("text").attr("x", 15).attr("y", 20).text("+");

    // zoom out button
    const zoomOut = svg
      .append("g")
      .attr("class", "zoom")
      .attr("id", "out")
      .attr("transform", `translate(${w - 70},${h - 70})`);

    zoomOut
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30);

    zoomOut.append("text").attr("x", 15).attr("y", 20).html("&ndash;");

    //zooming interaction
    d3.selectAll(".zoom").on("click", function () {
      //set how much to scale on each click
      let scaleFactor;
      // which way are we headed?
      let direction = d3.select(this).attr("id");
      //modify the k scale value depending on the direction
      switch (direction) {
        case "in":
          scaleFactor = 1.5;
          break;
        case "out":
          scaleFactor = 0.75;
          break;
        default:
          break;
      }

      //this triggers the zoom event, scaling by a scalefactor:
      map.transition().call(zoom.scaleBy, scaleFactor);
    });
  };
  //Load in GeoJSON data
  d3.json("us-states.json").then((json) => {
    // for (feature of json.features) {
    //   // console.log(feature.properties.name)
    //   const jsonState = feature.properties.name;
    //   // if (dataState === jsonState) {
    //   //   feature.properties.value = dataValue;
    //   //   break;
    //   // }
    // }

    map
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", (d) => {
        const value = d.properties.value;
        if (value) {
          return color(value);
        } else {
          return color(0);
        }
      });
    map
      .selectAll("myPath")
      .data(alerts)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("name", (d) =>
        typeof d.properties.event !== "undefined" ? d.properties.event : ""
      )
      .attr("headline", (d) => d.properties.headline)
      .attr("class", "alert-path")
      .style("fill", (d) => d.relevant_colour)
      // .style("fill", "#E5B3BB")
      // .style("fill", (d) => {
      //   const header = d.properties.headline.toLowerCase();
      //   console.log(header);
      //   for (item in colourCodes) {
      //     if (header.includes(item)) {
      //       return colourCodes[item];
      //     }
      //   }
      //   return "#BEB4C5";
      // })
      .style("opacity", 0.35)
      .on("mouseover", (event, d) => {
        console.log(d);
        // console.log(d.properties.headline);
        // console.log(event.path[0]);
        d3.select(event.path[0])
          .transition()
          .duration(600)
          .style("stroke", "black")
          .style("opacity", 1);

        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(
            d.properties.instruction == null
              ? `<h3><b>Event: </b>${d.properties.event}</h3><h4><b>Headline: </b>${d.properties.headline}</h4>`
              : `<h3><b>Event: </b>${d.properties.event}</h3><h4><b>Headline: </b>${d.properties.headline}</h4><p><b>Instruction:</b> ${d.properties.instruction}</p>`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.path[0])
          .transition()
          .duration(600)
          .style("stroke", "none")
          .style("opacity", 0.35);

        div.transition().duration(500).style("opacity", 0);
      });

    createPanButtons();
    createZoomButtons();
  });
}

////////////////////////////////////
////////// BACKEND HERE ////////////
////////////////////////////////////

// fetch the JSON with data
// using axios since I can't think of anything else
const dataSet = async function getData(link) {
  return await axios.get(link);
};

async function awaitData(link) {
  const data = dataSet(link);
  return data;
}

// a separate dictionary is used to backup polygons to be reused by other polygons
// (this would result in shorter loading time)
let backedUppedPolygons = {};

async function enrichData(alerts) {
  let newAlerts = [];
  for (const alert of alerts) {
    // if (alert.geometry == null) {
    if (alert.properties.affectedZones.length == 1) {
      const theZone = alert.properties.affectedZones[0];
      if (theZone in backedUppedPolygons) {
        const newData = backedUppedPolygons[theZone];
        alert.geometry = newData.data.geometry;
        newAlerts.push(alert);
      } else {
        const newData = await awaitData(theZone);
        backedUppedPolygons[theZone] = newData;
        alert.geometry = newData.data.geometry;
        newAlerts.push(alert);
      }
    } else {
      for (const zone of alert.properties.affectedZones) {
        if (zone in backedUppedPolygons) {
          const newData = backedUppedPolygons[zone];
          alert.geometry = newData.data.geometry;
          newAlerts.push(alert);
        } else {
          const newData = await awaitData(zone);
          backedUppedPolygons[zone] = newData;
          alert.geometry = newData.data.geometry;
          newAlerts.push(alert);
        }
      }
    }
    // } else {
    //   newAlerts.push(alert);
    // }
  }
  console.log(backedUppedPolygons);
  return newAlerts;
}

function checkDataForCompleteness(alerts) {
  alerts.forEach((d) => {
    if (d.properties == null) {
      console.log(d);
    }
  });
}

Promise.all([awaitData("https://api.weather.gov/alerts/active")]).then(
  (data) => {
    let alerts = data[0].data.features;
    console.log(alerts);
    alerts.forEach((d) => {
      try {
        d.geometry = turf.rewind(d.geometry, { reverse: true });
      } catch (err) {
        console.error(err);
      }
    });
    drawMap(alerts);
    Promise.all([enrichData(alerts)]).then((enrichedData) => {
      let newData = enrichedData[0];
      newData.forEach((d) => {
        try {
          d.geometry = turf.simplify(d.geometry, {
            tolerance: 0.05,
            highQuality: false,
            mutate: true,
          });
          d.geometry = turf.rewind(d.geometry, { reverse: true });
        } catch (err) {
          console.error(err);
        }
        const header =
          d.properties.headline != null
            ? d.properties.headline.toLowerCase()
            : "";
        let coloured = false;
        let relevant_colour = "";
        for (item in colourCodes) {
          if (header.includes(item)) {
            relevant_colour = colourCodes[item];
            coloured = true;
          }
        }
        if (!coloured) {
          relevant_colour = "#BEB4C5";
        }
        // const relevent_colour = () => {
        //   for (item in colourCodes) {
        //     if (header.includes(item)) {
        //       console.log()
        //       return colourCodes[item];
        //     }
        //   }
        //   return "#BEB4C5";
        // };
        d.relevant_colour = relevant_colour;
        // const header = d.properties.headline.toLowerCase();
        // console.log(header);
        // for (item in colourCodes) {
        //   if (header.includes(item)) {
        //     return colourCodes[item];
        //   }
        // }
        // return "#BEB4C5";
      });
      const filteredData = newData.filter((elem, pos, arr) => {
        return arr.indexOf(elem) == pos;
      });
      console.log("enrichment complete");
      console.log(filteredData);
      d3.select(container).html(null);
      drawMap(filteredData);
      // checkDataForCompleteness(enrichedData);
    });
  }
);
