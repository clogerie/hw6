var apiKey = '0df95d641537067bb50504e2d43d6ac9';
var apiDoc = 'api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}';
var apiIndex = 'api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API key}';

// wait when the window loads
$(document).ready(function () {

  var cityVal

  var history = localStorage.getItem("cities");
  if (history) {
    history = JSON.parse(history)
  }

  console.log(history);
  function renderButtons() {
    $("#city-list").empty();
    if (!history) {
      return
    }

    for (var i = 0; i < history.length; i++) {
      var b = $("<button>");
      b.addClass("search-history");
      b.attr("value", history[i]);
      b.text(history[i]);
      $("#city-list").append(b)
      console.log(history[i]);

    }


  }
  renderButtons(); //call funtion


  // listen for a click on the search button
  $('#searchBtn').on('click', function (event) {
    cityVal = $('#search').val();
    getWeather(event);
    setLocalStorage();
    renderButtons();
  });

  $(document).on('click', '.search-history', function (event) {
    console.log(event.target.value);
    cityVal = event.target.value
    getWeather(event);

  })
  

  $('#clearBtn').on('click', function (event) {
    event.preventDefault();
    cityVal=[];
    localStorage.removeItem("cities");
    document.location.reload();
  });

  


  function setLocalStorage() {
    var cities = localStorage.getItem("cities");

    if (!cities) {
      cities = [];
    } else {
      cities = JSON.parse(cities);
    }
    cities.push(cityVal);
    localStorage.setItem("cities", JSON.stringify(cities));
    history = localStorage.getItem('cities');
    history = JSON.parse(history);

  }

  function getWeather(event) {
    // prevent the page from reloading after click
    event.preventDefault();
    // get the city value from user input
    //cityVal = $('#search').val();
    console.log(cityVal);


    // variable for the current weather url
    // passed the city value from the input
    // passed the api key
    var apiDoc =
      'https://api.openweathermap.org/data/2.5/weather?q=' +
      cityVal +
      '&units=imperial&appid=' +
      apiKey;
    // ajax call to the api with url: apiDoc, method: GET
    $.ajax({
      url: apiDoc,
      method: 'GET',
    }).then(function (response) {
      console.log(response);
      var name = response.name
      // get the longitude from response
      var lon = response.coord.lon;
      // get the latitude from the response
      var lat = response.coord.lat;
      // get the temp from the response
      var temperature = response.main.temp;
      // get the humidity from the response
      var humidity = response.main.humidity;
      // get the wind speed from the response
      var wind = response.wind.speed;
      // store values from the response to the html elements with string interpolation
      $('.city-name').text(`${name}`);
      $('#temp').text(`Temperature: ${temperature}`); // string interpolation
      $('#humid').text(`Humidity: ${humidity}`);
      $('#wind').text(`Wind Speed: ${wind}`);     

      // call 5day function and pass lat and lon
      fiveDay(cityVal);
      getUVIndex(lat, lon)
    });


  }

  function getUVIndex(lat, lon) {
    console.log(lat, lon);
    var apiIndex = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;
    $.ajax({
      url: apiIndex,
      method: 'GET',
    }).then(function(response){
      console.log(response);
      $('#uvIndex').text(`UV Index: ${response.value}`);
    })
  }

  function fiveDay(city) {
    // variable url for 5day forecast
    // pass lat, lon and apikey
    var apiUrl =
      'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&units=imperial&appid=' +
      apiKey;
    // ajax call to the apiUrl, method: GET
    $.ajax({
      url: apiUrl,
      method: 'GET',
    }).then(function (response) {
      // console log response
      console.log(response);
      var timeArray = response.list
      var fiveDayArray = [];
      for (var i = 0; i < timeArray.length; i++) {
        var timeString = timeArray[i].dt_txt;
        if (timeString.includes('12:00:00')) {
          fiveDayArray.push(timeArray[i])
        }

      }
      console.log(fiveDayArray);
      
      
      for (var i = 0; i < fiveDayArray.length; i++) {
        $(`#future-humidity${i}`).text(fiveDayArray[i].main.humidity)
        var icon = fiveDayArray[i].weather[0].icon
        var temp = fiveDayArray[i].main.temp
        var dates = fiveDayArray[i].dt_txt.slice(0, 10); //string slice to display date
        $(`#future-day${i}`).text(dates)
        $(`#future-temp${i}`).text(fiveDayArray[i].main.temp)
        $(`#future-icon${i}`).attr("src", `http://openweathermap.org/img/wn/${icon}.png`)
      }
    });
  }
});