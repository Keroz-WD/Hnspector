"use strict";

console.log("Content.js : OK");

const hnNodeList = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

let dataList = [];

// Formats data to be sent to popup
const createDataList = (titles) => {
  const metaDescription = document
    .querySelector("meta[name='description']")
    .getAttribute("content");
  dataList.push({
    url: document.URL,
    title: document.title,
    description: metaDescription,
  });

  class HnData {
    constructor(tag, content) {
      this.tag = tag;
      this.content = content;
    }
  }

  let hnList = [];

  titles.forEach((element) => {
    hnList.push(new HnData(element.nodeName, element.textContent));
  });

  dataList.push(hnList);
};

// Highlight all Hn tags by changing their background color to yellow
const highlightHeaders = (titles) => {
  titles.forEach((element) => {
    console.log(element.tagName);
    element.classList.toggle("hns-header");
    element.classList.toggle(`hns-${element.tagName}`);
  });
};

const contrastContent = (isActive) => {
  if (isActive) {
    console.log("contrast on");
  } else {
    console.log("contrast off");
  }
};

// Scroll to element with hid value in dataset
const ScrollTo = (hid) => {
  hnNodeList[hid].scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  createDataList(hnNodeList);

  switch (message.request) {
    case "getData":
      sendResponse(dataList);
      break;
    case "highlight":
      highlightHeaders(hnNodeList);
      break;
    case "contrastOn":
      // Contrast content
      contrastContent(true);
      break;
    case "contrastOff":
      // Remove contrast
      contrastContent(false);
      break;
    case "scrollTo":
      ScrollTo(message.target);
      break;
  }
});
