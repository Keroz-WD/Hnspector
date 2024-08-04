"use strict";

console.log("Test content.js : OK");

const titlesList = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

// const displayTitles = () => {
//   titlesList.forEach((node) => {
//     console.log(node.nodeName);
//     console.log(node.textContent);
//   });
// };

const list = () => {
  const obj = {};
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(titlesList);
  console.log(titlesList);
  highlightTitles(titlesList);
  getTitlesContent(titlesList);
});

// Set titles' background in yellow
const highlightTitles = (titles) => {
  titles.forEach((element) => {
    element.style.backgroundColor = "yellow";
  });
};

const getTitlesContent = (titles) => {
  titles.forEach((element) => {
    console.log(element.textContent);
  });
};
