const eosjs2 = require('../eosjs2');
const { JsonRpc, JsSignatureProvider, Api } = eosjs2;
var endpoint = process.env.REACT_APP_EOS_HTTP_ENDPOINT;
var url = endpoint;

//Main action call to the blockchain
async function takeAction(action, dataValue) {
    let textDecoder = new TextDecoder('utf-8');
    let textEncoder = new TextEncoder('utf-8');
    const privateKey = localStorage.getItem("cardgame_key");
    const rpc = new JsonRpc(url, { fetch });
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider,
        textDecoder, textEncoder });
    dataValue = { payload: dataValue}

        //make our blockchain call after setting our action
    try {
        const resultWithConfig = await api.transact({
            actions: [{
                account: process.env.REACT_APP_EOS_CONTRACT_NAME,
                name: action,
                authorization: [{
                    actor: localStorage.getItem("cardgame_account"),
                    permission: 'active',
                }],
                data: dataValue,
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });
    } catch (err) {
        throw(err)
    }

}

function postData(url = ``, data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          // "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      })
      .then(response => response.json()); // parses response to JSON
}


class ApiService{

    static getCurrentUser() {
        return new Promise((resolve, reject) => {
          if (!localStorage.getItem("cardgame_account")) {
            return reject();
          }
          takeAction("login", { username: localStorage.getItem("cardgame_account") })
            .then(() => {
              resolve(localStorage.getItem("cardgame_account"));
            })
            .catch(err => {
              localStorage.removeItem("cardgame_account");
              localStorage.removeItem("cardgame_key");
              reject(err);
            });
        });
    }

    static login({username, key}){
        return new Promise((resolve, reject) => {
            localStorage.setItem("cardgame_account", username);
            localStorage.setItem("cardgame_key", key);
            takeAction("login", { username: username })
            .then(() => {
                resolve();
            })
            .catch(err => {
                localStorage.removeItem("cardgame_account");
                localStorage.removeItem("cardgame_key");
                reject(err);
            });
        });
    }

    static startGame() {
        return takeAction("startgame",
            { username: localStorage.getItem("cardgame_account")});
    }

    static async getUserByName(username) {
        try {
          const result = await postData(`${endpoint}/v1/dsp/ipfsservice1/get_table_row`, {
              contract: process.env.REACT_APP_EOS_CONTRACT_NAME,
              scope: process.env.REACT_APP_EOS_CONTRACT_NAME,
              table: 'users',
              key: username
            });
          return result.row;
        }
        catch (err) {
          console.error(err);
        }
      }

    static playCard(cardIdx) {
        return takeAction('playcard', { username: localStorage.getItem('cardgame_account'), player_card_idx: cardIdx });
    }
    
    static nextRound() {
        return takeAction('nextround', { username: localStorage.getItem('cardgame_account') });
    }
    
    static endGame() {
        return takeAction('endgame', { username: localStorage.getItem('cardgame_account') });
    }
}

export default ApiService;