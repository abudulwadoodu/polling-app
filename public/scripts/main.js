document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("newOptionInput");
    const button = document.getElementById("addOptionButton");
  
    function initialize() {
      checkInput();
      input.addEventListener("input", checkInput);
      button.addEventListener("click", addNewOption);
      document.getElementById("ratingForm").addEventListener("submit", handleFormSubmit);
  
      PollOptions.refresh();
      Ratings.refreshTotal();
    }
  
    function checkInput() {
      button.disabled = input.value.trim().length === 0;
    }
  
    function addNewOption() {
      if (isValidNewOption()) {
        const newOption = input.value.trim();
        PollOptions.add(newOption);
      } else {
        alert("Please provide a non-blank new name.");
      }
    }
  
    function isValidNewOption() {
      return input.value.trim() !== "";
    }
  
    function handleFormSubmit(event) {
      event.preventDefault();
  
      if (Object.values(currentRatings).some((rating) => rating !== "0")) {
        Ratings.submit(currentRatings);
      } else {
        alert("Please rate at least one option before submitting.");
      }
    }
  
    initialize(); // Call the initialization function to start everything
  });
  