document.addEventListener("DOMContentLoaded", function () {
  // Prompt for email once on app load
  let user_email = localStorage.getItem("poll_user_email");
  if (!user_email) {
    user_email = prompt("Enter your email to use the polling app:");
    if (!user_email) {
      alert("Email is required to use the app.");
      return;
    }
    localStorage.setItem("poll_user_email", user_email.trim());
  }

  // Simple client-side router
  function router() {
    const path = window.location.pathname;
    highlightNav(path);

    if (path === "/" || path === "/index.html") {
      showPollList();
    } else if (path.startsWith("/blocked")) {
      showReportedTabs();
    } else if (path.startsWith("/poll/")) {
      const pollId = path.split("/")[2];
      showPollDetails(pollId);
    } else {
      showNotFound();
    }
  }

  window.navigate = function (url) {
    window.history.pushState({}, "", url);
    router();
  };
  window.onpopstate = router;

  // Highlight the active nav link
  function highlightNav(path) {
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach((link) => {
      // Remove active class from all
      link.classList.remove("active");
      // Highlight if href matches current path
      const href = link.getAttribute("href");
      if (
        (href === "/" && (path === "/" || path === "/index.html")) ||
        (href === "/blocked" && path.startsWith("/blocked"))
      ) {
        link.classList.add("active");
      }
    });
  }

  // Show all polls
  async function showPollList() {
    document.getElementById("poll-list-page").style.display = "block";
    document.getElementById("poll-page").style.display = "none";
    document.getElementById("poll-setup-modal").style.display = "none";
    document.getElementById("reported-tabs-page").style.display = "none";
    const list = document.getElementById("poll-list");
    list.innerHTML = "Loading...";
    const data = await window.api.getPolls();
    list.innerHTML = "";
    if (!data.length) {
      list.innerHTML = "<li>No polls found.</li>";
    } else {
      data.forEach((poll) => {
        const li = document.createElement("li");
        const createdAt = poll.created_at
          ? new Date(poll.created_at).toLocaleString()
          : "";
        li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;">
                        <div>
                            <div>
                                <a href="/poll/${
                                  poll._id
                                }" onclick="navigate('/poll/${
          poll._id
        }');return false;" style="font-weight:bold; font-size:1.1em;">${
          poll.title
        }</a>
                            </div>
                            <div style="margin:2px 0 4px 0; color:#444;">${
                              poll.description || ""
                            }</div>
                            <div style="color:#888; font-size:0.95em;">
                                <span><strong>By:</strong> ${
                                  poll.author_email || "N/A"
                                }</span>
                                <span style="margin-left:15px;"><strong>Created:</strong> ${createdAt}</span>
                            </div>
                        </div>
                        <div style="min-width:120px; text-align:right;">
                            <button onclick="editPoll('${
                              poll._id
                            }')">Edit</button>
                            <button onclick="deletePoll('${
                              poll._id
                            }')">Delete</button>
                            <button class="report-poll-btn" title="Report this poll" style="background:#fff; color:#ab1e23; border:none; font-size:1.2em; margin-left:8px;">🚩</button>
                        </div>
                    </div>
                `;
        li.style.marginBottom = "18px";
        // Add report handler
        li.querySelector(".report-poll-btn").onclick = async function () {
          let reason = prompt(
            "Report this poll as inappropriate?\n(Optional) Please provide a reason:"
          );
          if (reason !== null) {
            await window.api.reportPoll(poll._id, reason);
            Main.showToast("Thank you for your report!", "success");
            showPollList();
          }
        };
        list.appendChild(li);
      });
    }
    // Show "Create Poll" button in the list page
    let createBtn = document.getElementById("show-create-poll-btn");
    if (!createBtn) {
      createBtn = document.createElement("button");
      createBtn.id = "show-create-poll-btn";
      createBtn.textContent = "Create Poll";
      createBtn.style.margin = "16px 0";
      createBtn.onclick = function () {
        showCreatePoll();
      };
      list.parentElement.insertBefore(createBtn, list);
    }
  }

  // Show poll creation modal (in list page)
  function showCreatePoll() {
    document.getElementById("poll-list-page").style.display = "block";
    document.getElementById("poll-page").style.display = "none";
    modal.style.display = "block";
    modal.dataset.editing = "";
    titleInput.value = "";
    descInput.value = "";
    optionsInput.value = "";
    document.getElementById("setup-options-label").style.display = "block";
  }

  // Show poll details
  async function showPollDetails(pollId) {
    document.getElementById("poll-list-page").style.display = "none";
    document.getElementById("poll-page").style.display = "block";
    document.getElementById("poll-setup-modal").style.display = "none";
    document.getElementById("reported-tabs-page").style.display = "none";

    const input = document.getElementById("newOptionInput");
    const addOptionButton = document.getElementById("addOptionButton");
    function checkAddOptionInput() {
      addOptionButton.disabled = input.value.trim().length === 0;
    }

    input.addEventListener("input", checkAddOptionInput);

    addOptionButton.onclick = async function () {
      const newOption = input.value.trim();
      if (!newOption) return;
      if (window.PollOptions && PollOptions.pollId) {
        await window.api.addOptionToPoll(PollOptions.pollId, { newOption });
        input.value = "";
        checkAddOptionInput();
        // Refresh options after adding
        const optionsRes = await window.api.getOptionsByPollId(
          PollOptions.pollId
        );
        const options = optionsRes.options || [];
        if (window.PollOptions) PollOptions.refresh(options);
      }
    };

    PollOptions.pollId = pollId;
    Ratings.pollId = pollId;

    // Fetch poll and options
    const poll = await window.api.getPollById(pollId);
    document.getElementById("form-title").innerText = poll.title;

    // Format created_at
    let createdAt = "";
    if (poll.created_at) {
      createdAt = new Date(poll.created_at).toLocaleString();
    }

    // Show author_email and created_at in details
    document.getElementById("form-description").innerHTML =
      `<div style="color:#888; font-size:0.95em; margin-bottom:8px;">
                <span><strong>By:</strong> ${poll.author_email || "N/A"}</span>
                <span style="margin-left:15px;"><strong>Created:</strong> ${createdAt}</span>
            </div>` + (poll.description || "");

    // Fetch options for this poll
    const sortSelect = document.getElementById("option-sort-select");
    if (sortSelect) {
      sortSelect.onchange = function () {
        if (window.PollOptions) PollOptions.refresh(this.value);
        if (window.Ratings) Ratings.refreshTotal(this.value);
      };
      // Initial load
      if (window.PollOptions) PollOptions.refresh(sortSelect.value);
      // Ratings section
      if (window.Ratings) Ratings.refreshTotal(sortSelect.value);
    }
  }

  async function showReportedTabs() {
    document.getElementById("poll-list-page").style.display = "none";
    document.getElementById("poll-page").style.display = "none";
    const reportedTabsPage = document.getElementById("reported-tabs-page");
    reportedTabsPage.style.display = "block";
    reportedTabsPage.innerHTML = `
        <h1>Reported Polls & Options</h1>
        <div style="margin-bottom: 18px;">
            <button id="tab-polls" class="tab-btn active">Reported Polls</button>
            <button id="tab-options" class="tab-btn">Reported Options</button>
        </div>
        <div id="reported-polls-section" style="display:block;">
            <ul id="reported-polls-list"></ul>
        </div>
        <div id="reported-options-section" style="display:none;">
            <ul id="reported-options-list"></ul>
        </div>
    `;

    // Tab switching logic
    const tabPolls = document.getElementById("tab-polls");
    const tabOptions = document.getElementById("tab-options");
    const pollsSection = document.getElementById("reported-polls-section");
    const optionsSection = document.getElementById("reported-options-section");

    tabPolls.onclick = () => {
      tabPolls.classList.add("active");
      tabOptions.classList.remove("active");
      pollsSection.style.display = "block";
      optionsSection.style.display = "none";
    };
    tabOptions.onclick = () => {
      tabOptions.classList.add("active");
      tabPolls.classList.remove("active");
      optionsSection.style.display = "block";
      pollsSection.style.display = "none";
    };

    showReportedPolls();
    showReportedOptions();
  }

  async function showReportedPolls() {
    // Fetch and render reported polls
    const pollsRes = await fetch("/api/reportedPolls");
    const reportedPolls = await pollsRes.json();
    const pollsList = document.getElementById("reported-polls-list");
    if (!reportedPolls.length) {
      pollsList.innerHTML = "<li>No reported polls.</li>";
    } else {
      reportedPolls.forEach((poll) => {
        const li = document.createElement("li");
        li.innerHTML = `
                <div>
                    <strong>${poll.title}</strong> (${poll.status})<br>
                    <span style="color:#888;">Reported by: ${
                      poll.reportedBy || "N/A"
                    }</span>
                    <span style="color:#888; margin-left:10px;">Date: ${
                      poll.reportedAt
                        ? new Date(poll.reportedAt).toLocaleString()
                        : "N/A"
                    }</span><br>
                    <span style="color:#888;">Reason: ${
                      poll.reason || "N/A"
                    }</span>
                    <div style="margin-top:8px;">
                        <button class="not-issue-btn">Not an Issue</button>
                        <button class="delete-btn" style="background:#ab1e23;">Delete</button>
                    </div>
                </div>
            `;
        // Not an Issue
        li.querySelector(".not-issue-btn").onclick = async () => {
          await fetch(`/api/poll/${poll._id}/markNotIssue`, { method: "POST" });
          li.remove();
        };
        // Delete
        li.querySelector(".delete-btn").onclick = async () => {
          if (confirm("Are you sure you want to delete this poll?")) {
            await fetch(`/api/poll/${poll._id}/markDeleted`, {
              method: "POST",
            });
            li.remove();
          }
        };
        pollsList.appendChild(li);
      });
    }
  }
  async function showReportedOptions() {
    // Fetch and render reported options
    const optionsRes = await fetch("/api/reportedOptions");
    const reportedOptions = await optionsRes.json();
    const optionsList = document.getElementById("reported-options-list");
    if (!reportedOptions.length) {
      optionsList.innerHTML = "<li>No reported options.</li>";
    } else {
      reportedOptions.forEach((option) => {
        const li = document.createElement("li");
        li.innerHTML = `
                <div>
                    <strong>${option.name}</strong> (${option.status})<br>
                    <span style="color:#888;">Poll: ${
                      option.pollTitle || "N/A"
                    }</span><br>
                    <span style="color:#888;">Reported by: ${
                      option.reportedBy || "N/A"
                    }</span>
                    <span style="color:#888; margin-left:10px;">Date: ${
                      option.reportedAt
                        ? new Date(option.reportedAt).toLocaleString()
                        : "N/A"
                    }</span><br>
                    <span style="color:#888;">Reason: ${
                      option.reason || "N/A"
                    }</span>
                    <div style="margin-top:8px;">
                        <button class="not-issue-btn">Not an Issue</button>
                        <button class="delete-btn" style="background:#ab1e23;">Delete</button>
                    </div>
                </div>
            `;
        // Not an Issue
        li.querySelector(".not-issue-btn").onclick = async () => {
          await fetch(`/api/option/${option._id}/markNotIssue`, {
            method: "POST",
          });
          li.remove();
        };
        // Delete
        li.querySelector(".delete-btn").onclick = async () => {
          if (confirm("Are you sure you want to delete this option?")) {
            await fetch(`/api/option/${option._id}/markDeleted`, {
              method: "POST",
            });
            li.remove();
          }
        };
        optionsList.appendChild(li);
      });
    }
  }

  function showNotFound() {
    document.body.innerHTML = "<h2>404 - Not Found</h2>";
  }

  // Poll creation/edit logic
  const modal = document.getElementById("poll-setup-modal");
  const saveBtn = document.getElementById("setup-save-btn");
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "15px";
  closeBtn.style.fontSize = "1.5em";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "#333";
  closeBtn.onmouseover = function () {
    closeBtn.style.color = "#e74c3c";
  };
  closeBtn.onmouseout = function () {
    closeBtn.style.color = "#333";
  };
  closeBtn.onclick = function () {
    modal.style.display = "none";
    modal.dataset.editing = "";
  };
  // Add close button only once
  if (modal && !modal.querySelector("button[close-btn]")) {
    closeBtn.setAttribute("close-btn", "true");
    const modalInnerDiv = modal.querySelector("div");
    if (modalInnerDiv) {
      modalInnerDiv.prepend(closeBtn);
    }
  }

  const titleInput = document.getElementById("setup-title");
  const descInput = document.getElementById("setup-description");
  const optionsInput = document.getElementById("setup-options");

  if (saveBtn) {
    saveBtn.onclick = async function () {
      const title = titleInput.value.trim();
      const description = descInput.value.trim();
      const options = optionsInput.value
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      const author_email = user_email;
      const editingId = modal.dataset.editing;

      if (!title || !description || !author_email) {
        alert("Please fill all fields and provide your email.");
        return;
      }

      if (editingId) {
        // Edit mode: update poll (do not update options here for simplicity)
        const data = await window.api.updatePoll(editingId, {
          title,
          description,
          author_email,
        });
        if (data && data._id) {
          modal.style.display = "none";
          modal.dataset.editing = "";
          showPollList();
        } else {
          alert(data.message || "Failed to update poll.");
        }
      } else {
        // Create mode
        if (options.length === 0) {
          alert("Please provide at least one option.");
          return;
        }
        const data = await window.api.createPoll({
          title,
          description,
          options,
          author_email,
        });
        if (data.success) {
          modal.style.display = "none";
          showPollList();
        } else {
          alert(data.message || "Failed to create poll.");
        }
      }
    };
  }

  window.editPoll = async function (pollId) {
    // Fetch poll data
    const poll = await window.api.getPollById(pollId);
    // Pre-fill modal fields
    titleInput.value = poll.title;
    descInput.value = poll.description;
    optionsInput.value = ""; // Optionally, fetch and join options if you want to allow editing options here
    // Store editing state
    modal.dataset.editing = pollId;
    // Hide options field when editing
    document.getElementById("setup-options-label").style.display = "none";
    // Show modal in list page
    document.getElementById("poll-list-page").style.display = "block";
    document.getElementById("poll-page").style.display = "none";
    modal.style.display = "block";
  };

  window.deletePoll = async function (pollId) {
    if (confirm("Delete this poll?")) {
      await window.api.deletePoll(pollId);
      showPollList();
    }
  };

  // Prevent form submission and handle ratings via JS
  const ratingForm = document.getElementById("ratingForm");
  if (ratingForm) {
    ratingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      // Collect ratings and submit via Ratings.submit
      if (Object.values(currentRatings).some((rating) => rating !== "0")) {
        Ratings.submit(currentRatings);
      } else {
        alert("Please rate at least one option before submitting.");
      }
    });
  }

  router();
});
