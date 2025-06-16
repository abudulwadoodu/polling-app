const PollOptions = {
    pollId: null, // set this from main.js when showing a poll

    refresh: async function (sortBy = "name") {
      const optionsRes = await window.api.getOptionsByPollId(this.pollId, sortBy);
      const options = optionsRes.options || [];

      // Options section
      const optionsWrapper = document.getElementById("rating-options-wrapper");
      optionsWrapper.innerHTML = "<h2>Options</h2>";
      const submitBtn = document.getElementById("submitBtn");

      if (!options.length) {
          optionsWrapper.innerHTML += `<div style="color:#888; margin:10px 0;">No options available for this poll.</div>`;
          submitBtn.style.display = "none";
      } else {          
          this.rebindRatingForm(options);
          submitBtn.style.display = "";
      }
    },

    rebindRatingForm: function (options) {
      const ratingOptionsWrapper = document.querySelector("#rating-options-wrapper");
      ratingOptionsWrapper.innerHTML = "<h2>Options</h2>";
    
      if (!options.length) {
        ratingOptionsWrapper.innerHTML += "<p>No options have been added yet.</p>";
        $('#submitBtn').hide();
      } else if ($('#submitBtn').is(':hidden')) {
        $('#submitBtn').show();
      }
    
      options.forEach((option) => {
        const ratingDiv = document.createElement("div");
        ratingDiv.className = "rating-option";
        ratingDiv.innerHTML = `<label>${option.name}: </label>`;

        if (option.ratedByUser) {
          // Show as already rated/disabled
          ratingDiv.innerHTML += `<span style="color:#888; margin-left:8px;">(Already rated)</span>`;
          ratingDiv.style.opacity = "0.5";
          ratingDiv.title = "You have already rated this option";
        } else {
          const ratingContainer = document.createElement("div");
          ratingDiv.appendChild(ratingContainer);
          setTimeout(() => {
            Ratings.initializeRateYo(ratingContainer, option.name);
          });
        }
    
        ratingOptionsWrapper.appendChild(ratingDiv);
    
        // Add flag icon
        const flagBtn = document.createElement("button");
        flagBtn.type = "button";
        flagBtn.innerHTML = "🚩";
        flagBtn.title = "Report this option";
        flagBtn.style.marginLeft = "8px";
        flagBtn.style.backgroundColor = "#fff";
        flagBtn.style.borderColor = "#fff";
        flagBtn.onclick = async function () {
          let reason = prompt("Report this option as inappropriate?\n(Optional) Please provide a reason:");
          if (reason !== null) { // null means user cancelled
            await window.api.reportOption(option._id, reason);
            Main.showToast("Thank you for your report!", "success");
            // Refresh options UI after reporting (option may be hidden in backend)
            PollOptions.refresh();
            if (window.Ratings && typeof Ratings.refreshTotal === "function") {
              Ratings.refreshTotal();
            }
          }
        };
        ratingDiv.appendChild(flagBtn);
      });
    },

    add: function (newOption) {
      if (!this.pollId) return;
      fetch(`/poll/${this.pollId}/option`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
window.PollOptions = PollOptions;