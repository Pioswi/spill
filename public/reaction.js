let startTime, reactionTime;
let waiting = false;

function startReactionGame() {
    document.body.style.backgroundColor = "red";
    waiting = true;

    let randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds

    setTimeout(() => {
        document.body.style.backgroundColor = "green";
        startTime = Date.now();
    }, randomDelay);
}

document.body.addEventListener("click", () => {
    if (waiting && document.body.style.backgroundColor === "green") {
        reactionTime = Date.now() - startTime;
        alert("Your reaction time: " + reactionTime + "ms");
        saveReactionTime(reactionTime);
    }
});

function saveReactionTime(score) {
    fetch("/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: score, game_name: "reaction_test" })
    }).then(res => res.json()).then(data => {
        alert("Score saved! Check leaderboard.");
    }).catch(err => console.error("Error saving score:", err));
}

startReactionGame();
