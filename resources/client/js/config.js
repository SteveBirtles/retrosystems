let id = -1;

/*-------------------------------------------------------
  This function runs when config.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("destination", currentPage);

    checkLogin(() => {

        const imageUploadForm = document.getElementById("imageUploadForm");

        imageUploadForm.addEventListener("submit", uploadImage);

        loadManufacturers();
        loadCategories();
        loadImages();
        loadAdmins();

        document.getElementById("addManufacturer").addEventListener("click", addManufacturer);
        document.getElementById("addCategory").addEventListener("click", addCategory);
        document.getElementById("addAdmin").addEventListener("click", addAdmin);

    });

}
