// services/pollService.js
const Option = require('../models/option');

exports.initializeRatings = async (optionName) => {
  const option = new Option({ name: optionName });
  await option.save();
};

exports.saveRatings = async (ratings, pollOptions) => {
  for (const optionName in ratings) {
    if (pollOptions.includes(optionName) && !isNaN(ratings[optionName])) {
      const currentRating = parseInt(ratings[optionName]);
      if (currentRating) {
        const option = await Option.findOne({ name: optionName });
        if (option) {
          option.totalRatings += currentRating;
          option.numberOfRatings += 1;
          await option.save();
        }
      }
    }
  }
};

exports.getAllOptions = async () => {
  const options = await Option.find().select('name -_id');
  return options.map(option => option.name);
};

exports.getAllRatings = async () => {
  const options = await Option.find();
  const totalRatings = {};

  options.forEach(option => {
    const avgRating = option.numberOfRatings === 0 ? 0 : Math.round((option.totalRatings / option.numberOfRatings) * 10) / 10;
    totalRatings[option.name] = { total: option.totalRatings, count: option.numberOfRatings, avgRating: avgRating };
  });

  return totalRatings;
};