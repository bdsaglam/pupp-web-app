import axios from "axios";
import { FETCH_VIDEO } from "./types";

const GOOGLE_API_ROOT_URL = 'https://www.googleapis.com/youtube/v3/videos';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export function fetchVideo(media, contentId) {
    if (media.provider === "youtube") {
        const request = requestYoutubeVideo(media.id);
        return (dispatch) => {
            request.then(response => {
                let video = response.data.items[0];
                dispatch({ type: FETCH_VIDEO, payload: video, storeKey: contentId });
            });
        };
    }
}


function requestYoutubeVideo(id) {
    const params = {
        part: 'snippet, contentDetails',
        key: GOOGLE_API_KEY,
        id: id
    };
    const request = axios.get(GOOGLE_API_ROOT_URL, { params: params });
    return request;
}