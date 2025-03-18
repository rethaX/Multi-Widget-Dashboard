// Decode API Keys
const weatherApiKey = atob('NDMwYmE0YzEzMGEwYWE4ZmFlNTk3MzZkN2VjMTBkNTc=');
const newsApiKey = atob('NzFiZTM5OTVhOWFmNDcxOGEwOThlOTY1MjdhNDM4NDU=');
const omdbApiKey = atob('MzQzNmE5YjU=');

// API URLs
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const newsApiUrl = 'https://newsapi.org/v2/top-headlines';
const newsSourcesUrl = 'https://newsapi.org/v2/top-headlines/sources';
const omdbApiUrl = 'https://www.omdbapi.com/';
const omdbPosterUrl = 'https://img.omdbapi.com/';

// Fetch Weather Data
function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    const url = `${weatherApiUrl}?q=${city}&appid=${weatherApiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weatherResult = document.getElementById('weatherResult');
            if (data.cod === 200) {
                const iconCode = data.weather[0].icon; // Get the icon code from the API response
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Construct the icon URL

                weatherResult.innerHTML = `
                    <p><strong>City:</strong> ${data.name}, ${data.sys.country}</p>
                    <p><strong>Coordinates:</strong> Lon: ${data.coord.lon}, Lat: ${data.coord.lat}</p>
                    <p><strong>Temperature:</strong> ${data.main.temp}°C (Min: ${data.main.temp_min}°C, Max: ${data.main.temp_max}°C)</p>
                    <p><strong>Weather:</strong> ${data.weather[0].main} (${data.weather[0].description})</p>
                    <p><strong></strong> <img src="${iconUrl}" alt="${data.weather[0].description}"></p>
                    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                    <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
                    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s, Direction: ${data.wind.deg}°</p>
                    <p><strong>Visibility:</strong> ${data.visibility} meters</p>
                    <p><strong>Cloudiness:</strong> ${data.clouds.all}%</p>
                    <p><strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
                    <p><strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
                `;
            } else {
                weatherResult.innerHTML = `<p>Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Fetch News headline for the Selected Country
function fetchNewsSources() {
    const country = document.getElementById('countrySelect').value;
    let url = `${newsSourcesUrl}?apiKey=${newsApiKey}`;

    // Add country parameter only if a country is selected
    if (country) {
        url += `&country=${country}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const newsResult = document.getElementById('newsResult');
            if (data.status === 'ok') {
                let newsHtml = '<ul>';
                data.sources.forEach(source => {
                    newsHtml += `
                        <li>
                            <h3>${source.name}</h3>
                            <p><strong>Description:</strong> ${source.description}</p>
                            <p><strong>Category:</strong> ${source.category}</p>
                            <p><strong>Language:</strong> ${source.language}</p>
                            <p><strong>Country:</strong> ${source.country}</p>
                            <a href="${source.url}" target="_blank">Visit Source</a>
                        </li>
                    `;
                });
                newsHtml += '</ul>';
                newsResult.innerHTML = newsHtml;
            } else {
                newsResult.innerHTML = `<p>Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching news sources:', error);
        });
}

// Fetch Movie Data
async function fetchMovie() {
    const movieQuery = document.getElementById('movieInput').value;
    const url = `${omdbApiUrl}?apikey=${omdbApiKey}&t=${encodeURIComponent(movieQuery)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const movieResult = document.getElementById('movieResult');
        if (data.Response === 'True') {
            const imdbID = data.imdbID;
            let posterUrl = await fetchPoster(imdbID);

            // If posterUrl is null but data.Poster exists, use data.Poster
            if (!posterUrl && data.Poster) {
                posterUrl = data.Poster;
            }

            // Format ratings
            let ratingsHtml = '<ul>';
            data.Ratings.forEach(rating => {
                ratingsHtml += `
                    <li>
                        <strong>${rating.Source}:</strong> ${rating.Value}
                    </li>
                `;
            });
            ratingsHtml += '</ul>';

            // Display movie details
            movieResult.innerHTML = `
                <p><strong></strong> <img src="${posterUrl}" alt="${data.Title} Poster"></p>
                <p><strong>Title:</strong> ${data.Title}</p>
                <p><strong>Year:</strong> ${data.Year}</p>
                <p><strong>Rated:</strong> ${data.Rated}</p>
                <p><strong>Released:</strong> ${data.Released}</p>
                <p><strong>Runtime:</strong> ${data.Runtime}</p>
                <p><strong>Genre:</strong> ${data.Genre}</p>
                <p><strong>Director:</strong> ${data.Director}</p>
                <p><strong>Writer:</strong> ${data.Writer}</p>
                <p><strong>Actors:</strong> ${data.Actors}</p>
                <p><strong>Plot:</strong> ${data.Plot}</p>
                <p><strong>Language:</strong> ${data.Language}</p>
                <p><strong>Country:</strong> ${data.Country}</p>
                <p><strong>Awards:</strong> ${data.Awards}</p>
                <p><strong>Ratings:</strong> ${ratingsHtml}</p>
                <p><strong>Metascore:</strong> ${data.Metascore}</p>
                <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
                <p><strong>IMDB Votes:</strong> ${data.imdbVotes}</p>
                <p><strong>IMDB ID:</strong> ${data.imdbID}</p>
                <p><strong>Type:</strong> ${data.Type}</p>
            `;
        } else {
            movieResult.innerHTML = `<p>Error: ${data.Error}</p>`;
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

// Fetch Poster using Poster API
async function fetchPoster(imdbID) {
    const url = `${omdbPosterUrl}?apikey=${omdbApiKey}&i=${imdbID}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            return url; // Return the poster URL
        }
    } catch (error) {
        console.error('Error fetching poster:', error);
    }
    return null; // Return null if poster fetch fails
}