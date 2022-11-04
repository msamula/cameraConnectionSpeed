let image = document.getElementById('image');
let start, end;

class Token {
    constructor(accessToken, type, expireSec, scope, refreshToken, iat, exp) {
        this.accessToken = accessToken;
        this.type = type;
        this.expireSec = expireSec;
        this.scope = scope;
        this.refreshToken = refreshToken;
        this.iat = iat;
        this.exp = exp;
    }
}

function getToken(ip,cliId,cliSecret,user,password)
{
    let token;
    let url = `http://${ip}/api/oauth/token?client_id=${cliId}&client_secret=${cliSecret}&grant_type=password&username=${user}&password=${password}`;

    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open('POST', url, false);
    xmlHttp.setRequestHeader('accept', 'application/json');

    xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState === 4 && xmlHttp.status === 200) {

            let response = JSON.parse(xmlHttp.responseText);
            token = new Token(response['access_token'],response['token_type'],response['expires_in'],response['scope'],response['refresh_token'],response['iat'],response['exp']);
        }
    }

    xmlHttp.send();
    return token;
}

async function fetchImage(ip, token, imgID)
{
    start = new Date();

    let response = await fetch(`http://${ip}/api/images/live`, {
        headers: {
            'accept': 'image/bmp',
            'Authorization': `Bearer ${token}`
        }
    })

    image.src = URL.createObjectURL(await response.blob());

    end = new Date();
    console.log(end.getTime() - start.getTime() + ' ms [FETCH IMAGE]');

    await fetchImage(ip, token, imgID);
}

function getImg(ip, token)
{
    start = new Date();

    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open( 'GET', `http://${ip}/api/images/live`, true); // false for synchronous request
    xmlHttp.setRequestHeader('accept', 'image/bmp');
    xmlHttp.setRequestHeader('Authorization', `Bearer ${token}`);
    xmlHttp.responseType = 'blob';

    xmlHttp.onload = function (){

        image.src = URL.createObjectURL(this.response);

        end = new Date();
        let time = end.getTime()-start.getTime();
        console.log(time + ' ms [GET IMAGE]');

        getImg(ip,token);
    }

    xmlHttp.send( null );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MAIN

let ipAddress = '192.168.3.20'; //'192.168.3.20' 'localhost:8080'

let token = getToken(ipAddress,'irsxApp', 'MnrY2L86pEQr53%216' /*MnrY2L86pEQr53!6*/, 'administrator', 'administrator');

getImg(ipAddress,token.accessToken);
//fetchImage(ipAddress,token.accessToken, 'image');

