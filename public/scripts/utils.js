const Main = {
    checkForChanges: function () {
      $("#submitBtn").prop("disabled", !Object.keys(currentRatings).length);
    },
  
    clearRatingsFormData: function () {
      const ratingForm = document.getElementById("ratingForm");
      ratingForm.reset();
      PollOptions.refresh();
      currentRatings = {};
      $("#submitBtn").prop("disabled", !Object.keys(currentRatings).length);
    },

    showToast: function(message, status = "success") {
      let toast = document.getElementById("custom-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "custom-toast";
        toast.style.position = "fixed";
        toast.style.top = "30px";
        toast.style.right = "30px";
        toast.style.left = "auto";
        toast.style.transform = "none";
        toast.style.background = "#333";
        toast.style.color = "#fff";
        toast.style.padding = "12px 28px";
        toast.style.borderRadius = "6px";
        toast.style.fontSize = "1em";
        toast.style.zIndex = "9999";
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.background = status === "success" ? "#27ae60" : "#e74c3c"; // green for success, red for error
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.opacity = "0";
      }, 2000);
    }
  };
  