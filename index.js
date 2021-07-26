const axios = require('axios')
const express = require('express')
var bp = require('body-parser')

const app = express();
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from claims sample API client');
});

// app.post('/result', (req, res) => {
//     res.send('Hello from claims sample API client result endpoint');
// });

app.listen(port, () => console.log(`Claims sample API client listening on port ${port}!`))

// require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const BASE_API_URL = 'https://kingci2.softec.sk/10.09/KIHR109/integration-api/v2'
const REPLY_TO_URL = 'http://172.16.111.163:3000/result'
const username = 'krajcot'
const password = 'default'

let token = null;

login = (user, password) => {
    //console.log('login...')
    return new Promise((resolve, reject) => {
        const credentials = {
            user,
            password,
        }
        axios
            .post(`${BASE_API_URL}/authentication/login`, credentials)
            .then(res => {
                token = res.data.data.token;
                console.log(`login.statusCode: ${res.status}`)
                console.log(`login.token: ${token}`)
                resolve()
            })
            .catch(error => {
                console.error(error)
                reject()
            })
    })
}


createClaim = () => {
    return new Promise((resolve, reject) => {
        const data = {
            policyId: 40085109,
            occurrenceDate: new Date()
        }
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'reply-to': `${REPLY_TO_URL}`
            }
        }
        axios
            .post(`${BASE_API_URL}/claims`, data, config)
            .then(res => {
                console.log(`createClaim.statusCode: ${res.status}`)
                console.log(`createClaim.result: ${res.data}`)
                resolve(res.data)
            })
            .catch(error => {
                console.error(error)
                reject(error)
            })
    })
}

changeSuspicionState = (claimId, suspicionState) => {
    return new Promise((resolve, reject) => {
        const data = {
            suspicionState,
        }
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'reply-to': `${REPLY_TO_URL}`
            }
        }
        axios
            .post(`${BASE_API_URL}/claims/${claimId}/actions/change-suspicion-state`, data, config)
            .then(res => {
                console.log(`changeSuspicionState.statusCode: ${res.status}`)
                console.log(`changeSuspicionState.result: ${res.data}`)
                resolve(res.data)
            })
            .catch(error => {
                console.error(error)
                reject(error)
            })
    })
}

// login(username, password).then(()=> {
//     createClaim()
// })

app.post('/result', function(req, res) {
    console.log('receiving data ...');
    console.log('body is ',req.body);
    res.send(req.body);
});

app.post('/claims', function(req, res) {
    console.log('creating claim ...');
    console.log('body is ',req.body);
    
    login(username, password).then(()=> {
        createClaim().then((data) => {
            console.log(`createClaim.correlatioId: ${data}`)
            res.send(`createClaim.correlatioId: ${data}`);
        })
    })
});

app.post('/change-suspicion-state', function(req, res) {
    console.log('changing claim suspicion state ...');
    console.log('body is ',req.body);

    var data = req.body // JSON.parse(req.body)
    
    login(username, password).then(()=> {
        changeSuspicionState(data.claimId, data.suspicionState).then((data) => {
            console.log(`changeSuspicionState.correlatioId: ${data}`)
            res.send(`changeSuspicionState.correlatioId: ${data}`);
        })
    })
});