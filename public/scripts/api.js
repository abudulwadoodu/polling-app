function getUserEmail() {
  return localStorage.getItem("poll_user_email") || "";
}

async function apiFetch(path, options = {}) {
  const user_email = getUserEmail();
  // Ensure path starts with a slash
  if (!path.startsWith("/")) path = "/" + path;
  // Always prefix with /api
  let url = "/api" + path;
  // For GET requests, append as query param
  if (!options.method || options.method === "GET") {
    const urlObj = new URL(url, window.location.origin);
    if (user_email) urlObj.searchParams.append("user_email", user_email);
    url = urlObj.pathname + urlObj.search;
  } else {
    // For POST/PUT, add to body if JSON
    if (options.headers && options.headers["Content-Type"] === "application/json") {
      let body = options.body ? JSON.parse(options.body) : {};
      if (user_email) body.user_email = user_email;
      options.body = JSON.stringify(body);
    }
  }
  const res = await fetch(url, options);
  return res.json();
}

window.api = {
  // Polls
  async getPolls() {
    return apiFetch('/polls');
  },
  async getPollById(id) {
    return apiFetch(`/poll/${id}`);
  },
  async createPoll(data) {
    return apiFetch('/createPoll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  async updatePoll(id, data) {
    return apiFetch(`/poll/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  async deletePoll(id) {
    return apiFetch(`/poll/${id}`, { method: 'DELETE' });
  },
  async reportPoll(pollId, reason = "") {
    return apiFetch(`/poll/${pollId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
  },
  async markPollNotIssue(id) {
    return apiFetch(`/poll/${id}/markNotIssue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: getUserEmail() })
    });
  },

  // Options
  async markOptionNotIssue(optionId) {
    return apiFetch(`/option/${optionId}/markNotIssue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: getUserEmail() })
    });
  },
  async addOptionToPoll(pollId, data) {
    return apiFetch(`/poll/${pollId}/option`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  async rateOptionsByPollId(pollId, data) {
    return apiFetch(`/poll/${pollId}/rateOptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async getOptionsByPollId(pollId, sortBy = "name") {
    return apiFetch(`/poll/${pollId}/options?sortBy=${sortBy}`);
  },
  async updateOption(optionId, data) {
    return apiFetch(`/option/${optionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  async deleteOption(optionId) {
    return apiFetch(`/option/${optionId}`, { method: 'DELETE' });
  },
  async reportOption(optionId, reason = "") {
    return apiFetch(`/option/${optionId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
  },
  async getRatingsByPollId(pollId, sortBy = "name") {
    return apiFetch(`/poll/${pollId}/getAllRatings?sortBy=${sortBy}`);
  },

  // Comments
  async getCommentsByPollId(pollId) {
    return apiFetch(`/poll/${pollId}/comments`);
  },
  async addCommentToPoll(pollId, text) {
    return apiFetch(`/poll/${pollId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  },

  // Reported
  async getReportedPolls() {
    return apiFetch("/reportedPolls");
  },
  async getReportedOptions() {
    return apiFetch("/reportedOptions");
  },

};