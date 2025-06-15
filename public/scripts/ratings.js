const Ratings = {
    pollId: null, // set this from main.js

    initializeRateYo: function (ratingContainer, option) {
      $(ratingContainer).rateYo({
        rating: 0,
        fullStar: true,
        ratedFill: "#f1c40f",
        normalFill: "#ffffff",
        starWidth: "20px",
        onSet: function (rating, rateYoInstance) {
          if (rating > 0) {
            currentRatings[option] = rating;
          } else {
            delete currentRatings[option];
          }
          Main.checkForChanges();
        },
      });
    },

    submit: async function (ratings) {
      if (!this.pollId) return;
      await window.api.rateOptionsByPollId(this.pollId, { ratings });
      Main.showToast("Ratings submitted successfully!");
      this.refreshTotal();
      Main.clearRatingsFormData();
    },

    refreshTotal: async function (sortBy = "name") {   
      const ratingsList = document.getElementById("ratings-section");
      ratingsList.innerHTML = ""; // Clear previous
      const ratingsRes = await window.api.getRatingsByPollId(this.pollId, sortBy);
      if (!ratingsRes.ratings || !Object.keys(ratingsRes.ratings).length) {
          ratingsList.innerHTML = `<li style="color:#888;">No ratings available.</li>`;
      } else {
        this.rebindTotalRatings(ratingsRes.ratings);
      }   
    },

    rebindTotalRatings: function (ratings) {
      const ratingsList = document.getElementById("ratings-section");
      ratingsList.innerHTML = !Object.keys(ratings).length ? "No options have been rated yet." : "";
    
      // Find the option(s) with the highest avgRating
      let maxRating = -1;
      for (const option in ratings) {
        const avgRating = ratings[option].avgRating || 0;
        if (avgRating > maxRating) maxRating = avgRating;
      }
    
      for (const option in ratings) {
        const listItem = document.createElement("li");
        const ratingCount = ratings[option].count || 0;
        const avgRating = ratings[option].avgRating || 0;
    
        const filledStars = Math.max(0, Math.min(5, Math.round(avgRating)));
        const starRating = "⭐".repeat(filledStars) + "☆".repeat(5 - filledStars);
    
        listItem.innerHTML = `<span style="width:125px; padding:10px">${option}:</span> <span style="width:20px; padding:10px"><strong>${avgRating}</strong></span> <span style="width:100px; padding:5px">${starRating}</span> <span style="padding:5px">(${ratingCount})</span>`;
    
        // Highlight the row if it has the highest avgRating and at least one rating
        if (avgRating === maxRating && ratingCount > 0 && maxRating > 0) {
          listItem.style.background = "#e6ffe6";
          listItem.style.fontWeight = "bold";
        }
    
        ratingsList.appendChild(listItem);
      }
    }
};
window.Ratings = Ratings;