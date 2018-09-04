import axios from "axios";

const DIALOG_FLOW_API_ROOT_URL = "https://api.dialogflow.com/v1/query";
const DIALOG_FLOW_V1_TOKEN = process.env.REACT_APP_DIALOG_FLOW_V1_TOKEN;
const SESSION_ID = Math.random().toString(32).substring(2, 10);

var config = {
    headers: {
        "Authorization": "Bearer " + DIALOG_FLOW_V1_TOKEN,
        "Content-Type": "application/json"
    }
};

export async function sendText(text, intentName) {
    const query = `intent-${intentName}. ${text}`;
    var bodyParameters = {
        "v": "20150910",
        "lang": "en",
        "query": query,
        "sessionId": SESSION_ID,
    };

    const response = await axios.post(
        DIALOG_FLOW_API_ROOT_URL,
        bodyParameters,
        config
    );
    return response.data.result;
}