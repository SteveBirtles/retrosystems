/*-------------------------------------------------------
  This function runs when login.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {

    resetLoginForm();

}

/*-------------------------------------------------------
  Fist checks the 'destination' cookie, if it is not set redirect to index.html
  Next, adds an listener for the submit event of 'loginForm'
  which will do an API request to /admin/login using data from the form
  and redirect to the destination (as specified in the cookie) if login is successful
  ------------------------------------------------------*/
function resetLoginForm() {

    if (Cookies.get("destination") === undefined) {
        window.location.href = "/client/index.html";
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        let formData = new FormData(loginForm);

        fetch('/admin/login', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    Cookies.set("sessionToken", data.token);
                    window.location.href = Cookies.get("destination");
                }
            }
        );
    });

}

/*-------------------------------------------------------
  Does an API request to /admin/check (assuming there is a 'sessionToken' cookie)
  If the response is a valid user, add a event listener to the click event of the 'logout' button
  and run the function onSuccess as passed as an argument to the function
  If not a valid user, redirect to login.html
  ------------------------------------------------------*/
function checkLogin(onSuccess) {

    let currentPage = window.location.pathname;
    let token = Cookies.get("sessionToken");

    if (token !== undefined) {

        fetch('/admin/check', {method: 'get'}
        ).then(response => response.json()
        ).then(data => {


                if (data.hasOwnProperty("username") && data.username !== "") {
                    document.getElementById("logout").addEventListener("click", logout);
                    onSuccess();
                } else {
                    if (data.hasOwnProperty("error")) {
                        alert(data.error);
                    }
                    if (currentPage !== '/client/login.html') {
                        window.location.href = '/client/login.html';
                    }
                }
            }
        );
    } else {
        if (currentPage !== '/client/login.html') {
            window.location.href = '/client/login.html';
        }
    }
}

/*-------------------------------------------------------
  Does an API request to /admin/logout
  Then deletes the 'sessionToken' cookie and redirects to index.html
  ------------------------------------------------------*/
function logout() {

    fetch('/admin/logout', {method: 'post'}
    ).then(() => {
            Cookies.remove("sessionToken");
            window.location.href = "/client/index.html";
        }
    );

}
