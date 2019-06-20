/*-------------------------------------------------------
  This function runs when config.html is loaded.
  Functions from several other JavaScript files are called...
      - configAdmins.js
      - configImages.js
      - configManufacturers.js
      - configCategories.js
  ...as well as admin.js to check the login.
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("destination", currentPage);

    checkLogin(() => {

        loadAdmins();
        loadImages();
        loadManufacturers();
        loadCategories();

        document.getElementById("addAdmin").addEventListener("click", addAdmin);
        document.getElementById("imageUploadForm").addEventListener("submit", uploadImage);
        document.getElementById("addManufacturer").addEventListener("click", addManufacturer);
        document.getElementById("addCategory").addEventListener("click", addCategory);

    });

}
