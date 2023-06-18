import React, { useEffect } from 'react';
import * as d3 from 'd3';

function PieChart(props) {
    const { data, selectedYear, chosenCountry, totalMode } = props;

    useEffect(() => {
        drawPieChart();
        }, [data, selectedYear, chosenCountry, totalMode]);

    function drawPieChart() {
        const margin = 40;
        let width = 400;
        let height = 400;

        d3.select("#chart3").select("svg").remove()

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        const radius = Math.min(width, height) / 2 - margin

        const svg = d3.select("#chart3")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("overflow", "visible")
        .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        let dataCountryInYear;
        if(!totalMode){
            dataCountryInYear = data.filter(function(item) {
                return item.year === selectedYear.toString() && item.country === chosenCountry;
            }); 
        } else{
            dataCountryInYear = data.filter(function(item) {
                return item.country === chosenCountry;
            });
        }

        // console.log(dataCountryInYear);
        const aggregatedData = {};

        for (let i = 0; i < dataCountryInYear.length; i++) {
            const entry = dataCountryInYear[i];
            const ageGroup = entry.age;
            const suicides = parseInt(entry.suicides_no);

            if (aggregatedData[ageGroup]) {
                aggregatedData[ageGroup] += suicides;
            } else {
                aggregatedData[ageGroup] = suicides;
            }
        }

        // set the color scale
        const color = d3.scaleOrdinal()
        .range(d3.schemeSet1);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
        .value(function(d) {return d[1]})
        const data_ready = pie(Object.entries(aggregatedData))
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)


        let mouseOver = function(d) {
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .5)
            d3.select(`#${this.getAttribute("data")}`)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "black")
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }
        
        const tooltip = d3.select("#chart3")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "green")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style("position", "absolute")
        
        const showTooltip = function(event, d) {
            tooltip
              .transition()
              .duration(200)
            tooltip
              .style("opacity", 1)
              .html(
                "Suicides: " + d.value)
              .style("left", (event.x) + "px")
              .style("top", (event.y)+120 + "px")
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .5)
            d3.select(`#${this.getAttribute("data")}`)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "black")
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
          }

        const moveTooltip = function(event, d) {
            tooltip
                .style("left", (event.x) + "px")
                .style("top", (event.y)+120 + "px")
        }

        const hideTooltip = function(event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .8)
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
        }

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
        .selectAll('mySlices')
        .data(data_ready)
        .join('path')
            .attr('d', arcGenerator)
            .attr('fill', function(d){ return(color(d.data[0])) })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .attr("data", () => chosenCountry)
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip);

        // Now add the annotation. Use the centroid method to get the best coordinates
        svg
        .selectAll('mySlices')
        .data(data_ready)
        .join('text')
        .text(function(d){ return d.data[0].replace(/ years/g, '')})
        .attr("transform", function(d) { 
            const centroid = arcGenerator.centroid(d);
            const x = centroid[0] * 2.1; // Increase the X-coordinate to move text farther horizontally
            const y = centroid[1] * 2.1; // Increase the Y-coordinate to move text farther vertically
            return `translate(${x}, ${y})`;})
        .style("text-anchor", "middle")
        .style("font-size", 17);

          // Add chart title
        if(!totalMode){
            svg.append("text")
                .attr("x", 0)
                .attr("y", (height / 2) - 10 )
                .attr("class", "chart-title")
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(
                    () => 
                        {
                        if(chosenCountry !== undefined){
                            return "Distribution by age of " + chosenCountry + " in " + selectedYear + " (age range)"
                        }
                        else{
                            return "Pick a country from the map first!"
                        }});
        } else{
            svg.append("text")
            .attr("x", 0)
            .attr("y", (height / 2) - 10 )
            .attr("class", "chart-title")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(
                () => 
                    {
                    if(chosenCountry !== undefined){
                        return "Distribution by age of " + chosenCountry + " all time" + "(age range)";
                    }
                    else{
                        return "Pick a country from the map first!"
                    }});
        }
    }
}

export default PieChart;