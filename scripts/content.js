"use strict";

console.log("Test content.js : OK");

let h1 = document.querySelector("h1").textContent;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(h1);
});
