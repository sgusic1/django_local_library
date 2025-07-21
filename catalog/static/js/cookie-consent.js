const cookie_banner = document.getElementById('cookie-banner');
const cookie_list = document.cookie.split(';').map(cookie => cookie.trim());
const match = cookie_list.find(item => item.startsWith("cookies_accepted="));

let is_cookie_accepted = null;
if(match === undefined) cookie_banner.classList.add('show');
else {
    is_cookie_accepted = match.split('=')[1];
    if (is_cookie_accepted !== "true") cookie_banner.classList.add('show');
}



if(cookie_banner.classList.contains('show')){
   let decline_button = document.getElementById('decline-cookie');
   let accept_button = document.getElementById('accept-cookie');

   decline_button.addEventListener("click", (event) => {
    document.cookie = "cookies_accepted=false; path=/"
    cookie_banner.classList.remove('show');
   });

   accept_button.addEventListener("click", (event) => {
    document.cookie = "cookies_accepted=true; path=/"
    cookie_banner.classList.remove('show');
   });


}