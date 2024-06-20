// services/pollService.js
const fs = require("fs/promises");

const ratingsFile = "ratings.json";

exports.initializeRatings = async (option) => {
  let ratingsData = await this.getRatingsFromFile();
  ratingsData[option] = { totalRatings: 0, numberOfRatings: 0 };
  await this.saveRatingsToFile(ratingsData);
};

exports.saveRatings = async (ratings, pollOptions) => {
  let ratingsData = await this.getRatingsFromFile();

  for (const option in ratings) {
    if (pollOptions.includes(option) && !isNaN(ratings[option])) {
      let currentRating = parseInt(ratings[option]);
      if (currentRating) {
        if (ratingsData[option]) {
          ratingsData[option].totalRatings += currentRating;
          ratingsData[option].numberOfRatings += 1;
        } else {
          ratingsData[option] = {
            totalRatings: currentRating,
            numberOfRatings: 1,
          };
        }
      }
    }
  }
  await this.saveRatingsToFile(ratingsData);
};

exports.getTotalRatings = async () => {
  let ratingsData = await this.getRatingsFromFile();
  const totalRatings = {};

  for (const option in ratingsData) {
    const total = ratingsData[option].totalRatings || 0;
    const count = ratingsData[option].numberOfRatings || 0;
    const avgRating = count === 0 ? 0 : Math.round((total / count) * 10) / 10;
    totalRatings[option] = { total: total, count: count, avgRating: avgRating };
  }

  return totalRatings;
};

exports.getRatingsFromFile = async () => {
  try {
    const data = await fs.readFile(ratingsFile, "utf-8");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error reading ratings from file:", error);
    return {};
  }
};

exports.saveRatingsToFile = async (ratingData) => {
  try {
    await fs.writeFile(ratingsFile, JSON.stringify(ratingData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving ratings to file:", error);
    throw error;
  }
};
