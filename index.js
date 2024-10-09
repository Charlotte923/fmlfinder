document.getElementById("submit").onclick = async function () {
  const fundaUrl = document.getElementById("url").value;

  try {
    // Fetch the Funda page
    const response = await fetch(fundaUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
      },
    });

    const pageText = await response.text();
    document.getElementById("fundapagina").innerHTML = pageText; // For debugging

    // Extract the JSON data from the <script> tag with id="__NUXT_DATA__"
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageText, "text/html");
    const nuxtDataScript = doc.querySelector("#__NUXT_DATA__");
    const nuxtDataJson = JSON.parse(nuxtDataScript.innerHTML);

    // Find the ID based on the known key structure
    const dynamicId = findIdAfterProject(nuxtDataJson);

    // Find the address from the JSON structure (adjust this path based on actual data)
    const address = findAddressInNuxtData(nuxtDataJson);

    if (dynamicId && address) {
      // Format the address to create a valid file name (remove spaces, commas, etc.)
      const formattedAddress = address.replace(/\s+/g, "_").replace(/[,]/g, "");

      // Construct the URL for the .fml file using the dynamic ID
      const fmlUrl = `https://fmlpub.s3-eu-west-1.amazonaws.com/${dynamicId}.fml?editor_version=2.30.182&auth_token=undefined`;

      // Fetch the .fml file
      const fmlResponse = await fetch(fmlUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
        },
      });

      if (fmlResponse.ok) {
        const fmlBlob = await fmlResponse.blob();
        const downloadLink = document.createElement("a");
        const url = window.URL.createObjectURL(fmlBlob);
        console.log("Download URL:", url); // Log for debugging
        downloadLink.href = url;
        downloadLink.download = `${formattedAddress}.fml`; // Name the file after the address
        document.body.appendChild(downloadLink);
        downloadLink.click();
        window.URL.revokeObjectURL(url); // Clean up

        // List of Giphy URLs
        const giphyList = [
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWhub2llem9qODR2N2FidjE1aGczMnRkenB3djNra2phbWt6ejhrayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/a0h7sAqON67nO/giphy.gif",
          "https://media.giphy.com/media/uTuLngvL9p0Xe/giphy.gif?cid=790b76111hnoiezoj84v7abv15hg32tdzpwv3kkjamkzz8kk&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/gjiE1RizLmRCBZ3cbW/giphy.gif?cid=790b76111hnoiezoj84v7abv15hg32tdzpwv3kkjamkzz8kk&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/Sculsk7YRnRpvMZrR3/giphy.gif?cid=ecf05e471qr7tnlr9oyj1gh8kitmk57uzd35p97qxmlnaimy&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif?cid=ecf05e471qr7tnlr9oyj1gh8kitmk57uzd35p97qxmlnaimy&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/z5BOu8NJ3PAI7Jk3Yz/giphy.gif?cid=ecf05e47svk0tkbwu8x34epxo0ifne6cv2fn01dusxmuacu3&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/TSXSPZUSW0Lr9mYm8h/giphy.gif?cid=ecf05e47x9dd4t7ukmy216utx5s7cd6qpzo874hewwmaferc&ep=v1_gifs_search&rid=giphy.gif&ct=g",
          "https://media.giphy.com/media/goKgmdgnBfbYhsZFy9/giphy.gif?cid=ecf05e477hd3lfy5rj4dhxnkl90h2z1rr07y0u0gz6uixqs8&ep=v1_gifs_search&rid=giphy.gif&ct=g",
        ];

        // Randomly select one Giphy URL
        const randomGiphy =
          giphyList[Math.floor(Math.random() * giphyList.length)];

        // Display success message with the randomly chosen Giphy GIF
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
        window.alert("Failed to download .fml file");
        console.log("Error fetching .fml file: " + fmlResponse.status);
      }
    } else {
      window.alert("No .fml ID found on this page");
    }
  } catch (err) {
    console.log("Fetch error: " + err);
    window.alert("Something went wrong");
  }
};

// Helper function to find the ID after the known key structure
function findIdAfterProject(data) {
  let foundId = null;

  function searchForProject(data) {
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        const value = data[key];

        // Check if this object contains the known key structure
        if (
          typeof value === "object" &&
          value.hasOwnProperty("projectId") &&
          value.hasOwnProperty("floors") &&
          value.hasOwnProperty("thumbnailBaseUrl")
        ) {
          // Found the structure we're looking for, now check the next sibling
          // Assuming the ID is a number and comes after this structure in the JSON
          const nextKey = parseInt(key) + 1;
          const sibling = data[nextKey] || data[key + 1];
          if (typeof sibling === "string" && /^\d+$/.test(sibling)) {
            foundId = sibling; // This should be the ID
            break;
          }
        }
        // Recursively search nested objects
        searchForProject(value);
      }
    }
  }

  searchForProject(data);
  return foundId;
}

// Helper function to find the address in the JSON data
function findAddressInNuxtData(data) {
  let foundAddress = null;

  function searchForAddress(data) {
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        const value = data[key];

        // Check if this object contains the address
        if (
          typeof value === "object" &&
          value.hasOwnProperty("addressSubtitle") &&
          value.hasOwnProperty("addressTitle") &&
          value.hasOwnProperty("city")
        ) {
          // Found the structure we're looking for, now check the next sibling
          // Assuming the address is a string and comes after this structure in the JSON
          const nextKey = parseInt(key) + 1;
          const sibling = data[nextKey] || data[key + 1];
          if (typeof sibling === "string") {
            foundAddress = sibling; // This should be the address
            break;
          }
        }
        // Recursively search nested objects
        searchForAddress(value);
      }
    }
  }

  searchForAddress(data);
  return foundAddress;
}
