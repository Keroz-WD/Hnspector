"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");

  function display_h1(h1) {
    document.getElementById("h1").innerHTML = h1;
  }

  startButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { data: "hello" }, (response) => {
        if (response) {
          console.log(response);
        } else {
          // Catch error
        }
      });
    });
  });
});
