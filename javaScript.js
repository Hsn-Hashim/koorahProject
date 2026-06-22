const apiKey = "a049fb51ae0548559f2d5e6c8a8f6323";
let league = "PL"; // الدوري الإنجليزي الممتاز
const baseUrl = "https://api.football-data.org/v4/competitions";
const proxy = "https://corsproxy.io/?";
let standingsUrl = `https://corsproxy.io/?" + "https://api.football-data.org/v4/competitions/${league}/standings`;
const resultsDiv = document.getElementById('results');
const date = document.getElementById(`matchDate`);
const requestOptions = {
    method: 'GET',
    headers: {
        'X-Auth-Token': apiKey
    }
};
function changeLeague() {
    const leagueSelect = document.getElementById("leagueSelect");
    league = leagueSelect.value;
    resultsDiv.innerHTML = ``;
    url = `https://corsproxy.io/?" + "https://api.football-data.org/v4/competitions/${league}/matches`;
    standingsUrl = `https://corsproxy.io/?" + "https://api.football-data.org/v4/competitions/${league}/standings`;

}
async function getTodayMatches() {
    date.value = new Date().toISOString().split('T')[0];
    await getMatches();
}
async function getPlayingMatches() {
    date.value = new Date().toISOString().split('T')[0];
    const data = await getTheMatches(date, url, resultsDiv);
    let playingMatches = data.filter(match => match.status === "IN_PLAY");
    if (playingMatches.length === 0) {
        resultsDiv.innerHTML = "لا توجد مباريات جارية حالياً.";
        return;
    }
    let playingMatchesHTML = ``;
    playingMatches.forEach(match => {
        playingMatchesHTML += `
                <div class="match">
                    <div>
                    <img class="logo" src=${match.homeTeam.crest}>
                    <div>${match.homeTeam.name}</div>
                    </div>
                    <div class="score">${match.score.fullTime.home} - ${match.score.fullTime.away}</div>
                    <div>
                    <img class="logo" src=${match.awayTeam.crest}>
                    <div>${match.awayTeam.name}</div>
                    </div>
                </div>

            `;
    });
    resultsDiv.innerHTML = playingMatchesHTML;
}

async function getMatches() {

    if (date.value === "") {
        resultsDiv.innerHTML = "الرجاء اختيار تاريخ.";
        return;
    }
    const url = `${proxy}${baseUrl}/${league}/matches`;
    const dayMatches = await getTheMatches(date, url, resultsDiv);
    if (dayMatches.length === 0) {
        resultsDiv.innerHTML = "لا توجد مباريات اليوم.";
        return;
    }

    let allMatchesHTML = ``;
    dayMatches.forEach(match => {
        if (match.status === "TIMED") {
            let matchDateStr = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            allMatchesHTML += `
                <div class="match">
                    <div>
                    <img class="logo" src=${match.homeTeam.crest}>
                    <div>${match.homeTeam.name}</div>
                    </div>
                    <div class="date" style ="">${matchDateStr}</div>
                    <div>
                    <img class="logo" src=${match.awayTeam.crest}>
                    <div>${match.awayTeam.name}</div>
                    </div>
                </div>

            `;

        }
        else if (match.status === "FINISHED") {
            allMatchesHTML += `
                <div class="match">
                    <div>
                    <img class="logo" src=${match.homeTeam.crest}>
                    <div>${match.homeTeam.name}</div>
                    </div>
                    <span>
                    <div class="score">${match.score.fullTime.home} - ${match.score.fullTime.away}</div>
                    <p>انتهت</p>
                    </span>
                    <div>
                    <img class="logo" src=${match.awayTeam.crest}>
                    <div>${match.awayTeam.name}</div>
                    </div>
                </div>

            `;
        }
        else if (match.status === "IN_PLAY") {
            allMatchesHTML += `
                <div class="match">
                    <div>
                    <img class="logo" src=${match.homeTeam.crest}>
                    <div>${match.homeTeam.name}</div>
                    </div>
                    <span>
                    <div class="score">${match.score.fullTime.home} - ${match.score.fullTime.away}</div>
                    <p>انتهت</p>
                    </span>
                    <div>
                    <img class="logo" src=${match.awayTeam.crest}>
                    <div>${match.awayTeam.name}</div>
                    </div>
                </div>

            `;
        }
        else if (match.status === "POSTPONED") {
            allMatchesHTML += `
                <div class="match">
                    <div>
                    <img class="logo" src=${match.homeTeam.crest}>
                    <div>${match.homeTeam.name}</div>
                    </div>
                    <div class="score">${match.score.fullTime.home == null ? "غير محدد" : match.score.fullTime.home} - ${match.score.fullTime.away == null ? "غير محدد" : match.score.fullTime.away}</div>
                    <div>
                    <img class="logo" src=${match.awayTeam.crest}>
                    <div>${match.awayTeam.name}</div>
                    </div>
                </div>

            `;

        }
    });
    resultsDiv.innerHTML = allMatchesHTML;
}
async function getTheMatches(date, url, resultsDiv) {
    try {
        const data = await getData(url);
        let dayMatches = data.matches.filter(match => {
            return new Date(match.utcDate).toDateString() === new Date(date.value).toDateString();
        });
        console.log(data.matches);

        if (dayMatches.length === 0) {
            resultsDiv.innerHTML = "لا توجد مباريات اليوم.";
            return [];
        }
        return dayMatches;
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = `حدثت مشكلة: ${error.message}`;
        return [];
    }
}
async function getStandings() {
    const standingsUrl = `${proxy}${baseUrl}/${league}/standings`;
    const data = await getData(standingsUrl);
    const table = data.standings[0].table;
    console.log(table);
    let standingHTML = `
<div style="overflow-x: auto; margin-top: 20px;"> 
<table width="100%">
<thead>
    <th>الترتيب</th>
    <th>الفريق</th>
    <th>المباريات</th>
    <th>النقاط</th>
    <th>الفوز</th>
    <th>التعادل</th>
    <th>الخسارة</th>
</thead>
<tbody>
       `;
    table.forEach(team => {
        standingHTML += `
        <tr>
        <td>${team.position}</td>
        <td align="right"><img src=${team.team.crest} width="50" height="50"> <span>${team.team.name}</span></td>
        <td>${team.playedGames}</td>
        <td>${team.points}</td>
        <td>${team.won}</td>
        <td>${team.draw}</td>
        <td>${team.lost}</td>
        </tr>
        `;
    })
    standingHTML += `
         </tbody>
         </table>
         </div>
         `;
    resultsDiv.innerHTML = standingHTML;

}
async function getData(url) {
    const response = await fetch(url, requestOptions);
    if (!response.ok) throw new Error(`خطأ: ${response.status}`);

    const data = await response.json();
    return data;
}