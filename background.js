console.log("Background Script is running");

const LYRICS_API_URL = "https://lyrics.astrid.sh/api/search/?q=";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (changeInfo.title) {
    console.log(`Tab updated with title: ${changeInfo.title}`);
    const changedTitle = changeInfo.title;
    let lyricSend, reqSong;

    if (!changedTitle.includes(".")) {
      lyricSend = "Play a song on Spotify.com and retry :)";
    } else {
      try {
        reqSong = extractSongInfo(changedTitle);
        lyricSend = await fetchLyrics(reqSong);
      } catch (error) {
        console.error("Error processing lyrics:", error);
        lyricSend = "Lyrics not found!!";
      }

      // Send the lyrics and song info to the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
          const activeTab = tabs[0];
          console.log(`Sending message to content.js for tab: ${activeTab.title}`);
          chrome.tabs.sendMessage(
            activeTab.id,
            { lyric: lyricSend, name: reqSong },
            function (response) {
              if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
              } else {
                console.log("Response from content.js:", response);
              }
            }
          );
        }
      });
    }
  }
});

async function fetchLyrics(song) {
  try {
    const searchUrl = `${CORS_PROXY}${LYRICS_API_URL}${encodeURIComponent(song)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`HTTP Error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    if (!searchData || !searchData.lyrics) {
      throw new Error("No lyrics found in response.");
    }

    console.log("Lyrics fetched successfully:", searchData.lyrics);
    return searchData.lyrics || "Lyrics not found";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Lyrics not found";
  }
}

function extractSongInfo(titleContent) {
  let songSend;

  if (titleContent.includes(".")) {
    const titleParts = titleContent.split(".");
    songSend = titleParts[0].trim();

    if (songSend.includes("(")) {
      songSend = songSend.split("(")[0].trim();
    }

    console.log(`Extracted song title: ${songSend}`);
  } else {
    songSend = "Could not find song title or artist name on Spotify.com";
  }

  return songSend;
}
