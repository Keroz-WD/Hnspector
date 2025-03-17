"use strict";

let hnNodeList = Array.from(
  document.querySelectorAll("h1, h2, h3, h4, h5, h6")
).filter((element) => {
  const style = getComputedStyle(element);
  if (style.display === "none") return false;

  const children = Array.from(element.children);
  if (children.length === 0) return true;

  return children.some((child) => {
    const childStyle = getComputedStyle(child);
    return childStyle.display !== "none" && child.textContent.trim() !== "";
  });
});
let dataList = [];
let hBoxArray = [];
let hBoxInitialized = false;

// Formats data to be sent to popup.js
const createDataList = (titles) => {
  // Init dataList strucutre
  dataList = {
    pageInfo: {
      url: document.URL,
      title: document.title || "<Page title is missing>",
    },
    headers: [],
  };

  class HnData {
    constructor(tag, content) {
      this.tag = tag;
      this.content = content;
    }
  }

  titles.forEach((element) => {
    let content = "";
    if (hBoxInitialized) {
      // Remove Hn indicator value injected in DOM
      content = element.textContent.trim().slice(0, -2);
    } else {
      content = element.textContent.trim();
    }
    dataList.headers.push(new HnData(element.nodeName, content));
  });
};

// Updates the list of titles and reacts to DOM changes
const updateHeaders = () => {
  hnNodeList = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ).filter((element) => {
    const style = getComputedStyle(element);
    if (style.display === "none") return false;

    const children = Array.from(element.children);
    if (children.length === 0) return true;

    return children.some((child) => {
      const childStyle = getComputedStyle(child);
      return childStyle.display !== "none" && child.textContent.trim() !== "";
    });
  });
  createDataList(hnNodeList);
};

// Observer to detect DOM changes
const observer = new MutationObserver(updateHeaders);

// Observe the addition and deletion of nodes in the DOM
observer.observe(document.body, { childList: true, subtree: true });

// Mettre à jour les titres au démarrage
updateHeaders();

// Highlight headings
const highlightHeaders = (titles) => {
  titles.forEach((element) => {
    // Check if H tag is not empty
    if (element.textContent === "") return;

    // Change element's background
    element.classList.toggle("hns-header");
    element.classList.toggle(`hns-${element.tagName}`);

    if (hBoxInitialized === false) {
      buildHnBoxes(element);
    }
  });

  hBoxArray.forEach((element) => element.classList.toggle("hns-show"));

  hBoxInitialized = true;
};

// Add header tag indicator
const buildHnBoxes = (element) => {
  const hBox = document.createElement("div");

  hBox.classList.add("hns-hBox");
  hBox.classList.add(`hns-${element.tagName}`);

  hBox.textContent = element.tagName;
  element.appendChild(hBox);
  hBoxArray.push(hBox);
};

// Scroll to element with hid value in dataset
const ScrollTo = (hid) => {
  if (hnNodeList[hid]) {
    const targetElement = hnNodeList[hid];

    const isScrollNeeded = () => {
      const viewportHeight = window.innerHeight;
      const rect = targetElement.getBoundingClientRect();
      return rect.top < 0 || rect.bottom > viewportHeight;
    };

    if (isScrollNeeded()) {
      // If a scroll is need, use scrollEnd
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const handleScrollEnd = () => {
        makeItBlink(targetElement);
        window.removeEventListener("scrollend", handleScrollEnd);
      };

      window.addEventListener("scrollend", handleScrollEnd);
    } else {
      // Si aucun scroll n'est nécessaire, déclencher makeItBlink immédiatement
      makeItBlink(targetElement);
    }
  } else {
    console.error("Incorrect index to scroll to:", hid);
  }
};

const makeItBlink = (target) => {
  let count = 0;
  const interval = () => {
    if (count < 6) {
      target.classList.toggle("hns-hidden");
      count++;
      setTimeout(interval, 100);
    }
  };
  interval();
};

// Check if headers are highlighted
const isHighlighted = () => {
  const highlighted =
    hnNodeList.length > 0 && hnNodeList[0].classList.contains("hns-header");
  return { highlight: highlighted };
};

// Listen requests sent by popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  createDataList(hnNodeList);

  switch (message.request) {
    case "getData":
      sendResponse(dataList);
      break;
    case "checkHighlight":
      sendResponse(isHighlighted());
      break;
    case "highlight":
      highlightHeaders(hnNodeList);
      break;
    case "scrollTo":
      ScrollTo(message.target);
      break;
    default:
      console.warn("Unknown request received:", message.request);
  }
  return true; // ¯\_(ツ)_/¯
});
