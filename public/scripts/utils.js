const Main = {
    checkForChanges: function () {
      $("#submitBtn").prop("disabled", !Object.keys(currentRatings).length);
    },
  
    clearRatingsFormData: function () {
      const ratingForm = document.getElementById("ratingForm");
      ratingForm.reset();
      PollOptions.refresh();
      currentRatings = {};
    }
  };
  