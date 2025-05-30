document.getElementById("submit").onclick = async function () {
  const fundaUrl = document.getElementById("url").value;
  const PROXY_URL = "/api/proxy"; // Updated to use Vercel's API route

  try {
    console.log("Fetching URL:", fundaUrl); // Debug log
    // Fetch the Funda page through our proxy
    const response = await fetch(
      `${PROXY_URL}?url=${encodeURIComponent(fundaUrl)}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const pageText = await response.text();
    console.log("Received response length:", pageText.length); // Debug log

    // Extract the JSON data from the <script> tag with id="__NUXT_DATA__"
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageText, "text/html");
    const nuxtDataScript = doc.querySelector("#__NUXT_DATA__");
    if (!nuxtDataScript) {
      throw new Error(
        "Kon de pagina niet laden. Probeer de directe link naar de plattegrond pagina."
      );
    }

    console.log("Found NUXT data script"); // Debug log
    const nuxtDataJson = JSON.parse(nuxtDataScript.innerHTML);

    // Extract the project ID and address
    const dynamicId = findProjectId(nuxtDataJson);
    const address = findAddressInNuxtData(nuxtDataJson);

    console.log("Found ID:", dynamicId); // Debug log
    console.log("Found address:", address); // Debug log

    if (dynamicId && address) {
      const formattedAddress = address.replace(/\s+/g, "_").replace(/[,]/g, "");
      // Construct the URL for the .fml file using the dynamic ID
      const fmlUrl = `https://fmlpub.s3-eu-west-1.amazonaws.com/${dynamicId}.fml`;
      console.log("Attempting to fetch FML from:", fmlUrl); // Debug log

      // Fetch the .fml file through our proxy
      const fmlResponse = await fetch(
        `${PROXY_URL}?url=${encodeURIComponent(fmlUrl)}`,
        {
          method: "GET",
        }
      );

      if (!fmlResponse.ok) {
        throw new Error(
          `FML bestand niet gevonden. Status: ${fmlResponse.status}`
        );
      }

      const fmlBlob = await fmlResponse.blob();
      const downloadLink = document.createElement("a");
      const url = window.URL.createObjectURL(fmlBlob);
      downloadLink.href = url;
      downloadLink.download = `${formattedAddress}.fml`;
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
      const randomGiphy =
        giphyList[Math.floor(Math.random() * giphyList.length)];

      document.body.innerHTML = `
        <div class="main" style="text-align:center; margin-top:50px;">
          <h1>Download successvol! ✅</h1>
          <p>Het bestand "${formattedAddress}.fml" is gedownload en veilig weg gestopt in je Downloads map! 📁 </p>
          <img src="${randomGiphy}" alt="Success GIF" style="width:400px; height:auto;"/>
          <br/><br/>
          <button onclick="window.location.reload()">Nog een keeeeeer!</button>
        </div>
      `;
    } else {
      throw new Error(
        "Geen FML ID of adres gevonden op deze pagina. Probeer de directe link naar de plattegrond pagina."
      );
    }
  } catch (err) {
    console.error("Error:", err); // More detailed error logging
    const errorMessage = document.createElement("div");
    errorMessage.style.color = "red";
    errorMessage.style.marginTop = "10px";
    errorMessage.innerHTML = `
      <p><strong>Error:</strong> ${err.message}</p>
      <p style="font-size: 0.9em;">Tip: Gebruik de directe link naar de plattegrond pagina van Funda.</p>
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
