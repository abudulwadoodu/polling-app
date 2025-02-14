const Ratings = {
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
  
    submit: function (ratings) {
      fetch("/rateOptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ratings: ratings }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Ratings submitted successfully!");
            this.refreshTotal();
            Main.clearRatingsFormData();
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  
    refreshTotal: function () {
      fetch("/getAllRatings")
        .then((response) => response.json())
        .then((data) => {
          this.rebindTotalRatings(data);
        })
        .catch((error) => {
          console.error("Error fetching total ratings:", error);
        });
    },
  
    rebindTotalRatings: function (data) {
      const totalRatingsList = document.getElementById("totalRatings");
      totalRatingsList.innerHTML = !Object.keys(data.totalRatings).length ? "No options have been rated yet." : "";
  
      for (const option in data.totalRatings) {
        const listItem = document.createElement("li");
        const totalRating = data.totalRatings[option].total || 0;
        const ratingCount = data.totalRatings[option].count || 0;
        const avgRating = data.totalRatings[option].avgRating || 0;
  
        const filledStars = Math.max(0, Math.min(5, Math.round(avgRating)));
        const starRating = "⭐".repeat(filledStars) + "☆".repeat(5 - filledStars);
  
        listItem.innerHTML = `<span style="width:125px; padding:10px">${option}:</span> <span style="width:20px; padding:10px"><strong>${avgRating}</strong></span> <span style="width:100px; padding:5px">${starRating}</span> <span style="padding:5px">(${ratingCount})</span>`;
        totalRatingsList.appendChild(listItem);
      }
    }
  };
  