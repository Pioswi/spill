var ammoAntall = 10;
var poengSum = 0;
var treffSum = 0;
var gameInterval = null;
var ammoFelt = document.getElementById("divAmmo");
var poengFelt = document.getElementById("divPoeng");
var spillFelt = document.getElementById("divSpill");
var spillMeny = document.getElementById("divMeny");
var skyteLyd = new Audio('Aud/Skudd.mp3');
var vinneLyd = new Audio('Aud/Win.mp3');
var skrikLyd = new Audio('Aud/Scream.mp3');
var targetBilde = [
    {type:"ammo", img:"ammo.png", x:0 ,y:0, treff:false},
    {type:"badguy", img:"badguy.png", x:0 ,y:0, treff:false},
    {type:"badguy", img:"badguy.png", x:0 ,y:0, treff:false},
    {type:"badguy", img:"badguy.png", x:0 ,y:0, treff:false},
    {type:"goodguy", img:"goodguy.png", x:0 ,y:0, treff:false},


];

var isLoggedIn = false;

// Simple login function (you might want to connect this to a real backend)
function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Simple validation - you should replace this with real authentication
    if (username && password) {
        isLoggedIn = true;
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("gameContent").style.display = "block";
        
        // Initialize game after login
        initializeGame();
    } else {
        alert("Vennligst fyll inn brukernavn og passord");
    }
}

// Move game initialization code to a separate function
function initializeGame() {
    createBilder();
    startInterval();
    updateStats();
}

// Update event listener to only work when logged in
document.body.addEventListener("click", function(evt) {
    if (!isLoggedIn) return; // Ignore clicks if not logged in

    skyteLyd.pause();
    skyteLyd.currentTime = 0;
    skyteLyd.play();
    ammoAntall = ammoAntall - 1;
    if(evt.target.className=="click_object") {
        clickedImage(evt.target.getAttribute("data-index"));
        evt.target.style.display = "none";
        checkGameStatus();
    }
    updateStats();
}, false);

function restartGame()
{
    // Tilbakestill variabler
     ammoAntall = 10;
     poengSum = 0;
     treffSum = 0;
     // Sett alle treff til false
     for(var i = 0; i < targetBilde.length ; i++)
     {
        targetBilde[i].treff = false;
     }

     var allImages = document.getElementsByTagName('img');
    for(var i=0; i < allImages.length; i++)
 {
    allImages[i].style.display = "inline";
 }

    spillMeny.style.display = "none";

    startInterval();
}

function startInterval()
{
    gameInterval = setInterval(function()
{
    moveImages();
}, 1000);
}

function gameOver()
{
    clearInterval(gameInterval);
    spillMeny.style.display = "inline"; 
    document.getElementById("poeng").innerHTML = poengSum;
    vinneLyd.play();

}

function checkGameStatus()
{
    var harVunnet = true
    for(var i = 0; i < targetBilde.length ; i++)
    {
        if(targetBilde[i].type=="badguy")
        {
            if(targetBilde[i].treff==false)
            {
                harVunnet = false;
            }
        }
    }

    if(harVunnet == true)
    {
        gameOver();
    }

}

function updateStats()
{
    ammoFelt.innerHTML = ammoAntall
    poengFelt.innerHTML = poengSum
}

function createBilder()
{
 for(var i=0; i < targetBilde.length; i++)
 {
    var img = document.createElement("img");
    img.src = "gfx/" + targetBilde[i].img;
    img.setAttribute("data-index", i);
    img.style.position = "absolute";
    img.setAttribute("class","click_object");
    img.style.left = newPosition().x + "px";
    img.style.top = newPosition().y + "px";
    spillFelt.appendChild(img);

 }
}

function moveImages()
{
    var allImages = document.getElementsByTagName('img');


    for(var i=0; i < allImages.length; i++)
 {
    allImages[i].style.left = newPosition().x + "px";
    allImages[i].style.top = newPosition().y + "px";
 }
}

function clickedImage(index)
{
    
    console.log(targetBilde[index]);
    if(targetBilde[index].type=="ammo")
    {
        refillAmmo();
    }
    else if(targetBilde[index].type=="badguy")
    {
        killBadguy();
    }
    else if(targetBilde[index].type=="goodguy")
    {
        killCivilian();
        skrikLyd.play();
    }

    targetBilde[index].treff = true;
    

}  

function killCivilian()
{
    poengSum = poengSum - 20;
}

function killBadguy()
{
    poengSum = poengSum + 1;
}

function refillAmmo()
{
    ammoAntall = ammoAntall + 5;
}

function newPosition()
{
    var pos = {x:0,y:0};
    var max_X = spillFelt.offsetWidth - 64;
    var max_Y = spillFelt.offsetHeight - 64;
    pos["x"] = (Math.random() * max_X).toFixed();
    pos["y"] = (Math.random() * max_Y).toFixed();
    
    return(pos);
}
