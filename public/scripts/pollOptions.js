const PollOptions = {
    refresh: function () {
      fetch("/getOptions")
        .then((response) => response.json())
        .then((data) => {
          this.rebindRatingForm(data);
        })
        .catch((error) => {
          console.error("Error fetching poll options for rating:", error);
        });
    },
  
    rebindRatingForm: function (data) {
      const ratingOptionsWrapper = document.querySelector("#rating-options-wrapper");
      ratingOptionsWrapper.innerHTML = "<h2>Options</h2>";
  
      data.options.forEach((option) => {
        const ratingDiv = document.createElement("div");
        ratingDiv.className = "rating-option";
        ratingDiv.innerHTML = `<label>${option}: </label>`;
  
        const ratingContainer = document.createElement("div");
        ratingDiv.appendChild(ratingContainer);
        ratingOptionsWrapper.appendChild(ratingDiv);
  
        setTimeout(() => {
          Ratings.initializeRateYo(ratingContainer, option);
        });
      });
    },
  
    add: function (newOption) {
      fetch("/addOption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newOption: newOption }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            this.refresh();
            Ratings.refreshTotal();
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  