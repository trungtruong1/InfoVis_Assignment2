import React, { useEffect } from 'react';
import * as d3 from 'd3';

function BarChart(props) {
    const { data, countriesList, selectedYear, totalMode } = props;

    useEffect(() => {
        drawBarChart();
        }, [data, countriesList, selectedYear, totalMode]);

    function drawBarChart() {

        const margin = {top: 5, right: 150, bottom: 50, left: 150};
        let width = (document.getElementById("graph").offsetWidth - margin.left - margin.right)*0.2;
        let height = 400 - margin.top - margin.bottom;
        
        d3.select("#chart2").select("svg").remove()


        const svg = d3.select("#chart2")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        var subgroups = ['male', 'female'];

        let dataByCountry = data.filter(d => +countriesList.includes(d.country));

        let finalData = [];
        let finalDataTotal = [];
        
        countriesList.forEach(function(country) {
            let dataEachCountryInYear_male = dataByCountry.filter(function(item) {
                if(totalMode){
                    return item.country === country && item.sex === 'male';
                } else {
                    return item.country === country && item.year === selectedYear.toString() && item.sex === 'male';
                }
            }); 
            let dataEachCountryInYear_female = dataByCountry.filter(function(item) {
                if(totalMode){
                    return item.country === country && item.sex === 'female';
                } else{ 
                    return item.country === country && item.year === selectedYear.toString() && item.sex === 'female';
                }
            }); 
            let dataEachCountryInYear = dataByCountry.filter(function(item) {
                if(totalMode){
                    return item.country === country && item.sex;
                } else{ 
                    return item.country === country && item.year === selectedYear.toString();
                }
            }); 
            // console.log(dataEachCountryInYear_male)
            let countryData = {
              'country': country,
              'male': dataEachCountryInYear_male.reduce((sum, item) => sum + parseInt(item.suicides_no), 0),
              'female': dataEachCountryInYear_female.reduce((sum, item) => sum + parseInt(item.suicides_no), 0),
            };
            let countryDataTotal = {
              'country': country,
              'suicides': dataEachCountryInYear.reduce((sum, item) => sum + parseInt(item.suicides_no), 0),
            };
            finalData.push(countryData);
            finalDataTotal.push(countryDataTotal);
        });

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

        let mouseLeave = function(d) {
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .8)
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
        }

        // Create a scale for x-axis
        const xScale = d3.scaleBand()
            .domain(finalData.map(function(d) { return d.country; }))
            .range([0, width+100])
            .padding(0.2);

        // Create a scale for y-axis 
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(finalDataTotal, d=>d.suicides)])
            .range([height, 0])
            .nice();

        // // Define the position of each axis
        const xAxis = d3.axisBottom(xScale).tickSize(0);
        const yAxis = d3.axisLeft(yScale);

        // // Define a scale for color 
        const cScale = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#377eb8','#4daf4a']);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
              .attr("transform", "translate(-10,0)rotate(-45)")
              .style("text-anchor", "end");

        svg.append("g")
            .call(yAxis);

        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, xScale.bandwidth()])
            .padding([0.05])

        //onsole.log(finalData);
        // Draw the bars
        svg.selectAll("mybar")
            .data(finalData)
            .enter()
            .append("g")
              .attr("transform", function(d) { return "translate(" + xScale(d.country) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return subgroups.map(function(key) { 
                return {loc: d.country, key: key, value: +d[key]}; }); })
            .enter().append("rect")
              .attr("x", function(d) { return xSubgroup(d.key); })
              .attr("y", function(d) { return yScale(+d.value); })
              .attr("width", xSubgroup.bandwidth())
              .attr("data", (d) => d.loc)
              .attr("height", function(d) { 
                return height - yScale(+d.value); })
              .attr("fill", function(d) { return cScale(d.key); })
              .on("mouseover", mouseOver)
              .on("mouseleave", mouseLeave);

        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 100}, 20)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(subgroups)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", cScale);

        legendItems.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text(d => d);
                }
}

export default BarChart;