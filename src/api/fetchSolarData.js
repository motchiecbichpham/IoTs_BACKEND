// const axios = require("axios");

// const fetchSolarData = async () => {
//   try {
//     const response = await axios.get(
//       "https://labadenquet.pythonanywhere.com/production",
//     );
//     const production = parseFloat(response.data.prod);

//     const timestamp = new Date();

//     return { production, timestamp };
//   } catch (error) {
//     console.log("Error fetching solar data:", error);
//     throw error;
//   }
// };

// module.exports = fetchSolarData;
