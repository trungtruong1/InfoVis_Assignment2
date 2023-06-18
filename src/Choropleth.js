import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

function Choropleth(props) {
    const { data, selectedYear, locations, totalMode, parentCallback} = props;

    useEffect(() => {
        drawChoropleth();
        }, [data, selectedYear, locations, totalMode]);

    function drawChoropleth() {
        const margin = {top: 5, right: 0, bottom: 50, left: 350};
        let width = (document.getElementById("graph").offsetWidth)*0.6;
        let height = 400 - margin.top - margin.bottom;
        
        d3.select("#chart").select("svg").remove();
        d3.selectAll("#tooltip").remove();
        d3.select("#legend").select("svg").remove()

        // Define the position of the chart 
        const svg = d3.select("#chart")
            .append("svg")
            .attr('width', width + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left-200},${margin.top})`);


        // Map and projection
        var projection = d3.geoMercator()
            .scale(90)
            .center([0,70])
            .translate([width / 4, height / 3]);

        // let filteredData = data.filter(function(item) {
        //     return item.year === selectedYear.toString();
        // }); 

        let dataEachCountryInYear = data.filter(function(item) {
            return item.year === selectedYear.toString();
        }); 

        // console.log(dataEachCountryInYear)

        // let filteredData = dataEachCountryInYear.filter(item => item.country === 'Argentina');

        // console.log(filteredData)

        // const sumOfSuicides = filteredData.reduce((sum, item) => sum + parseInt(item.suicides_no), 0);
        // console.log(sumOfSuicides)

        var colorScale = d3.scaleThreshold()
            .domain([100, 1000, 2000, 5000, 10000, 20000])
            .range(d3.schemeBlues[7]);

        var colorScale_total = d3.scaleThreshold()
            .domain([1000, 10000, 100000, 500000, 1000000, 1500000])
            .range(d3.schemeBlues[7]);

        // const colorCode = d3.schemeBlues[7];
        // console.log(colorCode)
        const tooltip = d3.select("#chart")
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
                "Country: " + d.properties['name'] +
                "<br>Suicides: " + ((totalMode) ? (data.filter(item => item.country === d.properties['name']))
                    .reduce((sum, item) => sum + parseInt(item.suicides_no), 0) : (dataEachCountryInYear.filter(item => item.country === d.properties['name']))
                    .reduce((sum, item) => sum + parseInt(item.suicides_no), 0)))
              .style("left", (event.x) + "px")
              .style("top", (event.y)-100 + "px")

            //for highlighting
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
          }

        const moveTooltip = function(event, d) {
            tooltip
                .style("left", (event.x) + "px")
                .style("top", (event.y)-100 + "px")
        }

        const hideTooltip = function(event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
            
            //for highlighting
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .8)
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
        }
          
        svg.append("g")
            .selectAll("path")
            .data(locations)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
            .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
            let country_name = d.properties['name'];
            let filteredData = dataEachCountryInYear.filter(item => item.country === country_name);
            if(totalMode){
                filteredData = data.filter(item => item.country === country_name);
            }
            let sumOfSuicides = filteredData.reduce((sum, item) => sum + parseInt(item.suicides_no), 0);
            if(totalMode){
                return colorScale_total(sumOfSuicides);
            }
            return colorScale(sumOfSuicides);
            })
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)
            .on('click', function(d,i){
                parentCallback(i.properties["name"])
            }.bind(this))
            .attr("class", function(d){ return "Country" } )
            .style("stroke", "black") 
            .style("stroke-width", 0.5)
            .attr("id", (d) => d.properties['name']);

        // Legend    
        const legend = d3.select("#legend")
            .append("svg")
            .attr('width', width)
            .attr('height', 70)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        
        if(!totalMode){
            legend.append("rect").attr('x', -300).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#eff3ff")
            legend.append("text").attr("x", -300+18).attr("y", 18).text("0 - 100").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -150).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#9ecae1")
            legend.append("text").attr("x", -150+18).attr("y", 18).text("1000-2000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#4292c6")
            legend.append("text").attr("x", 18).attr("y", 18).text("5000-10000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 150).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#084594")
            legend.append("text").attr("x", 150+18).attr("y", 18).text("20000+").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -300).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#c6dbef")
            legend.append("text").attr("x", -300+18).attr("y", 36).text("100 - 1000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -150).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#6baed6")
            legend.append("text").attr("x", -150+18).attr("y", 36).text("2000-5000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2171b5")
            legend.append("text").attr("x", 18).attr("y", 36).text("10000-20000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
        } else {
            legend.append("rect").attr('x', -300).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#eff3ff")
            legend.append("text").attr("x", -300+18).attr("y", 18).text("0 - 1000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -150).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#9ecae1")
            legend.append("text").attr("x", -150+18).attr("y", 18).text("10000-100000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#4292c6")
            legend.append("text").attr("x", 18).attr("y", 18).text("500000-1000000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 150).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#084594")
            legend.append("text").attr("x", 150+18).attr("y", 18).text("1500000+").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -300).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#c6dbef")
            legend.append("text").attr("x", -300+18).attr("y", 36).text("1000 - 10000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', -150).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#6baed6")
            legend.append("text").attr("x", -150+18).attr("y", 36).text("100000-500000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
            legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2171b5")
            legend.append("text").attr("x", 18).attr("y", 36).text("100000-1500000").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
        }        
    }
}

export default Choropleth;