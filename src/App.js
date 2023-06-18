import * as React from 'react';
import './App.css';
import * as d3 from 'd3'
import Choropleth from './Choropleth';
import worldLocation from './data/world.geojson';
import csvSuicide from './data/who_suicide_statistics.csv'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [totalMode, setTotalMode] = useState(false);
  const [locations, setLocations ] = useState([]);
  const [selectedYear, setSelectedYear] = useState([1979]);
  const [countries, setCountries] = useState([]);
  const [chosenCountry, setChosenCountry] = useState();

  const marks = [
    {
      value: 1979,
      label: "1979"
    },
    {
      value: 2016,
      label: "2016"
    }
  ];

  let handleCallback = (chosen) => {
    setCountries(countries => [...countries, chosen]);
    setChosenCountry(chosen);
  }

  useEffect(() => {
    d3.csv(csvSuicide)
    .then(data => {
      const filteredData = data.filter(item => item.suicides_no !== '');
      setData(filteredData);
    })
    d3.json(worldLocation)
    .then(loc => {
        setLocations(loc.features);
    })
    .catch(error => {
          console.error(error);
          console.error('Error loading the data');
    });
  }, []);

  return (
    <div className="App">
      <div id="container" className="flexbox">
        <div id="graph" className="flexbox3">
            <h3>WHO Suicide Database</h3>
            <div id="legend"></div>
            <div id="3_graph" className="flexbox4">
              <div id="chart" style={{float: 'left', paddingLeft: "10px"}}>
                <Choropleth
                  data={data}
                  selectedYear={selectedYear}
                  locations={locations}
                  totalMode={totalMode}
                  parentCallback={handleCallback}
                />
              </div>
              <div id="chart2" style={{float: 'right'}}>
                <BarChart
                  data={data}
                  selectedYear={selectedYear}
                  countriesList={countries}
                  locations={locations}
                  totalMode={totalMode}
                />
              </div>
            </div>
              <div id="chart3" style={{width: "100%", display: "flex"}}>  
                <div style={{ display: "grid", width: "400px", marginLeft: "200px", alignItems: "center"}}>       
                  <div className='instr1'>
                  <Slider
                      onChange={(selected) => {setSelectedYear(selected.target.value)}}
                      defaultValue={1960}
                      valueLabelDisplay="on"
                      marks={marks}
                      step={1}
                      min={1979}
                      max={2016}
                    />
                    <h3>Slide to see stats of each year</h3>
                  </div>
                  <div className='instr2'>
                    <FormGroup>
                      <center>
                      <FormControlLabel control={<Switch onChange={(event) => {
                        if(event.target.checked === true){
                          setTotalMode(true)
                        } else {
                          setTotalMode(false)
                        }
                      }} />} />
                      </center>
                    </FormGroup>
                    <h3>Turn on the switch to view all time stats mode!</h3>
                  </div>
                </div>
                <div style={{justifySelf: "right", marginLeft: "200px"}}> 
                <PieChart
                  data={data}
                  selectedYear={selectedYear}
                  chosenCountry={chosenCountry}
                  totalMode={totalMode}
                />
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}

export default App;
