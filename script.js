// fetch the JSON with data
// using axios since I can't think of anything else
const dataSet = async function getData() {
  return await axios.get("https://api.weather.gov/alerts/active");
};

async function awaitData() {
  const data = dataSet();
  return data;
}

Promise.all([awaitData()]).then((data) => {
  const alerts = data[0].data.features;
  console.log(alerts);
});
