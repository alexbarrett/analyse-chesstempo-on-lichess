const script = document.createElement("script");
script.src = chrome.extension.getURL("analyse-chesstempo-on-lichess.js");
document.head.appendChild(script);
