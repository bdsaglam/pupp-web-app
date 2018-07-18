import _ from "lodash";
import firebaseApp from "../fire";

import { FETCH_CONTENTS, FETCH_CONTENT } from "./types";
import { fetchVideo } from "./actions_video";

const Contents = firebaseApp.database().ref("contents");

export function fetchContents() {
    return (dispatch) => {
        Contents.once('value', snapshot => {
            // remove null, undefined, ''
            const contents = _.compact(snapshot.val());
            contents.forEach(content => {
                dispatch(fetchVideo(content.media, content.id));
            });
            dispatch({ type: FETCH_CONTENTS, payload: contents });
        });
    };
}

export function fetchContent(id) {
    return (dispatch) => {
        Contents.orderByChild("id").equalTo(id).once('child_added', snapshot => {
            const content = snapshot.val();
            dispatch(fetchVideo(content.media, content.id));
            dispatch({ type: FETCH_CONTENT, payload: content });
        });
    };
}
