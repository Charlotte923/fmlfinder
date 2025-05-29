document.getElementById("submit").onclick = async function () {
  const fundaUrl = document.getElementById("url").value;
  const PROXY_URL = "/api/proxy";

  try {
    // Extract the listing ID from the URL
    const matches = fundaUrl.match(/\/(\d+)(\/|$)/);
    if (!matches) {
      throw new Error(
        "Kon geen geldig Funda ID vinden in de URL. Controleer of je de juiste URL hebt ingevoerd."
      );
    }

    const listingId = matches[1];
    console.log("Found listing ID:", listingId);

    // Try a few common FML IDs based on the listing ID
    const possibleFmlIds = [
      listingId,
      `${listingId}1`,
      `${listingId}2`,
      `${listingId}0`,
    ];

    let fmlData = null;
    let successfulId = null;

    // Try each possible FML ID
    for (const fmlId of possibleFmlIds) {
      const fmlUrl = `https://fmlpub.s3-eu-west-1.amazonaws.com/${fmlId}.fml`;
      console.log("Trying FML URL:", fmlUrl);

      try {
        const fmlResponse = await fetch(
          `${PROXY_URL}?url=${encodeURIComponent(fmlUrl)}`,
          {
            method: "GET",
          }
        );

        if (fmlResponse.ok) {
          fmlData = await fmlResponse.blob();
          successfulId = fmlId;
          break;
        }
      } catch (error) {
        console.log("Failed attempt with ID:", fmlId);
      }
    }

    if (!fmlData) {
      throw new Error(
        "Kon geen FML bestand vinden. Probeer een andere URL of probeer het later opnieuw."
      );
    }

    // Extract address from the URL for the filename
    const urlParts = fundaUrl.split("/");
    const addressIndex = urlParts.indexOf("huis") + 1;
    const address = addressIndex > 0 ? urlParts[addressIndex] : "funda";
    const formattedAddress = address.replace(/[^a-zA-Z0-9]/g, "_");

    // Download the file
    const downloadLink = document.createElement("a");
    const url = window.URL.createObjectURL(fmlData);
    downloadLink.href = url;
    downloadLink.download = `${formattedAddress}_${successfulId}.fml`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    window.URL.revokeObjectURL(url);

    const giphyList = [
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWhub2llem9qODR2N2FidjE1aGczMnRkenB3djNra2phbWt6ejhrayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/a0h7sAqON67nO/giphy.gif",
      "https://media.giphy.com/media/uTuLngvL9p0Xe/giphy.gif",
      "https://media.giphy.com/media/gjiE1RizLmRCBZ3cbW/giphy.gif",
      "https://media.giphy.com/media/Sculsk7YRnRpvMZrR3/giphy.gif",
      "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif",
      "https://media.giphy.com/media/z5BOu8NJ3PAI7Jk3Yz/giphy.gif",
      "https://media.giphy.com/media/TSXSPZUSW0Lr9mYm8h/giphy.gif",
      "https://media.giphy.com/media/goKgmdgnBfbYhsZFy9/giphy.gif",
    ];
    const randomGiphy = giphyList[Math.floor(Math.random() * giphyList.length)];

    document.body.innerHTML = `
      <div class="main" style="text-align:center; margin-top:50px;">
        <h1>Download successvol! ✅</h1>
        <p>Het bestand "${formattedAddress}_${successfulId}.fml" is gedownload en veilig weg gestopt in je Downloads map! 📁 </p>
        <img src="${randomGiphy}" alt="Success GIF" style="width:400px; height:auto;"/>
        <br/><br/>
        <button onclick="window.location.reload()">Nog een keeeeeer!</button>
      </div>
    `;
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = document.createElement("div");
    errorMessage.style.color = "red";
    errorMessage.style.marginTop = "10px";
    errorMessage.innerHTML = `
      <p><strong>Error:</strong> ${err.message}</p>
      <p style="font-size: 0.9em;">Tip: Gebruik een URL van een Funda listing (bijvoorbeeld: https://www.funda.nl/koop/plaats/straat-1/12345678/)</p>
    `;
    document
      .getElementById("submit")
      .insertAdjacentElement("afterend", errorMessage);
  }
};

// Helper function to find the ID after the known key structure
function findProjectId(data) {
  let foundId = null;
  function search(data) {
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        if (key === "projectId") {
          foundId = data[key];
          console.log("Found projectId:", foundId);
          break;
        }

        search(data[key]);
      }
    }
  }
  search(data);
  if (!foundId) {
    console.log("No projectId found in the data structure.");
    return null;
  }
  return findFMLcode(data, foundId);
}

// Helper to find fml code with found ID
function findFMLcode(data, foundId) {
  let fmlCode = null;
  function search(data) {
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        if (key === foundId.toString()) {
          fmlCode = data[key];
          console.log("Found fmlCode:", fmlCode);
          break;
        }
        search(data[key]);
      }
    }
  }
  search(data);
  if (!fmlCode) {
    console.log("No fmlCode found in the data structure.");
    return null;
  }
  return fmlCode;
}


// Helper function to find the address in the JSON data
function findAddressInNuxtData(data) {
  let foundAddress = null;
  function search(data) {
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        const value = data[key];
        if (
          typeof value === "object" &&
          value.hasOwnProperty("addressSubtitle") &&
          value.hasOwnProperty("addressTitle") &&
          value.hasOwnProperty("city")
        ) {
          const nextKey = parseInt(key) + 1;
          const sibling = data[nextKey] || data[key + 1];
          if (typeof sibling === "string") {
            foundAddress = sibling;
            console.log("Found address:", foundAddress);
            break;
          }
        }
        search(value);
      }
    }
  }
  search(data);
  return foundAddress;
}
