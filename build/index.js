document.getElementById("submit").onclick = async function () {
  const url = document.getElementById("url").value;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        UserAgent:
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
      },
    });
    document.getElementById("fundapagina").innerHTML = await response.text(); // Replaces body with response
    var d = document.getElementById("fundapagina"),
      mapdiv = d.querySelector(".media-viewer-plattegrond-container");
    if (mapdiv) {
      const a = document.createElement("a");
      a.href = mapdiv.dataset.plattegrondSrc;
      a.download = "Plattegrond";
      a.click();
    } else {
      window.alert("Deze website heeft geen plattegrond 🥞");
    }
  } catch (err) {
    console.log("Fetch error:" + err); // Error handling
  }
};
