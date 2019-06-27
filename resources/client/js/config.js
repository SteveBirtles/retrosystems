/*-------------------------------------------------------
  This function runs when config.html is loaded.
  The current page URL is stored in the 'destination' cookie.
  Then, checkLogin is called from admin.js...
  If successful, functions from several other JavaScript files are called...
      - configAdmins.js
      - configImages.js
      - configManufacturers.js
      - configCategories.js
  ...and event listeners are added to the various add item buttons and the imageUploadForm submit event.
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
